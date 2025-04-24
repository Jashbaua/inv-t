import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, HostListener, QueryList, ViewChildren } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../services/supabase.service';

@Component({
  selector: 'app-inv-manager',
  imports: [FormsModule, CommonModule],
  templateUrl: './inv-manager.component.html',
  styleUrls: ['./inv-manager.component.scss']
})
export class InvManagerComponent {

  // apiData = {
  //   "metadata": [
  //     {
  //       "id": 1,
  //       "created_at": "2025-01-31T17:31:52.400343+00:00",
  //       "invested_amount": 64,
  //       "updated_at": "2025-01-31T07:21:52.62+00:00",
  //       "interest_rate": 4
  //     }
  //   ],
  //   "pastActivity": [
  //     // {
  //     //   "id": 3,
  //     //   "created_at": "2025-04-21T07:21:53.595438+00:00",
  //     //   "activity": "hiwjd",
  //     //   "total_amount": 383
  //     // },
  //     // {
  //     //   "id": 2,
  //     //   "created_at": "2025-04-21T07:21:07.740901+00:00",
  //     //   "activity": "hidjd",
  //     //   "total_amount": 3283
  //     // },
  //     // {
  //     //   "id": 1,
  //     //   "created_at": "2025-04-21T07:15:32.358566+00:00",
  //     //   "activity": "hi",
  //     //   "total_amount": 64.23
  //     // }
  //   ]
  // }
  pastActivities: { created_at: any; id?: any; activity?: any; total_amount?: any; }[] = [];
  investedAmount :number = 0;
  interestRate: number = 0;
  withdrawAmount: number = 0;
  investmentAmount: number = 0;
  investmentDate: string = '';
  password: string = '';
  isMobile: boolean = false;
  showDashboard: boolean = false;
  showActivityDetails: boolean = false;
  isloggedin: boolean = false;
  updatedAt: string = '';

  @ViewChildren('activityItem') activityItems!: QueryList<ElementRef>;

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private supabaseService: SupabaseService,
  ) { }

  async ngOnInit() {
    this.checkScreenSize();
    await this.fetchData();
    if(this.interestRate>0){await this.generateActivities();}
  }

  async generateActivities() {
    const createdAt = new Date(this.investmentDate);
    const updatedAt = new Date(this.updatedAt);

    // Extract the day of the month from the created_at date
    const createdDay = createdAt.getDate();

    // Start from the updated_at date
    let currentDate = new Date(updatedAt);

    if (updatedAt.getDate()>=createdAt.getDate()) {
      currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    }

    while (currentDate <= new Date()) {
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();

      // Check if the createdDay exists in the current month
      const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
      const targetDay = createdDay <= lastDayOfMonth ? createdDay : lastDayOfMonth;

      // Push the calculated date to the activity array
      if (new Date(currentYear, currentMonth, targetDay) <= new Date()) {
        this.investedAmount=this.investedAmount+this.interestRate*this.investedAmount/100;
        await this.supabaseService.postActivity({
          metadata:{
            invested_amount:this.investedAmount,
            interest_rate:this.interestRate,
            updated_at: new Date(currentYear, currentMonth, targetDay).toISOString()
          },
          past_activity:{
            created_at: new Date(currentYear, currentMonth, targetDay).toISOString(),
            activity: `Incremented by ${this.interestRate}% interest`,
            total_amount: this.investedAmount
          }
        })
      }

      // Move to the next month
      currentDate = new Date(currentYear, currentMonth + 1, 1);
    }
    this.fetchData()
  }
  
  toggleDetails(index: number) {
    // Toggle the visibility of the clicked activity's details
    this.showActivityDetails = !this.showActivityDetails;

    this.cdr.detectChanges()

    // Scroll the clicked activity into view
    const element = this.activityItems.toArray()[index].nativeElement;
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  toggleDashboard() {
    this.showDashboard = !this.showDashboard
  }

  checkScreenSize(): void {
    this.isMobile = window.innerWidth < 768; // Adjust the breakpoint as needed
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.checkScreenSize(); // Check screen size on resize
  }

  async withdraw() {
    if (this.withdrawAmount) {
      if (this.withdrawAmount < 0) {
        this.investedAmount -= this.withdrawAmount;
        await this.supabaseService.postActivity({
          metadata:{
            invested_amount:this.investedAmount,
            interest_rate:this.interestRate,
            updated_at: new Date().toISOString()
          },
          past_activity:{
            activity: `Added ₹${-this.withdrawAmount}`,
            total_amount: this.investedAmount
          }
        })
      } else if (this.withdrawAmount <= this.investedAmount) {
        this.investedAmount -= this.withdrawAmount;
        await this.supabaseService.postActivity({
          metadata:{
            invested_amount:this.investedAmount,
            interest_rate:this.interestRate,
            updated_at: new Date().toISOString()
          },
          past_activity:{
            activity: `Withdrew ₹${this.withdrawAmount}`,
            total_amount: this.investedAmount
          }
        })
      }
      this.withdrawAmount = 0;
      this.fetchData();
    }
  }

  async invest(){
    if (this.investmentAmount && this.investmentDate && this.interestRate) {
      this.investedAmount += this.investmentAmount;
      await this.supabaseService.postActivity({
        metadata:{
          invested_amount:this.investedAmount,
          interest_rate:this.interestRate,
          updated_at: this.investmentDate,
          created_at: this.investmentDate
        },
        past_activity:{
          created_at: this.investmentDate,
          activity: `Invested ₹${this.investmentAmount} at ${this.interestRate}% interest`,
          total_amount: this.investedAmount
        }
      })

      this.investmentAmount = 0;
      this.investmentDate = '';
      await this.fetchData()
      await this.generateActivities()
    }
    else{
      alert('Invalid parameters');
    }
  }

  async confirmInterest() {
    if (this.interestRate) {
      await this.supabaseService.postActivity({
        metadata:{
          invested_amount:this.investedAmount,
          interest_rate:this.interestRate,
          updated_at: new Date().toISOString()
        },
        past_activity:{
          activity: `Changed interest rate to ${this.interestRate}%`,
          total_amount: this.investedAmount
        }
      })
      this.interestRate = 0;
      this.fetchData()
    }
  }

  formatDate(input: string): string {
    const date = new Date(input)

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  async postActivity(activity: string, total_amount: number) {
    this.supabaseService.postActivity({
      "metadata": {
        "id": 1,
        "invested_amount": this.investedAmount,
        "updated_at": new Date().toISOString(), // Date in ISO format
        "interest_rate": this.interestRate
      },
      "past_activity": {
        "activity": activity,
        "total_amount": total_amount
      }
    })
  }
  async fetchData() {
    this.isloggedin = await this.supabaseService.isLoggedIn();
    let apiData = await this.supabaseService.fetchData()
    this.pastActivities = apiData.pastActivity.map((activity: { created_at: string }) => ({
      ...activity,
      created_at: this.formatDate(activity.created_at)
    }));
    this.investedAmount = apiData?.metadata[0]?.invested_amount;
    this.interestRate = apiData?.metadata[0]?.interest_rate;
    this.investmentDate = apiData?.metadata[0]?.created_at;
    this.updatedAt = apiData?.metadata[0]?.updated_at;
    this.cdr.detectChanges();
  }

  async signIn(email: string, password: string) {
    if (await this.supabaseService.signIn(email, password)) {
      this.isloggedin = true;
      this.cdr.detectChanges();
    }
  }
}
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

  pastActivities = [
    { date: '01-04-2025', description: 'Invested $1000', totalAmount: 100000000000000},
    { date: '02-04-2025', description: 'Withdrew $200', totalAmount: 800},
    { date: '02-04-2025', description: 'Withdrew $200', totalAmount: 800},
    { date: '02-04-2025', description: 'Withdrew $200', totalAmount: 800},
    { date: '02-04-2025', description: 'Withdrew $200', totalAmount: 800},
    { date: '02-04-2025', description: 'Withdrew $200', totalAmount: 800},
    { date: '02-04-2025', description: 'Withdrew $200', totalAmount: 800},
    { date: '02-04-2025', description: 'Withdrew $200', totalAmount: 800},
    { date: '02-04-2025', description: 'Withdrew $200', totalAmount: 800},
    { date: '02-04-2025', description: 'Withdrew $200', totalAmount: 800},
    { date: '02-04-2025', description: 'Withdrew $200', totalAmount: 800},
    // Add more hardcoded activities here
  ];
  investedAmount = 0; // Hardcoded initial amount
  withdrawAmount: number = 0;
  investmentAmount: number = 0;
  investmentDate: string = '';
  interestRate: number = 0;
  isMobile: boolean = false;
  showDashboard: boolean = true;
  showActivityDetails: boolean = false;

  @ViewChildren('activityItem') activityItems! : QueryList<ElementRef>;

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private supabaseService: SupabaseService,
  ) {}

  ngOnInit(): void {
    this.fetchPastActivities();
    this.checkScreenSize();
  }

  toggleDetails(index:number) {
    // Toggle the visibility of the clicked activity's details
    this.showActivityDetails= !this.showActivityDetails;

    this.cdr.detectChanges()

    // Scroll the clicked activity into view
    const element=this.activityItems.toArray()[index].nativeElement;
    element.scrollIntoView({ behavior: 'smooth',block:'center'});
  }

  toggleDashboard(){
    this.showDashboard=!this.showDashboard
  }

  checkScreenSize(): void {
    this.isMobile = window.innerWidth < 768; // Adjust the breakpoint as needed
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.checkScreenSize(); // Check screen size on resize
  }

  withdraw(): void {
    if (this.withdrawAmount) {
      if (this.withdrawAmount < 0) {
        this.investedAmount -= this.withdrawAmount; 
        this.pastActivities.push({ 
          date: this.formatDate(new Date()), 
          description: `Added $${-this.withdrawAmount}`, 
          totalAmount: -this.withdrawAmount ,

        });
      } else if (this.withdrawAmount <= this.investedAmount) {
        this.investedAmount -= this.withdrawAmount;
        this.pastActivities.push({ 
          date: this.formatDate(new Date()), 
          description: `Withdrew $${this.withdrawAmount}`, 
          totalAmount: -this.withdrawAmount,

        });
      }
      this.withdrawAmount = 0;
    }
  }

  invest(): void {
    if (this.investmentAmount && this.investmentDate) {
      this.investedAmount += this.investmentAmount;
      this.pastActivities.push({ 
        date: this.formatDate(new Date(this.investmentDate)), 
        description: `Invested $${this.investmentAmount}`, 
        totalAmount: this.investmentAmount ,
      });
      this.investmentAmount = 0;
      this.investmentDate = '';
    }
  }

  confirmInterest(): void {
    if (this.interestRate) {
      this.pastActivities.push({ 
        date: this.formatDate(new Date()), 
        description: `Set interest rate to ${this.interestRate}%`, 
        totalAmount: 0, // Assuming no amount change for interest rate setting
      });
      this.interestRate = 0;
    }
  }

  formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  async fetchPastActivities() {
    console.log(await this.supabaseService.fetchData())
  }
}
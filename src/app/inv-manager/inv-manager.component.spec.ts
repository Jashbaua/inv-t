import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvManagerComponent } from './inv-manager.component';

describe('InvManagerComponent', () => {
  let component: InvManagerComponent;
  let fixture: ComponentFixture<InvManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvManagerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

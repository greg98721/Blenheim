import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MakeBookingComponent } from './make-booking.component';

describe('MakeBookingComponent', () => {
  let component: MakeBookingComponent;
  let fixture: ComponentFixture<MakeBookingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MakeBookingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MakeBookingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

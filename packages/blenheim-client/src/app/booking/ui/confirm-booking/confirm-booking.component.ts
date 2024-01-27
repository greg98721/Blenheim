import { Component, Input } from '@angular/core';
import { BookingState } from '../../model/booking-state';

@Component({
  selector: 'app-confirm-booking',
  standalone: true,
  imports: [],
  templateUrl: './confirm-booking.component.html',
  styleUrl: './confirm-booking.component.scss'
})
export class ConfirmBookingComponent {
  @Input() set bookingState(state: BookingState) {
  }

}

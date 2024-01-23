import { Component, Input } from '@angular/core';
import { BookingState } from '../../model/booking-state';

@Component({
  selector: 'app-finalise-return',
  standalone: true,
  imports: [],
  templateUrl: './finalise-return.component.html',
  styleUrl: './finalise-return.component.scss'
})
export class FinaliseReturnComponent {

  @Input() set bookingState(state: BookingState) {
  }

}

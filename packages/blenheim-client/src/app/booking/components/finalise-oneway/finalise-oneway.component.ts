import { Component, Input } from '@angular/core';
import { BookingState } from '../../model/booking-state';

@Component({
  selector: 'app-finalise-oneway',
  standalone: true,
  imports: [],
  templateUrl: './finalise-oneway.component.html',
  styleUrl: './finalise-oneway.component.scss'
})
export class FinaliseOnewayComponent {

  @Input() set bookingState(state: BookingState) {
  }
}

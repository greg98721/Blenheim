import { Component, EventEmitter, Output, computed, input } from '@angular/core';

import { BookingState } from '../../model/booking-state';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-confirm-booking',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './confirm-booking.component.html',
  styleUrl: './confirm-booking.component.scss'
})
export class ConfirmBookingComponent {
  bookingState = input.required<BookingState>();

  totalPrice = computed<number>(() => {
    const state = this.bookingState();  // need to assign the value of the signal to a variable to allow the compiler to infer the type
    if (state.kind == 'one_way_booking_complete') {
      return state.booking.details.tickets.reduce((acc, ticket) => acc + ticket.price, 0);
    } else if (state.kind == 'return_booking_complete') {
        const outboundCost = state.booking.outboundDetails.tickets.reduce((acc, ticket) => acc + ticket.price, 0);
        const returnCost = state.booking.returnDetails.tickets.reduce((acc, ticket) => acc + ticket.price, 0);
        return outboundCost + returnCost;
    } else {
      return 0;
    }
  });

  confirmBooking() {
    this.bookingConfirmed.emit(true);
  }

  cancelBooking() {
    this.bookingConfirmed.emit(false);
  }

  @Output() bookingConfirmed = new EventEmitter<boolean>();

}

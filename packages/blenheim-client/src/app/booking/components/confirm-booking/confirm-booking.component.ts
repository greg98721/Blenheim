import { Component, EventEmitter, Input, Output, computed, signal } from '@angular/core';

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

  private _bookingState = signal<BookingState>({ kind: 'undefined' });

  @Input() set bookingState(state: BookingState) {
    if (state.kind == 'one_way_booking_complete' || state.kind == 'return_booking_complete') {
      this._bookingState.set(state);
    } else {
      throw Error(`Invalid state ${state.kind} for ConfirmBookingComponent`)
    }
  }

  totalPrice = computed<number>(() => {
    const state = this._bookingState();
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

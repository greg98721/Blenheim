import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';

import { BookingState } from '../../model/booking-state';
import { Flight, Passenger, TicketType, TimetableFlight } from '@blenheim/model';
import { CityNamePipe } from '../../../shared/pipes/city-name.pipe';
import { MinutePipe } from '../../../shared/pipes/minute.pipe';

type FareState = 'booked out' | 'available' | 'selected' | 'default';
@Component({
  selector: 'app-add-passengers',
  standalone: true,
  imports: [CommonModule, CityNamePipe, MinutePipe, MatIconModule, MatRippleModule],
  templateUrl: './add-passengers.component.html',
  styleUrl: './add-passengers.component.scss'
})
export class AddPassengersComponent {

  private _bookingState?: BookingState;
  showReturn = signal(false);
  outboundTimetableFlight = signal<TimetableFlight | undefined>(undefined);
  outboundFlight = signal<Flight | undefined>(undefined);
  returnTimetableFlight = signal<TimetableFlight | undefined>(undefined);
  returnFlight = signal<Flight | undefined>(undefined);
  outboundFullFareState = signal<FareState>('available');
  returnFullFareState = signal<FareState>('available');
  outboundDiscountFareState = signal<FareState>('available');
  returnDiscountFareState = signal<FareState>('available');

  @Input() set bookingState(state: BookingState) {
    this._bookingState = state;
    if (state.kind == 'one_way_flights' || state.kind == 'return_flights') {
      this.outboundTimetableFlight.set(state.outboundTimetableFlight);
      this.outboundFlight.set(state.outboundFlight);
      if (state.outboundFlight.emptyDiscountSeats == 0) {
        this.outboundDiscountFareState.set('booked out');
        this.outboundFullFareState.set('default');
      } else {
        this.outboundDiscountFareState.set('available');
        this.outboundFullFareState.set('selected');
      }
    }
    if (state.kind == 'one_way_flights') {
      this.showReturn.set(false);
    } else if (state.kind == 'return_flights') {
      this.showReturn.set(true);
      this.returnTimetableFlight.set(state.returnTimetableFlight);
      this.returnFlight.set(state.returnFlight);
      if (state.returnFlight.emptyDiscountSeats == 0) {
        this.returnDiscountFareState.set('booked out');
        this.returnFullFareState.set('default');
      } else {
        this.returnDiscountFareState.set('available');
        this.returnFullFareState.set('selected');
      }
    } else {
      throw Error(`Invalid state ${state.kind} for AddPassengersComponent`)
    }
  }

  selectOutboundFareType($event: string) {
    if (this._bookingState?.kind == 'one_way_flights' || this._bookingState?.kind == 'return_flights') {
      if ($event == 'discount' && this.outboundDiscountFareState() == 'available') {
        this.outboundFullFareState.set('available');
        this.outboundDiscountFareState.set('selected');
      } else if ($event == 'fullFare' && this.outboundFullFareState() == 'available') {
        this.outboundFullFareState.set('selected');
        this.outboundDiscountFareState.set('available');
      }
    }
  }

  selectReturnFareType($event: string) {
    if (this._bookingState?.kind == 'return_flights') {
      if ($event == 'discount' && this.returnDiscountFareState() == 'available') {
        this.returnFullFareState.set('available');
        this.returnDiscountFareState.set('selected');
      } else if ($event == 'fullFare' && this.returnFullFareState() == 'available') {
        this.returnFullFareState.set('selected');
        this.returnDiscountFareState.set('available');
      }
    }
  }

  @Output() passengersAdded = new EventEmitter<{ outboundTicketType: TicketType, returnTicketType: TicketType | undefined, passengers: Passenger[] }>();
}

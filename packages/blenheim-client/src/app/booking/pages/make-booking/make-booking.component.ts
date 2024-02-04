import { CommonModule } from '@angular/common';
import { Component, Input, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { formatISOWithOptions } from 'date-fns/fp';

import { AirRoute, Airport, Flight, Passenger, TicketType } from '@blenheim/model';
import { ChooseOriginComponent } from '../../components/choose-origin/choose-origin.component';
import { ChooseDestinationComponent } from '../../components/choose-destination/choose-destination.component';
import { ChooseDateComponent } from '../../components/choose-date/choose-date.component';
import { ChooseReturnComponent } from '../../components/choose-return/choose-return.component';
import { ChooseFlightComponent } from '../../components/choose-flight/choose-flight.component';
import { BookingState, createOneWayBooking, addDate, addDestination, addOrigin, addReturnDate, oneWayOnly, requestReturnFlight, selectOutboundFlight, selectReturnFlight, startBooking, createReturnBooking } from '../../model/booking-state';
import { FlightService } from '../../../timetable/services/flight.service';
import { AddPassengersComponent } from '../../components/add-passengers/add-passengers.component';
import { UserService } from '../../../user/services/user.service';
import { ConfirmBookingComponent } from '../../components/confirm-booking/confirm-booking.component';

@Component({
  selector: 'app-make-booking',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ChooseOriginComponent,
    ChooseDestinationComponent,
    ChooseDateComponent,
    ChooseFlightComponent,
    ChooseReturnComponent,
    AddPassengersComponent,
    ConfirmBookingComponent
  ],
  templateUrl: './make-booking.component.html',
  styleUrl: './make-booking.component.scss'
})
export class MakeBookingComponent {

  private _bookingStateStack: BookingState[] = [];
  private _currentStackIndex = 0;

  private _flightService = inject(FlightService);
  private _userService = inject(UserService);
  private _router = inject(Router);
  private _route = inject(ActivatedRoute);

  bookingState = signal<BookingState>({ kind: 'undefined' });

  /** We can use routing to provide a way of going forwards and backwards through the booking process, include an index in the route into the _bookingStateStack */
  @Input() set stateIndex(i: number) {
    if (i == 0 && this._bookingStateStack.length == 0) {
      // We're starting from scratch
      // if the origin is set in the query params we start from the second step
      const o = this._route.snapshot.queryParams['origin'];
      if (o !== undefined) {
        const origin = o as Airport;
        this._flightService.getDestinations$(origin).subscribe(destinationRoutes => {
          const newState = addOrigin(undefined, origin, destinationRoutes);
          this._bookingStateStack.push(newState);
          this._currentStackIndex = 0;
          this.bookingState.set(this._bookingStateStack[0]);
        });
      } else {
        // otherwise we need to show the first step
        this._flightService.getOrigins$().subscribe(origins => {
          const newState = startBooking(origins);
          this._bookingStateStack.push(newState);
          this._currentStackIndex = 0;
          this.bookingState.set(this._bookingStateStack[0]);
        });
      }
    } else if (i >= 0 && i < this._bookingStateStack.length) {
      // we are moving to a state that already exists - could be at top of the stack or older
      this._currentStackIndex = i;
      this.bookingState.set(this._currentState());
    } else if (i >= 0 && i >= this._bookingStateStack.length) {
      // we are moving to a state that doesn't exist yet, we need to navigate to the last state in the stack
      if (this._bookingStateStack.length > 0) {
        this._router.navigate([`../${this._bookingStateStack.length - 1}`], { relativeTo: this._route });
      } else {
        // if there are no states in the stack we need to start from scratch
        this._router.navigate(['../0'], { relativeTo: this._route });
      }
    } else {
      throw new Error(`Invalid state index ${i}`);
    }
  }

  selectOrigin(origin: Airport) {
    this._flightService.getDestinations$(origin).subscribe(destinationRoutes => {
      const newState: BookingState = addOrigin((this._currentState()), origin, destinationRoutes);
      this._updateStateStack(newState);
    });
  }

  selectDestination(destination: AirRoute) {
    const newState: BookingState = addDestination((this._currentState()), destination);
    this._updateStateStack(newState);
  }

  selectDate(date: Date) {
    const datestring = formatISOWithOptions({ representation: 'date' }, date);
    const state = (this._currentState());
    if (state.kind === 'destination') {
      this._flightService.getFlights$(state.route.origin, state.route.destination).subscribe(flights => {
        const newState = addDate(state, datestring, flights);
        this._updateStateStack(newState);
      });
    } else {
      throw new Error(`Cannot set the nominal_date state from ${state.kind}`);
    }
  }

  selectFlight(flight: Flight) {
    const state = (this._currentState());
    if (state.kind === 'nominal_date') {
      const timetableFlight = state.timetableFlights.find(t => t.timetableFlight.flightNumber === flight.flightNumber)?.timetableFlight;
      if (timetableFlight) {
        const newState = selectOutboundFlight(state, timetableFlight, flight);
        this._updateStateStack(newState);
      } else {
        throw new Error(`Cannot find timetable flight for flight ${flight.flightNumber}`);
      }
    } else {
      throw new Error(`Cannot set the outbound_flight state from ${state.kind}`);
    }
  }

  selectOneWay() {
    this._updateStateStack(oneWayOnly(this._currentState()));
  }

  selectReturn() {
    this._updateStateStack(requestReturnFlight(this._currentState()));
  }

  selectReturnDate(date: Date) {
    const datestring = formatISOWithOptions({ representation: 'date' }, date);
    const state = (this._currentState());
    if (state.kind === 'return_flight_requested') {
      this._flightService.getFlights$(state.returnRoute.origin, state.returnRoute.destination).subscribe(flights => {
        const newState = addReturnDate(state, datestring, flights);
        this._updateStateStack(newState);
      });
    } else {
      throw new Error(`Cannot set the return_date state from ${state.kind}`);
    }
  }

  selectReturnFlight(flight: Flight) {
    const state = (this._currentState());
    if (state.kind === 'nominal_return_date') {
      const returnTimetableFlight = state.timetableReturnFlights.find(t => t.timetableFlight.flightNumber === flight.flightNumber)?.timetableFlight;
      if (returnTimetableFlight) {
        const newState = selectReturnFlight(state, returnTimetableFlight, flight);
        this._updateStateStack(newState);
      } else {
        throw new Error(`Cannot find timetable flight for flight ${flight.flightNumber}`);
      }
    } else {
      throw new Error(`Cannot set the return_flight state from ${state.kind}`);
    }
  }

  selectPassengers(details: {outboundTicketType: TicketType, returnTicketType: TicketType | undefined, passengers: Passenger[]}) {
    const state = (this._currentState());
    const username = this._userService.currentUser()?.username;
    if (state.kind === 'one_way_flights' && username !== undefined) {
      const newState = createOneWayBooking(state, details.outboundTicketType, details.passengers, username);
      this._updateStateStack(newState);
    } else if (state.kind === 'return_flights' && username !== undefined && details.returnTicketType !== undefined) {
      const newState = createReturnBooking(state, details.outboundTicketType, details.returnTicketType, details.passengers, username);
      this._updateStateStack(newState);
    } else {
      throw new Error(`Cannot set the return_flight state from ${state.kind}`);
    }
  }

  private _updateStateStack(newState: BookingState) {
    // first we will update the stack with the new state

    if (this._currentStackIndex < this._bookingStateStack.length - 1) {
      // remove the states after the insert point as the update will have invalidated them
      const newStack = this._bookingStateStack.slice(0, this._currentStackIndex + 1);
      // push the new state on the top of the stack
      newStack.push(newState);
      this._bookingStateStack = newStack;
    } else {
      // just push the new state on the top of the stack
      this._bookingStateStack.push(newState);
    }
    // now the stack is set we want to navigate to the new state, so we get to use the browser history to go forwards and backwards
    this._router.navigate([`../${this._bookingStateStack.length - 1}`], { relativeTo: this._route });
  }

  private _currentState(): BookingState {
    return this._bookingStateStack[this._currentStackIndex];
  };
}

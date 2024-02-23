import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, computed, inject, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { CityNamePipe } from '../../../shared/pipes/city-name.pipe';
import { MinutePipe } from '../../../shared/pipes/minute.pipe';
import { BookingState } from '../../model/booking-state';
import { AirRoute, Flight, TimetableFlight, minPrice, seatsAvailable } from '@blenheim/model';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FlightService } from '../../../timetable/services/flight.service';
import { switchMap, combineLatest } from 'rxjs';

@Component({
  selector: 'app-choose-flight',
  standalone: true,
  imports: [CommonModule, MatIconModule, CityNamePipe, MinutePipe],
  templateUrl: './choose-flight.component.html',
  styleUrl: './choose-flight.component.scss'
})
export class ChooseFlightComponent {
  private _flightService = inject(FlightService);
  bookingState = input.required<BookingState>();

  route = computed<AirRoute>(() => {
    const state = this.bookingState();  // need to assign the value of the signal to a variable to allow the compiler to infer the type
    if (state.kind === 'nominal_date') {
      return state.route;
    } else if (state.kind === 'nominal_return_date') {
      return state.returnRoute;
    } else {
      throw Error('Invalid state for ChooseFlightComponent')
    }
  });

  dayRange = computed<Date[]>(() => {
    const state = this.bookingState();
    if (state.kind === 'nominal_date' || state.kind === 'nominal_return_date') {
      return state.dayRange;
    } else {
      throw Error('Invalid state for ChooseFlightComponent')
    }
  });

  nominalDate = computed<number>(() => {
    const state = this.bookingState();
    if (state.kind === 'nominal_date') {
      return state.nominalDate;
    } else if (state.kind === 'nominal_return_date') {
      return state.nominalReturnDate;
    } else {
      throw Error('Invalid state for ChooseFlightComponent')
    }
  });

  // see choose-destination.component.ts for an explanation of why we use toObservable and switchMap
  readonly timetableFlights = toSignal(toObservable(this.route).pipe(
    switchMap(r => this._flightService.getFlights$(r.origin, r.destination)),
  ), { initialValue: [] });


  @Output() flightSelected = new EventEmitter<Flight>();

  selectFlight(flight: Flight) {
    this.flightSelected.emit(flight);
  }

  // local alias's for the imported functions
  _seatsAvailable = seatsAvailable
  _minPrice = minPrice;

  numberOfCheapestSeats(flight: Flight): number {
    return flight.emptyDiscountSeats > 0 ? flight.emptyDiscountSeats : flight.emptyFullPriceSeats;
  }
}

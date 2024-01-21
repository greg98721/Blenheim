import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon'

import { CityNamePipe } from '../../../shared/pipes/city-name.pipe';
import { MinutePipe } from '../../../shared/pipes/minute.pipe';
import { BookingState } from '../../model/booking-state';
import { AirRoute, Flight, TimetableFlight, minPrice, seatsAvailable } from '@blenheim/model';

@Component({
  selector: 'app-choose-flight',
  standalone: true,
  imports: [CommonModule, MatIconModule, CityNamePipe, MinutePipe],
  templateUrl: './choose-flight.component.html',
  styleUrl: './choose-flight.component.scss'
})
export class ChooseFlightComponent {

  route = signal<AirRoute | undefined>(undefined);
  dayRange = signal<Date[]>([]);
  nominalDate = signal<number | undefined>(undefined);
  timetableFlights = signal<{ timetableFlight: TimetableFlight, flights: Flight[] }[]>([]);

  @Input() set bookingState(state: BookingState) {
    if (state.kind === 'nominal_date') {
        this.route.set(state.route);
        this.dayRange.set(state.dayRange);
        this.nominalDate.set(state.nominalDate);
        this.timetableFlights.set(state.timetableFlights);
    } else if (state.kind === 'nominal_return_date') {
        this.route.set(state.returnRoute);
        this.dayRange.set(state.dayRange);
        this.nominalDate.set(state.nominalReturnDate);
        this.timetableFlights.set(state.timetableReturnFlights);
    } else {
      throw Error('Invalid state for ChooseOriginComponent')
    }
  }

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

import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, computed, input } from '@angular/core';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';

import { AirRoute } from '@blenheim/model';
import { CityNamePipe } from '../../../shared/pipes/city-name.pipe';
import { BookingState } from '../../model/booking-state';

@Component({
  selector: 'app-choose-date',
  standalone: true,
  imports: [CommonModule, MatNativeDateModule, MatDatepickerModule, CityNamePipe],
  templateUrl: './choose-date.component.html',
  styleUrl: './choose-date.component.scss'
})
export class ChooseDateComponent {
  bookingState = input.required<BookingState>();

  route = computed<AirRoute>(() => {
    const state = this.bookingState();  // need to assign the value of the signal to a variable to allow the compiler to infer the type
    if (state.kind === 'destination') {
      return state.route;
    } else if (state.kind === 'return_flight_requested') {
      return state.returnRoute;
    } else {
      throw Error('Invalid state for ChooseDateComponent')
    }
  });

  earliest = computed<Date>(() => {
    const state = this.bookingState();
    if (state.kind === 'destination' || state.kind === 'return_flight_requested') {
      return state.earliest;
    } else {
      throw Error('Invalid state for ChooseDateComponent')
    }
  });

  latest = computed<Date>(() => {
    const state = this.bookingState();
    if (state.kind === 'destination' || state.kind === 'return_flight_requested') {
      return state.latest;
    } else {
      throw Error('Invalid state for ChooseDateComponent')
    }
  });

  @Output() dateSelected = new EventEmitter<Date>();

  selectDate(date: Date) {
    this.dateSelected.emit(date);
  }

}

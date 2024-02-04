import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
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

  route = signal<AirRoute | undefined>(undefined);
  earliest = signal<Date | undefined>(undefined);
  latest = signal<Date | undefined>(undefined);

  @Input() set bookingState(state: BookingState) {
    if (state.kind === 'destination') {
      this.route.set(state.route);
      this.earliest.set(state.earliest);
      this.latest.set(state.latest);
    } else if (state.kind === 'return_flight_requested') {
      this.route.set(state.returnRoute);
      this.earliest.set(state.earliest);
      this.latest.set(state.latest);
    } else {
      throw Error('Invalid state for ChooseDateComponent')
    }
  }

  @Output() dateSelected = new EventEmitter<Date>();

  selectDate(date: Date) {
    this.dateSelected.emit(date);
  }

}

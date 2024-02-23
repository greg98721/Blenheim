import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, computed, inject, input } from '@angular/core';
import { Airport } from '@blenheim/model';
import { CityNamePipe } from '../../../shared/pipes/city-name.pipe';
import { BookingState } from '../../model/booking-state';
import { FlightService } from '../../../timetable/services/flight.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-choose-origin',
  standalone: true,
  imports: [CommonModule, CityNamePipe],
  templateUrl: './choose-origin.component.html',
  styleUrl: './choose-origin.component.scss'
})
export class ChooseOriginComponent {

  private _flightService = inject(FlightService);
  bookingState = input.required<BookingState>();

  origins = toSignal(this._flightService.getOrigins$(),{ initialValue: [] });

  @Output() originSelected = new EventEmitter<Airport>();

  selectOrigin(origin: Airport) {
    this.originSelected.emit(origin);
  }
}

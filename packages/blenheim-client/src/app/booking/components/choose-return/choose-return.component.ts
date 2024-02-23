import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, computed, input } from '@angular/core';
import { CityNamePipe } from '../../../shared/pipes/city-name.pipe';
import { BookingState } from '../../model/booking-state';
import { Airport } from '@blenheim/model';

@Component({
  selector: 'app-choose-return',
  standalone: true,
  imports: [CommonModule, CityNamePipe],
  templateUrl: './choose-return.component.html',
  styleUrl: './choose-return.component.scss'
})
export class ChooseReturnComponent {
  bookingState = input.required<BookingState>();

  origin = computed<Airport>(() => {
    const state = this.bookingState();  // need to assign the value of the signal to a variable to allow the compiler to infer the type
    if (state.kind === 'outbound_flight') {
      return state.outboundTimetableFlight.route.origin;
    } else {
      throw Error('Invalid state for ChooseReturnComponent')
    }
  });

  @Output() oneWaySelected = new EventEmitter();
  selectOneWay() {
    this.oneWaySelected.emit();
  }

  @Output() returnSelected = new EventEmitter();
  selectReturn() {
    this.returnSelected.emit();
  }
}

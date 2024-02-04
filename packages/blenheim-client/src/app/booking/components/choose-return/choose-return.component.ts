import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
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

  origin = signal<Airport | undefined>(undefined);

  @Input() set bookingState(state: BookingState) {
    if (state.kind === 'outbound_flight') {
      this.origin.set(state.outboundTimetableFlight.route.origin);
    } else {
      throw Error('Invalid state for ChooseReturnComponent')
    }
  }

  @Output() oneWaySelected = new EventEmitter();
  selectOneWay() {
    this.oneWaySelected.emit();
  }

  @Output() returnSelected = new EventEmitter();
  selectReturn() {
    this.returnSelected.emit();
  }
}

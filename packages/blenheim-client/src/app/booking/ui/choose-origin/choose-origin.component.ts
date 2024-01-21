import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { Airport } from '@blenheim/model';
import { CityNamePipe } from '../../../shared/pipes/city-name.pipe';
import { BookingState } from '../../model/booking-state';

@Component({
  selector: 'app-choose-origin',
  standalone: true,
  imports: [CommonModule, CityNamePipe],
  templateUrl: './choose-origin.component.html',
  styleUrl: './choose-origin.component.scss'
})
export class ChooseOriginComponent {
  origins = signal<Airport[]>([]);

  @Input() set bookingState(state: BookingState) {
    if (state.kind === 'start') {
      this.origins.set(state.origins);
    } else {
      throw Error('Invalid state for ChooseOriginComponent')
    }
  }

  @Output() originSelected = new EventEmitter<Airport>();

  selectOrigin(origin: Airport) {
    this.originSelected.emit(origin);
  }
}

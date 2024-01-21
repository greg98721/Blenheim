import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CityNamePipe } from '../../../shared/pipes/city-name.pipe';
import { BookingState } from '../../model/booking-state';
import { AirRoute, Airport } from '@blenheim/model';

@Component({
  selector: 'app-choose-destination',
  standalone: true,
  imports: [CommonModule, CityNamePipe],
  templateUrl: './choose-destination.component.html',
  styleUrl: './choose-destination.component.scss'
})
export class ChooseDestinationComponent {

  origin = signal<Airport | undefined>(undefined);
  destinationRoutes = signal<AirRoute[]>([]);

  @Input() set bookingState(state: BookingState) {
    if (state.kind === 'origin') {
      this.origin.set(state.origin);
      this.destinationRoutes.set(state.destinationRoutes);
    } else {
      throw Error('Invalid state for ChooseDestinationComponent')
    }
  }

  @Output() destinationSelected = new EventEmitter<AirRoute>();

  chooseDestination(route: AirRoute) {
    this.destinationSelected.emit(route);
  }
}

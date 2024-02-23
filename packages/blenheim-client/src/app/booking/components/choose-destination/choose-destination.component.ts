import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, computed, inject, input, signal, effect } from '@angular/core';
import { CityNamePipe } from '../../../shared/pipes/city-name.pipe';
import { BookingState } from '../../model/booking-state';
import { AirRoute, Airport } from '@blenheim/model';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FlightService } from '../../../timetable/services/flight.service';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-choose-destination',
  standalone: true,
  imports: [CommonModule, CityNamePipe],
  templateUrl: './choose-destination.component.html',
  styleUrl: './choose-destination.component.scss'
})
export class ChooseDestinationComponent {

  private _flightService = inject(FlightService);
  bookingState = input.required<BookingState>();

  origin = computed<Airport>(() => {
    const state = this.bookingState();  // need to assign the value of the signal to a variable to allow the compiler to infer the type
    if (state.kind === 'origin') {
      return state.origin;
    } else {
      throw Error('Invalid state for ChooseDestinationComponent')
    }
  });

  // the following will cause problems as toSignal will be evaluated before bookingState is set, and therefore will cause the origin to be computed without the state
  // destinationRoutes = toSignal(this._flightService.getDestinations$(this.origin()),{ initialValue: [] });
  // the solution is to use turn the origin signal into an observable and use switchMap to get the destinationRoutes
  // ugly but until the compiler can handle this better it will have to do
  readonly destinationRoutes = toSignal(toObservable(this.origin).pipe(
    switchMap(o => this._flightService.getDestinations$(o)),
  ), { initialValue: [] });

  @Output() destinationSelected = new EventEmitter<AirRoute>();

  chooseDestination(route: AirRoute) {
    this.destinationSelected.emit(route);
  }
}

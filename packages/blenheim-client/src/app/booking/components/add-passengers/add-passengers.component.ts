import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingState } from '../../model/booking-state';
import { Flight, Passenger, TicketType, TimetableFlight } from '@blenheim/model';
import { CityNamePipe } from '../../../shared/pipes/city-name.pipe';
import { MinutePipe } from '../../../shared/pipes/minute.pipe';

@Component({
  selector: 'app-add-passengers',
  standalone: true,
  imports: [CommonModule, CityNamePipe, MinutePipe],
  templateUrl: './add-passengers.component.html',
  styleUrl: './add-passengers.component.scss'
})
export class AddPassengersComponent {

  showReturn = signal(false);
  outboundTimetableFlight = signal<TimetableFlight | undefined>(undefined);
  outboundFlight = signal<Flight | undefined>(undefined);
  returnTimetableFlight = signal<TimetableFlight | undefined>(undefined);
  returnFlight = signal<Flight | undefined>(undefined);

  @Input() set bookingState(state: BookingState) {
    if (state.kind == 'one_way_flights') {
      this.showReturn.set(false);
      this.outboundTimetableFlight.set(state.outboundTimetableFlight);
      this.outboundFlight.set(state.outboundFlight);
    } else if (state.kind == 'return_flights') {
      this.showReturn.set(true);
      this.outboundTimetableFlight.set(state.outboundTimetableFlight);
      this.outboundFlight.set(state.outboundFlight);
      this.returnTimetableFlight.set(state.returnTimetableFlight);
      this.returnFlight.set(state.returnFlight);
    } else {
      throw Error(`Invalid state ${state.kind} for AddPassengersComponent`)
    }
  }

  @Output() passengersAdded = new EventEmitter<{ outboundTicketType: TicketType, returnTicketType: TicketType | undefined, passengers: Passenger[] }>();
}

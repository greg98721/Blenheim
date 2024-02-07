import { Component, EventEmitter, Input, Output, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';

import { BookingState } from '../../model/booking-state';
import { Flight, Passenger, FareType, TimetableFlight } from '@blenheim/model';
import { CityNamePipe } from '../../../shared/pipes/city-name.pipe';
import { MinutePipe } from '../../../shared/pipes/minute.pipe';
import { FormBuilder, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

type FareState = 'booked out' | 'available' | 'selected' | 'default';
@Component({
  selector: 'app-add-passengers',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CityNamePipe, MinutePipe, MatIconModule, MatRippleModule, MatFormFieldModule, MatRadioModule, MatInputModule, MatButtonModule, MatTooltipModule ],
  templateUrl: './add-passengers.component.html',
  styleUrl: './add-passengers.component.scss'
})
export class AddPassengersComponent {

  private _bookingState = signal<BookingState>({ kind: 'undefined' });

  showReturn = computed<boolean>(() => this._bookingState().kind == 'return_flights');

  // these are used for the flight summary
  outboundTimetableFlight = computed<TimetableFlight | undefined>(() => {
    const state = this._bookingState();
    if (state.kind == 'one_way_flights' || state.kind == 'return_flights') {
      return state.outboundTimetableFlight;
    } else {
      return undefined;
    }
  });

  outboundFlight = computed<Flight | undefined>(() => {
    const state = this._bookingState();
    if (state.kind == 'one_way_flights' || state.kind == 'return_flights') {
      return state.outboundFlight;
    } else {
      return undefined;
    }
  });

  returnTimetableFlight = computed<TimetableFlight | undefined>(() => {
    const state = this._bookingState();
    if (state.kind == 'return_flights') {
      return state.returnTimetableFlight;
    } else {
      return undefined;
    }
  });

  returnFlight = computed<Flight | undefined>(() => {
    const state = this._bookingState();
    if (state.kind == 'return_flights') {
      return state.returnFlight;
    } else {
      return undefined;
    }
  });

  // these are used to set the buttons
  outboundFullFareState = signal<FareState>('selected');
  returnFullFareState = signal<FareState>('selected');
  outboundDiscountFareState = signal<FareState>('available');
  returnDiscountFareState = signal<FareState>('available');

  outboundFareType = computed<FareType>(() => {
    return (this.outboundFullFareState() == 'selected' || this.outboundFullFareState() == 'default') ? 'full' : 'discount';
  });

  returnFareType = computed<FareType>(() => {
    return (this.returnFullFareState() == 'selected' || this.returnFullFareState() == 'default') ? 'full' : 'discount';
  });

  private _fb = inject(FormBuilder);

  private _passengerSubform() {
    return this._fb.nonNullable.group({
      firstName: ['', Validators.required],
      surname: ['', Validators.required],
      passengerType: ['adult'],
    });
  }

  passengersForm = this._fb.nonNullable.group({
    passengers: this._fb.array([this._passengerSubform()])
  });

  get passengers() {
    return this.passengersForm.get('passengers') as FormArray;
  }

  addPassenger() {
    this.passengers.push(this._passengerSubform());
  }

  removePassenger(index: number) {
    this.passengers.removeAt(index);
  }

  @Input() set bookingState(state: BookingState) {
    if (state.kind == 'one_way_flights' || state.kind == 'return_flights') {
      this._bookingState.set(state);
      if (state.outboundFlight.emptyDiscountSeats == 0) {
        this.outboundFullFareState.set('default');
        this.outboundDiscountFareState.set('booked out');
      } else {
        this.outboundFullFareState.set('selected');
        this.outboundDiscountFareState.set('available');
      }
      if (state.kind == 'one_way_flights') {
      } else if (state.kind == 'return_flights') {
        if (state.returnFlight.emptyDiscountSeats == 0) {
          this.returnFullFareState.set('default');
          this.returnDiscountFareState.set('booked out');
        } else {
          this.returnFullFareState.set('selected');
          this.returnDiscountFareState.set('available');
        }
      }
    } else {
      throw Error(`Invalid state ${state.kind} for AddPassengersComponent`)
    }
  }

  selectOutboundFareType($event: FareType) {
    if ($event == 'discount' && this.outboundDiscountFareState() == 'available') {
      this.outboundFullFareState.set('available');
      this.outboundDiscountFareState.set('selected');
    } else if ($event == 'full' && this.outboundFullFareState() == 'available') {
      this.outboundFullFareState.set('selected');
      this.outboundDiscountFareState.set('available');
    }
  }

  selectReturnFareType($event: FareType) {
    if ($event == 'discount' && this.returnDiscountFareState() == 'available') {
      this.returnFullFareState.set('available');
      this.returnDiscountFareState.set('selected');
    } else if ($event == 'full' && this.returnFullFareState() == 'available') {
      this.returnFullFareState.set('selected');
      this.returnDiscountFareState.set('available');
    }
  }

  submit() {
    const passengers = this.passengersForm.value as Passenger[];
    const outboundFareType: FareType = (this.outboundFullFareState() == 'selected' || this.outboundFullFareState() == 'default') ? 'full' : 'discount';
    const returnFareType: FareType = (this.returnFullFareState() == 'selected' || this.returnFullFareState() == 'default') ? 'full' : 'discount';
    // it does not matter if the return flight is not shown, the return ticket type will be ignored in that case
    this.passengersAdded.emit({ outboundFareType, returnFareType, passengers });
  }

  @Output() passengersAdded = new EventEmitter<{ outboundFareType: FareType, returnFareType: FareType, passengers: Passenger[] }>();
}

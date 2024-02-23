import { Component, EventEmitter, Output, computed, effect, inject, input, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';

import { BookingState, calcPrice } from '../../model/booking-state';
import { Flight, Passenger, FareType, TimetableFlight } from '@blenheim/model';
import { CityNamePipe } from '../../../shared/pipes/city-name.pipe';
import { MinutePipe } from '../../../shared/pipes/minute.pipe';
import { FormBuilder, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UserService } from '../../../user/services/user.service';

type FareState = 'booked out' | 'available' | 'selected' | 'default';
@Component({
  selector: 'app-add-passengers',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CityNamePipe, MinutePipe, MatIconModule, MatRippleModule, MatFormFieldModule, MatRadioModule, MatInputModule, MatButtonModule, MatTooltipModule],
  templateUrl: './add-passengers.component.html',
  styleUrl: './add-passengers.component.scss'
})
export class AddPassengersComponent {

  private _userService = inject(UserService);

  constructor() {
    // initialise the fare type button states - convert to an observable as we cannot set signals within an effect
    toObservable(this.bookingState).subscribe((state) => {
      if (state.kind == 'one_way_flights' || state.kind == 'return_flights') {
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
        // we can only initialise it now
        this.totalPrice.set(this.calcTotalPrice([{ firstName: '', lastName: '', passengerType: 'adult' }]));
      }
    });
    this.passengersForm.valueChanges.subscribe((value) => {
      // calculate the total value of the tickets
      this.totalPrice.set(this.calcTotalPrice( value.passengers as Passenger[]));

      // check for child fares
      this.hasChildFares.set((value.passengers ?? []).filter(p => p.passengerType == 'child').length > 0)
    });
  }

  calcTotalPrice(passengers: Passenger[]) {
    const state = this.bookingState();
    const adultPassengers = passengers.filter(p => p.passengerType == 'adult').length;
    const childPassengers = passengers.filter(p => p.passengerType == 'child').length;
    if (state.kind == 'one_way_flights') {
      const fareType = this.outboundDiscountFareState() == 'selected' ? 'discount' : 'full';
      return calcPrice(fareType, 'adult', this.outboundFlight()) * adultPassengers + calcPrice(fareType, 'child', this.outboundFlight()) * childPassengers;
    } else if (state.kind == 'return_flights') {
      const outboundFareType = this.outboundDiscountFareState() == 'selected' ? 'discount' : 'full';
      const returnFareType = this.returnDiscountFareState() == 'selected' ? 'discount' : 'full';
      const outboundPrice = calcPrice(outboundFareType, 'adult', this.outboundFlight()) * adultPassengers + calcPrice(outboundFareType, 'child', this.outboundFlight()) * childPassengers;
      const returnPrice = calcPrice(returnFareType, 'adult', this.returnFlight()) * adultPassengers + calcPrice(returnFareType, 'child', this.returnFlight()) * childPassengers;
      return outboundPrice + returnPrice;
    } else {
      return 0;
    }
  }

  bookingState = input.required<BookingState>();

  showReturn = computed<boolean>(() => this.bookingState().kind === 'return_flights');

  // these are used for the flight summary
  outboundTimetableFlight = computed<TimetableFlight>(() => {
    const state = this.bookingState();
    if (state.kind == 'one_way_flights' || state.kind == 'return_flights') {
      return state.outboundTimetableFlight;
    } else {
      throw Error('Invalid state for AddPassengersComponent')
    }
  });

  outboundFlight = computed<Flight>(() => {
    const state = this.bookingState();
    if (state.kind == 'one_way_flights' || state.kind == 'return_flights') {
      return state.outboundFlight;
    } else {
      throw Error('Invalid state for AddPassengersComponent')
    }
  });

  returnTimetableFlight = computed<TimetableFlight | undefined>(() => {
    const state = this.bookingState();
    if (state.kind == 'return_flights') {
      return state.returnTimetableFlight;
    } else {
      return undefined;
    }
  });

  returnFlight = computed<Flight | undefined>(() => {
    const state = this.bookingState();
    if (state.kind == 'return_flights') {
      return state.returnFlight;
    } else {
      return undefined;
    }
  });

  totalPrice = signal<number>(0);
  hasChildFares = signal<boolean>(false);

  // these are used to set the buttons, they are signals not computed as they can be set by the user
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

  private _passengerSubform(firstName: string, lastName: string) {
    return this._fb.nonNullable.group({
      firstName: [firstName, Validators.required],
      lastName: [lastName, Validators.required],
      passengerType: ['adult'],
    });
  }

  passengersForm = this._fb.nonNullable.group({
    passengers: this._fb.array([this._passengerSubform(this._userService.currentUser()?.firstName ?? '', this._userService.currentUser()?.lastName ?? '')])
  });

  maxPassengers = computed<number>(() => {
    const state = this.bookingState();
    if (state.kind == 'one_way_flights') {
      if (this.outboundDiscountFareState() == 'selected') {
        return this.outboundFlight()?.emptyDiscountSeats ?? 1;
      } else {
        return this.outboundFlight()?.emptyFullPriceSeats ?? 1;
      }
    } else if (state.kind == 'return_flights') {
      let outbound: number
      if (this.outboundDiscountFareState() == 'selected') {
        outbound = this.outboundFlight()?.emptyDiscountSeats ?? 1;
      } else {
        outbound = this.outboundFlight()?.emptyFullPriceSeats ?? 1;
      }
      let inbound: number
      if (this.returnDiscountFareState() == 'selected') {
        inbound = this.returnFlight()?.emptyDiscountSeats ?? 1;
      } else {
        inbound = this.returnFlight()?.emptyFullPriceSeats ?? 1;
      }
      return Math.min(outbound, inbound);
    } else {
      return 1;
    }
  });

  get passengers() {
    return this.passengersForm.get('passengers') as FormArray;
  }

  addPassenger() {
    this.passengers.push(this._passengerSubform('', ''));

    // check if this removes the option to select a discount fare
    const state = this.bookingState();
    if (state.kind == 'one_way_flights' || state.kind == 'return_flights') {
      if (state.outboundFlight.emptyDiscountSeats < this.passengers.controls.length) {
        this.outboundFullFareState.set('default');
        this.outboundDiscountFareState.set('booked out');
      }
      if (state.kind == 'return_flights') {
        if (state.returnFlight.emptyDiscountSeats < this.passengers.controls.length) {
          this.returnFullFareState.set('default');
          this.returnDiscountFareState.set('booked out');
        }
      }
    }
  }

  removePassenger(index: number) {
    this.passengers.removeAt(index);

    // check if this adds the option to select a discount fare
    const state = this.bookingState();
    if (state.kind == 'one_way_flights' || state.kind == 'return_flights') {
      if (state.outboundFlight.emptyDiscountSeats >= this.passengers.controls.length && this.outboundFullFareState() == 'default') {
        this.outboundFullFareState.set('selected');
        this.outboundDiscountFareState.set('available');
      }
      if (state.kind == 'return_flights') {
        if (state.returnFlight.emptyDiscountSeats >= this.passengers.controls.length && this.returnFullFareState() == 'default') {
          this.returnFullFareState.set('selected');
          this.returnDiscountFareState.set('available');
        }
      }
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
    const passengers = this.passengersForm.value.passengers as Passenger[];
    const outboundFareType: FareType = (this.outboundFullFareState() == 'selected' || this.outboundFullFareState() == 'default') ? 'full' : 'discount';
    const returnFareType: FareType = (this.returnFullFareState() == 'selected' || this.returnFullFareState() == 'default') ? 'full' : 'discount';
    // it does not matter if the return flight is not shown, the return ticket type will be ignored in that case
    this.passengersAdded.emit({ outboundFareType, returnFareType, passengers });
  }

  @Output() passengersAdded = new EventEmitter<{ outboundFareType: FareType, returnFareType: FareType, passengers: Passenger[] }>();
}

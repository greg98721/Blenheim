import { Airport, AirRoute, EMPTY_FLIGHT, Flight, maximumBookingDay, OneWayBooking, Passenger, PassengerType, ReturnBooking, startOfDayInTimezone, FareType, TimetableFlight, timezone, Ticket } from "@blenheim/model";
import { addDays, parseISO, differenceInCalendarDays, eachDayOfInterval, isSameDay } from 'date-fns';

/** Just so we have something to initialise with */
export interface UndefinedState {
  kind: 'undefined'
}

export interface BookingStart {
  kind: 'start',
}

export interface BookingOrigin {
  kind: 'origin',
  origin: Airport
}

export interface BookingDestination {
  kind: 'destination',
  route: AirRoute,
  earliest: Date,
  latest: Date
}

export interface NominalBookingDate {
  kind: 'nominal_date',
  route: AirRoute,
  dayRange: Date[],
  nominalDate: number,
  timetableFlights: { timetableFlight: TimetableFlight, flights: Flight[] }[]
}

export interface OutboundFlight {
  kind: 'outbound_flight',
  outboundTimetableFlight: TimetableFlight,
  outboundFlight: Flight
}

export interface OneWayFlightDetails {
  kind: 'one_way_flights',
  outboundTimetableFlight: TimetableFlight,
  outboundFlight: Flight
}

export interface OneWayBookingComplete {
  kind: 'one_way_booking_complete',
  outboundTimetableFlight: TimetableFlight,
  outboundFlight: Flight,
  booking: OneWayBooking
}

export interface ReturnFlightRequested {
  kind: 'return_flight_requested',
  outboundTimetableFlight: TimetableFlight,
  outboundFlight: Flight,
  returnRoute: AirRoute,
  earliest: Date,
  latest: Date
}

export interface NominalBookingReturnDate {
  kind: 'nominal_return_date',
  outboundTimetableFlight: TimetableFlight,
  outboundFlight: Flight,
  returnRoute: AirRoute,
  dayRange: Date[],
  nominalReturnDate: number
  timetableReturnFlights: { timetableFlight: TimetableFlight, flights: Flight[] }[]
}

export interface ReturnFlightDetails {
  kind: 'return_flights',
  outboundTimetableFlight: TimetableFlight,
  outboundFlight: Flight,
  returnTimetableFlight: TimetableFlight,
  returnFlight: Flight
}

export interface ReturnBookingComplete {
  kind: 'return_booking_complete',
  outboundTimetableFlight: TimetableFlight,
  outboundFlight: Flight,
  returnTimetableFlight: TimetableFlight,
  returnFlight: Flight,
  booking: ReturnBooking
}

/** Defines the state machine in the booking service togeather with all data required at each state */
export type BookingState = UndefinedState | BookingStart | BookingOrigin | BookingDestination | NominalBookingDate | OutboundFlight | OneWayFlightDetails | OneWayBookingComplete | ReturnFlightRequested | NominalBookingReturnDate | ReturnFlightDetails | ReturnBookingComplete;

export function startBooking(): BookingState {
  return { kind: 'start' };
}

export function addOrigin(state: BookingState | undefined, origin: Airport): BookingState {
  // we can start from this state so there could be no previous state
  if (state === undefined || state.kind === 'start') {
    return { kind: 'origin', origin };
  } else {
    throw new Error(`Cannot create origin state from ${state.kind}`);
  }
}

export function addDestination(state: BookingState, route: AirRoute): BookingState {
  if (state.kind === 'origin') {
    if (route.origin === state.origin) {
      const originTimeZone = timezone(state.origin);
      // the local date of the user does not count - only the current time at the origin
      // we want starting tomorrow as too hard to determine what remains of today
      const earliest = addDays(startOfDayInTimezone(originTimeZone, new Date()), 1);
      const latest = addDays(earliest, maximumBookingDay);

      return { kind: 'destination', route: route, earliest, latest };
    } else {
      throw new Error(`State origin ${state.origin} does not match route origin ${route.origin}`);
    }
  } else {
    throw new Error(`Cannot create destination state from ${state.kind}`);
  }
}

export function addDate(state: BookingState, nominalDate: string, timetableFlights: { timetableFlight: TimetableFlight, flights: Flight[] }[]): BookingState {
  if (state.kind === 'destination') {
    const originTimeZone = timezone(state.route.origin);
    const sel = parseISO(nominalDate);
    const selected = startOfDayInTimezone(originTimeZone, sel);
    const earliest = addDays(startOfDayInTimezone(originTimeZone, new Date()), 1);

    // we want a five day selection around the selected date taking into account where the selected date is near one end of the possible range
    const gap = differenceInCalendarDays(selected, earliest);
    let dayRange: Date[];
    let selIndex: number;
    if (gap < 3) {
      dayRange = eachDayOfInterval({ start: earliest, end: addDays(earliest, 4) })
      selIndex = gap;
    } else if (gap > (maximumBookingDay - 2)) {
      dayRange = eachDayOfInterval({ start: addDays(earliest, maximumBookingDay - 4), end: addDays(earliest, maximumBookingDay) })
      selIndex = gap - maximumBookingDay + 4;
    } else {
      dayRange = eachDayOfInterval({ start: addDays(selected, -2), end: addDays(selected, 2) })
      selIndex = 2;
    }

    if (dayRange.length !== 5) {
      throw new Error(`Did not create valid day range - length = ${dayRange.length}`);
    }

    const withinRange = timetableFlights.map(f => {
      const parsed = f.flights.map(p => ({ date: parseISO(p.date), flight: p }));
      const filtered = dayRange.map(d => parsed.find(p => isSameDay(d, p.date))?.flight ?? EMPTY_FLIGHT);
      return { timetableFlight: f.timetableFlight, flights: filtered };
    });
    const filtered = withinRange.filter(f => f.flights.filter(l => l.flightNumber !== '').length > 0);
    const sorted = filtered.sort((a, b) => (a.timetableFlight.departs - b.timetableFlight.departs));
    return { kind: 'nominal_date', route: state.route, dayRange, nominalDate: selIndex, timetableFlights: sorted };
  } else {
    throw new Error(`Cannot create nominal_date state from ${state.kind}`);
  }
}

export function selectOutboundFlight(state: BookingState, outboundTimetableFlight: TimetableFlight, outboundFlight: Flight): BookingState {
  if (state.kind === 'nominal_date') {
    if (state.route.origin === outboundTimetableFlight.route.origin && state.route.destination === outboundTimetableFlight.route.destination) {
      return { kind: 'outbound_flight', outboundTimetableFlight, outboundFlight };
    } else {
      throw new Error(`State route ${state.route.origin} -> ${state.route.destination} does not match outbound timetable flight route ${outboundTimetableFlight.route.origin} -> ${outboundTimetableFlight.route.destination}`);
    }
  } else {
    throw new Error(`Cannot create outbound flight booking state from ${state.kind}`);
  }
}

export function oneWayOnly(state: BookingState): BookingState {
  if (state.kind === 'outbound_flight') {
    return { kind: 'one_way_flights', outboundTimetableFlight: state.outboundTimetableFlight, outboundFlight: state.outboundFlight };
  } else {
    throw new Error(`Cannot create one_way_booking booking state from ${state.kind}`);
  }
}

export function requestReturnFlight(state: BookingState): BookingState {
  if (state.kind === 'outbound_flight') {
    const returnRoute = { origin: state.outboundTimetableFlight.route.destination, destination: state.outboundTimetableFlight.route.origin };
    // As far as the demo goes there will always be a return route - but in reality there may not be
    if (state.outboundTimetableFlight.route.origin === returnRoute.destination && state.outboundTimetableFlight.route.destination === returnRoute.origin) {

      const destinationTimeZone = timezone(state.outboundTimetableFlight.route.destination);

      // the local date of the user does not count - only the current time at the origin
      // we want starting tomorrow as too hard to determine what remains of today
      const tomorrow = addDays(startOfDayInTimezone(destinationTimeZone, new Date()), 1);
      const dateOfOutboundFlight = parseISO(state.outboundFlight.date);
      const earliest = addDays(dateOfOutboundFlight, 1);
      const latest = addDays(tomorrow, maximumBookingDay);

      return { kind: 'return_flight_requested', outboundTimetableFlight: state.outboundTimetableFlight, outboundFlight: state.outboundFlight, returnRoute, earliest, latest };
    } else {
      throw new Error(`Return route ${returnRoute.origin} -> ${returnRoute.destination} does not reverse outbound timetable flight route ${state.outboundTimetableFlight.route.origin} -> ${state.outboundTimetableFlight.route.destination}`);
    }
  } else {
    throw new Error(`Cannot create return_flight_requested booking state from ${state.kind}`);
  }
}

export function addReturnDate(state: BookingState, nominalReturnDate: string, timetableReturnFlights: { timetableFlight: TimetableFlight, flights: Flight[] }[]): BookingState {
  if (state.kind === 'return_flight_requested') {
    const destinationTimeZone = timezone(state.returnRoute.origin);
    const sel = parseISO(nominalReturnDate);
    const selected = startOfDayInTimezone(destinationTimeZone, sel);
    const tomorrow = addDays(startOfDayInTimezone(destinationTimeZone, new Date()), 1);
    const dateOfOutboundFlight = parseISO(state.outboundFlight.date);
    const earliest = addDays(dateOfOutboundFlight, 1);
    const latest = addDays(tomorrow, maximumBookingDay);

    // we want up to a five day selection around the selected date taking into account where the selected date is near one end of the possible range
    const totalGap = differenceInCalendarDays(latest, earliest);
    const earlyGap = differenceInCalendarDays(selected, earliest);
    const lateGap = differenceInCalendarDays(latest, selected);
    let dayRange: Date[];
    let selIndex: number;
    if (totalGap < 5) {
      dayRange = eachDayOfInterval({ start: earliest, end: latest })
      selIndex = earlyGap;
    } else if (earlyGap < 3) {
      dayRange = eachDayOfInterval({ start: earliest, end: addDays(earliest, 4) })
      selIndex = earlyGap;
    } else if (lateGap < 3) {
      dayRange = eachDayOfInterval({ start: addDays(latest, -4), end: latest })
      selIndex = 4 - lateGap;
    } else {
      dayRange = eachDayOfInterval({ start: addDays(selected, -2), end: addDays(selected, 2) })
      selIndex = 2;
    }

    if (dayRange.length !== 5) {
      throw new Error(`Did not create valid day range - length = ${dayRange.length}`);
    }

    const withinRange = timetableReturnFlights.map(f => {
      const parsed = f.flights.map(p => ({ date: parseISO(p.date), flight: p }));
      const filtered = dayRange.map(d => parsed.find(p => isSameDay(d, p.date))?.flight ?? EMPTY_FLIGHT);
      return { timetableFlight: f.timetableFlight, flights: filtered };
    });
    const filtered = withinRange.filter(f => f.flights.filter(l => l.flightNumber !== '').length > 0);
    const sorted = filtered.sort((a, b) => (a.timetableFlight.departs - b.timetableFlight.departs));

    return {
      kind: 'nominal_return_date',
      outboundTimetableFlight: state.outboundTimetableFlight,
      outboundFlight: state.outboundFlight,
      returnRoute: state.returnRoute,
      dayRange,
      nominalReturnDate: selIndex,
      timetableReturnFlights: sorted
    };
  } else {
    throw new Error(`Cannot create return date state from ${state.kind}`);
  }
}

export function selectReturnFlight(state: BookingState, returnTimetableFlight: TimetableFlight, returnFlight: Flight): BookingState {
  if (state.kind === 'nominal_return_date') {
    if (state.outboundTimetableFlight.route.origin === returnTimetableFlight.route.destination && state.outboundTimetableFlight.route.destination === returnTimetableFlight.route.origin) {
      return { kind: 'return_flights', outboundTimetableFlight: state.outboundTimetableFlight, outboundFlight: state.outboundFlight, returnTimetableFlight: returnTimetableFlight, returnFlight: returnFlight };
    } else {
      throw new Error(`State outbound  route ${state.outboundTimetableFlight.route.origin} -> ${state.outboundTimetableFlight.route.destination} does not match return route ${returnTimetableFlight.route.origin} -> ${returnTimetableFlight.route.destination}`);
    }
  } else {
    throw new Error(`Cannot create return booking state from ${state.kind}`);
  }
}

export function calcPrice(ticketType: FareType, passengerType: PassengerType, flight: Flight | undefined): number {
  const base = (ticketType === 'full') ? (flight?.fullPrice ?? 0) : (flight?.discountPrice ?? 0);
  const adjusted = passengerType === 'adult' ? base : Math.round(base * 0.5);	// children are half price
  return adjusted;
}

export function createBookingCompleteState(state: BookingState, outboundFareType: FareType, returnFareType: FareType, passengers: Passenger[], username: string): BookingState {

  if (state.kind === 'one_way_flights' || state.kind === 'return_flights') {

    const outboundTickets: Ticket[] = passengers.map(p => ({
      firstName: p.firstName,
      lastName: p.lastName,
      fareType: outboundFareType,
      passengerType: p.passengerType,
      price: calcPrice(outboundFareType, p.passengerType, state.outboundFlight),
      seatNumber: undefined,
    }));

    if (state.kind === 'one_way_flights') {

      const onewayBooking: OneWayBooking = {
        kind: 'oneWay',
        bookingReference: '',
        purchaserUsername: username,
        details: {
          date: state.outboundFlight.date,
          flightNumber: state.outboundTimetableFlight.flightNumber,
          origin: state.outboundTimetableFlight.route.origin,
          departs: state.outboundTimetableFlight.departs,
          destination: state.outboundTimetableFlight.route.destination,
          arrives: state.outboundTimetableFlight.arrives,
          tickets: outboundTickets,
        }
      }

      return {
        kind: 'one_way_booking_complete',
        outboundTimetableFlight: state.outboundTimetableFlight,
        outboundFlight: state.outboundFlight,
        booking: onewayBooking
      };
    } else {

      const returnTickets: Ticket[] = passengers.map(p => ({
        firstName: p.firstName,
        lastName: p.lastName,
        fareType: returnFareType,
        passengerType: p.passengerType,
        price: calcPrice(returnFareType, p.passengerType, state.returnFlight),
        seatNumber: undefined,
      }));

      const returnBooking: ReturnBooking = {
        kind: 'return',
        bookingReference: '',
        purchaserUsername: username,
        outboundDetails: {
          date: state.outboundFlight.date,
          flightNumber: state.outboundTimetableFlight.flightNumber,
          origin: state.outboundTimetableFlight.route.origin,
          departs: state.outboundTimetableFlight.departs,
          destination: state.outboundTimetableFlight.route.destination,
          arrives: state.outboundTimetableFlight.arrives,
          tickets: outboundTickets,
        },
        returnDetails: {
          date: state.returnFlight.date,
          flightNumber: state.returnTimetableFlight.flightNumber,
          origin: state.returnTimetableFlight.route.origin,
          departs: state.returnTimetableFlight.departs,
          destination: state.returnTimetableFlight.route.destination,
          arrives: state.returnTimetableFlight.arrives,
          tickets: returnTickets,
        }
      }

      return {
        kind: 'return_booking_complete',
        outboundTimetableFlight: state.outboundTimetableFlight,
        outboundFlight: state.outboundFlight,
        returnTimetableFlight: state.returnTimetableFlight,
        returnFlight: state.returnFlight,
        booking: returnBooking
      }
    }
  } else {
    throw new Error(`Cannot create booking created state from ${state.kind}`);
  }
}

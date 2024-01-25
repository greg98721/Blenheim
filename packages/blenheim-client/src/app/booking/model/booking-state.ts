import { Airport, AirRoute, EMPTY_FLIGHT, Flight, maximumBookingDay, OneWayBooking, Passenger, PassengerType, ReturnBooking, startOfDayInTimezone, TicketType, TimetableFlight, timezone } from "@blenheim/model";
import { addDays, parseISO, differenceInCalendarDays, eachDayOfInterval, isSameDay } from 'date-fns/fp'; // Note using the functional version of the date-fns library

/** Just so we have something to initialise with */
export interface UndefinedState {
  kind: 'undefined'
}

export interface BookingStart {
  kind: 'start',
  origins: Airport[]
}

export interface BookingOrigin {
  kind: 'origin',
  origin: Airport
  destinationRoutes: AirRoute[]
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

export interface DetailsForOneWayBooking {
  kind: 'one_way_booking',
  outboundTimetableFlight: TimetableFlight,
  outboundFlight: Flight
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

export interface DetailsForReturnBooking {
  kind: 'return_booking',
  outboundTimetableFlight: TimetableFlight,
  outboundFlight: Flight,
  inboundTimetableFlight: TimetableFlight,
  inboundFlight: Flight
}

/** Defines the state machine in the booking service togeather with all data required at each state */
export type BookingState = UndefinedState | BookingStart | BookingOrigin | BookingDestination | NominalBookingDate | OutboundFlight | DetailsForOneWayBooking | ReturnFlightRequested | NominalBookingReturnDate | DetailsForReturnBooking;

export function startBooking(origins: Airport[]): BookingState {
  return { kind: 'start', origins };
}

export function addOrigin(state: BookingState | undefined, origin: Airport, destinationRoutes: AirRoute[]): BookingState {
  // we can start from this state so there could be no previous state
  if (state === undefined || state.kind === 'start') {
    return { kind: 'origin', origin, destinationRoutes };
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
      const earliest = addDays(1, startOfDayInTimezone(originTimeZone, new Date()));
      const latest = addDays(maximumBookingDay, earliest);

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
    const earliest = addDays(1, startOfDayInTimezone(originTimeZone, new Date()));

    // we want a five day selection around the selected date taking into account where the selected date is near one end of the possible range
    const gap = differenceInCalendarDays(earliest, selected);
    let dayRange: Date[];
    let selIndex: number;
    if (gap < 3) {
      dayRange = eachDayOfInterval({ start: earliest, end: addDays(4, earliest) })
      selIndex = gap;
    } else if (gap > (maximumBookingDay - 2)) {
      dayRange = eachDayOfInterval({ start: addDays(maximumBookingDay - 4, earliest), end: addDays(maximumBookingDay, earliest) })
      selIndex = gap - maximumBookingDay + 4;
    } else {
      dayRange = eachDayOfInterval({ start: addDays(-2, selected), end: addDays(+2, selected) })
      selIndex = 2;
    }

    if (dayRange.length !== 5) {
      throw new Error(`Did not create valid day range - length = ${dayRange.length}`);
    }

    const withinRange = timetableFlights.map(f => {
      const parsed = f.flights.map(p => ({ date: parseISO(p.date), flight: p }));
      const filtered = dayRange.map(d => parsed.find(p => isSameDay(p.date, d))?.flight ?? EMPTY_FLIGHT);
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
    return { kind: 'one_way_booking', outboundTimetableFlight: state.outboundTimetableFlight, outboundFlight: state.outboundFlight };
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
      const tomorrow = addDays(1, startOfDayInTimezone(destinationTimeZone, new Date()));
      const dateOfOutboundFlight = parseISO(state.outboundFlight.date);
      const earliest = addDays(1, dateOfOutboundFlight);
      const latest = addDays(maximumBookingDay, tomorrow);

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
    const tomorrow = addDays(1, startOfDayInTimezone(destinationTimeZone, new Date()));
    const dateOfOutboundFlight = parseISO(state.outboundFlight.date);
    const earliest = addDays(1, dateOfOutboundFlight);
    const latest = addDays(maximumBookingDay, tomorrow);

    // we want up to a five day selection around the selected date taking into account where the selected date is near one end of the possible range
    const totalGap = differenceInCalendarDays(earliest, latest);
    const earlyGap = differenceInCalendarDays(earliest, selected);
    const lateGap = differenceInCalendarDays(selected, latest);
    let dayRange: Date[];
    let selIndex: number;
    if (totalGap < 5) {
      dayRange = eachDayOfInterval({ start: earliest, end: latest })
      selIndex = earlyGap;
    } else if (earlyGap < 3) {
      dayRange = eachDayOfInterval({ start: earliest, end: addDays(4, earliest) })
      selIndex = earlyGap;
    } else if (lateGap < 3) {
      dayRange = eachDayOfInterval({ start: addDays(-4, latest), end: latest })
      selIndex = 4 - lateGap;
    } else {
      dayRange = eachDayOfInterval({ start: addDays(-2, selected), end: addDays(+2, selected) })
      selIndex = 2;
    }

    if (dayRange.length !== 5) {
      throw new Error(`Did not create valid day range - length = ${dayRange.length}`);
    }

    const withinRange = timetableReturnFlights.map(f => {
      const parsed = f.flights.map(p => ({ date: parseISO(p.date), flight: p }));
      const filtered = dayRange.map(d => parsed.find(p => isSameDay(p.date, d))?.flight ?? EMPTY_FLIGHT);
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

export function selectReturnFlight(state: BookingState, inboundTimetableFlight: TimetableFlight, inboundFlight: Flight): BookingState {
  if (state.kind === 'nominal_return_date') {
    if (state.outboundTimetableFlight.route.origin === inboundTimetableFlight.route.destination && state.outboundTimetableFlight.route.destination === inboundTimetableFlight.route.origin) {
      return { kind: 'return_booking', outboundTimetableFlight: state.outboundTimetableFlight, outboundFlight: state.outboundFlight, inboundTimetableFlight: inboundTimetableFlight, inboundFlight: inboundFlight };
    } else {
      throw new Error(`State outbound  route ${state.outboundTimetableFlight.route.origin} -> ${state.outboundTimetableFlight.route.destination} does not match inbound route ${inboundTimetableFlight.route.origin} -> ${inboundTimetableFlight.route.destination}`);
    }
  } else {
    throw new Error(`Cannot create return booking state from ${state.kind}`);
  }
}

function calcPrice(ticketType: TicketType, passengerType: PassengerType, flight: Flight): number {
  const base = ticketType === 'full' ? flight.fullPrice : flight.discountPrice;
  const adjusted = passengerType === 'adult' ? base : Math.round(base * 0.5);	// children are half price
  return adjusted;
}

export function CreateOneWayBooking(state: BookingState, ticketType: TicketType, passengers: Passenger[], username: string): OneWayBooking {
  if (state.kind === 'one_way_booking') {

    const tickets = passengers.map(p => ({
      firstName: p.firstName,
      surname: p.surname,
      passengerType: p.passengerType,
      price: calcPrice(ticketType, p.passengerType, state.outboundFlight),
      seatNumber: undefined,
    }));

    return {
      kind: 'oneWay',
      purchaserUsername: username,
      date: state.outboundFlight.date,
      ticketType: ticketType,
      flightNumber: state.outboundTimetableFlight.flightNumber,
      tickets: tickets,
    };
  } else {
    throw new Error(`Cannot create booking created state from ${state.kind}`);
  }
}

export function CreateBooking(state: BookingState, outboundTicketType: TicketType, inboundTicketType: TicketType, passengers: Passenger[], username: string): ReturnBooking {
  if (state.kind === 'return_booking') {

    const outboundTickets = passengers.map(p => ({
      firstName: p.firstName,
      surname: p.surname,
      passengerType: p.passengerType,
      price: calcPrice(outboundTicketType, p.passengerType, state.outboundFlight),
      seatNumber: undefined,
    }));

    const inboundTickets = passengers.map(p => ({
      firstName: p.firstName,
      surname: p.surname,
      passengerType: p.passengerType,
      price: calcPrice(inboundTicketType, p.passengerType, state.inboundFlight),
      seatNumber: undefined,
    }));

    return {
      kind: 'return',
      purchaserUsername: username,
      outboundDate: state.outboundFlight.date,
      outboundFlightNumber: state.outboundTimetableFlight.flightNumber,
      outboundTicketType: outboundTicketType,
      outboundTickets: outboundTickets,
      inboundDate: state.inboundFlight.date,
      inboundFlightNumber: state.inboundTimetableFlight.flightNumber,
      inboundTicketType: inboundTicketType,
      inboundTickets: inboundTickets,
    };
  } else {
    throw new Error(`Cannot create booking created state from ${state.kind}`);
  }
}

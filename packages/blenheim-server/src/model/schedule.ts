import {
  addDays,
  formatISOWithOptions,
  eachDayOfInterval,
  differenceInCalendarDays,
} from 'date-fns/fp'; // Note using the functional version of the date-fns library
import { getTimezoneOffset } from 'date-fns-tz';
import {
  Aircraft,
  Airport,
  AirRoute,
  capacity,
  Flight,
  FRIDAY,
  getTimetableDayFromDate,
  maximumBookingDay,
  MONDAY,
  SATURDAY,
  startOfDayInTimezone,
  SUNDAY,
  THURSDAY,
  TimetableFlight,
  timezone,
  WEDNESDAY,
  WEEKDAYS,
  WEEKEND,
} from '@blenheim/model';
import { PsuedoRandom } from './psuedoRandom';

export interface Schedule {
  routes: ServerAirRoute[];
  randomSeed: string;
}

interface ServerAirRoute extends AirRoute {
  timetableFlights?: ServerTimetableFlight[];
  intensity: 0 | 1 | 2 | 3;
  distance: number;
  flightNumberBlock: number;
  randomSeed: string;
}

function asAirRoute(s: ServerAirRoute): AirRoute {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, prettier/prettier
  const { timetableFlights, intensity, distance, flightNumberBlock, randomSeed, ...airRoute } = s;
  return airRoute;
}

interface ServerTimetableFlight extends TimetableFlight {
  flights?: ServerFlight[];
  basePrice: number;
  randomSeed: string;
}

function asTimetableFlight(s: ServerTimetableFlight): TimetableFlight {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { flights, basePrice, randomSeed, ...timetableFlight } = s;
  return timetableFlight;
}

interface ServerFlight extends Flight {
  /** Only the manually added ones - simulate with EmptySeats field otherwise */
  bookings: ServerFlight[];
  randomSeed: string;
}

function asFlight(s: ServerFlight): Flight {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { bookings, randomSeed, ...flight } = s;
  return flight;
}

export function createSchedule(): Schedule {
  const seed = 'blenheim';
  const rnd = new PsuedoRandom(seed);
  const schedule = { routes: createRoutes(rnd), randomSeed: seed };
  return schedule;
}

/** Get the list of actual origin airports for which there are routes */
export function getOrigins(schedule: Schedule): Airport[] {
  // the Set makes the list of origins unique
  const unique = [...new Set(schedule.routes.map((r) => r.origin))];
  return unique.sort();
}

export function getRoutes(schedule: Schedule, origin: Airport): AirRoute[] {
  return schedule.routes
    .filter((r) => r.origin === origin)
    .map((r) => {
      return asAirRoute(r);
    });
}

export function getTimetable(
  schedule: Schedule,
  origin: Airport,
): TimetableFlight[] {
  // this function has side effects as we made need to inflate the list of timetable flights for each route
  return schedule.routes
    .filter((r) => r.origin === origin)
    .flatMap((r) => {
      if (r.timetableFlights === undefined) {
        r.timetableFlights = createTimetableFlights(r);
      }
      return r.timetableFlights.map((t) => asTimetableFlight(t));
    });
}

export function getTimetableFlight(
  schedule: Schedule,
  flightNumber: string,
  dateOfFlight: string,
): { timetableFlight: TimetableFlight; flight: Flight } {
  // this is a bit of a bodge as the timetableFlights may not exist yet so use the base flightnumber to find the route
  const flightNumberFromString = Number(flightNumber.substring(2));
  if (!Number.isNaN(flightNumberFromString)) {
    const baseFlightNumber =
      flightNumberFromString - (flightNumberFromString % 10);

    const route = schedule.routes.find(
      (r) => r.flightNumberBlock === baseFlightNumber,
    );
    if (route) {
      const timetableflights = getTimetableFlightsFromRoute(route);
      const timetableFlight = timetableflights.find(
        (tf) => tf.timetableFlight.flightNumber === flightNumber,
      );
      if (timetableFlight) {
        const flight = timetableFlight.flights.find(
          (f) => f.date === dateOfFlight,
        );
        if (flight) {
          return {
            timetableFlight: timetableFlight.timetableFlight,
            flight: flight,
          };
        } else {
          throw new Error(
            `Could not find get number from ${flightNumber} in getTimetableflight`,
          );
        }
      } else {
        throw new Error(
          `Could not find timetable flight for ${flightNumber} on ${dateOfFlight}`,
        );
      }
    } else {
      throw new Error(
        `Could not find route from ${flightNumber} in getTimetableflight`,
      );
    }
  } else {
    throw new Error(
      `Could not find get number from ${flightNumber} in getTimetableflight`,
    );
  }
}

export function getFlights(
  schedule: Schedule,
  origin: Airport,
  destination: Airport,
): { timetableFlight: TimetableFlight; flights: Flight[] }[] {
  const route = schedule.routes.find(
    (r) => r.origin === origin && r.destination === destination,
  );

  if (route !== undefined) {
    return getTimetableFlightsFromRoute(route);
  } else {
    throw new Error(`Could not find route for ${origin} to ${destination}`);
  }
}

function getTimetableFlightsFromRoute(
  route: ServerAirRoute,
): { timetableFlight: TimetableFlight; flights: Flight[] }[] {
  if (route.timetableFlights === undefined) {
    route.timetableFlights = createTimetableFlights(route);
  }

  const start = addDays(
    1,
    startOfDayInTimezone(timezone(route.origin), new Date()),
  );

  return route.timetableFlights
    .map((t) => {
      if (t.flights === undefined) {
        t.flights = createFlights(start, t);
      }
      const flights = t.flights.map((f) => asFlight(f));
      return { timetableFlight: asTimetableFlight(t), flights: flights };
    })
    .filter((d) => d.flights.length > 0);
}

function createRoutes(rnd: PsuedoRandom): ServerAirRoute[] {
  const oneWay: ServerAirRoute[] = [
    {
      origin: 'NZWB',
      destination: 'NZWN',
      distance: 83,
      timetableFlights: undefined,
      intensity: 3,
      flightNumberBlock: 0,
      randomSeed: rnd.nextSeed(),
    },
    {
      origin: 'NZWB',
      destination: 'NZCH',
      distance: 250,
      timetableFlights: undefined,
      intensity: 3,
      flightNumberBlock: 0,
      randomSeed: rnd.nextSeed(),
    },
    {
      origin: 'NZCH',
      destination: 'NZDN',
      distance: 313,
      timetableFlights: undefined,
      intensity: 2,
      flightNumberBlock: 0,
      randomSeed: rnd.nextSeed(),
    },
    {
      origin: 'NZCH',
      destination: 'NZQN',
      distance: 313,
      timetableFlights: undefined,
      intensity: 2,
      flightNumberBlock: 0,
      randomSeed: rnd.nextSeed(),
    },
    {
      origin: 'NZWB',
      destination: 'NZHK',
      distance: 272,
      timetableFlights: undefined,
      intensity: 2,
      flightNumberBlock: 0,
      randomSeed: rnd.nextSeed(),
    },
    {
      origin: 'NZCH',
      destination: 'NZHK',
      distance: 150,
      timetableFlights: undefined,
      intensity: 1,
      flightNumberBlock: 0,
      randomSeed: rnd.nextSeed(),
    },
    {
      origin: 'NZWB',
      destination: 'NZPM',
      distance: 187,
      timetableFlights: undefined,
      intensity: 1,
      flightNumberBlock: 0,
      randomSeed: rnd.nextSeed(),
    },
    {
      origin: 'NZWB',
      destination: 'NZAA',
      distance: 507,
      timetableFlights: undefined,
      intensity: 2,
      flightNumberBlock: 0,
      randomSeed: rnd.nextSeed(),
    },
    {
      origin: 'NZNS',
      destination: 'NZAA',
      distance: 501,
      timetableFlights: undefined,
      intensity: 2,
      flightNumberBlock: 0,
      randomSeed: rnd.nextSeed(),
    },
    {
      origin: 'NZNS',
      destination: 'NZWN',
      distance: 133,
      timetableFlights: undefined,
      intensity: 3,
      flightNumberBlock: 0,
      randomSeed: rnd.nextSeed(),
    },
    {
      origin: 'NZNS',
      destination: 'NZCH',
      distance: 247,
      timetableFlights: undefined,
      intensity: 3,
      flightNumberBlock: 0,
      randomSeed: rnd.nextSeed(),
    },
    {
      origin: 'NZNS',
      destination: 'NZQN',
      distance: 547,
      timetableFlights: undefined,
      intensity: 1,
      flightNumberBlock: 0,
      randomSeed: rnd.nextSeed(),
    },
    {
      origin: 'NZNS',
      destination: 'NZHK',
      distance: 239,
      timetableFlights: undefined,
      intensity: 2,
      flightNumberBlock: 0,
      randomSeed: rnd.nextSeed(),
    },
    {
      origin: 'NZNS',
      destination: 'NZPM',
      distance: 228,
      timetableFlights: undefined,
      intensity: 2,
      flightNumberBlock: 0,
      randomSeed: rnd.nextSeed(),
    },
    {
      origin: 'NZNS',
      destination: 'NZNP',
      distance: 264,
      timetableFlights: undefined,
      intensity: 1,
      flightNumberBlock: 0,
      randomSeed: rnd.nextSeed(),
    },
    {
      origin: 'NZNS',
      destination: 'NZTG',
      distance: 477,
      timetableFlights: undefined,
      intensity: 1,
      flightNumberBlock: 0,
      randomSeed: rnd.nextSeed(),
    },
    {
      origin: 'NZNS',
      destination: 'NZNR',
      distance: 371,
      timetableFlights: undefined,
      intensity: 1,
      flightNumberBlock: 0,
      randomSeed: rnd.nextSeed(),
    },
    {
      origin: 'NZNS',
      destination: 'NZDN',
      distance: 555,
      timetableFlights: undefined,
      intensity: 1,
      flightNumberBlock: 0,
      randomSeed: rnd.nextSeed(),
    },
    {
      origin: 'NZWN',
      destination: 'NZCH',
      distance: 305,
      timetableFlights: undefined,
      intensity: 3,
      flightNumberBlock: 0,
      randomSeed: rnd.nextSeed(),
    },
    {
      origin: 'NZWN',
      destination: 'NZAA',
      distance: 482,
      timetableFlights: undefined,
      intensity: 2,
      flightNumberBlock: 0,
      randomSeed: rnd.nextSeed(),
    },
    {
      origin: 'NZWN',
      destination: 'NZQN',
      distance: 640,
      timetableFlights: undefined,
      intensity: 2,
      flightNumberBlock: 0,
      randomSeed: rnd.nextSeed(),
    },
    {
      origin: 'NZWN',
      destination: 'NZDN',
      distance: 615,
      timetableFlights: undefined,
      intensity: 2,
      flightNumberBlock: 0,
      randomSeed: rnd.nextSeed(),
    },
    {
      origin: 'NZWN',
      destination: 'NZNP',
      distance: 264,
      timetableFlights: undefined,
      intensity: 2,
      flightNumberBlock: 0,
      randomSeed: rnd.nextSeed(),
    },
    {
      origin: 'NZWN',
      destination: 'NZNR',
      distance: 271,
      timetableFlights: undefined,
      intensity: 2,
      flightNumberBlock: 0,
      randomSeed: rnd.nextSeed(),
    },
    {
      origin: 'NZWN',
      destination: 'NZTG',
      distance: 423,
      timetableFlights: undefined,
      intensity: 1,
      flightNumberBlock: 0,
      randomSeed: rnd.nextSeed(),
    },
    {
      origin: 'NZWN',
      destination: 'NZCI',
      distance: 765,
      timetableFlights: undefined,
      intensity: 0,
      flightNumberBlock: 0,
      randomSeed: rnd.nextSeed(),
    },
    {
      origin: 'NZCH',
      destination: 'NZCI',
      distance: 885,
      timetableFlights: undefined,
      intensity: 0,
      flightNumberBlock: 0,
      randomSeed: rnd.nextSeed(),
    },
  ];

  // create the flight number blocks sequentially in blocks of 20
  let fn = 0;
  oneWay.forEach((o) => {
    o.flightNumberBlock = fn;
    fn += 20;
  });

  // now create return route for the outbound ones declared first
  const otherWay: ServerAirRoute[] = oneWay.map((o) => {
    return {
      origin: o.destination,
      destination: o.origin,
      distance: o.distance,
      timetableFlights: undefined,
      intensity: o.intensity,
      flightNumberBlock: o.flightNumberBlock + 10,
      randomSeed: rnd.nextSeed(),
    };
  });
  return oneWay.concat(otherWay);
}

function createTimetableFlights(
  route: ServerAirRoute,
): ServerTimetableFlight[] {
  const rnd = new PsuedoRandom(route.randomSeed);

  const baseRoute: AirRoute = {
    origin: route.origin,
    destination: route.destination,
  };

  let aircraft: Aircraft = 'ATR42';
  /** Only if both the origin and the destination are in this list will the A220 be used */
  const a220Airports = ['NZAA', 'NZCH', 'NZDN', 'NZQN', 'NZWN'];
  if (
    a220Airports.includes(route.origin) &&
    a220Airports.includes(route.destination)
  ) {
    aircraft = 'A220-100';
  }

  // This is a fudge as the timezones change with the date because of daylight saving - this is enough for a demo
  const originTzOffset = getTimezoneOffset(timezone(route.origin));
  const destinationTzOffset = getTimezoneOffset(timezone(route.destination));
  const timezoneDelta = (destinationTzOffset - originTzOffset) / 1000;

  const speed = aircraft === 'ATR42' ? 500 : 800;
  const flightTime = (route.distance / speed) * 60.0 + 25; // the 25 min is landing taxying etc.
  const basePrice = aircraft === 'ATR42' ? flightTime * 2 : flightTime * 1.2; // jet is cheaper than turboprop
  const flightDuration = flightTime;

  let currentFlightNumber = route.flightNumberBlock;

  const depatureTimes: { days: number; departure: number }[] = [];

  const divideDay = (days: number, n: number, fromT: number, toT: number) => {
    if (n === 0) {
      return;
    }
    for (let i = 0; i < n; i++) {
      const r0 = (i * (toT - fromT)) / n + fromT;
      const r1 = r0 + (toT - fromT) / n;
      const d = rnd.gaussian(r0, r1) * 60.0;
      depatureTimes.push({ days: days, departure: d });
    }
  };

  switch (route.intensity) {
    case 0:
      // Intensity 0: 3 time per week
      const days = rnd.withinPrecent(50)
        ? MONDAY + THURSDAY + SATURDAY
        : SUNDAY + WEDNESDAY + FRIDAY;
      const dep = rnd.gaussian(10, 16) * 60.0;
      depatureTimes.push({ days: days, departure: dep });
      break;
    case 1:
      // Intensity 1: Every week day and maybe weekends - 1 or 2 flights per day
      const wd1 = rnd.withinPrecent(70) ? 2 : 1;
      divideDay(WEEKDAYS, wd1, 8, 19);

      const we1 = rnd.withinPrecent(50) ? 1 : 0;
      divideDay(WEEKEND, we1, 9, 15);
      break;
    case 2:
      // Intensity 2: Every day - 3 to 5 flights per weekday 2 to 3 per weekend
      const wd2 = rnd.flatInt(3, 5);
      divideDay(WEEKDAYS, wd2, 7, 21);

      const we2 = rnd.flatInt(2, 3);
      divideDay(WEEKEND, we2, 9, 17);
      break;
    case 3:
      // Intensity 3: Every day - 5 to 8 flights per weekday 3 to 6 per weekend - evenly spaced
      const wd3 = rnd.flatInt(5, 8);
      divideDay(WEEKDAYS, wd3, 6, 23);

      const we3 = rnd.flatInt(3, 6);
      divideDay(WEEKEND, we3, 8, 20);
      break;
  }

  return depatureTimes.map((t) => {
    const arrives = t.departure + flightDuration - timezoneDelta;
    const flightNumber = `MA${currentFlightNumber.toString().padStart(3, '0')}`;
    currentFlightNumber++;

    return {
      route: baseRoute,
      aircraft: aircraft,
      flightNumber: flightNumber,
      departs: t.departure,
      arrives: arrives,
      days: t.days,
      flights: undefined,
      basePrice: basePrice,
      randomSeed: rnd.nextSeed(),
    };
  });
}

function createFlights(
  start: Date,
  timetableFlight: ServerTimetableFlight,
): ServerFlight[] {
  const rnd = new PsuedoRandom(timetableFlight.randomSeed);

  const createEmptySeatsAndPrice = (dayOfFlight: Date) => {
    const daysTillFlight = differenceInCalendarDays(start, dayOfFlight);
    let fullBookedPercent: number;
    let percentDiscountSeats: number;

    // add a weighting for rush hour
    const hours = Math.floor(timetableFlight.departs / 60);
    if ((timetableFlight.days & WEEKDAYS) !== 0) {
      // is a weekday
      switch (hours ?? 0) {
        case 7:
        case 8:
        case 16:
        case 17:
          fullBookedPercent = rnd.flat(0.85, 1.3); // greater than 100% as to emulate booked out long way ahead
          percentDiscountSeats = 0.2; // not many discount seats at rush hour
          break;
        case 6:
        case 9:
        case 15:
        case 18:
        case 19:
          fullBookedPercent = rnd.flat(0.7, 1.05);
          percentDiscountSeats = 0.35; // fewer discount seats at shoulder
          break;
        default:
          fullBookedPercent = rnd.flat(0.4, 0.75);
          percentDiscountSeats = 0.5;
          break;
      }
    } else {
      // is a weekend
      if (hours >= 10 && hours <= 17) {
        fullBookedPercent = rnd.flat(0.6, 1.0); // greater than 100% as to emulate booked out long way ahead
        percentDiscountSeats = 0.5;
      } else {
        fullBookedPercent = rnd.flat(0.3, 0.6); // greater than 100% as to emulate booked out long way ahead
        percentDiscountSeats = 0.7;
      }
    }

    // put in a slope of bookings so that the seats are not all booked out
    if (daysTillFlight > maximumBookingDay) {
      fullBookedPercent = 0;
    } else if (daysTillFlight > 0) {
      // full price seats can be booked up to the day before
      fullBookedPercent =
        (fullBookedPercent * (maximumBookingDay - daysTillFlight)) /
        maximumBookingDay;
    }
    fullBookedPercent = fullBookedPercent > 1.0 ? 1.0 : fullBookedPercent;

    // the discount seats can only be booked one week out
    let discountBookedPercent: number;
    if (daysTillFlight > maximumBookingDay) {
      discountBookedPercent = 0;
    } else if (daysTillFlight > 7) {
      // the discount seats can only be booked one week out
      const discountBookingPeriod = maximumBookingDay - 7;
      const adjustedDays = daysTillFlight - 7;
      discountBookedPercent =
        (fullBookedPercent * (discountBookingPeriod - adjustedDays)) /
        adjustedDays;
    } else {
      discountBookedPercent = 1.0;
    }
    discountBookedPercent =
      discountBookedPercent > 1.0 ? 1.0 : discountBookedPercent;

    const numDiscountSeats =
      daysTillFlight > 7
        ? Math.floor(percentDiscountSeats * capacity(timetableFlight.aircraft))
        : 0;
    const emptyDiscountSeats = Math.floor(
      (1 - discountBookedPercent) * numDiscountSeats,
    );
    const numFullPriceSeats =
      capacity(timetableFlight.aircraft) - numDiscountSeats;
    const emptyFullPriceSeats = Math.floor(
      (1 - fullBookedPercent) * numFullPriceSeats,
    );

    return {
      emptyDiscountSeats: emptyDiscountSeats,
      emptyFullPriceSeats: emptyFullPriceSeats,
      fullPrice: timetableFlight.basePrice,
      discountPrice: timetableFlight.basePrice * 0.5, // allows for some flexibility in the future
    };
  };

  return eachDayOfInterval({ start: start, end: addDays(42, start) })
    .filter((d) => {
      // first filter the days when there is no flight
      const t = getTimetableDayFromDate(d);
      return (t & timetableFlight.days) > 0;
    })
    .map((d) => {
      const e = createEmptySeatsAndPrice(d);
      return {
        flightNumber: timetableFlight.flightNumber,
        date: formatISOWithOptions({ representation: 'date' }, d),
        emptyFullPriceSeats: e.emptyFullPriceSeats,
        emptyDiscountSeats: e.emptyDiscountSeats,
        fullPrice: e.fullPrice,
        discountPrice: e.discountPrice,
        departed: undefined,
        arrived: undefined,
        bookings: [],
        randomSeed: rnd.nextSeed(),
      };
    });
}

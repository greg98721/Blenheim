import {
  Airport,
  Flight,
  FlightBooking,
  TimetableFlight,
} from '@blenheim/model';
import { Injectable } from '@nestjs/common';
import {
  Schedule,
  createSchedule,
  getFlights,
  getOrigins,
  getRoutes,
  getTimetable,
  bookSeats,
  getTimetableFlight,
} from '../model/schedule';

@Injectable()
export class ScheduleService {
  private _schedule: Schedule;

  constructor() {
    this._schedule = createSchedule();
  }

  origins() {
    return getOrigins(this._schedule);
  }

  routes(origin: Airport) {
    return getRoutes(this._schedule, origin);
  }

  timetable(origin: Airport) {
    return getTimetable(this._schedule, origin);
  }

  flights(
    origin: Airport,
    destination: Airport,
  ): { timetableFlight: TimetableFlight; flights: Flight[] }[] {
    return getFlights(this._schedule, origin, destination);
  }

  flightToBook(flightNumber: string, dateOfFlight: string) {
    return getTimetableFlight(this._schedule, flightNumber, dateOfFlight);
  }

  updateSeatsForFlightBooking(booking: FlightBooking) {
    if (booking.kind === 'oneWay') {
      const numFullPriceSeats = booking.details.tickets.filter(
        (t) => t.fareType === 'full',
      ).length;
      const numDiscountSeats = booking.details.tickets.filter(
        (t) => t.fareType === 'discount',
      ).length;
      bookSeats(
        this._schedule,
        booking.details.flightNumber,
        booking.details.date,
        numFullPriceSeats,
        numDiscountSeats,
      );
    } else if (booking.kind === 'return') {
      const numFullPriceSeats = booking.outboundDetails.tickets.filter(
        (t) => t.fareType === 'full',
      ).length;
      const numDiscountSeats = booking.outboundDetails.tickets.filter(
        (t) => t.fareType === 'discount',
      ).length;
      bookSeats(
        this._schedule,
        booking.outboundDetails.flightNumber,
        booking.outboundDetails.date,
        numFullPriceSeats,
        numDiscountSeats,
      );

      const numFullPriceSeatsReturn = booking.returnDetails.tickets.filter(
        (t) => t.fareType === 'full',
      ).length;
      const numDiscountSeatsReturn = booking.returnDetails.tickets.filter(
        (t) => t.fareType === 'discount',
      ).length;
      bookSeats(
        this._schedule,
        booking.returnDetails.flightNumber,
        booking.returnDetails.date,
        numFullPriceSeatsReturn,
        numDiscountSeatsReturn,
      );
    }
  }
}

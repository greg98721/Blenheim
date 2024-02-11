import { FlightBooking } from '@blenheim/model';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BookingsService {
  private _bookingCache: FlightBooking[] = [];

  addBooking(booking: FlightBooking): string {
    const ref = this._generateBookingReference();
    booking.bookingReference = ref;
    // Add booking to database
    this._bookingCache.push(booking);
    return ref;
  }

  bookingsForFlight(flightNumber: string, date: string) {
    // Get bookings for flight
    return this._bookingCache.filter((booking) => {
      if (booking.kind === 'oneWay') {
        return (
          booking.details.flightNumber === flightNumber &&
          booking.details.date === date
        );
      } else {
        return (
          (booking.outboundDetails.flightNumber === flightNumber &&
            booking.outboundDetails.date === date) ||
          (booking.returnDetails.flightNumber === flightNumber &&
            booking.returnDetails.date === date)
        );
      }
    });
  }

  bookingsForUser(username: string) {
    // Get bookings for user
    return this._bookingCache.filter((booking) => {
      return booking.purchaserUsername === username;
    });
  }

  updateBooking(booking: FlightBooking) {
    // Update booking
    this._bookingCache = this._bookingCache.map((b) => {
      if (b.bookingReference === booking.bookingReference) {
        return booking;
      } else {
        return b;
      }
    });
  }

  deleteBooking(bookingRef: string) {
    // Delete booking
    this._bookingCache = this._bookingCache.filter(
      (b) => b.bookingReference !== bookingRef,
    );
  }

  private _generateBookingReference() {
    // Generate booking reference
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    ); // random enough for a demo
  }
}

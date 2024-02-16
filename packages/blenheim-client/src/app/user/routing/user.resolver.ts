import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from "@angular/router";
import { Airport, cityName, FlightBooking, isAirport, TimetableFlight } from "@blenheim/model";
import { map } from "rxjs";
import { parseISO, isAfter } from 'date-fns';
import { BookingService } from "../../booking/services/booking.service";
import { UserService } from "../services/user.service";

export const resolveUserBookings: ResolveFn<FlightBooking[]> =
  (
    route: ActivatedRouteSnapshot,
    _: RouterStateSnapshot
  ) => {
    const _bookingService = inject(BookingService)
    const _userService = inject(UserService);
    const username = _userService.currentUser()?.username;
    if (username !== undefined) {
      return _bookingService.bookingsForUser$(username).pipe(
        map(bookings => {
          return bookings.sort((a, b) => {
            const ad = parseISO(a.kind === 'oneWay' ? a.details.date : a.outboundDetails.date);
            const bd = parseISO(b.kind === 'oneWay' ? b.details.date : b.outboundDetails.date);
            return isAfter(ad, bd) ? -1 : 1;  // most recent first
          })
        }),
      );
    } else {
      throw new Error('No username when navigating to user bookings');
    }
  }

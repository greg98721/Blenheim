import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { FlightBooking } from '@blenheim/model';
import { BookingsService } from './bookings.service';
import { ScheduleService } from '../schedule/schedule.service';

@Controller('api/bookings')
export class BookingsController {
  constructor(
    private readonly _bookingService: BookingsService,
    private readonly _scheduleService: ScheduleService,
  ) {}

  @UseGuards(AuthGuard)
  @Post()
  async add(@Body() booking: FlightBooking) {
    const ref = this._bookingService.addBooking(booking);
    // update the flights to remove the empty seats
    this._scheduleService.updateSeatsForFlightBooking(booking);
    return { bookingReference: ref };
  }

  @UseGuards(AuthGuard)
  @Get('forUser/:username')
  async getBookingForUser(@Param('username') username: string) {
    return this._bookingService.bookingsForUser(username);
  }

  @UseGuards(AuthGuard)
  @Get('forFlight/:flightNumber/:date')
  async getTimetable(
    @Param('flightNumber') flightNumber: string,
    @Param('date') date: string,
  ) {
    return this._bookingService.bookingsForFlight(flightNumber, date);
  }

  @UseGuards(AuthGuard)
  @Patch()
  async updateBooking(@Body() booking: FlightBooking) {
    return this._bookingService.updateBooking(booking);
  }

  @UseGuards(AuthGuard)
  @Delete(':bookingRef')
  async deleteBooking(@Param('bookingRef') bookingRef: string) {
    return this._bookingService.deleteBooking(bookingRef);
  }
}

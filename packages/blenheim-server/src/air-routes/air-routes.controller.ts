import { Airport, isAirport } from '@blenheim/model';
import {
  Controller,
  Get,
  Header,
  HttpException,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { ScheduleService } from '../schedule/schedule.service';

@Controller('api/routes')
export class AirRoutesController {
  constructor(private readonly _scheduleService: ScheduleService) {}

  @Get()
  @Header('Cache-Control', 'max-age=3600')
  getOrigins() {
    return this._scheduleService.origins();
  }

  @Get(':origin')
  @Header('Cache-Control', 'max-age=3600')
  getRoutes(@Param('origin') origin: string) {
    if (isAirport(origin)) {
      const o = origin as Airport;
      return this._scheduleService.routes(o);
    } else {
      throw new HttpException(
        `Tried to convert a non valid airport code ${origin} when getting list of routes`,
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Get('timetable/:origin')
  @Header('Cache-Control', 'max-age=3600')
  getTimetable(@Param('origin') origin: string) {
    if (isAirport(origin)) {
      const o = origin as Airport;
      return this._scheduleService.timetable(o);
    } else {
      throw new HttpException(
        `Tried to convert a non valid airport code ${origin} when getting list of timetables`,
        HttpStatus.NOT_FOUND,
      );
    }
  }
}

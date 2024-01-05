import { Module } from '@nestjs/common';
import { AirRoutesController } from './air-routes/air-routes.controller';
import { FlightsController } from './flights/flights.controller';
import { AuthController } from './auth/auth.controller';
import { ScheduleService } from './schedule/schedule.service';
import { UserService } from './user/user.service';

@Module({
  imports: [],
  controllers: [AirRoutesController, FlightsController, AuthController],
  providers: [ScheduleService, UserService],
})
export class AppModule {}

import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { JwtModule } from '@nestjs/jwt';

import { join } from 'path';

import { AirRoutesController } from './air-routes/air-routes.controller';
import { FlightsController } from './flights/flights.controller';
import { AuthController } from './auth/auth.controller';
import { ScheduleService } from './schedule/schedule.service';
import { UsersService } from './users/users.service';
import { AuthService } from './auth/auth.service';
import { UsersController } from './users/users.controller';
import { FrontendMiddleware } from './FrontendMiddleware';

@Module({
  imports: [
    // This goes first so that the config service is available to other modules
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // This enables the server to serve the client files from the dist folder
    // Noye we use the async version of forRoot so that we can inject the config service
    ServeStaticModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => [
        {
          rootPath: join(
            __dirname,
            configService.get<string>('CLIENT_DIST') || '',
          ),
        },
      ],
    }),
    // Note we use the async version of register so that we can inject the config service
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '3600s' },
      }),
    }),
  ],
  controllers: [
    AirRoutesController,
    FlightsController,
    AuthController,
    UsersController,
  ],
  providers: [ScheduleService, UsersService, AuthService],
})
// To enable the server to host the client files
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(FrontendMiddleware).forRoutes({
      path: '/**', // For all routes
      method: RequestMethod.ALL, // For all methods
    });
  }
}

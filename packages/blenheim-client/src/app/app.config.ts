import { APP_INITIALIZER, ApplicationConfig, ErrorHandler } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideClientHydration } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';
import { AppConfigService } from './shared/services/app-config.service';
import { GlobalHttpErrorHandler } from './shared/utility/global-http-error-handler.interceptor';
import { AuthInterceptor } from './user/utility/auth-Interceptor';
import { CustomErrorHandler } from './shared/utility/custom-error-handler.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes), [
      provideClientHydration(),
      withComponentInputBinding(),
      provideHttpClient(),
      {
        provide: ErrorHandler,
        useClass: CustomErrorHandler
      }
    ],
    {
      provide: APP_INITIALIZER,
      deps: [
        AppConfigService
      ],
      useFactory: (service: AppConfigService) => () => service.load(),  // we are setting the function here - not running it
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: GlobalHttpErrorHandler,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
};

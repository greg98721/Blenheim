import { APP_INITIALIZER, ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { AppConfigService } from './shared/services/app-config.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { loadingUiInterceptor } from './shared/utility/loading-ui.interceptor';
import { authInterceptor } from './shared/utility/auth.interceptor';
import { globalErrorInterceptor } from './shared/utility/global-error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    [
      provideClientHydration(),
      withComponentInputBinding(),
      provideHttpClient(
        withInterceptors([    // the order counts - the first interceptor will be the first to see the request and the last to see the response
          loadingUiInterceptor,   // this will put up the loading spinner for every API call back to the server. If we want to do some background work, remove this and use the LoadingService directly on each call
          authInterceptor,
          globalErrorInterceptor
        ]),
        withFetch()
      ),
      importProvidersFrom(
        BrowserAnimationsModule,
      )
    ],
    {
      provide: APP_INITIALIZER,
      deps: [
        AppConfigService
      ],
      useFactory: (service: AppConfigService) => () => service.load(),  // we are setting the function here - not running it
      multi: true
    }
  ],
};

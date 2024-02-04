import { HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, switchMap } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  if (authService.shouldRefreshAccesssToken) {
    return authService.refreshAccessToken$().pipe(
      switchMap((username) => {
        if (username) {
          return attachAccessToken$(req, next, authService.accessToken);
        } else {
          // we tried - don't add a header and let the error handling deal with it
          return next(req);
        }
      })
    );
  } else {
    return attachAccessToken$(req, next, authService.accessToken);
  }
};

function attachAccessToken$(req: HttpRequest<unknown>, next: HttpHandlerFn, accessToken: string | undefined): Observable<HttpEvent<unknown>> {
  if (accessToken !== undefined) {
    const cloned = req.clone({
      headers: req.headers.set("Authorization",
        "Bearer " + accessToken)
    });
    return next(cloned);
  } else {
    // no tokens - could be a public route
    return next(req);
  }
}

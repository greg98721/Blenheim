import { HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, switchMap } from 'rxjs';
import { UserService } from '../../user/services/user.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const userService = inject(UserService);
  if (userService.shouldRefreshAccesssToken) {
    return userService.refreshAccessToken$().pipe(
      switchMap((username) => {
        if (username) {
          return attachAccessToken$(req, next, userService.accessToken);
        } else {
          // we tried - don't add a header and let the error handling deal with it
          return next(req);
        }
      })
    );
  } else {
    return attachAccessToken$(req, next, userService.accessToken);
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

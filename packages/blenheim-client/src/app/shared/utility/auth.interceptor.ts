import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { UserService } from '../../user/data-access/user.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const userService = inject(UserService);
  const idToken = userService.accessToken

  if (idToken) {
    const cloned = req.clone({
      headers: req.headers.set("Authorization",
        "Bearer " + idToken)
    });

    return next(cloned);
  }
  else {
    return next(req);
  }
};

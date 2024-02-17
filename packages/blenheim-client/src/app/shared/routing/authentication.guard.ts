import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";
import { Observable, map, of } from "rxjs";
import { UserService } from "../../user/services/user.service";

export function isAuthenticated$(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
  const userService = inject(UserService);
  if (userService.isAuthenticated) {
    return of(true);
  } else {
    return userService.login$();
  }
}

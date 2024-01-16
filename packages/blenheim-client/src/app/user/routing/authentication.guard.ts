import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";
import { map, Observable, of } from "rxjs";
import { UserService } from "../data-access/user.service";

export function isAuthenticated$(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
  const userService = inject(UserService);
  if (userService.currentUser) {
    return of(true);
  } else {
    return userService.login$().pipe(
      map(r => r !== undefined)
    );
  }
}

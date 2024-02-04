import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";
import { Observable, map, of } from "rxjs";
import { AuthService } from "../services/auth.service";

export function isAuthenticated$(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
  const authService = inject(AuthService);
  if (authService.isAuthenticated) {
    return of(true);
  } else {
    return authService.login$();
  }
}

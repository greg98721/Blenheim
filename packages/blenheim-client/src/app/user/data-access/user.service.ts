import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { User } from '@blenheim/model';
import { AppConfigService } from '../../shared/services/app-config.service';
import { Observable, catchError, map, of, switchMap, tap } from 'rxjs';
import { LoginDialogComponent } from '../ui/login-dialog/login-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private _currentUser?: User;
  private _accessToken?: string;

  private _http = inject(HttpClient);
  private _config = inject(AppConfigService);

  login$() : Observable<User | undefined> {
    const dialog = inject(MatDialog);
    return this._recursivelogin$(dialog);
  }

  get currentUser(): User | undefined {
    return this._currentUser;
  }

  get accessToken(): string | undefined {
    return this._accessToken;
  }

  private _recursivelogin$(dialog: MatDialog, username?: string, message?: string): Observable<User | undefined> {
    const dialogRef = dialog.open(LoginDialogComponent, { data: { username: username, message: message }});
    return dialogRef.afterClosed().pipe(
      map((result: { username: string; password: string } | undefined) => {
        return result
      }),
      switchMap(loginDetails => {
        if (loginDetails) {
          const loginUrl = this._config.apiUrl('api/auth/login');
          const loginBody = { username: loginDetails.username, password: loginDetails.password };
          return this._http.post(loginUrl, loginBody).pipe(
            tap((response: any) => {
              this._accessToken = response.access_token;
            }),
            switchMap((loginResponse: any) => {
              const userUrl = this._config.apiUrl(`api/auth/user/${loginDetails.username}`);
              return this._http.get(userUrl).pipe(
                map((userResponse: any) => {
                  return userResponse as User;
                }),
                tap((user: User) => {
                  this._currentUser = user;
                })
              );
            }),
            catchError((error: any) => {
              // we could not authenticate this user - put up the login dialog again with the error message
              return this._recursivelogin$(dialog, loginDetails.username, 'Invalid username or password');
            })
          );
        } else {    // the user cancelled the login dialog
          return of(undefined);
        }
      })
    );
  }
}

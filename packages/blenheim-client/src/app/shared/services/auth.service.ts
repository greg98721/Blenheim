import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { AppConfigService } from '../../shared/services/app-config.service';
import { Observable, catchError, map, of, switchMap, tap } from 'rxjs';
import { LoginDialogComponent } from '../../shared/components/login-dialog/login-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { UserService } from '../../user/services/user.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private _http = inject(HttpClient);
  private _config = inject(AppConfigService);
  private _dialog = inject(MatDialog);
  private _userService = inject(UserService);

  private _accessToken?: string;
  private _accessTokenExpires?: Date;
  private _isAuthenticated = false;

  login$(): Observable<boolean> {
    // before putting up the login dialog, see if we can use the refresh token first
    const refreshToken = sessionStorage.getItem('refresh_token');
    if (refreshToken) {
      return this.refreshAccessToken$();
    } else {
      return this._recursivelogin$();
    }
  }

  refreshAccessToken$(): Observable<boolean> {
    const refreshToken = sessionStorage.getItem('refresh_token');
    const username = sessionStorage.getItem('username');
    if (refreshToken && username) {
      const refreshUrl = this._config.apiUrl('api/auth/refresh');
      const refreshBody = { refreshToken: refreshToken };
      return this._http.post(refreshUrl, refreshBody).pipe(
        tap((response: any) => {
          this._handleAccessResponse(username, response);
        }),
        switchMap((loginResponse: any) => {
          // because the user could have changed their username we need to get the user data again
          return this._userService.getUser$(username).pipe(
            map(() => true),
          )
        }),
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401) {
            // the probable cause is that the refresh token has expired - so we need to login again
            return this._recursivelogin$();
          } else {
            this._isAuthenticated = false;
            throw new TypeError(`Could not refresh access token: ${error.message}`);
          }
        })
      );
    } else {
      this._isAuthenticated = false;
      throw new TypeError('No refresh token available to refress access token');
    }
  }

  get isAuthenticated(): boolean {
    return this._isAuthenticated;
  }

  get accessToken(): string | undefined {
    return this._accessToken;
  }

  /** Rather than rely on failed calls to the server be premptive about refreshing the access token */
  get shouldRefreshAccesssToken(): boolean {
    return this._accessToken !== undefined && this._accessTokenExpires !== undefined && this._accessTokenExpires <= new Date();
  }

  // return the username as we have no idea what the user typed into the dialog
  private _recursivelogin$(username?: string, message?: string): Observable<boolean> {
    const dialogRef = this._dialog.open(LoginDialogComponent, { data: { username: username, message: message } });
    return dialogRef.afterClosed().pipe(
      switchMap(loginDetails => {
        if (loginDetails) {
          const loginUrl = this._config.apiUrl('api/auth/login');
          const loginBody = { username: loginDetails.username, password: loginDetails.password };
          return this._http.post(loginUrl, loginBody).pipe(
            tap((response: any) => {
              this._handleAccessResponse(loginDetails.username, response);
            }),
            switchMap((loginResponse: any) => {
              // because the user could have changed their username we need to get the user data again
              return this._userService.getUser$(loginDetails.username).pipe(
                map((user) => (user !== undefined))
              )
            }),
            catchError((error: any) => {
              // we could not authenticate this user - put up the login dialog again with the error message
              return this._recursivelogin$(loginDetails.username, 'Invalid username or password');
            })
          );
        } else {    // the user cancelled the login dialog
          this._isAuthenticated = false;
          return of(false);
        }
      })
    );
  }

  private _handleAccessResponse(username: string, response: any) {
    this._accessToken = response.access_token;
    this._accessTokenExpires = new Date(Date.now() + response.access_token_expiry * 1000 - 10000);  // 10 seconds before it expires as a buffer
    sessionStorage.setItem('username', username);
    sessionStorage.setItem('refresh_token', response.refresh_token);
    this._isAuthenticated = true;
  }

}

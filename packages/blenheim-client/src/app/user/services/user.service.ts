import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { User } from '@blenheim/model';
import { AppConfigService } from '../../shared/services/app-config.service';
import { Observable, catchError, map, of, switchMap, tap } from 'rxjs';
import { ToolbarService } from '../../shared/services/toolbar.service';
import { MatDialog } from '@angular/material/dialog';
import { LoginDialogComponent } from '../../shared/components/login-dialog/login-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private _toolbarService = inject(ToolbarService);
  private _currentUser = signal<User | undefined>(undefined);

  private _http = inject(HttpClient);
  private _dialog = inject(MatDialog);
  private _config = inject(AppConfigService);

  private _accessToken?: string;
  private _accessTokenExpires?: Date;
  private _isAuthenticated = false;

  get currentUser() {
    return this._currentUser;
  }

  getUser$(username: string): Observable<User | undefined> {
    const userUrl = this._config.apiUrl(`api/users/${username}`);
    return this._http.get(userUrl).pipe(
      map((userResponse: any) => {
        return userResponse as User;
      }),
      tap((user: User) => {
        this._currentUser.set(user);
        this._toolbarService.userName.set({ first: user.firstName, last: user.lastName });
      }),
      catchError(() =>of(undefined))
    );
  }

  createUser$(user: User, password: string): Observable<boolean> {
    const userUrl = this._config.apiUrl('api/users');
    const body = { user, password };
    return this._http.post(userUrl, body).pipe(
      tap(() => {
        this._currentUser.set(user);
        this._toolbarService.userName.set({ first: user.firstName, last: user.lastName });
      }),
      map((response: any) => {
        this._handleAccessResponse(user.username, response);
        return true;
      }),
      catchError(() =>of(false))
    );
  }

  updateUser$(user: User): Observable<User> {
    const userUrl = this._config.apiUrl('api/users');
    return this._http.patch(userUrl, user).pipe(
      map(() => user),
      tap((user: User) => {
        this._currentUser.set(user);
        this._toolbarService.userName.set({ first: user.firstName, last: user.lastName });
      }),
      catchError(() =>of(user))
    );
  }

  updatePassword$(username: string, password: string): Observable<boolean> {
    const userUrl = this._config.apiUrl('api/users/password');
    const body = { username, password };
    return this._http.patch(userUrl, body).pipe(
      map(() => true),
      catchError(() =>of(false))
    );
  }

  deleteUser$(username: string): Observable<boolean> {
    const userUrl = this._config.apiUrl(`api/users/${username}`);
    return this._http.delete(userUrl).pipe(
      tap(() => {
        this._toolbarService.userName.set(undefined);
      }),
      map(() => true),
      catchError(() =>of(false))
    );
  }


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
          return this.getUser$(username).pipe(
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
              return this.getUser$(loginDetails.username).pipe(
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

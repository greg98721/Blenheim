import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { User } from '@blenheim/model';
import { AppConfigService } from '../../shared/services/app-config.service';
import { Observable, catchError, map, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private _currentUser = signal<User | undefined>(undefined);

  private _http = inject(HttpClient);
  private _config = inject(AppConfigService);

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
      }),
      catchError(() =>of(undefined))
    );
  }

  createUser$(user: User, password: string): Observable<User> {
    const userUrl = this._config.apiUrl('api/users');
    const body = { user, password };
    return this._http.post(userUrl, body).pipe(
      map(() => user),
      catchError(() =>of(user))
    );
  }

  updateUser$(user: User): Observable<User> {
    const userUrl = this._config.apiUrl('api/users');
    return this._http.patch(userUrl, user).pipe(
      map(() => user),
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
      map(() => true),
      catchError(() =>of(false))
    );
  }
}

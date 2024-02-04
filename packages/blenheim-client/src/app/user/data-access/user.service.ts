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

  getUserData$(username: string): Observable<User | undefined> {
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
}

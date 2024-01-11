import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class AppConfigService {

  constructor() { }

  private _apiUrl?: string = undefined;
  private _http = inject(HttpClient);

  load() {
    // We want to load the config before anything else happens, which is done via an APP_INITIALIZER in
    // the bootstrap function in main.ts. However this will only work synchronously if we return a promise
    // hence calling firstValueFrom which converts the observable from the get into a promise
    return firstValueFrom(this._http.get('assets/appsettings.json'))
      .then((settings: any) => {
        this._apiUrl = settings.apiUrl;
      });
  }

  apiUrl(route: string): string {
    if (this._apiUrl) {
      return `${this._apiUrl}${route}`;
    } else {
      // this is unlikely to happen as we load the config synchronouly at startup
      throw new Error('Trying to read api url before we have loaded the config');
    }
  }
}

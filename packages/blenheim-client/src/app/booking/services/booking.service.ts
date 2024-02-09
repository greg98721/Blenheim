import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { AppConfigService } from '../../shared/services/app-config.service';
import { Observable, catchError, map } from 'rxjs';
import { FlightBooking } from '@blenheim/model';

@Injectable({
  providedIn: 'root'
})
export class BookingService {

  private _http = inject(HttpClient);
  private _config = inject(AppConfigService);

  makeTheBooking$(booking: FlightBooking): Observable<boolean> {
    const url = this._config.apiUrl('api/bookings');
    const body = booking;
    return this._http.post(url, body).pipe(
      map((_: any) => true),
      catchError((error: HttpErrorResponse) => {
          throw new TypeError(`Could not create booking: ${error.message}`);
      })
    );
  }
}

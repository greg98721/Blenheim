import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { Airport, AirRoute, cityName, Flight, isAirport, TimetableFlight } from '@blenheim/model';
import { Observable, map } from 'rxjs';
import { AppConfigService } from '../../shared/services/app-config.service';
import { uniqueObjects } from '../../shared/utility/useful-functions';

@Injectable({
  providedIn: 'root'
})
export class FlightService {

  private _http = inject(HttpClient);
  private _config = inject(AppConfigService);

  getOrigins$(): Observable<Airport[]> {
    const url = this._config.apiUrl('api/routes');
    return this._http.get(url).pipe(
      map(response => {
        const rawList = response as string[];
        if (rawList.every(isAirport)) { // this is mainly to catch the server and client being out of synch in list of airports
          const sorted = rawList.sort((a, b) => cityName(a).localeCompare(cityName(b)));  // we will want to display this sorted each time
          return sorted as Airport[];
        } else {
          throw new TypeError('Invalid airport in getting list of origins from server');
        }
      })
      // we have proper http error handling higher up the stack - for here we can ignore it
    )
  }

  getTimetable$(origin: Airport): Observable<{ origin: Airport; timetable: TimetableFlight[] }> {
    const url = this._config.apiUrl(`api/routes/timetable/${origin}`);
    return this._http.get(url).pipe(
      map(response => {
        const rawList = response as any[];
        if (rawList.every(t => isAirport(t.route.destination) && isAirport(t.route.origin))) {
          // this is mainly to catch the server and client being out of synch in list of airports
          const timetable = rawList as TimetableFlight[];
          return { origin: origin, timetable: timetable };
        } else {
          throw new TypeError(`Invalid airport in getting list of timetables for ${origin} from server`);
        }
      })
      // we have proper http error handling higher up the stack - for here we can ignore it
    )
  }

  /** From all the timetables select the unique list of destinations */
  getDestinations$(origin: Airport): Observable<AirRoute[]> {
    return this.getTimetable$(origin).pipe(
      map(data => {
        if (data.timetable.length > 0) {
          // get the unique destinations
          const unique = uniqueObjects<AirRoute>(data.timetable.map(t => t.route));
          return unique.sort((a, b) => cityName(a.destination).localeCompare(cityName(b.destination)));
        } else {
          throw Error('Should never get here as we have checked we had an origin for _getDestinations')
        }
      })
    );
  }

  getTimetableFlight$(flightNumber: string, dateOfFlight: string): Observable<{ timetableFlight: TimetableFlight, flight: Flight }> {
    const url = this._config.apiUrl(`api/flights/toBook/${flightNumber}/${dateOfFlight}`);
    return this._http.get(url).pipe(
      map(response => {
        return response as { timetableFlight: TimetableFlight, flight: Flight };
      })
      // we have proper http error handling higher up the stack - for here we can ignore it
    )
  }

  getFlights$(origin: string, destination: string): Observable<{ timetableFlight: TimetableFlight; flights: Flight[] }[]> {
    const url = this._config.apiUrl(`api/flights?origin=${origin}&dest=${destination}`);
    return this._http.get(url).pipe(
      map(response => {
        const flights = response as { timetableFlight: TimetableFlight; flights: Flight[] }[];
        if (flights.every(t => isAirport(t.timetableFlight.route.destination) && isAirport(t.timetableFlight.route.origin))) {
          // this is mainly to catch the server and client being out of synch in list of airports
          return flights;
        } else {
          throw new TypeError(`Invalid airport in getting list of timetables for ${origin} from server`);
        }
      })
      // we have proper http error handling higher up the stack - for here we can ignore it
    )
  }
}

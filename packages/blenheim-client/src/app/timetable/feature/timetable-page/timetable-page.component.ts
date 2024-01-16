import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';

import { Airport, TimetableFlight, cityName } from '@blenheim/model';
import { WeekDisplayComponent } from '../../../shared/ui/week-display/week-display.component';
import { MinutePipe } from '../../../shared/pipes/minute.pipe';
import { CityNamePipe } from '../../../shared/pipes/city-name.pipe';
import { FlightService } from '../../data-access/flight.service';
import { LoadingService } from '../../../shared/services/loading.service';
import { map } from 'rxjs';

@Component({
  selector: 'app-timetable-page',
  standalone: true,
  imports: [CommonModule, WeekDisplayComponent, RouterModule, MinutePipe, CityNamePipe],
  templateUrl: './timetable-page.component.html',
  styleUrl: './timetable-page.component.scss'
})
export class TimetablePageComponent implements OnInit {
  private _flightService = inject(FlightService);
  private _loadingService = inject(LoadingService);

  @Input() origin?: Airport;

  originCode = signal<Airport | undefined>(undefined);
  timetables = signal<{ destination: Airport, destinationTimetables: TimetableFlight[] }[]>([]);

  ngOnInit(): void {
    this.originCode.set(this.origin);
    this._loadingService.setLoadingWhile$(this._flightService.getTimetable$(this.origin as Airport).pipe(
      map(r => {
        // get the unique destinations
        const allDestinations = r.timetable.map(t => t.route.destination);
        const uniqueDestinations = [...new Set(allDestinations)];
        const sortedDestinations = uniqueDestinations.sort((a, b) => cityName(a).localeCompare(cityName(b)));

        const perDestinations = sortedDestinations.map(dest => {
          const s = r.timetable.filter(t => t.route.destination === dest).sort((a, b) => a.departs >= b.departs ? 1 : -1);
          return { destination: dest, destinationTimetables: s };
        }).sort((a, b) => cityName(a.destination).localeCompare(cityName(b.destination)));
        return perDestinations;
      }
      ))).subscribe(t => {
        this.timetables.set(t);
      });
  }
}

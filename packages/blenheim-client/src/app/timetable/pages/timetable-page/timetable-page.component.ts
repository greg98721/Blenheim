import { CommonModule } from '@angular/common';
import { Component, Input, signal } from '@angular/core';
import { RouterModule } from '@angular/router';

import { Airport, TimetableFlight } from '@blenheim/model';
import { WeekDisplayComponent } from '../../../shared/components/week-display/week-display.component';
import { MinutePipe } from '../../../shared/pipes/minute.pipe';
import { CityNamePipe } from '../../../shared/pipes/city-name.pipe';
import { AirportWithTimetables } from '../../model/airport-with-timetables';

@Component({
  selector: 'app-timetable-page',
  standalone: true,
  imports: [CommonModule, WeekDisplayComponent, RouterModule, MinutePipe, CityNamePipe],
  templateUrl: './timetable-page.component.html',
  styleUrl: './timetable-page.component.scss'
})
export class TimetablePageComponent {

  originCode = signal<Airport | undefined>(undefined);
  timetableList = signal<AirportWithTimetables[] | undefined>([]);

  // Note when we change this page from one origin to another, the page instance does not change but the inputs will be updated which is why we use a setter to update the signals

  // In the application configuration we set withComponentInputBinding() so that we can use @Input() in pull in the route parameter
  @Input() set origin(o: Airport) {
    this.originCode.set(o);
  }

  // The route to this page includes a resolver that gets the timetable data from the server. We use @Input() to pull in that data
  @Input() set timetables(t: AirportWithTimetables[]) {
    this.timetableList.set(t);
  }
}

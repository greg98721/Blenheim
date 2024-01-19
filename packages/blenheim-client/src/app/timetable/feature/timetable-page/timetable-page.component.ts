import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router';

import { Airport, TimetableFlight } from '@blenheim/model';
import { WeekDisplayComponent } from '../../../shared/ui/week-display/week-display.component';
import { MinutePipe } from '../../../shared/pipes/minute.pipe';
import { CityNamePipe } from '../../../shared/pipes/city-name.pipe';

@Component({
  selector: 'app-timetable-page',
  standalone: true,
  imports: [CommonModule, WeekDisplayComponent, RouterModule, MinutePipe, CityNamePipe],
  templateUrl: './timetable-page.component.html',
  styleUrl: './timetable-page.component.scss'
})
export class TimetablePageComponent {

  originCode = signal<Airport | undefined>(undefined);
  timetableList = signal<{ destination: Airport, destinationTimetables: TimetableFlight[] }[] | undefined>([]);

  @Input() set origin(o: Airport) {
    this.originCode.set(o);
  }

  @Input() set timetables(t: { destination: Airport, destinationTimetables: TimetableFlight[] }[]) {
    this.timetableList.set(t);
  }
}

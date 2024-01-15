import { Routes } from '@angular/router';
import { HomePageComponent } from './feature/home-page/home-page.component';
import { TIMETABLE_ROUTES } from './timetable/routing/timetable.routes';

export const routes: Routes = [
  { path: '', component: HomePageComponent },
  ...TIMETABLE_ROUTES,
];

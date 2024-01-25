import { Routes } from '@angular/router';
import { HomePageComponent } from './feature/home-page/home-page.component';
import { TIMETABLE_ROUTES } from './timetable/routing/timetable.routes';
import { BOOKING_ROUTES } from './booking/routing/booking.routes';

export const routes: Routes = [
  { path: '', component: HomePageComponent },
  ...TIMETABLE_ROUTES,
  ...BOOKING_ROUTES,
];

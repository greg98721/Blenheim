import { Routes } from '@angular/router';
import { HomePageComponent } from './home/pages/home-page/home-page.component';
import { TIMETABLE_ROUTES } from './timetable/routing/timetable.routes';
import { BOOKING_ROUTES } from './booking/routing/booking.routes';
import { USER_ROUTES } from './user/routing/user-routes';

export const routes: Routes = [
  { path: '', component: HomePageComponent },
  ...TIMETABLE_ROUTES,
  ...BOOKING_ROUTES,
  ...USER_ROUTES,
];

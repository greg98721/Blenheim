import { Routes } from '@angular/router';
import { isAuthenticated$ } from '../../shared/routing/authentication.guard';
import { MakeBookingComponent } from '../feature/make-booking/make-booking.component';


export const BOOKING_ROUTES: Routes = [
  { path: 'booking/:stateIndex', component: MakeBookingComponent, canActivate: [isAuthenticated$]},
];

import { Routes } from '@angular/router';
import { UserPageComponent } from '../pages/user-page/user-page.component';
import { UserEditPageComponent } from '../pages/user-edit-page/user-edit-page.component';
import { resolveUserBookings } from './user.resolver';
import { UserCreatePageComponent } from '../pages/user-create-page/user-create-page.component';

export const USER_ROUTES: Routes = [
  { path: 'user', component: UserPageComponent, resolve: { bookings: resolveUserBookings } },
  { path: 'user/edit', component: UserEditPageComponent },
  { path: 'user/create', component: UserCreatePageComponent },
];

import { Routes } from '@angular/router';
import { UserPageComponent } from '../components/user-page/user-page.component';
import { UserEditPageComponent } from '../components/user-edit-page/user-edit-page.component';

export const USER_ROUTES: Routes = [
  { path: 'user', component: UserPageComponent },
  { path: 'user/edit', component: UserEditPageComponent },
];

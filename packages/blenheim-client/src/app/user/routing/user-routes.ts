import { Routes } from '@angular/router';
import { UserPageComponent } from '../pages/user-page/user-page.component';
import { UserEditPageComponent } from '../pages/user-edit-page/user-edit-page.component';

export const USER_ROUTES: Routes = [
  { path: 'user', component: UserPageComponent },
  { path: 'user/edit', component: UserEditPageComponent },
];

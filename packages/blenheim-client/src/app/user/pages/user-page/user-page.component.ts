import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { UserService } from '../../services/user.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterModule } from '@angular/router';
import { format, parseISO } from 'date-fns';

@Component({
  selector: 'app-user-page',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './user-page.component.html',
  styleUrl: './user-page.component.scss'
})
export class UserPageComponent {
  private _userService = inject(UserService);
  private _router = inject(Router);
  currentUser = this._userService.currentUser;
  dateOfBirth = computed(() => {
    const u = this.currentUser();
    if (u) {
      const d = parseISO(u.birthDate);
      return format(d, 'P');
    } else {
      return '';
    }
  });
  editTheUser() {
    this._router.navigate(['/user/edit']);
  }
}

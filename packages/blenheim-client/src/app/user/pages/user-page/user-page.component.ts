import { CommonModule } from '@angular/common';
import { Component, input, computed, inject, signal } from '@angular/core';
import { UserService } from '../../services/user.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterModule } from '@angular/router';
import { format, parseISO } from 'date-fns';
import { FlightBooking } from '@blenheim/model';
import { CityNamePipe } from '../../../shared/pipes/city-name.pipe';
import { MinutePipe } from '../../../shared/pipes/minute.pipe';

@Component({
  selector: 'app-user-page',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule, MatTooltipModule, CityNamePipe, MinutePipe],
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

  // The route to this page includes a resolver that gets the bookings from the server. We use input to pull in that data
  bookings = input.required<FlightBooking[]>();

  editTheUser() {
    this._router.navigate(['/user/edit']);
  }

  addBooking() {
    this._router.navigate(['/booking/0']);
  }
}

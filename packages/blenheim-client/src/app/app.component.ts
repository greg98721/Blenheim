import { Component, computed, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { setDefaultOptions } from 'date-fns';
import { enNZ } from 'date-fns/locale'
import { LoadingService } from './shared/services/loading.service';
import { LoadingOverlayComponent } from './shared/components/loading-overlay/loading-overlay.component';
import { ToolbarService } from './shared/services/toolbar.service';
import { UserService } from './user/services/user.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet, LoadingOverlayComponent, MatToolbarModule, MatButtonModule, MatIconModule, MatMenuModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  private _loadingService = inject(LoadingService);
  private _toolbarService = inject(ToolbarService);
  private _router = inject(Router);

  // As a general rule - use signals for databinding and observables for services so we keep the power to combine or filter them for whatever reason
  // Also we only want to call toSignal once per observable, so we store the result in a private field
  private _isLoading = this._loadingService.isLoading;

  title = 'Marlborough';

  firstName = computed<string>(() => this._toolbarService.userName()?.first ?? '');
  lastName = computed<string>(() => this._toolbarService.userName()?.last ?? '');
  loggedIn = computed<boolean>(() => this._toolbarService.userName() !== undefined);

  constructor() {
    setDefaultOptions({ locale: enNZ });
  }

  get isLoading() {
    return this._isLoading;
  }

  returnToHome() {
    this._router.navigate(['/']);
  }

  goToDestinations() {
    this._router.navigate(['/destinations']);
  }

  makeABooking() {
    this._router.navigate(['/booking/0']);
  }

  goToUserDetails() {
    this._router.navigate(['/user']);
  }
}

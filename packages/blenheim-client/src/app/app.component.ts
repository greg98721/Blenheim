import { Component, inject } from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { LoadingService } from './shared/services/loading.service';
import { LoadingOverlayComponent } from './shared/components/loading-overlay/loading-overlay.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet, LoadingOverlayComponent, MatToolbarModule, MatButtonModule, MatIconModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  private _loadingService = inject(LoadingService);
  private _router = inject(Router);

  // As a general rule - use signals for databinding and observables for services so we keep the power to combine or filter them for whatever reason
  // Also we only want to call toSignal once per observable, so we store the result in a private field
  private _isLoading = this._loadingService.isLoading;

  title = 'Marlborough';

  get isLoading() {
    return this._isLoading;
  }

  returnToHome() {
    this._router.navigate(['/']);
  }
}

import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { LoadingService } from './shared/services/loading.service';
import { LoadingOverlayComponent } from './shared/ui/loading-overlay/loading-overlay.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, LoadingOverlayComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  private _loadingService = inject(LoadingService);
  // As a general rule - use signals for databinding and observables for services so we keep the power to combine or filter them for whatever reason
  // Also we only want to call toSignal once per observable, so we store the result in a private field
  private _isLoading = toSignal(this._loadingService.isLoading$);

  title = 'Marlborough';

  get isLoading() {
    return this._isLoading;
  }
}

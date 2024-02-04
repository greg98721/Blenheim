import { Component, OnDestroy } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-loading-overlay',
  standalone: true,
  imports: [MatProgressSpinnerModule],
  templateUrl: './loading-overlay.component.html',
  styleUrl: './loading-overlay.component.scss'
})
export class LoadingOverlayComponent implements OnDestroy {
  _destroyed$ = new Subject<void>();
  spinnerDiameter = 40;
  spinnerStroke = 4;

  // Create a map to display breakpoint names for demonstration purposes.
  spinnerSizeMap = new Map([
    [Breakpoints.XSmall, 100],
    [Breakpoints.Small, 150],
    [Breakpoints.Medium, 200],
    [Breakpoints.Large, 300],
    [Breakpoints.XLarge, 400],
  ]);

  constructor(_breakpointObserver: BreakpointObserver) {
    _breakpointObserver
      .observe([
        Breakpoints.XSmall,
        Breakpoints.Small,
        Breakpoints.Medium,
        Breakpoints.Large,
        Breakpoints.XLarge,
      ])
      .pipe(takeUntil(this._destroyed$))
      .subscribe(result => {
        for (const query of Object.keys(result.breakpoints)) {
          if (result.breakpoints[query]) {
            const d = this.spinnerSizeMap.get(query) ?? 100;
            this.spinnerDiameter = d;
            this.spinnerStroke = Math.sqrt(d);
          }
        }
      });
  }

  ngOnDestroy(): void {
    this._destroyed$.next();
    this._destroyed$.complete();
  }

}

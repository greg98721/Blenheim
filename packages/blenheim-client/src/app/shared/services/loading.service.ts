import { Injectable, WritableSignal, signal } from '@angular/core';
import { Observable, of, tap, switchMap, delay, finalize } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {

  private _isLoading = signal(false);
  private _count = 0;

  setLoadingWhile$<T>(action$: Observable<T>): Observable<T> {
    return of(null).pipe(
      delay(0), // this gives Angular a chance to get itself in order and avoids the "Expression has changed after it was checked" error
      tap(() => this.startLoading()),
      switchMap(() => action$),
      finalize(() => this.endLoading())
    )
  }

  get isLoading(): WritableSignal<boolean> {
    return this._isLoading;
  }

  startLoading() {
    this._isLoading.set(true);
    this._count++;
  }

  endLoading() {
    if (--this._count <= 0) {
      this._isLoading.set(false);
    }
  }
}

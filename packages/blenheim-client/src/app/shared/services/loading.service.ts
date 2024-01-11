import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, tap, switchMap, delay } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {

  private _isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private _count = 0;

  setLoadingWhile$<T>(action$: Observable<T>): Observable<T> {
    return of(null).pipe(
      delay(0), // this gives Angular a chance to get itself in order and avoids the "Expression has changed after it was checked" error
      tap(() => this.startLoading()),
      switchMap(() => action$),
      tap({
        next: () => this.endLoading(),
        error: () => this.endLoading()
      })
    )
  }

  get isLoading$(): Observable<boolean> {
    return this._isLoading$;
  }

  private startLoading() {
    this._isLoading$.next(true);
    this._count++;
  }

  private endLoading() {
    if (--this._count <= 0) {
      this._isLoading$.next(false);
    }
  }
}

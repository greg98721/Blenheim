import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, retry, timer } from 'rxjs';

@Injectable()
export class GlobalHttpErrorHandler implements HttpInterceptor {

  /** Only want to rety requets when we receive a server error. Any other response - the server understood the request and rejected it for a good reason */
  shouldRetry(error: HttpErrorResponse, retryCount: number) {
    if (error.status >= 500) {
      console.log(`HTTP Server Error: retry: ${retryCount}`)
      return timer(retryCount * 1000);// 1 second delay then 2, then 3
    } else {
      console.log(`Some other HTTP Error: ${error.status}`)
      throw error;  // this is counter-intuitive - throw an error when we don't want to retry
    }
  }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      retry({
        count: 3,
        delay: (error, retryCount) => this.shouldRetry(error, retryCount)
      })
    );
  }
}

import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { retry, timer } from 'rxjs';

/** This interceptor will retry requests that fail due to server errors. */
export const globalErrorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    retry({
      count: 3,
      delay: (error, retryCount) => shouldRetry(error, retryCount)
    })
  );
};

/** Only want to rety requets when we receive a server error. Any other response - the server understood the request and rejected it for a good reason */
function shouldRetry(error: HttpErrorResponse, retryCount: number) {
  if (error.status >= 500) {
    console.log(`HTTP Server Error: retry: ${retryCount}`)
    return timer(retryCount * 1000);// 1 second delay then 2, then 3
  } else {
    console.log(`Some other HTTP Error: ${error.status}`)
    throw error;  // this is counter-intuitive - throw an error when we don't want to retry
  }
}

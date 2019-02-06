import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AuthService } from '@app/core/services';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(catchError(err => {
      if ((err instanceof HttpErrorResponse) && (err.status === 401)) {
        // auto logout if 401 response returned from api
        this.authService.logout();

        // if not at the login or forgot password page then reload the page
        if ((location.pathname !== '/login') && (location.pathname !== '/forgot')) {
          location.reload();
        }
      }

      return throwError(err);
    }));
  }
}

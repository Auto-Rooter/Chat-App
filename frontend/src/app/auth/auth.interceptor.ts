import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { catchError, Observable, switchMap, throwError } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {};

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();
    let clonedRequest = req;
    if(token){
      clonedRequest = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`),
        withCredentials: true
      });
    }
    return next.handle(clonedRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        // Token expired, need a refresh
        if(error.status === 401 && !req.url.endsWith('/auth/refresh')){
          return this.authService.refreshToken().pipe(
            switchMap(() => {
              const refreshedToken = this.authService.getToken();
              const retryRequest = req.clone({
                headers: req.headers.set('Authorization', `Bearer ${refreshedToken}`),
                withCredentials: true
              });
              return next.handle(retryRequest);
            }),
            catchError((refreshError: HttpErrorResponse) => {
              this.authService.logout();
              return throwError(refreshError);
            })
          )
        } else{
          return throwError(error);
        }
      })
    );
  }
}

import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { getTokenFromStorage, removeTokenFromStorage } from '../util/localStorageUtil';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private router: Router) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = getTokenFromStorage();
    
    if (token && this.isApiRequest(request.url)) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          removeTokenFromStorage();
          this.router.navigate(['/login']);
        }
        
        return throwError(() => error);
      })
    );
  }

  /**
   * Verifica se a requisição é para a API
   */
  private isApiRequest(url: string): boolean {
    const isApi = url.includes('/api/') || 
           url.includes('localhost:5000') || 
           url.includes('vmimedicaweb.azurewebsites.net') ||
           url.includes('ColumnPreferences') ||
           url.includes('Perfil') ||
           url.includes('Usuario') ||
           url.includes('Acesso') ||
           url.includes('ClientesFornecedores');
    
    return isApi;
  }
}

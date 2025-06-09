import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap, switchMap } from 'rxjs/operators'; // <--- Add switchMap here
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private _isAuthenticated = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this._isAuthenticated.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.checkAuthStatusOnInit();
  }

  // Check authentication status on service initialization
  private checkAuthStatusOnInit(): void {
    const token = localStorage.getItem('authToken');
    if (token) {
      this._isAuthenticated.next(true);
      // Optionally, validate token with backend if needed
      this.getUser().subscribe({
        error: () => {
          this.logoutLocally(); // Token might be invalid or expired
        }
      });
    }
  }

  // Get CSRF cookie before login/register
  private getCsrfCookie(): Observable<any> {
    const baseUrl = this.apiUrl.replace('/api', ''); // Get "http://localhost:8000"
    return this.http.get(`${baseUrl}/sanctum/csrf-cookie`, { withCredentials: true });
  }

  register(credentials: any): Observable<any> {
    return this.getCsrfCookie().pipe(
      tap(() => console.log('CSRF cookie set for registration')),
      catchError(err => {
        console.error('Failed to get CSRF cookie:', err);
        return throwError(() => new Error('Failed to get CSRF cookie'));
      }),
      // Use switchMap to chain the registration HTTP request
      switchMap(() => { // The previous observable's result (csrf cookie) is not needed here, so () =>
        console.log('Sending registration request');
        return this.http.post(`${this.apiUrl}/register`, credentials, { withCredentials: true });
      }),
      tap((response: any) => {
        localStorage.setItem('authToken', response.token);
        this._isAuthenticated.next(true);
        this.router.navigate(['/']);
      }),
      catchError(this.handleError)
    );
  }

  login(credentials: any): Observable<any> {
    return this.getCsrfCookie().pipe(
      tap(() => console.log('CSRF cookie set for login')),
      catchError(err => {
        console.error('Failed to get CSRF cookie:', err);
        return throwError(() => new Error('Failed to get CSRF cookie'));
      }),
      // Use switchMap to chain the login HTTP request
      switchMap(() => { // The previous observable's result (csrf cookie) is not needed here, so () =>
        console.log('Sending login request');
        return this.http.post(`${this.apiUrl}/login`, credentials, { withCredentials: true });
      }),
      tap((response: any) => {
        localStorage.setItem('authToken', response.token);
        this._isAuthenticated.next(true);
        this.router.navigate(['/']);
      }),
      catchError(this.handleError)
    );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true }).pipe(
      tap(() => {
        this.logoutLocally();
      }),
      catchError(this.handleError)
    );
  }

  private logoutLocally(): void {
    localStorage.removeItem('authToken');
    this._isAuthenticated.next(false);
    this.router.navigate(['/login']);
  }

  getUser(): Observable<any> {
    return this.http.get(`${this.apiUrl}/user`, { withCredentials: true }).pipe(
      catchError(this.handleError)
    );
  }

  // This is useful for checking auth status on app load or route guard
  checkAuthStatus(): Observable<any> {
    if (localStorage.getItem('authToken')) {
      return this.getUser().pipe(
        tap(() => this._isAuthenticated.next(true)),
        catchError(err => {
          this.logoutLocally(); // User token invalid
          return throwError(() => err);
        })
      );
    } else {
      this._isAuthenticated.next(false);
      return throwError(() => new Error('No auth token found'));
    }
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('API Error:', error);
    // You might want to display a more user-friendly error message
    return throwError(() => error);
  }
}
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getPosts(page: number = 1): Observable<any> {
    return this.http.get(`${this.apiUrl}/posts?page=${page}`).pipe(
      catchError(this.handleError)
    );
  }

  getPost(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/posts/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  createPost(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/posts`, formData, { withCredentials: true }).pipe(
      catchError(this.handleError)
    );
  }

  updatePost(id: number, formData: FormData): Observable<any> {
    // For PATCH/PUT with FormData, you might need to use POST and method override header
    // However, Laravel can often handle PUT/PATCH with FormData directly.
    // If you encounter issues, consider adding: headers: {'X-HTTP-Method-Override': 'PUT'} or 'PATCH'
    return this.http.post(`${this.apiUrl}/posts/${id}`, formData, { withCredentials: true }).pipe(
      // Add a method override for Laravel to treat POST as PUT/PATCH
      map(res => res), // Just pass through the response
      catchError(this.handleError)
    );
  }
  // Note: For update, if Laravel's default is not handling PUT/PATCH with FormData,
  // you might need to send a POST request with an X-HTTP-Method-Override header.
  // Example for update:
  // updatePost(id: number, formData: FormData): Observable<any> {
  //   formData.append('_method', 'PUT'); // Laravel recognizes this for PUT/PATCH
  //   return this.http.post(`${this.apiUrl}/posts/${id}`, formData, { withCredentials: true }).pipe(
  //     catchError(this.handleError)
  //   );
  // }

  deletePost(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/posts/${id}`, { withCredentials: true }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    console.error('API Error:', error);
    return throwError(() => new Error(error.error?.message || 'An unknown error occurred'));
  }
}
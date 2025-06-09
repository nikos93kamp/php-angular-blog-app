import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs'; // Don't forget this import

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule],
  template: `
    <nav class="bg-gray-800 p-4">
      <div class="container mx-auto flex justify-between items-center">
        <a routerLink="/" class="text-white text-lg font-bold">Blog App</a>
        <div class="space-x-4">
          <a routerLink="/posts" class="text-gray-300 hover:text-white">Posts</a>
          
          <ng-container *ngIf="!(authService.isAuthenticated$ | async)">
            <a routerLink="/login" class="text-gray-300 hover:text-white">Login</a>
            <a routerLink="/register" class="text-gray-300 hover:text-white">Register</a>
          </ng-container>

          <ng-container *ngIf="authService.isAuthenticated$ | async">
            <a routerLink="/posts/create" class="text-gray-300 hover:text-white">Create Post</a>
            <button (click)="logout()" class="text-gray-300 hover:text-white">Logout</button>
          </ng-container>
          
        </div>
      </div>
    </nav>
    <main class="container mx-auto p-4">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: []
})
export class AppComponent implements OnInit {
  constructor(public authService: AuthService) {}

  ngOnInit(): void {
    this.authService.checkAuthStatus().pipe(
      catchError(err => {
        if (err.message !== 'No auth token found') {
          console.warn('Authentication status check failed:', err);
        }
        return of(null); // Return an observable that emits null and completes
      })
    ).subscribe();
  }

  logout(): void {
    this.authService.logout().subscribe(() => {
      // Handle successful logout (e.g., redirect)
    });
  }
}
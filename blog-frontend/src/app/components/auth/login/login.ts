import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth';
import { Router, RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  template: `
    <div class="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
      <h2 class="text-2xl font-bold text-center mb-6">Login</h2>
      <form (ngSubmit)="login()">
        <div class="mb-4">
          <label for="email" class="block text-gray-700 text-sm font-bold mb-2">Email:</label>
          <input type="email" id="email" name="email" [(ngModel)]="credentials.email" required
                 class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
          <p *ngIf="validationErrors.email" class="text-red-500 text-xs italic">{{ validationErrors.email[0] }}</p>
        </div>
        <div class="mb-6">
          <label for="password" class="block text-gray-700 text-sm font-bold mb-2">Password:</label>
          <input type="password" id="password" name="password" [(ngModel)]="credentials.password" required
                 class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline">
          <p *ngIf="validationErrors.password" class="text-red-500 text-xs italic">{{ validationErrors.password[0] }}</p>
        </div>
        <div *ngIf="errorMessage" class="text-red-500 text-sm mb-4">{{ errorMessage }}</div>
        <div class="flex items-center justify-between">
          <button type="submit"
                  class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline cursor-pointer">
            Login
          </button>
          <a routerLink="/register" class="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800">
            Don't have an account? Register
          </a>
        </div>
      </form>
    </div>
  `,
  styles: []
})
export class LoginComponent {
  credentials = { email: '', password: '' };
  errorMessage: string | null = null;
  validationErrors: any = {}; // Object to hold validation errors

  constructor(private authService: AuthService, private router: Router) {}

  login(): void {
    this.errorMessage = null; // Clear previous errors
    this.validationErrors = {}; // Clear previous validation errors
    this.authService.login(this.credentials).subscribe({
      next: () => {
        this.router.navigate(['/posts']);
      },
      error: (error: HttpErrorResponse) => { // Type the error as HttpErrorResponse
        console.error('Login API Error:', error); // Log the full error

        if (error.status === 422 && error.error && error.error.errors) {
          // Laravel sends validation errors in error.error.errors object
          this.validationErrors = error.error.errors;
          this.errorMessage = 'Please fix the errors in the form.'; // Generic message for the user
        } else {
          this.errorMessage = error.message || 'An unknown error occurred during login.';
        }
      }
    });
  }
}
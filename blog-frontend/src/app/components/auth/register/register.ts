import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth';
import { Router, RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  template: `
    <div class="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
      <h2 class="text-2xl font-bold text-center mb-6">Register</h2>
      <form (ngSubmit)="register()">
        <div class="mb-4">
          <label for="name" class="block text-gray-700 text-sm font-bold mb-2">Name:</label>
          <input type="text" id="name" name="name" [(ngModel)]="credentials.name" required
                 class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
          <p *ngIf="validationErrors.name" class="text-red-500 text-xs italic">{{ validationErrors.name[0] }}</p>
        </div>
        <div class="mb-4">
          <label for="email" class="block text-gray-700 text-sm font-bold mb-2">Email:</label>
          <input type="email" id="email" name="email" [(ngModel)]="credentials.email" required
                 class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
          <p *ngIf="validationErrors.email" class="text-red-500 text-xs italic">{{ validationErrors.email[0] }}</p>
        </div>
        <div class="mb-4">
          <label for="password" class="block text-gray-700 text-sm font-bold mb-2">Password:</label>
          <input type="password" id="password" name="password" [(ngModel)]="credentials.password" required
                 class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline">
          <p *ngIf="validationErrors.password" class="text-red-500 text-xs italic">{{ validationErrors.password[0] }}</p>
        </div>
        <div class="mb-6">
          <label for="password_confirmation" class="block text-gray-700 text-sm font-bold mb-2">Confirm Password:</label>
          <input type="password" id="password_confirmation" name="password_confirmation" [(ngModel)]="credentials.password_confirmation" required
                 class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline">
          <p *ngIf="validationErrors.password_confirmation" class="text-red-500 text-xs italic">{{ validationErrors.password_confirmation[0] }}</p>
        </div>
        <div *ngIf="errorMessage" class="text-red-500 text-sm mb-4">{{ errorMessage }}</div>
        <div class="flex items-center justify-between">
          <button type="submit"
                  class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline cursor-pointer">
            Register
          </button>
          <a routerLink="/login" class="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800">
            Already have an account? Login
          </a>
        </div>
      </form>
    </div>
  `,
  styles: []
})
export class RegisterComponent {
  credentials = { name: '', email: '', password: '', password_confirmation: '' };
  errorMessage: string | null = null;
  validationErrors: any = {};

  constructor(private authService: AuthService, private router: Router) {}

  register(): void {
    this.errorMessage = null; // Clear previous errors
    this.validationErrors = {};

    this.authService.register(this.credentials).subscribe({
      next: () => {
        this.router.navigate(['/posts']);
      },
      error: (error: HttpErrorResponse) => { // Type the error as HttpErrorResponse
        
        if (error.status === 422 && error.error && error.error.errors) {
          // Laravel sends validation errors in error.error.errors object
          this.validationErrors = error.error.errors;
          this.errorMessage = 'Please fix the errors in the form.';
        } else {
          this.errorMessage = error.message || 'An unknown error occurred during registration.';
        }
      }
    });
  }
}
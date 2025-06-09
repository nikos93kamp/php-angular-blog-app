import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  template: `
    <div class="text-center p-8 bg-gray-100 rounded-lg shadow-md mt-10">
      <h1 class="text-4xl font-bold text-gray-800 mb-4">Welcome to Our Blog!</h1>
      <p class="text-lg text-gray-600">Discover amazing articles and share your thoughts.</p>
      <div class="mt-6">
        <a routerLink="/posts" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg">
          View All Posts
        </a>
      </div>
    </div>
  `,
  styles: []
})
export class HomeComponent { }
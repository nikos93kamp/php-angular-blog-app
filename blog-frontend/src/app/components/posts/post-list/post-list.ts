// src/app/components/posts/post-list/post-list.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PostService } from '../../../services/post'; // Assuming .service extension
import { HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-post-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container mx-auto p-4">
      <h1 class="text-3xl font-bold text-gray-800 mb-6 text-center">All Posts</h1>

      <div *ngIf="errorMessage" class="text-red-500 text-center mb-4">{{ errorMessage }}</div>

      <div *ngIf="posts.length === 0 && !loading && !errorMessage" class="text-center text-gray-600 mt-10">
        No posts available.
        <a routerLink="/posts/create" class="text-blue-500 hover:underline ml-2">Create one!</a>
      </div>

      <div *ngIf="loading" class="text-center text-gray-600 mt-10">Loading posts...</div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div *ngFor="let post of posts" class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
          <img *ngIf="post.image" [src]="getImageUrl(post.image)" alt="{{ post.title }}" class="w-full h-48 object-cover">
          <div class="p-6">
            <h2 class="text-xl font-semibold text-gray-800 mb-2">{{ post.title }}</h2>
            <p class="text-gray-600 text-sm mb-4">By {{ post.user?.name || 'Unknown User' }}</p>
            <p class="text-gray-700 mb-4 line-clamp-3">{{ post.content }}</p>
            <a routerLink="/posts/{{post.id}}" class="text-blue-500 hover:underline font-medium">Read More</a>
          </div>
        </div>
      </div>

      <!-- Enhanced Pagination Controls -->
      <div *ngIf="lastPage > 1" class="flex justify-center mt-8">
        <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
          <!-- Previous Button -->
          <button (click)="goToPage(currentPage - 1)" [disabled]="currentPage === 1"
                  class="relative inline-flex items-center px-4 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
            <span>Previous</span>
          </button>

          <!-- Page Numbers and Ellipses -->
          <ng-container *ngFor="let page of getPaginationRange()">
            <ng-container *ngIf="page === '...' ">
              <span class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                ...
              </span>
            </ng-container>
            <ng-container *ngIf="page !== '...' ">
              <button (click)="goToPage(page)"
                      [ngClass]="{
                        'z-10 bg-blue-50 border-blue-500 text-blue-600': currentPage === page,
                        'bg-white border-gray-300 text-gray-700 hover:bg-gray-50': currentPage !== page
                      }"
                      class="relative inline-flex items-center px-4 py-2 border text-sm font-medium focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                {{ page }}
              </button>
            </ng-container>
          </ng-container>

          <!-- Next Button -->
          <button (click)="goToPage(currentPage + 1)" [disabled]="currentPage === lastPage"
                  class="relative inline-flex items-center px-4 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
            <span>Next</span>
          </button>
        </nav>
      </div>
    </div>
  `,
  styles: []
})
export class PostListComponent implements OnInit {
  posts: any[] = [];
  errorMessage: string | null = null;
  loading: boolean = true;
  currentPage: number = 1;
  lastPage: number = 1;
  baseUrl: string = environment.apiUrl.replace('/api', '');

  constructor(private postService: PostService) {}

  ngOnInit(): void {
    this.fetchPosts();
  }

  fetchPosts(): void {
    this.loading = true;
    this.errorMessage = null;
    this.postService.getPosts(this.currentPage).subscribe({
      next: (response) => {
        this.posts = response.data;
        this.currentPage = response.current_page;
        this.lastPage = response.last_page;
        this.loading = false;
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error fetching posts:', error);
        this.errorMessage = error.message || 'An unknown error occurred while fetching posts.';
        this.loading = false;
        this.posts = [];
      }
    });
  }

  // Updated method signature to accept number or string
  goToPage(page: number | string): void {
    if (typeof page === 'number' && page >= 1 && page <= this.lastPage) {
      this.currentPage = page;
      this.fetchPosts();
    }
    // If page is '...', do nothing as it's not a clickable page number
  }

  getImageUrl(imagePath: string): string {
    return `${this.baseUrl}/storage/${imagePath}`;
  }

  // Enhanced pagination range calculation with ellipses
  getPaginationRange(): (number | string)[] {
    const totalPages = this.lastPage;
    const currentPage = this.currentPage;
    const pageRange = 2; // How many pages to show around the current page (e.g., 2 means current-2, current-1, current, current+1, current+2)
    const paginationRange: (number | string)[] = [];

    // Always include the first page
    if (totalPages > 0) {
      paginationRange.push(1);
    }

    // Determine start and end of the dynamic range
    let start = Math.max(2, currentPage - pageRange);
    let end = Math.min(totalPages - 1, currentPage + pageRange);

    // Add ellipsis at the beginning if needed
    if (start > 2) {
      paginationRange.push('...');
    }

    // Add dynamic page numbers
    for (let i = start; i <= end; i++) {
      paginationRange.push(i);
    }

    // Add ellipsis at the end if needed
    if (end < totalPages - 1) {
      paginationRange.push('...');
    }

    // Always include the last page if there's more than one page and it's not already included
    if (totalPages > 1 && !paginationRange.includes(totalPages)) {
      paginationRange.push(totalPages);
    }

    // Filter out consecutive ellipses and ensure the first/last pages are not also ellipses
    return paginationRange.filter((value, index, self) => {
      // Remove duplicate ellipses if they appear next to each other
      if (value === '...' && self[index - 1] === '...') {
        return false;
      }
      return true;
    });
  }
}

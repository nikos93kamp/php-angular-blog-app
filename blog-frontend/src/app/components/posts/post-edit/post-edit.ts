// src/app/components/posts/post-edit/post-edit.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PostService } from '../../../services/post';
import { HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-post-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="max-w-xl mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
      <h2 class="text-2xl font-bold text-center mb-6">Edit Post</h2>
      <ng-container *ngIf="postData; else loadingOrError">
        <form (ngSubmit)="updatePost()">
          <div class="mb-4">
            <label for="title" class="block text-gray-700 text-sm font-bold mb-2">Title:</label>
            <input type="text" id="title" name="title" [(ngModel)]="postData.title" required
                   class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
            <p *ngIf="validationErrors.title" class="text-red-500 text-xs italic">{{ validationErrors.title[0] }}</p>
          </div>
          <div class="mb-4">
            <label for="content" class="block text-gray-700 text-sm font-bold mb-2">Content:</label>
            <textarea id="content" name="content" [(ngModel)]="postData.content" required rows="5"
                      class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"></textarea>
            <p *ngIf="validationErrors.content" class="text-red-500 text-xs italic">{{ validationErrors.content[0] }}</p>
          </div>
          <div class="mb-4">
            <label for="image" class="block text-gray-700 text-sm font-bold mb-2">Image:</label>
            <input type="file" id="image" name="image" (change)="onFileSelected($event)" accept="image/*"
                   class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
            <p *ngIf="validationErrors.image" class="text-red-500 text-xs italic">{{ validationErrors.image[0] }}</p>

            <div *ngIf="postData.image" class="mt-2">
              <p class="text-gray-600 text-sm">Current Image:</p>
              <img [src]="getImageUrl(postData.image)" alt="Current Post Image" class="max-w-xs h-auto rounded-md shadow-sm">
              <label class="block mt-2">
                <input type="checkbox" [(ngModel)]="clearImage" name="clearImage" class="mr-2">
                Clear current image
              </label>
            </div>
          </div>

          <div *ngIf="errorMessage" class="text-red-500 text-sm mb-4">{{ errorMessage }}</div>

          <div class="flex items-center justify-between">
            <button type="submit"
                    class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline cursor-pointer">
              Update Post
            </button>
            <a routerLink="/posts/{{postData.id}}" class="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800">
              Cancel
            </a>
          </div>
        </form>
      </ng-container>

      <ng-template #loadingOrError>
        <div *ngIf="errorMessage; else loading" class="text-red-500 text-center mt-10 text-lg">
          ERROR FROM EDIT COMPONENT: {{ errorMessage }}
        </div>
        <ng-template #loading>
          <div class="text-center mt-10 text-lg text-gray-600">Loading post...</div>
        </ng-template>
      </ng-template>
    </div>
  `,
  styles: []
})
export class PostEditComponent implements OnInit {
  postId: number | null = null;
  postData: any = null; // Will hold the post details
  selectedFile: File | null = null;
  clearImage: boolean = false; // New property to signal image removal
  errorMessage: string | null = null;
  validationErrors: any = {};
  baseUrl: string = environment.apiUrl.replace('/api', ''); // Base URL for static assets

  constructor(
    private route: ActivatedRoute,
    private postService: PostService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.postId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.postId) {
      this.fetchPost();
    } else {
      this.errorMessage = 'Invalid or missing Post ID.';
    }
  }

  fetchPost(): void {
    if (this.postId) {
      this.postService.getPost(this.postId).subscribe({
        next: (data) => {
          this.postData = data;
          this.errorMessage = null; // Clear any previous error
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error fetching post:', error);
          if (error.status === 404) {
            this.errorMessage = 'Post not found.';
          } else if (error.status === 403) {
            this.errorMessage = 'You do not have permission to edit this post.';
          } else {
            this.errorMessage = error.message || 'An unknown error occurred while fetching the post.';
          }
          this.postData = null; // Clear post data on error
        }
      });
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.clearImage = false; // If a new file is selected, don't clear the old one
    } else {
      this.selectedFile = null;
    }
  }

  getImageUrl(imagePath: string): string {
    // Construct the full URL for the image
    return `${this.baseUrl}/storage/${imagePath}`;
  }

  updatePost(): void {
    if (!this.postId || !this.postData) {
      this.errorMessage = 'Post data is missing or invalid.';
      return;
    }

    this.errorMessage = null;
    this.validationErrors = {};

    const formData = new FormData();
    formData.append('title', this.postData.title);
    formData.append('content', this.postData.content);

    // If a new file is selected, append it
    if (this.selectedFile) {
      formData.append('image', this.selectedFile, this.selectedFile.name);
    }
    // If the checkbox to clear image is checked AND no new file is selected
    else if (this.clearImage) {
      formData.append('clear_image', '1'); // Signal to backend to remove image
    }

    // IMPORTANT: For PUT/PATCH with FormData, Laravel often prefers _method field.
    formData.append('_method', 'PUT'); // Or 'PATCH' depending on your route definition

    this.postService.updatePost(this.postId, formData).subscribe({
      next: (updatedPost) => {
        this.router.navigate(['/posts', updatedPost.id]); // Navigate to the updated post's detail page
      },
      error: (error: HttpErrorResponse) => {
        console.error('Post Update API Error:', error);
        if (error.status === 422 && error.error && error.error.errors) {
          this.validationErrors = error.error.errors;
          this.errorMessage = 'Please fix the errors in the form.';
        } else if (error.status === 403) {
          this.errorMessage = 'You do not have permission to update this post.';
        }
        else {
          this.errorMessage = error.message || 'An unknown error occurred during post update.';
        }
      }
    });
  }
}
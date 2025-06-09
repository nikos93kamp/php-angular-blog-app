// src/app/components/posts/post-create/post-create.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { PostService } from '../../../services/post';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-post-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="max-w-xl mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
      <h2 class="text-2xl font-bold text-center mb-6">Create New Post</h2>
      <form (ngSubmit)="createPost()">
        <div class="mb-4">
          <label for="title" class="block text-gray-700 text-sm font-bold mb-2">Title:</label>
          <input type="text" id="title" name="title" [(ngModel)]="post.title" required
                 class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
          <p *ngIf="validationErrors.title" class="text-red-500 text-xs italic">{{ validationErrors.title[0] }}</p>
        </div>
        <div class="mb-4">
          <label for="content" class="block text-gray-700 text-sm font-bold mb-2">Content:</label>
          <textarea id="content" name="content" [(ngModel)]="post.content" required rows="5"
                    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"></textarea>
          <p *ngIf="validationErrors.content" class="text-red-500 text-xs italic">{{ validationErrors.content[0] }}</p>
        </div>
        <div class="mb-4">
          <label for="image" class="block text-gray-700 text-sm font-bold mb-2">Image:</label>
          <input type="file" id="image" name="image" (change)="onFileSelected($event)" accept="image/*"
                 class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
          <p *ngIf="validationErrors.image" class="text-red-500 text-xs italic">{{ validationErrors.image[0] }}</p>
        </div>

        <div *ngIf="errorMessage" class="text-red-500 text-sm mb-4">{{ errorMessage }}</div>

        <div class="flex items-center justify-between">
          <button type="submit"
                  class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline cursor-pointer">
            Create Post
          </button>
          <a routerLink="/posts" class="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800">
            Cancel
          </a>
        </div>
      </form>
    </div>
  `,
  styles: []
})
export class PostCreateComponent {
  post = { title: '', content: '' };
  selectedFile: File | null = null; // To hold the selected image file
  errorMessage: string | null = null;
  validationErrors: any = {};

  constructor(private postService: PostService, private router: Router) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    } else {
      this.selectedFile = null;
    }
  }

  createPost(): void {
    this.errorMessage = null;
    this.validationErrors = {};

    const formData = new FormData();
    formData.append('title', this.post.title);
    formData.append('content', this.post.content);
    if (this.selectedFile) {
      formData.append('image', this.selectedFile, this.selectedFile.name);
    }

    this.postService.createPost(formData).subscribe({
      next: () => {
        this.router.navigate(['/posts']);
      },
      error: (error: HttpErrorResponse) => {
        console.error('Post Creation API Error:', error);
        if (error.status === 422 && error.error && error.error.errors) {
          this.validationErrors = error.error.errors;
          this.errorMessage = 'Please fix the errors in the form.';
        } else {
          this.errorMessage = error.message || 'An unknown error occurred during post creation.';
        }
      }
    });
  }
}
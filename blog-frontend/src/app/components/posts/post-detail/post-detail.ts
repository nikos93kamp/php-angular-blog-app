// src/app/components/posts/post-detail/post-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PostService } from '../../../services/post';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../services/auth'; // Import AuthService
import { environment } from '../../../../environments/environment'; // Import environment

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
      <ng-container *ngIf="post; else loadingOrError">
        <h1 class="text-3xl font-bold text-gray-800 mb-4">{{ post.title }}</h1>
        <p class="text-gray-600 text-sm mb-4">
          By <span class="font-semibold">{{ post.user?.name || 'Unknown User' }}</span> on {{ post.created_at | date:'mediumDate' }}
        </p>

        <div *ngIf="post.image" class="mb-4">
          <img [src]="getImageUrl(post.image)" alt="{{ post.title }}" class="w-full h-auto rounded-lg shadow-md">
        </div>

        <div class="prose max-w-none mb-6">
          <p>{{ post.content }}</p>
        </div>

        <div class="flex space-x-4">
          <a routerLink="/posts" class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded cursor-pointer">
            Back to Posts
          </a>
          <ng-container *ngIf="canEditOrDelete">
            <a routerLink="/posts/edit/{{post.id}}" class="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded cursor-pointer">
              Edit Post
            </a>
            <button (click)="deletePost()" class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded cursor-pointer">
              Delete Post
            </button>
          </ng-container>
        </div>
      </ng-container>

      <ng-template #loadingOrError>
        <div *ngIf="errorMessage; else loading" class="text-red-500 text-center mt-10 text-lg">
          ERROR FROM DETAIL COMPONENT: {{ errorMessage }}
        </div>
        <ng-template #loading>
          <div class="text-center mt-10 text-lg text-gray-600">Loading post...</div>
        </ng-template>
      </ng-template>
    </div>
  `,
  styles: []
})
export class PostDetailComponent implements OnInit {
  postId: number | null = null;
  post: any = null;
  errorMessage: string | null = null;
  currentUser: any = null; // To store current user data
  canEditOrDelete: boolean = false; // Flag for UI buttons
  baseUrl: string = environment.apiUrl.replace('/api', ''); // Base URL for static assets

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private postService: PostService,
    private authService: AuthService // Inject AuthService
  ) {}

  ngOnInit(): void {
    this.postId = Number(this.route.snapshot.paramMap.get('id'));
    this.authService.getUser().subscribe({ // Fetch current user to check ownership
      next: (user) => {
        this.currentUser = user;
        this.fetchPost();
      },
      error: (err) => {
        console.warn('Could not fetch current user or user not logged in for permission check.', err);
        this.currentUser = null;
        this.fetchPost(); // Still try to fetch post, but disable edit/delete
      }
    });
  }

  fetchPost(): void {
    if (this.postId) {
      this.postService.getPost(this.postId).subscribe({
        next: (data) => {
          this.post = data;
          this.errorMessage = null;
          // Check if current user is the owner
          this.canEditOrDelete = this.currentUser && this.post.user_id === this.currentUser.id;
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error fetching post:', error);
          if (error.status === 404) {
            this.errorMessage = 'Post not found.';
          } else {
            this.errorMessage = error.message || 'An unknown error occurred while fetching the post.';
          }
          this.post = null;
        }
      });
    } else {
      this.errorMessage = 'Invalid or missing Post ID.';
    }
  }

  getImageUrl(imagePath: string): string {
    // Construct the full URL for the image
    return `${this.baseUrl}/storage/${imagePath}`;
  }


  deletePost(): void {
    if (this.post && confirm('Are you sure you want to delete this post?')) {
      this.postService.deletePost(this.post.id).subscribe({
        next: () => {
          this.router.navigate(['/posts']);
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error deleting post:', error);
          if (error.status === 403) {
            this.errorMessage = 'You do not have permission to delete this post.';
          } else {
            this.errorMessage = error.message || 'An unknown error occurred during deletion.';
          }
        }
      });
    }
  }
}
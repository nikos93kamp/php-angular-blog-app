import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home';
import { LoginComponent } from './components/auth/login/login';
import { RegisterComponent } from './components/auth/register/register';
import { PostListComponent } from './components/posts/post-list/post-list';
import { PostDetailComponent } from './components/posts/post-detail/post-detail';
import { PostCreateComponent } from './components/posts/post-create/post-create';
import { PostEditComponent } from './components/posts/post-edit/post-edit';
import { AuthGuard } from './guards/auth-guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'posts', component: PostListComponent },
  { path: 'posts/create', component: PostCreateComponent, canActivate: [AuthGuard] },
  { path: 'posts/edit/:id', component: PostEditComponent, canActivate: [AuthGuard] },
  { path: 'posts/:id', component: PostDetailComponent },
  { path: '**', redirectTo: '/', pathMatch: 'full' } // Wildcard for 404
];
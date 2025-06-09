import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { withAuthInterceptor } from './interceptors/auth-interceptor'; // We will create this

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withFetch(), // If you want to use fetch API underneath
      withInterceptors([withAuthInterceptor]) // Add the interceptor
    )
  ]
};
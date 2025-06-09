import { HttpInterceptorFn } from '@angular/common/http';

export const withAuthInterceptor: HttpInterceptorFn = (req, next) => {
  const authToken = localStorage.getItem('authToken');

  // Clone the request and add the Authorization header if a token exists
  // For Sanctum, you typically rely on cookies for session management after initial login.
  // However, if you are sending the token as a Bearer token for API requests
  // (e.g., if you are using Sanctum for API token authentication without cookies for some routes),
  // this interceptor would be relevant. For typical SPA + Sanctum, cookies handle auth.
  // This is good practice for general API auth if you switch strategies.
  if (authToken) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${authToken}`
      }
    });
    return next(authReq);
  }

  return next(req);
};
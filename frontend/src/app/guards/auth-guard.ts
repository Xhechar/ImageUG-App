import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';
import { map, catchError, of } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(Auth);
  const router = inject(Router);
  
  return authService.isLoggedIn().pipe(
    map((res) => {
      if (res.Success) return true;
      router.navigate(['/login']);
      return false;
    }),
    catchError((err) => {
      router.navigate(['/login']);
      return of(false);
    })
  );
};

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';
import { map, catchError, of } from 'rxjs';
import { Nav } from '../services/nav';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(Auth);
  const router = inject(Router);
  const navService = inject(Nav);

  return authService.isLoggedIn().pipe(
    map((res) => {
      if (res.success && res.data) {
        navService.setNavLoggedInStatus(true, res.data);
        return true;
      }
      router.navigate(['/login']);
      return false;
    }),
    catchError(() => {
      router.navigate(['/login']);
      return of(false);
    }),
  );
};

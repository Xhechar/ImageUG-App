import { Routes } from '@angular/router';
import { Landing } from './components/landing/landing';
import { Dashboard } from './components/dashboard/dashboard';
import { Subscriptions } from './components/subscriptions/subscriptions';
import { Gallery } from './components/gallery/gallery';
import { Profile } from './components/profile/profile';
import { Register } from './components/register/register';
import { Login } from './components/login/login';
import { Verifymail } from './components/verifymail/verifymail';
import { PublishedImage } from './components/published-image/published-image';
import { authGuard } from './guards/auth-guard';
import { Notfound } from './components/notfound/notfound';

export const routes: Routes = [
  { path: 'imagen-home', component: Landing },
  { path: '', redirectTo: 'imagen-home', pathMatch: 'full' },
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
  { path: 'subscriptions', component: Subscriptions, canActivate: [authGuard] },
  { path: 'gallery', component: Gallery, canActivate: [authGuard] },
  { path: 'profile', component: Profile, canActivate: [authGuard] },
  { path: 'join-us', component: Register },
  { path: 'login', component: Login },
  { path: 'verify-mail', component: Verifymail },
  { path: 'published-images/:ImageUrlId', component: PublishedImage },
  { path: '**', component: Notfound }
];

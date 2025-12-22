import { Routes } from '@angular/router';
import { Landing } from './components/landing/landing';
import { Dashboard } from './components/dashboard/dashboard';
import { Subscriptions } from './components/subscriptions/subscriptions';
import { Gallery } from './components/gallery/gallery';

export const routes: Routes = [
  {path: 'imagen-home', component: Landing},
  {path: '', redirectTo: 'imagen-home', pathMatch: 'full'},
  {path: 'dashboard', component: Dashboard},
  {path: 'subscriptions', component: Subscriptions},
  { path: 'gallery', component: Gallery }
];

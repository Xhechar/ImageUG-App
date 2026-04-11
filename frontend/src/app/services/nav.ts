import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { FetchedUser } from '../interfaces/User';

@Injectable({
  providedIn: 'root'
})
export class Nav {
  
  private isNavLoggedIn = new BehaviorSubject<boolean>(false);
  private sessionUser = new BehaviorSubject<FetchedUser | null>(null);

  sessionUser$: Observable<FetchedUser | null> = this.sessionUser.asObservable();
  isNavLoggedIn$: Observable<boolean> = this.isNavLoggedIn.asObservable();

  setNavLoggedInStatus(status: boolean, user: FetchedUser | null): void {
    this.isNavLoggedIn.next(status);
    this.sessionUser.next(user);
  }

  setNavLoggedOut(): void {
    this.isNavLoggedIn.next(false);
    this.sessionUser.next(null);
  }
}

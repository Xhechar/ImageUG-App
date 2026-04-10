import { Component, HostListener, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FetchedUser } from './interfaces/User';
import { RouterLink } from '@angular/router';
import { Auth } from './services/auth';
import { Notification } from './components/notification/notification';
import { Nav } from './services/nav';
import { Toast } from './services/toast';
import { Signalr } from './services/signalr';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, FormsModule, RouterLink, Notification],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  isScrolled: boolean = false;
  isMobileMenuOpen: boolean = false;
  isProfileMenuOpen: boolean = false;

  isLoggedIn: boolean = false;
  currentUser: FetchedUser | null = null;

  constructor(
    private router: Router,
    private ns: Nav,
    private as: Auth,
    private ts: Toast,
    private sgrs: Signalr
  ) {}

  ngOnInit(): void {
    this.ns.isNavLoggedIn$.subscribe((status) => {
      this.isLoggedIn = status;
    });

    this.ns.sessionUser$.subscribe((user) => {
      this.currentUser = user;
    });
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.isScrolled = window.scrollY > 20;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.profile-menu-container')) {
      this.isProfileMenuOpen = false;
    }
    if (!target.closest('.mobile-menu-container')) {
      this.isMobileMenuOpen = false;
    }
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  toggleProfileMenu(): void {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  getUserInitials(): string {
    if (!this.currentUser) return 'U';
    return this.currentUser.username.substring(0, 2).toUpperCase();
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
    this.isMobileMenuOpen = false;
    this.isProfileMenuOpen = false;
  }

  logout(): void {
    this.as.logout().subscribe({
      next: (res) => {
        if (res.success) {
          this.isLoggedIn = false;
          this.currentUser = null;
          this.router.navigate(['/']);
          this.isProfileMenuOpen = false;
          this.sgrs.stopConnection();
          this.ts.showToast(
            res.success,
            res.title,
            res.successMessage as string
          );
        }
      },
      error: (err) => {
        this.ts.showToast(false, 'Error', err.message ?? 'Logout failed. Please try again.');
      },
    });
  }
}

import { Component, HostListener, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FetchedUser } from './interfaces/User';
import { RouterLink } from '@angular/router';
import { Auth } from './services/auth';
import { Notification } from './components/notification/notification';
import { Nav } from './services/nav';

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
    // Implement your logout logic here
    this.isLoggedIn = false;
    this.currentUser = null;
    this.router.navigate(['/']);
    this.isProfileMenuOpen = false;
  }
}

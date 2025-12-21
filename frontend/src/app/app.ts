import { Component, HostListener } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User } from './interfaces/User';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, FormsModule, RouterLink],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  isScrolled: boolean = false;
  isMobileMenuOpen: boolean = false;
  isProfileMenuOpen: boolean = false;

  // Set this based on your auth service
  isLoggedIn: boolean = true;

  // Current user data - populate from your auth service
  currentUser: User | null = {
    Username: 'JohnDoe',
    ProfileImageUrl: 'https://example.com/profile.jpg',
    PhoneNumber: '254-789-456-123',
    UserId: '1',
    Email: 'john.doe@example.com',
    PasswordHash: 'hashedpassword',
    Role: 'user',
    CreatedAt: new Date(),
    IsWelcomeEmailSent: true,
    FreeTrialCount: 0,
    ImageUrls: [],
    Subscriptions: [],
    PaymentDatas: [],
  };
  // Example: currentUser = { Username: 'JohnDoe', ProfileImageUrl: 'https://...' };

  constructor(private router: Router) {}

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
    return this.currentUser.Username.substring(0, 2).toUpperCase();
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

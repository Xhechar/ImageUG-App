import { Component, HostListener, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User } from './interfaces/User';
import { RouterLink } from '@angular/router';
import { Auth } from './services/auth';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, FormsModule, RouterLink],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit{
  isScrolled: boolean = false;
  isMobileMenuOpen: boolean = false;
  isProfileMenuOpen: boolean = false;

  isLoggedIn: boolean = false;

  currentUser: User | null = null;

  constructor(private router: Router, private authService: Auth) {}

  ngOnInit(): void {
    
  }

  fetchCurrentUser(): void {
    this.authService.isLoggedIn().subscribe({
      next: (res) => {
        if(res.Success) {
          this.isLoggedIn = true;
        }
      },
      error: (err) => {
        
      }
    })
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

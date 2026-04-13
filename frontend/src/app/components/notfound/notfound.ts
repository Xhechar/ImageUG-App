import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-notfound',
  imports: [CommonModule, FormsModule],
  templateUrl: './notfound.html',
  styleUrl: './notfound.css',
})
export class Notfound implements OnInit {
  attemptedUrl: string = '';
  countdown: number = 10;
  countdownInterval: any;
  autoRedirect: boolean = true;

  // Quick links
  quickLinks = [
    {
      title: 'Home',
      description: 'Return to the landing page',
      icon: 'bx-home',
      route: '/',
      color: 'primary',
    },
    {
      title: 'Dashboard',
      description: 'View your dashboard',
      icon: 'bx-grid-alt',
      route: '/dashboard',
      color: 'accent',
    },
    {
      title: 'Gallery',
      description: 'Browse your images',
      icon: 'bx-images',
      route: '/gallery',
      color: 'secondary',
    },
    {
      title: 'Profile',
      description: 'Manage your account',
      icon: 'bx-user-circle',
      route: '/profile',
      color: 'purple-500',
    },
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Get the attempted URL
    this.attemptedUrl = this.router.url;

    // Start countdown for auto-redirect
    if (this.autoRedirect) {
      this.startCountdown();
    }
  }

  ngOnDestroy(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  startCountdown(): void {
    this.countdownInterval = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        clearInterval(this.countdownInterval);
        this.navigateToHome();
      }
    }, 1000);
  }

  cancelAutoRedirect(): void {
    this.autoRedirect = false;
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  navigateToHome(): void {
    this.router.navigate(['/']);
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  goBack(): void {
    window.history.back();
  }

  getColorClass(color: string): string {
    const colorMap: { [key: string]: string } = {
      primary:
        'bg-primary/10 text-primary border-primary/30 hover:bg-primary/20',
      accent: 'bg-accent/10 text-accent border-accent/30 hover:bg-accent/20',
      secondary:
        'bg-secondary/10 text-secondary border-secondary/30 hover:bg-secondary/20',
      'purple-500':
        'bg-purple-500/10 text-purple-500 border-purple-500/30 hover:bg-purple-500/20',
    };
    return colorMap[color] || colorMap['primary'];
  }

  getIconColorClass(color: string): string {
    const colorMap: { [key: string]: string } = {
      primary: 'text-primary',
      accent: 'text-accent',
      secondary: 'text-secondary',
      'purple-500': 'text-purple-500',
    };
    return colorMap[color] || colorMap['primary'];
  }
}
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Toast } from '../../services/toast';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-notification',
  imports: [CommonModule, FormsModule],
  templateUrl: './notification.html',
  styleUrl: './notification.css',
})
export class Notification implements OnInit, OnDestroy {
  success: boolean = false;
  title: string | null = null;
  message: string | null = null;
  isVisible: boolean = false;
  isClosing: boolean = false;

  private successSubscription?: Subscription;
  private titleSubscription?: Subscription;
  private messageSubscription?: Subscription;

  constructor(private toastService: Toast) {}

  ngOnInit(): void {
    this.successSubscription = this.toastService.success$.subscribe(
      (success) => {
        this.success = success;
      },
    );

    this.titleSubscription = this.toastService.title$.subscribe((title) => {
      this.title = title;
      if (title) {
        this.show();
      }
    });

    this.messageSubscription = this.toastService.message$.subscribe(
      (message) => {
        this.message = message;
      },
    );
  }

  ngOnDestroy(): void {
    if (this.successSubscription) {
      this.successSubscription.unsubscribe();
    }
    if (this.titleSubscription) {
      this.titleSubscription.unsubscribe();
    }
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
  }

  show(): void {
    this.isVisible = true;
    this.isClosing = false;
  }

  close(): void {
    this.isClosing = true;
    setTimeout(() => {
      this.isVisible = false;
      this.isClosing = false;
      this.toastService.clearToast();
    }, 400);
  }

  get notificationType(): 'success' | 'error' | 'info' {
    if (this.success) {
      return 'success';
    }

    if (!this.success && this.title) {
      const lowerTitle = this.title.toLowerCase();

      if (
        lowerTitle.includes('error') ||
        lowerTitle.includes('fail') ||
        lowerTitle.includes('invalid') ||
        lowerTitle.includes('denied')
      ) {
        return 'error';
      }
    }

    return 'info';
  }

  get icon(): string {
    switch (this.notificationType) {
      case 'success':
        return 'bx-check-circle';
      case 'error':
        return 'bx-error-circle';
      default:
        return 'bx-info-circle';
    }
  }

  // Get color classes based on notification type
  get colorClasses(): string {
    switch (this.notificationType) {
      case 'success':
        return 'bg-green-500/10 border-green-500/30 shadow-green';
      case 'error':
        return 'bg-red-500/10 border-red-500/30 shadow-red';
      default:
        return 'bg-accent/10 border-accent/30 shadow-accent';
    }
  }

  get iconColorClass(): string {
    switch (this.notificationType) {
      case 'success':
        return 'text-green-500';
      case 'error':
        return 'text-red-500';
      default:
        return 'text-accent';
    }
  }

  get titleColorClass(): string {
    switch (this.notificationType) {
      case 'success':
        return 'text-green-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-accent';
    }
  }
}
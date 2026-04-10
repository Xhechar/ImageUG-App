import { Component } from '@angular/core';
import { LoginDetails } from '../../Dtos/Auth/LoginDetails';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../services/auth';
import { Toast } from '../../services/toast';
import { Notification } from '../notification/notification';
import { Signalr } from '../../services/signalr';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, Notification],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  loginData: LoginDetails = {
    Email: '',
    Password: '',
  };

  isSubmitting: boolean = false;
  showPassword: boolean = false;
  rememberMe: boolean = false;

  constructor(
    private router: Router,
    private as: Auth,
    private ts: Toast,
    private sgrs: Signalr
  ) {}

  // Toggle password visibility
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  // Check if field should show error
  shouldShowError(field: any): boolean {
    return field && field.invalid && (field.dirty || field.touched);
  }

  // Get error message for field
  getErrorMessage(field: any, fieldName: string): string {
    if (!field || !field.errors) return '';

    if (field.hasError('required')) {
      return `${fieldName} is required`;
    }

    if (fieldName === 'Email' && field.hasError('email')) {
      return 'Please enter a valid email address';
    }

    if (fieldName === 'Password' && field.hasError('minlength')) {
      return 'Password must be at least 8 characters';
    }

    return '';
  }

  // Submit form
  async onSubmit(loginForm: NgForm): Promise<void> {
    // Mark all fields as touched to show validation errors
    Object.keys(loginForm.controls).forEach((key) => {
      loginForm.controls[key].markAsTouched();
    });

    if (loginForm.invalid) {
      this.ts.showToast(
        false,
        'Error',
        'Please fix all errors before submitting',
      );
      return;
    }

    this.isSubmitting = true;

    const loginDto: LoginDetails = {
      Email: this.loginData.Email,
      Password: this.loginData.Password,
    };

    try {
      this.as.login(loginDto).subscribe({
        next: (res) => {
          if (res.success) {
            this.ts.showToast(
              res.success,
              res.title,
              res.successMessage as string,
            );
            this.sgrs.startConnection();
            setTimeout(() => {
              this.router.navigate(['/dashboard']);
            }, 3000);
          } else {
            this.ts.showToast(
              res.success,
              res.title,
              res.errorMessage as string,
            );
          }
        },
      });
    } catch (error: any) {
      this.ts.showToast(
        false,
        'Error',
        error.message ?? 'Login failed. Please try again.',
      );
    } finally {
      this.isSubmitting = false;
    }
  }

  // Navigate to signup
  navigateToSignup(): void {
    this.router.navigate(['/join-us']);
  }

  // Navigate to forgot password
  navigateToForgotPassword(): void {
    this.router.navigate(['/verify-mail']);
  }
}

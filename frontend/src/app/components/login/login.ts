import { Component } from '@angular/core';
import { LoginDetails } from '../../Dtos/Auth/LoginDetails';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
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

  // Toast
  showToast: boolean = false;
  toastMessage: string = '';
  toastType: 'success' | 'error' | 'info' = 'info';

  constructor(private router: Router) {}

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
      this.showToastMessage('Please fix all errors before submitting', 'error');
      return;
    }

    this.isSubmitting = true;

    const loginDto: LoginDetails = {
      Email: this.loginData.Email,
      Password: this.loginData.Password,
    };

    try {
      // Simulate API call
      await this.delay(2000);

      // Simulate random success/failure for demo
      const success = Math.random() > 0.3; // 70% success rate

      if (success) {
        this.showToastMessage('Login successful! Redirecting...', 'success');

        // Add your API call here
        // const response = await this.authService.login(loginDto);
        // Store token, user data, etc.

        // Redirect to dashboard
        await this.delay(1500);
        this.router.navigate(['/dashboard']);
      } else {
        throw new Error('Invalid email or password');
      }
    } catch (error: any) {
      this.showToastMessage(
        error.message || 'Login failed. Please check your credentials.',
        'error'
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

  // Toast
  showToastMessage(
    message: string,
    type: 'success' | 'error' | 'info' = 'info'
  ): void {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }

  // Helper
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

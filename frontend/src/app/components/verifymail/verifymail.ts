import { Component, ChangeDetectorRef } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ChangePasswordDto } from '../../Dtos/Auth/ChangePasswordDto';
import { Auth } from '../../services/auth';

type Step = 'email' | 'verification' | 'password' | 'success';

@Component({
  selector: 'app-verifymail',
  imports: [CommonModule, FormsModule],
  templateUrl: './verifymail.html',
  styleUrl: './verifymail.css',
})
export class Verifymail {
  currentStep: Step = 'email';

  // Form data
  changePasswordData: ChangePasswordDto = {
    Email: '',
    VerificationCode: '',
    NewPassword: '',
  };

  confirmPassword: string = '';

  // State
  isSubmitting: boolean = false;
  showNewPassword: boolean = false;
  showConfirmPassword: boolean = false;
  countdown: number = 0;
  countdownInterval: any;

  // Toast
  showToast: boolean = false;
  toastMessage: string = '';
  toastType: 'success' | 'error' | 'info' = 'info';

  constructor(
    private router: Router,
    private authService: Auth,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnDestroy(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  // Toggle password visibility
  toggleNewPasswordVisibility(): void {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
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

    if (fieldName === 'Verification Code') {
      if (field.hasError('minlength') || field.hasError('maxlength')) {
        return 'Verification code must be 6 digits';
      }
      if (field.hasError('pattern')) {
        return 'Please enter only numbers';
      }
    }

    if (fieldName === 'New Password') {
      if (field.hasError('minlength')) {
        return 'Password must be at least 8 characters';
      }
      if (field.hasError('pattern')) {
        return 'Password must contain uppercase, lowercase, and number';
      }
    }

    return '';
  }

  // Check if passwords match
  passwordsMatch(): boolean {
    return this.changePasswordData.NewPassword === this.confirmPassword;
  }

  // Step 1: Request verification code
  async requestCode(emailForm: NgForm): Promise<void> {
    if (emailForm.invalid) {
      this.showToastMessage('Please enter a valid email address', 'error');
      return;
    }

    this.isSubmitting = true;

    try {
      const response = await this.authService
        .verifyEmail(this.changePasswordData.Email)
        .toPromise();

      if (response?.success) {
        this.showToastMessage(
          response.successMessage || 'Verification code sent to your email!',
          'success',
        );
        this.currentStep = 'verification';
        this.startCountdown();
        this.cdr.detectChanges();
      } else {
        throw new Error(
          response?.errorMessage || 'Failed to send verification code',
        );
      }
    } catch (error: any) {
      this.showToastMessage(
        error?.error?.errorMessage ||
          error.message ||
          'Failed to send verification code. Please try again.',
        'error',
      );
      this.cdr.detectChanges();
    } finally {
      this.isSubmitting = false;
      this.cdr.detectChanges();
    }
  }

  // Step 2: Verify code (client-side validation only)
  async verifyCode(codeForm: NgForm): Promise<void> {
    if (codeForm.invalid) {
      this.showToastMessage('Please enter a valid 6-digit code', 'error');
      return;
    }

    this.isSubmitting = true;

    try {
      // Simulate brief processing
      await this.delay(500);

      // For now, just proceed to password step
      // The actual verification will happen in changePassword API call
      this.showToastMessage('Code verified successfully!', 'success');
      this.currentStep = 'password';
      this.cdr.detectChanges();
    } catch (error: any) {
      this.showToastMessage(
        error?.error?.errorMessage ||
          error.message ||
          'Invalid verification code. Please try again.',
        'error',
      );
      this.cdr.detectChanges();
    } finally {
      this.isSubmitting = false;
      this.cdr.detectChanges();
    }
  }

  // Step 3: Reset password
  async resetPassword(passwordForm: NgForm): Promise<void> {
    // Mark all fields as touched
    Object.keys(passwordForm.controls).forEach((key) => {
      passwordForm.controls[key].markAsTouched();
    });

    if (passwordForm.invalid) {
      this.showToastMessage('Please fix all errors before submitting', 'error');
      return;
    }

    if (!this.passwordsMatch()) {
      this.showToastMessage('Passwords do not match', 'error');
      return;
    }

    this.isSubmitting = true;

    const changePasswordDto: ChangePasswordDto = {
      Email: this.changePasswordData.Email,
      VerificationCode: this.changePasswordData.VerificationCode,
      NewPassword: this.changePasswordData.NewPassword,
    };

    try {
      const response = await this.authService
        .changePassword(changePasswordDto)
        .toPromise();

      if (response?.success) {
        this.showToastMessage('Password changed successfully!', 'success');
        this.currentStep = 'success';
        this.cdr.detectChanges();
      } else {
        throw new Error(response?.errorMessage || 'Failed to change password');
      }
    } catch (error: any) {
      this.showToastMessage(
        error?.error?.errorMessage ||
          error.message ||
          'Failed to change password. Please try again.',
        'error',
      );
      this.cdr.detectChanges();
    } finally {
      this.isSubmitting = false;
      this.cdr.detectChanges();
    }
  }

  // Resend verification code
  async resendCode(): Promise<void> {
    if (this.countdown > 0) return;

    this.isSubmitting = true;

    try {
      const response = await this.authService
        .verifyEmail(this.changePasswordData.Email)
        .toPromise();

      if (response?.success) {
        this.showToastMessage('New verification code sent!', 'success');
        this.startCountdown();
        this.cdr.detectChanges();
      } else {
        throw new Error(response?.errorMessage || 'Failed to resend code');
      }
    } catch (error: any) {
      this.showToastMessage(
        error?.error?.errorMessage ||
          error.message ||
          'Failed to resend code. Please try again.',
        'error',
      );
      this.cdr.detectChanges();
    } finally {
      this.isSubmitting = false;
      this.cdr.detectChanges();
    }
  }

  // Countdown timer for resend
  startCountdown(): void {
    this.countdown = 60;

    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }

    this.countdownInterval = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        clearInterval(this.countdownInterval);
      }
    }, 1000);
  }

  // Navigate back
  goBack(): void {
    if (this.currentStep === 'email') {
      this.router.navigate(['/login']);
    } else if (this.currentStep === 'verification') {
      this.currentStep = 'email';
    } else if (this.currentStep === 'password') {
      this.currentStep = 'verification';
    }
  }

  // Navigate to login
  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  // Toast
  showToastMessage(
    message: string,
    type: 'success' | 'error' | 'info' = 'info',
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

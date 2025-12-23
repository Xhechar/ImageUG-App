import { Component } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ChangePasswordDto } from '../../Dtos/Auth/ChangePasswordDto';

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

  constructor(private router: Router) {}

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
      // Simulate API call
      await this.delay(2000);

      // Add your API call here to send verification code
      // await this.authService.requestPasswordReset(this.changePasswordData.Email);

      this.showToastMessage('Verification code sent to your email!', 'success');
      this.currentStep = 'verification';
      this.startCountdown();
    } catch (error: any) {
      this.showToastMessage(
        error.message || 'Failed to send verification code. Please try again.',
        'error'
      );
    } finally {
      this.isSubmitting = false;
    }
  }

  // Step 2: Verify code
  async verifyCode(codeForm: NgForm): Promise<void> {
    if (codeForm.invalid) {
      this.showToastMessage('Please enter a valid 6-digit code', 'error');
      return;
    }

    this.isSubmitting = true;

    try {
      // Simulate API call
      await this.delay(1500);

      // Add your API call here to verify code
      // await this.authService.verifyResetCode(
      //   this.changePasswordData.Email,
      //   this.changePasswordData.VerificationCode
      // );

      // Simulate random success/failure for demo
      const success = Math.random() > 0.3;

      if (success) {
        this.showToastMessage('Code verified successfully!', 'success');
        this.currentStep = 'password';
      } else {
        throw new Error('Invalid verification code');
      }
    } catch (error: any) {
      this.showToastMessage(
        error.message || 'Invalid verification code. Please try again.',
        'error'
      );
    } finally {
      this.isSubmitting = false;
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
      // Simulate API call
      await this.delay(2000);

      // Add your API call here
      // await this.authService.changePassword(changePasswordDto);

      this.showToastMessage('Password changed successfully!', 'success');
      this.currentStep = 'success';
    } catch (error: any) {
      this.showToastMessage(
        error.message || 'Failed to change password. Please try again.',
        'error'
      );
    } finally {
      this.isSubmitting = false;
    }
  }

  // Resend verification code
  async resendCode(): Promise<void> {
    if (this.countdown > 0) return;

    this.isSubmitting = true;

    try {
      // Simulate API call
      await this.delay(1500);

      // Add your API call here
      // await this.authService.requestPasswordReset(this.changePasswordData.Email);

      this.showToastMessage('New verification code sent!', 'success');
      this.startCountdown();
    } catch (error: any) {
      this.showToastMessage(
        'Failed to resend code. Please try again.',
        'error'
      );
    } finally {
      this.isSubmitting = false;
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

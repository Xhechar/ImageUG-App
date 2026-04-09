import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CreateUserDto } from '../../Dtos/User/CreateUserDto';
import { Toast } from '../../services/toast';
import { User } from '../../services/user';
import { Notification } from "../notification/notification";

@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, Notification],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register implements OnInit {
  signupForm!: FormGroup;
  isSubmitting: boolean = false;
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  showToast: boolean = false;
  toastMessage: string = '';
  toastType: 'success' | 'error' | 'info' = 'info';

  constructor(private fb: FormBuilder, private router: Router, private ts: Toast, private us: User) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.signupForm = this.fb.group(
      {
        username: [
          '',
          [
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(20),
            Validators.pattern(/^[a-zA-Z0-9_]+$/),
          ],
        ],
        email: ['', [Validators.required, Validators.email]],
        phoneNumber: [
          '',
          [Validators.required, Validators.pattern(/^\+?[1-9]\d{1,14}$/)],
        ],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
          ],
        ],
        confirmPassword: ['', [Validators.required]],
        termsAccepted: [false, [Validators.requiredTrue]],
      },
      {
        validators: this.passwordMatchValidator,
      }
    );
  }

  // Custom validator for password matching
  passwordMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;

    if (password !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  }

  // Field getters
  get username() {
    return this.signupForm.get('username');
  }

  get email() {
    return this.signupForm.get('email');
  }

  get phoneNumber() {
    return this.signupForm.get('phoneNumber');
  }

  get password() {
    return this.signupForm.get('password');
  }

  get confirmPassword() {
    return this.signupForm.get('confirmPassword');
  }

  get termsAccepted() {
    return this.signupForm.get('termsAccepted');
  }

  // Check if field should show error
  shouldShowError(fieldName: string): boolean {
    const field = this.signupForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  // Get error message for field
  getErrorMessage(fieldName: string): string {
    const field = this.signupForm.get(fieldName);

    if (!field || !field.errors) return '';

    if (field.hasError('required')) {
      return `${this.getFieldLabel(fieldName)} is required`;
    }

    switch (fieldName) {
      case 'username':
        if (field.hasError('minlength')) {
          return 'Username must be at least 3 characters';
        }
        if (field.hasError('maxlength')) {
          return 'Username cannot exceed 20 characters';
        }
        if (field.hasError('pattern')) {
          return 'Username can only contain letters, numbers, and underscores';
        }
        break;

      case 'email':
        if (field.hasError('email')) {
          return 'Please enter a valid email address';
        }
        break;

      case 'phoneNumber':
        if (field.hasError('pattern')) {
          return 'Please enter a valid phone number (e.g., +254712345678)';
        }
        break;

      case 'password':
        if (field.hasError('minlength')) {
          return 'Password must be at least 8 characters';
        }
        if (field.hasError('pattern')) {
          return 'Password must contain uppercase, lowercase, and number';
        }
        break;

      case 'confirmPassword':
        if (this.signupForm.hasError('passwordMismatch')) {
          return 'Passwords do not match';
        }
        break;
    }

    return '';
  }

  getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      username: 'Username',
      email: 'Email',
      phoneNumber: 'Phone number',
      password: 'Password',
      confirmPassword: 'Confirm password',
      termsAccepted: 'Terms acceptance',
    };
    return labels[fieldName] || fieldName;
  }

  // Toggle password visibility
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  async onSubmit(): Promise<void> {
    Object.keys(this.signupForm.controls).forEach((key) => {
      this.signupForm.get(key)?.markAsTouched();
    });

    if (this.signupForm.invalid) {
      // this.ts.showToast(false, 'Invalid Values', 'Please fix all errors before submitting');
      this.showToastMessage('Please fix all errors before submitting', 'error');
      return;
    }

    this.isSubmitting = true;

    const formValue = this.signupForm.value;
    const createUserDto: CreateUserDto = {
      Username: formValue.username,
      Email: formValue.email,
      PhoneNumber: formValue.phoneNumber,
      PasswordHash: formValue.password
    };

    try {
      this.us.createUser(createUserDto).subscribe({
        next: (res) => {
          if(res.success) {
            this.ts.showToast(res.success, res.title, res.successMessage as string);
            setTimeout(() => {
              this.navigateToLogin();
            }, 3000);
          } else {
            this.ts.showToast(res.success, res.title, res.errorMessage as string);
          }
        },
        error: (err) => {
          console.log(err);
          
          this.ts.showToast(false, err.error?.Title as string ?? 'Error', err.error?.ErrorMessage as string ?? err.message ?? 'Failed to create account. Please try again.');
        }
      })
    } catch (error: any) {
      this.ts.showToast(false, 'Error', error.message ?? 'Failed to create account. Please try again.');
    } finally {
      this.isSubmitting = false;
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
}

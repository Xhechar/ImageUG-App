import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from '../../interfaces/User';

interface UserStats {
  totalImages: number;
  publishedImages: number;
  totalRevenue: number;
  activeSubscriptions: number;
  accountAge: number;
}

@Component({
  selector: 'app-profile',
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  // User data
  currentUser: User = {
    UserId: '1',
    Username: 'JohnDoe',
    PhoneNumber: '+254712345678',
    Email: 'john.doe@example.com',
    ProfileImageUrl: undefined,
    Role: 'Premium User',
    CreatedAt: new Date('2024-01-15'),
    FreeTrialCount: 3,
    PasswordHash: '',
    IsWelcomeEmailSent: false,
    ImageUrls: [],
    Subscriptions: [],
    PaymentDatas: []
  };

  // Form data (copy of user for editing)
  formData: User = { ...this.currentUser };

  // User statistics
  userStats: UserStats = {
    totalImages: 47,
    publishedImages: 32,
    totalRevenue: 159.97,
    activeSubscriptions: 1,
    accountAge: 0,
  };

  // State
  isEditMode: boolean = false;
  isSaving: boolean = false;
  selectedFile: File | null = null;
  previewUrl: string | null = null;

  // Toast
  showToast: boolean = false;
  toastMessage: string = '';
  toastType: 'success' | 'error' | 'info' = 'info';

  // Password change
  showPasswordModal: boolean = false;
  passwordData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  };
  isChangingPassword: boolean = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.calculateAccountAge();
  }

  calculateAccountAge(): void {
    const createdDate = new Date(this.currentUser.CreatedAt);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - createdDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    this.userStats.accountAge = diffDays;
  }

  // Get user initials
  getUserInitials(): string {
    return this.currentUser.Username.substring(0, 2).toUpperCase();
  }

  getInitialsColor(): string {
    const colors = [
      'bg-primary',
      'bg-secondary',
      'bg-accent',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
    ];
    const index = this.currentUser.Username.charCodeAt(0) % colors.length;
    return colors[index];
  }

  // Edit mode
  enterEditMode(): void {
    this.isEditMode = true;
    this.formData = { ...this.currentUser };
    this.selectedFile = null;
    this.previewUrl = null;
  }

  cancelEdit(): void {
    this.isEditMode = false;
    this.formData = { ...this.currentUser };
    this.selectedFile = null;
    this.previewUrl = null;
  }

  // File upload
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.showToastMessage('File size must be less than 5MB', 'error');
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        this.showToastMessage('Please select an image file', 'error');
        return;
      }

      this.selectedFile = file;

      // Generate preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  // Save profile
  async saveProfile(): Promise<void> {
    // Validation
    if (!this.formData.Username.trim()) {
      this.showToastMessage('Username is required', 'error');
      return;
    }

    if (!this.formData.Email.trim()) {
      this.showToastMessage('Email is required', 'error');
      return;
    }

    if (!this.isValidEmail(this.formData.Email)) {
      this.showToastMessage('Please enter a valid email address', 'error');
      return;
    }

    if (!this.formData.PhoneNumber.trim()) {
      this.showToastMessage('Phone number is required', 'error');
      return;
    }

    this.isSaving = true;

    // Simulate API call
    await this.delay(2000);

    // If new profile image selected, upload it
    if (this.selectedFile) {
      // In real app, upload to Cloudinary here
      this.currentUser.ProfileImageUrl = this.previewUrl || undefined;
    }

    // Update user data
    this.currentUser.Username = this.formData.Username;
    this.currentUser.Email = this.formData.Email;
    this.currentUser.PhoneNumber = this.formData.PhoneNumber;
    this.currentUser.UpdatedAt = new Date();

    this.isSaving = false;
    this.isEditMode = false;
    this.selectedFile = null;
    this.previewUrl = null;

    this.showToastMessage('Profile updated successfully!', 'success');
    // Add your API call here
  }

  // Remove profile picture
  removeProfilePicture(): void {
    this.currentUser.ProfileImageUrl = undefined;
    this.previewUrl = null;
    this.selectedFile = null;
    this.showToastMessage('Profile picture removed', 'success');
  }

  // Password change
  openPasswordModal(): void {
    this.showPasswordModal = true;
    this.passwordData = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    };
  }

  closePasswordModal(): void {
    this.showPasswordModal = false;
    this.passwordData = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    };
    this.isChangingPassword = false;
  }

  async changePassword(): Promise<void> {
    // Validation
    if (!this.passwordData.currentPassword) {
      this.showToastMessage('Current password is required', 'error');
      return;
    }

    if (!this.passwordData.newPassword) {
      this.showToastMessage('New password is required', 'error');
      return;
    }

    if (this.passwordData.newPassword.length < 8) {
      this.showToastMessage('Password must be at least 8 characters', 'error');
      return;
    }

    if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
      this.showToastMessage('Passwords do not match', 'error');
      return;
    }

    this.isChangingPassword = true;

    // Simulate API call
    await this.delay(2000);

    this.isChangingPassword = false;
    this.closePasswordModal();
    this.showToastMessage('Password changed successfully!', 'success');
    // Add your API call here
  }

  // Account actions
  viewBilling(): void {
    this.router.navigate(['/subscriptions']);
  }

  viewGallery(): void {
    this.router.navigate(['/gallery']);
  }

  // Helpers
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  getMemberSince(): string {
    return new Date(this.currentUser.CreatedAt).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
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

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

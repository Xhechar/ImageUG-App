import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ImageUrl } from '../../interfaces/ImageUrl';
import { User } from '../../interfaces/User';
import { Subscription } from '../../interfaces/Subscription';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  // User data
  currentUser: User = {
    UserId: '1',
    Username: 'JohnDoe',
    Email: 'john@example.com',
    FreeTrialCount: 3,
    PhoneNumber: '',
    PasswordHash: '',
    Role: '',
    CreatedAt: new Date(),
    IsWelcomeEmailSent: false,
    ImageUrls: [],
    Subscriptions: [],
    PaymentDatas: [],
  };

  // Subscription data
  activeSubscription: Subscription | null = {
    SubscriptionId: '1',
    UserId: '1',
    Price: 14.99,
    ReferenceId: 'REF123456',
    StartDate: new Date('2024-12-01'),
    DurationInDays: 30,
    IsActive: true,
  };

  // User images
  userImages: ImageUrl[] = [
    {
      ImageUrlId: '1',
      Url: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=400&q=80',
      UserId: '1',
      Description: 'Beautiful sunset landscape',
      IsPublished: true,
      CreatedAt: new Date('2024-12-15'),
    },
    {
      ImageUrlId: '2',
      Url: 'https://images.unsplash.com/photo-1682687221038-404cb8830901?w=400&q=80',
      UserId: '1',
      Description: 'Modern architecture',
      IsPublished: false,
      CreatedAt: new Date('2024-12-14'),
    },
    {
      ImageUrlId: '3',
      Url: 'https://images.unsplash.com/photo-1682687220063-4742bd7fd538?w=400&q=80',
      UserId: '1',
      Description: 'Abstract art composition',
      IsPublished: true,
      CreatedAt: new Date('2024-12-13'),
    },
    {
      ImageUrlId: '4',
      Url: 'https://images.unsplash.com/photo-1682687220923-c58b9a4592ae?w=400&q=80',
      UserId: '1',
      IsPublished: false,
      CreatedAt: new Date('2024-12-12'),
    },
    {
      ImageUrlId: '5',
      Url: 'https://images.unsplash.com/photo-1682687221080-5cb261c645cb?w=400&q=80',
      UserId: '1',
      Description: 'Urban street photography',
      IsPublished: true,
      CreatedAt: new Date('2024-12-11'),
    },
  ];

  filteredImages: ImageUrl[] = [];

  // Filters
  searchTerm: string = '';
  filterStatus: string = 'all'; // all, published, unpublished
  sortBy: string = 'newest'; // newest, oldest, description

  // Modal states
  showPaymentModal: boolean = false;
  showUpgradeModal: boolean = false;
  showDeleteModal: boolean = false;
  selectedPlan: 'weekly' | 'monthly' | 'yearly' | null = null;
  paymentMethod: 'mpesa' | 'stripe' | null = null;
  imageToDelete: string | null = null;

  // Toast notification
  showToast: boolean = false;
  toastMessage: string = '';
  toastType: 'success' | 'error' | 'info' = 'info';

  // Payment status
  paymentStatus:
    | 'idle'
    | 'initiated'
    | 'stk-sent'
    | 'processing'
    | 'success'
    | 'failed' = 'idle';
  paymentMessage: string = '';

  // Pagination
  currentPage: number = 0;
  itemsPerPage: number = 6;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.applyFilters();
  }

  // Stats calculations
  get totalImages(): number {
    return this.userImages.length;
  }

  get publishedImages(): number {
    return this.userImages.filter((img) => img.IsPublished).length;
  }

  get unpublishedImages(): number {
    return this.userImages.filter((img) => !img.IsPublished).length;
  }

  get daysRemaining(): number {
    if (!this.activeSubscription) return 0;
    const startDate = new Date(this.activeSubscription.StartDate);
    const endDate = new Date(
      startDate.getTime() +
        this.activeSubscription.DurationInDays * 24 * 60 * 60 * 1000
    );
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }

  get subscriptionPlanName(): string {
    if (!this.activeSubscription) return 'No Plan';
    if (this.activeSubscription.DurationInDays === 7) return 'Weekly';
    if (this.activeSubscription.DurationInDays === 30) return 'Monthly';
    if (this.activeSubscription.DurationInDays === 365) return 'Yearly';
    return 'Custom';
  }

  // Filter and sort
  applyFilters(): void {
    let filtered = [...this.userImages];

    // Search filter
    if (this.searchTerm) {
      filtered = filtered.filter(
        (img) =>
          img.Description?.toLowerCase().includes(
            this.searchTerm.toLowerCase()
          ) ||
          img.ImageUrlId.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (this.filterStatus === 'published') {
      filtered = filtered.filter((img) => img.IsPublished);
    } else if (this.filterStatus === 'unpublished') {
      filtered = filtered.filter((img) => !img.IsPublished);
    }

    // Sort
    if (this.sortBy === 'newest') {
      filtered.sort(
        (a, b) =>
          new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime()
      );
    } else if (this.sortBy === 'oldest') {
      filtered.sort(
        (a, b) =>
          new Date(a.CreatedAt).getTime() - new Date(b.CreatedAt).getTime()
      );
    } else if (this.sortBy === 'description') {
      filtered.sort((a, b) => {
        const aDesc = a.Description || '';
        const bDesc = b.Description || '';
        return aDesc.localeCompare(bDesc);
      });
    }

    this.filteredImages = filtered;
    this.currentPage = 0;
  }

  get displayedImages(): ImageUrl[] {
    const start = this.currentPage * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredImages.slice(start, end);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredImages.length / this.itemsPerPage);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
    }
  }

  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
    }
  }

  // Toggle publish status
  togglePublish(image: ImageUrl): void {
    image.IsPublished = !image.IsPublished;
    image.UpdatedAt = new Date();
    // Add your API call here to update the backend

    this.showToastMessage(
      `Image ${image.IsPublished ? 'published' : 'unpublished'} successfully`,
      'success'
    );
  }

  // Copy URL to clipboard
  copyUrl(url: string): void {
    navigator.clipboard
      .writeText(url)
      .then(() => {
        this.showToastMessage('URL copied to clipboard!', 'success');
      })
      .catch(() => {
        this.showToastMessage('Failed to copy URL', 'error');
      });
  }

  // Open delete confirmation modal
  confirmDelete(imageId: string): void {
    this.imageToDelete = imageId;
    this.showDeleteModal = true;
  }

  // Close delete modal
  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.imageToDelete = null;
  }

  // Delete image
  deleteImage(): void {
    if (!this.imageToDelete) return;

    this.userImages = this.userImages.filter(
      (img) => img.ImageUrlId !== this.imageToDelete
    );
    this.applyFilters();
    this.closeDeleteModal();
    this.showToastMessage('Image deleted successfully', 'success');
    // Add your API call here
  }

  // Show toast notification
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

  // Upgrade/Renew plan
  openUpgradeModal(plan: 'weekly' | 'monthly' | 'yearly'): void {
    this.selectedPlan = plan;
    this.showUpgradeModal = true;
  }

  closeUpgradeModal(): void {
    this.showUpgradeModal = false;
    this.selectedPlan = null;
  }

  selectPaymentMethod(method: 'mpesa' | 'stripe'): void {
    this.paymentMethod = method;
    this.showUpgradeModal = false;
    this.showPaymentModal = true;
  }

  get selectedPlanPrice(): number {
    if (!this.selectedPlan) return 0;
    const prices = { weekly: 4.99, monthly: 14.99, yearly: 99.99 };
    return prices[this.selectedPlan];
  }

  get selectedPlanName(): string {
    if (!this.selectedPlan) return '';
    return (
      this.selectedPlan.charAt(0).toUpperCase() + this.selectedPlan.slice(1)
    );
  }

  closePaymentModal(): void {
    this.showPaymentModal = false;
    this.paymentMethod = null;
    this.paymentStatus = 'idle';
    this.paymentMessage = '';
  }

  async completePayment(): Promise<void> {
    if (!this.paymentMethod || !this.selectedPlan) return;

    this.paymentStatus = 'initiated';
    this.paymentMessage = 'Payment initiated...';

    // Simulate payment flow
    await this.delay(1500);

    if (this.paymentMethod === 'mpesa') {
      this.paymentStatus = 'stk-sent';
      this.paymentMessage =
        'STK push sent to your phone. Please enter your M-Pesa PIN.';
      await this.delay(3000);
    }

    this.paymentStatus = 'processing';
    this.paymentMessage = 'Processing payment...';
    await this.delay(2000);

    // Simulate success (90% success rate)
    const success = Math.random() > 0.1;

    if (success) {
      this.paymentStatus = 'success';
      this.paymentMessage =
        'Payment successful! Your subscription has been updated.';

      // Update subscription
      // Add your API call here

      await this.delay(2000);
      this.closePaymentModal();
    } else {
      this.paymentStatus = 'failed';
      this.paymentMessage = 'Payment failed. Please try again.';
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  onImageLoad(event: any): void {
    event.target.classList.add('loaded');
  }

  onImageError(event: any): void {
    console.error('Failed to load image:', event.target.src);
  }
}

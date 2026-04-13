import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FetchedImageUrl } from '../../interfaces/ImageUrl';
import { FetchedUser } from '../../interfaces/User';
import { FetchedSubscription } from '../../interfaces/Subscription';
import { User as UserService } from '../../services/user';
import { Imageurl as ImageUrlService } from '../../services/imageurl';
import { Subscription as SubscriptionService } from '../../services/subscription';
import { Signalr } from '../../services/signalr';
import { StkPushDto } from '../../Dtos/Payments/STKPushDto';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  currentUser: FetchedUser | null = null;
  activeSubscription: FetchedSubscription | null = null;
  userImages: Array<FetchedImageUrl> = [];
  filteredImages: Array<FetchedImageUrl> = [];

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

  constructor(
    private router: Router,
    private userService: UserService,
    private imageService: ImageUrlService,
    private subscriptionService: SubscriptionService,
    private sgrs: Signalr,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
    this.sgrs.on('subscription-created', async (data: any) => {
      this.paymentStatus = 'success';
      this.paymentMessage =
        'Payment successful! Your subscription has been updated.';
      await this.delay(2000);
      this.closePaymentModal();
      this.fetchCurrentUser();
      this.loadDashboard();
    });

    this.sgrs.on('subscription-failed', async (message: string) => {
      this.paymentStatus = 'failed';
      this.paymentMessage = message || 'Payment failed. Please try again.';
      await this.delay(2000);
      this.closePaymentModal();
      this.fetchCurrentUser();
      this.loadDashboard();
    });
  }

  loadDashboard(): void {
    this.fetchCurrentUser();
    this.fetchUserImages();
    this.fetchUserSubscriptions();
  }

  fetchCurrentUser(): void {
    this.userService.getUserById().subscribe({
      next: (res) => {
        if (res?.data) {
          this.currentUser = res.data;

          if (res.data.imageUrls?.length) {
            this.userImages = res.data.imageUrls;
            this.applyFilters();
          }

          if (res.data.subscriptions?.length) {
            this.activeSubscription = this.findActiveSubscription(
              res.data.subscriptions,
            );
          }
          this.cdr.detectChanges();
        }
      },
      error: () => {
        this.showToastMessage('Failed to load account details', 'error');
        this.cdr.detectChanges();
      },
    });
  }

  fetchUserImages(): void {
    this.imageService.getUserImages().subscribe({
      next: (res) => {
        const images = res.dataList ?? [];

        if (Array.isArray(images)) {
          this.userImages = images;
          this.applyFilters();
          this.cdr.detectChanges();
        }
      },
      error: () => {
        this.showToastMessage('Failed to load images', 'error');
        this.cdr.detectChanges();
      },
    });
  }

  fetchUserSubscriptions(): void {
    this.subscriptionService.getUserSubscriptions().subscribe({
      next: (res) => {
        const subscriptions = (res.dataList as FetchedSubscription[]) ?? [];

        if (Array.isArray(subscriptions)) {
          this.activeSubscription = this.findActiveSubscription(subscriptions);
          this.cdr.detectChanges();
        }
      },
      error: () => {
        this.showToastMessage('Failed to load subscriptions', 'error');
        this.cdr.detectChanges();
      },
    });
  }

  findActiveSubscription(
    subscriptions: FetchedSubscription[],
  ): FetchedSubscription | null {
    const active = subscriptions.find((sub) => sub.isActive);
    if (active) {
      return active;
    }

    const sorted = [...subscriptions].sort(
      (a, b) =>
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
    );

    return sorted.length ? sorted[0] : null;
  }

  // Stats calculations
  get totalImages(): number {
    return this.userImages.length;
  }

  get publishedImages(): number {
    return this.userImages.filter((img) => img.isPublished).length;
  }

  get unpublishedImages(): number {
    return this.userImages.filter((img) => !img.isPublished).length;
  }

  get daysRemaining(): number {
    if (!this.activeSubscription) return 0;

    const startDate = new Date(this.activeSubscription.startDate);
    const endDate = new Date(
      startDate.getTime() +
        this.activeSubscription.durationInDays * 24 * 60 * 60 * 1000,
    );
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return Math.max(0, diffDays);
  }

  get subscriptionPlanName(): string {
    if (!this.activeSubscription) return 'No Plan';
    if (this.activeSubscription.durationInDays === 7) return 'Weekly';
    if (this.activeSubscription.durationInDays === 30) return 'Monthly';
    if (this.activeSubscription.durationInDays === 365) return 'Yearly';
    return 'Custom';
  }

  // Filter and sort
  applyFilters(): void {
    let filtered = [...this.userImages];

    if (this.searchTerm) {
      const lowerSearch = this.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (img) =>
          (img.description ?? '').toLowerCase().includes(lowerSearch) ||
          img.imageUrlId.toLowerCase().includes(lowerSearch),
      );
    }

    if (this.filterStatus === 'published') {
      filtered = filtered.filter((img) => img.isPublished);
    } else if (this.filterStatus === 'unpublished') {
      filtered = filtered.filter((img) => !img.isPublished);
    }

    if (this.sortBy === 'newest') {
      filtered.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    } else if (this.sortBy === 'oldest') {
      filtered.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
    } else if (this.sortBy === 'description') {
      filtered.sort((a, b) => {
        const aDesc = a.description || '';
        const bDesc = b.description || '';
        return aDesc.localeCompare(bDesc);
      });
    }

    this.filteredImages = filtered;
    this.currentPage = 0;
  }

  get displayedImages(): FetchedImageUrl[] {
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
  togglePublish(image: FetchedImageUrl): void {
    this.imageService.togglePublishedImageStatus(image.imageUrlId).subscribe({
      next: (result) => {
        if (result.success) {
          image.isPublished = !image.isPublished;
          this.applyFilters();
          this.showToastMessage(
            result.successMessage || 'Image status updated',
            'success',
          );
          this.fetchUserImages();
        } else {
          this.showToastMessage(
            result.errorMessage || 'Failed to toggle publish status',
            'error',
          );
        }
      },
      error: () => {
        this.showToastMessage('Failed to toggle publish status', 'error');
      },
    });
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

    this.imageService.deleteImage(this.imageToDelete).subscribe({
      next: (result) => {
        if (result.success) {
          this.userImages = this.userImages.filter(
            (img) => img.imageUrlId !== this.imageToDelete,
          );
          this.applyFilters();
          this.closeDeleteModal();
          this.showToastMessage(
            result.successMessage || 'Image deleted successfully',
            'success',
          );
        }
        if (!result.success) {
          this.showToastMessage(
            result.errorMessage || 'Failed to delete image',
            'error',
          );
        }
      },
    });
  }

  // Show toast notification
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
    const prices = { weekly: 100, monthly: 399, yearly: 1999 };
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

    if (this.paymentMethod === 'mpesa') {
      let paymentDetails: StkPushDto = {
        Amount: this.selectedPlanPrice,
        DurationInDays:
          this.selectedPlan === 'weekly'
            ? 7
            : this.selectedPlan === 'monthly'
              ? 30
              : 365,
      };

      this.subscriptionService
        .initiatePaymentSubscription(paymentDetails)
        .subscribe({
          next: async (res) => {
            if (res.success) {
              this.paymentStatus = 'stk-sent';
              this.paymentMessage =
                'STK push sent to your phone. Please enter your M-Pesa PIN.';

              await this.delay(5000);
              this.paymentStatus = 'processing';
              this.paymentMessage = 'Processing payment...';
            } else {
              this.paymentStatus = 'failed';
              this.paymentMessage =
                res.errorMessage || 'Failed to initiate payment subscription';
              this.closePaymentModal();
            }
          },
          error: (error: any) => {
            this.paymentStatus = 'failed';
            this.paymentMessage =
              error?.error?.errorMessage ||
              'Failed to initiate payment subscription';
            this.closePaymentModal();
          },
        });
    } else if (this.paymentMethod === 'stripe') {
      // Handle Stripe payment flow (not implemented in this example)
      this.paymentStatus = 'failed';
      this.paymentMessage = 'Stripe payment method is not implemented yet.';
      await this.delay(2000);
      this.closePaymentModal();
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

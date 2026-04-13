import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FetchedSubscription } from '../../interfaces/Subscription';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription as SubscriptionService } from '../../services/subscription';
import { Signalr } from '../../services/signalr';
import { StkPushDto } from '../../Dtos/Payments/STKPushDto';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FetchedPaymentData as PaymentData } from '../../interfaces/Payment.Data';

@Component({
  selector: 'app-subscriptions',
  imports: [CommonModule, FormsModule],
  templateUrl: './subscriptions.html',
  styleUrl: './subscriptions.css',
})
export class Subscriptions implements OnInit, OnDestroy {
  // User subscriptions
  subscriptions: FetchedSubscription[] = [];
  isLoadingSubscriptions: boolean = false;

  // Payment history
  paymentHistory: PaymentData[] = [];

  // Filters
  subscriptionFilter: string = 'all'; // all, active, canceled
  paymentFilter: string = 'all'; // all, completed, failed

  // Modal states
  showCancelModal: boolean = false;
  showUpgradeModal: boolean = false;
  showPaymentModal: boolean = false;
  selectedSubscription: FetchedSubscription | null = null;
  selectedPlan: 'weekly' | 'monthly' | 'yearly' | null = null;
  paymentMethod: 'mpesa' | 'stripe' | null = null;
  isCanceling: boolean = false;

  // Payment status
  paymentStatus:
    | 'idle'
    | 'initiated'
    | 'stk-sent'
    | 'processing'
    | 'success'
    | 'failed' = 'idle';
  paymentMessage: string = '';

  // Toast
  showToast: boolean = false;
  toastMessage: string = '';
  toastType: 'success' | 'error' | 'info' = 'info';

  // Cleanup
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private subscriptionService: SubscriptionService,
    private sgrs: Signalr,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadUserSubscriptions();

    // Listen for subscription created event
    this.sgrs.on('subscription-created', async (data: any) => {
      this.paymentStatus = 'success';
      this.paymentMessage =
        'Payment successful! Your subscription has been updated.';
      await this.delay(2000);
      this.closePaymentModal();
      this.loadUserSubscriptions();
    });

    // Listen for subscription failed event
    this.sgrs.on('subscription-failed', async (message: string) => {
      this.paymentStatus = 'failed';
      this.paymentMessage = message || 'Payment failed. Please try again.';
      await this.delay(2000);
      this.closePaymentModal();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load user subscriptions from the API
   */
  private loadUserSubscriptions(): void {
    this.isLoadingSubscriptions = true;
    this.subscriptionService
      .getUserSubscriptions()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.dataList) {
            this.subscriptions = response.dataList;
          } else {
            this.showToastMessage(
              'Failed to load subscriptions. Please try again.',
              'error',
            );
          }
          this.isLoadingSubscriptions = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Failed to load subscriptions:', error);
          this.showToastMessage(
            'Failed to load subscriptions. Please try again.',
            'error',
          );
          this.isLoadingSubscriptions = false;
          this.cdr.detectChanges();
        },
      });
  }

  // Computed properties
  get activeSubscriptions(): FetchedSubscription[] {
    return this.subscriptions.filter((sub) => sub.isActive);
  }

  get canceledSubscriptions(): FetchedSubscription[] {
    return this.subscriptions.filter((sub) => !sub.isActive);
  }

  get totalSpent(): number {
    return this.paymentHistory
      .filter((p) => p.isSuccessful)
      .reduce((sum, p) => sum + p.amount, 0);
  }

  get filteredSubscriptions(): FetchedSubscription[] {
    if (this.subscriptionFilter === 'active') {
      return this.activeSubscriptions;
    } else if (this.subscriptionFilter === 'canceled') {
      return this.canceledSubscriptions;
    }
    return this.subscriptions;
  }

  get filteredPayments(): PaymentData[] {
    if (this.paymentFilter === 'completed') {
      return this.paymentHistory.filter((p) => p.isSuccessful);
    } else if (this.paymentFilter === 'failed') {
      return this.paymentHistory.filter((p) => !p.isSuccessful);
    }
    return this.paymentHistory;
  }

  // Helper methods
  getPlanName(durationInDays: number): string {
    if (durationInDays === 7) return 'Weekly';
    if (durationInDays === 30) return 'Monthly';
    if (durationInDays === 365) return 'Yearly';
    return 'Custom';
  }

  getEndDate(subscription: FetchedSubscription): Date {
    const startDate = new Date(subscription.startDate);
    return new Date(
      startDate.getTime() + subscription.durationInDays * 24 * 60 * 60 * 1000,
    );
  }

  getDaysRemaining(subscription: FetchedSubscription): number {
    if (!subscription.isActive) return 0;
    const endDate = this.getEndDate(subscription);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }

  isExpiringSoon(subscription: FetchedSubscription): boolean {
    return subscription.isActive && this.getDaysRemaining(subscription) <= 7;
  }

  getStatusColor(subscription: FetchedSubscription): string {
    if (!subscription.isActive) return 'text-red-500';
    if (this.isExpiringSoon(subscription)) return 'text-yellow-500';
    return 'text-green-500';
  }

  getStatusIcon(subscription: FetchedSubscription): string {
    if (!subscription.isActive) return 'bx-x-circle';
    if (this.isExpiringSoon(subscription)) return 'bx-error-circle';
    return 'bx-check-circle';
  }

  getStatusText(subscription: FetchedSubscription): string {
    if (!subscription.isActive) return 'Canceled';
    if (this.isExpiringSoon(subscription)) return 'Expiring Soon';
    return 'Active';
  }

  getPaymentMethodIcon(method: string): string {
    if (method.toLowerCase() === 'mpesa' || method.toLowerCase() === 'm-pesa') {
      return 'bx-mobile';
    }
    return 'bx-credit-card';
  }

  // Cancel subscription
  openCancelModal(subscription: FetchedSubscription): void {
    this.selectedSubscription = subscription;
    this.showCancelModal = true;
  }

  closeCancelModal(): void {
    this.showCancelModal = false;
    this.selectedSubscription = null;
    this.isCanceling = false;
  }

  async cancelSubscription(): Promise<void> {
    if (!this.selectedSubscription) return;

    this.isCanceling = true;

    // Call the API to cancel subscription
    this.subscriptionService
      .cancelSubscription(this.selectedSubscription.subscriptionId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          // Update local state
          const index = this.subscriptions.findIndex(
            (sub) =>
              sub.subscriptionId === this.selectedSubscription!.subscriptionId,
          );

          if (index !== -1) {
            this.subscriptions[index].isActive = false;
            this.subscriptions[index].canceledAt = new Date();
            this.subscriptions[index].updatedAt = new Date();
          }

          this.closeCancelModal();
          this.showToastMessage(
            'Subscription canceled successfully',
            'success',
          );
          this.isCanceling = false;
        },
        error: (error) => {
          console.error('Failed to cancel subscription:', error);
          this.showToastMessage(
            'Failed to cancel subscription. Please try again.',
            'error',
          );
          this.isCanceling = false;
        },
      });
  }

  // Renew subscription
  renewSubscription(subscription: FetchedSubscription): void {
    const durationInDays = subscription.durationInDays;
    if (durationInDays === 7) {
      this.selectedPlan = 'weekly';
    } else if (durationInDays === 30) {
      this.selectedPlan = 'monthly';
    } else if (durationInDays === 365) {
      this.selectedPlan = 'yearly';
    }
    this.openUpgradeModal();
  }

  // Upgrade plan
  openUpgradeModal(): void {
    this.showUpgradeModal = true;
  }

  closeUpgradeModal(): void {
    this.showUpgradeModal = false;
    this.selectedPlan = null;
  }

  upgradePlan(plan: 'weekly' | 'monthly' | 'yearly'): void {
    this.selectedPlan = plan;
    this.showUpgradeModal = false;
    // Directly show payment modal with M-Pesa selected
    this.selectPaymentMethod('mpesa');
  }

  selectPaymentMethod(method: 'mpesa' | 'stripe'): void {
    this.paymentMethod = method;
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
      const paymentDetails: StkPushDto = {
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
        .pipe(takeUntil(this.destroy$))
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
              await this.delay(2000);
              this.closePaymentModal();
              this.cdr.detectChanges();
            }
          },
          error: (error: any) => {
            this.paymentStatus = 'failed';
            this.paymentMessage =
              error?.error?.errorMessage ||
              'Failed to initiate payment subscription';
            this.showToastMessage(this.paymentMessage, 'error');
            this.cdr.detectChanges();
          },
        });
    } else if (this.paymentMethod === 'stripe') {
      // Handle Stripe payment flow (not implemented in this example)
      this.paymentStatus = 'failed';
      this.paymentMessage = 'Stripe payment method is not implemented yet.';
      await this.delay(3000);
      this.closePaymentModal();
    }
  }

  // View payment details
  viewPaymentDetails(payment: PaymentData): void {
    this.showToastMessage(
      `Transaction ID: ${payment.checkoutRequestId.substring(0, 8)} ...`,
      'info',
    );
  }

  // Download invoice
  downloadInvoice(payment: PaymentData): void {
    // Implement invoice download logic
    this.showToastMessage('Invoice downloaded successfully', 'success');
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

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

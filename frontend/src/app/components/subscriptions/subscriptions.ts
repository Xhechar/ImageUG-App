import { Component, OnInit } from '@angular/core';
import { Subscription } from '../../interfaces/Subscription';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface PaymentData {
  PaymentDataId: string;
  UserId: string;
  SubscriptionId: string;
  Amount: number;
  PaymentMethod: string;
  TransactionId: string;
  Status: string;
  PaymentDate: Date;
}

@Component({
  selector: 'app-subscriptions',
  imports: [CommonModule, FormsModule],
  templateUrl: './subscriptions.html',
  styleUrl: './subscriptions.css',
})
export class Subscriptions implements OnInit {
  // User subscriptions
  subscriptions: Subscription[] = [
    {
      SubscriptionId: '1',
      UserId: '1',
      Price: 14.99,
      ReferenceId: 'SUB-2024-001',
      StartDate: new Date('2024-12-01'),
      DurationInDays: 30,
      IsActive: true,
      StripeSubscriptionId: 'sub_1234567890',
    },
    {
      SubscriptionId: '2',
      UserId: '1',
      Price: 4.99,
      ReferenceId: 'SUB-2024-002',
      StartDate: new Date('2024-11-15'),
      DurationInDays: 7,
      IsActive: false,
      CanceledAt: new Date('2024-11-20'),
    },
    {
      SubscriptionId: '3',
      UserId: '1',
      Price: 99.99,
      ReferenceId: 'SUB-2023-003',
      StartDate: new Date('2023-12-01'),
      DurationInDays: 365,
      IsActive: false,
      CanceledAt: new Date('2024-11-30'),
    },
  ];

  // Payment history
  paymentHistory: PaymentData[] = [
    {
      PaymentDataId: '1',
      UserId: '1',
      SubscriptionId: '1',
      Amount: 14.99,
      PaymentMethod: 'Stripe',
      TransactionId: 'TXN-2024-001',
      Status: 'Completed',
      PaymentDate: new Date('2024-12-01'),
    },
    {
      PaymentDataId: '2',
      UserId: '1',
      SubscriptionId: '2',
      Amount: 4.99,
      PaymentMethod: 'M-Pesa',
      TransactionId: 'TXN-2024-002',
      Status: 'Completed',
      PaymentDate: new Date('2024-11-15'),
    },
    {
      PaymentDataId: '3',
      UserId: '1',
      SubscriptionId: '3',
      Amount: 99.99,
      PaymentMethod: 'Stripe',
      TransactionId: 'TXN-2023-003',
      Status: 'Completed',
      PaymentDate: new Date('2023-12-01'),
    },
    {
      PaymentDataId: '4',
      UserId: '1',
      SubscriptionId: '1',
      Amount: 14.99,
      PaymentMethod: 'Stripe',
      TransactionId: 'TXN-2024-004',
      Status: 'Failed',
      PaymentDate: new Date('2024-11-28'),
    },
  ];

  // Filters
  subscriptionFilter: string = 'all'; // all, active, canceled
  paymentFilter: string = 'all'; // all, completed, failed

  // Modal states
  showCancelModal: boolean = false;
  showUpgradeModal: boolean = false;
  selectedSubscription: Subscription | null = null;
  selectedPlan: 'weekly' | 'monthly' | 'yearly' | null = null;
  isCanceling: boolean = false;

  // Toast
  showToast: boolean = false;
  toastMessage: string = '';
  toastType: 'success' | 'error' | 'info' = 'info';

  constructor(private router: Router) {}

  ngOnInit(): void {}

  // Computed properties
  get activeSubscriptions(): Subscription[] {
    return this.subscriptions.filter((sub) => sub.IsActive);
  }

  get canceledSubscriptions(): Subscription[] {
    return this.subscriptions.filter((sub) => !sub.IsActive);
  }

  get totalSpent(): number {
    return this.paymentHistory
      .filter((p) => p.Status === 'Completed')
      .reduce((sum, p) => sum + p.Amount, 0);
  }

  get filteredSubscriptions(): Subscription[] {
    if (this.subscriptionFilter === 'active') {
      return this.activeSubscriptions;
    } else if (this.subscriptionFilter === 'canceled') {
      return this.canceledSubscriptions;
    }
    return this.subscriptions;
  }

  get filteredPayments(): PaymentData[] {
    if (this.paymentFilter === 'completed') {
      return this.paymentHistory.filter((p) => p.Status === 'Completed');
    } else if (this.paymentFilter === 'failed') {
      return this.paymentHistory.filter((p) => p.Status === 'Failed');
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

  getEndDate(subscription: Subscription): Date {
    const startDate = new Date(subscription.StartDate);
    return new Date(
      startDate.getTime() + subscription.DurationInDays * 24 * 60 * 60 * 1000
    );
  }

  getDaysRemaining(subscription: Subscription): number {
    if (!subscription.IsActive) return 0;
    const endDate = this.getEndDate(subscription);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }

  isExpiringSoon(subscription: Subscription): boolean {
    return subscription.IsActive && this.getDaysRemaining(subscription) <= 7;
  }

  getStatusColor(subscription: Subscription): string {
    if (!subscription.IsActive) return 'text-red-500';
    if (this.isExpiringSoon(subscription)) return 'text-yellow-500';
    return 'text-green-500';
  }

  getStatusIcon(subscription: Subscription): string {
    if (!subscription.IsActive) return 'bx-x-circle';
    if (this.isExpiringSoon(subscription)) return 'bx-error-circle';
    return 'bx-check-circle';
  }

  getStatusText(subscription: Subscription): string {
    if (!subscription.IsActive) return 'Canceled';
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
  openCancelModal(subscription: Subscription): void {
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

    // Simulate API call
    await this.delay(2000);

    const index = this.subscriptions.findIndex(
      (sub) => sub.SubscriptionId === this.selectedSubscription!.SubscriptionId
    );

    if (index !== -1) {
      this.subscriptions[index].IsActive = false;
      this.subscriptions[index].CanceledAt = new Date();
      this.subscriptions[index].UpdatedAt = new Date();
    }

    this.closeCancelModal();
    this.showToastMessage('Subscription canceled successfully', 'success');
    // Add your API call here
  }

  // Renew subscription
  renewSubscription(subscription: Subscription): void {
    const durationInDays = subscription.DurationInDays;
    if (durationInDays === 7) {
      this.selectedPlan = 'weekly';
    } else if (durationInDays === 30) {
      this.selectedPlan = 'monthly';
    } else if (durationInDays === 365) {
      this.selectedPlan = 'yearly';
    }

    // Navigate to payment or open upgrade modal
    this.router.navigate(['/dashboard']);
    this.showToastMessage('Redirecting to payment...', 'info');
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
    this.closeUpgradeModal();
    // Navigate to payment
    this.router.navigate(['/dashboard']);
    this.showToastMessage('Redirecting to payment...', 'info');
  }

  // View payment details
  viewPaymentDetails(payment: PaymentData): void {
    this.showToastMessage(`Transaction ID: ${payment.TransactionId}`, 'info');
  }

  // Download invoice
  downloadInvoice(payment: PaymentData): void {
    // Implement invoice download logic
    this.showToastMessage('Invoice downloaded successfully', 'success');
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

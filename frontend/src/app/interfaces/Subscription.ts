import { User } from './User';

export interface Subscription {
  SubscriptionId: string;
  UserId: string;
  Price: number;
  ReferenceId: string;
  StartDate: Date;
  DurationInDays: number;
  IsActive: boolean;
  UpdatedAt?: Date;
  CanceledAt?: Date;
  StripeSubscriptionId?: string;

  User?: User;
}

export interface FetchedSubscription {
  subscriptionId: string;
  userId: string;
  price: number;
  referenceId: string;
  startDate: Date;
  durationInDays: number;
  isActive: boolean;
  updatedAt?: Date;
  canceledAt?: Date;
  stripeSubscriptionId?: string;

  user?: User;
}
import { FetchedImageUrl, ImageUrl } from './ImageUrl';
import { FetchedPaymentData, PaymentData } from './Payment.Data';
import { FetchedSubscription, Subscription } from './Subscription';

export interface User {
  UserId: string;
  Username: string;
  PhoneNumber: string;
  Email: string;
  PasswordHash: string;
  ProfileImageUrl?: string;
  Role: string;
  CreatedAt: Date;
  UpdatedAt?: Date;
  IsWelcomeEmailSent: boolean;
  FreeTrialCount: number;

  ImageUrls: ImageUrl[];
  Subscriptions: Subscription[];
  PaymentDatas: PaymentData[];
}

export interface FetchedUser {
  userId: string;
  username: string;
  phoneNumber: string;
  email: string;
  profileImageUrl?: string;
  role: string;
  createdAt: Date;
  updatedAt?: Date;
  isWelcomeEmailSent: boolean;
  freeTrialCount: number;

  imageUrls?: FetchedImageUrl[];
  subscriptions?: FetchedSubscription[];
  paymentDatas?: FetchedPaymentData[];
}
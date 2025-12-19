import { ImageUrl } from "./ImageUrl";
import { PaymentData } from "./Payment.Data";
import { Subscription } from "./Subscription";

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
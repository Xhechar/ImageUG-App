import { User } from "./User";

export interface PaymentData {
  PaymentDataId: string;
  UserId: string;
  Amount: number;
  DurationInDays: number;
  MerchantRequestId: string;
  CheckoutRequestId: string;
  ResponseDescription: string;
  IsSuccessful: boolean;
  CreatedAt: Date;
  
  User?: User;
}

export interface FetchedPaymentData {
  paymentDataId: string;
  userId: string;
  amount: number;
  durationInDays: number;
  merchantRequestId: string;
  checkoutRequestId: string;
  responseDescription: string;
  isSuccessful: boolean;
  createdAt: Date;
}
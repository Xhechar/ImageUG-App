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
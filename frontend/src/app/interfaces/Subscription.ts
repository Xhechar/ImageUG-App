import { User } from "./User";

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
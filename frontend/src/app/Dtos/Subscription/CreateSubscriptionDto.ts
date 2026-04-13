
export interface CreateSubscriptionDto
{
  UserId: string;
  Price: number;
  ReferenceId: string;
  StartDate: Date;
  EndDate: Date;
  IsActive: boolean;
  StripeSubscriptionId?: string;
}
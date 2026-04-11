import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../Environment/service.environment';
import { ServiceResult } from '../service.result/service.result';
import {
  FetchedSubscription,
  Subscription as UserSubscription,
} from '../interfaces/Subscription';
import { StkPushDto } from '../Dtos/Payments/STKPushDto';

@Injectable({
  providedIn: 'root',
})
export class Subscription {
  readonly API_URL = environment.subscriptionApi;

  constructor(private http: HttpClient) {}

  initiatePaymentSubscription(
    details: StkPushDto,
  ): Observable<ServiceResult<UserSubscription>> {
    return this.http.post<ServiceResult<UserSubscription>>(
      `${this.API_URL}initiate-payment-subscription`,
      details,
      { withCredentials: true },
    );
  }

  getUserSubscriptions(): Observable<ServiceResult<FetchedSubscription>> {
    return this.http.post<ServiceResult<FetchedSubscription>>(
      `${this.API_URL}get-user-subscriptions`,
      {},
      { withCredentials: true },
    );
  }

  /**
   * Cancel a subscription by subscription ID
   */
  cancelSubscription(subscriptionId: string): Observable<ServiceResult<any>> {
    return this.http.post<ServiceResult<any>>(
      `${this.API_URL}cancel-subscription`,
      { subscriptionId },
      { withCredentials: true },
    );
  }

  /**
   * Renew or upgrade a subscription
   */
  renewSubscription(
    subscriptionId: string,
    durationInDays: number,
  ): Observable<ServiceResult<UserSubscription>> {
    return this.http.post<ServiceResult<UserSubscription>>(
      `${this.API_URL}renew-subscription`,
      { subscriptionId, durationInDays },
      { withCredentials: true },
    );
  }
}

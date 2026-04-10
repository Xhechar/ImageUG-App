import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../Environment/service.environment';
import { ServiceResult } from '../service.result/service.result';
import { FetchedSubscription, Subscription as UserSubscription } from '../interfaces/Subscription';
import { StkPushDto } from '../Dtos/Payments/STKPushDto';

@Injectable({
  providedIn: 'root',
})
export class Subscription {
  readonly API_URL = environment.subscriptionApi;

  constructor(private http: HttpClient) {}

  initiatePaymentSubscription(
    details: StkPushDto
  ): Observable<ServiceResult<Subscription>> {
    return this.http.post<ServiceResult<Subscription>>(
      `${this.API_URL}initiate-payment-subscription`,
      details,
      { withCredentials: true }
    );
  }

  getUserSubscriptions(): Observable<ServiceResult<FetchedSubscription>> {
    return this.http.post<ServiceResult<FetchedSubscription>>(
      `${this.API_URL}get-user-subscriptions`,
      {},
      { withCredentials: true }
    );
  }
}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LoginDetails } from '../Dtos/Auth/LoginDetails';
import { Observable } from 'rxjs';
import { ServiceResult } from '../service.result/service.result';
import { ChangePasswordDto } from '../Dtos/Auth/ChangePasswordDto';
import { environment } from '../Environment/service.environment';
import { FetchedUser } from '../interfaces/User';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  readonly API_URL: string = environment.authApi;

  constructor(private http: HttpClient) {}

  login(logins: LoginDetails): Observable<ServiceResult<object>> {
    return this.http.post<ServiceResult<object>>(
      `${this.API_URL}login`,
      logins,
      { withCredentials: true }
    );
  }

  verifyEmail(email: string): Observable<ServiceResult<unknown>> {
    return this.http.post<ServiceResult<unknown>>(
      `${this.API_URL}verify-email`,
      { Email: email },
      { withCredentials: true }
    );
  }

  logout(): Observable<ServiceResult<object>> {
    return this.http.patch<ServiceResult<object>>(
      `${this.API_URL}logout`,
      {},
      { withCredentials: true },
    );
  }

  changePassword(
    details: ChangePasswordDto
  ): Observable<ServiceResult<object>> {
    return this.http.post<ServiceResult<object>>(
      `${this.API_URL}change-password`,
      details,
      { withCredentials: true },
    );
  }

  isLoggedIn(): Observable<ServiceResult<FetchedUser>> {
    return this.http.patch<ServiceResult<FetchedUser>>(
      `${this.API_URL}check-authentication-status`,
      {},
      { withCredentials: true }
    );
  }
}

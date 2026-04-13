import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UpdateProfileImageDto } from '../Dtos/ProfileImage/ProfileImageDto';
import { CreateUserDto } from '../Dtos/User/CreateUserDto';
import { UpdateUserDto } from '../Dtos/User/UpdateUserDto';
import { environment } from '../Environment/service.environment';
import { ServiceResult } from '../service.result/service.result';
import { FetchedUser } from '../interfaces/User';

@Injectable({
  providedIn: 'root',
})
export class User {
  readonly API_URL = environment.userApi;

  constructor(private http: HttpClient) {}

  createUser(details: CreateUserDto): Observable<ServiceResult<User>> {
    return this.http.post<ServiceResult<User>>(
      `${this.API_URL}create-user`,
      details,
      {
        withCredentials: true
      }
    );
  }

  updateUser(details: UpdateUserDto): Observable<ServiceResult<User>> {
    return this.http.put<ServiceResult<User>>(
      `${this.API_URL}update-user`,
      details,
      { withCredentials: true }
    );
  }

  updateProfileImage(
    userId: string,
    details: UpdateProfileImageDto
  ): Observable<ServiceResult<User>> {
    return this.http.patch<ServiceResult<User>>(
      `${this.API_URL}update-profile-image/${userId}`,
      details,
      { withCredentials: true }
    );
  }

  getUserById(): Observable<ServiceResult<FetchedUser>> {
    return this.http.get<ServiceResult<FetchedUser>>(`${this.API_URL}get-user-by-id`, {
      withCredentials: true,
    });
  }

  deleteUser(userId: string): Observable<ServiceResult<User>> {
    return this.http.delete<ServiceResult<User>>(
      `${this.API_URL}delete-user/${userId}`,
      { withCredentials: true }
    );
  }

  toggleUserRole(userId: string): Observable<ServiceResult<User>> {
    return this.http.patch<ServiceResult<User>>(
      `${this.API_URL}toggle-user-role/${userId}`,
      {},
      { withCredentials: true }
    );
  }
}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateImageUrlDto } from '../Dtos/ImageUrl/CreateImageUrlDto';
import { UpdateImageUrlDto } from '../Dtos/ImageUrl/UpdateImageUrlDto';
import { environment } from '../Environment/service.environment';
import { FetchedImageUrl, ImageUrl } from '../interfaces/ImageUrl';
import { ServiceResult } from '../service.result/service.result';

@Injectable({
  providedIn: 'root',
})
export class Imageurl {
  readonly API_URL = environment.imageApi;

  constructor(private http: HttpClient) {}

  createImageUrl(
    details: CreateImageUrlDto
  ): Observable<ServiceResult<ImageUrl>> {
    return this.http.post<ServiceResult<ImageUrl>>(
      `${this.API_URL}create-image-url`,
      details,
      {
        withCredentials: true,
      }
    );
  }

  updateImageUrl(
    imageId: string,
    details: UpdateImageUrlDto
  ): Observable<ServiceResult<ImageUrl>> {
    return this.http.put<ServiceResult<ImageUrl>>(
      `${this.API_URL}update-image-url/${imageId}`,
      details,
      { withCredentials: true }
    );
  }

  getUserImages(): Observable<ServiceResult<FetchedImageUrl>> {
    return this.http.get<ServiceResult<FetchedImageUrl>>(
      `${this.API_URL}get-user-images`,
      { withCredentials: true }
    );
  }

  deleteImage(imageId: string): Observable<ServiceResult<ImageUrl>> {
    return this.http.delete<ServiceResult<ImageUrl>>(
      `${this.API_URL}delete-image/${imageId}`,
      { withCredentials: true }
    );
  }

  togglePublishedImageStatus(
    imageId: string
  ): Observable<ServiceResult<ImageUrl>> {
    return this.http.patch<ServiceResult<ImageUrl>>(
      `${this.API_URL}toggle-published-image-status/${imageId}`,
      {},
      { withCredentials: true }
    );
  }

  getPublishedImages(): Observable<ServiceResult<FetchedImageUrl>> {
    return this.http.get<ServiceResult<FetchedImageUrl>>(
      `${this.API_URL}get-published-images`
    );
  }

  getSinglePublishedImage(ImageUrlId: string): Observable<ServiceResult<FetchedImageUrl>> {
    return this.http.get<ServiceResult<FetchedImageUrl>>(
      `${this.API_URL}get-single-published-image-details/${ImageUrlId}`
    );
  }
}

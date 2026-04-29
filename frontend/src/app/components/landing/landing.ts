import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { FetchedImageUrl } from '../../interfaces/ImageUrl';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Navbar } from '../navbar/navbar';
import { Footer } from '../footer/footer';
import { Imageurl } from '../../services/imageurl';
import { Auth } from '../../services/auth';
import { Signalr } from '../../services/signalr';
import { uploadToCloudinary } from '../../utils';

@Component({
  selector: 'app-landing',
  imports: [FormsModule, CommonModule, Navbar, Footer],
  templateUrl: './landing.html',
  styleUrl: './landing.css',
})
export class Landing implements OnInit {
  // Upload state
  uploadedUrl: string = '';
  isUploading: boolean = false;
  isCopied: boolean = false;

  // Toast
  showToast: boolean = false;
  toastMessage: string = '';
  toastType: 'success' | 'error' | 'info' = 'info';

  // Auth
  isLoggedIn: boolean = false;

  // Gallery
  isLoadingImages: boolean = false;
  imagesError: string = '';
  allPublishedImages: FetchedImageUrl[] = [];

  // Pagination
  currentPage: number = 0;
  imagesPerPage: number = 12;

  constructor(
    private router: Router,
    private imgs: Imageurl,
    private as: Auth,
    private sgrs: Signalr,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.fetchCurrentUser();
    this.fetchPublishedImages();
  }

  fetchCurrentUser(): void {
    this.as.isLoggedIn().subscribe({
      next: (res) => {
        this.isLoggedIn = !!(res.success && res.data);
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoggedIn = false;
        this.cdr.detectChanges();
      },
    });
  }

  navigateToSingleImage(imageId: string): void {
    this.router.navigate(['/published-images', imageId]);
  }

  fetchPublishedImages(): void {
    this.isLoadingImages = true;
    this.imagesError = '';
    this.imgs.getPublishedImages().subscribe({
      next: (res) => {
        this.isLoadingImages = false;
        this.allPublishedImages =
          res.success && res.dataList ? res.dataList : [];
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.isLoadingImages = false;
        this.imagesError =
          err?.error?.errorMessage ?? err.message ?? 'Failed to load images.';
        this.cdr.detectChanges();
      },
    });
  }

  get displayedImages(): FetchedImageUrl[] {
    const start = this.currentPage * this.imagesPerPage;
    return this.allPublishedImages.slice(start, start + this.imagesPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.allPublishedImages.length / this.imagesPerPage);
  }

  get showPagination(): boolean {
    return this.totalPages > 1;
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.scrollToGallery();
    }
  }

  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.scrollToGallery();
    }
  }

  scrollToGallery(): void {
    document
      .getElementById('gallery-section')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (!file) return;
    // Reset any previous result
    this.uploadedUrl = '';
    this.isCopied = false;
    this.uploadImage(file);
    // Clear the input so the same file can be re-selected
    event.target.value = '';
  }

  async uploadImage(file: File): Promise<void> {
    if (!this.isLoggedIn) {
      const attempts = Number(
        sessionStorage.getItem('submissionAttempt') ?? '0',
      );
      if (attempts >= 3) {
        this.showToastMessage('Please log in to upload more images.', 'error');
        this.navigateToLogin();
        this.cdr.detectChanges();
        return;
      }
      sessionStorage.setItem('submissionAttempt', String(attempts + 1));
    }

    this.isUploading = true;
    this.cdr.detectChanges();

    try {
      const secureUrl = await uploadToCloudinary(file);
      if (secureUrl) {
        this.uploadedUrl = secureUrl;
        this.showToastMessage('Image uploaded successfully!', 'success');
      } else {
        this.showToastMessage('Upload failed. Please try again.', 'error');
      }
    } catch {
      this.showToastMessage('Upload failed. Please try again.', 'error');
    } finally {
      this.isUploading = false;
      this.cdr.detectChanges();
    }
  }

  copyUrl(): void {
    if (!this.uploadedUrl) return;
    navigator.clipboard.writeText(this.uploadedUrl).then(() => {
      this.isCopied = true;
      this.cdr.detectChanges();
      setTimeout(() => {
        this.isCopied = false;
        this.cdr.detectChanges();
      }, 1500);
    });
  }

  resetUpload(): void {
    this.uploadedUrl = '';
    this.isCopied = false;
    this.isUploading = false;
  }

  showToastMessage(
    message: string,
    type: 'success' | 'error' | 'info' = 'info',
  ): void {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
    }, 3500);
  }

  getUserInitials(username: string): string {
    return username.substring(0, 2).toUpperCase();
  }

  getInitialsColor(username: string): string {
    const colors = [
      'bg-violet-500',
      'bg-emerald-500',
      'bg-amber-500',
      'bg-rose-500',
      'bg-sky-500',
      'bg-fuchsia-500',
    ];
    return colors[username.charCodeAt(0) % colors.length];
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  navigateToSignup(): void {
    this.router.navigate(['/join-us']);
  }

  onImageLoad(event: any): void {
    event.target.classList.add('loaded');
  }

  onImageError(event: any): void {
    event.target.src = 'assets/placeholder.png';
  }
}

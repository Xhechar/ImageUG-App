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
  selectedFile: File | null = null;
  selectedFilePreview: string | null = null;
  isUploading: boolean = false;
  generatedUrl: string = '';
  isCopied: boolean = false;
  showToast: boolean = false;
  toastMessage: string = '';
  toastType: 'success' | 'error' | 'info' = 'info';
  isLoggedIn: boolean = false;

  // Gallery state
  isLoadingImages: boolean = false;
  imagesError: string = '';

  // Pagination
  currentPage: number = 0;
  imagesPerPage: number = 12;
  allPublishedImages: FetchedImageUrl[] = [];

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
        if (res.success && res.dataList) {
          this.allPublishedImages = res.dataList;
        } else {
          this.allPublishedImages = [];
        }
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

    this.selectedFile = file;
    this.generatedUrl = '';
    this.isCopied = false;

    // Preview
    const reader = new FileReader();
    reader.onload = (e) => {
      this.selectedFilePreview = e.target?.result as string;
    };
    reader.readAsDataURL(file);

    // Auto-upload
    this.uploadImage(file);
  }

  async uploadImage(file: File): Promise<void> {
    if (!this.isLoggedIn) {
      if (sessionStorage.getItem('submissionAttempt') !== null) {
        if (Number(sessionStorage.getItem('submissionAttempt')) === 3) {
          this.showToastMessage(
            'Please log in to upload more images.',
            'error',
          );
          this.navigateToLogin();
          return;
        }
      }

      sessionStorage.setItem(
        'submissionAttempt',
        String(Number(sessionStorage.getItem('submissionAttempt') ?? '0') + 1),
      );
    }

    this.isUploading = true;
    this.generatedUrl = '';

    const secureUrl: string = await uploadToCloudinary(file);
    if (secureUrl) {
      this.generatedUrl = secureUrl;
      this.isUploading = false;
      this.showToastMessage('Image uploaded successfully!', 'success');
    } else {
      this.isUploading = false;
      this.showToastMessage('Image upload failed. Please try again.', 'error');
    }
  }

  copyUrl(): void {
    if (!this.generatedUrl) return;
    navigator.clipboard.writeText(this.generatedUrl).then(() => {
      this.isCopied = true;
      setTimeout(() => (this.isCopied = false), 1000);
    });
  }

  resetUpload(): void {
    this.selectedFile = null;
    this.selectedFilePreview = null;
    this.generatedUrl = '';
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
      'bg-primary',
      'bg-accent',
      'bg-secondary',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
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

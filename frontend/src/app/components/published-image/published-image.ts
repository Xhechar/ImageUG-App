import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FetchedImageUrl } from '../../interfaces/ImageUrl';
import { Footer } from '../footer/footer';
import { Imageurl } from '../../services/imageurl';

interface UserStats {
  totalImages: number;
  publishedImages: number;
  memberSince: string;
}

@Component({
  selector: 'app-published-image',
  imports: [CommonModule, FormsModule, Footer],
  templateUrl: './published-image.html',
  styleUrl: './published-image.css',
})
export class PublishedImage implements OnInit {
  imageId: string | null = null;
  currentImage: FetchedImageUrl | null = null;
  ownerStats: UserStats | null = null;
  otherImages: FetchedImageUrl[] = [];

  isLoading: boolean = false;
  imageNotFound: boolean = false;

  // Toast
  showToast: boolean = false;
  toastMessage: string = '';
  toastType: 'success' | 'error' | 'info' = 'info';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private imageurl: Imageurl,
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.imageId = params['ImageUrlId'];
      if (this.imageId) {
        this.loadImageDetails();
      }
    });

    // Scroll to top on navigation
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async loadImageDetails(): Promise<void> {
    if (!this.imageId) return;

    try {
      this.isLoading = true;

      // Fetch the specific published image
      this.imageurl.getSinglePublishedImage(this.imageId).subscribe({
        next: (result) => {
          this.isLoading = false;
          if (result.success && result.data) {
            this.currentImage = result.data;
            this.loadOwnerStats();
            this.loadOtherImages();
          } else {
            this.imageNotFound = true;
            this.showToastMessage(
              result.errorMessage || 'Image not found',
              'error',
            );
          }
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          this.isLoading = false;
          this.imageNotFound = true;
          this.showToastMessage(
            err?.error?.errorMessage ?? 'Failed to load image details',
            'error',
          );
          this.cdr.detectChanges();
        },
        complete: () => {
          this.isLoading = false;
          this.cdr.detectChanges();
        },
      });
    } catch (error: any) {
      this.showToastMessage(
        error?.error?.errorMessage ?? 'Failed to load image details',
        'error',
      );
      this.imageNotFound = true;
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  loadOwnerStats(): void {
    if (!this.currentImage?.user) return;
    this.ownerStats = {
      totalImages: this.currentImage.user.imageUrls?.length || 0,
      publishedImages:
        this.currentImage.user.imageUrls?.filter((img) => img.isPublished)
          .length || 0,
      memberSince: this.formatMemberSince(this.currentImage.user.createdAt),
    };
  }

  loadOtherImages(): void {
    if (!this.currentImage) return;

    // Get all published images and filter by user
    this.imageurl.getPublishedImages().subscribe({
      next: (result) => {
        if (result.success && result.dataList) {
          this.otherImages = result.dataList
            .filter(
              (img) =>
                img.userId === this.currentImage!.userId &&
                img.imageUrlId !== this.currentImage!.imageUrlId,
            )
            .slice(0, 4); // Show maximum 4 other images
        }
      },
      error: (err) => {
        console.error('Error loading other images:', err);
      },
    });
  }

  // Calculate days since creation
  getDaysSinceCreation(): number {
    if (!this.currentImage) return 0;
    const createdDate = new Date(this.currentImage.createdAt);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - createdDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  // Format member since
  formatMemberSince(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  }

  // Get user initials
  getUserInitials(): string {
    if (!this.currentImage?.user) return 'U';
    return this.currentImage.user.username.substring(0, 2).toUpperCase();
  }

  getInitialsColor(): string {
    if (!this.currentImage?.user) return 'bg-primary';
    const colors = [
      'bg-primary',
      'bg-secondary',
      'bg-accent',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
    ];
    const index = this.currentImage.user.username.charCodeAt(0) % colors.length;
    return colors[index];
  }

  // Copy URL to clipboard
  copyUrl(): void {
    if (!this.currentImage) return;

    navigator.clipboard
      .writeText(this.currentImage.url)
      .then(() => {
        this.showToastMessage('Image URL copied to clipboard!', 'success');
      })
      .catch(() => {
        this.showToastMessage('Failed to copy URL', 'error');
      });
  }

  // Download image
  async downloadImage(): Promise<void> {
    if (!this.currentImage) return;

    try {
      this.showToastMessage('Downloading image...', 'info');

      // In real app, implement actual download
      // For now, just open in new tab
      window.open(this.currentImage.url, '_blank');

      this.showToastMessage('Image download started!', 'success');
    } catch (error) {
      this.showToastMessage('Failed to download image', 'error');
    }
  }

  // Navigate to owner's profile
  viewOwnerProfile(): void {
    if (!this.currentImage?.user) return;
    // this.router.navigate(['/profile', this.currentImage.user.userId]);
  }

  // Navigate to another image
  viewImage(imageId: string): void {
    this.router.navigate(['/published-images', imageId]);
  }

  // Navigate back
  goBack(): void {
    window.history.back();
  }

  // Toast
  showToastMessage(
    message: string,
    type: 'success' | 'error' | 'info' = 'info',
  ): void {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }

  // Image load handler
  onImageLoad(event: any): void {
    event.target.classList.add('loaded');
  }

  onImageError(event: any): void {
    console.error('Failed to load image:', event.target.src);
  }

  // Helper
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

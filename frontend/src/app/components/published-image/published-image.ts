import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ImageUrl } from '../../interfaces/ImageUrl';
import { User } from '../../interfaces/User';
import { Footer } from '../footer/footer';

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
  currentImage: ImageUrl | null = null;
  ownerStats: UserStats | null = null;
  otherImages: ImageUrl[] = [];

  isLoading: boolean = false;
  imageNotFound: boolean = false;

  // Toast
  showToast: boolean = false;
  toastMessage: string = '';
  toastType: 'success' | 'error' | 'info' = 'info';

  // Dummy data for demonstration
  private dummyUser: User = {
    UserId: '1',
    Username: 'JohnDoe',
    Email: 'john.doe@example.com',
    ProfileImageUrl: 'https://i.pravatar.cc/150?img=12',
    Role: 'Premium User',
    CreatedAt: new Date('2024-01-15'),
    PhoneNumber: '',
    PasswordHash: '',
    IsWelcomeEmailSent: false,
    FreeTrialCount: 0,
    ImageUrls: [],
    Subscriptions: [],
    PaymentDatas: [],
  };

  private dummyImages: ImageUrl[] = [
    {
      ImageUrlId: '1',
      Url: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=800&q=80',
      UserId: '1',
      Description:
        'Beautiful sunset over the mountains with vibrant orange and pink hues painting the sky. A perfect moment captured during golden hour.',
      IsPublished: true,
      CreatedAt: new Date('2024-12-15'),
      User: this.dummyUser,
    },
    {
      ImageUrlId: '2',
      Url: 'https://images.unsplash.com/photo-1682687221038-404cb8830901?w=400&q=80',
      UserId: '1',
      Description: 'Modern architecture design',
      IsPublished: true,
      CreatedAt: new Date('2024-12-14'),
      User: this.dummyUser,
    },
    {
      ImageUrlId: '3',
      Url: 'https://images.unsplash.com/photo-1682687220063-4742bd7fd538?w=400&q=80',
      UserId: '1',
      Description: 'Abstract art composition',
      IsPublished: true,
      CreatedAt: new Date('2024-12-13'),
      User: this.dummyUser,
    },
    {
      ImageUrlId: '4',
      Url: 'https://images.unsplash.com/photo-1682687220923-c58b9a4592ae?w=400&q=80',
      UserId: '1',
      Description: 'Nature landscape',
      IsPublished: true,
      CreatedAt: new Date('2024-12-12'),
      User: this.dummyUser,
    },
    {
      ImageUrlId: '5',
      Url: 'https://images.unsplash.com/photo-1682687221080-5cb261c645cb?w=400&q=80',
      UserId: '1',
      Description: 'Urban street photography',
      IsPublished: true,
      CreatedAt: new Date('2024-12-11'),
      User: this.dummyUser,
    },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.imageId = params['ImageUrlId'];
      console.log('image id: ', this.imageId);
      console.log('1. at on init', this.isLoading);
      if (this.imageId) {
        this.loadImageDetails();
      }
    });
  }

  async loadImageDetails(): Promise<void> {
    try {
      this.isLoading = true;
      // Simulate API call delay
      await this.delay(1000);

      // In real app, fetch from backend:
      // const response = await this.imageService.getImageById(this.imageId);
      // this.currentImage = response.image;

      // For demo, use dummy data
      const image = this.dummyImages.find(
        (img) => img.ImageUrlId === this.imageId
      );

      console.log('image is: ', image);

      if (!image) {
        this.imageNotFound = true;
        this.isLoading = false;
        this.cdr.detectChanges();
        return;
      }

      this.currentImage = image;
      console.log('current image', this.currentImage);

      // Load owner stats
      this.loadOwnerStats();

      // Load other images by same user
      this.loadOtherImages();

      this.isLoading = false;
      console.log(
        'logging status. load image details method: ',
        this.isLoading
      );
    } catch (error) {
      console.error('Error loading image:', error);
      this.showToastMessage('Failed to load image details', 'error');
      this.imageNotFound = true;
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  loadOwnerStats(): void {
    console.log('1: logging status. load owner stats method: ', this.isLoading);
    if (!this.currentImage?.User) return;

    // In real app, fetch from backend:
    // const stats = await this.userService.getUserStats(this.currentImage.UserId);

    // For demo, calculate from dummy data
    const userImages = this.dummyImages.filter(
      (img) => img.UserId === this.currentImage!.UserId
    );

    console.log('user images: ', userImages);

    this.ownerStats = {
      totalImages: userImages.length,
      publishedImages: userImages.filter((img) => img.IsPublished).length,
      memberSince: this.formatMemberSince(this.currentImage.User.CreatedAt),
    };

    console.log('logging status. load owner stats method: ', this.isLoading);
  }

  loadOtherImages(): void {
    if (!this.currentImage) return;

    // Get other published images by the same user, excluding current image
    this.otherImages = this.dummyImages
      .filter(
        (img) =>
          img.UserId === this.currentImage!.UserId &&
          img.ImageUrlId !== this.currentImage!.ImageUrlId &&
          img.IsPublished
      )
      .slice(0, 4); // Show maximum 4 other images

    console.log('logging status. load other images method: ', this.isLoading);
  }

  // Calculate days since creation
  getDaysSinceCreation(): number {
    if (!this.currentImage) return 0;
    const createdDate = new Date(this.currentImage.CreatedAt);
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
    if (!this.currentImage?.User) return 'U';
    return this.currentImage.User.Username.substring(0, 2).toUpperCase();
  }

  getInitialsColor(): string {
    if (!this.currentImage?.User) return 'bg-primary';
    const colors = [
      'bg-primary',
      'bg-secondary',
      'bg-accent',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
    ];
    const index = this.currentImage.User.Username.charCodeAt(0) % colors.length;
    return colors[index];
  }

  // Copy URL to clipboard
  copyUrl(): void {
    if (!this.currentImage) return;

    navigator.clipboard
      .writeText(this.currentImage.Url)
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
      window.open(this.currentImage.Url, '_blank');

      this.showToastMessage('Image download started!', 'success');
    } catch (error) {
      this.showToastMessage('Failed to download image', 'error');
    }
  }

  // Navigate to owner's profile
  viewOwnerProfile(): void {
    if (!this.currentImage?.User) return;
    this.router.navigate(['/profile', this.currentImage.User.UserId]);
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
    type: 'success' | 'error' | 'info' = 'info'
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

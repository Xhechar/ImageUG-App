import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ImageUrl } from '../../interfaces/ImageUrl';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Navbar } from '../navbar/navbar';
import { Footer } from '../footer/footer';

@Component({
  selector: 'app-landing',
  imports: [FormsModule, CommonModule, Navbar, Footer],
  templateUrl: './landing.html',
  styleUrl: './landing.css',
})
export class Landing {
  selectedFile: File | null = null;
  description: string = '';
  showToast: boolean = false;
  toastMessage: string = '';
  isLoggedIn: boolean = false; // Set this based on your auth service

  // Pagination
  currentPage: number = 0;
  imagesPerPage: number = 10;

  // Dummy published images - OPTIMIZED with smaller, faster loading images
  allPublishedImages: ImageUrl[] = [
    {
      ImageUrlId: '1',
      Url: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=400&q=80',
      Description: 'Beautiful sunset over the mountains',
      User: {
        Username: 'JohnDoe', ProfileImageUrl: undefined,
        UserId: '',
        PhoneNumber: '',
        Email: '',
        PasswordHash: '',
        Role: '',
        CreatedAt: new Date(),
        IsWelcomeEmailSent: false,
        FreeTrialCount: 0,
        ImageUrls: [],
        Subscriptions: [],
        PaymentDatas: []
      },
      CreatedAt: new Date('2024-01-15'),
      UserId: '',
      IsPublished: false
    },
    {
      ImageUrlId: '2',
      Url: 'https://images.unsplash.com/photo-1682687221038-404cb8830901?w=400&q=80',
      Description: 'Modern architecture design',
      User: {
        Username: 'SarahSmith',
        ProfileImageUrl: 'https://i.pravatar.cc/150?img=1',
        UserId: '',
        PhoneNumber: '',
        Email: '',
        PasswordHash: '',
        Role: '',
        CreatedAt: new Date(),
        IsWelcomeEmailSent: false,
        FreeTrialCount: 0,
        ImageUrls: [],
        Subscriptions: [],
        PaymentDatas: []
      },
      CreatedAt: new Date('2024-01-14'),
      UserId: '',
      IsPublished: false
    },
    {
      ImageUrlId: '3',
      Url: 'https://images.unsplash.com/photo-1682687220063-4742bd7fd538?w=400&q=80',
      Description: 'Abstract art composition',
      User: {
        Username: 'MikeJohnson', ProfileImageUrl: undefined,
        UserId: '',
        PhoneNumber: '',
        Email: '',
        PasswordHash: '',
        Role: '',
        CreatedAt: new Date(),
        IsWelcomeEmailSent: false,
        FreeTrialCount: 0,
        ImageUrls: [],
        Subscriptions: [],
        PaymentDatas: []
      },
      CreatedAt: new Date('2024-01-13'),
      UserId: '',
      IsPublished: false
    },
    {
      ImageUrlId: '4',
      Url: 'https://images.unsplash.com/photo-1682687220923-c58b9a4592ae?w=400&q=80',
      Description: 'Nature landscape photography',
      User: {
        Username: 'EmilyBrown',
        ProfileImageUrl: 'https://i.pravatar.cc/150?img=5',
        UserId: '',
        PhoneNumber: '',
        Email: '',
        PasswordHash: '',
        Role: '',
        CreatedAt: new Date(),
        IsWelcomeEmailSent: false,
        FreeTrialCount: 0,
        ImageUrls: [],
        Subscriptions: [],
        PaymentDatas: []
      },
      CreatedAt: new Date('2024-01-12'),
      UserId: '',
      IsPublished: false
    },
    {
      ImageUrlId: '5',
      Url: 'https://images.unsplash.com/photo-1682687221080-5cb261c645cb?w=400&q=80',
      Description: 'Urban street photography',
      User: {
        Username: 'ChrisWilson', ProfileImageUrl: undefined,
        UserId: '',
        PhoneNumber: '',
        Email: '',
        PasswordHash: '',
        Role: '',
        CreatedAt: new Date(),
        IsWelcomeEmailSent: false,
        FreeTrialCount: 0,
        ImageUrls: [],
        Subscriptions: [],
        PaymentDatas: []
      },
      CreatedAt: new Date('2024-01-11'),
      UserId: '',
      IsPublished: false
    },
    {
      ImageUrlId: '6',
      Url: 'https://images.unsplash.com/photo-1682687220199-d0124f48f95b?w=400&q=80',
      Description: 'Minimalist interior design',
      User: {
        Username: 'LisaAnderson',
        ProfileImageUrl: 'https://i.pravatar.cc/150?img=9',
        UserId: '',
        PhoneNumber: '',
        Email: '',
        PasswordHash: '',
        Role: '',
        CreatedAt: new Date(),
        IsWelcomeEmailSent: false,
        FreeTrialCount: 0,
        ImageUrls: [],
        Subscriptions: [],
        PaymentDatas: []
      },
      CreatedAt: new Date('2024-01-10'),
      UserId: '',
      IsPublished: false
    },
    {
      ImageUrlId: '7',
      Url: 'https://images.unsplash.com/photo-1682687220566-5599dbbebf11?w=400&q=80',
      Description: 'Food photography masterpiece',
      User: {
        Username: 'DavidMartinez', ProfileImageUrl: undefined,
        UserId: '',
        PhoneNumber: '',
        Email: '',
        PasswordHash: '',
        Role: '',
        CreatedAt: new Date(),
        IsWelcomeEmailSent: false,
        FreeTrialCount: 0,
        ImageUrls: [],
        Subscriptions: [],
        PaymentDatas: []
      },
      CreatedAt: new Date('2024-01-09'),
      UserId: '',
      IsPublished: false
    },
    {
      ImageUrlId: '8',
      Url: 'https://images.unsplash.com/photo-1682687221248-3116ba6abb93?w=400&q=80',
      Description: 'Wildlife in natural habitat',
      User: {
        Username: 'JessicaTaylor',
        ProfileImageUrl: 'https://i.pravatar.cc/150?img=20',
        UserId: '',
        PhoneNumber: '',
        Email: '',
        PasswordHash: '',
        Role: '',
        CreatedAt: new Date(),
        IsWelcomeEmailSent: false,
        FreeTrialCount: 0,
        ImageUrls: [],
        Subscriptions: [],
        PaymentDatas: []
      },
      CreatedAt: new Date('2024-01-08'),
      UserId: '',
      IsPublished: false
    },
    {
      ImageUrlId: '9',
      Url: 'https://images.unsplash.com/photo-1682687220208-22d7a2543e88?w=400&q=80',
      Description: 'Technology and innovation',
      User: {
        Username: 'RobertThomas', ProfileImageUrl: undefined,
        UserId: '',
        PhoneNumber: '',
        Email: '',
        PasswordHash: '',
        Role: '',
        CreatedAt: new Date(),
        IsWelcomeEmailSent: false,
        FreeTrialCount: 0,
        ImageUrls: [],
        Subscriptions: [],
        PaymentDatas: []
      },
      CreatedAt: new Date('2024-01-07'),
      UserId: '',
      IsPublished: false
    },
    {
      ImageUrlId: '10',
      Url: 'https://images.unsplash.com/photo-1682687221363-72518513620e?w=400&q=80',
      Description: 'Fashion editorial shot',
      User: {
        Username: 'AmandaWhite',
        ProfileImageUrl: 'https://i.pravatar.cc/150?img=16',
        UserId: '',
        PhoneNumber: '',
        Email: '',
        PasswordHash: '',
        Role: '',
        CreatedAt: new Date(),
        IsWelcomeEmailSent: false,
        FreeTrialCount: 0,
        ImageUrls: [],
        Subscriptions: [],
        PaymentDatas: []
      },
      CreatedAt: new Date('2024-01-06'),
      UserId: '',
      IsPublished: false
    },
    {
      ImageUrlId: '11',
      Url: 'https://images.unsplash.com/photo-1682687220015-186f63b8850a?w=400&q=80',
      Description: 'Coastal seascape view',
      User: {
        Username: 'KevinHarris', ProfileImageUrl: undefined,
        UserId: '',
        PhoneNumber: '',
        Email: '',
        PasswordHash: '',
        Role: '',
        CreatedAt: new Date(),
        IsWelcomeEmailSent: false,
        FreeTrialCount: 0,
        ImageUrls: [],
        Subscriptions: [],
        PaymentDatas: []
      },
      CreatedAt: new Date('2024-01-05'),
      UserId: '',
      IsPublished: false
    },
    {
      ImageUrlId: '12',
      Url: 'https://images.unsplash.com/photo-1682687220067-dced3a881c55?w=400&q=80',
      Description: 'Artistic black and white',
      User: {
        Username: 'NancyClark',
        ProfileImageUrl: 'https://i.pravatar.cc/150?img=30',
        UserId: '',
        PhoneNumber: '',
        Email: '',
        PasswordHash: '',
        Role: '',
        CreatedAt: new Date(),
        IsWelcomeEmailSent: false,
        FreeTrialCount: 0,
        ImageUrls: [],
        Subscriptions: [],
        PaymentDatas: []
      },
      CreatedAt: new Date('2024-01-04'),
      UserId: '',
      IsPublished: false
    },
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Preload images for the first page
    this.preloadImages();
  }

  preloadImages(): void {
    // Preload only the images for the current page
    this.displayedImages.forEach((image) => {
      const img = new Image();
      img.src = image.Url;
      if (image.User?.ProfileImageUrl) {
        const profileImg = new Image();
        profileImg.src = image.User.ProfileImageUrl;
      }
    });
  }

  get displayedImages(): ImageUrl[] {
    const start = this.currentPage * this.imagesPerPage;
    const end = start + this.imagesPerPage;
    return this.allPublishedImages.slice(start, end);
  }

  get totalPages(): number {
    return Math.ceil(this.allPublishedImages.length / this.imagesPerPage);
  }

  get showPagination(): boolean {
    return this.allPublishedImages.length > this.imagesPerPage;
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.preloadImages(); // Preload next page images
      this.scrollToGallery();
    }
  }

  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.preloadImages(); // Preload previous page images
      this.scrollToGallery();
    }
  }

  scrollToGallery(): void {
    const element = document.getElementById('gallery-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  handleSubmit(event: any): void {
    event.preventDefault();

    if (!this.isLoggedIn) {
      this.showToastMessage('Please login first to create image URLs');
      return;
    }

    if (!this.selectedFile) {
      this.showToastMessage('Please select an image file');
      return;
    }

    // Your Cloudinary upload logic here
    // const formData = new FormData();
    // formData.append('file', this.selectedFile);
    // formData.append('description', this.description);

    this.showToastMessage('Image uploaded successfully!');
    this.selectedFile = null;
    this.description = '';
  }

  showToastMessage(message: string): void {
    this.toastMessage = message;
    this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }

  getUserInitials(username: string): string {
    return username.substring(0, 2).toUpperCase();
  }

  getInitialsColor(username: string): string {
    const colors = [
      'bg-primary',
      'bg-secondary',
      'bg-accent',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
    ];
    const index = username.charCodeAt(0) % colors.length;
    return colors[index];
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  navigateToSignup(): void {
    this.router.navigate(['/join-us']);
  }

  // Handle image load event
  onImageLoad(event: any): void {
    event.target.classList.add('loaded');
  }

  // Handle image error
  onImageError(event: any): void {
    console.error('Failed to load image:', event.target.src);
    // Optionally set a fallback image
    event.target.src = 'assets/placeholder.png';
  }
}

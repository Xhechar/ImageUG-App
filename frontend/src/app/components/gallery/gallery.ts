import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ImageUrl } from '../../interfaces/ImageUrl';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-gallery',
  imports: [CommonModule, FormsModule],
  templateUrl: './gallery.html',
  styleUrl: './gallery.css',
})
export class Gallery implements OnInit {
  // User images
  userImages: ImageUrl[] = [
    {
      ImageUrlId: '1',
      Url: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=400&q=80',
      UserId: '1',
      Description: 'Beautiful sunset landscape photography',
      IsPublished: true,
      CreatedAt: new Date('2024-12-15'),
    },
    {
      ImageUrlId: '2',
      Url: 'https://images.unsplash.com/photo-1682687221038-404cb8830901?w=400&q=80',
      UserId: '1',
      Description: 'Modern architecture and design',
      IsPublished: false,
      CreatedAt: new Date('2024-12-14'),
    },
    {
      ImageUrlId: '3',
      Url: 'https://images.unsplash.com/photo-1682687220063-4742bd7fd538?w=400&q=80',
      UserId: '1',
      Description: 'Abstract art composition with vibrant colors',
      IsPublished: true,
      CreatedAt: new Date('2024-12-13'),
    },
    {
      ImageUrlId: '4',
      Url: 'https://images.unsplash.com/photo-1682687220923-c58b9a4592ae?w=400&q=80',
      UserId: '1',
      Description: 'Nature landscape with mountains',
      IsPublished: false,
      CreatedAt: new Date('2024-12-12'),
    },
    {
      ImageUrlId: '5',
      Url: 'https://images.unsplash.com/photo-1682687221080-5cb261c645cb?w=400&q=80',
      UserId: '1',
      Description: 'Urban street photography in city',
      IsPublished: true,
      CreatedAt: new Date('2024-12-11'),
    },
    {
      ImageUrlId: '6',
      Url: 'https://images.unsplash.com/photo-1682687220199-d0124f48f95b?w=400&q=80',
      UserId: '1',
      Description: 'Minimalist interior design concept',
      IsPublished: true,
      CreatedAt: new Date('2024-12-10'),
    },
  ];

  filteredImages: ImageUrl[] = [];

  // Filters
  searchTerm: string = '';
  filterStatus: string = 'all';
  sortBy: string = 'newest';

  // Pagination
  currentPage: number = 0;
  itemsPerPage: number = 9;

  // Modal states
  showCreateModal: boolean = false;
  showEditModal: boolean = false;
  showDeleteModal: boolean = false;

  // Create/Edit data
  selectedImage: ImageUrl | null = null;
  selectedFile: File | null = null;
  imageDescription: string = '';
  isUploading: boolean = false;

  // Toast
  showToast: boolean = false;
  toastMessage: string = '';
  toastType: 'success' | 'error' | 'info' = 'info';

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.applyFilters();
  }

  // Stats
  get totalImages(): number {
    return this.userImages.length;
  }

  get publishedImages(): number {
    return this.userImages.filter((img) => img.IsPublished).length;
  }

  get unpublishedImages(): number {
    return this.userImages.filter((img) => !img.IsPublished).length;
  }

  // Filter and sort
  applyFilters(): void {
    let filtered = [...this.userImages];

    if (this.searchTerm) {
      filtered = filtered.filter(
        (img) =>
          img.Description?.toLowerCase().includes(
            this.searchTerm.toLowerCase()
          ) ||
          img.ImageUrlId.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    if (this.filterStatus === 'published') {
      filtered = filtered.filter((img) => img.IsPublished);
    } else if (this.filterStatus === 'unpublished') {
      filtered = filtered.filter((img) => !img.IsPublished);
    }

    if (this.sortBy === 'newest') {
      filtered.sort(
        (a, b) =>
          new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime()
      );
    } else if (this.sortBy === 'oldest') {
      filtered.sort(
        (a, b) =>
          new Date(a.CreatedAt).getTime() - new Date(b.CreatedAt).getTime()
      );
    } else if (this.sortBy === 'description') {
      filtered.sort((a, b) => {
        const aDesc = a.Description || '';
        const bDesc = b.Description || '';
        return aDesc.localeCompare(bDesc);
      });
    }

    this.filteredImages = filtered;
    this.currentPage = 0;
  }

  get displayedImages(): ImageUrl[] {
    const start = this.currentPage * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredImages.slice(start, end);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredImages.length / this.itemsPerPage);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
    }
  }

  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
    }
  }

  // Create new image
  openCreateModal(): void {
    this.selectedFile = null;
    this.imageDescription = '';
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
    this.selectedFile = null;
    this.imageDescription = '';
    this.isUploading = false;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  async createImage(): Promise<void> {
    if (!this.selectedFile) {
      this.showToastMessage('Please select an image file', 'error');
      return;
    }

    this.isUploading = true;

    // Simulate upload delay
    await this.delay(2000);

    // Create new image (in real app, upload to Cloudinary first)
    const newImage: ImageUrl = {
      ImageUrlId: Date.now().toString(),
      Url: URL.createObjectURL(this.selectedFile), // Replace with Cloudinary URL
      UserId: '1',
      Description: this.imageDescription,
      IsPublished: false,
      CreatedAt: new Date(),
    };

    this.userImages.unshift(newImage);
    this.applyFilters();
    this.closeCreateModal();
    this.showToastMessage('Image created successfully!', 'success');
  }

  // Edit image
  openEditModal(image: ImageUrl): void {
    this.selectedImage = { ...image };
    this.imageDescription = image.Description || '';
    this.selectedFile = null;
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedImage = null;
    this.selectedFile = null;
    this.imageDescription = '';
    this.isUploading = false;
  }

  async updateImage(): Promise<void> {
    if (!this.selectedImage) return;

    this.isUploading = true;

    // Simulate upload delay
    await this.delay(2000);

    const index = this.userImages.findIndex(
      (img) => img.ImageUrlId === this.selectedImage!.ImageUrlId
    );
    if (index !== -1) {
      // If new file selected, update URL (upload to Cloudinary first)
      if (this.selectedFile) {
        this.userImages[index].Url = URL.createObjectURL(this.selectedFile);
      }

      // Update description
      this.userImages[index].Description = this.imageDescription;
      this.userImages[index].UpdatedAt = new Date();
    }

    this.applyFilters();
    this.closeEditModal();
    this.showToastMessage('Image updated successfully!', 'success');
  }

  // Delete image
  confirmDelete(image: ImageUrl): void {
    this.selectedImage = image;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.selectedImage = null;
  }

  deleteImage(): void {
    if (!this.selectedImage) return;

    this.userImages = this.userImages.filter(
      (img) => img.ImageUrlId !== this.selectedImage!.ImageUrlId
    );
    this.applyFilters();
    this.closeDeleteModal();
    this.showToastMessage('Image deleted successfully', 'success');
  }

  // Toggle publish
  togglePublish(image: ImageUrl): void {
    image.IsPublished = !image.IsPublished;
    image.UpdatedAt = new Date();
    this.showToastMessage(
      `Image ${image.IsPublished ? 'published' : 'unpublished'} successfully`,
      'success'
    );
  }

  // Copy URL
  copyUrl(url: string): void {
    navigator.clipboard
      .writeText(url)
      .then(() => {
        this.showToastMessage('URL copied to clipboard!', 'success');
      })
      .catch(() => {
        this.showToastMessage('Failed to copy URL', 'error');
      });
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

  // Helpers
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  onImageLoad(event: any): void {
    event.target.classList.add('loaded');
  }

  onImageError(event: any): void {
    console.error('Failed to load image:', event.target.src);
  }
}

import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { FetchedImageUrl } from '../../interfaces/ImageUrl';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Imageurl } from '../../services/imageurl';
import { User } from '../../services/user';
import { FetchedUser } from '../../interfaces/User';
import { uploadToCloudinary } from '../../utils';

@Component({
  selector: 'app-gallery',
  imports: [CommonModule, FormsModule],
  templateUrl: './gallery.html',
  styleUrl: './gallery.css',
})
export class Gallery implements OnInit {
  // User images
  userImages: FetchedImageUrl[] = [];
  currentUser: FetchedUser | null = null;

  filteredImages: FetchedImageUrl[] = [];

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
  selectedImage: FetchedImageUrl | null = null;
  selectedFile: File | null = null;
  imageDescription: string = '';
  isUploading: boolean = false;

  // Toast
  showToast: boolean = false;
  toastMessage: string = '';
  toastType: 'success' | 'error' | 'info' = 'info';

  constructor(
    private router: Router,
    private imageurl: Imageurl,
    private user: User,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.fetchCurrentUser();
    this.fetchUserImages();
  }

  // Fetch current user
  fetchCurrentUser(): void {
    this.user.getUserById().subscribe({
      next: (result) => {
        if (result.success) {
          this.currentUser = result.data as unknown as FetchedUser;
        } else {
          this.showToastMessage(
            result.errorMessage || 'Failed to load user',
            'error',
          );
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.showToastMessage('Error loading user', 'error');
        this.cdr.detectChanges();
      },
    });
  }

  // Fetch user images
  fetchUserImages(): void {
    this.imageurl.getUserImages().subscribe({
      next: (result) => {
        if (result.success) {
          this.userImages = result.dataList || [];
          this.applyFilters();
          this.cdr.detectChanges();
        } else {
          this.showToastMessage(
            result.errorMessage || 'Failed to load images',
            'error',
          );
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        this.showToastMessage('Error loading images', 'error');
        this.cdr.detectChanges();
      },
    });
  }

  // Stats
  get totalImages(): number {
    return this.userImages.length;
  }

  get publishedImages(): number {
    return this.userImages.filter((img) => img.isPublished).length;
  }

  get unpublishedImages(): number {
    return this.userImages.filter((img) => !img.isPublished).length;
  }

  // Filter and sort
  applyFilters(): void {
    let filtered = [...this.userImages];

    if (this.searchTerm) {
      filtered = filtered.filter(
        (img) =>
          img.description
            ?.toLowerCase()
            .includes(this.searchTerm.toLowerCase()) ||
          img.imageUrlId.toLowerCase().includes(this.searchTerm.toLowerCase()),
      );
    }

    if (this.filterStatus === 'published') {
      filtered = filtered.filter((img) => img.isPublished);
    } else if (this.filterStatus === 'unpublished') {
      filtered = filtered.filter((img) => !img.isPublished);
    }

    if (this.sortBy === 'newest') {
      filtered.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    } else if (this.sortBy === 'oldest') {
      filtered.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
    } else if (this.sortBy === 'description') {
      filtered.sort((a, b) => {
        const aDesc = a.description || '';
        const bDesc = b.description || '';
        return aDesc.localeCompare(bDesc);
      });
    }

    this.filteredImages = filtered;
    this.currentPage = 0;
  }

  get displayedImages(): FetchedImageUrl[] {
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
    if (!this.selectedFile || !this.currentUser) {
      this.showToastMessage(
        'Please select an image and ensure user is loaded',
        'error',
      );
      return;
    }

    this.isUploading = true;

    try {
      const cloudinaryUrl = await uploadToCloudinary(this.selectedFile);
      const dto = {
        Url: cloudinaryUrl,
        Description: this.imageDescription || undefined,
      };

      this.imageurl.createImageUrl(dto).subscribe({
        next: (result) => {
          console.log('result: ', result);
          if (result.success) {
            this.fetchUserImages();
            this.closeCreateModal();
            this.showToastMessage('Image created successfully!', 'success');
          } else {
            this.showToastMessage(
              result.errorMessage || 'Failed to create image',
              'error',
            );
          }
        },
        error: (err) => {
          this.showToastMessage('Error creating image', 'error');
        },
        complete: () => {
          this.isUploading = false;
        },
      });
    } catch (error) {
      this.showToastMessage('Failed to upload image', 'error');
      this.isUploading = false;
    }
  }

  // Edit image
  openEditModal(image: FetchedImageUrl): void {
    this.selectedImage = { ...image };
    this.imageDescription = image.description || '';
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

    try {
      let newUrl = this.selectedImage.url;
      if (this.selectedFile) {
        newUrl = await uploadToCloudinary(this.selectedFile);
      }

      const dto = {
        Url: newUrl,
        Description: this.imageDescription || undefined,
      };

      this.imageurl
        .updateImageUrl(this.selectedImage.imageUrlId, dto)
        .subscribe({
          next: (result) => {
            if (result.success) {
              this.fetchUserImages();
              this.closeEditModal();
              this.showToastMessage('Image updated successfully!', 'success');
              this.isUploading = false;
            } else {
              this.isUploading = false;
              this.showToastMessage(
                result.errorMessage || 'Failed to update image',
                'error',
              );
            }
          },
          error: (err) => {
            this.isUploading = false;
            this.showToastMessage('Error updating image', 'error');
          },
          complete: () => {
            this.isUploading = false;
          },
        });
    } catch (error) {
      this.showToastMessage('Failed to upload image', 'error');
      this.isUploading = false;
    }
  }

  // Delete image
  confirmDelete(image: FetchedImageUrl): void {
    this.selectedImage = image;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.selectedImage = null;
  }

  deleteImage(): void {
    if (!this.selectedImage) return;

    this.imageurl.deleteImage(this.selectedImage.imageUrlId).subscribe({
      next: (result) => {
        if (result.success) {
          this.fetchUserImages();
          this.closeDeleteModal();
          this.showToastMessage('Image deleted successfully', 'success');
        } else {
          this.showToastMessage(
            result.errorMessage || 'Failed to delete image',
            'error',
          );
        }
      },
      error: (err) => {
        this.showToastMessage('Error deleting image', 'error');
      },
    });
  }

  // Toggle publish
  togglePublish(image: FetchedImageUrl): void {
    this.imageurl.togglePublishedImageStatus(image.imageUrlId).subscribe({
      next: (result) => {
        if (result.success) {
          this.fetchUserImages();
          this.showToastMessage(
            `Image ${image.isPublished ? 'unpublished' : 'published'} successfully`,
            'success',
          );
        } else {
          this.showToastMessage(
            result.errorMessage || 'Failed to toggle publish status',
            'error',
          );
        }
      },
      error: (err) => {
        this.showToastMessage('Error toggling publish status', 'error');
      },
    });
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
    type: 'success' | 'error' | 'info' = 'info',
  ): void {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
    }, 5000);
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

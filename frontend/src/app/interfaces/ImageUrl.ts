import { FetchedUser, User } from "./User";

export interface ImageUrl {
  ImageUrlId: string;
  Url: string;
  UserId: string;
  Description?: string;
  IsPublished: boolean;
  CreatedAt: Date;
  UpdatedAt?: Date;
  
  User?: User;
}

export interface FetchedImageUrl {
  imageUrlId: string;
  url: string;
  userId: string;
  description?: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt?: Date;

  user?: FetchedUser;
}
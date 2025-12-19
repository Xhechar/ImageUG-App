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

export interface User {
  UserId: string;
  // Add other User properties as needed
}
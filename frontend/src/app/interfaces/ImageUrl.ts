import { User } from "./User";

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
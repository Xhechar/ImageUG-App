
export interface CreateUserDto
{
  Username: string;
  Email: string;
  PhoneNumber: string;
  PasswordHash: string;
  ProfileImageUrl?: string;
}
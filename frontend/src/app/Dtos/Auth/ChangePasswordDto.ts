export interface ChangePasswordDto {
  Email: string;
  VerificationCode: string;
  NewPassword: string;
}
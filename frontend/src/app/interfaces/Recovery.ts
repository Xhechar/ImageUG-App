export interface Recovery {
  RecoveryId: string;
  Email: string;
  VerificationCode: string;
  CreatedAt: Date;
  ExpiresAt: Date;
  IsUsed: boolean;
}
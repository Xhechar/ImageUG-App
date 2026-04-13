
public class ChangePasswordDto
{
  public required string Email { get; set; }
  public required string VerificationCode { get; set; }
  public required string NewPassword { get; set; }
}
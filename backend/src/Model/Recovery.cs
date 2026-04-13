
using System.ComponentModel.DataAnnotations;

public class Recovery
{
  [Key]
  [Required]
  public required string RecoveryId { get; set; }
  [Required]
  public required string Email { get; set; }
  [Required]
  public required string VerificationCode { get; set; }
  [Required]
  public required DateTime CreatedAt { get; set; } = DateTime.UtcNow;
  [Required]
  public required DateTime ExpiresAt { get; set; } = DateTime.UtcNow.AddHours(1);
  [Required]
  public required bool IsUsed { get; set; } = false;
}
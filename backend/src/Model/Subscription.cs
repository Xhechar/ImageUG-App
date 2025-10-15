
using System.ComponentModel.DataAnnotations;

public class Subscription
{
  [Key]
  [Required]
  public required string SubscriptionId { get; set; }
  [Required]
  public required string UserId { get; set; }
  [Required]
  public required float Price { get; set; }
  [Required]
  [Key]
  public required string ReferenceId { get; set; }
  [Required]
  public required DateTime StartDate { get; set; } = DateTime.UtcNow;
  [Required]
  public required DateTime EndDate { get; set; }
  [Required]
  public required bool IsActive { get; set; } = true;
  public DateTime? UpdatedAt { get; set; }
  public DateTime? CancelledAt { get; set; }
  public string? StripeSubscriptionId { get; set; }

  public User? User { get; set; }
}
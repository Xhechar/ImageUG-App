
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

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
  public required string ReferenceId { get; set; }
  [Required]
  public required DateTime StartDate { get; set; } = DateTime.UtcNow;
  [Required]
  public required int DurationInDays { get; set; } // e.g 7 for a week, 30 for a month
  [Required]
  public required bool IsActive { get; set; } = true;
  public DateTime? UpdatedAt { get; set; }
  public DateTime? CancelledAt { get; set; }
  public string? StripeSubscriptionId { get; set; }
  [ForeignKey("UserId")]
  public User? User { get; set; }
}
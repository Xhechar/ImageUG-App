
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using ImageURLGenerator.Model;

public class PaymentData
{
  [Key]
  [Required]
  public required string PaymentDataId { get; set; }
  [Required]
  public required string UserId { get; set; }
  [Required]
  public required float Amount { get; set; }
  [Required]
  public required int DurationInDays { get; set; }
  [Required]
  public required string MerchantRequestId { get; set; }
  [Required]
  public required string CheckoutRequestId { get; set; }
  [Required]
  public required string ResponseDescription { get; set; }
  [Required]
  public required bool IsSuccessful { get; set; } = false;
  [Required]
  public required DateTime CreatedAt { get; set; } = DateTime.UtcNow;
  [ForeignKey("UserId")]
  public User? User { get; set; }
}
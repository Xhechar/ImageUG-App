using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace ImageURLGenerator.Model
{
  [Index(nameof(PhoneNumber), IsUnique = true)]
  [Index(nameof(Email), IsUnique = true)]
  public class User 
  {
    [Key]
    [Required]
    public required string UserId { get; set; }
    
    [Required]
    [MaxLength(50)]
    [MinLength(3)]
    public required string Username { get; set; }

    [Required]
    [StringLength(13), MinLength(10)]
    public required string PhoneNumber { get; set; }

    [Required]
    [EmailAddress]
    public required string Email { get; set; }
    
    [Required]
    public required string PasswordHash { get; set; }
    public string? ProfileImageUrl { get; set; }
    [Required]
    public string Role { get; set; } = "User";
    [Required]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    [Required]
    public bool IsWelcomeEmailSent { get; set; } = false;

    public ICollection<ImageUrl> ImageUrls { get; set; } = [];
    public ICollection<Subscription> Subscriptions { get; set; } = [];
    public ICollection<PaymentData> PaymentDatas { get; set; } = [];
  }
}
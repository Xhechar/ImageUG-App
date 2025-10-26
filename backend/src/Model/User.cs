
using System.ComponentModel.DataAnnotations;

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

  public ICollection<ImageUrl> ImageUrls { get; set; } = new List<ImageUrl>();
  public ICollection<Subscription> Subscriptions { get; set; } = new List<Subscription>();
}

using System.ComponentModel.DataAnnotations;

public class ImageUrl 
{
  [Key]
  [Required]
  public required string ImageUrlId { get; set; }
  [Required]
  public required string Url { get; set; }
  [Required]
  public required string UserId { get; set; }
  [Required]
  public required DateTime CreatedAt { get; set; } = DateTime.UtcNow;
  public DateTime? UpdatedAt { get; set; }

  public User? User { get; set; }
}
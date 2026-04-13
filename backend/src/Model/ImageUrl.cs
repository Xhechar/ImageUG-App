
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using ImageURLGenerator.Model;

public class ImageUrl 
{
  [Key]
  [Required]
  public required string ImageUrlId { get; set; }
  [Required]
  public required string Url { get; set; }
  [Required]
  public required string UserId { get; set; }
  public string? Description { get; set; }
  [Required]
  public bool IsPublished { get; set; } = false;
  [Required]
  public required DateTime CreatedAt { get; set; } = DateTime.UtcNow;
  public DateTime? UpdatedAt { get; set; }
  [ForeignKey("UserId")]
  public User? User { get; set; }
}
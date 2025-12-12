
public class CreateUserDto
{
  public required string Username { get; set; }
  public required string Email { get; set; }
  public required string PhoneNumber { get; set; }
  public required string PasswordHash { get; set; }
  public string? ProfileImageUrl { get; set; }
}
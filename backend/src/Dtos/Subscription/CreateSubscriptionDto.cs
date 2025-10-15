
public class CreateSubscriptionDto
{
  public required string UserId { get; set; }
  public required float Price { get; set; }
  public required string ReferenceId { get; set; }
  public required DateTime StartDate { get; set; }
  public required DateTime EndDate { get; set; }
  public required bool IsActive { get; set; }
  public string? StripeSubscriptionId { get; set; }
}
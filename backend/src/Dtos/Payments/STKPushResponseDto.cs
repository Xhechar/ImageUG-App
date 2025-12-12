
public class STKPushResponseDto
{
  public string? MerchantRequestId { get; set; }
  public string? CheckoutRequestId { get; set; }
  public int ResponseCode { get; set; }
  public string? ResponseDescription { get; set; }
  public string? CustomerMessage { get; set; }
}

public class SafaricomCallbackDto
{
  public BodyDto? Body { get; set; }
}

public class BodyDto
{
  public StkCallbackDto? stkCallback { get; set; }
}

public class StkCallbackDto
{
  public string? MerchantRequestID { get; set; }
  public string? CheckoutRequestID { get; set; }
  public int ResultCode { get; set; }
  public string? ResultDesc { get; set; }
  public CallbackMetadataDto? CallbackMetadata { get; set; }
}

public class CallbackMetadataDto
{
  public List<ItemDto>? Item { get; set; }
}

public class ItemDto
{
  public string? Name { get; set; }
  public object? Value { get; set; }
}
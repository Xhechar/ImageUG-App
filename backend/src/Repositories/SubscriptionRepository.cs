
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

public class SubscriptionRepository : ISubscriptionRepository
{
  private readonly DataContext _context;
  private readonly  HttpClient _http;
  private readonly IPaymentService _paymentService;
  private readonly IConfiguration _configuration;
  private readonly IHubContext<BackendHub> _hubContext;
  public SubscriptionRepository(DataContext context, HttpClient http, IPaymentService paymentService, IConfiguration configuration, IHubContext<BackendHub> hubContext)
  {
    _context = context;
    _http = http;
    _paymentService = paymentService;
    _configuration = configuration;
    _hubContext = hubContext;
  }

  public async Task<RepositoryResult<Subscription>> SendStkPush(string UserId, StkPushDto pushDto) 
  {    
    var user = await _context.User.FirstOrDefaultAsync(u => u.UserId == UserId);

    if (user == null) {
      return RepositoryResponse<Subscription>.Failure("CLIENT ERROR", "your profile details not found, cannot complete payment.");
    }
    
    var PaymentSettings = _configuration.GetSection("PaymentSettings");

    string accessToken = await _paymentService.GetAccessToken();

    if (string.IsNullOrEmpty(accessToken)) {
      return RepositoryResponse<Subscription>.Failure("SERVER ERROR", "unable to authenticate payment request, try again later.");
    }

    var Timestamp = DateTime.Now.ToString("yyyyMMddHHmmss");
    var BusinessShortCode = PaymentSettings["BusinessShortCode"];
    var Password = Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes($"{BusinessShortCode}{PaymentSettings["Passkey"]}{Timestamp}"));
    var CallBackUrl = PaymentSettings["CallBackUrl"];
    var stkPushRequest = new STKPushData
    {
      BusinessShortCode = BusinessShortCode!,
      Password = Password,
      Timestamp = Timestamp,
      TransactionType = "CustomerPayBillOnline",
      Amount = pushDto.Amount,
      PartyA = user.PhoneNumber,
      PartyB = BusinessShortCode!,
      PhoneNumber = user.PhoneNumber,
      CallBackURL = CallBackUrl!,
      AccountReference = "Imagen_Subscription",
      TransactionDesc = "Subscription Payment"
    };

    _http.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", accessToken);

    var response = await _http.PostAsJsonAsync(
      PaymentSettings["Env"] == "Production" ? "https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest" : "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      stkPushRequest
    );

    if (!response.IsSuccessStatusCode) {
      return RepositoryResponse<Subscription>.Failure("SERVER ERROR", "unable to initiate payment request, try again later.");
    }

    var json = await response.Content.ReadAsStringAsync();
    var stkResponse = System.Text.Json.JsonSerializer.Deserialize<STKPushResponseDto>(json);

    if (stkResponse == null) {
      return RepositoryResponse<Subscription>.Failure("SERVER ERROR", "invalid response from payment gateway, try again later.");
    }

    if (stkResponse.ResponseCode != "0") {
      return RepositoryResponse<Subscription>.Failure("CLIENT ERROR", $"payment request failed: {stkResponse.ResponseDescription}");
    }

    var paymentData = new PaymentData
    {
      PaymentDataId = Guid.NewGuid().ToString(),
      UserId = UserId,
      Amount = pushDto.Amount,
      DurationInDays = pushDto.DurationInDays,
      MerchantRequestId = stkResponse.MerchantRequestId!,
      CheckoutRequestId = stkResponse.CheckoutRequestId!,
      ResponseDescription = stkResponse.ResponseDescription!,
      IsSuccessful = true,
      CreatedAt = DateTime.UtcNow
    };

    await _context.PaymentData.AddAsync(paymentData);
    if (await _context.SaveChangesAsync() > 0) {
      return RepositoryResponse<Subscription>.Success("payment initiated successfully! complete the payment on your phone.");
    }

    return RepositoryResponse<Subscription>.Failure("SERVER ERROR", "unable to record payment data, try again later.");
  }

  public async Task<RepositoryResult<Subscription>> GetUserSubscriptions(string UserId)
  {
    
    var userExists = await _context.User.FirstOrDefaultAsync(u => u.UserId == UserId);

    if (userExists == null) {
      return RepositoryResponse<Subscription>.Failure("CLIENT ERROR", "your profile details not found.");
    }

    var subscriptions = await _context.Subscription
      .Where(s => s.UserId == UserId)
      .Include(s => s.User)
      .ToListAsync();

      if (subscriptions.Count == 0 || subscriptions == null) {
        return RepositoryResponse<Subscription>.Failure("CLIENT ERROR", "no subscriptions found for your profile.");
      }

    return RepositoryResponse<Subscription>.Success("subscriptions retrieved successfully!", DataList: subscriptions.ToArray());
  }

  public async Task SafaricomCallback(object callbackDto)
  {
    
    var json = System.Text.Json.JsonSerializer.Serialize(callbackDto);
    var SafaricomResponseBody = System.Text.Json.JsonSerializer.Deserialize<SafaricomCallbackDto>(json);

    if (SafaricomResponseBody == null) {
      Console.WriteLine("Invalid Safaricom callback data received.");
      return;
    }

    var PaymentDataExists = await _context.PaymentData.FirstOrDefaultAsync(p => p.MerchantRequestId == SafaricomResponseBody.Body!.stkCallback!.MerchantRequestID  && p.CheckoutRequestId == SafaricomResponseBody.Body!.stkCallback!.CheckoutRequestID);

    if (PaymentDataExists == null) {
      Console.WriteLine("Payment data not found for the callback.");
      return;
    }

    if (SafaricomResponseBody!.Body!.stkCallback!.ResultCode != 0) {
      Console.WriteLine($"Payment failed with ResultCode: {SafaricomResponseBody.Body.stkCallback.ResultCode}, ResultDesc: {SafaricomResponseBody.Body.stkCallback.ResultDesc}");
      PaymentDataExists.IsSuccessful = false;
      PaymentDataExists.ResponseDescription = $"Payment failed: {SafaricomResponseBody.Body.stkCallback.ResultDesc}";
      await _context.SaveChangesAsync();
      await _hubContext.Clients.User(PaymentDataExists.UserId).SendAsync("subscription-failed", SafaricomResponseBody.Body.stkCallback.ResultDesc ?? "Your payment was not successful. Please try again.");
      return;
    }


    var amountItem = SafaricomResponseBody?.Body?.stkCallback?.CallbackMetadata?.Item?.FirstOrDefault(i => i.Name == "Amount");
    var receiptItem = SafaricomResponseBody?.Body?.stkCallback?.CallbackMetadata?.Item?.FirstOrDefault(i => i.Name == "MpesaReceiptNumber");
    
    var subscriptionData = new Subscription 
    {
      SubscriptionId = Guid.NewGuid().ToString(),
      UserId = PaymentDataExists!.UserId,
      Price = amountItem?.Value != null ? float.Parse(amountItem.Value.ToString()!) : 0,
      ReferenceId = receiptItem?.Value?.ToString() ?? "",
      StartDate = DateTime.UtcNow,
      DurationInDays = PaymentDataExists.DurationInDays,
      IsActive = true
    };

    await _context.Subscription.AddAsync(subscriptionData);
    if (await _context.SaveChangesAsync() > 0) {
      await _hubContext.Clients.User(PaymentDataExists.UserId).SendAsync("subscription-created");
      Console.WriteLine("Subscription created successfully from Safaricom callback.");
      return;
    }

    await _hubContext.Clients.User(PaymentDataExists.UserId).SendAsync("subscription-failed", "Your payment details was  successful but not recorded. Please contact support.");
    Console.WriteLine("Failed to create subscription from Safaricom callback.");
    return;
  }
}
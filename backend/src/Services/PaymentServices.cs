
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

public class PaymentService : IPaymentService
{
  private readonly HttpClient http;
  private readonly IConfiguration configuration;

  public PaymentService(IHttpClientFactory httpClientFactory, IConfiguration configuration)
  {
    this.http = httpClientFactory.CreateClient("MpesaApi");
    this.configuration = configuration;
  }

  public async Task<string> GetAccessToken()
  {
    var PaymentSettings = this.configuration.GetSection("PaymentSettings");

    var Key = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{PaymentSettings["ConsumerKey"]}:{PaymentSettings["ConsumerSecret"]}"));

    var request = new HttpRequestMessage(HttpMethod.Get, "oauth/v1/generate?grant_type=client_credentials");

    request.Headers.Authorization = new AuthenticationHeaderValue("Basic", $"{Key}");

    var Response = await this.http.SendAsync(request);

    Response.EnsureSuccessStatusCode();

    var json = await Response.Content.ReadAsStringAsync();

    return JsonSerializer.Deserialize<TokenResponseDto>(json)!.access_token!;

  }
}
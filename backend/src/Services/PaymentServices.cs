
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

public class PaymentService : IPaymentService
{
  private readonly HttpClient http;
  private readonly IConfiguration configuration;

  public PaymentService(HttpClient http, IConfiguration configuration)
  {
    this.http = http;
    this.configuration = configuration;
  }

  public async Task<string> GetAccessToken()
  {
    var PaymentSettings = this.configuration.GetSection("PaymentSettings");
    string Url = PaymentSettings["Env"] == "Production" ? "https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials" : "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";

    var Key = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{PaymentSettings["ConsumerKey"]}:{PaymentSettings["ConsumerSecret"]}"));

    this.http.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("basic", $"{Key}");

    var Response = await this.http.GetAsync(Url);

    if(Response.IsSuccessStatusCode) {
      var json = await Response.Content.ReadAsStringAsync();
      return JsonSerializer.Deserialize<TokenResponseDto>(json)!.access_token!;
    }

    return "";
  }
}
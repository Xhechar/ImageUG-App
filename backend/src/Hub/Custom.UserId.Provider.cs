
using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.SignalR;

public class CustomUserIdProvider : IUserIdProvider
{
  public string GetUserId(HubConnectionContext connection)
  {
    var UserId = connection.User?.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
    return UserId ?? string.Empty;
  }
}
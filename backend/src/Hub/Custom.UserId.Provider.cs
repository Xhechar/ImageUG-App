
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.SignalR;

public class CustomUserIdProvider : IUserIdProvider
{
  public string GetUserId(HubConnectionContext connection)
  {
    var UserId = connection.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    return UserId ?? string.Empty;
  }
}
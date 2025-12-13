
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

public class CurrentUserService : ICurrentUserService
{
  private readonly IHttpContextAccessor _httpContextAccessor;

  public CurrentUserService(IHttpContextAccessor httpContextAccessor)
  {
    _httpContextAccessor = httpContextAccessor;
  }

  private ClaimsPrincipal? User => _httpContextAccessor.HttpContext?.User;

  public string? UserId => User?.FindFirstValue(JwtRegisteredClaimNames.Sub);
  public string? Email => User?.FindFirstValue(JwtRegisteredClaimNames.Email);
  public string? Role => User?.FindFirstValue(ClaimTypes.Role);
  public bool IsAuthenticated => User?.Identity?.IsAuthenticated ?? false;
}
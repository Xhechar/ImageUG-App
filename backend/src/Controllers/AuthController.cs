
using ImageURLGenerator.Model;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("[controller]")]
public class AuthController : ControllerBase
{
  private readonly IAuthRepository _authRepository;
  private readonly ICurrentUserService _currentUserService;

  public AuthController(IAuthRepository authRepository, ICurrentUserService currentUserService)
  {
    _authRepository = authRepository;
    _currentUserService = currentUserService;
  }

  [HttpPost("login")]
  [ProducesResponseType(typeof(RepositoryResult<object>), 200)]
  [ProducesResponseType(typeof(RepositoryResult<object>), 400)]
  [ProducesResponseType(typeof(RepositoryResult<object>), 500)]
  public async Task<IActionResult> Login([FromBody] LoginDetails loginDetails)
  {
    RepositoryResult<object> result = await _authRepository.Login(loginDetails);

    if(result.Success) {

      Response.Cookies.Append("auth_token", result.Token!, new CookieOptions
      {
        HttpOnly = true,
        Secure = false,
        SameSite = SameSiteMode.Lax,
        Expires = DateTimeOffset.UtcNow.AddMinutes(45)
      });

      return Ok(result);
    }

    return (result.Title) switch
    {
      "CLIENT ERROR" => BadRequest(result),
      _ => StatusCode(500, result),
    };
  }

  [HttpPost("verify-email")]
  [ProducesResponseType(typeof(RepositoryResult<object>), 200)]
  [ProducesResponseType(typeof(RepositoryResult<object>), 400)]
  [ProducesResponseType(typeof(RepositoryResult<object>), 500)]
  public async Task<IActionResult> VerifyEmail([FromBody] EmailDto Email)
  {
    if (string.IsNullOrEmpty(Email.Email))
    {
      return BadRequest(RepositoryResponse<object>.Failure("CLIENT ERROR", "email is required."));
    }

    RepositoryResult<object> result = await _authRepository.VerifyEmail(Email.Email);

    return Ok(result);
  }

  [HttpPatch("logout")]
  public IActionResult Logout()
  {
    Response.Cookies.Delete("auth_token");

    return Ok(RepositoryResponse<object>.Success("logged out successfully!"));
  }

  [HttpPost("change-password")]
  [ProducesResponseType(typeof(RepositoryResult<object>), 200)]
  [ProducesResponseType(typeof(RepositoryResult<object>), 400)]
  [ProducesResponseType(typeof(RepositoryResult<object>), 500)]
  public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto passwordDto)
  {
    RepositoryResult<object> result = await _authRepository.ChangePassword(passwordDto);

    if(!result.Success) {
      return (result.Title) switch
      {
        "CLIENT ERROR" => BadRequest(result),
        _ => StatusCode(500, result),
      };
    }

    return Ok(result);
  }

  [Authorize(Roles = "User")]
  [HttpPatch("check-authentication-status")]
  [ProducesResponseType(typeof(RepositoryResult<User>), 200)]
  [ProducesResponseType(typeof(RepositoryResult<User>), 400)]
  [ProducesResponseType(typeof(RepositoryResult<User>), 500)]
  public async Task<IActionResult> IsLoggedIn()
  {
    if (_currentUserService.UserId == null)
    {
      return BadRequest(RepositoryResponse<User>.Failure("CLIENT ERROR", "not authenticated"));
    }

    var result = await _authRepository.CheckAuthenticationStatus(_currentUserService.UserId);

    return Ok(result);
  }
}
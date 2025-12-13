
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("auth/[controller]")]
public class AuthController : ControllerBase
{
  private readonly IAuthRepository _authRepository;

  public AuthController(IAuthRepository authRepository)
  {
    _authRepository = authRepository;
  }

  [HttpPost("login")]
  [ProducesResponseType(typeof(RepositoryResult<object>), 200)]
  [ProducesResponseType(typeof(RepositoryResult<object>), 400)]
  [ProducesResponseType(typeof(RepositoryResult<object>), 500)]
  public async Task<IActionResult> Login([FromBody] LoginDetails loginDetails)
  {

    if(!ModelState.IsValid)
    {
      return BadRequest(RepositoryResponse<object>.Failure("CLIENT ERROR", "invalid request data."));
    }

    RepositoryResult<object> result = await _authRepository.Login(loginDetails);

    if(result.Success) {

      Response.Cookies.Append("auth_token", result.Token!, new CookieOptions
      {
        HttpOnly = true,
        Secure = false,
        SameSite = SameSiteMode.Strict,
        Expires = DateTimeOffset.UtcNow.AddMinutes(45)
      });

      return Ok(result);
    }

    return Ok(result);
  }

  [HttpPost("verify-email/{email}")]
  [ProducesResponseType(typeof(RepositoryResult<object>), 200)]
  [ProducesResponseType(typeof(RepositoryResult<object>), 400)]
  [ProducesResponseType(typeof(RepositoryResult<object>), 500)]
  public async Task<IActionResult> VerifyEmail([FromRoute] string Email)
  {
    if (string.IsNullOrEmpty(Email))
    {
      return BadRequest(RepositoryResponse<object>.Failure("CLIENT ERROR", "email is required."));
    }

    RepositoryResult<object> result = await _authRepository.VerifyEmail(Email);

    return Ok(result);
  }

  [HttpPost("logout")]
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
    if(!ModelState.IsValid) {
      return BadRequest(RepositoryResponse<object>.Failure("CLIENT ERROR", "invalid request data"));
    }

    RepositoryResult<object> result = await _authRepository.ChangePassword(passwordDto);

    return Ok(result);
  }
}
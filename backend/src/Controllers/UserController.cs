
using ImageURLGenerator.Model;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("user/[Controller]")]
public class UserController : ControllerBase
{

  private readonly IUserRepository _userRepository;

  public UserController (IUserRepository userRepository)
  {
    _userRepository = userRepository;
  }

  [HttpPost("register-user")]
  [ProducesResponseType(typeof(RepositoryResult<User>), 200)]
  [ProducesResponseType(typeof(RepositoryResult<User>), 400)]
  [ProducesResponseType(typeof(RepositoryResult<User>), 500)]
  public async Task<IActionResult> CreateUser([FromBody] CreateUserDto userDto)
  {
    if(!ModelState.IsValid) {
      return BadRequest(RepositoryResponse<User>.Failure("CLIENT ERROR", "invalid request data."));
    }

    RepositoryResult<User> result = await _userRepository.CreateUser(userDto);

    return Ok(result);
  }
}
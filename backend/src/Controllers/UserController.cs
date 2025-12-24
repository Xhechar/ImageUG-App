
using ImageURLGenerator.Model;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("[Controller]")]
public class UserController : ControllerBase
{

  private readonly IUserRepository _userRepository;
  private readonly ICurrentUserService _currentUserService;

  public UserController (IUserRepository userRepository, ICurrentUserService currentUserService)
  {
    _userRepository = userRepository;
    _currentUserService = currentUserService;
  }

  [HttpPost("create-user")]
  [ProducesResponseType(typeof(RepositoryResult<User>), 200)]
  [ProducesResponseType(typeof(RepositoryResult<User>), 400)]
  [ProducesResponseType(typeof(RepositoryResult<User>), 500)]
  public async Task<IActionResult> CreateUser([FromBody] CreateUserDto userDto)
  {
    RepositoryResult<User> result = await _userRepository.CreateUser(userDto);

    if(!result.Success)
    {
      return result.Title switch
      {
        "CLIENT ERROR" => BadRequest(result),
        _ => StatusCode(500, result),
      };
    }

    return Ok(result);
  }

  [HttpPut("update-user")]
  [ProducesResponseType(typeof(RepositoryResult<User>), 200)]
  [ProducesResponseType(typeof(RepositoryResult<User>), 400)]
  [ProducesResponseType(typeof(RepositoryResult<User>), 500)]
  public async Task<IActionResult> UpdateUser([FromBody] UpdateUserDto updateUserDto)
  {
    RepositoryResult<User> result = await _userRepository.UpdateUser(_currentUserService.UserId!, updateUserDto);

    if(!result.Success)
    {
      return result.Title switch
      {
        "CLIENT ERROR" => BadRequest(result),
        _ => StatusCode(500, result),
      };
    }

    return Ok(result);
  }

  [Authorize(Roles = "User")]
  [HttpPatch("update-profile-image")]
  [ProducesResponseType(typeof(RepositoryResult<User>), 200)]
  [ProducesResponseType(typeof(RepositoryResult<User>), 400)]
  [ProducesResponseType(typeof(RepositoryResult<User>), 500)]
  public async Task<IActionResult> UpdateProfileImage([FromRoute] string UserId, [FromBody] UpdateProfileImageDto updateProfileImageDto)
  {
    RepositoryResult<User> result = await _userRepository.UpdateProfileImage(UserId, updateProfileImageDto.ProfileImageUrl);

    if(!result.Success)
    {
      return result.Title switch
      {
        "CLIENT ERROR" => BadRequest(result),
        _ => StatusCode(500, result),
      };
    }

    return Ok(result);
  }

  [Authorize(Roles = "User")]
  [HttpGet("get-user-by-id")]
  [ProducesResponseType(typeof(RepositoryResult<User>), 200)]
  [ProducesResponseType(typeof(RepositoryResult<User>), 400)]
  [ProducesResponseType(typeof(RepositoryResult<User>), 500)]
  public async Task<IActionResult> GetUserById()
  {
    RepositoryResult<User> result = await _userRepository.GetUserById(_currentUserService.UserId!);

    if(!result.Success)
    {
      return result.Title switch
      {
        "CLIENT ERROR" => BadRequest(result),
        _ => StatusCode(500, result),
      };
    }

    return Ok(result);
  }

  [Authorize(Roles = "Admin")]
  [HttpDelete("delete-user/{userId}")]
  [ProducesResponseType(typeof(RepositoryResult<User>), 200)]
  [ProducesResponseType(typeof(RepositoryResult<User>), 400)]
  [ProducesResponseType(typeof(RepositoryResult<User>), 500)]
  public async Task<IActionResult> DeleteUser([FromRoute] string userId)
  {
    RepositoryResult<User> result = await _userRepository.DeleteUser(userId);

    if(!result.Success)
    {
      return result.Title switch
      {
        "CLIENT ERROR" => BadRequest(result),
        _ => StatusCode(500, result),
      };
    }

    return Ok(result);
  }

  [Authorize(Roles = "Admin")]
  [HttpPatch("toggle-user-role/{userId}")]
  [ProducesResponseType(typeof(RepositoryResult<User>), 200)]
  [ProducesResponseType(typeof(RepositoryResult<User>), 400)]
  [ProducesResponseType(typeof(RepositoryResult<User>), 500)]
  public async Task<IActionResult> ToggleUserRole([FromRoute] string userId)
  {
    RepositoryResult<User> result = await _userRepository.ToggleUserRole(userId);

    if(!result.Success)
    {
      return result.Title switch
      {
        "CLIENT ERROR" => BadRequest(result),
        _ => StatusCode(500, result),
      };
    }

    return Ok(result);
  }
}
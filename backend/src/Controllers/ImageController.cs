
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("image/[controller]")]
public class ImageController : ControllerBase
{
  private readonly IImageUrlRepository _imageUrlRepository;
  private readonly ICurrentUserService _currentUserService;

  public ImageController(IImageUrlRepository imageUrlRepository, ICurrentUserService currentUserService)
  {
    _imageUrlRepository = imageUrlRepository;
    _currentUserService = currentUserService;
  }

  [Authorize(Roles = "User")]
  [HttpPost("create-image-url")]
  [ProducesResponseType(typeof(RepositoryResult<ImageUrl>), 200)]
  [ProducesResponseType(typeof(RepositoryResult<ImageUrl>), 400)]
  [ProducesResponseType(typeof(RepositoryResult<ImageUrl>), 500)]
  public async Task<IActionResult> CreateImageUrl([FromHeader] string UserId, [FromBody] CreateImageUrlDto createImageUrlDto)
  {
    RepositoryResult<ImageUrl> result = await _imageUrlRepository.CreateImageUrl(UserId, createImageUrlDto);

    if(!result.Success)
    {
      return (result.Title) switch
      {
        "CLIENT ERROR" => BadRequest(result),
        _ => StatusCode(500, result),
      };
    }

    return Ok(result);
  }

  [Authorize(Roles = "User")]
  [HttpPut("update-image-url/{imageId}")]
  [ProducesResponseType(typeof(RepositoryResult<ImageUrl>), 200)]
  [ProducesResponseType(typeof(RepositoryResult<ImageUrl>), 400)]
  [ProducesResponseType(typeof(RepositoryResult<ImageUrl>), 500)]
  public async Task<IActionResult> UpdateImageUrl([FromRoute] string ImageId, [FromBody] UpdateImageUrlDto updateImageUrlDto)
  {
    RepositoryResult<ImageUrl> result = await _imageUrlRepository.UpdateImageUrl(ImageId, updateImageUrlDto);

    if(!result.Success)
    {
      return (result.Title) switch
      {
        "CLIENT ERROR" => BadRequest(result),
        _ => StatusCode(500, result),
      };
    }

    return Ok(result);
  }

  [Authorize(Roles = "User")]
  [HttpGet("get-user-images")]
  [ProducesResponseType(typeof(RepositoryResult<ImageUrl>), 200)]
  [ProducesResponseType(typeof(RepositoryResult<ImageUrl>), 400)]
  [ProducesResponseType(typeof(RepositoryResult<ImageUrl>), 500)]
  public async Task<IActionResult> GetUserImages()
  {
    RepositoryResult<ImageUrl> result = await _imageUrlRepository.GetUserImages(_currentUserService.UserId!);

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
  [HttpDelete("delete-image/{imageId}")]
  [ProducesResponseType(typeof(RepositoryResult<ImageUrl>), 200)]
  [ProducesResponseType(typeof(RepositoryResult<ImageUrl>), 400)]
  [ProducesResponseType(typeof(RepositoryResult<ImageUrl>), 500)]
  public async Task<IActionResult> DeleteImage([FromRoute] string ImageId)
  {
    RepositoryResult<ImageUrl> result = await _imageUrlRepository.DeleteImage(_currentUserService.UserId!, ImageId);

    if(!result.Success)
    {
      return (result.Title) switch
      {
        "CLIENT ERROR" => BadRequest(result),
        _ => StatusCode(500, result),
      };
    }

    return Ok(result);
  }
}
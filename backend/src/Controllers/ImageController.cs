
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("[controller]")]
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
  public async Task<IActionResult> CreateImageUrl([FromBody] CreateImageUrlDto createImageUrlDto)
  {
    RepositoryResult<ImageUrl> result = await _imageUrlRepository.CreateImageUrl(_currentUserService.UserId!, createImageUrlDto);

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

  [Authorize(Roles = "User")]
  [HttpPatch("toggle-published-image-status/{imageId}")]
  [ProducesResponseType(typeof(RepositoryResult<ImageUrl>), 200)]
  [ProducesResponseType(typeof(RepositoryResult<ImageUrl>), 400)]
  [ProducesResponseType(typeof(RepositoryResult<ImageUrl>), 500)]
  public async Task<IActionResult> TogglePublishedImageStatus([FromRoute] string ImageId)
  {
    RepositoryResult<ImageUrl> result = await _imageUrlRepository.TogglePublishedImageStatus(_currentUserService.UserId!, ImageId);

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

  [HttpGet("get-published-images")]
  [ProducesResponseType(typeof(RepositoryResult<ImageUrl>), 200)]
  [ProducesResponseType(typeof(RepositoryResult<ImageUrl>), 400)]
  [ProducesResponseType(typeof(RepositoryResult<ImageUrl>), 500)]
  public async Task<IActionResult> GetPublishedImages()
  {
    RepositoryResult<ImageUrl> result = await _imageUrlRepository.GetPublishedImages();

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

  [HttpGet("get-single-published-image-details/{ImageUrlId}")]
  [ProducesResponseType(typeof(RepositoryResult<ImageUrl>), 200)]
  [ProducesResponseType(typeof(RepositoryResult<ImageUrl>), 400)]
  [ProducesResponseType(typeof(RepositoryResult<ImageUrl>), 500)]
  public async Task<IActionResult> GetSingleImageURL([FromRoute] string ImageUrlId)
  {
    RepositoryResult<ImageUrl> result = await _imageUrlRepository.GetSingleImageURL(ImageUrlId);

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

public interface IImageUrlRepository
{
  Task<RepositoryResult<ImageUrl>> CreateImageUrl(string UserId, CreateImageUrlDto ImageUrlDto);
  Task<RepositoryResult<ImageUrl>> UpdateImageUrl(string ImageUrl, UpdateImageUrlDto ImageUrlDto);
  Task<RepositoryResult<ImageUrl>> GetUserImages(string UserId);
  Task<RepositoryResult<ImageUrl>> DeleteImage(string UserId, string ImageUrlId);
}
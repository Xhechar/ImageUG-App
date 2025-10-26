
public interface IImageUrlInterface
{
  RepositoryResult<ImageUrl> CreateImageUrl(string UserId, CreateImageUrlDto ImageUrlDto);
  RepositoryResult<ImageUrl> UpdateImageUrl(string ImageUrl, UpdateImageUrlDto ImageUrlDto);
  RepositoryResult<ImageUrl> GetUserImages(string UserId);
  RepositoryResult<ImageUrl> DeleteImage(string UserId, string ImageUrlId);
}
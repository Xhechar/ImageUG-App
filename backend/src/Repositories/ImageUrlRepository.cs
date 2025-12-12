
using Microsoft.EntityFrameworkCore;

public class ImageUrlRepository : IImageUrlRepository
{
  private readonly DataContext _context;

  public ImageUrlRepository(DataContext context)
  {
    _context = context;
  }

  public async Task<RepositoryResult<ImageUrl>> CreateImageUrl(string UserId, CreateImageUrlDto createImageUrlDto)
  {
    
    var userExists = await _context.User.Include(u => u.Subscriptions.OrderByDescending(pd => pd.StartDate)).FirstOrDefaultAsync(u => u.UserId == UserId);

    if (userExists == null)
    {
      return RepositoryResponse<ImageUrl>.Failure("CLIENT ERROR", "your profile is not found, unable to generate image url.");
    }

    if(userExists.Subscriptions.Count == 0 || userExists.Subscriptions == null || userExists.Subscriptions.First().StartDate.AddDays(userExists.Subscriptions.First().DurationInDays) < DateTime.UtcNow)
    {
      return RepositoryResponse<ImageUrl>.Failure("CLIENT ERROR", "you do not have an active subscription, please subscribe to generate image urls.");
    }

    var newImageUrl = new ImageUrl
    {
      ImageUrlId = Guid.NewGuid().ToString(),
      UserId = UserId,
      Url = createImageUrlDto.Url,
      CreatedAt = DateTime.UtcNow
    };

    await _context.ImageUrl.AddAsync(newImageUrl);

    if(await _context.SaveChangesAsync() > 0)
    {
      return RepositoryResponse<ImageUrl>.Success("image url generated successfully!");
    }
    else
    {
      return RepositoryResponse<ImageUrl>.Failure("SERVER ERROR", "unable to generate image url at the moment.");
    }
  }

  public async Task<RepositoryResult<ImageUrl>> UpdateImageUrl(string ImageId, UpdateImageUrlDto updateImageUrlDto)
  {
    
    var imageExists = await _context.ImageUrl.FirstOrDefaultAsync(i => i.ImageUrlId == ImageId);

    if (imageExists == null)
    {
      return RepositoryResponse<ImageUrl>.Failure("CLIENT ERROR", "image url specified does not exist.");
    }

    imageExists.Url = updateImageUrlDto.Url ?? imageExists.Url;
    imageExists.UpdatedAt = DateTime.UtcNow;
    _context.ImageUrl.Update(imageExists);

    if(await _context.SaveChangesAsync() > 0)
    {
      return RepositoryResponse<ImageUrl>.Success("image url updated successfully!");
    }
    else
    {
      return RepositoryResponse<ImageUrl>.Failure("SERVER ERROR", "unable to update image url at the moment.");
    }
  }

  public async Task<RepositoryResult<ImageUrl>> GetUserImages(string UserId)
  {
    
    var userExists = await _context.User.Include(u => u.ImageUrls).FirstOrDefaultAsync(u => u.UserId == UserId);

    if (userExists == null)
    {
      return RepositoryResponse<ImageUrl>.Failure("CLIENT ERROR", "user specified does not exist.");
    }

    return RepositoryResponse<ImageUrl>.Success("user images retrieved successfully!", DataList: userExists.ImageUrls.ToArray());
  }

  public async Task<RepositoryResult<ImageUrl>> DeleteImage(string UserId, string ImageId)
  {
    
    var userExists = await _context.User.FirstOrDefaultAsync(u => u.UserId == UserId);

    if (userExists == null)
    {
      return RepositoryResponse<ImageUrl>.Failure("CLIENT ERROR", "user specified does not exist.");
    }

    var imageExists = await _context.ImageUrl.FirstOrDefaultAsync(i => i.ImageUrlId == ImageId && i.UserId == UserId);

    if (imageExists == null)
    {
      return RepositoryResponse<ImageUrl>.Failure("CLIENT ERROR", "image url specified does not exist.");
    }

    _context.ImageUrl.Remove(imageExists);

    if(await _context.SaveChangesAsync() > 0)
    {
      return RepositoryResponse<ImageUrl>.Success("image url deleted successfully!");
    }
    else
    {
      return RepositoryResponse<ImageUrl>.Failure("SERVER ERROR", "unable to delete image url at the moment.");
    }
  }
}
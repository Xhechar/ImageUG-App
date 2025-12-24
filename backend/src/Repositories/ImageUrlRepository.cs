using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

public class ImageUrlRepository : IImageUrlRepository
{
  private readonly DataContext _context;
  private readonly IHubContext<BackendHub> _hubContext;

  public ImageUrlRepository(DataContext context, IHubContext<BackendHub> hubContext)
  {
    _context = context;
    _hubContext = hubContext;
  }

  public async Task<RepositoryResult<ImageUrl>> CreateImageUrl(string UserId, CreateImageUrlDto createImageUrlDto)
  {
    
    var userExists = await _context.User.Include(u => u.Subscriptions.OrderByDescending(pd => pd.StartDate)).FirstOrDefaultAsync(u => u.UserId == UserId);

    if (userExists == null)
    {
      return RepositoryResponse<ImageUrl>.Failure("CLIENT ERROR", "your profile is not found, unable to generate image url.");
    }

    if(userExists.FreeTrialCount >= 5 && (userExists.Subscriptions.Count == 0 || userExists.Subscriptions == null))
    {
      return RepositoryResponse<ImageUrl>.Failure("CLIENT ERROR", "you have exhausted your free trial limit, please subscribe to generate more image urls.");
    }

    if(userExists.FreeTrialCount < 5)
    {
      var createImageURL = new ImageUrl
      {
        ImageUrlId = Guid.NewGuid().ToString(),
        UserId = UserId,
        Url = createImageUrlDto.Url,
        CreatedAt = DateTime.UtcNow,
        Description = createImageUrlDto.Description
      };

      await _context.ImageUrl.AddAsync(createImageURL);

      if(await _context.SaveChangesAsync() > 0)
      {
        userExists.FreeTrialCount += 1;
        _context.User.Update(userExists);
        await _context.SaveChangesAsync();

        await _hubContext.Clients.User(UserId).SendAsync("user-updated", userExists);

        return RepositoryResponse<ImageUrl>.Success("image url generated successfully!");
      }
      else
      {
        return RepositoryResponse<ImageUrl>.Failure("SERVER ERROR", "unable to generate image url at the moment.");
      }
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
      CreatedAt = DateTime.UtcNow,
      Description = createImageUrlDto.Description
    };

    await _context.ImageUrl.AddAsync(newImageUrl);

    if(await _context.SaveChangesAsync() > 0)
    {
      await _hubContext.Clients.User(UserId).SendAsync("image-url-created", newImageUrl);
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
    imageExists.Description = updateImageUrlDto.Description ?? imageExists.Description;
    imageExists.UpdatedAt = DateTime.UtcNow;
    _context.ImageUrl.Update(imageExists);

    if(await _context.SaveChangesAsync() > 0)
    {
      await _hubContext.Clients.User(imageExists.UserId).SendAsync("image-url-updated", imageExists);
      if(imageExists.IsPublished)
      {
        await _hubContext.Clients.All.SendAsync("published-image-updated", imageExists);
      }
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
      await _hubContext.Clients.User(UserId).SendAsync("image-url-deleted", ImageId);
      if(imageExists.IsPublished)
      {
        await _hubContext.Clients.All.SendAsync("published-image-deleted", ImageId);
      }
      return RepositoryResponse<ImageUrl>.Success("image url deleted successfully!");
    }
    else
    {
      return RepositoryResponse<ImageUrl>.Failure("SERVER ERROR", "unable to delete image url at the moment.");
    }
  }

  public async Task<RepositoryResult<ImageUrl>> TogglePublishedImageStatus(string UserId, string ImageUrlId)
  {
    var imageExists = await _context.ImageUrl.FirstOrDefaultAsync(i => i.ImageUrlId == ImageUrlId && i.UserId == UserId);

    if (imageExists == null)
    {
      return RepositoryResponse<ImageUrl>.Failure("CLIENT ERROR", "image url specified does not exist.");
    }

    imageExists.IsPublished = !imageExists.IsPublished;
    imageExists.UpdatedAt = DateTime.UtcNow;
    _context.ImageUrl.Update(imageExists);

    if(await _context.SaveChangesAsync() > 0)
    {
      if(imageExists.IsPublished)
      {
        await _hubContext.Clients.All.SendAsync("published-image-created", imageExists);
      }
      else
      {
        await _hubContext.Clients.All.SendAsync("published-image-deleted", ImageUrlId);
      }
      return RepositoryResponse<ImageUrl>.Success("image url publish status toggled successfully!");
    }
    else
    {
      return RepositoryResponse<ImageUrl>.Failure("SERVER ERROR", "unable to toggle publish status at the moment.");
    }
  }

  public async Task<RepositoryResult<ImageUrl>> GetPublishedImages()
  {
    var publishedImages =  await _context.ImageUrl.Where(i => i.IsPublished).Include(u => u.User).OrderByDescending(i => i.CreatedAt).ToArrayAsync();

    if (publishedImages == null || publishedImages.Length == 0)
    {
      return RepositoryResponse<ImageUrl>.Failure("CLIENT ERROR", "no published images found.");
    }

    return RepositoryResponse<ImageUrl>.Success("published images retrieved successfully!", DataList: publishedImages);
  }

  public async Task<RepositoryResult<ImageUrl>> GetSingleImageURL(string ImageUrlId)
  {

    ImageUrl? image = await _context.ImageUrl.Include(u => u.User).ThenInclude(iu => iu!.ImageUrls).FirstOrDefaultAsync(i => i.ImageUrlId == ImageUrlId);

    if(image == null) {
      return RepositoryResponse<ImageUrl>.Success("image properties generated successfully.", image);
    }

    return RepositoryResponse<ImageUrl>.Failure("CLIENT ERROR", "image details required not found");
  }
}
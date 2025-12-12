
using Microsoft.EntityFrameworkCore;

public class SubscriptionRepository : ISubscriptionRepository
{
  private readonly DbContext _context;
  public SubscriptionRepository(DataContext context)
  {
    _context = context;
  }

  public Task<RepositoryResult<Subscription>> SendStkPush(string UserId, StkPushDto pushDto) 
  {
    throw new NotImplementedException();
  }

  public async Task<RepositoryResult<Subscription>> UpdateSubscription(UpdateSubscriptionDto dto)
  {
    throw new NotImplementedException();
  }

  public Task<RepositoryResult<Subscription>> GetUserSubscriptions(string UserId)
  {
    throw new NotImplementedException();
  }

  public Task<RepositoryResult<Subscription>> SafaricomCallback(object callbackDto)
  {
    throw new NotImplementedException();
  }
}
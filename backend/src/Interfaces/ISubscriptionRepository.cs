
public interface ISubscriptionRepository
{
  Task<RepositoryResult<Subscription>> SendStkPush(string UserId, StkPushDto pushDto);
  Task<RepositoryResult<Subscription>> GetUserSubscriptions(string UserId);
  Task SafaricomCallback(object callbackDto);
}
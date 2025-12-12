
public interface ISubscriptionRepository
{
  Task<RepositoryResult<Subscription>> SendStkPush(string UserId, StkPushDto pushDto);
  Task<RepositoryResult<Subscription>> UpdateSubscription(UpdateSubscriptionDto dto);
  Task<RepositoryResult<Subscription>> GetUserSubscriptions(string UserId);
  Task<RepositoryResult<Subscription>> SafaricomCallback(object callbackDto);
}

public interface ISubscriptionInterface
{
  RepositoryResult<Subscription> CreateSubscription(CreateSubscriptionDto SubscriptionDto);
  RepositoryResult<Subscription> UpdateSubscription(UpdateSubscriptionDto SubscriptionDto);
}
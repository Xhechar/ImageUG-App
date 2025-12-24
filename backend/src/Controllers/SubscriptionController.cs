
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("[controller]")]
public class SubscriptionController : ControllerBase
{
  private readonly ISubscriptionRepository _subscriptionRepository;
  private readonly ICurrentUserService _currentUserService;

  public SubscriptionController(ISubscriptionRepository subscriptionRepository, ICurrentUserService currentUserService)
  {
    _subscriptionRepository = subscriptionRepository;
    _currentUserService = currentUserService;
  }

  [Authorize(Roles = "User")]
  [HttpPost("initiate-payment-subscription")]
  [ProducesResponseType(typeof(RepositoryResult<Subscription>), 200)]
  [ProducesResponseType(typeof(RepositoryResult<Subscription>), 400)]
  [ProducesResponseType(typeof(RepositoryResult<Subscription>), 500)]
  public async Task<IActionResult> SendStkPush([FromBody] StkPushDto pushDto)
  {
    var UserId = _currentUserService.UserId;

    if (string.IsNullOrEmpty(UserId))
    {
      return Unauthorized(RepositoryResponse<Subscription>.Failure("CLIENT ERROR", "user not authenticated."));
    }

    RepositoryResult<Subscription> result = await _subscriptionRepository.SendStkPush(UserId, pushDto);

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
  [HttpPost("get-user-subscriptions")]
  [ProducesResponseType(typeof(RepositoryResult<Subscription>), 200)]
  [ProducesResponseType(typeof(RepositoryResult<Subscription>), 400)]
  [ProducesResponseType(typeof(RepositoryResult<Subscription>), 500)]
  public async Task<IActionResult> GetUserSubscriptions()
  {
    RepositoryResult<Subscription> result = await _subscriptionRepository.GetUserSubscriptions(_currentUserService.UserId!);

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

  [HttpPost("safaricom-callback-url")]
  public async Task<IActionResult> SafaricomCallbackUrl([FromBody] object callbackDto)
  {
    await _subscriptionRepository.SafaricomCallback(callbackDto);

    return Ok();
  }
}
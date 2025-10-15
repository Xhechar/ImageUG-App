
using FluentValidation;

public class UpdateSubscriptionValidator: AbstractValidator<UpdateSubscriptionDto>
{
  public UpdateSubscriptionValidator()
  {
    RuleFor(x => x.Price)
      .GreaterThan(0).WithMessage("Price must be greater than zero.")
      .When(x => x.Price != null);

    RuleFor(x => x.IsActive)
      .NotNull().WithMessage("IsActive is required.")
      .When(x => x.IsActive != null);

    RuleFor(x => x.StripeSubscriptionId)
      .Must(id => string.IsNullOrEmpty(id) || !string.IsNullOrWhiteSpace(id))
      .WithMessage("StripeSubscriptionId must not be empty if provided.")
      .When(x => x.StripeSubscriptionId != null);
  }
}
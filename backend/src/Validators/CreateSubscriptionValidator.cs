
using FluentValidation;

public class CreateSubscriptionValidator: AbstractValidator<CreateSubscriptionDto>
{
  public CreateSubscriptionValidator()
  {
    RuleFor(x => x.UserId)
      .NotEmpty().WithMessage("UserId is required.");

    RuleFor(x => x.Price)
      .GreaterThan(0).WithMessage("Price must be greater than zero.");

    RuleFor(x => x.ReferenceId)
      .NotEmpty().WithMessage("ReferenceId is required.");

    RuleFor(x => x.StartDate)
      .LessThan(x => x.EndDate).WithMessage("StartDate must be before EndDate.");

    RuleFor(x => x.EndDate)
      .GreaterThan(x => x.StartDate).WithMessage("EndDate must be after StartDate.");

    RuleFor(x => x.IsActive)
      .NotNull().WithMessage("IsActive is required.");

    RuleFor(x => x.StripeSubscriptionId)
      .Must(id => string.IsNullOrEmpty(id) || !string.IsNullOrWhiteSpace(id))
      .WithMessage("StripeSubscriptionId must not be empty if provided.");
  }
}

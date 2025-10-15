
using FluentValidation;

public class UpdateUserValidator : AbstractValidator<UpdateUserDto>
{
  public UpdateUserValidator()
  {
    RuleFor(x => x.Username)
      .MinimumLength(3).WithMessage("Username must be at least 3 characters long.")
      .MaximumLength(20).WithMessage("Username must not exceed 20 characters.")
      .When(x => !string.IsNullOrEmpty(x.Username));

    RuleFor(x => x.Email)
      .EmailAddress().WithMessage("A valid email is required.")
      .When(x => !string.IsNullOrEmpty(x.Email));

    RuleFor(x => x.ProfileImageUrl)
      .Must(url => string.IsNullOrEmpty(url) || Uri.IsWellFormedUriString(url, UriKind.Absolute))
      .WithMessage("ProfileImageUrl must be a valid URL if provided.");
  }
}
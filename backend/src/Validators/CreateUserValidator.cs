
using FluentValidation;

public class CreateUserValidator : AbstractValidator<CreateUserDto>
{
  public CreateUserValidator()
  {
    RuleFor(x => x.Username)
      .NotEmpty().WithMessage("Username is required.")
      .MinimumLength(3).WithMessage("Username must be at least 3 characters long.")
      .MaximumLength(20).WithMessage("Username must not exceed 20 characters.");

    RuleFor(x => x.Email)
      .NotEmpty().WithMessage("Email is required.")
      .EmailAddress().WithMessage("A valid email is required.");

    RuleFor(x => x.PasswordHash)
      .NotEmpty().WithMessage("Password is required.")
      .MinimumLength(6).WithMessage("Password must be at least 6 characters long.");

    RuleFor(x => x.ProfileImageUrl)
      .Must(url => string.IsNullOrEmpty(url) || Uri.IsWellFormedUriString(url, UriKind.Absolute))
      .WithMessage("ProfileImageUrl must be a valid URL if provided.");
  }
}
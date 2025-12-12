
using FluentValidation;

public class CreateImageUrlValidator: AbstractValidator<CreateImageUrlDto>
{
  public CreateImageUrlValidator()
  {
    RuleFor(x => x.Url)
      .NotEmpty().WithMessage("URL is required.")
      .Must(url => Uri.IsWellFormedUriString(url, UriKind.Absolute))
      .WithMessage("A valid URL is required.");
  }
}

using Microsoft.EntityFrameworkCore;

public class AuthRepository : IAuthRepository
{
  private readonly DataContext _context;
  private readonly TokenService _tokenService;

  public AuthRepository(DataContext context, TokenService tokenService)
  {
    _context = context;
  }

  public async Task<RepositoryResult<object>> Login(LoginDetails loginDetails)
  {
    
    var user = await _context.User.FirstOrDefaultAsync(u => u.Email == loginDetails.Email);

    if (user == null) {
      return RepositoryResponse<object>.Failure("CLIENT ERROR", "email provided not found, kindly register.");
    }

    bool isPasswordValid = BCrypt.Net.BCrypt.Verify(loginDetails.Password, user.PasswordHash);

    if (!isPasswordValid) {
      return RepositoryResponse<object>.Failure("CLIENT ERROR", "invalid password provided.");
    }

    var tokenDetails = new TokenDetails
    {
      UserId = user.UserId,
      Email = user.Email,
      Role = user.Role
    };

    var token = _tokenService.GenerateToken(tokenDetails);

    if (string.IsNullOrEmpty(token)) {
      return RepositoryResponse<object>.Failure("SERVER ERROR", "unable to generate authentication token, try again later.");
    }

    return RepositoryResponse<object>.Auth(token, "login successful!", user.Role);
  }

  public async Task<RepositoryResult<object>> VerifyEmail(string Email)
  {
    
    var user = await _context.User.FirstOrDefaultAsync(u => u.Email == Email);

    if (user == null) {
      return RepositoryResponse<object>.Failure("CLIENT ERROR", "email provided not found.");
    }

    var verificationCode = new Random().Next(100000, 999999).ToString();

    var newRecovery = new Recovery
    {
      RecoveryId = Guid.NewGuid().ToString(),
      Email = Email,
      VerificationCode = verificationCode,
      CreatedAt = DateTime.UtcNow,
      ExpiresAt = DateTime.UtcNow.AddHours(1),
      IsUsed = false
    };

    await _context.Recovery.AddAsync(newRecovery);

    if(await _context.SaveChangesAsync() > 0)
    {
      

      return RepositoryResponse<object>.Success("verification code generated successfully!", Data: new { VerificationCode = verificationCode });
    }
    else
    {
      return RepositoryResponse<object>.Failure("SERVER ERROR", "unable to generate verification code at the moment.");
    }
  }

  public async Task<RepositoryResult<object>> ChangePassword(ChangePasswordDto changePasswordDto)
  {
    throw new NotImplementedException();
  }
}
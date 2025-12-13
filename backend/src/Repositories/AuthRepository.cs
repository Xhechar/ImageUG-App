
using Microsoft.EntityFrameworkCore;

public class AuthRepository : IAuthRepository
{
  private readonly DataContext _context;
  private readonly ITokenService _tokenService;
  private readonly IEmailService _emailService;

  public AuthRepository(DataContext context, ITokenService tokenService, IEmailService emailService)
  {
    _context = context;
    _tokenService = tokenService;
    _emailService = emailService;
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
      var emailData = new EmailDataDto
      {
        UserName = user.Username,
        Email = Email,
        Subject = "Password Recovery - Verification Code",
        Body = $"Dear {user.Username},\n\nYour password recovery verification code is: {verificationCode}\n\nThis code will expire in 1 hour.\n\nIf you did not request a password reset, please ignore this email.\n\nBest regards,\nImage URL Generator Team"
      };

      await _emailService.SendEmail(emailData);

      return RepositoryResponse<object>.Success("verification code generated successfully!", Data: new { VerificationCode = verificationCode });
    }
    else
    {
      return RepositoryResponse<object>.Failure("SERVER ERROR", "unable to generate verification code at the moment.");
    }
  }

  public async Task<RepositoryResult<object>> ChangePassword(ChangePasswordDto changePasswordDto)
  {
    
    var user = await _context.User.FirstOrDefaultAsync(u => u.Email == changePasswordDto.Email);

    if (user == null) {
      return RepositoryResponse<object>.Failure("CLIENT ERROR", "email provided not found.");
    }

    var recoveryRecord = await _context.Recovery.FirstOrDefaultAsync(r => r.Email == changePasswordDto.Email && r.VerificationCode == changePasswordDto.VerificationCode);

      if (recoveryRecord == null) {
        return RepositoryResponse<object>.Failure("CLIENT ERROR", "verification code not found.");
      }

      if (recoveryRecord.IsUsed) {
        return RepositoryResponse<object>.Failure("CLIENT ERROR", "verification code has already been used.");
      }

      if (recoveryRecord.ExpiresAt < DateTime.UtcNow) {
        return RepositoryResponse<object>.Failure("CLIENT ERROR", "verification code has expired.");
      }

      user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(changePasswordDto.NewPassword);

    recoveryRecord.IsUsed = true;

    _context.User.Update(user);
    _context.Recovery.Update(recoveryRecord);

    if(await _context.SaveChangesAsync() > 0)
    {
      return RepositoryResponse<object>.Success("password changed successfully!");
    }
    else
    {
      return RepositoryResponse<object>.Failure("SERVER ERROR", "unable to change password at the moment.");
    }
  }
}
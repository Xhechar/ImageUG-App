
public interface IAuthRepository
{
  Task<RepositoryResult<object>> Login(LoginDetails details);
  Task<RepositoryResult<object>> VerifyEmail(string Email);
  Task<RepositoryResult<object>> ChangePassword(ChangePasswordDto passwordDto);
}
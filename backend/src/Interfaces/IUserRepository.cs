
using ImageURLGenerator.Model;

public interface IUserRepository
{
  Task<RepositoryResult<User>> CreateUser(CreateUserDto UserDto);
  Task<RepositoryResult<User>> UpdateUser(string UserId, UpdateUserDto UserDto);
  Task<RepositoryResult<User>> UpdateProfileImage(string UserId, string ImageUrl);
  Task<RepositoryResult<User>> GetUserById(string UserId);
  Task<RepositoryResult<User>> DeleteUser(string UserId);
  Task<RepositoryResult<User>> ToggleUserRole(string UserId);
}
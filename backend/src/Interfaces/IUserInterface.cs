
public interface IUserInterface
{
  RepositoryResponse<User> CreateUser(CreateUserDto UserDto);
  RepositoryResult<User> UpdateUser(UpdateUserDto UserDto);
  RepositoryResult<User> UpdateProfileImage(string ImageUrl);
  RepositoryResult<User> GetUserById(string UserId);
  RepositoryResult<User> DeleteUser(string UserId);
}
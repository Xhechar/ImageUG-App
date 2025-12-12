
using ImageURLGenerator.Model;
using Microsoft.EntityFrameworkCore;

public class UserRepository : IUserRepository
{
  private readonly DataContext _context;

  public UserRepository(DataContext context)
  {
    _context = context;
  }

  public async Task<RepositoryResult<User>> CreateUser(CreateUserDto createUserDto)
  {
    
    var UserExists = await _context.User.FirstOrDefaultAsync(u => u.Email == createUserDto.Email);

    if (UserExists != null)
    {
      return RepositoryResponse<User>.Failure("CLIENT ERROR", "email provided exists.");
    }

    var PhoneExists = await _context.User.FirstOrDefaultAsync(u => u.PhoneNumber == createUserDto.PhoneNumber);

    if (PhoneExists != null)
    {
      return RepositoryResponse<User>.Failure("CLIENT ERROR", "phone number provided exists.");
    }

    if(createUserDto.PhoneNumber.StartsWith("07") || createUserDto.PhoneNumber.StartsWith("01"))
    {
      createUserDto.PhoneNumber = string.Concat("254", createUserDto.PhoneNumber.AsSpan(1));
    }

    var newUser = new User
    {
      UserId = Guid.NewGuid().ToString(),
      Username = createUserDto.Username,
      Email = createUserDto.Email,
      PhoneNumber = createUserDto.PhoneNumber,
      PasswordHash = BCrypt.Net.BCrypt.HashPassword(createUserDto.PasswordHash),
      Role = "User",
      ProfileImageUrl = createUserDto.ProfileImageUrl
    };

    await _context.User.AddAsync(newUser);

    if(await _context.SaveChangesAsync() > 0)
    {
      return RepositoryResponse<User>.Success("registration successful, welcome!");
    }
    else
    {
      return RepositoryResponse<User>.Failure("SERVER ERROR", "unable to complete registration, try again later.");
    }
  }

  public async Task<RepositoryResult<User>> UpdateUser(string UserId, UpdateUserDto updateUserDto)
  {
    
    var UserExists = await _context.User.FirstOrDefaultAsync(u => u.UserId == UserId);

    if (UserExists == null)
    {
      return RepositoryResponse<User>.Failure("CLIENT ERROR", "user specified does not exist.");
    }

    UserExists.Username = updateUserDto.Username ?? UserExists.Username;
    UserExists.Email = updateUserDto.Email ?? UserExists.Email;
    UserExists.ProfileImageUrl = updateUserDto.ProfileImageUrl ?? UserExists.ProfileImageUrl;
    UserExists.UpdatedAt = DateTime.UtcNow;
    _context.User.Update(UserExists);

    if(await _context.SaveChangesAsync() > 0)
    {
      return RepositoryResponse<User>.Success("profile updated successfully!");
    }
    else
    {
      return RepositoryResponse<User>.Failure("SERVER ERROR", "unable to update profile, try again later.");
    }
  }

  public async Task<RepositoryResult<User>> UpdateProfileImage(string UserId, string profileImageUrl)
  {
    
    var UserExists = await _context.User.FirstOrDefaultAsync(u => u.UserId == UserId);

    if (UserExists == null)
    {
      return RepositoryResponse<User>.Failure("CLIENT ERROR", "user specified does not exist.");
    }

    UserExists.ProfileImageUrl = profileImageUrl;
    UserExists.UpdatedAt = DateTime.UtcNow;
    _context.User.Update(UserExists);

    if(await _context.SaveChangesAsync() > 0)
    {
      return RepositoryResponse<User>.Success("profile image updated successfully!");
    }
    else
    {
      return RepositoryResponse<User>.Failure("SERVER ERROR", "unable to update profile image, try again later.");
    }
  }

  public async Task<RepositoryResult<User>> GetUserById(string UserId)
  {
    
    var user = await _context.User.Include(u => u.ImageUrls).Include(u => u.PaymentDatas).FirstOrDefaultAsync(u => u.UserId == UserId);

    if (user == null)
    {
      return RepositoryResponse<User>.Failure("CLIENT ERROR", "user specified does not exist.");
    }

    return RepositoryResponse<User>.Success("user retrieved successfully!", Data: user);
  }

  public async Task<RepositoryResult<User>> DeleteUser(string UserId)
  {
    
    var UserExists = await _context.User.FirstOrDefaultAsync(u => u.UserId == UserId);

    if (UserExists == null)
    {
      return RepositoryResponse<User>.Failure("CLIENT ERROR", "user specified does not exist.");
    }

    _context.User.Remove(UserExists);

    if(await _context.SaveChangesAsync() > 0)
    {
      return RepositoryResponse<User>.Success("user deleted successfully!");
    }
    else
    {
      return RepositoryResponse<User>.Failure("SERVER ERROR", "unable to delete user, try again later.");
    }
  }

  public async Task<RepositoryResult<User>> ToggleUserRole(string UserId)
  {
    
    var UserExists = await _context.User.FirstOrDefaultAsync(u => u.UserId == UserId);

    if (UserExists == null)
    {
      return RepositoryResponse<User>.Failure("CLIENT ERROR", "user specified does not exist.");
    }

    UserExists.Role = UserExists.Role == "User" ? "Admin" : "User";
    UserExists.UpdatedAt = DateTime.UtcNow;
    _context.User.Update(UserExists);

    if(await _context.SaveChangesAsync() > 0)
    {
      return RepositoryResponse<User>.Success("user role updated successfully!");
    }
    else
    {
      return RepositoryResponse<User>.Failure("SERVER ERROR", "unable to update user role, try again later.");
    }
  }
}
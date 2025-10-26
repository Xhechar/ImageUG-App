
public class RepositoryResult<T>
{
  public bool Success { get; set; }
  public required string Title { get; set; }
  public string? SuccessMessage { get; set; }
  public string? ErrorMessage { get; set; }
  public T? Data { get; set; }
  public T[]? DataList { get; set; }
  public string? Token { get; set; }
  public string? Role { get; set; }
}

public class RepositoryResponse<T>
{
  public static RepositoryResult<T> Success( string? SuccessMessage = null, T? Data = default, T[]? DataList = default)
  {
    return new RepositoryResult<T>
    {
      Success = true,
      Title = "SUCCESS",
      SuccessMessage = SuccessMessage,
      Data = Data,
      DataList = DataList
    };
  }

  public static RepositoryResult<T> Failure(string Title, string? ErrorMessage = null)
  {
    return new RepositoryResult<T>
    {
      Success = false,
      Title = Title,
      ErrorMessage = ErrorMessage
    };
  }

  public static RepositoryResult<T> Auth(string Token, string? SuccessMessage = null, string? Role = null)
  {
    return new RepositoryResult<T>
    {
      Success = true,
      Title = "AUTH_SUCCESS",
      SuccessMessage = SuccessMessage,
      Token = Token,
      Role = Role
    };
  }
}
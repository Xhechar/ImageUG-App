
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

public class TokenService 
{
  private readonly IConfiguration Config;

  public TokenService(IConfiguration Config)
  {
    this.Config = Config;
  }

  string GenerateToken(TokenDetails details) 
  {

    var JwtSettings = this.Config.GetSection("JwtSettings");

    var claims = new[] {
      new Claim(JwtRegisteredClaimNames.Sub, details.UserId),
      new Claim(JwtRegisteredClaimNames.Email, details.Email),
      new Claim(ClaimTypes.Role, details.Role)
    };

    var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(JwtSettings["SecretKey"]!));

    var Creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

    var Token = new JwtSecurityToken(
      issuer: JwtSettings["Issuer"],
      audience: JwtSettings["Audience"],
      claims: claims,
      signingCredentials: Creds,
      expires: DateTime.UtcNow.AddMinutes(Convert.ToDouble(JwtSettings["Expires"]))
    );

    return new JwtSecurityTokenHandler().WriteToken(Token);
  }
}
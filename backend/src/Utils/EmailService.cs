
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

public class EmailService 
{
  private readonly IConfiguration _configuration;

  public EmailService(IConfiguration configuration) {
    _configuration = configuration;
  }

  public async Task SendEmail(EmailDataDto dataDto)
  {
    var MailConfigurations = _configuration.GetSection("MailConfigurations");
    var Email = new MimeMessage();

    Email.From.Add(new MailboxAddress("Image_URL_Gen", MailConfigurations["SenderMail"]));
    Email.To.Add(new MailboxAddress(dataDto.UserName, dataDto.Email));
    Email.Subject = dataDto.Subject;
    Email.Body = new TextPart("plain") {
      Text = dataDto.Body
    };

    using var smtp = new SmtpClient();
    smtp.Connect(MailConfigurations["SmtpServer"], 587, SecureSocketOptions.StartTls);
    smtp.Authenticate(MailConfigurations["SenderMail"], MailConfigurations["SenderPassword"]);
    await smtp.SendAsync(Email);
    smtp.Disconnect(true);
  }
}
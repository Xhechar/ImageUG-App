using System.Text;
using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddHttpClient("MpesaApi", client => {
    client.BaseAddress = new Uri(builder.Configuration["PaymentSettings:Env"] == "Production" ? "https://api.safaricom.co.ke/" : "https://sandbox.safaricom.co.ke/");
    client.DefaultRequestHeaders.Add("Accept", "application/json");
});
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();
builder.Services.AddScoped<IPaymentService, PaymentService>();
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IAuthRepository, AuthRepository>();
builder.Services.AddScoped<ISubscriptionRepository, SubscriptionRepository>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IImageUrlRepository, ImageUrlRepository>();

builder.Services.Configure<ApiBehaviorOptions>(options =>
{
    options.InvalidModelStateResponseFactory = context =>
    {
        var errors = context.ModelState
            .Where(e => e.Value?.Errors.Count > 0)
            .SelectMany(x => x.Value!.Errors)
            .Select(x => x.ErrorMessage)
            .ToArray();

        var response = RepositoryResponse<string>.Failure("VALIDATION ERROR", errors[0]);
        return new BadRequestObjectResult(response);
    };
});

builder.Services.AddSignalR();
builder.Services.AddHttpContextAccessor();
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<CreateUserValidator>();

builder.Services.AddDbContext<DataContext>(options =>
{
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"));
});

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(options =>
{
    var JwtSettings = builder.Configuration.GetSection("JwtSettings");

    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidIssuer = JwtSettings["Issuer"],
        ValidateAudience = true,
        ValidAudience = JwtSettings["Audience"],
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(JwtSettings["SecretKey"]!))
    };

    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var token = context.HttpContext.Request.Cookies["auth_token"];
            if (!string.IsNullOrEmpty(token))
            {
                context.Token = token;
            }
            return Task.CompletedTask;
        }
    };
});

builder.Services.AddAuthorization();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp", policy =>
    {
        var frontendUrl = builder.Configuration["FRONTEND_URL"];
        policy.WithOrigins(frontendUrl!)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

builder.Services.AddSingleton<Microsoft.AspNetCore.SignalR.IUserIdProvider, CustomUserIdProvider>();

builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
});
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Pipeline order matters!
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowAngularApp");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapHub<BackendHub>("/hub");

app.Urls.Add("http://0.0.0.0:8080");
app.Run();
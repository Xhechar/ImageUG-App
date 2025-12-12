
using Microsoft.EntityFrameworkCore;

public class DataContext: DbContext 
{
  public DataContext(DbContextOptions<DataContext> options) : base(options) { }

  public DbSet<User> User => Set<User>();
  public DbSet<ImageUrl> ImageUrl => Set<ImageUrl>();
  public DbSet<Subscription> Subscription => Set<Subscription>();
  public DbSet<PaymentData> PaymentData => Set<PaymentData>();
}
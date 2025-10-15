
using Microsoft.EntityFrameworkCore;

public class DataContext: DbContext 
{
  public DataContext(DbContextOptions<DataContext> options) : base(options) { }

  public DbSet<User> User => Set<User>();
  public DbSet<ImageUrl> ImageUrl => Set<ImageUrl>();
  public DbSet<Subscription> Subscription => Set<Subscription>();

  protected override void OnModelCreating(ModelBuilder modelBuilder)
  {
    modelBuilder.Entity<User>()
      .HasMany(u => u.ImageUrls)
      .WithOne(i => i.User)
      .HasForeignKey(i => i.UserId)
      .OnDelete(DeleteBehavior.Cascade);

    modelBuilder.Entity<User>()
      .HasMany(u => u.Subscriptions)
      .WithOne(s => s.User)
      .HasForeignKey(s => s.UserId)
      .OnDelete(DeleteBehavior.Cascade);
  }
}
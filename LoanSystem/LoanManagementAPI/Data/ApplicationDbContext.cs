using LoanManagementAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace LoanManagementAPI.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }
        public DbSet<LoanApplication> LoanApplications { get; set; }
        public DbSet<RiskAnalysisResult> RiskAnalysisResults { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<AuditLog> AuditLogs { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<LoanApplication>()
                .HasMany(l => l.RiskAnalysisResults)
                .WithOne(r => r.LoanApplication)
                .HasForeignKey(r => r.LoanApplicationId);

            modelBuilder.Entity<LoanApplication>().Property(p => p.AnnualIncome).HasPrecision(18, 2);
            modelBuilder.Entity<LoanApplication>().Property(p => p.SavingsAssets).HasPrecision(18, 2);
            modelBuilder.Entity<LoanApplication>().Property(p => p.CurrentDebt).HasPrecision(18, 2);
            modelBuilder.Entity<LoanApplication>().Property(p => p.LoanAmount).HasPrecision(18, 2);

            modelBuilder.Entity<LoanApplication>().Property(p => p.DebtToIncomeRatio).HasPrecision(10, 4);
            modelBuilder.Entity<LoanApplication>().Property(p => p.LoanToIncomeRatio).HasPrecision(10, 4);
            modelBuilder.Entity<LoanApplication>().Property(p => p.PaymentToIncomeRatio).HasPrecision(10, 4);

            modelBuilder.Entity<LoanApplication>().Property(p => p.InterestRate).HasPrecision(5, 2);
        }
    }
    
}

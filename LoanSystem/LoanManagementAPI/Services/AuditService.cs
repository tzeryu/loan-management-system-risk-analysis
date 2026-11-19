using LoanManagementAPI.Data;
using LoanManagementAPI.Models;

namespace LoanManagementAPI.Services
{
    public class AuditService
    {
        private readonly ApplicationDbContext _context;

        public AuditService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task LogAsync(
            string username,
            string role,
            string action,
            string entityType,
            string entityId)
        {
            var log = new AuditLog
            {
                Username = username,
                UserRole = role,
                Action = action,
                EntityType = entityType,
                EntityId = entityId,
                Timestamp = DateTime.Now
            };

            _context.AuditLogs.Add(log);

            await _context.SaveChangesAsync();
        }
    }
}
namespace LoanManagementAPI.Models
{
    public class AuditLog
    {
        public int Id { get; set; }

        public string Username { get; set; } = "";

        public string UserRole { get; set; } = "";

        public string Action { get; set; } = "";

        public string EntityType { get; set; } = "";

        public string EntityId { get; set; } = "";

        public DateTime Timestamp { get; set; }
            = DateTime.Now;
    }
}

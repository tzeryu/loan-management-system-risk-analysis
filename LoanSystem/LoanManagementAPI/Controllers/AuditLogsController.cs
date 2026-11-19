using LoanManagementAPI.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LoanManagementAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuditLogsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AuditLogsController(
            ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetLogs()
        {
            var logs = await _context.AuditLogs
                .OrderByDescending(x => x.Timestamp)
                .ToListAsync();

            return Ok(logs);
        }
    }
}
using LoanManagementAPI.Data;
using LoanManagementAPI.Models;
using LoanManagementAPI.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LoanManagementAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly AuditService _auditService;

        public UsersController(ApplicationDbContext context, AuditService auditService)
        {
            _context = context;
            _auditService = auditService;
        }

        [HttpGet]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _context.Users
                .Select(u => new
                {
                    u.Id,
                    u.Username,
                    u.Role,
                    u.IsActive,
                    u.CreatedAt
                })
                .ToListAsync();

            return Ok(users);
        }

        [HttpPost]
        public async Task<IActionResult> CreateUser(User user)
        {
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var username = Request.Headers["X-Username"].ToString();
            var role = Request.Headers["X-Role"].ToString();

            await _auditService.LogAsync(
                username,
                role,
                "Created User",
                "User",
                user.Id.ToString()
            );

            return Ok(new
            {
                user.Id,
                user.Username,
                user.Role,
                user.IsActive,
                user.CreatedAt
            });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, User updated)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
                return NotFound();

            user.Username = updated.Username;
            user.Role = updated.Role;
            user.IsActive = updated.IsActive;

            await _context.SaveChangesAsync();

            var username = Request.Headers["X-Username"].ToString();
            var role = Request.Headers["X-Role"].ToString();

            await _auditService.LogAsync(
                username,
                role,
                "Updated User",
                "User",
                user.Id.ToString()
            );

            return Ok(new
            {
                user.Id,
                user.Username,
                user.Role,
                user.IsActive,
                user.CreatedAt
            });
        }

        [HttpPatch("{id}/status")]
        public async Task<IActionResult> ChangeStatus(
            int id,
            [FromBody] UserStatusRequest request)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
                return NotFound();

            user.IsActive = request.IsActive;

            await _context.SaveChangesAsync();

            var username = Request.Headers["X-Username"].ToString();
            var role = Request.Headers["X-Role"].ToString();

            await _auditService.LogAsync(
                username,
                role,
                request.IsActive
                    ? "Activated User"
                    : "Deactivated User",
                "User",
                user.Id.ToString()
            );

            return Ok(new
            {
                user.Id,
                user.Username,
                user.Role,
                user.IsActive,
                user.CreatedAt
            });
        }
    }
}

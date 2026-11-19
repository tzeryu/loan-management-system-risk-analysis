using LoanManagementAPI.Data;
using LoanManagementAPI.Models;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LoginRequest = LoanManagementAPI.Models.LoginRequest;


namespace LoanManagementAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AuthController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u =>
                    u.Username == request.Username &&
                    u.Password == request.Password);

            if (user == null)
                return Unauthorized("Invalid credentials");

            if (!user.IsActive)
                return StatusCode(403, new { message = "Account has been deactivated. Please contact administrator." });

            return Ok(new
            {
                username = user.Username,
                role = user.Role
            });
        }
    }
}
using LoanManagementAPI.Data;
using LoanManagementAPI.DTOs;
using LoanManagementAPI.Models;
using LoanManagementAPI.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LoanManagementAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LoanApplicationController : ControllerBase
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly AuditService _auditService;

        public LoanApplicationController(ApplicationDbContext dbContext, AuditService auditService)
        {
            _dbContext = dbContext;
            _auditService = auditService;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetLoanApplication(int id)
        {
            var application = await _dbContext.LoanApplications
                .FirstOrDefaultAsync(a => a.Id == id);

            if (application == null)
            {
                return NotFound("Loan application not found.");
            }

            return Ok(application);
        }

        [HttpGet]
        public async Task<IActionResult> GetLoanApplications()
        {
            var applications = await _dbContext.LoanApplications
                .OrderByDescending(a => a.Id)
                .Include(a => a.RiskAnalysisResults)
                .Select(a => new
                {
                    a.Id,
                    a.Name,
                    a.Age,
                    a.LoanAmount,
                    a.Status,
                    a.ModelType,
                    a.CreatedAt,
                    UpdatedAt = a.UpdatedAt == default ? a.CreatedAt : a.UpdatedAt,
                    RiskAnalysisResults = a.RiskAnalysisResults.Select(r => new
                    {
                        r.RiskLevel,
                        r.Probability,
                        r.ModelUsed,
                        r.GeneratedAt
                    })
                })
                .ToListAsync();

            return Ok(applications);
        }

        [HttpPost("{id}/forward-review")]
        public async Task<IActionResult> ForwardForReview(int id)
        {
            var application = await _dbContext.LoanApplications.FindAsync(id);

            if (application == null)
            {
                return NotFound("Loan application not found.");
            }

            application.Status = "Pending Admin Review";
            application.UpdatedAt = DateTime.UtcNow;

            await _dbContext.SaveChangesAsync();

            var username = Request.Headers["X-Username"].ToString();
            var role = Request.Headers["X-Role"].ToString();

            await _auditService.LogAsync(
                username,
                role,
                "Forwarded for Admin Review",
                "LoanApplication",
                application.Id.ToString()
            );
            return Ok(application);
        }

        [HttpPost("{id}/approve")]
        public async Task<IActionResult> Approve(int id, [FromBody] DecisionRequest request)
        {
            var application = await _dbContext.LoanApplications.FindAsync(id);

            if (application == null)
                return NotFound();

            if (application.Status != "Pending Admin Review")
            {
                return BadRequest("Only applications pending admin review can be approved or rejected.");
            }

            application.Status = "Approved";

            application.DecisionReason = request.DecisionReason;

            application.UpdatedAt = DateTime.UtcNow;

            await _dbContext.SaveChangesAsync();

            var username = Request.Headers["X-Username"].ToString();
            var role = Request.Headers["X-Role"].ToString();

            await _auditService.LogAsync(
                username,
                role,
                "Approved Loan Application",
                "LoanApplication",
                application.Id.ToString()
            );

            return Ok(application);
        }

        [HttpPost("{id}/reject")]
        public async Task<IActionResult> Reject(int id, [FromBody] DecisionRequest request)
        {
            var application = await _dbContext.LoanApplications.FindAsync(id);

            if (application == null)
                return NotFound();

            if (application.Status != "Pending Admin Review")
            {
                return BadRequest("Only applications pending admin review can be approved or rejected.");
            }

            application.Status = "Rejected";

            application.DecisionReason = request.DecisionReason;

            application.UpdatedAt = DateTime.UtcNow;

            await _dbContext.SaveChangesAsync();

            var username = Request.Headers["X-Username"].ToString();
            var role = Request.Headers["X-Role"].ToString();

            await _auditService.LogAsync(
                username,
                role,
                "Rejected Loan Application",
                "LoanApplication",
                application.Id.ToString()
            );

            return Ok(application);
        }
    }
}
using LoanManagementAPI.Data;
using LoanManagementAPI.Models;
using LoanManagementAPI.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LoanManagementAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RiskAnalysisController : ControllerBase
    {
        private readonly IRiskAnalysisService _riskAnalysisService;
        private readonly ApplicationDbContext _dbContext;
        private readonly AuditService _auditService;
        public RiskAnalysisController(IRiskAnalysisService riskAnalysisService, ApplicationDbContext dbContext, AuditService auditService)
        {
            _riskAnalysisService = riskAnalysisService;
            _dbContext = dbContext;
            _auditService = auditService;
        }
        [HttpPost("submit")]
        public async Task<IActionResult> Predict([FromBody] LoanApplication application)
        {
            try
            {
                _dbContext.LoanApplications.Add(application);
                await _dbContext.SaveChangesAsync();

                var username = Request.Headers["X-Username"].ToString();
                var role = Request.Headers["X-Role"].ToString();

                await _auditService.LogAsync(
                    username,
                    role,
                    "Created Loan Application",
                    "LoanApplication",
                    application.Id.ToString()
                );

                var predResult = await _riskAnalysisService.PredictAsync(application);

                if (predResult == null)
                {
                    return StatusCode(500, "Prediction Failed");
                }
                var riskAnalysisResult = new RiskAnalysisResult
                {
                    LoanApplicationId = application.Id,
                    Prediction = predResult.Prediction,
                    Probability = predResult.Probability,
                    RiskLevel = predResult.RiskLevel,
                    ModelUsed = predResult.ModelUsed ?? application.ModelType,
                    AnalysisSessionId = application.AnalysisSessionId,
                    GeneratedAt = DateTime.UtcNow
                };

                var modelType = application.ModelType.ToLower();
                application.ModelType = modelType;

                var existingResult = await _dbContext.RiskAnalysisResults
                    .FirstOrDefaultAsync(r =>
                    r.LoanApplicationId == application.Id &&
                    r.ModelUsed.ToLower() == modelType);

                if (existingResult != null)
                {
                    existingResult.Prediction = predResult.Prediction;
                    existingResult.Probability = predResult.Probability;
                    existingResult.RiskLevel = predResult.RiskLevel;
                    existingResult.GeneratedAt = DateTime.UtcNow;
                }
                else
                {
                    _dbContext.RiskAnalysisResults.Add(riskAnalysisResult);
                }

                application.Status = "Risk Evaluated";
                application.UpdatedAt = DateTime.UtcNow;
                await _dbContext.SaveChangesAsync();               

           

                return Ok(new
                {
                    applicationId = application.Id,
                    analysisSessionId = application.AnalysisSessionId,
                    modelUsed = riskAnalysisResult.ModelUsed,
                    prediction = riskAnalysisResult.Prediction,
                    probability = riskAnalysisResult.Probability,
                    riskLevel = riskAnalysisResult.RiskLevel,
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Prediction Request Failed {ex.Message}");
            }
        }

        [HttpPost("predict/{applicationId}/{modelType}")]
        public async Task<IActionResult> PredictWithModel(int applicationId, string modelType)
        {
            try
            {
                var application = await _dbContext.LoanApplications
                    .FirstOrDefaultAsync(a => a.Id == applicationId);

                if (application == null)
                {
                    return NotFound("Loan application not found.");
                }

                var allowedModels = new[] { "random_forest","catboost", "lightgbm", "xgboost" };

                modelType = modelType.ToLower();

                if (!allowedModels.Contains(modelType))
                {
                    return BadRequest("Invalid model type. Choose from: random_forest, catboost, lightgbm, xgboost.");
                }

                application.ModelType = modelType;

                var predResult = await _riskAnalysisService.PredictAsync(application);

                if (predResult == null)
                {
                    return StatusCode(500, "Prediction Failed");
                }

                var riskAnalysisResult = new RiskAnalysisResult
                {
                    LoanApplicationId = application.Id,
                    Prediction = predResult.Prediction,
                    Probability = predResult.Probability,
                    RiskLevel = predResult.RiskLevel,
                    ModelUsed = predResult.ModelUsed ?? modelType.ToLower(),
                    AnalysisSessionId = application.AnalysisSessionId,
                    GeneratedAt = DateTime.UtcNow
                };

                var existingResult = await _dbContext.RiskAnalysisResults
                    .FirstOrDefaultAsync(r =>
                        r.LoanApplicationId == application.Id &&
                        r.ModelUsed == modelType);

                if (existingResult != null)
                {
                    existingResult.Prediction = predResult.Prediction;
                    existingResult.Probability = predResult.Probability;
                    existingResult.RiskLevel = predResult.RiskLevel;
                    existingResult.GeneratedAt = DateTime.UtcNow;
                }
                else
                {
                    _dbContext.RiskAnalysisResults.Add(riskAnalysisResult);
                }

                await _dbContext.SaveChangesAsync();

                return Ok(new
                {
                    applicationId = application.Id,
                    analysisSessionId = application.AnalysisSessionId,
                    modelUsed = riskAnalysisResult.ModelUsed,
                    prediction = riskAnalysisResult.Prediction,
                    probability = riskAnalysisResult.Probability,
                    riskLevel = riskAnalysisResult.RiskLevel
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Prediction Request Failed: {ex.Message}");
            }
        }

        [HttpGet("compare/{sessionId}")]
        public async Task<IActionResult> GetComparison(string sessionId)
        {
            var results = await _dbContext.RiskAnalysisResults
                .Where(r => r.AnalysisSessionId == sessionId)
                .OrderByDescending(r => r.GeneratedAt)
                .ToListAsync();

            return Ok(results);
        }

        [HttpGet("compare/{sessionId}/summary")]
        public async Task<IActionResult> GetComparisonSummary(string sessionId)
        {
            var results = await _dbContext.RiskAnalysisResults
                .Where(r => r.AnalysisSessionId == sessionId)
                .ToListAsync();

            if (!results.Any())
            {
                return NotFound("No prediction results found for this session.");
            }

            var averageProbability = results.Average(r => r.Probability);

            var riskCounts = results
                .GroupBy(r => r.RiskLevel)
                .Select(g => new
                {
                    riskLevel = g.Key,
                    count = g.Count()
                })
                .OrderByDescending(g => g.count)
                .ToList();

            var consensusRiskLevel = riskCounts.First().riskLevel;

            return Ok(new
            {
                analysisSessionId = sessionId,
                totalModelsCompared = results.Count,
                averageProbability,
                consensusRiskLevel,
                modelResults = results.Select(r => new
                {
                    modelUsed = r.ModelUsed,
                    prediction = r.Prediction,
                    probability = r.Probability,
                    riskLevel = r.RiskLevel,
                    generatedAt = r.GeneratedAt
                })
            });
        }
    }

}

using LoanManagementAPI.Models;

namespace LoanManagementAPI.Services
{
    public interface IRiskAnalysisService
    {
        Task<RiskPredictionResponse> PredictAsync(LoanApplication application);
    }
}

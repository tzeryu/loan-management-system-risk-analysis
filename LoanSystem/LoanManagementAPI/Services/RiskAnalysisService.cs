using LoanManagementAPI.Models;
using System.Text.Json;

namespace LoanManagementAPI.Services
{
    public class RiskAnalysisService : IRiskAnalysisService
    {
        private readonly HttpClient _httpClient;
        public RiskAnalysisService(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }
        public async Task<RiskPredictionResponse> PredictAsync(LoanApplication application)
        {
            var request = new
            {
                age = application.Age,
                occupation_status = application.OccupationStatus,
                years_employed = application.YearsEmployed,
                annual_income = application.AnnualIncome,
                credit_score = application.CreditScore,
                credit_history_years = application.CreditHistoryYears,
                savings_assets = application.SavingsAssets,
                current_debt = application.CurrentDebt,
                defaults_on_file = application.DefaultsOnFile,
                delinquencies_last_2yrs = application.DelinquenciesLast2Yrs,
                derogatory_marks = application.DerogatoryMarks,
                product_type = application.ProductType,
                loan_intent = application.LoanIntent,
                loan_amount = application.LoanAmount,
                interest_rate = application.InterestRate,
                debt_to_income_ratio = application.DebtToIncomeRatio,
                loan_to_income_ratio = application.LoanToIncomeRatio,
                payment_to_income_ratio = application.PaymentToIncomeRatio,
                model_type = application.ModelType,
                analysis_session_id = application.AnalysisSessionId
            };

            var modelType = request.model_type?.ToLower() ?? "xgboost";

            var url = $"/predict/{modelType}";

            var response = await _httpClient.PostAsJsonAsync(url, request);

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                throw new Exception($"FastAPI call failed: {response.StatusCode} - {errorContent}");
            }

            var options = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            };

            var predictionResult = await response.Content.ReadFromJsonAsync<RiskPredictionResponse>(options);

            return predictionResult;
        }
    }
}

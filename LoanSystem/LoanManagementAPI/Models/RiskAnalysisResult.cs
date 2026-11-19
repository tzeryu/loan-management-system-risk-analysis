namespace LoanManagementAPI.Models
{
    public class RiskAnalysisResult
    {
        public int Id { get; set; }
        public int LoanApplicationId { get; set; }
        public int Prediction { get; set; }
        public double Probability { get; set; }
        public string RiskLevel { get; set; }
        public string ModelUsed { get; set; }
        public string AnalysisSessionId { get; set; }
        public DateTime GeneratedAt { get; set; } = DateTime.Now;
        public LoanApplication? LoanApplication { get; set; }
    }
}

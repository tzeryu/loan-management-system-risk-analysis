namespace LoanManagementAPI.Models
{
    public class RiskPredictionResponse
    {
        public string ModelUsed { get; set; }
        public int Prediction { get; set; }
        public double Probability { get; set; }
        public string RiskLevel { get; set; }
    }
}

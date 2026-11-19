namespace LoanManagementAPI.Models
{
    public class LoanApplication
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public int Age { get; set; }
        public string OccupationStatus { get; set; }
        public int YearsEmployed { get; set; }
        public decimal AnnualIncome { get; set; }
        public int CreditScore { get; set; }
        public int CreditHistoryYears { get; set; }
        public decimal SavingsAssets { get; set; }
        public decimal CurrentDebt { get; set; }
        public int DefaultsOnFile { get; set; }
        public int DelinquenciesLast2Yrs { get; set; }
        public int DerogatoryMarks { get; set; }
        public string ProductType { get; set; }
        public string LoanIntent { get; set; }
        public decimal LoanAmount { get; set; }
        public decimal InterestRate { get; set; }   
        public decimal DebtToIncomeRatio { get; set; }
        public decimal LoanToIncomeRatio { get; set; }
        public decimal PaymentToIncomeRatio { get; set; }
        public string ModelType { get; set; } = "catboost";
        public string AnalysisSessionId { get; set; } = Guid.NewGuid().ToString();
        public string Status { get; set; } = "Submitted";
        public string? DecisionReason { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime UpdatedAt { get; set; } = DateTime.Now;
        public ICollection<RiskAnalysisResult> RiskAnalysisResults { get; set; } = new List<RiskAnalysisResult>();
    }
}

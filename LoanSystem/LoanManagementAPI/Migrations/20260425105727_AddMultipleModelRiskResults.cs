using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LoanManagementAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddMultipleModelRiskResults : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_RiskAnalysisResults_LoanApplicationId",
                table: "RiskAnalysisResults");

            migrationBuilder.CreateIndex(
                name: "IX_RiskAnalysisResults_LoanApplicationId",
                table: "RiskAnalysisResults",
                column: "LoanApplicationId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_RiskAnalysisResults_LoanApplicationId",
                table: "RiskAnalysisResults");

            migrationBuilder.CreateIndex(
                name: "IX_RiskAnalysisResults_LoanApplicationId",
                table: "RiskAnalysisResults",
                column: "LoanApplicationId",
                unique: true);
        }
    }
}

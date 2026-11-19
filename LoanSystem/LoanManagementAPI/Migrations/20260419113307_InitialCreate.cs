using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LoanManagementAPI.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "LoanApplications",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Age = table.Column<int>(type: "int", nullable: false),
                    OccupationStatus = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    YearsEmployed = table.Column<int>(type: "int", nullable: false),
                    AnnualIncome = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    CreditScore = table.Column<int>(type: "int", nullable: false),
                    CreditHistoryYears = table.Column<int>(type: "int", nullable: false),
                    SavingsAssets = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    CurrentDebt = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    DefaultsOnFile = table.Column<int>(type: "int", nullable: false),
                    DelinquenciesLast2Yrs = table.Column<int>(type: "int", nullable: false),
                    DerogatoryMarks = table.Column<int>(type: "int", nullable: false),
                    ProductType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    LoanIntent = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    LoanAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    InterestRate = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false),
                    DebtToIncomeRatio = table.Column<decimal>(type: "decimal(10,4)", precision: 10, scale: 4, nullable: false),
                    LoanToIncomeRatio = table.Column<decimal>(type: "decimal(10,4)", precision: 10, scale: 4, nullable: false),
                    PaymentToIncomeRatio = table.Column<decimal>(type: "decimal(10,4)", precision: 10, scale: 4, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LoanApplications", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "RiskAnalysisResults",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    LoanApplicationId = table.Column<int>(type: "int", nullable: false),
                    Prediction = table.Column<int>(type: "int", nullable: false),
                    Probability = table.Column<double>(type: "float", nullable: false),
                    RiskLevel = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    GeneratedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RiskAnalysisResults", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RiskAnalysisResults_LoanApplications_LoanApplicationId",
                        column: x => x.LoanApplicationId,
                        principalTable: "LoanApplications",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_RiskAnalysisResults_LoanApplicationId",
                table: "RiskAnalysisResults",
                column: "LoanApplicationId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "RiskAnalysisResults");

            migrationBuilder.DropTable(
                name: "LoanApplications");
        }
    }
}

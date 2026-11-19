using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LoanManagementAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddModelSelection : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AnalysisSessionId",
                table: "RiskAnalysisResults",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ModelUsed",
                table: "RiskAnalysisResults",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "AnalysisSessionId",
                table: "LoanApplications",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ModelType",
                table: "LoanApplications",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AnalysisSessionId",
                table: "RiskAnalysisResults");

            migrationBuilder.DropColumn(
                name: "ModelUsed",
                table: "RiskAnalysisResults");

            migrationBuilder.DropColumn(
                name: "AnalysisSessionId",
                table: "LoanApplications");

            migrationBuilder.DropColumn(
                name: "ModelType",
                table: "LoanApplications");
        }
    }
}

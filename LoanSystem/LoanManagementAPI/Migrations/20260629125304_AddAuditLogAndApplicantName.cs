using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LoanManagementAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddAuditLogAndApplicantName : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Name",
                table: "LoanApplications",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Name",
                table: "LoanApplications");
        }
    }
}

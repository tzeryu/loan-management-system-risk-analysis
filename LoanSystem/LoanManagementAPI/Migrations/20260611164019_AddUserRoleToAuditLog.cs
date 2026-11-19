using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LoanManagementAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddUserRoleToAuditLog : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "UserRole",
                table: "AuditLogs",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "UserRole",
                table: "AuditLogs");
        }
    }
}

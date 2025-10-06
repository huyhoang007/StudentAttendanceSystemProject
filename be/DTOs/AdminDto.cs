using System.ComponentModel.DataAnnotations;

namespace Student_Attendance_System.DTOs
{
    public class AdminDto
    {
        public Guid AdminId { get; set; }
        public Guid UserId { get; set; }
        public string AdminName { get; set; } = string.Empty;
        public string? Department { get; set; }
        public string? Phone { get; set; }
        public string Role { get; set; } = "admin";
        public string? Username { get; set; }
        public string? Email { get; set; }
    }

    public class CreateAdminDto
    {
        [Required]
        public Guid UserId { get; set; }

        [Required]
        public string AdminName { get; set; } = string.Empty;

        public string? Department { get; set; }

        [MaxLength(20)]
        public string? Phone { get; set; }
    }

    public class UpdateAdminDto
    {
        [Required]
        public string AdminName { get; set; } = string.Empty;

        public string? Department { get; set; }

        [MaxLength(20)]
        public string? Phone { get; set; }
    }
}
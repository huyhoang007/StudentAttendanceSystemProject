using System.ComponentModel.DataAnnotations;

namespace Student_Attendance_System.DTOs
{
    public class UserDto
    {
        public Guid UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public Guid? OrganizerId { get; set; } // Trả về OrganizerId nếu là organizer
        public Guid? StudentId { get; set; } // Trả về StudentId nếu là student
        public Guid? UniversityId { get; set; } // Trả về UniversityId
        public string? UniversityName { get; set; } // Trả về tên trường
    }

    public class LoginDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;
    }

    public class RegisterDto
    {
    [Required]
    [MaxLength(50)]
    public string Username { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [MaxLength(100)]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MinLength(6)]
    public string Password { get; set; } = string.Empty;

    [Required]
    public string Role { get; set; } = "student"; // student, organizer, admin

    // Thông tin bổ sung cho Student
    [MaxLength(100)]
    public string? Name { get; set; }

    [MaxLength(50)]
    public string? StudentCode { get; set; }

    [MaxLength(20)]
    public string? Phone { get; set; }

    public Guid? UniversityId { get; set; }
    }

    public class AuthResponseDto
    {
        public string Token { get; set; } = string.Empty;
        public UserDto User { get; set; } = null!;
        public DateTime ExpiresAt { get; set; }
    }

    public class ChangePasswordDto
    {
        [Required]
        public string CurrentPassword { get; set; } = string.Empty;

        [Required]
        [MinLength(6)]
        public string NewPassword { get; set; } = string.Empty;
    }

    public class UpdateProfileDto
    {
        [Required]
        [MaxLength(50)]
        public string Username { get; set; } = string.Empty;
    }
}
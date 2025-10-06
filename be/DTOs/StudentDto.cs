using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Student_Attendance_System.DTOs
{
    public class StudentDto
    {
        [JsonPropertyName("student_id")]
        public Guid StudentId { get; set; }
        
        [JsonPropertyName("name")]
        public string Name { get; set; } = string.Empty;
        
        [JsonPropertyName("student_code")]
        public string StudentCode { get; set; } = string.Empty;
        
        [JsonPropertyName("email")]
        public string Email { get; set; } = string.Empty;
        
        [JsonPropertyName("phone")]
        public string? Phone { get; set; }
        
        [JsonPropertyName("university_id")]
        public Guid? UniversityId { get; set; }
        
        [JsonPropertyName("university_name")]
        public string? UniversityName { get; set; }
        
        [JsonPropertyName("user_id")]
        public Guid? UserId { get; set; }
    }

    public class CreateStudentDto
    {
        [Required]
        [JsonPropertyName("name")]
        public string Name { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        [JsonPropertyName("student_code")]
        public string StudentCode { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [MaxLength(100)]
        [JsonPropertyName("email")]
        public string Email { get; set; } = string.Empty;

        [MaxLength(20)]
        [JsonPropertyName("phone")]
        public string? Phone { get; set; }

        [JsonPropertyName("university_id")]
        public Guid? UniversityId { get; set; }

        [JsonPropertyName("user_id")]
        public Guid? UserId { get; set; }
    }

    public class UpdateStudentDto
    {
        [Required]
        [JsonPropertyName("name")]
        public string Name { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        [JsonPropertyName("student_code")]
        public string StudentCode { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [MaxLength(100)]
        [JsonPropertyName("email")]
        public string Email { get; set; } = string.Empty;

        [MaxLength(20)]
        [JsonPropertyName("phone")]
        public string? Phone { get; set; }

        [JsonPropertyName("university_id")]
        public Guid? UniversityId { get; set; }
    }

    public class ImportStudentDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string StudentCode { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [MaxLength(100)]
        public string Email { get; set; } = string.Empty;

        [MaxLength(20)]
        public string? Phone { get; set; }

        [Required]
        public string UniversityName { get; set; } = string.Empty;
    }

    public class StudentImportResultDto
    {
        public int TotalRecords { get; set; }
        public int SuccessfulImports { get; set; }
        public int FailedImports { get; set; }
        public List<string> Errors { get; set; } = new List<string>();
        public List<StudentDto> ImportedStudents { get; set; } = new List<StudentDto>();
    }
}
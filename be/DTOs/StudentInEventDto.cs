using System.ComponentModel.DataAnnotations;

namespace Student_Attendance_System.DTOs
{
    public class StudentInEventDto
    {
        public Guid StudentInEventId { get; set; }
        public Guid EventId { get; set; }
        public Guid StudentId { get; set; }
        public string StudentCode { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string EventTitle { get; set; } = string.Empty;
        public string StudentName { get; set; } = string.Empty;
        public string StudentEmail { get; set; } = string.Empty;
        
        // Additional Event Details
        public string? EventDescription { get; set; }
        public string? EventOrganizer { get; set; }
        public DateOnly EventStartDate { get; set; }
        public DateOnly EventEndDate { get; set; }
        public Guid EventOrganizerId { get; set; }
    }

    public class CreateStudentInEventDto
    {
        [Required]
        public Guid EventId { get; set; }
        [Required]
        public Guid StudentId { get; set; }
        public string Status { get; set; } = "registered";
    }

    public class BatchAddStudentsDto
    {
        [Required]
        public Guid EventId { get; set; }
        [Required]
        public List<Guid> StudentIds { get; set; } = new List<Guid>();
        public string Status { get; set; } = "registered";
    }

    public class UpdateStudentStatusDto
    {
        [Required]
        public string Status { get; set; } = "registered"; // registered, cancelled, attended
    }

    public class ImportResultDto
    {
        public int TotalProcessed { get; set; }
        public int SuccessCount { get; set; }
        public int FailureCount { get; set; }
        public List<string> Errors { get; set; } = new List<string>();
        public List<StudentInEventDto> AddedStudents { get; set; } = new List<StudentInEventDto>();
    }

    public class RegisterStudentInEventDto
    {
        [Required]
        public Guid EventId { get; set; }

        [Required]
        [MaxLength(50)]
        public string StudentCode { get; set; } = string.Empty;
    }

    public class BulkRegisterStudentsDto
    {
        [Required]
        public Guid EventId { get; set; }

        [Required]
        public List<string> StudentCodes { get; set; } = new List<string>();
    }

    public class UpdateStudentEventStatusDto
    {
        [Required]
        public string Status { get; set; } = string.Empty; // registered, cancelled, attended
    }
}
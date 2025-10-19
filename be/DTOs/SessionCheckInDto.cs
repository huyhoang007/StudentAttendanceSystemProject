using System.ComponentModel.DataAnnotations;

namespace Student_Attendance_System.DTOs
{
    public class SessionCheckInDto
    {
        public Guid CheckinId { get; set; }
        public Guid SessionId { get; set; }
        public Guid StudentInEventId { get; set; }
        public DateTime CheckinTime { get; set; }
        public string Method { get; set; } = string.Empty;
        public string? Location { get; set; }
        public string SessionTitle { get; set; } = string.Empty;
        public string EventTitle { get; set; } = string.Empty;
        public string StudentName { get; set; } = string.Empty;
        public string StudentCode { get; set; } = string.Empty;
        // Added for reporting/filtering
        public Guid? UniversityId { get; set; }
        public Guid? OrganizerId { get; set; }
        public Guid? StudentId { get; set; }  // Thêm StudentId để frontend có thể so sánh
    }

    public class CreateCheckInDto
    {
        [Required]
        public Guid SessionId { get; set; }

        [Required]
        public Guid StudentInEventId { get; set; }

        public string Method { get; set; } = "QR";

        public string? Location { get; set; }
    }

    public class QRCheckInDto
    {
        [Required]
        public string QRCode { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string StudentCode { get; set; } = string.Empty;

        public string? Location { get; set; }
    }

    public class BulkCheckInDto
    {
        [Required]
        public Guid SessionId { get; set; }

        [Required]
        public List<string> StudentCodes { get; set; } = new List<string>();

        public string Method { get; set; } = "manual";
    }
}
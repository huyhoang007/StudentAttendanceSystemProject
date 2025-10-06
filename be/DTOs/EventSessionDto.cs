using System.ComponentModel.DataAnnotations;

namespace Student_Attendance_System.DTOs
{
    public class EventSessionDto
    {
        public Guid SessionId { get; set; }
        public Guid EventId { get; set; }
        public string Title { get; set; } = string.Empty;
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public string? Location { get; set; }
        public DateTime? CheckinStartTime { get; set; }
        public DateTime? CheckinEndTime { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public string EventTitle { get; set; } = string.Empty;
        public int TotalCheckIns { get; set; }
    }

    public class CreateEventSessionDto
    {
        [Required]
        public Guid EventId { get; set; }

        [Required]
        [MaxLength(255)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public DateTime StartTime { get; set; }

        [Required]
        public DateTime EndTime { get; set; }

        [MaxLength(255)]
        public string? Location { get; set; }

        public DateTime? CheckinStartTime { get; set; }

        public DateTime? CheckinEndTime { get; set; }
    }

    public class UpdateEventSessionDto
    {
        [Required]
        [MaxLength(255)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public DateTime StartTime { get; set; }

        [Required]
        public DateTime EndTime { get; set; }

        [MaxLength(255)]
        public string? Location { get; set; }

        public DateTime? CheckinStartTime { get; set; }

        public DateTime? CheckinEndTime { get; set; }
    }
}
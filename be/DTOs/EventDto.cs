using System.ComponentModel.DataAnnotations;

namespace Student_Attendance_System.DTOs
{
    public class EventDto
    {
        public Guid EventId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? Organizer { get; set; }
        public DateOnly StartDate { get; set; }
        public DateOnly EndDate { get; set; }
        public Guid OrganizerId { get; set; }
        public Guid? UniversityId { get; set; }
        public List<EventSessionDto> Sessions { get; set; } = new List<EventSessionDto>();
        public int TotalRegistrations { get; set; }
        public int TotalAttendees { get; set; }
    }

    public class CreateEventDto
    {
        [Required]
        public string Title { get; set; } = string.Empty;

        public string? Description { get; set; }

        public string? Organizer { get; set; }

        [Required]
        public DateOnly StartDate { get; set; }

        [Required]
        public DateOnly EndDate { get; set; }

        [Required]
        public Guid OrganizerId { get; set; }
    }

    public class UpdateEventDto
    {
        [Required]
        public string Title { get; set; } = string.Empty;

        public string? Description { get; set; }

        public string? Organizer { get; set; }

        [Required]
        public DateOnly StartDate { get; set; }

        [Required]
        public DateOnly EndDate { get; set; }

        [Required]
        public Guid OrganizerId { get; set; }
    }
}
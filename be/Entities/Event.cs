using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Student_Attendance_System.Entities
{
    [Table("Event")]
    public class Event
    {
        [Key]
        [Column("event_id")]
        public Guid EventId { get; set; } = Guid.NewGuid();

        [Required]
        [Column("title")]
        public string Title { get; set; } = string.Empty;

        [Column("description")]
        public string? Description { get; set; }

        [Column("organizer")]
        public string? Organizer { get; set; }

        [Required]
        [Column("start_date")]
        public DateOnly StartDate { get; set; }

        [Required]
        [Column("end_date")]
        public DateOnly EndDate { get; set; }

        [Required]
        [Column("organizer_id")]
        public Guid OrganizerId { get; set; }

        [Column("university_id")]
        public Guid? UniversityId { get; set; }

        // Navigation properties
        [ForeignKey("UniversityId")]
        public virtual University? University { get; set; }
        public virtual ICollection<EventSession> EventSessions { get; set; } = new List<EventSession>();
        public virtual ICollection<StudentInEvent> StudentInEvents { get; set; } = new List<StudentInEvent>();
    }
}
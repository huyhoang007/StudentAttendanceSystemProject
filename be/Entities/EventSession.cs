using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Student_Attendance_System.Entities
{
    [Table("EventSession")]
    public class EventSession
    {
        [Key]
        [Column("session_id")]
        public Guid SessionId { get; set; } = Guid.NewGuid();

        [Required]
        [Column("event_id")]
        public Guid EventId { get; set; }

        [Required]
        [Column("title")]
        public string Title { get; set; } = string.Empty;

        [Required]
        [Column("start_time")]
        public DateTime StartTime { get; set; }

        [Required]
        [Column("end_time")]
        public DateTime EndTime { get; set; }

        [Column("location")]
        public string? Location { get; set; }

        [Column("checkin_start_time")]
        public DateTime? CheckinStartTime { get; set; }

        [Column("checkin_end_time")]
        public DateTime? CheckinEndTime { get; set; }

        // Navigation properties
        [ForeignKey("EventId")]
        public virtual Event Event { get; set; } = null!;
        
        public virtual ICollection<SessionCheckIn> SessionCheckIns { get; set; } = new List<SessionCheckIn>();
    }
}
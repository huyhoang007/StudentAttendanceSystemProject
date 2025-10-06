using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Student_Attendance_System.Entities
{
    [Table("SessionCheckIn")]
    public class SessionCheckIn
    {
        [Key]
        [Column("checkin_id")]
        public Guid CheckinId { get; set; } = Guid.NewGuid();

        [Required]
        [Column("session_id")]
        public Guid SessionId { get; set; }

        [Required]
        [Column("student_in_event_id")]
        public Guid StudentInEventId { get; set; }

        [Column("checkin_time")]
        public DateTime CheckinTime { get; set; } = DateTime.UtcNow;

        [MaxLength(20)]
        [Column("method")]
        public string Method { get; set; } = "QR"; // QR, manual

        [Column("location")]
        public string? Location { get; set; }

        // Navigation properties
        [ForeignKey("SessionId")]
        public virtual EventSession EventSession { get; set; } = null!;

        [ForeignKey("StudentInEventId")]
        public virtual StudentInEvent StudentInEvent { get; set; } = null!;
    }
}
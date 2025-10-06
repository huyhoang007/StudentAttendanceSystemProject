using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Student_Attendance_System.Entities
{
    [Table("StudentInSession")]
    public class StudentInSession
    {
        [Key]
        [Column("student_in_session_id")]
        public Guid StudentInSessionId { get; set; } = Guid.NewGuid();

        [Required]
        [Column("session_id")]
        public Guid SessionId { get; set; }

        [Required]
        [Column("student_in_event_id")]
        public Guid StudentInEventId { get; set; }

        [MaxLength(20)]
        [Column("status")]
        public string Status { get; set; } = "registered"; // registered, cancelled, attended

        [Column("registered_at")]
        public DateTime RegisteredAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("SessionId")]
        public virtual EventSession EventSession { get; set; } = null!;

        [ForeignKey("StudentInEventId")]
        public virtual StudentInEvent StudentInEvent { get; set; } = null!;

        // Reverse navigation
        public virtual ICollection<SessionCheckIn> SessionCheckIns { get; set; } = new List<SessionCheckIn>();
    }
}
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Student_Attendance_System.Entities
{
    [Table("StudentInEvent")]
    public class StudentInEvent
    {
        [Key]
        [Column("student_in_event_id")]
        public Guid StudentInEventId { get; set; } = Guid.NewGuid();

        [Required]
        [Column("event_id")]
        public Guid EventId { get; set; }

        [Required]
        [Column("student_id")]
        public Guid StudentId { get; set; }

        [MaxLength(20)]
        [Column("status")]
        public string Status { get; set; } = "registered"; // registered, cancelled, attended

        // Navigation properties
        [ForeignKey("EventId")]
        public virtual Event Event { get; set; } = null!;

        [ForeignKey("StudentId")]
        public virtual Student Student { get; set; } = null!;

        public virtual ICollection<SessionCheckIn> SessionCheckIns { get; set; } = new List<SessionCheckIn>();
    }
}
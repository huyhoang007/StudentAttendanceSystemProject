using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Student_Attendance_System.Entities
{
    [Table("Organizer")]
    public class Organizer
    {
        [Key]
        [Column("organizer_id")]
        public Guid OrganizerId { get; set; } = Guid.NewGuid();

        [Required]
        [Column("user_id")]
        public Guid UserId { get; set; }

        [Required]
        [Column("organizer_name")]
        public string OrganizerName { get; set; } = string.Empty;

        [Column("organization")]
        public string? Organization { get; set; }

        [MaxLength(20)]
        [Column("phone")]
        public string? Phone { get; set; }

        [MaxLength(20)]
        [Column("role")]
        public string Role { get; set; } = "organizer";

        [Column("university_id")]
        public Guid? UniversityId { get; set; }

        // Navigation properties
        [ForeignKey("UserId")]
        public virtual User User { get; set; } = null!;
        
        [ForeignKey("UniversityId")]
        public virtual University? University { get; set; }
    }
}
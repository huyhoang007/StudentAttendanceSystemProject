using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Student_Attendance_System.Entities
{
    [Table("University")]
    public class University
    {
        [Key]
        [Column("university_id")]
        public Guid UniversityId { get; set; } = Guid.NewGuid();

        [Required]
        [Column("name")]
        public string Name { get; set; } = string.Empty;

        [Column("address")]
        public string? Address { get; set; }

        [Column("contact_info")]
        public string? ContactInfo { get; set; }

        // Navigation properties
        public virtual ICollection<Student> Students { get; set; } = new List<Student>();
    }
}
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Student_Attendance_System.Entities
{
    [Table("Student")]
    public class Student
    {
        [Key]
        [Column("student_id")]
        public Guid StudentId { get; set; } = Guid.NewGuid();

        [Required]
        [Column("name")]
        public string Name { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        [Column("student_code")]
        public string StudentCode { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        [Column("email")]
        public string Email { get; set; } = string.Empty;

        [MaxLength(20)]
        [Column("phone")]
        public string? Phone { get; set; }

        [Column("university_id")]
        public Guid? UniversityId { get; set; }

        [Column("user_id")]
        public Guid? UserId { get; set; }

        // Navigation properties
        [ForeignKey("UniversityId")]
        public virtual University? University { get; set; }
        
    [ForeignKey("UserId")]
    public virtual User? User { get; set; }


    public virtual ICollection<StudentInEvent> StudentInEvents { get; set; } = new List<StudentInEvent>();
    }
}
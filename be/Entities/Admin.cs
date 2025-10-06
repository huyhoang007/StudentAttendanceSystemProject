using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Student_Attendance_System.Entities
{
    [Table("Admin")]
    public class Admin
    {
        [Key]
        [Column("admin_id")]
        public Guid AdminId { get; set; } = Guid.NewGuid();

        [Required]
        [Column("user_id")]
        public Guid UserId { get; set; }

        [Required]
        [Column("admin_name")]
        public string AdminName { get; set; } = string.Empty;

        [Column("department")]
        public string? Department { get; set; }

        [MaxLength(20)]
        [Column("phone")]
        public string? Phone { get; set; }

        [MaxLength(20)]
        [Column("role")]
        public string Role { get; set; } = "admin";

        // Navigation properties
        [ForeignKey("UserId")]
        public virtual User User { get; set; } = null!;
    }
}
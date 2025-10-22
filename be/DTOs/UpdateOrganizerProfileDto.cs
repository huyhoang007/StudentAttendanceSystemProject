using System.ComponentModel.DataAnnotations;

namespace Student_Attendance_System.DTOs
{
    public class UpdateOrganizerProfileDto
    {
        [Required]
        public string OrganizerName { get; set; }

        public string? Organization { get; set; }

        [MaxLength(20)]
        public string? Phone { get; set; }
    }
}
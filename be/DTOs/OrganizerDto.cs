using System.ComponentModel.DataAnnotations;

namespace Student_Attendance_System.DTOs
{
    public class OrganizerDto
    {
        public Guid OrganizerId { get; set; }
        public Guid UserId { get; set; }
        public string OrganizerName { get; set; } = string.Empty;
        public string? Organization { get; set; }
        public string? Phone { get; set; }
        public string Role { get; set; } = "organizer";
        public string? Username { get; set; }
        public string? Email { get; set; }
        public Guid? UniversityId { get; set; }
        public UniversityDto? University { get; set; }
    }

    public class CreateOrganizerDto
    {
        [Required]
        public Guid UserId { get; set; }

        [Required]
        public string OrganizerName { get; set; } = string.Empty;

        public string? Organization { get; set; }

        [MaxLength(20)]
        public string? Phone { get; set; }
    }

    public class UpdateOrganizerDto
    {
        [Required]
        public string OrganizerName { get; set; } = string.Empty;

        public string? Organization { get; set; }

        [MaxLength(20)]
        public string? Phone { get; set; }
        
        public Guid? UniversityId { get; set; }
    }
}
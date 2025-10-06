using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Student_Attendance_System.DTOs
{
    public class UniversityDto
    {
        public Guid UniversityId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Address { get; set; }
        
        [JsonPropertyName("contact_info")]
        public string? ContactInfo { get; set; }
    }

    public class CreateUniversityDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;

        public string? Address { get; set; }

        [JsonPropertyName("contact_info")]
        public string? ContactInfo { get; set; }
    }

    public class UpdateUniversityDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;

        public string? Address { get; set; }

        [JsonPropertyName("contact_info")]
        public string? ContactInfo { get; set; }
    }
}
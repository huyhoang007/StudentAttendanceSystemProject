using Student_Attendance_System.DTOs;

namespace Student_Attendance_System.Services.Interfaces
{
    public interface IOrganizerService
    {
        Task<IEnumerable<OrganizerDto>> GetAllOrganizersAsync();
        Task<OrganizerDto?> GetOrganizerByIdAsync(Guid organizerId);
        Task<OrganizerDto?> GetOrganizerByUserIdAsync(Guid userId);
        Task<IEnumerable<OrganizerDto>> GetOrganizersByOrganizationAsync(string organization);
        Task<OrganizerDto> CreateOrganizerAsync(CreateOrganizerDto createDto);
        Task<OrganizerDto?> UpdateOrganizerAsync(Guid organizerId, UpdateOrganizerDto updateDto);
        Task<bool> DeleteOrganizerAsync(Guid organizerId);
        Task<OrganizerDto?> UpdateOrganizerProfileAsync(Guid organizerId, UpdateOrganizerProfileDto profileDto);
    }
}
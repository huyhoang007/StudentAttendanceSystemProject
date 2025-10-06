using Student_Attendance_System.DTOs;
using Student_Attendance_System.Entities;

namespace Student_Attendance_System.Services.Interfaces
{
    public interface IUniversityService
    {
        Task<IEnumerable<UniversityDto>> GetAllUniversitiesAsync();
        Task<UniversityDto?> GetUniversityByIdAsync(Guid id);
        Task<UniversityDto?> GetUniversityByNameAsync(string name);
        Task<IEnumerable<UniversityDto>> SearchUniversitiesAsync(string searchTerm);
        Task<UniversityDto> CreateUniversityAsync(CreateUniversityDto createDto);
        Task<UniversityDto> UpdateUniversityAsync(Guid id, UpdateUniversityDto updateDto);
        Task DeleteUniversityAsync(Guid id);
        Task<bool> UniversityExistsAsync(Guid id);
    }
}
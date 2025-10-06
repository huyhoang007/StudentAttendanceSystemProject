using Student_Attendance_System.DTOs;

namespace Student_Attendance_System.Services.Interfaces
{
    public interface IAdminService
    {
        Task<IEnumerable<AdminDto>> GetAllAdminsAsync();
        Task<AdminDto?> GetAdminByIdAsync(Guid adminId);
        Task<AdminDto?> GetAdminByUserIdAsync(Guid userId);
        Task<IEnumerable<AdminDto>> GetAdminsByDepartmentAsync(string department);
        Task<AdminDto> CreateAdminAsync(CreateAdminDto createDto);
        Task<AdminDto?> UpdateAdminAsync(Guid adminId, UpdateAdminDto updateDto);
        Task<bool> DeleteAdminAsync(Guid adminId);
    }
}
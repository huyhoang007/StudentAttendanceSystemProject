using Student_Attendance_System.DTOs;
using Student_Attendance_System.Entities;
using Student_Attendance_System.Repositories;
using Student_Attendance_System.Services.Interfaces;

namespace Student_Attendance_System.Services
{
    public class AdminService : IAdminService
    {
        private readonly IAdminRepository _adminRepository;
        private readonly IUserRepository _userRepository;

        public AdminService(IAdminRepository adminRepository, IUserRepository userRepository)
        {
            _adminRepository = adminRepository;
            _userRepository = userRepository;
        }

        public async Task<IEnumerable<AdminDto>> GetAllAdminsAsync()
        {
            var admins = await _adminRepository.GetAllAsync();
            return admins.Select(MapToDto);
        }

        public async Task<AdminDto?> GetAdminByIdAsync(Guid adminId)
        {
            var admin = await _adminRepository.GetByIdAsync(adminId);
            return admin != null ? MapToDto(admin) : null;
        }

        public async Task<AdminDto?> GetAdminByUserIdAsync(Guid userId)
        {
            var admin = await _adminRepository.GetByUserIdAsync(userId);
            return admin != null ? MapToDto(admin) : null;
        }

        public async Task<IEnumerable<AdminDto>> GetAdminsByDepartmentAsync(string department)
        {
            var admins = await _adminRepository.GetByDepartmentAsync(department);
            return admins.Select(MapToDto);
        }

        public async Task<AdminDto> CreateAdminAsync(CreateAdminDto createDto)
        {
            var admin = new Admin
            {
                UserId = createDto.UserId,
                AdminName = createDto.AdminName,
                Department = createDto.Department,
                Phone = createDto.Phone,
                Role = "admin"
            };

            await _adminRepository.AddAsync(admin);

            var createdAdmin = await _adminRepository.GetByIdAsync(admin.AdminId);
            return MapToDto(createdAdmin!);
        }

        public async Task<AdminDto?> UpdateAdminAsync(Guid adminId, UpdateAdminDto updateDto)
        {
            var admin = await _adminRepository.GetByIdAsync(adminId);
            if (admin == null) return null;

            admin.AdminName = updateDto.AdminName;
            admin.Department = updateDto.Department;
            admin.Phone = updateDto.Phone;

            await _adminRepository.UpdateAsync(admin);

            return MapToDto(admin);
        }

        public async Task<bool> DeleteAdminAsync(Guid adminId)
        {
            var admin = await _adminRepository.GetByIdAsync(adminId);
            if (admin == null) return false;

            await _adminRepository.DeleteAsync(admin);
            return true;
        }

        private static AdminDto MapToDto(Admin admin)
        {
            return new AdminDto
            {
                AdminId = admin.AdminId,
                UserId = admin.UserId,
                AdminName = admin.AdminName,
                Department = admin.Department,
                Phone = admin.Phone,
                Role = admin.Role,
                Username = admin.User?.Username,
                Email = admin.User?.Email
            };
        }
    }
}
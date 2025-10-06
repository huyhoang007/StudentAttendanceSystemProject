using Student_Attendance_System.DTOs;

namespace Student_Attendance_System.Services.Interfaces
{
    public interface IAuthService
    {
        Task<AuthResponseDto> LoginAsync(LoginDto loginDto);
        Task<AuthResponseDto> RegisterAsync(RegisterDto registerDto);
        Task<UserDto> GetUserProfileAsync(Guid userId);
        Task<UserDto> UpdateProfileAsync(Guid userId, UpdateProfileDto updateProfileDto);
        Task ChangePasswordAsync(Guid userId, ChangePasswordDto changePasswordDto);
    }
}
using Student_Attendance_System.DTOs;
using Student_Attendance_System.Entities;
using Student_Attendance_System.Repositories;
using Student_Attendance_System.Services.Interfaces;
using System.Linq;

namespace Student_Attendance_System.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;

        public UserService(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        public async Task<UserDto?> GetUserByIdAsync(Guid userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            return user != null ? MapToDto(user) : null;
        }

        public async Task<UserDto?> GetUserByEmailAsync(string email)
        {
            var user = await _userRepository.GetByEmailAsync(email);
            return user != null ? MapToDto(user) : null;
        }

        public async Task<UserDto?> GetUserByUsernameAsync(string username)
        {
            var user = await _userRepository.GetByUsernameAsync(username);
            return user != null ? MapToDto(user) : null;
        }

        public async Task<UserDto> CreateUserAsync(RegisterDto registerDto)
        {
            var user = new User
            {
                Username = registerDto.Username,
                Email = registerDto.Email,
                Password = BCrypt.Net.BCrypt.HashPassword(registerDto.Password),
                Role = registerDto.Role,
                CreatedAt = DateTime.UtcNow
            };

            await _userRepository.AddAsync(user);

            return MapToDto(user);
        }

        public async Task<UserDto?> UpdateUserAsync(Guid userId, UpdateProfileDto updateDto)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null) return null;

            user.Username = updateDto.Username;

            await _userRepository.UpdateAsync(user);

            return MapToDto(user);
        }

        public async Task<bool> DeleteUserAsync(Guid userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null) return false;

            await _userRepository.DeleteAsync(user);
            return true;
        }

        public async Task<bool> ChangePasswordAsync(Guid userId, ChangePasswordDto changePasswordDto)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null) return false;

            if (!BCrypt.Net.BCrypt.Verify(changePasswordDto.CurrentPassword, user.Password))
                return false;

            user.Password = BCrypt.Net.BCrypt.HashPassword(changePasswordDto.NewPassword);
            await _userRepository.UpdateAsync(user);

            return true;
        }

        public async Task<bool> EmailExistsAsync(string email)
        {
            return await _userRepository.EmailExistsAsync(email);
        }

        public async Task<bool> UsernameExistsAsync(string username)
        {
            return await _userRepository.UsernameExistsAsync(username);
        }

        public async Task<IEnumerable<UserDto>> GetAllUsersAsync()
        {
            var users = await _userRepository.GetAllWithRelatedAsync();
            return users.Select(MapToDto);
        }

        public async Task<string> ResetPasswordAsync(Guid userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                throw new KeyNotFoundException("User not found");
            }

            var newPassword = GenerateRandomPassword();
            user.Password = BCrypt.Net.BCrypt.HashPassword(newPassword);
            await _userRepository.UpdateAsync(user);

            return newPassword;
        }

        public async Task<bool> ToggleUserStatusAsync(Guid userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                throw new KeyNotFoundException("User not found");
            }

            // Since database doesn't have IsActive field, we'll simulate it by changing role
            // You could add logic here or just return current status
            // For now, we'll just return true as active status
            return true;
        }

        private static string GenerateRandomPassword(int length = 8)
        {
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            var random = new Random();
            return new string(Enumerable.Repeat(chars, length)
                .Select(s => s[random.Next(s.Length)]).ToArray());
        }

        private static UserDto MapToDto(User user)
        {
            Guid? universityId = null;
            string? universityName = null;

            // Get university info based on role
            if (user.Student != null)
            {
                universityId = user.Student.UniversityId;
                universityName = user.Student.University?.Name;
            }
            else if (user.Organizer != null)
            {
                universityId = user.Organizer.UniversityId;
                universityName = user.Organizer.University?.Name;
            }

            return new UserDto
            {
                UserId = user.UserId,
                Username = user.Username,
                Email = user.Email,
                Role = user.Role,
                CreatedAt = user.CreatedAt,
                OrganizerId = user.Organizer?.OrganizerId,
                StudentId = user.Student?.StudentId,
                UniversityId = universityId,
                UniversityName = universityName
            };
        }
    }
}
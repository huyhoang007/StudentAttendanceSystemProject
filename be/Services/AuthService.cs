using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Student_Attendance_System.DTOs;
using Student_Attendance_System.Entities;
using Student_Attendance_System.Repositories;
using Student_Attendance_System.Services.Interfaces;

namespace Student_Attendance_System.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly IStudentRepository _studentRepository;
        private readonly IOrganizerRepository _organizerRepository;
        private readonly IConfiguration _configuration;

        public AuthService(
            IUserRepository userRepository,
            IStudentRepository studentRepository,
            IOrganizerRepository organizerRepository,
            IConfiguration configuration)
        {
            _userRepository = userRepository;
            _studentRepository = studentRepository;
            _organizerRepository = organizerRepository;
            _configuration = configuration;
        }

        public async Task<AuthResponseDto> LoginAsync(LoginDto loginDto)
        {
            try
            {
                Console.WriteLine($"[LoginAsync] Bắt đầu đăng nhập với email: {loginDto.Email}");
                var user = await _userRepository.GetByEmailAsync(loginDto.Email);
                if (user == null)
                {
                    Console.WriteLine("[LoginAsync] Không tìm thấy user với email này");
                    throw new UnauthorizedAccessException("Email hoặc mật khẩu không đúng");
                }
                
                Console.WriteLine($"[LoginAsync] Đã tìm thấy user: {user.UserId}, username: {user.Username}, role: {user.Role}");
                
                Guid? organizerId = null;
                Guid? studentId = null;
                
                if (user.Role == "organizer")
                {
                    var organizer = await _organizerRepository.GetByUserIdAsync(user.UserId);
                    organizerId = organizer?.OrganizerId;
                    Console.WriteLine($"[LoginAsync] User is organizer, organizerId: {organizerId}");
                }
                else if (user.Role == "student")
                {
                    var student = await _studentRepository.GetByUserIdAsync(user.UserId);
                    studentId = student?.StudentId;
                    Console.WriteLine($"[LoginAsync] User is student, studentId: {studentId}");
                }
                else
                {
                    Console.WriteLine($"[LoginAsync] User role: {user.Role}");
                }

                if (!BCrypt.Net.BCrypt.Verify(loginDto.Password, user.Password))
                {
                    Console.WriteLine("[LoginAsync] Mật khẩu không đúng");
                    throw new UnauthorizedAccessException("Email hoặc mật khẩu không đúng");
                }

                Console.WriteLine("[LoginAsync] Mật khẩu đúng, tạo JWT token...");
                var token = GenerateJwtToken(user);
                var expiryMinutes = int.Parse(_configuration["JwtSettings:ExpiryMinutes"] ?? "1440");
                var expiresAt = DateTime.UtcNow.AddMinutes(expiryMinutes);

                Console.WriteLine("[LoginAsync] Đăng nhập thành công!");
                return new AuthResponseDto
                {
                    Token = token,
                    ExpiresAt = expiresAt,
                    User = MapToUserDto(user, organizerId, studentId)
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[LoginAsync][ERROR] {ex.Message}\n{ex.StackTrace}");
                throw;
            }
        }

        public async Task<AuthResponseDto> RegisterAsync(RegisterDto registerDto)
        {
            // Check if email already exists
            if (await _userRepository.EmailExistsAsync(registerDto.Email))
            {
                throw new InvalidOperationException("Email đã được sử dụng");
            }

            // Check if username already exists
            if (await _userRepository.UsernameExistsAsync(registerDto.Username))
            {
                throw new InvalidOperationException("Username đã được sử dụng");
            }

            var user = new User
            {
                Username = registerDto.Username,
                Email = registerDto.Email,
                Password = BCrypt.Net.BCrypt.HashPassword(registerDto.Password),
                Role = registerDto.Role,
                CreatedAt = DateTime.UtcNow
            };

            await _userRepository.AddAsync(user);

            // Nếu là student thì tạo thêm bản ghi Student
            if (registerDto.Role == "student")
            {
                var student = new Entities.Student
                {
                    Name = string.IsNullOrWhiteSpace(registerDto.Name) ? registerDto.Username : registerDto.Name!,
                    StudentCode = string.IsNullOrWhiteSpace(registerDto.StudentCode) ? registerDto.Username : registerDto.StudentCode!,
                    Email = registerDto.Email,
                    Phone = registerDto.Phone,
                    UniversityId = registerDto.UniversityId,
                    UserId = user.UserId
                };
                await _studentRepository.AddAsync(student);
            }

            // Nếu là organizer thì tạo bản ghi Organizer
            if (registerDto.Role == "organizer")
            {
                var organizer = new Organizer
                {
                    UserId = user.UserId,
                    OrganizerName = user.Username,
                    Organization = null,
                    Phone = null
                };
                // Nếu có các trường khác trong DTO thì bổ sung ở đây
                await _organizerRepository.AddAsync(organizer);
            }

            var token = GenerateJwtToken(user);
            var expiryMinutes = int.Parse(_configuration["JwtSettings:ExpiryMinutes"] ?? "1440");
            var expiresAt = DateTime.UtcNow.AddMinutes(expiryMinutes);

            Guid? organizerId = null;
            if (registerDto.Role == "organizer")
            {
                var organizer = await _organizerRepository.GetByUserIdAsync(user.UserId);
                organizerId = organizer?.OrganizerId;
            }
            return new AuthResponseDto
            {
                Token = token,
                ExpiresAt = expiresAt,
                User = MapToUserDto(user, organizerId)
            };
        }

        public async Task<UserDto> GetUserProfileAsync(Guid userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                throw new InvalidOperationException("Không tìm thấy người dùng");
            }

            return MapToUserDto(user);
        }

        public async Task<UserDto> UpdateProfileAsync(Guid userId, UpdateProfileDto updateProfileDto)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                throw new InvalidOperationException("Không tìm thấy người dùng");
            }

            // Check if new username already exists (if changed)
            if (user.Username != updateProfileDto.Username && 
                await _userRepository.UsernameExistsAsync(updateProfileDto.Username))
            {
                throw new InvalidOperationException("Username đã được sử dụng");
            }

            user.Username = updateProfileDto.Username;
            await _userRepository.UpdateAsync(user);

            return MapToUserDto(user);
        }

        public async Task ChangePasswordAsync(Guid userId, ChangePasswordDto changePasswordDto)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                throw new InvalidOperationException("Không tìm thấy người dùng");
            }

            if (!BCrypt.Net.BCrypt.Verify(changePasswordDto.CurrentPassword, user.Password))
            {
                throw new UnauthorizedAccessException("Mật khẩu hiện tại không đúng");
            }

            user.Password = BCrypt.Net.BCrypt.HashPassword(changePasswordDto.NewPassword);
            await _userRepository.UpdateAsync(user);
        }

        private string GenerateJwtToken(User user)
        {
            var jwtKey = _configuration["JwtSettings:Secret"] ?? throw new InvalidOperationException("JWT key not configured");
            var key = Encoding.ASCII.GetBytes(jwtKey);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role)
            };

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddMinutes(int.Parse(_configuration["JwtSettings:ExpiryMinutes"] ?? "1440")),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        private static UserDto MapToUserDto(User user, Guid? organizerId = null, Guid? studentId = null)
        {
            return new UserDto
            {
                UserId = user.UserId,
                Username = user.Username,
                Email = user.Email,
                Role = user.Role,
                CreatedAt = user.CreatedAt,
                OrganizerId = organizerId,
                StudentId = studentId
            };
        }
    }
}
using Microsoft.EntityFrameworkCore;
using Student_Attendance_System.Data;
using Student_Attendance_System.Entities;
using System.Security.Cryptography;
using System.Text;

namespace Student_Attendance_System.Scripts
{
    public class CreateAdminScript
    {
        public static async Task CreateDefaultAdmin(StudentAttendanceDbContext context)
        {
            // Kiểm tra xem đã có admin chưa
            var existingAdmin = await context.Users.FirstOrDefaultAsync(u => u.Role == "admin");
            if (existingAdmin != null)
            {
                Console.WriteLine("Admin account already exists.");
                return;
            }

            // Tạo User
            var adminUser = new User
            {
                UserId = Guid.NewGuid(),
                Username = "admin",
                Email = "admin@nvhsv.edu.vn",
                Password = HashPassword("Admin@123456"), // Sử dụng Password thay vì PasswordHash
                Role = "admin",
                CreatedAt = DateTime.UtcNow
            };

            context.Users.Add(adminUser);
            await context.SaveChangesAsync();

            // Tạo Admin profile
            var admin = new Admin
            {
                AdminId = Guid.NewGuid(),
                UserId = adminUser.UserId,
                AdminName = "Admin Trung tâm NVH SV",
                Department = "Trung tâm Nuôi dưỡng Học sinh - Sinh viên ĐHQG",
                Phone = "0123456789"
            };

            context.Admins.Add(admin);
            await context.SaveChangesAsync();

            Console.WriteLine("Default admin account created successfully!");
            Console.WriteLine($"Username: {adminUser.Username}");
            Console.WriteLine($"Email: {adminUser.Email}");
            Console.WriteLine("Password: Admin@123456");
        }

        private static string HashPassword(string password)
        {
            using (var sha256 = SHA256.Create())
            {
                var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
                return Convert.ToBase64String(hashedBytes);
            }
        }
    }
}
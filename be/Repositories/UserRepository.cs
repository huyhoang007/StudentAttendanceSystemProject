using Microsoft.EntityFrameworkCore;
using Student_Attendance_System.Data;
using Student_Attendance_System.Entities;

namespace Student_Attendance_System.Repositories
{
    public class UserRepository : GenericRepository<User>, IUserRepository
    {
        public UserRepository(StudentAttendanceDbContext context) : base(context)
        {
        }

        public async Task<User?> GetByEmailAsync(string email)
        {
            return await _context.Users
                .Include(u => u.Student)
                .Include(u => u.Organizer)
                .Include(u => u.Admin)
                .FirstOrDefaultAsync(u => u.Email == email);
        }

        public async Task<User?> GetByUsernameAsync(string username)
        {
            return await _context.Users
                .Include(u => u.Student)
                .Include(u => u.Organizer)
                .Include(u => u.Admin)
                .FirstOrDefaultAsync(u => u.Username == username);
        }

        public async Task<bool> EmailExistsAsync(string email)
        {
            return await _context.Users.AnyAsync(u => u.Email == email);
        }

        public async Task<bool> UsernameExistsAsync(string username)
        {
            return await _context.Users.AnyAsync(u => u.Username == username);
        }

        public async Task<IEnumerable<User>> GetAllWithRelatedAsync()
        {
            return await _context.Users
                .Include(u => u.Student)
                    .ThenInclude(s => s!.University)
                .Include(u => u.Organizer)
                    .ThenInclude(o => o!.University)
                .Include(u => u.Admin)
                .ToListAsync();
        }
    }
}
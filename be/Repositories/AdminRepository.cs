using Microsoft.EntityFrameworkCore;
using Student_Attendance_System.Data;
using Student_Attendance_System.Entities;

namespace Student_Attendance_System.Repositories
{
    public class AdminRepository : GenericRepository<Admin>, IAdminRepository
    {
        public AdminRepository(StudentAttendanceDbContext context) : base(context)
        {
        }

        public async Task<Admin?> GetByUserIdAsync(Guid userId)
        {
            return await _context.Admins
                .Include(a => a.User)
                .FirstOrDefaultAsync(a => a.UserId == userId);
        }

        public async Task<IEnumerable<Admin>> GetByDepartmentAsync(string department)
        {
            return await _context.Admins
                .Include(a => a.User)
                .Where(a => a.Department == department)
                .ToListAsync();
        }
    }
}
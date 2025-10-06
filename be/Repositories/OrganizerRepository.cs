using Microsoft.EntityFrameworkCore;
using Student_Attendance_System.Data;
using Student_Attendance_System.Entities;

namespace Student_Attendance_System.Repositories
{
    public class OrganizerRepository : GenericRepository<Organizer>, IOrganizerRepository
    {
        public OrganizerRepository(StudentAttendanceDbContext context) : base(context)
        {
        }

        public override async Task<IEnumerable<Organizer>> GetAllAsync()
        {
            return await _context.Organizers
                .Include(o => o.User)
                .Include(o => o.University)
                .ToListAsync();
        }

        public override async Task<Organizer?> GetByIdAsync(Guid id)
        {
            return await _context.Organizers
                .Include(o => o.User)
                .Include(o => o.University)
                .FirstOrDefaultAsync(o => o.OrganizerId == id);
        }

        public async Task<Organizer?> GetByUserIdAsync(Guid userId)
        {
            return await _context.Organizers
                .Include(o => o.User)
                .Include(o => o.University)
                .FirstOrDefaultAsync(o => o.UserId == userId);
        }

        public async Task<IEnumerable<Organizer>> GetByOrganizationAsync(string organization)
        {
            return await _context.Organizers
                .Include(o => o.User)
                .Include(o => o.University)
                .Where(o => o.Organization == organization)
                .ToListAsync();
        }
    }
}
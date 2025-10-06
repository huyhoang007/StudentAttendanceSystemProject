using Microsoft.EntityFrameworkCore;
using Student_Attendance_System.Data;
using Student_Attendance_System.Entities;

namespace Student_Attendance_System.Repositories
{
    public class StudentInEventRepository : GenericRepository<StudentInEvent>, IStudentInEventRepository
    {
        public StudentInEventRepository(StudentAttendanceDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<StudentInEvent>> GetByEventIdAsync(Guid eventId)
        {
            return await _dbSet
                .Include(sie => sie.Event)
                .Include(sie => sie.Student)
                    .ThenInclude(s => s.University)
                .Where(sie => sie.EventId == eventId)
                .ToListAsync();
        }

        public async Task<IEnumerable<StudentInEvent>> GetByStudentIdAsync(Guid studentId)
        {
            return await _dbSet
                .Include(sie => sie.Event)
                .Include(sie => sie.Student)
                    .ThenInclude(s => s.University)
                .Where(sie => sie.StudentId == studentId)
                .ToListAsync();
        }

        public async Task<IEnumerable<StudentInEvent>> GetByUserIdAsync(Guid userId)
        {
            return await _dbSet
                .Include(sie => sie.Event)
                .Include(sie => sie.Student)
                    .ThenInclude(s => s.University)
                .Where(sie => sie.Student.UserId == userId)
                .ToListAsync();
        }

        public async Task<IEnumerable<StudentInEvent>> GetByStudentCodeAsync(string studentCode)
        {
            return await _dbSet
                .Include(sie => sie.Event)
                .Include(sie => sie.Student)
                    .ThenInclude(s => s.University)
                .Where(sie => sie.Student.StudentCode == studentCode)
                .ToListAsync();
        }

        public async Task<StudentInEvent?> GetByEventAndStudentCodeAsync(Guid eventId, string studentCode)
        {
            return await _dbSet
                .Include(sie => sie.Event)
                .Include(sie => sie.Student)
                    .ThenInclude(s => s.University)
                .FirstOrDefaultAsync(sie => sie.EventId == eventId && sie.Student.StudentCode == studentCode);
        }

        public async Task<StudentInEvent?> GetByStudentAndEventAsync(Guid studentId, Guid eventId)
        {
            return await _dbSet
                .Include(sie => sie.Event)
                .Include(sie => sie.Student)
                    .ThenInclude(s => s.University)
                .FirstOrDefaultAsync(sie => sie.StudentId == studentId && sie.EventId == eventId);
        }

        public async Task<IEnumerable<StudentInEvent>> GetByStatusAsync(string status)
        {
            return await _dbSet
                .Include(sie => sie.Event)
                .Include(sie => sie.Student)
                    .ThenInclude(s => s.University)
                .Where(sie => sie.Status == status)
                .ToListAsync();
        }

        public async Task<bool> IsStudentRegisteredAsync(Guid eventId, string studentCode)
        {
            return await _dbSet
                .AnyAsync(sie => sie.EventId == eventId && 
                               sie.Student.StudentCode == studentCode && 
                               sie.Status != "cancelled");
        }

        public async Task<int> GetRegistrationCountAsync(Guid eventId)
        {
            return await _dbSet
                .CountAsync(sie => sie.EventId == eventId && 
                                  sie.Status != "cancelled");
        }

        public async Task<int> GetAttendeeCountAsync(Guid eventId)
        {
            return await _dbSet
                .CountAsync(sie => sie.EventId == eventId && 
                                  sie.Status == "attended");
        }

        public override async Task<IEnumerable<StudentInEvent>> GetAllAsync()
        {
            return await _dbSet
                .Include(sie => sie.Event)
                .Include(sie => sie.Student)
                    .ThenInclude(s => s.University)
                .ToListAsync();
        }

        public override async Task<StudentInEvent?> GetByIdAsync(Guid id)
        {
            return await _dbSet
                .Include(sie => sie.Event)
                .Include(sie => sie.Student)
                    .ThenInclude(s => s.University)
                .FirstOrDefaultAsync(sie => sie.StudentInEventId == id);
        }
    }
}
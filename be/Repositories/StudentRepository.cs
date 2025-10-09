using Microsoft.EntityFrameworkCore;
using Student_Attendance_System.Data;
using Student_Attendance_System.Entities;

namespace Student_Attendance_System.Repositories
{
    public class StudentRepository : GenericRepository<Student>, IStudentRepository
    {
        public StudentRepository(StudentAttendanceDbContext context) : base(context)
        {
        }

        public async Task<Student?> GetByStudentCodeAsync(string studentCode)
        {
            return await _dbSet
                .Include(s => s.University)
                .Include(s => s.User)
                .FirstOrDefaultAsync(s => s.StudentCode == studentCode);
        }

        public async Task<Student?> GetByEmailAsync(string email)
        {
            return await _dbSet
                .Include(s => s.University)
                .Include(s => s.User)
                .FirstOrDefaultAsync(s => s.Email == email);
        }

        public async Task<Student?> GetByUserIdAsync(Guid userId)
        {
            return await _dbSet
                .Include(s => s.University)
                .Include(s => s.User)
                .FirstOrDefaultAsync(s => s.UserId == userId);
        }

        public async Task<IEnumerable<Student>> GetByUniversityIdAsync(Guid universityId)
        {
            return await _dbSet
                .Include(s => s.University)
                .Include(s => s.User)
                .Where(s => s.UniversityId == universityId)
                .ToListAsync();
        }

        public async Task<IEnumerable<Student>> SearchAsync(string searchTerm)
        {
            var lowerSearchTerm = searchTerm.ToLower();
            return await _dbSet
                .Include(s => s.University)
                .Include(s => s.User)
                .Where(s => s.Name.ToLower().Contains(lowerSearchTerm) ||
                           s.StudentCode.ToLower().Contains(lowerSearchTerm) ||
                           s.Email.ToLower().Contains(lowerSearchTerm))
                .ToListAsync();
        }

        public async Task<bool> IsStudentCodeUniqueAsync(string studentCode, Guid? excludeStudentId = null)
        {
            var query = _dbSet.Where(s => s.StudentCode == studentCode);
            if (excludeStudentId.HasValue)
            {
                query = query.Where(s => s.StudentId != excludeStudentId.Value);
            }
            return !await query.AnyAsync();
        }

        public async Task<bool> IsEmailUniqueAsync(string email, Guid? excludeStudentId = null)
        {
            var query = _dbSet.Where(s => s.Email == email);
            if (excludeStudentId.HasValue)
            {
                query = query.Where(s => s.StudentId != excludeStudentId.Value);
            }
            return !await query.AnyAsync();
        }

        public override async Task<IEnumerable<Student>> GetAllAsync()
        {
            return await _dbSet
                .Include(s => s.University)
                .ToListAsync();
        }

        public async Task<IEnumerable<Student>> GetStudentsNotInEventAsync(Guid eventId)
        {
            return await _context.Students
                .Include(s => s.University)
                .Include(s => s.User)
                .Where(s => !_context.StudentInEvents
                    .Any(sie => sie.StudentId == s.StudentId && sie.EventId == eventId))
                .ToListAsync();
        }

        public override async Task<Student?> GetByIdAsync(Guid id)
        {
            return await _dbSet
                .Include(s => s.University)
                .Include(s => s.StudentInEvents)
                .ThenInclude(sie => sie.Event)
                .FirstOrDefaultAsync(s => s.StudentId == id);
        }
    }
}
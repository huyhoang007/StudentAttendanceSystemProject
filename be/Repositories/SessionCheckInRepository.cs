using Microsoft.EntityFrameworkCore;
using Student_Attendance_System.Data;
using Student_Attendance_System.Entities;

namespace Student_Attendance_System.Repositories
{
    public class SessionCheckInRepository : GenericRepository<SessionCheckIn>, ISessionCheckInRepository
    {
        public SessionCheckInRepository(StudentAttendanceDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<SessionCheckIn>> GetBySessionIdAsync(Guid sessionId)
        {
            return await _dbSet
                .Include(sci => sci.EventSession)
                .ThenInclude(es => es.Event)
                .Include(sci => sci.StudentInEvent)
                .ThenInclude(sie => sie.Student)
                .ThenInclude(s => s.University)
                .Where(sci => sci.SessionId == sessionId)
                .OrderBy(sci => sci.CheckinTime)
                .ToListAsync();
        }

        public async Task<IEnumerable<SessionCheckIn>> GetByStudentInEventIdAsync(Guid studentInEventId)
        {
            return await _dbSet
                .Include(sci => sci.EventSession)
                .ThenInclude(es => es.Event)
                .Include(sci => sci.StudentInEvent)
                .ThenInclude(sie => sie.Student)
                .ThenInclude(s => s.University)
                .Where(sci => sci.StudentInEventId == studentInEventId)
                .OrderByDescending(sci => sci.CheckinTime)
                .ToListAsync();
        }

        public async Task<SessionCheckIn?> GetBySessionAndStudentInEventAsync(Guid sessionId, Guid studentInEventId)
        {
            return await _dbSet
                .Include(sci => sci.EventSession)
                .ThenInclude(es => es.Event)
                .Include(sci => sci.StudentInEvent)
                .ThenInclude(sie => sie.Student)
                .ThenInclude(s => s.University)
                .FirstOrDefaultAsync(sci => sci.SessionId == sessionId && sci.StudentInEventId == studentInEventId);
        }

        public async Task<IEnumerable<SessionCheckIn>> GetByEventIdAsync(Guid eventId)
        {
            return await _dbSet
                .Include(sci => sci.EventSession)
                .ThenInclude(es => es.Event)
                .Include(sci => sci.StudentInEvent)
                .ThenInclude(sie => sie.Student)
                .ThenInclude(s => s.University)
                .Where(sci => sci.EventSession.EventId == eventId)
                .OrderBy(sci => sci.CheckinTime)
                .ToListAsync();
        }

        public async Task<IEnumerable<SessionCheckIn>> GetByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            return await _dbSet
                .Include(sci => sci.EventSession)
                .ThenInclude(es => es.Event)
                .Include(sci => sci.StudentInEvent)
                .ThenInclude(sie => sie.Student)
                .ThenInclude(s => s.University)
                .Where(sci => sci.CheckinTime >= startDate && sci.CheckinTime <= endDate)
                .OrderBy(sci => sci.CheckinTime)
                .ToListAsync();
        }

        public async Task<bool> IsStudentCheckedInAsync(Guid sessionId, Guid studentInEventId)
        {
            return await _dbSet
                .AnyAsync(sci => sci.SessionId == sessionId && sci.StudentInEventId == studentInEventId);
        }

        public async Task<int> GetCheckInCountAsync(Guid sessionId)
        {
            return await _dbSet
                .CountAsync(sci => sci.SessionId == sessionId);
        }

        public async Task<IEnumerable<SessionCheckIn>> GetByMethodAsync(string method)
        {
            return await _dbSet
                .Include(sci => sci.EventSession)
                .ThenInclude(es => es.Event)
                .Include(sci => sci.StudentInEvent)
                .ThenInclude(sie => sie.Student)
                .ThenInclude(s => s.University)
                .Where(sci => sci.Method == method)
                .OrderByDescending(sci => sci.CheckinTime)
                .ToListAsync();
        }

        public override async Task<IEnumerable<SessionCheckIn>> GetAllAsync()
        {
            return await _dbSet
                .Include(sci => sci.EventSession)
                .ThenInclude(es => es.Event)
                .Include(sci => sci.StudentInEvent)
                .ThenInclude(sie => sie.Student)
                .ThenInclude(s => s.University)
                .OrderByDescending(sci => sci.CheckinTime)
                .ToListAsync();
        }

        public override async Task<SessionCheckIn?> GetByIdAsync(Guid id)
        {
            return await _dbSet
                .Include(sci => sci.EventSession)
                .ThenInclude(es => es.Event)
                .Include(sci => sci.StudentInEvent)
                .ThenInclude(sie => sie.Student)
                .ThenInclude(s => s.University)
                .FirstOrDefaultAsync(sci => sci.CheckinId == id);
        }
    }
}
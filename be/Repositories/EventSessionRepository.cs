using Microsoft.EntityFrameworkCore;
using Student_Attendance_System.Data;
using Student_Attendance_System.Entities;

namespace Student_Attendance_System.Repositories
{
    public class EventSessionRepository : GenericRepository<EventSession>, IEventSessionRepository
    {
        public EventSessionRepository(StudentAttendanceDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<EventSession>> GetByEventIdAsync(Guid eventId)
        {
            return await _dbSet
                .Include(es => es.Event)
                .Where(es => es.EventId == eventId)
                .OrderBy(es => es.StartTime)
                .ToListAsync();
        }

        public async Task<IEnumerable<EventSession>> GetByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            return await _dbSet
                .Include(es => es.Event)
                .Where(es => es.StartTime >= startDate && es.EndTime <= endDate)
                .OrderBy(es => es.StartTime)
                .ToListAsync();
        }

        public async Task<EventSession?> GetWithCheckInsAsync(Guid sessionId)
        {
            return await _dbSet
                .Include(es => es.Event)
                .FirstOrDefaultAsync(es => es.SessionId == sessionId);
        }

        public async Task<bool> HasOverlapAsync(Guid eventId, DateTime startTime, DateTime endTime, Guid? excludeSessionId = null)
        {
            var query = _dbSet.Where(es => es.EventId == eventId &&
                                          ((es.StartTime < endTime && es.EndTime > startTime)));

            if (excludeSessionId.HasValue)
            {
                query = query.Where(es => es.SessionId != excludeSessionId.Value);
            }

            return await query.AnyAsync();
        }

        public override async Task<IEnumerable<EventSession>> GetAllAsync()
        {
            return await _dbSet
                .Include(es => es.Event)
                .OrderBy(es => es.StartTime)
                .ToListAsync();
        }

        public override async Task<EventSession?> GetByIdAsync(Guid id)
        {
            return await _dbSet
                .Include(es => es.Event)
                .FirstOrDefaultAsync(es => es.SessionId == id);
        }
    }
}
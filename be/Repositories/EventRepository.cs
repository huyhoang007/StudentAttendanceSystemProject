using Microsoft.EntityFrameworkCore;
using Student_Attendance_System.Data;
using Student_Attendance_System.Entities;

namespace Student_Attendance_System.Repositories
{
    public class EventRepository : GenericRepository<Event>, IEventRepository
    {
        public EventRepository(StudentAttendanceDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<Event>> GetByOrganizerIdAsync(Guid organizerId)
        {
            return await _dbSet
                .Include(e => e.EventSessions)
                .Where(e => e.OrganizerId == organizerId)
                .ToListAsync();
        }

        public async Task<IEnumerable<Event>> GetByOrganizerAsync(string organizer)
        {
            return await _dbSet
                .Include(e => e.EventSessions)
                .Where(e => e.Organizer != null && e.Organizer.ToLower().Contains(organizer.ToLower()))
                .ToListAsync();
        }

        public async Task<IEnumerable<Event>> GetByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            var startDateOnly = DateOnly.FromDateTime(startDate);
            var endDateOnly = DateOnly.FromDateTime(endDate);
            return await _dbSet
                .Include(e => e.EventSessions)
                .Where(e => e.StartDate >= startDateOnly && e.EndDate <= endDateOnly)
                .ToListAsync();
        }

        public async Task<IEnumerable<Event>> GetByUniversityIdAsync(Guid universityId)
        {
            return await _dbSet
                .Include(e => e.EventSessions)
                .Include(e => e.University)
                .Where(e => e.UniversityId == universityId)
                .ToListAsync();
        }

        public async Task<IEnumerable<Event>> SearchAsync(string searchTerm)
        {
            var lowerSearchTerm = searchTerm.ToLower();
            return await _dbSet
                .Include(e => e.EventSessions)
                .Where(e => e.Title.ToLower().Contains(lowerSearchTerm) ||
                           (e.Organizer != null && e.Organizer.ToLower().Contains(lowerSearchTerm)) ||
                           (e.Description != null && e.Description.ToLower().Contains(lowerSearchTerm)))
                .ToListAsync();
        }

        public async Task<Event?> GetWithSessionsAsync(Guid eventId)
        {
            return await _dbSet
                .Include(e => e.EventSessions)
                .ThenInclude(es => es.SessionCheckIns)
                .ThenInclude(sci => sci.StudentInEvent)
                .ThenInclude(sie => sie.Student)
                .FirstOrDefaultAsync(e => e.EventId == eventId);
        }

        public async Task<Event?> GetWithStudentsAsync(Guid eventId)
        {
            return await _dbSet
                .Include(e => e.StudentInEvents)
                .ThenInclude(sie => sie.Student)
                .ThenInclude(s => s.University)
                .FirstOrDefaultAsync(e => e.EventId == eventId);
        }

        public override async Task<IEnumerable<Event>> GetAllAsync()
        {
            return await _dbSet
                .Include(e => e.EventSessions)
                .ToListAsync();
        }

        public override async Task<Event?> GetByIdAsync(Guid id)
        {
            return await _dbSet
                .Include(e => e.EventSessions)
                .Include(e => e.StudentInEvents)
                .ThenInclude(sie => sie.Student)
                .FirstOrDefaultAsync(e => e.EventId == id);
        }
    }
}
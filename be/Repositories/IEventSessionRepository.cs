using Student_Attendance_System.Entities;

namespace Student_Attendance_System.Repositories
{
    public interface IEventSessionRepository : IGenericRepository<EventSession>
    {
        Task<IEnumerable<EventSession>> GetByEventIdAsync(Guid eventId);
        Task<IEnumerable<EventSession>> GetByDateRangeAsync(DateTime startDate, DateTime endDate);
        Task<EventSession?> GetWithCheckInsAsync(Guid sessionId);
        Task<bool> HasOverlapAsync(Guid eventId, DateTime startTime, DateTime endTime, Guid? excludeSessionId = null);
    }
}
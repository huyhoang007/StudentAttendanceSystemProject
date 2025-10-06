using Student_Attendance_System.Entities;

namespace Student_Attendance_System.Repositories
{
    public interface ISessionCheckInRepository : IGenericRepository<SessionCheckIn>
    {
        Task<IEnumerable<SessionCheckIn>> GetBySessionIdAsync(Guid sessionId);
        Task<IEnumerable<SessionCheckIn>> GetByStudentInEventIdAsync(Guid studentInEventId);
        Task<SessionCheckIn?> GetBySessionAndStudentInEventAsync(Guid sessionId, Guid studentInEventId);
        Task<IEnumerable<SessionCheckIn>> GetByEventIdAsync(Guid eventId);
        Task<IEnumerable<SessionCheckIn>> GetByDateRangeAsync(DateTime startDate, DateTime endDate);
        Task<bool> IsStudentCheckedInAsync(Guid sessionId, Guid studentInEventId);
        Task<int> GetCheckInCountAsync(Guid sessionId);
        Task<IEnumerable<SessionCheckIn>> GetByMethodAsync(string method);
    }
}
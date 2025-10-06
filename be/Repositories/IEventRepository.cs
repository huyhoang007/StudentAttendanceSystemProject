using Student_Attendance_System.Entities;

namespace Student_Attendance_System.Repositories
{
    public interface IEventRepository : IGenericRepository<Event>
    {
        Task<IEnumerable<Event>> GetByOrganizerIdAsync(Guid organizerId);
        Task<IEnumerable<Event>> GetByOrganizerAsync(string organizer);
        Task<IEnumerable<Event>> GetByDateRangeAsync(DateTime startDate, DateTime endDate);
        Task<IEnumerable<Event>> GetByUniversityIdAsync(Guid universityId);
        Task<IEnumerable<Event>> SearchAsync(string searchTerm);
        Task<Event?> GetWithSessionsAsync(Guid eventId);
        Task<Event?> GetWithStudentsAsync(Guid eventId);
    }
}
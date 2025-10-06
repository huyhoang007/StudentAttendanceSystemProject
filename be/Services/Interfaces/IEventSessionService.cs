using Student_Attendance_System.DTOs;

namespace Student_Attendance_System.Services.Interfaces
{
    public interface IEventSessionService
    {
        Task<IEnumerable<EventSessionDto>> GetAllSessionsAsync();
        Task<EventSessionDto?> GetSessionByIdAsync(Guid id);
        Task<IEnumerable<EventSessionDto>> GetSessionsByEventIdAsync(Guid eventId);
        Task<IEnumerable<EventSessionDto>> GetSessionsByDateRangeAsync(DateTime startDate, DateTime endDate);
        Task<EventSessionDto> CreateSessionAsync(CreateEventSessionDto createDto);
        Task<EventSessionDto> UpdateSessionAsync(Guid id, UpdateEventSessionDto updateDto);
        Task DeleteSessionAsync(Guid id);
        Task<EventSessionDto?> GetSessionWithCheckInsAsync(Guid sessionId);
    }
}
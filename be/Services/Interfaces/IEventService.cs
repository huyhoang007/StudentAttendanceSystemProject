using Student_Attendance_System.DTOs;

namespace Student_Attendance_System.Services.Interfaces
{
    public interface IEventService
    {
        Task<IEnumerable<EventDto>> GetAllEventsAsync();
        Task<EventDto?> GetEventByIdAsync(Guid id);
        Task<IEnumerable<EventDto>> GetEventsByOrganizerIdAsync(Guid organizerId);
        Task<IEnumerable<EventDto>> GetEventsByOrganizerAsync(string organizer);
        Task<IEnumerable<EventDto>> GetEventsByDateRangeAsync(DateTime startDate, DateTime endDate);
        Task<IEnumerable<EventDto>> GetEventsByUniversityIdAsync(Guid universityId);
        Task<IEnumerable<EventDto>> SearchEventsAsync(string searchTerm);
        Task<EventDto> CreateEventAsync(CreateEventDto createDto);
        Task<EventDto> UpdateEventAsync(Guid id, UpdateEventDto updateDto);
        Task DeleteEventAsync(Guid id);
        Task<EventDto?> GetEventWithSessionsAsync(Guid eventId);
        Task<EventDto?> GetEventWithStudentsAsync(Guid eventId);
    }
}
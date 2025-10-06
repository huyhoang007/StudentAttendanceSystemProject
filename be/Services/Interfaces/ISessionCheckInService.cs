using Student_Attendance_System.DTOs;

namespace Student_Attendance_System.Services.Interfaces
{
    public interface ISessionCheckInService
    {
        Task<IEnumerable<SessionCheckInDto>> GetAllCheckInsAsync();
        Task<SessionCheckInDto?> GetCheckInByIdAsync(Guid id);
        Task<IEnumerable<SessionCheckInDto>> GetCheckInsBySessionIdAsync(Guid sessionId);
        Task<IEnumerable<SessionCheckInDto>> GetCheckInsByStudentInEventIdAsync(Guid studentInEventId);
        Task<IEnumerable<SessionCheckInDto>> GetCheckInsByEventIdAsync(Guid eventId);
        Task<SessionCheckInDto> CreateCheckInAsync(CreateCheckInDto createDto);
        Task<SessionCheckInDto> QRCheckInAsync(QRCheckInDto qrDto);
        Task<IEnumerable<SessionCheckInDto>> BulkCheckInAsync(BulkCheckInDto bulkDto);
        Task DeleteCheckInAsync(Guid id);
        Task<bool> IsStudentCheckedInAsync(Guid sessionId, Guid studentInEventId);
    }
}
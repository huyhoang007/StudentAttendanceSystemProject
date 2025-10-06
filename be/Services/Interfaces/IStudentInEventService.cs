using Student_Attendance_System.DTOs;
using Microsoft.AspNetCore.Http;

namespace Student_Attendance_System.Services.Interfaces
{
    public interface IStudentInEventService
    {
        // New methods
        Task<IEnumerable<StudentInEventDto>> GetAllStudentInEventsAsync();
        Task<StudentInEventDto?> GetStudentInEventByIdAsync(Guid id);
        Task<IEnumerable<StudentInEventDto>> GetStudentsByEventIdAsync(Guid eventId);
        Task<IEnumerable<StudentInEventDto>> GetEventsByStudentIdAsync(Guid studentId);
        Task<IEnumerable<StudentInEventDto>> GetEventsByUserIdAsync(Guid userId);
        Task<StudentInEventDto> AddStudentToEventAsync(CreateStudentInEventDto createDto);
        Task<IEnumerable<StudentInEventDto>> AddMultipleStudentsToEventAsync(BatchAddStudentsDto batchDto);
        Task<StudentInEventDto> UpdateStudentStatusAsync(Guid studentInEventId, string status);
        Task RemoveStudentFromEventAsync(Guid studentInEventId);
        Task<ImportResultDto> ImportStudentsFromCsvAsync(Guid eventId, IFormFile csvFile);

        // Legacy methods for backward compatibility
        Task<IEnumerable<StudentInEventDto>> GetAllRegistrationsAsync();
        Task<StudentInEventDto?> GetRegistrationByIdAsync(Guid id);
        Task<IEnumerable<StudentInEventDto>> GetRegistrationsByEventIdAsync(Guid eventId);
        Task<IEnumerable<StudentInEventDto>> GetRegistrationsByStudentCodeAsync(string studentCode);
        Task<StudentInEventDto> RegisterStudentAsync(RegisterStudentInEventDto registerDto);
        Task<IEnumerable<StudentInEventDto>> BulkRegisterStudentsAsync(BulkRegisterStudentsDto bulkDto);
        Task<StudentInEventDto> UpdateRegistrationStatusAsync(Guid id, UpdateStudentEventStatusDto updateDto);
        Task DeleteRegistrationAsync(Guid id);
        Task<bool> IsStudentRegisteredAsync(Guid eventId, string studentCode);
        Task<bool> IsStudentRegisteredByCodeAsync(Guid eventId, string studentCode);
    }
}
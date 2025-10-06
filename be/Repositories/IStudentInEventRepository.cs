using Student_Attendance_System.Entities;

namespace Student_Attendance_System.Repositories
{
    public interface IStudentInEventRepository : IGenericRepository<StudentInEvent>
    {
        Task<IEnumerable<StudentInEvent>> GetByEventIdAsync(Guid eventId);
        Task<IEnumerable<StudentInEvent>> GetByStudentIdAsync(Guid studentId);
        Task<IEnumerable<StudentInEvent>> GetByUserIdAsync(Guid userId);
        Task<IEnumerable<StudentInEvent>> GetByStudentCodeAsync(string studentCode);
        Task<StudentInEvent?> GetByEventAndStudentCodeAsync(Guid eventId, string studentCode);
        Task<StudentInEvent?> GetByStudentAndEventAsync(Guid studentId, Guid eventId);
        Task<IEnumerable<StudentInEvent>> GetByStatusAsync(string status);
        Task<bool> IsStudentRegisteredAsync(Guid eventId, string studentCode);
        Task<int> GetRegistrationCountAsync(Guid eventId);
        Task<int> GetAttendeeCountAsync(Guid eventId);
    }
}
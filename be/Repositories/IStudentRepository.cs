using Student_Attendance_System.Entities;

namespace Student_Attendance_System.Repositories
{
    public interface IStudentRepository : IGenericRepository<Student>
    {
        Task<Student?> GetByStudentCodeAsync(string studentCode);
        Task<Student?> GetByEmailAsync(string email);
        Task<Student?> GetByUserIdAsync(Guid userId);
        Task<IEnumerable<Student>> GetByUniversityIdAsync(Guid universityId);
        Task<IEnumerable<Student>> SearchAsync(string searchTerm);
        Task<bool> IsStudentCodeUniqueAsync(string studentCode, Guid? excludeStudentId = null);
        Task<bool> IsEmailUniqueAsync(string email, Guid? excludeStudentId = null);
        Task<IEnumerable<Student>> GetStudentsNotInEventAsync(Guid eventId);
    }
}
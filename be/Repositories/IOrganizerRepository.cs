using Student_Attendance_System.Entities;

namespace Student_Attendance_System.Repositories
{
    public interface IOrganizerRepository : IGenericRepository<Organizer>
    {
        Task<Organizer?> GetByUserIdAsync(Guid userId);
        Task<IEnumerable<Organizer>> GetByOrganizationAsync(string organization);
    }
}
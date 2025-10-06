using Student_Attendance_System.Entities;

namespace Student_Attendance_System.Repositories
{
    public interface IUniversityRepository : IGenericRepository<University>
    {
        Task<University?> GetByNameAsync(string name);
        Task<IEnumerable<University>> SearchByNameAsync(string searchTerm);
    }
}
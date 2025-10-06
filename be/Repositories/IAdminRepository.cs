using Student_Attendance_System.Entities;

namespace Student_Attendance_System.Repositories
{
    public interface IAdminRepository : IGenericRepository<Admin>
    {
        Task<Admin?> GetByUserIdAsync(Guid userId);
        Task<IEnumerable<Admin>> GetByDepartmentAsync(string department);
    }
}
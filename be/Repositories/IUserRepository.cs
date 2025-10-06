using Student_Attendance_System.Entities;

namespace Student_Attendance_System.Repositories
{
    public interface IUserRepository : IGenericRepository<User>
    {
        Task<User?> GetByEmailAsync(string email);
        Task<User?> GetByUsernameAsync(string username);
        Task<bool> EmailExistsAsync(string email);
        Task<bool> UsernameExistsAsync(string username);
        Task<IEnumerable<User>> GetAllWithRelatedAsync();
    }
}
using Microsoft.EntityFrameworkCore;
using Student_Attendance_System.Data;
using Student_Attendance_System.Entities;

namespace Student_Attendance_System.Repositories
{
    public class UniversityRepository : GenericRepository<University>, IUniversityRepository
    {
        public UniversityRepository(StudentAttendanceDbContext context) : base(context)
        {
        }

        public async Task<University?> GetByNameAsync(string name)
        {
            return await _dbSet.FirstOrDefaultAsync(u => u.Name == name);
        }

        public async Task<IEnumerable<University>> SearchByNameAsync(string searchTerm)
        {
            return await _dbSet
                .Where(u => u.Name.ToLower().Contains(searchTerm.ToLower()))
                .ToListAsync();
        }

        public override async Task<IEnumerable<University>> GetAllAsync()
        {
            return await _dbSet
                .Include(u => u.Students)
                .ToListAsync();
        }

        public override async Task<University?> GetByIdAsync(Guid id)
        {
            return await _dbSet
                .Include(u => u.Students)
                .FirstOrDefaultAsync(u => u.UniversityId == id);
        }
    }
}
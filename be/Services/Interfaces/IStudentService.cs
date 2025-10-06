using Student_Attendance_System.DTOs;

namespace Student_Attendance_System.Services.Interfaces
{
    public interface IStudentService
    {
        Task<IEnumerable<StudentDto>> GetAllStudentsAsync();
        Task<StudentDto?> GetStudentByIdAsync(Guid id);
        Task<StudentDto?> GetStudentByStudentCodeAsync(string studentCode);
        Task<StudentDto?> GetStudentByEmailAsync(string email);
        Task<StudentDto?> GetStudentByUserIdAsync(Guid userId);
        Task<IEnumerable<StudentDto>> GetStudentsByUniversityIdAsync(Guid universityId);
        Task<IEnumerable<StudentDto>> SearchStudentsAsync(string searchTerm);
        Task<StudentDto> CreateStudentAsync(CreateStudentDto createDto);
        Task<StudentDto> UpdateStudentAsync(Guid id, UpdateStudentDto updateDto);
        Task DeleteStudentAsync(Guid id);
        Task<IEnumerable<StudentDto>> ImportStudentsAsync(List<ImportStudentDto> importDtos);
        Task<StudentImportResultDto> ImportStudentsFromFileAsync(IFormFile file);
        Task<bool> IsStudentCodeUniqueAsync(string studentCode, Guid? excludeStudentId = null);
        Task<bool> IsEmailUniqueAsync(string email, Guid? excludeStudentId = null);
    }
}
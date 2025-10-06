using Student_Attendance_System.DTOs;
using Student_Attendance_System.Entities;
using Student_Attendance_System.Repositories;
using Student_Attendance_System.Services.Interfaces;
using System.Text;
using System.Globalization;

namespace Student_Attendance_System.Services
{
    public class StudentService : IStudentService
    {
        private readonly IStudentRepository _studentRepository;
        private readonly IUniversityRepository _universityRepository;

        public StudentService(IStudentRepository studentRepository, IUniversityRepository universityRepository)
        {
            _studentRepository = studentRepository;
            _universityRepository = universityRepository;
        }

        public async Task<IEnumerable<StudentDto>> GetAllStudentsAsync()
        {
            var students = await _studentRepository.GetAllAsync();
            return students.Select(MapToDto);
        }

        public async Task<StudentDto?> GetStudentByIdAsync(Guid id)
        {
            var student = await _studentRepository.GetByIdAsync(id);
            return student != null ? MapToDto(student) : null;
        }

        public async Task<StudentDto?> GetStudentByStudentCodeAsync(string studentCode)
        {
            var student = await _studentRepository.GetByStudentCodeAsync(studentCode);
            return student != null ? MapToDto(student) : null;
        }

        public async Task<StudentDto?> GetStudentByEmailAsync(string email)
        {
            var student = await _studentRepository.GetByEmailAsync(email);
            return student != null ? MapToDto(student) : null;
        }

        public async Task<StudentDto?> GetStudentByUserIdAsync(Guid userId)
        {
            var student = await _studentRepository.GetByUserIdAsync(userId);
            return student != null ? MapToDto(student) : null;
        }

        public async Task<IEnumerable<StudentDto>> GetStudentsByUniversityIdAsync(Guid universityId)
        {
            var students = await _studentRepository.GetByUniversityIdAsync(universityId);
            return students.Select(MapToDto);
        }

        public async Task<IEnumerable<StudentDto>> SearchStudentsAsync(string searchTerm)
        {
            var students = await _studentRepository.SearchAsync(searchTerm);
            return students.Select(MapToDto);
        }

        public async Task<StudentDto> CreateStudentAsync(CreateStudentDto createDto)
        {
            // Validate university exists if provided
            if (createDto.UniversityId.HasValue)
            {
                var university = await _universityRepository.GetByIdAsync(createDto.UniversityId.Value);
                if (university == null)
                {
                    throw new KeyNotFoundException($"University with ID {createDto.UniversityId} not found.");
                }
            }

            // Check uniqueness
            if (!await _studentRepository.IsStudentCodeUniqueAsync(createDto.StudentCode))
            {
                throw new InvalidOperationException($"Student code '{createDto.StudentCode}' already exists.");
            }

            if (!await _studentRepository.IsEmailUniqueAsync(createDto.Email))
            {
                throw new InvalidOperationException($"Email '{createDto.Email}' already exists.");
            }

            var student = new Student
            {
                Name = createDto.Name,
                StudentCode = createDto.StudentCode,
                Email = createDto.Email,
                Phone = createDto.Phone,
                UniversityId = createDto.UniversityId
            };

            var createdStudent = await _studentRepository.AddAsync(student);
            
            // Reload with university info
            var studentWithUniversity = await _studentRepository.GetByIdAsync(createdStudent.StudentId);
            return MapToDto(studentWithUniversity!);
        }

        public async Task<StudentDto> UpdateStudentAsync(Guid id, UpdateStudentDto updateDto)
        {
            var student = await _studentRepository.GetByIdAsync(id);
            if (student == null)
            {
                throw new KeyNotFoundException($"Student with ID {id} not found.");
            }

            // Validate university exists if provided
            if (updateDto.UniversityId.HasValue)
            {
                var university = await _universityRepository.GetByIdAsync(updateDto.UniversityId.Value);
                if (university == null)
                {
                    throw new KeyNotFoundException($"University with ID {updateDto.UniversityId} not found.");
                }
            }

            // Check uniqueness
            if (!await _studentRepository.IsStudentCodeUniqueAsync(updateDto.StudentCode, id))
            {
                throw new InvalidOperationException($"Student code '{updateDto.StudentCode}' already exists.");
            }

            if (!await _studentRepository.IsEmailUniqueAsync(updateDto.Email, id))
            {
                throw new InvalidOperationException($"Email '{updateDto.Email}' already exists.");
            }

            student.Name = updateDto.Name;
            student.StudentCode = updateDto.StudentCode;
            student.Email = updateDto.Email;
            student.Phone = updateDto.Phone;
            student.UniversityId = updateDto.UniversityId;

            var updatedStudent = await _studentRepository.UpdateAsync(student);
            
            // Reload with university info
            var studentWithUniversity = await _studentRepository.GetByIdAsync(updatedStudent.StudentId);
            return MapToDto(studentWithUniversity!);
        }

        public async Task DeleteStudentAsync(Guid id)
        {
            var student = await _studentRepository.GetByIdAsync(id);
            if (student == null)
            {
                throw new KeyNotFoundException($"Student with ID {id} not found.");
            }

            // Check if student has registrations
            if (student.StudentInEvents.Any())
            {
                throw new InvalidOperationException("Cannot delete student that has event registrations.");
            }

            await _studentRepository.DeleteAsync(student);
        }

        public async Task<IEnumerable<StudentDto>> ImportStudentsAsync(List<ImportStudentDto> importDtos)
        {
            var results = new List<StudentDto>();
            var errors = new List<string>();

            foreach (var importDto in importDtos)
            {
                try
                {
                    // Find university by name
                    var university = await _universityRepository.GetByNameAsync(importDto.UniversityName);
                    if (university == null)
                    {
                        errors.Add($"University '{importDto.UniversityName}' not found for student {importDto.StudentCode}");
                        continue;
                    }

                    // Check if student already exists
                    var existingStudent = await _studentRepository.GetByStudentCodeAsync(importDto.StudentCode);
                    if (existingStudent != null)
                    {
                        errors.Add($"Student with code '{importDto.StudentCode}' already exists");
                        continue;
                    }

                    var createDto = new CreateStudentDto
                    {
                        Name = importDto.Name,
                        StudentCode = importDto.StudentCode,
                        Email = importDto.Email,
                        Phone = importDto.Phone,
                        UniversityId = university.UniversityId
                    };

                    var createdStudent = await CreateStudentAsync(createDto);
                    results.Add(createdStudent);
                }
                catch (Exception ex)
                {
                    errors.Add($"Error importing student {importDto.StudentCode}: {ex.Message}");
                }
            }

            if (errors.Any())
            {
                throw new InvalidOperationException($"Import completed with errors: {string.Join("; ", errors)}");
            }

            return results;
        }

        public async Task<bool> IsStudentCodeUniqueAsync(string studentCode, Guid? excludeStudentId = null)
        {
            return await _studentRepository.IsStudentCodeUniqueAsync(studentCode, excludeStudentId);
        }

        public async Task<bool> IsEmailUniqueAsync(string email, Guid? excludeStudentId = null)
        {
            return await _studentRepository.IsEmailUniqueAsync(email, excludeStudentId);
        }

        public async Task<StudentImportResultDto> ImportStudentsFromFileAsync(IFormFile file)
        {
            var result = new StudentImportResultDto();
            var errors = new List<string>();
            var importDtos = new List<ImportStudentDto>();

            try
            {
                using var stream = file.OpenReadStream();
                var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();

                if (fileExtension == ".csv")
                {
                    importDtos = await ParseCsvFileAsync(stream);
                }
                else if (fileExtension == ".xlsx" || fileExtension == ".xls")
                {
                    // For now, we'll handle Excel files as CSV for simplicity
                    // In a real implementation, you'd use a library like EPPlus or ClosedXML
                    throw new InvalidOperationException("Excel file support will be implemented in a future update. Please use CSV format.");
                }

                result.TotalRecords = importDtos.Count;

                foreach (var importDto in importDtos)
                {
                    try
                    {
                        // Check if student code already exists
                        if (!await IsStudentCodeUniqueAsync(importDto.StudentCode))
                        {
                            errors.Add($"Student code '{importDto.StudentCode}' already exists.");
                            result.FailedImports++;
                            continue;
                        }

                        // Check if email already exists
                        if (!await IsEmailUniqueAsync(importDto.Email))
                        {
                            errors.Add($"Email '{importDto.Email}' already exists.");
                            result.FailedImports++;
                            continue;
                        }

                        // Find university by name
                        var universities = await _universityRepository.GetAllAsync();
                        var university = universities.FirstOrDefault(u => 
                            string.Equals(u.Name, importDto.UniversityName, StringComparison.OrdinalIgnoreCase));

                        if (university == null)
                        {
                            errors.Add($"University '{importDto.UniversityName}' not found for student '{importDto.StudentCode}'.");
                            result.FailedImports++;
                            continue;
                        }

                        var student = new Student
                        {
                            StudentId = Guid.NewGuid(),
                            Name = importDto.Name,
                            StudentCode = importDto.StudentCode,
                            Email = importDto.Email,
                            Phone = importDto.Phone,
                            UniversityId = university.UniversityId,
                            UserId = null // Will be set when user registers
                        };

                        await _studentRepository.AddAsync(student);
                        result.ImportedStudents.Add(MapToDto(student));
                        result.SuccessfulImports++;
                    }
                    catch (Exception ex)
                    {
                        errors.Add($"Error importing student '{importDto.StudentCode}': {ex.Message}");
                        result.FailedImports++;
                    }
                }

                result.Errors = errors;
                return result;
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException($"Error processing file: {ex.Message}");
            }
        }

        private async Task<List<ImportStudentDto>> ParseCsvFileAsync(Stream stream)
        {
            var importDtos = new List<ImportStudentDto>();
            
            using var reader = new StreamReader(stream, Encoding.UTF8);
            var line = await reader.ReadLineAsync(); // Skip header

            while ((line = await reader.ReadLineAsync()) != null)
            {
                if (string.IsNullOrWhiteSpace(line)) continue;

                var values = line.Split(',');
                if (values.Length < 4) continue;

                var importDto = new ImportStudentDto
                {
                    Name = values[0]?.Trim().Trim('"') ?? string.Empty,
                    StudentCode = values[1]?.Trim().Trim('"') ?? string.Empty,
                    Email = values[2]?.Trim().Trim('"') ?? string.Empty,
                    UniversityName = values[3]?.Trim().Trim('"') ?? string.Empty,
                    Phone = values.Length > 4 ? values[4]?.Trim().Trim('"') : null
                };

                if (!string.IsNullOrEmpty(importDto.Name) && 
                    !string.IsNullOrEmpty(importDto.StudentCode) && 
                    !string.IsNullOrEmpty(importDto.Email))
                {
                    importDtos.Add(importDto);
                }
            }

            return importDtos;
        }

        private static StudentDto MapToDto(Student student)
        {
            return new StudentDto
            {
                StudentId = student.StudentId,
                Name = student.Name,
                StudentCode = student.StudentCode,
                Email = student.Email,
                Phone = student.Phone,
                UniversityId = student.UniversityId,
                UniversityName = student.University?.Name ?? string.Empty,
                UserId = student.UserId
            };
        }
    }
}
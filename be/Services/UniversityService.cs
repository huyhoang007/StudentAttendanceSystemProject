using Student_Attendance_System.DTOs;
using Student_Attendance_System.Entities;
using Student_Attendance_System.Repositories;
using Student_Attendance_System.Services.Interfaces;

namespace Student_Attendance_System.Services
{
    public class UniversityService : IUniversityService
    {
        private readonly IUniversityRepository _universityRepository;

        public UniversityService(IUniversityRepository universityRepository)
        {
            _universityRepository = universityRepository;
        }

        public async Task<IEnumerable<UniversityDto>> GetAllUniversitiesAsync()
        {
            var universities = await _universityRepository.GetAllAsync();
            return universities.Select(MapToDto);
        }

        public async Task<UniversityDto?> GetUniversityByIdAsync(Guid id)
        {
            var university = await _universityRepository.GetByIdAsync(id);
            return university != null ? MapToDto(university) : null;
        }

        public async Task<UniversityDto?> GetUniversityByNameAsync(string name)
        {
            var university = await _universityRepository.GetByNameAsync(name);
            return university != null ? MapToDto(university) : null;
        }

        public async Task<IEnumerable<UniversityDto>> SearchUniversitiesAsync(string searchTerm)
        {
            var universities = await _universityRepository.SearchByNameAsync(searchTerm);
            return universities.Select(MapToDto);
        }

        public async Task<UniversityDto> CreateUniversityAsync(CreateUniversityDto createDto)
        {
            // Check if university with same name exists
            var existingUniversity = await _universityRepository.GetByNameAsync(createDto.Name);
            if (existingUniversity != null)
            {
                throw new InvalidOperationException($"University with name '{createDto.Name}' already exists.");
            }

            var university = new University
            {
                Name = createDto.Name,
                Address = createDto.Address,
                ContactInfo = createDto.ContactInfo
            };

            var createdUniversity = await _universityRepository.AddAsync(university);
            return MapToDto(createdUniversity);
        }

        public async Task<UniversityDto> UpdateUniversityAsync(Guid id, UpdateUniversityDto updateDto)
        {
            var university = await _universityRepository.GetByIdAsync(id);
            if (university == null)
            {
                throw new KeyNotFoundException($"University with ID {id} not found.");
            }

            // Check if another university with same name exists
            var existingUniversity = await _universityRepository.GetByNameAsync(updateDto.Name);
            if (existingUniversity != null && existingUniversity.UniversityId != id)
            {
                throw new InvalidOperationException($"University with name '{updateDto.Name}' already exists.");
            }

            university.Name = updateDto.Name;
            university.Address = updateDto.Address;
            university.ContactInfo = updateDto.ContactInfo;

            var updatedUniversity = await _universityRepository.UpdateAsync(university);
            return MapToDto(updatedUniversity);
        }

        public async Task DeleteUniversityAsync(Guid id)
        {
            var university = await _universityRepository.GetByIdAsync(id);
            if (university == null)
            {
                throw new KeyNotFoundException($"University with ID {id} not found.");
            }

            // Check if university has students
            if (university.Students.Any())
            {
                throw new InvalidOperationException("Cannot delete university that has students associated with it.");
            }

            await _universityRepository.DeleteAsync(university);
        }

        public async Task<bool> UniversityExistsAsync(Guid id)
        {
            return await _universityRepository.ExistsAsync(u => u.UniversityId == id);
        }

        private static UniversityDto MapToDto(University university)
        {
            return new UniversityDto
            {
                UniversityId = university.UniversityId,
                Name = university.Name,
                Address = university.Address,
                ContactInfo = university.ContactInfo
            };
        }
    }
}
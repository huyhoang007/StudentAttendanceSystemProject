using Student_Attendance_System.DTOs;
using Student_Attendance_System.Entities;
using Student_Attendance_System.Repositories;
using Student_Attendance_System.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using System.Text;

namespace Student_Attendance_System.Services
{
    public class StudentInEventService : IStudentInEventService
    {
        private readonly IStudentInEventRepository _studentInEventRepository;
        private readonly IStudentRepository _studentRepository;
        private readonly IEventRepository _eventRepository;
        private readonly IEventSessionRepository _eventSessionRepository;

        public StudentInEventService(
            IStudentInEventRepository studentInEventRepository,
            IStudentRepository studentRepository,
            IEventRepository eventRepository,
            IEventSessionRepository eventSessionRepository)
        {
            _studentInEventRepository = studentInEventRepository;
            _studentRepository = studentRepository;
            _eventRepository = eventRepository;
            _eventSessionRepository = eventSessionRepository;
        }

        public async Task<IEnumerable<StudentInEventDto>> GetAllStudentInEventsAsync()
        {
            var registrations = await _studentInEventRepository.GetAllAsync();
            return registrations.Select(MapToDto);
        }

        public async Task<StudentInEventDto?> GetStudentInEventByIdAsync(Guid id)
        {
            var registration = await _studentInEventRepository.GetByIdAsync(id);
            return registration != null ? MapToDto(registration) : null;
        }

        public async Task<IEnumerable<StudentInEventDto>> GetStudentsByEventIdAsync(Guid eventId)
        {
            var registrations = await _studentInEventRepository.GetByEventIdAsync(eventId);
            return registrations.Select(MapToDto);
        }

        public async Task<IEnumerable<StudentInEventDto>> GetEventsByStudentIdAsync(Guid studentId)
        {
            var registrations = await _studentInEventRepository.GetByStudentIdAsync(studentId);
            return registrations.Select(MapToDto);
        }

        public async Task<IEnumerable<StudentInEventDto>> GetEventsByUserIdAsync(Guid userId)
        {
            var registrations = await _studentInEventRepository.GetByUserIdAsync(userId);
            return registrations.Select(MapToDto);
        }

        public async Task<StudentInEventDto> AddStudentToEventAsync(CreateStudentInEventDto createDto)
        {
            // Validate event exists
            var eventEntity = await _eventRepository.GetByIdAsync(createDto.EventId);
            if (eventEntity == null)
                throw new KeyNotFoundException($"Event with ID {createDto.EventId} not found.");

            // Validate student exists
            var student = await _studentRepository.GetByIdAsync(createDto.StudentId);
            if (student == null)
                throw new KeyNotFoundException($"Student with ID {createDto.StudentId} not found.");

            // Check if student is already registered for this event
            var existingRegistration = await _studentInEventRepository.GetByStudentAndEventAsync(
                createDto.StudentId, createDto.EventId);
            if (existingRegistration != null)
            {
                throw new InvalidOperationException($"Student is already registered for this event.");
            }

            var studentInEvent = new StudentInEvent
            {
                StudentInEventId = Guid.NewGuid(),
                EventId = createDto.EventId,
                StudentId = createDto.StudentId,
                Status = createDto.Status
            };

            var created = await _studentInEventRepository.AddAsync(studentInEvent);
            return MapToDto(created);
        }

        public async Task<IEnumerable<StudentInEventDto>> AddMultipleStudentsToEventAsync(BatchAddStudentsDto batchDto)
        {
            var results = new List<StudentInEventDto>();

            foreach (var studentId in batchDto.StudentIds)
            {
                try
                {
                    var createDto = new CreateStudentInEventDto
                    {
                        EventId = batchDto.EventId,
                        StudentId = studentId,
                        Status = batchDto.Status
                    };
                    
                    var result = await AddStudentToEventAsync(createDto);
                    results.Add(result);
                }
                catch
                {
                    // Skip failed registrations but continue with others
                    continue;
                }
            }

            return results;
        }

        public async Task<StudentInEventDto> UpdateStudentStatusAsync(Guid studentInEventId, string status)
        {
            var studentInEvent = await _studentInEventRepository.GetByIdAsync(studentInEventId);
            if (studentInEvent == null)
                throw new KeyNotFoundException($"StudentInEvent with ID {studentInEventId} not found.");

            studentInEvent.Status = status;
            var updated = await _studentInEventRepository.UpdateAsync(studentInEvent);
            return MapToDto(updated);
        }

        public async Task RemoveStudentFromEventAsync(Guid studentInEventId)
        {
            var studentInEvent = await _studentInEventRepository.GetByIdAsync(studentInEventId);
            if (studentInEvent == null)
                throw new KeyNotFoundException($"StudentInEvent with ID {studentInEventId} not found.");

            await _studentInEventRepository.DeleteAsync(studentInEvent);
        }

        public async Task<ImportResultDto> ImportStudentsFromCsvAsync(Guid eventId, IFormFile csvFile)
        {
            var result = new ImportResultDto();

            // Validate event exists
            var eventEntity = await _eventRepository.GetByIdAsync(eventId);
            if (eventEntity == null)
                throw new KeyNotFoundException($"Event with ID {eventId} not found.");

            using var reader = new StreamReader(csvFile.OpenReadStream());
            var csvContent = await reader.ReadToEndAsync();
            var lines = csvContent.Split('\n', StringSplitOptions.RemoveEmptyEntries);

            result.TotalProcessed = lines.Length - 1; // Exclude header

            for (int i = 1; i < lines.Length; i++) // Skip header
            {
                try
                {
                    var values = lines[i].Split(',');
                    if (values.Length < 1) continue;

                    var studentCode = values[0].Trim().Trim('"');
                    
                    // Find student by code
                    var student = await _studentRepository.GetByStudentCodeAsync(studentCode);
                    if (student == null)
                    {
                        result.FailureCount++;
                        result.Errors.Add($"Student with code {studentCode} not found.");
                        continue;
                    }

                    var createDto = new CreateStudentInEventDto
                    {
                        EventId = eventId,
                        StudentId = student.StudentId,
                        Status = "registered"
                    };

                    var added = await AddStudentToEventAsync(createDto);
                    result.AddedStudents.Add(added);
                    result.SuccessCount++;
                }
                catch (Exception ex)
                {
                    result.FailureCount++;
                    result.Errors.Add($"Error processing line {i + 1}: {ex.Message}");
                }
            }

            return result;
        }

        // Legacy methods for backward compatibility
        public async Task<IEnumerable<StudentInEventDto>> GetAllRegistrationsAsync()
        {
            return await GetAllStudentInEventsAsync();
        }

        public async Task<StudentInEventDto?> GetRegistrationByIdAsync(Guid id)
        {
            return await GetStudentInEventByIdAsync(id);
        }

        public async Task<IEnumerable<StudentInEventDto>> GetRegistrationsByEventIdAsync(Guid eventId)
        {
            return await GetStudentsByEventIdAsync(eventId);
        }

        public async Task<IEnumerable<StudentInEventDto>> GetRegistrationsByStudentCodeAsync(string studentCode)
        {
            var student = await _studentRepository.GetByStudentCodeAsync(studentCode);
            if (student == null) return new List<StudentInEventDto>();
            
            return await GetEventsByStudentIdAsync(student.StudentId);
        }

        public async Task<StudentInEventDto> RegisterStudentAsync(RegisterStudentInEventDto registerDto)
        {
            // Validate event exists
            var evt = await _eventRepository.GetByIdAsync(registerDto.EventId);
            if (evt == null)
            {
                throw new KeyNotFoundException($"Event with ID {registerDto.EventId} not found.");
            }

            // Validate student exists
            var student = await _studentRepository.GetByStudentCodeAsync(registerDto.StudentCode);
            if (student == null)
            {
                throw new KeyNotFoundException($"Student with code {registerDto.StudentCode} not found.");
            }

            // Check if student is already registered
            var existingRegistration = await _studentInEventRepository.GetByEventAndStudentCodeAsync(registerDto.EventId, registerDto.StudentCode);
            if (existingRegistration != null)
            {
                throw new InvalidOperationException("Student is already registered for this event.");
            }

            var registration = new StudentInEvent
            {
                EventId = registerDto.EventId,
                StudentId = student.StudentId,
                Status = "registered"
            };

            var createdRegistration = await _studentInEventRepository.AddAsync(registration);
            
            // Reload with related data
            var registrationWithData = await _studentInEventRepository.GetByIdAsync(createdRegistration.StudentInEventId);
            return MapToDto(registrationWithData!);
        }

        public async Task<IEnumerable<StudentInEventDto>> BulkRegisterStudentsAsync(BulkRegisterStudentsDto bulkDto)
        {
            // Validate event exists
            var evt = await _eventRepository.GetByIdAsync(bulkDto.EventId);
            if (evt == null)
            {
                throw new KeyNotFoundException($"Event with ID {bulkDto.EventId} not found.");
            }

            var results = new List<StudentInEventDto>();
            var errors = new List<string>();

            foreach (var studentCode in bulkDto.StudentCodes)
            {
                try
                {
                    var registerDto = new RegisterStudentInEventDto
                    {
                        EventId = bulkDto.EventId,
                        StudentCode = studentCode
                    };

                    var registration = await RegisterStudentAsync(registerDto);
                    results.Add(registration);
                }
                catch (Exception ex)
                {
                    errors.Add($"Error registering student {studentCode}: {ex.Message}");
                }
            }

            if (errors.Any())
            {
                throw new InvalidOperationException($"Bulk registration completed with errors: {string.Join("; ", errors)}");
            }

            return results;
        }

        public async Task<StudentInEventDto> UpdateRegistrationStatusAsync(Guid id, UpdateStudentEventStatusDto updateDto)
        {
            var registration = await _studentInEventRepository.GetByIdAsync(id);
            if (registration == null)
            {
                throw new KeyNotFoundException($"Registration with ID {id} not found.");
            }

            registration.Status = updateDto.Status;

            var updatedRegistration = await _studentInEventRepository.UpdateAsync(registration);
            
            // Reload with related data
            var registrationWithData = await _studentInEventRepository.GetByIdAsync(updatedRegistration.StudentInEventId);
            return MapToDto(registrationWithData!);
        }

        public async Task DeleteRegistrationAsync(Guid id)
        {
            var registration = await _studentInEventRepository.GetByIdAsync(id);
            if (registration == null)
            {
                throw new KeyNotFoundException($"Registration with ID {id} not found.");
            }

            await _studentInEventRepository.DeleteAsync(registration);
        }

        public async Task<bool> IsStudentRegisteredAsync(Guid eventId, string studentCode)
        {
            return await _studentInEventRepository.IsStudentRegisteredAsync(eventId, studentCode);
        }

        public async Task<bool> IsStudentRegisteredByCodeAsync(Guid eventId, string studentCode)
        {
            return await _studentInEventRepository.IsStudentRegisteredAsync(eventId, studentCode);
        }

        private static StudentInEventDto MapToDto(StudentInEvent registration)
        {
            return new StudentInEventDto
            {
                StudentInEventId = registration.StudentInEventId,
                EventId = registration.EventId,
                StudentId = registration.StudentId,
                StudentCode = registration.Student?.StudentCode ?? string.Empty,
                Status = registration.Status,
                EventTitle = registration.Event?.Title ?? string.Empty,
                StudentName = registration.Student?.Name ?? string.Empty,
                StudentEmail = registration.Student?.Email ?? string.Empty,
                
                // Additional Event Details
                EventDescription = registration.Event?.Description,
                EventOrganizer = registration.Event?.Organizer,
                EventStartDate = registration.Event?.StartDate ?? DateOnly.MinValue,
                EventEndDate = registration.Event?.EndDate ?? DateOnly.MinValue,
                EventOrganizerId = registration.Event?.OrganizerId ?? Guid.Empty
            };
        }
    }
}
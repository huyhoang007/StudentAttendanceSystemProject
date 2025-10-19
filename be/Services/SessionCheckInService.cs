using Student_Attendance_System.DTOs;
using Student_Attendance_System.Entities;
using Student_Attendance_System.Repositories;
using Student_Attendance_System.Services.Interfaces;

namespace Student_Attendance_System.Services
{
    public class SessionCheckInService : ISessionCheckInService
    {
        private readonly ISessionCheckInRepository _checkInRepository;
        private readonly IEventSessionRepository _sessionRepository;
        private readonly IStudentRepository _studentRepository;
        private readonly IStudentInEventRepository _studentInEventRepository;

        public SessionCheckInService(
            ISessionCheckInRepository checkInRepository,
            IEventSessionRepository sessionRepository,
            IStudentRepository studentRepository,
            IStudentInEventRepository studentInEventRepository)
        {
            _checkInRepository = checkInRepository;
            _sessionRepository = sessionRepository;
            _studentRepository = studentRepository;
            _studentInEventRepository = studentInEventRepository;
        }

        public async Task<IEnumerable<SessionCheckInDto>> GetAllCheckInsAsync()
        {
            var checkIns = await _checkInRepository.GetAllAsync();
            return checkIns.Select(MapToDto);
        }

        public async Task<SessionCheckInDto?> GetCheckInByIdAsync(Guid id)
        {
            var checkIn = await _checkInRepository.GetByIdAsync(id);
            return checkIn != null ? MapToDto(checkIn) : null;
        }

        public async Task<IEnumerable<SessionCheckInDto>> GetCheckInsBySessionIdAsync(Guid sessionId)
        {
            var checkIns = await _checkInRepository.GetBySessionIdAsync(sessionId);
            return checkIns.Select(MapToDto);
        }

        public async Task<IEnumerable<SessionCheckInDto>> GetCheckInsByStudentInEventIdAsync(Guid studentInEventId)
        {
            var checkIns = await _checkInRepository.GetByStudentInEventIdAsync(studentInEventId);
            return checkIns.Select(MapToDto);
        }

        public async Task<IEnumerable<SessionCheckInDto>> GetCheckInsByEventIdAsync(Guid eventId)
        {
            var checkIns = await _checkInRepository.GetByEventIdAsync(eventId);
            return checkIns.Select(MapToDto);
        }

        public async Task<SessionCheckInDto> CreateCheckInAsync(CreateCheckInDto createDto)
        {
            // Validate session exists
            var session = await _sessionRepository.GetByIdAsync(createDto.SessionId);
            if (session == null)
                throw new KeyNotFoundException($"Session with ID {createDto.SessionId} not found.");

            // Validate student in event exists
            var studentInEvent = await _studentInEventRepository.GetByIdAsync(createDto.StudentInEventId);
            if (studentInEvent == null)
                throw new KeyNotFoundException($"Student registration with ID {createDto.StudentInEventId} not found.");

            // Validate check-in time if configured
            var now = DateTime.UtcNow;
            Console.WriteLine($"[DEBUG] Current UTC time: {now}");
            Console.WriteLine($"[DEBUG] Session CheckinStartTime: {session.CheckinStartTime}");
            Console.WriteLine($"[DEBUG] Session CheckinEndTime: {session.CheckinEndTime}");

            // Check if student is already checked in
            var existingCheckIn = await _checkInRepository.GetBySessionAndStudentInEventAsync(createDto.SessionId, createDto.StudentInEventId);
            if (existingCheckIn != null)
                throw new InvalidOperationException("Student is already checked in for this session.");

            var checkIn = new SessionCheckIn
            {
                // KHÔNG gán CheckinId, để BE tự sinh Guid mới
                SessionId = createDto.SessionId,
                StudentInEventId = createDto.StudentInEventId,
                CheckinTime = now,
                Method = createDto.Method,
                Location = createDto.Location
            };
            // Nếu location bị null hoặc rỗng, tự động lấy từ session
            if (string.IsNullOrEmpty(checkIn.Location))
            {
                Console.WriteLine($"[DEBUG] Session.Location: {session.Location}");
                checkIn.Location = session.Location;
            }

            // ✅ Chỉ thêm MỘT lần
            var createdCheckIn = await _checkInRepository.AddAsync(checkIn);
            Console.WriteLine($"[DEBUG] New CheckinId: {checkIn.CheckinId}");

            // Cập nhật trạng thái sinh viên
            if (studentInEvent.Status != "attended")
            {
                studentInEvent.Status = "attended";
                await _studentInEventRepository.UpdateAsync(studentInEvent);
            }

            // ✅ Không thêm lại nữa!
            // var addedCheckIn = await _checkInRepository.AddAsync(checkIn);

            // Lấy lại dữ liệu đầy đủ
            var checkInWithData = await _checkInRepository.GetByIdAsync(createdCheckIn.CheckinId);
            return MapToDto(checkInWithData!);
        }


        public async Task<SessionCheckInDto> QRCheckInAsync(QRCheckInDto qrDto)
        {
            // Parse QR code to get session ID (assuming QR code contains session ID)
            if (!Guid.TryParse(qrDto.QRCode, out var sessionId))
            {
                throw new InvalidOperationException("Invalid QR code format.");
            }

            // Get session to find event ID
            var session = await _sessionRepository.GetByIdAsync(sessionId);
            if (session == null)
            {
                throw new KeyNotFoundException($"Session with ID {sessionId} not found.");
            }

            // Find student registration for this event
            var studentInEvent = await _studentInEventRepository.GetByEventAndStudentCodeAsync(session.EventId, qrDto.StudentCode);
            if (studentInEvent == null)
            {
                throw new KeyNotFoundException($"Student with code {qrDto.StudentCode} is not registered for this event.");
            }

            var createDto = new CreateCheckInDto
            {
                SessionId = sessionId,
                StudentInEventId = studentInEvent.StudentInEventId,
                Method = "QR",
                Location = qrDto.Location
            };

            return await CreateCheckInAsync(createDto);
        }

        public async Task<IEnumerable<SessionCheckInDto>> BulkCheckInAsync(BulkCheckInDto bulkDto)
        {
            // Validate session exists
            var session = await _sessionRepository.GetByIdAsync(bulkDto.SessionId);
            if (session == null)
            {
                throw new KeyNotFoundException($"Session with ID {bulkDto.SessionId} not found.");
            }

            var results = new List<SessionCheckInDto>();
            var errors = new List<string>();

            foreach (var studentCode in bulkDto.StudentCodes)
            {
                try
                {
                    // Find student registration for this event
                    var studentInEvent = await _studentInEventRepository.GetByEventAndStudentCodeAsync(session.EventId, studentCode);
                    if (studentInEvent == null)
                    {
                        errors.Add($"Student with code {studentCode} is not registered for this event.");
                        continue;
                    }

                    var createDto = new CreateCheckInDto
                    {
                        SessionId = bulkDto.SessionId,
                        StudentInEventId = studentInEvent.StudentInEventId,
                        Method = bulkDto.Method
                    };

                    var checkIn = await CreateCheckInAsync(createDto);
                    results.Add(checkIn);
                }
                catch (Exception ex)
                {
                    errors.Add($"Error checking in student {studentCode}: {ex.Message}");
                }
            }

            if (errors.Any())
            {
                throw new InvalidOperationException($"Bulk check-in completed with errors: {string.Join("; ", errors)}");
            }

            return results;
        }

        public async Task DeleteCheckInAsync(Guid id)
        {
            var checkIn = await _checkInRepository.GetByIdAsync(id);
            if (checkIn == null)
            {
                throw new KeyNotFoundException($"Check-in with ID {id} not found.");
            }

            await _checkInRepository.DeleteAsync(checkIn);

            // Optionally update student status back to Registered if no other check-ins exist
            var studentCheckIns = await _checkInRepository.GetByEventIdAsync(checkIn.EventSession.EventId);
            var hasOtherCheckIns = studentCheckIns.Any(ci => ci.StudentInEventId == checkIn.StudentInEventId && ci.CheckinId != id);

            if (!hasOtherCheckIns)
            {
                var studentInEvent = await _studentInEventRepository.GetByIdAsync(checkIn.StudentInEventId);
                if (studentInEvent != null && studentInEvent.Status == "attended")
                {
                    studentInEvent.Status = "registered";
                    await _studentInEventRepository.UpdateAsync(studentInEvent);
                }
            }
        }

        public async Task<bool> IsStudentCheckedInAsync(Guid sessionId, Guid studentInEventId)
        {
            return await _checkInRepository.IsStudentCheckedInAsync(sessionId, studentInEventId);
        }

        private static SessionCheckInDto MapToDto(SessionCheckIn checkIn)
        {
            return new SessionCheckInDto
            {
                CheckinId = checkIn.CheckinId,
                SessionId = checkIn.SessionId,
                StudentInEventId = checkIn.StudentInEventId,
                CheckinTime = checkIn.CheckinTime,
                Method = checkIn.Method,
                Location = checkIn.Location,
                SessionTitle = checkIn.EventSession?.Title ?? string.Empty,
                EventTitle = checkIn.EventSession?.Event?.Title ?? string.Empty,
                StudentName = checkIn.StudentInEvent?.Student?.Name ?? string.Empty,
                StudentCode = checkIn.StudentInEvent?.Student?.StudentCode ?? string.Empty,
                UniversityId = checkIn.StudentInEvent?.Student?.UniversityId,
                OrganizerId = checkIn.EventSession?.Event?.OrganizerId,
                StudentId = checkIn.StudentInEvent?.Student?.StudentId // Thêm StudentId vào DTO
            };
        }
    }
}
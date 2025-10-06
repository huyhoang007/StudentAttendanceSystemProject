using Student_Attendance_System.DTOs;
using Student_Attendance_System.Entities;
using Student_Attendance_System.Repositories;
using Student_Attendance_System.Services.Interfaces;

namespace Student_Attendance_System.Services
{
    public class EventSessionService : IEventSessionService
    {
        private readonly IEventSessionRepository _sessionRepository;
        private readonly IEventRepository _eventRepository;
        private readonly ISessionCheckInRepository _checkInRepository;

        public EventSessionService(
            IEventSessionRepository sessionRepository,
            IEventRepository eventRepository,
            ISessionCheckInRepository checkInRepository)
        {
            _sessionRepository = sessionRepository;
            _eventRepository = eventRepository;
            _checkInRepository = checkInRepository;
        }

        public async Task<IEnumerable<EventSessionDto>> GetAllSessionsAsync()
        {
            var sessions = await _sessionRepository.GetAllAsync();
            return sessions.Select(MapToDto);
        }

        public async Task<EventSessionDto?> GetSessionByIdAsync(Guid id)
        {
            var session = await _sessionRepository.GetByIdAsync(id);
            return session != null ? MapToDto(session) : null;
        }

        public async Task<IEnumerable<EventSessionDto>> GetSessionsByEventIdAsync(Guid eventId)
        {
            var sessions = await _sessionRepository.GetByEventIdAsync(eventId);
            return sessions.Select(MapToDto);
        }

        public async Task<IEnumerable<EventSessionDto>> GetSessionsByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            var sessions = await _sessionRepository.GetByDateRangeAsync(startDate, endDate);
            return sessions.Select(MapToDto);
        }

        public async Task<EventSessionDto> CreateSessionAsync(CreateEventSessionDto createDto)
        {
            // Validate event exists
            var evt = await _eventRepository.GetByIdAsync(createDto.EventId);
            if (evt == null)
            {
                throw new KeyNotFoundException($"Event with ID {createDto.EventId} not found.");
            }

            // Validate session time is within event time (temporarily disabled)
            var sessionStartDate = DateOnly.FromDateTime(createDto.StartTime);
            var sessionEndDate = DateOnly.FromDateTime(createDto.EndTime);
            
            Console.WriteLine($"Event Start Date: {evt.StartDate}");
            Console.WriteLine($"Event End Date: {evt.EndDate}");
            Console.WriteLine($"Session Start Date: {sessionStartDate}");
            Console.WriteLine($"Session End Date: {sessionEndDate}");
            
            /*
            if (sessionStartDate < evt.StartDate || sessionEndDate > evt.EndDate)
            {
                throw new InvalidOperationException($"Session time must be within event date range. Event: {evt.StartDate} to {evt.EndDate}, Session: {sessionStartDate} to {sessionEndDate}");
            }
            */

            // Validate start time is before end time
            if (createDto.StartTime >= createDto.EndTime)
            {
                throw new InvalidOperationException("Start time must be before end time.");
            }

            // Check for time overlap with other sessions in the same event (temporarily disabled)
            /*
            var hasOverlap = await _sessionRepository.HasOverlapAsync(createDto.EventId, createDto.StartTime, createDto.EndTime);
            if (hasOverlap)
            {
                throw new InvalidOperationException("Session time overlaps with another session in the same event.");
            }
            */

            // Validate check-in times if provided (temporarily disabled)
            /*
            if (createDto.CheckinStartTime.HasValue && createDto.CheckinEndTime.HasValue)
            {
                if (createDto.CheckinStartTime >= createDto.CheckinEndTime)
                {
                    throw new InvalidOperationException("Check-in start time must be before check-in end time.");
                }

                if (createDto.CheckinStartTime < createDto.StartTime || createDto.CheckinEndTime > createDto.EndTime)
                {
                    throw new InvalidOperationException("Check-in time must be within session time.");
                }
            }
            */

            var session = new EventSession
            {
                EventId = createDto.EventId,
                Title = createDto.Title,
                StartTime = createDto.StartTime,
                EndTime = createDto.EndTime,
                Location = createDto.Location,
                CheckinStartTime = createDto.CheckinStartTime,
                CheckinEndTime = createDto.CheckinEndTime
            };

            var createdSession = await _sessionRepository.AddAsync(session);
            
            // Reload with related data
            var sessionWithData = await _sessionRepository.GetByIdAsync(createdSession.SessionId);
            return MapToDto(sessionWithData!);
        }

        public async Task<EventSessionDto> UpdateSessionAsync(Guid id, UpdateEventSessionDto updateDto)
        {
            var session = await _sessionRepository.GetByIdAsync(id);
            if (session == null)
            {
                throw new KeyNotFoundException($"Session with ID {id} not found.");
            }

            var evt = session.Event;

            // Validate session time is within event time (temporarily disabled)
            /*
            var sessionStartDate = DateOnly.FromDateTime(updateDto.StartTime);
            var sessionEndDate = DateOnly.FromDateTime(updateDto.EndTime);
            if (sessionStartDate < evt.StartDate || sessionEndDate > evt.EndDate)
            {
                throw new InvalidOperationException("Session time must be within event date range.");
            }
            */

            // Validate start time is before end time
            if (updateDto.StartTime >= updateDto.EndTime)
            {
                throw new InvalidOperationException("Start time must be before end time.");
            }

            // Check for time overlap with other sessions in the same event (temporarily disabled)
            /*
            var hasOverlap = await _sessionRepository.HasOverlapAsync(session.EventId, updateDto.StartTime, updateDto.EndTime, id);
            if (hasOverlap)
            {
                throw new InvalidOperationException("Session time overlaps with another session in the same event.");
            }
            */

            // Validate check-in times if provided (temporarily disabled)
            /*
            if (updateDto.CheckinStartTime.HasValue && updateDto.CheckinEndTime.HasValue)
            {
                if (updateDto.CheckinStartTime >= updateDto.CheckinEndTime)
                {
                    throw new InvalidOperationException("Check-in start time must be before check-in end time.");
                }

                if (updateDto.CheckinStartTime < updateDto.StartTime || updateDto.CheckinEndTime > updateDto.EndTime)
                {
                    throw new InvalidOperationException("Check-in time must be within session time.");
                }
            }
            */

            session.Title = updateDto.Title;
            session.StartTime = updateDto.StartTime;
            session.EndTime = updateDto.EndTime;
            session.Location = updateDto.Location;
            session.CheckinStartTime = updateDto.CheckinStartTime;
            session.CheckinEndTime = updateDto.CheckinEndTime;

            var updatedSession = await _sessionRepository.UpdateAsync(session);
            
            // Reload with related data
            var sessionWithData = await _sessionRepository.GetByIdAsync(updatedSession.SessionId);
            return MapToDto(sessionWithData!);
        }

        public async Task DeleteSessionAsync(Guid id)
        {
            var session = await _sessionRepository.GetByIdAsync(id);
            if (session == null)
            {
                throw new KeyNotFoundException($"Session with ID {id} not found.");
            }

            // Check if session has check-ins
            if (session.SessionCheckIns.Any())
            {
                throw new InvalidOperationException("Cannot delete session that has check-ins.");
            }

            await _sessionRepository.DeleteAsync(session);
        }

        public async Task<EventSessionDto?> GetSessionWithCheckInsAsync(Guid sessionId)
        {
            var session = await _sessionRepository.GetWithCheckInsAsync(sessionId);
            return session != null ? MapToDto(session) : null;
        }

        private static EventSessionDto MapToDto(EventSession session)
        {
            return new EventSessionDto
            {
                SessionId = session.SessionId,
                EventId = session.EventId,
                Title = session.Title,
                StartTime = session.StartTime,
                EndTime = session.EndTime,
                Location = session.Location,
                CheckinStartTime = session.CheckinStartTime,
                CheckinEndTime = session.CheckinEndTime,
                EventTitle = session.Event?.Title ?? string.Empty,
                TotalCheckIns = session.SessionCheckIns?.Count ?? 0
            };
        }
    }
}
using Student_Attendance_System.DTOs;
using Student_Attendance_System.Entities;
using Student_Attendance_System.Repositories;
using Student_Attendance_System.Services.Interfaces;

namespace Student_Attendance_System.Services
{
    public class EventService : IEventService
    {
        private readonly IEventRepository _eventRepository;
        private readonly IOrganizerRepository _organizerRepository;
        private readonly IStudentInEventRepository _studentInEventRepository;

        public EventService(
            IEventRepository eventRepository, 
            IOrganizerRepository organizerRepository,
            IStudentInEventRepository studentInEventRepository)
        {
            _eventRepository = eventRepository;
            _organizerRepository = organizerRepository;
            _studentInEventRepository = studentInEventRepository;
        }

        public async Task<IEnumerable<EventDto>> GetAllEventsAsync()
        {
            var events = await _eventRepository.GetAllAsync();
            var eventDtos = new List<EventDto>();

            foreach (var evt in events)
            {
                var dto = await MapToDtoAsync(evt);
                eventDtos.Add(dto);
            }

            return eventDtos;
        }

        public async Task<EventDto?> GetEventByIdAsync(Guid id)
        {
            var evt = await _eventRepository.GetByIdAsync(id);
            return evt != null ? await MapToDtoAsync(evt) : null;
        }

        public async Task<IEnumerable<EventDto>> GetEventsByOrganizerIdAsync(Guid organizerId)
        {
            var events = await _eventRepository.GetByOrganizerIdAsync(organizerId);
            var eventDtos = new List<EventDto>();

            foreach (var evt in events)
            {
                var dto = await MapToDtoAsync(evt);
                eventDtos.Add(dto);
            }

            return eventDtos;
        }

        public async Task<IEnumerable<EventDto>> GetEventsByOrganizerAsync(string organizer)
        {
            var events = await _eventRepository.GetByOrganizerAsync(organizer);
            var eventDtos = new List<EventDto>();

            foreach (var evt in events)
            {
                var dto = await MapToDtoAsync(evt);
                eventDtos.Add(dto);
            }

            return eventDtos;
        }

        public async Task<IEnumerable<EventDto>> GetEventsByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            var events = await _eventRepository.GetByDateRangeAsync(startDate, endDate);
            var eventDtos = new List<EventDto>();

            foreach (var evt in events)
            {
                var dto = await MapToDtoAsync(evt);
                eventDtos.Add(dto);
            }

            return eventDtos;
        }

        public async Task<IEnumerable<EventDto>> GetEventsByUniversityIdAsync(Guid universityId)
        {
            var events = await _eventRepository.GetByUniversityIdAsync(universityId);
            var eventDtos = new List<EventDto>();

            foreach (var evt in events)
            {
                var dto = await MapToDtoAsync(evt);
                eventDtos.Add(dto);
            }

            return eventDtos;
        }

        public async Task<IEnumerable<EventDto>> SearchEventsAsync(string searchTerm)
        {
            var events = await _eventRepository.SearchAsync(searchTerm);
            var eventDtos = new List<EventDto>();

            foreach (var evt in events)
            {
                var dto = await MapToDtoAsync(evt);
                eventDtos.Add(dto);
            }

            return eventDtos;
        }

        public async Task<EventDto> CreateEventAsync(CreateEventDto createDto)
        {
            // Validate organizer if provided
            if (createDto.OrganizerId != Guid.Empty)
            {
                var organizer = await _organizerRepository.GetByIdAsync(createDto.OrganizerId);
                if (organizer == null)
                {
                    throw new KeyNotFoundException($"Organizer with ID {createDto.OrganizerId} not found.");
                }
            }

            // Validate date range
            if (createDto.StartDate >= createDto.EndDate)
            {
                throw new InvalidOperationException("Start date must be before end date.");
            }

            // Get organizer's university for auto-assignment
            var organizerEntity = await _organizerRepository.GetByIdAsync(createDto.OrganizerId);
            
            var evt = new Event
            {
                Title = createDto.Title,
                Description = createDto.Description,
                Organizer = createDto.Organizer,
                StartDate = createDto.StartDate,
                EndDate = createDto.EndDate,
                OrganizerId = createDto.OrganizerId,
                UniversityId = organizerEntity?.UniversityId // Auto-assign university from organizer
            };

            var createdEvent = await _eventRepository.AddAsync(evt);
            
            // Reload with related data
            var eventWithData = await _eventRepository.GetByIdAsync(createdEvent.EventId);
            return await MapToDtoAsync(eventWithData!);
        }

        public async Task<EventDto> UpdateEventAsync(Guid id, UpdateEventDto updateDto)
        {
            var evt = await _eventRepository.GetByIdAsync(id);
            if (evt == null)
            {
                throw new KeyNotFoundException($"Event with ID {id} not found.");
            }

            // Validate organizer if provided
            if (updateDto.OrganizerId != Guid.Empty)
            {
                var organizer = await _organizerRepository.GetByIdAsync(updateDto.OrganizerId);
                if (organizer == null)
                {
                    throw new KeyNotFoundException($"Organizer with ID {updateDto.OrganizerId} not found.");
                }
            }

            // Validate date range
            if (updateDto.StartDate >= updateDto.EndDate)
            {
                throw new InvalidOperationException("Start date must be before end date.");
            }

            evt.Title = updateDto.Title;
            evt.Description = updateDto.Description;
            evt.Organizer = updateDto.Organizer;
            evt.StartDate = updateDto.StartDate;
            evt.EndDate = updateDto.EndDate;
            evt.OrganizerId = updateDto.OrganizerId;

            var updatedEvent = await _eventRepository.UpdateAsync(evt);
            
            // Reload with related data
            var eventWithData = await _eventRepository.GetByIdAsync(updatedEvent.EventId);
            return await MapToDtoAsync(eventWithData!);
        }

        public async Task DeleteEventAsync(Guid id)
        {
            var evt = await _eventRepository.GetByIdAsync(id);
            if (evt == null)
            {
                throw new KeyNotFoundException($"Event with ID {id} not found.");
            }

            // Check if event has sessions or student registrations
            if (evt.EventSessions.Any() || evt.StudentInEvents.Any())
            {
                throw new InvalidOperationException("Cannot delete event that has sessions or student registrations.");
            }

            await _eventRepository.DeleteAsync(evt);
        }

        public async Task<EventDto?> GetEventWithSessionsAsync(Guid eventId)
        {
            var evt = await _eventRepository.GetWithSessionsAsync(eventId);
            return evt != null ? await MapToDtoAsync(evt) : null;
        }

        public async Task<EventDto?> GetEventWithStudentsAsync(Guid eventId)
        {
            var evt = await _eventRepository.GetWithStudentsAsync(eventId);
            return evt != null ? await MapToDtoAsync(evt) : null;
        }

        private async Task<EventDto> MapToDtoAsync(Event evt)
        {
            var totalRegistrations = await _studentInEventRepository.GetRegistrationCountAsync(evt.EventId);
            var totalAttendees = await _studentInEventRepository.GetAttendeeCountAsync(evt.EventId);

            return new EventDto
            {
                EventId = evt.EventId,
                Title = evt.Title,
                Description = evt.Description,
                Organizer = evt.Organizer,
                StartDate = evt.StartDate,
                EndDate = evt.EndDate,
                OrganizerId = evt.OrganizerId,
                UniversityId = evt.UniversityId,
                Sessions = evt.EventSessions?.Select(es => new EventSessionDto
                {
                    SessionId = es.SessionId,
                    EventId = es.EventId,
                    Title = es.Title,
                    StartTime = es.StartTime,
                    EndTime = es.EndTime,
                    Location = es.Location,
                    CheckinStartTime = es.CheckinStartTime,
                    CheckinEndTime = es.CheckinEndTime,
                    EventTitle = evt.Title,
                    TotalCheckIns = es.SessionCheckIns?.Count ?? 0
                }).ToList() ?? new List<EventSessionDto>(),
                TotalRegistrations = totalRegistrations,
                TotalAttendees = totalAttendees
            };
        }
    }
}
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Student_Attendance_System.DTOs;
using Student_Attendance_System.Services;
using Student_Attendance_System.Services.Interfaces;

namespace Student_Attendance_System.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class EventController : ControllerBase
    {
        private readonly IEventService _eventService;

        public EventController(IEventService eventService)
        {
            _eventService = eventService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<EventDto>>> GetAllEvents()
        {
            try
            {
                var events = await _eventService.GetAllEventsAsync();
                return Ok(events);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving events.", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<EventDto>> GetEvent(Guid id)
        {
            try
            {
                var eventDto = await _eventService.GetEventByIdAsync(id);
                if (eventDto == null)
                {
                    return NotFound(new { message = $"Event with ID {id} not found." });
                }
                return Ok(eventDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving the event.", error = ex.Message });
            }
        }

        [HttpGet("by-organizer/{organizerId}")]
        public async Task<ActionResult<IEnumerable<EventDto>>> GetEventsByOrganizer(Guid organizerId)
        {
            try
            {
                var events = await _eventService.GetEventsByOrganizerIdAsync(organizerId);
                return Ok(events);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving events.", error = ex.Message });
            }
        }

        [HttpGet("by-university/{universityId}")]
        public async Task<ActionResult<IEnumerable<EventDto>>> GetEventsByUniversity(Guid universityId)
        {
            try
            {
                var events = await _eventService.GetEventsByUniversityIdAsync(universityId);
                return Ok(events);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving events by university.", error = ex.Message });
            }
        }

        [HttpGet("by-organizer")]
        public async Task<ActionResult<IEnumerable<EventDto>>> GetEventsByOrganizer([FromQuery] string organizer)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(organizer))
                {
                    return BadRequest(new { message = "Organizer parameter cannot be empty." });
                }

                var events = await _eventService.GetEventsByOrganizerAsync(organizer);
                return Ok(events);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving events.", error = ex.Message });
            }
        }

        [HttpGet("by-date-range")]
        public async Task<ActionResult<IEnumerable<EventDto>>> GetEventsByDateRange([FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {
            try
            {
                if (startDate >= endDate)
                {
                    return BadRequest(new { message = "Start date must be before end date." });
                }

                var events = await _eventService.GetEventsByDateRangeAsync(startDate, endDate);
                return Ok(events);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving events.", error = ex.Message });
            }
        }

        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<EventDto>>> SearchEvents([FromQuery] string searchTerm)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(searchTerm))
                {
                    return BadRequest(new { message = "Search term cannot be empty." });
                }

                var events = await _eventService.SearchEventsAsync(searchTerm);
                return Ok(events);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while searching events.", error = ex.Message });
            }
        }

        [HttpGet("{id}/with-sessions")]
        public async Task<ActionResult<EventDto>> GetEventWithSessions(Guid id)
        {
            try
            {
                var eventDto = await _eventService.GetEventWithSessionsAsync(id);
                if (eventDto == null)
                {
                    return NotFound(new { message = $"Event with ID {id} not found." });
                }
                return Ok(eventDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving the event with sessions.", error = ex.Message });
            }
        }

        [HttpGet("{id}/with-students")]
        public async Task<ActionResult<EventDto>> GetEventWithStudents(Guid id)
        {
            try
            {
                var eventDto = await _eventService.GetEventWithStudentsAsync(id);
                if (eventDto == null)
                {
                    return NotFound(new { message = $"Event with ID {id} not found." });
                }
                return Ok(eventDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving the event with students.", error = ex.Message });
            }
        }

        [HttpPost]
        [Authorize(Roles = "admin,organizer")]
        public async Task<ActionResult<EventDto>> CreateEvent([FromBody] CreateEventDto createDto)
        {
            var claims = User.Claims.Select(c => $"{c.Type}: {c.Value}").ToList();
            Console.WriteLine("User claims: " + string.Join(", ", claims));
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var eventDto = await _eventService.CreateEventAsync(createDto);
                return CreatedAtAction(nameof(GetEvent), new { id = eventDto.EventId }, eventDto);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while creating the event.", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
    [Authorize(Roles = "admin,organizer")]
        public async Task<ActionResult<EventDto>> UpdateEvent(Guid id, [FromBody] UpdateEventDto updateDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var eventDto = await _eventService.UpdateEventAsync(id, updateDto);
                return Ok(eventDto);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while updating the event.", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
    [Authorize(Roles = "admin,organizer")]
        public async Task<IActionResult> DeleteEvent(Guid id)
        {
            try
            {
                await _eventService.DeleteEventAsync(id);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while deleting the event.", error = ex.Message });
            }
        }
    }
}
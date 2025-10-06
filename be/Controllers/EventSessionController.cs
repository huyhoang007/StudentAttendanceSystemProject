using Microsoft.AspNetCore.Mvc;
using Student_Attendance_System.DTOs;
using Student_Attendance_System.Services;
using Student_Attendance_System.Services.Interfaces;

namespace Student_Attendance_System.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EventSessionController : ControllerBase
    {
        private readonly IEventSessionService _sessionService;

        public EventSessionController(IEventSessionService sessionService)
        {
            _sessionService = sessionService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<EventSessionDto>>> GetAllSessions()
        {
            try
            {
                var sessions = await _sessionService.GetAllSessionsAsync();
                return Ok(sessions);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving sessions.", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<EventSessionDto>> GetSession(Guid id)
        {
            try
            {
                var session = await _sessionService.GetSessionByIdAsync(id);
                if (session == null)
                {
                    return NotFound(new { message = $"Session with ID {id} not found." });
                }
                return Ok(session);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving the session.", error = ex.Message });
            }
        }

        [HttpGet("by-date-range")]
        public async Task<ActionResult<IEnumerable<EventSessionDto>>> GetSessionsByDateRange([FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {
            try
            {
                if (startDate >= endDate)
                {
                    return BadRequest(new { message = "Start date must be before end date." });
                }

                var sessions = await _sessionService.GetSessionsByDateRangeAsync(startDate, endDate);
                return Ok(sessions);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving sessions.", error = ex.Message });
            }
        }

        [HttpGet("{id}/with-checkins")]
        public async Task<ActionResult<EventSessionDto>> GetSessionWithCheckIns(Guid id)
        {
            try
            {
                var session = await _sessionService.GetSessionWithCheckInsAsync(id);
                if (session == null)
                {
                    return NotFound(new { message = $"Session with ID {id} not found." });
                }
                return Ok(session);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving the session with check-ins.", error = ex.Message });
            }
        }

        [HttpGet("by-event/{eventId}")]
        public async Task<ActionResult<IEnumerable<EventSessionDto>>> GetSessionsByEvent(Guid eventId)
        {
            try
            {
                var sessions = await _sessionService.GetSessionsByEventIdAsync(eventId);
                return Ok(sessions);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving sessions for the event.", error = ex.Message });
            }
        }

        [HttpPost]
        public async Task<ActionResult<EventSessionDto>> CreateSession([FromBody] CreateEventSessionDto createDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var session = await _sessionService.CreateSessionAsync(createDto);
                return CreatedAtAction(nameof(GetSession), new { id = session.SessionId }, session);
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
                return StatusCode(500, new { message = "An error occurred while creating the session.", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<EventSessionDto>> UpdateSession(Guid id, [FromBody] UpdateEventSessionDto updateDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var session = await _sessionService.UpdateSessionAsync(id, updateDto);
                return Ok(session);
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
                return StatusCode(500, new { message = "An error occurred while updating the session.", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSession(Guid id)
        {
            try
            {
                await _sessionService.DeleteSessionAsync(id);
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
                return StatusCode(500, new { message = "An error occurred while deleting the session.", error = ex.Message });
            }
        }
    }
}
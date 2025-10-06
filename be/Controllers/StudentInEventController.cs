using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Student_Attendance_System.DTOs;
using Student_Attendance_System.Services.Interfaces;

namespace Student_Attendance_System.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StudentInEventController : ControllerBase
    {
        private readonly IStudentInEventService _studentInEventService;

        public StudentInEventController(IStudentInEventService studentInEventService)
        {
            _studentInEventService = studentInEventService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<StudentInEventDto>>> GetAllStudentInEvents()
        {
            try
            {
                var studentInEvents = await _studentInEventService.GetAllStudentInEventsAsync();
                return Ok(studentInEvents);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving student in events.", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<StudentInEventDto>> GetStudentInEvent(Guid id)
        {
            try
            {
                var studentInEvent = await _studentInEventService.GetStudentInEventByIdAsync(id);
                if (studentInEvent == null)
                {
                    return NotFound(new { message = $"StudentInEvent with ID {id} not found." });
                }
                return Ok(studentInEvent);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving the student in event.", error = ex.Message });
            }
        }

        [HttpGet("by-event/{eventId}")]
        public async Task<ActionResult<IEnumerable<StudentInEventDto>>> GetStudentsByEvent(Guid eventId)
        {
            try
            {
                var students = await _studentInEventService.GetStudentsByEventIdAsync(eventId);
                return Ok(students);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving students for the event.", error = ex.Message });
            }
        }

        [HttpGet("by-student/{studentId}")]
        public async Task<ActionResult<IEnumerable<StudentInEventDto>>> GetEventsByStudent(Guid studentId)
        {
            try
            {
                var events = await _studentInEventService.GetEventsByStudentIdAsync(studentId);
                return Ok(events);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving events for the student.", error = ex.Message });
            }
        }

        [HttpPost]
        [Authorize(Roles = "admin,organizer")]
        public async Task<ActionResult<StudentInEventDto>> AddStudentToEvent([FromBody] CreateStudentInEventDto createDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var studentInEvent = await _studentInEventService.AddStudentToEventAsync(createDto);
                return CreatedAtAction(nameof(GetStudentInEvent), new { id = studentInEvent.StudentInEventId }, studentInEvent);
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
                return StatusCode(500, new { message = "An error occurred while adding student to event.", error = ex.Message });
            }
        }

        [HttpPost("batch")]
        [Authorize(Roles = "admin,organizer")]
        public async Task<ActionResult<IEnumerable<StudentInEventDto>>> AddMultipleStudentsToEvent([FromBody] BatchAddStudentsDto batchDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var studentInEvents = await _studentInEventService.AddMultipleStudentsToEventAsync(batchDto);
                return Ok(studentInEvents);
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
                return StatusCode(500, new { message = "An error occurred while adding students to event.", error = ex.Message });
            }
        }

        [HttpPut("{id}/status")]
        [Authorize(Roles = "admin,organizer")]
        public async Task<ActionResult<StudentInEventDto>> UpdateStudentStatus(Guid id, [FromBody] UpdateStudentStatusDto statusDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var updatedStudent = await _studentInEventService.UpdateStudentStatusAsync(id, statusDto.Status);
                return Ok(updatedStudent);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while updating student status.", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "admin,organizer")]
        public async Task<IActionResult> RemoveStudentFromEvent(Guid id)
        {
            try
            {
                await _studentInEventService.RemoveStudentFromEventAsync(id);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while removing student from event.", error = ex.Message });
            }
        }

        [HttpPost("import-csv/{eventId}")]
        [Authorize(Roles = "admin,organizer")]
        public async Task<ActionResult<ImportResultDto>> ImportStudentsFromCsv(Guid eventId, IFormFile csvFile)
        {
            try
            {
                if (csvFile == null || csvFile.Length == 0)
                {
                    return BadRequest(new { message = "CSV file is required." });
                }

                var result = await _studentInEventService.ImportStudentsFromCsvAsync(eventId, csvFile);
                return Ok(result);
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
                return StatusCode(500, new { message = "An error occurred while importing students.", error = ex.Message });
            }
        }
    }
}
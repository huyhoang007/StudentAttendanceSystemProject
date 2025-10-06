using Microsoft.AspNetCore.Mvc;
using Student_Attendance_System.DTOs;
using Student_Attendance_System.Services;
using Student_Attendance_System.Services.Interfaces;

namespace Student_Attendance_System.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RegistrationController : ControllerBase
    {
        private readonly IStudentInEventService _registrationService;

        public RegistrationController(IStudentInEventService registrationService)
        {
            _registrationService = registrationService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<StudentInEventDto>>> GetAllRegistrations()
        {
            try
            {
                var registrations = await _registrationService.GetAllRegistrationsAsync();
                return Ok(registrations);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving registrations.", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<StudentInEventDto>> GetRegistration(Guid id)
        {
            try
            {
                var registration = await _registrationService.GetRegistrationByIdAsync(id);
                if (registration == null)
                {
                    return NotFound(new { message = $"Registration with ID {id} not found." });
                }
                return Ok(registration);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving the registration.", error = ex.Message });
            }
        }

        [HttpGet("by-event/{eventId}")]
        public async Task<ActionResult<IEnumerable<StudentInEventDto>>> GetRegistrationsByEvent(Guid eventId)
        {
            try
            {
                var registrations = await _registrationService.GetRegistrationsByEventIdAsync(eventId);
                return Ok(registrations);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving registrations.", error = ex.Message });
            }
        }

        [HttpGet("by-student/{studentId}")]
        public async Task<ActionResult<IEnumerable<StudentInEventDto>>> GetRegistrationsByStudent(Guid studentId)
        {
            try
            {
                var registrations = await _registrationService.GetEventsByStudentIdAsync(studentId);
                return Ok(registrations);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving registrations by student.", error = ex.Message });
            }
        }

        [HttpGet("by-user/{userId}")]
        public async Task<ActionResult<IEnumerable<StudentInEventDto>>> GetRegistrationsByUser(Guid userId)
        {
            try
            {
                var registrations = await _registrationService.GetEventsByUserIdAsync(userId);
                return Ok(registrations);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving registrations by user.", error = ex.Message });
            }
        }

        [HttpGet("by-student-code/{studentCode}")]
        public async Task<ActionResult<IEnumerable<StudentInEventDto>>> GetRegistrationsByStudentCode(string studentCode)
        {
            try
            {
                var registrations = await _registrationService.GetRegistrationsByStudentCodeAsync(studentCode);
                return Ok(registrations);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving registrations by student code.", error = ex.Message });
            }
        }

        [HttpPost("register")]
        public async Task<ActionResult<StudentInEventDto>> RegisterStudent([FromBody] RegisterStudentInEventDto registerDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var registration = await _registrationService.RegisterStudentAsync(registerDto);
                return CreatedAtAction(nameof(GetRegistration), new { id = registration.StudentInEventId }, registration);
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
                return StatusCode(500, new { message = "An error occurred while registering the student.", error = ex.Message });
            }
        }

        [HttpPost("bulk-register")]
        public async Task<ActionResult<IEnumerable<StudentInEventDto>>> BulkRegisterStudents([FromBody] BulkRegisterStudentsDto bulkDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var registrations = await _registrationService.BulkRegisterStudentsAsync(bulkDto);
                return Ok(new { message = "Bulk registration completed successfully.", registrations });
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
                return StatusCode(500, new { message = "An error occurred while bulk registering students.", error = ex.Message });
            }
        }

        [HttpPut("{id}/status")]
        public async Task<ActionResult<StudentInEventDto>> UpdateRegistrationStatus(Guid id, [FromBody] UpdateStudentEventStatusDto updateDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var registration = await _registrationService.UpdateRegistrationStatusAsync(id, updateDto);
                return Ok(registration);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while updating the registration status.", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRegistration(Guid id)
        {
            try
            {
                await _registrationService.DeleteRegistrationAsync(id);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while deleting the registration.", error = ex.Message });
            }
        }

        [HttpGet("check-registration")]
        public async Task<ActionResult<bool>> CheckStudentRegistration([FromQuery] Guid eventId, [FromQuery] Guid studentId)
        {
            try
            {
                var isRegistered = await _registrationService.IsStudentRegisteredAsync(eventId, studentId.ToString());
                return Ok(new { isRegistered });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while checking registration status.", error = ex.Message });
            }
        }

        [HttpGet("check/{eventId}/{studentCode}")]
        public async Task<ActionResult<bool>> CheckStudentRegistrationByCode(Guid eventId, string studentCode)
        {
            try
            {
                var isRegistered = await _registrationService.IsStudentRegisteredByCodeAsync(eventId, studentCode);
                return Ok(isRegistered);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while checking registration status.", error = ex.Message });
            }
        }
    }
}
using Microsoft.AspNetCore.Mvc;
using Student_Attendance_System.DTOs;
using Student_Attendance_System.Services;
using Student_Attendance_System.Services.Interfaces;

namespace Student_Attendance_System.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CheckInController : ControllerBase
    {
        private readonly ISessionCheckInService _checkInService;

        public CheckInController(ISessionCheckInService checkInService)
        {
            _checkInService = checkInService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<SessionCheckInDto>>> GetAllCheckIns()
        {
            try
            {
                var checkIns = await _checkInService.GetAllCheckInsAsync();
                return Ok(checkIns);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving check-ins.", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<SessionCheckInDto>> GetCheckIn(Guid id)
        {
            try
            {
                var checkIn = await _checkInService.GetCheckInByIdAsync(id);
                if (checkIn == null)
                {
                    return NotFound(new { message = $"Check-in with ID {id} not found." });
                }
                return Ok(checkIn);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving the check-in.", error = ex.Message });
            }
        }

        [HttpGet("by-session/{sessionId}")]
        public async Task<ActionResult<IEnumerable<SessionCheckInDto>>> GetCheckInsBySession(Guid sessionId)
        {
            try
            {
                var checkIns = await _checkInService.GetCheckInsBySessionIdAsync(sessionId);
                return Ok(checkIns);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving check-ins.", error = ex.Message });
            }
        }

        [HttpGet("by-student/{studentId}")]
        public async Task<ActionResult<IEnumerable<SessionCheckInDto>>> GetCheckInsByStudent(Guid studentId)
        {
            try
            {
                var checkIns = await _checkInService.GetCheckInsByStudentInEventIdAsync(studentId);
                return Ok(checkIns);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving check-ins.", error = ex.Message });
            }
        }

        [HttpGet("by-event/{eventId}")]
        public async Task<ActionResult<IEnumerable<SessionCheckInDto>>> GetCheckInsByEvent(Guid eventId)
        {
            try
            {
                var checkIns = await _checkInService.GetCheckInsByEventIdAsync(eventId);
                return Ok(checkIns);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving check-ins.", error = ex.Message });
            }
        }

        [HttpPost]
        public async Task<ActionResult<SessionCheckInDto>> CreateCheckIn([FromBody] CreateCheckInDto createDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var checkIn = await _checkInService.CreateCheckInAsync(createDto);
                return CreatedAtAction(nameof(GetCheckIn), new { id = checkIn.CheckinId }, checkIn);
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
                return StatusCode(500, new { message = "An error occurred while creating the check-in.", error = ex.Message });
            }
        }

        [HttpPost("qr-checkin")]
        public async Task<ActionResult<SessionCheckInDto>> QRCheckIn([FromBody] QRCheckInDto qrDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var checkIn = await _checkInService.QRCheckInAsync(qrDto);
                return CreatedAtAction(nameof(GetCheckIn), new { id = checkIn.CheckinId }, checkIn);
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
                return StatusCode(500, new { message = "An error occurred while processing QR check-in.", error = ex.Message });
            }
        }

        [HttpPost("bulk-checkin")]
        public async Task<ActionResult<IEnumerable<SessionCheckInDto>>> BulkCheckIn([FromBody] BulkCheckInDto bulkDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var checkIns = await _checkInService.BulkCheckInAsync(bulkDto);
                return Ok(new { message = "Bulk check-in completed successfully.", checkIns });
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
                return StatusCode(500, new { message = "An error occurred while processing bulk check-in.", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCheckIn(Guid id)
        {
            try
            {
                await _checkInService.DeleteCheckInAsync(id);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while deleting the check-in.", error = ex.Message });
            }
        }

        [HttpGet("check-status")]
        public async Task<ActionResult<bool>> CheckStudentCheckInStatus([FromQuery] Guid sessionId, [FromQuery] Guid studentId)
        {
            try
            {
                var isCheckedIn = await _checkInService.IsStudentCheckedInAsync(sessionId, studentId);
                return Ok(new { isCheckedIn });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while checking check-in status.", error = ex.Message });
            }
        }
    }
}
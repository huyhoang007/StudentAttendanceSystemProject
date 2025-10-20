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
                Console.WriteLine($"[DEBUG] Checking status for Session: {sessionId}, Student: {studentId}");

                // Get all check-ins for the session
                var sessionCheckIns = await _checkInService.GetCheckInsBySessionIdAsync(sessionId);

                // Kiểm tra và log số lượng check-in
                Console.WriteLine($"[DEBUG] Found {sessionCheckIns.Count()} check-ins for session");
                foreach (var checkIn in sessionCheckIns)
                {
                    Console.WriteLine($"[DEBUG] Check-in DTO: StudentCode={checkIn.StudentCode}, StudentId={checkIn.StudentId}, StudentInEventId={checkIn.StudentInEventId}");
                }

                // Try to match by StudentId (preferred) or fallback to StudentCode if necessary
                SessionCheckInDto? studentCheckin = sessionCheckIns.FirstOrDefault(c =>
                    (c.StudentId.HasValue && c.StudentId.Value == studentId));

                if (studentCheckin == null)
                {
                    // Fallback: some clients might pass a student identifier string in StudentCode
                    var studentIdString = studentId.ToString();
                    studentCheckin = sessionCheckIns.FirstOrDefault(c =>
                        !string.IsNullOrEmpty(c.StudentCode) && c.StudentCode.Equals(studentIdString, StringComparison.OrdinalIgnoreCase));
                }

                var isCheckedIn = studentCheckin != null;

                Console.WriteLine($"[DEBUG] Check-in status: {isCheckedIn}");
                if (isCheckedIn && studentCheckin != null)
                {
                    Console.WriteLine($"[DEBUG] Found check-in details: Time={studentCheckin.CheckinTime}, Method={studentCheckin.Method}");
                }

                return Ok(new
                {
                    isCheckedIn,
                    sessionId,
                    studentId,
                    checkInDetails = studentCheckin,
                    timestamp = DateTime.UtcNow
                });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERROR] Failed to check status: {ex.Message}");
                Console.WriteLine($"[ERROR] Stack trace: {ex.StackTrace}");
                return StatusCode(500, new { message = "An error occurred while checking check-in status.", error = ex.Message });
            }
        }
    }
}
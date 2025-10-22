using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Student_Attendance_System.DTOs;
using Student_Attendance_System.Services.Interfaces;
using System.Security.Claims;

namespace Student_Attendance_System.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class OrganizersController : ControllerBase
    {
        private readonly IOrganizerService _organizerService;

        public OrganizersController(IOrganizerService organizerService)
        {
            _organizerService = organizerService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<OrganizerDto>>> GetAllOrganizers()
        {
            try
            {
                var organizers = await _organizerService.GetAllOrganizersAsync();
                return Ok(organizers);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<OrganizerDto>> GetOrganizer(Guid id)
        {
            try
            {
                var organizer = await _organizerService.GetOrganizerByIdAsync(id);
                if (organizer == null)
                {
                    return NotFound("Organizer not found");
                }
                return Ok(organizer);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpGet("user/{userId}")]
        public async Task<ActionResult<OrganizerDto>> GetOrganizerByUserId(Guid userId)
        {
            try
            {
                var organizer = await _organizerService.GetOrganizerByUserIdAsync(userId);
                if (organizer == null)
                {
                    return NotFound("Organizer not found for this user");
                }
                return Ok(organizer);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpGet("organization/{organization}")]
        public async Task<ActionResult<IEnumerable<OrganizerDto>>> GetOrganizersByOrganization(string organization)
        {
            try
            {
                var organizers = await _organizerService.GetOrganizersByOrganizationAsync(organization);
                return Ok(organizers);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpPost]
        public async Task<ActionResult<OrganizerDto>> CreateOrganizer([FromBody] CreateOrganizerDto createDto)
        {
            try
            {
                var organizer = await _organizerService.CreateOrganizerAsync(createDto);
                return CreatedAtAction(nameof(GetOrganizer), new { id = organizer.OrganizerId }, organizer);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<OrganizerDto>> UpdateOrganizer(Guid id, [FromBody] UpdateOrganizerDto updateDto)
        {
            try
            {
                var organizer = await _organizerService.UpdateOrganizerAsync(id, updateDto);
                if (organizer == null)
                {
                    return NotFound("Organizer not found");
                }
                return Ok(organizer);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteOrganizer(Guid id)
        {
            try
            {
                var result = await _organizerService.DeleteOrganizerAsync(id);
                if (!result)
                {
                    return NotFound("Organizer not found");
                }
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpPut("me/profile")]
        [Consumes("application/json")]
        public async Task<ActionResult<OrganizerDto>> UpdateProfile([FromBody] UpdateOrganizerProfileDto profileDto)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null || string.IsNullOrEmpty(userIdClaim.Value))
                {
                    return BadRequest(new { message = "User ID not found in token" });
                }

                if (!Guid.TryParse(userIdClaim.Value, out Guid userId))
                {
                    return BadRequest(new { message = "Invalid user ID format" });
                }

                Console.WriteLine($"Found user ID in token: {userId}");

                var organizer = await _organizerService.GetOrganizerByUserIdAsync(userId);
                if (organizer == null)
                {
                    return NotFound(new { message = "Organizer profile not found" });
                }

                if (string.IsNullOrWhiteSpace(profileDto.OrganizerName))
                {
                    return BadRequest(new { message = "Organizer Name is required" });
                }

                var updatedOrganizer = await _organizerService.UpdateOrganizerProfileAsync(organizer.OrganizerId, profileDto);
                return Ok(updatedOrganizer);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }
    }
}
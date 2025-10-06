using Microsoft.AspNetCore.Mvc;
using Student_Attendance_System.DTOs;
using Student_Attendance_System.Services;
using Student_Attendance_System.Services.Interfaces;

namespace Student_Attendance_System.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UniversityController : ControllerBase
    {
        private readonly IUniversityService _universityService;

        public UniversityController(IUniversityService universityService)
        {
            _universityService = universityService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<UniversityDto>>> GetAllUniversities()
        {
            try
            {
                var universities = await _universityService.GetAllUniversitiesAsync();
                return Ok(universities);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving universities.", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<UniversityDto>> GetUniversity(Guid id)
        {
            try
            {
                var university = await _universityService.GetUniversityByIdAsync(id);
                if (university == null)
                {
                    return NotFound(new { message = $"University with ID {id} not found." });
                }
                return Ok(university);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving the university.", error = ex.Message });
            }
        }

        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<UniversityDto>>> SearchUniversities([FromQuery] string searchTerm)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(searchTerm))
                {
                    return BadRequest(new { message = "Search term cannot be empty." });
                }

                var universities = await _universityService.SearchUniversitiesAsync(searchTerm);
                return Ok(universities);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while searching universities.", error = ex.Message });
            }
        }

        [HttpPost]
        public async Task<ActionResult<UniversityDto>> CreateUniversity([FromBody] CreateUniversityDto createDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var university = await _universityService.CreateUniversityAsync(createDto);
                return CreatedAtAction(nameof(GetUniversity), new { id = university.UniversityId }, university);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while creating the university.", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<UniversityDto>> UpdateUniversity(Guid id, [FromBody] UpdateUniversityDto updateDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var university = await _universityService.UpdateUniversityAsync(id, updateDto);
                return Ok(university);
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
                return StatusCode(500, new { message = "An error occurred while updating the university.", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUniversity(Guid id)
        {
            try
            {
                await _universityService.DeleteUniversityAsync(id);
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
                return StatusCode(500, new { message = "An error occurred while deleting the university.", error = ex.Message });
            }
        }
    }
}

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Student_Attendance_System.DTOs;
using Student_Attendance_System.Services.Interfaces;

namespace Student_Attendance_System.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AdminsController : ControllerBase
    {
        private readonly IAdminService _adminService;

        public AdminsController(IAdminService adminService)
        {
            _adminService = adminService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<AdminDto>>> GetAllAdmins()
        {
            try
            {
                var admins = await _adminService.GetAllAdminsAsync();
                return Ok(admins);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<AdminDto>> GetAdmin(Guid id)
        {
            try
            {
                var admin = await _adminService.GetAdminByIdAsync(id);
                if (admin == null)
                {
                    return NotFound("Admin not found");
                }
                return Ok(admin);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpGet("user/{userId}")]
        public async Task<ActionResult<AdminDto>> GetAdminByUserId(Guid userId)
        {
            try
            {
                var admin = await _adminService.GetAdminByUserIdAsync(userId);
                if (admin == null)
                {
                    return NotFound("Admin not found for this user");
                }
                return Ok(admin);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpGet("department/{department}")]
        public async Task<ActionResult<IEnumerable<AdminDto>>> GetAdminsByDepartment(string department)
        {
            try
            {
                var admins = await _adminService.GetAdminsByDepartmentAsync(department);
                return Ok(admins);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpPost]
        public async Task<ActionResult<AdminDto>> CreateAdmin([FromBody] CreateAdminDto createDto)
        {
            try
            {
                var admin = await _adminService.CreateAdminAsync(createDto);
                return CreatedAtAction(nameof(GetAdmin), new { id = admin.AdminId }, admin);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<AdminDto>> UpdateAdmin(Guid id, [FromBody] UpdateAdminDto updateDto)
        {
            try
            {
                var admin = await _adminService.UpdateAdminAsync(id, updateDto);
                if (admin == null)
                {
                    return NotFound("Admin not found");
                }
                return Ok(admin);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteAdmin(Guid id)
        {
            try
            {
                var result = await _adminService.DeleteAdminAsync(id);
                if (!result)
                {
                    return NotFound("Admin not found");
                }
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }
    }
}
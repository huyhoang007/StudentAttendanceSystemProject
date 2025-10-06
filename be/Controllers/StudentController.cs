using Microsoft.AspNetCore.Mvc;
using Student_Attendance_System.DTOs;
using Student_Attendance_System.Services;
using Student_Attendance_System.Services.Interfaces;

namespace Student_Attendance_System.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StudentController : ControllerBase
    {
        private readonly IStudentService _studentService;

        public StudentController(IStudentService studentService)
        {
            _studentService = studentService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<StudentDto>>> GetAllStudents()
        {
            try
            {
                var students = await _studentService.GetAllStudentsAsync();
                return Ok(students);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving students.", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<StudentDto>> GetStudent(Guid id)
        {
            try
            {
                var student = await _studentService.GetStudentByIdAsync(id);
                if (student == null)
                {
                    return NotFound(new { message = $"Student with ID {id} not found." });
                }
                return Ok(student);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving the student.", error = ex.Message });
            }
        }

        [HttpGet("by-code/{studentCode}")]
        public async Task<ActionResult<StudentDto>> GetStudentByCode(string studentCode)
        {
            try
            {
                var student = await _studentService.GetStudentByStudentCodeAsync(studentCode);
                if (student == null)
                {
                    return NotFound(new { message = $"Student with code {studentCode} not found." });
                }
                return Ok(student);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving the student.", error = ex.Message });
            }
        }

        [HttpGet("by-email/{email}")]
        public async Task<ActionResult<StudentDto>> GetStudentByEmail(string email)
        {
            try
            {
                var student = await _studentService.GetStudentByEmailAsync(email);
                if (student == null)
                {
                    return NotFound(new { message = $"Student with email {email} not found." });
                }
                return Ok(student);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving the student.", error = ex.Message });
            }
        }

        [HttpGet("by-user/{userId}")]
        public async Task<ActionResult<StudentDto>> GetStudentByUserId(Guid userId)
        {
            try
            {
                var student = await _studentService.GetStudentByUserIdAsync(userId);
                if (student == null)
                {
                    return NotFound(new { message = $"Student with user ID {userId} not found." });
                }
                return Ok(student);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving the student.", error = ex.Message });
            }
        }

        [HttpGet("by-university/{universityId}")]
        public async Task<ActionResult<IEnumerable<StudentDto>>> GetStudentsByUniversity(Guid universityId)
        {
            try
            {
                var students = await _studentService.GetStudentsByUniversityIdAsync(universityId);
                return Ok(students);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving students.", error = ex.Message });
            }
        }

        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<StudentDto>>> SearchStudents([FromQuery] string searchTerm)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(searchTerm))
                {
                    return BadRequest(new { message = "Search term cannot be empty." });
                }

                var students = await _studentService.SearchStudentsAsync(searchTerm);
                return Ok(students);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while searching students.", error = ex.Message });
            }
        }

        [HttpPost]
        public async Task<ActionResult<StudentDto>> CreateStudent([FromBody] CreateStudentDto createDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var student = await _studentService.CreateStudentAsync(createDto);
                return CreatedAtAction(nameof(GetStudent), new { id = student.StudentId }, student);
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
                return StatusCode(500, new { message = "An error occurred while creating the student.", error = ex.Message });
            }
        }

        [HttpPost("import")]
        public async Task<ActionResult<IEnumerable<StudentDto>>> ImportStudents([FromBody] List<ImportStudentDto> importDtos)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var students = await _studentService.ImportStudentsAsync(importDtos);
                return Ok(new { message = "Students imported successfully.", students });
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

        [HttpPost("import-file")]
        public async Task<ActionResult<StudentImportResultDto>> ImportStudentsFromFile(IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                {
                    return BadRequest(new { message = "Please select a file to upload." });
                }

                var allowedExtensions = new[] { ".xlsx", ".xls", ".csv" };
                var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
                
                if (!allowedExtensions.Contains(fileExtension))
                {
                    return BadRequest(new { message = "Only Excel (.xlsx, .xls) and CSV (.csv) files are allowed." });
                }

                var result = await _studentService.ImportStudentsFromFileAsync(file);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while importing students from file.", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<StudentDto>> UpdateStudent(Guid id, [FromBody] UpdateStudentDto updateDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var student = await _studentService.UpdateStudentAsync(id, updateDto);
                return Ok(student);
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
                return StatusCode(500, new { message = "An error occurred while updating the student.", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteStudent(Guid id)
        {
            try
            {
                await _studentService.DeleteStudentAsync(id);
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
                return StatusCode(500, new { message = "An error occurred while deleting the student.", error = ex.Message });
            }
        }

        [HttpGet("check-code-unique")]
        public async Task<ActionResult<bool>> CheckStudentCodeUnique([FromQuery] string studentCode, [FromQuery] Guid? excludeStudentId = null)
        {
            try
            {
                var isUnique = await _studentService.IsStudentCodeUniqueAsync(studentCode, excludeStudentId);
                return Ok(new { isUnique });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while checking student code uniqueness.", error = ex.Message });
            }
        }

        [HttpGet("check-email-unique")]
        public async Task<ActionResult<bool>> CheckEmailUnique([FromQuery] string email, [FromQuery] Guid? excludeStudentId = null)
        {
            try
            {
                var isUnique = await _studentService.IsEmailUniqueAsync(email, excludeStudentId);
                return Ok(new { isUnique });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while checking email uniqueness.", error = ex.Message });
            }
        }
    }
}
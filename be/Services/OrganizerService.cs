using Student_Attendance_System.DTOs;
using Student_Attendance_System.Entities;
using Student_Attendance_System.Repositories;
using Student_Attendance_System.Services.Interfaces;

namespace Student_Attendance_System.Services
{
    public class OrganizerService : IOrganizerService
    {
        private readonly IOrganizerRepository _organizerRepository;
        private readonly IUserRepository _userRepository;

        public OrganizerService(IOrganizerRepository organizerRepository, IUserRepository userRepository)
        {
            _organizerRepository = organizerRepository;
            _userRepository = userRepository;
        }

        public async Task<IEnumerable<OrganizerDto>> GetAllOrganizersAsync()
        {
            var organizers = await _organizerRepository.GetAllAsync();
            return organizers.Select(MapToDto);
        }

        public async Task<OrganizerDto?> GetOrganizerByIdAsync(Guid organizerId)
        {
            var organizer = await _organizerRepository.GetByIdAsync(organizerId);
            return organizer != null ? MapToDto(organizer) : null;
        }

        public async Task<OrganizerDto?> GetOrganizerByUserIdAsync(Guid userId)
        {
            var organizer = await _organizerRepository.GetByUserIdAsync(userId);
            return organizer != null ? MapToDto(organizer) : null;
        }

        public async Task<IEnumerable<OrganizerDto>> GetOrganizersByOrganizationAsync(string organization)
        {
            var organizers = await _organizerRepository.GetByOrganizationAsync(organization);
            return organizers.Select(MapToDto);
        }

        public async Task<OrganizerDto> CreateOrganizerAsync(CreateOrganizerDto createDto)
        {
            var organizer = new Organizer
            {
                UserId = createDto.UserId,
                OrganizerName = createDto.OrganizerName,
                Organization = createDto.Organization,
                Phone = createDto.Phone,
                Role = "organizer"
            };

            await _organizerRepository.AddAsync(organizer);

            var createdOrganizer = await _organizerRepository.GetByIdAsync(organizer.OrganizerId);
            return MapToDto(createdOrganizer!);
        }

        public async Task<OrganizerDto?> UpdateOrganizerAsync(Guid organizerId, UpdateOrganizerDto updateDto)
        {
            var organizer = await _organizerRepository.GetByIdAsync(organizerId);
            if (organizer == null) return null;

            organizer.OrganizerName = updateDto.OrganizerName;
            organizer.Organization = updateDto.Organization;
            organizer.Phone = updateDto.Phone;
            organizer.UniversityId = updateDto.UniversityId;

            await _organizerRepository.UpdateAsync(organizer);

            return MapToDto(organizer);
        }

        public async Task<bool> DeleteOrganizerAsync(Guid organizerId)
        {
            var organizer = await _organizerRepository.GetByIdAsync(organizerId);
            if (organizer == null) return false;

            await _organizerRepository.DeleteAsync(organizer);
            return true;
        }

        public async Task<OrganizerDto?> UpdateOrganizerProfileAsync(Guid organizerId, UpdateOrganizerProfileDto profileDto)
        {
            var organizer = await _organizerRepository.GetByIdAsync(organizerId);
            if (organizer == null) return null;

            // Update organizer information
            organizer.OrganizerName = profileDto.OrganizerName;
            organizer.Organization = profileDto.Organization;
            organizer.Phone = profileDto.Phone;
            // UniversityId is not updated as it should be fixed

            await _organizerRepository.UpdateAsync(organizer);

            // Get updated organizer with related data
            organizer = await _organizerRepository.GetByIdAsync(organizerId);
            return organizer != null ? MapToDto(organizer) : null;
        }

        private static OrganizerDto MapToDto(Organizer organizer)
        {
            return new OrganizerDto
            {
                OrganizerId = organizer.OrganizerId,
                UserId = organizer.UserId,
                OrganizerName = organizer.OrganizerName,
                Organization = organizer.Organization,
                Phone = organizer.Phone,
                Role = organizer.Role,
                Username = organizer.User?.Username,
                Email = organizer.User?.Email,
                UniversityId = organizer.UniversityId,
                University = organizer.University != null ? new UniversityDto
                {
                    UniversityId = organizer.University.UniversityId,
                    Name = organizer.University.Name,
                    Address = organizer.University.Address,
                    ContactInfo = organizer.University.ContactInfo
                } : null
            };
        }
    }
}
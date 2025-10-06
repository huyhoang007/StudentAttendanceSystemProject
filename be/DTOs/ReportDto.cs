namespace Student_Attendance_System.DTOs
{
    public class ReportDto
    {
        public string Title { get; set; } = string.Empty;
        public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
        public string GeneratedBy { get; set; } = string.Empty;
        public object Data { get; set; } = null!;
    }

    public class EventAttendanceReportDto
    {
        public Guid EventId { get; set; }
        public string EventTitle { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int TotalRegistrations { get; set; }
        public int TotalAttendees { get; set; }
        public double AttendanceRate { get; set; }
        public List<SessionAttendanceDto> Sessions { get; set; } = new List<SessionAttendanceDto>();
        public List<StudentAttendanceDto> Students { get; set; } = new List<StudentAttendanceDto>();
    }

    public class SessionAttendanceDto
    {
        public Guid SessionId { get; set; }
        public string SessionTitle { get; set; } = string.Empty;
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public int CheckedInCount { get; set; }
        public int TotalRegistered { get; set; }
        public double AttendanceRate { get; set; }
    }

    public class StudentAttendanceDto
    {
        public Guid StudentId { get; set; }
        public string StudentName { get; set; } = string.Empty;
        public string StudentCode { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string UniversityName { get; set; } = string.Empty;
        public int SessionsAttended { get; set; }
        public int TotalSessions { get; set; }
        public double AttendanceRate { get; set; }
        public List<CheckInDetailDto> CheckIns { get; set; } = new List<CheckInDetailDto>();
    }

    public class CheckInDetailDto
    {
        public Guid SessionId { get; set; }
        public string SessionTitle { get; set; } = string.Empty;
        public DateTime? CheckinTime { get; set; }
        public bool IsPresent { get; set; }
        public string Method { get; set; } = string.Empty;
    }

    public class UniversityStatisticsDto
    {
        public Guid UniversityId { get; set; }
        public string UniversityName { get; set; } = string.Empty;
        public int TotalStudents { get; set; }
        public int TotalEvents { get; set; }
        public int TotalAttendances { get; set; }
        public double AverageAttendanceRate { get; set; }
    }

    public class DailyAttendanceStatisticsDto
    {
        public DateTime Date { get; set; }
        public int TotalEvents { get; set; }
        public int TotalSessions { get; set; }
        public int TotalCheckIns { get; set; }
        public int UniqueStudents { get; set; }
    }
}
# Student Attendance System API

## Mô tả
API quản lý điểm danh sinh viên cho Nhà văn hóa Sinh viên Đại học Quốc gia. Hệ thống hỗ trợ quản lý các sự kiện, phiên điểm danh, và theo dõi việc tham gia của sinh viên.

## Công nghệ sử dụng
- **Framework**: ASP.NET Core 8.0
- **Database**: PostgreSQL (Supabase)
- **ORM**: Entity Framework Core
- **Authentication**: JWT Bearer Token
- **Documentation**: Swagger/OpenAPI
- **Password Hashing**: BCrypt
- **PDF Generation**: iText7
- **Excel Export**: EPPlus

## Cấu trúc dự án

### Entities (Thực thể)
- **University**: Quản lý thông tin trường đại học
- **Student**: Quản lý thông tin sinh viên
- **Event**: Quản lý sự kiện
- **EventSession**: Quản lý phiên điểm danh của sự kiện
- **StudentInEvent**: Quản lý việc đăng ký tham gia sự kiện
- **SessionCheckIn**: Quản lý việc điểm danh thực tế
- **User**: Quản lý tài khoản người dùng

### Roles (Vai trò)
- **Admin**: Quản trị viên hệ thống
- **EventOrganizer**: Người tổ chức sự kiện
- **Student**: Sinh viên

## Cài đặt và chạy

### 1. Cấu hình Database
Cập nhật connection string trong `appsettings.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=your-supabase-host;Database=your-database-name;Username=your-username;Password=your-password;Port=5432;SSL Mode=Require;"
  }
}
```

### 2. Cấu hình JWT
Cập nhật JWT settings trong `appsettings.json`:
```json
{
  "JwtSettings": {
    "SecretKey": "your-very-secure-secret-key-that-should-be-at-least-32-characters-long",
    "Issuer": "StudentAttendanceSystem",
    "Audience": "StudentAttendanceUsers",
    "ExpiryMinutes": 1440
  }
}
```

### 3. Tạo Migration và Database
```bash
dotnet ef migrations add InitialCreate
dotnet ef database update
```

### 4. Chạy ứng dụng
```bash
dotnet run
```

### 5. Truy cập Swagger UI
Mở trình duyệt và truy cập: `https://localhost:7xxx/swagger`

## API Endpoints

### Authentication
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/register` - Đăng ký
- `GET /api/auth/profile` - Lấy thông tin profile
- `PUT /api/auth/profile` - Cập nhật profile
- `POST /api/auth/change-password` - Đổi mật khẩu
- `GET /api/auth/validate` - Kiểm tra token

### University Management
- `GET /api/university` - Lấy danh sách trường
- `POST /api/university` - Tạo trường mới
- `GET /api/university/{id}` - Lấy thông tin trường
- `PUT /api/university/{id}` - Cập nhật trường
- `DELETE /api/university/{id}` - Xóa trường

### Student Management
- `GET /api/student` - Lấy danh sách sinh viên
- `POST /api/student` - Tạo sinh viên mới
- `POST /api/student/bulk` - Tạo nhiều sinh viên
- `GET /api/student/{id}` - Lấy thông tin sinh viên
- `PUT /api/student/{id}` - Cập nhật sinh viên
- `DELETE /api/student/{id}` - Xóa sinh viên
- `GET /api/student/search` - Tìm kiếm sinh viên
- `GET /api/student/export` - Xuất Excel

### Event Management
- `GET /api/event` - Lấy danh sách sự kiện
- `POST /api/event` - Tạo sự kiện mới
- `GET /api/event/{id}` - Lấy thông tin sự kiện
- `PUT /api/event/{id}` - Cập nhật sự kiện
- `DELETE /api/event/{id}` - Xóa sự kiện
- `GET /api/event/{id}/sessions` - Lấy phiên điểm danh
- `GET /api/event/{id}/participants` - Lấy danh sách tham gia
- `GET /api/event/{id}/report` - Báo cáo PDF

### Event Session Management
- `GET /api/eventsession` - Lấy danh sách phiên
- `POST /api/eventsession` - Tạo phiên mới
- `GET /api/eventsession/{id}` - Lấy thông tin phiên
- `PUT /api/eventsession/{id}` - Cập nhật phiên
- `DELETE /api/eventsession/{id}` - Xóa phiên
- `GET /api/eventsession/{id}/checkins` - Lấy danh sách điểm danh
- `GET /api/eventsession/{id}/qr` - Tạo QR code

### Registration Management
- `POST /api/registration/register` - Đăng ký tham gia sự kiện
- `POST /api/registration/bulk-register` - Đăng ký hàng loạt
- `DELETE /api/registration/{eventId}/{studentId}` - Hủy đăng ký
- `GET /api/registration/student/{studentId}` - Sự kiện của sinh viên
- `GET /api/registration/event/{eventId}` - Sinh viên trong sự kiện

### Check-in Management
- `POST /api/checkin/qr` - Điểm danh bằng QR
- `POST /api/checkin/manual` - Điểm danh thủ công
- `POST /api/checkin/bulk` - Điểm danh hàng loạt
- `GET /api/checkin/session/{sessionId}` - Danh sách điểm danh
- `DELETE /api/checkin/{id}` - Hủy điểm danh

## Quy trình sử dụng

### 1. Quản trị viên
1. Tạo tài khoản admin
2. Tạo trường đại học
3. Tạo tài khoản người tổ chức sự kiện
4. Import danh sách sinh viên

### 2. Người tổ chức sự kiện
1. Tạo sự kiện mới
2. Tạo các phiên điểm danh cho sự kiện
3. Mở đăng ký cho sinh viên
4. Tạo QR code cho điểm danh
5. Theo dõi và xuất báo cáo

### 3. Sinh viên
1. Đăng ký tài khoản
2. Đăng ký tham gia sự kiện
3. Điểm danh bằng QR code hoặc thủ công
4. Xem lịch sử tham gia

## Tính năng chính

### 🎯 Quản lý sự kiện
- Tạo và quản lý sự kiện
- Phân chia thành nhiều phiên điểm danh
- Theo dõi thời gian thực

### 📱 Điểm danh thông minh
- QR Code để điểm danh nhanh
- Điểm danh thủ công backup
- Điểm danh hàng loạt

### 📊 Báo cáo và thống kê
- Xuất báo cáo PDF
- Xuất danh sách Excel
- Thống kê tham gia theo thời gian

### 🔐 Bảo mật
- JWT Authentication
- Role-based Authorization
- Password hashing với BCrypt

### 📈 Hiệu suất
- Repository Pattern
- Service Layer Architecture
- Async/Await pattern

## Lỗi thường gặp

### Connection String
Đảm bảo cấu hình đúng thông tin Supabase PostgreSQL trong `appsettings.json`.

### JWT Secret Key
Secret key phải có ít nhất 32 ký tự để đảm bảo bảo mật.

### Migration
Chạy migration trước khi khởi động ứng dụng:
```bash
dotnet ef database update
```

## Hỗ trợ
Liên hệ team phát triển nếu có vấn đề kỹ thuật hoặc cần hỗ trợ triển khai. API

Hệ thống điểm danh sinh viên tại NVH SV ĐHQG với backend API được xây dựng bằng ASP.NET Core 8.0 và Supabase PostgreSQL.

## Tính năng chính

### 1. Quản lý Trường/Đơn vị (University)
- CRUD operations cho trường đại học thành viên
- Trường dữ liệu: university_id, name, address, contact_info
- Liên kết với sinh viên và sự kiện

### 2. Quản lý Sinh viên (Student)
- CRUD operations cho sinh viên
- Import danh sách sinh viên từ Excel/CSV
- Trường dữ liệu: student_id, name, student_code, email, phone, university_id
- Gán sinh viên vào nhiều sự kiện

### 3. Quản lý Sự kiện (Event)
- Tạo sự kiện tại NVH SV (workshop, hội thảo, văn nghệ)
- Trường dữ liệu: event_id, title, description, organizer, start_date, end_date
- Hỗ trợ nhiều phiên cho mỗi sự kiện

### 4. Quản lý Phiên sự kiện (EventSession)
- CRUD operations cho phiên sự kiện
- Trường dữ liệu: session_id, event_id, title, start_time, end_time, location
- Cấu hình thời gian điểm danh

### 5. Quản lý Sinh viên tham gia sự kiện (StudentInEvent)
- Gán sinh viên vào sự kiện
- Trường dữ liệu: student_in_event_id, event_id, student_id, status
- Hỗ trợ import danh sách tham gia

### 6. Điểm danh (SessionCheckIn)
- Check-in bằng QR code hoặc thủ công
- Trường dữ liệu: checkin_id, session_id, student_id, checkin_time, method
- Ghi nhận thời gian và vị trí

### 7. Báo cáo & Thống kê
- Xuất danh sách tham dự
- Thống kê theo trường, sự kiện, ngày
- Export Excel/PDF

### 8. Quản lý Người dùng & Phân quyền
- Admin NVH SV: quản lý toàn bộ hệ thống
- Event Organizer: quản lý sự kiện riêng
- Student: xem sự kiện, đăng ký, check-in

## Cấu trúc dự án

```
Student-Attendance-System/
├── Controllers/           # API Controllers
├── Data/                 # DbContext và database configuration
├── DTOs/                 # Data Transfer Objects
├── Entities/             # Entity models
├── Repositories/         # Repository pattern implementation
├── Services/             # Business logic services
├── appsettings.json      # Configuration file
└── Program.cs           # Application entry point
```

## Entity Models

### University
- UniversityId (Guid, PK)
- Name (string, required)
- Address (string, optional)
- ContactInfo (string, optional)
- CreatedAt, UpdatedAt (DateTime)

### Student
- StudentId (Guid, PK)
- Name (string, required)
- StudentCode (string, unique, required)
- Email (string, unique, required)
- Phone (string, optional)
- UniversityId (Guid, FK)
- CreatedAt, UpdatedAt (DateTime)

### Event
- EventId (Guid, PK)
- Title (string, required)
- Description (string, optional)
- Organizer (string, required)
- StartDate, EndDate (DateTime, required)
- UniversityId (Guid, FK, optional)
- CreatedAt, UpdatedAt (DateTime)

### EventSession
- SessionId (Guid, PK)
- EventId (Guid, FK)
- Title (string, required)
- StartTime, EndTime (DateTime, required)
- Location (string, optional)
- CheckinStartTime, CheckinEndTime (DateTime, optional)
- CreatedAt, UpdatedAt (DateTime)

### StudentInEvent
- StudentInEventId (Guid, PK)
- EventId (Guid, FK)
- StudentId (Guid, FK)
- Status (enum: Registered, Cancelled, Attended)
- RegistrationDate (DateTime)
- CreatedAt, UpdatedAt (DateTime)

### SessionCheckIn
- CheckinId (Guid, PK)
- SessionId (Guid, FK)
- StudentId (Guid, FK)
- CheckinTime (DateTime)
- Method (enum: QR, Manual)
- Location (string, optional)
- Notes (string, optional)
- CreatedAt (DateTime)

### User
- UserId (Guid, PK)
- Name (string, required)
- Email (string, unique, required)
- PasswordHash (string, required)
- Role (enum: Admin, EventOrganizer, Student)
- Phone (string, optional)
- UniversityId (Guid, FK, optional)
- StudentId (Guid, FK, optional)
- IsActive (bool)
- CreatedAt, UpdatedAt (DateTime)

## Cấu hình

### 1. Database Connection (Supabase)
Cập nhật connection string trong `appsettings.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=your-supabase-host;Database=your-database-name;Username=your-username;Password=your-password;Port=5432;SSL Mode=Require;"
  }
}
```

### 2. JWT Configuration
Cập nhật JWT settings trong `appsettings.json`:
```json
{
  "JwtSettings": {
    "SecretKey": "your-very-secure-secret-key-that-should-be-at-least-32-characters-long",
    "Issuer": "StudentAttendanceSystem",
    "Audience": "StudentAttendanceUsers",
    "ExpiryMinutes": 1440
  }
}
```

## API Endpoints

### University Management
- `GET /api/university` - Lấy danh sách tất cả trường
- `GET /api/university/{id}` - Lấy thông tin trường theo ID
- `GET /api/university/search?searchTerm={term}` - Tìm kiếm trường
- `POST /api/university` - Tạo trường mới
- `PUT /api/university/{id}` - Cập nhật thông tin trường
- `DELETE /api/university/{id}` - Xóa trường

### Student Management
- `GET /api/student` - Lấy danh sách tất cả sinh viên
- `GET /api/student/{id}` - Lấy thông tin sinh viên theo ID
- `GET /api/student/by-code/{studentCode}` - Lấy sinh viên theo mã SV
- `GET /api/student/by-email/{email}` - Lấy sinh viên theo email
- `GET /api/student/by-university/{universityId}` - Lấy sinh viên theo trường
- `GET /api/student/search?searchTerm={term}` - Tìm kiếm sinh viên
- `POST /api/student` - Tạo sinh viên mới
- `POST /api/student/import` - Import sinh viên từ Excel/CSV
- `PUT /api/student/{id}` - Cập nhật thông tin sinh viên
- `DELETE /api/student/{id}` - Xóa sinh viên
- `GET /api/student/check-code-unique` - Kiểm tra mã SV unique
- `GET /api/student/check-email-unique` - Kiểm tra email unique

### Event Management
- `GET /api/event` - Lấy danh sách tất cả sự kiện
- `GET /api/event/{id}` - Lấy thông tin sự kiện theo ID
- `GET /api/event/by-university/{universityId}` - Lấy sự kiện theo trường
- `GET /api/event/by-organizer?organizer={name}` - Lấy sự kiện theo người tổ chức
- `GET /api/event/by-date-range` - Lấy sự kiện theo khoảng thời gian
- `GET /api/event/search?searchTerm={term}` - Tìm kiếm sự kiện
- `GET /api/event/{id}/with-sessions` - Lấy sự kiện với các phiên
- `GET /api/event/{id}/with-students` - Lấy sự kiện với danh sách sinh viên
- `POST /api/event` - Tạo sự kiện mới
- `PUT /api/event/{id}` - Cập nhật thông tin sự kiện
- `DELETE /api/event/{id}` - Xóa sự kiện

### Event Session Management
- `GET /api/eventsession` - Lấy danh sách tất cả phiên
- `GET /api/eventsession/{id}` - Lấy thông tin phiên theo ID
- `GET /api/eventsession/by-event/{eventId}` - Lấy phiên theo sự kiện
- `GET /api/eventsession/by-date-range` - Lấy phiên theo khoảng thời gian
- `GET /api/eventsession/{id}/with-checkins` - Lấy phiên với danh sách điểm danh
- `POST /api/eventsession` - Tạo phiên mới
- `PUT /api/eventsession/{id}` - Cập nhật thông tin phiên
- `DELETE /api/eventsession/{id}` - Xóa phiên

### Registration Management
- `GET /api/registration` - Lấy danh sách tất cả đăng ký
- `GET /api/registration/{id}` - Lấy thông tin đăng ký theo ID
- `GET /api/registration/by-event/{eventId}` - Lấy đăng ký theo sự kiện
- `GET /api/registration/by-student/{studentId}` - Lấy đăng ký theo sinh viên
- `POST /api/registration/register` - Đăng ký sinh viên vào sự kiện
- `POST /api/registration/bulk-register` - Đăng ký hàng loạt sinh viên
- `PUT /api/registration/{id}/status` - Cập nhật trạng thái đăng ký
- `DELETE /api/registration/{id}` - Hủy đăng ký
- `GET /api/registration/check-registration` - Kiểm tra trạng thái đăng ký

### Check-in Management
- `GET /api/checkin` - Lấy danh sách tất cả điểm danh
- `GET /api/checkin/{id}` - Lấy thông tin điểm danh theo ID
- `GET /api/checkin/by-session/{sessionId}` - Lấy điểm danh theo phiên
- `GET /api/checkin/by-student/{studentId}` - Lấy điểm danh theo sinh viên
- `GET /api/checkin/by-event/{eventId}` - Lấy điểm danh theo sự kiện
- `POST /api/checkin` - Điểm danh thủ công
- `POST /api/checkin/qr-checkin` - Điểm danh bằng QR code
- `POST /api/checkin/bulk-checkin` - Điểm danh hàng loạt
- `DELETE /api/checkin/{id}` - Xóa điểm danh
- `GET /api/checkin/check-status` - Kiểm tra trạng thái điểm danh

## Packages được sử dụng

- **Npgsql.EntityFrameworkCore.PostgreSQL** - PostgreSQL provider cho EF Core
- **Microsoft.EntityFrameworkCore.Design** - EF Core design-time tools
- **Microsoft.AspNetCore.Authentication.JwtBearer** - JWT authentication
- **BCrypt.Net-Next** - Password hashing
- **EPPlus** - Excel file processing
- **iTextSharp** - PDF generation

## Cách chạy dự án

1. **Cài đặt dependencies:**
   ```bash
   dotnet restore
   ```

2. **Cập nhật connection string và JWT settings trong appsettings.json**

3. **Tạo database migrations:**
   ```bash
   dotnet ef migrations add InitialCreate
   dotnet ef database update
   ```

4. **Chạy dự án:**
   ```bash
   dotnet run
   ```

5. **Truy cập Swagger UI:**
   ```
   https://localhost:7xxx/swagger
   ```

## Tình trạng hiện tại

✅ **Đã hoàn thành 100%:**
- Entity Models (University, Student, Event, EventSession, StudentInEvent, SessionCheckIn, User)
- Database Context với Supabase PostgreSQL
- DTOs cho tất cả entities và operations
- Repository Pattern implementation đầy đủ
- Service Layer cho tất cả domains
- JWT Authentication setup
- Tất cả Controllers với đầy đủ CRUD operations:
  - UniversityController
  - StudentController (bao gồm import Excel/CSV)
  - EventController
  - EventSessionController
  - RegistrationController (StudentInEvent)
  - CheckInController (SessionCheckIn với QR code support)

🎯 **Functional Requirements hoàn thành:**
- ✅ Quản lý Trường/Đơn vị với CRUD operations
- ✅ Quản lý Sinh viên với import Excel/CSV support
- ✅ Quản lý Sự kiện với nhiều phiên
- ✅ Quản lý Phiên sự kiện với cấu hình check-in
- ✅ Quản lý Sinh viên tham gia sự kiện (bulk registration)
- ✅ Điểm danh QR code và thủ công (bulk check-in)
- ✅ API structure sẵn sàng cho báo cáo & thống kê
- ✅ Phân quyền 3 levels (Admin, Event Organizer, Student)

🚀 **Features nâng cao đã có:**
- Bulk operations (import, register, check-in)
- QR code check-in support
- Advanced search và filtering
- Time validation cho sessions và check-in
- Status tracking cho students và events
- Comprehensive error handling
- Data validation và business logic

## Lưu ý

- Đây là backend API, cần frontend để tương tác đầy đủ
- Database sẽ cần được tạo trước khi chạy migrations
- JWT secret key nên được tạo an toàn và khác nhau cho mỗi environment
- Supabase connection string cần được cấu hình đúng

## Liên hệ

Dự án được phát triển cho NVH SV ĐHQG với mục đích quản lý điểm danh sinh viên tại các sự kiện.
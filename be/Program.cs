using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Text.Json;
using Student_Attendance_System.Data;
using Student_Attendance_System.Entities;
using Student_Attendance_System.Entities;
using BCrypt.Net;
using Student_Attendance_System.Repositories;
using Student_Attendance_System.Services;
using Student_Attendance_System.Services.Interfaces;

var builder = WebApplication.CreateBuilder(args);
// Configure Npgsql for proper timezone handling
AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);
AppContext.SetSwitch("Npgsql.DisableDateTimeInfinityConversions", true);


// Add services to the container.

// Database connection (Supabase PostgreSQL)
builder.Services.AddDbContext<StudentAttendanceDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        npgsqlOptions =>
        {
            npgsqlOptions.EnableRetryOnFailure(5); // retry khi timeout
        }
    )
);


// Repository registrations
builder.Services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IOrganizerRepository, OrganizerRepository>();
builder.Services.AddScoped<IAdminRepository, AdminRepository>();
builder.Services.AddScoped<IUniversityRepository, UniversityRepository>();
builder.Services.AddScoped<IStudentRepository, StudentRepository>();
builder.Services.AddScoped<IEventRepository, EventRepository>();
builder.Services.AddScoped<IEventSessionRepository, EventSessionRepository>();
builder.Services.AddScoped<IStudentInEventRepository, StudentInEventRepository>();
builder.Services.AddScoped<ISessionCheckInRepository, SessionCheckInRepository>();

// Service registrations
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IOrganizerService, OrganizerService>();
builder.Services.AddScoped<IAdminService, AdminService>();
builder.Services.AddScoped<IUniversityService, UniversityService>();
builder.Services.AddScoped<IStudentService, StudentService>();
builder.Services.AddScoped<IEventService, EventService>();
builder.Services.AddScoped<IEventSessionService, EventSessionService>();
builder.Services.AddScoped<IStudentInEventService, StudentInEventService>();
builder.Services.AddScoped<ISessionCheckInService, SessionCheckInService>();
builder.Services.AddScoped<IStudentInEventService, StudentInEventService>();
builder.Services.AddScoped<ISessionCheckInService, SessionCheckInService>();

// JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secret = jwtSettings["Secret"] ?? throw new InvalidOperationException("JWT Secret is not configured");
Console.WriteLine($"JWT Secret: {secret}");

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = false, // Không kiểm tra Issuer
        ValidateAudience = false, // Không kiểm tra Audience
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret)),
        ClockSkew = TimeSpan.Zero,
    RoleClaimType = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role" // Nhận diện claim role đúng chuẩn JWT
    };
    options.Events = new JwtBearerEvents
    {
        OnAuthenticationFailed = context =>
        {
            Console.WriteLine($"JWT Auth failed: {context.Exception.Message}");
            return System.Threading.Tasks.Task.CompletedTask;
        },
        OnTokenValidated = context =>
        {
            var claims = context.Principal?.Claims.Select(c => $"{c.Type}: {c.Value}").ToList();
            Console.WriteLine("[OnTokenValidated] User claims: " + string.Join(", ", claims ?? new List<string>()));
            return System.Threading.Tasks.Task.CompletedTask;
        }
    };
});

builder.Services.AddControllers().AddJsonOptions(options =>
{
    // Configure JSON serialization
    options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    options.JsonSerializerOptions.WriteIndented = true;
});
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { 
        Title = "Student Attendance System API", 
        Version = "v1",
        Description = "API quản lý điểm danh sinh viên NVH SV ĐHQG",
        Contact = new() { 
            Name = "Student Attendance System",
            Email = "admin@attendance.system"
        }
    });
    
    // Add JWT Authentication to Swagger
    c.AddSecurityDefinition("Bearer", new()
    {
        Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token in the text input below.",
        Name = "Authorization",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new()
    {
        {
            new()
            {
                Reference = new()
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        builder =>
        {
            builder
                .AllowAnyOrigin()
                .AllowAnyMethod()
                .AllowAnyHeader();
        });
});

var app = builder.Build();
// Seed admin account
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<StudentAttendanceDbContext>();
    var adminEmail = "admin@example.com";
    var adminUsername = "admin";
    var adminPassword = BCrypt.Net.BCrypt.HashPassword("admin123");
    var adminName = "Admin Name";
    var department = "IT";
    var phone = "0123456789";

    if (!db.Users.Any(u => u.Email == adminEmail))
    {
        var user = new User
        {
            Username = adminUsername,
            Email = adminEmail,
            Password = adminPassword,
            Role = "admin",
            CreatedAt = DateTime.UtcNow
        };
        db.Users.Add(user);
        db.SaveChanges();

        var admin = new Admin
        {
            UserId = user.UserId,
            AdminName = adminName,
            Department = department,
            Phone = phone,
            Role = "admin"
        };
        db.Admins.Add(admin);
        db.SaveChanges();
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();

using Microsoft.EntityFrameworkCore;
using Student_Attendance_System.Entities;

namespace Student_Attendance_System.Data
{
    public class StudentAttendanceDbContext : DbContext
    {
        public StudentAttendanceDbContext(DbContextOptions<StudentAttendanceDbContext> options) : base(options)
        {
        }

        // DbSets
        public DbSet<University> Universities { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Organizer> Organizers { get; set; }
        public DbSet<Admin> Admins { get; set; }
        public DbSet<Student> Students { get; set; }
        public DbSet<Event> Events { get; set; }
        public DbSet<EventSession> EventSessions { get; set; }
        public DbSet<StudentInEvent> StudentInEvents { get; set; }
        public DbSet<SessionCheckIn> SessionCheckIns { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure indexes for better performance
            modelBuilder.Entity<Student>()
                .HasIndex(s => s.StudentCode)
                .IsUnique();

            modelBuilder.Entity<Student>()
                .HasIndex(s => s.Email)
                .IsUnique();

            modelBuilder.Entity<User>()
                .HasIndex(u => u.Username)
                .IsUnique();

            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            // Configure relationships
            modelBuilder.Entity<Student>()
                .HasOne(s => s.University)
                .WithMany(u => u.Students)
                .HasForeignKey(s => s.UniversityId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<Student>()
                .HasOne(s => s.User)
                .WithOne(u => u.Student)
                .HasForeignKey<Student>(s => s.UserId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<Organizer>()
                .HasOne(o => o.User)
                .WithOne(u => u.Organizer)
                .HasForeignKey<Organizer>(o => o.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Admin>()
                .HasOne(a => a.User)
                .WithOne(u => u.Admin)
                .HasForeignKey<Admin>(a => a.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<EventSession>()
                .HasOne(es => es.Event)
                .WithMany(e => e.EventSessions)
                .HasForeignKey(es => es.EventId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<StudentInEvent>()
                .HasOne(sie => sie.Event)
                .WithMany(e => e.StudentInEvents)
                .HasForeignKey(sie => sie.EventId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<StudentInEvent>()
                .HasOne(sie => sie.Student)
                .WithMany(s => s.StudentInEvents)
                .HasForeignKey(sie => sie.StudentId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<SessionCheckIn>()
                .HasOne(sci => sci.EventSession)
                .WithMany(es => es.SessionCheckIns)
                .HasForeignKey(sci => sci.SessionId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<SessionCheckIn>()
                .HasOne(sci => sci.StudentInEvent)
                .WithMany(sie => sie.SessionCheckIns)
                .HasForeignKey(sci => sci.StudentInEventId)
                .OnDelete(DeleteBehavior.Cascade);

            // Composite unique constraints
            modelBuilder.Entity<StudentInEvent>()
                .HasIndex(sie => new { sie.EventId, sie.StudentId })
                .IsUnique();

            modelBuilder.Entity<SessionCheckIn>()
                .HasIndex(sci => new { sci.SessionId, sci.StudentInEventId })
                .IsUnique();
        }
    }
}
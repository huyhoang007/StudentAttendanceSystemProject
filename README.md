# Student Attendance System

A comprehensive student attendance management system built with React frontend and .NET backend.

## Project Structure

```
├── fe/          # Frontend (React + Vite + Material-UI)
├── be/          # Backend (.NET Core Web API)
└── docs/        # SQL scripts and documentation
```

## Features

### For Students

- ✅ QR Code check-in to events and sessions
- ✅ View personal dashboard with attendance history
- ✅ Register for events
- ✅ Mobile-responsive interface

### For Organizers

- ✅ Create and manage events
- ✅ Generate QR codes for sessions
- ✅ Monitor real-time attendance
- ✅ Generate attendance reports
- ✅ Manage student registrations

### For Admins

- ✅ User management (create students, organizers)
- ✅ University management
- ✅ System-wide reporting
- ✅ Security controls

## Tech Stack

### Frontend

- **React 18** - UI library
- **Material-UI** - Component library
- **Vite** - Build tool
- **QR Scanner** - Camera-based QR code scanning

### Backend

- **.NET 8** - Web API framework
- **Entity Framework Core** - ORM
- **PostgreSQL** - Database
- **JWT** - Authentication

## Quick Start

### Prerequisites

- Node.js 18+
- .NET 8 SDK
- PostgreSQL

### Frontend Setup

```bash
cd fe
npm install
npm run dev
```

### Backend Setup

```bash
cd be
dotnet restore
dotnet ef database update
dotnet run
```

## API Endpoints

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Events

- `GET /api/events` - List events
- `POST /api/events` - Create event
- `GET /api/events/{id}` - Get event details

### Check-in

- `POST /api/checkin` - QR code check-in
- `GET /api/checkin/{sessionId}` - Get session check-ins

## Database Schema

Key entities:

- **Users** - Authentication and basic info
- **Students** - Student profiles
- **Organizers** - Event organizer profiles
- **Events** - Event information
- **EventSessions** - Individual sessions within events
- **SessionCheckIns** - Attendance records

## Development

### Frontend Development

```bash
cd fe
npm run dev    # Development server
npm run build  # Production build
npm run lint   # Code linting
```

### Backend Development

```bash
cd be
dotnet watch run                # Hot reload development
dotnet ef migrations add <name>  # Create migration
dotnet ef database update        # Apply migrations
```

## Security Features

- ✅ JWT-based authentication
- ✅ Role-based authorization (Admin, Organizer, Student)
- ✅ HTTPS enforcement
- ✅ Input validation and sanitization
- ✅ CORS configuration

## Deployment

### Frontend (Vercel)

```bash
cd fe
npm run build
vercel deploy
```

### Backend (Railway/Azure)

```bash
cd be
dotnet publish -c Release
# Deploy to your preferred platform
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue on GitHub.

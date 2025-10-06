import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { useTokenCheck } from "./hooks/useTokenCheck";
import MainLayout from "./components/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Universities from "./pages/Universities";
import Students from "./pages/Students";
import AdminUserManagement from "./pages/AdminUserManagement";
import RealTimeMonitoring from "./pages/RealTimeMonitoring";
import Events from "./pages/Events";
import EventsStudent from "./pages/EventsStudent";
import Sessions from "./pages/Sessions";
import StudentInEvent from "./pages/StudentInEvent";
import StudentRegisteredEvents from "./pages/StudentRegisteredEvents";
import StudentInEventManagement from "./pages/StudentInEventManagement";
import CheckIn from "./pages/CheckIn";
import Report from "./pages/Report";
import EventDetails from "./pages/EventDetails";
import SessionDetails from "./pages/SessionDetails";
import EventSessions from "./pages/EventSessions";
import StudentDashboard from "./pages/StudentDashboard";
import RoleDashboard from "./pages/RoleDashboard";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";

// Component wrapper để sử dụng token check
function AppWithTokenCheck() {
  useTokenCheck();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<MainLayout />}>
        <Route
          index
          element={
            <ProtectedRoute allowedRoles={["admin", "organizer", "student"]}>
              <RoleDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="student-dashboard"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="universities"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Universities />
            </ProtectedRoute>
          }
        />
        <Route
          path="students"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Students />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin-users"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminUserManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="events"
          element={
            <ProtectedRoute allowedRoles={["admin", "organizer"]}>
              <Events />
            </ProtectedRoute>
          }
        />
        <Route
          path="events-student"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <EventsStudent />
            </ProtectedRoute>
          }
        />
        <Route
          path="sessions"
          element={
            <ProtectedRoute allowedRoles={["admin", "organizer"]}>
              <Sessions />
            </ProtectedRoute>
          }
        />
        <Route
          path="student-in-event"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentRegisteredEvents />
            </ProtectedRoute>
          }
        />
        <Route
          path="student-registered-events"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentRegisteredEvents />
            </ProtectedRoute>
          }
        />
        <Route
          path="profile"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="event-details/:eventId"
          element={
            <ProtectedRoute allowedRoles={["student", "admin", "organizer"]}>
              <EventDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="session-details/:sessionId"
          element={
            <ProtectedRoute allowedRoles={["student", "admin", "organizer"]}>
              <SessionDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="event-sessions/:eventId"
          element={
            <ProtectedRoute allowedRoles={["student", "admin", "organizer"]}>
              <EventSessions />
            </ProtectedRoute>
          }
        />
        <Route
          path="student-in-event-management"
          element={
            <ProtectedRoute allowedRoles={["admin", "organizer"]}>
              <StudentInEventManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="checkin"
          element={
            <ProtectedRoute allowedRoles={["admin", "organizer", "student"]}>
              <CheckIn />
            </ProtectedRoute>
          }
        />
        <Route
          path="report"
          element={
            <ProtectedRoute allowedRoles={["admin", "organizer"]}>
              <Report />
            </ProtectedRoute>
          }
        />
        <Route
          path="monitoring"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <RealTimeMonitoring />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppWithTokenCheck />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

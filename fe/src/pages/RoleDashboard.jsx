import { useAuth } from "../contexts/AuthContext";
import Dashboard from "./Dashboard";
import StudentDashboard from "./StudentDashboard";

const RoleDashboard = () => {
  const { user } = useAuth();

  // Nếu là student thì hiển thị StudentDashboard, ngược lại hiển thị Dashboard admin/organizer
  if (user?.role === "student") {
    return <StudentDashboard />;
  }

  return <Dashboard />;
};

export default RoleDashboard;

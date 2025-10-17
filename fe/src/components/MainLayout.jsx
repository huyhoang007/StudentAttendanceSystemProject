// src/components/MainLayout.jsx
import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar,
  Tooltip,
  IconButton,
} from "@mui/material";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const MainLayout = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // determine if the current route is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  // build nav items depending on role (preserve existing logic)
  const studentNav = [
    { to: "/", label: "Trang chủ" },
    { to: "/events-student", label: "Sự kiện" },
    { to: "/student-registered-events", label: "Sự kiện đã đăng ký" },
    { to: "/checkin", label: "Điểm danh QR" },
    { to: "/profile", label: "Hồ sơ" },
  ];

  const adminOrgNav = [
    { to: "/", label: "Trang chủ" },
    // admin extras will be inserted conditionally below
    { to: "/events", label: "Sự kiện" },
    { to: "/sessions", label: "Phiên" },
    { to: "/student-in-event-management", label: "Quản lý SV" },
    { to: "/report", label: "Báo cáo" },
  ];

  // compose final nav array for non-student roles, inserting admin-only items when role === 'admin'
  let nonStudentNav = [...adminOrgNav];
  if (role === "admin") {
    // insert admin-specific links after Trang chủ (index 0)
    nonStudentNav.splice(1, 0,
      { to: "/universities", label: "Trường" },
      { to: "/students", label: "Sinh viên" },
      { to: "/admin-users", label: "Người dùng" }
    );
  }

  const navItems = role === "student" ? studentNav : nonStudentNav;

  return (
    <Box>
      <AppBar
        position="static"
        color="primary"
        sx={{
          boxShadow: 3,
          background: "linear-gradient(90deg,#74ebd5,#ACB6E5)",
        }}
      >
        <Toolbar sx={{ minHeight: 64 }}>
          <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
            <Avatar
              sx={{
                width: 40,
                height: 40,
                mr: 2,
                bgcolor: "#fff",
                boxShadow: 2
              }}
            >
              <img
                src="https://img.icons8.com/fluency/64/000000/student-center.png"
                alt="logo"
                style={{ width: 32, height: 32 }}
              />
            </Avatar>
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, letterSpacing: 1 }}
            >
              Student Attendance System
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            {navItems.map((item) => {
              const active = isActive(item.to);
              return (
                <Button
                  key={item.to}
                  color="inherit"
                  component={Link}
                  to={item.to}
                  sx={{
                    fontWeight: 600,
                    textTransform: "none",
                    px: 2,
                    py: 0.75,
                    borderRadius: 2,
                    gap: 1,
                    // hover effect
                    "&:hover": {
                      background: "rgba(255,255,255,0.08)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
                    },
                    // active state styling
                    bgcolor: active ? "rgba(255,255,255,0.12)" : "transparent",
                    // subtle underline for active using boxShadow inset
                    boxShadow: active ? "inset 0 -3px 0 rgba(255,255,255,0.18)" : "none",
                    // ensure text alignment
                    display: "flex",
                    alignItems: "center",
                    color: "inherit",
                  }}
                >
                  {item.label}
                </Button>
              );
            })}
          </Box>
          {user && (
            <Box sx={{ display: "flex", alignItems: "center", ml: 2 }}>
              <Tooltip title={user.username}>
                <Avatar
                  sx={{
                    bgcolor: "#74ebd5",
                    color: "#fff",
                    fontWeight: 700,
                    mr: 1,
                  }}
                >
                  {user.username.charAt(0).toUpperCase()}
                </Avatar>
              </Tooltip>
              <IconButton color="error" onClick={handleLogout} sx={{ ml: 1 }}>
                <span style={{ fontWeight: 700, fontSize: 16 }}>Đăng xuất</span>
              </IconButton>
            </Box>
          )}
        </Toolbar>
      </AppBar>
      <Box
        sx={{
          mt: 2,
          background: "linear-gradient(135deg, #f8fafc 0%, #e0eafc 100%)",
          minHeight: "calc(100vh - 64px)",
          p: 2,
          borderRadius: 2,
          boxShadow: 1,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;

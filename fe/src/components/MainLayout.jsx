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
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const MainLayout = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

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
          <Box sx={{ display: "flex", gap: 1 }}>
            {/* Dashboard button removed from navbar */}
            {role === "student" && (
              <>
                <Button
                  color="inherit"
                  component={Link}
                  to="/"
                  sx={{ fontWeight: 600 }}
                >
                  Trang chủ
                </Button>
                <Button
                  color="inherit"
                  component={Link}
                  to="/events-student"
                  sx={{ fontWeight: 600 }}
                >
                  Sự kiện
                </Button>
                <Button
                  color="inherit"
                  component={Link}
                  to="/student-registered-events"
                  sx={{ fontWeight: 600 }}
                >
                  Sự kiện đã đăng ký
                </Button>
                <Button
                  color="inherit"
                  component={Link}
                  to="/checkin"
                  sx={{ fontWeight: 600 }}
                >
                  Điểm danh QR
                </Button>
                <Button
                  color="inherit"
                  component={Link}
                  to="/profile"
                  sx={{ fontWeight: 600 }}
                >
                  Hồ sơ
                </Button>
              </>
            )}
            {role !== "student" && (
              <>
                <Button
                  color="inherit"
                  component={Link}
                  to="/"
                  sx={{ fontWeight: 600 }}
                >
                  Trang chủ
                </Button>
                {role === "admin" && (
                  <>
                    <Button
                      color="inherit"
                      component={Link}
                      to="/universities"
                      sx={{ fontWeight: 600 }}
                    >
                      Trường
                    </Button>
                    <Button
                      color="inherit"
                      component={Link}
                      to="/students"
                      sx={{ fontWeight: 600 }}
                    >
                      Sinh viên
                    </Button>
                    <Button
                      color="inherit"
                      component={Link}
                      to="/admin-users"
                      sx={{ fontWeight: 600 }}
                    >
                      Người dùng
                    </Button>
                  </>
                )}
                <Button
                  color="inherit"
                  component={Link}
                  to="/events"
                  sx={{ fontWeight: 600 }}
                >
                  Sự kiện
                </Button>
                <Button
                  color="inherit"
                  component={Link}
                  to="/sessions"
                  sx={{ fontWeight: 600 }}
                >
                  Phiên
                </Button>
                <Button
                  color="inherit"
                  component={Link}
                  to="/student-in-event-management"
                  sx={{ fontWeight: 600 }}
                >
                  Quản lý SV
                </Button>
                <Button
                  color="inherit"
                  component={Link}
                  to="/report"
                  sx={{ fontWeight: 600 }}
                >
                  Báo cáo
                </Button>
              </>
            )}
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

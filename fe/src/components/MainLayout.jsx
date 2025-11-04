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
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import Logo from "../assets/Logo.png";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const MainLayout = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  // determine if the current route is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  // build nav items depending on role
  const studentNav = [
    { to: "/", label: "Trang chủ" },
    { to: "/events-student", label: "Sự kiện" },
    { to: "/student-registered-events", label: "Sự kiện đã đăng ký" },
    { to: "/checkin", label: "Điểm danh QR" },
    { to: "/profile", label: "Hồ sơ" },
  ];

  const adminOrgNav = [
    { to: "/", label: "Trang chủ" },
    { to: "/events", label: "Sự kiện" },
    { to: "/sessions", label: "Phiên" },
    { to: "/student-in-event-management", label: "Quản lý SV" },
    { to: "/report", label: "Báo cáo" },
  ];

  if (role === "organizer") {
    adminOrgNav.push({ to: "/organizer-profile", label: "Hồ sơ" });
  }

  let nonStudentNav = [...adminOrgNav];
  if (role === "admin") {
    nonStudentNav.splice(
      1,
      0,
      { to: "/universities", label: "Trường" },
      { to: "/students", label: "Sinh viên" },
      { to: "/admin-users", label: "Người dùng" }
    );
  }

  const navItems = role === "student" ? studentNav : nonStudentNav;

  return (
    <Box sx={{ bgcolor: "#f8fafc" }}>
      {/* ===== HEADER / APPBAR ===== */}
      <AppBar
        position="static"
        color="primary"
        sx={{
          background: "linear-gradient(90deg, #6a1b9a 0%, #ab47bc 100%)",
          boxShadow: "none",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <Toolbar
          sx={{
            minHeight: { xs: 56, sm: 64 },
            flexWrap: "wrap",
            padding: { xs: 1, sm: 2 },
            gap: 1,
          }}
        >
          {/* ===== LOGO + TITLE ===== */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexGrow: 1,
              minWidth: { xs: "100%", sm: "auto" },
              mb: { xs: 1, sm: 0 },
            }}
          >
            <Avatar
              sx={{
                width: { xs: 32, sm: 40 },
                height: { xs: 32, sm: 40 },
                mr: 1,
                bgcolor: "#fff",
                boxShadow: 2,
                padding: "6px",
              }}
            >
              <img
                src={Logo}
                alt="logo"
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            </Avatar>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                letterSpacing: 1,
                fontSize: { xs: "1rem", sm: "1.25rem" },
                color: "rgba(255,255,255,0.95)",
              }}
            >
              Student Attendance System
            </Typography>
          </Box>

          {/* ===== NAV LINKS (desktop) ===== */}
          <Box
            sx={{
              display: { xs: "none", sm: "flex" },
              gap: 0.5,
              alignItems: "center",
              flexWrap: "wrap",
              justifyContent: "center",
              width: { xs: "100%", sm: "auto" },
            }}
          >
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
                    px: { xs: 1, sm: 2 },
                    py: 0.75,
                    borderRadius: 2,
                    gap: 0.5,
                    fontSize: { xs: "0.875rem", sm: "1rem" },
                    "&:hover": {
                      background: "rgba(255,255,255,0.06)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 6px 18px rgba(106,27,154,0.08)",
                    },
                    bgcolor: active ? "rgba(255,255,255,0.10)" : "transparent",
                    boxShadow: active
                      ? "inset 0 -3px 0 rgba(255,255,255,0.12)"
                      : "none",
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

          {/* ===== MENU ICON (mobile) ===== */}
          <IconButton
            sx={{ display: { xs: "flex", sm: "none" }, color: "#fff" }}
            onClick={toggleDrawer(true)}
          >
            <MenuIcon />
          </IconButton>

          {/* ===== USER SECTION ===== */}
          {user && (
            <Box
              sx={{
                display: { xs: "none", sm: "flex" },
                alignItems: "center",
                ml: { xs: 0, sm: 2 },
                width: { xs: "100%", sm: "auto" },
                justifyContent: { xs: "center", sm: "flex-start" },
                mt: { xs: 1, sm: 0 },
              }}
            >
              <Tooltip title={user.username}>
                <Avatar
                  sx={{
                    bgcolor: "rgba(255,255,255,0.12)",
                    color: "#fff",
                    fontWeight: 700,
                    mr: 1,
                    width: { xs: 32, sm: 40 },
                    height: { xs: 32, sm: 40 },
                    border: "1px solid rgba(255,255,255,0.12)",
                  }}
                >
                  {user.username.charAt(0).toUpperCase()}
                </Avatar>
              </Tooltip>
              <IconButton
                onClick={handleLogout}
                sx={{
                  ml: 1,
                  fontSize: { xs: "0.875rem", sm: "1rem" },
                  color: "rgba(255,255,255,0.95)",
                }}
              >
                <span style={{ fontWeight: 700 }}>Đăng xuất</span>
              </IconButton>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* ===== DRAWER MENU (mobile) ===== */}
      <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer(false)}>
        <Box
          sx={{
            width: 260,
            bgcolor: "#faf5ff",
            height: "100%",
            display: "flex",
            flexDirection: "column",
          }}
          role="presentation"
          onClick={toggleDrawer(false)}
        >
          <Box sx={{ p: 2, textAlign: "center" }}>
            <Avatar
              src={Logo}
              alt="Logo"
              sx={{
                width: 48,
                height: 48,
                mx: "auto",
                mb: 1,
              }}
            />
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Student Attendance System
            </Typography>
          </Box>
          <Divider />
          <List>
            {navItems.map((item) => (
              <ListItem key={item.to} disablePadding>
                <ListItemButton onClick={() => navigate(item.to)}>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Divider />
          {user && (
            <Box sx={{ p: 2 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Đăng nhập với: <strong>{user.username}</strong>
              </Typography>
              <Button
                fullWidth
                variant="contained"
                color="secondary"
                onClick={handleLogout}
              >
                Đăng xuất
              </Button>
            </Box>
          )}
        </Box>
      </Drawer>

      {/* ===== MAIN CONTENT ===== */}
      <Box
        sx={{
          mt: 0,
          background: "linear-gradient(135deg, #faf5ff 0%, #efe6fb 100%)",
          minHeight: "calc(100vh - 64px)",
          p: { xs: 1, sm: 2 },
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;

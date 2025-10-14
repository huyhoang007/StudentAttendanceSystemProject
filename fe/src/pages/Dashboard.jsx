// src/pages/Dashboard.jsx

import React from "react";
import {
  Typography,
  Box,
  Card,
  Avatar,
  Chip,
  Grid,
  Paper,
} from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import EventIcon from "@mui/icons-material/Event";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PeopleIcon from "@mui/icons-material/People";

const Dashboard = () => {
  const { user, role } = useAuth();
  const navigate = useNavigate();

  // Dashboard for Admin and Organizer
  return (
    <Box
      sx={{
        minHeight: "100vh",
        py: 6,
        px: 3,
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
        radial-gradient(circle at 20% 50%, rgba(102, 126, 234, 0.3) 0%, transparent 50%),
        radial-gradient(circle at 80% 80%, rgba(118, 75, 162, 0.3) 0%, transparent 50%),
        radial-gradient(circle at 40% 20%, rgba(240, 147, 251, 0.2) 0%, transparent 50%)
      `,
          animation: "gradientShift 15s ease infinite",
          zIndex: 0,
        },
        "@keyframes gradientShift": {
          "0%, 100%": {
            transform: "translate(0, 0) scale(1)",
          },
          "33%": {
            transform: "translate(30px, -30px) scale(1.1)",
          },
          "66%": {
            transform: "translate(-20px, 20px) scale(0.9)",
          },
        },
      }}
    >
      <Box sx={{ maxWidth: 1200, mx: "auto", position: "relative", zIndex: 1 }}>
        {/* Main Welcome Card */}
        <Card
          elevation={0}
          sx={{
            p: 5,
            borderRadius: 5,
            mb: 4,
            background: "rgba(255, 255, 255, 0.98)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 25px 80px rgba(0,0,0,0.2)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            position: "relative",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: -2,
              left: -2,
              right: -2,
              bottom: -2,
              background: "linear-gradient(135deg, #667eea, #764ba2, #f093fb)",
              borderRadius: 5,
              zIndex: -1,
              opacity: 0.1,
              animation: "borderGlow 3s ease infinite",
            },
            "@keyframes borderGlow": {
              "0%, 100%": { opacity: 0.1 },
              "50%": { opacity: 0.3 },
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Avatar
              sx={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                width: 110,
                height: 110,
                mb: 3,
                boxShadow: "0 12px 35px rgba(102, 126, 234, 0.4)",
                animation: "float 3s ease-in-out infinite",
                "@keyframes float": {
                  "0%, 100%": { transform: "translateY(0px)" },
                  "50%": { transform: "translateY(-10px)" },
                },
              }}
            >
              <img
                src="https://img.icons8.com/fluency/64/000000/student-center.png"
                alt="dashboard"
                style={{ width: 64, height: 64 }}
              />
            </Avatar>

            <Typography
              variant="h3"
              fontWeight={800}
              sx={{
                background:
                  "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
                backgroundSize: "200% auto",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                mb: 2,
                textAlign: "center",
                animation: "gradientFlow 4s ease infinite",
                "@keyframes gradientFlow": {
                  "0%, 100%": { backgroundPosition: "0% center" },
                  "50%": { backgroundPosition: "100% center" },
                },
              }}
            >
              Hệ thống Điểm danh Sự kiện
            </Typography>

            <Box sx={{ textAlign: "center", mb: 2 }}>
              <Typography
                variant="h5"
                sx={{
                  mb: 1,
                  fontWeight: 700,
                  color: "#2d3748",
                  letterSpacing: 0.5,
                }}
              >
                🏛️ Nhà Văn Hóa Sinh Viên TP.HCM
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{
                  fontWeight: 500,
                  fontStyle: "italic",
                }}
              >
                Đại học Quốc gia Thành phố Hồ Chí Minh
              </Typography>
            </Box>

            <Box
              sx={{
                mt: 3,
                p: 4,
                borderRadius: 4,
                background:
                  "linear-gradient(135deg, #667eea15 0%, #764ba215 100%)",
                width: "100%",
                maxWidth: 700,
                border: "2px solid rgba(102, 126, 234, 0.2)",
                position: "relative",
                overflow: "hidden",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: "-100%",
                  width: "100%",
                  height: "100%",
                  background:
                    "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                  animation: "shimmer 3s infinite",
                },
                "@keyframes shimmer": {
                  "0%": { left: "-100%" },
                  "100%": { left: "100%" },
                },
              }}
            >
              <Typography
                variant="h4"
                align="center"
                sx={{
                  fontWeight: 700,
                  color: "#2d3748",
                  mb: 1.5,
                  textShadow: "0 2px 4px rgba(0,0,0,0.05)",
                }}
              >
                Xin chào, {user?.firstName || user?.username}! 👋
              </Typography>
              <Typography
                variant="h6"
                align="center"
                color="text.secondary"
                sx={{
                  mb: 2.5,
                  fontWeight: 500,
                  lineHeight: 1.6,
                }}
              >
                {role === "admin"
                  ? "Chào mừng đến với bảng điều khiển quản trị. Bạn có toàn quyền quản lý hệ thống, sự kiện, người dùng và thống kê tổng quan."
                  : "Chào mừng đến với bảng điều khiển tổ chức sự kiện. Bạn có thể tạo và quản lý các sự kiện, theo dõi điểm danh sinh viên."}
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 2,
                  flexWrap: "wrap",
                  mb: 2,
                }}
              >
                <Chip
                  label={
                    role === "admin"
                      ? "👑 Quản trị viên"
                      : role === "organizer"
                      ? "🎯 Người tổ chức sự kiện"
                      : "🎓 Sinh viên"
                  }
                  sx={{
                    px: 3,
                    py: 3,
                    fontSize: "1.1rem",
                    fontWeight: 700,
                    background:
                      role === "admin"
                        ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                        : "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                    color: "#fff",
                    boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "scale(1.05)",
                      boxShadow: "0 8px 25px rgba(0,0,0,0.3)",
                    },
                  }}
                />
              </Box>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 3,
                  mt: 2,
                  flexWrap: "wrap",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    background: "rgba(102, 126, 234, 0.1)",
                    color: "#667eea",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  📅 Quản lý Sự kiện
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    background: "rgba(118, 75, 162, 0.1)",
                    color: "#764ba2",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  ✅ Điểm danh QR
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    background: "rgba(240, 147, 251, 0.1)",
                    color: "#f093fb",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  📊 Báo cáo & Thống kê
                </Typography>
              </Box>
            </Box>
          </Box>
        </Card>

        {/* Info Cards */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 4,
                background: "rgba(255, 255, 255, 0.98)",
                backdropFilter: "blur(20px)",
                boxShadow: "0 12px 40px rgba(102, 126, 234, 0.15)",
                border: "1px solid rgba(102, 126, 234, 0.1)",
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                position: "relative",
                overflow: "hidden",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "4px",
                  background: "linear-gradient(90deg, #667eea, #764ba2)",
                  transform: "scaleX(0)",
                  transformOrigin: "left",
                  transition: "transform 0.4s ease",
                },
                "&:hover": {
                  transform: "translateY(-12px) scale(1.02)",
                  boxShadow: "0 20px 60px rgba(102, 126, 234, 0.25)",
                  "&::before": {
                    transform: "scaleX(1)",
                  },
                },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <Avatar
                  sx={{
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    width: 64,
                    height: 64,
                    mr: 2,
                    boxShadow: "0 8px 20px rgba(102, 126, 234, 0.3)",
                  }}
                >
                  <EventIcon sx={{ color: "#fff", fontSize: 36 }} />
                </Avatar>
                <Box>
                  <Typography
                    variant="h5"
                    fontWeight={700}
                    color="#2d3748"
                    sx={{ mb: 0.5 }}
                  >
                    Quản lý Sự kiện
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontWeight: 600 }}
                  >
                    Event Management System
                  </Typography>
                </Box>
              </Box>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ lineHeight: 1.8, mb: 2 }}
              >
                Tạo, chỉnh sửa và quản lý các sự kiện của sinh viên tại NVH SV.
                Hỗ trợ tạo nhiều phiên (session) cho mỗi sự kiện.
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  flexWrap: "wrap",
                }}
              >
                <Chip
                  label="📝 Tạo sự kiện"
                  size="small"
                  sx={{
                    bgcolor: "#667eea15",
                    color: "#667eea",
                    fontWeight: 600,
                  }}
                />
                <Chip
                  label="🕐 Quản lý phiên"
                  size="small"
                  sx={{
                    bgcolor: "#764ba215",
                    color: "#764ba2",
                    fontWeight: 600,
                  }}
                />
                <Chip
                  label="👥 Quản lý sinh viên"
                  size="small"
                  sx={{
                    bgcolor: "#f093fb15",
                    color: "#f093fb",
                    fontWeight: 600,
                  }}
                />
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 4,
                background: "rgba(255, 255, 255, 0.98)",
                backdropFilter: "blur(20px)",
                boxShadow: "0 12px 40px rgba(118, 75, 162, 0.15)",
                border: "1px solid rgba(118, 75, 162, 0.1)",
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                position: "relative",
                overflow: "hidden",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "4px",
                  background: "linear-gradient(90deg, #764ba2, #f093fb)",
                  transform: "scaleX(0)",
                  transformOrigin: "left",
                  transition: "transform 0.4s ease",
                },
                "&:hover": {
                  transform: "translateY(-12px) scale(1.02)",
                  boxShadow: "0 20px 60px rgba(118, 75, 162, 0.25)",
                  "&::before": {
                    transform: "scaleX(1)",
                  },
                },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <Avatar
                  sx={{
                    background:
                      "linear-gradient(135deg, #764ba2 0%, #f093fb 100%)",
                    width: 64,
                    height: 64,
                    mr: 2,
                    boxShadow: "0 8px 20px rgba(118, 75, 162, 0.3)",
                  }}
                >
                  <CheckCircleIcon sx={{ color: "#fff", fontSize: 36 }} />
                </Avatar>
                <Box>
                  <Typography
                    variant="h5"
                    fontWeight={700}
                    color="#2d3748"
                    sx={{ mb: 0.5 }}
                  >
                    Điểm danh Nhanh
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontWeight: 600 }}
                  >
                    QR Check-in System
                  </Typography>
                </Box>
              </Box>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ lineHeight: 1.8, mb: 2 }}
              >
                Điểm danh sinh viên bằng QR code thông minh. Hỗ trợ check-in thủ
                công cho sinh viên không có thiết bị. Ghi nhận thời gian và vị
                trí chính xác.
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  flexWrap: "wrap",
                }}
              >
                <Chip
                  label="📱 Quét QR"
                  size="small"
                  sx={{
                    bgcolor: "#764ba215",
                    color: "#764ba2",
                    fontWeight: 600,
                  }}
                />
                <Chip
                  label="✍️ Check-in thủ công"
                  size="small"
                  sx={{
                    bgcolor: "#f093fb15",
                    color: "#f093fb",
                    fontWeight: 600,
                  }}
                />
                <Chip
                  label="🕒 Theo dõi thời gian"
                  size="small"
                  sx={{
                    bgcolor: "#f5576c15",
                    color: "#f5576c",
                    fontWeight: 600,
                  }}
                />
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 4,
                background: "rgba(255, 255, 255, 0.98)",
                backdropFilter: "blur(20px)",
                boxShadow: "0 12px 40px rgba(245, 87, 108, 0.15)",
                border: "1px solid rgba(245, 87, 108, 0.1)",
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                position: "relative",
                overflow: "hidden",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "4px",
                  background: "linear-gradient(90deg, #f5576c, #f093fb)",
                  transform: "scaleX(0)",
                  transformOrigin: "left",
                  transition: "transform 0.4s ease",
                },
                "&:hover": {
                  transform: "translateY(-12px) scale(1.02)",
                  boxShadow: "0 20px 60px rgba(245, 87, 108, 0.25)",
                  "&::before": {
                    transform: "scaleX(1)",
                  },
                },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <Avatar
                  sx={{
                    background:
                      "linear-gradient(135deg, #f5576c 0%, #f093fb 100%)",
                    width: 64,
                    height: 64,
                    mr: 2,
                    boxShadow: "0 8px 20px rgba(245, 87, 108, 0.3)",
                  }}
                >
                  <PeopleIcon sx={{ color: "#fff", fontSize: 36 }} />
                </Avatar>
                <Box>
                  <Typography
                    variant="h5"
                    fontWeight={700}
                    color="#2d3748"
                    sx={{ mb: 0.5 }}
                  >
                    Báo cáo & Thống kê
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontWeight: 600 }}
                  >
                    Reports & Analytics
                  </Typography>
                </Box>
              </Box>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ lineHeight: 1.8, mb: 2 }}
              >
                Xem báo cáo chi tiết về sự tham gia sinh viên. Thống kê theo
                trường, theo sự kiện, theo ngày. Xuất file Excel/PDF dễ dàng.
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  flexWrap: "wrap",
                }}
              >
                <Chip
                  label="📊 Dashboard thống kê"
                  size="small"
                  sx={{
                    bgcolor: "#f5576c15",
                    color: "#f5576c",
                    fontWeight: 600,
                  }}
                />
                <Chip
                  label="📥 Xuất Excel/PDF"
                  size="small"
                  sx={{
                    bgcolor: "#f093fb15",
                    color: "#f093fb",
                    fontWeight: 600,
                  }}
                />
                <Chip
                  label="📈 Phân tích xu hướng"
                  size="small"
                  sx={{
                    bgcolor: "#43e97b15",
                    color: "#43e97b",
                    fontWeight: 600,
                  }}
                />
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Dashboard;

// src/pages/Dashboard.jsx

import React from "react";
import { Typography, Box, Card, Avatar, Chip, Grid, Paper } from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import EventIcon from '@mui/icons-material/Event';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PeopleIcon from '@mui/icons-material/People';

const Dashboard = () => {
  const { user, role } = useAuth();
  const navigate = useNavigate();

  // Dashboard for Admin and Organizer
  return (
    <Box
      sx={{
        minHeight: "70vh",
        py: 6,
        px: 3,
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }}
    >
      <Box sx={{ maxWidth: 1200, mx: "auto" }}>
        {/* Main Welcome Card */}
        <Card
          elevation={0}
          sx={{
            p: 5,
            borderRadius: 4,
            mb: 4,
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
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
                bgcolor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", 
                width: 90, 
                height: 90, 
                mb: 3,
                boxShadow: "0 8px 24px rgba(102, 126, 234, 0.3)",
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
              fontWeight={700}
              sx={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                mb: 2,
                textAlign: "center",
              }}
            >
              Hệ thống Điểm danh Sự kiện
            </Typography>

            <Typography
              variant="h6"
              color="text.secondary"
              align="center"
              sx={{ 
                mb: 1,
                fontWeight: 500,
              }}
            >
              🏛️ Nhà Văn Hóa Sinh Viên TP.HCM
            </Typography>

            <Box
              sx={{
                mt: 3,
                p: 3,
                borderRadius: 3,
                background: "linear-gradient(135deg, #667eea15 0%, #764ba215 100%)",
                width: "100%",
                maxWidth: 600,
              }}
            >
              <Typography
                variant="h5"
                align="center"
                sx={{ 
                  fontWeight: 600,
                  color: "#2d3748",
                  mb: 1,
                }}
              >
                Xin chào, {user?.firstName || user?.username}! 👋
              </Typography>
              <Typography
                variant="body1"
                align="center"
                color="text.secondary"
                sx={{ mb: 2 }}
              >
                Chúc bạn có ngày làm việc hiệu quả và tràn đầy năng lượng!
              </Typography>
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <Chip
                  label={
                    role === "admin"
                      ? "👑 Quản trị viên"
                      : role === "organizer"
                      ? "🎯 Người tổ chức sự kiện"
                      : "🎓 Sinh viên"
                  }
                  sx={{
                    px: 2,
                    py: 2.5,
                    fontSize: "1rem",
                    fontWeight: 600,
                    background: role === "admin" 
                      ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                      : "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                    color: "#fff",
                    boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
                  }}
                />
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
                borderRadius: 3,
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(10px)",
                boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                transition: "transform 0.3s ease",
                "&:hover": {
                  transform: "translateY(-8px)",
                  boxShadow: "0 15px 40px rgba(0,0,0,0.15)",
                },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: "#667eea20",
                    width: 56,
                    height: 56,
                    mr: 2,
                  }}
                >
                  <EventIcon sx={{ color: "#667eea", fontSize: 32 }} />
                </Avatar>
                <Typography variant="h6" fontWeight={600} color="#2d3748">
                  Quản lý Sự kiện
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                Tạo, quản lý và theo dõi các sự kiện của sinh viên một cách dễ dàng và hiệu quả
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 3,
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(10px)",
                boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                transition: "transform 0.3s ease",
                "&:hover": {
                  transform: "translateY(-8px)",
                  boxShadow: "0 15px 40px rgba(0,0,0,0.15)",
                },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: "#764ba220",
                    width: 56,
                    height: 56,
                    mr: 2,
                  }}
                >
                  <CheckCircleIcon sx={{ color: "#764ba2", fontSize: 32 }} />
                </Avatar>
                <Typography variant="h6" fontWeight={600} color="#2d3748">
                  Điểm danh Nhanh
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                Hệ thống điểm danh thông minh giúp theo dõi sự tham gia của sinh viên chính xác
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 3,
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(10px)",
                boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                transition: "transform 0.3s ease",
                "&:hover": {
                  transform: "translateY(-8px)",
                  boxShadow: "0 15px 40px rgba(0,0,0,0.15)",
                },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: "#f5576c20",
                    width: 56,
                    height: 56,
                    mr: 2,
                  }}
                >
                  <PeopleIcon sx={{ color: "#f5576c", fontSize: 32 }} />
                </Avatar>
                <Typography variant="h6" fontWeight={600} color="#2d3748">
                  Báo cáo Chi tiết
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                Xem báo cáo và thống kê chi tiết về sự tham gia của sinh viên trong các sự kiện
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Dashboard;
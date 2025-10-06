// src/pages/Dashboard.jsx

import React from "react";
import { Typography, Box, Card, Avatar, Chip } from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user, role } = useAuth();
  const navigate = useNavigate();

  // Dashboard for Admin and Organizer
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "70vh",
      }}
    >
      <Card
        elevation={8}
        sx={{
          p: 5,
          borderRadius: 6,
          minWidth: 400,
          maxWidth: 500,
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          background: "linear-gradient(135deg, #74ebd5 0%, #ACB6E5 100%)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Avatar sx={{ bgcolor: "#fff", width: 72, height: 72, mb: 2 }}>
            <img
              src="https://img.icons8.com/fluency/64/000000/student-center.png"
              alt="dashboard"
              style={{ width: 56, height: 56 }}
            />
          </Avatar>
          <Typography
            variant="h4"
            fontWeight={700}
            color="#3a3a3a"
            align="center"
            mb={1}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 1,
              }}
            >
              <img
                src="https://img.icons8.com/fluency/64/000000/student-center.png"
                alt="Student Attendance Logo"
                style={{ width: 48, height: 48, marginRight: 12 }}
              />
              Student Attendance System
            </Box>
          </Typography>
          <Typography
            variant="body1"
            color="#5a5a5a"
            align="center"
            sx={{ lineHeight: 1.5, mb: 2 }}
          >
            🏛️ Hệ thống Điểm danh Sinh viên - Nhà Văn Hóa Sinh Viên TP.HCM
          </Typography>
          <Typography
            variant="h6"
            color="#5a5a5a"
            align="center"
            sx={{ lineHeight: 1.5 }}
          >
            Chào mừng {user?.firstName || user?.username}!
          </Typography>
          <Chip
            label={
              role === "admin"
                ? "Quản trị viên"
                : role === "organizer"
                ? "Người tổ chức sự kiện"
                : "Sinh viên"
            }
            color={role === "admin" ? "primary" : "secondary"}
            sx={{ mt: 2 }}
          />
        </Box>
      </Card>
    </Box>
  );
};

export default Dashboard;

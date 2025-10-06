// src/pages/Login.jsx
import React, { useState } from "react";
import {
  Box,
  Card,
  Typography,
  TextField,
  Button,
  Avatar,
  Divider,
} from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import { login as loginService } from "../services/authService";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await loginService(email, password);
      console.log("[Login] Full response data:", JSON.stringify(data, null, 2));
      console.log("[Login] User object:", JSON.stringify(data.user, null, 2));
      console.log("[Login] User role:", data.user.role);
      console.log("[Login] OrganizerId in user:", data.user.OrganizerId);

      // Lưu token vào localStorage để các service luôn lấy được
      localStorage.setItem("token", data.token);
      console.log("Token sau khi đăng nhập:", data.token); // Log kiểm tra token
      // Truyền toàn bộ user object và token để context nhận organizerId
      login(data.user, data.user.role, data.token);
      if (data.user.role === "student" || data.user.role === "organizer") {
        navigate("/"); // Hiển thị dashboard welcome cho student và organizer
      } else {
        navigate("/universities"); // Admin về trang quản lý
      }
    } catch (err) {
      setError(err.message || "Sai tài khoản hoặc mật khẩu!");
    }
    setLoading(false);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #74ebd5 0%, #ACB6E5 100%)",
      }}
    >
      <Card
        elevation={12}
        sx={{
          p: 5,
          borderRadius: 6,
          minWidth: 370,
          maxWidth: 400,
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
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
          <Avatar sx={{ bgcolor: "#74ebd5", width: 64, height: 64, mb: 1 }}>
            <img
              src="https://img.icons8.com/fluency/48/000000/student-male.png"
              alt="avatar"
              style={{ width: 48, height: 48 }}
            />
          </Avatar>
          <Typography
            variant="h5"
            fontWeight={700}
            color="#3a3a3a"
            align="center"
          >
            Đăng nhập hệ thống
          </Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />
        <form onSubmit={handleSubmit}>
          <TextField
            label="Email"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus
            sx={{ borderRadius: 2, background: "#f8fafc" }}
          />
          <TextField
            label="Mật khẩu"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ borderRadius: 2, background: "#f8fafc" }}
          />
          {error && (
            <Typography color="error" mt={1} align="center" fontWeight={500}>
              {error}
            </Typography>
          )}
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{
              mt: 2,
              py: 1.5,
              fontWeight: 700,
              fontSize: 17,
              background: "linear-gradient(90deg,#74ebd5,#ACB6E5)",
              boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
            }}
            disabled={loading}
          >
            {loading ? "Đang xử lý..." : "Đăng nhập"}
          </Button>
        </form>
        <Divider sx={{ my: 2 }} />
        <Box textAlign="center" color="#888">
          <Typography variant="body2" fontWeight={500} sx={{ mt: 2 }}>
            Chưa có tài khoản?{" "}
            <span
              style={{ color: "#1976d2", cursor: "pointer" }}
              onClick={() => (window.location.href = "/register")}
            >
              Đăng ký
            </span>
          </Typography>
        </Box>
      </Card>
    </Box>
  );
};

export default Login;

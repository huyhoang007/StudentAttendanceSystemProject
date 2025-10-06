import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  Typography,
  TextField,
  Button,
  Avatar,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { register as registerService } from "../services/authService";
import { getUniversities } from "../services/universityService";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    email: "",
    name: "",
    student_code: "",
    phone: "",
    university_id: "",
  });
  const [universities, setUniversities] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUniversities();
  }, []);

  const fetchUniversities = async () => {
    try {
      const data = await getUniversities();
      setUniversities(data);
    } catch (error) {
      console.error("Error fetching universities:", error);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (form.password !== form.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp!");
      return;
    }
    setLoading(true);
    try {
      const { confirmPassword: _confirmPassword, ...registerData } = form;
      await registerService({
        username: registerData.username,
        email: registerData.email,
        password: registerData.password,
        role: "student",
        name: registerData.name,
        studentCode: registerData.student_code,
        phone: registerData.phone,
        universityId: registerData.university_id || null,
      });
      setSuccess("Đăng ký thành công! Bạn có thể đăng nhập.");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.message || "Đăng ký thất bại!");
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
              src="https://img.icons8.com/fluency/48/000000/add-user-group-man-man.png"
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
            Đăng ký tài khoản
          </Typography>
          <Typography
            variant="body2"
            color="#888"
            align="center"
            sx={{ mt: 1 }}
          >
            Student Attendance System
          </Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />
        <form onSubmit={handleSubmit}>
          <TextField
            label="Tên đăng nhập"
            name="username"
            fullWidth
            margin="normal"
            value={form.username}
            onChange={handleChange}
            autoFocus
            sx={{ borderRadius: 2, background: "#f8fafc" }}
          />
          <TextField
            label="Họ tên"
            name="name"
            fullWidth
            margin="normal"
            value={form.name}
            onChange={handleChange}
            sx={{ borderRadius: 2, background: "#f8fafc" }}
          />
          <TextField
            label="Mã sinh viên"
            name="student_code"
            fullWidth
            margin="normal"
            value={form.student_code}
            onChange={handleChange}
            sx={{ borderRadius: 2, background: "#f8fafc" }}
          />
          <TextField
            label="Số điện thoại"
            name="phone"
            fullWidth
            margin="normal"
            value={form.phone}
            onChange={handleChange}
            sx={{ borderRadius: 2, background: "#f8fafc" }}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Chọn trường đại học</InputLabel>
            <Select
              label="Chọn trường đại học"
              name="university_id"
              value={form.university_id}
              onChange={handleChange}
              sx={{ borderRadius: 2, background: "#f8fafc" }}
            >
              <MenuItem value="">
                <em>Chọn trường của bạn</em>
              </MenuItem>
              {universities.map((university) => (
                <MenuItem
                  key={university.universityId || university.university_id}
                  value={university.universityId || university.university_id}
                >
                  {university.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Email"
            name="email"
            type="email"
            fullWidth
            margin="normal"
            value={form.email}
            onChange={handleChange}
            sx={{ borderRadius: 2, background: "#f8fafc" }}
          />
          <TextField
            label="Mật khẩu"
            name="password"
            type="password"
            fullWidth
            margin="normal"
            value={form.password}
            onChange={handleChange}
            sx={{ borderRadius: 2, background: "#f8fafc" }}
          />
          <TextField
            label="Xác nhận mật khẩu"
            name="confirmPassword"
            type="password"
            fullWidth
            margin="normal"
            value={form.confirmPassword}
            onChange={handleChange}
            sx={{ borderRadius: 2, background: "#f8fafc" }}
          />
          {error && (
            <Typography color="error" mt={1} align="center" fontWeight={500}>
              {error}
            </Typography>
          )}
          {success && (
            <Typography
              color="success.main"
              mt={1}
              align="center"
              fontWeight={500}
            >
              {success}
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
            {loading ? "Đang xử lý..." : "Đăng ký"}
          </Button>
        </form>
        <Divider sx={{ my: 2 }} />
        <Box textAlign="center" color="#888">
          <Typography variant="body2" fontWeight={500}>
            Đã có tài khoản?{" "}
            <span
              style={{ color: "#74ebd5", cursor: "pointer" }}
              onClick={() => navigate("/login")}
            >
              Đăng nhập
            </span>
          </Typography>
        </Box>
      </Card>
    </Box>
  );
};

export default Register;

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
  Alert,
  CircularProgress,
} from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import { getUniversities } from "../services/universityService";
import { getStudentByUserId, updateStudent } from "../services/studentService";

const Profile = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: "",
    student_code: "",
    email: "",
    phone: "",
    university_id: "",
  });
  const [universities, setUniversities] = useState([]);
  const [studentId, setStudentId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch universities
      const universitiesData = await getUniversities();
      setUniversities(universitiesData);

      // Fetch student info if user exists
      if (user?.userId) {
        const studentData = await getStudentByUserId(user.userId);
        if (studentData) {
          setStudentId(studentData.student_id || studentData.studentId);
          setForm({
            name: studentData.name || "",
            student_code:
              studentData.student_code || studentData.studentCode || "",
            email: studentData.email || "",
            phone: studentData.phone || "",
            university_id:
              studentData.university_id || studentData.universityId || "",
          });
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setMessage({ text: "Có lỗi khi tải thông tin profile", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: "", type: "" });

    try {
      if (studentId) {
        await updateStudent(studentId, form);
        setMessage({ text: "Cập nhật thông tin thành công!", type: "success" });
      } else {
        setMessage({
          text: "Không tìm thấy thông tin sinh viên",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage({ text: "Có lỗi khi cập nhật thông tin", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <Card
        elevation={24}
        sx={{
          maxWidth: 500,
          width: "100%",
          borderRadius: 4,
          overflow: "hidden",
          background: "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)",
        }}
      >
        <Box
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            p: 4,
            textAlign: "center",
          }}
        >
          <Avatar
            sx={{
              width: 80,
              height: 80,
              mx: "auto",
              mb: 2,
              bgcolor: "rgba(255,255,255,0.2)",
              fontSize: "2rem",
            }}
          >
            {form.name.charAt(0).toUpperCase()}
          </Avatar>
          <Typography variant="h4" fontWeight="bold">
            Thông tin cá nhân
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9, mt: 1 }}>
            Cập nhật thông tin sinh viên
          </Typography>
        </Box>

        <Box sx={{ p: 4 }}>
          {message.text && (
            <Alert severity={message.type} sx={{ mb: 3 }}>
              {message.text}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              label="Họ và tên"
              name="name"
              fullWidth
              margin="normal"
              value={form.name}
              onChange={handleChange}
              required
              sx={{ borderRadius: 2, background: "#f8fafc" }}
            />
            <TextField
              label="Mã sinh viên"
              name="student_code"
              fullWidth
              margin="normal"
              value={form.student_code}
              onChange={handleChange}
              required
              sx={{ borderRadius: 2, background: "#f8fafc" }}
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              fullWidth
              margin="normal"
              value={form.email}
              onChange={handleChange}
              required
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

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={saving}
              sx={{
                mt: 3,
                py: 1.5,
                borderRadius: 2,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                fontSize: "1.1rem",
                fontWeight: "bold",
                textTransform: "none",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)",
                },
              }}
            >
              {saving ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Cập nhật thông tin"
              )}
            </Button>
          </form>
        </Box>
      </Card>
    </Box>
  );
};

export default Profile;

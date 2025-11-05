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
  Paper,
  Container,
  InputAdornment,
  Snackbar,
} from "@mui/material";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Person, Save } from '@mui/icons-material';
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

  const purpleTheme = createTheme({
    palette: {
      primary: { main: '#673ab7' },
      background: { default: '#f3e5f5' },
    },
  });

  return (
    <ThemeProvider theme={purpleTheme}>
      <Container
        maxWidth="sm"
        sx={{
          position: "relative",
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 'calc(100vh - 64px)',
          pb: 4,
          pt: 2,
          backgroundColor: purpleTheme.palette.background.default,
        }}
      >
        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(135deg, rgba(159,94,235,0.06), rgba(190,150,240,0.04))', borderRadius: 3, zIndex: -1 }} />
        <Paper elevation={3} sx={{ p: { xs: 3, md: 4 }, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 500 }}>
          <Avatar sx={{ width: 80, height: 80, m: 1, background: 'linear-gradient(45deg, #7e57c2 30%, #9c27b0 90%)', boxShadow: '0 3px 15px rgba(126,87,194,0.4)', transition: 'transform 0.3s', '&:hover': { transform: 'scale(1.1)' } }}>
            <Person sx={{ fontSize: 40, color: 'white' }} />
          </Avatar>
          <Typography component="h1" variant="h4" gutterBottom sx={{ fontWeight: 700, background: 'linear-gradient(45deg, #42a5f5 30%, #673ab7 90%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', color: 'transparent', textAlign: 'center', mb: 1 }}>Thông tin cá nhân</Typography>
          <Typography variant="body1" align="center" sx={{ mb: 3, fontSize: '1.1rem', maxWidth: '80%', lineHeight: 1.6, background: 'linear-gradient(45deg, #42a5f5 30%, #673ab7 90%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', color: 'transparent' }}>Cập nhật thông tin sinh viên.</Typography>

          {message.text && (
            <Alert severity={message.type} sx={{ mb: 3, width: '100%' }}>{message.text}</Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
            <TextField fullWidth label="Họ và tên" name="name" value={form.name} onChange={handleChange} required margin="normal" InputProps={{ startAdornment: (<InputAdornment position="start"><Person /></InputAdornment>) }} />
            <TextField fullWidth label="Mã sinh viên" name="student_code" value={form.student_code} onChange={handleChange} required margin="normal" />
            <TextField fullWidth label="Email" name="email" type="email" value={form.email} onChange={handleChange} required margin="normal" />
            <TextField fullWidth label="Số điện thoại" name="phone" value={form.phone} onChange={handleChange} margin="normal" />

            <FormControl fullWidth margin="normal">
              <InputLabel>Chọn trường đại học</InputLabel>
              <Select label="Chọn trường đại học" name="university_id" value={form.university_id} onChange={handleChange}>
                <MenuItem value=""><em>Chọn trường của bạn</em></MenuItem>
                {universities.map((university) => (
                  <MenuItem key={university.universityId || university.university_id} value={university.universityId || university.university_id}>{university.name}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button type="submit" fullWidth variant="contained" color="primary" disabled={saving} startIcon={<Save />} sx={{ mt: 3, py: 1.5, fontWeight: 600 }}>
              {saving ? <CircularProgress size={24} color="inherit" /> : 'Cập nhật thông tin'}
            </Button>
          </Box>
        </Paper>
      </Container>
    </ThemeProvider>
  );
};

export default Profile;

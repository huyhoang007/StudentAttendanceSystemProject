// src/pages/Students.jsx

import React, { useEffect, useState } from "react";
import {
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Alert,
  CircularProgress,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  UploadFile,
  People as PeopleIcon,
  CloudUpload,
} from "@mui/icons-material";
import {
  getStudents,
  addStudent,
  updateStudent,
  deleteStudent,
  importStudentsFromFile,
} from "../services/studentService";
import { getUniversities, addUniversity } from "../services/universityService";

const Students = () => {
  const [data, setData] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [open, setOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    student_code: "",
    email: "",
    phone: "",
    university_id: "",
    // Thông tin trường mới (nếu không chọn từ danh sách)
    new_university_name: "",
    new_university_address: "",
    new_university_contact: "",
  });
  const [isNewUniversity, setIsNewUniversity] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const fetchData = async () => {
    const res = await getStudents();
    console.log("Students data:", res); // Debug log
    setData([...res]);
  };

  const fetchUniversities = async () => {
    const res = await getUniversities();
    setUniversities([...res]);
  };

  useEffect(() => {
    fetchData();
    fetchUniversities();
  }, []);

  const handleOpen = (item = null) => {
    setEditId(item ? item.student_id : null);
    setForm(
      item
        ? {
            name: item.name,
            student_code: item.student_code,
            email: item.email,
            phone: item.phone,
            university_id: item.university_id,
            new_university_name: "",
            new_university_address: "",
            new_university_contact: "",
          }
        : {
            name: "",
            student_code: "",
            email: "",
            phone: "",
            university_id: "",
            new_university_name: "",
            new_university_address: "",
            new_university_contact: "",
          }
    );
    setIsNewUniversity(false);
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const handleSave = async () => {
    try {
      let universityId = form.university_id;

      // Nếu sinh viên chọn tạo trường mới
      if (isNewUniversity && form.new_university_name.trim()) {
        // Tạo trường mới trước
        const newUniversity = {
          name: form.new_university_name.trim(),
          address: form.new_university_address.trim(),
          contact_info: form.new_university_contact.trim(),
        };

        const createdUniversity = await addUniversity(newUniversity);
        universityId = createdUniversity.universityId;

        // Cập nhật lại danh sách trường
        await fetchUniversities();

        setSnackbar({
          open: true,
          message: `Đã tạo trường mới: ${newUniversity.name}`,
          severity: "success",
        });
      }

      // Tạo/cập nhật sinh viên với university_id mới hoặc đã chọn
      const studentData = {
        name: form.name,
        student_code: form.student_code,
        email: form.email,
        phone: form.phone,
        university_id: universityId,
      };

      if (editId) {
        await updateStudent(editId, studentData);
      } else {
        await addStudent(studentData);
      }

      setOpen(false);
      fetchData();

      setSnackbar({
        open: true,
        message: editId ? "Đã cập nhật sinh viên" : "Đã thêm sinh viên mới",
        severity: "success",
      });
    } catch (error) {
      console.error("Lỗi khi lưu:", error);
      setSnackbar({
        open: true,
        message: "Có lỗi xảy ra khi lưu thông tin",
        severity: "error",
      });
    }
  };
  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa?")) {
      await deleteStudent(id);
      fetchData();
    }
  };

  const handleFileSelect = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      setSnackbar({
        open: true,
        message: "Vui lòng chọn file để upload",
        severity: "error",
      });
      return;
    }

    setUploading(true);
    try {
      const result = await importStudentsFromFile(selectedFile);
      setSnackbar({
        open: true,
        message: `Đã import thành công ${result.successfulImports}/${result.totalRecords} sinh viên`,
        severity: "success",
      });
      setSelectedFile(null);
      setUploadOpen(false);
      fetchData();
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Lỗi import: ${error.message}`,
        severity: "error",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box sx={{ p: 2, display: "flex", justifyContent: "center" }}>
      <Box sx={{ width: "100%", maxWidth: 900 }}>
        <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 2 }}>
          <PeopleIcon sx={{ fontSize: 40, color: "#74ebd5" }} />
          <Typography variant="h5" fontWeight={700} color="#3a3a3a">
            Quản lý Sinh viên
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          sx={{
            mb: 2,
            mr: 2,
            fontWeight: 600,
            background: "linear-gradient(90deg,#74ebd5,#ACB6E5)",
          }}
          onClick={() => handleOpen()}
        >
          Thêm sinh viên
        </Button>
        <Button
          variant="outlined"
          startIcon={<UploadFile />}
          sx={{
            mb: 2,
            fontWeight: 600,
            color: "#74ebd5",
            borderColor: "#74ebd5",
          }}
          onClick={() => setUploadOpen(true)}
        >
          Import Excel/CSV
        </Button>
        <Box sx={{ background: "#fff", borderRadius: 3, boxShadow: 2, p: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Tên</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Mã SV</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Điện thoại</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Trường</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  Thao tác
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((s) => (
                <TableRow key={s.student_id}>
                  <TableCell>{s.name}</TableCell>
                  <TableCell>{s.student_code}</TableCell>
                  <TableCell>{s.email}</TableCell>
                  <TableCell>{s.phone}</TableCell>
                  <TableCell>
                    {s.university_name || "Chưa chọn trường"}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton color="primary" onClick={() => handleOpen(s)}>
                      <Edit />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(s.student_id)}
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
        <Dialog open={open} onClose={handleClose}>
          <DialogTitle sx={{ fontWeight: 700 }}>
            {editId ? "Sửa sinh viên" : "Thêm sinh viên"}
          </DialogTitle>
          <DialogContent>
            <TextField
              label="Tên"
              fullWidth
              margin="normal"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              sx={{ borderRadius: 2, background: "#f8fafc" }}
            />
            <TextField
              label="Mã SV"
              fullWidth
              margin="normal"
              value={form.student_code}
              onChange={(e) =>
                setForm({ ...form, student_code: e.target.value })
              }
              sx={{ borderRadius: 2, background: "#f8fafc" }}
            />
            <TextField
              label="Email"
              fullWidth
              margin="normal"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              sx={{ borderRadius: 2, background: "#f8fafc" }}
            />
            <TextField
              label="Điện thoại"
              fullWidth
              margin="normal"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              sx={{ borderRadius: 2, background: "#f8fafc" }}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Trường đại học</InputLabel>
              <Select
                value={isNewUniversity ? "new" : form.university_id}
                label="Trường đại học"
                onChange={(e) => {
                  if (e.target.value === "new") {
                    setIsNewUniversity(true);
                    setForm({ ...form, university_id: "" });
                  } else {
                    setIsNewUniversity(false);
                    setForm({ ...form, university_id: e.target.value });
                  }
                }}
                sx={{ borderRadius: 2, background: "#f8fafc" }}
              >
                <MenuItem value="">Chọn trường...</MenuItem>
                {universities.map((university) => (
                  <MenuItem
                    key={university.universityId}
                    value={university.universityId}
                  >
                    {university.name}
                  </MenuItem>
                ))}
                <MenuItem
                  value="new"
                  sx={{ color: "primary.main", fontWeight: "bold" }}
                >
                  ➕ Thêm trường mới
                </MenuItem>
              </Select>
            </FormControl>

            {/* Form cho trường mới */}
            {isNewUniversity && (
              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  border: "1px solid #e0e0e0",
                  borderRadius: 2,
                  bgcolor: "#f9f9f9",
                }}
              >
                <Typography variant="h6" sx={{ mb: 2, color: "primary.main" }}>
                  Thông tin trường mới
                </Typography>
                <TextField
                  label="Tên trường đại học *"
                  fullWidth
                  margin="normal"
                  value={form.new_university_name}
                  onChange={(e) =>
                    setForm({ ...form, new_university_name: e.target.value })
                  }
                  sx={{ borderRadius: 2, background: "#fff" }}
                  required
                />
                <TextField
                  label="Địa chỉ trường"
                  fullWidth
                  margin="normal"
                  value={form.new_university_address}
                  onChange={(e) =>
                    setForm({ ...form, new_university_address: e.target.value })
                  }
                  sx={{ borderRadius: 2, background: "#fff" }}
                  multiline
                  rows={2}
                />
                <TextField
                  label="Thông tin liên hệ"
                  fullWidth
                  margin="normal"
                  value={form.new_university_contact}
                  onChange={(e) =>
                    setForm({ ...form, new_university_contact: e.target.value })
                  }
                  sx={{ borderRadius: 2, background: "#fff" }}
                  placeholder="VD: Tel: 024-xxx-xxxx | Email: info@university.edu.vn"
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Hủy</Button>
            <Button
              onClick={handleSave}
              variant="contained"
              disabled={
                !form.name.trim() ||
                !form.student_code.trim() ||
                !form.email.trim() ||
                (isNewUniversity && !form.new_university_name.trim()) ||
                (!isNewUniversity && !form.university_id)
              }
              sx={{
                fontWeight: 600,
                background: "linear-gradient(90deg,#74ebd5,#ACB6E5)",
              }}
            >
              Lưu
            </Button>
          </DialogActions>
        </Dialog>

        {/* Upload Dialog */}
        <Dialog
          open={uploadOpen}
          onClose={() => setUploadOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Import Sinh viên từ File</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <input
                accept=".csv,.xlsx,.xls"
                style={{ display: "none" }}
                id="file-upload"
                type="file"
                onChange={handleFileSelect}
              />
              <label htmlFor="file-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<CloudUpload />}
                  sx={{ mb: 2 }}
                >
                  Chọn File CSV/Excel
                </Button>
              </label>

              {selectedFile && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  Đã chọn file: {selectedFile.name}
                </Alert>
              )}

              <Alert severity="info" sx={{ mb: 2 }}>
                Format file CSV: Name, StudentCode, Email, UniversityName, Phone
              </Alert>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setUploadOpen(false)}>Hủy</Button>
            <Button
              onClick={handleFileUpload}
              variant="contained"
              disabled={!selectedFile || uploading}
              startIcon={
                uploading ? <CircularProgress size={20} /> : <UploadFile />
              }
              sx={{
                fontWeight: 600,
                background: "linear-gradient(90deg,#74ebd5,#ACB6E5)",
              }}
            >
              {uploading ? "Đang upload..." : "Upload"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default Students;

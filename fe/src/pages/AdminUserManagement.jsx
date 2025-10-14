// src/pages/AdminUserManagement.jsx

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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Card,
  CardContent,
  Grid,
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  Lock,
  LockOpen,
  Refresh,
  AdminPanelSettings,
  People,
  PersonAdd,
} from "@mui/icons-material";
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  resetPassword,
} from "../services/userService";
import { getUniversities } from "../services/universityService";
import { useAuth } from "../contexts/AuthContext";

const AdminUserManagement = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "organizer",
    universityId: "",
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Lỗi tải danh sách: ${error.message}`,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUniversities = async () => {
    try {
      const data = await getUniversities();
      setUniversities(data);
    } catch (error) {
      console.error("Error fetching universities:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchUniversities();
  }, []);

  const handleOpen = (user = null) => {
    // Check permissions when editing
    if (user && !canModifyUser(user)) {
      setSnackbar({
        open: true,
        message: "Bạn không có quyền chỉnh sửa Quản trị viên khác!",
        severity: "error",
      });
      return;
    }

    setEditId(user ? user.userId : null);
    setForm(
      user
        ? {
            username: user.username,
            email: user.email,
            password: "",
            role: user.role,
            universityId: user.universityId || "",
            name: user.name || "",
            studentCode: user.studentCode || "",
            phone: user.phone || "",
          }
        : {
            username: "",
            email: "",
            password: "",
            role: "organizer",
            universityId: "",
            name: "",
            studentCode: "",
            phone: "",
          }
    );
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setForm({
      username: "",
      email: "",
      password: "",
      role: "organizer",
      universityId: "",
      name: "",
      studentCode: "",
      phone: "",
    });
  };

  const handleSave = async () => {
    try {
      // Validation
      if ((form.role === "organizer" || form.role === "student") && !form.universityId) {
        setSnackbar({
          open: true,
          message: "Vui lòng chọn trường đại học cho Người Tổ Chức/Sinh Viên!",
          severity: "error",
        });
        return;
      }
      
      // Additional validation for student
      if (form.role === "student") {
        if (!form.name || !form.studentCode) {
          setSnackbar({
            open: true,
            message: "Vui lòng nhập đầy đủ họ tên và mã sinh viên!",
            severity: "error",
          });
          return;
        }
      }
      
      if (editId) {
        await updateUser(editId, form);
        setSnackbar({
          open: true,
          message: "Cập nhật người dùng thành công!",
          severity: "success",
        });
      } else {
        await createUser(form);
        setSnackbar({
          open: true,
          message: "Tạo người dùng thành công!",
          severity: "success",
        });
      }
      setOpen(false);
      fetchUsers();
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Lỗi: ${error.message}`,
        severity: "error",
      });
    }
  };

  const handleDelete = async (userId) => {
    // Find the user to check permissions
    const targetUser = users.find(u => u.userId === userId);
    if (!canModifyUser(targetUser)) {
      setSnackbar({
        open: true,
        message: "Bạn không có quyền xóa Quản trị viên khác!",
        severity: "error",
      });
      return;
    }

    if (window.confirm("Bạn có chắc muốn xóa người dùng này?")) {
      try {
        await deleteUser(userId);
        setSnackbar({
          open: true,
          message: "Xóa người dùng thành công!",
          severity: "success",
        });
        fetchUsers();
      } catch (error) {
        setSnackbar({
          open: true,
          message: `Lỗi xóa: ${error.message}`,
          severity: "error",
        });
      }
    }
  };

  const handleResetPassword = async (userId) => {
    if (window.confirm("Bạn có chắc muốn đặt lại mật khẩu của người dùng này?")) {
      try {
        const result = await resetPassword(userId);
        setSnackbar({
          open: true,
          message: `Đặt lại thành công! Mật khẩu mới: ${result.newPassword}`,
          severity: "success",
        });
      } catch (error) {
        setSnackbar({
          open: true,
          message: `Lỗi đặt lại: ${error.message}`,
          severity: "error",
        });
      }
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return "error";
      case "organizer":
        return "warning";
      case "student":
        return "info";
      default:
        return "default";
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "admin":
        return <AdminPanelSettings />;
      case "organizer":
        return <People />;
      case "student":
        return <PersonAdd />;
      default:
        return <People />;
    }
  };

  // Check if current user can edit/delete another user
  const canModifyUser = (targetUser) => {
    // Admin cannot modify other admins (except themselves for profile updates)
    if (targetUser.role === "admin" && targetUser.userId !== currentUser?.userId) {
      return false;
    }
    return true;
  };

  // Stats calculation
  const stats = {
    total: users.length,
    admins: users.filter((u) => u.role === "admin").length,
    organizers: users.filter((u) => u.role === "organizer").length,
    students: users.filter((u) => u.role === "student").length,
    active: users.filter((u) => u.isActive).length,
  };

  return (
    <Box sx={{ p: 2, display: "flex", justifyContent: "center" }}>
      <Box sx={{ width: "100%", maxWidth: 1200 }}>
        <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2 }}>
          <AdminPanelSettings sx={{ fontSize: 40, color: "#74ebd5" }} />
          <Typography variant="h5" fontWeight={700} color="#3a3a3a">
            Quản lý Người dùng
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card
              sx={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              }}
            >
              <CardContent sx={{ color: "white", textAlign: "center" }}>
                <Typography variant="h4" fontWeight={700}>
                  {stats.total}
                </Typography>
                <Typography variant="body2">Tổng Người dùng</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card
              sx={{
                background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
              }}
            >
              <CardContent sx={{ color: "white", textAlign: "center" }}>
                <Typography variant="h4" fontWeight={700}>
                  {stats.admins}
                </Typography>
                <Typography variant="body2">Quản Trị Viên</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card
              sx={{
                background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
              }}
            >
              <CardContent sx={{ color: "white", textAlign: "center" }}>
                <Typography variant="h4" fontWeight={700}>
                  {stats.organizers}
                </Typography>
                <Typography variant="body2">Người Tổ Chức</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card
              sx={{
                background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
              }}
            >
              <CardContent sx={{ color: "white", textAlign: "center" }}>
                <Typography variant="h4" fontWeight={700}>
                  {stats.students}
                </Typography>
                <Typography variant="body2">Sinh Viên</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Action Buttons */}
        <Box sx={{ mb: 2, display: "flex", gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            sx={{
              fontWeight: 600,
              background: "linear-gradient(90deg,#74ebd5,#ACB6E5)",
            }}
            onClick={() => handleOpen()}
          >
            Tạo Người dùng Mới
          </Button>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            sx={{
              fontWeight: 600,
              color: "#74ebd5",
              borderColor: "#74ebd5",
            }}
            onClick={fetchUsers}
            disabled={loading}
          >
            Làm mới
          </Button>
        </Box>

        {/* Users Table */}
        <Box sx={{ background: "#fff", borderRadius: 3, boxShadow: 2, p: 2 }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Username</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Trường</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Ngày tạo</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.userId}>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip
                        icon={getRoleIcon(user.role)}
                        label={user.role}
                        color={getRoleColor(user.role)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {user.universityName || "N/A"}
                    </TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                    </TableCell>
                    <TableCell>
                      {canModifyUser(user) && (
                        <IconButton
                          onClick={() => handleOpen(user)}
                          sx={{ color: "#74ebd5" }}
                        >
                          <Edit />
                        </IconButton>
                      )}
                      {canModifyUser(user) && (
                        <IconButton
                          onClick={() => handleResetPassword(user.userId)}
                          sx={{ color: "#f39c12" }}
                        >
                          <Refresh />
                        </IconButton>
                      )}
                      {canModifyUser(user) && (
                        <IconButton
                          onClick={() => handleDelete(user.userId)}
                          sx={{ color: "#e74c3c" }}
                        >
                          <Delete />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Box>

        {/* Create/Edit User Dialog */}
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editId ? "Chỉnh sửa User" : "Tạo User Mới"}
          </DialogTitle>
          <DialogContent>
            <TextField
              label="Username"
              fullWidth
              margin="normal"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              sx={{ borderRadius: 2, background: "#f8fafc" }}
            />
            <TextField
              label="Email"
              type="email"
              fullWidth
              margin="normal"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              sx={{ borderRadius: 2, background: "#f8fafc" }}
            />
            {!editId && (
              <TextField
                label="Mật khẩu"
                type="password"
                fullWidth
                margin="normal"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                sx={{ borderRadius: 2, background: "#f8fafc" }}
              />
            )}
            <FormControl fullWidth margin="normal">
              <InputLabel>Role</InputLabel>
              <Select
                value={form.role}
                label="Role"
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                sx={{ borderRadius: 2, background: "#f8fafc" }}
              >
                <MenuItem value="admin">Quản Trị Viên</MenuItem>
                <MenuItem value="organizer">Người Tổ Chức</MenuItem>
                <MenuItem value="student">Sinh Viên</MenuItem>
              </Select>
            </FormControl>
            
            {/* University selection - only show for organizer and student */}
            {(form.role === "organizer" || form.role === "student") && (
              <FormControl fullWidth margin="normal">
                <InputLabel>Trường đại học</InputLabel>
                <Select
                  value={form.universityId}
                  label="Trường đại học"
                  onChange={(e) => setForm({ ...form, universityId: e.target.value })}
                  sx={{ borderRadius: 2, background: "#f8fafc" }}
                >
                  {universities.map((university) => (
                    <MenuItem key={university.universityId} value={university.universityId}>
                      {university.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {/* Additional fields for student */}
            {form.role === "student" && (
              <>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Họ và tên"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  sx={{ borderRadius: 2, background: "#f8fafc" }}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Mã sinh viên"
                  required
                  value={form.studentCode}
                  onChange={(e) => setForm({ ...form, studentCode: e.target.value })}
                  sx={{ borderRadius: 2, background: "#f8fafc" }}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Số điện thoại"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  sx={{ borderRadius: 2, background: "#f8fafc" }}
                />
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Hủy</Button>
            <Button
              onClick={handleSave}
              variant="contained"
              sx={{
                fontWeight: 600,
                background: "linear-gradient(90deg,#74ebd5,#ACB6E5)",
              }}
            >
              {editId ? "Cập nhật" : "Tạo"}
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

export default AdminUserManagement;

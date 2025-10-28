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
  TablePagination,
  Container,
  Stack,
  Avatar,
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  Refresh,
  AdminPanelSettings,
  People,
  PersonAdd,
  Group,
  Settings,
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
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
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
      setPage(0);
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
      if (
        (form.role === "organizer" || form.role === "student") &&
        !form.universityId
      ) {
        setSnackbar({
          open: true,
          message: "Vui lòng chọn trường đại học cho Người Tổ Chức/Sinh Viên!",
          severity: "error",
        });
        return;
      }

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
    const targetUser = users.find((u) => u.userId === userId);

    if (!canModifyUser(targetUser)) {
      setSnackbar({
        open: true,
        message: "Bạn không có quyền xóa người dùng này!",
        severity: "error",
      });
      return;
    }

    if (!canDeleteUser(targetUser)) {
      setSnackbar({
        open: true,
        message: "Không thể xóa tài khoản Quản trị viên!",
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
    if (
      window.confirm("Bạn có chắc muốn đặt lại mật khẩu của người dùng này?")
    ) {
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
        return "#7c3aed";
      case "organizer":
        return "#9333ea";
      case "student":
        return "#a855f7";
      default:
        return "#9ca3af";
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "admin":
        return <AdminPanelSettings sx={{ fontSize: 16 }} />;
      case "organizer":
        return <People sx={{ fontSize: 16 }} />;
      case "student":
        return <PersonAdd sx={{ fontSize: 16 }} />;
      default:
        return <People sx={{ fontSize: 16 }} />;
    }
  };

  const canModifyUser = (targetUser) => {
    if (
      targetUser.role === "admin" &&
      targetUser.userId !== currentUser?.userId
    ) {
      return false;
    }
    return true;
  };

  const canDeleteUser = (targetUser) => {
    if (targetUser.role === "admin") {
      return false;
    }
    return true;
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredUsers = users.filter(
    (user) => user.userId !== currentUser?.userId
  );

  const stats = {
    total: users.length,
    admins: users.filter((u) => u.role === "admin").length,
    organizers: users.filter((u) => u.role === "organizer").length,
    students: users.filter((u) => u.role === "student").length,
  };

  return (
    <Box sx={{ backgroundColor: "#f3f0ff", minHeight: "100vh", py: 3 }}>
      <Container maxWidth="lg">
        {/* Header - Giống mẫu */}
        <Card
          sx={{
            mb: 3,
            borderRadius: "20px",
            background: "linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)",
            boxShadow: "0 8px 24px rgba(124, 58, 237, 0.3)",
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar
                sx={{
                  width: 56,
                  height: 56,
                  bgcolor: "rgba(255,255,255,0.2)",
                }}
              >
                <Settings sx={{ fontSize: 32, color: "#fff" }} />
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h5" fontWeight={700} color="#fff">
                  Quản lý Người dùng
                </Typography>
                <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.9)" }}>
                  Tri thức & Uyên tín — Nền tảng học thuật hiện đại
                </Typography>
              </Box>
              <Stack direction="row" spacing={1.5}>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => handleOpen()}
                  sx={{
                    bgcolor: "rgba(255,255,255,0.95)",
                    color: "#7c3aed",
                    borderRadius: "12px",
                    px: 2.5,
                    textTransform: "none",
                    fontWeight: 600,
                    "&:hover": {
                      bgcolor: "#fff",
                      transform: "translateY(-2px)",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    },
                  }}
                >
                  Tạo người dùng mới
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={fetchUsers}
                  disabled={loading}
                  sx={{
                    borderColor: "rgba(255,255,255,0.5)",
                    color: "#fff",
                    borderRadius: "12px",
                    px: 2.5,
                    textTransform: "none",
                    fontWeight: 600,
                    "&:hover": {
                      borderColor: "#fff",
                      bgcolor: "rgba(255,255,255,0.1)",
                    },
                  }}
                >
                  Làm mới
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {/* Stats Cards - Giống mẫu */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                borderRadius: "16px",
                background: "linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)",
                boxShadow: "0 4px 12px rgba(124, 58, 237, 0.2)",
                transition: "transform 0.2s",
                "&:hover": { transform: "translateY(-4px)" },
              }}
            >
              <CardContent sx={{ textAlign: "center", py: 3 }}>
                <Group sx={{ fontSize: 40, color: "#fff", mb: 1 }} />
                <Typography variant="h3" fontWeight={700} color="#fff">
                  {stats.total}
                </Typography>
                <Typography variant="body2" color="rgba(255,255,255,0.9)">
                  Total User
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                borderRadius: "16px",
                background: "linear-gradient(135deg, #8b5cf6 0%, #9333ea 100%)",
                boxShadow: "0 4px 12px rgba(139, 92, 246, 0.2)",
                transition: "transform 0.2s",
                "&:hover": { transform: "translateY(-4px)" },
              }}
            >
              <CardContent sx={{ textAlign: "center", py: 3 }}>
                <AdminPanelSettings sx={{ fontSize: 40, color: "#fff", mb: 1 }} />
                <Typography variant="h3" fontWeight={700} color="#fff">
                  {stats.admins}
                </Typography>
                <Typography variant="body2" color="rgba(255,255,255,0.9)">
                  Quản Trị Viên
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                borderRadius: "16px",
                background: "linear-gradient(135deg, #9333ea 0%, #a855f7 100%)",
                boxShadow: "0 4px 12px rgba(147, 51, 234, 0.2)",
                transition: "transform 0.2s",
                "&:hover": { transform: "translateY(-4px)" },
              }}
            >
              <CardContent sx={{ textAlign: "center", py: 3 }}>
                <People sx={{ fontSize: 40, color: "#fff", mb: 1 }} />
                <Typography variant="h3" fontWeight={700} color="#fff">
                  {stats.organizers}
                </Typography>
                <Typography variant="body2" color="rgba(255,255,255,0.9)">
                  Người Tổ Chức
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                borderRadius: "16px",
                background: "linear-gradient(135deg, #a855f7 0%, #c084fc 100%)",
                boxShadow: "0 4px 12px rgba(168, 85, 247, 0.2)",
                transition: "transform 0.2s",
                "&:hover": { transform: "translateY(-4px)" },
              }}
            >
              <CardContent sx={{ textAlign: "center", py: 3 }}>
                <PersonAdd sx={{ fontSize: 40, color: "#fff", mb: 1 }} />
                <Typography variant="h3" fontWeight={700} color="#fff">
                  {stats.students}
                </Typography>
                <Typography variant="body2" color="rgba(255,255,255,0.9)">
                  Sinh Viên
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Table Section */}
        <Card sx={{ borderRadius: "16px", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}>
          <CardContent sx={{ p: 0 }}>
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                <CircularProgress sx={{ color: "#7c3aed" }} />
              </Box>
            ) : (
              <>
                <Table>
                  <TableHead sx={{ bgcolor: "#f9fafb" }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, color: "#374151" }}>
                        Username
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "#374151" }}>
                        Email
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "#374151" }}>
                        Role
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "#374151" }}>
                        Trường
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "#374151" }}>
                        Ngày tạo
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "#374151" }}>
                        Hành động
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(rowsPerPage > 0
                      ? filteredUsers.slice(
                          page * rowsPerPage,
                          page * rowsPerPage + rowsPerPage
                        )
                      : filteredUsers
                    ).map((user) => (
                      <TableRow
                        key={user.userId}
                        sx={{
                          "&:hover": {
                            bgcolor: "#f9fafb",
                          },
                        }}
                      >
                        <TableCell>{user.username}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Chip
                            icon={getRoleIcon(user.role)}
                            label={user.role}
                            size="small"
                            sx={{
                              bgcolor: `${getRoleColor(user.role)}20`,
                              color: getRoleColor(user.role),
                              fontWeight: 600,
                              borderRadius: "8px",
                            }}
                          />
                        </TableCell>
                        <TableCell>{user.universityName || "N/A"}</TableCell>
                        <TableCell>
                          {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={0.5}>
                            {canModifyUser(user) && (
                              <IconButton
                                size="small"
                                onClick={() => handleOpen(user)}
                                sx={{
                                  color: "#7c3aed",
                                  "&:hover": { bgcolor: "#f3f0ff" },
                                }}
                              >
                                <Edit fontSize="small" />
                              </IconButton>
                            )}
                            {canModifyUser(user) && (
                              <IconButton
                                size="small"
                                onClick={() => handleResetPassword(user.userId)}
                                sx={{
                                  color: "#9333ea",
                                  "&:hover": { bgcolor: "#f3f0ff" },
                                }}
                              >
                                <Refresh fontSize="small" />
                              </IconButton>
                            )}
                            {canModifyUser(user) && canDeleteUser(user) && (
                              <IconButton
                                size="small"
                                onClick={() => handleDelete(user.userId)}
                                sx={{
                                  color: "#ef4444",
                                  "&:hover": { bgcolor: "#fef2f2" },
                                }}
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            )}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, { label: "Tất cả", value: -1 }]}
                  component="div"
                  count={filteredUsers.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  labelRowsPerPage="Số hàng mỗi trang:"
                  sx={{
                    borderTop: "1px solid #e5e7eb",
                    ".MuiTablePagination-actions button": {
                      color: "#7c3aed",
                    },
                  }}
                />
              </>
            )}
          </CardContent>
        </Card>

        {/* Dialog - Giống mẫu */}
        <Dialog
          open={open}
          onClose={handleClose}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: "16px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            },
          }}
        >
          <DialogTitle
            sx={{
              background: "linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)",
              color: "#fff",
              fontWeight: 700,
            }}
          >
            {editId ? "Chỉnh sửa User" : "Tạo User Mới"}
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <TextField
              label="Username"
              fullWidth
              margin="normal"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  "&.Mui-focused fieldset": {
                    borderColor: "#7c3aed",
                  },
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#7c3aed",
                },
              }}
            />
            <TextField
              label="Email"
              type="email"
              fullWidth
              margin="normal"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  "&.Mui-focused fieldset": {
                    borderColor: "#7c3aed",
                  },
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#7c3aed",
                },
              }}
            />
            {!editId && (
              <TextField
                label="Mật khẩu"
                type="password"
                fullWidth
                margin="normal"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    "&.Mui-focused fieldset": {
                      borderColor: "#7c3aed",
                    },
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "#7c3aed",
                  },
                }}
              />
            )}
            <FormControl fullWidth margin="normal">
              <InputLabel
                sx={{
                  "&.Mui-focused": {
                    color: "#7c3aed",
                  },
                }}
              >
                Role
              </InputLabel>
              <Select
                value={form.role}
                label="Role"
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                sx={{
                  borderRadius: "12px",
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#7c3aed",
                  },
                }}
              >
                <MenuItem value="organizer">Người Tổ Chức</MenuItem>
                <MenuItem value="student">Sinh Viên</MenuItem>
              </Select>
            </FormControl>

            {(form.role === "organizer" || form.role === "student") && (
              <FormControl fullWidth margin="normal">
                <InputLabel
                  sx={{
                    "&.Mui-focused": {
                      color: "#7c3aed",
                    },
                  }}
                >
                  Trường đại học
                </InputLabel>
                <Select
                  value={form.universityId}
                  label="Trường đại học"
                  onChange={(e) =>
                    setForm({ ...form, universityId: e.target.value })
                  }
                  sx={{
                    borderRadius: "12px",
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#7c3aed",
                    },
                  }}
                >
                  {universities.map((university) => (
                    <MenuItem
                      key={university.universityId}
                      value={university.universityId}
                    >
                      {university.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {form.role === "student" && (
              <>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Họ và tên"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "12px",
                      "&.Mui-focused fieldset": {
                        borderColor: "#7c3aed",
                      },
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: "#7c3aed",
                    },
                  }}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Mã sinh viên"
                  required
                  value={form.studentCode}
                  onChange={(e) =>
                    setForm({ ...form, studentCode: e.target.value })
                  }
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "12px",
                      "&.Mui-focused fieldset": {
                        borderColor: "#7c3aed",
                      },
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: "#7c3aed",
                    },
                  }}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Số điện thoại"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "12px",
                      "&.Mui-focused fieldset": {
                        borderColor: "#7c3aed",
                      },
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: "#7c3aed",
                    },
                  }}
                />
              </>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3, gap: 1.5 }}>
            <Button
              onClick={handleClose}
              sx={{
                borderRadius: "10px",
                px: 3,
                textTransform: "none",
                color: "#6b7280",
              }}
            >
              Hủy
            </Button>
            <Button
              onClick={handleSave}
              variant="contained"
              sx={{
                borderRadius: "10px",
                px: 4,
                textTransform: "none",
                background: "linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)",
                "&:hover": {
                  background: "linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%)",
                },
              }}
            >
              {editId ? "Cập nhật" : "Tạo mới"}
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ borderRadius: "12px" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default AdminUserManagement;

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
  TablePagination, // <-- THÊM IMPORT NÀY
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
  Group,
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
  // --- THÊM STATE CHO PHÂN TRANG ---
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  // ---------------------------------
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
      setPage(0); // <-- RESET VỀ TRANG ĐẦU TIÊN
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
    // ... (Giữ nguyên)
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
    // ... (Giữ nguyên)
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
    // ... (Giữ nguyên)
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
    // ... (Giữ nguyên)
    try {
      // Validation
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
      fetchUsers(); // <-- fetchUsers đã có setPage(0)
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Lỗi: ${error.message}`,
        severity: "error",
      });
    }
  };

  const handleDelete = async (userId) => {
    // ... (Giữ nguyên)
    // Find the user to check permissions
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
        fetchUsers(); // <-- fetchUsers đã có setPage(0)
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
    // ... (Giữ nguyên)
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
    // ... (Giữ nguyên)
    switch (role) {
      case "admin":
        return "linear-gradient(135deg, #6C63FF 0%, #8B5CF6 100%)";
      case "organizer":
        return "linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)";
      case "student":
        return "linear-gradient(135deg, #C4B5FD 0%, #DDD6FE 100%)";
      default:
        return "#F5F5F5";
    }
  };

  const getRoleIcon = (role) => {
    // ... (Giữ nguyên)
    switch (role) {
      case "admin":
        return <AdminPanelSettings sx={{ color: "#FFFFFF" }} />;
      case "organizer":
        return <People sx={{ color: "#FFFFFF" }} />;
      case "student":
        return <PersonAdd sx={{ color: "#6C63FF" }} />;
      default:
        return <People sx={{ color: "#6B7280" }} />;
    }
  };

  // Check if current user can edit/delete another user
  const canModifyUser = (targetUser) => {
    // ... (Giữ nguyên)
    // Không thể sửa/xóa tài khoản admin khác
    if (
      targetUser.role === "admin" &&
      targetUser.userId !== currentUser?.userId
    ) {
      return false;
    }
    return true;
  };

  // Kiểm tra xem có được phép xóa user không
  const canDeleteUser = (targetUser) => {
    // ... (Giữ nguyên)
    // Không cho phép xóa bất kỳ tài khoản admin nào
    if (targetUser.role === "admin") {
      return false;
    }
    return true;
  };

  // --- THÊM CÁC HÀM HANDLER CHO PHÂN TRANG ---
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Quay về trang đầu tiên
  };

  // Lọc danh sách người dùng, không hiển thị tài khoản đang đăng nhập
  const filteredUsers = users.filter(
    (user) => user.userId !== currentUser?.userId
  );

  // Stats calculation
  const stats = {
    // ... (Giữ nguyên)
    total: users.length,
    admins: users.filter((u) => u.role === "admin").length,
    organizers: users.filter((u) => u.role === "organizer").length,
    students: users.filter((u) => u.role === "student").length,
    active: users.filter((u) => u.isActive).length,
  };

  return (
    <Box
      sx={{
        p: 3,
        minHeight: "100vh",
        background: "linear-gradient(135deg, #F5F5F5 0%, #FFFFFF 100%)",
        fontFamily: "'Inter', 'Open Sans', sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Animated Wave Blobs Background */}
      {/* ... (Giữ nguyên background animation) */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0,
          overflow: "hidden",
          pointerEvents: "none",
        }}
      >
        {/* Blob 1 */}
        <Box
          sx={{
            position: "absolute",
            top: "-10%",
            left: "-5%",
            width: "500px",
            height: "500px",
            background:
              "radial-gradient(circle, rgba(108, 99, 255, 0.08) 0%, rgba(139, 92, 246, 0.03) 70%, transparent 100%)",
            borderRadius: "40% 60% 70% 30% / 40% 50% 60% 50%",
            animation: "blob1 20s ease-in-out infinite",
            "@keyframes blob1": {
              "0%, 100%": {
                transform: "translate(0, 0) scale(1) rotate(0deg)",
                borderRadius: "40% 60% 70% 30% / 40% 50% 60% 50%",
              },
              "33%": {
                transform: "translate(30px, -50px) scale(1.1) rotate(120deg)",
                borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
              },
              "66%": {
                transform: "translate(-20px, 20px) scale(0.9) rotate(240deg)",
                borderRadius: "30% 70% 60% 40% / 50% 60% 40% 50%",
              },
            },
          }}
        />

        {/* Blob 2 */}
        <Box
          sx={{
            position: "absolute",
            top: "20%",
            right: "-8%",
            width: "600px",
            height: "600px",
            background:
              "radial-gradient(circle, rgba(167, 139, 250, 0.07) 0%, rgba(196, 181, 253, 0.03) 70%, transparent 100%)",
            borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
            animation: "blob2 25s ease-in-out infinite",
            "@keyframes blob2": {
              "0%, 100%": {
                transform: "translate(0, 0) scale(1) rotate(0deg)",
                borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
              },
              "33%": {
                transform: "translate(-40px, 30px) scale(1.15) rotate(-120deg)",
                borderRadius: "30% 70% 60% 40% / 40% 60% 50% 60%",
              },
              "66%": {
                transform: "translate(20px, -40px) scale(0.95) rotate(-240deg)",
                borderRadius: "70% 30% 40% 60% / 30% 70% 60% 40%",
              },
            },
          }}
        />

        {/* Blob 3 */}
        <Box
          sx={{
            position: "absolute",
            bottom: "-15%",
            left: "30%",
            width: "450px",
            height: "450px",
            background:
              "radial-gradient(circle, rgba(139, 92, 246, 0.06) 0%, rgba(196, 181, 253, 0.02) 70%, transparent 100%)",
            borderRadius: "30% 70% 60% 40% / 50% 60% 40% 50%",
            animation: "blob3 22s ease-in-out infinite",
            "@keyframes blob3": {
              "0%, 100%": {
                transform: "translate(0, 0) scale(1) rotate(0deg)",
                borderRadius: "30% 70% 60% 40% / 50% 60% 40% 50%",
              },
              "50%": {
                transform: "translate(50px, -30px) scale(1.2) rotate(180deg)",
                borderRadius: "70% 30% 40% 60% / 40% 50% 60% 50%",
              },
            },
          }}
        />

        {/* Blob 4 */}
        <Box
          sx={{
            position: "absolute",
            bottom: "10%",
            right: "15%",
            width: "350px",
            height: "350px",
            background:
              "radial-gradient(circle, rgba(196, 181, 253, 0.08) 0%, rgba(221, 214, 254, 0.03) 70%, transparent 100%)",
            borderRadius: "50% 50% 50% 50% / 60% 40% 60% 40%",
            animation: "blob4 18s ease-in-out infinite",
            "@keyframes blob4": {
              "0%, 100%": {
                transform: "translate(0, 0) scale(1) rotate(0deg)",
                borderRadius: "50% 50% 50% 50% / 60% 40% 60% 40%",
              },
              "50%": {
                transform: "translate(-30px, 40px) scale(0.85) rotate(-180deg)",
                borderRadius: "40% 60% 70% 30% / 50% 50% 50% 50%",
              },
            },
          }}
        />

        {/* Wave effect */}
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "200px",
            background:
              "linear-gradient(180deg, transparent 0%, rgba(196, 181, 253, 0.05) 100%)",
            animation: "wave 15s ease-in-out infinite",
            "@keyframes wave": {
              "0%, 100%": {
                transform: "translateX(0) scaleY(1)",
              },
              "50%": {
                transform: "translateX(-25px) scaleY(1.1)",
              },
            },
          }}
        />
      </Box>

      <Box
        sx={{
          maxWidth: 1400,
          margin: "0 auto",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Header Section */}
        {/* ... (Giữ nguyên Header) */}
        <Box
          sx={{
            mb: 4,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2.5,
            background: "linear-gradient(135deg, #6C63FF 0%, #8B5CF6 100%)",
            p: 3.5,
            borderRadius: "16px",
            boxShadow: "0 8px 24px rgba(108, 99, 255, 0.25)",
            transition: "all 0.3s ease",
            flexWrap: "wrap",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: "0 12px 32px rgba(108, 99, 255, 0.35)",
            },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2.5 }}>
            <Box
              sx={{
                background: "rgba(255, 255, 255, 0.15)",
                backdropFilter: "blur(10px)",
                borderRadius: "12px",
                p: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AdminPanelSettings sx={{ fontSize: 44, color: "#FFFFFF" }} />
            </Box>
            <Box>
              <Typography
                variant="h4"
                fontWeight={700}
                sx={{
                  fontFamily: "'Poppins', sans-serif",
                  mb: 0.5,
                  color: "#FFFFFF",
                  letterSpacing: "-0.5px",
                }}
              >
                Quản lý Người dùng
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "rgba(255, 255, 255, 0.9)",
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 500,
                }}
              >
                Tri thức & Uy tín — Nền tảng học thuật hiện đại
              </Typography>
            </Box>
          </Box>

          {/* Action Buttons in Header */}
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Button
              variant="contained"
              startIcon={<Add />}
              sx={{
                fontWeight: 600,
                background: "rgba(255, 255, 255, 0.2)",
                backdropFilter: "blur(10px)",
                color: "#FFFFFF",
                fontFamily: "'Inter', sans-serif",
                borderRadius: "12px",
                px: 3.5,
                py: 1.3,
                fontSize: "0.95rem",
                border: "2px solid rgba(255, 255, 255, 0.3)",
                boxShadow: "0 4px 16px rgba(255, 255, 255, 0.1)",
                textTransform: "none",
                transition: "all 0.3s ease",
                "&:hover": {
                  background: "rgba(255, 255, 255, 0.3)",
                  border: "2px solid rgba(255, 255, 255, 0.5)",
                  transform: "translateY(-2px)",
                  boxShadow: "0 6px 20px rgba(255, 255, 255, 0.2)",
                },
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
                color: "#FFFFFF",
                borderColor: "rgba(255, 255, 255, 0.5)",
                borderWidth: 2,
                fontFamily: "'Inter', sans-serif",
                borderRadius: "12px",
                px: 3.5,
                py: 1.3,
                fontSize: "0.95rem",
                textTransform: "none",
                transition: "all 0.3s ease",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.15)",
                  borderColor: "rgba(255, 255, 255, 0.8)",
                  borderWidth: 2,
                  transform: "translateY(-2px)",
                },
                "&.Mui-disabled": {
                  color: "rgba(255, 255, 255, 0.5)",
                  borderColor: "rgba(255, 255, 255, 0.3)",
                },
              }}
              onClick={fetchUsers}
              disabled={loading}
            >
              Làm mới
            </Button>
          </Box>
        </Box>

        {/* Stats Cards */}
        {/* ... (Giữ nguyên Stats Cards) */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                background: "linear-gradient(135deg, #6C63FF 0%, #8B5CF6 100%)",
                borderRadius: "16px",
                boxShadow: "0 4px 16px rgba(108, 99, 255, 0.2)",
                transition: "all 0.3s ease",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                "&:hover": {
                  transform: "translateY(-6px)",
                  boxShadow: "0 8px 24px rgba(108, 99, 255, 0.3)",
                },
              }}
            >
              <CardContent
                sx={{
                  textAlign: "center",
                  p: 3,
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Box
                  sx={{
                    background: "rgba(255, 255, 255, 0.1)",
                    borderRadius: "12px",
                    p: 1.5,
                    display: "inline-flex",
                    mb: 1.5,
                  }}
                >
                  <Group sx={{ fontSize: 40, color: "#FFFFFF" }} />
                </Box>
                <Typography
                  variant="h3"
                  fontWeight={800}
                  sx={{
                    fontFamily: "'Poppins', sans-serif",
                    mb: 0.5,
                    color: "#FFFFFF",
                  }}
                >
                  {stats.total}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 600,
                    color: "rgba(255, 255, 255, 0.9)",
                  }}
                >
                  Tổng Người dùng
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                background: "linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)",
                borderRadius: "16px",
                boxShadow: "0 4px 16px rgba(139, 92, 246, 0.2)",
                transition: "all 0.3s ease",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                "&:hover": {
                  transform: "translateY(-6px)",
                  boxShadow: "0 8px 24px rgba(139, 92, 246, 0.3)",
                },
              }}
            >
              <CardContent
                sx={{
                  textAlign: "center",
                  p: 3,
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Box
                  sx={{
                    background: "rgba(255, 255, 255, 0.1)",
                    borderRadius: "12px",
                    p: 1.5,
                    display: "inline-flex",
                    mb: 1.5,
                  }}
                >
                  <AdminPanelSettings sx={{ fontSize: 40, color: "#FFFFFF" }} />
                </Box>
                <Typography
                  variant="h3"
                  fontWeight={800}
                  sx={{
                    fontFamily: "'Poppins', sans-serif",
                    mb: 0.5,
                    color: "#FFFFFF",
                  }}
                >
                  {stats.admins}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 600,
                    color: "rgba(255, 255, 255, 0.9)",
                  }}
                >
                  Quản Trị Viên
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                background: "linear-gradient(135deg, #A78BFA 0%, #C4B5FD 100%)",
                borderRadius: "16px",
                boxShadow: "0 4px 16px rgba(167, 139, 250, 0.2)",
                transition: "all 0.3s ease",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                "&:hover": {
                  transform: "translateY(-6px)",
                  boxShadow: "0 8px 24px rgba(167, 139, 250, 0.3)",
                },
              }}
            >
              <CardContent
                sx={{
                  textAlign: "center",
                  p: 3,
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Box
                  sx={{
                    background: "rgba(255, 255, 255, 0.1)",
                    borderRadius: "12px",
                    p: 1.5,
                    display: "inline-flex",
                    mb: 1.5,
                  }}
                >
                  <People sx={{ fontSize: 40, color: "#FFFFFF" }} />
                </Box>
                <Typography
                  variant="h3"
                  fontWeight={800}
                  sx={{
                    fontFamily: "'Poppins', sans-serif",
                    mb: 0.5,
                    color: "#FFFFFF",
                  }}
                >
                  {stats.organizers}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 600,
                    color: "rgba(255, 255, 255, 0.9)",
                  }}
                >
                  Người Tổ Chức
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                background: "linear-gradient(135deg, #C4B5FD 0%, #DDD6FE 100%)",
                borderRadius: "16px",
                boxShadow: "0 4px 16px rgba(196, 181, 253, 0.2)",
                transition: "all 0.3s ease",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                "&:hover": {
                  transform: "translateY(-6px)",
                  boxShadow: "0 8px 24px rgba(196, 181, 253, 0.3)",
                },
              }}
            >
              <CardContent
                sx={{
                  textAlign: "center",
                  p: 3,
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Box
                  sx={{
                    background: "rgba(108, 99, 255, 0.1)",
                    borderRadius: "12px",
                    p: 1.5,
                    display: "inline-flex",
                    mb: 1.5,
                  }}
                >
                  <PersonAdd sx={{ fontSize: 40, color: "#6C63FF" }} />
                </Box>
                <Typography
                  variant="h3"
                  fontWeight={800}
                  sx={{
                    fontFamily: "'Poppins', sans-serif",
                    mb: 0.5,
                    color: "#6C63FF",
                  }}
                >
                  {stats.students}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 600,
                    color: "#8B5CF6",
                  }}
                >
                  Sinh Viên
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Users Table */}
        <Box
          sx={{
            background: "#FFFFFF",
            borderRadius: "16px",
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
            p: 2.5,
            overflow: "hidden",
          }}
        >
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress sx={{ color: "#6C63FF" }} size={48} />
            </Box>
          ) : (
            <>
              {" "}
              {/* Fragment needed to group Table and TablePagination */}
              <Table>
                <TableHead>
                  {/* ... (Giữ nguyên TableHead styles) */}
                  <TableRow
                    sx={{
                      background:
                        "linear-gradient(135deg, #F5F5F5 0%, #E5E7EB 100%)",
                    }}
                  >
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        fontSize: "0.95rem",
                        color: "#374151",
                        fontFamily: "'Inter', sans-serif",
                        py: 2.5,
                      }}
                    >
                      Username
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        fontSize: "0.95rem",
                        color: "#374151",
                        fontFamily: "'Inter', sans-serif",
                        py: 2.5,
                      }}
                    >
                      Email
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        fontSize: "0.95rem",
                        color: "#374151",
                        fontFamily: "'Inter', sans-serif",
                        py: 2.5,
                      }}
                    >
                      Role
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        fontSize: "0.95rem",
                        color: "#374151",
                        fontFamily: "'Inter', sans-serif",
                        py: 2.5,
                      }}
                    >
                      Trường
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        fontSize: "0.95rem",
                        color: "#374151",
                        fontFamily: "'Inter', sans-serif",
                        py: 2.5,
                      }}
                    >
                      Ngày tạo
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        fontSize: "0.95rem",
                        color: "#374151",
                        fontFamily: "'Inter', sans-serif",
                        py: 2.5,
                      }}
                    >
                      Hành động
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {/* --- CẬP NHẬT LOGIC RENDER VỚI SLICE --- */}
                  {(rowsPerPage > 0
                    ? filteredUsers.slice(
                        page * rowsPerPage,
                        page * rowsPerPage + rowsPerPage
                      )
                    : filteredUsers
                  ).map((user, index) => (
                    <TableRow
                      key={user.userId}
                      sx={{
                        backgroundColor:
                          index % 2 === 0 ? "#FAFAFA" : "#FFFFFF",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          background:
                            "linear-gradient(90deg, rgba(108, 99, 255, 0.05), rgba(139, 92, 246, 0.05))",
                          transform: "scale(1.005)",
                        },
                      }}
                    >
                      {/* ... (Giữ nguyên các TableCell) */}
                      <TableCell
                        sx={{
                          fontFamily: "'Inter', sans-serif",
                          color: "#1F2937",
                          py: 2.5,
                          fontWeight: 500,
                        }}
                      >
                        {user.username}
                      </TableCell>
                      <TableCell
                        sx={{
                          fontFamily: "'Inter', sans-serif",
                          color: "#1F2937",
                          py: 2.5,
                        }}
                      >
                        {user.email}
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getRoleIcon(user.role)}
                          label={user.role}
                          size="small"
                          sx={{
                            borderRadius: "10px",
                            fontFamily: "'Inter', sans-serif",
                            background: getRoleColor(user.role),
                            color:
                              user.role === "student" ? "#6C63FF" : "#FFFFFF",
                            fontWeight: 700,
                            px: 1.5,
                            border: "none",
                            boxShadow:
                              user.role === "admin"
                                ? "0 2px 8px rgba(108, 99, 255, 0.3)"
                                : user.role === "organizer"
                                ? "0 2px 8px rgba(139, 92, 246, 0.3)"
                                : "0 2px 8px rgba(196, 181, 253, 0.3)",
                          }}
                        />
                      </TableCell>
                      <TableCell
                        sx={{
                          fontFamily: "'Inter', sans-serif",
                          color: "#1F2937",
                          py: 2.5,
                        }}
                      >
                        {user.universityName || "N/A"}
                      </TableCell>
                      <TableCell
                        sx={{
                          fontFamily: "'Inter', sans-serif",
                          color: "#1F2937",
                          py: 2.5,
                        }}
                      >
                        {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                      </TableCell>
                      <TableCell>
                        {canModifyUser(user) && (
                          <IconButton
                            onClick={() => handleOpen(user)}
                            sx={{
                              color: "#6C63FF",
                              transition: "all 0.3s ease",
                              "&:hover": {
                                color: "#8B5CF6",
                                background: "rgba(108, 99, 255, 0.1)",
                                transform: "scale(1.15)",
                              },
                            }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        )}
                        {canModifyUser(user) && (
                          <IconButton
                            onClick={() => handleResetPassword(user.userId)}
                            sx={{
                              color: "#8B5CF6",
                              transition: "all 0.3s ease",
                              "&:hover": {
                                color: "#A78BFA",
                                background: "rgba(139, 92, 246, 0.1)",
                                transform: "scale(1.15)",
                              },
                            }}
                          >
                            <Refresh fontSize="small" />
                          </IconButton>
                        )}
                        {canModifyUser(user) && canDeleteUser(user) && (
                          <IconButton
                            onClick={() => handleDelete(user.userId)}
                            sx={{
                              color: "#EF4444",
                              transition: "all 0.3s ease",
                              "&:hover": {
                                color: "#DC2626",
                                background: "rgba(239, 68, 68, 0.1)",
                                transform: "scale(1.15)",
                              },
                            }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {/* --- THÊM COMPONENT PHÂN TRANG --- */}
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, { label: "Tất cả", value: -1 }]}
                component="div"
                count={filteredUsers.length} // Tổng số người dùng đã lọc
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="Số hàng mỗi trang:"
                labelDisplayedRows={({ from, to, count }) => {
                  if (count === -1) return "Tất cả";
                  return `${from}–${to} trong số ${
                    count !== -1 ? count : `hơn ${to}`
                  }`;
                }}
                SelectProps={{
                  inputProps: { "aria-label": "Số hàng mỗi trang" },
                  native: true,
                }}
                sx={{
                  mt: 2, // Margin top for spacing
                  ".MuiTablePagination-toolbar": {
                    color: "#6B7280",
                    fontFamily: "'Inter', sans-serif",
                  },
                  ".MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows":
                    {
                      fontWeight: 500,
                      fontSize: "0.9rem",
                    },
                  ".MuiTablePagination-select": {
                    fontWeight: 600,
                    color: "#6C63FF",
                  },
                  ".MuiTablePagination-actions button": {
                    color: "#6C63FF",
                    "&:hover": {
                      backgroundColor: "rgba(108, 99, 255, 0.1)",
                    },
                    "&.Mui-disabled": {
                      color: "#D1D5DB",
                    },
                  },
                }}
              />
            </> // End Fragment
          )}
        </Box>

        {/* Create/Edit User Dialog */}
        {/* ... (Giữ nguyên Dialog styles) */}
        <Dialog
          open={open}
          onClose={handleClose}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: "16px",
              background: "#FFFFFF",
              boxShadow: "0 8px 32px rgba(108, 99, 255, 0.2)",
            },
          }}
        >
          <DialogTitle
            sx={{
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 700,
              color: "#1F2937",
              fontSize: "1.5rem",
              pt: 3,
              background: "linear-gradient(135deg, #6C63FF 0%, #8B5CF6 100%)",
              color: "#FFFFFF",
              borderRadius: "16px 16px 0 0",
            }}
          >
            {editId ? "✏️ Chỉnh sửa User" : "✨ Tạo User Mới"}
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
                  background: "#F9FAFB",
                  fontFamily: "'Inter', sans-serif",
                  "& fieldset": {
                    borderColor: "rgba(108, 99, 255, 0.2)",
                  },
                  "&:hover fieldset": {
                    borderColor: "#6C63FF",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#6C63FF",
                    borderWidth: 2,
                  },
                },
                "& .MuiInputLabel-root": {
                  color: "#6B7280",
                  fontFamily: "'Inter', sans-serif",
                  "&.Mui-focused": {
                    color: "#6C63FF",
                    fontWeight: 600,
                  },
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
                  background: "#F9FAFB",
                  fontFamily: "'Inter', sans-serif",
                  "& fieldset": {
                    borderColor: "rgba(108, 99, 255, 0.2)",
                  },
                  "&:hover fieldset": {
                    borderColor: "#6C63FF",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#6C63FF",
                    borderWidth: 2,
                  },
                },
                "& .MuiInputLabel-root": {
                  color: "#6B7280",
                  fontFamily: "'Inter', sans-serif",
                  "&.Mui-focused": {
                    color: "#6C63FF",
                    fontWeight: 600,
                  },
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
                    background: "#F9FAFB",
                    fontFamily: "'Inter', sans-serif",
                    "& fieldset": {
                      borderColor: "rgba(108, 99, 255, 0.2)",
                    },
                    "&:hover fieldset": {
                      borderColor: "#6C63FF",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#6C63FF",
                      borderWidth: 2,
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color: "#6B7280",
                    fontFamily: "'Inter', sans-serif",
                    "&.Mui-focused": {
                      color: "#6C63FF",
                      fontWeight: 600,
                    },
                  },
                }}
              />
            )}
            <FormControl fullWidth margin="normal">
              <InputLabel
                sx={{
                  fontFamily: "'Inter', sans-serif",
                  color: "#6B7280",
                  "&.Mui-focused": {
                    color: "#6C63FF",
                    fontWeight: 600,
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
                  background: "#F9FAFB",
                  fontFamily: "'Inter', sans-serif",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(108, 99, 255, 0.2)",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#6C63FF",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#6C63FF",
                    borderWidth: 2,
                  },
                }}
              >
                <MenuItem
                  value="organizer"
                  sx={{ fontFamily: "'Inter', sans-serif" }}
                >
                  Người Tổ Chức
                </MenuItem>
                <MenuItem
                  value="student"
                  sx={{ fontFamily: "'Inter', sans-serif" }}
                >
                  Sinh Viên
                </MenuItem>
              </Select>
            </FormControl>

            {(form.role === "organizer" || form.role === "student") && (
              <FormControl fullWidth margin="normal">
                <InputLabel
                  sx={{
                    fontFamily: "'Inter', sans-serif",
                    color: "#6B7280",
                    "&.Mui-focused": {
                      color: "#6C63FF",
                      fontWeight: 600,
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
                    background: "#F9FAFB",
                    fontFamily: "'Inter', sans-serif",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(108, 99, 255, 0.2)",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#6C63FF",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#6C63FF",
                      borderWidth: 2,
                    },
                  }}
                >
                  {universities.map((university) => (
                    <MenuItem
                      key={university.universityId}
                      value={university.universityId}
                      sx={{ fontFamily: "'Inter', sans-serif" }}
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
                      background: "#F9FAFB",
                      fontFamily: "'Inter', sans-serif",
                      "& fieldset": {
                        borderColor: "rgba(108, 99, 255, 0.2)",
                      },
                      "&:hover fieldset": {
                        borderColor: "#6C63FF",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#6C63FF",
                        borderWidth: 2,
                      },
                    },
                    "& .MuiInputLabel-root": {
                      color: "#6B7280",
                      fontFamily: "'Inter', sans-serif",
                      "&.Mui-focused": {
                        color: "#6C63FF",
                        fontWeight: 600,
                      },
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
                      background: "#F9FAFB",
                      fontFamily: "'Inter', sans-serif",
                      "& fieldset": {
                        borderColor: "rgba(108, 99, 255, 0.2)",
                      },
                      "&:hover fieldset": {
                        borderColor: "#6C63FF",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#6C63FF",
                        borderWidth: 2,
                      },
                    },
                    "& .MuiInputLabel-root": {
                      color: "#6B7280",
                      fontFamily: "'Inter', sans-serif",
                      "&.Mui-focused": {
                        color: "#6C63FF",
                        fontWeight: 600,
                      },
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
                      background: "#F9FAFB",
                      fontFamily: "'Inter', sans-serif",
                      "& fieldset": {
                        borderColor: "rgba(108, 99, 255, 0.2)",
                      },
                      "&:hover fieldset": {
                        borderColor: "#6C63FF",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#6C63FF",
                        borderWidth: 2,
                      },
                    },
                    "& .MuiInputLabel-root": {
                      color: "#6B7280",
                      fontFamily: "'Inter', sans-serif",
                      "&.Mui-focused": {
                        color: "#6C63FF",
                        fontWeight: 600,
                      },
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
                fontFamily: "'Inter', sans-serif",
                color: "#6B7280",
                borderRadius: "10px",
                px: 3,
                py: 1,
                fontWeight: 600,
                textTransform: "none",
                "&:hover": {
                  background: "rgba(107, 114, 128, 0.1)",
                },
              }}
            >
              Hủy
            </Button>
            <Button
              onClick={handleSave}
              variant="contained"
              sx={{
                fontWeight: 600,
                background: "linear-gradient(135deg, #6C63FF 0%, #8B5CF6 100%)",
                color: "#FFFFFF",
                fontFamily: "'Inter', sans-serif",
                borderRadius: "10px",
                px: 4,
                py: 1,
                textTransform: "none",
                boxShadow: "0 4px 12px rgba(108, 99, 255, 0.3)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #8B5CF6 0%, #6C63FF 100%)",
                  transform: "translateY(-1px)",
                  boxShadow: "0 6px 16px rgba(108, 99, 255, 0.4)",
                },
              }}
            >
              {editId ? "Cập nhật" : "Tạo mới"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        {/* ... (Giữ nguyên) */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{
              fontFamily: "'Inter', sans-serif",
              borderRadius: "12px",
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
              fontWeight: 500,
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default AdminUserManagement;

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
  TablePagination,
  Card,
  Avatar,
  Fade,
  Chip,
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  UploadFile,
  CloudUpload,
  School as SchoolIcon,
  Person,
  Email,
  Phone,
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

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const fetchData = async () => {
    const res = await getStudents();
    console.log("Students data:", res);
    setData([...res]);
    setPage(0);
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

      if (isNewUniversity && form.new_university_name.trim()) {
        const newUniversity = {
          name: form.new_university_name.trim(),
          address: form.new_university_address.trim(),
          contact_info: form.new_university_contact.trim(),
        };

        const createdUniversity = await addUniversity(newUniversity);
        universityId = createdUniversity.universityId;

        await fetchUniversities();

        setSnackbar({
          open: true,
          message: `Đã tạo trường mới: ${newUniversity.name}`,
          severity: "success",
        });
      }

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

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box
      sx={{
        p: 3,
        minHeight: "100vh",
        backgroundColor: "#F9FAFB",
      }}
    >
      <Box sx={{ maxWidth: 1200, mx: "auto" }}>
        {/* Header với tone tím */}
        <Fade in={true} timeout={800}>
          <Card
            elevation={10}
            sx={{
              mb: 4,
              borderRadius: "24px",
              boxShadow: "0 20px 60px rgba(124,58,237,0.15)",
              background:
                "linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #c084fc 100%)",
              color: "white",
              overflow: "visible",
            }}
          >
            <Box
              sx={{
                p: { xs: 3, md: 5 },
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
                position: "relative",
                flexDirection: { xs: "column", md: "row" },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box
                  sx={{
                    width: { xs: 64, md: 84 },
                    height: { xs: 64, md: 84 },
                    borderRadius: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "rgba(255,255,255,0.15)",
                    boxShadow: "0 8px 32px rgba(255,255,255,0.1)",
                  }}
                >
                  <Person sx={{ fontSize: { xs: 32, md: 40 }, color: "white" }} />
                </Box>
                <Box>
                  <Typography
                    variant="h4"
                    fontWeight={700}
                    sx={{ fontSize: { xs: 20, md: 28 } }}
                  >
                    Quản lý Sinh viên
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      opacity: 0.95,
                      mt: 0.5,
                      fontSize: { xs: "0.875rem", md: "1rem" },
                    }}
                  >
                    Quản lý thông tin sinh viên và nhập dữ liệu hàng loạt
                  </Typography>
                  <Chip
                    label={`${data.length} sinh viên`}
                    sx={{
                      mt: 1.5,
                      bgcolor: "rgba(255,255,255,0.2)",
                      color: "white",
                      fontWeight: 700,
                      borderRadius: "12px",
                      px: 1,
                    }}
                  />
                </Box>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  width: { xs: "100%", md: "auto" },
                  flexDirection: { xs: "column", sm: "row" },
                }}
              >
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => handleOpen()}
                  fullWidth={{ xs: true, md: false }}
                  sx={{
                    bgcolor: "white",
                    color: "#7c3aed",
                    px: 3,
                    py: 1.25,
                    borderRadius: "12px",
                    boxShadow: "0 8px 24px rgba(255,255,255,0.3)",
                    "&:hover": {
                      bgcolor: "#f3f0ff",
                      transform: "translateY(-2px)",
                      boxShadow: "0 12px 32px rgba(255,255,255,0.4)",
                    },
                    textTransform: "none",
                    fontWeight: 700,
                    transition: "all 0.2s ease",
                  }}
                >
                  Thêm sinh viên
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<UploadFile />}
                  onClick={() => setUploadOpen(true)}
                  fullWidth={{ xs: true, md: false }}
                  sx={{
                    borderColor: "white",
                    color: "white",
                    px: 3,
                    py: 1.25,
                    borderRadius: "12px",
                    "&:hover": {
                      bgcolor: "rgba(255,255,255,0.1)",
                      borderColor: "white",
                      transform: "translateY(-2px)",
                    },
                    textTransform: "none",
                    fontWeight: 700,
                    transition: "all 0.2s ease",
                  }}
                >
                  Import Excel/CSV
                </Button>
              </Box>
            </Box>
          </Card>
        </Fade>

        {/* Bảng danh sách với tone tím */}
        <Fade in={true} timeout={1000}>
          <Card
            elevation={6}
            sx={{
              borderRadius: "16px",
              boxShadow: "0 4px 24px rgba(124,58,237,0.08)",
              overflow: "hidden",
            }}
          >
            <Box sx={{ overflowX: "auto" }}>
              <Table
                sx={{
                  minWidth: 650,
                  "& .MuiTableCell-root": {
                    borderBottom: "1px solid #f3f0ff",
                    py: 2,
                    px: { xs: 1, sm: 2 },
                  },
                }}
              >
                <TableHead>
                  <TableRow sx={{ bgcolor: "#faf5ff" }}>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        fontSize: { xs: "0.875rem", sm: "1rem" },
                        color: "#7c3aed",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <Person
                          sx={{
                            color: "#7c3aed",
                            fontSize: { xs: 18, sm: 24 },
                          }}
                        />
                        Tên
                      </Box>
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        fontSize: { xs: "0.875rem", sm: "1rem" },
                        color: "#7c3aed",
                        textAlign: "center",
                      }}
                    >
                      Mã SV
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        fontSize: { xs: "0.875rem", sm: "1rem" },
                        color: "#7c3aed",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <Email
                          sx={{
                            color: "#7c3aed",
                            fontSize: { xs: 18, sm: 24 },
                          }}
                        />
                        Email
                      </Box>
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        fontSize: { xs: "0.875rem", sm: "1rem" },
                        color: "#7c3aed",
                        textAlign: "center",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          justifyContent: "center",
                        }}
                      >
                        <Phone
                          sx={{
                            color: "#7c3aed",
                            fontSize: { xs: 18, sm: 24 },
                          }}
                        />
                        Điện thoại
                      </Box>
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        fontSize: { xs: "0.875rem", sm: "1rem" },
                        color: "#7c3aed",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <SchoolIcon
                          sx={{
                            color: "#7c3aed",
                            fontSize: { xs: 18, sm: 24 },
                          }}
                        />
                        Trường
                      </Box>
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        fontWeight: 700,
                        fontSize: { xs: "0.875rem", sm: "1rem" },
                        color: "#7c3aed",
                      }}
                    >
                      Thao tác
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {(rowsPerPage > 0
                    ? data.slice(
                        page * rowsPerPage,
                        page * rowsPerPage + rowsPerPage
                      )
                    : data
                  ).map((s, idx) => (
                    <TableRow
                      key={s.student_id}
                      sx={{
                        bgcolor: idx % 2 === 0 ? "#faf5ff" : "transparent",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          bgcolor: "#f3e8ff",
                        },
                      }}
                    >
                      <TableCell
                        sx={{
                          fontSize: { xs: "0.875rem", sm: "1rem" },
                        }}
                      >
                        {s.name}
                      </TableCell>

                      <TableCell
                        sx={{
                          textAlign: "center",
                          fontSize: { xs: "0.875rem", sm: "1rem" },
                        }}
                      >
                        <Chip
                          label={s.student_code}
                          size="small"
                          sx={{
                            bgcolor: "#f3e8ff",
                            color: "#7c3aed",
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>

                      <TableCell
                        sx={{
                          fontSize: { xs: "0.875rem", sm: "1rem" },
                        }}
                      >
                        {s.email}
                      </TableCell>

                      <TableCell
                        sx={{
                          textAlign: "center",
                          fontSize: { xs: "0.875rem", sm: "1rem" },
                        }}
                      >
                        {s.phone}
                      </TableCell>

                      <TableCell
                        sx={{
                          fontSize: { xs: "0.875rem", sm: "1rem" },
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            color: s.university_name ? "#6b7280" : "#9ca3af",
                            fontStyle: s.university_name ? "normal" : "italic",
                          }}
                        >
                          {s.university_name || "Chưa chọn trường"}
                        </Typography>
                      </TableCell>

                      <TableCell align="right">
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: { xs: 0.5, sm: 1 },
                          }}
                        >
                          <IconButton
                            onClick={() => handleOpen(s)}
                            sx={{
                              bgcolor: "#f3e8ff",
                              color: "#7c3aed",
                              width: { xs: 32, sm: 40 },
                              height: { xs: 32, sm: 40 },
                              "&:hover": {
                                bgcolor: "#e9d5ff",
                                transform: "scale(1.05)",
                              },
                              transition: "all 0.2s ease",
                            }}
                          >
                            <Edit sx={{ fontSize: { xs: 16, sm: 20 } }} />
                          </IconButton>

                          <IconButton
                            onClick={() => handleDelete(s.student_id)}
                            sx={{
                              bgcolor: "#fef2f2",
                              color: "#ef4444",
                              width: { xs: 32, sm: 40 },
                              height: { xs: 32, sm: 40 },
                              "&:hover": {
                                bgcolor: "#fee2e2",
                                transform: "scale(1.05)",
                              },
                              transition: "all 0.2s ease",
                            }}
                          >
                            <Delete sx={{ fontSize: { xs: 16, sm: 20 } }} />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>

            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={data.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Số hàng mỗi trang:"
              labelDisplayedRows={({ from, to, count }) =>
                `${from}–${to} trong số ${count}`
              }
              sx={{
                ".MuiTablePagination-toolbar": {
                  flexWrap: { xs: "wrap", sm: "nowrap" },
                  minHeight: { xs: "auto", sm: 52 },
                  px: { xs: 1, sm: 2 },
                },
                ".MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows":
                  {
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    mb: { xs: 0.5, sm: 0 },
                  },
                ".MuiTablePagination-select": {
                  color: "#7c3aed",
                },
              }}
            />
          </Card>
        </Fade>

        {/* Dialog Thêm/Sửa với tone tím */}
        <Dialog
          open={open}
          onClose={handleClose}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: "16px",
              boxShadow: "0 20px 60px rgba(124,58,237,0.2)",
              mx: { xs: 2, sm: 0 },
            },
          }}
        >
          <DialogTitle
            sx={{
              pb: 1,
              background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
              color: "white",
              display: "flex",
              alignItems: "center",
              px: { xs: 2, sm: 3 },
              py: { xs: 2, sm: 2 },
            }}
          >
            <Avatar
              sx={{
                bgcolor: "rgba(255,255,255,0.2)",
                mr: 2,
                width: { xs: 40, sm: 48 },
                height: { xs: 40, sm: 48 },
              }}
            >
              <Person sx={{ color: "white", fontSize: { xs: 20, sm: 24 } }} />
            </Avatar>
            <Typography
              variant="h6"
              fontWeight={700}
              sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
            >
              {editId ? "Cập nhật sinh viên" : "Thêm sinh viên mới"}
            </Typography>
          </DialogTitle>

          <DialogContent sx={{ pt: 3, px: { xs: 2, sm: 3 } }}>
            <TextField
              label="Tên"
              fullWidth
              margin="normal"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  "&:hover fieldset": { borderColor: "#7c3aed" },
                  "&.Mui-focused fieldset": { borderColor: "#7c3aed" },
                },
                "& .MuiInputLabel-root.Mui-focused": { color: "#7c3aed" },
              }}
            />
            <TextField
              label="Mã SV"
              fullWidth
              margin="normal"
              value={form.student_code}
              onChange={(e) =>
                setForm({ ...form, student_code: e.target.value })
              }
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  "&:hover fieldset": { borderColor: "#7c3aed" },
                  "&.Mui-focused fieldset": { borderColor: "#7c3aed" },
                },
                "& .MuiInputLabel-root.Mui-focused": { color: "#7c3aed" },
              }}
            />
            <TextField
              label="Email"
              fullWidth
              margin="normal"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  "&:hover fieldset": { borderColor: "#7c3aed" },
                  "&.Mui-focused fieldset": { borderColor: "#7c3aed" },
                },
                "& .MuiInputLabel-root.Mui-focused": { color: "#7c3aed" },
              }}
            />
            <TextField
              label="Điện thoại"
              fullWidth
              margin="normal"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  "&:hover fieldset": { borderColor: "#7c3aed" },
                  "&.Mui-focused fieldset": { borderColor: "#7c3aed" },
                },
                "& .MuiInputLabel-root.Mui-focused": { color: "#7c3aed" },
              }}
            />
            <FormControl
              fullWidth
              margin="normal"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  "&:hover fieldset": { borderColor: "#7c3aed" },
                  "&.Mui-focused fieldset": { borderColor: "#7c3aed" },
                },
                "& .MuiInputLabel-root.Mui-focused": { color: "#7c3aed" },
              }}
            >
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
                  sx={{ color: "#7c3aed", fontWeight: "bold" }}
                >
                  ➕ Thêm trường mới
                </MenuItem>
              </Select>
            </FormControl>

            {isNewUniversity && (
              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  border: "2px solid #e9d5ff",
                  borderRadius: 2,
                  bgcolor: "#faf5ff",
                }}
              >
                <Typography variant="h6" sx={{ mb: 2, color: "#7c3aed" }}>
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
                  required
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      bgcolor: "white",
                      "&:hover fieldset": { borderColor: "#7c3aed" },
                      "&.Mui-focused fieldset": { borderColor: "#7c3aed" },
                    },
                    "& .MuiInputLabel-root.Mui-focused": { color: "#7c3aed" },
                  }}
                />
                <TextField
                  label="Địa chỉ trường"
                  fullWidth
                  margin="normal"
                  value={form.new_university_address}
                  onChange={(e) =>
                    setForm({ ...form, new_university_address: e.target.value })
                  }
                  multiline
                  rows={2}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      bgcolor: "white",
                      "&:hover fieldset": { borderColor: "#7c3aed" },
                      "&.Mui-focused fieldset": { borderColor: "#7c3aed" },
                    },
                    "& .MuiInputLabel-root.Mui-focused": { color: "#7c3aed" },
                  }}
                />
                <TextField
                  label="Thông tin liên hệ"
                  fullWidth
                  margin="normal"
                  value={form.new_university_contact}
                  onChange={(e) =>
                    setForm({ ...form, new_university_contact: e.target.value })
                  }
                  placeholder="VD: Tel: 024-xxx-xxxx | Email: info@university.edu.vn"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      bgcolor: "white",
                      "&:hover fieldset": { borderColor: "#7c3aed" },
                      "&.Mui-focused fieldset": { borderColor: "#7c3aed" },
                    },
                    "& .MuiInputLabel-root.Mui-focused": { color: "#7c3aed" },
                  }}
                />
              </Box>
            )}
          </DialogContent>

          <DialogActions
            sx={{
              p: { xs: 2, sm: 3 },
              gap: 1,
              flexDirection: { xs: "column", sm: "row" },
            }}
          >
            <Button
              onClick={handleClose}
              variant="outlined"
              fullWidth={{ xs: true, sm: false }}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                borderColor: "#e5e7eb",
                color: "#6b7280",
                "&:hover": {
                  borderColor: "#d1d5db",
                  bgcolor: "#f9fafb",
                },
              }}
            >
              Hủy bỏ
            </Button>
            <Button
              onClick={handleSave}
              variant="contained"
              fullWidth={{ xs: true, sm: false }}
              disabled={
                !form.name.trim() ||
                !form.student_code.trim() ||
                !form.email.trim() ||
                (isNewUniversity && !form.new_university_name.trim()) ||
                (!isNewUniversity && !form.university_id)
              }
              sx={{
                borderRadius: 2,
                textTransform: "none",
                background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #6d28d9 0%, #9333ea 100%)",
                  transform: "translateY(-1px)",
                  boxShadow: "0 8px 24px rgba(124,58,237,0.3)",
                },
                "&.Mui-disabled": {
                  background: "#e5e7eb",
                  color: "#9ca3af",
                },
                transition: "all 0.2s ease",
              }}
            >
              {editId ? "Cập nhật" : "Thêm mới"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Upload Dialog với tone tím */}
        <Dialog
          open={uploadOpen}
          onClose={() => setUploadOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: "16px",
              boxShadow: "0 20px 60px rgba(124,58,237,0.2)",
              mx: { xs: 2, sm: 0 },
            },
          }}
        >
          <DialogTitle
            sx={{
              pb: 1,
              background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
              color: "white",
              display: "flex",
              alignItems: "center",
              px: { xs: 2, sm: 3 },
              py: { xs: 2, sm: 2 },
            }}
          >
            <Avatar
              sx={{
                bgcolor: "rgba(255,255,255,0.2)",
                mr: 2,
                width: { xs: 40, sm: 48 },
                height: { xs: 40, sm: 48 },
              }}
            >
              <UploadFile sx={{ color: "white", fontSize: { xs: 20, sm: 24 } }} />
            </Avatar>
            <Typography
              variant="h6"
              fontWeight={700}
              sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
            >
              Import Sinh viên từ File
            </Typography>
          </DialogTitle>

          <DialogContent sx={{ pt: 3, px: { xs: 2, sm: 3 } }}>
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
                  fullWidth
                  sx={{
                    mb: 2,
                    py: 1.5,
                    borderRadius: 2,
                    borderColor: "#7c3aed",
                    color: "#7c3aed",
                    textTransform: "none",
                    fontWeight: 600,
                    "&:hover": {
                      borderColor: "#6d28d9",
                      bgcolor: "#f3f0ff",
                    },
                  }}
                >
                  Chọn File CSV/Excel
                </Button>
              </label>

              {selectedFile && (
                <Alert
                  severity="success"
                  sx={{
                    mb: 2,
                    borderRadius: 2,
                    bgcolor: "#f0fdf4",
                    color: "#166534",
                    "& .MuiAlert-icon": { color: "#16a34a" },
                  }}
                >
                  Đã chọn file: {selectedFile.name}
                </Alert>
              )}

              <Alert
                severity="info"
                sx={{
                  mb: 2,
                  borderRadius: 2,
                  bgcolor: "#faf5ff",
                  color: "#7c3aed",
                  "& .MuiAlert-icon": { color: "#a855f7" },
                }}
              >
                Format file CSV: Name, StudentCode, Email, UniversityName, Phone
              </Alert>
            </Box>
          </DialogContent>

          <DialogActions
            sx={{
              p: { xs: 2, sm: 3 },
              gap: 1,
              flexDirection: { xs: "column", sm: "row" },
            }}
          >
            <Button
              onClick={() => setUploadOpen(false)}
              variant="outlined"
              fullWidth={{ xs: true, sm: false }}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                borderColor: "#e5e7eb",
                color: "#6b7280",
                "&:hover": {
                  borderColor: "#d1d5db",
                  bgcolor: "#f9fafb",
                },
              }}
            >
              Hủy
            </Button>
            <Button
              onClick={handleFileUpload}
              variant="contained"
              fullWidth={{ xs: true, sm: false }}
              disabled={!selectedFile || uploading}
              startIcon={
                uploading ? <CircularProgress size={20} /> : <UploadFile />
              }
              sx={{
                borderRadius: 2,
                textTransform: "none",
                background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #6d28d9 0%, #9333ea 100%)",
                  transform: "translateY(-1px)",
                  boxShadow: "0 8px 24px rgba(124,58,237,0.3)",
                },
                "&.Mui-disabled": {
                  background: "#e5e7eb",
                  color: "#9ca3af",
                },
                transition: "all 0.2s ease",
              }}
            >
              {uploading ? "Đang upload..." : "Upload"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{
              borderRadius: 2,
              boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default Students;

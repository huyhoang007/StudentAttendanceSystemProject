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
  Card,
  Avatar,
  Fade,
  TableContainer,
  Paper,
  Chip,
  Tooltip, // <-- THÊM ĐỂ HIỂN THỊ TOOLTIP KHI TEXT BỊ CẮT
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  School,
  LocationOn,
  Phone,
  ChevronLeft,
  ChevronRight,
} from "@mui/icons-material";
import {
  getUniversities,
  addUniversity,
  updateUniversity,
  deleteUniversity,
} from "../services/universityService";

const Universities = () => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: "", address: "", contact_info: "" });

  const fetchData = async () => {
    const res = await getUniversities();
    console.log("Universities data:", res);
    setData([...res]);
    setPage(1);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpen = (item = null) => {
    setEditId(item ? item.university_id : null);
    setForm(
      item
        ? {
            name: item.name,
            address: item.address,
            contact_info: item.contactInfo || item.contact_info || "",
          }
        : { name: "", address: "", contact_info: "" }
    );
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSave = async () => {
    console.log("Form data being sent:", form);
    if (editId) await updateUniversity(editId, form);
    else await addUniversity(form);
    setOpen(false);
    fetchData();
  };

  const handleDelete = async (id) => {
    if (
      window.confirm(
        "Bạn có chắc muốn xóa trường này?\n\nLưu ý: Không thể xóa nếu có sinh viên đang liên kết với trường này."
      )
    ) {
      try {
        await deleteUniversity(id);
        fetchData();
        alert("Xóa trường thành công!");
      } catch (error) {
        console.error("Delete error:", error);
        alert(
          error.message || "Có lỗi xảy ra khi xóa trường. Vui lòng thử lại."
        );
      }
    }
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
                flexDirection: { xs: "column", md: "row" }, // Stack trên mobile
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
                  <School sx={{ fontSize: { xs: 32, md: 40 }, color: "white" }} />
                </Box>
                <Box>
                  <Typography
                    variant="h4"
                    fontWeight={700}
                    sx={{ fontSize: { xs: 20, md: 28 } }}
                  >
                    Quản lý Trường/Đơn vị
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.95, mt: 0.5, fontSize: { xs: "0.875rem", md: "1rem" } }}>
                    Quản lý thông tin các trường đại học và đơn vị trong hệ
                    thống
                  </Typography>
                  <Chip
                    label={`${data.length} trường`}
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

              <Box sx={{ width: { xs: "100%", md: "auto" } }}>
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
                  Thêm trường mới
                </Button>
              </Box>
            </Box>
          </Card>
        </Fade>

        {/* Bảng danh sách - CỐ ĐỊNH KÍCH THƯỚC, KHÔNG THANH TRƯỢT NGANG */}
        <Fade in={true} timeout={1000}>
          <Card
            elevation={6}
            sx={{
              borderRadius: "16px",
              boxShadow: "0 4px 24px rgba(124,58,237,0.08)",
              overflow: "hidden",
            }}
          >
            <TableContainer
              component={Paper}
              sx={{ 
                borderRadius: "16px", 
                boxShadow: "none",
                // LOẠI BỎ THANH TRƯỢT NGANG
                overflowX: "hidden",
              }}
            >
              <Table
                sx={{
                  // CỐ ĐỊNH LAYOUT ĐỂ KIỂM SOÁT CHIỀU RỘNG CỘT
                  tableLayout: "fixed",
                  width: "100%",
                  "& .MuiTableCell-root": {
                    borderBottom: "1px solid #f3f0ff",
                    py: 2,
                    px: { xs: 1, sm: 2 }, // Padding responsive
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
                        width: { xs: "30%", sm: "35%" }, // Responsive width
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <School sx={{ color: "#7c3aed", fontSize: { xs: 18, sm: 24 } }} /> 
                        <Box sx={{ display: { xs: "none", sm: "block" } }}>Tên trường</Box>
                        <Box sx={{ display: { xs: "block", sm: "none" } }}>Trường</Box>
                      </Box>
                    </TableCell>
                    <TableCell
                      sx={{ 
                        fontWeight: 700, 
                        fontSize: { xs: "0.875rem", sm: "1rem" }, 
                        color: "#7c3aed",
                        width: { xs: "35%", sm: "35%" },
                        display: { xs: "table-cell", sm: "table-cell" }, // Luôn hiển thị
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <LocationOn sx={{ color: "#7c3aed", fontSize: { xs: 18, sm: 24 } }} /> 
                        <Box>Địa chỉ</Box>
                      </Box>
                    </TableCell>
                    <TableCell
                      sx={{ 
                        fontWeight: 700, 
                        fontSize: { xs: "0.875rem", sm: "1rem" }, 
                        color: "#7c3aed",
                        width: { xs: "0%", sm: "20%" },
                        display: { xs: "none", sm: "table-cell" }, // Ẩn trên mobile
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Phone sx={{ color: "#7c3aed" }} /> Liên hệ
                      </Box>
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ 
                        fontWeight: 700, 
                        fontSize: { xs: "0.875rem", sm: "1rem" }, 
                        color: "#7c3aed",
                        width: { xs: "35%", sm: "10%" },
                      }}
                    >
                      <Box sx={{ display: { xs: "none", sm: "block" } }}>Thao tác</Box>
                      <Box sx={{ display: { xs: "block", sm: "none" } }}>Tác vụ</Box>
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {(() => {
                    const startIdx = (page - 1) * pageSize;
                    const endIdx = startIdx + pageSize;
                    const displayed = data.slice(startIdx, endIdx);
                    return displayed.map((u, index) => (
                      <TableRow
                        key={u.universityId || u.university_id || startIdx + index}
                        sx={{
                          bgcolor: index % 2 === 0 ? "#faf5ff" : "transparent",
                          transition: "all 0.2s ease",
                          "&:hover": {
                            bgcolor: "#f3e8ff",
                          },
                        }}
                      >
                        {/* CỘT TÊN TRƯỜNG - CẮT TEXT DÀI */}
                        <TableCell sx={{ py: 1.5 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, sm: 2 } }}>
                            <Avatar
                              sx={{
                                bgcolor: "#f3e8ff",
                                color: "#7c3aed",
                                width: { xs: 36, sm: 48 },
                                height: { xs: 36, sm: 48 },
                                boxShadow: "0 4px 12px rgba(124,58,237,0.1)",
                              }}
                            >
                              <School sx={{ fontSize: { xs: 18, sm: 24 } }} />
                            </Avatar>
                            <Tooltip title={u.name} arrow placement="top">
                              <Typography
                                variant="body1"
                                fontWeight={600}
                                color="#1f2937"
                                sx={{
                                  fontSize: { xs: "0.875rem", sm: "1rem" },
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  maxWidth: "100%",
                                }}
                              >
                                {u.name}
                              </Typography>
                            </Tooltip>
                          </Box>
                        </TableCell>

                        {/* CỘT ĐỊA CHỈ - CẮT TEXT DÀI */}
                        <TableCell sx={{ py: 1.5 }}>
                          <Tooltip title={u.address} arrow placement="top">
                            <Typography 
                              variant="body2" 
                              color="#6b7280"
                              sx={{
                                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                maxWidth: "100%",
                              }}
                            >
                              {u.address}
                            </Typography>
                          </Tooltip>
                        </TableCell>

                        {/* CỘT LIÊN HỆ - ẨN TRÊN MOBILE */}
                        <TableCell sx={{ py: 1.5, display: { xs: "none", sm: "table-cell" } }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Phone sx={{ color: "#a855f7", fontSize: 18 }} />
                            <Tooltip 
                              title={u.contactInfo || u.contact_info || "Chưa có thông tin"} 
                              arrow 
                              placement="top"
                            >
                              <Typography 
                                variant="body2" 
                                color="#6b7280"
                                sx={{
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  maxWidth: "100%",
                                }}
                              >
                                {u.contactInfo || u.contact_info || (
                                  <span style={{ color: "#9ca3af", fontStyle: "italic" }}>
                                    Chưa có
                                  </span>
                                )}
                              </Typography>
                            </Tooltip>
                          </Box>
                        </TableCell>

                        {/* CỘT THAO TÁC - RESPONSIVE BUTTON SIZE */}
                        <TableCell align="right" sx={{ py: 1.5 }}>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "flex-end",
                              alignItems: "center",
                              gap: { xs: 0.5, sm: 1 },
                            }}
                          >
                            <IconButton
                              onClick={() => handleOpen(u)}
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
                              onClick={() => handleDelete(u.university_id)}
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
                    ));
                  })()}

                  {data.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                          }}
                        >
                          <School sx={{ fontSize: { xs: 48, sm: 64 }, color: "#e9d5ff", mb: 2 }} />
                          <Typography
                            variant="h6"
                            color="#9ca3af"
                            fontWeight={600}
                            sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
                          >
                            Chưa có trường nào được thêm
                          </Typography>
                          <Typography 
                            variant="body2" 
                            color="#d1d5db" 
                            mt={1}
                            sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                          >
                            Nhấp vào "Thêm trường mới" để bắt đầu
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            {data.length > pageSize && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  p: 2,
                  borderTop: "1px solid #f3f0ff",
                  flexDirection: { xs: "column", sm: "row" },
                  gap: { xs: 2, sm: 0 },
                }}
              >
                <Box>
                  <Typography 
                    variant="body2" 
                    color="#6b7280"
                    sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                  >
                    Hiển thị {Math.min((page - 1) * pageSize + 1, data.length)}-
                    {Math.min(page * pageSize, data.length)} trên {data.length} trường
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Button
                    startIcon={<ChevronLeft />}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    sx={{
                      textTransform: "none",
                      color: "#7c3aed",
                      fontSize: { xs: "0.75rem", sm: "0.875rem" },
                      minWidth: { xs: 60, sm: 80 },
                      "&:hover": { bgcolor: "#f3f0ff" },
                      "&.Mui-disabled": { color: "#d1d5db" },
                    }}
                  >
                    Trước
                  </Button>

                  <Chip
                    label={`${page} / ${Math.max(1, Math.ceil(data.length / pageSize))}`}
                    sx={{
                      bgcolor: "#faf5ff",
                      color: "#7c3aed",
                      fontWeight: 600,
                      px: 1,
                      fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    }}
                  />

                  <Button
                    endIcon={<ChevronRight />}
                    onClick={() =>
                      setPage((p) =>
                        Math.min(Math.ceil(data.length / pageSize), p + 1)
                      )
                    }
                    disabled={page >= Math.ceil(data.length / pageSize)}
                    sx={{
                      textTransform: "none",
                      color: "#7c3aed",
                      fontSize: { xs: "0.75rem", sm: "0.875rem" },
                      minWidth: { xs: 60, sm: 80 },
                      "&:hover": { bgcolor: "#f3f0ff" },
                      "&.Mui-disabled": { color: "#d1d5db" },
                    }}
                  >
                    Tiếp
                  </Button>
                </Box>
              </Box>
            )}
          </Card>
        </Fade>

        {/* Dialog với tone tím */}
        <Dialog
          open={open}
          onClose={handleClose}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: "16px",
              boxShadow: "0 20px 60px rgba(124,58,237,0.2)",
              mx: { xs: 2, sm: 0 }, // Margin cho mobile
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
              <School sx={{ color: "white", fontSize: { xs: 20, sm: 24 } }} />
            </Avatar>
            <Typography 
              variant="h6" 
              fontWeight={700}
              sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
            >
              {editId ? "Cập nhật thông tin trường" : "Thêm trường mới"}
            </Typography>
          </DialogTitle>

          <DialogContent sx={{ pt: 3, px: { xs: 2, sm: 3 } }}>
            <TextField
              label="Tên trường"
              fullWidth
              margin="normal"
              variant="outlined"
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
              label="Địa chỉ"
              fullWidth
              margin="normal"
              variant="outlined"
              multiline
              rows={2}
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
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
              label="Thông tin liên hệ"
              fullWidth
              margin="normal"
              variant="outlined"
              multiline
              rows={2}
              placeholder="VD: Tel: 024-3754-7000 | Email: info@university.edu.vn | Website: www.university.edu.vn"
              helperText="Nhập số điện thoại, email và website của trường"
              value={form.contact_info}
              onChange={(e) =>
                setForm({ ...form, contact_info: e.target.value })
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
          </DialogContent>

          <DialogActions sx={{ p: { xs: 2, sm: 3 }, gap: 1, flexDirection: { xs: "column", sm: "row" } }}>
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
              sx={{
                borderRadius: 2,
                textTransform: "none",
                background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
                "&:hover": {
                  background: "linear-gradient(135deg, #6d28d9 0%, #9333ea 100%)",
                  transform: "translateY(-1px)",
                  boxShadow: "0 8px 24px rgba(124,58,237,0.3)",
                },
                transition: "all 0.2s ease",
              }}
            >
              {editId ? "Cập nhật" : "Thêm mới"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default Universities;

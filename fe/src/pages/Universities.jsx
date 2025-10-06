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
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  School,
  LocationOn,
  Phone,
} from "@mui/icons-material";
import {
  getUniversities,
  addUniversity,
  updateUniversity,
  deleteUniversity,
} from "../services/universityService";

const Universities = () => {
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: "", address: "", contact_info: "" });

  const fetchData = async () => {
    const res = await getUniversities();
    console.log("Universities data:", res); // Debug log
    setData([...res]);
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
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
      }}
    >
      {/* Header Card */}
      <Fade in={true} timeout={800}>
        <Card
          elevation={8}
          sx={{
            mb: 4,
            borderRadius: 6,
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
          }}
        >
          <Box
            sx={{
              p: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Avatar
                sx={{
                  bgcolor: "rgba(255,255,255,0.2)",
                  mr: 3,
                  width: 64,
                  height: 64,
                }}
              >
                <School sx={{ fontSize: 32, color: "white" }} />
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight={700} mb={1}>
                  Quản lý Trường/Đơn vị
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Quản lý thông tin các trường đại học và đơn vị trong hệ thống
                </Typography>
                <Chip
                  label={`${data.length} trường`}
                  sx={{
                    mt: 1,
                    bgcolor: "rgba(255,255,255,0.2)",
                    color: "white",
                    fontWeight: 600,
                  }}
                />
              </Box>
            </Box>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpen()}
              sx={{
                bgcolor: "rgba(255,255,255,0.2)",
                "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
                borderRadius: 3,
                px: 3,
                py: 1.5,
                fontWeight: 600,
                textTransform: "none",
                fontSize: "1rem",
              }}
            >
              Thêm trường mới
            </Button>
          </Box>
        </Card>
      </Fade>

      {/* Table Card */}
      <Fade in={true} timeout={1000}>
        <Card
          elevation={8}
          sx={{
            borderRadius: 6,
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            overflow: "hidden",
          }}
        >
          <TableContainer component={Paper} sx={{ borderRadius: 6 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#f8f9ff" }}>
                  <TableCell
                    sx={{ fontWeight: 700, fontSize: "1rem", color: "#333" }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <School sx={{ mr: 1, color: "#667eea" }} />
                      Tên trường
                    </Box>
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 700, fontSize: "1rem", color: "#333" }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <LocationOn sx={{ mr: 1, color: "#667eea" }} />
                      Địa chỉ
                    </Box>
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 700, fontSize: "1rem", color: "#333" }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Phone sx={{ mr: 1, color: "#667eea" }} />
                      Liên hệ
                    </Box>
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ fontWeight: 700, fontSize: "1rem", color: "#333" }}
                  >
                    Thao tác
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((u, index) => (
                  <Fade
                    in={true}
                    timeout={300 + index * 100}
                    key={u.universityId || u.university_id || index}
                  >
                    <TableRow
                      sx={{
                        "&:hover": {
                          bgcolor: "#f8f9ff",
                          transform: "scale(1.01)",
                          transition: "all 0.2s ease-in-out",
                        },
                        transition: "all 0.2s ease-in-out",
                      }}
                    >
                      <TableCell sx={{ py: 2 }}>
                        <Typography
                          variant="body1"
                          fontWeight={600}
                          color="#333"
                        >
                          {u.name}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        <Typography variant="body2" color="#666">
                          {u.address}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Phone
                            sx={{ mr: 1, color: "#74ebd5", fontSize: 18 }}
                          />
                          <Typography variant="body2" color="#666">
                            {u.contactInfo || u.contact_info || (
                              <span
                                style={{ color: "#999", fontStyle: "italic" }}
                              >
                                Chưa có thông tin
                              </span>
                            )}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right" sx={{ py: 2 }}>
                        <IconButton
                          color="primary"
                          onClick={() => handleOpen(u)}
                          sx={{
                            mr: 1,
                            bgcolor: "rgba(102, 126, 234, 0.1)",
                            "&:hover": {
                              bgcolor: "rgba(102, 126, 234, 0.2)",
                              transform: "scale(1.1)",
                            },
                            transition: "all 0.2s ease-in-out",
                          }}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleDelete(u.university_id)}
                          sx={{
                            bgcolor: "rgba(244, 67, 54, 0.1)",
                            "&:hover": {
                              bgcolor: "rgba(244, 67, 54, 0.2)",
                              transform: "scale(1.1)",
                            },
                            transition: "all 0.2s ease-in-out",
                          }}
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  </Fade>
                ))}
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
                        <School sx={{ fontSize: 64, color: "#ccc", mb: 2 }} />
                        <Typography variant="h6" color="#999" fontWeight={500}>
                          Chưa có trường nào được thêm
                        </Typography>
                        <Typography variant="body2" color="#ccc" mt={1}>
                          Nhấp vào "Thêm trường mới" để bắt đầu
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Fade>

      {/* Enhanced Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            boxShadow: "0 16px 64px rgba(0,0,0,0.16)",
          },
        }}
      >
        <DialogTitle
          sx={{
            pb: 1,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)", mr: 2 }}>
            <School sx={{ color: "white" }} />
          </Avatar>
          <Typography variant="h6" fontWeight={700}>
            {editId ? "Cập nhật thông tin trường" : "Thêm trường mới"}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
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
                "&:hover fieldset": { borderColor: "#667eea" },
                "&.Mui-focused fieldset": { borderColor: "#667eea" },
              },
              "& .MuiInputLabel-root.Mui-focused": { color: "#667eea" },
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
                "&:hover fieldset": { borderColor: "#667eea" },
                "&.Mui-focused fieldset": { borderColor: "#667eea" },
              },
              "& .MuiInputLabel-root.Mui-focused": { color: "#667eea" },
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
            onChange={(e) => setForm({ ...form, contact_info: e.target.value })}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                "&:hover fieldset": { borderColor: "#667eea" },
                "&.Mui-focused fieldset": { borderColor: "#667eea" },
              },
              "& .MuiInputLabel-root.Mui-focused": { color: "#667eea" },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button
            onClick={handleClose}
            variant="outlined"
            sx={{
              borderRadius: 2,
              textTransform: "none",
              borderColor: "#ddd",
              color: "#666",
              "&:hover": { borderColor: "#999", bgcolor: "#f5f5f5" },
            }}
          >
            Hủy bỏ
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            sx={{
              borderRadius: 2,
              textTransform: "none",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
                transform: "translateY(-1px)",
                boxShadow: "0 4px 16px rgba(102, 126, 234, 0.4)",
              },
              transition: "all 0.2s ease-in-out",
            }}
          >
            {editId ? "Cập nhật" : "Thêm mới"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Universities;

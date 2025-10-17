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
        background:
          "linear-gradient(180deg, rgba(246,249,252,1) 0%, rgba(243,246,250,1) 40%, rgba(227,236,247,1) 100%)",
      }}
    >
      <Box sx={{ maxWidth: 1200, mx: "auto" }}>
        {/* Big rounded header (mimic sample) */}
        <Fade in={true} timeout={800}>
          <Card
            elevation={10}
            sx={{
              mb: 4,
              borderRadius: "48px",
              boxShadow: "0 20px 60px rgba(20,40,80,0.12)",
              background: "linear-gradient(90deg, #6c6ce6 0%, #8a5fe6 40%, #5dd39e 100%)",
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
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box
                  sx={{
                    width: 84,
                    height: 84,
                    borderRadius: "999px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "rgba(255,255,255,0.12)",
                    boxShadow: "inset 0 2px 10px rgba(255,255,255,0.06)",
                  }}
                >
                  <School sx={{ fontSize: 36, color: "white" }} />
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight={800} sx={{ fontSize: { xs: 20, md: 28 } }}>
                    Quản lý Trường/Đơn vị
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.95, mt: 0.5 }}>
                    Quản lý thông tin các trường đại học và đơn vị trong hệ thống
                  </Typography>
                  <Chip
                    label={`${data.length} trường`}
                    sx={{
                      mt: 1,
                      bgcolor: "rgba(255,255,255,0.14)",
                      color: "white",
                      fontWeight: 700,
                      borderRadius: 2,
                    }}
                  />
                </Box>
              </Box>

              <Box>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => handleOpen()}
                  sx={{
                    bgcolor: "#2ecc71",
                    color: "white",
                    px: 3,
                    py: 1.25,
                    borderRadius: 999,
                    boxShadow: "0 10px 30px rgba(46,204,113,0.18)",
                    "&:hover": { bgcolor: "#27c56a", transform: "translateY(-2px)" },
                    textTransform: "none",
                    fontWeight: 700,
                  }}
                >
                  Thêm trường mới
                </Button>
              </Box>
            </Box>
          </Card>
        </Fade>

        {/* White rounded list area */}
        <Fade in={true} timeout={1000}>
          <Card
            elevation={6}
            sx={{
              borderRadius: 4,
              boxShadow: "0 12px 40px rgba(12,30,60,0.08)",
              overflow: "hidden",
            }}
          >
            <TableContainer component={Paper} sx={{ borderRadius: 4, boxShadow: "none" }}>
              <Table
                sx={{
                  "& .MuiTableCell-root": {
                    borderBottom: "none",
                    py: 2,
                  },
                }}
              >
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f6f8ff" }}>
                    <TableCell sx={{ fontWeight: 800, fontSize: "1rem", color: "#233" }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <School sx={{ color: "#6c6ce6" }} /> Tên trường
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: "1rem", color: "#233" }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <LocationOn sx={{ color: "#6c6ce6" }} /> Địa chỉ
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: "1rem", color: "#233" }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Phone sx={{ color: "#6c6ce6" }} /> Liên hệ
                      </Box>
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800, fontSize: "1rem", color: "#233" }}>
                      Thao tác
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {data.map((u, index) => (
                    <TableRow
                      key={u.universityId || u.university_id || index}
                      sx={{
                        bgcolor: index % 2 === 0 ? "#e7f1faff" : "transparent", // zebra striping
                        transition: "background-color 0.15s ease",
                        "&:hover": { bgcolor: "#d1e0feff" }, // subtle hover
                      }}
                    >
                      <TableCell sx={{ py: 1.5, width: "35%" }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                          }}
                        >
                          <Avatar
                            sx={{
                              bgcolor: "rgba(108,108,230,0.09)",
                              color: "#6c6ce6",
                              width: 44,
                              height: 44,
                            }}
                          >
                            <School />
                          </Avatar>
                          <Box>
                            <Typography variant="body1" fontWeight={700} color="#223">
                              {u.name}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      <TableCell sx={{ py: 1.5, width: "40%" }}>
                        <Typography variant="body2" color="#6b7280">
                          {u.address}
                        </Typography>
                      </TableCell>

                      <TableCell sx={{ py: 1.5, width: "15%" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Phone sx={{ color: "#4fd2b6", fontSize: 18 }} />
                          <Typography variant="body2" color="#6b7280">
                            {u.contactInfo || u.contact_info || (
                              <span style={{ color: "#9aa1b3", fontStyle: "italic" }}>Chưa có thông tin</span>
                            )}
                          </Typography>
                        </Box>
                      </TableCell>

                      <TableCell align="right" sx={{ py: 1.5, width: "10%" }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "flex-end",
                            alignItems: "center",
                            gap: 1.25,           // tăng khoảng cách giữa các nút
                          }}
                        >
                          <IconButton
                            color="primary"
                            onClick={() => handleOpen(u)}
                            sx={{
                              bgcolor: "rgba(108,108,230,0.08)",
                              width: 44,
                              height: 44,
                              "&:hover": { bgcolor: "rgba(108,108,230,0.14)", transform: "scale(1.06)" },
                              transition: "all 0.15s ease-in-out",
                            }}
                          >
                            <Edit />
                          </IconButton>

                          <IconButton
                            color="error"
                            onClick={() => handleDelete(u.university_id)}
                            sx={{
                              bgcolor: "rgba(255,80,80,0.08)",
                              width: 44,
                              height: 44,
                              "&:hover": { bgcolor: "rgba(255,80,80,0.14)", transform: "scale(1.06)" },
                              transition: "all 0.15s ease-in-out",
                            }}
                          >
                            <Delete />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}

                  {data.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                          <School sx={{ fontSize: 64, color: "#d9e6ff", mb: 2 }} />
                          <Typography variant="h6" color="#9aa1b3" fontWeight={600}>
                            Chưa có trường nào được thêm
                          </Typography>
                          <Typography variant="body2" color="#b8c3d9" mt={1}>
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

        {/* Dialog (giữ nguyên logic, style nhỏ để khớp theme) */}
        <Dialog
          open={open}
          onClose={handleClose}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: "0 20px 80px rgba(12,30,60,0.16)",
            },
          }}
        >
          <DialogTitle
            sx={{
              pb: 1,
              background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
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
                background: "linear-gradient(90deg, #2ecc71 0%, #26b86a 100%)",
                "&:hover": {
                  background: "linear-gradient(90deg, #26b86a 0%, #20a25c 100%)",
                  transform: "translateY(-1px)",
                  boxShadow: "0 6px 26px rgba(38,184,106,0.2)",
                },
                transition: "all 0.15s ease-in-out",
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

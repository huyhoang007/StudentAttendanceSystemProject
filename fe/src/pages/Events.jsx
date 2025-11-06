import React, { useEffect, useState, useCallback } from "react";
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
  Chip,
  Alert,
  Card,
  CardContent,
  CircularProgress,
  Tooltip,
  MenuItem,
  TablePagination,
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  Schedule,
  Group,
  Visibility,
  Event as EventIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import {
  getEvents,
  addEvent,
  updateEvent,
  deleteEvent,
  getEventsByUniversity,
} from "../services/eventService";
import { getOrganizerById, getOrganizers } from "../services/organizerService";
import { getUniversities } from "../services/universityService";
import { useAuth } from "../contexts/AuthContext";
import { createTheme, ThemeProvider } from "@mui/material/styles"; // Import ThemeProvider và createTheme

// Định nghĩa theme với tông màu tím
const purpleTheme = createTheme({
  palette: {
    primary: {
      main: "#673ab7", // Màu tím đậm chính
    },
    secondary: {
      main: "#9c27b0", // Màu tím magenta
    },
    info: {
      main: "#ba68c8", // Màu tím nhạt hơn cho icon info
    },
    success: {
      main: "#4caf50", // Giữ màu xanh lá cho trạng thái "Đang diễn ra"
    },
    error: {
      main: "#f44336", // Giữ màu đỏ cho lỗi
    },
    background: {
      default: "#f3e5f5", // Nền màu tím rất nhạt
      paper: "#ffffff", // Nền card và dialog
    },
  },
  components: {
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          background: "linear-gradient(135deg, #7e57c2 0%, #9c27b0 100%)", // Gradient tím
          color: "white",
          "&:hover": {
            background: "linear-gradient(135deg, #673ab7 0%, #8e24aa 100%)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12, // Bo tròn nhiều hơn cho card
          boxShadow: "0 8px 30px rgba(0,0,0,0.1)", // Đổ bóng mềm mại hơn
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          backgroundColor: "#673ab7", // Nền tím đậm cho tiêu đề dialog
          color: "white",
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: "#ede7f6", // Nền tím nhạt cho tiêu đề bảng
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:hover": {
            backgroundColor: "#f3e5f5 !important", // Nền tím nhạt khi hover
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 700,
          color: "#424242",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            "& fieldset": {
              borderColor: "#d1c4e9", // Viền tím nhạt
            },
            "&:hover fieldset": {
              borderColor: "#9575cd", // Viền tím đậm hơn khi hover
            },
            "&.Mui-focused fieldset": {
              borderColor: "#673ab7", // Viền tím đậm khi focus
            },
          },
        },
      },
    },
  },
});

const Events = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const { role, organizerId } = useAuth();
  const [organizerInfo, setOrganizerInfo] = useState(null);
  const [selectedUniversity, setSelectedUniversity] = useState("");
  const [form, setForm] = useState({
    Title: "",
    Description: "",
    Organizer: "",
    StartDate: "",
    EndDate: "",
    OrganizerId: "",
    UniversityId: "",
  });
  const [eventError, setEventError] = useState("");
  const [loading, setLoading] = useState(false);
  const [universities, setUniversities] = useState([]);
  const [organizers, setOrganizers] = useState([]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      let res;
      if (role === "organizer") {
        if (!organizerId) {
          setEventError(
            "Không tìm thấy thông tin organizer. Vui lòng đăng xuất và đăng nhập lại."
          );
          setData([]);
          return;
        }
        const token = localStorage.getItem("authToken");
        res = await fetch(`/api/event/by-organizer/${organizerId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
        res = await res.json();
      } else {
        res = await getEvents();
      }
      setData(Array.isArray(res) ? res : []);
      setPage(0);
    } catch (error) {
      console.error("Error fetching events:", error);
      setEventError("Không thể tải danh sách sự kiện: " + error.message);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [role, organizerId]);

  const loadOrganizerInfo = useCallback(async () => {
    if (!organizerId) return;
    try {
      const orgData = await getOrganizerById(organizerId);
      setOrganizerInfo(orgData);
    } catch (error) {
      console.error("Error loading organizer info:", error);
    }
  }, [organizerId]);

  useEffect(() => {
    fetchData();
    if (role === "organizer" && organizerId) loadOrganizerInfo();
    if (role === "admin") {
      getOrganizers()
        .then(setOrganizers)
        .catch(() => setOrganizers([]));
      getUniversities()
        .then(setUniversities)
        .catch(() => setUniversities([]));
    }
  }, [fetchData, role, organizerId, loadOrganizerInfo]);

  const handleOpen = (item = null) => {
    setEditId(item ? item.eventId || item.EventId : null);
    setForm(
      item
        ? {
            Title: item.title || item.Title || "",
            Description: item.description || item.Description || "",
            Organizer: item.organizer || item.Organizer || "",
            StartDate: item.startDate || item.StartDate || "",
            EndDate: item.endDate || item.EndDate || "",
            OrganizerId:
              role === "organizer"
                ? organizerId
                : item.organizerId || item.OrganizerId || "",
          }
        : {
            Title: "",
            Description: "",
            Organizer: "",
            StartDate: "",
            EndDate: "",
            OrganizerId: role === "organizer" ? organizerId : "",
          }
    );
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  const isGuid = (str) =>
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
      str
    );

  const handleSave = async () => {
    let eventData = { ...form };
    if (role === "organizer" && isGuid(organizerId)) {
      eventData.OrganizerId = organizerId;
    } else if (role === "admin" && isGuid(form.OrganizerId)) {
      eventData.OrganizerId = form.OrganizerId;
    } else {
      eventData.OrganizerId = "";
    }
    eventData.createdByRole = role;

    if (!eventData.StartDate || !eventData.EndDate) {
      alert("Vui lòng nhập đầy đủ ngày bắt đầu và ngày kết thúc!");
      return;
    }
    eventData.StartDate = eventData.StartDate.slice(0, 10);
    eventData.EndDate = eventData.EndDate.slice(0, 10);

    if (!eventData.OrganizerId || !isGuid(eventData.OrganizerId)) {
      alert(
        "OrganizerId không hợp lệ! Hãy kiểm tra lại tài khoản tổ chức hoặc admin."
      );
      return;
    }

    const token = localStorage.getItem("authToken");
    setEventError("");
    try {
      if (editId) await updateEvent(editId, eventData, token);
      else await addEvent(eventData, token);
      setOpen(false);
      fetchData();
    } catch (err) {
      setEventError(
        err && err.message
          ? "Lỗi: " + err.message
          : "Lỗi không xác định khi tạo/sửa sự kiện."
      );
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa?")) {
      const token = localStorage.getItem("authToken");
      await deleteEvent(id, token);
      fetchData();
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
    <ThemeProvider theme={purpleTheme}>
      {" "}
      {/* Áp dụng theme tím */}
      <Box
        sx={{
          p: 4,
          backgroundColor: purpleTheme.palette.background.default,
          minHeight: "100vh",
        }}
      >
        <Card
          sx={{
            mb: 3,
            background: "linear-gradient(135deg, #673ab7 0%, #9c27b0 100%)", // Gradient tím cho header
            color: "white",
            // Đã có borderRadius và boxShadow từ theme.components.MuiCard
          }}
        >
          <CardContent>
            <Box display="flex" alignItems="center" gap={2}>
              <EventIcon sx={{ fontSize: 40 }} />
              <Box>
                <Typography variant="h4" fontWeight={700}>
                  Quản lý Sự kiện NVH Sinh viên
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Quản lý, theo dõi và điểm danh sinh viên tham gia các hoạt
                  động.
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {role === "admin" && (
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              color="primary" // Sử dụng màu primary từ theme (tím)
              sx={{ mb: 1 }}
            >
              🏫 Chọn trường để xem sự kiện
            </Typography>
            <Card sx={{ p: 0.5, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
              <TextField
                select
                fullWidth
                size="small"
                value={selectedUniversity || ""}
                onChange={(e) => {
                  setSelectedUniversity(e.target.value);
                  if (e.target.value) {
                    getEventsByUniversity(e.target.value)
                      .then((eventsData) => {
                        setData(eventsData);
                        setPage(0);
                      })
                      .catch((error) => {
                        console.error(
                          "Error fetching events by university:",
                          error
                        );
                        setEventError(
                          "Không thể tải danh sách sự kiện: " + error.message
                        );
                      });
                  } else {
                    fetchData();
                  }
                }}
                SelectProps={{
                  displayEmpty: true,
                  renderValue: (selected) => {
                    if (!selected)
                      return (
                        <span style={{ color: "#9e9e9e" }}>Chọn Trường </span>
                      );
                    const u = universities.find(
                      (x) => x.universityId === selected
                    );
                    return u ? u.name : selected;
                  },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#fff",
                    "& fieldset": {
                      borderColor: purpleTheme.palette.primary.light, // Viền tím nhạt
                    },
                    "&:hover fieldset": {
                      borderColor: purpleTheme.palette.primary.main, // Viền tím đậm khi hover
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: purpleTheme.palette.primary.dark, // Viền tím đậm nhất khi focus
                    },
                  },
                }}
              >
                <MenuItem value="">-- Tất cả các trường --</MenuItem>
                {universities.map((univ) => (
                  <MenuItem key={univ.universityId} value={univ.universityId}>
                    {univ.name}
                  </MenuItem>
                ))}
              </TextField>
            </Card>
          </Box>
        )}

        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography
            variant="h5"
            fontWeight={700}
            color="primary"
            sx={{ opacity: 1 }}
          >
            Danh sách sự kiện
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={() => handleOpen()}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              px: 3,
              py: 1,
              fontWeight: 600,
            }}
          >
            Thêm sự kiện
          </Button>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" my={5}>
            <CircularProgress color="primary" /> {/* Màu tím cho loading */}
          </Box>
        ) : (
          <Card
            sx={{
              backgroundColor: "white",
              width: "100%",
              // Đã có borderRadius và boxShadow từ theme.components.MuiCard
            }}
          >
            <Table>
              <TableHead
                sx={{ backgroundColor: purpleTheme.palette.grey[100] }}
              >
                <TableRow>
                  <TableCell>Tiêu đề</TableCell>
                  <TableCell>Mô tả</TableCell>
                  <TableCell>Đơn vị tổ chức</TableCell>
                  <TableCell>Ngày bắt đầu</TableCell>
                  <TableCell>Ngày kết thúc</TableCell>
                  <TableCell align="center">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      {eventError ? (
                        <Typography color="error">{eventError}</Typography>
                      ) : (
                        "Chưa có sự kiện nào"
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  (rowsPerPage > 0
                    ? data.slice(
                        page * rowsPerPage,
                        page * rowsPerPage + rowsPerPage
                      )
                    : data
                  ).map((e) => (
                    <TableRow
                      key={e.eventId || e.EventId}
                      hover
                      sx={{
                        transition: "all 0.2s",
                        // '&:hover' đã được định nghĩa trong theme
                      }}
                    >
                      <TableCell>
                        <Typography fontWeight={600}>
                          {e.title || e.Title || "Chưa có tiêu đề"}
                        </Typography>
                        <Chip
                          size="small"
                          label={(() => {
                            const startDate = e.startDate || e.StartDate;
                            const endDate = e.endDate || e.EndDate;
                            if (!startDate || isNaN(new Date(startDate)))
                              return "Chưa xác định";
                            const now = new Date();
                            const s = new Date(startDate);
                            const ed = endDate ? new Date(endDate) : null;
                            if (s > now) return "Sắp diễn ra";
                            if (ed && ed >= now) return "Đang diễn ra";
                            return "Đã kết thúc";
                          })()}
                          color={(() => {
                            const s = new Date(e.startDate || e.StartDate);
                            const ed = new Date(e.endDate || e.EndDate);
                            const now = new Date();
                            if (s > now) return "primary"; // Màu tím cho "Sắp diễn ra"
                            if (ed >= now) return "success"; // Giữ màu xanh lá cho "Đang diễn ra"
                            return "default";
                          })()}
                          sx={{ mt: 0.5 }}
                        />
                      </TableCell>
                      <TableCell>{e.description || e.Description}</TableCell>
                      <TableCell>{e.organizer || e.Organizer}</TableCell>
                      <TableCell>
                        {new Date(
                          e.startDate || e.StartDate
                        ).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {new Date(e.endDate || e.EndDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell align="center">
                        <Box display="flex" justifyContent="center" gap={0.8}>
                          <Tooltip title="Quản lý phiên">
                            <IconButton
                              color="info" // Sử dụng màu info từ theme (tím nhạt)
                              onClick={() =>
                                navigate(
                                  `/sessions?eventId=${e.eventId || e.EventId}`
                                )
                              }
                            >
                              <Schedule />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Quản lý sinh viên">
                            <IconButton
                              color="secondary" // Sử dụng màu secondary từ theme (tím magenta)
                              onClick={() =>
                                navigate(
                                  `/student-in-event-management?eventId=${
                                    e.eventId || e.EventId
                                  }`
                                )
                              }
                            >
                              <Group />
                            </IconButton>
                          </Tooltip>
                          {(role === "organizer" &&
                            (e.organizerId === organizerId ||
                              e.OrganizerId === organizerId)) ||
                          role === "admin" ? (
                            <>
                              <Tooltip title="Sửa sự kiện">
                                <IconButton
                                  color="primary"
                                  onClick={() => handleOpen(e)}
                                >
                                  <Edit />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Xóa sự kiện">
                                <IconButton
                                  color="error"
                                  onClick={() =>
                                    handleDelete(e.eventId || e.EventId)
                                  }
                                >
                                  <Delete />
                                </IconButton>
                              </Tooltip>
                            </>
                          ) : (
                            <Tooltip title="Xem chi tiết">
                              <IconButton
                                onClick={() =>
                                  navigate(
                                    `/event-details/${e.eventId || e.EventId}`
                                  )
                                }
                              >
                                <Visibility />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

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
            />
          </Card>
        )}

        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
          <DialogTitle
            sx={{
              fontWeight: 600,
              // backgroundColor và color đã được định nghĩa trong theme.components.MuiDialogTitle
              py: 1.5,
              px: 3,
            }}
          >
            {editId ? "✏️ Chỉnh sửa sự kiện" : "🗓️ Thêm sự kiện mới"}
          </DialogTitle>

          <DialogContent
            sx={{
              backgroundColor: purpleTheme.palette.background.default,
              p: 3,
            }}
          >
            <Box
              sx={{
                borderRadius: 2,
                border: "1px solid #e0e0e0",
                bgcolor: "white",
                p: 3,
              }}
            >
              {role === "organizer" && organizerInfo && (
                <Alert severity="info" sx={{ mb: 3 }}>
                  Sự kiện này sẽ thuộc về trường:{" "}
                  <strong>
                    {organizerInfo.university?.name ||
                      organizerInfo.universityName ||
                      "Chưa xác định trường"}
                  </strong>
                </Alert>
              )}

              {role === "admin" && (
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="subtitle1"
                    fontWeight={600}
                    sx={{ mb: 1 }}
                  >
                    👥 Chọn người tổ chức
                  </Typography>
                  <TextField
                    select
                    fullWidth
                    value={form.OrganizerId}
                    onChange={(e) =>
                      setForm({ ...form, OrganizerId: e.target.value })
                    }
                    SelectProps={{ native: true }}
                    size="small"
                  >
                    <option value="">-- Chọn người tổ chức để quản lý--</option>
                    {organizers.map((o) => (
                      <option
                        key={o.organizerId || o.OrganizerId}
                        value={o.organizerId || o.OrganizerId}
                      >
                        {o.organizerName || o.OrganizerName} -{" "}
                        {o.university?.name ||
                          o.universityName ||
                          "Không rõ trường"}
                      </option>
                    ))}
                  </TextField>
                </Box>
              )}

              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                🧾 Thông tin sự kiện
              </Typography>
              <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
                <TextField
                  label="Tiêu đề"
                  fullWidth
                  value={form.Title}
                  onChange={(e) => setForm({ ...form, Title: e.target.value })}
                  size="small"
                />
                <TextField
                  label="Đơn vị tổ chức"
                  fullWidth
                  value={form.Organizer}
                  onChange={(e) =>
                    setForm({ ...form, Organizer: e.target.value })
                  }
                  size="small"
                />
              </Box>

              <TextField
                label="Mô tả"
                fullWidth
                margin="normal"
                multiline
                rows={3}
                value={form.Description}
                onChange={(e) =>
                  setForm({ ...form, Description: e.target.value })
                }
                size="small"
              />

              <Typography
                variant="subtitle1"
                fontWeight={600}
                sx={{ mt: 3, mb: 1 }}
              >
                ⏰ Thời gian diễn ra
              </Typography>
              <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
                <TextField
                  label="Ngày bắt đầu"
                  type="date"
                  fullWidth
                  value={form.StartDate}
                  onChange={(e) =>
                    setForm({ ...form, StartDate: e.target.value })
                  }
                  InputLabelProps={{ shrink: true }}
                  size="small"
                />
                <TextField
                  label="Ngày kết thúc"
                  type="date"
                  fullWidth
                  value={form.EndDate}
                  onChange={(e) =>
                    setForm({ ...form, EndDate: e.target.value })
                  }
                  InputLabelProps={{ shrink: true }}
                  size="small"
                />
              </Box>
            </Box>
          </DialogContent>

          <DialogActions
            sx={{
              px: 3,
              py: 2,
              bgcolor: purpleTheme.palette.grey[50], // Nền nhạt cho footer dialog
              borderTop: "1px solid #e0e0e0",
            }}
          >
            <Button onClick={handleClose} color="inherit">
              Hủy
            </Button>
            <Button
              variant="contained"
              onClick={handleSave}
              sx={{
                background: "linear-gradient(90deg, #7e57c2, #9c27b0)", // Gradient tím cho button save
                px: 3,
                fontWeight: 600,
              }}
            >
              {editId ? "Cập nhật" : "Tạo sự kiện"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
};

export default Events;

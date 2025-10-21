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
} from "../services/eventService";
import { getOrganizerById, getOrganizers } from "../services/organizerService";
import { getUniversities } from "../services/universityService";
import { useAuth } from "../contexts/AuthContext";

const Events = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const { user, role, organizerId } = useAuth();
  const [organizerInfo, setOrganizerInfo] = useState(null);
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
    eventData.createdByRole = role; // Gửi role khi tạo event

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

  return (
    <Box sx={{ p: 4, backgroundColor: "#f9fafc", minHeight: "100vh" }}>
      <Card
        sx={{
          mb: 3,
          borderRadius: 3,
          boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
          background: "linear-gradient(135deg, #1976d2, #42a5f5)",
          color: "white",
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
                Quản lý, theo dõi và điểm danh sinh viên tham gia các hoạt động.
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

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
          <CircularProgress />
        </Box>
      ) : (
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: "0 3px 10px rgba(0,0,0,0.05)",
          }}
        >
          <Table>
            <TableHead sx={{ backgroundColor: "#e3f2fd" }}>
              <TableRow>
                <TableCell>Tiêu đề</TableCell>
                <TableCell>Mô tả</TableCell>
                <TableCell>Đơn vị tổ chức</TableCell>
                <TableCell>Ngày bắt đầu</TableCell>
                <TableCell>Ngày kết thúc</TableCell>
                {role === "admin" && <TableCell>Phân quyền</TableCell>}
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
                data.map((e) => (
                  <TableRow
                    key={e.eventId || e.EventId}
                    hover
                    sx={{
                      transition: "all 0.2s",
                      "&:hover": {
                        backgroundColor: "#f1f8ff",
                      },
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
                          if (s > now) return "primary";
                          if (ed >= now) return "success";
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
                    {role === "admin" && (
                      <TableCell>
                        <Chip
                          label={
                            e.organizerId === organizerId ||
                            e.OrganizerId === organizerId
                              ? "Admin Override"
                              : "Organizer Event"
                          }
                          color={
                            e.organizerId === organizerId ||
                            e.OrganizerId === organizerId
                              ? "error"
                              : "info"
                          }
                          size="small"
                        />
                      </TableCell>
                    )}
                    <TableCell align="center">
                      <Box display="flex" justifyContent="center" gap={0.8}>
                        <Tooltip title="Quản lý phiên">
                          <IconButton
                            color="info"
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
                            color="secondary"
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
        </Card>
      )}

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
        <DialogTitle
          sx={{
            fontWeight: 600,
            bgcolor: "#1976d2",
            color: "white",
            py: 1.5,
            px: 3,
          }}
        >
          {editId ? "✏️ Chỉnh sửa sự kiện" : "🗓️ Thêm sự kiện mới"}
        </DialogTitle>

        <DialogContent sx={{ backgroundColor: "#fafafa", p: 3 }}>
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
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
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
                onChange={(e) => setForm({ ...form, EndDate: e.target.value })}
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
            bgcolor: "#f5f5f5",
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
              background: "linear-gradient(90deg, #1976d2, #42a5f5)",
              px: 3,
              fontWeight: 600,
            }}
          >
            {editId ? "Cập nhật" : "Tạo sự kiện"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Events;

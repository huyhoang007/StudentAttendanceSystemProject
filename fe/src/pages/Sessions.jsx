// src/pages/Sessions.jsx

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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Chip,
  Snackbar,
  Alert,
} from "@mui/material";
import { Add, Edit, Delete, ArrowBack, Visibility } from "@mui/icons-material";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  getSessions,
  addSession,
  updateSession,
  deleteSession,
} from "../services/eventSessionService";
import { getEvents } from "../services/eventService";
import { useAuth } from "../contexts/AuthContext";
import {
  formatDateTimeLocal,
  formatDateTimeDisplay,
  formatDateTimeForBackend,
} from "../utils/dateUtils";

const Sessions = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialEventId = searchParams.get("eventId");

  const [data, setData] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(initialEventId || "");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const { role, organizerId } = useAuth();
  const [error, setError] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [form, setForm] = useState({
    event_id: "",
    title: "",
    start_time: "",
    end_time: "",
    location: "",
    checkin_start_time: "",
    checkin_end_time: "",
  });

  const resetForm = () => {
    // Set default time to current time
    const now = new Date();
    const defaultStartTime = formatDateTimeLocal(now);
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
    const defaultEndTime = formatDateTimeLocal(oneHourLater);

    const newForm = {
      event_id: selectedEventId || "",
      title: "",
      start_time: defaultStartTime,
      end_time: defaultEndTime,
      location: "",
      checkin_start_time: "",
      checkin_end_time: "",
    };
    setForm(newForm);
    setEditId(null);
  };

  // Fetch events
  const fetchEvents = useCallback(async () => {
    try {
      let eventsData;
      if (role === "organizer" && organizerId) {
        const res = await fetch(`/api/event/by-organizer/${organizerId}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        eventsData = await res.json();
      } else {
        eventsData = await getEvents();
      }
      setEvents(eventsData);

      if (initialEventId) {
        const event = eventsData.find(
          (e) => (e.eventId || e.EventId) === initialEventId
        );
        setSelectedEvent(event);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      setEvents([]);
    }
  }, [role, organizerId, initialEventId]);

  // Fetch sessions
  const fetchData = useCallback(async () => {
    try {
      let sessions;
      if (selectedEventId) {
        // Fetch sessions by event ID
        const res = await fetch(
          `/api/EventSession/by-event/${selectedEventId}`
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        sessions = await res.json();
      } else {
        // Fetch all sessions
        sessions = await getSessions();
      }
      setData(Array.isArray(sessions) ? sessions : []);
      setError("");
    } catch (error) {
      console.error("Error fetching sessions:", error);
      setError("Không thể tải danh sách phiên: " + error.message);
      setData([]);
    }
  }, [selectedEventId]);

  useEffect(() => {
    fetchEvents();
  }, [role, organizerId, fetchEvents]);

  useEffect(() => {
    if (selectedEventId) {
      fetchData();
      const event = events.find((e) => e.EventId === selectedEventId);
      setSelectedEvent(event);
    }
  }, [selectedEventId, events, fetchData]);

  const handleOpen = (item = null) => {
    if (item) {
      setEditId(item.session_id || item.SessionId);
      setForm({
        event_id: item.event_id || item.EventId || selectedEventId,
        title: item.title || item.Title || "",
        start_time: formatDateTimeLocal(
          item.start_time || item.StartTime || ""
        ),
        end_time: formatDateTimeLocal(item.end_time || item.EndTime || ""),
        location: item.location || item.Location || "",
        checkin_start_time: formatDateTimeLocal(
          item.checkin_start_time || item.CheckinStartTime || ""
        ),
        checkin_end_time: formatDateTimeLocal(
          item.checkin_end_time || item.CheckinEndTime || ""
        ),
      });
    } else {
      resetForm();
    }
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  const handleSave = async () => {
    try {
      // Validate required fields
      const title = form.title?.trim();
      const startTime = form.start_time?.trim();
      const endTime = form.end_time?.trim();

      if (!title || !startTime || !endTime) {
        setSnackbar({
          open: true,
          message:
            "Vui lòng điền đầy đủ thông tin bắt buộc (Tiêu đề, Thời gian bắt đầu, Thời gian kết thúc)",
          severity: "error",
        });
        return;
      }

      // Additional validation: check if datetime format is valid
      if (startTime.length < 16 || endTime.length < 16) {
        setSnackbar({
          open: true,
          message: "Vui lòng chọn thời gian đầy đủ (ngày và giờ)",
          severity: "error",
        });
        return;
      }

      // Validate start time < end time (using string comparison for datetime-local format)
      if (startTime >= endTime) {
        setSnackbar({
          open: true,
          message: "Thời gian bắt đầu phải trước thời gian kết thúc",
          severity: "error",
        });
        return;
      }

      // Ensure event_id is set (from selectedEventId or form)
      const eventId = selectedEventId || form.event_id;

      if (!eventId || eventId === "00000000-0000-0000-0000-000000000000") {
        setSnackbar({
          open: true,
          message: "Vui lòng chọn sự kiện hợp lệ",
          severity: "error",
        });
        return;
      }

      // Prepare session data in correct format for backend (PascalCase)
      // Keep datetime as local Vietnam time without UTC conversion
      const sessionData = {
        EventId: eventId,
        Title: title,
        StartTime: formatDateTimeForBackend(startTime),
        EndTime: formatDateTimeForBackend(endTime),
        Location: form.location?.trim() || null,
        CheckinStartTime: formatDateTimeForBackend(
          form.checkin_start_time?.trim()
        ),
        CheckinEndTime: formatDateTimeForBackend(form.checkin_end_time?.trim()),
      };

      console.log("Debug session data:", sessionData);
      console.log("Selected Event ID:", selectedEventId);
      console.log("Available Events:", events);

      if (editId) {
        // Update existing session
        await updateSession(editId, sessionData);
        setSnackbar({
          open: true,
          message: "Cập nhật phiên thành công!",
          severity: "success",
        });
      } else {
        // Create new session
        await addSession(sessionData);
        setSnackbar({
          open: true,
          message: "Tạo phiên thành công!",
          severity: "success",
        });
      }

      setOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error saving session:", error);
      setSnackbar({
        open: true,
        message: `Lỗi ${editId ? "cập nhật" : "tạo"} phiên: ${error.message}`,
        severity: "error",
      });
    }
  };
  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa?")) {
      await deleteSession(id);
      fetchData();
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      {error && <Box sx={{ color: "red", mb: 2 }}>{error}</Box>}

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h5" fontWeight={600}>
          <span style={{ color: "#1976d2" }}>Quản lý Phiên sự kiện</span>
        </Typography>

        {initialEventId && (
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate("/events")}
          >
            Quay lại sự kiện
          </Button>
        )}
      </Box>

      {/* Event Selection (nếu không có eventId từ URL) */}
      {!initialEventId && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Chọn sự kiện</InputLabel>
            <Select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              label="Chọn sự kiện"
            >
              <MenuItem value="">-- Tất cả sự kiện --</MenuItem>
              {events.map((event) => (
                <MenuItem
                  key={event.eventId || event.EventId}
                  value={event.eventId || event.EventId}
                >
                  {event.title || event.Title} (
                  {new Date(
                    event.startDate || event.StartDate
                  ).toLocaleDateString()}
                  )
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Paper>
      )}

      {/* Event Info */}
      {selectedEvent && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: "#f5f5f5" }}>
          <Typography variant="h6" color="primary">
            📅 {selectedEvent.title || selectedEvent.Title}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            <strong>Tổ chức:</strong>{" "}
            {selectedEvent.organizer || selectedEvent.Organizer} |
            <strong> Từ:</strong>{" "}
            {new Date(
              selectedEvent.startDate || selectedEvent.StartDate
            ).toLocaleDateString()}
            <strong> đến:</strong>{" "}
            {new Date(
              selectedEvent.endDate || selectedEvent.EndDate
            ).toLocaleDateString()}
          </Typography>
        </Paper>
      )}

      <Button
        variant="contained"
        startIcon={<Add />}
        sx={{ mb: 2 }}
        onClick={() => handleOpen()}
        disabled={!selectedEventId}
      >
        Thêm phiên mới
      </Button>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Tiêu đề phiên</TableCell>
            <TableCell>Thời gian bắt đầu</TableCell>
            <TableCell>Thời gian kết thúc</TableCell>
            <TableCell>Địa điểm</TableCell>
            <TableCell>Check-in</TableCell>
            <TableCell align="right">Thao tác</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                <Typography color="textSecondary">
                  {selectedEventId
                    ? "Chưa có phiên nào cho sự kiện này"
                    : "Chọn sự kiện để xem các phiên"}
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            data.map((s) => (
              <TableRow key={s.sessionId || s.SessionId || s.session_id}>
                <TableCell>
                  <Typography variant="subtitle2">
                    {s.title || s.Title || "Chưa có tiêu đề"}
                  </Typography>
                </TableCell>
                <TableCell>
                  {formatDateTimeDisplay(
                    s.startTime || s.StartTime || s.start_time
                  )}
                </TableCell>
                <TableCell>
                  {formatDateTimeDisplay(s.endTime || s.EndTime || s.end_time)}
                </TableCell>
                <TableCell>{s.location || s.Location || "Chưa có"}</TableCell>
                <TableCell>
                  <Box>
                    <Chip
                      size="small"
                      label={
                        s.checkinStartTime ||
                        s.CheckinStartTime ||
                        s.checkin_start_time
                          ? "Có check-in"
                          : "Không check-in"
                      }
                      color={
                        s.checkinStartTime ||
                        s.CheckinStartTime ||
                        s.checkin_start_time
                          ? "success"
                          : "default"
                      }
                    />
                    {(s.checkinStartTime ||
                      s.CheckinStartTime ||
                      s.checkin_start_time) && (
                      <Typography
                        variant="caption"
                        display="block"
                        sx={{ mt: 0.5 }}
                      >
                        <strong>Bắt đầu:</strong>{" "}
                        {formatDateTimeDisplay(
                          s.checkinStartTime ||
                            s.CheckinStartTime ||
                            s.checkin_start_time
                        )}
                        <br />
                        {(s.checkinEndTime ||
                          s.CheckinEndTime ||
                          s.checkin_end_time) && (
                          <>
                            <strong>Kết thúc:</strong>{" "}
                            {formatDateTimeDisplay(
                              s.checkinEndTime ||
                                s.CheckinEndTime ||
                                s.checkin_end_time
                            )}
                          </>
                        )}
                      </Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    color="primary"
                    onClick={() =>
                      navigate(
                        `/event-sessions/${selectedEventId}?sessionId=${
                          s.sessionId || s.SessionId || s.session_id
                        }`
                      )
                    }
                    title="Xem chi tiết phiên"
                  >
                    <Visibility />
                  </IconButton>
                  <IconButton color="primary" onClick={() => handleOpen(s)}>
                    <Edit />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() =>
                      handleDelete(s.sessionId || s.SessionId || s.session_id)
                    }
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle
          sx={{
            fontWeight: 600,
            bgcolor: "#1976d2",
            color: "white",
            py: 1.5,
            px: 3,
          }}
        >
          {editId ? "✏️ Chỉnh sửa phiên sự kiện" : "🗓️ Thêm phiên sự kiện mới"}
        </DialogTitle>

        <DialogContent sx={{ backgroundColor: "#fafafa", p: 3 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              border: "1px solid #e0e0e0",
              bgcolor: "white",
            }}
          >
            {/* Chọn sự kiện */}
            {!selectedEventId && (
              <FormControl fullWidth margin="normal" size="small">
                <InputLabel>Chọn sự kiện</InputLabel>
                <Select
                  value={form.event_id}
                  onChange={(e) =>
                    setForm({ ...form, event_id: e.target.value })
                  }
                  label="Chọn sự kiện"
                >
                  {events.map((event) => (
                    <MenuItem
                      key={event.eventId || event.event_id}
                      value={event.eventId || event.event_id}
                    >
                      {event.title || event.Title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {/* Thông tin cơ bản */}
            <Typography
              variant="subtitle1"
              fontWeight={600}
              sx={{ mt: 2, mb: 1 }}
            >
              🧾 Thông tin cơ bản
            </Typography>
            <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
              <TextField
                label="Tiêu đề phiên"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                fullWidth
                size="small"
              />
              <TextField
                label="Địa điểm"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                fullWidth
                size="small"
              />
            </Box>

            {/* Thời gian sự kiện */}
            <Typography
              variant="subtitle1"
              fontWeight={600}
              sx={{ mt: 3, mb: 1 }}
            >
              ⏰ Thời gian diễn ra
            </Typography>
            <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
              <TextField
                label="Bắt đầu"
                type="datetime-local"
                value={form.start_time}
                onChange={(e) =>
                  setForm({ ...form, start_time: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  step: 60,
                  min: "2025-01-01T00:00",
                  max: "2030-12-31T23:59",
                }}
                helperText="Ngày & giờ bắt đầu"
                required
                fullWidth
                size="small"
              />
              <TextField
                label="Kết thúc"
                type="datetime-local"
                value={form.end_time}
                onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  step: 60,
                  min: "2025-01-01T00:00",
                  max: "2030-12-31T23:59",
                }}
                helperText="Ngày & giờ kết thúc"
                required
                fullWidth
                size="small"
              />
            </Box>

            {/* Check-in config */}
            <Typography
              variant="subtitle1"
              fontWeight={600}
              sx={{ mt: 3, mb: 1 }}
            >
              🕓 Thời gian Check-in
            </Typography>
            <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
              <TextField
                label="Bắt đầu check-in"
                type="datetime-local"
                value={form.checkin_start_time}
                onChange={(e) =>
                  setForm({ ...form, checkin_start_time: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
                inputProps={{ step: 60 }}
                helperText="Thời điểm mở check-in"
                fullWidth
                size="small"
              />
              <TextField
                label="Kết thúc check-in"
                type="datetime-local"
                value={form.checkin_end_time}
                onChange={(e) =>
                  setForm({ ...form, checkin_end_time: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
                inputProps={{ step: 60 }}
                helperText="Thời điểm đóng check-in"
                fullWidth
                size="small"
              />
            </Box>
          </Paper>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, bgcolor: "#f5f5f5" }}>
          <Button onClick={handleClose} color="inherit">
            Hủy
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            sx={{
              background: "linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)",
              px: 3,
            }}
          >
            {editId ? "Cập nhật" : "Tạo phiên"}
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
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Sessions;

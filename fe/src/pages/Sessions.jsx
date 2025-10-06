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

  // Function to format datetime for input field
  const formatDateTimeLocal = (dateStr) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return "";

      // Format to YYYY-MM-DDTHH:MM for datetime-local input
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");

      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch (error) {
      console.error("Error formatting date:", error);
      return "";
    }
  };

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
      const formatDateTime = (dateTimeLocal) => {
        if (!dateTimeLocal) return null;
        // Add seconds to match backend expectation: "2025-10-01T10:43" -> "2025-10-01T10:43:00"
        return dateTimeLocal.includes(":00")
          ? dateTimeLocal
          : dateTimeLocal + ":00";
      };

      const sessionData = {
        EventId: eventId,
        Title: title,
        StartTime: formatDateTime(startTime),
        EndTime: formatDateTime(endTime),
        Location: form.location?.trim() || null,
        CheckinStartTime: formatDateTime(form.checkin_start_time?.trim()),
        CheckinEndTime: formatDateTime(form.checkin_end_time?.trim()),
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
                  {s.startTime || s.StartTime || s.start_time
                    ? (() => {
                        const dateStr =
                          s.startTime || s.StartTime || s.start_time;

                        // Backend trả về thời gian local, chỉ cần format đơn giản
                        const date = new Date(dateStr);
                        return date.toLocaleString("vi-VN", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        });
                      })()
                    : "Chưa xác định"}
                </TableCell>
                <TableCell>
                  {s.endTime || s.EndTime || s.end_time
                    ? (() => {
                        const dateStr = s.endTime || s.EndTime || s.end_time;

                        // Backend trả về thời gian local, chỉ cần format đơn giản
                        const date = new Date(dateStr);
                        return date.toLocaleString("vi-VN", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        });
                      })()
                    : "Chưa xác định"}
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
                        {(() => {
                          const dateStr =
                            s.checkinStartTime ||
                            s.CheckinStartTime ||
                            s.checkin_start_time;

                          // Backend trả về thời gian local, chỉ cần format đơn giản
                          const date = new Date(dateStr);
                          return date.toLocaleString("vi-VN", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          });
                        })()}
                        <br />
                        {(s.checkinEndTime ||
                          s.CheckinEndTime ||
                          s.checkin_end_time) && (
                          <>
                            <strong>Kết thúc:</strong>{" "}
                            {(() => {
                              const dateStr =
                                s.checkinEndTime ||
                                s.CheckinEndTime ||
                                s.checkin_end_time;

                              // Backend trả về thời gian local, chỉ cần format đơn giản
                              const date = new Date(dateStr);
                              return date.toLocaleString("vi-VN", {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: false,
                              });
                            })()}
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
        <DialogTitle>{editId ? "Sửa phiên" : "Thêm phiên mới"}</DialogTitle>
        <DialogContent>
          {/* Event Selection (if needed) */}
          {!selectedEventId && (
            <FormControl fullWidth margin="normal">
              <InputLabel>Chọn sự kiện</InputLabel>
              <Select
                value={form.event_id}
                onChange={(e) => setForm({ ...form, event_id: e.target.value })}
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

          <TextField
            label="Tiêu đề phiên"
            fullWidth
            margin="normal"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />

          <TextField
            label="Thời gian bắt đầu"
            type="datetime-local"
            fullWidth
            margin="normal"
            value={form.start_time}
            onChange={(e) => setForm({ ...form, start_time: e.target.value })}
            InputLabelProps={{ shrink: true }}
            inputProps={{
              step: 60, // 60 seconds
              min: "2025-01-01T00:00",
              max: "2030-12-31T23:59",
            }}
            helperText="Chọn ngày và giờ từ lịch hoặc nhập thủ công: YYYY-MM-DDTHH:MM"
            required
          />

          <TextField
            label="Thời gian kết thúc"
            type="datetime-local"
            fullWidth
            margin="normal"
            value={form.end_time}
            onChange={(e) => setForm({ ...form, end_time: e.target.value })}
            InputLabelProps={{ shrink: true }}
            inputProps={{
              step: 60, // 60 seconds
              min: "2025-01-01T00:00",
              max: "2030-12-31T23:59",
            }}
            helperText="Chọn ngày và giờ từ lịch hoặc nhập thủ công: YYYY-MM-DDTHH:MM"
            required
          />

          <TextField
            label="Địa điểm"
            fullWidth
            margin="normal"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            placeholder="Ví dụ: Phòng A101, Tòa nhà B"
          />

          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
            Cấu hình Check-in (Tùy chọn)
          </Typography>

          <TextField
            label="Bắt đầu check-in"
            type="datetime-local"
            fullWidth
            margin="normal"
            value={form.checkin_start_time}
            onChange={(e) =>
              setForm({ ...form, checkin_start_time: e.target.value })
            }
            InputLabelProps={{ shrink: true }}
            inputProps={{
              step: 60, // 60 seconds
            }}
            helperText="Thời gian sinh viên có thể bắt đầu check-in"
          />

          <TextField
            label="Kết thúc check-in"
            type="datetime-local"
            fullWidth
            margin="normal"
            value={form.checkin_end_time}
            onChange={(e) =>
              setForm({ ...form, checkin_end_time: e.target.value })
            }
            InputLabelProps={{ shrink: true }}
            inputProps={{
              step: 60, // 60 seconds
            }}
            helperText="Thời gian kết thúc check-in"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Hủy</Button>
          <Button onClick={handleSave} variant="contained">
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

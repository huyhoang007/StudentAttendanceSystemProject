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
  Card,
  AlertTitle,
  Grid,
  Tooltip,
  TablePagination,
  alpha, // Import alpha for subtle color variations
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  ArrowBack,
  Visibility,
  Schedule,
  EventBusy,
} from "@mui/icons-material";
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

// Define a purple palette
const purple = {
  main: '#7B1FA2', // Deeper purple for primary actions/headers
  light: '#9C27B0',
  dark: '#4A148C',
  contrastText: '#fff',
};

const Sessions = () => {
  // =================================================================
  //
  //            TOÀN BỘ LOGIC CODE CỦA BẠN (GIỮ NGUYÊN 100%)
  //
  // =================================================================

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

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

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

  const fetchEvents = useCallback(async () => {
    try {
      let eventsData;
      if (role === "organizer" && organizerId) {
        const token = localStorage.getItem("authToken");
        const res = await fetch(`/api/event/by-organizer/${organizerId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
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

  const fetchData = useCallback(async () => {
    try {
      let sessions;
      if (selectedEventId) {
        const token = localStorage.getItem("authToken");
        const res = await fetch(
          `/api/EventSession/by-event/${selectedEventId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        sessions = await res.json();
      } else {
        sessions = await getSessions();
      }
      setData(Array.isArray(sessions) ? sessions : []);
      setPage(0);
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

      if (startTime.length < 16 || endTime.length < 16) {
        setSnackbar({
          open: true,
          message: "Vui lòng chọn thời gian đầy đủ (ngày và giờ)",
          severity: "error",
        });
        return;
      }

      if (startTime >= endTime) {
        setSnackbar({
          open: true,
          message: "Thời gian bắt đầu phải trước thời gian kết thúc",
          severity: "error",
        });
        return;
      }

      const eventId = selectedEventId || form.event_id;

      if (!eventId || eventId === "00000000-0000-0000-0000-000000000000") {
        setSnackbar({
          open: true,
          message: "Vui lòng chọn sự kiện hợp lệ",
          severity: "error",
        });
        return;
      }

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
        await updateSession(editId, sessionData);
        setSnackbar({
          open: true,
          message: "Cập nhật phiên thành công!",
          severity: "success",
        });
      } else {
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

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // =================================================================
  //
  //            BẮT ĐẦU PHẦN GIAO DIỆN (JSX) ĐÃ UPDATE
  //
  // =================================================================

  return (
    <Box sx={{ p: 4, backgroundColor: '#f0f2f5', minHeight: "100vh" }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* HEADER WITH PURPLE THEME */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
          p: 3,
          borderRadius: 3,
          backgroundColor: 'white',
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          borderLeft: `8px solid ${purple.main}`, // Accent border
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Schedule sx={{ fontSize: 48, color: purple.main }} />
          <Box>
            <Typography variant="h4" fontWeight={700} color="text.primary">
              Quản lý Phiên sự kiện
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Xem, thêm, sửa và xóa các phiên sự kiện
            </Typography>
          </Box>
        </Box>

        <Box display="flex" gap={2}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpen()}
            disabled={!selectedEventId}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              px: 3,
              py: 1,
              fontWeight: 600,
              backgroundColor: purple.main,
              '&:hover': {
                backgroundColor: purple.dark,
              },
              boxShadow: '0 4px 15px rgba(123, 31, 162, 0.3)', // Purple shadow
            }}
          >
            Thêm phiên mới
          </Button>
          {initialEventId && (
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={() => navigate("/events")}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                color: purple.main,
                borderColor: alpha(purple.main, 0.5),
                '&:hover': {
                  borderColor: purple.main,
                  backgroundColor: alpha(purple.main, 0.05),
                }
              }}
            >
              Quay lại sự kiện
            </Button>
          )}
        </Box>
      </Box>

      {/* EVENT SELECTION CARD */}
      {!initialEventId && (
        <Card
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 3,
            boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
            border: `1px solid ${alpha(purple.main, 0.2)}`,
          }}
        >
          <FormControl fullWidth>
            <InputLabel>Chọn sự kiện</InputLabel>
            <Select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              label="Chọn sự kiện"
              sx={{
                '.MuiOutlinedInput-notchedOutline': {
                  borderColor: alpha(purple.main, 0.4),
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: purple.main,
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: purple.main,
                  borderWidth: '2px',
                },
              }}
            >
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
        </Card>
      )}

      {/* SELECTED EVENT INFO ALERT */}
      {selectedEvent && (
        <Alert
          severity="info"
          icon={<EventBusy sx={{ color: purple.light }} />} // Use a relevant icon or adjust color
          sx={{
            mb: 3,
            borderRadius: 2,
            backgroundColor: alpha(purple.light, 0.1),
            color: purple.dark,
            borderColor: alpha(purple.light, 0.3),
          }}
        >
          <AlertTitle sx={{ fontWeight: 600, color: purple.dark }}>
            📅 {selectedEvent.title || selectedEvent.Title}
          </AlertTitle>
          <Typography variant="body2" color={purple.dark}>
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
        </Alert>
      )}

      {/* TABLE WRAPPED IN CARD */}
      <Card
        sx={{
          borderRadius: 4,
          boxShadow: "0 8px 30px rgba(0,0,0,0.1)",
          overflow: "hidden",
        }}
      >
        <Table>
          <TableHead sx={{ backgroundColor: alpha(purple.main, 0.1) }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, color: purple.dark, fontSize: '0.9rem' }}>
                Tiêu đề phiên
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: purple.dark, fontSize: '0.9rem' }}>
                Thời gian bắt đầu
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: purple.dark, fontSize: '0.9rem' }}>
                Thời gian kết thúc
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: purple.dark, fontSize: '0.9rem' }}>
                Địa điểm
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: purple.dark, fontSize: '0.9rem' }}>
                Check-in
              </TableCell>
              <TableCell
                align="right"
                sx={{ fontWeight: 700, color: purple.dark, fontSize: '0.9rem' }}
              >
                Thao tác
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    gap={1}
                    color="text.secondary"
                  >
                    <EventBusy sx={{ fontSize: 56, color: alpha(purple.main, 0.4) }} />
                    <Typography variant="h6" color="text.secondary" fontWeight={500}>
                      {selectedEventId
                        ? "Chưa có phiên nào cho sự kiện này"
                        : "Chọn sự kiện để xem các phiên"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Nhấn "Thêm phiên mới" để bắt đầu!
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              (rowsPerPage > 0
                ? data.slice(
                    page * rowsPerPage,
                    page * rowsPerPage + rowsPerPage
                  )
                : data
              ).map((s) => (
                <TableRow
                  key={s.sessionId || s.SessionId || s.session_id}
                  hover
                  sx={{
                    "&:hover": { backgroundColor: alpha(purple.light, 0.05) },
                  }}
                >
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight={600} color="text.primary">
                      {s.title || s.Title || "Chưa có tiêu đề"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {formatDateTimeDisplay(
                      s.startTime || s.StartTime || s.start_time
                    )}
                  </TableCell>
                  <TableCell>
                    {formatDateTimeDisplay(
                      s.endTime || s.EndTime || s.end_time
                    )}
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
                        sx={{
                            backgroundColor: s.checkinStartTime || s.CheckinStartTime || s.checkin_start_time ? '#4CAF50' : '#E0E0E0',
                            color: s.checkinStartTime || s.CheckinStartTime || s.checkin_start_time ? 'white' : 'text.primary',
                            fontWeight: 600,
                        }}
                      />
                      {(s.checkinStartTime ||
                        s.CheckinStartTime ||
                        s.checkin_start_time) && (
                        <Typography
                          variant="caption"
                          display="block"
                          sx={{ mt: 0.5, color: 'text.secondary' }}
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
                    <Tooltip title="Xem chi tiết phiên">
                      <IconButton
                        sx={{ color: purple.light }}
                        onClick={() =>
                          navigate(
                            `/event-sessions/${selectedEventId}?sessionId=${
                              s.sessionId || s.SessionId || s.session_id
                            }`
                          )
                        }
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa phiên">
                      <IconButton sx={{ color: purple.main }} onClick={() => handleOpen(s)}>
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Xóa phiên">
                      <IconButton
                        color="error"
                        onClick={() =>
                          handleDelete(s.sessionId || s.SessionId || s.session_id)
                        }
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
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
          sx={{
            '.MuiTablePagination-toolbar': {
              backgroundColor: alpha(purple.main, 0.05),
              borderTop: `1px solid ${alpha(purple.main, 0.1)}`,
            },
            '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
              color: purple.dark,
            },
            '.MuiTablePagination-select': {
              color: purple.main,
            },
            '.MuiIconButton-root': {
              color: purple.main,
            }
          }}
        />
      </Card>

      {/* DIALOG FORM */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle
          sx={{
            fontWeight: 700,
            bgcolor: purple.main,
            color: purple.contrastText,
            py: 2,
            px: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          {editId ? (
            <>
              <Edit /> Chỉnh sửa phiên sự kiện
            </>
          ) : (
            <>
              <Add /> Thêm phiên sự kiện mới
            </>
          )}
        </DialogTitle>

        <DialogContent sx={{ backgroundColor: '#f9f9f9', p: 3 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              border: `1px solid ${alpha(purple.main, 0.2)}`,
              bgcolor: 'white',
              boxShadow: '0 2px 10px rgba(0,0,0,0.04)'
            }}
          >
            {!selectedEventId && (
              <FormControl fullWidth margin="normal" size="small">
                <InputLabel>Chọn sự kiện</InputLabel>
                <Select
                  value={form.event_id}
                  onChange={(e) =>
                    setForm({ ...form, event_id: e.target.value })
                  }
                  label="Chọn sự kiện"
                  sx={{
                    '.MuiOutlinedInput-notchedOutline': {
                      borderColor: alpha(purple.main, 0.4),
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: purple.main,
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: purple.main,
                      borderWidth: '2px',
                    },
                  }}
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

            <Typography
              variant="subtitle1"
              fontWeight={600}
              sx={{ mt: 2, mb: 1, color: purple.dark }}
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
                InputLabelProps={{ shrink: true }}
                sx={{
                  '.MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: purple.main,
                    },
                  },
                  '.MuiInputLabel-root.Mui-focused': {
                    color: purple.main,
                  },
                }}
              />
              <TextField
                label="Địa điểm"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
                sx={{
                  '.MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: purple.main,
                    },
                  },
                  '.MuiInputLabel-root.Mui-focused': {
                    color: purple.main,
                  },
                }}
              />
            </Box>

            <Typography
              variant="subtitle1"
              fontWeight={600}
              sx={{ mt: 3, mb: 1, color: purple.dark }}
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
                sx={{
                  '.MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: purple.main,
                    },
                  },
                  '.MuiInputLabel-root.Mui-focused': {
                    color: purple.main,
                  },
                }}
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
                sx={{
                  '.MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: purple.main,
                    },
                  },
                  '.MuiInputLabel-root.Mui-focused': {
                    color: purple.main,
                  },
                }}
              />
            </Box>

            <Typography
              variant="subtitle1"
              fontWeight={600}
              sx={{ mt: 3, mb: 1, color: purple.dark }}
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
                sx={{
                  '.MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: purple.main,
                    },
                  },
                  '.MuiInputLabel-root.Mui-focused': {
                    color: purple.main,
                  },
                }}
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
                sx={{
                  '.MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: purple.main,
                    },
                  },
                  '.MuiInputLabel-root.Mui-focused': {
                    color: purple.main,
                  },
                }}
              />
            </Box>
          </Paper>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, bgcolor: '#f0f0f0' }}>
          <Button
            onClick={handleClose}
            sx={{
              color: 'text.secondary',
              '&:hover': {
                backgroundColor: alpha(purple.main, 0.05),
              }
            }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            sx={{
              background: `linear-gradient(90deg, ${purple.main} 0%, ${purple.light} 100%)`,
              px: 3,
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(123, 31, 162, 0.2)',
              '&:hover': {
                background: purple.dark,
                boxShadow: '0 6px 16px rgba(123, 31, 162, 0.3)',
              }
            }}
          >
            {editId ? "Cập nhật" : "Tạo phiên"}
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
          variant="filled"
          sx={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Sessions;
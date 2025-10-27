// src/pages/EventsStudent.jsx (Phiên bản UI nâng cấp + Phân trang)

import React, { useEffect, useState, useCallback } from "react";
import {
  Typography,
  Box,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Chip,
  TableContainer,
  Paper,
  Tooltip,
  TablePagination, // <-- THÊM IMPORT NÀY
} from "@mui/material";
import {
<<<<<<< HEAD
  Event,
  AssignmentTurnedIn,
  CalendarToday,
  LocationOn,
  HowToReg,
=======
  Event, // Icon cho tiêu đề
  AssignmentTurnedIn, // Icon cho đã đăng ký
  CalendarToday, // Icon cho ngày tháng
  LocationOn, // Icon cho địa điểm
  HowToReg, // Icon cho nút đăng ký
  CircleOutlined
>>>>>>> 985b621f5d4ab8ccf7d7e52cc95f9deb4c959c60
} from "@mui/icons-material";

// Import các service (GIỮ NGUYÊN)
import { getEvents, getEventsByUniversity } from "../services/eventService";
import { getEventSessions } from "../services/eventSessionService";
import {
  registerStudentForEvent,
  checkStudentRegistration,
} from "../services/studentInEventService";
import { getStudentByUserId } from "../services/studentService";
import { useAuth } from "../contexts/AuthContext";

// --- Helper Functions cho UI (GIỮ NGUYÊN) ---

const formatDate = (dateString, includeTime = false) => {
  if (!dateString) return "---";
  try {
    const options = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: includeTime ? "2-digit" : undefined,
      minute: includeTime ? "2-digit" : undefined,
    };
    return new Date(dateString).toLocaleDateString("vi-VN", options);
  } catch (e) {
    return dateString;
  }
};

const EventsStudent = () => {
  const [events, setEvents] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [openSession, setOpenSession] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [registeredEvents, setRegisteredEvents] = useState(new Set());
  const [currentStudentCode, setCurrentStudentCode] = useState(null);

  // --- THÊM STATE CHO PHÂN TRANG ---
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5); // <-- Đặt mặc định là 5 theo yêu cầu

  const { user } = useAuth();

  // --- LOGIC FUNCTIONS (GIỮ NGUYÊN) ---

  const loadEvents = useCallback(async () => {
    // ... (Toàn bộ logic loadEvents của bạn được giữ nguyên)
    try {
      let eventsData = [];
      let studentCode = user?.studentCode || user?.username;
      let universityId = null;

      console.log("[EventsStudent] Loading events for user:", user);

      if (user?.userId || user?.UserId || user?.id || user?.Id) {
        try {
          const userId = user.userId || user.UserId || user.id || user.Id;
          console.log(
            "[EventsStudent] Fetching student data for userId:",
            userId
          );
          const studentData = await getStudentByUserId(userId);
          console.log("[EventsStudent] Student data received:", studentData);

          studentCode =
            studentData.studentCode ||
            studentData.StudentCode ||
            studentData.student_code ||
            studentCode;
          universityId =
            studentData.universityId ||
            studentData.UniversityId ||
            studentData.university_id;
          console.log("[EventsStudent] Extracted data:", {
            studentCode,
            universityId,
          });

          setCurrentStudentCode(studentCode);
        } catch (e) {
          console.warn("[EventsStudent] Error fetching student data:", e);
        }
      }

      if (universityId) {
        console.log(
          "[EventsStudent] Loading events for university:",
          universityId
        );
        eventsData = await getEventsByUniversity(universityId);
        console.log(
          `[EventsStudent] Loaded ${eventsData.length} events for university ${universityId}`
        );
      } else {
        console.warn(
          "[EventsStudent] No universityId found - student may not be assigned to any university"
        );
        console.log("[EventsStudent] Loading all events as fallback");
        eventsData = await getEvents();
        console.log(
          `[EventsStudent] Loaded ${eventsData.length} events (no university filter)`
        );
      }

      setEvents(eventsData);
      setPage(0); // <-- Reset về trang đầu tiên khi tải lại dữ liệu

      if (studentCode && eventsData.length > 0) {
        const registeredEventIds = new Set();

        const checkPromises = eventsData.map(async (event) => {
          try {
            const eventId = event.eventId || event.EventId;
            if (eventId) {
              const isRegistered = await checkStudentRegistration(
                eventId,
                studentCode,
                localStorage.getItem("token")
              );
              if (isRegistered) {
                registeredEventIds.add(eventId);
              }
            }
          } catch (err) {
            console.warn(
              `Could not check registration for event ${
                event.eventId || event.EventId
              }:`,
              err
            );
          }
        });

        await Promise.all(checkPromises);
        setRegisteredEvents(registeredEventIds);
      }
    } catch (err) {
      setError("Lỗi khi tải danh sách sự kiện: " + err.message);
    }
  }, [user]);

  useEffect(() => {
    loadEvents();
  }, [user, loadEvents]);

  const handleRegisterEvent = (event) => {
    // ... (Giữ nguyên)
    setSelectedEvent(event);
    setError("");
    setSuccess("");
    setOpen(true);
  };

  const handleConfirmEvent = async () => {
    // ... (Toàn bộ logic handleConfirmEvent của bạn được giữ nguyên)
    let studentCode = currentStudentCode || user?.studentCode || user?.username;

    console.log(
      "[EventsStudent] Registration attempt with studentCode:",
      studentCode
    );

    if (!studentCode) {
      setError("Không tìm thấy mã sinh viên. Vui lòng đăng nhập lại.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const eventId = selectedEvent.eventId || selectedEvent.EventId;
      const token = localStorage.getItem("authToken");

      if (!eventId) {
        throw new Error("Không tìm thấy ID sự kiện");
      }

      console.log(
        "Debug - Registering event:",
        eventId,
        "for student:",
        studentCode
      );

      const result = await registerStudentForEvent(eventId, studentCode, token);
      console.log("Registration result:", result);

      setRegisteredEvents((prev) => new Set([...prev, eventId]));

      setSuccess(
        `Đăng ký sự kiện "${
          selectedEvent.title || selectedEvent.Title
        }" thành công!`
      );
      setOpen(false);

      try {
        const sessionsData = await getEventSessions(eventId);
        if (sessionsData && sessionsData.length > 0) {
          setSessions(sessionsData);
          setOpenSession(true);
        } else {
          setSuccess(`Đăng ký sự kiện "${
            selectedEvent.title || selectedEvent.Title
          }" thành công! 
            Sự kiện này chưa có phiên. Hệ thống sẽ sớm cập nhật phiên cho bạn.`);
        }
      } catch (sessionError) {
        console.warn("Could not load sessions:", sessionError);
        setSuccess(`Đăng ký sự kiện "${
          selectedEvent.title || selectedEvent.Title
        }" thành công! 
          Bạn có thể xem các phiên trong mục "Sự kiện đã đăng ký".`);
      }
    } catch (err) {
      console.error("Registration error:", err);

      if (err.message && err.message.includes("already registered")) {
        const eventId = selectedEvent.eventId || selectedEvent.EventId;
        if (eventId) {
          setRegisteredEvents((prev) => new Set([...prev, eventId]));
        }
        setSuccess(
          `Bạn đã đăng ký sự kiện "${
            selectedEvent.title || selectedEvent.Title
          }" rồi!`
        );
        setOpen(false);
      } else {
        setError("Lỗi khi đăng ký sự kiện: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // --- THÊM CÁC HÀM HANDLER CHO PHÂN TRANG ---
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Quay về trang đầu tiên khi thay đổi số hàng mỗi trang
  };

  // --- RENDERING UI (CẬP NHẬT PHÂN TRANG) ---

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* HEADER */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          background: "linear-gradient(145deg, #ffffff, #f5f8fb)",
          p: 3,
          borderRadius: 3,
          mb: 3,
          boxShadow: "0 2px 4px -1px rgba(0,0,0,0.2), 0 4px 5px 0 rgba(0,0,0,0.14), 0 1px 10px 0 rgba(0,0,0,0.12)",
          border: "1px solid rgba(25, 118, 210, 0.12)",
          position: "relative"
        }}
      >
        <Event 
          sx={{ 
            fontSize: 40,
            color: "#1976d2",
            mr: 2
          }} 
        />
        <Typography 
          variant="h4" 
          sx={{
            fontWeight: 800,
            color: "#1976d2",
            letterSpacing: "0.5px"
          }}
        >
          Danh sách tất cả sự kiện
        </Typography>
      </Box>
      {/* --- Alert Messages --- */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>
          {success}
        </Alert>
      )}

      {/* --- Main Table --- */}
      <TableContainer component={Paper} elevation={4} sx={{ borderRadius: 2 }}>
        <Table size="small">
          <TableHead sx={{ bgcolor: "#f5f5f5" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Tiêu đề</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Mô tả</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Đơn vị tổ chức</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>
                Ngày bắt đầu
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>
                Ngày kết thúc
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>
                Trạng thái
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>
                Thao tác
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {events.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  <Typography variant="subtitle1" color="textSecondary">
                    Không tìm thấy sự kiện nào phù hợp.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              // --- CẬP NHẬT LOGIC RENDER VỚI SLICE ---
              (rowsPerPage > 0
                ? events.slice(
                    page * rowsPerPage,
                    page * rowsPerPage + rowsPerPage
                  )
                : events
              ).map((e) => {
                const eventId = e.eventId || e.EventId;
                const isRegistered = registeredEvents.has(eventId);

                return (
                  <TableRow
                    key={eventId}
                    hover
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell>
                      <Typography variant="body1" fontWeight={600} >
                        {e.title || e.Title}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Tooltip
                        title={
                          e.description || e.Description || "Không có mô tả"
                        }
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitLineClamp: "2",
                            WebkitBoxOrient: "vertical",
                            maxWidth: "200px",
                          }}
                        >
                          {e.description || e.Description || "Không có mô tả"}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {e.organizer || e.Organizer || "Chưa xác định"}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          bgcolor: '#e3f2fd',
                          px: 1.5,
                          py: 0.75,
                          borderRadius: 2,
                          border: '1px solid #90caf9'
                        }}
                      >
                        <CalendarToday 
                          sx={{ 
                            fontSize: '0.875rem',
                            color: '#1976d2',
                            mr: 1
                          }}
                        />
                        <Typography
                          sx={{
                            fontSize: '0.875rem',
                            color: '#1976d2',
                            fontWeight: 500
                          }}
                        >
                          {formatDate(e.startDate || e.StartDate)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Box
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          bgcolor: '#fff3e0', 
                          px: 1.5,
                          py: 0.75,
                          borderRadius: 2,
                          border: '1px solid #ffb74d'
                        }}
                      >
                        <CalendarToday 
                          sx={{ 
                            fontSize: '0.875rem',
                            color: '#ed6c02',
                            mr: 1
                          }}
                        />
                        <Typography
                          sx={{
                            fontSize: '0.875rem',
                            color: '#ed6c02',
                            fontWeight: 500
                          }}
                        >
                          {formatDate(e.endDate || e.EndDate)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      {isRegistered ? (
                        <Box
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 0.5,
                            bgcolor: '#e8f5e9',
                            color: '#2e7d32',
                            py: 0.75,
                            px: 1.5,
                            borderRadius: 2,
                            border: '1px solid #a5d6a7',
                          }}
                        >
                          <AssignmentTurnedIn sx={{ fontSize: '1rem' }} />
                          <Typography
                            sx={{
                              fontSize: '0.875rem',
                              fontWeight: 600,
                            }}
                          >
                            Đã đăng ký
                          </Typography>
                        </Box>
                      ) : (
                        <Box
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 0.5,
                            bgcolor: '#f5f5f5',
                            color: '#757575',
                            py: 0.75,
                            px: 1.5,
                            borderRadius: 2,
                            border: '1px solid #e0e0e0',
                          }}
                        >
                          <CircleOutlined sx={{ fontSize: '0.875rem' }} />
                          <Typography
                            sx={{
                              fontSize: '0.875rem',
                              fontWeight: 500,
                            }}
                          >
                            Chưa đăng ký
                          </Typography>
                        </Box>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      {isRegistered ? (
                        <Button
                          variant="text"
                          color="success"
                          disabled
                          startIcon={<AssignmentTurnedIn />}
                          size="small"
                          sx={{ fontWeight: 600 }}
                        >
                          Đã đăng ký
                        </Button>
                      ) : (
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => handleRegisterEvent(e)}
                          startIcon={<HowToReg />}
                          size="small"
                        >
                          Đăng ký
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* --- THÊM COMPONENT PHÂN TRANG --- */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]} // Các tùy chọn số hàng mỗi trang
          component="div"
          count={events.length} // Tổng số sự kiện
          rowsPerPage={rowsPerPage} // Số hàng mỗi trang hiện tại
          page={page} // Trang hiện tại
          onPageChange={handleChangePage} // Hàm khi đổi trang
          onRowsPerPageChange={handleChangeRowsPerPage} // Hàm khi đổi số hàng mỗi trang
          // Thêm label tiếng Việt cho thân thiện
          labelRowsPerPage="Số sự kiện mỗi trang:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}–${to} trong số ${count}`
          }
        />
      </TableContainer>

      {/* Registration Confirmation Dialog (GIỮ NGUYÊN) */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: "primary.main", color: "white" }}>
          <Box display="flex" alignItems="center">
            <HowToReg sx={{ mr: 1 }} /> Xác nhận Đăng ký Sự kiện
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          <Typography variant="h6" mb={2}>
            Bạn có chắc muốn đăng ký sự kiện này không?
          </Typography>
          <Box sx={{ p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
            <Typography variant="body1">
              Sự kiện:{selectedEvent?.title || selectedEvent?.Title}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Tổ chức: {selectedEvent?.organizer || selectedEvent?.Organizer}
            </Typography>
          </Box>
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setOpen(false)}
            disabled={loading}
            color="error"
            variant="outlined"
          >
            Hủy
          </Button>
          <Button
            onClick={handleConfirmEvent}
            variant="contained"
            disabled={loading}
            color="primary"
            startIcon={
              loading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <HowToReg />
              )
            }
          >
            {loading ? "Đang xử lý..." : "Xác nhận Đăng ký"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Sessions Dialog (GIỮ NGUYÊN) */}
      <Dialog
        open={openSession}
        onClose={() => setOpenSession(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: "success.main", color: "white" }}>
          <Box display="flex" alignItems="center">
            <AssignmentTurnedIn sx={{ mr: 1 }} /> Đăng ký thành công & Phiên sự
            kiện
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="h6" mb={1} color="success.main">
            🎉 Đã đăng ký thành công sự kiện "
            {selectedEvent?.title || selectedEvent?.Title}"!
          </Typography>
          <Typography mb={2} variant="body2" color="textSecondary">
            Dưới đây là danh sách các phiên trong sự kiện:
          </Typography>
          {sessions.length === 0 ? (
            <Box
              sx={{
                textAlign: "center",
                py: 3,
                border: "1px dashed grey",
                borderRadius: 1,
              }}
            >
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Chưa có phiên nào cho sự kiện này
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Bạn đã đăng ký thành công!.Sự kiện này chưa được tạo phiên. Hệ
                thống sẽ sớm cập nhật phiên cho bạn.
              </Typography>
            </Box>
          ) : (
            <Table size="small">
              <TableHead sx={{ bgcolor: "info.light" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Tên phiên</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">
                    Thời gian bắt đầu
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">
                    Thời gian kết thúc
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Địa điểm</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sessions.map((s) => (
                  <TableRow key={s.sessionId || s.SessionId}>
                    <TableCell>
                      <Typography variant="body1" fontWeight={500}>
                        {s.sessionName ||
                          s.SessionName ||
                          `Phiên ${s.sessionId || s.SessionId}`}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      {formatDate(s.startTime || s.StartTime, true)}
                    </TableCell>
                    <TableCell align="center">
                      {formatDate(s.endTime || s.EndTime, true)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={<LocationOn />}
                        label={s.location || s.Location || "Chưa xác định"}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setOpenSession(false)}
            variant="contained"
            color="success"
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EventsStudent;

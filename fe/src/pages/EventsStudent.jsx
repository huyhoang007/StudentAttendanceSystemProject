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
  TablePagination,
  Card,
  CardContent,
  Container,
  Stack,
  Avatar,
  IconButton,
} from "@mui/material";
import {
  Event,
  AssignmentTurnedIn,
  CalendarToday,
  LocationOn,
  HowToReg,
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
        console.log("Received sessions data:", sessionsData); // Thêm log để kiểm tra
        
        if (sessionsData && sessionsData.length > 0) {
          // Format lại tên phiên nếu không có tên: ưu tiên Title (backend DTO), rồi các trường phổ biến khác
          const formattedSessions = sessionsData.map((session, index) => ({
            ...session,
            displayName:
              session.Title ||
              session.title ||
              session.sessionName ||
              session.SessionName ||
              session.name ||
              session.Name ||
              `Phiên ${index + 1}`,
          }));

          setSessions(formattedSessions);
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
    <Box sx={{ backgroundColor: "#F9FAFB", minHeight: "100vh", py: 3 }}>
      <Container maxWidth="lg">
        {/* Header - Card gradient */}
        <Card
          sx={{
            mb: 4,
            borderRadius: "24px",
            background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #c084fc 100%)",
            boxShadow: "0 8px 24px rgba(134, 76, 232, 0.3)",
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Stack direction="row" alignItems="center" spacing={3}>
              <Avatar
                sx={{
                  width: 72,
                  height: 72,
                  bgcolor: "rgba(255,255,255,0.2)",
                }}
              >
                <Event sx={{ fontSize: 40, color: "#fff" }} />
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="h4"
                  fontWeight={700}
                  color="#fff"
                  sx={{ mb: 0.5 }}
                >
                  Danh sách tất cả sự kiện
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ color: "rgba(255,255,255,0.9)" }}
                >
                  Đăng ký và tham gia các sự kiện học thuật, ngoại khóa, phát triển bản thân.
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

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
        <Card
          sx={{
            borderRadius: "16px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
          }}
        >
          <CardContent sx={{ p: 0 }}>
            <Table>
              <TableHead sx={{ bgcolor: "#f9fafb" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: "#374151" }}>Tiêu đề</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#374151" }}>Mô tả</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#374151" }}>Đơn vị tổ chức</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: "#374151" }}>
                    Ngày bắt đầu
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: "#374151" }}>
                    Ngày kết thúc
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: "#374151" }}>
                    Trạng thái
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: "#374151" }}>
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
                    sx={{ "&:hover": { bgcolor: "#f9fafb" } }}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {e.title || e.Title}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: "200px" }}>
                        {e.description || e.Description || "Không có mô tả"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {e.organizer || e.Organizer || "Chưa xác định"}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(e.startDate || e.StartDate)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(e.endDate || e.EndDate)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      {isRegistered ? (
                        <Chip
                          label="Đã đăng ký"
                          color="success"
                          size="small"
                          icon={<AssignmentTurnedIn />}
                          sx={{
                            bgcolor: "#d1fae5",
                            color: "#059669",
                            fontWeight: 600,
                            borderRadius: "8px",
                          }}
                        />
                      ) : (
                        <Chip
                          label="Chưa đăng ký"
                          color="default"
                          size="small"
                          variant="outlined"
                          sx={{
                            bgcolor: "#f3f4f6",
                            color: "#6b7280",
                            fontWeight: 600,
                            borderRadius: "8px",
                            border: "1px solid #e5e7eb",
                          }}
                        />
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={0.5} justifyContent="center">
                        {!isRegistered && (
                          <IconButton
                            size="small"
                            onClick={() => handleRegisterEvent(e)}
                            sx={{
                              color: "#864ce8ff",
                              "&:hover": { bgcolor: "#f3e8ff" },
                            }}
                            title="Đăng ký sự kiện"
                          >
                            <HowToReg fontSize="small" />
                          </IconButton>
                        )}
                        {isRegistered && (
                          <IconButton
                            size="small"
                            disabled
                            sx={{
                              color: "#10b981",
                              "&:hover": { bgcolor: "#f0fdf4" },
                            }}
                            title="Đã đăng ký"
                          >
                            <AssignmentTurnedIn fontSize="small" />
                          </IconButton>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* --- THÊM COMPONENT PHÂN TRANG --- */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, { label: "Tất cả", value: -1 }]}
          component="div"
          count={events.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Số sự kiện mỗi trang:"
          sx={{
            borderTop: "1px solid #e5e7eb",
            ".MuiTablePagination-actions button": {
              color: "#7c3aed",
            },
          }}
        />
          </CardContent>
        </Card>

        {/* Registration Confirmation Dialog */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "16px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          },
        }}
      >
        <DialogTitle
          sx={{
            background: "linear-gradient(135deg, #864ce8ff 0%, #9333ea 100%)",
            color: "#fff",
            fontWeight: 700,
          }}
        >
          <Box display="flex" alignItems="center">
            <HowToReg sx={{ mr: 1 }} /> Xác nhận Đăng ký Sự kiện
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          <Typography variant="h6" mb={2}>
            Bạn có chắc muốn đăng ký sự kiện này không?
          </Typography>
          <Box sx={{ p: 2, bgcolor: "#f3e8ff", borderRadius: 1, border: "1px solid #e9d5ff" }}>
            <Typography variant="body1" fontWeight={600}>
              Sự kiện: {selectedEvent?.title || selectedEvent?.Title}
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
            color="inherit"
            variant="text"
            sx={{ color: "#6b7280" }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleConfirmEvent}
            variant="contained"
            disabled={loading}
            startIcon={
              loading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <HowToReg />
              )
            }
            sx={{
              background: "linear-gradient(135deg, #864ce8ff 0%, #9333ea 100%)",
              color: "#fff",
              borderRadius: "10px",
              textTransform: "none",
              fontWeight: 600,
              "&:hover": {
                background: "linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)",
              },
            }}
          >
            {loading ? "Đang xử lý..." : "Xác nhận Đăng ký"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Sessions Dialog */}
      <Dialog
        open={openSession}
        onClose={() => setOpenSession(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "16px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          },
        }}
      >
        <DialogTitle
          sx={{
            background: "linear-gradient(135deg, #864ce8ff 0%, #9333ea 100%)",
            color: "#fff",
            fontWeight: 700,
          }}
        >
          <Box display="flex" alignItems="center">
            <AssignmentTurnedIn sx={{ mr: 1 }} /> Đăng ký thành công & Phiên sự
            kiện
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="h6" mb={1} sx={{ color: "#864ce8ff", fontWeight: 600 }}>
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
                border: "1px dashed #ddd",
                borderRadius: "12px",
                bgcolor: "#f9fafb",
              }}
            >
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Chưa có phiên nào cho sự kiện này
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Bạn đã đăng ký thành công! Sự kiện này chưa được tạo phiên. Hệ
                thống sẽ sớm cập nhật phiên cho bạn.
              </Typography>
            </Box>
          ) : (
            <Table size="small">
              <TableHead sx={{ bgcolor: "#f3e8ff" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: "#374151" }}>Tên phiên</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#374151" }} align="center">
                    Thời gian bắt đầu
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#374151" }} align="center">
                    Thời gian kết thúc
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#374151" }}>Địa điểm</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sessions.map((s, index) => (
                  <TableRow key={s.sessionId || s.SessionId} sx={{ "&:hover": { bgcolor: "#f9fafb" } }}>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {s.displayName || `Phiên ${index + 1}`}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(s.startTime || s.StartTime, true)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(s.endTime || s.EndTime, true)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {s.location || s.Location || "Chưa xác định"}
                      </Typography>
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
            sx={{
              background: "linear-gradient(135deg, #864ce8ff 0%, #9333ea 100%)",
              color: "#fff",
              borderRadius: "10px",
              textTransform: "none",
              fontWeight: 600,
              "&:hover": {
                background: "linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)",
              },
            }}
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
      </Container>
    </Box>
  );
};

export default EventsStudent;

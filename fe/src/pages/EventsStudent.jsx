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
} from "@mui/material";
import { getEvents, getEventsByUniversity } from "../services/eventService";
import { getEventSessions } from "../services/eventSessionService";
import {
  registerStudentForEvent,
  checkStudentRegistration,
} from "../services/studentInEventService";
import { getStudentByUserId } from "../services/studentService";
import { useAuth } from "../contexts/AuthContext";

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

  const { user } = useAuth();

  const loadEvents = useCallback(async () => {
    try {
      let eventsData = [];
      let studentCode = user?.studentCode || user?.username;
      let universityId = null;

      console.log("[EventsStudent] Loading events for user:", user);

      // Get student info including universityId
      if (user?.userId || user?.UserId || user?.id || user?.Id) {
        try {
          const userId = user.userId || user.UserId || user.id || user.Id;
          console.log(
            "[EventsStudent] Fetching student data for userId:",
            userId
          );
          const studentData = await getStudentByUserId(userId);
          console.log("[EventsStudent] Student data received:", studentData);
          console.log("[EventsStudent] Raw universityId variations:", {
            universityId: studentData.universityId,
            UniversityId: studentData.UniversityId,
            university_id: studentData.university_id,
          });
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

          // Save student code to state for later use
          setCurrentStudentCode(studentCode);
        } catch (e) {
          console.warn("[EventsStudent] Error fetching student data:", e);
        }
      }

      // Load events filtered by university if available
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
        // Fallback to all events if no university found
        eventsData = await getEvents();
        console.log(
          `[EventsStudent] Loaded ${eventsData.length} events (no university filter)`
        );
      }

      setEvents(eventsData);

      // Check registration status for current student using already fetched studentCode
      if (studentCode && eventsData.length > 0) {
        const registeredEventIds = new Set();

        // Check each event for registration status
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

        // Wait for all checks to complete
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
    setSelectedEvent(event);
    setError("");
    setSuccess("");
    setOpen(true);
  };

  const handleConfirmEvent = async () => {
    // Use saved student code from state
    let studentCode = currentStudentCode || user?.studentCode || user?.username;

    console.log(
      "[EventsStudent] Registration attempt with studentCode:",
      studentCode
    );

    if (!studentCode) {
      setError("Không tìm thấy mã sinh viên. Vui lòng đăng nhập lại.");
      return;
    }

    console.log("Debug - User object:", user);
    console.log("Debug - Student code:", studentCode);
    console.log("Debug - Selected event:", selectedEvent);

    setLoading(true);
    setError("");

    try {
      const eventId = selectedEvent.eventId || selectedEvent.EventId;
      const token = localStorage.getItem("token");

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

      // Cập nhật trạng thái đã đăng ký ngay lập tức
      setRegisteredEvents((prev) => new Set([...prev, eventId]));

      setSuccess(
        `Đăng ký sự kiện "${
          selectedEvent.title || selectedEvent.Title
        }" thành công!`
      );
      setOpen(false);

      // Try to get sessions, but don't fail if it errors
      try {
        const sessionsData = await getEventSessions(eventId);
        if (sessionsData && sessionsData.length > 0) {
          setSessions(sessionsData);
          setOpenSession(true);
        } else {
          // No sessions available yet - this is normal
          setSuccess(`Đăng ký sự kiện "${
            selectedEvent.title || selectedEvent.Title
          }" thành công! 
            Organizer chưa tạo phiên cho sự kiện này. Bạn sẽ được thông báo khi có phiên mới.`);
        }
      } catch (sessionError) {
        console.warn("Could not load sessions:", sessionError);
        // Still show success even if sessions fail to load
        setSuccess(`Đăng ký sự kiện "${
          selectedEvent.title || selectedEvent.Title
        }" thành công! 
          Bạn có thể xem các phiên trong mục "Sự kiện đã đăng ký".`);
      }
    } catch (err) {
      console.error("Registration error:", err);

      // If already registered error, treat as success
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

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" fontWeight={700} color="#1976d2" mb={2}>
        Danh sách tất cả sự kiện
      </Typography>

      {/* Error and Success Messages */}
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

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Tiêu đề</TableCell>
            <TableCell>Mô tả</TableCell>
            <TableCell>Đơn vị tổ chức</TableCell>
            <TableCell>Ngày bắt đầu</TableCell>
            <TableCell>Ngày kết thúc</TableCell>
            <TableCell align="center">Trạng thái</TableCell>
            <TableCell align="right">Thao tác</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {events.map((e) => {
            const eventId = e.eventId || e.EventId;
            const isRegistered = registeredEvents.has(eventId);

            return (
              <TableRow key={eventId}>
                <TableCell>{e.title || e.Title}</TableCell>
                <TableCell>{e.description || e.Description}</TableCell>
                <TableCell>{e.organizer || e.Organizer}</TableCell>
                <TableCell>
                  {e.startDate || e.StartDate
                    ? new Date(e.startDate || e.StartDate).toLocaleDateString(
                        "vi-VN"
                      )
                    : e.start_date}
                </TableCell>
                <TableCell>
                  {e.endDate || e.EndDate
                    ? new Date(e.endDate || e.EndDate).toLocaleDateString(
                        "vi-VN"
                      )
                    : e.end_date}
                </TableCell>
                <TableCell align="center">
                  {isRegistered ? (
                    <Chip label="Đã đăng ký" color="success" size="small" />
                  ) : (
                    <Chip label="Chưa đăng ký" color="default" size="small" />
                  )}
                </TableCell>
                <TableCell align="right">
                  {isRegistered ? (
                    <Button variant="outlined" color="primary" disabled>
                      Đã đăng ký
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleRegisterEvent(e)}
                    >
                      Đăng ký
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Registration Confirmation Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Đăng ký sự kiện</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc muốn đăng ký sự kiện{" "}
            <strong>{selectedEvent?.title || selectedEvent?.Title}</strong>?
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={loading}>
            Hủy
          </Button>
          <Button
            onClick={handleConfirmEvent}
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? "Đang đăng ký..." : "Xác nhận"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Sessions Dialog */}
      <Dialog
        open={openSession}
        onClose={() => setOpenSession(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Danh sách phiên của sự kiện</DialogTitle>
        <DialogContent>
          <Typography mb={2}>
            Bạn đã đăng ký sự kiện{" "}
            <strong>{selectedEvent?.title || selectedEvent?.Title}</strong>{" "}
            thành công!
          </Typography>
          <Typography mb={2} variant="body2" color="textSecondary">
            Dưới đây là danh sách các phiên trong sự kiện:
          </Typography>
          {sessions.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 3 }}>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Chưa có phiên nào cho sự kiện này
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Organizer chưa tạo các phiên cho sự kiện này.
                <br />
                Bạn đã đăng ký sự kiện thành công và sẽ được thông báo khi có
                phiên mới.
              </Typography>
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Tên phiên</TableCell>
                  <TableCell>Thời gian bắt đầu</TableCell>
                  <TableCell>Thời gian kết thúc</TableCell>
                  <TableCell>Địa điểm</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sessions.map((s) => (
                  <TableRow key={s.sessionId || s.SessionId}>
                    <TableCell>
                      {s.sessionName ||
                        s.SessionName ||
                        `Phiên ${s.sessionId || s.SessionId}`}
                    </TableCell>
                    <TableCell>
                      {s.startTime || s.StartTime
                        ? new Date(s.startTime || s.StartTime).toLocaleString(
                            "vi-VN"
                          )
                        : s.start_time}
                    </TableCell>
                    <TableCell>
                      {s.endTime || s.EndTime
                        ? new Date(s.endTime || s.EndTime).toLocaleString(
                            "vi-VN"
                          )
                        : s.end_time}
                    </TableCell>
                    <TableCell>
                      {s.location || s.Location || "Chưa xác định"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSession(false)} variant="contained">
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EventsStudent;

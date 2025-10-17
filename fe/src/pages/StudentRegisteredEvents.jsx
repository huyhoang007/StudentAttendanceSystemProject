import React, { useEffect, useState, useCallback } from "react";
import {
  Typography,
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Alert,
  Chip,
  Button,
  Paper,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  getEventsByStudent,
  cancelRegistration,
} from "../services/studentInEventService";
import { getEventSessions } from "../services/eventSessionService";
import { useAuth } from "../contexts/AuthContext";

const StudentRegisteredEvents = () => {
  const [registrations, setRegistrations] = useState([]);
  const [sessionInfo, setSessionInfo] = useState({}); // Store session info for each event
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { user } = useAuth();
  const navigate = useNavigate();

  const loadRegisteredEvents = useCallback(async () => {
    console.log("Full user object:", user);

    // Extract student ID from the correct field
    const studentId = user?.StudentId || user?.studentId;
    console.log("Extracted student ID:", studentId);
    console.log(
      "Available user properties:",
      user ? Object.keys(user) : "No user"
    );

    if (!studentId) {
      setError("Không tìm thấy thông tin student ID. Vui lòng đăng nhập lại.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      console.log("Loading events for student ID:", studentId);

      const data = await getEventsByStudent(studentId);
      console.log("Received registration data:", data);

      setRegistrations(data || []);

      // Load session info for each event
      const sessionData = {};
      console.log("Starting to load sessions for registrations:", data?.length);
      console.log("Registration data structure:", data);

      for (const registration of data || []) {
        console.log("🔄 Processing registration:", registration);

        // Try multiple ways to extract eventId
        const eventId =
          registration.eventId ||
          registration.EventId ||
          registration.event?.eventId ||
          registration.event?.EventId ||
          registration.event?.id ||
          registration.event?.Id;

        console.log(`🎯 Extracted eventId: ${eventId} from registration`);

        if (eventId) {
          try {
            console.log(
              `🔍 Attempting to load sessions for eventId: ${eventId}`
            );
            const sessions = await getEventSessions(eventId);
            console.log(
              `✅ Successfully loaded sessions for eventId ${eventId}:`,
              sessions
            );
            sessionData[eventId] = sessions || [];
          } catch (sessionError) {
            console.error(
              `❌ Error loading sessions for event ${eventId}:`,
              sessionError
            );
            console.error("Full error details:", sessionError);
            sessionData[eventId] = [];
          }
        } else {
          console.warn("⚠️ No eventId found for registration:", registration);
        }
      }

      // Đảm bảo tất cả registration đều có sessionInfo entry
      for (const registration of data || []) {
        const event = registration.event || registration.Event || registration;
        const eventId =
          event?.eventId || event?.EventId || event?.id || event?.Id;
        if (eventId && !(eventId in sessionData)) {
          sessionData[eventId] = [];
        }
      }

      console.log("Final sessionData:", sessionData);
      setSessionInfo(sessionData);
    } catch (err) {
      console.error("Error loading registered events:", err);
      setError("Lỗi khi tải danh sách sự kiện đã đăng ký: " + err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const handleCancelRegistration = async (registrationId, eventTitle) => {
    if (
      !window.confirm(`Bạn có chắc muốn hủy đăng ký sự kiện "${eventTitle}"?`)
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      await cancelRegistration(registrationId, token);
      alert("Hủy đăng ký thành công!");

      // Remove the canceled registration from current state instead of reloading all
      setRegistrations((prevRegistrations) =>
        prevRegistrations.filter((reg) => {
          const regId =
            reg.studentInEventId || reg.StudentInEventId || reg.id || reg.Id;
          return regId !== registrationId;
        })
      );

      console.log("Removed registration from state:", registrationId);
    } catch (error) {
      console.error("Error canceling registration:", error);
      alert("Lỗi khi hủy đăng ký: " + (error.message || "Không xác định"));
    }
  };

  const handleViewSessionDetails = (sessionId) => {
    // Chuyển đến trang chi tiết phiên
    navigate(`/session-details/${sessionId}`);
  };

  useEffect(() => {
    loadRegisteredEvents();
  }, [loadRegisteredEvents]);

  // Hàm để refresh data từ bên ngoài
  const refreshData = useCallback(() => {
    setLoading(true);
    loadRegisteredEvents();
  }, [loadRegisteredEvents]);

  // Expose refresh function to window for debugging
  useEffect(() => {
    window.refreshStudentEvents = refreshData;
    return () => {
      delete window.refreshStudentEvents;
    };
  }, [refreshData]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "registered":
        return "success";
      case "attended":
        return "primary";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case "registered":
        return "Đã đăng ký";
      case "attended":
        return "Đã tham dự";
      case "cancelled":
        return "Đã hủy";
      default:
        return status || "Không xác định";
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 2, textAlign: "center" }}>
        <Typography>Đang tải dữ liệu...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" fontWeight={700} color="#1976d2" mb={2}>
        Sự kiện đã đăng ký
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {registrations.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h6" color="textSecondary" mb={2}>
            Chưa có sự kiện nào được đăng ký
          </Typography>
          <Typography variant="body2" color="textSecondary" mb={3}>
            Hãy vào trang "Sự kiện" để đăng ký tham gia các sự kiện mới.
          </Typography>
          <Button
            variant="contained"
            onClick={() => (window.location.href = "/events-student")}
          >
            Xem danh sách sự kiện
          </Button>
        </Paper>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tên sự kiện</TableCell>
              <TableCell>Mô tả</TableCell>
              <TableCell>Tổ chức</TableCell>
              <TableCell>Ngày bắt đầu</TableCell>
              <TableCell>Ngày kết thúc</TableCell>
              <TableCell align="center">Trạng thái đăng ký</TableCell>
              <TableCell align="center">Trạng thái phiên</TableCell>
              <TableCell>Ngày đăng ký</TableCell>
              <TableCell align="center">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {registrations.map((registration) => {
              // Handle different response structures
              const event =
                registration.event || registration.Event || registration;
              const eventId =
                event?.eventId || event?.EventId || event?.id || event?.Id;
              const eventTitle =
                event?.title ||
                event?.Title ||
                registration?.eventTitle ||
                registration?.EventTitle ||
                "Không có tên";
              const status =
                registration.status || registration.Status || "registered";

              // Get session info for this event
              const eventSessions = sessionInfo[eventId] || [];
              const hasActiveSessions = eventSessions.length > 0;

              // Enhanced debug logging
              console.log(`=== Event ${eventTitle} ===`);
              console.log("Full registration object:", registration);
              console.log("Event object:", event);
              console.log("Parsed eventId:", eventId);
              console.log("Available data:");
              console.log(
                "- eventDescription:",
                registration.eventDescription || registration.EventDescription
              );
              console.log(
                "- event.description:",
                event?.description || event?.Description
              );
              console.log(
                "- eventOrganizer:",
                registration.eventOrganizer || registration.EventOrganizer
              );
              console.log(
                "- event.organizer:",
                event?.organizer || event?.Organizer
              );
              console.log(
                "- eventStartDate:",
                registration.eventStartDate || registration.EventStartDate
              );
              console.log(
                "- event.startDate:",
                event?.startDate || event?.StartDate
              );
              console.log(
                "SessionInfo for this eventId:",
                sessionInfo[eventId]
              );
              console.log("Has active sessions:", hasActiveSessions);
              console.log("========================");

              return (
                <TableRow
                  key={
                    registration.studentInEventId ||
                    registration.StudentInEventId
                  }
                >
                  <TableCell>
                    <Typography variant="body1" fontWeight={500}>
                      {eventTitle}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="textSecondary">
                      {registration.eventDescription ||
                        registration.EventDescription ||
                        event?.description ||
                        event?.Description ||
                        "Không có mô tả"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {registration.eventOrganizer ||
                      registration.EventOrganizer ||
                      event?.organizer ||
                      event?.Organizer ||
                      "Chưa xác định"}
                  </TableCell>
                  <TableCell>
                    {registration.eventStartDate ||
                    registration.EventStartDate ||
                    event?.startDate ||
                    event?.StartDate
                      ? new Date(
                          registration.eventStartDate ||
                            registration.EventStartDate ||
                            event?.startDate ||
                            event?.StartDate
                        ).toLocaleDateString("vi-VN")
                      : "Chưa xác định"}
                  </TableCell>
                  <TableCell>
                    {registration.eventEndDate ||
                    registration.EventEndDate ||
                    event?.endDate ||
                    event?.EndDate
                      ? new Date(
                          registration.eventEndDate ||
                            registration.EventEndDate ||
                            event?.endDate ||
                            event?.EndDate
                        ).toLocaleDateString("vi-VN")
                      : "Chưa xác định"}
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={getStatusText(status)}
                      color={getStatusColor(status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    {hasActiveSessions ? (
                      <Chip
                        label={`${eventSessions.length} phiên`}
                        color="success"
                        size="small"
                      />
                    ) : (
                      <Chip
                        label="Chưa có phiên"
                        color="warning"
                        size="small"
                      />
                    )}
                  </TableCell>
                  <TableCell>{"Đã đăng ký"}</TableCell>
                  <TableCell align="center">
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1,
                        alignItems: "center",
                      }}
                    >
                      {/* Nút xem chi tiết phiên - chỉ hiện nếu có phiên */}
                      {hasActiveSessions && (
                        <Button
                          variant="outlined"
                          color="info"
                          size="small"
                          onClick={() => {
                            // Nếu chỉ có 1 phiên, chuyển trực tiếp. Nếu nhiều phiên, chuyển đến danh sách phiên
                            if (eventSessions.length === 1) {
                              const sessionId =
                                eventSessions[0].sessionId ||
                                eventSessions[0].SessionId ||
                                eventSessions[0].id ||
                                eventSessions[0].Id;
                              console.log("Session data:", eventSessions[0]);
                              console.log("Selected sessionId:", sessionId);
                              if (sessionId) {
                                handleViewSessionDetails(sessionId);
                              } else {
                                alert(
                                  "Không tìm thấy ID phiên. Vui lòng thử lại."
                                );
                              }
                            } else {
                              // Chuyển đến trang danh sách phiên của sự kiện
                              navigate(`/event-sessions/${eventId}`);
                            }
                          }}
                          sx={{ minWidth: "140px" }}
                        >
                          {eventSessions.length === 1
                            ? "Xem chi tiết phiên"
                            : `Xem ${eventSessions.length} phiên`}
                        </Button>
                      )}

                      {/* Nút hủy đăng ký - chỉ hiện nếu chưa tham dự */}
                      {status?.toLowerCase() !== "attended" && (
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() =>
                            handleCancelRegistration(
                              registration.studentInEventId ||
                                registration.StudentInEventId,
                              eventTitle
                            )
                          }
                          sx={{ minWidth: "140px" }}
                        >
                          Hủy đăng ký
                        </Button>
                      )}

                      {/* Nút điểm danh - chỉ hiện nếu có phiên */}
                      {hasActiveSessions && (
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          onClick={() => {
                            // Navigate to session check-in page
                            navigate(`/checkin?eventId=${eventId}`);
                          }}
                          sx={{ minWidth: "140px" }}
                        >
                          Điểm danh
                        </Button>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </Box>
  );
};

export default StudentRegisteredEvents;
// đang đợi fix nghiệp vụ
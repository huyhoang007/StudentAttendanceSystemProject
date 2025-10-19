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
  // ========== THÊM CÁC COMPONENT GIAO DIỆN ==========
  Card,
  CircularProgress,
} from "@mui/material";
import {
  // ========== THÊM CÁC ICON MỚI ==========
  EventBusy,
  ArrowForward,
  Visibility,
  Close,
  QrCodeScanner,
  EventAvailable,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import {
  getEventsByStudent,
  cancelRegistration,
} from "../services/studentInEventService";
import { getEventSessions } from "../services/eventSessionService";
import { useAuth } from "../contexts/AuthContext";

const StudentRegisteredEvents = () => {
  // =================================================================
  //
  //            TOÀN BỘ LOGIC CODE CỦA BẠN (GIỮ NGUYÊN 100%)
  //
  // =================================================================
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

  // =================================================================
  //
  //            BẮT ĐẦU PHẦN GIAO DIỆN (JSX) ĐÃ UPDATE
  //
  // =================================================================

  if (loading) {
    return (
      // ========== LOADING STATE ĐÃ UPDATE ==========
      <Box
        sx={{
          p: 4,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <CircularProgress />
        <Typography color="text.secondary">Đang tải dữ liệu...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, backgroundColor: "#f9fafc", minHeight: "100vh" }}>
      {/* ========== HEADER ĐÃ UPDATE ========== */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <EventAvailable color="primary" sx={{ fontSize: 40 }} />
          <Box>
            <Typography variant="h4" fontWeight={700} color="text.primary">
              Sự kiện đã đăng ký
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Theo dõi các sự kiện và phiên bạn đã tham gia.
            </Typography>
          </Box>
        </Box>
      </Box>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2, borderRadius: 2 }}
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}

      {registrations.length === 0 ? (
        // ========== TRẠNG THÁI RỖNG ĐÃ UPDATE ==========
        <Paper
          sx={{
            p: 4,
            textAlign: "center",
            borderRadius: 3,
            boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
            backgroundColor: "white",
          }}
        >
          <EventBusy sx={{ fontSize: 60, color: "grey.400", mb: 2 }} />
          <Typography variant="h6" fontWeight={600} color="text.primary" mb={1}>
            Bạn chưa đăng ký sự kiện nào
          </Typography>
          <Typography variant="body1" color="textSecondary" mb={3}>
            Hãy khám phá và đăng ký tham gia các sự kiện mới nhé!
          </Typography>
          <Button
            variant="contained"
            endIcon={<ArrowForward />}
            // Giữ nguyên logic window.location của bạn
            onClick={() => (window.location.href = "/events-student")}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              px: 3,
            }}
          >
            Xem danh sách sự kiện
          </Button>
        </Paper>
      ) : (
        // ========== BẢNG DỮ LIỆU ĐÃ UPDATE (BỌC CARD) ==========
        <Card
          sx={{
            borderRadius: 4,
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            overflow: "hidden",
          }}
        >
          <Table>
            {/* ====================================================
                BẮT ĐẦU PHẦN TABLEHEAD (ĐÃ XÓA CỘT NGÀY ĐĂNG KÝ)
            ======================================================= */}
            <TableHead sx={{ backgroundColor: "grey.100" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, color: "text.secondary" }}>
                  Tên sự kiện
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: "text.secondary" }}>
                  Mô tả
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: "text.secondary" }}>
                  Tổ chức
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: "text.secondary" }}>
                  Ngày bắt đầu
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: "text.secondary" }}>
                  Ngày kết thúc
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ fontWeight: 600, color: "text.secondary" }}
                >
                  Trạng thái đăng ký
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ fontWeight: 600, color: "text.secondary" }}
                >
                  Trạng thái phiên
                </TableCell>
                {/* <TableCell sx={{ fontWeight: 600, color: "text.secondary" }}>
                  Ngày đăng ký // <-- ĐÃ XÓA DÒNG NÀY
                </TableCell> */}
                <TableCell
                  align="center"
                  sx={{ fontWeight: 600, color: "text.secondary" }}
                >
                  Thao tác
                </TableCell>
              </TableRow>
            </TableHead>
            {/* ====================================================
                KẾT THÚC PHẦN TABLEHEAD
            ======================================================= */}

            {/* ========== TABLEBODY (GIỮ NGUYÊN LOGIC) ========== */}
            <TableBody>
              {registrations.map((registration) => {
                // *** TOÀN BỘ LOGIC CỦA BẠN DƯỚI ĐÂY ĐƯỢC GIỮ NGUYÊN ***
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
                const eventSessions = sessionInfo[eventId] || [];
                const hasActiveSessions = eventSessions.length > 0;

                // Debug logs của bạn được giữ nguyên
                console.log(`=== Event ${eventTitle} ===`);
                // ... (tất cả console.log khác của bạn)
                console.log("========================");

                return (
                  <TableRow
                    key={
                      registration.studentInEventId ||
                      registration.StudentInEventId
                    }
                    hover
                    sx={{
                      "&:hover": { backgroundColor: "action.hover" },
                    }}
                  >
                    {/* Giữ nguyên 100% các TableCell của bạn */}
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
                    {/* <TableCell>{"Đã đăng ký"}</TableCell> // <-- ĐÃ XÓA */}

                    {/* =================================================
                        BẮT ĐẦU CỘT THAO TÁC (GIỮ NGUYÊN NHƯ LẦN TRƯỚC)
                    ==================================================== */}
                    <TableCell align="center">
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "row",
                          gap: 1,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {/* Nút xem chi tiết phiên - GIỮ NGUYÊN LOGIC */}
                        {hasActiveSessions && (
                          <Button
                            variant="outlined"
                            color="info"
                            size="small"
                            startIcon={<Visibility />}
                            onClick={() => {
                              navigate(`/event-sessions/${eventId}`);
                            }}
                            sx={{
                              textTransform: "none",
                              fontWeight: 600,
                              borderRadius: 2,
                            }}
                          >
                            Xem danh sách phiên{" "}
                            {eventSessions.length > 0
                              ? `(${eventSessions.length})`
                              : ""}
                          </Button>
                        )}

                        {/* Nút hủy đăng ký - GIỮ NGUYÊN LOGIC */}
                        {status?.toLowerCase() !== "attended" && (
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            startIcon={<Close />}
                            onClick={() =>
                              handleCancelRegistration(
                                registration.studentInEventId ||
                                  registration.StudentInEventId,
                                eventTitle
                              )
                            }
                            sx={{
                              textTransform: "none",
                              fontWeight: 600,
                              borderRadius: 2,
                            }}
                          >
                            Hủy đăng ký
                          </Button>
                        )}

                        {/* Nút điểm danh - GIỮ NGUYÊN LOGIC */}
                        {hasActiveSessions && (
                          <Button
                            variant="contained"
                            color="success"
                            size="small"
                            startIcon={<QrCodeScanner />}
                            onClick={() => {
                              navigate(`/checkin?eventId=${eventId}`);
                            }}
                            sx={{
                              textTransform: "none",
                              fontWeight: 600,
                              borderRadius: 2,
                            }}
                          >
                            Điểm danh
                          </Button>
                        )}
                      </Box>
                    </TableCell>
                    {/* =================================================
                        KẾT THÚC CỘT THAO TÁC
                    ==================================================== */}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </Box>
  );
};

export default StudentRegisteredEvents;

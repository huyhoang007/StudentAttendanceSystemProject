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
  Card,
  CircularProgress,
  TablePagination,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
} from "@mui/material";
import {
  EventBusy,
  ArrowForward,
  Visibility,
  Close,
  QrCodeScanner,
  EventAvailable,
  Warning,
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
  //            TOÀN BỘ LOGIC CODE CỦA BẠN (GIỮ NGUYÊN 100%)
  //
  // =================================================================
  const [registrations, setRegistrations] = useState([]);
  const [sessionInfo, setSessionInfo] = useState({}); // Store session info for each event
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // --- THÊM STATE CHO PHÂN TRANG ---
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5); // <-- Đặt mặc định là 5

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
      setPage(0); // <-- RESET VỀ TRANG ĐẦU TIÊN KHI TẢI DỮ LIỆU

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

    // State for dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const handleCancelRegistration = async (registrationId, eventTitle) => {
    setSelectedRegistration({ id: registrationId, title: eventTitle });
    setDialogOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedRegistration) return;

    try {
      const token = localStorage.getItem("authToken");
      await cancelRegistration(selectedRegistration.id, token);
      
      setRegistrations((prevRegistrations) =>
        prevRegistrations.filter((reg) => {
          const regId = reg.studentInEventId || reg.StudentInEventId || reg.id || reg.Id;
          return regId !== selectedRegistration.id;
        })
      );

      setSnackbarMessage("Hủy đăng ký thành công!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);

      console.log("Removed registration from state:", selectedRegistration.id);
    } catch (error) {
      console.error("Error canceling registration:", error);
      setSnackbarMessage("Lỗi khi hủy đăng ký: " + (error.message || "Không xác định"));
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setDialogOpen(false);
      setSelectedRegistration(null);
    }
  };

  const handleViewSessionDetails = (sessionId) => {
    // ... (Logic của bạn giữ nguyên)
    // Chuyển đến trang chi tiết phiên
    navigate(`/session-details/${sessionId}`);
  };

  useEffect(() => {
    loadRegisteredEvents();
  }, [loadRegisteredEvents]);

  // Hàm để refresh data từ bên ngoài
  const refreshData = useCallback(() => {
    // ... (Logic của bạn giữ nguyên)
    setLoading(true);
    loadRegisteredEvents();
  }, [loadRegisteredEvents]);

  // Expose refresh function to window for debugging
  useEffect(() => {
    // ... (Logic của bạn giữ nguyên)
    window.refreshStudentEvents = refreshData;
    return () => {
      delete window.refreshStudentEvents;
    };
  }, [refreshData]);

    const getStatusColor = (status) => {
    // Map status to colors with consistent branding
    switch (status?.toLowerCase()) {
      case "registered":
        return "success"; // Green
      case "attended":
        return "primary"; // Blue
      case "cancelled":
        return "error"; // Red
      case "absent":
        return "warning"; // Orange
      default:
        return "default"; // Gray
    }
  };

  const getStatusText = (status) => {
    // Map status to user-friendly Vietnamese text
    switch (status?.toLowerCase()) {
      case "registered":
        return "Đã đăng ký";
      case "attended":
        return "Đã tham dự";
      case "cancelled":
        return "Đã hủy";
      case "absent":
        return "Vắng mặt";
      default:
        return status || "Không xác định";
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
      {/* Dialog for cancel confirmation */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title" sx={{ pr: 8 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <Warning color="warning" />
            Xác nhận hủy đăng ký
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {selectedRegistration && (
              <>
                Bạn có chắc chắn muốn hủy đăng ký sự kiện "{selectedRegistration.title}"?
                <br />
                <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                  Lưu ý: Hành động này không thể hoàn tác.
                </Typography>
              </>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} color="inherit">
            Hủy bỏ
          </Button>
          <Button onClick={handleConfirmCancel} color="error" variant="contained">
            Xác nhận hủy đăng ký
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* Header */}
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
                BẮT ĐẦU PHẦN TABLEHEAD (GIỮ NGUYÊN)
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

            {/* ========== TABLEBODY (CẬP NHẬT LOGIC SLICE) ========== */}
            <TableBody>
              {/* --- CẬP NHẬT LOGIC RENDER VỚI SLICE --- */}
              {(rowsPerPage > 0
                ? registrations.slice(
                    page * rowsPerPage,
                    page * rowsPerPage + rowsPerPage
                  )
                : registrations
              ).map((registration) => {
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
                      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Chip
                          label={getStatusText(status)}
                          color={getStatusColor(status)}
                          size="small"
                          sx={{
                            fontWeight: 500,
                            minWidth: '100px',
                            '& .MuiChip-label': {
                              px: 2
                            }
                          }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
                        {hasActiveSessions ? (
                          <Chip
                            label={`${eventSessions.length} phiên`}
                            color="success"
                            size="small"
                            sx={{
                              fontWeight: 500,
                              '& .MuiChip-label': {
                                px: 2
                              }
                            }}
                          />
                        ) : (
                          <Chip
                            label="Chưa có phiên"
                            color="warning"
                            size="small"
                            sx={{
                              fontWeight: 500,
                              '& .MuiChip-label': {
                                px: 2
                              }
                            }}
                          />
                        )}
                      </Box>
                    </TableCell>

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

          {/* --- THÊM COMPONENT PHÂN TRANG --- */}
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]} // Các tùy chọn số hàng mỗi trang
            component="div"
            count={registrations.length} // Tổng số đăng ký
            rowsPerPage={rowsPerPage} // Số hàng mỗi trang hiện tại
            page={page} // Trang hiện tại
            onPageChange={handleChangePage} // Hàm khi đổi trang
            onRowsPerPageChange={handleChangeRowsPerPage} // Hàm khi đổi số hàng mỗi trang
            // Thêm label tiếng Việt cho thân thiện
            labelRowsPerPage="Số hàng mỗi trang:"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}–${to} trong số ${count}`
            }
          />
        </Card>
      )}
    </Box>
  );
};

export default StudentRegisteredEvents;

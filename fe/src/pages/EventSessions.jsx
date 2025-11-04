// src/pages/EventSessions.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from "@mui/material";
import {
  ArrowBack,
  Schedule,
  LocationOn,
  Event as EventIcon,
  PlayCircleOutline,
  QrCode,
  Close,
} from "@mui/icons-material";
import { getEvent } from "../services/eventService";
import { getSessionsByEvent } from "../services/eventSessionService";
import { getStudentCheckInStatus } from "../services/sessionCheckInService";
import QRCodeGenerator from "../components/QRCodeGenerator";
import { useAuth } from "../contexts/AuthContext";

const EventSessions = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { role } = useAuth();
  const [event, setEvent] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get specific sessionId from URL params
  const targetSessionId = searchParams.get("sessionId");

  // Debug role
  console.log("EventSessions - Current role:", role);
  console.log("EventSessions - Target sessionId:", targetSessionId);

  // QR Code states
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [checkInStatus, setCheckInStatus] = useState({});
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Refresh check-in status every 30 seconds
  useEffect(() => {
    if (role !== "student") return;

    const refreshCheckInStatus = async () => {
      console.log("Refreshing check-in status...");
      if (!sessions.length) return;

      const newStatus = {};
      for (const session of sessions) {
        const sessionId = session.id || session.sessionId || session.SessionId;
        try {
          const isCheckedIn = await getStudentCheckInStatus(sessionId, eventId);
          newStatus[sessionId] = isCheckedIn;
        } catch (e) {
          console.error(
            "Error refreshing check-in status for session:",
            sessionId,
            e
          );
        }
      }
      setCheckInStatus((prev) => ({ ...prev, ...newStatus }));
      setLastRefresh(new Date());
    };

    const interval = setInterval(refreshCheckInStatus, 30000);
    return () => clearInterval(interval);
  }, [sessions, eventId, role]);

  // QR Code functions
  const handleGenerateQR = (session) => {
    setSelectedSession(session);
    setQrDialogOpen(true);
  };

  const handleCloseQR = () => {
    setQrDialogOpen(false);
    setSelectedSession(null);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log("Fetching data for event:", eventId);

        // Lấy thông tin sự kiện
        const eventData = await getEvent(eventId);
        console.log("Event data received:", eventData);
        setEvent(eventData);

        // Lấy danh sách phiên của sự kiện
        const sessionsData = await getSessionsByEvent(eventId);
        console.log("Sessions data received:", sessionsData);
        let filteredSessions = sessionsData || [];

        // Nếu có targetSessionId, lọc để chỉ hiển thị phiên đó nhưng vẫn giữ dạng danh sách
        if (targetSessionId) {
          filteredSessions = filteredSessions.filter(
            (session) =>
              session.id === targetSessionId ||
              session.sessionId === targetSessionId ||
              session.SessionId === targetSessionId
          );
          console.log("Filtered to specific session:", filteredSessions);
        }

        // Luôn hiển thị dạng danh sách, không tự chuyển hướng khi chỉ có 1 phiên
        setSessions(filteredSessions);

        // Lấy trạng thái điểm danh cho từng phiên
        const checkInStatusObj = {};
        if (role === "student") {
          for (const session of filteredSessions) {
            const sessionId =
              session.id || session.sessionId || session.SessionId;
            try {
              const isCheckedIn = await getStudentCheckInStatus(
                sessionId,
                eventId
              );
              checkInStatusObj[sessionId] = isCheckedIn;
            } catch (e) {
              console.error("Error getting check-in status:", e);
              checkInStatusObj[sessionId] = false;
            }
          }
          setCheckInStatus(checkInStatusObj);
        }

        setSessions(filteredSessions);
      } catch (err) {
        setError("Không thể tải thông tin sự kiện và phiên");
        console.error("Error fetching event sessions:", err);
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchData();
    }
  }, [eventId, targetSessionId, role]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getSessionStatus = (startTime, endTime, isCheckedIn) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);

    // Với organizer và admin: chỉ hiển thị trạng thái phiên
    if (role !== "student") {
      if (now > end) return { text: "Đã kết thúc", color: "error" };
      if (now >= start) return { text: "Đang diễn ra", color: "warning" };
      return { text: "Chưa bắt đầu", color: "info" };
    }

    // Với student: hiển thị cả trạng thái điểm danh
    if (isCheckedIn) {
      if (now > end) return { text: "Đã tham gia", color: "success" };
      if (now >= start) return { text: "Đã điểm danh", color: "success" };
      return { text: "Đã điểm danh trước", color: "success" };
    }

    // Trường hợp student chưa điểm danh
    if (now > end) return { text: "Đã kết thúc - Vắng mặt", color: "error" };
    if (now >= start)
      return { text: "Đang diễn ra - Chưa điểm danh", color: "warning" };
    return { text: "Chưa bắt đầu", color: "info" };
  };

  const handleBackToEvent = () => {
    // Student: quay về sự kiện đã đăng ký
    // Organizer/Admin: quay về trang quản lý sự kiện
    if (role === "student") {
      navigate("/student-registered-events");
    } else if (role === "organizer" || role === "admin") {
      navigate("/events");
    } else {
      // Fallback
      navigate("/");
    }
  };

  const handleBackToEvents = () => {
    // Student: quay về sự kiện đã đăng ký
    // Organizer/Admin: quay về trang quản lý sự kiện
    if (role === "student") {
      navigate("/student-registered-events");
    } else if (role === "organizer" || role === "admin") {
      navigate("/events");
    } else {
      // Fallback
      navigate("/");
    }
  };

  const handleViewSessionDetails = (sessionId) => {
    navigate(`/session-details/${sessionId}`);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
        <Button
          variant="outlined"
          onClick={handleBackToEvents}
          sx={{ mt: 2, borderColor: '#7c3aed', color: '#7c3aed' }}
          startIcon={<ArrowBack />}
        >
          Quay lại danh sách
        </Button>
      </Box>
    );
  }

  if (!event) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">Không tìm thấy thông tin sự kiện</Alert>
        <Button
          variant="outlined"
          onClick={handleBackToEvents}
          sx={{ mt: 2, borderColor: '#7c3aed', color: '#7c3aed' }}
          startIcon={<ArrowBack />}
        >
          Quay lại danh sách
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1000, mx: "auto" }}>
      {/* Header - gradient purple to match previous pages */}
      <Card
        sx={{
          mb: 3,
          borderRadius: "24px",
          background: "linear-gradient(135deg, #864ce8ff 0%, #864ce8ff 100%)",
          boxShadow: "0 8px 24px rgba(134, 76, 232, 0.18)",
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {role === "student" && (
              <Button
                variant="outlined"
                onClick={handleBackToEvent}
                startIcon={<ArrowBack />}
                sx={{
                  mr: 2,
                  borderColor: "rgba(255,255,255,0.2)",
                  color: "rgba(255,255,255,0.95)",
                }}
              >
                Quay lại sự kiện đã đăng ký
              </Button>
            )}

            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Schedule sx={{ fontSize: 36, color: "#fff" }} />
              <Typography variant="h4" fontWeight={700} color="#fff">
                {targetSessionId ? "Chi tiết phiên" : "Danh sách phiên"}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Thông tin sự kiện */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <Avatar sx={{ bgcolor: "rgba(255,255,255,0.12)" }}>
              <EventIcon sx={{ color: "#fff" }} />
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" fontWeight={600}>
                {event.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                📅 {formatDate(event.startDate)} - {formatDate(event.endDate)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                📍 {event.location}
              </Typography>
            </Box>
            <Chip
              label={`${sessions.length} phiên`}
              variant="outlined"
              sx={{
                color: "#7c3aed",
                borderColor: "#7c3aed",
              }}
            />
          </Box>

          {event.description && (
            <Typography variant="body2" color="text.secondary">
              {event.description}
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Danh sách phiên */}
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={600} mb={3}>
            Các phiên trong sự kiện ({sessions.length})
          </Typography>

          {sessions.length === 0 ? (
            <Alert severity="info">
              Sự kiện này chưa có phiên nào được tạo.
            </Alert>
          ) : (
            <List sx={{ p: 0 }}>
              {sessions.map((session, index) => {
                const isCheckedIn =
                  checkInStatus[
                    session.id || session.sessionId || session.SessionId
                  ];
                const status = getSessionStatus(
                  session.startTime,
                  session.endTime,
                  isCheckedIn
                );
                const sessionId = session.id || session.sessionId;

                return (
                  <React.Fragment key={sessionId || index}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemButton
                        onClick={() => handleViewSessionDetails(sessionId)}
                        sx={{
                          borderRadius: 2,
                          border: "1px solid #eae6ff",
                          mb: 1,
                          p: 2,
                          backgroundColor:
                            role === "student" &&
                            checkInStatus[
                              sessionId || session.id || session.SessionId
                            ]
                              ? "rgba(16, 185, 129, 0.06)"
                              : undefined,
                          "&:hover": {
                            backgroundColor:
                              role === "student" &&
                              checkInStatus[
                                sessionId || session.id || session.SessionId
                              ]
                                ? "rgba(16, 185, 129, 0.10)"
                                : "rgba(124, 58, 237, 0.04)",
                            borderColor:
                              role === "student" &&
                              checkInStatus[
                                sessionId || session.id || session.SessionId
                              ]
                                ? "#10b981"
                                : "#7c3aed",
                          },
                        }}
                      >
                        <ListItemAvatar>
                                <Avatar sx={{ bgcolor: "rgba(124,58,237,0.12)" }}>
                                  <PlayCircleOutline sx={{ color: "#7c3aed" }} />
                                </Avatar>
                        </ListItemAvatar>

                        <ListItemText
                          primary={
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                mb: 1,
                              }}
                            >
                              <Typography variant="h6" fontWeight={500}>
                                {session.title &&
                                session.title.trim() &&
                                session.title !== session.id &&
                                session.title !== session.sessionId &&
                                session.title !== session.SessionId &&
                                session.title !== session.Id &&
                                !session.title.match(
                                  /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i
                                ) &&
                                session.title.length < 50
                                  ? session.title
                                  : `Phiên ${index + 1}`}
                              </Typography>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <Chip
                                  label={status.text}
                                  color={status.color}
                                  size="small"
                                  sx={
                                    role === "student"
                                      ? {
                                          fontWeight: isCheckedIn
                                            ? "bold"
                                            : "normal",
                                          "& .MuiChip-label": {
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "4px",
                                          },
                                        }
                                      : {
                                          "& .MuiChip-label": {
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "4px",
                                          },
                                        }
                                  }
                                />
                                {(role === "organizer" || role === "admin") && (
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleGenerateQR(session);
                                    }}
                                    sx={{
                                      bgcolor: "#7c3aed",
                                      color: "white",
                                      "&:hover": {
                                        bgcolor: "#6d28d9",
                                      },
                                    }}
                                  >
                                    <QrCode fontSize="small" />
                                  </IconButton>
                                )}
                              </Box>
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                  mb: 1,
                                }}
                              >
                                <Schedule fontSize="small" color="action" />
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {formatDate(session.startTime)} -{" "}
                                  {formatDate(session.endTime)}
                                </Typography>
                              </Box>

                              {session.location && (
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    mb: 1,
                                  }}
                                >
                                  <LocationOn fontSize="small" color="action" />
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    {session.location}
                                  </Typography>
                                </Box>
                              )}

                              {session.description && (
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{ mt: 1 }}
                                >
                                  {session.description.length > 100
                                    ? `${session.description.substring(
                                        0,
                                        100
                                      )}...`
                                    : session.description}
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                      </ListItemButton>
                    </ListItem>
                    {index < sessions.length - 1 && <Divider sx={{ my: 1 }} />}
                  </React.Fragment>
                );
              })}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
        <Button
          variant="outlined"
          onClick={handleBackToEvent}
          startIcon={<ArrowBack />}
          sx={{ borderColor: '#7c3aed', color: '#7c3aed' }}
        >
          {role === "student"
            ? "Quay lại sự kiện đã đăng ký"
            : "Quay lại quản lý sự kiện"}
        </Button>
      </Box>

      {/* QR Code Dialog */}
      <Dialog
        open={qrDialogOpen}
        onClose={handleCloseQR}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6">Tạo mã QR điểm danh</Typography>
          <IconButton onClick={handleCloseQR}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedSession ? (
            <QRCodeGenerator session={selectedSession} event={event} />
          ) : (
            <Typography>Đang tải...</Typography>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default EventSessions;

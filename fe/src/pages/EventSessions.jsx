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

        // Lấy thông tin sự kiện
        const eventData = await getEvent(eventId);
        setEvent(eventData);

        // Lấy danh sách phiên của sự kiện
        const sessionsData = await getSessionsByEvent(eventId);
        let filteredSessions = sessionsData || [];

        // Nếu có targetSessionId, chỉ hiển thị phiên đó
        if (targetSessionId) {
          filteredSessions = filteredSessions.filter(
            (session) =>
              session.id === targetSessionId ||
              session.sessionId === targetSessionId ||
              session.SessionId === targetSessionId
          );
          console.log("Filtered to specific session:", filteredSessions);
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
  }, [eventId, targetSessionId]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getSessionStatus = (startTime, endTime) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (now < start) return { text: "Chưa bắt đầu", color: "info" };
    if (now > end) return { text: "Đã kết thúc", color: "default" };
    return { text: "Đang diễn ra", color: "success" };
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
          sx={{ mt: 2 }}
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
          sx={{ mt: 2 }}
          startIcon={<ArrowBack />}
        >
          Quay lại danh sách
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1000, mx: "auto" }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        {role === "student" && (
          <Button
            variant="outlined"
            onClick={handleBackToEvent}
            startIcon={<ArrowBack />}
            sx={{ mr: 2 }}
          >
            Quay lại sự kiện đã đăng ký
          </Button>
        )}
        <Typography
          variant="h4"
          fontWeight={700}
          sx={{
            color: "#1976d2",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Schedule fontSize="large" />
          {targetSessionId ? "Chi tiết phiên" : "Danh sách phiên"}
        </Typography>
      </Box>

      {/* Thông tin sự kiện */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <Avatar sx={{ bgcolor: "#1976d2" }}>
              <EventIcon />
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
              color="primary"
              variant="outlined"
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
                const status = getSessionStatus(
                  session.startTime,
                  session.endTime
                );
                const sessionId = session.id || session.sessionId;

                return (
                  <React.Fragment key={sessionId || index}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemButton
                        onClick={() => handleViewSessionDetails(sessionId)}
                        sx={{
                          borderRadius: 2,
                          border: "1px solid #e0e0e0",
                          mb: 1,
                          p: 2,
                          "&:hover": {
                            backgroundColor: "rgba(25, 118, 210, 0.04)",
                            borderColor: "#1976d2",
                          },
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: "#1976d2" }}>
                            <PlayCircleOutline />
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
                                />
                                {(role === "organizer" ||
                                  role === "admin" ||
                                  role === "student") && (
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      console.log(
                                        "QR button clicked for session:",
                                        session
                                      );
                                      handleGenerateQR(session);
                                    }}
                                    sx={{
                                      bgcolor: "primary.main",
                                      color: "white",
                                      "&:hover": {
                                        bgcolor: "primary.dark",
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
          {/* Debug info */}
          {selectedSession && (
            <Box sx={{ mt: 2, p: 1, bgcolor: "#f5f5f5", fontSize: "12px" }}>
              <strong>Debug:</strong> Session ID:{" "}
              {selectedSession.id || selectedSession.sessionId || "N/A"}
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default EventSessions;

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
      return { text: "Chưa bắt đầu", color: "warning" };
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
    return { text: "Chưa bắt đầu", color: "warning" };
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
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          background: "linear-gradient(135deg, #f5f0ff 0%, #e8d5ff 100%)",
        }}
      >
        <CircularProgress sx={{ color: "#764ba2" }} size={50} />
        <Typography sx={{ mt: 2, color: "#764ba2", fontWeight: 600 }}>
          Đang tải danh sách phiên...
        </Typography>
      </Box>
    );
  }

  if (error || !event) {
    return (
      <Box
        sx={{
          p: 4,
          textAlign: "center",
          background: "linear-gradient(135deg, #f5f0ff 0%, #e8d5ff 100%)",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Alert severity="error" sx={{ borderRadius: 3, mb: 3, maxWidth: 600 }}>
          {error || "Không tìm thấy thông tin sự kiện"}
        </Alert>
        <Button
          variant="contained"
          onClick={handleBackToEvents}
          startIcon={<ArrowBack />}
          sx={{
            borderRadius: 3,
            px: 4,
            py: 1.5,
            background: "linear-gradient(135deg, #764ba2 0%, #9b59b6 100%)",
            "&:hover": {
              background: "linear-gradient(135deg, #9b59b6 0%, #764ba2 100%)",
            },
          }}
        >
          Quay lại danh sách
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f5f0ff 0%, #e8d5ff 100%)",
        py: { xs: 3, md: 4 },
      }}
    >
      <Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 2, md: 3 } }}>
        {/* THÔNG TIN SỰ KIỆN */}
        <Card
          sx={{
            borderRadius: "20px",
            mb: 3,
            boxShadow: "0 8px 32px rgba(118, 75, 162, 0.15)",
            background: "linear-gradient(135deg, #ffffff 0%, #f9f5ff 100%)",
            border: "1px solid rgba(118, 75, 162, 0.1)",
          }}
        >
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            {/* NÚT QUAY LẠI */}
            <Button
              variant="outlined"
              onClick={handleBackToEvent}
              startIcon={<ArrowBack />}
              sx={{
                borderRadius: 3,
                textTransform: "none",
                px: 3,
                py: 1,
                mb: 3,
                borderColor: "rgba(118, 75, 162, 0.3)",
                color: "#764ba2",
                "&:hover": {
                  borderColor: "#764ba2",
                  background: "rgba(118, 75, 162, 0.05)",
                },
              }}
            >
              Quay lại
            </Button>

            {/* THÔNG TIN SỰ KIỆN */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box>
                <Typography
                  variant="h4"
                  fontWeight={700}
                  sx={{
                    background: "linear-gradient(135deg, #764ba2 0%, #9b59b6 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    fontSize: { xs: "1.5rem", md: "2rem" },
                    mb: 1,
                  }}
                >
                  {event.title}
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mt: 2 }}>
                  <Chip
                    label={`${sessions.length} phiên`}
                    sx={{
                      background: "linear-gradient(135deg, #764ba2 0%, #9b59b6 100%)",
                      color: "white",
                      fontWeight: 600,
                    }}
                  />
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    📅{" "}
                    {formatDate(event.startDate)} -{" "}
                    {formatDate(event.endDate)}
                  </Typography>
                  {event.location && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      📍 {event.location}
                    </Typography>
                  )}
                </Box>
              </Box>

              {event.description && (
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    background: "rgba(118, 75, 162, 0.05)",
                    border: "1px solid rgba(118, 75, 162, 0.1)",
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    {event.description}
                  </Typography>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* DANH SÁCH PHIÊN */}
        <Card
          sx={{
            borderRadius: "20px",
            boxShadow: "0 8px 32px rgba(118, 75, 162, 0.15)",
            border: "1px solid rgba(118, 75, 162, 0.1)",
          }}
        >
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Typography
              variant="h6"
              fontWeight={700}
              mb={3}
              sx={{
                background: "linear-gradient(135deg, #764ba2 0%, #9b59b6 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              📋 Các phiên trong sự kiện ({sessions.length})
            </Typography>

            {sessions.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    mx: "auto",
                    mb: 2,
                    background: "linear-gradient(135deg, #764ba2 0%, #9b59b6 100%)",
                  }}
                >
                  <EventNoteIcon sx={{ fontSize: 40 }} />
                </Avatar>
                <Typography color="textSecondary">
                  Sự kiện này chưa có phiên nào được tạo.
                </Typography>
              </Box>
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
                      <ListItem sx={{ px: 0, mb: 2 }}>
                        <Card
                          sx={{
                            width: "100%",
                            borderRadius: 3,
                            border: "2px solid",
                            borderColor:
                              isCheckedIn && role === "student"
                                ? "rgba(118, 75, 162, 0.3)"
                                : "rgba(118, 75, 162, 0.15)",
                            background:
                              isCheckedIn && role === "student"
                                ? "linear-gradient(135deg, rgba(118, 75, 162, 0.08) 0%, rgba(155, 89, 182, 0.08) 100%)"
                                : "white",
                            transition: "all 0.3s ease",
                            cursor: "pointer",
                            "&:hover": {
                              borderColor: "#764ba2",
                              boxShadow: "0 4px 20px rgba(118, 75, 162, 0.2)",
                              transform: "translateY(-2px)",
                            },
                          }}
                          onClick={() => handleViewSessionDetails(sessionId)}
                        >
                          <CardContent sx={{ p: 3 }}>
                            {/* HEADER */}
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                                mb: 2,
                              }}
                            >
                              <Typography
                                variant="h6"
                                fontWeight={600}
                                sx={{
                                  flex: 1,
                                  color: "#764ba2",
                                }}
                              >
                                {session.title &&
                                session.title.trim() &&
                                session.title !== session.id &&
                                session.title !== session.sessionId &&
                                session.title !== session.SessionId &&
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
                                  gap: 1,
                                  alignItems: "center",
                                }}
                              >
                                <Chip
                                  label={status.text}
                                  color={status.color}
                                  size="small"
                                  sx={{
                                    fontWeight: 600,
                                    fontSize: "0.8rem",
                                  }}
                                />
                                {(role === "organizer" || role === "admin") && (
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleGenerateQR(session);
                                    }}
                                    sx={{
                                      background:
                                        "linear-gradient(135deg, #764ba2 0%, #9b59b6 100%)",
                                      color: "white",
                                      width: 32,
                                      height: 32,
                                      "&:hover": {
                                        background:
                                          "linear-gradient(135deg, #9b59b6 0%, #764ba2 100%)",
                                      },
                                    }}
                                  >
                                    <QrCode fontSize="small" />
                                  </IconButton>
                                )}
                              </Box>
                            </Box>

                            {/* THÔNG TIN CHI TIẾT */}
                            <Grid container spacing={2}>
                              <Grid item xs={12} sm={6}>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                  }}
                                >
                                  🕐 Bắt đầu:{" "}
                                  <strong>{formatDate(session.startTime)}</strong>
                                </Typography>
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                  }}
                                >
                                  🕐 Kết thúc:{" "}
                                  <strong>{formatDate(session.endTime)}</strong>
                                </Typography>
                              </Grid>
                              {session.location && (
                                <Grid item xs={12}>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 1,
                                    }}
                                  >
                                    📍 Địa điểm:{" "}
                                    <strong>{session.location}</strong>
                                  </Typography>
                                </Grid>
                              )}
                            </Grid>

                            {session.description && (
                              <Box
                                sx={{
                                  mt: 2,
                                  p: 2,
                                  borderRadius: 2,
                                  background: "rgba(118, 75, 162, 0.05)",
                                  borderLeft: "3px solid #764ba2",
                                }}
                              >
                                <Typography variant="body2" color="text.secondary">
                                  {session.description.length > 150
                                    ? `${session.description.substring(0, 150)}...`
                                    : session.description}
                                </Typography>
                              </Box>
                            )}
                          </CardContent>
                        </Card>
                      </ListItem>
                    </React.Fragment>
                  );
                })}
              </List>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* QR CODE DIALOG */}
      <Dialog
        open={qrDialogOpen}
        onClose={handleCloseQR}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "20px",
            boxShadow: "0 8px 32px rgba(118, 75, 162, 0.2)",
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "linear-gradient(135deg, #764ba2 0%, #9b59b6 100%)",
            color: "white",
          }}
        >
          <Typography variant="h6" fontWeight={600}>
            Tạo mã QR điểm danh
          </Typography>
          <IconButton onClick={handleCloseQR} sx={{ color: "white" }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedSession ? (
            <QRCodeGenerator session={selectedSession} event={event} />
          ) : (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <CircularProgress sx={{ color: "#764ba2" }} />
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default EventSessions;

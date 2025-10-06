// src/pages/SessionDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from "@mui/material";
import {
  ArrowBack,
  Schedule,
  LocationOn,
  Description,
  Event as EventIcon,
  Person,
  QrCode,
  CheckCircle,
} from "@mui/icons-material";
import { getSession } from "../services/eventSessionService";
import { getEvent } from "../services/eventService";

const SessionDetails = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSessionDetails = async () => {
      try {
        setLoading(true);
        console.log("🔍 SessionDetails - Loading session with ID:", sessionId);

        // Lấy thông tin phiên
        console.log("📡 Calling getSession API...");
        const sessionData = await getSession(sessionId);
        console.log("✅ Session data received:", sessionData);
        setSession(sessionData);

        // Lấy thông tin sự kiện nếu có eventId
        if (sessionData?.eventId) {
          try {
            console.log(
              "📡 Calling getEvent API with eventId:",
              sessionData.eventId
            );
            const eventData = await getEvent(sessionData.eventId);
            console.log("✅ Event data received:", eventData);
            setEvent(eventData);
          } catch (eventError) {
            console.warn("⚠️ Could not load event details:", eventError);
          }
        }
      } catch (err) {
        setError("Không thể tải thông tin phiên");
        console.error("❌ Error fetching session details:", err);
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) {
      fetchSessionDetails();
    } else {
      console.error("❌ No sessionId provided");
      setError("Không có ID phiên");
      setLoading(false);
    }
  }, [sessionId]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleBackToEvents = () => {
    navigate("/student-registered-events");
  };

  const handleBackToEvent = () => {
    navigate("/student-registered-events");
  };

  const handleCheckIn = () => {
    // Chuyển đến trang điểm danh với sessionId
    if (session?.eventId) {
      navigate(`/checkin?eventId=${session.eventId}&sessionId=${sessionId}`);
    } else {
      navigate(`/checkin?sessionId=${sessionId}`);
    }
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
          Quay lại sự kiện đã đăng ký
        </Button>
      </Box>
    );
  }

  if (!session) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">Không tìm thấy thông tin phiên</Alert>
        <Button
          variant="outlined"
          onClick={handleBackToEvents}
          sx={{ mt: 2 }}
          startIcon={<ArrowBack />}
        >
          Quay lại sự kiện đã đăng ký
        </Button>
      </Box>
    );
  }

  const isSessionActive = () => {
    const now = new Date();
    const startTime = new Date(session.startTime);
    const endTime = new Date(session.endTime);
    return now >= startTime && now <= endTime;
  };

  const getSessionStatus = () => {
    const now = new Date();
    const startTime = new Date(session.startTime);
    const endTime = new Date(session.endTime);

    if (now < startTime) return { text: "Chưa bắt đầu", color: "info" };
    if (now > endTime) return { text: "Đã kết thúc", color: "default" };
    return { text: "Đang diễn ra", color: "success" };
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1000, mx: "auto" }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <Button
          variant="outlined"
          onClick={handleBackToEvent}
          startIcon={<ArrowBack />}
          sx={{ mr: 2 }}
        >
          Quay lại sự kiện đã đăng ký
        </Button>
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
          Chi tiết phiên
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Thông tin chính của phiên */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "start",
                  mb: 2,
                }}
              >
                <Typography
                  variant="h5"
                  fontWeight={600}
                  sx={{ color: "#1976d2" }}
                >
                  {session.title || "Phiên không có tên"}
                </Typography>
                <Chip
                  label={getSessionStatus().text}
                  color={getSessionStatus().color}
                  sx={{ fontWeight: 500 }}
                />
              </Box>

              {/* Thông tin thời gian và địa điểm */}
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 2,
                    }}
                  >
                    <Schedule color="action" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Bắt đầu
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {formatDate(session.startTime)}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 2,
                    }}
                  >
                    <Schedule color="action" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Kết thúc
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {formatDate(session.endTime)}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                {session.location && (
                  <Grid item xs={12}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <LocationOn color="action" />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Địa điểm
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {session.location}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                )}
              </Grid>

              {session.description && (
                <>
                  <Divider sx={{ my: 3 }} />
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 2,
                    }}
                  >
                    <Description color="action" />
                    <Typography variant="h6" fontWeight={600}>
                      Mô tả phiên
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                    {session.description}
                  </Typography>
                </>
              )}

              {/* Nút điểm danh */}
              {isSessionActive() && (
                <>
                  <Divider sx={{ my: 3 }} />
                  <Box sx={{ textAlign: "center" }}>
                    <Button
                      variant="contained"
                      size="large"
                      onClick={handleCheckIn}
                      startIcon={<QrCode />}
                      sx={{
                        px: 4,
                        py: 1.5,
                        fontSize: "1.1rem",
                        background:
                          "linear-gradient(45deg, #4CAF50 30%, #66BB6A 90%)",
                        boxShadow: "0 3px 5px 2px rgba(76, 175, 80, .3)",
                      }}
                    >
                      Điểm danh ngay
                    </Button>
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Thông tin sự kiện (nếu có) */}
        <Grid item xs={12} lg={4}>
          {event && (
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} mb={2}>
                  Thuộc sự kiện
                </Typography>

                <List sx={{ p: 0 }}>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: "#1976d2" }}>
                        <EventIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="body1" fontWeight={500}>
                          {event.title}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            📅 {formatDate(event.startDate)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            📍 {event.location}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            👤 {event.organizerName}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          )}

          {/* Thông tin hữu ích */}
          <Card sx={{ mt: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} mb={2}>
                Lưu ý
              </Typography>

              <List sx={{ p: 0 }}>
                <ListItem sx={{ px: 0 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: "#ff9800", width: 32, height: 32 }}>
                      <QrCode fontSize="small" />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="body2">
                        Điểm danh chỉ khả dụng trong thời gian phiên diễn ra
                      </Typography>
                    }
                  />
                </ListItem>

                <ListItem sx={{ px: 0 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: "#4caf50", width: 32, height: 32 }}>
                      <CheckCircle fontSize="small" />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="body2">
                        Hãy đến đúng giờ để không bỏ lỡ nội dung quan trọng
                      </Typography>
                    }
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SessionDetails;

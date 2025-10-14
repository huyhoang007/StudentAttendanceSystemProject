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
        const sessionData = await getSession(sessionId);
        setSession(sessionData);

        if (sessionData?.eventId) {
          const eventData = await getEvent(sessionData.eventId);
          setEvent(eventData);
        }
      } catch (err) {
        setError("Không thể tải thông tin phiên");
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) fetchSessionDetails();
  }, [sessionId]);

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const handleBackToEvents = () => navigate("/student-registered-events");

  const handleCheckIn = () => {
    if (session?.eventId) {
      navigate(`/checkin?eventId=${session.eventId}&sessionId=${sessionId}`);
    } else {
      navigate(`/checkin?sessionId=${sessionId}`);
    }
  };

  const isSessionActive = () => {
    const now = new Date();
    return (
      now >= new Date(session.startTime) && now <= new Date(session.endTime)
    );
  };

  const getSessionStatus = () => {
    const now = new Date();
    const start = new Date(session.startTime);
    const end = new Date(session.endTime);
    if (now < start) return { text: "Chưa bắt đầu", color: "info" };
    if (now > end) return { text: "Đã kết thúc", color: "default" };
    return { text: "Đang diễn ra", color: "success" };
  };

  if (loading)
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "70vh",
          background: "linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)",
        }}
      >
        <CircularProgress />
      </Box>
    );

  if (error)
    return (
      <Box
        sx={{
          p: 4,
          textAlign: "center",
          background: "linear-gradient(135deg, #fce4ec 0%, #f3e5f5 100%)",
          minHeight: "70vh",
        }}
      >
        <Alert severity="error">{error}</Alert>
        <Button
          variant="outlined"
          sx={{ mt: 2 }}
          startIcon={<ArrowBack />}
          onClick={handleBackToEvents}
        >
          Quay lại sự kiện đã đăng ký
        </Button>
      </Box>
    );

  return (
    <Box
      sx={{
        p: 3,
        maxWidth: 1100,
        mx: "auto",
        background:
          "linear-gradient(135deg, #f0f9ff 0%, #e0f7fa 40%, #ede7f6 100%)",
        borderRadius: 4,
        boxShadow: "0 0 40px rgba(0,0,0,0.05)",
        animation: "fadeIn 0.6s ease-in-out",
        "@keyframes fadeIn": {
          from: { opacity: 0, transform: "translateY(20px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
      }}
    >
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <Button
          variant="outlined"
          onClick={handleBackToEvents}
          startIcon={<ArrowBack />}
          sx={{
            mr: 2,
            borderRadius: 3,
            borderColor: "#90caf9",
            "&:hover": {
              background: "linear-gradient(45deg, #64b5f6 30%, #81c784 90%)",
              color: "white",
            },
          }}
        >
          Quay lại sự kiện
        </Button>
        <Typography
          variant="h4"
          fontWeight={700}
          sx={{
            color: "transparent",
            backgroundClip: "text",
            backgroundImage: "linear-gradient(45deg, #1976d2, #9c27b0)",
          }}
        >
          Chi tiết phiên
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Phần chính */}
        <Grid item xs={12} md={8}>
          <Card
            sx={{
              borderRadius: 4,
              boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
              overflow: "hidden",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="h5" fontWeight={600} color="primary">
                  {session.title}
                </Typography>
                <Chip
                  label={getSessionStatus().text}
                  color={getSessionStatus().color}
                />
              </Box>

              {/* Thời gian & địa điểm */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
                      <Typography variant="body1" fontWeight={500}>
                        {session.location}
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>

              {/* Mô tả */}
              {session.description && (
                <>
                  <Divider sx={{ my: 3 }} />
                  <Typography
                    variant="h6"
                    fontWeight={600}
                    sx={{
                      mb: 1,
                      color: "transparent",
                      backgroundClip: "text",
                      backgroundImage:
                        "linear-gradient(45deg, #6a1b9a, #1976d2)",
                    }}
                  >
                    Mô tả phiên
                  </Typography>
                  <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                    {session.description}
                  </Typography>
                </>
              )}

              {/* Nút điểm danh */}
              {isSessionActive() && (
                <Box sx={{ textAlign: "center", mt: 4 }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleCheckIn}
                    startIcon={<QrCode />}
                    sx={{
                      borderRadius: 4,
                      px: 5,
                      py: 1.5,
                      fontSize: "1.1rem",
                      textTransform: "none",
                      background:
                        "linear-gradient(45deg, #43a047 0%, #66bb6a 100%)",
                      boxShadow: "0 4px 15px 0 rgba(76, 175, 80, 0.4)",
                      transition: "0.3s",
                      "&:hover": {
                        transform: "scale(1.05)",
                        background:
                          "linear-gradient(45deg, #2e7d32 0%, #43a047 100%)",
                      },
                    }}
                  >
                    Điểm danh ngay
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Sự kiện & lưu ý */}
        <Grid item xs={12} md={4}>
          {event && (
            <Card
              sx={{
                mb: 2,
                borderRadius: 4,
                boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} mb={2}>
                  Thuộc sự kiện
                </Typography>
                <List sx={{ p: 0 }}>
                  <ListItem disablePadding>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: "#1976d2" }}>
                        <EventIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={event.title}
                      secondary={
                        <>
                          <Typography variant="body2">
                            📅 {formatDate(event.startDate)}
                          </Typography>
                          <Typography variant="body2">
                            📍 {event.location}
                          </Typography>
                          <Typography variant="body2">
                            👤 {event.organizerName}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          )}

          <Card
            sx={{
              borderRadius: 4,
              background: "linear-gradient(135deg, #fff3e0 0%, #fce4ec 100%)",
              boxShadow: "0 6px 15px rgba(0,0,0,0.08)",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} mb={2}>
                Lưu ý
              </Typography>
              <List sx={{ p: 0 }}>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: "#ffb74d" }}>
                      <QrCode fontSize="small" />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText primary="Điểm danh chỉ khả dụng trong thời gian phiên diễn ra" />
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: "#66bb6a" }}>
                      <CheckCircle fontSize="small" />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText primary="Hãy đến đúng giờ để không bỏ lỡ nội dung quan trọng" />
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

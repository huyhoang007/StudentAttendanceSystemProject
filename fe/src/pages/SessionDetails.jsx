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
  styled, // Import styled for custom components
} from "@mui/material";
import {
  ArrowBack,
  Schedule,
  LocationOn,
  Description,
  Event as EventIcon,
  QrCode,
  CheckCircle,
  AccessTime, // Thay thế Schedule cho thời gian bắt đầu/kết thúc
} from "@mui/icons-material";
import { getSession } from "../services/eventSessionService";
import { getEvent } from "../services/eventService";

// --- CUSTOM STYLED COMPONENTS CHO GIAO DIỆN MỚI ---
const GlassCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  backdropFilter: "blur(5px)",
  backgroundColor: "rgba(255, 255, 255, 0.9)",
  boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.08)",
  border: "1px solid rgba(255, 255, 255, 0.18)",
  transition: "all 0.3s ease-in-out",
  "&:hover": {
    boxShadow: "0 10px 40px 0 rgba(0, 0, 0, 0.12)",
  },
}));

const DetailItem = ({ icon, label, value }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 2,
      mb: 1,
      p: 1.5,
      borderRadius: 2,
      backgroundColor: "rgba(0, 150, 136, 0.05)", // Màu nền nhẹ
    }}
  >
    <Avatar sx={{ bgcolor: "primary.main", width: 36, height: 36 }}>
      {icon}
    </Avatar>
    <Box>
      <Typography variant="caption" color="text.secondary" fontWeight={600}>
        {label}
      </Typography>
      <Typography variant="body1" fontWeight={600} color="text.primary">
        {value}
      </Typography>
    </Box>
  </Box>
);

// --- LOGIC CODE (GIỮ NGUYÊN) ---

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
        setError("Không thể tải thông tin phiên. Vui lòng thử lại.");
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
    if (!session) return false;
    const now = new Date();
    return (
      now >= new Date(session.startTime) && now <= new Date(session.endTime)
    );
  };

  const getSessionStatus = () => {
    if (!session) return { text: "Không rõ", color: "default" };
    const now = new Date();
    const start = new Date(session.startTime);
    const end = new Date(session.endTime);
    if (now < start) return { text: "Chưa bắt đầu", color: "info" };
    if (now > end) return { text: "Đã kết thúc", color: "default" };
    return { text: "Đang diễn ra", color: "success" };
  };

  // --- RENDERING LOADING & ERROR STATES ---
  if (loading)
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "70vh",
          background: "linear-gradient(135deg, #e0f7fa 0%, #e8eaf6 100%)",
        }}
      >
        <CircularProgress color="primary" />
        <Typography variant="h6" color="text.secondary" ml={2}>
          Đang tải chi tiết phiên...
        </Typography>
      </Box>
    );

  if (error || !session)
    return (
      <Box
        sx={{
          p: 4,
          textAlign: "center",
          background: "linear-gradient(135deg, #fce4ec 0%, #f3e5f5 100%)",
          minHeight: "70vh",
        }}
      >
        <Alert severity="error">{error || "Không tìm thấy thông tin phiên."}</Alert>
        <Button
          variant="contained"
          sx={{ mt: 3, borderRadius: 2 }}
          startIcon={<ArrowBack />}
          onClick={handleBackToEvents}
        >
          Quay lại sự kiện đã đăng ký
        </Button>
      </Box>
    );

  // --- RENDERING SUCCESS STATE (GIAO DIỆN MỚI) ---
  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        maxWidth: 1200,
        mx: "auto",
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #f0f4f8 0%, #e3f2fd 100%)", // Nền nhẹ nhàng
      }}
    >
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
        <Button
          variant="contained"
          onClick={handleBackToEvents}
          startIcon={<ArrowBack />}
          sx={{
            mr: 3,
            borderRadius: 3,
            textTransform: "none",
            bgcolor: "#00bcd4",
            "&:hover": {
              bgcolor: "#00a3b8",
            },
          }}
        >
          Quay lại Sự kiện
        </Button>
        <Typography
          variant="h4"
          fontWeight={700}
          sx={{
            color: "transparent",
            backgroundClip: "text",
            backgroundImage: "linear-gradient(45deg, #00bcd4, #2196f3)", // Màu xanh ngọc & xanh dương
          }}
        >
          Chi tiết Phiên: {session.title}
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Phần chính: Chi tiết Phiên */}
        <Grid item xs={12} md={8}>
          <GlassCard>
            <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                  pb: 1,
                  borderBottom: "2px solid #e0f7fa",
                }}
              >
                <Typography variant="h5" fontWeight={700} color="primary.dark">
                  {session.title}
                </Typography>
                <Chip
                  label={getSessionStatus().text}
                  color={getSessionStatus().color}
                  sx={{ fontWeight: 600, fontSize: "0.9rem" }}
                />
              </Box>

              {/* Thông tin Chi tiết */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <DetailItem
                    icon={<AccessTime />}
                    label="BẮT ĐẦU"
                    value={formatDate(session.startTime)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <DetailItem
                    icon={<Schedule />}
                    label="KẾT THÚC"
                    value={formatDate(session.endTime)}
                  />
                </Grid>
                {session.location && (
                  <Grid item xs={12}>
                    <DetailItem
                      icon={<LocationOn />}
                      label="ĐỊA ĐIỂM"
                      value={session.location}
                    />
                  </Grid>
                )}
              </Grid>

              {/* Mô tả */}
              {session.description && (
                <>
                  <Divider sx={{ my: 4 }} />
                  <Box
                    sx={{ display: "flex", alignItems: "center", mb: 2 }}
                  >
                    <Description color="action" sx={{ mr: 1 }} />
                    <Typography
                      variant="h6"
                      fontWeight={600}
                      color="text.secondary"
                    >
                      Mô tả chi tiết
                    </Typography>
                  </Box>
                  <Typography
                    variant="body1"
                    sx={{ lineHeight: 1.8, color: "#4a4a4a", pl: 4 }}
                  >
                    {session.description}
                  </Typography>
                </>
              )}

              {/* Nút điểm danh */}
              {isSessionActive() && (
                <Box sx={{ textAlign: "center", mt: 5 }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleCheckIn}
                    startIcon={<QrCode />}
                    sx={{
                      borderRadius: 4,
                      px: 6,
                      py: 1.8,
                      fontSize: "1.1rem",
                      fontWeight: 700,
                      textTransform: "none",
                      background:
                        "linear-gradient(45deg, #4caf50 30%, #81c784 90%)", // Gradient xanh lá
                      boxShadow: "0 6px 20px 0 rgba(76, 175, 80, 0.5)",
                      transition: "0.3s",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: "0 8px 25px 0 rgba(76, 175, 80, 0.6)",
                      },
                    }}
                  >
                    Quét Mã Điểm danh
                  </Button>
                </Box>
              )}
            </CardContent>
          </GlassCard>
        </Grid>

        {/* Cột bên phải: Sự kiện & Lưu ý */}
        <Grid item xs={12} md={4}>
          {/* Thông tin Sự kiện Gốc */}
          {event && (
            <GlassCard sx={{ mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{ display: "flex", alignItems: "center", mb: 2 }}
                >
                  <EventIcon color="secondary" sx={{ mr: 1 }} />
                  <Typography variant="h6" fontWeight={600}>
                    Thuộc sự kiện
                  </Typography>
                </Box>
                <List sx={{ p: 0 }}>
                  <ListItem disablePadding>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: "#2196f3" }}>
                        <EventIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" fontWeight={700}>
                          {event.title}
                        </Typography>
                      }
                      secondary={
                        <Box mt={0.5}>
                          <Typography variant="body2" color="text.secondary">
                            🗓️ Ngày: {formatDate(event.startDate).split(",")[0]}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                </List>
              </CardContent>
            </GlassCard>
          )}

          {/* Lưu ý */}
          <GlassCard
            sx={{
              background:
                "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 248, 225, 0.9) 100%)",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} mb={2} color="#ff9800">
                Lưu ý quan trọng
              </Typography>
              <List dense sx={{ p: 0 }}>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: "#ffb74d", width: 32, height: 32 }}>
                      <QrCode fontSize="small" />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="body2" color="text.primary">
                        Điểm danh chỉ khả dụng trong thời gian phiên diễn ra
                      </Typography>
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: "#66bb6a", width: 32, height: 32 }}>
                      <CheckCircle fontSize="small" />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="body2" color="text.primary">
                        Hãy đến sớm 10-15 phút để chuẩn bị tốt nhất
                      </Typography>
                    }
                  />
                </ListItem>
              </List>
            </CardContent>
          </GlassCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SessionDetails;
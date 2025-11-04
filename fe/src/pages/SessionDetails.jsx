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
  styled,
} from "@mui/material";
import {
  ArrowBack,
  Schedule,
  LocationOn,
  Description,
  Event as EventIcon,
  QrCode,
  CheckCircle,
  AccessTime,
} from "@mui/icons-material";
import { getSession } from "../services/eventSessionService";
import { getEvent } from "../services/eventService";

// --- CUSTOM STYLED COMPONENTS VỚI MÀU TÍM ---
const GlassCard = styled(Card)(({ theme }) => ({
  borderRadius: 20,
  backdropFilter: "blur(10px)",
  backgroundColor: "rgba(255, 255, 255, 0.95)",
  boxShadow: "0 8px 32px rgba(118, 75, 162, 0.15)",
  border: "1px solid rgba(118, 75, 162, 0.1)",
  transition: "all 0.3s ease-in-out",
  "&:hover": {
    boxShadow: "0 12px 40px rgba(118, 75, 162, 0.25)",
    transform: "translateY(-2px)",
  },
}));

const DetailItem = ({ icon, label, value }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "flex-start",
      gap: 2,
      p: 2.5,
      borderRadius: 3,
      background:
        "linear-gradient(135deg, rgba(118, 75, 162, 0.06) 0%, rgba(155, 89, 182, 0.06) 100%)",
      border: "1px solid rgba(118, 75, 162, 0.12)",
      transition: "all 0.3s ease",
      "&:hover": {
        background:
          "linear-gradient(135deg, rgba(118, 75, 162, 0.1) 0%, rgba(155, 89, 182, 0.1) 100%)",
        borderColor: "rgba(118, 75, 162, 0.25)",
        transform: "translateX(4px)",
      },
    }}
  >
    <Avatar
      sx={{
        background: "linear-gradient(135deg, #764ba2 0%, #9b59b6 100%)",
        width: { xs: 42, md: 48 },
        height: { xs: 42, md: 48 },
        boxShadow: "0 4px 12px rgba(118, 75, 162, 0.25)",
      }}
    >
      {icon}
    </Avatar>
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography
        variant="caption"
        sx={{
          color: "#764ba2",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: 1,
          fontSize: "0.7rem",
          display: "block",
          mb: 0.5,
        }}
      >
        {label}
      </Typography>
      <Typography
        variant="body1"
        fontWeight={600}
        color="text.primary"
        sx={{
          fontSize: { xs: "0.95rem", md: "1.05rem" },
          wordBreak: "break-word",
        }}
      >
        {value}
      </Typography>
    </Box>
  </Box>
);

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

  const handleBackToEvents = () => {
    // Nếu có event, quay về trang event-sessions với eventId
    if (event && event.eventId) {
      navigate(`/event-sessions/${event.eventId}`);
    } else if (session && session.eventId) {
      // Fallback: dùng eventId từ session nếu event chưa load
      navigate(`/event-sessions/${session.eventId}`);
    } else {
      // Fallback cuối cùng: quay về trang student-registered-events
      navigate("/student-registered-events");
    }
  };

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

  // --- LOADING STATE VỚI MÀU TÍM ---
  if (loading)
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          background: "linear-gradient(135deg, #f5f0ff 0%, #e8d5ff 100%)",
        }}
      >
        <CircularProgress sx={{ color: "#764ba2" }} size={50} />
        <Typography
          variant="h6"
          sx={{ ml: 2, color: "#764ba2", fontWeight: 600 }}
        >
          Đang tải chi tiết phiên...
        </Typography>
      </Box>
    );

  // --- ERROR STATE VỚI MÀU TÍM ---
  if (error || !session)
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
        <Alert
          severity="error"
          sx={{
            borderRadius: 3,
            mb: 3,
            maxWidth: 600,
            boxShadow: "0 4px 20px rgba(244, 67, 54, 0.2)",
          }}
        >
          {error || "Không tìm thấy thông tin phiên."}
        </Alert>
        <Button
          variant="contained"
          startIcon={<ArrowBack />}
          onClick={handleBackToEvents}
          sx={{
            borderRadius: 3,
            px: 4,
            py: 1.5,
            background: "linear-gradient(135deg, #764ba2 0%, #9b59b6 100%)",
            boxShadow: "0 4px 15px rgba(118, 75, 162, 0.3)",
            "&:hover": {
              background: "linear-gradient(135deg, #9b59b6 0%, #764ba2 100%)",
              boxShadow: "0 6px 20px rgba(118, 75, 162, 0.4)",
            },
          }}
        >
          Quay lại sự kiện đã đăng ký
        </Button>
      </Box>
    );

  // --- SUCCESS STATE VỚI FULL WIDTH & RESPONSIVE ---
  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f5f0ff 0%, #e8d5ff 100%)",
        py: { xs: 3, md: 4 },
      }}
    >
      {/* CONTENT */}
      <Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 2, md: 3 } }}>
        {/* TIÊU ĐỀ & TRẠNG THÁI VỚI NÚT QUAY LẠI */}
        <GlassCard sx={{ mb: 4 }}>
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            {/* NÚT QUAY LẠI */}
            <Button
              variant="outlined"
              onClick={handleBackToEvents}
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
                transition: "all 0.3s ease",
              }}
            >
              Quay lại
            </Button>

            {/* TIÊU ĐỀ & TRẠNG THÁI */}
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                justifyContent: "space-between",
                alignItems: { xs: "flex-start", sm: "center" },
                gap: 2,
              }}
            >
              <Box sx={{ flex: 1 }}>
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
                  {session.title}
                </Typography>
                {event && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
                    <EventIcon sx={{ fontSize: 18, color: "#764ba2" }} />
                    <Typography variant="body2" color="text.secondary">
                      Thuộc sự kiện: <strong>{event.title}</strong>
                    </Typography>
                  </Box>
                )}
              </Box>
              <Chip
                label={getSessionStatus().text}
                color={
                  getSessionStatus().text === "Chưa bắt đầu"
                    ? "warning"
                    : getSessionStatus().color
                }
                sx={{
                  fontWeight: 600,
                  fontSize: { xs: "0.85rem", md: "0.95rem" },
                  px: 2.5,
                  py: 2.5,
                  borderRadius: 2,
                  height: "auto",
                }}
              />
            </Box>
          </CardContent>
        </GlassCard>

        {/* THÔNG TIN THỜI GIAN & ĐỊA ĐIỂM */}
        <GlassCard sx={{ mb: 4 }}>
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Typography
              variant="h6"
              fontWeight={700}
              sx={{
                mb: 3,
                background: "linear-gradient(135deg, #764ba2 0%, #9b59b6 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              📅 Thông tin thời gian
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <DetailItem
                  icon={<AccessTime />}
                  label="Thời gian bắt đầu"
                  value={formatDate(session.startTime)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <DetailItem
                  icon={<Schedule />}
                  label="Thời gian kết thúc"
                  value={formatDate(session.endTime)}
                />
              </Grid>
              {session.location && (
                <Grid item xs={12}>
                  <DetailItem
                    icon={<LocationOn />}
                    label="Địa điểm tổ chức"
                    value={session.location}
                  />
                </Grid>
              )}
            </Grid>
          </CardContent>
        </GlassCard>

        {/* MÔ TẢ CHI TIẾT */}
        {session.description && (
          <GlassCard sx={{ mb: 4 }}>
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                <Avatar
                  sx={{
                    bgcolor: "transparent",
                    border: "2px solid #764ba2",
                    color: "#764ba2",
                    width: 48,
                    height: 48,
                  }}
                >
                  <Description />
                </Avatar>
                <Typography
                  variant="h6"
                  fontWeight={700}
                  sx={{
                    background: "linear-gradient(135deg, #764ba2 0%, #9b59b6 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Mô tả chi tiết
                </Typography>
              </Box>
              <Box
                sx={{
                  p: 3,
                  borderRadius: 3,
                  background: "rgba(118, 75, 162, 0.03)",
                  border: "1px solid rgba(118, 75, 162, 0.1)",
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    lineHeight: 2,
                    color: "#4a4a4a",
                    fontSize: { xs: "0.95rem", md: "1.05rem" },
                  }}
                >
                  {session.description}
                </Typography>
              </Box>
            </CardContent>
          </GlassCard>
        )}

        {/* LƯU Ý QUAN TRỌNG */}
        <GlassCard
          sx={{
            mb: 4,
            background:
              "linear-gradient(135deg, rgba(255, 235, 59, 0.08) 0%, rgba(255, 193, 7, 0.08) 100%)",
            border: "2px solid rgba(255, 193, 7, 0.3)",
          }}
        >
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Typography
              variant="h6"
              fontWeight={700}
              sx={{
                mb: 3,
                color: "#f57c00",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              ⚠️ Lưu ý quan trọng
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    p: 2,
                    borderRadius: 2,
                    background: "rgba(255, 255, 255, 0.8)",
                  }}
                >
                  <Avatar
                    sx={{
                      background: "linear-gradient(135deg, #764ba2 0%, #9b59b6 100%)",
                      width: 40,
                      height: 40,
                    }}
                  >
                    <QrCode fontSize="small" />
                  </Avatar>
                  <Typography variant="body2" color="text.primary" sx={{ flex: 1 }}>
                    Điểm danh chỉ khả dụng trong thời gian phiên diễn ra
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    p: 2,
                    borderRadius: 2,
                    background: "rgba(255, 255, 255, 0.8)",
                  }}
                >
                  <Avatar
                    sx={{
                      background: "linear-gradient(135deg, #8e44ad 0%, #9b59b6 100%)",
                      width: 40,
                      height: 40,
                    }}
                  >
                    <CheckCircle fontSize="small" />
                  </Avatar>
                  <Typography variant="body2" color="text.primary" sx={{ flex: 1 }}>
                    Hãy đến sớm 10-15 phút để chuẩn bị tốt nhất
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </GlassCard>

        {/* NÚT ĐIỂM DANH */}
        {isSessionActive() && localStorage.getItem("role") === "student" && (
          <Box sx={{ textAlign: "center", mb: 2 }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleCheckIn}
              startIcon={<QrCode sx={{ fontSize: 28 }} />}
              sx={{
                borderRadius: 4,
                px: { xs: 4, md: 8 },
                py: 2.5,
                fontSize: { xs: "1rem", md: "1.15rem" },
                fontWeight: 700,
                textTransform: "none",
                background: "linear-gradient(135deg, #764ba2 0%, #9b59b6 100%)",
                boxShadow: "0 8px 25px rgba(118, 75, 162, 0.4)",
                transition: "all 0.3s ease",
                width: { xs: "100%", sm: "auto" },
                minWidth: 300,
                "&:hover": {
                  transform: "translateY(-3px)",
                  boxShadow: "0 12px 35px rgba(118, 75, 162, 0.5)",
                  background: "linear-gradient(135deg, #9b59b6 0%, #764ba2 100%)",
                },
              }}
            >
              Quét Mã Điểm Danh
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default SessionDetails;

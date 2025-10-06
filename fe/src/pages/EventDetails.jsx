// src/pages/EventDetails.jsx
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
  List,
  ListItem,
  ListItemText,
  ListItemButton,
} from "@mui/material";
import {
  Event as EventIcon,
  DateRange,
  LocationOn,
  Person,
  Schedule,
  ArrowBack,
  PlayCircleOutline,
} from "@mui/icons-material";
import { getEvent } from "../services/eventService";
import { getSessionsByEvent } from "../services/eventSessionService";

const EventDetails = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setLoading(true);

        // Lấy thông tin sự kiện
        const eventData = await getEvent(eventId);
        setEvent(eventData);

        // Lấy danh sách phiên của sự kiện
        try {
          const sessionsData = await getSessionsByEvent(eventId);
          setSessions(sessionsData || []);
        } catch (sessionError) {
          console.warn("Could not load sessions:", sessionError);
          setSessions([]);
        }
      } catch (err) {
        setError("Không thể tải thông tin sự kiện");
        console.error("Error fetching event details:", err);
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchEventDetails();
    }
  }, [eventId]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleViewSessionDetails = (sessionId) => {
    navigate(`/session-details/${sessionId}`);
  };

  const handleBackToEvents = () => {
    navigate("/student-registered-events");
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
    <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <Button
          variant="outlined"
          onClick={handleBackToEvents}
          startIcon={<ArrowBack />}
          sx={{ mr: 2 }}
        >
          Quay lại
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
          <EventIcon fontSize="large" />
          Chi tiết sự kiện
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Thông tin chính của sự kiện */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ height: "fit-content" }}>
            <CardContent sx={{ p: 3 }}>
              <Typography
                variant="h5"
                fontWeight={600}
                mb={3}
                sx={{ color: "#1976d2" }}
              >
                {event.title}
              </Typography>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 2,
                    }}
                  >
                    <DateRange color="action" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Bắt đầu
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {formatDate(event.startDate)}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
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
                        {formatDate(event.endDate)}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 2,
                    }}
                  >
                    <LocationOn color="action" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Địa điểm
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {event.location}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 2,
                    }}
                  >
                    <Person color="action" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Người tổ chức
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {event.organizerName || "Chưa xác định"}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>

              <Box sx={{ mb: 3 }}>
                <Chip
                  label={`Sức chứa: ${event.capacity}`}
                  color="primary"
                  variant="outlined"
                  sx={{ mr: 1, mb: 1 }}
                />
                <Chip
                  label={(() => {
                    const eventStartDate = new Date(event.startDate);
                    const eventEndDate = new Date(event.endDate);
                    const today = new Date();

                    // Reset time to compare only dates
                    const todayDate = new Date(
                      today.getFullYear(),
                      today.getMonth(),
                      today.getDate()
                    );
                    const eventStartDateOnly = new Date(
                      eventStartDate.getFullYear(),
                      eventStartDate.getMonth(),
                      eventStartDate.getDate()
                    );
                    const eventEndDateOnly = new Date(
                      eventEndDate.getFullYear(),
                      eventEndDate.getMonth(),
                      eventEndDate.getDate()
                    );

                    if (eventStartDateOnly > todayDate) {
                      return "Sắp diễn ra";
                    } else if (
                      eventEndDateOnly >= todayDate &&
                      eventStartDateOnly <= todayDate
                    ) {
                      return "Đang diễn ra";
                    } else {
                      return "Đã kết thúc";
                    }
                  })()}
                  color={(() => {
                    const eventStartDate = new Date(event.startDate);
                    const eventEndDate = new Date(event.endDate);
                    const today = new Date();

                    // Reset time to compare only dates
                    const todayDate = new Date(
                      today.getFullYear(),
                      today.getMonth(),
                      today.getDate()
                    );
                    const eventStartDateOnly = new Date(
                      eventStartDate.getFullYear(),
                      eventStartDate.getMonth(),
                      eventStartDate.getDate()
                    );
                    const eventEndDateOnly = new Date(
                      eventEndDate.getFullYear(),
                      eventEndDate.getMonth(),
                      eventEndDate.getDate()
                    );

                    if (eventStartDateOnly > todayDate) {
                      return "info";
                    } else if (
                      eventEndDateOnly >= todayDate &&
                      eventStartDateOnly <= todayDate
                    ) {
                      return "success";
                    } else {
                      return "default";
                    }
                  })()}
                  sx={{ mb: 1 }}
                />
              </Box>

              {event.description && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" fontWeight={600} mb={2}>
                    Mô tả
                  </Typography>
                  <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                    {event.description}
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Danh sách phiên */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} mb={2}>
                Phiên sự kiện ({sessions.length})
              </Typography>

              {sessions.length === 0 ? (
                <Alert severity="info" sx={{ mb: 2 }}>
                  Sự kiện này chưa có phiên nào được tạo.
                </Alert>
              ) : (
                <List sx={{ p: 0 }}>
                  {sessions.map((session, index) => (
                    <React.Fragment
                      key={session.id || session.sessionId || index}
                    >
                      <ListItemButton
                        onClick={() =>
                          handleViewSessionDetails(
                            session.id || session.sessionId
                          )
                        }
                        sx={{
                          borderRadius: 1,
                          mb: 1,
                          "&:hover": {
                            backgroundColor: "rgba(25, 118, 210, 0.04)",
                          },
                        }}
                      >
                        <PlayCircleOutline sx={{ mr: 2, color: "#1976d2" }} />
                        <ListItemText
                          primary={
                            <Typography variant="body1" fontWeight={500}>
                              {session.title &&
                              session.title.trim() &&
                              session.title !== session.id &&
                              session.title !== session.sessionId &&
                              !session.title.match(
                                /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i
                              )
                                ? session.title
                                : `Phiên ${index + 1}`}
                            </Typography>
                          }
                          secondary={
                            <Box>
                              {session.startTime && (
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {formatDate(session.startTime)}
                                </Typography>
                              )}
                              {session.location && (
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  📍 {session.location}
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                      </ListItemButton>
                      {index < sessions.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}

              {sessions.length > 0 && (
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => navigate(`/event-sessions/${eventId}`)}
                  sx={{ mt: 2 }}
                >
                  Xem tất cả phiên
                </Button>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EventDetails;

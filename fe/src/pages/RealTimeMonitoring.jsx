// src/pages/RealTimeMonitoring.jsx

import React, { useEffect, useState } from "react";
import {
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
  LinearProgress,
} from "@mui/material";
import {
  MonitorHeart,
  Refresh,
  People,
  EventNote,
  CheckCircle,
  Cancel,
  AccessTime,
  TrendingUp,
} from "@mui/icons-material";
import { getEvents } from "../services/eventService";
import { getEventSessions } from "../services/eventSessionService";
import { getCheckIns } from "../services/sessionCheckInService";

const RealTimeMonitoring = () => {
  const [events, setEvents] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [checkIns, setCheckIns] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [loading, setLoading] = useState(false);

  // Auto refresh every 5 seconds when enabled
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchCheckIns();
        setLastUpdate(new Date());
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, selectedSessionId]);

  const fetchEvents = async () => {
    try {
      const data = await getEvents();
      setEvents(data);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const fetchSessions = async (eventId) => {
    try {
      const data = await getEventSessions(eventId);
      setSessions(data);
    } catch (error) {
      console.error("Error fetching sessions:", error);
    }
  };

  const fetchCheckIns = async () => {
    if (!selectedSessionId) return;

    setLoading(true);
    try {
      const data = await getCheckIns();
      // Filter check-ins for selected session
      const filteredCheckIns = data.filter(
        (c) => c.session_id === selectedSessionId
      );
      setCheckIns(filteredCheckIns);
    } catch (error) {
      console.error("Error fetching check-ins:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      fetchSessions(selectedEventId);
      setSelectedSessionId(""); // Reset session selection
    }
  }, [selectedEventId]);

  useEffect(() => {
    if (selectedSessionId) {
      fetchCheckIns();
    }
  }, [selectedSessionId]);

  // Calculate statistics
  const selectedSession = sessions.find(
    (s) => s.sessionId === selectedSessionId
  );
  const totalRegistered = selectedSession?.maxParticipants || 0;
  const checkedIn = checkIns.length;
  const checkInRate =
    totalRegistered > 0 ? Math.round((checkedIn / totalRegistered) * 100) : 0;
  const recentCheckIns = checkIns.filter(
    (c) => new Date(c.checkin_time) > new Date(Date.now() - 5 * 60 * 1000) // Last 5 minutes
  );

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2 }}>
        <MonitorHeart sx={{ fontSize: 40, color: "#74ebd5" }} />
        <Typography variant="h5" fontWeight={700} color="#3a3a3a">
          Theo dõi Check-in Real-time
        </Typography>
        <Chip
          label={`Cập nhật: ${lastUpdate.toLocaleTimeString()}`}
          color="info"
          size="small"
        />
      </Box>

      {/* Controls */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Chọn sự kiện</InputLabel>
              <Select
                value={selectedEventId}
                label="Chọn sự kiện"
                onChange={(e) => setSelectedEventId(e.target.value)}
              >
                <MenuItem value="">Chọn sự kiện...</MenuItem>
                {events.map((event) => (
                  <MenuItem key={event.eventId} value={event.eventId}>
                    {event.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth disabled={!selectedEventId}>
              <InputLabel>Chọn phiên</InputLabel>
              <Select
                value={selectedSessionId}
                label="Chọn phiên"
                onChange={(e) => setSelectedSessionId(e.target.value)}
              >
                <MenuItem value="">Chọn phiên...</MenuItem>
                {sessions.map((session) => (
                  <MenuItem key={session.sessionId} value={session.sessionId}>
                    {session.sessionName} -{" "}
                    {new Date(session.startTime).toLocaleString()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    color="primary"
                  />
                }
                label="Auto refresh"
              />
              <IconButton
                onClick={() => {
                  fetchCheckIns();
                  setLastUpdate(new Date());
                }}
                color="primary"
                disabled={!selectedSessionId}
              >
                <Refresh />
              </IconButton>
            </Box>
          </Grid>
        </Grid>
      </Card>

      {/* Statistics Cards */}
      {selectedSessionId && (
        <>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                }}
              >
                <CardContent sx={{ color: "white", textAlign: "center" }}>
                  <People sx={{ fontSize: 32, mb: 1 }} />
                  <Typography variant="h4" fontWeight={700}>
                    {totalRegistered}
                  </Typography>
                  <Typography variant="body2">Đã đăng ký</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  background:
                    "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
                }}
              >
                <CardContent sx={{ color: "white", textAlign: "center" }}>
                  <CheckCircle sx={{ fontSize: 32, mb: 1 }} />
                  <Typography variant="h4" fontWeight={700}>
                    {checkedIn}
                  </Typography>
                  <Typography variant="body2">Đã check-in</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  background:
                    "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                }}
              >
                <CardContent sx={{ color: "white", textAlign: "center" }}>
                  <TrendingUp sx={{ fontSize: 32, mb: 1 }} />
                  <Typography variant="h4" fontWeight={700}>
                    {checkInRate}%
                  </Typography>
                  <Typography variant="body2">Tỷ lệ check-in</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  background:
                    "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                }}
              >
                <CardContent sx={{ color: "white", textAlign: "center" }}>
                  <AccessTime sx={{ fontSize: 32, mb: 1 }} />
                  <Typography variant="h4" fontWeight={700}>
                    {recentCheckIns.length}
                  </Typography>
                  <Typography variant="body2">5 phút gần đây</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Progress Bar */}
          <Card sx={{ mb: 3, p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Tiến độ check-in: {checkedIn}/{totalRegistered} ({checkInRate}%)
            </Typography>
            <LinearProgress
              variant="determinate"
              value={checkInRate}
              sx={{ height: 10, borderRadius: 5 }}
              color={
                checkInRate > 80
                  ? "success"
                  : checkInRate > 50
                  ? "warning"
                  : "error"
              }
            />
          </Card>

          {/* Loading indicator */}
          {loading && <LinearProgress sx={{ mb: 2 }} />}

          {/* Recent Activity Alert */}
          {recentCheckIns.length > 0 && (
            <Alert severity="info" sx={{ mb: 2 }}>
              🔥 {recentCheckIns.length} check-in mới trong 5 phút qua!
            </Alert>
          )}
        </>
      )}

      {/* Live Check-ins Table */}
      {selectedSessionId && (
        <Card sx={{ background: "#fff", borderRadius: 3, boxShadow: 2, p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Live Check-ins - {selectedSession?.sessionName}
          </Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Sinh viên ID</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>
                  Thời gian check-in
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Phương thức</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Trạng thái</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Gần đây</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {checkIns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                    <Typography color="textSecondary">
                      Chưa có check-in nào
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                checkIns
                  .sort(
                    (a, b) =>
                      new Date(b.checkin_time) - new Date(a.checkin_time)
                  )
                  .map((checkIn) => {
                    const isRecent =
                      new Date(checkIn.checkin_time) >
                      new Date(Date.now() - 5 * 60 * 1000);
                    return (
                      <TableRow
                        key={checkIn.checkin_id}
                        sx={{
                          backgroundColor: isRecent ? "#e8f5e8" : "transparent",
                          animation: isRecent ? "fadeIn 0.5s ease-in" : "none",
                        }}
                      >
                        <TableCell>{checkIn.student_id}</TableCell>
                        <TableCell>
                          {new Date(checkIn.checkin_time).toLocaleString(
                            "vi-VN"
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={
                              checkIn.method === "qr" ? "QR Code" : "Thủ công"
                            }
                            color={
                              checkIn.method === "qr" ? "primary" : "secondary"
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={<CheckCircle />}
                            label="Thành công"
                            color="success"
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {isRecent && (
                            <Chip
                              label="Mới"
                              color="warning"
                              size="small"
                              sx={{ animation: "pulse 1s infinite" }}
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
              )}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* CSS for animations */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
          }
        `}
      </style>
    </Box>
  );
};

export default RealTimeMonitoring;

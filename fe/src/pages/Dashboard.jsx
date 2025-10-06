// src/pages/Dashboard.jsx

import React, { useState, useEffect } from "react";
import {
  Typography,
  Box,
  Card,
  Avatar,
  Grid,
  CardContent,
  Chip,
  Button,
  CircularProgress,
} from "@mui/material";
import {
  Event as EventIcon,
  Group as GroupIcon,
  AccessTime as TimeIcon,
  Assessment as ReportIcon,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user, role, organizerId } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalSessions: 0,
    totalStudents: 0,
    upcomingEvents: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (role === "organizer" && organizerId) {
      fetchOrganizerStats();
    } else {
      setLoading(false);
    }
  }, [role, organizerId]);

  const fetchOrganizerStats = async () => {
    try {
      // Fetch events by organizer
      console.log("[Dashboard] Fetching events for organizerId:", organizerId);
      const eventsRes = await fetch(`/api/event/by-organizer/${organizerId}`);
      const events = await eventsRes.json();

      console.log("[Dashboard] Received events:", events);
      console.log("[Dashboard] Events length:", events?.length);

      let totalSessions = 0;
      let totalStudents = 0;
      let upcomingEvents = 0;

      for (const event of events) {
        console.log("[Dashboard] Processing event:", event);
        console.log("[Dashboard] Event ID:", event.EventId || event.eventId);

        // Count sessions for this event
        try {
          const eventId = event.EventId || event.eventId;
          if (!eventId) {
            console.warn("[Dashboard] Event missing ID:", event);
            continue;
          }

          const sessionsRes = await fetch(
            `/api/EventSession/by-event/${eventId}`
          );
          const sessions = await sessionsRes.json();
          totalSessions += sessions.length;
        } catch (error) {
          console.error("Error fetching sessions:", error);
        }

        // Count students for this event
        try {
          const eventId = event.EventId || event.eventId;
          if (!eventId) {
            continue;
          }

          const studentsRes = await fetch(
            `/api/StudentInEvent/by-event/${eventId}`
          );
          const students = await studentsRes.json();
          totalStudents += students.length;
        } catch (error) {
          console.error("Error fetching students:", error);
        }

        // Check if event is upcoming
        const eventStartDate = new Date(event.StartDate);
        if (eventStartDate > new Date()) {
          upcomingEvents++;
        }
      }

      setStats({
        totalEvents: events.length,
        totalSessions,
        totalStudents,
        upcomingEvents,
      });
    } catch (error) {
      console.error("Error fetching organizer stats:", error);
    } finally {
      setLoading(false);
    }
  };

  // Student/Admin Dashboard
  if (role !== "organizer") {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "70vh",
        }}
      >
        <Card
          elevation={8}
          sx={{
            p: 5,
            borderRadius: 6,
            minWidth: 400,
            maxWidth: 500,
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            background: "linear-gradient(135deg, #74ebd5 0%, #ACB6E5 100%)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Avatar sx={{ bgcolor: "#fff", width: 72, height: 72, mb: 2 }}>
              <img
                src="https://img.icons8.com/fluency/64/000000/student-center.png"
                alt="dashboard"
                style={{ width: 56, height: 56 }}
              />
            </Avatar>
            <Typography
              variant="h4"
              fontWeight={700}
              color="#3a3a3a"
              align="center"
              mb={1}
            >
              Student Attendance System
            </Typography>
            <Typography
              variant="h6"
              color="#5a5a5a"
              align="center"
              sx={{ lineHeight: 1.5 }}
            >
              Chào mừng {user?.firstName} {user?.lastName}!
            </Typography>
            <Chip
              label={role === "admin" ? "Quản trị viên" : "Sinh viên"}
              color="primary"
              sx={{ mt: 2 }}
            />
          </Box>
        </Card>
      </Box>
    );
  }

  // Event Organizer Dashboard
  return (
    <Box sx={{ p: 3 }}>
      <Typography
        variant="h4"
        sx={{ mb: 3, color: "#1976d2", fontWeight: 600 }}
      >
        Dashboard Người tổ chức sự kiện
      </Typography>

      <Typography variant="h6" sx={{ mb: 2, color: "#666" }}>
        Chào mừng {user?.firstName} {user?.lastName}!
      </Typography>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Statistics Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: "#e3f2fd" }}>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <EventIcon sx={{ fontSize: 40, color: "#1976d2", mr: 2 }} />
                    <Box>
                      <Typography variant="h4" fontWeight={600}>
                        {stats.totalEvents}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Tổng sự kiện
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: "#f3e5f5" }}>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <TimeIcon sx={{ fontSize: 40, color: "#9c27b0", mr: 2 }} />
                    <Box>
                      <Typography variant="h4" fontWeight={600}>
                        {stats.totalSessions}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Tổng phiên
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: "#e8f5e8" }}>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <GroupIcon sx={{ fontSize: 40, color: "#4caf50", mr: 2 }} />
                    <Box>
                      <Typography variant="h4" fontWeight={600}>
                        {stats.totalStudents}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Sinh viên tham gia
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: "#fff3e0" }}>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <ReportIcon
                      sx={{ fontSize: 40, color: "#ff9800", mr: 2 }}
                    />
                    <Box>
                      <Typography variant="h4" fontWeight={600}>
                        {stats.upcomingEvents}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Sự kiện sắp tới
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
};

export default Dashboard;

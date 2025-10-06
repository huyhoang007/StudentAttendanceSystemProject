// src/pages/Report.jsx

import React, { useEffect, useState, useCallback } from "react";
import {
  Typography,
  Box,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Card,
  CardContent,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Divider,
} from "@mui/material";
import {
  FileDownload,
  PictureAsPdf,
  Assessment,
  TrendingUp,
  Group,
  School,
  EventNote,
} from "@mui/icons-material";
import { exportExcel, exportPDF } from "../services/reportService";
import { getCheckIns } from "../services/sessionCheckInService";
import { getEvents } from "../services/eventService";
import { getUniversities } from "../services/universityService";
import { useAuth } from "../contexts/AuthContext";

const Report = () => {
  const { user, role } = useAuth();
  const [data, setData] = useState([]);
  const [events, setEvents] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    eventId: "",
    universityId: "",
  });

  // Debug user and role immediately
  console.log("Report component - User and Role:", {
    user: user,
    role: role,
    userType: typeof user,
    roleType: typeof role
  });

  // Debug user object structure in detail
  if (user) {
    console.log("User object details:", {
      userKeys: Object.keys(user),
      universityId: user.universityId,
      UniversityId: user.UniversityId,
      organizerId: user.organizerId,
      OrganizerId: user.OrganizerId,
      university: user.university,
      University: user.University
    });
  }

  // Debug universities state changes
  useEffect(() => {
    console.log("Universities state changed:", {
      count: universities.length,
      universities: universities
    });
  }, [universities]);

  const fetchData = async () => {
    try {
      console.log("Fetching check-ins data for report...");
      const res = await getCheckIns();
      console.log("Check-ins response:", res);

      // Kiểm tra xem có dữ liệu thật không
      if (res && Array.isArray(res) && res.length > 0) {
        setData([...res]);
      } else {
        // Nếu không có dữ liệu thật, sử dụng mock data
        console.log("No real data, using mock data for report");
        const mockData = [
          {
            checkin_id: 1,
            session_id: "PHIEN_001",
            student_id: "SV001",
            checkin_time: "2025-10-06T10:30:00.000Z",
            method: "qr",
            event_id: "EVENT_001",
            university_id: "UNI_001",
          },
          {
            checkin_id: 2,
            session_id: "PHIEN_002",
            student_id: "SV002",
            checkin_time: "2025-10-05T14:15:00.000Z",
            method: "manual",
            event_id: "EVENT_002",
            university_id: "UNI_001",
          },
          {
            checkin_id: 3,
            session_id: "PHIEN_003",
            student_id: "SV003",
            checkin_time: "2025-10-04T09:00:00.000Z",
            method: "qr",
            event_id: "EVENT_001",
            university_id: "UNI_002",
          },
        ];
        setData(mockData);
      }
    } catch (error) {
      console.error("Error fetching check-ins:", error);
      // Fallback to mock data on error
      const mockData = [
        {
          checkin_id: 1,
          session_id: "PHIEN_001",
          student_id: "SV001",
          checkin_time: "2025-10-06T10:30:00.000Z",
          method: "qr",
          event_id: "EVENT_001",
          university_id: "UNI_001",
        },
      ];
      setData(mockData);
    }
  };

  const fetchEvents = async () => {
    const res = await getEvents();
    setEvents([...res]);
  };

  const fetchUniversities = useCallback(async () => {
    try {
      console.log("fetchUniversities - Debug user info:", {
        user: user,
        role: role,
        userUniversityId: user?.universityId,
        userUniversityID: user?.UniversityId,
        userOrgId: user?.organizerId
      });
      
      const res = await getUniversities();
      console.log("All universities from API:", res);
      
      let filteredUniversities = [...res];
      
      // SECURITY: If user is organizer, only show their university
      if (role === 'organizer' && user?.universityId) {
        filteredUniversities = res.filter(uni => 
          (uni.universityId || uni.id) === user.universityId
        );
        console.log("Organizer university filter applied:", {
          userUniversityId: user.universityId,
          allUniversities: res.length,
          filteredUniversities: filteredUniversities.length,
          filtered: filteredUniversities
        });
      } else {
        console.log("No university filter applied:", {
          role: role,
          hasUniversityId: !!user?.universityId,
          reason: role !== 'organizer' ? 'Not organizer role' : 'No universityId'
        });
      }
      
      setUniversities(filteredUniversities);
    } catch (error) {
      console.error("Error fetching universities:", error);
      setUniversities([]);
    }
  }, [role, user]);

  useEffect(() => {
    console.log("useEffect triggered with:", { role, user });
    fetchData();
    fetchEvents();
    fetchUniversities();
  }, [role, user, fetchUniversities]);

  // Filter data based on selected filters
  const filteredData = data.filter((item) => {
    const checkinTime =
      item.checkinTime || item.checkin_time || item.CheckinTime;

    // Debug logging
    console.log("Filter debug:", {
      item: item,
      filters: filters,
      events: events,
      eventsCount: events?.length || 0,
      eventCheck: !filters.eventId || "will check below",
      universityCheck:
        !filters.universityId ||
        (item.universityId || item.university_id) === filters.universityId,
    });

    if (
      filters.startDate &&
      new Date(checkinTime) < new Date(filters.startDate)
    )
      return false;
    if (filters.endDate && new Date(checkinTime) > new Date(filters.endDate))
      return false;

    // Check event filter - TEMPORARILY DISABLED FOR TESTING
    // Event filter is disabled to debug the issue
    // Will re-enable after fixing the dropdown data
    
    /* Event filter code - commented out
    if (filters.eventId) {
      // Event filtering logic here
    }
    */

    // Check university filter - TEMPORARILY DISABLED 
    // Data doesn't contain university info, so this filter always fails
    /*
    if (
      filters.universityId &&
      (item.universityId || item.university_id) !== filters.universityId
    ) {
      console.log("University filter failed:", {
        filterUniversityId: filters.universityId,
        itemUniversityId: item.universityId,
        item_university_id: item.university_id,
      });
      return false;
    }
    */

    return true;
  });

  // Analytics calculations
  const analytics = {
    totalCheckIns: filteredData.length,
    uniqueStudents: new Set(
      filteredData.map(
        (d) => d.studentInEventId || d.studentId || d.student_id || d.id
      )
    ).size,
    uniqueEvents: new Set(
      filteredData.map(
        (d) => d.eventId || d.event_id || d.sessionId || d.session_id
      )
    ).size,
    averageCheckInsPerEvent:
      filteredData.length > 0
        ? Math.round(
            (filteredData.length /
              new Set(
                filteredData.map(
                  (d) => d.eventId || d.event_id || d.sessionId || d.session_id
                )
              ).size) *
              100
          ) / 100
        : 0,
    methodBreakdown: {
      qr: filteredData.filter(
        (d) =>
          (d.method || d.Method) === "qr" || (d.method || d.Method) === "QR"
      ).length,
      manual: filteredData.filter(
        (d) =>
          (d.method || d.Method) === "manual" ||
          (d.method || d.Method) === "Manual" ||
          !(d.method || d.Method)
      ).length,
    },
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2 }}>
        <Assessment sx={{ fontSize: 40, color: "#74ebd5" }} />
        <Typography variant="h5" fontWeight={700} color="#3a3a3a">
          Báo cáo & Thống kê
        </Typography>
      </Box>

      {/* Analytics Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            }}
          >
            <CardContent sx={{ color: "white", textAlign: "center" }}>
              <TrendingUp sx={{ fontSize: 32, mb: 1 }} />
              <Typography variant="h4" fontWeight={700}>
                {analytics.totalCheckIns}
              </Typography>
              <Typography variant="body2">Tổng Check-ins</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
            }}
          >
            <CardContent sx={{ color: "white", textAlign: "center" }}>
              <Group sx={{ fontSize: 32, mb: 1 }} />
              <Typography variant="h4" fontWeight={700}>
                {analytics.uniqueStudents}
              </Typography>
              <Typography variant="body2">Sinh viên tham gia</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
            }}
          >
            <CardContent sx={{ color: "white", textAlign: "center" }}>
              <EventNote sx={{ fontSize: 32, mb: 1 }} />
              <Typography variant="h4" fontWeight={700}>
                {analytics.uniqueEvents}
              </Typography>
              <Typography variant="body2">Sự kiện</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
            }}
          >
            <CardContent sx={{ color: "white", textAlign: "center" }}>
              <School sx={{ fontSize: 32, mb: 1 }} />
              <Typography variant="h4" fontWeight={700}>
                {analytics.averageCheckInsPerEvent}
              </Typography>
              <Typography variant="body2">TB Check-in/Sự kiện</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Bộ lọc
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Từ ngày"
              type="date"
              fullWidth
              value={filters.startDate}
              onChange={(e) =>
                setFilters({ ...filters, startDate: e.target.value })
              }
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Đến ngày"
              type="date"
              fullWidth
              value={filters.endDate}
              onChange={(e) =>
                setFilters({ ...filters, endDate: e.target.value })
              }
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Sự kiện</InputLabel>
              <Select
                value={filters.eventId}
                label="Sự kiện"
                onChange={(e) =>
                  setFilters({ ...filters, eventId: e.target.value })
                }
              >
                <MenuItem value="">Tất cả</MenuItem>
                {events.map((event) => (
                  <MenuItem key={event.eventId} value={event.eventId}>
                    {event.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Trường</InputLabel>
              <Select
                value={filters.universityId}
                label="Trường"
                onChange={(e) =>
                  setFilters({ ...filters, universityId: e.target.value })
                }
              >
                <MenuItem value="">Tất cả</MenuItem>
                {universities.map((uni) => (
                  <MenuItem key={uni.universityId} value={uni.universityId}>
                    {uni.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Card>

      {/* Export Buttons */}
      <Box sx={{ mb: 2, display: "flex", gap: 2 }}>
        <Button
          variant="contained"
          startIcon={<FileDownload />}
          sx={{
            fontWeight: 600,
            background: "linear-gradient(90deg,#74ebd5,#ACB6E5)",
          }}
          onClick={() => exportExcel(filteredData)}
        >
          Xuất Excel
        </Button>
        <Button
          variant="outlined"
          startIcon={<PictureAsPdf />}
          sx={{
            fontWeight: 600,
            color: "#74ebd5",
            borderColor: "#74ebd5",
          }}
          onClick={() => exportPDF(filteredData)}
        >
          Xuất PDF
        </Button>
      </Box>

      {/* Method Breakdown */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Phân tích phương thức check-in
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Chip
            label={`QR Code: ${analytics.methodBreakdown.qr}`}
            color="primary"
            sx={{ fontSize: "1rem", p: 1 }}
          />
          <Chip
            label={`Thủ công: ${analytics.methodBreakdown.manual}`}
            color="secondary"
            sx={{ fontSize: "1rem", p: 1 }}
          />
        </Box>
      </Card>

      <Divider sx={{ my: 2 }} />

      {/* Data Table */}
      <Card sx={{ background: "#fff", borderRadius: 3, boxShadow: 2, p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Chi tiết Check-ins ({filteredData.length} bản ghi)
        </Typography>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Tên sự kiện</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Sinh viên</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Thời gian</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Phương thức</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Trạng thái</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.map((c) => {
              // Safely format date
              const formatDate = (dateString) => {
                if (!dateString) return "Chưa có thông tin";
                try {
                  const date = new Date(dateString);
                  if (isNaN(date.getTime())) return "Thời gian không hợp lệ";
                  return date.toLocaleString("vi-VN", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  });
                } catch (error) {
                  console.error("Date formatting error:", error);
                  return "Lỗi định dạng";
                }
              };

              return (
                <TableRow key={c.checkinId || c.checkin_id || c.id}>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                      {c.eventTitle ||
                        c.sessionTitle ||
                        c.eventName ||
                        "Sự kiện không xác định"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                        {c.studentName || "Sinh viên"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {c.studentCode ||
                          c.studentInEventId ||
                          c.studentId ||
                          "N/A"}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {formatDate(
                      c.checkinTime || c.checkin_time || c.CheckinTime
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={
                        (c.method || c.Method) === "qr" ||
                        (c.method || c.Method) === "QR"
                          ? "QR Code"
                          : "Thủ công"
                      }
                      color={
                        (c.method || c.Method) === "qr" ||
                        (c.method || c.Method) === "QR"
                          ? "primary"
                          : "secondary"
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip label="Đã check-in" color="success" size="small" />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </Box>
  );
};

export default Report;

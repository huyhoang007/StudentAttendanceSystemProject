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
  Paper,
  Stack,
} from "@mui/material";
import {
  FileDownload,
  PictureAsPdf,
  Assessment,
  TrendingUp,
  Group,
  School,
  EventNote,
  FilterList,
  QrCode,
  Edit,
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

  // =================================================================
  // LOGIC ĐƯỢC GIỮ NGUYÊN (CHỈ XÓA MOCK DATA)
  // =================================================================

  const fetchData = async () => {
    try {
      console.log("Fetching check-ins data for report...");
      const res = await getCheckIns();
      // Luôn cập nhật state với dữ liệu từ API (hoặc mảng rỗng)
      setData(Array.isArray(res) ? [...res] : []);
    } catch (error) {
      console.error("Error fetching check-ins:", error);
      // Nếu lỗi, set data thành mảng rỗng
      setData([]);
    }
  };

  const fetchEvents = async () => {
    try {
      const res = await getEvents();
      setEvents(Array.isArray(res) ? [...res] : []);
    } catch (error) {
      console.error("Error fetching events:", error);
      setEvents([]);
    }
  };

  const fetchUniversities = useCallback(async () => {
    try {
      const res = await getUniversities();
      if (!Array.isArray(res)) {
        setUniversities([]);
        return;
      }

      let filteredUniversities = [...res];

      // SECURITY: Logic quyền của bạn được giữ nguyên
      if (role === "organizer" && user?.universityId) {
        filteredUniversities = res.filter(
          (uni) => (uni.universityId || uni.id) === user.universityId
        );
      }
      setUniversities(filteredUniversities);
    } catch (error) {
      console.error("Error fetching universities:", error);
      setUniversities([]);
    }
  }, [role, user]);

  useEffect(() => {
    fetchData();
    fetchEvents();
    fetchUniversities();
  }, [role, user, fetchUniversities]);

  // LOGIC LỌC VÀ TÍNH TOÁN CỦA BẠN ĐƯỢC GIỮ NGUYÊN
  const filteredData = data.filter((item) => {
    const checkinTime = item.checkinTime || item.checkin_time;
    if (!checkinTime) return false;

    const checkinDate = new Date(checkinTime).toISOString().slice(0, 10);
    if (filters.startDate && checkinDate < filters.startDate) return false;
    if (filters.endDate && checkinDate > filters.endDate) return false;

    if (filters.eventId) {
      const event = events.find(
        (e) =>
          (Array.isArray(e.sessions) &&
            e.sessions.some((s) => s.sessionId === item.sessionId)) ||
          e.eventId === item.sessionId
      );
      if (!event || event.eventId !== filters.eventId) return false;
    }

    if (
      filters.universityId &&
      (item.universityId || item.university_id) !== filters.universityId
    ) {
      return false;
    }

    return true;
  });

  const analytics = {
    totalCheckIns: filteredData.length,
    uniqueStudents: new Set(
      filteredData.map((d) => d.studentId || d.student_id)
    ).size,
    uniqueEvents: new Set(
      filteredData.map((d) => d.eventId || d.event_id || d.sessionId)
    ).size,
    averageCheckInsPerEvent:
      filteredData.length > 0 &&
      new Set(filteredData.map((d) => d.eventId || d.event_id || d.sessionId))
        .size > 0
        ? (
            filteredData.length /
            new Set(
              filteredData.map((d) => d.eventId || d.event_id || d.sessionId)
            ).size
          ).toFixed(2)
        : 0,
    methodBreakdown: {
      qr: filteredData.filter((d) => (d.method || "").toLowerCase() === "qr")
        .length,
      manual: filteredData.filter(
        (d) => (d.method || "").toLowerCase() !== "qr"
      ).length,
    },
  };

  // Tính toán tỷ lệ phần trăm cho thanh phân tích
  const totalMethods =
    analytics.methodBreakdown.qr + analytics.methodBreakdown.manual;
  const qrPercentage =
    totalMethods > 0 ? (analytics.methodBreakdown.qr / totalMethods) * 100 : 0;
  const manualPercentage =
    totalMethods > 0
      ? (analytics.methodBreakdown.manual / totalMethods) * 100
      : 0;

  // =================================================================
  // GIAO DIỆN MỚI BẮT ĐẦU TỪ ĐÂY
  // =================================================================
  return (
    <Box sx={{ p: 3, backgroundColor: "#f4f6f8", minHeight: "100vh" }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
        <Assessment sx={{ fontSize: 40, color: "primary.main" }} />
        <Box>
          <Typography variant="h4" fontWeight={700} color="text.primary">
            Báo cáo & Thống kê
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Tổng quan dữ liệu check-in và hiệu suất sự kiện.
          </Typography>
        </Box>
      </Stack>

      <Grid container spacing={3}>
        {/* Cột trái: Thống kê và Bảng dữ liệu */}
        <Grid item xs={12} lg={8}>
          <Stack spacing={3}>
            {/* Analytics Cards */}
            <Grid container spacing={3}>
              {[
                {
                  title: "Tổng Check-ins",
                  value: analytics.totalCheckIns,
                  icon: <TrendingUp sx={{ fontSize: 48 }} />,
                  color: "#1976d2",
                },
                {
                  title: "Sinh viên tham gia",
                  value: analytics.uniqueStudents,
                  icon: <Group sx={{ fontSize: 48 }} />,
                  color: "#f57c00",
                },
                {
                  title: "Sự kiện",
                  value: analytics.uniqueEvents,
                  icon: <EventNote sx={{ fontSize: 48 }} />,
                  color: "#388e3c",
                },
              ].map((item) => (
                <Grid item xs={12} sm={6} key={item.title}>
                  <Card
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      p: 2,
                      borderRadius: "16px",
                      transition: "box-shadow 0.3s",
                      "&:hover": { boxShadow: 6 },
                    }}
                  >
                    <Box sx={{ color: item.color, mr: 2 }}>{item.icon}</Box>
                    <Box>
                      <Typography variant="h5" fontWeight={700}>
                        {" "}
                        {item.value}{" "}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {" "}
                        {item.title}{" "}
                      </Typography>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Data Table */}
            <Paper sx={{ p: 2, borderRadius: "16px", overflowX: "auto" }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Chi tiết Check-ins ({filteredData.length} bản ghi)
              </Typography>
              <Table>
                <TableHead sx={{ backgroundColor: "#f9fafb" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold" }}>Sự kiện</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Sinh viên</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Thời gian</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>
                      Phương thức
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>
                      Trạng thái
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredData.map((c) => {
                    const formatDate = (dateString) => {
                      if (!dateString) return "N/A";
                      try {
                        const date = new Date(dateString);
                        return isNaN(date.getTime())
                          ? "Invalid Date"
                          : date.toLocaleString("vi-VN");
                      } catch (error) {
                        return "Formatting Error";
                      }
                    };
                    return (
                      <TableRow key={c.checkinId || c.checkin_id || c.id} hover>
                        <TableCell>
                          {c.eventTitle ||
                            c.sessionTitle ||
                            c.eventName ||
                            "Không rõ"}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {c.studentName || "Không rõ"}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {c.studentCode || c.studentId || "N/A"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {formatDate(c.checkinTime || c.checkin_time)}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={
                              (c.method || "").toLowerCase() === "qr"
                                ? "QR Code"
                                : "Thủ công"
                            }
                            color={
                              (c.method || "").toLowerCase() === "qr"
                                ? "primary"
                                : "secondary"
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label="Đã check-in"
                            color="success"
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Paper>
          </Stack>
        </Grid>

        {/* Cột phải: Bộ lọc và Hành động */}
        <Grid item xs={12} lg={4}>
          <Stack spacing={3}>
            {/* Filters */}
            <Card sx={{ borderRadius: "16px" }}>
              <CardContent>
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  sx={{ mb: 2 }}
                >
                  <FilterList color="primary" />
                  <Typography variant="h6">Bộ lọc</Typography>
                </Stack>
                <Stack spacing={2}>
                  <TextField
                    label="Từ ngày"
                    type="date"
                    value={filters.startDate}
                    onChange={(e) =>
                      setFilters({ ...filters, startDate: e.target.value })
                    }
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    label="Đến ngày"
                    type="date"
                    value={filters.endDate}
                    onChange={(e) =>
                      setFilters({ ...filters, endDate: e.target.value })
                    }
                    InputLabelProps={{ shrink: true }}
                  />
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
                        <MenuItem
                          key={uni.universityId}
                          value={uni.universityId}
                        >
                          {uni.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>
              </CardContent>
            </Card>

            {/* Method Breakdown */}
            <Card sx={{ borderRadius: "16px" }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Phân tích phương thức
                </Typography>
                <Stack spacing={2}>
                  <Box>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      sx={{ mb: 0.5 }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ display: "flex", alignItems: "center" }}
                      >
                        <QrCode fontSize="small" sx={{ mr: 1 }} /> QR Code
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {analytics.methodBreakdown.qr}
                      </Typography>
                    </Stack>
                    <Box
                      sx={{
                        backgroundColor: "#e0e0e0",
                        borderRadius: "4px",
                        overflow: "hidden",
                      }}
                    >
                      <Box
                        sx={{
                          width: `${qrPercentage}%`,
                          backgroundColor: "primary.main",
                          height: "8px",
                        }}
                      />
                    </Box>
                  </Box>
                  <Box>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      sx={{ mb: 0.5 }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ display: "flex", alignItems: "center" }}
                      >
                        <Edit fontSize="small" sx={{ mr: 1 }} /> Thủ công
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {analytics.methodBreakdown.manual}
                      </Typography>
                    </Stack>
                    <Box
                      sx={{
                        backgroundColor: "#e0e0e0",
                        borderRadius: "4px",
                        overflow: "hidden",
                      }}
                    >
                      <Box
                        sx={{
                          width: `${manualPercentage}%`,
                          backgroundColor: "secondary.main",
                          height: "8px",
                        }}
                      />
                    </Box>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* Export Buttons */}
            <Card sx={{ borderRadius: "16px" }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Tùy chọn xuất
                </Typography>
                <Stack spacing={2}>
                  <Button
                    variant="contained"
                    startIcon={<FileDownload />}
                    onClick={() => exportExcel(filteredData)}
                  >
                    Xuất Excel
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<PictureAsPdf />}
                    onClick={() => exportPDF(filteredData)}
                  >
                    Xuất PDF
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Report;

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
  TablePagination, // <-- THÊM IMPORT NÀY
  Container, // Giữ lại Container để căn giữa tổng thể
} from "@mui/material";
import {
  FileDownload,
  PictureAsPdf,
  Assessment,
  TrendingUp,
  TrendingDown, // <-- THÊM LẠI TrendingDown
  Group,
  EventNote,
  FilterList,
  QrCode,
  Edit,
  CheckCircleOutline, // <-- THÊM LẠI CheckCircleOutline
  ArrowUpward,      // <-- THÊM LẠI ArrowUpward
  ArrowDownward,    // <-- THÊM LẠI ArrowDownward
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

  // --- THÊM STATE CHO PHÂN TRANG ---
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // =================================================================
  // LOGIC ĐƯỢC GIỮ NGUYÊN (CHỈ XÓA MOCK DATA)
  // =================================================================

  const fetchData = useCallback(async () => {
    try {
      console.log("Fetching check-ins data for report...");
      const res = await getCheckIns();

      // Lọc dữ liệu theo organizerId và universityId của organizer hiện tại
      let filteredData = Array.isArray(res) ? [...res] : [];

      if (role === "organizer" && user?.organizerId) {
        // Lọc dữ liệu dựa trên organizerId hiện tại
        filteredData = filteredData.filter((item) => {
          // Kiểm tra nếu item có organizerId phù hợp với user hiện tại
          return item.organizerId === user.organizerId;
        });
      }

      setData(filteredData);
      setPage(0); // Reset page khi tải lại dữ liệu gốc
    } catch (error) {
      console.error("Error fetching check-ins:", error);
      setData([]);
    }
  }, [role, user]);

  const fetchEvents = useCallback(async () => {
    try {
      let res;
      if (role === "organizer" && user?.organizerId) {
        // Nếu là organizer, chỉ lấy sự kiện của họ
        const token = localStorage.getItem("authToken");
        const response = await fetch(
          `/api/event/by-organizer/${user.organizerId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        res = await response.json();
      } else {
        // Nếu là admin, lấy tất cả sự kiện
        res = await getEvents();
      }
      setEvents(Array.isArray(res) ? [...res] : []);
    } catch (error) {
      console.error("Error fetching events:", error);
      setEvents([]);
    }
  }, [role, user]);

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
  }, [role, user, fetchUniversities, fetchData, fetchEvents]);

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
          e.eventId === item.sessionId // Assuming sessionId might sometimes match eventId if structure is inconsistent
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

  // --- THÊM useEffect ĐỂ RESET TRANG KHI BỘ LỌC THAY ĐỔI ---
  useEffect(() => {
    setPage(0);
  }, [filters.startDate, filters.endDate, filters.eventId, filters.universityId]);

  // --- THÊM CÁC HÀM HANDLER CHO PHÂN TRANG ---
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Quay về trang đầu tiên
  };

  const analytics = {
    totalCheckIns: filteredData.length,
    uniqueStudents: new Set(
      filteredData.map((d) => d.studentId || d.student_id)
    ).size,
    uniqueEvents: new Set(
      filteredData.map((d) => d.eventId || d.event_id || d.sessionId) // Consider sessionId as well for uniqueness
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

  // Tính toán số sự kiện đang diễn ra (logic mới cho thông tin bổ sung)
  const ongoingEvents = events.filter((event) => {
    const now = new Date();
    const startDate = event.startDate ? new Date(event.startDate) : null;
    const endDate = event.endDate ? new Date(event.endDate) : null;
    return startDate && endDate && now >= startDate && now <= endDate;
  }).length;

  // Mock trends (có thể thay bằng dữ liệu thực từ API)
  const mockTrends = {
    checkIns: { value: 12, isUp: true },
    students: { value: 8, isUp: true },
    events: { value: 3, isUp: false },
  };

  // =================================================================
  // GIAO DIỆN MỚI BẮT ĐẦU TỪ ĐÂY
  // =================================================================
  return (
    <Box sx={{ backgroundColor: "#F9FAFB", minHeight: "100vh", py: 3 }}>
      <Container maxWidth="lg"> {/* Đổi maxWidth thành "lg" */}
        {/* Header */}
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
          <Assessment sx={{ fontSize: 40, color: "#7c3aed" }} />
          <Box>
            <Typography variant="h4" fontWeight={700} color="text.primary">
              Báo cáo & Thống kê
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tổng quan dữ liệu check-in và hiệu suất sự kiện.
            </Typography>
          </Box>
        </Stack>

        {/* Filters - ĐƯA LÊN TRÊN VÀ SẮP XẾP LẠI */}
        <Card sx={{ borderRadius: "16px", mb: 3 }}>
          <CardContent>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              alignItems="center"
              spacing={2}
              sx={{ mb: 3 }}
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                <FilterList sx={{ color: "#7c3aed" }} />
                <Typography variant="h6" color="#7c3aed">Bộ lọc</Typography>
              </Stack>
              <Box sx={{ flexGrow: 1 }} />
              <Button
                variant="text"
                size="large"
                onClick={() => setFilters({
                  startDate: "",
                  endDate: "",
                  eventId: "",
                  universityId: "",
                })}
                sx={{
                  color: "#7c3aed",
                  "&:hover": {
                    backgroundColor: "#f3f0ff",
                  },
                }}
              >
                Xóa bộ lọc
              </Button>
            </Stack>
            
            <Grid container spacing={2} sx={{ mb: 2 }}>
              {/* Bộ lọc ngày */}
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                  Khoảng thời gian
                </Typography>
                <Stack direction="row" spacing={1}>
                  <TextField
                    label="Từ ngày"
                    type="date"
                    size="small"
                    value={filters.startDate}
                    onChange={(e) =>
                      setFilters({ ...filters, startDate: e.target.value })
                    }
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      flex: 1,
                      '& .MuiOutlinedInput-root': {
                        '&.Mui-focused fieldset': {
                          borderColor: '#7c3aed',
                        },
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#7c3aed',
                      },
                    }}
                  />
                  <TextField
                    label="Đến ngày"
                    type="date"
                    size="small"
                    value={filters.endDate}
                    onChange={(e) =>
                      setFilters({ ...filters, endDate: e.target.value })
                    }
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      flex: 1,
                      '& .MuiOutlinedInput-root': {
                        '&.Mui-focused fieldset': {
                          borderColor: '#7c3aed',
                        },
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#7c3aed',
                      },
                    }}
                  />
                </Stack>
              </Grid>

              {/* Bộ lọc sự kiện */}
              <Grid item xs={12} sm={6} md={5}>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                  Sự kiện
                </Typography>
                <FormControl fullWidth size="small" sx={{
                  minWidth: 150,
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: '#7c3aed',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#7c3aed',
                  },
                }}>
                  <InputLabel>Chọn sự kiện</InputLabel>
                  <Select
                    value={filters.eventId}
                    label="Chọn sự kiện"
                    onChange={(e) =>
                      setFilters({ ...filters, eventId: e.target.value })
                    }
                  >
                    <MenuItem value="">
                      <em>Tất cả sự kiện</em>
                    </MenuItem>
                    {events.map((event) => (
                      <MenuItem key={event.eventId} value={event.eventId}>
                        {event.title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Bộ lọc trường */}
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                  Trường đại học
                </Typography>
                <FormControl fullWidth size="small" sx={{
                  minWidth: 150,
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: '#7c3aed',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#7c3aed',
                  },
                }}>
                  <InputLabel>Chọn trường</InputLabel>
                  <Select
                    value={filters.universityId}
                    label="Chọn trường"
                    onChange={(e) =>
                      setFilters({ ...filters, universityId: e.target.value })
                    }
                  >
                    <MenuItem value="">
                      <em>Tất cả trường</em>
                    </MenuItem>
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
              </Grid>
            </Grid>
          </CardContent>
        </Card>
        
        {/* Main Content Grid */}
        <Grid container spacing={3}>
          {/* Cột trái: Thống kê và Bảng dữ liệu */}
          <Grid item xs={12} lg={8}>
            <Stack spacing={3}>
              {/* Analytics Cards - LOẠI BỎ SUBTITLE */}
              <Grid container spacing={3}>
                {[
                  {
                    title: "Tổng số lượt Check-in",
                    value: analytics.totalCheckIns,
                    icon: <CheckCircleOutline sx={{ fontSize: 48 }} />,
                    color: "#7c3aed",
                    bgGradient: "linear-gradient(135deg, #f3f0ff 0%, #e9d5ff 100%)",
                  },
                  {
                    title: "Sinh viên đã Check-in",
                    value: analytics.uniqueStudents,
                    icon: <Group sx={{ fontSize: 48 }} />,
                    color: "#9333ea",
                    bgGradient: "linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)",
                  },
                  {
                    title: "Tổng số Sự kiện",
                    value: analytics.uniqueEvents,
                    icon: <EventNote sx={{ fontSize: 48 }} />,
                    color: "#a855f7",
                    bgGradient: "linear-gradient(135deg, #fdf4ff 0%, #f5d0fe 100%)",
                  },
                ].map((item) => (
                  <Grid item xs={12} sm={6} md={4} key={item.title} sx={{ display: 'flex' , width: "255px"}}>
                    <Card
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        flex: 1,
                        p: 2.5,
                        borderRadius: "16px",
                        background: item.bgGradient,
                        transition: "all 0.3s ease",
                        position: "relative",
                        overflow: "hidden",
                        "&:hover": {
                          boxShadow: 6,
                          transform: "translateY(-4px)",
                        },
                        "&::before": {
                          content: '\"\"',
                          position: "absolute",
                          top: 0,
                          right: 0,
                          width: "100px",
                          height: "100px",
                          background: item.color,
                          opacity: 0.1,
                          borderRadius: "50%",
                          transform: "translate(30px, -30px)",
                        },
                      }}
                    >
                      <Stack spacing={1.5}>
                        {/* Icon */}
                        <Box
                          sx={{
                            color: item.color,
                            backgroundColor: "rgba(255,255,255,0.9)",
                            borderRadius: "12px",
                            p: 1,
                            display: "flex",
                            width: "fit-content",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                          }}
                        >
                          {item.icon}
                        </Box>

                        {/* Giá trị và Tiêu đề - ĐÃ LOẠI BỎ SUBTITLE */}
                        <Box>
                          <Typography
                            variant="h3"
                            fontWeight={700}
                            color={item.color}
                            sx={{ lineHeight: 1.2 }}
                          >
                            {item.value}
                          </Typography>
                          <Typography
                            variant="body1"
                            color="text.primary"
                            fontWeight={600}
                            sx={{ mt: 0.5 }}
                          >
                            {item.title}
                          </Typography>
                        </Box>
                      </Stack>
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
                    {/* --- CẬP NHẬT LOGIC RENDER VỚI SLICE --- */}
                    {(rowsPerPage > 0
                      ? filteredData.slice(
                          page * rowsPerPage,
                          page * rowsPerPage + rowsPerPage
                        )
                      : filteredData
                    ).map((c) => {
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
                              sx={{
                                backgroundColor: (c.method || "").toLowerCase() === "qr" ? "#e0f2f7" : "#f3e5f5", // Màu nền nhẹ hơn
                                color: (c.method || "").toLowerCase() === "qr" ? "#0288d1" : "#ab47bc", // Màu chữ đậm hơn
                              }}
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
                {/* --- THÊM COMPONENT PHÂN TRANG --- */}
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, { label: 'Tất cả', value: -1 }]}
                  component="div"
                  count={filteredData.length} // Tổng số bản ghi đã lọc
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  labelRowsPerPage="Số hàng mỗi trang:"
                  labelDisplayedRows={({ from, to, count }) => {
                     if (count === -1) return `Tất cả ${filteredData.length} bản ghi`; // Hiển thị tổng số khi chọn "Tất cả"
                     return `${from}–${to} trong số ${count !== -1 ? count : `hơn ${to}`}`;
                  }}
                   SelectProps={{
                     inputProps: { 'aria-label': 'Số hàng mỗi trang' },
                     native: true, // Use native select for "All" option compatibility
                   }}
                />
              </Paper>
            </Stack>
          </Grid>

          {/* Cột phải: Phân tích và Xuất */}
          <Grid item xs={12} lg={4}>
            <Stack spacing={3}>
              {/* Method Breakdown */}
              <Card sx={{ borderRadius: "16px", width: "313px" }}>
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
                          <QrCode fontSize="small" sx={{ mr: 1, color: "#7c3aed" }} /> QR Code
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
                            backgroundColor: "#7c3aed",
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
                          <Edit fontSize="small" sx={{ mr: 1, color: "#9333ea" }} /> Thủ công
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
                            backgroundColor: "#9333ea",
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
                      sx={{
                        backgroundColor: "#7c3aed",
                        "&:hover": {
                          backgroundColor: "#6d28d9",
                        },
                      }}
                    >
                      Xuất Excel
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<PictureAsPdf />}
                      onClick={() => exportPDF(filteredData)}
                      sx={{
                        borderColor: "#7c3aed",
                        color: "#7c3aed",
                        "&:hover": {
                          borderColor: "#6d28d9",
                          backgroundColor: "#f3f0ff",
                        },
                      }}
                    >
                      Xuất PDF
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Report;
import React, { useEffect, useState, useCallback, useMemo } from "react";
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
  TablePagination,
  Container,
  CircularProgress,
} from "@mui/material";
import {
  FileDownload,
  Assessment,
  Group,
  EventNote,
  FilterList,
  QrCode,
  Edit,
  CheckCircleOutline,
} from "@mui/icons-material";
import { exportExcel } from "../services/reportService";
import { getCheckIns } from "../services/sessionCheckInService";
import { getEvents } from "../services/eventService";
import { getUniversities } from "../services/universityService";
import { useAuth } from "../contexts/AuthContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const METHOD_PRIORITY = { qr: 0, manual: 1 };
const EMPTY_DATA_NOTE = "Không có dữ liệu phù hợp với bộ lọc hiện tại.";

const formatDateTimeDisplay = (value) => {
  if (!value) {
    return "Không rõ";
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Không rõ";
  }
  return new Intl.DateTimeFormat("vi-VN", {
    hour12: false,
    dateStyle: "short",
    timeStyle: "medium",
  }).format(date);
};

const extractDateKey = (value) => {
  if (!value && value !== 0) {
    return null;
  }
  const match = String(value).match(/\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : null;
};

const toDateKey = (value) => {
  if (!value && value !== 0) {
    return null;
  }
  const direct = extractDateKey(value);
  if (direct) {
    return direct;
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const normalizeGuid = (value) => {
  if (!value && value !== 0) {
    return "";
  }
  return String(value).toLowerCase();
};

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
  const [isExportingExcel, setIsExportingExcel] = useState(false);

  const isDateRangeInvalid = useMemo(() => {
    if (!filters.startDate || !filters.endDate) {
      return false;
    }
    return filters.startDate > filters.endDate;
  }, [filters.startDate, filters.endDate]);

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

  const sessionIdToEvent = useMemo(() => {
    const map = new Map();
    events.forEach((event) => {
      const sessions = Array.isArray(event.sessions) ? event.sessions : [];
      sessions.forEach((session) => {
        const key = normalizeGuid(session.sessionId || session.SessionId);
        if (key) {
          map.set(key, event);
        }
      });
    });
    return map;
  }, [events]);

  const eventIdToEvent = useMemo(() => {
    const map = new Map();
    events.forEach((event) => {
      const key = normalizeGuid(event.eventId || event.EventId);
      if (key) {
        map.set(key, event);
      }
    });
    return map;
  }, [events]);

  const availableEvents = useMemo(() => {
    if (!Array.isArray(events)) {
      return [];
    }

    const universityFilter = normalizeGuid(filters.universityId);
    const startFilter = filters.startDate || "";
    const endFilter = filters.endDate || "";

    return events
      .map((event) => {
        const eventId = event.eventId || event.EventId;
        const eventIdKey = normalizeGuid(eventId);
        const universityKey = normalizeGuid(
          event.universityId || event.UniversityId
        );
        const startKey = toDateKey(event.startDate || event.StartDate);
        const endKey = toDateKey(event.endDate || event.EndDate) || startKey;

        return {
          ...event,
          eventId,
          eventIdKey,
          universityKey,
          startKey,
          endKey,
        };
      })
      .filter((event) => {
        if (universityFilter && event.universityKey !== universityFilter) {
          return false;
        }
        if (startFilter && event.endKey && event.endKey < startFilter) {
          return false;
        }
        if (endFilter && event.startKey && event.startKey > endFilter) {
          return false;
        }
        return true;
      })
      .sort((a, b) =>
        (a.title || "").localeCompare(b.title || "", "vi", {
          sensitivity: "base",
        })
      );
  }, [events, filters.universityId, filters.startDate, filters.endDate]);

  useEffect(() => {
    setFilters((prev) => {
      if (!prev.eventId) {
        return prev;
      }
      const current = normalizeGuid(prev.eventId);
      const stillValid = availableEvents.some(
        (event) => event.eventIdKey === current
      );
      return stillValid ? prev : { ...prev, eventId: "" };
    });
  }, [availableEvents]);

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
    setPage(0);
  };

  const selectedUniversity = useMemo(() => {
    if (!filters.universityId) {
      return null;
    }
    return (
      universities.find((uni) => {
        const id = uni.universityId || uni.id || uni.UniversityId;
        return id && String(id) === filters.universityId;
      }) || null
    );
  }, [universities, filters.universityId]);

  const selectedUniversityName =
    selectedUniversity?.name || selectedUniversity?.Name || "";

  const selectedEvent = useMemo(() => {
    const eventIdKey = normalizeGuid(filters.eventId);
    if (!eventIdKey) {
      return null;
    }
    return (
      availableEvents.find((event) => event.eventIdKey === eventIdKey) || null
    );
  }, [availableEvents, filters.eventId]);

  const eventsForSummary = useMemo(() => {
    const eventIdKey = normalizeGuid(filters.eventId);
    if (eventIdKey) {
      return availableEvents.filter((event) => event.eventIdKey === eventIdKey);
    }
    return availableEvents;
  }, [availableEvents, filters.eventId]);

  const enrichedCheckins = useMemo(() => {
    if (!Array.isArray(data)) {
      return [];
    }
    return data.map((item, index) => {
      const sessionId =
        item.sessionId || item.session_id || item.SessionId || null;
      const sessionKey = normalizeGuid(sessionId);
      const eventFromSession = sessionKey
        ? sessionIdToEvent.get(sessionKey)
        : undefined;
      const eventIdRaw = item.eventId || item.event_id || item.EventId || null;
      const eventKey = normalizeGuid(eventIdRaw);
      const eventFromId = eventKey ? eventIdToEvent.get(eventKey) : undefined;
      const eventData = eventFromSession || eventFromId || null;

      const mergedEventId =
        normalizeGuid(
          eventData?.eventId ||
            eventData?.EventId ||
            eventIdRaw ||
            sessionId
        ) || "";

      const eventTitle =
        eventData?.title ||
        eventData?.Title ||
        item.eventTitle ||
        item.event_name ||
        item.sessionTitle ||
        item.eventName ||
        "Không rõ";

      const universityIdKey =
        normalizeGuid(
          eventData?.universityId ||
            eventData?.UniversityId ||
            item.universityId ||
            item.university_id ||
            item.UniversityId
        ) || "";

      const checkinTime =
        item.checkinTime || item.checkin_time || item.CheckinTime || null;
      const checkinDateKey = toDateKey(checkinTime);

      const studentName =
        item.studentName || item.student_name || item.StudentName || "";
      const studentCode =
        item.studentCode || item.student_code || item.StudentCode || "";
      const studentIdKey = normalizeGuid(
        item.studentId ||
          item.student_id ||
          item.StudentId ||
          item.studentInEventId ||
          item.student_in_event_id
      );

      const methodNormalized =
        (item.method || item.Method || "").trim().toLowerCase() === "qr"
          ? "qr"
          : "manual";

      const checkinId =
        item.checkinId ||
        item.checkin_id ||
        item.CheckinId ||
        `${sessionId || "checkin"}-${index}`;

      const studentKey =
        studentIdKey ||
        (studentCode
          ? `code:${studentCode.toLowerCase()}`
          : `name:${studentName.toLowerCase()}-${checkinId}`);

      return {
        original: item,
        checkinId,
        sessionId: sessionKey,
        eventId: mergedEventId,
        eventTitle,
        universityId: universityIdKey,
        checkinTime,
        checkinDateKey,
        studentName,
        studentCode,
        studentId: studentIdKey,
        studentKey,
        methodNormalized,
      };
    });
  }, [data, sessionIdToEvent, eventIdToEvent]);

  const filteredRows = useMemo(() => {
    const startKey = filters.startDate || "";
    const endKey = filters.endDate || "";
    const universityKey = normalizeGuid(filters.universityId);
    const eventKey = normalizeGuid(filters.eventId);

    return enrichedCheckins.filter((row) => {
      if (!row.checkinDateKey) {
        return false;
      }
      if (startKey && row.checkinDateKey < startKey) {
        return false;
      }
      if (endKey && row.checkinDateKey > endKey) {
        return false;
      }
      if (universityKey && row.universityId !== universityKey) {
        return false;
      }
      if (eventKey && row.eventId !== eventKey) {
        return false;
      }
      return true;
    });
  }, [enrichedCheckins, filters.startDate, filters.endDate, filters.universityId, filters.eventId]);

  const sortedRows = useMemo(() => {
    return filteredRows.slice().sort((a, b) => {
      const eventCompare = (a.eventTitle || "").localeCompare(
        b.eventTitle || "",
        "vi",
        { sensitivity: "base" }
      );
      if (eventCompare !== 0) {
        return eventCompare;
      }
      const studentCompare = (a.studentName || "").localeCompare(
        b.studentName || "",
        "vi",
        { sensitivity: "base" }
      );
      if (studentCompare !== 0) {
        return studentCompare;
      }
      return (
        (METHOD_PRIORITY[a.methodNormalized] ?? 99) -
        (METHOD_PRIORITY[b.methodNormalized] ?? 99)
      );
    });
  }, [filteredRows]);

  const preparedRows = useMemo(() => {
    return sortedRows.map((row) => ({
      ...row,
      displayCheckinTime: formatDateTimeDisplay(row.checkinTime),
      methodLabel: row.methodNormalized === "qr" ? "QR Code" : "Thủ công",
      statusLabel: "Đã check-in",
    }));
  }, [sortedRows]);

  const eventSummaries = useMemo(() => {
    const summaryMap = new Map();

    eventsForSummary.forEach((event) => {
      const key = event.eventIdKey;
      if (!key || summaryMap.has(key)) {
        return;
      }
      summaryMap.set(key, {
        eventId: event.eventId,
        title: event.title || "Không rõ",
        startDate: event.startKey,
        endDate: event.endKey,
        totalCheckIns: 0,
        uniqueStudents: 0,
        qrCount: 0,
        manualCount: 0,
        _studentSet: new Set(),
      });
    });

    sortedRows.forEach((row) => {
      const summary = summaryMap.get(row.eventId);
      if (!summary) {
        return;
      }
      summary.totalCheckIns += 1;
      if (row.methodNormalized === "qr") {
        summary.qrCount += 1;
      } else {
        summary.manualCount += 1;
      }
      summary._studentSet.add(row.studentKey);
    });

    summaryMap.forEach((summary) => {
      summary.uniqueStudents = summary._studentSet.size;
      delete summary._studentSet;
    });

    return Array.from(summaryMap.values()).sort((a, b) =>
      (a.title || "").localeCompare(b.title || "", "vi", {
        sensitivity: "base",
      })
    );
  }, [eventsForSummary, sortedRows]);

  const analytics = useMemo(() => {
    const uniqueStudentKeys = new Set();
    let qr = 0;
    let manual = 0;

    sortedRows.forEach((row) => {
      uniqueStudentKeys.add(row.studentKey);
      if (row.methodNormalized === "qr") {
        qr += 1;
      } else {
        manual += 1;
      }
    });

    return {
      totalCheckIns: sortedRows.length,
      uniqueStudents: uniqueStudentKeys.size,
      uniqueEvents: eventSummaries.length,
      methodBreakdown: {
        qr,
        manual,
      },
    };
  }, [sortedRows, eventSummaries]);

  const totalMethods =
    analytics.methodBreakdown.qr + analytics.methodBreakdown.manual;
  const qrPercentage = totalMethods
    ? (analytics.methodBreakdown.qr / totalMethods) * 100
    : 0;
  const manualPercentage = totalMethods
    ? (analytics.methodBreakdown.manual / totalMethods) * 100
    : 0;

  const detailRowsForExport = useMemo(() => {
    return preparedRows.map((row) => ({
      eventName: row.eventTitle,
      studentName: row.studentName || "Không rõ",
      studentCode: row.studentCode || "",
      checkedAt: row.displayCheckinTime,
      method: row.methodLabel,
      status: row.statusLabel,
    }));
  }, [preparedRows]);

  const paginatedRows = useMemo(() => {
    if (rowsPerPage === -1) {
      return preparedRows;
    }
    const start = page * rowsPerPage;
    return preparedRows.slice(start, start + rowsPerPage);
  }, [preparedRows, page, rowsPerPage]);

  const createExportPayload = useCallback(
    (generatedAt) => ({
      filters,
      universityName: selectedUniversityName || "",
      eventName: selectedEvent?.title || selectedEvent?.Title,
      analytics,
      methodBreakdown: analytics.methodBreakdown,
      eventSummaries,
      detailRows: detailRowsForExport,
      generatedAt,
      includeEventSummary: !filters.eventId,
      noteWhenEmpty: EMPTY_DATA_NOTE,
    }),
    [
      analytics,
      detailRowsForExport,
      eventSummaries,
      filters,
      selectedEvent,
      selectedUniversityName,
    ]
  );

  const isExportEnabled = Boolean(
    filters.universityId &&
      filters.startDate &&
      filters.endDate &&
      !isDateRangeInvalid
  );

  const dateErrorMessage =
    "Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc.";

  const handleResetFilters = useCallback(() => {
    setFilters({
      startDate: "",
      endDate: "",
      eventId: "",
      universityId: "",
    });
  }, [setFilters]);

  const handleUniversityChange = useCallback((event) => {
    const { value } = event.target;
    setFilters((prev) => ({
      ...prev,
      universityId: value,
      eventId: "",
    }));
  }, [setFilters]);

  const handleEventChange = useCallback((event) => {
    const { value } = event.target;
    setFilters((prev) => ({
      ...prev,
      eventId: value,
    }));
  }, [setFilters]);

  const handleDateChange = useCallback(
    (field) => (event) => {
      const { value } = event.target;
      setFilters((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    [setFilters]
  );

  const notifyMissingFilters = useCallback(() => {
    toast.warning(
      "Vui lòng chọn trường và khoảng thời gian hợp lệ trước khi xuất."
    );
  }, []);

  const handleExportExcel = useCallback(async () => {
    if (!isExportEnabled) {
      notifyMissingFilters();
      return;
    }
    const generationTime = new Date();
    const payload = createExportPayload(generationTime);
    try {
      setIsExportingExcel(true);
      await exportExcel(payload);
      toast.success("Xuất Excel thành công.");
    } catch (error) {
      console.error("Xuất Excel thất bại:", error);
      toast.error(
        error?.message
          ? `Xuất Excel thất bại: ${error.message}`
          : "Xuất Excel thất bại."
      );
    } finally {
      setIsExportingExcel(false);
    }
  }, [createExportPayload, isExportEnabled, notifyMissingFilters]);

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
                onClick={handleResetFilters}
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
              {/* Bộ lọc trường */}
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                  Trường đại học
                </Typography>
                <FormControl
                  fullWidth
                  size="small"
                  sx={{
                    minWidth: 150,
                    '& .MuiOutlinedInput-root': {
                      '&.Mui-focused fieldset': {
                        borderColor: '#7c3aed',
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#7c3aed',
                    },
                  }}
                >
                  <InputLabel>Chọn trường</InputLabel>
                  <Select
                    value={filters.universityId}
                    label="Chọn trường"
                    onChange={handleUniversityChange}
                  >
                    <MenuItem value="">
                      <em>Chọn trường</em>
                    </MenuItem>
                    {universities.map((uni) => {
                      const id = uni.universityId || uni.id || uni.UniversityId;
                      return (
                        <MenuItem key={String(id)} value={String(id)}>
                          {uni.name || uni.Name}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </Grid>

              {/* Bộ lọc sự kiện */}
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                  Sự kiện
                </Typography>
                <FormControl
                  fullWidth
                  size="small"
                  sx={{
                    minWidth: 150,
                    '& .MuiOutlinedInput-root': {
                      '&.Mui-focused fieldset': {
                        borderColor: '#7c3aed',
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#7c3aed',
                    },
                  }}
                >
                  <InputLabel>Chọn sự kiện</InputLabel>
                  <Select
                    value={filters.eventId}
                    label="Chọn sự kiện"
                    onChange={handleEventChange}
                    disabled={!filters.universityId}
                  >
                    <MenuItem value="">
                      <em>Tất cả sự kiện</em>
                    </MenuItem>
                    {filters.universityId && !availableEvents.length && (
                      <MenuItem value="" disabled>
                        Không có sự kiện phù hợp
                      </MenuItem>
                    )}
                    {availableEvents.map((event) => (
                      <MenuItem
                        key={String(event.eventId)}
                        value={String(event.eventId)}
                      >
                        {event.title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Bộ lọc ngày */}
              <Grid item xs={12} md={4}>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                  Khoảng thời gian
                </Typography>
                <Stack direction="row" spacing={1}>
                  <TextField
                    label="Từ ngày"
                    type="date"
                    size="small"
                    value={filters.startDate}
                    onChange={handleDateChange("startDate")}
                    InputLabelProps={{ shrink: true }}
                    error={isDateRangeInvalid}
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
                    onChange={handleDateChange("endDate")}
                    InputLabelProps={{ shrink: true }}
                    error={isDateRangeInvalid}
                    helperText={isDateRangeInvalid ? dateErrorMessage : ""}
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
                          content: '""',
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
                  Chi tiết Check-ins ({preparedRows.length} bản ghi)
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
                    {paginatedRows.length === 0 ? (
                      <TableRow>
                        <TableCell align="center" colSpan={5}>
                          {EMPTY_DATA_NOTE}
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedRows.map((row) => {
                        const isQr = row.methodNormalized === "qr";
                        return (
                          <TableRow key={row.checkinId} hover>
                            <TableCell>{row.eventTitle || "Không rõ"}</TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {row.studentName || "Không rõ"}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {row.studentCode || row.studentId || "N/A"}
                              </Typography>
                            </TableCell>
                            <TableCell>{row.displayCheckinTime}</TableCell>
                            <TableCell>
                              <Chip
                                label={row.methodLabel}
                                color={isQr ? "primary" : "secondary"}
                                size="small"
                                sx={{
                                  backgroundColor: isQr
                                    ? "#e0f2f7"
                                    : "#f3e5f5",
                                  color: isQr ? "#0288d1" : "#ab47bc",
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={row.statusLabel}
                                color="success"
                                size="small"
                                variant="outlined"
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
                {/* --- THÊM COMPONENT PHÂN TRANG --- */}
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, { label: 'Tất cả', value: -1 }]}
                  component="div"
                  count={preparedRows.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  labelRowsPerPage="Số hàng mỗi trang:"
                  labelDisplayedRows={({ from, to, count }) => {
                     if (rowsPerPage === -1) {
                       return `Tất cả ${count} bản ghi`;
                     }
                     return `${from}–${to} trong ${count}`;
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
                      startIcon={
                        isExportingExcel ? (
                          <CircularProgress size={18} color="inherit" />
                        ) : (
                          <FileDownload />
                        )
                      }
                      onClick={handleExportExcel}
                      disabled={!isExportEnabled || isExportingExcel}
                      sx={{
                        backgroundColor: "#7c3aed",
                        "&:hover": {
                          backgroundColor: "#6d28d9",
                        },
                      }}
                    >
                      {isExportingExcel ? "Đang xuất..." : "Xuất Excel"}
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Grid>
        </Grid>
      </Container>
      <ToastContainer position="top-right" autoClose={3000} limit={3} />
    </Box>
  );
};

export default Report;
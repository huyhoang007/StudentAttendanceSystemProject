import React, { useEffect, useState } from "react";
import {
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Paper,
  Grid,
  CircularProgress,
  Menu,
  ListItemIcon,
  ListItemText,
  List,
  ListItem,
  Divider,
  Snackbar,
  Alert,
  TablePagination,
  Container, // <-- THÊM IMPORT
  Card, // <-- THÊM IMPORT
  CardContent, // <-- THÊM IMPORT
  Avatar, // <-- THÊM IMPORT
} from "@mui/material";
// ListItemText đã được import ở trên, không import lại
import {
  Add,
  Delete,
  Upload,
  PersonAdd,
  FileDownload,
  Search,
  Person as PersonIcon,
  People as PeopleIcon,
  MoreVert as MoreVertIcon,
  AccessTime as AccessTimeIcon,
  EventNote as EventNoteIcon,
  CheckCircle as CheckCircleIcon,
  PlaylistAddCheck as PlaylistAddCheckIcon,
} from "@mui/icons-material";
import { useSearchParams } from "react-router-dom";
import {
  getStudentsByEvent,
  addStudentToEvent,
  addMultipleStudentsToEvent,
  updateStudentStatus,
  removeStudentFromEvent,
  importStudentsFromCsv,
} from "../services/studentInEventService";
import { getEvents, getEventsByUniversity } from "../services/eventService";
import { getStudents } from "../services/studentService";
import { getSessionsByEvent } from "../services/eventSessionService";
import { getUniversities } from "../services/universityService";
import {
  addCheckIn,
  getCheckInsBySession,
} from "../services/sessionCheckInService";
import { useAuth } from "../contexts/AuthContext";
import StudentSelectionDialog from "../components/StudentSelectionDialog";

// --- THÊM KEYFRAMES CHO ANIMATIONS ---
const gradientAnimation = {
  "@keyframes gradientShift": {
    "0%": { backgroundPosition: "0% 50%" },
    "50%": { backgroundPosition: "100% 50%" },
    "100%": { backgroundPosition: "0% 50%" },
  },
  "@keyframes shimmer": {
    "0%": { backgroundPosition: "-1000px 0" },
    "100%": { backgroundPosition: "1000px 0" },
  },
  "@keyframes glow": {
    "0%, 100%": { boxShadow: "0 0 5px rgba(118, 75, 162, 0.5)" },
    "50%": { boxShadow: "0 0 20px rgba(118, 75, 162, 0.8)" },
  },
};

const StudentInEventManagement = () => {
  const [searchParams] = useSearchParams();
  const initialEventId = searchParams.get("eventId");

  const [data, setData] = useState([]);
  const [events, setEvents] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(initialEventId || "");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [universities, setUniversities] = useState([]);
  const [selectedUniversity, setSelectedUniversity] = useState("");

  // --- THÊM STATE CHO PHÂN TRANG ---
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Dialog states
  // ... (Giữ nguyên các state dialog khác)
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openBatchDialog, setOpenBatchDialog] = useState(false);
  const [openImportDialog, setOpenImportDialog] = useState(false);
  const [selectionDialogOpen, setSelectionDialogOpen] = useState(false);
  const [isMultiSelect, setIsMultiSelect] = useState(false);

  // Form states
  // ... (Giữ nguyên các state form khác)
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [csvFile, setCsvFile] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [studentSearchText, setStudentSearchText] = useState(""); // Tìm kiếm sinh viên

  // Menu state
  // ... (Giữ nguyên)
  const [anchorEl, setAnchorEl] = useState(null);

  const { user, role, organizerId } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch events
  const fetchEvents = async () => {
    // ... (Giữ nguyên logic)
    try {
      let eventsData;
      if (role === "organizer" && organizerId) {
        const token = localStorage.getItem("authToken");
        const res = await fetch(`/api/event/by-organizer/${organizerId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        eventsData = await res.json();
      } else if (role === "admin" && selectedUniversity) {
        const token = localStorage.getItem("authToken");
        const res = await fetch(
          `/api/event/by-university/${selectedUniversity}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
        eventsData = await res.json();
      } else {
        eventsData = await getEvents();
      }
      setEvents(eventsData);

      if (initialEventId) {
        const event = eventsData.find(
          (e) => (e.eventId || e.EventId) === initialEventId
        );
        setSelectedEvent(event);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      setEvents([]);
    }
  };

  // Fetch students
  const fetchStudents = async () => {
    // ... (Giữ nguyên logic)
    try {
      const studentsData = await getStudents();
      setStudents(studentsData);
    } catch (error) {
      console.error("Error fetching students:", error);
      setStudents([]);
    }
  };

  // Fetch students in selected event
  const fetchStudentsInEvent = async () => {
    if (!selectedEventId) {
      setData([]);
      return;
    }

    try {
      setLoading(true);
      console.log("🔍 Fetching students for eventId:", selectedEventId);
      const studentsInEvent = await getStudentsByEvent(selectedEventId);
      console.log("✅ Students in event received:", studentsInEvent);
      console.log("📊 Number of students:", studentsInEvent?.length);
      setData(studentsInEvent || []);
      setPage(0); // <-- RESET VỀ TRANG ĐẦU TIÊN
    } catch (error) {
      console.error("❌ Error fetching students in event:", error);
      setError("Không thể tải danh sách sinh viên trong sự kiện.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchStudents();
    if (role === "admin") {
      getUniversities().then(setUniversities).catch(console.error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, organizerId]);

  // Re-fetch events when selected university changes
  useEffect(() => {
    if (role === "admin") {
      fetchEvents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUniversity]);

  useEffect(() => {
    if (selectedEventId) {
      fetchStudentsInEvent();
      const event = events.find(
        (e) => (e.eventId || e.EventId) === selectedEventId
      );
      setSelectedEvent(event);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEventId, events]);

  // --- THÊM CÁC HÀM HANDLER CHO PHÂN TRANG ---
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Quay về trang đầu tiên
  };

  // Filter data dựa trên tìm kiếm
  const filteredData = data.filter((item) => {
    // ... (Giữ nguyên logic filter)
    if (!studentSearchText) return true;
    const studentCode = (
      item.StudentCode ||
      item.studentCode ||
      ""
    ).toLowerCase();
    return studentCode.includes(studentSearchText.toLowerCase());
  });

  // State cho check-in thủ công theo phiên
  // ... (Giữ nguyên các state check-in)
  const [manualCheckInDialogOpen, setManualCheckInDialogOpen] = useState(false);
  const [manualCheckInSessions, setManualCheckInSessions] = useState([]);
  const [manualCheckInStatus, setManualCheckInStatus] = useState({}); // { sessionId: true/false }
  const [manualCheckInStudentId, setManualCheckInStudentId] = useState(null);
  const [manualCheckInLoading, setManualCheckInLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Hàm đóng snackbar
  const handleCloseSnackbar = () => {
    // ... (Giữ nguyên)
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // Hàm mở dialog chọn phiên khi check-in thủ công
  const handleManualCheckIn = async (studentInEventId) => {
    // ... (Giữ nguyên logic)
    try {
      setManualCheckInStudentId(studentInEventId);
      setManualCheckInLoading(true);
      // Lấy danh sách phiên của sự kiện
      const sessions = await getSessionsByEvent(selectedEventId);
      setManualCheckInSessions(sessions);
      // Lấy trạng thái check-in của sinh viên cho từng phiên
      const statusObj = {};
      for (const session of sessions) {
        const sessionId = session.sessionId || session.SessionId;
        try {
          const checkIns = await getCheckInsBySession(sessionId);
          // Kiểm tra xem có check-in nào của studentInEventId này không
          statusObj[sessionId] = checkIns.some(
            (ci) =>
              (ci.studentInEventId || ci.StudentInEventId) === studentInEventId
          );
        } catch (e) {
          statusObj[sessionId] = false;
        }
      }
      setManualCheckInStatus(statusObj);
      setManualCheckInDialogOpen(true);
    } catch (error) {
      setError("Không thể tải danh sách phiên cho check-in thủ công.");
    } finally {
      setManualCheckInLoading(false);
    }
  };

  // Hàm thực hiện check-in thủ công cho phiên đã chọn
  const handleManualCheckInSession = async (session) => {
    // ... (Giữ nguyên logic)
    try {
      setManualCheckInLoading(true);
      const sessionId = session.sessionId || session.SessionId;
      const studentInEventId = manualCheckInStudentId;
      if (!sessionId || !studentInEventId) {
        setError(
          "Thiếu sessionId hoặc studentInEventId khi check-in thủ công."
        );
        setManualCheckInLoading(false);
        return;
      }
      await addCheckIn({
        sessionId,
        studentInEventId,
        method: "manual",
      });
      await handleStatusChange(studentInEventId, "attended");
      await handleManualCheckIn(studentInEventId);
      fetchStudentsInEvent();
      setError("");
      setSnackbar({
        open: true,
        message: "Check-in thủ công thành công cho phiên đã chọn!",
        severity: "success",
      });
    } catch (error) {
      // Nếu đã điểm danh rồi thì chỉ cảnh báo, không setError
      if (
        error &&
        error.message &&
        error.message.includes("already checked in")
      ) {
        setSnackbar({
          open: true,
          message: "Sinh viên đã được điểm danh cho phiên này!",
          severity: "warning",
        });
        setError("");
      } else {
        const errorMessage =
          "Lỗi khi check-in thủ công: " + (error?.message || "Không xác định");
        setError(errorMessage);
        setSnackbar({
          open: true,
          message: errorMessage,
          severity: "error",
        });
      }
      console.error("[ERROR] Manual check-in:", error);
    } finally {
      setManualCheckInLoading(false);
    }
  };

  // Handle add single student
  const handleAddStudent = async () => {
    // ... (Giữ nguyên logic)
    if (!selectedStudentId || !selectedEventId) {
      setError("Vui lòng chọn sinh viên và sự kiện.");
      return;
    }

    try {
      await addStudentToEvent({
        EventId: selectedEventId,
        StudentId: selectedStudentId,
        Status: "registered",
      });

      setOpenAddDialog(false);
      setSelectedStudentId("");
      fetchStudentsInEvent(); // <-- fetch đã có setPage(0)
      setError("");
    } catch (err) {
      setError("Lỗi khi thêm sinh viên: " + (err.message || "Không xác định"));
    }
  };

  // Handle add multiple students
  const handleAddMultipleStudents = async () => {
    // ... (Giữ nguyên logic)
    if (selectedStudentIds.length === 0 || !selectedEventId) {
      setError("Vui lòng chọn ít nhất một sinh viên và sự kiện.");
      return;
    }

    try {
      const token = localStorage.getItem("authToken"); // Fix: use authToken instead of token
      console.log("Token for batch add:", token ? "Token exists" : "No token");

      await addMultipleStudentsToEvent(
        {
          EventId: selectedEventId,
          StudentIds: selectedStudentIds,
          Status: "registered",
        },
        token
      );

      setOpenBatchDialog(false);
      setSelectedStudentIds([]);
      fetchStudentsInEvent(); // <-- fetch đã có setPage(0)
      setError("");
    } catch (err) {
      setError(
        "Lỗi khi thêm nhiều sinh viên: " + (err.message || "Không xác định")
      );
    }
  };

  // Handle import CSV
  const handleImportCsv = async () => {
    // ... (Giữ nguyên logic)
    if (!csvFile || !selectedEventId) {
      setError("Vui lòng chọn file CSV và sự kiện.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const result = await importStudentsFromCsv(
        selectedEventId,
        csvFile,
        token
      );

      setImportResult(result);
      setCsvFile(null);
      fetchStudentsInEvent(); // <-- fetch đã có setPage(0)
      setError("");
    } catch (err) {
      setError("Lỗi khi import CSV: " + (err.message || "Không xác định"));
    }
  };

  // Handle add students from dialog
  const handleAddStudents = (studentsToAdd) => {
    // ... (Giữ nguyên logic)
    if (Array.isArray(studentsToAdd)) {
      // Multiple students
      handleAddMultipleStudentsFromDialog(studentsToAdd);
    } else {
      // Single student
      handleAddSingleStudentFromDialog(studentsToAdd);
    }
  };

  const handleAddSingleStudentFromDialog = async (student) => {
    // ... (Giữ nguyên logic)
    try {
      const token = localStorage.getItem("authToken"); // Fix: use authToken instead of token
      console.log(
        "Token for single student add:",
        token ? "Token exists" : "No token"
      );

      await addStudentToEvent(
        {
          EventId: selectedEventId,
          StudentId: student.student_id || student.id,
          Status: "registered",
        },
        token
      );

      fetchStudentsInEvent(); // <-- fetch đã có setPage(0)
      setError("");
    } catch (err) {
      setError("Lỗi khi thêm sinh viên: " + (err.message || "Không xác định"));
    }
  };

  const handleAddMultipleStudentsFromDialog = async (studentsToAdd) => {
    // ... (Giữ nguyên logic)
    try {
      const token = localStorage.getItem("authToken"); // Fix: use authToken instead of token
      console.log(
        "Token for batch add from dialog:",
        token ? "Token exists" : "No token"
      );

      await addMultipleStudentsToEvent(
        {
          EventId: selectedEventId,
          StudentIds: studentsToAdd.map((s) => s.student_id || s.id),
          Status: "registered",
        },
        token
      );

      fetchStudentsInEvent(); // <-- fetch đã có setPage(0)
      setError("");
    } catch (err) {
      setError(
        "Lỗi khi thêm nhiều sinh viên: " + (err.message || "Không xác định")
      );
    }
  };

  // Menu handlers
  // ... (Giữ nguyên logic menu)
  const openAddMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const closeAddMenu = () => {
    setAnchorEl(null);
  };

  const openSingleStudentDialog = () => {
    setIsMultiSelect(false);
    setSelectionDialogOpen(true);
    closeAddMenu();
  };

  const openMultiStudentDialog = () => {
    setIsMultiSelect(true);
    setSelectionDialogOpen(true);
    closeAddMenu();
  };

  // Handle status change
  const handleStatusChange = async (studentInEventId, newStatus) => {
    // ... (Giữ nguyên logic)
    try {
      const token = localStorage.getItem("token");
      await updateStudentStatus(studentInEventId, newStatus, token);
      fetchStudentsInEvent(); // <-- fetch đã có setPage(0)
    } catch (err) {
      setError(
        "Lỗi khi cập nhật trạng thái: " + (err.message || "Không xác định")
      );
    }
  };

  // Handle remove student
  const handleRemoveStudent = async (studentInEventId) => {
    // ... (Giữ nguyên logic)
    if (!window.confirm("Bạn có chắc muốn xóa sinh viên khỏi sự kiện?")) return;

    try {
      console.log(
        "🔄 Starting remove student process for ID:",
        studentInEventId
      );
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Không tìm thấy token xác thực");
      }

      await removeStudentFromEvent(studentInEventId, token);
      console.log("✅ Successfully removed student from event");
      fetchStudentsInEvent(); // <-- fetch đã có setPage(0)
      setError(""); // Clear any existing errors
      setSnackbar({
        open: true,
        message: "Đã xóa sinh viên khỏi sự kiện thành công",
        severity: "success",
      });
    } catch (err) {
      console.error("❌ Error removing student:", err);
      const errorMessage =
        "Lỗi khi xóa sinh viên: " + (err.message || "Không xác định");
      setError(errorMessage);
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f5f0ff 0%, #e8d5ff 100%)",
        ...gradientAnimation,
      }}
    >
      <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
        {/* ERROR DISPLAY */}
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: "12px" }}>
            {error}
          </Alert>
        )}

        {/* HEADER WITH GRADIENT */}
        <Box
          sx={{
            background: "linear-gradient(135deg, #764ba2 0%, #9b59b6 100%)",
            borderRadius: "20px",
            p: { xs: 2, md: 4 },
            mb: 3,
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 8px 32px rgba(118, 75, 162, 0.3)",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                "linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.15) 50%, transparent 70%)",
              backgroundSize: "200% 200%",
              animation: "shimmer 3s infinite",
            },
          }}
        >
          <Box sx={{ position: "relative", zIndex: 1 }}>
            <Typography
              variant="h4"
              sx={{
                color: "white",
                fontWeight: 700,
                mb: 1,
                fontSize: { xs: "1.5rem", md: "2.125rem" },
              }}
            >
              🎓 Quản lý sinh viên trong sự kiện
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "rgba(255,255,255,0.95)",
                fontSize: { xs: "0.875rem", md: "1rem" },
              }}
            >
              Quản lý danh sách sinh viên tham gia sự kiện
            </Typography>
          </Box>
        </Box>

        {/* EVENT SELECTION SECTION */}
        <Card
          sx={{
            borderRadius: "20px",
            mb: 3,
            boxShadow: "0 8px 32px rgba(118, 75, 162, 0.15)",
            background: "linear-gradient(135deg, #ffffff 0%, #f9f5ff 100%)",
            border: "1px solid rgba(118, 75, 162, 0.1)",
          }}
        >
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            {loading && (
              <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                <CircularProgress sx={{ color: "#764ba2" }} />
                <Typography sx={{ ml: 2, color: "#764ba2" }}>Đang tải dữ liệu...</Typography>
              </Box>
            )}

            {/* CHỌN TRƯỜNG VÀ SỰ KIỆN TRÊN CÙNG MỘT HÀNG */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {role === "admin" && (
                <Grid item xs={12} md={6}>
                  <Typography
                    variant="subtitle1"
                    fontWeight={600}
                    sx={{
                      mb: 2,
                      background: "linear-gradient(135deg, #764ba2 0%, #9b59b6 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    🏫 Chọn trường
                  </Typography>
                  <FormControl fullWidth>
                    <Select
                      value={selectedUniversity}
                      onChange={(e) => {
                        setSelectedUniversity(e.target.value);
                        setSelectedEventId("");
                        setSelectedEvent(null);
                      }}
                      displayEmpty
                      sx={{
                        bgcolor: "white",
                        borderRadius: "12px",
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "rgba(118, 75, 162, 0.3)",
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#764ba2",
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#764ba2",
                          borderWidth: "2px",
                        },
                      }}
                      renderValue={(selected) => {
                        if (!selected) {
                          return <span style={{ color: "#9e9e9e" }}>-- Chọn trường --</span>;
                        }
                        const uni = universities.find((u) => u.universityId === selected);
                        return uni ? uni.name : "";
                      }}
                    >
                      <MenuItem value="">
                        <em>-- Tất cả trường --</em>
                      </MenuItem>
                      {universities.map((uni) => (
                        <MenuItem key={uni.universityId} value={uni.universityId}>
                          {uni.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}

              {/* CHỌN SỰ KIỆN */}
              <Grid item xs={12} md={role === "admin" ? 6 : 12}>
                <Typography
                  variant="subtitle1"
                  fontWeight={600}
                  sx={{
                    mb: 2,
                    background: "linear-gradient(135deg, #764ba2 0%, #9b59b6 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  📅 Chọn sự kiện
                </Typography>
                <FormControl fullWidth>
                  <Select
                    value={selectedEventId || ""}
                    onChange={(e) => setSelectedEventId(e.target.value)}
                    displayEmpty
                    disabled={role === "admin" && !selectedUniversity}
                    sx={{
                      bgcolor: "white",
                      borderRadius: "12px",
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(118, 75, 162, 0.3)",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#764ba2",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#764ba2",
                        borderWidth: "2px",
                      },
                    }}
                    renderValue={(selected) => {
                      if (!selected || selected === "") {
                        return <span style={{ color: "#9e9e9e" }}>-- Chọn sự kiện --</span>;
                      }
                      const selectedEvent = events.find((e) => (e.eventId || e.EventId) === selected);
                      if (!selectedEvent) return selected;
                      const title = selectedEvent.title || selectedEvent.Title || "Sự kiện không có tên";
                      const startDate = selectedEvent.startDate || selectedEvent.StartDate;
                      const endDate = selectedEvent.endDate || selectedEvent.EndDate;
                      return `${title}${
                        startDate && endDate
                          ? ` (${new Date(startDate).toLocaleDateString("vi-VN")} - ${new Date(endDate).toLocaleDateString("vi-VN")})`
                          : ""
                      }`;
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          maxHeight: 400,
                          borderRadius: "12px",
                          mt: 1,
                          boxShadow: "0 4px 20px rgba(118, 75, 162, 0.2)",
                          "& .MuiMenuItem-root": {
                            whiteSpace: "normal",
                            wordWrap: "break-word",
                            py: 1.5,
                            px: 2,
                            "&:hover": {
                              background: "linear-gradient(135deg, rgba(118, 75, 162, 0.1) 0%, rgba(155, 89, 182, 0.1) 100%)",
                            },
                          },
                        },
                      },
                    }}
                  >
                    {events.length === 0 ? (
                      <MenuItem disabled>
                        <em>Không có sự kiện nào</em>
                      </MenuItem>
                    ) : (
                      events.map((event, index) => {
                        const eventId = event.eventId || event.EventId;
                        const title = event.title || event.Title || `Sự kiện ${index + 1}`;
                        const startDate = event.startDate || event.StartDate;
                        const endDate = event.endDate || event.EndDate;

                        return (
                          <MenuItem key={eventId || index} value={eventId} sx={{ py: 1.5 }}>
                            <Box sx={{ width: "100%" }}>
                              <Typography variant="body1" sx={{ fontWeight: 500, mb: 0.5 }}>
                                {title}
                              </Typography>
                              {startDate && endDate && (
                                <Typography variant="body2" color="textSecondary">
                                  📅 {new Date(startDate).toLocaleDateString("vi-VN")} - {new Date(endDate).toLocaleDateString("vi-VN")}
                                </Typography>
                              )}
                            </Box>
                          </MenuItem>
                        );
                      })
                    )}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* THÔNG TIN SỰ KIỆN - CHỈ HIỆN KHI ĐÃ CHỌN SỰ KIỆN */}
            {selectedEvent && selectedEventId && (
              <Card
                sx={{
                  background: "linear-gradient(135deg, rgba(118, 75, 162, 0.08) 0%, rgba(155, 89, 182, 0.08) 100%)",
                  border: "2px solid",
                  borderColor: "rgba(118, 75, 162, 0.25)",
                  borderRadius: "12px",
                  mt: 2,
                }}
              >
                <CardContent>
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 2,
                      background: "linear-gradient(135deg, #764ba2 0%, #9b59b6 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      fontWeight: 600,
                    }}
                  >
                    📋 Thông tin sự kiện
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong style={{ color: "#764ba2" }}>Tên:</strong> {selectedEvent.title || selectedEvent.Title}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong style={{ color: "#764ba2" }}>Tổ chức:</strong> {selectedEvent.organizer || selectedEvent.Organizer}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong style={{ color: "#764ba2" }}>Mô tả:</strong> {selectedEvent.description || selectedEvent.Description || "Không có"}
                      </Typography>
                      <Typography variant="body2">
                        <strong style={{ color: "#764ba2" }}>Thời gian:</strong>{" "}
                        {selectedEvent.startDate && selectedEvent.endDate
                          ? `${new Date(selectedEvent.startDate || selectedEvent.StartDate).toLocaleDateString("vi-VN")} - ${new Date(selectedEvent.endDate || selectedEvent.EndDate).toLocaleDateString("vi-VN")}`
                          : "Chưa xác định"}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            )}

            {/* THÔNG BÁO KHÔNG CÓ SỰ KIỆN - LUÔN HIỆN Ở DƯỚI */}
            {!loading && events.length === 0 && (
              <Box sx={{ textAlign: "center", p: 3, mt: 2 }}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    mx: "auto",
                    mb: 2,
                    background: "linear-gradient(135deg, #764ba2 0%, #9b59b6 100%)",
                  }}
                >
                  <EventNoteIcon sx={{ fontSize: 40 }} />
                </Avatar>
                <Typography color="textSecondary" sx={{ mb: 2, fontWeight: 500 }}>
                  Không có sự kiện nào.
                  {role === "organizer"
                    ? " Vui lòng tạo sự kiện trước."
                    : " Liên hệ admin để được cấp quyền."}
                </Typography>
                {role === "organizer" && (
                  <Button
                    variant="contained"
                    sx={{
                      background: "linear-gradient(135deg, #764ba2 0%, #9b59b6 100%)",
                      borderRadius: "25px",
                      px: 4,
                      py: 1.5,
                      "&:hover": {
                        background: "linear-gradient(135deg, #9b59b6 0%, #764ba2 100%)",
                        transform: "translateY(-2px)",
                        boxShadow: "0 6px 20px rgba(118, 75, 162, 0.4)",
                      },
                      transition: "all 0.3s ease",
                    }}
                    onClick={() => (window.location.href = "/events")}
                  >
                    Tạo sự kiện mới
                  </Button>
                )}
              </Box>
            )}
          </CardContent>
        </Card>

        {/* ACTION BUTTONS */}
        {selectedEventId && (
          <Box sx={{ mb: 3, display: "flex", flexWrap: "wrap", gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<PersonAdd />}
              onClick={openAddMenu}
              sx={{
                background: "linear-gradient(135deg, #764ba2 0%, #9b59b6 100%)",
                borderRadius: "25px",
                px: 3,
                py: 1.2,
                fontSize: { xs: "0.875rem", md: "1rem" },
                boxShadow: "0 4px 15px rgba(118, 75, 162, 0.3)",
                "&:hover": {
                  background: "linear-gradient(135deg, #9b59b6 0%, #764ba2 100%)",
                  transform: "translateY(-2px)",
                  boxShadow: "0 6px 20px rgba(118, 75, 162, 0.4)",
                },
                transition: "all 0.3s ease",
              }}
            >
              Thêm sinh viên
            </Button>
            <Button
              variant="contained"
              startIcon={<Upload />}
              onClick={() => setOpenImportDialog(true)}
              sx={{
                background: "linear-gradient(135deg, #8e44ad 0%, #9b59b6 100%)",
                borderRadius: "25px",
                px: 3,
                py: 1.2,
                fontSize: { xs: "0.875rem", md: "1rem" },
                boxShadow: "0 4px 15px rgba(142, 68, 173, 0.3)",
                "&:hover": {
                  background: "linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)",
                  transform: "translateY(-2px)",
                  boxShadow: "0 6px 20px rgba(142, 68, 173, 0.4)",
                },
                transition: "all 0.3s ease",
              }}
            >
              Import CSV
            </Button>
          </Box>
        )}

        {/* STUDENTS TABLE */}
        {selectedEventId && (
          <>
            {/* SEARCH BOX */}
            <Card
              sx={{
                borderRadius: "20px",
                mb: 3,
                boxShadow: "0 4px 20px rgba(118, 75, 162, 0.12)",
                border: "1px solid rgba(118, 75, 162, 0.1)",
              }}
            >
              <CardContent>
                <TextField
                  label="Tìm kiếm theo mã sinh viên"
                  variant="outlined"
                  fullWidth
                  value={studentSearchText}
                  onChange={(e) => setStudentSearchText(e.target.value)}
                  placeholder="Nhập mã sinh viên để tìm kiếm..."
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "12px",
                      "& fieldset": {
                        borderColor: "rgba(118, 75, 162, 0.3)",
                      },
                      "&:hover fieldset": {
                        borderColor: "#764ba2",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#764ba2",
                        borderWidth: "2px",
                      },
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: "#764ba2",
                    },
                  }}
                  InputProps={{
                    startAdornment: <Search sx={{ color: "#764ba2", mr: 1 }} />,
                  }}
                />
                {studentSearchText && (
                  <Chip
                    label={`Tìm thấy ${filteredData.length} sinh viên`}
                    size="small"
                    sx={{
                      mt: 2,
                      background: "linear-gradient(135deg, #764ba2 0%, #9b59b6 100%)",
                      color: "white",
                      fontWeight: 500,
                    }}
                  />
                )}
              </CardContent>
            </Card>

            <Card
              sx={{
                borderRadius: "20px",
                overflow: "hidden",
                boxShadow: "0 8px 32px rgba(118, 75, 162, 0.15)",
                border: "1px solid rgba(118, 75, 162, 0.1)",
              }}
            >
              <Box sx={{ overflowX: "auto" }}>
                <Table>
                  <TableHead>
                    <TableRow
                      sx={{
                        background: "linear-gradient(135deg, #764ba2 0%, #9b59b6 100%)",
                        "& th": {
                          color: "white",
                          fontWeight: 600,
                          fontSize: { xs: "0.875rem", md: "1rem" },
                          py: 2,
                        },
                      }}
                    >
                      <TableCell>Mã sinh viên</TableCell>
                      <TableCell>Tên sinh viên</TableCell>
                      <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>Email</TableCell>
                      <TableCell>Trạng thái</TableCell>
                      <TableCell align="center">Check-in</TableCell>
                      <TableCell align="right">Thao tác</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                          <CircularProgress sx={{ color: "#764ba2" }} />
                        </TableCell>
                      </TableRow>
                    ) : filteredData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                          <Avatar
                            sx={{
                              width: 60,
                              height: 60,
                              mx: "auto",
                              mb: 2,
                              background: "linear-gradient(135deg, #764ba2 0%, #9b59b6 100%)",
                            }}
                          >
                            <PersonIcon sx={{ fontSize: 30 }} />
                          </Avatar>
                          <Typography color="textSecondary">
                            {studentSearchText ? "Không tìm thấy sinh viên nào" : "Chưa có sinh viên nào trong sự kiện"}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      (rowsPerPage > 0 ? filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) : filteredData).map((item, index) => (
                        <TableRow
                          key={item.StudentInEventId || item.studentInEventId}
                          sx={{
                            "&:hover": {
                              background: "linear-gradient(135deg, rgba(118, 75, 162, 0.05) 0%, rgba(155, 89, 182, 0.05) 100%)",
                            },
                            transition: "background 0.3s ease",
                            borderLeft: index % 2 === 0 ? "4px solid #764ba2" : "4px solid #9b59b6",
                          }}
                        >
                          <TableCell sx={{ fontWeight: 500 }}>{item.StudentCode || item.studentCode}</TableCell>
                          <TableCell>{item.StudentName || item.studentName}</TableCell>
                          <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>{item.StudentEmail || item.studentEmail}</TableCell>
                          <TableCell>
                            <FormControl size="small" sx={{ minWidth: 120 }}>
                              <Select
                                value={item.Status || item.status || "registered"}
                                onChange={(e) => handleStatusChange(item.StudentInEventId || item.studentInEventId, e.target.value)}
                                sx={{
                                  borderRadius: "8px",
                                  "& .MuiOutlinedInput-notchedOutline": {
                                    borderColor: "rgba(118, 75, 162, 0.3)",
                                  },
                                  "&:hover .MuiOutlinedInput-notchedOutline": {
                                    borderColor: "#764ba2",
                                  },
                                }}
                              >
                                <MenuItem value="registered">Đã đăng ký</MenuItem>
                                <MenuItem value="attended">Đã tham dự</MenuItem>
                                <MenuItem value="cancelled">Đã hủy</MenuItem>
                              </Select>
                            </FormControl>
                          </TableCell>
                          <TableCell align="center">
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => handleManualCheckIn(item.StudentInEventId || item.studentInEventId, item)}
                              sx={{
                                borderRadius: "20px",
                                borderColor: "#764ba2",
                                color: "#764ba2",
                                fontSize: { xs: "0.75rem", md: "0.875rem" },
                                "&:hover": {
                                  borderColor: "#9b59b6",
                                  background: "rgba(118, 75, 162, 0.1)",
                                },
                              }}
                            >
                              Check-in
                            </Button>
                          </TableCell>
                          <TableCell align="right">
                            <IconButton
                              color="error"
                              onClick={() => handleRemoveStudent(item.StudentInEventId || item.studentInEventId)}
                              sx={{
                                "&:hover": {
                                  background: "rgba(244, 67, 54, 0.1)",
                                  transform: "scale(1.1)",
                                },
                                transition: "all 0.2s ease",
                              }}
                            >
                              <Delete />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </Box>

              <TablePagination
                rowsPerPageOptions={[5, 10, 25, { label: "Tất cả", value: -1 }]}
                component="div"
                count={filteredData.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="Số hàng mỗi trang:"
                labelDisplayedRows={({ from, to, count }) => {
                  if (count === -1) return "Tất cả";
                  return `${from}–${to} trong số ${count}`;
                }}
                sx={{
                  borderTop: "2px solid rgba(118, 75, 162, 0.15)",
                  "& .MuiTablePagination-select": {
                    borderRadius: "8px",
                  },
                  "& .MuiTablePagination-selectIcon": {
                    color: "#764ba2",
                  },
                  "& .MuiTablePagination-actions button": {
                    color: "#764ba2",
                  },
                }}
              />
            </Card>
          </>
        )}

        {/* DIALOGS */}
        <Dialog
          open={openAddDialog}
          onClose={() => setOpenAddDialog(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: "20px",
              boxShadow: "0 8px 32px rgba(118, 75, 162, 0.2)",
            },
          }}
        >
          <DialogTitle
            sx={{
              background: "linear-gradient(135deg, #764ba2 0%, #9b59b6 100%)",
              color: "white",
              fontWeight: 600,
            }}
          >
            Thêm sinh viên vào sự kiện
          </DialogTitle>
          <DialogContent>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Chọn sinh viên</InputLabel>
              <Select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                label="Chọn sinh viên"
              >
                {students
                  .filter((student) => !data.some((d) => d.StudentId === student.StudentId))
                  .map((student) => (
                    <MenuItem key={student.StudentId} value={student.StudentId}>
                      {student.StudentCode} - {student.Name} ({student.Email})
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenAddDialog(false)}>Hủy</Button>
            <Button
              onClick={handleAddStudent}
              variant="contained"
              sx={{
                background: "linear-gradient(135deg, #764ba2 0%, #9b59b6 100%)",
                borderRadius: "20px",
                "&:hover": {
                  background: "linear-gradient(135deg, #9b59b6 0%, #764ba2 100%)",
                },
              }}
            >
              Thêm
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={openBatchDialog}
          onClose={() => setOpenBatchDialog(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{ sx: { borderRadius: "20px", boxShadow: "0 8px 32px rgba(118, 75, 162, 0.2)" } }}
        >
          <DialogTitle
            sx={{
              background: "linear-gradient(135deg, #764ba2 0%, #9b59b6 100%)",
              color: "white",
              fontWeight: 600,
            }}
          >
            Thêm nhiều sinh viên vào sự kiện
          </DialogTitle>
          <DialogContent>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Chọn sinh viên</InputLabel>
              <Select
                multiple
                value={selectedStudentIds}
                onChange={(e) => setSelectedStudentIds(e.target.value)}
                label="Chọn sinh viên"
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((value) => {
                      const student = students.find((s) => s.StudentId === value);
                      return student ? <Chip key={value} label={student.StudentCode} size="small" /> : null;
                    })}
                  </Box>
                )}
              >
                {students
                  .filter((student) => !data.some((d) => d.StudentId === student.StudentId))
                  .map((student) => (
                    <MenuItem key={student.StudentId} value={student.StudentId}>
                      {student.StudentCode} - {student.Name} ({student.Email})
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenBatchDialog(false)}>Hủy</Button>
            <Button
              onClick={handleAddMultipleStudents}
              variant="contained"
              sx={{
                background: "linear-gradient(135deg, #764ba2 0%, #9b59b6 100%)",
                borderRadius: "20px",
                "&:hover": {
                  background: "linear-gradient(135deg, #9b59b6 0%, #764ba2 100%)",
                },
              }}
            >
              Thêm tất cả
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={openImportDialog}
          onClose={() => setOpenImportDialog(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: "20px", boxShadow: "0 8px 32px rgba(118, 75, 162, 0.2)" } }}
        >
          <DialogTitle
            sx={{
              background: "linear-gradient(135deg, #8e44ad 0%, #9b59b6 100%)",
              color: "white",
              fontWeight: 600,
            }}
          >
            Import sinh viên từ CSV
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ mb: 2, mt: 2 }}>
              File CSV cần có định dạng: mã_sinh_viên (cột đầu tiên)
            </Typography>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setCsvFile(e.target.files[0])}
              style={{
                width: "100%",
                padding: "10px",
                border: "2px solid rgba(142, 68, 173, 0.3)",
                borderRadius: "12px",
              }}
            />
            {importResult && (
              <Box sx={{ mt: 2, p: 2, bgcolor: "grey.100", borderRadius: "12px" }}>
                <Typography variant="subtitle2">Kết quả import:</Typography>
                <Typography variant="body2">Tổng xử lý: {importResult.TotalProcessed}</Typography>
                <Typography variant="body2" color="success.main">
                  Thành công: {importResult.SuccessCount}
                </Typography>
                <Typography variant="body2" color="error.main">
                  Thất bại: {importResult.FailureCount}
                </Typography>
                {importResult.Errors.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="subtitle2" color="error.main">
                      Lỗi:
                    </Typography>
                    {importResult.Errors.slice(0, 5).map((error, index) => (
                      <Typography key={index} variant="caption" display="block" color="error.main">
                        • {error}
                      </Typography>
                    ))}
                    {importResult.Errors.length > 5 && (
                      <Typography variant="caption" color="error.main">
                        ... và {importResult.Errors.length - 5} lỗi khác
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { setOpenImportDialog(false); setImportResult(null); setCsvFile(null); }}>
              Đóng
            </Button>
            <Button
              onClick={handleImportCsv}
              variant="contained"
              disabled={!csvFile}
              sx={{
                background: "linear-gradient(135deg, #8e44ad 0%, #9b59b6 100%)",
                borderRadius: "20px",
                "&:hover": {
                  background: "linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)",
                },
              }}
            >
              Import
            </Button>
          </DialogActions>
        </Dialog>

        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={closeAddMenu}>
          <MenuItem onClick={openSingleStudentDialog}>
            <ListItemIcon>
              <PersonIcon sx={{ color: "#764ba2" }} />
            </ListItemIcon>
            <ListItemText primary="Thêm một sinh viên" />
          </MenuItem>
          <MenuItem onClick={openMultiStudentDialog}>
            <ListItemIcon>
              <PeopleIcon sx={{ color: "#764ba2" }} />
            </ListItemIcon>
            <ListItemText primary="Thêm nhiều sinh viên" />
          </MenuItem>
        </Menu>

        <StudentSelectionDialog
          open={selectionDialogOpen}
          onClose={() => setSelectionDialogOpen(false)}
          onConfirm={handleAddStudents}
          title={isMultiSelect ? "Chọn nhiều sinh viên" : "Chọn sinh viên"}
          multiSelect={isMultiSelect}
          eventId={selectedEventId}
          excludeRegistered={true}
        />

        <Dialog
          open={manualCheckInDialogOpen}
          onClose={() => setManualCheckInDialogOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              minWidth: { xs: "90%", sm: "400px" },
              maxWidth: "600px",
              borderRadius: "20px",
              boxShadow: "0 8px 32px rgba(118, 75, 162, 0.2)",
            },
          }}
        >
          <DialogTitle
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              pb: 2,
              borderBottom: "1px solid",
              borderColor: "divider",
              background: "linear-gradient(135deg, #764ba2 0%, #9b59b6 100%)",
              color: "white",
            }}
          >
            <PlaylistAddCheckIcon />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Check-in thủ công
              </Typography>
              {selectedStudent && (
                <Typography
                  variant="subtitle2"
                  sx={{ color: "rgba(255,255,255,0.95)", mt: 0.5 }}
                >
                  {selectedStudent.StudentName || selectedStudent.studentName} (
                  {selectedStudent.StudentCode || selectedStudent.studentCode})
                </Typography>
              )}
            </Box>
          </DialogTitle>
          <DialogContent sx={{ p: 0 }}>
            {manualCheckInLoading ? (
              <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: 200, p: 3 }}>
                <CircularProgress size={40} sx={{ color: "#764ba2" }} />
                <Typography sx={{ mt: 2 }} color="text.secondary">
                  Đang tải danh sách phiên...
                </Typography>
              </Box>
            ) : manualCheckInSessions.length === 0 ? (
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 200, p: 3 }}>
                <Typography color="text.secondary">
                  Không có phiên nào cho sự kiện này
                </Typography>
              </Box>
            ) : (
              <List sx={{ py: 0, maxHeight: "60vh", overflowY: "auto" }}>
                {manualCheckInSessions.map((session, index) => {
                  const sessionId = session.sessionId || session.SessionId;
                  const checkedIn = manualCheckInStatus[sessionId];

                  return (
                    <React.Fragment key={sessionId}>
                      <ListItem
                        sx={{
                          px: 3,
                          py: 2.5,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-start",
                          bgcolor: checkedIn ? "rgba(118, 75, 162, 0.1)" : "transparent",
                          transition: "background-color 0.2s",
                          "&:hover": {
                            bgcolor: checkedIn ? "rgba(118, 75, 162, 0.15)" : "rgba(118, 75, 162, 0.05)",
                          },
                        }}
                      >
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", mb: 1.5 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 500, color: checkedIn ? "#764ba2" : "text.primary" }}>
                            {session.title || session.Title}
                          </Typography>
                          {checkedIn ? (
                            <Chip
                              label="Đã check-in"
                              size="small"
                              icon={<CheckCircleIcon />}
                              sx={{
                                fontWeight: 500,
                                background: "linear-gradient(135deg, #764ba2 0%, #9b59b6 100%)",
                                color: "white",
                              }}
                            />
                          ) : (
                            <Button
                              variant="contained"
                              size="small"
                              onClick={() => handleManualCheckInSession(session)}
                              disabled={manualCheckInLoading}
                              sx={{
                                borderRadius: "20px",
                                px: 2,
                                background: "linear-gradient(135deg, #764ba2 0%, #9b59b6 100%)",
                                "&:hover": {
                                  background: "linear-gradient(135deg, #9b59b6 0%, #764ba2 100%)",
                                },
                              }}
                            >
                              Check-in
                            </Button>
                          )}
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", color: "text.secondary", mt: 1 }}>
                          <AccessTimeIcon sx={{ fontSize: 18, mr: 1 }} />
                          <Typography variant="body2">
                            {new Date(session.startTime || session.StartTime).toLocaleString("vi-VN")} -{" "}
                            {new Date(session.endTime || session.EndTime).toLocaleString("vi-VN")}
                          </Typography>
                        </Box>
                      </ListItem>
                      {index < manualCheckInSessions.length - 1 && <Divider component="li" sx={{ my: 1 }} />}
                    </React.Fragment>
                  );
                })}
              </List>
            )}
          </DialogContent>
          <DialogActions sx={{ borderTop: "1px solid", borderColor: "divider", px: 3, py: 2, bgcolor: "#f9f5ff" }}>
            <Button
              onClick={() => setManualCheckInDialogOpen(false)}
              variant="outlined"
              sx={{
                borderRadius: "20px",
                px: 3,
                borderColor: "#764ba2",
                color: "#764ba2",
                "&:hover": {
                  borderColor: "#9b59b6",
                  bgcolor: "rgba(118, 75, 162, 0.04)",
                },
              }}
            >
              Đóng
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: "top", horizontal: "right" }}>
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled" sx={{ width: "100%", borderRadius: "12px" }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default StudentInEventManagement;

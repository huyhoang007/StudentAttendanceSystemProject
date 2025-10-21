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

  // Dialog states
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openBatchDialog, setOpenBatchDialog] = useState(false);
  const [openImportDialog, setOpenImportDialog] = useState(false);
  const [selectionDialogOpen, setSelectionDialogOpen] = useState(false);
  const [isMultiSelect, setIsMultiSelect] = useState(false);

  // Form states
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [csvFile, setCsvFile] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [studentSearchText, setStudentSearchText] = useState(""); // Tìm kiếm sinh viên

  // Menu state
  const [anchorEl, setAnchorEl] = useState(null);

  const { user, role, organizerId } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch events
  const fetchEvents = async () => {
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

  // Filter data dựa trên tìm kiếm
  const filteredData = data.filter((item) => {
    if (!studentSearchText) return true;
    const studentCode = (
      item.StudentCode ||
      item.studentCode ||
      ""
    ).toLowerCase();
    return studentCode.includes(studentSearchText.toLowerCase());
  });

  // State cho check-in thủ công theo phiên
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
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // Hàm mở dialog chọn phiên khi check-in thủ công
  const handleManualCheckIn = async (studentInEventId) => {
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
      fetchStudentsInEvent();
      setError("");
    } catch (err) {
      setError("Lỗi khi thêm sinh viên: " + (err.message || "Không xác định"));
    }
  };

  // Handle add multiple students
  const handleAddMultipleStudents = async () => {
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
      fetchStudentsInEvent();
      setError("");
    } catch (err) {
      setError(
        "Lỗi khi thêm nhiều sinh viên: " + (err.message || "Không xác định")
      );
    }
  };

  // Handle import CSV
  const handleImportCsv = async () => {
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
      fetchStudentsInEvent();
      setError("");
    } catch (err) {
      setError("Lỗi khi import CSV: " + (err.message || "Không xác định"));
    }
  };

  // Handle add students from dialog
  const handleAddStudents = (studentsToAdd) => {
    if (Array.isArray(studentsToAdd)) {
      // Multiple students
      handleAddMultipleStudentsFromDialog(studentsToAdd);
    } else {
      // Single student
      handleAddSingleStudentFromDialog(studentsToAdd);
    }
  };

  const handleAddSingleStudentFromDialog = async (student) => {
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

      fetchStudentsInEvent();
      setError("");
    } catch (err) {
      setError("Lỗi khi thêm sinh viên: " + (err.message || "Không xác định"));
    }
  };

  const handleAddMultipleStudentsFromDialog = async (studentsToAdd) => {
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

      fetchStudentsInEvent();
      setError("");
    } catch (err) {
      setError(
        "Lỗi khi thêm nhiều sinh viên: " + (err.message || "Không xác định")
      );
    }
  };

  // Menu handlers
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
    try {
      const token = localStorage.getItem("token");
      await updateStudentStatus(studentInEventId, newStatus, token);
      fetchStudentsInEvent();
    } catch (err) {
      setError(
        "Lỗi khi cập nhật trạng thái: " + (err.message || "Không xác định")
      );
    }
  };

  // Handle remove student
  const handleRemoveStudent = async (studentInEventId) => {
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
      fetchStudentsInEvent();
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
    <Box sx={{ p: 2 }}>
      {error && <Box sx={{ color: "red", mb: 2 }}>{error}</Box>}

      <Typography
        variant="h4"
        gutterBottom
        sx={{ color: "#1976d2", fontWeight: 600 }}
      >
        Quản lý sinh viên trong sự kiện
      </Typography>

      {/* Event Selection */}
      <Paper sx={{ p: 2, mb: 2 }}>
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Đang tải dữ liệu...</Typography>
          </Box>
        )}

        {!loading && events.length === 0 && (
          <Box sx={{ textAlign: "center", p: 3 }}>
            <Typography color="textSecondary">
              Không có sự kiện nào.
              {role === "organizer"
                ? " Vui lòng tạo sự kiện trước."
                : " Liên hệ admin để được cấp quyền."}
            </Typography>
            {role === "organizer" && (
              <Button
                variant="contained"
                sx={{ mt: 2 }}
                onClick={() => (window.location.href = "/events")}
              >
                Tạo sự kiện mới
              </Button>
            )}
          </Box>
        )}

        {role === "admin" && (
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              sx={{ mb: 1, color: "#1976d2" }}
            >
              🏫 Chọn trường để xem sự kiện
            </Typography>
            <FormControl fullWidth size="medium">
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
                  minHeight: "56px",
                }}
                renderValue={(selected) => {
                  if (!selected) {
                    return (
                      <span style={{ color: "#9e9e9e" }}>
                        -- Chọn trường --
                      </span>
                    );
                  }
                  const uni = universities.find(
                    (u) => u.universityId === selected
                  );
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
          </Box>
        )}

        {/* Always show dropdown when we have events, regardless of loading state */}
        {events.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, color: "#1976d2" }}>
              Chọn sự kiện để quản lý
            </Typography>

            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={8}>
                <FormControl fullWidth size="medium">
                  <Select
                    value={selectedEventId || ""}
                    onChange={(e) => setSelectedEventId(e.target.value)}
                    displayEmpty
                    sx={{
                      bgcolor: "white",
                      minHeight: "56px",
                    }}
                    renderValue={(selected) => {
                      if (!selected || selected === "") {
                        return (
                          <span style={{ color: "#9e9e9e" }}>
                            -- Chọn sự kiện --
                          </span>
                        );
                      }
                      const selectedEvent = events.find(
                        (e) => (e.eventId || e.EventId) === selected
                      );
                      if (!selectedEvent) return selected;

                      const title =
                        selectedEvent.title ||
                        selectedEvent.Title ||
                        "Sự kiện không có tên";
                      const startDate =
                        selectedEvent.startDate || selectedEvent.StartDate;
                      const endDate =
                        selectedEvent.endDate || selectedEvent.EndDate;

                      return `${title}${
                        startDate && endDate
                          ? ` (${new Date(startDate).toLocaleDateString(
                              "vi-VN"
                            )} - ${new Date(endDate).toLocaleDateString(
                              "vi-VN"
                            )})`
                          : ""
                      }`;
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          maxHeight: 400,
                          "& .MuiMenuItem-root": {
                            whiteSpace: "normal",
                            wordWrap: "break-word",
                            py: 1.5,
                            px: 2,
                          },
                        },
                      },
                    }}
                  >
                    {events.map((event, index) => {
                      const eventId = event.eventId || event.EventId;
                      const title =
                        event.title || event.Title || `Sự kiện ${index + 1}`;
                      const startDate = event.startDate || event.StartDate;
                      const endDate = event.endDate || event.EndDate;

                      return (
                        <MenuItem
                          key={eventId || index}
                          value={eventId}
                          sx={{ py: 1.5 }}
                        >
                          <Box sx={{ width: "100%" }}>
                            <Typography
                              variant="body1"
                              sx={{ fontWeight: 500, mb: 0.5 }}
                            >
                              {title}
                            </Typography>
                            {startDate && endDate && (
                              <Typography variant="body2" color="textSecondary">
                                📅{" "}
                                {new Date(startDate).toLocaleDateString(
                                  "vi-VN"
                                )}{" "}
                                -{" "}
                                {new Date(endDate).toLocaleDateString("vi-VN")}
                              </Typography>
                            )}
                          </Box>
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </Grid>

              {selectedEvent && selectedEventId && (
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2, bgcolor: "#f8f9fa" }}>
                    <Typography variant="h6" sx={{ mb: 1, color: "#1976d2" }}>
                      Thông tin sự kiện
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      <strong>Tên:</strong>{" "}
                      {selectedEvent.title || selectedEvent.Title}
                      <br />
                      <strong>Tổ chức:</strong>{" "}
                      {selectedEvent.organizer || selectedEvent.Organizer}
                      <br />
                      <strong>Mô tả:</strong>{" "}
                      {selectedEvent.description ||
                        selectedEvent.Description ||
                        "Không có"}
                      <br />
                      <strong>Thời gian:</strong>{" "}
                      {selectedEvent.startDate && selectedEvent.endDate
                        ? `${new Date(
                            selectedEvent.startDate || selectedEvent.StartDate
                          ).toLocaleDateString("vi-VN")} - ${new Date(
                            selectedEvent.endDate || selectedEvent.EndDate
                          ).toLocaleDateString("vi-VN")}`
                        : "Chưa xác định"}
                    </Typography>
                  </Paper>
                </Grid>
              )}
            </Grid>
          </Box>
        )}
      </Paper>

      {/* Action Buttons */}
      {selectedEventId && (
        <Box sx={{ mb: 2 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<PersonAdd />}
            onClick={openAddMenu}
            sx={{ mr: 1 }}
          >
            Thêm sinh viên
          </Button>
          <Button
            variant="contained"
            color="success"
            startIcon={<Upload />}
            onClick={() => setOpenImportDialog(true)}
            sx={{ mr: 1 }}
          >
            Import CSV
          </Button>
        </Box>
      )}

      {/* Students Table */}
      {selectedEventId && (
        <>
          {/* Search Box */}
          <Box sx={{ mb: 2 }}>
            <TextField
              label="Tìm kiếm theo mã sinh viên"
              variant="outlined"
              size="small"
              value={studentSearchText}
              onChange={(e) => setStudentSearchText(e.target.value)}
              placeholder="Nhập mã sinh viên để tìm kiếm..."
              sx={{ minWidth: 300 }}
              InputProps={{
                startAdornment: (
                  <Search sx={{ color: "action.active", mr: 1 }} />
                ),
              }}
            />
            {studentSearchText && (
              <Chip
                label={`Tìm thấy ${filteredData.length} sinh viên`}
                size="small"
                sx={{ ml: 2 }}
                color="primary"
                variant="outlined"
              />
            )}
          </Box>

          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Mã sinh viên</TableCell>
                <TableCell>Tên sinh viên</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell align="center">Check-in thủ công</TableCell>
                <TableCell align="right">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    Đang tải...
                  </TableCell>
                </TableRow>
              ) : filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    {studentSearchText
                      ? "Không tìm thấy sinh viên nào"
                      : "Chưa có sinh viên nào trong sự kiện"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((item) => (
                  <TableRow
                    key={item.StudentInEventId || item.studentInEventId}
                  >
                    <TableCell>
                      {item.StudentCode || item.studentCode}
                    </TableCell>
                    <TableCell>
                      {item.StudentName || item.studentName}
                    </TableCell>
                    <TableCell>
                      {item.StudentEmail || item.studentEmail}
                    </TableCell>
                    <TableCell>
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <Select
                          value={item.Status || item.status || "registered"}
                          onChange={(e) =>
                            handleStatusChange(
                              item.StudentInEventId || item.studentInEventId,
                              e.target.value
                            )
                          }
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
                        color="primary"
                        onClick={() =>
                          handleManualCheckIn(
                            item.StudentInEventId || item.studentInEventId,
                            item
                          )
                        }
                      >
                        Check-in
                      </Button>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        color="error"
                        onClick={() =>
                          handleRemoveStudent(
                            item.StudentInEventId || item.studentInEventId
                          )
                        }
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </>
      )}

      {/* Add Single Student Dialog */}
      <Dialog
        open={openAddDialog}
        onClose={() => setOpenAddDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Thêm sinh viên vào sự kiện</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Chọn sinh viên</InputLabel>
            <Select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              label="Chọn sinh viên"
            >
              {students
                .filter(
                  (student) =>
                    !data.some((d) => d.StudentId === student.StudentId)
                )
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
          <Button onClick={handleAddStudent} variant="contained">
            Thêm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Multiple Students Dialog */}
      <Dialog
        open={openBatchDialog}
        onClose={() => setOpenBatchDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Thêm nhiều sinh viên vào sự kiện</DialogTitle>
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
                    return student ? (
                      <Chip
                        key={value}
                        label={student.StudentCode}
                        size="small"
                      />
                    ) : null;
                  })}
                </Box>
              )}
            >
              {students
                .filter(
                  (student) =>
                    !data.some((d) => d.StudentId === student.StudentId)
                )
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
          <Button onClick={handleAddMultipleStudents} variant="contained">
            Thêm tất cả
          </Button>
        </DialogActions>
      </Dialog>

      {/* Import CSV Dialog */}
      <Dialog
        open={openImportDialog}
        onClose={() => setOpenImportDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Import sinh viên từ CSV</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            File CSV cần có định dạng: mã_sinh_viên (cột đầu tiên)
          </Typography>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setCsvFile(e.target.files[0])}
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          />

          {importResult && (
            <Box sx={{ mt: 2, p: 2, bgcolor: "grey.100", borderRadius: 1 }}>
              <Typography variant="subtitle2">Kết quả import:</Typography>
              <Typography variant="body2">
                Tổng xử lý: {importResult.TotalProcessed}
              </Typography>
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
                    <Typography
                      key={index}
                      variant="caption"
                      display="block"
                      color="error.main"
                    >
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
          <Button
            onClick={() => {
              setOpenImportDialog(false);
              setImportResult(null);
              setCsvFile(null);
            }}
          >
            Đóng
          </Button>
          <Button
            onClick={handleImportCsv}
            variant="contained"
            disabled={!csvFile}
          >
            Import
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={closeAddMenu}>
        <MenuItem onClick={openSingleStudentDialog}>
          <ListItemIcon>
            <PersonIcon />
          </ListItemIcon>
          <ListItemText primary="Thêm một sinh viên" />
        </MenuItem>
        <MenuItem onClick={openMultiStudentDialog}>
          <ListItemIcon>
            <PeopleIcon />
          </ListItemIcon>
          <ListItemText primary="Thêm nhiều sinh viên" />
        </MenuItem>
      </Menu>

      {/* Student Selection Dialog */}
      <StudentSelectionDialog
        open={selectionDialogOpen}
        onClose={() => setSelectionDialogOpen(false)}
        onConfirm={handleAddStudents}
        title={isMultiSelect ? "Chọn nhiều sinh viên" : "Chọn sinh viên"}
        multiSelect={isMultiSelect}
        eventId={selectedEventId}
        excludeRegistered={true}
      />

      {/* Dialog chọn phiên khi check-in thủ công */}
      <Dialog
        open={manualCheckInDialogOpen}
        onClose={() => setManualCheckInDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            minWidth: "400px",
            maxWidth: "600px",
            borderRadius: "12px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
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
            bgcolor: "#f8f9fa",
          }}
        >
          <PlaylistAddCheckIcon color="primary" />
          <Box>
            <Typography variant="h6" sx={{ color: "#1976d2", fontWeight: 600 }}>
              Check-in thủ công
            </Typography>
            {selectedStudent && (
              <Typography
                variant="subtitle2"
                sx={{ color: "text.secondary", mt: 0.5 }}
              >
                {selectedStudent.StudentName || selectedStudent.studentName} (
                {selectedStudent.StudentCode || selectedStudent.studentCode})
              </Typography>
            )}
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          {manualCheckInLoading ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                minHeight: 200,
                p: 3,
              }}
            >
              <CircularProgress size={40} />
              <Typography sx={{ mt: 2 }} color="text.secondary">
                Đang tải danh sách phiên...
              </Typography>
            </Box>
          ) : manualCheckInSessions.length === 0 ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: 200,
                p: 3,
              }}
            >
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
                        bgcolor: checkedIn ? "success.soft" : "transparent",
                        transition: "background-color 0.2s",
                        "&:hover": {
                          bgcolor: checkedIn ? "success.soft" : "action.hover",
                        },
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          width: "100%",
                          mb: 1.5,
                        }}
                      >
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: 500,
                            color: checkedIn ? "success.main" : "text.primary",
                          }}
                        >
                          {session.title || session.Title}
                        </Typography>

                        {checkedIn ? (
                          <Chip
                            label="Đã check-in"
                            color="success"
                            size="small"
                            icon={<CheckCircleIcon />}
                            sx={{ fontWeight: 500 }}
                          />
                        ) : (
                          <Button
                            variant="contained"
                            size="small"
                            color="primary"
                            onClick={() => handleManualCheckInSession(session)}
                            disabled={manualCheckInLoading}
                            sx={{
                              borderRadius: "20px",
                              px: 2,
                              "&:hover": {
                                bgcolor: "primary.dark",
                              },
                            }}
                          >
                            Check-in
                          </Button>
                        )}
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          color: "text.secondary",
                          mt: 1,
                        }}
                      >
                        <AccessTimeIcon sx={{ fontSize: 18, mr: 1 }} />
                        <Typography variant="body2">
                          {new Date(
                            session.startTime || session.StartTime
                          ).toLocaleString("vi-VN")}{" "}
                          -{" "}
                          {new Date(
                            session.endTime || session.EndTime
                          ).toLocaleString("vi-VN")}
                        </Typography>
                      </Box>
                    </ListItem>
                    {index < manualCheckInSessions.length - 1 && (
                      <Divider component="li" sx={{ my: 1 }} />
                    )}
                  </React.Fragment>
                );
              })}
            </List>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            borderTop: "1px solid",
            borderColor: "divider",
            px: 3,
            py: 2,
            bgcolor: "#f8f9fa",
          }}
        >
          <Button
            onClick={() => setManualCheckInDialogOpen(false)}
            variant="outlined"
            color="primary"
            sx={{
              borderRadius: "20px",
              px: 3,
              "&:hover": {
                bgcolor: "rgba(25, 118, 210, 0.04)",
              },
            }}
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default StudentInEventManagement;

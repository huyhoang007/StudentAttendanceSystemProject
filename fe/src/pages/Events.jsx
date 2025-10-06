// src/pages/Events.jsx

import React, { useEffect, useState, useCallback } from "react";
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
  Chip,
  Alert,
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  Schedule,
  Group,
  Visibility,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import {
  getEvents,
  addEvent,
  updateEvent,
  deleteEvent,
} from "../services/eventService";
import { getOrganizerById } from "../services/organizerService";
import { useAuth } from "../contexts/AuthContext";

const Events = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const { user, role, organizerId } = useAuth();
  const [organizerInfo, setOrganizerInfo] = useState(null);
  const [form, setForm] = useState({
    Title: "",
    Description: "",
    Organizer: "",
    StartDate: "",
    EndDate: "",
    OrganizerId: "",
  });
  const [eventError, setEventError] = useState("");

  const fetchData = useCallback(async () => {
    try {
      let res;
      console.log("Fetching events. Role:", role, "OrganizerId:", organizerId);

      if (role === "organizer") {
        if (!organizerId) {
          console.warn("Organizer role but no organizerId found");
          setEventError(
            "Không tìm thấy thông tin organizer. Vui lòng đăng xuất và đăng nhập lại."
          );
          setData([]);
          return;
        }

        // Organizer chỉ xem events của mình
        console.log("Fetching events for organizer:", organizerId);
        res = await fetch(`/api/event/by-organizer/${organizerId}`);
        console.log("Response status:", res.status);

        if (!res.ok) {
          const errorText = await res.text();
          console.error("API Error:", errorText);
          throw new Error(`HTTP ${res.status}: ${errorText}`);
        }
        res = await res.json();
        console.log("Events data for organizer:", res);
        console.log("First event sample:", res[0]);
        console.log(
          "Event properties:",
          res.length > 0 ? Object.keys(res[0]) : "No events"
        );
      } else {
        // Admin/user khác xem tất cả events
        console.log("Fetching all events");
        res = await getEvents();
        console.log("All events data:", res);
      }

      setData(Array.isArray(res) ? res : []);
    } catch (error) {
      console.error("Error fetching events:", error);
      setEventError("Không thể tải danh sách sự kiện: " + error.message);
      setData([]);
    }
  }, [role, organizerId]);

  const loadOrganizerInfo = useCallback(async () => {
    if (!organizerId) {
      console.warn("Cannot load organizer info: organizerId is undefined");
      return;
    }

    try {
      console.log(
        "[Events] Loading organizer info for organizerId:",
        organizerId
      );
      const orgData = await getOrganizerById(organizerId);
      console.log("[Events] Organizer info loaded:", orgData);
      console.log("[Events] University data:", orgData.university);
      console.log("[Events] UniversityId:", orgData.universityId);
      setOrganizerInfo(orgData);
    } catch (error) {
      console.error("Error loading organizer info:", error);
    }
  }, [organizerId]);

  useEffect(() => {
    fetchData();
    // Load organizer info when component mounts
    if (role === "organizer" && organizerId) {
      loadOrganizerInfo();
    }
  }, [fetchData, role, organizerId, loadOrganizerInfo]);

  const handleOpen = (item = null) => {
    setEditId(item ? item.eventId || item.EventId : null);
    setForm(
      item
        ? {
            Title: item.title || item.Title || "",
            Description: item.description || item.Description || "",
            Organizer: item.organizer || item.Organizer || "",
            StartDate: item.startDate || item.StartDate || "",
            EndDate: item.endDate || item.EndDate || "",
            OrganizerId:
              role === "organizer" ? organizerId : user ? user.userId : "",
          }
        : {
            Title: "",
            Description: "",
            Organizer: "",
            StartDate: "",
            EndDate: "",
            OrganizerId:
              role === "organizer" ? organizerId : user ? user.userId : "",
          }
    );
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const isGuid = (str) => {
    return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
      str
    );
  };

  const handleSave = async () => {
    // Đảm bảo OrganizerId luôn đúng và là Guid hợp lệ
    let eventData = { ...form };
    if (role === "organizer" && isGuid(organizerId)) {
      eventData.OrganizerId = organizerId;
    } else if (user && isGuid(user.userId)) {
      eventData.OrganizerId = user.userId;
    } else {
      eventData.OrganizerId = "";
    }

    // Đảm bảo ngày không rỗng và đúng định dạng yyyy-MM-dd
    if (!eventData.StartDate || !eventData.EndDate) {
      alert("Vui lòng nhập đầy đủ ngày bắt đầu và ngày kết thúc!");
      return;
    }
    eventData.StartDate = eventData.StartDate.slice(0, 10);
    eventData.EndDate = eventData.EndDate.slice(0, 10);

    // Kiểm tra OrganizerId là GUID hợp lệ
    if (!eventData.OrganizerId || !isGuid(eventData.OrganizerId)) {
      alert(
        "OrganizerId không hợp lệ! Hãy kiểm tra lại tài khoản tổ chức hoặc admin.\nOrganizerId hiện tại: " +
          eventData.OrganizerId
      );
      return;
    }

    // Log dữ liệu gửi lên để debug
    const token = localStorage.getItem("token");
    console.log("Token gửi lên:", token);
    console.log("eventData gửi lên:", eventData);

    setEventError("");
    try {
      if (editId) await updateEvent(editId, eventData, token);
      else await addEvent(eventData, token);
      setOpen(false);
      fetchData();
    } catch (err) {
      if (err && err.message && err.message.includes("401")) {
        setEventError(
          "Bạn không có quyền tạo/sửa sự kiện. Vui lòng đăng nhập bằng tài khoản admin hoặc organizer."
        );
      } else if (err && err.message) {
        setEventError("Lỗi: " + err.message);
      } else {
        setEventError("Lỗi không xác định khi tạo/sửa sự kiện.");
      }
    }
  };
  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa?")) {
      const token = localStorage.getItem("token");
      await deleteEvent(id, token);
      fetchData();
    }
  };

  return (
    <Box>
      {eventError && <Box sx={{ color: "red", mb: 2 }}>{eventError}</Box>}
      <Typography
        variant="h4"
        gutterBottom
        sx={{ color: "#1976d2", fontWeight: 600 }}
      >
        Quản lý sự kiện
      </Typography>
      <Button
        variant="contained"
        color="primary"
        startIcon={<Add />}
        onClick={() => handleOpen()}
        sx={{ mb: 2 }}
      >
        Thêm sự kiện
      </Button>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Tiêu đề</TableCell>
            <TableCell>Mô tả</TableCell>
            <TableCell>Đơn vị tổ chức</TableCell>
            <TableCell>Ngày bắt đầu</TableCell>
            <TableCell>Ngày kết thúc</TableCell>
            {role === "admin" && <TableCell>Quyền hạn</TableCell>}
            <TableCell align="right">Thao tác</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={role === "admin" ? 7 : 6}
                align="center"
                sx={{ py: 3 }}
              >
                {eventError ? (
                  <Typography color="error">{eventError}</Typography>
                ) : (
                  <Typography color="textSecondary">
                    Chưa có sự kiện nào
                  </Typography>
                )}
              </TableCell>
            </TableRow>
          ) : (
            data.map((e) => (
              <TableRow key={e.eventId || e.EventId}>
                <TableCell>
                  <Box>
                    <Typography variant="subtitle2">
                      {e.title || e.Title || "Chưa có tiêu đề"}
                    </Typography>
                    <Chip
                      size="small"
                      label={(() => {
                        const startDate = e.startDate || e.StartDate;
                        const endDate = e.endDate || e.EndDate;

                        if (!startDate || isNaN(new Date(startDate))) {
                          return "Chưa xác định";
                        }

                        const eventStartDate = new Date(startDate);
                        const eventEndDate = endDate ? new Date(endDate) : null;
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
                        const eventEndDateOnly = eventEndDate
                          ? new Date(
                              eventEndDate.getFullYear(),
                              eventEndDate.getMonth(),
                              eventEndDate.getDate()
                            )
                          : null;

                        if (eventStartDateOnly > todayDate) {
                          return "Sắp diễn ra";
                        } else if (
                          eventEndDateOnly &&
                          eventEndDateOnly >= todayDate
                        ) {
                          return "Đang diễn ra";
                        } else if (eventStartDateOnly <= todayDate) {
                          return "Đã diễn ra";
                        }

                        return "Chưa xác định";
                      })()}
                      color={(() => {
                        const startDate = e.startDate || e.StartDate;
                        const endDate = e.endDate || e.EndDate;

                        if (!startDate || isNaN(new Date(startDate))) {
                          return "warning";
                        }

                        const eventStartDate = new Date(startDate);
                        const eventEndDate = endDate ? new Date(endDate) : null;
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
                        const eventEndDateOnly = eventEndDate
                          ? new Date(
                              eventEndDate.getFullYear(),
                              eventEndDate.getMonth(),
                              eventEndDate.getDate()
                            )
                          : null;

                        if (eventStartDateOnly > todayDate) {
                          return "primary";
                        } else if (
                          eventEndDateOnly &&
                          eventEndDateOnly >= todayDate
                        ) {
                          return "success";
                        } else {
                          return "default";
                        }
                      })()}
                    />
                  </Box>
                </TableCell>
                <TableCell>
                  {e.description || e.Description || "Chưa có mô tả"}
                </TableCell>
                <TableCell>
                  {e.organizer || e.Organizer || "Chưa có tổ chức"}
                </TableCell>
                <TableCell>
                  {(e.startDate || e.StartDate) &&
                  !isNaN(new Date(e.startDate || e.StartDate))
                    ? new Date(e.startDate || e.StartDate).toLocaleDateString()
                    : "Invalid Date"}
                </TableCell>
                <TableCell>
                  {(e.endDate || e.EndDate) &&
                  !isNaN(new Date(e.endDate || e.EndDate))
                    ? new Date(e.endDate || e.EndDate).toLocaleDateString()
                    : "Invalid Date"}
                </TableCell>
                {role === "admin" && (
                  <TableCell>
                    <Chip
                      label={
                        e.organizerId === organizerId ||
                        e.OrganizerId === organizerId
                          ? "Admin Override"
                          : "Organizer Event"
                      }
                      color={
                        e.organizerId === organizerId ||
                        e.OrganizerId === organizerId
                          ? "error"
                          : "primary"
                      }
                      size="small"
                    />
                  </TableCell>
                )}
                <TableCell align="right">
                  <Box sx={{ display: "flex", gap: 0.5 }}>
                    <IconButton
                      color="info"
                      title="Quản lý phiên"
                      onClick={() =>
                        navigate(`/sessions?eventId=${e.eventId || e.EventId}`)
                      }
                    >
                      <Schedule />
                    </IconButton>
                    <IconButton
                      color="secondary"
                      title="Quản lý sinh viên"
                      onClick={() =>
                        navigate(
                          `/student-in-event-management?eventId=${
                            e.eventId || e.EventId
                          }`
                        )
                      }
                    >
                      <Group />
                    </IconButton>

                    {/* Organizer có thể edit/delete events của mình, Admin có thể edit/delete tất cả */}
                    {(role === "organizer" &&
                      (e.organizerId === organizerId ||
                        e.OrganizerId === organizerId)) ||
                    role === "admin" ? (
                      <>
                        <IconButton
                          color="primary"
                          title="Sửa sự kiện"
                          onClick={() => handleOpen(e)}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          color="error"
                          title="Xóa sự kiện"
                          onClick={() => handleDelete(e.eventId || e.EventId)}
                        >
                          <Delete />
                        </IconButton>
                      </>
                    ) : (
                      <IconButton
                        color="default"
                        title="Xem chi tiết"
                        onClick={() =>
                          navigate(`/event-details/${e.eventId || e.EventId}`)
                        }
                      >
                        <Visibility />
                      </IconButton>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editId ? "Sửa sự kiện" : "Thêm sự kiện"}</DialogTitle>
        <DialogContent>
          {role === "organizer" && organizerInfo && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Sự kiện này sẽ thuộc về trường:{" "}
              <strong>
                {organizerInfo.university?.name ||
                  organizerInfo.universityName ||
                  "Chưa xác định trường"}
              </strong>
              <br />
              Chỉ sinh viên trong trường này mới có thể xem và đăng ký sự kiện.
            </Alert>
          )}

          <TextField
            label="Tiêu đề"
            fullWidth
            margin="normal"
            value={form.Title}
            onChange={(e) => setForm({ ...form, Title: e.target.value })}
          />
          <TextField
            label="Mô tả"
            fullWidth
            margin="normal"
            value={form.Description}
            onChange={(e) => setForm({ ...form, Description: e.target.value })}
          />
          <TextField
            label="Đơn vị tổ chức"
            fullWidth
            margin="normal"
            value={form.Organizer}
            onChange={(e) => setForm({ ...form, Organizer: e.target.value })}
          />
          <TextField
            label="Ngày bắt đầu"
            type="date"
            fullWidth
            margin="normal"
            value={form.StartDate}
            onChange={(e) => setForm({ ...form, StartDate: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Ngày kết thúc"
            type="date"
            fullWidth
            margin="normal"
            value={form.EndDate}
            onChange={(e) => setForm({ ...form, EndDate: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Hủy</Button>
          <Button onClick={handleSave} variant="contained">
            Lưu
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Events;

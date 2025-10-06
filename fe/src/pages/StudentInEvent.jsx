// src/pages/StudentInEvent.jsx

import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getEvents } from "../services/eventService";
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
} from "@mui/material";
import { Event } from "@mui/icons-material";
import { getStudentInEvents } from "../services/studentInEventService";

const StudentInEvent = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showList, setShowList] = useState(false);
  const [data, setData] = useState([]);
  const { role } = useAuth();

  const fetchData = async () => {
    const res = await getStudentInEvents();
    setData([...res]);
  };
  useEffect(() => {
    fetchData();
    getEvents().then(setEvents);
  }, []);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" fontWeight={600} mb={2}>
        {role === "student" ? (
          <span style={{ color: "#1976d2", fontWeight: 700, fontSize: "2rem" }}>
            Sự kiện đã đăng ký
          </span>
        ) : (
          <span style={{ color: "#1976d2", fontWeight: 700, fontSize: "2rem" }}>
            Quản lý Sinh viên tham gia sự kiện
          </span>
        )}
      </Typography>
      {role !== "student" && !selectedEvent && (
        <>
          <Typography
            variant="h6"
            fontWeight={700}
            mb={2}
            style={{ color: "#1976d2", fontSize: "1.3rem" }}
          >
            Chọn sự kiện để xem chi tiết và điểm danh:
          </Typography>
          <Table sx={{ mb: 3 }}>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Tiêu đề</TableCell>
                <TableCell>Đơn vị tổ chức</TableCell>
                <TableCell>Ngày bắt đầu</TableCell>
                <TableCell>Ngày kết thúc</TableCell>
                <TableCell align="right">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {events.map((ev) => (
                <TableRow key={ev.event_id}>
                  <TableCell>{ev.event_id}</TableCell>
                  <TableCell>{ev.title}</TableCell>
                  <TableCell>{ev.organizer}</TableCell>
                  <TableCell>{ev.start_date}</TableCell>
                  <TableCell>{ev.end_date}</TableCell>
                  <TableCell align="right">
                    <Button
                      variant="outlined"
                      onClick={() => setSelectedEvent(ev)}
                    >
                      Xem chi tiết
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      )}
      {role !== "student" && selectedEvent && !showList && (
        <Box sx={{ mb: 3, display: "flex", justifyContent: "center" }}>
          <Card
            sx={{
              maxWidth: 500,
              width: "100%",
              boxShadow: 4,
              borderRadius: 3,
              p: 3,
              background: "linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Event sx={{ fontSize: 40, color: "#1976d2", mr: 2 }} />
              <Typography variant="h5" fontWeight={700} color="#1976d2">
                {selectedEvent.title}
              </Typography>
            </Box>
            <Typography variant="body1" mb={1}>
              <strong>Mô tả:</strong> {selectedEvent.description}
            </Typography>
            <Typography variant="body1" mb={1}>
              <strong>Đơn vị tổ chức:</strong> {selectedEvent.organizer}
            </Typography>
            <Typography variant="body1" mb={1}>
              <strong>Thời gian:</strong>{" "}
              <span style={{ color: "#388e3c", fontWeight: 600 }}>
                {selectedEvent.start_date} - {selectedEvent.end_date}
              </span>
            </Typography>
            <Box
              sx={{ mt: 3, display: "flex", justifyContent: "space-between" }}
            >
              <Button
                variant="contained"
                color="primary"
                onClick={() => setShowList(true)}
              >
                Xem danh sách tham gia & điểm danh
              </Button>
              <Button
                variant="text"
                color="secondary"
                onClick={() => setSelectedEvent(null)}
              >
                Quay lại
              </Button>
            </Box>
          </Card>
        </Box>
      )}
      {role !== "student" && selectedEvent && showList && (
        <>
          <Typography
            variant="h6"
            fontWeight={700}
            mb={2}
            style={{ color: "#1976d2", fontSize: "1.2rem" }}
          >
            Danh sách sinh viên tham gia sự kiện
          </Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID Sinh viên</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell align="right">Điểm danh</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data
                .filter((s) => s.event_id === selectedEvent.event_id)
                .map((s) => (
                  <TableRow key={s.student_in_event_id}>
                    <TableCell>{s.student_id}</TableCell>
                    <TableCell>{s.status}</TableCell>
                    <TableCell align="right">
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        onClick={() =>
                          alert(
                            `Điểm danh thành công cho sinh viên ${s.student_id}`
                          )
                        }
                      >
                        Điểm danh
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          <Button
            variant="text"
            sx={{ mt: 2 }}
            onClick={() => setShowList(false)}
          >
            Quay lại thông tin sự kiện
          </Button>
        </>
      )}
      {role === "student" && (
        <Box>
          {/* Nút 'Xem tất cả sự kiện để đăng ký' đã bị xóa vì đã có trên navbar */}
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID Sự kiện</TableCell>
                <TableCell>ID Sinh viên</TableCell>
                <TableCell>Trạng thái</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((s) => (
                <TableRow key={s.student_in_event_id}>
                  <TableCell>{s.event_id}</TableCell>
                  <TableCell>{s.student_id}</TableCell>
                  <TableCell>{s.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}
    </Box>
  );
};

export default StudentInEvent;

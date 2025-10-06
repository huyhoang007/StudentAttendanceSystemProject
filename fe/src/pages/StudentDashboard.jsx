import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
} from "@mui/material";
import { CalendarToday, LocationOn, CheckCircle } from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import { getCheckInsByStudent } from "../services/sessionCheckInService";
import { getEventsByStudent } from "../services/studentInEventService";

const StudentDashboard = () => {
  const { user } = useAuth();
  const [checkIns, setCheckIns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Debug state changes
  useEffect(() => {
    console.log("State changed - checkIns:", checkIns, "loading:", loading, "error:", error);
  }, [checkIns, loading, error]);

  // Fetch check-ins data when component mounts
  useEffect(() => {
    const fetchCheckIns = async () => {
      console.log("Debug - User object:", user);
      
      if (!user) {
        console.log("No user found, waiting for authentication");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Hiển thị dữ liệu mock trước để test UI
        console.log("Loading mock data for testing UI");
        const mockData = [
          {
            checkinId: 1,
            sessionId: 'PHIEN_001',
            studentInEventId: 'SIE_001',
            eventName: 'Hội thảo Công nghệ AI 2025',
            checkinTime: '2025-10-06T10:30:00.000Z',
            method: 'QR',
            status: 'Đã check-in'
          },
          {
            checkinId: 2,
            sessionId: 'PHIEN_002', 
            studentInEventId: 'SIE_002',
            eventName: 'Workshop Machine Learning',
            checkinTime: '2025-10-05T14:15:00.000Z',
            method: 'Thủ công',
            status: 'Đã check-in'
          },
          {
            checkinId: 3,
            sessionId: 'PHIEN_003',
            studentInEventId: 'SIE_003', 
            eventName: 'Seminar Blockchain Development',
            checkinTime: '2025-10-04T09:00:00.000Z',
            method: 'QR',
            status: 'Đã check-in'
          }
        ];
        
        console.log("Setting mock check-ins data:", mockData);
        setCheckIns(mockData);
        
        // Thử fetch dữ liệu thật trong background (không blocking UI)
        try {
          const studentId = user?.StudentId || user?.studentId || user?.id || user?.username;
          console.log("Attempting to fetch real data for studentId:", studentId);
          
          if (studentId) {
            // Thử lấy events trước
            const eventsResponse = await getEventsByStudent(studentId);
            console.log("Real events response:", eventsResponse);
            
            // Nếu có dữ liệu thật, sẽ replace mock data
            const events = Array.isArray(eventsResponse) ? eventsResponse : 
                          eventsResponse?.data || [];
            
            if (events && events.length > 0) {
              // Có dữ liệu thật, thử lấy check-ins
              const allCheckIns = [];
              for (const event of events.slice(0, 3)) { // Chỉ lấy 3 events đầu để test
                try {
                  const studentInEventId = event.studentInEventId || event.id;
                  if (studentInEventId) {
                    const checkInsResponse = await getCheckInsByStudent(studentInEventId);
                    const checkInsForEvent = Array.isArray(checkInsResponse) ? checkInsResponse :
                                           checkInsResponse?.data || [];
                    
                    if (checkInsForEvent.length > 0) {
                      const enrichedCheckIns = checkInsForEvent.map(checkIn => ({
                        ...checkIn,
                        eventName: event.eventName || event.Event?.eventName || 'Sự kiện không xác định'
                      }));
                      allCheckIns.push(...enrichedCheckIns);
                    }
                  }
                } catch (eventError) {
                  console.log("Error with individual event:", eventError);
                }
              }
              
              if (allCheckIns.length > 0) {
                console.log("Found real data, replacing mock data:", allCheckIns);
                setCheckIns(allCheckIns);
              }
            }
          }
        } catch (realDataError) {
          console.log("Could not fetch real data, keeping mock data:", realDataError);
          // Vẫn giữ mock data, không báo lỗi
        }
        
      } catch (err) {
        console.error("Error in main flow:", err);
        setError(`Lỗi khi tải dữ liệu: ${err.message || 'Vui lòng thử lại sau'}`);
      } finally {
        setLoading(false);
      }
    };

    // Delay một chút để đảm bảo user data đã được load
    const timeoutId = setTimeout(fetchCheckIns, 500);
    
    return () => clearTimeout(timeoutId);
  }, [user]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Hero Section */}
      <Box sx={{ textAlign: "center", mb: 6 }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: "bold",
            color: "#1976d2",
            mb: 2,
            background: "linear-gradient(45deg, #1976d2, #42a5f5)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          🎓 Chào mừng đến với Hệ thống Điểm danh Sinh viên
        </Typography>
        <Typography variant="h5" sx={{ color: "text.secondary", mb: 3 }}>
          Nhà Văn hóa Sinh viên - Đại học Quốc gia Việt Nam
        </Typography>
        <Typography variant="h6" sx={{ color: "#666", fontWeight: "normal" }}>
          Xin chào,{" "}
          <strong>{user?.name || user?.username || "Sinh viên"}</strong>! Chúc
          bạn có những trải nghiệm tuyệt vời tại các sự kiện của chúng tôi.
        </Typography>
      </Box>

      {/* Main Content */}
      <Grid container spacing={4}>
        {/* Introduction Card - Full Width */}
        <Grid item xs={12}>
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 4 }}>
              <Typography
                variant="h5"
                sx={{ fontWeight: "bold", mb: 3, color: "#1976d2" }}
              >
                📋 Giới thiệu về Hệ thống
              </Typography>

              <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8 }}>
                Hệ thống Điểm danh Sinh viên là một nền tảng hiện đại được phát
                triển dành riêng cho
                <strong>
                  {" "}
                  Nhà Văn hóa Sinh viên - Đại học Quốc gia Việt Nam
                </strong>
                . Chúng tôi cam kết mang đến trải nghiệm tốt nhất cho sinh viên
                trong việc tham gia các hoạt động văn hóa, học thuật và phát
                triển kỹ năng.
              </Typography>

              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", mb: 2, color: "#1976d2" }}
              >
                🎯 Mục tiêu của chúng tôi:
              </Typography>

              <List>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <CheckCircle sx={{ color: "#4caf50" }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Tạo môi trường học tập và sinh hoạt hiện đại"
                    secondary="Ứng dụng công nghệ QR code để điểm danh nhanh chóng và chính xác"
                  />
                </ListItem>

                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <CalendarToday sx={{ color: "#2196f3" }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Kết nối cộng đồng sinh viên ĐHQG"
                    secondary="Tạo sân chơi bổ ích cho sinh viên các trường thành viên"
                  />
                </ListItem>

                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <LocationOn sx={{ color: "#ff9800" }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Phát triển kỹ năng và năng lực cá nhân"
                    secondary="Tổ chức các sự kiện đa dạng từ học thuật đến giải trí"
                  />
                </ListItem>

                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <CheckCircle sx={{ color: "#9c27b0" }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Hỗ trợ quá trình học tập và nghiên cứu"
                    secondary="Cung cấp thông tin và cơ hội tham gia các hoạt động học thuật"
                  />
                </ListItem>
              </List>

              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", mb: 2, mt: 3, color: "#1976d2" }}
              >
                💡 Tính năng nổi bật:
              </Typography>

              <Typography variant="body1" sx={{ mb: 2 }}>
                • <strong>Điểm danh QR Code:</strong> Nhanh chóng, tiện lợi và
                chính xác
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                • <strong>Quản lý sự kiện:</strong> Xem thông tin chi tiết, đăng
                ký tham gia dễ dàng
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                • <strong>Theo dõi lịch sử:</strong> Xem lại các sự kiện đã tham
                gia
              </Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>
                • <strong>Thông báo tự động:</strong> Cập nhật thông tin mới
                nhất về các hoạt động
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Footer */}
      <Paper sx={{ mt: 4, p: 3, bgcolor: "#f8f9fa", textAlign: "center" }}>
        <Typography variant="body1" sx={{ fontWeight: "bold", mb: 1 }}>
          🏛️ Nhà Văn hóa Sinh viên - Đại học Quốc gia Việt Nam
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Nơi kết nối tri thức - Không gian sáng tạo - Môi trường phát triển
          toàn diện
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          © 2025 VNU Student Cultural House. All rights reserved.
        </Typography>
      </Paper>
    </Container>
  );
};

export default StudentDashboard;

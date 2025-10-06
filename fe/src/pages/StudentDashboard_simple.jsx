import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
} from "@mui/material";
import { CheckCircle } from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";

const StudentDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkIns, setCheckIns] = useState([]);

  useEffect(() => {
    const fetchCheckIns = async () => {
      try {
        setLoading(true);
        setError(null);

        // Mock data để test UI
        const mockCheckIns = [
          {
            id: 1,
            eventName: "Hội thảo khoa học",
            checkInTime: "2025-01-05T08:30:00Z",
            status: "present",
          },
          {
            id: 2,
            eventName: "Workshop kỹ năng mềm",
            checkInTime: "2025-01-03T14:15:00Z",
            status: "present",
          },
        ];

        setCheckIns(mockCheckIns);
      } catch (err) {
        console.error("Error in main flow:", err);
        setError(
          `Lỗi khi tải dữ liệu: ${err.message || "Vui lòng thử lại sau"}`
        );
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

              <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.7 }}>
                Hệ thống Điểm danh Sinh viên là nền tảng hiện đại được thiết kế
                đặc biệt để hỗ trợ sinh viên Đại học Quốc gia Việt Nam tham gia
                các hoạt động tại Nhà Văn hóa Sinh viên một cách thuận tiện và
                hiệu quả nhất.
              </Typography>

              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", mb: 2, color: "#1976d2" }}
              >
                🎯 Mục tiêu của hệ thống:
              </Typography>

              <List>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <CheckCircle sx={{ color: "#4caf50" }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Hiện đại hóa quy trình điểm danh"
                    secondary="Sử dụng công nghệ QR Code để tăng tốc độ và độ chính xác"
                  />
                </ListItem>

                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <CheckCircle sx={{ color: "#ff9800" }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Tối ưu hóa trải nghiệm sinh viên"
                    secondary="Giao diện thân thiện, dễ sử dụng trên mọi thiết bị"
                  />
                </ListItem>

                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <CheckCircle sx={{ color: "#2196f3" }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Tăng cường tương tác và kết nối"
                    secondary="Khuyến khích sinh viên tích cực tham gia các hoạt động văn hóa"
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
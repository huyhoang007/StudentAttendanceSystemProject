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
  Divider,
  Chip,
} from "@mui/material";
import {
  CheckCircle,
  School,
  EmojiEvents,
  RocketLaunch,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";

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

        const mockCheckIns = [];

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

    const timeoutId = setTimeout(fetchCheckIns, 500);
    return () => clearTimeout(timeoutId);
  }, [user]);

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Hero Section */}
      <Box
        sx={{
          textAlign: "center",
          mb: 8,
          p: 5,
          borderRadius: 4,
          background: "linear-gradient(135deg, #E3F2FD, #E8F5E9)",
          boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <RocketLaunch
          sx={{
            position: "absolute",
            fontSize: 180,
            color: "rgba(25,118,210,0.05)",
            right: 40,
            top: 20,
          }}
        />
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 2,
          }}
        >
          <img
            src="https://img.icons8.com/fluency/64/000000/student-center.png"
            alt="Student Attendance Logo"
            style={{ width: 60, height: 60, marginRight: 16 }}
          />
          <Typography
            variant="h3"
            sx={{
              fontWeight: "bold",
              color: "#1976d2",
              textShadow: "1px 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            Student Attendance System 
          </Typography>
        </Box>
        <Typography variant="h6" sx={{ color: "text.secondary", mb: 2 }}>
          Nhà Văn hóa Sinh viên - Đại học Quốc gia Việt Nam
        </Typography>
        <Typography variant="h6" sx={{ color: "#333" }}>
          Xin chào,{" "}
          <strong>{user?.name || user?.username || "Sinh viên"}</strong> 👋
          <br />
          Chúc bạn một ngày học tập hiệu quả và tràn đầy năng lượng!
        </Typography>
      </Box>

      {/* Main Content */}
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <Card
            sx={{
              p: 4,
              borderRadius: 4,
              boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
              background: "linear-gradient(145deg, #ffffff, #f5f8fb)",
              transition: "transform 0.3s ease",
              "&:hover": { transform: "translateY(-4px)" },
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" mb={3}>
                <School sx={{ fontSize: 40, color: "#1976d2", mr: 2 }} />
                <Typography
                  variant="h5"
                  sx={{ fontWeight: "bold", color: "#1976d2" }}
                >
                  Giới thiệu về Hệ thống
                </Typography>
              </Box>

              <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8 }}>
                Hệ thống Điểm danh Sinh viên giúp bạn theo dõi hoạt động tham
                gia sự kiện, hỗ trợ quản lý học tập & kết nối cộng đồng sinh
                viên ĐHQG Việt Nam.
              </Typography>

              <Divider sx={{ my: 3 }}>
                <Chip
                  label="🎯 Mục tiêu của hệ thống"
                  color="primary"
                  variant="outlined"
                />
              </Divider>

              <Grid container spacing={2} sx={{ mb: 4 }}>
                {[
                  {
                    color: "#4caf50",
                    title: "Hiện đại hóa quy trình điểm danh",
                    desc: "Ứng dụng QR Code nhanh chóng và chính xác.",
                  },
                  {
                    color: "#ff9800",
                    title: "Tối ưu hóa trải nghiệm sinh viên",
                    desc: "Thiết kế thân thiện, dễ sử dụng trên mọi thiết bị.",
                  },
                  {
                    color: "#2196f3",
                    title: "Tăng cường kết nối cộng đồng",
                    desc: "Khuyến khích sinh viên tham gia hoạt động văn hóa.",
                  },
                  {
                    color: "#9c27b0",
                    title: "Hỗ trợ học tập & nghiên cứu",
                    desc: "Cung cấp cơ hội tham gia sự kiện học thuật.",
                  },
                ].map((item, i) => (
                  <Grid item xs={12} sm={6} key={i}>
                    <Paper
                      sx={{
                        p: 2.5,
                        borderRadius: 3,
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 2,
                        bgcolor: "#fafafa",
                      }}
                    >
                      <CheckCircle sx={{ color: item.color, mt: 0.5 }} />
                      <Box>
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: "bold" }}
                        >
                          {item.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.desc}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>

              <Divider sx={{ my: 3 }}>
                <Chip
                  label="💡 Tính năng nổi bật"
                  color="secondary"
                  variant="outlined"
                />
              </Divider>

              <List>
                {[
                  "Điểm danh QR Code: Nhanh chóng, tiện lợi và chính xác",
                  "Quản lý sự kiện: Xem và đăng ký tham gia dễ dàng",
                  "Theo dõi lịch sử: Xem lại các sự kiện đã tham gia",
                  "Thông báo tự động: Nhận thông tin mới nhất về hoạt động",
                ].map((feature, idx) => (
                  <ListItem key={idx} sx={{ px: 0 }}>
                    <ListItemIcon>
                      <EmojiEvents sx={{ color: "#42a5f5" }} />
                    </ListItemIcon>
                    <ListItemText primary={feature} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Footer */}
      <Paper
        sx={{
          mt: 6,
          py: 3,
          px: 2,
          borderRadius: 3,
          bgcolor: "linear-gradient(135deg, #E3F2FD, #FCE4EC)",
          boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
          textAlign: "center",
        }}
      >
        <Typography
          variant="body1"
          sx={{ fontWeight: "bold", mb: 1, color: "#1976d2" }}
        >
          🏛️ Nhà Văn hóa Sinh viên - Đại học Quốc gia Việt Nam
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Nơi kết nối tri thức • Không gian sáng tạo • Môi trường phát triển
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

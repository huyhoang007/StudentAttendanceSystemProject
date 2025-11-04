import React, { useState, useEffect } from "react";
// ...existing code...
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Avatar,
  Paper,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
} from "@mui/material";
import Logo from "../assets/Logo.png";
import {
  RocketLaunch,
  CheckCircle,
  School,
  EmojiEvents,
  Event as EventIcon,
  QrCodeScanner as QrCodeScannerIcon,
  BarChart as BarChartIcon,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";

const StudentDashboard = () => {
  const { user, role } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkIns, setCheckIns] = useState([]);

  useEffect(() => {
    // ...existing code...
    const fetchCheckIns = async () => {
      try {
        setLoading(true);
        setError(null);

        // giữ nguyên logic hiện tại — ví dụ mock hoặc gọi API
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
  // ...existing code...

  return (
    <Box
      sx={{
        minHeight: "100vh",
        py: 6,
        px: 3,
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
        radial-gradient(circle at 20% 50%, rgba(102, 126, 234, 0.3) 0%, transparent 50%),
        radial-gradient(circle at 80% 80%, rgba(118, 75, 162, 0.3) 0%, transparent 50%),
        radial-gradient(circle at 40% 20%, rgba(240, 147, 251, 0.2) 0%, transparent 50%)
      `,
          animation: "gradientShift 15s ease infinite",
          zIndex: 0,
        },
        "@keyframes gradientShift": {
          "0%, 100%": {
            transform: "translate(0, 0) scale(1)",
          },
          "33%": {
            transform: "translate(30px, -30px) scale(1.1)",
          },
          "66%": {
            transform: "translate(-20px, 20px) scale(0.9)",
          },
        },
      }}
    >
      {/* decorative floating blobs (visual only) */}
      <Box
        sx={{
          position: "absolute",
          width: 220,
          height: 220,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.06)",
          top: 40,
          left: -40,
          filter: "blur(30px)",
          zIndex: 0,
          animation: "floatA 10s ease-in-out infinite",
          "@keyframes floatA": {
            "0%, 100%": { transform: "translateY(0px)" },
            "50%": { transform: "translateY(-18px) translateX(8px)" },
          },
        }}
      />
      <Box
        sx={{
          position: "absolute",
          width: 160,
          height: 160,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.04)",
          bottom: 40,
          right: -30,
          filter: "blur(20px)",
          zIndex: 0,
          animation: "floatB 12s ease-in-out infinite",
          "@keyframes floatB": {
            "0%, 100%": { transform: "translateY(0px)" },
            "50%": { transform: "translateY(-12px) translateX(-6px)" },
          },
        }}
      />
      <Box
        sx={{
          position: "absolute",
          width: 120,
          height: 120,
          borderRadius: "50%",
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
          top: "30%",
          right: "40%",
          filter: "blur(18px)",
          zIndex: 0,
          animation: "floatC 14s ease-in-out infinite",
          "@keyframes floatC": {
            "0%, 100%": { transform: "translateY(0px)" },
            "50%": { transform: "translateY(-10px) translateX(6px)" },
          },
        }}
      />

      <Box sx={{ maxWidth: 1200, mx: "auto", position: "relative", zIndex: 1 }}>
        {/* Main Welcome Card with Dashboard style */}
        <Card
          elevation={0}
          sx={{
            p: 5,
            borderRadius: 5,
            mb: 4,
            background: "rgba(255, 255, 255, 0.98)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 25px 80px rgba(0,0,0,0.2)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            position: "relative",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: -2,
              left: -2,
              right: -2,
              bottom: -2,
              background: "linear-gradient(135deg, #667eea, #764ba2, #f093fb)",
              borderRadius: 5,
              zIndex: -1,
              opacity: 0.1,
              animation: "borderGlow 3s ease infinite",
            },
            "@keyframes borderGlow": {
              "0%, 100%": { opacity: 0.1 },
              "50%": { opacity: 0.3 },
            },
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Avatar
              sx={{
                bgcolor: "#fff",
                width: 110,
                height: 110,
                mb: 3,
                boxShadow: 2,
                padding: "6px",
              }}
            >
              <img
                src={Logo}
                alt="Logo"
                style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: "50%" }}
              />
            </Avatar>
            

            <Typography
              variant="h3"
              fontWeight={800}
              sx={{
                background:
                  "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
                backgroundSize: "200% auto",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                mb: 2,
                textAlign: "center",
                animation: "gradientFlow 4s ease infinite",
                "@keyframes gradientFlow": {
                  "0%, 100%": { backgroundPosition: "0% center" },
                  "50%": { backgroundPosition: "100% center" },
                },
              }}
            >
              Student Attendance System
            </Typography>

            <Box sx={{ textAlign: "center", mb: 2 }}>
              <Typography variant="h5" sx={{ mb: 1, fontWeight: 700, color: "#2d3748", letterSpacing: 0.5 }}>
                🏛️ Nhà Văn Hóa Sinh Viên
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500, fontStyle: "italic" }}>
                Đại học Quốc gia Việt Nam
              </Typography>
            </Box>

            <Box
              sx={{
                mt: 3,
                p: 4,
                borderRadius: 4,
                background: "linear-gradient(135deg, #667eea15 0%, #764ba215 100%)",
                width: "100%",
                maxWidth: 1000,
                border: "2px solid rgba(102, 126, 234, 0.2)",
                position: "relative",
                overflow: "hidden",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: "-100%",
                  width: "100%",
                  height: "100%",
                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                  animation: "shimmer 3s infinite",
                },
                "@keyframes shimmer": {
                  "0%": { left: "-100%" },
                  "100%": { left: "100%" },
                },
              }}
            >
              <Typography variant="h4" align="center" sx={{ fontWeight: 700, color: "#2d3748", mb: 1.5 }}>
                Xin chào, {user?.name || user?.username || "Sinh viên"}! 👋
              </Typography>
              <Typography variant="h6" align="center" color="text.secondary" sx={{ mb: 2.5, fontWeight: 500, lineHeight: 1.6 }}>
                Chúc bạn một ngày học tập hiệu quả và tràn đầy năng lượng!
              </Typography>

              <Box sx={{ display: "flex", justifyContent: "center", gap: 2, flexWrap: "wrap", mb: 2 }}>
                <Button
                  startIcon={<RocketLaunch sx={{ fontSize: 22 }} />}
                  variant="contained"
                  disableElevation
                  sx={{
                    px: 4,
                    py: 1.25,
                    fontSize: "1.05rem",
                    fontWeight: 800,
                    textTransform: "none",
                    borderRadius: 3,
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "#fff",
                    boxShadow: "0 8px 30px rgba(0,0,0,0.18)",
                    "&:hover": { transform: "translateY(-3px)" },
                  }}
                >
                  Trang sinh viên
                </Button>
              </Box>
            </Box>
          </Box>
        </Card>

        {/* Main Student Content (keeps original StudentDashboard JSX structure & logic) */}
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Paper
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
                <Box 
                  display="flex" 
                  alignItems="center" 
                  mb={3}
                  sx={{
                    transition: "all 0.3s ease",
                    p: 1.5,
                    borderRadius: 2,
                    "&:hover": {
                      backgroundColor: "rgba(25, 118, 210, 0.04)",
                      transform: "translateX(8px)",
                      "& .header-icon": {
                        transform: "scale(1.1) rotate(5deg)",
                      },
                      "& .header-text": {
                        background: "linear-gradient(45deg, #1976d2, #42a5f5)",
                        backgroundClip: "text",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        letterSpacing: "0.5px",
                      }
                    }
                  }}
                >
                  <School 
                    className="header-icon"
                    sx={{ 
                      fontSize: 40, 
                      color: "#1976d2", 
                      mr: 2,
                      transition: "transform 0.3s ease",
                    }} 
                  />
                  <Typography 
                    variant="h5" 
                    className="header-text"
                    sx={{ 
                      fontWeight: "bold", 
                      color: "#1976d2",
                      transition: "all 0.3s ease",
                    }}
                  >
                    Giới thiệu về Hệ thống
                  </Typography>
                </Box>

                <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8 }}>
                  Hệ thống Điểm danh Sinh viên giúp bạn theo dõi hoạt động tham gia sự kiện, hỗ trợ quản lý học tập & kết nối cộng đồng sinh viên ĐHQG Việt Nam.
                </Typography>

                <Divider sx={{ my: 3 }}>
                  <Chip 
                    label="🎯 Mục tiêu của hệ thống" 
                    color="primary" 
                    variant="outlined"
                    sx={{
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "scale(1.05)",
                        backgroundColor: "rgba(25, 118, 210, 0.08)", // using primary color with opacity
                      }
                    }}
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
                        elevation={0}
                        sx={{
                          p: 2.5,
                          borderRadius: 3,
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 2,
                          bgcolor: "#fafafa",
                          // Thêm các hiệu ứng hover
                          transition: "all 0.3s cubic-bezier(.17,.67,.83,.67)",
                          position: "relative",
                          "&:hover": {
                            transform: "translateY(-8px)",
                            boxShadow: (theme) => `0 12px 25px ${item.color}15`,
                            "& .icon": {
                              transform: "scale(1.2) rotate(5deg)",
                            },
                            "& .title": {
                              color: item.color,
                            },
                            "&::before": {
                              height: "100%",
                              opacity: 0.05,
                            },
                          },
                          // Thêm gradient overlay
                          "&::before": {
                            content: '""',
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            height: "3px",
                            background: `linear-gradient(90deg, ${item.color}, transparent)`,
                            transition: "all 0.3s ease",
                            opacity: 0.3,
                            borderTopLeftRadius: "12px",
                            borderTopRightRadius: "12px",
                          },
                        }}
                      >
                        <CheckCircle 
                          className="icon"
                          sx={{ 
                            color: item.color,
                            mt: 0.5,
                            transition: "transform 0.3s ease",
                          }} 
                        />
                        <Box>
                          <Typography 
                            variant="subtitle1" 
                            className="title"
                            sx={{ 
                              fontWeight: "bold",
                              transition: "color 0.3s ease",
                            }}
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
                    sx={{
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "scale(1.05)",
                        backgroundColor: "rgba(156, 39, 176, 0.08)",
                      }
                    }}
                  />
                </Divider>

                <List sx={{
                  "& .MuiListItem-root": {
                    transition: "all 0.3s ease",
                    borderRadius: 2,
                    mb: 1,
                    "&:hover": {
                      backgroundColor: "rgba(66, 165, 245, 0.08)",
                      transform: "translateX(8px)",
                      "& .MuiListItemIcon-root": {
                        transform: "scale(1.2) rotate(5deg)",
                      },
                      "& .MuiTypography-root": {
                        color: "#1976d2",
                        fontWeight: 600,
                      }
                    }
                  },
                  "& .MuiListItemIcon-root": {
                    transition: "transform 0.3s ease",
                    minWidth: 40,
                  }
                }}>
                  {[
                    "Điểm danh QR Code: Nhanh chóng, tiện lợi và chính xác",
                    "Quản lý sự kiện: Xem và đăng ký tham gia dễ dàng",
                    "Theo dõi lịch sử: Xem lại các sự kiện đã tham gia",
                    "Thông báo tự động: Nhận thông tin mới nhất về hoạt động",
                  ].map((feature, idx) => (
                    <ListItem 
                      key={idx} 
                      sx={{ 
                        px: 2,
                        animation: `fadeSlideIn 0.5s ease ${idx * 0.1}s both`,
                        "@keyframes fadeSlideIn": {
                          "0%": {
                            opacity: 0,
                            transform: "translateX(-10px)",
                          },
                          "100%": {
                            opacity: 1,
                            transform: "translateX(0)",
                          }
                        }
                      }}
                    >
                      <ListItemIcon>
                        <EmojiEvents 
                          sx={{ 
                            color: "#42a5f5",
                            animation: `pulse 2s infinite ${idx * 0.2}s`,
                            "@keyframes pulse": {
                              "0%, 100%": {
                                transform: "scale(1)",
                              },
                              "50%": {
                                transform: "scale(1.1)",
                              }
                            }
                          }} 
                        />
                      </ListItemIcon>
                      <ListItemText 
                        primary={feature}
                        sx={{
                          "& .MuiTypography-root": {
                            transition: "all 0.3s ease",
                          }
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Paper>
          </Grid>
        </Grid>

        {/* Footer */}
        <Paper
          sx={{
            mt: 6,
            py: 3,
            px: 2,
            borderRadius: 3,
            background: "linear-gradient(135deg, #E3F2FD, #FCE4EC)",
            boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
            textAlign: "center",
          }}
        >
          <Typography variant="body1" sx={{ fontWeight: "bold", mb: 1, color: "#1976d2" }}>
            🏛️ Nhà Văn hóa Sinh viên - Đại học Quốc gia Việt Nam
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Nơi kết nối tri thức • Không gian sáng tạo • Môi trường phát triển toàn diện
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            © 2025 VNU Student Cultural House. All rights reserved.
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};

export default StudentDashboard;
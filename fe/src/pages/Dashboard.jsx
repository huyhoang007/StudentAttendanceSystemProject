// src/pages/Dashboard.jsx

import React from "react";
import {
  Typography,
  Box,
  Card,
  Avatar,
  Chip,
  Grid,
  Paper,
  Button,
} from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import EventIcon from "@mui/icons-material/Event";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PeopleIcon from "@mui/icons-material/People";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import BarChartIcon from "@mui/icons-material/BarChart";
import Logo from "../assets/Logo.png";

const Dashboard = () => {
  const { user, role } = useAuth();
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        py: 6,
        px: 3,
        background: "linear-gradient(135deg, #e9d5ff 0%, #f3e8ff 50%, #faf5ff 100%)",
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
            radial-gradient(circle at 20% 50%, rgba(124, 58, 237, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 40% 20%, rgba(192, 132, 252, 0.06) 0%, transparent 50%)
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
      <Box sx={{ maxWidth: 1200, mx: "auto", position: "relative", zIndex: 1 }}>
        {/* Main Welcome Card */}
        <Card
          elevation={0}
          sx={{
            p: 5,
            borderRadius: 5,
            mb: 4,
            background: "rgba(255, 255, 255, 0.98)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 25px 80px rgba(124, 58, 237, 0.12)",
            border: "1px solid rgba(233, 213, 255, 0.5)",
            position: "relative",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: -2,
              left: -2,
              right: -2,
              bottom: -2,
              background: "linear-gradient(135deg, #e9d5ff, #f3e8ff, #faf5ff)",
              borderRadius: 5,
              zIndex: -1,
              opacity: 0.3,
              animation: "borderGlow 3s ease infinite",
            },
            "@keyframes borderGlow": {
              "0%, 100%": { opacity: 0.2 },
              "50%": { opacity: 0.4 },
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Avatar
              sx={{
                bgcolor: "#fff",
                width: 110,
                height: 110,
                mb: 3,
                boxShadow: "0 8px 24px rgba(124, 58, 237, 0.15)",
                padding: "6px",
                border: "3px solid #f3e8ff",
              }}
            >
              <img
                src={Logo}
                alt="dashboard logo"
                style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: "50%" }}
              />
            </Avatar>

            <Typography
              variant="h3"
              fontWeight={800}
              sx={{
                background:
                  "linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #c084fc 100%)",
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
              Hệ thống Điểm danh Sự kiện
            </Typography>

            <Box sx={{ textAlign: "center", mb: 2 }}>
              <Typography
                variant="h5"
                sx={{
                  mb: 1,
                  fontWeight: 700,
                  color: "#2d3748",
                  letterSpacing: 0.5,
                }}
              >
                🏛️ Nhà Văn Hóa Sinh Viên TP.HCM
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{
                  fontWeight: 500,
                  fontStyle: "italic",
                }}
              >
                Đại học Quốc gia Thành phố Hồ Chí Minh
              </Typography>
            </Box>

            <Box
              sx={{
                mt: 3,
                p: 4,
                borderRadius: 4,
                background: "linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)",
                width: "100%",
                maxWidth: 1000,
                border: "2px solid #e9d5ff",
                position: "relative",
                overflow: "hidden",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: "-100%",
                  width: "100%",
                  height: "100%",
                  background:
                    "linear-gradient(90deg, transparent, rgba(124, 58, 237, 0.1), transparent)",
                  animation: "shimmer 3s infinite",
                },
                "@keyframes shimmer": {
                  "0%": { left: "-100%" },
                  "100%": { left: "100%" },
                },
              }}
            >
              <Typography
                variant="h4"
                align="center"
                sx={{
                  fontWeight: 700,
                  color: "#2d3748",
                  mb: 1.5,
                  textShadow: "0 2px 4px rgba(124, 58, 237, 0.08)",
                }}
              >
                Xin chào, {user?.firstName || user?.username}! 👋
              </Typography>
              <Typography
                variant="h6"
                align="center"
                color="text.secondary"
                sx={{
                  mb: 2.5,
                  fontWeight: 500,
                  lineHeight: 1.6,
                }}
              >
                {role === "admin"
                  ? "Chào mừng đến với bảng điều khiển quản trị. Bạn có toàn quyền quản lý hệ thống, sự kiện, người dùng và thống kê tổng quan."
                  : "Chào mừng đến với bảng điều khiển tổ chức sự kiện. Bạn có thể tạo và quản lý các sự kiện, theo dõi điểm danh sinh viên."}
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 2,
                  flexWrap: "wrap",
                  mb: 2,
                }}
              >
                <Button
                  startIcon={<AdminPanelSettingsIcon sx={{ fontSize: 22 }} />}
                  variant="contained"
                  disableElevation
                  sx={{
                    px: 4,
                    py: 1.25,
                    fontSize: "1.05rem",
                    fontWeight: 800,
                    textTransform: "none",
                    borderRadius: 3,
                    background:
                      role === "admin"
                        ? "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)"
                        : "linear-gradient(135deg, #a855f7 0%, #c084fc 100%)",
                    color: "#fff",
                    boxShadow: "0 8px 30px rgba(124, 58, 237, 0.25)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-3px)",
                      boxShadow: "0 14px 40px rgba(124, 58, 237, 0.3)",
                    },
                  }}
                >
                  {role === "admin"
                    ? "👑 Quản trị viên"
                    : role === "organizer"
                    ? "🎯 Người tổ chức sự kiện"
                    : "🎓 Sinh viên"}
                </Button>
              </Box>

              {/* Quick-action cards */}
              <Box sx={{ mt: 3 }}>
                <Grid
                  container
                  spacing={3}
                  justifyContent="center"
                  alignItems="stretch"
                  wrap={{ xs: "wrap", sm: "nowrap" }}
                  sx={{
                    px: { xs: 0, sm: 2 },
                  }}
                >
                  <Grid item sx={{ flex: "1 1 280px", minWidth: 220, maxWidth: 320 }}>
                    <Paper
                      elevation={0}
                      sx={{
                        boxSizing: "border-box",
                        p: 2.25,
                        borderRadius: 3,
                        textAlign: "center",
                        transition: "transform 0.25s ease, box-shadow 0.25s ease",
                        border: "1px solid #e9d5ff",
                        bgcolor: "#fefbff",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        height: 180,
                        overflow: "visible",
                        "&:hover": {
                          transform: "translateY(-6px)",
                          boxShadow: "0 12px 30px rgba(124, 58, 237, 0.15)",
                          bgcolor: "#faf5ff",
                        },
                      }}
                    >
                      <Avatar
                        sx={{
                          mx: "auto",
                          mb: 1.25,
                          background: "linear-gradient(135deg, #7c3aed, #a855f7)",
                          width: 54,
                          height: 54,
                        }}
                      >
                        <EventIcon sx={{ color: "#fff" }} />
                      </Avatar>
                      <Typography
                        variant="subtitle1"
                        fontWeight={700}
                        sx={{
                          mb: 0.5,
                          fontSize: "1rem",
                          overflowWrap: "break-word",
                          wordBreak: "break-word",
                          height: "1.5em",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#2d3748",
                        }}
                      >
                        Quản lý Sự kiện
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          fontSize: 13,
                          height: "3em",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          px: 1,
                        }}
                      >
                        Tạo & quản lý các phiên sự kiện
                      </Typography>
                    </Paper>
                  </Grid>

                  <Grid item sx={{ flex: "1 1 280px", minWidth: 220, maxWidth: 320 }}>
                    <Paper
                      elevation={0}
                      sx={{
                        boxSizing: "border-box",
                        p: 2.25,
                        borderRadius: 3,
                        textAlign: "center",
                        transition: "transform 0.25s ease, box-shadow 0.25s ease",
                        border: "1px solid #e9d5ff",
                        bgcolor: "#fefbff",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        height: 180,
                        overflow: "visible",
                        "&:hover": {
                          transform: "translateY(-6px)",
                          boxShadow: "0 12px 30px rgba(168, 85, 247, 0.15)",
                          bgcolor: "#faf5ff",
                        },
                      }}
                    >
                      <Avatar
                        sx={{
                          mx: "auto",
                          mb: 1.25,
                          background: "linear-gradient(135deg, #a855f7, #c084fc)",
                          width: 54,
                          height: 54,
                        }}
                      >
                        <QrCodeScannerIcon sx={{ color: "#fff" }} />
                      </Avatar>
                      <Typography
                        variant="subtitle1"
                        fontWeight={700}
                        sx={{
                          mb: 0.5,
                          fontSize: "1rem",
                          overflowWrap: "break-word",
                          wordBreak: "break-word",
                          height: "1.5em",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#2d3748",
                        }}
                      >
                        Điểm danh QR
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          fontSize: 13,
                          height: "3em",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          px: 1,
                        }}
                      >
                        Quét QR / Check-in thủ công
                      </Typography>
                    </Paper>
                  </Grid>

                  <Grid item sx={{ flex: "1 1 280px", minWidth: 220, maxWidth: 320 }}>
                    <Paper
                      elevation={0}
                      sx={{
                        boxSizing: "border-box",
                        p: 2.25,
                        borderRadius: 3,
                        textAlign: "center",
                        transition: "transform 0.25s ease, box-shadow 0.25s ease",
                        border: "1px solid #e9d5ff",
                        bgcolor: "#fefbff",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        height: 180,
                        overflow: "visible",
                        "&:hover": {
                          transform: "translateY(-6px)",
                          boxShadow: "0 12px 30px rgba(192, 132, 252, 0.15)",
                          bgcolor: "#faf5ff",
                        },
                      }}
                    >
                      <Avatar
                        sx={{
                          mx: "auto",
                          mb: 1.25,
                          background: "linear-gradient(135deg, #c084fc, #e9d5ff)",
                          width: 54,
                          height: 54,
                        }}
                      >
                        <BarChartIcon sx={{ color: "#fff" }} />
                      </Avatar>
                      <Typography
                        variant="subtitle1"
                        fontWeight={700}
                        sx={{
                          mb: 0.5,
                          fontSize: "1rem",
                          overflowWrap: "break-word",
                          wordBreak: "break-word",
                          height: "1.5em",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#2d3748",
                        }}
                      >
                        Báo cáo & Thống kê
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          fontSize: 13,
                          height: "3em",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          px: 1,
                        }}
                      >
                        Báo cáo, xuất Excel/PDF, phân tích
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          </Box>
        </Card>

        {/* Info Cards */}
        <Grid
          container
          spacing={3}
          justifyContent="center"
          alignItems="stretch"
          sx={{
            // keep cards centered and consistent width like the sample
            px: 1,
          }}
        >
          {/* make each card a flexible box with controlled min/max width so they sit in one row on wide screens */}
          <Grid item xs={12} sm="auto" sx={{ flex: "1 1 320px", minWidth: 280, maxWidth: 360 }}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 4,
                background: "rgba(255, 255, 255, 0.98)",
                backdropFilter: "blur(20px)",
                boxShadow: "0 12px 40px rgba(124, 58, 237, 0.12)",
                border: "1px solid #e9d5ff",
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                position: "relative",
                overflow: "hidden",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "4px",
                  background: "linear-gradient(90deg, #7c3aed, #a855f7)",
                  transform: "scaleX(0)",
                  transformOrigin: "left",
                  transition: "transform 0.4s ease",
                },
                "&:hover": {
                  transform: "translateY(-12px) scale(1.02)",
                  boxShadow: "0 20px 60px rgba(124, 58, 237, 0.2)",
                  "&::before": {
                    transform: "scaleX(1)",
                  },
                },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <Avatar
                  sx={{
                    background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
                    width: 64,
                    height: 64,
                    mr: 2,
                    boxShadow: "0 8px 20px rgba(124, 58, 237, 0.25)",
                  }}
                >
                  <EventIcon sx={{ color: "#fff", fontSize: 36 }} />
                </Avatar>
                <Box>
                  <Typography
                    variant="h5"
                    fontWeight={700}
                    color="#2d3748"
                    sx={{ mb: 0.5 }}
                  >
                    Quản lý Sự kiện
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontWeight: 600 }}
                  >
                    Event Management System
                  </Typography>
                </Box>
              </Box>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ lineHeight: 1.8, mb: 2 }}
              >
                Tạo, chỉnh sửa và quản lý sự kiện sinh viên tại Nhà Văn Hóa Sinh Viên, hỗ trợ nhiều phiên (session) cho mỗi sự kiện và dễ dàng sử dụng.
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr",
                  gap: 1,
                }}
              >
                <Chip
                  label="📝 Tạo sự kiện"
                  size="small"
                  sx={{
                    bgcolor: "#f3e8ff",
                    color: "#7c3aed",
                    fontWeight: 600,
                    justifyContent: "flex-start",
                  }}
                />
                <Chip
                  label="🕐 Quản lý phiên"
                  size="small"
                  sx={{
                    bgcolor: "#faf5ff",
                    color: "#a855f7",
                    fontWeight: 600,
                    justifyContent: "flex-start",
                  }}
                />
                <Chip
                  label="👥 Quản lý sinh viên"
                  size="small"
                  sx={{
                    bgcolor: "#fefbff",
                    color: "#c084fc",
                    fontWeight: 600,
                    justifyContent: "flex-start",
                  }}
                />
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} sm="auto" sx={{ flex: "1 1 320px", minWidth: 280, maxWidth: 360 }}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 4,
                background: "rgba(255, 255, 255, 0.98)",
                backdropFilter: "blur(20px)",
                boxShadow: "0 12px 40px rgba(168, 85, 247, 0.12)",
                border: "1px solid #e9d5ff",
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                position: "relative",
                overflow: "hidden",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "4px",
                  background: "linear-gradient(90deg, #a855f7, #c084fc)",
                  transform: "scaleX(0)",
                  transformOrigin: "left",
                  transition: "transform 0.4s ease",
                },
                "&:hover": {
                  transform: "translateY(-12px) scale(1.02)",
                  boxShadow: "0 20px 60px rgba(168, 85, 247, 0.2)",
                  "&::before": {
                    transform: "scaleX(1)",
                  },
                },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <Avatar
                  sx={{
                    background: "linear-gradient(135deg, #a855f7 0%, #c084fc 100%)",
                    width: 64,
                    height: 64,
                    mr: 2,
                    boxShadow: "0 8px 20px rgba(168, 85, 247, 0.25)",
                  }}
                >
                  <CheckCircleIcon sx={{ color: "#fff", fontSize: 36 }} />
                </Avatar>
                <Box>
                  <Typography
                    variant="h5"
                    fontWeight={700}
                    color="#2d3748"
                    sx={{ mb: 0.5 }}
                  >
                    Điểm danh Nhanh
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontWeight: 600 }}
                  >
                    QR Check-in System
                  </Typography>
                </Box>
              </Box>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ lineHeight: 1.8, mb: 2 }}
              >
                Điểm danh sinh viên bằng QR code thông minh. Hỗ trợ check-in thủ
                công cho sinh viên không có thiết bị. Ghi nhận thời gian và vị
                trí chính xác.
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr",
                  gap: 1,
                }}
              >
                <Chip
                  label="📱 Quét QR"
                  size="small"
                  sx={{
                    bgcolor: "#f3e8ff",
                    color: "#a855f7",
                    fontWeight: 600,
                    justifyContent: "flex-start",
                  }}
                />
                <Chip
                  label="✍️ Check-in thủ công"
                  size="small"
                  sx={{
                    bgcolor: "#faf5ff",
                    color: "#c084fc",
                    fontWeight: 600,
                    justifyContent: "flex-start",
                  }}
                />
                <Chip
                  label="🕒 Theo dõi thời gian"
                  size="small"
                  sx={{
                    bgcolor: "#fefbff",
                    color: "#7c3aed",
                    fontWeight: 600,
                    justifyContent: "flex-start",
                  }}
                />
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} sm="auto" sx={{ flex: "1 1 320px", minWidth: 280, maxWidth: 360 }}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 4,
                background: "rgba(255, 255, 255, 0.98)",
                backdropFilter: "blur(20px)",
                boxShadow: "0 12px 40px rgba(192, 132, 252, 0.12)",
                border: "1px solid #e9d5ff",
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                position: "relative",
                overflow: "hidden",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "4px",
                  background: "linear-gradient(90deg, #c084fc, #e9d5ff)",
                  transform: "scaleX(0)",
                  transformOrigin: "left",
                  transition: "transform 0.4s ease",
                },
                "&:hover": {
                  transform: "translateY(-12px) scale(1.02)",
                  boxShadow: "0 20px 60px rgba(192, 132, 252, 0.2)",
                  "&::before": {
                    transform: "scaleX(1)",
                  },
                },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <Avatar
                  sx={{
                    background: "linear-gradient(135deg, #c084fc 0%, #e9d5ff 100%)",
                    width: 64,
                    height: 64,
                    mr: 2,
                    boxShadow: "0 8px 20px rgba(192, 132, 252, 0.25)",
                  }}
                >
                  <PeopleIcon sx={{ color: "#fff", fontSize: 36 }} />
                </Avatar>
                <Box>
                  <Typography
                    variant="h5"
                    fontWeight={700}
                    color="#2d3748"
                    sx={{ mb: 0.5 }}
                  >
                    Báo cáo & Thống kê
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontWeight: 600 }}
                  >
                    Reports & Analytics
                  </Typography>
                </Box>
              </Box>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ lineHeight: 1.8, mb: 2 }}
              >
                Xem báo cáo chi tiết về sự tham gia sinh viên. Thống kê theo
                trường, theo sự kiện, theo ngày. Xuất file Excel/PDF dễ dàng.
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr",
                  gap: 1,
                }}
              >
                <Chip
                  label="📊 Dashboard thống kê"
                  size="small"
                  sx={{
                    bgcolor: "#f3e8ff",
                    color: "#c084fc",
                    fontWeight: 600,
                    justifyContent: "flex-start",
                  }}
                />
                <Chip
                  label="📥 Xuất Excel/PDF"
                  size="small"
                  sx={{
                    bgcolor: "#faf5ff",
                    color: "#a855f7",
                    fontWeight: 600,
                    justifyContent: "flex-start",
                  }}
                />
                <Chip
                  label="📈 Phân tích xu hướng"
                  size="small"
                  sx={{
                    bgcolor: "#fefbff",
                    color: "#7c3aed",
                    fontWeight: 600,
                    justifyContent: "flex-start",
                  }}
                />
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Dashboard;

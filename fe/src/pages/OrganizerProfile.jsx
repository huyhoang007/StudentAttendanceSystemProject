import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Container,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  Avatar,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {
  Person,
  Business,
  Phone,
  School,
  Save,
  EditNote,
  Lock,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import {
  getOrganizerByUserId,
  updateProfile,
} from "../services/organizerService";
import { getUniversities } from "../services/universityService";
import { changePassword } from "../services/authService";

// Định nghĩa theme với tông màu tím
const purpleTheme = createTheme({
  palette: {
    primary: {
      main: '#673ab7', // Màu tím đậm chính
      light: '#9a67ea', // Tím nhạt hơn
      dark: '#320b86', // Tím đậm hơn
    },
    secondary: {
      main: '#9c27b0', // Màu tím magenta
    },
    background: {
      default: '#f3e5f5', // Nền màu tím rất nhạt
      paper: '#ffffff', // Nền card và dialog
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          background: 'linear-gradient(135deg, #7e57c2 0%, #9c27b0 100%)', // Gradient tím
          color: 'white',
          '&:hover': {
            background: 'linear-gradient(135deg, #673ab7 0%, #8e24aa 100%)',
          },
        },
      },
    },
    MuiPaper: { // Style cho Paper (chính là form profile)
      styleOverrides: {
        root: {
          borderRadius: 16, // Bo tròn nhiều hơn cho Paper
          boxShadow: '0 12px 40px rgba(0,0,0,0.15)', // Đổ bóng mềm mại hơn
          background: 'rgba(255,255,255,0.95)', // Hơi trong suốt
          backdropFilter: 'blur(8px)', // Hiệu ứng làm mờ nền
          border: '1px solid rgba(255,255,255,0.3)',
          transition: "transform 0.3s ease-in-out",
          "&:hover": {
            transform: "translateY(-8px)", // Hiệu ứng nổi lên mạnh hơn
            boxShadow: '0 18px 50px rgba(0,0,0,0.25)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8, // Bo tròn cho input
            '& fieldset': {
              borderColor: '#d1c4e9', // Viền tím nhạt
            },
            '&:hover fieldset': {
              borderColor: '#9575cd', // Viền tím đậm hơn khi hover
            },
            '&.Mui-focused fieldset': {
              borderColor: '#673ab7', // Viền tím đậm khi focus
            },
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: '#673ab7', // Label tím khi focus
          },
        },
      },
    },
    MuiInputAdornment: {
      styleOverrides: {
        root: {
          color: '#9575cd', // Icon màu tím nhạt
        }
      }
    }
  },
});

const OrganizerProfile = () => {
  const { user, organizerId } = useAuth();

  const [profile, setProfile] = useState({
    organizerName: "",
    organization: "",
    phone: "",
    universityId: "",
  });
  const [universities, setUniversities] = useState([]);
  const [message, setMessage] = useState({ text: "", type: "success" });
  const [openSnackbar, setOpenSnackbar] = useState(false);

  // Change password states
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const organizerData = await getOrganizerByUserId(user.userId);
        setProfile({
          organizerName: organizerData.organizerName || "",
          organization: organizerData.organization || "",
          phone: organizerData.phone || "",
          universityId: organizerData.universityId || "",
        });

        const universitiesData = await getUniversities();
        setUniversities(universitiesData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setMessage({
          text: "Error loading profile: " + (error.message || "Unknown error"),
          type: "error",
        });
        setOpenSnackbar(true);
      }
    };

    if (user?.userId) {
      fetchData();
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!profile.organizerName?.trim()) {
        throw new Error("Organizer Name is required");
      }

      const dataToSend = {
        organizerName: profile.organizerName,
        organization: profile.organization || null,
        phone: profile.phone || null,
      };

      const updatedProfile = await updateProfile(dataToSend);

      if (updatedProfile && updatedProfile.organizerName) {
        setProfile({
          organizerName: updatedProfile.organizerName,
          organization: updatedProfile.organization || "",
          phone: updatedProfile.phone || "",
          universityId: updatedProfile.universityId || "",
        });
        setMessage({ text: "Profile updated successfully", type: "success" });
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Profile update failed:", error);
      let errorMessage = "Failed to update profile";

      if (error.data?.message) {
        errorMessage = error.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setMessage({ text: errorMessage, type: "error" });
    }
    setOpenSnackbar(true);
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const handleOpenPasswordDialog = () => {
    setPasswordDialogOpen(true);
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handleClosePasswordDialog = () => {
    setPasswordDialogOpen(false);
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ text: "Mật khẩu mới không khớp!", type: "error" });
      setOpenSnackbar(true);
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setMessage({ text: "Mật khẩu mới phải có ít nhất 6 ký tự!", type: "error" });
      setOpenSnackbar(true);
      return;
    }

    try {
      setPasswordLoading(true);
      await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setMessage({ text: "Đổi mật khẩu thành công!", type: "success" });
      setOpenSnackbar(true);
      handleClosePasswordDialog();
    } catch (error) {
      console.error("Error changing password:", error);
      setMessage({ 
        text: error?.message || "Có lỗi khi đổi mật khẩu. Vui lòng kiểm tra lại mật khẩu hiện tại.", 
        type: "error" 
      });
      setOpenSnackbar(true);
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <ThemeProvider theme={purpleTheme}> {/* Áp dụng theme tím */}
      <Container
        maxWidth="sm"
        sx={{
          position: "relative",
          display: 'flex', // Để căn giữa Paper
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 'calc(100vh - 64px)', // Đảm bảo chiếm gần hết chiều cao màn hình (trừ header)
          pb: 4, // Thêm padding bottom
          pt: 2, // Thêm padding top
          backgroundColor: purpleTheme.palette.background.default, // Nền tím nhạt cho container
        }}
      >
        {/* Nền gradient nhẹ cho Container, ẩn dưới Paper */}
        <Box
          sx={{
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "linear-gradient(135deg, rgba(159, 94, 235, 0.1) 0%, rgba(190, 150, 240, 0.1) 100%)",
            borderRadius: 4,
            zIndex: -1,
          }}
        />
        <Paper
          elevation={3}
          sx={{
            p: { xs: 3, md: 4 },
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: '100%', // Đảm bảo Paper chiếm đủ chiều rộng
            maxWidth: 500, // Giới hạn chiều rộng tối đa
            // Các style khác đã được chuyển vào theme.components.MuiPaper
          }}
        >
          {/* === HEADER MỚI === */}
          <Avatar
            sx={{
              width: 80,
              height: 80,
              m: 1,
              background: "linear-gradient(45deg, #7e57c2 30%, #9c27b0 90%)", // Gradient tím
              boxShadow: "0 3px 15px rgba(126, 87, 194, 0.4)", // Shadow tím
              transition: "transform 0.3s ease",
              "&:hover": {
                transform: "scale(1.1)",
              },
            }}
          >
            <EditNote sx={{ fontSize: 40, color: 'white' }} /> {/* Icon màu trắng */}
          </Avatar>
          <Typography
            component="h1"
            variant="h4"
            gutterBottom
            sx={{
              fontWeight: 700,
              background: "linear-gradient(45deg, #42a5f5 30%, #673ab7 90%)", // Gradient màu xanh-tím cho text
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
              textAlign: "center",
              mb: 1,
            }}
          >
            Hồ sơ Người Tổ chức
          </Typography>
          <Typography
            variant="body1"
            align="center"
            sx={{
              mb: 3,
              fontSize: "1.1rem",
              maxWidth: "80%",
              lineHeight: 1.6,
              background: "linear-gradient(45deg, #42a5f5 30%, #673ab7 90%)", // Gradient màu xanh-tím cho text
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
            }}
          >
            Cập nhật và quản lý thông tin của bạn.
          </Typography>
          {/* === KẾT THÚC HEADER === */}

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ mt: 1, width: "100%" }}
          >
            <TextField
              fullWidth
              label="Tên Người Tổ chức"
              name="organizerName"
              value={profile.organizerName}
              onChange={handleInputChange}
              margin="normal"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person /> {/* Icon sẽ tự động nhận màu từ theme.components.MuiInputAdornment */}
                  </InputAdornment>
                ),
              }}
              // Các style cho TextField đã được định nghĩa trong theme.components.MuiTextField
            />
            <TextField
              fullWidth
              label="Đơn vị"
              name="organization"
              value={profile.organization}
              onChange={handleInputChange}
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Business />
                  </InputAdornment>
                ),
              }}
              // Các style cho TextField đã được định nghĩa trong theme.components.MuiTextField
            />
            <TextField
              fullWidth
              label="Số Điện Thoại"
              name="phone"
              value={profile.phone}
              onChange={handleInputChange}
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone />
                  </InputAdornment>
                ),
              }}
              // Các style cho TextField đã được định nghĩa trong theme.components.MuiTextField
            />
            {profile.universityId && (
              <TextField
                fullWidth
                label="Trường"
                value={
                  universities.find(
                    (u) => u.universityId === profile.universityId
                  )?.name || ""
                }
                margin="normal"
                disabled
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <School />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&.Mui-disabled": {
                      backgroundColor: 'rgba(126,87,194,0.05)', // Nền tím nhạt cho disabled
                      "& fieldset": {
                        borderColor: 'rgba(126,87,194,0.3)', // Viền tím nhạt hơn
                      },
                    },
                  },
                  "& .Mui-disabled .MuiInputAdornment-root": {
                    color: 'rgba(126,87,194,0.7)', // Icon tím nhạt hơn khi disabled
                  },
                }}
              />
            )}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              startIcon={<Save />}
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                fontWeight: 600,
                fontSize: "1.1rem",
              }}
            >
              Cập nhật Hồ sơ
            </Button>

            <Button
              fullWidth
              variant="outlined"
              color="primary"
              startIcon={<Lock />}
              onClick={handleOpenPasswordDialog}
              sx={{ mb: 2, py: 1.5, fontWeight: 600 }}
            >
              Đổi mật khẩu
            </Button>
          </Box>
        </Paper>

        {/* Change Password Dialog */}
        <Dialog 
          open={passwordDialogOpen} 
          onClose={handleClosePasswordDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ 
            background: "linear-gradient(45deg, #7e57c2 30%, #9c27b0 90%)",
            color: "white",
            fontWeight: 600
          }}>
            Đổi mật khẩu
          </DialogTitle>
          <form onSubmit={handleChangePassword}>
            <DialogContent sx={{ pt: 3 }}>
              <TextField
                fullWidth
                label="Mật khẩu hiện tại"
                name="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                required
                margin="normal"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        edge="end"
                      >
                        {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                label="Mật khẩu mới"
                name="newPassword"
                type={showNewPassword ? "text" : "password"}
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                required
                margin="normal"
                helperText="Mật khẩu phải có ít nhất 6 ký tự"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        edge="end"
                      >
                        {showNewPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                label="Xác nhận mật khẩu mới"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                required
                margin="normal"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </DialogContent>
            <DialogActions sx={{ p: 3, pt: 0 }}>
              <Button onClick={handleClosePasswordDialog} disabled={passwordLoading}>
                Hủy
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                disabled={passwordLoading}
                sx={{
                  background: "linear-gradient(45deg, #7e57c2 30%, #9c27b0 90%)",
                  color: "white"
                }}
              >
                {passwordLoading ? <CircularProgress size={24} /> : "Đổi mật khẩu"}
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        <Snackbar
          open={openSnackbar}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert onClose={handleCloseSnackbar} severity={message.type}>
            {message.text}
          </Alert>
        </Snackbar>
      </Container>
    </ThemeProvider>
  );
};

export default OrganizerProfile;
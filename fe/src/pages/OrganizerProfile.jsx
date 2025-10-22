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
  Avatar, // Thêm Avatar
  InputAdornment, // Thêm InputAdornment
} from "@mui/material";
// Thêm các icon
import {
  Person,
  Business,
  Phone,
  School,
  Save,
  EditNote, // Icon cho Avatar
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import {
  getOrganizerByUserId,
  updateProfile,
} from "../services/organizerService";
import { getUniversities } from "../services/universityService";

const OrganizerProfile = () => {
  const { user, organizerId } = useAuth();

  // Custom styles
  const gradientButtonStyle = {
    background: "linear-gradient(90deg, #74ebd5 0%, #ACB6E5 100%)",
    color: "white",
    transition: "all 0.3s ease",
    "&:hover": {
      background: "linear-gradient(90deg, #63d9c3 0%, #9BA5E3 100%)",
      transform: "translateY(-2px)",
      boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
    },
  };
  const [profile, setProfile] = useState({
    organizerName: "",
    organization: "",
    phone: "",
    universityId: "",
  });
  const [universities, setUniversities] = useState([]);
  const [message, setMessage] = useState({ text: "", type: "success" });
  const [openSnackbar, setOpenSnackbar] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch organizer profile
        const organizerData = await getOrganizerByUserId(user.userId);
        console.log("Organizer data:", organizerData); // Debug log
        setProfile({
          organizerName: organizerData.organizerName || "",
          organization: organizerData.organization || "",
          phone: organizerData.phone || "",
          universityId: organizerData.universityId || "",
        });

        // Fetch universities
        const universitiesData = await getUniversities();
        setUniversities(universitiesData);
      } catch (error) {
        console.error("Error fetching data:", error); // Debug log
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
      console.log("Current profile state:", profile); // Debug log

      // Validate required fields
      if (!profile.organizerName?.trim()) {
        throw new Error("Organizer Name is required");
      }

      // Convert universityId to proper format
      const dataToSend = {
        organizerName: profile.organizerName,
        organization: profile.organization || null,
        phone: profile.phone || null,
      };

      console.log("Sending to server:", dataToSend); // Debug log
      const updatedProfile = await updateProfile(dataToSend);
      console.log("Server returned:", updatedProfile); // Debug log

      // Only update state if we got valid data back
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
      console.error("Profile update failed:", error); // Debug log with full error
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

  // PHẦN GIAO DIỆN (JSX) ĐƯỢC NÂNG CẤP
  return (
    <Container
      maxWidth="sm"
      sx={{
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            "linear-gradient(135deg, rgba(116,235,213,0.1) 0%, rgba(172,182,229,0.1) 100%)",
          borderRadius: 4,
          zIndex: -1,
        },
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: { xs: 3, md: 4 },
          mt: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.95) 100%)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255,255,255,0.3)",
          borderRadius: 3,
          boxShadow: "0 8px 32px 0 rgba(31,38,135,0.37)",
          transition: "transform 0.2s ease-in-out",
          "&:hover": {
            transform: "translateY(-5px)",
          },
        }}
      >
        {/* === HEADER MỚI === */}
        <Avatar
          sx={{
            width: 80,
            height: 80,
            m: 1,
            background: "linear-gradient(45deg, #74ebd5 30%, #ACB6E5 90%)",
            boxShadow: "0 3px 15px rgba(116,235,213,0.3)",
            transition: "transform 0.3s ease",
            "&:hover": {
              transform: "scale(1.1)",
            },
          }}
        >
          <EditNote sx={{ fontSize: 40 }} />
        </Avatar>
        <Typography
          component="h1"
          variant="h4"
          gutterBottom
          sx={{
            fontWeight: 700,
            background: "linear-gradient(45deg, #2b5876 30%, #4e4376 90%)",
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
            background: "linear-gradient(45deg, #2b5876 30%, #4e4376 90%)",
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
          sx={{ mt: 1, width: "100%" }} // Đảm bảo form chiếm đủ chiều rộng
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
                  <Person sx={{ color: "#74ebd5" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                "&:hover fieldset": {
                  borderColor: "#ACB6E5",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#74ebd5",
                },
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: "#74ebd5",
              },
            }}
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
                  <Business sx={{ color: "#74ebd5" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                "&:hover fieldset": {
                  borderColor: "#ACB6E5",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#74ebd5",
                },
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: "#74ebd5",
              },
            }}
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
                  <Phone sx={{ color: "#74ebd5" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                "&:hover fieldset": {
                  borderColor: "#ACB6E5",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#74ebd5",
                },
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: "#74ebd5",
              },
            }}
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
                    <School sx={{ color: "#74ebd5" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "&.Mui-disabled": {
                    backgroundColor: "rgba(116,235,213,0.05)",
                    "& fieldset": {
                      borderColor: "rgba(172,182,229,0.3)",
                    },
                  },
                },
                "& .Mui-disabled .MuiInputAdornment-root": {
                  color: "rgba(116,235,213,0.7)",
                },
              }}
            />
          )}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            startIcon={<Save />}
            sx={{
              mt: 3,
              mb: 2,
              py: 1.5,
              background: "linear-gradient(90deg, #74ebd5 0%, #ACB6E5 100%)",
              color: "white",
              fontWeight: 600,
              fontSize: "1.1rem",
              transition: "all 0.3s ease",
              "&:hover": {
                background: "linear-gradient(90deg, #63d9c3 0%, #9BA5E3 100%)",
                transform: "translateY(-2px)",
                boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
              },
            }}
          >
            Cập nhật Hồ sơ
          </Button>
        </Box>
      </Paper>

      {/* Snackbar không thay đổi */}
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
  );
};

export default OrganizerProfile;

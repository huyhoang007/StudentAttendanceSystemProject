import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Paper,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  QrCodeScanner,
  QrCode2,
  CheckCircle,
  Schedule,
  Event as EventIcon,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import { useLocation } from "react-router-dom";
import MobileCameraQRScanner from "../components/MobileCameraQRScanner";

const CheckIn = () => {
  const { user, role } = useAuth();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [checkInStatus, setCheckInStatus] = useState(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [isAutoCheckIn, setIsAutoCheckIn] = useState(false);

  // Handle QR scan success
  const handleQRScanSuccess = useCallback(
    async (qrData) => {
      console.log("QR Scan successful:", qrData);
      console.log("Current user data:", user);
      console.log("Current role:", role);

      // Set loading state
      setLoading(true);

      // Add timeout protection (10 seconds)
      const timeoutId = setTimeout(() => {
        console.error("Check-in timeout after 10 seconds");
        setLoading(false);
        setIsAutoCheckIn(false);
        setCheckInStatus({
          type: "error",
          message: "Quá trình điểm danh bị timeout. Vui lòng thử lại.",
        });
      }, 10000);

      // Check if user is logged in and is a student
      if (!user) {
        clearTimeout(timeoutId);
        setCheckInStatus({
          type: "error",
          message:
            "Bạn cần đăng nhập trước khi check-in. Vui lòng đăng nhập với tài khoản sinh viên.",
        });
        setLoading(false);
        setIsAutoCheckIn(false);
        return;
      }

      if (role !== "student") {
        clearTimeout(timeoutId);
        setCheckInStatus({
          type: "error",
          message: "Chỉ sinh viên mới có thể check-in điểm danh.",
        });
        setLoading(false);
        setIsAutoCheckIn(false);
        return;
      }

      if (!user.studentId && !user.StudentId) {
        clearTimeout(timeoutId);
        setCheckInStatus({
          type: "error",
          message:
            "Không tìm thấy thông tin sinh viên. Vui lòng đăng nhập lại.",
        });
        setLoading(false);
        setIsAutoCheckIn(false);
        return;
      }

      try {
        // First, get student details to get the correct StudentCode
        console.log("Fetching student details for studentId:", user.studentId);
        const authToken = localStorage.getItem("authToken");
        const studentRes = await fetch(`/api/Student/${user.studentId}`, {
          headers: {
            "Content-Type": "application/json",
            ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
          },
        });

        if (!studentRes.ok) {
          throw new Error("Cannot fetch student details");
        }

        const studentData = await studentRes.json();
        console.log("Student data from API:", studentData);

        const studentCode =
          studentData.studentCode ||
          studentData.StudentCode ||
          studentData.student_code ||
          studentData.code ||
          studentData.Code;
        console.log("Extracted StudentCode:", studentCode);

        if (!studentCode) {
          throw new Error("Student code not found");
        }

        // Call API to check in student using QR data
        const checkInData = {
          QRCode: qrData.sessionId, // Backend expects just the sessionId as string
          StudentCode: studentCode, // Use the real StudentCode from database
          Location: qrData.location || null,
        };

        console.log("QR Data eventId:", qrData.eventId);
        console.log("User studentId from login:", user.studentId);
        console.log("Real StudentCode from database:", studentCode);
        console.log("Sending check-in data:", checkInData);

        console.log("Sending QR check-in with payload:", checkInData);
        const authTokenForCheckIn = localStorage.getItem("authToken");
        const checkInRes = await fetch("/api/CheckIn/qr-checkin", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(authTokenForCheckIn ? { Authorization: `Bearer ${authTokenForCheckIn}` } : {}),
          },
          body: JSON.stringify(checkInData),
        });

        if (!checkInRes.ok) {
          const error = await checkInRes.json();
          throw new Error(error.message || "Điểm danh QR thất bại");
        }

        const result = await checkInRes.json();
        console.log("Check-in result:", result);

        clearTimeout(timeoutId);
        setCheckInStatus({
          type: "success",
          message: "QR đã được quét thành công!",
        });

        // Close QR modal
        setQrModalOpen(false);
      } catch (error) {
        console.error("Check-in error:", error);
        clearTimeout(timeoutId);
        setCheckInStatus({ type: "error", message: error.message });
      } finally {
        setLoading(false);
        setIsAutoCheckIn(false);
      }
    },
    [user, role]
  );

  // Check for URL parameters on component mount (for QR scans from mobile)
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const sessionId = urlParams.get("sessionId");
    const eventId = urlParams.get("eventId");
    const sessionTitle = urlParams.get("sessionTitle");
    const eventTitle = urlParams.get("eventTitle");
    const startTime = urlParams.get("startTime");
    const endTime = urlParams.get("endTime");
    const locationParam = urlParams.get("location");
    const type = urlParams.get("type");
    const autoTrigger = urlParams.get("autoTrigger");

    // If we have the required parameters and autoTrigger is true, auto-process the check-in
    if (
      sessionId &&
      eventId &&
      type === "attendance_checkin" &&
      autoTrigger === "true"
    ) {
      console.log("Auto-processing check-in from QR scan");
      console.log("URL params:", {
        sessionId,
        eventId,
        sessionTitle,
        eventTitle,
        startTime,
        endTime,
        locationParam,
        type,
        autoTrigger,
      });

      const qrData = {
        sessionId,
        eventId,
        sessionTitle: decodeURIComponent(sessionTitle || ""),
        eventTitle: decodeURIComponent(eventTitle || ""),
        startTime: decodeURIComponent(startTime || ""),
        endTime: decodeURIComponent(endTime || ""),
        location: decodeURIComponent(locationParam || ""),
        type,
        autoTrigger: true,
      };

      // Show loading state immediately
      setLoading(true);
      setIsAutoCheckIn(true);

      // Check if user is logged in, if not wait for login
      if (user && role === "student") {
        // Auto-trigger check-in immediately if user is already logged in
        setTimeout(() => {
          handleQRScanSuccess(qrData);
        }, 1000);
      } else {
        // Store QR data for after login
        console.log("User not logged in yet, storing QR data for after login");
        localStorage.setItem("pendingQRCheckIn", JSON.stringify(qrData));
        setCheckInStatus({
          type: "warning",
          message: "Vui lòng đăng nhập với tài khoản sinh viên để check-in.",
        });
        setLoading(false);
        setIsAutoCheckIn(false);
      }
    }
  }, [location.search, handleQRScanSuccess, user, role]);

  // Handle pending check-in after user logs in
  useEffect(() => {
    const pendingQRData = localStorage.getItem("pendingQRCheckIn");
    if (pendingQRData && user && role === "student") {
      try {
        const qrData = JSON.parse(pendingQRData);
        console.log("Processing pending QR check-in after login:", qrData);

        // Clear pending data
        localStorage.removeItem("pendingQRCheckIn");

        // Show loading state
        setLoading(true);
        setIsAutoCheckIn(true);

        // Process the check-in
        setTimeout(() => {
          handleQRScanSuccess(qrData);
        }, 1000);
      } catch (error) {
        console.error("Error processing pending QR check-in:", error);
        localStorage.removeItem("pendingQRCheckIn");
      }
    }
  }, [user, role, handleQRScanSuccess]);

  // Handle QR scan error
  const handleQRScanError = (error) => {
    console.error("QR Scan error:", error);
    setCheckInStatus({
      type: "error",
      message: "Lỗi quét QR: " + error.message,
    });
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: "auto" }}>
      <Typography
        variant="h4"
        sx={{ mb: 3, color: "#1976d2", fontWeight: 600 }}
      >
        Điểm danh QR dành cho Sinh Viên
      </Typography>

      {/* QR Scanner Card - Only for Students */}
      {role === "student" && (
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ textAlign: "center", py: 4 }}>
            {!user ? (
              <>
                <Alert severity="warning" sx={{ mb: 3 }}>
                  Bạn cần đăng nhập với tài khoản sinh viên để có thể check-in
                  điểm danh.
                </Alert>
                <Typography variant="h6" gutterBottom>
                  Vui lòng đăng nhập trước khi quét QR
                </Typography>
              </>
            ) : isAutoCheckIn ? (
              <>
                <CircularProgress sx={{ mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  Đang xử lý điểm danh...
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  Bạn đã quét QR thành công! Vui lòng chờ hệ thống xử lý.
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setLoading(false);
                    setIsAutoCheckIn(false);
                    setCheckInStatus({
                      type: "info",
                      message:
                        "Đã hủy quá trình điểm danh. Bạn có thể thử lại.",
                    });
                  }}
                  sx={{ mt: 2 }}
                >
                  Hủy và thử lại
                </Button>
              </>
            ) : (
              <>
                <QrCodeScanner
                  sx={{ fontSize: 64, color: "primary.main", mb: 2 }}
                />
                <Typography variant="h5" gutterBottom>
                  Quét mã QR điểm danh
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  Quét mã QR từ giảng viên để điểm danh nhanh chóng
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<QrCodeScanner />}
                  onClick={() => setQrModalOpen(true)}
                  disabled={!user || loading}
                  sx={{ px: 4 }}
                >
                  Mở máy quét QR
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Status Alert */}
      {checkInStatus && (
        <Alert
          severity={checkInStatus.type}
          sx={{ mb: 3 }}
          onClose={() => setCheckInStatus(null)}
        >
          {checkInStatus.message}
        </Alert>
      )}

      {/* QR Scanner Dialog */}
      <Dialog
        open={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography
            variant="h6"
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            <QrCodeScanner />
            Quét mã QR điểm danh
          </Typography>
        </DialogTitle>
        <DialogContent>
          <MobileCameraQRScanner
            onScanSuccess={handleQRScanSuccess}
            onScanError={handleQRScanError}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQrModalOpen(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CheckIn;

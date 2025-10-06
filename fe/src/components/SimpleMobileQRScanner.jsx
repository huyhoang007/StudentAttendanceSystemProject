import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Alert,
  CircularProgress,
  TextField,
  Switch,
  FormControlLabel,
  Card,
  CardContent,
} from "@mui/material";
import {
  QrCodeScanner,
  Camera,
  Stop,
  CheckCircle,
  CameraAlt,
  TextFields,
} from "@mui/icons-material";

// Import QR scanner library
import QrScanner from "qr-scanner";

const SimpleMobileQRScanner = ({ onScanSuccess, onScanError }) => {
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [manualInput, setManualInput] = useState("");
  const [useCamera, setUseCamera] = useState(false);
  const [cameraSupported, setCameraSupported] = useState(false);

  // Camera states
  const [isScanning, setIsScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const videoRef = useRef(null);
  const scannerRef = useRef(null);

  // Check camera support on mount
  useEffect(() => {
    const checkCameraSupport = async () => {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          // Check if QrScanner can work
          const hasCamera = await QrScanner.hasCamera();
          setCameraSupported(hasCamera);
          console.log("Camera support:", hasCamera);
        }
      } catch (err) {
        console.error("Camera check failed:", err);
        setCameraSupported(false);
      }
    };

    checkCameraSupport();
  }, []);

  // Handle QR scan success
  const handleQRScanSuccess = (data) => {
    console.log("Processing QR data:", data);
    setError("");

    try {
      let processedData = { rawData: data };

      // Try to parse as JSON first
      try {
        processedData = JSON.parse(data);
        console.log("Parsed as JSON:", processedData);
      } catch {
        // If not JSON, check if it's a URL
        try {
          const url = new URL(data);
          const sessionId = url.searchParams.get("sessionId");
          const eventId = url.searchParams.get("eventId");
          const sessionTitle = url.searchParams.get("sessionTitle");
          const eventTitle = url.searchParams.get("eventTitle");
          const startTime = url.searchParams.get("startTime");
          const endTime = url.searchParams.get("endTime");
          const location = url.searchParams.get("location");

          if (sessionId) {
            processedData = {
              sessionId,
              eventId,
              sessionTitle: decodeURIComponent(sessionTitle || ""),
              eventTitle: decodeURIComponent(eventTitle || ""),
              startTime,
              endTime,
              location: decodeURIComponent(location || ""),
              rawData: data,
            };
            console.log("Parsed URL parameters:", processedData);
          } else {
            processedData = { rawData: data };
          }
        } catch (urlError) {
          console.log("Not a valid URL, treating as raw data");
          processedData = { rawData: data };
        }
      }

      setResult(processedData);

      if (onScanSuccess) {
        onScanSuccess(processedData);
      }
    } catch (error) {
      console.error("Error processing QR data:", error);
      setError("Lỗi xử lý dữ liệu QR: " + error.message);
      if (onScanError) {
        onScanError(error);
      }
    }
  };

  // Start camera scanning
  const startScanning = async () => {
    if (!videoRef.current) return;

    setLoading(true);
    setError("");

    try {
      // Create QR scanner instance
      scannerRef.current = new QrScanner(
        videoRef.current,
        (result) => {
          console.log("QR detected:", result.data);
          handleQRScanSuccess(result.data);
          stopScanning(); // Auto-stop after successful scan
        },
        {
          preferredCamera: "environment", // Use back camera on mobile
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      );

      await scannerRef.current.start();
      setIsScanning(true);
      setLoading(false);
      console.log("Camera scanning started successfully");
    } catch (err) {
      console.error("Failed to start camera:", err);
      setError(
        `Không thể khởi động camera: ${err.message}. Hãy thử chế độ nhập thủ công.`
      );
      setLoading(false);
      setUseCamera(false); // Switch to manual mode on error
    }
  };

  // Stop camera scanning
  const stopScanning = () => {
    if (scannerRef.current) {
      scannerRef.current.stop();
      scannerRef.current.destroy();
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  // Handle manual QR input
  const handleManualSubmit = () => {
    if (!manualInput.trim()) {
      setError("Vui lòng nhập mã QR hoặc URL");
      return;
    }

    handleQRScanSuccess(manualInput.trim());
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.destroy();
      }
    };
  }, []);

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          📱 QR Scanner (Camera + Manual)
        </Typography>

        {/* Mode Toggle */}
        <Box sx={{ mb: 3 }}>
          <FormControlLabel
            control={
              <Switch
                checked={useCamera}
                onChange={(e) => {
                  setUseCamera(e.target.checked);
                  if (!e.target.checked && isScanning) {
                    stopScanning(); // Stop camera when switching to manual
                  }
                }}
                disabled={!cameraSupported}
              />
            }
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {useCamera ? <CameraAlt /> : <TextFields />}
                {useCamera ? "📹 Camera Scanner" : "✍️ Manual Input"}
                {!cameraSupported && " (Camera không khả dụng)"}
              </Box>
            }
          />
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert
            severity={error.includes("✅") ? "success" : "warning"}
            sx={{ mb: 2 }}
            onClose={() => setError("")}
          >
            {error}
          </Alert>
        )}

        {/* Success Result */}
        {result && (
          <Alert severity="success" sx={{ mb: 2 }}>
            <Box>
              <Typography
                variant="subtitle2"
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <CheckCircle fontSize="small" />
                QR đã được xử lý thành công!
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                {result.sessionTitle ? (
                  <>
                    📅 <strong>Phiên:</strong> {result.sessionTitle}
                    <br />
                    🎯 <strong>Sự kiện:</strong> {result.eventTitle}
                    <br />
                    {result.startTime &&
                      `⏰ <strong>Thời gian:</strong> ${new Date(
                        result.startTime
                      ).toLocaleString("vi-VN")}`}
                  </>
                ) : (
                  <>
                    📋 <strong>Dữ liệu:</strong> {result.rawData}
                  </>
                )}
              </Typography>
            </Box>
          </Alert>
        )}

        {/* Camera Mode */}
        {useCamera ? (
          <Box sx={{ mb: 3 }}>
            <Box sx={{ position: "relative", mb: 2 }}>
              <video
                ref={videoRef}
                style={{
                  width: "100%",
                  height: "300px",
                  objectFit: "cover",
                  borderRadius: "8px",
                  border: isScanning ? "2px solid #4caf50" : "2px solid #ddd",
                  backgroundColor: "#000",
                  display: "block",
                }}
                playsInline
                muted
              />
              {loading && (
                <Box
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 1,
                    color: "white",
                    backgroundColor: "rgba(0,0,0,0.7)",
                    p: 2,
                    borderRadius: 2,
                  }}
                >
                  <CircularProgress color="primary" />
                  <Typography variant="body2" color="white">
                    Đang khởi động camera...
                  </Typography>
                </Box>
              )}
              {!isScanning && !loading && (
                <Box
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 1,
                    color: "white",
                    backgroundColor: "rgba(0,0,0,0.7)",
                    p: 2,
                    borderRadius: 2,
                  }}
                >
                  <QrCodeScanner sx={{ fontSize: 48, color: "white" }} />
                  <Typography variant="body2" color="white" textAlign="center">
                    Nhấn "Bắt đầu quét" để mở camera
                  </Typography>
                </Box>
              )}
            </Box>

            <Box
              sx={{
                display: "flex",
                gap: 2,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              {!isScanning ? (
                <>
                  <Button
                    variant="contained"
                    onClick={startScanning}
                    disabled={loading}
                    startIcon={<Camera />}
                    size="large"
                  >
                    📹 Bắt đầu quét camera
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={async () => {
                      try {
                        const stream =
                          await navigator.mediaDevices.getUserMedia({
                            video: { facingMode: "environment" },
                          });
                        console.log("Camera test successful:", stream);
                        setError("Camera hoạt động tốt! ✅");
                        stream.getTracks().forEach((track) => track.stop());
                      } catch (err) {
                        console.error("Camera test failed:", err);
                        setError("Lỗi camera: " + err.message);
                      }
                    }}
                    size="small"
                  >
                    Test Camera
                  </Button>
                </>
              ) : (
                <Button
                  variant="contained"
                  color="error"
                  onClick={stopScanning}
                  startIcon={<Stop />}
                  size="large"
                >
                  ⏹️ Dừng quét
                </Button>
              )}
            </Box>

            {isScanning && (
              <Typography
                variant="body2"
                color="primary"
                sx={{ mt: 2, textAlign: "center", fontWeight: 500 }}
              >
                🎯 Đưa QR code vào khung hình để quét...
              </Typography>
            )}
          </Box>
        ) : (
          /* Manual Input Mode */
          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
              📝 Nhập URL từ QR Code:
            </Typography>

            <TextField
              fullWidth
              multiline
              rows={4}
              label="QR Code URL"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="Paste URL từ QR code ở đây..."
              sx={{ mb: 2 }}
              variant="outlined"
            />

            <Button
              fullWidth
              variant="contained"
              onClick={handleManualSubmit}
              disabled={!manualInput.trim()}
              size="large"
              sx={{ py: 1.5 }}
            >
              🚀 Thực hiện Check-in
            </Button>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 1, display: "block", textAlign: "center" }}
            >
              💡 Ví dụ URL:
              http://192.168.1.138:5173/checkin?sessionId=123&autoTrigger=true...
            </Typography>
          </Box>
        )}

        {/* Instructions */}
        <Box
          sx={{
            mt: 3,
            p: 2,
            bgcolor: useCamera ? "primary.main" : "success.main",
            color: "white",
            borderRadius: 2,
          }}
        >
          <Typography variant="subtitle2" gutterBottom sx={{ color: "white" }}>
            {useCamera ? "📹 Camera QR Scanning:" : "📱 Manual QR Input:"}
          </Typography>
          <Typography variant="body2" component="div" sx={{ color: "white" }}>
            {useCamera ? (
              <>
                <strong>Bước 1:</strong> Nhấn "Bắt đầu quét camera"
                <br />
                <strong>Bước 2:</strong> Cho phép truy cập camera
                <br />
                <strong>Bước 3:</strong> Đưa QR code vào khung hình
                <br />
                <strong>Bước 4:</strong> Hệ thống tự động nhận diện và check-in!
                ✅
              </>
            ) : (
              <>
                <strong>Bước 1:</strong> Organizer hiển thị QR cho phiên học
                <br />
                <strong>Bước 2:</strong> Chụp ảnh QR bằng camera điện thoại
                <br />
                <strong>Bước 3:</strong> Copy URL dài trong QR
                <br />
                <strong>Bước 4:</strong> Paste URL vào ô trên → Nhấn "Check-in"
                <br />
                <strong>Bước 5:</strong> Hệ thống auto check-in! ✅
              </>
            )}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default SimpleMobileQRScanner;

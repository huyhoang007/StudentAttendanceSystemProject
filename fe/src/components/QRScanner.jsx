import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Alert,
  Paper,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
} from "@mui/material";
import {
  QrCodeScanner,
  Camera,
  Stop,
  CheckCircle,
  Error as ErrorIcon,
  CameraAlt,
  TextFields,
} from "@mui/icons-material";

// Import QR scanner library
import QrScanner from "qr-scanner";

const QRScanner = ({ onScanSuccess, onScanError }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [manualInput, setManualInput] = useState("");
  const [useCamera, setUseCamera] = useState(true); // Toggle between camera and manual input
  const videoRef = useRef(null);
  const scannerRef = useRef(null);

  // Camera scanning functions
  const startScanning = async () => {
    try {
      setLoading(true);
      setError("");

      console.log("Starting QR Scanner...");
      console.log("Video element:", videoRef.current);

      // Check camera permissions first
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        console.log("Camera permission granted");
        stream.getTracks().forEach((track) => track.stop()); // Stop test stream
      } catch (permissionError) {
        console.error("Camera permission denied:", permissionError);
        setError(
          "Cần cấp quyền truy cập camera. Vui lòng cho phép trình duyệt sử dụng camera."
        );
        setLoading(false);
        return;
      }

      if (videoRef.current) {
        scannerRef.current = new QrScanner(
          videoRef.current,
          (result) => {
            console.log("QR Code detected:", result.data);
            try {
              // Try to parse as JSON first
              const qrData = JSON.parse(result.data);
              console.log("Parsed QR data:", qrData);
              setResult(qrData);
              stopScanning(); // Auto stop after successful scan
              if (onScanSuccess) {
                onScanSuccess(qrData);
              }
            } catch {
              // If not JSON, check if it's a URL or plain text
              console.log("QR data (plain text/URL):", result.data);

              // Try to extract session info from URL or text
              let processedData = { rawData: result.data };

              // Check if it's a URL with parameters
              try {
                const url = new URL(result.data);
                const sessionId = url.searchParams.get("sessionId");
                const eventId = url.searchParams.get("eventId");
                const sessionTitle = url.searchParams.get("sessionTitle");
                const eventTitle = url.searchParams.get("eventTitle");
                const startTime = url.searchParams.get("startTime");
                const endTime = url.searchParams.get("endTime");
                const location = url.searchParams.get("location");
                const type = url.searchParams.get("type");

                if (sessionId && eventId && type === "attendance_checkin") {
                  processedData = {
                    sessionId,
                    eventId,
                    sessionTitle: decodeURIComponent(sessionTitle || ""),
                    eventTitle: decodeURIComponent(eventTitle || ""),
                    startTime: decodeURIComponent(startTime || ""),
                    endTime: decodeURIComponent(endTime || ""),
                    location: decodeURIComponent(location || ""),
                    type,
                    rawData: result.data,
                  };
                  console.log("Extracted data from URL:", processedData);
                }
              } catch {
                // Not a URL, keep as raw data
              }

              setResult(processedData);
              stopScanning(); // Auto stop after successful scan
              if (onScanSuccess) {
                onScanSuccess(processedData);
              }
            }
          },
          {
            returnDetailedScanResult: true,
            highlightScanRegion: true,
          }
        );

        await scannerRef.current.start();
        setIsScanning(true);
        setLoading(false);
      }
    } catch (err) {
      console.error("Camera error:", err);
      setError(
        "Không thể truy cập camera. Vui lòng cho phép truy cập camera và thử lại."
      );
      setLoading(false);
      if (onScanError) {
        onScanError(err);
      }
    }
  };

  const stopScanning = () => {
    if (scannerRef.current) {
      scannerRef.current.destroy();
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.destroy();
      }
    };
  }, []);

  // Temporary manual input for testing
  const handleManualSubmit = () => {
    try {
      const qrData = JSON.parse(manualInput);
      setResult(qrData);
      if (onScanSuccess) {
        onScanSuccess(qrData);
      }
    } catch (error) {
      setError("Dữ liệu QR không hợp lệ");
      if (onScanError) {
        onScanError(error);
      }
    }
  };

  return (
    <Box sx={{ maxWidth: 500, mx: "auto", p: 2 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <QrCodeScanner sx={{ fontSize: 48, color: "primary.main", mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Quét QR Điểm Danh
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sử dụng camera để quét mã QR hoặc nhập thủ công
          </Typography>
        </Box>

        {/* Mode Toggle */}
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <FormControlLabel
            control={
              <Switch
                checked={useCamera}
                onChange={(e) => {
                  setUseCamera(e.target.checked);
                  if (!e.target.checked && isScanning) {
                    stopScanning();
                  }
                  setError("");
                  setResult(null);
                }}
              />
            }
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {useCamera ? <CameraAlt /> : <TextFields />}
                {useCamera ? "Quét bằng Camera" : "Nhập thủ công"}
              </Box>
            }
          />
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
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
                Quét QR thành công!
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                {result.sessionTitle && (
                  <>
                    Phiên: {result.sessionTitle}
                    <br />
                    Sự kiện: {result.eventTitle}
                    <br />
                    Thời gian:{" "}
                    {new Date(result.startTime).toLocaleString("vi-VN")}
                  </>
                )}
                {result.rawData && <>Dữ liệu: {result.rawData}</>}
              </Typography>
            </Box>
          </Alert>
        )}

        {/* Camera Scanner */}
        {useCamera && (
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
                    Bắt đầu quét
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={async () => {
                      try {
                        const stream =
                          await navigator.mediaDevices.getUserMedia({
                            video: true,
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
                  Dừng quét
                </Button>
              )}
            </Box>
          </Box>
        )}

        {/* Manual Input Mode */}
        {!useCamera && (
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Dán dữ liệu QR vào đây"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder='{"sessionId":"...","eventId":"...","type":"attendance_checkin",...}'
              sx={{ mb: 2 }}
            />

            <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
              <Button
                variant="contained"
                onClick={handleManualSubmit}
                disabled={!manualInput.trim()}
                size="large"
              >
                Xử lý dữ liệu QR
              </Button>

              <Button
                variant="outlined"
                onClick={() => {
                  setManualInput("");
                  setResult(null);
                  setError("");
                }}
                size="large"
              >
                Reset
              </Button>
            </Box>
          </Box>
        )}

        {/* Instructions */}
        <Box sx={{ mt: 3, p: 2, backgroundColor: "#f8f9fa", borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            <strong>Hướng dẫn:</strong>
            <br />
            {useCamera ? (
              <>
                • Cho phép truy cập camera khi được yêu cầu
                <br />
                • Đưa mã QR vào khung camera
                <br />• Hệ thống sẽ tự động quét và xử lý
              </>
            ) : (
              <>
                • Copy dữ liệu QR từ organizer
                <br />
                • Paste vào ô text trên
                <br />• Click "Xử lý dữ liệu QR"
              </>
            )}
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default QRScanner;

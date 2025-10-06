import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Card,
  CardContent,
} from "@mui/material";
import { QrCodeScanner, Camera, Stop, CheckCircle } from "@mui/icons-material";

// Import QR scanner library
import QrScanner from "qr-scanner";

const CameraQRScanner = ({ onScanSuccess, onScanError }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [cameraSupported, setCameraSupported] = useState(false);

  const videoRef = useRef(null);
  const scannerRef = useRef(null);

  // Check camera support on mount
  useEffect(() => {
    const checkCameraSupport = async () => {
      try {
        // Check if browser supports MediaDevices
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setCameraSupported(false);
          setError(
            "❌ Trình duyệt này không hỗ trợ camera. Vui lòng sử dụng Chrome, Safari, hoặc Firefox phiên bản mới."
          );
          console.log("❌ MediaDevices not supported");
          return;
        }

        // Check if QrScanner can work
        const hasCamera = await QrScanner.hasCamera();
        if (!hasCamera) {
          setCameraSupported(false);
          setError(
            "❌ Không tìm thấy camera trên thiết bị này. Vui lòng kiểm tra quyền truy cập camera hoặc sử dụng thiết bị khác."
          );
          console.log("❌ No camera found");
          return;
        }

        setCameraSupported(true);
        console.log("� Camera support: YES");
        setError("✅ Camera sẵn sàng! Nhấn nút để bắt đầu quét QR.");
      } catch (err) {
        console.error("❌ Camera check failed:", err);
        setCameraSupported(false);
        setError(
          `❌ Lỗi kiểm tra camera: ${err.message}. Vui lòng thử lại hoặc sử dụng trình duyệt khác.`
        );
      }
    };

    checkCameraSupport();
  }, []);

  // Handle QR scan success
  const handleQRScanSuccess = (data) => {
    console.log("🎯 QR detected:", data);
    setError("");

    try {
      let processedData = { rawData: data };

      // Try to parse as JSON first
      try {
        processedData = JSON.parse(data);
        console.log("📋 Parsed as JSON:", processedData);
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
            console.log("🔗 Parsed URL parameters:", processedData);
          } else {
            processedData = { rawData: data };
          }
        } catch {
          console.log("📝 Not a valid URL, treating as raw data");
          processedData = { rawData: data };
        }
      }

      setResult(processedData);
      stopScanning(); // Auto-stop after successful scan

      if (onScanSuccess) {
        onScanSuccess(processedData);
      }
    } catch (error) {
      console.error("❌ Error processing QR data:", error);
      setError("❌ Lỗi xử lý dữ liệu QR: " + error.message);
      if (onScanError) {
        onScanError(error);
      }
    }
  };

  // Start camera scanning
  const startScanning = async () => {
    if (!videoRef.current || !cameraSupported) {
      setError(
        "❌ Camera không khả dụng. Vui lòng kiểm tra thiết bị và quyền truy cập."
      );
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      // Create QR scanner instance
      scannerRef.current = new QrScanner(
        videoRef.current,
        (result) => {
          console.log("🎯 QR scanner result:", result.data);
          handleQRScanSuccess(result.data);
        },
        {
          preferredCamera: "environment", // Use back camera on mobile
          highlightScanRegion: true,
          highlightCodeOutline: true,
          maxScansPerSecond: 5, // Limit scan frequency
        }
      );

      await scannerRef.current.start();
      setIsScanning(true);
      setLoading(false);
      console.log("✅ Camera scanning started successfully");
    } catch (err) {
      console.error("❌ Failed to start camera:", err);

      // Provide specific error messages based on error type
      let errorMessage = "❌ Không thể khởi động camera. ";
      if (err.name === "NotAllowedError") {
        errorMessage += "Vui lòng cho phép truy cập camera trong trình duyệt.";
      } else if (err.name === "NotFoundError") {
        errorMessage += "Không tìm thấy camera trên thiết bị.";
      } else if (err.name === "NotSupportedError") {
        errorMessage += "Trình duyệt không hỗ trợ camera.";
      } else if (err.name === "NotReadableError") {
        errorMessage += "Camera đang được sử dụng bởi ứng dụng khác.";
      } else {
        errorMessage += `Lỗi: ${err.message}`;
      }

      setError(errorMessage);
      setLoading(false);
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
    setLoading(false);
    console.log("⏹️ Camera scanning stopped");
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
        <Typography
          variant="h6"
          gutterBottom
          sx={{ textAlign: "center", fontWeight: 600 }}
        >
          📹 Quét QR Điểm Danh
        </Typography>

        {/* Error Alert */}
        {error && (
          <Alert
            severity={error.includes("✅") ? "success" : "error"}
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
                <CheckCircle fontSize="small" />✅ QR đã được quét thành công!
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

        {/* Camera Video */}
        <Box sx={{ position: "relative", mb: 3 }}>
          <video
            ref={videoRef}
            style={{
              width: "100%",
              height: "350px",
              objectFit: "cover",
              borderRadius: "12px",
              border: isScanning ? "3px solid #4caf50" : "2px solid #ddd",
              backgroundColor: "#000",
              display: "block",
            }}
            playsInline
            muted
          />

          {/* Loading overlay */}
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
                gap: 2,
                color: "white",
                backgroundColor: "rgba(0,0,0,0.8)",
                p: 3,
                borderRadius: 3,
              }}
            >
              <CircularProgress color="primary" size={40} />
              <Typography variant="body1" color="white" textAlign="center">
                📹 Đang khởi động camera...
              </Typography>
            </Box>
          )}

          {/* Camera off overlay */}
          {!isScanning && !loading && cameraSupported && (
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
                color: "white",
                backgroundColor: "rgba(0,0,0,0.8)",
                p: 3,
                borderRadius: 3,
                textAlign: "center",
              }}
            >
              <QrCodeScanner sx={{ fontSize: 60, color: "white" }} />
              <Typography variant="body1" color="white">
                📱 Nhấn nút bên dưới để bắt đầu quét QR
              </Typography>
            </Box>
          )}

          {/* No camera support overlay */}
          {!cameraSupported && (
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
                color: "white",
                backgroundColor: "rgba(244, 67, 54, 0.9)",
                p: 3,
                borderRadius: 3,
                textAlign: "center",
                maxWidth: "90%",
              }}
            >
              <Typography variant="h5" sx={{ fontSize: 48 }}>
                ❌
              </Typography>
              <Typography variant="h6" color="white" fontWeight={700}>
                Camera không khả dụng
              </Typography>
              <Typography
                variant="body2"
                color="white"
                sx={{ mt: 1, lineHeight: 1.6 }}
              >
                Vui lòng kiểm tra:
                <br />• <strong>Quyền truy cập camera</strong>
                <br />• <strong>Trình duyệt hỗ trợ</strong> (Chrome, Safari,
                Firefox)
                <br />• <strong>Thiết bị có camera</strong>
                <br />• <strong>Kết nối HTTPS</strong> (bắt buộc cho camera)
              </Typography>
            </Box>
          )}

          {/* Scanning indicator */}
          {isScanning && (
            <Box
              sx={{
                position: "absolute",
                top: 16,
                left: 16,
                right: 16,
                backgroundColor: "rgba(76, 175, 80, 0.9)",
                color: "white",
                p: 1,
                borderRadius: 2,
                textAlign: "center",
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                🎯 Đang quét... Đưa QR code vào khung hình
              </Typography>
            </Box>
          )}
        </Box>

        {/* Control Buttons */}
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
                disabled={loading || !cameraSupported}
                startIcon={<Camera />}
                size="large"
                sx={{
                  py: 1.5,
                  px: 4,
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  borderRadius: 3,
                }}
              >
                📹 Bắt đầu quét QR
              </Button>

              {/* Additional buttons when camera not supported */}
              {!cameraSupported && (
                <>
                  <Button
                    variant="outlined"
                    onClick={async () => {
                      try {
                        setError("🔄 Đang kiểm tra camera...");

                        // More specific camera request for mobile
                        const constraints = {
                          video: {
                            facingMode: "environment", // Back camera
                            width: { ideal: 1280 },
                            height: { ideal: 720 },
                          },
                        };

                        const stream =
                          await navigator.mediaDevices.getUserMedia(
                            constraints
                          );
                        console.log("✅ Camera test successful:", stream);
                        setError(
                          "✅ Camera hoạt động! Refresh trang để thử lại quét QR."
                        );

                        // Show camera preview briefly
                        if (videoRef.current) {
                          videoRef.current.srcObject = stream;
                          setTimeout(() => {
                            stream.getTracks().forEach((track) => track.stop());
                            if (videoRef.current) {
                              videoRef.current.srcObject = null;
                            }
                          }, 3000);
                        } else {
                          stream.getTracks().forEach((track) => track.stop());
                        }

                        // Re-check camera support
                        const hasCamera = await QrScanner.hasCamera();
                        setCameraSupported(hasCamera);

                        if (hasCamera) {
                          setError(
                            "✅ Camera sẵn sàng! Nhấn 'Bắt đầu quét QR' để bắt đầu."
                          );
                        }
                      } catch (err) {
                        console.error("❌ Camera test failed:", err);
                        let message = "❌ Test camera thất bại: ";
                        if (err.name === "NotAllowedError") {
                          message +=
                            "Bạn cần cho phép truy cập camera. Nhấn vào biểu tượng 🔒 trên thanh địa chỉ → Allow Camera.";
                        } else if (err.name === "NotFoundError") {
                          message +=
                            "Không tìm thấy camera. Kiểm tra thiết bị có camera không.";
                        } else if (err.name === "NotSupportedError") {
                          message +=
                            "Trình duyệt không hỗ trợ camera. Thử Chrome hoặc Safari.";
                        } else {
                          message +=
                            err.message +
                            ". Thử truy cập bằng HTTPS: https://192.168.1.138:5173";
                        }
                        setError(message);
                      }
                    }}
                    size="small"
                    sx={{ minWidth: 120 }}
                  >
                    🔧 Test Camera
                  </Button>

                  <Button
                    variant="text"
                    onClick={() => {
                      setError(`📱 Hướng dẫn sửa lỗi camera:
                      
1. Cho phép truy cập camera: Nhấn vào biểu tượng 🔒 hoặc 📹 trên thanh địa chỉ → Chọn "Allow"
2. Sử dụng trình duyệt khác: Chrome, Safari, Firefox mới nhất
3. Kiểm tra kết nối HTTPS: Camera chỉ hoạt động với https:// 
4. Refresh trang sau khi cấp quyền
5. Thử trên thiết bị khác nếu không khắc phục được`);
                    }}
                    size="small"
                  >
                    ❓ Cách sửa
                  </Button>
                </>
              )}
            </>
          ) : (
            <Button
              variant="contained"
              color="error"
              onClick={stopScanning}
              startIcon={<Stop />}
              size="large"
              sx={{
                py: 1.5,
                px: 4,
                fontSize: "1.1rem",
                fontWeight: 600,
                borderRadius: 3,
              }}
            >
              ⏹️ Dừng quét
            </Button>
          )}
        </Box>

        {/* Instructions */}
        {cameraSupported && (
          <Box
            sx={{
              mt: 3,
              p: 2,
              bgcolor: "primary.main",
              color: "white",
              borderRadius: 2,
            }}
          >
            <Typography
              variant="subtitle2"
              gutterBottom
              sx={{ color: "white", fontWeight: 600 }}
            >
              📋 Hướng dẫn sử dụng:
            </Typography>
            <Typography variant="body2" component="div" sx={{ color: "white" }}>
              <strong>1.</strong> Nhấn "Bắt đầu quét QR"
              <br />
              <strong>2.</strong> Cho phép trình duyệt truy cập camera
              <br />
              <strong>3.</strong> Đưa mã QR điểm danh vào khung hình
              <br />
              <strong>4.</strong> Hệ thống sẽ tự động nhận diện và check-in! ✅
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default CameraQRScanner;

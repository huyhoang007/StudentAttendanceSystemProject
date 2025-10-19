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

const MobileCameraQRScanner = ({ onScanSuccess, onScanError }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [cameraSupported, setCameraSupported] = useState(false);

  const videoRef = useRef(null);
  const scannerRef = useRef(null);

  // Check camera support on mount with mobile-specific handling
  useEffect(() => {
    const checkCameraSupport = async () => {
      try {
        console.log("🔍 Checking camera support...");
        console.log("🌐 User Agent:", navigator.userAgent);
        console.log("🔧 Browser capabilities:", {
          hasNavigator: !!navigator,
          hasMediaDevices: !!navigator.mediaDevices,
          hasGetUserMedia: !!(
            navigator.mediaDevices && navigator.mediaDevices.getUserMedia
          ),
          hasLegacyGetUserMedia: !!navigator.getUserMedia,
          hasWebkitGetUserMedia: !!navigator.webkitGetUserMedia,
          hasMozGetUserMedia: !!navigator.mozGetUserMedia,
          hasMsGetUserMedia: !!navigator.msGetUserMedia,
        });

        // Enhanced polyfill getUserMedia for older browsers
        const getUserMedia = () => {
          // Modern browsers
          if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            console.log("📱 Using modern navigator.mediaDevices.getUserMedia");
            return navigator.mediaDevices.getUserMedia.bind(
              navigator.mediaDevices
            );
          }

          // Older browsers with prefixed versions
          const legacyGetUserMedia =
            navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia ||
            navigator.msGetUserMedia;

          if (legacyGetUserMedia) {
            console.log("📱 Using legacy getUserMedia polyfill");
            return function (constraints) {
              return new Promise((resolve, reject) => {
                legacyGetUserMedia.call(
                  navigator,
                  constraints,
                  resolve,
                  reject
                );
              });
            };
          }

          console.log("❌ No getUserMedia support found");
          return null;
        };

        const userMediaFunction = getUserMedia();

        if (!userMediaFunction) {
          setCameraSupported(false);
          setError(
            "❌ Trình duyệt này không hỗ trợ camera. Vui lòng thử:\n• Trình duyệt mới nhất\n• Cập nhật system\n• Kiểm tra quyền camera trong Settings"
          );
          console.log("❌ getUserMedia not supported");
          return;
        }

        // Detect mobile device
        const isMobile =
          /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent
          );
        console.log("📱 Is mobile:", isMobile);

        // For any device, try direct camera permission request first
        try {
          console.log("📱 Testing camera permissions...");

          // Try simple video constraint first
          let constraints = { video: true };

          // For mobile, try environment camera
          if (isMobile) {
            constraints = {
              video: {
                facingMode: "environment",
              },
            };
          }

          console.log("📱 Using constraints:", constraints);
          const stream = await userMediaFunction(constraints);

          console.log("✅ Camera stream obtained:", stream);

          // Success! Camera is available
          if (stream && stream.getTracks) {
            console.log("📱 Active tracks:", stream.getTracks().length);
            stream.getTracks().forEach((track, index) => {
              console.log(
                `📱 Track ${index}:`,
                track.label,
                track.kind,
                track.readyState
              );
              track.stop();
            });
          }

          setCameraSupported(true);
          setError("✅ Camera sẵn sàng! Nhấn nút để quét mã QR.");
          console.log("✅ Camera permission granted");
          return;
        } catch (cameraError) {
          console.log(
            "❌ Camera error:",
            cameraError.name,
            cameraError.message
          );
          console.log("❌ Camera error details:", cameraError);

          if (
            cameraError.name === "NotAllowedError" ||
            cameraError.name === "PermissionDeniedError"
          ) {
            setCameraSupported(false);
            setError(
              "❌ Cần cấp quyền camera. Vui lòng cho phép khi trình duyệt yêu cầu."
            );
          } else if (
            cameraError.name === "NotFoundError" ||
            cameraError.name === "DevicesNotFoundError"
          ) {
            setCameraSupported(false);
            setError("❌ Không tìm thấy camera trên thiết bị này.");
          } else if (
            cameraError.name === "NotReadableError" ||
            cameraError.name === "TrackStartError"
          ) {
            setCameraSupported(false);
            setError(
              "❌ Camera đang được sử dụng bởi ứng dụng khác. Vui lòng đóng các ứng dụng camera khác."
            );
          } else if (
            cameraError.name === "OverconstrainedError" ||
            cameraError.name === "ConstraintNotSatisfiedError"
          ) {
            // Try fallback without facingMode constraint
            try {
              console.log("📱 Trying fallback constraints...");
              const fallbackStream = await userMediaFunction({ video: true });
              if (fallbackStream && fallbackStream.getTracks) {
                fallbackStream.getTracks().forEach((track) => track.stop());
              }
              setCameraSupported(true);
              setError("✅ Camera sẵn sàng! (Fallback mode)");
              return;
            } catch (fallbackError) {
              console.log("❌ Fallback also failed:", fallbackError);
              setCameraSupported(false);
              setError(
                "❌ Camera constraints không được hỗ trợ. Thử browser khác."
              );
            }
          } else {
            setCameraSupported(false);
            setError(
              "❌ Lỗi camera: " +
                (cameraError.message || cameraError.name || "Không xác định") +
                ". Vui lòng thử lại."
            );
          }
        }

        // Additional QrScanner check for desktop or as fallback
        try {
          console.log("📱 Checking QrScanner compatibility...");
          const hasCamera = await QrScanner.hasCamera();
          console.log("📱 QrScanner hasCamera:", hasCamera);

          if (!cameraSupported && hasCamera) {
            setCameraSupported(true);
            setError(
              "✅ Camera phát hiện qua QrScanner. Nhấn nút để thử quét QR."
            );
          }
        } catch (qrError) {
          console.log("❌ QrScanner check failed:", qrError);
          // Don't override existing camera status if we already detected camera
        }
      } catch (err) {
        console.error("❌ Camera check failed:", err);
        setCameraSupported(false);
        setError(
          `❌ Lỗi kiểm tra camera: ${
            err.message || err.name || "Lỗi không xác định"
          }`
        );
      }
    };

    checkCameraSupport();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
          }
        } catch {
          // Not a URL, use raw data
          processedData = { rawData: data };
        }
      }

      setResult(processedData);
      stopScanning(); // Auto-stop after successful scan

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

  // Start camera scanning with mobile optimization
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
      console.log("📹 Starting camera...");

      // Create QR scanner instance with mobile-optimized settings
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
          maxScansPerSecond: 5,
          returnDetailedScanResult: false,
        }
      );

      await scannerRef.current.start();
      setIsScanning(true);
      setLoading(false);
      console.log("✅ Camera scanning started successfully");
    } catch (err) {
      console.error("❌ Failed to start camera:", err);

      // Provide specific error messages
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
          📱 Quét mã QR điểm danh
        </Typography>

        {/* Error/Success Alert */}
        {error && (
          <Alert
            severity={
              error.includes("✅")
                ? "success"
                : error.includes("⚠️")
                ? "warning"
                : "error"
            }
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
                QR đã được quét thành công!
              </Typography>
              {/* No additional data displayed */}
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
              border: isScanning
                ? "3px solid #4caf50"
                : cameraSupported
                ? "2px solid #ddd"
                : "2px solid #f44336",
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

          {/* Camera ready overlay */}
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
                📱 Nhấn nút bên dưới để quét mã QR
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
                Vui lòng cấp quyền camera
                <br />
                khi trình duyệt yêu cầu
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
                  py: 2,
                  px: 5,
                  fontSize: "1rem",
                  fontWeight: 500,
                  borderRadius: 8,
                  textTransform: "none",
                  background:
                    "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
                  boxShadow: "0 3px 10px 0 rgba(33, 150, 243, 0.3)",
                  "&:hover": {
                    background:
                      "linear-gradient(45deg, #1976D2 30%, #1BA3D3 90%)",
                    boxShadow: "0 4px 15px 0 rgba(33, 150, 243, 0.4)",
                    transform: "translateY(-1px)",
                  },
                  "&:disabled": {
                    background: "#ccc",
                    color: "#999",
                  },
                }}
              >
                Quét mã QR
              </Button>
            </>
          ) : (
            <Button
              variant="contained"
              onClick={stopScanning}
              startIcon={<Stop />}
              size="large"
              sx={{
                py: 2,
                px: 5,
                fontSize: "1rem",
                fontWeight: 500,
                borderRadius: 8,
                textTransform: "none",
                bgcolor: "#FF5722",
                boxShadow: "0 3px 10px 0 rgba(255, 87, 34, 0.3)",
                "&:hover": {
                  bgcolor: "#E64A19",
                  boxShadow: "0 4px 15px 0 rgba(255, 87, 34, 0.4)",
                  transform: "translateY(-1px)",
                },
              }}
            >
              Dừng quét
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default MobileCameraQRScanner;

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Snackbar,
} from "@mui/material";
import {
  QrCode,
  Download,
  Print,
  Refresh,
  ContentCopy,
} from "@mui/icons-material";
import QRCode from "react-qr-code";

const QRCodeGenerator = ({ session, event }) => {
  const [qrData, setQrData] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    if (session && event) {
      console.log("QRCodeGenerator - Generating QR for session:", session);
      console.log("QRCodeGenerator - Event data:", event);
      generateQRData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, event]);

  // Copy QR data to clipboard
  const handleCopyQRData = async () => {
    try {
      await navigator.clipboard.writeText(qrData);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = qrData;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const generateQRData = () => {
    try {
      setLoading(true);

      // Check if we're in development and create appropriate URL
      let baseUrl = window.location.origin;

      // For mobile access, try local network IP first, fallback to hotspot IP
      if (baseUrl.includes("localhost") || baseUrl.includes("127.0.0.1")) {
        // Use local network IP (when on same WiFi) with HTTP for easier access
        const localIP = "192.168.1.138";
        // Note: If this doesn't work, switch to hotspot IP: 192.168.137.1

        baseUrl = baseUrl.replace(/localhost|127\.0\.0\.1/, localIP);
        // Keep HTTP for easier access (camera will work with updated error handling)
        console.log(
          "Using HTTP + local network IP for mobile access:",
          baseUrl
        );
      }

      // Create URL that will auto-trigger check-in when accessed
      const sessionId = session.sessionId || session.SessionId;
      const eventId = event.eventId || event.EventId;

      const autoCheckinUrl = `${baseUrl}/checkin?sessionId=${sessionId}&eventId=${eventId}&sessionTitle=${encodeURIComponent(
        session.title || session.Title
      )}&eventTitle=${encodeURIComponent(
        event.title || event.Title
      )}&startTime=${encodeURIComponent(
        session.startTime || session.StartTime
      )}&endTime=${encodeURIComponent(
        session.endTime || session.EndTime
      )}&location=${encodeURIComponent(
        session.location || session.Location || ""
      )}&timestamp=${new Date().toISOString()}&type=attendance_checkin&autoTrigger=true`;

      setQrData(autoCheckinUrl);
      setError("");

      console.log("Generated Auto Check-in URL:", autoCheckinUrl);
    } catch (err) {
      setError("Không thể tạo mã QR");
      console.error("Error generating QR:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    const svg = document.getElementById("qr-code-svg");
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const link = document.createElement("a");
      link.download = `QR_${
        session.title || "Session"
      }_${new Date().getTime()}.png`;
      link.href = canvas.toDataURL();
      link.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  const handlePrint = () => {
    const printContent = document.getElementById("qr-print-content");
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>QR Code - ${session.title || "Session"}</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
            .qr-container { margin: 20px 0; }
            .info { margin: 10px 0; }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const formatDateTime = (dateTime) => {
    return new Date(dateTime).toLocaleString("vi-VN");
  };

  return (
    <>
      {loading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Đang tạo mã QR...</Typography>
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : (
        <Box id="qr-print-content">
          {/* Event & Session Info */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              {event?.title || event?.Title}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              {session?.title || session?.Title || "Phiên"}
            </Typography>

            <Box display="flex" gap={1} flexWrap="wrap" mt={2}>
              <Chip
                label={`📅 ${formatDateTime(
                  session?.startTime || session?.StartTime
                )}`}
                size="small"
              />
              <Chip
                label={`📍 ${
                  session?.location || session?.Location || "Chưa xác định"
                }`}
                size="small"
              />
            </Box>
          </Paper>

          {/* QR Code */}
          <Box
            display="flex"
            justifyContent="center"
            sx={{
              p: 3,
              backgroundColor: "white",
              border: "2px dashed #ccc",
              borderRadius: 2,
            }}
          >
            {qrData && (
              <QRCode
                id="qr-code-svg"
                value={qrData}
                size={200}
                level="M"
                includeMargin={true}
              />
            )}
          </Box>

          {/* Instructions */}
          <Box mt={3}>
            <Typography
              variant="body2"
              color="text.secondary"
              align="center"
              gutterBottom
            >
              📱 <strong>Sinh viên quét QR này để điểm danh tự động</strong>
            </Typography>
            <Typography
              variant="body2"
              color="text.primary"
              align="center"
              sx={{ fontWeight: "bold", mb: 2 }}
            >
              🔗 Hoặc gửi link dưới đây cho sinh viên:
            </Typography>

            {/* QR Data Display with Copy Button */}
            <Box
              sx={{
                mt: 2,
                p: 2,
                backgroundColor: "#f5f5f5",
                borderRadius: 1,
                border: "1px solid #ddd",
                position: "relative",
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontFamily: "monospace",
                  fontSize: "0.75rem",
                  wordBreak: "break-all",
                  maxHeight: "100px",
                  overflow: "auto",
                  pr: 5,
                }}
              >
                {qrData}
              </Typography>
              <IconButton
                onClick={handleCopyQRData}
                size="small"
                sx={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  backgroundColor: "primary.main",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "primary.dark",
                  },
                }}
                title="Copy QR data"
              >
                <ContentCopy fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        </Box>
      )}

      {/* Action Buttons */}
      <Box sx={{ display: "flex", gap: 1, justifyContent: "center", mt: 3 }}>
        <Button
          onClick={generateQRData}
          startIcon={<Refresh />}
          disabled={loading}
          variant="outlined"
        >
          Tạo Lại
        </Button>
        <Button
          onClick={handlePrint}
          startIcon={<Print />}
          disabled={loading || !qrData}
          variant="outlined"
        >
          In
        </Button>
        <Button
          onClick={handleDownload}
          startIcon={<Download />}
          variant="contained"
          disabled={loading || !qrData}
        >
          Tải Xuống
        </Button>
      </Box>

      {/* Copy Success Snackbar */}
      <Snackbar
        open={copySuccess}
        autoHideDuration={2000}
        onClose={() => setCopySuccess(false)}
        message="✅ Đã copy QR data vào clipboard!"
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </>
  );
};

export default QRCodeGenerator;

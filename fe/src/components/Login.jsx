// src/components/Login.jsx
import React, { useState } from "react";
import { Box, Paper, Typography, TextField, Button } from "@mui/material";
import { keyframes } from "@emotion/react";
import { login } from "../services/authService";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-20px);}
  to { opacity: 1; transform: translateY(0);}
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px);}
  50% { transform: translateY(-20px);}
`;

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const data = await login(username, password);
      localStorage.setItem("authToken", data.token);
      window.location.reload();
    } catch (err) {
      setError(err.message || "Login failed");
    }
  };

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        overflow: "hidden",
      }}
    >
      {/* Floating circles */}
      <Box
        sx={{
          position: "absolute",
          width: "100%",
          height: "100%",
          "&::before, &::after": {
            content: '""',
            position: "absolute",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.08)",
            animation: `${float} 8s ease-in-out infinite`,
          },
          "&::before": { width: 300, height: 300, top: -50, left: -50 },
          "&::after": { width: 200, height: 200, bottom: -50, right: -50 },
        }}
      />

      {/* Login Card */}
      <Paper
        elevation={12}
        sx={{
          width: { xs: "90%", sm: 400 },
          p: 5,
          borderRadius: 3,
          textAlign: "center",
          animation: `${fadeIn} 0.8s ease-out`,
          backdropFilter: "blur(12px)",
          backgroundColor: "rgba(255,255,255,0.15)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
        }}
      >
        <Typography
          variant="h4"
          mb={3}
          fontWeight="bold"
          color="#fff"
          sx={{ textShadow: "1px 1px 4px rgba(0,0,0,0.5)" }}
        >
          Login
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            label="Username"
            variant="outlined"
            fullWidth
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            sx={{
              input: { color: "#fff" },
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "rgba(255,255,255,0.5)" },
                "&:hover fieldset": { borderColor: "#fff" },
                "&.Mui-focused fieldset": { borderColor: "#fff" },
              },
              "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.7)" },
              "& .MuiInputLabel-root.Mui-focused": { color: "#fff" },
            }}
          />

          <TextField
            label="Password"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            sx={{
              input: { color: "#fff" },
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "rgba(255,255,255,0.5)" },
                "&:hover fieldset": { borderColor: "#fff" },
                "&.Mui-focused fieldset": { borderColor: "#fff" },
              },
              "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.7)" },
              "& .MuiInputLabel-root.Mui-focused": { color: "#fff" },
            }}
          />

          {error && (
            <Typography color="error" variant="body2" mt={1}>
              {error}
            </Typography>
          )}

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{
              mt: 3,
              py: 1.5,
              fontWeight: "bold",
              background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
              boxShadow: "0 4px 14px rgba(0,0,0,0.3)",
              transition: "all 0.3s ease",
              "&:hover": {
                background: "linear-gradient(90deg, #764ba2 0%, #667eea 100%)",
                transform: "translateY(-2px)",
                boxShadow: "0 6px 20px rgba(0,0,0,0.4)",
              },
            }}
          >
            Login
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default Login;

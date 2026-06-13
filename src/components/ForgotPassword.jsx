// components/ForgotPassword.jsx - Fully Responsive

import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Avatar,
  Stack,
  Link,
  useTheme,
  useMediaQuery,
  alpha,
  Alert,
  Snackbar,
  CircularProgress,
  Fade,
  Zoom,
  Slide,
  InputAdornment,
} from "@mui/material";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContexts";
import Navbar from "../pages/landing/Navbar";
import { keyframes } from "@mui/material/styles";

// ─── Animations ───────────────────────────────────────────────────────────────
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.05); opacity: 1; }
`;

const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
`;

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  brand: "#1C3F5E",
  brandDark: "#0F2A40",
  brandMid: "#2A5880",
  brandPale: "#F0F6FB",
  accent: "#0EA5E9",
  ink: "#0D1B2A",
  inkSec: "#475569",
  inkMut: "#94A3B8",
  border: "#E2E8F0",
  surface: "#FFFFFF",
  bg: "#F8FAFC",
  green: "#059669",
  greenBg: "#ECFDF5",
  red: "#DC2626",
  redBg: "#FEF2F2",
  shadowMd: "0 8px 24px rgba(15,42,64,0.10), 0 3px 8px rgba(15,42,64,0.06)",
  shadowLg: "0 20px 48px rgba(15,42,64,0.14), 0 6px 16px rgba(15,42,64,0.07)",
  font: "'Sora', 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
};

// ─── Input styles ─────────────────────────────────────────────────────────────
const inputSx = (hasError) => ({
  "& .MuiOutlinedInput-root": {
    bgcolor: C.bg,
    borderRadius: "10px",
    fontFamily: C.font,
    fontSize: "0.875rem",
    transition: "box-shadow 0.2s, border-color 0.2s",
    "& fieldset": {
      borderColor: hasError ? C.red : C.border,
    },
    "&:hover fieldset": {
      borderColor: hasError ? C.red : alpha(C.brand, 0.45),
    },
    "&.Mui-focused fieldset": {
      borderColor: hasError ? C.red : C.brand,
      borderWidth: "1.5px",
    },
    "&.Mui-focused": {
      boxShadow: `0 0 0 3px ${hasError ? alpha(C.red, 0.1) : alpha(C.brand, 0.1)}`,
    },
  },
  "& .MuiInputBase-input": {
    py: { xs: 1.2, sm: 1.35 },
    fontFamily: C.font,
    fontSize: { xs: "0.8rem", sm: "0.875rem" },
  },
  "& .MuiFormHelperText-root": {
    fontSize: { xs: "0.68rem", sm: "0.72rem" },
    marginLeft: 0,
    mt: 0.6,
    fontFamily: C.font,
    color: C.red,
  },
});

const ForgotPassword = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { forgotPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [touched, setTouched] = useState(false);
  const [shakeField, setShakeField] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [showHelp, setShowHelp] = useState(false);

  const emailInputRef = useRef(null);
  const cooldownTimerRef = useRef(null);

  useEffect(() => {
    if (emailInputRef.current) {
      setTimeout(() => emailInputRef.current?.focus(), 100);
    }
    return () => {
      if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (resendCooldown > 0) {
      cooldownTimerRef.current = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(cooldownTimerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
    };
  }, [resendCooldown]);

  const validateEmail = (emailValue) => {
    if (!emailValue) return "Email is required";
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(emailValue))
      return "Please enter a valid email address";
    return "";
  };

  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    if (touched) {
      setEmailError(validateEmail(newEmail));
    }
    if (error) {
      setError("");
      setSnackbarOpen(false);
    }
    if (shakeField) setShakeField(false);
  };

  const handleBlur = () => {
    setTouched(true);
    const validationError = validateEmail(email);
    setEmailError(validationError);
    if (validationError) {
      setShakeField(true);
      setTimeout(() => setShakeField(false), 500);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateEmail(email);
    setTouched(true);
    setEmailError(validationError);

    if (validationError) {
      setError(validationError);
      setSnackbarOpen(true);
      setShakeField(true);
      setTimeout(() => setShakeField(false), 500);
      return;
    }

    setLoading(true);
    setError("");
    setEmailError("");

    try {
      const result = await forgotPassword(email);

      if (result.success) {
        setSuccessMessage(
          result.message || "Password reset link sent to your email.",
        );
        setSubmitted(true);
        setResendCooldown(60);
      } else {
        const errorMsg =
          result.error || "Unable to process request. Please try again.";
        setEmailError(errorMsg);
        setError(errorMsg);
        setSnackbarOpen(true);
        setShakeField(true);
        setTimeout(() => setShakeField(false), 500);
      }
    } catch (err) {
      console.error("Forgot password error:", err);
      const errorMsg = "Unable to process request. Please try again later.";
      setError(errorMsg);
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => navigate("/login", { replace: true });

  const handleResendEmail = async () => {
    if (resendCooldown > 0) {
      setError(
        `Please wait ${resendCooldown} seconds before requesting again.`,
      );
      setSnackbarOpen(true);
      return;
    }

    const validationError = validateEmail(email);
    if (validationError) {
      setEmailError(validationError);
      setError(validationError);
      setSnackbarOpen(true);
      return;
    }

    setLoading(true);
    try {
      const result = await forgotPassword(email);
      if (result.success) {
        setSuccessMessage(result.message || "Reset link resent successfully!");
        setResendCooldown(60);
      } else {
        setError(result.error || "Failed to resend. Please try again.");
        setSnackbarOpen(true);
      }
    } catch (err) {
      setError("Unable to resend. Please try again later.");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => setSnackbarOpen(false);

  const getAnimationStyle = () => ({
    animation: shakeField ? `${shake} 0.5s ease` : "none",
  });

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: C.bg,
        fontFamily: C.font,
      }}
    >
      <Navbar />

      <Box
        component="main"
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pt: { xs: "72px", sm: "80px", md: "88px" },
          pb: { xs: 3, sm: 4, md: 5 },
          px: { xs: 1.5, sm: 2, md: 3 },
        }}
      >
        <Fade in={true} timeout={400}>
          <Paper
            elevation={0}
            sx={{
              maxWidth: { xs: "100%", sm: 480, md: 520 },
              width: "100%",
              borderRadius: { xs: "16px", sm: "20px", md: "24px" },
              overflow: "hidden",
              boxShadow: C.shadowMd,
              border: `1px solid ${C.border}`,
            }}
          >
            <Box sx={{ p: { xs: 2.5, sm: 3.5, md: 4 }, bgcolor: C.surface }}>
              {/* Header Section */}
              <Box
                sx={{
                  textAlign: "center",
                  mb: { xs: 3, sm: 4 },
                  animation: `${fadeUp} 0.45s ease both`,
                }}
              >
                <Zoom in={true} timeout={500}>
                  <Avatar
                    sx={{
                      bgcolor: alpha(C.brand, 0.1),
                      width: { xs: 56, sm: 64, md: 72 },
                      height: { xs: 56, sm: 64, md: 72 },
                      mx: "auto",
                      mb: 2,
                    }}
                  >
                    <EmailOutlinedIcon
                      sx={{
                        fontSize: { xs: 28, sm: 32, md: 36 },
                        color: C.brand,
                      }}
                    />
                  </Avatar>
                </Zoom>
                <Typography
                  sx={{
                    fontSize: { xs: "1.3rem", sm: "1.5rem", md: "1.65rem" },
                    fontWeight: 800,
                    color: C.ink,
                    fontFamily: C.font,
                    mb: 1,
                  }}
                >
                  Forgot Password?
                </Typography>
                <Typography
                  sx={{
                    fontSize: { xs: "0.78rem", sm: "0.83rem", md: "0.88rem" },
                    color: C.inkSec,
                    fontFamily: C.font,
                    maxWidth: "320px",
                    mx: "auto",
                    lineHeight: 1.5,
                  }}
                >
                  Enter your email address and we'll send you a link to reset
                  your password.
                </Typography>
              </Box>

              {!submitted ? (
                <Fade in={!submitted} timeout={300}>
                  <form onSubmit={handleSubmit}>
                    <Stack spacing={2.5}>
                      <Box
                        sx={{
                          animation: `${fadeUp} 0.45s 0.08s ease both`,
                          ...getAnimationStyle(),
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: { xs: "0.65rem", sm: "0.67rem" },
                            fontWeight: 700,
                            letterSpacing: "0.08em",
                            color: C.inkSec,
                            textTransform: "uppercase",
                            mb: 0.75,
                            fontFamily: C.font,
                          }}
                        >
                          Email Address
                        </Typography>
                        <TextField
                          fullWidth
                          type="email"
                          placeholder="you@company.com"
                          value={email}
                          onChange={handleEmailChange}
                          onBlur={handleBlur}
                          required
                          error={!!emailError && touched}
                          helperText={touched ? emailError : ""}
                          disabled={loading}
                          inputRef={emailInputRef}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <EmailOutlinedIcon
                                  sx={{
                                    fontSize: { xs: 18, sm: 20 },
                                    color:
                                      emailError && touched ? C.red : C.inkMut,
                                  }}
                                />
                              </InputAdornment>
                            ),
                          }}
                          sx={inputSx(!!emailError && touched)}
                        />
                      </Box>

                      {/* Help tip */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 0.5,
                          cursor: "pointer",
                          animation: `${fadeUp} 0.45s 0.13s ease both`,
                        }}
                        onMouseEnter={() => setShowHelp(true)}
                        onMouseLeave={() => setShowHelp(false)}
                      >
                        <HelpOutlineIcon
                          sx={{ fontSize: 14, color: C.inkMut }}
                        />
                        <Typography
                          sx={{
                            fontSize: { xs: "0.7rem", sm: "0.75rem" },
                            color: C.inkSec,
                            fontFamily: C.font,
                          }}
                        >
                          Need help?
                        </Typography>
                      </Box>

                      {showHelp && (
                        <Fade in={showHelp}>
                          <Alert
                            severity="info"
                            sx={{
                              borderRadius: "10px",
                              fontSize: { xs: "0.7rem", sm: "0.75rem" },
                              bgcolor: alpha(C.accent, 0.05),
                            }}
                          >
                            Check your spam folder if you don't see the email
                            within a few minutes.
                          </Alert>
                        </Fade>
                      )}

                      <Box
                        sx={{ animation: `${fadeUp} 0.45s 0.18s ease both` }}
                      >
                        <Button
                          type="submit"
                          fullWidth
                          variant="contained"
                          disabled={loading}
                          endIcon={
                            !loading && (
                              <SendOutlinedIcon
                                sx={{ fontSize: { xs: 14, sm: 16 } }}
                              />
                            )
                          }
                          sx={{
                            py: { xs: 1, sm: 1.2 },
                            bgcolor: C.brand,
                            borderRadius: "10px",
                            fontWeight: 700,
                            fontFamily: C.font,
                            fontSize: { xs: "0.85rem", sm: "0.9rem" },
                            textTransform: "none",
                            boxShadow: `0 4px 14px ${alpha(C.brand, 0.25)}`,
                            "&:hover": {
                              bgcolor: C.brandDark,
                              transform: "translateY(-2px)",
                            },
                            "&:active": { transform: "translateY(0)" },
                            "&.Mui-disabled": { bgcolor: alpha(C.brand, 0.6) },
                            transition: "all 0.22s ease",
                          }}
                        >
                          {loading ? (
                            <CircularProgress
                              size={20}
                              thickness={3}
                              sx={{ color: "#fff" }}
                            />
                          ) : (
                            "Send Reset Link"
                          )}
                        </Button>
                      </Box>
                    </Stack>
                  </form>
                </Fade>
              ) : (
                <Fade in={submitted} timeout={500}>
                  <Box sx={{ textAlign: "center" }}>
                    <Zoom in={submitted} timeout={600}>
                      <Box
                        sx={{
                          position: "relative",
                          display: "inline-block",
                          mb: 2,
                        }}
                      >
                        <CheckCircleOutlineIcon
                          sx={{
                            fontSize: { xs: 64, sm: 72, md: 80 },
                            color: C.green,
                            animation: `${pulse} 1.5s ease-in-out infinite`,
                          }}
                        />
                        <Box
                          sx={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            width: { xs: 40, sm: 48 },
                            height: { xs: 40, sm: 48 },
                            borderRadius: "50%",
                            bgcolor: alpha(C.green, 0.15),
                            animation: `${pulse} 1.5s ease-in-out infinite`,
                          }}
                        />
                      </Box>
                    </Zoom>

                    <Alert
                      severity="success"
                      icon={<CheckCircleOutlineIcon />}
                      sx={{
                        mb: 3,
                        borderRadius: "12px",
                        bgcolor: C.greenBg,
                        color: C.green,
                      }}
                    >
                      {successMessage}
                    </Alert>

                    <Typography
                      sx={{
                        fontSize: { xs: "0.8rem", sm: "0.85rem" },
                        color: C.inkSec,
                        mb: 1.5,
                        fontFamily: C.font,
                      }}
                    >
                      We've sent a password reset link to{" "}
                      <strong style={{ color: C.brand }}>{email}</strong>
                    </Typography>

                    <Typography
                      sx={{
                        fontSize: { xs: "0.7rem", sm: "0.75rem" },
                        color: C.inkMut,
                        mb: 2.5,
                        fontFamily: C.font,
                      }}
                    >
                      <MarkEmailReadIcon
                        sx={{ fontSize: 14, mr: 0.5, verticalAlign: "middle" }}
                      />
                      Didn't receive the email? Check your spam folder
                    </Typography>

                    <Stack spacing={1.5}>
                      <Button
                        onClick={handleResendEmail}
                        disabled={loading || resendCooldown > 0}
                        fullWidth
                        variant="outlined"
                        sx={{
                          py: { xs: 1, sm: 1.2 },
                          borderColor: C.brand,
                          borderRadius: "10px",
                          fontWeight: 600,
                          fontSize: { xs: "0.8rem", sm: "0.85rem" },
                          textTransform: "none",
                          color: C.brand,
                          "&:hover": {
                            borderColor: C.brandDark,
                            bgcolor: alpha(C.brand, 0.05),
                          },
                        }}
                      >
                        {loading ? (
                          <CircularProgress size={18} sx={{ color: C.brand }} />
                        ) : resendCooldown > 0 ? (
                          `Resend available in ${resendCooldown}s`
                        ) : (
                          "Resend Email"
                        )}
                      </Button>
                      <Button
                        onClick={handleBackToLogin}
                        startIcon={<ArrowBackIcon />}
                        fullWidth
                        variant="text"
                        sx={{
                          py: { xs: 1, sm: 1.2 },
                          borderRadius: "10px",
                          fontWeight: 600,
                          fontSize: { xs: "0.8rem", sm: "0.85rem" },
                          textTransform: "none",
                          color: C.inkSec,
                          "&:hover": {
                            bgcolor: alpha(C.inkSec, 0.05),
                            color: C.ink,
                          },
                        }}
                      >
                        Back to Login
                      </Button>
                    </Stack>
                  </Box>
                </Fade>
              )}

              {!submitted && (
                <Box
                  sx={{
                    mt: { xs: 2.5, sm: 3 },
                    textAlign: "center",
                    animation: `${fadeUp} 0.45s 0.23s ease both`,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: { xs: "0.7rem", sm: "0.75rem" },
                      color: C.inkMut,
                      fontFamily: C.font,
                    }}
                  >
                    Remember your password?{" "}
                    <Link
                      onClick={handleBackToLogin}
                      sx={{
                        color: C.brand,
                        fontWeight: 700,
                        textDecoration: "none",
                        cursor: "pointer",
                        "&:hover": { textDecoration: "underline" },
                      }}
                    >
                      Back to Login
                    </Link>
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Fade>
      </Box>

      {/* Error Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        TransitionComponent={Slide}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="error"
          icon={<ErrorOutlineIcon />}
          sx={{
            width: "100%",
            maxWidth: { xs: "calc(100vw - 32px)", sm: 420 },
            borderRadius: "12px",
            bgcolor: C.redBg,
            color: C.red,
          }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ForgotPassword;

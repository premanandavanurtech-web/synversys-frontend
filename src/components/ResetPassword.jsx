// components/ResetPassword.jsx - Fully Responsive with Complete Error Handling

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  IconButton,
  Avatar,
  Stack,
  Link,
  useTheme,
  useMediaQuery,
  alpha,
  Alert,
  Snackbar,
  InputAdornment,
  CircularProgress,
  Fade,
  Zoom,
  Slide,
  LinearProgress,
  Tooltip,
} from "@mui/material";
import LockResetIcon from "@mui/icons-material/LockReset";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import SecurityIcon from "@mui/icons-material/Security";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContexts";
import Navbar from "../pages/landing/Navbar";
import { keyframes } from "@mui/material/styles";

// ─── Animations ───────────────────────────────────────────────────────────────
const fadeUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
    opacity: 0.6;
  }
  50% {
    transform: scale(1.05);
    opacity: 1;
  }
`;

const shake = keyframes`
  0%, 100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-5px);
  }
  75% {
    transform: translateX(5px);
  }
`;

const glow = keyframes`
  0%, 100% {
    box-shadow: 0 0 5px rgba(26,74,107,0.2);
  }
  50% {
    box-shadow: 0 0 20px rgba(26,74,107,0.4);
  }
`;

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  brand: "#1C3F5E",
  brandDark: "#0F2A40",
  brandMid: "#2A5880",
  brandLight: "#E8F1F8",
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
  yellow: "#D97706",
  yellowBg: "#FFFBEB",
  shadow: "0 1px 3px rgba(15,42,64,0.08), 0 1px 2px rgba(15,42,64,0.04)",
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
      transition: "border-color 0.2s",
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
    "&::placeholder": {
      color: C.inkMut,
      opacity: 1,
      fontSize: { xs: "0.75rem", sm: "0.8rem" },
    },
  },
  "& .MuiFormHelperText-root": {
    fontSize: { xs: "0.68rem", sm: "0.72rem" },
    marginLeft: 0,
    mt: 0.6,
    fontFamily: C.font,
    color: C.red,
  },
});

const ResetPassword = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

  const { resetPassword } = useAuth();

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [fieldTouched, setFieldTouched] = useState({
    password: false,
    confirmPassword: false,
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [token, setToken] = useState(null);
  const [tokenError, setTokenError] = useState(false);
  const [tokenValidating, setTokenValidating] = useState(true);
  const [shakeField, setShakeField] = useState(null);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const passwordInputRef = useRef(null);
  const confirmPasswordInputRef = useRef(null);

  // Get token from URL
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const tokenParam = queryParams.get("token");

    if (!tokenParam) {
      setTokenError(true);
      setTokenValidating(false);
      setErrors({
        general:
          "Invalid or missing reset token. Please request a new password reset link.",
      });
    } else {
      setToken(tokenParam);
      setTokenValidating(false);
    }
  }, [location]);

  // Focus first input on mount
  useEffect(() => {
    if (!tokenError && !tokenValidating && passwordInputRef.current) {
      setTimeout(() => {
        passwordInputRef.current?.focus();
      }, 100);
    }
  }, [tokenError, tokenValidating]);

  const validatePassword = useCallback((password) => {
    const requirements = [];
    if (password.length < 8) {
      requirements.push("At least 8 characters");
    }
    if (!/[A-Z]/.test(password)) {
      requirements.push("One uppercase letter");
    }
    if (!/[a-z]/.test(password)) {
      requirements.push("One lowercase letter");
    }
    if (!/[0-9]/.test(password)) {
      requirements.push("One number");
    }
    return requirements;
  }, []);

  const getPasswordStrength = useCallback((password) => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
    return strength;
  }, []);

  const strengthScore = getPasswordStrength(formData.password);
  const strengthInfo = () => {
    if (strengthScore <= 2)
      return { text: "Weak", color: C.red, progressColor: "#ef4444" };
    if (strengthScore <= 4)
      return { text: "Medium", color: C.yellow, progressColor: "#f59e0b" };
    return { text: "Strong", color: C.green, progressColor: "#10b981" };
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    // Clear shake animation
    if (shakeField === name) {
      setShakeField(null);
    }
  };

  const handleBlur = (fieldName, value) => {
    setFieldTouched((prev) => ({ ...prev, [fieldName]: true }));

    let error = "";
    if (fieldName === "password") {
      const requirements = validatePassword(value);
      if (value && requirements.length > 0) {
        error = requirements.join(", ");
      }
    } else if (fieldName === "confirmPassword" && value) {
      if (value !== formData.password) {
        error = "Passwords do not match";
      }
    }

    if (error) {
      setErrors((prev) => ({ ...prev, [fieldName]: error }));
      setShakeField(fieldName);
      setTimeout(() => setShakeField(null), 500);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      setErrors({
        general:
          "Invalid reset token. Please request a new password reset link.",
      });
      setSnackbarOpen(true);
      return;
    }

    // Mark all fields as touched
    setFieldTouched({ password: true, confirmPassword: true });

    const newErrors = {};
    const passwordRequirements = validatePassword(formData.password);

    // Validate password
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (passwordRequirements.length > 0) {
      newErrors.password = passwordRequirements.join(", ");
    }

    // Validate confirm password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setSnackbarOpen(true);
      if (newErrors.password) {
        setShakeField("password");
        passwordInputRef.current?.focus();
      } else if (newErrors.confirmPassword) {
        setShakeField("confirmPassword");
        confirmPasswordInputRef.current?.focus();
      }
      setTimeout(() => setShakeField(null), 500);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const result = await resetPassword(
        token,
        formData.password,
        formData.confirmPassword,
      );

      if (result.success) {
        setSubmitted(true);
      } else {
        setErrors({ general: result.error });
        setSnackbarOpen(true);
      }
    } catch (err) {
      console.error("Reset password error:", err);
      setErrors({ general: "An unexpected error occurred. Please try again." });
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate("/login", { replace: true });
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const getAnimationStyle = (fieldName) => ({
    animation: shakeField === fieldName ? `${shake} 0.5s ease` : "none",
  });

  // Check if password meets individual requirements
  const passwordChecks = {
    length: formData.password.length >= 8,
    uppercase: /[A-Z]/.test(formData.password),
    lowercase: /[a-z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
  };

  // Loading state while validating token
  if (tokenValidating) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          bgcolor: C.bg,
        }}
      >
        <Navbar />
        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress sx={{ color: C.brand }} />
        </Box>
      </Box>
    );
  }

  // Show error if token is missing or invalid
  if (tokenError) {
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
            p: { xs: 1.5, sm: 2, md: 3 },
            pt: { xs: "72px", sm: "80px", md: "88px" },
          }}
        >
          <Fade in={true} timeout={400}>
            <Paper
              elevation={0}
              sx={{
                maxWidth: { xs: "100%", sm: 480, md: 520 },
                width: "100%",
                borderRadius: { xs: "16px", sm: "20px", md: "24px" },
                p: { xs: 2.5, sm: 3.5, md: 4 },
                textAlign: "center",
                border: `1px solid ${C.border}`,
                boxShadow: C.shadowMd,
              }}
            >
              <Zoom in={true}>
                <Box
                  sx={{
                    width: { xs: 72, sm: 80 },
                    height: { xs: 72, sm: 80 },
                    mx: "auto",
                    mb: 2,
                    borderRadius: "50%",
                    bgcolor: alpha(C.red, 0.1),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ErrorIcon
                    sx={{ fontSize: { xs: 40, sm: 48 }, color: C.red }}
                  />
                </Box>
              </Zoom>
              <Typography
                sx={{
                  fontSize: { xs: "1.2rem", sm: "1.4rem" },
                  fontWeight: 800,
                  color: C.ink,
                  mb: 1.5,
                  fontFamily: C.font,
                }}
              >
                Invalid Reset Link
              </Typography>
              <Typography
                sx={{
                  fontSize: { xs: "0.8rem", sm: "0.85rem" },
                  color: C.inkSec,
                  mb: 3,
                  fontFamily: C.font,
                  lineHeight: 1.5,
                }}
              >
                {errors.general ||
                  "The password reset link is invalid or has expired."}
              </Typography>
              <Button
                onClick={handleBackToLogin}
                fullWidth
                variant="contained"
                sx={{
                  py: { xs: 1, sm: 1.2 },
                  bgcolor: C.brand,
                  borderRadius: "10px",
                  fontWeight: 700,
                  textTransform: "none",
                  fontSize: { xs: "0.85rem", sm: "0.9rem" },
                  "&:hover": {
                    bgcolor: C.brandDark,
                  },
                }}
              >
                Back to Login
              </Button>
            </Paper>
          </Fade>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: C.bg,
        fontFamily: C.font,
        overflowX: "hidden",
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
          pt: { xs: "72px", sm: "80px", md: "88px", lg: "96px" },
          pb: { xs: 3, sm: 4, md: 5 },
          px: { xs: 1.5, sm: 2, md: 3 },
        }}
      >
        <Fade in={true} timeout={400}>
          <Paper
            elevation={0}
            sx={{
              maxWidth: { xs: "100%", sm: 500, md: 540 },
              width: "100%",
              borderRadius: { xs: "16px", sm: "20px", md: "24px" },
              overflow: "hidden",
              boxShadow: C.shadowMd,
              border: `1px solid ${C.border}`,
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              "&:hover": {
                boxShadow: C.shadowLg,
              },
            }}
          >
            <Box
              sx={{
                p: { xs: 2.5, sm: 3.5, md: 4 },
                bgcolor: C.surface,
              }}
            >
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
                      transition: "transform 0.2s ease",
                      "&:hover": {
                        transform: "scale(1.05)",
                      },
                    }}
                  >
                    <VpnKeyIcon
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
                    letterSpacing: "-0.025em",
                    mb: 1,
                  }}
                >
                  Reset Password
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
                  Please create a new secure password for your account.
                </Typography>
              </Box>

              {!submitted ? (
                <Fade in={!submitted} timeout={300}>
                  <form onSubmit={handleSubmit}>
                    <Stack spacing={2.5}>
                      {/* New Password Field */}
                      <Box
                        sx={{
                          animation: `${fadeUp} 0.45s 0.08s ease both`,
                          ...getAnimationStyle("password"),
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: { xs: "0.65rem", sm: "0.67rem" },
                            fontWeight: 700,
                            letterSpacing: "0.08em",
                            color: C.inkSec,
                            textTransform: "uppercase",
                            display: "block",
                            mb: 0.75,
                            fontFamily: C.font,
                          }}
                        >
                          New Password
                        </Typography>
                        <TextField
                          fullWidth
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a new password"
                          value={formData.password}
                          onChange={handleChange}
                          onBlur={() =>
                            handleBlur("password", formData.password)
                          }
                          onFocus={() => setPasswordFocused(true)}
                          variant="outlined"
                          error={!!errors.password && fieldTouched.password}
                          helperText={
                            fieldTouched.password ? errors.password : ""
                          }
                          disabled={loading}
                          inputRef={passwordInputRef}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <SecurityIcon
                                  sx={{
                                    fontSize: { xs: 18, sm: 20 },
                                    color:
                                      errors.password && fieldTouched.password
                                        ? C.red
                                        : C.inkMut,
                                  }}
                                />
                              </InputAdornment>
                            ),
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={() => setShowPassword(!showPassword)}
                                  edge="end"
                                  size="small"
                                  disabled={loading}
                                  sx={{ p: { xs: 0.75, sm: 0.5 } }}
                                >
                                  {showPassword ? (
                                    <VisibilityOffIcon
                                      sx={{ fontSize: { xs: 16, sm: 18 } }}
                                    />
                                  ) : (
                                    <VisibilityIcon
                                      sx={{ fontSize: { xs: 16, sm: 18 } }}
                                    />
                                  )}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                          sx={inputSx(
                            !!errors.password && fieldTouched.password,
                          )}
                        />

                        {/* Password Requirements & Strength Indicator */}
                        {(formData.password || passwordFocused) && (
                          <Fade in={true}>
                            <Box sx={{ mt: 1.5 }}>
                              {/* Password strength bar */}
                              <Box sx={{ mb: 1.5 }}>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    mb: 0.5,
                                  }}
                                >
                                  <Box
                                    sx={{
                                      flex: 1,
                                      height: 4,
                                      bgcolor: alpha(C.border, 0.5),
                                      borderRadius: "2px",
                                      overflow: "hidden",
                                    }}
                                  >
                                    <LinearProgress
                                      variant="determinate"
                                      value={(strengthScore / 5) * 100}
                                      sx={{
                                        height: 4,
                                        borderRadius: "2px",
                                        bgcolor: "transparent",
                                        "& .MuiLinearProgress-bar": {
                                          bgcolor: strengthInfo().progressColor,
                                          transition: "width 0.3s ease",
                                        },
                                      }}
                                    />
                                  </Box>
                                  <Typography
                                    sx={{
                                      fontSize: { xs: "0.65rem", sm: "0.7rem" },
                                      color: strengthInfo().color,
                                      fontWeight: 600,
                                      fontFamily: C.font,
                                    }}
                                  >
                                    {strengthInfo().text}
                                  </Typography>
                                </Box>
                              </Box>

                              {/* Requirements checklist */}
                              <Stack spacing={0.75}>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                  }}
                                >
                                  {passwordChecks.length ? (
                                    <CheckIcon
                                      sx={{ fontSize: 14, color: C.green }}
                                    />
                                  ) : (
                                    <CloseIcon
                                      sx={{ fontSize: 14, color: C.inkMut }}
                                    />
                                  )}
                                  <Typography
                                    sx={{
                                      fontSize: { xs: "0.7rem", sm: "0.75rem" },
                                      color: passwordChecks.length
                                        ? C.green
                                        : C.inkSec,
                                      fontFamily: C.font,
                                    }}
                                  >
                                    At least 8 characters
                                  </Typography>
                                </Box>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                  }}
                                >
                                  {passwordChecks.uppercase ? (
                                    <CheckIcon
                                      sx={{ fontSize: 14, color: C.green }}
                                    />
                                  ) : (
                                    <CloseIcon
                                      sx={{ fontSize: 14, color: C.inkMut }}
                                    />
                                  )}
                                  <Typography
                                    sx={{
                                      fontSize: { xs: "0.7rem", sm: "0.75rem" },
                                      color: passwordChecks.uppercase
                                        ? C.green
                                        : C.inkSec,
                                      fontFamily: C.font,
                                    }}
                                  >
                                    One uppercase letter
                                  </Typography>
                                </Box>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                  }}
                                >
                                  {passwordChecks.lowercase ? (
                                    <CheckIcon
                                      sx={{ fontSize: 14, color: C.green }}
                                    />
                                  ) : (
                                    <CloseIcon
                                      sx={{ fontSize: 14, color: C.inkMut }}
                                    />
                                  )}
                                  <Typography
                                    sx={{
                                      fontSize: { xs: "0.7rem", sm: "0.75rem" },
                                      color: passwordChecks.lowercase
                                        ? C.green
                                        : C.inkSec,
                                      fontFamily: C.font,
                                    }}
                                  >
                                    One lowercase letter
                                  </Typography>
                                </Box>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                  }}
                                >
                                  {passwordChecks.number ? (
                                    <CheckIcon
                                      sx={{ fontSize: 14, color: C.green }}
                                    />
                                  ) : (
                                    <CloseIcon
                                      sx={{ fontSize: 14, color: C.inkMut }}
                                    />
                                  )}
                                  <Typography
                                    sx={{
                                      fontSize: { xs: "0.7rem", sm: "0.75rem" },
                                      color: passwordChecks.number
                                        ? C.green
                                        : C.inkSec,
                                      fontFamily: C.font,
                                    }}
                                  >
                                    One number
                                  </Typography>
                                </Box>
                              </Stack>
                            </Box>
                          </Fade>
                        )}
                      </Box>

                      {/* Confirm Password Field */}
                      <Box
                        sx={{
                          animation: `${fadeUp} 0.45s 0.13s ease both`,
                          ...getAnimationStyle("confirmPassword"),
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: { xs: "0.65rem", sm: "0.67rem" },
                            fontWeight: 700,
                            letterSpacing: "0.08em",
                            color: C.inkSec,
                            textTransform: "uppercase",
                            display: "block",
                            mb: 0.75,
                            fontFamily: C.font,
                          }}
                        >
                          Confirm Password
                        </Typography>
                        <TextField
                          fullWidth
                          name="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your new password"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          onBlur={() =>
                            handleBlur(
                              "confirmPassword",
                              formData.confirmPassword,
                            )
                          }
                          variant="outlined"
                          error={
                            !!errors.confirmPassword &&
                            fieldTouched.confirmPassword
                          }
                          helperText={
                            fieldTouched.confirmPassword
                              ? errors.confirmPassword
                              : ""
                          }
                          disabled={loading}
                          inputRef={confirmPasswordInputRef}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <LockResetIcon
                                  sx={{
                                    fontSize: { xs: 18, sm: 20 },
                                    color:
                                      errors.confirmPassword &&
                                      fieldTouched.confirmPassword
                                        ? C.red
                                        : C.inkMut,
                                  }}
                                />
                              </InputAdornment>
                            ),
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={() =>
                                    setShowConfirmPassword(!showConfirmPassword)
                                  }
                                  edge="end"
                                  size="small"
                                  disabled={loading}
                                  sx={{ p: { xs: 0.75, sm: 0.5 } }}
                                >
                                  {showConfirmPassword ? (
                                    <VisibilityOffIcon
                                      sx={{ fontSize: { xs: 16, sm: 18 } }}
                                    />
                                  ) : (
                                    <VisibilityIcon
                                      sx={{ fontSize: { xs: 16, sm: 18 } }}
                                    />
                                  )}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                          sx={inputSx(
                            !!errors.confirmPassword &&
                              fieldTouched.confirmPassword,
                          )}
                        />
                      </Box>

                      {/* Submit Button */}
                      <Box
                        sx={{ animation: `${fadeUp} 0.45s 0.18s ease both` }}
                      >
                        <Button
                          type="submit"
                          fullWidth
                          variant="contained"
                          disabled={loading}
                          sx={{
                            py: { xs: 1, sm: 1.2 },
                            bgcolor: C.brand,
                            borderRadius: "10px",
                            fontWeight: 700,
                            fontFamily: C.font,
                            fontSize: { xs: "0.85rem", sm: "0.9rem" },
                            textTransform: "none",
                            letterSpacing: "-0.01em",
                            boxShadow: `0 4px 14px ${alpha(C.brand, 0.25)}`,
                            "&:hover": {
                              bgcolor: C.brandDark,
                              transform: "translateY(-2px)",
                              boxShadow: `0 6px 18px ${alpha(C.brand, 0.3)}`,
                            },
                            "&:active": {
                              transform: "translateY(0)",
                            },
                            "&.Mui-disabled": {
                              bgcolor: alpha(C.brand, 0.6),
                            },
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
                            "Reset Password"
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
                        <CheckCircleIcon
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
                      icon={<CheckCircleIcon />}
                      sx={{
                        mb: 3,
                        borderRadius: "12px",
                        "& .MuiAlert-message": {
                          fontSize: { xs: "0.75rem", sm: "0.8rem" },
                          fontFamily: C.font,
                        },
                        bgcolor: C.greenBg,
                        color: C.green,
                      }}
                    >
                      Password reset successful!
                    </Alert>

                    <Typography
                      sx={{
                        fontSize: { xs: "0.8rem", sm: "0.85rem" },
                        color: C.inkSec,
                        mb: 3,
                        fontFamily: C.font,
                        lineHeight: 1.5,
                      }}
                    >
                      Your password has been successfully reset. You can now
                      login with your new password.
                    </Typography>

                    <Button
                      onClick={handleBackToLogin}
                      fullWidth
                      variant="contained"
                      sx={{
                        py: { xs: 1, sm: 1.2 },
                        bgcolor: C.brand,
                        borderRadius: "10px",
                        fontWeight: 700,
                        fontFamily: C.font,
                        fontSize: { xs: "0.85rem", sm: "0.9rem" },
                        textTransform: "none",
                        "&:hover": {
                          bgcolor: C.brandDark,
                        },
                      }}
                    >
                      Go to Login
                    </Button>
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
                    Need help?{" "}
                    <Link
                      href="#"
                      sx={{
                        color: C.brand,
                        fontWeight: 700,
                        textDecoration: "none",
                        fontSize: { xs: "0.7rem", sm: "0.75rem" },
                        cursor: "pointer",
                        "&:hover": {
                          textDecoration: "underline",
                        },
                      }}
                    >
                      Contact Support
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
          icon={<ErrorIcon />}
          sx={{
            width: "100%",
            maxWidth: { xs: "calc(100vw - 32px)", sm: 420 },
            borderRadius: "12px",
            fontSize: { xs: "0.75rem", sm: "0.8rem" },
            fontFamily: C.font,
            fontWeight: 500,
            boxShadow: C.shadowLg,
            bgcolor: C.redBg,
            color: C.red,
            "& .MuiAlert-icon": {
              color: C.red,
            },
          }}
        >
          {errors.password || errors.confirmPassword || errors.general}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ResetPassword;

// components/Login.jsx - Fixed Redirect Issue & Modal

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Paper,
  IconButton,
  InputAdornment,
  Avatar,
  Stack,
  Link,
  useTheme,
  useMediaQuery,
  alpha,
  Alert,
  Snackbar,
  CircularProgress,
  Divider,
  Tooltip,
  Fade,
  Zoom,
  Slide,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  ArrowForward,
  Visibility,
  VisibilityOff,
  CheckCircle,
  CheckCircleOutline,
  Error as ErrorIcon,
  ErrorOutline,
  Google,
  Microsoft,
  Apple,
  Lock,
  MailOutline,
  ShieldOutlined,
  Close as CloseIcon,
  WarningAmberOutlined,
  LockResetOutlined,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContexts";
import Navbar from "../pages/landing/Navbar";
import { keyframes } from "@mui/material/styles";

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(18px); }
  to { opacity: 1; transform: translateY(0); }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideLeft = keyframes`
  from { opacity: 0; transform: translateX(22px); }
  to { opacity: 1; transform: translateX(0); }
`;

const glow = keyframes`
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
`;

const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
`;

const C = {
  brand: "#1C3F5E",
  brandDark: "#0F2A40",
  brandMid: "#2A5880",
  brandLight: "#E8F1F8",
  brandPale: "#F0F6FB",
  accent: "#0EA5E9",
  accentPale: "#E0F2FE",
  ink: "#0D1B2A",
  inkSec: "#475569",
  inkMut: "#94A3B8",
  border: "#E2E8F0",
  borderFoc: "#1C3F5E",
  surface: "#FFFFFF",
  bg: "#F8FAFC",
  green: "#059669",
  greenBg: "#ECFDF5",
  red: "#DC2626",
  redBg: "#FEF2F2",
  orange: "#EA580C",
  orangeBg: "#FFF7ED",
  shadow: "0 1px 3px rgba(15,42,64,0.08), 0 1px 2px rgba(15,42,64,0.04)",
  shadowMd: "0 8px 24px rgba(15,42,64,0.10), 0 3px 8px rgba(15,42,64,0.06)",
  shadowLg: "0 20px 48px rgba(15,42,64,0.14), 0 6px 16px rgba(15,42,64,0.07)",
  font: "'Sora', 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
};

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
    py: 1.35,
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

const FEATURES = [
  "Real-time asset tracking across all locations",
  "Role-based access for teams of any size",
  "Audit-ready reports with one click",
];

const getRedirectPath = (role) => {
  if (!role) return "/dashboard";
  const r = role.toLowerCase();
  if (r === "team") return "/team";
  if (r === "admin" || r === "super_admin") return "/dashboard";
  return "/dashboard";
};

const validateEmail = (v) => {
  if (!v) return "Email is required";
  if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v))
    return "Enter a valid email address";
  return "";
};

const validatePassword = (v) => {
  if (!v) return "Password is required";
  if (v.length < 6) return "At least 6 characters required";
  return "";
};

function ForgotPasswordModal({ open, onClose, onForgotPassword, loading }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [touched, setTouched] = useState(false);

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setEmail("");
      setError("");
      setSuccess("");
      setTouched(false);
    }, 200);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailError = validateEmail(email);
    setTouched(true);
    if (emailError) {
      setError(emailError);
      return;
    }

    const result = await onForgotPassword(email);
    if (result.success) {
      setSuccess(result.message || "Check your inbox for the reset link.");
      setError("");
      setTimeout(handleClose, 3000);
    } else {
      setError(result.error || "Something went wrong. Please try again.");
      setSuccess("");
    }
  };

  const hasError = touched && !!error;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "16px",
          boxShadow: C.shadowLg,
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle
        sx={{
          p: { xs: 2.5, sm: 3 },
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "10px",
              bgcolor: C.brandPale,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <LockResetOutlined sx={{ fontSize: 20, color: C.brand }} />
          </Box>
          <Box>
            <Typography
              sx={{
                fontSize: { xs: "1rem", sm: "1.1rem" },
                fontWeight: 700,
                color: C.ink,
                fontFamily: C.font,
                lineHeight: 1.3,
              }}
            >
              Reset your password
            </Typography>
            <Typography
              sx={{
                fontSize: "0.75rem",
                color: C.inkMut,
                fontFamily: C.font,
                mt: 0.25,
              }}
            >
              We'll email you a secure link
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={handleClose}
          size="small"
          sx={{
            mt: 0.25,
            color: C.inkMut,
            "&:hover": { bgcolor: C.brandPale, color: C.brand },
          }}
        >
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </DialogTitle>

      <Box sx={{ borderTop: `1px solid ${C.border}` }} />

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ p: { xs: 2.5, sm: 3 } }}>
          {!success ? (
            <>
              <Typography
                sx={{
                  fontSize: "0.85rem",
                  color: C.inkSec,
                  mb: 2.5,
                  fontFamily: C.font,
                  lineHeight: 1.6,
                }}
              >
                Enter the email address associated with your account and
                we'll send a link to reset your password.
              </Typography>

              <Typography
                sx={{
                  fontSize: "0.67rem",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  color: C.inkSec,
                  textTransform: "uppercase",
                  display: "block",
                  mb: 0.75,
                  fontFamily: C.font,
                }}
              >
                Email address
              </Typography>
              <TextField
                fullWidth
                placeholder="you@company.com"
                type="email"
                value={email}
                autoFocus
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (touched) setError(validateEmail(e.target.value));
                }}
                onBlur={() => {
                  setTouched(true);
                  setError(validateEmail(email));
                }}
                error={hasError}
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <MailOutline
                      sx={{
                        fontSize: 17,
                        color: hasError ? C.red : C.inkMut,
                        mr: 1,
                      }}
                    />
                  ),
                }}
                sx={inputSx(hasError)}
              />

              <Fade in={hasError}>
                <Box
                  sx={{
                    display: hasError ? "flex" : "none",
                    alignItems: "center",
                    gap: 0.75,
                    mt: 1,
                  }}
                >
                  <ErrorOutline sx={{ fontSize: 14, color: C.red }} />
                  <Typography
                    sx={{ fontSize: "0.75rem", color: C.red, fontFamily: C.font }}
                  >
                    {error}
                  </Typography>
                </Box>
              </Fade>
            </>
          ) : (
            <Fade in={!!success}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  py: 2,
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    bgcolor: C.greenBg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 2,
                  }}
                >
                  <CheckCircleOutline sx={{ fontSize: 26, color: C.green }} />
                </Box>
                <Typography
                  sx={{
                    fontSize: "0.95rem",
                    fontWeight: 700,
                    color: C.ink,
                    fontFamily: C.font,
                    mb: 0.5,
                  }}
                >
                  Check your inbox
                </Typography>
                <Typography
                  sx={{
                    fontSize: "0.82rem",
                    color: C.inkSec,
                    fontFamily: C.font,
                    maxWidth: 320,
                  }}
                >
                  {success}
                </Typography>
              </Box>
            </Fade>
          )}
        </DialogContent>

        {!success && (
          <DialogActions
            sx={{
              p: { xs: 2.5, sm: 3 },
              pt: 0.5,
              gap: 1,
            }}
          >
            <Button
              onClick={handleClose}
              sx={{
                textTransform: "none",
                fontFamily: C.font,
                fontSize: "0.85rem",
                fontWeight: 600,
                color: C.inkSec,
                px: 2,
                borderRadius: "8px",
                "&:hover": { bgcolor: C.bg },
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disableElevation
              disabled={loading || !email}
              sx={{
                textTransform: "none",
                fontFamily: C.font,
                fontSize: "0.85rem",
                fontWeight: 700,
                bgcolor: C.brand,
                borderRadius: "8px",
                px: 3,
                py: 1,
                boxShadow: `0 4px 14px ${alpha(C.brand, 0.25)}`,
                "&:hover": {
                  bgcolor: C.brandDark,
                  boxShadow: `0 6px 18px ${alpha(C.brand, 0.3)}`,
                },
                "&.Mui-disabled": {
                  bgcolor: alpha(C.brand, 0.4),
                  color: "#fff",
                },
              }}
            >
              {loading ? (
                <CircularProgress size={18} thickness={3} sx={{ color: "#fff" }} />
              ) : (
                "Send reset link"
              )}
            </Button>
          </DialogActions>
        )}
      </form>
    </Dialog>
  );
}

export default function LoginPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isLgUp = useMediaQuery(theme.breakpoints.up("lg"));

  const isMounted = useRef(true);
  const redirectInProgress = useRef(false);
  const redirectTimerRef = useRef(null);

  const {
    login,
    forgotPassword,
    loading: authLoading,
    user,
    isAuthenticated,
  } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errOpen, setErrOpen] = useState(false);
  const [okOpen, setOkOpen] = useState(false);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });
  const [fieldErrors, setFieldErrors] = useState({ email: "", password: "" });
  const [fieldTouched, setFieldTouched] = useState({
    email: false,
    password: false,
  });
  const [shakeField, setShakeField] = useState(null);
  const [networkError, setNetworkError] = useState(false);
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  const isDisabled = submitting || forgotLoading;

  // Load remembered email
  useEffect(() => {
    const rem = localStorage.getItem("rememberMe");
    const email = localStorage.getItem("rememberedEmail");
    if (rem === "true" && email) {
      setFormData((p) => ({ ...p, email, remember: true }));
    }
  }, []);

  // Check backend status on mount
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await fetch(
          "https://synversys-backend.onrender.com/api/v1/auth/health",
          { method: "GET", timeout: 5000 },
        );
        if (!response.ok) {
          setNetworkError(true);
        }
      } catch {
        setNetworkError(true);
      } finally {
        setInitialCheckDone(true);
      }
    };
    checkBackend();
  }, []);

  // Redirect already-authenticated users
  useEffect(() => {
    if (!initialCheckDone) return;
    if (submitting || redirectInProgress.current) return;
    if (!authLoading && isAuthenticated && user) {
      const path = getRedirectPath(user.role);
      console.log("[Login] Already authenticated, redirecting to:", path);
      redirectInProgress.current = true;
      navigate(path, { replace: true });
    }
  }, [
    isAuthenticated,
    user,
    authLoading,
    navigate,
    submitting,
    initialCheckDone,
  ]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
      }
    };
  }, []);

  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setFormData((p) => ({ ...p, [name]: value }));
      if (fieldTouched[name]) {
        setFieldErrors((p) => ({
          ...p,
          [name]:
            name === "email" ? validateEmail(value) : validatePassword(value),
        }));
      }
      if (errorMsg) setErrorMsg("");
      if (shakeField === name) setShakeField(null);
    },
    [fieldTouched, errorMsg, shakeField],
  );

  const handleBlur = useCallback((e) => {
    const { name, value } = e.target;
    setFieldTouched((p) => ({ ...p, [name]: true }));
    const error =
      name === "email" ? validateEmail(value) : validatePassword(value);
    setFieldErrors((p) => ({ ...p, [name]: error }));
    if (error) {
      setShakeField(name);
      setTimeout(() => setShakeField(null), 500);
    }
  }, []);

  const handleForgotPassword = async (email) => {
    setForgotLoading(true);
    const result = await forgotPassword(email);
    setForgotLoading(false);
    return result;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailErr = validateEmail(formData.email);
    const passwordErr = validatePassword(formData.password);

    setFieldTouched({ email: true, password: true });
    setFieldErrors({ email: emailErr, password: passwordErr });

    if (emailErr || passwordErr) {
      if (emailErr) {
        setShakeField("email");
      } else if (passwordErr) {
        setShakeField("password");
      }
      setTimeout(() => setShakeField(null), 500);
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      const result = await login(formData.email, formData.password);

      if (result.success) {
        if (formData.remember) {
          localStorage.setItem("rememberMe", "true");
          localStorage.setItem("rememberedEmail", formData.email);
        } else {
          localStorage.removeItem("rememberMe");
          localStorage.removeItem("rememberedEmail");
        }

        const role = result.role || result.user?.role || result.userType;
        const path = getRedirectPath(role);

        console.log("[Login] Success — role:", role, "→ redirecting to:", path);

        setSuccessMsg(result.message || "Login successful! Redirecting…");
        setOkOpen(true);
        redirectInProgress.current = true;

        if (redirectTimerRef.current) {
          clearTimeout(redirectTimerRef.current);
        }

        redirectTimerRef.current = setTimeout(() => {
          if (isMounted.current) {
            setOkOpen(false);
            setSubmitting(false);
            navigate(path, { replace: true });
          }
        }, 1000);
      } else {
        if (isMounted.current) {
          setErrorMsg(result.error || "Invalid email or password");
          setErrOpen(true);
          setSubmitting(false);
          setShakeField("password");
          setTimeout(() => setShakeField(null), 500);
        }
      }
    } catch (err) {
      if (isMounted.current) {
        console.error("[Login] Unexpected error:", err);
        setErrorMsg("An unexpected error occurred. Please try again.");
        setErrOpen(true);
        setSubmitting(false);
      }
    }
  };

  const getAnimationStyle = (fieldName) => ({
    animation: shakeField === fieldName ? `${shake} 0.5s ease` : "none",
  });

  if (authLoading && !initialCheckDone) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: C.bg,
        }}
      >
        <CircularProgress sx={{ color: C.brand }} />
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
        <Box
          sx={{
            width: "100%",
            maxWidth: { xs: "100%", sm: 500, md: 720, lg: 1020, xl: 1100 },
            transition: "box-shadow 0.3s ease",
            borderRadius: { xs: "16px", sm: "20px", md: "24px" },
          }}
        >
          <Paper
            elevation={0}
            sx={{
              width: "100%",
              display: "grid",
              gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
              borderRadius: "inherit",
              overflow: "hidden",
              boxShadow: C.shadowMd,
              border: `1px solid ${C.border}`,
            }}
          >
            {/* Left panel */}
            <Box
              sx={{
                display: { xs: "none", lg: "flex" },
                flexDirection: "column",
                justifyContent: "space-between",
                p: { lg: 4, xl: 4.5 },
                background: `linear-gradient(150deg, ${C.brand} 0%, ${C.brandDark} 100%)`,
                color: "#fff",
                position: "relative",
                overflow: "hidden",
                minHeight: 500,
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  top: -60,
                  right: -60,
                  width: 220,
                  height: 220,
                  borderRadius: "50%",
                  bgcolor: alpha("#fff", 0.04),
                  pointerEvents: "none",
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  bottom: -80,
                  left: -40,
                  width: 280,
                  height: 280,
                  borderRadius: "50%",
                  bgcolor: alpha(C.accent, 0.08),
                  filter: "blur(40px)",
                  pointerEvents: "none",
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  top: "40%",
                  right: -30,
                  width: 120,
                  height: 120,
                  borderRadius: "50%",
                  bgcolor: alpha(C.accent, 0.1),
                  filter: "blur(24px)",
                  pointerEvents: "none",
                }}
              />

              <Box
                sx={{
                  position: "relative",
                  zIndex: 2,
                  animation: `${fadeUp} 0.55s ease both`,
                }}
              >
                <Box
                  sx={{
                    mb: 3.5,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 1.25,
                    px: 1.5,
                    py: 0.75,
                    borderRadius: "8px",
                    bgcolor: alpha("#fff", 0.08),
                    border: `1px solid ${alpha("#fff", 0.12)}`,
                  }}
                >
                  <ShieldOutlined sx={{ fontSize: 16, color: C.accent }} />
                  <Typography
                    sx={{
                      fontSize: "0.68rem",
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      fontFamily: C.font,
                      color: alpha("#fff", 0.9),
                    }}
                  >
                    AMS Blue Ledger
                  </Typography>
                </Box>

                <Typography
                  sx={{
                    fontSize: { lg: "1.85rem", xl: "2.1rem" },
                    fontWeight: 800,
                    lineHeight: 1.15,
                    letterSpacing: "-0.03em",
                    fontFamily: C.font,
                    mb: 1.5,
                  }}
                >
                  Precision in
                  <br />
                  Every Asset.
                </Typography>
                <Box
                  sx={{
                    width: 36,
                    height: 2.5,
                    bgcolor: C.accent,
                    borderRadius: 2,
                    mb: 2.5,
                    animation: `${glow} 2.5s ease-in-out infinite`,
                  }}
                />
                <Typography
                  sx={{
                    color: alpha("#fff", 0.72),
                    fontSize: "0.82rem",
                    maxWidth: "270px",
                    lineHeight: 1.65,
                    fontFamily: C.font,
                  }}
                >
                  The gold standard in institutional asset management —
                  editorial-grade accuracy for global portfolios.
                </Typography>

                <Stack spacing={1.25} mt={3.5}>
                  {FEATURES.map((f, i) => (
                    <Stack
                      key={i}
                      direction="row"
                      spacing={1.25}
                      alignItems="flex-start"
                      sx={{
                        animation: `${slideLeft} 0.5s ${0.1 + i * 0.1}s ease both`,
                      }}
                    >
                      <CheckCircle
                        sx={{
                          fontSize: 15,
                          color: C.accent,
                          mt: "1px",
                          flexShrink: 0,
                        }}
                      />
                      <Typography
                        sx={{
                          fontSize: "0.78rem",
                          color: alpha("#fff", 0.8),
                          fontFamily: C.font,
                          lineHeight: 1.5,
                        }}
                      >
                        {f}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </Box>

              <Box
                sx={{
                  position: "relative",
                  zIndex: 2,
                  mt: 3,
                  bgcolor: alpha("#fff", 0.05),
                  backdropFilter: "blur(12px)",
                  borderRadius: "14px",
                  p: 2.5,
                  border: `1px solid ${alpha("#fff", 0.1)}`,
                  animation: `${fadeUp} 0.6s 0.3s ease both`,
                }}
              >
                <Typography
                  sx={{
                    fontSize: "0.75rem",
                    fontStyle: "italic",
                    color: alpha("#fff", 0.88),
                    mb: 1.75,
                    lineHeight: 1.6,
                    fontFamily: C.font,
                  }}
                >
                  "AMS has redefined our reporting workflow. The clarity and
                  integrity of data is unparalleled."
                </Typography>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Avatar
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDLCu_EUKJrSJiUVVAXsi8T22b92VZxvYOuIuDjvPeHA2sjj8D1heZu_khnNtdSG-vZTY9AJp0ze4h8Ohjg_qSVkrhP3OlbILSfCeMm6aIWRY8r_14XplmwLKWLbvi8hm0_HJQ_45KSfAQljMwlPwrGixAmnAgrDdDqL9R5wXs8GpbjnM4LXPOa-qbc4-CRTSKhoRwBk7FyBKj9krpJ5RVy8leZWgp2uNYS0OoI7nzW_uvf49vfrEQ9OFTKNBzEHWBgnUNCrWxVsE1g"
                    sx={{
                      width: 34,
                      height: 34,
                      border: `1.5px solid ${alpha("#fff", 0.2)}`,
                    }}
                  />
                  <Box>
                    <Typography
                      sx={{
                        fontSize: "0.68rem",
                        fontWeight: 700,
                        letterSpacing: "0.04em",
                        color: "#fff",
                        fontFamily: C.font,
                      }}
                    >
                      Marcus Thorne
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "0.62rem",
                        color: alpha("#fff", 0.65),
                        fontFamily: C.font,
                      }}
                    >
                      CIO, Veritas Global
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Box>

            {/* Right panel - Login form */}
            <Box
              sx={{
                p: { xs: 2.5, sm: 3.5, md: 4, lg: 4.5 },
                bgcolor: C.surface,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                animation: `${fadeIn} 0.4s ease both`,
              }}
            >
              <Box
                sx={{
                  maxWidth: { xs: "100%", sm: 400 },
                  mx: "auto",
                  width: "100%",
                }}
              >
                <Box
                  mb={{ xs: 3, sm: 3.5 }}
                  sx={{ animation: `${fadeUp} 0.45s ease both` }}
                >
                  {!isLgUp && (
                    <Box
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 2,
                        px: 1.25,
                        py: 0.6,
                        borderRadius: "7px",
                        bgcolor: C.brandPale,
                        border: `1px solid ${alpha(C.brand, 0.15)}`,
                      }}
                    >
                      <ShieldOutlined sx={{ fontSize: 14, color: C.brand }} />
                      <Typography
                        sx={{
                          fontSize: { xs: "0.6rem", sm: "0.65rem" },
                          fontWeight: 700,
                          letterSpacing: "0.09em",
                          textTransform: "uppercase",
                          color: C.brand,
                          fontFamily: C.font,
                        }}
                      >
                        AMS Blue Ledger
                      </Typography>
                    </Box>
                  )}
                  <Typography
                    sx={{
                      fontSize: { xs: "1.3rem", sm: "1.55rem", md: "1.65rem" },
                      fontWeight: 800,
                      color: C.ink,
                      fontFamily: C.font,
                      letterSpacing: "-0.025em",
                      lineHeight: 1.15,
                      mb: 0.75,
                    }}
                  >
                    Welcome back
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: { xs: "0.78rem", sm: "0.83rem" },
                      color: C.inkSec,
                      fontFamily: C.font,
                    }}
                  >
                    Sign in to access your dashboard
                  </Typography>
                </Box>

                <Box component="form" onSubmit={handleSubmit} noValidate>
                  <Stack spacing={2.5}>
                    <Box sx={{ animation: `${fadeUp} 0.45s 0.08s ease both` }}>
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
                        Email Address
                      </Typography>
                      <TextField
                        fullWidth
                        name="email"
                        type="email"
                        placeholder="you@company.com"
                        value={formData.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                        autoComplete="email"
                        error={!!(fieldTouched.email && fieldErrors.email)}
                        helperText={fieldTouched.email ? fieldErrors.email : ""}
                        disabled={isDisabled}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <MailOutline
                                sx={{
                                  fontSize: { xs: 16, sm: 17 },
                                  color:
                                    fieldErrors.email && fieldTouched.email
                                      ? C.red
                                      : C.inkMut,
                                }}
                              />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          ...inputSx(fieldTouched.email && !!fieldErrors.email),
                          ...getAnimationStyle("email"),
                        }}
                      />
                    </Box>

                    <Box sx={{ animation: `${fadeUp} 0.45s 0.13s ease both` }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 0.75,
                          flexWrap: "wrap",
                          gap: 0.5,
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: { xs: "0.65rem", sm: "0.67rem" },
                            fontWeight: 700,
                            letterSpacing: "0.08em",
                            color: C.inkSec,
                            textTransform: "uppercase",
                            fontFamily: C.font,
                          }}
                        >
                          Password
                        </Typography>
                        {/* <Link
                          component="button"
                          type="button"
                          onClick={() => setForgotModalOpen(true)}
                          underline="hover"
                          sx={{
                            fontSize: { xs: "0.7rem", sm: "0.75rem" },
                            color: C.brand,
                            fontWeight: 600,
                            fontFamily: C.font,
                            cursor: "pointer",
                            background: "none",
                            border: "none",
                            p: 0,
                            "&:hover": { color: C.brandDark },
                          }}
                        >
                          Forgot password?
                        </Link> */}
                      </Box>
                      <TextField
                        fullWidth
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                        autoComplete="current-password"
                        error={
                          !!(fieldTouched.password && fieldErrors.password)
                        }
                        helperText={
                          fieldTouched.password ? fieldErrors.password : ""
                        }
                        disabled={isDisabled}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Lock
                                sx={{
                                  fontSize: { xs: 15, sm: 16 },
                                  color:
                                    fieldErrors.password &&
                                    fieldTouched.password
                                      ? C.red
                                      : C.inkMut,
                                }}
                              />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowPassword((v) => !v)}
                                edge="end"
                                size="small"
                                tabIndex={-1}
                                disabled={isDisabled}
                                sx={{
                                  borderRadius: "6px",
                                  mr: -0.25,
                                  p: { xs: 0.75, sm: 0.5 },
                                }}
                              >
                                {showPassword ? (
                                  <VisibilityOff
                                    sx={{
                                      fontSize: { xs: 16, sm: 17 },
                                      color: C.inkMut,
                                    }}
                                  />
                                ) : (
                                  <Visibility
                                    sx={{
                                      fontSize: { xs: 16, sm: 17 },
                                      color: C.inkMut,
                                    }}
                                  />
                                )}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          ...inputSx(
                            fieldTouched.password && !!fieldErrors.password,
                          ),
                          ...getAnimationStyle("password"),
                        }}
                      />
                    </Box>

                    <Box
                      sx={{
                        animation: `${fadeUp} 0.45s 0.18s ease both`,
                      }}
                    >
                      <FormControlLabel
                        sx={{ ml: 0, alignItems: "center" }}
                        control={
                          <Checkbox
                            checked={formData.remember}
                            onChange={(e) => {
                              setFormData((p) => ({
                                ...p,
                                remember: e.target.checked,
                              }));
                            }}
                            disabled={isDisabled}
                            size="small"
                            sx={{
                              color: C.inkMut,
                              "&.Mui-checked": { color: C.brand },
                              "& .MuiSvgIcon-root": {
                                fontSize: { xs: 17, sm: 18 },
                              },
                            }}
                          />
                        }
                        label={
                          <Typography
                            sx={{
                              fontSize: { xs: "0.78rem", sm: "0.82rem" },
                              color: C.inkSec,
                              fontFamily: C.font,
                            }}
                          >
                            Remember me
                          </Typography>
                        }
                      />
                    </Box>

                    <Box sx={{ animation: `${fadeUp} 0.45s 0.23s ease both` }}>
                      <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        disabled={isDisabled}
                        endIcon={
                          !isDisabled && (
                            <ArrowForward
                              sx={{ fontSize: { xs: 15, sm: 16 } }}
                            />
                          )
                        }
                        sx={{
                          py: { xs: "10px", sm: "11px" },
                          bgcolor: C.brand,
                          borderRadius: "10px",
                          fontWeight: 700,
                          fontFamily: C.font,
                          fontSize: { xs: "0.85rem", sm: "0.9rem" },
                          textTransform: "none",
                          letterSpacing: "-0.01em",
                          boxShadow: `0 4px 14px ${alpha(C.brand, 0.25)}`,
                          "&:hover": {
                            bgcolor: C.brandMid,
                            boxShadow: `0 6px 18px ${alpha(C.brand, 0.3)}`,
                          },
                          "&:active": {
                            transform: "scale(0.98)",
                          },
                          "&.Mui-disabled": {
                            bgcolor: alpha(C.brand, 0.55),
                            color: "#fff",
                          },
                          transition: "all 0.22s ease",
                        }}
                      >
                        {isDisabled ? (
                          <CircularProgress
                            size={20}
                            thickness={2.5}
                            sx={{ color: "rgba(255,255,255,0.85)" }}
                          />
                        ) : (
                          "Sign In"
                        )}
                      </Button>
                    </Box>
                  </Stack>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>

      {/* Error Snackbar */}
      <Snackbar
        open={errOpen}
        autoHideDuration={5000}
        onClose={() => setErrOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        TransitionComponent={Slide}
      >
        <Alert
          severity="error"
          onClose={() => setErrOpen(false)}
          icon={<ErrorIcon />}
          elevation={6}
          sx={{
            width: "100%",
            maxWidth: { xs: "calc(100vw - 32px)", sm: 420 },
            borderRadius: "12px",
            fontFamily: C.font,
            fontSize: { xs: "0.78rem", sm: "0.82rem" },
            fontWeight: 500,
            boxShadow: "0 8px 24px rgba(0,0,0,0.14)",
          }}
        >
          {errorMsg}
        </Alert>
      </Snackbar>

      {/* Success Snackbar */}
      <Snackbar
        open={okOpen}
        autoHideDuration={3000}
        onClose={() => setOkOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        TransitionComponent={Slide}
      >
        <Alert
          severity="success"
          onClose={() => setOkOpen(false)}
          icon={<CheckCircle fontSize="inherit" />}
          elevation={6}
          sx={{
            width: "100%",
            maxWidth: { xs: "calc(100vw - 32px)", sm: 380 },
            bgcolor: "#10B981",
            color: "#fff",
            fontWeight: 600,
            fontFamily: C.font,
            fontSize: { xs: "0.78rem", sm: "0.82rem" },
            borderRadius: "12px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.14)",
            "& .MuiAlert-icon": { color: "#fff" },
            "& .MuiAlert-action": { color: "#fff" },
          }}
        >
          {successMsg}
        </Alert>
      </Snackbar>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        open={forgotModalOpen}
        onClose={() => setForgotModalOpen(false)}
        onForgotPassword={handleForgotPassword}
        loading={forgotLoading}
      />
    </Box>
  );
}
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

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "https://backend.assetmach.com/api/v1";

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

/* ─── Dark theme tokens — matches the AuditLogs palette ─── */
const DARK_LOGIN_TOKENS = {
  brand: "#1fb6cf",
  brandDark: "#0d8ba1",
  brandMid: "#17a0b8",
  brandLight: alpha("#1fb6cf", 0.14),
  brandPale: alpha("#1fb6cf", 0.08),
  accent: "#1fb6cf",
  accentPale: alpha("#1fb6cf", 0.14),
  accentContrast: "#04141a",
  panelFrom: "#0f2530",
  panelTo: "#050d12",
  panelInk: "#e7eef2",
  panelOrb: alpha("#1fb6cf", 0.06),
  ink: "#e7eef2",
  inkSec: "#8ca0ac",
  inkMut: "#5c7280",
  border: "#1c2e3a",
  borderFoc: "#1fb6cf",
  surface: "#0f1e29",
  bg: "#0a1620",
  green: "#4ade80",
  greenBg: alpha("#4ade80", 0.14),
  red: "#f87171",
  redBg: alpha("#f87171", 0.14),
  orange: "#fb923c",
  orangeBg: alpha("#fb923c", 0.14),
  shadow: "0 1px 3px rgba(0,0,0,0.45), 0 1px 2px rgba(0,0,0,0.3)",
  shadowMd: "0 8px 24px rgba(0,0,0,0.5), 0 3px 8px rgba(0,0,0,0.35)",
  shadowLg: "0 20px 48px rgba(0,0,0,0.6), 0 6px 16px rgba(0,0,0,0.4)",
  font: "'Sora', 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
};

const LIGHT_LOGIN_TOKENS = {
  brand: "#214b6b",
  brandDark: "#163a55",
  brandMid: "#1a405e",
  brandLight: alpha("#214b6b", 0.12),
  brandPale: alpha("#214b6b", 0.08),
  accent: "#1fb6cf",
  accentPale: alpha("#1fb6cf", 0.12),
  accentContrast: "#ffffff",
  panelFrom: "#16354F",
  panelTo: "#16354F",
  panelInk: "#ffffff",
  panelOrb: alpha("#ffffff", 0.08),
  ink: "#102a36",
  inkSec: "#526575",
  inkMut: "#8ca0b3",
  border: "#d8e2e8",
  borderFoc: "#214b6b",
  surface: "#ffffff",
  bg: "#f4f7fb",
  green: "#0f766e",
  greenBg: alpha("#0f766e", 0.12),
  red: "#dc2626",
  redBg: alpha("#dc2626", 0.1),
  orange: "#d97706",
  orangeBg: alpha("#d97706", 0.12),
  shadow: "0 1px 3px rgba(15,23,42,0.08), 0 1px 2px rgba(15,23,42,0.06)",
  shadowMd: "0 16px 40px rgba(15,23,42,0.10), 0 6px 16px rgba(15,23,42,0.08)",
  shadowLg: "0 24px 56px rgba(15,23,42,0.14), 0 8px 20px rgba(15,23,42,0.08)",
  font: "'Sora', 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
};

const C = DARK_LOGIN_TOKENS;

const getLoginTokens = (mode) =>
  mode === "light" ? LIGHT_LOGIN_TOKENS : DARK_LOGIN_TOKENS;

const authToastSx = (colors, severity = "success") => {
  const isDark = colors === DARK_LOGIN_TOKENS;
  const isSuccess = severity === "success";
  const tone = isSuccess ? colors.green : colors.red;

  return {
    width: "100%",
    minWidth: { xs: "auto", sm: 320 },
    maxWidth: { xs: "calc(100vw - 32px)", sm: 420 },
    borderRadius: "10px",
    fontFamily: colors.font,
    fontSize: { xs: "0.8rem", sm: "0.84rem" },
    fontWeight: 700,
    letterSpacing: 0,
    alignItems: "center",
    color: isDark ? (isSuccess ? "#bbf7d0" : "#fecaca") : isSuccess ? "#14532d" : "#7f1d1d",
    bgcolor: isDark ? (isSuccess ? "#10281f" : "#351616") : isSuccess ? "#ecfdf5" : "#fef2f2",
    border: `1px solid ${alpha(tone, isDark ? 0.42 : 0.28)}`,
    boxShadow: isDark
      ? "0 18px 40px rgba(0,0,0,0.45)"
      : "0 18px 40px rgba(15,23,42,0.14)",
    "& .MuiAlert-icon": {
      color: tone,
      opacity: 1,
      mr: 1.25,
    },
    "& .MuiAlert-message": {
      py: 0.2,
    },
    "& .MuiAlert-action": {
      color: isDark ? (isSuccess ? "#bbf7d0" : "#fecaca") : isSuccess ? "#14532d" : "#7f1d1d",
      pl: 1,
      mr: -0.75,
    },
    "& .MuiAlert-action .MuiIconButton-root": {
      color: isDark ? (isSuccess ? "#bbf7d0" : "#fecaca") : isSuccess ? "#14532d" : "#7f1d1d",
    },
  };
};

const inputSx = (hasError, colors = C) => ({
  "& .MuiOutlinedInput-root": {
    bgcolor: colors.bg,
    borderRadius: "10px",
    fontFamily: colors.font,
    fontSize: "0.875rem",
    color: colors.ink,
    transition: "box-shadow 0.2s, border-color 0.2s",
    "& fieldset": {
      borderColor: hasError ? colors.red : colors.border,
      transition: "border-color 0.2s",
    },
    "&:hover fieldset": {
      borderColor: hasError ? colors.red : alpha(colors.brand, 0.55),
    },
    "&.Mui-focused fieldset": {
      borderColor: hasError ? colors.red : colors.brand,
      borderWidth: "1.5px",
    },
    "&.Mui-focused": {
      boxShadow: `0 0 0 3px ${hasError ? alpha(colors.red, 0.15) : alpha(colors.brand, 0.15)}`,
    },
    "&.Mui-disabled": {
      "-webkit-text-fill-color": colors.inkMut,
    },
  },
  "& .MuiInputBase-input": {
    py: 1.35,
    fontFamily: colors.font,
    fontSize: { xs: "0.8rem", sm: "0.875rem" },
    color: colors.ink,
    "&::placeholder": {
      color: colors.inkMut,
      opacity: 1,
      fontSize: { xs: "0.75rem", sm: "0.8rem" },
    },
  },
  "& .MuiFormHelperText-root": {
    fontSize: { xs: "0.68rem", sm: "0.72rem" },
    marginLeft: 0,
    mt: 0.6,
    fontFamily: colors.font,
    color: colors.red,
  },
});

const FEATURES = [
  "Real-time asset tracking across all locations",
  "Role-based access for teams of any size",
  "Audit-ready reports with one click",
];

const RESEND_COOLDOWN_SECONDS = 30;

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
  const theme = useTheme();
  const C = React.useMemo(() => getLoginTokens(theme.palette.mode), [theme.palette.mode]);
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
          borderRadius: { xs: 0, sm: "16px" },
          boxShadow: C.shadowLg,
          overflow: "hidden",
          m: { xs: 0, sm: 2 },
          width: { xs: "100%", sm: "calc(100% - 32px)" },
          maxWidth: { xs: "none", sm: 600 },
          height: { xs: "100dvh", sm: "auto" },
          maxHeight: { xs: "100dvh", sm: "calc(100% - 64px)" },
          display: "flex",
          flexDirection: "column",
          bgcolor: C.surface,
          border: `1px solid ${C.border}`,
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

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minHeight: 0,
        }}
      >
        <DialogContent
          sx={{
            p: { xs: 2.5, sm: 3 },
            flex: 1,
            overflowY: "auto",
          }}
        >
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
                sx={inputSx(hasError, C)}
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
              borderTop: { xs: `1px solid ${C.border}`, sm: "none" },
              pb: { xs: "calc(20px + env(safe-area-inset-bottom))", sm: 3 },
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
                "&:hover": { bgcolor: alpha(C.inkSec, 0.08) },
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
                color: C.accentContrast,
                borderRadius: "8px",
                px: 3,
                py: 1,
                boxShadow: `0 4px 14px ${alpha(C.brand, 0.3)}`,
                "&:hover": {
                  bgcolor: C.brandDark,
                  boxShadow: `0 6px 18px ${alpha(C.brand, 0.35)}`,
                },
                "&.Mui-disabled": {
                  bgcolor: alpha(C.brand, 0.35),
                  color: alpha(C.accentContrast, 0.6),
                },
              }}
            >
              {loading ? (
                <CircularProgress size={18} thickness={3} sx={{ color: C.accentContrast }} />
              ) : (
                "Send reset link"
              )}
            </Button>
          </DialogActions>
        )}
      </Box>
    </Dialog>
  );
}

export default function LoginPage() {
  const theme = useTheme();
  const C = React.useMemo(() => getLoginTokens(theme.palette.mode), [theme.palette.mode]);
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isLgUp = useMediaQuery(theme.breakpoints.up("lg"));

  const isMounted = useRef(true);
  const redirectInProgress = useRef(false);
  const redirectTimerRef = useRef(null);
  const resendIntervalRef = useRef(null);

  const {
    login,
    verifyLoginOtp,
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
  const [otpStep, setOtpStep] = useState(false);
  const [otpEmail, setOtpEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
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

  // Start (or restart) the resend-code cooldown timer
  const startResendCooldown = useCallback((seconds = RESEND_COOLDOWN_SECONDS) => {
    setResendCooldown(seconds);
    if (resendIntervalRef.current) clearInterval(resendIntervalRef.current);
    resendIntervalRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(resendIntervalRef.current);
          resendIntervalRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const clearResendCooldown = useCallback(() => {
    if (resendIntervalRef.current) {
      clearInterval(resendIntervalRef.current);
      resendIntervalRef.current = null;
    }
    setResendCooldown(0);
  }, []);

  // Load remembered email
  useEffect(() => {
    const rem = localStorage.getItem("rememberMe");
    const email = localStorage.getItem("rememberedEmail");
    if (rem === "true" && email) {
      setFormData((p) => ({ ...p, email, remember: true }));
    }
  }, []);

  useEffect(() => {
    const expiredMessage = sessionStorage.getItem("authExpiredMessage");
    if (expiredMessage) {
      sessionStorage.removeItem("authExpiredMessage");
      setErrorMsg(expiredMessage);
      setErrOpen(true);
    }

    const logoutMessage = sessionStorage.getItem("logoutToastMessage");
    if (logoutMessage) {
      sessionStorage.removeItem("logoutToastMessage");
      setSuccessMsg(logoutMessage);
      setOkOpen(true);
    }
  }, []);

  // Check backend status on mount
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/auth/health`,
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
      if (resendIntervalRef.current) {
        clearInterval(resendIntervalRef.current);
      }
    };
  }, []);

  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setFormData((p) => ({ ...p, [name]: value }));
      if (otpStep) {
        setOtpStep(false);
        setOtp("");
        setOtpError("");
        setOtpEmail("");
        clearResendCooldown();
      }
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
    [fieldTouched, errorMsg, shakeField, otpStep, clearResendCooldown],
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
      const result = await login(
        formData.email,
        formData.password,
        formData.remember,
      );

      if (result.success) {
        if (result.otpRequired) {
          if (formData.remember) {
            localStorage.setItem("rememberMe", "true");
            localStorage.setItem("rememberedEmail", formData.email);
          } else {
            localStorage.removeItem("rememberMe");
            localStorage.removeItem("rememberedEmail");
          }

          setOtpStep(true);
          setOtpEmail(result.email || formData.email);
          setOtp("");
          setOtpError("");
          setSuccessMsg(result.message || "Verification code sent to your email.");
          setOkOpen(true);
          setSubmitting(false);
          startResendCooldown();
          return;
        }

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

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const cleanOtp = otp.trim();

    if (!/^\d{6}$/.test(cleanOtp)) {
      setOtpError("Enter the 6 digit code from your email");
      setShakeField("otp");
      setTimeout(() => setShakeField(null), 500);
      return;
    }

    setSubmitting(true);
    setOtpError("");
    setErrorMsg("");

    try {
      const result = await verifyLoginOtp(
        otpEmail || formData.email,
        cleanOtp,
        formData.remember,
      );

      if (result.success) {
        const role = result.role || result.user?.role || result.userType;
        const path = getRedirectPath(role);

        setSuccessMsg(result.message || "Login verified! Redirecting...");
        setOkOpen(true);
        redirectInProgress.current = true;
        clearResendCooldown();

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
      } else if (isMounted.current) {
        setOtpError(result.error || "Invalid or expired verification code");
        setErrOpen(true);
        setErrorMsg(result.error || "Invalid or expired verification code");
        setSubmitting(false);
        setShakeField("otp");
        setTimeout(() => setShakeField(null), 500);
      }
    } catch (err) {
      if (isMounted.current) {
        console.error("[Login] OTP verification error:", err);
        setErrorMsg("Unable to verify code. Please try again.");
        setErrOpen(true);
        setSubmitting(false);
      }
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return; // guard against spamming while disabled

    setSubmitting(true);
    setOtpError("");
    setErrorMsg("");

    const result = await login(
      formData.email,
      formData.password,
      formData.remember,
    );
    if (result.success && result.otpRequired) {
      setOtpEmail(result.email || formData.email);
      setOtp("");
      setSuccessMsg(result.message || "New verification code sent.");
      setOkOpen(true);
      startResendCooldown();
    } else {
      setErrorMsg(result.error || "Unable to resend code. Please try again.");
      setErrOpen(true);
    }
    setSubmitting(false);
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
            maxWidth: { xs: "100%", sm: 500, md: 760, lg: 1100 },
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
              bgcolor: C.surface,
            }}
          >
            {/* Left panel */}
            <Box
              sx={{
                display: { xs: "none", lg: "flex" },
                flexDirection: "column",
                justifyContent: "space-between",
                p: { lg: 4, xl: 4 },
                background: `linear-gradient(150deg, ${C.panelFrom} 0%, ${C.panelTo} 100%)`,
                color: C.panelInk,
                position: "relative",
                overflow: "hidden",
                minHeight: 500,
                borderRight: `1px solid ${C.border}`,
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  top: -62,
                  right: -48,
                  width: 250,
                  height: 250,
                  borderRadius: "50%",
                  bgcolor: C.panelOrb,
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
                  bgcolor: alpha(C.accent, 0.1),
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
                  bgcolor: alpha(C.accent, 0.12),
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
                    bgcolor: alpha(C.panelInk, 0.08),
                    border: `1px solid ${alpha(C.panelInk, 0.14)}`,
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
                      color: alpha(C.panelInk, 0.92),
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
                    color: C.panelInk,
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
                    color: alpha(C.panelInk, 0.74),
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
                          color: alpha(C.panelInk, 0.82),
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
                  bgcolor: alpha(C.panelInk, 0.08),
                  backdropFilter: "blur(12px)",
                  borderRadius: "14px",
                  p: 2.5,
                  border: `1px solid ${alpha(C.panelInk, 0.14)}`,
                  animation: `${fadeUp} 0.6s 0.3s ease both`,
                }}
              >
                <Typography
                  sx={{
                    fontSize: "0.75rem",
                    fontStyle: "italic",
                    color: alpha(C.panelInk, 0.9),
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
                      border: `1.5px solid ${alpha(C.panelInk, 0.18)}`,
                    }}
                  />
                  <Box>
                    <Typography
                      sx={{
                        fontSize: "0.68rem",
                        fontWeight: 700,
                        letterSpacing: "0.04em",
                        color: C.panelInk,
                        fontFamily: C.font,
                      }}
                    >
                      Marcus Thorne
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "0.62rem",
                        color: alpha(C.panelInk, 0.66),
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
                p: { xs: 2.5, sm: 3.5, md: 4, lg: 4, xl: 4 },
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
                        border: `1px solid ${alpha(C.brand, 0.25)}`,
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
                    {otpStep ? "Verify your email" : "Welcome back"}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: { xs: "0.78rem", sm: "0.83rem" },
                      color: C.inkSec,
                      fontFamily: C.font,
                    }}
                  >
                    {otpStep
                      ? `Enter the 6 digit code sent to ${otpEmail || formData.email}`
                      : "Sign in to access your dashboard"}
                  </Typography>
                </Box>

                <Box component="form" onSubmit={otpStep ? handleVerifyOtp : handleSubmit} noValidate>
                  <Stack spacing={2.5}>
                    {!otpStep ? (
                      <>
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
                            autoComplete={formData.remember ? "email" : "off"}
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
                              ...inputSx(fieldTouched.email && !!fieldErrors.email, C),
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
                            <Link
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
                                "&:hover": { color: C.brandMid },
                              }}
                            >
                              Forgot password
                            </Link>
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
                            autoComplete={
                              formData.remember ? "current-password" : "new-password"
                            }
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
                                C,
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
                              color: C.accentContrast,
                              borderRadius: "10px",
                              fontWeight: 700,
                              fontFamily: C.font,
                              fontSize: { xs: "0.85rem", sm: "0.9rem" },
                              textTransform: "none",
                              letterSpacing: "-0.01em",
                              boxShadow: `0 4px 14px ${alpha(C.brand, 0.3)}`,
                              "&:hover": {
                                bgcolor: C.brandMid,
                                boxShadow: `0 6px 18px ${alpha(C.brand, 0.35)}`,
                              },
                              "&:active": {
                                transform: "scale(0.98)",
                              },
                              "&.Mui-disabled": {
                                bgcolor: alpha(C.brand, 0.35),
                                color: alpha(C.accentContrast, 0.6),
                              },
                              transition: "all 0.22s ease",
                            }}
                          >
                            {isDisabled ? (
                              <CircularProgress
                                size={20}
                                thickness={2.5}
                                sx={{ color: C.accentContrast }}
                              />
                            ) : (
                              "Sign In"
                            )}
                          </Button>
                        </Box>
                      </>
                    ) : (
                      <>
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
                            Verification Code
                          </Typography>
                          <TextField
                            fullWidth
                            name="otp"
                            type="text"
                            placeholder="Enter 6 digit code"
                            value={otp}
                            onChange={(e) => {
                              const nextOtp = e.target.value.replace(/\D/g, "").slice(0, 6);
                              setOtp(nextOtp);
                              if (otpError) setOtpError("");
                            }}
                            required
                            autoComplete="one-time-code"
                            error={!!otpError}
                            helperText={otpError}
                            disabled={isDisabled}
                            inputProps={{
                              inputMode: "numeric",
                              maxLength: 6,
                              pattern: "\\d{6}",
                            }}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <ShieldOutlined
                                    sx={{
                                      fontSize: { xs: 16, sm: 17 },
                                      color: otpError ? C.red : C.inkMut,
                                    }}
                                  />
                                </InputAdornment>
                              ),
                            }}
                            sx={{
                              ...inputSx(!!otpError, C),
                              ...getAnimationStyle("otp"),
                              "& .MuiInputBase-input": {
                                letterSpacing: "0.28em",
                                fontWeight: 800,
                              },
                            }}
                          />
                        </Box>

                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          justifyContent="space-between"
                          sx={{ animation: `${fadeUp} 0.45s 0.13s ease both` }}
                        >
                          <Link
                            component="button"
                            type="button"
                            onClick={() => {
                              setOtpStep(false);
                              setOtp("");
                              setOtpError("");
                              clearResendCooldown();
                            }}
                            underline="hover"
                            disabled={isDisabled}
                            sx={{
                              fontSize: { xs: "0.72rem", sm: "0.78rem" },
                              color: C.inkSec,
                              fontWeight: 600,
                              fontFamily: C.font,
                              cursor: isDisabled ? "default" : "pointer",
                              background: "none",
                              border: "none",
                              p: 0,
                            }}
                          >
                            Change email
                          </Link>
                          <Link
                            component="button"
                            type="button"
                            onClick={handleResendOtp}
                            underline="hover"
                            disabled={isDisabled || resendCooldown > 0}
                            sx={{
                              fontSize: { xs: "0.72rem", sm: "0.78rem" },
                              color: resendCooldown > 0 ? C.inkMut : C.brand,
                              fontWeight: 700,
                              fontFamily: C.font,
                              fontVariantNumeric: "tabular-nums",
                              cursor:
                                isDisabled || resendCooldown > 0
                                  ? "default"
                                  : "pointer",
                              background: "none",
                              border: "none",
                              p: 0,
                              transition: "color 0.2s ease",
                            }}
                          >
                            {resendCooldown > 0
                              ? `Resend in ${resendCooldown}s`
                              : "Resend code"}
                          </Link>
                        </Stack>

                        <Box sx={{ animation: `${fadeUp} 0.45s 0.18s ease both` }}>
                          <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={isDisabled || otp.length !== 6}
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
                              color: C.accentContrast,
                              borderRadius: "10px",
                              fontWeight: 700,
                              fontFamily: C.font,
                              fontSize: { xs: "0.85rem", sm: "0.9rem" },
                              textTransform: "none",
                              letterSpacing: "-0.01em",
                              boxShadow: `0 4px 14px ${alpha(C.brand, 0.3)}`,
                              "&:hover": {
                                bgcolor: C.brandMid,
                                boxShadow: `0 6px 18px ${alpha(C.brand, 0.35)}`,
                              },
                              "&:active": {
                                transform: "scale(0.98)",
                              },
                              "&.Mui-disabled": {
                                bgcolor: alpha(C.brand, 0.35),
                                color: alpha(C.accentContrast, 0.6),
                              },
                              transition: "all 0.22s ease",
                            }}
                          >
                            {isDisabled ? (
                              <CircularProgress
                                size={20}
                                thickness={2.5}
                                sx={{ color: C.accentContrast }}
                              />
                            ) : (
                              "Verify & Continue"
                            )}
                          </Button>
                        </Box>
                      </>
                    )}
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

        TransitionComponent={Slide}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}>
        <Alert
          severity="error"
          onClose={() => setErrOpen(false)}
          icon={<ErrorIcon />}
          elevation={6}
          sx={{
            ...authToastSx(C, "error"),
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
        TransitionComponent={Slide}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}>
        <Alert
          severity="success"
          onClose={() => setOkOpen(false)}
          icon={<CheckCircle fontSize="inherit" />}
          elevation={6}
          sx={{
            ...authToastSx(C, "success"),
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
import React, { useCallback, useEffect, useRef, useState } from "react";
import { alpha, Box, Button, LinearProgress, Typography, useTheme } from "@mui/material";
import { GppGoodOutlined, WarningAmberOutlined } from "@mui/icons-material";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContexts";

const WARNING_AFTER_MS = 4 * 60 * 1000;
const COUNTDOWN_SECONDS = 60;
const ACTIVITY_EVENTS = [
  "mousemove",
  "mousedown",
  "keydown",
  "scroll",
  "touchstart",
  "pointerdown",
];

const publicPaths = ["/", "/login", "/forgot-password", "/reset-password"];

const isPublicPath = (pathname) =>
  publicPaths.some((path) =>
    path === "/reset-password" ? pathname.startsWith(path) : pathname === path,
  );

const formatCountdown = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
};

export default function InactivityTimeout() {
  const { isAuthenticated, expireSessionDueToInactivity } = useAuth();
  const location = useLocation();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [showWarning, setShowWarning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);
  const warningTimerRef = useRef(null);
  const countdownIntervalRef = useRef(null);
  const isWarningActiveRef = useRef(false);

  const clearTimers = useCallback(() => {
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  }, []);

  const beginCountdown = useCallback(() => {
    isWarningActiveRef.current = true;
    setShowWarning(true);
    setSecondsLeft(COUNTDOWN_SECONDS);

    countdownIntervalRef.current = setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          clearTimers();
          expireSessionDueToInactivity();
          return 0;
        }
        return current - 1;
      });
    }, 1000);
  }, [clearTimers, expireSessionDueToInactivity]);

  const restartInactivityTimer = useCallback(() => {
    clearTimers();
    isWarningActiveRef.current = false;
    setShowWarning(false);
    setSecondsLeft(COUNTDOWN_SECONDS);
    warningTimerRef.current = setTimeout(beginCountdown, WARNING_AFTER_MS);
  }, [beginCountdown, clearTimers]);

  const handleActivity = useCallback(() => {
    if (!isAuthenticated || isPublicPath(location.pathname)) return;
    restartInactivityTimer();
  }, [isAuthenticated, location.pathname, restartInactivityTimer]);

  useEffect(() => {
    if (!isAuthenticated || isPublicPath(location.pathname)) {
      clearTimers();
      isWarningActiveRef.current = false;
      setShowWarning(false);
      return undefined;
    }

    restartInactivityTimer();
    ACTIVITY_EVENTS.forEach((eventName) => {
      window.addEventListener(eventName, handleActivity, {
        passive: true,
        capture: true,
      });
    });

    return () => {
      ACTIVITY_EVENTS.forEach((eventName) => {
        window.removeEventListener(eventName, handleActivity, {
          capture: true,
        });
      });
      clearTimers();
    };
  }, [
    clearTimers,
    handleActivity,
    isAuthenticated,
    location.pathname,
    restartInactivityTimer,
  ]);

  if (!showWarning) return null;

  const progress = (secondsLeft / COUNTDOWN_SECONDS) * 100;

  return (
    <Box
      sx={{
        position: "fixed",
        top: { xs: 56, sm: 60, md: 64, lg:10 },
        left: { xs: 0, md: 240, lg: 260, xl: 180 },
        right: 0,
        zIndex: (theme) => theme.zIndex.appBar + 1,
        px: { xs: 1.5, sm: 2, lg: 3 },
        pt: { xs: 1, md: 1.25 },
        pointerEvents: "none",
      }}
    >
      <Box
        sx={{
          mx: "auto",
          maxWidth: 760,
          minHeight: { xs: "auto", md: 86 },
          display: "grid",
          gridTemplateColumns: {
            xs: "auto 1fr",
            md: "54px minmax(0, 1fr) auto",
          },
          alignItems: "center",
          gap: { xs: 1.25, sm: 1.5, md: 2 },
          px: { xs: 1.5, sm: 2, md: 2.25 },
          py: { xs: 1.25, sm: 1.5, md: 1.35 },
          borderRadius: { xs: "14px", md: "16px" },
          border: isDark
            ? "2px solid rgba(71, 85, 105, 0.44)"
            : "1px solid rgba(245, 158, 11, 0.36)",
          bgcolor: isDark
            ? "rgba(9, 17, 29, 0.94)"
            : "rgba(255, 251, 235, 0.96)",
          backgroundImage: isDark
            ? "linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(6, 13, 24, 0.98))"
            : "linear-gradient(135deg, rgba(255, 251, 235, 0.98), rgba(255, 255, 255, 0.98))",
          boxShadow: isDark
            ? "0 18px 44px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.04)"
            : "0 12px 28px rgba(120, 53, 15, 0.14)",
          pointerEvents: "auto",
        }}
      >
        <Box
          sx={{
            width: { xs: 42, sm: 46, md: 48 },
            height: { xs: 42, sm: 46, md: 48 },
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            justifySelf: { xs: "start", md: "center" },
            color: "#f59e0b",
            border: `2px solid ${alpha("#f59e0b", isDark ? 0.26 : 0.34)}`,
            bgcolor: alpha("#f59e0b", isDark ? 0.07 : 0.1),
            boxShadow: `0 0 34px ${alpha("#f59e0b", isDark ? 0.2 : 0.14)}`,
          }}
        >
          <WarningAmberOutlined sx={{ fontSize: { xs: 26, sm: 29, md: 30 } }} />
        </Box>

        <Box sx={{ minWidth: 0, gridColumn: { xs: "2 / 3", md: "auto" } }}>
          <Typography
            sx={{
              fontWeight: 800,
              color: isDark ? "#f8fafc" : "#78350f",
              fontSize: { xs: "0.85rem", sm: "0.95rem", md: "1.05rem" },
              lineHeight: 1.15,
              mb: { xs: 0.35, md: 0.4 },
            }}
          >
            You have been inactive for 4 minutes.
          </Typography>
          <Typography
            sx={{
              fontSize: { xs: "0.72rem", sm: "0.8rem", md: "0.84rem" },
              color: isDark ? "#94a3b8" : "#92400e",
              fontWeight: 600,
              mb: { xs: 0.8, md: 0.85 },
            }}
          >
            Your session will expire in{" "}
            <Box component="span" sx={{ color: "#f59e0b", fontWeight: 900 }}>
              {formatCountdown(secondsLeft)}
            </Box>
            .
          </Typography>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: { xs: 5, md: 5 },
              borderRadius: 999,
              bgcolor: isDark ? "rgba(51, 65, 85, 0.62)" : "#fde68a",
              boxShadow: isDark
                ? "inset 0 1px 2px rgba(0,0,0,0.35)"
                : "none",
              "& .MuiLinearProgress-bar": {
                bgcolor: "#f59e0b",
                borderRadius: 999,
                boxShadow: `0 0 18px ${alpha("#f59e0b", 0.58)}`,
              },
            }}
          />
        </Box>

        <Box
          sx={{
            display: "none",
            width: 1,
            height: 96,
            bgcolor: isDark ? "rgba(51, 65, 85, 0.45)" : "rgba(245, 158, 11, 0.22)",
          }}
        />

        <Box
          sx={{
            gridColumn: { xs: "1 / -1", md: "auto" },
            justifySelf: { xs: "stretch", md: "end" },
          }}
        >
          <Button
            color="warning"
            variant="contained"
            onClick={restartInactivityTimer}
            startIcon={<GppGoodOutlined />}
            sx={{
              textTransform: "none",
              fontWeight: 900,
              whiteSpace: "nowrap",
              width: { xs: "100%", md: 172 },
              minHeight: { xs: 40, md: 42 },
              borderRadius: { xs: "10px", md: "11px" },
              fontSize: { xs: "0.8rem", md: "0.86rem" },
              color: "#fff",
              bgcolor: "#d95f00",
              backgroundImage:
                "linear-gradient(180deg, #f59e0b 0%, #d95f00 100%)",
              boxShadow: `0 12px 28px ${alpha("#d95f00", 0.38)}, inset 0 1px 0 ${alpha("#fff", 0.22)}`,
              "& .MuiButton-startIcon svg": {
                fontSize: { xs: 18, md: 19 },
              },
              "&:hover": {
                bgcolor: "#b94e00",
                backgroundImage:
                  "linear-gradient(180deg, #f59e0b 0%, #b94e00 100%)",
                boxShadow: `0 15px 34px ${alpha("#d95f00", 0.46)}, inset 0 1px 0 ${alpha("#fff", 0.22)}`,
              },
            }}
          >
            Stay Logged In
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

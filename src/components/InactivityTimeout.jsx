import React, { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Box, Button, LinearProgress, Typography } from "@mui/material";
import { WarningAmberOutlined } from "@mui/icons-material";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContexts";

const WARNING_AFTER_MS = 4   * 60 * 1000;
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

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: (theme) => theme.zIndex.modal + 1,
        px: { xs: 1.5, sm: 3 },
        pt: 1.5,
        pointerEvents: "none",
      }}
    >
      <Alert
        severity="warning"
        icon={<WarningAmberOutlined />}
        sx={{
          mx: "auto",
          maxWidth: 760,
          alignItems: "center",
          borderRadius: "10px",
          border: "1px solid #F59E0B",
          boxShadow: "0 12px 30px rgba(15, 23, 42, 0.16)",
          pointerEvents: "auto",
          "& .MuiAlert-message": { width: "100%" },
        }}
        action={
          <Button
            color="warning"
            variant="contained"
            size="small"
            onClick={restartInactivityTimer}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              whiteSpace: "nowrap",
              borderRadius: "8px",
            }}
          >
            Stay Logged In
          </Button>
        }
      >
        <Box sx={{ pr: { xs: 0, sm: 2 } }}>
          <Typography sx={{ fontWeight: 700, color: "#78350F" }}>
            You have been inactive for 4 minutes.
          </Typography>
          <Typography sx={{ fontSize: "0.86rem", color: "#92400E" }}>
            Your session will expire in {formatCountdown(secondsLeft)}.
          </Typography>
          <LinearProgress
            variant="determinate"
            value={(secondsLeft / COUNTDOWN_SECONDS) * 100}
            sx={{
              mt: 1,
              height: 5,
              borderRadius: 999,
              bgcolor: "#FEF3C7",
              "& .MuiLinearProgress-bar": { bgcolor: "#F59E0B" },
            }}
          />
        </Box>
      </Alert>
    </Box>
  );
}

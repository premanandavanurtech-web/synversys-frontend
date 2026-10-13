// components/TopHeader.jsx - Premium Redesign (Fully Responsive Mobile)

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  Avatar,
  Typography,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Divider,
  useMediaQuery,
  useTheme,
  Fade,
  alpha,
  Tooltip,
  SwipeableDrawer,
  ListItemIcon,
  ListItemText,
  Chip,
  CircularProgress,
  Button,
  Stack,
  Slide,
  Paper,
  ClickAwayListener,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Snackbar,
  Alert,
} from "@mui/material";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import MenuIcon from "@mui/icons-material/Menu";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import CloseIcon from "@mui/icons-material/Close";
import LogoutIcon from "@mui/icons-material/Logout";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import RefreshIcon from "@mui/icons-material/Refresh";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SettingsIcon from "@mui/icons-material/Settings";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
// ─── Notification type icons (MUI icon set) ───
import ApartmentIcon from "@mui/icons-material/Apartment";
import LockIcon from "@mui/icons-material/Lock";
import GroupsIcon from "@mui/icons-material/Groups";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import EmailIcon from "@mui/icons-material/Email";
import ArrowCircleUpIcon from "@mui/icons-material/ArrowCircleUp";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AssignmentIcon from "@mui/icons-material/Assignment";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContexts";
import { useTeam } from "../context/TeamContext";
import { useNotifications } from "../context/NotificationContext";
import { formatDistanceToNow } from "date-fns";

const THEME_STORAGE_KEY = "assetmach-theme-mode";
const THEME_EXPLICIT_STORAGE_KEY = "assetmach-theme-mode-explicit";

/* ─── Animated badge with pulse ring (mobile optimized) ─── */
function PulsingBadge({ count, children, isDarkMode }) {
  const hasNew = count > 0;
  const label = count > 99 ? "99+" : String(count);
  const badgeMinW = count > 99 ? 26 : count >= 10 ? 22 : 18;

  return (
    <Box sx={{ position: "relative", display: "inline-flex" }}>
      {children}
      {hasNew && (
        <>
          <Box
            sx={{
              position: "absolute",
              top: -4,
              right: -5,
              width: badgeMinW,
              height: 18,
              borderRadius: 99,
              bgcolor: "transparent",
              border: "2px solid #ef4444",
              animation: "pulseRing 1.6s ease-out infinite",
              pointerEvents: "none",
              "@keyframes pulseRing": {
                "0%": { transform: "scale(1)", opacity: 0.8 },
                "100%": { transform: "scale(2.2)", opacity: 0 },
              },
            }}
          />
          <Box
            sx={{
              position: "absolute",
              top: -4,
              right: -5,
              minWidth: badgeMinW,
              height: 18,
              borderRadius: 99,
              bgcolor: "#ef4444",
              color: "#fff",
              fontSize: count >= 10 ? 9 : 10,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              px: "3px",
              lineHeight: 1,
              boxShadow: isDarkMode ? "0 0 0 2px #07111f" : "0 0 0 2px #ffffff",
              fontFamily: "'DM Sans', sans-serif",
              letterSpacing: 0,
              transition: "min-width 0.15s ease",
            }}
          >
            {label}
          </Box>
        </>
      )}
    </Box>
  );
}

/* ─── Theme Toggle Button (Light / Dark Mode) ─── */
function ThemeToggle({ isDarkMode, onToggle }) {
  return (
    <Tooltip
      title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
      arrow
      enterDelay={200}
    >
      <Box
        onClick={onToggle}
        role="button"
        aria-label={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle();
          }
        }}
        sx={{
          width: { xs: 36, sm: 40, md: 40 },
          height: { xs: 36, sm: 40, md: 40 },
          borderRadius: { xs: "12px", sm: "14px" },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: isDarkMode
            ? "rgba(255, 255, 255, 0.05)"
            : "transparent",
          border: isDarkMode
            ? "1.5px solid rgba(148, 163, 184, 0.18)"
            : "1.5px solid transparent",
          transition: "all 0.22s cubic-bezier(0.2, 0.9, 0.4, 1.1)",
          cursor: "pointer",
          userSelect: "none",
          WebkitTapHighlightColor: "transparent",
          outline: "none",
          "&:focus-visible": {
            boxShadow: `0 0 0 2px ${isDarkMode ? "#61d7ed" : "#1a5c6b"}`,
          },
          "&:active": {
            transform: "scale(0.92)",
          },
          "&:hover": {
            bgcolor: isDarkMode
              ? "rgba(255, 255, 255, 0.1)"
              : alpha("#1a5c6b", 0.08),
            borderColor: isDarkMode
              ? "rgba(148, 163, 184, 0.3)"
              : alpha("#1a5c6b", 0.18),
            transform: "translateY(-1px)",
            boxShadow: isDarkMode
              ? "0 4px 14px rgba(0, 0, 0, 0.35)"
              : "0 4px 12px rgba(26, 92, 107, 0.08)",
            "& .theme-toggle-icon": {
              transform: isDarkMode
                ? "rotate(20deg) scale(1.1)"
                : "rotate(-20deg) scale(1.1)",
            },
          },
        }}
      >
        <Box
          className="theme-toggle-icon"
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          {isDarkMode ? (
            <LightModeOutlinedIcon
              sx={{
                fontSize: { xs: 19, sm: 21, md: 21 },
                color: "#facc15",
                filter: "drop-shadow(0 0 6px rgba(250, 204, 21, 0.55))",
                transition: "all 0.2s ease",
              }}
            />
          ) : (
            <DarkModeOutlinedIcon
              sx={{
                fontSize: { xs: 19, sm: 21, md: 21 },
                color: "#64748b",
                transition: "all 0.2s ease",
              }}
            />
          )}
        </Box>
      </Box>
    </Tooltip>
  );
}

/* ─── Bell icon with shake animation (touch-friendly) ─── */
function BellIcon({ active, onClick, isDarkMode }) {
  return (
    <Box
      onClick={onClick}
      sx={{
        width: { xs: 36, sm: 40, md: 40 },
        height: { xs: 36, sm: 40, md: 40 },
        borderRadius: { xs: "12px", sm: "14px" },
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: active
          ? isDarkMode
            ? alpha("#1aa6c4", 0.18)
            : alpha("#1a5c6b", 0.1)
          : isDarkMode
            ? "rgba(255, 255, 255, 0.04)"
            : "transparent",
        border: active
          ? `1.5px solid ${alpha(isDarkMode ? "#1aa6c4" : "#1a5c6b", 0.3)}`
          : isDarkMode
            ? "1.5px solid rgba(148, 163, 184, 0.14)"
            : "1.5px solid transparent",
        transition: "all 0.2s ease",
        cursor: "pointer",
        WebkitTapHighlightColor: "transparent",
        "&:active": {
          transform: "scale(0.95)",
        },
        "& svg": {
          animation: active ? "bellShake 0.6s ease" : "none",
          "@keyframes bellShake": {
            "0%,100%": { transform: "rotate(0deg)" },
            "20%": { transform: "rotate(-12deg)" },
            "40%": { transform: "rotate(12deg)" },
            "60%": { transform: "rotate(-8deg)" },
            "80%": { transform: "rotate(8deg)" },
          },
        },
        "&:hover": {
          bgcolor: isDarkMode
            ? "rgba(255, 255, 255, 0.08)"
            : alpha("#1a5c6b", 0.08),
          borderColor: isDarkMode
            ? "rgba(148, 163, 184, 0.25)"
            : alpha("#1a5c6b", 0.15),
          "& svg": {
            color: isDarkMode ? "#61d7ed" : "#1a5c6b",
          },
        },
      }}
    >
      <NotificationsNoneIcon
        sx={{
          fontSize: { xs: 18, sm: 20, md: 20 },
          color: active
            ? isDarkMode
              ? "#61d7ed"
              : "#1a5c6b"
            : isDarkMode
              ? "#94a3b8"
              : "#64748b",
        }}
      />
    </Box>
  );
}

/* ─── Priority stripe ─── */
const PRIORITY_CONFIG = {
  urgent: { color: "#dc2626", label: "Urgent", dot: "#dc2626" },
  critical: { color: "#dc2626", label: "Critical", dot: "#dc2626" },
  high: { color: "#f97316", label: "High", dot: "#f97316" },
  medium: { color: "#ca8a04", label: "Medium", dot: "#ca8a04" },
  low: { color: "#16a34a", label: "Low", dot: "#16a34a" },
};

/* ─── Notification type icon map (using @mui/icons-material) ─── */
const TYPE_ICONS = {
  client_created: { Icon: ApartmentIcon, bg: "#eff6ff", color: "#1d4ed8" },
  client_deactivated: { Icon: LockIcon, bg: "#fef2f2", color: "#dc2626" },
  team_created: { Icon: GroupsIcon, bg: "#f0fdf4", color: "#16a34a" },
  team_deactivated: { Icon: WarningAmberIcon, bg: "#fffbeb", color: "#ca8a04" },
  subscription_expiring: { Icon: HourglassEmptyIcon, bg: "#faf5ff", color: "#9333ea" },
  inactivity_reminder: { Icon: AccessTimeIcon, bg: "#fff7ed", color: "#ea580c" },
  contact_inquiry: { Icon: EmailIcon, bg: "#f0f9ff", color: "#0284c7" },
  checklist_request_created: { Icon: AssignmentIcon, bg: "#eff6ff", color: "#2563eb" },
  checklist_request_approved: { Icon: AssignmentTurnedInIcon, bg: "#f0fdf4", color: "#16a34a" },
  checklist_request_rejected: { Icon: CancelOutlinedIcon, bg: "#fef2f2", color: "#dc2626" },
  system_alert: { Icon: WarningAmberIcon, bg: "#fffbeb", color: "#d97706" },
  default: { Icon: NotificationsNoneIcon, bg: "#f8fafc", color: "#475569" },
};

/* ─── Notification Item (mobile optimized) ─── */
const formatPlanName = (value) =>
  String(value || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

function NotificationDetails({ metadata }) {
  const rows = [
    metadata?.adminName && ["Admin", metadata.adminName],
    metadata?.requesterName && ["Requester", metadata.requesterName],
    metadata?.checklistName && ["Checklist", metadata.checklistName],
    metadata?.category && ["Category", metadata.category],
    metadata?.urgencyLevel && ["Urgency", formatPlanName(metadata.urgencyLevel)],
    metadata?.status && ["Status", formatPlanName(metadata.status)],
    metadata?.rejectionReason && ["Reason", metadata.rejectionReason],
    metadata?.email && ["Email", metadata.email],
    metadata?.phone && ["Phone", metadata.phone],
    metadata?.currentPlan && ["Current", formatPlanName(metadata.currentPlan)],
    metadata?.oldPlan && ["Previous", formatPlanName(metadata.oldPlan)],
    metadata?.requestedPlan && ["Requested", formatPlanName(metadata.requestedPlan)],
    metadata?.newPlan && ["New", formatPlanName(metadata.newPlan)],
  ].filter(Boolean);

  if (!rows.length) return null;

  return (
    <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mt: 0.75, mb: 0.25 }}>
      {rows.map(([label, value]) => (
        <Chip
          key={`${label}-${value}`}
          size="small"
          label={`${label}: ${value}`}
          sx={{
            height: 20,
            maxWidth: "100%",
            bgcolor: alpha("#1a5c6b", 0.08),
            color: "#1a5c6b",
            fontSize: { xs: 9.5, sm: 10.5 },
            fontWeight: 700,
            "& .MuiChip-label": {
              px: 0.75,
              overflow: "hidden",
              textOverflow: "ellipsis",
            },
          }}
        />
      ))}
    </Box>
  );
}

function NotificationItem({ item, onRead, onDelete, formatTime, onClose }) {
  const navigate = useNavigate();
  const priority = PRIORITY_CONFIG[item.priority] || PRIORITY_CONFIG.low;
  const typeConfig = {
    upgrade_plan_requested: { Icon: ArrowCircleUpIcon, bg: "#ecfeff", color: "#0891b2" },
    plan_upgraded: { Icon: CheckCircleIcon, bg: "#f0fdf4", color: "#16a34a" },
  }[item.type] || TYPE_ICONS[item.type] || TYPE_ICONS.default;
  const [hovered, setHovered] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("sm"));

  const handleTouchStart = () => {
    if (isMobile) {
      setShowDelete(true);
      setTimeout(() => setShowDelete(false), 3000);
    }
  };

  const handleClick = () => {
    if (!item.isRead) {
      onRead(item._id);
    }
    if (item.actionLink) {
      navigate(item.actionLink);
      if (onClose) onClose();
    }
  };

  return (
    <Box
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onTouchStart={handleTouchStart}
      onClick={handleClick}
      sx={{
        display: "flex",
        gap: { xs: 1, sm: 1.5 },
        px: { xs: 1.5, sm: 2 },
        py: { xs: 1.25, sm: 1.5 },
        position: "relative",
        cursor: (!item.isRead || item.actionLink) ? "pointer" : "default",
        bgcolor: item.isRead ? "transparent" : alpha("#1a5c6b", 0.03),
        borderLeft: `3px solid ${item.isRead ? "transparent" : priority.color}`,
        transition: "all 0.18s ease",
        "&:active": {
          bgcolor: alpha("#1a5c6b", 0.08),
        },
      }}
    >
      {/* Type icon - smaller on mobile */}
      <Box
        sx={{
          flexShrink: 0,
          width: { xs: 32, sm: 38 },
          height: { xs: 32, sm: 38 },
          borderRadius: { xs: "10px", sm: "12px" },
          bgcolor: typeConfig.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: typeConfig.color,
          mt: 0.25,
        }}
      >
        <typeConfig.Icon sx={{ fontSize: { xs: 18, sm: 20 } }} />
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 1,
          }}
        >
          <Typography
            variant="body2"
            fontWeight={item.isRead ? 400 : 600}
            color="#0f172a"
            fontSize={{ xs: 12, sm: 13 }}
            sx={{ lineHeight: 1.4 }}
          >
            {item.title}
          </Typography>
          {!item.isRead && (
            <Box
              sx={{
                flexShrink: 0,
                width: { xs: 6, sm: 8 },
                height: { xs: 6, sm: 8 },
                borderRadius: "50%",
                bgcolor: priority.color,
                mt: 0.5,
              }}
            />
          )}
        </Box>

        <Typography
          variant="caption"
          color="#64748b"
          fontSize={{ xs: 10.5, sm: 11.5 }}
          sx={{ display: "block", mt: 0.3, mb: 0.5, lineHeight: 1.4 }}
        >
          {item.message}
        </Typography>

        <NotificationDetails metadata={item.metadata} />

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            flexWrap: "wrap",
          }}
        >
          <Typography
            variant="caption"
            color="#94a3b8"
            fontSize={{ xs: 9.5, sm: 10.5 }}
          >
            {formatTime(item.createdAt)}
          </Typography>
          {item.priority !== "low" && (
            <Chip
              label={priority.label}
              size="small"
              sx={{
                height: { xs: 14, sm: 16 },
                fontSize: { xs: 8.5, sm: 9.5 },
                fontWeight: 600,
                bgcolor: alpha(priority.color, 0.1),
                color: priority.color,
                "& .MuiChip-label": { px: 0.75 },
              }}
            />
          )}
        </Box>
      </Box>

      {/* Delete button - appears on hover for desktop, swipe for mobile */}
      {(hovered || showDelete) && (
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(item._id, e);
          }}
          sx={{
            alignSelf: "flex-start",
            mt: -0.25,
            p: { xs: 0.75, sm: 0.5 },
            color: "#94a3b8",
            "&:active": { transform: "scale(0.95)" },
            "&:hover": { color: "#ef4444", bgcolor: alpha("#ef4444", 0.08) },
          }}
        >
          <DeleteOutlineIcon sx={{ fontSize: { xs: 14, sm: 15 } }} />
        </IconButton>
      )}
    </Box>
  );
}

/* ─── Notification Panel (mobile optimized) ─── */
function NotificationPanel({
  notifications,
  unreadCount,
  loading,
  pagination,
  onRead,
  onDelete,
  onMarkAll,
  onRefresh,
  onLoadMore,
  loadingMore,
  onClose,
  isMobile,
  formatTime,
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const panelBg = isDark ? "#0f1e29" : "#ffffff";
  const panelBorder = isDark ? "rgba(148, 163, 184, 0.18)" : "#f1f5f9";
  const panelHeaderBg = isDark ? "#0b1724" : "#ffffff";
  const panelText = isDark ? "#e7eef2" : "#0f172a";
  const panelMuted = isDark ? "#8ca0ac" : "#64748b";

  return (
    <Box
      sx={{
        width: { xs: "100%", sm: 400, md: 420 },
        maxHeight: { xs: "85vh", sm: "80vh" },
        display: "flex",
        flexDirection: "column",
        fontFamily: "'DM Sans', sans-serif",
        bgcolor: panelBg,
        color: panelText,
      }}
    >
      {/* Header - mobile optimized */}
      <Box
        sx={{
          px: { xs: 2, sm: 2.5 },
          py: { xs: 1.5, sm: 2 },
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: `1px solid ${panelBorder}`,
          bgcolor: panelHeaderBg,
          position: "sticky",
          top: 0,
          zIndex: 1,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: 1, sm: 1.25 },
          }}
        >
          <Box
            sx={{
              width: { xs: 28, sm: 32 },
              height: { xs: 28, sm: 32 },
              borderRadius: { xs: "8px", sm: "10px" },
              background: "linear-gradient(135deg, #1a5c6b 0%, #1a5c6b 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <NotificationsNoneIcon
              sx={{ fontSize: { xs: 14, sm: 16 }, color: "#fff" }}
            />
          </Box>
          <Typography
            fontWeight={700}
            fontSize={{ xs: 14, sm: 15 }}
            color={panelText}
            fontFamily="'DM Sans', sans-serif"
          >
            Notifications
          </Typography>
          {unreadCount > 0 && (
            <Box
              sx={{
                px: 0.75,
                py: 0.15,
                borderRadius: 99,
                background: "linear-gradient(135deg, #ef4444 0%, #f87171 100%)",
                color: "#fff",
                fontSize: { xs: 10, sm: 11 },
                fontWeight: 700,
                lineHeight: 1.6,
              }}
            >
              {unreadCount}
            </Box>
          )}
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Tooltip title="Refresh">
            <IconButton
              size="small"
              onClick={onRefresh}
              sx={{
                color: panelMuted,
                p: { xs: 0.75, sm: 0.5 },
                "&:active": { transform: "scale(0.95)" },
              }}
            >
              <RefreshIcon sx={{ fontSize: { xs: 16, sm: 16 } }} />
            </IconButton>
          </Tooltip>
          {unreadCount > 0 && (
            <Tooltip title="Mark all as read">
              <IconButton
                size="small"
                onClick={onMarkAll}
                sx={{
                  color: panelMuted,
                  p: { xs: 0.75, sm: 0.5 },
                  "&:active": { transform: "scale(0.95)" },
                }}
              >
                <DoneAllIcon sx={{ fontSize: { xs: 16, sm: 16 } }} />
              </IconButton>
            </Tooltip>
          )}
          {isMobile && (
            <IconButton
              size="small"
              onClick={onClose}
              sx={{
                color: panelMuted,
                p: { xs: 0.75, sm: 0.5 },
                "&:active": { transform: "scale(0.95)" },
              }}
            >
              <CloseIcon sx={{ fontSize: { xs: 16, sm: 16 } }} />
            </IconButton>
          )}
        </Box>
      </Box>

      {/* Unread summary strip - mobile optimized */}
      {unreadCount > 0 && (
        <Box
          sx={{
            px: { xs: 2, sm: 2.5 },
            py: { xs: 0.6, sm: 0.75 },
            background: isDark
              ? "rgba(31, 182, 207, 0.08)"
              : "linear-gradient(90deg, #f0f0ff 0%, #fafafa 100%)",
            borderBottom: `1px solid ${panelBorder}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 0.5,
          }}
        >
          <Typography
            fontSize={{ xs: 10.5, sm: 11.5 }}
            color="#1a5c6b"
            fontWeight={600}
          >
            {unreadCount} unread notification{unreadCount > 1 ? "s" : ""}
          </Typography>
          <Button
            size="small"
            onClick={onMarkAll}
            sx={{
              fontSize: { xs: 10, sm: 11 },
              color: "#1a5c6b",
              fontWeight: 600,
              p: 0,
              minWidth: 0,
              textTransform: "none",
              "&:active": { opacity: 0.7 },
            }}
          >
            Mark all read
          </Button>
        </Box>
      )}

      {/* List - mobile optimized scrolling */}
      <Box
        sx={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch" }}
      >
        {loading && notifications.length === 0 ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress size={32} sx={{ color: "#1a5c6b" }} />
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 8, px: 3 }}>
            <Box
              sx={{
                width: { xs: 56, sm: 64 },
                height: { xs: 56, sm: 64 },
                borderRadius: "20px",
                bgcolor: isDark ? "rgba(148, 163, 184, 0.12)" : "#f8fafc",
                border: isDark ? "1px solid rgba(148, 163, 184, 0.18)" : "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 1.5,
              }}
            >
              <NotificationsActiveIcon
                sx={{
                  fontSize: { xs: 24, sm: 28 },
                  color: isDark ? "#8ca0ac" : "#cbd5e1",
                }}
              />
            </Box>
            <Typography
              fontSize={{ xs: 13, sm: 14 }}
              fontWeight={600}
              color={panelText}
            >
              You're all caught up!
            </Typography>
            <Typography fontSize={{ xs: 11, sm: 12 }} color={panelMuted} mt={0.5}>
              No new notifications right now.
            </Typography>
          </Box>
        ) : (
          <>
            {notifications.map((item, idx) => (
              <React.Fragment key={item._id}>
                <NotificationItem
                  item={item}
                  onRead={onRead}
                  onDelete={onDelete}
                  formatTime={formatTime}
                  onClose={onClose}
                />
                {idx < notifications.length - 1 && (
                  <Box sx={{ mx: 2, borderBottom: `1px solid ${panelBorder}` }} />
                )}
              </React.Fragment>
            ))}

            {pagination && notifications.length < pagination.total && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  py: { xs: 2, sm: 2.5 },
                }}
              >
                <Button
                  size="small"
                  onClick={onLoadMore}
                  disabled={loadingMore}
                  sx={{
                    fontSize: { xs: 11, sm: 12 },
                    fontWeight: 600,
                    color: "#1a5c6b",
                    textTransform: "none",
                    borderRadius: "10px",
                    px: 2,
                    py: { xs: 0.6, sm: 0.75 },
                    bgcolor: alpha("#1a5c6b", 0.06),
                    "&:active": { transform: "scale(0.97)" },
                  }}
                >
                  {loadingMore ? (
                    <CircularProgress size={16} sx={{ color: "#1a5c6b" }} />
                  ) : (
                    "Load more"
                  )}
                </Button>
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  );
}

/* ─── Mobile User Menu Drawer ─── */
function MobileUserMenu({
  open,
  onClose,
  user,
  onLogout,
  getUserDisplayName,
  getUserInitials,
  avatarUrl,
  getUserRole,
  roleConfig,
  isDarkMode,
  onToggleTheme,
}) {
  const theme = useTheme();

  return (
    <SwipeableDrawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      onOpen={() => {}}
      PaperProps={{
        sx: {
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          bgcolor: isDarkMode ? "#0d1a29" : "#fff",
          maxHeight: "75vh",
          overflow: "hidden",
          animation: open ? "mobileSheetIn 260ms cubic-bezier(0.22, 1, 0.36, 1)" : "none",
          "@keyframes mobileSheetIn": {
            "0%": { transform: "translateY(24px)", opacity: 0 },
            "100%": { transform: "translateY(0)", opacity: 1 },
          },
        },
      }}
      ModalProps={{
        BackdropProps: {
          sx: {
            bgcolor: "rgba(15, 23, 42, 0.55)",
            backdropFilter: "blur(2px)",
          },
        },
      }}
    >
      {/* Drag handle */}
      <Box sx={{ display: "flex", justifyContent: "center", pt: 1.5, pb: 0.5 }}>
        <Box
          sx={{
            width: 36,
            height: 4,
            borderRadius: 99,
            bgcolor: isDarkMode ? "rgba(148, 163, 184, 0.25)" : "#e2e8f0",
          }}
        />
      </Box>

      {/* Profile section */}
      <Box sx={{ px: 3, py: 2, textAlign: "center" }}>
        <Avatar
          src={avatarUrl || undefined}
          sx={{
            width: 80,
            height: 80,
            mx: "auto",
            mb: 1.5,
            background: "linear-gradient(135deg, #1a5c6b 0%, #0d4d5c 100%)",
            fontSize: 28,
            fontWeight: 700,
            boxShadow: "0 4px 12px rgba(99,102,241,0.3)",
          }}
        >
          {getUserInitials()}
        </Avatar>
        <Typography
          fontWeight={700}
          fontSize={18}
          color={isDarkMode ? "#f8fafc" : "#0f172a"}
        >
          {getUserDisplayName()}
        </Typography>
        <Typography
          fontSize={13}
          color={isDarkMode ? "#94a3b8" : "#64748b"}
          mt={0.25}
        >
          {user?.email || "user@example.com"}
        </Typography>
        <Chip
          label={getUserRole()}
          sx={{
            mt: 1.5,
            height: 24,
            fontSize: 12,
            fontWeight: 600,
            bgcolor: roleConfig.bg,
            color: roleConfig.color,
          }}
        />
      </Box>

      <Divider sx={{ my: 1, borderColor: isDarkMode ? "rgba(148, 163, 184, 0.16)" : "#e2e8f0" }} />

      {/* Theme Toggle row */}
      <MenuItem
        onClick={onToggleTheme}
        sx={{
          py: 1.25,
          px: 2,
          mx: "auto",
          width: "calc(100% - 32px)",
          maxWidth: 320,
          borderRadius: 2.25,
          mb: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          bgcolor: isDarkMode ? "rgba(255, 255, 255, 0.04)" : "#f8fafc",
          "&:active": {
            bgcolor: isDarkMode ? "rgba(255, 255, 255, 0.08)" : alpha("#1a5c6b", 0.08),
          },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
          <ListItemIcon sx={{ minWidth: 0 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: "10px",
                bgcolor: isDarkMode ? "rgba(250, 204, 21, 0.12)" : alpha("#1a5c6b", 0.1),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {isDarkMode ? (
                <LightModeOutlinedIcon sx={{ fontSize: 18, color: "#facc15" }} />
              ) : (
                <DarkModeOutlinedIcon sx={{ fontSize: 18, color: "#1a5c6b" }} />
              )}
            </Box>
          </ListItemIcon>
          <ListItemText
            primary="Theme Mode"
            primaryTypographyProps={{
              fontSize: 14,
              fontWeight: 600,
              color: isDarkMode ? "#f8fafc" : "#0f172a",
            }}
          />
        </Box>
        <Chip
          size="small"
          label={isDarkMode ? "Dark" : "Light"}
          sx={{
            height: 24,
            fontSize: 12,
            fontWeight: 700,
            bgcolor: isDarkMode ? "rgba(250, 204, 21, 0.15)" : alpha("#1a5c6b", 0.1),
            color: isDarkMode ? "#fde68a" : "#1a5c6b",
            borderRadius: "8px",
          }}
        />
      </MenuItem>

      {/* Logout */}
      <MenuItem
        onClick={onLogout}
        sx={{
          py: 1.25,
          px: 2,
          mx: "auto",
          width: "calc(100% - 32px)",
          maxWidth: 320,
          borderRadius: 2.25,
          mb: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 1.25,
          "&:active": { bgcolor: alpha("#ef4444", 0.08) },
        }}
      >
        <ListItemIcon sx={{ minWidth: 0 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: "10px",
              bgcolor: alpha("#ef4444", 0.1),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <LogoutIcon sx={{ fontSize: 18, color: "#ef4444" }} />
          </Box>
        </ListItemIcon>
        <ListItemText
          primary="Logout"
          sx={{ flex: "0 0 auto", m: 0 }}
          primaryTypographyProps={{
            fontSize: 15,
            fontWeight: 600,
            color: "#ef4444",
            textAlign: "center",
          }}
        />
      </MenuItem>
    </SwipeableDrawer>
  );
}

/* ─── Main TopHeader (Fully Responsive) ─── */
export default function TopHeader({ onMenuToggle }) {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const { user, logout, authRequest, updateCurrentUser } = useAuth();

  const toggleTheme = useCallback(() => {
    const nextMode = isDarkMode ? "light" : "dark";
    localStorage.setItem(THEME_STORAGE_KEY, nextMode);
    localStorage.setItem(THEME_EXPLICIT_STORAGE_KEY, "true");
    window.dispatchEvent(
      new CustomEvent("assetmach-theme-change", { detail: { mode: nextMode } })
    );
  }, [isDarkMode]);
  const { profile } = useTeam();
  const {
    notifications,
    unreadCount,
    loading: notificationsLoading,
    pagination,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    fetchUnreadCount,
  } = useNotifications();

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const [mobileUserMenuOpen, setMobileUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [notificationPage, setNotificationPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const prevUnreadRef = useRef(unreadCount);
  const [bellActive, setBellActive] = useState(false);
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [upgradeNotice, setUpgradeNotice] = useState({
    open: false,
    severity: "success",
    message: "",
  });
  const [upgradeForm, setUpgradeForm] = useState({
    requestedPlan: "standard",
    adminName: "",
    email: "",
    phone: "",
    message: "",
  });
  const [upgradeRequests, setUpgradeRequests] = useState([]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (notificationAnchor || (!isDesktop && notificationAnchor !== null)) {
      fetchNotifications(1, 20);
      setNotificationPage(1);
    }
  }, [notificationAnchor, isDesktop]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!notificationAnchor) fetchUnreadCount();
    }, 30000);
    return () => clearInterval(interval);
  }, [notificationAnchor]);

  // Trigger bell shake when unread count increases
  useEffect(() => {
    if (unreadCount > prevUnreadRef.current) {
      setBellActive(true);
      setTimeout(() => setBellActive(false), 800);
    }
    prevUnreadRef.current = unreadCount;
  }, [unreadCount]);

  const getUserDisplayName = () => {
    if (!user) return "User";
    return user.name || user.email?.split("@")[0] || "User";
  };

  const getUserInitials = () =>
    getUserDisplayName()
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const avatarUrl = profile?.avatarUrl || user?.avatarUrl || "";
  const currentPlan = String(user?.membershipPlan || "free").toLowerCase();
  const hasActiveUpgradeRequest = upgradeRequests.some((request) =>
    ["pending", "pending_approval"].includes(request?.status),
  );
  const showUpgradeButton =
    user?.role === "admin" &&
    currentPlan === "free" &&
    !hasActiveUpgradeRequest;

  const refreshCurrentAdmin = useCallback(async () => {
    if (user?.role !== "admin") return;
    try {
      const response = await authRequest("get", "/auth/me");
      const nextUser = response?.data?.user || response?.user;
      if (!nextUser) return;
      updateCurrentUser({
        membershipPlan: nextUser.membershipPlan,
        daysRemaining: nextUser.daysRemaining,
        usagePercentage: nextUser.usagePercentage,
        licenseLimit: nextUser.licenseLimit,
        assetLimit: nextUser.assetLimit,
        usersUsed: nextUser.usersUsed,
        subscriptionStartDate: nextUser.subscriptionStartDate,
        subscriptionEndDate: nextUser.subscriptionEndDate,
      });
    } catch {
      // Keep the current local session data if the lightweight refresh fails.
    }
  }, [authRequest, updateCurrentUser, user?.role]);

  const getUserRole = () => {
    const role = user?.role || "member";
    return role === "super_admin"
      ? "Super Admin"
      : role === "admin"
        ? "Admin"
        : "Team Member";
  };

  const getRoleConfig = () => {
    const role = user?.role;
    if (role === "super_admin") return { color: "#ef4444", bg: "#fef2f2" };
    if (role === "admin") return { color: "#f59e0b", bg: "#fffbeb" };
    return { color: "#10b981", bg: "#f0fdf4" };
  };

  const formatTimeAgo = (date) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch {
      return "Unknown";
    }
  };

  const handleNotificationOpen = (e) => {
    if (isMobile) {
      setNotificationAnchor("mobile-drawer");
    } else {
      setNotificationAnchor(e.currentTarget);
    }
    setNotificationPage(1);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
    setNotificationPage(1);
  };

  const handleMarkNotificationRead = async (id) => {
    await markAsRead(id);
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
  };

  const handleDeleteNotification = async (id, event) => {
    event.stopPropagation();
    await deleteNotification(id);
  };

  const handleRefresh = async () => {
    await fetchNotifications(1, 20);
  };

  const handleLoadMore = async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    const next = notificationPage + 1;
    await fetchNotifications(next, 20);
    setNotificationPage(next);
    setLoadingMore(false);
  };

  const handleLogout = async () => {
    handleUserMenuClose();
    setMobileUserMenuOpen(false);
    try {
      await logout();
      sessionStorage.setItem("logoutToastMessage", "Logged out successfully");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handleUserMenuOpen = (e) => {
    if (isMobile) {
      setMobileUserMenuOpen(true);
    } else {
      setUserMenuAnchor(e.currentTarget);
    }
  };

  const handleUserMenuClose = () => setUserMenuAnchor(null);

  const fetchUpgradeRequests = useCallback(async () => {
    if (user?.role !== "admin") {
      setUpgradeRequests([]);
      return;
    }
    try {
      const response = await authRequest("get", "/clients/upgrade-requests");
      setUpgradeRequests(response?.data?.requests || response?.requests || []);
    } catch {
      setUpgradeRequests([]);
    }
  }, [authRequest, user?.role]);

  useEffect(() => {
    refreshCurrentAdmin();
    fetchUpgradeRequests();
    const handleUpgradeChange = () => {
      refreshCurrentAdmin();
      fetchUpgradeRequests();
    };
    const handleFocus = () => {
      refreshCurrentAdmin();
      fetchUpgradeRequests();
    };
    const refreshTimer = window.setInterval(handleFocus, 30000);
    window.addEventListener("assetmach-upgrade-request-created", handleUpgradeChange);
    window.addEventListener("focus", handleFocus);
    return () => {
      window.clearInterval(refreshTimer);
      window.removeEventListener("assetmach-upgrade-request-created", handleUpgradeChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [fetchUpgradeRequests, refreshCurrentAdmin]);

  const openUpgradeDialog = () => {
    setUpgradeForm({
      requestedPlan: "standard",
      adminName:
        user?.customerName ||
        user?.name ||
        `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
        user?.email?.split("@")[0] ||
        "",
      email: user?.email || "",
      phone: user?.phone || "",
      message: "",
    });
    setUpgradeDialogOpen(true);
  };

  const closeUpgradeDialog = () => setUpgradeDialogOpen(false);

  const handleUpgradeFormChange = (field) => (event) => {
    setUpgradeForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleUpgradeRequestSubmit = async () => {
    if (!upgradeForm.adminName.trim() || !upgradeForm.email.trim() || !upgradeForm.phone.trim()) {
      setUpgradeNotice({
        open: true,
        severity: "error",
        message: "Please fill admin name, email, and phone.",
      });
      return;
    }

    try {
      const response = await authRequest("post", "/clients/upgrade-requests", {
        requestedPlan: upgradeForm.requestedPlan,
        message: upgradeForm.message.trim(),
      });
      window.dispatchEvent(
        new CustomEvent("assetmach-upgrade-request-created", {
          detail: response?.data?.request || response?.request,
        }),
      );
      setUpgradeDialogOpen(false);
      await fetchUpgradeRequests();
      setUpgradeNotice({
        open: true,
        severity: "success",
        message: response?.message || "Upgrade request submitted successfully.",
      });
    } catch (error) {
      setUpgradeNotice({
        open: true,
        severity: "error",
        message:
          error?.response?.data?.message ||
          error?.message ||
          "Failed to submit upgrade request.",
      });
    }
  };

  const roleConfig = getRoleConfig();

  const notifPanelProps = {
    notifications,
    unreadCount,
    loading: notificationsLoading,
    pagination,
    onRead: handleMarkNotificationRead,
    onDelete: handleDeleteNotification,
    onMarkAll: handleMarkAllRead,
    onRefresh: handleRefresh,
    onLoadMore: handleLoadMore,
    loadingMore,
    onClose: handleNotificationClose,
    isMobile,
    formatTime: formatTimeAgo,
  };

  return (
    <>
      <Box
        component="header"
        sx={{
          height: { xs: 56, sm: 60, md: 64, lg: 68 },
          bgcolor: isDarkMode
            ? scrolled
              ? "rgba(7, 17, 31, 0.9)"
              : "rgba(7, 17, 31, 0.96)"
            : scrolled
              ? "rgba(255,255,255,0.92)"
              : "#ffffff",
          backdropFilter: scrolled || isDarkMode ? "blur(12px)" : "none",
          borderBottom: "1px solid",
          borderColor: isDarkMode ? "rgba(148, 163, 184, 0.16)" : scrolled ? alpha("#1a5c6b", 0.08) : "#f1f5f9",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: { xs: 1.5, sm: 2, md: 3, lg: 4 },
          position: "sticky",
          top: 0,
          zIndex: 1100,
          width: "100%",
          boxSizing: "border-box",
          transition: "all 0.25s ease",
          boxShadow: scrolled ? (isDarkMode ? "0 1px 24px rgba(0,0,0,0.28)" : "0 1px 20px rgba(99,102,241,0.06)") : "none",
        }}
      >
        {/* Left: Menu toggle - visible on mobile and tablet */}
        {(isMobile || isTablet) && (
          <IconButton
            onClick={onMenuToggle}
            size="small"
            sx={{
              color: "#64748b",
              width: { xs: 34, sm: 36 },
              height: { xs: 34, sm: 36 },
              borderRadius: "10px",
              WebkitTapHighlightColor: "transparent",
              "&:active": { transform: "scale(0.95)" },
            }}
          >
            <MenuIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
          </IconButton>
        )}

        {/* Right: Actions */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: 0.75, sm: 1, md: 1.25 },
            ml: "auto",
          }}
        >
          {/* Light / Dark Mode Toggle */}
          <ThemeToggle isDarkMode={isDarkMode} onToggle={toggleTheme} />

          {/* Notification bell */}
          <PulsingBadge count={unreadCount} isDarkMode={isDarkMode}>
            <BellIcon
              active={Boolean(notificationAnchor) || bellActive}
              onClick={handleNotificationOpen}
              isDarkMode={isDarkMode}
            />
          </PulsingBadge>

          {showUpgradeButton && (
            <Box
              sx={{
                display: { xs: "none", sm: "inline-flex" },
                position: "relative",
                borderRadius: "999px",
                p: "1.5px",
                overflow: "hidden",
                background:
                  "linear-gradient(120deg, #f59e0b, #fde68a, #facc15, #f59e0b)",
                backgroundSize: "240% 240%",
                animation: "upgradeBorderFlow 2.8s linear infinite",
                boxShadow:
                  "0 10px 24px rgba(245, 158, 11, 0.28), 0 0 0 1px rgba(245, 158, 11, 0.12)",
                "@keyframes upgradeBorderFlow": {
                  "0%": { backgroundPosition: "0% 50%" },
                  "100%": { backgroundPosition: "240% 50%" },
                },
              }}
            >
              <Button
                variant="contained"
                size="small"
                startIcon={<WorkspacePremiumIcon sx={{ fontSize: 16 }} />}
                onClick={openUpgradeDialog}
                sx={{
                  minWidth: 0,
                  borderRadius: "999px",
                  minHeight: 32,
                  px: { sm: 1.45, md: 1.7 },
                  textTransform: "none",
                  fontWeight: 900,
                  fontSize: { sm: 12, md: 13 },
                  letterSpacing: 0,
                  bgcolor: "#111827",
                  color: "#fde68a",
                  background:
                    "linear-gradient(135deg, #18181b 0%, #272111 52%, #3b2f08 100%)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12)",
                  whiteSpace: "nowrap",
                  "& .MuiButton-startIcon": {
                    mr: 0.65,
                    color: "#facc15",
                  },
                  "&:hover": {
                    bgcolor: "#1f2937",
                    background:
                      "linear-gradient(135deg, #111827 0%, #3b2f08 48%, #5b4306 100%)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18)",
                  },
                }}
              >
                Upgrade
              </Button>
            </Box>
          )}

          {/* User menu trigger - optimized for touch */}
          <Box
            onClick={handleUserMenuOpen}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: { xs: 0.75, sm: 1, md: 1.25 },
              cursor: "pointer",
              pl: { xs: 0.5, sm: 0.75, md: 1 },
              pr: { xs: 0.5, sm: 0.75, md: 1.25 },
              py: 0.5,
              borderRadius: "14px",
              transition: "all 0.2s ease",
              WebkitTapHighlightColor: "transparent",
              "&:hover": {
                bgcolor: isDarkMode
                  ? "rgba(255, 255, 255, 0.05)"
                  : alpha("#1a5c6b", 0.04),
              },
              "&:active": {
                transform: isMobile ? "scale(0.98)" : "none",
                bgcolor: isDarkMode
                  ? "rgba(255, 255, 255, 0.08)"
                  : alpha("#1a5c6b", 0.05),
              },
            }}
          >
            <Box sx={{ position: "relative" }}>
              <Avatar
                src={avatarUrl || undefined}
                alt={getUserDisplayName()}
                sx={{
                  width: { xs: 32, sm: 36, md: 38 },
                  height: { xs: 32, sm: 36, md: 38 },
                  background:
                    "linear-gradient(135deg, #1a5c6b 0%, #0a4f5e 100%)",
                  fontSize: { xs: 12, sm: 13, md: 14 },
                  fontWeight: 700,
                  fontFamily: "'DM Sans', sans-serif",
                  boxShadow: "0 2px 8px rgba(99,102,241,0.25)",
                }}
              >
                {getUserInitials()}
              </Avatar>
              {/* Online indicator */}
              <Box
                sx={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  width: { xs: 8, sm: 9 },
                  height: { xs: 8, sm: 9 },
                  borderRadius: "50%",
                  bgcolor: "#10b981",
                  border: isDarkMode ? "2px solid #07111f" : "2px solid #fff",
                }}
              />
            </Box>

            {/* Show user info on tablet and desktop */}
            {!isMobile && (
              <>
                <Box sx={{ display: { xs: "none", sm: "block" } }}>
                  <Typography
                    sx={{
                      fontSize: { sm: 12, md: 13 },
                      fontWeight: 600,
                      color: isDarkMode ? "#f8fafc" : "#0f172a",
                      fontFamily: "'DM Sans', sans-serif",
                      lineHeight: 1.3,
                    }}
                  >
                    {getUserDisplayName()}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Box
                      sx={{
                        width: 5,
                        height: 5,
                        borderRadius: "50%",
                        bgcolor: roleConfig.color,
                      }}
                    />
                    <Typography
                      sx={{
                        fontSize: { sm: 9.5, md: 10.5 },
                        color: "#94a3b8",
                        fontFamily: "'DM Sans', sans-serif",
                        fontWeight: 500,
                      }}
                    >
                      {getUserRole()}
                    </Typography>
                  </Box>
                </Box>
                {!isTablet && (
                  <KeyboardArrowDownIcon
                    sx={{
                      fontSize: 16,
                      color: "#94a3b8",
                      transform: Boolean(userMenuAnchor)
                        ? "rotate(180deg)"
                        : "rotate(0deg)",
                      transition: "transform 0.2s ease",
                      display: { xs: "none", md: "block" },
                    }}
                  />
                )}
              </>
            )}
          </Box>
        </Box>
      </Box>

      {/* ─── Upgrade Request Dialog ─── */}
      <Dialog
        open={upgradeDialogOpen}
        onClose={closeUpgradeDialog}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: { xs: "18px", sm: "22px" },
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle
          sx={{
            px: { xs: 2, sm: 2.5 },
            py: 2,
            background: "linear-gradient(135deg, #18181b 0%, #3b2f08 100%)",
            color: "#fde68a",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1.5,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
            <WorkspacePremiumIcon sx={{ color: "#facc15" }} />
            <Box>
              <Typography sx={{ fontWeight: 900, fontSize: { xs: 17, sm: 19 } }}>
                Upgrade Plan Request
              </Typography>
              <Typography sx={{ fontSize: 12, color: "rgba(253, 230, 138, 0.78)" }}>
                Send your plan upgrade request to the platform team
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={closeUpgradeDialog} size="small" sx={{ color: "#fde68a" }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: { xs: 2, sm: 2.5 }, bgcolor: isDarkMode ? "#0d1a29" : "#fff" }}>
          <Stack spacing={1.75} sx={{ mt: 0.5 }}>
            <TextField label="Current Plan" value={currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)} fullWidth size="small" disabled />
            <FormControl fullWidth size="small">
              <InputLabel>Select New Plan</InputLabel>
              <Select label="Select New Plan" value={upgradeForm.requestedPlan} onChange={handleUpgradeFormChange("requestedPlan")}>
                <MenuItem value="standard">Standard</MenuItem>
                <MenuItem value="premium">Premium</MenuItem>
                {/* <MenuItem value="enterprise">Enterprise</MenuItem> */}
              </Select>
            </FormControl>
            <TextField label="Admin Name" value={upgradeForm.adminName} fullWidth size="small" disabled />
            <TextField label="Email" value={upgradeForm.email} fullWidth size="small" disabled />
            <TextField label="Phone" value={upgradeForm.phone} fullWidth size="small" disabled />
            <TextField label="Message" value={upgradeForm.message} onChange={handleUpgradeFormChange("message")} fullWidth multiline minRows={3} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: { xs: 2, sm: 2.5 }, py: 2, bgcolor: isDarkMode ? "#0d1a29" : "#fff" }}>
          <Button onClick={closeUpgradeDialog} sx={{ textTransform: "none", color: "#64748b" }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleUpgradeRequestSubmit}
            sx={{
              textTransform: "none",
              borderRadius: "999px",
              px: 2.5,
              fontWeight: 800,
              color: "#18181b",
              bgcolor: "#facc15",
              "&:hover": { bgcolor: "#eab308" },
            }}
          >
            Submit Request
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={upgradeNotice.open}
        autoHideDuration={3500}
        onClose={() => setUpgradeNotice((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          severity={upgradeNotice.severity}
          variant="filled"
          onClose={() => setUpgradeNotice((prev) => ({ ...prev, open: false }))}
          sx={{ borderRadius: "10px", fontWeight: 700 }}
        >
          {upgradeNotice.message}
        </Alert>
      </Snackbar>

      {/* ─── Desktop User Menu ─── */}
      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor) && !isMobile}
        onClose={handleUserMenuClose}
        TransitionComponent={Fade}
        PaperProps={{
          elevation: 0,
          sx: {
            width: 280,
            mt: 1,
            borderRadius: "18px",
            bgcolor: isDarkMode ? "#0f1e29" : "#ffffff",
            boxShadow: isDarkMode
              ? "0 16px 48px rgba(0,0,0,0.45)"
              : "0 12px 40px rgba(15,23,42,0.12)",
            border: `1px solid ${
              isDarkMode ? "rgba(148, 163, 184, 0.18)" : "#f1f5f9"
            }`,
            overflow: "hidden",
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        {/* Profile card */}
        <Box
          sx={{
            px: 2.5,
            py: 2.5,
            background: isDarkMode
              ? "linear-gradient(135deg, #0f1e29 0%, #132433 100%)"
              : "linear-gradient(135deg, #f8f8ff 0%, #f0f0ff 100%)",
            borderBottom: `1px solid ${
              isDarkMode ? "rgba(148, 163, 184, 0.18)" : "#ededff"
            }`,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Avatar
              src={avatarUrl || undefined}
              sx={{
                width: 48,
                height: 48,
                background: "linear-gradient(135deg, #1a5c6b 0%, #0d4d5c 100%)",
                fontSize: 16,
                fontWeight: 700,
                boxShadow: "0 4px 12px rgba(99,102,241,0.3)",
              }}
            >
              {getUserInitials()}
            </Avatar>
            <Box>
              <Typography
                fontWeight={700}
                fontSize={14}
                color={isDarkMode ? "#e7eef2" : "#0f172a"}
                fontFamily="'DM Sans', sans-serif"
              >
                {getUserDisplayName()}
              </Typography>
              <Typography
                fontSize={11.5}
                color={isDarkMode ? "#8ca0ac" : "#64748b"}
                fontFamily="'DM Sans', sans-serif"
                display="block"
                mt={0.2}
              >
                {user?.email || "user@example.com"}
              </Typography>
              <Chip
                label={getUserRole()}
                size="small"
                sx={{
                  mt: 0.75,
                  height: 18,
                  fontSize: 10,
                  fontWeight: 700,
                  bgcolor: roleConfig.bg,
                  color: roleConfig.color,
                  fontFamily: "'DM Sans', sans-serif",
                  "& .MuiChip-label": { px: 0.75 },
                }}
              />
            </Box>
          </Box>
        </Box>

        {/* Theme mode toggle */}
        <MenuItem
          onClick={() => {
            toggleTheme();
          }}
          sx={{
            py: 1.25,
            px: 2.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            "&:hover": {
              bgcolor: isDarkMode
                ? "rgba(255, 255, 255, 0.05)"
                : alpha("#1a5c6b", 0.04),
            },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 30,
                height: 30,
                borderRadius: "9px",
                bgcolor: isDarkMode
                  ? "rgba(250, 204, 21, 0.14)"
                  : alpha("#1a5c6b", 0.08),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {isDarkMode ? (
                <LightModeOutlinedIcon sx={{ fontSize: 16, color: "#facc15" }} />
              ) : (
                <DarkModeOutlinedIcon sx={{ fontSize: 16, color: "#1a5c6b" }} />
              )}
            </Box>
            <ListItemText
              primary="Theme Mode"
              primaryTypographyProps={{
                fontSize: 13,
                fontWeight: 600,
                color: isDarkMode ? "#e7eef2" : "#0f172a",
                fontFamily: "'DM Sans', sans-serif",
              }}
            />
          </Box>
          <Chip
            size="small"
            label={isDarkMode ? "Dark" : "Light"}
            sx={{
              height: 22,
              fontSize: 11,
              fontWeight: 700,
              bgcolor: isDarkMode
                ? "rgba(250, 204, 21, 0.16)"
                : alpha("#1a5c6b", 0.08),
              color: isDarkMode ? "#fde68a" : "#1a5c6b",
              borderRadius: "6px",
            }}
          />
        </MenuItem>

        <Divider
          sx={{
            my: 0.5,
            borderColor: isDarkMode
              ? "rgba(148, 163, 184, 0.14)"
              : "#f1f5f9",
          }}
        />

        {/* Logout */}
        <MenuItem
          onClick={handleLogout}
          sx={{
            py: 1.5,
            px: 2.5,
            gap: 1.5,
            "&:hover": { bgcolor: alpha("#ef4444", isDarkMode ? 0.1 : 0.04) },
          }}
        >
          <ListItemIcon sx={{ minWidth: "unset" }}>
            <Box
              sx={{
                width: 30,
                height: 30,
                borderRadius: "9px",
                bgcolor: alpha("#ef4444", 0.08),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <LogoutIcon sx={{ fontSize: 15, color: "#ef4444" }} />
            </Box>
          </ListItemIcon>
          <ListItemText
            primary="Logout"
            primaryTypographyProps={{
              fontSize: 13,
              fontWeight: 600,
              color: "#ef4444",
              fontFamily: "'DM Sans', sans-serif",
            }}
          />
        </MenuItem>
      </Menu>

      {/* ─── Desktop Notification Dropdown ─── */}
      {!isMobile && (
        <Menu
          anchorEl={notificationAnchor}
          open={Boolean(notificationAnchor) && !isMobile}
          onClose={handleNotificationClose}
          TransitionComponent={Fade}
          PaperProps={{
            elevation: 0,
            sx: {
              mt: 1.5,
              borderRadius: "20px",
              bgcolor: isDarkMode ? "#0f1e29" : "#ffffff",
              boxShadow: isDarkMode
                ? "0 16px 48px rgba(0,0,0,0.45)"
                : "0 16px 48px rgba(15,23,42,0.12)",
              border: `1px solid ${
                isDarkMode ? "rgba(148, 163, 184, 0.18)" : "#f1f5f9"
              }`,
              overflow: "hidden",
            },
          }}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          <NotificationPanel {...notifPanelProps} />
        </Menu>
      )}

      {/* ─── Mobile Notification Drawer ─── */}
      {isMobile && (
        <SwipeableDrawer
          anchor="bottom"
          open={Boolean(notificationAnchor)}
          onClose={handleNotificationClose}
          onOpen={() => {}}
          PaperProps={{
            sx: {
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              bgcolor: isDarkMode ? "#0f1e29" : "#fff",
              maxHeight: "85vh",
            },
          }}
        >
          {/* Drag handle */}
          <Box
            sx={{ display: "flex", justifyContent: "center", pt: 1.5, pb: 0.5 }}
          >
            <Box
              sx={{
                width: 36,
                height: 4,
                borderRadius: 99,
                bgcolor: "#e2e8f0",
              }}
            />
          </Box>
          <NotificationPanel {...notifPanelProps} />
        </SwipeableDrawer>
      )}

      {/* ─── Mobile User Menu Drawer ─── */}
      <MobileUserMenu
        open={mobileUserMenuOpen}
        onClose={() => setMobileUserMenuOpen(false)}
        user={user}
        onLogout={handleLogout}
        getUserDisplayName={getUserDisplayName}
        getUserInitials={getUserInitials}
        avatarUrl={avatarUrl}
        getUserRole={getUserRole}
        roleConfig={roleConfig}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
      />
    </>
  );
}
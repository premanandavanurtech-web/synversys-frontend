// components/TopHeader.jsx - Premium Redesign (Fully Responsive Mobile)

import React, { useState, useEffect, useRef } from "react";
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
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useAuth } from "../context/AuthContexts";
import { useTeam } from "../context/TeamContext";
import { useNotifications } from "../context/NotificationContext";
import { formatDistanceToNow } from "date-fns";

/* ─── Animated badge with pulse ring (mobile optimized) ─── */
function PulsingBadge({ count, children }) {
  const hasNew = count > 0;
  const label = count > 99 ? "99+" : String(count);
  const badgeMinW = count > 99 ? 26 : count >= 10 ? 22 : 18;

  return (
    <Box sx={{ position: "relative", display: "inline-flex"  }}>
      {children}
      {hasNew && (
        <>
          <Box
            sx={{
              position: "absolute",
              top: -2,
              right: -2,
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
              boxShadow: "0 0 0 2px #ffffff",
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

/* ─── Bell icon with shake animation (touch-friendly) ─── */
function BellIcon({ active, onClick }) {
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
        bgcolor: active ? alpha("#1a5c6b", 0.1) : "transparent",
        border: active
          ? `1.5px solid ${alpha("#1a5c6b", 0.25)}`
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
      }}
    >
      <NotificationsNoneIcon
        sx={{
          fontSize: { xs: 18, sm: 20, md: 20 },
          color: active ? "#1a5c6b" : "#64748b",
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

const TYPE_ICONS = {
  client_created: { emoji: "🏢", bg: "#eff6ff" },
  client_deactivated: { emoji: "🔒", bg: "#fef2f2" },
  team_created: { emoji: "👥", bg: "#f0fdf4" },
  team_deactivated: { emoji: "⚠️", bg: "#fffbeb" },
  subscription_expiring: { emoji: "⏳", bg: "#faf5ff" },
  inactivity_reminder: { emoji: "⏰", bg: "#fff7ed" },
  contact_inquiry: { emoji: "📧", bg: "#f0f9ff" },
  default: { emoji: "🔔", bg: "#f8fafc" },
};

/* ─── Notification Item (mobile optimized) ─── */
function NotificationItem({ item, onRead, onDelete, formatTime }) {
  const priority = PRIORITY_CONFIG[item.priority] || PRIORITY_CONFIG.low;
  const typeConfig = TYPE_ICONS[item.type] || TYPE_ICONS.default;
  const [hovered, setHovered] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("sm"));

  const handleTouchStart = () => {
    if (isMobile) {
      setShowDelete(true);
      setTimeout(() => setShowDelete(false), 3000);
    }
  };

  return (
    <Box
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onTouchStart={handleTouchStart}
      onClick={() => !item.isRead && onRead(item._id)}
      sx={{
        display: "flex",
        gap: { xs: 1, sm: 1.5 },
        px: { xs: 1.5, sm: 2 },
        py: { xs: 1.25, sm: 1.5 },
        position: "relative",
        cursor: item.isRead ? "default" : "pointer",
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
          fontSize: { xs: 16, sm: 18 },
          mt: 0.25,
        }}
      >
        {typeConfig.emoji}
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

  return (
    <Box
      sx={{
        width: { xs: "100%", sm: 400, md: 420 },
        maxHeight: { xs: "85vh", sm: "80vh" },
        display: "flex",
        flexDirection: "column",
        fontFamily: "'DM Sans', sans-serif",
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
          borderBottom: "1px solid #f1f5f9",
          bgcolor: "#fff",
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
            color="#0f172a"
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
                color: "#94a3b8",
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
                  color: "#94a3b8",
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
                color: "#94a3b8",
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
            background: "linear-gradient(90deg, #f0f0ff 0%, #fafafa 100%)",
            borderBottom: "1px solid #f1f5f9",
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
                bgcolor: "#f8fafc",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 1.5,
              }}
            >
              <NotificationsActiveIcon
                sx={{ fontSize: { xs: 24, sm: 28 }, color: "#cbd5e1" }}
              />
            </Box>
            <Typography
              fontSize={{ xs: 13, sm: 14 }}
              fontWeight={600}
              color="#64748b"
            >
              You're all caught up!
            </Typography>
            <Typography fontSize={{ xs: 11, sm: 12 }} color="#94a3b8" mt={0.5}>
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
                />
                {idx < notifications.length - 1 && (
                  <Box sx={{ mx: 2, borderBottom: "1px solid #f8fafc" }} />
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
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          bgcolor: "#fff",
          maxHeight: "75vh",
        },
      }}
    >
      {/* Drag handle */}
      <Box sx={{ display: "flex", justifyContent: "center", pt: 1.5, pb: 0.5 }}>
        <Box
          sx={{ width: 36, height: 4, borderRadius: 99, bgcolor: "#e2e8f0" }}
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
        <Typography fontWeight={700} fontSize={18} color="#0f172a">
          {getUserDisplayName()}
        </Typography>
        <Typography fontSize={13} color="#64748b" mt={0.25}>
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

      <Divider sx={{ my: 1 }} />

      {/* Menu items */}
      <MenuItem
        onClick={onLogout}
        sx={{
          py: 1.5,
          mx: 1.5,
          borderRadius: 2,
          mb: 2,
          "&:active": { bgcolor: alpha("#ef4444", 0.08) },
        }}
      >
        <ListItemIcon>
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
          primaryTypographyProps={{
            fontSize: 15,
            fontWeight: 600,
            color: "#ef4444",
          }}
        />
      </MenuItem>
    </SwipeableDrawer>
  );
}

/* ─── Main TopHeader (Fully Responsive) ─── */
export default function TopHeader({ onMenuToggle }) {
  const { user, logout } = useAuth();
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

  const theme = useTheme();
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
          bgcolor: scrolled ? "rgba(255,255,255,0.92)" : "#ffffff",
          backdropFilter: scrolled ? "blur(12px)" : "none",
          borderBottom: "1px solid",
          borderColor: scrolled ? alpha("#1a5c6b", 0.08) : "#f1f5f9",
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
          boxShadow: scrolled ? "0 1px 20px rgba(99,102,241,0.06)" : "none",
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
            gap: { xs: 0.5, sm: 1, md: 1.5 },
            ml: "auto",
          }}
        >
          {/* Notification bell */}
          <PulsingBadge count={unreadCount}>
            <BellIcon
              active={Boolean(notificationAnchor) || bellActive}
              onClick={handleNotificationOpen}
            />
          </PulsingBadge>

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
              "&:active": {
                transform: isMobile ? "scale(0.98)" : "none",
                bgcolor: alpha("#1a5c6b", 0.05),
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
                  border: "2px solid #fff",
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
                      color: "#0f172a",
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
            boxShadow: "0 12px 40px rgba(15,23,42,0.12)",
            border: "1px solid #f1f5f9",
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
            background: "linear-gradient(135deg, #f8f8ff 0%, #f0f0ff 100%)",
            borderBottom: "1px solid #ededff",
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
                color="#0f172a"
                fontFamily="'DM Sans', sans-serif"
              >
                {getUserDisplayName()}
              </Typography>
              <Typography
                fontSize={11.5}
                color="#64748b"
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

        {/* Logout */}
        <MenuItem
          onClick={handleLogout}
          sx={{
            py: 1.5,
            px: 2.5,
            gap: 1.5,
            "&:hover": { bgcolor: alpha("#ef4444", 0.04) },
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
              boxShadow: "0 16px 48px rgba(15,23,42,0.12)",
              border: "1px solid #f1f5f9",
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
              bgcolor: "#fff",
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
      />
    </>
  );
}

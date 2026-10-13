// pages/ChecklistPage.jsx - Fully Updated with All Features

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Chip,
  Card,
  CardContent,
  Grid,
  Tabs,
  Tab,
  Modal,
  IconButton,
  Select,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  FormControl,
  InputLabel,
  useMediaQuery,
  useTheme,
  Stack,
  Avatar,
  InputAdornment,
  ThemeProvider,
  createTheme,
  alpha,
  styled,
  CircularProgress,
  Skeleton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
  Snackbar,
  Switch,
  FormControlLabel,
  Drawer,
} from "@mui/material";
import {
  Close as CloseIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Assignment as AssignmentIcon,
  Send as SendIcon,
  Add as AddIcon,
  FileCopy as FileCopyIcon,
  Description as DescriptionIcon,
  Public as PublicIcon,
  Pending as PendingIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Archive as ArchiveIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
  HourglassEmpty as HourglassIcon,
  ChevronRight as ChevronRightIcon,
  ChevronLeft as ChevronLeftIcon,
  CheckBox as CheckBoxIcon,
  Article as ArticleIcon,
  RequestPage as RequestPageIcon,
  Menu as MenuIcon,
  ContentCopy as ContentCopyIcon,
  MoreVert as MoreVertIcon,
  CalendarToday as CalendarTodayIcon,
  Speed as SpeedIcon,
  Repeat as RepeatIcon,
  FolderSpecial as FolderSpecialIcon,
  TrendingUp as TrendingUpIcon,
  Person as PersonIcon,
  InsertDriveFile as FileIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import { useAuth } from "../context/AuthContexts";
import { useChecklistBuilder } from "../context/ChecklistBuilderContext";
import { useRequestChecklist } from "../context/RequestChecklistContext";
import { useAssignment } from "../context/AssignmentContext";
import RequestChecklistModal from "./Requestchecklistmodal";
import AssignmentModal from "./Assignchecklistmodal";
import AssetSearchField from "../components/AssetSearchField";
import PageHeading from "../components/PageHeading";

// ─── Theme (Dark) ──────────────────────────────────────────────────────────────
const createChecklistTheme = (mode = "dark") => {
  const isLight = mode === "light";
  const primaryMain = isLight ? "#16354F" : "#1fb6cf";
  const primaryDark = isLight ? "#0F2A40" : "#0d8ba1";
  const primaryLight = isLight ? "#244F70" : "#5cd3e6";

  return createTheme({
  palette: {
    mode,
    primary: {
      main: primaryMain,
      dark: primaryDark,
      light: primaryLight,
      contrastText: "#ffffff",
    },
    secondary: { main: "#3fc6e0" },
    error: { main: isLight ? "#d94b4b" : "#f16a6a" },
    warning: { main: isLight ? "#c97919" : "#f0a54a" },
    info: { main: "#4fb2e8" },
    success: { main: isLight ? "#0f9d66" : "#3ecf8e" },
    text: isLight
      ? { primary: "#071d2b", secondary: "#3f5669", disabled: "#8295a5" }
      : { primary: "#e7eef2", secondary: "#8ca0ac", disabled: "#5c7280" },
    background: isLight
      ? { default: "#f4f7fa", paper: "#ffffff" }
      : { default: "#0a1620", paper: "#0f1e29" },
    divider: isLight ? "#d7e2ea" : "#1c2e3a",
  },
  typography: {
    fontFamily: "'Plus Jakarta Sans', 'DM Sans', system-ui, sans-serif",
    button: { textTransform: "none", fontWeight: 700, letterSpacing: 0 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: "7px 18px",
          boxShadow: "none",
          "&:hover": { boxShadow: "none" },
        },
        containedPrimary: {
          backgroundColor: primaryMain,
          color: "#ffffff",
          "&:hover": { backgroundColor: primaryDark },
        },
        outlinedPrimary: {
          borderColor: isLight ? "#6f8798" : primaryMain,
          color: primaryMain,
          "&:hover": {
            borderColor: primaryMain,
            backgroundColor: alpha(primaryMain, 0.06),
          },
        },
        sizeSmall: { padding: "4px 12px", fontSize: 12 },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          boxShadow: isLight
            ? "0 1px 3px rgba(15,37,48,0.08)"
            : "0 1px 4px rgba(0,0,0,0.35)",
          backgroundImage: "none",
        },
      },
    },
    MuiChip: { styleOverrides: { root: { fontWeight: 600, fontSize: 11 } } },
    MuiTableCell: {
      styleOverrides: { root: { borderColor: isLight ? "#dce5eb" : "#1c2e3a" } },
    },
    MuiTextField: { defaultProps: { size: "small" } },
    MuiSelect: { defaultProps: { size: "small" } },
  },
  });
};

let theme = createChecklistTheme("dark");

// ─── Styled Components ────────────────────────────────────────────────────────
const StyledTab = styled(Tab)(({ theme }) => ({
  borderRadius: 8,
  minHeight: 40,
  fontWeight: 700,
  fontSize: 13,
  color: theme.palette.text.secondary,
  transition: "all 0.2s ease",
  padding: "8px 22px",
  [theme.breakpoints.down("sm")]: {
    flex: 1,
    minWidth: 0,
    padding: "8px 10px",
    fontSize: 12,
  },
  "&.Mui-selected": {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.35)}`,
  },
}));

const TH = styled(TableCell)(({ theme }) => ({
  padding: "11px 16px",
  fontSize: "11px",
  fontWeight: 700,
  color: theme.palette.text.disabled,
  backgroundColor:
    theme.palette.mode === "light"
      ? "#f7fafc"
      : alpha(theme.palette.common.black, 0.18),
  textTransform: "uppercase",
  letterSpacing: "0.07em",
  borderBottom: `2px solid ${theme.palette.divider}`,
  whiteSpace: "nowrap",
}));

const TD = styled(TableCell)(() => ({
  padding: "12px 16px",
  fontSize: "13px",
  verticalAlign: "middle",
}));

const ModalBox = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  backgroundColor: theme.palette.background.paper,
  borderRadius: 20,
  boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
  display: "flex",
  flexDirection: "column",
  maxHeight: "95vh",
  outline: "none",
}));

const ModalHeader = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  padding: "24px 28px",
  borderRadius: "20px 20px 0 0",
  flexShrink: 0,
}));

const InfoTile = styled(Box)(({ theme }) => ({
  padding: "12px 14px",
  borderRadius: 10,
  backgroundColor:
    theme.palette.mode === "dark"
      ? alpha(theme.palette.primary.light, 0.12)
      : alpha(theme.palette.primary.main, 0.08),
  border: `1px solid ${
    theme.palette.mode === "dark"
      ? alpha(theme.palette.primary.light, 0.28)
      : alpha(theme.palette.primary.main, 0.18)
  }`,
}));

// ─── Clone Dialog Component ───────────────────────────────────────────────────
const CloneDialog = ({ open, checklist, onClose, onConfirm, loading }) => {
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");
  const inputRef = useRef(null);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    if (open && checklist) {
      setName(`${checklist.name} (Clone)`);
      setNameError("");
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, checklist]);

  const handleConfirm = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError("Clone name is required.");
      return;
    }
    if (trimmed.length < 3) {
      setNameError("Name must be at least 3 characters.");
      return;
    }
    if (trimmed.length > 120) {
      setNameError("Name must be under 120 characters.");
      return;
    }
    setNameError("");
    onConfirm(trimmed);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !loading) handleConfirm();
  };

  return (
    <Dialog
      open={open}
      onClose={!loading ? onClose : undefined}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: { xs: 0, sm: 3 },
          m: { xs: 0, sm: 2 },
          width: { xs: "100%", sm: "calc(100% - 32px)" },
          maxWidth: { xs: "none", sm: 600 },
          height: { xs: "100dvh", sm: "auto" },
          maxHeight: { xs: "100dvh", sm: "calc(100% - 64px)" },
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        },
      }}
    >
      <Box
        sx={{
          bgcolor: "primary.main",
          px: 3,
          pt: 3,
          pb: 2,
          borderRadius: { xs: 0, sm: "12px 12px 0 0" },
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <Box>
            <Typography fontWeight={700} fontSize={18} color="primary.contrastText">
              Clone Checklist
            </Typography>
            <Typography
              fontSize={13}
              sx={{ color: alpha(theme.palette.primary.contrastText, 0.7), mt: 0.5 }}
            >
              Create a copy of an existing checklist
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={onClose}
            disabled={loading}
            sx={{ color: "primary.contrastText", bgcolor: alpha("#000", 0.15) }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
      <DialogContent sx={{ p: 3, flex: 1, overflowY: "auto" }}>
        <Stack spacing={3}>
          <Box
            sx={{
              p: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.08),
              borderRadius: 2,
            }}
          >
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <Avatar
                sx={{
                  bgcolor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  width: 48,
                  height: 48,
                }}
              >
                <DescriptionIcon />
              </Avatar>
              <Box>
                <Typography fontWeight={600}>{checklist?.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {checklist?.checklistType} ·{" "}
                  {checklist?.totalFields ?? checklist?.fields?.length ?? 0}{" "}
                  fields · v{checklist?.version || 1}
                </Typography>
              </Box>
            </Box>
          </Box>
          <TextField
            inputRef={inputRef}
            fullWidth
            label="Clone Name *"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (nameError) setNameError("");
            }}
            onKeyDown={handleKeyDown}
            error={!!nameError}
            helperText={nameError || `${name.length}/120 characters`}
            placeholder="Enter a name for the cloned checklist"
            disabled={loading}
            autoFocus
          />
        </Stack>
      </DialogContent>
      <DialogActions
        sx={{
          px: 3,
          pb: { xs: "calc(16px + env(safe-area-inset-bottom))", sm: 3 },
          gap: 1.5,
          pt: { xs: 1.5, sm: 0 },
          borderTop: { xs: "1px solid", sm: "none" },
          borderColor: "divider",
        }}
      >
        <Button onClick={onClose} disabled={loading} variant="outlined">
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={loading || !name.trim()}
          variant="contained"
          startIcon={
            loading ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <ContentCopyIcon />
            )
          }
        >
          {loading ? "Creating..." : "Create Clone"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

// ─── Status Badges ────────────────────────────────────────────────────────────
const STATUS_CFG = {
  pending: {
    color: "warning",
    icon: <PendingIcon sx={{ fontSize: 11 }} />,
    label: "Pending",
  },
  approved: {
    color: "success",
    icon: <CheckCircleIcon sx={{ fontSize: 11 }} />,
    label: "Approved",
  },
  rejected: {
    color: "error",
    icon: <ErrorIcon sx={{ fontSize: 11 }} />,
    label: "Rejected",
  },
  under_review: {
    color: "info",
    icon: <HourglassIcon sx={{ fontSize: 11 }} />,
    label: "Under Review",
  },
  in_progress: {
    color: "info",
    icon: <HourglassIcon sx={{ fontSize: 11 }} />,
    label: "In Progress",
  },
  published: {
    color: "success",
    icon: <CheckCircleIcon sx={{ fontSize: 11 }} />,
    label: "Published",
  },
  active: {
    color: "success",
    icon: <CheckCircleIcon sx={{ fontSize: 11 }} />,
    label: "Active",
  },
  draft: { color: "default", icon: null, label: "Draft" },
  archived: {
    color: "default",
    icon: <ArchiveIcon sx={{ fontSize: 11 }} />,
    label: "Archived",
  },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CFG[status?.toLowerCase()] || STATUS_CFG.draft;
  return (
    <Chip
      icon={cfg.icon}
      label={cfg.label}

      size="small"
      color={cfg.color}
      sx={{ height: 24, "& .MuiChip-label": { fontSize: 11, px: 0.75 }, }}
    />
  );
};

const TYPE_CFG = {
  custom: {
    icon: <DescriptionIcon sx={{ fontSize: 11 }} />,
    label: "Custom",
    color: "primary",
  },
  global: {
    icon: <PublicIcon sx={{ fontSize: 11 }} />,
    label: "Global",
    color: "success",
  },
  import: {
    icon: <FileCopyIcon sx={{ fontSize: 11 }} />,
    label: "Imported",
    color: "info",
  },
};

const TypeBadge = ({ type }) => {
  const cfg = TYPE_CFG[type?.toLowerCase()] || TYPE_CFG.custom;
  return (
    <Chip
      icon={cfg.icon}
      label={cfg.label}
      size="small"
      color={cfg.color}
      variant="outlined"
      sx={{ height: 24, "& .MuiChip-label": { fontSize: 11 } }}
    />
  );
};

const PRIORITY_CONFIG = {
  low: { label: "Low", color: "#4ade80", bg: alpha("#4ade80", 0.14) },
  medium: { label: "Medium", color: "#facc15", bg: alpha("#facc15", 0.14) },
  high: { label: "High", color: "#fb923c", bg: alpha("#fb923c", 0.14) },
  critical: { label: "Critical", color: "#f87171", bg: alpha("#f87171", 0.16) },
};

const resolveAccentColor = (accent) => {
  const colors = {
    "primary.main": "#1fb6cf",
    "success.main": "#3ecf8e",
    "info.main": "#4fb2e8",
    "warning.main": "#f0a54a",
    "error.main": "#f16a6a",
  };

  return colors[accent] || accent || "#1fb6cf";
};

const PriorityBadge = ({ priority }) => {
  const cfg =
    PRIORITY_CONFIG[priority?.toLowerCase()] || PRIORITY_CONFIG.medium;
  return (
    <Chip
      label={cfg.label}
      size="small"
      sx={{
        bgcolor: cfg.bg,
        color: cfg.color,
        fontWeight: 600,
        fontSize: 11,
        height: 24,
      }}
    />
  );
};

// ─── StatCard ─────────────────────────────────────────────────────────────────
const StatCard = ({
  label,
  value,
  sub,
  accent,
  icon,
  loading,
  active = false,
  onClick,
}) => {
  const cardAccent = resolveAccentColor(accent);

  return (
  <Card
    role={onClick ? "button" : undefined}
    tabIndex={onClick ? 0 : undefined}
    onClick={onClick}
    onKeyDown={(e) => {
      if (!onClick) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onClick();
      }
    }}
    sx={{
      height: "100%",
      width: "100%",
      position: "relative",
      overflow: "hidden",
      border: "1px solid",
      borderColor: active ? `${cardAccent} !important` : "divider",
      bgcolor: active ? `${alpha(cardAccent, 0.14)} !important` : undefined,
      cursor: onClick ? "pointer" : "default",
      outline: active ? `3px solid ${cardAccent}` : "none",
      outlineOffset: "-3px",
      boxShadow: active
        ? `inset 0 0 0 1px ${cardAccent}, 0 18px 40px ${alpha(cardAccent, 0.22)} !important`
        : 0,
      "&::before": active
        ? {
            content: '""',
            position: "absolute",
            inset: "0 auto 0 0",
            width: 6,
            bgcolor: cardAccent,
          }
        : undefined,
      transition: "all 0.2s ease",
      "&:hover": onClick
        ? {
            transform: "translateY(-2px)",
            borderColor: `${cardAccent} !important`,
            outline: `3px solid ${cardAccent}`,
            boxShadow: active
              ? `inset 0 0 0 1px ${cardAccent}, 0 20px 44px ${alpha(cardAccent, 0.24)} !important`
              : `0 12px 28px ${alpha(cardAccent, 0.16)}`,
          }
        : undefined,
      "&:focus-visible": {
        outline: "2px solid",
        outlineColor: cardAccent,
        outlineOffset: 2,
      },
    }}
  >
    <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="caption"
            fontWeight={700}
            color="text.secondary"
            sx={{
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              display: "block",
              fontSize: { xs: 9, sm: 11 },
            }}
          >
            {label}
          </Typography>
          {loading ? (
            <Skeleton width={50} height={36} sx={{ mt: 0.5 }} />
          ) : (
            <Typography
              variant="h5"
              fontWeight={800}
              color={cardAccent}
              sx={{ mt: 0.5, lineHeight: 1.2, fontSize: { xs: 20, sm: 24 } }}
            >
              {value ?? "—"}
            </Typography>
          )}
          {sub &&
            (loading ? (
              <Skeleton width={90} height={13} />
            ) : (
              <Typography
                variant="caption"
                color="text.disabled"
                sx={{ mt: 0.5, display: "block", fontSize: { xs: 9, sm: 11 } }}
              >
                {sub}
              </Typography>
            ))}
        </Box>
        {icon && (
          <Avatar
            sx={{
              bgcolor: alpha(cardAccent, 0.14),
              color: cardAccent,
              width: { xs: 36, sm: 40 },
              height: { xs: 36, sm: 40 },
            }}
          >
            {icon}
          </Avatar>
        )}
      </Box>
    </CardContent>
  </Card>
  );
};

// ─── EmptyState ───────────────────────────────────────────────────────────────
const EmptyState = ({ message = "No data found", sub = "", icon }) => (
  <Box sx={{ py: { xs: 6, sm: 8 }, textAlign: "center" }}>
    <Box
      sx={{
        width: { xs: 60, sm: 72 },
        height: { xs: 60, sm: 72 },
        borderRadius: "50%",
        bgcolor: (t) => alpha(t.palette.primary.main, 0.1),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        mx: "auto",
        mb: 2.5,
      }}
    >
      {icon || (
        <DescriptionIcon
          sx={{
            fontSize: { xs: 26, sm: 30 },
            color: "primary.main",
            opacity: 0.6,
          }}
        />
      )}
    </Box>
    <Typography
      fontWeight={700}
      color="text.secondary"
      variant="body1"
      sx={{ fontSize: { xs: 13, sm: 14 } }}
    >
      {message}
    </Typography>
    {sub && (
      <Typography
        variant="caption"
        color="text.disabled"
        sx={{ display: "block", mt: 0.75, fontSize: { xs: 11, sm: 12 } }}
      >
        {sub}
      </Typography>
    )}
  </Box>
);

// ─── Pagination ───────────────────────────────────────────────────────────────
const PaginationComponent = ({ pagination, onPageChange }) => {
  if (!pagination?.pages || pagination.pages <= 1) return null;
  return (
    <Box
      sx={{
        p: { xs: 1.5, sm: 2 },
        pb: { xs: 2, sm: 2 },
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 1,
        borderTop: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        flexWrap: "wrap",
      }}
    >
      <Button
        size="small"
        variant="outlined"
        disabled={pagination.page === 1}
        onClick={() => onPageChange(pagination.page - 1)}
        startIcon={<ChevronLeftIcon />}
        sx={{ minWidth: { xs: 96, sm: 88 } }}
      >
        Prev
      </Button>
      <Typography
        variant="body2"
        fontWeight={600}
        color="text.secondary"
        sx={{
          width: { xs: "100%", sm: "auto" },
          order: { xs: -1, sm: 0 },
          textAlign: "center",
        }}
      >
        Page <strong>{pagination.page}</strong> of{" "}
        <strong>{pagination.pages}</strong>
      </Typography>
      <Button
        size="small"
        variant="outlined"
        disabled={pagination.page === pagination.pages}
        onClick={() => onPageChange(pagination.page + 1)}
        endIcon={<ChevronRightIcon />}
        sx={{ minWidth: { xs: 96, sm: 88 } }}
      >
        Next
      </Button>
    </Box>
  );
};

// ─── Mobile Cards ─────────────────────────────────────────────────────────────
const MobileChecklistCard = ({
  row,
  onView,
  onAssign,
  onDelete,
  onClone,
  isAdmin,
}) => (
  <Paper sx={{ p: 2, mb: 1.5, border: "1px solid", borderColor: "divider" }}>
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        mb: 1,
      }}
    >
      <Box sx={{ flex: 1 }}>
        <Typography fontWeight={700} fontSize={14}>
          {row.name}
        </Typography>
        {row.description && (
          <Typography
            variant="caption"
            color="text.disabled"
            sx={{ display: "block", mt: 0.25 }}
          >
            {row.description}
          </Typography>
        )}
      </Box>
      <StatusBadge status={row.status} />
    </Box>
    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1.5 }}>
      <TypeBadge type={row.checklistType} />
      {row.category && (
        <Chip
          label={row.category}
          size="small"
          variant="outlined"
          sx={{ height: 22, fontSize: 11 }}
        />
      )}
      <Chip
        label={`${row.totalFields ?? row.fields?.length ?? 0} fields`}
        size="small"
        sx={{
          height: 22,
          fontSize: 11,
          bgcolor: alpha(theme.palette.primary.main, 0.14),
          color: "primary.main",
        }}
      />
    </Box>
    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
      <Button
        size="small"
        variant="outlined"
        startIcon={<VisibilityIcon sx={{ fontSize: 13 }} />}
        onClick={() => onView(row)}
      >
        View
      </Button>
      <Button
        size="small"
        variant="outlined"
        startIcon={<ContentCopyIcon sx={{ fontSize: 13 }} />}
        onClick={() => onClone(row)}
      >
        Clone
      </Button>
      {isAdmin && (
        <Button
          size="small"
          variant="outlined"
          startIcon={<AssignmentIcon sx={{ fontSize: 13 }} />}
          onClick={() => onAssign(row)}
        >
          Assign
        </Button>
      )}
      {isAdmin && (
        <Button
          size="small"
          variant="outlined"
          color="error"
          startIcon={<DeleteIcon sx={{ fontSize: 13 }} />}
          onClick={() => onDelete(row)}
        >
          Delete
        </Button>
      )}
    </Box>
  </Paper>
);

const MobileRequestCard = ({ row, onView, onDelete, isSuperAdmin }) => (
  <Paper
    sx={{
      p: 2,
      mb: 1.5,
      border: "1px solid",
      borderColor: "divider",
      opacity: row.isDeleted ? 0.6 : 1,
    }}
  >
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        mb: 1,
      }}
    >
      <Box sx={{ flex: 1 }}>
        <Typography fontWeight={700} fontSize={14}>
          {row.checklistName}
        </Typography>
        {row.message && (
          <Typography
            variant="caption"
            color="text.disabled"
            sx={{ display: "block", mt: 0.25 }}
          >
            {row.message}
          </Typography>
        )}
      </Box>
      <StatusBadge status={row.status} />
    </Box>
    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1.5 }}>
      <PriorityBadge priority={row.urgencyLevel} />
      {row.category && (
        <Chip
          label={row.category}
          size="small"
          variant="outlined"
          sx={{ height: 22, fontSize: 11 }}
        />
      )}
    </Box>
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 1,
      }}
    >
      <Typography variant="caption" color="text.secondary">
        Submitted: {fmt(row.requestDate || row.createdAt)}
      </Typography>
      <Box sx={{ display: "flex", gap: 1 }}>
        <Tooltip title="View">
          <IconButton
            size="small"
            onClick={() => onView(row)}
            sx={{ border: "1px solid", borderColor: "divider" }}
          >
            <VisibilityIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
        {(isSuperAdmin || !row.isDeleted) && (
          <Tooltip title="Delete">
            <IconButton
              size="small"
              color="error"
              onClick={() => onDelete(row)}
              sx={{ border: "1px solid", borderColor: "error.light" }}
            >
              <DeleteIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Box>
  </Paper>
);

// ─── ViewChecklistModal ───────────────────────────────────────────────────────
const ViewChecklistModal = ({
  open,
  onClose,
  checklist,
  onDelete,
  userRole,
}) => {
  if (!checklist) return null;
  const fields = checklist.fields || [];
  return (
    <Modal open={open} onClose={onClose}>
      <ModalBox
        sx={{
          width: { xs: "100vw", sm: 660 },
          height: { xs: "100dvh", sm: "auto" },
          maxHeight: { xs: "100dvh", sm: "95vh" },
          top: { xs: 0, sm: "50%" },
          left: { xs: 0, sm: "50%" },
          transform: { xs: "none", sm: "translate(-50%, -50%)" },
          borderRadius: { xs: 0, sm: "20px" },
        }}
      >
        <ModalHeader sx={{ borderRadius: { xs: 0, sm: "20px 20px 0 0" } }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <Box sx={{ flex: 1, pr: 2 }}>
              <Typography
                variant="h6"
                fontWeight={800}
                color="primary.contrastText"
                sx={{ fontSize: { xs: 16, sm: 20 } }}
              >
                {checklist.name}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: alpha(theme.palette.primary.contrastText, 0.65), mt: 0.5, display: "block" }}
              >
                Created {fmt(checklist.createdAt)}
              </Typography>
              <Stack
                direction="row"
                spacing={0.75}
                sx={{ mt: 1.5, flexWrap: "wrap", gap: 0.75 }}
              >
                <StatusBadge status={checklist.status} />
                <TypeBadge type={checklist.checklistType} />
                {checklist.category && (
                  <Chip
                    label={checklist.category}
                    size="small"
                    sx={{
                      height: 24,
                      fontSize: 11,
                      fontWeight: 600,
                      color: theme.palette.primary.contrastText,
                      bgcolor: alpha("#000", 0.18),
                      border: `1px solid ${alpha(theme.palette.primary.contrastText, 0.25)}`,
                    }}
                  />
                )}
              </Stack>
            </Box>
            <IconButton
              onClick={onClose}
              sx={{
                color: theme.palette.primary.contrastText,
                bgcolor: alpha("#000", 0.15),
                "&:hover": { bgcolor: alpha("#000", 0.25) },
                width: 36,
                height: 36,
              }}
            >
              <CloseIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
        </ModalHeader>
        <Box sx={{ flex: 1, overflow: "auto", p: { xs: 2, sm: 3 } }}>
          <Stack spacing={3}>
            <Grid container spacing={1.5}>
              {[
                { label: "Version", val: `v${checklist.version || 1}` },
                {
                  label: "Fields",
                  val: checklist.totalFields ?? fields.length,
                },
                { label: "Category", val: checklist.category || "—" },
                { label: "Created", val: fmt(checklist.createdAt) },
                { label: "Updated", val: fmt(checklist.updatedAt) },
                { label: "Is Global", val: checklist.isGlobal ? "Yes" : "No" },
              ].map(({ label, val }) => (
                <Grid item xs={6} sm={4} key={label}>
                  <InfoTile>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontWeight={600}
                      display="block"
                      sx={{ mb: 0.25 }}
                    >
                      {label}
                    </Typography>
                    <Typography variant="body2" fontWeight={700}>
                      {val}
                    </Typography>
                  </InfoTile>
                </Grid>
              ))}
            </Grid>
            {checklist.description && (
              <Box>
                <Typography
                  variant="caption"
                  fontWeight={700}
                  color="text.secondary"
                  sx={{
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                    display: "block",
                    mb: 1,
                  }}
                >
                  Description
                </Typography>
                <Box
                  sx={{
                    p: 2,
                    bgcolor: "background.default",
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ lineHeight: 1.75 }}
                  >
                    {checklist.description}
                  </Typography>
                </Box>
              </Box>
            )}
            {fields.length > 0 && (
              <Box>
                <Typography
                  variant="caption"
                  fontWeight={700}
                  color="text.secondary"
                  sx={{
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                    display: "block",
                    mb: 1.5,
                  }}
                >
                  Fields ({fields.length})
                </Typography>
                <Stack spacing={1}>
                  {fields.map((field, idx) => (
                    <Box
                      key={field._id || idx}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        p: 1.5,
                        borderRadius: 2,
                        border: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 28,
                          height: 28,
                          fontSize: 11,
                          fontWeight: 700,
                          bgcolor: alpha(theme.palette.primary.main, 0.16),
                          color: "primary.main",
                        }}
                      >
                        {idx + 1}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" fontWeight={600}>
                          {field.label}
                        </Typography>
                        <Typography variant="caption" color="text.disabled">
                          {field.type} ·{" "}
                          {field.required ? "Required" : "Optional"}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </Box>
            )}
          </Stack>
        </Box>
        <Box
          sx={{
            p: 2.5,
            borderTop: "1px solid",
            borderColor: "divider",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexShrink: 0,
            bgcolor: "background.default",
            borderRadius: { xs: 0, sm: "0 0 20px 20px" },
            flexWrap: "wrap",
            gap: 1,
            pb: { xs: "calc(16px + env(safe-area-inset-bottom))", sm: 2.5 },
          }}
        >
          <Stack direction="row" spacing={1}>
            {(userRole === "super_admin" || userRole === "admin") && (
              <Button
                onClick={() => {
                  onDelete(checklist);
                  onClose();
                }}
                variant="outlined"
                size="small"
                startIcon={<DeleteIcon />}
                color="error"
              >
                Delete
              </Button>
            )}
          </Stack>
          <Button onClick={onClose} variant="outlined" size="small">
            Close
          </Button>
        </Box>
      </ModalBox>
    </Modal>
  );
};

// ─── CreateModal ──────────────────────────────────────────────────────────────
const CreateModal = ({ open, onClose }) => {
  const navigate = useNavigate();
  const OPTIONS = [
    {
      icon: <DescriptionIcon />,
      label: "Custom Checklist",
      desc: "Build a fully custom checklist with drag-and-drop fields",
      path: "/admin/create-checklist/custom",
      color: "#5cd3e6",
      bg: alpha("#1fb6cf", 0.14),
    },
    {
      icon: <PublicIcon />,
      label: "Custom Checklist (Global)",
      desc: "Submit a custom checklist for super admin approval",
      path: "/admin/create-checklist/global",
      color: "#3ecf8e",
      bg: alpha("#3ecf8e", 0.14),
    },
    {
      icon: <FileCopyIcon />,
      label: "Import from Excel",
      desc: "Auto-generate checklist fields from an Excel spreadsheet",
      path: "/admin/import-checklist/excel",
      color: "#4fb2e8",
      bg: alpha("#4fb2e8", 0.14),
    },
  ];
  return (
    <Modal open={open} onClose={onClose}>
      <ModalBox
        sx={{
          width: { xs: "100vw", sm: 500 },
          height: { xs: "100dvh", sm: "auto" },
          maxHeight: { xs: "100dvh", sm: "95vh" },
          top: { xs: 0, sm: "50%" },
          left: { xs: 0, sm: "50%" },
          transform: { xs: "none", sm: "translate(-50%, -50%)" },
          borderRadius: { xs: 0, sm: "20px" },
        }}
      >
        <ModalHeader sx={{ borderRadius: { xs: 0, sm: "20px 20px 0 0" } }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <Box>
              <Typography
                variant="h6"
                fontWeight={800}
                color="primary.contrastText"
                sx={{ fontSize: { xs: 16, sm: 20 } }}
              >
                Create New Checklist
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: alpha(theme.palette.primary.contrastText, 0.65),
                  mt: 0.5,
                  fontSize: { xs: 12, sm: 14 },
                }}
              >
                Choose how to build your checklist
              </Typography>
            </Box>
            <IconButton
              onClick={onClose}
              sx={{
                color: theme.palette.primary.contrastText,
                bgcolor: alpha("#000", 0.15),
                "&:hover": { bgcolor: alpha("#000", 0.25) },
                width: 36,
                height: 36,
              }}
            >
              <CloseIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
        </ModalHeader>
        <Box sx={{ p: { xs: 2, sm: 2.5 }, flex: 1, overflowY: "auto" }}>
          <Stack spacing={1.5}>
            {OPTIONS.map((opt) => (
              <Box
                key={opt.label}
                onClick={() => {
                  onClose();
                  navigate(opt.path);
                }}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  p: 2,
                  borderRadius: 2.5,
                  border: "1.5px solid",
                  borderColor: "divider",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  "&:hover": {
                    borderColor: opt.color,
                    bgcolor: opt.bg,
                    transform: "translateX(3px)",
                  },
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: opt.bg,
                    color: opt.color,
                    width: { xs: 40, sm: 48 },
                    height: { xs: 40, sm: 48 },
                    borderRadius: 2,
                  }}
                >
                  {opt.icon}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    fontWeight={700}
                    variant="body1"
                    sx={{ fontSize: { xs: 13, sm: 16 } }}
                  >
                    {opt.label}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ lineHeight: 1.5, fontSize: { xs: 11, sm: 12 } }}
                  >
                    {opt.desc}
                  </Typography>
                </Box>
                <ChevronRightIcon
                  sx={{ color: "text.disabled", fontSize: 20 }}
                />
              </Box>
            ))}
          </Stack>
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            p: { xs: 2, sm: 2.5 },
            pt: 1.5,
            pb: { xs: "calc(16px + env(safe-area-inset-bottom))", sm: 2.5 },
            borderTop: { xs: "1px solid", sm: "none" },
            borderColor: "divider",
            bgcolor: "background.default",
            borderRadius: { xs: 0, sm: "0 0 20px 20px" },
          }}
        >
          <Button onClick={onClose} variant="outlined" size="small">
            Cancel
          </Button>
        </Box>
      </ModalBox>
    </Modal>
  );
};

// ─── DeleteConfirmDialog ──────────────────────────────────────────────────────
const DeleteConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  deleting,
}) => (
  <Dialog
    open={open}
    onClose={onClose}
    maxWidth="xs"
    fullWidth
    PaperProps={{ sx: { borderRadius: 3 } }}
  >
    <DialogTitle sx={{ pb: 1 }}>
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Avatar
          sx={{
            bgcolor: alpha("#f16a6a", 0.16),
            color: "error.main",
            width: 38,
            height: 38,
          }}
        >
          <WarningIcon sx={{ fontSize: 20 }} />
        </Avatar>
        <Typography fontWeight={800} variant="body1">
          {title || "Delete"}
        </Typography>
      </Stack>
    </DialogTitle>
    <DialogContent>
      <DialogContentText sx={{ fontSize: { xs: 13, sm: 14 } }}>
        {message || "Are you sure you want to delete this item?"}
      </DialogContentText>
    </DialogContent>
    <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
      <Button
        onClick={onClose}
        variant="outlined"
        size="small"
        disabled={deleting}
      >
        Cancel
      </Button>
      <Button
        onClick={onConfirm}
        variant="contained"
        color="error"
        size="small"
        disabled={deleting}
        startIcon={
          deleting ? (
            <CircularProgress size={13} color="inherit" />
          ) : (
            <DeleteIcon />
          )
        }
      >
        {deleting ? "Deleting…" : "Delete"}
      </Button>
    </DialogActions>
  </Dialog>
);

// ─── ReviewRequestDialog ──────────────────────────────────────────────────────
const ReviewRequestDialog = ({ open, onClose, request, onReview }) => {
  const [action, setAction] = useState("approved");
  const [rejectionReason, setRejectionReason] = useState("");
  const [reviewing, setReviewing] = useState(false);

  useEffect(() => {
    if (open) {
      setAction("approved");
      setRejectionReason("");
    }
  }, [open]);

  const handleSubmit = async () => {
    setReviewing(true);
    await onReview(
      request?._id,
      action,
      action === "rejected" ? { rejectionReason } : {},
    );
    setReviewing(false);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle fontWeight={700}>Review Request</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <FormControl fullWidth>
            <InputLabel>Decision</InputLabel>
            <Select
              value={action}
              onChange={(e) => setAction(e.target.value)}
              label="Decision"
            >
              <MenuItem value="approved">Approve</MenuItem>
              <MenuItem value="rejected">Reject</MenuItem>
              <MenuItem value="under_review">Mark Under Review</MenuItem>
              <MenuItem value="in_progress">Mark In Progress</MenuItem>
            </Select>
          </FormControl>
          {action === "rejected" && (
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Rejection Reason *"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Explain why this request is being rejected..."
            />
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" disabled={reviewing}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={
            reviewing || (action === "rejected" && !rejectionReason.trim())
          }
          startIcon={
            reviewing ? (
              <CircularProgress size={14} color="inherit" />
            ) : (
              <SendIcon />
            )
          }
        >
          {reviewing ? "Submitting…" : "Submit Review"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ChecklistPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const appTheme = useTheme();
  theme = createChecklistTheme(appTheme.palette.mode);
  const userRole = user?.role;
  const isSuperAdmin = userRole === "super_admin" || userRole === "superadmin";
  const isAdmin = userRole === "admin";
  const canCreateRequests = ["admin", "super_admin", "superadmin", "team"].includes(userRole);
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Action menu state (three-dot menu in checklist table)
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [actionMenuRow, setActionMenuRow] = useState(null);

  const openActionMenu = (e, row) => {
    setActionMenuAnchor(e.currentTarget);
    setActionMenuRow(row);
  };
  const closeActionMenu = () => {
    setActionMenuAnchor(null);
    setActionMenuRow(null);
  };

  const {
    getAllChecklists,
    getChecklistById,
    deleteChecklist,
    cloneChecklist,
  } = useChecklistBuilder();
  const {
    getMyRequests,
    getAllRequests,
    getRequestById,
    softDeleteRequest,
    reviewRequest,
  } = useRequestChecklist();
  const { getAssignments } = useAssignment();

  const [checklists, setChecklists] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [listPagination, setListPagination] = useState({});
  const [listStats, setListStats] = useState({
    total: 0,
    published: 0,
    fields: 0,
  });
  const [listFilters, setListFilters] = useState({
    search: "",
    status: "",
    checklistType: "",
    page: 1,
    limit: 10,
  });

  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [requestsPagination, setRequestsPagination] = useState({});
  const [requestsFilters, setRequestsFilters] = useState({
    status: "",
    urgencyLevel: "",
    search: "",
    page: 1,
    limit: 10,
  });
  const [listStatFilter, setListStatFilter] = useState("");
  const [requestStatFilter, setRequestStatFilter] = useState("");
  const [showDeleted, setShowDeleted] = useState(false);

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const requestedTab =
    searchParams.get("tab") === "requests" || location.state?.tab === 1 ? 1 : 0;
  const [tab, setTab] = useState(requestedTab);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("tab") === "requests" || location.state?.tab === 1) {
      setTab(1);
    }
  }, [location.search, location.state]);
  const [createOpen, setCreateOpen] = useState(false);
  const [requestOpen, setRequestOpen] = useState(false);
  const [viewChecklist, setViewChecklist] = useState(null);
  const [viewRequest, setViewRequest] = useState(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [loadingView, setLoadingView] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedChecklist, setSelectedChecklist] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [requestDeleteTarget, setRequestDeleteTarget] = useState(null);
  const [requestDeleteDialogOpen, setRequestDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [changeCartWidth,setChangeCartWidth]=useState(tab)

  // Clone modal state
  const [cloneModalOpen, setCloneModalOpen] = useState(false);
  const [selectedCloneChecklist, setSelectedCloneChecklist] = useState(null);
  const [cloneLoading, setCloneLoading] = useState(false);

  const [snack, setSnack] = useState({
    open: false,
    msg: "",
    severity: "success",
  });
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const showSnack = useCallback(
    (msg, severity = "success") => setSnack({ open: true, msg, severity }),
    [],
  );

  // Fetch Checklists
  const fetchChecklists = useCallback(async () => {
    setListLoading(true);
    try {
      const params = { page: listFilters.page, limit: isSmallMobile ? 5 : 10 };
      if (listFilters.search) params.search = listFilters.search;
      if (listStatFilter || listFilters.status)
        params.status = listStatFilter || listFilters.status;
      if (listFilters.checklistType)
        params.checklistType = listFilters.checklistType;
      const res = await getAllChecklists(params);
      if (res.success) {
        const data = res.data;
        const list = data?.checklists || (Array.isArray(data) ? data : []);
        setChecklists(list);
        setListPagination(data?.pagination || {});

        const [publishedRes, fieldsRes] = await Promise.all([
          getAllChecklists({ status: "published", page: 1, limit: 1 }),
          getAllChecklists({ page: 1, limit: 100 }),
        ]);
        const publishedTotal =
          publishedRes?.data?.pagination?.total ??
          publishedRes?.data?.checklists?.length ??
          0;
        const allVisibleChecklists = fieldsRes?.data?.checklists || [];
        setListStats({
          total: data?.pagination?.total ?? list.length,
          published: publishedTotal,
          fields: allVisibleChecklists.reduce(
            (sum, checklist) =>
              sum + (checklist.totalFields ?? checklist.fields?.length ?? 0),
            0,
          ),
        });
      } else showSnack(res.error || "Failed to fetch checklists", "error");
    } catch (err) {
      showSnack(err.message || "Failed to fetch checklists", "error");
    } finally {
      setListLoading(false);
    }
  }, [getAllChecklists, listFilters, listStatFilter, showSnack, isSmallMobile]);

  // Fetch Requests
  const fetchRequests = useCallback(async () => {
    setRequestsLoading(true);
    try {
      const params = {
        page: requestsFilters.page,
        limit: isSmallMobile ? 5 : 10,
      };
      if (requestsFilters.search) params.search = requestsFilters.search;
      if (requestStatFilter || requestsFilters.status)
        params.status = requestStatFilter || requestsFilters.status;
      if (requestsFilters.urgencyLevel)
        params.urgencyLevel = requestsFilters.urgencyLevel;
      if (isSuperAdmin && showDeleted) params.includeDeleted = true;
      const result = isSuperAdmin
        ? await getAllRequests(params)
        : await getMyRequests(params);
      if (result?.success) {
        const data = result.data;
        const list = data?.requests || (Array.isArray(data) ? data : []);
        setRequests(Array.isArray(list) ? list : []);
        setRequestsPagination(data?.pagination || {});
      } else showSnack(result?.error || "Failed to fetch requests", "error");
    } catch (err) {
      showSnack(err.message || "Failed to fetch requests", "error");
    } finally {
      setRequestsLoading(false);
    }
  }, [
    getAllRequests,
    getMyRequests,
    requestsFilters,
    requestStatFilter,
    isSuperAdmin,
    showDeleted,
    showSnack,
    isSmallMobile,
  ]);

  // Handlers
  const openAssign = useCallback((row) => {
    setSelectedChecklist(row);
    setAssignModalOpen(true);
  }, []);
  const handleAssignSuccess = useCallback(() => {
    showSnack("Assignments created successfully!");
    if (typeof getAssignments === "function")
      getAssignments({ page: 1, limit: 5 }).catch(() => {});
  }, [getAssignments, showSnack]);

  const openViewChecklist = useCallback(
    async (row) => {
      setLoadingView(true);
      const res = await getChecklistById(row._id);
      setLoadingView(false);
      if (res.success) setViewChecklist(res.data);
      else showSnack("Failed to load checklist details", "error");
    },
    [getChecklistById, showSnack],
  );

  const openViewRequest = useCallback(
    async (row) => {
      setLoadingView(true);
      const res = await getRequestById(row._id);
      setLoadingView(false);
      if (res.success) setViewRequest(res.data);
      else showSnack("Failed to load request details", "error");
    },
    [getRequestById, showSnack],
  );

  const handleDeleteClick = useCallback((c) => {
    setDeleteTarget(c);
    setDeleteDialogOpen(true);
  }, []);
  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget?._id) return;
    setDeleting(true);
    const res = await deleteChecklist(deleteTarget._id);
    if (res.success) {
      showSnack("Checklist deleted successfully");
      fetchChecklists();
    } else showSnack(res.error || "Failed to delete checklist", "error");
    setDeleting(false);
    setDeleteDialogOpen(false);
    setDeleteTarget(null);
  }, [deleteTarget, deleteChecklist, fetchChecklists, showSnack]);

  const handleSoftDeleteRequest = useCallback(
    async (id) => {
      const res = await softDeleteRequest(id);
      if (res.success) {
        showSnack("Request deleted");
        fetchRequests();
      } else showSnack(res.error || "Failed to delete request", "error");
      setViewRequest(null);
    },
    [softDeleteRequest, fetchRequests, showSnack],
  );

  const handleRequestDeleteClick = useCallback((request) => {
    setRequestDeleteTarget(request);
    setRequestDeleteDialogOpen(true);
  }, []);

  const handleRequestDeleteConfirm = useCallback(async () => {
    if (!requestDeleteTarget?._id) return;
    setDeleting(true);
    const res = await softDeleteRequest(requestDeleteTarget._id);
    if (res.success) {
      showSnack("Request deleted");
      fetchRequests();
      if (viewRequest?._id === requestDeleteTarget._id) setViewRequest(null);
    } else {
      showSnack(res.error || "Failed to delete request", "error");
    }
    setDeleting(false);
    setRequestDeleteDialogOpen(false);
    setRequestDeleteTarget(null);
  }, [requestDeleteTarget, softDeleteRequest, fetchRequests, showSnack, viewRequest]);

  const handleReviewRequest = useCallback(
    async (id, status, data) => {
      const res = await reviewRequest(id, status, data);
      if (res.success) {
        showSnack(`Request ${status.replace(/_/g, " ")} successfully`);
        fetchRequests();
        setViewRequest(null);
      } else showSnack(res.error || "Failed to review request", "error");
      return res;
    },
    [reviewRequest, fetchRequests, showSnack],
  );

  // Clone handlers
  const openCloneModal = useCallback((row) => {
    setSelectedCloneChecklist(row);
    setCloneModalOpen(true);
  }, []);
  const handleCloneConfirm = useCallback(
    async (newName) => {
      if (!selectedCloneChecklist) return;
      setCloneLoading(true);
      try {
        const res = await cloneChecklist(selectedCloneChecklist._id, {
          newName,
        });
        if (res.success) {
          showSnack(`"${newName}" created successfully!`);
          setCloneModalOpen(false);
          setSelectedCloneChecklist(null);
          fetchChecklists();
        } else {
          showSnack(res.error || "Clone failed. Please try again.", "error");
        }
      } catch (err) {
        showSnack(err.message || "Clone failed.", "error");
      } finally {
        setCloneLoading(false);
      }
    },
    [selectedCloneChecklist, cloneChecklist, fetchChecklists, showSnack],
  );

  useEffect(() => {
    fetchChecklists();
  }, [fetchChecklists]);
  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  useEffect(() => {
  setChangeCartWidth(tab);
}, [tab]);

  const stats = {
    total: listStats.total || listPagination.total || checklists.length,
    active:
      listStats.published ||
      checklists.filter((c) => c.status === "published" || c.status === "active")
        .length,
    fields:
      listStats.fields ||
      checklists.reduce((s, c) => s + (c.totalFields ?? c.fields?.length ?? 0), 0),
    pending: checklists.filter(
      (c) => c.status === "pending" || c.status === "draft",
    ).length,
  };
  const reqStats = {
    total: requestsPagination.total ?? requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    approved: requests.filter((r) => r.status === "approved").length,
    rejected: requests.filter((r) => r.status === "rejected").length,
  };

  const updateListFilter = (k, v) =>
    setListFilters((p) => {
      if (k === "status") setListStatFilter("");
      return { ...p, [k]: v, page: 1 };
    });
  const updateReqFilter = (k, v) =>
    setRequestsFilters((p) => {
      if (k === "status") setRequestStatFilter("");
      return { ...p, [k]: v, page: 1 };
    });
  const handleChecklistStatClick = (status) => {
    setListStatFilter(status);
    setListFilters((p) => ({ ...p, page: 1 }));
  };
  const handleRequestStatClick = (status) => {
    setRequestStatFilter(status);
    setRequestsFilters((p) => ({ ...p, page: 1 }));
  };

  const mobileFilters = (
    <Box sx={{ p: 2, width: 280 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography fontWeight={700}>Filters</Typography>
        <IconButton size="small" onClick={() => setMobileDrawerOpen(false)}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Stack spacing={2}>
        {tab === 0 ? (
          <>
            <AssetSearchField
              placeholder="Search checklists..."
              value={listFilters.search}
              onChange={(e) => updateListFilter("search", e.target.value)}
              onClear={() => updateListFilter("search", "")}
            />
            <FormControl size="small" fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={listFilters.status}
                onChange={(e) => updateListFilter("status", e.target.value)}
                label="Status"
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="published">Published</MenuItem>
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="archived">Archived</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={listFilters.checklistType}
                onChange={(e) =>
                  updateListFilter("checklistType", e.target.value)
                }
                label="Type"
              >
                <MenuItem value="">All Types</MenuItem>
                <MenuItem value="custom">Custom</MenuItem>
                <MenuItem value="global">Global</MenuItem>
                <MenuItem value="import">Imported</MenuItem>
              </Select>
            </FormControl>
          </>
        ) : (
          <>
            <AssetSearchField
              placeholder="Search requests..."
              value={requestsFilters.search}
              onChange={(e) => updateReqFilter("search", e.target.value)}
              onClear={() => updateReqFilter("search", "")}
            />
            <FormControl size="small" fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={requestsFilters.status}
                onChange={(e) => updateReqFilter("status", e.target.value)}
                label="Status"
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
                <MenuItem value="under_review">Under Review</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" fullWidth>
              <InputLabel>Urgency</InputLabel>
              <Select
                value={requestsFilters.urgencyLevel}
                onChange={(e) =>
                  updateReqFilter("urgencyLevel", e.target.value)
                }
                label="Urgency"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
              </Select>
            </FormControl>
          </>
        )}
        <Button
          variant="outlined"
          onClick={() => {
            if (tab === 0) {
              updateListFilter("search", "");
              updateListFilter("status", "");
              updateListFilter("checklistType", "");
            } else {
              updateReqFilter("search", "");
              updateReqFilter("status", "");
              updateReqFilter("urgencyLevel", "");
            }
            setMobileDrawerOpen(false);
          }}
        >
          Clear Filters
        </Button>
      </Stack>
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
        <Container
          maxWidth="xl"
          sx={{
            pt: { xs: 2, md: 3.5 },
            pb: { xs: 13, md: 3.5 },
            px: { xs: 1.5, md: 3 },
          }}
        >
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: 2,
              mb: 3,
            }}
          >
            <PageHeading
              title="Checklist Management"
              subtitle="Build, manage, and assign inspection checklists for your team"
              titleColor="text.primary"
              subtitleColor="text.secondary"
            />
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {(isSuperAdmin || isAdmin) && (
                <Button
                  variant="outlined"
                  startIcon={<ContentCopyIcon sx={{ fontSize: 13 }} />}
                  onClick={() => navigate("/admin/checklists/clone")}
                  sx={{ fontSize: { xs: 11, sm: 13 } }}
                >
                  Clone
                </Button>
              )}
              {canCreateRequests && (
                <Button
                  variant="outlined"
                  startIcon={<RequestPageIcon />}
                  onClick={() => setRequestOpen(true)}
                  sx={{
                    fontSize: { xs: 11, sm: 13 },
                    borderColor: "primary.main",
                    color: "primary.main",
                  }}
                >
                  Request
                </Button>
              )}
              {(isSuperAdmin || isAdmin) && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setCreateOpen(true)}
                  sx={{ fontSize: { xs: 11, sm: 13 } }}
                >
                  Create
                </Button>
              )}
            </Stack>
          </Box>

          {/* Stats */}
          {tab === 0 && (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "repeat(2, minmax(0, 1fr))",
                  md: "repeat(3, minmax(0, 1fr))",
                },
                gap: 2,
                mb: 3,
              }}
            >
              {[
                {
                  label: "Total Checklists",
                  value: stats.total,
                  sub: "All types",
                  accent: "primary.main",
                  icon: <ArticleIcon />,
                  filterStatus: "",
                },
                {
                  label: "Published",
                  value: stats.active,
                  sub: "Currently active",
                  accent: "success.main",
                  icon: <CheckCircleIcon />,
                  filterStatus: "published",
                },
                {
                  label: "Total Fields",
                  value: stats.fields,
                  sub: "Across all lists",
                  accent: "info.main",
                  icon: <CheckBoxIcon />,
                },
                // {
                //   label: "Draft / Pending",
                //   value: stats.pending,
                //   sub: "Awaiting action",
                //   accent: "warning.main",
                //   icon: <PendingIcon />,
                // },
              ].map((s, index, cards) => (
                <Box
                  key={s.label}
                  sx={{
                    minWidth: 0,
                    gridColumn: {
                      xs:
                        cards.length % 2 === 1 && index === cards.length - 1
                          ? "1 / -1"
                          : "auto",
                      md: "auto",
                    },
                  }}
                >
                    <StatCard
                      {...s}
                      loading={listLoading}
                      active={
                        s.filterStatus !== undefined &&
                        (s.filterStatus === ""
                          ? !listStatFilter &&
                            (!listFilters.status || listFilters.status === "all")
                          : listStatFilter === s.filterStatus ||
                            (!listStatFilter && listFilters.status === s.filterStatus))
                      }
                    onClick={
                      s.filterStatus !== undefined
                        ? () => handleChecklistStatClick(s.filterStatus)
                        : undefined
                    }
                  />
                </Box>
              ))}
            </Box>
          )}
          {tab === 1 && (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "repeat(2, minmax(0, 1fr))",
                  md: "repeat(4, minmax(0, 1fr))",
                },
                gap: 2,
                mb: 3,
              }}
            >
              {[
                {
                  label: "Total Requests",
                  value: reqStats.total,
                  sub: "All requests",
                  accent: "primary.main",
                  icon: <RequestPageIcon />,
                  filterStatus: "",
                },
                {
                  label: "Pending",
                  value: reqStats.pending,
                  sub: "Awaiting review",
                  accent: "warning.main",
                  icon: <PendingIcon />,
                  filterStatus: "pending",
                },
                {
                  label: "Approved",
                  value: reqStats.approved,
                  sub: "Completed",
                  accent: "success.main",
                  icon: <CheckCircleIcon />,
                  filterStatus: "approved",
                },
                {
                  label: "Rejected",
                  value: reqStats.rejected,
                  sub: "Not approved",
                  accent: "error.main",
                  icon: <ErrorIcon />,
                  filterStatus: "rejected",
                },
              ].map((s) => (
                <Box key={s.label} sx={{ minWidth: 0 }}>
                  <StatCard
                    {...s}
                    loading={requestsLoading}
                    active={
                      s.filterStatus === ""
                        ? !requestStatFilter &&
                          (!requestsFilters.status || requestsFilters.status === "all")
                        : requestStatFilter === s.filterStatus ||
                          (!requestStatFilter && requestsFilters.status === s.filterStatus)
                    }
                    onClick={() => handleRequestStatClick(s.filterStatus)}
                  />
                </Box>
              ))}
            </Box>
          )}

          {/* Tabs */}
          <Paper
            sx={{
              mb: 2.5,
              p: 0.75,
              display: { xs: "flex", sm: "inline-flex" },
              width: { xs: "100%", sm: "fit-content" },
            }}
          >
            <Tabs
              value={tab}
              onChange={(_, v) => setTab(v)}
              sx={{
                width: { xs: "100%", sm: "auto" },
                minHeight: "auto",
                "& .MuiTabs-indicator": { display: "none" },
                "& .MuiTabs-flexContainer": {
                  width: { xs: "100%", sm: "auto" },
                  gap: { xs: 0.75, sm: 0 },
                },
              }}
            >
              <StyledTab
                label={
                  <Stack direction="row" spacing={0.75} alignItems="center">
                    <ArticleIcon sx={{ fontSize: 16 }} />
                    <span>Checklists</span>
                    {!listLoading && (
                      <Chip
                        label={listPagination.total ?? checklists.length}
                        size="small"
                        sx={{
                          height: 18,
                          fontSize: 10,
                          ml: 0.5,
                          bgcolor:
                            tab === 0
                              ? alpha("#000", 0.2)
                              : alpha(theme.palette.primary.main, 0.16),
                          color:
                            tab === 0
                              ? theme.palette.primary.contrastText
                              : "primary.main",
                        }}
                      />
                    )}
                  </Stack>
                }
              />
              <StyledTab
                label={
                  <Stack direction="row" spacing={0.75} alignItems="center">
                    <RequestPageIcon sx={{ fontSize: 16 }} />
                    <span>Requests</span>
                    {!requestsLoading && (
                      <Chip
                        label={requestsPagination.total ?? requests.length}
                        size="small"
                        sx={{
                          height: 18,
                          fontSize: 10,
                          ml: 0.5,
                          bgcolor:
                            tab === 1
                              ? alpha("#000", 0.2)
                              : alpha(theme.palette.primary.main, 0.16),
                          color:
                            tab === 1
                              ? theme.palette.primary.contrastText
                              : "primary.main",
                        }}
                      />
                    )}
                  </Stack>
                }
              />
            </Tabs>
          </Paper>

          {/* Table Container */}
          <Paper
            sx={{
              overflow: "hidden",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            {/* Tab 0: Checklists */}
            {tab === 0 && (
              <>
                <Box
                  sx={{
                    p: { xs: 1.5, sm: 2 },
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    display: "flex",
                    gap: 1.5,
                    flexWrap: "wrap",
                    alignItems: "center",
                    bgcolor:
                      theme.palette.mode === "light"
                        ? "#ffffff"
                        : "background.default",
                  }}
                >
                  <AssetSearchField
                    placeholder="Search checklists..."
                    value={listFilters.search}
                    onChange={(e) => updateListFilter("search", e.target.value)}
                    onClear={() => updateListFilter("search", "")}
                    sx={{ width: { xs: "100%", sm: 735 } }}
                  />
                  {!isMobile && (
                    <>
                      <FormControl size="small" sx={{ minWidth: 130 }}>
                        <InputLabel>Status</InputLabel>
                        <Select
                          value={listFilters.status}
                          onChange={(e) =>
                            updateListFilter("status", e.target.value)
                          }
                          label="Status"
                        >
                          <MenuItem value="">All Status</MenuItem>
                          <MenuItem value="published">Published</MenuItem>
                          <MenuItem value="draft">Draft</MenuItem>
                          <MenuItem value="archived">Archived</MenuItem>
                          <MenuItem value="pending">Pending</MenuItem>
                        </Select>
                      </FormControl>
                      <FormControl size="small" sx={{ minWidth: 130 }}>
                        <InputLabel>Type</InputLabel>
                        <Select
                          value={listFilters.checklistType}
                          onChange={(e) =>
                            updateListFilter("checklistType", e.target.value)
                          }
                          label="Type"
                        >
                          <MenuItem value="">All Types</MenuItem>
                          <MenuItem value="custom">Custom</MenuItem>
                          <MenuItem value="global">Global</MenuItem>
                          <MenuItem value="import">Imported</MenuItem>
                        </Select>
                      </FormControl>
                    </>
                  )}
                  {isMobile && (
                    <IconButton
                      size="small"
                      onClick={() => setMobileDrawerOpen(true)}
                    >
                      <MenuIcon />
                    </IconButton>
                  )}
                  <Tooltip title="Refresh">
                    <IconButton
                      size="small"
                      onClick={fetchChecklists}
                      disabled={listLoading}
                    >
                      <RefreshIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Typography
                    variant="caption"
                    color="text.disabled"
                    sx={{ ml: "auto", fontSize: { xs: 10, sm: 11 } }}
                  >
                    {listPagination.total ?? checklists.length} result
                    {(listPagination.total ?? checklists.length) !== 1
                      ? "s"
                      : ""}
                  </Typography>
                </Box>

                {isMobile ? (
                  <Box sx={{ p: 2, pb: { xs: 3, sm: 2 } }}>
                    {listLoading ? (
                      [...Array(3)].map((_, i) => (
                        <Skeleton
                          key={i}
                          variant="rounded"
                          height={120}
                          sx={{ mb: 1.5 }}
                        />
                      ))
                    ) : checklists.length === 0 ? (
                      <EmptyState
                        message="No checklists found"
                        sub="Create your first checklist to get started"
                      />
                    ) : (
                      checklists.map((row) => (
                        <MobileChecklistCard
                          key={row._id}
                          row={row}
                          onView={openViewChecklist}
                          onAssign={openAssign}
                          onDelete={handleDeleteClick}
                          onClone={openCloneModal}
                          isAdmin={isAdmin || isSuperAdmin}
                        />
                      ))
                    )}
                  </Box>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          {[
                            "Name",
                            "Type",
                            "Category",
                            "Fields",
                            "Version",
                            "Status",
                            "Created",
                            "Actions",
                          ].map((h) => (
                            <TH key={h}>{h}</TH>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {listLoading &&
                          [...Array(5)].map((_, i) => (
                            <TableRow key={i}>
                              {[...Array(8)].map((__, j) => (
                                <TD key={j}>
                                  <Skeleton height={20} />
                                </TD>
                              ))}
                            </TableRow>
                          ))}
                        {!listLoading &&
                          checklists.map((row) => (
                            <TableRow
                              key={row._id}
                              hover
                              sx={{
                                "&:hover": {
                                  bgcolor: alpha(
                                    theme.palette.primary.main,
                                    0.06,
                                  ),
                                },
                              }}
                            >
                              <TD>
                                <Typography fontWeight={700} variant="body2">
                                  {row.name}
                                </Typography>
                                {row.description && (
                                  <Typography
                                    variant="caption"
                                    color="text.disabled"
                                    noWrap
                                    sx={{ maxWidth: 200, display: "block" }}
                                  >
                                    {row.description}
                                  </Typography>
                                )}
                              </TD>
                              <TD>
                                <TypeBadge type={row.checklistType} />
                              </TD>
                              <TD>
                                {row.category ? (
                                  <Chip
                                    label={row.category}
                                    size="small"
                                    variant="outlined"
                                    sx={{ height: 22, fontSize: 11 }}
                                  />
                                ) : (
                                  <Typography
                                    variant="caption"
                                    color="text.disabled"
                                  >
                                    —
                                  </Typography>
                                )}
                              </TD>
                              <TD>
                                <Chip
                                  label={
                                    row.totalFields ?? row.fields?.length ?? 0
                                  }
                                  size="small"
                                  sx={{
                                    bgcolor: alpha(
                                      theme.palette.primary.main,
                                      0.16,
                                    ),
                                    color: "primary.main",
                                    fontWeight: 700,
                                  }}
                                />
                              </TD>
                              <TD>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  v{row.version || 1}
                                </Typography>
                              </TD>
                              <TD>
                                <StatusBadge status={row.status} />
                              </TD>
                              <TD>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {fmt(row.createdAt)}
                                </Typography>
                              </TD>
                              <TD>
                                <IconButton
                                  size="small"
                                  onClick={(e) => openActionMenu(e, row)}
                                  sx={{ border: "1px solid", borderColor: "divider" }}
                                >
                                  <MoreVertIcon fontSize="small" />
                                </IconButton>
                              </TD>
                            </TableRow>
                          ))}
                        {!listLoading && checklists.length === 0 && (
                          <TableRow>
                            <TD colSpan={8} align="center" sx={{ py: 6 }}>
                              <EmptyState
                                message="No checklists found"
                                sub="Create your first checklist to get started"
                                icon={
                                  <ArticleIcon
                                    sx={{
                                      fontSize: 32,
                                      color: "primary.main",
                                      opacity: 0.5,
                                    }}
                                  />
                                }
                              />
                            </TD>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}

                {/* Three-dot action menu (Checklists tab) */}
                <Menu
                  anchorEl={actionMenuAnchor}
                  open={Boolean(actionMenuAnchor)}
                  onClose={closeActionMenu}
                  PaperProps={{
                    sx: {
                      borderRadius: 2,
                      minWidth: 170,
                      border: "1px solid",
                      borderColor: "divider",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                    },
                  }}
                >
                  <MenuItem
                    onClick={() => {
                      openViewChecklist(actionMenuRow);
                      closeActionMenu();
                    }}
                  >
                    <ListItemIcon>
                      <VisibilityIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primaryTypographyProps={{ fontSize: 13 }}>
                      View
                    </ListItemText>
                  </MenuItem>

                  <MenuItem
                    onClick={() => {
                      openCloneModal(actionMenuRow);
                      closeActionMenu();
                    }}
                  >
                    <ListItemIcon>
                      <ContentCopyIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primaryTypographyProps={{ fontSize: 13 }}>
                      Clone
                    </ListItemText>
                  </MenuItem>

                  {(isSuperAdmin || isAdmin) && (
                    <MenuItem
                      onClick={() => {
                        openAssign(actionMenuRow);
                        closeActionMenu();
                      }}
                    >
                      <ListItemIcon>
                        <AssignmentIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primaryTypographyProps={{ fontSize: 13 }}>
                        Assign
                      </ListItemText>
                    </MenuItem>
                  )}

                  {(isSuperAdmin || isAdmin) && (
                    <MenuItem
                      onClick={() => {
                        handleDeleteClick(actionMenuRow);
                        closeActionMenu();
                      }}
                      sx={{ color: "error.main" }}
                    >
                      <ListItemIcon>
                        <DeleteIcon fontSize="small" color="error" />
                      </ListItemIcon>
                      <ListItemText primaryTypographyProps={{ fontSize: 13 }}>
                        Delete
                      </ListItemText>
                    </MenuItem>
                  )}
                </Menu>

                <PaginationComponent
                  pagination={listPagination}
                  onPageChange={(p) =>
                    setListFilters((f) => ({ ...f, page: p }))
                  }
                />
              </>
            )}

            {/* Tab 1: Requests */}
            {tab === 1 && (
              <>
                <Box
                  sx={{
                    p: { xs: 1.5, sm: 2 },
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    display: "flex",
                    gap: 1.5,
                    flexWrap: "wrap",
                    alignItems: "center",
                    bgcolor:
                      theme.palette.mode === "light"
                        ? "#ffffff"
                        : "background.default",
                  }}
                >
                  <AssetSearchField
                    placeholder="Search requests..."
                    value={requestsFilters.search}
                    onChange={(e) => updateReqFilter("search", e.target.value)}
                    onClear={() => updateReqFilter("search", "")}
                    sx={{ width: { xs: "100%", sm: 620 } }}
                  />
                  {!isMobile && (
                    <>
                      <FormControl size="small" sx={{ minWidth: 130 }}>
                        <InputLabel>Status</InputLabel>
                        <Select
                          value={requestsFilters.status}
                          onChange={(e) =>
                            updateReqFilter("status", e.target.value)
                          }
                          label="Status"
                        >
                          <MenuItem value="">All Status</MenuItem>
                          <MenuItem value="pending">Pending</MenuItem>
                          <MenuItem value="approved">Approved</MenuItem>
                          <MenuItem value="rejected">Rejected</MenuItem>
                          <MenuItem value="under_review">Under Review</MenuItem>
                          <MenuItem value="in_progress">In Progress</MenuItem>
                        </Select>
                      </FormControl>
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>Urgency</InputLabel>
                        <Select
                          value={requestsFilters.urgencyLevel}
                          onChange={(e) =>
                            updateReqFilter("urgencyLevel", e.target.value)
                          }
                          label="Urgency"
                        >
                          <MenuItem value="">All</MenuItem>
                          <MenuItem value="low">Low</MenuItem>
                          <MenuItem value="medium">Medium</MenuItem>
                          <MenuItem value="high">High</MenuItem>
                          <MenuItem value="critical">Critical</MenuItem>
                        </Select>
                      </FormControl>
                    </>
                  )}
                  {isSuperAdmin && (
                    <FormControlLabel
                      control={
                        <Switch
                          size="small"
                          checked={showDeleted}
                          onChange={(e) => {
                            setShowDeleted(e.target.checked);
                            setRequestsFilters((f) => ({ ...f, page: 1 }));
                          }}
                        />
                      }
                      label={
                        <Typography variant="caption" fontWeight={600}>
                          Show Deleted
                        </Typography>
                      }
                    />
                  )}
                  {isMobile && (
                    <IconButton
                      size="small"
                      onClick={() => setMobileDrawerOpen(true)}
                    >
                      <MenuIcon />
                    </IconButton>
                  )}
                  <Tooltip title="Refresh">
                    <IconButton
                      size="small"
                      onClick={fetchRequests}
                      disabled={requestsLoading}
                    >
                      <RefreshIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Typography
                    variant="caption"
                    color="text.disabled"
                    sx={{ ml: "auto", fontSize: { xs: 10, sm: 11 } }}
                  >
                    {requestsPagination.total ?? requests.length} result
                    {(requestsPagination.total ?? requests.length) !== 1
                      ? "s"
                      : ""}
                  </Typography>
                </Box>

                {isMobile ? (
                  <Box sx={{ p: 2, pb: { xs: 3, sm: 2 } }}>
                    {requestsLoading ? (
                      [...Array(3)].map((_, i) => (
                        <Skeleton
                          key={i}
                          variant="rounded"
                          height={140}
                          sx={{ mb: 1.5 }}
                        />
                      ))
                    ) : requests.length === 0 ? (
                      <EmptyState
                        message="No requests found"
                        sub='Click "Request" to submit your first request'
                      />
                    ) : (
                      requests.map((row) => (
                        <MobileRequestCard
                          key={row._id}
                          row={row}
                          onView={openViewRequest}
                          onDelete={handleRequestDeleteClick}
                          isSuperAdmin={isSuperAdmin}
                        />
                      ))
                    )}
                  </Box>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          {[
                            "Checklist Name",
                            "Category",
                            "Urgency",
                            "Status",
                            "Submitted",
                            ...(isSuperAdmin ? ["Requested By"] : []),
                            "Actions",
                          ].map((h) => (
                            <TH key={h}>{h}</TH>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {requestsLoading &&
                          [...Array(5)].map((_, i) => (
                            <TableRow key={i}>
                              {[...Array(7)].map((__, j) => (
                                <TD key={j}>
                                  <Skeleton height={20} />
                                </TD>
                              ))}
                            </TableRow>
                          ))}
                        {!requestsLoading &&
                          requests.map((row) => (
                            <TableRow
                              key={row._id}
                              hover
                              sx={{
                                "&:hover": {
                                  bgcolor: alpha(
                                    theme.palette.primary.main,
                                    0.06,
                                  ),
                                },
                                opacity: row.isDeleted ? 0.6 : 1,
                              }}
                            >
                              <TD>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                  }}
                                >
                                  {row.isDeleted && (
                                    <Chip
                                      label="Deleted"
                                      size="small"
                                      color="error"
                                      sx={{ height: 18, fontSize: 10 }}
                                    />
                                  )}
                                  <Box>
                                    <Typography
                                      fontWeight={700}
                                      variant="body2"
                                    >
                                      {row.checklistName}
                                    </Typography>
                                    {row.message && (
                                      <Typography
                                        variant="caption"
                                        color="text.disabled"
                                        noWrap
                                        sx={{ maxWidth: 180, display: "block" }}
                                      >
                                        {row.message}
                                      </Typography>
                                    )}
                                  </Box>
                                </Box>
                              </TD>
                              <TD>
                                {row.category ? (
                                  <Chip
                                    label={row.category}
                                    size="small"
                                    variant="outlined"
                                    sx={{ height: 22, fontSize: 11 }}
                                  />
                                ) : (
                                  <Typography
                                    variant="caption"
                                    color="text.disabled"
                                  >
                                    —
                                  </Typography>
                                )}
                              </TD>
                              <TD>
                                <PriorityBadge priority={row.urgencyLevel} />
                              </TD>
                              <TD>
                                <StatusBadge status={row.status} />
                              </TD>
                              <TD>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {fmt(row.requestDate || row.createdAt)}
                                </Typography>
                              </TD>
                              {isSuperAdmin && (
                                <TD>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    {row.requestedByName ||
                                      row.requestedBy?.email ||
                                      "—"}
                                  </Typography>
                                </TD>
                              )}
                              <TD>
                                <Stack direction="row" spacing={0.75}>
                                  <Tooltip title="View">
                                    <IconButton
                                      size="small"
                                      onClick={() => openViewRequest(row)}
                                      disabled={loadingView}
                                      sx={{
                                        border: "1px solid",
                                        borderColor: "divider",
                                      }}
                                    >
                                      <VisibilityIcon sx={{ fontSize: 16 }} />
                                    </IconButton>
                                  </Tooltip>
                                  {(isSuperAdmin || isAdmin) &&
                                    !row.isDeleted && (
                                      <Tooltip title="Delete">
                                        <IconButton
                                          size="small"
                                          color="error"
                                          onClick={() => handleRequestDeleteClick(row)}
                                          sx={{
                                            border: "1px solid",
                                            borderColor: "error.light",
                                          }}
                                        >
                                          <DeleteIcon sx={{ fontSize: 16 }} />
                                        </IconButton>
                                      </Tooltip>
                                    )}
                                </Stack>
                              </TD>
                            </TableRow>
                          ))}
                        {!requestsLoading && requests.length === 0 && (
                          <TableRow>
                            <TD colSpan={7} align="center" sx={{ py: 6 }}>
                              <EmptyState
                                message="No requests found"
                                sub='Click "Request" to submit your first request'
                                icon={
                                  <RequestPageIcon
                                    sx={{
                                      fontSize: 32,
                                      color: "primary.main",
                                      opacity: 0.5,
                                    }}
                                  />
                                }
                              />
                            </TD>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
                <PaginationComponent
                  pagination={requestsPagination}
                  onPageChange={(p) =>
                    setRequestsFilters((f) => ({ ...f, page: p }))
                  }
                />
              </>
            )}
          </Paper>
        </Container>

        {/* Mobile Filter Drawer */}
        <Drawer
          anchor="right"
          open={mobileDrawerOpen}
          onClose={() => setMobileDrawerOpen(false)}
        >
          {mobileFilters}
        </Drawer>

        {/* Modals */}
        <CreateModal open={createOpen} onClose={() => setCreateOpen(false)} />
        {canCreateRequests && (
          <RequestChecklistModal
            open={requestOpen}
            onClose={() => setRequestOpen(false)}
            onSuccess={() => {
              showSnack("Checklist request submitted successfully!");
              setTab(1);
              fetchRequests();
            }}
          />
        )}
        <AssignmentModal
          open={assignModalOpen}
          onClose={() => {
            setAssignModalOpen(false);
            setSelectedChecklist(null);
          }}
          onSuccess={handleAssignSuccess}
          mode="assign"
          preselectedChecklist={selectedChecklist}
        />
        <ViewChecklistModal
          open={!!viewChecklist}
          onClose={() => setViewChecklist(null)}
          checklist={viewChecklist}
          userRole={userRole}
          onDelete={handleDeleteClick}
        />

        {/* Clone Dialog */}
        <CloneDialog
          open={cloneModalOpen}
          checklist={selectedCloneChecklist}
          onClose={() => {
            setCloneModalOpen(false);
            setSelectedCloneChecklist(null);
          }}
          onConfirm={handleCloneConfirm}
          loading={cloneLoading}
        />

        {/* ── View Request Dialog (Redesigned) ── */}
        <Dialog
          open={!!viewRequest}
          onClose={() => setViewRequest(null)}
          maxWidth="md"
          fullWidth
          fullScreen={isMobile}
          PaperProps={{
            sx: {
              borderRadius: { xs: 0, sm: "20px" },
              m: { xs: 0, sm: 2 },
              width: { xs: "100%", sm: "calc(100% - 32px)" },
              maxWidth: { xs: "none", sm: 840 },
              height: { xs: "100dvh", sm: "auto" },
              maxHeight: { xs: "100dvh", sm: "calc(100% - 64px)" },
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.35)",
              border: (t) =>
                t.palette.mode === "dark"
                  ? "1px solid rgba(148, 163, 184, 0.15)"
                  : "1px solid rgba(226, 232, 240, 0.8)",
            },
          }}
          BackdropProps={{
            sx: {
              backgroundColor: "rgba(15, 23, 42, 0.65)",
              backdropFilter: "blur(6px)",
            },
          }}
        >
          {/* ── Dark Navy Executive Header ── */}
          <Box
            sx={{
              background: "linear-gradient(135deg, #092c3e 0%, #104661 100%)",
              color: "#ffffff",
              p: { xs: 2.2, sm: 2.8 },
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 2,
              position: "relative",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.8, minWidth: 0, flex: 1 }}>
              <Avatar
                sx={{
                  bgcolor: "rgba(255, 255, 255, 0.12)",
                  color: "#ffffff",
                  width: { xs: 42, sm: 48 },
                  height: { xs: 42, sm: 48 },
                  borderRadius: "14px",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                }}
              >
                <AssignmentIcon sx={{ fontSize: { xs: 22, sm: 26 } }} />
              </Avatar>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", mb: 0.5 }}>
                  <Typography
                    sx={{
                      fontWeight: 800,
                      fontSize: { xs: "1.1rem", sm: "1.3rem" },
                      letterSpacing: "-0.01em",
                      color: "#ffffff",
                      lineHeight: 1.25,
                      wordBreak: "break-word",
                    }}
                  >
                    {viewRequest?.checklistName || "Checklist Request"}
                  </Typography>
                  <StatusBadge status={viewRequest?.status} />
                </Box>
                <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" sx={{ gap: 0.75 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "rgba(255, 255, 255, 0.75)",
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      fontWeight: 500,
                    }}
                  >
                    <CalendarTodayIcon sx={{ fontSize: 13, opacity: 0.8 }} />
                    Submitted {fmt(viewRequest?.requestDate || viewRequest?.createdAt)}
                  </Typography>
                  {(viewRequest?.requestedByName || viewRequest?.requestedBy?.firstName || viewRequest?.requestedBy?.email) && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: "rgba(255, 255, 255, 0.75)",
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        fontWeight: 500,
                      }}
                    >
                      • By{" "}
                      <Box component="span" sx={{ color: "#ffffff", fontWeight: 700 }}>
                        {viewRequest.requestedByName ||
                          `${viewRequest.requestedBy?.firstName || ""} ${viewRequest.requestedBy?.lastName || ""}`.trim() ||
                          viewRequest.requestedBy?.email}
                      </Box>
                    </Typography>
                  )}
                </Stack>
              </Box>
            </Box>
            <IconButton
              onClick={() => setViewRequest(null)}
              size="small"
              sx={{
                color: "#ffffff",
                bgcolor: "rgba(255, 255, 255, 0.12)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: "10px",
                width: 36,
                height: 36,
                "&:hover": {
                  bgcolor: "rgba(255, 255, 255, 0.22)",
                  transform: "scale(1.05)",
                },
                transition: "all 0.2s ease",
              }}
            >
              <CloseIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>

          {/* ── Dialog Content ── */}
          <DialogContent
            sx={{
              p: { xs: 2, sm: 3 },
              flex: 1,
              overflowY: "auto",
              bgcolor: (t) => (t.palette.mode === "dark" ? "#0b1420" : "#f8fafc"),
            }}
          >
            <Stack spacing={2.5}>
              {/* ── 4 Key Info Metric Cards ── */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "repeat(2, minmax(0, 1fr))",
                    sm: "repeat(4, minmax(0, 1fr))",
                  },
                  gap: 1.5,
                  width: "100%",
                }}
              >
                {[
                  {
                    label: "Status",
                    icon: <PendingIcon sx={{ fontSize: 16, color: "#d97706" }} />,
                    iconBg: alpha("#f59e0b", 0.12),
                    content: <StatusBadge status={viewRequest?.status} />,
                  },
                  {
                    label: "Urgency",
                    icon: <SpeedIcon sx={{ fontSize: 16, color: "#0284c7" }} />,
                    iconBg: alpha("#0284c7", 0.12),
                    content: <PriorityBadge priority={viewRequest?.urgencyLevel} />,
                  },
                  {
                    label: "Category",
                    icon: <FolderSpecialIcon sx={{ fontSize: 16, color: "#10b981" }} />,
                    iconBg: alpha("#10b981", 0.12),
                    content: (
                      <Typography
                        variant="body2"
                        fontWeight={700}
                        sx={{
                          color: (t) => t.palette.text.primary,
                          fontSize: "0.875rem",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {viewRequest?.category || "—"}
                      </Typography>
                    ),
                  },
                  {
                    label: "Usage Frequency",
                    icon: <RepeatIcon sx={{ fontSize: 16, color: "#8b5cf6" }} />,
                    iconBg: alpha("#8b5cf6", 0.12),
                    content: (
                      <Typography
                        variant="body2"
                        fontWeight={700}
                        sx={{
                          color: (t) => t.palette.text.primary,
                          fontSize: "0.875rem",
                          textTransform: "capitalize",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {String(viewRequest?.expectedUsageFrequency || "—").replace(/_/g, " ")}
                      </Typography>
                    ),
                  },
                ].map(({ label, icon, iconBg, content }) => (
                  <Paper
                    key={label}
                    elevation={0}
                    sx={{
                      p: 1.8,
                      borderRadius: "14px",
                      bgcolor: (t) => (t.palette.mode === "dark" ? "#111c2e" : "#ffffff"),
                      border: "1px solid",
                      borderColor: (t) =>
                        t.palette.mode === "dark"
                          ? "rgba(148, 163, 184, 0.14)"
                          : "rgba(226, 232, 240, 0.9)",
                      boxShadow: (t) =>
                        t.palette.mode === "dark"
                          ? "0 2px 8px rgba(0,0,0,0.2)"
                          : "0 2px 8px rgba(15, 23, 42, 0.04)",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      minHeight: 88,
                      transition: "transform 0.2s ease, box-shadow 0.2s ease",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: (t) =>
                          t.palette.mode === "dark"
                            ? "0 6px 16px rgba(0,0,0,0.3)"
                            : "0 6px 16px rgba(15, 23, 42, 0.08)",
                      },
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                      <Typography
                        variant="caption"
                        fontWeight={700}
                        sx={{
                          fontSize: "0.7rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          color: "text.secondary",
                        }}
                      >
                        {label}
                      </Typography>
                      <Box
                        sx={{
                          width: 28,
                          height: 28,
                          borderRadius: "8px",
                          bgcolor: iconBg,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {icon}
                      </Box>
                    </Box>
                    <Box sx={{ mt: "auto" }}>{content}</Box>
                  </Paper>
                ))}
              </Box>

              {/* ── Requester Banner (if team members or role present) ── */}
              {(viewRequest?.numberOfTeamMembers > 1 || viewRequest?.requestedByRole) && (
                <Paper
                  elevation={0}
                  sx={{
                    px: 2,
                    py: 1.4,
                    borderRadius: "12px",
                    bgcolor: (t) => (t.palette.mode === "dark" ? alpha("#0284c7", 0.08) : "#f0f9ff"),
                    border: "1px solid",
                    borderColor: (t) => (t.palette.mode === "dark" ? alpha("#0284c7", 0.2) : "#bae6fd"),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 1.5,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <PersonIcon sx={{ fontSize: 18, color: "#0284c7" }} />
                    <Typography variant="body2" sx={{ fontWeight: 600, color: "#0369a1" }}>
                      Target Scope:{" "}
                      <Box component="span" sx={{ fontWeight: 700, color: (t) => t.palette.text.primary }}>
                        {viewRequest.numberOfTeamMembers || 1} Team Member{(viewRequest.numberOfTeamMembers || 1) > 1 ? "s" : ""}
                      </Box>
                    </Typography>
                  </Box>
                  {viewRequest?.requestedByRole && (
                    <Chip
                      size="small"
                      label={`Role: ${viewRequest.requestedByRole}`}
                      sx={{
                        height: 22,
                        fontSize: "0.68rem",
                        fontWeight: 700,
                        textTransform: "capitalize",
                        bgcolor: alpha("#0284c7", 0.12),
                        color: "#0284c7",
                      }}
                    />
                  )}
                </Paper>
              )}

              {/* ── Detailed Description Section ── */}
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: "6px",
                      bgcolor: alpha("#084d68", 0.1),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#084d68",
                    }}
                  >
                    <DescriptionIcon sx={{ fontSize: 14 }} />
                  </Box>
                  <Typography
                    variant="caption"
                    fontWeight={800}
                    sx={{
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.07em",
                      color: "text.primary",
                    }}
                  >
                    Detailed Description
                  </Typography>
                </Box>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.2,
                    borderRadius: "14px",
                    bgcolor: (t) => (t.palette.mode === "dark" ? "#111c2e" : "#ffffff"),
                    border: "1px solid",
                    borderColor: (t) =>
                      t.palette.mode === "dark"
                        ? "rgba(148, 163, 184, 0.14)"
                        : "rgba(226, 232, 240, 0.9)",
                    borderLeft: "4px solid #084d68",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      lineHeight: 1.8,
                      whiteSpace: "pre-wrap",
                      color: (t) => (t.palette.mode === "dark" ? "#cbd5e1" : "#334155"),
                      fontSize: "0.875rem",
                    }}
                  >
                    {viewRequest?.detailedDescription || "No detailed description provided."}
                  </Typography>
                </Paper>
              </Box>

              {/* ── Business Justification Section ── */}
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: "6px",
                      bgcolor: alpha("#10b981", 0.1),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#10b981",
                    }}
                  >
                    <TrendingUpIcon sx={{ fontSize: 14 }} />
                  </Box>
                  <Typography
                    variant="caption"
                    fontWeight={800}
                    sx={{
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.07em",
                      color: "text.primary",
                    }}
                  >
                    Business Justification
                  </Typography>
                </Box>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.2,
                    borderRadius: "14px",
                    bgcolor: (t) => (t.palette.mode === "dark" ? "#111c2e" : "#ffffff"),
                    border: "1px solid",
                    borderColor: (t) =>
                      t.palette.mode === "dark"
                        ? "rgba(148, 163, 184, 0.14)"
                        : "rgba(226, 232, 240, 0.9)",
                    borderLeft: "4px solid #10b981",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      lineHeight: 1.8,
                      whiteSpace: "pre-wrap",
                      color: (t) => (t.palette.mode === "dark" ? "#cbd5e1" : "#334155"),
                      fontSize: "0.875rem",
                    }}
                  >
                    {viewRequest?.businessJustification || "No business justification provided."}
                  </Typography>
                </Paper>
              </Box>

              {/* ── Additional Notes (if present) ── */}
              {viewRequest?.additionalNotes && (
                <Box>
                  <Typography
                    variant="caption"
                    fontWeight={800}
                    sx={{
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.07em",
                      color: "text.primary",
                      mb: 1,
                      display: "block",
                    }}
                  >
                    Additional Notes
                  </Typography>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: "14px",
                      bgcolor: (t) => (t.palette.mode === "dark" ? "#111c2e" : "#ffffff"),
                      border: "1px solid",
                      borderColor: (t) =>
                        t.palette.mode === "dark"
                          ? "rgba(148, 163, 184, 0.14)"
                          : "rgba(226, 232, 240, 0.9)",
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ lineHeight: 1.7, color: "text.secondary", fontSize: "0.875rem" }}
                    >
                      {viewRequest.additionalNotes}
                    </Typography>
                  </Paper>
                </Box>
              )}

              {/* ── Reference Files (if present) ── */}
              {Array.isArray(viewRequest?.referenceFiles) && viewRequest.referenceFiles.length > 0 && (
                <Box>
                  <Typography
                    variant="caption"
                    fontWeight={800}
                    sx={{
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.07em",
                      color: "text.primary",
                      mb: 1,
                      display: "block",
                    }}
                  >
                    Attached Files ({viewRequest.referenceFiles.length})
                  </Typography>
                  <Stack spacing={1}>
                    {viewRequest.referenceFiles.map((file, idx) => (
                      <Paper
                        key={idx}
                        elevation={0}
                        sx={{
                          p: 1.4,
                          px: 2,
                          borderRadius: "10px",
                          bgcolor: (t) => (t.palette.mode === "dark" ? "#111c2e" : "#ffffff"),
                          border: "1px solid",
                          borderColor: (t) =>
                            t.palette.mode === "dark"
                              ? "rgba(148, 163, 184, 0.14)"
                              : "rgba(226, 232, 240, 0.9)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                          <FileIcon sx={{ fontSize: 20, color: "#084d68" }} />
                          <Box>
                            <Typography variant="body2" fontWeight={600} sx={{ fontSize: "0.825rem" }}>
                              {file.originalName || `Attachment ${idx + 1}`}
                            </Typography>
                            {file.sizeBytes && (
                              <Typography variant="caption" color="text.secondary">
                                {(file.sizeBytes / 1024).toFixed(1)} KB
                              </Typography>
                            )}
                          </Box>
                        </Box>
                        {file.filePath && (
                          <Button
                            size="small"
                            variant="outlined"
                            component="a"
                            href={file.filePath}
                            target="_blank"
                            rel="noopener noreferrer"
                            startIcon={<DownloadIcon sx={{ fontSize: 14 }} />}
                            sx={{
                              borderRadius: "8px",
                              textTransform: "none",
                              fontSize: "0.75rem",
                              py: 0.4,
                            }}
                          >
                            View / Download
                          </Button>
                        )}
                      </Paper>
                    ))}
                  </Stack>
                </Box>
              )}

              {/* ── Status Alerts (Rejected / Approved) ── */}
              {viewRequest?.status === "rejected" && viewRequest?.rejectionReason && (
                <Alert
                  severity="error"
                  variant="outlined"
                  sx={{
                    borderRadius: "14px",
                    bgcolor: (t) => (t.palette.mode === "dark" ? alpha("#ef4444", 0.08) : "#fef2f2"),
                    borderColor: alpha("#ef4444", 0.3),
                    p: 2,
                  }}
                >
                  <Typography variant="subtitle2" fontWeight={800} sx={{ color: "#b91c1c", mb: 0.5 }}>
                    Request Rejected
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#7f1d1d", lineHeight: 1.6 }}>
                    {viewRequest.rejectionReason}
                  </Typography>
                  {viewRequest.reviewedByName && (
                    <Typography variant="caption" sx={{ color: "#991b1b", mt: 1, display: "block", fontWeight: 600 }}>
                      Reviewed by: {viewRequest.reviewedByName}{" "}
                      {viewRequest.reviewedAt ? `on ${fmt(viewRequest.reviewedAt)}` : ""}
                    </Typography>
                  )}
                </Alert>
              )}

              {viewRequest?.status === "approved" && (
                <Alert
                  severity="success"
                  variant="outlined"
                  sx={{
                    borderRadius: "14px",
                    bgcolor: (t) => (t.palette.mode === "dark" ? alpha("#10b981", 0.08) : "#f0fdf4"),
                    borderColor: alpha("#10b981", 0.3),
                    p: 2,
                  }}
                >
                  <Typography variant="subtitle2" fontWeight={800} sx={{ color: "#15803d", mb: 0.5 }}>
                    Request Approved
                  </Typography>
                  {viewRequest.reviewComments && (
                    <Typography variant="body2" sx={{ color: "#166534", lineHeight: 1.6 }}>
                      {viewRequest.reviewComments}
                    </Typography>
                  )}
                  {viewRequest.resultingChecklistName && (
                    <Typography variant="caption" sx={{ color: "#14532d", mt: 0.5, display: "block", fontWeight: 600 }}>
                      Resulting Checklist: {viewRequest.resultingChecklistName}
                    </Typography>
                  )}
                </Alert>
              )}
            </Stack>
          </DialogContent>

          {/* ── Footer Actions ── */}
          <DialogActions
            sx={{
              px: { xs: 2.2, sm: 3 },
              py: { xs: 1.8, sm: 2 },
              borderTop: "1px solid",
              borderColor: (t) =>
                t.palette.mode === "dark"
                  ? "rgba(148, 163, 184, 0.14)"
                  : "rgba(226, 232, 240, 0.9)",
              bgcolor: (t) => (t.palette.mode === "dark" ? "#0f172a" : "#ffffff"),
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 1.5,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Request ID:
              </Typography>
              <Chip
                label={viewRequest?._id ? `#${String(viewRequest._id).slice(-6)}` : "—"}
                size="small"
                sx={{
                  height: 22,
                  fontFamily: "monospace",
                  fontWeight: 700,
                  fontSize: "0.72rem",
                  bgcolor: (t) => (t.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "#f1f5f9"),
                }}
              />
            </Box>

            <Stack direction="row" spacing={1.5} alignItems="center">
              <Button
                onClick={() => setViewRequest(null)}
                variant="outlined"
                sx={{
                  borderRadius: "10px",
                  textTransform: "none",
                  fontWeight: 600,
                  px: 2.5,
                  py: 0.8,
                  borderColor: (t) =>
                    t.palette.mode === "dark" ? "rgba(148, 163, 184, 0.3)" : "#cbd5e1",
                  color: (t) => (t.palette.mode === "dark" ? "#cbd5e1" : "#475569"),
                  "&:hover": {
                    borderColor: (t) =>
                      t.palette.mode === "dark" ? "#cbd5e1" : "#94a3b8",
                    bgcolor: (t) =>
                      t.palette.mode === "dark" ? "rgba(255,255,255,0.05)" : "#f8fafc",
                  },
                }}
              >
                Close
              </Button>

              {isSuperAdmin &&
                !["approved", "rejected"].includes(viewRequest?.status) &&
                !viewRequest?.isDeleted && (
                  <Button
                    variant="contained"
                    startIcon={<CheckCircleIcon sx={{ fontSize: 18 }} />}
                    onClick={() => setReviewDialogOpen(true)}
                    sx={{
                      borderRadius: "10px",
                      textTransform: "none",
                      fontWeight: 700,
                      px: 3,
                      py: 0.8,
                      background: "linear-gradient(135deg, #084d68 0%, #0d6386 100%)",
                      boxShadow: "0 4px 14px rgba(8, 77, 104, 0.35)",
                      "&:hover": {
                        background: "linear-gradient(135deg, #063c52 0%, #084d68 100%)",
                        boxShadow: "0 6px 18px rgba(8, 77, 104, 0.45)",
                        transform: "translateY(-1px)",
                      },
                      transition: "all 0.2s ease",
                    }}
                  >
                    Review Request
                  </Button>
                )}
            </Stack>
          </DialogActions>
        </Dialog>

        <ReviewRequestDialog
          open={reviewDialogOpen}
          onClose={() => setReviewDialogOpen(false)}
          request={viewRequest}
          onReview={handleReviewRequest}
        />
        <DeleteConfirmDialog
          open={deleteDialogOpen}
          onClose={() => {
            if (!deleting) {
              setDeleteDialogOpen(false);
              setDeleteTarget(null);
            }
          }}
          onConfirm={handleDeleteConfirm}
          title="Delete Checklist"
          message={`Delete "${deleteTarget?.name}"? This action can be reversed from the admin panel.`}
          deleting={deleting}
        />

        <DeleteConfirmDialog
          open={requestDeleteDialogOpen}
          onClose={() => {
            if (!deleting) {
              setRequestDeleteDialogOpen(false);
              setRequestDeleteTarget(null);
            }
          }}
          onConfirm={handleRequestDeleteConfirm}
          title="Delete Request"
          message={`Delete "${requestDeleteTarget?.checklistName}" request? This action can be reversed from the admin panel.`}
          deleting={deleting}
        />

        <Snackbar
          open={snack.open}
          autoHideDuration={4000}
          onClose={() => setSnack((p) => ({ ...p, open: false }))}
  anchorOrigin={{ vertical: "top", horizontal: "right" }}>
          <Alert
            severity={snack.severity}
            onClose={() => setSnack((p) => ({ ...p, open: false }))}
            sx={{ borderRadius: 2, fontWeight: 600 }}
          >
            {snack.msg}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}

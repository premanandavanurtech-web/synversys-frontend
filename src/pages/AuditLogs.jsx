// pages/AuditLogs.jsx
// Only two APIs used:
//   GET /audit-logs          — all roles, backend filters by role
//   GET /audit-logs/statistics — super admin only
//
// npm deps: xlsx, jspdf, jspdf-autotable, date-fns, @mui/x-date-pickers

import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  IconButton,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Button,
  Stack,
  Tooltip,
  Dialog,
  DialogContent,
  CircularProgress,
  Alert,
  Snackbar,
  InputAdornment,
  useMediaQuery,
  useTheme,
  Divider,
  LinearProgress,
  Skeleton,
  alpha,
  Chip,
  Menu,
  ListItemIcon,
  ListItemText,
  Portal,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Event as EventIcon,
  TrendingUp as TrendingUpIcon,
  Today as TodayIcon,
  People as PeopleIcon,
  Category as CategoryIcon,
  Close as CloseIcon,
  History as HistoryIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  Create as CreateIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  ShieldOutlined as ShieldIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  TableChart as ExcelIcon,
  PictureAsPdf as PdfIcon,
  GridOn as CsvIcon,
  KeyboardArrowDown as ArrowDownIcon,
} from "@mui/icons-material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useAudit } from "../context/AuditContext";
import AssetSearchField from "../components/AssetSearchField";
import { format } from "date-fns";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/* ─── Design tokens (dark theme) ─── */
const DARK_AUDIT_TOKENS = {
  radius: "10px",
  radiusLg: "14px",
  border: "1px solid",
  borderColor: "#1c2e3a",
  cardBg: "#0f1e29",
  pageBg: "#0a1620",
  textPrimary: "#e7eef2",
  textSecondary: "#8ca0ac",
  textMuted: "#5c7280",
  accent: "#1fb6cf",
  accentDark: "#0d8ba1",
  accentContrast: "#04141a",
  hoverRow: alpha("#1fb6cf", 0.06),
  fontMono: "'JetBrains Mono', 'Fira Code', monospace",
};

const LIGHT_AUDIT_TOKENS = {
  radius: "10px",
  radiusLg: "14px",
  border: "1px solid",
  borderColor: "#d8e2e8",
  cardBg: "#ffffff",
  pageBg: "#f7fafc",
  textPrimary: "#102a36",
  textSecondary: "#526575",
  textMuted: "#7a8a99",
  accent: "#0f6f86",
  accentDark: "#0b5265",
  accentContrast: "#ffffff",
  hoverRow: alpha("#0f6f86", 0.06),
  fontMono: "'JetBrains Mono', 'Fira Code', monospace",
};

const T = { ...DARK_AUDIT_TOKENS };

const applyAuditThemeTokens = (mode) => {
  Object.assign(T, mode === "light" ? LIGHT_AUDIT_TOKENS : DARK_AUDIT_TOKENS);
};

/* ─── Shared chip geometry — keeps every badge in the table on the same rhythm ─── */
const CHIP_SX = {
  display: "inline-flex",
  alignItems: "center",
  px: "8px",
  py: "2px",
  borderRadius: "6px",
  fontSize: 10.5,
  fontWeight: 600,
  lineHeight: 1.6,
  whiteSpace: "nowrap",
};

const EMPTY_AUDIT_FILTERS = {
  action: "",
  resource: "",
  actorRole: "",
  status: "",
  startDate: null,
  endDate: null,
  search: "",
};

const getTodayAuditFilters = () => {
  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date();
  endDate.setHours(23, 59, 59, 999);

  return {
    ...EMPTY_AUDIT_FILTERS,
    startDate,
    endDate,
  };
};

const hasActiveAuditFilters = (filters = {}) =>
  Object.entries(EMPTY_AUDIT_FILTERS).some(([key]) => Boolean(filters[key]));

const humanize = (value = "") =>
  String(value || "")
    .replace(/[_-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

/* ─── Action config (accent colors kept vivid; bg is a translucent tint for dark surfaces) ─── */
const ACTION_CONFIG = {
  CREATE: {
    label: "Create",
    color: "#4ade80",
    bg: alpha("#4ade80", 0.16),
    icon: <CreateIcon sx={{ fontSize: 11 }} />,
  },
  UPDATE: {
    label: "Update",
    color: "#60a5fa",
    bg: alpha("#60a5fa", 0.16),
    icon: <EditIcon sx={{ fontSize: 11 }} />,
  },
  DELETE: {
    label: "Delete",
    color: "#f87171",
    bg: alpha("#f87171", 0.16),
    icon: <DeleteIcon sx={{ fontSize: 11 }} />,
  },
  SOFT_DELETE: {
    label: "Soft Del",
    color: "#fb923c",
    bg: alpha("#fb923c", 0.16),
    icon: <DeleteIcon sx={{ fontSize: 11 }} />,
  },
  LOGIN: {
    label: "Login",
    color: "#5cd3e6",
    bg: alpha("#5cd3e6", 0.16),
    icon: <LoginIcon sx={{ fontSize: 11 }} />,
  },
  LOGOUT: {
    label: "Logout",
    color: "#94a3b0",
    bg: alpha("#94a3b0", 0.14),
    icon: <LogoutIcon sx={{ fontSize: 11 }} />,
  },
  PASSWORD_CHANGE: {
    label: "Pwd Change",
    color: "#c084fc",
    bg: alpha("#c084fc", 0.16),
    icon: <HistoryIcon sx={{ fontSize: 11 }} />,
  },
  PASSWORD_RESET: {
    label: "Pwd Reset",
    color: "#c084fc",
    bg: alpha("#c084fc", 0.16),
    icon: <HistoryIcon sx={{ fontSize: 11 }} />,
  },
  STATUS_CHANGE: {
    label: "Status Chg",
    color: "#facc15",
    bg: alpha("#facc15", 0.16),
    icon: <CheckCircleIcon sx={{ fontSize: 11 }} />,
  },
  ASSET_CREATED: {
    label: "Asset Created",
    color: "#4ade80",
    bg: alpha("#4ade80", 0.16),
    icon: <CreateIcon sx={{ fontSize: 11 }} />,
  },
  ASSET_UPDATED: {
    label: "Asset Updated",
    color: "#60a5fa",
    bg: alpha("#60a5fa", 0.16),
    icon: <EditIcon sx={{ fontSize: 11 }} />,
  },
  ASSET_DELETED: {
    label: "Asset Deleted",
    color: "#f87171",
    bg: alpha("#f87171", 0.16),
    icon: <DeleteIcon sx={{ fontSize: 11 }} />,
  },
  ASSET_CLONED: {
    label: "Asset Cloned",
    color: "#818cf8",
    bg: alpha("#818cf8", 0.16),
    icon: <CreateIcon sx={{ fontSize: 11 }} />,
  },
  ASSET_STATUS_UPDATED: {
    label: "Asset Status",
    color: "#facc15",
    bg: alpha("#facc15", 0.16),
    icon: <CheckCircleIcon sx={{ fontSize: 11 }} />,
  },
  ASSET_REQUEST_CREATED: {
    label: "Asset Req",
    color: "#34d399",
    bg: alpha("#34d399", 0.16),
    icon: <CheckCircleIcon sx={{ fontSize: 11 }} />,
  },
  CATEGORY_CREATE: {
    label: "Cat Create",
    color: "#4ade80",
    bg: alpha("#4ade80", 0.16),
    icon: <CreateIcon sx={{ fontSize: 11 }} />,
  },
  CATEGORY_UPDATE: {
    label: "Cat Update",
    color: "#60a5fa",
    bg: alpha("#60a5fa", 0.16),
    icon: <EditIcon sx={{ fontSize: 11 }} />,
  },
  CATEGORY_DELETE: {
    label: "Cat Delete",
    color: "#f87171",
    bg: alpha("#f87171", 0.16),
    icon: <DeleteIcon sx={{ fontSize: 11 }} />,
  },
  LOCATION_CREATED: {
    label: "Loc Created",
    color: "#4ade80",
    bg: alpha("#4ade80", 0.16),
    icon: <CreateIcon sx={{ fontSize: 11 }} />,
  },
  LOCATION_UPDATED: {
    label: "Loc Updated",
    color: "#60a5fa",
    bg: alpha("#60a5fa", 0.16),
    icon: <EditIcon sx={{ fontSize: 11 }} />,
  },
  LOCATION_DELETED: {
    label: "Loc Deleted",
    color: "#f87171",
    bg: alpha("#f87171", 0.16),
    icon: <DeleteIcon sx={{ fontSize: 11 }} />,
  },
  ROLE_CREATED: {
    label: "Role Created",
    color: "#4ade80",
    bg: alpha("#4ade80", 0.16),
    icon: <CreateIcon sx={{ fontSize: 11 }} />,
  },
  ROLE_UPDATED: {
    label: "Role Updated",
    color: "#60a5fa",
    bg: alpha("#60a5fa", 0.16),
    icon: <EditIcon sx={{ fontSize: 11 }} />,
  },
  ROLE_DELETED: {
    label: "Role Deleted",
    color: "#f87171",
    bg: alpha("#f87171", 0.16),
    icon: <DeleteIcon sx={{ fontSize: 11 }} />,
  },
  ASSIGN: {
    label: "Assign",
    color: "#818cf8",
    bg: alpha("#818cf8", 0.16),
    icon: <CheckCircleIcon sx={{ fontSize: 11 }} />,
  },
  SUBMIT: {
    label: "Submit",
    color: "#34d399",
    bg: alpha("#34d399", 0.16),
    icon: <CheckCircleIcon sx={{ fontSize: 11 }} />,
  },
  default: {
    label: "Event",
    color: "#94a3b0",
    bg: alpha("#94a3b0", 0.14),
    icon: <EventIcon sx={{ fontSize: 11 }} />,
  },
};

const ROLE_CONFIG = {
  super_admin: { label: "Super Admin", color: "#f87171", bg: alpha("#f87171", 0.16) },
  admin: { label: "Admin", color: "#fb923c", bg: alpha("#fb923c", 0.16) },
  team: { label: "Team", color: "#4ade80", bg: alpha("#4ade80", 0.16) },
  default: { label: "Member", color: "#94a3b0", bg: alpha("#94a3b0", 0.14) },
};

const STATUS_CONFIG = {
  success: { label: "Success", color: "#4ade80", bg: alpha("#4ade80", 0.16) },
  failure: { label: "Failed", color: "#f87171", bg: alpha("#f87171", 0.16) },
};

/* ─── Helpers ─── */
const fmtDisplay = (d) => (d ? format(new Date(d), "MMM dd, yyyy") : "—");
const fmtTime = (d) => (d ? format(new Date(d), "HH:mm:ss") : "");
const fmtFull = (d) =>
  d ? format(new Date(d), "MMM dd, yyyy · HH:mm:ss") : "—";

/* ─── StatCard ─── */
function StatCard({
  label,
  value,
  icon,
  color,
  loading,
  subtitle,
  active,
  onClick,
}) {
  if (loading)
    return (
      <Skeleton
        variant="rectangular"
        height={88}
        sx={{ borderRadius: T.radius }}
      />
    );
  return (
    <Box
      sx={{
        position: "relative",
        overflow: "hidden",
        bgcolor: active ? `${alpha(color, 0.14)} !important` : T.cardBg,
        border: T.border,
        borderColor: active ? `${color} !important` : T.borderColor,
        borderRadius: T.radius,
        p: "14px 16px",
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        cursor: onClick ? "pointer" : "default",
        outline: active ? `3px solid ${color}` : "none",
        outlineOffset: "-3px",
        transition: "box-shadow 0.15s, border-color 0.15s",
        boxShadow: active
          ? `inset 0 0 0 1px ${color}, 0 18px 40px ${alpha(color, 0.22)} !important`
          : "none",
        "&::before": active
          ? {
              content: '""',
              position: "absolute",
              inset: "0 auto 0 0",
              width: 6,
              bgcolor: color,
            }
          : undefined,
        "&:hover": {
          boxShadow: onClick
            ? active
              ? `inset 0 0 0 1px ${color}, 0 20px 44px ${alpha(color, 0.24)} !important`
              : `0 12px 28px ${alpha(color, 0.16)}`
            : "0 2px 12px rgba(0,0,0,0.3)",
          borderColor: onClick ? `${color} !important` : undefined,
        },
        "&:focus-visible": {
          boxShadow: `0 0 0 3px ${alpha(color, 0.3)}`,
        },
      }}
      onClick={onClick}
      onKeyDown={(e) => {
        if (!onClick) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <Box
        sx={{
          width: 38,
          height: 38,
          borderRadius: "10px",
          bgcolor: alpha(color, 0.16),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          color,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography
          fontSize={11}
          color={T.textMuted}
          fontWeight={500}
          lineHeight={1.2}
          noWrap
        >
          {label}
        </Typography>
        <Typography
          fontSize={22}
          fontWeight={700}
          color={T.textPrimary}
          lineHeight={1.3}
        >
          {(value ?? 0).toLocaleString()}
        </Typography>
        {subtitle && (
          <Typography fontSize={10} color={T.textMuted} noWrap>
            {subtitle}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

/* ─── ActionChip ─── */
function ActionChip({ action }) {
  const cfg = ACTION_CONFIG[action] || ACTION_CONFIG.default;
  return (
    <Box
      sx={{
        ...CHIP_SX,
        gap: 0.5,
        bgcolor: cfg.bg,
        color: cfg.color,
        fontSize: 11,
      }}
    >
      {cfg.icon}
      {cfg.label}
    </Box>
  );
}

/* ─── RoleChip ─── */
function RoleChip({ role }) {
  const cfg = ROLE_CONFIG[role] || ROLE_CONFIG.default;
  return (
    <Box sx={{ ...CHIP_SX, bgcolor: cfg.bg, color: cfg.color }}>
      {cfg.label}
    </Box>
  );
}

/* ─── StatusChip ─── */
function StatusChip({ status }) {
  if (!status)
    return (
      <Typography fontSize={12} color={T.textMuted}>
        —
      </Typography>
    );
  const cfg = STATUS_CONFIG[status] || {
    label: status,
    bg: alpha("#94a3b0", 0.14),
    color: "#94a3b0",
  };
  return (
    <Box sx={{ ...CHIP_SX, fontSize: 11, bgcolor: cfg.bg, color: cfg.color }}>
      {cfg.label}
    </Box>
  );
}

/* ─── ResourceChip ─── */
function ResourceChip({ resource }) {
  if (!resource)
    return (
      <Typography fontSize={12} color={T.textMuted}>
        —
      </Typography>
    );
  return (
    <Box
      sx={{
        ...CHIP_SX,
        fontSize: 11,
        bgcolor: alpha(T.textSecondary, 0.14),
        color: T.textSecondary,
        textTransform: "capitalize",
      }}
    >
      {humanize(resource)}
    </Box>
  );
}

/* ─── RoleHeader ─── */
function MobileLogCard({ log, onView }) {
  const actorInitial = (log.actor?.email?.[0] || "U").toUpperCase();

  return (
    <Box
      onClick={onView}
      sx={{
        p: 1.5,
        border: T.border,
        borderColor: T.borderColor,
        borderRadius: T.radius,
        bgcolor: T.cardBg,
        cursor: "pointer",
        boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 1,
          mb: 1.25,
        }}
      >
        <Box>
          <Typography fontSize={12} fontWeight={700} color={T.textPrimary}>
            {fmtDisplay(log.createdAt)}
          </Typography>
          <Typography fontSize={10.5} color={T.textMuted} fontFamily={T.fontMono}>
            {fmtTime(log.createdAt)}
          </Typography>
        </Box>
        <StatusChip status={log.status} />
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mb: 1.25,
          minWidth: 0,
        }}
      >
        <Box
          sx={{
            width: 30,
            height: 30,
            borderRadius: "50%",
            bgcolor: alpha(T.accent, 0.16),
            color: T.accent,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            fontWeight: 800,
            flexShrink: 0,
          }}
        >
          {actorInitial}
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography
            fontSize={12}
            fontWeight={600}
            color={T.textPrimary}
            sx={{ overflowWrap: "anywhere", lineHeight: 1.35 }}
          >
            {log.actor?.email || "Unknown"}
          </Typography>
          <RoleChip role={log.actorRole} />
        </Box>
      </Box>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mb: 1 }}>
        <ActionChip action={log.action} />
        <ResourceChip resource={log.resource} />
      </Box>

      <Typography
        fontSize={11.5}
        color={T.textSecondary}
        sx={{
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          lineHeight: 1.45,
          overflowWrap: "anywhere",
          mb: 1.25,
        }}
      >
        {log.description || "No description"}
      </Typography>

      <Button
        size="small"
        variant="outlined"
        startIcon={<VisibilityIcon sx={{ fontSize: 14 }} />}
        onClick={(e) => {
          e.stopPropagation();
          onView();
        }}
        sx={{
          borderColor: alpha(T.accent, 0.35),
          color: T.accent,
          fontSize: 11,
          fontWeight: 700,
          borderRadius: "8px",
          minHeight: 30,
          px: 1.25,
        }}
      >
        View Details
      </Button>
    </Box>
  );
}

function RoleHeader({ isSuperAdmin, isAdmin }) {
  if (isSuperAdmin)
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <ShieldIcon sx={{ fontSize: 20, color: "#f87171" }} />
        <Box>
          <Typography fontSize={13} fontWeight={600} color="#f87171">
            Super Admin Access
          </Typography>
          <Typography fontSize={11} color={T.textMuted}>
            Full system audit trail
          </Typography>
        </Box>
      </Box>
    );
  if (isAdmin)
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <BusinessIcon sx={{ fontSize: 20, color: "#fb923c" }} />
        <Box>
          <Typography fontSize={13} fontWeight={600} color="#fb923c">
            Organization Activity
          </Typography>
          <Typography fontSize={11} color={T.textMuted}>
            Activity within your organization
          </Typography>
        </Box>
      </Box>
    );
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <PersonIcon sx={{ fontSize: 20, color: "#4ade80" }} />
      <Box>
        <Typography fontSize={13} fontWeight={600} color="#4ade80">
          My Activity
        </Typography>
        <Typography fontSize={11} color={T.textMuted}>
          Your personal action history
        </Typography>
      </Box>
    </Box>
  );
}

/* ─── ExportButton ─── */
function ExportButton({ onExport, exporting, disabled }) {
  const [anchor, setAnchor] = useState(null);
  const open = Boolean(anchor);
  const handleClick = (fmt) => {
    setAnchor(null);
    onExport(fmt);
  };
  return (
    <>
      <Button
        size="small"
        variant="outlined"
        endIcon={<ArrowDownIcon sx={{ fontSize: 13 }} />}
        startIcon={
          exporting ? (
            <CircularProgress size={11} />
          ) : (
            <DownloadIcon sx={{ fontSize: 13 }} />
          )
        }
        onClick={(e) => setAnchor(e.currentTarget)}
        disabled={exporting || disabled}
        sx={{
          fontSize: 11,
          fontWeight: 600,
          textTransform: "none",
          borderRadius: "8px",
          whiteSpace: "nowrap",
        }}
      >
        Export
      </Button>
      <Menu
        anchorEl={anchor}
        open={open}
        onClose={() => setAnchor(null)}
        PaperProps={{
          elevation: 0,
          sx: {
            border: T.border,
            borderColor: T.borderColor,
            borderRadius: T.radius,
            mt: 0.5,
            minWidth: 160,
            bgcolor: T.cardBg,
          },
        }}
      >
        {[
          {
            fmt: "csv",
            label: "Export as CSV",
            Icon: CsvIcon,
            color: "#4ade80",
          },
          {
            fmt: "excel",
            label: "Export as Excel",
            Icon: ExcelIcon,
            color: "#60a5fa",
          },
          {
            fmt: "pdf",
            label: "Export as PDF",
            Icon: PdfIcon,
            color: "#f87171",
          },
        ].map(({ fmt, label, Icon, color }) => (
          <MenuItem
            key={fmt}
            onClick={() => handleClick(fmt)}
            sx={{ fontSize: 12, py: "7px" }}
          >
            <ListItemIcon sx={{ minWidth: 30 }}>
              <Icon sx={{ fontSize: 16, color }} />
            </ListItemIcon>
            <ListItemText primaryTypographyProps={{ fontSize: 12 }}>
              {label}
            </ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

/* ─── FilterBar ─── */
function FilterBar({
  filters,
  onChange,
  onApply,
  onReset,
  onExport,
  onRefresh,
  loading,
  exporting,
  dateKey,
  isSuperAdmin,
  isAdmin,
  open,
  onToggle,
  showReset,
}) {
  const isMobile = useMediaQuery("(max-width:600px)");
  const FilterSurface = isMobile ? Portal : React.Fragment;
  const placeholder = isSuperAdmin
    ? "Search logs…"
    : isAdmin
      ? "Search organization activity…"
      : "Search your activity…";

  return (
    <Box
      sx={{
        bgcolor: T.cardBg,
        border: T.border,
        borderColor: T.borderColor,
        borderRadius: T.radius,
        p: { xs: "12px", sm: "14px 16px" },
        mb: 2,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: open && !isMobile ? 1.5 : 0,
          flexWrap: isMobile ? "nowrap" : "wrap",
          gap: 1,
        }}
      >
        {isMobile ? (
          <>
            <AssetSearchField
              placeholder={placeholder}
              value={filters.search || ""}
              onChange={(e) => onChange("search", e.target.value)}
              onClear={() => onChange("search", "")}
              sx={{ flex: "1 1 auto", minWidth: 0 }}
              inputSx={{ fontSize: 12 }}
              searchIconSx={{ fontSize: 14, color: T.textMuted }}
            />
            <IconButton
              aria-label="Open filters"
              onClick={onToggle}
              sx={{
                width: 40,
                height: 40,
                flex: "0 0 auto",
                borderRadius: "10px",
                border: `1px solid ${showReset ? T.accent : T.borderColor}`,
                color: showReset ? T.accent : T.textSecondary,
                bgcolor: showReset ? alpha(T.accent, 0.12) : T.cardBg,
                "&:hover": {
                  bgcolor: alpha(T.accent, 0.16),
                  color: T.accent,
                },
              }}
            >
              <FilterListIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </>
        ) : (
          <>
            <Button
              size="small"
              startIcon={<FilterListIcon sx={{ fontSize: 14 }} />}
              onClick={onToggle}
              sx={{
                px: 0,
                minWidth: 0,
                fontSize: 12,
                fontWeight: 600,
                color: T.textSecondary,
                textTransform: "none",
                "&:hover": { bgcolor: "transparent", color: T.accent },
              }}
            >
              Filters
            </Button>
            {showReset && (
              <Button
                size="small"
                startIcon={<ClearIcon sx={{ fontSize: 12 }} />}
                onClick={onReset}
                sx={{ fontSize: 11, color: T.textMuted, textTransform: "none" }}
              >
                Reset
              </Button>
            )}
          </>
        )}
      </Box>

      {open && (
        <FilterSurface>
        {isMobile && (
          <Box
            onClick={onToggle}
            sx={{
              position: "fixed",
              inset: 0,
              zIndex: 9998,
              bgcolor: "rgba(2, 6, 23, 0.72)",
              backdropFilter: "blur(6px)",
            }}
          />
        )}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 1,
            alignItems: "center",
            ...(isMobile && {
              position: "fixed",
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 9999,
              width: "100%",
              maxHeight: "76dvh",
              overflowY: "auto",
              bgcolor: T.cardBg,
              border: `1px solid ${T.borderColor}`,
              borderBottom: 0,
              borderRadius: "24px 24px 0 0",
              boxShadow: "0 -18px 56px rgba(0, 0, 0, 0.5)",
              p: "14px 16px calc(18px + env(safe-area-inset-bottom))",
            }),
          }}
        >
          {isMobile && (
            <>
              <Box
                sx={{
                  width: 44,
                  height: 5,
                  borderRadius: 999,
                  bgcolor: alpha(T.textSecondary, 0.3),
                  mx: "auto",
                  mb: 2,
                }}
              />
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 1,
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <FilterListIcon sx={{ fontSize: 18, color: T.accent }} />
                  <Typography sx={{ fontSize: 15, fontWeight: 700, color: T.accent }}>
                    Filters
                  </Typography>
                </Stack>
                <IconButton size="small" onClick={onToggle}>
                  <CloseIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Box>
            </>
          )}

          {/* Search */}
          <AssetSearchField
            placeholder={placeholder}
            value={filters.search || ""}
            onChange={(e) => onChange("search", e.target.value)}
            onClear={() => onChange("search", "")}
            sx={{ width: isMobile ? "100%" : 708 }}
            inputSx={{ fontSize: 12 }}
            searchIconSx={{ fontSize: 14, color: T.textMuted }}
          />

          {/* Action */}
          <FormControl size="small" sx={{ minWidth: isMobile ? "100%" : 150 }}>
            <InputLabel sx={{ fontSize: 12 }}>Action</InputLabel>
            <Select
              value={filters.action || ""}
              label="Action"
              onChange={(e) => onChange("action", e.target.value)}
              sx={{ fontSize: 12, borderRadius: "8px" }}
            >
              <MenuItem value="" sx={{ fontSize: 12 }}>
                All
              </MenuItem>
              {Object.entries(ACTION_CONFIG)
                .filter(([k]) => k !== "default")
                .map(([k, v]) => (
                  <MenuItem key={k} value={k} sx={{ fontSize: 12 }}>
                    {v.label}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>

          {/* Resource */}
          <FormControl size="small" sx={{ minWidth: isMobile ? "100%" : 130 }}>
            <InputLabel sx={{ fontSize: 12 }}>Resource</InputLabel>
            <Select
              value={filters.resource || ""}
              label="Resource"
              onChange={(e) => onChange("resource", e.target.value)}
              sx={{ fontSize: 12, borderRadius: "8px" }}
            >
              <MenuItem value="" sx={{ fontSize: 12 }}>
                All
              </MenuItem>
              {[
                "user",
                "asset",
                "checklist",
                "client",
                "team",
                "assignment",
                "category",
                "location",
                "role",
              ].map((r) => (
                <MenuItem
                  key={r}
                  value={r}
                  sx={{ fontSize: 12, textTransform: "capitalize" }}
                >
                  {r}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Status */}
          <FormControl size="small" sx={{ minWidth: isMobile ? "100%" : 120 }}>
            <InputLabel sx={{ fontSize: 12 }}>Status</InputLabel>
            <Select
              value={filters.status || ""}
              label="Status"
              onChange={(e) => onChange("status", e.target.value)}
              sx={{ fontSize: 12, borderRadius: "8px" }}
            >
              <MenuItem value="" sx={{ fontSize: 12 }}>
                All
              </MenuItem>
              <MenuItem value="success" sx={{ fontSize: 12 }}>
                Success
              </MenuItem>
              <MenuItem value="failure" sx={{ fontSize: 12 }}>
                Failed
              </MenuItem>
            </Select>
          </FormControl>

          {/* Role filter — super admin only */}
          {isSuperAdmin && (
            <FormControl
              size="small"
              sx={{ minWidth: isMobile ? "100%" : 130 }}
            >
              <InputLabel sx={{ fontSize: 12 }}>Role</InputLabel>
              <Select
                value={filters.actorRole || ""}
                label="Role"
                onChange={(e) => onChange("actorRole", e.target.value)}
                sx={{ fontSize: 12, borderRadius: "8px" }}
              >
                <MenuItem value="" sx={{ fontSize: 12 }}>
                  All
                </MenuItem>
                <MenuItem value="super_admin" sx={{ fontSize: 12 }}>
                  Super Admin
                </MenuItem>
                <MenuItem value="admin" sx={{ fontSize: 12 }}>
                  Admin
                </MenuItem>
                <MenuItem value="team" sx={{ fontSize: 12 }}>
                  Team
                </MenuItem>
              </Select>
            </FormControl>
          )}

          {/* Date range */}
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              key={`s-${dateKey}`}
              label="From"
              value={filters.startDate}
              onChange={(d) => onChange("startDate", d)}
              slotProps={{
                textField: {
                  size: "small",
                  sx: {
                    width: isMobile ? "100%" : 140,
                    "& .MuiInputBase-root": {
                      fontSize: 12,
                      borderRadius: "8px",
                    },
                  },
                },
              }}
            />
            <DatePicker
              key={`e-${dateKey}`}
              label="To"
              value={filters.endDate}
              onChange={(d) => onChange("endDate", d)}
              slotProps={{
                textField: {
                  size: "small",
                  sx: {
                    width: isMobile ? "100%" : 140,
                    "& .MuiInputBase-root": {
                      fontSize: 12,
                      borderRadius: "8px",
                    },
                  },
                },
              }}
            />
          </LocalizationProvider>

          {/* Action buttons */}
          <Box
            sx={{
              display: "flex",
              gap: 0.75,
              ml: isMobile ? 0 : "auto",
              flexShrink: 0,
              width: isMobile ? "100%" : "auto",
              flexWrap: "wrap",
            }}
          >
            <Button
              size="small"
              variant="contained"
              disableElevation
              startIcon={<FilterListIcon sx={{ fontSize: 13 }} />}
              onClick={() => {
                onApply();
                if (isMobile) onToggle();
              }}
              sx={{
                fontSize: 11,
                fontWeight: 600,
                textTransform: "none",
                borderRadius: "8px",
                bgcolor: T.accent,
                color: T.accentContrast,
                "&:hover": { bgcolor: T.accentDark },
              }}
            >
              Apply
            </Button>
            <ExportButton onExport={onExport} exporting={exporting} />
            <Button
              size="small"
              variant="contained"
              disableElevation
              startIcon={
                loading ? (
                  <CircularProgress size={11} sx={{ color: T.accentContrast }} />
                ) : (
                  <RefreshIcon sx={{ fontSize: 13 }} />
                )
              }
              onClick={onRefresh}
              disabled={loading}
              sx={{
                fontSize: 11,
                fontWeight: 600,
                textTransform: "none",
                borderRadius: "8px",
                bgcolor: T.accent,
                color: T.accentContrast,
                "&:hover": { bgcolor: T.accentDark },
              }}
            >
              Refresh
            </Button>
          </Box>
        </Box>
        </FilterSurface>
      )}
    </Box>
  );
}

/* ─── DetailDialog ─── */
function DetailDialog({ open, onClose, log, onExportSingle }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  if (!log) return null;

  const beforeChanges = log.oldData || log.changes?.old;
  const afterChanges = log.newData || log.changes?.new;

  const Field = ({ label, children }) => (
    <Box>
      <Typography
        fontSize={10.5}
        color={T.textMuted}
        fontWeight={600}
        textTransform="uppercase"
        letterSpacing={0.5}
        mb={0.5}
      >
        {label}
      </Typography>
      {children}
    </Box>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        elevation: 0,
        sx: {
          borderRadius: { xs: 0, sm: T.radiusLg },
          border: T.border,
          borderColor: T.borderColor,
          bgcolor: T.cardBg,
          overflow: "hidden",
          m: { xs: 0, sm: 2 },
          width: { xs: "100vw", sm: "calc(100% - 32px)" },
          maxWidth: { xs: "100vw", sm: 600 },
          height: { xs: "100dvh", sm: "auto" },
          maxHeight: { xs: "100dvh", sm: "90vh" },
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: { xs: 2, sm: 2.5 },
          py: { xs: 1.75, sm: 2 },
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: T.border,
          borderColor: T.borderColor,
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
          <Box
            sx={{
              width: 30,
              height: 30,
              borderRadius: "8px",
              bgcolor: alpha(T.accent, 0.16),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: T.accent,
            }}
          >
            <HistoryIcon sx={{ fontSize: 15 }} />
          </Box>
          <Typography fontSize={14} fontWeight={700} color={T.textPrimary}>
            Log Details
          </Typography>
        </Box>
        <IconButton
          size="small"
          onClick={onClose}
          sx={{
            color: `${T.textMuted} !important`,
            bgcolor: "transparent !important",
            "&:hover": { bgcolor: `${alpha(T.textSecondary, 0.12)} !important` },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <DialogContent
        sx={{
          p: { xs: 2, sm: 2.5 },
          flex: 1,
          overflowY: "auto",
        }}
      >
        <Stack spacing={2.5}>
          {/* Timestamp / Action / Status */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(3, auto)" },
              gap: { xs: 1.5, sm: 2.5 },
            }}
          >
            <Field label="Timestamp">
              <Typography
                fontSize={12.5}
                fontWeight={500}
                color={T.textPrimary}
              >
                {fmtFull(log.createdAt)}
              </Typography>
            </Field>
            <Field label="Action">
              <Box mt={0.25}>
                <ActionChip action={log.action} />
              </Box>
            </Field>
            <Field label="Status">
              <Box mt={0.25}>
                <StatusChip status={log.status} />
              </Box>
            </Field>
          </Box>

          <Divider sx={{ borderColor: T.borderColor }} />

          {/* User / Resource */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
              gap: { xs: 1.5, sm: 2.5 },
            }}
          >
            <Field label="User">
              <Typography
                fontSize={12.5}
                fontWeight={500}
                color={T.textPrimary}
              >
                {log.actor?.email || "Unknown"}
              </Typography>
              <Box mt={0.5}>
                <RoleChip role={log.actorRole} />
              </Box>
            </Field>
            <Field label="Resource">
              <Typography
                fontSize={12.5}
                fontWeight={500}
                color={T.textPrimary}
                textTransform="capitalize"
              >
                {humanize(log.resource)}
              </Typography>
              {log.resourceId && (
                <Typography
                  fontSize={11}
                  color={T.textMuted}
                  fontFamily={T.fontMono}
                  mt={0.25}
                >
                  {log.resourceId}
                </Typography>
              )}
            </Field>
          </Box>

          {/* Description */}
          <Field label="Description">
            <Box
              sx={{
                bgcolor: T.pageBg,
                border: T.border,
                borderColor: T.borderColor,
                borderRadius: "8px",
                p: "10px 12px",
              }}
            >
              <Typography
                fontSize={12.5}
                color={T.textPrimary}
                lineHeight={1.6}
              >
                {log.description || "No description provided"}
              </Typography>
            </Box>
          </Field>

          {/* IP / UA */}
          {/* {(log.ipAddress || log.userAgent) && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {log.ipAddress && (
                <Field label="IP Address">
                  <Typography
                    fontSize={12}
                    fontFamily={T.fontMono}
                    color={T.textPrimary}
                  >
                    {log.ipAddress}
                  </Typography>
                </Field>
              )}
              {log.userAgent && (
                <Field label="User Agent">
                  <Typography
                    fontSize={11}
                    fontFamily={T.fontMono}
                    color={T.textSecondary}
                    sx={{ wordBreak: "break-all", lineHeight: 1.5 }}
                  >
                    {log.userAgent}
                  </Typography>
                </Field>
              )}
            </Box>
          )} */}

          {/* Before / After diffs */}
          {beforeChanges && (
            <Field label="Before changes">
              <Box
                sx={{
                  bgcolor: alpha("#fb923c", 0.1),
                  border: T.border,
                  borderColor: alpha("#fb923c", 0.35),
                  borderRadius: "8px",
                  p: "10px 12px",
                  maxHeight: 160,
                  overflowY: "auto",
                }}
              >
                <pre
                  style={{
                    margin: 0,
                    fontSize: 11,
                    fontFamily: T.fontMono,
                    color: "#fdba74",
                    lineHeight: 1.6,
                  }}
                >
                  {JSON.stringify(beforeChanges, null, 2)}
                </pre>
              </Box>
            </Field>
          )}
          {afterChanges && (
            <Field label="After changes">
              <Box
                sx={{
                  bgcolor: alpha("#4ade80", 0.1),
                  border: T.border,
                  borderColor: alpha("#4ade80", 0.35),
                  borderRadius: "8px",
                  p: "10px 12px",
                  maxHeight: 160,
                  overflowY: "auto",
                }}
              >
                <pre
                  style={{
                    margin: 0,
                    fontSize: 11,
                    fontFamily: T.fontMono,
                    color: "#86efac",
                    lineHeight: 1.6,
                  }}
                >
                  {JSON.stringify(afterChanges, null, 2)}
                </pre>
              </Box>
            </Field>
          )}

          {/* Metadata */}
          {/* {log.metadata && Object.keys(log.metadata).length > 0 && (
            <Field label="Metadata">
              <Box
                sx={{
                  bgcolor: alpha("#818cf8", 0.1),
                  border: T.border,
                  borderColor: alpha("#818cf8", 0.35),
                  borderRadius: "8px",
                  p: "10px 12px",
                  maxHeight: 120,
                  overflowY: "auto",
                }}
              >
                <pre
                  style={{
                    margin: 0,
                    fontSize: 11,
                    fontFamily: T.fontMono,
                    color: "#a5b4fc",
                    lineHeight: 1.6,
                  }}
                >
                  {JSON.stringify(log.metadata, null, 2)}
                </pre>
              </Box>
            </Field>
          )} */}
        </Stack>
      </DialogContent>

      {/* Footer */}
      <Box
        sx={{
          px: { xs: 2, sm: 2.5 },
          py: { xs: 1.5, sm: 1.75 },
          borderTop: T.border,
          borderColor: T.borderColor,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 1,
          flexShrink: 0,
          pb: { xs: "calc(16px + env(safe-area-inset-bottom))", sm: 1.75 },
        }}
      >
        <ExportButton
          onExport={(fmt) => onExportSingle(log, fmt)}
          exporting={false}
        />
        <Button
          onClick={onClose}
          size="small"
          variant="contained"
          disableElevation
          sx={{
            bgcolor: T.accent,
            color: T.accentContrast,
            borderRadius: "8px",
            fontSize: 12,
            fontWeight: 600,
            px: 2,
            textTransform: "none",
            "&:hover": { bgcolor: T.accentDark },
          }}
        >
          Close
        </Button>
      </Box>
    </Dialog>
  );
}

/* ─── Export utilities ─── */
function buildExportRows(logs, includeActor) {
  const header = [
    "Timestamp",
    "Date",
    "Time",
    "Action",
    "Status",
    ...(includeActor ? ["User Email", "User Role"] : []),
    "Resource",
    "Resource ID",
    "Description",
    "IP Address",
  ];
  const rows = logs.map((l) => [
    l.createdAt ? format(new Date(l.createdAt), "MMM dd, yyyy HH:mm:ss") : "",
    l.createdAt ? format(new Date(l.createdAt), "yyyy-MM-dd") : "",
    l.createdAt ? format(new Date(l.createdAt), "HH:mm:ss") : "",
    ACTION_CONFIG[l.action]?.label || l.action,
    l.status || "",
    ...(includeActor ? [l.actor?.email || "Unknown", l.actorRole || ""] : []),
    l.resource || "",
    l.resourceId || "",
    l.description || "",
    l.ipAddress || "",
  ]);
  return { header, rows };
}

function exportCSV(logs, filename, includeActor) {
  const { header, rows } = buildExportRows(logs, includeActor);
  const escape = (v) => `"${String(v).replace(/"/g, '""')}"`;
  const csv = [header, ...rows].map((r) => r.map(escape).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function exportExcel(logs, filename, includeActor, stats) {
  const { header, rows } = buildExportRows(logs, includeActor);
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
  ws["!cols"] = header.map((h) => ({
    wch:
      h === "Description"
        ? 50
        : h === "Timestamp"
          ? 24
          : h.includes("Email")
            ? 28
            : 14,
  }));
  XLSX.utils.book_append_sheet(wb, ws, "Audit Logs");

  // Summary sheet (includes stats if provided — super admin only)
  const today = format(new Date(), "yyyy-MM-dd");
  const summaryData = [
    ["Metric", "Value"],
    ["Exported records", logs.length],
    ["Export date", today],
    ...(stats
      ? [
          ["Total system actions", stats.total || 0],
          ["Actions today", stats.today || 0],
          ["Action types", stats.byAction?.length || 0],
          ["Resources tracked", stats.byResource?.length || 0],
        ]
      : []),
  ];
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.aoa_to_sheet(summaryData),
    "Summary",
  );
  XLSX.writeFile(wb, filename);
}

function exportPDF(logs, filename, includeActor, roleLabel) {
  const { header, rows } = buildExportRows(logs, includeActor);
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Audit Logs", 40, 45);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(
    `Generated ${format(new Date(), "MMM dd, yyyy · HH:mm")}  ·  ${logs.length} records  ·  ${roleLabel}`,
    40,
    62,
  );
  doc.setTextColor(0);
  autoTable(doc, {
    head: [header],
    body: rows,
    startY: 75,
    styles: { fontSize: 8, cellPadding: 4, overflow: "linebreak" },
    headStyles: { fillColor: [31, 182, 207], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [247, 248, 250] },
    columnStyles: header.reduce((acc, h, i) => {
      if (h === "Description") acc[i] = { cellWidth: 120 };
      if (h === "Timestamp") acc[i] = { cellWidth: 80 };
      return acc;
    }, {}),
  });
  doc.save(filename);
}

function exportSingleLog(log, fmt, includeActor) {
  const date = log.createdAt
    ? format(new Date(log.createdAt), "yyyy-MM-dd")
    : "log";
  const base = `audit-log-${log._id || date}`;
  if (fmt === "csv") exportCSV([log], `${base}.csv`, includeActor);
  if (fmt === "excel") exportExcel([log], `${base}.xlsx`, includeActor, null);
  if (fmt === "pdf")
    exportPDF([log], `${base}.pdf`, includeActor, "Single log");
}

/* ═══════════════════════════════════════
   Main Component
═══════════════════════════════════════ */
const AuditLogs = () => {
  const {
    auditLogs,
    loading,
    error,
    stats,
    statsLoading,
    pagination,
    filters,
    isSuperAdmin,
    isAdmin,
    isTeam,
    fetchAuditLogs,
    fetchAuditStats,
    updateFilters,
    resetFilters,
    clearError,
    getPageTitle,
    getPageDescription,
  } = useAudit();

  const theme = useTheme();
  applyAuditThemeTokens(theme.palette.mode);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [orderBy, setOrderBy] = useState("action");
  const [order, setOrder] = useState("asc");
  const [selectedLog, setSelectedLog] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [datePickerKey, setDatePickerKey] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [draftFilters, setDraftFilters] = useState(filters);
  const [activeStatFilter, setActiveStatFilter] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const showSnackbar = (message, severity = "success") =>
    setSnackbar({ open: true, message, severity });

  const effectiveFilters = useMemo(
    () => (activeStatFilter === "today" ? getTodayAuditFilters() : filters),
    [activeStatFilter, filters],
  );

  /* ── Fetch on mount / page / filter change ── */
  useEffect(() => {
    fetchAuditLogs(page + 1, rowsPerPage, effectiveFilters);
    fetchAuditStats(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, effectiveFilters, filters]);

  useEffect(() => {
    setDraftFilters(filters);
  }, [filters]);

  /* ── Derived stats for non-super-admin (computed from loaded page) ── */
  const derivedStats = useMemo(() => {
    const today = format(new Date(), "yyyy-MM-dd");
    const todayCount = (auditLogs || []).filter(
      (l) =>
        l.createdAt && format(new Date(l.createdAt), "yyyy-MM-dd") === today,
    ).length;
    const unique = new Set(
      (auditLogs || []).map((l) => l.actor?.email).filter(Boolean),
    ).size;
    const types = new Set((auditLogs || []).map((l) => l.action)).size;
    const total = pagination?.total ?? auditLogs?.length ?? 0;
    return {
      total,
      today: todayCount,
      unique,
      types,
    };
  }, [auditLogs, pagination]);

  /* ── Stats display values ── */
  // Super admin: real API stats shape → { total, byAction, byResource, today }
  // Others: derived from current page data
  const displayStats = isSuperAdmin
    ? {
        total: stats?.total,
        today: stats?.today,
        // API has no uniqueActors — use resource count as a proxy
        unique: stats?.uniqueActors ?? derivedStats.unique,
        types: stats?.byAction?.length,
      }
    : derivedStats;

  const uniqueUserDetails = useMemo(() => {
    if (isSuperAdmin && Array.isArray(stats?.byActor)) {
      return stats.byActor.map((item) => ({
        key: item._id || item.email || "unknown",
        label: item.name || item.email || "Unknown user",
        sub:
          item.email && item.name
            ? item.email
            : humanize(item.role || "unknown"),
        count: item.count || 0,
      }));
    }

    const grouped = new Map();
    (auditLogs || []).forEach((log) => {
      const key = log.actor?.email || "Unknown user";
      const current = grouped.get(key) || {
        key,
        label: log.actor?.name || key,
        sub:
          log.actor?.email && log.actor?.name
            ? log.actor.email
            : humanize(log.actorRole || "unknown"),
        count: 0,
      };
      current.count += 1;
      grouped.set(key, current);
    });

    return Array.from(grouped.values()).sort((a, b) => b.count - a.count);
  }, [auditLogs, isSuperAdmin, stats?.byActor]);

  const actionTypeDetails = useMemo(() => {
    if (isSuperAdmin && Array.isArray(stats?.byAction)) {
      return stats.byAction.map((item) => ({
        key: item._id || "unknown",
        label: humanize(item._id || "Unknown"),
        count: item.count || 0,
      }));
    }

    const grouped = new Map();
    (auditLogs || []).forEach((log) => {
      const key = log.action || "Unknown";
      grouped.set(key, (grouped.get(key) || 0) + 1);
    });

    return Array.from(grouped.entries())
      .map(([key, count]) => ({ key, label: humanize(key), count }))
      .sort((a, b) => b.count - a.count);
  }, [auditLogs, isSuperAdmin, stats?.byAction]);

  /* ── Sort (client-side on current page) ── */
  const handleSort = (col) => {
    setOrder(orderBy === col && order === "asc" ? "desc" : "asc");
    setOrderBy(col);
  };

  const sortedLogs = useMemo(
    () =>
      [...(auditLogs || [])].sort((a, b) => {
        let av = a[orderBy],
          bv = b[orderBy];
        if (orderBy === "actor") {
          av = a.actor?.email || "";
          bv = b.actor?.email || "";
        }
        if (orderBy === "createdAt") {
          av = av ? new Date(av).getTime() : 0;
          bv = bv ? new Date(bv).getTime() : 0;
        }
        if (av === bv) return 0;
        return order === "asc" ? (av > bv ? 1 : -1) : av < bv ? 1 : -1;
      }),
    [auditLogs, orderBy, order],
  );

  /* ── Filters ── */
  const handleFilterChange = (field, value) => {
    setDraftFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleApplyFilters = () => {
    setActiveStatFilter(null);
    updateFilters(draftFilters);
    setPage(0);
    fetchAuditLogs(1, rowsPerPage, draftFilters);
    fetchAuditStats(draftFilters);
  };

  const handleReset = () => {
    setActiveStatFilter(null);
    setDraftFilters(EMPTY_AUDIT_FILTERS);
    resetFilters();
    setPage(0);
    setDatePickerKey((p) => p + 1);
    fetchAuditLogs(1, rowsPerPage, EMPTY_AUDIT_FILTERS);
    fetchAuditStats(EMPTY_AUDIT_FILTERS);
  };

  const handleRefresh = () => {
    fetchAuditLogs(page + 1, rowsPerPage, effectiveFilters);
    fetchAuditStats(filters);
  };

  const handleTodayStatClick = () => {
    setActiveStatFilter("today");
    setPage(0);
    const todayFilters = getTodayAuditFilters();
    fetchAuditLogs(1, rowsPerPage, todayFilters);
    fetchAuditStats(filters);
  };

  const handleTotalStatClick = () => {
    if (!activeStatFilter) return;
    setActiveStatFilter(null);
    setPage(0);
    fetchAuditLogs(1, rowsPerPage, filters);
    fetchAuditStats(filters);
  };

  const handleUniqueUsersStatClick = () => {
    setActiveStatFilter((current) =>
      current === "uniqueUsers" ? null : "uniqueUsers",
    );
    setOrderBy("actor");
    setOrder("asc");
    setPage(0);
  };

  const handleActionTypesStatClick = () => {
    setActiveStatFilter((current) =>
      current === "actionTypes" ? null : "actionTypes",
    );
    setOrderBy("action");
    setOrder("asc");
    setPage(0);
  };

  /* ── Export (client-side, current page data) ── */
  const handleExport = async (fmt) => {
    setExporting(true);
    const date = format(new Date(), "yyyy-MM-dd");
    const roleLabel = isSuperAdmin ? "Super Admin" : isAdmin ? "Admin" : "Team";
    const includeActor = true; // show actor/user column for every role
    try {
      if (fmt === "csv")
        exportCSV(sortedLogs, `audit-logs-${date}.csv`, includeActor);
      if (fmt === "excel")
        exportExcel(
          sortedLogs,
          `audit-logs-${date}.xlsx`,
          includeActor,
          isSuperAdmin ? stats : null,
        );
      if (fmt === "pdf")
        exportPDF(
          sortedLogs,
          `audit-logs-${date}.pdf`,
          includeActor,
          roleLabel,
        );
      showSnackbar(
        `Exported ${sortedLogs.length} records as ${fmt.toUpperCase()}`,
        "success",
      );
    } catch (err) {
      console.error("Export error:", err);
      showSnackbar("Export failed. Please try again.", "error");
    } finally {
      setExporting(false);
    }
  };

  const handleExportSingle = (log, fmt) => {
    try {
      exportSingleLog(log, fmt, true);
      showSnackbar(`Log exported as ${fmt.toUpperCase()}`, "success");
    } catch {
      showSnackbar("Export failed.", "error");
    }
  };

  /* ── Table columns ──
     Percentage widths always sum to 100% so the table never leaves a gap,
     regardless of which columns are visible for the current role/breakpoint. */
  const cols = useMemo(
    () => [
      { id: "createdAt", label: "Timestamp", sortable: true, width: "15%" },
      {
        id: "action",
        label: "Action",
        sortable: true,
        width: "12%",
        hideOnMobile: true,
      },
      {
        id: "actor",
        label: "User",
        sortable: false,
        width: "22%",
        hideOnMobile: true,
      },
      {
        id: "resource",
        label: "Resource",
        sortable: true,
        width: "13%",
        hideOnMobile: true,
      },
      {
        id: "description",
        label: "Description",
        sortable: false,
        width: "22%",
        hideOnMobile: true,
      },
      { id: "status", label: "Status", sortable: false, width: "10%" },
      { id: "_view", label: "View", sortable: false, width: "6%" },
    ],
    [],
  );

  // On mobile only Timestamp / Status / Action survive — redistribute width
  // evenly across whatever remains so there's never dead space in the header.
  const visibleCols = useMemo(() => {
    const filtered = cols.filter((c) => !(isMobile && c.hideOnMobile));
    if (!isMobile) return filtered;
    const evenWidth = `${100 / filtered.length}%`;
    return filtered.map((c) => ({ ...c, width: evenWidth }));
  }, [cols, isMobile]);

  const showResetFilters = hasActiveAuditFilters(filters);

  /* ── Loading skeleton ── */
  if (loading && (auditLogs?.length ?? 0) === 0) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <Skeleton height={56} sx={{ mb: 2, borderRadius: T.radius }} />
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4, 1fr)" },
            gap: 1.5,
            mb: 2,
          }}
        >
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} height={88} sx={{ borderRadius: T.radius }} />
          ))}
        </Box>
        <Skeleton height={400} sx={{ borderRadius: T.radius }} />
      </Box>
    );
  }

  const cellSx = {
    fontSize: 12,
    py: "10px",
    px: "12px",
    borderBottom: `1px solid ${T.borderColor}`,
    color: T.textPrimary,
    overflow: "hidden",
  };
  const headCellSx = {
    ...cellSx,
    fontSize: 11,
    fontWeight: 700,
    color: T.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    bgcolor: alpha("#000", 0.18),
    py: "8px",
  };

  return (
    <Box
      sx={{
        p: { xs: 1.5, sm: 2.5, md: 3 },
        maxWidth: "100%",
        overflow: "hidden",
        bgcolor: T.pageBg,
      }}
    >
      {/* Page header */}
      <Box
        sx={{
          mb: 2.5,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 1,
          flexWrap: "wrap",
        }}
      >
        <Box>
          <Typography
            fontSize={{ xs: 17, sm: 19, md: 21 }}
            fontWeight={800}
            color={T.textPrimary}
            lineHeight={1.2}
          >
            {getPageTitle()}
          </Typography>
          <Typography fontSize={12} color={T.textMuted} mt={0.4}>
            {getPageDescription()}
          </Typography>
        </Box>
        <RoleHeader isSuperAdmin={isSuperAdmin} isAdmin={isAdmin} />
      </Box>

      {/* Error alert */}
      {error && (
        <Alert
          severity="error"
          onClose={clearError}
          sx={{ mb: 2, borderRadius: T.radius, fontSize: 12 }}
        >
          {error}
        </Alert>
      )}

      {/* Stats — all roles */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4, 1fr)" },
          gap: 1.25,
          mb: 2,
        }}
      >
        <StatCard
          label="Total Actions"
          value={displayStats?.total}
          icon={<TrendingUpIcon sx={{ fontSize: 16 }} />}
          color="#818cf8"
          loading={statsLoading && !stats}
          subtitle={activeStatFilter === "today" ? "clear today view" : !isSuperAdmin ? "in current view" : undefined}
          active={!activeStatFilter}
          onClick={handleTotalStatClick}
        />
        <StatCard
          label="Today"
          value={displayStats?.today}
          icon={<TodayIcon sx={{ fontSize: 16 }} />}
          color="#4ade80"
          loading={statsLoading && !stats}
          active={activeStatFilter === "today"}
          onClick={handleTodayStatClick}
        />
        <StatCard
          label="Unique Users"
          value={displayStats?.unique}
          icon={<PeopleIcon sx={{ fontSize: 16 }} />}
          color="#fb923c"
          loading={statsLoading && !stats}
          subtitle={activeStatFilter === "uniqueUsers" ? "sorted by user" : undefined}
          active={activeStatFilter === "uniqueUsers"}
          onClick={handleUniqueUsersStatClick}
        />
        <StatCard
          label="Action Types"
          value={displayStats?.types}
          icon={<CategoryIcon sx={{ fontSize: 16 }} />}
          color="#facc15"
          loading={statsLoading && !stats}
          subtitle={activeStatFilter === "actionTypes" ? "sorted by action" : undefined}
          active={activeStatFilter === "actionTypes"}
          onClick={handleActionTypesStatClick}
        />
      </Box>

      {(activeStatFilter === "uniqueUsers" ||
        activeStatFilter === "actionTypes") && (
        <Box
          sx={{
            mb: 2,
            bgcolor: T.cardBg,
            border: T.border,
            borderColor: T.borderColor,
            borderRadius: T.radius,
            p: { xs: 1.5, sm: 2 },
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            gap={1}
            mb={1.5}
          >
            <Box>
              <Typography fontSize={13} fontWeight={800} color={T.textPrimary}>
                {activeStatFilter === "uniqueUsers"
                  ? "Unique Users Details"
                  : "Action Types Details"}
              </Typography>
              <Typography fontSize={11.5} color={T.textMuted}>
                {activeStatFilter === "uniqueUsers"
                  ? "Users grouped by audit activity"
                  : "Actions grouped by type"}
              </Typography>
            </Box>
            <Chip
              size="small"
              label={`${
                activeStatFilter === "uniqueUsers"
                  ? uniqueUserDetails.length
                  : actionTypeDetails.length
              } shown`}
              sx={{
                bgcolor: alpha(T.accent, 0.16),
                color: T.accent,
                fontWeight: 700,
                fontSize: 11,
              }}
            />
          </Stack>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
                md: "repeat(3, minmax(0, 1fr))",
              },
              gap: 1,
            }}
          >
            {(activeStatFilter === "uniqueUsers"
              ? uniqueUserDetails
              : actionTypeDetails
            ).map((item) => (
              <Box
                key={item.key}
                sx={{
                  border: T.border,
                  borderColor: alpha(T.accent, 0.2),
                  borderRadius: "9px",
                  p: 1.25,
                  bgcolor: alpha(T.accent, 0.06),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 1,
                  minWidth: 0,
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    fontSize={12}
                    fontWeight={700}
                    color={T.textPrimary}
                    noWrap
                  >
                    {item.label}
                  </Typography>
                  {item.sub && (
                    <Typography fontSize={10.5} color={T.textMuted} noWrap>
                      {item.sub}
                    </Typography>
                  )}
                </Box>
                <Chip
                  size="small"
                  label={item.count}
                  sx={{
                    flexShrink: 0,
                    bgcolor: alpha(T.accent, 0.16),
                    color: T.accent,
                    fontWeight: 800,
                    minWidth: 34,
                  }}
                />
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* Total chip */}
      {pagination && (
        <Box
          sx={{
            mb: 1.5,
            display: "flex",
            alignItems: "center",
            gap: 1,
            flexWrap: "wrap",
          }}
        >
          <Typography fontSize={12} color={T.textSecondary}>
            {isSuperAdmin ? "System" : isAdmin ? "Organization" : "Personal"}{" "}
            activity
          </Typography>
          <Chip
            label={`${(pagination.total || 0).toLocaleString()} total entries`}
            size="small"
            sx={{
              bgcolor: alpha(T.accent, 0.16),
              color: T.accent,
              fontWeight: 600,
              fontSize: 11,
            }}
          />
        </Box>
      )}

      {/* Filter bar */}
      <FilterBar
        filters={draftFilters}
        onChange={handleFilterChange}
        onApply={handleApplyFilters}
        onReset={handleReset}
        onExport={handleExport}
        onRefresh={handleRefresh}
        loading={loading}
        exporting={exporting}
        dateKey={datePickerKey}
        isSuperAdmin={isSuperAdmin}
        isAdmin={isAdmin}
        open={filtersOpen}
        onToggle={() => setFiltersOpen((open) => !open)}
        showReset={showResetFilters}
      />

      {/* Table */}
      <Box
        sx={{
          bgcolor: T.cardBg,
          border: T.border,
          borderColor: T.borderColor,
          borderRadius: T.radius,
          overflow: "hidden",
        }}
      >
        {loading && <LinearProgress sx={{ height: 2 }} />}

        {isMobile ? (
          <Box sx={{ p: 1.25 }}>
            {sortedLogs.length === 0 ? (
              <Box sx={{ py: 6, textAlign: "center" }}>
                <HistoryIcon
                  sx={{
                    fontSize: 32,
                    color: alpha(T.textSecondary, 0.4),
                    mb: 1,
                    display: "block",
                    mx: "auto",
                  }}
                />
                <Typography fontSize={13} color={T.textMuted}>
                  No logs found
                </Typography>
                <Typography fontSize={11.5} color={T.textMuted} mt={0.4}>
                  Try adjusting your filters
                </Typography>
              </Box>
            ) : (
              <Stack spacing={1.25}>
                {sortedLogs.map((log) => (
                  <MobileLogCard
                    key={log._id}
                    log={log}
                    onView={() => {
                      setSelectedLog(log);
                      setDetailsOpen(true);
                    }}
                  />
                ))}
              </Stack>
            )}
          </Box>
        ) : (
          <TableContainer sx={{ overflowX: "auto" }}>
            <Table
              sx={{
                width: "100%",
                minWidth: 720,
                tableLayout: "fixed",
              }}
            >
            <TableHead>
              <TableRow>
                {visibleCols.map((col) => (
                  <TableCell
                    key={col.id}
                    sx={{ ...headCellSx, width: col.width }}
                    align={col.id === "_view" ? "center" : "left"}
                  >
                    {col.sortable ? (
                      <TableSortLabel
                        active={orderBy === col.id}
                        direction={orderBy === col.id ? order : "asc"}
                        onClick={() => handleSort(col.id)}
                        sx={{ fontSize: 11 }}
                      >
                        {col.label}
                      </TableSortLabel>
                    ) : (
                      col.label
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {sortedLogs.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={visibleCols.length}
                    sx={{ py: 6, textAlign: "center" }}
                  >
                    <HistoryIcon
                      sx={{
                        fontSize: 32,
                        color: alpha(T.textSecondary, 0.4),
                        mb: 1,
                        display: "block",
                        mx: "auto",
                      }}
                    />
                    <Typography fontSize={13} color={T.textMuted}>
                      No logs found
                    </Typography>
                    <Typography fontSize={11.5} color={T.textMuted} mt={0.4}>
                      Try adjusting your filters
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                sortedLogs.map((log) => (
                  <TableRow
                    key={log._id}
                    sx={{
                      "&:hover": { bgcolor: T.hoverRow },
                      "&:last-child td": { borderBottom: "none" },
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      setSelectedLog(log);
                      setDetailsOpen(true);
                    }}
                  >
                    {/* Timestamp */}
                    <TableCell sx={cellSx}>
                      <Typography
                        fontSize={11.5}
                        fontWeight={500}
                        color={T.textPrimary}
                        whiteSpace="nowrap"
                      >
                        {fmtDisplay(log.createdAt)}
                      </Typography>
                      <Typography
                        fontSize={10.5}
                        color={T.textMuted}
                        fontFamily={T.fontMono}
                      >
                        {fmtTime(log.createdAt)}
                      </Typography>
                    </TableCell>

                    {!isMobile && (
                      <TableCell sx={cellSx}>
                        <ActionChip action={log.action} />
                      </TableCell>
                    )}

                    {/* User — shown for every role, hidden only on mobile */}
                    {!isMobile && (
                      <TableCell sx={cellSx}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            minWidth: 0,
                          }}
                        >
                          <Box
                            sx={{
                              width: 26,
                              height: 26,
                              borderRadius: "50%",
                              bgcolor: alpha(T.accent, 0.16),
                              color: T.accent,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 11,
                              fontWeight: 700,
                              flexShrink: 0,
                            }}
                          >
                            {(log.actor?.email?.[0] || "U").toUpperCase()}
                          </Box>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography
                              fontSize={11.5}
                              fontWeight={500}
                              color={T.textPrimary}
                              sx={{
                                overflowWrap: "anywhere",
                                lineHeight: 1.35,
                              }}
                            >
                              {log.actor?.email || "Unknown"}
                            </Typography>
                            <RoleChip role={log.actorRole} />
                          </Box>
                        </Box>
                      </TableCell>
                    )}

                    {/* Resource */}
                    {!isMobile && (
                      <TableCell sx={cellSx}>
                        <ResourceChip resource={log.resource} />
                      </TableCell>
                    )}

                    {/* Description */}
                    {!isMobile && (
                      <TableCell sx={cellSx}>
                        <Typography
                          fontSize={11.5}
                          color={T.textSecondary}
                          title={log.description}
                          sx={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            lineHeight: 1.45,
                            overflowWrap: "anywhere",
                          }}
                        >
                          {log.description || "—"}
                        </Typography>
                      </TableCell>
                    )}

                    {/* Status */}
                    <TableCell sx={cellSx} onClick={(e) => e.stopPropagation()}>
                      <StatusChip status={log.status} />
                    </TableCell>

                    {/* View button */}
                    <TableCell
                      sx={cellSx}
                      align="center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Tooltip title="View details" arrow>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedLog(log);
                            setDetailsOpen(true);
                          }}
                          sx={{
                            width: 28,
                            height: 28,
                            borderRadius: "8px",
                            bgcolor: `${alpha(T.accent, 0.16)} !important`,
                            color: `${T.accent} !important`,
                            "&:hover": {
                              bgcolor: `${alpha(T.accent, 0.26)} !important`,
                            },
                          }}
                          aria-label="View log details"
                        >
                          <VisibilityIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Pagination */}
        {pagination && pagination.total > 0 && (
          <Box sx={{ borderTop: `1px solid ${T.borderColor}` }}>
            <TablePagination
              rowsPerPageOptions={[10, 20, 50, 100]}
              component="div"
              count={pagination.total || 0}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(_, p) => setPage(p)}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              sx={{
                color: T.textSecondary,
                "& .MuiTablePagination-toolbar": {
                  minHeight: 44,
                  px: 1.5,
                  flexWrap: "wrap",
                  justifyContent: "center",
                },
                "& .MuiTablePagination-spacer": { display: "none" },
                "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
                  {
                    fontSize: 11.5,
                    color: T.textMuted,
                  },
              }}
            />
          </Box>
        )}
      </Box>

      {/* Detail dialog */}
      <DetailDialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        log={selectedLog}
        onExportSingle={handleExportSingle}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
  anchorOrigin={{ vertical: "top", horizontal: "right" }}>
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          sx={{ borderRadius: T.radius, fontSize: 12 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AuditLogs;

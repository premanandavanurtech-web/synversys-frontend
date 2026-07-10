// pages/Dashboard.jsx
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Stack,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Snackbar,
  Alert,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Skeleton,
  alpha,
  LinearProgress,
  Zoom,
  Chip,
  Divider,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Collapse,
} from "@mui/material";
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  History as HistoryIcon,
  Bolt as BoltIcon,
  Group as GroupIcon,
  Assignment as AssignmentIcon,
  AddCircle as AddCircleIcon,
  PersonAdd as PersonAddIcon,
  Analytics as AnalyticsIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  PictureAsPdf as PdfIcon,
  TableChart as CsvIcon,
  ErrorOutline as ErrorIcon,
  Inventory as InventoryIcon,
  TaskAlt as TaskAltIcon,
  People as PeopleIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  HourglassEmpty as HourglassIcon,
  Warning as WarningIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  CalendarMonth as CalendarIcon,
  FilterList as FilterListIcon,
  Notifications as NotifIcon,
  AccountBalance as RevenueIcon,
  Category as CategoryIcon,
} from "@mui/icons-material";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import SimCardDownloadIcon from "@mui/icons-material/SimCardDownload";
import { useNavigate } from "react-router-dom";
import { useDashboard } from "../context/DashboardContext";
import { useAuth } from "../context/AuthContexts";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  AreaChart,
  Area,
} from "recharts";

// ─── Design Tokens ─────────────────────────────────────────────────────────────
const C = {
  primary: "#002631",
  primaryLight: "#003d4d",
  accent: "#df8f00",
  accentLight: "#f5a623",
  secondary: "#516072",
  surface: "#f4f6f8",
  surfaceContainerLow: "#eef1f4",
  surfaceVariant: "#e0e3e5",
  outline: "#71787c",
  outlineVariant: "#c0c8cc",
  success: "#2e7d32",
  successLight: "#e8f5e9",
  errorContainer: "#ffdad6",
  onErrorContainer: "#93000a",
  white: "#ffffff",
};

const PIE_COLORS = [
  "#003d4d",
  "#df8f00",
  "#516072",
  "#79a8ba",
  "#c0c8cc",
  "#002631",
];

const FILTER_PRESETS = [
  { label: "Today", value: "today" },
  { label: "Week", value: "7d" }, // ✅ fixed typo (was "Weak")
  // { label: "30 Days", value: "30d" },
  { label: "Monthly", value: "monthly" },
  { label: "Yearly", value: "yearly" },
  { label: "Custom", value: "custom" },
];

// ─── Quick actions shown inline in the filter bar, per role ───────────────────
// ✅ Moved out of SuperAdminDashboard's standalone "Quick Actions" Paper so the
// pill buttons render to the right of the Period filter bar instead.
const QUICK_ACTIONS_BY_ROLE = {
  super_admin: [
    { icon: PeopleIcon, title: "Manage Clients", path: "/admin/clients" },
    { icon: AssignmentIcon, title: "Checklists", path: "/admin/checklists" },
    { icon: AnalyticsIcon, title: "Reports", path: "/admin/reports" },
  ],
  admin: [
    { icon: AddCircleIcon, title: "New Checklist", path: "/admin/create-checklist/custom" },
    { icon: PersonAddIcon, title: "Add Team Member", path: "/admin/team" },
    { icon: InventoryIcon, title: "Add Asset", path: "/admin/assets/add" },
    { icon: AnalyticsIcon, title: "Reports", path: "/admin/reports" },
  ],
};

// ─── Helpers ───────────────────────────────────────────────────────────────────
const num = (n, fallback = 0) => {
  const value = Number(n);
  return Number.isFinite(value) ? value : fallback;
};
const fmt = (n) => {
  if (n === undefined || n === null) return "—";
  const value = Number(n);
  return Number.isFinite(value) ? value.toLocaleString("en-IN") : "—";
};
const pct = (n) => `${n ?? 0}%`;
const fmtRs = (n) => `₹${fmt(n)}`;

// CSV export
const doCSV = (data, filename) => {
  const flat = (obj, pre = "") => {
    const r = {};
    for (const k in obj) {
      if (
        typeof obj[k] === "object" &&
        !Array.isArray(obj[k]) &&
        obj[k] !== null
      )
        Object.assign(r, flat(obj[k], `${pre}${k}_`));
      else
        r[`${pre}${k}`] = Array.isArray(obj[k])
          ? JSON.stringify(obj[k])
          : obj[k];
    }
    return r;
  };
  const fd = flat(data);
  const hdrs = Object.keys(fd);
  const rows = [
    hdrs.join(","),
    hdrs
      .map((h) => {
        const v = fd[h];
        return typeof v === "string" ? `"${v.replace(/"/g, '""')}"` : (v ?? "");
      })
      .join(","),
  ];
  const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Excel export (requires SheetJS: npm install xlsx)
const doExcel = async (data, filename) => {
  const XLSX = await import("xlsx");
  const flat = (obj, pre = "") => {
    const r = {};
    for (const k in obj) {
      if (
        typeof obj[k] === "object" &&
        !Array.isArray(obj[k]) &&
        obj[k] !== null
      )
        Object.assign(r, flat(obj[k], `${pre}${k}_`));
      else
        r[`${pre}${k}`] = Array.isArray(obj[k])
          ? JSON.stringify(obj[k])
          : obj[k];
    }
    return r;
  };
  const ws = XLSX.utils.json_to_sheet([flat(data)]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Dashboard");
  XLSX.writeFile(wb, `${filename}.xlsx`);
};

// PDF export
const doPDF = async (overview, filename) => {
  const { default: html2pdf } = await import("html2pdf.js");
  const stamp = new Date().toLocaleString("en-IN", {
    dateStyle: "long",
    timeStyle: "short",
  });
  const el = document.createElement("div");
  el.style.cssText =
    "padding:36px 40px;font-family:Arial,sans-serif;max-width:860px;";
  el.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;border-bottom:3px solid #002631;padding-bottom:16px">
      <div>
        <h1 style="color:#002631;font-size:22px;font-weight:800;margin:0">Dashboard Report</h1>
        <p style="color:#516072;font-size:11px;margin:4px 0 0">Generated: ${stamp}</p>
      </div>
      <div style="background:#003d4d;color:#fff;padding:5px 14px;border-radius:20px;font-size:10px;font-weight:600">CONFIDENTIAL</div>
    </div>
    <h2 style="color:#002631;font-size:13px;font-weight:700;margin:24px 0 12px">Overview Metrics</h2>
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
      <thead><tr>
        <th style="background:#002631;color:#fff;padding:8px 12px;text-align:left">Metric</th>
        <th style="background:#002631;color:#fff;padding:8px 12px;text-align:left">Value</th>
      </tr></thead>
      <tbody>${Object.entries(overview)
        .map(
          ([k, v]) =>
            `<tr><td style="padding:7px 12px;border-bottom:1px solid #e0e3e5">${k.replace(/([A-Z])/g, " $1").trim()}</td>
        <td style="padding:7px 12px;border-bottom:1px solid #e0e3e5">${v}</td></tr>`,
        )
        .join("")}</tbody>
    </table>
    <p style="color:#71787c;font-size:10px;text-align:center;margin-top:36px;padding-top:12px;border-top:1px solid #e0e3e5">Confidential — Internal Use Only</p>`;
  document.body.appendChild(el);
  await html2pdf()
    .set({
      margin: 0.5,
      filename: `${filename}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    })
    .from(el)
    .save();
  document.body.removeChild(el);
};

// ─── Reusable Components ───────────────────────────────────────────────────────

const StatCard = ({
  icon: Icon,
  title,
  value,
  sub,
  loading,
  trend,
  trendUp,
  onClick,
}) => {
  return (
    <Zoom in style={{ transitionDelay: "60ms" }}>
      <Paper
        elevation={0}
        onClick={onClick}
        sx={{
          position: "relative",
          overflow: "hidden",
          p: { xs: 2, sm: 2.5 },
          borderRadius: 3,
          height: "100%",
          minHeight: { xs: 156, sm: 174, lg: 190, xl: 176 },
          width: "100%",
          minWidth: 0,
          background: `linear-gradient(135deg, ${C.primary} 0%, ${C.primaryLight} 100%)`,
          cursor: onClick ? "pointer" : "default",
          transition: "transform 0.3s ease, box-shadow 0.3s ease",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: `0 10px 28px ${alpha(C.primary, 0.35)}`,
          },
        }}
      >
        {/* decorative glow circles */}
        <Box
          sx={{
            position: "absolute",
            width: 140,
            height: 140,
            borderRadius: "50%",
            bgcolor: alpha("#ffffff", 0.04),
            top: -50,
            right: -40,
          }}
        />
        <Box
          sx={{
            position: "absolute",
            width: 90,
            height: 90,
            borderRadius: "50%",
            bgcolor: alpha("#ffffff", 0.05),
            bottom: -30,
            left: -20,
          }}
        />

        <Box sx={{ position: "relative", zIndex: 1 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="flex-start"
            mb={1.5}
          >
            <Box
              sx={{
                p: 1,
                borderRadius: 2,
                bgcolor: alpha("#ffffff", 0.1),
              }}
            >
              <Icon sx={{ fontSize: 20, color: "#ffffff" }} />
            </Box>
            {trend && (
              <Chip
                icon={
                  trendUp ? (
                    <TrendingUpIcon sx={{ fontSize: "12px !important" }} />
                  ) : (
                    <TrendingDownIcon sx={{ fontSize: "12px !important" }} />
                  )
                }
                label={trend}
                size="small"
                sx={{
                  height: 22,
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  bgcolor: alpha("#ffffff", 0.12),
                  color: trendUp ? "#7fd99a" : "#ff9d94",
                  "& .MuiChip-icon": { color: "inherit" },
                }}
              />
            )}
          </Box>

          <Typography
            sx={{
              fontWeight: 800,
              fontSize: { xs: "1.4rem", sm: "1.7rem" },
              color: "#ffffff",
              lineHeight: 1,
              mb: 0.75,
            }}
          >
            {loading ? (
              <Skeleton width={60} sx={{ bgcolor: alpha("#fff", 0.15) }} />
            ) : (
              value
            )}
          </Typography>

          <Typography
            sx={{
              fontSize: "0.72rem",
              fontWeight: 500,
              color: alpha("#ffffff", 0.65),
              lineHeight: 1.25,
              overflowWrap: "anywhere",
            }}
          >
            {title}
          </Typography>

          {sub && (
            <Typography
              sx={{
                fontSize: "0.65rem",
                color: alpha("#ffffff", 0.45),
                mt: 0.5,
                lineHeight: 1.35,
                overflowWrap: "anywhere",
              }}
            >
              {sub}
            </Typography>
          )}
        </Box>
      </Paper>
    </Zoom>
  );
};

const SectionTitle = ({ icon: Icon, title, chip }) => (
  <Box display="flex" alignItems="center"  gap={1} mb={2}>
    <Icon sx={{ color: C.primaryLight, fontSize: 20 }} />
    <Typography sx={{ fontWeight: 700, color: C.primary, fontSize: "0.95rem" }}>
      {title}
    </Typography>
    {chip && (
      <Chip
        label={chip}
        size="small"
        sx={{
          ml: "auto",
          bgcolor: C.surfaceContainerLow,
          fontWeight: 700,
          fontSize: "0.7rem",
        }}
      />
    )}
  </Box>
);

// ✅ ChartCard: removed fixed width, now fully fluid
const ChartCard = ({ title, sub, children, minH = 280, action }) => (
  <Paper
    elevation={0}
    sx={{
      p: { xs: 2, sm: 2.5 },
      borderRadius: 3,
      height: "100%",
      width: "100%",
      minWidth: 0,
      bgcolor: C.white,
      border: `1px solid ${alpha(C.outlineVariant, 0.5)}`,
      minHeight: { xs: 240, sm: minH }, // ✅ smaller minimum on mobile
    }}
  >
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="flex-start"
      mb={sub ? 0.5 : 2}
    >
      <Typography
        sx={{
          fontWeight: 700,
          color: C.primary,
          fontSize: { xs: "0.8rem", sm: "0.85rem" }, // ✅ fluid
        }}
      >
        {title}
      </Typography>
      {action}
    </Box>
    {sub && (
      <Typography sx={{ fontSize: "0.7rem", color: C.outline, mb: 2 }}>
        {sub}
      </Typography>
    )}
    {children}
  </Paper>
);

const EmptyChart = ({ msg = "No data available" }) => (
  <Box display="flex" alignItems="center" justifyContent="center" height={220}>
    <Typography sx={{ color: C.outline, fontSize: "0.8rem" }}>{msg}</Typography>
  </Box>
);

// ✅ ActivityTable: wrapped in overflow scroll container for mobile
// ─── REPLACE ActivityTable ─────────────────────────────────────────────────────
const ActivityTable = ({ activities }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [showAll, setShowAll] = useState(false);

  const displayed = isMobile
    ? showAll
      ? activities
      : activities.slice(0, 3)
    : activities;

  if (isMobile) {
    return (
      <Box>
        <Stack spacing={1} sx={{ p: 1.5 }}>
          {displayed.map((act, i) => (
            <Box
              key={i}
              sx={{
                p: 1.5,
                borderRadius: 2,
                bgcolor: C.surfaceContainerLow,
                border: `1px solid ${alpha(C.outlineVariant, 0.4)}`,
              }}
            >
              {/* Row 1: Action chip + When */}
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.75}>
                <Chip
                  label={act.action?.replace(/_/g, " ")}
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: "0.6rem",
                    fontWeight: 700,
                    bgcolor:
                      act.action === "CREATE"
                        ? C.successLight
                        : act.action?.includes("DELETE")
                          ? C.errorContainer
                          : act.action === "EMAIL_SENT"
                            ? alpha(C.accent, 0.12)
                            : C.surfaceVariant,
                    color:
                      act.action === "CREATE"
                        ? C.success
                        : act.action?.includes("DELETE")
                          ? C.onErrorContainer
                          : act.action === "EMAIL_SENT"
                            ? C.accent
                            : C.secondary,
                  }}
                />
                <Typography sx={{ fontSize: "0.65rem", color: C.outline }}>
                  {act.timestamp
                    ? new Date(act.timestamp).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "—"}
                </Typography>
              </Box>
              {/* Row 2: Description */}
              <Typography sx={{ fontSize: "0.72rem", color: C.secondary, mb: 0.5 }}>
                {act.description || act.desc || "—"}
              </Typography>
              {/* Row 3: User + Role chip */}
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography sx={{ fontSize: "0.7rem", color: C.primary, fontWeight: 600 }}>
                  {act.actor?.email || act.actor || "—"}
                </Typography>
                <Chip
                  label={act.actor?.role || act.role || "—"}
                  size="small"
                  sx={{
                    height: 16,
                    fontSize: "0.58rem",
                    bgcolor: alpha(C.primaryLight, 0.08),
                    color: C.primaryLight,
                  }}
                />
              </Box>
            </Box>
          ))}
        </Stack>

        {/* View All / collapse toggle */}
        {activities.length > 3 && (
          <Box
            onClick={() => setShowAll((p) => !p)}
            sx={{
              py: 1.25,
              textAlign: "center",
              borderTop: `1px solid ${alpha(C.outlineVariant, 0.3)}`,
              cursor: "pointer",
            }}
          >
            <Typography
              sx={{
                fontSize: "0.72rem",
                fontWeight: 700,
                color: C.primaryLight,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              {showAll ? "Show Less" : "View All Activities"}
            </Typography>
          </Box>
        )}
      </Box>
    );
  }

  // ── Desktop: original table, unchanged ──
  return (
    <TableContainer sx={{ maxHeight: 500, overflowX: "auto" }}>
      <Table stickyHeader size="small" sx={{ minWidth: 1130 }}>
        <TableHead>
          <TableRow>
            {["Action", "Description", "User", "Role", "When"].map((h) => (
              <TableCell
                key={h}
                sx={{
                  fontWeight: 700,
                  color: C.secondary,
                  bgcolor: C.surfaceContainerLow,
                  fontSize: "0.72rem",
                  whiteSpace: "nowrap",
                }}
              >
                {h}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {activities.length > 0 ? (
            activities.map((act, i) => (
              <TableRow
                key={i}
                hover
                sx={{ "&:hover": { bgcolor: C.surfaceContainerLow } }}
              >
                <TableCell>
                  <Chip
                    label={act.action?.replace(/_/g, " ")}
                    size="small"
                    sx={{
                      height: 18,
                      fontSize: "0.6rem",
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                      bgcolor:
                        act.action === "CREATE"
                          ? C.successLight
                          : act.action?.includes("DELETE")
                            ? C.errorContainer
                            : act.action === "EMAIL_SENT"
                              ? alpha(C.accent, 0.12)
                              : C.surfaceContainerLow,
                      color:
                        act.action === "CREATE"
                          ? C.success
                          : act.action?.includes("DELETE")
                            ? C.onErrorContainer
                            : act.action === "EMAIL_SENT"
                              ? C.accent
                              : C.secondary,
                    }}
                  />
                </TableCell>
                <TableCell sx={{ maxWidth: { xs: 140, sm: 220 } }}>
                  <Typography sx={{ fontSize: "0.72rem", color: C.secondary }}>
                    {act.description || act.desc || "—"}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography
                    sx={{
                      fontSize: "0.72rem",
                      color: C.primary,
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {act.actor?.email || act.actor || "—"}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={act.actor?.role || act.role || "—"}
                    size="small"
                    sx={{
                      height: 18,
                      fontSize: "0.6rem",
                      bgcolor: alpha(C.primaryLight, 0.08),
                      color: C.primaryLight,
                      whiteSpace: "nowrap",
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Typography
                    sx={{
                      fontSize: "0.7rem",
                      color: C.outline,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {act.timestamp
                      ? new Date(act.timestamp).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "—"}
                  </Typography>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                <Typography sx={{ color: C.secondary, width: "100%", fontSize: "0.8rem" }}>
                  No recent activities
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

// ─── REPLACE NotifList — only change: remove width: "1090px" → width: "100%" ──
const NotifList = ({ notifications }) => (
  <Stack spacing={1}>
    {notifications.length > 0 ? (
      notifications.map((n, i) => (
        <Box
          key={i}
          sx={{
            p: 1.5,
            
            borderRadius: 2,
            width: "100%",
            minWidth: 0,
            bgcolor: C.surfaceContainerLow,
            border: `1px solid ${alpha(C.outlineVariant, 0.4)}`,
          }}
        >
          {/* rest unchanged */}
          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
            <Typography
              sx={{ fontSize: "0.75rem",  fontWeight: 700, color: C.primary, flex: 1, pr: 1 }}
            >
              {n.title}
            </Typography>
            <Chip
              label={n.priority}
              size="small"
              sx={{
                height: 16,
                fontSize: "0.55rem",
                fontWeight: 700,
                flexShrink: 0,
                bgcolor:
                  n.priority === "high"
                    ? C.errorContainer
                    : n.priority === "medium"
                      ? alpha(C.accent, 0.12)
                      : C.surfaceVariant,
                color:
                  n.priority === "high"
                    ? C.onErrorContainer
                    : n.priority === "medium"
                      ? C.accent
                      : C.secondary,
              }}
            />
          </Box>
          <Typography sx={{ fontSize: "0.68rem", color: C.secondary, mt: 0.5 }}>
            {n.message || n.msg}
          </Typography>
          <Typography sx={{ fontSize: "0.6rem", color: C.outline, mt: 0.75 }}>
            {n.createdAt
              ? new Date(n.createdAt).toLocaleString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "—"}
          </Typography>
        </Box>
      ))
    ) : (
      <Typography
        sx={{ fontSize: "0.8rem", width: "100%", color: C.secondary, textAlign: "center", py: 2 }}
      >
        No notifications
      </Typography>
    )}
  </Stack>
);

// ─── Filter Bar ────────────────────────────────────────────────────────────────
// ✅ Now accepts an `actions` prop — when present, quick-action pill buttons
// render right-aligned next to the Period filters (previously a separate
// "Quick Actions" Paper block lower on the page for super_admin).
const FilterBar = ({ activeFilter, onFilterChange, loading, actions = [] }) => {
  const navigate = useNavigate();
  const [showCustom, setShowCustom] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handlePreset = (preset) => {
    if (preset === "custom") {
      setShowCustom(true);
      return;
    }
    setShowCustom(false);
    onFilterChange({ preset });
  };

  const applyCustom = () => {
    if (!startDate || !endDate) return;
    onFilterChange({ preset: "custom", startDate, endDate });
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 1.25, sm: 1.5 },
        borderRadius: 2.5,
        mb: 3,
        bgcolor: C.white,
        border: `1px solid ${alpha(C.outlineVariant, 0.5)}`,
      }}
    >
      {/* ✅ Period filters (left) + quick-action pills (right), wraps on small screens */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent={{ xs: "flex-start", lg: "space-between" }}
        gap={1.5}
        flexWrap="wrap"
        sx={{ rowGap: 1.25, width: "100%" }}
      >
        {/* Left side: Period filters */}
        <Box
          display="flex"
          alignItems="center"
          gap={1}
          flexWrap="wrap"
          sx={{ rowGap: 1, minWidth: 0, flex: "1 1 360px" }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              color: C.secondary,
              mr: 0.5,
            }}
          >
            <FilterListIcon sx={{ fontSize: 16 }} />
            <Typography
              sx={{
                fontSize: "0.72rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Period
            </Typography>
          </Box>
          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
          <Box display="flex" gap={0.75} flexWrap="wrap" sx={{ rowGap: 0.75 }}>
            {FILTER_PRESETS.map((p) => (
              <Button
                key={p.value}
                size="small"
                variant={
                  activeFilter?.preset === p.value ? "contained" : "outlined"
                }
                onClick={() => handlePreset(p.value)}
                disabled={loading}
                sx={{
                  height: 28,
                  minWidth: "auto",
                  px: { xs: 1, sm: 1.5 },
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  borderRadius: 2,
                  textTransform: "none",
                  ...(activeFilter?.preset === p.value
                    ? {
                        bgcolor: C.primaryLight,
                        borderColor: C.primaryLight,
                        color: "#fff",
                        "&:hover": { bgcolor: C.primary },
                      }
                    : {
                        borderColor: C.outlineVariant,
                        color: C.secondary,
                        bgcolor: "transparent",
                        "&:hover": {
                          borderColor: C.primaryLight,
                          color: C.primaryLight,
                          bgcolor: alpha(C.primaryLight, 0.04),
                        },
                      }),
                }}
              >
                {p.label}
              </Button>
            ))}
          </Box>
        </Box>

        {/* Right side: Quick action pills (e.g. Manage Clients / Checklists / Reports) */}
        {actions.length > 0 && (
          <Box
            display="flex"
            gap={1}
            flexWrap="wrap"
            sx={{
              rowGap: 1,
              justifyContent: { xs: "flex-start", md: "flex-end" },
              flex: { xs: "1 1 100%", lg: "0 1 auto" },
              minWidth: 0,
            }}
          >
            {actions.map((act, i) => (
              <Button
                key={i}
                onClick={() => navigate(act.path)}
                startIcon={<act.icon sx={{ fontSize: 16 }} />}
                disabled={loading}
                sx={{
                  bgcolor: C.primaryLight,
                  color: "#fff",
                  borderRadius: 999,
                  px: { xs: 1.25, sm: 2 },
                  height: 32,
                  fontSize: { xs: "0.68rem", sm: "0.74rem" },
                  fontWeight: 600,
                  textTransform: "none",
                  boxShadow: "none",
                  whiteSpace: "nowrap",
                  "&:hover": { bgcolor: C.primary },
                }}
              >
                {act.title}
              </Button>
            ))}
          </Box>
        )}
      </Box>

      <Collapse in={showCustom}>
        {/* ✅ Date pickers stack vertically on xs */}
        <Box
          display="flex"
          alignItems={{ xs: "stretch", sm: "center" }}
          gap={1.5}
          mt={1.5}
          flexWrap="wrap"
          flexDirection={{ xs: "column", sm: "row" }}
        >
          <TextField
            type="date"
            size="small"
            label="Start date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{
              flex: { xs: "1 1 100%", sm: "0 0 auto" },
              "& .MuiInputBase-root": { fontSize: "0.8rem", height: 36 },
            }}
          />
          <Typography
            sx={{
              color: C.outline,
              fontSize: "0.75rem",
              display: { xs: "none", sm: "block" },
            }}
          >
            to
          </Typography>
          <TextField
            type="date"
            size="small"
            label="End date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{
              flex: { xs: "1 1 100%", sm: "0 0 auto" },
              "& .MuiInputBase-root": { fontSize: "0.8rem", height: 36 },
            }}
          />
          <Box display="flex" gap={1}>
            <Button
              size="small"
              variant="contained"
              onClick={applyCustom}
              disabled={!startDate || !endDate || loading}
              sx={{
                height: 36,
                px: 2,
                fontSize: "0.75rem",
                textTransform: "none",
                bgcolor: C.primaryLight,
                "&:hover": { bgcolor: C.primary },
              }}
            >
              Apply
            </Button>
            <Button
              size="small"
              variant="text"
              onClick={() => setShowCustom(false)}
              sx={{
                height: 36,
                fontSize: "0.75rem",
                textTransform: "none",
                color: C.secondary,
              }}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Collapse>
    </Paper>
  );
};

// ─── Responsive chart height hook ─────────────────────────────────────────────
// Returns a chart height appropriate to screen width
const useChartHeight = (defaultH = 240, mobileH = 200) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  return isMobile ? mobileH : defaultH;
};

// ─── SUPER ADMIN VIEW ──────────────────────────────────────────────────────────
const SuperAdminDashboard = ({ data, loading }) => {
  const chartH = useChartHeight(240, 190);

  // Server returns nested under data.data or flat — handle both shapes
  const payload = data?.data || data || {};
  const summary = payload.summary || {};
  const distribution = payload.distribution || {};
  const charts_ = payload.charts || {};
  const activities = payload.recentActivities || [];
  const notifications = payload.notifications || [];

  const clientsByPlan = useMemo(
    () =>
      (distribution.clientByPlan || []).map((p) => ({
        name: p.name,
        value: p.value,
      })),
    [distribution],
  );
  const requestByUrgency = useMemo(
    () =>
      (distribution.requestByUrgency || []).map((r) => ({
        name: r.name,
        value: r.value,
      })),
    [distribution],
  );
  const assignByPriority = useMemo(
    () =>
      (distribution.assignmentByPriority || []).map((a) => ({
        name: a.name,
        value: a.value,
      })),
    [distribution],
  );
  const revTrend = useMemo(
    () =>
      (charts_.revenueTrend || []).map((r) => ({
        period: r.period,
        revenue: r.revenue ?? 0,
      })),
    [charts_],
  );
  const assignTrend = useMemo(() => charts_.assignmentTrend || [], [charts_]);

  // Keep zero-value bars visible as a thin sliver so groups don't look broken/misaligned
  const MIN_BAR = 0.06;
  const assignTrendDisplay = useMemo(
    () =>
      assignTrend.map((d) => ({
        ...d,
        _created: d.created,
        _completed: d.completed,
        _overdue: d.overdue,
        created: d.created === 0 ? MIN_BAR : d.created,
        completed: d.completed === 0 ? MIN_BAR : d.completed,
        overdue: d.overdue === 0 ? MIN_BAR : d.overdue,
      })),
    [assignTrend],
  );



  const statCards = [
    {
      icon: PeopleIcon,
      title: "Total Customer",
      value: fmt(summary.totalClients),
      sub: ``,
      trend: summary.clientGrowth ? `${summary.clientGrowth}%` : null,
      trendUp: (summary.clientGrowth ?? 0) >= 0,
    },
    {
  icon: PeopleIcon,
  title: "Active Customers",
  value: fmt(summary.activeSubscriptions),
  sub: ``,
  trend: summary.clientGrowth ? `${summary.clientGrowth}%` : null,
  trendUp: (summary.clientGrowth ?? 0) >= 0,
},
    {
      icon: AssignmentIcon,
      title: "Checklists",
      value: fmt(summary.totalChecklists),
      sub: `${fmt(summary.publishedChecklists)} published`,
    },
    {
      icon: TaskAltIcon,
      title: "Assignments",
      value: fmt(
        summary.totalAssignments ??
          num(summary.pendingAssignments) + num(summary.completedAssignments),
      ),
      sub: `${fmt(summary.pendingAssignments)} pending · ${fmt(summary.completedAssignments)} done`,
    },
  ];

  // ✅ NOTE: the standalone "Quick Actions" Paper block (Manage Clients /
  // Checklists / Reports) that used to render here has been removed.
  // Those same pill buttons now render inline in the FilterBar, to the
  // right of the Period filters — see QUICK_ACTIONS_BY_ROLE.super_admin
  // and the <FilterBar actions={...} /> usage in the root Dashboard component.

  return (
    <Box>
      {/* ✅ 2-col on sm, 4-col on lg */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            lg: "repeat(4, minmax(0, 1fr))",
          },
          gap: { xs: 1.5, sm: 2 },
          mb: 3,
        }}
      >
        {statCards.map((s, i) => (
          <StatCard {...s} loading={loading} key={i} />
        ))}
      </Box>

      {/* Revenue trend + Clients by plan */}
      {/* ✅ Both charts full-width on mobile, split on md+ */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "minmax(0, 2fr) minmax(280px, 1fr)" },
          gap: { xs: 1.5, sm: 2 },
          mb: 3,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <ChartCard
            title="Revenue trend"
            sub="Monthly recurring revenue over period"
          >
            {revTrend.some((r) => r.revenue > 0) ? (
              <ResponsiveContainer width="100%" height={chartH}>
                <AreaChart data={revTrend}>
                  <defs>
                    <linearGradient id="revG" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor={C.primaryLight}
                        stopOpacity={0.25}
                      />
                      <stop
                        offset="95%"
                        stopColor={C.primaryLight}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={alpha(C.outline, 0.12)}
                  />
                  <XAxis
                    dataKey="period"
                    tick={{ fontSize: 10, fill: C.secondary }}
                    interval="preserveStartEnd"
                  />
                  <YAxis tick={{ fontSize: 10, fill: C.secondary }} width={48} />
                  <RTooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: `1px solid ${C.outlineVariant}`,
                      fontSize: "0.75rem",
                    }}
                    formatter={(v) => [`₹${v.toLocaleString()}`, "Revenue"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke={C.primaryLight}
                    fill="url(#revG)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart msg="No revenue data for this period" />
            )}
          </ChartCard>
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <ChartCard title="Clients by plan">
            {clientsByPlan.length > 0 ? (
              <ResponsiveContainer width="100%" height={chartH}>
                <PieChart>
                  <Pie
                    data={clientsByPlan}
                    cx="50%"
                    cy="50%"
                    innerRadius="50%"
                    outerRadius="72%"
                    dataKey="value"
                    paddingAngle={3}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {clientsByPlan.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <RTooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart />
            )}
          </ChartCard>
        </Box>
      </Box>

      {/* Assignment trend + Request urgency */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "minmax(0, 2fr) minmax(280px, 1fr)" },
          gap: { xs: 1.5, sm: 2 },
          mb: 3,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <ChartCard
            title="Assignment overview"
            sub="Created vs completed over period"
          >
            {assignTrend.some((d) => d.created > 0 || d.completed > 0) ? (
              <ResponsiveContainer width="100%" height={chartH}>
                <BarChart data={assignTrend} barSize={18}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={alpha(C.outline, 0.12)}
                  />
                  <XAxis
                    dataKey="period"
                    tick={{ fontSize: 10, fill: C.secondary }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: C.secondary }}
                    allowDecimals={false}
                    width={32}
                  />
                  <RTooltip contentStyle={{ borderRadius: 8, fontSize: "0.75rem" }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar
                    dataKey="created"
                    name="Created"
                    fill={C.primaryLight}
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="completed"
                    name="Completed"
                    fill={C.success}
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="overdue"
                    name="Overdue"
                    fill={C.onErrorContainer}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart msg="No assignment data for this period" />
            )}
          </ChartCard>
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <ChartCard title="Requests by urgency">
            {requestByUrgency.length > 0 ? (
              <ResponsiveContainer width="100%" height={chartH}>
                <PieChart>
                  <Pie
                    data={requestByUrgency}
                    cx="50%"
                    cy="50%"
                    outerRadius="70%"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {requestByUrgency.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <RTooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart msg="No request data" />
            )}
          </ChartCard>
        </Box>
      </Box>

      {/* Activities + Notifications side by side */}
      {/* ✅ Stack vertically on mobile */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr)",
          gap: { xs: 1.5, sm: 2 },
          mb: 3,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              overflow: "hidden",
              width: "100%",
              minWidth: 0,
              border: `1px solid ${alpha(C.outlineVariant, 0.5)}`,
            }}
          >
            <Box
              sx={{
                px: { xs: 2, sm: 2.5 },
                py: 2,
                borderBottom: `1px solid ${alpha(C.outlineVariant, 0.3)}`,
              }}
            >
              <SectionTitle
                icon={HistoryIcon}
                title="Recent Activities"
                chip={activities.length}
              />
            </Box>
            <ActivityTable activities={activities} />
          </Paper>
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              p: { xs: 2, sm: 2.5 },
              border: `1px solid ${alpha(C.outlineVariant, 0.5)}`,
              height: "100%",
            }}
          >
            <SectionTitle
              icon={NotifIcon}
              title="Notifications"
              chip={`${notifications.length} unread`}
            />
            <NotifList notifications={notifications} />
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

// ─── ADMIN VIEW ────────────────────────────────────────────────────────────────
const AdminDashboard = ({ data, loading }) => {
  const chartH = useChartHeight(240, 190);

  const payload = data?.data || data || {};
  const summary = payload.summary || {};
  const distribution = payload.distribution || {};
  const charts_ = payload.charts || {};
  const activities = payload.recentActivities || [];
  const notifications = payload.notifications || [];
  const amcExpiryManagement = payload.amcExpiryManagement || {};
  const expiryByType = amcExpiryManagement.byType || {};
  const expiryItems = amcExpiryManagement.items || [];
  const emptyExpirySummary = {
    totalTracked: 0,
    expired: 0,
    dueSoon: 0,
    upcoming: 0,
    active: 0,
    attentionCount: 0,
  };
  const amcSummary = expiryByType.AMC || emptyExpirySummary;
  const camcSummary = expiryByType.CAMC || emptyExpirySummary;
  const attentionExpiryItems = expiryItems.filter((item) =>
    ["Expired", "Due Soon"].includes(item.status),
  );

  const assetByCategory = useMemo(
    () =>
      (distribution.assetByStatus || []).map((a) => ({
        name: a.name,
        value: a.value,
      })),
    [distribution],
  );
  const teamByStatus = useMemo(
    () =>
      (distribution.teamByStatus || [])
        .filter((t) => t.value > 0)
        .map((t) => ({
          name: t.name,
          value: t.value,
        })),
    [distribution],
  );
  const inspTrend = useMemo(
    () =>
      (charts_.submissionTrend || [])
        .slice(-14)
        .map((d) => ({ ...d, date: d.period?.slice(5) || d.period })),
    [charts_],
  );
  const assignTrend = useMemo(() => charts_.assignmentTrend || [], [charts_]);

  // Keep zero-value bars visible as a thin sliver so groups don't look broken/misaligned
  const MIN_BAR = 0.06;
  const assignTrendDisplay = useMemo(
    () =>
      assignTrend.map((d) => ({
        ...d,
        _created: d.created,
        _completed: d.completed,
        _overdue: d.overdue,
        created: d.created === 0 ? MIN_BAR : d.created,
        completed: d.completed === 0 ? MIN_BAR : d.completed,
        overdue: d.overdue === 0 ? MIN_BAR : d.overdue,
      })),
    [assignTrend],
  );
  const topPerformers = useMemo(() => payload.topPerformers || [], [payload]);

  const statCards = [
    {
      icon: GroupIcon,
      title: "Team Members",
      value: fmt(summary.totalTeamMembers),
      sub: `${fmt(summary.activeTeamMembers)} active`,
      trend: summary.teamGrowth ? `${summary.teamGrowth}%` : null,
      trendUp: true,
    },
    {
      icon: InventoryIcon,
      title: "Total Assets",
      value: fmt(summary.totalAssets),
      sub: `${fmt(summary.activeAssets)} active · ${fmt(summary.assetsNeedingAttention)} need attention`,
    },
    {
      icon: AssignmentIcon,
      title: "Checklists",
      value: fmt(summary.totalChecklists),
      sub: `${fmt(summary.publishedChecklists)} published`,
    },
    {
      icon: TaskAltIcon,
      title: "Submissions",
      value: fmt(num(summary.pendingSubmissions) + num(summary.pendingReviewsCount)),
      sub: `${fmt(summary.pendingReviewsCount)} pending review`,
      accent: true,
    },
    {
      icon: CalendarIcon,
      title: "AMC Expiry",
      value: fmt(amcSummary.attentionCount),
      sub: `${fmt(amcSummary.expired)} expired - ${fmt(amcSummary.dueSoon)} due soon`,
    },
    {
      icon: CalendarIcon,
      title: "CAMC Expiry",
      value: fmt(camcSummary.attentionCount),
      sub: `${fmt(camcSummary.expired)} expired - ${fmt(camcSummary.dueSoon)} due soon`,
    },
  ];

  return (
    <Box>
      {/* ✅ Stat cards: 1-col xs, 2-col sm, 4-col lg */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            md: "repeat(3, minmax(0, 1fr))",
            lg: "repeat(3, minmax(0, 1fr))",
            xl: "repeat(6, minmax(0, 1fr))",
          },
          gap: { xs: 1.5, sm: 2 },
          mb: 3,
        }}
      >
        {statCards.map((s, i) => (
          <StatCard {...s} loading={loading} key={i} />
        ))}
      </Box>

      {/* Quick Actions — unchanged: this is the larger card-style grid,
          a different pattern from the super_admin pill buttons that moved
          into the FilterBar. Left as-is here. */} 

      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          mb: 3,
          border: `1px solid ${alpha(C.outlineVariant, 0.5)}`,
        }}
      >
        <Box
          sx={{
            px: { xs: 2, sm: 2.5 },
            py: 2,
            borderBottom: `1px solid ${alpha(C.outlineVariant, 0.3)}`,
          }}
        >
          <SectionTitle
            icon={CalendarIcon}
            title="AMC / CAMC Expiry Details"
            chip={`${fmt(attentionExpiryItems.length)} due`}
          />
        </Box>
        {attentionExpiryItems.length > 0 ? (
          <TableContainer sx={{ overflowX: "auto" }}>
            <Table size="small" sx={{ minWidth: 720 }}>
              <TableHead>
                <TableRow>
                  {["Type", "Asset", "Asset ID", "Schedule", "Next Due", "Days", "Status"].map((h) => (
                    <TableCell
                      key={h}
                      sx={{
                        fontWeight: 700,
                        color: C.secondary,
                        bgcolor: C.surfaceContainerLow,
                        fontSize: "0.72rem",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {attentionExpiryItems.map((item) => (
                  <TableRow key={`${item.assetId}-${item.systemType}`} hover>
                    <TableCell>
                      <Chip
                        label={item.systemType}
                        size="small"
                        sx={{
                          height: 22,
                          fontSize: "0.65rem",
                          fontWeight: 700,
                          bgcolor: alpha(C.primaryLight, 0.08),
                          color: C.primaryLight,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontWeight: 600, fontSize: "0.75rem", whiteSpace: "nowrap" }}>
                        {item.assetName || "Unnamed Asset"}
                      </Typography>
                      <Typography sx={{ fontSize: "0.65rem", color: C.outline }}>
                        {item.assetStatus || "Status not set"}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.72rem", color: C.secondary, whiteSpace: "nowrap" }}>
                      {item.assetCode || "-"}
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.72rem", color: C.secondary, whiteSpace: "nowrap" }}>
                      {item.schedule || "Not set"}
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.72rem", whiteSpace: "nowrap" }}>
                      {item.nextDueDate
                        ? new Date(item.nextDueDate).toLocaleDateString("en-IN")
                        : "-"}
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.72rem", whiteSpace: "nowrap" }}>
                      {item.daysRemaining < 0
                        ? `${Math.abs(item.daysRemaining)}d overdue`
                        : `${item.daysRemaining}d left`}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={item.status}
                        size="small"
                        sx={{
                          height: 22,
                          fontSize: "0.65rem",
                          fontWeight: 700,
                          bgcolor:
                            item.status === "Expired"
                              ? C.errorContainer
                              : alpha(C.accent, 0.14),
                          color:
                            item.status === "Expired"
                              ? C.onErrorContainer
                              : C.accent,
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box sx={{ px: { xs: 2, sm: 2.5 }, py: 3 }}>
            <Typography sx={{ color: C.outline, fontSize: "0.8rem" }}>
              No AMC or CAMC assets are expired or due in the next 30 days.
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Submission trend + Asset donut */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "minmax(0, 2fr) minmax(280px, 1fr)" },
          gap: { xs: 1.5, sm: 2 },
          mb: 3,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <ChartCard
            title="Submission trend"
            sub="Total vs approved over selected period"
          >
            {inspTrend.some((d) => d.total > 0) ? (
              <ResponsiveContainer width="100%" height={chartH}>
                <AreaChart data={inspTrend}>
                  <defs>
                    <linearGradient id="subG" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor={C.primaryLight}
                        stopOpacity={0.25}
                      />
                      <stop
                        offset="95%"
                        stopColor={C.primaryLight}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={alpha(C.outline, 0.12)}
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: C.secondary }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: C.secondary }}
                    allowDecimals={false}
                    width={32}
                  />
                  <RTooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: `1px solid ${C.outlineVariant}`,
                      fontSize: "0.75rem",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Area
                    type="monotone"
                    dataKey="total"
                    name="Total"
                    stroke={C.primaryLight}
                    fill="url(#subG)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="approved"
                    name="Approved"
                    stroke={C.success}
                    fill="transparent"
                    strokeWidth={1.5}
                    strokeDasharray="4 2"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart msg="No submission data for this period" />
            )}
          </ChartCard>
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <ChartCard title="Assets by status">
            {assetByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height={chartH}>
                <PieChart>
                  <Pie
                    data={assetByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius="50%"
                    outerRadius="72%"
                    dataKey="value"
                    paddingAngle={3}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {assetByCategory.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <RTooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart />
            )}
          </ChartCard>
        </Box>
      </Box>

      {/* Assignment trend + Top performers */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1fr) minmax(0, 1fr)" },
          gap: { xs: 1.5, sm: 2 },
          mb: 3,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <ChartCard title="Assignment trend" sub="Created, completed and overdue">
            {assignTrend.some((d) => d.created > 0) ? (
              <ResponsiveContainer width="100%" height={chartH}>
                <BarChart data={assignTrendDisplay} barGap={3} barCategoryGap="32%">
                  <CartesianGrid
                    vertical={false}
                    strokeDasharray="3 3"
                    stroke={alpha(C.outline, 0.12)}
                  />
                  <XAxis
                    dataKey="period"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: C.outlineVariant }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: C.outlineVariant }}
                    allowDecimals={false}
                    width={32}
                  />
                  <RTooltip
                    cursor={false}
                    contentStyle={{
                      borderRadius: 10,
                      border: `1px solid ${alpha(C.outlineVariant, 0.5)}`,
                      boxShadow: `0 4px 16px ${alpha(C.primary, 0.1)}`,
                      fontSize: "0.75rem",
                      padding: "10px 12px",
                    }}
                    formatter={(value, name, props) => {
                      const real = {
                        Created: "_created",
                        Completed: "_completed",
                        Overdue: "_overdue",
                      }[name];
                      return [props.payload[real], name];
                    }}
                  />
                  <Legend
                    iconType="square"
                    iconSize={10}
                    wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
                  />
                  <Bar dataKey="created" name="Created" fill={C.primary} radius={[3, 3, 0, 0]} maxBarSize={26} />
                  <Bar dataKey="completed" name="Completed" fill={C.success} radius={[3, 3, 0, 0]} maxBarSize={26} />
                  <Bar dataKey="overdue" name="Overdue" fill={C.outlineVariant} radius={[3, 3, 0, 0]} maxBarSize={26} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart msg="No assignment data for this period" />
            )}
          </ChartCard>
        </Box>

        <Box sx={{ minWidth: 0 }}>
          {topPerformers.length > 0 ? (
            <ChartCard title="Top performing team members" minH={200}>
              <Stack spacing={1.5}>
                {topPerformers.slice(0, 5).map((m, i) => (
                  <Box key={i} display="flex" alignItems="center" gap={1.5}>
                    <Avatar
                      sx={{
                        bgcolor: PIE_COLORS[i % PIE_COLORS.length],
                        width: 34,
                        height: 34,
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {m.name?.charAt(0)?.toUpperCase() || "U"}
                    </Avatar>
                    <Box flex={1} minWidth={0}>
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        mb={0.3}
                        gap={1}
                      >
                        <Typography
                          sx={{
                            fontWeight: 600,
                            fontSize: "0.78rem",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {m.name}
                        </Typography>
                        <Typography
                          sx={{
                            fontWeight: 700,
                            fontSize: "0.78rem",
                            color: C.primaryLight,
                            flexShrink: 0,
                          }}
                        >
                          {m.completionRate}%
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          height: 5,
                          borderRadius: 4,
                          bgcolor: C.surfaceVariant,
                          overflow: "hidden",
                        }}
                      >
                        <Box
                          sx={{
                            height: "100%",
                            width: `${m.completionRate}%`,
                            bgcolor: PIE_COLORS[i % PIE_COLORS.length],
                            borderRadius: 4,
                            transition: "width 0.6s ease",
                          }}
                        />
                      </Box>
                      <Typography
                        sx={{ fontSize: "0.62rem", color: C.outline, mt: 0.3 }}
                      >
                        {m.role} · {m.totalCompleted}/{m.totalAssigned} tasks
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </ChartCard>
          ) : (
            <ChartCard title="Team by status" minH={200}>
              {teamByStatus.length > 0 ? (
                <ResponsiveContainer width="100%" height={chartH}>
                  <PieChart>
                    <Pie
                      data={teamByStatus}
                      cx="50%"
                      cy="50%"
                      innerRadius="48%"
                      outerRadius="70%"
                      dataKey="value"
                      paddingAngle={3}
                      label={({ name, value }) => `${name}: ${value}`}
                      labelLine={false}
                    >
                      {teamByStatus.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <RTooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChart />
              )}
            </ChartCard>
          )}
        </Box>
      </Box>

      {/* Activities + Notifications */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr)",
          gap: { xs: 1.5, sm: 2 },
          mb: 3,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              overflow: "hidden",
              border: `1px solid ${alpha(C.outlineVariant, 0.5)}`,
            }}
          >
            <Box
              sx={{
                px: { xs: 2, sm: 2.5 },
                py: 2,
                borderBottom: `1px solid ${alpha(C.outlineVariant, 0.3)}`,
              }}
            >
              <SectionTitle
                icon={HistoryIcon}
                title="Recent Activities"
                chip={activities.length}
              />
            </Box>
            <ActivityTable activities={activities} />
          </Paper>
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              p: { xs: 2, sm: 2.5 },
              border: `1px solid ${alpha(C.outlineVariant, 0.5)}`,
              height: "100%",
              overflow: "auto",
            }}
          >
            <SectionTitle
              icon={NotifIcon}
              title="Notifications"
              chip={`${notifications.length} unread`}
            />
            <NotifList notifications={notifications} />
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

// ─── TEAM VIEW ─────────────────────────────────────────────────────────────────
const TeamDashboard = ({ data, loading }) => {
  const navigate = useNavigate();
  const chartH = useChartHeight(220, 180);

  const payload = data?.data || data || {};
  const overview = payload.overview || {};
  const member = payload.memberInfo || {};
  const upcoming = payload.upcomingTasks || [];
  const activities = payload.recentActivities || [];
  const weeklyTrend = payload.charts?.weeklyTrend || [];
  const dist = payload.charts?.taskDistribution || {};

  const distData = [
    { name: "Completed", value: dist.completed || 0, fill: C.success },
    { name: "In Progress", value: dist.inProgress || 0, fill: C.accent },
    { name: "Pending", value: dist.pending || 0, fill: C.secondary },
    { name: "Overdue", value: dist.overdue || 0, fill: C.onErrorContainer },
  ].filter((d) => d.value > 0);

  return (
    <Box>
      {/* Member banner */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 2.5 },
          borderRadius: 3,
          mb: 3,
          bgcolor: C.primaryLight,
          border: "none",
        }}
      >
        {/* ✅ Banner: stack on xs, row on sm */}
        <Box
          display="flex"
          alignItems={{ xs: "flex-start", sm: "center" }}
          gap={2}
          flexDirection={{ xs: "row" }}
          flexWrap="wrap"
        >
          <Avatar
            sx={{
              bgcolor: alpha("#fff", 0.15),
              color: "#fff",
              width: { xs: 42, sm: 50 },
              height: { xs: 42, sm: 50 },
              fontWeight: 800,
              fontSize: { xs: "1rem", sm: "1.2rem" },
              flexShrink: 0,
            }}
          >
            {member.initials || member.name?.charAt(0)?.toUpperCase() || "U"}
          </Avatar>
          <Box flex={1} minWidth={0}>
            <Typography
              sx={{
                fontWeight: 800,
                color: "#fff",
                fontSize: { xs: "0.95rem", sm: "1.1rem" },
              }}
            >
              {member.name || "Team Member"}
            </Typography>
            <Typography sx={{ color: alpha("#fff", 0.7), fontSize: "0.75rem" }}>
              {member.role}
              {member.department ? ` · ${member.department}` : ""}
            </Typography>
          </Box>
          <Box textAlign="right" flexShrink={0} ml={{ xs: "auto" }}>
            <Typography
              sx={{
                color: "#fff",
                fontWeight: 800,
                fontSize: { xs: "1.2rem", sm: "1.5rem" },
              }}
            >
              {pct(overview.completionRate)}
            </Typography>
            <Typography sx={{ color: alpha("#fff", 0.65), fontSize: "0.65rem" }}>
              Completion Rate
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ mb: 3 }}>
        {[
          {
            icon: AssignmentIcon,
            title: "Total Tasks",
            value: fmt(overview.total),
            sub: `${fmt(overview.completed)} completed`,
          },
          {
            icon: HourglassIcon,
            title: "In Progress",
            value: fmt(overview.inProgress),
            sub: `${fmt(overview.pending)} pending`,
          },
          {
            icon: WarningIcon,
            title: "Overdue",
            value: fmt(overview.overdue),
            sub: "needs attention",
            accent: overview.overdue > 0,
          },
          {
            icon: TaskAltIcon,
            title: "On-Time Rate",
            value: pct(overview.onTimeRate),
            sub: `Score: ${overview.avgScore}%`,
          },
        ].map((s, i) => (
          <Grid item xs={12} sm={6} lg={3} key={i}>
            <StatCard {...s} loading={loading} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ mb: 3 }}>
        <Grid item xs={12} md={7}>
          <ChartCard
            title="Weekly activity"
            sub="Completed vs pending — last 7 days"
          >
            <ResponsiveContainer width="100%" height={chartH}>
              <BarChart data={weeklyTrend} barSize={20}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={alpha(C.outline, 0.12)}
                />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: C.secondary }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 10, fill: C.secondary }}
                  allowDecimals={false}
                  width={32}
                />
                <RTooltip contentStyle={{ borderRadius: 8, fontSize: "0.75rem" }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar
                  dataKey="completed"
                  name="Completed"
                  fill={C.primaryLight}
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="pending"
                  name="Pending"
                  fill={C.accent}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>
        <Grid item xs={12} md={5}>
          <ChartCard title="Task distribution">
            {distData.length > 0 ? (
              <ResponsiveContainer width="100%" height={chartH}>
                <PieChart>
                  <Pie
                    data={distData}
                    cx="50%"
                    cy="50%"
                    innerRadius="48%"
                    outerRadius="70%"
                    dataKey="value"
                    paddingAngle={4}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {distData.map((d, i) => (
                      <Cell key={i} fill={d.fill} />
                    ))}
                  </Pie>
                  <RTooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart msg="No task data" />
            )}
          </ChartCard>
        </Grid>
      </Grid>

      {/* ✅ Upcoming tasks table: horizontally scrollable on mobile */}
      {upcoming.length > 0 && (
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            mb: 3,
            border: `1px solid ${alpha(C.outlineVariant, 0.5)}`,
          }}
        >
          <Box
            sx={{
              px: { xs: 2, sm: 2.5 },
              py: 2,
              borderBottom: `1px solid ${alpha(C.outlineVariant, 0.3)}`,
            }}
          >
            <SectionTitle icon={HourglassIcon} title="Upcoming Tasks" />
          </Box>
          <TableContainer sx={{ overflowX: "auto" }}>
            <Table size="small" sx={{ minWidth: 480 }}>
              <TableHead>
                <TableRow>
                  {["Task", "Asset", "Due Date", "Days Left", "Priority"].map(
                    (h) => (
                      <TableCell
                        key={h}
                        sx={{
                          fontWeight: 700,
                          color: C.secondary,
                          bgcolor: C.surfaceContainerLow,
                          fontSize: "0.72rem",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {h}
                      </TableCell>
                    ),
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {upcoming.map((t, i) => (
                  <TableRow
                    key={i}
                    hover
                    sx={{ "&:hover": { bgcolor: C.surfaceContainerLow } }}
                  >
                    <TableCell>
                      <Typography sx={{ fontWeight: 600, fontSize: "0.75rem", whiteSpace: "nowrap" }}>
                        {t.checklistName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        sx={{ fontSize: "0.72rem", color: C.secondary, whiteSpace: "nowrap" }}
                      >
                        {t.assetName || "—"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: "0.72rem", whiteSpace: "nowrap" }}>
                        {t.dueDate
                          ? new Date(t.dueDate).toLocaleDateString("en-IN")
                          : "—"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${t.daysRemaining}d`}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: "0.65rem",
                          fontWeight: 700,
                          bgcolor:
                            t.daysRemaining <= 1
                              ? alpha(C.onErrorContainer, 0.12)
                              : t.daysRemaining <= 3
                                ? alpha(C.accent, 0.12)
                                : C.surfaceContainerLow,
                          color:
                            t.daysRemaining <= 1
                              ? C.onErrorContainer
                              : t.daysRemaining <= 3
                                ? C.accent
                                : C.secondary,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={t.priority}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: "0.62rem",
                          textTransform: "capitalize",
                          bgcolor:
                            t.priority === "critical"
                              ? "#fef2f2"
                              : t.priority === "high"
                                ? "#fff7ed"
                                : t.priority === "medium"
                                  ? "#fefce8"
                                  : "#f0fdf4",
                          color:
                            t.priority === "critical"
                              ? "#dc2626"
                              : t.priority === "high"
                                ? "#f97316"
                                : t.priority === "medium"
                                  ? "#ca8a04"
                                  : "#16a34a",
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      <SectionTitle icon={BoltIcon} title="Quick Actions" />
      {/* ✅ 3 equal columns on all sizes, full-width buttons */}
      <Grid container spacing={{ xs: 1.5, sm: 2 }}>
        {[
          {
            icon: AssignmentTurnedInIcon,
            title: "My Tasks",
            desc: "View all tasks",
            path: "/team",
          },
          {
            icon: HistoryIcon,
            title: "Inspection History",
            desc: "Past inspections",
            path: "/team/history",
          },
          {
            icon: AnalyticsIcon,
            title: "Reports",
            desc: "View reports",
            path: "/team/reports",
          },
        ].map((act, i) => (
          <Grid item xs={12} sm={4} key={i}>
            <Button
              fullWidth
              onClick={() => navigate(act.path)}
              sx={{
                flexDirection: "column",
                alignItems: "flex-start",
                p: { xs: 1.5, sm: 2 },
                bgcolor: C.primaryLight,
                borderRadius: 3,
                textTransform: "none",
                "&:hover": {
                  transform: "translateY(-3px)",
                  bgcolor: alpha(C.primaryLight, 0.9),
                },
              }}
            >
              <Box
                sx={{
                  p: 1,
                  bgcolor: "rgba(255,255,255,0.12)",
                  borderRadius: 1.5,
                  mb: 1,
                }}
              >
                <act.icon sx={{ color: "#fff", fontSize: 18 }} />
              </Box>
              <Typography
                sx={{
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: { xs: "0.75rem", sm: "0.82rem" },
                  mb: 0.25,
                }}
              >
                {act.title}
              </Typography>
              <Typography
                sx={{ color: alpha("#fff", 0.65), fontSize: "0.67rem" }}
              >
                {act.desc}
              </Typography>
            </Button>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

// ─── Root Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuth();
  const {
    dashboardData,
    loading,
    error,
    loadDashboard,
    clearError,
    refresh,
    activeFilter,
  } = useDashboard();

  const [anchorEl, setAnchorEl] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    loadDashboard({ preset: "30d" });
  }, [loadDashboard]);

  const toast$ = useCallback(
    (msg, sev = "success") =>
      setToast({ open: true, message: msg, severity: sev }),
    [],
  );
  const closeToast = useCallback(
    () => setToast((p) => ({ ...p, open: false })),
    [],
  );

  const handleFilterChange = useCallback(
    (filters) => {
      loadDashboard(filters);
    },
    [loadDashboard],
  );

  const handleRefresh = useCallback(() => {
    refresh();
    toast$("Refreshing dashboard…", "info");
  }, [refresh, toast$]);

  const handleExport = useCallback(
    async (type) => {
      setExporting(true);
      setAnchorEl(null);
      try {
        const name = `dashboard_${new Date().toISOString().split("T")[0]}`;
        const overview =
          dashboardData?.data?.summary ||
          dashboardData?.summary ||
          dashboardData ||
          {};
        if (type === "csv") {
          doCSV(overview, name);
          toast$("CSV exported successfully");
        } else if (type === "excel") {
          await doExcel(overview, name);
          toast$("Excel file exported successfully");
        } else {
          await doPDF(overview, name);
          toast$("PDF exported successfully");
        }
      } catch (e) {
        toast$(e.message || "Export failed", "error");
      } finally {
        setExporting(false);
      }
    },
    [dashboardData, toast$],
  );

  const role = user?.role;

  if (loading && !dashboardData) return <LoadingSkeleton />;
  if (error && !dashboardData)
    return (
      <ErrorDisplay
        message={error}
        onRetry={() => {
          clearError();
          loadDashboard({ preset: "30d" });
        }}
      />
    );

  const filterLabel = (() => {
    const p = activeFilter?.preset;
    if (!p || p === "30d") return "Last 30 days";
    if (p === "today") return "Today";
    if (p === "7d") return "Last 7 days";
    if (p === "monthly") return "This month";
    if (p === "yearly") return "This year";
    if (p === "custom")
      return `${activeFilter.startDate} → ${activeFilter.endDate}`;
    return "";
  })();

  return (
    <Box
      sx={{
        minHeight: "100%",
        // ✅ Fluid padding: tighter on mobile, comfortable on desktop
        p: { xs: 1.5, sm: 2, md: 3 },
        // ✅ Prevent horizontal overflow at any viewport
        overflowX: "hidden",
        boxSizing: "border-box",
      }}
    >
      {loading && (
        <LinearProgress
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 10,
            height: 2,
          }}
        />
      )}

      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          mb: 3,
          flexDirection: { xs: "column", sm: "row" },
          gap: 1.5,
        }}
      >
        <Box minWidth={0}>
          <Typography
            sx={{
              fontWeight: 800,
              color: C.primary,
              fontSize: { xs: "1.1rem", sm: "1.35rem", md: "1.5rem" }, // ✅ fluid heading
            }}
          >
            {role === "super_admin"
              ? "Platform Overview"
              : role === "admin"
                ? "Dashboard"
                : "My Dashboard"}
          </Typography>
          {/* ✅ Date/filter label: wrap on xs */}
          <Box
            display="flex"
            alignItems="center"
            gap={1}
            mt={0.25}
            flexWrap="wrap"
          >
            <Typography sx={{ color: C.secondary, fontSize: "0.72rem" }}>
              {new Date().toLocaleDateString("en-IN", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Typography>
            {filterLabel && (
              <>
                <Typography sx={{ color: C.outlineVariant, fontSize: "0.72rem" }}>
                  ·
                </Typography>
                <Chip
                  label={filterLabel}
                  size="small"
                  icon={<CalendarIcon sx={{ fontSize: "12px !important" }} />}
                  sx={{
                    height: 18,
                    fontSize: "0.62rem",
                    bgcolor: alpha(C.primaryLight, 0.08),
                    color: C.primaryLight,
                    "& .MuiChip-icon": { color: C.primaryLight },
                  }}
                />
              </>
            )}
          </Box>
        </Box>

        {/* ✅ Action buttons stay on the right even on mobile, shrink gracefully */}
        <Stack direction="row" spacing={1} flexShrink={0}>
          <Tooltip title="Refresh data">
            <IconButton
              onClick={handleRefresh}
              disabled={loading}
              size="small"
              sx={{
                bgcolor: C.white,
                border: `1px solid ${alpha(C.outlineVariant, 0.5)}`,
              }}
            >
              <RefreshIcon
                sx={{
                  fontSize: 20,
                  color: loading ? C.outline : C.primaryLight,
                }}
              />
            </IconButton>
          </Tooltip>
          <Tooltip title="Export dashboard">
            <IconButton
              onClick={(e) => setAnchorEl(e.currentTarget)}
              disabled={exporting || !dashboardData}
              size="small"
              sx={{
                bgcolor: C.white,
                border: `1px solid ${alpha(C.outlineVariant, 0.5)}`,
              }}
            >
              {exporting ? (
                <CircularProgress size={18} />
              ) : (
                <DownloadIcon sx={{ fontSize: 20, color: C.primaryLight }} />
              )}
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            PaperProps={{
              sx: {
                borderRadius: 2,
                border: `1px solid ${alpha(C.outlineVariant, 0.5)}`,
                boxShadow: `0 4px 20px ${alpha(C.primary, 0.12)}`,
              },
            }}
          >
            <MenuItem onClick={() => handleExport("pdf")}>
              <ListItemIcon>
                <PdfIcon sx={{ color: C.onErrorContainer }} />
              </ListItemIcon>
              <ListItemText
                primary="Export as PDF"
                primaryTypographyProps={{ fontSize: "0.8rem" }}
              />
            </MenuItem>
            <MenuItem onClick={() => handleExport("csv")}>
              <ListItemIcon>
                <CsvIcon sx={{ color: C.success }} />
              </ListItemIcon>
              <ListItemText
                primary="Export as CSV"
                primaryTypographyProps={{ fontSize: "0.8rem" }}
              />
            </MenuItem>
            <MenuItem onClick={() => handleExport("excel")}>
              <ListItemIcon>
                <SimCardDownloadIcon sx={{ color: C.accent }} />
              </ListItemIcon>
              <ListItemText
                primary="Export as Excel (.xlsx)"
                primaryTypographyProps={{ fontSize: "0.8rem" }}
              />
            </MenuItem>
          </Menu>
        </Stack>
      </Box>

      {/* Filter bar — shown for admin and super_admin.
          ✅ `actions` injects the role-specific quick-action pills
          (currently only super_admin: Manage Clients / Checklists / Reports) */}
      {role !== "team" && (
        <FilterBar
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
          loading={loading}
          actions={QUICK_ACTIONS_BY_ROLE[role] || []}
        />
      )}

      {/* Role-specific content */}
      {role === "super_admin" && (
        <SuperAdminDashboard data={dashboardData} loading={loading} />
      )}
      {role === "admin" && (
        <AdminDashboard data={dashboardData} loading={loading} />
      )}
      {role === "team" && (
        <TeamDashboard data={dashboardData} loading={loading} />
      )}

      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={closeToast}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={closeToast}
          severity={toast.severity}
          variant="filled"
          sx={{ borderRadius: 2 }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

// ─── Skeleton / Error ──────────────────────────────────────────────────────────
const LoadingSkeleton = () => (
  <Box sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
    <Skeleton variant="text" width={220} height={44} sx={{ mb: 2 }} />
    <Skeleton variant="rounded" height={56} sx={{ borderRadius: 2.5, mb: 3 }} />
    <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ mb: 3 }}>
      {[1, 2, 3, 4].map((i) => (
        <Grid item xs={12} sm={6} lg={3} key={i}>
          <Skeleton variant="rounded" height={130} sx={{ borderRadius: 3 }} />
        </Grid>
      ))}
    </Grid>
    <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ mb: 3 }}>
      {[1, 2].map((i) => (
        <Grid item xs={12} md={6} key={i}>
          <Skeleton variant="rounded" height={280} sx={{ borderRadius: 3 }} />
        </Grid>
      ))}
    </Grid>
    <Skeleton variant="rounded" height={200} sx={{ borderRadius: 3 }} />
  </Box>
);

const ErrorDisplay = ({ message, onRetry }) => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "60vh",
      px: 2,
    }}
  >
    <ErrorIcon sx={{ fontSize: 56, color: C.onErrorContainer, mb: 2 }} />
    <Typography sx={{ fontWeight: 600, color: C.onErrorContainer, mb: 1, textAlign: "center" }}>
      Something went wrong
    </Typography>
    <Typography
      sx={{
        color: C.secondary,
        mb: 2.5,
        textAlign: "center",
        maxWidth: 340,
        fontSize: "0.85rem",
      }}
    >
      {message || "Failed to load dashboard data."}
    </Typography>
    <Button
      variant="contained"
      onClick={onRetry}
      startIcon={<RefreshIcon />}
      sx={{ bgcolor: C.primaryLight, borderRadius: 2, textTransform: "none" }}
    >
      Retry
    </Button>
  </Box>
);

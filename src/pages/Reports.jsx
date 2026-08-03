import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Alert,
  Snackbar,
  CircularProgress,
  Skeleton,
  Stack,
  alpha,
  Select,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  useMediaQuery,
  useTheme,
  Collapse,
} from "@mui/material";
import {
  Assessment as ReportIcon,
  PictureAsPdf as PdfIcon,
  GridOn as ExcelIcon,
  FilterAlt as FilterIcon,
  Business as BusinessIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  Inventory as InventoryIcon,
  CheckCircleOutline as CheckIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  ErrorOutline as ErrorIcon,
  TrendingUp as TrendUpIcon,
  CalendarMonth as CalIcon,
  PlayArrow as RunIcon,
  AdminPanelSettings as AdminIcon,
  SupervisorAccount as SuperIcon,
  PersonOutline as TeamIcon,
} from "@mui/icons-material";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import { useAuth } from "../context/AuthContexts";
import { useReport } from "../context/ReportContext";
import AssetSearchField from "../components/AssetSearchField";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";

// ─── Design tokens (dark theme — matches AuditLogs.jsx) ─────────────────────
const DARK_REPORT_TOKENS = {
  page: "#0a1620",
  surface: "#0f1e29",
  surfaceAlt: "#132430",
  border: "#1c2e3a",
  ink: "#e7eef2",
  inkMid: "#c3d0d8",
  inkSub: "#8ca0ac",
  inkLight: "#5c7280",
  brand: "#1fb6cf",
  brandDark: "#0d8ba1",
  brandMid: "#1a6680",
  brandLight: alpha("#1fb6cf", 0.16),
  brandFaint: alpha("#1fb6cf", 0.08),
  brandContrast: "#04141a",
  green: "#4ade80",
  greenBg: alpha("#4ade80", 0.16),
  amber: "#fb923c",
  amberBg: alpha("#fb923c", 0.16),
  red: "#f87171",
  redBg: alpha("#f87171", 0.16),
  purple: "#c084fc",
  purpleBg: alpha("#c084fc", 0.16),
  cyan: "#5cd3e6",
  cyanBg: alpha("#5cd3e6", 0.16),
};

const LIGHT_REPORT_TOKENS = {
  page: "#f7fafc",
  surface: "#ffffff",
  surfaceAlt: "#f1f6f8",
  border: "#d8e2e8",
  ink: "#102a36",
  inkMid: "#2f4654",
  inkSub: "#526575",
  inkLight: "#7a8a99",
  brand: "#0f6f86",
  brandDark: "#0b5265",
  brandMid: "#12849f",
  brandLight: alpha("#0f6f86", 0.12),
  brandFaint: alpha("#0f6f86", 0.07),
  brandContrast: "#ffffff",
  green: "#0f766e",
  greenBg: alpha("#0f766e", 0.12),
  amber: "#d97706",
  amberBg: alpha("#d97706", 0.12),
  red: "#dc2626",
  redBg: alpha("#dc2626", 0.1),
  purple: "#7c3aed",
  purpleBg: alpha("#7c3aed", 0.1),
  cyan: "#0f6f86",
  cyanBg: alpha("#0f6f86", 0.12),
};

const T = { ...DARK_REPORT_TOKENS };
const CHART_COLORS = [
  "#1fb6cf",
  "#4ade80",
  "#fb923c",
  "#c084fc",
  "#f87171",
  "#60a5fa",
  "#facc15",
  "#34d399",
];

const applyReportThemeTokens = (mode) => {
  Object.assign(T, mode === "light" ? LIGHT_REPORT_TOKENS : DARK_REPORT_TOKENS);
};

// ─── Shared dark-mode overrides for MUI form controls ───────────────────────
// MUI's outlined Select/TextField pull border/label/text colors from the
// active theme palette, which may not match our dark tokens. These sx blocks
// pin them explicitly so they render correctly regardless of the app theme.
const darkFieldSx = () => ({
  "& .MuiOutlinedInput-root": {
    color: T.ink,
    bgcolor: T.surface,
    "& fieldset": { borderColor: T.border },
    "&:hover fieldset": { borderColor: T.brand },
    "&.Mui-focused fieldset": { borderColor: T.brand },
  },
  "& .MuiInputLabel-root": { color: T.inkLight },
  "& .MuiInputLabel-root.Mui-focused": { color: T.brand },
  "& .MuiSvgIcon-root": { color: T.inkLight },
});

const darkMenuProps = () => ({
  sx: { zIndex: 10050 },
  PaperProps: {
    sx: {
      zIndex: 10051,
      bgcolor: T.surface,
      border: `1px solid ${T.border}`,
      boxShadow: `0 18px 44px ${alpha("#020617", 0.28)}`,
      "& .MuiMenuItem-root": { color: T.ink, fontSize: 13 },
      "& .MuiMenuItem-root:hover": { bgcolor: alpha(T.brand, 0.1) },
      "& .MuiMenuItem-root.Mui-selected": { bgcolor: alpha(T.brand, 0.16) },
    },
  },
});

// ─── Role configuration ────────────────────────────────────────────────────────
const ROLE_REPORTS = {
  super_admin: [
    "clients",
    "revenue",
    "checklist-requests",
    "compliance",
    "inspections",
    "checklists",
    "assignments",
  ],
  admin: [
    "assets",
    "asset-requests",
    "team",
    "checklists",
    "checklist-submissions",
    "assignments",
    "inspections",
  ],
  team: [
    "assignments",
    "asset-requests",
    "checklist-submissions",
    "inspections",
  ],
};

const REPORT_META = {
  clients: { label: "Clients", icon: BusinessIcon, color: T.brand },
  revenue: { label: "Revenue", icon: CurrencyRupeeIcon, color: T.green },
  assets: { label: "Assets", icon: InventoryIcon, color: T.amber },
  "asset-requests": {
    label: "Asset Requests",
    icon: ReportIcon,
    color: T.amber,
  },
  team: { label: "Team", icon: PeopleIcon, color: T.purple },
  checklists: { label: "Checklists", icon: CheckIcon, color: T.cyan },
  "checklist-requests": {
    label: "CL Requests",
    icon: ReportIcon,
    color: T.cyan,
  },
  "checklist-submissions": {
    label: "Submissions",
    icon: CheckIcon,
    color: T.cyan,
  },
  assignments: { label: "Assignments", icon: AssignmentIcon, color: T.brand },
  inspections: { label: "Audit Logs", icon: ReportIcon, color: T.amber },
  compliance: { label: "Compliance", icon: CheckIcon, color: T.green },
};

const DATE_PRESETS = [
  { label: "Today", value: "today" },
  { label: "7 days", value: "last_7_days" },
  { label: "30 days", value: "last_30_days" },
  { label: "365 days", value: "this_year" },
  { label: "Custom", value: "custom" },
];

// ─── Formatters ────────────────────────────────────────────────────────────────
const fmtNum = (n) => (n == null ? "—" : Number(n).toLocaleString("en-IN"));
const fmtPct = (n) => (n == null ? "—" : `${Number(n).toFixed(1)}%`);
const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";
const fmtCur = (n) =>
  n == null ? "—" : `₹${Number(n).toLocaleString("en-IN")}`;
const fmtShort = (s, max = 30) =>
  s ? (s.length > max ? s.substring(0, max) + "..." : s) : "—";

// ─── Export Functions (unchanged — exported PDF/Excel stay light/print-friendly) ─
const flattenRecord = (record = {}, prefix = "") =>
  Object.entries(record || {}).reduce((acc, [key, value]) => {
    const nextKey = prefix ? `${prefix}.${key}` : key;
    if (value == null || value instanceof Date) {
      acc[nextKey] = value;
    } else if (Array.isArray(value)) {
      acc[nextKey] = value
        .map((item) =>
          typeof item === "object" && item !== null
            ? JSON.stringify(item)
            : String(item),
        )
        .join(", ");
    } else if (typeof value === "object") {
      Object.assign(acc, flattenRecord(value, nextKey));
    } else {
      acc[nextKey] = value;
    }
    return acc;
  }, {});

const exportPDF = async (reportData, reportType) => {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const W = 297;
  const meta = REPORT_META[reportType] || {};
  const ts = new Date().toLocaleString("en-IN");
  const data = (reportData?.data || []).map((row) => flattenRecord(row));
  const summary = reportData?.summary || {};

  doc.setFillColor(13, 43, 53);
  doc.rect(0, 0, W, 18, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(`${meta.label || reportType} Report`, 12, 12);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated: ${ts}`, W - 12, 12, { align: "right" });

  let y = 26;
  const pairs = Object.entries(summary)
    .filter(([, v]) => typeof v !== "object" && v !== null)
    .slice(0, 8);

  if (pairs.length) {
    doc.setFontSize(6);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 116, 139);
    doc.text("SUMMARY", 12, y);
    y += 4;
    pairs.forEach(([k, v], i) => {
      const col = i % 4;
      const row = Math.floor(i / 4);
      const bx = 12 + col * 69;
      const by = y + row * 14;
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(bx, by, 65, 11, 2, 2, "F");
      doc.setTextColor(107, 114, 128);
      doc.setFontSize(5.5);
      doc.setFont("helvetica", "normal");
      doc.text(
        reportLabel(k),
        bx + 3,
        by + 4,
      );
      doc.setTextColor(17, 24, 39);
      doc.setFontSize(8.5);
      doc.setFont("helvetica", "bold");
      doc.text(String(v ?? "—").slice(0, 24), bx + 3, by + 9);
    });
    y += Math.ceil(pairs.length / 4) * 14 + 5;
  }

  if (data.length) {
    const cols = Object.keys(data[0])
      .filter((k) => typeof data[0][k] !== "object")
      .slice(0, 12);

    autoTable(doc,{
      head: [cols.map((c) => reportLabel(c))],
      body: data.map((r) =>
        cols.map((c) => {
          let val = r[c];
          if (typeof val === "object") return "—";
          if (typeof val === "string") return val.slice(0, 50);
          return String(val ?? "—");
        }),
      ),
      startY: y,
      margin: { left: 12, right: 12 },
      styles: {
        fontSize: 6.5,
        cellPadding: 2,
        textColor: [17, 24, 39],
        overflow: "ellipsize",
      },
      headStyles: {
        fillColor: [13, 43, 53],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 6.5,
      },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      tableLineColor: [229, 231, 235],
      tableLineWidth: 0.2,
    });
  }

  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFillColor(248, 250, 252);
    doc.rect(0, 200, W, 10, "F");
    doc.setTextColor(156, 163, 175);
    doc.setFontSize(6);
    doc.text("Confidential — Internal Use Only", 12, 205);
    doc.text(`Page ${i} of ${pages}`, W - 12, 205, { align: "right" });
  }

  doc.save(`${reportType}_${Date.now()}.pdf`);
};

const exportExcel = (reportData, reportType) => {
  const wb = XLSX.utils.book_new();
  const data = (reportData?.data || []).map((row) => flattenRecord(row));
  const summary = reportData?.summary || {};

  if (data.length) {
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, "Data");
  }

  if (Object.keys(summary).length) {
    const flat = Object.entries(summary)
      .filter(([, v]) => typeof v !== "object")
      .map(([k, v]) => ({
        Metric: reportLabel(k),
        Value: v,
      }));
    if (flat.length) {
      const ws = XLSX.utils.json_to_sheet(flat);
      XLSX.utils.book_append_sheet(wb, ws, "Summary");
    }
  }

  XLSX.writeFile(wb, `${reportType}_${Date.now()}.xlsx`);
};

// ─── Shared UI Components ─────────────────────────────────────────────────────
const ColHead = ({ children, align = "left" }) => (
  <TableCell
    align={align}
    sx={{
      fontWeight: 700,
      fontSize: { xs: "0.6rem", sm: "0.65rem" },
      color: "#ffffff !important",
      bgcolor: "#15576A !important",
      backgroundColor: "#15576A !important",
      borderBottom: "1px solid #15576A",
      whiteSpace: "nowrap",
      py: { xs: 1, sm: 1.2 },
      px: { xs: 1.25, sm: 1.6 },
      letterSpacing: "0.05em",
      textTransform: "uppercase",
      minWidth: 120,
    }}
  >
    {children}
  </TableCell>
);

const DataCell = ({ children, bold, align = "left", mono, noWrap }) => (
  <TableCell
    align={align}
    sx={{
      fontSize: bold
        ? { xs: "0.7rem", sm: "0.76rem" }
        : { xs: "0.65rem", sm: "0.71rem" },
      fontWeight: bold ? 700 : 400,
      color: bold ? T.ink : T.inkMid,
      borderBottom: `1px solid ${T.border}`,
      py: { xs: 0.8, sm: 1.1 },
      px: { xs: 1.25, sm: 1.6 },
      fontFamily: mono ? "'SF Mono', 'Courier New', monospace" : "inherit",
      minWidth: noWrap ? 120 : 140,
      maxWidth: noWrap ? 180 : 260,
      whiteSpace: noWrap ? "nowrap" : "normal",
      overflow: "hidden",
      textOverflow: "ellipsis",
      overflowWrap: "anywhere",
    }}
  >
    {children}
  </TableCell>
);

const SBadge = ({ status }) => {
  const map = {
    active: { color: T.green, bg: T.greenBg },
    approved: { color: T.green, bg: T.greenBg },
    completed: { color: T.green, bg: T.greenBg },
    published: { color: T.green, bg: T.greenBg },
    pending: { color: T.amber, bg: T.amberBg },
    in_progress: { color: T.brand, bg: T.brandLight },
    pending_review: { color: T.brand, bg: T.brandLight },
    inactive: { color: T.red, bg: T.redBg },
    rejected: { color: T.red, bg: T.redBg },
    suspended: { color: T.red, bg: T.redBg },
    overdue: { color: T.red, bg: T.redBg },
    draft: { color: T.inkSub, bg: T.surfaceAlt },
  };
  const s = map[(status || "").toLowerCase()] || {
    color: T.inkSub,
    bg: T.surfaceAlt,
  };
  return (
    <Box
      component="span"
      sx={{
        display: "inline-block",
        px: { xs: 0.7, sm: 1 },
        py: 0.25,
        borderRadius: "20px",
        fontSize: { xs: "0.55rem", sm: "0.62rem" },
        fontWeight: 700,
        bgcolor: s.bg,
        color: s.color,
        lineHeight: 1.6,
        whiteSpace: "nowrap",
      }}
    >
      {String(status || "—").replace(/_/g, " ")}
    </Box>
  );
};

const ProgressBar = ({ value, color }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 0.8,
      minWidth: { xs: 60, sm: 80 },
    }}
  >
    <Box
      sx={{
        flex: 1,
        height: 4,
        borderRadius: 2,
        bgcolor: T.surfaceAlt,
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          height: "100%",
          width: `${Math.min(100, value || 0)}%`,
          bgcolor: color || T.brand,
          borderRadius: 2,
          transition: "width 0.5s ease",
        }}
      />
    </Box>
    <Typography
      sx={{
        fontSize: { xs: "0.55rem", sm: "0.62rem" },
        fontWeight: 700,
        color: T.inkSub,
        minWidth: 28,
      }}
    >
      {fmtPct(value)}
    </Typography>
  </Box>
);

const reportLabel = (key = "") =>
  key
    .replace(/[_-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const scalarValue = (value) => {
  if (value == null || value === "") return "N/A";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (value instanceof Date) return fmtDate(value);
  if (typeof value === "object") return null;
  return String(value);
};

const ReportMobileCard = ({ title, subtitle, badge, rows }) => (
  <Paper
    elevation={0}
    sx={{
      p: 1.5,
      borderRadius: "10px",
      border: `1px solid ${T.border}`,
      bgcolor: T.surface,
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
      <Box sx={{ minWidth: 0 }}>
        <Typography
          sx={{
            fontWeight: 800,
            fontSize: "0.78rem",
            color: T.ink,
            overflowWrap: "anywhere",
          }}
        >
          {title || "N/A"}
        </Typography>
        {subtitle && (
          <Typography
            sx={{
              fontSize: "0.62rem",
              color: T.inkLight,
              fontFamily: "monospace",
              overflowWrap: "anywhere",
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
      {badge}
    </Box>
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        gap: 1,
      }}
    >
      {rows.map(({ label, value, node }) => (
        <Box key={label} sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              fontSize: "0.58rem",
              color: T.inkLight,
              fontWeight: 700,
              textTransform: "uppercase",
              mb: 0.25,
            }}
          >
            {label}
          </Typography>
          {node || (
            <Typography
              sx={{
                fontSize: "0.68rem",
                color: T.inkMid,
                fontWeight: 600,
                overflowWrap: "anywhere",
              }}
            >
              {value ?? "N/A"}
            </Typography>
          )}
        </Box>
      ))}
    </Box>
  </Paper>
);

const StatCard = ({ label, value, icon: Icon, color, loading }) => {
  if (loading)
    return (
      <Box
        sx={{
          p: { xs: 1.25, sm: 1.6 },
          borderRadius: "14px",
          bgcolor: T.surfaceAlt,
          border: `1px solid ${T.border}`,
          height: "100%",
          minHeight: { xs: 92, sm: 108 },
        }}
      >
        <Skeleton width="55%" height={12} />
        <Skeleton width="40%" height={34} sx={{ mt: 0.75 }} />
      </Box>
    );
  return (
    <Box
      sx={{
        p: { xs: 1.25, sm: 1.7 },
        borderRadius: "14px",
        bgcolor: alpha(color || T.brand, 0.09),
        border: `1px solid ${T.border}`,
        borderLeft: `5px solid ${color || T.brand}`,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: 1.1,
        height: "100%",
        minHeight: { xs: 92, sm: 108 },
        width: "100%",
        minWidth: 0,
        boxShadow: `0 14px 30px ${alpha(color || T.brand, 0.08)}`,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 0.5,
        }}
      >
        <Typography
          sx={{
            fontSize: { xs: "0.58rem", sm: "0.66rem" },
            fontWeight: 800,
            color: T.inkSub,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            minWidth: 0,
          }}
        >
          {label}
        </Typography>
        {Icon && (
          <Box
            sx={{
              width: { xs: 22, sm: 26 },
              height: { xs: 22, sm: 26 },
              flexShrink: 0,
              borderRadius: "8px",
              bgcolor: alpha(color || T.brand, 0.18),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon
              sx={{ fontSize: { xs: 11, sm: 13 }, color: color || T.brand }}
            />
          </Box>
        )}
      </Box>
      <Typography
        sx={{
          fontSize: { xs: "1.35rem", sm: "1.65rem" },
          fontWeight: 900,
          color: T.ink,
          lineHeight: 0.95,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {value ?? "—"}
      </Typography>
    </Box>
  );
};

const EmptyState = ({ icon: Icon = ReportIcon, title, desc, action }) => (
  <Box
    sx={{
      py: { xs: 4, sm: 8 },
      px: { xs: 2, sm: 0 },
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 2,
    }}
  >
    <Box
      sx={{
        width: { xs: 50, sm: 60 },
        height: { xs: 50, sm: 60 },
        borderRadius: "16px",
        bgcolor: T.brandFaint,
        border: `1px dashed ${alpha(T.brand, 0.4)}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <Icon
        sx={{ fontSize: { xs: 22, sm: 26 }, color: T.brand, opacity: 0.6 }}
      />
    </Box>
    <Box sx={{ textAlign: "center" }}>
      <Typography
        sx={{
          fontWeight: 700,
          fontSize: { xs: "0.8rem", sm: "0.88rem" },
          color: T.inkMid,
        }}
      >
        {title}
      </Typography>
      <Typography
        sx={{
          fontSize: { xs: "0.68rem", sm: "0.73rem" },
          color: T.inkLight,
          mt: 0.4,
          maxWidth: 300,
        }}
      >
        {desc}
      </Typography>
    </Box>
    {action}
  </Box>
);

// ─── Tables ────────────────────────────────────────────────────────────────────

const objectToChartData = (obj = {}) =>
  Object.entries(obj)
    .filter(([, value]) => Number.isFinite(Number(value)))
    .map(([name, value]) => ({ name: reportLabel(name), value: Number(value) }))
    .filter((item) => item.value > 0);

const getDateBucket = (row) => {
  const value =
    row.createdAt ||
    row.joinDate ||
    row.submittedAt ||
    row.completedAt ||
    row.updatedAt ||
    row.dueDate;
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-IN", { month: "short", day: "2-digit" });
};

const buildTrendData = (rows = []) => {
  const buckets = new Map();
  rows.forEach((row) => {
    const bucket = getDateBucket(row);
    if (!bucket) return;
    buckets.set(bucket, (buckets.get(bucket) || 0) + 1);
  });
  return Array.from(buckets, ([name, value]) => ({ name, value })).slice(-8);
};

const buildFieldDistribution = (rows = [], fields = []) => {
  for (const field of fields) {
    const counts = rows.reduce((acc, row) => {
      const value = row[field];
      if (!value || typeof value === "object") return acc;
      const key = String(value).replace(/_/g, " ");
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    const data = objectToChartData(counts);
    if (data.length > 1) return { field, data };
  }
  return null;
};

const ReportChartCard = ({ title, chip, children }) => (
  <Paper
    elevation={0}
    sx={{
      p: { xs: 1.5, sm: 2.25 },
      borderRadius: "14px",
      border: `1px solid ${T.border}`,
      bgcolor: T.surface,
      minHeight: 310,
      overflow: "hidden",
      boxShadow: `0 16px 36px ${alpha("#0f172a", 0.06)}`,
    }}
  >
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5, gap: 1 }}>
      <Typography sx={{ fontSize: "0.9rem", color: T.ink, fontWeight: 800 }}>
        {title}
      </Typography>
      {chip && (
        <Chip
          label={chip}
          size="small"
          sx={{
            height: 22,
            borderRadius: "8px",
            fontSize: "0.62rem",
            fontWeight: 700,
            bgcolor: T.brandLight,
            color: T.brand,
          }}
        />
      )}
    </Box>
    <Box sx={{ height: 240 }}>{children}</Box>
  </Paper>
);

const ReportsAnalytics = ({ reportData, reportType }) => {
  const summary = reportData?.summary || {};
  const rows = reportData?.data || [];

  const charts = useMemo(() => {
    const objectCharts = Object.entries(summary)
      .map(([key, value]) => {
        if (!value || typeof value !== "object" || Array.isArray(value)) return null;
        const data = objectToChartData(value);
        return data.length > 1 ? { key, title: reportLabel(key), data } : null;
      })
      .filter(Boolean);

    const fieldDistribution = buildFieldDistribution(rows, [
      "status",
      "priority",
      "membershipPlan",
      "reviewStatus",
      "requestType",
      "urgency",
      "assetCondition",
    ]);
    const trendData = buildTrendData(rows);
    const result = [...objectCharts];

    if (fieldDistribution && !result.some((chart) => chart.key === fieldDistribution.field)) {
      result.push({
        key: fieldDistribution.field,
        title: `${reportLabel(fieldDistribution.field)} Distribution`,
        data: fieldDistribution.data,
      });
    }
    if (trendData.length > 1) {
      result.push({ key: "activityTrend", title: "Records by Date", data: trendData, type: "bar" });
    }

    return result.slice(0, 3);
  }, [rows, summary]);

  if (!charts.length) return null;

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          md: charts.length === 1 ? "1fr" : "repeat(2, minmax(0, 1fr))",
          xl: `repeat(${Math.min(charts.length, 3)}, minmax(0, 1fr))`,
        },
        gap: { xs: 1.25, sm: 1.5 },
        mb: 2.5,
      }}
    >
      {charts.map((chart, index) => {
        const usePie = index === 0 && chart.type !== "line" && chart.type !== "bar";
        return (
          <ReportChartCard
            key={`${reportType}-${chart.key}`}
            title={chart.title}
            chip={usePie ? "Pie" : chart.type === "line" ? "Trend" : "Bar"}
          >
            <ResponsiveContainer width="100%" height="100%">
              {chart.type === "line" ? (
                <LineChart data={chart.data} margin={{ top: 8, right: 12, left: -22, bottom: 0 }}>
                  <CartesianGrid stroke={alpha(T.inkLight, 0.14)} strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fill: T.inkLight, fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: T.inkLight, fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <RTooltip contentStyle={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, color: T.ink }} labelStyle={{ color: T.ink, fontWeight: 700 }} itemStyle={{ color: T.ink, fontWeight: 600 }} />
                  <Line type="monotone" dataKey="value" stroke={CHART_COLORS[index]} strokeWidth={3} dot={{ r: 4, fill: CHART_COLORS[index] }} />
                </LineChart>
              ) : usePie ? (
                <PieChart>
                  <Pie data={chart.data} dataKey="value" nameKey="name" outerRadius={72} innerRadius={36} paddingAngle={2}>
                    {chart.data.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <RTooltip contentStyle={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, color: T.ink }} labelStyle={{ color: T.ink, fontWeight: 700 }} itemStyle={{ color: T.ink, fontWeight: 600 }} />
                </PieChart>
              ) : (
                <BarChart data={chart.data.slice(0, 8)} margin={{ top: 8, right: 12, left: -22, bottom: 0 }}>
                  <CartesianGrid stroke={alpha(T.inkLight, 0.14)} strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: T.inkLight, fontSize: 10 }} axisLine={false} tickLine={false} interval={0} />
                  <YAxis tick={{ fill: T.inkLight, fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <RTooltip cursor={false} formatter={(value) => [`${value} records`, "Records"]} contentStyle={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, color: T.ink }} labelStyle={{ color: T.ink, fontWeight: 700 }} itemStyle={{ color: T.ink, fontWeight: 600 }} />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {chart.data.slice(0, 8).map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[(i + index) % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              )}
            </ResponsiveContainer>
          </ReportChartCard>
        );
      })}
    </Box>
  );
};

const ClientsTable = ({ data }) => {
  const [pg, setPg] = useState(0);
  const [rpp, setRpp] = useState(10);
  const [q, setQ] = useState("");
  const isMobile = useMediaQuery("(max-width:900px)");

  const filtered = useMemo(
    () =>
      (data || []).filter(
        (r) =>
          !q ||
          [r.name, r.email, r.customerName].some((v) =>
            (v || "").toLowerCase().includes(q.toLowerCase()),
          ),
      ),
    [data, q],
  );

  const paged = filtered.slice(pg * rpp, pg * rpp + rpp);

  if (!data?.length)
    return (
      <EmptyState
        icon={BusinessIcon}
        title="No clients found"
        desc="Adjust your filters and generate"
      />
    );

  return (
    <>
      <Box
        sx={{
          display: "flex",
          gap: 1.5,
          mb: 2,
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "stretch", sm: "center" },
        }}
      >
        <AssetSearchField
          placeholder="Search name or email..."
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPg(0);
          }}
          onClear={() => {
            setQ("");
            setPg(0);
          }}
          sx={{ flex: 1, minWidth: 0 }}
        />
        <Typography
          sx={{
            fontSize: "0.7rem",
            color: T.inkLight,
            textAlign: { xs: "right", sm: "left" },
            whiteSpace: "nowrap",
          }}
        >
          {filtered.length} clients
        </Typography>
      </Box>
      {isMobile && (
        <Stack spacing={1.25}>
          {paged.map((r, i) => (
            <ReportMobileCard
              key={i}
              title={r.name || r.customerName || "N/A"}
              subtitle={r.email || "N/A"}
              badge={<SBadge status={r.status} />}
              rows={[
                {
                  label: "Plan",
                  node: (
                    <Chip
                      label={r.membershipPlan || "No plan"}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: "0.58rem",
                        fontWeight: 700,
                        bgcolor: T.brandLight,
                        color: T.brand,
                        textTransform: "capitalize",
                      }}
                    />
                  ),
                },
                { label: "Team", value: fmtNum(r.teamMembers) },
                { label: "Assignments", value: fmtNum(r.totalAssignments) },
                {
                  label: "Completion",
                  node: <ProgressBar value={r.completionRate} />,
                },
                { label: "Expires", value: fmtDate(r.subscriptionEndDate) },
              ]}
            />
          ))}
        </Stack>
      )}
      <TableContainer
        sx={{
          display: isMobile ? "none" : "block",
          maxHeight: 420,
          borderRadius: "10px",
          border: `1px solid ${T.border}`,
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <Table stickyHeader size="small" sx={{ minWidth: { xs: 360, sm: "auto" } }}>
          <TableHead>
            <TableRow>
              <ColHead>Client</ColHead>
              {!isMobile && <ColHead>Plan</ColHead>}
              <ColHead>Status</ColHead>
              {!isMobile && <ColHead align="right">Team</ColHead>}
              {!isMobile && <ColHead align="right">Assignments</ColHead>}
              {!isMobile && <ColHead>Completion</ColHead>}
              {!isMobile && <ColHead>Expires</ColHead>}
            </TableRow>
          </TableHead>
          <TableBody>
            {paged.map((r, i) => (
              <TableRow key={i} hover sx={{ "&:hover": { bgcolor: alpha(T.brand, 0.06) } }}>
                <DataCell bold>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Avatar
                      sx={{
                        width: { xs: 24, sm: 28 },
                        height: { xs: 24, sm: 28 },
                        bgcolor: T.brand,
                        color: T.brandContrast,
                        fontSize: "0.6rem",
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {(r.name || r.customerName || "?")[0]?.toUpperCase()}
                    </Avatar>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        sx={{
                          fontWeight: 700,
                          fontSize: { xs: "0.65rem", sm: "0.74rem" },
                          color: T.ink,
                        }}
                      >
                        {fmtShort(r.name || r.customerName || "—", 15)}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: { xs: "0.55rem", sm: "0.62rem" },
                          color: T.inkLight,
                        }}
                      >
                        {fmtShort(r.email, 15)}
                      </Typography>
                    </Box>
                  </Box>
                </DataCell>
                {!isMobile && (
                  <DataCell>
                    <Chip
                      label={r.membershipPlan || "No plan"}
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: "0.55rem",
                        fontWeight: 700,
                        bgcolor: T.brandLight,
                        color: T.brand,
                        textTransform: "capitalize",
                      }}
                    />
                  </DataCell>
                )}
                <DataCell>
                  <SBadge status={r.status} />
                </DataCell>
                {!isMobile && (
                  <DataCell align="right">{fmtNum(r.teamMembers)}</DataCell>
                )}
                {!isMobile && (
                  <DataCell align="right">
                    {fmtNum(r.totalAssignments)}
                  </DataCell>
                )}
                {!isMobile && (
                  <DataCell>
                    <ProgressBar value={r.completionRate} />
                  </DataCell>
                )}
                {!isMobile && (
                  <DataCell>{fmtDate(r.subscriptionEndDate)}</DataCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={filtered.length}
        page={pg}
        rowsPerPage={rpp}
        onPageChange={(_, p) => setPg(p)}
        onRowsPerPageChange={(e) => {
          setRpp(+e.target.value);
          setPg(0);
        }}
        rowsPerPageOptions={[5, 10, 25]}
        sx={{
          color: T.inkSub,
          "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
            { fontSize: { xs: "0.6rem", sm: "0.71rem" }, color: T.inkLight },
          "& .MuiTablePagination-toolbar": {
            flexWrap: "wrap",
            justifyContent: { xs: "center", sm: "flex-end" },
            gap: { xs: 0.5, sm: 0 },
            px: { xs: 0, sm: 2 },
            minHeight: { xs: "auto", sm: 52 },
            py: { xs: 1, sm: 0 },
          },
          "& .MuiTablePagination-spacer": {
            display: { xs: "none", sm: "block" },
          },
          "& .MuiTablePagination-actions": {
            mx: { xs: "auto", sm: 0 },
            width: { xs: "100%", sm: "auto" },
            display: "flex",
            justifyContent: { xs: "center", sm: "flex-start" },
            "& .MuiIconButton-root": { color: T.inkSub },
          },
        }}
      />
    </>
  );
};

const TeamTable = ({ data }) => {
  const [pg, setPg] = useState(0);
  const [rpp, setRpp] = useState(10);
  const [roleF, setRoleF] = useState("");
  const isMobile = useMediaQuery("(max-width:900px)");

  const filtered = useMemo(
    () => (data || []).filter((r) => !roleF || r.teamRole === roleF),
    [data, roleF],
  );
  const paged = filtered.slice(pg * rpp, pg * rpp + rpp);

  if (!data?.length)
    return (
      <EmptyState
        icon={PeopleIcon}
        title="No team members found"
        desc="Try different filters"
      />
    );

  return (
    <>
      <Box
        sx={{
          display: "flex",
          gap: 1.5,
          mb: 2,
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "stretch", sm: "center" },
        }}
      >
        <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 155 }, ...darkFieldSx }}>
          <InputLabel sx={{ fontSize: "0.8rem" }}>Role</InputLabel>
          <Select
            value={roleF}
            onChange={(e) => {
              setRoleF(e.target.value);
              setPg(0);
            }}
            label="Role"
            MenuProps={darkMenuProps()}
          >
            <MenuItem value="">All roles</MenuItem>
            {[
              "inspector",
              "senior_inspector",
              "lead_inspector",
              "supervisor",
            ].map((r) => (
              <MenuItem key={r} value={r}>
                {r.replace(/_/g, " ")}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Typography
          sx={{
            fontSize: "0.7rem",
            color: T.inkLight,
            textAlign: { xs: "right", sm: "left" },
            whiteSpace: "nowrap",
          }}
        >
          {filtered.length} members
        </Typography>
      </Box>
      {isMobile && (
        <Stack spacing={1.25}>
          {paged.map((r, i) => (
            <ReportMobileCard
              key={i}
              title={r.name || "N/A"}
              subtitle={r.email || "N/A"}
              badge={<SBadge status={r.status} />}
              rows={[
                {
                  label: "Role",
                  node: (
                    <Chip
                      label={(r.teamRole || "inspector").replace(/_/g, " ")}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: "0.58rem",
                        fontWeight: 700,
                        bgcolor: T.purpleBg,
                        color: T.purple,
                      }}
                    />
                  ),
                },
                { label: "Assignments", value: fmtNum(r.totalAssignments) },
                {
                  label: "Completion",
                  node: <ProgressBar value={r.completionRate} />,
                },
                { label: "On Time", value: fmtPct(r.onTimeRate) },
                { label: "Score", value: r.performanceScore ?? 0 },
              ]}
            />
          ))}
        </Stack>
      )}
      <TableContainer
        sx={{
          display: isMobile ? "none" : "block",
          maxHeight: 420,
          borderRadius: "10px",
          border: `1px solid ${T.border}`,
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <Table stickyHeader size="small" sx={{ minWidth: { xs: 360, sm: "auto" } }}>
          <TableHead>
            <TableRow>
              <ColHead>Member</ColHead>
              {!isMobile && <ColHead>Role</ColHead>}
              <ColHead>Status</ColHead>
              {!isMobile && <ColHead align="right">Assignments</ColHead>}
              {!isMobile && <ColHead>Completion</ColHead>}
              {!isMobile && <ColHead>On-time</ColHead>}
              {!isMobile && <ColHead align="right">Score</ColHead>}
            </TableRow>
          </TableHead>
          <TableBody>
            {paged.map((r, i) => (
              <TableRow key={i} hover sx={{ "&:hover": { bgcolor: alpha(T.brand, 0.06) } }}>
                <DataCell bold>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Avatar
                      sx={{
                        width: { xs: 24, sm: 28 },
                        height: { xs: 24, sm: 28 },
                        bgcolor: T.purple,
                        color: T.brandContrast,
                        fontSize: "0.6rem",
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {(r.name || "?")[0]?.toUpperCase()}
                    </Avatar>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        sx={{
                          fontWeight: 700,
                          fontSize: { xs: "0.65rem", sm: "0.74rem" },
                          color: T.ink,
                        }}
                      >
                        {fmtShort(r.name || "—", 15)}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: { xs: "0.55rem", sm: "0.62rem" },
                          color: T.inkLight,
                        }}
                      >
                        {fmtShort(r.email, 15)}
                      </Typography>
                    </Box>
                  </Box>
                </DataCell>
                {!isMobile && (
                  <DataCell>
                    <Chip
                      label={(r.teamRole || "inspector").replace(/_/g, " ")}
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: "0.55rem",
                        fontWeight: 600,
                        bgcolor: T.purpleBg,
                        color: T.purple,
                      }}
                    />
                  </DataCell>
                )}
                <DataCell>
                  <SBadge status={r.status} />
                </DataCell>
                {!isMobile && (
                  <DataCell align="right">
                    {fmtNum(r.totalAssignments)}
                  </DataCell>
                )}
                {!isMobile && (
                  <DataCell>
                    <ProgressBar value={r.completionRate} />
                  </DataCell>
                )}
                {!isMobile && <DataCell>{fmtPct(r.onTimeRate)}</DataCell>}
                {!isMobile && (
                  <DataCell align="right">
                    <Chip
                      label={r.performanceScore ?? 0}
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: "0.55rem",
                        fontWeight: 700,
                        bgcolor: T.brandLight,
                        color: T.brand,
                      }}
                    />
                  </DataCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={filtered.length}
        page={pg}
        rowsPerPage={rpp}
        onPageChange={(_, p) => setPg(p)}
        onRowsPerPageChange={(e) => {
          setRpp(+e.target.value);
          setPg(0);
        }}
        rowsPerPageOptions={[5, 10, 25]}
        sx={{
          color: T.inkSub,
          "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
            { fontSize: { xs: "0.6rem", sm: "0.71rem" }, color: T.inkLight },
          "& .MuiTablePagination-toolbar": {
            flexWrap: "wrap",
            justifyContent: { xs: "center", sm: "flex-end" },
            gap: { xs: 0.5, sm: 0 },
            px: { xs: 0, sm: 2 },
            minHeight: { xs: "auto", sm: 52 },
            py: { xs: 1, sm: 0 },
          },
          "& .MuiTablePagination-spacer": {
            display: { xs: "none", sm: "block" },
          },
          "& .MuiTablePagination-actions": {
            mx: { xs: "auto", sm: 0 },
            width: { xs: "100%", sm: "auto" },
            display: "flex",
            justifyContent: { xs: "center", sm: "flex-start" },
            "& .MuiIconButton-root": { color: T.inkSub },
          },
        }}
      />
    </>
  );
};

const AssetsTable = ({ data }) => {
  const [pg, setPg] = useState(0);
  const [rpp, setRpp] = useState(10);
  const [q, setQ] = useState("");
  const isMobile = useMediaQuery("(max-width:900px)");

  const filtered = useMemo(
    () =>
      (data || []).filter(
        (r) =>
          !q ||
          [r.assetName, r.tagNumber, r.serialNumber].some((v) =>
            (v || "").toLowerCase().includes(q.toLowerCase()),
          ),
      ),
    [data, q],
  );
  const paged = filtered.slice(pg * rpp, pg * rpp + rpp);

  if (!data?.length)
    return (
      <EmptyState
        icon={InventoryIcon}
        title="No assets found"
        desc="Adjust your filters"
      />
    );

  return (
    <>
      <Box
        sx={{
          display: "flex",
          gap: 1.5,
          mb: 2,
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "stretch", sm: "center" },
        }}
      >
        <AssetSearchField
          placeholder="Search name, tag, serial..."
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPg(0);
          }}
          onClear={() => {
            setQ("");
            setPg(0);
          }}
          sx={{ flex: 1, minWidth: 0 }}
        />
        <Typography
          sx={{
            fontSize: "0.7rem",
            color: T.inkLight,
            textAlign: { xs: "right", sm: "left" },
            whiteSpace: "nowrap",
          }}
        >
          {filtered.length} assets
        </Typography>
      </Box>
      {isMobile && (
        <Stack spacing={1.25}>
          {paged.map((r, i) => (
            <Paper
              key={i}
              elevation={0}
              sx={{
                p: 1.5,
                borderRadius: "10px",
                border: `1px solid ${T.border}`,
                bgcolor: T.surface,
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
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontWeight: 800,
                      fontSize: "0.78rem",
                      color: T.ink,
                      overflowWrap: "anywhere",
                    }}
                  >
                    {r.assetName || "N/A"}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "0.62rem",
                      color: T.inkLight,
                      fontFamily: "monospace",
                      overflowWrap: "anywhere",
                    }}
                  >
                    {r.assetId || "N/A"}
                  </Typography>
                </Box>
                <SBadge status={r.status} />
              </Box>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  gap: 1,
                }}
              >
                {[
                  ["Tag", r.tagNumber || "N/A"],
                  ["Serial", r.serialNumber || "N/A"],
                  [
                    "Category",
                    r.category?.name || r.assetCategoryId?.name || "Uncategorized",
                  ],
                  ["Location", r.currentLocation || "N/A"],
                ].map(([label, value]) => (
                  <Box key={label} sx={{ minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontSize: "0.58rem",
                        color: T.inkLight,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        mb: 0.25,
                      }}
                    >
                      {label}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "0.68rem",
                        color: T.inkMid,
                        fontWeight: 600,
                        overflowWrap: "anywhere",
                      }}
                    >
                      {value}
                    </Typography>
                  </Box>
                ))}
              </Box>

              <Box
                sx={{
                  mt: 1.25,
                  pt: 1,
                  borderTop: `1px solid ${T.border}`,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Box>
                  <Typography
                    sx={{
                      fontSize: "0.58rem",
                      color: T.inkLight,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      mb: 0.35,
                    }}
                  >
                    Condition
                  </Typography>
                  <SBadge status={r.assetCondition || r.condition} />
                </Box>
                <Box sx={{ minWidth: 92 }}>
                  <Typography
                    sx={{
                      fontSize: "0.58rem",
                      color: T.inkLight,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      mb: 0.5,
                    }}
                  >
                    Health
                  </Typography>
                  <ProgressBar
                    value={r.healthScore}
                    color={
                      r.healthScore >= 70
                        ? T.green
                        : r.healthScore >= 40
                          ? T.amber
                          : T.red
                    }
                  />
                </Box>
              </Box>
            </Paper>
          ))}
        </Stack>
      )}
      <TableContainer
        sx={{
          display: isMobile ? "none" : "block",
          maxHeight: 420,
          borderRadius: "10px",
          border: `1px solid ${T.border}`,
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <Table stickyHeader size="small" sx={{ minWidth: { xs: 390, sm: "auto" } }}>
          <TableHead>
            <TableRow>
              <ColHead>Asset</ColHead>
              {!isMobile && <ColHead>Tag / Serial</ColHead>}
              {!isMobile && <ColHead>Category</ColHead>}
              {!isMobile && <ColHead>Location</ColHead>}
              <ColHead>Condition</ColHead>
              {!isMobile && <ColHead>Health</ColHead>}
              <ColHead>Status</ColHead>
            </TableRow>
          </TableHead>
          <TableBody>
            {paged.map((r, i) => (
              <TableRow key={i} hover sx={{ "&:hover": { bgcolor: alpha(T.brand, 0.06) } }}>
                <DataCell bold>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: { xs: "0.65rem", sm: "0.74rem" },
                      color: T.ink,
                    }}
                  >
                    {fmtShort(r.assetName || "—", 12)}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: { xs: "0.55rem", sm: "0.62rem" },
                      color: T.inkLight,
                    }}
                  >
                    {fmtShort(r.assetId || "—", 10)}
                  </Typography>
                </DataCell>
                {!isMobile && (
                  <DataCell mono>
                    <Typography
                      sx={{
                        fontSize: { xs: "0.6rem", sm: "0.67rem" },
                        color: T.inkMid,
                      }}
                    >
                      {fmtShort(r.tagNumber || "—", 10)}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: { xs: "0.55rem", sm: "0.62rem" },
                        color: T.inkLight,
                      }}
                    >
                      {fmtShort(r.serialNumber || "—", 10)}
                    </Typography>
                  </DataCell>
                )}
                {!isMobile && (
                  <DataCell>
                    <Chip
                      label={
                        r.category?.name ||
                        r.assetCategoryId?.name ||
                        "Uncategorized"
                      }
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: "0.5rem",
                        bgcolor: T.amberBg,
                        color: T.amber,
                      }}
                    />
                  </DataCell>
                )}
                {!isMobile && (
                  <DataCell>{fmtShort(r.currentLocation || "—", 10)}</DataCell>
                )}
                <DataCell>
                  <SBadge status={r.assetCondition || r.condition} />
                </DataCell>
                {!isMobile && (
                  <DataCell>
                    <ProgressBar
                      value={r.healthScore}
                      color={
                        r.healthScore >= 70
                          ? T.green
                          : r.healthScore >= 40
                            ? T.amber
                            : T.red
                      }
                    />
                  </DataCell>
                )}
                <DataCell>
                  <SBadge status={r.status} />
                </DataCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={filtered.length}
        page={pg}
        rowsPerPage={rpp}
        onPageChange={(_, p) => setPg(p)}
        onRowsPerPageChange={(e) => {
          setRpp(+e.target.value);
          setPg(0);
        }}
        rowsPerPageOptions={[5, 10, 25]}
        sx={{
          color: T.inkSub,
          "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
            { fontSize: { xs: "0.6rem", sm: "0.71rem" }, color: T.inkLight },
          "& .MuiTablePagination-toolbar": {
            flexWrap: "wrap",
            justifyContent: { xs: "center", sm: "flex-end" },
            gap: { xs: 0.5, sm: 0 },
            px: { xs: 0, sm: 2 },
            minHeight: { xs: "auto", sm: 52 },
            py: { xs: 1, sm: 0 },
          },
          "& .MuiTablePagination-spacer": {
            display: { xs: "none", sm: "block" },
          },
          "& .MuiTablePagination-actions": {
            mx: { xs: "auto", sm: 0 },
            width: { xs: "100%", sm: "auto" },
            display: "flex",
            justifyContent: { xs: "center", sm: "flex-start" },
            "& .MuiIconButton-root": { color: T.inkSub },
          },
        }}
      />
    </>
  );
};

const AssignmentsTable = ({ data }) => {
  const [pg, setPg] = useState(0);
  const [rpp, setRpp] = useState(10);
  const [statusF, setSt] = useState("");
  const isMobile = useMediaQuery("(max-width:900px)");

  const filtered = useMemo(
    () => (data || []).filter((r) => !statusF || r.status === statusF),
    [data, statusF],
  );
  const paged = filtered.slice(pg * rpp, pg * rpp + rpp);

  if (!data?.length)
    return (
      <EmptyState
        icon={AssignmentIcon}
        title="No assignments found"
        desc="Adjust filters and generate"
      />
    );

  return (
    <>
      <Box
        sx={{
          display: "flex",
          gap: 1.5,
          mb: 2,
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "stretch", sm: "center" },
        }}
      >
        <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 130 }, ...darkFieldSx }}>
          <InputLabel sx={{ fontSize: "0.8rem" }}>Status</InputLabel>
          <Select
            value={statusF}
            onChange={(e) => {
              setSt(e.target.value);
              setPg(0);
            }}
            label="Status"
            MenuProps={darkMenuProps()}
          >
            <MenuItem value="">All</MenuItem>
            {[
              "pending",
              "in_progress",
              "submitted",
              "completed",
              "approved",
              "rejected",
            ].map((s) => (
              <MenuItem key={s} value={s}>
                {s.replace(/_/g, " ")}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Typography
          sx={{
            fontSize: "0.7rem",
            color: T.inkLight,
            textAlign: { xs: "right", sm: "left" },
            whiteSpace: "nowrap",
          }}
        >
          {filtered.length} assignments
        </Typography>
      </Box>
      {isMobile && (
        <Stack spacing={1.25}>
          {paged.map((r, i) => (
            <ReportMobileCard
              key={i}
              title={r.customer || r.customerName || "N/A"}
              subtitle={
                r.checklists?.map((c) => c.name || c).join(", ") ||
                "No checklist"
              }
              badge={<SBadge status={r.status} />}
              rows={[
                {
                  label: "Priority",
                  node: (
                    <Chip
                      label={(r.priority || "low").toUpperCase()}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: "0.58rem",
                        fontWeight: 700,
                        bgcolor: T.amberBg,
                        color: T.amber,
                      }}
                    />
                  ),
                },
                { label: "Due Date", value: fmtDate(r.dueDate) },
                {
                  label: "Overdue",
                  value: r.isOverdue ? `+${r.daysOverdue || 0}d` : "No",
                },
                {
                  label: "Checklists",
                  value:
                    r.checklists?.map((c) => c.name || c).join(", ") || "N/A",
                },
              ]}
            />
          ))}
        </Stack>
      )}
      <TableContainer
        sx={{
          display: isMobile ? "none" : "block",
          maxHeight: 420,
          borderRadius: "10px",
          border: `1px solid ${T.border}`,
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <Table stickyHeader size="small" sx={{ minWidth: { xs: 360, sm: "auto" } }}>
          <TableHead>
            <TableRow>
              <ColHead>Customer</ColHead>
              {!isMobile && <ColHead>Priority</ColHead>}
              <ColHead>Status</ColHead>
              {!isMobile && <ColHead>Due date</ColHead>}
              {!isMobile && <ColHead align="right">Overdue</ColHead>}
              {!isMobile && <ColHead>Checklists</ColHead>}
            </TableRow>
          </TableHead>
          <TableBody>
            {paged.map((r, i) => (
              <TableRow key={i} hover sx={{ "&:hover": { bgcolor: alpha(T.brand, 0.06) } }}>
                <DataCell bold>
                  {fmtShort(r.customer || r.customerName || "—", 12)}
                </DataCell>
                {!isMobile && (
                  <DataCell>
                    <Chip
                      label={(r.priority || "low").toUpperCase()}
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: "0.55rem",
                        fontWeight: 700,
                        bgcolor: T.amberBg,
                        color: T.amber,
                      }}
                    />
                  </DataCell>
                )}
                <DataCell>
                  <SBadge status={r.status} />
                </DataCell>
                {!isMobile && <DataCell>{fmtDate(r.dueDate)}</DataCell>}
                {!isMobile && (
                  <DataCell align="right">
                    {r.isOverdue ? (
                      <Typography
                        sx={{
                          fontWeight: 700,
                          fontSize: { xs: "0.65rem", sm: "0.71rem" },
                          color: T.red,
                        }}
                      >
                        +{r.daysOverdue}d
                      </Typography>
                    ) : (
                      "—"
                    )}
                  </DataCell>
                )}
                {!isMobile && (
                  <DataCell>
                    <Typography
                      sx={{
                        fontSize: { xs: "0.6rem", sm: "0.67rem" },
                        color: T.inkSub,
                      }}
                    >
                      {fmtShort(
                        r.checklists?.map((c) => c.name || c).join(", ") || "—",
                        15,
                      )}
                    </Typography>
                  </DataCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={filtered.length}
        page={pg}
        rowsPerPage={rpp}
        onPageChange={(_, p) => setPg(p)}
        onRowsPerPageChange={(e) => {
          setRpp(+e.target.value);
          setPg(0);
        }}
        rowsPerPageOptions={[5, 10, 25]}
        sx={{
          color: T.inkSub,
          "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
            { fontSize: { xs: "0.6rem", sm: "0.71rem" }, color: T.inkLight },
          "& .MuiTablePagination-toolbar": {
            flexWrap: "wrap",
            justifyContent: { xs: "center", sm: "flex-end" },
            gap: { xs: 0.5, sm: 0 },
            px: { xs: 0, sm: 2 },
            minHeight: { xs: "auto", sm: 52 },
            py: { xs: 1, sm: 0 },
          },
          "& .MuiTablePagination-spacer": {
            display: { xs: "none", sm: "block" },
          },
          "& .MuiTablePagination-actions": {
            mx: { xs: "auto", sm: 0 },
            width: { xs: "100%", sm: "auto" },
            display: "flex",
            justifyContent: { xs: "center", sm: "flex-start" },
            "& .MuiIconButton-root": { color: T.inkSub },
          },
        }}
      />
    </>
  );
};

const GenericTable = ({ data }) => {
  const [pg, setPg] = useState(0);
  const [rpp, setRpp] = useState(10);
  const isMobile = useMediaQuery("(max-width:900px)");

  const cols = useMemo(
    () =>
      data?.length
        ? Object.keys(data[0])
            .filter((k) => typeof data[0][k] !== "object")
            .slice(0, isMobile ? 4 : 8)
        : [],
    [data, isMobile],
  );
  const paged = (data || []).slice(pg * rpp, pg * rpp + rpp);
  const tableMinWidth = Math.max(isMobile ? 640 : 900, cols.length * 170);

  if (!data?.length)
    return (
      <EmptyState
        icon={ReportIcon}
        title="No records found"
        desc="Try different filters or date range"
      />
    );

  return (
    <>
      {isMobile && (
        <Stack spacing={1.25}>
          {paged.map((row, i) => {
            const scalarEntries = Object.entries(row)
              .map(([key, value]) => [key, scalarValue(value)])
              .filter(([, value]) => value !== null);
            const titleEntry =
              scalarEntries.find(([key]) =>
                ["name", "title", "requestType", "submittedByName", "action"].includes(key),
              ) || scalarEntries[0];
            const subtitleEntry =
              scalarEntries.find(([key]) =>
                ["id", "_id", "assetId", "requestId", "inspectionId"].includes(key),
              ) || scalarEntries.find(([key]) => key !== titleEntry?.[0]);
            const statusEntry = scalarEntries.find(([key]) =>
              key.toLowerCase().includes("status"),
            );
            const rows = scalarEntries
              .filter(
                ([key]) =>
                  key !== titleEntry?.[0] &&
                  key !== subtitleEntry?.[0] &&
                  key !== statusEntry?.[0],
              )
              .slice(0, 6)
              .map(([key, value]) => ({
                label: reportLabel(key),
                value: fmtShort(value, 42),
              }));

            return (
              <ReportMobileCard
                key={i}
                title={titleEntry?.[1] || "Record"}
                subtitle={subtitleEntry?.[1]}
                badge={statusEntry ? <SBadge status={statusEntry[1]} /> : null}
                rows={rows.length ? rows : [{ label: "Details", value: "N/A" }]}
              />
            );
          })}
        </Stack>
      )}
      <TableContainer
        sx={{
          display: isMobile ? "none" : "block",
          maxHeight: 420,
          borderRadius: "10px",
          border: `1px solid ${T.border}`,
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <Table stickyHeader size="small" sx={{ minWidth: tableMinWidth, tableLayout: "fixed" }}>
          <TableHead>
            <TableRow>
              {cols.map((c) => (
                <ColHead key={c}>{c.replace(/([A-Z])/g, " $1").trim()}</ColHead>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paged.map((row, i) => (
              <TableRow key={i} hover sx={{ "&:hover": { bgcolor: alpha(T.brand, 0.06) } }}>
                {cols.map((c, j) => {
                  let val = row[c];
                  if (typeof val === "object") val = "—";
                  if (typeof val === "string")
                    val = fmtShort(val, isMobile ? 15 : 40);
                  return (
                    <DataCell key={c} bold={j === 0} mono={j === 0} noWrap={j === 0}>
                      {String(val ?? "—")}
                    </DataCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={(data || []).length}
        page={pg}
        rowsPerPage={rpp}
        onPageChange={(_, p) => setPg(p)}
        onRowsPerPageChange={(e) => {
          setRpp(+e.target.value);
          setPg(0);
        }}
        rowsPerPageOptions={[5, 10, 25]}
        sx={{
          color: T.inkSub,
          "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
            { fontSize: { xs: "0.6rem", sm: "0.71rem" }, color: T.inkLight },
          "& .MuiTablePagination-toolbar": {
            flexWrap: "wrap",
            justifyContent: { xs: "center", sm: "flex-end" },
            gap: { xs: 0.5, sm: 0 },
            px: { xs: 0, sm: 2 },
            minHeight: { xs: "auto", sm: 52 },
            py: { xs: 1, sm: 0 },
          },
          "& .MuiTablePagination-spacer": {
            display: { xs: "none", sm: "block" },
          },
          "& .MuiTablePagination-actions": {
            mx: { xs: "auto", sm: 0 },
            width: { xs: "100%", sm: "auto" },
            display: "flex",
            justifyContent: { xs: "center", sm: "flex-start" },
            "& .MuiIconButton-root": { color: T.inkSub },
          },
        }}
      />
    </>
  );
};

// ─── Main Dashboard ────────────────────────────────────────────────────────────
const ReportsDashboard = () => {
  const { user } = useAuth();
  const theme = useTheme();
  applyReportThemeTokens(theme.palette.mode);
  const {
    loading,
    error,
    reportData,
    getClientReport,
    getRevenueReport,
    getChecklistRequestsReport,
    getContactInquiriesReport,
    getAuditLogsReport,
    getTeamMembersReport,
    getAssetReport,
    getAssetRequestsReport,
    getChecklistSubmissionsReport,
    getChecklistReport,
    getAssignmentReport,
    clearError,
    clearReportData,
    isAdmin,
    isSuperAdmin,
  } = useReport();

  const role = user?.role || "team";
  const allowed = ROLE_REPORTS[role] || ROLE_REPORTS.team;
  const isMobile = useMediaQuery("(max-width:640px)");

  const [reportType, setReportType] = useState(allowed[0] || "assignments");
  const [datePreset, setDatePreset] = useState("last_30_days");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [filters, setFilters] = useState({});
  const [filterOpen, setFilterOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState({ open: false, msg: "", sev: "success" });
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  const notify = useCallback(
    (msg, sev = "success") => setToast({ open: true, msg, sev }),
    [],
  );

  // ─── FETCH MAP ──────────────────────────────────────────────────────────────
  const FETCH_MAP = useMemo(
    () => ({
      clients: getClientReport,
      revenue: getRevenueReport,
      "checklist-requests": getChecklistRequestsReport,
      compliance: getContactInquiriesReport,
      team: getTeamMembersReport,
      "asset-requests": getAssetRequestsReport,
      "checklist-submissions": getChecklistSubmissionsReport,
      assets: getAssetReport,
      checklists: getChecklistReport,
      assignments: getAssignmentReport,
      inspections: getAuditLogsReport,
    }),
    [
      getClientReport,
      getRevenueReport,
      getChecklistRequestsReport,
      getContactInquiriesReport,
      getTeamMembersReport,
      getAssetRequestsReport,
      getChecklistSubmissionsReport,
      getAssetReport,
      getChecklistReport,
      getAssignmentReport,
      getAuditLogsReport,
    ],
  );

  // ─── MERGED FILTERS ──────────────────────────────────────────────────────────
  const mergedFilters = useMemo(() => {
    const f = { ...filters };
    if (datePreset === "custom") {
      if (customStart) f.startDate = customStart;
      if (customEnd) f.endDate = customEnd;
    } else {
      f.dateRange = datePreset;
    }
    return f;
  }, [filters, datePreset, customStart, customEnd]);

  // ─── AUTO-GENERATE ON MOUNT ─────────────────────────────────────────────────
  useEffect(() => {
    const autoGenerate = async () => {
      const fn = FETCH_MAP[reportType];
      if (fn) {
        setGenerating(true);
        try {
          const res = await fn(mergedFilters);
          if (res?.success) {
            const cnt = res.data?.data?.length ?? 0;
            if (cnt > 0) {
              console.log(`✅ Auto-loaded ${cnt} records for ${reportType}`);
            }
          }
        } catch (e) {
          console.warn("Auto-generate error:", e.message);
        } finally {
          setGenerating(false);
          setInitialLoadDone(true);
        }
      }
    };
    autoGenerate();
  }, []);

  // ─── AUTO-GENERATE ON CHANGE ────────────────────────────────────────────────
  useEffect(() => {
    if (initialLoadDone) {
      clearReportData();

      const autoGenerate = async () => {
        const fn = FETCH_MAP[reportType];
        if (fn) {
          setGenerating(true);
          try {
            const res = await fn(mergedFilters);
            if (res?.success) {
              const cnt = res.data?.data?.length ?? 0;
              if (cnt > 0) {
                console.log(`✅ Auto-loaded ${cnt} records for ${reportType}`);
              }
            }
          } catch (e) {
            console.warn("Auto-generate error:", e.message);
          } finally {
            setGenerating(false);
          }
        }
      };

      autoGenerate();
    }
  }, [reportType, datePreset, customStart, customEnd, filters]);

  // ─── HANDLE GENERATE (Manual) ──────────────────────────────────────────────
  const handleGenerate = useCallback(async () => {
    const fn = FETCH_MAP[reportType];
    if (!fn) {
      notify("Unknown report type", "error");
      return;
    }
    setGenerating(true);
    try {
      const res = await fn(mergedFilters);
      if (res?.success) {
        const cnt = res.data?.data?.length ?? 0;
        notify(
          cnt > 0
            ? `${cnt} record${cnt !== 1 ? "s" : ""} loaded`
            : "No records match the filters",
          cnt > 0 ? "success" : "info",
        );
        setFilterOpen(false);
      }
    } catch (e) {
      notify(e.message || "Failed to generate report", "error");
    } finally {
      setGenerating(false);
    }
  }, [FETCH_MAP, reportType, mergedFilters, notify]);

  // ─── HANDLE EXPORT ──────────────────────────────────────────────────────────
  const handleExport = useCallback(
    async (fmt) => {
      if (!reportData?.data?.length) {
        notify("Generate a report first", "warning");
        return;
      }
      setExporting(true);
      try {
        if (fmt === "pdf") {
          await exportPDF(reportData, reportType);
          notify("PDF downloaded");
        } else {
          exportExcel(reportData, reportType);
          notify("Excel downloaded");
        }
      } catch (e) {
        notify(`Export failed: ${e.message}`, "error");
      } finally {
        setExporting(false);
      }
    },
    [reportData, reportType, notify],
  );


  // ─── RENDER TABLE ────────────────────────────────────────────────────────────
  const renderTable = () => {
    if (!reportData) return null;
    const d = reportData.data || [];
    if (reportType === "clients") return <ClientsTable data={d} />;
    if (reportType === "revenue") return <GenericTable data={d} />;
    if (reportType === "team") return <TeamTable data={d} />;
    if (reportType === "assets") return <AssetsTable data={d} />;
    if (reportType === "assignments") return <AssignmentsTable data={d} />;
    return <GenericTable data={d} />;
  };

  const meta = REPORT_META[reportType] || {};
  const MetaIcon = meta.icon || ReportIcon;
  const datePresetLabel = DATE_PRESETS.find((item) => item.value === datePreset)?.label || "Date range";
  const recordCount = reportData?.data?.length ?? 0;

  const roleCfg = {
    super_admin: {
      icon: SuperIcon,
      label: "Super Admin",
      bg: T.brandLight,
      color: T.brand,
    },
    admin: { icon: AdminIcon, label: "Admin", bg: T.purpleBg, color: T.purple },
    team: { icon: TeamIcon, label: "Team", bg: T.greenBg, color: T.green },
  };
  const rc = roleCfg[role] || roleCfg.team;
  const RoleIcon = rc.icon;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        p: { xs: 2, sm: 2.25, md: 3 },
        overflowX: "hidden",
        bgcolor: T.page,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 2.5 },
          mb: 2.5,
          borderRadius: "16px",
          border: `1px solid ${T.border}`,
          bgcolor: T.surface,
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          flexDirection: { xs: "column", lg: "row" },
          gap: 2.5,
          boxShadow: `0 18px 44px ${alpha("#0f172a", 0.06)}`,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Chip
            icon={<RoleIcon sx={{ fontSize: 14 }} />}
            label={rc.label}
            size="small"
            sx={{
              mb: 1,
              height: 24,
              borderRadius: "8px",
              bgcolor: rc.bg,
              color: rc.color,
              fontWeight: 800,
              "& .MuiChip-icon": { color: rc.color },
            }}
          />
          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: { xs: "1.35rem", sm: "1.65rem" },
                color: T.ink,
                letterSpacing: 0,
                lineHeight: 1.15,
              }}
            >
              Reports & Analytics
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: "0.78rem", sm: "0.85rem" },
                color: T.inkSub,
                mt: 0.4,
              }}
            >
              {isSuperAdmin
                ? "Platform-wide reports, exports, and operational performance"
                : isAdmin
                  ? "Organisation reports, exports, and operational performance"
                  : "Your reports, activity, and assigned work"}
            </Typography>
          </Box>
        </Box>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          flexWrap="wrap"
          gap={1}
          alignItems={{ xs: "stretch", sm: "center" }}
          width={{ xs: "100%", lg: "auto" }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(3, minmax(0, 1fr))",
                sm: "repeat(5, auto)",
              },
              gap: 0.6,
              width: "100%",
              p: 0.4,
              border: `1px solid ${T.border}`,
              borderRadius: "12px",
              bgcolor: T.surfaceAlt,
            }}
          >
            {DATE_PRESETS.map((p) => (
              <Box
                key={p.value}
                onClick={() => setDatePreset(p.value)}
                sx={{
                  px: { xs: 0.7, sm: 1.3 },
                  py: { xs: 0.5, sm: 0.45 },
                  borderRadius: "9px",
                  cursor: "pointer",
                  fontSize: { xs: "0.66rem", sm: "0.69rem" },
                  fontWeight: 600,
                  textAlign: "center",
                  transition: "all 0.15s",
                  bgcolor: datePreset === p.value ? T.brand : T.surface,
                  color: datePreset === p.value ? T.brandContrast : T.inkSub,
                  border: `1px solid ${datePreset === p.value ? T.brand : "transparent"}`,
                  whiteSpace: "nowrap",
                  "&:hover": {
                    bgcolor:
                      datePreset === p.value ? T.brandDark : T.surfaceAlt,
                  },
                }}
              >
                {p.label}
              </Box>
            ))}
          </Box>

          <Button
            startIcon={<FilterIcon sx={{ fontSize: { xs: 12, sm: 14 } }} />}
            onClick={() => setFilterOpen(true)}
            sx={{
              bgcolor: `${T.surface} !important`,
              border: `1px solid ${T.border}`,
              color: T.inkMid,
              borderRadius: "10px",
              textTransform: "none",
              fontSize: { xs: "0.65rem", sm: "0.74rem" },
              fontWeight: 600,
              px: { xs: 1, sm: 1.5 },
              height: { xs: 42, sm: 34 },
              width: { xs: "100%", sm: "auto" },
              flexShrink: 0,
              "&:hover": { bgcolor: `${alpha(T.brand, 0.1)} !important` },
            }}
          >
            Filters
          </Button>

          <Button
            variant="contained"
            startIcon={
              generating ? (
                <CircularProgress size={13} sx={{ color: T.brandContrast }} />
              ) : (
                <RunIcon sx={{ fontSize: { xs: 12, sm: 14 } }} />
              )
            }
            onClick={handleGenerate}
            disabled={generating}
            sx={{
              background: `linear-gradient(135deg, ${T.brand} 0%, ${T.brandDark} 100%)`,
              color: T.brandContrast,
              borderRadius: "10px",
              textTransform: "none",
              fontSize: { xs: "0.65rem", sm: "0.74rem" },
              fontWeight: 700,
              px: { xs: 1.5, sm: 2 },
              height: { xs: 44, sm: 34 },
              width: { xs: "100%", sm: "auto" },
              flexShrink: 0,
              boxShadow: `0 2px 10px ${alpha(T.brand, 0.4)}`,
              "&:hover": {
                background: `linear-gradient(135deg, ${T.brandDark} 0%, ${T.brand} 100%)`,
              },
            }}
          >
            Generate
          </Button>
          <Button
            startIcon={<PdfIcon sx={{ fontSize: { xs: 12, sm: 14 } }} />}
            onClick={() => handleExport("pdf")}
            disabled={exporting || !recordCount}
            sx={{
              bgcolor: `${T.redBg} !important`,
              border: `1px solid ${alpha(T.red, 0.28)}`,
              color: T.red,
              borderRadius: "10px",
              textTransform: "none",
              fontSize: { xs: "0.65rem", sm: "0.74rem" },
              fontWeight: 700,
              px: { xs: 1.5, sm: 2 },
              height: { xs: 42, sm: 34 },
              width: { xs: "100%", sm: "auto" },
              flexShrink: 0,
            }}
          >
            PDF
          </Button>
          <Button
            startIcon={<ExcelIcon sx={{ fontSize: { xs: 12, sm: 14 } }} />}
            onClick={() => handleExport("excel")}
            disabled={exporting || !recordCount}
            sx={{
              bgcolor: `${T.greenBg} !important`,
              border: `1px solid ${alpha(T.green, 0.28)}`,
              color: T.green,
              borderRadius: "10px",
              textTransform: "none",
              fontSize: { xs: "0.65rem", sm: "0.74rem" },
              fontWeight: 700,
              px: { xs: 1.5, sm: 2 },
              height: { xs: 42, sm: 34 },
              width: { xs: "100%", sm: "auto" },
              flexShrink: 0,
            }}
          >
            Excel
          </Button>
        </Stack>
      </Paper>

      {/* Custom date range */}
      <Collapse in={datePreset === "custom"}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 1, sm: 1.5 },
            mb: 2,
            borderRadius: "12px",
            border: `1px solid ${alpha(T.brand, 0.35)}`,
            bgcolor: T.brandFaint,
            display: "flex",
            alignItems: { xs: "stretch", sm: "center" },
            gap: 1.5,
            flexWrap: "wrap",
            flexDirection: { xs: "column", sm: "row" },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: { xs: "100%", sm: "auto" } }}>
            <CalIcon sx={{ fontSize: 15, color: T.brand, flexShrink: 0 }} />
            <Typography
              sx={{
                fontSize: { xs: "0.65rem", sm: "0.74rem" },
                fontWeight: 600,
                color: T.brand,
              }}
            >
              Custom date range
            </Typography>
          </Box>
          <TextField
            type="date"
            size="small"
            label="From"
            value={customStart}
            onChange={(e) => setCustomStart(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{
  width: { xs: "100%", sm: 148 },
  ...darkFieldSx(),
  "& input": { color: T.ink, colorScheme: theme.palette.mode },
  "& input::-webkit-calendar-picker-indicator": {
    cursor: "pointer",
    filter: theme.palette.mode === "dark" ? "invert(1)" : "none",
  },
}}
          />
          <TextField
            type="date"
            size="small"
            label="To"
            value={customEnd}
            onChange={(e) => setCustomEnd(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{
  width: { xs: "100%", sm: 148 },
  ...darkFieldSx(),
  "& input": { color: T.ink, colorScheme: theme.palette.mode },
  "& input::-webkit-calendar-picker-indicator": {
    cursor: "pointer",
    filter: theme.palette.mode === "dark" ? "invert(1)" : "none",
  },
}}
          />
        </Paper>
      </Collapse>

      {/* Error banner */}
      {error && (
        <Alert
          severity="error"
          onClose={clearError}
          sx={{
            mb: 2,
            borderRadius: "12px",
            fontSize: { xs: "0.7rem", sm: "0.77rem" },
          }}
        >
          {error}
        </Alert>
      )}

      {/* Report type selector */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 1.25, sm: 1.5 },
          mb: 2.5,
          borderRadius: "16px",
          border: `1px solid ${T.border}`,
          bgcolor: T.surface,
          boxShadow: `0 14px 34px ${alpha("#0f172a", 0.045)}`,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1.5, mb: 1.25 }}>
          <Box>
            <Typography sx={{ fontSize: "0.9rem", fontWeight: 800, color: T.ink }}>
              Report Library
            </Typography>
            <Typography sx={{ fontSize: "0.68rem", color: T.inkSub }}>
              {allowed.length} report views available
            </Typography>
          </Box>
          <Chip
            size="small"
            label={datePreset === "custom" ? "Custom range" : datePresetLabel}
            sx={{
              height: 24,
              borderRadius: "8px",
              bgcolor: T.brandFaint,
              color: T.brand,
              fontWeight: 800,
              fontSize: "0.66rem",
            }}
          />
        </Box>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(3, minmax(0, 1fr))", lg: `repeat(${Math.min(allowed.length, 7)}, minmax(0, 1fr))` },
            gap: 1,
          }}
        >
          {allowed.map((rt) => {
            const m = REPORT_META[rt];
            const Icon = m.icon;
            const sel = reportType === rt;
            return (
              <Box
                key={rt}
                onClick={() => setReportType(rt)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  gap: 0.9,
                  px: { xs: 1, sm: 1.15 },
                  py: { xs: 0.9, sm: 1 },
                  borderRadius: "12px",
                  cursor: "pointer",
                  border: `1px solid ${sel ? m.color : T.border}`,
                  bgcolor: sel ? alpha(m.color, 0.14) : T.surface,
                  transition: "all 0.15s",
                  minHeight: { xs: 58, sm: 64 },
                  minWidth: 0,
                  boxShadow: sel ? `inset 0 0 0 1px ${alpha(m.color, 0.32)}` : "none",
                  "&:hover": {
                    bgcolor: alpha(m.color, 0.1),
                    borderColor: m.color,
                    transform: "translateY(-1px)",
                  },
                }}
              >
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: "9px",
                    bgcolor: alpha(m.color, sel ? 0.18 : 0.1),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon
                    sx={{
                      fontSize: { xs: 15, sm: 16 },
                      color: sel ? m.color : T.inkSub,
                    }}
                  />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontSize: { xs: "0.72rem", sm: "0.78rem" },
                      fontWeight: 800,
                      color: sel ? m.color : T.inkMid,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {m.label}
                  </Typography>
                  <Typography sx={{ fontSize: "0.6rem", color: T.inkLight, mt: 0.1 }}>
                    Report
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Paper>

      {/* Main report panel */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: "16px",
          border: `1px solid ${T.border}`,
          bgcolor: T.surface,
          overflow: "hidden",
          boxShadow: `0 18px 48px ${alpha("#0f172a", 0.055)}`,
        }}
      >
        <Box
          sx={{
            px: { xs: 1.5, sm: 2.5 },
            py: { xs: 1.5, sm: 2.25 },
            borderBottom: `1px solid ${T.border}`,
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 1.5,
            alignItems: { xs: "flex-start", sm: "center" },
            background: `linear-gradient(135deg, ${alpha(meta.color || T.brand, 0.12)} 0%, ${T.surface} 68%)`,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
            <Box
              sx={{
                width: { xs: 30, sm: 36 },
                height: { xs: 30, sm: 36 },
                borderRadius: "11px",
                bgcolor: alpha(meta.color || T.brand, 0.18),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <MetaIcon
                sx={{
                  fontSize: { xs: 14, sm: 18 },
                  color: meta.color || T.brand,
                }}
              />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: "0.85rem", sm: "1rem" },
                  color: T.ink,
                }}
              >
                {meta.label || reportType} Report
              </Typography>
              <Typography
                sx={{
                  fontSize: { xs: "0.62rem", sm: "0.7rem" },
                  color: T.inkSub,
                }}
              >
                {reportData
                  ? `${recordCount} records · updated ${new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`
                  : "Loading report data..."}
              </Typography>
            </Box>
          </Box>

          {reportData?.data?.length > 0 && (
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{
                flexShrink: 0,
                ml: { xs: "auto", sm: 0 },
              }}
            >
              <Tooltip title="Export PDF">
                <IconButton
                  onClick={() => handleExport("pdf")}
                  disabled={exporting}
                  size="small"
                  sx={{
                    bgcolor: `${T.redBg} !important`,
                    borderRadius: "8px",
                    p: { xs: 0.5, sm: 0.75 },
                    "&:hover": { bgcolor: `${alpha(T.red, 0.28)} !important` },
                  }}
                >
                  {exporting ? (
                    <CircularProgress size={14} />
                  ) : (
                    <PdfIcon
                      sx={{ fontSize: { xs: 13, sm: 15 }, color: T.red }}
                    />
                  )}
                </IconButton>
              </Tooltip>
              <Tooltip title="Export Excel">
                <IconButton
                  onClick={() => handleExport("excel")}
                  disabled={exporting}
                  size="small"
                  sx={{
                    bgcolor: `${T.greenBg} !important`,
                    borderRadius: "8px",
                    p: { xs: 0.5, sm: 0.75 },
                    "&:hover": { bgcolor: `${alpha(T.green, 0.28)} !important` },
                  }}
                >
                  <ExcelIcon
                    sx={{ fontSize: { xs: 13, sm: 15 }, color: T.green }}
                  />
                </IconButton>
              </Tooltip>
            </Stack>
          )}
        </Box>

        <Box sx={{ p: { xs: 1.25, sm: 2.5 }, bgcolor: alpha(T.surfaceAlt, 0.35) }}>
          {loading && !reportData ? (
            <Box sx={{ py: 4, display: "flex", justifyContent: "center" }}>
              <CircularProgress sx={{ color: T.brand }} />
            </Box>
          ) : !reportData ? (
            <EmptyState
              icon={MetaIcon}
              title={`Loading ${meta.label || reportType} report`}
              desc="Please wait while we fetch your data..."
            />
          ) : (
            <>
              {/* Summary KPIs */}
              {Object.keys(reportData.summary || {}).length > 0 && (
                (() => {
                  const hiddenAssignmentTiles = ["inProgress", "in_progress", "completed"];
                  const summaryItems = Object.entries(reportData.summary)
                    .filter(([k, v]) => (
                      typeof v !== "object" &&
                      v !== null &&
                      k !== "suspendedClients" &&
                      (reportType !== "assignments" || !hiddenAssignmentTiles.includes(k))
                    ))
                    .slice(0, 6);

                  return (
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: {
                          xs: "repeat(2, minmax(0, 1fr))",
                          sm: "repeat(auto-fit, minmax(180px, 1fr))",
                          xl: `repeat(${Math.max(1, summaryItems.length)}, minmax(0, 1fr))`,
                        },
                        gap: { xs: 1.1, sm: 1.5 },
                        mb: 2,
                      }}
                    >
                      {summaryItems.map(([k, v]) => (
                        <Box key={k}>
                          <StatCard
                            label={reportType === "assignments" && k === "approved" ? "Pending Approval" : reportLabel(k)}
                            value={String(v)}
                            loading={false}
                            small
                          />
                        </Box>
                      ))}
                    </Box>
                  );
                })()
              )}
              <ReportsAnalytics reportData={reportData} reportType={reportType} />
              {renderTable()}
            </>
          )}
        </Box>
      </Paper>

      {/* Filter Dialog - Mobile Responsive */}
      <Dialog
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        maxWidth="xs"
        fullWidth
        fullScreen={false}
        sx={{
          zIndex: 9999,
          "& .MuiBackdrop-root": {
            bgcolor: "rgba(2, 6, 23, 0.72)",
            backdropFilter: "blur(6px)",
          },
          "& .MuiDialog-container": {
            alignItems: { xs: "flex-end", sm: "center" },
          },
        }}
        PaperProps={{
          sx: {
            m: { xs: 0, sm: 2 },
            width: { xs: "100%", sm: "calc(100% - 64px)" },
            maxWidth: { xs: "100%", sm: 500 },
            height: { xs: "auto", sm: "auto" },
            maxHeight: { xs: "78dvh", sm: "90vh" },
            borderRadius: { xs: "24px 24px 0 0", sm: "20px" },
            border: `1px solid ${T.border}`,
            borderBottom: { xs: 0, sm: `1px solid ${T.border}` },
            bgcolor: T.surface,
            boxShadow: {
              xs: "0 -18px 56px rgba(0, 0, 0, 0.5)",
              sm: "0 22px 70px rgba(0, 0, 0, 0.42)",
            },
            overflow: "hidden",
          },
        }}
      >
        {isMobile && (
          <Box
            sx={{
              width: 44,
              height: 5,
              borderRadius: 999,
              bgcolor: alpha(T.inkLight, 0.5),
              mx: "auto",
              mt: 1.25,
              mb: 0.25,
              flexShrink: 0,
            }}
          />
        )}
        <DialogTitle
          sx={{
            p: { xs: "18px 20px 14px", sm: "22px 24px 16px" },
            background: `linear-gradient(135deg, ${alpha(meta.color || T.brand, 0.14)} 0%, ${T.surface} 70%)`,
            borderBottom: `1px solid ${T.border}`,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.35, minWidth: 0 }}>
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: "12px",
                  bgcolor: alpha(meta.color || T.brand, 0.18),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <FilterIcon sx={{ color: meta.color || T.brand, fontSize: 20 }} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  fontWeight: 900,
                  fontSize: { xs: "1.05rem", sm: "1.08rem" },
                  color: T.ink,
                  lineHeight: 1.25,
                }}
              >
                Report filters
              </Typography>
              <Typography
                sx={{
                  fontSize: { xs: "0.78rem", sm: "0.76rem" },
                  color: T.inkSub,
                  lineHeight: 1.35,
                  mt: 0.25,
                }}
              >
                Narrow results before generating
              </Typography>
              </Box>
            </Box>
            <IconButton
              size="small"
              onClick={() => setFilterOpen(false)}
              sx={{
                width: 34,
                height: 34,
                borderRadius: "10px",
                flexShrink: 0,
                color: `${T.inkSub} !important`,
                bgcolor: alpha(T.inkLight, 0.08),
                "&:hover": { bgcolor: alpha(T.inkLight, 0.14) },
              }}
            >
              <CloseIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent
          sx={{
            p: { xs: 2, sm: 2.5 },
            maxHeight: { xs: "calc(78dvh - 156px)", sm: "70vh" },
            overflowY: "auto",
            bgcolor: alpha(T.surfaceAlt, 0.45),
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.25,
              p: 1.4,
              mb: 1.5,
              borderRadius: "14px",
              border: `1px solid ${alpha(meta.color || T.brand, 0.24)}`,
              bgcolor: alpha(meta.color || T.brand, 0.08),
            }}
          >
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: "10px",
                bgcolor: alpha(meta.color || T.brand, 0.16),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <MetaIcon sx={{ fontSize: 18, color: meta.color || T.brand }} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: "0.82rem", fontWeight: 800, color: T.ink }}>
                {meta.label || reportType} Report
              </Typography>
              <Typography sx={{ fontSize: "0.68rem", color: T.inkSub }}>
                {datePreset === "custom" ? "Custom date range" : datePresetLabel}
              </Typography>
            </Box>
          </Box>

          <Stack spacing={1.5}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: "14px",
                border: `1px solid ${T.border}`,
                bgcolor: T.surface,
              }}
            >
              <Typography
                sx={{
                  color: T.inkSub,
                  fontSize: { xs: "0.72rem", sm: "0.7rem" },
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  lineHeight: 1.2,
                  mb: 0.9,
                }}
              >
                Report type
              </Typography>
              <FormControl size="small" fullWidth sx={darkFieldSx}>
                <Select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  MenuProps={darkMenuProps()}
                >
                  {allowed.map((rt) => (
                    <MenuItem key={rt} value={rt}>
                      {REPORT_META[rt]?.label || rt}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box
              sx={{
                p: 1.5,
                borderRadius: "14px",
                border: `1px solid ${T.border}`,
                bgcolor: T.surface,
              }}
            >
              <Typography
                sx={{
                  color: T.inkSub,
                  fontSize: { xs: "0.72rem", sm: "0.7rem" },
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  lineHeight: 1.2,
                  mb: 0.9,
                }}
              >
                Date range
              </Typography>
              <FormControl size="small" fullWidth sx={darkFieldSx}>
                <Select
                  value={datePreset}
                  onChange={(e) => setDatePreset(e.target.value)}
                  MenuProps={darkMenuProps()}
                >
                  {DATE_PRESETS.map((p) => (
                    <MenuItem key={p.value} value={p.value}>
                      {p.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {datePreset === "custom" && (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: 1.2,
                }}
              >
                <TextField
                  size="small"
                  type="date"
                  label="Start date"
                  fullWidth
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    ...darkFieldSx,
                    "& input": {
                      color: T.ink,
                      colorScheme: theme.palette.mode,
                    },
                    "& input::-webkit-calendar-picker-indicator": {
                      cursor: "pointer",
                      filter: theme.palette.mode === "dark" ? "invert(1)" : "none",
                    },
                  }}
                />
                <TextField
                  size="small"
                  type="date"
                  label="End date"
                  fullWidth
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    ...darkFieldSx,
                    "& input": {
                      color: T.ink,
                      colorScheme: theme.palette.mode,
                    },
                    "& input::-webkit-calendar-picker-indicator": {
                      cursor: "pointer",
                      filter: theme.palette.mode === "dark" ? "invert(1)" : "none",
                    },
                  }}
                />
              </Box>
            )}

            {/* Conditional filters */}
            {reportType === "clients" && isSuperAdmin && (
              <>
                <FormControl size="small" fullWidth sx={darkFieldSx}>
                  <InputLabel sx={{ fontSize: { xs: "0.95rem", sm: "0.82rem" } }}>
                    Plan
                  </InputLabel>
                  <Select
                    value={filters.membershipPlan || ""}
                    onChange={(e) =>
                      setFilters((p) => ({
                        ...p,
                        membershipPlan: e.target.value,
                      }))
                    }
                    label="Plan"
                    MenuProps={darkMenuProps()}
                  >
                    <MenuItem value="">All</MenuItem>
                    {["free", "standard", "premium", "enterprise"].map((p) => (
                      <MenuItem
                        key={p}
                        value={p}
                        sx={{ textTransform: "capitalize" }}
                      >
                        {p}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small" fullWidth sx={darkFieldSx}>
                  <InputLabel sx={{ fontSize: { xs: "0.95rem", sm: "0.82rem" } }}>
                    Status
                  </InputLabel>
                  <Select
                    value={filters.status || ""}
                    onChange={(e) =>
                      setFilters((p) => ({ ...p, status: e.target.value }))
                    }
                    label="Status"
                    MenuProps={darkMenuProps()}
                  >
                    <MenuItem value="">All</MenuItem>
                    {["active", "inactive", "suspended"].map((s) => (
                      <MenuItem
                        key={s}
                        value={s}
                        sx={{ textTransform: "capitalize" }}
                      >
                        {s}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </>
            )}

            {reportType === "assets" && (
              <>
                <FormControl size="small" fullWidth sx={darkFieldSx}>
                  <InputLabel sx={{ fontSize: { xs: "0.95rem", sm: "0.82rem" } }}>
                    Status
                  </InputLabel>
                  <Select
                    value={filters.status || ""}
                    onChange={(e) =>
                      setFilters((p) => ({ ...p, status: e.target.value }))
                    }
                    label="Status"
                    MenuProps={darkMenuProps()}
                  >
                    <MenuItem value="">All</MenuItem>
                    {["Active", "Maintenance", "Decommissioned", "Retired"].map(
                      (s) => (
                        <MenuItem key={s} value={s}>
                          {s}
                        </MenuItem>
                      ),
                    )}
                  </Select>
                </FormControl>
                <AssetSearchField
                  label="Search"
                  placeholder="Name, tag, serial..."
                  value={filters.search || ""}
                  onChange={(e) =>
                    setFilters((p) => ({ ...p, search: e.target.value }))
                  }
                  onClear={() => setFilters((p) => ({ ...p, search: "" }))}
                />
              </>
            )}

            {reportType === "team" && (
              <>
                <FormControl size="small" fullWidth sx={darkFieldSx}>
                  <InputLabel sx={{ fontSize: { xs: "0.95rem", sm: "0.82rem" } }}>
                    Role
                  </InputLabel>
                  <Select
                    value={filters.teamRole || ""}
                    onChange={(e) =>
                      setFilters((p) => ({ ...p, teamRole: e.target.value }))
                    }
                    label="Role"
                    MenuProps={darkMenuProps()}
                  >
                    <MenuItem value="">All</MenuItem>
                    {[
                      "inspector",
                      "senior_inspector",
                      "lead_inspector",
                      "supervisor",
                    ].map((r) => (
                      <MenuItem key={r} value={r}>
                        {r.replace(/_/g, " ")}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small" fullWidth sx={darkFieldSx}>
                  <InputLabel sx={{ fontSize: { xs: "0.95rem", sm: "0.82rem" } }}>
                    Status
                  </InputLabel>
                  <Select
                    value={filters.status || ""}
                    onChange={(e) =>
                      setFilters((p) => ({ ...p, status: e.target.value }))
                    }
                    label="Status"
                    MenuProps={darkMenuProps()}
                  >
                    <MenuItem value="">All</MenuItem>
                    {["active", "inactive", "on_leave"].map((s) => (
                      <MenuItem key={s} value={s}>
                        {s.replace(/_/g, " ")}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </>
            )}

            {(reportType === "assignments" || reportType === "inspections") && (
              <>
                <FormControl size="small" fullWidth sx={darkFieldSx}>
                  <InputLabel sx={{ fontSize: { xs: "0.95rem", sm: "0.82rem" } }}>
                    Status
                  </InputLabel>
                  <Select
                    value={filters.status || ""}
                    onChange={(e) =>
                      setFilters((p) => ({ ...p, status: e.target.value }))
                    }
                    label="Status"
                    MenuProps={darkMenuProps()}
                  >
                    <MenuItem value="">All</MenuItem>
                    {[
                      "pending",
                      "in_progress",
                      "submitted",
                      "completed",
                      "approved",
                      "rejected",
                    ].map((s) => (
                      <MenuItem key={s} value={s}>
                        {s.replace(/_/g, " ")}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small" fullWidth sx={darkFieldSx}>
                  <InputLabel sx={{ fontSize: { xs: "0.95rem", sm: "0.82rem" } }}>
                    Priority
                  </InputLabel>
                  <Select
                    value={filters.priority || ""}
                    onChange={(e) =>
                      setFilters((p) => ({ ...p, priority: e.target.value }))
                    }
                    label="Priority"
                    MenuProps={darkMenuProps()}
                  >
                    <MenuItem value="">All</MenuItem>
                    {["low", "medium", "high", "critical"].map((p) => (
                      <MenuItem
                        key={p}
                        value={p}
                        sx={{ textTransform: "capitalize" }}
                      >
                        {p}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </>
            )}
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{
            p: {
              xs: "14px 20px calc(14px + env(safe-area-inset-bottom))",
              sm: "16px 24px",
            },
            pt: { xs: 1, sm: 1 },
            gap: 1,
            flexWrap: "wrap",
            borderTop: `1px solid ${T.border}`,
            bgcolor: T.surface,
            justifyContent: "space-between",
          }}
        >
          <Button
            onClick={() => setFilters({})}
            sx={{
              textTransform: "none",
              fontSize: { xs: "0.72rem", sm: "0.76rem" },
              color: T.inkSub,
              fontWeight: 800,
              borderRadius: "10px",
              px: 1.5,
              flex: { xs: "1 1 100%", sm: "0 0 auto" },
            }}
          >
            Clear all
          </Button>
          <Stack direction="row" spacing={1} sx={{ flex: { xs: "1 1 100%", sm: "0 0 auto" } }}>
            <Button
              onClick={() => setFilterOpen(false)}
              sx={{
                textTransform: "none",
                fontSize: { xs: "0.72rem", sm: "0.76rem" },
                color: T.inkSub,
                fontWeight: 800,
                borderRadius: "10px",
                px: { xs: 2, sm: 2.2 },
                flex: { xs: 1, sm: "0 0 auto" },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={generating}
              variant="contained"
              startIcon={
                generating ? (
                  <CircularProgress size={14} sx={{ color: T.brandContrast }} />
                ) : (
                  <RunIcon sx={{ fontSize: 15 }} />
                )
              }
              sx={{
                background: `linear-gradient(135deg, ${T.brand}, ${T.brandDark})`,
                color: T.brandContrast,
                borderRadius: "10px",
                textTransform: "none",
                fontSize: { xs: "0.72rem", sm: "0.78rem" },
                fontWeight: 900,
                px: { xs: 2, sm: 2.6 },
                minWidth: { xs: 0, sm: 122 },
                flex: { xs: 1, sm: "0 0 auto" },
                boxShadow: `0 10px 22px ${alpha(T.brand, 0.26)}`,
                "&:hover": {
                  background: `linear-gradient(135deg, ${T.brandDark}, ${T.brand})`,
                },
              }}
            >
              Generate
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>

      {/* Toast */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast((p) => ({ ...p, open: false }))}
  anchorOrigin={{ vertical: "top", horizontal: "right" }}>
        <Alert
          severity={toast.sev}
          variant="filled"
          onClose={() => setToast((p) => ({ ...p, open: false }))}
          sx={{
            borderRadius: "12px",
            fontSize: { xs: "0.7rem", sm: "0.77rem" },
          }}
        >
          {toast.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ReportsDashboard;

// src/pages/MyTask.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  IconButton,
  TextField,
  Select,
  MenuItem,
  FormControl,
  Chip,
  Stack,
  CircularProgress,
  Alert,
  Snackbar,
  Tooltip,
  Pagination,
  Skeleton,
  Grid,
  LinearProgress,
  Avatar,
} from "@mui/material";
import { createTheme, ThemeProvider, alpha } from "@mui/material/styles";
import {
  Refresh as RefreshIcon,
  Assignment as AssignmentIcon,
  CalendarMonth as CalendarMonthIcon,
  Clear as ClearIcon,
  ViewList as ViewListIcon,
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon,
  LocationOn as LocationIcon,
  Description as DescriptionIcon,
  Flag as FlagIcon,
  Schedule as ScheduleIcon,
  PlayArrow as PlayArrowIcon,
  Refresh as ContinueIcon,
  Close as CloseIcon,
  FilterList as FilterListIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  TrendingUp as TrendingUpIcon,
  Today as TodayIcon,
  CalendarToday as CalendarTodayIcon,
  KeyboardArrowDown as ArrowDownIcon,
  FiberManualRecord as DotIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useTeamAssignment } from "../context/TeamAssignmentcontext";
import { useAuth } from "../context/AuthContexts";

// ─── Theme ────────────────────────────────────────────────────────────────────
const theme = createTheme({
  palette: {
    primary: { main: "#0d3d52", dark: "#072535", light: "#e6f3f8", contrastText: "#fff" },
    success: { main: "#10b981" },
    warning: { main: "#f59e0b" },
    error: { main: "#ef4444" },
    background: { default: "#f8fafc", paper: "#ffffff" },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    h5: { fontWeight: 800, letterSpacing: "-0.025em" },
    h6: { fontWeight: 700, letterSpacing: "-0.015em" },
  },
  components: {
    MuiButton: { styleOverrides: { root: { textTransform: "none", fontWeight: 600 } } },
    MuiChip: { styleOverrides: { root: { fontWeight: 600 } } },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundColor: "#fff",
          "& fieldset": { borderColor: "#e2e8f0" },
          "&:hover fieldset": { borderColor: "#cbd5e1" },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        select: { paddingTop: 8, paddingBottom: 8, fontSize: "0.85rem" },
      },
    },
  },
});

// ─── Config ──────────────────────────────────────────────────────────────────
const PRIORITY_CFG = {
  critical: { label: "Extremely Critical", color: "#b91c1c", bg: "#fef2f2", border: "#fecaca", accent: "#ef4444", chipBg: "#fef2f2", chipColor: "#b91c1c" },
  high:     { label: "High Priority",      color: "#c2410c", bg: "#fff7ed", border: "#fed7aa", accent: "#f97316", chipBg: "#fff3e0", chipColor: "#c2410c" },
  medium:   { label: "Medium Priority",    color: "#1565c0", bg: "#e3f2fd", border: "#90caf9", accent: "#2196f3", chipBg: "#e3f2fd", chipColor: "#1565c0" },
  low:      { label: "Low Priority",       color: "#0288d1", bg: "#e1f5fe", border: "#81d4fa", accent: "#03a9f4", chipBg: "#e1f5fe", chipColor: "#0288d1" },
};

const STATUS_CFG = {
  pending:     { label: "Pending",      color: "#64748b", bg: "#f1f5f9", border: "#e2e8f0" },
  in_progress: { label: "In Progress",  color: "#0d3d52", bg: "#e6f3f8", border: "#bfe0ec" },
  submitted:   { label: "Submitted",    color: "#6b7280", bg: "#f3f4f6", border: "#e5e7eb" },
  completed:   { label: "Submitted",    color: "#059669", bg: "#ecfdf5", border: "#a7f3d0" },
  approved:    { label: "Approved",     color: "#059669", bg: "#ecfdf5", border: "#a7f3d0" },
  rejected:    { label: "Rejected",     color: "#dc2626", bg: "#fef2f2", border: "#fecaca" },
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ title, value }) => (
  <Paper
    elevation={0}
    sx={{
      p: { xs: 2, sm: 2.5 },
      border: "1px solid #e2e8f0",
      bgcolor: "#fff",
      borderRadius: 1,
      flex: 1,
      minWidth: 0,
    }}
  >
    <Typography
      sx={{
        color: "#94a3b8",
        fontWeight: 500,
        fontSize: "0.8rem",
        mb: 1,
      }}
    >
      {title}
    </Typography>
    <Typography
      sx={{ color: "#0f172a", fontWeight: 700, fontSize: { xs: "1.6rem", sm: "2rem" }, lineHeight: 1 }}
    >
      {value ?? 0}
    </Typography>
  </Paper>
);

// ─── Task Card ────────────────────────────────────────────────────────────────
const PRIORITY_PILL = {
  critical: { label: "Extremely Critical", bg: "#ef4444", color: "#fff" },
  high:     { label: "High Priority",      bg: "#f97316", color: "#fff" },
  medium:   { label: "Medium Priority",    bg: "#3b82f6", color: "#fff" },
  low:      { label: "Low Priority",       bg: "#06b6d4", color: "#fff" },
};

const STATUS_PILL = {
  pending:     { label: "Pending",      bg: "#f1f5f9", color: "#64748b", border: "#e2e8f0" },
  in_progress: { label: "In Progress",  bg: "#dbeafe", color: "#1d4ed8", border: "#bfdbfe" },
  submitted:   { label: "Submitted",    bg: "#f3f4f6", color: "#6b7280", border: "#e5e7eb" },
  completed:   { label: "Submitted",    bg: "#dcfce7", color: "#15803d", border: "#bbf7d0" },
  approved:    { label: "Approved",     bg: "#dcfce7", color: "#15803d", border: "#bbf7d0" },
  rejected:    { label: "Rejected",     bg: "#fee2e2", color: "#dc2626", border: "#fecaca" },
};

const getTaskStatus = (task) =>
  (task?.myStatus || task?.status || "pending").toLowerCase();

const   TaskCard = ({ task, onView }) => {
  const prKey = task.priority?.toLowerCase() || "medium";
  const stKey = getTaskStatus(task);
  const pPill = PRIORITY_PILL[prKey] || PRIORITY_PILL.medium;
  const sPill = STATUS_PILL[stKey]   || STATUS_PILL.pending;

  const assetName     = task.assets?.[0]?.assetName         || task.assetIds?.[0]?.assetName         || "Unnamed Asset";
  const checklistName = task.checklists?.[0]?.name          || task.checklistData?.[0]?.name          || "Inspection Checklist";
  const assetLocation = task.assetIds?.[0]?.currentLocation || task.assets?.[0]?.currentLocation      || "Location not set";
  const isCritical    = task.criticalAsset === true;
  const dueDate       = task.dueDate ? new Date(task.dueDate) : null;
  const isOverdue     = dueDate && dueDate < new Date() && !["completed", "approved"].includes(stKey);
  const completionRate= task.checklistData?.[0]?.completionRate ?? task.completionRate ?? 0;
  const isInProgress  = stKey === "in_progress";
  const isSubmitted   = ["submitted", "completed", "approved"].includes(stKey);

  const formattedDue = dueDate
    ? `Due: ${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, "0")}-${String(dueDate.getDate()).padStart(2, "0")}`
    : "No due date";

  return (
    <Box
      sx={{
        bgcolor: "#ffffff",
        borderRadius: "16px",
        border: "1px solid #e8edf2",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        // fluid on mobile/tablet, fixed 380px on desktop
        width: { xs:"354px", md: "380px" },
        minWidth: 0,
        overflow: "hidden",
        transition: "box-shadow 0.2s ease",
        "&:hover": { boxShadow: "0 6px 24px rgba(0,0,0,0.08)" },
      }}
    >
      {/* Card Body */}
      <Box sx={{ p: 3, flex: 1, display: "flex", flexDirection: "column", gap: 0, minWidth: 0 }}>

        {/* Row 1: Priority pill + Status pill */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 2.5,
            gap: 1,
            // Allow wrapping so pills never clip outside the card
            flexWrap: "wrap",
          }}
        >
          {/* Priority — solid filled pill */}
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              px: 1.5,
              py: 0.45,
              borderRadius: "20px",
              bgcolor: pPill.bg,
              // Prevent pill from shrinking and clipping its text
              flexShrink: 0,
              maxWidth: "100%",
            }}
          >
            <Typography
              sx={{
                fontSize: "0.72rem",
                fontWeight: 600,
                color: pPill.color,
                lineHeight: 1,
                whiteSpace: "nowrap",
              }}
            >
              {pPill.label}
            </Typography>
          </Box>

          {/* Status — outlined soft pill */}
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              px: 1.5,
              py: 0.45,
              borderRadius: "20px",
              bgcolor: sPill.bg,
              border: `1px solid ${sPill.border}`,
              flexShrink: 0,
              maxWidth: "100%",
            }}
          >
            <Typography
              sx={{
                fontSize: "0.72rem",
                fontWeight: 500,
                color: sPill.color,
                lineHeight: 1,
                whiteSpace: "nowrap",
              }}
            >
              {sPill.label}
            </Typography>
          </Box>
        </Box>

        {/* Row 2: Asset Name */}
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1, mb: 2 }}>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: "1.05rem",
              lineHeight: 1.3,
              color: "#0f172a",
              flex: 1,
              minWidth: 0,
              wordBreak: "break-word",
            }}
          >
            {assetName}
          </Typography>
          {isCritical && (
            <Box
              sx={{
                px: 1.25,
                py: 0.35,
                borderRadius: "20px",
                bgcolor: "#fef2f2",
                border: "1px solid #fecaca",
                flexShrink: 0,
              }}
            >
              <Typography sx={{ fontSize: "0.65rem", fontWeight: 600, color: "#dc2626", whiteSpace: "nowrap" }}>
                Critical Asset
              </Typography>
            </Box>
          )}
        </Box>

        {/* Row 3: Meta info */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.85 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
            <DescriptionIcon sx={{ fontSize: 15, color: "#94a3b8", flexShrink: 0 }} />
            <Typography sx={{ fontSize: "0.82rem", color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {checklistName}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
            <LocationIcon sx={{ fontSize: 15, color: "#94a3b8", flexShrink: 0 }} />
            <Typography sx={{ fontSize: "0.82rem", color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {assetLocation}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
            <CalendarTodayIcon sx={{ fontSize: 14, color: isOverdue ? "#ef4444" : "#94a3b8", flexShrink: 0 }} />
            <Typography sx={{ fontSize: "0.82rem", color: isOverdue ? "#ef4444" : "#64748b", fontWeight: isOverdue ? 600 : 400 }}>
              {formattedDue}
            </Typography>
          </Box>
        </Box>

        {/* Progress Bar (only if in-progress) */}
        {completionRate > 0 && (
          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
              <Typography sx={{ fontSize: "0.7rem", color: "#94a3b8", fontWeight: 600 }}>Progress</Typography>
              <Typography sx={{ fontSize: "0.7rem", color: "#0d3d52", fontWeight: 700 }}>{completionRate}%</Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={completionRate}
              sx={{
                height: 5,
                borderRadius: 4,
                bgcolor: "#f1f5f9",
                "& .MuiLinearProgress-bar": { borderRadius: 4, bgcolor: "#0d3d52" },
              }}
            />
          </Box>
        )}
      </Box>

      {/* CTA Button */}
      <Box sx={{ px: 3, pb: 3 }}>
        <Button
          fullWidth
          variant="contained"
          onClick={() => onView(task._id)}
          sx={{
            borderRadius: "10px",
            py: 1.15,
            fontWeight: 600,
            fontSize: "0.85rem",
            bgcolor: isSubmitted ? "#10b981" : "#0d3d52",
            boxShadow: "none",
            letterSpacing: "0.01em",
            "&:hover": { bgcolor: isSubmitted ? "#059669" : "#0a2f40", boxShadow: "none" },
          }}
        >
          <PlayArrowIcon sx={{ fontSize: 15, mr: 0.75 }} />
          {isSubmitted ? "Submitted" : isInProgress ? "Continue Inspection" : "Start Inspection"}
        </Button>
      </Box>
    </Box>
  );
};

// ─── Calendar View ────────────────────────────────────────────────────────────
const DAYS   = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const CalendarView = ({ tasks, onView }) => {
  const today = new Date();
  const [current, setCurrent] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [selectedDay, setSelectedDay] = useState(null);

  const getDotColor = (t) => {
    const st = t.status?.toLowerCase();
    if (["completed", "approved"].includes(st)) return "#10b981";
    if (st === "in_progress") return "#3b82f6";
    const pr = t.priority?.toLowerCase();
    if (pr === "critical") return "#ef4444";
    if (pr === "high")     return "#f97316";
    if (pr === "medium")   return "#f59e0b";
    return "#60a5fa";
  };

  const buildGrid = () => {
    const { year, month } = current;
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevDays = new Date(year, month, 0).getDate();
    const cells = [];
    for (let i = firstDay - 1; i >= 0; i--) cells.push({ day: prevDays - i, current: false, date: null });
    for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, current: true, date: new Date(year, month, d) });
    while (cells.length % 7 !== 0) cells.push({ day: "", current: false, date: null });
    return cells;
  };

  const getTasksForDate = (date) => {
    if (!date) return [];
    return tasks.filter((t) => {
      if (!t.dueDate) return false;
      const d = new Date(t.dueDate);
      return d.getFullYear() === date.getFullYear() && d.getMonth() === date.getMonth() && d.getDate() === date.getDate();
    });
  };

  const isToday = (date) => date && date.toDateString() === today.toDateString();
  const prev = () => setCurrent((c) => c.month === 0 ? { year: c.year - 1, month: 11 } : { ...c, month: c.month - 1 });
  const next = () => setCurrent((c) => c.month === 11 ? { year: c.year + 1, month: 0 } : { ...c, month: c.month + 1 });

  const cells = buildGrid();
  const selectedTasks = selectedDay ? getTasksForDate(selectedDay) : [];

  return (
    <Box sx={{ display: "flex", flexDirection: { xs: "column", lg: "row" }, gap: 2.5 }}>
      <Paper elevation={0} sx={{ flex: 1, minWidth: 0, borderRadius: 2, border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 2.5, py: 2, borderBottom: "1px solid #f1f5f9" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <IconButton size="small" onClick={prev} sx={{ border: "1px solid #e2e8f0", borderRadius: 1.5, p: 0.5 }}>
              <NavigateBeforeIcon sx={{ fontSize: 16 }} />
            </IconButton>
            <Typography fontWeight={700} sx={{ fontSize: "0.95rem", color: "#0f172a", minWidth: 140, textAlign: "center" }}>
              {MONTHS[current.month]} {current.year}
            </Typography>
            <IconButton size="small" onClick={next} sx={{ border: "1px solid #e2e8f0", borderRadius: 1.5, p: 0.5 }}>
              <NavigateNextIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>
          <Button size="small" onClick={() => setCurrent({ year: today.getFullYear(), month: today.getMonth() })}
            sx={{ fontSize: "0.75rem", color: "#64748b", border: "1px solid #e2e8f0", borderRadius: 1.5, px: 1.5, py: 0.5 }}>
            Today
          </Button>
        </Box>
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", bgcolor: "#f8fafc", borderBottom: "1px solid #f1f5f9" }}>
          {DAYS.map((d) => (
            <Box key={d} sx={{ py: 1.25, textAlign: "center" }}>
              <Typography sx={{ fontWeight: 700, color: "#94a3b8", fontSize: "0.65rem", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                {d}
              </Typography>
            </Box>
          ))}
        </Box>
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
          {cells.map((cell, idx) => {
            const cellTasks = getTasksForDate(cell.date);
            const selected = selectedDay && cell.date?.toDateString() === selectedDay.toDateString();
            return (
              <Box key={idx} onClick={() => cell.current && cell.date && setSelectedDay(selected ? null : cell.date)}
                sx={{
                  minHeight: { xs: 48, sm: 60, md: 80 }, border: "0.5px solid #f1f5f9", p: { xs: 0.4, sm: 0.75 },
                  cursor: cell.current ? "pointer" : "default",
                  bgcolor: selected ? alpha("#0d3d52", 0.05) : "transparent",
                  "&:hover": cell.current ? { bgcolor: "#f8fafc" } : {},
                  transition: "background 0.12s",
                }}
              >
                <Box sx={{ width: { xs: 19, sm: 24 }, height: { xs: 19, sm: 24 }, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: isToday(cell.date) ? "#0d3d52" : "transparent", mb: 0.5 }}>
                  <Typography sx={{ fontSize: { xs: "0.62rem", sm: "0.72rem" }, fontWeight: isToday(cell.date) ? 800 : 400, color: isToday(cell.date) ? "#fff" : cell.current ? "#334155" : "#cbd5e1" }}>
                    {cell.day}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.4 }}>
                  {cellTasks.slice(0, 5).map((t, i) => (
                    <Box key={i} sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: getDotColor(t) }} />
                  ))}
                  {cellTasks.length > 5 && (
                    <Typography sx={{ fontSize: "0.55rem", color: "#94a3b8", lineHeight: "6px" }}>+{cellTasks.length - 5}</Typography>
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>
      </Paper>

      <Box sx={{ width: { xs: "100%", lg: 240 }, flexShrink: 0, display: "flex", flexDirection: "column", gap: 2 }}>
        <Paper elevation={0} sx={{ borderRadius: 2, border: "1px solid #e2e8f0", p: 2.5 }}>
          <Typography fontWeight={700} sx={{ mb: 1.5, color: "#0f172a", fontSize: "0.8rem" }}>Legend</Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, 1fr)", lg: "1fr" }, gap: { xs: 0.75, lg: 0 } }}>
            {[
              { label: "Extremely Critical", color: "#ef4444" },
              { label: "High Priority",      color: "#f97316" },
              { label: "Medium Priority",    color: "#f59e0b" },
              { label: "Low Priority",       color: "#60a5fa" },
              { label: "In Progress",        color: "#3b82f6" },
              { label: "Completed",          color: "#10b981" },
            ].map((item) => (
              <Box key={item.label} sx={{ display: "flex", alignItems: "center", gap: 1.25, mb: { xs: 0, lg: 0.9 } }}>
                <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: item.color, flexShrink: 0 }} />
                <Typography sx={{ color: "#64748b", fontSize: "0.72rem" }}>{item.label}</Typography>
              </Box>
            ))}
          </Box>
        </Paper>

        {selectedDay && (
          <Paper elevation={0} sx={{ borderRadius: 2, border: "1px solid #e2e8f0", overflow: "hidden" }}>
            <Box sx={{ px: 2, py: 1.5, borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Box>
                <Typography fontWeight={800} sx={{ fontSize: "0.85rem", color: "#0f172a" }}>
                  {selectedDay.toLocaleDateString("en-US", { day: "2-digit", month: "short" })}
                </Typography>
                <Typography sx={{ fontSize: "0.68rem", color: "#94a3b8" }}>
                  {selectedTasks.length} task{selectedTasks.length !== 1 ? "s" : ""}
                </Typography>
              </Box>
              <IconButton size="small" onClick={() => setSelectedDay(null)}>
                <CloseIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Box>
            <Box sx={{ p: 1.5, display: "flex", flexDirection: "column", gap: 1, maxHeight: 360, overflowY: "auto" }}>
              {selectedTasks.length === 0 ? (
                <Typography sx={{ fontSize: "0.75rem", color: "#94a3b8", textAlign: "center", py: 2 }}>No tasks</Typography>
              ) : selectedTasks.map((t) => {
                const prKey = t.priority?.toLowerCase() || "medium";
                const pCfg = PRIORITY_CFG[prKey] || PRIORITY_CFG.medium;
                const aName = t.assets?.[0]?.assetName || t.assetIds?.[0]?.assetName || "Asset";
                return (
                  <Box key={t._id} sx={{ borderRadius: 2, border: `1px solid ${pCfg.border}`, p: 1.5 }}>
                    <Typography fontWeight={700} sx={{ fontSize: "0.8rem", color: "#0f172a", mb: 0.75 }}>{aName}</Typography>
                    <Button fullWidth variant="contained" size="small" onClick={() => onView(t._id)}
                      sx={{ borderRadius: 1.5, bgcolor: "#0d3d52", "&:hover": { bgcolor: "#0a2f40" }, fontWeight: 600, fontSize: "0.72rem", boxShadow: "none", py: 0.6 }}>
                      Start Inspection
                    </Button>
                  </Box>
                );
              })}
            </Box>
          </Paper>
        )}
      </Box>
    </Box>
  );
};

// ─── MyTask ───────────────────────────────────────────────────────────────────
export default function MyTask() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { fetchMyTasks, loading } = useTeamAssignment();
  const mountedRef = useRef(true);

  const [viewMode, setViewMode] = useState("list");
  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({ status: "", priority: "", search: "", page: 1, limit: 20 });
  const [snack, setSnack] = useState({ open: false, msg: "", severity: "success" });

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const toast = useCallback((msg, severity = "success") => setSnack({ open: true, msg, severity }), []);

  const loadTasks = useCallback(async () => {
    const result = await fetchMyTasks(filters);
    if (!mountedRef.current) return;
    if (result.success) {
      setTasks(result.tasks);
      setPagination(result.pagination);
      setStats(result.stats);
    } else {
      toast(result.error || "Failed to load tasks", "error");
    }
  }, [fetchMyTasks, filters, toast]);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  const handleFilterChange = (key, value) => setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  const clearFilters = () => setFilters({ status: "", priority: "", search: "", page: 1, limit: 20 });
  const hasFilters = !!(filters.status || filters.priority || filters.date);
  const handleViewTask = (id) => navigate(`/team/task/${id}`);

  const derivedStats = tasks.reduce(
    (acc, task) => {
      const status = getTaskStatus(task);
      if (status === "pending") acc.pending += 1;
      if (status === "in_progress") acc.in_progress += 1;

      if (task.dueDate) {
        const due = new Date(task.dueDate);
        const today = new Date();
        const sameDay =
          due.getFullYear() === today.getFullYear() &&
          due.getMonth() === today.getMonth() &&
          due.getDate() === today.getDate();
        if (sameDay) acc.due_today += 1;
      }

      return acc;
    },
    { pending: 0, in_progress: 0, due_today: 0 },
  );

  const statValues = {
    total:       stats?.total       ?? pagination.total ?? tasks.length,
    pending:     stats?.pending     ?? derivedStats.pending,
    in_progress: stats?.in_progress ?? derivedStats.in_progress,
    due_today:   stats?.due_today   ?? derivedStats.due_today,
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc", overflowX: "hidden" }}>
        <Container maxWidth="xl" sx={{ py: { xs: 2.5, sm: 3, md: 4 }, px: { xs: 2, sm: 3 } }}>

          {/* ── Header ── */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Box>
              <Typography
                sx={{ color: "#0f172a", fontSize: { xs: "1.3rem", sm: "1.5rem" }, fontWeight: 800, mb: 0.25 }}
              >
                My Tasks
              </Typography>
              <Typography sx={{ color: "#94a3b8", fontSize: "0.8rem", fontWeight: 400 }}>
                Your assigned inspection tasks
              </Typography>
            </Box>

            {/* View Toggle — pill style matching Figma */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", justifyContent: "flex-end" }}>
              <Button
                size="small"
                variant="contained"
                startIcon={<CalendarTodayIcon sx={{ fontSize: 15 }} />}
                onClick={() => setViewMode("calendar")}
                title="My Plan of access"
                sx={{
                  px: 2,
                  py: 0.85,
                  borderRadius: 2,
                  bgcolor: "#0f4c5c",
                  color: "#fff",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  boxShadow: "none",
                  "&:hover": {
                    bgcolor: "#0b3b48",
                    boxShadow: "0 6px 16px rgba(15, 76, 92, 0.18)",
                  },
                }}
              >
                My POA
              </Button>
              <Paper
                elevation={0}
                sx={{
                  display: "flex",
                  border: "1px solid #e2e8f0",
                  borderRadius: 2,
                  overflow: "hidden",
                  bgcolor: "#fff",
                }}
              >
                {[
                  { mode: "list",     label: "List View",     Icon: ViewListIcon },
                  { mode: "calendar", label: "Calendar View", Icon: CalendarMonthIcon },
                ].map(({ mode, label, Icon }) => (
                  <Button
                    key={mode}
                    size="small"
                    startIcon={<Icon sx={{ fontSize: 15 }} />}
                    onClick={() => setViewMode(mode)}
                    sx={{
                      px: 2,
                      py: 0.85,
                      borderRadius: 0,
                      fontWeight: 500,
                      fontSize: "0.8rem",
                      bgcolor: "transparent",
                      color: viewMode === mode ? "#0f172a" : "#94a3b8",
                      borderRight: mode === "list" ? "1px solid #e2e8f0" : "none",
                      "&:hover": { bgcolor: "#f8fafc" },
                      transition: "all 0.15s",
                      position: "relative",
                    }}
                  >
                    {label}
                  </Button>
                ))}
              </Paper>
            </Box>
          </Box>

          {/* ── Filters ── */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 1.5, sm: 1.75 },
              borderRadius: 1,
              border: "1px solid #e2e8f0",
              mb: 2.5,
              bgcolor: "#fff",
            }}
          >
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25} alignItems="center" flexWrap="wrap" useFlexGap>
              {/* Status */}
              <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 140 } }}>
                <Select
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  displayEmpty
                  IconComponent={ArrowDownIcon}
                  sx={{ fontSize: "0.82rem", bgcolor: "#fff" }}
                >
                  <MenuItem value="" sx={{ fontSize: "0.82rem" }}>All Tasks</MenuItem>
                  <MenuItem value="pending" sx={{ fontSize: "0.82rem" }}>Pending</MenuItem>
                  <MenuItem value="in_progress" sx={{ fontSize: "0.82rem" }}>In Progress</MenuItem>
                  <MenuItem value="submitted" sx={{ fontSize: "0.82rem" }}>Submitted</MenuItem>
                  <MenuItem value="completed" sx={{ fontSize: "0.82rem" }}>Completed</MenuItem>
                </Select>
              </FormControl>

              {/* Priority */}
              <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 130 } }}>
                <Select
                  value={filters.priority}
                  onChange={(e) => handleFilterChange("priority", e.target.value)}
                  displayEmpty
                  IconComponent={ArrowDownIcon}
                  sx={{ fontSize: "0.82rem", bgcolor: "#fff" }}
                >
                  <MenuItem value="" sx={{ fontSize: "0.82rem" }}>Priority</MenuItem>
                  <MenuItem value="critical" sx={{ fontSize: "0.82rem" }}>Extremely Critical</MenuItem>
                  <MenuItem value="high" sx={{ fontSize: "0.82rem" }}>High</MenuItem>
                  <MenuItem value="medium" sx={{ fontSize: "0.82rem" }}>Medium</MenuItem>
                  <MenuItem value="low" sx={{ fontSize: "0.82rem" }}>Low</MenuItem>
                </Select>
              </FormControl>

              {/* Date */}
              <TextField
                size="small"
                type="date"
                placeholder="mm/dd/yyyy"
                value={filters.date || ""}
                onChange={(e) => handleFilterChange("date", e.target.value)}
                sx={{
                  minWidth: { xs: "100%", sm: 160 },
                  "& .MuiOutlinedInput-root": { fontSize: "0.82rem", bgcolor: "#fff" },
                }}
              />

              {/* More Filters */}
              {/* <Button
                size="small"
                startIcon={<FilterListIcon sx={{ fontSize: 15 }} />}
                sx={{
                  color: "#334155",
                  fontSize: "0.82rem",
                  fontWeight: 500,
                  border: "1px solid #e2e8f0",
                  borderRadius: 1.5,
                  px: 1.75,
                  py: 0.85,
                  bgcolor: "#fff",
                  "&:hover": { bgcolor: "#f8fafc" },
                  whiteSpace: "nowrap",
                }}
              >
                More Filters
              </Button> */}

              {hasFilters && (
                <Button
                  size="small"
                  onClick={clearFilters}
                  startIcon={<ClearIcon sx={{ fontSize: 13 }} />}
                  sx={{
                    color: "#ef4444",
                    fontSize: "0.78rem",
                    borderRadius: 1.5,
                    border: "1px solid #fecaca",
                    bgcolor: "#fef2f2",
                    "&:hover": { bgcolor: "#fee2e2" },
                    px: 1.5,
                  }}
                >
                  Clear
                </Button>
              )}
            </Stack>
          </Paper>

          {/* ── Stat Cards ── */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(4, 1fr)" },
              gap: { xs: 1.5, sm: 2 },
              mb: 3,
            }}
          >
            <StatCard title="Total Tasks"  value={statValues.total} />
            <StatCard title="Pending"      value={statValues.pending} />
            <StatCard title="In Progress"  value={statValues.in_progress} />
            <StatCard title="Due Today"    value={statValues.due_today} />
          </Box>

          {/* ── Content ── */}
          {loading ? (
            <Grid container spacing={2}>
              {[...Array(6)].map((_, i) => (
                <Grid item xs={12} sm={6} md={4} key={i}>
                  <Skeleton variant="rectangular" height={260} sx={{ borderRadius: 2 }} />
                </Grid>
              ))}
            </Grid>
          ) : viewMode === "calendar" ? (
            <CalendarView tasks={tasks} onView={handleViewTask} />
          ) : tasks.length === 0 ? (
            <Paper
              elevation={0}
              sx={{
                p: { xs: 4, sm: 8 },
                textAlign: "center",
                borderRadius: 2,
                border: "1px dashed #cbd5e1",
                bgcolor: "#fff",
              }}
            >
              <Avatar sx={{ width: 64, height: 64, mx: "auto", mb: 2.5, bgcolor: "#f1f5f9" }}>
                <AssignmentIcon sx={{ fontSize: 32, color: "#94a3b8" }} />
              </Avatar>
              <Typography fontWeight={700} sx={{ color: "#475569", fontSize: "1rem", mb: 0.75 }}>
                {hasFilters ? "No matching tasks" : "No tasks assigned"}
              </Typography>
              <Typography sx={{ color: "#94a3b8", fontSize: "0.82rem" }}>
                {hasFilters ? "Try adjusting your filters to see more results." : "You're all caught up! Check back later."}
              </Typography>
              {hasFilters && (
                <Button
                  variant="outlined"
                  onClick={clearFilters}
                  sx={{ mt: 3, borderRadius: 2, fontSize: "0.82rem", borderColor: "#e2e8f0", color: "#64748b" }}
                >
                  Clear all filters
                </Button>
              )}
            </Paper>
          ) : (
            <>
              {/* 3-column grid on desktop, 2 on tablet, 1 on mobile */}
              <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                {tasks.map((task) => (
                  <Grid item xs={12} sm={6} md={4} key={task._id}>
                    <TaskCard task={task} onView={handleViewTask} />
                  </Grid>
                ))}
              </Grid>

              {pagination.totalPages > 1 && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                  <Pagination
                    count={pagination.totalPages}
                    page={filters.page}
                    onChange={(_, p) => handleFilterChange("page", p)}
                    color="primary"
                    size="medium"
                    siblingCount={0}
                    sx={{ "& .MuiPaginationItem-root": { borderRadius: 2, fontWeight: 600 } }}
                  />
                </Box>
              )}
            </>
          )}
        </Container>

        <Snackbar
          open={snack.open}
          autoHideDuration={4000}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert
            severity={snack.severity}
            onClose={() => setSnack((s) => ({ ...s, open: false }))}
            sx={{ borderRadius: 2, fontSize: "0.8rem" }}
          >
            {snack.msg}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}

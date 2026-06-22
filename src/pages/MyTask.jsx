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
    background: { default: "#f1f5f9", paper: "#ffffff" },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    h5: { fontWeight: 800, letterSpacing: "-0.025em" },
    h6: { fontWeight: 700, letterSpacing: "-0.015em" },
  },
  components: {
    MuiButton: { styleOverrides: { root: { textTransform: "none", fontWeight: 600 } } },
    MuiChip: { styleOverrides: { root: { fontWeight: 700 } } },
  },
});

// ─── Config ──────────────────────────────────────────────────────────────────
const PRIORITY_CFG = {
  critical: { label: "Extremely Critical", color: "#b91c1c", bg: "#fef2f2", border: "#fecaca", accent: "#ef4444" },
  high:     { label: "High Priority",      color: "#c2410c", bg: "#fff7ed", border: "#fed7aa", accent: "#f97316" },
  medium:   { label: "Medium Priority",    color: "#92400e", bg: "#fffbeb", border: "#fde68a", accent: "#f59e0b" },
  low:      { label: "Low Priority",       color: "#1d4ed8", bg: "#eff6ff", border: "#bfdbfe", accent: "#3b82f6" },
};

const STATUS_CFG = {
  pending:     { label: "Pending",      color: "#64748b", bg: "#f8fafc", border: "#e2e8f0" },
  in_progress: { label: "In Progress",  color: "#0d3d52", bg: "#e6f3f8", border: "#bfe0ec" },
  submitted:   { label: "Under Review", color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe" },
  completed:   { label: "Completed",    color: "#059669", bg: "#ecfdf5", border: "#a7f3d0" },
  approved:    { label: "Approved",     color: "#059669", bg: "#ecfdf5", border: "#a7f3d0" },
  rejected:    { label: "Rejected",     color: "#dc2626", bg: "#fef2f2", border: "#fecaca" },
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
const STAT_META = [
  { key: "total",       title: "Total Tasks",  icon: AssignmentIcon,  iconColor: "#0d3d52", iconBg: "#e6f3f8" },
  { key: "pending",     title: "Pending",      icon: PendingIcon,     iconColor: "#f59e0b", iconBg: "#fffbeb" },
  { key: "in_progress", title: "In Progress",  icon: TrendingUpIcon,  iconColor: "#3b82f6", iconBg: "#eff6ff" },
  { key: "due_today",   title: "Due Today",    icon: TodayIcon,       iconColor: "#ef4444", iconBg: "#fef2f2" },
];

const StatCard = ({ title, value, icon: Icon, iconColor, iconBg }) => (
  <Paper
    elevation={0}
    sx={{
      p: { xs: 1.5, sm: 2.5 },
      border: "1px solid #e2e8f0",
      bgcolor: "#fff",
      height: "100%",
      width: "282px",
      minWidth: 0,
      boxSizing: "border-box",
      display: "flex",
      alignItems: "center",
      gap: { xs: 1.25, sm: 2 },
      transition: "box-shadow 0.2s",
      "&:hover": { boxShadow: "0 4px 20px rgba(0,0,0,0.07)" },
    }}
  >
    <Box
      sx={{
        width: { xs: 36, sm: 44 },
        height: { xs: 36, sm: 44 },
        borderRadius: 2.5,
        bgcolor: iconBg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <Icon sx={{ fontSize: { xs: 18, sm: 22 }, color: iconColor }} />
    </Box>
    <Box sx={{ minWidth: 0 }}>
      <Typography
        variant="caption"
        sx={{
          color: "#94a3b8",
          fontWeight: 600,
          fontSize: { xs: "0.62rem", sm: "0.7rem" },
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          whiteSpace: "nowrap",
        }}
      >
        {title}
      </Typography>
      <Typography
        variant="h5"
        fontWeight={800}
        sx={{ color: "#0f172a", lineHeight: 1.1, mt: 0.25, fontSize: { xs: "1.15rem", sm: "1.5rem" } }}
      >
        {value ?? 0}
      </Typography>
    </Box>
  </Paper>
);

// ─── Task Card ────────────────────────────────────────────────────────────────
const TaskCard = ({ task, onView }) => {
  const prKey = task.priority?.toLowerCase() || "medium";
  const stKey = task.status?.toLowerCase() || "pending";
  const pCfg = PRIORITY_CFG[prKey] || PRIORITY_CFG.medium;
  const sCfg = STATUS_CFG[stKey] || STATUS_CFG.pending;

  const assetName     = task.assets?.[0]?.assetName    || task.assetIds?.[0]?.assetName    || "Unnamed Asset";
  const checklistName = task.checklists?.[0]?.name     || task.checklistData?.[0]?.name    || "Inspection Checklist";
  const assetLocation = task.assetIds?.[0]?.currentLocation || task.assets?.[0]?.currentLocation || "Location not set";
  const isCritical    = task.criticalAsset === true;
  const dueDate       = task.dueDate ? new Date(task.dueDate) : null;
  const isOverdue     = dueDate && dueDate < new Date() && !["completed", "approved"].includes(stKey);
  const completionRate= task.checklistData?.[0]?.completionRate ?? task.completionRate ?? 0;
  const isInProgress  = stKey === "in_progress";

  return (
    <Box
      sx={{
        bgcolor: "#fff",
        borderRadius: 1,
        border: "1px solid #e2e8f0",
        borderLeft: `4px solid ${pCfg.accent}`,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        minWidth: 0,
        overflow: "hidden",
        transition: "all 0.18s ease",
        "&:hover": {
          borderColor: pCfg.accent,
          boxShadow: `0 8px 24px ${alpha(pCfg.accent, 0.12)}`,
          transform: "translateY(-2px)",
        },
      }}
    >
      {/* Card Body */}
      <Box sx={{ p: { xs: 1.75, sm: 2 }, flex: 1, display: "flex", flexDirection: "column", gap: 1, minWidth: 0 }}>
        {/* Priority + Status Row */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 0.5, flexWrap: "wrap" }}>
          <Chip
            icon={<FlagIcon sx={{ fontSize: "0.65rem !important", color: `${pCfg.color} !important` }} />}
            label={pCfg.label}
            size="small"
            sx={{
              bgcolor: pCfg.bg,
              color: pCfg.color,
              fontSize: "0.62rem",
              height: 22,
              border: `1px solid ${pCfg.border}`,
              borderRadius: "6px",
              "& .MuiChip-icon": { ml: 0.5 },
            }}
          />
          <Chip
            label={sCfg.label}
            size="small"
            sx={{
              bgcolor: sCfg.bg,
              color: sCfg.color,
              fontSize: "0.62rem",
              height: 22,
              border: `1px solid ${sCfg.border}`,
              borderRadius: "6px",
            }}
          />
        </Box>

        {/* Asset Name + Critical badge */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1, minWidth: 0 }}>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: "0.95rem",
              lineHeight: 1.3,
              color: "#0f172a",
              flex: 1,
              minWidth: 0,
              overflowWrap: "break-word",
              wordBreak: "break-word",
            }}
          >
            {assetName}
          </Typography>
          {isCritical && (
            <Chip
              label="Critical"
              size="small"
              sx={{ bgcolor: "#fef2f2", color: "#dc2626", fontSize: "0.58rem", height: 18, borderRadius: "5px", flexShrink: 0 }}
            />
          )}
        </Box>

        {/* Meta Info */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, minWidth: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, minWidth: 0 }}>
            <DescriptionIcon sx={{ fontSize: 12, color: "#94a3b8", flexShrink: 0 }} />
            <Typography
              sx={{
                fontSize: "0.72rem",
                color: "#64748b",
                lineHeight: 1.3,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                minWidth: 0,
              }}
            >
              {checklistName}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, minWidth: 0 }}>
            <LocationIcon sx={{ fontSize: 12, color: "#94a3b8", flexShrink: 0 }} />
            <Typography
              sx={{
                fontSize: "0.72rem",
                color: "#64748b",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                minWidth: 0,
              }}
            >
              {assetLocation}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            <ScheduleIcon sx={{ fontSize: 12, color: isOverdue ? "#ef4444" : "#94a3b8", flexShrink: 0 }} />
            <Typography
              sx={{
                fontSize: "0.72rem",
                color: isOverdue ? "#ef4444" : "#64748b",
                fontWeight: isOverdue ? 700 : 400,
              }}
            >
              {dueDate
                ? `Due: ${dueDate.toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\//g, "-")}`
                : "No due date"}
            </Typography>
          </Box>
        </Box>

        {/* Progress Bar */}
        {completionRate > 0 && (
          <Box sx={{ mt: 0.5 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
              <Typography sx={{ fontSize: "0.65rem", color: "#94a3b8", fontWeight: 600 }}>Progress</Typography>
              <Typography sx={{ fontSize: "0.65rem", color: "#0d3d52", fontWeight: 800 }}>{completionRate}%</Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={completionRate}
              sx={{
                height: 5,
                borderRadius: 4,
                bgcolor: "#f1f5f9",
                "& .MuiLinearProgress-bar": { borderRadius: 4, bgcolor: pCfg.accent },
              }}
            />
          </Box>
        )}
      </Box>

      {/* CTA Button */}
      <Box sx={{ px: { xs: 1.75, sm: 2 }, pb: { xs: 1.75, sm: 2 } }}>
        <Button
          fullWidth
          variant="contained"
          onClick={() => onView(task._id)}
          startIcon={isInProgress ? <ContinueIcon sx={{ fontSize: 15 }} /> : <PlayArrowIcon sx={{ fontSize: 15 }} />}
          sx={{
            borderRadius: 2,
            py: 1,
            fontWeight: 700,
            fontSize: "0.8rem",
            bgcolor: "#0d3d52",
            boxShadow: "none",
            letterSpacing: "0.01em",
            "&:hover": { bgcolor: "#0a2f40", boxShadow: "0 4px 12px rgba(13,61,82,0.25)" },
          }}
        >
          {isInProgress ? "Continue Inspection" : "Start Inspection"}
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
      {/* Calendar */}
      <Paper elevation={0} sx={{ flex: 1, minWidth: 0, borderRadius: 3, border: "1px solid #e2e8f0", overflow: "hidden" }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: { xs: 1.5, sm: 2.5 },
            py: 2,
            borderBottom: "1px solid #f1f5f9",
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.75, sm: 1.5 } }}>
            <IconButton size="small" onClick={prev} sx={{ border: "1px solid #e2e8f0", borderRadius: 1.5, p: 0.5 }}>
              <NavigateBeforeIcon sx={{ fontSize: 16 }} />
            </IconButton>
            <Typography
              fontWeight={800}
              sx={{ fontSize: { xs: "0.85rem", sm: "1rem" }, color: "#0f172a", minWidth: { xs: 110, sm: 140 }, textAlign: "center" }}
            >
              {MONTHS[current.month]} {current.year}
            </Typography>
            <IconButton size="small" onClick={next} sx={{ border: "1px solid #e2e8f0", borderRadius: 1.5, p: 0.5 }}>
              <NavigateNextIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>
          <Button
            size="small"
            onClick={() => setCurrent({ year: today.getFullYear(), month: today.getMonth() })}
            sx={{ fontSize: "0.72rem", color: "#64748b", border: "1px solid #e2e8f0", borderRadius: 1.5, px: 1.5, py: 0.5 }}
          >
            Today
          </Button>
        </Box>

        {/* Day Labels */}
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", bgcolor: "#f8fafc", borderBottom: "1px solid #f1f5f9" }}>
          {DAYS.map((d) => (
            <Box key={d} sx={{ py: 1.25, textAlign: "center" }}>
              <Typography
                sx={{
                  fontWeight: 700,
                  color: "#94a3b8",
                  fontSize: { xs: "0.58rem", sm: "0.65rem" },
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                {d}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Cells */}
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
          {cells.map((cell, idx) => {
            const cellTasks = getTasksForDate(cell.date);
            const selected = selectedDay && cell.date?.toDateString() === selectedDay.toDateString();
            return (
              <Box
                key={idx}
                onClick={() => cell.current && cell.date && setSelectedDay(selected ? null : cell.date)}
                sx={{
                  minHeight: { xs: 48, sm: 60, md: 80 },
                  border: "0.5px solid #f1f5f9",
                  p: { xs: 0.4, sm: 0.75 },
                  cursor: cell.current ? "pointer" : "default",
                  bgcolor: selected ? alpha("#0d3d52", 0.05) : "transparent",
                  "&:hover": cell.current ? { bgcolor: "#f8fafc" } : {},
                  transition: "background 0.12s",
                }}
              >
                <Box
                  sx={{
                    width: { xs: 19, sm: 24 },
                    height: { xs: 19, sm: 24 },
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: isToday(cell.date) ? "#0d3d52" : "transparent",
                    mb: 0.5,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: { xs: "0.62rem", sm: "0.72rem" },
                      fontWeight: isToday(cell.date) ? 800 : 400,
                      color: isToday(cell.date) ? "#fff" : cell.current ? "#334155" : "#cbd5e1",
                    }}
                  >
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

      {/* Sidebar */}
      <Box sx={{ width: { xs: "100%", lg: 240 }, flexShrink: 0, display: "flex", flexDirection: "column", gap: 2 }}>
        {/* Legend */}
        <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0", p: 2.5 }}>
          <Typography fontWeight={700} sx={{ mb: 1.5, color: "#0f172a", fontSize: "0.8rem" }}>Legend</Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "repeat(2, 1fr)", lg: "1fr" },
              gap: { xs: 0.75, lg: 0 },
            }}
          >
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

        {/* Selected day tasks */}
        {selectedDay && (
          <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0", overflow: "hidden" }}>
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
                  <Box
                    key={t._id}
                    sx={{ borderRadius: 2, border: `1px solid ${pCfg.border}`, borderLeft: `3px solid ${pCfg.accent}`, p: 1.5 }}
                  >
                    <Typography fontWeight={700} sx={{ fontSize: "0.8rem", color: "#0f172a", mb: 0.75 }}>{aName}</Typography>
                    <Button
                      fullWidth variant="contained" size="small" onClick={() => onView(t._id)}
                      sx={{ borderRadius: 1.5, bgcolor: "#0d3d52", "&:hover": { bgcolor: "#0a2f40" }, fontWeight: 700, fontSize: "0.72rem", boxShadow: "none", py: 0.6 }}
                    >
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

  const statValues = {
    total:       stats?.total       ?? tasks.length,
    pending:     stats?.pending     ?? 0,
    in_progress: stats?.in_progress ?? 0,
    due_today:   stats?.due_today   ?? 0,
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ minHeight: "100vh", bgcolor: "#ffffff00", overflowX: "hidden" }}>
        <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 2.5, md: 4 }, px: { xs: 1.5, sm: 3 } }}>

          {/* ── Header ── */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: { xs: "flex-start", sm: "center" },
              flexDirection: { xs: "column", sm: "row" },
              gap: 2,
              mb: 3,
            }}
          >
            <Box>
              <Typography
                variant="h5"
                sx={{ color: "#0f172a", fontSize: { xs: "1.25rem", sm: "1.4rem", md: "1.6rem" }, mb: 0.25 }}
              >
                My Tasks
              </Typography>
              <Typography sx={{ color: "#94a3b8", fontSize: { xs: "0.75rem", sm: "0.8rem" }, fontWeight: 500 }}>
                Your assigned inspection tasks
              </Typography>
            </Box>

            <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap", width: { xs: "100%", sm: "auto" } }}>
              {/* View Toggle */}
              <Paper
                elevation={0}
                sx={{
                  display: "flex",
                  border: "1px solid #e2e8f0",
                  borderRadius: 2.5,
                  overflow: "hidden",
                  bgcolor: "#fff",
                  flex: { xs: 1, sm: "initial" },
                }}
              >
                {[
                  { mode: "list",     label: "List",     Icon: ViewListIcon },
                  { mode: "calendar", label: "Calendar", Icon: CalendarMonthIcon },
                ].map(({ mode, label, Icon }) => (
                  <Button
                    key={mode}
                    size="small"
                    startIcon={<Icon sx={{ fontSize: 14 }} />}
                    onClick={() => setViewMode(mode)}
                    sx={{
                      flex: { xs: 1, sm: "initial" },
                      px: { xs: 1.5, sm: 2 },
                      py: 0.75,
                      borderRadius: 0,
                      fontWeight: 600,
                      fontSize: "0.75rem",
                      bgcolor: viewMode === mode ? "#0d3d52" : "transparent",
                      color: viewMode === mode ? "#fff" : "#64748b",
                      "&:hover": { bgcolor: viewMode === mode ? "#0a2f40" : "#f8fafc" },
                      transition: "all 0.15s",
                    }}
                  >
                    {label}
                  </Button>
                ))}
              </Paper>

              <Tooltip title="Refresh tasks">
                <IconButton
                  onClick={loadTasks}
                  disabled={loading}
                  sx={{
                    border: "1px solid #e2e8f0",
                    borderRadius: 2,
                    bgcolor: "#fff",
                    "&:hover": { bgcolor: "#f8fafc" },
                  }}
                >
                  {loading
                    ? <CircularProgress size={16} sx={{ color: "#0d3d52" }} />
                    : <RefreshIcon sx={{ fontSize: 18, color: "#64748b" }} />}
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* ── Stat Cards ── */}
          <Grid container spacing={{ xs: 1.25, sm: 2 }} sx={{ mb: 3 }}>
            {STAT_META.map((meta) => (
              <Grid item xs={6} sm={6} md={3} key={meta.key}>
                <StatCard
                  title={meta.title}
                  value={statValues[meta.key]}
                  icon={meta.icon}
                  iconColor={meta.iconColor}
                  iconBg={meta.iconBg}
                />
              </Grid>
            ))}
          </Grid>

          {/* ── Filters ── */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 1.5, sm: 2 },
              borderRadius: 3,
              border: "1px solid #e2e8f0",
              mb: 3,
              bgcolor: "#fff",
            }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.25}
              alignItems={{ xs: "stretch", sm: "center" }}
              flexWrap="wrap"
              useFlexGap
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "#94a3b8" }}>
                <FilterListIcon sx={{ fontSize: 16 }} />
                <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: "#94a3b8" }}>Filter:</Typography>
              </Box>

              <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 130 }, width: { xs: "100%", sm: "auto" } }}>
                <Select
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  displayEmpty
                  sx={{ borderRadius: 2, fontSize: "0.8rem", bgcolor: "#f8fafc" }}
                >
                  <MenuItem value=""         sx={{ fontSize: "0.8rem" }}>All Status</MenuItem>
                  <MenuItem value="pending"  sx={{ fontSize: "0.8rem" }}>Pending</MenuItem>
                  <MenuItem value="in_progress" sx={{ fontSize: "0.8rem" }}>In Progress</MenuItem>
                  <MenuItem value="submitted"   sx={{ fontSize: "0.8rem" }}>Submitted</MenuItem>
                  <MenuItem value="completed"   sx={{ fontSize: "0.8rem" }}>Completed</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 130 }, width: { xs: "100%", sm: "auto" } }}>
                <Select
                  value={filters.priority}
                  onChange={(e) => handleFilterChange("priority", e.target.value)}
                  displayEmpty
                  sx={{ borderRadius: 2, fontSize: "0.8rem", bgcolor: "#f8fafc" }}
                >
                  <MenuItem value=""         sx={{ fontSize: "0.8rem" }}>All Priority</MenuItem>
                  <MenuItem value="critical" sx={{ fontSize: "0.8rem" }}>Extremely Critical</MenuItem>
                  <MenuItem value="high"     sx={{ fontSize: "0.8rem" }}>High</MenuItem>
                  <MenuItem value="medium"   sx={{ fontSize: "0.8rem" }}>Medium</MenuItem>
                  <MenuItem value="low"      sx={{ fontSize: "0.8rem" }}>Low</MenuItem>
                </Select>
              </FormControl>

              <TextField
                size="small"
                type="date"
                value={filters.date || ""}
                onChange={(e) => handleFilterChange("date", e.target.value)}
                sx={{
                  minWidth: { xs: "100%", sm: 150 },
                  width: { xs: "100%", sm: "auto" },
                  "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: "0.8rem", bgcolor: "#f8fafc" },
                }}
              />

              {hasFilters && (
                <Button
                  size="small"
                  onClick={clearFilters}
                  startIcon={<ClearIcon sx={{ fontSize: 13 }} />}
                  sx={{
                    color: "#ef4444",
                    fontSize: "0.75rem",
                    borderRadius: 2,
                    border: "1px solid #fecaca",
                    bgcolor: "#fef2f2",
                    "&:hover": { bgcolor: "#fee2e2" },
                    px: 1.5,
                    width: { xs: "100%", sm: "auto" },
                  }}
                >
                  Clear Filters
                </Button>
              )}

              <Box sx={{ ml: { sm: "auto" }, display: { xs: "none", sm: "block" } }}>
                <Typography sx={{ fontSize: "0.72rem", color: "#94a3b8", whiteSpace: "nowrap" }}>
                  {tasks.length} task{tasks.length !== 1 ? "s" : ""} shown
                </Typography>
              </Box>
            </Stack>
          </Paper>

          {/* ── Content ── */}
          {loading ? (
            <Grid container spacing={2}>
              {[...Array(8)].map((_, i) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
                  <Skeleton variant="rectangular" height={240} sx={{ borderRadius: 3 }} />
                </Grid>
              ))}
            </Grid>
          ) : viewMode === "calendar" ? (
            <CalendarView tasks={tasks} onView={handleViewTask} />
          ) : tasks.length === 0 ? (
            <Paper
              elevation={0}
              sx={{
                p: { xs: 4, sm: 6, md: 10 },
                textAlign: "center",
                borderRadius: 3,
                border: "1px dashed #cbd5e1",
                bgcolor: "#fff",
              }}
            >
              <Avatar sx={{ width: 64, height: 64, mx: "auto", mb: 2.5, bgcolor: "#f1f5f9" }}>
                <AssignmentIcon sx={{ fontSize: 32, color: "#94a3b8" }} />
              </Avatar>
              <Typography fontWeight={800} sx={{ color: "#475569", fontSize: "1.05rem", mb: 0.75 }}>
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
              <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                {tasks.map((task) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={task._id}>
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
                    sx={{
                      "& .MuiPaginationItem-root": { borderRadius: 2, fontWeight: 600 },
                    }}
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
            sx={{ borderRadius: 2.5, fontSize: "0.8rem" }}
          >
            {snack.msg}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}
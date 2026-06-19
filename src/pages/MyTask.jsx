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
  Card,
  CardContent,
  CardActions,
} from "@mui/material";
import {
  createTheme,
  ThemeProvider,
  alpha,
} from "@mui/material/styles";
import {
  Refresh as RefreshIcon,
  Assignment as AssignmentIcon,
  HourglassTop as HourglassTopIcon,
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
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useTeamAssignment } from "../context/TeamAssignmentcontext";
import { useAuth } from "../context/AuthContexts";

// ─── Theme ────────────────────────────────────────────────────────────────────
const theme = createTheme({
  palette: {
    primary: {
      main: "#0d3d52",
      dark: "#072535",
      light: "#e6f3f8",
      contrastText: "#fff",
    },
    success: { main: "#10b981" },
    warning: { main: "#f59e0b" },
    error: { main: "#ef4444" },
    background: { default: "#f8fafc", paper: "#ffffff" },
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    h5: { fontWeight: 700, letterSpacing: "-0.02em" },
    h6: { fontWeight: 600, letterSpacing: "-0.01em" },
  },
  components: {
    MuiButton: {
      styleOverrides: { root: { textTransform: "none", fontWeight: 600 } },
    },
  },
});

// ─── Config ──────────────────────────────────────────────────────────────────
const PRIORITY_CFG = {
  critical: { label: "Extremely Critical", color: "#dc2626", bg: "#fee2e2", border: "#fecaca", dot: "#f87171" },
  high: { label: "High Priority", color: "#dc2626", bg: "#fee2e2", border: "#fecaca", dot: "#f87171" },
  medium: { label: "Medium Priority", color: "#0d3d52", bg: "#e6f3f8", border: "#bfe0ec", dot: "#fbbf24" },
  low: { label: "Low Priority", color: "#2563eb", bg: "#dbeafe", border: "#bfdbfe", dot: "#60a5fa" },
};

const STATUS_CFG = {
  pending: { label: "Pending", color: "#475569", bg: "#f1f5f9" },
  in_progress: { label: "In Progress", color: "#fff", bg: "#0d3d52" },
  submitted: { label: "Under Review", color: "#fff", bg: "#475569" },
  completed: { label: "Completed", color: "#059669", bg: "#d1fae5" },
  approved: { label: "Approved", color: "#059669", bg: "#d1fae5" },
  rejected: { label: "Rejected", color: "#dc2626", bg: "#fee2e2" },
};

// ─── Task Card ─────────────────────────────────────────────────────────────────
const TaskCard = ({ task, onView }) => {
  const prKey = task.priority?.toLowerCase() || "medium";
  const stKey = task.status?.toLowerCase() || "pending";
  const pCfg = PRIORITY_CFG[prKey] || PRIORITY_CFG.medium;
  const sCfg = STATUS_CFG[stKey] || STATUS_CFG.pending;

  const assetName =
    task.assets?.[0]?.assetName ||
    task.assetIds?.[0]?.assetName ||
    "Unnamed Asset";
  const checklistName =
    task.checklists?.[0]?.name ||
    task.checklistData?.[0]?.name ||
    "Inspection Checklist";
  const assetLocation =
    task.assetIds?.[0]?.currentLocation ||
    task.assets?.[0]?.currentLocation ||
    "Location not set";
  const isCritical = task.criticalAsset === true;
  const dueDate = task.dueDate ? new Date(task.dueDate) : null;
  const isOverdue =
    dueDate &&
    dueDate < new Date() &&
    !["completed", "approved"].includes(stKey);
  const completionRate =
    task.checklistData?.[0]?.completionRate ?? task.completionRate ?? 0;

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 1,
        border: "1px solid #e2e8f0",
        transition: "all 0.18s ease",
        height: "100%",
        display: "flex",
        width:"360px",
        flexDirection: "column",
        "&:hover": {
          borderColor: "#0d3d52",
          boxShadow: "0 4px 16px rgba(13,61,82,0.08)",
        },
      }}
    >
      <CardContent sx={{ p: 2, pb: 1, flex: 1 }}>
        {/* Priority + Status Row */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 1.25,
            gap: 0.75,
            flexWrap: "wrap",
          }}
        >
          <Chip
            icon={<FlagIcon sx={{ fontSize: "0.7rem !important", color: `${pCfg.color} !important` }} />}
            label={pCfg.label}
            size="small"
            sx={{
              bgcolor: pCfg.bg,
              color: pCfg.color,
              fontWeight: 700,
              fontSize: "0.65rem",
              height: 22,
              borderRadius: "12px",
              border: `1px solid ${pCfg.border}`,
              "& .MuiChip-icon": { ml: 0.75 },
            }}
          />
          <Chip
            label={sCfg.label}
            size="small"
            sx={{
              bgcolor: sCfg.bg,
              color: sCfg.color,
              fontWeight: 700,
              fontSize: "0.65rem",
              height: 22,
              borderRadius: "12px",
            }}
          />
        </Box>

        {/* Asset Name + Critical badge */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1, mb: 0.75 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              fontSize: "0.92rem",
              lineHeight: 1.3,
              color: "#0f172a",
            }}
          >
            {assetName}
          </Typography>
          {isCritical && (
            <Chip
              label="Critical Asset"
              size="small"
              sx={{
                bgcolor: "#fee2e2",
                color: "#dc2626",
                fontWeight: 700,
                fontSize: "0.62rem",
                height: 20,
                borderRadius: "10px",
                flexShrink: 0,
              }}
            />
          )}
        </Box>

        {/* Checklist Name */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, mb: 0.4 }}>
          <DescriptionIcon sx={{ fontSize: 13, color: "#94a3b8", flexShrink: 0 }} />
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontSize: "0.72rem", lineHeight: 1.3 }}
          >
            {checklistName}
          </Typography>
        </Box>

        {/* Location */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, mb: 0.4 }}>
          <LocationIcon sx={{ fontSize: 13, color: "#94a3b8", flexShrink: 0 }} />
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontSize: "0.72rem" }}
          >
            {assetLocation}
          </Typography>
        </Box>

        {/* Due Date */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
          <ScheduleIcon
            sx={{
              fontSize: 13,
              color: isOverdue ? "#ef4444" : "#94a3b8",
              flexShrink: 0,
            }}
          />
          <Typography
            variant="caption"
            sx={{
              color: isOverdue ? "#ef4444" : "#64748b",
              fontWeight: isOverdue ? 700 : 400,
              fontSize: "0.72rem",
            }}
          >
            {dueDate
              ? `Due: ${dueDate
                  .toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  })
                  .replace(/\//g, "-")}`
              : "No due date"}
          </Typography>
        </Box>

        {/* Progress Bar */}
        {completionRate > 0 && (
          <Box sx={{ mt: 1.25 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.4 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.65rem" }}>
                Progress
              </Typography>
              <Typography variant="caption" fontWeight={700} sx={{ color: "#0d3d52", fontSize: "0.65rem" }}>
                {completionRate}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={completionRate}
              sx={{
                height: 4,
                borderRadius: 3,
                bgcolor: "#e2e8f0",
                "& .MuiLinearProgress-bar": { borderRadius: 3, bgcolor: "#0d3d52" },
              }}
            />
          </Box>
        )}
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0.75 }}>
        <Button
          fullWidth
          variant="contained"
          onClick={() => onView(task._id)}
          startIcon={
            stKey === "in_progress" ? (
              <ContinueIcon sx={{ fontSize: 14 }} />
            ) : (
              <PlayArrowIcon sx={{ fontSize: 14 }} />
            )
          }
          sx={{
            borderRadius: 1,
            py: 0.85,
            fontWeight: 700,
            fontSize: "0.78rem",
            bgcolor: "#0d3d52",
            boxShadow: "none",
            "&:hover": { bgcolor: "#0a2f40", boxShadow: "none" },
          }}
        >
          {stKey === "in_progress" ? "Continue Inspection" : "Start Inspection"}
        </Button>
      </CardActions>
    </Card>
  );
};

// ─── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ title, value }) => (
  <Paper
    elevation={0}
    sx={{
      p: { xs: 1.5, sm: 2 },
      borderRadius: 2.5,
      border: "1px solid #e2e8f0",
      bgcolor: "#fff",
      width:"287px",
      height: "100%",
    }}
  >
    <Typography
      variant="body2"
      color="text.secondary"
      sx={{ mb: 0.5, fontSize: "0.72rem" }}
    >
      {title}
    </Typography>
    <Typography
      variant="h6"
      fontWeight={700}
      sx={{ color: "#0f172a", fontSize: "1.5rem" }}
    >
      {value ?? 0}
    </Typography>
  </Paper>
);

// ─── Calendar View ─────────────────────────────────────────────────────────────
const DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const CalendarView = ({ tasks, onView }) => {
  const today = new Date();
  const [current, setCurrent] = useState({
    year: today.getFullYear(),
    month: today.getMonth(),
  });
  const [calMode, setCalMode] = useState("month");
  const [selectedDay, setSelectedDay] = useState(null);

  const getDotColor = (t) => {
    const st = t.status?.toLowerCase();
    if (st === "in_progress") return "#10b981";
    if (st === "completed" || st === "approved") return "#10b981";
    const pr = t.priority?.toLowerCase();
    if (pr === "critical" || pr === "high") return "#f87171";
    if (pr === "medium") return "#fbbf24";
    return "#60a5fa";
  };

  const buildMonthGrid = () => {
    const { year, month } = current;
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevDays = new Date(year, month, 0).getDate();
    const cells = [];

    for (let i = firstDay - 1; i >= 0; i--) {
      cells.push({ day: prevDays - i, isCurrentMonth: false, date: null });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ day: d, isCurrentMonth: true, date: new Date(year, month, d) });
    }
    while (cells.length % 7 !== 0) {
      cells.push({ day: "", isCurrentMonth: false, date: null });
    }
    return cells;
  };

  const getTasksForDate = (date) => {
    if (!date) return [];
    return tasks.filter((t) => {
      if (!t.dueDate) return false;
      const d = new Date(t.dueDate);
      return (
        d.getFullYear() === date.getFullYear() &&
        d.getMonth() === date.getMonth() &&
        d.getDate() === date.getDate()
      );
    });
  };

  const isToday = (date) => {
    if (!date) return false;
    return date.toDateString() === today.toDateString();
  };

  const prev = () => {
    setCurrent((c) => (c.month === 0 ? { year: c.year - 1, month: 11 } : { ...c, month: c.month - 1 }));
  };
  const next = () => {
    setCurrent((c) => (c.month === 11 ? { year: c.year + 1, month: 0 } : { ...c, month: c.month + 1 }));
  };

  const cells = buildMonthGrid();
  const selectedDayTasks = selectedDay ? getTasksForDate(selectedDay) : [];

  return (
    <Box sx={{ display: "flex", flexDirection: { xs: "column", lg: "row" }, gap: 2 }}>
      {/* Calendar Grid */}
      <Paper
        elevation={0}
        sx={{ flex: 1, borderRadius: 2.5, border: "1px solid #e2e8f0", overflow: "hidden" }}
      >
        {/* Month Nav */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: { xs: 1.5, sm: 2.5 },
            py: 1.5,
            borderBottom: "1px solid #f1f5f9",
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton size="small" onClick={prev} sx={{ border: "1px solid #e2e8f0", borderRadius: 1 }}>
              <NavigateBeforeIcon sx={{ fontSize: 14 }} />
            </IconButton>
            <Typography variant="h6" fontWeight={700} sx={{ minWidth: 130, textAlign: "center", color: "#0f172a", fontSize: "0.95rem" }}>
              {MONTHS[current.month]} {current.year}
            </Typography>
            <IconButton size="small" onClick={next} sx={{ border: "1px solid #e2e8f0", borderRadius: 1 }}>
              <NavigateNextIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Box>
          <Box sx={{ display: "flex", border: "1px solid #e2e8f0", borderRadius: 1.5, overflow: "hidden" }}>
            {["Month", "Week", "Day"].map((m) => (
              <Button
                key={m}
                size="small"
                onClick={() => setCalMode(m.toLowerCase())}
                sx={{
                  borderRadius: 0,
                  px: 1.75,
                  py: 0.5,
                  bgcolor: calMode === m.toLowerCase() ? "#f1f5f9" : "transparent",
                  color: calMode === m.toLowerCase() ? "#0f172a" : "#94a3b8",
                  fontWeight: 600,
                  fontSize: "0.7rem",
                  minWidth: 44,
                  "&:hover": { bgcolor: "#f8fafc" },
                }}
              >
                {m}
              </Button>
            ))}
          </Box>
        </Box>

        {/* Day Headers */}
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderBottom: "1px solid #f1f5f9" }}>
          {DAYS.map((d) => (
            <Box key={d} sx={{ py: 1, textAlign: "center" }}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: "#94a3b8", fontSize: "0.65rem", letterSpacing: "0.04em" }}>
                {d}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Calendar Cells */}
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
          {cells.map((cell, idx) => {
            const cellTasks = getTasksForDate(cell.date);
            const isSelected = selectedDay && cell.date?.toDateString() === selectedDay.toDateString();
            return (
              <Box
                key={idx}
                onClick={() => cell.isCurrentMonth && cell.date && setSelectedDay(cell.date)}
                sx={{
                  minHeight: { xs: 56, sm: 72 },
                  border: "0.5px solid #f1f5f9",
                  p: 0.75,
                  cursor: cell.isCurrentMonth ? "pointer" : "default",
                  bgcolor: isSelected ? alpha("#0d3d52", 0.04) : "transparent",
                  "&:hover": cell.isCurrentMonth ? { bgcolor: "#f8fafc" } : {},
                }}
              >
                <Box
                  sx={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: isToday(cell.date) ? "#0d3d52" : "transparent",
                    border: isSelected && !isToday(cell.date) ? "1px solid #0d3d52" : "none",
                    mb: 0.4,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: "0.7rem",
                      fontWeight: isToday(cell.date) ? 700 : 400,
                      color: isToday(cell.date) ? "white" : cell.isCurrentMonth ? "#334155" : "#cbd5e1",
                    }}
                  >
                    {cell.day}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.35 }}>
                  {cellTasks.slice(0, 4).map((t, i) => (
                    <Box key={i} sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: getDotColor(t) }} />
                  ))}
                </Box>
              </Box>
            );
          })}
        </Box>
      </Paper>

      {/* Legend */}
      <Box sx={{ width: { xs: "100%", lg: 220 }, flexShrink: 0 }}>
        <Paper elevation={0} sx={{ borderRadius: 2.5, border: "1px solid #e2e8f0", p: 2 }}>
          <Typography variant="body2" fontWeight={700} sx={{ mb: 1.5, color: "#0f172a", fontSize: "0.8rem" }}>
            Legend
          </Typography>
          {[
            { label: "Extremely Critical Priority", color: "#f87171" },
            { label: "High Priority", color: "#f87171" },
            { label: "Medium Priority", color: "#fbbf24" },
            { label: "Low Priority", color: "#60a5fa" },
            { label: "In Progress", color: "#10b981" },
            { label: "Pending", color: "#94a3b8" },
          ].map((item) => (
            <Box key={item.label} sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: item.color, flexShrink: 0 }} />
              <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.7rem" }}>
                {item.label}
              </Typography>
            </Box>
          ))}
        </Paper>
      </Box>

      {/* Day Detail Panel */}
      {selectedDay && selectedDayTasks.length > 0 && (
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            bgcolor: "rgba(0,0,0,0.35)",
            zIndex: 1300,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: 2,
          }}
          onClick={() => setSelectedDay(null)}
        >
          <Paper
            elevation={8}
            onClick={(e) => e.stopPropagation()}
            sx={{ borderRadius: 3, width: 360, maxWidth: "100%", maxHeight: "80vh", overflow: "auto" }}
          >
            <Box sx={{ px: 2.5, py: 2, borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Box>
                <Typography variant="subtitle1" fontWeight={700} sx={{ color: "#0f172a", fontSize: "0.9rem" }}>
                  {selectedDay.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.72rem" }}>
                  {selectedDayTasks.length} task{selectedDayTasks.length !== 1 ? "s" : ""} scheduled
                </Typography>
              </Box>
              <IconButton size="small" onClick={() => setSelectedDay(null)}>
                <CloseIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Box>

            <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1.25 }}>
              {selectedDayTasks.map((t) => {
                const prKey = t.priority?.toLowerCase() || "medium";
                const stKey = t.status?.toLowerCase() || "pending";
                const pCfg = PRIORITY_CFG[prKey] || PRIORITY_CFG.medium;
                const sCfg = STATUS_CFG[stKey] || STATUS_CFG.pending;
                const aName = t.assets?.[0]?.assetName || t.assetIds?.[0]?.assetName || "Asset";
                const cName = t.checklists?.[0]?.name || "Checklist";
                const loc = t.assetIds?.[0]?.currentLocation || t.assets?.[0]?.currentLocation || "";
                const isCrit = t.criticalAsset === true;
                return (
                  <Box
                    key={t._id}
                    sx={{ borderRadius: 2, border: `1px solid ${pCfg.border}`, p: 1.75, borderLeft: `3px solid ${pCfg.dot}` }}
                  >
                    <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.4, color: "#0f172a", fontSize: "0.85rem" }}>
                      {aName}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.4 }}>
                      <DescriptionIcon sx={{ fontSize: 12, color: "#94a3b8" }} />
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.72rem" }}>
                        {cName}
                      </Typography>
                    </Box>
                    {loc && (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.9 }}>
                        <LocationIcon sx={{ fontSize: 12, color: "#94a3b8" }} />
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.72rem" }}>
                          {loc}
                        </Typography>
                      </Box>
                    )}
                    <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mb: 1 }}>
                      <Chip label={pCfg.label.replace(" Priority", "")} size="small" sx={{ bgcolor: pCfg.bg, color: pCfg.color, fontSize: "0.62rem", height: 19, fontWeight: 700 }} />
                      <Chip label={sCfg.label} size="small" sx={{ bgcolor: sCfg.bg, color: sCfg.color, fontSize: "0.62rem", height: 19, fontWeight: 700 }} />
                      {isCrit && (
                        <Chip label="Critical Asset" size="small" sx={{ bgcolor: "#fee2e2", color: "#dc2626", fontSize: "0.62rem", height: 19, fontWeight: 700 }} />
                      )}
                    </Box>
                    <Button
                      fullWidth
                      variant="contained"
                      size="small"
                      onClick={() => onView(t._id)}
                      sx={{ borderRadius: 1.5, bgcolor: "#0d3d52", "&:hover": { bgcolor: "#0a2f40" }, fontWeight: 700, fontSize: "0.75rem", boxShadow: "none" }}
                    >
                      Start Inspection
                    </Button>
                  </Box>
                );
              })}
            </Box>
          </Paper>
        </Box>
      )}
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
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const toast = useCallback((msg, severity = "success") => {
    setSnack({ open: true, msg, severity });
  }, []);

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

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };
  const clearFilters = () => {
    setFilters({ status: "", priority: "", search: "", page: 1, limit: 20 });
  };
  const hasFilters = !!(filters.status || filters.priority || filters.date);
  const handleViewTask = (id) => navigate(`/team/task/${id}`);

  const statCards = [
    { title: "Total Tasks", value: stats?.total ?? tasks.length },
    { title: "Pending", value: stats?.pending ?? 0 },
    { title: "In Progress", value: stats?.in_progress ?? 0 },
    { title: "Due Today", value: stats?.due_today ?? 0 },
  ];

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc" }}>
        <Container maxWidth="xl" sx={{ py: { xs: 2, md: 3 } }}>
          {/* ── Header ── */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: { xs: "flex-start", sm: "center" },
              flexDirection: { xs: "column", sm: "row" },
              flexWrap: "wrap",
              gap: 1.5,
              mb: 2.5,
            }}
          >
            <Box>
              <Typography variant="h5" fontWeight={800} sx={{ color: "#0f172a", fontSize: "1.35rem", mb: 0.1 }}>
                My Tasks
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8rem" }}>
                Your assigned inspection tasks
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
              {/* View Toggle */}
              <Paper elevation={0} sx={{ display: "flex", border: "1px solid #e2e8f0", borderRadius: 2, overflow: "hidden" }}>
                <Button
                  size="small"
                  startIcon={<ViewListIcon sx={{ fontSize: 14 }} />}
                  onClick={() => setViewMode("list")}
                  sx={{
                    px: 1.75,
                    py: 0.6,
                    borderRadius: 0,
                    fontWeight: 600,
                    fontSize: "0.75rem",
                    bgcolor: viewMode === "list" ? "#f1f5f9" : "transparent",
                    color: viewMode === "list" ? "#0f172a" : "#64748b",
                    "&:hover": { bgcolor: "#f8fafc" },
                  }}
                >
                  List View
                </Button>
                <Button
                  size="small"
                  startIcon={<CalendarMonthIcon sx={{ fontSize: 14 }} />}
                  onClick={() => setViewMode("calendar")}
                  sx={{
                    px: 1.75,
                    py: 0.6,
                    borderRadius: 0,
                    fontWeight: 600,
                    fontSize: "0.75rem",
                    bgcolor: viewMode === "calendar" ? "#f1f5f9" : "transparent",
                    color: viewMode === "calendar" ? "#0f172a" : "#64748b",
                    "&:hover": { bgcolor: "#f8fafc" },
                  }}
                >
                  Calendar View
                </Button>
              </Paper>
              <Tooltip title="Refresh">
                <IconButton
                  onClick={loadTasks}
                  disabled={loading}
                  sx={{ border: "1px solid #e2e8f0", borderRadius: 2, bgcolor: "#fff" }}
                >
                  {loading ? <CircularProgress size={16} /> : <RefreshIcon sx={{ fontSize: 16, color: "#64748b" }} />}
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* ── Filters ── */}
          <Paper elevation={0} sx={{ p: 1.5, borderRadius: 2.5, border: "1px solid #e2e8f0", mb: 2.5 }}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25} alignItems={{ sm: "center" }}>
              <FormControl size="small" sx={{ minWidth: 130, width: { xs: "100%", sm: "auto" } }}>
                <Select
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  displayEmpty
                  sx={{ bgcolor: "#fff", borderRadius: 2, fontSize: "0.8rem" }}
                >
                  <MenuItem value="" sx={{ fontSize: "0.8rem" }}>All Tasks</MenuItem>
                  <MenuItem value="pending" sx={{ fontSize: "0.8rem" }}>Pending</MenuItem>
                  <MenuItem value="in_progress" sx={{ fontSize: "0.8rem" }}>In Progress</MenuItem>
                  <MenuItem value="submitted" sx={{ fontSize: "0.8rem" }}>Submitted</MenuItem>
                  <MenuItem value="completed" sx={{ fontSize: "0.8rem" }}>Completed</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 120, width: { xs: "100%", sm: "auto" } }}>
                <Select
                  value={filters.priority}
                  onChange={(e) => handleFilterChange("priority", e.target.value)}
                  displayEmpty
                  sx={{ bgcolor: "#fff", borderRadius: 2, fontSize: "0.8rem" }}
                >
                  <MenuItem value="" sx={{ fontSize: "0.8rem" }}>Priority</MenuItem>
                  <MenuItem value="critical" sx={{ fontSize: "0.8rem" }}>Extremely Critical</MenuItem>
                  <MenuItem value="high" sx={{ fontSize: "0.8rem" }}>High</MenuItem>
                  <MenuItem value="medium" sx={{ fontSize: "0.8rem" }}>Medium</MenuItem>
                  <MenuItem value="low" sx={{ fontSize: "0.8rem" }}>Low</MenuItem>
                </Select>
              </FormControl>
              <TextField
                size="small"
                type="date"
                value={filters.date || ""}
                onChange={(e) => handleFilterChange("date", e.target.value)}
                sx={{
                  minWidth: 150,
                  width: { xs: "100%", sm: "auto" },
                  "& .MuiOutlinedInput-root": { bgcolor: "#fff", borderRadius: 2, fontSize: "0.8rem" },
                }}
              />
              {hasFilters && (
                <Button size="small" onClick={clearFilters} startIcon={<ClearIcon sx={{ fontSize: 14 }} />} sx={{ color: "#64748b", fontSize: "0.78rem" }}>
                  More Filters
                </Button>
              )}
            </Stack>
          </Paper>

          {/* ── Stat Cards ── */}
          <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
            {statCards.map((card, i) => (
              <Grid item xs={6} sm={3} key={i}>
                <StatCard {...card} />
              </Grid>
            ))}
          </Grid>

          {/* ── Content ── */}
          {loading ? (
            <Grid container spacing={2}>
              {[...Array(6)].map((_, i) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
                  <Skeleton variant="rectangular" height={220} sx={{ borderRadius: 2.5 }} />
                </Grid>
              ))}
            </Grid>
          ) : viewMode === "calendar" ? (
            <CalendarView tasks={tasks} onView={handleViewTask} />
          ) : tasks.length === 0 ? (
            <Paper elevation={0} sx={{ p: { xs: 4, sm: 8 }, textAlign: "center", borderRadius: 2.5, border: "1px solid #e2e8f0" }}>
              <Avatar sx={{ width: 56, height: 56, mx: "auto", mb: 2, bgcolor: "#f1f5f9" }}>
                <AssignmentIcon sx={{ fontSize: 28, color: "#94a3b8" }} />
              </Avatar>
              <Typography variant="h6" fontWeight={700} color="#475569" sx={{ fontSize: "1rem" }}>
                {hasFilters ? "No matching tasks" : "No tasks assigned"}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontSize: "0.8rem" }}>
                {hasFilters ? "Try adjusting your filters" : "You're all caught up!"}
              </Typography>
              {hasFilters && (
                <Button variant="outlined" sx={{ mt: 2, fontSize: "0.8rem" }} onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </Paper>
          ) : (
            <>
              <Grid container spacing={2}>
                {tasks.map((task) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={task._id}>
                    <TaskCard task={task} onView={handleViewTask} />
                  </Grid>
                ))}
              </Grid>
              {pagination.totalPages > 1 && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                  <Pagination
                    count={pagination.totalPages}
                    page={filters.page}
                    onChange={(_, p) => handleFilterChange("page", p)}
                    color="primary"
                    size="small"
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
          <Alert severity={snack.severity} onClose={() => setSnack((s) => ({ ...s, open: false }))} sx={{ borderRadius: 2, fontSize: "0.8rem" }}>
            {snack.msg}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}

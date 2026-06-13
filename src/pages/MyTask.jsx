// src/pages/MyTask.jsx - Complete Working Version
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
  InputAdornment,
  Tooltip,
  useMediaQuery,
  Pagination,
  Skeleton,
  Fade,
  Grid,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Card,
  CardContent,
  CardActions,
} from "@mui/material";
import { createTheme, ThemeProvider, alpha, styled } from "@mui/material/styles";
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  ErrorOutline as ErrorOutlineIcon,
  HourglassTop as HourglassTopIcon,
  CalendarMonth as CalendarMonthIcon,
  Clear as ClearIcon,
  PendingActions as PendingIcon,
  DoneAll as DoneAllIcon,
  Warning as WarningIcon,
  ViewList as ViewListIcon,
  CalendarViewWeek as CalendarViewIcon,
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon,
  Today as TodayIcon,
  Circle as CircleIcon,
  PlayArrow as PlayArrowIcon,
  Refresh as ContinueIcon,
  LocationOn as LocationIcon,
  Description as DescriptionIcon,
  Flag as FlagIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useTeamAssignment } from "../context/TeamAssignmentContext";
import { useAuth } from "../context/AuthContexts";

// ─── Theme ────────────────────────────────────────────────────────────────────
const theme = createTheme({
  palette: {
    primary: {
      main: "#094158",
      dark: "#0a3a4f",
      light: "#e2e8f0",
      contrastText: "#fff",
    },
    secondary: {
      main: "#7c3aed",
      light: "#ede9fe",
    },
    success: { main: "#10b981", dark: "#059669", light: "#d1fae5" },
    warning: { main: "#f59e0b", dark: "#d97706", light: "#fef3c7" },
    error: { main: "#ef4444", dark: "#dc2626", light: "#fee2e2" },
    background: { default: "#f8fafc", paper: "#ffffff" },
  },
  shape: { borderRadius: 16 },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    h5: { fontWeight: 700, letterSpacing: "-0.02em" },
    h6: { fontWeight: 600, letterSpacing: "-0.01em" },
  },
});

// ─── Status Config ────────────────────────────────────────────────────────────
const STATUS_CFG = {
  pending: { label: "Pending", color: "#d97706", bg: "#fef3c7" },
  in_progress: { label: "In Progress", color: "#2563eb", bg: "#dbeafe" },
  submitted: { label: "Submitted", color: "#7c3aed", bg: "#ede9fe" },
  completed: { label: "Completed", color: "#059669", bg: "#d1fae5" },
  approved: { label: "Approved", color: "#059669", bg: "#d1fae5" },
  rejected: { label: "Rejected", color: "#dc2626", bg: "#fee2e2" },
  overdue: { label: "Overdue", color: "#dc2626", bg: "#fee2e2" },
};

// ─── Styled Components ────────────────────────────────────────────────────────
const StatusBadge = styled(Chip)(({ status }) => {
  const statusMap = {
    pending: { bg: "#fef3c7", color: "#d97706" },
    in_progress: { bg: "#dbeafe", color: "#2563eb" },
    submitted: { bg: "#ede9fe", color: "#7c3aed" },
    completed: { bg: "#d1fae5", color: "#059669" },
    approved: { bg: "#d1fae5", color: "#059669" },
    rejected: { bg: "#fee2e2", color: "#dc2626" },
    overdue: { bg: "#fee2e2", color: "#dc2626" },
  };
  const cfg = statusMap[status?.toLowerCase()] || statusMap.pending;
  return {
    backgroundColor: cfg.bg,
    color: cfg.color,
    fontWeight: 600,
    fontSize: "0.7rem",
    height: 24,
  };
});

const PriorityBadge = styled(Box)(({ priority }) => {
  const priorityMap = {
    critical: { bg: "#fee2e2", color: "#dc2626", border: "#fecaca", label: "Extremely Critical" },
    high: { bg: "#ffedd5", color: "#f97316", border: "#fed7aa", label: "High" },
    medium: { bg: "#fef3c7", color: "#d97706", border: "#fde68a", label: "Medium" },
    low: { bg: "#d1fae5", color: "#059669", border: "#a7f3d0", label: "Low" },
  };
  const cfg = priorityMap[priority?.toLowerCase()] || priorityMap.medium;
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.25rem",
    padding: "0.25rem 0.75rem",
    borderRadius: "9999px",
    backgroundColor: cfg.bg,
    color: cfg.color,
    border: `1px solid ${cfg.border}`,
    fontSize: "0.7rem",
    fontWeight: 600,
  };
});

// ─── Modern Task Card Component ───────────────────────────────────────────────
const ModernTaskCard = ({ task, onView }) => {
  const [isHovered, setIsHovered] = useState(false);

  const prKey = task.priority?.toLowerCase() || "medium";
  const stKey = task.status?.toLowerCase() || "pending";

  const assetName = task.assets?.[0]?.assetName || task.assetIds?.[0]?.assetName || "Unnamed Asset";
  const checklistName = task.checklists?.[0]?.name || task.checklistData?.[0]?.name || "Inspection Checklist";
  const assetLocation = task.assetIds?.[0]?.currentLocation || task.assets?.[0]?.currentLocation || "Location not set";
  const isCriticalAsset = task.criticalAsset === true;

  const dueDate = task.dueDate ? new Date(task.dueDate) : null;
  const isOverdue = dueDate && dueDate < new Date() && !["completed", "approved"].includes(stKey);
  const completionRate = task.checklistData?.[0]?.completionRate ?? task.completionRate ?? 0;

  const priorityConfig = {
    critical: { label: "Extremely Critical", color: "#dc2626", bg: "#fee2e2" },
    high: { label: "High", color: "#f97316", bg: "#ffedd5" },
    medium: { label: "Medium", color: "#f59e0b", bg: "#fef3c7" },
    low: { label: "Low", color: "#10b981", bg: "#d1fae5" },
  };
  const priorityCfg = priorityConfig[prKey] || priorityConfig.medium;

  return (
    <Card
      elevation={0}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        borderRadius: 1,
        border: "1px solid",
        width:"380px",
        borderColor: isHovered ? "primary.light" : "#e2e8f0",
        transition: "all 0.2s ease",
        transform: isHovered ? "translateY(-2px)" : "none",
        boxShadow: isHovered ? 4 : 1,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "visible",
      }}
    >
      <CardContent sx={{ p: 2.5, pb: 1.5, flex: 1 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5, flexWrap: "wrap", gap: 0.5 }}>
          <PriorityBadge priority={prKey}>
            <FlagIcon sx={{ fontSize: 12 }} />
            {priorityCfg.label}
          </PriorityBadge>
          <Box sx={{ display: "flex", gap: 0.5 }}>
            <StatusBadge status={stKey} label={STATUS_CFG[stKey]?.label || stKey} size="small" />
            {isCriticalAsset && (
              <Chip label="Critical Asset" size="small" sx={{ bgcolor: "#fee2e2", color: "#dc2626", fontWeight: 600, fontSize: "0.65rem", height: 24 }} />
            )}
          </Box>
        </Box>

        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "1rem", mb: 0.5, lineHeight: 1.3 }}>
          {assetName}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.5 }}>
          <DescriptionIcon sx={{ fontSize: 14, color: "#94a3b8" }} />
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.75rem" }}>
            {checklistName}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 1 }}>
          <LocationIcon sx={{ fontSize: 14, color: "#94a3b8" }} />
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.75rem" }}>
            {assetLocation}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 1.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            <ScheduleIcon sx={{ fontSize: 14, color: isOverdue ? "#ef4444" : "#94a3b8" }} />
            <Typography variant="caption" sx={{ color: isOverdue ? "#ef4444" : "#64748b", fontWeight: isOverdue ? 600 : 400 }}>
              Due {dueDate ? dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}
            </Typography>
          </Box>
        </Box>

        {completionRate > 0 && (
          <Box sx={{ mt: 1.5 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary">Progress</Typography>
              <Typography variant="caption" fontWeight={600} color="primary.main">{completionRate}%</Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={completionRate}
              sx={{
                height: 6,
                borderRadius: 3,
                bgcolor: "#e2e8f0",
                "& .MuiLinearProgress-bar": { borderRadius: 3, bgcolor: "#094158" },
              }}
            />
          </Box>
        )}
      </CardContent>

      <CardActions sx={{ p: 2.5, pt: 0 }}>
        <Button
          fullWidth
          variant="contained"
          onClick={() => onView(task._id)}
          startIcon={stKey === "in_progress" ? <ContinueIcon /> : <PlayArrowIcon />}
          sx={{
            borderRadius: 1.5,
            py: 1,
            textTransform: "none",
            fontWeight: 600,
            bgcolor: "#094158",
            "&:hover": { bgcolor: "#0a3a4f" },
          }}
        >
          {stKey === "in_progress" ? "Continue" : "Start Inspection"}
        </Button>
      </CardActions>
    </Card>
  );
};

// ─── Stat Card Component ───────────────────────────────────────────────────────
const ModernStatCard = ({ title, value, icon: Icon, color }) => (
  <Paper
    elevation={0}
    sx={{
      p: 2.5,
      borderRadius: 1,
      border: "1px solid #e2e8f0",
      background: "white",
      width:"280px",
      transition: "all 0.2s",
      "&:hover": { borderColor: "#cbd5e1", boxShadow: 2 },
    }}
  >
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
          {title}
        </Typography>
        <Typography variant="h5" fontWeight={700} sx={{ color: color || "#0f172a" }}>
          {value}
        </Typography>
      </Box>
      <Avatar sx={{ bgcolor: alpha(color || "#094158", 0.1), width: 44, height: 44 }}>
        <Icon sx={{ color: color || "#094158", fontSize: 24 }} />
      </Avatar>
    </Box>
  </Paper>
);

// ─── Filter Bar Component ─────────────────────────────────────────────────────
const FilterBar = ({ filters, onFilterChange, onClear, hasFilters }) => (
  <Paper elevation={0} sx={{ p: 2, borderRadius: 1, border: "1px solid #e2e8f0", mb: 3 }}>
    <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }}>
      <TextField
        size="small"
        placeholder="Search assets or checklists..."
        value={filters.search}
        onChange={(e) => onFilterChange("search", e.target.value)}
        sx={{ flex: 2 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ fontSize: 18, color: "#94a3b8" }} />
            </InputAdornment>
          ),
          endAdornment: filters.search && (
            <IconButton size="small" onClick={() => onFilterChange("search", "")}>
              <ClearIcon sx={{ fontSize: 16 }} />
            </IconButton>
          ),
          sx: { borderRadius: 1, bgcolor: "#f8fafc" },
        }}
      />
      <FormControl size="small" sx={{ minWidth: 140 }}>
        <Select
          value={filters.status}
          onChange={(e) => onFilterChange("status", e.target.value)}
          displayEmpty
          sx={{ bgcolor: "#f8fafc", borderRadius: 2 }}
        >
          <MenuItem value="">All Status</MenuItem>
          <MenuItem value="pending">Pending</MenuItem>
          <MenuItem value="in_progress">In Progress</MenuItem>
          <MenuItem value="submitted">Submitted</MenuItem>
          <MenuItem value="completed">Completed</MenuItem>
        </Select>
      </FormControl>
      <FormControl size="small" sx={{ minWidth: 130 }}>
        <Select
          value={filters.priority}
          onChange={(e) => onFilterChange("priority", e.target.value)}
          displayEmpty
          sx={{ bgcolor: "#f8fafc", borderRadius: 2 }}
        >
          <MenuItem value="">All Priority</MenuItem>
          <MenuItem value="critical">Extremely Critical</MenuItem>
          <MenuItem value="high">High</MenuItem>
          <MenuItem value="medium">Medium</MenuItem>
          <MenuItem value="low">Low</MenuItem>
        </Select>
      </FormControl>
      {hasFilters && (
        <Button size="small" onClick={onClear} startIcon={<ClearIcon />} sx={{ color: "#64748b" }}>
          Clear all
        </Button>
      )}
    </Stack>
  </Paper>
);

// ─── MyTask Component ─────────────────────────────────────────────────────────
function MyTask() {
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
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ status: "", priority: "", search: "", page: 1, limit: 20 });
  };

  const hasFilters = !!(filters.status || filters.priority || filters.search);
  const handleViewTask = (taskId) => navigate(`/team/task/${taskId}`);

  const statCards = [
    { title: "Total Tasks", value: stats?.total ?? tasks.length, icon: AssignmentIcon, color: "#094158" },
    { title: "In Progress", value: stats?.in_progress ?? 0, icon: HourglassTopIcon, color: "#f59e0b" },
    { title: "Completed", value: stats?.completed ?? 0, icon: CheckCircleIcon, color: "#10b981" },
    { title: "Overdue", value: stats?.overdue ?? 0, icon: WarningIcon, color: "#ef4444" },
  ];

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc" }}>
        <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
          {/* Header */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2, mb: 3 }}>
            <Box>
              <Typography variant="h5" fontWeight={700} sx={{ color: "#0f172a" }}>
                My Inspections
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Track and complete your assigned inspection tasks
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Paper sx={{ borderRadius: 2, overflow: "hidden", display: "flex", border: "1px solid #e2e8f0" }}>
                <Button
                  size="small"
                  onClick={() => setViewMode("list")}
                  startIcon={<ViewListIcon fontSize="small" />}
                  sx={{
                    borderRadius: 0,
                    px: 2,
                    py: 0.75,
                    bgcolor: viewMode === "list" ? "#094158" : "transparent",
                    color: viewMode === "list" ? "white" : "#64748b",
                  }}
                >
                  List
                </Button>
                <Button
                  size="small"
                  onClick={() => setViewMode("calendar")}
                  startIcon={<CalendarViewIcon fontSize="small" />}
                  sx={{
                    borderRadius: 0,
                    px: 2,
                    py: 0.75,
                    bgcolor: viewMode === "calendar" ? "#094158" : "transparent",
                    color: viewMode === "calendar" ? "white" : "#64748b",
                  }}
                >
                  Calendar
                </Button>
              </Paper>
              <Tooltip title="Refresh">
                <IconButton
                  onClick={loadTasks}
                  disabled={loading}
                  sx={{ border: "1px solid #e2e8f0", borderRadius: 2 }}
                >
                  {loading ? <CircularProgress size={18} /> : <RefreshIcon fontSize="small" />}
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Stat Cards */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {statCards.map((card, i) => (
              <Grid item xs={6} sm={3} key={i}>
                <ModernStatCard {...card} />
              </Grid>
            ))}
          </Grid>

          {/* Filters */}
          <FilterBar
            filters={filters}
            onFilterChange={handleFilterChange}
            onClear={clearFilters}
            hasFilters={hasFilters}
          />

          {/* Content */}
          {loading ? (
            <Grid container spacing={2.5}>
              {[...Array(6)].map((_, i) => (
                <Grid key={i} item xs={12} sm={6} md={4} lg={3}>
                  <Skeleton variant="rectangular" height={280} sx={{ borderRadius: 2 }} />
                </Grid>
              ))}
            </Grid>
          ) : tasks.length === 0 ? (
            <Paper sx={{ p: 8, textAlign: "center", borderRadius: 2, border: "1px solid #e2e8f0" }}>
              <Avatar sx={{ width: 64, height: 64, mx: "auto", mb: 2, bgcolor: "#f1f5f9" }}>
                <AssignmentIcon sx={{ fontSize: 32, color: "#94a3b8" }} />
              </Avatar>
              <Typography variant="h6" fontWeight={600} color="#475569">
                {hasFilters ? "No matching tasks" : "No tasks assigned"}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {hasFilters ? "Try adjusting your filters" : "You're all caught up!"}
              </Typography>
              {hasFilters && (
                <Button variant="outlined" sx={{ mt: 2 }} onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </Paper>
          ) : (
            <>
              <Grid container spacing={2.5}>
                {tasks.map((task) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={task._id}>
                    <ModernTaskCard task={task} onView={handleViewTask} />
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
                  />
                </Box>
              )}
            </>
          )}
        </Container>

        <Snackbar
          open={snack.open}
          autoHideDuration={4000}
          onClose={() => setSnack(s => ({ ...s, open: false }))}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert
            severity={snack.severity}
            onClose={() => setSnack(s => ({ ...s, open: false }))}
            sx={{ borderRadius: 2 }}
          >
            {snack.msg}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}

export default MyTask;
// pages/AssignedChecklist.jsx — Full responsive version
// ✅ Mobile-first: stat cards stack 2x2 on xs, 4-in-a-row on md+
// ✅ Table replaced with cards on mobile, table on md+
// ✅ Filter bar collapses cleanly on small screens
// ✅ Dialogs are fullScreen on mobile
// ✅ Header actions wrap gracefully on xs
// ✅ Due From / Due To date filters fixed (timezone/end-of-day boundary bug)
// ✅ All other fixes from previous version retained

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Button,
  IconButton,
  TextField,
  Select,
  MenuItem,
  FormControl,
  Chip,
  Avatar,
  Stack,
  CircularProgress,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  InputAdornment,
  Tooltip,
  Card,
  CardContent,
  CardActions,
  styled,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useMediaQuery,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Radio,
  Pagination,
  Skeleton,
  Fade,
  Zoom,
  Collapse,
  LinearProgress,
  Divider,
} from "@mui/material";
import { createTheme, ThemeProvider, alpha } from "@mui/material/styles";
import {
  Close as CloseIcon,
  Search as SearchIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Assignment as AssignmentIcon,
  PersonAdd as PersonAddIcon,
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
  ErrorOutline as ErrorOutlineIcon,
  HourglassTop as HourglassTopIcon,
  Refresh as RefreshIcon,
  Send as SendIcon,
  Warning as WarningIcon,
  Description as DescriptionIcon,
  SwapHoriz as SwapHorizIcon,
  Clear as ClearIcon,
  Inventory2 as InventoryIcon,
  GroupAdd as GroupAddIcon,
  PendingActions as PendingActionsIcon,
  TrendingUp as TrendingUpIcon,
  WarningAmber as WarningAmberIcon,
  Schedule as ScheduleIcon,
  ArrowForward as ArrowForwardIcon,
  PersonSearch as PersonSearchIcon,
  FilterList as FilterListIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CalendarMonth as CalendarMonthIcon,
} from "@mui/icons-material";
import { useAuth } from "../context/AuthContexts";
import { useAssignment } from "../context/AssignmentContext";
import { useNavigate } from "react-router-dom";
import AssetSearchField from "../components/AssetSearchField";

// ─── Theme ────────────────────────────────────────────────────────────────────
const theme = createTheme({
  palette: {
    primary: { main: "#185677", light: "#134d64", dark: "#104661", contrastText: "#ffffff" },
    secondary: { main: "#ec4899", light: "#f472b6", dark: "#db2777" },
    success: { main: "#10b981", light: "#34d399", dark: "#059669" },
    warning: { main: "#f59e0b", light: "#fbbf24", dark: "#d97706" },
    error: { main: "#ef4444", light: "#f87171", dark: "#dc2626" },
    info: { main: "#3b82f6", light: "#60a5fa", dark: "#2563eb" },
    background: { default: "#f8fafc", paper: "#ffffff" },
    text: { primary: "#0f172a", secondary: "#64748b", disabled: "#94a3b8" },
    divider: "#e2e8f0",
  },
  typography: {
    fontFamily: "'Inter', 'Poppins', system-ui, sans-serif",
    button: { textTransform: "none", fontWeight: 600, fontSize: "0.8125rem" },
  },
  shape: { borderRadius: 16 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: "8px 16px",
          boxShadow: "none",
          "&:hover": { boxShadow: "none" },
        },
        contained: {
          background: "linear-gradient(135deg, #1e5f79 0%, #175f7b 100%)",
          "&:hover": { background: "linear-gradient(135deg, #084d68 0%, #0b3a4c 100%)" },
        },
      },
    },
    MuiPaper: {
      styleOverrides: { root: { borderRadius: 20, backgroundImage: "none" } },
    },
    MuiCard: {
      styleOverrides: { root: { borderRadius: 20, border: "1px solid #e2e8f0" } },
    },
    MuiTableCell: {
      styleOverrides: { root: { borderBottomColor: "#f1f5f9" } },
    },
    MuiDialog: {
      styleOverrides: { paper: { margin: 16 } },
    },
  },
});

// ─── Config ───────────────────────────────────────────────────────────────────
const STATUS_CFG = {
  pending:     { label: "Pending",     color: "#f59e0b", bg: "#fffbeb", icon: HourglassTopIcon },
  // in_progress: { label: "Pending Approval", color: "#3b82f6", bg: "#eff6ff", icon: PendingActionsIcon },
  pending_approval: { label: "Pending Approval", color: "#3b82f6", bg: "#eff6ff", icon: PendingActionsIcon },
  submitted:   { label: "Submitted",   color: "#134b7c", bg: "#f5f3ff", icon: AssignmentIcon },
  // completed:   { label: "Submitted",   color: "#10b981", bg: "#ecfdf5", icon: CheckCircleIcon },
  approved:    { label: "Approved",    color: "#10b981", bg: "#ecfdf5", icon: CheckCircleIcon },
  rejected:    { label: "Rejected",    color: "#ef4444", bg: "#fef2f2", icon: ErrorOutlineIcon },
  overdue:     { label: "Overdue",     color: "#ef4444", bg: "#fef2f2", icon: WarningAmberIcon },
};

const STATUS_FILTER_OPTIONS = Object.entries(STATUS_CFG).filter(
  ([key]) => key !== "in_progress",
);

const PRIORITY_CFG = {
  low:      { label: "Low",      color: "#10b981", bg: "#ecfdf5", icon: "🟢" },
  medium:   { label: "Medium",   color: "#f59e0b", bg: "#fffbeb", icon: "🟡" },
  high:     { label: "High",     color: "#ef4444", bg: "#fef2f2", icon: "🔴" },
  critical: { label: "Critical", color: "#7f1d1d", bg: "#fee2e2", icon: "💀" },
};

// ─── Styled ───────────────────────────────────────────────────────────────────
Object.assign(PRIORITY_CFG, {
  low: { ...PRIORITY_CFG.low, color: "#16a34a", bg: "#f0fdf4" },
  medium: { ...PRIORITY_CFG.medium, color: "#ca8a04", bg: "#fefce8" },
  high: { ...PRIORITY_CFG.high, color: "#f97316", bg: "#fff7ed" },
  critical: { ...PRIORITY_CFG.critical, color: "#dc2626", bg: "#fef2f2" },
});

const GlassCard = styled(Card)(() => ({
  background: "rgba(255,255,255,0.9)",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(99,102,241,0.1)",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 20px 40px rgba(0,0,0,0.08)",
    borderColor: "rgba(99,102,241,0.2)",
  },
}));

const GradientText = styled(Typography)(() => ({
  background: "linear-gradient(135deg, #363637 0%, #212122 100%)",
  backgroundClip: "text",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
}));

// ─── Stat Card ────────────────────────────────────────────────────────────────
const ModernStatCard = ({ label, value, icon: Icon, trend, subtitle, loading, color, active, onClick }) => (
  <Zoom in timeout={300}>
    <GlassCard
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(event) => {
        if (!onClick) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick();
        }
      }}
      sx={{
        height: "100%",
        width: "100%",
        minHeight: { xs: 132, md: 150 },
        overflow: "hidden",
        cursor: onClick ? "pointer" : "default",
        borderColor: active ? color || "#084d68" : undefined,
        boxShadow: active ? `0 10px 28px ${alpha(color || "#084d68", 0.18)}` : undefined,
        outline: "none",
        "&:focus-visible": {
          boxShadow: `0 0 0 3px ${alpha(color || "#084d68", 0.22)}`,
        },
      }}
    >
      <CardContent sx={{ p: { xs: 1.75, md: 2 } }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <Box sx={{ minWidth: 0, flex: 1, mr: 1 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontWeight: 600, letterSpacing: "0.05em", fontSize: { xs: "0.68rem", md: "0.75rem" } }}
            >
              {label}
            </Typography>
            {loading ? (
              <Skeleton width={60} height={40} />
            ) : (
              <Typography
                fontWeight={700}
                sx={{ mt: 0.25, color: color || "text.primary", fontSize: { xs: "1.5rem", md: "1.65rem" }, lineHeight: 1.15 }}
              >
                {value ?? 0}
              </Typography>
            )}
            {trend && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5, flexWrap: "wrap" }}>
                <TrendingUpIcon sx={{ fontSize: 10, color: "#10b981" }} />
                <Typography variant="caption" sx={{ color: "#10b981", fontWeight: 600 }}>
                  {trend}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  vs last week
                </Typography>
              </Box>
            )}
            {subtitle && !loading && (
              <Typography
                variant="caption"
                color="text.disabled"
                sx={{ mt: 0.35, display: "block", fontSize: { xs: "0.65rem", md: "0.7rem" } }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
          <Avatar
            sx={{
              bgcolor: alpha(color || "#6366f1", 0.1),
              color: color || "#6366f1",
              width: { xs: 40, md: 44 },
              height: { xs: 40, md: 44 },
              flexShrink: 0,
            }}
          >
            <Icon sx={{ fontSize: { xs: 20, md: 22 } }} />
          </Avatar>
        </Box>
      </CardContent>
    </GlassCard>
  </Zoom>
);

// ─── Status / Priority Chips ──────────────────────────────────────────────────
const StatusChip = ({ status }) => {
  const cfg = STATUS_CFG[status?.toLowerCase()] ?? STATUS_CFG.pending;
  const Icon = cfg.icon;
  return (
    <Chip
      label={cfg.label}
      size="small"
      icon={<Icon sx={{ fontSize: 14 }} />}
      sx={{ bgcolor: cfg.bg, color: cfg.color, fontWeight: 700, borderRadius: 2, "& .MuiChip-icon": { color: cfg.color } }}
    />
  );
};

const PriorityChip = ({ priority }) => {
  const cfg = PRIORITY_CFG[priority?.toLowerCase()] ?? PRIORITY_CFG.medium;
  return (
    <Chip label={cfg.label} size="small" sx={{ bgcolor: cfg.bg, color: cfg.color, fontWeight: 700, borderRadius: 2 }} />
  );
};

// ─── Date Cell ────────────────────────────────────────────────────────────────
const DateCell = ({ date }) => {
  if (!date) return <Typography variant="caption" color="text.disabled">—</Typography>;
  const d = new Date(date);
  const isOverdue = d < new Date();
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
      <ScheduleIcon sx={{ fontSize: 14, color: isOverdue ? "#ef4444" : "#94a3b8" }} />
      <Typography variant="body2" sx={{ color: isOverdue ? "#ef4444" : "inherit", fontWeight: isOverdue ? 600 : 400 }}>
        {d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
      </Typography>
    </Box>
  );
};

// ─── Progress Bar ─────────────────────────────────────────────────────────────
const ProgressBar = ({ value }) => {
  const pct = Math.min(100, Math.max(0, value ?? 0));
  const color = pct >= 80 ? "#10b981" : pct >= 50 ? "#f59e0b" : "#ef4444";
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 100 }}>
      <Box sx={{ flex: 1, height: 6, bgcolor: "#f1f5f9", borderRadius: 3, overflow: "hidden" }}>
        <LinearProgress
          variant="determinate"
          value={pct}
          sx={{ height: 6, borderRadius: 3, bgcolor: "#f1f5f9", "& .MuiLinearProgress-bar": { bgcolor: color, borderRadius: 3 } }}
        />
      </Box>
      <Typography variant="caption" fontWeight={700} sx={{ color, minWidth: 34 }}>{pct}%</Typography>
    </Box>
  );
};

// ─── Mobile Assignment Card ───────────────────────────────────────────────────
const getAssignedToLabel = (asgn) => {
  const admin = asgn?.assignedToAdmin;
  if (admin) {
    if (typeof admin === "object") {
      return admin.customerName || admin.name || admin.email || asgn.customerName || asgn.customerEmail || "Admin";
    }
    return asgn.customerName || asgn.customerEmail || "Admin";
  }

  if (asgn?.customerName || asgn?.customerEmail) {
    return asgn.customerName || asgn.customerEmail;
  }

  const teamCount = asgn?.assignedToTeamMembers?.length || 0;
  return teamCount ? `${teamCount} member(s)` : "—";
};

const MobileAssignmentCard = ({ asgn, canManage, onView, onReassign, onDelete }) => (
  <Card sx={{ mb: 2, borderRadius: 1, border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
    <CardContent sx={{ pb: 1 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
        <Box sx={{ flex: 1, minWidth: 0, mr: 1 }}>
          <Typography fontWeight={700} variant="body2" noWrap>
            {asgn.checklistData?.[0]?.name ?? asgn.checklistIds?.[0]?.name ?? "—"}
          </Typography>
          <Typography variant="caption" color="text.disabled">#{asgn._id?.slice(-8)}</Typography>
        </Box>
        <StatusChip status={asgn.status} />
      </Box>

      <Grid container spacing={1} sx={{ mb: 1.5 }}>
        <Grid item xs={6}>
          <Typography variant="caption" color="text.secondary" display="block">Assigned To</Typography>
          <Typography variant="body2" fontWeight={500} noWrap>
            {getAssignedToLabel(asgn)}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="caption" color="text.secondary" display="block">Priority</Typography>
          <PriorityChip priority={asgn.priority} />
        </Grid>
        <Grid item xs={6}>
          <Typography variant="caption" color="text.secondary" display="block">Due Date</Typography>
          <DateCell date={asgn.dueDate} />
        </Grid>
        <Grid item xs={6}>
          <Typography variant="caption" color="text.secondary" display="block">Progress</Typography>
          <ProgressBar value={asgn.summary?.completionRate ?? 0} />
        </Grid>
      </Grid>
    </CardContent>
    <Divider />
    <CardActions sx={{ px: 2, py: 1, gap: 1 }}>
      <Button size="small" startIcon={<VisibilityIcon />} onClick={() => onView(asgn)} sx={{ color: "#084d68" }}>
        View
      </Button>
      {canManage && (
        <Button size="small" startIcon={<SwapHorizIcon />} onClick={() => onReassign(asgn)} sx={{ color: "#084d68" }}>
          Reassign
        </Button>
      )}
      {canManage && (
        <Button size="small" startIcon={<DeleteIcon />} onClick={() => onDelete(asgn)} sx={{ color: "#ef4444", ml: "auto" }}>
          Delete
        </Button>
      )}
    </CardActions>
  </Card>
);

// ─── Selection Modal ──────────────────────────────────────────────────────────
const SelectionModal = ({ open, onClose, title, items, loading, selectedIds, onToggle, onDone, multiSelect = true }) => {
  const [search, setSearch] = useState("");
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter((item) => {
      const text = [
        item.name,
        item.customerName,
        item.fullName,
        item.firstName,
        item.lastName,
        item.email,
        item.role,
        item.teamRole,
        item.customRole,
        item.department,
        item.location,
        item.status,
      ].filter(Boolean).join(" ").toLowerCase();
      return text.includes(q);
    });
  }, [items, search]);

  const isSelected = (id) => (Array.isArray(selectedIds) ? selectedIds.includes(id) : selectedIds === id);

  useEffect(() => { if (!open) setSearch(""); }, [open]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{ sx: { borderRadius: isMobile ? 0 : 2, overflow: "hidden" } }}
    >
      <Box sx={{ background: "linear-gradient(135deg, #0b394a 0%, #114d64 100%)", p: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography fontWeight={700} color="white" variant="h6">{title}</Typography>
          <IconButton onClick={onClose} size="small" sx={{ color: "white", bgcolor: alpha("#fff", 0.1) }}>
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
        <AssetSearchField
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onClear={() => setSearch("")}
          sx={{ bgcolor: "white", borderRadius: 2 }}
        />
      </Box>

      <Box sx={{ flex: 1, overflow: "auto", maxHeight: isMobile ? "none" : 400 }}>
        {loading ? (
          <Box sx={{ py: 6, textAlign: "center" }}><CircularProgress size={28} sx={{ color: "#084d68" }} /></Box>
        ) : filtered.length === 0 ? (
          <Box sx={{ py: 6, textAlign: "center" }}><Typography color="text.secondary">No items found</Typography></Box>
        ) : (
          <List dense disablePadding>
            {filtered.map((item) => {
              const id = item._id || item.id;
              const fullName = `${item.firstName || ""} ${item.lastName || ""}`.trim();
              const name = item.name || item.customerName || item.fullName || fullName || item.assetName || item.email || "Unknown";
              const initialsSource = name !== item.email ? name : item.email || "?";
              const details = [
                item.role || item.teamRole || item.customRole,
                item.department,
                item.location,
                item.status,
              ].filter(Boolean);
              const selected = isSelected(id);
              return (
                <ListItem
                  key={id} divider onClick={() => onToggle(id)}
                  sx={{ py: 1.4, cursor: "pointer", transition: "all 0.2s", "&:hover": { bgcolor: alpha("#084d68", 0.04) }, bgcolor: selected ? alpha("#084d68", 0.04) : "transparent" }}
                >
                  {multiSelect
                    ? <Checkbox checked={selected} size="small" sx={{ mr: 1, color: "#084d68" }} />
                    : <Radio checked={selected} size="small" sx={{ mr: 1, color: "#084d68" }} />}
                  <ListItemAvatar>
                    <Avatar sx={{ width: 36, height: 36, bgcolor: selected ? "#084d68" : alpha("#084d68", 0.1), color: selected ? "white" : "#084d68" }}>
                      {initialsSource.charAt(0).toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={<Typography fontWeight={700} sx={{ fontSize: "13px", color: "#0f172a" }}>{name}</Typography>}
                    secondary={
                      <Box sx={{ mt: 0.25 }}>
                        {item.email && item.email !== name && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: "block", lineHeight: 1.35 }}>
                            {item.email}
                          </Typography>
                        )}
                        {details.length > 0 && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: "block", lineHeight: 1.35 }}>
                            {details.join(" · ")}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                  {selected && <CheckCircleIcon sx={{ fontSize: 12, color: "#10b981" }} />}
                </ListItem>
              );
            })}
          </List>
        )}
      </Box>

      <Box sx={{ p: 2.5, borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="caption" color="text.secondary">
          {Array.isArray(selectedIds) ? `${selectedIds.length} selected` : selectedIds ? "1 selected" : "None selected"}
        </Typography>
        <Stack direction="row" spacing={1.5}>
          <Button variant="outlined" onClick={onClose} sx={{ borderRadius: 2 }}>Cancel</Button>
          <Button variant="contained" onClick={onDone} sx={{ borderRadius: 2, background: "#084d68" }}>Done</Button>
        </Stack>
      </Box>
    </Dialog>
  );
};

// ─── Form Defaults ────────────────────────────────────────────────────────────
const defaultAssignForm = () => ({
  checklistIds: [],
  adminId: "",
  teamMemberIds: [],
  assetIds: [],
  dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
  priority: "medium",
  notes: "",
});

const defaultReassignForm = () => ({
  newAdminId: "",
  teamMemberIds: [],
  assetIds: [],
  dueDate: "",
  priority: "medium",
  reason: "",
  notes: "",
});

// ─── Default Filters ──────────────────────────────────────────────────────────
const defaultFilters = () => ({
  status: "",
  priority: "",
  search: "",
  dateFrom: "",
  dateTo: "",
  page: 1,
  limit: 10,
});

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AssignedChecklist() {
  const { authRequest, user } = useAuth();
  const navigate = useNavigate();
  const { assignToAdmin, assignToTeam, reassignToAdmin, reassignToTeam, getAssignments, getAssignmentStats, softDeleteAssignment, assignLoading } = useAssignment();

  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));
  const isSuperAdmin = user?.role === "super_admin" || user?.role === "superadmin";
  const isAdmin = user?.role === "admin";
  const canManage = isSuperAdmin || isAdmin;

  // ── State ──────────────────────────────────────────────────────────────────
  const [assignments, setAssignments] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState(defaultFilters);
  const [statFilter, setStatFilter] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false); // mobile filter drawer

  // Raw date values bound to the <TextField type="date"> inputs.
  // These stay as plain "YYYY-MM-DD" strings for the native date input.
  // `filters.dateFrom` / `filters.dateTo` (sent to the API) are derived from
  // these as full start-of-day / end-of-day ISO timestamps so the backend
  // range query is inclusive of the entire selected day, regardless of timezone.
  const [rawDateFrom, setRawDateFrom] = useState("");
  const [rawDateTo, setRawDateTo] = useState("");

  const toStartOfDay = (d) => (d ? `${d}T00:00:00.000Z` : "");
  const toEndOfDay = (d) => (d ? `${d}T23:59:59.999Z` : "");

  const [assignOpen, setAssignOpen] = useState(false);
  const [reassignOpen, setReassignOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [assignTouched, setAssignTouched] = useState(false);
  const [reassignTouched, setReassignTouched] = useState(false);

  const [checklists, setChecklists] = useState([]);
  const [checklistsLoading, setChecklistsLoading] = useState(false);
  const [admins, setAdmins] = useState([]);
  const [adminsLoading, setAdminsLoading] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [teamLoading, setTeamLoading] = useState(false);
  const [assets, setAssets] = useState([]);
  const [assetsLoading, setAssetsLoading] = useState(false);

  const [assignForm, setAssignForm] = useState(defaultAssignForm);
  const [reassignForm, setReassignForm] = useState(defaultReassignForm);

  const [modalStates, setModalStates] = useState({
    checklist: false, admin: false, team: false, asset: false,
    reassignAdmin: false, reassignTeam: false, reassignAsset: false,
  });
  const openModal  = (key) => setModalStates((p) => ({ ...p, [key]: true }));
  const closeModal = (key) => setModalStates((p) => ({ ...p, [key]: false }));
  const activeTeamMembers = teamMembers.filter(
    (member) => String(member?.status || "").toLowerCase() === "active",
  );

  const [snack, setSnack] = useState({ open: false, msg: "", severity: "success" });
  const formatToastMessage = useCallback((msg) => {
    const text = String(msg || "").trim();
    if (/already has an active assignment/i.test(text)) {
      return "This team member already has an active assignment for the selected checklist. Complete or remove it first.";
    }
    return text || "Something went wrong. Please try again.";
  }, []);
  const toast = useCallback(
    (msg, severity = "success") =>
      setSnack({ open: true, msg: formatToastMessage(msg), severity }),
    [formatToastMessage],
  );
  const closeSnack = useCallback(() => setSnack((p) => ({ ...p, open: false })), []);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchAssignments = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getAssignments(filters);
      if (result?.success) { setAssignments(result.assignments); setPagination(result.pagination); }
      else toast(result?.error || "Failed to fetch assignments", "error");
    } catch (err) { toast(err?.message || "Failed to fetch assignments", "error"); }
    finally { setLoading(false); }
  }, [getAssignments, filters, toast]);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const result = await getAssignmentStats(filters);
      if (result?.success) setStats(result.stats);
    } catch (err) { console.error("Stats fetch failed:", err); }
    finally { setStatsLoading(false); }
  }, [getAssignmentStats, filters]);

  const fetchChecklists = useCallback(async () => {
    setChecklistsLoading(true);
    try { const res = await authRequest("GET", "/checklists?limit=100&status=published"); setChecklists(res?.checklists ?? []); }
    catch (err) { console.error(err); }
    finally { setChecklistsLoading(false); }
  }, [authRequest]);

  const fetchAdmins = useCallback(async () => {
    if (!isSuperAdmin) return;
    setAdminsLoading(true);
    try { const res = await authRequest("GET", "/clients?status=active&limit=100"); setAdmins(res?.clients ?? []); }
    catch (err) { console.error(err); }
    finally { setAdminsLoading(false); }
  }, [authRequest, isSuperAdmin]);

  const fetchTeamMembers = useCallback(async () => {
    if (!isAdmin) return;
    setTeamLoading(true);
    try { const res = await authRequest("GET", "/team?limit=100"); setTeamMembers(res?.members ?? []); }
    catch (err) { console.error(err); }
    finally { setTeamLoading(false); }
  }, [authRequest, isAdmin]);

  const fetchAssets = useCallback(async () => {
    if (!isAdmin) return;
    setAssetsLoading(true);
    try { const res = await authRequest("GET", "/assets"); setAssets(res?.assets ?? []); }
    catch (err) { console.error(err); }
    finally { setAssetsLoading(false); }
  }, [authRequest, isAdmin]);

  useEffect(() => {
    fetchAssignments(); fetchStats(); fetchChecklists();
    if (isSuperAdmin) fetchAdmins();
    if (isAdmin) { fetchTeamMembers(); fetchAssets(); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Filter Handler ─────────────────────────────────────────────────────────
  const handleFilterChange = (key, value) => {
    let newFilters;

    if (key === "page") {
      newFilters = { ...filters, page: value };
    } else if (key === "dateFrom") {
      setStatFilter("");
      setRawDateFrom(value);
      newFilters = { ...filters, dateFrom: toStartOfDay(value), page: 1 };
    } else if (key === "dateTo") {
      setStatFilter("");
      setRawDateTo(value);
      newFilters = { ...filters, dateTo: toEndOfDay(value), page: 1 };
    } else {
      setStatFilter("");
      newFilters = { ...filters, [key]: value, page: 1 };
    }

    setFilters(newFilters);
    const queryFilters = key === "page" && statFilter
      ? { ...newFilters, status: statFilter }
      : newFilters;

    getAssignments(queryFilters).then((res) => {
      if (res?.success) { setAssignments(res.assignments); setPagination(res.pagination); }
    });
    if (key !== "page") {
      getAssignmentStats(queryFilters).then((res) => {
        if (res?.success) setStats(res.stats);
      });
    }
  };

  const clearFilters = () => {
    const df = defaultFilters();
    setStatFilter("");
    setFilters(df);
    setRawDateFrom("");
    setRawDateTo("");
    getAssignments(df).then((res) => {
      if (res?.success) { setAssignments(res.assignments); setPagination(res.pagination); }
    });
    getAssignmentStats(df).then((res) => {
      if (res?.success) setStats(res.stats);
    });
  };

  // ── Navigation ─────────────────────────────────────────────────────────────
  const handleViewDetails = (asgn) => navigate(`/admin/assigned-checklists/${asgn._id}`);

  // ── Assign Modal ───────────────────────────────────────────────────────────
  const openAssignModal = () => { setAssignForm(defaultAssignForm()); setAssignTouched(false); setAssignOpen(true); };
  const closeAssignModal = () => { setAssignOpen(false); setAssignTouched(false); };

  // ── Reassign Modal ─────────────────────────────────────────────────────────
  const openReassignModal = (asgn) => {
    setSelected(asgn);
    setReassignForm({ ...defaultReassignForm(), dueDate: asgn.dueDate?.split("T")[0] ?? "", priority: asgn.priority ?? "medium" });
    setReassignTouched(false);
    setReassignOpen(true);
  };
  const closeReassignModal = () => { setReassignOpen(false); setSelected(null); setReassignTouched(false); };

  // ── Assign Submit ──────────────────────────────────────────────────────────
  const handleAssign = async () => {
    setAssignTouched(true);
    if (!assignForm.checklistIds.length) { toast("Select at least one checklist", "error"); return; }
    if (isSuperAdmin && !assignForm.adminId) { toast("Please select an admin", "error"); return; }
    if (!isSuperAdmin && !assignForm.teamMemberIds.length) { toast("Select at least one team member", "error"); return; }
    setSubmitting(true);
    try {
      let result;
      if (isSuperAdmin) {
        result = await assignToAdmin({ checklistIds: assignForm.checklistIds, adminId: assignForm.adminId, dueDate: assignForm.dueDate, priority: assignForm.priority, notes: assignForm.notes });
      } else {
        result = await assignToTeam({ checklistIds: assignForm.checklistIds, assetIds: assignForm.assetIds, teamMemberIds: assignForm.teamMemberIds, dueDate: assignForm.dueDate, priority: assignForm.priority, notes: assignForm.notes });
      }
      if (result?.success) { toast("Checklist assigned successfully!"); closeAssignModal(); setAssignForm(defaultAssignForm()); fetchAssignments(); fetchStats(); }
      else toast(result?.error || "Assignment failed", "error");
    } catch (err) { toast(err?.message || "Assignment failed", "error"); }
    finally { setSubmitting(false); }
  };

  // ── Reassign Submit ────────────────────────────────────────────────────────
  const handleReassign = async () => {
    if (!selected) return;
    setReassignTouched(true);
    if (!reassignForm.reason.trim()) { toast("Provide a reason for re-assignment", "error"); return; }
    if (isSuperAdmin && !reassignForm.newAdminId) { toast("Please select a new admin", "error"); return; }
    if (!isSuperAdmin && !reassignForm.teamMemberIds.length) { toast("Select at least one team member", "error"); return; }
    setSubmitting(true);
    try {
      let result;
      if (isSuperAdmin) {
        result = await reassignToAdmin(selected._id, { newAdminId: reassignForm.newAdminId, dueDate: reassignForm.dueDate, priority: reassignForm.priority, notes: reassignForm.notes, reason: reassignForm.reason });
      } else {
        result = await reassignToTeam(selected._id, { teamMemberIds: reassignForm.teamMemberIds, dueDate: reassignForm.dueDate, priority: reassignForm.priority, notes: reassignForm.notes, reason: reassignForm.reason, assetIds: reassignForm.assetIds });
      }
      if (result?.success) { toast("Re-assigned successfully!"); closeReassignModal(); setReassignForm(defaultReassignForm()); fetchAssignments(); fetchStats(); }
      else toast(result?.error || "Re-assignment failed", "error");
    } catch (err) { toast(err?.message || "Re-assignment failed", "error"); }
    finally { setSubmitting(false); }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleSoftDelete = async () => {
    if (!selected) return;
    setDeleting(true);
    try {
      const result = await softDeleteAssignment(selected._id);
      if (result?.success) { toast("Assignment deleted"); setDeleteOpen(false); setSelected(null); fetchAssignments(); fetchStats(); }
      else toast(result?.error || "Delete failed", "error");
    } catch (err) { toast(err?.message || "Delete failed", "error"); }
    finally { setDeleting(false); }
  };

  // ── Stat Cards Config ──────────────────────────────────────────────────────
  const pendingApprovalCount =
    (stats?.byStatus?.pending_approval ?? 0) + (stats?.byStatus?.in_progress ?? 0);

  const handleStatCardClick = useCallback((status) => {
    if (!status) {
      clearFilters();
      return;
    }

    const newFilters = defaultFilters();
    const queryFilters = { ...newFilters, status, page: 1 };
    setStatFilter(status);
    setRawDateFrom("");
    setRawDateTo("");
    setFilters(newFilters);
    getAssignments(queryFilters).then((res) => {
      if (res?.success) { setAssignments(res.assignments); setPagination(res.pagination); }
    });
  }, [clearFilters, getAssignments]);

  const statCards = useMemo(() => [
    { label: "Total Assignments", value: stats?.total ?? 0,                                                              icon: AssignmentIcon,   color: "#084d68", trend: "+12%", subtitle: "All active records", filterStatus: "" },
    { label: "Pending Assignments",           value: stats?.byStatus?.pending ?? 0,                                                  icon: PendingActionsIcon, color: "#f59e0b", trend: "+5%",  subtitle: "Awaiting action", filterStatus: "pending" },
    { label: "Pending Approval Assignments",  value: pendingApprovalCount,                                                           icon: PendingActionsIcon, color: "#3b82f6", trend: "+8%",  subtitle: "Waiting for approval", filterStatus: "pending_approval" },
    { label: "Submitted Assignments",         value: stats?.byStatus?.submitted ?? 0,                                                 icon: CheckCircleIcon, color: "#10b981", trend: "+6%",  subtitle: "Sent for review", filterStatus: "submitted" },
    { label: "Overdue Assignments",           value: stats?.overdue ?? 0,                                                            icon: WarningAmberIcon, color: "#ef4444", trend: "+2%",  subtitle: "Past due date", filterStatus: "overdue" },
  ], [pendingApprovalCount, stats]);

  const hasFilters = !!(filters.status || filters.priority || filters.search || filters.dateFrom || filters.dateTo);

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
        <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 }, px: { xs: 1.5, sm: 2, md: 3 } }}>

          {/* ── Header ── */}
          <Fade in timeout={400}>
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: { xs: "flex-start", sm: "center" }, flexWrap: "wrap", gap: 2 }}>
                <Box>
                  <GradientText variant={isXs ? "h6" : isMobile ? "h5" : "h5"} fontWeight={700}>
                    Assignment Management
                  </GradientText>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontSize: { xs: "0.78rem", md: "0.875rem" } }}>
                    {isSuperAdmin
                      ? "Assign checklists to admins and track progress"
                      : isAdmin
                        ? "Manage team assignments and monitor completion"
                        : "Track your assigned checklists and submissions"}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Tooltip title="Refresh">
                    <IconButton onClick={fetchAssignments} disabled={loading} sx={{ bgcolor: "white", border: "1px solid #e2e8f0", borderRadius: 2 }}>
                      <RefreshIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  {canManage && (
                    <Button
                      variant="contained"
                      startIcon={isSuperAdmin ? <PersonSearchIcon /> : <GroupAddIcon />}
                      onClick={openAssignModal}
                      size={isXs ? "small" : "medium"}
                      sx={{ background: "linear-gradient(135deg, #1e5f79 0%, #175f7b 100%)" }}
                    >
                      {isXs ? "Assign" : isSuperAdmin ? "Assign to Admin" : "Assign to Team"}
                    </Button>
                  )}
                </Stack>
              </Box>
            </Box>
          </Fade>

          {/* ── Stat Cards: 2 columns on xs/sm, 5 on md+ ── */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(2, minmax(0, 1fr))",
                sm: "repeat(2, minmax(0, 1fr))",
                md: "repeat(5, minmax(0, 1fr))",
              },
              gap: { xs: 1.5, md: 2.5 },
              mb: 3,
            }}
          >
            {statCards.map((card, i) => (
              <Box
                key={i}
                sx={{
                  minWidth: 0,
                  gridColumn: card.filterStatus === "overdue"
                    ? { xs: "1 / -1", sm: "1 / -1", md: "auto" }
                    : "auto",
                }}
              >
                <ModernStatCard
                  {...card}
                  loading={statsLoading}
                  active={statFilter ? statFilter === card.filterStatus : !card.filterStatus && !hasFilters}
                  onClick={() => handleStatCardClick(card.filterStatus)}
                />
              </Box>
            ))}
          </Box>

          {/* ── Filters Bar ── */}
          <Paper sx={{ mb: 2.5, p: { xs: 1.5, md: 2 }, borderRadius: 1 }}>
            {/* Mobile: search + filter toggle */}
            {isMobile ? (
              <>
                <Stack direction="row" spacing={1} alignItems="center">
                  <AssetSearchField
                    placeholder="Search..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange("search", e.target.value)}
                    onClear={() => handleFilterChange("search", "")}
                  />
                  <IconButton
                    onClick={() => setFiltersOpen((p) => !p)}
                    sx={{ border: `1px solid ${hasFilters ? "#084d68" : "#e2e8f0"}`, borderRadius: 2, color: hasFilters ? "#084d68" : "inherit", bgcolor: hasFilters ? alpha("#084d68", 0.06) : "transparent" }}
                  >
                    <FilterListIcon fontSize="small" />
                  </IconButton>
                </Stack>
                {filtersOpen && (
                  <>
                    <Box
                      onClick={() => setFiltersOpen(false)}
                      sx={{
                        position: "fixed",
                        inset: 0,
                        zIndex: (theme) => theme.zIndex.modal,
                        bgcolor: "rgba(15, 23, 42, 0.36)",
                        backdropFilter: "blur(2px)",
                      }}
                    />
                    <Box
                      sx={{
                        position: "fixed",
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: (theme) => theme.zIndex.modal + 1,
                        bgcolor: "background.paper",
                        borderRadius: "24px 24px 0 0",
                        boxShadow: "0 -18px 56px rgba(15, 23, 42, 0.28)",
                        px: 2,
                        pt: 1.5,
                        pb: "calc(18px + env(safe-area-inset-bottom))",
                        maxHeight: "82vh",
                        overflowY: "auto",
                      }}
                    >
                      <Box sx={{ width: 44, height: 5, borderRadius: 999, bgcolor: "#dbe3ea", mx: "auto", mb: 2 }} />
                      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <FilterListIcon sx={{ fontSize: 18, color: "#084d68" }} />
                          <Typography fontWeight={800} color="#084d68">Filters</Typography>
                        </Stack>
                        <IconButton size="small" onClick={() => setFiltersOpen(false)}>
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                      <Stack spacing={1.25}>
                        <FormControl size="small" fullWidth>
                          <Select value={filters.status} onChange={(e) => handleFilterChange("status", e.target.value)} displayEmpty>
                            <MenuItem value="">All Status</MenuItem>
                            {STATUS_FILTER_OPTIONS.map(([k, cfg]) => (
                              <MenuItem key={k} value={k}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                  <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: cfg.color }} />{cfg.label}
                                </Box>
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <FormControl size="small" fullWidth>
                          <Select value={filters.priority} onChange={(e) => handleFilterChange("priority", e.target.value)} displayEmpty>
                            <MenuItem value="">All Priority</MenuItem>
                            {Object.entries(PRIORITY_CFG).map(([k, cfg]) => (
                              <MenuItem key={k} value={k}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                  <Box sx={{ width: 14, height: 14, borderRadius: "50%", bgcolor: cfg.color }} />
                                  {cfg.label}
                                </Box>
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <TextField
                          size="small"
                          type="date"
                          label="Due From"
                          value={rawDateFrom}
                          onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
                          InputLabelProps={{ shrink: true }}
                          inputProps={{ max: rawDateTo || undefined }}
                          InputProps={{ startAdornment: (<InputAdornment position="start"><CalendarMonthIcon sx={{ fontSize: 16, color: "#94a3b8" }} /></InputAdornment>) }}
                          fullWidth
                        />
                        <TextField
                          size="small"
                          type="date"
                          label="Due To"
                          value={rawDateTo}
                          onChange={(e) => handleFilterChange("dateTo", e.target.value)}
                          InputLabelProps={{ shrink: true }}
                          inputProps={{ min: rawDateFrom || undefined }}
                          InputProps={{ startAdornment: (<InputAdornment position="start"><CalendarMonthIcon sx={{ fontSize: 16, color: "#94a3b8" }} /></InputAdornment>) }}
                          fullWidth
                        />
                        {hasFilters && (
                          <Button onClick={clearFilters} startIcon={<ClearIcon />} sx={{ color: "#ef4444", alignSelf: "flex-start" }} size="small">
                            Clear Filters
                          </Button>
                        )}
                      </Stack>
                    </Box>
                  </>
                )}
              </>
            ) : (
              // Desktop: all filters in one row
              <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap>
                <AssetSearchField
                  placeholder="Search by checklist or assignee..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  onClear={() => handleFilterChange("search", "")}
                  sx={{ flex: 2, minWidth: 200 }}
                />
                <FormControl size="small" sx={{ minWidth: 140 }}>
                  <Select value={filters.status} onChange={(e) => handleFilterChange("status", e.target.value)} displayEmpty>
                    <MenuItem value="">All Status</MenuItem>
                    {STATUS_FILTER_OPTIONS.map(([k, cfg]) => (
                      <MenuItem key={k} value={k}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: cfg.color }} />{cfg.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 130 }}>
                  <Select value={filters.priority} onChange={(e) => handleFilterChange("priority", e.target.value)} displayEmpty>
                    <MenuItem value="">All Priority</MenuItem>
                    {Object.entries(PRIORITY_CFG).map(([k, cfg]) => (
                      <MenuItem key={k} value={k}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Box sx={{ width: 14, height: 14, borderRadius: "50%", bgcolor: cfg.color }} />
                          {cfg.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  size="small"
                  type="date"
                  label="Due From"
                  value={rawDateFrom}
                  onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ max: rawDateTo || undefined }}
                  sx={{ minWidth: 155 }}
                />
                <TextField
                  size="small"
                  type="date"
                  label="Due To"
                  value={rawDateTo}
                  onChange={(e) => handleFilterChange("dateTo", e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ min: rawDateFrom || undefined }}
                  sx={{ minWidth: 155 }}
                />
                {hasFilters && (
                  <Button onClick={clearFilters} startIcon={<ClearIcon />} sx={{ color: "#ef4444", whiteSpace: "nowrap" }}>
                    Clear Filters
                  </Button>
                )}
                <Typography variant="caption" color="text.disabled" sx={{ ml: "auto", whiteSpace: "nowrap" }}>
                  {assignments.length} of {pagination.total}
                </Typography>
              </Stack>
            )}
          </Paper>

          {/* ── Content ── */}
          {loading ? (
            <Paper sx={{ p: 6, textAlign: "center", borderRadius: 1 }}>
              <CircularProgress sx={{ color: "#084d68" }} />
              <Skeleton height={60} sx={{ mt: 3 }} /><Skeleton height={60} /><Skeleton height={60} />
            </Paper>
          ) : assignments.length === 0 ? (
            <Paper sx={{ p: { xs: 5, md: 8 }, textAlign: "center", borderRadius: 1 }}>
              <Avatar sx={{ width: 80, height: 80, bgcolor: alpha("#084d68", 0.1), mx: "auto", mb: 2 }}>
                <AssignmentIcon sx={{ fontSize: 40, color: "#084d68" }} />
              </Avatar>
              <Typography variant="h6" fontWeight={700}>No assignments found</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {hasFilters ? "Try adjusting your filters" : canManage ? "Create your first assignment using the button above" : "You have no assignments yet"}
              </Typography>
            </Paper>
          ) : isMobile ? (
            // ── Mobile: Card List ──
            <Box>
              {assignments.map((asgn, idx) => (
                <Fade in timeout={200 + idx * 30} key={asgn._id}>
                  <div>
                    <MobileAssignmentCard
                      asgn={asgn}
                      canManage={canManage}
                      onView={handleViewDetails}
                      onReassign={openReassignModal}
                      onDelete={(a) => { setSelected(a); setDeleteOpen(true); }}
                    />
                  </div>
                </Fade>
              ))}
              {pagination.totalPages > 1 && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                  <Pagination count={pagination.totalPages} page={filters.page} onChange={(_, p) => handleFilterChange("page", p)} color="primary" shape="rounded" size="small" />
                </Box>
              )}
            </Box>
          ) : (
            // ── Desktop: Table ──
            <Paper sx={{ borderRadius: 1, overflow: "hidden" }}>
              <TableContainer sx={{ overflowX: "auto" }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#f8fafc" }}>
                      {["Checklist", "Assigned To", "Due Date", "Priority", "Status", "Progress", "Actions"].map((h) => (
                        <TableCell key={h} align={h === "Actions" ? "center" : "left"} sx={{ fontWeight: 700, fontSize: 12, color: "#64748b", whiteSpace: "nowrap" }}>{h}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {assignments.map((asgn, idx) => (
                      <Fade in timeout={200 + idx * 30} key={asgn._id}>
                        <TableRow hover sx={{ "&:hover": { bgcolor: alpha("#084d68", 0.02) } }}>
                          <TableCell>
                            <Typography fontWeight={700} variant="body2">
                              {asgn.checklistData?.[0]?.name ?? asgn.checklistIds?.[0]?.name ?? "—"}
                            </Typography>
                            <Typography variant="caption" color="text.disabled">#{asgn._id?.slice(-8)}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight={500}>
                              {getAssignedToLabel(asgn)}
                            </Typography>
                          </TableCell>
                          <TableCell><DateCell date={asgn.dueDate} /></TableCell>
                          <TableCell><PriorityChip priority={asgn.priority} /></TableCell>
                          <TableCell><StatusChip status={asgn.status} /></TableCell>
                          <TableCell><ProgressBar value={asgn.summary?.completionRate ?? 0} /></TableCell>
                          <TableCell align="center">
                            <Stack direction="row" spacing={0.5} justifyContent="center">
                              <Tooltip title="View Details">
                                <IconButton size="small" onClick={() => handleViewDetails(asgn)} sx={{ borderRadius: 1.5, color: "#084d68", "&:hover": { bgcolor: alpha("#084d68", 0.08) } }}>
                                  <VisibilityIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                              </Tooltip>
                              {canManage && (
                                <Tooltip title="Re-assign">
                                  <IconButton size="small" onClick={() => openReassignModal(asgn)} sx={{ borderRadius: 1.5, color: "#084d68" }}>
                                    <SwapHorizIcon sx={{ fontSize: 18 }} />
                                  </IconButton>
                                </Tooltip>
                              )}
                              {canManage && (
                                <Tooltip title="Delete">
                                  <IconButton size="small" onClick={() => { setSelected(asgn); setDeleteOpen(true); }} sx={{ borderRadius: 1.5, color: "#ef4444" }}>
                                    <DeleteIcon sx={{ fontSize: 18 }} />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </Stack>
                          </TableCell>
                        </TableRow>
                      </Fade>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              {pagination.totalPages > 1 && (
                <Box sx={{ p: 2.5, display: "flex", justifyContent: "center", borderTop: "1px solid #e2e8f0" }}>
                  <Pagination count={pagination.totalPages} page={filters.page} onChange={(_, p) => handleFilterChange("page", p)} color="primary" shape="rounded" />
                </Box>
              )}
            </Paper>
          )}
        </Container>
      </Box>

      {/* ── Details Dialog ── */}
      <Dialog
        open={detailsOpen}
        onClose={() => { setDetailsOpen(false); setSelected(null); }}
        maxWidth="md"
        fullWidth
        fullScreen={isXs}
        PaperProps={{ sx: { borderRadius: isXs ? 0 : 4 } }}
      >
        {selected && (
          <>
            <Box sx={{ background: `linear-gradient(135deg, ${STATUS_CFG[selected.status?.toLowerCase()]?.color || "#6366f1"} 0%, ${STATUS_CFG[selected.status?.toLowerCase()]?.color || "#8b5cf6"} 100%)`, p: 3 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <Box>
                  <Typography color="white" fontWeight={800} variant="h6">
                    {selected.checklistData?.[0]?.name ?? selected.checklistIds?.[0]?.name ?? "Assignment"}
                  </Typography>
                  <Typography variant="caption" sx={{ color: alpha("#fff", 0.75) }}>#{selected._id?.slice(-8)}</Typography>
                </Box>
                <IconButton onClick={() => { setDetailsOpen(false); setSelected(null); }} size="small" sx={{ color: "white", bgcolor: alpha("#fff", 0.2) }}>
                  <CloseIcon />
                </IconButton>
              </Box>
            </Box>
            <DialogContent sx={{ p: { xs: 2, md: 3 } }}>
              <Stack spacing={2.5}>
                <Grid container spacing={2}>
                  {[
                    { label: "Status", content: <StatusChip status={selected.status} /> },
                    { label: "Priority", content: <PriorityChip priority={selected.priority} /> },
                    { label: "Due Date", content: <DateCell date={selected.dueDate} /> },
                    { label: "Progress", content: <ProgressBar value={selected.summary?.completionRate ?? 0} /> },
                  ].map(({ label, content }) => (
                    <Grid item xs={6} sm={3} key={label}>
                      <Typography variant="caption" color="text.secondary">{label}</Typography>
                      <Box sx={{ mt: 0.5 }}>{content}</Box>
                    </Grid>
                  ))}
                </Grid>
                <Paper sx={{ p: 2.5, bgcolor: "#f8fafc", borderRadius: 3 }}>
                  <Typography variant="caption" fontWeight={700} color="text.secondary">Assignment Info</Typography>
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} sm={6}><Typography variant="caption" color="text.secondary">Customer</Typography><Typography fontWeight={500}>{selected.customerName ?? "—"}</Typography></Grid>
                    <Grid item xs={12} sm={6}><Typography variant="caption" color="text.secondary">Assigned By</Typography><Typography fontWeight={500}>{selected.assignedBy?.email ?? "—"}</Typography></Grid>
                    <Grid item xs={12}><Typography variant="caption" color="text.secondary">Notes</Typography><Typography variant="body2">{selected.notes ?? "—"}</Typography></Grid>
                  </Grid>
                </Paper>
              </Stack>
            </DialogContent>
            <DialogActions sx={{ p: { xs: 2, md: 2.5 } }}>
              <Button onClick={() => { setDetailsOpen(false); setSelected(null); }} variant="outlined">Close</Button>
              <Button variant="contained" onClick={() => { setDetailsOpen(false); handleViewDetails(selected); }} startIcon={<ArrowForwardIcon />} sx={{ background: "#084d68" }}>
                View Full Details
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* ── Delete Dialog ── */}
      <Dialog
        open={deleteOpen}
        onClose={() => { setDeleteOpen(false); setSelected(null); }}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, mx: 2 } }}
      >
        <DialogTitle>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar sx={{ bgcolor: alpha("#ef4444", 0.1), color: "#ef4444" }}><WarningIcon /></Avatar>
            <Typography fontWeight={800}>Delete Assignment</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2">Are you sure you want to delete this assignment? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button onClick={() => { setDeleteOpen(false); setSelected(null); }} variant="outlined" disabled={deleting}>Cancel</Button>
          <Button
            onClick={handleSoftDelete}
            variant="contained"
            color="error"
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={15} /> : <DeleteIcon />}
            sx={{ background: "#d21e1e", "&:hover": { background: "#b71414", boxShadow: "0 4px 12px rgba(210,30,30,0.35)" }, "&:active": { background: "#9c1010" } }}
          >
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Assign Dialog ── */}
      <Dialog
        open={assignOpen}
        onClose={closeAssignModal}
        maxWidth="sm"
        fullWidth
        fullScreen={isXs}
        PaperProps={{ sx: { borderRadius: isXs ? 0 : 3 } }}
      >
        <Box sx={{ background: "linear-gradient(135deg, #084d68 0%, #0b3a4c 100%)", p: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            {isSuperAdmin ? <PersonSearchIcon sx={{ color: "white" }} /> : <GroupAddIcon sx={{ color: "white" }} />}
            <Typography color="white" fontWeight={800} variant="h6">{isSuperAdmin ? "Assign to Admin" : "Assign to Team"}</Typography>
          </Box>
          <IconButton onClick={closeAssignModal} size="small" sx={{ color: "white", bgcolor: alpha("#fff", 0.15) }}><CloseIcon /></IconButton>
        </Box>
        <DialogContent sx={{ p: { xs: 2, md: 3 } }}>
          <Stack spacing={2.5}>
            <Box>
              <Button
                variant="outlined" fullWidth onClick={() => openModal("checklist")} startIcon={<DescriptionIcon />}
                sx={{ borderColor: assignTouched && assignForm.checklistIds.length === 0 ? "#ef4444" : undefined, color: assignTouched && assignForm.checklistIds.length === 0 ? "#ef4444" : undefined }}
              >
                {assignForm.checklistIds.length === 0 ? "Select Checklists (Required)" : ` ${assignForm.checklistIds.length} selected`}
              </Button>
              {assignTouched && assignForm.checklistIds.length === 0 && <Typography variant="caption" color="error" sx={{ mt: 0.5, display: "block" }}>Please select at least one checklist</Typography>}
            </Box>
            {isSuperAdmin && (
              <Box>
                <Button
                  variant="outlined" fullWidth onClick={() => openModal("admin")} startIcon={<PersonAddIcon />}
                  sx={{ borderColor: assignTouched && !assignForm.adminId ? "#ef4444" : undefined, color: assignTouched && !assignForm.adminId ? "#ef4444" : undefined }}
                >
                  {assignForm.adminId ? `✓ ${admins.find((a) => (a._id || a.id) === assignForm.adminId)?.customerName || "Admin selected"}` : "Select Admin (Required)"}
                </Button>
                {assignTouched && !assignForm.adminId && <Typography variant="caption" color="error" sx={{ mt: 0.5, display: "block" }}>Please select an admin to continue</Typography>}
              </Box>
            )}
            {!isSuperAdmin && (
              <Box>
                <Button
                  variant="outlined" fullWidth onClick={() => openModal("team")} startIcon={<PeopleIcon />}
                  sx={{ borderColor: assignTouched && assignForm.teamMemberIds.length === 0 ? "#ef4444" : undefined, color: assignTouched && assignForm.teamMemberIds.length === 0 ? "#ef4444" : undefined }}
                >
                  {assignForm.teamMemberIds.length === 0 ? "Select Team Members (Required)" : ` ${assignForm.teamMemberIds.length} selected`}
                </Button>
                {assignTouched && assignForm.teamMemberIds.length === 0 && <Typography variant="caption" color="error" sx={{ mt: 0.5, display: "block" }}>Please select at least one team member</Typography>}
              </Box>
            )}
            {!isSuperAdmin && (
              <Button variant="outlined" fullWidth onClick={() => openModal("asset")} startIcon={<InventoryIcon />}>
                {assignForm.assetIds.length === 0 ? "Select Assets (Optional)" : `${assignForm.assetIds.length} selected`}
              </Button>
            )}
            <TextField fullWidth type="date" label="Due Date" value={assignForm.dueDate} onChange={(e) => setAssignForm((p) => ({ ...p, dueDate: e.target.value }))} InputLabelProps={{ shrink: true }} required />
            <TextField fullWidth multiline rows={3} label="Notes" value={assignForm.notes} onChange={(e) => setAssignForm((p) => ({ ...p, notes: e.target.value }))} placeholder="Add instructions or context..." />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: { xs: 2, md: 3 }, pt: 0, gap: 1 }}>
          <Button onClick={closeAssignModal} variant="outlined">Cancel</Button>
          <Button onClick={handleAssign} variant="contained" disabled={submitting || assignLoading} startIcon={submitting ? <CircularProgress size={15} /> : <SendIcon />} sx={{ background: "linear-gradient(135deg, #1e5f79 0%, #175f7b 100%)" }}>
            {submitting ? "Assigning..." : "Assign"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Reassign Dialog ── */}
      <Dialog
        open={reassignOpen}
        onClose={closeReassignModal}
        maxWidth="sm"
        fullWidth
        fullScreen={isXs}
        PaperProps={{ sx: { borderRadius: isXs ? 0 : 3 } }}
      >
        <Box sx={{ background: "linear-gradient(135deg, #084d68 0%, #165f7c 100%)", p: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <SwapHorizIcon sx={{ color: "white" }} />
            <Typography color="white" fontWeight={800} variant="h6">Re-assign Assignment</Typography>
          </Box>
          <IconButton onClick={closeReassignModal} size="small" sx={{ color: "white", bgcolor: alpha("#fff", 0.15) }}><CloseIcon /></IconButton>
        </Box>
        <DialogContent sx={{ p: { xs: 2, md: 3 } }}>
          <Stack spacing={2.5}>
            <TextField
              fullWidth multiline rows={2} label="Reason *" value={reassignForm.reason}
              onChange={(e) => setReassignForm((p) => ({ ...p, reason: e.target.value }))}
              placeholder="Why is this being re-assigned?" required
              error={reassignTouched && !reassignForm.reason.trim()}
              helperText={reassignTouched && !reassignForm.reason.trim() && "Reason is required"}
            />
            {isSuperAdmin && (
              <Box>
                <Button
                  variant="outlined" fullWidth onClick={() => openModal("reassignAdmin")} startIcon={<PersonAddIcon />}
                  sx={{ borderColor: reassignTouched && !reassignForm.newAdminId ? "#ef4444" : undefined, color: reassignTouched && !reassignForm.newAdminId ? "#ef4444" : undefined }}
                >
                  {reassignForm.newAdminId ? `✓ ${admins.find((a) => (a._id || a.id) === reassignForm.newAdminId)?.customerName || "New Admin selected"}` : "Select New Admin (Required)"}
                </Button>
                {reassignTouched && !reassignForm.newAdminId && <Typography variant="caption" color="error" sx={{ mt: 0.5, display: "block" }}>Please select a new admin to re-assign</Typography>}
              </Box>
            )}
            {!isSuperAdmin && (
              <Box>
                <Button
                  variant="outlined" fullWidth onClick={() => openModal("reassignTeam")} startIcon={<PeopleIcon />}
                  sx={{ borderColor: reassignTouched && reassignForm.teamMemberIds.length === 0 ? "#ef4444" : undefined, color: reassignTouched && reassignForm.teamMemberIds.length === 0 ? "#ef4444" : undefined }}
                >
                  {reassignForm.teamMemberIds.length === 0 ? "Select Team Members (Required)" : ` ${reassignForm.teamMemberIds.length} selected`}
                </Button>
                {reassignTouched && reassignForm.teamMemberIds.length === 0 && <Typography variant="caption" color="error" sx={{ mt: 0.5, display: "block" }}>Please select at least one team member</Typography>}
              </Box>
            )}
            {!isSuperAdmin && (
              <Button variant="outlined" fullWidth onClick={() => openModal("reassignAsset")} startIcon={<InventoryIcon />}>
                {reassignForm.assetIds.length === 0 ? "Select Assets (Optional)" : ` ${reassignForm.assetIds.length} selected`}
              </Button>
            )}
            <TextField fullWidth type="date" label="New Due Date" value={reassignForm.dueDate} onChange={(e) => setReassignForm((p) => ({ ...p, dueDate: e.target.value }))} InputLabelProps={{ shrink: true }} />
            <TextField fullWidth multiline rows={2} label="Additional Notes" value={reassignForm.notes} onChange={(e) => setReassignForm((p) => ({ ...p, notes: e.target.value }))} placeholder="Extra instructions..." />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: { xs: 2, md: 3 }, pt: 0, gap: 1 }}>
          <Button onClick={closeReassignModal} variant="outlined">Cancel</Button>
          <Button onClick={handleReassign} variant="contained" disabled={submitting || assignLoading} startIcon={submitting ? <CircularProgress size={15} /> : <SwapHorizIcon />} sx={{ background: "#084d68" }}>
            {submitting ? "Re-assigning..." : "Re-assign"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Selection Modals ── */}
      <SelectionModal open={modalStates.checklist}      onClose={() => closeModal("checklist")}      title="Select Checklists"    items={checklists}   loading={checklistsLoading} selectedIds={assignForm.checklistIds}     onToggle={(id) => setAssignForm((p) => ({ ...p, checklistIds: p.checklistIds.includes(id) ? p.checklistIds.filter((i) => i !== id) : [...p.checklistIds, id] }))} onDone={() => closeModal("checklist")} />
      <SelectionModal open={modalStates.admin}          onClose={() => closeModal("admin")}          title="Select Admin"         items={admins}       loading={adminsLoading}     selectedIds={assignForm.adminId}         onToggle={(id) => setAssignForm((p) => ({ ...p, adminId: id }))}                                                                                                         onDone={() => closeModal("admin")}      multiSelect={false} />
      <SelectionModal open={modalStates.reassignAdmin}  onClose={() => closeModal("reassignAdmin")}  title="Select New Admin"     items={admins}       loading={adminsLoading}     selectedIds={reassignForm.newAdminId}    onToggle={(id) => setReassignForm((p) => ({ ...p, newAdminId: id }))}                                                                                                    onDone={() => closeModal("reassignAdmin")} multiSelect={false} />
      <SelectionModal open={modalStates.team}           onClose={() => closeModal("team")}           title="Select Team Members"  items={activeTeamMembers}  loading={teamLoading}       selectedIds={assignForm.teamMemberIds}   onToggle={(id) => setAssignForm((p) => ({ ...p, teamMemberIds: p.teamMemberIds.includes(id) ? p.teamMemberIds.filter((i) => i !== id) : [...p.teamMemberIds, id] }))}  onDone={() => closeModal("team")} />
      <SelectionModal open={modalStates.asset}          onClose={() => closeModal("asset")}          title="Select Assets"        items={assets}       loading={assetsLoading}     selectedIds={assignForm.assetIds}        onToggle={(id) => setAssignForm((p) => ({ ...p, assetIds: p.assetIds.includes(id) ? p.assetIds.filter((i) => i !== id) : [...p.assetIds, id] }))}                        onDone={() => closeModal("asset")} />
      <SelectionModal open={modalStates.reassignTeam}   onClose={() => closeModal("reassignTeam")}   title="Select Team Members"  items={activeTeamMembers}  loading={teamLoading}       selectedIds={reassignForm.teamMemberIds} onToggle={(id) => setReassignForm((p) => ({ ...p, teamMemberIds: p.teamMemberIds.includes(id) ? p.teamMemberIds.filter((i) => i !== id) : [...p.teamMemberIds, id] }))} onDone={() => closeModal("reassignTeam")} />
      <SelectionModal open={modalStates.reassignAsset}  onClose={() => closeModal("reassignAsset")}  title="Select Assets"        items={assets}       loading={assetsLoading}     selectedIds={reassignForm.assetIds}      onToggle={(id) => setReassignForm((p) => ({ ...p, assetIds: p.assetIds.includes(id) ? p.assetIds.filter((i) => i !== id) : [...p.assetIds, id] }))}                     onDone={() => closeModal("reassignAsset")} />

      {/* ── Snackbar ── */}
      <Snackbar open={snack.open} autoHideDuration={4000} onClose={closeSnack} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <Alert severity={snack.severity} onClose={closeSnack} sx={{ borderRadius: 3, fontWeight: 600 }}>{snack.msg}</Alert>
      </Snackbar>
    </ThemeProvider>
  );
}

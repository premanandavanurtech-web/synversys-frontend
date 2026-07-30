// pages/admin/TeamMemberDetails.jsx - Updated with Edit Modal
import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Avatar,
  Chip,
  Button,
  IconButton,
  Divider,
  Stack,
  CircularProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Badge,
  Tooltip,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationOnIcon,
  CalendarToday as CalendarTodayIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Description as DescriptionIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  AccessTime as AccessTimeIcon,
  WorkspacePremium as WorkspacePremiumIcon,
  TrendingUp as TrendingUpIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Work as WorkIcon,
  ContactPageOutlined as ContactPageOutlinedIcon,
  NotesOutlined as NotesOutlinedIcon,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { useTeam } from "../context/TeamContext";
import EditTeamMemberModal from "./EditMemberModal";
import DeleteConfirmModal from "./DeleteConfirmModal";

// ─── Design tokens ────────────────────────────────────────────────────────
const C = {
  primary: "#0d4a5c",
  primaryDark: "#0a3a49",
  primaryMuted: "#4f7d89",
  primaryLight: "#eaf3f5",
  success: "#15803d",
  successBg: "#ecfdf3",
  surface: "#f4f6f9",
  card: "#ffffff",
  border: "#e7eaf0",
  error: "#dc2626",
  errorBg: "#fef2f2",
  warning: "#b45309",
  warningBg: "#fff7e6",
  gold: "#a855f7",
  goldBg: "#f5edff",
  text: { primary: "#16202b", secondary: "#5c6b7a", disabled: "#9aa6b2" },
};

const SHADOW = {
  sm: "0 1px 2px rgba(15, 23, 42, 0.05)",
  md: "0 4px 14px rgba(15, 23, 42, 0.06)",
  lg: "0 16px 40px rgba(15, 23, 42, 0.12)",
};

const RADIUS = { card: 1, inner: 2, pill: 999 };

const SectionLabel = ({ children }) => (
  <Typography
    variant="caption"
    sx={{
      fontSize: "0.68rem",
      fontWeight: 700,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      color: C.text.secondary,
    }}
  >
    {children}
  </Typography>
);

// ─── Helpers ─────────────────────────────────────────────────────────────────
// Turns enum-ish values like "on_leave" or "new-role" into "On Leave" / "New Role"
const humanize = (value) => {
  if (!value) return "";
  return value
    .toString()
    .replace(/[_-]+/g, " ")
    .trim()
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};

const getStatusStyle = (status) => {
  const normalized = status?.toLowerCase().replace(/[_-]+/g, " ").trim();
  switch (normalized) {
    case "active":
      return { bg: C.successBg, color: C.success, label: "Active" };
    case "inactive":
      return { bg: C.errorBg, color: C.error, label: "Inactive" };
    case "on leave":
      return { bg: C.warningBg, color: C.warning, label: "On Leave" };
    default:
      return {
        bg: C.border,
        color: C.text.disabled,
        label: humanize(status) || "Unknown",
      };
  }
};

const StatusDot = ({ color }) => (
  <Box
    component="span"
    sx={{
      width: 7,
      height: 7,
      borderRadius: "50%",
      bgcolor: color,
      display: "inline-block",
      flexShrink: 0,
    }}
  />
);

const formatDateShort = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return isNaN(d)
    ? dateStr
    : d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
};

// ─── Empty state ─────────────────────────────────────────────────────────────
function EmptyState({ icon, message }) {
  return (
    <Box
      sx={{
        py: 5,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 1,
        color: C.text.disabled,
      }}
    >
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          bgcolor: C.surface,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </Box>
      <Typography variant="body2" sx={{ color: C.text.secondary, fontWeight: 500 }}>
        {message}
      </Typography>
    </Box>
  );
}

// ─── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({ icon, iconBg, accent, title, value, trend }) {
  return (
    <Paper
      elevation={0}
      sx={{
        position: "relative",
        borderRadius: RADIUS.card,
        border: `1px solid ${C.border}`,
        p: 2,
        bgcolor: C.card,
        flex: 1,
        overflow: "hidden",
        transition: "transform 0.18s ease, box-shadow 0.18s ease",
        "&:hover": { transform: "translateY(-2px)", boxShadow: SHADOW.md },
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          bgcolor: accent || C.primary,
        },
      }}
    >
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography
            variant="caption"
            sx={{
              fontSize: "0.68rem",
              fontWeight: 700,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              color: C.text.secondary,
            }}
          >
            {title}
          </Typography>
          <Typography
            variant="h5"
            fontWeight={700}
            sx={{ mt: 0.6, fontSize: "1.4rem", color: C.text.primary, lineHeight: 1.2 }}
          >
            {value ?? "—"}
          </Typography>
          {trend && (
            <Typography
              variant="caption"
              sx={{
                color: trend > 0 ? C.success : C.error,
                fontSize: "0.68rem",
                fontWeight: 600,
              }}
            >
              {trend > 0 ? `+${trend}` : trend} from last month
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            bgcolor: iconBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
      </Box>
    </Paper>
  );
}

// ─── Info Row ─────────────────────────────────────────────────────────────
function InfoRow({ icon, label, value, color }) {
  return (
    <Box display="flex" alignItems="center" gap={1.5} py={1.1}>
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          bgcolor: C.surface,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: color || C.text.secondary,
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box flex={1} minWidth={0}>
        <Typography
          variant="caption"
          sx={{
            color: C.text.disabled,
            fontSize: "0.68rem",
            fontWeight: 600,
            letterSpacing: "0.03em",
          }}
          display="block"
        >
          {label}
        </Typography>
        <Typography
          variant="body2"
          fontWeight={600}
          sx={{
            color: C.text.primary,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {value || "—"}
        </Typography>
      </Box>
    </Box>
  );
}

// ─── Performance Chart ──────────────────────────────────────────────────────
function PerformanceChart({ data }) {
  const maxInspections = Math.max(
    ...(data?.map((d) => d.inspections) || [1]),
    1,
  );

  return (
    <Box>
      {data?.map((item, idx) => (
        <Box key={idx} sx={{ mb: idx === data.length - 1 ? 0 : 2.25 }}>
          <Box display="flex" justifyContent="space-between" mb={0.6}>
            <Typography variant="caption" fontWeight={700} sx={{ color: C.text.primary }}>
              {item.month}
            </Typography>
            <Typography variant="caption" sx={{ color: C.text.secondary, fontWeight: 500 }}>
              {item.inspections} inspections · Quality {item.qualityScore || item.quality}/5
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={(item.inspections / maxInspections) * 100}
            sx={{
              height: 6,
              borderRadius: RADIUS.pill,
              bgcolor: C.surface,
              "& .MuiLinearProgress-bar": {
                bgcolor: C.primary,
                borderRadius: RADIUS.pill,
              },
            }}
          />
          <LinearProgress
            variant="determinate"
            value={((item.qualityScore || item.quality || 0) / 5) * 100}
            sx={{
              height: 3,
              borderRadius: RADIUS.pill,
              mt: 0.6,
              bgcolor: C.surface,
              "& .MuiLinearProgress-bar": {
                bgcolor: "#d4a72c",
                borderRadius: RADIUS.pill,
              },
            }}
          />
        </Box>
      ))}
    </Box>
  );
}

// ─── Recent Inspections Table ──────────────────────────────────────────────
function RecentInspectionsTable({ inspections }) {
  if (!inspections?.length) {
    return (
      <EmptyState
        icon={<DescriptionIcon sx={{ fontSize: "1.2rem", color: C.text.disabled }} />}
        message="No recent inspections to show"
      />
    );
  }

  return (
    <TableContainer sx={{ borderRadius: RADIUS.inner, border: `1px solid ${C.border}` }}>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ bgcolor: C.surface }}>
            {["Inspection ID", "Asset", "Date", "Status", "Score"].map((h) => (
              <TableCell
                key={h}
                sx={{
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  color: C.text.secondary,
                  borderBottom: `1px solid ${C.border}`,
                }}
              >
                {h}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {inspections.map((insp, idx) => (
            <TableRow
              key={idx}
              sx={{
                "&:hover": { bgcolor: C.primaryLight },
                "&:last-child td": { borderBottom: 0 },
                transition: "background-color 0.12s ease",
              }}
            >
              <TableCell sx={{ fontSize: "0.78rem", fontWeight: 600, color: C.text.primary }}>
                {insp.inspectionId || insp.id || "—"}
              </TableCell>
              <TableCell sx={{ fontSize: "0.78rem", color: C.text.primary }}>
                {insp.assetName || insp.asset?.assetName || "—"}
              </TableCell>
              <TableCell sx={{ fontSize: "0.78rem", color: C.text.secondary }}>
                {formatDateShort(insp.submittedAt || insp.completedDate)}
              </TableCell>
              <TableCell>
                <Chip
                  label={insp.reviewStatus || insp.status || "Completed"}
                  size="small"
                  sx={{
                    fontSize: "0.66rem",
                    fontWeight: 600,
                    height: 22,
                    bgcolor: C.successBg,
                    color: C.success,
                    borderRadius: RADIUS.pill,
                  }}
                />
              </TableCell>
              <TableCell sx={{ fontSize: "0.78rem", fontWeight: 600, color: C.text.primary }}>
                {insp.score || insp.performanceRating || "—"}/5
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

// ─── Assigned Assets Table ─────────────────────────────────────────────────
function AssignedAssetsTable({ assets }) {
  if (!assets?.length) {
    return (
      <EmptyState
        icon={<AssignmentIcon sx={{ fontSize: "1.2rem", color: C.text.disabled }} />}
        message="No assets currently assigned"
      />
    );
  }

  return (
    <TableContainer sx={{ borderRadius: RADIUS.inner, border: `1px solid ${C.border}` }}>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ bgcolor: C.surface }}>
            {["Asset Name", "Type", "Due Date", "Priority"].map((h) => (
              <TableCell
                key={h}
                sx={{
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  color: C.text.secondary,
                  borderBottom: `1px solid ${C.border}`,
                }}
              >
                {h}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {assets.map((asset, idx) => {
            const isHigh = asset.priority === "high";
            return (
              <TableRow
                key={idx}
                sx={{
                  "&:hover": { bgcolor: C.primaryLight },
                  "&:last-child td": { borderBottom: 0 },
                  transition: "background-color 0.12s ease",
                }}
              >
                <TableCell sx={{ fontSize: "0.78rem", fontWeight: 600, color: C.text.primary }}>
                  {asset.asset?.assetName || asset.checklistName || "—"}
                </TableCell>
                <TableCell sx={{ fontSize: "0.78rem", color: C.text.secondary }}>
                  {asset.type || asset.checklistType || "—"}
                </TableCell>
                <TableCell sx={{ fontSize: "0.78rem", color: C.text.secondary }}>
                  {formatDateShort(asset.dueDate)}
                </TableCell>
                <TableCell>
                  <Chip
                    label={asset.priority || "Medium"}
                    size="small"
                    sx={{
                      fontSize: "0.66rem",
                      fontWeight: 600,
                      height: 22,
                      borderRadius: RADIUS.pill,
                      bgcolor: isHigh ? C.errorBg : C.warningBg,
                      color: isHigh ? C.error : C.warning,
                    }}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────
export default function TeamMemberDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const {
    selectedMemberDetails,
    loading,
    actionLoading,
    fetchTeamMemberDetails,
    updateTeamMember,
    deleteTeamMember,
    formatDate,
  } = useTeam();

  const [activeTab, setActiveTab] = useState("recent");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const showToast = (msg, sev = "success") =>
    setToast({ open: true, message: msg, severity: sev });
  const closeToast = () => setToast((p) => ({ ...p, open: false }));

  useEffect(() => {
    if (id) fetchTeamMemberDetails(id);
  }, [id, fetchTeamMemberDetails]);

  const handleEditSuccess = (message) => {
    showToast(message);
    fetchTeamMemberDetails(id);
  };

  const handleDeleteConfirm = async (permanent) => {
    const result = await deleteTeamMember(id, permanent);
    if (result.success) {
      showToast(result.message);
      setDeleteDialogOpen(false);
      setTimeout(() => navigate("/admin/team"), 1500);
    } else {
      showToast(result.error, "error");
    }
  };

  if (loading && !selectedMemberDetails) {
    return (
      <Box sx={{ bgcolor: C.surface, minHeight: "100vh", p: 3 }}>
        <Container maxWidth="xl">
          <Skeleton variant="rounded" height={120} sx={{ mb: 3, borderRadius: RADIUS.card }} />
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {[0, 1, 2, 3].map((i) => (
              <Grid item xs={6} sm={3} key={i}>
                <Skeleton variant="rounded" height={90} sx={{ borderRadius: RADIUS.card }} />
              </Grid>
            ))}
          </Grid>
          <Skeleton variant="rounded" height={320} sx={{ borderRadius: RADIUS.card }} />
        </Container>
      </Box>
    );
  }

  if (!selectedMemberDetails && !loading) {
    return (
      <Box
        sx={{
          bgcolor: C.surface,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Paper
          sx={{
            p: 4,
            textAlign: "center",
            borderRadius: RADIUS.card,
            border: `1px solid ${C.border}`,
            boxShadow: "none",
          }}
        >
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              bgcolor: C.surface,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 2,
            }}
          >
            <PersonIcon sx={{ color: C.text.disabled }} />
          </Box>
          <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: C.text.primary }}>
            Team member not found
          </Typography>
          <Typography variant="body2" sx={{ color: C.text.secondary, mb: 3 }}>
            This profile may have been removed or the link is incorrect.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate("/admin/team")}
            sx={{
              bgcolor: C.primary,
              textTransform: "none",
              fontWeight: 600,
              borderRadius: RADIUS.inner,
              boxShadow: "none",
              "&:hover": { bgcolor: C.primaryDark, boxShadow: "none" },
            }}
          >
            Back to Team
          </Button>
        </Paper>
      </Box>
    );
  }

  const m = selectedMemberDetails;
  const pi = m?.personalInfo || {};
  const stats = m?.stats || {};
  const monthlyPerformance = (m?.monthlyPerformance || []).filter(
    (r) => r.month && !r.month.includes("undefined"),
  );
  const statusStyle = getStatusStyle(pi?.status);
  const initials =
    pi?.firstName && pi?.lastName
      ? `${pi.firstName[0]}${pi.lastName[0]}`.toUpperCase()
      : pi?.email?.[0]?.toUpperCase() || "?";
  const fullName = [pi?.firstName, pi?.lastName].filter(Boolean).join(" ");

  const currentMember = {
    id: id,
    firstName: pi.firstName,
    lastName: pi.lastName,
    email: pi.email,
    phone: pi.phone,
    teamRole: pi.role,
    teamRoleDisplay: pi.roleDisplay,
    department: pi.department,
    location: pi.location,
    bio: pi.bio,
    status: pi.status,
    assignedCount: stats.totalInspections || 0,
    completedCount: stats.thisMonth || 0,
  };

  const statCards = [
    {
      icon: <DescriptionIcon sx={{ fontSize: "1.05rem", color: C.text.secondary }} />,
      iconBg: C.surface,
      accent: C.text.secondary,
      title: "Total Inspections",
      value: stats.totalInspections || 0,
      trend: null,
    },
    {
      icon: <CheckCircleOutlineIcon sx={{ fontSize: "1.05rem", color: C.success }} />,
      iconBg: C.successBg,
      accent: C.success,
      title: "This Month",
      value: stats.thisMonth || 0,
      trend: stats.trend,
    },
    {
      icon: <AccessTimeIcon sx={{ fontSize: "1.05rem", color: C.primary }} />,
      iconBg: C.primaryLight,
      accent: C.primary,
      title: "On-Time Rate",
      value: stats.onTimeRate ? `${stats.onTimeRate}%` : "98%",
      trend: null,
    },
    {
      icon: <WorkspacePremiumIcon sx={{ fontSize: "1.05rem", color: C.gold }} />,
      iconBg: C.goldBg,
      accent: C.gold,
      title: "Quality Score",
      value: stats.qualityScore ? `${stats.qualityScore}/5` : "4.9/5",
      trend: null,
    },
  ];

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: C.surface, p: { xs: 2, md: 3 } }}>
      <Container maxWidth="xl" disableGutters>
        {/* Header with Actions */}
        <Paper
          elevation={0}
          sx={{
            position: "relative",
            p: 2.5,
            mb: 3,
            borderRadius: RADIUS.card,
            border: `1px solid ${C.border}`,
            bgcolor: C.card,
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 4,
              background: `linear-gradient(90deg, ${C.primary}, ${C.primaryMuted})`,
            },
          }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="flex-start"
            flexWrap="wrap"
            gap={2}
          >
            <Box display="flex" alignItems="center" gap={2}>
              <IconButton
                onClick={() => navigate("/admin/team")}
                sx={{
                  color: C.text.primary,
                  bgcolor: C.surface,
                  border: `1px solid ${C.border}`,
                  "&:hover": { bgcolor: C.primaryLight },
                }}
              >
                <ArrowBackIcon />
              </IconButton>
              <Box
                sx={{
                  p: "3px",
                  borderRadius: "50%",
                  border: `2px solid ${statusStyle.color}`,
                }}
              >
                <Avatar
                  sx={{
                    width: 60,
                    height: 60,
                    background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`,
                    fontWeight: 700,
                    fontSize: "1.15rem",
                  }}
                >
                  {initials}
                </Avatar>
              </Box>
              <Box>
                <Box display="flex" alignItems="center" gap={1.25} flexWrap="wrap">
                  <Typography variant="h5" fontWeight={700} sx={{ color: C.text.primary }}>
                    {fullName || "Team Member"}
                  </Typography>
                  <Chip
                    icon={<StatusDot color={statusStyle.color} />}
                    label={statusStyle.label}
                    size="small"
                    sx={{
                      bgcolor: statusStyle.bg,
                      color: statusStyle.color,
                      fontWeight: 700,
                      fontSize: "0.7rem",
                      borderRadius: RADIUS.pill,
                      "& .MuiChip-icon": { ml: "8px" },
                    }}
                  />
                </Box>
                <Typography variant="body2" sx={{ color: C.text.secondary, mt: 0.5 }}>
                  {pi.roleDisplay || humanize(pi.role) || "—"}
                  <Box component="span" sx={{ mx: 0.75, color: C.border }}>
                    •
                  </Box>
                  {pi.department || "No Department"}
                  <Box component="span" sx={{ mx: 0.75, color: C.border }}>
                    •
                  </Box>
                  Member since {formatDate(pi.joinDate)}
                </Typography>
              </Box>
            </Box>
            <Box display="flex" gap={1}>
              <Button
                startIcon={<EditIcon />}
                variant="outlined"
                onClick={() => setEditDialogOpen(true)}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  borderRadius: RADIUS.inner,
                  borderColor: C.border,
                  color: C.text.primary,
                  "&:hover": { borderColor: C.primary, bgcolor: C.primaryLight },
                }}
              >
                Edit
              </Button>
              <Button
                startIcon={<DeleteIcon />}
                variant="outlined"
                color="error"
                onClick={() => setDeleteDialogOpen(true)}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  borderRadius: RADIUS.inner,
                  "&:hover": { bgcolor: C.errorBg },
                }}
              >
                Delete
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* Stats Row */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(2, minmax(0, 1fr))",
              md: "repeat(4, minmax(0, 1fr))",
            },
            gap: 2,
            mb: 3,
            width: "100%",
          }}
        >
          {statCards.map((card, idx) => (
            <Box key={idx} sx={{ minWidth: 0 }}>
              <StatCard {...card} />
            </Box>
          ))}
        </Box>

        {/* Main Content Grid */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "minmax(300px, 360px) minmax(0, 1fr)",
            },
            gap: 3,
            alignItems: "stretch",
            width: "100%",
          }}
        >
          {/* Left Column - Contact & Info */}
          <Box sx={{ display: "flex", minWidth: 0 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3, width: "100%" }}>
              <Paper
                elevation={0}
                sx={{
                  borderRadius: RADIUS.card,
                  border: `1px solid ${C.border}`,
                  bgcolor: C.card,
                  overflow: "hidden",
                  flexShrink: 0,
                }}
              >
                <Box
                  sx={{
                    px: 2,
                    py: 1.5,
                    bgcolor: C.surface,
                    borderBottom: `1px solid ${C.border}`,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <ContactPageOutlinedIcon sx={{ fontSize: "1.05rem", color: C.primary }} />
                  <SectionLabel>Contact Information</SectionLabel>
                </Box>
                <Box sx={{ px: 2, py: 1 }}>
                  <InfoRow
                    icon={<EmailIcon sx={{ fontSize: "1rem" }} />}
                    label="Email"
                    value={pi.email}
                  />
                  <Divider sx={{ borderColor: C.border }} />
                  <InfoRow
                    icon={<PhoneIcon sx={{ fontSize: "1rem" }} />}
                    label="Phone"
                    value={pi.phone}
                  />
                  <Divider sx={{ borderColor: C.border }} />
                  <InfoRow
                    icon={<LocationOnIcon sx={{ fontSize: "1rem" }} />}
                    label="Location"
                    value={pi.location || "Not specified"}
                  />
                  <Divider sx={{ borderColor: C.border }} />
                  <InfoRow
                    icon={<CalendarTodayIcon sx={{ fontSize: "1rem" }} />}
                    label="Join Date"
                    value={formatDate(pi.joinDate)}
                  />
                </Box>
              </Paper>

              <Paper
                elevation={0}
                sx={{
                  borderRadius: RADIUS.card,
                  border: `1px solid ${C.border}`,
                  bgcolor: C.card,
                  overflow: "hidden",
                  flexShrink: 0,
                }}
              >
                <Box
                  sx={{
                    px: 2,
                    py: 1.5,
                    bgcolor: C.surface,
                    borderBottom: `1px solid ${C.border}`,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <WorkIcon sx={{ fontSize: "1.05rem", color: C.primary }} />
                  <SectionLabel>Role &amp; Department</SectionLabel>
                </Box>
                <Box sx={{ px: 2, py: 1 }}>
                  <InfoRow
                    icon={<WorkIcon sx={{ fontSize: "1rem" }} />}
                    label="Role"
                    value={pi.roleDisplay || humanize(pi.role)}
                  />
                  <Divider sx={{ borderColor: C.border }} />
                  <InfoRow
                    icon={<BusinessIcon sx={{ fontSize: "1rem" }} />}
                    label="Department"
                    value={pi.department}
                  />
                  <Divider sx={{ borderColor: C.border }} />
                  <InfoRow
                    icon={<CheckCircleOutlineIcon sx={{ fontSize: "1rem" }} />}
                    label="Status"
                    value={statusStyle.label}
                    color={statusStyle.color}
                  />
                </Box>
              </Paper>

              <Paper
                elevation={0}
                sx={{
                  borderRadius: RADIUS.card,
                  border: `1px solid ${C.border}`,
                  bgcolor: C.card,
                  overflow: "hidden",
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  minHeight: 140,
                }}
              >
                <Box
                  sx={{
                    px: 2,
                    py: 1.5,
                    bgcolor: C.surface,
                    borderBottom: `1px solid ${C.border}`,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <NotesOutlinedIcon sx={{ fontSize: "1.05rem", color: C.primary }} />
                  <SectionLabel>Bio</SectionLabel>
                </Box>
                <Box sx={{ p: 2, flex: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{ color: pi.bio ? C.text.primary : C.text.disabled, lineHeight: 1.6 }}
                  >
                    {pi.bio || "No bio provided yet."}
                  </Typography>
                </Box>
              </Paper>
            </Box>
          </Box>

          {/* Right Column - Performance & Tabs */}
          <Box sx={{ display: "flex", minWidth: 0 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3, width: "100%" }}>
              {/* Performance Section */}
              <Paper
                elevation={0}
                sx={{
                  borderRadius: RADIUS.card,
                  border: `1px solid ${C.border}`,
                  bgcolor: C.card,
                  overflow: "hidden",
                  flexShrink: 0,
                }}
              >
                <Box
                  sx={{
                    px: 2,
                    py: 1.5,
                    bgcolor: C.surface,
                    borderBottom: `1px solid ${C.border}`,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1}>
                    <TrendingUpIcon sx={{ fontSize: "1.05rem", color: C.primary }} />
                    <SectionLabel>6-Month Performance Trend</SectionLabel>
                  </Box>
                  <Box display="flex" gap={1.5}>
                    <Box display="flex" alignItems="center" gap={0.6}>
                      <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: C.primary }} />
                      <Typography variant="caption" sx={{ color: C.text.secondary, fontSize: "0.65rem" }}>
                        Inspections
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={0.6}>
                      <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#d4a72c" }} />
                      <Typography variant="caption" sx={{ color: C.text.secondary, fontSize: "0.65rem" }}>
                        Quality
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                <Box sx={{ p: 2.5 }}>
                  {monthlyPerformance.length > 0 ? (
                    <PerformanceChart data={monthlyPerformance} />
                  ) : (
                    <EmptyState
                      icon={<TrendingUpIcon sx={{ fontSize: "1.2rem", color: C.text.disabled }} />}
                      message="No performance data available yet"
                    />
                  )}
                </Box>
              </Paper>

              {/* Tabs Section */}
              <Paper
                elevation={0}
                sx={{
                  borderRadius: RADIUS.card,
                  border: `1px solid ${C.border}`,
                  bgcolor: C.card,
                  overflow: "hidden",
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  minHeight: 280,
                }}
              >
                <Box sx={{ borderBottom: `1px solid ${C.border}`, px: 1.5, pt: 1, flexShrink: 0 }}>
                  <Box display="flex" gap={0.5}>
                    {[
                      {
                        id: "recent",
                        label: "Recent Inspections",
                        icon: <DescriptionIcon sx={{ fontSize: "0.9rem" }} />,
                      },
                      {
                        id: "assets",
                        label: "Assigned Assets",
                        icon: <AssignmentIcon sx={{ fontSize: "0.9rem" }} />,
                      },
                    ].map((tab) => {
                      const active = activeTab === tab.id;
                      return (
                        <Button
                          key={tab.id}
                          startIcon={tab.icon}
                          onClick={() => setActiveTab(tab.id)}
                          sx={{
                            textTransform: "none",
                            fontSize: "0.85rem",
                            fontWeight: active ? 700 : 500,
                            color: active ? C.primary : C.text.secondary,
                            bgcolor: active ? C.primaryLight : "transparent",
                            borderBottom: active
                              ? `2px solid ${C.primary}`
                              : "2px solid transparent",
                            borderRadius: "8px 8px 0 0",
                            px: 2,
                            py: 1,
                            transition: "all 0.15s ease",
                            "&:hover": { bgcolor: C.primaryLight },
                          }}
                        >
                          {tab.label}
                        </Button>
                      );
                    })}
                  </Box>
                </Box>
                <Box sx={{ p: 2, flex: 1 }}>
                  {activeTab === "recent" && (
                    <RecentInspectionsTable inspections={m.recentInspections || []} />
                  )}
                  {activeTab === "assets" && (
                    <AssignedAssetsTable assets={m.assignedAssets || []} />
                  )}
                </Box>
              </Paper>
            </Box>
          </Box>
        </Box>

        {/* Edit Modal */}
        <EditTeamMemberModal
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          member={currentMember}
          onSuccess={handleEditSuccess}
        />

        {/* Delete Modal */}
        <DeleteConfirmModal
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          onConfirm={handleDeleteConfirm}
          member={currentMember}
          loading={actionLoading}
        />

        {/* Toast */}
        <Snackbar
          open={toast.open}
          autoHideDuration={5000}
          onClose={closeToast}
  anchorOrigin={{ vertical: "top", horizontal: "right" }}>
          <Alert
            onClose={closeToast}
            severity={toast.severity}
            variant="filled"
            sx={{ borderRadius: RADIUS.inner, boxShadow: SHADOW.lg }}
          >
            {toast.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}

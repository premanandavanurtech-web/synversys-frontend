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
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { useTeam } from "../context/TeamContext";
import EditTeamMemberModal from "./EditMemberModal";
import DeleteConfirmModal from "./DeleteConfirmModal";

// ─── Palette ────────────────────────────────────────────────────────────────
const C = {
  primary: "#0d4a5c",
  primaryDark: "#0a3a49",
  primaryLight: "#e8f2f5",
  success: "#16a34a",
  successBg: "#dcfce7",
  surface: "#f1f4f8",
  card: "#ffffff",
  border: "#e2e8f0",
  error: "#ef4444",
  errorBg: "#fee2e2",
  warning: "#eab308",
  warningBg: "#fef9c3",
  text: { primary: "#1e293b", secondary: "#64748b", disabled: "#94a3b8" },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const getStatusStyle = (status) => {
  switch (status?.toLowerCase()) {
    case "active":
      return { bg: C.successBg, color: C.success, label: "Active", icon: "🟢" };
    case "inactive":
      return { bg: C.errorBg, color: C.error, label: "Inactive", icon: "🔴" };
    case "onleave":
    case "on leave":
      return {
        bg: C.warningBg,
        color: C.warning,
        label: "On Leave",
        icon: "🟡",
      };
    default:
      return {
        bg: C.border,
        color: C.text.disabled,
        label: status || "Unknown",
        icon: "⚪",
      };
  }
};

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

// ─── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({ icon, iconBg, title, value, trend }) {
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 2,
        border: `1px solid ${C.border}`,
        p: 2,
        bgcolor: C.card,
        flex: 1,
      }}
    >
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontSize: "0.7rem", fontWeight: 500 }}
          >
            {title}
          </Typography>
          <Typography
            variant="h5"
            fontWeight={700}
            sx={{ mt: 0.5, fontSize: "1.3rem" }}
          >
            {value ?? "—"}
          </Typography>
          {trend && (
            <Typography
              variant="caption"
              color={trend > 0 ? C.success : C.error}
              sx={{ fontSize: "0.65rem" }}
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
    <Box display="flex" alignItems="center" gap={1.5} py={1}>
      <Box sx={{ width: 32, color: color || C.text.secondary }}>{icon}</Box>
      <Box flex={1}>
        <Typography variant="caption" color="text.secondary" display="block">
          {label}
        </Typography>
        <Typography variant="body2" fontWeight={500}>
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
        <Box key={idx} sx={{ mb: 2 }}>
          <Box display="flex" justifyContent="space-between" mb={0.5}>
            <Typography variant="caption" fontWeight={500}>
              {item.month}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {item.inspections} inspections • Quality:{" "}
              {item.qualityScore || item.quality}/5
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={(item.inspections / maxInspections) * 100}
            sx={{
              height: 6,
              borderRadius: 3,
              bgcolor: C.border,
              "& .MuiLinearProgress-bar": {
                bgcolor: C.primary,
                borderRadius: 3,
              },
            }}
          />
          <LinearProgress
            variant="determinate"
            value={((item.qualityScore || item.quality || 0) / 5) * 100}
            sx={{
              height: 3,
              borderRadius: 3,
              mt: 0.5,
              bgcolor: C.border,
              "& .MuiLinearProgress-bar": {
                bgcolor: "#cbd5e1",
                borderRadius: 3,
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
  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ bgcolor: "#f8fafc" }}>
            <TableCell sx={{ fontSize: "0.7rem", fontWeight: 600 }}>
              Inspection ID
            </TableCell>
            <TableCell sx={{ fontSize: "0.7rem", fontWeight: 600 }}>
              Asset
            </TableCell>
            <TableCell sx={{ fontSize: "0.7rem", fontWeight: 600 }}>
              Date
            </TableCell>
            <TableCell sx={{ fontSize: "0.7rem", fontWeight: 600 }}>
              Status
            </TableCell>
            <TableCell sx={{ fontSize: "0.7rem", fontWeight: 600 }}>
              Score
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {inspections?.length > 0 ? (
            inspections.map((insp, idx) => (
              <TableRow key={idx} hover>
                <TableCell sx={{ fontSize: "0.75rem" }}>
                  {insp.inspectionId || insp.id || "—"}
                </TableCell>
                <TableCell sx={{ fontSize: "0.75rem" }}>
                  {insp.assetName || insp.asset?.assetName || "—"}
                </TableCell>
                <TableCell sx={{ fontSize: "0.75rem" }}>
                  {formatDateShort(insp.submittedAt || insp.completedDate)}
                </TableCell>
                <TableCell>
                  <Chip
                    label={insp.reviewStatus || insp.status || "Completed"}
                    size="small"
                    sx={{
                      fontSize: "0.65rem",
                      height: 22,
                      bgcolor: C.successBg,
                      color: C.success,
                    }}
                  />
                </TableCell>
                <TableCell sx={{ fontSize: "0.75rem" }}>
                  {insp.score || insp.performanceRating || "—"}/5
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  No recent inspections
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

// ─── Assigned Assets Table ─────────────────────────────────────────────────
function AssignedAssetsTable({ assets }) {
  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ bgcolor: "#f8fafc" }}>
            <TableCell sx={{ fontSize: "0.7rem", fontWeight: 600 }}>
              Asset Name
            </TableCell>
            <TableCell sx={{ fontSize: "0.7rem", fontWeight: 600 }}>
              Type
            </TableCell>
            <TableCell sx={{ fontSize: "0.7rem", fontWeight: 600 }}>
              Due Date
            </TableCell>
            <TableCell sx={{ fontSize: "0.7rem", fontWeight: 600 }}>
              Priority
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {assets?.length > 0 ? (
            assets.map((asset, idx) => (
              <TableRow key={idx} hover>
                <TableCell sx={{ fontSize: "0.75rem" }}>
                  {asset.asset?.assetName || asset.checklistName || "—"}
                </TableCell>
                <TableCell sx={{ fontSize: "0.75rem" }}>
                  {asset.type || asset.checklistType || "—"}
                </TableCell>
                <TableCell sx={{ fontSize: "0.75rem" }}>
                  {formatDateShort(asset.dueDate)}
                </TableCell>
                <TableCell>
                  <Chip
                    label={asset.priority || "Medium"}
                    size="small"
                    sx={{
                      fontSize: "0.65rem",
                      height: 22,
                      bgcolor:
                        asset.priority === "high" ? C.errorBg : C.warningBg,
                      color: asset.priority === "high" ? C.error : C.warning,
                    }}
                  />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  No assigned assets
                </Typography>
              </TableCell>
            </TableRow>
          )}
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
          <Skeleton variant="rounded" height={400} />
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
        <Paper sx={{ p: 4, textAlign: "center", borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Team member not found
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate("/admin/team")}
            sx={{ bgcolor: C.primary, textTransform: "none" }}
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
      icon: <DescriptionIcon sx={{ fontSize: "1rem" }} />,
      iconBg: "#f1f5f9",
      title: "Total Inspections",
      value: stats.totalInspections || 0,
      trend: null,
    },
    {
      icon: (
        <CheckCircleOutlineIcon sx={{ fontSize: "1rem", color: C.success }} />
      ),
      iconBg: C.successBg,
      title: "This Month",
      value: stats.thisMonth || 0,
      trend: stats.trend,
    },
    {
      icon: <AccessTimeIcon sx={{ fontSize: "1rem", color: C.primary }} />,
      iconBg: C.primaryLight,
      title: "On-Time Rate",
      value: stats.onTimeRate ? `${stats.onTimeRate}%` : "98%",
      trend: null,
    },
    {
      icon: (
        <WorkspacePremiumIcon sx={{ fontSize: "1rem", color: "#a855f7" }} />
      ),
      iconBg: "#f3e8ff",
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
            p: 2.5,
            mb: 3,
            borderRadius: 2,
            border: `1px solid ${C.border}`,
            bgcolor: C.card,
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
                }}
              >
                <ArrowBackIcon />
              </IconButton>
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                  bgcolor: C.primary,
                  fontWeight: 700,
                  fontSize: "1.2rem",
                }}
              >
                {initials}
              </Avatar>
              <Box>
                <Box
                  display="flex"
                  alignItems="center"
                  gap={1.5}
                  flexWrap="wrap"
                >
                  <Typography variant="h5" fontWeight={700}>
                    {fullName || "Team Member"}
                  </Typography>
                  <Chip
                    label={statusStyle.label}
                    size="small"
                    sx={{
                      bgcolor: statusStyle.bg,
                      color: statusStyle.color,
                      fontWeight: 600,
                    }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" mt={0.5}>
                  {pi.roleDisplay || pi.role || "—"} •{" "}
                  {pi.department || "No Department"} • Member since{" "}
                  {formatDate(pi.joinDate)}
                </Typography>
              </Box>
            </Box>
            <Box display="flex" gap={1}>
              <Button
                startIcon={<EditIcon />}
                variant="outlined"
                onClick={() => setEditDialogOpen(true)}
                sx={{ textTransform: "none", borderRadius: 1.5 }}
              >
                Edit
              </Button>
              <Button
                startIcon={<DeleteIcon />}
                variant="outlined"
                color="error"
                onClick={() => setDeleteDialogOpen(true)}
                sx={{ textTransform: "none", borderRadius: 1.5 }}
              >
                Delete
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* Stats Row */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {statCards.map((card, idx) => (
            <Grid item xs={6} sm={3} key={idx}>
              <StatCard {...card} />
            </Grid>
          ))}
        </Grid>

        {/* Main Content Grid */}
        <Grid container spacing={3}>
          {/* Left Column - Contact & Info */}
          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: 2,
                border: `1px solid ${C.border}`,
                bgcolor: C.card,
                overflow: "hidden",
                mb: 3,
              }}
            >
              <Box
                sx={{
                  p: 2,
                  bgcolor: "#f8fafc",
                  borderBottom: `1px solid ${C.border}`,
                }}
              >
                <Typography variant="subtitle2" fontWeight={600}>
                  Contact Information
                </Typography>
              </Box>
              <Box sx={{ p: 2 }}>
                <InfoRow
                  icon={<EmailIcon sx={{ fontSize: "1rem" }} />}
                  label="Email"
                  value={pi.email}
                />
                <Divider />
                <InfoRow
                  icon={<PhoneIcon sx={{ fontSize: "1rem" }} />}
                  label="Phone"
                  value={pi.phone}
                />
                <Divider />
                <InfoRow
                  icon={<LocationOnIcon sx={{ fontSize: "1rem" }} />}
                  label="Location"
                  value={pi.location || "Not specified"}
                />
                <Divider />
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
                borderRadius: 2,
                border: `1px solid ${C.border}`,
                bgcolor: C.card,
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  p: 2,
                  bgcolor: "#f8fafc",
                  borderBottom: `1px solid ${C.border}`,
                }}
              >
                <Typography variant="subtitle2" fontWeight={600}>
                  Bio
                </Typography>
              </Box>
              <Box sx={{ p: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  {pi.bio || "No bio provided"}
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {/* Right Column - Performance & Tabs */}
          <Grid item xs={12} md={8}>
            {/* Performance Section */}
            <Paper
              elevation={0}
              sx={{
                borderRadius: 2,
                border: `1px solid ${C.border}`,
                bgcolor: C.card,
                overflow: "hidden",
                mb: 3,
              }}
            >
              <Box
                sx={{
                  p: 2,
                  bgcolor: "#f8fafc",
                  borderBottom: `1px solid ${C.border}`,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="subtitle2" fontWeight={600}>
                  6-Month Performance Trend
                </Typography>
                <TrendingUpIcon sx={{ color: C.success, fontSize: "1rem" }} />
              </Box>
              <Box sx={{ p: 2 }}>
                {monthlyPerformance.length > 0 ? (
                  <PerformanceChart data={monthlyPerformance} />
                ) : (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    textAlign="center"
                    py={3}
                  >
                    No performance data available
                  </Typography>
                )}
              </Box>
            </Paper>

            {/* Tabs Section */}
            <Paper
              elevation={0}
              sx={{
                borderRadius: 2,
                border: `1px solid ${C.border}`,
                bgcolor: C.card,
                overflow: "hidden",
              }}
            >
              <Box sx={{ borderBottom: `1px solid ${C.border}`, px: 2, pt: 1 }}>
                <Box display="flex" gap={1}>
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
                  ].map((tab) => (
                    <Button
                      key={tab.id}
                      startIcon={tab.icon}
                      onClick={() => setActiveTab(tab.id)}
                      sx={{
                        textTransform: "none",
                        fontWeight: activeTab === tab.id ? 600 : 400,
                        color:
                          activeTab === tab.id ? C.primary : C.text.secondary,
                        borderBottom:
                          activeTab === tab.id
                            ? `2px solid ${C.primary}`
                            : "none",
                        borderRadius: 0,
                        px: 2,
                        py: 1,
                      }}
                    >
                      {tab.label}
                    </Button>
                  ))}
                </Box>
              </Box>
              <Box sx={{ p: 2 }}>
                {activeTab === "recent" && (
                  <RecentInspectionsTable
                    inspections={m.recentInspections || []}
                  />
                )}
                {activeTab === "assets" && (
                  <AssignedAssetsTable assets={m.assignedAssets || []} />
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>

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
      </Container>
    </Box>
  );
}

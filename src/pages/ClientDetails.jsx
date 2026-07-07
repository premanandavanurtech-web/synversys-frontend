// ClientDetails.jsx - Fully Fixed with Real Data, No Dummy Data

import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Button,
  IconButton,
  LinearProgress,
  Grid,
  Divider,
  Stack,
  useMediaQuery,
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
  useTheme,
  Tooltip,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  PersonOff as PersonOffIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Language as LanguageIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  Inventory as InventoryIcon,
  TrendingUp as TrendingUpIcon,
  WarningAmber as WarningAmberIcon,
  Subscriptions as SubscriptionIcon,
  Settings as SettingsIcon,
  Dashboard as DashboardIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  ErrorOutline as ErrorOutlineIcon,
  CalendarToday as CalendarIcon,
  Lock as LockIcon,
  CheckCircle as CheckCircleIcon,
  Download as DownloadIcon,
  OpenInNew as OpenInNewIcon,
} from "@mui/icons-material";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useClient } from "../context/ClientContext";
import { useAuth } from "../context/AuthContexts";

const C = {
  primary: "#0d4a5c",
  primaryDark: "#0a3a49",
  primaryLight: "#e6f0f3",
  success: "#10b981",
  warning: "#f59e0b",
  error: "#ef4444",
  surface: "#f8fafc",
  card: "#ffffff",
  border: "#e2e8f0",
  text: { primary: "#0f172a", secondary: "#475569", muted: "#94a3b8" },
};

const PLANS = {
  free: {
    label: "Free",
    color: "#64748b",
    bg: "#f1f5f9",
    price: "0/mo",
    features: [],
  },
  standard: {
    label: "Standard",
    color: C.primary,
    bg: C.primaryLight,
    price: "49/mo",
    features: [
      "Up to 10 user licenses",
      "2 GB storage",
      "Standard support",
      "Basic analytics",
    ],
  },
  premium: {
    label: "Premium",
    color: "#d97706",
    bg: "#fffbeb",
    price: "99/mo",
    features: [
      "Up to 25 user licenses",
      "5 GB storage",
      "Priority support",
      "Advanced analytics",
    ],
  },
  enterprise: {
    label: "Enterprise",
    color: "#7c3aed",
    bg: "#f5f3ff",
    price: "$299/mo",
    features: [
      "Up to 50 user licenses",
      "10 GB storage",
      "Priority support",
      "Advanced analytics",
    ],
  },
};

const fmtDate = (d) =>
  !d
    ? "—"
    : new Date(d).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

const fmtErr = (e) =>
  typeof e === "string"
    ? e
    : e?.response?.data?.message || e?.message || "Something went wrong";

const initials = (name) =>
  !name
    ? "?"
    : name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

// Stat Tile Component
const StatTile = ({
  icon: Icon,
  label,
  value,
  sub,
  color,
  loading,
  onClick,
}) => {
  if (loading) {
    return (
      <Box
        sx={{
          bgcolor: "white",
          
          border: `1px solid ${C.border}`,
          borderRadius: 2,
          p: 2,
          height: "100%",
        
        }}
      >
        <Skeleton variant="circular" width={28} height={28} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="50%" height={12} />
        <Skeleton variant="text" width="60%" height={28} />
        <Skeleton variant="text" width="70%" height={12} />
      </Box>
    );
  }
  return (
    <Box
      onClick={onClick}
      sx={{
        bgcolor: "white",
        border: `1px solid ${C.border}`,
        width:{xs:"173px",md:"279px"},
        borderRadius: 2,
        p: { xs: 1.5, sm: 2 },
        height: "100%",
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.2s",
        "&:hover": onClick
          ? {
              borderColor: C.primary,
              boxShadow: "0 2px 12px rgba(13,74,92,0.08)",
            }
          : {},
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
        <Box
          sx={{
            width: 28,
            height: 28,
            borderRadius: "8px",
            bgcolor: `${color}15`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon sx={{ fontSize: 14, color }} />
        </Box>
        <Typography
          sx={{
            fontSize: "0.65rem",
            fontWeight: 500,
            color: C.text.muted,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          {label}
        </Typography>
      </Box>
      <Typography
        sx={{
          fontSize: { xs: "1.4rem", sm: "1.6rem" },
          fontWeight: 700,
          color: C.text.primary,
          lineHeight: 1,
        }}
      >
        {value ?? 0}
      </Typography>
      {sub && (
        <Typography sx={{ fontSize: "0.6rem", color: C.text.muted, mt: 0.5 }}>
          {sub}
        </Typography>
      )}
      {onClick && (
        <Typography sx={{ fontSize: "0.65rem", color: C.primary, mt: 0.75 }}>
          View all forms →
        </Typography>
      )}
    </Box>
  );
};

// Edit Modal
const EditModal = ({ open, client, onClose, onSave, loading }) => {
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (client && open) {
      setForm({
        customerName: client.customerName || "",
        phone: client.phone || "",
        website: client.website || "",
        membershipPlan: client.membershipPlan || "standard",
        licenseLimit: client.licenseLimit || 10,
        notes: client.notes || "",
      });
      setErrors({});
    }
  }, [client, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.customerName?.trim()) e.customerName = "Required";
    if (!form.phone?.trim()) e.phone = "Required";
    if (
      form.website &&
      !/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i.test(
        form.website,
      )
    )
      e.website = "Invalid URL";
    if (form.licenseLimit < 1) e.licenseLimit = "Min 1";
    if (form.licenseLimit > 10000) e.licenseLimit = "Max 10000";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    await onSave(form);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: "16px" } }}
    >
      <DialogTitle sx={{ p: 0 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2.5,
            py: 1.75,
            bgcolor: C.primary,
          }}
        >
          <Typography
            sx={{ fontWeight: 700, fontSize: "0.9rem", color: "white" }}
          >
            Edit Customer
          </Typography>
          <IconButton size="small" onClick={onClose} sx={{ color: "white" }}>
            <CloseIcon sx={{ fontSize: "1rem" }} />
          </IconButton>
        </Box>
      </DialogTitle>
     <DialogContent sx={{ p: 2.5, pt: 4, overflow: 'visible' }}>
  <Stack spacing={2} sx={{ mt: 2 }}>
          <TextField
            name="customerName"
            label="Customer Name"
            value={form.customerName || ""}
            onChange={handleChange}
            fullWidth
            size="small"
            required
            error={!!errors.customerName}
            helperText={errors.customerName}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            name="phone"
            label="Phone Number"
            value={form.phone || ""}
            onChange={handleChange}
            fullWidth
            size="small"
            required
            error={!!errors.phone}
            helperText={errors.phone}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            name="website"
            label="Website"
            value={form.website || ""}
            onChange={handleChange}
            fullWidth
            size="small"
            error={!!errors.website}
            helperText={errors.website}
            placeholder="https://example.com"
            InputLabelProps={{ shrink: true }}
          />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Membership Plan</InputLabel>
                <Select
                  name="membershipPlan"
                  value={form.membershipPlan || "standard"}
                  onChange={handleChange}
                  label="Membership Plan"
                >
                  {Object.entries(PLANS).map(([k, v]) => (
                    <MenuItem key={k} value={k}>
                      {v.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="licenseLimit"
                label="License Limit"
                type="number"
                value={form.licenseLimit || 10}
                onChange={handleChange}
                fullWidth
                size="small"
                error={!!errors.licenseLimit}
                helperText={errors.licenseLimit}
                InputLabelProps={{ shrink: true }}
                InputProps={{ inputProps: { min: 1, max: 10000 } }}
              />
            </Grid>
          </Grid>
          <TextField
            name="notes"
            label="Notes"
            multiline
            rows={3}
            value={form.notes || ""}
            onChange={handleChange}
            fullWidth
            size="small"
            InputLabelProps={{ shrink: true }}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose} size="small" sx={{ textTransform: "none" }}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          sx={{
            bgcolor: C.primary,
            textTransform: "none",
            "&:hover": { bgcolor: C.primaryDark },
          }}
        >
          {loading ? <CircularProgress size={20} /> : "Save Changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Renew Modal
const RenewModal = ({ open, client, onClose, onRenew, loading }) => {
  const [days, setDays] = useState(30);

  const handleSubmit = () => {
    if (days >= 1 && days <= 365) {
      onRenew(days);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: "16px" } }}
    >
      <DialogTitle sx={{ p: 2, pb: 0 }}>
        <Typography sx={{ fontWeight: 700, fontSize: "0.9rem" }}>
          Renew Membership
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ p: 2 }}>
        <Typography
          sx={{ fontSize: "0.75rem", color: C.text.secondary, mb: 2 }}
        >
          Extend membership for <strong>{client?.customerName}</strong>
        </Typography>
        <TextField
          label="Extension Days"
          type="number"
          value={days}
          onChange={(e) =>
            setDays(Math.min(365, Math.max(1, parseInt(e.target.value) || 0)))
          }
          fullWidth
          size="small"
          InputProps={{ inputProps: { min: 1, max: 365 } }}
          helperText="Enter days to extend (1–365)"
        />
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 0, gap: 1 }}>
        <Button onClick={onClose} size="small" sx={{ textTransform: "none" }}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || days < 1 || days > 365}
          sx={{
            bgcolor: C.warning,
            textTransform: "none",
            "&:hover": { bgcolor: "#ea580c" },
          }}
        >
          {loading ? <CircularProgress size={20} /> : "Renew"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Upgrade Modal
const UpgradeModal = ({
  open,
  client,
  currentPlan,
  onClose,
  onUpgrade,
  loading,
}) => {
  const [selectedPlan, setSelectedPlan] = useState(currentPlan);
  const [extendDays, setExtendDays] = useState(30);

  useEffect(() => {
    if (open) {
      setSelectedPlan(currentPlan);
      setExtendDays(30);
    }
  }, [open, currentPlan]);

  const handleSubmit = () => {
    onUpgrade(selectedPlan, extendDays);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: "16px" } }}
    >
      <DialogTitle sx={{ p: 0 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2.5,
            py: 1.75,
            bgcolor: C.primary,
          }}
        >
          <Typography
            sx={{ fontWeight: 700, fontSize: "0.9rem", color: "white" }}
          >
            Upgrade Plan
          </Typography>
          <IconButton size="small" onClick={onClose} sx={{ color: "white" }}>
            <CloseIcon sx={{ fontSize: "1rem" }} />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ p: 2.5 }}>
        <Stack spacing={2}>
          <Box sx={{ p: 1.5, bgcolor: C.primaryLight, borderRadius: 2 }}>
            <Typography sx={{ fontSize: "0.7rem", color: C.text.secondary }}>
              Current Plan:{" "}
              <strong>
                {currentPlan?.charAt(0).toUpperCase() + currentPlan?.slice(1)}
              </strong>
            </Typography>
          </Box>
          <FormControl fullWidth size="small">
            <InputLabel>Select New Plan</InputLabel>
            <Select
              value={selectedPlan}
              onChange={(e) => setSelectedPlan(e.target.value)}
              label="Select New Plan"
            >
              {Object.entries(PLANS).map(([k, v]) => (
                <MenuItem key={k} value={k}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      width: "100%",
                    }}
                  >
                    <span>{v.label}</span>
                    <span style={{ color: C.primary, fontWeight: 600 }}>
                      {v.price}
                    </span>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Extend Days"
            type="number"
            value={extendDays}
            onChange={(e) =>
              setExtendDays(
                Math.min(365, Math.max(0, parseInt(e.target.value) || 0)),
              )
            }
            fullWidth
            size="small"
            InputProps={{ inputProps: { min: 0, max: 365 } }}
            helperText="Days to extend subscription (0 = no extension)"
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 0, gap: 1 }}>
        <Button onClick={onClose} size="small" sx={{ textTransform: "none" }}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          sx={{
            bgcolor: C.warning,
            textTransform: "none",
            "&:hover": { bgcolor: "#ea580c" },
          }}
        >
          {loading ? <CircularProgress size={20} /> : "Confirm Upgrade"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Deactivate Dialog
const DeactivateDialog = ({ open, client, onClose, onConfirm, loading }) => {
  const isActive = client?.status === "active";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: "16px" } }}
    >
      <DialogTitle sx={{ p: 2, pb: 0 }}>
        <Typography sx={{ fontWeight: 700, fontSize: "0.9rem" }}>
          {isActive ? "Deactivate" : "Activate"} Customer
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ p: 2 }}>
        <Typography sx={{ fontSize: "0.75rem", color: C.text.secondary }}>
          Are you sure you want to {isActive ? "deactivate" : "activate"}{" "}
          <strong>{client?.customerName}</strong>?
          {isActive && " They will lose access until reactivated."}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 0, gap: 1 }}>
        <Button onClick={onClose} size="small" sx={{ textTransform: "none" }}>
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          disabled={loading}
          sx={{
            bgcolor: isActive ? C.error : C.success,
            textTransform: "none",
          }}
        >
          {loading ? (
            <CircularProgress size={20} />
          ) : isActive ? (
            "Deactivate"
          ) : (
            "Activate"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Loading Skeleton
const DetailSkeleton = () => (
  <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: C.surface, minHeight: "100vh" }}>
    <Skeleton variant="rounded" height={80} sx={{ mb: 2, borderRadius: 2 }} />
    <Grid container spacing={2} sx={{ mb: 2 }}>
      {[1, 2, 3, 4].map((i) => (
        <Grid key={i} item xs={6} sm={3} md={3}>
          <Skeleton variant="rounded" height={100} sx={{ borderRadius: 2 }} />
        </Grid>
      ))}
    </Grid>
    <Skeleton variant="rounded" height={48} sx={{ mb: 2, borderRadius: 2 }} />
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <Skeleton variant="rounded" height={320} sx={{ borderRadius: 2 }} />
      </Grid>
      <Grid item xs={12} md={6}>
        <Skeleton variant="rounded" height={320} sx={{ borderRadius: 2 }} />
      </Grid>
    </Grid>
  </Box>
);

// Access Denied
const AccessDenied = () => {
  const nav = useNavigate();
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        textAlign: "center",
        p: 3,
      }}
    >
      <Box
        sx={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          bgcolor: `${C.error}15`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 2,
        }}
      >
        <LockIcon sx={{ fontSize: 40, color: C.error }} />
      </Box>
      <Typography
        sx={{
          fontWeight: 700,
          fontSize: "1.25rem",
          color: C.text.primary,
          mb: 1,
        }}
      >
        Access Denied
      </Typography>
      <Typography
        sx={{
          fontSize: "0.875rem",
          color: C.text.secondary,
          mb: 3,
          maxWidth: 400,
        }}
      >
        Administrators only.
      </Typography>
      <Button
        variant="contained"
        onClick={() => nav("/admin/clients")}
        sx={{ bgcolor: C.primary, textTransform: "none" }}
      >
        Back to Customers
      </Button>
    </Box>
  );
};

// MAIN COMPONENT
export default function ClientDetails() {
  const theme = useTheme();
  const nav = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const {
    selectedClient,
    loading,
    initialLoading,
    error,
    actionLoading,
    getClientById,
    editClient,
    changeClientStatus,
    renewClientMembership,
  } = useClient();
  const { user, isAuthenticated } = useAuth();

  const clientId = id || location.state?.clientId;
  const canManageCustomers =
    user?.role === "super_admin" || user?.role === "admin";

  const [tab, setTab] = useState(0);
  const [editOpen, setEditOpen] = useState(false);
  const [renewOpen, setRenewOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [fetchError, setFetchError] = useState(null);
  const [isFetching, setIsFetching] = useState(true);

  const showToast = useCallback((msg, sev = "success") => {
    setToast({ open: true, message: msg, severity: sev });
  }, []);

  const closeToast = useCallback(() => {
    setToast((p) => ({ ...p, open: false }));
  }, []);

  const loadData = useCallback(async () => {
    if (!clientId) {
      setFetchError("No client ID provided");
      setIsFetching(false);
      return;
    }
    setIsFetching(true);
    try {
      await getClientById(clientId);
      setFetchError(null);
    } catch (e) {
      const msg = fmtErr(e);
      setFetchError(msg);
      showToast(msg, "error");
    } finally {
      setIsFetching(false);
    }
  }, [clientId, getClientById, showToast]);

  useEffect(() => {
    if (clientId && isAuthenticated && canManageCustomers) {
      loadData();
    } else if (!clientId) {
      setFetchError("Client ID missing");
      setIsFetching(false);
    } else if (!canManageCustomers && isAuthenticated) {
      setFetchError("Access denied.");
      setIsFetching(false);
    }
  }, [clientId, isAuthenticated, canManageCustomers, loadData]);

  if (!isAuthenticated) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress sx={{ color: C.primary }} />
      </Box>
    );
  }

  if (!canManageCustomers) return <AccessDenied />;

  const client = selectedClient;
  const plan = PLANS[client?.membershipPlan] || PLANS.free;
  const isActive = client?.status === "active";
  const daysLeft = client?.daysRemaining || 0;
  const used = client?.usersUsed || 0;
  const limit = client?.licenseLimit || 0;
  const usagePct =
    limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  const expiring = daysLeft > 0 && daysLeft <= 7;

  const handleEdit = async (formData) => {
    try {
      await editClient(clientId, {
        customerName: formData.customerName,
        membershipPlan: formData.membershipPlan,
        licenseLimit: parseInt(formData.licenseLimit),
        phone: formData.phone,
        website: formData.website,
        notes: formData.notes,
      });
      showToast("Customer updated successfully!");
      setEditOpen(false);
      await loadData();
    } catch (e) {
      showToast(fmtErr(e), "error");
    }
  };

  const handleUpgrade = async (newPlan, extendDays) => {
    try {
      await editClient(clientId, {
        membershipPlan: newPlan,
        extendDays: extendDays,
      });
      showToast(
        `Upgraded to ${newPlan.charAt(0).toUpperCase() + newPlan.slice(1)} plan!`,
      );
      setUpgradeOpen(false);
      await loadData();
    } catch (e) {
      showToast(fmtErr(e), "error");
    }
  };

  const handleRenew = async (days) => {
    try {
      await renewClientMembership(clientId, days);
      showToast(`Membership renewed for ${days} days!`);
      setRenewOpen(false);
      await loadData();
    } catch (e) {
      showToast(fmtErr(e), "error");
    }
  };

  const handleDeactivate = async () => {
    const newStatus = isActive ? "inactive" : "active";
    try {
      await changeClientStatus(clientId, newStatus);
      showToast(
        `Customer ${newStatus === "active" ? "activated" : "deactivated"} successfully!`,
      );
      setDeactivateOpen(false);
      await loadData();
    } catch (e) {
      showToast(fmtErr(e), "error");
    }
  };

  if ((initialLoading || loading || isFetching) && !selectedClient) {
    return <DetailSkeleton />;
  }

  if (fetchError || (error && !selectedClient)) {
    return (
      <Box sx={{ textAlign: "center", py: 8, px: 2 }}>
        <ErrorOutlineIcon sx={{ fontSize: 64, color: C.error, mb: 2 }} />
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: "1rem",
            color: C.text.primary,
            mb: 1,
          }}
        >
          Failed to Load Customer
        </Typography>
        <Typography
          sx={{ fontSize: "0.75rem", color: C.text.secondary, mb: 3 }}
        >
          {fetchError || error}
        </Typography>
        <Stack direction="row" spacing={2} justifyContent="center">
          <Button
            variant="outlined"
            onClick={() => nav("/admin/clients")}
            startIcon={<ArrowBackIcon />}
            sx={{ textTransform: "none" }}
          >
            Go Back
          </Button>
          <Button
            variant="contained"
            onClick={loadData}
            startIcon={<RefreshIcon />}
            sx={{ bgcolor: C.primary, textTransform: "none" }}
          >
            Retry
          </Button>
        </Stack>
      </Box>
    );
  }

  if (!selectedClient && !loading && !isFetching) {
    return (
      <Box sx={{ textAlign: "center", py: 8, px: 2 }}>
        <Typography sx={{ fontWeight: 700, fontSize: "1rem", mb: 1 }}>
          Customer Not Found
        </Typography>
        <Button
          variant="outlined"
          onClick={() => nav("/admin/clients")}
          startIcon={<ArrowBackIcon />}
          sx={{ textTransform: "none" }}
        >
          Back
        </Button>
      </Box>
    );
  }

  const TABS = [
    { icon: DashboardIcon, label: "Overview" },
    { icon: SubscriptionIcon, label: "Subscription" },
    { icon: SettingsIcon, label: "Settings" },
  ];

  return (
    <Box sx={{ bgcolor: C.surface, minHeight: "100vh" }}>
      {(loading || actionLoading) && !initialLoading && !isFetching && (
        <LinearProgress sx={{ height: 3 }} />
      )}

      {/* Top Header Bar */}
      <Box
        sx={{
          bgcolor: "white",
          borderBottom: `1px solid ${C.border}`,
          px: { xs: 2, sm: 3 },
          py: { xs: 1.5, sm: 2 },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          {/* Left Section */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: { xs: 1.5, sm: 2 },
            }}
          >
            <IconButton
              onClick={() => nav("/admin/clients")}
              size="small"
              sx={{
                bgcolor: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: "8px",
              }}
            >
              <ArrowBackIcon sx={{ fontSize: "1rem" }} />
            </IconButton>
            <Avatar
              sx={{
                width: { xs: 40, sm: 48 },
                height: { xs: 40, sm: 48 },
                borderRadius: "10px",
                bgcolor: C.primary,
                fontSize: "0.95rem",
                fontWeight: 700,
              }}
            >
              {initials(client?.customerName)}
            </Avatar>
            <Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  flexWrap: "wrap",
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: { xs: "0.95rem", sm: "1rem" },
                    color: C.text.primary,
                  }}
                >
                  {client?.customerName}
                </Typography>
                <Chip
                  label={isActive ? "Active" : "Inactive"}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: "0.6rem",
                    fontWeight: 700,
                    bgcolor: isActive ? `${C.success}15` : `${C.error}15`,
                    color: isActive ? C.success : C.error,
                  }}
                />
                <Chip
                  label={plan.label}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: "0.6rem",
                    fontWeight: 700,
                    bgcolor: plan.bg,
                    color: plan.color,
                  }}
                />
              </Box>
              <Box
                sx={{
                  display: "flex",
                  gap: { xs: 1, sm: 2 },
                  mt: 0.5,
                  flexWrap: "wrap",
                }}
              >
                {client?.email && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <EmailIcon sx={{ fontSize: 11, color: C.text.muted }} />
                    <Typography
                      sx={{ fontSize: "0.65rem", color: C.text.secondary }}
                    >
                      {client.email}
                    </Typography>
                  </Box>
                )}
                {client?.phone && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <PhoneIcon sx={{ fontSize: 11, color: C.text.muted }} />
                    <Typography
                      sx={{ fontSize: "0.65rem", color: C.text.secondary }}
                    >
                      {client.phone}
                    </Typography>
                  </Box>
                )}
                {client?.website && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <LanguageIcon sx={{ fontSize: 11, color: C.text.muted }} />
                    <Typography
                      sx={{ fontSize: "0.65rem", color: C.text.secondary }}
                    >
                      {client.website}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
          {/* Right Section */}
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              size="small"
              variant="contained"
              startIcon={<EditIcon sx={{ fontSize: "0.8rem" }} />}
              onClick={() => setEditOpen(true)}
              disabled={actionLoading}
              sx={{
                textTransform: "none",
                fontSize: "0.75rem",
                bgcolor: C.primary,
                borderRadius: "8px",
                "&:hover": { bgcolor: C.primaryDark },
              }}
            >
              Edit Customer
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => setDeactivateOpen(true)}
              disabled={actionLoading}
              sx={{
                textTransform: "none",
                fontSize: "0.75rem",
                borderRadius: "8px",
                borderColor: C.border,
                color: C.text.secondary,
              }}
            >
              {isActive ? "Disable" : "Enable"}
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Stat Tiles Row */}
      <Box
        sx={{
          px: { xs: 2, sm: 3 },
          py: { xs: 1.5, sm: 2 },
          bgcolor: "white",
          borderBottom: `1px solid ${C.border}`,
        }}
      >
        <Grid container spacing={{ xs: 1, sm: 1.5 }}>
          <Grid item xs={12} sm={6} md={4}>
            <StatTile
              icon={PeopleIcon}
              label="Users"
              value={used}
              sub={`of ${limit} licenses`}
              color={C.primary}
              loading={isFetching}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatTile
              icon={AssignmentIcon}
              label="Active Checklist"
              value={client?.activeChecklistCount || 0}
              sub="View all forms →"
              color="#7c3aed"
              loading={isFetching}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatTile
              icon={InventoryIcon}
              label="Assets"
              value={client?.stats?.assets || 0}
              sub="total managed"
              color={C.warning}
              loading={isFetching}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatTile
              icon={TrendingUpIcon}
              label="Submissions"
              value={client?.stats?.submissions || 0}
              sub="all time"
              color={C.success}
              loading={isFetching}
            />
          </Grid>
        </Grid>
      </Box>

      {/* Tab Bar */}
      <Box sx={{ bgcolor: "white", borderBottom: `1px solid ${C.border}` }}>
        <Box sx={{ display: "flex", px: { xs: 2, sm: 3 } }}>
          {TABS.map((t, i) => (
            <Button
              key={i}
              onClick={() => setTab(i)}
              sx={{
                borderRadius: 0,
                py: 1.5,
                px: { xs: 1.5, sm: 2.5 },
                textTransform: "none",
                fontWeight: tab === i ? 700 : 500,
                color: tab === i ? C.primary : C.text.secondary,
                borderBottom: "2px solid",
                borderColor: tab === i ? C.primary : "transparent",
                minWidth: "auto",
                gap: 0.75,
                "&:hover": { bgcolor: "transparent", color: C.primary },
              }}
            >
              <t.icon sx={{ fontSize: "0.9rem" }} />
              <Typography sx={{ fontSize: { xs: "0.7rem", sm: "0.8rem" } }}>
                {t.label}
              </Typography>
            </Button>
          ))}
        </Box>
      </Box>

      {/* Tab Content */}
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        {/* Overview Tab */}
        {tab === 0 && (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: 2,
              width: "100%",
            }}
          >
            <Card
              sx={{ borderRadius: 2, border: `1px solid ${C.border}`, width: "100%" }}
              elevation={0}
            >
              <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.8rem",
                    color: C.text.primary,
                    mb: 2,
                  }}
                >
                  Account Information
                </Typography>
                <Stack divider={<Divider sx={{ my: 1 }} />}>
                  {[
                    {
                      label: "Customer ID",
                      value: client?._id?.slice(-8) || "—",
                    },
                    { label: "Email", value: client?.email || "—" },
                    { label: "Phone", value: client?.phone || "—" },
                    { label: "Website", value: client?.website || "—" },
                    {
                      label: "Start Date",
                      value: fmtDate(client?.subscriptionStartDate),
                    },
                    {
                      label: "End Date",
                      value: fmtDate(client?.subscriptionEndDate),
                    },
                    { label: "Days Remaining", value: `${daysLeft} days` },
                  ].map((row) => (
                    <Box
                      key={row.label}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: 1,
                        py: 0.25,
                      }}
                    >
                      <Typography
                        sx={{ fontSize: "0.72rem", color: C.text.muted }}
                      >
                        {row.label}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "0.78rem",
                          fontWeight: 600,
                          color: C.text.primary,
                          textAlign: "right",
                        }}
                      >
                        {row.value}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>

            <Card
              sx={{ borderRadius: 2, border: `1px solid ${C.border}`, width: "100%" }}
              elevation={0}
            >
              <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.8rem",
                    color: C.text.primary,
                    mb: 2,
                  }}
                >
                  Usage Overview
                </Typography>
                <Box
                  sx={{
                    p: 2,
                    bgcolor: C.surface,
                    borderRadius: 2,
                    mb: client?.notes ? 2 : 0,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      mb: 1,
                    }}
                  >
                    <Typography
                      sx={{ fontSize: "0.72rem", color: C.text.secondary, fontWeight: 500 }}
                    >
                      User Licenses
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "0.85rem",
                        fontWeight: 700,
                        color: usagePct > 85 ? C.error : C.text.primary,
                      }}
                    >
                      {used} / {limit}{" "}
                      <Typography
                        component="span"
                        sx={{ fontSize: "0.7rem", fontWeight: 500, color: C.text.muted }}
                      >
                        ({usagePct}%)
                      </Typography>
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={usagePct}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: "#e2e8f0",
                      "& .MuiLinearProgress-bar": {
                        bgcolor: usagePct > 85 ? C.error : C.primary,
                        borderRadius: 4,
                      },
                    }}
                  />
                </Box>
                {client?.notes && (
                  <Box sx={{ p: 2, bgcolor: C.surface, borderRadius: 2 }}>
                    <Typography
                      sx={{
                        fontSize: "0.65rem",
                        color: C.text.muted,
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                        mb: 0.75,
                      }}
                    >
                      Notes
                    </Typography>
                    <Typography
                      sx={{ fontSize: "0.78rem", color: C.text.secondary, lineHeight: 1.5 }}
                    >
                      {client.notes}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Subscription Tab */}
        {tab === 1 && (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1.6fr 1fr" },
              gap: 2,
              width: "100%",
              alignItems: "start",
            }}
          >
            <Card
              sx={{ borderRadius: 2, border: `1px solid ${C.border}`, width: "100%" }}
              elevation={0}
            >
              <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.7rem",
                    color: C.text.muted,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    mb: 1.5,
                  }}
                >
                  Current Plan
                </Typography>
                <Box
                  sx={{
                    bgcolor: plan.bg,
                    borderRadius: 2,
                    p: { xs: 2, sm: 2.5 },
                    mb: 2,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      mb: 2,
                      flexWrap: "wrap",
                      gap: 1,
                    }}
                  >
                    <Box>
                      <Typography
                        sx={{
                          fontWeight: 800,
                          fontSize: "1.3rem",
                          color: plan.color,
                        }}
                      >
                        {plan.label}
                      </Typography>
                      <Typography
                        sx={{ fontSize: "0.7rem", color: C.text.secondary }}
                      >
                        Premium business features
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: "right" }}>
                      <Typography
                        sx={{
                          fontWeight: 800,
                          fontSize: "1.4rem",
                          color: plan.color,
                        }}
                      >
                        {plan.price.split("/")[0]}
                      </Typography>
                      <Typography
                        sx={{ fontSize: "0.65rem", color: C.text.secondary }}
                      >
                        per month
                      </Typography>
                    </Box>
                  </Box>
                  {plan.features.map((f) => (
                    <Box
                      key={f}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 0.75,
                      }}
                    >
                      <CheckCircleIcon
                        sx={{ fontSize: "0.85rem", color: plan.color }}
                      />
                      <Typography
                        sx={{ fontSize: "0.72rem", color: C.text.secondary }}
                      >
                        {f}
                      </Typography>
                    </Box>
                  ))}
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    gap: 1.5,
                    flexDirection: { xs: "column", sm: "row" },
                  }}
                >
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={
                      <TrendingUpIcon sx={{ fontSize: "0.85rem" }} />
                    }
                    onClick={() => setUpgradeOpen(true)}
                    disabled={actionLoading}
                    sx={{
                      bgcolor: C.warning,
                      textTransform: "none",
                      borderRadius: "8px",
                      fontSize: "0.8rem",
                      "&:hover": { bgcolor: "#ea580c" },
                    }}
                  >
                    Upgrade Plan
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => setRenewOpen(true)}
                    disabled={actionLoading}
                    sx={{
                      textTransform: "none",
                      borderRadius: "8px",
                      fontSize: "0.8rem",
                      borderColor: C.border,
                      color: C.text.secondary,
                    }}
                  >
                    Renew Membership
                  </Button>
                </Box>
              </CardContent>
            </Card>

            <Card
              sx={{ borderRadius: 2, border: `1px solid ${C.border}`, width: "100%" }}
              elevation={0}
            >
              <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.7rem",
                    color: C.text.muted,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    mb: 2,
                  }}
                >
                  Billing Cycle
                </Typography>
                <Stack divider={<Divider sx={{ my: 0 }} />} spacing={1.5}>
                  {[
                    { label: "Billing Period", value: "Monthly" },
                    {
                      label: "Next Bill Date",
                      value: fmtDate(client?.subscriptionEndDate) || "—",
                    },
                    { label: "Amount", value: plan.price.split("/")[0] },
                    {
                      label: "Payment Method",
                      value: client?.paymentMethod || "Not set",
                    },
                  ].map((row) => (
                    <Box
                      key={row.label}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 2,
                        pb: 1.5,
                        borderBottom: `1px solid ${C.border}`,
                        "&:last-of-type": { borderBottom: "none", pb: 0 },
                      }}
                    >
                      <Typography
                        sx={{ fontSize: "0.75rem", color: C.text.secondary, whiteSpace: "nowrap" }}
                      >
                        {row.label}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "0.8rem",
                          fontWeight: 700,
                          color: C.text.primary,
                          textAlign: "right",
                        }}
                      >
                        {row.value}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Settings Tab */}
        {tab === 2 && (
          <Card
            sx={{ borderRadius: 2, border: `1px solid ${C.border}` }}
            elevation={0}
          >
            <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: "0.8rem",
                  color: C.text.primary,
                  mb: 2,
                }}
              >
                Account Settings
              </Typography>

              {expiring && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 1.25,
                    bgcolor: `${C.warning}10`,
                    border: `1px solid ${C.warning}30`,
                    borderRadius: 2,
                    p: 1.75,
                    mb: 2.5,
                  }}
                >
                  <WarningAmberIcon
                    sx={{
                      fontSize: "1rem",
                      color: C.warning,
                      flexShrink: 0,
                      mt: 0.1,
                    }}
                  />
                  <Box>
                    <Typography
                      sx={{
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        color: C.warning,
                      }}
                    >
                      License expiring in {daysLeft} days
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "0.65rem",
                        color: C.text.secondary,
                        mt: 0.25,
                      }}
                    >
                      Renew now to{" "}
                      <span style={{ color: C.warning, fontWeight: 600 }}>
                        avoid service interruption
                      </span>
                    </Typography>
                  </Box>
                </Box>
              )}

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  py: 2,
                  borderBottom: `1px solid ${C.border}`,
                }}
              >
                <Box>
                  <Typography
                    sx={{
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      color: C.text.primary,
                    }}
                  >
                    Deactivate Account
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "0.65rem",
                      color: C.text.secondary,
                      mt: 0.25,
                    }}
                  >
                    Temporarily disable customer access
                  </Typography>
                </Box>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setDeactivateOpen(true)}
                  disabled={actionLoading}
                  sx={{
                    textTransform: "none",
                    fontSize: "0.72rem",
                    borderRadius: "8px",
                    borderColor: C.border,
                    color: C.text.secondary,
                    minWidth: 80,
                  }}
                >
                  Deactivate
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}
      </Box>

      {/* Modals */}
      <EditModal
        open={editOpen}
        client={client}
        onClose={() => setEditOpen(false)}
        onSave={handleEdit}
        loading={actionLoading}
      />
      <RenewModal
        open={renewOpen}
        client={client}
        onClose={() => setRenewOpen(false)}
        onRenew={handleRenew}
        loading={actionLoading}
      />
      <UpgradeModal
        open={upgradeOpen}
        client={client}
        currentPlan={client?.membershipPlan}
        onClose={() => setUpgradeOpen(false)}
        onUpgrade={handleUpgrade}
        loading={actionLoading}
      />
      <DeactivateDialog
        open={deactivateOpen}
        client={client}
        onClose={() => setDeactivateOpen(false)}
        onConfirm={handleDeactivate}
        loading={actionLoading}
      />

      <Snackbar
        open={toast.open}
        autoHideDuration={5000}
        onClose={closeToast}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={closeToast}
          severity={toast.severity}
          sx={{ borderRadius: 2 }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

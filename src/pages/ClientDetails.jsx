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
  InputAdornment,
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
  Save as SaveIcon,
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

const ACCESS_TYPES = [
  { value: "read_only", label: "Read only" },
  { value: "edit_only", label: "Edit only" },
];

const getAccountCopy = (role) => {
  const isSuperAdmin = role === "super_admin";
  const singular = isSuperAdmin ? "Customer" : "Admin";
  const plural = isSuperAdmin ? "Customers" : "Admins";
  const singularLower = singular.toLowerCase();

  return {
    singular,
    plural,
    singularLower,
    nameLabel: `${singular} name`,
    editTitle: `Edit ${singularLower}`,
    updateSubtitle: `Update the ${singular}'s details`,
    updatedToast: `${singular} updated successfully!`,
    statusToast: (status) =>
      `${singular} ${status === "active" ? "activated" : "deactivated"} successfully!`,
    deactivateTitle: (isActive) => `${isActive ? "Deactivate" : "Activate"} ${singular}`,
    loadFailed: `Failed to Load ${singular}`,
    notFound: `${singular} Not Found`,
    backLabel: `Back to ${plural}`,
    detailsIdLabel: `${singular} ID`,
  };
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
  palette = C,
}) => {
  if (loading) {
    return (
      <Box
        sx={{
          bgcolor: palette.card,
          
          border: `1px solid ${palette.border}`,
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
          bgcolor: palette.card,
          border: `1px solid ${palette.border}`,
        width: "100%",
        minWidth: 0,
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
const EditModal = ({
  open,
  client,
  onClose,
  onSave,
  loading,
  canEditPlanLimits = true,
  showPlanLimits = true,
  copy = getAccountCopy("admin"),
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isDark = theme.palette.mode === "dark";
  const modalColors = isDark
    ? {
        surface: "#0c1726",
        header: "#111c2b",
        border: "rgba(148, 163, 184, 0.22)",
        primaryLight: "rgba(26, 166, 196, 0.12)",
        text: {
          primary: "#f8fafc",
          secondary: "#d9e2ef",
          muted: "#aeb8c8",
        },
      }
    : {
        surface: C.surface,
        header: "white",
        border: C.border,
        primaryLight: C.primaryLight,
        text: C.text,
      };
  const [activeTab, setActiveTab] = useState(0);
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (client && open) {
      setActiveTab(0);
      setForm({
        customerName: client.customerName || "",
        email: client.email || "",
        phone: client.phone || "",
        website: client.website || "",
        accessType: client.accessType || "read_only",
        membershipPlan: client.membershipPlan || "standard",
        licenseLimit: client.licenseLimit || 10,
        assetLimit: client.assetLimit || 100,
        duration: 30,
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

  const handleNumberChange = (name, value, min, max) => {
    const nextValue = value === "" ? "" : Math.min(max, Math.max(min, Number(value)));
    setForm((p) => ({ ...p, [name]: nextValue }));
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
    if (canEditPlanLimits) {
      if (form.licenseLimit < 1) e.licenseLimit = "Min 1";
      if (form.licenseLimit > 10000) e.licenseLimit = "Max 10000";
      if (form.assetLimit < 1) e.assetLimit = "Min 1";
      if (form.assetLimit > 10000) e.assetLimit = "Max 10000";
      if ((Number(form.duration) || 0) < 1) e.duration = "Min 1";
      if ((Number(form.duration) || 0) > 365) e.duration = "Max 365";
    }
    if (!ACCESS_TYPES.some((option) => option.value === form.accessType)) {
      e.accessType = "Access type is required";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    await onSave(form);
  };

  const tabs = showPlanLimits ? ["Account info", "Plan & limits"] : ["Account info"];
  const tabHasError = (index) => {
    if (index === 0) {
      return Boolean(errors.customerName || errors.phone || errors.website || errors.accessType);
    }
    return Boolean(errors.licenseLimit || errors.assetLimit || errors.duration);
  };

  const inputSx = (hasError = false) => ({
    "& .MuiOutlinedInput-root": {
      borderRadius: "12px",
      fontSize: "0.875rem",
      "& fieldset": { borderColor: hasError ? C.error : C.border },
      "&:hover fieldset": { borderColor: hasError ? C.error : C.primary },
      "&.Mui-focused fieldset": {
        borderColor: hasError ? C.error : C.primary,
        borderWidth: "1.5px",
      },
    },
    "& .MuiInputLabel-root": { fontSize: "0.8rem" },
    "& .MuiInputBase-input": { py: 1.3 },
    "& .MuiFormHelperText-root": { fontSize: "0.68rem", ml: 0, mt: 0.5 },
  });

  const numberFieldSx = (hasError = false) => ({
    ...inputSx(hasError),
    "& input[type=number]": {
      MozAppearance: "textfield",
    },
    "& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button": {
      WebkitAppearance: "none",
      margin: 0,
    },
  });

  const accountInfo = (
    <Stack spacing={2} sx={{ mt: 2 }}>
      <TextField
        name="customerName"
        label={copy.nameLabel}
        value={form.customerName || ""}
        onChange={handleChange}
        fullWidth
        size="small"
        required
        error={!!errors.customerName}
        helperText={errors.customerName}
        InputLabelProps={{ shrink: true }}
        sx={inputSx(!!errors.customerName)}
      />
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            name="email"
            label="Email address"
            type="email"
            value={form.email || ""}
            fullWidth
            size="small"
            disabled
            InputLabelProps={{ shrink: true }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon sx={{ fontSize: 16, color: C.text.muted }} />
                </InputAdornment>
              ),
            }}
            sx={inputSx()}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            name="phone"
            label="Phone number"
            value={form.phone || ""}
            onChange={handleChange}
            fullWidth
            size="small"
            required
            error={!!errors.phone}
            helperText={errors.phone}
            InputLabelProps={{ shrink: true }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PhoneIcon sx={{ fontSize: 16, color: C.text.muted }} />
                </InputAdornment>
              ),
            }}
            sx={inputSx(!!errors.phone)}
          />
        </Grid>
      </Grid>
      <TextField
        name="website"
        label="Website (optional)"
        value={form.website || ""}
        onChange={handleChange}
        fullWidth
        size="small"
        error={!!errors.website}
        helperText={errors.website}
        placeholder="https://acme.com"
        InputLabelProps={{ shrink: true }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <LanguageIcon sx={{ fontSize: 16, color: C.text.muted }} />
            </InputAdornment>
          ),
        }}
        sx={inputSx(!!errors.website)}
      />
      <FormControl fullWidth size="small" error={!!errors.accessType} sx={inputSx(!!errors.accessType)}>
        <InputLabel id="details-access-type-label">Access type</InputLabel>
        <Select
          labelId="details-access-type-label"
          label="Access type"
          name="accessType"
          value={form.accessType || "read_only"}
          onChange={handleChange}
          MenuProps={{ PaperProps: { sx: { borderRadius: 2, mt: 0.5 } } }}
        >
          {ACCESS_TYPES.map((option) => (
            <MenuItem key={option.value} value={option.value} sx={{ fontSize: "0.85rem" }}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
        {errors.accessType && (
          <Typography sx={{ color: C.error, fontSize: "0.68rem", mt: 0.5 }}>
            {errors.accessType}
          </Typography>
        )}
      </FormControl>
      <TextField
        name="notes"
        label="Notes (optional)"
        multiline
        rows={isMobile ? 2 : 4}
        value={form.notes || ""}
        onChange={handleChange}
        fullWidth
        size="small"
        InputLabelProps={{ shrink: true }}
        sx={{
          ...inputSx(),
          "& .MuiOutlinedInput-root": {
            ...inputSx()["& .MuiOutlinedInput-root"],
            alignItems: "flex-start",
          },
        }}
      />
    </Stack>
  );

  const planLimits = (
    <Stack spacing={2.5} sx={{ mt: 2 }}>
      <Box>
        <Typography
          sx={{
            fontSize: "0.72rem",
            fontWeight: 600,
            color: modalColors.text.muted,
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            mb: 1.5,
          }}
        >
          Membership plan
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {Object.entries(PLANS).map(([key, plan]) => (
            <Chip
              key={key}
              label={plan.label}
              onClick={() => {
                if (canEditPlanLimits) {
                  setForm((prev) => ({ ...prev, membershipPlan: key }));
                }
              }}
              size="small"
              sx={{
                cursor: canEditPlanLimits ? "pointer" : "not-allowed",
                height: 30,
                fontWeight: form.membershipPlan === key ? 700 : 500,
                fontSize: "0.75rem",
                bgcolor: form.membershipPlan === key ? C.primary : "transparent",
                color: form.membershipPlan === key ? "white" : C.text.secondary,
                border: `1px solid ${form.membershipPlan === key ? C.primary : C.border}`,
                "&:hover": {
                  bgcolor: form.membershipPlan === key ? C.primaryDark : C.surface,
                },
              }}
            />
          ))}
        </Box>
      </Box>
      <Divider />
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <TextField
            name="licenseLimit"
            label="License limit"
            type="number"
            value={form.licenseLimit ?? ""}
            onChange={(e) => handleNumberChange("licenseLimit", e.target.value, 1, 10000)}
            fullWidth
            size="small"
            disabled={!canEditPlanLimits}
            error={!!errors.licenseLimit}
            helperText={errors.licenseLimit}
            InputLabelProps={{ shrink: true }}
            inputProps={{ min: 1, max: 10000, inputMode: "numeric" }}
            sx={numberFieldSx(!!errors.licenseLimit)}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            name="assetLimit"
            label="Asset limit"
            type="number"
            value={form.assetLimit ?? ""}
            onChange={(e) => handleNumberChange("assetLimit", e.target.value, 1, 10000)}
            fullWidth
            size="small"
            disabled={!canEditPlanLimits}
            error={!!errors.assetLimit}
            helperText={errors.assetLimit}
            InputLabelProps={{ shrink: true }}
            inputProps={{ min: 1, max: 10000, inputMode: "numeric" }}
            sx={numberFieldSx(!!errors.assetLimit)}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            name="duration"
            label="Duration (days)"
            type="number"
            value={form.duration ?? ""}
            onChange={(e) => handleNumberChange("duration", e.target.value, 1, 365)}
            fullWidth
            size="small"
            disabled={!canEditPlanLimits}
            error={!!errors.duration}
            helperText={errors.duration}
            InputLabelProps={{ shrink: true }}
            inputProps={{ min: 1, max: 365, inputMode: "numeric" }}
            sx={numberFieldSx(!!errors.duration)}
          />
        </Grid>
      </Grid>
    </Stack>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={fullScreen}
      PaperProps={{
        sx: {
          borderRadius: fullScreen ? 0 : "16px",
          overflow: "hidden",
          margin: { xs: 0, sm: 2 },
          bgcolor: modalColors.surface,
        },
      }}
    >
      <DialogTitle sx={{ p: 0 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: { xs: 2, sm: 2.5 },
            py: { xs: 1.5, sm: 1.75 },
            bgcolor: modalColors.header,
            borderBottom: `1px solid ${modalColors.border}`,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
            <Box
              sx={{
                width: { xs: 30, sm: 34 },
                height: { xs: 30, sm: 34 },
                borderRadius: "8px",
                bgcolor: modalColors.primaryLight,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <DashboardIcon sx={{ fontSize: "1rem", color: C.primary }} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", color: modalColors.text.primary }}>
                {copy.editTitle}
              </Typography>
              <Typography sx={{ fontSize: "0.72rem", color: modalColors.text.secondary }}>
                {copy.updateSubtitle}
              </Typography>
            </Box>
          </Box>
          <IconButton
            size="small"
            onClick={onClose}
            sx={{
              border: `1px solid ${modalColors.border}`,
              borderRadius: "8px",
              width: 32,
              height: 32,
              color: modalColors.text.secondary,
            }}
          >
            <CloseIcon sx={{ fontSize: "0.9rem" }} />
          </IconButton>
        </Box>
        <Box
          sx={{
            display: "flex",
            borderBottom: `1px solid ${modalColors.border}`,
            px: { xs: 1.5, sm: 2.5 },
            bgcolor: modalColors.header,
            overflowX: "auto",
          }}
        >
          {tabs.map((label, index) => (
            <Box
              key={label}
              onClick={() => setActiveTab(index)}
              sx={{
                px: { xs: 1.5, sm: 2 },
                py: 1.25,
                cursor: "pointer",
                fontSize: "0.8rem",
                fontWeight: activeTab === index ? 700 : 500,
                color: activeTab === index ? C.primary : modalColors.text.secondary,
                borderBottom: "2px solid",
                borderColor: activeTab === index ? C.primary : "transparent",
                display: "inline-flex",
                alignItems: "center",
                gap: 0.75,
                flexShrink: 0,
              }}
            >
              {label}
              {tabHasError(index) && (
                <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: C.error }} />
              )}
            </Box>
          ))}
        </Box>
      </DialogTitle>

      <DialogContent
        sx={{
          px: { xs: 2, sm: 2.5 },
          py: { xs: 2, sm: 2.5 },
          bgcolor: modalColors.surface,
          maxHeight: { xs: "calc(100vh - 180px)", sm: "60vh" },
          overflowY: "auto",
        }}
      >
        {activeTab === 0 && accountInfo}
        {showPlanLimits && activeTab === 1 && planLimits}
      </DialogContent>
      <DialogActions
        sx={{
          px: { xs: 2, sm: 2.5 },
          py: 1.5,
          borderTop: `1px solid ${modalColors.border}`,
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 1,
          bgcolor: modalColors.header,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
          <LockIcon sx={{ fontSize: "0.9rem", color: modalColors.text.muted }} />
          <Typography sx={{ fontSize: "0.72rem", color: modalColors.text.muted }}>
            {copy.singular} receives a secure Set Password email
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Button
            onClick={onClose}
            size="small"
            variant="outlined"
            sx={{
              textTransform: "none",
              fontSize: "0.8rem",
              borderRadius: "8px",
              borderColor: modalColors.border,
              color: modalColors.text.secondary,
              px: 2.5,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            size="small"
            disabled={loading}
            startIcon={loading ? null : <SaveIcon sx={{ fontSize: "0.9rem" }} />}
            sx={{
              bgcolor: C.primary,
              textTransform: "none",
              fontSize: "0.8rem",
              fontWeight: 700,
              borderRadius: "8px",
              px: 2.5,
              "&:hover": { bgcolor: C.primaryDark },
            }}
          >
            {loading ? <CircularProgress size={18} color="inherit" /> : "Save changes"}
          </Button>
        </Box>
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
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const modalColors = isDark
    ? {
        surface: "#0c1726",
        info: "rgba(15, 28, 46, 0.78)",
        border: "rgba(148, 163, 184, 0.22)",
        text: {
          secondary: "#d9e2ef",
        },
      }
    : {
        surface: C.card,
        info: C.primaryLight,
        border: C.border,
        text: {
          secondary: C.text.secondary,
        },
      };
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
      PaperProps={{ sx: { borderRadius: "16px", bgcolor: modalColors.surface } }}
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
      <DialogContent sx={{ p: 2.5, bgcolor: modalColors.surface }}>
        <Stack spacing={2}>
          <Box sx={{ p: 1.5, bgcolor: modalColors.info, borderRadius: 2, border: `1px solid ${modalColors.border}` }}>
            <Typography sx={{ fontSize: "0.7rem", color: modalColors.text.secondary }}>
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
      <DialogActions sx={{ p: 2, pt: 0, gap: 1, bgcolor: modalColors.surface }}>
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
const DeactivateDialog = ({ open, client, onClose, onConfirm, loading, copy = getAccountCopy("super_admin") }) => {
  const theme = useTheme();
  const isActive = client?.status === "active";
  const isDark = theme.palette.mode === "dark";
  const tone = isActive ? C.error : C.success;
  const dialogColors = isDark
    ? {
        surface: "#0c1726",
        header: "#111c2b",
        border: "rgba(148, 163, 184, 0.18)",
        text: "#f8fafc",
        muted: "#aeb8c8",
      }
    : {
        surface: "#ffffff",
        header: "#ffffff",
        border: C.border,
        text: C.text.primary,
        muted: C.text.secondary,
      };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "18px",
          overflow: "hidden",
          bgcolor: dialogColors.surface,
          border: `1px solid ${dialogColors.border}`,
          boxShadow: isDark ? "0 24px 80px rgba(0,0,0,0.45)" : undefined,
        },
      }}
    >
      <DialogTitle sx={{ p: 0 }}>
        <Box
          sx={{
            px: 2.25,
            py: 2,
            bgcolor: dialogColors.header,
            borderBottom: `1px solid ${dialogColors.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: "12px",
                bgcolor: `${tone}18`,
                color: tone,
                display: "grid",
                placeItems: "center",
                flexShrink: 0,
              }}
            >
              <WarningAmberIcon sx={{ fontSize: 22 }} />
            </Box>
            <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: dialogColors.text }}>
              {copy.deactivateTitle(isActive)}
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={onClose}
            sx={{
              width: 34,
              height: 34,
              borderRadius: "10px",
              border: `1px solid ${dialogColors.border}`,
              color: dialogColors.muted,
            }}
          >
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ px: 2.25, py: 2.25, bgcolor: dialogColors.surface }}>
        <Typography sx={{ fontSize: "0.9rem", color: dialogColors.text, lineHeight: 1.55 }}>
          Are you sure you want to {isActive ? "deactivate" : "activate"}{" "}
          <Box component="strong" sx={{ color: dialogColors.text, fontWeight: 800 }}>
            {client?.customerName}
          </Box>
          ?
        </Typography>
        <Typography sx={{ mt: 1, fontSize: "0.78rem", color: dialogColors.muted, lineHeight: 1.5 }}>
          {isActive
            ? "They will lose access immediately until the account is reactivated."
            : "They will regain access to the account immediately."}
        </Typography>
      </DialogContent>
      <DialogActions
        sx={{
          px: 2.25,
          py: 2,
          bgcolor: dialogColors.header,
          borderTop: `1px solid ${dialogColors.border}`,
          gap: 1.25,
        }}
      >
        <Button
          onClick={onClose}
          size="small"
          variant="outlined"
          sx={{
            textTransform: "none",
            borderRadius: "10px",
            px: 2.5,
            color: dialogColors.muted,
            borderColor: dialogColors.border,
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          disabled={loading}
          sx={{
            bgcolor: tone,
            textTransform: "none",
            borderRadius: "10px",
            px: 2.75,
            fontWeight: 700,
            "&:hover": {
              bgcolor: tone,
              filter: "brightness(0.92)",
            },
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
        onClick={() => nav("/dashboard")}
        sx={{ bgcolor: C.primary, textTransform: "none" }}
      >
        Back to Dashboard
      </Button>
    </Box>
  );
};

// MAIN COMPONENT
export default function ClientDetails() {
  const theme = useTheme();
  const nav = useNavigate();
  const isDark = theme.palette.mode === "dark";
  const pageColors = isDark
    ? {
        surface: "transparent",
        card: "rgba(12, 23, 38, 0.92)",
        header: "#0c1726",
        border: "rgba(148, 163, 184, 0.18)",
        text: {
          primary: "#f8fafc",
          secondary: "#d9e2ef",
          muted: "#aeb8c8",
        },
      }
    : {
        surface: C.surface,
        card: C.card,
        header: "white",
        border: C.border,
        text: C.text,
      };
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
  const canEditPlanLimits = user?.role === "super_admin";
  const isRestrictedAdmin = user?.role === "admin" && Boolean(user?.adminId);
  const canEditAdmins = !isRestrictedAdmin || user?.accessType === "edit_only";
  const canDeleteAdmins = !isRestrictedAdmin || !["read_only", "edit_only"].includes(user?.accessType);
  const copy = getAccountCopy(user?.role);
  const showPlanLimits = true;

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

  const showPermissionToast = useCallback(
    (action) => showToast(`You don't have permission to ${action}`, "error"),
    [showToast],
  );

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
    if (!canEditAdmins) {
      showPermissionToast("Edit");
      return;
    }
    try {
      const planLimitData = user?.role === "admin"
        ? {}
        : {
            membershipPlan: formData.membershipPlan,
            licenseLimit: parseInt(formData.licenseLimit),
            assetLimit: parseInt(formData.assetLimit),
            extendDays: parseInt(formData.duration),
          };
      await editClient(clientId, {
        customerName: formData.customerName,
        ...planLimitData,
        phone: formData.phone,
        website: formData.website,
        accessType: formData.accessType,
        notes: formData.notes,
      });
      showToast(copy.updatedToast);
      setEditOpen(false);
      await loadData();
    } catch (e) {
      showToast(fmtErr(e), "error");
    }
  };

  const handleUpgrade = async (newPlan, extendDays) => {
    if (!canEditPlanLimits) return;
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
    if (!canDeleteAdmins) {
      showPermissionToast("Delete");
      return;
    }
    const newStatus = isActive ? "inactive" : "active";
    try {
      await changeClientStatus(clientId, newStatus);
      showToast(
        copy.statusToast(newStatus),
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
          {copy.loadFailed}
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
          {copy.notFound}
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
    ...(showPlanLimits ? [{ icon: SubscriptionIcon, label: "Subscription" }] : []),
    { icon: SettingsIcon, label: "Settings" },
  ];
  const settingsTabIndex = showPlanLimits ? 2 : 1;

  return (
    <Box sx={{ bgcolor: pageColors.surface, minHeight: "100vh" }}>
      {(loading || actionLoading) && !initialLoading && !isFetching && (
        <LinearProgress sx={{ height: 3 }} />
      )}

      {/* Top Header Bar */}
      <Box
        sx={{
          bgcolor: pageColors.header,
          borderBottom: `1px solid ${pageColors.border}`,
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
                bgcolor: pageColors.card,
                border: `1px solid ${pageColors.border}`,
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
                    color: pageColors.text.primary,
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
                    <EmailIcon sx={{ fontSize: 11, color: pageColors.text.muted }} />
                    <Typography
                      sx={{ fontSize: "0.65rem", color: pageColors.text.secondary }}
                    >
                      {client.email}
                    </Typography>
                  </Box>
                )}
                {client?.phone && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <PhoneIcon sx={{ fontSize: 11, color: pageColors.text.muted }} />
                    <Typography
                      sx={{ fontSize: "0.65rem", color: pageColors.text.secondary }}
                    >
                      {client.phone}
                    </Typography>
                  </Box>
                )}
                {client?.website && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <LanguageIcon sx={{ fontSize: 11, color: pageColors.text.muted }} />
                    <Typography
                      sx={{ fontSize: "0.65rem", color: pageColors.text.secondary }}
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
              onClick={() => {
                if (!canEditAdmins) {
                  showPermissionToast("Edit");
                  return;
                }
                setEditOpen(true);
              }}
              disabled={actionLoading}
              sx={{
                textTransform: "none",
                fontSize: "0.75rem",
                bgcolor: C.primary,
                borderRadius: "8px",
                "&:hover": { bgcolor: C.primaryDark },
              }}
            >
              {copy.editTitle}
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => {
                if (!canDeleteAdmins) {
                  showPermissionToast("Delete");
                  return;
                }
                setDeactivateOpen(true);
              }}
              disabled={actionLoading}
              sx={{
                textTransform: "none",
                fontSize: "0.75rem",
                borderRadius: "8px",
                borderColor: pageColors.border,
                color: pageColors.text.secondary,
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
          bgcolor: pageColors.header,
          borderBottom: `1px solid ${pageColors.border}`,
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              lg: "repeat(4, minmax(0, 1fr))",
            },
            gap: { xs: 1, sm: 1.5 },
            width: "100%",
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <StatTile
              icon={PeopleIcon}
              label="Users"
              value={used}
              sub={`of ${limit} licenses`}
              color={C.primary}
              loading={isFetching}
              palette={pageColors}
            />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <StatTile
              icon={AssignmentIcon}
              label="Active Checklist"
              value={client?.activeChecklistCount || 0}
              sub="View all forms →"
              color="#7c3aed"
              loading={isFetching}
              palette={pageColors}
            />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <StatTile
              icon={InventoryIcon}
              label="Assets"
              value={client?.stats?.assets || 0}
              sub="total managed"
              color={C.warning}
              loading={isFetching}
              palette={pageColors}
            />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <StatTile
              icon={TrendingUpIcon}
              label="Submissions"
              value={client?.stats?.submissions || 0}
              sub="all time"
              color={C.success}
              loading={isFetching}
              palette={pageColors}
            />
          </Box>
        </Box>
      </Box>

      {/* Tab Bar */}
      <Box sx={{ bgcolor: pageColors.header, borderBottom: `1px solid ${pageColors.border}` }}>
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
                color: tab === i ? C.primary : pageColors.text.secondary,
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
                      label: copy.detailsIdLabel,
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
                    bgcolor: isDark ? "rgba(15, 28, 46, 0.78)" : C.surface,
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
                      bgcolor: isDark ? "rgba(148, 163, 184, 0.22)" : "#e2e8f0",
                      "& .MuiLinearProgress-bar": {
                        bgcolor: usagePct > 85 ? C.error : C.primary,
                        borderRadius: 4,
                      },
                    }}
                  />
                </Box>
                {client?.notes && (
                  <Box sx={{ p: 2, bgcolor: isDark ? "rgba(15, 28, 46, 0.78)" : C.surface, borderRadius: 2 }}>
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
        {showPlanLimits && tab === 1 && (
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
                    bgcolor: isDark ? "rgba(15, 28, 46, 0.78)" : plan.bg,
                    border: isDark ? `1px solid ${pageColors.border}` : "none",
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
                        sx={{ fontSize: "0.7rem", color: pageColors.text.secondary }}
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
                        sx={{ fontSize: "0.65rem", color: pageColors.text.secondary }}
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
                        sx={{ fontSize: "0.72rem", color: pageColors.text.secondary }}
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
                  {canEditPlanLimits && (
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
                  )}
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
        {tab === settingsTabIndex && (
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
        canEditPlanLimits={canEditPlanLimits}
        showPlanLimits={showPlanLimits}
        copy={copy}
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
        copy={copy}
      />

      <Snackbar
        open={toast.open}
        autoHideDuration={5000}
        onClose={closeToast}
  anchorOrigin={{ vertical: "top", horizontal: "right" }}>
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

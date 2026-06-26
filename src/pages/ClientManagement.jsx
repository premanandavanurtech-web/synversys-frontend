// ClientManagement.jsx - Complete Fixed Version

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Skeleton,
  Button,
  TextField,
  IconButton,
  Avatar,
  Chip,
  Divider,
  FormControl,
  Select,
  MenuItem,
  Stack,
  useTheme,
  useMediaQuery,
  Menu,
  Tooltip,
  CircularProgress,
  Snackbar,
  Alert,
  InputAdornment,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fade,
  LinearProgress,
} from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Group as GroupIcon,
  Warning as WarningIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  Inbox as InboxIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircleOutline as ActiveIcon,
  Clear as ClearIcon,
  KeyboardArrowDown as ArrowDownIcon,
  Close as CloseIcon,
  Storefront as StoreIcon,
  ShieldOutlined as ShieldIcon,
  PersonAdd as PersonAddIcon,
  Save as SaveIcon,
  Visibility,
  VisibilityOff,
  Add,
  Remove,
  Lock as LockIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Language as LanguageIcon,
  Business as BusinessIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useClient } from "../context/ClientContext";
import { useAuth } from "../context/AuthContexts";
import AssetSearchField from "../components/AssetSearchField";

const C = {
  primary: "#075971",
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

const getValidationMessage = (err) =>
  err?.response?.data?.errors?.[0]?.message ||
  err?.response?.data?.message ||
  err?.message ||
  "An unexpected error occurred";

const PLAN_META = {
  free: { label: "Free", color: "#64748b", bg: "#f1f5f9" },
  standard: { label: "Standard", color: "#0d4a5c", bg: "#e6f0f3" },
  premium: { label: "Premium", color: "#d97706", bg: "#fffbeb" },
  enterprise: { label: "Enterprise", color: "#7c3aed", bg: "#f5f3ff" },
};

const PLANS = ["free", "standard", "premium", "enterprise"];

const initials = (name) =>
  !name
    ? "?"
    : name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

const fmtErr = (e) => {
  if (typeof e === "string") return e;
  const data = e?.response?.data;
  // Show field-level validation errors if present
  if (data?.errors?.length > 0) {
    return data.errors
      .map((err) => `${err.field ? `${err.field}: ` : ""}${err.message}`)
      .join(", ");
  }
  return data?.message || e?.message || "Something went wrong";
};

// Access Denied Component
const AccessDenied = () => {
  const nav = useNavigate();
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "calc(100vh - 200px)",
        textAlign: "center",
        p: 3,
      }}
    >
      <Box
        sx={{
          width: { xs: 64, sm: 80 },
          height: { xs: 64, sm: 80 },
          borderRadius: "50%",
          bgcolor: "#fef2f2",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 2,
        }}
      >
        <LockIcon sx={{ fontSize: { xs: 32, sm: 40 }, color: C.error }} />
      </Box>
      <Typography
        sx={{
          fontWeight: 700,
          fontSize: { xs: "1.1rem", sm: "1.25rem" },
          color: C.text.primary,
          mb: 1,
        }}
      >
        Access Denied
      </Typography>
      <Typography
        sx={{
          fontSize: { xs: "0.75rem", sm: "0.875rem" },
          color: C.text.secondary,
          mb: 3,
          maxWidth: 400,
        }}
      >
        You don't have permission to access this page. Restricted to Super
        Administrators.
      </Typography>
      <Button
        variant="contained"
        onClick={() => nav("/dashboard")}
        sx={{
          bgcolor: C.primary,
          textTransform: "none",
          borderRadius: 2,
          "&:hover": { bgcolor: C.primaryDark },
        }}
      >
        Return to Dashboard
      </Button>
    </Box>
  );
};

// Stepper Component
const Stepper = ({ value, onChange, min = 1, max = 1000, label }) => (
  <Box>
    <Typography sx={{ fontSize: "0.72rem", color: C.text.secondary, mb: 0.75 }}>
      {label}
    </Typography>
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        border: `1px solid ${C.border}`,
        borderRadius: "8px",
        px: 1,
        py: 0.5,
        width: "fit-content",
      }}
    >
      <IconButton
        size="small"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        sx={{ width: 24, height: 24 }}
      >
        <Remove sx={{ fontSize: "0.85rem" }} />
      </IconButton>
      <Typography
        sx={{
          fontSize: "0.85rem",
          fontWeight: 600,
          minWidth: 36,
          textAlign: "center",
          color: C.text.primary,
        }}
      >
        {value}
      </Typography>
      <IconButton
        size="small"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        sx={{ width: 24, height: 24 }}
      >
        <Add sx={{ fontSize: "0.85rem" }} />
      </IconButton>
    </Box>
  </Box>
);

// Password Rule Component
const PwRule = ({ ok, label }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
    <Box
      sx={{
        width: 6,
        height: 6,
        borderRadius: "50%",
        bgcolor: ok ? C.success : C.text.muted,
      }}
    />
    <Typography
      sx={{
        fontSize: "0.7rem",
        color: ok ? C.success : C.text.secondary,
      }}
    >
      {label}
    </Typography>
  </Box>
);

// Stat Card Component
const StatCard = ({ icon: Icon, label, value, color, loading }) => {
  if (loading)
    return (
      <Card sx={{ borderRadius: 2, height: "100%" }}>
        <CardContent sx={{ p: 2 }}>
          <Skeleton variant="circular" width={36} height={36} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="60%" height={14} />
          <Skeleton variant="text" width="40%" height={28} />
        </CardContent>
      </Card>
    );
  return (
    <Card
      sx={{
        borderRadius: 2,
        height: "100%",
        width:"275px",
        border: `1px solid ${C.border}`,
        transition: "all 0.2s",
        "&:hover": { transform: "translateY(-2px)", boxShadow: 2 },
      }}
      elevation={0}
    >
      <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 1,
          }}
        >
          <Box
            sx={{
              width: { xs: 36, sm: 40 },
              height: { xs: 36, sm: 40 },
              borderRadius: "10px",
              bgcolor: `${color}18`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon sx={{ fontSize: { xs: 18, sm: 20 }, color }} />
          </Box>
        </Box>
        <Typography
          sx={{
            fontSize: "0.65rem",
            fontWeight: 500,
            color: C.text.muted,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            mb: 0.5,
          }}
        >
          {label}
        </Typography>
        <Typography
          sx={{
            fontSize: { xs: "1.4rem", sm: "1.6rem" },
            fontWeight: 700,
            color: C.text.primary,
          }}
        >
          {value ?? 0}
        </Typography>
      </CardContent>
    </Card>
  );
};

// Client Card Component
const ClientCard = ({ client, onEdit, onDelete, onView }) => {
  const [anchor, setAnchor] = useState(null);
  const plan = PLAN_META[client.membershipPlan] || PLAN_META.free;
  const isActive = client.status === "active";
  const daysLeft = client.daysRemaining || 0;
  const used = client.usersUsed || 0;
  const limit = client.licenseLimit || 1;
  const pct = Math.min(100, Math.round((used / limit) * 100));
  const expiring = daysLeft > 0 && daysLeft <= 7;

  console.log("client====>>>>",client)

  return (
    <Card
      sx={{
        borderRadius: 2,
        width: "370px",
        border: `1px solid ${C.border}`,
        transition: "all 0.2s",
        position: "relative",
        "&:hover": {
          borderColor: C.primary,
          boxShadow: "0 4px 20px rgba(13,74,92,0.10)",
        },
      }}
      elevation={0}
    >
      <CardContent sx={{ p: { xs: 1.75, sm: 2 } }}>
        {/* <Box
          sx={{
            position: "absolute",
            top: 14,
            right: 14,
            width: 8,
            height: 8,
            borderRadius: "50%",
            bgcolor: isActive ? C.success : C.text.muted,
          }}
        /> */}

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
          <Avatar
            sx={{
              width: { xs: 40, sm: 44 },
              height: { xs: 40, sm: 44 },
              borderRadius: "10px",
              bgcolor: C.primary,
              fontSize: "0.85rem",
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {initials(client.customerName)}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: "0.85rem",
                color: C.text.primary,
                mb: 0.25,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {client.customerName} ({client.status})
            </Typography>
            <Typography
              sx={{
                fontSize: "0.65rem",
                color: C.text.secondary,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {client.email}
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={(e) => setAnchor(e.currentTarget)}
            sx={{ color: C.text.muted, flexShrink: 0 }}
          >
            <MoreVertIcon sx={{ fontSize: "1rem" }} />
          </IconButton>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Box>
            <Typography
              sx={{ fontSize: "0.6rem", color: C.text.muted, mb: 0.25 }}
            >
              Membership
            </Typography>
            <Chip
              label={plan.label}
              size="small"
              sx={{
                height: 22,
                fontSize: "0.6rem",
                fontWeight: 700,
                bgcolor: plan.bg,
                color: plan.color,
                border: "none",
              }}
            />
          </Box>
          <Box sx={{ textAlign: "right" }}>
            <Typography
              sx={{ fontSize: "0.6rem", color: C.text.muted, mb: 0.25 }}
            >
              Duration
            </Typography>
            <Typography
              sx={{
                fontSize: "0.72rem",
                fontWeight: 700,
                color: expiring ? C.warning : C.text.secondary,
              }}
            >
              {daysLeft > 0 ? `${daysLeft} days left` : "Expired"}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Box
            sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}
          >
            <Typography sx={{ fontSize: "0.6rem", color: C.text.muted }}>
              Usage
            </Typography>
            <Typography
              sx={{
                fontSize: "0.65rem",
                fontWeight: 600,
                color: pct > 85 ? C.error : C.text.secondary,
              }}
            >
              {pct}%
            </Typography>
          </Box>
          <Box
            sx={{
              height: 5,
              bgcolor: "#f1f5f9",
              borderRadius: 3,
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                height: "100%",
                width: `${pct}%`,
                bgcolor: pct > 85 ? C.error : C.primary,
                borderRadius: 3,
                transition: "width 0.4s ease",
              }}
            />
          </Box>
        </Box>

        <Divider sx={{ mb: 1.5 }} />

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Button
            size="small"
            onClick={() => onView(client._id)}
            startIcon={<VisibilityIcon sx={{ fontSize: "0.75rem" }} />}
            sx={{
              fontSize: "0.65rem",
              textTransform: "none",
              color: C.primary,
              px: 0,
              minWidth: 0,
            }}
          >
            View
          </Button>
          <Box sx={{ display: "flex", gap: 0.5 }}>
            <Tooltip title="Edit">
              <IconButton
                size="small"
                onClick={() => onEdit(client)}
                sx={{
                  p: 0.5,
                  color: C.text.muted,
                  "&:hover": { color: C.primary, bgcolor: C.primaryLight },
                }}
              >
                <EditIcon sx={{ fontSize: "0.85rem" }} />
              </IconButton>
            </Tooltip>
            <Tooltip title={isActive ? "Deactivate" : "Activate"}>
              <IconButton
                size="small"
                onClick={() => onDelete(client)}
                sx={{
                  p: 0.5,
                  color: C.text.muted,
                  "&:hover": { color: C.error, bgcolor: "#fef2f2" },
                }}
              >
                <DeleteIcon sx={{ fontSize: "0.85rem" }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Menu
          anchorEl={anchor}
          open={Boolean(anchor)}
          onClose={() => setAnchor(null)}
          PaperProps={{ sx: { minWidth: 140, borderRadius: 2, mt: 0.5 } }}
        >
          <MenuItem
            onClick={() => {
              onEdit(client);
              setAnchor(null);
            }}
            sx={{ fontSize: "0.75rem", gap: 1 }}
          >
            <EditIcon sx={{ fontSize: "0.8rem" }} /> Edit
          </MenuItem>
          <MenuItem
            onClick={() => {
              onView(client._id);
              setAnchor(null);
            }}
            sx={{ fontSize: "0.75rem", gap: 1 }}
          >
            <VisibilityIcon sx={{ fontSize: "0.8rem" }} /> View Details
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={() => {
              onDelete(client);
              setAnchor(null);
            }}
            sx={{ fontSize: "0.75rem", gap: 1, color: C.error }}
          >
            <DeleteIcon sx={{ fontSize: "0.8rem" }} />{" "}
            {isActive ? "Deactivate" : "Activate"}
          </MenuItem>
        </Menu>
      </CardContent>
    </Card>
  );
};

// Client Modal Component
const ClientModal = ({ open, client, onClose, onSave, loading }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isEdit = !!client;

  const [tab, setTab] = useState(0);
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});

  const blank = {
    customerName: "",
    email: "",
    phone: "",
    website: "",
    membershipPlan: "standard",
    licenseLimit: 10,
    duration: 30,
    notes: "",
    password: "",
  };

  useEffect(() => {
    if (open) {
      setTab(0);
      setShowPw(false);
      setErrors({});
      setForm(
        client
          ? {
              customerName: client.customerName || "",
              email: client.email || "",
              phone: client.phone || "",
              website: client.website || "",
              membershipPlan: client.membershipPlan || "standard",
              licenseLimit: client.licenseLimit || 10,
              duration: 30,
              notes: client.notes || "",
              password: "",
            }
          : blank,
      );
    }
  }, [client, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const nextValue =
      name === "phone" ? value.replace(/\D/g, "").slice(0, 10) : value;
    setForm((p) => ({ ...p, [name]: nextValue }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.customerName?.trim()) e.customerName = "Required";
    if (!form.email?.trim()) e.email = "Required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Invalid email";
    if (!form.phone?.trim()) e.phone = "Required";
    else if (!/^\d{10}$/.test(form.phone.trim()))
      e.phone = "Phone number must be exactly 10 digits";
    if (
      form.website &&
      !/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i.test(
        form.website,
      )
    )
      e.website = "Invalid URL";
    if (!isEdit) {
      if (!form.password) e.password = "Required";
      else if (form.password.length < 8) e.password = "Min 8 chars";
      else if (!/[A-Z]/.test(form.password)) e.password = "Needs uppercase";
      else if (!/[a-z]/.test(form.password)) e.password = "Needs lowercase";
      else if (!/[0-9]/.test(form.password)) e.password = "Needs number";
    }
    setErrors(e);
    return e;
  };

  const handleSubmit = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      const hasAcc =
        validationErrors.customerName ||
        validationErrors.email ||
        validationErrors.phone ||
        validationErrors.website;
      if (hasAcc) setTab(0);
      else if (validationErrors.password) setTab(2);
      return;
    }
    await onSave(form);
  };

  const pw = form.password || "";
  const rules = [
    { ok: pw.length >= 8, l: "At least 8 characters" },
    { ok: /[A-Z]/.test(pw), l: "One uppercase letter" },
    { ok: /[a-z]/.test(pw), l: "One lowercase letter" },
    { ok: /[0-9]/.test(pw), l: "One number" },
  ];

  const TABS = isEdit
    ? ["Account info", "Plan & limits"]
    : ["Account info", "Plan & limits", "Security"];

  const tabHasError = (i) => {
    if (i === 0)
      return !!(
        errors.customerName ||
        errors.email ||
        errors.phone ||
        errors.website
      );
    if (i === 2) return !!errors.password;
    return false;
  };

  const inputSx = (hasError = false) => ({
    "& .MuiOutlinedInput-root": {
      borderRadius: "10px",
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

  const TabAccountInfo = (
    <Stack spacing={2} sx={{ mt: 2}}>
      <TextField
        name="customerName"
        label="Customer name"
        value={form.customerName || ""}
        onChange={handleChange}
        fullWidth
        size="small"
        required
        error={!!errors.customerName}
        helperText={errors.customerName}
        placeholder="Acme Corp"
        sx={inputSx(!!errors.customerName)}
      />
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            name="email"
            label="Email address"
            type="email"
            value={form.email || ""}
            onChange={handleChange}
            fullWidth
            size="small"
            required
            error={!!errors.email}
            helperText={errors.email}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon sx={{ fontSize: 16, color: C.text.muted }} />
                </InputAdornment>
              ),
            }}
            sx={inputSx(!!errors.email)}
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
            inputProps={{ inputMode: "numeric", pattern: "[0-9]*", maxLength: 10 }}
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
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <LanguageIcon sx={{ fontSize: 16, color: C.text.muted }} />
            </InputAdornment>
          ),
        }}
        sx={inputSx(!!errors.website)}
      />
      <TextField
        name="notes"
        label="Notes (optional)"
        multiline
        rows={isMobile ? 2 : 3}
        value={form.notes || ""}
        onChange={handleChange}
        fullWidth
        size="small"
        placeholder="Internal notes…"
        sx={inputSx()}
      />
    </Stack>
  );

  const TabPlanLimits = (
    <Stack spacing={2.5} sx={{ mt: 2 }}>
      <Box>
        <Typography
          sx={{
            fontSize: "0.72rem",
            fontWeight: 600,
            letterSpacing: "0.07em",
            color: C.text.muted,
            textTransform: "uppercase",
            mb: 1.5,
          }}
        >
          Membership plan
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {PLANS.map((p) => (
            <Chip
              key={p}
              label={p.charAt(0).toUpperCase() + p.slice(1)}
              onClick={() => setForm((f) => ({ ...f, membershipPlan: p }))}
              size="small"
              sx={{
                cursor: "pointer",
                fontWeight: form.membershipPlan === p ? 700 : 400,
                fontSize: "0.75rem",
                py: 0.5,
                bgcolor: form.membershipPlan === p ? C.primary : "transparent",
                color: form.membershipPlan === p ? "white" : C.text.secondary,
                border: `1px solid ${form.membershipPlan === p ? C.primary : C.border}`,
                "&:hover": {
                  bgcolor:
                    form.membershipPlan === p ? C.primaryDark : C.surface,
                },
              }}
            />
          ))}
        </Box>
      </Box>
      <Divider />
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Stepper
            label="License limit"
            value={form.licenseLimit || 10}
            onChange={(v) => setForm((f) => ({ ...f, licenseLimit: v }))}
            min={1}
            max={1000}
          />
        </Grid>
        {!isEdit && (
          <Grid item xs={12} sm={6}>
            <Stepper
              label="Duration (days)"
              value={form.duration || 30}
              onChange={(v) => setForm((f) => ({ ...f, duration: v }))}
              min={1}
              max={365}
            />
          </Grid>
        )}
      </Grid>
    </Stack>
  );

  const TabSecurity = (
    <Stack spacing={2.5} sx={{ mt: 2 }}>
      <TextField
        name="password"
        label="Temporary password"
        type={showPw ? "text" : "password"}
        value={form.password || ""}
        onChange={handleChange}
        fullWidth
        size="small"
        required
        error={!!errors.password}
        helperText={errors.password}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <LockIcon sx={{ fontSize: 16, color: C.text.muted }} />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                size="small"
                onClick={() => setShowPw((p) => !p)}
                edge="end"
              >
                {showPw ? (
                  <VisibilityOff sx={{ fontSize: 16 }} />
                ) : (
                  <Visibility sx={{ fontSize: 16 }} />
                )}
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={inputSx(!!errors.password)}
      />
      {form.password && (
        <Fade in>
          <Box
            sx={{
              p: 2,
              borderRadius: "10px",
              bgcolor: C.surface,
              border: `1px solid ${C.border}`,
              display: "flex",
              flexDirection: "column",
              gap: 0.75,
            }}
          >
            <Typography
              sx={{
                fontSize: "0.7rem",
                fontWeight: 600,
                color: C.text.secondary,
                mb: 0.5,
              }}
            >
              Password requirements:
            </Typography>
            {rules.map((r) => (
              <PwRule key={r.l} ok={r.ok} label={r.l} />
            ))}
          </Box>
        </Fade>
      )}
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
          borderRadius: fullScreen ? 0 : { xs: "12px", sm: "16px" },
          overflow: "hidden",
          margin: { xs: 0, sm: 2 },
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
            borderBottom: `1px solid ${C.border}`,
            bgcolor: "white",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
            <Box
              sx={{
                width: { xs: 30, sm: 34 },
                height: { xs: 30, sm: 34 },
                borderRadius: "8px",
                bgcolor: C.primaryLight,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <StoreIcon
                sx={{
                  fontSize: { xs: "1rem", sm: "1.1rem" },
                  color: C.primary,
                }}
              />
            </Box>
            <Box>
              <Typography
                sx={{
                  fontWeight: 600,
                  fontSize: { xs: "0.85rem", sm: "0.9rem" },
                  color: C.text.primary,
                }}
              >
                {isEdit ? "Edit customer" : "Add new customer"}
              </Typography>
              <Typography
                sx={{
                  fontSize: "0.7rem",
                  color: C.text.secondary,
                  display: { xs: "none", sm: "block" },
                }}
              >
                {isEdit
                  ? "Update the customer's details"
                  : "Fill in the details to create an account"}
              </Typography>
            </Box>
          </Box>
          <IconButton
            size="small"
            onClick={onClose}
            sx={{
              border: `1px solid ${C.border}`,
              borderRadius: "8px",
              width: { xs: 26, sm: 28 },
              height: { xs: 26, sm: 28 },
            }}
          >
            <CloseIcon sx={{ fontSize: "0.9rem" }} />
          </IconButton>
        </Box>
        <Box
          sx={{
            display: "flex",
            borderBottom: `1px solid ${C.border}`,
            px: { xs: 1.5, sm: 2.5 },
            bgcolor: C.surface,
            overflowX: "auto",
            "&::-webkit-scrollbar": { height: "2px" },
          }}
        >
          {TABS.map((t, i) => (
            <Box
              key={t}
              onClick={() => setTab(i)}
              sx={{
                px: { xs: 1.5, sm: 2 },
                py: { xs: 1, sm: 1.25 },
                cursor: "pointer",
                fontSize: { xs: "0.75rem", sm: "0.8rem" },
                fontWeight: tab === i ? 700 : 500,
                color: tab === i ? C.primary : C.text.secondary,
                borderBottom: "2px solid",
                borderColor: tab === i ? C.primary : "transparent",
                transition: "all 0.15s",
                userSelect: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 0.75,
                flexShrink: 0,
              }}
            >
              {t}
              {tabHasError(i) && (
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    bgcolor: C.error,
                  }}
                />
              )}
            </Box>
          ))}
        </Box>
      </DialogTitle>

      <DialogContent
        sx={{
          px: { xs: 2, sm: 2.5 },
          py: { xs: 2, sm: 2.5 },
          maxHeight: { xs: "calc(100vh - 180px)", sm: "60vh" },
          overflowY: "auto",
          "&::-webkit-scrollbar": { width: "4px" },
          "&::-webkit-scrollbar-thumb": {
            background: C.primary,
            borderRadius: "4px",
          },
        }}
      >
        {tab === 0 && TabAccountInfo}
        {tab === 1 && TabPlanLimits}
        {tab === 2 && TabSecurity}
      </DialogContent>

      <DialogActions
        sx={{
          px: { xs: 2, sm: 2.5 },
          py: 1.5,
          borderTop: `1px solid ${C.border}`,
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 1,
          bgcolor: "white",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
          <ShieldIcon sx={{ fontSize: "0.9rem", color: C.text.muted }} />
          <Typography sx={{ fontSize: "0.7rem", color: C.text.muted }}>
            Encrypted & secure
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Button
            onClick={onClose}
            size="small"
            sx={{
              textTransform: "none",
              fontSize: "0.8rem",
              borderRadius: "8px",
              border: `1px solid ${C.border}`,
              color: C.text.secondary,
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
            startIcon={
              loading ? null : isEdit ? (
                <SaveIcon sx={{ fontSize: "0.9rem" }} />
              ) : (
                <PersonAddIcon sx={{ fontSize: "0.9rem" }} />
              )
            }
            sx={{
              textTransform: "none",
              fontSize: "0.8rem",
              fontWeight: 600,
              borderRadius: "8px",
              bgcolor: C.primary,
              px: 2.5,
              "&:hover": { bgcolor: C.primaryDark },
              "&.Mui-disabled": { bgcolor: C.border },
            }}
          >
            {loading ? (
              <CircularProgress size={18} color="inherit" />
            ) : isEdit ? (
              "Save changes"
            ) : (
              "Create customer"
            )}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

// Status Dialog Component
const StatusDialog = ({ open, client, onClose, onConfirm, loading }) => (
  <Dialog
    open={open}
    onClose={onClose}
    maxWidth="xs"
    fullWidth
    PaperProps={{ sx: { borderRadius: "16px", overflow: "hidden" } }}
  >
    <DialogTitle sx={{ p: 0 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2.5,
          py: 1.75,
          borderBottom: `1px solid ${C.border}`,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: "8px",
              bgcolor: "#fef2f2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <WarningIcon sx={{ fontSize: "1rem", color: C.error }} />
          </Box>
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: "0.875rem",
              color: C.text.primary,
            }}
          >
            {client?.status === "active" ? "Deactivate" : "Activate"} customer
          </Typography>
        </Box>
        <IconButton
          size="small"
          onClick={onClose}
          sx={{
            border: `1px solid ${C.border}`,
            borderRadius: "8px",
            width: 28,
            height: 28,
          }}
        >
          <CloseIcon sx={{ fontSize: "0.9rem" }} />
        </IconButton>
      </Box>
    </DialogTitle>
    <DialogContent sx={{ px: 2.5, py: 2 }}>
      <Typography
        sx={{ fontSize: "0.8rem", color: C.text.secondary, lineHeight: 1.6 }}
      >
        Are you sure you want to{" "}
        <strong>
          {client?.status === "active" ? "deactivate" : "activate"}
        </strong>{" "}
        <strong style={{ color: C.text.primary }}>
          {client?.customerName}
        </strong>
        ?{" "}
        {client?.status === "active"
          ? "They will lose access immediately."
          : "They will regain access to the platform."}
      </Typography>
    </DialogContent>
    <DialogActions
      sx={{ px: 2.5, py: 1.5, borderTop: `1px solid ${C.border}`, gap: 1 }}
    >
      <Button
        onClick={onClose}
        size="small"
        sx={{
          textTransform: "none",
          fontSize: "0.78rem",
          borderRadius: "8px",
          border: `1px solid ${C.border}`,
          color: C.text.secondary,
          px: 2,
        }}
      >
        Cancel
      </Button>
      <Button
        onClick={onConfirm}
        variant="contained"
        size="small"
        disabled={loading}
        sx={{
          textTransform: "none",
          fontSize: "0.78rem",
          fontWeight: 600,
          borderRadius: "8px",
          bgcolor: client?.status === "active" ? C.error : C.success,
          px: 2,
          "&:hover": {
            bgcolor: client?.status === "active" ? "#dc2626" : "#059669",
          },
          "&.Mui-disabled": { bgcolor: C.border },
        }}
      >
        {loading ? (
          <CircularProgress size={16} color="inherit" />
        ) : client?.status === "active" ? (
          "Deactivate"
        ) : (
          "Activate"
        )}
      </Button>
    </DialogActions>
  </Dialog>
);

// Main Component
export default function ClientManagement() {
  const theme = useTheme();
  const nav = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { user, isAuthenticated } = useAuth();

  const {
    clients,
    stats,
    pagination,
    filters,
    loading,
    initialLoading,
    error,
    actionLoading,
    fetchClients,
    addClient,
    editClient,
    changeClientStatus,
    updateFilters,
    changePage,
    resetFilters,
    clearError,
  } = useClient();

  const [search, setSearch] = useState(filters.search || "");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [statusAnchor, setStatusAnchor] = useState(null);
  const [planAnchor, setPlanAnchor] = useState(null);
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const searchTimer = useRef(null);
  const isInitMount = useRef(true);

  const isSuperAdmin = useMemo(() => user?.role === "super_admin", [user]);

  const showToast = useCallback((msg, sev = "success") => {
    setToast({ open: true, message: msg, severity: sev });
  }, []);

  const closeToast = useCallback(() => {
    setToast((p) => ({ ...p, open: false }));
  }, []);

  useEffect(() => {
    if (filters.search !== search) setSearch(filters.search);
  }, [filters.search]);

  useEffect(() => {
    if (isInitMount.current) {
      isInitMount.current = false;
      return;
    }
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      if (search !== filters.search) {
        updateFilters({ search: search.trim() });
        fetchClients({ search: search.trim(), page: 1 });
      }
    }, 500);
    return () => clearTimeout(searchTimer.current);
  }, [search, updateFilters, fetchClients, filters.search]);

  const handleAddClient = async (formData) => {
  try {
    await addClient(formData);
    showToast("Customer created successfully!", "success");
    setModalOpen(false);
    fetchClients({ page: 1 });
  } catch (err) {
    showToast(getValidationMessage(err), "error");
  }
};

  const handleEditClient = async (formData) => {
  try {
    await editClient(editingClient._id, {
      customerName: formData.customerName,
      membershipPlan: formData.membershipPlan,
      licenseLimit: parseInt(formData.licenseLimit),
      phone: formData.phone,
      website: formData.website,
      notes: formData.notes,
    });
    showToast("Customer updated successfully!", "success");
    setModalOpen(false);
    setEditingClient(null);
    fetchClients();
  } catch (err) {
    showToast(getValidationMessage(err), "error");
  }
};

  const handleStatusChange = async () => {
    try {
      const newStatus =
        selectedClient?.status === "active" ? "inactive" : "active";
      await changeClientStatus(selectedClient._id, newStatus);
      showToast(
        `Customer ${newStatus === "active" ? "activated" : "deactivated"} successfully!`,
      );
      setDeleteOpen(false);
      setSelectedClient(null);
      fetchClients();
    } catch (err) {
      showToast(fmtErr(err), "error");
    }
  };

  const handleFilterChange = useCallback(
    (type, value) => {
      updateFilters({ [type]: value });
      fetchClients({ [type]: value, page: 1 });
    },
    [updateFilters, fetchClients],
  );

  const handleClearFilters = useCallback(() => {
    resetFilters();
    setSearch("");
    fetchClients({ search: "", status: "all", membershipPlan: "all", page: 1 });
  }, [resetFilters, fetchClients]);

  const handleRefresh = useCallback(() => {
    fetchClients({ page: pagination.page });
  }, [fetchClients, pagination.page]);

  const handlePageChange = useCallback(
    (newPage) => {
      changePage(newPage);
      fetchClients({ page: newPage });
    },
    [changePage, fetchClients],
  );

  const hasFilters =
    filters.status !== "all" || filters.membershipPlan !== "all" || search;

  const statCards = useMemo(
    () => [
      {
        icon: GroupIcon,
        label: "Total Customers",
        value: stats?.total || 0,
        color: C.primary,
      },
      {
        icon: ActiveIcon,
        label: "Active Customers",
        value: stats?.active || 0,
        color: C.success,
      },
      {
        icon: BusinessIcon,
        label: "Enterprise",
        value: stats?.byPlan?.enterprise || 0,
        color: "#7c3aed",
      },
      {
        icon: WarningIcon,
        label: "Expiring Soon",
        value: stats?.expiringSoon || 0,
        color: C.warning,
      },
    ],
    [stats],
  );

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

  if (!isSuperAdmin) return <AccessDenied />;

  if (initialLoading && !clients?.length) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: C.surface, minHeight: "100vh" }}>
        <Skeleton variant="text" width={200} height={32} sx={{ mb: 1 }} />
        <Skeleton variant="text" width={300} height={20} sx={{ mb: 3 }} />
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[1, 2, 3, 4].map((i) => (
            <Grid key={i} item xs={6} sm={3}>
              <StatCard loading />
            </Grid>
          ))}
        </Grid>
        <Grid container spacing={2}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Grid key={i} item xs={12} sm={6} lg={4}>
              <Skeleton
                variant="rounded"
                height={240}
                sx={{ borderRadius: 2 }}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  console.log("Error====>>",error)

  return (
    <Box sx={{ bgcolor: C.surface, minHeight: "100vh", p: { xs: 2, sm: 3 } }}>
      {(loading || actionLoading) && !initialLoading && (
        <LinearProgress sx={{ mb: 2, borderRadius: 2, height: 3 }} />
      )}

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Typography
            sx={{
              fontWeight: 800,
              fontSize: { xs: "1.25rem", sm: "1.4rem" },
              color: C.text.primary,
              mb: 0.25,
            }}
          >
            Customer Management
          </Typography>
          <Typography
            sx={{
              fontSize: { xs: "0.7rem", sm: "0.75rem" },
              color: C.text.secondary,
            }}
          >
            Manage customer accounts and memberships
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditingClient(null);
            setModalOpen(true);
          }}
          sx={{
            bgcolor: C.primary,
            textTransform: "none",
            borderRadius: "10px",
            fontWeight: 600,
            px: { xs: 2, sm: 2.5 },
            fontSize: "0.85rem",
            "&:hover": { bgcolor: C.primaryDark },
          }}
        >
          Add Customer
        </Button>
      </Box>

      {error && (
        <Alert
          severity="error"
          onClose={clearError}
          sx={{ mb: 2, borderRadius: 2 }}
        >
          {error}
        </Alert>
      )}

      <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ mb: 3 }}>
        {statCards.map((s, i) => (
          <Grid key={i} item xs={6} sm={6} md={3}>
            <StatCard {...s} loading={initialLoading} />
          </Grid>
        ))}
      </Grid>

      <Paper
        sx={{
          p: { xs: 1.5, sm: 2 },
          mb: 3,
          borderRadius: 2,
          border: `1px solid ${C.border}`,
        }}
        elevation={0}
      >
        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <AssetSearchField
            placeholder="Search customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch("")}
            sx={{
              flex: 1,
              minWidth: { xs: "100%", sm: 200 },
            }}
          />
          <Box
            sx={{
              display: "flex",
              gap: 1,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <Button
              size="small"
              variant={filters.status !== "all" ? "contained" : "outlined"}
              onClick={(e) => setStatusAnchor(e.currentTarget)}
              endIcon={<ArrowDownIcon sx={{ fontSize: "0.8rem" }} />}
              sx={{
                textTransform: "none",
                borderRadius: "8px",
                fontSize: "0.75rem",
                whiteSpace: "nowrap",
                ...(filters.status !== "all" && { bgcolor: C.primary }),
              }}
            >
              {filters.status === "all"
                ? "All Status"
                : filters.status === "active"
                  ? "Active"
                  : "Inactive"}
            </Button>
            <Button
              size="small"
              variant={
                filters.membershipPlan !== "all" ? "contained" : "outlined"
              }
              onClick={(e) => setPlanAnchor(e.currentTarget)}
              endIcon={<ArrowDownIcon sx={{ fontSize: "0.8rem" }} />}
              sx={{
                textTransform: "none",
                borderRadius: "8px",
                fontSize: "0.75rem",
                whiteSpace: "nowrap",
                ...(filters.membershipPlan !== "all" && { bgcolor: C.primary }),
              }}
            >
              {filters.membershipPlan === "all"
                ? "All Memberships"
                : filters.membershipPlan.charAt(0).toUpperCase() +
                  filters.membershipPlan.slice(1)}
            </Button>
            {hasFilters && (
              <Button
                size="small"
                onClick={handleClearFilters}
                sx={{
                  textTransform: "none",
                  color: C.error,
                  borderRadius: "8px",
                  fontSize: "0.75rem",
                }}
              >
                Clear
              </Button>
            )}
            <IconButton
              size="small"
              onClick={handleRefresh}
              disabled={loading}
              sx={{ border: `1px solid ${C.border}`, borderRadius: "8px" }}
            >
              <RefreshIcon
                sx={{
                  fontSize: "0.9rem",
                  animation: loading ? "spin 1s linear infinite" : "none",
                }}
              />
            </IconButton>
          </Box>
        </Box>
      </Paper>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography sx={{ fontSize: "0.7rem", color: C.text.muted }}>
          Showing <strong>{clients?.length || 0}</strong> of{" "}
          <strong>{pagination?.total || 0}</strong> customers
        </Typography>
        {loading && <CircularProgress size={16} sx={{ color: C.primary }} />}
      </Box>

      {!clients?.length && !loading ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              bgcolor: C.primaryLight,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 2,
            }}
          >
            <InboxIcon sx={{ fontSize: 32, color: C.primary }} />
          </Box>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: "1rem",
              color: C.text.primary,
              mb: 0.5,
            }}
          >
            {search ? "No results found" : "No customers yet"}
          </Typography>
          <Typography
            sx={{ fontSize: "0.75rem", color: C.text.secondary, mb: 2 }}
          >
            {search
              ? "Try adjusting your search"
              : "Add your first customer to get started"}
          </Typography>
          {!search && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setEditingClient(null);
                setModalOpen(true);
              }}
              sx={{
                bgcolor: C.primary,
                textTransform: "none",
                borderRadius: "10px",
              }}
            >
              Add Customer
            </Button>
          )}
        </Box>
      ) : (
        <Grid container spacing={{ xs: 1.5, sm: 2 }}>
          {clients?.map((c) => (
            <Grid key={c._id} item xs={12} sm={6} lg={4} xl={3}>
              <ClientCard
                client={c}
                onEdit={(cl) => {
                  setEditingClient(cl);
                  setModalOpen(true);
                }}
                onDelete={(cl) => {
                  setSelectedClient(cl);
                  setDeleteOpen(true);
                }}
                onView={(id) => nav(`/admin/clients-details/${id}`)}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {pagination?.pages > 1 && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 2,
            mt: 3,
          }}
        >
          <Button
            size="small"
            disabled={pagination.page <= 1 || loading}
            onClick={() => handlePageChange(pagination.page - 1)}
            sx={{
              textTransform: "none",
              borderRadius: "8px",
              border: `1px solid ${C.border}`,
              color: C.text.secondary,
            }}
          >
            Previous
          </Button>
          <Typography sx={{ fontSize: "0.75rem", color: C.text.secondary }}>
            Page {pagination.page} of {pagination.pages}
          </Typography>
          <Button
            size="small"
            disabled={pagination.page >= pagination.pages || loading}
            onClick={() => handlePageChange(pagination.page + 1)}
            sx={{
              textTransform: "none",
              borderRadius: "8px",
              border: `1px solid ${C.border}`,
              color: C.text.secondary,
            }}
          >
            Next
          </Button>
        </Box>
      )}

      <Menu
        anchorEl={statusAnchor}
        open={Boolean(statusAnchor)}
        onClose={() => setStatusAnchor(null)}
        PaperProps={{ sx: { borderRadius: 2, minWidth: 140 } }}
      >
        {["all", "active", "inactive"].map((s) => (
          <MenuItem
            key={s}
            onClick={() => {
              handleFilterChange("status", s);
              setStatusAnchor(null);
            }}
            sx={{ fontSize: "0.75rem" }}
          >
            {s === "all"
              ? "All Status"
              : s.charAt(0).toUpperCase() + s.slice(1)}
          </MenuItem>
        ))}
      </Menu>

      <Menu
        anchorEl={planAnchor}
        open={Boolean(planAnchor)}
        onClose={() => setPlanAnchor(null)}
        PaperProps={{ sx: { borderRadius: 2, minWidth: 140 } }}
      >
        {["all", "free", "standard", "premium", "enterprise"].map((p) => (
          <MenuItem
            key={p}
            onClick={() => {
              handleFilterChange("membershipPlan", p);
              setPlanAnchor(null);
            }}
            sx={{ fontSize: "0.75rem" }}
          >
            {p === "all" ? "All Plans" : p.charAt(0).toUpperCase() + p.slice(1)}
          </MenuItem>
        ))}
      </Menu>

      <ClientModal
        open={modalOpen}
        client={editingClient}
        onClose={() => {
          setModalOpen(false);
          setEditingClient(null);
        }}
        onSave={editingClient ? handleEditClient : handleAddClient}
        loading={actionLoading}
      />
      <StatusDialog
        open={deleteOpen}
        client={selectedClient}
        onClose={() => {
          setDeleteOpen(false);
          setSelectedClient(null);
        }}
        onConfirm={handleStatusChange}
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

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </Box>
  );
}

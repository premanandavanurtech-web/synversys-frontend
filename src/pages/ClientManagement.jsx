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
  InputLabel,
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
  alpha,
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
  Lock as LockIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Language as LanguageIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useClient } from "../context/ClientContext";
import { useAuth } from "../context/AuthContexts";
import AssetSearchField from "../components/AssetSearchField";
import {
  areDraftValuesEqual,
  clearFormDraft,
  loadFormDraft,
  saveFormDraft,
} from "../utils/formDraft";

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

const PLANS = ["free", "standard", "premium"];

const ACCESS_TYPES = [
  { value: "read_only", label: "Read only" },
  { value: "edit_only", label: "Edit only" },
];

const getAccessTypeLabel = (value) =>
  ACCESS_TYPES.find((option) => option.value === value)?.label || "Read only";

const getAccountCopy = (role) => {
  const isSuperAdmin = role === "super_admin";
  const singular = isSuperAdmin ? "Customer" : "Admin";
  const plural = isSuperAdmin ? "Customers" : "Admins";
  const singularLower = singular.toLowerCase();
  const pluralLower = plural.toLowerCase();

  return {
    singular,
    plural,
    singularLower,
    pluralLower,
    managementTitle: `${singular} Management`,
    managementSubtitle: `Manage ${singularLower} accounts and memberships`,
    addButton: `Add ${singular}`,
    addEmptyButton: `Add ${plural}`,
    addTitle: `Add new ${singularLower}`,
    editTitle: `Edit ${singularLower}`,
    updateSubtitle: `Update the ${singular}'s details`,
    nameLabel: `${singular} name`,
    createButton: `Create ${singularLower}`,
    createdToast: `${singular} created. Set Password email sent.`,
    updatedToast: `${singular} updated successfully!`,
    statusToast: (status) =>
      `${singular} ${status === "active" ? "activated" : "deactivated"} successfully!`,
    totalStat: `Total ${plural}`,
    activeStat: `Active ${plural}`,
    deactiveStat: `Inactive ${singular}`,
    searchPlaceholder: `Search ${plural}...`,
    noYet: `No ${plural} yet`,
    emptyHint: `Add your first ${singularLower} to get started`,
  };
};

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
        You don't have permission to access this page. Restricted to
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
const StatCard = ({
  icon: Icon,
  label,
  value,
  color,
  loading,
  active = false,
  onClick,
  palette = C,
}) => {
  if (loading)
    return (
      <Card
        elevation={0}
        sx={{
          borderRadius: 2,
          height: "100%",
          minHeight: { xs: 132, sm: 146 },
          width: "100%",
          border: `1px solid ${palette.border}`,
        }}
      >
        <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
          <Skeleton
            variant="rounded"
            width={40}
            height={40}
            sx={{ borderRadius: "10px", mb: 1.5 }}
          />
          <Skeleton variant="text" width={130} height={18} />
          <Skeleton variant="text" width={44} height={38} />
        </CardContent>
      </Card>
    );
  return (
    <Card
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e) => {
        if (!onClick) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      sx={{
        borderRadius: 2,
        height: "100%",
        width: "100%",
        cursor: onClick ? "pointer" : "default",
        position: "relative",
        overflow: "hidden",
        border: active
          ? `2px solid ${color} !important`
          : `1px solid ${palette.border}`,
        bgcolor: active ? `${alpha(color, 0.14)} !important` : palette.card,
        boxShadow: active
          ? `0 0 0 3px ${alpha(color, 0.42)}, 0 18px 40px ${alpha(color, 0.22)} !important`
          : "none",
        transition: "all 0.2s",
        "&::before": active
          ? {
              content: '""',
              position: "absolute",
              inset: "0 auto 0 0",
              width: 5,
              bgcolor: color,
            }
          : undefined,
        "&:hover": onClick
          ? {
              transform: "translateY(-2px)",
              borderColor: `${color} !important`,
              boxShadow: active
                ? `0 0 0 3px ${alpha(color, 0.48)}, 0 20px 44px ${alpha(color, 0.24)} !important`
                : `0 12px 28px ${alpha(color, 0.16)}`,
            }
          : undefined,
        "&:focus-visible": {
          outline: `2px solid ${color}`,
          outlineOffset: 2,
        },
      }}
      elevation={0}
    >
      <CardContent sx={{ p: { xs: 1.5, sm: 1.75, lg: 2 } }}>
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
            color: palette.text.muted,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            mb: 0.5,
            overflowWrap: "anywhere",
          }}
        >
          {label}
        </Typography>
        <Typography
          sx={{
            fontSize: { xs: "1.4rem", sm: "1.6rem" },
            fontWeight: 700,
            color: palette.text.primary,
          }}
        >
          {value ?? 0}
        </Typography>
      </CardContent>
    </Card>
  );
};

const ClientCardSkeleton = () => (
  <Card
    elevation={0}
    sx={{
      borderRadius: 2,
      width: "100%",
      minHeight: 238,
      border: `1px solid ${C.border}`,
    }}
  >
    <CardContent sx={{ p: { xs: 1.75, sm: 2 } }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
        <Skeleton variant="rounded" width={44} height={44} sx={{ borderRadius: "10px" }} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Skeleton variant="text" width="48%" height={20} />
          <Skeleton variant="text" width="34%" height={14} />
        </Box>
        <Skeleton variant="circular" width={24} height={24} />
      </Box>

      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Box>
          <Skeleton variant="text" width={70} height={14} />
          <Skeleton variant="rounded" width={74} height={22} sx={{ borderRadius: 3 }} />
        </Box>
        <Box sx={{ textAlign: "right" }}>
          <Skeleton variant="text" width={60} height={14} />
          <Skeleton variant="text" width={84} height={18} />
        </Box>
      </Box>

      <Skeleton variant="text" width="100%" height={14} />
      <Skeleton variant="rounded" width="100%" height={5} sx={{ borderRadius: 3, mb: 2 }} />
      <Divider sx={{ mb: 1.5 }} />
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Skeleton variant="text" width={74} height={24} />
        <Box sx={{ display: "flex", gap: 1 }}>
          <Skeleton variant="circular" width={24} height={24} />
          <Skeleton variant="circular" width={24} height={24} />
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const ClientManagementSkeleton = () => (
  <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: C.surface, minHeight: "100vh" }}>
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
        <Skeleton variant="text" width={260} height={34} sx={{ mb: 0.5 }} />
        <Skeleton variant="text" width={300} height={20} />
      </Box>
      <Skeleton variant="rounded" width={170} height={46} sx={{ borderRadius: "10px" }} />
    </Box>

    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "repeat(2, minmax(0, 1fr))",
          sm: "repeat(2, minmax(0, 1fr))",
          md: "repeat(4, minmax(0, 1fr))",
        },
        gap: { xs: 1.5, sm: 2 },
        mb: 3,
        width: "100%",
      }}
    >
      {[1, 2, 3, 4].map((i) => (
        <Box key={i} sx={{ minWidth: 0 }}>
          <StatCard loading />
        </Box>
      ))}
    </Box>

    <Paper
      elevation={0}
      sx={{
        p: { xs: 1.5, sm: 2 },
        mb: 3,
        borderRadius: 2,
        border: `1px solid ${C.border}`,
      }}
    >
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
        <Skeleton
          variant="rounded"
          height={44}
          sx={{ flex: 1, minWidth: { xs: "100%", sm: 200 }, borderRadius: "10px" }}
        />
        <Skeleton variant="rounded" width={122} height={36} sx={{ borderRadius: "8px" }} />
        <Skeleton variant="rounded" width={146} height={36} sx={{ borderRadius: "8px" }} />
        <Skeleton variant="circular" width={36} height={36} />
      </Box>
    </Paper>

    <Skeleton variant="text" width={170} height={18} sx={{ mb: 2 }} />

    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, minmax(0, 1fr))",
          lg: "repeat(3, minmax(0, 1fr))",
          xl: "repeat(4, minmax(0, 1fr))",
        },
        gap: { xs: 1.5, sm: 2 },
      }}
    >
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Box key={i} sx={{ minWidth: 0 }}>
          <ClientCardSkeleton />
        </Box>
      ))}
    </Box>
  </Box>
);

// Client Card Component
const ClientCard = ({ client, onEdit, onDelete, onView, canModify = true, palette = C }) => {
  const [anchor, setAnchor] = useState(null);
  const plan = PLAN_META[client.membershipPlan] || PLAN_META.free;
  const isActive = client.status === "active";
  const daysLeft = client.daysRemaining || 0;
  const used = client.usersUsed || 0;
  const limit = client.licenseLimit || 1;
  const pct = Math.min(100, Math.round((used / limit) * 100));
  const expiring = daysLeft > 0 && daysLeft <= 7;
  const isSubAdmin = Boolean(client.adminId);

  console.log("client====>>>>",client)

  return (
    <Card
      sx={{
        borderRadius: 2,
        width: "100%",
        border: `1px solid ${palette.border}`,
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
                color: palette.text.primary,
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
                color: palette.text.secondary,
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
            sx={{ color: palette.text.muted, flexShrink: 0 }}
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
              sx={{ fontSize: "0.6rem", color: palette.text.muted, mb: 0.25 }}
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
            {isSubAdmin && (
              <Chip
                label={getAccessTypeLabel(client.accessType)}
                size="small"
                sx={{
                  height: 22,
                  ml: 0.75,
                  fontSize: "0.6rem",
                  fontWeight: 700,
                  bgcolor: client.accessType === "read_only" ? "#f1f5f9" : C.primaryLight,
                  color: client.accessType === "read_only" ? palette.text.secondary : C.primary,
                  border: "none",
                }}
              />
            )}
          </Box>
          <Box sx={{ textAlign: "right" }}>
            <Typography
              sx={{ fontSize: "0.6rem", color: palette.text.muted, mb: 0.25 }}
            >
              Duration
            </Typography>
            <Typography
              sx={{
                fontSize: "0.72rem",
                fontWeight: 700,
                color: expiring ? C.warning : palette.text.secondary,
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
            <Typography sx={{ fontSize: "0.6rem", color: palette.text.muted }}>
              Usage
            </Typography>
            <Typography
              sx={{
                fontSize: "0.65rem",
                fontWeight: 600,
                color: pct > 85 ? C.error : palette.text.secondary,
              }}
            >
              {pct}%
            </Typography>
          </Box>
          <Box
            sx={{
              height: 5,
              bgcolor: palette.progressTrack || "#f1f5f9",
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
            {canModify && (
              <>
                <Tooltip title="Edit">
                  <IconButton
                    size="small"
                    onClick={() => onEdit(client)}
                    sx={{
                      p: 0.5,
                      color: palette.text.muted,
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
                      color: palette.text.muted,
                      "&:hover": { color: C.error, bgcolor: "#fef2f2" },
                    }}
                  >
                    <DeleteIcon sx={{ fontSize: "0.85rem" }} />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Box>
        </Box>

        <Menu
          anchorEl={anchor}
          open={Boolean(anchor)}
          onClose={() => setAnchor(null)}
          PaperProps={{ sx: { minWidth: 140, borderRadius: 2, mt: 0.5 } }}
        >
          {canModify && (
            <MenuItem
              onClick={() => {
                onEdit(client);
                setAnchor(null);
              }}
              sx={{ fontSize: "0.75rem", gap: 1 }}
            >
              <EditIcon sx={{ fontSize: "0.8rem" }} /> Edit
            </MenuItem>
          )}
          <MenuItem
            onClick={() => {
              onView(client._id);
              setAnchor(null);
            }}
            sx={{ fontSize: "0.75rem", gap: 1 }}
          >
            <VisibilityIcon sx={{ fontSize: "0.8rem" }} /> View Details
          </MenuItem>
          {canModify && <Divider />}
          {canModify && (
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
          )}
        </Menu>
      </CardContent>
    </Card>
  );
};

// Client Modal Component
const ClientModal = ({ open, client, onClose, onSave, loading, currentUser }) => {
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
  const isEdit = !!client;
  const isAdminActor = currentUser?.role === "admin";
  const copy = getAccountCopy(currentUser?.role);
  const showPlanLimits = true;

  const [tab, setTab] = useState(0);
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});
  const [confirmCloseOpen, setConfirmCloseOpen] = useState(false);
  const draftReadyRef = useRef(false);
  const openedFormRef = useRef({});
  const hadDraftOnOpenRef = useRef(false);
  const draftKey = "customerCreateDraft";

  const blank = {
    customerName: "",
    email: "",
    phone: "",
    website: "",
    membershipPlan: "standard",
    licenseLimit: 10,
    assetLimit: 100,
    duration: 30,
    notes: "",
    accessType: "read_only",
  };

  useEffect(() => {
    if (open) {
      setTab(0);
      setErrors({});
      draftReadyRef.current = false;
      const draft = !client ? loadFormDraft(draftKey) : null;
      const inheritedPlanLimits = isAdminActor
        ? {
            membershipPlan: currentUser?.membershipPlan || "standard",
            licenseLimit: Math.max(0, Number(currentUser?.licenseLimit ?? 10)),
            assetLimit: Math.max(0, Number(currentUser?.assetLimit ?? 100)),
          }
        : {};
      const openingForm = client
        ? {
            customerName: client.customerName || "",
            email: client.email || "",
            phone: client.phone || "",
            website: client.website || "",
            membershipPlan: client.membershipPlan || "standard",
            licenseLimit: client.licenseLimit || 10,
            assetLimit: client.assetLimit || 100,
            duration: 30,
            notes: client.notes || "",
            accessType: client.accessType || "read_only",
          }
        : { ...(draft?.form || blank), ...inheritedPlanLimits, accessType: draft?.form?.accessType || "read_only" };
      hadDraftOnOpenRef.current = Boolean(!client && draft?.form);
      openedFormRef.current = openingForm;
      setForm(
        openingForm,
      );
      if (!client && draft?.form) {
        window.setTimeout(() => {
          draftReadyRef.current = true;
        }, 0);
      } else {
        draftReadyRef.current = true;
      }
    }
  }, [client, currentUser, isAdminActor, open]);

  useEffect(() => {
    if (!open || isEdit || !draftReadyRef.current) return;
    saveFormDraft(draftKey, { form });
  }, [draftKey, form, isEdit, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const nextValue =
      name === "phone" ? value.replace(/\D/g, "").slice(0, 10) : value;
    setForm((p) => ({ ...p, [name]: nextValue }));
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
    if (isAdminActor && !ACCESS_TYPES.some((option) => option.value === form.accessType)) {
      e.accessType = "Access type is required";
    }
    if (!isAdminActor) {
      if ((Number(form.licenseLimit) || 0) < 1) e.licenseLimit = "Min 1";
      if ((Number(form.licenseLimit) || 0) > 1000) e.licenseLimit = "Max 1000";
      if ((Number(form.assetLimit) || 0) < 1) e.assetLimit = "Min 1";
      if ((Number(form.assetLimit) || 0) > 10000) e.assetLimit = "Max 10000";
    }
    if ((Number(form.duration) || 0) < 1) e.duration = "Min 1";
    if ((Number(form.duration) || 0) > 365) e.duration = "Max 365";
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
      return;
    }
    const result = await onSave(form);
    if (!isEdit && result?.success !== false) {
      clearFormDraft(draftKey);
    }
  };

  const finishClose = ({ clearDraft = false, saveDraft = false } = {}) => {
    setConfirmCloseOpen(false);
    if (saveDraft) saveFormDraft(draftKey, { form });
    if (clearDraft) clearFormDraft(draftKey);
    onClose();
  };

  const handleClose = () => {
    if (isEdit) {
      onClose();
      return;
    }

    const unchanged = areDraftValuesEqual(form, openedFormRef.current);
    if (unchanged) {
      finishClose({ clearDraft: !hadDraftOnOpenRef.current });
      return;
    }
    setConfirmCloseOpen(true);
  };

  const TABS = showPlanLimits
    ? ["Account info", "Plan & limits"]
    : ["Account info"];

  const tabHasError = (i) => {
    if (i === 0)
      return !!(
        errors.customerName ||
        errors.email ||
        errors.phone ||
        errors.website ||
        errors.accessType
      );
    return !!(errors.licenseLimit || errors.assetLimit || errors.duration);
  };
  const limitUnavailable =
    !isEdit &&
    isAdminActor &&
    ((Number(form.licenseLimit) || 0) < 1 || (Number(form.assetLimit) || 0) < 1);

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

  const TabAccountInfo = (
    <Stack spacing={2} sx={{ mt: 2}}>
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
      {isAdminActor && (
        <FormControl fullWidth size="small" error={!!errors.accessType} sx={inputSx(!!errors.accessType)}>
          <InputLabel id="access-type-label">Access type</InputLabel>
          <Select
            labelId="access-type-label"
            label="Access type"
            name="accessType"
            value={form.accessType || "read_only"}
            onChange={handleChange}
            MenuProps={{
              PaperProps: { sx: { borderRadius: 2, mt: 0.5 } },
            }}
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
      )}
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
              onClick={() => {
                if (!isAdminActor) setForm((f) => ({ ...f, membershipPlan: p }));
              }}
              size="small"
              sx={{
                cursor: isAdminActor ? "not-allowed" : "pointer",
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
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <TextField
            name="licenseLimit"
            label="License limit"
            type="number"
            value={form.licenseLimit ?? ""}
            onChange={(e) => handleNumberChange("licenseLimit", e.target.value, 1, 1000)}
            fullWidth
            size="small"
            disabled={isAdminActor}
            error={!!errors.licenseLimit}
            helperText={errors.licenseLimit}
            InputLabelProps={{ shrink: true }}
            inputProps={{ min: 1, max: 1000, inputMode: "numeric" }}
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
            disabled={isAdminActor}
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
            disabled={isAdminActor}
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
    <>
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      fullScreen={fullScreen}
      PaperProps={{
        sx: {
          borderRadius: fullScreen ? 0 : { xs: "12px", sm: "16px" },
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
            borderBottom: `1px solid ${modalColors.border}`,
            bgcolor: modalColors.header,
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
                  color: modalColors.text.primary,
                }}
              >
                {isEdit ? copy.editTitle : copy.addTitle}
              </Typography>
              <Typography
                sx={{
                  fontSize: "0.7rem",
                  color: modalColors.text.secondary,
                  display: { xs: "none", sm: "block" },
                }}
              >
                {isEdit
                  ? copy.updateSubtitle
                  : "Fill in the details to create an account"}
              </Typography>
            </Box>
          </Box>
          <IconButton
            size="small"
            onClick={handleClose}
            sx={{
              border: `1px solid ${modalColors.border}`,
              color: modalColors.text.secondary,
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
            borderBottom: `1px solid ${modalColors.border}`,
            px: { xs: 1.5, sm: 2.5 },
            bgcolor: modalColors.header,
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
                color: tab === i ? C.primary : modalColors.text.secondary,
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
          bgcolor: modalColors.surface,
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
        {showPlanLimits && tab === 1 && TabPlanLimits}
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
          <ShieldIcon sx={{ fontSize: "0.9rem", color: modalColors.text.muted }} />
          <Typography sx={{ fontSize: "0.7rem", color: modalColors.text.muted }}>
            {copy.singular} receives a secure Set Password email
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Button
            onClick={handleClose}
            size="small"
            sx={{
              textTransform: "none",
              fontSize: "0.8rem",
              borderRadius: "8px",
              border: `1px solid ${modalColors.border}`,
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
            disabled={loading || limitUnavailable}
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
              copy.createButton
            )}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
    <Dialog
      open={confirmCloseOpen}
      onClose={() => setConfirmCloseOpen(false)}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ pb: 1, fontWeight: 700 }}>Save details?</DialogTitle>
      <DialogContent sx={{ pt: 0 }}>
        <Typography sx={{ color: C.text.secondary, fontSize: "0.9rem" }}>
          Do you want to save these details as a draft?
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button
          variant="outlined"
          onClick={() => finishClose({ clearDraft: true })}
          sx={{ textTransform: "none", borderRadius: 1.5 }}
        >
          No
        </Button>
        <Button
          variant="contained"
          onClick={() => finishClose({ saveDraft: true })}
          sx={{
            textTransform: "none",
            borderRadius: 1.5,
            bgcolor: C.primary,
            "&:hover": { bgcolor: C.primaryDark },
          }}
        >
          Yes
        </Button>
      </DialogActions>
    </Dialog>
    </>
  );
};

// Status Dialog Component
const StatusDialog = ({ open, client, onClose, onConfirm, loading, copy = getAccountCopy("admin") }) => (
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
            {client?.status === "active" ? "Deactivate" : "Activate"} {copy.singularLower}
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
  const isDark = theme.palette.mode === "dark";
  const pageColors = useMemo(
    () =>
      isDark
        ? {
            ...C,
            surface: "transparent",
            card: "rgba(12, 23, 38, 0.92)",
            border: "rgba(148, 163, 184, 0.18)",
            primaryLight: "rgba(26, 166, 196, 0.12)",
            progressTrack: "rgba(148, 163, 184, 0.22)",
            text: {
              primary: "#f8fafc",
              secondary: "#d9e2ef",
              muted: "#aeb8c8",
            },
          }
        : C,
    [isDark],
  );
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { user, isAuthenticated, updateCurrentUser } = useAuth();

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
  const [statFilter, setStatFilter] = useState("all");
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const searchTimer = useRef(null);
  const lastFetchedSearch = useRef(filters.search || "");
  const isInitMount = useRef(true);

  const canManageCustomers = useMemo(
    () => user?.role === "super_admin" || user?.role === "admin",
    [user],
  );
  const isRestrictedAdmin = user?.role === "admin" && Boolean(user?.adminId);
  const canCreateAdmins = !isRestrictedAdmin || !["read_only", "edit_only"].includes(user?.accessType);
  const canEditAdmins = !isRestrictedAdmin || user?.accessType === "edit_only";
  const canDeleteAdmins = !isRestrictedAdmin || !["read_only", "edit_only"].includes(user?.accessType);
  const copy = useMemo(() => getAccountCopy(user?.role), [user?.role]);

  const showToast = useCallback((msg, sev = "success") => {
    setToast({ open: true, message: msg, severity: sev });
  }, []);

  const showPermissionToast = useCallback(
    (action) => showToast(`You don't have permission to ${action}`, "error"),
    [showToast],
  );

  const guardAdminAction = useCallback(
    (action, callback) => {
      const allowedByAction = {
        Create: canCreateAdmins,
        Edit: canEditAdmins,
        Delete: canDeleteAdmins,
      };
      if (!allowedByAction[action]) {
        showPermissionToast(action);
        return;
      }
      callback();
    },
    [canCreateAdmins, canDeleteAdmins, canEditAdmins, showPermissionToast],
  );

  const closeToast = useCallback(() => {
    setToast((p) => ({ ...p, open: false }));
  }, []);

  const getStatFilterParams = useCallback(
    (nextFilter = statFilter) => {
      if (nextFilter === "active") {
        return { status: "active", membershipPlan: "all", expiringSoon: false, expired: false };
      }
      if (nextFilter === "inactive") {
        return { status: "inactive", membershipPlan: "all", expiringSoon: false, expired: false };
      }
      if (nextFilter === "expiringSoon") {
        return { status: "all", membershipPlan: "all", expiringSoon: true, expired: false };
      }
      if (nextFilter === "expired") {
        return { status: "all", membershipPlan: "all", expiringSoon: false, expired: true };
      }
      return { status: "all", membershipPlan: "all", expiringSoon: false, expired: false };
    },
    [statFilter],
  );

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
      const nextSearch = search.trim();
      if (nextSearch !== lastFetchedSearch.current) {
        lastFetchedSearch.current = nextSearch;
        fetchClients({
          search: nextSearch,
          page: 1,
          ...getStatFilterParams(),
        });
      }
    }, 500);
    return () => clearTimeout(searchTimer.current);
  }, [search, fetchClients, filters.search, getStatFilterParams]);

  const handleAddClient = async (formData) => {
  if (!canCreateAdmins) {
    showPermissionToast("Create");
    return { success: false, error: "Permission denied" };
  }
  try {
    const planLimitData = user?.role === "admin"
      ? {}
      : {
          membershipPlan: formData.membershipPlan,
          licenseLimit: parseInt(formData.licenseLimit),
          assetLimit: parseInt(formData.assetLimit),
        };
    const response = await addClient({
      customerName: formData.customerName,
      email: formData.email,
      phone: formData.phone,
      website: formData.website,
      ...planLimitData,
      duration: parseInt(formData.duration),
      notes: formData.notes,
      accessType: formData.accessType,
    });
    const creator = response?.data?.creator || response?.creator;
    if (user?.role === "admin" && creator) {
      updateCurrentUser({
        licenseLimit: creator.licenseLimit,
        assetLimit: creator.assetLimit,
        usersUsed: creator.usersUsed,
        usagePercentage: creator.usagePercentage,
      });
    }
    showToast(copy.createdToast, "success");
    setModalOpen(false);
    fetchClients({ page: 1 });
    return { success: true };
  } catch (err) {
    showToast(getValidationMessage(err), "error");
    return { success: false, error: err };
  }
};

  const handleEditClient = async (formData) => {
  if (!canEditAdmins) {
    showPermissionToast("Edit");
    return { success: false, error: "Permission denied" };
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
    await editClient(editingClient._id, {
      customerName: formData.customerName,
      ...planLimitData,
      phone: formData.phone,
      website: formData.website,
      notes: formData.notes,
      accessType: formData.accessType,
    });
    showToast(copy.updatedToast, "success");
    setModalOpen(false);
    setEditingClient(null);
    fetchClients();
  } catch (err) {
    showToast(getValidationMessage(err), "error");
  }
};

  const handleStatusChange = async () => {
    if (!canDeleteAdmins) {
      showPermissionToast("Delete");
      return;
    }
    try {
      const newStatus =
        selectedClient?.status === "active" ? "inactive" : "active";
      await changeClientStatus(selectedClient._id, newStatus);
      showToast(
        copy.statusToast(newStatus),
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
      setStatFilter("all");
      updateFilters({ [type]: value });
      fetchClients({ [type]: value, page: 1, expiringSoon: false, expired: false });
    },
    [updateFilters, fetchClients],
  );

  const handleClearFilters = useCallback(() => {
    resetFilters();
    setSearch("");
    lastFetchedSearch.current = "";
    setStatFilter("all");
    fetchClients({
      search: "",
      status: "all",
      membershipPlan: "all",
      expiringSoon: false,
      expired: false,
      page: 1,
    });
  }, [resetFilters, fetchClients]);

  const handleRefresh = useCallback(() => {
    fetchClients({ page: pagination.page, ...getStatFilterParams() });
  }, [fetchClients, pagination.page, getStatFilterParams]);

  const handlePageChange = useCallback(
    (newPage) => {
      changePage(newPage);
      fetchClients({ page: newPage, ...getStatFilterParams() });
    },
    [changePage, fetchClients, getStatFilterParams],
  );

  const handleStatCardClick = useCallback(
    (nextFilter) => {
      setStatFilter(nextFilter);
      const nextSearch = search.trim();
      lastFetchedSearch.current = nextSearch;
      fetchClients({ page: 1, search: nextSearch, ...getStatFilterParams(nextFilter) });
    },
    [fetchClients, getStatFilterParams, search],
  );

  const hasFilters =
    filters.status !== "all" ||
    filters.membershipPlan !== "all" ||
    statFilter !== "all" ||
    search;

  const statCards = useMemo(
    () => [
      {
        icon: GroupIcon,
        label: copy.totalStat,
        value: stats?.total || 0,
        color: C.primary,
        filterKey: "all",
      },
      {
        icon: ActiveIcon,
        label: copy.activeStat,
        value: stats?.active || 0,
        color: C.success,
        filterKey: "active",
      },
      {
        icon: WarningIcon,
        label: copy.deactiveStat,
        value: Math.max(0, (stats?.total || 0) - (stats?.active || 0)),
        color: C.error,
        filterKey: "inactive",
      },
      {
        icon: WarningIcon,
        label: "Expiring Soon",
        value: stats?.expiringSoon || 0,
        color: C.warning,
        filterKey: "expiringSoon",
      },
      {
        icon: WarningIcon,
        label: `Expired ${copy.plural}`,
        value: stats?.expiredCustomers || 0,
        color: C.error,
        filterKey: "expired",
      },
    ],
    [stats, copy],
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

  if (!canManageCustomers) return <AccessDenied />;

  if (initialLoading && !clients?.length) {
    return <ClientManagementSkeleton />;
  }

  console.log("Error====>>",error)

  return (
    <Box sx={{ bgcolor: pageColors.surface, minHeight: "100vh", p: { xs: 2, sm: 3 } }}>
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
              color: pageColors.text.primary,
              mb: 0.25,
            }}
          >
            {copy.managementTitle}
          </Typography>
          <Typography
            sx={{
              fontSize: { xs: "0.7rem", sm: "0.75rem" },
              color: pageColors.text.secondary,
            }}
          >
            {copy.managementSubtitle}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() =>
            guardAdminAction("Create", () => {
              setEditingClient(null);
              setModalOpen(true);
            })
          }
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
          {copy.addButton}
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

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(2, minmax(0, 1fr))",
            sm: "repeat(2, minmax(0, 1fr))",
            md: "repeat(5, minmax(0, 1fr))",
          },
          gap: { xs: 1.5, sm: 2 },
          mb: 3,
          width: "100%",
        }}
      >
        {statCards.map((s, i) => (
          <Box key={i} sx={{ minWidth: 0 }}>
            <StatCard
              {...s}
              loading={initialLoading}
              active={statFilter === s.filterKey}
              onClick={() => handleStatCardClick(s.filterKey)}
              palette={pageColors}
            />
          </Box>
        ))}
      </Box>

      <Paper
        sx={{
          p: { xs: 1.5, sm: 2 },
          mb: 3,
          borderRadius: 2,
          border: `1px solid ${pageColors.border}`,
          bgcolor: pageColors.card,
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
            placeholder={copy.searchPlaceholder}
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
              sx={{ border: `1px solid ${pageColors.border}`, borderRadius: "8px" }}
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
        <Typography sx={{ fontSize: "0.7rem", color: pageColors.text.muted }}>
          Showing <strong>{clients?.length || 0}</strong> of{" "}
          <strong>{pagination?.total || 0}</strong> {copy.pluralLower}
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
              color: pageColors.text.primary,
              mb: 0.5,
            }}
          >
            {search ? "No results found" : copy.noYet}
          </Typography>
          <Typography
            sx={{ fontSize: "0.75rem", color: pageColors.text.secondary, mb: 2 }}
          >
            {search
              ? "Try adjusting your search"
              : copy.emptyHint}
          </Typography>
          {!search && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() =>
                guardAdminAction("Create", () => {
                setEditingClient(null);
                setModalOpen(true);
                })
              }
              sx={{
                bgcolor: C.primary,
                textTransform: "none",
                borderRadius: "10px",
              }}
            >
              {copy.addEmptyButton}
            </Button>
          )}
        </Box>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              lg: "repeat(3, minmax(0, 1fr))",
            },
            gap: { xs: 1.5, sm: 2 },
            width: "100%",
          }}
        >
          {clients?.map((c) => (
            <ClientCard
              key={c._id}
              client={c}
              onEdit={(cl) => {
                if (!canEditAdmins) {
                  showPermissionToast("Edit");
                  return;
                }
                setEditingClient(cl);
                setModalOpen(true);
              }}
              onDelete={(cl) => {
                if (!canDeleteAdmins) {
                  showPermissionToast("Delete");
                  return;
                }
                setSelectedClient(cl);
                setDeleteOpen(true);
              }}
              onView={(id) => nav(`/admin/clients-details/${id}`)}
              palette={pageColors}
            />
          ))}
        </Box>
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
              border: `1px solid ${pageColors.border}`,
              color: pageColors.text.secondary,
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
        currentUser={user}
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

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </Box>
  );
}

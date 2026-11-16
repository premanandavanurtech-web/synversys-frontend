import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Chip,
  Button,
  Paper,
  Grid,
  Stack,
  IconButton,
  Skeleton,
  Snackbar,
  Alert,
  Dialog,
  DialogContent,
  CircularProgress,
  Avatar,
  LinearProgress,
  Divider,
  TextField,
  InputAdornment,
  Tooltip,
  Collapse,
  Tab,
  Tabs,
  Select,
  MenuItem,
  Autocomplete,
  Pagination,
  Portal,
  Slide,
  alpha,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { styled, keyframes } from "@mui/material/styles";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAsset } from "../context/AssetContext";
import { useAssetRequest } from "../context/AssetRequestContext";
import { useAuth } from "../context/AuthContexts";

import {
  ArrowBack,
  Edit,
  Delete,
  LocationOn,
  CalendarToday,
  Person,
  CheckCircle,
  Category,
  VerifiedUser,
  Description,
  Home,
  PinDrop,
  Link as LinkIcon,
  AddLink,
  Search,
  Close,
  Check,
  ErrorOutline,
  Inventory2,
  DirectionsCar,
  Settings,
  DeleteOutline,
  Computer,
  Apartment,
  ContentCopy,
  History,
  Warning,
  Shield,
  Memory,
  LocalOffer,
  Build,
  Sensors,
  AccountTree,
  SwapHoriz,
  AttachMoney,
  Numbers,
  CheckCircleOutline,
  CancelOutlined,
  HourglassEmpty,
  Refresh,
  LinkOff,
  Add,
  AddCircleOutline,
} from "@mui/icons-material";

// ─── Animations ──────────────────────────────────────────────────────────────
const fadeUp = keyframes`from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}`;
const slideIn = keyframes`from{opacity:0;transform:translateX(-14px)}to{opacity:1;transform:translateX(0)}`;
const shimmer = keyframes`0%{background-position:-200% 0}100%{background-position:200% 0}`;
const popIn = keyframes`0%{opacity:0;transform:scale(0.92)}100%{opacity:1;transform:scale(1)}`;

// ─── Design Tokens ────────────────────────────────────────────────────────────
const T = {
  bg: "#F5F4F0",
  surface: "#FFFFFF",
  surfaceAlt: "#F9F8F5",
  surfaceHover: "#F2F1ED",
  border: "#E8E4DC",
  borderStrong: "#D4CFC4",
  ink: "#1A1A18",
  inkSecondary: "#5C5B56",
  inkMuted: "#9E9B93",
  brand: "#2D4A3E",
  brandLight: "#E8F0EC",
  brandAccent: "#5C8A72",
  brandGlow: "rgba(45,74,62,0.15)",
  amber: "#C8873A",
  amberLight: "#FBF0E4",
  red: "#C0392B",
  redLight: "#FBE8E6",
  teal: "#1A7A8A",
  tealLight: "#E3F3F6",
  gold: "#B8953A",
  goldLight: "#FBF4E3",
  goldDeep: "#8A6A22",
  goldLine: "linear-gradient(90deg, rgba(184,149,58,0) 0%, rgba(184,149,58,0.55) 50%, rgba(184,149,58,0) 100%)",
  violet: "#6B4E9E",
  violetLight: "#F0EBF8",
  font: "'DM Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  fontMono: "'DM Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  serif: "'Fraunces', 'Iowan Old Style', 'Palatino Linotype', Georgia, serif",
  r: { xs: "6px", sm: "10px", md: "14px", lg: "20px", xl: "28px" },
  sh: {
    sm: "0 1px 3px rgba(26,26,24,0.07), 0 1px 2px rgba(26,26,24,0.04)",
    md: "0 4px 16px rgba(26,26,24,0.09), 0 2px 6px rgba(26,26,24,0.05)",
    lg: "0 12px 40px rgba(26,26,24,0.13), 0 4px 12px rgba(26,26,24,0.06)",
    xl: "0 24px 64px rgba(26,26,24,0.17), 0 8px 24px rgba(26,26,24,0.08)",
  },
};

// ─── Status / Condition configs ───────────────────────────────────────────────
const STATUS_CFG = {
  Active: { bg: "#E8F5EE", color: "#1A6B3C", dot: "#2ECC71" },
  "In Maintenance": { bg: "#FEF3E2", color: "#A0560A", dot: "#F39C12" },
  Retired: { bg: "#FCE8E6", color: "#A93226", dot: "#E74C3C" },
  "In Transit": { bg: "#E3F2FD", color: "#1565C0", dot: "#2196F3" },
  Reserved: { bg: "#F3E8FD", color: "#6A1B9A", dot: "#9C27B0" },
};
const CONDITION_CFG = {
  Excellent: { color: "#1A6B3C", bg: "#E8F5EE" },
  Good: { color: "#1565C0", bg: "#E3F2FD" },
  Normal: { color: "#5C5B56", bg: "#F0EFEA" },
  Critical: { color: "#A93226", bg: "#FCE8E6" },
  Poor: { color: "#A0560A", bg: "#FEF3E2" },
};
const REQ_STATUS_CFG = {
  pending: {
    bg: "#FEF3E2",
    color: "#A0560A",
    icon: <HourglassEmpty sx={{ fontSize: 12 }} />,
  },
  approved: {
    bg: "#E8F5EE",
    color: "#1A6B3C",
    icon: <CheckCircleOutline sx={{ fontSize: 12 }} />,
  },
  rejected: {
    bg: "#FCE8E6",
    color: "#A93226",
    icon: <CancelOutlined sx={{ fontSize: 12 }} />,
  },
  completed: {
    bg: "#E3F2FD",
    color: "#1565C0",
    icon: <CheckCircle sx={{ fontSize: 12 }} />,
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getUserName = (user) => {
  if (!user) return null;
  if (typeof user === "string") return user;
  if (user.firstName || user.lastName)
    return `${user.firstName || ""} ${user.lastName || ""}`.trim();
  return user.name || user.email || "Unknown";
};

const isAdminCreatedAssetRequest = (request) =>
  /^Admin created\s+(parent|child)?\s*asset\b/i.test(
    String(request?.description || ""),
  ) ||
  /^Asset link request for\b/i.test(String(request?.description || ""));

// ─── Styled atoms ─────────────────────────────────────────────────────────────
const Card = styled(Paper)(({ theme }) => {
  const isDark = theme.palette.mode === "dark";
  return {
    background: isDark ? "#0f1c2e" : T.surface,
    color: isDark ? "#f8fafc" : T.ink,
    borderRadius: 20,
    border: `1px solid ${isDark ? "rgba(148, 163, 184, 0.24)" : T.border}`,
    boxShadow: isDark ? "none" : T.sh.sm,
    overflow: "hidden",
    position: "relative",
    transition: "box-shadow 0.25s ease, transform 0.25s ease",
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: 2,
      background: T.goldLine,
    },
    "&:hover": { boxShadow: isDark ? "0 12px 28px rgba(0,0,0,0.18)" : T.sh.md },
  };
});

const SectionTitle = ({ children, icon, action }) => (
  <Stack
    direction="row"
    alignItems="center"
    justifyContent="space-between"
    mb={2.5}
  >
    <Stack direction="row" alignItems="center" spacing={1.25}>
      <Box sx={{ color: T.brand, display: "flex", alignItems: "center" }}>
        {icon}
      </Box>
      <Typography
        sx={{
          fontSize: "0.72rem",
          fontWeight: 700,
          color: T.inkMuted,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          fontFamily: T.font,
        }}
      >
        {children}
      </Typography>
    </Stack>
    {action}
  </Stack>
);

// ── FIX #4: use "1 / -1" so fullWidth spans ALL columns (2 or 3) ──
const Field = ({ label, value, mono, icon, fullWidth, color, badge }) => (
  <Box sx={{ gridColumn: fullWidth ? "1 / -1" : undefined }}>
    <Typography
      sx={{
        fontSize: "0.67rem",
        fontWeight: 700,
        color: T.inkMuted,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        mb: 0.5,
        fontFamily: T.font,
        display: "flex",
        alignItems: "center",
        gap: 0.5,
      }}
    >
      {icon && React.cloneElement(icon, { sx: { fontSize: 11 } })}
      {label}
    </Typography>
    {badge ? (
      <Chip
        label={value || "—"}
        size="small"
        sx={{
          height: 22,
          fontSize: "0.73rem",
          fontWeight: 600,
          bgcolor: badge.bg,
          color: badge.color,
          fontFamily: T.font,
          borderRadius: T.r.xs,
        }}
      />
    ) : (
      <Typography
        sx={{
          fontSize: "0.875rem",
          fontWeight: 500,
          color: color || T.ink,
          fontFamily: mono ? T.fontMono : T.font,
          wordBreak: "break-all",
        }}
      >
        {value || <span style={{ color: T.inkMuted, fontWeight: 400 }}>—</span>}
      </Typography>
    )}
  </Box>
);

const SpecialistRow = ({ icon, label, value, color }) => {
  if (
    !value ||
    value === "Not Applicable" ||
    value === "Not Scheduled" ||
    value === 0
  )
    return null;
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1.25}
      sx={{
        py: 1,
        borderBottom: `1px solid ${T.border}`,
        "&:last-child": { borderBottom: "none", pb: 0 },
      }}
    >
      <Box sx={{ color: color || T.inkMuted, display: "flex" }}>
        {React.cloneElement(icon, { sx: { fontSize: 14 } })}
      </Box>
      <Typography
        sx={{
          fontSize: "0.75rem",
          color: T.inkMuted,
          fontFamily: T.font,
          flex: 1,
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontSize: "0.8rem",
          fontWeight: 600,
          color: T.ink,
          fontFamily: T.font,
        }}
      >
        {value}
      </Typography>
    </Stack>
  );
};

// ─── Error Banner ─────────────────────────────────────────────────────────────
const ErrorBanner = ({ message, onRetry }) => (
  <Box
    sx={{
      p: 3,
      borderRadius: T.r.md,
      bgcolor: T.redLight,
      border: `1px solid ${alpha(T.red, 0.2)}`,
      display: "flex",
      alignItems: "center",
      gap: 2,
    }}
  >
    <ErrorOutline sx={{ color: T.red, fontSize: 22, flexShrink: 0 }} />
    <Typography
      sx={{
        flex: 1,
        fontSize: "0.875rem",
        color: T.red,
        fontFamily: T.font,
        fontWeight: 500,
      }}
    >
      {message}
    </Typography>
    {onRetry && (
      <Button
        size="small"
        onClick={onRetry}
        startIcon={<Refresh sx={{ fontSize: 15 }} />}
        sx={{
          textTransform: "none",
          color: T.red,
          borderRadius: T.r.xs,
          border: `1px solid ${alpha(T.red, 0.35)}`,
          fontFamily: T.font,
          fontWeight: 600,
          fontSize: "0.78rem",
          "&:hover": { bgcolor: alpha(T.red, 0.08) },
        }}
      >
        Retry
      </Button>
    )}
  </Box>
);

// ─── Inline Create Request Dialog ─────────────────────────────────────────────
const SlideUp = React.forwardRef(function SlideUp(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function AddAssetModal({
  open,
  onClose,
  onAssetCreated,
  defaultAssetType = "parent",
  defaultParentAssetId = null,
  defaultSerialNumber = "",
  title = "Add New Asset",
  subtitle = "Asset will be auto-selected after saving",
}) {
  const [AddNewAsset, setAddNewAsset] = useState(null);
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  useEffect(() => {
    if (open && !AddNewAsset) {
      import("./AddNewAsset")
        .then((mod) => setAddNewAsset(() => mod.default))
        .catch(() => setAddNewAsset(null));
    }
  }, [open, AddNewAsset]);

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={onClose}
      TransitionComponent={SlideUp}
      sx={{ zIndex: 1700 }}
      PaperProps={{
        sx: {
          bgcolor: isDark ? "#07111f" : T.bg,
          m: { xs: 0, sm: "12px" },
          borderRadius: { xs: 0, sm: T.r.lg },
          height: { xs: "100%", sm: "calc(100% - 24px)" },
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxShadow: T.sh.xl,
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 3,
          py: 1.25,
          bgcolor: isDark ? "#0c1726" : T.surface,
          borderBottom: `1px solid ${isDark ? "rgba(148, 163, 184, 0.22)" : T.border
            }`,
          flexShrink: 0,
          zIndex: 10,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 30,
              height: 30,
              borderRadius: T.r.sm,
              bgcolor: isDark ? "rgba(103, 232, 249, 0.14)" : T.brandLight,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Inventory2
              sx={{ fontSize: 15, color: isDark ? "#67e8f9" : T.brand }}
            />
          </Box>
          <Box>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: "0.875rem",
                color: isDark ? "#f8fafc" : T.ink,
                lineHeight: 1.2,
              }}
            >
              {title}
            </Typography>
            <Typography
              sx={{ fontSize: "0.68rem", color: isDark ? "#94a3b8" : T.inkMuted }}
            >
              {subtitle}
            </Typography>
          </Box>
        </Stack>
        <Tooltip title="Close and go back">
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              bgcolor: isDark ? "rgba(148, 163, 184, 0.12)" : T.surfaceAlt,
              color: isDark ? "#cbd5e1" : T.inkMuted,
              borderRadius: T.r.xs,
              width: 30,
              height: 30,
              "&:hover": {
                bgcolor: isDark ? "rgba(239, 68, 68, 0.16)" : T.redLight,
                color: isDark ? "#fca5a5" : T.red,
              },
            }}
          >
            <Close sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
        {open && AddNewAsset ? (
          <AddNewAsset
            key={`${defaultAssetType}-${defaultSerialNumber}`}
            embeddedMode
            defaultAssetType={defaultAssetType}
            defaultParentAssetId={defaultParentAssetId}
            defaultSerialNumber={defaultSerialNumber}
            onEmbeddedClose={onClose}
            onEmbeddedSuccess={(newAsset) => {
              onAssetCreated?.(newAsset);
              onClose();
            }}
          />
        ) : open ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "60vh",
              gap: 1.5,
            }}
          >
            <CircularProgress size={32} sx={{ color: T.brand }} />
            <Typography sx={{ color: T.inkMuted, fontSize: "0.875rem", fontWeight: 500 }}>
              Loading asset form...
            </Typography>
          </Box>
        ) : null}
      </Box>
    </Dialog>
  );
}

function CreateRequestDialog({ open, onClose, onSuccess }) {
  const { createParentRequest } = useAssetRequest();
  const { getAllAssets, assets, loading: assetsLoading } = useAsset();

  const [form, setForm] = useState({
    assetId: "",
    requestType: "transfer",
    description: "",
    urgency: "medium",
  });
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [addAssetOpen, setAddAssetOpen] = useState(false);

  useEffect(() => {
    if (open) {
      getAllAssets?.({ limit: 200 });
      setForm({
        assetId: "",
        requestType: "transfer",
        description: "",
        urgency: "medium",
      });
      setSelectedAsset(null);
      setFormError("");
    }
  }, [open, getAllAssets]);

  const handleAssetChange = (_, newValue) => {
    if (newValue) {
      setSelectedAsset(newValue);
      setForm((p) => ({ ...p, assetId: newValue._id || newValue.id || "" }));
      setFormError("");
    } else {
      setSelectedAsset(null);
      setForm((p) => ({ ...p, assetId: "" }));
    }
  };

  const handleNewAssetCreated = async (newAsset) => {
    await getAllAssets?.({ limit: 200 });
    if (newAsset) {
      setSelectedAsset(newAsset);
      setForm((p) => ({
        ...p,
        assetId: newAsset._id || newAsset.id || "",
      }));
      setFormError("");
    }
  };

  const handleSubmit = async () => {
    if (!form.assetId) {
      setFormError("Please select an asset");
      return;
    }
    setSubmitting(true);
    setFormError("");
    try {
      await createParentRequest({
        assetId: form.assetId,
        requestType: form.requestType,
        description: form.description,
        urgency: form.urgency,
      });
      onSuccess?.();
      onClose();
    } catch (err) {
      setFormError(
        err?.response?.data?.message ||
        err?.message ||
        "Failed to create request",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const labelSx = {
    fontSize: "0.67rem",
    fontWeight: 700,
    color: T.inkMuted,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    mb: 0.75,
    fontFamily: T.font,
    display: "block",
  };

  const inputSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: T.r.md,
      fontSize: "0.875rem",
      "& fieldset": { borderColor: T.border },
      "&:hover fieldset": { borderColor: T.borderStrong },
      "&.Mui-focused fieldset": { borderColor: T.brand, borderWidth: "1.5px" },
    },
  };

  const selectSx = {
    borderRadius: T.r.md,
    "& .MuiOutlinedInput-notchedOutline": { borderColor: T.border },
    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: T.borderStrong },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: T.brand,
      borderWidth: "1.5px",
    },
  };
  const assetOptions = [
    ...(Array.isArray(assets) ? assets : []),
    { __isAddNew: true, _id: "__add_new__" },
  ];

  return (
    <>
      <Dialog
        open={open}
        onClose={() => !submitting && onClose()}
        maxWidth="sm"
        fullWidth
        sx={{ zIndex: 1500 }}
        PaperProps={{
          sx: {
            borderRadius: T.r.lg,
            border: `1px solid ${T.border}`,
            bgcolor: T.surface,
            boxShadow: T.sh.xl,
            overflow: "hidden",
            animation: `${popIn} 0.2s ease both`,
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            px: 3,
            pt: 2.5,
            pb: 2,
            borderBottom: `1px solid ${T.border}`,
            bgcolor: alpha(T.brand, 0.04),
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: T.r.sm,
                  bgcolor: T.brandLight,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Add sx={{ fontSize: 20, color: T.brand }} />
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: "1rem",
                    color: T.ink,
                    fontFamily: T.font,
                  }}
                >
                  New Asset Request
                </Typography>
                <Typography
                  sx={{
                    fontSize: "0.72rem",
                    color: T.inkMuted,
                    fontFamily: T.font,
                  }}
                >
                  Create a parent request to link this asset to
                </Typography>
              </Box>
            </Stack>
            <IconButton
              onClick={onClose}
              disabled={submitting}
              size="small"
              sx={{
                bgcolor: T.surfaceAlt,
                borderRadius: T.r.xs,
                border: `1px solid ${T.border}`,
                "&:hover": { bgcolor: T.border },
              }}
            >
              <Close sx={{ fontSize: 16 }} />
            </IconButton>
          </Stack>
        </Box>

        {/* Body */}
        <Box sx={{ p: 3 }}>
          {formError && (
            <Alert
              severity="error"
              sx={{ mb: 2.5, borderRadius: T.r.md, fontFamily: T.font }}
            >
              {formError}
            </Alert>
          )}
          <Stack spacing={2.5}>
            {/* Asset */}
            <Box>
              <Typography sx={labelSx}>Asset *</Typography>
              <Autocomplete
                size="small"
                options={assetOptions}
                loading={assetsLoading}
                value={selectedAsset}
                onChange={(_, val) => {
                  if (val?.__isAddNew) {
                    setAddAssetOpen(true);
                    return;
                  }
                  setSelectedAsset(val);
                  setForm((p) => ({ ...p, assetId: val?._id || val?.id || "" }));
                  if (formError) setFormError("");
                }}
                getOptionLabel={(o) => {
                  if (o?.__isAddNew) return "Add New Asset";
                  const name = o?.assetName || o?.name || "Unnamed";
                  const tag = o?.assetId || o?.serialNumber || "";
                  return tag ? `${name} (${tag})` : name;
                }}
                isOptionEqualToValue={(o, v) =>
                  !o?.__isAddNew && !v?.__isAddNew && (o?._id || o?.id) === (v?._id || v?.id)
                }
                slotProps={{
                  popper: { style: { zIndex: 1600 } },
                }}
                renderOption={(props, option) => {
                  if (option.__isAddNew) {
                    return (
                      <Box
                        component="li"
                        {...props}
                        key="__add_new__"
                        sx={{
                          borderTop: `1px solid ${T.border}`,
                          mt: 0.5,
                          pt: "10px !important",
                        }}
                      >
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: T.r.sm,
                              bgcolor: T.tealLight,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            <AddCircleOutline sx={{ fontSize: 16, color: T.teal }} />
                          </Box>
                          <Box>
                            <Typography sx={{ fontSize: "0.875rem", fontWeight: 700, color: T.teal }}>
                              Add New Asset
                            </Typography>
                            <Typography sx={{ fontSize: "0.72rem", color: T.inkMuted }}>
                              Create a new asset and select it
                            </Typography>
                          </Box>
                        </Stack>
                      </Box>
                    );
                  }

                  const name = option.assetName || option.name || "Unnamed";
                  const tag = option.assetId || option.serialNumber || "";
                  const status = option.status || "Unknown";
                  const statusCfg = STATUS_CFG[status] || {
                    bg: T.surfaceAlt,
                    color: T.inkMuted,
                  };
                  return (
                    <Box component="li" {...props} key={option._id || option.id}>
                      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ width: "100%" }}>
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: T.r.sm,
                            bgcolor: T.surfaceAlt,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <Inventory2 sx={{ fontSize: 16, color: T.inkMuted }} />
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: T.ink }}>
                            {name}
                          </Typography>
                          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                            {tag && (
                              <Typography sx={{ fontSize: "0.72rem", color: T.inkMuted }}>
                                {tag}
                              </Typography>
                            )}
                            <Chip
                              label={status}
                              size="small"
                              sx={{
                                height: 18,
                                fontSize: 9,
                                fontWeight: 700,
                                color: statusCfg.color,
                                bgcolor: statusCfg.bg,
                              }}
                            />
                          </Stack>
                        </Box>
                      </Stack>
                    </Box>
                  );
                }}
                renderInput={(params) => (
                  <TextField {...params} placeholder="Search assets…" sx={inputSx} />
                )}
              />
              {selectedAsset && (
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  mt={1}
                  sx={{
                    px: 1.5,
                    py: 0.75,
                    borderRadius: T.r.sm,
                    bgcolor: T.brandLight,
                    border: `1px solid ${alpha(T.brand, 0.2)}`,
                  }}
                >
                  <CheckCircleOutline sx={{ fontSize: 14, color: T.brand }} />
                  <Typography
                    sx={{
                      fontSize: "0.75rem",
                      color: T.brand,
                      fontWeight: 500,
                      fontFamily: T.font,
                    }}
                  >
                    {selectedAsset.assetName || selectedAsset.name}
                  </Typography>
                </Stack>
              )}
            </Box>

            {/* Type + Urgency */}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <Box flex={1}>
                <Typography sx={labelSx}>Request Type</Typography>
                <Select
                  fullWidth
                  size="small"
                  value={form.requestType}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, requestType: e.target.value }))
                  }
                  sx={selectSx}
                >
                  {["transfer", "maintenance", "repair", "checkout", "other"].map(
                    (t) => (
                      <MenuItem
                        key={t}
                        value={t}
                        sx={{ textTransform: "capitalize", fontFamily: T.font }}
                      >
                        {t}
                      </MenuItem>
                    ),
                  )}
                </Select>
              </Box>
              <Box flex={1}>
                <Typography sx={labelSx}>Urgency</Typography>
                <Select
                  fullWidth
                  size="small"
                  value={form.urgency}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, urgency: e.target.value }))
                  }
                  sx={selectSx}
                >
                  {["low", "medium", "high", "critical"].map((u) => (
                    <MenuItem
                      key={u}
                      value={u}
                      sx={{ textTransform: "capitalize", fontFamily: T.font }}
                    >
                      {u}
                    </MenuItem>
                  ))}
                </Select>
              </Box>
            </Stack>

            {/* Description */}
            <Box>
              <Typography sx={labelSx}>Description</Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                size="small"
                placeholder="Describe the reason for this request…"
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                inputProps={{ maxLength: 1000 }}
                sx={inputSx}
              />
            </Box>
          </Stack>
        </Box>

        {/* Footer */}
        <Box
          sx={{
            px: 3,
            py: 2.5,
            borderTop: `1px solid ${T.border}`,
            display: "flex",
            justifyContent: "flex-end",
            gap: 1.5,
            bgcolor: T.surfaceAlt,
          }}
        >
          <Button
            onClick={onClose}
            disabled={submitting}
            sx={{
              textTransform: "none",
              borderRadius: T.r.sm,
              px: 2.5,
              color: T.inkSecondary,
              fontFamily: T.font,
              fontWeight: 600,
              border: `1px solid ${T.border}`,
              bgcolor: T.surface,
              "&:hover": { bgcolor: T.surfaceHover },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting}
            startIcon={
              submitting ? <CircularProgress size={15} color="inherit" /> : null
            }
            sx={{
              textTransform: "none",
              borderRadius: T.r.sm,
              bgcolor: T.brand,
              color: "#fff",
              fontFamily: T.font,
              fontWeight: 700,
              px: 3,
              boxShadow: `0 2px 8px ${T.brandGlow}`,
              "&:hover": { bgcolor: T.brandAccent },
              "&.Mui-disabled": { opacity: 0.45 },
            }}
          >
            {submitting ? "Creating..." : "Create Request"}
          </Button>
        </Box>
      </Dialog>
      <AddAssetModal
        open={addAssetOpen}
        onClose={() => setAddAssetOpen(false)}
        onAssetCreated={handleNewAssetCreated}
      />
    </>
  );
}

// ─── Link Asset Dialog ────────────────────────────────────────────────────────
const LinkAssetDialog = ({ open, onClose, assetId, currentAsset, onSuccess }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isDark = theme.palette.mode === "dark";
  const dialogSurface = isDark ? "#0f1c2e" : T.surface;
  const dialogSurfaceAlt = isDark ? "#0b1626" : T.surfaceAlt;
  const dialogSoft = isDark ? "rgba(45, 74, 62, 0.26)" : T.brandLight;
  const dialogBorder = isDark ? "rgba(148, 163, 184, 0.24)" : T.border;
  const dialogText = isDark ? "#f8fafc" : T.ink;
  const dialogTextSecondary = isDark ? "#cbd5e1" : T.inkSecondary;
  const dialogMuted = isDark ? "#94a3b8" : T.inkMuted;
  const { user } = useAuth();
  const {
    fetchRequests,
    getRequestsByAsset,
    createParentRequest,
    approveRequest,
    linkAsset,
  } = useAssetRequest();
  const { getAllAssets, assets, loading: assetsLoading } = useAsset();
  const canCreateRequests = ["admin", "team"].includes(user?.role);
  const [parentRequests, setParentRequests] = useState([]);
  const [loadingParents, setLoadingParents] = useState(false);
  const [parentError, setParentError] = useState("");
  const [selectedParent, setSelectedParent] = useState(null);
  const [selectedChildAssets, setSelectedChildAssets] = useState([]);
  const [relationshipType, setRelationshipType] = useState("accessory");
  const [searchParent, setSearchParent] = useState("");
  const [linking, setLinking] = useState(false);
  const [snackMsg, setSnackMsg] = useState("");
  const [createRequestOpen, setCreateRequestOpen] = useState(false);
  // const [addParentAssetOpen, setAddParentAssetOpen] = useState(false);
  const [addChildAssetOpen, setAddChildAssetOpen] = useState(false);
  const [assetFormSerial, setAssetFormSerial] = useState("");

  const makeSerialNumber = (type) =>
    `${type === "child" ? "CA" : "PA"}_${Date.now().toString().slice(-8)}`;

  const openAssetForm = () => {
    setAssetFormSerial(makeSerialNumber("child"));
    setAddChildAssetOpen(true);
  };

  const text = (value) => String(value || "").trim().toLowerCase();
  const currentAssetIsChild =
    text(currentAsset?.assetType) === "child" ||
    !!currentAsset?.parentAssetId ||
    text(currentAsset?.assetId).startsWith("ca-") ||
    text(currentAsset?.assetId).startsWith("ca_") ||
    text(currentAsset?.serialNumber).startsWith("ca-") ||
    text(currentAsset?.serialNumber).startsWith("ca_");
  const showingChildAssets = true;
  const isLinkableChildAsset = (asset) => {
    const assetType = text(asset?.assetType);
    const assetCode = text(asset?.assetId);
    const serial = text(asset?.serialNumber);

    return (
      assetType === "child" ||
      assetCode.startsWith("ca-") ||
      assetCode.startsWith("ca_") ||
      serial.startsWith("ca-") ||
      serial.startsWith("ca_")
    );
  };
  const dialogScrollbarSx = {
    scrollbarWidth: "thin",
    scrollbarColor: `${alpha(T.brand, isDark ? 0.6 : 0.45)} transparent`,
    "&::-webkit-scrollbar": { width: 8, height: 8 },
    "&::-webkit-scrollbar-track": { backgroundColor: "transparent" },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: alpha(T.brand, isDark ? 0.48 : 0.32),
      borderRadius: 999,
      border: `2px solid ${dialogSurface}`,
    },
    "&::-webkit-scrollbar-thumb:hover": {
      backgroundColor: alpha(T.brand, isDark ? 0.68 : 0.48),
    },
    "&::-webkit-scrollbar-corner": { backgroundColor: "transparent" },
  };

  const loadParentRequests = useCallback(async () => {
    setLoadingParents(true);
    setParentError("");
    try {
      const res = await fetchRequests({
        type: "all",
        status: "approved",
        limit: 100,
      });
      const currentAssetRequestsRes = await getRequestsByAsset(assetId);
      const currentAssetRequests = currentAssetRequestsRes?.requests || [];
      const currentAssetApprovedRequests = currentAssetRequests.filter(
        (req) => req.status === "approved",
      );

      if (res?.success) {
        setParentRequests([...(res.requests || []), ...currentAssetApprovedRequests]);
      } else if (res?.requests) {
        setParentRequests([...res.requests, ...currentAssetApprovedRequests]);
      } else if (Array.isArray(res)) {
        setParentRequests([...res, ...currentAssetApprovedRequests]);
      } else {
        setParentError(res?.message || "Failed to load requests");
      }
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401) {
        setParentError(
          "Authentication failed. Please refresh the page and log in again.",
        );
      } else if (status === 403) {
        setParentError(err?.response?.data?.message || "You don't have permission to View");
      } else {
        setParentError(
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load requests",
        );
      }
    } finally {
      setLoadingParents(false);
    }
  }, [assetId, fetchRequests, getRequestsByAsset]);

  useEffect(() => {
    if (open) {
      setSelectedParent(null);
      setSelectedChildAssets([]);
      setSearchParent("");
      setParentError("");
      setRelationshipType("accessory");
      loadParentRequests();
      getAllAssets?.({ limit: 200 });
    }
  }, [open, loadParentRequests, getAllAssets]);

  const filteredParents = parentRequests
    .filter((req) => {
      const serial = (
        req.assetId?.serialNumber ||
        req.proposedAssetData?.serialNumber ||
        ""
      ).toUpperCase();
      const code = (req.assetId?.assetId || "").toUpperCase();
      const assetType = (req.assetId?.assetType || req.assetType || "").toLowerCase();

      return (
        !req.isChildRequest &&
        !req.parentRequestId &&
        assetType !== "child" &&
        !req.assetId?.parentAssetId &&
        !serial.startsWith("CA_") &&
        !serial.startsWith("CA-") &&
        !code.startsWith("CA_") &&
        !code.startsWith("CA-") &&
        (req.assetId?._id || req.assetId?.id || req.assetId) !== assetId
      );
    })
    .filter((req) => {
      const searchLower = searchParent.toLowerCase();
      const assetName = (
        req.assetId?.assetName ||
        req.assetId?.name ||
        ""
      ).toLowerCase();
      const assetIdStr = (
        req.assetId?.assetId ||
        req.assetId?._id ||
        ""
      ).toLowerCase();
      const requestTypeStr = (req.requestType || "").toLowerCase();
      return (
        assetName.includes(searchLower) ||
        assetIdStr.includes(searchLower) ||
        requestTypeStr.includes(searchLower)
      );
    });

  const alreadyLinkedChildAssetIds = new Set();
  parentRequests.forEach((req) => {
    const reqAssetId = req.assetId?._id || req.assetId?.id || req.assetId;
    if (String(reqAssetId) !== String(assetId)) return;

    [...(req.metadata?.childAssets || []), ...(req.metadata?.pendingChildAssets || [])].forEach((entry) => {
      const linkedAsset = entry.assetId || entry.asset || entry;
      const linkedAssetId =
        typeof linkedAsset === "string"
          ? linkedAsset
          : linkedAsset?._id || linkedAsset?.id;
      if (linkedAssetId) alreadyLinkedChildAssetIds.add(String(linkedAssetId));
    });
  });

  const filteredChildAssets = (Array.isArray(assets) ? assets : [])
    .filter((asset) => {
      const candidateId = asset._id || asset.id;

      return (
        String(candidateId) !== String(assetId) &&
        !alreadyLinkedChildAssetIds.has(String(candidateId)) &&
        isLinkableChildAsset(asset)
      );
    })
    .filter((asset) => {
      const searchLower = searchParent.toLowerCase();
      const fields = [
        asset.assetName,
        asset.name,
        asset.assetId,
        asset._id,
        asset.id,
        asset.serialNumber,
        asset.tagNumber,
      ]
        .map((value) => String(value || "").toLowerCase())
        .join(" ");
      return fields.includes(searchLower);
    });

  const toggleChildAssetSelection = (childAsset) => {
    const childAssetId = childAsset._id || childAsset.id;
    setSelectedChildAssets((previous) => {
      const isAlreadySelected = previous.some(
        (selected) => String(selected._id || selected.id) === String(childAssetId),
      );
      if (isAlreadySelected) {
        return previous.filter(
          (selected) => String(selected._id || selected.id) !== String(childAssetId),
        );
      }
      return [...previous, childAsset];
    });
  };

  const handleLink = async () => {
    if (showingChildAssets && selectedChildAssets.length === 0) {
      setSnackMsg("Please select at least one child asset");
      return;
    }
    if (!showingChildAssets && !selectedParent) {
      setSnackMsg("Please select a parent request");
      return;
    }
    setLinking(true);
    try {
      const getRequestId = (request) =>
        request?._id ||
        request?.id ||
        request?._doc?._id ||
        request?._doc?.id ||
        request?.request?._id ||
        request?.request?.id;

      let targetRequest = parentRequests.find((req) => {
        const reqAssetId = req.assetId?._id || req.assetId?.id || req.assetId;
        return String(reqAssetId) === String(assetId);
      });

      if (!targetRequest?._id) {
        const currentAssetRequestsRes = await getRequestsByAsset(assetId);
        targetRequest = (currentAssetRequestsRes?.requests || []).find((req) => {
          const reqAssetId = req.assetId?._id || req.assetId?.id || req.assetId;
          return String(reqAssetId) === String(assetId) && req.status === "approved";
        });
      }

      if (!getRequestId(targetRequest) && user?.role === "admin") {
        const createdRequest = await createParentRequest({
          assetId,
          requestType: "other",
          description: `Asset link request for ${currentAsset?.assetName || currentAsset?.assetId || "asset"}`,
          urgency: "medium",
          assetType: currentAssetIsChild ? "child" : "parent",
          parentAssetId: currentAsset?.parentAssetId || null,
        });
        const createdRequestId = getRequestId(createdRequest);
        if (createdRequestId) {
          const approvedRequest = await approveRequest(
            createdRequestId,
            "Auto-approved to link child asset",
          );
          targetRequest = approvedRequest || createdRequest;
        }
      }

      const targetRequestId = getRequestId(targetRequest);
      if (!targetRequestId) {
        throw new Error("Create or approve a request for this asset before linking a child asset.");
      }

      await Promise.all(
        selectedChildAssets.map((childAsset) => {
          const childAssetId = childAsset._id || childAsset.id;
          return linkAsset(targetRequestId, childAssetId, relationshipType);
        }),
      );
      onSuccess?.(
        user?.role === "team"
          ? "Asset link request sent for admin approval"
          : "Asset linked successfully!",
      );
      onClose();
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401) {
        setSnackMsg("Authentication failed. Please refresh the page.");
      } else if (status === 403) {
        setSnackMsg(err?.response?.data?.message || "You don't have permission to Create");
      } else {
        setSnackMsg(
          err?.response?.data?.message ||
          err?.message ||
          "Failed to link asset",
        );
      }
    } finally {
      setLinking(false);
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: { xs: 0, sm: T.r.lg },
            border: `1px solid ${dialogBorder}`,
            bgcolor: dialogSurface,
            boxShadow: isDark ? "0 24px 64px rgba(0,0,0,0.28)" : T.sh.xl,
            overflow: "hidden",
            animation: `${popIn} 0.25s ease both`,
            m: { xs: 0, sm: 2 },
            width: { xs: "100%", sm: "calc(100% - 32px)" },
            maxWidth: { xs: "none", sm: 600 },
            height: { xs: "100dvh", sm: "auto" },
            maxHeight: { xs: "100dvh", sm: "calc(100% - 64px)" },
            display: "flex",
            flexDirection: "column",
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            px: { xs: 2, sm: 3 },
            pt: { xs: 2, sm: 3 },
            pb: { xs: 2, sm: 0 },
            background: isDark
              ? `linear-gradient(135deg, ${dialogSoft} 0%, ${dialogSurface} 70%)`
              : `linear-gradient(135deg, ${T.brandLight} 0%, ${T.surface} 70%)`,
            flexShrink: 0,
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            mb={2}
          >
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: T.r.sm,
                  bgcolor: T.brand,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: `0 4px 12px ${T.brandGlow}`,
                }}
              >
                <AddLink sx={{ fontSize: 20, color: "#fff" }} />
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: "1rem",
                    color: dialogText,
                    fontFamily: T.font,
                    letterSpacing: "-0.02em",
                  }}
                >
                  Link Asset to Request
                </Typography>
                <Typography
                  sx={{
                    fontSize: "0.72rem",
                    color: dialogMuted,
                    fontFamily: T.font,
                  }}
                >
                  {showingChildAssets
                    ? "Select a child asset to link to this parent"
                    : "Select an approved parent request to link this asset"}
                </Typography>
              </Box>
            </Stack>
            <IconButton
              onClick={onClose}
              size="small"
              sx={{
                bgcolor: dialogSurfaceAlt,
                borderRadius: T.r.xs,
                border: `1px solid ${dialogBorder}`,
                color: dialogText,
                "&:hover": { bgcolor: dialogSoft },
              }}
            >
              <Close sx={{ fontSize: 16 }} />
            </IconButton>
          </Stack>
        </Box>

        <DialogContent
          sx={{
            p: { xs: 2, sm: 3 },
            bgcolor: dialogSurface,
            flex: 1,
            maxHeight: { xs: "none", sm: "72vh" },
            overflowY: { xs: "auto", sm: "hidden" },
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
            ...dialogScrollbarSx,
          }}
        >
          {/* Current Asset Info */}
          <Box
            sx={{
              p: 2,
              borderRadius: T.r.md,
              bgcolor: dialogSoft,
              border: `1px solid ${alpha(T.brand, 0.2)}`,
              mb: 3,
            }}
          >
            <Typography
              sx={{
                fontSize: "0.67rem",
                fontWeight: 700,
                color: T.brand,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                mb: 0.75,
                fontFamily: T.font,
              }}
            >
              Asset To Link
            </Typography>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Inventory2
                sx={{ fontSize: 18, color: T.brand, flexShrink: 0 }}
              />
              <Typography
                sx={{
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: dialogText,
                  fontFamily: T.fontMono,
                }}
              >
                {assetId?.slice(-10) || "—"}
              </Typography>
            </Stack>
          </Box>

          <Typography
            sx={{
              fontSize: "0.8rem",
              color: dialogTextSecondary,
              fontFamily: T.font,
              mb: 2,
              lineHeight: 1.6,
            }}
          >
            {showingChildAssets
              ? "Choose a child asset to link under this parent asset."
              : "Choose an approved parent request to link this asset to. The asset will become a child of the selected request."}
          </Typography>

          {parentError ? (
            <ErrorBanner message={parentError} onRetry={loadParentRequests} />
          ) : (
            <>
              <TextField
                fullWidth
                size="small"
                placeholder={
                  showingChildAssets
                    ? "Search by child asset name, ID, or serial..."
                    : "Search by asset name, ID, or request type..."
                }
                value={searchParent}
                onChange={(e) => setSearchParent(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ fontSize: 15, color: dialogMuted }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 2,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: T.r.sm,
                    fontSize: "0.875rem",
                    fontFamily: T.font,
                    bgcolor: dialogSurfaceAlt,
                    color: dialogText,
                    "& fieldset": { borderColor: dialogBorder },
                    "&:hover fieldset": { borderColor: T.brand },
                    "&.Mui-focused fieldset": {
                      borderColor: T.brand,
                      borderWidth: 1.5,
                    },
                  },
                }}
              />

              {loadingParents || (showingChildAssets && assetsLoading) ? (
                <Stack spacing={1.5}>
                  {[1, 2, 3].map((i) => (
                    <Skeleton
                      key={i}
                      variant="rounded"
                      height={88}
                      sx={{ borderRadius: T.r.md }}
                    />
                  ))}
                </Stack>
              ) : (showingChildAssets ? filteredChildAssets.length : filteredParents.length) === 0 ? (
                <Box sx={{ py: 6, textAlign: "center" }}>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: "50%",
                      bgcolor: dialogSurfaceAlt,
                      border: `1px solid ${dialogBorder}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mx: "auto",
                      mb: 2,
                    }}
                  >
                    <LinkOff sx={{ fontSize: 26, color: dialogMuted }} />
                  </Box>
                  <Typography
                    sx={{
                      fontSize: "0.9rem",
                      fontWeight: 600,
                      color: dialogText,
                      fontFamily: T.font,
                      mb: 0.5,
                    }}
                  >
                    {searchParent.trim()
                      ? `${searchParent.trim()} child asset is not created yet`
                      : showingChildAssets
                        ? "No child assets yet"
                        : "No requests yet"}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "0.78rem",
                      color: dialogMuted,
                      fontFamily: T.font,
                      mb: 3,
                    }}
                  >
                    {searchParent.trim()
                      ? "Create a new child asset for this name."
                      : showingChildAssets
                        ? "No child assets are available to link yet."
                        : "No approved parent requests are available to link yet."}
                  </Typography>

                  {canCreateRequests && (
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={1}
                      justifyContent="center"
                    >
                      <Button
                        variant="contained"
                        startIcon={<Add sx={{ fontSize: 16 }} />}
                        onClick={() => openAssetForm("child")}
                        sx={{
                          textTransform: "none",
                          borderRadius: T.r.sm,
                          bgcolor: T.brand,
                          color: "#fff",
                          fontFamily: T.font,
                          fontWeight: 700,
                          px: 3,
                          py: 1,
                          boxShadow: `0 2px 8px ${T.brandGlow}`,
                          "&:hover": { bgcolor: T.brandAccent },
                        }}
                      >

                        Add New Child Asset

                      </Button>
                      {/* {!searchParent.trim() && (
                        <Button
                          variant="outlined"
                          startIcon={<Add sx={{ fontSize: 16 }} />}
                          onClick={() => openAssetForm("parent")}
                          sx={{
                            textTransform: "none",
                            borderRadius: T.r.sm,
                            borderColor: alpha(T.brand, 0.28),
                            color: T.brand,
                            bgcolor: T.brandLight,
                            fontFamily: T.font,
                            fontWeight: 700,
                            px: 3,
                            py: 1,
                            "&:hover": {
                              borderColor: T.brand,
                              bgcolor: alpha(T.brand, 0.12),
                            },
                          }}
                        >
                          Add Asset
                        </Button>
                      )} */}
                    </Stack>
                  )}
                </Box>
              ) : (
                <>
                  {showingChildAssets && selectedChildAssets.length > 0 && (
                    <Chip
                      label={`${selectedChildAssets.length} selected`}
                      size="small"
                      sx={{
                        mb: 1.25,
                        height: 24,
                        fontSize: "0.68rem",
                        fontWeight: 700,
                        bgcolor: T.brandLight,
                        color: T.brand,
                        fontFamily: T.font,
                      }}
                    />
                  )}
                  <Stack
                    spacing={1.25}
                    sx={{
                      maxHeight: { xs: "none", sm: 360 },
                      overflowY: { xs: "visible", sm: "auto" },
                      pr: { xs: 0, sm: 0.75 },
                      ...dialogScrollbarSx,
                    }}
                  >
                    {(showingChildAssets ? filteredChildAssets : filteredParents).map((item) => {
                      const req = item;
                      const childAssetId = item._id || item.id;
                      const isSelected = showingChildAssets
                        ? selectedChildAssets.some(
                          (selected) => String(selected._id || selected.id) === String(childAssetId),
                        )
                        : selectedParent?._id === req._id;
                      const sCfg = REQ_STATUS_CFG[showingChildAssets ? "approved" : req.status] || {};
                      const linkedCount = showingChildAssets ? 0 : req.childRequests?.length || 0;
                      const assetSerial = showingChildAssets
                        ? item.serialNumber || item.assetId || "Not set"
                        : req.assetId?.serialNumber ||
                        req.proposedAssetData?.serialNumber ||
                        "Not set";
                      const assetCode = showingChildAssets
                        ? item.assetId || childAssetId?.slice(-8)
                        : req.assetId?.assetId ||
                        req.assetId?._id?.slice(-8) ||
                        req._id?.slice(-8);
                      const itemTitle = showingChildAssets
                        ? item.assetName || item.name || "Unnamed Child Asset"
                        : req.assetId?.assetName || req.assetId?.name || "Unnamed Asset";
                      return (
                        <Box
                          key={showingChildAssets ? childAssetId : req._id}
                          onClick={() =>
                            showingChildAssets
                              ? toggleChildAssetSelection(item)
                              : setSelectedParent(req)
                          }
                          sx={{
                            p: 2,
                            borderRadius: T.r.md,
                            cursor: "pointer",
                            border: `1.5px solid ${isSelected ? T.brand : dialogBorder}`,
                            bgcolor: isSelected ? dialogSoft : dialogSurface,
                            transition: "all 0.15s ease",
                            boxShadow: isSelected
                              ? `0 0 0 3px ${T.brandGlow}`
                              : "none",
                            "&:hover": {
                              borderColor: T.brand,
                              bgcolor: dialogSoft,
                            },
                          }}
                        >
                          <Stack
                            direction="row"
                            alignItems="flex-start"
                            justifyContent="space-between"
                          >
                            <Stack
                              direction="row"
                              spacing={1.5}
                              alignItems="flex-start"
                              sx={{ flex: 1, minWidth: 0 }}
                            >
                              <Box
                                sx={{
                                  width: 36,
                                  height: 36,
                                  borderRadius: T.r.xs,
                                  bgcolor: isSelected ? T.brand : dialogSurfaceAlt,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  transition: "all 0.15s",
                                  flexShrink: 0,
                                  mt: 0.25,
                                }}
                              >
                                <AccountTree
                                  sx={{
                                    fontSize: 16,
                                    color: isSelected ? "#fff" : dialogMuted,
                                  }}
                                />
                              </Box>
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography
                                  sx={{
                                    fontSize: "0.875rem",
                                    fontWeight: 600,
                                    color: dialogText,
                                    fontFamily: T.font,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {itemTitle}
                                </Typography>
                                <Typography
                                  sx={{
                                    fontSize: "0.7rem",
                                    color: dialogTextSecondary,
                                    fontFamily: T.fontMono,
                                    mt: 0.25,
                                  }}
                                >
                                  Serial: {assetSerial}
                                </Typography>
                                <Stack
                                  direction="row"
                                  spacing={0.75}
                                  alignItems="center"
                                  flexWrap="wrap"
                                  sx={{ mt: 0.75 }}
                                >
                                  {linkedCount > 0 && (
                                    <Chip
                                      label={`LINKED ASSETS ${linkedCount}`}
                                      size="small"
                                      sx={{
                                        height: 24,
                                        fontSize: "0.68rem",
                                        fontWeight: 700,
                                        bgcolor: T.violetLight,
                                        color: T.violet,
                                        fontFamily: T.font,
                                      }}
                                    />
                                  )}
                                </Stack>
                                <Typography
                                  sx={{
                                    fontSize: "0.7rem",
                                    color: dialogMuted,
                                    fontFamily: T.fontMono,
                                    mt: 0.2,
                                  }}
                                >
                                  {assetCode || "Not set"}{" "}
                                  · {req.requestType || "transfer"}
                                </Typography>
                                <Stack
                                  direction="row"
                                  spacing={0.75}
                                  mt={0.75}
                                  flexWrap="wrap"
                                >
                                  <Chip
                                    label={req.urgency || "medium"}
                                    size="small"
                                    sx={{
                                      height: 18,
                                      fontSize: "0.62rem",
                                      fontWeight: 600,
                                      bgcolor:
                                        req.urgency === "critical"
                                          ? "#fef2f2"
                                          : req.urgency === "high"
                                            ? "#fff7ed"
                                            : req.urgency === "medium"
                                              ? "#fefce8"
                                              : "#f0fdf4",
                                      color:
                                        req.urgency === "critical"
                                          ? "#dc2626"
                                          : req.urgency === "high"
                                            ? "#f97316"
                                            : req.urgency === "medium"
                                              ? "#ca8a04"
                                              : "#16a34a",
                                      fontFamily: T.font,
                                    }}
                                  />
                                </Stack>
                              </Box>
                            </Stack>
                            <Stack
                              alignItems="flex-end"
                              spacing={0.5}
                              sx={{ ml: 1, flexShrink: 0 }}
                            >
                              <Chip
                                label={req.status}
                                size="small"
                                icon={sCfg.icon}
                                sx={{
                                  height: 22,
                                  fontSize: "0.65rem",
                                  fontWeight: 600,
                                  bgcolor: sCfg.bg,
                                  color: sCfg.color,
                                  fontFamily: T.font,
                                  "& .MuiChip-icon": { color: sCfg.color },
                                }}
                              />
                              {isSelected && (
                                <Check sx={{ fontSize: 16, color: T.brand }} />
                              )}
                            </Stack>
                          </Stack>
                        </Box>
                      );
                    })}
                  </Stack>

                  {canCreateRequests && (
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1} mt={1.5}>
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<Add sx={{ fontSize: 16 }} />}
                        onClick={() => openAssetForm("child")}
                        sx={{
                          py: 1.15,
                          textTransform: "none",
                          borderRadius: T.r.sm,
                          bgcolor: T.brand,
                          color: "#fff",
                          fontFamily: T.font,
                          fontWeight: 700,
                          "&:hover": { bgcolor: T.brandAccent },
                        }}
                      >
                        Add Child Asset
                      </Button>
                      {/* <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<Add sx={{ fontSize: 16 }} />}
                        onClick={() => openAssetForm("parent")}
                        sx={{
                          py: 1.15,
                          textTransform: "none",
                          borderRadius: T.r.sm,
                          borderColor: alpha(T.brand, 0.28),
                          color: T.brand,
                          bgcolor: T.brandLight,
                          fontFamily: T.font,
                          fontWeight: 700,
                          "&:hover": {
                            borderColor: T.brand,
                            bgcolor: alpha(T.brand, 0.12),
                          },
                        }}
                      >
                        Add Asset
                      </Button> */}
                    </Stack>
                  )}

                  {/* Relationship Type */}
                  {selectedParent && (
                    <Box sx={{ mt: 3 }}>
                      <Divider sx={{ my: 2, borderColor: dialogBorder }} />
                      <Typography
                        sx={{
                          fontSize: "0.67rem",
                          fontWeight: 700,
                          color: dialogMuted,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          mb: 1.5,
                          fontFamily: T.font,
                        }}
                      >
                        Relationship Type
                      </Typography>
                      <Stack direction="row" flexWrap="wrap" gap={1}>
                        {[
                          "accessory",
                          "component",
                          "attachment",
                          "spare",
                          "dependency",
                        ].map((t) => (
                          <Chip
                            key={t}
                            label={t}
                            clickable
                            onClick={() => setRelationshipType(t)}
                            sx={{
                              fontWeight: 600,
                              fontSize: "0.75rem",
                              fontFamily: T.font,
                              textTransform: "capitalize",
                              bgcolor:
                                relationshipType === t ? T.brand : dialogSurfaceAlt,
                              color:
                                relationshipType === t
                                  ? "#fff"
                                  : dialogTextSecondary,
                              border: `1px solid ${relationshipType === t ? T.brand : dialogBorder}`,
                              transition: "all 0.15s",
                              boxShadow:
                                relationshipType === t
                                  ? `0 2px 8px ${T.brandGlow}`
                                  : "none",
                            }}
                          />
                        ))}
                      </Stack>
                    </Box>
                  )}
                </>
              )}
            </>
          )}
        </DialogContent>

        {/* Footer */}
        <Box
          sx={{
            px: { xs: 2, sm: 3 },
            py: { xs: 1.5, sm: 2.5 },
            pb: { xs: "calc(16px + env(safe-area-inset-bottom))", sm: 2.5 },
            borderTop: `1px solid ${dialogBorder}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 1.5,
            bgcolor: dialogSurfaceAlt,
            flexShrink: 0,
          }}
        >
          <Button
            onClick={onClose}
            sx={{
              textTransform: "none",
              borderRadius: T.r.sm,
              color: dialogTextSecondary,
              fontFamily: T.font,
              fontWeight: 600,
              px: 2.5,
              border: `1px solid ${dialogBorder}`,
              bgcolor: dialogSurface,
              "&:hover": { bgcolor: dialogSoft },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleLink}
            disabled={
              linking ||
              (showingChildAssets ? selectedChildAssets.length === 0 : !selectedParent)
            }
            startIcon={
              linking ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <LinkIcon sx={{ fontSize: 16 }} />
              )
            }
            sx={{
              textTransform: "none",
              borderRadius: T.r.sm,
              bgcolor: T.brand,
              color: "#fff",
              fontFamily: T.font,
              fontWeight: 700,
              px: 3,
              boxShadow: `0 2px 8px ${T.brandGlow}`,
              "&:hover": { bgcolor: T.brandAccent },
              "&.Mui-disabled": { opacity: 0.45 },
            }}
          >
            {linking
              ? "Linking..."
              : selectedChildAssets.length > 1
                ? `Link ${selectedChildAssets.length} Assets`
                : "Link Asset"}
          </Button>
        </Box>
      </Dialog>

      {/* Inline Create Request Dialog */}
      <CreateRequestDialog
        open={createRequestOpen}
        onClose={() => setCreateRequestOpen(false)}
        onSuccess={() => {
          setCreateRequestOpen(false);
          loadParentRequests();
        }}
      />

      {/* <AddAssetModal
        open={addParentAssetOpen}
        onClose={() => setAddParentAssetOpen(false)}
        defaultAssetType="parent"
        defaultSerialNumber={assetFormSerial}
        title="Add Asset"
        subtitle="Creates a parent asset request and receives a PA-number after approval"
        onAssetCreated={() => {
          setAddParentAssetOpen(false);
          loadParentRequests();
        }}
      /> */}

      <AddAssetModal
        open={addChildAssetOpen}
        onClose={() => setAddChildAssetOpen(false)}
        defaultAssetType="child"
        defaultParentAssetId={assetId}
        defaultSerialNumber={assetFormSerial}
        title="Add Child Asset"
        subtitle="Uses the same fields and creates a CA-number after approval"
        onAssetCreated={() => {
          setAddChildAssetOpen(false);
          loadParentRequests();
          getAllAssets?.({ limit: 200 });
        }}
      />

      <Portal>
        <Snackbar
          open={!!snackMsg}
          autoHideDuration={5000}
          onClose={() => setSnackMsg("")}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          sx={{ zIndex: (theme) => theme.zIndex.modal + 500 }}
        >
          <Alert
            severity="error"
            onClose={() => setSnackMsg("")}
            sx={{
              borderRadius: T.r.sm,
              fontFamily: T.font,
              fontWeight: 500,
              boxShadow: T.sh.lg,
              maxWidth: { xs: "calc(100vw - 32px)", sm: 520 },
            }}
          >
            {snackMsg}
          </Alert>
        </Snackbar>
      </Portal>
    </>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AssetView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { getAssetById, deleteAsset, loading: assetLoading } = useAsset();
  const { getRequestsByAsset } = useAssetRequest();
  const { user } = useAuth();
  const canViewFinancials = user?.role !== "team";

  const [asset, setAsset] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [activeImage, setActiveImage] = useState(null);
  const [imgError, setImgError] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkedRequests, setLinkedRequests] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [linkedAssetsPage, setLinkedAssetsPage] = useState(1);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const toast = (msg, sev = "success") =>
    setSnackbar({ open: true, message: msg, severity: sev });

  useEffect(() => {
    const routeToast = location.state?.toast;
    if (!routeToast?.message) return;

    toast(routeToast.message, routeToast.severity || "success");
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    if (document.getElementById("fraunces-font-link")) return;
    const link = document.createElement("link");
    link.id = "fraunces-font-link";
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&display=swap";
    document.head.appendChild(link);
  }, []);

  const loadAsset = useCallback(async () => {
    setPageLoading(true);
    try {
      const res = await getAssetById(id);
      if (res && res.success !== false) {
        const data = res.asset || res.data || res;
        setAsset(data);
        const primary =
          data?.assetImages?.find((i) => i.isPrimary) || data?.assetImages?.[0];
        setActiveImage(primary?.name || null);
      } else {
        toast("Asset not found", "error");
        navigate("/admin/assets");
      }
    } catch (e) {
      const status = e?.response?.status;
      if (status === 401) {
        toast("Session expired. Please log in again.", "error");
      } else if (status === 403) {
        toast(e?.response?.data?.message || "You don't have permission to View", "error");
      } else {
        toast(e?.response?.data?.message || "Failed to fetch asset", "error");
      }
      navigate("/admin/assets");
    } finally {
      setPageLoading(false);
    }
  }, [id, getAssetById, navigate]);

  const loadLinkedRequests = useCallback(async () => {
    if (!id) return;
    try {
      const res = await getRequestsByAsset(id);
      if (res && res.success !== false) setLinkedRequests(res.requests || []);
    } catch (e) {
      console.warn(
        "[AssetView] Failed to load linked requests:",
        e?.response?.status,
      );
    }
  }, [id, getRequestsByAsset]);

  useEffect(() => {
    loadAsset();
  }, [loadAsset]);
  useEffect(() => {
    if (asset) loadLinkedRequests();
  }, [asset, loadLinkedRequests]);

  const visibleLinkedRequests = linkedRequests.filter(
    (req) => !isAdminCreatedAssetRequest(req),
  );

  const linkedAssets = linkedRequests.reduce((items, req) => {
    const childAssets = req.metadata?.childAssets || [];
    childAssets.forEach((entry) => {
      const linkedAsset = entry.assetId || entry.asset || entry;
      const linkedAssetId =
        typeof linkedAsset === "string"
          ? linkedAsset
          : linkedAsset?._id || linkedAsset?.id;
      if (!linkedAssetId || items.some((item) => item.id === linkedAssetId)) {
        return;
      }

      items.push({
        id: linkedAssetId,
        asset: linkedAsset,
        relationshipType: entry.relationshipType,
        linkedAt: entry.linkedAt,
        requestId: req._id,
      });
    });
    return items;
  }, []);
  const linkedAssetsPerPage = 6;
  const linkedAssetsPageCount = Math.max(
    1,
    Math.ceil(linkedAssets.length / linkedAssetsPerPage),
  );
  const visibleLinkedAssets = linkedAssets.slice(
    (linkedAssetsPage - 1) * linkedAssetsPerPage,
    linkedAssetsPage * linkedAssetsPerPage,
  );

  useEffect(() => {
    if (linkedAssetsPage > linkedAssetsPageCount) {
      setLinkedAssetsPage(linkedAssetsPageCount);
    }
  }, [linkedAssetsPage, linkedAssetsPageCount]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteAsset(id);
      navigate("/admin/assets", {
        state: {
          toast: {
            message: "Asset deleted successfully",
            severity: "success",
          },
        },
      });
    } catch (e) {
      toast(e?.response?.data?.message || "Failed to delete", "error");
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
    }
  };

  const getImageUrl = (name) =>
    name
      ? `${import.meta.env?.VITE_API_URL?.replace("/api/v1", "") || "https://backend.assetmach.com"}/uploads/assets/${name}`
      : null;

  // ── SKELETON LOADING STATE ────────────────────────────────────────────────
  if (pageLoading) {
    return (
      <Box sx={{ minHeight: "100vh", fontFamily: T.font, overflowX: "hidden" }}>
        {/* Top bar skeleton */}
        <Box
          sx={{
            px: { xs: 2, sm: 3, md: 4 },
            py: { xs: 2, sm: 2.5 },
            borderBottom: `1px solid ${T.border}`,
            bgcolor: T.surface,
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Skeleton
              variant="rounded"
              width={38}
              height={38}
              sx={{ borderRadius: T.r.sm }}
            />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="40%" height={28} />
              <Skeleton variant="text" width="25%" height={18} />
            </Box>
            <Stack direction="row" spacing={1}>
              {[80, 70, 70].map((w, i) => (
                <Skeleton
                  key={i}
                  variant="rounded"
                  width={w}
                  height={32}
                  sx={{ borderRadius: T.r.sm }}
                />
              ))}
            </Stack>
          </Stack>
        </Box>
        {/* Body skeleton — matches new proportions */}
        <Box sx={{ px: { xs: 2, sm: 3, md: 4, xl: 6 }, py: 3, overflowX: "hidden" }}>
          <Grid container spacing={3} sx={{ width: "100%", m: 0 }}>
            {/* FIX #2 applied to skeleton too */}
            <Grid item xs={12} md={3} lg={2.5}>
              <Stack spacing={2.5}>
                {[300, 130, 200].map((h, i) => (
                  <Skeleton
                    key={i}
                    variant="rounded"
                    height={h}
                    sx={{ borderRadius: T.r.lg }}
                  />
                ))}
              </Stack>
            </Grid>
            <Grid item xs={12} md={9} lg={9.5}>
              <Skeleton
                variant="rounded"
                height={520}
                sx={{ borderRadius: T.r.lg }}
              />
            </Grid>
          </Grid>
        </Box>
      </Box>
    );
  }

  if (!asset) return null;

  const statusCfg = STATUS_CFG[asset.status] || {
    bg: "#f1f5f9",
    color: "#475569",
    dot: "#94a3b8",
  };
  const conditionCfg =
    CONDITION_CFG[asset.assetCondition] || CONDITION_CFG.Normal;
  const healthScore = Number.isFinite(Number(asset.healthScore))
    ? Math.max(0, Math.min(100, Number(asset.healthScore)))
    : 0;
  const healthColor =
    healthScore >= 70
      ? "#1A6B3C"
      : healthScore >= 40
        ? "#A0560A"
        : "#A93226";
  const healthBg =
    theme.palette.mode === "dark"
      ? healthScore >= 70
        ? "rgba(16, 185, 129, 0.16)"
        : healthScore >= 40
          ? "rgba(245, 158, 11, 0.16)"
          : "rgba(239, 68, 68, 0.16)"
      : healthScore >= 70
        ? "#E8F5EE"
        : healthScore >= 40
          ? "#FEF3E2"
          : "#FCE8E6";
  const category =
    asset.assetCategoryId?.name || asset.assetCategory || "Uncategorized";
  const isDark = theme.palette.mode === "dark";
  const statusBadgeBg = isDark ? alpha(statusCfg.dot || statusCfg.color || T.brand, 0.16) : statusCfg.bg;
  const statusBadgeColor = isDark ? "#86efac" : statusCfg.color;
  const pageBg = isDark ? "#08111f" : T.bg;
  const surfaceBg = isDark ? "#0f1c2e" : T.surface;
  const surfaceAltBg = isDark ? "#0b1626" : T.surfaceAlt;
  const borderColor = isDark ? "rgba(148, 163, 184, 0.24)" : T.border;
  const overlayBg = isDark ? "rgba(15, 28, 46, 0.9)" : "rgba(255,255,255,0.92)";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: pageBg,
        fontFamily: T.font,
        animation: `${fadeUp} 0.4s ease both`,
        overflowX: "hidden",
        width: "100%",
      }}
    >
      {/* ── TOP BAR ──────────────────────────────────────────────────────── */}
      {/* FIX #5: removed inner maxWidth wrapper — bar now stretches full width */}
      <Box
        sx={{
          bgcolor: surfaceBg,
          borderBottom: `1px solid ${borderColor}`,
          px: { xs: 2, sm: 3, md: 4, xl: 6 },
          py: { xs: 2, sm: 2.5 },
          position: "sticky",
          top: 0,
          width: "100%",
          zIndex: 100,
          boxSizing: "border-box",
          "&::after": {
            content: '""',
            position: "absolute",
            left: 0,
            right: 0,
            bottom: -1,
            height: 2,
            background: T.goldLine,
          },
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
          spacing={{ xs: 1.5, sm: 0 }}
        >
          {/* Left: back + title */}
          <Stack
            direction="row"
            alignItems="center"
            spacing={2}
            sx={{ minWidth: 0, flex: 1, width: { xs: "100%", sm: "auto" } }}
          >
            <IconButton
              onClick={() => navigate("/admin/assets")}
              sx={{
                width: 38,
                height: 38,
                border: `1.5px solid ${borderColor}`,
                borderRadius: T.r.sm,
                flexShrink: 0,
                "&:hover": {
                  bgcolor: T.brand,
                  color: "#fff",
                  borderColor: T.brand,
                },
                transition: "all 0.2s",
              }}
            >
              <ArrowBack sx={{ fontSize: 17 }} />
            </IconButton>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Stack
                direction="row"
                alignItems="center"
                spacing={1.5}
                flexWrap="wrap"
              >
                <Typography
                  sx={{
                    fontSize: { xs: "1.15rem", sm: "1.35rem" },
                    fontWeight: 600,
                    color: T.ink,
                    fontFamily: T.serif,
                    letterSpacing: "-0.01em",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    maxWidth: { xs: "140px", sm: "240px", md: "400px", lg: "600px" },
                  }}
                >
                  {asset.assetName}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.75,
                    px: 1.25,
                    py: 0.4,
                    borderRadius: T.r.xs,
                    bgcolor: statusBadgeBg,
                    border: `1px solid ${isDark ? alpha(statusCfg.dot || statusCfg.color || T.brand, 0.26) : "transparent"}`,
                    flexShrink: 0,
                  }}
                >
                  <Box
                    sx={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      bgcolor: statusCfg.dot,
                      boxShadow: `0 0 6px ${statusCfg.dot}`,
                    }}
                  />
                  <Typography
                    sx={{
                      fontSize: "0.67rem",
                      fontWeight: 700,
                      color: statusBadgeColor,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      fontFamily: T.font,
                    }}
                  >
                    {asset.status}
                  </Typography>
                </Box>
                {asset.isClone && (
                  <Chip
                    icon={<ContentCopy sx={{ fontSize: "11px !important" }} />}
                    label="Clone"
                    size="small"
                    sx={{
                      height: 22,
                      fontSize: "0.65rem",
                      fontWeight: 600,
                      bgcolor: T.violetLight,
                      color: T.violet,
                      fontFamily: T.font,
                    }}
                  />
                )}
                {asset.assetCondition === "Critical" && (
                  <Chip
                    icon={<Warning sx={{ fontSize: "11px !important" }} />}
                    label="Critical"
                    size="small"
                    sx={{
                      height: 22,
                      fontSize: "0.65rem",
                      fontWeight: 600,
                      bgcolor: T.redLight,
                      color: T.red,
                      fontFamily: T.font,
                      "& .MuiChip-icon": { color: T.red },
                    }}
                  />
                )}
              </Stack>
              <Typography
                sx={{
                  fontSize: "0.68rem",
                  color: T.inkMuted,
                  mt: 0.25,
                  fontFamily: T.fontMono,
                }}
              >
                {asset.assetId} · Tag: {asset.tagNumber || "—"}
              </Typography>
            </Box>
          </Stack>

          {/* Right: action buttons */}
          <Stack
            direction="row"
            spacing={1}
            flexWrap="wrap"
            sx={{
              flexShrink: 0,
              width: { xs: "100%", sm: "auto" },
              "& .MuiButton-root": {
                flex: { xs: "1 1 0", sm: "0 0 auto" },
                minWidth: { xs: 0, sm: "auto" },
                px: { xs: 1, sm: 2 },
                whiteSpace: "nowrap",
              },
            }}
          >
            {(user?.role === "admin" || user?.role === "team") && (
              <Button
                onClick={() => setLinkOpen(true)}
                variant="outlined"
                size="small"
                startIcon={<AddLink sx={{ fontSize: 15 }} />}
                sx={{
                  textTransform: "none",
                  borderRadius: T.r.sm,
                  border: `1.5px solid ${T.brand}`,
                  color: T.brand,
                  fontFamily: T.font,
                  fontWeight: 700,
                  fontSize: "0.78rem",
                  px: 2,
                  "&:hover": { bgcolor: T.brandLight },
                }}
              >
                Link Asset
              </Button>
            )}
            <Button
              onClick={() =>
                navigate(`/admin/assets/edit/${id}`, {
                  state: {
                    from: `${location.pathname}${location.search}${location.hash}`,
                  },
                })
              }
              variant="outlined"
              size="small"
              startIcon={<Edit sx={{ fontSize: 15 }} />}
              sx={{
                textTransform: "none",
                borderRadius: T.r.sm,
                border: `1.5px solid ${T.border}`,
                color: T.inkSecondary,
                fontFamily: T.font,
                fontWeight: 600,
                fontSize: "0.78rem",
                px: 2,
                "&:hover": { bgcolor: T.surfaceAlt },
              }}
            >
              Edit
            </Button>
            <Button
              onClick={() => setDeleteOpen(true)}
              variant="outlined"
              size="small"
              startIcon={<Delete sx={{ fontSize: 15 }} />}
              sx={{
                textTransform: "none",
                borderRadius: T.r.sm,
                border: `1.5px solid ${alpha(T.red, 0.4)}`,
                color: T.red,
                fontFamily: T.font,
                fontWeight: 600,
                fontSize: "0.78rem",
                px: 2,
                "&:hover": { bgcolor: T.redLight, borderColor: T.red },
              }}
            >
              Delete
            </Button>
          </Stack>
        </Stack>
      </Box>

      {/* ── BODY ─────────────────────────────────────────────────────────── */}
      {/* FIX #1: removed maxWidth constraint — content now fills full available width */}
      <Box
        sx={{
          px: { xs: 1.5, sm: 3, md: 4, xl: 6 },
          py: { xs: 1.5, sm: 3 },
          overflowX: "hidden",
          boxSizing: "border-box",
          width: "100%",
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "minmax(260px, 320px) minmax(0, 1fr)",
              xl: "minmax(300px, 360px) minmax(0, 1fr)",
            },
            gap: { xs: 2, sm: 3 },
            width: "100%",
            alignItems: "start",
          }}
        >

          {/* ── LEFT SIDEBAR ─────────────────────────────────────────────── */}
          {/* FIX #2: narrowed sidebar from md={4} lg={3} → md={3} lg={2.5} */}
          <Box sx={{ width: "100%", minWidth: 0 }}>
            <Stack
              spacing={{ xs: 0, md: 2.5 }}
              sx={{
                width: "100%",
                display: { xs: "grid", md: "flex" },
                gridTemplateColumns: {
                  xs: "repeat(2, minmax(0, 1fr))",
                  sm: "repeat(3, minmax(0, 1fr))",
                  md: "1fr",
                },
                gap: { xs: 1.5, sm: 2, md: 0 },
                "& > .MuiPaper-root": { width: "100%", minWidth: 0 },
              }}
            >

              {/* Image Panel */}
              <Card
                elevation={0}
                sx={{
                  animation: `${slideIn} 0.4s 0.05s ease both`,
                  gridColumn: { xs: "1 / -1", sm: "auto", md: "auto" },
                }}
              >
                {/* FIX #7: taller image on large screens */}
                <Box
                  sx={{
                    height: { xs: 210, sm: 170, md: 220, lg: 260 },
                    bgcolor: surfaceAltBg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {activeImage && !imgError ? (
                    <Box
                      component="img"
                      src={getImageUrl(activeImage)}
                      alt={asset.assetName}
                      onError={() => setImgError(true)}
                      sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <Box sx={{ textAlign: "center" }}>
                      <Avatar
                        sx={{
                          width: 76,
                          height: 76,
                          bgcolor: T.brand,
                          fontSize: "1.9rem",
                          mx: "auto",
                          mb: 1,
                          boxShadow: `0 4px 16px ${T.brandGlow}`,
                        }}
                      >
                        {asset.assetName?.charAt(0)?.toUpperCase() || "A"}
                      </Avatar>
                    </Box>
                  )}
                  <Box
                    sx={{
                      position: "absolute",
                      top: 12,
                      left: 12,
                      px: 1.25,
                      py: 0.4,
                      borderRadius: T.r.xs,
                      bgcolor: overlayBg,
                      backdropFilter: "blur(4px)",
                      border: `1px solid ${borderColor}`,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "0.62rem",
                        fontWeight: 700,
                        color: T.brand,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        fontFamily: T.font,
                      }}
                    >
                      {category}
                    </Typography>
                  </Box>
                </Box>
                {asset.assetImages?.length > 0 && (
                  <Box
                    sx={{
                      display: "flex",
                      gap: 1,
                      p: 1.5,
                      borderTop: `1px solid ${T.border}`,
                      overflowX: "auto",
                    }}
                  >
                    {asset.assetImages.map((img, i) => (
                      <Box
                        key={i}
                        onClick={() => {
                          setActiveImage(img.name);
                          setImgError(false);
                        }}
                        sx={{
                          width: 50,
                          height: 44,
                          flexShrink: 0,
                          borderRadius: T.r.xs,
                          overflow: "hidden",
                          border: `2px solid ${activeImage === img.name ? T.brand : "transparent"}`,
                          cursor: "pointer",
                          transition: "all 0.15s",
                          "&:hover": { transform: "scale(1.06)" },
                        }}
                      >
                        <Box
                          component="img"
                          src={getImageUrl(img.name)}
                          sx={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      </Box>
                    ))}
                  </Box>
                )}
              </Card>

              {/* Health Score */}
              <Card
                elevation={0}
                sx={{
                  p: { xs: 1.5, sm: 2, md: 2.5 },
                  animation: `${slideIn} 0.4s 0.1s ease both`,
                }}
              >
                <SectionTitle icon={<Sensors sx={{ fontSize: 15 }} />}>
                  Health Score
                </SectionTitle>
                <Stack
                  direction="row"
                  alignItems="flex-end"
                  spacing={1}
                  mb={1.5}
                >
                  <Typography
                    sx={{
                      fontSize: { xs: "2rem", sm: "2.25rem", md: "2.75rem" },
                      fontWeight: 800,
                      color: healthColor,
                      fontFamily: T.font,
                      lineHeight: 1,
                      letterSpacing: "-0.03em",
                    }}
                  >
                    {healthScore}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "0.875rem",
                      color: T.inkMuted,
                      fontFamily: T.font,
                      mb: 0.75,
                      fontWeight: 500,
                    }}
                  >
                    /100
                  </Typography>
                  <Box
                    sx={{
                      ml: "auto !important",
                      px: 1.25,
                      py: 0.35,
                      borderRadius: T.r.xs,
                      bgcolor: healthBg,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "0.65rem",
                        fontWeight: 800,
                        color: healthColor,
                        fontFamily: T.font,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                      }}
                    >
                      {healthScore >= 70
                        ? "Good"
                        : healthScore >= 40
                          ? "Fair"
                          : "Critical"}
                    </Typography>
                  </Box>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={healthScore}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: alpha(healthColor, 0.1),
                    "& .MuiLinearProgress-bar": {
                      bgcolor: healthColor,
                      borderRadius: 4,
                      boxShadow: `0 0 10px ${alpha(healthColor, 0.45)}`,
                    },
                  }}
                />
                <Stack direction="row" justifyContent="space-between" mt={0.75}>
                  {["0", "25", "50", "75", "100"].map((v) => (
                    <Typography
                      key={v}
                      sx={{
                        fontSize: "0.6rem",
                        color: T.inkMuted,
                        fontFamily: T.font,
                      }}
                    >
                      {v}
                    </Typography>
                  ))}
                </Stack>
              </Card>

              {/* Quick Info */}
              <Card
                elevation={0}
                sx={{
                  p: { xs: 1.5, sm: 2, md: 2.5 },
                  animation: `${slideIn} 0.4s 0.15s ease both`,
                }}
              >
                <SectionTitle icon={<Numbers sx={{ fontSize: 15 }} />}>
                  Quick Info
                </SectionTitle>
                <Stack spacing={0}>
                  {[
                    {
                      label: "Condition",
                      value: asset.assetCondition,
                      badge: conditionCfg,
                    },
                    { label: "Type", value: asset.type || "Equipment" },
                    { label: "Manufacturer", value: asset.manufacturer },
                    { label: "Model", value: asset.model },
                    {
                      label: "Clone Version",
                      value: asset.isClone ? `v${asset.cloneVersion}` : null,
                    },
                    {
                      label: "Clone Allowed",
                      value:
                        asset.canBeCloned !== undefined
                          ? asset.canBeCloned
                            ? "Yes"
                            : "No"
                          : null,
                    },
                  ]
                    .filter((f) => f.value)
                    .map(({ label, value, badge }) => (
                      <Stack
                        key={label}
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        sx={{
                          py: 1,
                          borderBottom: `1px solid ${T.border}`,
                          "&:last-child": { borderBottom: "none" },
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: "0.75rem",
                            color: T.inkMuted,
                            fontFamily: T.font,
                          }}
                        >
                          {label}
                        </Typography>
                        {badge ? (
                          <Chip
                            label={value}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: "0.65rem",
                              fontWeight: 600,
                              bgcolor: badge.bg,
                              color: badge.color,
                              fontFamily: T.font,
                            }}
                          />
                        ) : (
                          <Typography
                            sx={{
                              fontSize: "0.8rem",
                              fontWeight: 600,
                              color: T.ink,
                              fontFamily: T.font,
                              textAlign: "right",
                              maxWidth: "55%",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {value}
                          </Typography>
                        )}
                      </Stack>
                    ))}
                </Stack>
              </Card>

              {/* Tags */}
              {asset.metadata?.tags?.length > 0 && (
                <Card
                  elevation={0}
                  sx={{ p: 2.5, animation: `${slideIn} 0.4s 0.2s ease both` }}
                >
                  <SectionTitle icon={<LocalOffer sx={{ fontSize: 15 }} />}>
                    Tags
                  </SectionTitle>
                  <Stack direction="row" flexWrap="wrap" gap={0.75}>
                    {asset.metadata.tags.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        size="small"
                        sx={{
                          height: 24,
                          fontSize: "0.72rem",
                          fontWeight: 500,
                          bgcolor: T.brandLight,
                          color: T.brand,
                          border: `1px solid ${alpha(T.brand, 0.2)}`,
                          fontFamily: T.font,
                        }}
                      />
                    ))}
                  </Stack>
                </Card>
              )}
            </Stack>
          </Box>

          {/* ── MAIN CONTENT ─────────────────────────────────────────────── */}
          {/* FIX #2: widened main from md={8} lg={9} → md={9} lg={9.5} */}
          <Box sx={{ minWidth: 0, width: "100%" }}>
            <Stack spacing={2.5}>
              <Box
                sx={{
                  bgcolor: surfaceBg,
                  borderRadius: T.r.lg,
                  border: `1px solid ${borderColor}`,
                  overflow: "hidden",
                  boxShadow: isDark ? "none" : T.sh.sm,
                }}
              >
                <Tabs
                  value={activeTab}
                  onChange={(_, v) => setActiveTab(v)}
                  variant="scrollable"
                  scrollButtons="auto"
                  allowScrollButtonsMobile
                  sx={{
                    px: 2,
                    borderBottom: `1px solid ${borderColor}`,
                    minHeight: 50,
                    bgcolor: surfaceAltBg,
                    "& .MuiTab-root": {
                      textTransform: "none",
                      fontFamily: T.font,
                      fontWeight: 600,
                      fontSize: "0.85rem",
                      minHeight: 50,
                      color: isDark ? "#94a3b8" : T.inkMuted,
                      "&.Mui-selected": { color: T.brand },
                    },
                    "& .MuiTabs-indicator": {
                      bgcolor: T.brand,
                      height: 2.5,
                      borderRadius: "2px 2px 0 0",
                    },
                  }}
                >
                  <Tab label="Overview" />
                  <Tab label="Specialist Data" />
                  <Tab
                    label={
                      <Stack direction="row" alignItems="center" spacing={0.75}>
                        <span>Requests</span>
                        <Chip
                          label={visibleLinkedRequests.length}
                          size="small"
                          sx={{
                            height: 18,
                            fontSize: "0.6rem",
                            fontWeight: 700,
                            bgcolor: visibleLinkedRequests.length ? T.brand : T.border,
                            color: visibleLinkedRequests.length ? "#fff" : T.inkMuted,
                            minWidth: 22,
                          }}
                        />
                      </Stack>
                    }
                  />
                  <Tab
                    label={
                      <Stack direction="row" alignItems="center" spacing={0.75}>
                        <span>Linked Assets</span>
                        <Chip
                          label={linkedAssets.length}
                          size="small"
                          sx={{
                            height: 18,
                            fontSize: "0.6rem",
                            fontWeight: 700,
                            bgcolor: linkedAssets.length ? T.brand : T.border,
                            color: linkedAssets.length ? "#fff" : T.inkMuted,
                            minWidth: 22,
                          }}
                        />
                      </Stack>
                    }
                  />
                  <Tab label="History" />
                </Tabs>

                {/* ── TAB 0: OVERVIEW ──────────────────────────────────── */}
                {activeTab === 0 && (
                  <Box sx={{ p: { xs: 2, sm: 3 } }}>
                    {/* FIX #3: 3-column grid on large screens fills the wider panel */}
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: {
                          xs: "1fr",
                          sm: "1fr 1fr",
                          lg: "1fr 1fr 1fr",
                        },
                        gap: 2.5,
                      }}
                    >
                      <Field
                        icon={<Category />}
                        label="Category"
                        value={category}
                      />
                      <Field
                        icon={<LocationOn />}
                        label="Current Location"
                        value={asset.currentLocation}
                      />
                      <Field
                        icon={<Person />}
                        label="Primary User"
                        value={getUserName(asset.assignedUsers?.primaryUser)}
                      />
                      <Field
                        icon={<Person />}
                        label="Secondary User"
                        value={getUserName(asset.assignedUsers?.secondaryUser)}
                      />
                      <Field
                        icon={<VerifiedUser />}
                        label="Custodian"
                        value={getUserName(asset.assignedUsers?.custodian)}
                      />
                      <Field
                        icon={<CalendarToday />}
                        label="Commissioning Date"
                        value={
                          asset.commissioningDate
                            ? new Date(
                              asset.commissioningDate,
                            ).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                            : null
                        }
                      />
                      {canViewFinancials && (
                        <Field
                          icon={<AttachMoney />}
                          label="Purchase Cost"
                          value={
                            asset.purchaseCost
                              ? `₹${asset.purchaseCost.toLocaleString("en-IN")}`
                              : null
                          }
                          color={T.brand}
                        />
                      )}
                      <Field
                        icon={<Shield />}
                        label="Warranty Expiry"
                        value={
                          asset.warrantyExpiry
                            ? new Date(asset.warrantyExpiry).toLocaleDateString(
                              "en-IN",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              },
                            )
                            : null
                        }
                        color={
                          asset.warrantyLeaseExpiryWarning?.expired
                            ? T.red
                            : T.ink
                        }
                        badge={
                          asset.warrantyLeaseExpiryWarning?.expired
                            ? { bg: T.redLight, color: T.red }
                            : asset.warrantyLeaseExpiryWarning?.lessThan90Days
                              ? { bg: T.amberLight, color: T.amber }
                              : null
                        }
                      />
                      {/* FIX #4: "1 / -1" spans ALL columns whether 2 or 3 */}
                      <Field
                        icon={<Description />}
                        label="Description"
                        value={asset.description}
                        fullWidth
                      />
                      {asset.metadata?.notes && (
                        <Field
                          label="Notes"
                          value={asset.metadata.notes}
                          fullWidth
                        />
                      )}
                    </Box>

                    {/* Physical Address */}
                    {asset.customPhysicalAddress &&
                      Object.values(asset.customPhysicalAddress).some(
                        Boolean,
                      ) && (
                        <>
                          <Divider sx={{ my: 3, borderColor: T.border }} />
                          <SectionTitle icon={<Home sx={{ fontSize: 15 }} />}>
                            Physical Address
                          </SectionTitle>
                          <Stack spacing={1}>
                            {asset.customPhysicalAddress.streetAddress && (
                              <Stack
                                direction="row"
                                spacing={1.25}
                                alignItems="flex-start"
                              >
                                <Home
                                  sx={{
                                    fontSize: 14,
                                    color: T.inkMuted,
                                    mt: 0.25,
                                    flexShrink: 0,
                                  }}
                                />
                                <Typography
                                  sx={{
                                    fontSize: "0.875rem",
                                    color: T.ink,
                                    fontFamily: T.font,
                                    fontWeight: 500,
                                  }}
                                >
                                  {asset.customPhysicalAddress.streetAddress}
                                </Typography>
                              </Stack>
                            )}
                            {(asset.customPhysicalAddress.city ||
                              asset.customPhysicalAddress.stateProvince) && (
                                <Stack
                                  direction="row"
                                  spacing={1.25}
                                  alignItems="center"
                                >
                                  <PinDrop
                                    sx={{
                                      fontSize: 14,
                                      color: T.inkMuted,
                                      flexShrink: 0,
                                    }}
                                  />
                                  <Typography
                                    sx={{
                                      fontSize: "0.875rem",
                                      color: T.ink,
                                      fontFamily: T.font,
                                      fontWeight: 500,
                                    }}
                                  >
                                    {[
                                      asset.customPhysicalAddress.city,
                                      asset.customPhysicalAddress.stateProvince,
                                    ]
                                      .filter(Boolean)
                                      .join(", ")}
                                  </Typography>
                                </Stack>
                              )}
                            {(asset.customPhysicalAddress.postalCode ||
                              asset.customPhysicalAddress.country) && (
                                <Typography
                                  sx={{
                                    fontSize: "0.875rem",
                                    color: T.inkSecondary,
                                    fontFamily: T.font,
                                    ml: "26px",
                                  }}
                                >
                                  {[
                                    asset.customPhysicalAddress.postalCode,
                                    asset.customPhysicalAddress.country,
                                  ]
                                    .filter(Boolean)
                                    .join(" ")}
                                </Typography>
                              )}
                          </Stack>
                        </>
                      )}

                    {/* User Assignment */}
                    <Divider sx={{ my: 3, borderColor }} />
                    <SectionTitle icon={<Person sx={{ fontSize: 15 }} />}>
                      User Assignment
                    </SectionTitle>
                    <Grid container spacing={2} sx={{ width: "100%", m: 0 }}>
                      {[
                        {
                          role: "Primary User",
                          user: asset.assignedUsers?.primaryUser,
                          color: T.brand,
                        },
                        {
                          role: "Secondary User",
                          user: asset.assignedUsers?.secondaryUser,
                          color: T.teal,
                        },
                        {
                          role: "Custodian",
                          user: asset.assignedUsers?.custodian,
                          color: T.amber,
                        },
                      ].map(({ role, user, color }) => (
                        <Grid item xs={12} sm={4} key={role}>
                          <Box
                            sx={{
                              p: 2,
                              borderRadius: T.r.md,
                              border: `1px solid ${borderColor}`,
                              bgcolor: surfaceAltBg,
                              height: "100%",
                            }}
                          >
                            <Typography
                              sx={{
                                fontSize: "0.62rem",
                                fontWeight: 700,
                                color: isDark ? "#94a3b8" : T.inkMuted,
                                textTransform: "uppercase",
                                letterSpacing: "0.06em",
                                mb: 1.25,
                                fontFamily: T.font,
                              }}
                            >
                              {role}
                            </Typography>
                            {user ? (
                              <Stack
                                direction="row"
                                alignItems="center"
                                spacing={1}
                              >
                                <Avatar
                                  sx={{
                                    width: 32,
                                    height: 32,
                                    bgcolor: alpha(color, 0.14),
                                    fontSize: "0.8rem",
                                    color,
                                    fontFamily: T.font,
                                    fontWeight: 700,
                                  }}
                                >
                                  {(getUserName(user) || "?")
                                    .charAt(0)
                                    .toUpperCase()}
                                </Avatar>
                                <Box sx={{ minWidth: 0 }}>
                                  <Typography
                                    sx={{
                                      fontSize: "0.8rem",
                                      fontWeight: 600,
                                      color: isDark ? "#f8fafc" : T.ink,
                                      fontFamily: T.font,
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {getUserName(user)}
                                  </Typography>
                                  {typeof user === "object" && user.email && (
                                    <Typography
                                      sx={{
                                        fontSize: "0.68rem",
                                        color: isDark ? "#94a3b8" : T.inkMuted,
                                        fontFamily: T.font,
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                      }}
                                    >
                                      {user.email}
                                    </Typography>
                                  )}
                                </Box>
                              </Stack>
                            ) : (
                              <Typography
                                sx={{
                                  fontSize: "0.8rem",
                                  color: isDark ? "#94a3b8" : T.inkMuted,
                                  fontFamily: T.font,
                                }}
                              >
                                Unassigned
                              </Typography>
                            )}
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}

                {/* ── TAB 1: SPECIALIST DATA ───────────────────────────── */}
                {activeTab === 1 && (
                  <Box sx={{ p: { xs: 2, sm: 3 } }}>
                    <Grid container spacing={2.5} sx={{ width: "100%", m: 0 }}>
                      <Grid item xs={12}>
                        <Typography
                          sx={{ color: T.inkMuted, textAlign: "center", py: 4 }}
                        >
                          Specialist data section
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                )}

                {/* ── TAB 2: REQUESTS ──────────────────────────────────── */}
                {activeTab === 2 && (
                  <Box sx={{ p: { xs: 2, sm: 3 } }}>
                    {visibleLinkedRequests.length === 0 ? (
                      <Box sx={{ py: 7, textAlign: "center" }}>
                        <Box
                          sx={{
                            width: 64,
                            height: 64,
                            borderRadius: "50%",
                            bgcolor: surfaceAltBg,
                            border: `1px solid ${borderColor}`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            mx: "auto",
                            mb: 2,
                          }}
                        >
                          <AccountTree
                            sx={{ fontSize: 30, color: isDark ? "#94a3b8" : T.inkMuted }}
                          />
                        </Box>
                        <Typography
                          sx={{
                            fontSize: "1rem",
                            fontWeight: 700,
                            color: isDark ? "#f8fafc" : T.ink,
                            fontFamily: T.font,
                            mb: 0.75,
                          }}
                        >
                          No linked requests
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: "0.85rem",
                            color: isDark ? "#94a3b8" : T.inkMuted,
                            fontFamily: T.font,
                            mb: 2.5,
                          }}
                        >
                          Link this asset to a parent request to start tracking
                          relationships.
                        </Typography>
                        {user?.role === "admin" && (
                          <Button
                            onClick={() => setLinkOpen(true)}
                            variant="contained"
                            startIcon={<AddLink />}
                            sx={{
                              textTransform: "none",
                              borderRadius: T.r.sm,
                              bgcolor: T.brand,
                              fontFamily: T.font,
                              fontWeight: 700,
                              px: 3,
                              boxShadow: `0 2px 8px ${T.brandGlow}`,
                              "&:hover": { bgcolor: T.brandAccent },
                            }}
                          >
                            Link Asset
                          </Button>
                        )}
                      </Box>
                    ) : (
                      <Stack spacing={2}>
                        {visibleLinkedRequests.map((req) => {
                          const cfg = REQ_STATUS_CFG[req.status] || {};
                          return (
                            <Box
                              key={req._id}
                              sx={{
                                p: 2.5,
                                borderRadius: T.r.md,
                                border: `1px solid ${borderColor}`,
                                bgcolor: surfaceAltBg,
                              }}
                            >
                              <Stack
                                direction="row"
                                alignItems="flex-start"
                                justifyContent="space-between"
                                mb={2}
                                flexWrap="wrap"
                                gap={1}
                              >
                                <Stack
                                  direction="row"
                                  alignItems="center"
                                  spacing={1.5}
                                  sx={{ minWidth: 0 }}
                                >
                                  <Box
                                    sx={{
                                      width: 38,
                                      height: 38,
                                      borderRadius: T.r.sm,
                                      bgcolor: isDark ? "rgba(45, 74, 62, 0.26)" : T.brandLight,
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      flexShrink: 0,
                                    }}
                                  >
                                    <AccountTree
                                      sx={{ fontSize: 18, color: T.brand }}
                                    />
                                  </Box>
                                  <Box sx={{ minWidth: 0 }}>
                                    <Typography
                                      sx={{
                                        fontSize: "0.875rem",
                                        fontWeight: 700,
                                        color: isDark ? "#f8fafc" : T.ink,
                                        fontFamily: T.font,
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                      }}
                                    >
                                      {req.assetId?.assetName ||
                                        asset?.assetName ||
                                        "Unnamed Asset"}
                                    </Typography>
                                    <Typography
                                      sx={{
                                        fontSize: "0.7rem",
                                        color: isDark ? "#94a3b8" : T.inkMuted,
                                        fontFamily: T.fontMono,
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                      }}
                                    >
                                      {req.assetId?.assetId ||
                                        asset?.assetId ||
                                        req._id?.slice(-8)}{" "}
                                      · {req.requestType || req.type || "—"}
                                    </Typography>
                                  </Box>
                                </Stack>
                                <Chip
                                  label={req.status}
                                  size="small"
                                  icon={cfg.icon}
                                  sx={{
                                    height: 24,
                                    fontSize: "0.68rem",
                                    fontWeight: 600,
                                    bgcolor: cfg.bg,
                                    color: cfg.color,
                                    fontFamily: T.font,
                                    flexShrink: 0,
                                    "& .MuiChip-icon": { color: cfg.color },
                                  }}
                                />
                              </Stack>
                              <Box
                                sx={{
                                  display: "grid",
                                  gridTemplateColumns: {
                                    xs: "repeat(2, 1fr)",
                                    sm: "repeat(3, 1fr)",
                                    md: "repeat(4, 1fr)",
                                  },
                                  gap: 1.5,
                                }}
                              >
                                {[
                                  {
                                    label: "Urgency",
                                    content: (
                                      <Chip
                                        label={req.urgency}
                                        size="small"
                                        sx={{
                                          height: 20,
                                          fontSize: "0.65rem",
                                          fontWeight: 600,
                                          bgcolor:
                                            req.urgency === "critical"
                                              ? "#fef2f2"
                                              : req.urgency === "high"
                                                ? "#fff7ed"
                                                : req.urgency === "medium"
                                                  ? "#fefce8"
                                                  : "#f0fdf4",
                                          color:
                                            req.urgency === "critical"
                                              ? "#dc2626"
                                              : req.urgency === "high"
                                                ? "#f97316"
                                                : req.urgency === "medium"
                                                  ? "#ca8a04"
                                                  : "#16a34a",
                                          fontFamily: T.font,
                                        }}
                                      />
                                    ),
                                  },
                                  {
                                    label: "Children",
                                    content: (
                                      <Typography
                                        sx={{
                                          fontSize: "0.8rem",
                                          fontWeight: 600,
                                          color: isDark ? "#f8fafc" : T.ink,
                                          fontFamily: T.font,
                                        }}
                                      >
                                        {req.childRequests?.length || 0}
                                      </Typography>
                                    ),
                                  },
                                  {
                                    label: "Created",
                                    content: (
                                      <Typography
                                        sx={{
                                          fontSize: "0.8rem",
                                          fontWeight: 500,
                                          color: isDark ? "#f8fafc" : T.ink,
                                          fontFamily: T.font,
                                        }}
                                      >
                                        {req.createdAt
                                          ? new Date(
                                            req.createdAt,
                                          ).toLocaleDateString("en-IN", {
                                            day: "2-digit",
                                            month: "short",
                                            year: "numeric",
                                          })
                                          : "—"}
                                      </Typography>
                                    ),
                                  },
                                  {
                                    label: "Type",
                                    content: (
                                      <Typography
                                        sx={{
                                          fontSize: "0.8rem",
                                          fontWeight: 500,
                                          color: isDark ? "#f8fafc" : T.ink,
                                          fontFamily: T.font,
                                          textTransform: "capitalize",
                                        }}
                                      >
                                        {req.requestType || req.type || "—"}
                                      </Typography>
                                    ),
                                  },
                                ].map(({ label, content }) => (
                                  <Box key={label}>
                                    <Typography
                                      sx={{
                                        fontSize: "0.62rem",
                                        color: isDark ? "#94a3b8" : T.inkMuted,
                                        fontFamily: T.font,
                                        textTransform: "uppercase",
                                        letterSpacing: "0.06em",
                                        mb: 0.5,
                                        fontWeight: 700,
                                      }}
                                    >
                                      {label}
                                    </Typography>
                                    {content}
                                  </Box>
                                ))}
                              </Box>
                              {req.description && (
                                <Box
                                  sx={{
                                    mt: 1.5,
                                    p: 1.25,
                                    borderRadius: T.r.xs,
                                    bgcolor: surfaceBg,
                                    border: `1px solid ${borderColor}`,
                                  }}
                                >
                                  <Typography
                                    sx={{
                                      fontSize: "0.78rem",
                                      color: isDark ? "#cbd5e1" : T.inkSecondary,
                                      fontFamily: T.font,
                                    }}
                                  >
                                    {req.description}
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          );
                        })}
                      </Stack>
                    )}
                  </Box>
                )}

                {/* ── TAB 3: HISTORY ───────────────────────────────────── */}
                {activeTab === 3 && (
                  <Box sx={{ p: { xs: 2, sm: 3 } }}>
                    {linkedAssets.length === 0 ? (
                      <Box sx={{ py: 7, textAlign: "center" }}>
                        <Box
                          sx={{
                            width: 64,
                            height: 64,
                            borderRadius: "50%",
                            bgcolor: surfaceAltBg,
                            border: `1px solid ${borderColor}`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            mx: "auto",
                            mb: 2,
                          }}
                        >
                          <LinkIcon sx={{ fontSize: 30, color: isDark ? "#94a3b8" : T.inkMuted }} />
                        </Box>
                        <Typography
                          sx={{
                            fontSize: "1rem",
                            fontWeight: 700,
                            color: isDark ? "#f8fafc" : T.ink,
                            fontFamily: T.font,
                            mb: 0.75,
                          }}
                        >
                          No linked assets
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: "0.85rem",
                            color: isDark ? "#94a3b8" : T.inkMuted,
                            fontFamily: T.font,
                            mb: 2.5,
                          }}
                        >
                          Link a child asset to see it here.
                        </Typography>
                        {(user?.role === "admin" || user?.role === "team") && (
                          <Button
                            onClick={() => setLinkOpen(true)}
                            variant="contained"
                            startIcon={<AddLink />}
                            sx={{
                              textTransform: "none",
                              borderRadius: T.r.sm,
                              bgcolor: T.brand,
                              fontFamily: T.font,
                              fontWeight: 700,
                              px: 3,
                              boxShadow: `0 2px 8px ${T.brandGlow}`,
                              "&:hover": { bgcolor: T.brandAccent },
                            }}
                          >
                            Link Asset
                          </Button>
                        )}
                      </Box>
                    ) : (
                      <>
                        <Box
                          sx={{
                            display: "grid",
                            gridTemplateColumns: {
                              xs: "1fr",
                              md: "repeat(2, minmax(0, 1fr))",
                            },
                            gap: 2,
                          }}
                        >
                          {visibleLinkedAssets.map(
                            ({ id, asset: linkedAsset, relationshipType, linkedAt }) => {
                              const assetName =
                                linkedAsset?.assetName ||
                                linkedAsset?.name ||
                                "Unnamed Child Asset";
                              const assetCode =
                                linkedAsset?.assetId || id?.slice(-10) || "Not set";
                              const serial = linkedAsset?.serialNumber || "Not set";
                              const status = linkedAsset?.status || "Active";
                              const statusCfg =
                                STATUS_CFG[status] || STATUS_CFG.Active || {};

                              return (
                                <Box
                                  key={id}
                                  sx={{
                                    p: 2.5,
                                    borderRadius: T.r.md,
                                    border: `1px solid ${borderColor}`,
                                    bgcolor: surfaceAltBg,
                                  }}
                                >
                                  <Stack
                                    direction="row"
                                    alignItems="flex-start"
                                    justifyContent="space-between"
                                    spacing={1.5}
                                  >
                                    <Stack
                                      direction="row"
                                      alignItems="center"
                                      spacing={1.5}
                                      sx={{ minWidth: 0 }}
                                    >
                                      <Box
                                        sx={{
                                          width: 40,
                                          height: 40,
                                          borderRadius: T.r.sm,
                                          bgcolor: isDark ? "rgba(45, 74, 62, 0.26)" : T.brandLight,
                                          color: T.brand,
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          flexShrink: 0,
                                        }}
                                      >
                                        <Inventory2 sx={{ fontSize: 18 }} />
                                      </Box>
                                      <Box sx={{ minWidth: 0 }}>
                                        <Typography
                                          sx={{
                                            fontSize: "0.95rem",
                                            fontWeight: 700,
                                            color: isDark ? "#f8fafc" : T.ink,
                                            fontFamily: T.font,
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                          }}
                                        >
                                          {assetName}
                                        </Typography>
                                        <Typography
                                          sx={{
                                            fontSize: "0.72rem",
                                            color: isDark ? "#94a3b8" : T.inkMuted,
                                            fontFamily: T.fontMono,
                                          }}
                                        >
                                          {assetCode} · Serial: {serial}
                                        </Typography>
                                      </Box>
                                    </Stack>
                                    <Chip
                                      label={status}
                                      size="small"
                                      sx={{
                                        height: 24,
                                        fontSize: "0.68rem",
                                        fontWeight: 700,
                                        bgcolor: statusCfg.bg || T.brandLight,
                                        color: statusCfg.color || T.brand,
                                        fontFamily: T.font,
                                        flexShrink: 0,
                                      }}
                                    />
                                  </Stack>
                                  <Stack
                                    direction="row"
                                    spacing={1}
                                    alignItems="center"
                                    flexWrap="wrap"
                                    sx={{ mt: 2 }}
                                  >
                                    {relationshipType && (
                                      <Chip
                                        label={relationshipType}
                                        size="small"
                                        sx={{
                                          height: 22,
                                          fontSize: "0.66rem",
                                          fontWeight: 700,
                                          bgcolor: T.brandLight,
                                          color: T.brand,
                                          fontFamily: T.font,
                                          textTransform: "capitalize",
                                        }}
                                      />
                                    )}
                                    {linkedAt && (
                                      <Typography
                                        sx={{
                                          fontSize: "0.72rem",
                                          color: isDark ? "#94a3b8" : T.inkMuted,
                                          fontFamily: T.font,
                                        }}
                                      >
                                        Linked{" "}
                                        {new Date(linkedAt).toLocaleDateString(
                                          "en-IN",
                                          {
                                            day: "2-digit",
                                            month: "short",
                                            year: "numeric",
                                          },
                                        )}
                                      </Typography>
                                    )}
                                  </Stack>
                                  <Button
                                    fullWidth
                                    onClick={() => navigate(`/admin/assets/view/${id}`)}
                                    sx={{
                                      mt: 2,
                                      textTransform: "none",
                                      borderRadius: T.r.sm,
                                      border: `1px solid ${borderColor}`,
                                      color: isDark ? "#f8fafc" : T.ink,
                                      fontFamily: T.font,
                                      fontWeight: 700,
                                      bgcolor: surfaceBg,
                                      "&:hover": { bgcolor: surfaceAltBg },
                                    }}
                                  >
                                    View Asset
                                  </Button>
                                </Box>
                              );
                            },
                          )}
                        </Box>
                        {linkedAssetsPageCount > 1 && (
                          <Stack alignItems="center" sx={{ mt: 2.5 }}>
                            <Pagination
                              count={linkedAssetsPageCount}
                              page={linkedAssetsPage}
                              onChange={(_, page) => setLinkedAssetsPage(page)}
                              color="primary"
                              shape="rounded"
                              sx={{
                                "& .MuiPaginationItem-root": {
                                  fontFamily: T.font,
                                  fontWeight: 700,
                                },
                                "& .Mui-selected": {
                                  bgcolor: `${T.brand} !important`,
                                  color: "#fff",
                                },
                              }}
                            />
                          </Stack>
                        )}
                      </>
                    )}
                  </Box>
                )}

                {activeTab === 4 && (
                  <Box sx={{ p: { xs: 2, sm: 3 } }}>
                    {!asset.statusHistory?.length ? (
                      <Box sx={{ py: 6, textAlign: "center" }}>
                        <History
                          sx={{ fontSize: 40, color: T.inkMuted, mb: 1 }}
                        />
                        <Typography
                          sx={{
                            fontSize: "0.875rem",
                            color: T.inkMuted,
                            fontFamily: T.font,
                          }}
                        >
                          No status history available
                        </Typography>
                      </Box>
                    ) : (
                      <Stack spacing={0}>
                        {[...asset.statusHistory].reverse().map((entry, i) => {
                          const sCfg = STATUS_CFG[entry.status] || {};
                          return (
                            <Stack
                              key={i}
                              direction="row"
                              spacing={2}
                              sx={{ position: "relative" }}
                            >
                              {i < asset.statusHistory.length - 1 && (
                                <Box
                                  sx={{
                                    position: "absolute",
                                    left: 15,
                                    top: 32,
                                    bottom: 0,
                                    width: 1.5,
                                    bgcolor: T.border,
                                    zIndex: 0,
                                  }}
                                />
                              )}
                              <Box
                                sx={{
                                  width: 30,
                                  height: 30,
                                  borderRadius: "50%",
                                  bgcolor: sCfg.bg || T.surfaceAlt,
                                  border: `2px solid ${sCfg.dot || T.border}`,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0,
                                  zIndex: 1,
                                  mt: 1.5,
                                }}
                              >
                                <Box
                                  sx={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: "50%",
                                    bgcolor: sCfg.dot || T.inkMuted,
                                  }}
                                />
                              </Box>
                              <Box sx={{ flex: 1, pb: 3, minWidth: 0 }}>
                                <Stack
                                  direction="row"
                                  alignItems="center"
                                  spacing={1.25}
                                  mb={0.5}
                                  flexWrap="wrap"
                                >
                                  <Chip
                                    label={entry.status}
                                    size="small"
                                    sx={{
                                      height: 22,
                                      fontSize: "0.68rem",
                                      fontWeight: 600,
                                      bgcolor: sCfg.bg,
                                      color: sCfg.color,
                                      fontFamily: T.font,
                                    }}
                                  />
                                  <Typography
                                    sx={{
                                      fontSize: "0.72rem",
                                      color: T.inkMuted,
                                      fontFamily: T.font,
                                    }}
                                  >
                                    {entry.changedAt
                                      ? new Date(
                                        entry.changedAt,
                                      ).toLocaleString("en-IN", {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })
                                      : "—"}
                                  </Typography>
                                </Stack>
                                {entry.reason && (
                                  <Typography
                                    sx={{
                                      fontSize: "0.8rem",
                                      color: T.inkSecondary,
                                      fontFamily: T.font,
                                    }}
                                  >
                                    {entry.reason}
                                  </Typography>
                                )}
                              </Box>
                            </Stack>
                          );
                        })}
                      </Stack>
                    )}
                  </Box>
                )}
              </Box>
            </Stack>
          </Box>
        </Box>
      </Box>

      {/* ── LINK ASSET DIALOG ────────────────────────────────────────────── */}
      <LinkAssetDialog
        open={linkOpen}
        onClose={() => setLinkOpen(false)}
        assetId={id}
        currentAsset={asset}
        onSuccess={(message) => {
          loadLinkedRequests();
          toast(message || "Asset linked successfully!");
        }}
      />

      {/* ── DELETE DIALOG ────────────────────────────────────────────────── */}
      <Dialog
        open={deleteOpen}
        onClose={() => !deleting && setDeleteOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: T.r.lg,
            border: `1px solid ${borderColor}`,
            bgcolor: surfaceBg,
            maxWidth: 420,
            animation: `${popIn} 0.2s ease both`,
          },
        }}
      >
        <Box sx={{ p: 3 }}>
          <Stack direction="row" spacing={1.5} alignItems="center" mb={2}>
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: T.r.sm,
                bgcolor: T.redLight,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Delete sx={{ color: T.red, fontSize: 22 }} />
            </Box>
            <Box>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: "1rem",
                  color: isDark ? "#f8fafc" : T.ink,
                  fontFamily: T.font,
                }}
              >
                Delete Asset
              </Typography>
              <Typography
                sx={{
                  fontSize: "0.75rem",
                  color: isDark ? "#94a3b8" : T.inkMuted,
                  fontFamily: T.font,
                }}
              >
                This action cannot be undone.
              </Typography>
            </Box>
          </Stack>
          <Box
            sx={{
              p: 2,
              borderRadius: T.r.sm,
              bgcolor: isDark ? "rgba(239, 68, 68, 0.16)" : T.redLight,
              border: `1px solid ${alpha(T.red, 0.2)}`,
              mb: 2.5,
            }}
          >
            <Typography
              sx={{
                fontSize: "0.875rem",
                color: isDark ? "#fecaca" : T.red,
                fontFamily: T.font,
                fontWeight: 500,
              }}
            >
              Are you sure you want to permanently delete{" "}
              <strong>"{asset.assetName}"</strong>? All linked data will be
              removed.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1.25} justifyContent="flex-end">
            <Button
              onClick={() => setDeleteOpen(false)}
              disabled={deleting}
              sx={{
                textTransform: "none",
                borderRadius: T.r.sm,
                border: `1px solid ${borderColor}`,
                color: isDark ? "#cbd5e1" : T.inkSecondary,
                fontFamily: T.font,
                fontWeight: 600,
                px: 2.5,
                "&:hover": { bgcolor: T.surfaceAlt },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              variant="contained"
              disabled={deleting}
              startIcon={
                deleting ? (
                  <CircularProgress size={14} color="inherit" />
                ) : (
                  <Delete sx={{ fontSize: 16 }} />
                )
              }
              sx={{
                textTransform: "none",
                borderRadius: T.r.sm,
                bgcolor: T.red,
                color: "#fff",
                fontFamily: T.font,
                fontWeight: 700,
                px: 3,
                "&:hover": { bgcolor: "#922B21" },
                "&.Mui-disabled": { opacity: 0.5 },
              }}
            >
              {deleting ? "Deleting…" : "Delete Permanently"}
            </Button>
          </Stack>
        </Box>
      </Dialog>

      {/* ── SNACKBAR ─────────────────────────────────────────────────────── */}
      <Portal>
        <Snackbar
          key={`${snackbar.severity}-${snackbar.message}`}
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          anchorOrigin={{ vertical: "top", horizontal: isMobile ? "center" : "right" }}
          sx={{
            zIndex: (theme) => theme.zIndex.tooltip + 1000,
            position: "fixed",
            top: { xs: "calc(env(safe-area-inset-top, 0px) + 12px)", sm: 24 },
            left: { xs: 12, sm: "auto" },
            right: { xs: 12, sm: 24 },
            width: { xs: "auto", sm: "auto" },
            alignItems: { xs: "stretch", sm: "flex-end" },
          }}
        >
          <Alert
            severity={snackbar.severity}
            variant="filled"
            onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
            sx={{
              borderRadius: "10px",
              fontSize: "0.82rem",
              boxShadow: T.sh.md,
              width: { xs: "100%", sm: "auto" },
              alignItems: "center",
              color: "#fff",
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Portal>
    </Box>
  );
}

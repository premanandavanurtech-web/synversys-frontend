// pages/AssetRequests.jsx
// ─── Changes ──────────────────────────────────────────────────────────────────
// • Added "Add New Asset" option in the asset select inside CreateParentDialog
// • Clicking "Add New Asset" opens AddNewAsset page as a full-screen modal
// • After asset is created, the dialog refreshes the asset list and auto-selects it
// • Replaced the table view with a card-based "My Requests" style layout
// • Added Parent / Child tabs to filter requests by isChildRequest
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Typography,
  Paper,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Pagination,
  Stack,
  Avatar,
  Skeleton,
  Card,
  CardContent,
  Tooltip,
  useMediaQuery,
  useTheme,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Snackbar,
  Divider,
  Autocomplete,
  Slide,
  Tabs,
  Tab,
} from "@mui/material";
import {
  Search,
  CheckCircle,
  Cancel,
  HourglassEmpty,
  DoneAll,
  Refresh,
  Add,
  AccountTree,
  Link as LinkIcon,
  FiberNew,
  TrendingUp,
  Inventory2,
  Close,
  AddCircleOutline,
  CalendarToday,
  Person,
  PlaceOutlined,
} from "@mui/icons-material";
import { styled, keyframes } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { useAssetRequest } from "../context/AssetRequestContext";
import { useAuth } from "../context/AuthContexts";
import { useAsset } from "../context/AssetContext";
import AssetSearchField from "../components/AssetSearchField";
import PageHeading from "../components/PageHeading";

// ─── Animations ────────────────────────────────────────────────────────────────
const fadeSlideIn = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// ─── Design tokens ─────────────────────────────────────────────────────────────
const T = {
  teal: "#146478",
  tealDark: "#08465a",
  tealLight: "#e6f4f2",
  tealMid: "#cce9e6",
  bg: "#f0f4f7",
  surface: "#ffffff",
  border: "#e2e8ef",
  text: "#0d1b2a",
  textSub: "#475569",
  textMuted: "#94a3b8",
  amber: "#d97706",
  amberBg: "#fffbeb",
  green: "#059669",
  greenBg: "#ecfdf5",
  red: "#dc2626",
  redBg: "#fef2f2",
  blue: "#2563eb",
  blueBg: "#eff6ff",
  orange: "#ea580c",
  indigo: "#6366f1",
  indigoBg: "#eef2ff",
};

// ─── Styled components ─────────────────────────────────────────────────────────
const PageWrap = styled(Box)(({ theme }) => ({
  minHeight: "100vh",
  padding: "28px 32px 60px",
  animation: `${fadeSlideIn} 0.28s ease both`,
  [theme.breakpoints.down("md")]: { padding: "18px 16px 48px" },
  [theme.breakpoints.down("sm")]: { padding: "12px 10px 40px" },
}));

const StatCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== "accent" && prop !== "active",
})(({ accent, active }) => ({
  position: "relative",
  overflow: "hidden",
  borderRadius: 16,
  border: `1px solid ${active ? `${accent || T.teal} !important` : T.border}`,
  borderLeft: `6px solid ${accent || T.teal}`,
  outline: active ? `3px solid ${accent || T.teal}` : "none",
  outlineOffset: "-3px",
  boxShadow: active
    ? `inset 0 0 0 1px ${accent || T.teal}, 0 18px 40px ${accent || T.teal}38 !important`
    : "none",
  background: active ? `${accent || T.teal}24 !important` : T.surface,
  cursor: "pointer",
  transition: "transform 0.18s, box-shadow 0.18s, border-color 0.18s, background 0.18s",
  "&::before": active
    ? {
        content: '""',
        position: "absolute",
        inset: "0 auto 0 0",
        width: 6,
        backgroundColor: accent || T.teal,
      }
    : undefined,
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: active
      ? `inset 0 0 0 1px ${accent || T.teal}, 0 20px 44px ${accent || T.teal}3d !important`
      : "0 8px 24px rgba(0,0,0,0.06)",
    borderColor: accent || T.teal,
    outline: `3px solid ${accent || T.teal}`,
  },
  "&:focus-visible": {
    outline: `3px solid ${accent || T.teal}33`,
    outlineOffset: 3,
  },
}));

const FilterPaper = styled(Paper)({
  borderRadius: 14,
  border: `1px solid ${T.border}`,
  boxShadow: "none",
  padding: "14px 18px",
  marginBottom: 20,
  background: T.surface,
});

const RequestCard = styled(Card)({
  borderRadius: 16,
  border: `1px solid ${T.border}`,
  boxShadow: "none",
  background: T.surface,
  height: "100%",
  display: "flex",
  flexDirection: "column",
  transition: "transform 0.16s, box-shadow 0.16s, border-color 0.16s",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 10px 28px rgba(13,27,42,0.08)",
    borderColor: T.tealMid,
  },
});

// ─── Status / type chip helpers ────────────────────────────────────────────────
const STATUS_CONFIG = {
  pending: {
    bg: "#fffbeb",
    color: "#d97706",
    icon: <HourglassEmpty sx={{ fontSize: 12 }} />,
    label: "Pending",
  },
  approved: {
    bg: "#ecfdf5",
    color: "#059669",
    icon: <CheckCircle sx={{ fontSize: 12 }} />,
    label: "Approved",
  },
  rejected: {
    bg: "#fef2f2",
    color: "#dc2626",
    icon: <Cancel sx={{ fontSize: 12 }} />,
    label: "Rejected",
  },
  completed: {
    bg: "#eff6ff",
    color: "#2563eb",
    icon: <DoneAll sx={{ fontSize: 12 }} />,
    label: "Completed",
  },
};

const StatusChip = ({ status }) => {
  const c = STATUS_CONFIG[status?.toLowerCase()] || STATUS_CONFIG.pending;
  return (
    <Chip
      icon={c.icon}
      label={c.label}
      size="small"
      sx={{
        bgcolor: c.bg,
        color: c.color,
        fontWeight: 700,
        fontSize: "0.7rem",
        height: 24,
        "& .MuiChip-icon": { color: c.color },
      }}
    />
  );
};

const TYPE_COLORS = {
  transfer: "#6366f1",
  maintenance: "#f59e0b",
  repair: "#ef4444",
  checkout: "#10b981",
  other: "#94a3b8",
};

const RequestTypeChip = ({ type }) => {
  const color = TYPE_COLORS[type] || "#94a3b8";
  return (
    <Chip
      label={type || "other"}
      size="small"
      sx={{
        bgcolor: `${color}15`,
        color,
        fontWeight: 700,
        fontSize: "0.68rem",
        height: 22,
        textTransform: "capitalize",
        border: `1px solid ${color}25`,
      }}
    />
  );
};

const URGENCY_COLORS = {
  low: { bg: "#f0fdf4", color: "#16a34a" },
  medium: { bg: "#fefce8", color: "#ca8a04" },
  high: { bg: "#fff7ed", color: "#f97316" },
  critical: { bg: "#fef2f2", color: "#dc2626" },
};

const UrgencyChip = ({ urgency }) => {
  const c = URGENCY_COLORS[urgency] || URGENCY_COLORS.medium;
  return (
    <Chip
      label={urgency || "medium"}
      size="small"
      sx={{
        bgcolor: c.bg,
        color: c.color,
        fontWeight: 700,
        fontSize: "0.68rem",
        height: 22,
        textTransform: "capitalize",
      }}
    />
  );
};

const getRequestAssetName = (request) => {
  const fromDescription =
    request?.description?.match(/Asset creation request for\s+(.+)$/i)?.[1];

  return (
    request?.assetId?.name ||
    request?.assetId?.assetName ||
    request?.proposedAssetData?.assetName ||
    request?.assetName ||
    fromDescription ||
    "Unnamed Asset"
  );
};

const isAdminCreatedAssetRequest = (request) =>
  request?.requestType === "asset_creation" &&
  /^Admin created\s+(parent|child)?\s*asset\b/i.test(
    String(request?.description || ""),
  );

const assetStatusColor = (s) =>
  ({
    Available: T.green,
    "In Use": T.blue,
    "In Maintenance": T.amber,
    Retired: T.red,
    Lost: T.red,
    Disposed: T.textMuted,
  })[s] || T.textMuted;

// ─── Slide-up transition for full-screen modal ─────────────────────────────────
const SlideUp = React.forwardRef(function SlideUp(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

// ──────────────────────────────────────────────────────────────────────────────
// EMBEDDED ADD ASSET MODAL
// ──────────────────────────────────────────────────────────────────────────────
function AddAssetModal({
  open,
  onClose,
  onAssetCreated,
  defaultAssetType = "parent",
  defaultSerialNumber = "",
}) {
  const [AddNewAsset, setAddNewAsset] = useState(null);

  useEffect(() => {
    if (open && !AddNewAsset) {
      import("./AddNewAsset")
        .then((mod) => setAddNewAsset(() => mod.default))
        .catch(() => setAddNewAsset(null));
    }
  }, [open]);

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={onClose}
      TransitionComponent={SlideUp}
      PaperProps={{
        sx: {
          bgcolor: "#f0f4f7",
          m: { xs: 0, sm: "12px" },
          borderRadius: { xs: 0, sm: "16px" },
          height: { xs: "100%", sm: "calc(100% - 24px)" },
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 32px 80px rgba(0,0,0,0.22)",
        },
      }}
    >
      {/* ── Slim top bar with just a close button ── */}
      <Box
        sx={{
          display: "none",
          alignItems: "center",
          justifyContent: "space-between",
          px: 3,
          py: 1.25,
          bgcolor: T.surface,
          borderBottom: `1px solid ${T.border}`,
          flexShrink: 0,
          zIndex: 10,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 30,
              height: 30,
              borderRadius: 1.5,
              bgcolor: T.tealLight,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Inventory2 sx={{ fontSize: 15, color: T.teal }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: "0.875rem", color: T.text, lineHeight: 1.2 }}>
              Add New Asset
            </Typography>
            <Typography sx={{ fontSize: "0.68rem", color: T.textMuted }}>
              Asset will be auto-selected after saving
            </Typography>
          </Box>
        </Stack>
        <Tooltip title="Close and go back">
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              bgcolor: "#f1f5f9",
              color: T.textMuted,
              borderRadius: 1.5,
              width: 30,
              height: 30,
              "&:hover": { bgcolor: T.redBg, color: T.red },
              transition: "all 0.15s",
            }}
          >
            <Close sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* ── Scrollable content area ── */}
      <Box sx={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
        {open && AddNewAsset ? (
          <AddNewAsset
            key={`${defaultAssetType}-${defaultSerialNumber}`}
            embeddedMode
            defaultAssetType={defaultAssetType}
            defaultSerialNumber={defaultSerialNumber}
            onEmbeddedClose={onClose}
            onEmbeddedSuccess={(newAsset) => {
              onAssetCreated(newAsset);
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
            <CircularProgress size={32} sx={{ color: T.teal }} />
            <Typography sx={{ color: T.textMuted, fontSize: "0.875rem", fontWeight: 500 }}>
              Loading asset form…
            </Typography>
          </Box>
        ) : null}
      </Box>
    </Dialog>
  );
}

// ─── Asset Autocomplete with "Add New Asset" option ───────────────────────────
function AssetAutocomplete({
  value,
  onChange,
  assets,
  loading,
  error,
  onAddNewAsset,
}) {
  // We inject a sentinel option that triggers the add-asset flow
  const ADD_SENTINEL = { __isAddNew: true, _id: "__add_new__" };

  const options = [...(assets || []), ADD_SENTINEL];

  return (
    <Box>
      <Typography
        variant="caption"
        fontWeight={700}
        color={T.textSub}
        sx={{ display: "block", mb: 0.75 }}
      >
        Select Asset *
      </Typography>
      <Autocomplete
        value={value}
        onChange={(event, newValue) => {
          if (newValue?.__isAddNew) {
            // Don't select the sentinel — open the add-asset modal instead
            onAddNewAsset?.();
            return;
          }
          onChange(event, newValue);
        }}
        options={options}
        loading={loading}
        filterOptions={(opts, state) => {
          // Always keep the sentinel at the bottom; filter the rest normally
          const filtered = opts.filter((o) => {
            if (o.__isAddNew) return true;
            const label = (() => {
              const name = o.name || o.assetName || "";
              const tag = o.assetTag || o.serialNumber || "";
              return `${name} ${tag}`.toLowerCase();
            })();
            return label.includes(state.inputValue.toLowerCase());
          });
          return filtered;
        }}
        getOptionLabel={(option) => {
          if (!option) return "";
          if (option.__isAddNew) return "Add New Asset";
          const name = option.name || option.assetName || "Unnamed";
          const tag = option.assetTag || option.serialNumber || "";
          return tag ? `${name} (${tag})` : name;
        }}
        isOptionEqualToValue={(option, val) => {
          if (!option || !val) return false;
          if (option.__isAddNew || val.__isAddNew) return false;
          return (option._id || option.id) === (val._id || val.id);
        }}
        renderOption={(props, option) => {
          // ── "Add New Asset" sentinel ──
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
                      borderRadius: 1.5,
                      bgcolor: T.tealLight,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <AddCircleOutline
                      sx={{ fontSize: 16, color: T.teal }}
                    />
                  </Box>
                  <Box>
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      color={T.teal}
                    >
                      Add New Asset
                    </Typography>
                    <Typography variant="caption" color={T.textMuted}>
                      Create a new asset and select it
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            );
          }

          // ── Normal asset option ──
          const name = option.name || option.assetName || "Unnamed";
          const tag = option.assetTag || option.serialNumber || "";
          const sc = assetStatusColor(option.status);
          return (
            <Box component="li" {...props} key={option._id || option.id}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  width: "100%",
                }}
              >
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 1.5,
                    bgcolor: T.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Inventory2 sx={{ fontSize: 16, color: T.textMuted }} />
                </Box>
                <Box flex={1}>
                  <Typography variant="body2" fontWeight={600}>
                    {name}
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    {tag && (
                      <Typography variant="caption" color="textSecondary">
                        {tag}
                      </Typography>
                    )}
                    <Chip
                      label={option.status || "Unknown"}
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: 9,
                        fontWeight: 700,
                        color: sc,
                        bgcolor: `${sc}18`,
                        border: `1px solid ${sc}28`,
                      }}
                    />
                  </Stack>
                </Box>
              </Box>
            </Box>
          );
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            size="small"
            placeholder="Search by name, tag, or serial…"
            error={!!error}
            helperText={error}
            sx={{
              "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: T.bg },
            }}
          />
        )}
        sx={{ width: "100%" }}
      />
      {value && (
        <Box
          sx={{
            mt: 1,
            px: 1.5,
            py: 0.75,
            borderRadius: 2,
            bgcolor: T.tealLight,
            border: `1px solid ${T.tealMid}`,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <CheckCircle sx={{ fontSize: 14, color: T.teal }} />
          <Typography variant="caption" fontWeight={600} color={T.teal}>
            Selected: {value.name || value.assetName || "Unnamed"}
            <span
              style={{ fontSize: 10, marginLeft: 8, fontFamily: "monospace" }}
            >
              (ID: {(value._id || value.id)?.slice(-8)})
            </span>
          </Typography>
        </Box>
      )}
    </Box>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// MODAL 1: CREATE PARENT REQUEST
// ──────────────────────────────────────────────────────────────────────────────
function CreateParentDialog({ open, onClose, onSuccess }) {
  const { createParentRequest } = useAssetRequest();
  const { getAllAssets, assets, loading: assetsLoading } = useAsset();
  const [form, setForm] = useState({
    assetId: "",
    requestType: "transfer",
    description: "",
    urgency: "medium",
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [selectedAsset, setSelectedAsset] = useState(null);

  // Controls the embedded AddNewAsset modal
  const [addAssetOpen, setAddAssetOpen] = useState(false);

  useEffect(() => {
    if (open) {
      getAllAssets({ limit: 200 });
      setFormError("");
      setForm({
        assetId: "",
        requestType: "transfer",
        description: "",
        urgency: "medium",
      });
      setSelectedAsset(null);
    }
  }, [open, getAllAssets]);

  const handleAssetChange = (_, newValue) => {
    if (newValue) {
      setSelectedAsset(newValue);
      setForm((p) => ({ ...p, assetId: newValue._id || newValue.id }));
      setFormError("");
    } else {
      setSelectedAsset(null);
      setForm((p) => ({ ...p, assetId: "" }));
    }
  };

  // Called when a new asset is successfully created inside the embedded modal
  const handleNewAssetCreated = async (newAsset) => {
    // Refresh the assets list so the new asset appears
    await getAllAssets({ limit: 200 });

    // Auto-select the newly created asset
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
      onSuccess("Request created successfully");
      onClose();
      setForm({
        assetId: "",
        requestType: "transfer",
        description: "",
        urgency: "medium",
      });
      setSelectedAsset(null);
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

  return (
    <>
      <Dialog
        open={open}
        onClose={() => !submitting && onClose()}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: "1rem", pb: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: 2,
                bgcolor: T.tealLight,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Add sx={{ color: T.teal, fontSize: 18 }} />
            </Box>
            New Asset Request
          </Stack>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2.5 }}>
          {formError && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {formError}
            </Alert>
          )}
          <Stack spacing={2.5}>
            {/* Asset selector with "Add New Asset" option */}
            <AssetAutocomplete
              value={selectedAsset}
              onChange={handleAssetChange}
              assets={assets}
              loading={assetsLoading}
              error=""
              onAddNewAsset={() => setAddAssetOpen(true)}
            />

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Request Type</InputLabel>
                <Select
                  value={form.requestType}
                  label="Request Type"
                  sx={{ borderRadius: 2 }}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, requestType: e.target.value }))
                  }
                >
                  {[
                    "transfer",
                    "maintenance",
                    "repair",
                    "checkout",
                    "other",
                  ].map((t) => (
                    <MenuItem
                      key={t}
                      value={t}
                      sx={{ textTransform: "capitalize" }}
                    >
                      {t}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth size="small">
                <InputLabel>Urgency</InputLabel>
                <Select
                  value={form.urgency}
                  label="Urgency"
                  sx={{ borderRadius: 2 }}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, urgency: e.target.value }))
                  }
                >
                  {["low", "medium", "high", "critical"].map((u) => (
                    <MenuItem
                      key={u}
                      value={u}
                      sx={{ textTransform: "capitalize" }}
                    >
                      {u}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
            <TextField
              fullWidth
              multiline
              rows={3}
              size="small"
              label="Description"
              value={form.description}
              inputProps={{ maxLength: 1000 }}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
              placeholder="Describe the reason for this request…"
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button
            onClick={onClose}
            disabled={submitting}
            sx={{ borderRadius: 2, textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              background: `linear-gradient(135deg, ${T.teal} 0%, ${T.tealDark} 100%)`,
            }}
          >
            {submitting ? (
              <CircularProgress size={17} sx={{ color: "#fff" }} />
            ) : (
              "Create Request"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Full-screen Add Asset modal — sits on top of the create-request dialog */}
      <AddAssetModal
        open={addAssetOpen}
        onClose={() => setAddAssetOpen(false)}
        onAssetCreated={handleNewAssetCreated}
      />
    </>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// REQUEST CARD (replaces table row)
// ──────────────────────────────────────────────────────────────────────────────
// Mirrors the fields visible in the admin table (Image 1): asset name/id,
// requester, request type ("Category"), urgency, status, created date
// ("Last Inspection"-style date), plus the description as the location-style
// subtext line under the asset name.
function RequestCardItem({ r, onOpen, onChild, onLinkAsset }) {
  const fmt = (d) =>
    d
      ? new Date(d).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "—";

  const assetName = getRequestAssetName(r);
  const assetTag =
    r.assetId?.assetTag ||
    r.assetId?.serialNumber ||
    r.proposedAssetData?.serialNumber ||
    r.assetId?._id?.slice(-8);

  return (
    <RequestCard>
      <CardContent sx={{ p: 2.25, flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Header row: asset name + status */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          spacing={1}
          mb={0.5}
        >
          <Box minWidth={0}>
            <Typography
              fontWeight={700}
              fontSize="0.95rem"
              color={T.text}
              noWrap
              title={assetName}
            >
              {assetName}
            </Typography>
            <Stack direction="row" spacing={0.5} alignItems="center" mt={0.25}>
              <PlaceOutlined sx={{ fontSize: 13, color: T.textMuted }} />
              <Typography
                sx={{ fontSize: 11.5, color: T.textMuted, fontFamily: "monospace" }}
                noWrap
              >
                {assetTag ? `Tag: ${assetTag}` : `#${r._id?.slice(-10)}`}
              </Typography>
            </Stack>
          </Box>
          <StatusChip status={r.status} />
        </Stack>

        <Divider sx={{ my: 1.25 }} />

        {/* Category row (request type) */}
        <Stack direction="row" justifyContent="space-between" mb={0.9}>
          <Typography sx={{ fontSize: 12, color: T.textMuted, fontWeight: 600 }}>
            Category:
          </Typography>
          <RequestTypeChip type={r.requestType} />
        </Stack>

        {/* Urgency row */}
        <Stack direction="row" justifyContent="space-between" mb={0.9}>
          <Typography sx={{ fontSize: 12, color: T.textMuted, fontWeight: 600 }}>
            Urgency:
          </Typography>
          <UrgencyChip urgency={r.urgency} />
        </Stack>

        {/* Requester + date, mirroring "Last Inspection / Next Due" two-column layout */}
        <Stack direction="row" spacing={2} mb={r.description ? 1 : 0}>
          <Box flex={1} minWidth={0}>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Person sx={{ fontSize: 13, color: T.textMuted }} />
              <Typography sx={{ fontSize: 11, color: T.textMuted, fontWeight: 600 }}>
                Requester
              </Typography>
            </Stack>
            <Typography
              sx={{ fontSize: 12.5, color: T.text, fontWeight: 600, mt: 0.25 }}
              noWrap
              title={r.requestedBy?.email}
            >
              {r.requestedBy?.email?.split("@")[0] || "Unknown"}
            </Typography>
          </Box>
          <Box flex={1} minWidth={0}>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <CalendarToday sx={{ fontSize: 12, color: T.textMuted }} />
              <Typography sx={{ fontSize: 11, color: T.textMuted, fontWeight: 600 }}>
                Created
              </Typography>
            </Stack>
            <Typography sx={{ fontSize: 12.5, color: T.text, fontWeight: 600, mt: 0.25 }}>
              {fmt(r.createdAt)}
            </Typography>
          </Box>
        </Stack>

        {r.description && (
          <Typography
            sx={{
              fontSize: 12,
              color: T.textSub,
              lineHeight: 1.5,
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              mb: 0.5,
            }}
          >
            {r.description}
          </Typography>
        )}

        {r.isChildRequest && (
          <Chip
            label="Child Request"
            size="small"
            sx={{
              alignSelf: "flex-start",
              height: 20,
              fontSize: 10,
              fontWeight: 700,
              bgcolor: T.blueBg,
              color: T.blue,
              mb: 0.5,
            }}
          />
        )}

        <Box flex={1} />

        {/* Footer actions */}
        <Stack direction="row" spacing={1} mt={1.5}>
          <Button
            fullWidth
            size="small"
            variant="outlined"
            onClick={() => onOpen(r._id)}
            sx={{
              borderRadius: 1,
              textTransform: "none",
              fontWeight: 600,
              fontSize: 12.5,
              borderColor: T.border,
              paddingY:1,
              color: T.text,
              "&:hover": { borderColor: T.teal, bgcolor: T.tealLight, color: T.tealDark },
            }}
          >
            View Details
          </Button>
          {/* <Tooltip title="Create child request">
            <IconButton
              size="small"
              onClick={() => onChild(r._id)}
              sx={{
                borderRadius: 1.5,
                border: `1px solid ${T.border}`,
                color: T.blue,
                "&:hover": { bgcolor: T.blueBg, borderColor: T.blue },
              }}
            >
              <AccountTree sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Link asset">
            <IconButton
              size="small"
              onClick={() => onLinkAsset(r._id)}
              sx={{
                borderRadius: 1.5,
                border: `1px solid ${T.border}`,
                color: T.green,
                "&:hover": { bgcolor: T.greenBg, borderColor: T.green },
              }}
            >
              <LinkIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip> */}
        </Stack>
      </CardContent>
    </RequestCard>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ──────────────────────────────────────────────────────────────────────────────
export default function AssetRequests() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { fetchRequests, loading, isAdmin } = useAssetRequest();
  const requestCreatePath =
    user?.role === "admin"
      ? "/admin/asset-requests/create"
      : "/team/asset-requests/create";
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isDark = theme.palette.mode === "dark";

  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    completed: 0,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });
  const [filters, setFilters] = useState({
    type: "all",
    status: "all",
    search: "",
  });
  const [statStatusFilter, setStatStatusFilter] = useState("all");
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Parent / Child tab — mirrors "Parent Asset Add Request" / "Child Asset Add Request"
  const [requestKindTab, setRequestKindTab] = useState("parent");

  const [createParentOpen, setCreateParentOpen] = useState(false);
  const [createChildOpen, setCreateChildOpen] = useState(false);
  const [assetFormOpen, setAssetFormOpen] = useState(false);
  const [assetFormType, setAssetFormType] = useState("parent");
  const [assetFormSerial, setAssetFormSerial] = useState("");
  const [linkAssetOpen, setLinkAssetOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);

  const searchTimer = useRef(null);

  const showSnack = (msg, sev = "success") =>
    setSnack({ open: true, message: msg, severity: sev });

  const makeSerialNumber = (type) =>
    `${type === "child" ? "CA" : "PA"}_${Date.now().toString().slice(-8)}`;

  const openAssetForm = (type) => {
    setAssetFormType(type);
    setAssetFormSerial(makeSerialNumber(type));
    setAssetFormOpen(true);
  };

  const loadRequests = useCallback(async () => {
    try {
      const data = await fetchRequests({
        page: pagination.page,
        limit: pagination.limit,
        type: requestKindTab,
        status: filters.status,
        search: filters.search,
        sortBy: sortField,
        sortOrder: sortOrder,
      });

      if (data?.success) {
        setRequests(data.requests || []);
        setStats(
          data.stats || {
            total: 0,
            pending: 0,
            approved: 0,
            rejected: 0,
            completed: 0,
          },
        );
        setPagination((p) => ({ ...p, ...data.pagination }));
      } else if (data?.requests) {
        setRequests(data.requests || []);
        setStats(
          data.stats || {
            total: 0,
            pending: 0,
            approved: 0,
            rejected: 0,
            completed: 0,
          },
        );
        setPagination((p) => ({ ...p, ...data.pagination }));
      }
    } catch (err) {
      console.error("Failed to load requests:", err);
      showSnack(
        err?.response?.data?.message || "Failed to load requests",
        "error",
      );
    }
  }, [
    fetchRequests,
    pagination.page,
    pagination.limit,
    requestKindTab,
    filters.status,
    filters.search,
    sortField,
    sortOrder,
  ]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleSearchChange = (val) => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setFilters((p) => ({ ...p, search: val }));
      setPagination((p) => ({ ...p, page: 1 }));
    }, 380);
  };

  const handleFilterChange = (key, value) => {
    setFilters((p) => ({ ...p, [key]: value }));
    if (key === "status") setStatStatusFilter("all");
    setPagination((p) => ({ ...p, page: 1 }));
  };

  const handleStatFilter = (status) => {
    setStatStatusFilter(status);
    setPagination((p) => ({ ...p, page: 1 }));
  };

  const visibleRequests = requests.filter((r) => !isAdminCreatedAssetRequest(r));

  // Apply the Parent/Child tab on top of whatever the server returned.
  // (Server-side `filters.type` filter still applies separately via the Type select.)
  const tabFiltered = visibleRequests.filter((r) =>
    requestKindTab === "child"
      ? r.assetType === "child" || !!r.isChildRequest
      : r.assetType === "parent" || (!r.assetType && !r.isChildRequest),
  );

  const statusFiltered =
    statStatusFilter === "all"
      ? tabFiltered
      : tabFiltered.filter(
          (r) => String(r.status || "").toLowerCase() === statStatusFilter,
        );

  const sorted = [...statusFiltered].sort((a, b) => {
    const av = sortField === "createdAt" ? new Date(a.createdAt) : a[sortField];
    const bv = sortField === "createdAt" ? new Date(b.createdAt) : b[sortField];
    return sortOrder === "asc" ? (av > bv ? 1 : -1) : av < bv ? 1 : -1;
  });

  const tabStats = tabFiltered.reduce(
    (acc, request) => {
      const status = String(request.status || "").toLowerCase();
      acc.total += 1;
      if (acc[status] !== undefined) acc[status] += 1;
      return acc;
    },
    { total: 0, pending: 0, approved: 0, rejected: 0, completed: 0 },
  );

  const displayStats = {
    ...stats,
    ...tabStats,
    total: tabStats.total,
  };

  const adminParentRequestsCount = requests.filter(
    (r) =>
      isAdminCreatedAssetRequest(r) &&
      (r.assetType === "parent" || (!r.assetType && !r.isChildRequest)),
  ).length;
  const adminChildRequestsCount = requests.filter(
    (r) =>
      isAdminCreatedAssetRequest(r) &&
      (r.assetType === "child" || r.isChildRequest),
  ).length;

  const parentCount =
    typeof stats?.parent === "number"
      ? Math.max(0, stats.parent - adminParentRequestsCount)
      : visibleRequests.filter(
          (r) => r.assetType === "parent" || (!r.assetType && !r.isChildRequest),
        ).length;
  const childCount =
    typeof stats?.child === "number"
      ? Math.max(0, stats.child - adminChildRequestsCount)
      : visibleRequests.filter(
          (r) => r.assetType === "child" || r.isChildRequest,
        ).length;
  const requestVerb = user?.role === "team" ? "Sent" : "Received";

  const statDefs = [
    {
      key: "total",
      label: "Total Requests",
      accent: T.teal,
      icon: <TrendingUp />,
      iconColor: T.teal,
    },
    {
      key: "pending",
      label: "Pending",
      accent: T.amber,
      icon: <HourglassEmpty />,
      iconColor: T.amber,
    },
    {
      key: "approved",
      label: "Approved",
      accent: T.green,
      icon: <CheckCircle />,
      iconColor: T.green,
    },
    {
      key: "rejected",
      label: "Rejected",
      accent: T.red,
      icon: <Cancel />,
      iconColor: T.red,
    },
    {
      key: "completed",
      label: "Completed",
      accent: T.blue,
      icon: <DoneAll />,
      iconColor: T.blue,
    },
  ];

  if (loading && requests.length === 0) {
    return (
      <PageWrap>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Box>
            <Skeleton width={180} height={32} />
            <Skeleton width={280} height={18} sx={{ mt: 0.5 }} />
          </Box>
          <Stack direction="row" spacing={1}>
            <Skeleton width={130} height={38} sx={{ borderRadius: 2 }} />
            <Skeleton width={130} height={38} sx={{ borderRadius: 2 }} />
          </Stack>
        </Stack>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr 1fr",
              sm: "repeat(3,1fr)",
              md: "repeat(5,1fr)",
            },
            gap: 2,
            mb: 3,
          }}
        >
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton
              key={i}
              variant="rounded"
              height={96}
              sx={{ borderRadius: 2 }}
            />
          ))}
        </Box>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" },
            gap: 2,
          }}
        >
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton
              key={i}
              variant="rounded"
              height={220}
              sx={{ borderRadius: 3 }}
            />
          ))}
        </Box>
      </PageWrap>
    );
  }

  return (
    <PageWrap>
      {/* ── Header ── */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        mb={3}
        gap={2}
      >
        <PageHeading
          title="Asset Requests"
          subtitle="Manage transfers, maintenance, repairs & more"
          titleColor={T.text}
          subtitleColor={T.textMuted}
        />
        {(
          <Stack
            direction="row"
            spacing={0}
            sx={{
              width: { xs: "100%", sm: "auto" },
              display: "grid",
              gridTemplateColumns: { xs: "1fr 1fr", sm: "auto auto" },
              gap: { xs: 1, sm: 1.5 },
            }}
          >
            <Button
              variant="contained"
              size="small"
              startIcon={<Add sx={{ fontSize: 17 }} />}
              onClick={() => openAssetForm("parent")}
              sx={{
                minWidth: 0,
                px: { xs: 1, sm: 1.5 },
                borderRadius: 1,
                textTransform: "none",
                fontWeight: 600,
                fontSize: { xs: "0.78rem", sm: "0.82rem" },
                background: `linear-gradient(135deg, ${T.teal} 0%, ${T.tealDark} 100%)`,
                boxShadow: "0 2px 8px rgba(10,97,87,0.25)",
                "& .MuiButton-startIcon": {
                  mr: { xs: 0.5, sm: 1 },
                },
              }}
            >
              Add Asset
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Add sx={{ fontSize: 17 }} />}
              onClick={() => openAssetForm("child")}
              sx={{
                minWidth: 0,
                px: { xs: 1, sm: 1.5 },
                borderRadius: 1,
                textTransform: "none",
                fontWeight: 600,
                fontSize: { xs: "0.78rem", sm: "0.82rem" },
                borderColor: T.teal,
                color: T.teal,
                bgcolor: T.tealLight,
                whiteSpace: "nowrap",
                "& .MuiButton-startIcon": {
                  mr: { xs: 0.5, sm: 1 },
                },
                "&:hover": {
                  borderColor: T.tealDark,
                  bgcolor: T.tealLight,
                },
              }}
            >
              Add Child Asset
            </Button>
          </Stack>
        )}
      </Stack>

      {/* ── Stat Cards ── */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr 1fr",
            sm: "repeat(3,1fr)",
            md: "repeat(5,1fr)",
          },
          gap: 2,
          mb: 3,
        }}
      >
        {statDefs.map(({ key, label, accent, icon, iconColor }) => {
          const statusValue = key === "total" ? "all" : key;
          const isActive = statStatusFilter === statusValue;

          return (
          <StatCard
            key={key}
            accent={accent}
            active={isActive}
            role="button"
            tabIndex={0}
            aria-pressed={isActive}
            onClick={() => handleStatFilter(statusValue)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleStatFilter(statusValue);
              }
            }}
            sx={{
              gridColumn: {
                xs: key === "completed" ? "1 / -1" : "auto",
                sm: "auto",
              },
            }}
          >
            <CardContent sx={{ py: 2, px: 2.25, "&:last-child": { pb: 2 } }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="flex-start"
              >
                <Box>
                  <Typography
                    sx={{
                      fontSize: 10,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      color: isActive ? accent : T.textMuted,
                      letterSpacing: "0.07em",
                    }}
                  >
                    {label}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 28,
                      fontWeight: 800,
                      color: key === "total" ? T.teal : accent,
                      lineHeight: 1.15,
                      mt: 0.5,
                    }}
                  >
                    {displayStats[key] ?? 0}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 2,
                    bgcolor: `${accent}12`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mt: 0.25,
                  }}
                >
                  {React.cloneElement(icon, {
                    sx: { fontSize: 18, color: iconColor },
                  })}
                </Box>
              </Stack>
            </CardContent>
          </StatCard>
          );
        })}
      </Box>

      {/* ── Parent / Child Tabs ── */}
      <Tabs
        value={requestKindTab}
        onChange={(_, v) => {
          setRequestKindTab(v);
          setPagination((p) => ({ ...p, page: 1 }));
        }}
        sx={{
          mb: 2,
          minHeight: 40,
          "& .MuiTabs-indicator": { display: "none" },
          "& .MuiTabs-flexContainer": {
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: { xs: 1, sm: 1.25 },
          },
        }}
      >
        {[
          {
            value: "parent",
            label: {
              xs: `${requestVerb} Parent`,
              sm: `${requestVerb} Parent Asset Request`,
            },
            count: parentCount,
          },
          {
            value: "child",
            label: {
              xs: `${requestVerb} Child`,
              sm: `${requestVerb} Child Asset Request`,
            },
            count: childCount,
          },
        ].map((t) => (
          <Tab
            key={t.value}
            value={t.value}
            label={
              <Box
                component="span"
                sx={{
                  display: "block",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: "100%",
                }}
              >
                <Box component="span" sx={{ display: { xs: "inline", sm: "none" } }}>
                  {`${t.label.xs} (${t.count ?? 0})`}
                </Box>
                <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
                  {`${t.label.sm} (${t.count ?? 0})`}
                </Box>
              </Box>
            }
            sx={{
              minWidth: 0,
              width: "100%",
              minHeight: 40,
              px: { xs: 1, sm: 2 },
              textTransform: "none",
              fontWeight: 700,
              fontSize: { xs: "0.78rem", sm: "0.82rem" },
              borderRadius: 2,
              color: isDark ? "#94a3b8" : T.textMuted,
              bgcolor: isDark ? "#0f1c2e" : "#eef2f5",
              border: `1px solid ${isDark ? "rgba(148, 163, 184, 0.2)" : "transparent"}`,
              "&.Mui-selected": {
                color: isDark ? "#61d7ed" : T.teal,
                bgcolor: isDark ? "rgba(26, 166, 196, 0.16)" : T.tealLight,
                borderColor: isDark ? "rgba(97, 215, 237, 0.32)" : "transparent",
              },
              "&:hover": {
                bgcolor: isDark ? "rgba(26, 166, 196, 0.1)" : T.tealLight,
              },
            }}
          />
        ))}
      </Tabs>

      {/* ── Filters ── */}
      <FilterPaper>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          alignItems={{ xs: "stretch", sm: "center" }}
        >
          <AssetSearchField
            placeholder="Search requests, assets, requesters..."
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            onClear={() => handleSearchChange("")}
            sx={{ flex: 2 }}
          />
          <FormControl size="small" sx={{ flex: 1, minWidth: 130 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.status}
              label="Status"
              sx={{ borderRadius: 2.5 }}
              onChange={(e) => handleFilterChange("status", e.target.value)}
            >
              <MenuItem value="all">All Status</MenuItem>
              {["pending", "approved", "rejected", "completed"].map((s) => (
                <MenuItem
                  key={s}
                  value={s}
                  sx={{ textTransform: "capitalize" }}
                >
                  {s}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Tooltip title="Refresh">
            <IconButton
              onClick={loadRequests}
              disabled={loading}
              sx={{
                bgcolor: T.tealLight,
                color: T.teal,
                borderRadius: 2,
                flexShrink: 0,
                "&:hover": { bgcolor: T.tealMid },
              }}
            >
              <Refresh sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Stack>
      </FilterPaper>

      {/* ── Card Grid ── */}
      {sorted.length === 0 && !loading ? (
        <Paper
          sx={{
            p: 5,
            textAlign: "center",
            borderRadius: 3,
            border: `1px solid ${T.border}`,
            boxShadow: "none",
          }}
        >
          <FiberNew sx={{ fontSize: 38, color: T.textMuted, mb: 1 }} />
          <Typography fontWeight={600} color="textSecondary">
            No {requestKindTab === "child" ? "child" : "parent"} requests found
          </Typography>
          <Typography variant="caption" color="textSecondary">
            Adjust your filters or create a new request
          </Typography>
        </Paper>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr",
              md: "1fr 1fr 1fr",
            },
            gap: 2,
          }}
        >
          {sorted.map((r) => (
            <RequestCardItem
              key={r._id}
              r={r}
              onOpen={(id) => navigate(`/admin/asset-requests/${id}`)}
              onChild={(id) => {
                setSelectedRequestId(id);
                setCreateChildOpen(true);
              }}
              onLinkAsset={(id) => {
                setSelectedRequestId(id);
                setLinkAssetOpen(true);
              }}
            />
          ))}
        </Box>
      )}

      {pagination.pages > 1 && (
        <Stack direction="row" justifyContent="center" mt={3}>
          <Pagination
            count={pagination.pages}
            page={pagination.page}
            color="primary"
            shape="rounded"
            onChange={(_, p) => setPagination((prev) => ({ ...prev, page: p }))}
          />
        </Stack>
      )}

      {/* ── Dialogs ── */}
      <CreateParentDialog
        open={createParentOpen}
        onClose={() => setCreateParentOpen(false)}
        onSuccess={(msg) => {
          showSnack(msg);
          loadRequests();
        }}
      />

      <AddAssetModal
        open={assetFormOpen}
        onClose={() => setAssetFormOpen(false)}
        defaultAssetType={assetFormType}
        defaultSerialNumber={assetFormSerial}
        onAssetCreated={() => {
          setAssetFormOpen(false);
          showSnack(
            assetFormType === "child"
              ? "Child asset request sent to admin"
              : "Asset request sent to admin",
          );
          loadRequests();
        }}
      />

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}

        onClose={() => setSnack((p) => ({ ...p, open: false }))}
  anchorOrigin={{ vertical: "top", horizontal: "right" }}>
        <Alert
          severity={snack.severity}
          onClose={() => setSnack((p) => ({ ...p, open: false }))}
          sx={{ borderRadius: 2 }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </PageWrap>
  );
}

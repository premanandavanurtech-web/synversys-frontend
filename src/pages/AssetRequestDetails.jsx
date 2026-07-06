// pages/AssetRequestDetails.jsx
// ─── Changes ──────────────────────────────────────────────────────────────────
// • Child Request & Link Asset buttons shown to ALL users (not admin-only)
// • LinkAssetDialog replaced with Autocomplete asset picker (no raw ID input)
// • AssetContext used to fetch & display asset list in link dialog
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Typography,
  Chip,
  Button,
  Stack,
  IconButton,
  Skeleton,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Avatar,
  Tooltip,
  Paper,
  Grid,
  Divider,
  Collapse,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useMediaQuery,
  useTheme,
  Autocomplete,
} from "@mui/material";
import { styled, keyframes } from "@mui/material/styles";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowBack,
  CheckCircle,
  Cancel,
  Link as LinkIcon,
  HourglassEmpty,
  DoneAll,
  ContentCopy,
  ChildCare,
  Visibility,
  Email,
  AccountTree,
  Person,
  CalendarToday,
  InfoOutlined,
  ExpandMore,
  ExpandLess,
  Inventory2,
  Warning,
  TaskAlt,
  Refresh,
} from "@mui/icons-material";
import { useAssetRequest } from "../context/AssetRequestContext";
import { useAuth } from "../context/AuthContexts";
import { useAsset } from "../context/AssetContext";

// ─── Animations ────────────────────────────────────────────────────────────────
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// ─── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  bg: "#f0f4f7",
  surface: "#ffffff",
  border: "#e2e8ef",
  teal: "#146478",
  tealDark: "#08465a",
  tealLight: "#e6f4f2",
  tealMid: "#cce9e6",
  text: "#0d1b2a",
  textSub: "#475569",
  textMuted: "#94a3b8",
  red: "#dc2626",
  redBg: "#fef2f2",
  green: "#059669",
  greenBg: "#ecfdf5",
  amber: "#d97706",
  amberBg: "#fffbeb",
  blue: "#2563eb",
  blueBg: "#eff6ff",
  orange: "#ea580c",
};

// ─── Styled components ─────────────────────────────────────────────────────────
const PageWrap = styled(Box)({
  minHeight: "100vh",
  background: C.bg,
  paddingBottom: 60,
  animation: `${fadeUp} 0.28s ease both`,
});

const TopBar = styled(Box)(({ theme }) => ({
  background: C.surface,
  borderBottom: `1px solid ${C.border}`,
  padding: "12px 24px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: 12,
  
  width: "100%",
  marginLeft: 0,
  borderRadius: "12px",
  zIndex: 200,
  [theme.breakpoints.down("sm")]: { padding: "10px 12px" },
}));

const ContentWrap = styled(Box)(({ theme }) => ({
  padding: "24px 24px",
  [theme.breakpoints.down("sm")]: { padding: "14px 10px" },
}));

const SectionCard = styled(Paper)({
  borderRadius: 14,
  border: `1px solid ${C.border}`,
  overflow: "hidden",
  boxShadow: "none",
  marginBottom: 14,
  background: C.surface,
});

const SectionHead = styled(Box)({
  padding: "11px 18px",
  borderBottom: `1px solid ${C.border}`,
  background: "#f8fafc",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
});

const SectionTitle = ({ icon, children }) => (
  <Typography
    sx={{
      fontSize: 10.5,
      fontWeight: 800,
      textTransform: "uppercase",
      letterSpacing: "0.07em",
      color: C.textMuted,
      display: "flex",
      alignItems: "center",
      gap: 0.8,
    }}
  >
    {icon && React.cloneElement(icon, { sx: { fontSize: 14 } })}
    {children}
  </Typography>
);

const InfoRow = ({ label, children, noBorder }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "flex-start",
      py: 1.5,
      px: 2.25,
      borderBottom: noBorder ? "none" : `1px solid ${C.border}`,
      flexWrap: "wrap",
      gap: 1,
      "&:last-child": { borderBottom: "none" },
    }}
  >
    <Typography
      sx={{
        fontSize: 11,
        fontWeight: 700,
        color: C.textMuted,
        minWidth: 130,
        textTransform: "uppercase",
        letterSpacing: "0.04em",
        pt: 0.2,
        flexShrink: 0,
      }}
    >
      {label}
    </Typography>
    <Box
      sx={{
        flex: 1,
        minWidth: 140,
        fontSize: 13,
        fontWeight: 500,
        color: C.text,
      }}
    >
      {children}
    </Box>
  </Box>
);

// ─── Chip helpers ──────────────────────────────────────────────────────────────
const STATUS_CFG = {
  pending: {
    bg: C.amberBg,
    color: C.amber,
    icon: <HourglassEmpty sx={{ fontSize: 12 }} />,
    label: "Pending",
  },
  approved: {
    bg: C.greenBg,
    color: C.green,
    icon: <CheckCircle sx={{ fontSize: 12 }} />,
    label: "Approved",
  },
  rejected: {
    bg: C.redBg,
    color: C.red,
    icon: <Cancel sx={{ fontSize: 12 }} />,
    label: "Rejected",
  },
  completed: {
    bg: C.blueBg,
    color: C.blue,
    icon: <DoneAll sx={{ fontSize: 12 }} />,
    label: "Completed",
  },
};

const StatusChip = ({ status }) => {
  const c = STATUS_CFG[status?.toLowerCase()] || STATUS_CFG.pending;
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

const TypeChip = ({ type }) => {
  const color = TYPE_COLORS[type] || "#94a3b8";
  return (
    <Chip
      label={type || "other"}
      size="small"
      sx={{
        bgcolor: `${color}18`,
        color,
        fontWeight: 700,
        fontSize: "0.7rem",
        height: 24,
        textTransform: "capitalize",
        border: `1px solid ${color}28`,
      }}
    />
  );
};

const URGENCY_CFG = {
  low: { bg: "#f0fdf4", color: "#16a34a" },
  medium: { bg: "#fefce8", color: "#ca8a04" },
  high: { bg: "#fff7ed", color: "#f97316" },
  critical: { bg: C.redBg, color: C.red },
};

const UrgencyChip = ({ urgency }) => {
  const c = URGENCY_CFG[urgency] || URGENCY_CFG.medium;
  return (
    <Chip
      label={urgency || "medium"}
      size="small"
      sx={{
        bgcolor: c.bg,
        color: c.color,
        fontWeight: 700,
        fontSize: "0.7rem",
        height: 24,
        textTransform: "capitalize",
      }}
    />
  );
};

const assetStatusColor = (s) =>
  ({
    Available: C.green,
    "In Use": C.blue,
    "In Maintenance": C.amber,
    Retired: C.red,
    Lost: C.red,
    Disposed: C.textMuted,
  })[s] || C.textMuted;

// ─── Copyable ID ───────────────────────────────────────────────────────────────
const CopyId = ({ id }) => {
  const [copied, setCopied] = useState(false);
  if (!id || id === "—")
    return (
      <Typography
        sx={{ fontFamily: "monospace", fontSize: 12, color: C.textMuted }}
      >
        —
      </Typography>
    );
  const displayId =
    typeof id === "string" ? (id.length > 14 ? id.slice(-14) : id) : String(id);
  return (
    <Stack direction="row" alignItems="center" spacing={0.75}>
      <Typography
        sx={{ fontFamily: "monospace", fontSize: 12, color: C.textSub }}
      >
        {displayId}
      </Typography>
      <Tooltip title={copied ? "Copied!" : "Copy"}>
        <IconButton
          size="small"
          sx={{ p: 0.35 }}
          onClick={() => {
            navigator.clipboard?.writeText(id);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
          }}
        >
          <ContentCopy
            sx={{ fontSize: 11, color: copied ? C.green : C.textMuted }}
          />
        </IconButton>
      </Tooltip>
    </Stack>
  );
};

// ─── Timeline dot ──────────────────────────────────────────────────────────────
const TDot = ({ color, label, date, active }) => (
  <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ pb: 2 }}>
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        pt: 0.4,
      }}
    >
      <Box
        sx={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          bgcolor: active ? color : C.border,
          boxShadow: active ? `0 0 0 3px ${color}28` : "none",
        }}
      />
    </Box>
    <Box>
      <Typography
        sx={{
          fontSize: 12,
          fontWeight: 700,
          color: active ? color : C.textMuted,
        }}
      >
        {label}
      </Typography>
      <Typography sx={{ fontSize: 10.5, color: C.textMuted }}>
        {date}
      </Typography>
    </Box>
  </Stack>
);

// ─── Asset Autocomplete component ──────────────────────────────────────────────
function AssetAutocomplete({ value, onChange, assets, loading }) {
  return (
    <Box>
      <Typography
        variant="caption"
        fontWeight={700}
        color={C.textSub}
        sx={{ display: "block", mb: 0.75 }}
      >
        Select Asset *
      </Typography>
      <Autocomplete
        value={value}
        onChange={onChange}
        options={assets}
        loading={loading}
        getOptionLabel={(option) => {
          if (!option) return "";
          const name = option.name || option.assetName || "Unnamed";
          const tag = option.assetTag || option.serialNumber || "";
          return tag ? `${name} (${tag})` : name;
        }}
        isOptionEqualToValue={(option, val) => {
          if (!option || !val) return false;
          return (option._id || option.id) === (val._id || val.id);
        }}
        renderOption={(props, option) => {
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
                    bgcolor: "#f1f5f9",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Inventory2 sx={{ fontSize: 16, color: C.textMuted }} />
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
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                bgcolor: "#f8fafc",
              },
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
            bgcolor: C.greenBg,
            border: `1px solid ${C.green}28`,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <CheckCircle sx={{ fontSize: 14, color: C.green }} />
          <Typography variant="caption" fontWeight={600} color={C.green}>
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

// ─── Dialogs ───────────────────────────────────────────────────────────────────
function ApproveDialog({ open, onClose, onSubmit, submitting }) {
  const [notes, setNotes] = useState("");
  useEffect(() => {
    if (open) setNotes("");
  }, [open]);
  return (
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
              bgcolor: C.greenBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CheckCircle sx={{ color: C.green, fontSize: 18 }} />
          </Box>
          Approve Request
        </Stack>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 2 }}>
        <Alert
          severity="info"
          sx={{ mb: 2.5, borderRadius: 2, fontSize: 12.5 }}
        >
          This will approve the request and notify the requester.
        </Alert>
        <TextField
          fullWidth
          multiline
          rows={3}
          size="small"
          label="Approval Notes (Optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any notes for the requester…"
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
        />
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
          onClick={() => onSubmit(notes)}
          disabled={submitting}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
            bgcolor: C.green,
            "&:hover": { bgcolor: "#047857" },
          }}
        >
          {submitting ? (
            <CircularProgress size={17} sx={{ color: "#fff" }} />
          ) : (
            "Approve Request"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function RejectDialog({ open, onClose, onSubmit, submitting }) {
  const [reason, setReason] = useState("");
  const [err, setErr] = useState("");
  useEffect(() => {
    if (open) {
      setReason("");
      setErr("");
    }
  }, [open]);
  const handle = () => {
    if (!reason.trim()) {
      setErr("Rejection reason is required");
      return;
    }
    setErr("");
    onSubmit(reason);
  };
  return (
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
              bgcolor: C.redBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Cancel sx={{ color: C.red, fontSize: 18 }} />
          </Box>
          Reject Request
        </Stack>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 2 }}>
        <Alert
          severity="warning"
          sx={{ mb: 2, borderRadius: 2, fontSize: 12.5 }}
        >
          This action cannot be undone. Please provide a clear reason.
        </Alert>
        {err && (
          <Alert severity="error" sx={{ mb: 1.5, borderRadius: 2 }}>
            {err}
          </Alert>
        )}
        <TextField
          fullWidth
          multiline
          rows={4}
          size="small"
          label="Reason for Rejection *"
          value={reason}
          onChange={(e) => {
            setReason(e.target.value);
            setErr("");
          }}
          placeholder="Explain why this request is being rejected…"
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
        />
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
          color="error"
          onClick={handle}
          disabled={submitting}
          sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
        >
          {submitting ? (
            <CircularProgress size={17} sx={{ color: "#fff" }} />
          ) : (
            "Reject Request"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function CompleteDialog({ open, onClose, onSubmit, submitting }) {
  const [notes, setNotes] = useState("");
  useEffect(() => {
    if (open) setNotes("");
  }, [open]);
  return (
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
              bgcolor: C.blueBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <TaskAlt sx={{ color: C.blue, fontSize: 18 }} />
          </Box>
          Mark as Complete
        </Stack>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 2 }}>
        <Alert severity="info" sx={{ mb: 2, borderRadius: 2, fontSize: 12.5 }}>
          This marks the request as completed. The requester will be notified.
        </Alert>
        <TextField
          fullWidth
          multiline
          rows={3}
          size="small"
          label="Completion Notes (Optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Describe what was done…"
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
        />
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
          onClick={() => onSubmit(notes)}
          disabled={submitting}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
            bgcolor: C.blue,
            "&:hover": { bgcolor: "#1d4ed8" },
          }}
        >
          {submitting ? (
            <CircularProgress size={17} sx={{ color: "#fff" }} />
          ) : (
            "Complete Request"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Extract request data helper ───────────────────────────────────────────────
function extractRequestData(responseData) {
  if (!responseData) return null;
  if (responseData._id) return responseData;
  if (responseData?.data?.request?._id) return responseData.data.request;
  if (responseData?.data?._id) return responseData.data;
  if (responseData?.request?._id) return responseData.request;
  return null;
}

// ─── Main Component ────────────────────────────────────────────────────────────
const getLinkedAssetId = (asset) => {
  const raw = asset?.assetId || asset?.asset || asset;
  return typeof raw === "string" ? raw : raw?._id || raw?.id;
};

const getLinkedAssetName = (asset) => {
  const raw = asset?.assetId || asset?.asset || asset;
  if (raw && typeof raw === "object") {
    return raw.name || raw.assetName || raw.serialNumber || raw.assetTag;
  }
  return asset?.assetName || asset?.name;
};

const CompactLinkRow = ({
  icon,
  title,
  subtitle,
  chip,
  color = C.blue,
  bg = C.blueBg,
  onView,
}) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 1,
      py: 0.85,
      "& + &": { borderTop: `1px dashed ${C.border}` },
    }}
  >
    <Box
      sx={{
        width: 28,
        height: 28,
        borderRadius: 1.5,
        bgcolor: bg,
        color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {React.cloneElement(icon, { sx: { fontSize: 14 } })}
    </Box>
    <Box sx={{ minWidth: 0, flex: 1 }}>
      <Typography
        sx={{
          fontSize: 12,
          fontWeight: 700,
          color: C.text,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {title}
      </Typography>
      {subtitle && (
        <Typography
          sx={{
            fontSize: 10.5,
            color: C.textMuted,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {subtitle}
        </Typography>
      )}
    </Box>
    {chip}
    {onView && (
      <Tooltip title="View details">
        <IconButton
          size="small"
          onClick={onView}
          sx={{
            width: 28,
            height: 28,
            borderRadius: 1.5,
            bgcolor: "#f1f5f9",
            flexShrink: 0,
            "&:hover": { bgcolor: "#e2e8f0" },
          }}
        >
          <Visibility sx={{ fontSize: 15, color: C.textSub }} />
        </IconButton>
      </Tooltip>
    )}
  </Box>
);

export default function AssetRequestDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    getRequestById,
    approveRequest,
    rejectRequest,
    linkAsset,
    createChildRequest,
    completeRequest,
  } = useAssetRequest();
  const { user, isAdmin: authIsAdmin } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [request, setRequest] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [pageError, setPageError] = useState(null);
  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [childOpen, setChildOpen] = useState(false);
  const [completeOpen, setCompleteOpen] = useState(false);
  const [linkedExpanded, setLinkedExpanded] = useState(true);
  const [childrenExpanded, setChildrenExpanded] = useState(true);

  const userIsAdmin = useMemo(() => {
    if (typeof authIsAdmin === "function") return authIsAdmin();
    return (
      authIsAdmin || user?.role === "admin" || user?.role === "super_admin"
    );
  }, [authIsAdmin, user]);

  const showSnack = (msg, sev = "success") =>
    setSnack({ open: true, message: msg, severity: sev });

  const fmt = (iso, withTime = false) => {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
      });
    } catch {
      return "—";
    }
  };

  const fetchRequest = useCallback(async () => {
    setInitialLoading(true);
    setPageError(null);
    try {
      const raw = await getRequestById(id);
      const req = extractRequestData(raw) ?? raw;
      if (!req?._id)
        throw new Error("Request not found or invalid data structure received");
      setRequest(req);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load request details";
      setPageError(msg);
      showSnack(msg, "error");
    } finally {
      setInitialLoading(false);
    }
  }, [id, getRequestById]);

  useEffect(() => {
    if (id) fetchRequest();
  }, [fetchRequest, id]);

  const handleApprove = async (approvalNotes) => {
    setSubmitting(true);
    try {
      await approveRequest(id, approvalNotes);
      showSnack("Request approved successfully");
      setApproveOpen(false);
      await fetchRequest();
    } catch (err) {
      showSnack(err?.response?.data?.message || "Failed to approve", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async (reason) => {
    setSubmitting(true);
    try {
      await rejectRequest(id, reason);
      showSnack("Request rejected");
      setRejectOpen(false);
      await fetchRequest();
    } catch (err) {
      showSnack(err?.response?.data?.message || "Failed to reject", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleComplete = async (completionNotes) => {
    setSubmitting(true);
    try {
      await completeRequest(id, completionNotes);
      showSnack("Request marked as complete");
      setCompleteOpen(false);
      await fetchRequest();
    } catch (err) {
      showSnack(err?.response?.data?.message || "Failed to complete", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLink = async (childAssetId, relationshipType) => {
    setSubmitting(true);
    try {
      await linkAsset(id, childAssetId, relationshipType);
      showSnack("Asset linked successfully!");
      setLinkOpen(false);
      await fetchRequest();
    } catch (err) {
      showSnack(
        err?.response?.data?.message || "Failed to link asset",
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateChild = async (formData) => {
    setSubmitting(true);
    try {
      await createChildRequest(id, formData);
      showSnack("Child request created successfully");
      setChildOpen(false);
      await fetchRequest();
    } catch (err) {
      showSnack(
        err?.response?.data?.message || "Failed to create child request",
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const statusLower = request?.status?.toLowerCase();
  const isPending = statusLower === "pending";
  const isApproved = statusLower === "approved";

  const canComplete =
    isApproved &&
    (userIsAdmin ||
      request?.requestedBy?._id === user?._id ||
      request?.requestedBy?._id === user?.id);
  const requesterEmail = request?.requestedBy?.email || "";
  const requesterInitial = requesterEmail.charAt(0).toUpperCase() || "?";
  const requesterName = requesterEmail.split("@")[0] || "Unknown User";
  const assetName =
    request?.assetId?.name ||
    request?.assetId?.assetName ||
    (typeof request?.assetId === "string" ? "—" : "—");
  const assetIdValue =
    request?.assetId?._id ||
    (typeof request?.assetId === "string" ? request.assetId : "—");

  if (initialLoading) {
    return (
      <PageWrap>
        <TopBar>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <IconButton
              onClick={() => navigate(-1)}
              sx={{ border: `1px solid ${C.border}`, borderRadius: 2 }}
            >
              <ArrowBack sx={{ fontSize: 17 }} />
            </IconButton>
            <Skeleton width={200} height={22} />
          </Stack>
        </TopBar>
        <ContentWrap>
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              {[1, 2, 3].map((i) => (
                <Skeleton
                  key={i}
                  variant="rounded"
                  height={130}
                  sx={{ mb: 2, borderRadius: 2 }}
                />
              ))}
            </Grid>
            <Grid item xs={12} md={4}>
              {[1, 2].map((i) => (
                <Skeleton
                  key={i}
                  variant="rounded"
                  height={130}
                  sx={{ mb: 2, borderRadius: 2 }}
                />
              ))}
            </Grid>
          </Grid>
        </ContentWrap>
      </PageWrap>
    );
  }

  if (pageError) {
    return (
      <PageWrap>
        <TopBar>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <IconButton
              onClick={() => navigate(-1)}
              sx={{ border: `1px solid ${C.border}`, borderRadius: 2 }}
            >
              <ArrowBack sx={{ fontSize: 17 }} />
            </IconButton>
            <Typography fontWeight={700}>Asset Request Details</Typography>
          </Stack>
        </TopBar>
        <ContentWrap>
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {pageError}
          </Alert>
          <Stack direction="row" spacing={1.5}>
            <Button
              variant="outlined"
              onClick={() => navigate(-1)}
              sx={{ borderRadius: 2, textTransform: "none" }}
            >
              ← Go Back
            </Button>
            <Button
              variant="contained"
              startIcon={<Refresh />}
              onClick={fetchRequest}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                bgcolor: C.teal,
                "&:hover": { bgcolor: C.tealDark },
              }}
            >
              Retry
            </Button>
          </Stack>
        </ContentWrap>
      </PageWrap>
    );
  }

  if (!request) return null;

  return (
    <>
      {/* ── Top Bar ── */}
      <TopBar>
        <Stack
          direction="row"
          alignItems="center"
          spacing={1.5}
          flex={1}
          minWidth={0}
        >
          <IconButton
            onClick={() => navigate(-1)}
            sx={{
              border: `1px solid ${C.border}`,
              borderRadius: 2,
              flexShrink: 0,
            }}
          >
            <ArrowBack sx={{ fontSize: 17 }} />
          </IconButton>
          <Box minWidth={0}>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              flexWrap="wrap"
            >
              <Typography
                sx={{
                  fontSize: { xs: 14, sm: 16 },
                  fontWeight: 800,
                  color: C.text,
                }}
              >
                Request Details
              </Typography>
              <StatusChip status={request.status} />
              {request.isChildRequest && (
                <Chip
                  label="Child"
                  size="small"
                  icon={<ChildCare sx={{ fontSize: 11 }} />}
                  sx={{
                    height: 22,
                    fontSize: 10,
                    bgcolor: C.blueBg,
                    color: C.blue,
                  }}
                />
              )}
            </Stack>
            <Typography
              sx={{
                fontFamily: "monospace",
                fontSize: 10,
                color: C.textMuted,
                mt: 0.25,
              }}
            >
              ID: {request._id}
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={0.75} flexShrink={0} flexWrap="wrap">
          {canComplete && (
            <Button
              variant="outlined"
              size="small"
              onClick={() => setCompleteOpen(true)}
              startIcon={
                !isMobile ? <TaskAlt sx={{ fontSize: 15 }} /> : undefined
              }
              sx={{
                borderRadius: 2.5,
                textTransform: "none",
                fontWeight: 600,
                fontSize: 11,
                borderColor: C.blue,
                color: C.blue,
                "&:hover": { bgcolor: C.blueBg },
              }}
            >
              {isMobile ? <TaskAlt sx={{ fontSize: 16 }} /> : "Complete"}
            </Button>
          )}
          {userIsAdmin && isPending && (
            <>
              <Button
                variant="outlined"
                color="error"
                size="small"
                onClick={() => setRejectOpen(true)}
                startIcon={
                  !isMobile ? <Cancel sx={{ fontSize: 15 }} /> : undefined
                }
                sx={{
                  borderRadius: 2.5,
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: 11,
                }}
              >
                {isMobile ? <Cancel sx={{ fontSize: 16 }} /> : "Reject"}
              </Button>
              <Button
                variant="contained"
                size="small"
                onClick={() => setApproveOpen(true)}
                startIcon={
                  !isMobile ? <CheckCircle sx={{ fontSize: 15 }} /> : undefined
                }
                sx={{
                  borderRadius: 2.5,
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: 11,
                  bgcolor: C.green,
                  "&:hover": { bgcolor: "#047857" },
                }}
              >
                {isMobile ? <CheckCircle sx={{ fontSize: 16 }} /> : "Approve"}
              </Button>
            </>
          )}
        </Stack>
      </TopBar>

      <ContentWrap>
        <Grid container spacing={2}>
          {/* ── Left column ── */}
          <Grid item xs={12} md={8} sx={{ width: "600px" }}>
            {/* Requester card */}
            <SectionCard>
              <Box
                sx={{
                  p: 2.5,
                  background: `linear-gradient(135deg, ${C.tealLight} 0%, #f8fffd 100%)`,
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar
                    sx={{
                      width: 48,
                      height: 48,
                      bgcolor: C.teal,
                      fontSize: 18,
                      fontWeight: 700,
                    }}
                  >
                    {requesterInitial}
                  </Avatar>
                  <Box flex={1} minWidth={0}>
                    <Typography
                      fontWeight={800}
                      fontSize={15}
                      color={C.text}
                      noWrap
                    >
                      {requesterName}
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={0.75}
                      alignItems="center"
                      mt={0.3}
                    >
                      <Email sx={{ fontSize: 12, color: C.textMuted }} />
                      <Typography
                        sx={{ fontSize: 12, color: C.textSub }}
                        noWrap
                      >
                        {requesterEmail || "No email provided"}
                      </Typography>
                    </Stack>
                  </Box>
                  <Box sx={{ textAlign: "right", flexShrink: 0 }}>
                    <Typography
                      sx={{
                        fontSize: 10,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        color: C.textMuted,
                        letterSpacing: "0.05em",
                      }}
                    >
                      Submitted
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: C.text,
                        mt: 0.25,
                      }}
                    >
                      {fmt(request.createdAt, true)}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </SectionCard>

            {/* Asset info */}
            <SectionCard>
              <SectionHead>
                <SectionTitle icon={<Inventory2 />}>
                  Asset Information
                </SectionTitle>
              </SectionHead>
              <InfoRow label="Asset Name">
                <Typography sx={{ fontWeight: 700, fontSize: 13.5 }}>
                  {assetName}
                </Typography>
              </InfoRow>
              <InfoRow label="Asset ID">
                <CopyId id={assetIdValue} />
              </InfoRow>
              {request.assetId?.status && (
                <InfoRow label="Asset Status">
                  <Chip
                    label={request.assetId.status}
                    size="small"
                    sx={{
                      bgcolor:
                        request.assetId.status === "Active"
                          ? C.greenBg
                          : C.amberBg,
                      color:
                        request.assetId.status === "Active" ? C.green : C.amber,
                      fontWeight: 700,
                      fontSize: 10.5,
                      height: 22,
                    }}
                  />
                </InfoRow>
              )}
              {request.assetId?.serialNumber && (
                <InfoRow label="Serial No.">
                  <Typography sx={{ fontFamily: "monospace", fontSize: 12 }}>
                    {request.assetId.serialNumber}
                  </Typography>
                </InfoRow>
              )}
              {request.assetId?.category && (
                <InfoRow label="Category">
                  <Typography sx={{ fontSize: 13 }}>
                    {request.assetId.category}
                  </Typography>
                </InfoRow>
              )}
              {request.assetId?.currentLocation && (
                <InfoRow label="Location" noBorder>
                  <Typography sx={{ fontSize: 13 }}>
                    {request.assetId.currentLocation}
                  </Typography>
                </InfoRow>
              )}
            </SectionCard>

            {/* Request info */}
            <SectionCard>
              <SectionHead>
                <SectionTitle icon={<InfoOutlined />}>
                  Request Information
                </SectionTitle>
              </SectionHead>
              <InfoRow label="Type">
                <TypeChip type={request.requestType} />
              </InfoRow>
              <InfoRow label="Urgency">
                <UrgencyChip urgency={request.urgency} />
              </InfoRow>
              <InfoRow label="Status">
                <StatusChip status={request.status} />
              </InfoRow>
              <InfoRow label="Description">
                <Typography
                  sx={{
                    fontSize: 13,
                    lineHeight: 1.7,
                    color: request.description ? C.text : C.textMuted,
                  }}
                >
                  {request.description || "No description provided"}
                </Typography>
              </InfoRow>
              {request.metadata?.approvalNotes && (
                <InfoRow label="Approval Notes">
                  <Paper
                    sx={{
                      p: 1.5,
                      bgcolor: C.greenBg,
                      borderRadius: 2,
                      border: `1px solid ${C.green}28`,
                    }}
                  >
                    <Typography
                      sx={{ fontSize: 12.5, color: "#047857", lineHeight: 1.6 }}
                    >
                      {request.metadata.approvalNotes}
                    </Typography>
                  </Paper>
                </InfoRow>
              )}
              {request.rejectionReason && (
                <InfoRow label="Rejection Reason">
                  <Paper
                    sx={{
                      p: 1.5,
                      bgcolor: C.redBg,
                      borderRadius: 2,
                      border: `1px solid ${C.red}28`,
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="flex-start">
                      <Warning
                        sx={{
                          fontSize: 15,
                          color: C.red,
                          mt: 0.25,
                          flexShrink: 0,
                        }}
                      />
                      <Typography
                        sx={{
                          fontSize: 12.5,
                          color: "#b91c1c",
                          lineHeight: 1.6,
                        }}
                      >
                        {request.rejectionReason}
                      </Typography>
                    </Stack>
                  </Paper>
                </InfoRow>
              )}
              {request.completionNotes && (
                <InfoRow label="Completion Notes" noBorder>
                  <Paper
                    sx={{
                      p: 1.5,
                      bgcolor: C.blueBg,
                      borderRadius: 2,
                      border: `1px solid ${C.blue}28`,
                    }}
                  >
                    <Typography
                      sx={{ fontSize: 12.5, color: "#1d4ed8", lineHeight: 1.6 }}
                    >
                      {request.completionNotes}
                    </Typography>
                  </Paper>
                </InfoRow>
              )}
            </SectionCard>

            {/* Linked Assets */}
            {/* <SectionCard>
              <SectionHead
                sx={{ cursor: "pointer" }}
                onClick={() => setLinkedExpanded((p) => !p)}
              >
                <SectionTitle icon={<LinkIcon />}>
                  Linked Assets
                  {request.metadata?.childAssets?.length > 0 && (
                    <Chip
                      label={request.metadata.childAssets.length}
                      size="small"
                      sx={{
                        ml: 1,
                        height: 17,
                        fontSize: 9.5,
                        bgcolor: C.greenBg,
                        color: C.green,
                      }}
                    />
                  )}
                </SectionTitle>
                <IconButton size="small">
                  {linkedExpanded ? (
                    <ExpandLess sx={{ fontSize: 17 }} />
                  ) : (
                    <ExpandMore sx={{ fontSize: 17 }} />
                  )}
                </IconButton>
              </SectionHead>
              <Collapse in={linkedExpanded}>
                {!request.metadata?.childAssets?.length ? (
                  <Box sx={{ p: 3, textAlign: "center" }}>
                    <Typography sx={{ fontSize: 12.5, color: C.textMuted }}>
                      No assets linked yet
                    </Typography>
                   
                    <Button
                      size="small"
                      startIcon={<LinkIcon sx={{ fontSize: 13 }} />}
                      onClick={() => setLinkOpen(true)}
                      sx={{
                        mt: 1.25,
                        borderRadius: 2,
                        textTransform: "none",
                        fontSize: 11.5,
                        color: C.green,
                        border: `1px solid ${C.green}`,
                        "&:hover": { bgcolor: C.greenBg },
                      }}
                    >
                      Link an Asset
                    </Button>
                  </Box>
                ) : (
                  request.metadata.childAssets.map((asset, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        px: 2.5,
                        py: 1.5,
                        borderBottom:
                          idx < request.metadata.childAssets.length - 1
                            ? `1px solid ${C.border}`
                            : "none",
                      }}
                    >
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        flexWrap="wrap"
                        gap={1}
                      >
                        <Stack
                          direction="row"
                          spacing={1.5}
                          alignItems="center"
                        >
                          <Box
                            sx={{
                              width: 30,
                              height: 30,
                              borderRadius: 2,
                              bgcolor: C.greenBg,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Inventory2 sx={{ fontSize: 15, color: C.green }} />
                          </Box>
                          <Box>
                            <CopyId
                              id={
                                typeof asset.assetId === "string"
                                  ? asset.assetId
                                  : asset.assetId?._id
                              }
                            />
                            <Typography
                              sx={{ fontSize: 10.5, color: C.textMuted }}
                            >
                              {fmt(asset.linkedAt)}
                            </Typography>
                          </Box>
                        </Stack>
                        <Chip
                          label={asset.relationshipType || "related"}
                          size="small"
                          sx={{
                            textTransform: "capitalize",
                            fontSize: 10.5,
                            height: 21,
                          }}
                        />
                      </Stack>
                    </Box>
                  ))
                )}
              </Collapse>
            </SectionCard> */}

            {/* Child Requests */}
            {/* <SectionCard>
              <SectionHead
                sx={{ cursor: "pointer" }}
                onClick={() => setChildrenExpanded((p) => !p)}
              >
                <SectionTitle icon={<AccountTree />}>
                  Child Requests
                  {request.childRequests?.length > 0 && (
                    <Chip
                      label={request.childRequests.length}
                      size="small"
                      sx={{
                        ml: 1,
                        height: 17,
                        fontSize: 9.5,
                        bgcolor: C.blueBg,
                        color: C.blue,
                      }}
                    />
                  )}
                </SectionTitle>
                <IconButton size="small">
                  {childrenExpanded ? (
                    <ExpandLess sx={{ fontSize: 17 }} />
                  ) : (
                    <ExpandMore sx={{ fontSize: 17 }} />
                  )}
                </IconButton>
              </SectionHead>
              <Collapse in={childrenExpanded}>
                {!request.childRequests?.length ? (
                  <Box sx={{ p: 3, textAlign: "center" }}>
                    <Typography sx={{ fontSize: 12.5, color: C.textMuted }}>
                      No child requests yet
                    </Typography>
                
                    <Button
                      size="small"
                      startIcon={<AccountTree sx={{ fontSize: 13 }} />}
                      onClick={() => setChildOpen(true)}
                      sx={{
                        mt: 1.25,
                        borderRadius: 2,
                        textTransform: "none",
                        fontSize: 11.5,
                        color: C.blue,
                        border: `1px solid ${C.blue}`,
                        "&:hover": { bgcolor: C.blueBg },
                      }}
                    >
                      Add Child Request
                    </Button>
                  </Box>
                ) : (
                  request.childRequests.map((child, idx) => {
                    const cId = typeof child === "string" ? child : child._id;
                    const cType =
                      typeof child === "object" ? child.requestType : null;
                    const cStatus =
                      typeof child === "object" ? child.status : "pending";
                    const cUrg =
                      typeof child === "object" ? child.urgency : null;
                    return (
                      <Box
                        key={idx}
                        onClick={() =>
                          typeof child === "object" &&
                          navigate(`/admin/asset-requests/${cId}`)
                        }
                        sx={{
                          px: 2.5,
                          py: 1.5,
                          borderBottom:
                            idx < request.childRequests.length - 1
                              ? `1px solid ${C.border}`
                              : "none",
                          cursor:
                            typeof child === "object" ? "pointer" : "default",
                          "&:hover": { bgcolor: "#f8fffe" },
                        }}
                      >
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                          flexWrap="wrap"
                          gap={1}
                        >
                          <Stack
                            direction="row"
                            spacing={1.5}
                            alignItems="center"
                          >
                            <Box
                              sx={{
                                width: 30,
                                height: 30,
                                borderRadius: 2,
                                bgcolor: C.blueBg,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <ChildCare sx={{ fontSize: 15, color: C.blue }} />
                            </Box>
                            <Box>
                              <Typography
                                sx={{
                                  fontFamily: "monospace",
                                  fontSize: 11,
                                  color: C.textSub,
                                }}
                              >
                                #{cId?.slice(-12)}
                              </Typography>
                              {typeof child === "object" && child.createdAt && (
                                <Typography
                                  sx={{ fontSize: 10.5, color: C.textMuted }}
                                >
                                  {fmt(child.createdAt)}
                                </Typography>
                              )}
                            </Box>
                          </Stack>
                          <Stack direction="row" spacing={0.75} flexWrap="wrap">
                            {cType && <TypeChip type={cType} />}
                            {cUrg && <UrgencyChip urgency={cUrg} />}
                            <StatusChip status={cStatus} />
                          </Stack>
                        </Stack>
                      </Box>
                    );
                  })
                )}
              </Collapse>
            </SectionCard> */}
          </Grid>

          {/* ── Sidebar ── */}
          <Grid item xs={12} md={4} sx={{ width: "485px" }}>
            {/* Timeline */}
            <SectionCard>
              <SectionHead>
                <SectionTitle icon={<CalendarToday />}>Timeline</SectionTitle>
              </SectionHead>
              <Box sx={{ p: 2.25 }}>
                <TDot
                  color={C.teal}
                  label="Request Created"
                  date={fmt(request.createdAt, true)}
                  active
                />
                <TDot
                  color={C.green}
                  label="Approved"
                  date={
                    request.approvedAt
                      ? fmt(request.approvedAt, true)
                      : "Awaiting approval"
                  }
                  active={!!request.approvedAt}
                />
                {statusLower === "rejected" && (
                  <TDot
                    color={C.red}
                    label="Rejected"
                    date={
                      request.updatedAt ? fmt(request.updatedAt, true) : "—"
                    }
                    active
                  />
                )}
                <TDot
                  color={C.blue}
                  label="Completed"
                  date={
                    request.completedAt
                      ? fmt(request.completedAt, true)
                      : "Not yet"
                  }
                  active={!!request.completedAt}
                />
                <TDot
                  color={C.textMuted}
                  label="Last Updated"
                  date={fmt(request.updatedAt, true)}
                  active
                />
              </Box>
            </SectionCard>

            {/* Approval info */}
            {(request.approvedBy || request.approvedAt) && (
              <SectionCard>
                <SectionHead>
                  <SectionTitle icon={<CheckCircle />}>Approval</SectionTitle>
                </SectionHead>
                {request.approvedBy?.email && (
                  <InfoRow label="Approved By">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Avatar
                        sx={{
                          width: 24,
                          height: 24,
                          bgcolor: C.teal,
                          fontSize: 10,
                        }}
                      >
                        {request.approvedBy.email.charAt(0).toUpperCase()}
                      </Avatar>
                      <Typography sx={{ fontSize: 12.5 }}>
                        {request.approvedBy.email}
                      </Typography>
                    </Stack>
                  </InfoRow>
                )}
                <InfoRow label="Approved At" noBorder>
                  <Typography
                    sx={{ fontSize: 12.5, color: C.green, fontWeight: 600 }}
                  >
                    {fmt(request.approvedAt, true)}
                  </Typography>
                </InfoRow>
              </SectionCard>
            )}

            {/* Additional info */}
            <SectionCard>
              <SectionHead>
                <SectionTitle icon={<Person />}>Additional Info</SectionTitle>
              </SectionHead>
              <InfoRow label="Admin ID">
                <CopyId
                  id={
                    typeof request.adminId === "string"
                      ? request.adminId
                      : request.adminId?._id
                  }
                />
              </InfoRow>
              <InfoRow label="Is Child">
                <Chip
                  label={request.isChildRequest ? "Yes" : "No"}
                  size="small"
                  sx={{
                    bgcolor: request.isChildRequest ? C.blueBg : "#f1f5f9",
                    color: request.isChildRequest ? C.blue : C.textMuted,
                    fontSize: 10.5,
                    height: 21,
                  }}
                />
              </InfoRow>
              {request.parentRequestId && (
                <InfoRow label="Parent Request">
                  <Box
                    sx={{ cursor: "pointer" }}
                    onClick={() => {
                      const pid =
                        typeof request.parentRequestId === "string"
                          ? request.parentRequestId
                          : request.parentRequestId?._id;
                      navigate(`/admin/asset-requests/${pid}`);
                    }}
                  >
                    <CopyId
                      id={
                        typeof request.parentRequestId === "string"
                          ? request.parentRequestId
                          : request.parentRequestId?._id
                      }
                    />
                  </Box>
                </InfoRow>
              )}
              <InfoRow label="Children">
                <Stack spacing={0.5}>
                  <Typography sx={{ fontWeight: 700, fontSize: 12.5 }}>
                    {request.childRequests?.length || 0}
                  </Typography>
                  {!!request.childRequests?.length && (
                    <Box>
                      {request.childRequests.map((child, idx) => {
                        const childId =
                          typeof child === "string" ? child : child?._id;
                        const childType =
                          typeof child === "object" ? child.requestType : null;
                        const childStatus =
                          typeof child === "object" ? child.status : null;
                        return (
                          <CompactLinkRow
                            key={childId || idx}
                            icon={<ChildCare />}
                            title={
                              childType
                                ? childType.replace(/_/g, " ")
                                : "Child Request"
                            }
                            subtitle={childId ? `#${childId.slice(-12)}` : null}
                            color={C.blue}
                            bg={C.blueBg}
                            chip={
                              childStatus ? (
                                <StatusChip status={childStatus} />
                              ) : null
                            }
                            onView={
                              childId
                                ? () =>
                                    navigate(`/admin/asset-requests/${childId}`)
                                : null
                            }
                          />
                        );
                      })}
                    </Box>
                  )}
                </Stack>
              </InfoRow>
              <InfoRow label="Linked Assets" noBorder>
                <Stack spacing={0.5}>
                  <Typography sx={{ fontWeight: 700, fontSize: 12.5 }}>
                    {request.metadata?.childAssets?.length || 0}
                  </Typography>
                  {!!request.metadata?.childAssets?.length && (
                    <Box>
                      {request.metadata.childAssets.map((asset, idx) => {
                        const linkedAssetId = getLinkedAssetId(asset);
                        const linkedAssetName =
                          getLinkedAssetName(asset) || "Linked Asset";
                        return (
                          <CompactLinkRow
                            key={linkedAssetId || idx}
                            icon={<Inventory2 />}
                            title={linkedAssetName}
                            subtitle={
                              linkedAssetId
                                ? `#${linkedAssetId.slice(-12)}`
                                : null
                            }
                            color={C.green}
                            bg={C.greenBg}
                            chip={
                              asset?.relationshipType ? (
                                <Chip
                                  label={asset.relationshipType}
                                  size="small"
                                  sx={{
                                    height: 21,
                                    fontSize: 10.5,
                                    textTransform: "capitalize",
                                  }}
                                />
                              ) : null
                            }
                            onView={
                              linkedAssetId
                                ? () =>
                                    navigate(
                                      `/admin/assets/view/${linkedAssetId}`
                                    )
                                : null
                            }
                          />
                        );
                      })}
                    </Box>
                  )}
                </Stack>
              </InfoRow>
            </SectionCard>

            {/* Completion info */}
            {(request.completedAt || request.completionNotes) && (
              <SectionCard>
                <SectionHead>
                  <SectionTitle icon={<DoneAll />}>Completion</SectionTitle>
                </SectionHead>
                {request.completedAt && (
                  <InfoRow label="Completed At">
                    <Typography
                      sx={{ fontSize: 12.5, color: C.blue, fontWeight: 600 }}
                    >
                      {fmt(request.completedAt, true)}
                    </Typography>
                  </InfoRow>
                )}
                {request.completionNotes && (
                  <InfoRow label="Notes" noBorder>
                    <Typography sx={{ fontSize: 12.5 }}>
                      {request.completionNotes}
                    </Typography>
                  </InfoRow>
                )}
              </SectionCard>
            )}
          </Grid>
        </Grid>

        {/* Bottom action row */}
        <Stack
          direction="row"
          justifyContent="flex-end"
          spacing={1.5}
          mt={3}
          mb={5}
          flexWrap="wrap"
        >
          <Button
            variant="outlined"
            onClick={() => navigate(-1)}
            sx={{ borderRadius: 2.5, textTransform: "none", fontWeight: 600 }}
          >
            ← Back
          </Button>
          {canComplete && (
            <Button
              variant="outlined"
              onClick={() => setCompleteOpen(true)}
              startIcon={<TaskAlt />}
              sx={{
                borderRadius: 2.5,
                textTransform: "none",
                fontWeight: 600,
                borderColor: C.blue,
                color: C.blue,
                "&:hover": { bgcolor: C.blueBg },
              }}
            >
              Complete
            </Button>
          )}
          {userIsAdmin && isPending && (
            <>
              <Button
                variant="outlined"
                color="error"
                startIcon={<Cancel />}
                onClick={() => setRejectOpen(true)}
                sx={{
                  borderRadius: 2.5,
                  textTransform: "none",
                  fontWeight: 600,
                }}
              >
                Reject
              </Button>
              <Button
                variant="contained"
                startIcon={<CheckCircle />}
                onClick={() => setApproveOpen(true)}
                sx={{
                  borderRadius: 2.5,
                  textTransform: "none",
                  fontWeight: 600,
                  bgcolor: C.green,
                  "&:hover": { bgcolor: "#047857" },
                }}
              >
                Approve
              </Button>
            </>
          )}
        </Stack>
      </ContentWrap>

      {/* ── Dialogs ── */}
      <ApproveDialog
        open={approveOpen}
        onClose={() => setApproveOpen(false)}
        onSubmit={handleApprove}
        submitting={submitting}
      />
      <RejectDialog
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        onSubmit={handleReject}
        submitting={submitting}
      />
      <CompleteDialog
        open={completeOpen}
        onClose={() => setCompleteOpen(false)}
        onSubmit={handleComplete}
        submitting={submitting}
      />
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        onClose={() => setSnack((p) => ({ ...p, open: false }))}
        sx={{
          bottom: { xs: 20, sm: 28 },
          "& .MuiSnackbarContent-root": {
            p: 0,
            bgcolor: "transparent",
            boxShadow: "none",
          },
        }}
      >
        <Alert
          severity={snack.severity}
          onClose={() => setSnack((p) => ({ ...p, open: false }))}
          variant="filled"
          sx={{
            minWidth: { xs: "calc(100vw - 48px)", sm: 266 },
            maxWidth: "calc(100vw - 32px)",
            borderRadius: 2,
            px: 2,
            py: 1.2,
            alignItems: "center",
            fontSize: 14,
            fontWeight: 600,
            boxShadow: "0 12px 28px rgba(15, 23, 42, 0.14)",
            ...(snack.severity === "success" && {
              bgcolor: "#ecfdf5",
              color: "#14532d",
              "& .MuiAlert-icon": { color: "#16a34a" },
              "& .MuiAlert-action .MuiIconButton-root": { color: "#14532d" },
            }),
            ...(snack.severity === "error" && {
              bgcolor: "#fef2f2",
              color: "#991b1b",
              "& .MuiAlert-icon": { color: "#dc2626" },
              "& .MuiAlert-action .MuiIconButton-root": { color: "#991b1b" },
            }),
            "& .MuiAlert-icon": {
              mr: 1.25,
              p: 0,
              fontSize: 24,
            },
            "& .MuiAlert-message": {
              p: 0,
              lineHeight: 1.4,
            },
            "& .MuiAlert-action": {
              alignItems: "center",
              p: 0,
              pl: 1.5,
              mr: -0.5,
            },
          }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </>
  );
}

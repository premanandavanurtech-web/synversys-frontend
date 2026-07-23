// pages/admin/CloneChecklist.jsx - Fully Responsive with All Issues Fixed
// + View Details dialog so users can inspect a clone's fields/description/status
//   before (or instead of) cloning it again.

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Paper,
  alpha,
  useMediaQuery,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Stack,
  Pagination,
  Dialog,
  DialogContent,
  DialogActions,
  CircularProgress,
  Snackbar,
  Alert,
  Skeleton,
  Avatar,
  Divider,
  Fade,
  Grid,
  Drawer,
  useTheme,
} from "@mui/material";
import { createTheme, ThemeProvider, styled } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { useChecklistBuilder } from "../context/ChecklistBuilderContext";
import AssetSearchField from "../components/AssetSearchField";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import SecurityIcon from "@mui/icons-material/Security";
import ConstructionIcon from "@mui/icons-material/Construction";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import VerifiedIcon from "@mui/icons-material/Verified";
import AssignmentIcon from "@mui/icons-material/AssignmentTurnedIn";
import RefreshIcon from "@mui/icons-material/Refresh";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DescriptionIcon from "@mui/icons-material/Description";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PublicIcon from "@mui/icons-material/Public";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import TagIcon from "@mui/icons-material/Tag";
import LayersIcon from "@mui/icons-material/Layers";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CategoryIcon from "@mui/icons-material/Category";
import ListAltIcon from "@mui/icons-material/ListAlt";
import MenuIcon from "@mui/icons-material/Menu";
import VisibilityIcon from "@mui/icons-material/Visibility";

const appTheme = createTheme({
  palette: {
    primary: { main: "#0d4a5c", dark: "#092f3a", light: "#e4f1f5" },
    success: { main: "#0A5C4B", light: "#e6f4f0" },
    error: { main: "#C73A2B", light: "#fdf0ee" },
    warning: { main: "#B96F0F", light: "#fdf4e7" },
    info: { main: "#2E7D8A", light: "#e8f4f6" },
    text: { primary: "#111d22", secondary: "#4e6872", disabled: "#98b3bc" },
    background: { default: "#f2f7f9", paper: "#ffffff" },
    divider: "#dde8ec",
  },
  typography: { fontFamily: "'Sora', 'DM Sans', system-ui, sans-serif", button: { textTransform: "none", fontWeight: 600 } },
  shape: { borderRadius: 14 },
  components: { 
    MuiButton: { styleOverrides: { root: { boxShadow: "none", "&:hover": { boxShadow: "none" } } } }, 
    MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } }, 
    MuiOutlinedInput: { styleOverrides: { root: { borderRadius: 12 } } }, 
    MuiDialog: { styleOverrides: { paper: { borderRadius: 20 } } } 
  },
});

const TH = styled(TableCell)(({ theme }) => ({ 
  padding: "11px 16px", 
  fontSize: 11, 
  fontWeight: 700, 
  letterSpacing: "0.07em", 
  textTransform: "uppercase", 
  color: theme.palette.text.disabled, 
  backgroundColor: alpha(theme.palette.background.default, 0.9), 
  borderBottom: `1.5px solid ${theme.palette.divider}`, 
  whiteSpace: "nowrap" 
}));

const TD = styled(TableCell)(({ theme }) => ({ 
  padding: "13px 16px", 
  fontSize: 13, 
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.6)}`, 
  verticalAlign: "middle" 
}));

const HoverRow = styled(TableRow)(({ theme }) => ({ 
  transition: "background 0.15s", 
  "&:hover": { backgroundColor: alpha(theme.palette.primary.main, 0.028) }, 
  "&:last-child td": { borderBottom: "none" } 
}));

const CAT_ICONS = { 
  safety: <SecurityIcon sx={{ fontSize: 18 }} />, 
  equipment: <ConstructionIcon sx={{ fontSize: 18 }} />, 
  site: <LocationCityIcon sx={{ fontSize: 18 }} />, 
  quality: <VerifiedIcon sx={{ fontSize: 18 }} />, 
  compliance: <VerifiedIcon sx={{ fontSize: 18 }} />, 
  maintenance: <ConstructionIcon sx={{ fontSize: 18 }} />, 
  audit: <AssignmentIcon sx={{ fontSize: 18 }} />, 
  environmental: <PublicIcon sx={{ fontSize: 18 }} /> 
};

const CatAvatar = ({ category }) => {
  const theme = useTheme();
  return (
    <Avatar sx={{ 
      width: 38, 
      height: 38, 
      borderRadius: "12px", 
      bgcolor: alpha(theme.palette.primary.main, 0.1), 
      color: theme.palette.primary.main, 
      flexShrink: 0 
    }}>
      {CAT_ICONS[category?.toLowerCase()] || <AssignmentIcon sx={{ fontSize: 18 }} />}
    </Avatar>
  );
};

const STATUS_MAP = { 
  published: { label: "Published", color: "success" }, 
  active: { label: "Active", color: "success" }, 
  draft: { label: "Draft", color: "warning" }, 
  archived: { label: "Archived", color: "default" }, 
  inactive: { label: "Inactive", color: "default" }, 
  pending: { label: "Pending", color: "info" } 
};

const StatusBadge = ({ status }) => { 
  const cfg = STATUS_MAP[status?.toLowerCase()] || { label: status || "—", color: "default" }; 
  return <Chip label={cfg.label} size="small" color={cfg.color} sx={{ height: 22, fontSize: 11, fontWeight: 700, "& .MuiChip-label": { px: 1.25 } }} />; 
};

const TypeBadge = ({ type }) => {
  const theme = useTheme();
  return (
    <Chip 
      label={type || "custom"} 
      size="small" 
      variant="outlined" 
      icon={type === "global" ? <PublicIcon sx={{ fontSize: "11px !important" }} /> : undefined} 
      sx={{ 
        height: 22, 
        fontSize: 11, 
        fontWeight: 600, 
        "& .MuiChip-label": { px: 1.25 }, 
        borderColor: type === "global" ? theme.palette.info.main : theme.palette.divider, 
        color: type === "global" ? theme.palette.info.main : theme.palette.text.secondary 
      }} 
    />
  );
};

const fmt = (d) => d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

const StatCard = ({ label, value, sub, icon, accent, loading }) => {
  const theme = useTheme();
  return (
    <Paper elevation={0} sx={{ 
      p: { xs: 1.25, sm: 2.25 }, 
      height: "100%", 
      minHeight: { xs: 104, sm: 132 },
      border: "1px solid", 
      width: "100%",
      borderColor: "divider", 
      borderRadius: { xs: "14px", sm: "16px" }, 
      position: "relative", 
      overflow: "hidden", 
      transition: "all 0.22s", 
      "&:hover": { 
        borderColor: accent || theme.palette.primary.main, 
        transform: "translateY(-2px)", 
        boxShadow: (t) => `0 8px 24px ${alpha(accent || t.palette.primary.main, 0.1)}` 
      } 
    }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", height: "100%", gap: { xs: 0.75, sm: 1.25 } }}>
        <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", height: "100%" }}>
          <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: "0.04em", display: "block", mb: 0.75, fontSize: { xs: 8.5, sm: 10.5 }, lineHeight: 1.2, minHeight: { xs: 20, sm: "auto" } }}>
            {label}
          </Typography>
          {loading ? 
            <Skeleton width={56} height={38} sx={{ mt: 0.25 }} /> : 
            <Typography fontWeight={800} fontSize={{ xs: 20, sm: 26 }} lineHeight={1} color={accent || "primary.main"} sx={{ mb: 0.5 }}>
              {value}
            </Typography>
          }
          {sub && (loading ? <Skeleton width={90} height={13} /> : <Typography variant="caption" color="text.disabled" fontSize={{ xs: 8.5, sm: 11 }} sx={{ lineHeight: 1.25, mt: "auto" }}>{sub}</Typography>)}
        </Box>
        <Box sx={{ width: { xs: 28, sm: 42 }, height: { xs: 28, sm: 42 }, borderRadius: { xs: "10px", sm: "13px" }, flexShrink: 0, bgcolor: alpha(accent || theme.palette.primary.main, 0.09), color: accent || "primary.main", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {icon}
        </Box>
      </Box>
    </Paper>
  );
};

const EmptyState = ({ searched }) => {
  const theme = useTheme();
  return (
    <Fade in>
      <Box sx={{ py: { xs: 6, sm: 9 }, textAlign: "center", px: 3 }}>
        <Box sx={{ width: { xs: 56, sm: 72 }, height: { xs: 56, sm: 72 }, borderRadius: "22px", mx: "auto", mb: 2.5, bgcolor: alpha(theme.palette.primary.main, 0.07), display: "flex", alignItems: "center", justifyContent: "center" }}>
          <LayersIcon sx={{ fontSize: { xs: 28, sm: 34 }, color: theme.palette.primary.main }} />
        </Box>
        <Typography fontWeight={700} fontSize={{ xs: 14, sm: 16 }} color="text.primary" gutterBottom>
          {searched ? "No matching checklists" : "No cloneable checklists"}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 320, mx: "auto", fontSize: { xs: 12, sm: 13 } }}>
          {searched ? "Try different search terms or clear the search field." : "Create a checklist first, then it will appear here for cloning."}
        </Typography>
      </Box>
    </Fade>
  );
};

const ErrorState = ({ message, onRetry }) => {
  const theme = useTheme();
  return (
    <Fade in>
      <Box sx={{ py: { xs: 6, sm: 9 }, textAlign: "center", px: 3 }}>
        <Box sx={{ width: { xs: 56, sm: 72 }, height: { xs: 56, sm: 72 }, borderRadius: "22px", mx: "auto", mb: 2.5, bgcolor: alpha(theme.palette.error.main, 0.08), display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ErrorOutlineIcon sx={{ fontSize: { xs: 28, sm: 34 }, color: theme.palette.error.main }} />
        </Box>
        <Typography fontWeight={700} fontSize={{ xs: 14, sm: 16 }} color="text.primary" gutterBottom>
          Failed to load checklists
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 320, mx: "auto", mb: 3, fontSize: { xs: 12, sm: 13 } }}>
          {message || "An unexpected error occurred. Please try again."}
        </Typography>
        <Button variant="outlined" startIcon={<RefreshIcon />} onClick={onRetry} sx={{ borderColor: "divider", color: "text.secondary" }}>
          Try Again
        </Button>
      </Box>
    </Fade>
  );
};

const TableSkeleton = () => (
  <>
    {[...Array(6)].map((_, i) => (
      <HoverRow key={i}>
        <TD>
          <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
            <Skeleton variant="rounded" width={38} height={38} sx={{ borderRadius: "12px" }} />
            <Box>
              <Skeleton width="60%" height={16} />
              <Skeleton width="40%" height={12} sx={{ mt: 0.5 }} />
            </Box>
          </Box>
        </TD>
        <TD><Skeleton width={100} height={14} /></TD>
        <TD><Skeleton width={80} height={14} /></TD>
        <TD><Skeleton variant="rounded" width={40} height={22} /></TD>
        <TD><Skeleton variant="rounded" width={56} height={22} /></TD>
        <TD><Skeleton variant="rounded" width={56} height={22} /></TD>
        <TD>
          <Box sx={{ display: "flex", gap: 0.75, justifyContent: "center" }}>
            <Skeleton variant="rounded" width={64} height={32} sx={{ borderRadius: "10px" }} />
            <Skeleton variant="rounded" width={64} height={32} sx={{ borderRadius: "10px" }} />
          </Box>
        </TD>
      </HoverRow>
    ))}
  </>
);

const MobileSkeleton = () => (
  <Box sx={{ p: 2 }}>
    {[...Array(4)].map((_, i) => (
      <Paper key={i} sx={{ p: 2, mb: 1.5, border: "1px solid", borderColor: "divider" }}>
        <Box sx={{ display: "flex", gap: 1.5, mb: 1.5 }}>
          <Skeleton variant="rounded" width={38} height={38} sx={{ borderRadius: "12px" }} />
          <Box sx={{ flex: 1 }}>
            <Skeleton width="70%" height={16} />
            <Skeleton width="45%" height={12} sx={{ mt: 0.5 }} />
          </Box>
        </Box>
        <Skeleton width="100%" height={36} sx={{ borderRadius: "10px" }} />
      </Paper>
    ))}
  </Box>
);

const CloneDialog = ({ open, checklist, onClose, onConfirm, loading }) => { 
  const [name, setName] = useState(""); 
  const [nameError, setNameError] = useState(""); 
  const inputRef = useRef(null); 
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); 
  
  useEffect(() => { 
    if (open && checklist) { 
      setName(`${checklist.name} (Clone)`); 
      setNameError(""); 
      setTimeout(() => inputRef.current?.focus(), 100); 
    } 
  }, [open, checklist]); 
  
  const handleConfirm = () => { 
    const trimmed = name.trim(); 
    if (!trimmed) { 
      setNameError("Clone name is required."); 
      return; 
    } 
    if (trimmed.length < 3) { 
      setNameError("Name must be at least 3 characters."); 
      return; 
    } 
    if (trimmed.length > 120) { 
      setNameError("Name must be under 120 characters."); 
      return; 
    } 
    setNameError(""); 
    onConfirm(trimmed); 
  }; 
  
  const handleKeyDown = (e) => { 
    if (e.key === "Enter" && !loading) handleConfirm(); 
  }; 
  
  return (
    <Dialog
      open={open}
      onClose={!loading ? onClose : undefined}
      maxWidth="xs"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: { xs: 0, sm: "16px" },
          m: { xs: 0, sm: 2 },
          width: { xs: "100%", sm: "calc(100% - 32px)" },
          maxWidth: { xs: "none", sm: 444 },
          height: { xs: "100dvh", sm: "auto" },
          maxHeight: { xs: "100dvh", sm: "calc(100% - 64px)" },
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        },
      }}
    >
      <Box sx={{ bgcolor: "primary.main", px: { xs: 2, sm: 3 }, pt: { xs: 2, sm: 3 }, pb: { xs: 1.5, sm: 2.5 }, borderRadius: { xs: 0, sm: "16px 16px 0 0" } }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <Box>
            <Typography fontWeight={800} fontSize={{ xs: 15, sm: 17 }} color="white">Clone Checklist</Typography>
            <Typography fontSize={{ xs: 11, sm: 12 }} sx={{ color: alpha("#fff", 0.65), mt: 0.3 }}>Give your copy a unique name</Typography>
          </Box>
          <IconButton size="small" onClick={onClose} disabled={loading} sx={{ color: "white", bgcolor: alpha("#fff", 0.12), "&:hover": { bgcolor: alpha("#fff", 0.22) } }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
      <DialogContent
        sx={{
          p: { xs: 2, sm: 3 },
          flex: 1,
          overflowY: "auto",
        }}
      >
        <Stack spacing={2.5}>
          <Box sx={{ p: 2, borderRadius: 2, border: "1px solid", borderColor: alpha(theme.palette.primary.main, 0.18), bgcolor: alpha(theme.palette.primary.main, 0.03) }}>
            <Typography variant="caption" fontWeight={700} color="text.disabled" sx={{ textTransform: "uppercase", letterSpacing: "0.07em", display: "block", mb: 1.25, fontSize: { xs: 10, sm: 11 } }}>
              Cloning From
            </Typography>
            <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", mb: 1.5 }}>
              <CatAvatar category={checklist?.category} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography fontWeight={700} fontSize={{ xs: 13, sm: 14 }} noWrap>{checklist?.name}</Typography>
                <Typography variant="caption" color="text.secondary" fontSize={{ xs: 11, sm: 12 }}>
                  {checklist?.checklistType} · {checklist?.totalFields ?? checklist?.fields?.length ?? 0} fields · v{checklist?.version || 1}
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ mb: 1.5 }} />
            <Stack direction="row" spacing={1.5} flexWrap="wrap">
              <Box>
                <Typography variant="caption" color="text.disabled" fontSize={10}>Status</Typography>
                <Box sx={{ mt: 0.4 }}><StatusBadge status={checklist?.status} /></Box>
              </Box>
              <Box>
                <Typography variant="caption" color="text.disabled" fontSize={10}>Category</Typography>
                <Box sx={{ mt: 0.4 }}>
                  <Chip label={checklist?.category || "general"} size="small" sx={{ height: 22, fontSize: 11, bgcolor: alpha(theme.palette.primary.main, 0.08), color: theme.palette.primary.main, fontWeight: 600 }} />
                </Box>
              </Box>
            </Stack>
          </Box>
          <TextField 
            inputRef={inputRef} 
            fullWidth 
            label="Clone Name *" 
            value={name} 
            onChange={(e) => { setName(e.target.value); if (nameError) setNameError(""); }} 
            onKeyDown={handleKeyDown} 
            error={!!nameError} 
            helperText={nameError || `${name.length}/120 characters`} 
            placeholder="Enter a name for the cloned checklist" 
            disabled={loading} 
            size={isMobile ? "small" : "medium"} 
            FormHelperTextProps={{ sx: { fontSize: { xs: 10, sm: 11 }, color: nameError ? "error.main" : "text.disabled" } }} 
          />
        </Stack>
      </DialogContent>
      <DialogActions
        sx={{
          px: { xs: 2, sm: 3 },
          pb: { xs: "calc(16px + env(safe-area-inset-bottom))", sm: 3 },
          gap: 1.5,
          pt: { xs: 1.5, sm: 0 },
          borderTop: { xs: "1px solid", sm: "none" },
          borderColor: "divider",
        }}
      >
        <Button onClick={onClose} disabled={loading} variant="outlined" sx={{ borderColor: "divider", color: "text.secondary", borderRadius: "10px", fontSize: { xs: 12, sm: 13 } }}>
          Cancel
        </Button>
        <Button 
          onClick={handleConfirm} 
          disabled={loading || !name.trim()} 
          variant="contained" 
          startIcon={loading ? <CircularProgress size={15} color="inherit" /> : <ContentCopyIcon sx={{ fontSize: { xs: 14, sm: 16 } }} />} 
          sx={{ borderRadius: "10px", px: { xs: 2, sm: 2.5 }, minWidth: { xs: 110, sm: 130 }, fontSize: { xs: 12, sm: 13 } }}
        >
          {loading ? "Creating…" : "Create Clone"}
        </Button>
      </DialogActions>
    </Dialog>
  ); 
};

// ─── View Clone Details Dialog ─────────────────────────────────────────────
// Shows everything about a cloned checklist: status (draft/published),
// description, what it was cloned from, and its full field list. This is
// the piece that was missing — previously there was no way to inspect a
// clone beyond its table row.
const ViewCloneDialog = ({ open, checklist, onClose, onClone }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  if (!checklist) return null;
  const fields = checklist.fields || [];
  const clonedFromName =
    checklist.clonedFrom?.name || checklist.clonedFromName || null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
      sx={{
        "& .MuiDialog-container": {
          alignItems: { xs: "stretch", sm: "center" },
        },
      }}
      PaperProps={{
        sx: {
          borderRadius: { xs: 0, sm: "20px" },
          m: { xs: 0, sm: 2 },
          width: { xs: "100%", sm: "calc(100% - 32px)" },
          maxWidth: { xs: "none", sm: 600 },
          height: { xs: "100dvh", sm: "auto" },
          maxHeight: { xs: "100dvh", sm: "90vh" },
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          "@media (max-width:600px)": {
            position: "fixed",
            inset: 0,
            m: 0,
            width: "100vw",
            maxWidth: "100vw",
            height: "100dvh",
            maxHeight: "100dvh",
            borderRadius: 0,
          },
        },
      }}
    >
      <Box sx={{ bgcolor: "primary.main", px: { xs: 2.5, sm: 3 }, py: { xs: 2.5, sm: 3 }, borderRadius: { xs: 0, sm: "20px 20px 0 0" } }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <Box sx={{ pr: 2, minWidth: 0 }}>
            <Typography fontWeight={800} fontSize={{ xs: 16, sm: 19 }} color="white" sx={{ wordBreak: "break-word" }}>
              {checklist.name}
            </Typography>
            <Typography variant="caption" sx={{ color: alpha("#fff", 0.65), mt: 0.5, display: "block" }}>
              Created {fmt(checklist.createdAt)}
              {clonedFromName && <> · Cloned from "{clonedFromName}"</>}
            </Typography>
            <Stack direction="row" spacing={0.75} sx={{ mt: 1.5, flexWrap: "wrap", gap: 0.75 }}>
              <StatusBadge status={checklist.status} />
              <TypeBadge type={checklist.checklistType} />
              {checklist.category && (
                <Chip
                  label={checklist.category}
                  size="small"
                  sx={{ height: 24, fontSize: 11, fontWeight: 600, color: "white", bgcolor: alpha("#fff", 0.15), border: `1px solid ${alpha("#fff", 0.25)}` }}
                />
              )}
            </Stack>
          </Box>
          <IconButton onClick={onClose} sx={{ color: "white", bgcolor: alpha("#fff", 0.12), "&:hover": { bgcolor: alpha("#fff", 0.2) }, width: 36, height: 36, flexShrink: 0 }}>
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      </Box>

      <DialogContent sx={{ p: { xs: 2, sm: 3 }, flex: 1, overflowY: "auto" }}>
        <Stack spacing={3}>
          <Grid container spacing={1.5}>
            {[
              { label: "Version", val: `v${checklist.version || 1}` },
              { label: "Fields", val: checklist.totalFields ?? fields.length },
              { label: "Category", val: checklist.category || "—" },
              { label: "Created", val: fmt(checklist.createdAt) },
            ].map(({ label, val }) => (
              <Grid item xs={12} sm={3} key={label}>
                <Box sx={{ p: 1.5, borderRadius: 1, bgcolor: alpha(theme.palette.primary.main, 0.04), border: "1px solid", borderColor: alpha(theme.palette.primary.main, 0.1), width: "100%" }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" sx={{ mb: 0.25 }}>
                    {label}
                  </Typography>
                  <Typography variant="body2" fontWeight={700}>
                    {val}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>

          {checklist.description && (
            <Box>
              <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: "0.07em", display: "block", mb: 1 }}>
                Description
              </Typography>
              <Box sx={{ p: 2, bgcolor: "#f7f9fa", borderRadius: 1, border: "1px solid", borderColor: "divider" }}>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.75 }}>
                  {checklist.description}
                </Typography>
              </Box>
            </Box>
          )}

          {fields.length > 0 && (
            <Box>
              <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: "0.07em", display: "block", mb: 1.5 }}>
                Fields ({fields.length})
              </Typography>
              <Stack spacing={1}>
                {fields.map((field, idx) => (
                  <Box key={field._id || idx} sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 1.5, borderRadius: 1, border: "1px solid", borderColor: "divider" }}>
                    <Avatar sx={{ width: 28, height: 28, fontSize: 11, fontWeight: 700, bgcolor: alpha(theme.palette.primary.main, 0.1), color: "primary.main" }}>
                      {idx + 1}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={600} noWrap>
                        {field.label}
                      </Typography>
                      <Typography variant="caption" color="text.disabled">
                        {field.type} · {field.required ? "Required" : "Optional"}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Box>
          )}

          {fields.length === 0 && (
            <Typography variant="body2" color="text.disabled" sx={{ textAlign: "center", py: 2 }}>
              This checklist has no fields.
            </Typography>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: { xs: 2, sm: 2.5 }, pb: { xs: "calc(16px + env(safe-area-inset-bottom))", sm: 2.5 }, borderTop: "1px solid", borderColor: "divider", bgcolor: "#fafbfc", borderRadius: { xs: 0, sm: "0 0 20px 20px" }, gap: 1, flexWrap: "wrap" }}>
        <Button
          onClick={() => {
            onClose();
            onClone(checklist);
          }}
          variant="contained"
          size={isMobile ? "small" : "medium"}
          startIcon={<ContentCopyIcon sx={{ fontSize: 16 }} />}
          sx={{ borderRadius: "10px" }}
        >
          Clone This
        </Button>
        <Button onClick={onClose} variant="outlined" size={isMobile ? "small" : "medium"} sx={{ borderRadius: "10px" }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const MobileCard = ({ row, onClone, onView }) => {
  const theme = useTheme();
  return (
    <Paper sx={{ p: 2, mb: 1.5, border: "1px solid", borderColor: "divider", transition: "all 0.2s", "&:hover": { borderColor: "primary.main", boxShadow: (t) => `0 4px 16px ${alpha(t.palette.primary.main, 0.1)}` } }} elevation={0}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
        <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start", flex: 1, minWidth: 0 }}>
          <CatAvatar category={row.category} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography fontWeight={700} fontSize={14} sx={{ mb: 0.3 }} noWrap>{row.name}</Typography>
            {row.description && <Typography variant="caption" color="text.disabled" sx={{ display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{row.description}</Typography>}
          </Box>
        </Box>
        <Box sx={{ ml: 1, flexShrink: 0 }}><StatusBadge status={row.status} /></Box>
      </Box>
      <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", mb: 1.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <CalendarTodayIcon sx={{ fontSize: 12, color: "text.disabled" }} />
          <Typography variant="caption" color="text.secondary" fontSize={11}>{fmt(row.createdAt)}</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <DescriptionIcon sx={{ fontSize: 12, color: "text.disabled" }} />
          <Typography variant="caption" color="text.secondary" fontSize={11}>{row.totalFields ?? row.fields?.length ?? 0} fields</Typography>
        </Box>
        <TypeBadge type={row.checklistType} />
      </Box>
      <Stack direction="row" spacing={1}>
        <Button fullWidth variant="outlined" size="small" startIcon={<VisibilityIcon sx={{ fontSize: 15 }} />} onClick={() => onView(row)} sx={{ borderRadius: "10px", fontSize: 13, py: 0.75 }}>
          View
        </Button>
        <Button fullWidth variant="contained" size="small" startIcon={<ContentCopyIcon sx={{ fontSize: 15 }} />} onClick={() => onClone(row)} sx={{ borderRadius: "10px", fontSize: 13, py: 0.75 }}>
          Clone
        </Button>
      </Stack>
    </Paper>
  );
};

export default function CloneChecklist() { 
  const navigate = useNavigate(); 
  const theme = useTheme(); 
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); 
  const { getCloneableChecklists, cloneChecklist } = useChecklistBuilder(); 
  const [rows, setRows] = useState([]); 
  const [allRows, setAllRows] = useState([]); 
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 }); 
  const [page, setPage] = useState(1); 
  const [search, setSearch] = useState(""); 
  const [debouncedSearch, setDebouncedSearch] = useState(""); 
  const [listLoading, setListLoading] = useState(false); 
  const [fetchError, setFetchError] = useState(null); 
  const [dialog, setDialog] = useState({ open: false, checklist: null }); 
  const [viewDialog, setViewDialog] = useState({ open: false, checklist: null });
  const [cloneLoading, setCloneLoading] = useState(false); 
  const [snack, setSnack] = useState({ open: false, msg: "", severity: "success" }); 
  
  useEffect(() => { 
    const t = setTimeout(() => { 
      setDebouncedSearch(search); 
      setPage(1); 
    }, 380); 
    return () => clearTimeout(t); 
  }, [search]); 
  
  const fetchList = useCallback(async (pg = page, q = debouncedSearch) => { 
    setListLoading(true); 
    setFetchError(null); 
    try { 
      const filters = { page: pg, limit: isMobile ? 5 : 10 }; 
      if (q) filters.search = q; 
      const res = await getCloneableChecklists(filters); 
      if (!res.success) { 
        setFetchError(res.error || "Failed to load checklists."); 
        setRows([]); 
        return; 
      } 
      const raw = res.data; 
      const list = raw?.checklists ?? (Array.isArray(raw) ? raw : []); 
      const pag = raw?.pagination ?? {}; 
      setRows(list); 
      setPagination({ 
        page: pag.page || pg, 
        limit: pag.limit || (isMobile ? 5 : 10), 
        total: pag.total || list.length, 
        pages: pag.pages || Math.ceil((pag.total || list.length) / (isMobile ? 5 : 10)) 
      }); 
      if (!q && pg === 1) { 
        const statsRes = await getCloneableChecklists({ page: 1, limit: 100 }); 
        if (statsRes.success) { 
          const sraw = statsRes.data; 
          const slist = sraw?.checklists ?? (Array.isArray(sraw) ? sraw : []); 
          setAllRows(slist); 
        } 
      } 
    } catch (err) { 
      setFetchError(err?.response?.data?.message || err?.message || "Unexpected error."); 
      setRows([]); 
    } finally { 
      setListLoading(false); 
    } 
  }, [getCloneableChecklists, page, debouncedSearch, isMobile]); 
  
  useEffect(() => { 
    fetchList(page, debouncedSearch); 
  }, [page, debouncedSearch, fetchList]); 
  
  const openClone = (row) => setDialog({ open: true, checklist: row }); 
  const closeClone = () => { if (!cloneLoading) setDialog({ open: false, checklist: null }); }; 

  const openView = (row) => setViewDialog({ open: true, checklist: row });
  const closeView = () => setViewDialog({ open: false, checklist: null });
  
  const handleCloneConfirm = useCallback(async (newName) => { 
    if (!dialog.checklist) return; 
    setCloneLoading(true); 
    try { 
      const res = await cloneChecklist(dialog.checklist._id, { newName }); 
      if (res.success) { 
        setSnack({ open: true, msg: `"${newName}" created successfully!`, severity: "success" }); 
        closeClone(); 
        fetchList(page, debouncedSearch); 
        setTimeout(() => navigate("/admin/checklists"), 1800); 
      } else { 
        setSnack({ open: true, msg: res.error || "Clone failed. Please try again.", severity: "error" }); 
      } 
    } catch (err) { 
      setSnack({ open: true, msg: err?.response?.data?.message || err?.message || "Clone failed.", severity: "error" }); 
    } finally { 
      setCloneLoading(false); 
    } 
  }, [dialog.checklist, cloneChecklist, fetchList, navigate, page, debouncedSearch]); 
  
  const handlePageChange = (_, v) => setPage(v); 
  const handleRetry = () => fetchList(page, debouncedSearch); 
  
  const statsSource = allRows.length > 0 ? allRows : rows; 
  const stats = { 
    total: pagination.total || statsSource.length, 
    published: statsSource.filter((r) => r.status === "published" || r.status === "active").length, 
    drafts: statsSource.filter((r) => r.status === "draft").length,
    totalFields: statsSource.reduce((s, r) => s + (r.totalFields ?? r.fields?.length ?? 0), 0), 
    categories: [...new Set(statsSource.map((r) => r.category).filter(Boolean))].length 
  }; 
  
  return (
    <ThemeProvider theme={appTheme}>
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
        <Box sx={{ bgcolor: "background.paper", borderBottom: "1px solid", borderColor: "divider", px: { xs: 2, sm: 3, md: 4 }, py: { xs: 1.5, sm: 2 }, position: "sticky", top: 0, zIndex: 50 }}>
          <Box sx={{ maxWidth: 1200, mx: "auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <IconButton onClick={() => navigate("/admin/checklists")} sx={{ bgcolor: alpha(appTheme.palette.primary.main, 0.07), borderRadius: "12px", "&:hover": { bgcolor: alpha(appTheme.palette.primary.main, 0.13) } }}>
                <ArrowBackIcon sx={{ color: "primary.main", fontSize: { xs: 18, sm: 20 } }} />
              </IconButton>
              <Box>
                <Typography fontWeight={800} fontSize={{ xs: 14, sm: 18 }} color="text.primary" sx={{ letterSpacing: "-0.01em", lineHeight: 1.2 }}>
                  Clone Checklist
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: { xs: "none", sm: "block" }, fontSize: { xs: 11, sm: 12 } }}>
                  Duplicate an existing checklist to use as a new starting point
                </Typography>
              </Box>
            </Box>
            <Tooltip title="Refresh list">
              <IconButton onClick={handleRetry} disabled={listLoading} sx={{ bgcolor: alpha(appTheme.palette.primary.main, 0.07), borderRadius: "12px", "&:hover": { bgcolor: alpha(appTheme.palette.primary.main, 0.13) } }}>
                <RefreshIcon sx={{ color: "primary.main", fontSize: { xs: 18, sm: 20 }, animation: listLoading ? "spin 0.9s linear infinite" : "none", "@keyframes spin": { "0%": { transform: "rotate(0deg)" }, "100%": { transform: "rotate(360deg)" } } }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3, md: 4 }, px: { xs: 2, sm: 3 } }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(2, minmax(0, 1fr))",
                sm: "repeat(4, minmax(0, 1fr))",
              },
              gap: { xs: 1.5, sm: 2 },
              mb: 3,
              width: "100%",
            }}
          >
            {[
              { label: "Total Cloneable", value: stats.total, sub: "Available to duplicate", icon: <LayersIcon sx={{ fontSize: { xs: 18, sm: 20 } }} /> },
              { label: "Published", value: stats.published, sub: "Active & ready to clone", icon: <CheckCircleIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />, accent: appTheme.palette.success.main },
              { label: "Drafts", value: stats.drafts, sub: "Awaiting publishing", icon: <DescriptionIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />, accent: appTheme.palette.warning.main },
              { label: "Total Fields", value: stats.totalFields, sub: "Across all checklists", icon: <ListAltIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />, accent: appTheme.palette.info.main }
            ].map((s) => (
              <Box key={s.label} sx={{ minWidth: 0 }}>
                <StatCard {...s} loading={listLoading && allRows.length === 0} />
              </Box>
            ))}
          </Box>
          <Paper elevation={0} sx={{ p: { xs: 1.5, sm: 2 }, mb: 3, border: "1px solid", borderColor: "divider" }}>
            <AssetSearchField
              placeholder="Search by name, category, or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => setSearch("")}
              inputSx={{ "& .MuiInputBase-input": { fontSize: { xs: 13, sm: 14 } } }}
            />
          </Paper>

         

          {!listLoading && !fetchError && rows.length > 0 && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: "primary.main" }} />
              <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ fontSize: { xs: 11, sm: 12 } }}>
                {pagination.total} {pagination.total === 1 ? "checklist" : "checklists"} available to clone{debouncedSearch && ` · filtered by "${debouncedSearch}"`}
              </Typography>
            </Box>
          )}

          <Paper elevation={0} sx={{ border: "1px solid", borderColor: "divider", overflow: "hidden" }}>
            {!listLoading && fetchError && <ErrorState message={fetchError} onRetry={handleRetry} />}
            
            {!fetchError && isMobile && (
              <Box sx={{ p: 2 }}>
                {listLoading ? <MobileSkeleton /> : rows.length === 0 ? <EmptyState searched={!!debouncedSearch} /> : rows.map((row) => <MobileCard key={row._id} row={row} onClone={openClone} onView={openView} />)}
              </Box>
            )}
            
            {!fetchError && !isMobile && (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TH>Checklist</TH>
                      <TH>Created By</TH>
                      <TH>Date</TH>
                      <TH align="center">Fields</TH>
                      <TH align="center">Type</TH>
                      <TH align="center">Status</TH>
                      <TH align="center">Actions</TH>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {listLoading ? <TableSkeleton /> : rows.length === 0 ? (
                      <TableRow><TD colSpan={7} sx={{ border: 0 }}><EmptyState searched={!!debouncedSearch} /></TD></TableRow>
                    ) : rows.map((row) => (
                      <HoverRow key={row._id}>
                        <TD sx={{ maxWidth: 280 }}>
                          <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                            <CatAvatar category={row.category} />
                            <Box>
                              <Typography fontWeight={700} fontSize={13} noWrap>{row.name.length>40?row.name.slice(0,30)+"...":row.name}</Typography>
                              {row.description && <Typography variant="caption" color="text.disabled" sx={{ display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 220 }}>{row.description}</Typography>}
                            </Box>
                          </Box>
                        </TD>
                        <TD>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Avatar sx={{ width: 26, height: 26, fontSize: 11, bgcolor: alpha(appTheme.palette.primary.main, 0.1), color: "primary.main" }}>
                              {(row.createdBy?.email || row.createdBy?.name || "U").charAt(0).toUpperCase()}
                            </Avatar>
                            <Typography fontSize={12} color="text.secondary" noWrap sx={{ maxWidth: 140 }}>
                              {row.createdBy?.email || row.createdBy?.name || "System"}
                            </Typography>
                          </Box>
                        </TD>
                        <TD>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                            <CalendarTodayIcon sx={{ fontSize: 12, color: "text.disabled" }} />
                            <Typography fontSize={12} color="text.secondary">{fmt(row.createdAt)}</Typography>
                          </Box>
                        </TD>
                        <TD align="center">
                          <Chip label={row.totalFields ?? row.fields?.length ?? 0} size="small" sx={{ height: 22, minWidth: 36, fontWeight: 700, fontSize: 11, bgcolor: alpha(appTheme.palette.primary.main, 0.07), color: "primary.main" }} />
                        </TD>
                        <TD align="center"><TypeBadge type={row.checklistType} /></TD>
                        <TD align="center"><StatusBadge status={row.status} /></TD>
                        <TD align="center">
                          <Stack direction="row" spacing={0.75} justifyContent="center">
                            <Button size="small" variant="outlined" startIcon={<VisibilityIcon sx={{ fontSize: 14 }} />} onClick={() => openView(row)} sx={{ fontSize: 12, borderRadius: "10px", px: 1.5, py: 0.65, whiteSpace: "nowrap" }}>
                              View
                            </Button>
                            <Button size="small" variant="contained" startIcon={<ContentCopyIcon sx={{ fontSize: 14 }} />} onClick={() => openClone(row)} sx={{ fontSize: 12, borderRadius: "10px", px: 1.75, py: 0.65, whiteSpace: "nowrap" }}>
                              Clone
                            </Button>
                          </Stack>
                        </TD>
                      </HoverRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            
            {!listLoading && !fetchError && rows.length > 0 && pagination.pages > 1 && (
              <Box sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 2.5 }, borderTop: "1px solid", borderColor: "divider", bgcolor: alpha(appTheme.palette.background.default, 0.7), display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ fontSize: { xs: 10, sm: 11 } }}>
                  Showing {(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                </Typography>
                <Pagination 
                  count={pagination.pages} 
                  page={pagination.page} 
                  onChange={handlePageChange} 
                  size={isMobile ? "small" : "medium"} 
                  sx={{ 
                    "& .MuiPaginationItem-root": { borderRadius: "10px", fontWeight: 600, fontSize: { xs: 11, sm: 12 } }, 
                    "& .Mui-selected": { bgcolor: "primary.main !important", color: "#fff", "&:hover": { bgcolor: "primary.dark !important" } } 
                  }} 
                />
              </Box>
            )}
          </Paper>
        </Container>

        <CloneDialog open={dialog.open} checklist={dialog.checklist} onClose={closeClone} onConfirm={handleCloneConfirm} loading={cloneLoading} />

        <ViewCloneDialog
          open={viewDialog.open}
          checklist={viewDialog.checklist}
          onClose={closeView}
          onClone={openClone}
        />
        
        <Snackbar open={snack.open} autoHideDuration={4500} onClose={() => setSnack((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: "top", horizontal: "right" }} TransitionComponent={Fade}>
          <Alert 
            severity={snack.severity} 
            variant="filled" 
            icon={snack.severity === "success" ? <CheckCircleIcon fontSize="small" /> : <WarningAmberIcon fontSize="small" />} 
            onClose={() => setSnack((s) => ({ ...s, open: false }))} 
            sx={{ borderRadius: "14px", fontWeight: 600, fontSize: 13, bgcolor: snack.severity === "success" ? "primary.main" : "error.main" }}
          >
            {snack.msg}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  ); 
}

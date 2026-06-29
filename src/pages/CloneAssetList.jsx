// src/pages/CloneAssets.jsx
// ── Pixel-faithful recreation of the screenshot design ──────────────────────
import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Chip,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Snackbar,
  Alert,
  CircularProgress,
  Skeleton,
  Stack,
  Fade,
  Grid,
  Pagination,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAsset } from "../context/AssetContext";
import { useAuth } from "../context/AuthContexts";
import {
  ArrowBack,
  Search,
  LocationOn,
  ContentCopy,
  Refresh,
  Close,
  ErrorOutline,
} from "@mui/icons-material";

// ── Design tokens matching the screenshot exactly ────────────────────────────
const T = {
  pageBg: "#f5f5f5",
  surface: "#ffffff",
  border: "#e8e8e8",
  borderCard: "#ebebeb",
  text: {
    primary: "#1a1a1a",
    secondary: "#555555",
    label: "#888888",
    muted: "#aaaaaa",
  },
  primary: "#1a1a1a",
  cloneBtn: "#f5f5f5",
  cloneBtnHover: "#ebebeb",
  radius: { card: "12px", badge: "6px", btn: "8px", search: "8px" },
  shadow: "0 1px 4px rgba(0,0,0,0.06)",
  shadowCard: "0 2px 8px rgba(0,0,0,0.07)",
};

// ── Status badge colours — matching screenshot pill colours exactly ────────
const STATUS_MAP = {
  operational: { bg: "#e6f4ea", color: "#2e7d32" },
  active: { bg: "#e6f4ea", color: "#2e7d32" },
  underinspection: { bg: "#e3f2fd", color: "#1565c0" },
  underreview: { bg: "#fff8e1", color: "#f57f17" },
  maintenance: { bg: "#fce4ec", color: "#c62828" },
  inmaintenance: { bg: "#fce4ec", color: "#c62828" },
  retired: { bg: "#f3e5f5", color: "#6a1b9a" },
  decommissioned: { bg: "#ffebee", color: "#b71c1c" },
};

const StatusBadge = ({ status = "" }) => {
  const key = status.toLowerCase().replace(/\s+/g, "");
  const cfg = STATUS_MAP[key] || { bg: "#f5f5f5", color: "#555" };
  // Display label: convert camelCase/joined to spaced title
  const label = status || "Unknown";
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        px: 1.25,
        py: 0.4,
        borderRadius: T.radius.badge,
        bgcolor: cfg.bg,
        color: cfg.color,
        fontSize: "0.72rem",
        fontWeight: 600,
        whiteSpace: "nowrap",
        lineHeight: 1.4,
      }}
    >
      {label}
    </Box>
  );
};

const isCloneAssetRecord = (asset) => {
  const name = String(asset?.assetName || "").trim().toLowerCase();
  return (
    asset?.isClone === true ||
    !!asset?.clonedFrom ||
    name.endsWith("- clone") ||
    name.endsWith("clone") ||
    name.endsWith("_copy")
  );
};

// ── Asset Card — faithful to screenshot ──────────────────────────────────────
const AssetCard = ({ asset, onClone }) => {
  const canClone =
    asset.canBeCloned !== false &&
    !["retired", "decommissioned"].includes(asset.status?.toLowerCase());

  const lastInspection =
    asset.inspectionSystems?.amcInspection?.lastInspectionDate ||
    asset.inspectionSystems?.camcInspection?.lastInspectionDate ||
    asset.acquisitionDate ||
    null;

  const formatDate = (d) => {
    if (!d) return "—";
    try {
      return new Date(d).toISOString().split("T")[0];
    } catch {
      return "—";
    }
  };

  const category =
    asset.assetCategoryId?.name || asset.assetCategory || "Uncategorized";

  return (
    <Box
      sx={{
        bgcolor: T.surface,
        borderRadius: T.radius.card,
        border: `1px solid ${T.borderCard}`,
        boxShadow: T.shadowCard,
        display: "flex",
        width:"355px",
        flexDirection: "column",
        overflow: "hidden",
        transition: "box-shadow 0.18s ease, transform 0.18s ease",
        "&:hover": {
          boxShadow: "0 4px 16px rgba(0,0,0,0.11)",
          transform: "translateY(-2px)",
        },
      }}
    >
      {/* ── Card body ── */}
      <Box sx={{ p: 2.5, flex: 1 }}>
        {/* Row 1: Name + Status */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          mb={1}
        >
          <Typography
            fontWeight={700}
            fontSize="1rem"
            color={T.text.primary}
            sx={{ lineHeight: 1.3, pr: 1 }}
          >
            {asset.assetName}
          </Typography>
          <StatusBadge status={asset.status} />
        </Stack>

        {/* Row 2: Location */}
        <Stack direction="row" alignItems="center" spacing={0.5} mb={1.75}>
          <LocationOn sx={{ fontSize: 14, color: T.text.muted }} />
          <Typography fontSize="0.8rem" color={T.text.secondary}>
            {asset.currentLocation || "—"}
          </Typography>
        </Stack>

        {/* Divider-like rows: label on left, value on right */}
        {[
          { label: "Asset ID:", value: asset.assetId || "—" },
          { label: "Category:", value: category },
          { label: "Last Inspection:", value: formatDate(lastInspection) },
        ].map(({ label, value }) => (
          <Stack
            key={label}
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={0.75}
          >
            <Typography fontSize="0.8rem" color={T.text.label}>
              {label}
            </Typography>
            <Typography
              fontSize="0.8rem"
              fontWeight={600}
              color={T.text.primary}
            >
              {value}
            </Typography>
          </Stack>
        ))}
      </Box>

      {/* ── Clone button ── */}
      <Box sx={{ px: 2.5, pb: 2.5 }}>
        <Button
          fullWidth
          variant="text"
          disabled={!canClone}
          onClick={() => onClone(asset)}
          sx={{
            py: 1,
            borderRadius: T.radius.btn,
            bgcolor: canClone ? T.cloneBtn : "#fafafa",
            color: canClone ? T.text.primary : T.text.muted,
            fontSize: "0.85rem",
            fontWeight: 500,
            textTransform: "none",
            border: `1px solid ${T.border}`,
            "&:hover": {
              bgcolor: T.cloneBtnHover,
              border: `1px solid #d0d0d0`,
            },
            "&.Mui-disabled": { bgcolor: "#fafafa", color: T.text.muted },
          }}
        >
          Clone Asset
        </Button>
      </Box>
    </Box>
  );
};

// ── Main Component ───────────────────────────────────────────────────────────
export default function CloneAssets() {
  const navigate = useNavigate();
  const {
    assets,
    getAllAssets,
    cloneAsset,
    loading: assetLoading,
  } = useAsset();
  const { user } = useAuth();

  const isAdmin = user?.role === "admin" || user?.role === "super_admin";

  // State
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 12;
  const [cloneDialogOpen, setCloneDialogOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [cloning, setCloning] = useState(false);
  const [cloneNote, setCloneNote] = useState("");
  const [cloneSuffix, setCloneSuffix] = useState("_copy");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const toast = (message, severity = "success") =>
    setSnackbar({ open: true, message, severity });

  // Fetch
  const fetchAssets = useCallback(async () => {
    try {
      await getAllAssets({ limit: 1000 });
    } catch (err) {
      toast(err.message || "Failed to fetch assets", "error");
    }
  }, [getAllAssets]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  // Categories
  const clonedAssets = (assets || []).filter(isCloneAssetRecord);

  const allCategories = [
    "All",
    ...new Set(
      clonedAssets
        .map((a) => a.assetCategoryId?.name || a.assetCategory)
        .filter(Boolean),
    ),
  ];

  // Filter
  const filteredAssets = clonedAssets.filter((asset) => {
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      asset.assetName?.toLowerCase().includes(q) ||
      asset.assetId?.toLowerCase().includes(q) ||
      asset.currentLocation?.toLowerCase().includes(q);
    const assetCat = asset.assetCategoryId?.name || asset.assetCategory || "";
    const matchCat = category === "All" || assetCat === category;
    return matchSearch && matchCat;
  });

  const totalPages = Math.ceil(filteredAssets.length / ITEMS_PER_PAGE);
  const paginatedAssets = filteredAssets.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  // Clone handlers
  const handleCloneClick = (asset) => {
    setSelectedAsset(asset);
    setCloneSuffix("_copy");
    setCloneNote(
      `Cloned from "${asset.assetName}" on ${new Date().toLocaleString()}`,
    );
    setCloneDialogOpen(true);
  };

  const confirmClone = async () => {
    if (!selectedAsset) return;
    setCloning(true);
    try {
      const newName = `${selectedAsset.assetName}${cloneSuffix}`;
      const res = await cloneAsset(selectedAsset._id || selectedAsset.id, {
        cloneNote: cloneNote.trim(),
        assetName: newName,
      });
      if (res?.success !== false) {
        toast(`"${selectedAsset.assetName}" cloned successfully!`);
        setCloneDialogOpen(false);
        setSelectedAsset(null);
        await fetchAssets();
      } else {
        throw new Error(res?.message || "Failed to clone");
      }
    } catch (err) {
      toast(err.message || "Failed to clone asset", "error");
    } finally {
      setCloning(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: T.pageBg }}>
      {/* ── Header ── */}
      <Box
        sx={{
          bgcolor: T.surface,
          px: { xs: 2, md: 4 },
          py: 2.5,
          borderBottom: `1px solid ${T.border}`,
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <IconButton
              onClick={() => navigate(-1)}
              size="small"
              sx={{
                bgcolor: T.pageBg,
                border: `1px solid ${T.border}`,
                borderRadius: "8px",
                "&:hover": { bgcolor: T.cloneBtnHover },
              }}
            >
              <ArrowBack sx={{ fontSize: 18, color: T.text.primary }} />
            </IconButton>
            <Box>
              <Typography
                fontWeight={700}
                fontSize="1.25rem"
                color={T.text.primary}
                lineHeight={1.2}
              >
                Clone Assets
              </Typography>
              <Typography fontSize="0.78rem" color={T.text.label} mt={0.2}>
                Showing cloned assets only
              </Typography>
            </Box>
          </Stack>

          <IconButton
            onClick={fetchAssets}
            disabled={assetLoading}
            size="small"
            sx={{
              bgcolor: T.pageBg,
              border: `1px solid ${T.border}`,
              borderRadius: "8px",
            }}
          >
            {assetLoading ? (
              <CircularProgress size={16} sx={{ color: T.text.secondary }} />
            ) : (
              <Refresh sx={{ fontSize: 18, color: T.text.secondary }} />
            )}
          </IconButton>
        </Stack>
      </Box>

      {/* ── Content ── */}
      <Box sx={{ px: { xs: 2, md: 4 }, py: 3, maxWidth: 1400, mx: "auto" }}>
        {/* ── Search + Category bar ── */}
        <Stack direction="row" spacing={1.5} mb={3}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search assets by name, ID, or location..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ fontSize: 18, color: T.text.muted }} />
                </InputAdornment>
              ),
              endAdornment: search && (
                <IconButton size="small" onClick={() => setSearch("")}>
                  <Close fontSize="small" />
                </IconButton>
              ),
              sx: {
                borderRadius: T.radius.search,
                bgcolor: T.surface,
                fontSize: "0.85rem",
                "& fieldset": { borderColor: T.border },
                "&:hover fieldset": { borderColor: "#cccccc" },
              },
            }}
          />

          <FormControl size="small" sx={{ minWidth: 160, flexShrink: 0 }}>
            <Select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              displayEmpty
              sx={{
                borderRadius: T.radius.search,
                bgcolor: T.surface,
                fontSize: "0.85rem",
                "& fieldset": { borderColor: T.border },
                "&:hover fieldset": { borderColor: "#cccccc" },
              }}
            >
              {allCategories.map((c) => (
                <MenuItem key={c} value={c} sx={{ fontSize: "0.85rem" }}>
                  {c === "All" ? "All Categories" : c}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        {/* ── Cards grid ── */}
        {assetLoading ? (
          <Grid container spacing={2.5}>
            {Array.from({ length: 6 }).map((_, i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Skeleton
                  variant="rounded"
                  height={260}
                  sx={{ borderRadius: T.radius.card }}
                />
              </Grid>
            ))}
          </Grid>
        ) : paginatedAssets.length === 0 ? (
          <Box
            sx={{
              textAlign: "center",
              py: 10,
              bgcolor: T.surface,
              borderRadius: T.radius.card,
              border: `1px solid ${T.borderCard}`,
            }}
          >
            <ErrorOutline sx={{ fontSize: 40, color: T.text.muted, mb: 1.5 }} />
            <Typography fontWeight={600} color={T.text.secondary} mb={0.5}>
              No cloned assets found
            </Typography>
            <Typography fontSize="0.82rem" color={T.text.muted}>
              {search || category !== "All"
                ? "Try adjusting your search or category filter"
                : "No clone assets are available yet"}
            </Typography>
          </Box>
        ) : (
          <>
            <Grid container spacing={2.5}>
              {paginatedAssets.map((asset) => (
                <Grid item xs={12} sm={6} md={4} key={asset._id || asset.id}>
                  <AssetCard
                    asset={asset}
                    onClone={handleCloneClick}
                    isAdmin={isAdmin}
                  />
                </Grid>
              ))}
            </Grid>

            {totalPages > 1 && (
              <Stack alignItems="center" mt={4}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(_, v) => setPage(v)}
                  shape="rounded"
                  sx={{
                    "& .MuiPaginationItem-root": {
                      borderRadius: T.radius.btn,
                      fontSize: "0.82rem",
                    },
                  }}
                />
              </Stack>
            )}
          </>
        )}
      </Box>

      {/* ── Clone Dialog ── */}
      <Dialog
        open={cloneDialogOpen}
        onClose={() => !cloning && setCloneDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: T.radius.card } }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: "1rem", pb: 1 }}>
          Clone Asset
          {selectedAsset && (
            <Typography
              fontSize="0.78rem"
              color={T.text.label}
              fontWeight={400}
              mt={0.25}
            >
              Creating a copy of &quot;{selectedAsset.assetName}&quot;
            </Typography>
          )}
        </DialogTitle>
        <DialogContent sx={{ pt: "8px !important" }}>
          <TextField
            fullWidth
            size="small"
            label="Name Suffix"
            value={cloneSuffix}
            onChange={(e) => setCloneSuffix(e.target.value)}
            sx={{ mb: 2 }}
            helperText={`New name: ${selectedAsset?.assetName || ""}${cloneSuffix}`}
          />
          <TextField
            fullWidth
            multiline
            rows={3}
            size="small"
            label="Note (optional)"
            value={cloneNote}
            onChange={(e) => setCloneNote(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            onClick={() => setCloneDialogOpen(false)}
            disabled={cloning}
            sx={{
              textTransform: "none",
              color: T.text.secondary,
              fontSize: "0.85rem",
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={confirmClone}
            disabled={cloning}
            startIcon={
              cloning ? (
                <CircularProgress size={14} sx={{ color: "inherit" }} />
              ) : (
                <ContentCopy sx={{ fontSize: 16 }} />
              )
            }
            sx={{
              textTransform: "none",
              fontSize: "0.85rem",
              bgcolor: T.text.primary,
              borderRadius: T.radius.btn,
              "&:hover": { bgcolor: "#333" },
            }}
          >
            {cloning ? "Cloning…" : "Confirm Clone"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Toast ── */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        TransitionComponent={Fade}
      >
        <Alert
          severity={snackbar.severity}
          sx={{ borderRadius: T.radius.btn, fontSize: "0.82rem" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

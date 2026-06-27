// src/pages/AssetManagement.jsx
// ── Pixel-faithful recreation of the screenshot ──────────────────────────────
import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Stack,
  TextField,
  InputAdornment,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Tooltip,
  Pagination,
  Skeleton,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  LinearProgress,
  alpha,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Search,
  LocationOn,
  ContentCopy,
  Visibility,
  Add,
  GridView,
  ViewList,
  Close,
  ClearAll,
  FileDownload,
  Delete,
  Refresh,
  Category,
  Edit,
  ErrorOutline,
  Inbox,
  SearchOff,
} from "@mui/icons-material";
import { useAsset } from "../context/AssetContext";
import { useAuth } from "../context/AuthContexts";

// ── Design tokens matching the screenshot ────────────────────────────────────
const T = {
  pageBg: "#f0f4f7",
  surface: "#ffffff",
  border: "#e4e9ee",
  text: {
    primary: "#0d2b35",
    secondary: "#4a5568",
    muted: "#94a3b8",
    label: "#6b7280",
  },
  brand: "#0d4f63",
  brandDark: "#093a4a",
  brandLight: "#e8f4f8",
  error: "#dc2626",
  errorBg: "#fef2f2",
  success: "#0f766e",
  successBg: "#f0fdf4",
  warning: "#b45309",
  warningBg: "#fffbeb",
  radius: {
    card: "14px",
    pill: "999px",
    input: "10px",
    btn: "10px",
    dialog: "16px",
  },
  shadow: "0 1px 4px rgba(0,0,0,0.06)",
  shadowCard: "0 2px 8px rgba(0,0,0,0.06)",
  shadowMd: "0 4px 16px rgba(0,0,0,0.10)",
};

// ── Status pill config — matches screenshot pill shapes ───────────────────────
const STATUS_CFG = {
  Operational: { bg: "#0d4f63", color: "#ffffff" },
  Active: { bg: "#0d4f63", color: "#ffffff" },
  "Under Inspection": { bg: "#b8dce8", color: "#0d4f63" },
  "Under Review": { bg: "#374151", color: "#ffffff" },
  Maintenance: { bg: "#dc2626", color: "#ffffff" },
  "In Maintenance": { bg: "#dc2626", color: "#ffffff" },
  Retired: { bg: "#6b7280", color: "#ffffff" },
  Decommissioned: { bg: "#6b7280", color: "#ffffff" },
  "Under Repair": { bg: "#b45309", color: "#ffffff" },
  Reserved: { bg: "#4f46e5", color: "#ffffff" },
  "In Transit": { bg: "#0369a1", color: "#ffffff" },
};

// Statuses shown in the Status filter dropdown — kept separate from
// STATUS_CFG so the pills can still render any status color coming from the
// backend, while the filter only exposes the ones requested.
const STATUS_FILTER_OPTIONS = [
  "Active",
  "In Maintenance",
  "Retired",
  "In Transit",
  "Reserved",
];

const StatusPill = ({ status = "" }) => {
  const cfg = STATUS_CFG[status] || { bg: "#6b7280", color: "#fff" };
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        px: 1.75,
        py: 0.6,
        borderRadius: T.radius.pill,
        bgcolor: cfg.bg,
        color: cfg.color,
        fontSize: "0.75rem",
        fontWeight: 600,
        whiteSpace: "nowrap",
        lineHeight: 1.4,
      }}
    >
      {status || "Unknown"}
    </Box>
  );
};

// ── Helpers for robust, normalized comparisons ───────────────────────────────
// Lowercase + trim so "Active " / "active" / "ACTIVE" are treated the same.
const norm = (v) => (v ?? "").toString().trim().toLowerCase();

const getAssetCategoryName = (asset) =>
  asset?.assetCategoryId?.name || asset?.assetCategory || "";

const getAssetCategoryId = (asset) =>
  asset?.assetCategoryId?._id || asset?.assetCategoryId || "";

const getSearchText = (asset) =>
  [
    asset?.assetName,
    asset?.assetId,
    asset?.tagNumber,
    asset?.serialNumber,
    asset?.modelNumber,
    asset?.currentLocation,
    asset?.department,
    asset?.description,
    asset?.status,
    getAssetCategoryName(asset),
    getAssetCategoryId(asset),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

// ── Asset Card — matches screenshot cards exactly ────────────────────────────
const AssetCard = ({ asset, onView, onClone, onDelete, onEdit, isAdmin }) => {
  const canClone = !asset.isClone && asset.canBeCloned !== false;

  const formatDate = (d) => {
    if (!d) return "—";
    try {
      return new Date(d).toISOString().split("T")[0];
    } catch {
      return "—";
    }
  };

  const category = getAssetCategoryName(asset) || "—";

  return (
    <Box
      onClick={() => onView(asset)}
      sx={{
        bgcolor: T.surface,
        borderRadius: T.radius.card,
        border: `1px solid ${T.border}`,
        boxShadow: T.shadowCard,
        width: {xs:"356px",md:"371px"},
        cursor: "pointer",
        transition: "box-shadow 0.18s, transform 0.18s",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        "&:hover": {
          boxShadow: T.shadowMd,
          transform: "translateY(-2px)",
        },
      }}
    >
      <Box sx={{ p: 2.5, flex: 1 }}>
        {/* Name + Status */}
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
            sx={{ lineHeight: 1.3, pr: 1, flex: 1 }}
          >
            {asset.assetName}
          </Typography>
          <StatusPill status={asset.status} />
        </Stack>

        {/* Location */}
        <Stack direction="row" alignItems="center" spacing={0.5} mb={2.5}>
          <LocationOn sx={{ fontSize: 13, color: T.text.muted }} />
          <Typography fontSize="0.8rem" color={T.text.secondary}>
            {asset.currentLocation || "—"}
          </Typography>
        </Stack>

        {/* Divider */}
        <Box sx={{ borderTop: `1px solid ${T.border}`, mb: 1.75 }} />

        {/* Label-value rows */}
        {[
          { label: "Category:", value: category },
          { label: "Tag Number:", value: asset.tagNumber },
          { label: "Purchase Cost:", value: asset.purchaseCost },
          { label: "status::", value: asset.status },
          { label: "Last Inspection:", value: formatDate(asset.createdAt) },
        ].map(({ label, value, highlight }) => (
          <Stack
            key={label}
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={0.85}
          >
            <Typography fontSize="0.8rem" color={T.text.label}>
              {label}
            </Typography>
            <Typography
              fontSize="0.8rem"
              fontWeight={600}
              color={highlight ? T.brand : T.text.primary}
            >
              {value}
            </Typography>
          </Stack>
        ))}
      </Box>

      {/* Action row */}
      {(isAdmin || canClone) && (
        <Stack
          direction="row"
          spacing={0.5}
          sx={{
            px: 2,
            pb: 1.5,
            borderTop: `1px solid ${T.border}`,
            pt: 1,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {canClone && (
            <Tooltip title="Clone asset">
              <IconButton
                size="small"
                onClick={() => onClone(asset)}
                sx={{
                  borderRadius: "8px",
                  bgcolor: T.brandLight,
                  "&:hover": { bgcolor: "#cfe8f3" },
                }}
              >
                <ContentCopy sx={{ fontSize: 13, color: T.brand }} />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={() => onEdit(asset)}
              sx={{
                borderRadius: "8px",
                bgcolor: T.brandLight,
                "&:hover": { bgcolor: "#cfe8f3" },
              }}
            >
              <Edit sx={{ fontSize: 13, color: T.brand }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="View details">
            <IconButton
              size="small"
              onClick={() => onView(asset)}
              sx={{
                borderRadius: "8px",
                bgcolor: "#f1f5f9",
                "&:hover": { bgcolor: "#e2e8f0" },
              }}
            >
              <Visibility sx={{ fontSize: 13, color: T.text.secondary }} />
            </IconButton>
          </Tooltip>
          {isAdmin && (
            <Tooltip title="Delete">
              <IconButton
                size="small"
                onClick={() => onDelete(asset)}
                sx={{
                  ml: "auto !important",
                  borderRadius: "8px",
                  bgcolor: "#fef2f2",
                  "&:hover": { bgcolor: "#fee2e2" },
                }}
              >
                <Delete sx={{ fontSize: 13, color: T.error }} />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      )}
    </Box>
  );
};

// ── Empty state ───────────────────────────────────────────────────────────────
const EmptyState = ({ hasFilters, onClear, onAdd }) => (
  <Box
    sx={{
      textAlign: "center",
      py: 12,
      bgcolor: T.surface,
      borderRadius: T.radius.card,
      border: `1px solid ${T.border}`,
    }}
  >
    {hasFilters ? (
      <SearchOff sx={{ fontSize: 40, color: T.text.muted, mb: 1.5 }} />
    ) : (
      <Inbox sx={{ fontSize: 40, color: T.text.muted, mb: 1.5 }} />
    )}
    <Typography fontWeight={700} color={T.text.primary} mb={0.5}>
      {hasFilters ? "No assets match your filters" : "No assets yet"}
    </Typography>
    <Typography fontSize="0.82rem" color={T.text.muted} mb={3}>
      {hasFilters
        ? "Try adjusting your search or filters"
        : "Add your first asset to get started"}
    </Typography>
    <Stack direction="row" spacing={1.5} justifyContent="center">
      {hasFilters && (
        <Button
          variant="outlined"
          onClick={onClear}
          startIcon={<ClearAll sx={{ fontSize: 14 }} />}
          sx={{
            textTransform: "none",
            borderRadius: T.radius.btn,
            borderColor: T.border,
            color: T.text.secondary,
            fontSize: "0.82rem",
          }}
        >
          Clear filters
        </Button>
      )}
      <Button
        variant="contained"
        onClick={onAdd}
        startIcon={<Add sx={{ fontSize: 14 }} />}
        sx={{
          textTransform: "none",
          borderRadius: T.radius.btn,
          bgcolor: T.brand,
          "&:hover": { bgcolor: T.brandDark },
          fontSize: "0.82rem",
        }}
      >
        Add Asset
      </Button>
    </Stack>
  </Box>
);

// ── Table skeleton ────────────────────────────────────────────────────────────
const TableSkeleton = () =>
  Array(6)
    .fill(null)
    .map((_, i) => (
      <TableRow key={i}>
        {Array(7)
          .fill(null)
          .map((_, j) => (
            <TableCell key={j}>
              <Skeleton height={16} />
            </TableCell>
          ))}
      </TableRow>
    ));

// ── Shared button styles ──────────────────────────────────────────────────────
const primaryBtn = {
  bgcolor: T.brand,
  color: "#fff",
  textTransform: "none",
  borderRadius: T.radius.btn,
  boxShadow: "none",
  fontWeight: 600,
  fontSize: "0.82rem",
  px: 2,
  "&:hover": { bgcolor: T.brandDark, boxShadow: "none" },
};
const ghostBtn = {
  textTransform: "none",
  borderRadius: T.radius.pill,
  borderColor: T.border,
  color: T.text.secondary,
  fontWeight: 500,
  fontSize: "0.82rem",
  "&:hover": { bgcolor: "#f8fafc", borderColor: "#cbd5e1" },
};

// ── Export helpers ────────────────────────────────────────────────────────────
const formatExportDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().split("T")[0];
};

const escapeCsvCell = (value) => {
  if (value === null || value === undefined) return "";
  const text = String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

const downloadCsv = (rows, filename) => {
  const csv = rows.map((row) => row.map(escapeCsvCell).join(",")).join("\r\n");
  const blob = new Blob([`\uFEFF${csv}`], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export default function AssetManagement() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { user } = useAuth();
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";

  const { getAllAssets, cloneAsset, deleteAsset, assetStats } = useAsset();

  // ── State ──────────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 1,
    page: 1,
    limit: 12,
  });

  const [viewMode, setViewMode] = useState("grid");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(""); // stores category NAME
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(12);
  const [orderBy, setOrderBy] = useState("createdAt");
  const [order, setOrder] = useState("desc");

  const [cloneOpen, setCloneOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [cloneName, setCloneName] = useState("");
  const [cloneLocation, setCloneLocation] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [dialogError, setDialogError] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const toast = (msg, sev = "success") =>
    setSnackbar({ open: true, message: msg, severity: sev });
  const allCategoriesRef = useRef(new Map());

  // ── Debounce search ────────────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchAssets = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const filters = {
        page: page + 1,
        limit: rowsPerPage,
        sortBy: orderBy,
        sortOrder: order,
      };
      if (debouncedSearch) filters.search = debouncedSearch;
      if (categoryFilter) filters.category = categoryFilter;
      if (statusFilter) filters.status = statusFilter;

      const data = await getAllAssets(filters);
      if (!data) return;

      setAssets(data.assets || []);
      const pag = data.pagination || {};
      setPagination({
        total: pag.total || 0,
        pages: pag.pages || 1,
        page: pag.page || 1,
        limit: pag.limit || rowsPerPage,
      });

      // Build the category dropdown options from whatever asset shapes we see.
      // Handles BOTH populated refs (assetCategoryId: {_id,name}) AND plain
      // string categories (assetCategory: "Furniture") — previously only the
      // first shape was captured, so the dropdown stayed empty for the
      // string-based assets shown in the screenshot.
      (data.assets || []).forEach((a) => {
        const name = getAssetCategoryName(a);
        const id = getAssetCategoryId(a) || name; // fall back to name as key
        if (name) {
          allCategoriesRef.current.set(id, { _id: id, name });
        }
      });
      setCategories([...allCategoriesRef.current.values()]);
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.message || "Unexpected error";
      setFetchError(msg);
      setAssets([]);
    } finally {
      setLoading(false);
    }
  }, [
    getAllAssets,
    page,
    rowsPerPage,
    orderBy,
    order,
    debouncedSearch,
    categoryFilter,
    statusFilter,
  ]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  // ── CLIENT-SIDE SAFETY-NET FILTER ────────────────────────────────────────
  // Always re-applies status/category filtering on whatever the server
  // returned. This guarantees correct on-screen results even if the backend
  // ignores or mis-handles the `status` / `category` query params.
  // NOTE: this does not fix server-side pagination totals — see the
  // "still TODO" note below.
  const visibleAssets = useMemo(() => {
    const searchTerm = norm(debouncedSearch);
    return assets.filter((a) => {
      const searchOk = !searchTerm || getSearchText(a).includes(searchTerm);
      const statusOk =
        !statusFilter || norm(a.status) === norm(statusFilter);
      const categoryOk =
        !categoryFilter || norm(getAssetCategoryName(a)) === norm(categoryFilter);
      return searchOk && statusOk && categoryOk;
    });
  }, [assets, debouncedSearch, statusFilter, categoryFilter]);

  const clearFilters = () => {
    setCategoryFilter("");
    setStatusFilter("");
    setSearch("");
    setDebouncedSearch("");
    setPage(0);
  };

  const handleSort = (col) => {
    setOrder(orderBy === col && order === "asc" ? "desc" : "asc");
    setOrderBy(col);
    setPage(0);
  };
  const handleViewAsset = (a) =>
    navigate(`/admin/assets/view/${a.id || a._id}`);
  const handleEditAsset = (a) =>
    navigate(`/admin/assets/edit/${a.id || a._id}`);

  const openCloneDialog = (asset) => {
    if (asset.isClone) {
      toast("Cloned assets cannot be cloned again", "warning");
      return;
    }
    setSelectedAsset(asset);
    setCloneName(`${asset.assetName} — Clone`);
    setCloneLocation(asset.currentLocation || "");
    setDialogError("");
    setCloneOpen(true);
  };

  const handleCloneConfirm = async () => {
    if (!cloneName.trim()) {
      setDialogError("Clone name is required.");
      return;
    }
    setActionLoading(true);
    setDialogError("");
    try {
      await cloneAsset(selectedAsset.id || selectedAsset._id, {
        assetName: cloneName.trim(),
        currentLocation: cloneLocation.trim() || undefined,
      });
      toast(`"${selectedAsset.assetName}" cloned successfully`);
      setCloneOpen(false);
      fetchAssets();
      navigate("/admin/assets/clone");
    } catch (err) {
      setDialogError(
        err?.response?.data?.message || err?.message || "Clone failed.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setActionLoading(true);
    setDialogError("");
    try {
      await deleteAsset(selectedAsset.id || selectedAsset._id);
      toast(`"${selectedAsset.assetName}" deleted`);
      setDeleteOpen(false);
      fetchAssets();
    } catch (err) {
      setDialogError(
        err?.response?.data?.message || err?.message || "Delete failed.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleExportAssets = () => {
    if (!visibleAssets.length) {
      toast("No assets available to export", "warning");
      return;
    }

    const rows = [
      [
        "Asset Name",
        "Tag Number",
        "Category",
        "Status",
        "Location",
        "Purchase Cost",
        "Purchase Date",
        "Warranty Expiry",
        "Last Inspection",
        "Created At",
      ],
      ...visibleAssets.map((asset) => [
        asset.assetName || "",
        asset.tagNumber || "",
        getAssetCategoryName(asset),
        asset.status || "",
        asset.currentLocation || "",
        asset.purchaseCost ?? "",
        formatExportDate(asset.purchaseDate || asset.acquisitionDate),
        formatExportDate(asset.warrantyExpiry),
        formatExportDate(
          asset.inspectionSystems?.amcInspection?.lastInspectionDate ||
            asset.inspectionSystems?.camcInspection?.lastInspectionDate,
        ),
        formatExportDate(asset.createdAt),
      ]),
    ];

    const stamp = new Date().toISOString().slice(0, 10);
    downloadCsv(rows, `assets-export-${stamp}.csv`);
    toast(
      `Exported ${visibleAssets.length} asset${visibleAssets.length === 1 ? "" : "s"}`,
    );
  };

  const hasFilters = !!(categoryFilter || statusFilter || debouncedSearch);
  const stats = assetStats || {};

  const headCellSx = {
    bgcolor: "#f8fafc",
    fontWeight: 700,
    fontSize: "0.65rem",
    color: T.text.muted,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    borderBottom: `1.5px solid ${T.border}`,
    whiteSpace: "nowrap",
    py: 1.5,
  };
  const cellSx = {
    py: "11px",
    fontSize: "0.8rem",
    borderBottom: `1px solid #f1f5f9`,
    color: T.text.secondary,
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ minHeight: "100vh" }}>
      {/* ── Page Header ── */}
      <Box sx={{ px: { xs: 2, md: 4 }, pt: 3, pb: 2.5 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={2}
        >
          <Box>
            <Typography
              fontWeight={800}
              fontSize={{ xs: "1.3rem", md: "1.5rem" }}
              color={T.text.primary}
              lineHeight={1.2}
            >
              Asset Management
            </Typography>
            <Typography fontSize="0.82rem" color={T.text.secondary} mt={0.4}>
              Track and manage your assets and equipment
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.25} flexWrap="wrap" useFlexGap>
            <Button
              variant="outlined"
              onClick={() => navigate("/admin/asset-requests")}
              startIcon={<Visibility sx={{ fontSize: 15 }} />}
              sx={{ ...ghostBtn, px: 2, py: 0.9 }}
            >
              {!isMobile && "My Asset Requests"}
            </Button>
            {isAdmin && (
              <Button
                variant="outlined"
                onClick={() => navigate("/admin/asset-categories")}
                startIcon={!isMobile && <Category sx={{ fontSize: 14 }} />}
                sx={{ ...primaryBtn, px: { xs: 1.5, sm: 2 } }}
              >
                {isMobile ? <Category sx={{ fontSize: 15 }} /> : "Categories"}
              </Button>
            )}
            <Button
              variant="contained"
              onClick={() => navigate("/admin/assets/clone")}
              startIcon={<ContentCopy sx={{ fontSize: 14 }} />}
              sx={{ ...primaryBtn, py: 0.9 }}
            >
              {!isMobile && "Clone Asset"}
            </Button>
            <Button
              variant="contained"
              onClick={() => navigate("/admin/assets/add")}
              startIcon={<Add sx={{ fontSize: 15 }} />}
              sx={{ ...primaryBtn, py: 0.9 }}
            >
              {!isMobile && "Add Asset"}
            </Button>
          </Stack>
        </Stack>
      </Box>

      {/* ── Search / Filter bar ── */}
      <Box sx={{ px: { xs: 2, md: 4 }, pb: 2.5 }}>
        <Paper
          elevation={0}
          sx={{
            borderRadius: T.radius.card,
            border: `1px solid ${T.border}`,
            p: 1.5,
            bgcolor: T.surface,
            boxShadow: T.shadow,
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={1.25}
            alignItems={{ md: "center" }}
          >
            {/* Search */}
            <TextField
              fullWidth
              size="small"
              placeholder="Search assets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ fontSize: 17, color: T.text.muted }} />
                  </InputAdornment>
                ),
                endAdornment: search && (
                  <IconButton size="small" onClick={() => setSearch("")}>
                    <Close sx={{ fontSize: 14 }} />
                  </IconButton>
                ),
                sx: {
                  borderRadius: T.radius.input,
                  fontSize: "0.85rem",
                  bgcolor: "#f8fafc",
                  "& fieldset": { borderColor: T.border },
                  "&:hover fieldset": { borderColor: "#cbd5e1" },
                  "&.Mui-focused fieldset": { borderColor: T.brand },
                },
              }}
            />

            {/* Category dropdown */}
            <FormControl size="small" sx={{ minWidth: 160, flexShrink: 0 }}>
              <Select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setPage(0);
                }}
                displayEmpty
                sx={{
                  borderRadius: T.radius.input,
                  fontSize: "0.85rem",
                  bgcolor: "#f8fafc",
                  "& fieldset": { borderColor: T.border },
                  "&:hover fieldset": { borderColor: "#cbd5e1" },
                  "& .MuiSelect-select": { py: "8.5px" },
                }}
              >
                <MenuItem
                  value=""
                  sx={{ fontSize: "0.85rem", color: T.text.secondary }}
                >
                  Category ▾
                </MenuItem>
                {categories.length === 0 ? (
                  <MenuItem disabled sx={{ fontSize: "0.8rem" }}>
                    No categories found
                  </MenuItem>
                ) : (
                  categories.map((c) => (
                    <MenuItem
                      key={c._id}
                      value={c.name}
                      sx={{ fontSize: "0.85rem" }}
                    >
                      {c.name}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>

            {/* Status dropdown */}
            <FormControl size="small" sx={{ minWidth: 150, flexShrink: 0 }}>
              <Select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(0);
                }}
                displayEmpty
                sx={{
                  borderRadius: T.radius.input,
                  fontSize: "0.85rem",
                  bgcolor: "#f8fafc",
                  "& fieldset": { borderColor: T.border },
                  "&:hover fieldset": { borderColor: "#cbd5e1" },
                  "& .MuiSelect-select": { py: "8.5px" },
                }}
              >
                <MenuItem
                  value=""
                  sx={{ fontSize: "0.85rem", color: T.text.secondary }}
                >
                  Status ▾
                </MenuItem>
                {STATUS_FILTER_OPTIONS.map((s) => (
                  <MenuItem key={s} value={s} sx={{ fontSize: "0.85rem" }}>
                    {s}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Grid / List toggle */}
            <Stack direction="row" spacing={0.5} flexShrink={0}>
              {[
                { mode: "grid", Icon: GridView },
                { mode: "list", Icon: ViewList },
              ].map(({ mode, Icon }) => (
                <IconButton
                  key={mode}
                  size="small"
                  onClick={() => setViewMode(mode)}
                  sx={{
                    borderRadius: "8px",
                    width: 34,
                    height: 34,
                    bgcolor: viewMode === mode ? T.brand : "#f1f5f9",
                    color: viewMode === mode ? "#fff" : T.text.secondary,
                    border: `1px solid ${viewMode === mode ? T.brand : T.border}`,
                    "&:hover": {
                      bgcolor: viewMode === mode ? T.brandDark : "#e2e8f0",
                    },
                  }}
                >
                  <Icon sx={{ fontSize: 16 }} />
                </IconButton>
              ))}
            </Stack>

            {/* Utility icons */}
            {[
              {
                icon: <Refresh sx={{ fontSize: 15 }} />,
                tip: "Refresh",
                fn: fetchAssets,
              },
              {
                icon: <FileDownload sx={{ fontSize: 15 }} />,
                tip: "Export",
                fn: handleExportAssets,
              },
            ].map(({ icon, tip, fn }) => (
              <Tooltip key={tip} title={tip}>
                <IconButton
                  size="small"
                  onClick={fn}
                  sx={{
                    borderRadius: "8px",
                    width: 34,
                    height: 34,
                    bgcolor: "#f1f5f9",
                    border: `1px solid ${T.border}`,
                    "&:hover": { bgcolor: "#e2e8f0" },
                  }}
                >
                  {icon}
                </IconButton>
              </Tooltip>
            ))}

            {hasFilters && (
              <Button
                onClick={clearFilters}
                startIcon={<ClearAll sx={{ fontSize: 13 }} />}
                sx={{
                  textTransform: "none",
                  fontSize: "0.8rem",
                  color: T.error,
                  borderRadius: T.radius.btn,
                  minWidth: "auto",
                  flexShrink: 0,
                }}
              >
                Clear
              </Button>
            )}
          </Stack>
        </Paper>
      </Box>

      {/* ── Content ── */}
      <Box sx={{ px: { xs: 2, md: 4 }, pb: 4 }}>
        {loading && (
          <LinearProgress
            sx={{
              mb: 2,
              borderRadius: 1,
              bgcolor: T.brandLight,
              "& .MuiLinearProgress-bar": { bgcolor: T.brand },
            }}
          />
        )}

        {!loading && fetchError && (
          <Box
            sx={{
              textAlign: "center",
              py: 10,
              bgcolor: T.surface,
              borderRadius: T.radius.card,
              border: `1px solid #fca5a5`,
            }}
          >
            <ErrorOutline sx={{ fontSize: 40, color: T.error, mb: 1.5 }} />
            <Typography fontWeight={700} color={T.text.primary} mb={0.5}>
              Failed to load assets
            </Typography>
            <Typography fontSize="0.82rem" color={T.text.muted} mb={3}>
              {fetchError}
            </Typography>
            <Button
              variant="contained"
              onClick={fetchAssets}
              startIcon={<Refresh sx={{ fontSize: 14 }} />}
              sx={{ ...primaryBtn }}
            >
              Retry
            </Button>
          </Box>
        )}

        {/* Grid View */}
        {!fetchError && viewMode === "grid" && (
          <>
            {loading ? (
              <Grid container spacing={2.5}>
                {Array(6)
                  .fill(null)
                  .map((_, i) => (
                    <Grid item xs={12} sm={6} md={4} key={i}>
                      <Skeleton
                        variant="rounded"
                        height={280}
                        sx={{ borderRadius: T.radius.card }}
                      />
                    </Grid>
                  ))}
              </Grid>
            ) : visibleAssets.length === 0 ? (
              <EmptyState
                hasFilters={hasFilters}
                onClear={clearFilters}
                onAdd={() => navigate("/admin/assets/add")}
              />
            ) : (
              <Grid container spacing={2.5}>
                {visibleAssets.map((asset) => (
                  <Grid item xs={12} sm={6} md={4} key={asset.id || asset._id}>
                    <AssetCard
                      asset={asset}
                      onView={handleViewAsset}
                      onClone={openCloneDialog}
                      onEdit={handleEditAsset}
                      onDelete={
                        isAdmin
                          ? (a) => {
                              setSelectedAsset(a);
                              setDialogError("");
                              setDeleteOpen(true);
                            }
                          : undefined
                      }
                      isAdmin={isAdmin}
                    />
                  </Grid>
                ))}
              </Grid>
            )}

            {pagination.pages > 1 && !loading && visibleAssets.length > 0 && (
              <Stack alignItems="center" mt={4}>
                <Pagination
                  count={pagination.pages}
                  page={page + 1}
                  onChange={(_, v) => setPage(v - 1)}
                  shape="rounded"
                  sx={{
                    "& .MuiPaginationItem-root": {
                      borderRadius: "8px",
                      fontSize: "0.82rem",
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

        {/* List View */}
        {!fetchError && viewMode === "list" && (
          <Paper
            elevation={0}
            sx={{
              borderRadius: T.radius.card,
              border: `1px solid ${T.border}`,
              overflow: "hidden",
              bgcolor: T.surface,
              boxShadow: T.shadow,
            }}
          >
            <TableContainer sx={{ maxHeight: 580 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    {[
                      { id: "assetName", label: "Asset" },
                      { id: "assetId", label: "ID" },
                      { id: null, label: "Category" },
                      { id: null, label: "Location" },
                      { id: "status", label: "Status" },
                      { id: null, label: "Type" },
                      { id: null, label: "Actions", align: "center" },
                    ].map(({ id, label, align }) => (
                      <TableCell key={label} align={align} sx={headCellSx}>
                        {id ? (
                          <TableSortLabel
                            active={orderBy === id}
                            direction={orderBy === id ? order : "asc"}
                            onClick={() => handleSort(id)}
                          >
                            {label}
                          </TableSortLabel>
                        ) : (
                          label
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableSkeleton />
                  ) : visibleAssets.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        align="center"
                        sx={{ py: 8, color: T.text.muted, fontSize: "0.82rem" }}
                      >
                        {hasFilters
                          ? "No assets match your filters."
                          : "No assets found."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    visibleAssets.map((asset) => (
                      <TableRow
                        hover
                        key={asset.id || asset._id}
                        onClick={() => handleViewAsset(asset)}
                        sx={{
                          cursor: "pointer",
                          "&:hover": { bgcolor: "#f8fafc" },
                          transition: "background 0.12s",
                        }}
                      >
                        <TableCell sx={cellSx}>
                          <Typography
                            fontWeight={700}
                            fontSize="0.82rem"
                            color={T.text.primary}
                          >
                            {asset.assetName}
                          </Typography>
                          {asset.isClone && (
                            <Typography
                              sx={{
                                fontSize: "0.6rem",
                                fontWeight: 700,
                                color: "#0369a1",
                                bgcolor: "#e0f2fe",
                                px: "4px",
                                py: "1px",
                                borderRadius: "3px",
                                display: "inline-block",
                                mt: 0.25,
                              }}
                            >
                              CLONE
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell sx={cellSx}>
                          <Typography
                            fontSize="0.72rem"
                            color={T.text.muted}
                            fontFamily="monospace"
                          >
                            {asset.assetId || "—"}
                          </Typography>
                        </TableCell>
                        <TableCell sx={cellSx}>
                          <Typography fontSize="0.78rem">
                            {getAssetCategoryName(asset) || "—"}
                          </Typography>
                        </TableCell>
                        <TableCell sx={cellSx}>
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={0.4}
                          >
                            <LocationOn
                              sx={{ fontSize: 11, color: T.text.muted }}
                            />
                            <Typography fontSize="0.78rem">
                              {asset.currentLocation || "—"}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell sx={cellSx}>
                          <StatusPill status={asset.status} />
                        </TableCell>
                        <TableCell sx={cellSx}>
                          <Typography
                            sx={{
                              fontSize: "0.68rem",
                              fontWeight: 700,
                              color: asset.isClone ? "#0369a1" : "#0f766e",
                              bgcolor: asset.isClone ? "#e0f2fe" : "#f0fdf4",
                              px: "7px",
                              py: "2px",
                              borderRadius: "4px",
                              display: "inline-block",
                            }}
                          >
                            {asset.isClone ? "Clone" : "Original"}
                          </Typography>
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={cellSx}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Stack
                            direction="row"
                            spacing={0.25}
                            justifyContent="center"
                          >
                            {!asset.isClone && (
                              <Tooltip title="Clone">
                                <IconButton
                                  size="small"
                                  onClick={() => openCloneDialog(asset)}
                                  sx={{ borderRadius: "6px" }}
                                >
                                  <ContentCopy
                                    sx={{ fontSize: 13, color: T.brand }}
                                  />
                                </IconButton>
                              </Tooltip>
                            )}
                            <Tooltip title="Edit">
                              <IconButton
                                size="small"
                                onClick={() => handleEditAsset(asset)}
                                sx={{ borderRadius: "6px" }}
                              >
                                <Edit sx={{ fontSize: 13, color: T.brand }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="View">
                              <IconButton
                                size="small"
                                onClick={() => handleViewAsset(asset)}
                                sx={{ borderRadius: "6px" }}
                              >
                                <Visibility
                                  sx={{ fontSize: 13, color: T.text.secondary }}
                                />
                              </IconButton>
                            </Tooltip>
                            {isAdmin && (
                              <Tooltip title="Delete">
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setSelectedAsset(asset);
                                    setDialogError("");
                                    setDeleteOpen(true);
                                  }}
                                  sx={{ borderRadius: "6px" }}
                                >
                                  <Delete
                                    sx={{ fontSize: 13, color: T.error }}
                                  />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[6, 12, 24, 48]}
              component="div"
              count={pagination.total}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(_, p) => setPage(p)}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              sx={{ borderTop: `1px solid ${T.border}`, fontSize: "0.78rem" }}
            />
          </Paper>
        )}
      </Box>

      {/* ── Clone Dialog ── */}
      <Dialog
        open={cloneOpen}
        onClose={() => !actionLoading && setCloneOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          elevation: 0,
          sx: {
            borderRadius: T.radius.dialog,
            border: `1px solid ${T.border}`,
            boxShadow: T.shadowMd,
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            fontSize: "0.95rem",
            borderBottom: `1px solid #f1f5f9`,
            pb: 1.5,
          }}
        >
          Clone Asset
          <Typography
            fontSize="0.75rem"
            color={T.text.muted}
            fontWeight={400}
            mt={0.25}
          >
            A new asset ID and tag will be auto-generated
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: "20px !important" }}>
          {dialogError && (
            <Alert
              severity="error"
              sx={{ mb: 2, borderRadius: "8px", fontSize: "0.78rem" }}
            >
              {dialogError}
            </Alert>
          )}
          <Typography fontSize="0.82rem" color={T.text.secondary} mb={2}>
            Creating a clone of{" "}
            <strong style={{ color: T.text.primary }}>
              {selectedAsset?.assetName}
            </strong>
          </Typography>
          <TextField
            fullWidth
            label="Clone Name *"
            size="small"
            value={cloneName}
            onChange={(e) => setCloneName(e.target.value)}
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                fontSize: "0.85rem",
              },
            }}
            error={!cloneName.trim()}
            helperText={!cloneName.trim() ? "Required" : ""}
          />
          <TextField
            fullWidth
            label="Location (optional)"
            size="small"
            value={cloneLocation}
            onChange={(e) => setCloneLocation(e.target.value)}
            helperText="Leave blank to inherit original location"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                fontSize: "0.85rem",
              },
            }}
          />
        </DialogContent>
        <DialogActions
          sx={{ p: 2.5, pt: 2, borderTop: `1px solid #f1f5f9`, gap: 1 }}
        >
          <Button
            onClick={() => setCloneOpen(false)}
            disabled={actionLoading}
            sx={{
              textTransform: "none",
              borderRadius: "8px",
              borderColor: T.border,
              color: T.text.secondary,
              fontSize: "0.82rem",
            }}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCloneConfirm}
            disabled={actionLoading || !cloneName.trim()}
            startIcon={
              actionLoading ? (
                <CircularProgress size={13} color="inherit" />
              ) : (
                <ContentCopy sx={{ fontSize: 14 }} />
              )
            }
            sx={primaryBtn}
          >
            {actionLoading ? "Cloning…" : "Confirm Clone"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete Dialog ── */}
      <Dialog
        open={deleteOpen}
        onClose={() => !actionLoading && setDeleteOpen(false)}
        maxWidth="xs"
        PaperProps={{
          elevation: 0,
          sx: {
            borderRadius: T.radius.dialog,
            border: `1px solid ${T.border}`,
            boxShadow: T.shadowMd,
          },
        }}
      >
        <DialogTitle
          sx={{ fontWeight: 700, fontSize: "0.95rem", color: T.text.primary }}
        >
          Delete Asset
        </DialogTitle>
        <DialogContent>
          {dialogError && (
            <Alert
              severity="error"
              sx={{ mb: 2, borderRadius: "8px", fontSize: "0.78rem" }}
            >
              {dialogError}
            </Alert>
          )}
          <Alert
            severity="error"
            sx={{ mb: 2, borderRadius: "8px", fontSize: "0.78rem" }}
          >
            This action is permanent and cannot be undone.
          </Alert>
          <Typography fontSize="0.82rem" color={T.text.secondary}>
            Are you sure you want to delete{" "}
            <strong style={{ color: T.text.primary }}>
              {selectedAsset?.assetName}
            </strong>
            ?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 0, gap: 1 }}>
          <Button
            onClick={() => setDeleteOpen(false)}
            disabled={actionLoading}
            variant="outlined"
            sx={{
              textTransform: "none",
              borderRadius: "8px",
              borderColor: T.border,
              color: T.text.secondary,
              fontSize: "0.82rem",
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            disabled={actionLoading}
            startIcon={
              actionLoading ? (
                <CircularProgress size={13} color="inherit" />
              ) : (
                <Delete sx={{ fontSize: 14 }} />
              )
            }
            sx={{
              ...primaryBtn,
              bgcolor: T.error,
              "&:hover": { bgcolor: "#b91c1c" },
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Snackbar ── */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
          sx={{
            borderRadius: "10px",
            fontSize: "0.82rem",
            boxShadow: T.shadowMd,
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

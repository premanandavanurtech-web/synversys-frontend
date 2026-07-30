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
  Checkbox,
  Pagination,
  Skeleton,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
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
  FilterList,
  Category,
  Edit,
  ErrorOutline,
  Inbox,
  SearchOff,
  Workspaces,
  AddBusiness,
} from "@mui/icons-material";
import { api, useAsset } from "../context/AssetContext";
import { useAuth } from "../context/AuthContexts";

// ── Design tokens matching the screenshot ────────────────────────────────────
const getTokens = (mode = "light") => {
  const dark = mode === "dark";
  return {
    mode,
    pageBg: dark ? "#07111f" : "#f0f4f7",
    surface: dark ? "#0c1726" : "#ffffff",
    surfaceAlt: dark ? "#101d2e" : "#f8fafc",
    surfaceHover: dark ? "#152338" : "#f1f5f9",
    surfaceHover2: dark ? "#1f314a" : "#e2e8f0",
    border: dark ? "rgba(148, 163, 184, 0.18)" : "#e4e9ee",
    borderHover: dark ? "rgba(148, 163, 184, 0.32)" : "#cbd5e1",
    borderSubtle: dark ? "rgba(148, 163, 184, 0.12)" : "#f1f5f9",
    text: {
      primary: dark ? "#f8fafc" : "#0d2b35",
      secondary: dark ? "#aeb8c8" : "#4a5568",
      muted: dark ? "#7f8da3" : "#94a3b8",
      label: dark ? "#9aa7ba" : "#6b7280",
    },
    brand: dark ? "#1aa6c4" : "#0d4f63",
    brandDark: dark ? "#0f6c84" : "#093a4a",
    brandLight: dark ? "rgba(26, 166, 196, 0.14)" : "#e8f4f8",
    brandHover: dark ? "rgba(26, 166, 196, 0.24)" : "#cfe8f3",
    error: dark ? "#f87171" : "#dc2626",
    errorBg: dark ? "rgba(248, 113, 113, 0.14)" : "#fef2f2",
    errorHoverBg: dark ? "rgba(248, 113, 113, 0.22)" : "#fee2e2",
    success: dark ? "#4ade80" : "#0f766e",
    successBg: dark ? "rgba(74, 222, 128, 0.14)" : "#f0fdf4",
    successHoverBg: dark ? "rgba(74, 222, 128, 0.22)" : "#d1fae5",
    warning: dark ? "#fb923c" : "#b45309",
    warningBg: dark ? "rgba(251, 146, 60, 0.14)" : "#fffbeb",
    warningHoverBg: dark ? "rgba(251, 146, 60, 0.22)" : "#ffedd5",
    childBg: dark ? "rgba(26, 166, 196, 0.14)" : "#e6f4f2",
    childColor: dark ? "#61d7ed" : "#0d4f63",
    parentBg: dark ? "rgba(96, 165, 250, 0.14)" : "#eef6ff",
    parentColor: dark ? "#93c5fd" : "#1d4ed8",
    radius: {
      card: "14px",
      pill: "999px",
      input: "10px",
      btn: "10px",
      dialog: "16px",
    },
    shadow: dark ? "0 1px 4px rgba(0,0,0,0.35)" : "0 1px 4px rgba(0,0,0,0.06)",
    shadowCard: dark ? "0 2px 8px rgba(0,0,0,0.35)" : "0 2px 8px rgba(0,0,0,0.06)",
    shadowMd: dark ? "0 4px 16px rgba(0,0,0,0.5)" : "0 4px 16px rgba(0,0,0,0.10)",
  };
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

const ASSET_TYPE_FILTER_OPTIONS = [
  { label: "Parent Asset", value: "parent" },
  { label: "Child Asset", value: "child" },
];

const StatusPill = ({ status = "", T }) => {
  const safeStatus = displayText(status, "Unknown");
  const cfg = STATUS_CFG[safeStatus] || { bg: "#6b7280", color: "#fff" };

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
      {safeStatus}
    </Box>
  );
};

// ── Helpers for robust, normalized comparisons ───────────────────────────────
// Lowercase + trim so "Active " / "active" / "ACTIVE" are treated the same.
const norm = (v) => (v ?? "").toString().trim().toLowerCase();

const displayText = (value, fallback = "—") => {
  if (value === null || value === undefined || value === "") return fallback;
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (Array.isArray(value)) {
    const text = value.map((item) => displayText(item, "")).filter(Boolean).join(", ");
    return text || fallback;
  }
  if (typeof value === "object") {
    return (
      value.name ||
      value.assetName ||
      value.label ||
      value.title ||
      value.locationName ||
      value.email ||
      value.assetId ||
      value.tagNumber ||
      value._id ||
      value.id ||
      fallback
    );
  }
  return String(value);
};

const getAssetCategoryName = (asset) =>
  asset?.assetCategoryId?.name || asset?.assetCategory || "";

const getAssetCategoryId = (asset) =>
  asset?.assetCategoryId?._id || asset?.assetCategoryId || "";

const getAssetPortfolioName = (asset) =>
  asset?.portfolioName ||
  asset?.metadata?.portfolioName ||
  asset?.metadata?.portfolio ||
  "";

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
    getAssetPortfolioName(asset),
    getAssetCategoryName(asset),
    getAssetCategoryId(asset),
  ]
    .map((value) => displayText(value, ""))
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

const isChildAssetRecord = (asset) => {
  const assetId = norm(asset?.assetId);
  const serialNumber = norm(asset?.serialNumber);
  const assetName = norm(asset?.assetName);

  return (
    norm(asset?.assetType) === "child" ||
    !!asset?.parentAssetId ||
    assetId.startsWith("ca-") ||
    assetId.startsWith("ca_") ||
    serialNumber.startsWith("ca-") ||
    serialNumber.startsWith("ca_") ||
    assetName.includes("child")
  );
};

const isCloneAssetRecord = (asset) => {
  const name = norm(asset?.assetName);
  return (
    asset?.isClone === true ||
    !!asset?.clonedFrom ||
    name.endsWith("- clone") ||
    name.endsWith("clone") ||
    name.endsWith("_copy")
  );
};

const getLinkedAssetId = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value._id || value.id || value.assetId || "";
};

const getExistingAssetId = (asset) => asset?.id || asset?._id;

const isExistingAssetReadyForSelection = (asset, portfolioFilter, overrideAssetIds = []) => {
  const assetId = getExistingAssetId(asset);
  if (!assetId) return false;
  const currentPortfolio = getAssetPortfolioName(asset);
  const inOtherPortfolio =
    currentPortfolio && norm(currentPortfolio) !== norm(portfolioFilter);
  return !inOtherPortfolio || overrideAssetIds.includes(assetId);
};

const getCloneSourceAsset = (asset, assets = []) => {
  const sourceId = getLinkedAssetId(asset?.clonedFrom || asset?.parentAssetId);
  if (!sourceId) return asset?.clonedFrom || asset?.parentAssetId || null;

  return (
    assets.find((candidate) => {
      const ids = [
        candidate?._id,
        candidate?.id,
        candidate?.assetId,
      ].filter(Boolean).map(String);
      return ids.includes(String(sourceId));
    }) ||
    asset?.clonedFrom ||
    asset?.parentAssetId ||
    null
  );
};

// ── Asset Card — matches screenshot cards exactly ────────────────────────────
const AssetCard = ({
  asset,
  T,
  onView,
  onClone,
  onDelete,
  onEdit,
  onPortfolio,
  isAdmin,
  canViewFinancials,
  canViewPortfolio,
}) => {
  const canClone = !asset.isClone && asset.canBeCloned !== false;
  const isChildAsset = isChildAssetRecord(asset);
  const isCloneAsset = isCloneAssetRecord(asset);
  const cloneVersion = asset?.cloneInfo?.version || asset?.cloneVersion;
  const portfolioName = getAssetPortfolioName(asset);
  asset = {
    ...asset,
    assetName: displayText(asset.assetName, "Untitled asset"),
    assetId: displayText(asset.assetId),
    tagNumber: displayText(asset.tagNumber),
    currentLocation: displayText(asset.currentLocation),
    purchaseCost: displayText(asset.purchaseCost, "0"),
    status: displayText(asset.status, "Unknown"),
  };

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
        width: "100%",
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
            {isChildAsset && (
              <Box
                component="span"
                sx={{
                  ml: 0.75,
                  color: T.brand,
                  fontWeight: 800,
                  whiteSpace: "nowrap",
                }}
              >
                (child)
              </Box>
            )}
          </Typography>
          <StatusPill status={asset.status} T={T} />
        </Stack>
        <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap>
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            px: 1,
            py: 0.35,
            mb: 1.25,
            borderRadius: "6px",
            bgcolor: isChildAsset ? T.childBg : T.parentBg,
            color: isChildAsset ? T.childColor : T.parentColor,
            fontSize: "0.68rem",
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.03em",
          }}
        >
          {isChildAsset ? "Child Asset" : "Parent Asset"}
        </Box>
        {isCloneAsset && (
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              px: 1,
              py: 0.35,
              mb: 1.25,
              borderRadius: "6px",
              bgcolor: T.brandLight,
              color: T.brand,
              fontSize: "0.68rem",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.03em",
            }}
          >
            Clone{cloneVersion ? ` v${cloneVersion}` : ""}
          </Box>
        )}
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
          { label: isChildAsset ? "Child ID:" : "Asset ID:", value: asset.assetId },
          { label: "Tag Number:", value: asset.tagNumber },
          canViewFinancials && { label: "Purchase Cost:", value: asset.purchaseCost },
          { label: "status::", value: asset.status },
          { label: "Last Inspection:", value: formatDate(asset.createdAt) },
        ].filter(Boolean).map(({ label, value, highlight }) => (
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
              {displayText(value)}
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
                  "&:hover": { bgcolor: T.brandHover },
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
                "&:hover": { bgcolor: T.brandHover },
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
                bgcolor: T.surfaceHover,
                "&:hover": { bgcolor: T.surfaceHover2 },
              }}
            >
              <Visibility sx={{ fontSize: 13, color: T.text.secondary }} />
            </IconButton>
          </Tooltip>
          {canViewPortfolio && (portfolioName ? (
            <Tooltip title={`Portfolio: ${portfolioName}`}>
              <IconButton
                size="small"
                sx={{
                  borderRadius: "8px",
                  bgcolor: T.successBg,
                  "&:hover": { bgcolor: T.successHoverBg },
                }}
              >
                <Workspaces sx={{ fontSize: 13, color: T.success }} />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip title="Add portfolio name">
              <IconButton
                size="small"
                onClick={() => onPortfolio(asset)}
                sx={{
                  borderRadius: "8px",
                  bgcolor: T.warningBg,
                  "&:hover": { bgcolor: T.warningHoverBg },
                }}
              >
                <AddBusiness sx={{ fontSize: 13, color: T.warning }} />
              </IconButton>
            </Tooltip>
          ))}
          {isAdmin && (
            <Tooltip title="Delete">
              <IconButton
                size="small"
                onClick={() => onDelete(asset)}
                sx={{
                  ml: "auto !important",
                  borderRadius: "8px",
                  bgcolor: T.errorBg,
                  "&:hover": { bgcolor: T.errorHoverBg },
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
const EmptyState = ({ T, hasFilters, onClear, onAdd }) => (
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
const getPrimaryBtn = (T) => ({
  bgcolor: T.brand,
  color: "#fff",
  textTransform: "none",
  borderRadius: T.radius.btn,
  boxShadow: "none",
  fontWeight: 600,
  fontSize: "0.82rem",
  px: 2,
  "&:hover": { bgcolor: T.brandDark, boxShadow: "none" },
});
const getGhostBtn = (T) => ({
  textTransform: "none",
  borderRadius: T.radius.pill,
  borderColor: T.border,
  color: T.text.secondary,
  fontWeight: 500,
  fontSize: "0.82rem",
  "&:hover": { bgcolor: T.surfaceAlt, borderColor: T.borderHover },
});

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
  const isTeam = user?.role === "team";
  const canViewFinancials = user?.role !== "team";
  const canViewPortfolio = !isTeam;

  const { getAllAssets, cloneAsset, deleteAsset, updateAsset, assetStats } = useAsset();
  const T = useMemo(() => getTokens(theme.palette.mode), [theme.palette.mode]);
  const primaryBtn = useMemo(() => getPrimaryBtn(T), [T]);
  const ghostBtn = useMemo(() => getGhostBtn(T), [T]);

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
  const [portfolioFilter, setPortfolioFilter] = useState("");
  const [portfolioOptions, setPortfolioOptions] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [assetTypeFilter, setAssetTypeFilter] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(12);
  const [orderBy, setOrderBy] = useState("createdAt");
  const [order, setOrder] = useState("desc");

  const [cloneOpen, setCloneOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [portfolioOpen, setPortfolioOpen] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [existingAssetOpen, setExistingAssetOpen] = useState(false);
  const [existingAssets, setExistingAssets] = useState([]);
  const [existingAssetLoading, setExistingAssetLoading] = useState(false);
  const [existingAssetSearch, setExistingAssetSearch] = useState("");
  const [selectedExistingAssetIds, setSelectedExistingAssetIds] = useState([]);
  const [portfolioOverrideAssetIds, setPortfolioOverrideAssetIds] = useState([]);
  const [portfolioChangeConfirm, setPortfolioChangeConfirm] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [cloneName, setCloneName] = useState("");
  const [cloneLocation, setCloneLocation] = useState("");
  const [portfolioName, setPortfolioName] = useState("");
  const [portfolioEntryMode, setPortfolioEntryMode] = useState("select");
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
      if (canViewPortfolio && portfolioFilter) filters.portfolioName = portfolioFilter;
      if (statusFilter) filters.status = statusFilter;
      if (assetTypeFilter) filters.assetType = assetTypeFilter;

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
      if (canViewPortfolio) setPortfolioOptions((prev) => {
        const names = new Set(prev);
        (data.assets || []).forEach((a) => {
          const name = getAssetPortfolioName(a);
          if (name) names.add(name);
        });
        return Array.from(names).sort((a, b) => a.localeCompare(b));
      });
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
    portfolioFilter,
    statusFilter,
    assetTypeFilter,
    canViewPortfolio,
  ]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  useEffect(() => {
    if (!canViewPortfolio && portfolioFilter) {
      setPortfolioFilter("");
    }
  }, [canViewPortfolio, portfolioFilter]);

  useEffect(() => {
    let active = true;

    if (!canViewPortfolio) {
      setPortfolioOptions([]);
      return () => {
        active = false;
      };
    }

    api
      .get("/assets/portfolios")
      .then((res) => {
        if (!active) return;
        const portfolios = Array.isArray(res.data?.portfolios)
          ? res.data.portfolios
          : [];
        setPortfolioOptions((prev) =>
          Array.from(new Set([...prev, ...portfolios])).sort((a, b) =>
            a.localeCompare(b),
          ),
        );
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [canViewPortfolio]);

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
      const portfolioOk =
        !canViewPortfolio ||
        !portfolioFilter ||
        norm(getAssetPortfolioName(a)) === norm(portfolioFilter);
      const assetTypeOk =
        !assetTypeFilter ||
        (assetTypeFilter === "child"
          ? isChildAssetRecord(a)
          : !isChildAssetRecord(a));
      return searchOk && statusOk && categoryOk && portfolioOk && assetTypeOk;
    });
  }, [assets, debouncedSearch, statusFilter, categoryFilter, portfolioFilter, assetTypeFilter, canViewPortfolio]);

  const portfolioDialogOptions = useMemo(() => {
    const names = new Set(portfolioOptions);
    const current = getAssetPortfolioName(selectedAsset);
    if (current) names.add(current);
    return Array.from(names).sort((a, b) => a.localeCompare(b));
  }, [portfolioOptions, selectedAsset]);

  const filteredExistingAssets = useMemo(() => {
    const term = norm(existingAssetSearch);
    if (!term) return existingAssets;
    return existingAssets.filter((asset) =>
      [
        asset.assetName,
        asset.tagNumber,
        asset.serialNumber,
        asset.assetId,
        getAssetCategoryName(asset),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [existingAssets, existingAssetSearch]);

  const selectableExistingAssetIds = useMemo(
    () =>
      filteredExistingAssets
        .filter((asset) =>
          isExistingAssetReadyForSelection(
            asset,
            portfolioFilter,
            portfolioOverrideAssetIds,
          ),
        )
        .map(getExistingAssetId)
        .filter(Boolean),
    [filteredExistingAssets, portfolioFilter, portfolioOverrideAssetIds],
  );
  const selectableExistingAssetIdSet = useMemo(
    () => new Set(selectableExistingAssetIds),
    [selectableExistingAssetIds],
  );
  const selectedReadyExistingAssetCount = selectedExistingAssetIds.filter((assetId) =>
    selectableExistingAssetIdSet.has(assetId),
  ).length;
  const allReadyExistingAssetsSelected =
    selectableExistingAssetIds.length > 0 &&
    selectedReadyExistingAssetCount === selectableExistingAssetIds.length;
  const someReadyExistingAssetsSelected =
    selectedReadyExistingAssetCount > 0 && !allReadyExistingAssetsSelected;

  const toggleAllReadyExistingAssets = () => {
    if (selectableExistingAssetIds.length === 0 || actionLoading) return;
    setSelectedExistingAssetIds((prev) => {
      if (allReadyExistingAssetsSelected) {
        return prev.filter((assetId) => !selectableExistingAssetIdSet.has(assetId));
      }
      return Array.from(new Set([...prev, ...selectableExistingAssetIds]));
    });
  };

  const clearFilters = () => {
    setCategoryFilter("");
    setPortfolioFilter("");
    setStatusFilter("");
    setAssetTypeFilter("");
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

  const openPortfolioDialog = (asset) => {
    if (!canViewPortfolio) return;
    const currentPortfolio = getAssetPortfolioName(asset);
    setSelectedAsset(asset);
    setPortfolioName(currentPortfolio);
    setPortfolioEntryMode(currentPortfolio ? "existing" : "select");
    setDialogError("");
    setPortfolioOpen(true);
  };

  const openExistingAssetDialog = async () => {
    if (!canViewPortfolio || !portfolioFilter) return;
    setExistingAssetOpen(true);
    setExistingAssetLoading(true);
    setDialogError("");
    setExistingAssetSearch("");
    setSelectedExistingAssetIds([]);
    setPortfolioOverrideAssetIds([]);
    setPortfolioChangeConfirm(null);
    try {
      const params = new URLSearchParams({
        page: "1",
        limit: "1000",
        sortBy: "createdAt",
        sortOrder: "desc",
      });
      const res = await api.get(`/assets?${params.toString()}`);
      setExistingAssets(
        (res.data?.assets || []).filter((asset) => {
          if (isCloneAssetRecord(asset)) return false;
          const currentPortfolio = getAssetPortfolioName(asset);
          return !currentPortfolio || norm(currentPortfolio) !== norm(portfolioFilter);
        }),
      );
    } catch (err) {
      setDialogError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load existing assets.",
      );
      setExistingAssets([]);
    } finally {
      setExistingAssetLoading(false);
    }
  };

  const closeExistingAssetDialog = (force = false) => {
    if (actionLoading && !force) return;
    setExistingAssetOpen(false);
    setExistingAssets([]);
    setExistingAssetSearch("");
    setSelectedExistingAssetIds([]);
    setPortfolioOverrideAssetIds([]);
    setPortfolioChangeConfirm(null);
    setDialogError("");
  };

  const selectExistingAsset = (asset) => {
    const assetId = asset.id || asset._id;
    if (!assetId) return;
    setSelectedExistingAssetIds((prev) =>
      prev.includes(assetId)
        ? prev.filter((id) => id !== assetId)
        : [...prev, assetId],
    );
  };

  const toggleExistingAsset = (asset) => {
    const assetId = asset.id || asset._id;
    if (!assetId) return;

    const currentPortfolio = getAssetPortfolioName(asset);
    const belongsToOtherPortfolio =
      currentPortfolio && norm(currentPortfolio) !== norm(portfolioFilter);
    const overrideAllowed = portfolioOverrideAssetIds.includes(assetId);

    if (belongsToOtherPortfolio && !overrideAllowed) {
      setPortfolioChangeConfirm({ asset, assetId, currentPortfolio });
      return;
    }

    selectExistingAsset(asset);
  };

  const confirmPortfolioChange = () => {
    if (!portfolioChangeConfirm) return;
    const { assetId } = portfolioChangeConfirm;
    setPortfolioOverrideAssetIds((prev) =>
      prev.includes(assetId) ? prev : [...prev, assetId],
    );
    setSelectedExistingAssetIds((prev) =>
      prev.includes(assetId) ? prev : [...prev, assetId],
    );
    setPortfolioChangeConfirm(null);
  };

  const cancelPortfolioChange = () => {
    setPortfolioChangeConfirm(null);
  };

  const handleAddExistingAssets = async () => {
    if (!portfolioFilter || selectedExistingAssetIds.length === 0) return;
    setActionLoading(true);
    setDialogError("");
    try {
      await Promise.all(
        selectedExistingAssetIds.map((assetId) =>
          updateAsset(assetId, { portfolioName: portfolioFilter }),
        ),
      );
      toast(
        `${selectedExistingAssetIds.length} asset${
          selectedExistingAssetIds.length === 1 ? "" : "s"
        } added to ${portfolioFilter}`,
      );
      closeExistingAssetDialog(true);
      await fetchAssets();
    } catch (err) {
      setDialogError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to add selected assets to portfolio.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handlePortfolioConfirm = async () => {
    if (!canViewPortfolio) return;
    const trimmed = portfolioName.trim();
    if (!trimmed) {
      setDialogError("Portfolio name is required.");
      return;
    }

    setActionLoading(true);
    setDialogError("");
    try {
      await updateAsset(selectedAsset.id || selectedAsset._id, {
        portfolioName: trimmed,
      });
      setPortfolioOptions((prev) =>
        Array.from(new Set([...prev, trimmed])).sort((a, b) =>
          a.localeCompare(b),
        ),
      );
      toast("Portfolio name added successfully");
      setPortfolioOpen(false);
      setPortfolioName("");
      setPortfolioEntryMode("select");
      await fetchAssets();
    } catch (err) {
      setDialogError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update portfolio name.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const openCloneDialog = (asset) => {
    if (asset.isClone) {
      toast("Cloned assets cannot be cloned again", "warning");
      return;
    }
    setSelectedAsset(asset);
    setCloneName(`${asset.assetName} - Clone`);
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

    const header = [
        "Asset Name",
        "Tag Number",
        "Category",
        "Status",
        "Location",
        "Purchase Date",
        "Warranty Expiry",
        "Last Inspection",
        "Created At",
      ];
    if (canViewFinancials) header.splice(5, 0, "Purchase Cost");

    const rows = [
      header,
      ...visibleAssets.map((asset) => {
        const row = [
        asset.assetName || "",
        asset.tagNumber || "",
        getAssetCategoryName(asset),
        asset.status || "",
        asset.currentLocation || "",
        formatExportDate(asset.purchaseDate || asset.acquisitionDate),
        formatExportDate(asset.warrantyExpiry),
        formatExportDate(
          asset.inspectionSystems?.amcInspection?.lastInspectionDate ||
            asset.inspectionSystems?.camcInspection?.lastInspectionDate,
        ),
        formatExportDate(asset.createdAt),
        ];
        if (canViewFinancials) row.splice(5, 0, asset.purchaseCost ?? "");
        return row;
      }),
    ];

    const stamp = new Date().toISOString().slice(0, 10);
    downloadCsv(rows, `assets-export-${stamp}.csv`);
    toast(
      `Exported ${visibleAssets.length} asset${visibleAssets.length === 1 ? "" : "s"}`,
    );
  };

  const hasFilters = !!(
    categoryFilter ||
    (canViewPortfolio && portfolioFilter) ||
    statusFilter ||
    assetTypeFilter ||
    debouncedSearch
  );
  const stats = assetStats || {};

  const headCellSx = {
    bgcolor: T.surfaceAlt,
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
    borderBottom: `1px solid ${T.borderSubtle}`,
    color: T.text.secondary,
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: T.pageBg, color: T.text.primary }}>
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
            {canViewPortfolio && portfolioFilter && (
              <Button
                variant="contained"
                onClick={openExistingAssetDialog}
                startIcon={<AddBusiness sx={{ fontSize: 15 }} />}
                sx={{ ...primaryBtn, py: 0.9 }}
              >
                {!isMobile && "Add Existing Asset"}
              </Button>
            )}
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
          <Stack direction="row" spacing={1.25} alignItems="center">
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
                  bgcolor: T.surfaceAlt,
                  "& fieldset": { borderColor: T.border },
                  "&:hover fieldset": { borderColor: T.borderHover },
                  "&.Mui-focused fieldset": { borderColor: T.brand },
                },
              }}
            />

            {isMobile && (
              <Tooltip title="Filters">
                <IconButton
                  size="small"
                  onClick={() => setMobileFiltersOpen(true)}
                  sx={{
                    borderRadius: "12px",
                    width: 40,
                    height: 40,
                    flexShrink: 0,
                    bgcolor: hasFilters ? T.brand : T.surfaceAlt,
                    color: hasFilters ? "#fff" : T.brand,
                    border: `1px solid ${hasFilters ? T.brand : T.border}`,
                    "&:hover": {
                      bgcolor: hasFilters ? T.brandDark : T.surfaceHover2,
                    },
                  }}
                >
                  <FilterList sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            )}

            {!isMobile && (
              <>
            {/* Portfolio dropdown */}
            {canViewPortfolio && (
              <FormControl size="small" sx={{ minWidth: 170, flexShrink: 0 }}>
                <Select
                  value={portfolioFilter}
                  onChange={(e) => {
                    setPortfolioFilter(e.target.value);
                    setPage(0);
                  }}
                  displayEmpty
                  sx={{
                    borderRadius: T.radius.input,
                    fontSize: "0.85rem",
                    bgcolor: T.surfaceAlt,
                    "& fieldset": { borderColor: T.border },
                    "&:hover fieldset": { borderColor: T.borderHover },
                    "& .MuiSelect-select": { py: "8.5px" },
                  }}
                >
                  <MenuItem
                    value=""
                    sx={{ fontSize: "0.85rem", color: T.text.secondary }}
                  >
                    Portfolio
                  </MenuItem>
                  {portfolioOptions.length === 0 ? (
                    <MenuItem disabled sx={{ fontSize: "0.8rem" }}>
                      No portfolios found
                    </MenuItem>
                  ) : (
                    portfolioOptions.map((name) => (
                      <MenuItem
                        key={name}
                        value={name}
                        sx={{ fontSize: "0.85rem" }}
                      >
                        {name}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            )}

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
                  bgcolor: T.surfaceAlt,
                  "& fieldset": { borderColor: T.border },
                  "&:hover fieldset": { borderColor: T.borderHover },
                  "& .MuiSelect-select": { py: "8.5px" },
                }}
              >
                <MenuItem
                  value=""
                  sx={{ fontSize: "0.85rem", color: T.text.secondary }}
                >
                  Category 
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

            {/* Asset type dropdown */}
            <FormControl size="small" sx={{ minWidth: 160, flexShrink: 0 }}>
              <Select
                value={assetTypeFilter}
                onChange={(e) => {
                  setAssetTypeFilter(e.target.value);
                  setPage(0);
                }}
                displayEmpty
                sx={{
                  borderRadius: T.radius.input,
                  fontSize: "0.85rem",
                  bgcolor: T.surfaceAlt,
                  "& fieldset": { borderColor: T.border },
                  "&:hover fieldset": { borderColor: T.borderHover },
                  "& .MuiSelect-select": { py: "8.5px" },
                }}
              >
                <MenuItem
                  value=""
                  sx={{ fontSize: "0.85rem", color: T.text.secondary }}
                >
                  Asset Type 
                </MenuItem>
                {ASSET_TYPE_FILTER_OPTIONS.map((type) => (
                  <MenuItem
                    key={type.value}
                    value={type.value}
                    sx={{ fontSize: "0.85rem" }}
                  >
                    {type.label}
                  </MenuItem>
                ))}
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
                  bgcolor: T.surfaceAlt,
                  "& fieldset": { borderColor: T.border },
                  "&:hover fieldset": { borderColor: T.borderHover },
                  "& .MuiSelect-select": { py: "8.5px" },
                }}
              >
                <MenuItem
                  value=""
                  sx={{ fontSize: "0.85rem", color: T.text.secondary }}
                >
                 Asset Status 
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
                    bgcolor: viewMode === mode ? T.brand : T.surfaceHover,
                    color: viewMode === mode ? "#fff" : T.text.secondary,
                    border: `1px solid ${viewMode === mode ? T.brand : T.border}`,
                    "&:hover": {
                      bgcolor: viewMode === mode ? T.brandDark : T.surfaceHover2,
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
                    bgcolor: T.surfaceHover,
                    border: `1px solid ${T.border}`,
                    "&:hover": { bgcolor: T.surfaceHover2 },
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
              </>
            )}
          </Stack>
        </Paper>
      </Box>

      {/* ── Content ── */}
      <Dialog
        open={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          sx: {
            display: { xs: "flex", md: "none" },
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            m: 0,
            width: "100%",
            maxWidth: "none",
            borderRadius: "22px 22px 0 0",
            maxHeight: "88dvh",
          },
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "center", pt: 1.5 }}>
          <Box sx={{ width: 44, height: 4, borderRadius: 999, bgcolor: T.border }} />
        </Box>
        <DialogTitle sx={{ py: 1.5, px: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <FilterList sx={{ fontSize: 18, color: T.brand }} />
            <Typography sx={{ fontWeight: 800, color: T.text.primary, fontSize: "1rem" }}>
              Filters
            </Typography>
          </Stack>
          <IconButton size="small" onClick={() => setMobileFiltersOpen(false)}>
            <Close sx={{ fontSize: 18 }} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ px: 2, pb: 1.5 }}>
          <Stack spacing={1.2}>
            {canViewPortfolio && (
              <FormControl size="small" fullWidth>
                <Select value={portfolioFilter} onChange={(e) => { setPortfolioFilter(e.target.value); setPage(0); }} displayEmpty sx={{ borderRadius: T.radius.input, fontSize: "0.85rem", bgcolor: T.surfaceAlt, "& fieldset": { borderColor: T.border }, "& .MuiSelect-select": { py: "10px" } }}>
                  <MenuItem value="" sx={{ fontSize: "0.85rem", color: T.text.secondary }}>Portfolio</MenuItem>
                  {portfolioOptions.length === 0 ? (
                    <MenuItem disabled sx={{ fontSize: "0.8rem" }}>No portfolios found</MenuItem>
                  ) : (
                    portfolioOptions.map((name) => <MenuItem key={name} value={name} sx={{ fontSize: "0.85rem" }}>{name}</MenuItem>)
                  )}
                </Select>
              </FormControl>
            )}
            <FormControl size="small" fullWidth>
              <Select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(0); }} displayEmpty sx={{ borderRadius: T.radius.input, fontSize: "0.85rem", bgcolor: T.surfaceAlt, "& fieldset": { borderColor: T.border }, "& .MuiSelect-select": { py: "10px" } }}>
                <MenuItem value="" sx={{ fontSize: "0.85rem", color: T.text.secondary }}>Category</MenuItem>
                {categories.length === 0 ? (
                  <MenuItem disabled sx={{ fontSize: "0.8rem" }}>No categories found</MenuItem>
                ) : (
                  categories.map((c) => <MenuItem key={c._id} value={c.name} sx={{ fontSize: "0.85rem" }}>{c.name}</MenuItem>)
                )}
              </Select>
            </FormControl>
            <FormControl size="small" fullWidth>
              <Select value={assetTypeFilter} onChange={(e) => { setAssetTypeFilter(e.target.value); setPage(0); }} displayEmpty sx={{ borderRadius: T.radius.input, fontSize: "0.85rem", bgcolor: T.surfaceAlt, "& fieldset": { borderColor: T.border }, "& .MuiSelect-select": { py: "10px" } }}>
                <MenuItem value="" sx={{ fontSize: "0.85rem", color: T.text.secondary }}>Asset Type</MenuItem>
                {ASSET_TYPE_FILTER_OPTIONS.map((type) => <MenuItem key={type.value} value={type.value} sx={{ fontSize: "0.85rem" }}>{type.label}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" fullWidth>
              <Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }} displayEmpty sx={{ borderRadius: T.radius.input, fontSize: "0.85rem", bgcolor: T.surfaceAlt, "& fieldset": { borderColor: T.border }, "& .MuiSelect-select": { py: "10px" } }}>
                <MenuItem value="" sx={{ fontSize: "0.85rem", color: T.text.secondary }}>Asset Status</MenuItem>
                {STATUS_FILTER_OPTIONS.map((s) => <MenuItem key={s} value={s} sx={{ fontSize: "0.85rem" }}>{s}</MenuItem>)}
              </Select>
            </FormControl>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
              {[{ mode: "grid", Icon: GridView }, { mode: "list", Icon: ViewList }].map(({ mode, Icon }) => (
                <IconButton key={mode} size="small" onClick={() => setViewMode(mode)} sx={{ borderRadius: "10px", width: 38, height: 38, bgcolor: viewMode === mode ? T.brand : T.surfaceHover, color: viewMode === mode ? "#fff" : T.text.secondary, border: `1px solid ${viewMode === mode ? T.brand : T.border}` }}>
                  <Icon sx={{ fontSize: 16 }} />
                </IconButton>
              ))}
              <IconButton size="small" onClick={fetchAssets} sx={{ borderRadius: "10px", width: 38, height: 38, bgcolor: T.surfaceHover, border: `1px solid ${T.border}` }}>
                <Refresh sx={{ fontSize: 15 }} />
              </IconButton>
              <IconButton size="small" onClick={handleExportAssets} sx={{ borderRadius: "10px", width: 38, height: 38, bgcolor: T.surfaceHover, border: `1px solid ${T.border}` }}>
                <FileDownload sx={{ fontSize: 15 }} />
              </IconButton>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: "calc(16px + env(safe-area-inset-bottom))", pt: 1 }}>
          {hasFilters && (
            <Button onClick={clearFilters} startIcon={<ClearAll sx={{ fontSize: 14 }} />} sx={{ color: T.error, textTransform: "none", mr: "auto" }}>
              Clear
            </Button>
          )}
          <Button variant="contained" onClick={() => setMobileFiltersOpen(false)} sx={{ bgcolor: T.brand, borderRadius: T.radius.btn, textTransform: "none", fontWeight: 700, px: 3, "&:hover": { bgcolor: T.brandDark } }}>
            Apply
          </Button>
        </DialogActions>
      </Dialog>

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
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, minmax(0, 1fr))",
                    lg: "repeat(3, minmax(0, 1fr))",
                  },
                  gap: 2.5,
                }}
              >
                {Array(6)
                  .fill(null)
                  .map((_, i) => (
                    <Skeleton
                      key={i}
                      variant="rounded"
                      height={280}
                      sx={{ borderRadius: T.radius.card }}
                    />
                  ))}
              </Box>
            ) : visibleAssets.length === 0 ? (
              <EmptyState
                T={T}
                hasFilters={hasFilters}
                onClear={clearFilters}
                onAdd={() => navigate("/admin/assets/add")}
              />
            ) : (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, minmax(0, 1fr))",
                    lg: "repeat(3, minmax(0, 1fr))",
                  },
                  gap: 2.5,
                }}
              >
                {visibleAssets.map((asset) => (
                  <AssetCard
                    key={asset.id || asset._id}
                    asset={asset}
                    T={T}
                    onView={handleViewAsset}
                    onClone={openCloneDialog}
                    onEdit={handleEditAsset}
                    onPortfolio={openPortfolioDialog}
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
                    canViewFinancials={canViewFinancials}
                    canViewPortfolio={canViewPortfolio}
                  />
                ))}
              </Box>
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
          isMobile ? (
            <>
              {loading ? (
                <Stack spacing={1.5}>
                  {Array(4)
                    .fill(null)
                    .map((_, i) => (
                      <Skeleton
                        key={i}
                        variant="rounded"
                        height={280}
                        sx={{ borderRadius: T.radius.card }}
                      />
                    ))}
                </Stack>
              ) : visibleAssets.length === 0 ? (
                <EmptyState
                  T={T}
                  hasFilters={hasFilters}
                  onClear={clearFilters}
                  onAdd={() => navigate("/admin/assets/add")}
                />
              ) : (
                <>
                  <Stack spacing={1.5}>
                    {visibleAssets.map((asset) => (
                      <AssetCard
                        key={asset.id || asset._id}
                        asset={asset}
                        T={T}
                        onView={handleViewAsset}
                        onClone={openCloneDialog}
                        onEdit={handleEditAsset}
                        onPortfolio={openPortfolioDialog}
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
                        canViewFinancials={canViewFinancials}
                        canViewPortfolio={canViewPortfolio}
                      />
                    ))}
                  </Stack>
                  <Paper
                    elevation={0}
                    sx={{
                      mt: 1.5,
                      borderRadius: T.radius.card,
                      border: `1px solid ${T.border}`,
                      overflow: "hidden",
                    }}
                  >
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
                      sx={{
                        fontSize: "0.72rem",
                        "& .MuiTablePagination-toolbar": {
                          px: 1,
                          justifyContent: "center",
                          flexWrap: "wrap",
                          gap: 0.5,
                        },
                        "& .MuiTablePagination-spacer": { display: "none" },
                        "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
                          m: 0,
                          fontSize: "0.72rem",
                        },
                      }}
                    />
                  </Paper>
                </>
              )}
            </>
          ) : (
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
                    visibleAssets.map((asset) => {
                      const isCloneAsset = isCloneAssetRecord(asset);
                      const sourceAsset = getCloneSourceAsset(asset, assets);

                      return (
                      <TableRow
                        hover
                        key={asset.id || asset._id}
                        onClick={() => handleViewAsset(asset)}
                        sx={{
                          cursor: "pointer",
                          "&:hover": { bgcolor: T.surfaceAlt },
                          transition: "background 0.12s",
                        }}
                      >
                        <TableCell sx={cellSx}>
                          <Typography
                            fontWeight={700}
                            fontSize="0.82rem"
                            color={T.text.primary}
                          >
                            {displayText(asset.assetName, "Untitled asset")}
                            {isChildAssetRecord(asset) && (
                              <Box
                                component="span"
                                sx={{
                                  ml: 0.75,
                                  color: T.brand,
                                  fontWeight: 800,
                                  whiteSpace: "nowrap",
                                }}
                              >
                                (child)
                              </Box>
                            )}
                          </Typography>
                          <Box
                            component="span"
                            sx={{
                              display: "inline-flex",
                              alignItems: "center",
                              mt: 0.5,
                              px: 0.75,
                              py: 0.2,
                              borderRadius: "5px",
                              bgcolor: isChildAssetRecord(asset)
                                ? T.childBg
                                : T.parentBg,
                              color: isChildAssetRecord(asset)
                                ? T.brand
                                : "#1d4ed8",
                              fontSize: "0.58rem",
                              fontWeight: 800,
                              textTransform: "uppercase",
                              letterSpacing: "0.03em",
                            }}
                          >
                            {isChildAssetRecord(asset)
                              ? "Child Asset"
                              : "Parent Asset"}
                          </Box>
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
                          {isCloneAsset && (
                            <Typography
                              sx={{
                                display: "block",
                                mt: 0.6,
                                fontSize: "0.68rem",
                                color: T.text.secondary,
                              }}
                            >
                              Source: {displayText(sourceAsset, "Original asset")}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell sx={cellSx}>
                          <Typography
                            fontSize="0.72rem"
                            color={T.text.muted}
                            fontFamily="monospace"
                          >
                            {displayText(asset.assetId)}
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
                              {displayText(asset.currentLocation)}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell sx={cellSx}>
                          <StatusPill status={asset.status} T={T} />
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
                      );
                    })
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
          )
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
            borderBottom: `1px solid ${T.borderSubtle}`,
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
          sx={{ p: 2.5, pt: 2, borderTop: `1px solid ${T.borderSubtle}`, gap: 1 }}
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
        open={existingAssetOpen}
        onClose={() => closeExistingAssetDialog()}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
        sx={{
          "& .MuiDialog-container": {
            alignItems: { xs: "stretch", sm: "center" },
          },
        }}
        PaperProps={{
          elevation: 0,
          sx: {
            borderRadius: { xs: 0, sm: T.radius.dialog },
            border: `1px solid ${T.border}`,
            boxShadow: T.shadowMd,
            m: { xs: 0, sm: 2 },
            width: { xs: "100%", sm: "calc(100% - 32px)" },
            maxWidth: { xs: "none", sm: 900 },
            height: { xs: "100dvh", sm: "auto" },
            maxHeight: { xs: "100dvh", sm: "calc(100% - 64px)" },
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
        <DialogTitle
          sx={{
            fontWeight: 800,
            fontSize: "1rem",
            borderBottom: `1px solid ${T.borderSubtle}`,
            pb: 1.5,
          }}
        >
          Add Existing Asset
        </DialogTitle>
        <DialogContent sx={{ pt: "20px !important", flex: 1, overflowY: "auto" }}>
          {dialogError && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: "8px", fontSize: "0.78rem" }}>
              {dialogError}
            </Alert>
          )}

          <TextField
            fullWidth
            size="small"
            placeholder="Search existing assets..."
            value={existingAssetSearch}
            onChange={(e) => setExistingAssetSearch(e.target.value)}
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": {
                borderRadius: "10px",
                bgcolor: T.surfaceAlt,
                fontSize: "0.85rem",
                "& fieldset": { borderColor: T.border },
                "&:hover fieldset": { borderColor: T.borderHover },
                "&.Mui-focused fieldset": { borderColor: T.brand },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ fontSize: 17, color: T.text.muted }} />
                </InputAdornment>
              ),
              endAdornment: existingAssetSearch && (
                <IconButton size="small" onClick={() => setExistingAssetSearch("")}>
                  <Close sx={{ fontSize: 14 }} />
                </IconButton>
              ),
            }}
          />

          {existingAssetLoading ? (
            <Stack alignItems="center" justifyContent="center" sx={{ py: 6 }}>
              <CircularProgress size={28} />
              <Typography sx={{ mt: 1.5, fontSize: "0.85rem", color: T.text.muted }}>
                Loading assets...
              </Typography>
            </Stack>
          ) : existingAssets.length === 0 ? (
            <Alert severity="info" sx={{ borderRadius: "10px" }}>
              No existing assets found.
            </Alert>
          ) : filteredExistingAssets.length === 0 ? (
            <Alert severity="info" sx={{ borderRadius: "10px" }}>
              No assets match your search.
            </Alert>
          ) : isMobile ? (
            <Stack spacing={1.25}>
              <Stack
                direction="row"
                alignItems="center"
                spacing={0.75}
                sx={{
                  border: `1px solid ${T.border}`,
                  borderRadius: "10px",
                  bgcolor: T.surfaceAlt,
                  px: 1.25,
                  py: 0.75,
                }}
              >
                <Checkbox
                  size="small"
                  checked={allReadyExistingAssetsSelected}
                  indeterminate={someReadyExistingAssetsSelected}
                  disabled={actionLoading || selectableExistingAssetIds.length === 0}
                  onChange={toggleAllReadyExistingAssets}
                  inputProps={{ "aria-label": "Select all ready assets" }}
                  sx={{ color: T.brand, "&.Mui-checked": { color: T.brand } }}
                />
                <Typography sx={{ color: T.text.secondary, fontSize: "0.78rem", fontWeight: 800 }}>
                  Select all ready assets
                </Typography>
              </Stack>
              {filteredExistingAssets.map((asset) => {
                const assetId = asset.id || asset._id;
                const currentPortfolio = displayText(getAssetPortfolioName(asset), "");
                const inOtherPortfolio =
                  currentPortfolio && norm(currentPortfolio) !== norm(portfolioFilter);
                const overrideAllowed = portfolioOverrideAssetIds.includes(assetId);
                const checked = selectedExistingAssetIds.includes(assetId);
                const disabled = inOtherPortfolio && !overrideAllowed;

                return (
                  <Paper
                    key={assetId}
                    elevation={0}
                    sx={{
                      border: `1px solid ${checked ? T.brand : T.border}`,
                      borderRadius: "12px",
                      bgcolor: checked ? "#f0f8fb" : "#fff",
                      p: 1.5,
                    }}
                  >
                    <Stack direction="row" spacing={1.25} alignItems="flex-start">
                      <Checkbox
                        size="small"
                        checked={checked}
                        disabled={disabled || actionLoading}
                        onChange={() => toggleExistingAsset(asset)}
                        sx={{ color: T.brand, mt: -0.25, "&.Mui-checked": { color: T.brand } }}
                      />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={1}>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography sx={{ fontWeight: 800, fontSize: "0.9rem", color: T.text.primary }} noWrap>
                              {displayText(asset.assetName, "Untitled asset")}
                            </Typography>
                            <Typography sx={{ color: T.text.muted, fontSize: "0.72rem", mt: 0.25 }}>
                              ID: {displayText(asset.assetId, "-")}
                            </Typography>
                            <Typography sx={{ color: T.text.muted, fontSize: "0.72rem" }}>
                              Tag: {displayText(asset.tagNumber || asset.serialNumber, "-")}
                            </Typography>
                          </Box>
                          <StatusPill status={asset.status} T={T} />
                        </Stack>

                        <Box
                          sx={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: 1,
                            mt: 1.25,
                          }}
                        >
                          <Box>
                            <Typography sx={{ color: T.text.muted, fontSize: "0.66rem", fontWeight: 800, textTransform: "uppercase" }}>
                              Category
                            </Typography>
                            <Typography sx={{ color: T.text.secondary, fontSize: "0.78rem", fontWeight: 600 }}>
                              {displayText(getAssetCategoryName(asset), "-")}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography sx={{ color: T.text.muted, fontSize: "0.66rem", fontWeight: 800, textTransform: "uppercase" }}>
                              Portfolio
                            </Typography>
                            <Typography sx={{ color: currentPortfolio ? T.text.secondary : T.text.muted, fontSize: "0.78rem", fontWeight: 600 }}>
                              {currentPortfolio || "-"}
                            </Typography>
                          </Box>
                        </Box>

                        {inOtherPortfolio && !overrideAllowed ? (
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => toggleExistingAsset(asset)}
                            disabled={actionLoading}
                            sx={{
                              mt: 1.25,
                              textTransform: "none",
                              borderRadius: "8px",
                              fontSize: "0.74rem",
                              color: T.brand,
                              borderColor: T.border,
                            }}
                          >
                            Change Portfolio
                          </Button>
                        ) : (
                          <Typography sx={{ mt: 1.25, color: T.text.muted, fontSize: "0.74rem", fontWeight: 600 }}>
                            Ready
                          </Typography>
                        )}
                      </Box>
                    </Stack>
                  </Paper>
                );
              })}
            </Stack>
          ) : (
            <TableContainer
              component={Paper}
              elevation={0}
              sx={{
                border: `1px solid ${T.border}`,
                borderRadius: "12px",
                maxHeight: 430,
              }}
            >
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: 94, ...headCellSx }}>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <Checkbox
                          size="small"
                          checked={allReadyExistingAssetsSelected}
                          indeterminate={someReadyExistingAssetsSelected}
                          disabled={actionLoading || selectableExistingAssetIds.length === 0}
                          onChange={toggleAllReadyExistingAssets}
                          inputProps={{ "aria-label": "Select all ready assets" }}
                          sx={{
                            p: 0,
                            color: T.brand,
                            "&.Mui-checked": { color: T.brand },
                            "&.MuiCheckbox-indeterminate": { color: T.brand },
                          }}
                        />
                        <Box component="span">Select</Box>
                      </Stack>
                    </TableCell>
                    <TableCell sx={headCellSx}>Asset</TableCell>
                    <TableCell sx={headCellSx}>Category</TableCell>
                    <TableCell sx={headCellSx}>Portfolio Name</TableCell>
                    <TableCell sx={{ width: 160, ...headCellSx }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredExistingAssets.map((asset) => {
                    const assetId = asset.id || asset._id;
                    const currentPortfolio = getAssetPortfolioName(asset);
                    const inOtherPortfolio =
                      currentPortfolio && norm(currentPortfolio) !== norm(portfolioFilter);
                    const overrideAllowed = portfolioOverrideAssetIds.includes(assetId);
                    const checked = selectedExistingAssetIds.includes(assetId);
                    const disabled = inOtherPortfolio && !overrideAllowed;

                    return (
                      <TableRow key={assetId} hover>
                        <TableCell>
                          <Checkbox
                            size="small"
                            checked={checked}
                            disabled={disabled || actionLoading}
                            onChange={() => toggleExistingAsset(asset)}
                            sx={{ color: T.brand, "&.Mui-checked": { color: T.brand } }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ fontWeight: 700, fontSize: "0.86rem" }}>
                            {displayText(asset.assetName, "Untitled asset")}
                          </Typography>
                          <Typography sx={{ color: T.text.muted, fontSize: "0.74rem" }}>
                            ID: {displayText(asset.assetId, "-")}
                          </Typography>
                          <Typography sx={{ color: T.text.muted, fontSize: "0.74rem" }}>
                            Tag: {displayText(asset.tagNumber || asset.serialNumber, "-")}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ fontSize: "0.82rem", color: T.text.secondary }}>
                          {getAssetCategoryName(asset) || "-"}
                        </TableCell>
                        <TableCell>
                          <Typography
                            sx={{
                              color: currentPortfolio ? T.text.secondary : T.text.muted,
                              fontSize: "0.82rem",
                              fontWeight: currentPortfolio ? 700 : 500,
                            }}
                          >
                            {currentPortfolio || "-"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {inOtherPortfolio && !overrideAllowed ? (
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => toggleExistingAsset(asset)}
                              disabled={actionLoading}
                              sx={{
                                textTransform: "none",
                                borderRadius: "8px",
                                fontSize: "0.74rem",
                                color: T.brand,
                                borderColor: T.border,
                              }}
                            >
                              Change Portfolio
                            </Button>
                          ) : (
                            <Typography sx={{ color: T.text.muted, fontSize: "0.76rem" }}>
                              Ready
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            p: 2.5,
            pb: { xs: "calc(20px + env(safe-area-inset-bottom))", sm: 2.5 },
            pt: 2,
            borderTop: `1px solid ${T.borderSubtle}`,
            gap: 1,
          }}
        >
          <Typography sx={{ mr: "auto", color: T.text.muted, fontSize: "0.8rem", fontWeight: 600 }}>
            {selectedExistingAssetIds.length} selected
          </Typography>
          <Button
            onClick={() => closeExistingAssetDialog()}
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
            variant="contained"
            onClick={handleAddExistingAssets}
            disabled={actionLoading || existingAssetLoading || selectedExistingAssetIds.length === 0}
            startIcon={
              actionLoading ? (
                <CircularProgress size={13} color="inherit" />
              ) : (
                <AddBusiness sx={{ fontSize: 14 }} />
              )
            }
            sx={primaryBtn}
          >
            {actionLoading ? "Adding..." : "Add Selected"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(portfolioChangeConfirm)}
        onClose={cancelPortfolioChange}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          elevation: 0,
          sx: {
            borderRadius: "16px",
            border: `1px solid ${T.border}`,
            boxShadow: T.shadowMd,
          },
        }}
      >
        <DialogTitle
          sx={{
            pb: 1,
            display: "flex",
            alignItems: "center",
            gap: 1.25,
            fontSize: "1rem",
            fontWeight: 800,
          }}
        >
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: "10px",
              bgcolor: T.warningBg,
              color: T.warning,
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
            }}
          >
            <ErrorOutline sx={{ fontSize: 20 }} />
          </Box>
          Change Portfolio Group?
        </DialogTitle>
        <DialogContent sx={{ pt: "8px !important" }}>
          <Typography sx={{ color: T.text.secondary, fontSize: "0.9rem", lineHeight: 1.6 }}>
            This asset already belongs to another portfolio. Do you want to move it to the selected portfolio?
          </Typography>
          {portfolioChangeConfirm && (
            <Box
              sx={{
                mt: 2,
                p: 1.5,
                borderRadius: "10px",
                bgcolor: T.surfaceAlt,
                border: `1px solid ${T.border}`,
              }}
            >
              <Typography sx={{ fontWeight: 800, fontSize: "0.86rem", color: T.text.primary }}>
                {portfolioChangeConfirm.asset?.assetName || "Selected asset"}
              </Typography>
              <Typography sx={{ mt: 0.4, color: T.text.muted, fontSize: "0.78rem" }}>
                From: {portfolioChangeConfirm.currentPortfolio} | To: {portfolioFilter}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 1.5, gap: 1 }}>
          <Button
            onClick={cancelPortfolioChange}
            variant="outlined"
            sx={{
              textTransform: "none",
              borderRadius: "8px",
              borderColor: T.border,
              color: T.text.secondary,
              fontWeight: 700,
            }}
          >
            No
          </Button>
          <Button
            onClick={confirmPortfolioChange}
            variant="contained"
            sx={{ ...primaryBtn, minWidth: 92 }}
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={portfolioOpen}
        onClose={() => !actionLoading && setPortfolioOpen(false)}
        maxWidth="xs"
        fullWidth
        fullScreen={isMobile}
        sx={{
          "& .MuiDialog-container": {
            alignItems: { xs: "stretch", sm: "center" },
          },
        }}
        PaperProps={{
          elevation: 0,
          sx: {
            borderRadius: { xs: 0, sm: T.radius.dialog },
            border: `1px solid ${T.border}`,
            boxShadow: T.shadowMd,
            m: { xs: 0, sm: 2 },
            width: { xs: "100%", sm: "calc(100% - 32px)" },
            maxWidth: { xs: "none", sm: 444 },
            height: { xs: "100dvh", sm: "auto" },
            maxHeight: { xs: "100dvh", sm: "calc(100% - 64px)" },
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
        <DialogTitle
          sx={{
            fontWeight: 700,
            fontSize: "0.95rem",
            borderBottom: `1px solid ${T.borderSubtle}`,
            pb: 1.5,
          }}
        >
          Add Portfolio Name
          <Typography
            fontSize="0.75rem"
            color={T.text.muted}
            fontWeight={400}
            mt={0.25}
          >
            {selectedAsset?.assetName || "Asset"}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: "20px !important", flex: 1, overflowY: "auto" }}>
          {dialogError && (
            <Alert
              severity="error"
              sx={{ mb: 2, borderRadius: "8px", fontSize: "0.78rem" }}
            >
              {dialogError}
            </Alert>
          )}
          <Typography
            sx={{
              mb: 0.75,
              fontSize: "0.72rem",
              fontWeight: 800,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: T.text.secondary,
            }}
          >
            Portfolio Name *
          </Typography>
          <FormControl fullWidth size="small">
            <Select
              autoFocus
              displayEmpty
              value={
                portfolioEntryMode === "new"
                  ? "__new__"
                  : portfolioName || ""
              }
              onChange={(e) => {
                const value = e.target.value;
                setDialogError("");
                if (value === "__new__") {
                  setPortfolioEntryMode("new");
                  setPortfolioName("");
                  return;
                }
                setPortfolioEntryMode(value ? "existing" : "select");
                setPortfolioName(value);
              }}
              renderValue={(value) => {
                if (value === "__new__") return "New portfolio";
                if (value) return value;
                return (
                  <span style={{ color: T.text.muted }}>
                    Select portfolio...
                  </span>
                );
              }}
              sx={{
                borderRadius: "10px",
                fontSize: "0.9rem",
                "& .MuiSelect-select": { py: "10px", px: "14px" },
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    borderRadius: "12px",
                    mt: 0.5,
                    border: `1px solid ${T.border}`,
                    boxShadow: T.shadowMd,
                  },
                },
              }}
            >
              {portfolioDialogOptions.length > 0 ? (
                portfolioDialogOptions.map((name) => (
                  <MenuItem key={name} value={name}>
                    {name}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>
                  <Typography
                    sx={{
                      fontSize: "0.8rem",
                      color: T.text.muted,
                      fontStyle: "italic",
                    }}
                  >
                    No portfolios available
                  </Typography>
                </MenuItem>
              )}
              <Divider sx={{ my: 0.5 }} />
              <MenuItem value="__new__">
                <Stack direction="row" alignItems="center" spacing={0.75}>
                  <AddBusiness sx={{ fontSize: 16, color: T.brand }} />
                  <Typography
                    sx={{
                      color: T.brand,
                      fontSize: "0.875rem",
                      fontWeight: 700,
                    }}
                  >
                    Add New Portfolio
                  </Typography>
                </Stack>
              </MenuItem>
            </Select>
          </FormControl>
          {portfolioEntryMode === "new" && (
            <TextField
              fullWidth
              label="Enter Portfolio Name *"
              size="small"
              value={portfolioName}
              onChange={(e) => {
                setPortfolioName(e.target.value);
                if (dialogError) setDialogError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && portfolioName.trim() && !actionLoading) {
                  handlePortfolioConfirm();
                }
              }}
              sx={{
                mt: 2,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  fontSize: "0.85rem",
                },
              }}
              error={!portfolioName.trim()}
              helperText={!portfolioName.trim() ? "Required" : ""}
            />
          )}
        </DialogContent>
        <DialogActions
          sx={{
            p: 2.5,
            pb: { xs: "calc(20px + env(safe-area-inset-bottom))", sm: 2.5 },
            pt: 2,
            borderTop: `1px solid ${T.borderSubtle}`,
            gap: 1,
          }}
        >
          <Button
            onClick={() => setPortfolioOpen(false)}
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
            onClick={handlePortfolioConfirm}
            disabled={actionLoading || !portfolioName.trim()}
            startIcon={
              actionLoading ? (
                <CircularProgress size={13} color="inherit" />
              ) : (
                <AddBusiness sx={{ fontSize: 14 }} />
              )
            }
            sx={primaryBtn}
          >
            {actionLoading ? "Saving..." : "Save Portfolio"}
          </Button>
        </DialogActions>
      </Dialog>

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
  anchorOrigin={{ vertical: "top", horizontal: "right" }}>
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
  

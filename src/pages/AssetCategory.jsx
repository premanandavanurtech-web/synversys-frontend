// src/pages/AssetCategoryPage.jsx
// ── Fully Mobile Responsive · Modern Typography · All Screen Sizes ─────────────
import { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Stack,
  TextField,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Dialog,
  DialogContent,
  InputAdornment,
  Tooltip,
  Skeleton,
  Alert,
  Snackbar,
  Switch,
  CircularProgress,
  Fade,
  alpha,
  useMediaQuery,
  useTheme,
  Card,
  CardContent,
  Divider,
  LinearProgress,
  Drawer,
  AppBar,
  Toolbar,
  BottomNavigation,
  BottomNavigationAction,
  Fab,
  Zoom,
  SwipeableDrawer,
  Badge,
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  Search,
  Category,
  Close,
  Check,
  Refresh,
  ClearAll,
  ToggleOn,
  ToggleOff,
  FolderOpen,
  Layers,
  ArrowBack,
  SearchOff,
  Lock,
  Warning,
  ErrorOutline,
  CheckCircle,
  InfoOutlined,
  GridView,
  TableRows,
  WifiOff,
  Inventory2,
  Menu,
  MoreVert,
  FilterList,
  Sort,
  Home,
  Dashboard,
  Settings,
} from "@mui/icons-material";
import { useAssetCategory } from "../context/AssetCategoryContexts";
import { useAuth } from "../context/AuthContexts";
import { useNavigate } from "react-router-dom";
import { keyframes } from "@mui/material/styles";

// ─── Modern Font System ───────────────────────────────────────────────────────
const typography = {
  fontFamily: {
    primary:
      "'Sora', 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
    heading: "'Sora', 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
  mono: "'Sora', 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",

  },
  weights: {
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
};

// ─── Animations ───────────────────────────────────────────────────────────────
const fadeUp = keyframes`from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}`;
const fadeIn = keyframes`from{opacity:0}to{opacity:1}`;
const slideRight = keyframes`from{opacity:0;transform:translateX(-16px)}to{opacity:1;transform:translateX(0)}`;
const slideUp = keyframes`from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}`;
const scaleIn = keyframes`from{opacity:0;transform:scale(0.92)}to{opacity:1;transform:scale(1)}`;

// ─── Design Tokens ────────────────────────────────────────────────────────────
const T = {
  // Surfaces
  bg: "#F5F7F6",
  surface: "#FFFFFF",
  surfaceAlt: "#FAFBFB",
  surfaceHov: "#F0F2F1",
  // Borders
  border: "#E2E8F0",
  borderMid: "#CBD5E1",
  // Brand — modern teal
  brand: "#0f4556",
  brandMid: "#11657c",
  brandLight: "#E6F3F3",
  brandGlow: "rgba(15,91,92,0.12)",
  brandPale: "#F0F7F7",
  // Ink
  ink: "#1E2A32",
  inkSec: "#5A6B76",
  inkMut: "#8D9BA6",
  // Semantic
  green: "#059669",
  greenBg: "#D1FAE5",
  red: "#DC2626",
  redBg: "#FEE2E2",
  amber: "#D97706",
  amberBg: "#FEF3C7",
  blue: "#2563EB",
  blueBg: "#DBEAFE",
  purple: "#7C3AED",
  purpleBg: "#EDE9FE",
  // Shadows
  sh: {
    xs: "0 1px 2px rgba(0,0,0,0.04)",
    sm: "0 2px 4px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.03)",
    md: "0 6px 16px rgba(0,0,0,0.06), 0 2px 6px rgba(0,0,0,0.04)",
    lg: "0 16px 40px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04)",
    xl: "0 24px 64px rgba(0,0,0,0.12), 0 8px 24px rgba(0,0,0,0.06)",
  },
  r: { xs: "6px", sm: "10px", md: "14px", lg: "18px", xl: "24px" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

// ─── Stat Card (Responsive) ───────────────────────────────────────────────────
const StatCard = ({ label, value, icon, bg, delay = 0, isMobile }) => (
  <Box
    sx={{
      p: isMobile ? 1.5 : 2.5,
      borderRadius: T.r.lg,
      bgcolor: T.surface,
      border: `1px solid ${T.border}`,
      boxShadow: T.sh.xs,
      animation: `${fadeUp} 0.45s ${delay}s ease both`,
      flex: 1,
      minWidth: 0,
      transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
      "&:active": { transform: isMobile ? "scale(0.98)" : "none" },
      "&:hover": { boxShadow: isMobile ? T.sh.md : T.sh.lg },
    }}
  >
    <Stack direction="row" alignItems="center" justifyContent="space-between">
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          sx={{
            fontSize: isMobile ? "0.6rem" : "0.7rem",
            fontWeight: typography.weights.extrabold,
            color: T.inkMut,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            fontFamily: typography.fontFamily.primary,
            mb: 0.5,
          }}
        >
          {label}
        </Typography>
        <Typography
          sx={{
            fontSize: isMobile ? "1.4rem" : "1.8rem",
            fontWeight: typography.weights.extrabold,
            color: T.ink,
            fontFamily: typography.fontFamily.heading,
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
          }}
        >
          {value ?? "—"}
        </Typography>
      </Box>
      <Box
        sx={{
          width: isMobile ? 36 : 44,
          height: isMobile ? 36 : 44,
          borderRadius: T.r.md,
          bgcolor: bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
    </Stack>
  </Box>
);

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ active, isMobile }) => (
  <Chip
    label={active ? "Active" : "Inactive"}
    size="small"
    sx={{
      height: isMobile ? 20 : 22,
      fontSize: isMobile ? "0.6rem" : "0.7rem",
      fontWeight: typography.weights.bold,
      fontFamily: typography.fontFamily.primary,
      bgcolor: active ? T.greenBg : T.surfaceAlt,
      color: active ? T.green : T.inkMut,
      borderRadius: T.r.xs,
      border: `1px solid ${active ? alpha(T.green, 0.25) : T.border}`,
      "& .MuiChip-label": { px: isMobile ? "6px" : "8px" },
    }}
  />
);

// ─── Error Banner ─────────────────────────────────────────────────────────────
const ErrorBanner = ({ message, onRetry, onDismiss, isMobile }) => (
  <Fade in>
    <Box
      sx={{
        p: isMobile ? "12px 14px" : "14px 18px",
        borderRadius: T.r.md,
        bgcolor: T.redBg,
        border: `1px solid ${alpha(T.red, 0.22)}`,
        display: "flex",
        alignItems: "center",
        gap: isMobile ? 1 : 2,
        mb: 2,
        animation: `${fadeUp} 0.35s ease`,
      }}
    >
      <ErrorOutline
        sx={{ color: T.red, fontSize: isMobile ? 18 : 20, flexShrink: 0 }}
      />
      <Typography
        sx={{
          flex: 1,
          fontSize: isMobile ? "0.75rem" : "0.85rem",
          color: T.red,
          fontFamily: typography.fontFamily.primary,
          fontWeight: typography.weights.medium,
          lineHeight: 1.4,
        }}
      >
        {message}
      </Typography>
      <Stack direction="row" spacing={0.5}>
        {onRetry && (
          <Button
            size="small"
            onClick={onRetry}
            sx={{
              textTransform: "none",
              color: T.red,
              fontFamily: typography.fontFamily.primary,
              fontWeight: typography.weights.bold,
              fontSize: isMobile ? "0.7rem" : "0.75rem",
              borderRadius: T.r.xs,
              border: `1px solid ${alpha(T.red, 0.35)}`,
              px: isMobile ? 1 : 1.5,
              py: isMobile ? 0.25 : 0.5,
              minWidth: "auto",
              "&:hover": { bgcolor: alpha(T.red, 0.08) },
            }}
          >
            Retry
          </Button>
        )}
        {onDismiss && (
          <IconButton
            size="small"
            onClick={onDismiss}
            sx={{
              color: T.red,
              borderRadius: T.r.xs,
              p: isMobile ? 0.5 : 0.75,
            }}
          >
            <Close sx={{ fontSize: isMobile ? 13 : 15 }} />
          </IconButton>
        )}
      </Stack>
    </Box>
  </Fade>
);

// ─── Network Error (Mobile Friendly) ─────────────────────────────────────────
const NetworkError = ({ onRetry, isMobile }) => (
  <Box sx={{ py: isMobile ? 6 : 8, textAlign: "center" }}>
    <Box
      sx={{
        width: isMobile ? 64 : 80,
        height: isMobile ? 64 : 80,
        borderRadius: "50%",
        bgcolor: T.redBg,
        border: `1.5px solid ${alpha(T.red, 0.2)}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        mx: "auto",
        mb: 2,
      }}
    >
      <WifiOff sx={{ fontSize: isMobile ? 28 : 34, color: T.red }} />
    </Box>
    <Typography
      sx={{
        fontWeight: typography.weights.bold,
        fontSize: isMobile ? "1rem" : "1.1rem",
        color: T.ink,
        fontFamily: typography.fontFamily.heading,
        mb: 0.75,
      }}
    >
      Connection Lost
    </Typography>
    <Typography
      sx={{
        fontSize: isMobile ? "0.8rem" : "0.85rem",
        color: T.inkSec,
        fontFamily: typography.fontFamily.primary,
        mb: 3,
        maxWidth: 280,
        mx: "auto",
        px: 2,
      }}
    >
      Unable to load categories. Please check your connection.
    </Typography>
    <Button
      onClick={onRetry}
      variant="contained"
      startIcon={<Refresh sx={{ fontSize: isMobile ? 16 : 18 }} />}
      sx={{
        textTransform: "none",
        bgcolor: T.brand,
        fontFamily: typography.fontFamily.primary,
        fontWeight: typography.weights.semibold,
        borderRadius: T.r.sm,
        px: isMobile ? 2.5 : 3,
        py: isMobile ? 0.75 : 1,
        fontSize: isMobile ? "0.8rem" : "0.85rem",
        boxShadow: `0 2px 8px ${T.brandGlow}`,
        "&:hover": { bgcolor: T.brandMid },
      }}
    >
      Try Again
    </Button>
  </Box>
);

// ─── Empty State (Responsive) ─────────────────────────────────────────────────
const EmptyState = ({
  onAdd,
  hasSearch,
  searchTerm,
  onClearSearch,
  isMobile,
}) => (
  <Box sx={{ py: isMobile ? 6 : 9, textAlign: "center", px: 2 }}>
    <Box
      sx={{
        width: isMobile ? 64 : 80,
        height: isMobile ? 64 : 80,
        borderRadius: "50%",
        bgcolor: hasSearch ? T.surfaceAlt : T.brandPale,
        border: `1.5px solid ${hasSearch ? T.border : alpha(T.brand, 0.2)}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        mx: "auto",
        mb: 2,
      }}
    >
      {hasSearch ? (
        <SearchOff sx={{ fontSize: isMobile ? 28 : 34, color: T.inkMut }} />
      ) : (
        <Category sx={{ fontSize: isMobile ? 28 : 34, color: T.brand }} />
      )}
    </Box>
    <Typography
      sx={{
        fontWeight: typography.weights.extrabold,
        fontSize: isMobile ? "1rem" : "1.1rem",
        color: T.ink,
        fontFamily: typography.fontFamily.heading,
        mb: 0.75,
        letterSpacing: "-0.01em",
      }}
    >
      {hasSearch ? `No results for "${searchTerm}"` : "No categories yet"}
    </Typography>
    <Typography
      sx={{
        fontSize: isMobile ? "0.8rem" : "0.85rem",
        color: T.inkSec,
        fontFamily: typography.fontFamily.primary,
        mb: 3,
        maxWidth: 300,
        mx: "auto",
        lineHeight: 1.5,
      }}
    >
      {hasSearch
        ? "Try different keywords or clear the filters"
        : "Create your first category to organise assets"}
    </Typography>
    {hasSearch ? (
      <Button
        variant="outlined"
        startIcon={<ClearAll />}
        onClick={onClearSearch}
        sx={{
          textTransform: "none",
          borderRadius: T.r.sm,
          borderColor: T.border,
          color: T.inkSec,
          fontFamily: typography.fontFamily.primary,
          fontWeight: typography.weights.semibold,
          fontSize: isMobile ? "0.8rem" : "0.85rem",
          "&:hover": { bgcolor: T.surfaceAlt },
        }}
      >
        Clear Search
      </Button>
    ) : (
      <Button
        variant="contained"
        startIcon={<Add />}
        onClick={onAdd}
        sx={{
          bgcolor: T.brand,
          color: "#fff",
          textTransform: "none",
          borderRadius: T.r.sm,
          fontWeight: typography.weights.semibold,
          fontFamily: typography.fontFamily.primary,
          px: isMobile ? 2.5 : 3,
          py: isMobile ? 0.75 : 1,
          fontSize: isMobile ? "0.8rem" : "0.85rem",
          boxShadow: `0 2px 8px ${T.brandGlow}`,
          "&:hover": { bgcolor: T.brandMid },
        }}
      >
        Create First Category
      </Button>
    )}
  </Box>
);

// ─── Skeleton Row ─────────────────────────────────────────────────────────────
const SkeletonRows = ({ count = 8, isMobile }) => (
  <>
    {Array(count)
      .fill(0)
      .map((_, i) => (
        <TableRow key={i}>
          <TableCell sx={{ py: isMobile ? 1.5 : 1.75 }}>
            <Skeleton variant="rounded" width={40} height={20} />
          </TableCell>
          <TableCell sx={{ py: isMobile ? 1.5 : 1.75 }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Skeleton
                variant="rounded"
                width={isMobile ? 32 : 36}
                height={isMobile ? 32 : 36}
              />
              <Box>
                <Skeleton width={120} height={16} />
                <Skeleton width={80} height={12} sx={{ mt: 0.5 }} />
              </Box>
            </Stack>
          </TableCell>
          <TableCell sx={{ py: isMobile ? 1.5 : 1.75 }}>
            <Skeleton width={isMobile ? 140 : 200} height={20} />
          </TableCell>
          <TableCell sx={{ py: isMobile ? 1.5 : 1.75 }}>
            <Skeleton width={50} height={28} />
          </TableCell>
          <TableCell sx={{ py: isMobile ? 1.5 : 1.75 }}>
            <Skeleton width={60} height={22} />
          </TableCell>
          <TableCell sx={{ py: isMobile ? 1.5 : 1.75 }}>
            <Skeleton width={80} height={16} />
          </TableCell>
          <TableCell sx={{ py: isMobile ? 1.5 : 1.75 }}>
            <Stack direction="row" spacing={0.5}>
              <Skeleton width={28} height={28} variant="rounded" />
              <Skeleton width={28} height={28} variant="rounded" />
              <Skeleton width={28} height={28} variant="rounded" />
            </Stack>
          </TableCell>
        </TableRow>
      ))}
  </>
);

// ─── Category Card (Mobile First) ────────────────────────────────────────────
const CategoryCard = ({ cat, onEdit, onDelete, onToggle, index, isMobile }) => {
  const isActive = cat.isActive !== false;
  return (
    <Card
      elevation={0}
      sx={{
        border: `1px solid ${isActive ? T.border : alpha(T.border, 0.6)}`,
        borderRadius: T.r.lg,
        mb: isMobile ? 1.25 : 1.5,
        overflow: "visible",
        opacity: isActive ? 1 : 0.65,
        transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        animation: `${slideUp} 0.35s ${index * 0.05}s ease both`,
        "&:active": { transform: isMobile ? "scale(0.98)" : "none" },
      }}
    >
      <CardContent
        sx={{
          p: isMobile ? "14px" : "18px",
          "&:last-child": { pb: isMobile ? "14px" : "18px" },
        }}
      >
        <Stack spacing={isMobile ? 1.5 : 1.75}>
          {/* Header */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
          >
            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
              sx={{ flex: 1, minWidth: 0 }}
            >
              <Box
                sx={{
                  width: isMobile ? 40 : 44,
                  height: isMobile ? 40 : 44,
                  borderRadius: T.r.md,
                  bgcolor: T.brandPale,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Category
                  sx={{ fontSize: isMobile ? 18 : 20, color: T.brand }}
                />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  sx={{
                    fontWeight: typography.weights.bold,
                    fontSize: isMobile ? "0.85rem" : "0.95rem",
                    color: T.ink,
                    fontFamily: typography.fontFamily.heading,
                    letterSpacing: "-0.01em",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {cat.name}
                </Typography>
                <Typography
                  sx={{
                    fontSize: isMobile ? "0.6rem" : "0.65rem",
                    color: T.inkMut,
                    fontFamily: typography.fontFamily.mono,
                    mt: 0.25,
                  }}
                >
                  #{cat._id?.slice(-8)}
                </Typography>
              </Box>
            </Stack>
            <StatusBadge active={isActive} isMobile={isMobile} />
          </Stack>

          {/* Description */}
          <Typography
            sx={{
              fontSize: isMobile ? "0.75rem" : "0.8rem",
              color: T.inkSec,
              lineHeight: 1.5,
              fontFamily: typography.fontFamily.primary,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {cat.description || (
              <span style={{ color: T.inkMut, fontStyle: "italic" }}>
                No description
              </span>
            )}
          </Typography>

          <Divider sx={{ borderColor: T.border }} />

          {/* Meta & Actions */}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Inventory2
                  sx={{ fontSize: isMobile ? 12 : 13, color: T.brand }}
                />
                <Typography
                  sx={{
                    fontSize: isMobile ? "0.7rem" : "0.78rem",
                    fontWeight: typography.weights.bold,
                    color: T.brand,
                    fontFamily: typography.fontFamily.primary,
                  }}
                >
                  {cat.assetCount ?? 0}
                </Typography>
              </Stack>
              <Typography
                sx={{
                  fontSize: isMobile ? "0.65rem" : "0.72rem",
                  color: T.inkMut,
                  fontFamily: typography.fontFamily.primary,
                }}
              >
                {fmtDate(cat.createdAt)}
              </Typography>
            </Stack>

            {/* Action Buttons */}
            <Stack direction="row" spacing={0.5}>
              <Tooltip
                title={isActive ? "Deactivate" : "Activate"}
                placement="top"
              >
                <IconButton
                  size="small"
                  onClick={() => onToggle(cat)}
                  sx={{
                    width: isMobile ? 28 : 30,
                    height: isMobile ? 28 : 30,
                    borderRadius: T.r.xs,
                    bgcolor: alpha(T.border, 0.5),
                    "&:active": { transform: "scale(0.92)" },
                  }}
                >
                  {isActive ? (
                    <ToggleOn
                      sx={{ fontSize: isMobile ? 15 : 16, color: T.green }}
                    />
                  ) : (
                    <ToggleOff
                      sx={{ fontSize: isMobile ? 15 : 16, color: T.inkMut }}
                    />
                  )}
                </IconButton>
              </Tooltip>
              <Tooltip title="Edit" placement="top">
                <IconButton
                  size="small"
                  onClick={() => onEdit(cat)}
                  sx={{
                    width: isMobile ? 28 : 30,
                    height: isMobile ? 28 : 30,
                    borderRadius: T.r.xs,
                    bgcolor: T.brandPale,
                    "&:active": { transform: "scale(0.92)" },
                  }}
                >
                  <Edit sx={{ fontSize: isMobile ? 12 : 13, color: T.brand }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete" placement="top">
                <IconButton
                  size="small"
                  onClick={() => onDelete(cat)}
                  sx={{
                    width: isMobile ? 28 : 30,
                    height: isMobile ? 28 : 30,
                    borderRadius: T.r.xs,
                    bgcolor: alpha(T.redBg, 0.8),
                    "&:active": { transform: "scale(0.92)" },
                  }}
                >
                  <Delete sx={{ fontSize: isMobile ? 12 : 13, color: T.red }} />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

// ─── Category Form Dialog (Responsive) ────────────────────────────────────────
const CategoryDialog = ({
  open,
  onClose,
  onSubmit,
  editData,
  loading,
  isMobile,
}) => {
  const isEdit = !!editData;
  const [form, setForm] = useState({
    name: "",
    description: "",
    isActive: true,
  });
  const [errors, setErrors] = useState({});
  const nameRef = useRef(null);

  useEffect(() => {
    if (open) {
      setForm(
        editData
          ? {
              name: editData.name || "",
              description: editData.description || "",
              isActive: editData.isActive !== false,
            }
          : { name: "", description: "", isActive: true },
      );
      setErrors({});
      setTimeout(() => nameRef.current?.focus(), 120);
    }
  }, [editData, open]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Category name is required";
    else if (form.name.trim().length < 2) e.name = "At least 2 characters";
    else if (form.name.trim().length > 80) e.name = "Max 80 characters";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    onSubmit({
      ...form,
      name: form.name.trim(),
      description: form.description.trim(),
    });
  };

  const inputStyles = {
    borderRadius: T.r.sm,
    fontSize: isMobile ? "0.8rem" : "0.875rem",
    fontFamily: typography.fontFamily.primary,
    "& fieldset": { borderColor: T.border },
    "&:hover fieldset": { borderColor: alpha(T.brand, 0.45) },
    "&.Mui-focused fieldset": { borderColor: T.brand, borderWidth: "1.5px" },
  };

  const dialogContent = (
    <Box sx={{ p: isMobile ? 2 : 3 }}>
      <Stack spacing={isMobile ? 2 : 2.5}>
        {/* Name Field */}
        <Box>
          <Typography
            sx={{
              fontSize: isMobile ? "0.65rem" : "0.7rem",
              fontWeight: typography.weights.bold,
              color: T.inkSec,
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              mb: 0.75,
              fontFamily: typography.fontFamily.primary,
            }}
          >
            Category Name <span style={{ color: T.red }}>*</span>
          </Typography>
          <TextField
            inputRef={nameRef}
            fullWidth
            size="small"
            placeholder="e.g. Electronics, Vehicles..."
            value={form.name}
            onChange={(e) => {
              setForm((p) => ({ ...p, name: e.target.value }));
              setErrors((p) => ({ ...p, name: "" }));
            }}
            onKeyDown={(e) =>
              e.key === "Enter" && !e.shiftKey && handleSubmit()
            }
            error={!!errors.name}
            helperText={errors.name}
            InputProps={{ sx: inputStyles }}
          />
        </Box>

        {/* Description Field */}
        <Box>
          <Typography
            sx={{
              fontSize: isMobile ? "0.65rem" : "0.7rem",
              fontWeight: typography.weights.bold,
              color: T.inkSec,
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              mb: 0.75,
              fontFamily: typography.fontFamily.primary,
            }}
          >
            Description <span style={{ color: T.inkMut }}>(Optional)</span>
          </Typography>
          <TextField
            fullWidth
            size="small"
            multiline
            rows={isMobile ? 2 : 3}
            placeholder="Brief description of this category..."
            value={form.description}
            onChange={(e) =>
              setForm((p) => ({ ...p, description: e.target.value }))
            }
            InputProps={{ sx: inputStyles }}
          />
        </Box>

        {/* Status Toggle */}
        <Box
          sx={{
            p: isMobile ? "12px 14px" : "14px 16px",
            borderRadius: T.r.md,
            bgcolor: T.surfaceAlt,
            border: `1px solid ${T.border}`,
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box>
              <Typography
                sx={{
                  fontSize: isMobile ? "0.8rem" : "0.85rem",
                  fontWeight: typography.weights.bold,
                  color: T.ink,
                  fontFamily: typography.fontFamily.primary,
                }}
              >
                {form.isActive ? "Active" : "Inactive"}
              </Typography>
              <Typography
                sx={{
                  fontSize: isMobile ? "0.65rem" : "0.72rem",
                  color: T.inkMut,
                  fontFamily: typography.fontFamily.primary,
                  mt: 0.2,
                }}
              >
                {form.isActive ? "Visible in asset forms" : "Hidden from forms"}
              </Typography>
            </Box>
            <Switch
              checked={form.isActive}
              onChange={(e) =>
                setForm((p) => ({ ...p, isActive: e.target.checked }))
              }
              size="small"
              sx={{
                "& .MuiSwitch-switchBase.Mui-checked": { color: T.brand },
                "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                  bgcolor: T.brand,
                },
              }}
            />
          </Stack>
        </Box>
      </Stack>
    </Box>
  );

  const dialogActions = (
    <Box
      sx={{
        px: isMobile ? 2 : 3,
        py: isMobile ? 1.5 : 2.5,
        borderTop: `1px solid ${T.border}`,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 1,
      }}
    >
      <Button
        onClick={onClose}
        disabled={loading}
        fullWidth={isMobile}
        sx={{
          textTransform: "none",
          borderRadius: T.r.sm,
          color: T.inkSec,
          fontFamily: typography.fontFamily.primary,
          fontWeight: typography.weights.semibold,
          border: `1px solid ${T.border}`,
          bgcolor: T.surface,
          px: isMobile ? 1.5 : 2.5,
          "&:hover": { bgcolor: T.surfaceHov },
        }}
      >
        Cancel
      </Button>
      <Button
        onClick={handleSubmit}
        disabled={loading}
        variant="contained"
        fullWidth={isMobile}
        startIcon={
          loading ? (
            <CircularProgress size={14} />
          ) : isEdit ? (
            <Check />
          ) : (
            <Add />
          )
        }
        sx={{
          bgcolor: T.brand,
          color: "#fff",
          textTransform: "none",
          borderRadius: T.r.sm,
          fontWeight: typography.weights.semibold,
          fontFamily: typography.fontFamily.primary,
          px: isMobile ? 1.5 : 3,
          "&:hover": { bgcolor: T.brandMid },
        }}
      >
        {loading ? "Saving..." : isEdit ? "Save Changes" : "Create Category"}
      </Button>
    </Box>
  );

  if (isMobile) {
    return (
      <Drawer
        anchor="bottom"
        open={open}
        onClose={!loading ? onClose : undefined}
        PaperProps={{
          sx: {
            borderRadius: `${T.r.xl}px ${T.r.xl}px 0 0`,
            maxHeight: "90vh",
            overflow: "hidden",
          },
        }}
      >
        <Box sx={{ bgcolor: T.brand, p: 2, textAlign: "center" }}>
          <Typography
            sx={{
              fontWeight: typography.weights.bold,
              fontSize: "1rem",
              color: "white",
              fontFamily: typography.fontFamily.heading,
            }}
          >
            {isEdit ? "Edit Category" : "New Category"}
          </Typography>
        </Box>
        {dialogContent}
        {dialogActions}
      </Drawer>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={!loading ? onClose : undefined}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: T.r.xl,
          boxShadow: T.sh.xl,
          bgcolor: T.surface,
          overflow: "hidden",
          animation: `${scaleIn} 0.25s ease both`,
        },
      }}
    >
      <Box sx={{ bgcolor: T.brandPale, px: 3, pt: 2.5, pb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box sx={{ bgcolor: T.brand, p: 1, borderRadius: T.r.md }}>
            {isEdit ? (
              <Edit sx={{ fontSize: 18, color: "#fff" }} />
            ) : (
              <Add sx={{ fontSize: 18, color: "#fff" }} />
            )}
          </Box>
          <Typography
            sx={{
              fontWeight: typography.weights.extrabold,
              fontSize: "1rem",
              color: T.ink,
              fontFamily: typography.fontFamily.heading,
            }}
          >
            {isEdit ? "Edit Category" : "Create New Category"}
          </Typography>
        </Stack>
      </Box>
      {dialogContent}
      {dialogActions}
    </Dialog>
  );
};

// ─── Delete Dialog ────────────────────────────────────────────────────────────
const DeleteDialog = ({
  open,
  onClose,
  onConfirm,
  category,
  loading,
  isMobile,
}) => (
  <Dialog
    open={open}
    onClose={!loading ? onClose : undefined}
    maxWidth="xs"
    fullWidth
    PaperProps={{
      sx: {
        borderRadius: T.r.xl,
        boxShadow: T.sh.xl,
        bgcolor: T.surface,
        m: isMobile ? 1 : 2,
      },
    }}
  >
    <Box sx={{ p: isMobile ? 2 : 3 }}>
      <Stack direction="row" spacing={1.5} alignItems="center" mb={2}>
        <Box
          sx={{
            width: isMobile ? 40 : 44,
            height: isMobile ? 40 : 44,
            borderRadius: T.r.md,
            bgcolor: T.redBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Delete sx={{ color: T.red, fontSize: isMobile ? 20 : 22 }} />
        </Box>
        <Typography
          sx={{
            fontWeight: typography.weights.extrabold,
            fontSize: isMobile ? "0.9rem" : "1rem",
            color: T.ink,
            fontFamily: typography.fontFamily.heading,
          }}
        >
          Delete Category
        </Typography>
      </Stack>
      <Box
        sx={{
          p: isMobile ? "12px" : "14px 16px",
          borderRadius: T.r.md,
          bgcolor: T.redBg,
          border: `1px solid ${alpha(T.red, 0.2)}`,
          mb: 2.5,
        }}
      >
        <Typography
          sx={{
            fontSize: isMobile ? "0.8rem" : "0.85rem",
            color: T.red,
            fontFamily: typography.fontFamily.primary,
            fontWeight: typography.weights.medium,
          }}
        >
          Delete <strong>"{category?.name}"</strong>? Assets using this category
          will lose their assignment.
        </Typography>
        {(category?.assetCount ?? 0) > 0 && (
          <Stack direction="row" alignItems="center" spacing={0.75} mt={1}>
            <Warning sx={{ fontSize: 13, color: T.amber }} />
            <Typography
              sx={{
                fontSize: isMobile ? "0.7rem" : "0.75rem",
                color: T.amber,
                fontFamily: typography.fontFamily.primary,
                fontWeight: typography.weights.bold,
              }}
            >
              {category.assetCount} asset{category.assetCount !== 1 ? "s" : ""}{" "}
              affected
            </Typography>
          </Stack>
        )}
      </Box>
      <Stack direction="row" spacing={1} justifyContent="flex-end">
        <Button
          onClick={onClose}
          disabled={loading}
          fullWidth={isMobile}
          sx={{
            textTransform: "none",
            borderRadius: T.r.sm,
            border: `1px solid ${T.border}`,
            color: T.inkSec,
            fontFamily: typography.fontFamily.primary,
            fontWeight: typography.weights.semibold,
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          disabled={loading}
          variant="contained"
          fullWidth={isMobile}
          startIcon={loading ? <CircularProgress size={14} /> : <Delete />}
          sx={{
            bgcolor: T.red,
            color: "#fff",
            textTransform: "none",
            borderRadius: T.r.sm,
            fontWeight: typography.weights.semibold,
            fontFamily: typography.fontFamily.primary,
            "&:hover": { bgcolor: "#991B1B" },
          }}
        >
          {loading ? "Deleting..." : "Delete"}
        </Button>
      </Stack>
    </Box>
  </Dialog>
);

// ─── Access Denied (Mobile Friendly) ─────────────────────────────────────────
const AccessDenied = ({ isMobile }) => (
  <Box
    sx={{
      minHeight: "100vh",
      bgcolor: T.bg,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      px: 2,
    }}
  >
    <Box sx={{ textAlign: "center", maxWidth: 340 }}>
      <Box
        sx={{
          width: isMobile ? 64 : 80,
          height: isMobile ? 64 : 80,
          borderRadius: "50%",
          bgcolor: T.redBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mx: "auto",
          mb: 2,
        }}
      >
        <Lock sx={{ fontSize: isMobile ? 28 : 32, color: T.red }} />
      </Box>
      <Typography
        sx={{
          fontWeight: typography.weights.extrabold,
          fontSize: isMobile ? "1rem" : "1.2rem",
          color: T.ink,
          fontFamily: typography.fontFamily.heading,
          mb: 1,
        }}
      >
        Admin Access Required
      </Typography>
      <Typography
        sx={{
          fontSize: isMobile ? "0.8rem" : "0.85rem",
          color: T.inkSec,
          fontFamily: typography.fontFamily.primary,
          lineHeight: 1.5,
        }}
      >
        Asset Categories can only be managed by administrators.
      </Typography>
    </Box>
  </Box>
);

// ─── Floating Action Button (Mobile) ─────────────────────────────────────────
const FloatingAddButton = ({ onClick }) => (
  <Zoom in timeout={300}>
    <Fab
      color="primary"
      aria-label="add"
      onClick={onClick}
      sx={{
        position: "fixed",
        bottom: 16,
        right: 16,
        bgcolor: T.brand,
        color: "#fff",
        "&:hover": { bgcolor: T.brandMid },
        boxShadow: T.sh.lg,
        zIndex: 1000,
      }}
    >
      <Add />
    </Fab>
  </Zoom>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AssetCategoryPage() {
  const { user } = useAuth();
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  if (!isAdmin) return <AccessDenied isMobile={isMobile} />;

  const {
    categories,
    loading,
    error,
    pagination,
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    setError,
  } = useAssetCategory();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(isMobile ? 5 : 10);
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const toast = (message, severity = "success") =>
    setSnackbar({ open: true, message, severity });

  const fetchCategories = useCallback(
    async (silent = false) => {
      if (!silent) setFetching(true);
      setFetchError("");
      try {
        const params = { page: page + 1, limit: rowsPerPage };
        if (search.trim()) params.search = search.trim();
        const res = await getAllCategories(params);
        if (res?.success === false) {
          setFetchError(res?.message || "Failed to load categories");
        }
      } catch (err) {
        const status = err?.response?.status;
        if (status === 401 || status === 403) {
          setFetchError("Session expired. Please refresh.");
        } else if (!navigator.onLine) {
          setFetchError("No internet connection.");
        } else {
          setFetchError(
            err?.response?.data?.message ||
              err?.message ||
              "Failed to load categories",
          );
        }
      } finally {
        setFetching(false);
      }
    },
    [getAllCategories, page, rowsPerPage, search],
  );

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);
  useEffect(() => {
    setRowsPerPage(isMobile ? 5 : 10);
  }, [isMobile]);

  const clearSearch = () => {
    setSearch("");
    setPage(0);
  };

  const handleCreate = async (formData) => {
    setSaving(true);
    try {
      await createCategory(formData);
      toast("Category created successfully");
      setFormOpen(false);
      fetchCategories(true);
    } catch (e) {
      toast(e?.message || "Failed to create category", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (formData) => {
    setSaving(true);
    try {
      await updateCategory(editTarget._id, formData);
      toast("Category updated successfully");
      setEditTarget(null);
      setFormOpen(false);
      fetchCategories(true);
    } catch (e) {
      toast(e?.message || "Failed to update category", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await deleteCategory(deleteTarget._id);
      toast(`"${deleteTarget.name}" deleted`);
      setDeleteTarget(null);
      fetchCategories(true);
    } catch (e) {
      toast(e?.message || "Failed to delete category", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (cat) => {
    const wasActive = cat.isActive !== false;
    try {
      await updateCategory(cat._id, { isActive: !wasActive });
      toast(`"${cat.name}" ${wasActive ? "deactivated" : "activated"}`);
      fetchCategories(true);
    } catch (e) {
      toast(e?.message || "Failed to update status", "error");
    }
  };

  const openEdit = (cat) => {
    setEditTarget(cat);
    setFormOpen(true);
  };
  const openNew = () => {
    setEditTarget(null);
    setFormOpen(true);
  };

  const busy = loading || fetching;
  const hasSearch = search.trim().length > 0;
  const noData = !busy && !fetchError && categories.length === 0;
  const totalCount = pagination?.total ?? categories.length;
  const activeCount = categories.filter((c) => c.isActive !== false).length;

  const headCell = (label) => (
    <TableCell
      sx={{
        py: isMobile ? 1.25 : 1.5,
        fontSize: isMobile ? "0.6rem" : "0.65rem",
        fontWeight: typography.weights.extrabold,
        color: T.inkSec,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        fontFamily: typography.fontFamily.primary,
        bgcolor: T.surfaceAlt,
        borderBottom: `2px solid ${T.border}`,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </TableCell>
  );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: T.bg,
        fontFamily: typography.fontFamily.primary,
        pb: isMobile ? 8 : 0,
      }}
    >
      {/* Progress Bar */}
      {busy && (
        <LinearProgress
          sx={{
            height: 2,
            bgcolor: alpha(T.brand, 0.08),
            "& .MuiLinearProgress-bar": { bgcolor: T.brand },
            position: "sticky",
            top: 0,
            zIndex: 1100,
          }}
        />
      )}

      {/* Header */}
      <Box
        sx={{
          px: isMobile ? 2 : 3,
          pt: isMobile ? 2 : 3,
          pb: isMobile ? 1.5 : 2.5,
          bgcolor: T.surface,
          borderBottom: `1px solid ${T.border}`,
          position: "sticky",
          top: 0,
          zIndex: 100,
          backdropFilter: "blur(8px)",
          backgroundColor: alpha(T.surface, 0.95),
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
        >
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            sx={{ flex: 1, minWidth: 0 }}
          >
            <Tooltip title="Back">
              <IconButton
                onClick={() => navigate("/admin/assets")}
                size="small"
                sx={{
                  bgcolor: T.brandPale,
                  borderRadius: T.r.sm,
                  color: T.brand,
                  flexShrink: 0,
                }}
              >
                <ArrowBack sx={{ fontSize: isMobile ? 18 : 20 }} />
              </IconButton>
            </Tooltip>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                sx={{
                  fontSize: isMobile ? "1rem" : "1.25rem",
                  fontWeight: typography.weights.extrabold,
                  color: T.ink,
                  fontFamily: typography.fontFamily.heading,
                  letterSpacing: "-0.02em",
                  lineHeight: 1.3,
                }}
              >
                Asset Categories
              </Typography>
              <Typography
                sx={{
                  fontSize: isMobile ? "0.65rem" : "0.7rem",
                  color: T.inkMut,
                  fontFamily: typography.fontFamily.primary,
                  mt: 0.25,
                }}
              >
                {totalCount} categories · {activeCount} active
              </Typography>
            </Box>
          </Stack>

          {/* Desktop Add Button */}
          {!isMobile && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={openNew}
              sx={{
                bgcolor: T.brand,
                textTransform: "none",
                borderRadius: T.r.sm,
                fontWeight: typography.weights.semibold,
                fontFamily: typography.fontFamily.primary,
                px: 2.5,
                whiteSpace: "nowrap",
                "&:hover": { bgcolor: T.brandMid },
              }}
            >
              Add Category
            </Button>
          )}

          {/* Refresh Button */}
          <Tooltip title="Refresh">
            <IconButton
              onClick={() => fetchCategories()}
              disabled={busy}
              sx={{
                bgcolor: alpha(T.border, 0.5),
                borderRadius: T.r.sm,
                flexShrink: 0,
              }}
            >
              {busy ? (
                <CircularProgress
                  size={isMobile ? 16 : 18}
                  sx={{ color: T.brand }}
                />
              ) : (
                <Refresh
                  sx={{ fontSize: isMobile ? 18 : 20, color: T.inkSec }}
                />
              )}
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      {/* Main Content */}
      <Box sx={{ px: isMobile ? 1.5 : 3, py: isMobile ? 2 : 3 }}>
        {/* Stats Row */}
        <Stack
          direction="row"
          spacing={isMobile ? 1 : 1.5}
          sx={{ mb: isMobile ? 2 : 3, flexWrap: "wrap" }}
        >
          <StatCard
            label="Total"
            value={totalCount}
            icon={
              <Category sx={{ fontSize: isMobile ? 16 : 18, color: T.brand }} />
            }
            bg={T.brandPale}
            isMobile={isMobile}
          />
          <StatCard
            label="Active"
            value={activeCount}
            icon={
              <CheckCircle
                sx={{ fontSize: isMobile ? 16 : 18, color: T.green }}
              />
            }
            bg={T.greenBg}
            isMobile={isMobile}
          />
          <StatCard
            label="Inactive"
            value={Math.max(0, totalCount - activeCount)}
            icon={
              <ToggleOff
                sx={{ fontSize: isMobile ? 16 : 18, color: T.inkMut }}
              />
            }
            bg={T.surfaceAlt}
            isMobile={isMobile}
          />
        </Stack>

        {/* Error Banners */}
        {fetchError && (
          <ErrorBanner
            message={fetchError}
            onRetry={() => fetchCategories()}
            onDismiss={() => setFetchError("")}
            isMobile={isMobile}
          />
        )}
        {error && !fetchError && (
          <ErrorBanner
            message={error}
            onDismiss={() => setError(null)}
            isMobile={isMobile}
          />
        )}

        {/* Search Bar */}
        <Box
          sx={{
            p: isMobile ? 1.5 : 2,
            borderRadius: T.r.lg,
            bgcolor: T.surface,
            border: `1px solid ${T.border}`,
            mb: isMobile ? 2 : 2.5,
          }}
        >
          <Stack
            direction={isMobile ? "column" : "row"}
            spacing={isMobile ? 1.5 : 2}
          >
            <TextField
              fullWidth
              size="small"
              placeholder="Search by name or description..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              onKeyDown={(e) => e.key === "Enter" && fetchCategories()}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search
                      sx={{ fontSize: isMobile ? 16 : 18, color: T.inkMut }}
                    />
                  </InputAdornment>
                ),
                endAdornment: search && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={clearSearch}>
                      <Close sx={{ fontSize: isMobile ? 13 : 14 }} />
                    </IconButton>
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: T.r.sm,
                  fontSize: isMobile ? "0.8rem" : "0.875rem",
                  fontFamily: typography.fontFamily.primary,
                  "& fieldset": { borderColor: T.border },
                  "&.Mui-focused fieldset": {
                    borderColor: T.brand,
                    borderWidth: "1.5px",
                  },
                },
              }}
            />
            <Button
              variant="contained"
              onClick={() => {
                setPage(0);
                fetchCategories();
              }}
              disabled={busy}
              fullWidth={isMobile}
              sx={{
                bgcolor: T.brand,
                textTransform: "none",
                borderRadius: T.r.sm,
                fontWeight: typography.weights.semibold,
                fontFamily: typography.fontFamily.primary,
                px: isMobile ? 2 : 2.5,
                py: isMobile ? 0.75 : "auto",
                whiteSpace: "nowrap",
                "&:hover": { bgcolor: T.brandMid },
              }}
            >
              {fetching ? (
                <CircularProgress size={isMobile ? 16 : 18} />
              ) : (
                "Search"
              )}
            </Button>
          </Stack>

          {hasSearch && !busy && categories.length > 0 && (
            <Box
              sx={{
                mt: 1,
                px: 1,
                py: "4px",
                borderRadius: T.r.xs,
                bgcolor: T.blueBg,
                display: "inline-flex",
                alignItems: "center",
                gap: 0.75,
              }}
            >
              <InfoOutlined
                sx={{ fontSize: isMobile ? 12 : 13, color: T.blue }}
              />
              <Typography
                sx={{
                  fontSize: isMobile ? "0.7rem" : "0.73rem",
                  color: T.blue,
                  fontFamily: typography.fontFamily.primary,
                }}
              >
                {totalCount} result{totalCount !== 1 ? "s" : ""} for "
                <strong>{search}</strong>"
              </Typography>
            </Box>
          )}
        </Box>

        {/* Main Content Area */}
        <Box
          sx={{
            borderRadius: T.r.lg,
            overflow: "hidden",
            bgcolor: T.surface,
            border: `1px solid ${T.border}`,
          }}
        >
          {/* Network Error */}
          {fetchError && !busy && categories.length === 0 && (
            <NetworkError
              onRetry={() => fetchCategories()}
              isMobile={isMobile}
            />
          )}

          {/* Loading Skeleton */}
          {busy && categories.length === 0 && !fetchError && (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {[
                      "#",
                      "Category",
                      "Description",
                      "Assets",
                      "Status",
                      "Created",
                      "Actions",
                    ].map((h) => (
                      <TableCell
                        key={h}
                        sx={{
                          py: isMobile ? 1.25 : 1.5,
                          fontSize: "0.65rem",
                          fontWeight: 800,
                          color: T.inkSec,
                          fontFamily: typography.fontFamily.primary,
                        }}
                      >
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  <SkeletonRows count={rowsPerPage} isMobile={isMobile} />
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Empty State */}
          {noData && !fetchError && (
            <EmptyState
              onAdd={openNew}
              hasSearch={hasSearch}
              searchTerm={search}
              onClearSearch={clearSearch}
              isMobile={isMobile}
            />
          )}

          {/* Data Display */}
          {!busy && categories.length > 0 && (
            <>
              {isMobile ? (
                // Mobile Card View
                <Box sx={{ p: isMobile ? 1.5 : 2 }}>
                  {categories.map((cat, i) => (
                    <CategoryCard
                      key={cat._id}
                      cat={cat}
                      index={i}
                      onEdit={openEdit}
                      onDelete={setDeleteTarget}
                      onToggle={handleToggleActive}
                      isMobile={isMobile}
                    />
                  ))}
                </Box>
              ) : (
                // Desktop Table View
                <TableContainer>
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow>
                        {headCell("#")}
                        {headCell("Category")}
                        {headCell("Description")}
                        {headCell("Assets")}
                        {headCell("Status")}
                        {headCell("Created")}
                        {headCell("Actions")}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {categories.map((cat, idx) => {
                        const isActive = cat.isActive !== false;
                        return (
                          <TableRow
                            key={cat._id}
                            sx={{
                              opacity: isActive ? 1 : 0.6,
                              "&:hover": { bgcolor: T.brandPale },
                              transition: "background 0.15s",
                            }}
                          >
                            <TableCell
                              sx={{
                                py: 1.75,
                                fontSize: "0.78rem",
                                color: T.inkMut,
                                fontFamily: typography.fontFamily.primary,
                              }}
                            >
                              {page * rowsPerPage + idx + 1}
                            </TableCell>
                            <TableCell sx={{ py: 1.75 }}>
                              <Stack
                                direction="row"
                                alignItems="center"
                                spacing={1.5}
                              >
                                <Box
                                  sx={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: T.r.md,
                                    bgcolor: T.brandPale,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  <Category
                                    sx={{ fontSize: 16, color: T.brand }}
                                  />
                                </Box>
                                <Box>
                                  <Typography
                                    sx={{
                                      fontWeight: 700,
                                      fontSize: "0.85rem",
                                      color: T.ink,
                                      fontFamily: typography.fontFamily.heading,
                                    }}
                                  >
                                    {cat.name}
                                  </Typography>
                                  <Typography
                                    sx={{
                                      fontSize: "0.63rem",
                                      color: T.inkMut,
                                      fontFamily: typography.fontFamily.mono,
                                    }}
                                  >
                                    #{cat._id?.slice(-8)}
                                  </Typography>
                                </Box>
                              </Stack>
                            </TableCell>
                            <TableCell sx={{ py: 1.75, maxWidth: 260 }}>
                              <Typography
                                sx={{
                                  fontSize: "0.8rem",
                                  color: T.inkSec,
                                  fontFamily: typography.fontFamily.primary,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {cat.description || (
                                  <span
                                    style={{
                                      color: T.inkMut,
                                      fontStyle: "italic",
                                    }}
                                  >
                                    No description
                                  </span>
                                )}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ py: 1.75 }}>
                              <Box
                                sx={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 0.6,
                                  px: 1.25,
                                  py: 0.4,
                                  borderRadius: T.r.xs,
                                  bgcolor: T.brandPale,
                                }}
                              >
                                <Inventory2
                                  sx={{ fontSize: 12, color: T.brand }}
                                />
                                <Typography
                                  sx={{
                                    fontSize: "0.8rem",
                                    fontWeight: 700,
                                    color: T.brand,
                                    fontFamily: typography.fontFamily.primary,
                                  }}
                                >
                                  {cat.assetCount ?? 0}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell sx={{ py: 1.75 }}>
                              <StatusBadge active={isActive} isMobile={false} />
                            </TableCell>
                            <TableCell sx={{ py: 1.75 }}>
                              <Typography
                                sx={{
                                  fontSize: "0.78rem",
                                  color: T.inkSec,
                                  fontFamily: typography.fontFamily.primary,
                                }}
                              >
                                {fmtDate(cat.createdAt)}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ py: 1.75 }}>
                              <Stack direction="row" spacing={0.5}>
                                <Tooltip
                                  title={isActive ? "Deactivate" : "Activate"}
                                >
                                  <IconButton
                                    size="small"
                                    onClick={() => handleToggleActive(cat)}
                                    sx={{
                                      width: 28,
                                      height: 28,
                                      borderRadius: T.r.xs,
                                      bgcolor: alpha(T.border, 0.5),
                                    }}
                                  >
                                    {isActive ? (
                                      <ToggleOn
                                        sx={{ fontSize: 16, color: T.green }}
                                      />
                                    ) : (
                                      <ToggleOff
                                        sx={{ fontSize: 16, color: T.inkMut }}
                                      />
                                    )}
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Edit">
                                  <IconButton
                                    size="small"
                                    onClick={() => openEdit(cat)}
                                    sx={{
                                      width: 28,
                                      height: 28,
                                      borderRadius: T.r.xs,
                                      bgcolor: T.brandPale,
                                    }}
                                  >
                                    <Edit
                                      sx={{ fontSize: 13, color: T.brand }}
                                    />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                  <IconButton
                                    size="small"
                                    onClick={() => setDeleteTarget(cat)}
                                    sx={{
                                      width: 28,
                                      height: 28,
                                      borderRadius: T.r.xs,
                                      bgcolor: alpha(T.redBg, 0.8),
                                    }}
                                  >
                                    <Delete
                                      sx={{ fontSize: 13, color: T.red }}
                                    />
                                  </IconButton>
                                </Tooltip>
                              </Stack>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {/* Pagination */}
              <Box
                sx={{
                  borderTop: `1px solid ${T.border}`,
                  bgcolor: T.surfaceAlt,
                }}
              >
                <TablePagination
                  rowsPerPageOptions={isMobile ? [5, 10] : [5, 10, 25, 50]}
                  component="div"
                  count={totalCount}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={(_, p) => setPage(p)}
                  onRowsPerPageChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value, 10));
                    setPage(0);
                  }}
                  sx={{
                    "& .MuiTablePagination-toolbar": {
                      fontFamily: typography.fontFamily.primary,
                      fontSize: "0.8rem",
                      flexWrap: "wrap",
                      gap: 1,
                    },
                    "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
                      {
                        fontFamily: typography.fontFamily.primary,
                        fontSize: "0.75rem",
                      },
                  }}
                />
              </Box>
            </>
          )}
        </Box>
      </Box>

      {/* Mobile FAB */}
      {isMobile && !formOpen && <FloatingAddButton onClick={openNew} />}

      {/* Dialogs */}
      <CategoryDialog
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditTarget(null);
        }}
        onSubmit={editTarget ? handleUpdate : handleCreate}
        editData={editTarget}
        loading={saving}
        isMobile={isMobile}
      />
      <DeleteDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        category={deleteTarget}
        loading={saving}
        isMobile={isMobile}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: isMobile ? "center" : "right",
        }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          sx={{
            borderRadius: T.r.md,
            fontFamily: typography.fontFamily.primary,
            fontSize: "0.8rem",
            fontWeight: 500,
            boxShadow: T.sh.lg,
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

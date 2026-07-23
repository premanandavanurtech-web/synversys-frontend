// src/pages/MyTask.jsx
import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  Chip,
  Stack,
  CircularProgress,
  Alert,
  Snackbar,
  Tooltip,
  Pagination,
  Skeleton,
  Grid,
  LinearProgress,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormHelperText,
  useMediaQuery,
} from "@mui/material";
import { createTheme, ThemeProvider, alpha } from "@mui/material/styles";
import {
  Refresh as RefreshIcon,
  Assignment as AssignmentIcon,
  CalendarMonth as CalendarMonthIcon,
  Clear as ClearIcon,
  ViewList as ViewListIcon,
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon,
  LocationOn as LocationIcon,
  Description as DescriptionIcon,
  Flag as FlagIcon,
  Schedule as ScheduleIcon,
  PlayArrow as PlayArrowIcon,
  Refresh as ContinueIcon,
  Close as CloseIcon,
  FilterList as FilterListIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  TrendingUp as TrendingUpIcon,
  Today as TodayIcon,
  CalendarToday as CalendarTodayIcon,
  KeyboardArrowDown as ArrowDownIcon,
  FiberManualRecord as DotIcon,
  Search as SearchIcon,
  AttachFile as AttachFileIcon,
  Send as SendIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useTeamAssignment } from "../context/TeamAssignmentcontext";
import { useAuth } from "../context/AuthContexts";

// ─── Theme ────────────────────────────────────────────────────────────────────
const theme = createTheme({
  palette: {
    primary: {
      main: "#0d3d52",
      dark: "#072535",
      light: "#e6f3f8",
      contrastText: "#fff",
    },
    success: { main: "#10b981" },
    warning: { main: "#f59e0b" },
    error: { main: "#ef4444" },
    background: { default: "#f8fafc", paper: "#ffffff" },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    h5: { fontWeight: 800, letterSpacing: "-0.025em" },
    h6: { fontWeight: 700, letterSpacing: "-0.015em" },
  },
  components: {
    MuiButton: {
      styleOverrides: { root: { textTransform: "none", fontWeight: 600 } },
    },
    MuiChip: { styleOverrides: { root: { fontWeight: 600 } } },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundColor: "#fff",
          "& fieldset": { borderColor: "#e2e8f0" },
          "&:hover fieldset": { borderColor: "#cbd5e1" },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        select: { paddingTop: 8, paddingBottom: 8, fontSize: "0.85rem" },
      },
    },
  },
});

// ─── Config ──────────────────────────────────────────────────────────────────
const PRIORITY_CFG = {
  critical: {
    label: "Critical",
    color: "#b91c1c",
    bg: "#fef2f2",
    border: "#fecaca",
    accent: "#ef4444",
    chipBg: "#fef2f2",
    chipColor: "#b91c1c",
  },
  high: {
    label: "High",
    color: "#c2410c",
    bg: "#fff7ed",
    border: "#fed7aa",
    accent: "#f97316",
    chipBg: "#fff3e0",
    chipColor: "#c2410c",
  },
  medium: {
    label: "Medium",
    color: "#ca8a04",
    bg: "#fefce8",
    border: "#fde68a",
    accent: "#eab308",
    chipBg: "#fefce8",
    chipColor: "#ca8a04",
  },
  low: {
    label: "Low",
    color: "#16a34a",
    bg: "#f0fdf4",
    border: "#bbf7d0",
    accent: "#22c55e",
    chipBg: "#f0fdf4",
    chipColor: "#16a34a",
  },
};

const STATUS_CFG = {
  pending: {
    label: "Pending",
    color: "#64748b",
    bg: "#f1f5f9",
    border: "#e2e8f0",
  },
  in_progress: {
    label: "In Progress",
    color: "#0d3d52",
    bg: "#e6f3f8",
    border: "#bfe0ec",
  },
  pending_approval: {
    label: "Pending Approval",
    color: "#b45309",
    bg: "#fffbeb",
    border: "#fde68a",
  },
  pending_review: {
    label: "Pending Approval",
    color: "#b45309",
    bg: "#fffbeb",
    border: "#fde68a",
  },
  submitted: {
    label: "Submitted",
    color: "#6b7280",
    bg: "#f3f4f6",
    border: "#e5e7eb",
  },
  completed: {
    label: "Submitted",
    color: "#059669",
    bg: "#ecfdf5",
    border: "#a7f3d0",
  },
  approved: {
    label: "Approved",
    color: "#059669",
    bg: "#ecfdf5",
    border: "#a7f3d0",
  },
  rejected: {
    label: "Rejected",
    color: "#dc2626",
    bg: "#fef2f2",
    border: "#fecaca",
  },
};

// NEW: pull the best-available "created/assigned" timestamp off a task.
// Different endpoints in this codebase may use different field names, so
// check the likely candidates in priority order.
const getTaskCreatedAt = (task) =>
  task?.createdAt ||
  task?.assignedAt ||
  task?.assignedDate ||
  task?.createdOn ||
  null;

const toDateInputValue = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const getTodayInputValue = () => {
  const today = new Date();
  return toDateInputValue(today);
};

const isSameCalendarDate = (a, b) =>
  a &&
  b &&
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ title, value, active = false, onClick, sx }) => (
  <Paper
    elevation={0}
    role={onClick ? "button" : undefined}
    tabIndex={onClick ? 0 : undefined}
    onClick={onClick}
    onKeyDown={(event) => {
      if (!onClick) return;
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onClick();
      }
    }}
    sx={{
      ...sx,
      p: { xs: 2, sm: 2.5 },
      border: active ? "1.5px solid #111827" : "1px solid #e2e8f0",
      bgcolor: "#fff",
      borderRadius: 1,
      flex: 1,
      minWidth: 0,
      cursor: onClick ? "pointer" : "default",
      transition:
        "border-color 0.18s ease, background 0.18s ease, box-shadow 0.18s ease",
      "&:hover": onClick
        ? {
            borderColor: "#111827",
            boxShadow: "0 8px 20px rgba(13, 61, 82, 0.08)",
          }
        : {},
      "&:focus-visible": {
        outline: "3px solid rgba(13, 61, 82, 0.18)",
        outlineOffset: 2,
      },
    }}
  >
    <Typography
      sx={{
        color: "#94a3b8",
        fontWeight: 500,
        fontSize: "0.8rem",
        mb: 1,
      }}
    >
      {title}
    </Typography>
    <Typography
      sx={{
        color: "#0f172a",
        fontWeight: 700,
        fontSize: { xs: "1.6rem", sm: "2rem" },
        lineHeight: 1,
      }}
    >
      {value ?? 0}
    </Typography>
  </Paper>
);

// ─── Task Card ────────────────────────────────────────────────────────────────
const PRIORITY_PILL = {
  critical: { label: "Critical", bg: "#dc2626", color: "#fff" },
  high: { label: "High", bg: "#f97316", color: "#fff" },
  medium: { label: "Medium", bg: "#ca8a04", color: "#fff" },
  low: { label: "Low", bg: "#16a34a", color: "#fff" },
};

const STATUS_PILL = {
  pending: {
    label: "Pending",
    bg: "#f1f5f9",
    color: "#64748b",
    border: "#e2e8f0",
  },
  in_progress: {
    label: "In Progress",
    bg: "#dbeafe",
    color: "#1d4ed8",
    border: "#bfdbfe",
  },
  pending_approval: {
    label: "Pending Approval",
    bg: "#fef3c7",
    color: "#92400e",
    border: "#fde68a",
  },
  pending_review: {
    label: "Pending Approval",
    bg: "#fef3c7",
    color: "#92400e",
    border: "#fde68a",
  },
  submitted: {
    label: "Submitted",
    bg: "#f3f4f6",
    color: "#6b7280",
    border: "#e5e7eb",
  },
  completed: {
    label: "Submitted",
    bg: "#dcfce7",
    color: "#15803d",
    border: "#bbf7d0",
  },
  approved: {
    label: "Approved",
    bg: "#dcfce7",
    color: "#15803d",
    border: "#bbf7d0",
  },
  rejected: {
    label: "Rejected",
    bg: "#fee2e2",
    color: "#dc2626",
    border: "#fecaca",
  },
};

const getTaskStatus = (task) => {
  const assignmentStatus = (task?.status || "").toLowerCase();
  if (["pending_approval", "pending_review", "submitted"].includes(assignmentStatus)) {
    return assignmentStatus;
  }
  return (task?.myStatus || task?.status || "pending").toLowerCase();
};

const TaskCard = ({ task, onView, onPoa }) => {
  const prKey = task.priority?.toLowerCase() || "medium";
  const stKey = getTaskStatus(task);
  const pPill = PRIORITY_PILL[prKey] || PRIORITY_PILL.medium;
  const sPill = STATUS_PILL[stKey] || STATUS_PILL.pending;

  const assetName =
    task.assets?.[0]?.assetName ||
    task.assetIds?.[0]?.assetName ||
    "Unnamed Asset";
  const checklistName =
    task.checklists?.[0]?.name ||
    task.checklistData?.[0]?.name ||
    "Inspection Checklist";
  const assetLocation =
    task.assetIds?.[0]?.currentLocation ||
    task.assets?.[0]?.currentLocation ||
    "Location not set";
  const isCritical = task.criticalAsset === true;
  const dueDate = task.dueDate ? new Date(task.dueDate) : null;
  const isOverdue =
    dueDate &&
    dueDate < new Date() &&
    !["completed", "approved"].includes(stKey);
  const completionRate =
    task.checklistData?.[0]?.completionRate ?? task.completionRate ?? 0;
  const isInProgress = stKey === "in_progress";
  const memberStatus = (task.myStatus || "").toLowerCase();
  const assignmentStatus = (task.status || "").toLowerCase();
  const inspectionSubmitted =
    ["pending_approval", "pending_review", "submitted", "completed", "approved"].includes(stKey) ||
    ["completed", "submitted"].includes(memberStatus);
  const poaSubmitted =
    task.poaSubmitted === true ||
    assignmentStatus === "submitted" ||
    (Array.isArray(task.poaSubmissions) && task.poaSubmissions.length > 0) ||
    Number(task.poaSubmissionsCount || 0) > 0;
  const canSubmitPoa =
    !poaSubmitted && ["pending_approval", "pending_review"].includes(stKey);
  const inspectionButtonLabel = inspectionSubmitted
    ? "Inspection Submitted"
    : isInProgress
      ? "Continue Inspection"
      : "Start Inspection";
  const poaButtonLabel = poaSubmitted ? "POA Submitted" : "Add POA";

  const formattedDue = dueDate
    ? `Due: ${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, "0")}-${String(dueDate.getDate()).padStart(2, "0")}`
    : "No due date";

  return (
    <Box
      sx={{
        bgcolor: "#ffffff",
        borderRadius: "16px",
        border: "1px solid #e8edf2",
        display: "flex",
        flexDirection: "column",
        height: { xs: 284, sm: 278, md: 272 },
        width: "100%",
        maxWidth: { xs: "100%", sm: "none" },
        minWidth: 0,
        overflow: "hidden",
        transition: "box-shadow 0.2s ease",
        "&:hover": { boxShadow: "0 6px 24px rgba(0,0,0,0.08)" },
      }}
    >
      {/* Card Body */}
      <Box
        sx={{
          p: { xs: 2, sm: 2.25 },
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 0,
          minWidth: 0,
        }}
      >
        {/* Row 1: Priority pill + Status pill */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 1.75,
            gap: 1,
            // Allow wrapping so pills never clip outside the card
            flexWrap: "wrap",
            "& > *": {
              minWidth: 0,
            },
          }}
        >
          {/* Priority — solid filled pill */}
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              px: 1.5,
              py: 0.45,
              borderRadius: "20px",
              bgcolor: pPill.bg,
              // Prevent pill from shrinking and clipping its text
              flexShrink: 0,
              maxWidth: "100%",
            }}
          >
            <Typography
              sx={{
                fontSize: "0.72rem",
                fontWeight: 600,
                color: pPill.color,
                lineHeight: 1,
                whiteSpace: "nowrap",
              }}
            >
              {pPill.label}
            </Typography>
          </Box>

          {/* Status — outlined soft pill */}
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              px: 1.5,
              py: 0.45,
              borderRadius: "20px",
              bgcolor: sPill.bg,
              border: `1px solid ${sPill.border}`,
              flexShrink: 0,
              maxWidth: "100%",
            }}
          >
            <Typography
              sx={{
                fontSize: "0.72rem",
                fontWeight: 500,
                color: sPill.color,
                lineHeight: 1,
                whiteSpace: "nowrap",
              }}
            >
              {sPill.label}
            </Typography>
          </Box>
        </Box>

        {/* Row 2: Asset Name */}
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 1,
            mb: 1.5,
          }}
        >
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: "1.05rem",
              lineHeight: 1.3,
              color: "#0f172a",
              flex: 1,
              minWidth: 0,
              wordBreak: "break-word",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {assetName}
          </Typography>
          {isCritical && (
            <Box
              sx={{
                px: 1.25,
                py: 0.35,
                borderRadius: "20px",
                bgcolor: "#fef2f2",
                border: "1px solid #fecaca",
                flexShrink: 0,
              }}
            >
              <Typography
                sx={{
                  fontSize: "0.65rem",
                  fontWeight: 600,
                  color: "#dc2626",
                  whiteSpace: "nowrap",
                }}
              >
                Critical Asset
              </Typography>
            </Box>
          )}
        </Box>

        {/* Row 3: Meta info */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.7 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
            <DescriptionIcon
              sx={{ fontSize: 15, color: "#94a3b8", flexShrink: 0 }}
            />
            <Typography
              sx={{
                fontSize: "0.82rem",
                color: "#64748b",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: { xs: "normal", sm: "nowrap" },
                overflowWrap: "anywhere",
                display: "-webkit-box",
                WebkitLineClamp: { xs: 2, sm: 1 },
                WebkitBoxOrient: "vertical",
              }}
            >
              {checklistName}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
            <LocationIcon
              sx={{ fontSize: 15, color: "#94a3b8", flexShrink: 0 }}
            />
            <Typography
              sx={{
                fontSize: "0.82rem",
                color: "#64748b",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: { xs: "normal", sm: "nowrap" },
                overflowWrap: "anywhere",
                display: "-webkit-box",
                WebkitLineClamp: { xs: 2, sm: 1 },
                WebkitBoxOrient: "vertical",
              }}
            >
              {assetLocation}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
            <CalendarTodayIcon
              sx={{
                fontSize: 14,
                color: isOverdue ? "#ef4444" : "#94a3b8",
                flexShrink: 0,
              }}
            />
            <Typography
              sx={{
                fontSize: "0.82rem",
                color: isOverdue ? "#ef4444" : "#64748b",
                fontWeight: isOverdue ? 600 : 400,
                overflowWrap: "anywhere",
              }}
            >
              {formattedDue}
            </Typography>
          </Box>
        </Box>

        {/* Progress Bar (only if in-progress) */}
        {completionRate > 0 && (
          <Box sx={{ mt: 2 }}>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}
            >
              <Typography
                sx={{ fontSize: "0.7rem", color: "#94a3b8", fontWeight: 600 }}
              >
                Progress
              </Typography>
              <Typography
                sx={{ fontSize: "0.7rem", color: "#0d3d52", fontWeight: 700 }}
              >
                {completionRate}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={completionRate}
              sx={{
                height: 5,
                borderRadius: 4,
                bgcolor: "#f1f5f9",
                "& .MuiLinearProgress-bar": {
                  borderRadius: 4,
                  bgcolor: "#0d3d52",
                },
              }}
            />
          </Box>
        )}
      </Box>

      {/* CTA Button */}
      <Box
        sx={{
          px: { xs: 2, sm: 2.25 },
          pb: { xs: 2, sm: 3 },
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1fr) auto" },
          gap: 1,
        }}
      >
        <Button
          variant="contained"
          onClick={() => onView(task._id)}
          sx={{
            borderRadius: "10px",
            width:"100%",
            py: 0.95,
            fontWeight: 600,
            fontSize: { xs: "0.72rem", sm: "0.75rem" },
            bgcolor: inspectionSubmitted ? "#2563eb" : "#0d3d52",
            boxShadow: "none",
            letterSpacing: "0.01em",
            "&:hover": {
              bgcolor: inspectionSubmitted ? "#1d4ed8" : "#0a2f40",
              boxShadow: "none",
            },
          }}
        >
          {inspectionSubmitted ? (
            <CheckCircleIcon sx={{ fontSize: 15, mr: 0.75 }} />
          ) : (
            <PlayArrowIcon sx={{ fontSize: 15, mr: 0.75 }} />
          )}
          {inspectionButtonLabel}
        </Button>
        <Tooltip
  title={!canSubmitPoa && !poaSubmitted ? "Submit Inspection First" : ""}
 
>
  <span>
        <Button
          variant={poaSubmitted ? "contained" : "outlined"}
          
          disabled={!canSubmitPoa && !poaSubmitted}
          onClick={() => {
            if (canSubmitPoa) onPoa(task);
          }}
           sx={{
            borderRadius: "10px",
            py: 0.95,
            px: 2,
            fontWeight: 700,
            width:"100%",
            fontSize: { xs: "0.72rem", sm: "0.75rem" },
            borderColor: poaSubmitted ? "#7c3aed" : "#bfe0ec",
            color: poaSubmitted ? "#fff" : "#0d3d52",
            bgcolor: poaSubmitted ? "#7c3aed" : "#fff",
            whiteSpace: "nowrap",
            boxShadow: "none",
            "&:hover": {
              borderColor: poaSubmitted ? "#6d28d9" : "#0d3d52",
              bgcolor: poaSubmitted ? "#6d28d9" : "#e6f3f8",
              boxShadow: "none",
              
            },
            "&.Mui-disabled": {
              borderColor: "#e2e8f0",
              bgcolor: "#f8fafc",
              color: "#94a3b8",
            },
          }}
         
          startIcon={
            poaSubmitted ? (
              <CheckCircleIcon sx={{ fontSize: "15px !important" }} />
            ) : (
              <AssignmentIcon sx={{ fontSize: "15px !important" }} />
            )
          }
         
        >
          {poaButtonLabel}
        </Button>
        </span>
</Tooltip>
      </Box>
    </Box>
  );
};

const PoaDialog = ({
  open,
  task,
  feedback,
  files,
  error,
  submitting,
  onFeedbackChange,
  onFilesChange,
  onRemoveFile,
  onClose,
  onSubmit,
}) => {
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const assetName =
    task?.assets?.[0]?.assetName ||
    task?.assetIds?.[0]?.assetName ||
    "Selected asset";

  return (
    <Dialog
      open={open}
      onClose={submitting ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      fullScreen={isMobile}
      sx={{
        "& .MuiDialog-container": {
          alignItems: { xs: "stretch", sm: "center" },
        },
      }}
      PaperProps={{
        sx: {
          borderRadius: { xs: 0, sm: 2 },
          boxShadow: "0 24px 60px rgba(15, 23, 42, 0.18)",
          m: { xs: 0, sm: 2 },
          width: { xs: "100%", sm: "calc(100% - 32px)" },
          maxWidth: { xs: "none", sm: 600 },
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
      <DialogTitle sx={{ pb: 1.25 }}>
        <Typography sx={{ fontWeight: 800, color: "#0f172a", fontSize: "1.05rem" }}>
          Submit POA
        </Typography>
        <Typography sx={{ color: "#64748b", fontSize: "0.8rem", mt: 0.35 }}>
          {assetName}
        </Typography>
      </DialogTitle>
      <DialogContent
        sx={{
          pt: "12px !important",
          flex: 1,
          overflowY: "auto",
        }}
      >
        <Stack spacing={2}>
          <TextField
            label="Feedback"
            value={feedback}
            onChange={(event) => onFeedbackChange(event.target.value)}
            multiline
            minRows={4}
            required
            error={!!error}
            helperText={error || " "}
            fullWidth
            sx={{
              mt: 0.5,
              "& .MuiInputLabel-root": {
                bgcolor: "background.paper",
                px: 0.5,
              },
            }}
          />
          <Box>
            <Button
              component="label"
              variant="outlined"
              startIcon={<AttachFileIcon sx={{ fontSize: 17 }} />}
              sx={{
                borderRadius: 1.5,
                borderColor: "#cbd5e1",
                color: "#334155",
                bgcolor: "#fff",
                "&:hover": { borderColor: "#0d3d52", bgcolor: "#f8fafc" },
              }}
            >
              Upload Attachments
              <input hidden multiple type="file" onChange={onFilesChange} />
            </Button>
            <FormHelperText sx={{ ml: 0.25 }}>
              Attach supporting files if needed.
            </FormHelperText>
            {files.length > 0 && (
              <Stack spacing={1} sx={{ mt: 1.25 }}>
                {files.map((file, index) => (
                  <Chip
                    key={`${file.name}-${index}`}
                    icon={<AttachFileIcon />}
                    label={file.name}
                    onDelete={() => onRemoveFile(index)}
                    sx={{
                      justifyContent: "space-between",
                      maxWidth: "100%",
                      "& .MuiChip-label": {
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      },
                    }}
                  />
                ))}
              </Stack>
            )}
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions
        sx={{
          px: 3,
          pb: { xs: "calc(16px + env(safe-area-inset-bottom))", sm: 2.5 },
          pt: 1.25,
          borderTop: { xs: "1px solid #e2e8f0", sm: "none" },
        }}
      >
        <Button onClick={onClose} disabled={submitting} sx={{ color: "#64748b" }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={onSubmit}
          disabled={submitting}
          startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
          sx={{
            borderRadius: 1.5,
            bgcolor: "#0d3d52",
            boxShadow: "none",
            "&:hover": { bgcolor: "#0a2f40", boxShadow: "none" },
          }}
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── Calendar View ────────────────────────────────────────────────────────────
const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const MiniMonthCalendar = ({
  year,
  month,
  tasks,
  today,
  selectedDay,
  onSelectDay,
  onPrev,
  onNext,
}) => {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const previousMonthDays = new Date(year, month, 0).getDate();

  const cells = [];
  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ day: previousMonthDays - i, offset: -1 });
  }
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, offset: 0 });
  while (cells.length % 7 !== 0) {
    cells.push({ day: cells.length - firstDay - daysInMonth + 1, offset: 1 });
  }

  const getDateForCell = (cell) => new Date(year, month + cell.offset, cell.day);

  const getTasksForDate = (date) =>
    tasks.filter((t) => {
      if (!t.dueDate) return false;
      const dd = new Date(t.dueDate);
      return isSameCalendarDate(dd, date);
    });

  const isToday = (date) =>
    isSameCalendarDate(today, date);

  const isSelected = (date) =>
    isSameCalendarDate(selectedDay, date);

  return (
    <Box>
      <Box sx={{ display: "grid", gridTemplateColumns: "28px 1fr 28px", alignItems: "center", mb: 1 }}>
        <IconButton size="small" onClick={onPrev} sx={{ p: 0.25, color: "#0f172a" }}>
          <NavigateBeforeIcon sx={{ fontSize: 16 }} />
        </IconButton>
        <Typography
          sx={{
            fontWeight: 800,
            fontSize: "0.82rem",
            color: "#0f172a",
            textAlign: "center",
          }}
        >
          {MONTHS[month]} {year}
        </Typography>
        <IconButton size="small" onClick={onNext} sx={{ p: 0.25, color: "#0f172a" }}>
          <NavigateNextIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          mb: 0.5,
        }}
      >
        {DAYS.map((d) => (
          <Typography
            key={d}
            sx={{
              textAlign: "center",
              fontSize: "0.68rem",
              color: "#64748b",
              fontWeight: 700,
            }}
          >
            {d}
          </Typography>
        ))}
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          rowGap: 0.65,
        }}
      >
        {cells.map((cell, idx) => {
          const cellDate = getDateForCell(cell);
          const dayTasks = getTasksForDate(cellDate);
          const hasTasks = dayTasks.length > 0;
          const hasPendingApproval = dayTasks.some((task) =>
            ["pending_approval", "pending_review"].includes(getTaskStatus(task)),
          );
          const hasSubmitted = dayTasks.some((task) =>
            ["submitted", "completed", "approved"].includes(getTaskStatus(task)),
          );
          const todayCell = isToday(cellDate);
          const selectedCell = isSelected(cellDate);
          const isMuted = cell.offset !== 0;
          const markerBg = hasTasks
            ? hasPendingApproval
              ? "#f59e0b"
              : hasSubmitted
                ? "#10b981"
                : "#ef4444"
            : todayCell
              ? "#dbeafe"
              : selectedCell
                ? "#0d3d52"
                : "transparent";
          const markerColor = hasTasks
            ? hasPendingApproval
              ? "#fff"
              : hasSubmitted
                ? "#fff"
                : "#fff"
            : selectedCell
              ? "#fff"
              : isMuted
                ? "#94a3b8"
                : "#0f172a";
          return (
            <Box
              key={idx}
              sx={{ display: "flex", justifyContent: "center" }}
            >
              <Box
                onClick={() => onSelectDay(cellDate)}
                title={
                  hasTasks
                    ? `${dayTasks.length} task${dayTasks.length !== 1 ? "s" : ""} due`
                    : undefined
                }
                sx={{
                  width: 24,
                  height: 24,
                  boxSizing: "border-box",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  bgcolor: markerBg,
                  color: markerColor,
                  border: selectedCell
                    ? "2px solid #0d3d52"
                    : todayCell && !hasTasks
                      ? "1px solid #bfdbfe"
                      : "none",
                  fontWeight: todayCell || hasTasks || selectedCell ? 800 : 500,
                  fontSize: "0.68rem",
                  transition: "background 0.12s",
                  "&:hover": {
                    bgcolor: hasTasks || selectedCell || todayCell ? markerBg : "#f1f5f9",
                  },
                }}
              >
                {cell.day}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

const CalendarSidebar = ({ tasks, selectedDate, onSelectDate, onView }) => {
  const today = new Date();
  const [offset, setOffset] = useState(0);
  const selectedDay = selectedDate;

  const baseIndex = today.getFullYear() * 12 + today.getMonth() + offset;
  const monthsToShow = [-1, 0, 1].map((delta) => {
    const idx = baseIndex + delta;
    return { year: Math.floor(idx / 12), month: ((idx % 12) + 12) % 12 };
  });
  const [beforeMonth, currentMonth, afterMonth] = monthsToShow;

  const getTasksForDate = (date) => {
    if (!date) return [];
    return tasks.filter((t) => {
      if (!t.dueDate) return false;
      const d = new Date(t.dueDate);
      return isSameCalendarDate(d, date);
    });
  };

  const prev = () => setOffset((o) => o - 1);
  const next = () => setOffset((o) => o + 1);
  const selectedTasks = selectedDay ? getTasksForDate(selectedDay) : [];
  const handleSelectDay = (date) => {
    onSelectDate?.(date);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        width: { xs: "100%", lg: 288 },
        flexShrink: 0,
        borderRadius: 2,
        border: "1px solid #e2e8f0",
        bgcolor: "#fff",
        p: 2.25,
        position: { lg: "sticky" },
        top: { lg: 24 },
        alignSelf: "flex-start",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2.25,
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <CalendarMonthIcon sx={{ fontSize: 18, color: "#94a3b8" }} />
          <Typography sx={{ color: "#0f172a", fontWeight: 800, fontSize: "0.95rem" }}>
            Calendar
          </Typography>
        </Stack>
        <FormControl size="small">
          <Select
            value={3}
            IconComponent={ArrowDownIcon}
            sx={{
              height: 32,
              borderRadius: 1.5,
              fontSize: "0.72rem",
              color: "#475569",
              "& .MuiSelect-select": { py: 0.5, pl: 1.2, pr: 3 },
            }}
          >
            <MenuItem value={3}>3 Months</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Stack spacing={2.1}>
        <MiniMonthCalendar
          year={beforeMonth.year}
          month={beforeMonth.month}
          tasks={tasks}
          today={today}
          selectedDay={selectedDay}
          onSelectDay={handleSelectDay}
          onPrev={prev}
          onNext={next}
        />
        <MiniMonthCalendar
          year={currentMonth.year}
          month={currentMonth.month}
          tasks={tasks}
          today={today}
          selectedDay={selectedDay}
          onSelectDay={handleSelectDay}
          onPrev={prev}
          onNext={next}
        />
        <MiniMonthCalendar
          year={afterMonth.year}
          month={afterMonth.month}
          tasks={tasks}
          today={today}
          selectedDay={selectedDay}
          onSelectDay={handleSelectDay}
          onPrev={prev}
          onNext={next}
        />
      </Stack>

      {selectedDay && selectedTasks.length > 0 && (
        <Box
          sx={{
            mt: 2,
            borderRadius: 1.5,
            border: "1px solid #e2e8f0",
            overflow: "hidden",
          }}
        >
            <Box
              sx={{
                px: 1.5,
                py: 1,
                borderBottom: "1px solid #f1f5f9",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box>
                <Typography
                  fontWeight={800}
                  sx={{ fontSize: "0.85rem", color: "#0f172a" }}
                >
                  {selectedDay.toLocaleDateString("en-US", {
                    day: "2-digit",
                    month: "short",
                  })}
                </Typography>
                <Typography sx={{ fontSize: "0.68rem", color: "#94a3b8" }}>
                  {selectedTasks.length} task
                  {selectedTasks.length !== 1 ? "s" : ""}
                </Typography>
              </Box>
              <IconButton size="small" onClick={() => onSelectDate?.(null)}>
                <CloseIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Box>
            <Box
              sx={{
                p: 1.5,
                display: "flex",
                flexDirection: "column",
                gap: 1,
                maxHeight: 220,
                overflowY: "auto",
              }}
            >
              {selectedTasks.map((t) => {
                  const prKey = t.priority?.toLowerCase() || "medium";
                  const pCfg = PRIORITY_CFG[prKey] || PRIORITY_CFG.medium;
                  const aName =
                    t.assets?.[0]?.assetName ||
                    t.assetIds?.[0]?.assetName ||
                    "Asset";
                  return (
                    <Box
                      key={t._id}
                      role={onView ? "button" : undefined}
                      tabIndex={onView ? 0 : undefined}
                      onClick={() => t._id && onView?.(t._id)}
                      onKeyDown={(event) => {
                        if (!onView) return;
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          t._id && onView(t._id);
                        }
                      }}
                      sx={{
                        borderRadius: 2,
                        border: `1px solid ${pCfg.border}`,
                        p: 1.5,
                        cursor: onView ? "pointer" : "default",
                        "&:hover": onView
                          ? { bgcolor: "#f8fafc", borderColor: pCfg.color }
                          : undefined,
                      }}
                    >
                      <Typography
                        fontWeight={700}
                        sx={{ fontSize: "0.78rem", color: "#0f172a" }}
                      >
                        {aName}
                      </Typography>
                    </Box>
                  );
                })}
            </Box>
        </Box>
      )}

      <Box sx={{ display: "flex", gap: 2.25, alignItems: "center", mt: 2.5, flexWrap: "wrap" }}>
        <Stack direction="row" spacing={0.8} alignItems="center">
          <Box sx={{ width: 9, height: 9, borderRadius: "50%", bgcolor: "#ef4444" }} />
          <Typography sx={{ fontSize: "0.72rem", color: "#475569", fontWeight: 600 }}>
            Due Date
          </Typography>
        </Stack>
        <Stack direction="row" spacing={0.8} alignItems="center">
          <Box sx={{ width: 9, height: 9, borderRadius: "50%", bgcolor: "#f59e0b" }} />
          <Typography sx={{ fontSize: "0.72rem", color: "#475569", fontWeight: 600 }}>
            Pending Approval
          </Typography>
        </Stack>
        <Stack direction="row" spacing={0.8} alignItems="center">
          <Box sx={{ width: 9, height: 9, borderRadius: "50%", bgcolor: "#10b981" }} />
          <Typography sx={{ fontSize: "0.72rem", color: "#475569", fontWeight: 600 }}>
            Submitted
          </Typography>
        </Stack>
      </Box>
    </Paper>
  );
};

const FULL_CALENDAR_LEGEND = [
  { label: "Critical", color: "#ef4444" },
  { label: "High", color: "#f97316" },
  { label: "Medium", color: "#f59e0b" },
  { label: "Low", color: "#60a5fa" },
  { label: "In Progress", color: "#3b82f6" },
  { label: "Completed", color: "#10b981" },
];

const getCalendarDotColor = (task) => {
  const status = getTaskStatus(task);
  if (["completed", "approved", "submitted"].includes(status)) return "#10b981";
  if (status === "in_progress") return "#3b82f6";

  const priority = (task.priority || "").toLowerCase();
  if (priority === "critical") return "#ef4444";
  if (priority === "high") return "#f97316";
  if (priority === "low") return "#60a5fa";
  return "#f59e0b";
};

const CalendarView = ({ tasks, onView }) => {
  const today = new Date();
  const [visibleMonth, setVisibleMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );

  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const previousMonthDays = new Date(year, month, 0).getDate();

  const calendarCells = [];
  for (let i = firstDay - 1; i >= 0; i--) {
    calendarCells.push({
      day: previousMonthDays - i,
      date: new Date(year, month - 1, previousMonthDays - i),
      muted: true,
    });
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarCells.push({ day, date: new Date(year, month, day), muted: false });
  }
  while (calendarCells.length < 42) {
    const day = calendarCells.length - firstDay - daysInMonth + 1;
    calendarCells.push({ day, date: new Date(year, month + 1, day), muted: true });
  }

  const sameDay = (a, b) =>
    isSameCalendarDate(a, b);

  const getTasksForDate = (date) =>
    tasks.filter((task) => {
      if (!task.dueDate) return false;
      return sameDay(new Date(task.dueDate), date);
    });

  const goPrevMonth = () =>
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1));
  const goNextMonth = () =>
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1));
  const goToday = () =>
    setVisibleMonth(new Date(today.getFullYear(), today.getMonth(), 1));

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1fr) 300px" },
        gap: 2.5,
        alignItems: "start",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          borderRadius: 2,
          border: "1px solid #e2e8f0",
          bgcolor: "#fff",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            px: { xs: 2, sm: 2.5 },
            py: 2,
            display: "grid",
            gridTemplateColumns: "44px 1fr auto",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <IconButton
            size="small"
            onClick={goPrevMonth}
            sx={{ border: "1px solid #e2e8f0", color: "#94a3b8" }}
          >
            <NavigateBeforeIcon sx={{ fontSize: 18 }} />
          </IconButton>
          <Typography
            sx={{
              color: "#0f172a",
              fontWeight: 800,
              textAlign: "center",
              fontSize: { xs: "1rem", sm: "1.1rem" },
            }}
          >
            {MONTHS[month]} {year}
          </Typography>
          <Stack direction="row" spacing={1}>
            <IconButton
              size="small"
              onClick={goNextMonth}
              sx={{ border: "1px solid #e2e8f0", color: "#94a3b8" }}
            >
              <NavigateNextIcon sx={{ fontSize: 18 }} />
            </IconButton>
            <Button
              size="small"
              variant="outlined"
              onClick={goToday}
              sx={{
                borderRadius: 2,
                borderColor: "#e2e8f0",
                color: "#64748b",
                fontWeight: 700,
                px: 2,
              }}
            >
              Today
            </Button>
          </Stack>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(7, minmax(90px, 1fr))",
            bgcolor: "#f8fafc",
            borderTop: "1px solid #eef2f7",
            borderBottom: "1px solid #eef2f7",
            overflowX: "auto",
          }}
        >
          {DAYS.map((day) => (
            <Typography
              key={day}
              sx={{
                py: 1.4,
                textAlign: "center",
                color: "#94a3b8",
                fontSize: "0.72rem",
                fontWeight: 800,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              {day}
            </Typography>
          ))}
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(7, minmax(90px, 1fr))",
            overflowX: "auto",
          }}
        >
          {calendarCells.map((cell) => {
            const dayTasks = getTasksForDate(cell.date);
            const isToday = sameDay(cell.date, today);
            return (
              <Box
                key={cell.date.toISOString()}
                onClick={() => dayTasks[0]?._id && onView(dayTasks[0]._id)}
                sx={{
                  minHeight: { xs: 92, sm: 104 },
                  p: 1.5,
                  borderRight: "1px solid #eef2f7",
                  borderBottom: "1px solid #eef2f7",
                  cursor: dayTasks.length ? "pointer" : "default",
                  bgcolor: "#fff",
                  "&:hover": dayTasks.length ? { bgcolor: "#f8fafc" } : {},
                }}
              >
                <Box
                  sx={{
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: isToday ? "#0d3d52" : "transparent",
                    color: isToday ? "#fff" : cell.muted ? "#cbd5e1" : "#0f172a",
                    fontWeight: isToday ? 800 : 500,
                    fontSize: "0.82rem",
                  }}
                >
                  {cell.day}
                </Box>
                {dayTasks.length > 0 && (
                  <Stack direction="row" spacing={0.45} sx={{ mt: 1.1, ml: 0.25, flexWrap: "wrap" }}>
                    {dayTasks.slice(0, 4).map((task) => (
                      <Box
                        key={task._id}
                        sx={{
                          width: 7,
                          height: 7,
                          borderRadius: "50%",
                          bgcolor: getCalendarDotColor(task),
                        }}
                      />
                    ))}
                  </Stack>
                )}
              </Box>
            );
          })}
        </Box>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          borderRadius: 2,
          border: "1px solid #e2e8f0",
          bgcolor: "#fff",
          p: 2.5,
        }}
      >
        <Typography sx={{ color: "#0f172a", fontSize: "0.95rem", fontWeight: 800, mb: 2 }}>
          Legend
        </Typography>
        <Stack spacing={1.4}>
          {FULL_CALENDAR_LEGEND.map((item) => (
            <Stack key={item.label} direction="row" spacing={1.2} alignItems="center">
              <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: item.color }} />
              <Typography sx={{ color: "#64748b", fontSize: "0.86rem", fontWeight: 500 }}>
                {item.label}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Paper>
    </Box>
  );
};

// ─── MyTask ───────────────────────────────────────────────────────────────────
export default function MyTask() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { fetchMyTasks, submitPoa, loading, submitting } = useTeamAssignment();
  const mountedRef = useRef(true);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [viewMode, setViewMode] = useState("list");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    search: "",
    page: 1,
    limit: 20,
  });
  const [statFilter, setStatFilter] = useState("");
  const [calendarDateFilter, setCalendarDateFilter] = useState(null);
  const [snack, setSnack] = useState({
    open: false,
    msg: "",
    severity: "success",
  });

  // NEW: client-side pagination for the card grid — shows a fixed number of
  // cards per "page" regardless of how many tasks the backend returned in
  // this batch, with simple Previous/Next controls.
  const CARDS_PER_PAGE = 6;
  const [clientPage, setClientPage] = useState(1);
  const [poaTask, setPoaTask] = useState(null);
  const [poaFeedback, setPoaFeedback] = useState("");
  const [poaFiles, setPoaFiles] = useState([]);
  const [poaError, setPoaError] = useState("");

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const toast = useCallback(
    (msg, severity = "success") => setSnack({ open: true, msg, severity }),
    [],
  );

  const requestFilters = useMemo(() => {
    const nextFilters = { ...filters };

    if (
      [
        "pending",
        "in_progress",
        "pending_approval",
        "pending_review",
        "submitted",
      ].includes(statFilter)
    ) {
      nextFilters.status = statFilter;
      nextFilters.date = "";
    } else if (statFilter === "due_today") {
      nextFilters.status = "";
      nextFilters.date = getTodayInputValue();
    }

    return nextFilters;
  }, [filters, statFilter]);

  const loadTasks = useCallback(async () => {
    const result = await fetchMyTasks(requestFilters);
    if (!mountedRef.current) return;
    if (result.success) {
      setTasks(result.tasks);
      setPagination(result.pagination);
      setStats(result.stats);
    } else {
      toast(result.error || "Failed to load tasks", "error");
    }
  }, [fetchMyTasks, requestFilters, toast]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // NEW: client-side safety-net sort, newest first. The context now asks the
  // backend to sort with `sort=-createdAt`, but if the backend ignores that
  // param (or the field is named something else on this endpoint) this
  // guarantees the current page of tasks is still ordered correctly. If no
  // task has any recognizable timestamp, this is a harmless no-op and the
  // original order (as returned by the API) is preserved.
  const sortedTasks = useMemo(() => {
    if (!tasks?.length) return [];
    const noTimestamps = tasks.every((t) => !getTaskCreatedAt(t));
    if (noTimestamps) return tasks;
    return [...tasks].sort((a, b) => {
      const aTime = new Date(getTaskCreatedAt(a) || 0).getTime();
      const bTime = new Date(getTaskCreatedAt(b) || 0).getTime();
      return bTime - aTime; // newest first
    });
  }, [tasks]);

  const displayedTasks = useMemo(() => {
    const query = filters.search.trim().toLowerCase();
    return sortedTasks.filter((task) => {
      if (calendarDateFilter) {
        if (!task.dueDate) return false;
        if (!isSameCalendarDate(new Date(task.dueDate), calendarDateFilter)) {
          return false;
        }
      }

      if (!query) return true;

      const assetName =
        task.assets?.[0]?.assetName || task.assetIds?.[0]?.assetName || "";
      const checklistName =
        task.checklists?.[0]?.name || task.checklistData?.[0]?.name || "";
      const assetLocation =
        task.assetIds?.[0]?.currentLocation ||
        task.assets?.[0]?.currentLocation ||
        "";
      const searchableText = [
        assetName,
        checklistName,
        assetLocation,
        task.priority,
        getTaskStatus(task),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [calendarDateFilter, filters.search, sortedTasks]);

  // NEW: reset back to page 1 whenever the underlying task list changes
  // shape (new filters, new search term, a new batch loaded from the API).
  useEffect(() => {
    setClientPage(1);
  }, [
    filters.status,
    filters.priority,
    filters.date,
    filters.search,
    calendarDateFilter,
    statFilter,
    tasks,
  ]);

  const totalClientPages = Math.max(
    1,
    Math.ceil(displayedTasks.length / CARDS_PER_PAGE),
  );

  // Guard against being stranded on a page that no longer exists (e.g. a
  // filter change shrinks the list while on page 3).
  useEffect(() => {
    if (clientPage > totalClientPages) setClientPage(totalClientPages);
  }, [totalClientPages, clientPage]);

  const paginatedTasks = useMemo(() => {
    const start = (clientPage - 1) * CARDS_PER_PAGE;
    return displayedTasks.slice(start, start + CARDS_PER_PAGE);
  }, [displayedTasks, clientPage]);

  const goToPrevPage = () => setClientPage((p) => Math.max(1, p - 1));
  const goToNextPage = () =>
    setClientPage((p) => Math.min(totalClientPages, p + 1));

  const handleFilterChange = (key, value) => {
    if (key === "status" || key === "date") {
      setStatFilter("");
    }
    setCalendarDateFilter(null);
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };
  const handleStatFilter = (type) => {
    setStatFilter(type === "total" ? "" : type);
    setCalendarDateFilter(null);
    setFilters((prev) => ({ ...prev, page: 1 }));
  };
  const handleCalendarDateSelect = (date) => {
    setCalendarDateFilter(date);
    setClientPage(1);
  };
  const clearFilters = () => {
    setStatFilter("");
    setCalendarDateFilter(null);
    setFilters({
      status: "",
      priority: "",
      search: "",
      date: "",
      page: 1,
      limit: 20,
    });
  };
  const hasFormFilters = !!(
    filters.status ||
    filters.priority ||
    filters.date ||
    filters.search
  );
  const hasFilters = !!(hasFormFilters || statFilter || calendarDateFilter);
  const handleViewTask = (id) => navigate(`/team/task/${id}`);
  const handlePoaTask = (task) => {
    setPoaTask(task);
    setPoaFeedback("");
    setPoaFiles([]);
    setPoaError("");
  };

  const handleClosePoa = () => {
    if (submitting) return;
    setPoaTask(null);
    setPoaFeedback("");
    setPoaFiles([]);
    setPoaError("");
  };

  const handlePoaFilesChange = (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    setPoaFiles((prev) => [...prev, ...selectedFiles]);
    event.target.value = "";
  };

  const handleRemovePoaFile = (index) => {
    setPoaFiles((prev) => prev.filter((_, fileIndex) => fileIndex !== index));
  };

  const handleSubmitPoa = async () => {
    const feedback = poaFeedback.trim();
    if (!feedback) {
      setPoaError("Feedback is required");
      return;
    }
    if (!poaTask?._id) {
      toast("Invalid task selected for POA", "error");
      return;
    }

    const formData = new FormData();
    formData.append("feedback", feedback);
    poaFiles.forEach((file) => formData.append("attachments", file));

    const result = await submitPoa(poaTask._id, formData);
    if (result.success) {
      setTasks((prev) =>
        prev.map((task) =>
          task._id === poaTask._id
            ? { ...task, status: "pending_approval", myStatus: "submitted", poaSubmitted: true, poaSubmissionsCount: 1 }
            : task,
        ),
      );
      toast("POA submitted successfully", "success");
      handleClosePoa();
      loadTasks();
    } else {
      toast(result.error || "Failed to submit POA", "error");
    }
  };

  const derivedStats = displayedTasks.reduce(
    (acc, task) => {
      const status = getTaskStatus(task);
      if (status === "pending") acc.pending += 1;
      if (status === "in_progress") acc.in_progress += 1;
      if (["pending_approval", "pending_review"].includes(status)) {
        acc.pending_approval += 1;
      }
      if (status === "submitted") acc.submitted += 1;

      if (task.dueDate) {
        const due = new Date(task.dueDate);
        const today = new Date();
        const sameDay =
          due.getFullYear() === today.getFullYear() &&
          due.getMonth() === today.getMonth() &&
          due.getDate() === today.getDate();
        if (sameDay) acc.due_today += 1;
      }

      return acc;
    },
    { pending: 0, in_progress: 0, pending_approval: 0, submitted: 0, due_today: 0 },
  );

  const statValues = {
    total: displayedTasks.length,
    pending: derivedStats.pending,
    in_progress: derivedStats.in_progress,
    pending_approval: derivedStats.pending_approval,
    submitted: derivedStats.submitted,
    due_today: derivedStats.due_today,
  };
  const visibleStatCards =
    viewMode === "calendar"
      ? [
          { title: "Total Tasks", value: statValues.total, type: "total" },
          { title: "Pending", value: statValues.pending, type: "pending" },
          { title: "In Progress", value: statValues.in_progress, type: "in_progress" },
          { title: "Due Today", value: statValues.due_today, type: "due_today" },
        ]
      : [
          { title: "Total Tasks", value: statValues.total, type: "total" },
          { title: "Pending", value: statValues.pending, type: "pending" },
          {
            title: "Pending Approval",
            value: statValues.pending_approval,
            type: "pending_approval",
          },
          { title: "Submitted", value: statValues.submitted, type: "submitted" },
          { title: "Due Today", value: statValues.due_today, type: "due_today" },
        ];

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc", overflowX: "hidden" }}>
        <Container
          maxWidth="xl"
          sx={{ py: { xs: 2.5, sm: 3, md: 4 }, px: { xs: 1.5, sm: 3 } }}
        >
          {/* ── Header ── */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: { xs: "stretch", sm: "center" },
              flexDirection: { xs: "column", sm: "row" },
              gap: { xs: 2, sm: 1.5 },
              mb: 3,
            }}
          >
            <Box>
              <Typography
                sx={{
                  color: "#0f172a",
                  fontSize: { xs: "1.3rem", sm: "1.5rem" },
                  fontWeight: 800,
                  mb: 0.25,
                }}
              >
                My Tasks
              </Typography>
              <Typography
                sx={{ color: "#94a3b8", fontSize: "0.8rem", fontWeight: 400 }}
              >
                Your assigned inspection tasks
              </Typography>
            </Box>
 
            {/* View Toggle — pill style matching Figma */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: { xs: 1, sm: 1 },
                flexWrap: "wrap",
                justifyContent: { xs: "stretch", sm: "flex-end" },
                width: { xs: "100%", sm: "auto" },
              }}
            >
              <Paper
                elevation={0}
                sx={{
                  display: "flex",
                  flex: { xs: "1 1 100%", sm: "0 0 auto" },
                  border: "1px solid #e2e8f0",
                  borderRadius: 2,
                  overflow: "hidden",
                  bgcolor: "#fff",
                }}
              >
                {[
                  { mode: "list", label: "List View", Icon: ViewListIcon },
                  {
                    mode: "calendar",
                    label: "Calendar View",
                    Icon: CalendarMonthIcon,
                  },
                ].map(({ mode, label, Icon }) => (
                  <Button
                    key={mode}
                    size="small"
                    startIcon={<Icon sx={{ fontSize: 15 }} />}
                    onClick={() => setViewMode(mode)}
                    sx={{
                      px: { xs: 1, sm: 2 },
                      py: 0.85,
                      flex: 1,
                      minWidth: 0,
                      borderRadius: 0,
                      fontWeight: 500,
                      fontSize: "0.8rem",
                      bgcolor: "transparent",
                      color: viewMode === mode ? "#0f172a" : "#94a3b8",
                      borderRight:
                        mode === "list" ? "1px solid #e2e8f0" : "none",
                      "&:hover": { bgcolor: "#f8fafc" },
                      transition: "all 0.15s",
                      position: "relative",
                      "& .MuiButton-startIcon": {
                        mr: { xs: 0.5, sm: 1 },
                      },
                    }}
                  >
                    {label}
                  </Button>
                ))}
              </Paper>
            </Box>
          </Box>

          {/* ── Filters ── */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 1.5, sm: 1.75 },
              borderRadius: 1,
              border: "1px solid #e2e8f0",
              mb: 2.5,
              bgcolor: "#fff",
            }}
          >
            <Stack
              spacing={0}
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "minmax(0, 1fr) auto",
                  sm: "minmax(220px, 1fr) repeat(3, minmax(130px, auto)) auto",
                },
                gap: 1.25,
                alignItems: "center",
              }}
            >
              <TextField
                size="small"
                placeholder="Search tasks"
                value={filters.search || ""}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ fontSize: 17, color: "#94a3b8" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  width: "100%",
                  "& .MuiOutlinedInput-root": {
                    fontSize: "0.82rem",
                    bgcolor: "#fff",
                  },
                }}
              />

              {isMobile && (
                <Tooltip title="Filters">
                  <IconButton
                    onClick={() => setMobileFiltersOpen(true)}
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      border: "1px solid #e2e8f0",
                      bgcolor: hasFilters ? "#0d3d52" : "#fff",
                      color: hasFilters ? "#fff" : "#0d3d52",
                      "&:hover": {
                        bgcolor: hasFilters ? "#072535" : "#f8fafc",
                      },
                    }}
                  >
                    <FilterListIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
              )}

              {/* Status */}
              <FormControl
                size="small"
                sx={{ width: "100%", minWidth: 0, display: { xs: "none", sm: "block" } }}
              >
                <Select
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  displayEmpty
                  IconComponent={ArrowDownIcon}
                  sx={{ fontSize: "0.82rem", bgcolor: "#fff" }}
                >
                  <MenuItem value="" sx={{ fontSize: "0.82rem" }}>
                    All Tasks
                  </MenuItem>
                  <MenuItem value="pending" sx={{ fontSize: "0.82rem" }}>
                    Pending
                  </MenuItem>
                  <MenuItem value="in_progress" sx={{ fontSize: "0.82rem" }}>
                    In Progress
                  </MenuItem>
                  <MenuItem
                    value="pending_approval"
                    sx={{ fontSize: "0.82rem" }}
                  >
                    Pending Approval
                  </MenuItem>
                  <MenuItem value="submitted" sx={{ fontSize: "0.82rem" }}>
                    Submitted
                  </MenuItem>
                  <MenuItem value="completed" sx={{ fontSize: "0.82rem" }}>
                    Completed
                  </MenuItem>
                </Select>
              </FormControl>

              {/* Priority */}
              <FormControl
                size="small"
                sx={{ width: "100%", minWidth: 0, display: { xs: "none", sm: "block" } }}
              >
                <Select
                  value={filters.priority}
                  onChange={(e) =>
                    handleFilterChange("priority", e.target.value)
                  }
                  displayEmpty
                  IconComponent={ArrowDownIcon}
                  sx={{ fontSize: "0.82rem", bgcolor: "#fff" }}
                >
                  <MenuItem value="" sx={{ fontSize: "0.82rem" }}>
                    Priority
                  </MenuItem>
                  <MenuItem value="critical" sx={{ fontSize: "0.82rem" }}>
                    Critical
                  </MenuItem>
                  <MenuItem value="high" sx={{ fontSize: "0.82rem" }}>
                    High
                  </MenuItem>
                  <MenuItem value="medium" sx={{ fontSize: "0.82rem" }}>
                    Medium
                  </MenuItem>
                  <MenuItem value="low" sx={{ fontSize: "0.82rem" }}>
                    Low
                  </MenuItem>
                </Select>
              </FormControl>

              {/* Date */}
              <TextField
                size="small"
                type="date"
                placeholder="mm/dd/yyyy"
                value={filters.date || ""}
                onChange={(e) => handleFilterChange("date", e.target.value)}
                sx={{
                  width: "100%",
                  display: { xs: "none", sm: "block" },
                  "& .MuiOutlinedInput-root": {
                    fontSize: "0.82rem",
                    bgcolor: "#fff",
                  },
                }}
              />

              {hasFilters && (
                <Button
                  size="small"
                  onClick={clearFilters}
                  startIcon={<ClearIcon sx={{ fontSize: 13 }} />}
                  sx={{
                    color: "#ef4444",
                    fontSize: "0.78rem",
                    borderRadius: 1.5,
                    border: "1px solid #fecaca",
                    bgcolor: "#fef2f2",
                    "&:hover": { bgcolor: "#fee2e2" },
                    px: 1.5,
                    width: { xs: "100%", sm: "auto" },
                    display: { xs: "none", sm: "inline-flex" },
                  }}
                >
                  Clear
                </Button>
              )}
            </Stack>
          </Paper>

          <Dialog
            open={mobileFiltersOpen}
            onClose={() => setMobileFiltersOpen(false)}
            fullWidth
            maxWidth="xs"
            PaperProps={{
              sx: {
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
            <Box sx={{ display: "flex", justifyContent: "center", pt: 1.4 }}>
              <Box sx={{ width: 44, height: 4, borderRadius: 999, bgcolor: "#e2e8f0" }} />
            </Box>
            <DialogTitle
              sx={{
                px: 2.25,
                py: 1.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <FilterListIcon sx={{ fontSize: 18, color: "#0d3d52" }} />
                <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: "#0f172a" }}>
                  Filters
                </Typography>
              </Stack>
              <IconButton size="small" onClick={() => setMobileFiltersOpen(false)}>
                <CloseIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ px: 2.25, pb: 1 }}>
              <Stack spacing={1.25}>
                <FormControl size="small" fullWidth>
                  <Select
                    value={filters.status}
                    onChange={(e) => handleFilterChange("status", e.target.value)}
                    displayEmpty
                    IconComponent={ArrowDownIcon}
                    sx={{ fontSize: "0.82rem", bgcolor: "#fff" }}
                  >
                    <MenuItem value="" sx={{ fontSize: "0.82rem" }}>All Tasks</MenuItem>
                    <MenuItem value="pending" sx={{ fontSize: "0.82rem" }}>Pending</MenuItem>
                    <MenuItem value="in_progress" sx={{ fontSize: "0.82rem" }}>In Progress</MenuItem>
                    <MenuItem value="pending_approval" sx={{ fontSize: "0.82rem" }}>Pending Approval</MenuItem>
                    <MenuItem value="submitted" sx={{ fontSize: "0.82rem" }}>Submitted</MenuItem>
                    <MenuItem value="completed" sx={{ fontSize: "0.82rem" }}>Completed</MenuItem>
                  </Select>
                </FormControl>

                <FormControl size="small" fullWidth>
                  <Select
                    value={filters.priority}
                    onChange={(e) => handleFilterChange("priority", e.target.value)}
                    displayEmpty
                    IconComponent={ArrowDownIcon}
                    sx={{ fontSize: "0.82rem", bgcolor: "#fff" }}
                  >
                    <MenuItem value="" sx={{ fontSize: "0.82rem" }}>Priority</MenuItem>
                    <MenuItem value="critical" sx={{ fontSize: "0.82rem" }}>Critical</MenuItem>
                    <MenuItem value="high" sx={{ fontSize: "0.82rem" }}>High</MenuItem>
                    <MenuItem value="medium" sx={{ fontSize: "0.82rem" }}>Medium</MenuItem>
                    <MenuItem value="low" sx={{ fontSize: "0.82rem" }}>Low</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  size="small"
                  type="date"
                  value={filters.date || ""}
                  onChange={(e) => handleFilterChange("date", e.target.value)}
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      fontSize: "0.82rem",
                      bgcolor: "#fff",
                    },
                  }}
                />
              </Stack>
            </DialogContent>
            <DialogActions
              sx={{
                px: 2.25,
                pt: 1,
                pb: "calc(16px + env(safe-area-inset-bottom))",
                borderTop: "1px solid #f1f5f9",
                gap: 1,
              }}
            >
              {hasFilters && (
                <Button
                  onClick={clearFilters}
                  startIcon={<ClearIcon sx={{ fontSize: 15 }} />}
                  sx={{
                    mr: "auto",
                    color: "#ef4444",
                    textTransform: "none",
                    fontSize: "0.82rem",
                  }}
                >
                  Clear
                </Button>
              )}
              <Button
                variant="contained"
                onClick={() => setMobileFiltersOpen(false)}
                sx={{
                  bgcolor: "#0d3d52",
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 700,
                  px: 3,
                  "&:hover": { bgcolor: "#072535" },
                }}
              >
                Apply
              </Button>
            </DialogActions>
          </Dialog>

          {/* ── Stat Cards ── */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(2, 1fr)",
                sm: "repeat(2, 1fr)",
                lg: `repeat(${visibleStatCards.length}, 1fr)`,
              },
              gap: { xs: 1.5, sm: 2 },
              mb: 3,
            }}
          >
            {visibleStatCards.map((card, index) => (
              <StatCard
                key={card.type}
                title={card.title}
                value={card.value}
                active={
                  card.type === "total"
                    ? !statFilter && !filters.status && !filters.date && !calendarDateFilter
                    : statFilter === card.type
                }
                onClick={() => handleStatFilter(card.type)}
                sx={{
                  gridColumn: {
                    xs:
                      visibleStatCards.length % 2 === 1 &&
                      index === visibleStatCards.length - 1
                        ? "1 / -1"
                        : "auto",
                    sm: "auto",
                  },
                }}
              />
            ))}
          </Box>

          {/* ── Content ── */}
          {loading ? (
            <Grid container spacing={2}>
              {[...Array(6)].map((_, i) => (
                <Grid item xs={12} sm={6} md={4} key={i}>
                  <Skeleton
                    variant="rectangular"
                    height={260}
                    sx={{ borderRadius: 2 }}
                  />
                </Grid>
              ))}
            </Grid>
          ) : viewMode === "calendar" ? (
            <CalendarView
              tasks={displayedTasks}
              onView={handleViewTask}
              onPoa={handlePoaTask}
            />
          ) : displayedTasks.length === 0 ? (
            <Paper
              elevation={0}
              sx={{
                p: { xs: 4, sm: 8 },
                textAlign: "center",
                borderRadius: 2,
                border: "1px dashed #cbd5e1",
                bgcolor: "#fff",
              }}
            >
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                  mx: "auto",
                  mb: 2.5,
                  bgcolor: "#f1f5f9",
                }}
              >
                <AssignmentIcon sx={{ fontSize: 32, color: "#94a3b8" }} />
              </Avatar>
              <Typography
                fontWeight={700}
                sx={{ color: "#475569", fontSize: "1rem", mb: 0.75 }}
              >
                {hasFilters ? "No matching tasks" : "No tasks assigned"}
              </Typography>
              <Typography sx={{ color: "#94a3b8", fontSize: "0.82rem" }}>
                {hasFilters
                  ? "Try adjusting your filters to see more results."
                  : "You're all caught up! Check back later."}
              </Typography>
              {hasFilters && (
                <Button
                  variant="outlined"
                  onClick={clearFilters}
                  sx={{
                    mt: 3,
                    borderRadius: 2,
                    fontSize: "0.82rem",
                    borderColor: "#e2e8f0",
                    color: "#64748b",
                  }}
                >
                  Clear all filters
                </Button>
              )}
            </Paper>
          ) : (
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", lg: "row" },
                gap: 2.5,
                alignItems: "flex-start",
              }}
            >
              <Box sx={{ flex: 1, minWidth: 0, width: "100%" }}>
              {/* 3-column grid on desktop, 2 on tablet, 1 on mobile — showing
              CARDS_PER_PAGE (9) tasks at a time */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    md: "repeat(2, minmax(0, 1fr))",
                  },
                  gridAutoRows: { xs: "284px", sm: "278px", md: "272px" },
                  gap: { xs: 1.5, sm: 2 },
                  alignItems: "stretch",
                }}
              >
                {paginatedTasks.map((task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    onView={handleViewTask}
                    onPoa={handlePoaTask}
                  />
                ))}
              </Box>

              {totalClientPages > 1 && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 1.5,
                    mt: 4,
                  }}
                >
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={goToPrevPage}
                    disabled={clientPage === 1}
                    startIcon={<NavigateBeforeIcon sx={{ fontSize: 16 }} />}
                    sx={{
                      borderRadius: 2,
                      fontSize: "0.8rem",
                      borderColor: "#e2e8f0",
                      color: "#334155",
                      px: 2,
                      "&:hover": { borderColor: "#cbd5e1", bgcolor: "#f8fafc" },
                      "&.Mui-disabled": {
                        color: "#cbd5e1",
                        borderColor: "#f1f5f9",
                      },
                    }}
                  >
                    Previous
                  </Button>

                  <Typography
                    sx={{
                      fontSize: "0.82rem",
                      color: "#64748b",
                      fontWeight: 600,
                      mx: 1,
                    }}
                  >
                    Page {clientPage} of {totalClientPages}
                  </Typography>

                  <Button
                    variant="outlined"
                    size="small"
                    onClick={goToNextPage}
                    disabled={clientPage === totalClientPages}
                    endIcon={<NavigateNextIcon sx={{ fontSize: 16 }} />}
                    sx={{
                      borderRadius: 2,
                      fontSize: "0.8rem",
                      borderColor: "#e2e8f0",
                      color: "#334155",
                      px: 2,
                      "&:hover": { borderColor: "#cbd5e1", bgcolor: "#f8fafc" },
                      "&.Mui-disabled": {
                        color: "#cbd5e1",
                        borderColor: "#f1f5f9",
                      },
                    }}
                  >
                    Next
                  </Button>
                </Box>
              )}
              </Box>
              <CalendarSidebar
                tasks={tasks}
                selectedDate={calendarDateFilter}
                onSelectDate={handleCalendarDateSelect}
                onView={handleViewTask}
              />
            </Box>
          )}
        </Container>

        <PoaDialog
          open={!!poaTask}
          task={poaTask}
          feedback={poaFeedback}
          files={poaFiles}
          error={poaError}
          submitting={submitting}
          onFeedbackChange={(value) => {
            setPoaFeedback(value);
            if (poaError && value.trim()) setPoaError("");
          }}
          onFilesChange={handlePoaFilesChange}
          onRemoveFile={handleRemovePoaFile}
          onClose={handleClosePoa}
          onSubmit={handleSubmitPoa}
        />

        <Snackbar
          open={snack.open}
          autoHideDuration={4000}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert
            severity={snack.severity}
            onClose={() => setSnack((s) => ({ ...s, open: false }))}
            sx={{ borderRadius: 2, fontSize: "0.8rem" }}
          >
            {snack.msg}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}

// pages/AssignmentDetailPage.jsx
// Fixed: correct API data paths from actual response shapes
//   GET /assignments/:id          → res.data (flat: _id, checklistData, assets, assignedToTeamMembers, ...)
//   GET /assignments/:id/recent-submissions → { submissions, pagination }
//   GET /assignments/submissions/:id        → { submission, checklistStats, attachmentCount, imageCount }
// Token handled by authRequest via AssignmentContext

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Grid,
  Card,
  Typography,
  Button,
  Chip,
  Tabs,
  Tab,
  LinearProgress,
  IconButton,
  Tooltip,
  Skeleton,
  Fade,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  FormHelperText,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  BarChart as BarChartIcon,
  Edit as EditIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  CalendarToday as CalendarIcon,
  Description as DescriptionIcon,
  People as PeopleIcon,
  Schedule as ScheduleIcon,
  Inventory2 as AssetIcon,
  Image as ImageIcon,
  AttachFile as AttachFileIcon,
  Send as SendIcon,
} from "@mui/icons-material";
import { alpha } from "@mui/material/styles";
import { useNavigate, useParams } from "react-router-dom";
import { useAssignment } from "../context/AssignmentContext";

// ── Brand ─────────────────────────────────────────────────────────────────────
const BRAND = "#0d4f63";
const BRAND_DARK = "#0b4457";
const BRAND_LIGHT = "#e1f5ee";

const statIconBg = (theme, color) => {
  if (theme.palette.mode !== "dark") return color;
  const accent =
    color === "#faeeda"
      ? "#f59e0b"
      : color === "#fcebeb"
        ? "#ef4444"
        : color === "#eeedfe"
          ? "#8b5cf6"
          : BRAND_LIGHT;
  return alpha(accent, 0.16);
};

// ── Status / Priority maps ────────────────────────────────────────────────────
const STATUS_MAP = {
  approved: { label: "Approved", bg: "#eaf3de", color: "#3b6d11" },
  pending_approval: { label: "Pending Approval", bg: "#faeeda", color: "#854f0b" },
  pending_review: { label: "Pending Review", bg: "#faeeda", color: "#854f0b" },
  rejected: { label: "Rejected", bg: "#fcebeb", color: "#a32d2d" },
  needs_revision: { label: "Needs Revision", bg: "#eeedfe", color: "#534ab7" },
  pending: { label: "Pending", bg: "#faeeda", color: "#854f0b" },
  in_progress: { label: "In Progress", bg: "#e6f1fb", color: "#185fa5" },
  submitted: { label: "Submitted", bg: "#e1f5ee", color: "#0f6e56" },
  completed: { label: "Completed", bg: "#eaf3de", color: "#3b6d11" },
  overdue: { label: "Overdue", bg: "#fcebeb", color: "#a32d2d" },
};

const PRIORITY_MAP = {
  low: { label: "Low", bg: "#f0fdf4", color: "#16a34a" },
  medium: { label: "Medium", bg: "#fefce8", color: "#ca8a04" },
  high: { label: "High", bg: "#fff7ed", color: "#f97316" },
  critical: { label: "Critical", bg: "#fef2f2", color: "#dc2626" },
};

// ── Badge helper ──────────────────────────────────────────────────────────────
const makeBadge = (map, key, fallback) => {
  const s = map[(key || "").toLowerCase()] || {
    label: fallback || key || "—",
    bg: "#f1efe8",
    color: "#5f5e5a",
  };
  return (
    <Chip
      label={s.label}
      size="small"
      sx={{
        bgcolor: s.bg,
        color: s.color,
        fontWeight: 600,
        fontSize: "0.7rem",
        height: 22,
        borderRadius: "20px",
        "& .MuiChip-label": { px: 1.25 },
      }}
    />
  );
};

const StatusBadge = ({ status }) => makeBadge(STATUS_MAP, status, status);
const PriorityBadge = ({ priority }) =>
  makeBadge(PRIORITY_MAP, priority, priority);
const submissionGridColumns =
  "minmax(260px, 1.45fr) minmax(210px, 0.95fr) minmax(140px, 0.7fr) minmax(220px, 1fr) minmax(96px, 0.45fr)";

const API_ORIGIN =
  (import.meta.env?.VITE_API_URL || "https://synversys-backend.onrender.com/api/v1")
    .replace(/\/api\/v1\/?$/, "")
    .replace(/\/$/, "");

const fileUrl = (file) => {
  let path =
    typeof file === "string"
      ? file
      : file?.url || file?.filePath || file?.path || file?.originalName || file?.name;
  if (!path) return "";
  path = String(path).trim().replace(/^https\/\//i, "https://");
  if (/^(https?:|blob:|data:)/i.test(path)) return path;
  path = path.replace(/\\/g, "/");
  const publicIndex = path.indexOf("/public/uploads/");
  if (publicIndex >= 0) path = path.slice(publicIndex + 1);
  if (path.startsWith("uploads/")) path = `public/${path}`;
  if (!path.startsWith("public/uploads/")) path = `public/uploads/checklists/${path}`;
  return `${API_ORIGIN}/${path.replace(/^\/+/, "")}`;
};

const isImageFile = (file) => {
  const name = typeof file === "string" ? file : file?.originalName || file?.name || file?.filePath || "";
  const mimetype = typeof file === "string" ? "" : file?.mimetype || "";
  return mimetype.startsWith("image/") || /\.(png|jpe?g|webp|gif)$/i.test(name);
};

const normalizeSubmissionRow = (sub = {}) => {
  const submittedBy = sub.submittedBy || {};
  const submittedByName =
    sub.submittedByName ||
    submittedBy.name ||
    sub.assignedToTeamMembers?.[0]?.name ||
    "Unknown";
  const submittedByEmail =
    sub.submittedByEmail ||
    submittedBy.email ||
    sub.assignedToTeamMembers?.[0]?.userId?.email ||
    "";
  const reviewStatus =
    sub.reviewStatus || sub.submissionStatus || sub.status || "pending_review";

  return {
    ...sub,
    _id: sub._id || sub.submissionId || sub.id,
    submittedByName,
    submittedByEmail,
    reviewStatus,
    submissionDisplayStatus: sub.submittedAt
      ? reviewStatus === "approved"
        ? "submitted"
        : "pending_approval"
      : sub.submissionStatus || sub.status || "pending",
    overallCompletionRate:
      sub.overallCompletionRate ?? sub.completionRate ?? sub.completion ?? 0,
    score: sub.score ?? sub.overallRating ?? 0,
  };
};

const csvValue = (value) => {
  const text = value == null ? "" : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

const downloadCsv = (rows, filename) => {
  const csv = rows.map((row) => row.map(csvValue).join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const buildSubmissionCsvRows = (items) => [
  [
    "Submitted By",
    "Email",
    "Submitted Date",
    "Status",
    "Completion Rate",
    "Score",
    "Passed",
    "Failed",
    "N/A",
  ],
  ...items.map((item) => {
    const sub = normalizeSubmissionRow(item);
    return [
      sub.submittedByName,
      sub.submittedByEmail,
      sub.submittedAt ? new Date(sub.submittedAt).toLocaleString("en-IN") : "",
      STATUS_MAP[sub.submissionDisplayStatus]?.label || sub.submissionDisplayStatus,
      `${sub.overallCompletionRate}%`,
      sub.score || "",
      sub.itemsPassed || 0,
      sub.itemsFailed || 0,
      sub.itemsNA || 0,
    ];
  }),
];

// ── User avatar ───────────────────────────────────────────────────────────────
const UserAvatar = ({ name, email, size = 34 }) => {
  const raw = name && name !== "Unknown" ? name : email || "?";
  const initials = raw
    .split(" ")
    .map((x) => x[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: "50%",
        bgcolor: BRAND,
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.32,
        fontWeight: 600,
        flexShrink: 0,
      }}
    >
      {initials}
    </Box>
  );
};

// ── KPI stat card ─────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, iconBg, value, label, sub }) => (
  <Card
    sx={{
      borderRadius: 3,
      border: "0.5px solid",
      borderColor: "divider",
      width: "100%",
      boxShadow: "none",
      p: { xs: 1.5, md: 2 },
      height: "100%",
    }}
  >
    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
      <Box
        sx={(theme) => ({
          p: 1.1,
          borderRadius: 2.5,
          bgcolor: statIconBg(theme, iconBg),
          flexShrink: 0,
        })}
      >
        <Icon
          sx={(theme) => ({
            fontSize: 20,
            color: theme.palette.mode === "dark" ? "#67e8f9" : BRAND,
          })}
        />
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="caption"
          sx={{
            color: "text.secondary",
            fontWeight: 500,
            fontSize: "0.72rem",
            display: "block",
          }}
        >
          {label}
        </Typography>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            color: "text.primary",
            mt: 0.25,
            fontSize: { xs: "1.2rem", md: "1.4rem" },
            lineHeight: 1.2,
          }}
        >
          {value}
        </Typography>
        {sub && (
          <Typography
            variant="caption"
            sx={{ color: "text.secondary", fontSize: "0.7rem" }}
          >
            {sub}
          </Typography>
        )}
      </Box>
    </Box>
  </Card>
);

// ── Field type icon map ───────────────────────────────────────────────────────
const FIELD_ICONS = {
  text_input: "T",
  text_area: "¶",
  dropdown: "▾",
  checkbox: "☑",
  radio: "◎",
  date: "D",
  number: "#",
  rating: "★",
  image_upload: "IMG",
  signature: "SIG",
};

// ── Submissions Tab ───────────────────────────────────────────────────────────
const SubmissionsTab = ({ assignmentId, onViewSubmission }) => {
  const { getRecentSubmissions } = useAssignment();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  const mounted = useRef(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isDark = theme.palette.mode === "dark";

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const fetchSubmissions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // context method: returns { success, submissions, pagination }
      const result = await getRecentSubmissions(assignmentId);
      if (!mounted.current) return;
      if (result.success) {
        setSubmissions((result.submissions || []).map(normalizeSubmissionRow));
        setPagination(result.pagination || null);
      } else {
        setError(result.error || "Failed to load submissions");
      }
    } catch (err) {
      if (!mounted.current) return;
      setError(err?.message || "Failed to load submissions");
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [assignmentId, getRecentSubmissions]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const handleExportAll = () => {
    if (!submissions.length) return;
    downloadCsv(
      buildSubmissionCsvRows(submissions),
      `assignment-${assignmentId}-submissions.csv`,
    );
  };

  const handleDownloadSubmission = (sub) => {
    const normalized = normalizeSubmissionRow(sub);
    downloadCsv(
      buildSubmissionCsvRows([normalized]),
      `submission-${normalized._id || normalized.inspectionId || "details"}.csv`,
    );
  };

  if (loading)
    return (
      <Card
        sx={{
          borderRadius: 3,
          border: "0.5px solid",
          borderColor: "divider",
          boxShadow: "none",
          p: 3,
        }}
      >
        <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
      </Card>
    );

  if (error)
    return (
      <Alert
        severity="error"
        sx={{ borderRadius: 3 }}
        action={
          <Button size="small" color="inherit" onClick={fetchSubmissions}>
            Retry
          </Button>
        }
      >
        {error}
      </Alert>
    );

  return (
    <Card
      sx={{
        borderRadius: 3,
        border: "0.5px solid",
        borderColor: "divider",
        boxShadow: "none",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: { xs: 2, md: 2.5 },
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "0.5px solid",
          borderColor: "divider",
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Box>
          <Typography variant="subtitle2" fontWeight={600} fontSize="0.85rem">
            Recent Submissions
          </Typography>
          {pagination && (
            <Typography
              variant="caption"
              color="text.secondary"
              fontSize="0.72rem"
            >
              {pagination.total} total
            </Typography>
          )}
        </Box>
        <Button
          size="small"
          startIcon={<DownloadIcon />}
          variant="outlined"
          onClick={handleExportAll}
          disabled={!submissions.length}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontSize: "0.78rem",
            borderColor: "divider",
            color: "text.primary",
            "&:hover": { borderColor: BRAND, color: BRAND },
          }}
        >
          Export All
        </Button>
      </Box>

      {/* Desktop column headers */}
      {!isMobile && (
        <Box
          sx={{
            px: 2.5,
            py: 1.25,
            display: "grid",
            gridTemplateColumns: submissionGridColumns,
            columnGap: 2,
            alignItems: "center",
            borderBottom: "0.5px solid",
            borderColor: "divider",
            bgcolor: isDark ? "rgba(15, 28, 46, 0.92)" : "grey.50",
          }}
        >
          {["Submitted By", "Date", "Status", "Completion", "Actions"].map(
            (h, index) => (
              <Typography
                key={h}
                variant="caption"
                sx={{
                  fontWeight: 600,
                  color: "text.secondary",
                  fontSize: "0.66rem",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  justifySelf: index === 4 ? "end" : "start",
                }}
              >
                {h}
              </Typography>
            ),
          )}
        </Box>
      )}

      {submissions.length === 0 ? (
        <Box sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            No submissions yet
          </Typography>
        </Box>
      ) : (
        submissions.map((sub, i) => {
          // API fields: submittedByName, submittedByEmail, submittedAt, reviewStatus,
          //             overallCompletionRate, score, itemsPassed, itemsFailed, performanceRating
          const displayName =
            sub.submittedByName && sub.submittedByName !== "Unknown"
              ? sub.submittedByName
              : sub.submittedByEmail || "—";
          const rate = sub.overallCompletionRate || 0;
          const rateColor =
            rate >= 80 ? "#1d9e75" : rate >= 50 ? "#ef9f27" : "#e24b4a";

          return (
            <Box key={sub._id || i}>
              {/* Desktop row */}
              {!isMobile ? (
                <Box
                  sx={{
                    px: 2.5,
                    py: 1.75,
                    display: "grid",
                    gridTemplateColumns: submissionGridColumns,
                    columnGap: 2,
                    alignItems: "center",
                    "&:hover": { bgcolor: "action.hover" },
                    transition: "background .15s",
                  }}
                >
                  {/* Submitted by */}
                  <Box
                    sx={{ display: "flex", alignItems: "center", gap: 1.25 }}
                  >
                    <UserAvatar
                      name={sub.submittedByName}
                      email={sub.submittedByEmail}
                      size={30}
                    />
                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        fontSize="0.8rem"
                        noWrap
                      >
                        {displayName}
                      </Typography>
                      {sub.submittedByEmail &&
                        sub.submittedByName &&
                        sub.submittedByName !== "Unknown" && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            fontSize="0.68rem"
                            noWrap
                          >
                            {sub.submittedByEmail}
                          </Typography>
                        )}
                    </Box>
                  </Box>

                  {/* Date */}
                  <Box
                    sx={{ display: "flex", alignItems: "center", gap: 0.75 }}
                  >
                    <CalendarIcon
                      sx={{ fontSize: 12, color: "text.secondary" }}
                    />
                    <Typography variant="caption" fontSize="0.75rem">
                      {sub.submittedAt
                        ? new Date(sub.submittedAt).toLocaleString("en-IN", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </Typography>
                  </Box>

                  {/* Status */}
                  <Box sx={{ justifySelf: "start" }}>
                    <StatusBadge status={sub.submissionDisplayStatus} />
                  </Box>

                  {/* Completion */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
                    <LinearProgress
                      variant="determinate"
                      value={rate}
                      sx={{
                        flex: 1,
                        height: 5,
                        borderRadius: 3,
                        bgcolor: "#f1efe8",
                        "& .MuiLinearProgress-bar": {
                          bgcolor: rateColor,
                          borderRadius: 3,
                        },
                      }}
                    />
                    <Typography
                      variant="caption"
                      fontSize="0.7rem"
                      color="text.secondary"
                      sx={{ minWidth: 32 }}
                    >
                      {rate}%
                    </Typography>
                  </Box>

                  {/* Actions */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      gap: 0.25,
                    }}
                  >
                    <Tooltip title="View submission">
                      <IconButton
                        size="small"
                        onClick={() => onViewSubmission(sub._id)}
                        sx={{
                          color: BRAND,
                          "&:hover": { bgcolor: `${BRAND}12` },
                        }}
                      >
                        <VisibilityIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Download">
                      <IconButton
                        size="small"
                        onClick={() => handleDownloadSubmission(sub)}
                        sx={{ color: "text.secondary" }}
                      >
                        <DownloadIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              ) : (
                /* Mobile card */
                <Box
                  sx={{
                    p: 2,
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.25,
                      justifyContent: "space-between",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <UserAvatar
                        name={sub.submittedByName}
                        email={sub.submittedByEmail}
                        size={28}
                      />
                      <Box>
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          fontSize="0.8rem"
                        >
                          {displayName}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          fontSize="0.68rem"
                        >
                          {sub.submittedAt
                            ? new Date(sub.submittedAt).toLocaleDateString()
                            : "—"}
                        </Typography>
                      </Box>
                    </Box>
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <StatusBadge status={sub.submissionDisplayStatus} />
                      <IconButton
                        size="small"
                        onClick={() => onViewSubmission(sub._id)}
                        sx={{
                          color: BRAND,
                          "&:hover": { bgcolor: `${BRAND}12` },
                        }}
                      >
                        <VisibilityIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDownloadSubmission(sub)}
                        sx={{ color: "text.secondary" }}
                      >
                        <DownloadIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Box>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={rate}
                      sx={{
                        flex: 1,
                        height: 5,
                        borderRadius: 3,
                        bgcolor: "#f1efe8",
                        "& .MuiLinearProgress-bar": {
                          bgcolor: rateColor,
                          borderRadius: 3,
                        },
                      }}
                    />
                    <Typography
                      variant="caption"
                      fontSize="0.7rem"
                      color="text.secondary"
                      sx={{ minWidth: 28 }}
                    >
                      {rate}%
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontSize="0.7rem"
                    >
                      Passed:{" "}
                      <strong style={{ color: "#1d9e75" }}>
                        {sub.itemsPassed || 0}
                      </strong>
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontSize="0.7rem"
                    >
                      Failed:{" "}
                      <strong style={{ color: "#e24b4a" }}>
                        {sub.itemsFailed || 0}
                      </strong>
                    </Typography>
                    {sub.performanceRating > 0 && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        fontSize="0.7rem"
                      >
                        Rating: <strong>{sub.performanceRating}/5</strong>
                      </Typography>
                    )}
                  </Box>
                </Box>
              )}

              {i < submissions.length - 1 && (
                <Box
                  sx={{ borderBottom: "0.5px solid", borderColor: "divider" }}
                />
              )}
            </Box>
          );
        })
      )}
    </Card>
  );
};

// ── Form Structure Tab ────────────────────────────────────────────────────────
// Uses checklistData from assignment detail response
// Shape: [{ checklistId, name, version, type, category, sections: [{ title, fields: [...] }], totalFieldsSnapshot }]
const FormStructureTab = ({ checklistData }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isDark = theme.palette.mode === "dark";
  const iconBg = isDark ? "rgba(148, 163, 184, 0.1)" : "#f0f6f8";

  if (!checklistData?.length)
    return (
      <Card
        sx={{
          borderRadius: 3,
          border: "0.5px solid",
          borderColor: "divider",
          boxShadow: "none",
          p: 4,
          textAlign: "center",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          No form structure available
        </Typography>
      </Card>
    );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
      {checklistData.map((cl, ci) => {
        const allFields = cl.sections?.flatMap((s) => s.fields || []) || [];
        const requiredCount = allFields.filter((f) => f.required).length;
        return (
          <Card
            key={ci}
            sx={{
              borderRadius: 3,
              border: "0.5px solid",
              borderColor: "divider",
              boxShadow: "none",
            }}
          >
            {/* Checklist header */}
            <Box
              sx={{
                px: { xs: 2, md: 2.5 },
                py: 2,
                borderBottom: "0.5px solid",
                borderColor: "divider",
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                flexWrap: "wrap",
              }}
            >
              <Box sx={{ p: 0.75, bgcolor: `${BRAND}12`, borderRadius: 1.5 }}>
                <DescriptionIcon sx={{ fontSize: 16, color: BRAND }} />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="subtitle2"
                  fontWeight={600}
                  fontSize="0.85rem"
                  noWrap
                >
                  {cl.name}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontSize="0.7rem"
                >
                  {cl.version} · {cl.type} · {cl.category}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", gap: 0.75, flexShrink: 0 }}>
                <Chip
                  label={`${allFields.length} fields`}
                  size="small"
                  sx={{
                    bgcolor: `${BRAND}12`,
                    color: BRAND,
                    fontWeight: 600,
                    fontSize: "0.66rem",
                    height: 20,
                  }}
                />
                <Chip
                  label={`${requiredCount} required`}
                  size="small"
                  sx={{
                    bgcolor: "#fcebeb",
                    color: "#a32d2d",
                    fontWeight: 600,
                    fontSize: "0.66rem",
                    height: 20,
                  }}
                />
              </Box>
            </Box>

            {/* Sections */}
            {cl.sections?.map((section, si) => (
              <Box
                key={si}
                sx={{
                  p: { xs: 1.75, md: 2.5 },
                  borderBottom:
                    si < cl.sections.length - 1 ? "0.5px solid" : "none",
                  borderColor: "divider",
                }}
              >
                {section.title && (
                  <Typography
                    variant="caption"
                    sx={{
                      color: "text.secondary",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                      fontSize: "0.66rem",
                      mb: 1.5,
                      display: "block",
                    }}
                  >
                    {section.title} ({section.fields?.length || 0} fields)
                  </Typography>
                )}
                <Box
                  sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}
                >
                  {(section.fields || []).map((field, fi) => (
                    <Card
                      key={fi}
                      sx={{
                        borderRadius: 2,
                        border: "0.5px solid",
                        borderColor: "divider",
                        boxShadow: "none",
                        px: { xs: 1.5, md: 2 },
                        py: 1.25,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.25,
                        }}
                      >
                        {/* Type icon */}
                        <Box
                          sx={{
                            width: 26,
                            height: 26,
                            borderRadius: 1.5,
                            bgcolor: iconBg,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 700,
                              color: BRAND,
                              fontSize: "0.65rem",
                            }}
                          >
                            {FIELD_ICONS[field.fieldType] || fi + 1}
                          </Typography>
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.75,
                              flexWrap: "wrap",
                            }}
                          >
                            <Typography
                              variant="body2"
                              fontWeight={600}
                              fontSize="0.8rem"
                            >
                              {field.label}
                            </Typography>
                            {field.required && (
                              <Chip
                                label="Required"
                                size="small"
                                sx={{
                                  bgcolor: "#fcebeb",
                                  color: "#a32d2d",
                                  fontWeight: 600,
                                  fontSize: "0.6rem",
                                  height: 17,
                                  borderRadius: "20px",
                                  "& .MuiChip-label": { px: 0.75 },
                                }}
                              />
                            )}
                          </Box>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            fontSize="0.7rem"
                            sx={{ textTransform: "capitalize" }}
                          >
                            {field.fieldType?.replace(/_/g, " ")}
                            {field.options?.length > 0 &&
                              ` · ${field.options.length} options`}
                            {field.validation?.min != null &&
                              ` · ${field.validation.min}–${field.validation.max}`}
                          </Typography>
                        </Box>
                      </Box>
                    </Card>
                  ))}
                </Box>
              </Box>
            ))}
          </Card>
        );
      })}
    </Box>
  );
};

// ── Assets Tab ────────────────────────────────────────────────────────────────
// Uses assets array from assignment detail
// Each asset: { assetId, assetName, assetTagNumber, assetStatus, fields: [{key, label, value, fieldType}], metadata }
const SHOW_KEYS = [
  "assetName",
  "tagNumber",
  "status",
  "serialNumber",
  "assetCondition",
  "warrantyStatus",
  "healthScore"
];

const AssetsTab = ({ assets }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const fieldBg = isDark ? "rgba(148, 163, 184, 0.08)" : "#f0f6f8";
  const accentBg = isDark ? "rgba(245, 158, 11, 0.14)" : "#faeeda";
  const inactiveBg = isDark ? "rgba(148, 163, 184, 0.12)" : "#f1efe8";
  const activeBg = isDark ? "rgba(16, 185, 129, 0.16)" : "#eaf3de";
  if (!assets?.length)
    return (
      <Card
        sx={{
          borderRadius: 3,
          border: "0.5px solid",
          borderColor: "divider",
          boxShadow: "none",
          p: 4,
          textAlign: "center",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          No assets linked to this assignment
        </Typography>
      </Card>
    );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {assets.map((asset, i) => {
        const visibleFields = (asset.fields || []).filter((f) =>
          SHOW_KEYS.includes(f.key),
        );
        return (
          <Card
            key={i}
            sx={{
              borderRadius: 3,
              border: "0.5px solid",
              borderColor: "divider",
              boxShadow: "none",
            }}
          >
            {/* Asset header */}
            <Box
              sx={{
                px: { xs: 2, md: 2.5 },
                py: 2,
                borderBottom: "0.5px solid",
                borderColor: "divider",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 1,
                flexWrap: "wrap",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                <Box sx={{ p: 0.75, bgcolor: accentBg, borderRadius: 1.5 }}>
                  <AssetIcon sx={{ fontSize: 16, color: "#854f0b" }} />
                </Box>
                <Box>
                  <Typography
                    variant="subtitle2"
                    fontWeight={600}
                    fontSize="0.85rem"
                  >
                    {asset.assetName}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontSize="0.7rem"
                  >
                    {asset.assetTagNumber}
                    {asset.assetCategory && ` · ${asset.assetCategory}`}
                  </Typography>
                </Box>
              </Box>
              <Chip
                label={asset.assetStatus || "—"}
                size="small"
                sx={{
                  bgcolor:
                    asset.assetStatus === "Active" ? activeBg : inactiveBg,
                  color: asset.assetStatus === "Active" ? "#5eead4" : "text.secondary",
                  fontWeight: 600,
                  fontSize: "0.68rem",
                  height: 20,
                }}
              />
            </Box>

            {/* Asset fields */}
            <Box sx={{ p: { xs: 1.75, md: 2.5 } }}>
              <Grid container spacing={1.25}>
                {visibleFields.map((f, fi) => (
                  <Grid item xs={6} sm={4} md={3} key={fi} sx={{width:"250px"}}>
                    <Box sx={{ p: 1.25, bgcolor: fieldBg, borderRadius: 2 }}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        fontSize="0.66rem"
                        fontWeight={600}
                        sx={{
                          textTransform: "uppercase",
                          letterSpacing: 0.4,
                          display: "block",
                        }}
                      >
                        {f.label}
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        fontSize="0.8rem"
                        sx={{ mt: 0.25 }}
                      >
                        {f.fieldType === "boolean"
                          ? f.value
                            ? "Yes"
                            : "No"
                          : f.key === "purchaseCost" &&
                              typeof f.value === "number"
                            ? `₹${f.value.toLocaleString()}`
                            : f.value?.toString() || "—"}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
              {asset.metadata?.notes && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontSize="0.73rem"
                  sx={{ mt: 1.5, display: "block" }}
                >
                  Notes: {asset.metadata.notes}
                </Typography>
              )}
              {asset.metadata?.tags?.length > 0 && (
                <Box
                  sx={{ display: "flex", gap: 0.75, mt: 1, flexWrap: "wrap" }}
                >
                  {asset.metadata.tags.map((tag, ti) => (
                    <Chip
                      key={ti}
                      label={tag}
                      size="small"
                      sx={{
                        bgcolor: inactiveBg,
                        color: "text.secondary",
                        fontSize: "0.66rem",
                        height: 18,
                      }}
                    />
                  ))}
                </Box>
              )}
            </Box>
          </Card>
        );
      })}
    </Box>
  );
};

// ── Assignees Tab ─────────────────────────────────────────────────────────────
// Uses assignedToTeamMembers from assignment detail
// Shape: [{ userId, name, email, status, assignedAt, completedAt }]
// Uses assignedBy for admin context
const AssigneesTab = ({
  assignedToTeamMembers,
  assignedBy,
  assignedByRole,
}) => {
  const members = assignedToTeamMembers || [];

  return (
    <Card
      sx={{
        borderRadius: 3,
        border: "0.5px solid",
        borderColor: "divider",
        boxShadow: "none",
      }}
    >
      <Box
        sx={{
          px: 2.5,
          py: 2,
          borderBottom: "0.5px solid",
          borderColor: "divider",
        }}
      >
        <Typography variant="subtitle2" fontWeight={600} fontSize="0.85rem">
          Assigned Users ({members.length})
        </Typography>
      </Box>
      <Box sx={{ p: { xs: 1.75, md: 2.5 } }}>
        {/* Assigned by (admin who created the assignment) */}
        {assignedBy && (
          <Box sx={{ mb: 2.5 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              fontSize="0.68rem"
              fontWeight={600}
              sx={{
                textTransform: "uppercase",
                letterSpacing: 0.4,
                display: "block",
                mb: 1,
              }}
            >
              Assigned By
            </Typography>
            <Card
              sx={{
                borderRadius: 2,
                border: "0.5px solid",
                borderColor: "divider",
                boxShadow: "none",
                p: 1.75,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <UserAvatar
                  name={assignedBy.customerName || assignedBy.name}
                  email={assignedBy.email}
                  size={38}
                />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    fontSize="0.82rem"
                    noWrap
                  >
                    {assignedBy.customerName ||
                      assignedBy.name ||
                      assignedBy.email}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontSize="0.7rem"
                    noWrap
                  >
                    {assignedBy.email}
                    {assignedByRole && ` · ${assignedByRole}`}
                  </Typography>
                </Box>
                <Chip
                  label={assignedByRole || "admin"}
                  size="small"
                  sx={{
                    bgcolor: "#e6f1fb",
                    color: "#185fa5",
                    fontWeight: 600,
                    fontSize: "0.66rem",
                    height: 20,
                    textTransform: "capitalize",
                  }}
                />
              </Box>
            </Card>
          </Box>
        )}

        {/* Team members */}
        {members.length > 0 && (
          <>
            <Typography
              variant="caption"
              color="text.secondary"
              fontSize="0.68rem"
              fontWeight={600}
              sx={{
                textTransform: "uppercase",
                letterSpacing: 0.4,
                display: "block",
                mb: 1,
              }}
            >
              Team Members ({members.length})
            </Typography>
            <Grid container spacing={1.5}>
              {members.map((m, i) => (
                <Grid item xs={12} sm={6} md={4} key={i}>
                  <Card
                    sx={{
                      borderRadius: 2,
                      border: "0.5px solid",
                      borderColor: "divider",
                      boxShadow: "none",
                      p: 1.75,
                    }}
                  >
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 1.25 }}
                    >
                      <UserAvatar name={m.name} email={m.email} size={36} />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          fontSize="0.8rem"
                          noWrap
                        >
                          {m.name && m.name !== m.email
                            ? m.name
                            : m.email?.split("@")[0] || "—"}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          fontSize="0.7rem"
                          noWrap
                        >
                          {m.email}
                        </Typography>
                        {m.completedAt && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            fontSize="0.66rem"
                            display="block"
                          >
                            Done {new Date(m.completedAt).toLocaleDateString()}
                          </Typography>
                        )}
                      </Box>
                      <Tooltip title={m.status || "pending"}>
                        <CheckCircleIcon
                          sx={{
                            fontSize: 18,
                            flexShrink: 0,
                            color:
                              m.status === "completed" ? "#1d9e75" : "#d1d5db",
                          }}
                        />
                      </Tooltip>
                    </Box>
                    <Box sx={{ mt: 1 }}>
                      {makeBadge(STATUS_MAP, m.status, m.status)}
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        )}

        {members.length === 0 && !assignedBy && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: "center", py: 3 }}
          >
            No assignees found
          </Typography>
        )}
      </Box>
    </Card>
  );
};

// ── POA Tab ───────────────────────────────────────────────────────────────────
// Shows proof-of-action feedback and uploaded images/files from assignment.poaSubmissions.
const POATab = ({ poaSubmissions, canAddPoa, inspectionSubmitted, onAddPoa }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const softBg = isDark ? "rgba(148, 163, 184, 0.08)" : "#f0f6f8";
  const submissions = poaSubmissions || [];

  if (!submissions.length) {
    return (
      <Card
        sx={{
          borderRadius: 3,
          border: "0.5px solid",
          borderColor: "divider",
          boxShadow: "none",
          p: 4,
          textAlign: "center",
        }}
      >
        <Typography variant="subtitle2" fontWeight={800} color={BRAND}>
          {inspectionSubmitted
            ? "No POA submitted yet"
            : "Inspection is not submitted yet"}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 0.75, maxWidth: 460, mx: "auto" }}
        >
          {inspectionSubmitted
            ? "POA feedback and uploaded files will appear here after submission."
            : "POA can be added after the inspection has been submitted."}
        </Typography>

        {canAddPoa && (
          <Button
            variant="contained"
            startIcon={<AttachFileIcon />}
            onClick={onAddPoa}
            sx={{
              mt: 2,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 700,
              bgcolor: BRAND,
              boxShadow: "none",
              "&:hover": { bgcolor: BRAND_DARK, boxShadow: "none" },
            }}
          >
            Add POA
          </Button>
        )}
      </Card>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {submissions.map((poa, index) => {
        const attachments = poa.attachments || [];
        const imageAttachments = attachments.filter(isImageFile);
        const otherAttachments = attachments.filter((file) => !isImageFile(file));

        return (
          <Card
            key={`${poa.submittedBy || index}-${poa.submittedAt || index}`}
            sx={{
              borderRadius: 3,
              border: "0.5px solid",
              borderColor: "divider",
              boxShadow: "none",
            }}
          >
            <Box
              sx={{
                px: { xs: 2, md: 2.5 },
                py: 2,
                borderBottom: "0.5px solid",
                borderColor: "divider",
                display: "flex",
                justifyContent: "space-between",
                gap: 1.5,
                flexWrap: "wrap",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                <UserAvatar
                  name={poa.submittedByName}
                  email={poa.submittedByEmail}
                  size={38}
                />
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" fontWeight={700} fontSize="0.84rem" noWrap>
                    {poa.submittedByName || poa.submittedByEmail || "Team Member"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" fontSize="0.7rem" noWrap>
                    {poa.submittedByEmail || "No email"}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="caption" color="text.secondary" fontSize="0.72rem">
                {poa.submittedAt ? new Date(poa.submittedAt).toLocaleString() : "Date unavailable"}
              </Typography>
            </Box>

            <Box sx={{ p: { xs: 2, md: 2.5 } }}>
              <Typography variant="caption" color="text.secondary" fontWeight={700} fontSize="0.68rem">
                POA Feedback
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  mt: 0.75,
                  mb: 2,
                  p: 1.5,
                  bgcolor: softBg,
                  borderRadius: 2,
                  color: "text.primary",
                  fontSize: "0.82rem",
                  lineHeight: 1.6,
                  whiteSpace: "pre-wrap",
                }}
              >
                {poa.feedback || "No feedback provided"}
              </Typography>

              <Typography variant="caption" color="text.secondary" fontWeight={700} fontSize="0.68rem">
                Uploaded Images ({imageAttachments.length})
              </Typography>
              {imageAttachments.length > 0 ? (
                <Grid container spacing={1.25} sx={{ mt: 0.25, mb: otherAttachments.length ? 2 : 0 }}>
                  {imageAttachments.map((file, imageIndex) => {
                    const url = fileUrl(file);
                    return (
                      <Grid
                        item
                        xs="auto"
                        key={`${url}-${imageIndex}`}
                        sx={{ width: { xs: 132, sm: 150, md: 168 } }}
                      >
                        <Box
                          component="a"
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          sx={{
                            display: "block",
                            border: "0.5px solid",
                            borderColor: "divider",
                            borderRadius: 2,
                            overflow: "hidden",
                            textDecoration: "none",
                            bgcolor: isDark ? "#0f1c2e" : "#fff",
                            width: "100%",
                          }}
                        >
                          <Box
                            component="img"
                            src={url}
                            alt={file.originalName || `POA image ${imageIndex + 1}`}
                            sx={{
                              width: "100%",
                              height: { xs: 92, sm: 104, md: 112 },
                              objectFit: "cover",
                              display: "block",
                            }}
                          />
                          <Typography
                            variant="caption"
                            sx={{
                              display: "block",
                              color: "text.secondary",
                              fontSize: "0.68rem",
                              px: 1,
                              py: 0.75,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {file.originalName || `Image ${imageIndex + 1}`}
                          </Typography>
                        </Box>
                      </Grid>
                    );
                  })}
                </Grid>
              ) : (
                <Typography variant="body2" color="text.secondary" fontSize="0.78rem" sx={{ mt: 0.75, mb: 2 }}>
                  No images uploaded.
                </Typography>
              )}

              {otherAttachments.length > 0 && (
                <>
                  <Typography variant="caption" color="text.secondary" fontWeight={700} fontSize="0.68rem">
                    Other Attachments ({otherAttachments.length})
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 0.75 }}>
                    {otherAttachments.map((file, fileIndex) => {
                      const url = fileUrl(file);
                      return (
                        <Button
                          key={`${url}-${fileIndex}`}
                          component="a"
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          size="small"
                          variant="outlined"
                          startIcon={<DownloadIcon />}
                          sx={{
                            borderRadius: 2,
                            textTransform: "none",
                            fontSize: "0.74rem",
                            borderColor: "divider",
                            color: BRAND,
                          }}
                        >
                          {file.originalName || `Attachment ${fileIndex + 1}`}
                        </Button>
                      );
                    })}
                  </Box>
                </>
              )}
            </Box>
          </Card>
        );
      })}
    </Box>
  );
};

// ── Page skeleton ─────────────────────────────────────────────────────────────
const AdminPoaDialog = ({
  open,
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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
          borderRadius: { xs: 0, sm: 3 },
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
      <DialogTitle sx={{ pb: 1 }}>
        <Typography fontWeight={800} fontSize="1.05rem">
          Add POA
        </Typography>
        <Typography color="text.secondary" fontSize="0.8rem" sx={{ mt: 0.35 }}>
          Submit proof of action for this completed inspection.
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ pt: "12px !important", flex: 1, overflowY: "auto" }}>
        <Stack spacing={2}>
          <TextField
            label="POA Feedback"
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
                borderRadius: 2,
                borderColor: "divider",
                color: BRAND,
                textTransform: "none",
                "&:hover": { borderColor: BRAND, bgcolor: BRAND_LIGHT },
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
          pt: 1,
          borderTop: { xs: "1px solid", sm: "none" },
          borderColor: "divider",
        }}
      >
        <Button onClick={onClose} disabled={submitting} sx={{ color: "text.secondary" }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={onSubmit}
          disabled={submitting}
          startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
          sx={{
            borderRadius: 2,
            bgcolor: BRAND,
            boxShadow: "none",
            textTransform: "none",
            fontWeight: 700,
            "&:hover": { bgcolor: BRAND_DARK, boxShadow: "none" },
          }}
        >
          Submit POA
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const ApproveAssignmentDialog = ({ open, submitting, onClose, onSubmit }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isDark = theme.palette.mode === "dark";
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open) setNotes("");
  }, [open]);

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
          borderRadius: { xs: 0, sm: 3 },
          m: { xs: 0, sm: 2 },
          width: { xs: "100%", sm: "calc(100% - 32px)" },
          maxWidth: { xs: "none", sm: 600 },
          height: { xs: "100dvh", sm: "auto" },
          maxHeight: { xs: "100dvh", sm: "calc(100% - 64px)" },
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle sx={{ pb: 1.5 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              bgcolor: BRAND_LIGHT,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <CheckCircleIcon sx={{ color: "#10b981", fontSize: 22 }} />
          </Box>
          <Typography fontWeight={800} fontSize="1.05rem">
            Approve Assignment
          </Typography>
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ pt: "16px !important", flex: 1 }}>
        <Alert
          severity="info"
          sx={{
            mb: 2.5,
            borderRadius: 2,
            fontSize: "0.82rem",
            bgcolor: isDark ? "rgba(8, 31, 36, 0.9)" : "#e0f2fe",
            color: isDark ? "#baf0ff" : "#075985",
            "& .MuiAlert-icon": {
              color: isDark ? "#22d3ee" : "#0284c7",
            },
          }}
        >
          This will approve the assignment and notify the assignee.
        </Alert>
        <TextField
          fullWidth
          multiline
          minRows={4}
          label="Approval Notes (Optional)"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Add any notes for the assignee..."
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
            },
            "& .MuiInputLabel-root": {
              bgcolor: "background.paper",
              px: 0.5,
            },
          }}
        />
      </DialogContent>
      <DialogActions
        sx={{
          px: 3,
          pb: { xs: "calc(16px + env(safe-area-inset-bottom))", sm: 2.5 },
          pt: 1,
          borderTop: { xs: "1px solid", sm: "none" },
          borderColor: "divider",
          gap: 1,
        }}
      >
        <Button onClick={onClose} disabled={submitting} sx={{ color: "text.secondary" }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={() => onSubmit(notes)}
          disabled={submitting}
          startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <CheckCircleIcon />}
          sx={{
            borderRadius: 2,
            bgcolor: BRAND,
            boxShadow: "none",
            textTransform: "none",
            fontWeight: 700,
            "&:hover": { bgcolor: BRAND_DARK, boxShadow: "none" },
          }}
        >
          Approve Assignment
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const PageSkeleton = () => (
  <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f0f6f8", minHeight: "100vh" }}>
    <Skeleton width={120} height={20} sx={{ mb: 3 }} />
    <Skeleton width="50%" height={30} sx={{ mb: 1 }} />
    <Skeleton width="70%" height={16} sx={{ mb: 3 }} />
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {[1, 2, 3, 4].map((i) => (
        <Grid item xs={6} sm={6} md={3} key={i}>
          <Skeleton
            variant="rectangular"
            height={100}
            sx={{ borderRadius: 3 }}
          />
        </Grid>
      ))}
    </Grid>
    <Skeleton
      variant="rectangular"
      height={52}
      sx={{ borderRadius: 3, mb: 2 }}
    />
    <Skeleton variant="rectangular" height={380} sx={{ borderRadius: 3 }} />
  </Box>
);

// ── Main Page ─────────────────────────────────────────────────────────────────
const AssignmentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { getAssignmentById, approveAssignment, submitAssignmentPoa } = useAssignment();

  const [tab, setTab] = useState("submissions");
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [approving, setApproving] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [poaDialogOpen, setPoaDialogOpen] = useState(false);
  const [poaFeedback, setPoaFeedback] = useState("");
  const [poaFiles, setPoaFiles] = useState([]);
  const [poaError, setPoaError] = useState("");
  const [poaSubmitting, setPoaSubmitting] = useState(false);
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const loadAssignment = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // getAssignmentById returns { success, data: res }
      // res is the full flat assignment object from the API
      const result = await getAssignmentById(id);
      if (!mounted.current) return;
      if (result.success) {
        // result.data is the full response object, including _id, checklistData, assets, etc.
        setAssignment(result.data);
      } else {
        setError(result.error || "Failed to load assignment");
      }
    } catch (err) {
      if (!mounted.current) return;
      setError(err?.message || "Failed to load assignment");
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [id, getAssignmentById]);

  useEffect(() => {
    loadAssignment();
  }, [loadAssignment]);

  const handleOpenApproveDialog = useCallback(() => {
    setApproveDialogOpen(true);
  }, []);

  const handleCloseApproveDialog = useCallback(() => {
    if (approving) return;
    setApproveDialogOpen(false);
  }, [approving]);

  const handleApproveAssignment = useCallback(async (approvalNotes = "") => {
    if (!assignment?._id || approving) return;
    setApproving(true);
    const result = await approveAssignment(assignment._id, approvalNotes);
    if (result.success) {
      setAssignment((prev) => ({
        ...prev,
        ...(result.data || {}),
        status: result.data?.status || "approved",
      }));
      setApproveDialogOpen(false);
      setToast({ open: true, message: "Assignment approved successfully", severity: "success" });
      loadAssignment();
    } else {
      setToast({ open: true, message: result.error || "Failed to approve assignment", severity: "error" });
    }
    setApproving(false);
  }, [approveAssignment, approving, assignment?._id, loadAssignment]);

  const handleOpenPoaDialog = useCallback(() => {
    setPoaFeedback("");
    setPoaFiles([]);
    setPoaError("");
    setPoaDialogOpen(true);
  }, []);

  const handleClosePoaDialog = useCallback(() => {
    if (poaSubmitting) return;
    setPoaDialogOpen(false);
    setPoaFeedback("");
    setPoaFiles([]);
    setPoaError("");
  }, [poaSubmitting]);

  const handlePoaFilesChange = useCallback((event) => {
    const selectedFiles = Array.from(event.target.files || []);
    setPoaFiles((prev) => [...prev, ...selectedFiles]);
    event.target.value = "";
  }, []);

  const handleRemovePoaFile = useCallback((index) => {
    setPoaFiles((prev) => prev.filter((_, fileIndex) => fileIndex !== index));
  }, []);

  const handleSubmitAdminPoa = useCallback(async () => {
    const feedback = poaFeedback.trim();
    if (!feedback) {
      setPoaError("POA feedback is required");
      return;
    }
    if (!assignment?._id || poaSubmitting) return;

    const formData = new FormData();
    formData.append("feedback", feedback);
    poaFiles.forEach((file) => formData.append("attachments", file));

    setPoaSubmitting(true);
    const result = await submitAssignmentPoa(assignment._id, formData);
    if (result.success) {
      setToast({ open: true, message: "POA submitted successfully", severity: "success" });
      setPoaDialogOpen(false);
      setPoaFeedback("");
      setPoaFiles([]);
      setPoaError("");
      setTab("poa");
      loadAssignment();
    } else {
      setToast({ open: true, message: result.error || "Failed to submit POA", severity: "error" });
    }
    setPoaSubmitting(false);
  }, [
    assignment?._id,
    loadAssignment,
    poaFeedback,
    poaFiles,
    poaSubmitting,
    submitAssignmentPoa,
  ]);

  if (loading) return <PageSkeleton />;

  if (error)
    return (
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Alert
          severity="error"
          sx={{ borderRadius: 3 }}
          action={
            <Button size="small" color="inherit" onClick={loadAssignment}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );

  if (!assignment) return null;


  const members = assignment.assignedToTeamMembers || [];
  const totalMembers = members.length;
  const completedMem = members.filter((m) => m.status === "completed").length;
  const completionRate =
    totalMembers > 0 ? Math.round((completedMem / totalMembers) * 100) : 0;
  const dueDate = assignment.dueDate ? new Date(assignment.dueDate) : null;
  const now = new Date();
  const isOverdue = dueDate && dueDate < now;
  const daysRemaining = dueDate
    ? Math.max(0, Math.ceil((dueDate - now) / 86400000))
    : 0;
  const daysOverdue =
    dueDate && isOverdue ? Math.ceil((now - dueDate) / 86400000) : 0;

  // Checklist name — from checklistData[0].name
  const checklistName = assignment.checklistData?.[0]?.name || "Assignment";
  const hasAssets = (assignment.assets || []).length > 0;
  const hasChecklists = (assignment.checklistData || []).length > 0;
  const poaSubmissions = assignment.poaSubmissions || [];
  const inspectionSubmitted = assignment.totalSubmissions > 0 || completedMem > 0;
  const canAddPoa =
    poaSubmissions.length === 0 &&
    inspectionSubmitted &&
    ["pending_approval", "submitted"].includes((assignment.status || "").toLowerCase());
  const canApproveAssignment =
    (assignment.status || "").toLowerCase() === "pending_approval" &&
    poaSubmissions.length > 0;

  const tabs = [
    {
      key: "submissions",
      label: `Submissions (${assignment.totalSubmissions || 0})`,
    },
    { key: "formStructure", label: "Form Structure", dot: hasChecklists },
    { key: "assets", label: `Assets (${(assignment.assets || []).length})` },
    { key: "assignees", label: `Assignees (${totalMembers})` },
    { key: "poa", label: `POA (${poaSubmissions.length})` },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        p: { xs: 1.5, sm: 2, md: 3 },
      }}
    >
      <Box sx={{ maxWidth: 1300, mx: "auto" }}>
        {/* Back */}
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{
            mb: 2,
            color: "text.secondary",
            textTransform: "none",
            fontWeight: 500,
            fontSize: "0.82rem",
            "&:hover": { color: BRAND },
            px: 0,
          }}
        >
          Back to Assigned Forms
        </Button>

        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            mb: 3,
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.25,
                mb: 0.5,
                flexWrap: "wrap",
              }}
            >
              <Typography
                variant="h5"
                fontWeight={700}
                sx={{
                  color: "text.primary",
                  fontSize: { xs: "1.1rem", md: "1.3rem" },
                }}
              >
                {checklistName}
              </Typography>
              <StatusBadge status={assignment.status} />
              {isOverdue && (
                <Chip
                  label={`${daysOverdue}d overdue`}
                  size="small"
                  sx={{
                    bgcolor: "#fcebeb",
                    color: "#a32d2d",
                    fontWeight: 600,
                    fontSize: "0.68rem",
                    height: 20,
                  }}
                />
              )}
            </Box>

            {assignment.notes && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  maxWidth: 560,
                  fontSize: "0.82rem",
                  lineHeight: 1.6,
                  mb: 0.75,
                }}
              >
                {assignment.notes}
              </Typography>
            )}

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                flexWrap: "wrap",
              }}
            >
              <PriorityBadge priority={assignment.priority} />
              {dueDate && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <CalendarIcon
                    sx={{
                      fontSize: 12,
                      color: isOverdue ? "#e24b4a" : "text.secondary",
                    }}
                  />
                  <Typography
                    variant="caption"
                    fontSize="0.73rem"
                    sx={{ color: isOverdue ? "#e24b4a" : "text.secondary" }}
                  >
                    Due {dueDate.toLocaleDateString()}
                    {isOverdue && " · Overdue"}
                  </Typography>
                </Box>
              )}
              {assignment.customerName && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontSize="0.73rem"
                >
                  Client: <strong>{assignment.customerName}</strong>
                </Typography>
              )}
              {assignment.assignedBy && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontSize="0.73rem"
                  sx={{ display: { xs: "none", sm: "block" } }}
                >
                  By:{" "}
                  <strong>
                    {assignment.assignedBy.customerName ||
                      assignment.assignedBy.email}
                  </strong>
                </Typography>
              )}
            </Box>
          </Box>

          <Box sx={{ display: "flex", gap: 1, flexShrink: 0 }}>
            {canApproveAssignment && (
              <Button
                variant="contained"
                startIcon={<CheckCircleIcon />}
                onClick={handleOpenApproveDialog}
                disabled={approving}
                sx={{
                  borderRadius: 2.5,
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: "0.8rem",
                  bgcolor: "#0f6e56",
                  boxShadow: "none",
                  "&:hover": { bgcolor: "#0b5f4a", boxShadow: "none" },
                }}
              >
                {isMobile ? "" : approving ? "Approving..." : "Approved"}
              </Button>
            )}
            <Button
              variant="outlined"
              startIcon={<BarChartIcon />}
              onClick={() => navigate(`/assignments/${id}/analytics`)}
              sx={{
                borderRadius: 2.5,
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.8rem",
                borderColor: "divider",
                color: "text.primary",
                "&:hover": { borderColor: BRAND, color: BRAND },
              }}
            >
              {isMobile ? "" : "Analytics"}
              {isMobile && <BarChartIcon sx={{ fontSize: 18 }} />}
            </Button>
          </Box>
        </Box>

        {/* KPI cards */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(2, minmax(0, 1fr))",
              md: "repeat(4, minmax(0, 1fr))",
            },
            gap: { xs: 1.5, md: 2 },
            mb: 3,
            width: "100%",
          }}
        >
            <StatCard
              icon={DescriptionIcon}
              iconBg={BRAND_LIGHT}
              value={assignment.totalSubmissions || 0}
              label="Total Submissions"
              sub={`${assignment.approvedSubmissions || 0} approved`}
            />
            <StatCard
              icon={PeopleIcon}
              iconBg="#eeedfe"
              value={totalMembers}
              label="Assignees"
              sub={`${completedMem} completed`}
            />
            <StatCard
              icon={CheckCircleIcon}
              iconBg={BRAND_LIGHT}
              value={`${completionRate}%`}
              label="Completion Rate"
              sub={`${completedMem} of ${totalMembers} done`}
            />
            <StatCard
              icon={ScheduleIcon}
              iconBg={isOverdue ? "#fcebeb" : "#faeeda"}
              value={
                isOverdue
                  ? `${daysOverdue}d`
                  : daysRemaining > 0
                    ? `${daysRemaining}d`
                    : "Today"
              }
              label={isOverdue ? "Days Overdue" : "Days Remaining"}
              sub={dueDate ? dueDate.toLocaleDateString() : "No due date"}
            />
        </Box>

        {/* Overall progress bar */}
        <Card
          sx={{
            borderRadius: 3,
            border: "0.5px solid",
            borderColor: "divider",
            boxShadow: "none",
            p: { xs: 2, md: 2.5 },
            mb: 3,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1.25,
            }}
          >
            <Typography variant="subtitle2" fontWeight={600} fontSize="0.85rem">
              Overall Progress
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              fontSize="0.75rem"
            >
              {completedMem} of {totalMembers} completed
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={completionRate}
            sx={{
              height: 9,
              borderRadius: 5,
              bgcolor: "#e1f5ee",
              "& .MuiLinearProgress-bar": { bgcolor: BRAND, borderRadius: 5 },
            }}
          />
          <Box sx={{ display: "flex", gap: 2.5, mt: 1.25, flexWrap: "wrap" }}>
            <Typography
              variant="caption"
              color="text.secondary"
              fontSize="0.73rem"
            >
              <strong>{assignment.checklistData?.length || 0}</strong> checklist
              {assignment.checklistData?.length !== 1 ? "s" : ""}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              fontSize="0.73rem"
            >
              <strong>{(assignment.assets || []).length}</strong> asset
              {(assignment.assets || []).length !== 1 ? "s" : ""}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              fontSize="0.73rem"
            >
              Created {new Date(assignment.createdAt).toLocaleDateString()}
            </Typography>
            {assignment.customerEmail && (
              <Typography
                variant="caption"
                color="text.secondary"
                fontSize="0.73rem"
                sx={{ display: { xs: "none", sm: "block" } }}
              >
                {assignment.customerEmail}
              </Typography>
            )}
          </Box>
        </Card>

        {/* Tabs */}
        <Card
          sx={{
            borderRadius: 3,
            border: "0.5px solid",
            borderColor: "divider",
            boxShadow: "none",
            mb: 2.5,
            px: 1,
          }}
        >
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              minHeight: 44,
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 600,
                fontSize: { xs: "0.78rem", md: "0.82rem" },
                minHeight: 44,
                color: "text.secondary",
                "&.Mui-selected": { color: BRAND },
                px: { xs: 1.25, md: 2 },
              },
              "& .MuiTabs-indicator": {
                bgcolor: BRAND,
                height: 2.5,
                borderRadius: 2,
              },
            }}
          >
            {tabs.map((t) => (
              <Tab
                key={t.key}
                value={t.key}
                label={
                  <Box
                    sx={{ display: "flex", alignItems: "center", gap: 0.75 }}
                  >
                    {t.label}
                    {t.dot && (
                      <Box
                        sx={{
                          width: 5,
                          height: 5,
                          borderRadius: "50%",
                          bgcolor: BRAND,
                        }}
                      />
                    )}
                  </Box>
                }
              />
            ))}
          </Tabs>
        </Card>

        {/* Tab content */}
        <Fade in key={tab} timeout={200}>
          <Box>
            {tab === "submissions" && (
              <SubmissionsTab
                assignmentId={id}
                onViewSubmission={(sid) =>
                  navigate(`/assignments/submissions/${sid}`)
                }
              />
            )}
            {tab === "formStructure" && (
              <FormStructureTab checklistData={assignment.checklistData} />
            )}
            {tab === "assets" && <AssetsTab assets={assignment.assets} />}
            {tab === "assignees" && (
              <AssigneesTab
                assignedToTeamMembers={assignment.assignedToTeamMembers}
                assignedBy={assignment.assignedBy}
                assignedByRole={assignment.assignedByRole}
              />
            )}
            {tab === "poa" && (
              <POATab
                poaSubmissions={poaSubmissions}
                canAddPoa={canAddPoa}
                inspectionSubmitted={inspectionSubmitted}
                onAddPoa={handleOpenPoaDialog}
              />
            )}
          </Box>
        </Fade>
      </Box>
      <AdminPoaDialog
        open={poaDialogOpen}
        feedback={poaFeedback}
        files={poaFiles}
        error={poaError}
        submitting={poaSubmitting}
        onFeedbackChange={(value) => {
          setPoaFeedback(value);
          if (poaError && value.trim()) setPoaError("");
        }}
        onFilesChange={handlePoaFilesChange}
        onRemoveFile={handleRemovePoaFile}
        onClose={handleClosePoaDialog}
        onSubmit={handleSubmitAdminPoa}
      />
      <ApproveAssignmentDialog
        open={approveDialogOpen}
        submitting={approving}
        onClose={handleCloseApproveDialog}
        onSubmit={handleApproveAssignment}
      />
      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
  anchorOrigin={{ vertical: "top", horizontal: "right" }}>
        <Alert
          severity={toast.severity}
          variant="filled"
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
          sx={{ borderRadius: 2 }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AssignmentDetailPage;

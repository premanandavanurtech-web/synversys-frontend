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
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { useAssignment } from "../context/AssignmentContext";

// ── Brand ─────────────────────────────────────────────────────────────────────
const BRAND = "#0d4f63";
const BRAND_DARK = "#0b4457";
const BRAND_LIGHT = "#e1f5ee";

// ── Status / Priority maps ────────────────────────────────────────────────────
const STATUS_MAP = {
  approved: { label: "Approved", bg: "#eaf3de", color: "#3b6d11" },
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

  return {
    ...sub,
    _id: sub._id || sub.submissionId || sub.id,
    submittedByName,
    submittedByEmail,
    reviewStatus:
      sub.reviewStatus || sub.submissionStatus || sub.status || "pending_review",
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
      STATUS_MAP[sub.reviewStatus]?.label || sub.reviewStatus,
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
      p: { xs: 1.75, md: 2.5 },
      height: "100%",
    }}
  >
    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
      <Box sx={{ p: 1.1, borderRadius: 2.5, bgcolor: iconBg, flexShrink: 0 }}>
        <Icon sx={{ fontSize: 20, color: BRAND }} />
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
            fontSize: { xs: "1.25rem", md: "1.5rem" },
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
            gridTemplateColumns: "2fr 2fr 1.2fr 1.5fr 1fr",
            borderBottom: "0.5px solid",
            borderColor: "divider",
            bgcolor: "grey.50",
          }}
        >
          {["Submitted By", "Date", "Status", "Completion", "Actions"].map(
            (h) => (
              <Typography
                key={h}
                variant="caption"
                sx={{
                  fontWeight: 600,
                  color: "text.secondary",
                  fontSize: "0.66rem",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
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
                    gridTemplateColumns: "2fr 2fr 1.2fr 1.5fr 1fr",
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
                  <StatusBadge status={sub.reviewStatus} />

                  {/* Completion */}
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
                      sx={{ minWidth: 32 }}
                    >
                      {rate}%
                    </Typography>
                  </Box>

                  {/* Actions */}
                  <Box
                    sx={{ display: "flex", alignItems: "center", gap: 0.25 }}
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
                      <StatusBadge status={sub.reviewStatus} />
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
                            bgcolor: "#f0f6f8",
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
                <Box sx={{ p: 0.75, bgcolor: "#faeeda", borderRadius: 1.5 }}>
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
                    asset.assetStatus === "Active" ? "#eaf3de" : "#f1efe8",
                  color: asset.assetStatus === "Active" ? "#3b6d11" : "#5f5e5a",
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
                    <Box sx={{ p: 1.25, bgcolor: "#f0f6f8", borderRadius: 2 }}>
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
                        bgcolor: "#f1efe8",
                        color: "#5f5e5a",
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

// ── Page skeleton ─────────────────────────────────────────────────────────────
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

  const { getAssignmentById } = useAssignment();

  const [tab, setTab] = useState("submissions");
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

  const tabs = [
    {
      key: "submissions",
      label: `Submissions (${assignment.totalSubmissions || 0})`,
    },
    { key: "formStructure", label: "Form Structure", dot: hasChecklists },
    { key: "assets", label: `Assets (${(assignment.assets || []).length})` },
    { key: "assignees", label: `Assignees (${totalMembers})` },
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
        <Grid container spacing={{ xs: 1.5, md: 2 }} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={6} md={3}>
            <StatCard
              icon={DescriptionIcon}
              iconBg={BRAND_LIGHT}
              value={assignment.totalSubmissions || 0}
              label="Total Submissions"
              sub={`${assignment.approvedSubmissions || 0} approved`}
            />
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <StatCard
              icon={PeopleIcon}
              iconBg="#eeedfe"
              value={totalMembers}
              label="Assignees"
              sub={`${completedMem} completed`}
            />
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <StatCard
              icon={CheckCircleIcon}
              iconBg={BRAND_LIGHT}
              value={`${completionRate}%`}
              label="Completion Rate"
              sub={`${completedMem} of ${totalMembers} done`}
            />
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
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
          </Grid>
        </Grid>

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
          </Box>
        </Fade>
      </Box>
    </Box>
  );
};

export default AssignmentDetailPage;

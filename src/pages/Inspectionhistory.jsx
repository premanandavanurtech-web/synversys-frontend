// src/pages/InspectionHistory.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  IconButton,
  Chip,
  Avatar,
  Stack,
  Alert,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useMediaQuery,
  Pagination,
  Skeleton,
  Fade,
  Tooltip,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  Button,
} from "@mui/material";
import { createTheme, ThemeProvider, alpha } from "@mui/material/styles";
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Assignment as AssignmentIcon,
  Clear as ClearIcon,
  Download as DownloadIcon,
  CalendarMonth as CalendarMonthIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useTeamAssignment } from "../context/TeamAssignmentcontext";

const theme = createTheme({
  palette: {
    primary: { main: "#0d3d52" },
    success: { main: "#10b981" },
    warning: { main: "#f59e0b" },
    error: { main: "#ef4444" },
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  components: {
    MuiButton: {
      styleOverrides: { root: { textTransform: "none", fontWeight: 600 } },
    },
  },
});

// ─── Config ──────────────────────────────────────────────────────────────────
const REVIEW_STATUS_CFG = {
  pending_review: { label: "Under Review", color: "#0d3d52", bg: "#e6f3f8" },
  approved: { label: "Approved", color: "#fff", bg: "#0d3d52" },
  rejected: { label: "Rejected", color: "#dc2626", bg: "#fee2e2" },
  needs_revision: { label: "Needs Revision", color: "#fff", bg: "#ef4444" },
};

const ReviewStatusChip = ({ status }) => {
  const cfg =
    REVIEW_STATUS_CFG[status?.toLowerCase()] ||
    REVIEW_STATUS_CFG.pending_review;
  return (
    <Chip
      label={cfg.label}
      size="small"
      sx={{
        bgcolor: cfg.bg,
        color: cfg.color,
        fontWeight: 700,
        fontSize: "0.7rem",
        height: 24,
        borderRadius: "12px",
      }}
    />
  );
};

// ─── Stat Card ───────────────────────────────────────────────────────────────
const StatCard = ({ title, value, color }) => (
  <Paper
    elevation={0}
    sx={{
      p: { xs: 1.5, sm: 2 },
      borderRadius: 1,
      border: "1px solid #e2e8f0",
      height: "100%",
      minHeight: { xs: 86, sm: 98 },
      width: "100%",
    }}
  >
    <Typography
      variant="body2"
      color="text.secondary"
      sx={{ mb: 0.5, fontSize: "0.78rem" }}
    >
      {title}
    </Typography>
    <Typography
      variant="h6"
      fontWeight={700}
      sx={{ color: color || "#0f172a", fontSize: "1.5rem" }}
    >
      {value}
    </Typography>
  </Paper>
);

export default function InspectionHistory() {
  const navigate = useNavigate();
  const { fetchInspectionHistory, exportInspection, loading } =
    useTeamAssignment();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [inspections, setInspections] = useState([]);
  const [summary, setSummary] = useState({
    total: 0,
    pendingReview: 0,
    approved: 0,
    rejected: 0,
    needsRevision: 0,
    avgCompletionRate: 0,
    totalImages: 0,
    totalAttachments: 0,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [snack, setSnack] = useState({
    open: false,
    msg: "",
    severity: "success",
  });

  const toast = useCallback((msg, severity = "success") => {
    setSnack({ open: true, msg, severity });
  }, []);

  const loadInspections = useCallback(
    async (page = 1) => {
      const result = await fetchInspectionHistory(page, 20);
      if (result.success) {
        setInspections(result.inspections);
        setPagination(result.pagination);
        if (result.summary) {
          setSummary(result.summary);
        }
      } else {
        toast(result.error, "error");
      }
    },
    [fetchInspectionHistory, toast],
  );

  useEffect(() => {
    loadInspections();
  }, []);

  const handleViewInspection = (submissionId) => {
    if (
      submissionId &&
      submissionId !== "undefined" &&
      submissionId !== "null"
    ) {
      navigate(`/team/inspection/${submissionId}`);
    } else {
      toast("Invalid inspection ID", "error");
    }
  };

  const handleExport = async (submissionId, format) => {
    if (
      !submissionId ||
      submissionId === "undefined" ||
      submissionId === "null"
    ) {
      toast("Invalid inspection ID", "error");
      return;
    }
    const result = await exportInspection(submissionId, format);
    if (result.success && result.url) {
      window.open(result.url, "_blank");
    } else {
      toast(result.error || "Export failed", "error");
    }
  };

  const filteredInspections = inspections.filter((insp) => {
    const assetName = insp.assignment?.assets?.[0]?.assetName || "";
    const checklistName = insp.checklistSummary?.[0]?.checklistName || "";
    if (
      search &&
      !insp.inspectionId?.toLowerCase().includes(search.toLowerCase()) &&
      !assetName.toLowerCase().includes(search.toLowerCase()) &&
      !checklistName.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    if (statusFilter && insp.reviewStatus !== statusFilter) return false;
    return true;
  });

  // Avg score across rows that have a performanceRating
  const avgScore = (() => {
    const rated = inspections.filter((i) => i.performanceRating != null);
    if (rated.length === 0)
      return summary.avgCompletionRate ? `${summary.avgCompletionRate}%` : "—";
    const total = rated.reduce(
      (sum, i) => sum + (Number(i.performanceRating) / 5) * 100,
      0,
    );
    return `${Math.round(total / rated.length)}%`;
  })();

  if (loading && inspections.length === 0) {
    return (
      <ThemeProvider theme={theme}>
        <Box sx={{ minHeight: "100vh" }}>
          <Container maxWidth="xl" sx={{ py: 3 }}>
            <Skeleton
              variant="rectangular"
              height={120}
              sx={{ borderRadius: 2 }}
            />
            <Skeleton
              variant="rectangular"
              height={400}
              sx={{ mt: 2, borderRadius: 2 }}
            />
          </Container>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ minHeight: "100vh" }}>
        <Container maxWidth="xl" sx={{ py: { xs: 2, md: 3 } }}>
          {/* Header */}
          <Box sx={{ mb: 2.5 }}>
            <Typography
              variant={isMobile ? "h6" : "h5"}
              fontWeight={800}
              color="#0f172a"
              sx={{ fontSize: { xs: "1.15rem", md: "1.35rem" } }}
            >
              Inspection History
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: "0.8rem" }}
            >
              View your submitted inspection forms
            </Typography>
          </Box>

          {/* Search + Filters Bar */}
          <Paper
            elevation={0}
            sx={{
              mb: 2.5,
              p: 1.5,
              borderRadius: 1,
              border: "1px solid #e2e8f0",
            }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.25}
              alignItems={{ sm: "center" }}
            >
              <TextField
                size="small"
                placeholder="Search submissions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{
                  flex: 1,
                  "& .MuiOutlinedInput-root": { fontSize: "0.85rem" },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ fontSize: 18, color: "#94a3b8" }} />
                    </InputAdornment>
                  ),
                  endAdornment: search && (
                    <IconButton size="small" onClick={() => setSearch("")}>
                      <ClearIcon sx={{ fontSize: 15 }} />
                    </IconButton>
                  ),
                }}
              />
              <FormControl
                size="small"
                sx={{ minWidth: 140, width: { xs: "100%", sm: "auto" } }}
              >
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  displayEmpty
                  sx={{ fontSize: "0.85rem" }}
                >
                  <MenuItem value="" sx={{ fontSize: "0.85rem" }}>
                    Status
                  </MenuItem>
                  {Object.entries(REVIEW_STATUS_CFG).map(([k, cfg]) => (
                    <MenuItem key={k} value={k} sx={{ fontSize: "0.85rem" }}>
                      {cfg.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </Paper>

          {/* Stats Summary */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(2, minmax(0, 1fr))",
                md: "repeat(4, minmax(0, 1fr))",
              },
              gap: 1.5,
              mb: 2.5,
            }}
          >
            <Box>
              <StatCard title="Total Submissions" value={summary.total} />
            </Box>
            <Box>
              <StatCard
                title="Approved"
                value={summary.approved}
                color="#10b981"
              />
            </Box>
            <Box>
              <StatCard
                title="Under Review"
                value={summary.pendingReview}
                color="#ef4444"
              />
            </Box>
            <Box>
              <StatCard title="Avg Score" value={avgScore} />
            </Box>
          </Box>

          {/* Inspections Table */}
          {filteredInspections.length === 0 ? (
            <Paper
              elevation={0}
              sx={{
                p: { xs: 4, sm: 8 },
                textAlign: "center",
                borderRadius: 2.5,
                border: "1px solid #e2e8f0",
              }}
            >
              <Fade in>
                <Box>
                  <Avatar
                    sx={{
                      width: 64,
                      height: 64,
                      bgcolor: alpha("#0d3d52", 0.07),
                      mx: "auto",
                      mb: 2,
                    }}
                  >
                    <AssignmentIcon
                      sx={{ fontSize: 32, color: "#0d3d52", opacity: 0.4 }}
                    />
                  </Avatar>
                  <Typography
                    fontWeight={700}
                    color="text.secondary"
                    variant="h6"
                    sx={{ fontSize: "1rem" }}
                  >
                    No inspections found
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.disabled"
                    sx={{ fontSize: "0.8rem" }}
                  >
                    You haven't submitted any inspections yet.
                  </Typography>
                </Box>
              </Fade>
            </Paper>
          ) : isMobile ? (
            <>
              <Stack spacing={1.25}>
                {filteredInspections.map((insp, idx) => {
                  const submissionId = insp._id || insp.submissionId;
                  const inspectionId = insp.inspectionId || "N/A";
                  const formType =
                    insp.checklistSummary?.[0]?.checklistName || "N/A";
                  const reviewStatus = (
                    insp.reviewStatus || "pending_review"
                  ).toLowerCase();
                  const submittedDate = insp.submittedAt
                    ? new Date(insp.submittedAt)
                        .toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                        })
                        .replace(/\//g, "-")
                    : "N/A";
                  const score =
                    insp.performanceRating != null
                      ? `${Math.round((Number(insp.performanceRating) / 5) * 100)}%`
                      : "N/A";

                  return (
                    <Fade in timeout={150 + idx * 30} key={submissionId}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 1.5,
                          borderRadius: 1,
                          border: "1px solid #e2e8f0",
                          bgcolor: "#fff",
                        }}
                      >
                        <Stack spacing={1.25}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "flex-start",
                              justifyContent: "space-between",
                              gap: 1,
                            }}
                          >
                            <Box sx={{ minWidth: 0 }}>
                              <Typography
                                variant="caption"
                                sx={{
                                  color: "#64748b",
                                  display: "block",
                                  fontSize: "0.68rem",
                                  fontWeight: 700,
                                  textTransform: "uppercase",
                                }}
                              >
                                Inspection ID
                              </Typography>
                              <Typography
                                variant="body2"
                                fontWeight={800}
                                sx={{
                                  color: "#0d3d52",
                                  fontSize: "0.82rem",
                                  wordBreak: "break-word",
                                }}
                              >
                                {inspectionId}
                              </Typography>
                            </Box>
                            <ReviewStatusChip status={insp.reviewStatus} />
                          </Box>

                          <Box
                            sx={{
                              display: "grid",
                              gridTemplateColumns: "1fr 1fr",
                              gap: 1.25,
                            }}
                          >
                            {[
                              ["Form Type", formType],
                              ["Submitted Date", submittedDate],
                              ["Score", score],
                            ].map(([label, value]) => (
                              <Box key={label} sx={{ minWidth: 0 }}>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: "#64748b",
                                    display: "block",
                                    fontSize: "0.68rem",
                                    fontWeight: 700,
                                  }}
                                >
                                  {label}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  fontWeight={label === "Score" ? 800 : 600}
                                  sx={{
                                    color:
                                      label === "Score" && score !== "N/A"
                                        ? Number(score.replace("%", "")) >= 80
                                          ? "#10b981"
                                          : "#dc2626"
                                        : "#334155",
                                    fontSize: "0.8rem",
                                    wordBreak: "break-word",
                                  }}
                                >
                                  {value}
                                </Typography>
                              </Box>
                            ))}
                          </Box>

                          {reviewStatus === "needs_revision" ? (
                            <Button
                              size="small"
                              variant="contained"
                              fullWidth
                              onClick={() =>
                                navigate(`/team/task/${insp.assignmentId}`)
                              }
                              sx={{
                                bgcolor: "#ef4444",
                                "&:hover": { bgcolor: "#dc2626" },
                                fontSize: "0.72rem",
                                fontWeight: 700,
                                borderRadius: 1,
                                boxShadow: "none",
                              }}
                            >
                              Start Remaining Task
                            </Button>
                          ) : (
                            <Button
                              size="small"
                              variant="outlined"
                              fullWidth
                              startIcon={
                                <VisibilityIcon sx={{ fontSize: 15 }} />
                              }
                              onClick={() => handleViewInspection(submissionId)}
                              sx={{
                                borderColor: "#e2e8f0",
                                color: "#0f172a",
                                fontSize: "0.75rem",
                                fontWeight: 700,
                                borderRadius: 1,
                              }}
                            >
                              View
                            </Button>
                          )}
                        </Stack>
                      </Paper>
                    </Fade>
                  );
                })}
              </Stack>
              {pagination.totalPages > 1 && (
                <Box
                  sx={{
                    py: 2,
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <Pagination
                    count={pagination.totalPages}
                    page={pagination.page}
                    onChange={(_, p) => loadInspections(p)}
                    color="primary"
                    size="small"
                  />
                </Box>
              )}
            </>
          ) : (
            <Paper
              elevation={0}
              sx={{
                overflow: "hidden",
                borderRadius: 1,
                border: "1px solid #e2e8f0",
              }}
            >
              <TableContainer sx={{ overflowX: "auto" }}>
                <Table sx={{ minWidth: 800 }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#f8fafc" }}>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          fontSize: "0.7rem",
                          textTransform: "uppercase",
                          color: "#475569",
                        }}
                      >
                        InspectionId
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          fontSize: "0.7rem",
                          textTransform: "uppercase",
                          color: "#475569",
                        }}
                      >
                        Form Type
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          fontSize: "0.7rem",
                          textTransform: "uppercase",
                          color: "#475569",
                        }}
                      >
                        Submitted Date
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          fontSize: "0.7rem",
                          textTransform: "uppercase",
                          color: "#475569",
                        }}
                      >
                        Status
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          fontSize: "0.7rem",
                          textTransform: "uppercase",
                          color: "#475569",
                        }}
                      >
                        Score
                      </TableCell>
                      <TableCell
                        align="left"
                        sx={{
                          fontWeight: 700,
                          fontSize: "0.7rem",
                          textTransform: "uppercase",
                          color: "#475569",
                        }}
                      >
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredInspections.map((insp, idx) => {
                      const submissionId = insp._id || insp.submissionId;
                      const assetName = insp.inspectionId
                      const formType =
                        insp.checklistSummary?.[0]?.checklistName || "—";
                      const reviewStatus = (
                        insp.reviewStatus || "pending_review"
                      ).toLowerCase();
                      const score =
                        insp.performanceRating != null
                          ? `${Math.round((Number(insp.performanceRating) / 5) * 100)}%`
                          : "—";
                      const canView = reviewStatus !== "needs_revision";

                      return (
                        <Fade in timeout={150 + idx * 30} key={submissionId}>
                          <TableRow hover>
                            <TableCell>
                              <Typography
                                fontWeight={700}
                                variant="body2"
                                sx={{ fontSize: "0.82rem", color: "#0d3d52" }}
                              >
                                {assetName}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography
                                variant="body2"
                                sx={{ fontSize: "0.82rem", color: "#475569" }}
                              >
                                {formType}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography
                                variant="body2"
                                sx={{ fontSize: "0.82rem", color: "#475569" }}
                              >
                                {insp.submittedAt
                                  ? new Date(insp.submittedAt)
                                      .toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "2-digit",
                                        day: "2-digit",
                                      })
                                      .replace(/\//g, "-")
                                  : "—"}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <ReviewStatusChip status={insp.reviewStatus} />
                            </TableCell>
                            <TableCell>
                              <Typography
                                variant="body2"
                                fontWeight={700}
                                sx={{
                                  fontSize: "0.82rem",
                                  color:
                                    score === "—"
                                      ? "#94a3b8"
                                      : Number(score.replace("%", "")) >= 80
                                        ? "#10b981"
                                        : "#dc2626",
                                }}
                              >
                                {score}
                              </Typography>
                            </TableCell>
                            <TableCell align="left">
                              {reviewStatus === "needs_revision" ? (
                                <Button
                                  size="small"
                                  variant="contained"
                                  onClick={() =>
                                    navigate(`/team/task/${insp.assignmentId}`)
                                  }
                                  sx={{
                                    bgcolor: "#ef4444",
                                    "&:hover": { bgcolor: "#dc2626" },
                                    fontSize: "0.72rem",
                                    fontWeight: 700,
                                    borderRadius: 1.5,
                                    boxShadow: "none",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  Start Remaining Task
                                </Button>
                              ) : (
                                <Stack
                                  direction="row"
                                  spacing={0.5}
                                  alignItems="center"
                                >
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    startIcon={
                                      <VisibilityIcon sx={{ fontSize: 15 }} />
                                    }
                                    onClick={() =>
                                      handleViewInspection(submissionId)
                                    }
                                    sx={{
                                      borderColor: "#e2e8f0",
                                      color: "#0f172a",
                                      fontSize: "0.75rem",
                                      fontWeight: 600,
                                      borderRadius: 1,
                                      px: 1.5,
                                    }}
                                  >
                                    View
                                  </Button>
                                </Stack>
                              )}
                            </TableCell>
                          </TableRow>
                        </Fade>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
              {pagination.totalPages > 1 && (
                <Box
                  sx={{
                    p: 2,
                    display: "flex",
                    justifyContent: "center",
                    borderTop: "1px solid #e2e8f0",
                  }}
                >
                  <Pagination
                    count={pagination.totalPages}
                    page={pagination.page}
                    onChange={(_, p) => loadInspections(p)}
                    color="primary"
                    size="small"
                  />
                </Box>
              )}
            </Paper>
          )}
        </Container>

        <Snackbar
          open={snack.open}
          autoHideDuration={4000}
          onClose={() => setSnack({ ...snack, open: false })}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert
            severity={snack.severity}
            onClose={() => setSnack({ ...snack, open: false })}
            sx={{ borderRadius: 2, fontSize: "0.8rem" }}
          >
            {snack.msg}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}

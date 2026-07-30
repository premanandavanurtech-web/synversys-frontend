// pages/AssignmentAnalyticsPage.jsx
// Fixed: correct API data paths from GET /assignments/:id/analytics
// Token passed via authRequest (from AuthContext) — no manual axios with token
// Brand: #0d4f63 | Fully mobile-responsive | Recharts

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Grid,
  Card,
  Typography,
  Button,
  Chip,
  LinearProgress,
  Skeleton,
  Alert,
  Fade,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Download as DownloadIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  EmojiEvents as EmojiEventsIcon,
  People as PeopleIcon,
  Warning as WarningIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from "@mui/icons-material";
import { alpha } from "@mui/material/styles";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useNavigate, useParams } from "react-router-dom";
import { useAssignment } from "../context/AssignmentContext";

// ── Brand & palette ───────────────────────────────────────────────────────────
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

const STATUS_COLORS = {
  approved: "#1d9e75",
  pending_review: "#ef9f27",
  pendingReview: "#ef9f27",
  rejected: "#e24b4a",
  needs_revision: "#7f77dd",
  needsRevision: "#7f77dd",
  pending: "#ef9f27",
};

const STATUS_BG = {
  approved: "#eaf3de",
  pending_review: "#faeeda",
  pendingReview: "#faeeda",
  rejected: "#fcebeb",
  needs_revision: "#eeedfe",
  needsRevision: "#eeedfe",
  pending: "#faeeda",
};

const STATUS_TEXT = {
  approved: "#3b6d11",
  pending_review: "#854f0b",
  pendingReview: "#854f0b",
  rejected: "#a32d2d",
  needs_revision: "#3c3489",
  needsRevision: "#3c3489",
  pending: "#854f0b",
};

// ── Recharts custom tooltip ───────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <Box
      sx={{
        p: 1.5,
        bgcolor: "#1e293b",
        borderRadius: 2,
        border: "1px solid #334155",
        minWidth: 120,
        maxWidth: 220,
      }}
    >
      {label && (
        <Typography
          variant="caption"
          sx={{
            color: "#94a3b8",
            display: "block",
            mb: 0.5,
            fontSize: "0.72rem",
          }}
        >
          {label}
        </Typography>
      )}
      {payload.map((p, i) => (
        <Box
          key={i}
          sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}
        >
          <Box
            sx={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              bgcolor: p.color || p.fill,
              flexShrink: 0,
            }}
          />
          <Typography
            variant="caption"
            sx={{ color: "#e2e8f0", fontSize: "0.72rem" }}
          >
            {p.name}:{" "}
            <strong style={{ color: "#fff" }}>
              {typeof p.value === "number" ? p.value.toLocaleString() : p.value}
            </strong>
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

// ── KPI stat card ─────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, iconBg, value, label, sub, trend }) => (
  <Fade in timeout={300}>
    <Card
      sx={{
        borderRadius: 3,
        border: "0.5px solid",
        width: "270px",
        borderColor: "divider",
        boxShadow: "none",
        p: { xs: 2, md: 2.5 },
        height: "100%",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 1.5,
        }}
      >
        <Box
          sx={(theme) => ({
            p: 1.25,
            borderRadius: 2,
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
        {trend !== undefined && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            {trend >= 0 ? (
              <TrendingUpIcon sx={{ fontSize: 14, color: "#1d9e75" }} />
            ) : (
              <TrendingDownIcon sx={{ fontSize: 14, color: "#e24b4a" }} />
            )}
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                fontSize: "0.75rem",
                color: trend >= 0 ? "#1d9e75" : "#e24b4a",
              }}
            >
              {Math.abs(trend)}%
            </Typography>
          </Box>
        )}
      </Box>
      <Typography
        variant="caption"
        sx={{
          color: "text.secondary",
          fontWeight: 500,
          fontSize: "0.73rem",
          display: "block",
        }}
      >
        {label}
      </Typography>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          color: "text.primary",
          mt: 0.25,
          mb: 0.5,
          fontSize: { xs: "1.6rem", md: "2rem" },
        }}
      >
        {value}
      </Typography>
      {sub && (
        <Typography
          variant="caption"
          sx={{ color: "text.secondary", fontSize: "0.73rem" }}
        >
          {sub}
        </Typography>
      )}
    </Card>
  </Fade>
);

// ── Chart card wrapper ────────────────────────────────────────────────────────
const ChartCard = ({ title, children, height = 240, badge }) => (
  <Card
    sx={{
      borderRadius: 3,
      border: "0.5px solid",
      borderColor: "divider",
      width: "555px",
      boxShadow: "none",
      p: { xs: 1.5, md: 2.5 },
    }}
  >
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mb: 2,
      }}
    >
      <Typography variant="subtitle2" fontWeight={600} fontSize="0.84rem">
        {title}
      </Typography>
      {badge && (
        <Chip
          label={badge}
          size="small"
          sx={{
            bgcolor: BRAND_LIGHT,
            color: BRAND,
            fontWeight: 600,
            fontSize: "0.68rem",
            height: 22,
            borderRadius: "20px",
          }}
        />
      )}
    </Box>
    <Box sx={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </Box>
  </Card>
);

// ── Pie label renderer ────────────────────────────────────────────────────────
const RADIAN = Math.PI / 180;
const renderPieLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  name,
}) => {
  if (percent < 0.08) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 1.35;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  const color = STATUS_COLORS[name] || "#64748b";
  return (
    <text
      x={x}
      y={y}
      fill={color}
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize={10}
      fontWeight={500}
    >
      {`${name.replace(/_/g, " ")}: ${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

// ── Status chip helper ────────────────────────────────────────────────────────
const StatusChip = ({ status, size = "small" }) => {
  const key = status || "";
  return (
    <Chip
      label={key.replace(/_/g, " ")}
      size={size}
      sx={{
        bgcolor: STATUS_BG[key] || "#f1f5f9",
        color: STATUS_TEXT[key] || "#475569",
        fontWeight: 600,
        fontSize: "0.66rem",
        height: 20,
        textTransform: "capitalize",
      }}
    />
  );
};

// ── Main analytics page ───────────────────────────────────────────────────────
const AssignmentAnalyticsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isMd = useMediaQuery(theme.breakpoints.down("md"));
  const isDark = theme.palette.mode === "dark";
  const nestedSurfaceBg = isDark ? "rgba(15, 28, 46, 0.74)" : "#f0f6f8";
  const rowSurfaceBg = isDark ? "rgba(17, 32, 51, 0.82)" : "#f8fafc";
  const rowAltSurfaceBg = isDark ? "rgba(17, 32, 51, 0.56)" : "grey.50";
  const subtleTrackBg = isDark ? "rgba(148, 163, 184, 0.16)" : "#f1efe8";
  const brandTrackBg = isDark ? "rgba(26, 166, 196, 0.18)" : "#e1f5ee";
  const chartGridStroke = isDark ? "rgba(148, 163, 184, 0.16)" : "#f1f5f9";

  const { getAssignmentAnalytics, getTeamProgress } = useAssignment();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [raw, setRaw] = useState(null); // raw API response from analytics endpoint
  const [derived, setDerived] = useState(null); // shaped for charts/UI
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // ── Fetch analytics + team-progress in parallel ───────────────────────
      // Context methods return { success, ...data } — token handled by authRequest
      const [analyticsResult, progressResult] = await Promise.all([
        getAssignmentAnalytics(id),
        getTeamProgress(id),
      ]);

      if (!mounted.current) return;

      if (!analyticsResult.success) {
        setError(analyticsResult.error || "Failed to load analytics");
        return;
      }

      // ── Correct data paths from actual API response ────────────────────────
      // getAssignmentAnalytics returns:
      //   { success, assignment, analytics, teamProgress, recentSubmissions,
      //     checklistSubmissionStatus, summary }
      //
      // getTeamProgress returns:
      //   { success, assignmentId, assignmentStatus, dueDate, teamProgress, summary }

      const {
        assignment,
        analytics,
        teamProgress: analyticsTeamProgress, // top-level array from analytics endpoint
        recentSubmissions,
        checklistSubmissionStatus,
        summary,
      } = analyticsResult;

      // Team-progress detail comes from the dedicated endpoint
      const teamProgressDetail = progressResult.success
        ? progressResult.teamProgress || []
        : analyticsTeamProgress || []; // fallback to analytics data

      const teamSummary = progressResult.success
        ? progressResult.summary || {}
        : {};

      // analytics.* sub-objects
      const assignmentStatus = analytics?.assignmentStatus || {};
      const teamMetrics = analytics?.teamMetrics || {};
      const submissionMetrics = analytics?.submissionMetrics || {};
      // analytics.checklistMetrics — totalChecklists, totalAssets (not charted directly)

      setRaw({
        assignment,
        analytics,
        recentSubmissions,
        checklistSubmissionStatus,
        summary,
      });

      // ── Status pie data ───────────────────────────────────────────────────
      const statusDist = [
        { name: "approved", value: submissionMetrics.approved || 0 },
        { name: "pending_review", value: submissionMetrics.pendingReview || 0 },
        { name: "rejected", value: submissionMetrics.rejected || 0 },
        { name: "needs_revision", value: submissionMetrics.needsRevision || 0 },
      ].filter((d) => d.value > 0);

      // ── Submission trend (group recentSubmissions by date) ─────────────────
      const trendMap = {};
      (recentSubmissions || []).forEach((s) => {
        const dateKey = new Date(s.submittedAt).toLocaleDateString("en-IN", {
          month: "short",
          day: "numeric",
        });
        trendMap[dateKey] = (trendMap[dateKey] || 0) + 1;
      });
      const trendData = Object.entries(trendMap)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      // ── Checklist status bar ───────────────────────────────────────────────
      // From checklistSubmissionStatus array
      const checklistBar = (checklistSubmissionStatus || []).map((cl) => ({
        name: cl.name.length > 18 ? cl.name.slice(0, 16) + "…" : cl.name,
        fullName: cl.name,
        approved: cl.approved || 0,
        pending: cl.pending || 0,
        rejected: cl.rejected || 0,
        avgRate: Math.round(cl.avgCompletionRate || 0),
      }));

      // ── Member completion bar ──────────────────────────────────────────────
      // From analyticsTeamProgress (top-level in analytics response)
      // Shape: { name, email, status, submissions, latestSubmission, progress }
      const memberProgress = (analyticsTeamProgress || []).map((m) => ({
        name: (m.name || m.email || "—").split("@")[0],
        email: m.email || "",
        status: m.status || "",
        completed: m.submissions?.approved || 0,
        pending: m.submissions?.pending || 0,
        score: m.latestSubmission?.completionRate || 0,
        latestStatus: m.latestSubmission?.reviewStatus || "",
      }));

      setDerived({
        assignment,
        assignmentStatus,
        teamMetrics,
        submissionMetrics,
        summary,
        statusDist,
        trendData,
        checklistBar,
        memberProgress,
        teamProgressDetail, // from dedicated team-progress endpoint
        teamSummary,
      });
    } catch (err) {
      if (!mounted.current) return;
      setError(err?.message || "Failed to load analytics");
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [id, getAssignmentAnalytics, getTeamProgress]);

  useEffect(() => {
    load();
  }, [load]);

  // ── KPI cards ──────────────────────────────────────────────────────────────
  const kpis = derived
    ? [
        {
          icon: PeopleIcon,
          iconBg: BRAND_LIGHT,
          label: "Total Submissions",
          value:
            derived.submissionMetrics.total ??
            derived.summary?.totalSubmissions ??
            0,
          sub: `${derived.submissionMetrics.approved || 0} approved`,
        },
        {
          icon: CheckCircleIcon,
          iconBg: BRAND_LIGHT,
          label: "Team Completion Rate",
          value: `${derived.teamMetrics.completionRate ?? 0}%`,
          sub: `${derived.teamMetrics.completed || 0} of ${derived.teamMetrics.total || 0} members done`,
        },
        {
          icon: ScheduleIcon,
          iconBg: derived.assignmentStatus.isOverdue ? "#fcebeb" : "#faeeda",
          label: derived.assignmentStatus.isOverdue
            ? "Days Overdue"
            : "Days Remaining",
          value: derived.assignmentStatus.isOverdue
            ? (derived.assignmentStatus.daysOverdue ?? 0)
            : (derived.assignmentStatus.daysRemaining ?? 0),
          sub: derived.assignment?.dueDate
            ? `Due ${new Date(derived.assignment.dueDate).toLocaleDateString()}`
            : "",
        },
        {
          icon: EmojiEventsIcon,
          iconBg: "#eeedfe",
          label: "Avg Completion Rate",
          value: `${Math.round(derived.submissionMetrics.avgCompletionRate || 0)}%`,
          sub: `${derived.submissionMetrics.pendingReview || 0} pending review`,
        },
      ]
    : [];

  // ── Assignment display name ────────────────────────────────────────────────
  const assignmentTitle = derived?.assignment?.customerName
    ? `${raw?.recentSubmissions?.[0]?.checklistResponses?.[0]?.checklistName || "Analytics"} — ${derived.assignment.customerName}`
    : "Assignment Analytics";

  const chartHeight = isMobile ? 200 : 240;

  return (
    <Box sx={{ minHeight: "100vh", p: { xs: 1.5, sm: 2, md: 3 } }}>
      <Box sx={{ maxWidth: 1300, mx: "auto" }}>
        {/* Back button */}
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
          Back
        </Button>

        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: { xs: "flex-start", sm: "flex-start" },
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
                gap: 1.5,
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
                Form Analytics
              </Typography>
              {derived?.assignmentStatus?.isOverdue && (
                <Chip
                  icon={<WarningIcon sx={{ fontSize: "0.85rem !important" }} />}
                  label={`${derived.assignmentStatus.daysOverdue}d overdue`}
                  size="small"
                  sx={{
                    bgcolor: "#fcebeb",
                    color: "#a32d2d",
                    fontWeight: 600,
                    fontSize: "0.68rem",
                    height: 22,
                  }}
                />
              )}
            </Box>

            <Typography
              variant="body2"
              color="text.secondary"
              fontSize="0.82rem"
              sx={{
                mt: 0.25,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {loading ? "Loading…" : assignmentTitle}
            </Typography>

            {derived?.assignment && (
              <Box
                sx={{
                  display: "flex",
                  gap: { xs: 1.5, sm: 2.5 },
                  mt: 0.75,
                  flexWrap: "wrap",
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontSize="0.73rem"
                >
                  Priority:{" "}
                  <strong style={{ textTransform: "capitalize" }}>
                    {derived.assignment.priority || "—"}
                  </strong>
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontSize="0.73rem"
                >
                  Status:{" "}
                  <strong style={{ textTransform: "capitalize" }}>
                    {derived.assignment.status || "—"}
                  </strong>
                </Typography>
                {derived.assignment.customerEmail && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontSize="0.73rem"
                    sx={{ display: { xs: "none", sm: "block" } }}
                  >
                    {derived.assignment.customerEmail}
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        </Box>

        {/* Error */}
        {error && (
          <Alert
            severity="error"
            sx={{ borderRadius: 3, mb: 3 }}
            action={
              <Button size="small" color="inherit" onClick={load}>
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {/* KPI cards */}
        <Grid container spacing={{ xs: 1.5, md: 2 }} sx={{ mb: 3 }}>
          {loading
            ? [1, 2, 3, 4].map((i) => (
                <Grid item xs={6} sm={6} md={3} key={i}>
                  <Skeleton
                    variant="rectangular"
                    height={130}
                    sx={{ borderRadius: 3 }}
                  />
                </Grid>
              ))
            : kpis.map((k, i) => (
                <Grid item xs={6} sm={6} md={3} key={i}>
                  <StatCard {...k} />
                </Grid>
              ))}
        </Grid>

        {/* Row 1: Submission trend + Status pie */}
        <Grid container spacing={{ xs: 1.5, md: 2 }} sx={{ mb: 2 }}>
          <Grid item xs={12} md={6}>
            {loading ? (
              <Skeleton
                variant="rectangular"
                height={chartHeight + 70}
                sx={{ borderRadius: 3 }}
              />
            ) : (
              <ChartCard
                title="Submission Trend"
                badge="By Date"
                height={chartHeight}
              >
                <LineChart data={derived?.trendData || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartGridStroke} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 9, fill: "#94a3b8" }}
                  />
                  <YAxis
                    tick={{ fontSize: 9, fill: "#94a3b8" }}
                    allowDecimals={false}
                  />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="count"
                    name="Submissions"
                    stroke={BRAND}
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: BRAND, strokeWidth: 0 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ChartCard>
            )}
          </Grid>

          <Grid item xs={12} md={6}>
            {loading ? (
              <Skeleton
                variant="rectangular"
                height={chartHeight + 70}
                sx={{ borderRadius: 3 }}
              />
            ) : (
              <ChartCard
                title="Status Distribution"
                badge={`${derived?.submissionMetrics?.total || 0} Total`}
                height={chartHeight}
              >
                <PieChart>
                  <Pie
                    data={derived?.statusDist || []}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={isMobile ? 70 : 80}
                    labelLine={false}
                    label={isMobile ? false : renderPieLabel}
                  >
                    {(derived?.statusDist || []).map((entry, i) => (
                      <Cell
                        key={i}
                        fill={STATUS_COLORS[entry.name] || "#64748b"}
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip />} />
                  {isMobile && (
                    <Legend
                      formatter={(value) => (
                        <span style={{ fontSize: 10, color: "#64748b" }}>
                          {value.replace(/_/g, " ")}
                        </span>
                      )}
                    />
                  )}
                </PieChart>
              </ChartCard>
            )}
          </Grid>
        </Grid>

        {/* Row 2: Checklist status + Member completion */}
        <Grid container spacing={{ xs: 1.5, md: 2 }} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            {loading ? (
              <Skeleton
                variant="rectangular"
                height={chartHeight + 70}
                sx={{ borderRadius: 3 }}
              />
            ) : (
              <ChartCard
                title="Checklist Submission Status"
                badge="Per Checklist"
                height={chartHeight}
              >
                <BarChart data={derived?.checklistBar || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartGridStroke} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 9, fill: "#94a3b8" }}
                  />
                  <YAxis
                    tick={{ fontSize: 9, fill: "#94a3b8" }}
                    allowDecimals={false}
                  />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Bar
                    dataKey="approved"
                    name="Approved"
                    fill="#1d9e75"
                    radius={[3, 3, 0, 0]}
                  />
                  <Bar
                    dataKey="pending"
                    name="Pending"
                    fill="#ef9f27"
                    radius={[3, 3, 0, 0]}
                  />
                  <Bar
                    dataKey="rejected"
                    name="Rejected"
                    fill="#e24b4a"
                    radius={[3, 3, 0, 0]}
                  />
                </BarChart>
              </ChartCard>
            )}
          </Grid>

          <Grid item xs={12} md={6}>
            {loading ? (
              <Skeleton
                variant="rectangular"
                height={chartHeight + 70}
                sx={{ borderRadius: 3 }}
              />
            ) : (
              <ChartCard
                title="Member Completion Rate"
                badge="By Member"
                height={chartHeight}
              >
                {(derived?.memberProgress || []).length === 0 ? (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "100%",
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      fontSize="0.82rem"
                    >
                      No member data available
                    </Typography>
                  </Box>
                ) : (
                  <BarChart
                    layout="vertical"
                    data={derived?.memberProgress || []}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={chartGridStroke}
                      horizontal={false}
                    />
                    <XAxis
                      type="number"
                      domain={[0, 100]}
                      tick={{ fontSize: 9, fill: "#94a3b8" }}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={isMobile ? 60 : 80}
                      tick={{ fontSize: 9, fill: "#64748b" }}
                    />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="score"
                      name="Completion %"
                      fill={BRAND}
                      radius={[0, 3, 3, 0]}
                    />
                  </BarChart>
                )}
              </ChartCard>
            )}
          </Grid>
        </Grid>

        {/* Detailed Statistics */}
        <Card
          sx={{
            borderRadius: 3,
            border: "0.5px solid",
            borderColor: "divider",
            boxShadow: "none",
            p: { xs: 1.5, md: 2.5 },
            mb: 3,
          }}
        >
          <Typography
            variant="subtitle2"
            fontWeight={600}
            fontSize="0.85rem"
            sx={{ mb: 2 }}
          >
            Detailed Statistics
          </Typography>
          <Grid container spacing={{ xs: 1.5, md: 2 }}>
            {/* Submission Quality */}
            <Grid item xs={12} sm={6} md={4}>
              {loading ? (
                <Skeleton
                  variant="rectangular"
                  height={140}
                  sx={{ borderRadius: 3 }}
                />
              ) : (
                <Card
                  sx={{
                    borderRadius: 3,
                    border: "0.5px solid",
                    borderColor: "divider",
                    width: "350px",
                    boxShadow: "none",
                    p: 2,
                    bgcolor: nestedSurfaceBg,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1.5,
                    }}
                  >
                    <CheckCircleIcon sx={{ fontSize: 16, color: BRAND }} />
                    <Typography
                      variant="subtitle2"
                      fontWeight={600}
                      fontSize="0.8rem"
                    >
                      Submission Quality
                    </Typography>
                  </Box>
                  {[
                    {
                      label: "Avg Completion Rate",
                      value: `${Math.round(derived?.submissionMetrics?.avgCompletionRate || 0)}%`,
                      progress: Math.round(
                        derived?.submissionMetrics?.avgCompletionRate || 0,
                      ),
                      color: BRAND,
                    },
                    {
                      label: "Approved",
                      value: `${derived?.submissionMetrics?.approved || 0} of ${derived?.submissionMetrics?.total || 0}`,
                      progress: derived?.submissionMetrics?.total
                        ? Math.round(
                            ((derived.submissionMetrics.approved || 0) /
                              derived.submissionMetrics.total) *
                              100,
                          )
                        : 0,
                      color: "#1d9e75",
                    },
                  ].map((row, i) => (
                    <Box key={i}>
                      <Box
                        sx={{
                          display: "flex",
                                    width:"350px",
                          justifyContent: "space-between",
                          alignItems: "center",
                          py: 0.5,
                        }}
                      >
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          fontSize="0.75rem"
                        >
                          {row.label}
                        </Typography>
                        <Typography
                          variant="caption"
                          fontWeight={600}
                          fontSize="0.75rem"
                        >
                          {row.value}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(row.progress, 100)}
                        sx={{
                          height: 5,
                          borderRadius: 3,
                          bgcolor: `${row.color}25`,
                          mb: 0.5,
                          "& .MuiLinearProgress-bar": {
                            bgcolor: row.color,
                            borderRadius: 3,
                          },
                        }}
                      />
                    </Box>
                  ))}
                </Card>
              )}
            </Grid>

            {/* Team Progress */}
            <Grid item xs={12} sm={6} md={4}>
              {loading ? (
                <Skeleton
                  variant="rectangular"
                  height={140}
                  sx={{ borderRadius: 3 }}
                />
              ) : (
                <Card
                  sx={{
                    borderRadius: 3,
                    border: "0.5px solid",
                    borderColor: "divider",
                    boxShadow: "none",
                              width:"350px",
                    p: 2,
                    bgcolor: nestedSurfaceBg,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1.5,
                    }}
                  >
                    <PeopleIcon sx={{ fontSize: 16, color: BRAND }} />
                    <Typography
                      variant="subtitle2"
                      fontWeight={600}
                      fontSize="0.8rem"
                    >
                      Team Progress
                    </Typography>
                  </Box>
                  {[
                    {
                      label: "Members Completed",
                      value: `${derived?.teamMetrics?.completed || 0} / ${derived?.teamMetrics?.total || 0}`,
                      progress: derived?.teamMetrics?.completionRate || 0,
                      color: BRAND,
                    },
                    {
                      label: "In Progress",
                      value: `${derived?.teamSummary?.inProgress ?? derived?.teamMetrics?.inProgress ?? 0}`,
                      progress: derived?.teamMetrics?.total
                        ? Math.round(
                            ((derived?.teamMetrics?.inProgress || 0) /
                              derived.teamMetrics.total) *
                              100,
                          )
                        : 0,
                      color: "#185fa5",
                    },
                  ].map((row, i) => (
                    <Box key={i}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          py: 0.5,
                        }}
                      >
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          fontSize="0.75rem"
                        >
                          {row.label}
                        </Typography>
                        <Typography
                          variant="caption"
                          fontWeight={600}
                          fontSize="0.75rem"
                        >
                          {row.value}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(row.progress, 100)}
                        sx={{
                          height: 5,
                          borderRadius: 3,
                          bgcolor: `${row.color}25`,
                          mb: 0.5,
                          "& .MuiLinearProgress-bar": {
                            bgcolor: row.color,
                            borderRadius: 3,
                          },
                        }}
                      />
                    </Box>
                  ))}
                </Card>
              )}
            </Grid>

            {/* Summary */}
            <Grid item xs={12} sm={12} md={4}>
              {loading ? (
                <Skeleton
                  variant="rectangular"
                  height={140}
                  sx={{ borderRadius: 3 }}
                />
              ) : (
                <Card
                  sx={{
                    borderRadius: 3,
                    border: "0.5px solid",
                    borderColor: "divider",
                              width:"350px",
                    boxShadow: "none",
                    p: 2,
                    bgcolor: nestedSurfaceBg,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1.5,
                    }}
                  >
                    <AssignmentIcon sx={{ fontSize: 16, color: BRAND }} />
                    <Typography
                      variant="subtitle2"
                      fontWeight={600}
                      fontSize="0.8rem"
                    >
                      Summary
                    </Typography>
                  </Box>
                  {[
                    {
                      label: "Total Checklists",
                      value: derived?.summary?.totalChecklists || 0,
                    },
                    {
                      label: "Total Assets",
                      value: derived?.summary?.totalAssets || 0,
                    },
                    {
                      label: "Total Team Members",
                      value: derived?.summary?.totalTeamMembers || 0,
                    },
                    {
                      label: "Pending Review",
                      value: derived?.summary?.pendingReview || 0,
                    },
                    {
                      label: "Rejected",
                      value: derived?.summary?.rejected || 0,
                    },
                  ].map((row, i) => (
                    <Box
                      key={i}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        py: 0.4,
                        borderBottom: i < 4 ? "0.5px solid" : "none",
                        borderColor: "divider",
                      }}
                    >
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        fontSize="0.75rem"
                      >
                        {row.label}
                      </Typography>
                      <Typography
                        variant="caption"
                        fontWeight={600}
                        fontSize="0.75rem"
                      >
                        {row.value}
                      </Typography>
                    </Box>
                  ))}
                </Card>
              )}
            </Grid>
          </Grid>
        </Card>

        {/* Team member detail table */}
        <Card
          sx={{
            borderRadius: 3,
            border: "0.5px solid",
            borderColor: "divider",
            boxShadow: "none",
            p: { xs: 1.5, md: 2.5 },
            mb: 3,
          }}
        >
          <Typography
            variant="subtitle2"
            fontWeight={600}
            fontSize="0.85rem"
            sx={{ mb: 2 }}
          >
            Team Member Progress
          </Typography>

          {loading ? (
            <Skeleton
              variant="rectangular"
              height={200}
              sx={{ borderRadius: 2 }}
            />
          ) : (derived?.teamProgressDetail || []).length === 0 ? (
            <Typography
              variant="body2"
              color="text.secondary"
              fontSize="0.82rem"
            >
              No team members assigned
            </Typography>
          ) : (
            <Box sx={{ overflowX: "auto" }}>
              {/* Table header — hide on mobile, show on sm+ */}
              <Box
                sx={{
                  display: { xs: "none", sm: "grid" },
                  gridTemplateColumns: "2fr 1.2fr 1fr 1.4fr 1fr",
                  px: 1.5,
                  py: 1,
                  bgcolor: rowSurfaceBg,
                  borderRadius: 1.5,
                  mb: 0.5,
                  minWidth: 480,
                }}
              >
                {[
                  "Member",
                  "Status",
                  "Submissions",
                  "Latest Review",
                  "Completion",
                ].map((h) => (
                  <Typography
                    key={h}
                    variant="caption"
                    sx={{
                      fontWeight: 600,
                      color: "text.secondary",
                      fontSize: "0.66rem",
                      textTransform: "uppercase",
                      letterSpacing: 0.4,
                    }}
                  >
                    {h}
                  </Typography>
                ))}
              </Box>

              {derived.teamProgressDetail.map((m, i) => {
                // teamProgressDetail from GET /assignments/:id/team-progress
                // Shape: { member: {name, email}, status, submissionStats, latestSubmission, ... }
                const memberName = m.member?.name || m.member?.email || "—";
                const memberEmail = m.member?.email || "";
                const initials = memberName.charAt(0).toUpperCase();
                const latestRate = m.latestSubmission?.completionRate || 0;
                const rateColor =
                  latestRate >= 80
                    ? "#1d9e75"
                    : latestRate >= 50
                      ? "#ef9f27"
                      : "#e24b4a";

                return (
                  <Box key={i}>
                    {/* Desktop row */}
                    <Box
                      sx={{
                        display: { xs: "none", sm: "grid" },
                        gridTemplateColumns: "2fr 1.2fr 1fr 1.4fr 1fr",
                        alignItems: "center",
                        px: 1.5,
                        py: 1.5,
                        minWidth: 480,
                      }}
                    >
                      {/* Member */}
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                      >
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            bgcolor: BRAND,
                            color: "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.8rem",
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          {initials}
                        </Box>
                        <Box sx={{ overflow: "hidden" }}>
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            fontSize="0.8rem"
                            noWrap
                          >
                            {memberName !== memberEmail && m.member?.name
                              ? m.member.name
                              : memberEmail.split("@")[0] || "—"}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            fontSize="0.68rem"
                            noWrap
                          >
                            {memberEmail}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Status */}
                      <Box>
                        <StatusChip status={m.status} />
                      </Box>

                      {/* Submission counts */}
                      <Box>
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          fontSize="0.8rem"
                        >
                          {m.submissionStats?.total || 0}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          fontSize="0.68rem"
                        >
                          {m.submissionStats?.approved || 0} approved
                        </Typography>
                      </Box>

                      {/* Latest review status */}
                      <Box>
                        {m.latestSubmission ? (
                          <>
                            <StatusChip
                              status={m.latestSubmission.reviewStatus}
                            />
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              fontSize="0.66rem"
                              display="block"
                              sx={{ mt: 0.25 }}
                            >
                              {new Date(
                                m.latestSubmission.submittedAt,
                              ).toLocaleDateString()}
                            </Typography>
                          </>
                        ) : (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            fontSize="0.78rem"
                          >
                            —
                          </Typography>
                        )}
                      </Box>

                      {/* Completion bar */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.75,
                        }}
                      >
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(latestRate, 100)}
                          sx={{
                            flex: 1,
                            height: 5,
                            borderRadius: 3,
                            bgcolor: subtleTrackBg,
                            "& .MuiLinearProgress-bar": {
                              bgcolor: rateColor,
                              borderRadius: 3,
                            },
                          }}
                        />
                        <Typography
                          variant="caption"
                          fontSize="0.68rem"
                          color="text.secondary"
                          sx={{ minWidth: 28 }}
                        >
                          {latestRate}%
                        </Typography>
                      </Box>
                    </Box>

                    {/* Mobile card layout */}
                    <Box
                      sx={{
                        display: { xs: "flex", sm: "none" },
                        flexDirection: "column",
                        gap: 1,
                        p: 1.5,
                        bgcolor: i % 2 === 0 ? "transparent" : rowAltSurfaceBg,
                        borderRadius: 2,
                        mb: 1,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                          justifyContent: "space-between",
                        }}
                      >
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Box
                            sx={{
                              width: 30,
                              height: 30,
                              borderRadius: "50%",
                              bgcolor: BRAND,
                              color: "#fff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "0.75rem",
                              fontWeight: 700,
                              flexShrink: 0,
                            }}
                          >
                            {initials}
                          </Box>
                          <Box>
                            <Typography
                              variant="body2"
                              fontWeight={600}
                              fontSize="0.78rem"
                            >
                              {memberEmail.split("@")[0] || "—"}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              fontSize="0.66rem"
                            >
                              {memberEmail}
                            </Typography>
                          </Box>
                        </Box>
                        <StatusChip status={m.status} />
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          fontSize="0.73rem"
                        >
                          Submissions:{" "}
                          <strong>{m.submissionStats?.total || 0}</strong> (
                          {m.submissionStats?.approved || 0} approved)
                        </Typography>
                        {m.latestSubmission && (
                          <StatusChip
                            status={m.latestSubmission.reviewStatus}
                          />
                        )}
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.75,
                        }}
                      >
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(latestRate, 100)}
                          sx={{
                            flex: 1,
                            height: 5,
                            borderRadius: 3,
                            bgcolor: subtleTrackBg,
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
                          {latestRate}%
                        </Typography>
                      </Box>
                    </Box>

                    {i < derived.teamProgressDetail.length - 1 && (
                      <Box
                        sx={{
                          borderBottom: "0.5px solid",
                          borderColor: "divider",
                          display: { xs: "none", sm: "block" },
                        }}
                      />
                    )}
                  </Box>
                );
              })}
            </Box>
          )}
        </Card>

        {/* Checklist Breakdown */}
        {!loading && (raw?.checklistSubmissionStatus || []).length > 0 && (
          <Card
            sx={{
              borderRadius: 3,
              border: "0.5px solid",
              borderColor: "divider",
              boxShadow: "none",
              p: { xs: 1.5, md: 2.5 },
              mb: 3,
            }}
          >
            <Typography
              variant="subtitle2"
              fontWeight={600}
              fontSize="0.85rem"
              sx={{ mb: 2 }}
            >
              Checklist Breakdown
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {raw.checklistSubmissionStatus.map((cl, i) => (
                <Box
                  key={i}
                  sx={{
                    p: { xs: 1.25, md: 2 },
                    bgcolor: rowSurfaceBg,
                    borderRadius: 2,
                    border: "0.5px solid",
                    borderColor: "divider",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: { xs: "flex-start", sm: "flex-start" },
                      mb: 1,
                      gap: 1,
                    }}
                  >
                    <Box>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        fontSize="0.82rem"
                      >
                        {cl.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        fontSize="0.72rem"
                      >
                        {cl.totalFields} fields · {cl.totalSubmissions}{" "}
                        submission{cl.totalSubmissions !== 1 ? "s" : ""}
                      </Typography>
                    </Box>
                    <Typography
                      variant="caption"
                      fontWeight={700}
                      fontSize="0.85rem"
                      sx={{ color: BRAND, flexShrink: 0 }}
                    >
                      {Math.round(cl.avgCompletionRate || 0)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(Math.round(cl.avgCompletionRate || 0), 100)}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      bgcolor: brandTrackBg,
                      "& .MuiLinearProgress-bar": {
                        bgcolor: BRAND,
                        borderRadius: 3,
                      },
                    }}
                  />
                  <Box
                    sx={{
                      display: "flex",
                      gap: { xs: 1, sm: 2 },
                      mt: 1,
                      flexWrap: "wrap",
                    }}
                  >
                    {[
                      {
                        label: "Approved",
                        value: cl.approved || 0,
                        color: "#1d9e75",
                      },
                      {
                        label: "Pending",
                        value: cl.pending || 0,
                        color: "#ef9f27",
                      },
                      {
                        label: "Rejected",
                        value: cl.rejected || 0,
                        color: "#e24b4a",
                      },
                    ].map((s) => (
                      <Typography
                        key={s.label}
                        variant="caption"
                        fontSize="0.72rem"
                        sx={{ color: s.color, fontWeight: 600 }}
                      >
                        {s.label}: {s.value}
                      </Typography>
                    ))}
                  </Box>
                </Box>
              ))}
            </Box>
          </Card>
        )}
      </Box>
    </Box>
  );
};

export default AssignmentAnalyticsPage;

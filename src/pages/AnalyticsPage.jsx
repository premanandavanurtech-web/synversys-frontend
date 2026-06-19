// pages/AnalyticsPage.jsx
import React, { useState, useMemo } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Tabs,
  Tab,
  LinearProgress,
  Alert,
  MenuItem,
  Select,
  FormControl,
  TextField,
  Skeleton,
  CircularProgress,
  Fade,
  Grow,
  Divider,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  FilterList as FilterListIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Assessment as AssessmentIcon,
  Inventory as InventoryIcon,
  Checklist as ChecklistIcon,
  Assignment as AssignmentIcon,
  Description as DescriptionIcon,
  People as PeopleIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  DonutLarge as DonutLargeIcon,
  Timeline as TimelineIcon,
  Star as StarIcon,
  Schedule as ScheduleIcon,
  WarningAmber as WarningAmberIcon,
  CheckCircle as CheckCircleIcon,
  HourglassEmpty as HourglassEmptyIcon,
  AttachMoney as AttachMoneyIcon,
  Speed as SpeedIcon,
  EmojiEvents as EmojiEventsIcon,
  LocationOn as LocationOnIcon,
  Business as BusinessIcon,
  GroupWork as GroupWorkIcon,
} from "@mui/icons-material";
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
  AreaChart,
  Area,
  ComposedChart,
} from "recharts";
import { useAnalytics } from "../context/AnalyticsContext";
import { useAuth } from "../context/AuthContexts";

// ===================== BRAND TOKENS =====================
const BRAND = "#0d4f63";
const BRAND_LIGHT = "#e1f5ee";
const BRAND_DARK = "#0b4457";

const PALETTE = [
  "#0d4f63",
  "#7f77dd",
  "#1d9e75",
  "#ef9f27",
  "#378add",
  "#d85a30",
  "#3b6d11",
  "#d4537e",
  "#854f0b",
  "#e24b4a",
];

const STATUS_COLORS = {
  Active: "#1d9e75",
  active: "#1d9e75",
  submitted: "#0d4f63",
  Submitted: "#0d4f63",
  pending: "#ef9f27",
  Pending: "#ef9f27",
  approved: "#1d9e75",
  Approved: "#1d9e75",
  rejected: "#e24b4a",
  Rejected: "#e24b4a",
  inactive: "#888780",
  Inactive: "#888780",
  published: "#7f77dd",
  "In Maintenance": "#d85a30",
  Normal: "#1d9e75",
  pending_review: "#ef9f27",
  completed: "#1d9e75",
  high: "#e24b4a",
  medium: "#ef9f27",
  low: "#1d9e75",
  Good: "#1d9e75",
  Fair: "#ef9f27",
  Poor: "#e24b4a",
};

const STATUS_BG = {
  Active: "#eaf3de",
  active: "#eaf3de",
  submitted: "#e1f5ee",
  Submitted: "#e1f5ee",
  pending: "#faeeda",
  Pending: "#faeeda",
  approved: "#eaf3de",
  Approved: "#eaf3de",
  rejected: "#fcebeb",
  Rejected: "#fcebeb",
  inactive: "#f1efe8",
  Inactive: "#f1efe8",
  published: "#eeedfe",
  "In Maintenance": "#faece7",
  Normal: "#eaf3de",
  pending_review: "#faeeda",
  completed: "#eaf3de",
  high: "#fcebeb",
  medium: "#faeeda",
  low: "#eaf3de",
  Good: "#eaf3de",
  Fair: "#faeeda",
  Poor: "#fcebeb",
};

const getStatusColor = (s) => STATUS_COLORS[s] || "#888780";
const getStatusBg = (s) => STATUS_BG[s] || "#f1efe8";

// ===================== CUSTOM TOOLTIP =====================
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <Box
      sx={{
        p: 1.5,
        bgcolor: "#1e293b",
        border: "1px solid #334155",
        borderRadius: 2,
        boxShadow: "0 4px 16px rgba(0,0,0,.25)",
      }}
    >
      {label && (
        <Typography
          variant="caption"
          sx={{ color: "#94a3b8", display: "block", mb: 0.5 }}
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
              width: 8,
              height: 8,
              borderRadius: "50%",
              bgcolor: p.color || p.fill,
              flexShrink: 0,
            }}
          />
          <Typography variant="body2" sx={{ color: "#e2e8f0" }}>
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

// ===================== STATUS CHIP =====================
const StatusChip = ({ label }) => (
  <Chip
    label={label}
    size="small"
    sx={{
      bgcolor: getStatusBg(label),
      color: getStatusColor(label),
      fontWeight: 600,
      fontSize: "0.68rem",
      height: 22,
      borderRadius: "20px",
      "& .MuiChip-label": { px: 1.2 },
    }}
  />
);

// ===================== STAT CARD =====================
const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  badge,
  badgeColor,
  isLoading,
  trend,
}) => {
  if (isLoading) {
    return (
      <Card
        sx={{
          borderRadius: 3,
          border: "0.5px solid",
          borderColor: "divider",
          boxShadow: "none",
        }}
      >
        <CardContent>
          <Skeleton width="60%" height={14} sx={{ mb: 1 }} />
          <Skeleton width="40%" height={28} />
          <Skeleton width="70%" height={12} sx={{ mt: 1 }} />
        </CardContent>
      </Card>
    );
  }

  const displayValue = value !== undefined && value !== null ? value : 0;

  return (
    <Grow in timeout={300}>
      <Card
        sx={{
          borderRadius: 3,
          border: "0.5px solid",
          borderColor: "divider",
          boxShadow: "none",
          "&:hover": { borderColor: BRAND, boxShadow: `0 0 0 1px ${BRAND}22` },
          transition: "all .2s",
        }}
      >
        <CardContent sx={{ p: "14px 16px !important" }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: 0.6,
                  fontSize: "0.68rem",
                }}
              >
                {title}
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 500,
                  mt: 0.5,
                  fontSize: "1.4rem",
                  color: "text.primary",
                }}
              >
                {typeof displayValue === "number"
                  ? displayValue.toLocaleString()
                  : displayValue}
              </Typography>
              {subtitle && (
                <Typography
                  variant="caption"
                  sx={{
                    color: "text.secondary",
                    mt: 0.25,
                    display: "block",
                    fontSize: "0.72rem",
                  }}
                >
                  {subtitle}
                </Typography>
              )}
              {trend !== undefined && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    mt: 0.75,
                  }}
                >
                  {trend >= 0 ? (
                    <TrendingUpIcon sx={{ fontSize: 13, color: "#1d9e75" }} />
                  ) : (
                    <TrendingDownIcon sx={{ fontSize: 13, color: "#e24b4a" }} />
                  )}
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 600,
                      color: trend >= 0 ? "#1d9e75" : "#e24b4a",
                      fontSize: "0.7rem",
                    }}
                  >
                    {Math.abs(trend)}%
                  </Typography>
                </Box>
              )}
            </Box>
            <Box
              sx={{
                p: 1.25,
                borderRadius: 2,
                bgcolor: `${color}18`,
                flexShrink: 0,
                ml: 1.5,
              }}
            >
              <Icon sx={{ fontSize: 20, color }} />
            </Box>
          </Box>
          {badge !== undefined && (
            <Box
              sx={{
                mt: 1.5,
                pt: 1.5,
                borderTop: "0.5px solid",
                borderColor: "divider",
              }}
            >
              <Chip
                label={badge}
                size="small"
                sx={{
                  bgcolor: `${badgeColor || color}15`,
                  color: badgeColor || color,
                  fontWeight: 600,
                  fontSize: "0.68rem",
                  height: 20,
                  borderRadius: "20px",
                }}
              />
            </Box>
          )}
        </CardContent>
      </Card>
    </Grow>
  );
};

// ===================== CHART CARD =====================
const ChartCard = ({
  title,
  subtitle,
  children,
  height = 280,
  isLoading,
  icon: Icon,
  actions,
}) => {
  if (isLoading) {
    return (
      <Card
        sx={{
          borderRadius: 3,
          border: "0.5px solid",
          borderColor: "divider",
          boxShadow: "none",
        }}
      >
        <CardContent>
          <Skeleton width="45%" height={18} sx={{ mb: 0.5 }} />
          <Skeleton width="30%" height={13} sx={{ mb: 2 }} />
          <Skeleton
            variant="rectangular"
            height={height - 60}
            sx={{ borderRadius: 2 }}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Fade in timeout={400}>
      <Card
        sx={{
          borderRadius: 3,
          border: "0.5px solid",
          borderColor: "divider",
          boxShadow: "none",
          height: "100%",
        }}
      >
        <CardContent
          sx={{ height: "100%", display: "flex", flexDirection: "column" }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              mb: 2,
            }}
          >
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                {Icon && (
                  <Icon sx={{ fontSize: 16, color: "text.secondary" }} />
                )}
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 600, fontSize: "0.82rem" }}
                >
                  {title}
                </Typography>
              </Box>
              {subtitle && (
                <Typography
                  variant="caption"
                  sx={{
                    color: "text.secondary",
                    ml: Icon ? 3 : 0,
                    fontSize: "0.72rem",
                  }}
                >
                  {subtitle}
                </Typography>
              )}
            </Box>
            {actions}
          </Box>
          <Box sx={{ height, flex: 1 }}>
            <ResponsiveContainer width="100%" height="100%">
              {children}
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>
    </Fade>
  );
};

// ===================== RATE PILL =====================
const RatePill = ({ label, value, color, icon: Icon }) => (
  <Card
    sx={{
      borderRadius: 2.5,
      border: "0.5px solid",
      borderColor: "divider",
      boxShadow: "none",
      p: 1.5,
    }}
  >
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
      <Box
        sx={{ p: 1, borderRadius: 1.5, bgcolor: `${color}15`, flexShrink: 0 }}
      >
        <Icon sx={{ fontSize: 18, color }} />
      </Box>
      <Box>
        <Typography
          variant="caption"
          sx={{
            color: "text.secondary",
            fontWeight: 500,
            fontSize: "0.7rem",
            display: "block",
          }}
        >
          {label}
        </Typography>
        <Typography
          variant="h6"
          sx={{ fontWeight: 500, lineHeight: 1.2, fontSize: "1.1rem" }}
        >
          {value}%
        </Typography>
      </Box>
    </Box>
  </Card>
);

// ===================== MINI TABLE =====================
const MiniTable = ({ columns, rows, isLoading }) => {
  if (isLoading) {
    return (
      <Box sx={{ p: 1 }}>
        <Skeleton variant="rectangular" height={160} sx={{ borderRadius: 2 }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        overflowX: "auto",
        borderRadius: 2,
        border: "0.5px solid",
        borderColor: "divider",
      }}
    >
      <Box
        component="table"
        sx={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}
      >
        <Box component="thead">
          <Box
            component="tr"
            sx={{
              bgcolor: "grey.50",
              borderBottom: "0.5px solid",
              borderColor: "divider",
            }}
          >
            {columns.map((col, i) => (
              <Box
                component="th"
                key={i}
                sx={{
                  px: 2,
                  py: 1.25,
                  textAlign: "left",
                  fontWeight: 600,
                  fontSize: "0.65rem",
                  color: "text.secondary",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  whiteSpace: "nowrap",
                }}
              >
                {col.label}
              </Box>
            ))}
          </Box>
        </Box>
        <Box component="tbody">
          {rows.map((row, i) => (
            <Box
              component="tr"
              key={i}
              sx={{
                borderBottom: i < rows.length - 1 ? "0.5px solid" : "none",
                borderColor: "divider",
                "&:hover": { bgcolor: "action.hover" },
                transition: "background .15s",
              }}
            >
              {columns.map((col, j) => (
                <Box
                  component="td"
                  key={j}
                  sx={{ px: 2, py: 1.25, whiteSpace: "nowrap" }}
                >
                  {col.render ? col.render(row) : row[col.key]}
                </Box>
              ))}
            </Box>
          ))}
          {rows.length === 0 && (
            <Box component="tr">
              <Box
                component="td"
                colSpan={columns.length}
                sx={{
                  px: 2,
                  py: 4,
                  textAlign: "center",
                  color: "text.secondary",
                  fontSize: "0.8rem",
                }}
              >
                No data available
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

// ===================== FILTER BAR =====================
const FilterBar = ({
  filters,
  onFilterChange,
  onRefresh,
  isRefreshing,
  onExport,
  onClearFilters,
}) => {
  const [expanded, setExpanded] = useState(false);
  const activeCount = Object.entries(filters).filter(
    ([k, v]) => v !== null && v !== "" && !(k === "period" && v === "monthly"),
  ).length;

  return (
    <Card
      sx={{
        borderRadius: 3,
        border: "0.5px solid",
        borderColor: "divider",
        boxShadow: "none",
        p: 2,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <Button
          variant="outlined"
          size="small"
          onClick={() => setExpanded(!expanded)}
          startIcon={<FilterListIcon />}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
            fontSize: "0.78rem",
            borderColor: "divider",
            color: "text.primary",
            "&:hover": { borderColor: BRAND, color: BRAND },
          }}
        >
          Filters
          {activeCount > 0 && (
            <Chip
              label={activeCount}
              size="small"
              sx={{
                ml: 0.5,
                bgcolor: BRAND,
                color: "white",
                height: 16,
                "& .MuiChip-label": { px: 0.75, fontSize: "0.6rem" },
              }}
            />
          )}
        </Button>

        <Box sx={{ flex: 1 }} />

        <Select
          value={filters.period || "monthly"}
          onChange={(e) => onFilterChange({ period: e.target.value })}
          size="small"
          sx={{
            borderRadius: 2,
            fontSize: "0.8rem",
            minWidth: 110,
            "& .MuiOutlinedInput-notchedOutline": { borderColor: "divider" },
          }}
        >
          <MenuItem value="daily" sx={{ fontSize: "0.8rem" }}>
            Daily
          </MenuItem>
          <MenuItem value="weekly" sx={{ fontSize: "0.8rem" }}>
            Weekly
          </MenuItem>
          <MenuItem value="monthly" sx={{ fontSize: "0.8rem" }}>
            Monthly
          </MenuItem>
        </Select>

        <Button
          variant="contained"
          size="small"
          onClick={onRefresh}
          disabled={isRefreshing}
          startIcon={
            isRefreshing ? (
              <CircularProgress size={14} color="inherit" />
            ) : (
              <RefreshIcon />
            )
          }
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
            fontSize: "0.78rem",
            bgcolor: BRAND,
            "&:hover": { bgcolor: BRAND_DARK },
            boxShadow: "none",
          }}
        >
          {isRefreshing ? "Loading…" : "Refresh"}
        </Button>

        <Button
          variant="outlined"
          size="small"
          onClick={onExport}
          startIcon={<DownloadIcon />}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
            fontSize: "0.78rem",
            borderColor: "divider",
            color: "text.primary",
            "&:hover": { borderColor: BRAND, color: BRAND },
          }}
        >
          Export
        </Button>
      </Box>

      {expanded && (
        <Box
          sx={{
            mt: 2,
            pt: 2,
            borderTop: "0.5px solid",
            borderColor: "divider",
          }}
        >
          <Grid container spacing={2}>
            {[
              { label: "Start Date", key: "startDate", type: "date" },
              { label: "End Date", key: "endDate", type: "date" },
              {
                label: "Category",
                key: "category",
                placeholder: "e.g. safety",
              },
              { label: "Status", key: "status", placeholder: "e.g. active" },
            ].map(({ label, key, type, placeholder }) => (
              <Grid item xs={12} sm={6} md={3} key={key}>
                <TextField
                  label={label}
                  type={type || "text"}
                  size="small"
                  placeholder={placeholder}
                  value={filters[key] || ""}
                  onChange={(e) =>
                    onFilterChange({ [key]: e.target.value || null })
                  }
                  InputLabelProps={
                    type === "date" ? { shrink: true } : undefined
                  }
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      fontSize: "0.8rem",
                    },
                  }}
                />
              </Grid>
            ))}
          </Grid>
          <Box sx={{ mt: 1.5, display: "flex", justifyContent: "flex-end" }}>
            <Button
              variant="text"
              size="small"
              onClick={onClearFilters}
              sx={{
                color: "error.main",
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.78rem",
              }}
            >
              Clear all filters
            </Button>
          </Box>
        </Box>
      )}
    </Card>
  );
};

// ===================== TABS =====================
const TABS = [
  { id: "overview", label: "Overview", icon: AssessmentIcon },
  { id: "assets", label: "Assets", icon: InventoryIcon },
  { id: "checklists", label: "Checklists", icon: ChecklistIcon },
  { id: "assignments", label: "Assignments", icon: AssignmentIcon },
  { id: "submissions", label: "Submissions", icon: DescriptionIcon },
  { id: "team", label: "Team", icon: PeopleIcon },
];

const TabBar = ({ selectedTab, onTabChange }) => (
  <Card
    sx={{
      borderRadius: 3,
      border: "0.5px solid",
      borderColor: "divider",
      boxShadow: "none",
      p: 0.5,
    }}
  >
    <Tabs
      value={selectedTab}
      onChange={(_, v) => onTabChange(v)}
      variant="scrollable"
      scrollButtons="auto"
      sx={{
        minHeight: 40,
        "& .MuiTab-root": {
          textTransform: "none",
          fontWeight: 600,
          fontSize: "0.8rem",
          minHeight: 38,
          borderRadius: 2,
          color: "text.secondary",
          "&.Mui-selected": { color: BRAND },
          "&:hover:not(.Mui-selected)": {
            bgcolor: "action.hover",
            color: "text.primary",
          },
        },
        "& .MuiTabs-indicator": {
          bgcolor: BRAND,
          height: 2.5,
          borderRadius: 2,
        },
      }}
    >
      {TABS.map(({ id, label, icon: Icon }) => (
        <Tab
          key={id}
          value={id}
          label={label}
          icon={<Icon sx={{ fontSize: 16 }} />}
          iconPosition="start"
          sx={{ gap: 0.5 }}
        />
      ))}
    </Tabs>
  </Card>
);

// ===================== SECTION HEADING =====================
const SectionHead = ({ icon: Icon, children }) => (
  <Typography
    variant="subtitle2"
    fontWeight={600}
    fontSize="0.82rem"
    sx={{ mb: 2, display: "flex", alignItems: "center", gap: 0.75 }}
  >
    {Icon && <Icon sx={{ fontSize: 15, color: "text.secondary" }} />}
    {children}
  </Typography>
);

// ===================== PROGRESS CELL =====================
const ProgressCell = ({ value, color }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
    <LinearProgress
      variant="determinate"
      value={value || 0}
      sx={{
        width: 56,
        height: 5,
        borderRadius: 3,
        bgcolor: "#f1efe8",
        "& .MuiLinearProgress-bar": {
          bgcolor:
            color ||
            (value > 70 ? "#1d9e75" : value > 40 ? "#ef9f27" : "#e24b4a"),
          borderRadius: 3,
        },
      }}
    />
    <Typography variant="caption" color="text.secondary" fontSize="0.68rem">
      {value || 0}%
    </Typography>
  </Box>
);

// ===================== AVATAR =====================
const Avatar = ({ name, email }) => {
  const initials = name
    ? name
        .split(" ")
        .map((x) => x[0])
        .join("")
        .slice(0, 2)
    : (email?.[0] || "?").toUpperCase();
  const idx = (email?.charCodeAt(0) || 0) % PALETTE.length;
  return (
    <Box
      sx={{
        width: 28,
        height: 28,
        borderRadius: "50%",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: PALETTE[idx],
        color: "#fff",
        fontSize: "0.65rem",
        fontWeight: 600,
      }}
    >
      {initials.toUpperCase()}
    </Box>
  );
};

// ===================== OVERVIEW TAB =====================
const OverviewTab = ({ data, loading }) => {
  const {
    overview,
    assets,
    checklists,
    assignments,
    submissions,
    requests,
    team,
    trends,
  } = data || {};

  const topStats = [
    {
      title: "Total assets",
      value: overview?.totalAssets,
      icon: InventoryIcon,
      color: BRAND,
      subtitle: `${assets?.total ?? 0} tracked`,
      trend: 12,
    },
    {
      title: "Checklists",
      value: overview?.totalChecklists,
      icon: ChecklistIcon,
      color: "#7f77dd",
      subtitle: `${checklists?.total ?? 0} available`,
      trend: 8,
    },
    {
      title: "Assignments",
      value: overview?.totalAssignments,
      icon: AssignmentIcon,
      color: "#1d9e75",
      subtitle: `${overview?.activeAssignments ?? 0} active`,
      trend: 5,
    },
    {
      title: "Submissions",
      value: overview?.totalSubmissions,
      icon: DescriptionIcon,
      color: "#ef9f27",
      subtitle: `${overview?.pendingSubmissions ?? 0} pending review`,
      trend: -3,
    },
    {
      title: "Team members",
      value: overview?.totalUsers,
      icon: PeopleIcon,
      color: "#378add",
      subtitle: `${team?.total ?? 0} on team`,
      trend: 2,
    },
    {
      title: "Asset requests",
      value: overview?.totalRequests,
      icon: DescriptionIcon,
      color: "#d85a30",
      subtitle: `${overview?.pendingRequests ?? 0} pending`,
      trend: 6,
    },
  ];

  const rates = [
    {
      label: "Completion rate",
      value: overview?.completionRate ?? 0,
      icon: CheckCircleIcon,
      color: "#1d9e75",
    },
    {
      label: "Submission rate",
      value: overview?.submissionRate ?? 0,
      icon: TrendingUpIcon,
      color: BRAND,
    },
    {
      label: "Approval rate",
      value: overview?.requestApprovalRate ?? 0,
      icon: EmojiEventsIcon,
      color: "#7f77dd",
    },
    {
      label: "Asset utilization",
      value: overview?.assetUtilizationRate ?? 0,
      icon: SpeedIcon,
      color: "#1d9e75",
    },
  ];

  const trendData = useMemo(() => {
    const map = {};
    (trends?.assets?.daily || []).forEach((d) => {
      map[d._id] = { date: d._id, assets: d.count };
    });
    (trends?.assignments?.daily || []).forEach((d) => {
      if (!map[d._id]) map[d._id] = { date: d._id };
      map[d._id].assignments = d.count;
    });
    (trends?.submissions?.daily || []).forEach((d) => {
      if (!map[d._id]) map[d._id] = { date: d._id };
      map[d._id].submissions = d.count;
    });
    (trends?.requests?.daily || []).forEach((d) => {
      if (!map[d._id]) map[d._id] = { date: d._id };
      map[d._id].requests = d.count;
    });
    return Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
  }, [trends]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Grid container spacing={2}>
        {topStats.map((s, i) => (
          <Grid item xs={12} sm={6} md={4} lg={2} key={i}>
            <StatCard {...s} isLoading={loading} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2}>
        {rates.map((r, i) => (
          <Grid item xs={6} sm={3} key={i}>
            <RatePill {...r} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} lg={8}>
          <ChartCard
            title="Activity trends"
            subtitle="Assets, assignments & submissions over time"
            icon={TimelineIcon}
            isLoading={loading}
            height={300}
          >
            <ComposedChart data={trendData}>
              <defs>
                <linearGradient id="gradAssets" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={BRAND} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={BRAND} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradSubs" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1d9e75" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#1d9e75" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} />
              <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area
                type="monotone"
                dataKey="assets"
                name="Assets"
                stroke={BRAND}
                fill="url(#gradAssets)"
                strokeWidth={2}
                dot={false}
              />
              <Area
                type="monotone"
                dataKey="submissions"
                name="Submissions"
                stroke="#1d9e75"
                fill="url(#gradSubs)"
                strokeWidth={2}
                dot={false}
              />
              <Bar
                dataKey="assignments"
                name="Assignments"
                fill="#7f77dd"
                radius={[3, 3, 0, 0]}
                opacity={0.85}
              />
              <Line
                type="monotone"
                dataKey="requests"
                name="Requests"
                stroke="#d85a30"
                strokeWidth={2}
                dot={{ r: 3, fill: "#d85a30" }}
                strokeDasharray="5 3"
              />
            </ComposedChart>
          </ChartCard>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              height: "100%",
            }}
          >
            <ChartCard
              title="Assignment status"
              icon={DonutLargeIcon}
              isLoading={loading}
              height={180}
            >
              <PieChart>
                <Pie
                  data={assignments?.byStatus || []}
                  dataKey="count"
                  nameKey="_id"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={68}
                  paddingAngle={3}
                  labelLine={false}
                >
                  {(assignments?.byStatus || []).map((e, i) => (
                    <Cell key={i} fill={getStatusColor(e._id)} />
                  ))}
                </Pie>
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend
                  iconType="circle"
                  iconSize={7}
                  wrapperStyle={{ fontSize: 10 }}
                />
              </PieChart>
            </ChartCard>

            <ChartCard
              title="Asset status"
              icon={DonutLargeIcon}
              isLoading={loading}
              height={180}
            >
              <PieChart>
                <Pie
                  data={assets?.byStatus || []}
                  dataKey="count"
                  nameKey="_id"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={68}
                  paddingAngle={3}
                  labelLine={false}
                >
                  {(assets?.byStatus || []).map((e, i) => (
                    <Cell key={i} fill={getStatusColor(e._id)} />
                  ))}
                </Pie>
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend
                  iconType="circle"
                  iconSize={7}
                  wrapperStyle={{ fontSize: 10 }}
                />
              </PieChart>
            </ChartCard>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

// ===================== ASSETS TAB =====================
const AssetsTab = ({ data, loading }) => {
  const { assets } = data || {};

  const kpis = [
    {
      title: "Total assets",
      value: assets?.total,
      icon: InventoryIcon,
      color: BRAND,
    },
    {
      title: "Total value",
      value: `$${(assets?.totalValue || 0).toLocaleString()}`,
      icon: AttachMoneyIcon,
      color: "#1d9e75",
    },
    {
      title: "Avg value",
      value: `$${(assets?.avgValue || 0).toLocaleString()}`,
      icon: AttachMoneyIcon,
      color: "#7f77dd",
    },
    {
      title: "Max value",
      value: `$${(assets?.maxValue || 0).toLocaleString()}`,
      icon: AttachMoneyIcon,
      color: "#d85a30",
    },
    {
      title: "Avg health",
      value: `${assets?.healthStats?.avgHealthScore ?? 0}`,
      icon: SpeedIcon,
      color: "#1d9e75",
    },
    {
      title: "Active assets",
      value: assets?.byStatus?.find((s) => s._id === "Active")?.count ?? 0,
      icon: CheckCircleIcon,
      color: "#1d9e75",
    },
  ];

  const assetColumns = [
    {
      label: "Asset name",
      key: "assetName",
      render: (r) => (
        <Typography variant="body2" fontWeight={600} fontSize="0.8rem">
          {r.assetName}
        </Typography>
      ),
    },
    {
      label: "Asset ID",
      key: "assetId",
      render: (r) => (
        <Typography
          variant="caption"
          sx={{
            fontFamily: "monospace",
            color: "text.secondary",
            fontSize: "0.72rem",
          }}
        >
          {r.assetId}
        </Typography>
      ),
    },
    {
      label: "Status",
      key: "status",
      render: (r) => <StatusChip label={r.status} />,
    },
    {
      label: "Condition",
      key: "assetCondition",
      render: (r) => <StatusChip label={r.assetCondition} />,
    },
    {
      label: "Value",
      key: "purchaseCost",
      render: (r) => (
        <Typography variant="body2" fontWeight={600} fontSize="0.8rem">
          ${(r.purchaseCost || 0).toLocaleString()}
        </Typography>
      ),
    },
    {
      label: "Health",
      key: "healthScore",
      render: (r) => <ProgressCell value={r.healthScore} />,
    },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Grid container spacing={2}>
        {kpis.map((k, i) => (
          <Grid item xs={12} sm={6} md={4} lg={2} key={i}>
            <StatCard {...k} isLoading={loading} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} lg={6}>
          <ChartCard
            title="Assets by category"
            icon={BarChartIcon}
            isLoading={loading}
            height={280}
          >
            <BarChart data={assets?.byCategory || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="_id" tick={{ fontSize: 10, fill: "#94a3b8" }} />
              <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} />
              <RechartsTooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Assets" radius={[5, 5, 0, 0]}>
                {(assets?.byCategory || []).map((_, i) => (
                  <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                ))}
              </Bar>
            </BarChart>
          </ChartCard>
        </Grid>
        <Grid item xs={12} lg={6}>
          <ChartCard
            title="Assets by condition"
            icon={PieChartIcon}
            isLoading={loading}
            height={280}
          >
            <PieChart>
              <Pie
                data={assets?.byCondition || []}
                dataKey="count"
                nameKey="_id"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                labelLine={false}
              >
                {(assets?.byCondition || []).map((_, i) => (
                  <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                ))}
              </Pie>
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 11 }}
              />
            </PieChart>
          </ChartCard>
        </Grid>
      </Grid>

      <Card
        sx={{
          borderRadius: 3,
          border: "0.5px solid",
          borderColor: "divider",
          boxShadow: "none",
          p: 2,
        }}
      >
        <SectionHead icon={InventoryIcon}>Recent assets</SectionHead>
        <MiniTable
          columns={assetColumns}
          rows={assets?.recentAssets || []}
          isLoading={loading}
        />
      </Card>
    </Box>
  );
};

// ===================== CHECKLISTS TAB =====================
const ChecklistsTab = ({ data, loading }) => {
  const { checklists } = data || {};

  const kpis = [
    {
      title: "Total checklists",
      value: checklists?.total,
      icon: ChecklistIcon,
      color: "#7f77dd",
    },
    {
      title: "Total fields",
      value: checklists?.totalFields,
      icon: BarChartIcon,
      color: BRAND,
    },
    {
      title: "Avg fields",
      value: checklists?.avgFieldsPerChecklist,
      icon: BarChartIcon,
      color: "#1d9e75",
    },
    {
      title: "Field types",
      value: checklists?.fieldTypeStats?.length ?? 0,
      icon: PieChartIcon,
      color: "#d85a30",
    },
  ];

  const checklistColumns = [
    {
      label: "Name",
      key: "name",
      render: (r) => (
        <Typography variant="body2" fontWeight={600} fontSize="0.8rem">
          {r.name}
        </Typography>
      ),
    },
    {
      label: "Category",
      key: "category",
      render: (r) => <StatusChip label={r.category} />,
    },
    {
      label: "Status",
      key: "status",
      render: (r) => <StatusChip label={r.status} />,
    },
    {
      label: "Fields",
      key: "fields",
      render: (r) => (
        <Typography variant="body2" fontWeight={600} fontSize="0.8rem">
          {r.fields?.length ?? 0}
        </Typography>
      ),
    },
    {
      label: "Version",
      key: "version",
      render: (r) => (
        <Typography variant="caption" color="text.secondary" fontSize="0.72rem">
          v{r.version}
        </Typography>
      ),
    },
    {
      label: "Created",
      key: "createdAt",
      render: (r) => (
        <Typography variant="caption" color="text.secondary" fontSize="0.72rem">
          {new Date(r.createdAt).toLocaleDateString()}
        </Typography>
      ),
    },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Grid container spacing={2}>
        {kpis.map((k, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <StatCard {...k} isLoading={loading} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} lg={6}>
          <ChartCard
            title="Field type distribution"
            subtitle="Usage across all checklists"
            icon={BarChartIcon}
            isLoading={loading}
            height={280}
          >
            <BarChart layout="vertical" data={checklists?.fieldTypeStats || []}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f1f5f9"
                horizontal={false}
              />
              <XAxis type="number" tick={{ fontSize: 10, fill: "#94a3b8" }} />
              <YAxis
                type="category"
                dataKey="_id"
                width={90}
                tick={{ fontSize: 10, fill: "#64748b" }}
              />
              <RechartsTooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Count" radius={[0, 5, 5, 0]}>
                {(checklists?.fieldTypeStats || []).map((_, i) => (
                  <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                ))}
              </Bar>
            </BarChart>
          </ChartCard>
        </Grid>
        <Grid item xs={12} lg={6}>
          <ChartCard
            title="By category"
            icon={PieChartIcon}
            isLoading={loading}
            height={280}
          >
            <PieChart>
              <Pie
                data={checklists?.byCategory || []}
                dataKey="count"
                nameKey="_id"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                labelLine={false}
              >
                {(checklists?.byCategory || []).map((_, i) => (
                  <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                ))}
              </Pie>
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 11 }}
              />
            </PieChart>
          </ChartCard>
        </Grid>
      </Grid>

      <Card
        sx={{
          borderRadius: 3,
          border: "0.5px solid",
          borderColor: "divider",
          boxShadow: "none",
          p: 2,
        }}
      >
        <SectionHead icon={ChecklistIcon}>Recent checklists</SectionHead>
        <MiniTable
          columns={checklistColumns}
          rows={checklists?.recentChecklists || []}
          isLoading={loading}
        />
      </Card>
    </Box>
  );
};

// ===================== ASSIGNMENTS TAB =====================
const AssignmentsTab = ({ data, loading }) => {
  const { assignments } = data || {};
  const cs = assignments?.completionStats || {};

  const kpis = [
    {
      title: "Total",
      value: assignments?.total,
      icon: AssignmentIcon,
      color: BRAND,
    },
    {
      title: "Submitted",
      value: cs.submitted ?? 0,
      icon: CheckCircleIcon,
      color: "#1d9e75",
      badge: `${cs.submissionRate ?? 0}% rate`,
      badgeColor: "#1d9e75",
    },
    {
      title: "Pending",
      value: cs.pending ?? 0,
      icon: HourglassEmptyIcon,
      color: "#ef9f27",
    },
    {
      title: "Overdue",
      value: assignments?.overdueCount ?? 0,
      icon: WarningAmberIcon,
      color: "#e24b4a",
    },
  ];

  const priorityData = (assignments?.byPriority || []).map((p) => ({
    name: p._id.charAt(0).toUpperCase() + p._id.slice(1),
    value: p.count,
    fill:
      p._id === "high" ? "#e24b4a" : p._id === "medium" ? "#ef9f27" : "#1d9e75",
  }));

  const assignColumns = [
    {
      label: "Client",
      key: "customerName",
      render: (r) => (
        <Typography variant="body2" fontWeight={600} fontSize="0.8rem">
          {r.customerName}
        </Typography>
      ),
    },
    {
      label: "Due date",
      key: "dueDate",
      render: (r) => (
        <Typography variant="caption" fontSize="0.75rem">
          {new Date(r.dueDate).toLocaleDateString()}
        </Typography>
      ),
    },
    {
      label: "Priority",
      key: "priority",
      render: (r) => <StatusChip label={r.priority} />,
    },
    {
      label: "Status",
      key: "status",
      render: (r) => <StatusChip label={r.status} />,
    },
    {
      label: "Created",
      key: "createdAt",
      render: (r) => (
        <Typography variant="caption" color="text.secondary" fontSize="0.72rem">
          {new Date(r.createdAt).toLocaleDateString()}
        </Typography>
      ),
    },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Grid container spacing={2}>
        {kpis.map((k, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <StatCard {...k} isLoading={loading} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} lg={4}>
          <ChartCard
            title="Priority breakdown"
            icon={BarChartIcon}
            isLoading={loading}
            height={280}
          >
            <BarChart data={priorityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} />
              <RechartsTooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="Count" radius={[5, 5, 0, 0]}>
                {priorityData.map((d, i) => (
                  <Cell key={i} fill={d.fill} />
                ))}
              </Bar>
            </BarChart>
          </ChartCard>
        </Grid>
        <Grid item xs={12} lg={4}>
          <ChartCard
            title="By status"
            icon={DonutLargeIcon}
            isLoading={loading}
            height={280}
          >
            <PieChart>
              <Pie
                data={assignments?.byStatus || []}
                dataKey="count"
                nameKey="_id"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                labelLine={false}
              >
                {(assignments?.byStatus || []).map((e, i) => (
                  <Cell key={i} fill={getStatusColor(e._id)} />
                ))}
              </Pie>
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 11 }}
              />
            </PieChart>
          </ChartCard>
        </Grid>
        <Grid item xs={12} lg={4}>
          <ChartCard
            title="Due date distribution"
            icon={ScheduleIcon}
            isLoading={loading}
            height={280}
          >
            <AreaChart data={assignments?.byDueDate || []}>
              <defs>
                <linearGradient id="gradDue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7f77dd" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#7f77dd" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="_id" tick={{ fontSize: 10, fill: "#94a3b8" }} />
              <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} />
              <RechartsTooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="count"
                name="Assignments"
                stroke="#7f77dd"
                fill="url(#gradDue)"
                strokeWidth={2}
                dot={{ r: 3, fill: "#7f77dd" }}
              />
            </AreaChart>
          </ChartCard>
        </Grid>
      </Grid>

      <Card
        sx={{
          borderRadius: 3,
          border: "0.5px solid",
          borderColor: "divider",
          boxShadow: "none",
          p: 2,
        }}
      >
        <SectionHead icon={AssignmentIcon}>Recent assignments</SectionHead>
        <MiniTable
          columns={assignColumns}
          rows={assignments?.recentAssignments || []}
          isLoading={loading}
        />
      </Card>
    </Box>
  );
};

// ===================== SUBMISSIONS TAB =====================
const SubmissionsTab = ({ data, loading }) => {
  const { submissions } = data || {};
  const ss = submissions?.scoreStats || {};

  const kpis = [
    {
      title: "Total",
      value: submissions?.total,
      icon: DescriptionIcon,
      color: "#d85a30",
    },
    {
      title: "Avg completion",
      value: `${submissions?.avgCompletionRate ?? 0}%`,
      icon: CheckCircleIcon,
      color: "#1d9e75",
    },
    {
      title: "Max completion",
      value: `${submissions?.maxCompletionRate ?? 0}%`,
      icon: TrendingUpIcon,
      color: BRAND,
    },
    {
      title: "Pending review",
      value:
        submissions?.byReviewStatus?.find((s) => s._id === "pending_review")
          ?.count ?? 0,
      icon: HourglassEmptyIcon,
      color: "#ef9f27",
    },
  ];

  const subColumns = [
    {
      label: "Submitted by",
      key: "submittedBy",
      render: (r) => (
        <Typography variant="body2" fontWeight={600} fontSize="0.8rem">
          {r.submittedBy?.email ?? "—"}
        </Typography>
      ),
    },
    {
      label: "Status",
      key: "reviewStatus",
      render: (r) => (
        <StatusChip label={(r.reviewStatus || "").replace(/_/g, " ")} />
      ),
    },
    {
      label: "Completion",
      key: "overallCompletionRate",
      render: (r) => (
        <ProgressCell
          value={r.overallCompletionRate}
          color={r.overallCompletionRate >= 80 ? "#1d9e75" : "#ef9f27"}
        />
      ),
    },
    {
      label: "Submitted at",
      key: "submittedAt",
      render: (r) => (
        <Typography variant="caption" color="text.secondary" fontSize="0.72rem">
          {new Date(r.submittedAt).toLocaleString()}
        </Typography>
      ),
    },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Grid container spacing={2}>
        {kpis.map((k, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <StatCard {...k} isLoading={loading} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} lg={8}>
          <ChartCard
            title="Submission trend"
            subtitle="Daily submissions & avg completion"
            icon={TimelineIcon}
            isLoading={loading}
            height={280}
          >
            <ComposedChart data={submissions?.submissionTrend || []}>
              <defs>
                <linearGradient id="gradComp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1d9e75" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#1d9e75" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="_id" tick={{ fontSize: 10, fill: "#94a3b8" }} />
              <YAxis yAxisId="l" tick={{ fontSize: 10, fill: "#94a3b8" }} />
              <YAxis
                yAxisId="r"
                orientation="right"
                domain={[0, 100]}
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                unit="%"
              />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar
                yAxisId="l"
                dataKey="count"
                name="Submissions"
                fill={`${BRAND}cc`}
                radius={[4, 4, 0, 0]}
              />
              <Area
                yAxisId="r"
                type="monotone"
                dataKey="avgCompletion"
                name="Avg completion"
                stroke="#1d9e75"
                fill="url(#gradComp)"
                strokeWidth={2}
                dot={false}
              />
            </ComposedChart>
          </ChartCard>
        </Grid>
        <Grid item xs={12} lg={4}>
          <ChartCard
            title="Review status"
            icon={DonutLargeIcon}
            isLoading={loading}
            height={280}
          >
            <PieChart>
              <Pie
                data={submissions?.byReviewStatus || []}
                dataKey="count"
                nameKey="_id"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                labelLine={false}
              >
                {(submissions?.byReviewStatus || []).map((e, i) => (
                  <Cell key={i} fill={getStatusColor(e._id)} />
                ))}
              </Pie>
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 11 }}
              />
            </PieChart>
          </ChartCard>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} lg={6}>
          <Card
            sx={{
              borderRadius: 3,
              border: "0.5px solid",
              borderColor: "divider",
              boxShadow: "none",
              p: 2,
            }}
          >
            <SectionHead icon={StarIcon}>Score statistics</SectionHead>
            <Grid container spacing={1.5}>
              {[
                { label: "Average", value: ss.avg ?? 0 },
                { label: "Maximum", value: ss.max ?? 0 },
                { label: "Minimum", value: ss.min ?? 0 },
              ].map((s, i) => (
                <Grid item xs={4} key={i}>
                  <Box
                    sx={{
                      textAlign: "center",
                      p: 2,
                      bgcolor: "grey.50",
                      borderRadius: 2,
                      border: "0.5px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Typography variant="h6" fontWeight={500} fontSize="1.1rem">
                      {s.value}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontSize="0.7rem"
                    >
                      {s.label}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
            <Box
              sx={{
                mt: 2,
                pt: 2,
                borderTop: "0.5px solid",
                borderColor: "divider",
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                fontSize="0.72rem"
              >
                Scored submissions: <strong>{ss.scoredCount ?? 0}</strong>
              </Typography>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} lg={6}>
          <Card
            sx={{
              borderRadius: 3,
              border: "0.5px solid",
              borderColor: "divider",
              boxShadow: "none",
              p: 2,
            }}
          >
            <SectionHead icon={DescriptionIcon}>Recent submissions</SectionHead>
            <MiniTable
              columns={subColumns}
              rows={submissions?.recentSubmissions || []}
              isLoading={loading}
            />
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

// ===================== TEAM TAB =====================
const TeamTab = ({ data, loading }) => {
  const { team } = data || {};
  const ps = team?.performanceStats || {};

  const kpis = [
    {
      title: "Total members",
      value: team?.total,
      icon: PeopleIcon,
      color: "#7f77dd",
    },
    {
      title: "Active",
      value: team?.byStatus?.find((s) => s._id === "active")?.count ?? 0,
      icon: CheckCircleIcon,
      color: "#1d9e75",
    },
    {
      title: "Inactive",
      value: team?.byStatus?.find((s) => s._id === "inactive")?.count ?? 0,
      icon: HourglassEmptyIcon,
      color: "#888780",
    },
    {
      title: "Avg performance",
      value: ps.avgPerformanceScore ?? 0,
      icon: StarIcon,
      color: "#7f77dd",
    },
    {
      title: "Total completed",
      value: ps.totalCompleted ?? 0,
      icon: AssignmentIcon,
      color: BRAND,
    },
    {
      title: "Avg on-time",
      value: `${ps.avgOnTimeRate ?? 0}%`,
      icon: ScheduleIcon,
      color: "#1d9e75",
    },
  ];

  const memberColumns = [
    {
      label: "Name",
      key: "name",
      render: (r) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
          <Avatar name={`${r.firstName} ${r.lastName}`} email={r.email} />
          <Typography variant="body2" fontWeight={600} fontSize="0.8rem">
            {r.firstName} {r.lastName}
          </Typography>
        </Box>
      ),
    },
    {
      label: "Email",
      key: "email",
      render: (r) => (
        <Typography variant="caption" color="text.secondary" fontSize="0.72rem">
          {r.email}
        </Typography>
      ),
    },
    {
      label: "Status",
      key: "status",
      render: (r) => <StatusChip label={r.status} />,
    },
    {
      label: "Performance",
      key: "performanceScore",
      render: (r) => (
        <ProgressCell value={r.performanceScore} color="#7f77dd" />
      ),
    },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Grid container spacing={2}>
        {kpis.map((k, i) => (
          <Grid item xs={12} sm={6} md={4} lg={2} key={i}>
            <StatCard {...k} isLoading={loading} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} lg={4}>
          <ChartCard
            title="Role distribution"
            icon={GroupWorkIcon}
            isLoading={loading}
            height={280}
          >
            <PieChart>
              <Pie
                data={team?.roleDistribution || []}
                dataKey="count"
                nameKey="_id"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                labelLine={false}
              >
                {(team?.roleDistribution || []).map((_, i) => (
                  <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                ))}
              </Pie>
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 11 }}
              />
            </PieChart>
          </ChartCard>
        </Grid>
        <Grid item xs={12} lg={4}>
          <ChartCard
            title="Department distribution"
            icon={BusinessIcon}
            isLoading={loading}
            height={280}
          >
            <BarChart data={team?.departmentStats || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="_id" tick={{ fontSize: 10, fill: "#94a3b8" }} />
              <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} />
              <RechartsTooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Members" radius={[5, 5, 0, 0]}>
                {(team?.departmentStats || []).map((_, i) => (
                  <Cell key={i} fill={PALETTE[(i + 2) % PALETTE.length]} />
                ))}
              </Bar>
            </BarChart>
          </ChartCard>
        </Grid>
        <Grid item xs={12} lg={4}>
          <ChartCard
            title="Location breakdown"
            icon={LocationOnIcon}
            isLoading={loading}
            height={280}
          >
            <BarChart layout="vertical" data={team?.locationStats || []}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f1f5f9"
                horizontal={false}
              />
              <XAxis type="number" tick={{ fontSize: 10, fill: "#94a3b8" }} />
              <YAxis
                type="category"
                dataKey="_id"
                width={100}
                tick={{ fontSize: 10, fill: "#64748b" }}
              />
              <RechartsTooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Members" radius={[0, 5, 5, 0]}>
                {(team?.locationStats || []).map((_, i) => (
                  <Cell key={i} fill={PALETTE[(i + 4) % PALETTE.length]} />
                ))}
              </Bar>
            </BarChart>
          </ChartCard>
        </Grid>
      </Grid>

      <Card
        sx={{
          borderRadius: 3,
          border: "0.5px solid",
          borderColor: "divider",
          boxShadow: "none",
          p: 2,
        }}
      >
        <SectionHead icon={PeopleIcon}>Recent team members</SectionHead>
        <MiniTable
          columns={memberColumns}
          rows={team?.recentMembers || []}
          isLoading={loading}
        />
      </Card>
    </Box>
  );
};

// ===================== MAIN PAGE =====================
const AnalyticsPage = () => {
  const {
    loading,
    error,
    data,
    filters,
    selectedTab,
    isRefreshing,
    refresh,
    updateFilters,
    setSelectedTab,
    exportData,
    clearFilters,
  } = useAnalytics();
  const { user } = useAuth();

  const renderTab = () => {
    const props = { data, loading };
    switch (selectedTab) {
      case "overview":
        return <OverviewTab {...props} />;
      case "assets":
        return <AssetsTab {...props} />;
      case "checklists":
        return <ChecklistsTab {...props} />;
      case "assignments":
        return <AssignmentsTab {...props} />;
      case "submissions":
        return <SubmissionsTab {...props} />;
      case "team":
        return <TeamTab {...props} />;
      default:
        return null;
    }
  };

  if (error) {
    return (
      <Box sx={{ p: 3, maxWidth: 560, mx: "auto", mt: 6 }}>
        <Alert
          severity="error"
          icon={<WarningAmberIcon />}
          sx={{ borderRadius: 3 }}
          action={
            <Button color="inherit" size="small" onClick={refresh}>
              Retry
            </Button>
          }
        >
          <Typography variant="subtitle2" fontWeight={600}>
            Failed to load analytics
          </Typography>
          <Typography variant="body2">{error}</Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f0f6f8", p: { xs: 2, md: 3 } }}>
      <Box
        sx={{
          maxWidth: 1400,
          mx: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Box>
            <Typography
              variant="caption"
              sx={{
                color: BRAND,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 0.8,
                display: "block",
                mb: 0.25,
                fontSize: "0.7rem",
              }}
            >
              {user?.role === "super_admin" ? "Super admin" : "Admin"} ·{" "}
              {(filters.period || "monthly").charAt(0).toUpperCase() +
                (filters.period || "monthly").slice(1)}{" "}
              view
            </Typography>
            <Typography
              variant="h4"
              fontWeight={500}
              sx={{
                color: "text.primary",
                fontSize: { xs: "1.5rem", md: "1.75rem" },
              }}
            >
              Analytics dashboard
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            <ScheduleIcon sx={{ fontSize: 13, color: "text.secondary" }} />
            <Typography
              variant="caption"
              color="text.secondary"
              fontSize="0.72rem"
            >
              Updated{" "}
              {data?.timestamp
                ? new Date(data.timestamp).toLocaleTimeString()
                : "—"}
            </Typography>
          </Box>
        </Box>

        {/* Filters */}
        <FilterBar
          filters={filters}
          onFilterChange={updateFilters}
          onRefresh={refresh}
          isRefreshing={isRefreshing || loading}
          onExport={exportData}
          onClearFilters={clearFilters}
        />

        {/* Tabs */}
        <TabBar selectedTab={selectedTab} onTabChange={setSelectedTab} />

        {/* Content */}
        <Fade in key={selectedTab} timeout={250}>
          <Box>{renderTab()}</Box>
        </Fade>
      </Box>
    </Box>
  );
};

export default AnalyticsPage;

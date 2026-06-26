import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Alert,
  Snackbar,
  CircularProgress,
  Skeleton,
  Stack,
  alpha,
  Select,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  useMediaQuery,
  Collapse,
} from "@mui/material";
import {
  Assessment as ReportIcon,
  PictureAsPdf as PdfIcon,
  GridOn as ExcelIcon,
  FilterAlt as FilterIcon,
  Business as BusinessIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  Inventory as InventoryIcon,
  CheckCircleOutline as CheckIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  ErrorOutline as ErrorIcon,
  TrendingUp as TrendUpIcon,
  CalendarMonth as CalIcon,
  PlayArrow as RunIcon,
  AdminPanelSettings as AdminIcon,
  SupervisorAccount as SuperIcon,
  PersonOutline as TeamIcon,
} from "@mui/icons-material";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import { useAuth } from "../context/AuthContexts";
import { useReport } from "../context/ReportContext";
import AssetSearchField from "../components/AssetSearchField";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

// ─── Design tokens ─────────────────────────────────────────────────────────────
const T = {
  page: "#f5f6f8",
  surface: "#ffffff",
  surfaceAlt: "#f8f9fa",
  border: "rgba(13,43,53,0.08)",
  ink: "#0d2b35",
  inkMid: "#1a3d4a",
  inkSub: "#4a6a78",
  inkLight: "#8a9aa5",
  brand: "#083b4b",
  brandDark: "#081b22",
  brandMid: "#1a3d4a",
  brandLight: "#e8edef",
  brandFaint: "#f2f5f6",
  green: "#0f7b4a",
  greenBg: "#e6f3ed",
  amber: "#b8651a",
  amberBg: "#f5ede6",
  red: "#b92b2b",
  redBg: "#f5e6e6",
  purple: "#5b2b8a",
  purpleBg: "#efe6f5",
  cyan: "#0a6b7a",
  cyanBg: "#e6f0f2",
};

// ─── Role configuration ────────────────────────────────────────────────────────
const ROLE_REPORTS = {
  super_admin: [
    "clients",
    "revenue",
    "checklist-requests",
    "compliance",
    "inspections",
    "assets",
    "team",
    "checklists",
    "assignments",
  ],
  admin: [
    "assets",
    "asset-requests",
    "team",
    "checklists",
    "checklist-submissions",
    "assignments",
    "inspections",
  ],
  team: [
    "assignments",
    "asset-requests",
    "checklist-submissions",
    "inspections",
  ],
};

const REPORT_META = {
  clients: { label: "Clients", icon: BusinessIcon, color: T.brand },
  revenue: { label: "Revenue", icon: CurrencyRupeeIcon, color: T.green },
  assets: { label: "Assets", icon: InventoryIcon, color: T.amber },
  "asset-requests": {
    label: "Asset Requests",
    icon: ReportIcon,
    color: T.amber,
  },
  team: { label: "Team", icon: PeopleIcon, color: T.purple },
  checklists: { label: "Checklists", icon: CheckIcon, color: T.cyan },
  "checklist-requests": {
    label: "CL Requests",
    icon: ReportIcon,
    color: T.cyan,
  },
  "checklist-submissions": {
    label: "Submissions",
    icon: CheckIcon,
    color: T.cyan,
  },
  assignments: { label: "Assignments", icon: AssignmentIcon, color: T.brand },
  inspections: { label: "Audit Logs", icon: ReportIcon, color: T.amber },
  compliance: { label: "Compliance", icon: CheckIcon, color: T.green },
};

const DATE_PRESETS = [
  { label: "Today", value: "today" },
  { label: "7 days", value: "last_7_days" },
  { label: "30 days", value: "last_30_days" },
  { label: "365 days", value: "this_year" },
  { label: "Custom", value: "custom" },
];

// ─── Formatters ────────────────────────────────────────────────────────────────
const fmtNum = (n) => (n == null ? "—" : Number(n).toLocaleString("en-IN"));
const fmtPct = (n) => (n == null ? "—" : `${Number(n).toFixed(1)}%`);
const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";
const fmtCur = (n) =>
  n == null ? "—" : `₹${Number(n).toLocaleString("en-IN")}`;
const fmtShort = (s, max = 30) =>
  s ? (s.length > max ? s.substring(0, max) + "..." : s) : "—";

// ─── Export Functions ──────────────────────────────────────────────────────────
const exportPDF = async (reportData, reportType) => {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const W = 297;
  const meta = REPORT_META[reportType] || {};
  const ts = new Date().toLocaleString("en-IN");
  const data = reportData?.data || [];
  const summary = reportData?.summary || {};

  doc.setFillColor(13, 43, 53);
  doc.rect(0, 0, W, 18, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(`${meta.label || reportType} Report`, 12, 12);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated: ${ts}`, W - 12, 12, { align: "right" });

  let y = 26;
  const pairs = Object.entries(summary)
    .filter(([, v]) => typeof v !== "object" && v !== null)
    .slice(0, 8);

  if (pairs.length) {
    doc.setFontSize(6);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 116, 139);
    doc.text("SUMMARY", 12, y);
    y += 4;
    pairs.forEach(([k, v], i) => {
      const col = i % 4;
      const row = Math.floor(i / 4);
      const bx = 12 + col * 69;
      const by = y + row * 14;
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(bx, by, 65, 11, 2, 2, "F");
      doc.setTextColor(107, 114, 128);
      doc.setFontSize(5.5);
      doc.setFont("helvetica", "normal");
      doc.text(
        k
          .replace(/([A-Z])/g, " $1")
          .trim()
          .toUpperCase(),
        bx + 3,
        by + 4,
      );
      doc.setTextColor(17, 24, 39);
      doc.setFontSize(8.5);
      doc.setFont("helvetica", "bold");
      doc.text(String(v ?? "—").slice(0, 24), bx + 3, by + 9);
    });
    y += Math.ceil(pairs.length / 4) * 14 + 5;
  }

  if (data.length) {
    const cols = Object.keys(data[0])
      .filter((k) => typeof data[0][k] !== "object")
      .slice(0, 12);

    autoTable(doc,{
      head: [cols.map((c) => c.replace(/([A-Z])/g, " $1").trim())],
      body: data.map((r) =>
        cols.map((c) => {
          let val = r[c];
          if (typeof val === "object") return "—";
          if (typeof val === "string") return val.slice(0, 50);
          return String(val ?? "—");
        }),
      ),
      startY: y,
      margin: { left: 12, right: 12 },
      styles: {
        fontSize: 6.5,
        cellPadding: 2,
        textColor: [17, 24, 39],
        overflow: "ellipsize",
      },
      headStyles: {
        fillColor: [13, 43, 53],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 6.5,
      },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      tableLineColor: [229, 231, 235],
      tableLineWidth: 0.2,
    });
  }

  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFillColor(248, 250, 252);
    doc.rect(0, 200, W, 10, "F");
    doc.setTextColor(156, 163, 175);
    doc.setFontSize(6);
    doc.text("Confidential — Internal Use Only", 12, 205);
    doc.text(`Page ${i} of ${pages}`, W - 12, 205, { align: "right" });
  }

  doc.save(`${reportType}_${Date.now()}.pdf`);
};

const exportExcel = (reportData, reportType) => {
  const wb = XLSX.utils.book_new();
  const data = reportData?.data || [];
  const summary = reportData?.summary || {};

  if (data.length) {
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, "Data");
  }

  if (Object.keys(summary).length) {
    const flat = Object.entries(summary)
      .filter(([, v]) => typeof v !== "object")
      .map(([k, v]) => ({
        Metric: k.replace(/([A-Z])/g, " $1").trim(),
        Value: v,
      }));
    if (flat.length) {
      const ws = XLSX.utils.json_to_sheet(flat);
      XLSX.utils.book_append_sheet(wb, ws, "Summary");
    }
  }

  XLSX.writeFile(wb, `${reportType}_${Date.now()}.xlsx`);
};

// ─── Shared UI Components ─────────────────────────────────────────────────────
const ColHead = ({ children, align = "left" }) => (
  <TableCell
    align={align}
    sx={{
      fontWeight: 700,
      fontSize: { xs: "0.6rem", sm: "0.65rem" },
      color: T.inkSub,
      bgcolor: T.surfaceAlt,
      borderBottom: `1px solid ${T.border}`,
      whiteSpace: "nowrap",
      py: { xs: 1, sm: 1.2 },
      px: { xs: 1.25, sm: 1.6 },
      letterSpacing: "0.05em",
      textTransform: "uppercase",
      minWidth: 120,
    }}
  >
    {children}
  </TableCell>
);

const DataCell = ({ children, bold, align = "left", mono, noWrap }) => (
  <TableCell
    align={align}
    sx={{
      fontSize: bold
        ? { xs: "0.7rem", sm: "0.76rem" }
        : { xs: "0.65rem", sm: "0.71rem" },
      fontWeight: bold ? 700 : 400,
      color: bold ? T.ink : T.inkMid,
      borderBottom: `1px solid ${T.border}`,
      py: { xs: 0.8, sm: 1.1 },
      px: { xs: 1.25, sm: 1.6 },
      fontFamily: mono ? "'SF Mono', 'Courier New', monospace" : "inherit",
      minWidth: noWrap ? 120 : 140,
      maxWidth: noWrap ? 180 : 260,
      whiteSpace: noWrap ? "nowrap" : "normal",
      overflow: "hidden",
      textOverflow: "ellipsis",
      overflowWrap: "anywhere",
    }}
  >
    {children}
  </TableCell>
);

const SBadge = ({ status }) => {
  const map = {
    active: { color: T.green, bg: T.greenBg },
    approved: { color: T.green, bg: T.greenBg },
    completed: { color: T.green, bg: T.greenBg },
    published: { color: T.green, bg: T.greenBg },
    pending: { color: T.amber, bg: T.amberBg },
    in_progress: { color: T.brand, bg: T.brandLight },
    pending_review: { color: T.brand, bg: T.brandLight },
    inactive: { color: T.red, bg: T.redBg },
    rejected: { color: T.red, bg: T.redBg },
    suspended: { color: T.red, bg: T.redBg },
    overdue: { color: T.red, bg: T.redBg },
    draft: { color: T.inkSub, bg: T.surfaceAlt },
  };
  const s = map[(status || "").toLowerCase()] || {
    color: T.inkSub,
    bg: T.surfaceAlt,
  };
  return (
    <Box
      component="span"
      sx={{
        display: "inline-block",
        px: { xs: 0.7, sm: 1 },
        py: 0.25,
        borderRadius: "20px",
        fontSize: { xs: "0.55rem", sm: "0.62rem" },
        fontWeight: 700,
        bgcolor: s.bg,
        color: s.color,
        lineHeight: 1.6,
        whiteSpace: "nowrap",
      }}
    >
      {String(status || "—").replace(/_/g, " ")}
    </Box>
  );
};

const ProgressBar = ({ value, color }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 0.8,
      minWidth: { xs: 60, sm: 80 },
    }}
  >
    <Box
      sx={{
        flex: 1,
        height: 4,
        borderRadius: 2,
        bgcolor: T.surfaceAlt,
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          height: "100%",
          width: `${Math.min(100, value || 0)}%`,
          bgcolor: color || T.brand,
          borderRadius: 2,
          transition: "width 0.5s ease",
        }}
      />
    </Box>
    <Typography
      sx={{
        fontSize: { xs: "0.55rem", sm: "0.62rem" },
        fontWeight: 700,
        color: T.inkSub,
        minWidth: 28,
      }}
    >
      {fmtPct(value)}
    </Typography>
  </Box>
);

const StatCard = ({ label, value, icon: Icon, color, loading }) => {
  if (loading)
    return (
      <Box
        sx={{
          p: { xs: 1.5, sm: 2 },
          borderRadius: "12px",
          bgcolor: T.surfaceAlt,
          border: `1px solid ${T.border}`,
          height: "100%",
        }}
      >
        <Skeleton width="55%" height={12} />
        <Skeleton width="40%" height={28} sx={{ mt: 0.5 }} />
      </Box>
    );
  return (
    <Box
      sx={{
        p: { xs: 1.5, sm: 2 },
        borderRadius: "12px",
        bgcolor: T.surface,
        border: `1px solid ${T.border}`,
        display: "flex",
        flexDirection: "column",
        gap: 0.5,
        height: "100%",
        width:{xs:"145px",md:"175px"},
        minWidth: 0,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 0.5,
        }}
      >
        <Typography
          sx={{
            fontSize: { xs: "0.5rem", sm: "0.6rem" },
            fontWeight: 700,
            color: T.inkLight,
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            minWidth: 0,
          }}
        >
          {label}
        </Typography>
        {Icon && (
          <Box
            sx={{
              width: { xs: 22, sm: 26 },
              height: { xs: 22, sm: 26 },
              flexShrink: 0,
              borderRadius: "7px",
              bgcolor: alpha(color || T.brand, 0.1),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon
              sx={{ fontSize: { xs: 11, sm: 13 }, color: color || T.brand }}
            />
          </Box>
        )}
      </Box>
      <Typography
        sx={{
          fontSize: { xs: "1.1rem", sm: "1.4rem" },
          fontWeight: 800,
          color: T.ink,
          lineHeight: 1,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {value ?? "—"}
      </Typography>
    </Box>
  );
};

const EmptyState = ({ icon: Icon = ReportIcon, title, desc, action }) => (
  <Box
    sx={{
      py: { xs: 4, sm: 8 },
      px: { xs: 2, sm: 0 },
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 2,
    }}
  >
    <Box
      sx={{
        width: { xs: 50, sm: 60 },
        height: { xs: 50, sm: 60 },
        borderRadius: "16px",
        bgcolor: T.brandFaint,
        border: `1px dashed ${T.brandLight}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <Icon
        sx={{ fontSize: { xs: 22, sm: 26 }, color: T.brand, opacity: 0.45 }}
      />
    </Box>
    <Box sx={{ textAlign: "center" }}>
      <Typography
        sx={{
          fontWeight: 700,
          fontSize: { xs: "0.8rem", sm: "0.88rem" },
          color: T.inkMid,
        }}
      >
        {title}
      </Typography>
      <Typography
        sx={{
          fontSize: { xs: "0.68rem", sm: "0.73rem" },
          color: T.inkLight,
          mt: 0.4,
          maxWidth: 300,
        }}
      >
        {desc}
      </Typography>
    </Box>
    {action}
  </Box>
);

// ─── Tables ────────────────────────────────────────────────────────────────────

const ClientsTable = ({ data }) => {
  const [pg, setPg] = useState(0);
  const [rpp, setRpp] = useState(10);
  const [q, setQ] = useState("");
  const isMobile = useMediaQuery("(max-width:600px)");

  const filtered = useMemo(
    () =>
      (data || []).filter(
        (r) =>
          !q ||
          [r.name, r.email, r.customerName].some((v) =>
            (v || "").toLowerCase().includes(q.toLowerCase()),
          ),
      ),
    [data, q],
  );

  const paged = filtered.slice(pg * rpp, pg * rpp + rpp);

  if (!data?.length)
    return (
      <EmptyState
        icon={BusinessIcon}
        title="No clients found"
        desc="Adjust your filters and generate"
      />
    );

  return (
    <>
      <Box
        sx={{
          display: "flex",
          gap: 1.5,
          mb: 2,
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "stretch", sm: "center" },
        }}
      >
        <AssetSearchField
          placeholder="Search name or email..."
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPg(0);
          }}
          onClear={() => {
            setQ("");
            setPg(0);
          }}
          sx={{ flex: 1, minWidth: 0 }}
        />
        <Typography
          sx={{
            fontSize: "0.7rem",
            color: T.inkLight,
            textAlign: { xs: "right", sm: "left" },
            whiteSpace: "nowrap",
          }}
        >
          {filtered.length} clients
        </Typography>
      </Box>
      <TableContainer
        sx={{
          maxHeight: 420,
          borderRadius: "10px",
          border: `1px solid ${T.border}`,
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <Table stickyHeader size="small" sx={{ minWidth: { xs: 480, sm: "auto" } }}>
          <TableHead>
            <TableRow>
              <ColHead>Client</ColHead>
              {!isMobile && <ColHead>Plan</ColHead>}
              <ColHead>Status</ColHead>
              {!isMobile && <ColHead align="right">Team</ColHead>}
              {!isMobile && <ColHead align="right">Assignments</ColHead>}
              {!isMobile && <ColHead>Completion</ColHead>}
              {!isMobile && <ColHead>Expires</ColHead>}
            </TableRow>
          </TableHead>
          <TableBody>
            {paged.map((r, i) => (
              <TableRow key={i} hover>
                <DataCell bold>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Avatar
                      sx={{
                        width: { xs: 24, sm: 28 },
                        height: { xs: 24, sm: 28 },
                        bgcolor: T.brand,
                        fontSize: "0.6rem",
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {(r.name || r.customerName || "?")[0]?.toUpperCase()}
                    </Avatar>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        sx={{
                          fontWeight: 700,
                          fontSize: { xs: "0.65rem", sm: "0.74rem" },
                          color: T.ink,
                        }}
                      >
                        {fmtShort(r.name || r.customerName || "—", 15)}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: { xs: "0.55rem", sm: "0.62rem" },
                          color: T.inkLight,
                        }}
                      >
                        {fmtShort(r.email, 15)}
                      </Typography>
                    </Box>
                  </Box>
                </DataCell>
                {!isMobile && (
                  <DataCell>
                    <Chip
                      label={r.membershipPlan || "No plan"}
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: "0.55rem",
                        fontWeight: 700,
                        bgcolor: T.brandLight,
                        color: T.brand,
                        textTransform: "capitalize",
                      }}
                    />
                  </DataCell>
                )}
                <DataCell>
                  <SBadge status={r.status} />
                </DataCell>
                {!isMobile && (
                  <DataCell align="right">{fmtNum(r.teamMembers)}</DataCell>
                )}
                {!isMobile && (
                  <DataCell align="right">
                    {fmtNum(r.totalAssignments)}
                  </DataCell>
                )}
                {!isMobile && (
                  <DataCell>
                    <ProgressBar value={r.completionRate} />
                  </DataCell>
                )}
                {!isMobile && (
                  <DataCell>{fmtDate(r.subscriptionEndDate)}</DataCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={filtered.length}
        page={pg}
        rowsPerPage={rpp}
        onPageChange={(_, p) => setPg(p)}
        onRowsPerPageChange={(e) => {
          setRpp(+e.target.value);
          setPg(0);
        }}
        rowsPerPageOptions={[5, 10, 25]}
        sx={{
          "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
            { fontSize: { xs: "0.6rem", sm: "0.71rem" } },
          "& .MuiTablePagination-toolbar": {
            flexWrap: "wrap",
            px: { xs: 0, sm: 2 },
            minHeight: { xs: "auto", sm: 52 },
            py: { xs: 1, sm: 0 },
          },
        }}
      />
    </>
  );
};

const TeamTable = ({ data }) => {
  const [pg, setPg] = useState(0);
  const [rpp, setRpp] = useState(10);
  const [roleF, setRoleF] = useState("");
  const isMobile = useMediaQuery("(max-width:600px)");

  const filtered = useMemo(
    () => (data || []).filter((r) => !roleF || r.teamRole === roleF),
    [data, roleF],
  );
  const paged = filtered.slice(pg * rpp, pg * rpp + rpp);

  if (!data?.length)
    return (
      <EmptyState
        icon={PeopleIcon}
        title="No team members found"
        desc="Try different filters"
      />
    );

  return (
    <>
      <Box
        sx={{
          display: "flex",
          gap: 1.5,
          mb: 2,
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "stretch", sm: "center" },
        }}
      >
        <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 155 } }}>
          <InputLabel sx={{ fontSize: "0.8rem" }}>Role</InputLabel>
          <Select
            value={roleF}
            onChange={(e) => {
              setRoleF(e.target.value);
              setPg(0);
            }}
            label="Role"
          >
            <MenuItem value="">All roles</MenuItem>
            {[
              "inspector",
              "senior_inspector",
              "lead_inspector",
              "supervisor",
            ].map((r) => (
              <MenuItem key={r} value={r}>
                {r.replace(/_/g, " ")}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Typography
          sx={{
            fontSize: "0.7rem",
            color: T.inkLight,
            textAlign: { xs: "right", sm: "left" },
            whiteSpace: "nowrap",
          }}
        >
          {filtered.length} members
        </Typography>
      </Box>
      <TableContainer
        sx={{
          maxHeight: 420,
          borderRadius: "10px",
          border: `1px solid ${T.border}`,
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <Table stickyHeader size="small" sx={{ minWidth: { xs: 480, sm: "auto" } }}>
          <TableHead>
            <TableRow>
              <ColHead>Member</ColHead>
              {!isMobile && <ColHead>Role</ColHead>}
              <ColHead>Status</ColHead>
              {!isMobile && <ColHead align="right">Assignments</ColHead>}
              {!isMobile && <ColHead>Completion</ColHead>}
              {!isMobile && <ColHead>On-time</ColHead>}
              {!isMobile && <ColHead align="right">Score</ColHead>}
            </TableRow>
          </TableHead>
          <TableBody>
            {paged.map((r, i) => (
              <TableRow key={i} hover>
                <DataCell bold>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Avatar
                      sx={{
                        width: { xs: 24, sm: 28 },
                        height: { xs: 24, sm: 28 },
                        bgcolor: T.purple,
                        fontSize: "0.6rem",
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {(r.name || "?")[0]?.toUpperCase()}
                    </Avatar>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        sx={{
                          fontWeight: 700,
                          fontSize: { xs: "0.65rem", sm: "0.74rem" },
                          color: T.ink,
                        }}
                      >
                        {fmtShort(r.name || "—", 15)}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: { xs: "0.55rem", sm: "0.62rem" },
                          color: T.inkLight,
                        }}
                      >
                        {fmtShort(r.email, 15)}
                      </Typography>
                    </Box>
                  </Box>
                </DataCell>
                {!isMobile && (
                  <DataCell>
                    <Chip
                      label={(r.teamRole || "inspector").replace(/_/g, " ")}
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: "0.55rem",
                        fontWeight: 600,
                        bgcolor: T.purpleBg,
                        color: T.purple,
                      }}
                    />
                  </DataCell>
                )}
                <DataCell>
                  <SBadge status={r.status} />
                </DataCell>
                {!isMobile && (
                  <DataCell align="right">
                    {fmtNum(r.totalAssignments)}
                  </DataCell>
                )}
                {!isMobile && (
                  <DataCell>
                    <ProgressBar value={r.completionRate} />
                  </DataCell>
                )}
                {!isMobile && <DataCell>{fmtPct(r.onTimeRate)}</DataCell>}
                {!isMobile && (
                  <DataCell align="right">
                    <Chip
                      label={r.performanceScore ?? 0}
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: "0.55rem",
                        fontWeight: 700,
                        bgcolor: T.brandLight,
                        color: T.brand,
                      }}
                    />
                  </DataCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={filtered.length}
        page={pg}
        rowsPerPage={rpp}
        onPageChange={(_, p) => setPg(p)}
        onRowsPerPageChange={(e) => {
          setRpp(+e.target.value);
          setPg(0);
        }}
        rowsPerPageOptions={[5, 10, 25]}
        sx={{
          "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
            { fontSize: { xs: "0.6rem", sm: "0.71rem" } },
          "& .MuiTablePagination-toolbar": {
            flexWrap: "wrap",
            px: { xs: 0, sm: 2 },
            minHeight: { xs: "auto", sm: 52 },
            py: { xs: 1, sm: 0 },
          },
        }}
      />
    </>
  );
};

const AssetsTable = ({ data }) => {
  const [pg, setPg] = useState(0);
  const [rpp, setRpp] = useState(10);
  const [q, setQ] = useState("");
  const isMobile = useMediaQuery("(max-width:600px)");

  const filtered = useMemo(
    () =>
      (data || []).filter(
        (r) =>
          !q ||
          [r.assetName, r.tagNumber, r.serialNumber].some((v) =>
            (v || "").toLowerCase().includes(q.toLowerCase()),
          ),
      ),
    [data, q],
  );
  const paged = filtered.slice(pg * rpp, pg * rpp + rpp);

  if (!data?.length)
    return (
      <EmptyState
        icon={InventoryIcon}
        title="No assets found"
        desc="Adjust your filters"
      />
    );

  return (
    <>
      <Box
        sx={{
          display: "flex",
          gap: 1.5,
          mb: 2,
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "stretch", sm: "center" },
        }}
      >
        <AssetSearchField
          placeholder="Search name, tag, serial..."
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPg(0);
          }}
          onClear={() => {
            setQ("");
            setPg(0);
          }}
          sx={{ flex: 1, minWidth: 0 }}
        />
        <Typography
          sx={{
            fontSize: "0.7rem",
            color: T.inkLight,
            textAlign: { xs: "right", sm: "left" },
            whiteSpace: "nowrap",
          }}
        >
          {filtered.length} assets
        </Typography>
      </Box>
      <TableContainer
        sx={{
          maxHeight: 420,
          borderRadius: "10px",
          border: `1px solid ${T.border}`,
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <Table stickyHeader size="small" sx={{ minWidth: { xs: 480, sm: "auto" } }}>
          <TableHead>
            <TableRow>
              <ColHead>Asset</ColHead>
              {!isMobile && <ColHead>Tag / Serial</ColHead>}
              {!isMobile && <ColHead>Category</ColHead>}
              {!isMobile && <ColHead>Location</ColHead>}
              <ColHead>Condition</ColHead>
              {!isMobile && <ColHead>Health</ColHead>}
              <ColHead>Status</ColHead>
            </TableRow>
          </TableHead>
          <TableBody>
            {paged.map((r, i) => (
              <TableRow key={i} hover>
                <DataCell bold>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: { xs: "0.65rem", sm: "0.74rem" },
                      color: T.ink,
                    }}
                  >
                    {fmtShort(r.assetName || "—", 12)}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: { xs: "0.55rem", sm: "0.62rem" },
                      color: T.inkLight,
                    }}
                  >
                    {fmtShort(r.assetId || "—", 10)}
                  </Typography>
                </DataCell>
                {!isMobile && (
                  <DataCell mono>
                    <Typography
                      sx={{
                        fontSize: { xs: "0.6rem", sm: "0.67rem" },
                        color: T.inkMid,
                      }}
                    >
                      {fmtShort(r.tagNumber || "—", 10)}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: { xs: "0.55rem", sm: "0.62rem" },
                        color: T.inkLight,
                      }}
                    >
                      {fmtShort(r.serialNumber || "—", 10)}
                    </Typography>
                  </DataCell>
                )}
                {!isMobile && (
                  <DataCell>
                    <Chip
                      label={
                        r.category?.name ||
                        r.assetCategoryId?.name ||
                        "Uncategorized"
                      }
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: "0.5rem",
                        bgcolor: T.amberBg,
                        color: T.amber,
                      }}
                    />
                  </DataCell>
                )}
                {!isMobile && (
                  <DataCell>{fmtShort(r.currentLocation || "—", 10)}</DataCell>
                )}
                <DataCell>
                  <SBadge status={r.assetCondition || r.condition} />
                </DataCell>
                {!isMobile && (
                  <DataCell>
                    <ProgressBar
                      value={r.healthScore}
                      color={
                        r.healthScore >= 70
                          ? T.green
                          : r.healthScore >= 40
                            ? T.amber
                            : T.red
                      }
                    />
                  </DataCell>
                )}
                <DataCell>
                  <SBadge status={r.status} />
                </DataCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={filtered.length}
        page={pg}
        rowsPerPage={rpp}
        onPageChange={(_, p) => setPg(p)}
        onRowsPerPageChange={(e) => {
          setRpp(+e.target.value);
          setPg(0);
        }}
        rowsPerPageOptions={[5, 10, 25]}
        sx={{
          "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
            { fontSize: { xs: "0.6rem", sm: "0.71rem" } },
          "& .MuiTablePagination-toolbar": {
            flexWrap: "wrap",
            px: { xs: 0, sm: 2 },
            minHeight: { xs: "auto", sm: 52 },
            py: { xs: 1, sm: 0 },
          },
        }}
      />
    </>
  );
};

const AssignmentsTable = ({ data }) => {
  const [pg, setPg] = useState(0);
  const [rpp, setRpp] = useState(10);
  const [statusF, setSt] = useState("");
  const isMobile = useMediaQuery("(max-width:600px)");

  const filtered = useMemo(
    () => (data || []).filter((r) => !statusF || r.status === statusF),
    [data, statusF],
  );
  const paged = filtered.slice(pg * rpp, pg * rpp + rpp);

  if (!data?.length)
    return (
      <EmptyState
        icon={AssignmentIcon}
        title="No assignments found"
        desc="Adjust filters and generate"
      />
    );

  return (
    <>
      <Box
        sx={{
          display: "flex",
          gap: 1.5,
          mb: 2,
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "stretch", sm: "center" },
        }}
      >
        <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 130 } }}>
          <InputLabel sx={{ fontSize: "0.8rem" }}>Status</InputLabel>
          <Select
            value={statusF}
            onChange={(e) => {
              setSt(e.target.value);
              setPg(0);
            }}
            label="Status"
          >
            <MenuItem value="">All</MenuItem>
            {[
              "pending",
              "in_progress",
              "submitted",
              "completed",
              "approved",
              "rejected",
            ].map((s) => (
              <MenuItem key={s} value={s}>
                {s.replace(/_/g, " ")}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Typography
          sx={{
            fontSize: "0.7rem",
            color: T.inkLight,
            textAlign: { xs: "right", sm: "left" },
            whiteSpace: "nowrap",
          }}
        >
          {filtered.length} assignments
        </Typography>
      </Box>
      <TableContainer
        sx={{
          maxHeight: 420,
          borderRadius: "10px",
          border: `1px solid ${T.border}`,
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <Table stickyHeader size="small" sx={{ minWidth: { xs: 480, sm: "auto" } }}>
          <TableHead>
            <TableRow>
              <ColHead>Customer</ColHead>
              {!isMobile && <ColHead>Priority</ColHead>}
              <ColHead>Status</ColHead>
              {!isMobile && <ColHead>Due date</ColHead>}
              {!isMobile && <ColHead align="right">Overdue</ColHead>}
              {!isMobile && <ColHead>Checklists</ColHead>}
            </TableRow>
          </TableHead>
          <TableBody>
            {paged.map((r, i) => (
              <TableRow key={i} hover>
                <DataCell bold>
                  {fmtShort(r.customer || r.customerName || "—", 12)}
                </DataCell>
                {!isMobile && (
                  <DataCell>
                    <Chip
                      label={(r.priority || "low").toUpperCase()}
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: "0.55rem",
                        fontWeight: 700,
                        bgcolor: T.amberBg,
                        color: T.amber,
                      }}
                    />
                  </DataCell>
                )}
                <DataCell>
                  <SBadge status={r.status} />
                </DataCell>
                {!isMobile && <DataCell>{fmtDate(r.dueDate)}</DataCell>}
                {!isMobile && (
                  <DataCell align="right">
                    {r.isOverdue ? (
                      <Typography
                        sx={{
                          fontWeight: 700,
                          fontSize: { xs: "0.65rem", sm: "0.71rem" },
                          color: T.red,
                        }}
                      >
                        +{r.daysOverdue}d
                      </Typography>
                    ) : (
                      "—"
                    )}
                  </DataCell>
                )}
                {!isMobile && (
                  <DataCell>
                    <Typography
                      sx={{
                        fontSize: { xs: "0.6rem", sm: "0.67rem" },
                        color: T.inkSub,
                      }}
                    >
                      {fmtShort(
                        r.checklists?.map((c) => c.name || c).join(", ") || "—",
                        15,
                      )}
                    </Typography>
                  </DataCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={filtered.length}
        page={pg}
        rowsPerPage={rpp}
        onPageChange={(_, p) => setPg(p)}
        onRowsPerPageChange={(e) => {
          setRpp(+e.target.value);
          setPg(0);
        }}
        rowsPerPageOptions={[5, 10, 25]}
        sx={{
          "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
            { fontSize: { xs: "0.6rem", sm: "0.71rem" } },
          "& .MuiTablePagination-toolbar": {
            flexWrap: "wrap",
            px: { xs: 0, sm: 2 },
            minHeight: { xs: "auto", sm: 52 },
            py: { xs: 1, sm: 0 },
          },
        }}
      />
    </>
  );
};

const GenericTable = ({ data }) => {
  const [pg, setPg] = useState(0);
  const [rpp, setRpp] = useState(10);
  const isMobile = useMediaQuery("(max-width:600px)");

  const cols = useMemo(
    () =>
      data?.length
        ? Object.keys(data[0])
            .filter((k) => typeof data[0][k] !== "object")
            .slice(0, isMobile ? 4 : 8)
        : [],
    [data, isMobile],
  );
  const paged = (data || []).slice(pg * rpp, pg * rpp + rpp);
  const tableMinWidth = Math.max(isMobile ? 640 : 900, cols.length * 170);

  if (!data?.length)
    return (
      <EmptyState
        icon={ReportIcon}
        title="No records found"
        desc="Try different filters or date range"
      />
    );

  return (
    <>
      <TableContainer
        sx={{
          maxHeight: 420,
          borderRadius: "10px",
          border: `1px solid ${T.border}`,
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <Table stickyHeader size="small" sx={{ minWidth: tableMinWidth, tableLayout: "fixed" }}>
          <TableHead>
            <TableRow>
              {cols.map((c) => (
                <ColHead key={c}>{c.replace(/([A-Z])/g, " $1").trim()}</ColHead>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paged.map((row, i) => (
              <TableRow key={i} hover>
                {cols.map((c, j) => {
                  let val = row[c];
                  if (typeof val === "object") val = "—";
                  if (typeof val === "string")
                    val = fmtShort(val, isMobile ? 15 : 40);
                  return (
                    <DataCell key={c} bold={j === 0} mono={j === 0} noWrap={j === 0}>
                      {String(val ?? "—")}
                    </DataCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={(data || []).length}
        page={pg}
        rowsPerPage={rpp}
        onPageChange={(_, p) => setPg(p)}
        onRowsPerPageChange={(e) => {
          setRpp(+e.target.value);
          setPg(0);
        }}
        rowsPerPageOptions={[5, 10, 25]}
        sx={{
          "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
            { fontSize: { xs: "0.6rem", sm: "0.71rem" } },
          "& .MuiTablePagination-toolbar": {
            flexWrap: "wrap",
            px: { xs: 0, sm: 2 },
            minHeight: { xs: "auto", sm: 52 },
            py: { xs: 1, sm: 0 },
          },
        }}
      />
    </>
  );
};

// ─── Main Dashboard ────────────────────────────────────────────────────────────
const ReportsDashboard = () => {
  const { user } = useAuth();
  const {
    loading,
    error,
    reportData,
    getClientReport,
    getRevenueReport,
    getChecklistRequestsReport,
    getContactInquiriesReport,
    getAuditLogsReport,
    getTeamMembersReport,
    getAssetReport,
    getAssetRequestsReport,
    getChecklistSubmissionsReport,
    getChecklistReport,
    getAssignmentReport,
    clearError,
    clearReportData,
    isAdmin,
    isSuperAdmin,
  } = useReport();

  const role = user?.role || "team";
  const allowed = ROLE_REPORTS[role] || ROLE_REPORTS.team;
  const isMobile = useMediaQuery("(max-width:640px)");

  const [reportType, setReportType] = useState(allowed[0] || "assignments");
  const [datePreset, setDatePreset] = useState("last_30_days");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [filters, setFilters] = useState({});
  const [filterOpen, setFilterOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState({ open: false, msg: "", sev: "success" });
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  const notify = useCallback(
    (msg, sev = "success") => setToast({ open: true, msg, sev }),
    [],
  );

  // ─── FETCH MAP ──────────────────────────────────────────────────────────────
  const FETCH_MAP = useMemo(
    () => ({
      clients: getClientReport,
      revenue: getRevenueReport,
      "checklist-requests": getChecklistRequestsReport,
      compliance: getContactInquiriesReport,
      team: getTeamMembersReport,
      "asset-requests": getAssetRequestsReport,
      "checklist-submissions": getChecklistSubmissionsReport,
      assets: getAssetReport,
      checklists: getChecklistReport,
      assignments: getAssignmentReport,
      inspections: getAuditLogsReport,
    }),
    [
      getClientReport,
      getRevenueReport,
      getChecklistRequestsReport,
      getContactInquiriesReport,
      getTeamMembersReport,
      getAssetRequestsReport,
      getChecklistSubmissionsReport,
      getAssetReport,
      getChecklistReport,
      getAssignmentReport,
      getAuditLogsReport,
    ],
  );

  // ─── MERGED FILTERS ──────────────────────────────────────────────────────────
  const mergedFilters = useMemo(() => {
    const f = { ...filters };
    if (datePreset === "custom") {
      if (customStart) f.startDate = customStart;
      if (customEnd) f.endDate = customEnd;
    } else {
      f.dateRange = datePreset;
    }
    return f;
  }, [filters, datePreset, customStart, customEnd]);

  // ─── AUTO-GENERATE ON MOUNT ─────────────────────────────────────────────────
  useEffect(() => {
    const autoGenerate = async () => {
      const fn = FETCH_MAP[reportType];
      if (fn) {
        setGenerating(true);
        try {
          const res = await fn(mergedFilters);
          if (res?.success) {
            const cnt = res.data?.data?.length ?? 0;
            if (cnt > 0) {
              console.log(`✅ Auto-loaded ${cnt} records for ${reportType}`);
            }
          }
        } catch (e) {
          console.warn("Auto-generate error:", e.message);
        } finally {
          setGenerating(false);
          setInitialLoadDone(true);
        }
      }
    };
    autoGenerate();
  }, []);

  // ─── AUTO-GENERATE ON CHANGE ────────────────────────────────────────────────
  useEffect(() => {
    if (initialLoadDone) {
      clearReportData();

      const autoGenerate = async () => {
        const fn = FETCH_MAP[reportType];
        if (fn) {
          setGenerating(true);
          try {
            const res = await fn(mergedFilters);
            if (res?.success) {
              const cnt = res.data?.data?.length ?? 0;
              if (cnt > 0) {
                console.log(`✅ Auto-loaded ${cnt} records for ${reportType}`);
              }
            }
          } catch (e) {
            console.warn("Auto-generate error:", e.message);
          } finally {
            setGenerating(false);
          }
        }
      };

      autoGenerate();
    }
  }, [reportType, datePreset, customStart, customEnd, filters]);

  // ─── HANDLE GENERATE (Manual) ──────────────────────────────────────────────
  const handleGenerate = useCallback(async () => {
    const fn = FETCH_MAP[reportType];
    if (!fn) {
      notify("Unknown report type", "error");
      return;
    }
    setGenerating(true);
    try {
      const res = await fn(mergedFilters);
      if (res?.success) {
        const cnt = res.data?.data?.length ?? 0;
        notify(
          cnt > 0
            ? `${cnt} record${cnt !== 1 ? "s" : ""} loaded`
            : "No records match the filters",
          cnt > 0 ? "success" : "info",
        );
        setFilterOpen(false);
      }
    } catch (e) {
      notify(e.message || "Failed to generate report", "error");
    } finally {
      setGenerating(false);
    }
  }, [FETCH_MAP, reportType, mergedFilters, notify]);

  // ─── HANDLE EXPORT ──────────────────────────────────────────────────────────
  const handleExport = useCallback(
    async (fmt) => {
      if (!reportData?.data?.length) {
        notify("Generate a report first", "warning");
        return;
      }
      setExporting(true);
      try {
        if (fmt === "pdf") {
          await exportPDF(reportData, reportType);
          notify("PDF downloaded");
        } else {
          exportExcel(reportData, reportType);
          notify("Excel downloaded");
        }
      } catch (e) {
        notify(`Export failed: ${e.message}`, "error");
      } finally {
        setExporting(false);
      }
    },
    [reportData, reportType, notify],
  );


  // ─── RENDER TABLE ────────────────────────────────────────────────────────────
  const renderTable = () => {
    if (!reportData) return null;
    const d = reportData.data || [];
    if (reportType === "clients") return <ClientsTable data={d} />;
    if (reportType === "revenue") return <GenericTable data={d} />;
    if (reportType === "team") return <TeamTable data={d} />;
    if (reportType === "assets") return <AssetsTable data={d} />;
    if (reportType === "assignments") return <AssignmentsTable data={d} />;
    return <GenericTable data={d} />;
  };

  const meta = REPORT_META[reportType] || {};
  const MetaIcon = meta.icon || ReportIcon;

  const roleCfg = {
    super_admin: {
      icon: SuperIcon,
      label: "Super Admin",
      bg: T.brandLight,
      color: T.brand,
    },
    admin: { icon: AdminIcon, label: "Admin", bg: T.purpleBg, color: T.purple },
    team: { icon: TeamIcon, label: "Team", bg: T.greenBg, color: T.green },
  };
  const rc = roleCfg[role] || roleCfg.team;

  return (
    <Box
      sx={{ minHeight: "100vh", p: { xs: 1, sm: 1.5, md: 3 }, overflowX: "hidden" }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
          <Box
            sx={{
              width: { xs: 38, sm: 44 },
              height: { xs: 38, sm: 44 },
              borderRadius: "13px",
              background: `linear-gradient(135deg, ${T.brand} 0%, ${T.brandDark} 100%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 4px 14px ${alpha(T.brand, 0.3)}`,
              flexShrink: 0,
            }}
          >
            <ReportIcon sx={{ color: "#fff", fontSize: { xs: 18, sm: 22 } }} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: { xs: "0.9rem", sm: "1.25rem" },
                color: T.ink,
                letterSpacing: "-0.025em",
              }}
            >
              Reports
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: "0.6rem", sm: "0.68rem" },
                color: T.inkLight,
                mt: 0.1,
              }}
            >
              {isSuperAdmin
                ? "Platform-wide reports"
                : isAdmin
                  ? "Organisation reports"
                  : "Your reports"}
            </Typography>
          </Box>
        </Box>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          flexWrap="wrap"
          gap={1}
          alignItems={{ xs: "stretch", sm: "center" }}
          width={{ xs: "100%", sm: "auto" }}
        >
          <Box
            sx={{
              display: "flex",
              gap: 0.5,
              flexWrap: "wrap",
              overflowX: { xs: "auto", sm: "visible" },
              WebkitOverflowScrolling: "touch",
              pb: { xs: 0.5, sm: 0 },
            }}
          >
            {DATE_PRESETS.map((p) => (
              <Box
                key={p.value}
                onClick={() => setDatePreset(p.value)}
                sx={{
                  px: { xs: 0.8, sm: 1.3 },
                  py: { xs: 0.3, sm: 0.45 },
                  borderRadius: "20px",
                  cursor: "pointer",
                  fontSize: { xs: "0.6rem", sm: "0.69rem" },
                  fontWeight: 600,
                  transition: "all 0.15s",
                  bgcolor: datePreset === p.value ? T.brand : T.surface,
                  color: datePreset === p.value ? "#fff" : T.inkSub,
                  border: `1px solid ${datePreset === p.value ? T.brand : T.border}`,
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  "&:hover": {
                    bgcolor:
                      datePreset === p.value ? T.brandDark : T.surfaceAlt,
                  },
                }}
              >
                {p.label}
              </Box>
            ))}
          </Box>

          <Button
            startIcon={<FilterIcon sx={{ fontSize: { xs: 12, sm: 14 } }} />}
            onClick={() => setFilterOpen(true)}
            sx={{
              bgcolor: T.surface,
              border: `1px solid ${T.border}`,
              color: T.inkMid,
              borderRadius: "10px",
              textTransform: "none",
              fontSize: { xs: "0.65rem", sm: "0.74rem" },
              fontWeight: 600,
              px: { xs: 1, sm: 1.5 },
              height: { xs: 30, sm: 34 },
              width: { xs: "100%", sm: "auto" },
              flexShrink: 0,
            }}
          >
            Filters
          </Button>

          <Button
            variant="contained"
            startIcon={
              generating ? (
                <CircularProgress size={13} color="inherit" />
              ) : (
                <RunIcon sx={{ fontSize: { xs: 12, sm: 14 } }} />
              )
            }
            onClick={handleGenerate}
            disabled={generating}
            sx={{
              background: `linear-gradient(135deg, ${T.brand} 0%, ${T.brandDark} 100%)`,
              borderRadius: "10px",
              textTransform: "none",
              fontSize: { xs: "0.65rem", sm: "0.74rem" },
              fontWeight: 700,
              px: { xs: 1.5, sm: 2 },
              height: { xs: 30, sm: 34 },
              width: { xs: "100%", sm: "auto" },
              flexShrink: 0,
              boxShadow: `0 2px 10px ${alpha(T.brand, 0.3)}`,
              "&:hover": {
                background: `linear-gradient(135deg, ${T.brandDark} 0%, ${T.brand} 100%)`,
              },
            }}
          >
            Generate
          </Button>
        </Stack>
      </Box>

      {/* Custom date range */}
      <Collapse in={datePreset === "custom"}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 1, sm: 1.5 },
            mb: 2,
            borderRadius: "12px",
            border: `1px solid ${T.brandLight}`,
            bgcolor: T.brandFaint,
            display: "flex",
            alignItems: { xs: "stretch", sm: "center" },
            gap: 1.5,
            flexWrap: "wrap",
            flexDirection: { xs: "column", sm: "row" },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: { xs: "100%", sm: "auto" } }}>
            <CalIcon sx={{ fontSize: 15, color: T.brand, flexShrink: 0 }} />
            <Typography
              sx={{
                fontSize: { xs: "0.65rem", sm: "0.74rem" },
                fontWeight: 600,
                color: T.brand,
              }}
            >
              Custom date range
            </Typography>
          </Box>
          <TextField
            type="date"
            size="small"
            label="From"
            value={customStart}
            onChange={(e) => setCustomStart(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{
              width: { xs: "100%", sm: 148 },
              bgcolor: T.surface,
              borderRadius: "8px",
            }}
          />
          <TextField
            type="date"
            size="small"
            label="To"
            value={customEnd}
            onChange={(e) => setCustomEnd(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{
              width: { xs: "100%", sm: 148 },
              bgcolor: T.surface,
              borderRadius: "8px",
            }}
          />
        </Paper>
      </Collapse>

      {/* Error banner */}
      {error && (
        <Alert
          severity="error"
          onClose={clearError}
          sx={{
            mb: 2,
            borderRadius: "12px",
            fontSize: { xs: "0.7rem", sm: "0.77rem" },
          }}
        >
          {error}
        </Alert>
      )}

      {/* Report type selector */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 1.5, sm: 2 },
          mb: 2.5,
          borderRadius: "14px",
          border: `1px solid ${T.border}`,
          bgcolor: T.surface,
        }}
      >
        <Typography
          sx={{
            fontSize: { xs: "0.55rem", sm: "0.63rem" },
            fontWeight: 700,
            color: T.inkLight,
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            mb: 1.2,
          }}
        >
          Report type
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.8 }}>
          {allowed.map((rt) => {
            const m = REPORT_META[rt];
            const Icon = m.icon;
            const sel = reportType === rt;
            return (
              <Box
                key={rt}
                onClick={() => setReportType(rt)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 0.5,
                  px: { xs: 0.8, sm: 1.3 },
                  py: { xs: 0.5, sm: 0.65 },
                  borderRadius: "10px",
                  cursor: "pointer",
                  border: `1.5px solid ${sel ? m.color : T.border}`,
                  bgcolor: sel ? alpha(m.color, 0.07) : T.surface,
                  transition: "all 0.15s",
                  flex: { xs: "1 1 calc(50% - 6px)", sm: "0 1 auto" },
                  minWidth: 0,
                  "&:hover": {
                    bgcolor: alpha(m.color, 0.06),
                    borderColor: m.color,
                  },
                }}
              >
                <Icon
                  sx={{
                    fontSize: { xs: 12, sm: 14 },
                    color: sel ? m.color : T.inkLight,
                    flexShrink: 0,
                  }}
                />
                <Typography
                  sx={{
                    fontSize: { xs: "0.68rem", sm: "0.8rem" },
                    fontWeight: sel ? 700 : 500,
                    color: sel ? m.color : T.inkMid,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {m.label}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Paper>

      {/* Main report panel */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: "14px",
          border: `1px solid ${T.border}`,
          bgcolor: T.surface,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            px: { xs: 1.5, sm: 2.5 },
            py: { xs: 1.5, sm: 2 },
            borderBottom: `1px solid ${T.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 1.5,
            background: `linear-gradient(to right, ${T.brandFaint}, ${T.surface})`,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
            <Box
              sx={{
                width: { xs: 30, sm: 36 },
                height: { xs: 30, sm: 36 },
                borderRadius: "10px",
                bgcolor: alpha(meta.color || T.brand, 0.1),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <MetaIcon
                sx={{
                  fontSize: { xs: 14, sm: 18 },
                  color: meta.color || T.brand,
                }}
              />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: "0.75rem", sm: "0.9rem" },
                  color: T.ink,
                }}
              >
                {meta.label || reportType} Report
              </Typography>
              <Typography
                sx={{
                  fontSize: { xs: "0.55rem", sm: "0.63rem" },
                  color: T.inkLight,
                }}
              >
                {reportData
                  ? `${reportData.data?.length ?? 0} records · ${new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`
                  : "Loading report data..."}
              </Typography>
            </Box>
          </Box>

          {reportData?.data?.length > 0 && (
            <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
              <Tooltip title="Export PDF">
                <IconButton
                  onClick={() => handleExport("pdf")}
                  disabled={exporting}
                  size="small"
                  sx={{
                    bgcolor: T.redBg,
                    borderRadius: "8px",
                    p: { xs: 0.5, sm: 0.75 },
                    "&:hover": { bgcolor: alpha(T.red, 0.18) },
                  }}
                >
                  {exporting ? (
                    <CircularProgress size={14} />
                  ) : (
                    <PdfIcon
                      sx={{ fontSize: { xs: 13, sm: 15 }, color: T.red }}
                    />
                  )}
                </IconButton>
              </Tooltip>
              <Tooltip title="Export Excel">
                <IconButton
                  onClick={() => handleExport("excel")}
                  disabled={exporting}
                  size="small"
                  sx={{
                    bgcolor: T.greenBg,
                    borderRadius: "8px",
                    p: { xs: 0.5, sm: 0.75 },
                    "&:hover": { bgcolor: alpha(T.green, 0.18) },
                  }}
                >
                  <ExcelIcon
                    sx={{ fontSize: { xs: 13, sm: 15 }, color: T.green }}
                  />
                </IconButton>
              </Tooltip>
            </Stack>
          )}
        </Box>

        <Box sx={{ p: { xs: 1.5, sm: 2.5 } }}>
          {loading && !reportData ? (
            <Box sx={{ py: 4, display: "flex", justifyContent: "center" }}>
              <CircularProgress />
            </Box>
          ) : !reportData ? (
            <EmptyState
              icon={MetaIcon}
              title={`Loading ${meta.label || reportType} report`}
              desc="Please wait while we fetch your data..."
            />
          ) : (
            <>
              {/* Summary KPIs */}
              {Object.keys(reportData.summary || {}).length > 0 && (
                <Grid container spacing={1.5} mb={2.5}>
                  {Object.entries(reportData.summary)
                    .filter(([, v]) => typeof v !== "object" && v !== null)
                    .slice(0, 6)
                    .map(([k, v]) => (
                      <Grid item xs={6} sm={4} md={2} key={k}>
                        <StatCard
                          label={k.replace(/([A-Z])/g, " $1").trim()}
                          value={String(v)}
                          loading={false}
                          small
                        />
                      </Grid>
                    ))}
                </Grid>
              )}
              {renderTable()}
            </>
          )}
        </Box>
      </Paper>

      {/* Filter Dialog - Mobile Responsive */}
      <Dialog
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        maxWidth="xs"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : "18px",
            border: `1px solid ${T.border}`,
          },
        }}
      >
        <DialogTitle sx={{ pb: 0.1, pt: { xs: 2, sm: 1.5 } }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: "0.85rem", sm: "0.95rem" },
                  color: T.ink,
                }}
              >
                Report filters
              </Typography>
              <Typography
                sx={{
                  fontSize: { xs: "0.6rem", sm: "0.66rem" },
                  color: T.inkLight,
                }}
              >
                Narrow results before generating
              </Typography>
            </Box>
            <IconButton
              size="small"
              onClick={() => setFilterOpen(false)}
              sx={{ borderRadius: "8px", flexShrink: 0 }}
            >
              <CloseIcon sx={{ fontSize: 17 }} />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <FormControl size="small" fullWidth sx={{ mt: 1.5 }}>
              <InputLabel sx={{ fontSize: "0.82rem" }}>Report type</InputLabel>
              <Select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                label="Report type"
              >
                {allowed.map((rt) => (
                  <MenuItem key={rt} value={rt}>
                    {REPORT_META[rt]?.label || rt}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" fullWidth>
              <InputLabel sx={{ fontSize: "0.82rem" }}>Date range</InputLabel>
              <Select
                value={datePreset}
                onChange={(e) => setDatePreset(e.target.value)}
                label="Date range"
              >
                {DATE_PRESETS.map((p) => (
                  <MenuItem key={p.value} value={p.value}>
                    {p.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {datePreset === "custom" && (
              <>
                <TextField
                  size="small"
                  type="date"
                  label="Start date"
                  fullWidth
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  size="small"
                  type="date"
                  label="End date"
                  fullWidth
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </>
            )}

            {/* Conditional filters */}
            {reportType === "clients" && isSuperAdmin && (
              <>
                <FormControl size="small" fullWidth>
                  <InputLabel sx={{ fontSize: "0.82rem" }}>Plan</InputLabel>
                  <Select
                    value={filters.membershipPlan || ""}
                    onChange={(e) =>
                      setFilters((p) => ({
                        ...p,
                        membershipPlan: e.target.value,
                      }))
                    }
                    label="Plan"
                  >
                    <MenuItem value="">All</MenuItem>
                    {["free", "standard", "premium", "enterprise"].map((p) => (
                      <MenuItem
                        key={p}
                        value={p}
                        sx={{ textTransform: "capitalize" }}
                      >
                        {p}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small" fullWidth>
                  <InputLabel sx={{ fontSize: "0.82rem" }}>Status</InputLabel>
                  <Select
                    value={filters.status || ""}
                    onChange={(e) =>
                      setFilters((p) => ({ ...p, status: e.target.value }))
                    }
                    label="Status"
                  >
                    <MenuItem value="">All</MenuItem>
                    {["active", "inactive", "suspended"].map((s) => (
                      <MenuItem
                        key={s}
                        value={s}
                        sx={{ textTransform: "capitalize" }}
                      >
                        {s}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </>
            )}

            {reportType === "assets" && (
              <>
                <FormControl size="small" fullWidth>
                  <InputLabel sx={{ fontSize: "0.82rem" }}>Status</InputLabel>
                  <Select
                    value={filters.status || ""}
                    onChange={(e) =>
                      setFilters((p) => ({ ...p, status: e.target.value }))
                    }
                    label="Status"
                  >
                    <MenuItem value="">All</MenuItem>
                    {["Active", "Maintenance", "Decommissioned", "Retired"].map(
                      (s) => (
                        <MenuItem key={s} value={s}>
                          {s}
                        </MenuItem>
                      ),
                    )}
                  </Select>
                </FormControl>
                <AssetSearchField
                  label="Search"
                  placeholder="Name, tag, serial..."
                  value={filters.search || ""}
                  onChange={(e) =>
                    setFilters((p) => ({ ...p, search: e.target.value }))
                  }
                  onClear={() => setFilters((p) => ({ ...p, search: "" }))}
                />
              </>
            )}

            {reportType === "team" && (
              <>
                <FormControl size="small" fullWidth>
                  <InputLabel sx={{ fontSize: "0.82rem" }}>Role</InputLabel>
                  <Select
                    value={filters.teamRole || ""}
                    onChange={(e) =>
                      setFilters((p) => ({ ...p, teamRole: e.target.value }))
                    }
                    label="Role"
                  >
                    <MenuItem value="">All</MenuItem>
                    {[
                      "inspector",
                      "senior_inspector",
                      "lead_inspector",
                      "supervisor",
                    ].map((r) => (
                      <MenuItem key={r} value={r}>
                        {r.replace(/_/g, " ")}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small" fullWidth>
                  <InputLabel sx={{ fontSize: "0.82rem" }}>Status</InputLabel>
                  <Select
                    value={filters.status || ""}
                    onChange={(e) =>
                      setFilters((p) => ({ ...p, status: e.target.value }))
                    }
                    label="Status"
                  >
                    <MenuItem value="">All</MenuItem>
                    {["active", "inactive", "on_leave"].map((s) => (
                      <MenuItem key={s} value={s}>
                        {s.replace(/_/g, " ")}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </>
            )}

            {(reportType === "assignments" || reportType === "inspections") && (
              <>
                <FormControl size="small" fullWidth>
                  <InputLabel sx={{ fontSize: "0.82rem" }}>Status</InputLabel>
                  <Select
                    value={filters.status || ""}
                    onChange={(e) =>
                      setFilters((p) => ({ ...p, status: e.target.value }))
                    }
                    label="Status"
                  >
                    <MenuItem value="">All</MenuItem>
                    {[
                      "pending",
                      "in_progress",
                      "submitted",
                      "completed",
                      "approved",
                      "rejected",
                    ].map((s) => (
                      <MenuItem key={s} value={s}>
                        {s.replace(/_/g, " ")}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small" fullWidth>
                  <InputLabel sx={{ fontSize: "0.82rem" }}>Priority</InputLabel>
                  <Select
                    value={filters.priority || ""}
                    onChange={(e) =>
                      setFilters((p) => ({ ...p, priority: e.target.value }))
                    }
                    label="Priority"
                  >
                    <MenuItem value="">All</MenuItem>
                    {["low", "medium", "high", "critical"].map((p) => (
                      <MenuItem
                        key={p}
                        value={p}
                        sx={{ textTransform: "capitalize" }}
                      >
                        {p}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </>
            )}
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{
            p: { xs: 1.5, sm: 2 },
            pt: { xs: 1, sm: 1 },
            gap: 1,
            flexWrap: "wrap",
          }}
        >
          <Button
            onClick={() => setFilters({})}
            sx={{
              textTransform: "none",
              fontSize: { xs: "0.7rem", sm: "0.75rem" },
              color: T.inkLight,
            }}
          >
            Clear all
          </Button>
          <Button
            onClick={() => setFilterOpen(false)}
            sx={{
              textTransform: "none",
              fontSize: { xs: "0.7rem", sm: "0.75rem" },
              color: T.inkSub,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={generating}
            variant="contained"
            sx={{
              background: `linear-gradient(135deg, ${T.brand}, ${T.brandDark})`,
              borderRadius: "10px",
              textTransform: "none",
              fontSize: { xs: "0.7rem", sm: "0.77rem" },
              fontWeight: 700,
              px: { xs: 2, sm: 2.5 },
              flex: { xs: "1", sm: "auto" },
            }}
          >
            {generating ? (
              <CircularProgress size={14} color="inherit" />
            ) : (
              "Generate"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={toast.sev}
          variant="filled"
          onClose={() => setToast((p) => ({ ...p, open: false }))}
          sx={{
            borderRadius: "12px",
            fontSize: { xs: "0.7rem", sm: "0.77rem" },
          }}
        >
          {toast.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ReportsDashboard;

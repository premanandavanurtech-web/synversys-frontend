import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TablePagination,
  IconButton,
  CircularProgress,
  Alert,
  Snackbar,
  TextField,
  InputAdornment,
  Dialog,
  DialogContent,
  Button,
  Avatar,
  Stack,
  Tooltip,
  useMediaQuery,
  useTheme,
  alpha,
  Divider,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  LinearProgress,
  Skeleton,
  Chip,
  Paper,
  Card,
  CardContent,
} from "@mui/material";
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Message as MessageIcon,
  Clear as ClearIcon,
  FilterList as FilterIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Archive as ArchiveIcon,
  KeyboardArrowDown as ArrowDownIcon,
  Reply as ReplyIcon,
  Download as DownloadIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  GridOn as CsvIcon,
  DeleteSweep as BulkDeleteIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import { useContactInquiry } from "../context/InquiryContext";
import { useAuth } from "../context/AuthContexts";
import AssetSearchField from "../components/AssetSearchField";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

/* ─────────────────────────────────────────────────────
 * Design tokens
 * ───────────────────────────────────────────────────── */
const C = {
  ink: "#0d1117",
  inkMid: "#374151",
  inkSoft: "#6b7280",
  inkMuted: "#9ca3af",
  line: "#e5e7eb",
  lineSoft: "#f3f4f6",
  surface: "#ffffff",
  canvas: "#f9fafb",
  accent: "#0f4c61",
  accentMid: "#1a6680",
  accentGlow: "rgba(15,76,97,0.08)",
  green: "#059669",
  greenBg: "#ecfdf5",
  amber: "#d97706",
  amberBg: "#fffbeb",
  red: "#dc2626",
  redBg: "#fef2f2",
  blue: "#2563eb",
  blueBg: "#eff6ff",
  radius: "10px",
  radiusLg: "14px",
  border: "0.5px solid #e5e7eb",
  mono: "'JetBrains Mono','Fira Code',monospace",
};

/* ─────────────────────────────────────────────────────
 * Age-based inquiry status
 * ───────────────────────────────────────────────────── */
function inquiryAge(dateStr) {
  const days = Math.floor((Date.now() - new Date(dateStr)) / 86_400_000);
  if (days <= 7)
    return { label: "New", days, color: C.green, bg: C.greenBg, Icon: CheckCircleIcon };
  if (days <= 30)
    return { label: "Pending", days, color: C.amber, bg: C.amberBg, Icon: ScheduleIcon };
  return { label: "Archived", days, color: C.inkMuted, bg: C.lineSoft, Icon: ArchiveIcon };
}

function AgeBadge({ date }) {
  const s = inquiryAge(date);
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: "3px",
        px: "7px",
        py: "2px",
        borderRadius: "6px",
        bgcolor: s.bg,
        color: s.color,
        fontSize: 11,
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      <s.Icon sx={{ fontSize: 10 }} />
      {s.label}
    </Box>
  );
}

/* ─────────────────────────────────────────────────────
 * Stat card
 * ───────────────────────────────────────────────────── */
function StatCard({ label, value, icon: Icon, color, loading }) {
  if (loading)
    return <Skeleton variant="rectangular" height={84} sx={{ borderRadius: C.radius, flex: 1 }} />;
  return (
    <Box
      sx={{
        flex: 1,
        minWidth: 140,
        bgcolor: C.surface,
        border: C.border,
        borderRadius: C.radius,
        p: "14px 16px",
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        transition: "box-shadow 0.15s",
        "&:hover": { boxShadow: "0 2px 12px rgba(0,0,0,0.06)" },
      }}
    >
      <Box
        sx={{
          width: 38,
          height: 38,
          borderRadius: "9px",
          bgcolor: alpha(color, 0.1),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color,
          flexShrink: 0,
        }}
      >
        <Icon sx={{ fontSize: 18 }} />
      </Box>
      <Box>
        <Typography fontSize={10.5} color={C.inkMuted} fontWeight={500} lineHeight={1.2} mb={0.25}>
          {label}
        </Typography>
        <Typography fontSize={22} fontWeight={700} color={C.ink} lineHeight={1.2}>
          {(value ?? 0).toLocaleString()}
        </Typography>
      </Box>
    </Box>
  );
}

/* ─────────────────────────────────────────────────────
 * Export helpers
 * ───────────────────────────────────────────────────── */
function buildExportRows(list) {
  const header = ["#", "Full Name", "Email", "Phone", "Message", "Status", "Submitted At"];
  const rows = list.map((inq, i) => {
    const s = inquiryAge(inq.createdAt);
    return [
      i + 1,
      inq.fullName || "",
      inq.email || "",
      inq.phone || "",
      inq.message || "",
      s.label,
      inq.createdAt ? new Date(inq.createdAt).toLocaleString() : "",
    ];
  });
  return { header, rows };
}

function downloadCSV(list, filename) {
  const { header, rows } = buildExportRows(list);
  const esc = (v) => `"${String(v).replace(/"/g, '""')}"`;
  const csv = [header, ...rows].map((r) => r.map(esc).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadExcel(list, filename) {
  const { header, rows } = buildExportRows(list);
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
  ws["!cols"] = [{ wch: 5 }, { wch: 22 }, { wch: 28 }, { wch: 14 }, { wch: 55 }, { wch: 10 }, { wch: 22 }];
  XLSX.utils.book_append_sheet(wb, ws, "Inquiries");
  XLSX.writeFile(wb, filename);
}

function downloadPDF(list, filename) {
  const { header, rows } = buildExportRows(list);
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(13, 17, 23);
  doc.text("Contact Inquiries", 40, 44);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(107, 114, 128);
  doc.text(`Generated ${new Date().toLocaleString()}  ·  ${list.length} records`, 40, 60);
  autoTable(doc, {
    head: [header],
    body: rows,
    startY: 74,
    styles: { fontSize: 8, cellPadding: 5, overflow: "linebreak", textColor: [30, 30, 30] },
    headStyles: { fillColor: [15, 76, 97], textColor: 255, fontStyle: "bold", fontSize: 8 },
    alternateRowStyles: { fillColor: [249, 250, 251] },
    columnStyles: { 0: { cellWidth: 22 }, 4: { cellWidth: 200 }, 6: { cellWidth: 90 } },
  });
  doc.save(filename);
}

function ExportButton({ list, disabled }) {
  const [anchor, setAnchor] = useState(null);
  const [busy, setBusy] = useState(false);
  const date = new Date().toISOString().split("T")[0];

  const run = async (fn, name) => {
    setAnchor(null);
    setBusy(true);
    try { fn(list, name); } finally { setBusy(false); }
  };

  return (
    <>
      <Button
        size="small"
        variant="outlined"
        startIcon={busy ? <CircularProgress size={11} /> : <DownloadIcon sx={{ fontSize: 13 }} />}
        endIcon={<ArrowDownIcon sx={{ fontSize: 13 }} />}
        onClick={(e) => setAnchor(e.currentTarget)}
        disabled={disabled || busy || list.length === 0}
        sx={{ fontSize: 11, fontWeight: 600, textTransform: "none", borderRadius: "8px" }}
        aria-haspopup="true"
      >
        Export
      </Button>
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        PaperProps={{ elevation: 0, sx: { border: C.border, borderRadius: C.radius, mt: 0.5, minWidth: 170 } }}
      >
        {[
          { label: "Export CSV", Icon: CsvIcon, color: C.green, action: () => run(downloadCSV, `inquiries-${date}.csv`) },
          { label: "Export Excel", Icon: ExcelIcon, color: C.blue, action: () => run(downloadExcel, `inquiries-${date}.xlsx`) },
          { label: "Export PDF", Icon: PdfIcon, color: C.red, action: () => run(downloadPDF, `inquiries-${date}.pdf`) },
        ].map(({ label, Icon, color, action }) => (
          <MenuItem key={label} onClick={action} sx={{ fontSize: 12, py: "8px" }}>
            <ListItemIcon sx={{ minWidth: 30 }}>
              <Icon sx={{ fontSize: 16, color }} />
            </ListItemIcon>
            <ListItemText primaryTypographyProps={{ fontSize: 12 }}>{label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

/* ─────────────────────────────────────────────────────
 * View dialog
 * ───────────────────────────────────────────────────── */
function ViewDialog({ open, onClose, inquiry, onDelete }) {
  if (!inquiry) return null;
  const s = inquiryAge(inquiry.createdAt);

  const Field = ({ icon: Icon, label, value }) => (
    <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
      <Box sx={{ mt: "1px", color: C.inkMuted, flexShrink: 0 }}>
        <Icon sx={{ fontSize: 15 }} />
      </Box>
      <Box>
        <Typography fontSize={10.5} color={C.inkMuted} fontWeight={500} textTransform="uppercase" letterSpacing={0.5} mb={0.25}>
          {label}
        </Typography>
        <Typography fontSize={13} color={C.ink}>{value || "—"}</Typography>
      </Box>
    </Box>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ elevation: 0, sx: { borderRadius: C.radiusLg, border: C.border, overflow: "hidden" } }}
    >
      <Box sx={{ px: 3, pt: 3, pb: 2.5, borderBottom: C.border, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.75 }}>
          <Avatar sx={{ width: 44, height: 44, bgcolor: alpha(C.accent, 0.1), color: C.accent, fontSize: 16, fontWeight: 700 }}>
            {(inquiry.fullName?.[0] || "U").toUpperCase()}
          </Avatar>
          <Box>
            <Typography fontSize={15} fontWeight={700} color={C.ink} lineHeight={1.2}>{inquiry.fullName}</Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
              <AgeBadge date={inquiry.createdAt} />
              {inquiry._id && (
                <Typography fontSize={10.5} color={C.inkMuted} fontFamily={C.mono}>
                  #{inquiry._id.slice(-8).toUpperCase()}
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: C.inkMuted, mt: "-4px" }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
            <Field icon={EmailIcon} label="Email" value={inquiry.email} />
            <Field icon={PhoneIcon} label="Phone" value={inquiry.phone} />
            <Field icon={CalendarIcon} label="Submitted" value={inquiry.createdAt ? new Date(inquiry.createdAt).toLocaleString() : "—"} />
            {inquiry.updatedAt && inquiry.updatedAt !== inquiry.createdAt && (
              <Field icon={ScheduleIcon} label="Updated" value={new Date(inquiry.updatedAt).toLocaleString()} />
            )}
          </Box>
          <Divider sx={{ borderColor: C.lineSoft }} />
          <Box>
            <Typography fontSize={10.5} color={C.inkMuted} fontWeight={500} textTransform="uppercase" letterSpacing={0.5} mb={1}>
              Message
            </Typography>
            <Box sx={{ bgcolor: C.canvas, border: C.border, borderRadius: "8px", p: "12px 14px" }}>
              <Typography fontSize={13} color={C.inkMid} lineHeight={1.7}>
                {inquiry.message || "No message provided."}
              </Typography>
            </Box>
          </Box>
        </Stack>
      </DialogContent>

      <Box sx={{ px: 3, py: 2, borderTop: C.border, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
        <Button size="small" color="error" startIcon={<DeleteIcon sx={{ fontSize: 14 }} />} onClick={onDelete} sx={{ fontSize: 12, textTransform: "none" }}>
          Delete
        </Button>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button size="small" variant="outlined" onClick={onClose} sx={{ fontSize: 12, textTransform: "none", borderRadius: "8px" }}>
            Close
          </Button>
          <Button
            size="small"
            variant="contained"
            disableElevation
            startIcon={<ReplyIcon sx={{ fontSize: 14 }} />}
            href={`mailto:${inquiry.email}`}
            sx={{ fontSize: 12, textTransform: "none", borderRadius: "8px", bgcolor: C.accent, "&:hover": { bgcolor: C.accentMid } }}
          >
            Reply
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
}

/* ─────────────────────────────────────────────────────
 * Delete confirm dialog
 * ───────────────────────────────────────────────────── */
function DeleteDialog({ open, onClose, onConfirm, name, bulk, count, loading }) {
  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ elevation: 0, sx: { borderRadius: C.radiusLg, border: C.border, overflow: "hidden" } }}
    >
      <Box sx={{ px: 3, pt: 3, pb: 0 }}>
        <Box sx={{ width: 44, height: 44, borderRadius: "11px", bgcolor: alpha(C.red, 0.1), display: "flex", alignItems: "center", justifyContent: "center", mb: 2 }}>
          <WarningIcon sx={{ fontSize: 22, color: C.red }} />
        </Box>
        <Typography fontSize={15} fontWeight={700} color={C.ink} mb={1}>
          {bulk ? `Delete ${count} inquiries?` : "Delete inquiry?"}
        </Typography>
        <Typography fontSize={13} color={C.inkSoft} mb={2.5} lineHeight={1.6}>
          {bulk
            ? `This will permanently remove ${count} selected inquiries. This action cannot be undone.`
            : `You're about to permanently delete the inquiry from "${name}". This cannot be undone.`}
        </Typography>
      </Box>
      <Box sx={{ px: 3, pb: 3, display: "flex", justifyContent: "flex-end", gap: 1 }}>
        <Button size="small" variant="outlined" onClick={onClose} disabled={loading} sx={{ fontSize: 12, textTransform: "none", borderRadius: "8px" }}>
          Cancel
        </Button>
        <Button
          size="small"
          variant="contained"
          disableElevation
          color="error"
          onClick={onConfirm}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={12} color="inherit" /> : <DeleteIcon sx={{ fontSize: 14 }} />}
          sx={{ fontSize: 12, textTransform: "none", borderRadius: "8px" }}
        >
          {loading ? "Deleting…" : "Delete"}
        </Button>
      </Box>
    </Dialog>
  );
}

/* ─────────────────────────────────────────────────────
 * Mobile Inquiry Card
 * ───────────────────────────────────────────────────── */
function InquiryCard({ inq, selected, onToggle, onView, onDelete, actionLoading }) {
  const isSelected = selected.has(inq._id);

  return (
    <Card
      sx={{
        mb: 1.25,
        borderRadius: "12px",
        border: `0.5px solid ${isSelected ? C.accent : C.line}`,
        bgcolor: isSelected ? alpha(C.accent, 0.025) : C.surface,
        boxShadow: isSelected
          ? `0 0 0 2px ${alpha(C.accent, 0.15)}`
          : "0 1px 3px rgba(0,0,0,0.05)",
        transition: "box-shadow 0.15s, border-color 0.15s",
      }}
    >
      <CardContent sx={{ p: "12px 14px !important" }}>
        {/* Top row: checkbox + avatar/name + actions */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.25 }}>
          <Checkbox
            size="small"
            checked={isSelected}
            onChange={() => onToggle(inq._id)}
            sx={{ p: 0, flexShrink: 0, color: C.inkMuted, "&.Mui-checked": { color: C.accent } }}
          />
          <Avatar
            sx={{
              width: 32,
              height: 32,
              fontSize: 13,
              fontWeight: 700,
              bgcolor: alpha(C.accent, 0.1),
              color: C.accent,
              flexShrink: 0,
            }}
          >
            {(inq.fullName?.[0] || "U").toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography fontSize={13} fontWeight={700} color={C.ink} noWrap>
              {inq.fullName}
            </Typography>
            <AgeBadge date={inq.createdAt} />
          </Box>
          {/* Action buttons */}
          <Box sx={{ display: "flex", gap: 0.5, flexShrink: 0 }}>
            <Tooltip title="View">
              <IconButton
                size="small"
                onClick={() => onView(inq._id)}
                sx={{ width: 28, height: 28, borderRadius: "7px", bgcolor: alpha(C.accent, 0.07), color: C.accent }}
              >
                <VisibilityIcon sx={{ fontSize: 13 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton
                size="small"
                onClick={() => onDelete(inq._id, inq.fullName)}
                sx={{ width: 28, height: 28, borderRadius: "7px", bgcolor: alpha(C.red, 0.07), color: C.red }}
              >
                <DeleteIcon sx={{ fontSize: 13 }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Divider sx={{ borderColor: C.lineSoft, mb: 1.25 }} />

        {/* Detail rows */}
        <Stack spacing={0.75}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <EmailIcon sx={{ fontSize: 12, color: C.inkMuted, flexShrink: 0 }} />
            <Typography fontSize={12} color={C.inkSoft} noWrap>{inq.email || "—"}</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <PhoneIcon sx={{ fontSize: 12, color: C.inkMuted, flexShrink: 0 }} />
            <Typography fontSize={12} color={C.inkSoft}>{inq.phone || "—"}</Typography>
          </Box>
          {inq.message && (
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
              <MessageIcon sx={{ fontSize: 12, color: C.inkMuted, flexShrink: 0, mt: "2px" }} />
              <Typography fontSize={12} color={C.inkSoft} sx={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}>
                {inq.message}
              </Typography>
            </Box>
          )}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CalendarIcon sx={{ fontSize: 12, color: C.inkMuted, flexShrink: 0 }} />
            <Typography fontSize={11.5} color={C.inkMuted} fontFamily={C.mono}>
              {inq.createdAt
                ? new Date(inq.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                : "—"}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

/* ─────────────────────────────────────────────────────
 * Mobile skeleton cards
 * ───────────────────────────────────────────────────── */
function SkeletonCards({ count = 5 }) {
  return Array.from({ length: count }).map((_, i) => (
    <Card key={i} sx={{ mb: 1.25, borderRadius: "12px", border: `0.5px solid ${C.line}` }}>
      <CardContent sx={{ p: "12px 14px !important" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.25 }}>
          <Skeleton variant="circular" width={32} height={32} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="55%" height={16} />
            <Skeleton variant="text" width="30%" height={14} />
          </Box>
        </Box>
        <Skeleton variant="text" width="80%" />
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="text" width="70%" />
      </CardContent>
    </Card>
  ));
}

/* ─────────────────────────────────────────────────────
 * Main component
 * ───────────────────────────────────────────────────── */
const SEARCH_FIELDS = [
  { value: "name", label: "Name", Icon: PersonIcon },
  { value: "email", label: "Email", Icon: EmailIcon },
  { value: "phone", label: "Phone", Icon: PhoneIcon },
  { value: "message", label: "Message", Icon: MessageIcon },
];

const AGE_FILTERS = [
  { value: "all", label: "All" },
  { value: "new", label: "New (≤7d)" },
  { value: "pending", label: "Pending" },
];

const cellSx = {
  fontSize: 12,
  py: "11px",
  px: "14px",
  color: C.ink,
  borderBottom: `0.5px solid ${C.lineSoft}`,
};
const headCellSx = {
  ...cellSx,
  fontSize: 11,
  fontWeight: 600,
  color: C.inkMuted,
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  bgcolor: C.canvas,
  py: "9px",
  borderBottom: `0.5px solid ${C.line}`,
};

export default function ContactInquiries() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { isAuthenticated } = useAuth();

  const {
    inquiries,
    selectedInquiry,
    pagination,
    loading,
    actionLoading,
    error,
    fetchInquiries,
    fetchInquiryById,
    deleteInquiry,
    bulkDeleteInquiries,
    clearSelectedInquiry,
    clearError,
  } = useContactInquiry();

  /* ── Local UI state ── */
  const [search, setSearch] = useState("");
  const [searchField, setSearchField] = useState("name");
  const [ageFilter, setAgeFilter] = useState("all");
  const [sortCol, setSortCol] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [selected, setSelected] = useState(new Set());
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [sfAnchor, setSfAnchor] = useState(null);

  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const toast = (message, severity = "success") => setSnackbar({ open: true, message, severity });

  useEffect(() => {
    if (isAuthenticated) fetchInquiries(1, 50);
  }, [isAuthenticated]); // eslint-disable-line

  /* ── Filtered + sorted list ── */
  const filtered = useMemo(() => {
    let list = [...inquiries];
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter((i) => {
        switch (searchField) {
          case "email": return i.email?.toLowerCase().includes(q);
          case "phone": return i.phone?.toLowerCase().includes(q);
          case "message": return i.message?.toLowerCase().includes(q);
          default: return i.fullName?.toLowerCase().includes(q);
        }
      });
    }
    if (ageFilter !== "all") {
      list = list.filter((i) => {
        const s = inquiryAge(i.createdAt);
        return s.label.toLowerCase() === ageFilter;
      });
    }
    list.sort((a, b) => {
      let av = a[sortCol], bv = b[sortCol];
      if (sortCol === "createdAt") { av = new Date(av); bv = new Date(bv); }
      return sortDir === "asc" ? (av > bv ? 1 : -1) : av < bv ? 1 : -1;
    });
    return list;
  }, [inquiries, search, searchField, ageFilter, sortCol, sortDir]);

  /* ── Stats ── */
  const stats = useMemo(() => {
    const now = Date.now();
    const days = (d) => Math.floor((now - new Date(d)) / 86_400_000);
    return {
      total: inquiries.length,
      new: inquiries.filter((i) => days(i.createdAt) <= 7).length,
      pending: inquiries.filter((i) => { const d = days(i.createdAt); return d > 7 && d <= 30; }).length,
      archived: inquiries.filter((i) => days(i.createdAt) > 30).length,
    };
  }, [inquiries]);

  const doSort = (col) => {
    setSortDir(sortCol === col && sortDir === "asc" ? "desc" : "asc");
    setSortCol(col);
  };

  const pageSlice = useMemo(
    () => filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filtered, page, rowsPerPage],
  );

  /* ── Selection ── */
  const allSelected = pageSlice.length > 0 && pageSlice.every((i) => selected.has(i._id));
  const toggleAll = () => {
    const next = new Set(selected);
    if (allSelected) pageSlice.forEach((i) => next.delete(i._id));
    else pageSlice.forEach((i) => next.add(i._id));
    setSelected(next);
  };
  const toggleOne = (id) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  /* ── View ── */
  const handleView = async (id) => {
    const res = await fetchInquiryById(id);
    if (res.success) setViewOpen(true);
    else toast(res.error, "error");
  };

  /* ── Delete ── */
  const promptDelete = (id, name) => {
    setDeleteTarget({ id, name });
    setDeleteOpen(true);
  };
  const handleDeleteFromView = () => {
    if (!selectedInquiry) return;
    setViewOpen(false);
    promptDelete(selectedInquiry._id, selectedInquiry.fullName);
  };
  const handleConfirmDelete = async () => {
    let res;
    if (deleteTarget) {
      res = await deleteInquiry(deleteTarget.id);
    } else {
      res = await bulkDeleteInquiries([...selected]);
      setSelected(new Set());
    }
    setDeleteOpen(false);
    setDeleteTarget(null);
    toast(res.success ? res.message : res.error, res.success ? "success" : "error");
  };

  const resetFilters = () => {
    setSearch("");
    setAgeFilter("all");
    setSearchField("name");
    setPage(0);
  };

  if (!isAuthenticated) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography color={C.inkSoft}>Please log in to access this page.</Typography>
      </Box>
    );
  }

  const curSearchField = SEARCH_FIELDS.find((f) => f.value === searchField);

  return (
    <Box sx={{ p: { xs: 2, sm: 2.5, md: 3 }, bgcolor: C.canvas, minHeight: "100vh" }}>

      {/* ── Page header ── */}
      <Box sx={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 1.5, mb: 2.5 }}>
        <Box>
          <Typography fontSize={{ xs: 18, sm: 20, md: 22 }} fontWeight={800} color={C.ink} letterSpacing="-0.02em" lineHeight={1.2}>
            Contact Inquiries
          </Typography>
          <Typography fontSize={12} color={C.inkMuted} mt={0.4}>
            Manage and respond to customer messages
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <ExportButton list={filtered} disabled={loading} />
          <Tooltip title="Refresh">
            <IconButton
              onClick={() => { fetchInquiries(1, 50); toast("Refreshed"); }}
              disabled={loading}
              sx={{ border: C.border, borderRadius: "9px", bgcolor: C.surface, "&:hover": { bgcolor: alpha(C.accent, 0.06) } }}
            >
              <RefreshIcon sx={{ fontSize: 17, color: C.inkSoft }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* ── Stats ── */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.25, mb: 2 }}>
        {[
          { label: "Total", value: stats.total, icon: MessageIcon, color: C.accent },
          { label: "New", value: stats.new, icon: CheckCircleIcon, color: C.green },
          { label: "Pending", value: stats.pending, icon: ScheduleIcon, color: C.amber },
        ].map((s) => (
          <StatCard key={s.label} {...s} loading={loading && inquiries.length === 0} />
        ))}
      </Box>

      {/* ── Toolbar ── */}
      <Box sx={{ bgcolor: C.surface, border: C.border, borderRadius: C.radius, p: { xs: "10px 12px", sm: "12px 16px" }, mb: 1.5 }}>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, alignItems: "center" }}>
          {/* Search field selector + input */}
          <Box sx={{ display: "flex", gap: 1, flexGrow: 1, maxWidth: "100%", alignItems: "center" }}>
            <Button
              size="small"
              onClick={(e) => setSfAnchor(e.currentTarget)}
              endIcon={<ArrowDownIcon sx={{ fontSize: 12 }} />}
              sx={{
                px: 3.25, py: 0.75, fontSize: 11, fontWeight: 600, textTransform: "none",
                color: C.inkSoft, border: C.border, borderRadius: "10px", bgcolor: "#f8fafc",
                whiteSpace: "nowrap", gap: 0.5, minWidth: 0,
                "&:hover": { bgcolor: alpha(C.accent, 0.06) },
              }}
            >
              {curSearchField && <curSearchField.Icon sx={{ fontSize: 13 }} />}
              {curSearchField?.label}
            </Button>
            <AssetSearchField
              placeholder={`Search by ${curSearchField?.label.toLowerCase()}...`}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              onClear={() => { setSearch(""); setPage(0); }}
              sx={{ width: { xs: "100%", md: "780px" } }}
              inputSx={{ fontSize: 12 }}
            />
          </Box>

          {/* Search field menu */}
          <Menu
            anchorEl={sfAnchor}
            open={Boolean(sfAnchor)}
            onClose={() => setSfAnchor(null)}
            PaperProps={{ elevation: 0, sx: { border: C.border, borderRadius: C.radius, mt: 0.5, minWidth: 150 } }}
          >
            {SEARCH_FIELDS.map(({ value, label, Icon }) => (
              <MenuItem
                key={value}
                selected={searchField === value}
                onClick={() => { setSearchField(value); setSfAnchor(null); }}
                sx={{ fontSize: 12, py: "7px", gap: 1 }}
              >
                <Icon sx={{ fontSize: 14, color: searchField === value ? C.accent : C.inkMuted }} />
                {label}
              </MenuItem>
            ))}
          </Menu>

          {/* Age filter chips */}
          <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
            {AGE_FILTERS.map((f) => (
              <Box
                key={f.value}
                onClick={() => { setAgeFilter(f.value); setPage(0); }}
                sx={{
                  px: "10px", py: "4px", borderRadius: "7px", fontSize: 11, fontWeight: 600,
                  cursor: "pointer",
                  bgcolor: ageFilter === f.value ? C.accent : C.canvas,
                  color: ageFilter === f.value ? "#fff" : C.inkSoft,
                  border: ageFilter === f.value ? `0.5px solid ${C.accent}` : C.border,
                  transition: "all 0.12s",
                  "&:hover": { bgcolor: ageFilter === f.value ? C.accentMid : alpha(C.accent, 0.07) },
                }}
              >
                {f.label}
              </Box>
            ))}
          </Box>

          {/* Bulk delete */}
          {selected.size > 0 && (
            <Button
              size="small"
              color="error"
              variant="outlined"
              startIcon={<BulkDeleteIcon sx={{ fontSize: 14 }} />}
              onClick={() => { setDeleteTarget(null); setDeleteOpen(true); }}
              sx={{ fontSize: 11, textTransform: "none", borderRadius: "8px", ml: "auto" }}
            >
              Delete {selected.size} selected
            </Button>
          )}

          {/* Clear filters */}
          {(search || ageFilter !== "all") && (
            <Button
              size="small"
              startIcon={<ClearIcon sx={{ fontSize: 12 }} />}
              onClick={resetFilters}
              sx={{ fontSize: 11, textTransform: "none", color: C.inkMuted, ml: selected.size > 0 ? 0 : "auto" }}
            >
              Clear
            </Button>
          )}
        </Box>
      </Box>

      {/* ── Result count ── */}
      <Typography fontSize={11.5} color={C.inkMuted} mb={1.25}>
        Showing <b style={{ color: C.ink }}>{filtered.length.toLocaleString()}</b>{" "}
        {filtered.length !== inquiries.length && (
          <>of <b style={{ color: C.ink }}>{inquiries.length.toLocaleString()}</b>{" "}</>
        )}
        {filtered.length === 1 ? "inquiry" : "inquiries"}
      </Typography>

      {/* ── Error alert ── */}
      {error && (
        <Alert severity="error" onClose={clearError} sx={{ mb: 1.5, borderRadius: C.radius, fontSize: 12 }}>
          {error}
        </Alert>
      )}

      {/* ══════════════════════════════════════════════
          MOBILE — Card list
         ══════════════════════════════════════════════ */}
      {isMobile ? (
        <Box>
          {(loading || actionLoading) && <LinearProgress sx={{ height: 2, mb: 1, borderRadius: 1 }} />}

          {/* Select-all bar */}
          {pageSlice.length > 0 && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                px: 1,
                py: 0.75,
                mb: 1,
                bgcolor: C.surface,
                border: C.border,
                borderRadius: "8px",
              }}
            >
              <Checkbox
                size="small"
                indeterminate={selected.size > 0 && !allSelected}
                checked={allSelected}
                onChange={toggleAll}
                sx={{ p: 0, color: C.inkMuted, "&.Mui-checked": { color: C.accent } }}
              />
              <Typography fontSize={11.5} color={C.inkMuted}>
                {allSelected ? "Deselect all" : "Select all on this page"}
              </Typography>
            </Box>
          )}

          {loading && inquiries.length === 0 ? (
            <SkeletonCards />
          ) : pageSlice.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 7 }}>
              <MessageIcon sx={{ fontSize: 36, color: C.line, mb: 1, display: "block", mx: "auto" }} />
              <Typography fontSize={13} color={C.inkSoft} fontWeight={500}>
                {search || ageFilter !== "all" ? "No inquiries match your filters" : "No inquiries yet"}
              </Typography>
              {(search || ageFilter !== "all") && (
                <Button size="small" onClick={resetFilters} sx={{ mt: 1, fontSize: 11, textTransform: "none", color: C.accent }}>
                  Clear filters
                </Button>
              )}
            </Box>
          ) : (
            pageSlice.map((inq) => (
              <InquiryCard
                key={inq._id}
                inq={inq}
                selected={selected}
                onToggle={toggleOne}
                onView={handleView}
                onDelete={promptDelete}
                actionLoading={actionLoading}
              />
            ))
          )}

          {/* Mobile pagination */}
          {filtered.length > 0 && (
            <Box sx={{ bgcolor: C.surface, border: C.border, borderRadius: C.radius, mt: 1, overflow: "hidden" }}>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filtered.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(_, p) => setPage(p)}
                onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                sx={{
                  "& .MuiTablePagination-toolbar": { minHeight: 44, px: 1.5 },
                  "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": { fontSize: 11.5, color: C.inkMuted },
                }}
              />
            </Box>
          )}
        </Box>
      ) : (
        /* ══════════════════════════════════════════════
            DESKTOP — Table
           ══════════════════════════════════════════════ */
        <Box sx={{ bgcolor: C.surface, border: C.border, borderRadius: C.radius, overflow: "hidden" }}>
          {(loading || actionLoading) && <LinearProgress sx={{ height: 2 }} />}

          {loading && inquiries.length === 0 ? (
            <Box sx={{ p: 3 }}>
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} height={52} sx={{ mb: 0.5, borderRadius: "6px" }} />
              ))}
            </Box>
          ) : (
            <TableContainer sx={{ overflowX: "auto" }}>
              <Table sx={{ minWidth: 640 }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ ...headCellSx, width: 44, px: "10px" }}>
                      <Checkbox
                        size="small"
                        indeterminate={selected.size > 0 && !allSelected}
                        checked={allSelected}
                        onChange={toggleAll}
                        sx={{ p: 0, color: C.inkMuted, "&.Mui-checked": { color: C.accent } }}
                      />
                    </TableCell>
                    {[
                      { id: "fullName", label: "Name", sort: true },
                      { id: "email", label: "Contact", sort: false },
                      { id: "message", label: "Message", sort: false },
                      { id: "createdAt", label: "Date", sort: true },
                      { id: "status", label: "Status", sort: false },
                      { id: "_actions", label: "Actions", sort: false, width: 90 },
                    ].map((col) => (
                      <TableCell key={col.id} sx={{ ...headCellSx, width: col.width }}>
                        {col.sort ? (
                          <TableSortLabel
                            active={sortCol === col.id}
                            direction={sortCol === col.id ? sortDir : "asc"}
                            onClick={() => doSort(col.id)}
                            sx={{ fontSize: 11 }}
                          >
                            {col.label}
                          </TableSortLabel>
                        ) : col.label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {pageSlice.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} sx={{ py: 8, textAlign: "center" }}>
                        <MessageIcon sx={{ fontSize: 36, color: C.line, mb: 1, display: "block", mx: "auto" }} />
                        <Typography fontSize={13} color={C.inkSoft} fontWeight={500}>
                          {search || ageFilter !== "all" ? "No inquiries match your filters" : "No inquiries yet"}
                        </Typography>
                        {(search || ageFilter !== "all") && (
                          <Button size="small" onClick={resetFilters} sx={{ mt: 1, fontSize: 11, textTransform: "none", color: C.accent }}>
                            Clear filters
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ) : (
                    pageSlice.map((inq) => (
                      <TableRow
                        key={inq._id}
                        hover
                        sx={{
                          "&:hover": { bgcolor: alpha(C.accent, 0.02) },
                          "&:last-child td": { borderBottom: "none" },
                          bgcolor: selected.has(inq._id) ? alpha(C.accent, 0.03) : undefined,
                          cursor: "pointer",
                        }}
                        onClick={() => handleView(inq._id)}
                      >
                        <TableCell sx={{ ...cellSx, width: 44, px: "10px" }} onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            size="small"
                            checked={selected.has(inq._id)}
                            onChange={() => toggleOne(inq._id)}
                            sx={{ p: 0, color: C.inkMuted, "&.Mui-checked": { color: C.accent } }}
                          />
                        </TableCell>
                        <TableCell sx={cellSx}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                            <Avatar sx={{ width: 30, height: 30, fontSize: 12, fontWeight: 700, bgcolor: alpha(C.accent, 0.1), color: C.accent, flexShrink: 0 }}>
                              {(inq.fullName?.[0] || "U").toUpperCase()}
                            </Avatar>
                            <Typography fontSize={12.5} fontWeight={600} color={C.ink} noWrap sx={{ maxWidth: 130 }}>
                              {inq.fullName}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={cellSx}>
                          <Stack spacing={0.25}>
                            <Typography fontSize={11.5} color={C.inkSoft} noWrap sx={{ maxWidth: 160, display: "flex", alignItems: "center", gap: 0.5 }}>
                              <EmailIcon sx={{ fontSize: 11 }} />{inq.email}
                            </Typography>
                            <Typography fontSize={11.5} color={C.inkSoft} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                              <PhoneIcon sx={{ fontSize: 11 }} />{inq.phone}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell sx={{ ...cellSx, maxWidth: 220 }}>
                          <Typography fontSize={11.5} color={C.inkSoft} noWrap title={inq.message}>{inq.message}</Typography>
                        </TableCell>
                        <TableCell sx={cellSx}>
                          <Typography fontSize={11.5} color={C.ink} whiteSpace="nowrap">
                            {inq.createdAt ? new Date(inq.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                          </Typography>
                          <Typography fontSize={10.5} color={C.inkMuted} fontFamily={C.mono}>
                            {inq.createdAt ? new Date(inq.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : ""}
                          </Typography>
                        </TableCell>
                        <TableCell sx={cellSx}><AgeBadge date={inq.createdAt} /></TableCell>
                        <TableCell sx={{ ...cellSx, width: 90 }} align="center" onClick={(e) => e.stopPropagation()}>
                          <Box sx={{ display: "flex", gap: 0.5, justifyContent: "center" }}>
                            <Tooltip title="View">
                              <IconButton
                                size="small"
                                onClick={() => handleView(inq._id)}
                                sx={{ width: 28, height: 28, borderRadius: "7px", bgcolor: alpha(C.accent, 0.07), color: C.accent }}
                                aria-label="View inquiry"
                              >
                                <VisibilityIcon sx={{ fontSize: 13 }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                onClick={() => promptDelete(inq._id, inq.fullName)}
                                sx={{ width: 28, height: 28, borderRadius: "7px", bgcolor: alpha(C.red, 0.07), color: C.red }}
                                aria-label="Delete inquiry"
                              >
                                <DeleteIcon sx={{ fontSize: 13 }} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {filtered.length > 0 && (
            <Box sx={{ borderTop: `0.5px solid ${C.lineSoft}` }}>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                component="div"
                count={filtered.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(_, p) => setPage(p)}
                onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                sx={{
                  "& .MuiTablePagination-toolbar": { minHeight: 44, px: 2 },
                  "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": { fontSize: 11.5, color: C.inkMuted },
                }}
              />
            </Box>
          )}
        </Box>
      )}

      {/* ── Dialogs ── */}
      <ViewDialog
        open={viewOpen}
        onClose={() => { setViewOpen(false); clearSelectedInquiry(); }}
        inquiry={selectedInquiry}
        onDelete={handleDeleteFromView}
      />
      <DeleteDialog
        open={deleteOpen}
        onClose={() => { setDeleteOpen(false); setDeleteTarget(null); }}
        onConfirm={handleConfirmDelete}
        name={deleteTarget?.name}
        bulk={!deleteTarget}
        count={selected.size}
        loading={actionLoading}
      />

      {/* ── Snackbar ── */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((s) => ({ ...s, open: false }))} sx={{ borderRadius: C.radius, fontSize: 12 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
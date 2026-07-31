import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  alpha,
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Snackbar,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  AccessTime,
  Attachment,
  CheckCircle,
  ConfirmationNumber,
  Close as CloseIcon,
  FilterAlt as FilterIcon,
  Send,
  TaskAlt,
  UploadFile,
} from "@mui/icons-material";
import PageHeading from "../components/PageHeading";
import AssetSearchField from "../components/AssetSearchField";
import { useAuth } from "../context/AuthContexts";
import { useTickets } from "../context/TicketContext";

const C = {
  teal: "#15576A",
  tealSoft: "#e8f4f5",
  border: "#e2e8f0",
  text: "#0f172a",
  muted: "#64748b",
  bg: "#f7fafc",
  amber: "#d97706",
  green: "#059669",
  blue: "#2563eb",
};

const TICKETS_PER_PAGE = 6;

const categories = [
  { value: "technical", label: "Technical" },
  { value: "finance", label: "Finance" },
  { value: "hr", label: "HR" },
  { value: "general", label: "General" },
  { value: "other", label: "Other" },
];

const priorities = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

const statusMeta = {
  open: { label: "Open", color: C.amber },
  raised_to_super_admin: { label: "Raised to Super Admin", color: C.blue },
  resolved: { label: "Resolved", color: C.green },
  closed: { label: "Closed", color: C.muted },
};

const titleCase = (value = "") =>
  value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

const requesterName = (user) =>
  user?.name ||
  user?.customerName ||
  `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
  user?.email ||
  "User";

const attachmentUrl = (file) => {
  let path = file?.url || file?.secure_url || file?.filePath || file?.path || "";
  if (!path) return "";
  path = String(path).trim().replace(/^https\/\//i, "https://");
  if (/^(https?:|blob:|data:)/i.test(path)) return path;
  return `https://synversys-backend.onrender.com/${path.replace(/^\/+/, "")}`;
};

const formatDateTime = (value) => {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";
  return date.toLocaleString();
};

// Returns true when a ticket's createdAt falls within the [from, to] date
// range (inclusive, based on calendar day, not exact time).
const isWithinDateRange = (createdAt, from, to) => {
  if (!from && !to) return true;
  const created = new Date(createdAt);
  if (Number.isNaN(created.getTime())) return false;

  if (from) {
    const fromDate = new Date(from);
    fromDate.setHours(0, 0, 0, 0);
    if (created < fromDate) return false;
  }
  if (to) {
    const toDate = new Date(to);
    toDate.setHours(23, 59, 59, 999);
    if (created > toDate) return false;
  }
  return true;
};

function TicketDialog({ open, onClose, onSubmit, onInvalid, loading }) {
  const theme = useTheme();
  const isMobileDialog = useMediaQuery(theme.breakpoints.down("sm"));
  const [form, setForm] = useState({
    subject: "",
    category: "technical",
    description: "",
    priority: "medium",
  });
  const [files, setFiles] = useState([]);
  const canSubmit = form.subject.trim() && form.category && form.priority;

  const reset = () => {
    setForm({ subject: "", category: "technical", description: "", priority: "medium" });
    setFiles([]);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobileDialog}
      PaperProps={{
        sx: isMobileDialog
          ? { m: 0, width: "100%", height: "100%", maxHeight: "100%", borderRadius: 0 }
          : { borderRadius: 2 },
      }}
    >
      <DialogTitle sx={{ fontWeight: 800 }}>Raise Ticket</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ pt: 0.5 }}>
          <TextField
            label="Subject"
            value={form.subject}
            onChange={(e) => setForm((prev) => ({ ...prev, subject: e.target.value }))}
            fullWidth
            required
          />
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <FormControl fullWidth required>
              <InputLabel>Category</InputLabel>
              <Select
                label="Category"
                value={form.category}
                onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
              >
                {categories.map((item) => (
                  <MenuItem key={item.value} value={item.value}>
                    {item.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth required>
              <InputLabel>Priority</InputLabel>
              <Select
                label="Priority"
                value={form.priority}
                onChange={(e) => setForm((prev) => ({ ...prev, priority: e.target.value }))}
              >
                {priorities.map((item) => (
                  <MenuItem key={item.value} value={item.value}>
                    {item.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
          <TextField
            label="Description"
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            minRows={4}
            multiline
            fullWidth
          />
          <Button
            component="label"
            variant="outlined"
            startIcon={<UploadFile />}
            sx={{ justifyContent: "flex-start", borderColor: C.border, color: C.teal }}
          >
            {files.length ? `${files.length} attachment selected` : "Upload attachment"}
            <input
              hidden
              type="file"
              multiple
              onChange={(e) => setFiles(Array.from(e.target.files || []))}
            />
          </Button>
          {files.length > 0 && (
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {files.map((file) => (
                <Chip key={`${file.name}-${file.size}`} icon={<Attachment />} label={file.name} />
              ))}
            </Stack>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          disabled={loading}
          variant="contained"
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <Send />}
          onClick={async () => {
            if (!canSubmit) {
              onInvalid?.("Subject is required");
              return;
            }
            await onSubmit(form, files);
            reset();
          }}
          sx={{ bgcolor: C.teal, "&:hover": { bgcolor: "#0f4554" } }}
        >
          Submit Ticket
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function RaiseDialog({ open, onClose, onSubmit, loading }) {
  const [notes, setNotes] = useState("");

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 800 }}>Raise to Super Admin</DialogTitle>
      <DialogContent dividers>
        <TextField
          label="Admin notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          minRows={3}
          multiline
          fullWidth
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          disabled={loading}
          variant="contained"
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <Send />}
          onClick={async () => {
            await onSubmit(notes);
            setNotes("");
          }}
          sx={{ bgcolor: C.teal, "&:hover": { bgcolor: "#0f4554" } }}
        >
          Raise
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function ResolveDialog({ open, onClose, onSubmit, loading }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open) setNotes("");
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={() => !loading && onClose()}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ fontWeight: 800, fontSize: "1rem", pb: 1 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              bgcolor: "#dcfce7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CheckCircle sx={{ color: C.green, fontSize: 20 }} />
          </Box>
          Resolve Ticket
        </Stack>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 2.5 }}>
        <Alert
          severity="info"
          sx={{
            mb: 2.5,
            borderRadius: 2,
            fontSize: 13,
            bgcolor: isDark ? "rgba(8, 47, 73, 0.65)" : "rgba(21, 87, 106, 0.08)",
            color: isDark ? "#c7f3ff" : C.text,
            "& .MuiAlert-icon": {
              color: isDark ? "#38bdf8" : C.teal,
            },
          }}
        >
          This will mark the ticket as resolved and notify the requester.
        </Alert>
        <TextField
          fullWidth
          multiline
          rows={3}
          size="small"
          label="Resolution Notes (Optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add resolution details for the requester..."
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button
          onClick={onClose}
          disabled={loading}
          sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700 }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={() => onSubmit(notes)}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <TaskAlt />}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 800,
            bgcolor: C.teal,
            "&:hover": { bgcolor: "#0f4554" },
          }}
        >
          Resolve Ticket
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function Tickets() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { user } = useAuth();
  const { fetchTickets, createTicket, raiseToSuperAdmin, updateTicketStatus, loading } = useTickets();
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({});
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    category: "all",
    priority: "all",
    dateFrom: "",
    dateTo: "",
  });
  const [ticketOpen, setTicketOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [raiseTarget, setRaiseTarget] = useState(null);
  const [resolveTarget, setResolveTarget] = useState(null);
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });
  const [page, setPage] = useState(1);

  const isSuperAdmin = user?.role === "super_admin";
  const isAdmin = user?.role === "admin";
  const canRaiseTicket = user?.role === "admin" || user?.role === "team";

  const loadTickets = useCallback(async ({ silent = false } = {}) => {
    try {
      const result = await fetchTickets({ page: 1, limit: 50, ...filters });
      const payload = result?.data || result;
      setTickets(payload?.tickets || []);
      setStats(payload?.stats || {});
    } catch (err) {
      if (!silent) {
        setSnack({
          open: true,
          message: err?.response?.data?.message || "Failed to load tickets",
          severity: "error",
        });
      }
    }
  }, [fetchTickets, filters]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      loadTickets({ silent: true });
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [loadTickets]);

  // Reset back to page 1 whenever the active filters change so the user
  // isn't left stranded on a page that no longer has results.
  useEffect(() => {
    setPage(1);
  }, [filters.search, filters.status, filters.category, filters.priority, filters.dateFrom, filters.dateTo]);

  const applyTicketUpdate = useCallback((updatedTicket) => {
    const ticket = updatedTicket?.data || updatedTicket;
    if (!ticket?._id) return;

    setTickets((prev) => {
      const matchesActiveFilters =
        (filters.status === "all" || ticket.status === filters.status) &&
        (filters.category === "all" || ticket.category === filters.category) &&
        (filters.priority === "all" || ticket.priority === filters.priority) &&
        isWithinDateRange(ticket.createdAt, filters.dateFrom, filters.dateTo) &&
        (!filters.search ||
          [ticket.ticketId, ticket.subject, ticket.description]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(filters.search.toLowerCase())));

      if (!matchesActiveFilters) {
        return prev.filter((item) => item._id !== ticket._id);
      }

      const exists = prev.some((item) => item._id === ticket._id);
      if (exists) {
        return prev.map((item) => (item._id === ticket._id ? ticket : item));
      }
      return [ticket, ...prev];
    });
  }, [filters]);

  const hasDateFilter = Boolean(filters.dateFrom || filters.dateTo);

  // Client-side date-range filtering, layered on top of whatever the
  // backend already returned for the other filters/search term.
  const filteredTickets = useMemo(() => {
    if (!hasDateFilter) return tickets;
    return tickets.filter((ticket) => isWithinDateRange(ticket.createdAt, filters.dateFrom, filters.dateTo));
  }, [tickets, hasDateFilter, filters.dateFrom, filters.dateTo]);

  // The backend `stats` totals don't account for the client-side date
  // range filter, so once a date range is active we recompute the tile
  // counts from the (already date-filtered) ticket list instead.
  const dateFilteredStats = useMemo(() => {
    if (!hasDateFilter) return null;
    const counts = { total: 0, open: 0, raised_to_super_admin: 0, resolved: 0, closed: 0 };
    filteredTickets.forEach((ticket) => {
      counts.total += 1;
      if (counts[ticket.status] !== undefined) counts[ticket.status] += 1;
    });
    return counts;
  }, [filteredTickets, hasDateFilter]);

  const activeStats = dateFilteredStats || stats;

  const statCards = useMemo(
    () => [
      { key: "total", label: "Total Tickets", value: activeStats.total || 0, color: C.teal },
      { key: "open", label: "Open Tickets", value: activeStats.open || 0, color: C.amber },
      {
        key: "raised_to_super_admin",
        label: "Raised Tickets",
        value: activeStats.raised_to_super_admin || 0,
        color: C.blue,
      },
      { key: "resolved", label: "Resolved Tickets", value: activeStats.resolved || 0, color: C.green },
    ],
    [activeStats],
  );

  const filterOptions = useMemo(
    () => [
      [
        "status",
        "Status",
        [
          { value: "all", label: "All Status" },
          ...Object.entries(statusMeta).map(([value, meta]) => ({ value, label: meta.label })),
        ],
      ],
      ["category", "Category", [{ value: "all", label: "All Categories" }, ...categories]],
      ["priority", "Priority", [{ value: "all", label: "All Priority" }, ...priorities]],
    ],
    [],
  );

  const pageCount = Math.max(1, Math.ceil(filteredTickets.length / TICKETS_PER_PAGE));
  const currentPage = Math.min(page, pageCount);
  const pagedTickets = useMemo(
    () => filteredTickets.slice((currentPage - 1) * TICKETS_PER_PAGE, currentPage * TICKETS_PER_PAGE),
    [filteredTickets, currentPage],
  );

  const dateFilterFields = (
    <>
      <TextField
        type="date"
        label="From"
        size="small"
        value={filters.dateFrom}
        onChange={(e) => setFilters((prev) => ({ ...prev, dateFrom: e.target.value }))}
        InputLabelProps={{ shrink: true }}
        inputProps={{ max: filters.dateTo || undefined }}
        sx={{ minWidth: 150 }}
      />
      <TextField
        type="date"
        label="To"
        size="small"
        value={filters.dateTo}
        onChange={(e) => setFilters((prev) => ({ ...prev, dateTo: e.target.value }))}
        InputLabelProps={{ shrink: true }}
        inputProps={{ min: filters.dateFrom || undefined }}
        sx={{ minWidth: 150 }}
      />
    </>
  );

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: C.bg, p: { xs: 2, md: 4 } }}>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" gap={2} mb={3}>
        <PageHeading
          title={isSuperAdmin ? "Tickets Raised" : "Raise Ticket"}
          subtitle={
            isSuperAdmin
              ? "Tickets escalated by admins for Super Admin action"
              : "Create and track support tickets with unique ticket numbers and timestamps"
          }
        />
        {canRaiseTicket && (
          <Button
            variant="contained"
            startIcon={<ConfirmationNumber />}
            onClick={() => setTicketOpen(true)}
            sx={{ alignSelf: { xs: "stretch", sm: "center" }, bgcolor: C.teal, "&:hover": { bgcolor: "#0f4554" } }}
          >
            Raise Ticket
          </Button>
        )}
      </Stack>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" }, gap: 2, mb: 3 }}>
        {statCards.map((card) => {
          const filterStatus = card.key === "total" ? "all" : card.key;
          const isActive = filters.status === filterStatus;

          return (
          <Paper
            key={card.key}
            role="button"
            tabIndex={0}
            onClick={() =>
              setFilters((prev) => ({
                ...prev,
                status: filterStatus,
              }))
            }
            onKeyDown={(event) => {
              if (event.key !== "Enter" && event.key !== " ") return;
              event.preventDefault();
              setFilters((prev) => ({
                ...prev,
                status: filterStatus,
              }));
            }}
            sx={{
              p: 2,
              border: "1px solid",
              position: "relative",
              overflow: "hidden",
              borderColor: isActive ? `${card.color} !important` : C.border,
              bgcolor: isActive ? `${alpha(card.color, 0.14)} !important` : "background.paper",
              outline: isActive ? `3px solid ${card.color}` : "none",
              outlineOffset: "-3px",
              boxShadow: isActive
                ? `inset 0 0 0 1px ${card.color}, 0 18px 40px ${alpha(card.color, 0.22)} !important`
                : "none",
              "&::before": isActive
                ? {
                    content: '""',
                    position: "absolute",
                    inset: "0 auto 0 0",
                    width: 6,
                    bgcolor: card.color,
                  }
                : undefined,
              borderRadius: 2,
              cursor: "pointer",
              transition: "all 0.2s ease",
              "&:hover": {
                borderColor: card.color,
                transform: "translateY(-2px)",
                outline: `3px solid ${card.color}`,
                boxShadow: isActive
                  ? `inset 0 0 0 1px ${card.color}, 0 20px 44px ${alpha(card.color, 0.24)} !important`
                  : `0 12px 28px ${alpha(card.color, 0.16)}`,
              },
              "&:focus-visible": {
                borderColor: card.color,
                boxShadow: `0 0 0 3px ${alpha(card.color, 0.33)}`,
              },
            }}
          >
            <Typography sx={{ color: C.muted, fontSize: 11, fontWeight: 800, textTransform: "uppercase" }}>
              {card.label}
            </Typography>
            <Typography sx={{ color: card.color, fontSize: 28, fontWeight: 900 }}>{card.value}</Typography>
          </Paper>
          );
        })}
      </Box>

      <Paper sx={{ p: 2, mb: 3, border: `1px solid ${C.border}`, boxShadow: "none", borderRadius: 2 }}>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
          <AssetSearchField
            value={filters.search}
            placeholder="Search ticket ID, subject, description..."
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            onClear={() => setFilters((prev) => ({ ...prev, search: "" }))}
            sx={{ flex: 1, minWidth: 200 }}
          />
          {isMobile && (
            <IconButton
              aria-label="Open filters"
              onClick={() => setFilterOpen(true)}
              sx={{
                width: 42,
                height: 42,
                flexShrink: 0,
                borderRadius: 2,
                border: `1px solid ${isDark ? "rgba(77, 208, 225, 0.22)" : alpha(C.teal, 0.18)}`,
                bgcolor: isDark ? "rgba(21, 87, 106, 0.35)" : alpha(C.teal, 0.08),
                color: isDark ? "#4dd0e1" : C.teal,
              }}
            >
              <FilterIcon />
            </IconButton>
          )}
          {!isMobile && (
            <>
              {filterOptions.map(([key, label, options]) => (
                <FormControl key={key} size="small" sx={{ minWidth: 150 }}>
                  <InputLabel sx={{ color: isDark ? "#c3d0d8" : undefined, "&.Mui-focused": { color: isDark ? "#4dd0e1" : undefined } }}>{label}</InputLabel>
                  <Select
                    label={label}
                    value={filters[key]}
                    onChange={(e) => setFilters((prev) => ({ ...prev, [key]: e.target.value }))}
                  >
                    {options.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ))}
              {dateFilterFields}
              {hasDateFilter && (
                <Button
                  size="small"
                  color="inherit"
                  onClick={() => setFilters((prev) => ({ ...prev, dateFrom: "", dateTo: "" }))}
                  sx={{ color: C.muted, textTransform: "none", fontWeight: 700 }}
                >
                  Clear dates
                </Button>
              )}
            </>
          )}
        </Stack>
      </Paper>

      {loading && !tickets.length ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : filteredTickets.length ? (
        <>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr", xl: "1fr 1fr 1fr" }, gap: 2 }}>
            {pagedTickets.map((ticket) => {
              const status = statusMeta[ticket.status] || statusMeta.open;
              const isTeamRaisedTicket = ticket.raisedByRole === "team";
              const canAdminActOnTicket = isAdmin && isTeamRaisedTicket;
              const canResolveTicket = (canAdminActOnTicket || isSuperAdmin) && ticket.status !== "resolved";
              return (
                <Card key={ticket._id} sx={{ border: `1px solid ${C.border}`, boxShadow: "none", borderRadius: 2 }}>
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={2}>
                      <Box sx={{ minWidth: 0 }}>
                        <Chip
                          icon={<ConfirmationNumber />}
                          label={ticket.ticketId}
                          size="small"
                          sx={{ bgcolor: C.tealSoft, color: C.teal, fontWeight: 800, mb: 1 }}
                        />
                        <Typography sx={{ fontWeight: 800, color: C.text, wordBreak: "break-word" }}>
                          {ticket.subject}
                        </Typography>
                      </Box>
                      <Chip label={status.label} size="small" sx={{ bgcolor: `${status.color}15`, color: status.color, fontWeight: 800 }} />
                    </Stack>

                    <Typography sx={{ color: C.muted, fontSize: 13, mt: 1.5, minHeight: 40 }}>
                      {ticket.description}
                    </Typography>

                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap mt={2}>
                      <Chip label={titleCase(ticket.category)} size="small" />
                      <Chip label={`${titleCase(ticket.priority)} Priority`} size="small" />
                    </Stack>

                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", sm: ticket.status === "resolved" ? "1fr 1fr" : "1fr" },
                        gap: 1,
                        mt: 1.5,
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={0.75}
                        alignItems="center"
                        sx={{
                          minWidth: 0,
                          px: 1.25,
                          py: 0.75,
                          borderRadius: 2,
                          bgcolor: isDark
                            ? "rgba(21, 87, 106, 0.35)"
                            : alpha(C.teal, 0.1),
                          color: isDark ? "#4dd0e1" : C.teal,
                          border: `1px solid ${
                            isDark ? "rgba(77, 208, 225, 0.18)" : alpha(C.teal, 0.18)
                          }`,
                        }}
                      >
                        <AccessTime sx={{ fontSize: 18, flexShrink: 0 }} />
                        <Typography sx={{ fontSize: 12, fontWeight: 800, lineHeight: 1.35, overflowWrap: "anywhere" }}>
                          Raised: {formatDateTime(ticket.createdAt)}
                        </Typography>
                      </Stack>
                      {ticket.status === "resolved" && (
                        <Stack
                          direction="row"
                          spacing={0.75}
                          alignItems="center"
                          sx={{
                            minWidth: 0,
                            px: 1.25,
                            py: 0.75,
                            borderRadius: 2,
                            bgcolor: alpha(C.green, isDark ? 0.18 : 0.1),
                            color: C.green,
                            border: `1px solid ${alpha(C.green, isDark ? 0.24 : 0.16)}`,
                          }}
                        >
                          <TaskAlt sx={{ fontSize: 18, flexShrink: 0 }} />
                          <Typography sx={{ fontSize: 12, fontWeight: 800, lineHeight: 1.35, overflowWrap: "anywhere" }}>
                            Resolved: {formatDateTime(ticket.resolvedAt || ticket.updatedAt)}
                          </Typography>
                        </Stack>
                      )}
                    </Box>

                    {ticket.status === "resolved" && ticket.resolutionNotes && (
                      <Box
                        sx={{
                          mt: 1.5,
                          px: 1.5,
                          py: 1.25,
                          borderRadius: 2,
                          bgcolor: alpha(C.green, isDark ? 0.16 : 0.08),
                          border: `1px solid ${alpha(C.green, isDark ? 0.26 : 0.16)}`,
                        }}
                      >
                        <Typography
                          sx={{
                            color: isDark ? "#86efac" : C.green,
                            fontSize: 12,
                            fontWeight: 800,
                            mb: 0.35,
                          }}
                        >
                          Resolution Message
                        </Typography>
                        <Typography
                          sx={{
                            color: isDark ? "#dcfce7" : C.text,
                            fontSize: 13,
                            lineHeight: 1.45,
                            whiteSpace: "pre-wrap",
                            overflowWrap: "anywhere",
                          }}
                        >
                          {ticket.resolutionNotes}
                        </Typography>
                      </Box>
                    )}

                    <Typography sx={{ mt: 2, color: C.muted, fontSize: 12 }}>
                      Raised by {requesterName(ticket.raisedBy)}
                      {ticket.adminId ? ` | Admin: ${requesterName(ticket.adminId)}` : ""}
                    </Typography>

                    {ticket.attachments?.length > 0 && (
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap mt={1.5}>
                        {ticket.attachments.map((file) => (
                          <Chip
                            key={file.filePath}
                            icon={<Attachment />}
                            label={file.originalName || file.fileName}
                            size="small"
                            component="a"
                            href={attachmentUrl(file)}
                            clickable
                            target="_blank"
                          />
                        ))}
                      </Stack>
                    )}

                    <Stack direction="row" spacing={1} justifyContent="flex-end" mt={2}>
                      {canAdminActOnTicket && ticket.status === "open" && (
                        <Button size="small" variant="contained" startIcon={<Send />} onClick={() => setRaiseTarget(ticket)}>
                          Raise to Super Admin
                        </Button>
                      )}
                      {canResolveTicket && (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<TaskAlt />}
                          onClick={() => setResolveTarget(ticket)}
                        >
                          Resolve
                        </Button>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              );
            })}
          </Box>

          {pageCount > 1 && (
            <Stack direction="row" justifyContent="center" mt={3}>
              <Pagination
                count={pageCount}
                page={currentPage}
                onChange={(_, value) => setPage(value)}
                shape="rounded"
                color="standard"
                sx={{
                  "& .MuiPaginationItem-root": {
                    fontWeight: 700,
                    color: isDark ? "#c3d0d8" : C.text,
                  },
                  "& .MuiPaginationItem-root.Mui-selected": {
                    bgcolor: C.teal,
                    color: "#fff",
                    "&:hover": { bgcolor: "#0f4554" },
                  },
                }}
              />
            </Stack>
          )}
        </>
      ) : (
        <Paper sx={{ p: 5, textAlign: "center", border: `1px solid ${C.border}`, boxShadow: "none", borderRadius: 2 }}>
          <ConfirmationNumber sx={{ color: C.muted, fontSize: 42, mb: 1 }} />
          <Typography sx={{ fontWeight: 800, color: C.text }}>No tickets found</Typography>
          <Typography sx={{ color: C.muted, fontSize: 13 }}>Raise a ticket or adjust the filters.</Typography>
        </Paper>
      )}


      <Dialog
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          sx: {
            m: 0,
            position: "fixed",
            left: 0,
            right: 0,
            bottom: 0,
            width: "100%",
            maxWidth: "none",
            borderRadius: "24px 24px 0 0",
            border: `1px solid ${isDark ? "rgba(77, 208, 225, 0.18)" : C.border}`,
            bgcolor: isDark ? "#0f1e29" : "background.paper",
          },
        }}
      >
        <DialogTitle sx={{ pb: 1.5, display: "flex", alignItems: "center", justifyContent: "space-between", fontWeight: 900 }}>
          Filters
          <IconButton aria-label="Close filters" onClick={() => setFilterOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 2.5, pb: 3 }}>
          <Stack spacing={2.5}>
            {filterOptions.map(([key, label, options]) => (
              <FormControl key={key} fullWidth size="small" sx={{ mt: 0.5 }}>
                <Typography sx={{ mb: 0.75, color: isDark ? "#c3d0d8" : C.muted, fontSize: 12, fontWeight: 700 }}>
                  {label}
                </Typography>
                <Select
                  value={filters[key]}
                  onChange={(e) => setFilters((prev) => ({ ...prev, [key]: e.target.value }))}
                >
                  {options.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ))}
            <Box>
              <Typography sx={{ mb: 0.75, color: isDark ? "#c3d0d8" : C.muted, fontSize: 12, fontWeight: 700 }}>
                Date Range
              </Typography>
              <Stack direction="row" spacing={1.5}>
                <TextField
                  type="date"
                  size="small"
                  fullWidth
                  value={filters.dateFrom}
                  onChange={(e) => setFilters((prev) => ({ ...prev, dateFrom: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ max: filters.dateTo || undefined }}
                  label="From"
                />
                <TextField
                  type="date"
                  size="small"
                  fullWidth
                  value={filters.dateTo}
                  onChange={(e) => setFilters((prev) => ({ ...prev, dateTo: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ min: filters.dateFrom || undefined }}
                  label="To"
                />
              </Stack>
              {hasDateFilter && (
                <Button
                  size="small"
                  color="inherit"
                  onClick={() => setFilters((prev) => ({ ...prev, dateFrom: "", dateTo: "" }))}
                  sx={{ mt: 1, color: C.muted, textTransform: "none", fontWeight: 700, px: 0 }}
                >
                  Clear dates
                </Button>
              )}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 0 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={() => setFilterOpen(false)}
            sx={{ bgcolor: C.teal, borderRadius: 2, py: 1.1, fontWeight: 800, "&:hover": { bgcolor: "#0f4554" } }}
          >
            Apply Filters
          </Button>
        </DialogActions>
      </Dialog>

      <TicketDialog
        open={ticketOpen}
        loading={loading}
        onClose={() => setTicketOpen(false)}
        onInvalid={(message) =>
          setSnack({ open: true, message, severity: "error" })
        }
        onSubmit={async (form, files) => {
          try {
            const createdTicket = await createTicket(form, files);
            applyTicketUpdate(createdTicket);
            setTicketOpen(false);
            setSnack({ open: true, message: "Ticket raised successfully", severity: "success" });
            await loadTickets({ silent: true });
          } catch (err) {
            setSnack({
              open: true,
              message: err?.response?.data?.message || err?.message || "Failed to raise ticket",
              severity: "error",
            });
          }
        }}
      />

      <RaiseDialog
        open={Boolean(raiseTarget)}
        loading={loading}
        onClose={() => setRaiseTarget(null)}
        onSubmit={async (notes) => {
          const updatedTicket = await raiseToSuperAdmin(raiseTarget._id, notes);
          applyTicketUpdate(updatedTicket);
          setRaiseTarget(null);
          setSnack({ open: true, message: "Ticket raised to Super Admin", severity: "success" });
          await loadTickets({ silent: true });
        }}
      />

      <ResolveDialog
        open={Boolean(resolveTarget)}
        loading={loading}
        onClose={() => setResolveTarget(null)}
        onSubmit={async (notes) => {
          const updatedTicket = await updateTicketStatus(resolveTarget._id, "resolved", notes);
          applyTicketUpdate(updatedTicket);
          setResolveTarget(null);
          setSnack({ open: true, message: "Ticket marked as resolved", severity: "success" });
          await loadTickets({ silent: true });
        }}
      />

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        sx={{ zIndex: (theme) => theme.zIndex.modal + 500 }}
      >
        <Alert
          severity={snack.severity}
          onClose={() => setSnack((prev) => ({ ...prev, open: false }))}
          sx={{
            boxShadow: "0 12px 30px rgba(0,0,0,0.32)",
            ...(snack.severity === "error" && {
              bgcolor: "#3b0d0d",
              color: "#fee2e2",
              "& .MuiAlert-icon": { color: "#ff6b5f" },
              "& .MuiAlert-action": { color: "#fee2e2" },
            }),
          }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
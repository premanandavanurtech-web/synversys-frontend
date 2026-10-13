// components/RequestChecklistModal.jsx - Fully Updated with Backend Integration

import React, { useState, useCallback, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Stack,
  CircularProgress,
  Alert,
  LinearProgress,
  Tooltip,
  alpha,
  InputAdornment,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Close as CloseIcon,
  Send as SendIcon,
  CloudUpload as CloudUploadIcon,
  AttachFile as AttachFileIcon,
  Delete as DeleteIcon,
  InfoOutlined as InfoIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Description as DescriptionIcon,
  Repeat as RepeatIcon,
  Group as GroupIcon,
  Tag as TagIcon,
} from "@mui/icons-material";
import { useRequestChecklist } from "../context/RequestChecklistContext";
import { useNotifications } from "../context/NotificationContext";

const PRIMARY = "#0d4a5c";
const PRIMARY_DARK = "#092f3a";
const DARK_FIELD_BG = "#0f1d2c";
const DARK_FIELD_BG_SOFT = "#102334";
const DARK_BORDER = "#2b3f55";
const DARK_TEXT_MUTED = "#9aa9bb";

const CATEGORIES = [
  "Safety & Compliance",
  "Quality Assurance",
  "Maintenance",
  "HR & Onboarding",
  "Operations",
  "Audit",
  "Environmental",
  "Security",
  "Other",
];

const URGENCY_LEVELS = [
  {
    value: "low",
    label: "Low",
    desc: "A few weeks",
    color: "#16a34a",
    bg: "#f0fdf4",
  },
  {
    value: "medium",
    label: "Medium",
    desc: "Within a week",
    color: "#ca8a04",
    bg: "#fefce8",
  },
  {
    value: "high",
    label: "High",
    desc: "Within 2 days",
    color: "#f97316",
    bg: "#fff7ed",
  },
  {
    value: "critical",
    label: "Critical",
    desc: "Immediately",
    color: "#dc2626",
    bg: "#fef2f2",
  },
];

const USAGE_FREQUENCIES = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "as_needed", label: "As needed" },
];

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_EXTENSIONS = [
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "png",
  "jpg",
  "jpeg",
];

const INIT_FORM = {
  checklistName: "",
  category: "",
  detailedDescription: "",
  businessJustification: "",
  urgencyLevel: "",
  expectedUsageFrequency: "",
  numberOfTeamMembers: "",
  additionalNotes: "",
};

const INIT_ERRORS = {
  checklistName: "",
  category: "",
  detailedDescription: "",
  businessJustification: "",
  urgencyLevel: "",
};

const getFileExt = (name) => name.split(".").pop().toLowerCase();
const fmtSize = (b) =>
  b < 1024
    ? `${b} B`
    : b < 1024 * 1024
      ? `${(b / 1024).toFixed(1)} KB`
      : `${(b / 1024 / 1024).toFixed(1)} MB`;

const StepDot = ({ num, active, done }) => (
  <Box
    sx={{
      width: { xs: 22, sm: 26 },
      height: { xs: 22, sm: 26 },
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: 500,
      fontSize: { xs: 10, sm: 12 },
      flexShrink: 0,
      transition: "all 0.2s ease",
      bgcolor: done
        ? "rgba(255,255,255,0.3)"
        : active
          ? "#fff"
          : "rgba(255,255,255,0.12)",
      color: done ? "#fff" : active ? PRIMARY : "rgba(255,255,255,0.4)",
    }}
  >
    {done ? <CheckCircleIcon sx={{ fontSize: { xs: 12, sm: 14 } }} /> : num}
  </Box>
);

const UrgencyCard = ({ cfg, selected, onClick, isMobile }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Box
      onClick={onClick}
      sx={{
        p: { xs: "8px 6px", sm: "10px 8px" },
        borderRadius: "8px",
        border: "1px solid",
        borderColor: selected
          ? cfg.color
          : isDark
            ? "rgba(148, 163, 184, 0.2)"
            : "#e2e8f0",
        bgcolor: selected
          ? isDark
            ? alpha(cfg.color, 0.2)
            : alpha(cfg.color, 0.1)
          : isDark
            ? DARK_FIELD_BG
            : "#f8fafc",
        cursor: "pointer",
        width: "100%",
        textAlign: "center",
        transition: "all 0.15s ease",
        boxShadow: selected ? `0 0 0 1px ${alpha(cfg.color, 0.35)}` : "none",
        "&:hover": {
          borderColor: cfg.color,
          bgcolor: selected
            ? isDark
              ? alpha(cfg.color, 0.25)
              : alpha(cfg.color, 0.15)
            : isDark
              ? DARK_FIELD_BG_SOFT
              : "#f1f5f9",
        },
        "&:active": isMobile ? { transform: "scale(0.98)" } : {},
      }}
    >
      <Typography
        variant="caption"
        display="block"
        fontWeight={600}
        sx={{
          color: selected
            ? cfg.color
            : isDark
              ? "#e8eef6"
              : "#1e293b",
          fontSize: { xs: 11, sm: 12 },
          mb: 0.25,
        }}
      >
        {cfg.label}
      </Typography>
      <Typography
        variant="caption"
        display="block"
        sx={{
          color: selected
            ? alpha(cfg.color, 0.9)
            : isDark
              ? DARK_TEXT_MUTED
              : "#64748b",
          fontSize: { xs: 9, sm: 10.5 },
          lineHeight: 1.3,
        }}
      >
        {cfg.desc}
      </Typography>
    </Box>
  );
};

export default function RequestChecklistModal({ open, onClose, onSuccess }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { submitRequest } = useRequestChecklist();
  const { fetchUnreadCount, fetchNotifications } = useNotifications();

  const [step, setStep] = useState(0);
  const [form, setForm] = useState(INIT_FORM);
  const [errors, setErrors] = useState(INIT_ERRORS);
  const [files, setFiles] = useState([]);
  const [fileError, setFileError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const fileRef = useRef(null);

  const reset = useCallback(() => {
    setStep(0);
    setForm(INIT_FORM);
    setErrors(INIT_ERRORS);
    setFiles([]);
    setFileError("");
    setApiError("");
    setDragActive(false);
  }, []);

  const handleClose = useCallback(() => {
    if (submitting) return;
    reset();
    onClose();
  }, [submitting, reset, onClose]);

  const setField = (field) => (e) => {
    setForm((p) => ({ ...p, [field]: e.target.value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: "" }));
    if (apiError) setApiError("");
  };

  const validateStep0 = () => {
    const e = { ...INIT_ERRORS };
    let ok = true;
    if (!form.checklistName.trim()) {
      e.checklistName = "Required";
      ok = false;
    } else if (form.checklistName.trim().length < 3) {
      e.checklistName = "Min 3 characters";
      ok = false;
    }
    if (!form.category) {
      e.category = "Select a category";
      ok = false;
    }
    if (!form.urgencyLevel) {
      e.urgencyLevel = "Select urgency";
      ok = false;
    }
    setErrors(e);
    return ok;
  };

  const validateStep1 = () => {
    const e = { ...INIT_ERRORS };
    let ok = true;
    if (!form.detailedDescription.trim()) {
      e.detailedDescription = "Required";
      ok = false;
    } else if (form.detailedDescription.trim().length < 20) {
      e.detailedDescription = "Min 20 characters";
      ok = false;
    }
    if (!form.businessJustification.trim()) {
      e.businessJustification = "Required";
      ok = false;
    } else if (form.businessJustification.trim().length < 10) {
      e.businessJustification = "Min 10 characters";
      ok = false;
    }
    setErrors(e);
    return ok;
  };

  const processFiles = (raw) => {
    setFileError("");
    const acc = [];
    const rej = [];
    Array.from(raw).forEach((f) => {
      const ext = getFileExt(f.name);
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        rej.push(`${f.name}: unsupported`);
      } else if (f.size > MAX_FILE_SIZE_BYTES) {
        rej.push(`${f.name}: too large`);
      } else {
        acc.push({ file: f, name: f.name, size: f.size });
      }
    });
    if (rej.length) setFileError(rej.join(" · "));
    setFiles((p) => {
      const existingNames = new Set(p.map((x) => x.name));
      return [...p, ...acc.filter((x) => !existingNames.has(x.name))];
    });
  };

  const handleSubmit = async () => {
    if (!validateStep1()) return;
    setSubmitting(true);
    setApiError("");
    try {
      const fd = new FormData();
      fd.append("checklistName", form.checklistName.trim());
      fd.append("category", form.category);
      fd.append("detailedDescription", form.detailedDescription.trim());
      fd.append("businessJustification", form.businessJustification.trim());
      fd.append("urgencyLevel", form.urgencyLevel);
      if (form.expectedUsageFrequency)
        fd.append("expectedUsageFrequency", form.expectedUsageFrequency);
      if (form.numberOfTeamMembers)
        fd.append(
          "numberOfTeamMembers",
          parseInt(form.numberOfTeamMembers, 10) || 0,
        );
      if (form.additionalNotes.trim())
        fd.append("additionalNotes", form.additionalNotes.trim());
      files.forEach(({ file }) => fd.append("referenceFiles", file));

      const result = await submitRequest(fd);
      if (result?.success) {
        try {
          fetchUnreadCount?.();
          fetchNotifications?.(1, 20);
        } catch (_) {}
        onSuccess?.(result.data);
        handleClose();
      } else {
        setApiError(
          result?.error ||
            result?.message ||
            "Failed to submit. Please try again.",
        );
      }
    } catch (err) {
      setApiError(
        err?.response?.data?.message ||
          err?.message ||
          "An unexpected error occurred.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const progressPct = step === 0 ? 40 : 80;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown={submitting}
      sx={{
        "& .MuiDialog-container": {
          alignItems: { xs: "flex-end", sm: "center" },
        },
      }}
      PaperProps={{
        sx: {
          borderRadius: { xs: "24px 24px 0 0", sm: "14px" },
          overflow: "hidden",
          height: { xs: "100dvh", sm: "auto" },
          maxHeight: { xs: "100dvh", sm: "90vh" },
          m: { xs: 0, sm: 1.5, md: 3 },
          width: {
            xs: "100%",
            sm: "calc(100% - 24px)",
            md: "auto",
          },
          maxWidth: { xs: "100%", sm: 600 },
          display: "flex",
          flexDirection: "column",
          bgcolor: isDark ? "#0c1726" : "#ffffff",
          backgroundImage: "none",
          border: isDark ? "1px solid rgba(148, 163, 184, 0.2)" : "none",
        },
      }}
    >
      <LinearProgress
        variant="determinate"
        value={submitting ? 100 : progressPct}
        sx={{
          height: 3,
          bgcolor: alpha("#fbbf24", 0.28),
          "& .MuiLinearProgress-bar": {
            bgcolor: submitting ? "#22c55e" : "#f59e0b",
            transition: "width 0.4s ease",
          },
        }}
      />

      <Box
        sx={{
          bgcolor: PRIMARY,
          px: { xs: 2, sm: 2.75 },
          pt: { xs: 2, sm: 2.5 },
          pb: { xs: 1.5, sm: 2 },
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: { xs: 1.5, sm: 1.75 },
          }}
        >
          <Box>
            <Typography
              variant="subtitle1"
              fontWeight={500}
              color="white"
              sx={{ lineHeight: 1.3, fontSize: { xs: "0.9rem", sm: "1rem" } }}
            >
              Request a new checklist
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: alpha("#fff", 0.55),
                display: "block",
                mt: 0.25,
                fontSize: { xs: 10, sm: 11 },
              }}
            >
              Sent to Super Admin for review and build
            </Typography>
          </Box>
          <IconButton
            onClick={handleClose}
            disabled={submitting}
            size="small"
            sx={{
              color: "white",
              ml: 1.5,
              mt: 0.25,
              bgcolor: alpha("#fff", 0.1),
              "&:hover": { bgcolor: alpha("#fff", 0.2) },
              "&:active": isMobile ? { transform: "scale(0.95)" } : {},
            }}
          >
            <CloseIcon sx={{ fontSize: { xs: 14, sm: 16 } }} />
          </IconButton>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <StepDot
            num={<CheckCircleIcon sx={{ fontSize: { xs: 12, sm: 14 } }} />}
            active={step === 0}
            done={step > 0}
          />
          <Typography
            variant="caption"
            fontWeight={500}
            sx={{
              fontSize: { xs: 10, sm: 11 },
              color: step === 0 ? "#fff" : alpha("#fff", 0.45),
            }}
          >
            Basics
          </Typography>
          <Box
            sx={{
              flex: 1,
              height: "1.5px",
              borderRadius: "1px",
              mx: 0.5,
              bgcolor: step > 0 ? alpha("#fff", 0.5) : alpha("#fff", 0.18),
              transition: "background 0.3s",
            }}
          />
          <StepDot num={2} active={step === 1} done={false} />
          <Typography
            variant="caption"
            fontWeight={500}
            sx={{
              fontSize: { xs: 10, sm: 11 },
              color: step === 1 ? "#fff" : alpha("#fff", 0.45),
            }}
          >
            Details & files
          </Typography>
        </Box>
      </Box>

      <DialogContent
        sx={{
          p: { xs: "16px 18px 8px", sm: "20px 22px 10px" },
          overflowY: "auto",
          flex: { xs: 1, sm: "initial" },
          maxHeight: { xs: "none", sm: "none" },
          bgcolor: isDark ? "#0c1726" : "#ffffff",
          "&::-webkit-scrollbar": { width: 4 },
          "&::-webkit-scrollbar-thumb": {
            bgcolor: isDark ? "rgba(148, 163, 184, 0.2)" : "#dde6ea",
            borderRadius: 2,
          },
        }}
      >
        {apiError && (
          <Alert
            severity="error"
            onClose={() => setApiError("")}
            sx={{ mb: 2, borderRadius: 2, fontSize: { xs: 11, sm: 13 } }}
          >
            {apiError}
          </Alert>
        )}

        {step === 0 && (
          <Stack spacing={{ xs: 1.5, sm: 1.75 }}>
            <TextField
              fullWidth
              label="Checklist name *"
              placeholder="e.g. Fire Safety Inspection"
              value={form.checklistName}
              onChange={setField("checklistName")}
              error={!!errors.checklistName}
              helperText={errors.checklistName}
              disabled={submitting}
              inputProps={{ maxLength: 120 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <DescriptionIcon
                      sx={{
                        fontSize: { xs: 14, sm: 16 },
                        color: alpha(PRIMARY, 0.5),
                      }}
                    />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiInputLabel-root": { fontSize: { xs: 12, sm: 14 } },
                "& .MuiInputBase-input": { fontSize: { xs: 13, sm: 14 } },
              }}
            />

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 1.5,
              }}
            >
              <FormControl
                fullWidth
                error={!!errors.category}
                size={isMobile ? "small" : "medium"}
              >
                <InputLabel sx={{ fontSize: { xs: 12, sm: 14 } }}>
                  Category *
                </InputLabel>
                <Select
                  value={form.category}
                  onChange={setField("category")}
                  label="Category *"
                  disabled={submitting}
                  startAdornment={
                    <InputAdornment position="start">
                      <TagIcon
                        sx={{
                          fontSize: { xs: 14, sm: 16 },
                          color: alpha(PRIMARY, 0.5),
                        }}
                      />
                    </InputAdornment>
                  }
                  sx={{ fontSize: { xs: 13, sm: 14 } }}
                >
                  {CATEGORIES.map((c) => (
                    <MenuItem
                      key={c}
                      value={c}
                      sx={{ fontSize: { xs: 13, sm: 14 } }}
                    >
                      {c}
                    </MenuItem>
                  ))}
                </Select>
                {errors.category && (
                  <Typography
                    variant="caption"
                    color="error"
                    sx={{ mt: 0.5, ml: 1.75, fontSize: { xs: 10, sm: 11 } }}
                  >
                    {errors.category}
                  </Typography>
                )}
              </FormControl>

              <FormControl fullWidth size={isMobile ? "small" : "medium"}>
                <InputLabel sx={{ fontSize: { xs: 12, sm: 14 } }}>
                  Usage frequency
                </InputLabel>
                <Select
                  value={form.expectedUsageFrequency}
                  onChange={setField("expectedUsageFrequency")}
                  label="Usage frequency"
                  disabled={submitting}
                  startAdornment={
                    <InputAdornment position="start">
                      <RepeatIcon
                        sx={{
                          fontSize: { xs: 14, sm: 16 },
                          color: alpha(PRIMARY, 0.5),
                        }}
                      />
                    </InputAdornment>
                  }
                  sx={{ fontSize: { xs: 13, sm: 14 } }}
                >
                  <MenuItem value="" sx={{ fontSize: { xs: 13, sm: 14 } }}>
                    <em>Not specified</em>
                  </MenuItem>
                  {USAGE_FREQUENCIES.map(({ value, label }) => (
                    <MenuItem
                      key={value}
                      value={value}
                      sx={{ fontSize: { xs: 13, sm: 14 } }}
                    >
                      {label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box>
              <Typography
                variant="body2"
                fontWeight={500}
                color="text.secondary"
                sx={{ fontSize: { xs: 11, sm: 12 }, mb: 0.75 }}
              >
                Urgency level *
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(4, 1fr)" },
                  gap: 1,
                }}
              >
                {URGENCY_LEVELS.map((u) => (
                  <UrgencyCard
                    key={u.value}
                    cfg={u}
                    selected={form.urgencyLevel === u.value}
                    onClick={() => {
                      setForm((p) => ({ ...p, urgencyLevel: u.value }));
                      if (errors.urgencyLevel)
                        setErrors((p) => ({ ...p, urgencyLevel: "" }));
                    }}
                    isMobile={isMobile}
                  />
                ))}
              </Box>
              {errors.urgencyLevel && (
                <Typography
                  variant="caption"
                  color="error"
                  sx={{
                    mt: 0.5,
                    display: "block",
                    fontSize: { xs: 10, sm: 11 },
                  }}
                >
                  {errors.urgencyLevel}
                </Typography>
              )}
            </Box>

            <TextField
              fullWidth
              type="number"
              label="Team members using this (optional)"
              placeholder="e.g. 15"
              value={form.numberOfTeamMembers}
              onChange={setField("numberOfTeamMembers")}
              disabled={submitting}
              inputProps={{ min: 1, max: 10000 }}
              onKeyDown={(e) =>
                ["e", "E", "+", "-", "."].includes(e.key) && e.preventDefault()
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <GroupIcon
                      sx={{
                        fontSize: { xs: 14, sm: 16 },
                        color: alpha(PRIMARY, 0.5),
                      }}
                    />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiInputLabel-root": { fontSize: { xs: 12, sm: 14 } },
                "& .MuiInputBase-input": { fontSize: { xs: 13, sm: 14 } },
              }}
            />
          </Stack>
        )}

        {step === 1 && (
          <Stack spacing={{ xs: 1.5, sm: 1.75 }}>
            <TextField
              fullWidth
              multiline
              rows={isMobile ? 3 : 4}
              label="Detailed description *"
              placeholder="Describe the fields, sections, and how this checklist will be used…"
              value={form.detailedDescription}
              onChange={setField("detailedDescription")}
              error={!!errors.detailedDescription}
              helperText={
                errors.detailedDescription ||
                `${form.detailedDescription.length} / 2000 — be specific about fields, sections, special requirements`
              }
              disabled={submitting}
              inputProps={{ maxLength: 2000 }}
              sx={{
                "& .MuiInputLabel-root": { fontSize: { xs: 12, sm: 14 } },
                "& .MuiInputBase-input": { fontSize: { xs: 13, sm: 14 } },
              }}
            />

            <TextField
              fullWidth
              multiline
              rows={isMobile ? 2 : 3}
              label="Business justification *"
              placeholder="Explain why this checklist is needed and how it benefits operations…"
              value={form.businessJustification}
              onChange={setField("businessJustification")}
              error={!!errors.businessJustification}
              helperText={
                errors.businessJustification ||
                `${form.businessJustification.length} / 1000`
              }
              disabled={submitting}
              inputProps={{ maxLength: 1000 }}
              sx={{
                "& .MuiInputLabel-root": { fontSize: { xs: 12, sm: 14 } },
                "& .MuiInputBase-input": { fontSize: { xs: 13, sm: 14 } },
              }}
            />

            <Box>
              <Stack
                direction="row"
                alignItems="center"
                spacing={0.75}
                sx={{ mb: 0.75 }}
                flexWrap="wrap"
              >
                <Typography
                  variant="body2"
                  fontWeight={500}
                  sx={{ fontSize: { xs: 12, sm: 13 } }}
                >
                  Reference files
                </Typography>
                <Tooltip
                  title={`Accepted: ${ALLOWED_EXTENSIONS.join(", ")} · Max ${MAX_FILE_SIZE_MB} MB`}
                >
                  <InfoIcon
                    sx={{
                      fontSize: { xs: 13, sm: 14 },
                      color: "text.disabled",
                      cursor: "help",
                    }}
                  />
                </Tooltip>
                <Typography
                  variant="caption"
                  color="text.disabled"
                  sx={{ fontSize: { xs: 10, sm: 11 } }}
                >
                  (optional)
                </Typography>
              </Stack>

              <Box
                onClick={() => !submitting && fileRef.current?.click()}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragActive(false);
                  if (e.dataTransfer.files?.length)
                    processFiles(e.dataTransfer.files);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                sx={{
                  border: "1.5px dashed",
                  borderColor: dragActive
                    ? PRIMARY
                    : fileError
                      ? "error.main"
                      : isDark
                        ? "rgba(148, 163, 184, 0.28)"
                        : "#cbd5e1",
                  borderRadius: 2,
                  p: { xs: 2, sm: 2.5 },
                  textAlign: "center",
                  cursor: submitting ? "not-allowed" : "pointer",
                  bgcolor: dragActive
                    ? alpha(PRIMARY, 0.12)
                    : isDark
                      ? DARK_FIELD_BG
                      : "#f8fafc",
                  transition: "all 0.15s ease",
                  "&:hover": !submitting
                    ? {
                        borderColor: PRIMARY,
                        bgcolor: isDark ? DARK_FIELD_BG_SOFT : "#f1f5f9",
                      }
                    : {},
                  "&:active":
                    isMobile && !submitting ? { transform: "scale(0.98)" } : {},
                }}
              >
                <input
                  ref={fileRef}
                  type="file"
                  multiple
                  accept={ALLOWED_EXTENSIONS.map((e) => `.${e}`).join(",")}
                  onChange={(e) => {
                    if (e.target.files?.length) processFiles(e.target.files);
                    e.target.value = "";
                  }}
                  style={{ display: "none" }}
                  disabled={submitting}
                />
                <Box
                  sx={{
                    width: { xs: 32, sm: 36 },
                    height: { xs: 32, sm: 36 },
                    borderRadius: "50%",
                    bgcolor: alpha(PRIMARY, 0.12),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mx: "auto",
                    mb: 0.75,
                  }}
                >
                  <CloudUploadIcon
                    sx={{ color: isDark ? "#67e8f9" : PRIMARY, fontSize: { xs: 16, sm: 18 } }}
                  />
                </Box>
                <Typography
                  variant="body2"
                  fontWeight={500}
                  sx={{ fontSize: { xs: 12, sm: 13 }, color: isDark ? "#dbeafe" : "#1e293b" }}
                >
                  {dragActive ? "Drop files here" : "Click to upload"}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ fontSize: { xs: 10, sm: 11 }, color: isDark ? DARK_TEXT_MUTED : "#64748b" }}
                >
                  PDF, DOC, XLS, images · max {MAX_FILE_SIZE_MB} MB
                </Typography>
              </Box>

              {fileError && (
                <Typography
                  variant="caption"
                  color="error"
                  sx={{
                    mt: 0.5,
                    display: "block",
                    fontSize: { xs: 10, sm: 11 },
                  }}
                >
                  {fileError}
                </Typography>
              )}

              {files.length > 0 && (
                <Stack spacing={0.5} sx={{ mt: 1 }}>
                  {files.map(({ name, size }, idx) => (
                    <Box
                      key={`${name}-${idx}`}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        p: { xs: "4px 8px", sm: "5px 10px" },
                        borderRadius: 1.5,
                        border: "1px solid",
                        borderColor: isDark ? "rgba(148, 163, 184, 0.2)" : "#e2e8f0",
                        bgcolor: isDark ? DARK_FIELD_BG : "#f8fafc",
                      }}
                    >
                      <AttachFileIcon
                        sx={{
                          fontSize: { xs: 12, sm: 13 },
                          color: isDark ? "#8bddec" : PRIMARY,
                          flexShrink: 0,
                        }}
                      />
                      <Typography
                        variant="caption"
                        fontWeight={500}
                        sx={{
                          flex: 1,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          fontSize: { xs: 10, sm: 11 },
                          color: isDark ? "#e8eef6" : "#1e293b",
                        }}
                      >
                        {name}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          flexShrink: 0,
                          fontSize: { xs: 9, sm: 11 },
                          color: isDark ? DARK_TEXT_MUTED : "#64748b",
                        }}
                      >
                        {fmtSize(size)}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() =>
                          setFiles((p) => p.filter((_, i) => i !== idx))
                        }
                        disabled={submitting}
                        sx={{
                          p: 0.25,
                          color: "text.disabled",
                          "&:hover": { color: "error.main" },
                          "&:active": { transform: "scale(0.95)" },
                        }}
                      >
                        <DeleteIcon sx={{ fontSize: { xs: 12, sm: 13 } }} />
                      </IconButton>
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>

            <TextField
              fullWidth
              multiline
              rows={isMobile ? 1 : 2}
              label="Additional notes (optional)"
              placeholder="Any other context to help the Super Admin understand your requirements…"
              value={form.additionalNotes}
              onChange={setField("additionalNotes")}
              disabled={submitting}
              inputProps={{ maxLength: 500 }}
              helperText={`${form.additionalNotes.length} / 500`}
              sx={{
                "& .MuiInputLabel-root": { fontSize: { xs: 12, sm: 14 } },
                "& .MuiInputBase-input": { fontSize: { xs: 13, sm: 14 } },
              }}
            />
          </Stack>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          px: { xs: 2, sm: 2.75 },
          py: { xs: 1.5, sm: 1.75 },
          pb: { xs: "calc(12px + env(safe-area-inset-bottom))", sm: 1.75 },
          borderTop: "1px solid",
          borderColor: isDark ? "rgba(148, 163, 184, 0.16)" : "#e2e8f0",
          bgcolor: isDark ? "#0c1726" : "#f8fafc",
          justifyContent: "space-between",
          gap: 1,
          flexShrink: 0,
        }}
      >
        <Button
          variant="outlined"
          size={isMobile ? "small" : "medium"}
          disabled={submitting}
          onClick={step === 0 ? handleClose : () => setStep(0)}
          startIcon={
            step > 0 ? (
              <ArrowBackIcon sx={{ fontSize: { xs: 11, sm: 13 } }} />
            ) : null
          }
          sx={{
            minWidth: { xs: 70, sm: 90 },
            fontSize: { xs: 11, sm: 13 },
            borderColor: isDark ? "rgba(148, 163, 184, 0.3)" : "#cbd5e1",
            color: isDark ? "#cbd5e1" : "#475569",
            "&:hover": {
              borderColor: isDark ? "#94a3b8" : "#94a3b8",
              bgcolor: isDark ? "rgba(255, 255, 255, 0.04)" : "rgba(0, 0, 0, 0.04)",
            },
            "&:active": isMobile ? { transform: "scale(0.97)" } : {},
          }}
        >
          {step === 0 ? "Cancel" : "Back"}
        </Button>

        {step === 0 ? (
          <Button
            variant="contained"
            size={isMobile ? "small" : "medium"}
            onClick={() => {
              if (validateStep0()) setStep(1);
            }}
            endIcon={<ArrowForwardIcon sx={{ fontSize: { xs: 11, sm: 13 } }} />}
            sx={{
              minWidth: { xs: 90, sm: 130 },
              fontSize: { xs: 11, sm: 13 },
              bgcolor: PRIMARY,
              "&:hover": { bgcolor: PRIMARY_DARK },
              "&:active": isMobile ? { transform: "scale(0.97)" } : {},
            }}
          >
            Continue
          </Button>
        ) : (
          <Button
            variant="contained"
            size={isMobile ? "small" : "medium"}
            onClick={handleSubmit}
            disabled={submitting}
            startIcon={
              submitting ? (
                <CircularProgress size={isMobile ? 12 : 13} color="inherit" />
              ) : (
                <SendIcon sx={{ fontSize: { xs: 12, sm: 14 } }} />
              )
            }
            sx={{
              minWidth: { xs: 110, sm: 155 },
              fontSize: { xs: 11, sm: 13 },
              bgcolor: PRIMARY,
              "&:hover": { bgcolor: PRIMARY_DARK },
              "&:active": isMobile ? { transform: "scale(0.97)" } : {},
            }}
          >
            {submitting ? "Submitting…" : "Submit request"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

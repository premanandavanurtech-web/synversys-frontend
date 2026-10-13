// src/pages/TaskDetails.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  IconButton,
  TextField,
  Chip,
  Stack,
  CircularProgress,
  Alert,
  Snackbar,
  Grid,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  FormControl,
  Select,
  MenuItem,
  Rating,
  Checkbox,
  Tooltip,
  Fade,
  FormGroup,
  FormHelperText,
  ImageList,
  ImageListItem,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  styled,
} from "@mui/material/styles";
import {
  ArrowBack as ArrowBackIcon,
  Send as SendIcon,
  Close as CloseIcon,
  CloudUpload as CloudUploadIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  Description as DescriptionIcon,
  Draw as DrawIcon,
  Assignment as AssignmentIcon,
  LocationOn as LocationIcon,
  Category as CategoryIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Save as SaveIcon,
  InsertDriveFile as InsertDriveFileIcon,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { useTeamAssignment } from "../context/TeamAssignmentcontext";
import { useAuth } from "../context/AuthContexts";
import {
  areDraftValuesEqual,
  clearFormDraft,
  loadFormDraft,
  saveFormDraft,
} from "../utils/formDraft";

// ─── Theme (simplified, neutral) ───────────────────────────────────────────────
const STATUS_CFG = {
  pending: { label: "Pending" },
  in_progress: { label: "In Progress" },
  submitted: { label: "Submitted" },
  completed: { label: "Completed" },
  approved: { label: "Approved" },
  rejected: { label: "Rejected" },
};

const PRIORITY_CFG = {
  low: { label: "Low", color: "#16a34a", bg: "#f0fdf4" },
  medium: { label: "Medium", color: "#ca8a04", bg: "#fefce8" },
  high: { label: "High", color: "#f97316", bg: "#fff7ed" },
  critical: { label: "Critical", color: "#dc2626", bg: "#fef2f2" },
};

const formatDueDate = (value) => {
  if (!value) return "Not specified";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not specified";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

// ─── Styled ──────────────────────────────────────────────────────────────────
const SectionCard = styled(Paper)(({ theme }) => ({
  borderRadius: 8,
  border: `1px solid ${theme.palette.divider}`,
  marginBottom: 20,
  overflow: "hidden",
  backgroundColor: theme.palette.background.paper,
}));

const SectionHeader = styled(Box)(({ theme }) => ({
  padding: "14px 20px",
  borderBottom: `1px solid ${theme.palette.divider}`,
  display: "flex",
  alignItems: "center",
  gap: 10,
}));

const FieldWrapper = styled(Box)(({ theme }) => ({
  padding: "18px 20px",
  "&:not(:last-child)": { borderBottom: `1px solid ${theme.palette.divider}` },
}));

const InfoPill = ({ icon: Icon, label, value }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
  <Box
    sx={{
      display: "flex",
      alignItems: "flex-start",
      gap: 1.25,
      p: 1.5,
      border: `1px solid ${isDark ? "rgba(217, 226, 239, 0.78)" : "#E5E7EB"}`,
      borderRadius: 1.5,
    }}
  >
    <Icon sx={{ fontSize: 18, color: theme.palette.text.secondary, mt: 0.2 }} />
    <Box>
      <Typography
        sx={{
          fontSize: "0.68rem",
          fontWeight: 600,
          color: theme.palette.text.secondary,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          mb: 0.3,
        }}
      >
        {label}
      </Typography>
      <Typography sx={{ fontSize: "0.83rem", fontWeight: 600, color: theme.palette.text.primary }}>
        {value || "—"}
      </Typography>
    </Box>
  </Box>
  );
};

// ─── Signature Canvas ─────────────────────────────────────────────────────────
function SignatureCanvas({ value, onChange }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const canvasRef = useRef(null);
  const wrapperRef = useRef(null);
  const drawing = useRef(false);
  const lastPos = useRef(null);
  const activePointer = useRef(null);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = rect.width ? canvas.width / rect.width : 1;
    const scaleY = rect.height ? canvas.height / rect.height : 1;
    return {
      x: Math.max(0, Math.min(canvas.width, (e.clientX - rect.left) * scaleX)),
      y: Math.max(0, Math.min(canvas.height, (e.clientY - rect.top) * scaleY)),
    };
  };

  const setupContext = (canvas) => {
    const ctx = canvas.getContext("2d");
    ctx.strokeStyle = "#111827";
    ctx.fillStyle = "#111827";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    return ctx;
  };

  const syncCanvasSize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const nextWidth = Math.floor(rect.width);
    const nextHeight = Math.floor(rect.height);
    if (canvas.width === nextWidth && canvas.height === nextHeight) return;

    const snapshot = value ? canvas.toDataURL() : null;
    canvas.width = nextWidth;
    canvas.height = nextHeight;
    setupContext(canvas);

    if (snapshot) {
      const img = new Image();
      img.onload = () => {
        const ctx = setupContext(canvas);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = snapshot;
    }
  }, [value]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    syncCanvasSize();
    setupContext(canvas);
    const ro = new ResizeObserver(syncCanvasSize);
    if (wrapperRef.current) ro.observe(wrapperRef.current);
    return () => ro.disconnect();
  }, [syncCanvasSize]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !value) return;

    requestAnimationFrame(() => {
      syncCanvasSize();
      const img = new Image();
      img.onload = () => {
        const ctx = setupContext(canvas);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = value;
    });
  }, [value, syncCanvasSize]);

  const onMouseDown = (e) => {
    drawing.current = true;
    lastPos.current = getPos(e, canvasRef.current);
  };

  const onMouseMove = (e) => {
    if (!drawing.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPos.current = pos;
  };

  const onMouseUp = () => {
    if (!drawing.current) return;
    drawing.current = false;
    onChange(canvasRef.current.toDataURL());
  };

  const clearSig = () => {
    const canvas = canvasRef.current;
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    onChange("");
  };

  return (
    <Box sx={{ mt: 1.5 }}>
      <Box
        sx={{
          position: "relative",
          border: `1px dashed ${isDark ? "rgba(226, 232, 240, 0.78)" : "#D1D5DB"}`,
          bgcolor: isDark ? "rgba(15, 28, 46, 0.54)" : "transparent",
          borderRadius: 1.5,
          p: 1,
          overflow: "hidden",
        }}
      >
        <canvas
          ref={canvasRef}
          width={600}
          height={130}
          style={{
            display: "block",
            width: "100%",
            height: 130,
            cursor: "crosshair",
            touchAction: "none",
            filter: isDark ? "invert(1) brightness(1.35)" : "none",
          }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
        />
        {!value && (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
              gap: 0.75,
            }}
          >
            <DrawIcon sx={{ fontSize: 22, color: isDark ? "rgba(226, 232, 240, 0.7)" : "#D1D5DB" }} />
            <Typography sx={{ fontSize: "0.75rem", color: isDark ? "rgba(226, 232, 240, 0.74)" : "#9CA3AF" }}>
              Draw your signature
            </Typography>
          </Box>
        )}
      </Box>
      {value && (
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 0.75 }}>
          <Button
            size="small"
            onClick={clearSig}
            sx={{
              color: "#DC2626",
              fontSize: "0.75rem",
              p: 0,
              fontWeight: 600,
              "&:hover": { bgcolor: "transparent", textDecoration: "underline" },
            }}
          >
            Clear signature
          </Button>
        </Box>
      )}
    </Box>
  );
}

// ─── Image Upload Field ───────────────────────────────────────────────────────
function ImageUploadField({ fieldId, value, onChange, fieldLabel }) {
  const [previews, setPreviews] = useState([]);

  const handleFiles = (e) => {
    const files = Array.from(e.target.files || []);
    const newPrev = files.map((f) => ({
      file: f,
      url: URL.createObjectURL(f),
      name: f.name,
    }));
    setPreviews((p) => [...p, ...newPrev]);
    onChange(fieldId, [...(Array.isArray(value) ? value : []), ...files]);
    e.target.value = "";
  };

  const remove = (idx) => {
    URL.revokeObjectURL(previews[idx].url);
    const next = previews.filter((_, i) => i !== idx);
    setPreviews(next);
    onChange(fieldId, next.map((p) => p.file));
  };

  return (
    <Box sx={{ mt: 1.5 }}>
      <Box
        component="label"
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          p: 3,
          border: "1px dashed #D1D5DB",
          borderRadius: 1.5,
          cursor: "pointer",
          transition: "all 0.15s",
          "&:hover": { borderColor: "#9CA3AF" },
        }}
      >
        <CloudUploadIcon sx={{ fontSize: 24, color: "#9CA3AF", mb: 0.75 }} />
        <Typography sx={{ fontSize: "0.82rem", fontWeight: 600, color: "#6B7280", mb: 0.25 }}>
          {fieldLabel ? (
            <>Upload images for <Box component="span" sx={{ color: "#2563EB" }}>{fieldLabel}</Box></>
          ) : (
            <>Drag & drop or <Box component="span" sx={{ color: "#2563EB" }}>browse files</Box></>
          )}
        </Typography>
        <Typography sx={{ fontSize: "0.7rem", color: "#9CA3AF" }}>
          JPG, PNG, WEBP — max 10 MB each
        </Typography>
        <input type="file" multiple hidden accept="image/*" onChange={handleFiles} />
      </Box>
      {previews.length > 0 && (
        <ImageList cols={4} gap={8} sx={{ mt: 1.5 }}>
          {previews.map((img, idx) => (
            <ImageListItem
              key={idx}
              sx={{
                position: "relative",
                borderRadius: 1.5,
                overflow: "hidden",
                border: "1px solid #E5E7EB",
              }}
            >
              <img
                src={img.url}
                alt={img.name}
                style={{ height: 88, objectFit: "cover", width: "100%" }}
              />
              <IconButton
                size="small"
                onClick={() => remove(idx)}
                sx={{
                  position: "absolute",
                  top: 3,
                  right: 3,
                  bgcolor: "rgba(17,24,39,0.6)",
                  "&:hover": { bgcolor: "rgba(17,24,39,0.8)" },
                  width: 22,
                  height: 22,
                }}
              >
                <CloseIcon sx={{ fontSize: 12, color: "#fff" }} />
              </IconButton>
            </ImageListItem>
          ))}
        </ImageList>
      )}
    </Box>
  );
}

// ─── File Upload Field ────────────────────────────────────────────────────────
function FileUploadField({ fieldId, value, onChange, fieldLabel }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [fileList, setFileList] = useState([]);

  useEffect(() => {
    if (Array.isArray(value)) {
      setFileList(value);
    } else if (value && typeof value === "object") {
      setFileList([value]);
    } else {
      setFileList([]);
    }
  }, [value]);

  const handleFiles = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const current = Array.isArray(value) ? value : [];
    const next = [...current, ...files];
    setFileList(next);
    onChange(fieldId, next);
    e.target.value = "";
  };

  const removeFile = (idx) => {
    const current = Array.isArray(value) ? value : [];
    const next = current.filter((_, i) => i !== idx);
    setFileList(next);
    onChange(fieldId, next);
  };

  const formatFileSize = (bytes) => {
    if (!bytes && bytes !== 0) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Box sx={{ mt: 1.5 }}>
      <Box
        component="label"
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 2.5, sm: 3 },
          border: isDark
            ? "1.5px dashed rgba(148, 163, 184, 0.28)"
            : "1.5px dashed #CBD5E1",
          borderRadius: 1.5,
          cursor: "pointer",
          bgcolor: isDark ? "rgba(15, 23, 42, 0.45)" : "#F8FAFC",
          transition: "all 0.2s ease",
          "&:hover": {
            borderColor: isDark ? "#61d7ed" : "#1a5c6b",
            bgcolor: isDark
              ? "rgba(26, 92, 107, 0.14)"
              : "rgba(26, 92, 107, 0.04)",
          },
        }}
      >
        <CloudUploadIcon
          sx={{
            fontSize: 28,
            color: isDark ? "#61d7ed" : "#1a5c6b",
            mb: 0.75,
          }}
        />
        <Typography
          sx={{
            fontSize: "0.82rem",
            fontWeight: 600,
            color: isDark ? "#E2E8F0" : "#334155",
            mb: 0.25,
            textAlign: "center",
          }}
        >
          {fieldLabel ? (
            <>
              Upload file for{" "}
              <Box component="span" sx={{ color: isDark ? "#61d7ed" : "#1a5c6b" }}>
                {fieldLabel}
              </Box>
            </>
          ) : (
            <>
              Click or drag to{" "}
              <Box component="span" sx={{ color: isDark ? "#61d7ed" : "#1a5c6b" }}>
                browse files
              </Box>
            </>
          )}
        </Typography>
        <Typography sx={{ fontSize: "0.7rem", color: "#94A3B8" }}>
          PDF, DOC, DOCX, XLS, XLSX, TXT, images, ZIP — up to 25 MB
        </Typography>
        <input type="file" multiple hidden onChange={handleFiles} />
      </Box>

      {fileList.length > 0 && (
        <Stack spacing={1} sx={{ mt: 1.5 }}>
          {fileList.map((fileItem, idx) => {
            const fileName =
              fileItem.name ||
              (typeof fileItem === "string" ? fileItem : `File ${idx + 1}`);
            const fileSize =
              fileItem.size ? formatFileSize(fileItem.size) : "";
            return (
              <Box
                key={idx}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  p: 1.25,
                  borderRadius: 1.25,
                  bgcolor: isDark
                    ? "rgba(30, 41, 59, 0.7)"
                    : "#F1F5F9",
                  border: isDark
                    ? "1px solid rgba(148, 163, 184, 0.16)"
                    : "1px solid #E2E8F0",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.25,
                    minWidth: 0,
                  }}
                >
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: 1,
                      bgcolor: isDark
                        ? "rgba(97, 215, 237, 0.14)"
                        : "rgba(26, 92, 107, 0.1)",
                      color: isDark ? "#61d7ed" : "#1a5c6b",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <InsertDriveFileIcon sx={{ fontSize: 18 }} />
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      noWrap
                      sx={{
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        color: isDark ? "#F1F5F9" : "#0F172A",
                      }}
                    >
                      {fileName}
                    </Typography>
                    {fileSize && (
                      <Typography sx={{ fontSize: "0.68rem", color: "#94A3B8" }}>
                        {fileSize}
                      </Typography>
                    )}
                  </Box>
                </Box>
                <IconButton
                  size="small"
                  onClick={() => removeFile(idx)}
                  sx={{
                    color: "#94A3B8",
                    "&:hover": {
                      color: "#EF4444",
                      bgcolor: "rgba(239, 68, 68, 0.1)",
                    },
                  }}
                >
                  <CloseIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Box>
            );
          })}
        </Stack>
      )}
    </Box>
  );
}

// ─── Field Renderer ─────────────────────────────────────────────────────────
function FieldRenderer({ field, value, onChange }) {
  const fieldId = field._id;
  const inputSx = { mt: 1.25 };

  switch (field.type) {
    case "text_input":
      return (
        <TextField
          fullWidth
          value={value || ""}
          onChange={(e) => onChange(fieldId, e.target.value)}
          placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}…`}
          required={field.required}
          sx={inputSx}
        />
      );

    case "text_area":
      return (
        <TextField
          fullWidth
          multiline
          rows={4}
          value={value || ""}
          onChange={(e) => onChange(fieldId, e.target.value)}
          placeholder={field.placeholder || "Enter detailed notes…"}
          required={field.required}
          sx={inputSx}
        />
      );

    case "dropdown":
      return (
        <FormControl fullWidth sx={{ mt: 1.25 }} size="small" required={field.required}>
          <Select
            value={value || ""}
            onChange={(e) => onChange(fieldId, e.target.value)}
            displayEmpty
          >
            <MenuItem value="" disabled>
              Select an option
            </MenuItem>
            {field.options?.map((opt, i) => (
              <MenuItem key={i} value={opt}>
                {opt}
              </MenuItem>
            ))}
          </Select>
          {field.required && !value && (
            <FormHelperText error>This field is required</FormHelperText>
          )}
        </FormControl>
      );

    case "checkbox": {
      const isMulti = Array.isArray(field.options) && field.options.length > 0;
      if (isMulti) {
        const selected = Array.isArray(value) ? value : [];
        return (
          <FormGroup sx={{ mt: 1.25 }}>
            {field.options.map((opt, i) => (
              <FormControlLabel
                key={i}
                control={
                  <Checkbox
                    size="small"
                    checked={selected.includes(opt)}
                    onChange={(e) => {
                      const next = e.target.checked
                        ? [...selected, opt]
                        : selected.filter((v) => v !== opt);
                      onChange(fieldId, next);
                    }}
                  />
                }
                label={<Typography sx={{ fontSize: "0.83rem" }}>{opt}</Typography>}
              />
            ))}
          </FormGroup>
        );
      }
      return (
        <FormControlLabel
          sx={{ mt: 1.25 }}
          control={
            <Checkbox
              size="small"
              checked={value === true}
              onChange={(e) => onChange(fieldId, e.target.checked)}
            />
          }
          label={<Typography sx={{ fontSize: "0.83rem" }}>{field.label}</Typography>}
        />
      );
    }

    case "date":
      return (
        <TextField
          fullWidth
          type="date"
          value={value || ""}
          onChange={(e) => onChange(fieldId, e.target.value)}
          InputLabelProps={{ shrink: true }}
          required={field.required}
          sx={inputSx}
        />
      );

    case "number":
      return (
        <TextField
          fullWidth
          type="number"
          value={value || ""}
          onChange={(e) => onChange(fieldId, e.target.value)}
          placeholder={field.placeholder || "Enter a number"}
          inputProps={{ min: field.min, max: field.max }}
          required={field.required}
          sx={inputSx}
        />
      );

    case "rating": {
      const max = field.validation?.max || 5;
      return (
        <Box sx={{ mt: 1.5 }}>
          <Rating
            value={parseInt(value) || 0}
            onChange={(_, v) => onChange(fieldId, v)}
            max={max}
            size="large"
          />
          {value ? (
            <Typography sx={{ fontSize: "0.72rem", color: "#9CA3AF", mt: 0.3 }}>
              {value} / {max}
            </Typography>
          ) : (
            field.required && (
              <FormHelperText error>Rating required (1–{max})</FormHelperText>
            )
          )}
        </Box>
      );
    }

    case "image_upload":
      return (
        <ImageUploadField
          fieldId={fieldId}
          value={value}
          onChange={onChange}
          fieldLabel={field.label}
        />
      );

    case "file_upload":
    case "file":
    case "document_upload":
    case "attachment":
      return (
        <FileUploadField
          fieldId={fieldId}
          value={value}
          onChange={onChange}
          fieldLabel={field.label}
        />
      );

    case "signature":
      return <SignatureCanvas value={value} onChange={(v) => onChange(fieldId, v)} />;

    default:
      if (String(field.label || "").trim().toLowerCase() === "file upload") {
        return (
          <FileUploadField
            fieldId={fieldId}
            value={value}
            onChange={onChange}
            fieldLabel={field.label}
          />
        );
      }
      return (
        <TextField
          fullWidth
          multiline
          rows={2}
          value={value || ""}
          onChange={(e) => onChange(fieldId, e.target.value)}
          placeholder="Enter your response…"
          sx={inputSx}
        />
      );
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────
function serializeFieldValue(field, value) {
  if (value === undefined || value === null) return null;
  if (field.type === "image_upload") {
    return Array.isArray(value) ? `${value.length} image(s) uploaded` : null;
  }
  if (
    field.type === "file_upload" ||
    field.type === "file" ||
    field.type === "document_upload" ||
    field.type === "attachment" ||
    String(field.label || "").trim().toLowerCase() === "file upload"
  ) {
    if (Array.isArray(value)) {
      const names = value
        .map((f) => (f instanceof File ? f.name : typeof f === "string" ? f : f?.name || "file"))
        .filter(Boolean);
      return names.length ? names.join(", ") : `${value.length} file(s) uploaded`;
    }
    return typeof value === "string" ? value : null;
  }
  if (field.type === "checkbox" && Array.isArray(value)) {
    return value.join(", ");
  }
  if (field.type === "signature") {
    return value || null;
  }
  return value;
}

function getFieldTypeName(fieldType, label) {
  if (
    fieldType === "file_upload" ||
    fieldType === "file" ||
    fieldType === "document_upload" ||
    fieldType === "attachment" ||
    String(label || "").trim().toLowerCase() === "file upload"
  ) {
    return "file";
  }
  const map = {
    text_input: "text",
    text_area: "text",
    dropdown: "text",
    checkbox: "text",
    date: "text",
    number: "number",
    rating: "number",
    image_upload: "image",
    file_upload: "file",
    file: "file",
    signature: "text",
  };
  return map[fieldType] || "text";
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function TaskDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const {
    fetchTaskById,
    submitAssignment,
    submitPoa,
    submitting: contextSubmitting,
    loading: contextLoading,
  } = useTeamAssignment();
  const mountedRef = useRef(true);
  const draftReadyRef = useRef(false);
  const openedDraftRef = useRef({ responses: {}, notes: "" });
  const hadDraftOnOpenRef = useRef(false);
  const draftKey = `taskInspectionDraft:${id || "unknown"}`;
  const appTheme = useTheme();
  const isMobile = useMediaQuery(appTheme.breakpoints.down("sm"));
  const subtleBorder = appTheme.palette.mode === "dark" ? "rgba(217, 226, 239, 0.78)" : "#E5E7EB";

  const [task, setTask] = useState(null);
  const [responses, setResponses] = useState({});
  const [notes, setNotes] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [attachPreviews, setAttachPreviews] = useState([]);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [confirmCloseOpen, setConfirmCloseOpen] = useState(false);
  const [localSubmitting, setLocalSubmitting] = useState(false);
  const [localLoading, setLocalLoading] = useState(true);
  const [validationErrors, setValidationErrors] = useState({});
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [submissionInfo, setSubmissionInfo] = useState(null);
  const [poaDialogOpen, setPoaDialogOpen] = useState(false);
  const [poaConfirmOpen, setPoaConfirmOpen] = useState(false);
  const [poaFeedback, setPoaFeedback] = useState("");
  const [poaFiles, setPoaFiles] = useState([]);
  const [poaError, setPoaError] = useState("");
  const [snack, setSnack] = useState({ open: false, msg: "", severity: "success" });

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const toast = useCallback((msg, severity = "success") => {
    setSnack({ open: true, msg, severity });
  }, []);

  const checkIfAlreadySubmitted = useCallback(
    (taskData) => {
      if (
        taskData.status === "submitted" ||
        taskData.status === "approved" ||
        taskData.status === "completed"
      ) {
        return true;
      }

      const currentMember = taskData.assignedToTeamMembers?.find(
        (member) =>
          member.userId?.toString() === user?._id?.toString() ||
          member.userId === user?._id ||
          member.email === user?.email,
      );

      if (currentMember && currentMember.status === "completed") {
        return true;
      }

      if (taskData.totalSubmissions > 0 && taskData.myStatus === "completed") {
        return true;
      }

      return false;
    },
    [user],
  );

  const loadTask = useCallback(async () => {
    if (!id || id === "undefined" || id === "null") {
      toast("Invalid task ID", "error");
      navigate("/team");
      return;
    }

    setLocalLoading(true);
    const result = await fetchTaskById(id);
    if (!mountedRef.current) return;
    setLocalLoading(false);

    if (result.success && result.task) {
      const t = result.task;
      setTask(t);

      const submitted = checkIfAlreadySubmitted(t);
      setAlreadySubmitted(submitted);

      if (submitted) {
        setSubmissionInfo({
          status: t.status,
          completedAt: t.completedAt || t.updatedAt,
          message:
            t.status === "approved"
              ? "This inspection has been approved."
              : t.status === "submitted"
                ? "This inspection has been submitted and is pending review."
                : "This inspection has already been completed.",
        });
      }

      const existing = {};
      (t.checklistData || []).forEach((cl) => {
        (cl.responses || []).forEach((r) => {
          existing[r.fieldId] = r.value;
        });
      });
      const legacyDraft = !submitted ? loadFormDraft(`draft_${id}`) : null;
      const draft = !submitted ? loadFormDraft(draftKey) || legacyDraft : null;
      hadDraftOnOpenRef.current = Boolean(draft?.responses || draft?.notes);
      const openingResponses = draft?.responses ? { ...existing, ...draft.responses } : existing;
      const openingNotes = draft?.notes ?? t.notes ?? "";
      openedDraftRef.current = { responses: openingResponses, notes: openingNotes };
      setResponses(openingResponses);
      setNotes(openingNotes);
      draftReadyRef.current = true;
    } else {
      toast(result.error || "Failed to load task", "error");
      navigate("/team");
    }
  }, [id, fetchTaskById, toast, navigate, checkIfAlreadySubmitted, draftKey]);

  useEffect(() => {
    loadTask();
  }, [id]);

  const handleResponseChange = useCallback((fieldId, value) => {
    setResponses((prev) => ({ ...prev, [fieldId]: value }));
    setValidationErrors((prev) => {
      if (!prev[fieldId]) return prev;
      const next = { ...prev };
      delete next[fieldId];
      return next;
    });
  }, []);

  const handleAttachFiles = (e) => {
    const files = Array.from(e.target.files || []);
    setAttachments((prev) => [...prev, ...files]);
    setAttachPreviews((prev) => [
      ...prev,
      ...files.map((f) => ({ name: f.name, size: f.size })),
    ]);
    e.target.value = "";
  };

  const removeAttach = (idx) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
    setAttachPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const handlePoaFilesChange = (event) => {
    const files = Array.from(event.target.files || []);
    setPoaFiles((prev) => [...prev, ...files]);
    event.target.value = "";
  };

  const handleRemovePoaFile = (index) => {
    setPoaFiles((prev) => prev.filter((_, fileIndex) => fileIndex !== index));
  };

  const closePoaDialog = () => {
    if (isSubmitting) return;
    setPoaConfirmOpen(false);
    setPoaDialogOpen(false);
    setPoaFeedback("");
    setPoaFiles([]);
    setPoaError("");
  };

  const handleReviewPoaSubmit = () => {
    const feedback = poaFeedback.trim();
    if (!feedback) {
      setPoaError("Feedback is required");
      return;
    }
    setPoaError("");
    setPoaConfirmOpen(true);
  };

  const handleSubmitPoa = async () => {
    const feedback = poaFeedback.trim();
    if (!feedback) {
      setPoaError("Feedback is required");
      setPoaConfirmOpen(false);
      return;
    }

    if (!id || id === "undefined") {
      toast("Invalid assignment ID", "error");
      return;
    }

    const formData = new FormData();
    formData.append("feedback", feedback);
    poaFiles.forEach((file) => formData.append("attachments", file));

    setLocalSubmitting(true);
    try {
      const result = await submitPoa(id, formData);
      if (result.success) {
        toast(result.message || "POA submitted successfully", "success");
        setTask((prev) =>
          prev
            ? {
                ...prev,
                status: "submitted",
                myStatus: "submitted",
                poaSubmissions: [
                  ...(Array.isArray(prev.poaSubmissions) ? prev.poaSubmissions : []),
                  result.assignment?.poaSubmissions?.at?.(-1) || { feedback, submittedAt: new Date().toISOString() },
                ],
              }
            : prev,
        );
        setPoaConfirmOpen(false);
        setPoaDialogOpen(false);
        setPoaFeedback("");
        setPoaFiles([]);
        setPoaError("");
      } else {
        toast(result.error || "Failed to submit POA", "error");
      }
    } finally {
      setLocalSubmitting(false);
    }
  };

  const validateRequiredFields = () => {
    const fields = getFields();
    const errors = {};

    fields
      .filter((f) => f.required)
      .forEach((field) => {
        const v = responses[field._id];
        let valid = false;

        switch (field.type) {
          case "checkbox":
            valid = Array.isArray(v) && v.length > 0;
            break;
          case "rating":
            valid = v !== undefined && v !== null && Number(v) > 0;
            break;
          case "image_upload":
            valid = Array.isArray(v) && v.length > 0;
            break;
          case "file_upload":
          case "file":
          case "document_upload":
          case "attachment":
            valid = (Array.isArray(v) && v.length > 0) || (typeof v === "string" && v.trim().length > 0);
            break;
          case "signature":
            valid = typeof v === "string" && v.trim().length > 0;
            break;
          default:
            if (String(field.label || "").trim().toLowerCase() === "file upload") {
              valid = (Array.isArray(v) && v.length > 0) || (typeof v === "string" && v.trim().length > 0);
            } else {
              valid = v !== undefined && v !== null && v !== "";
            }
        }

        if (!valid) errors[field._id] = `${field.label} is required`;
      });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const getChecklist = () =>
    task?.checklistIds?.[0] ||
    task?.checklists?.[0] ||
    task?.checklistData?.[0] ||
    {};

  const getFields = () => getChecklist().fields || [];

  const buildResponsesPayload = () => {
    const checklist = getChecklist();
    const fields = checklist.fields || [];

    const checklistEntries =
      task?.checklistIds ||
      task?.checklists ||
      (checklist._id ? [checklist] : []);

    return checklistEntries.map((cl) => {
      const clId = cl._id || cl.checklistId || "";
      const clFields = cl.fields || fields;

      return {
        checklistId: clId,
        responses: clFields.map((field) => ({
          fieldId: field._id,
          fieldLabel: field.label,
          fieldType: getFieldTypeName(field.type, field.label),
          value: serializeFieldValue(field, responses[field._id]),
        })),
      };
    });
  };

  const computeMetrics = () => {
    const fields = getFields();
    let passed = 0,
      failed = 0,
      na = 0;

    fields.forEach((field) => {
      const v = responses[field._id];
      const hasValue =
        v !== undefined &&
        v !== null &&
        v !== "" &&
        !(Array.isArray(v) && v.length === 0);

      if (hasValue) {
        passed++;
      } else if (field.required) {
        failed++;
      } else {
        na++;
      }
    });

    const total = passed + failed + na || 1;
    const performanceRating = parseFloat(((passed / total) * 5).toFixed(1));

    return { passed, failed, na, performanceRating };
  };

  const handleSaveDraft = () => {
    if (alreadySubmitted) {
      toast("Cannot save draft - inspection already submitted", "warning");
      return;
    }

    saveFormDraft(draftKey, { id, responses, notes });
    toast("Draft saved!", "success");
  };

  const finishClose = ({ clearDraft = false, saveDraft = false } = {}) => {
    setConfirmCloseOpen(false);
    if (saveDraft) saveFormDraft(draftKey, { id, responses, notes });
    if (clearDraft) {
      clearFormDraft(draftKey);
      clearFormDraft(`draft_${id}`);
    }
    navigate("/team");
  };

  const handleCloseTask = () => {
    if (alreadySubmitted) {
      navigate("/team");
      return;
    }

    const currentDraft = { responses, notes };
    const unchanged = areDraftValuesEqual(currentDraft, openedDraftRef.current);
    if (unchanged) {
      finishClose({ clearDraft: !hadDraftOnOpenRef.current });
      return;
    }
    setConfirmCloseOpen(true);
  };

  useEffect(() => {
    if (!task?._id || alreadySubmitted || !draftReadyRef.current) return;
    saveFormDraft(draftKey, { id, responses, notes });
  }, [alreadySubmitted, draftKey, id, notes, responses, task?._id]);

  const handleSubmit = async () => {
    if (alreadySubmitted) {
      toast(
        "This inspection has already been submitted. You cannot submit it again.",
        "error",
      );
      setSubmitDialogOpen(false);
      return;
    }

    if (!id || id === "undefined") {
      toast("Invalid assignment ID", "error");
      return;
    }

    if (!validateRequiredFields()) {
      toast("Please complete all required fields before submitting", "error");
      setSubmitDialogOpen(false);
      return;
    }

    setLocalSubmitting(true);

    try {
      const formData = new FormData();

      const responsesPayload = buildResponsesPayload();
      formData.append("responses", JSON.stringify(responsesPayload));

      if (notes.trim()) formData.append("notes", notes.trim());

      formData.append("inspectorName", user?.name || user?.fullName || "Team Member");
      if (user?.email) formData.append("inspectorEmail", user.email);

      formData.append("overallCondition", "good");

      const { passed, failed, na, performanceRating } = computeMetrics();
      formData.append("itemsPassed", String(passed));
      formData.append("itemsFailed", String(failed));
      formData.append("itemsNA", String(na));
      formData.append("performanceRating", String(performanceRating));

      const fields = getFields();
      fields.forEach((field) => {
        if (field.type === "image_upload") {
          const imageFiles = responses[field._id];
          if (Array.isArray(imageFiles)) {
            imageFiles.forEach((file) => {
              if (file instanceof File) {
                formData.append("images", file);
              }
            });
          }
        } else if (
          field.type === "file_upload" ||
          field.type === "file" ||
          field.type === "document_upload" ||
          field.type === "attachment" ||
          String(field.label || "").trim().toLowerCase() === "file upload"
        ) {
          const fileItems = responses[field._id];
          if (Array.isArray(fileItems)) {
            fileItems.forEach((file) => {
              if (file instanceof File) {
                formData.append("attachments", file);
              }
            });
          }
        }
      });

      attachments.forEach((file) => {
        formData.append("attachments", file);
      });

      const result = await submitAssignment(id, formData);

      if (result.success) {
        clearFormDraft(draftKey);
        clearFormDraft(`draft_${id}`);

        toast("Inspection submitted successfully!", "success");
        setSubmitDialogOpen(false);
        setAlreadySubmitted(true);

        // setTimeout(() => navigate("/team"), 2000);
      } else {
        if (
          result.error &&
          (result.error.toLowerCase().includes("already") ||
            result.error.toLowerCase().includes("completed") ||
            result.error.toLowerCase().includes("submitted"))
        ) {
          setAlreadySubmitted(true);
          toast("This inspection has already been submitted.", "error");
        } else {
          throw new Error(result.error || "Submission failed");
        }
      }
    } catch (err) {
      console.error("[TaskDetails] Submission error:", err);
      toast(err.message || "Failed to submit inspection. Please try again.", "error");
    } finally {
      if (mountedRef.current) setLocalSubmitting(false);
    }
  };

  const checklist = getChecklist();
  const fields = getFields();
  const assetDetail = task?.assetIds?.[0] || {};
  const assetSummary = task?.assets?.[0] || {};
  const assetName = assetDetail.assetName || assetSummary.assetName || "—";

  const statusKey = (task?.status || "pending").toLowerCase();
  const priorityKey = (task?.priority || "medium").toLowerCase();
  const statusCfg = STATUS_CFG[statusKey] || STATUS_CFG.pending;
  const priorityCfg = PRIORITY_CFG[priorityKey] || PRIORITY_CFG.medium;

  const requiredFields = fields.filter((f) => f.required);
  const answeredRequired = requiredFields.filter((f) => {
    const v = responses[f._id];
    if (f.type === "checkbox") return Array.isArray(v) && v.length > 0;
    if (f.type === "rating") return v !== undefined && v !== null && Number(v) > 0;
    if (f.type === "image_upload") return Array.isArray(v) && v.length > 0;
    if (
      f.type === "file_upload" ||
      f.type === "file" ||
      f.type === "document_upload" ||
      f.type === "attachment" ||
      String(f.label || "").trim().toLowerCase() === "file upload"
    ) {
      return (Array.isArray(v) && v.length > 0) || (typeof v === "string" && v.trim().length > 0);
    }
    if (f.type === "signature") return typeof v === "string" && v.trim().length > 0;
    return v !== undefined && v !== null && v !== "";
  });
  const progressPct = requiredFields.length
    ? Math.round((answeredRequired.length / requiredFields.length) * 100)
    : 0;

  const isSubmitting = localSubmitting || contextSubmitting;
  const isLoading = localLoading || contextLoading;
  const poaSubmitted = Array.isArray(task?.poaSubmissions) && task.poaSubmissions.length > 0;

  // ── Already Submitted View ──────────────────────────────────────────────────
  if (!isLoading && alreadySubmitted && task) {
    return (
        <Box sx={{ minHeight: "100vh" }}>
          <Box sx={{ borderBottom: `1px solid ${appTheme.palette.divider}` }}>
            <Container maxWidth="lg" sx={{ py: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Tooltip title="Back to tasks">
                  <IconButton
                    onClick={handleCloseTask}
                    sx={{ border: `1px solid ${subtleBorder}`, borderRadius: 1.5 }}
                  >
                    <ArrowBackIcon sx={{ fontSize: 19 }} />
                  </IconButton>
                </Tooltip>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    sx={{
                      fontSize: "0.68rem",
                      fontWeight: 600,
                      color: "#9CA3AF",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      mb: 0.4,
                    }}
                  >
                    Inspection Task
                  </Typography>
                  <Typography variant="h6">{checklist.name || "Assignment"}</Typography>
                </Box>
              </Box>
            </Container>
          </Box>

          <Container maxWidth="lg" sx={{ py: 8 }}>
            <Paper
              variant="outlined"
              sx={{ textAlign: "center", py: 8, px: 4, borderRadius: 2 }}
            >
              <CheckCircleOutlineIcon sx={{ fontSize: 56, color: "#16A34A", mb: 2 }} />
              <Typography variant="h5" sx={{ mb: 1 }}>
                Inspection Already Submitted
              </Typography>
              <Typography sx={{ color: "#6B7280", mb: 3, maxWidth: 400, mx: "auto" }}>
                {submissionInfo?.message ||
                  "This inspection has already been submitted and cannot be modified."}
              </Typography>
              {submissionInfo?.completedAt && (
                <Typography variant="caption" sx={{ color: "#9CA3AF", display: "block", mb: 3 }}>
                  Submitted on: {new Date(submissionInfo.completedAt).toLocaleString()}
                </Typography>
              )}
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.25}
                justifyContent="center"
                alignItems="center"
              >
                <Button
                  variant="contained"
                  onClick={() => setPoaDialogOpen(true)}
                  disabled={poaSubmitted || isSubmitting}
                  startIcon={
                    isSubmitting ? (
                      <CircularProgress size={15} color="inherit" />
                    ) : (
                      <AssignmentIcon sx={{ fontSize: 17 }} />
                    )
                  }
                  sx={{ bgcolor: "#0c3d67", "&:hover": { bgcolor: "#082f50" } }}
                >
                  {poaSubmitted ? "POA Submitted" : "Submit POA"}
                </Button>
                <Button variant="contained" onClick={() => navigate("/team")}>
                  Back to My Tasks
                </Button>
              </Stack>
            </Paper>
          </Container>

          <Dialog
            open={poaDialogOpen}
            onClose={closePoaDialog}
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
                border: "1px solid #E5E7EB",
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
              <Typography sx={{ fontWeight: 800, color: "#111827", fontSize: "1.05rem" }}>
                Submit POA
              </Typography>
              <Typography sx={{ color: "#6B7280", fontSize: "0.8rem", mt: 0.35 }}>
                {assetName}
              </Typography>
            </DialogTitle>
            <DialogContent sx={{ pt: "12px !important", flex: 1, overflowY: "auto" }}>
              <Stack spacing={2}>
                <TextField
                  label="Feedback"
                  value={poaFeedback}
                  onChange={(event) => {
                    setPoaFeedback(event.target.value);
                    if (poaError && event.target.value.trim()) setPoaError("");
                  }}
                  multiline
                  minRows={4}
                  required
                  error={!!poaError}
                  helperText={poaError || " "}
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
                    startIcon={<CloudUploadIcon sx={{ fontSize: 17 }} />}
                    sx={{
                      borderRadius: 1.5,
                      borderColor: "#D1D5DB",
                      color: "#374151",
                      bgcolor: "#fff",
                      "&:hover": { borderColor: "#111827", bgcolor: "#F9FAFB" },
                    }}
                  >
                    Upload Attachments
                    <input hidden multiple type="file" onChange={handlePoaFilesChange} />
                  </Button>
                  <FormHelperText sx={{ ml: 0.25 }}>
                    Attach supporting files if needed.
                  </FormHelperText>
                  {poaFiles.length > 0 && (
                    <Stack spacing={1} sx={{ mt: 1.25 }}>
                      {poaFiles.map((file, index) => (
                        <Chip
                          key={`${file.name}-${index}`}
                          icon={<DescriptionIcon />}
                          label={file.name}
                          onDelete={() => handleRemovePoaFile(index)}
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
                borderTop: { xs: "1px solid #E5E7EB", sm: "none" },
              }}
            >
              <Button onClick={closePoaDialog} disabled={isSubmitting} sx={{ color: "#6B7280" }}>
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleReviewPoaSubmit}
                disabled={isSubmitting}
                startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
                sx={{
                  borderRadius: 1.5,
                  bgcolor: "#0c3d67",
                  boxShadow: "none",
                  "&:hover": { bgcolor: "#082f50", boxShadow: "none" },
                }}
              >
                Submit POA
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog
            open={poaConfirmOpen}
            onClose={() => !isSubmitting && setPoaConfirmOpen(false)}
            maxWidth="xs"
            fullWidth
            PaperProps={{
              sx: {
                borderRadius: 2,
                border: `1px solid ${subtleBorder}`,
              },
            }}
          >
            <DialogTitle sx={{ pt: 3, pb: 1.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <CheckCircleOutlineIcon sx={{ color: "#16A34A", fontSize: 26 }} />
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: "1rem" }}>
                    Ready to submit POA?
                  </Typography>
                  <Typography sx={{ fontSize: "0.72rem", color: "text.secondary", fontWeight: 400 }}>
                    Review before confirming
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>

            <DialogContent sx={{ pb: 0 }}>
              <Typography sx={{ fontSize: "0.84rem", color: "text.secondary", lineHeight: 1.6 }}>
                You're about to submit proof of action for this inspection. Once submitted, the POA will be sent for admin review.
              </Typography>

              <Alert severity="warning" icon={<WarningIcon sx={{ fontSize: 17 }} />} sx={{ mt: 2, borderRadius: 1.5 }}>
                You can keep editing now, or confirm and submit the POA.
              </Alert>

              <Box sx={{ mt: 2, p: 2, border: `1px solid ${subtleBorder}`, borderRadius: 1.5 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: "text.secondary" }}>
                    POA feedback
                  </Typography>
                  <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#16A34A" }}>
                    Ready
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={100}
                  sx={{
                    height: 5,
                    borderRadius: 3,
                    bgcolor: appTheme.palette.mode === "dark" ? "rgba(148, 163, 184, 0.16)" : "#E5E7EB",
                    "& .MuiLinearProgress-bar": {
                      borderRadius: 3,
                      bgcolor: "#16A34A",
                    },
                  }}
                />
                <Typography sx={{ fontSize: "0.7rem", color: "text.secondary", mt: 0.75 }}>
                  {poaFeedback.trim().length} characters entered
                  {poaFiles.length ? ` · ${poaFiles.length} attachment${poaFiles.length === 1 ? "" : "s"}` : ""}
                </Typography>
              </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2.5, gap: 1 }}>
              <Button
                onClick={() => setPoaConfirmOpen(false)}
                disabled={isSubmitting}
                variant="outlined"
                sx={{ flex: 1, borderColor: subtleBorder, color: "text.primary" }}
              >
                Keep Editing
              </Button>
              <Button
                onClick={handleSubmitPoa}
                variant="contained"
                disabled={isSubmitting}
                startIcon={isSubmitting ? <CircularProgress size={13} color="inherit" /> : null}
                sx={{ flex: 2, boxShadow: "none", bgcolor: "#0c3d67", "&:hover": { bgcolor: "#082f50" } }}
              >
                {isSubmitting ? "Submitting..." : "Confirm & Submit"}
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
    );
  }

  // ── Loading state ───────────────────────────────────────────────────────────
  if (isLoading && !task) {
    return (
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box sx={{ textAlign: "center" }}>
            <CircularProgress size={32} thickness={3} />
            <Typography sx={{ mt: 2, fontSize: "0.85rem", color: "#9CA3AF" }}>
              Loading assignment…
            </Typography>
          </Box>
        </Box>
    );
  }

  if (!task) return null;

  return (
      <Box sx={{ minHeight: "100vh" }}>
        {/* ── Header ── */}
        <Box sx={{ borderBottom: `1px solid ${appTheme.palette.divider}` }}>
          <Container maxWidth="lg" sx={{ py: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2.5 }}>
              <Tooltip title="Back to tasks">
                <IconButton
                  onClick={handleCloseTask}
                  sx={{ border: `1px solid ${subtleBorder}`, borderRadius: 1.5 }}
                >
                  <ArrowBackIcon sx={{ fontSize: 19 }} />
                </IconButton>
              </Tooltip>

              <Box sx={{ flex: 1 }}>
                <Typography
                  sx={{
                    fontSize: "0.68rem",
                    fontWeight: 600,
                    color: "#9CA3AF",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    mb: 0.4,
                  }}
                >
                  Inspection Task
                </Typography>
                <Typography variant="h6">{checklist.name || "Assignment"}</Typography>
                <Typography sx={{ fontSize: "0.78rem", color: "#9CA3AF", mt: 0.2 }}>
                  {assetName} · Ref #{task._id?.slice(-8)}
                </Typography>
              </Box>

              <Stack direction="row" spacing={1}>
                <Chip
                  label={statusCfg.label}
                  size="small"
                  variant="outlined"
                  sx={{ fontWeight: 600, fontSize: "0.72rem" }}
                />
                <Chip
                  label={priorityCfg.label}
                  size="small"
                  variant="outlined"
                  sx={{
                    fontWeight: 600,
                    fontSize: "0.72rem",
                    color: priorityCfg.color,
                    bgcolor: priorityCfg.bg,
                    borderColor: priorityCfg.color,
                  }}
                />
              </Stack>
            </Box>

            <Box sx={{ border: `1px solid ${subtleBorder}`, borderRadius: 1.5, p: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 1.25,
                }}
              >
                <Typography sx={{ fontSize: "0.78rem", fontWeight: 600, color: "#6B7280" }}>
                  Checklist Progress
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Typography sx={{ fontSize: "0.75rem", color: "#9CA3AF" }}>
                    {answeredRequired.length}/{requiredFields.length} required
                  </Typography>
                  <Typography sx={{ fontSize: "1rem", fontWeight: 700 }}>
                    {progressPct}%
                  </Typography>
                </Box>
              </Box>
              <LinearProgress
                variant="determinate"
                value={progressPct}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  bgcolor: appTheme.palette.mode === "dark" ? "rgba(148, 163, 184, 0.18)" : "#E5E7EB",
                  "& .MuiLinearProgress-bar": { borderRadius: 3 },
                }}
              />
            </Box>
          </Container>
        </Box>

        {/* ── Body ── */}
        <Container maxWidth="lg" sx={{ py: 3.5 }}>
          {Object.keys(validationErrors).length > 0 && (
            <Alert
              severity="warning"
              icon={<WarningIcon />}
              onClose={() => setValidationErrors({})}
              sx={{ mb: 3, borderRadius: 1.5, fontWeight: 600 }}
            >
              Please complete all required fields marked with *
            </Alert>
          )}

          {/* Asset Information */}
          <SectionCard elevation={0}>
            <SectionHeader>
              <AssignmentIcon sx={{ fontSize: 18, color: "#6B7280" }} />
              <Typography sx={{ fontWeight: 700, fontSize: "0.9rem" }}>
                Asset Information
              </Typography>
            </SectionHeader>
            <Box sx={{ p: 2.5 }}>
              <Grid container spacing={1.75}>
                <Grid item xs={12} sm={6} md={3} sx={{ width:"260px"}}>
                  <InfoPill icon={AssignmentIcon} label="Asset" value={assetName} />
                </Grid>
                <Grid item xs={12} sm={6} md={3} sx={{ width:"260px"}}>
                  <InfoPill
                    icon={LocationIcon}
                    label="Location"
                    value={assetDetail.currentLocation || assetDetail.location}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3} sx={{ width:"260px"}}>
                  <InfoPill
                    icon={CategoryIcon}
                    label="Category"
                    value={
                      checklist.category
                        ? checklist.category.charAt(0).toUpperCase() + checklist.category.slice(1)
                        : null
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3} sx={{ width:"260px"}}>
                  <InfoPill
                    icon={CalendarIcon}
                    label="Due Date"
                    value={formatDueDate(task.dueDate)}
                  />
                </Grid>
              </Grid>
            </Box>
          </SectionCard>

          {/* Checklist Fields */}
          <SectionCard elevation={0}>
            <SectionHeader>
              <CheckCircleIcon sx={{ fontSize: 18, color: "#6B7280" }} />
              <Typography sx={{ fontWeight: 700, fontSize: "0.9rem" }}>
                {checklist.name || "Inspection Fields"}
              </Typography>
              {fields.length > 0 && (
                <Chip
                  label={`${fields.length} field${fields.length !== 1 ? "s" : ""}`}
                  size="small"
                  variant="outlined"
                  sx={{ ml: "auto", fontWeight: 600, fontSize: "0.7rem", height: 22 }}
                />
              )}
            </SectionHeader>

            {fields.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 8 }}>
                <AssignmentIcon sx={{ fontSize: 40, color: "#D1D5DB", display: "block", mx: "auto", mb: 1.5 }} />
                <Typography sx={{ fontSize: "0.85rem", color: "#9CA3AF" }}>
                  No fields found for this checklist.
                </Typography>
              </Box>
            ) : (
              fields.map((field, idx) => (
                <Fade in key={field._id} timeout={100 + idx * 25}>
                  <FieldWrapper
                    sx={
                      validationErrors[field._id]
                        ? { borderLeft: "3px solid #DC2626" }
                        : {}
                    }
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.3 }}>
                      <Typography sx={{ fontSize: "0.84rem", fontWeight: 700 }}>
                        {field.label}
                      </Typography>
                      {field.required ? (
                        <Box
                          component="span"
                          sx={{ color: "#DC2626", fontSize: "0.9rem", lineHeight: 1, fontWeight: 700 }}
                        >
                          *
                        </Box>
                      ) : (
                        <Chip
                          label="Optional"
                          size="small"
                          variant="outlined"
                          sx={{ height: 16, fontSize: "0.63rem", color: "#9CA3AF", ml: 0.5 }}
                        />
                      )}
                    </Box>

                    {field.description && (
                      <Typography sx={{ fontSize: "0.75rem", color: "#9CA3AF", mb: 0.25 }}>
                        {field.description}
                      </Typography>
                    )}

                    <FieldRenderer
                      field={field}
                      value={responses[field._id] ?? ""}
                      onChange={handleResponseChange}
                    />

                    {validationErrors[field._id] && (
                      <FormHelperText error sx={{ mt: 0.75, fontSize: "0.75rem" }}>
                        {validationErrors[field._id]}
                      </FormHelperText>
                    )}
                  </FieldWrapper>
                </Fade>
              ))
            )}
          </SectionCard>

          {/* Additional Notes */}
          <SectionCard elevation={0}>
            <SectionHeader>
              <DescriptionIcon sx={{ fontSize: 18, color: "#6B7280" }} />
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: "0.9rem" }}>
                  Additional Notes
                </Typography>
                <Typography sx={{ fontSize: "0.7rem", color: "#9CA3AF" }}>
                  Optional comments or observations
                </Typography>
              </Box>
            </SectionHeader>
            <Box sx={{ p: 2.5 }}>
              <TextField
                fullWidth
                multiline
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional comments or observations about the inspection…"
              />
            </Box>
          </SectionCard>

          {/* Supporting Documents */}
          <SectionCard elevation={0}>
            <SectionHeader>
              <CloudUploadIcon sx={{ fontSize: 18, color: "#6B7280" }} />
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: "0.9rem" }}>
                  Supporting Documents
                </Typography>
                <Typography sx={{ fontSize: "0.7rem", color: "#9CA3AF" }}>
                  PDF, DOC, DOCX or images — uploaded as attachments
                </Typography>
              </Box>
            </SectionHeader>
            <Box sx={{ p: 2.5 }}>
              <Box
                component="label"
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  p: 3,
                  border: "1px dashed #D1D5DB",
                  borderRadius: 1.5,
                  cursor: "pointer",
                  transition: "all 0.15s",
                  "&:hover": { borderColor: "#9CA3AF" },
                }}
              >
                <CloudUploadIcon sx={{ fontSize: 24, color: "#9CA3AF", mb: 0.75 }} />
                <Typography sx={{ fontSize: "0.82rem", fontWeight: 600, color: "#6B7280", mb: 0.25 }}>
                  Click to upload or drag & drop
                </Typography>
                <Typography sx={{ fontSize: "0.7rem", color: "#9CA3AF" }}>
                  PDF, DOC, DOCX, images — up to 10 MB each
                </Typography>
                <input
                  type="file"
                  multiple
                  hidden
                  onChange={handleAttachFiles}
                  accept="image/*,.pdf,.doc,.docx"
                />
              </Box>

              {attachPreviews.length > 0 && (
                <Stack spacing={1} sx={{ mt: 2 }}>
                  {attachPreviews.map((f, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        px: 1.75,
                        py: 1.25,
                        border: "1px solid #E5E7EB",
                        borderRadius: 1.5,
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, overflow: "hidden" }}>
                        <DescriptionIcon sx={{ fontSize: 18, color: "#6B7280" }} />
                        <Box sx={{ overflow: "hidden" }}>
                          <Typography sx={{ fontSize: "0.8rem", fontWeight: 600 }} noWrap>
                            {f.name}
                          </Typography>
                          <Typography sx={{ fontSize: "0.68rem", color: "#9CA3AF" }}>
                            {(f.size / 1024).toFixed(1)} KB
                          </Typography>
                        </Box>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={() => removeAttach(idx)}
                        sx={{ color: "#DC2626", borderRadius: 1.5 }}
                      >
                        <CloseIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>
          </SectionCard>

          {/* Action Buttons */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, pb: 4 }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => setSubmitDialogOpen(true)}
              disabled={isSubmitting || alreadySubmitted}
              startIcon={
                isSubmitting ? (
                  <CircularProgress size={15} color="inherit" />
                ) : (
                  <SendIcon sx={{ fontSize: 17 }} />
                )
              }
              sx={{ px: 4, py: 1.1, boxShadow: "none" , background:"#0c3d67" , borderRadius: 2 }}
            >
              {alreadySubmitted
                ? "Already Submitted"
                : isSubmitting
                  ? "Submitting…"
                  : "Submit Inspection"}
            </Button>
          </Box>
        </Container>

        {/* Submit Confirmation Dialog */}
        <Dialog
          open={submitDialogOpen}
          onClose={() => !isSubmitting && setSubmitDialogOpen(false)}
          maxWidth="xs"
          fullWidth
          PaperProps={{ sx: { borderRadius: 2, border: "1px solid #E5E7EB" } }}
        >
          <DialogTitle sx={{ pt: 3, pb: 1.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <CheckCircleOutlineIcon sx={{ color: "#16A34A", fontSize: 26 }} />
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: "1rem" }}>
                  Ready to submit?
                </Typography>
                <Typography sx={{ fontSize: "0.72rem", color: "#9CA3AF", fontWeight: 400 }}>
                  Review before confirming
                </Typography>
              </Box>
            </Box>
          </DialogTitle>

          <DialogContent sx={{ pb: 0 }}>
            <Typography sx={{ fontSize: "0.84rem", color: "#6B7280", lineHeight: 1.6 }}>
              You're about to submit this inspection. Once submitted, changes require admin approval to revise.
            </Typography>

            <Alert severity="warning" icon={<WarningIcon sx={{ fontSize: 17 }} />} sx={{ mt: 2, borderRadius: 1.5 }}>
              This action cannot be undone without administrator approval.
            </Alert>

            <Box sx={{ mt: 2, p: 2, border: "1px solid #E5E7EB", borderRadius: 1.5 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: "#6B7280" }}>
                  Required fields
                </Typography>
                <Typography
                  sx={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    color: progressPct === 100 ? "#16A34A" : "#D97706",
                  }}
                >
                  {progressPct}% complete
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={progressPct}
                sx={{
                  height: 5,
                  borderRadius: 3,
                  bgcolor: "#E5E7EB",
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 3,
                    bgcolor: progressPct === 100 ? "#16A34A" : "#D97706",
                  },
                }}
              />
              <Typography sx={{ fontSize: "0.7rem", color: "#9CA3AF", mt: 0.75 }}>
                {answeredRequired.length} of {requiredFields.length} required fields answered
              </Typography>
            </Box>
          </DialogContent>

          <DialogActions sx={{ px: 3, py: 2.5, gap: 1 }}>
            <Button
              onClick={() => setSubmitDialogOpen(false)}
              disabled={isSubmitting}
              variant="outlined"
              sx={{ flex: 1, borderColor: "#D1D5DB", color: "#043468" }}
            >
              Keep Editing
            </Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={13} color="inherit" /> : null}
              sx={{ flex: 2, boxShadow: "none" }}
            >
              {isSubmitting ? "Submitting…" : "Confirm & Submit"}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={confirmCloseOpen}
          onClose={() => setConfirmCloseOpen(false)}
          maxWidth="xs"
          fullWidth
          PaperProps={{ sx: { borderRadius: 2, border: "1px solid #E5E7EB" } }}
        >
          <DialogTitle sx={{ pb: 1, fontWeight: 700 }}>
            Save details?
          </DialogTitle>
          <DialogContent sx={{ pt: 0 }}>
            <Typography sx={{ color: "#6B7280", fontSize: "0.9rem" }}>
              Do you want to save these details as a draft?
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
            <Button
              variant="outlined"
              onClick={() => finishClose({ clearDraft: true })}
              sx={{ color: "#043468", borderColor: "#D1D5DB" }}
            >
              No
            </Button>
            <Button
              variant="contained"
              onClick={() => finishClose({ saveDraft: true })}
              sx={{ bgcolor: "#0c3d67", boxShadow: "none" }}
            >
              Yes
            </Button>
          </DialogActions>
        </Dialog>

        {/* Toast */}
        <Snackbar
          open={snack.open}
          autoHideDuration={6000}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
  anchorOrigin={{ vertical: "top", horizontal: "right" }}>
          <Alert
            severity={snack.severity}
            onClose={() => setSnack((s) => ({ ...s, open: false }))}
            sx={{ borderRadius: 1.5, fontWeight: 600 }}
          >
            {snack.msg}
          </Alert>
        </Snackbar>
      </Box>
  );
}


// GlobalChecklistBuilder.jsx - Fully Responsive with All Issues Fixed

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  IconButton,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Divider,
  Rating,
  Checkbox,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Stack,
  Alert,
  Snackbar,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  useMediaQuery,
  useTheme,
  Drawer,
  Fab,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import AddIcon from "@mui/icons-material/Add";
import TitleIcon from "@mui/icons-material/Title";
import SubjectIcon from "@mui/icons-material/Subject";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CheckBoxOutlinedIcon from "@mui/icons-material/CheckBoxOutlined";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import GestureIcon from "@mui/icons-material/Gesture";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SaveIcon from "@mui/icons-material/Save";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import MenuIcon from "@mui/icons-material/Menu";
import { useChecklistBuilder } from "../context/ChecklistBuilderContext";
import { useNavigate } from "react-router-dom";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#1a4a5c" },
    background: { default: "#f4f5f7", paper: "#ffffff" },
    text: { primary: "#1a1d23", secondary: "#6b7280" },
  },
  typography: { fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" },
  shape: { borderRadius: 10 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 500,
          fontSize: 13,
          borderRadius: 8,
          boxShadow: "none",
          "&:hover": { boxShadow: "none" },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          fontSize: 14,
          "& fieldset": { borderColor: "#e5e7eb" },
          "&:hover fieldset": { borderColor: "#cbd5e1" },
          "&.Mui-focused fieldset": { borderColor: "#1a4a5c" },
        },
      },
    },
  },
});

// Field type definitions
const FIELD_TYPES = [
  {
    type: "text_input",
    label: "Text Input",
    icon: <TitleIcon sx={{ fontSize: 18, color: "#374151" }} />,
  },
  {
    type: "text_area",
    label: "Text Area",
    icon: <SubjectIcon sx={{ fontSize: 18, color: "#374151" }} />,
  },
  {
    type: "dropdown",
    label: "Dropdown",
    icon: <ExpandMoreIcon sx={{ fontSize: 18, color: "#374151" }} />,
  },
  {
    type: "checkbox",
    label: "Checkbox",
    icon: <CheckBoxOutlinedIcon sx={{ fontSize: 18, color: "#374151" }} />,
  },
  {
    type: "rating",
    label: "Rating",
    icon: <StarBorderIcon sx={{ fontSize: 18, color: "#374151" }} />,
  },
  {
    type: "image_upload",
    label: "Image Upload",
    icon: <ImageOutlinedIcon sx={{ fontSize: 18, color: "#374151" }} />,
  },
  {
    type: "signature",
    label: "Signature",
    icon: <GestureIcon sx={{ fontSize: 18, color: "#374151" }} />,
  },
  {
    type: "date",
    label: "Date Picker",
    icon: <CalendarTodayIcon sx={{ fontSize: 18, color: "#374151" }} />,
  },
  {
    type: "file_upload",
    label: "File Upload",
    icon: <AttachFileIcon sx={{ fontSize: 18, color: "#374151" }} />,
  },
];

function buildFieldDefaults(type) {
  switch (type) {
    case "dropdown":
      return { options: ["Option 1", "Option 2", "Option 3"] };
    case "rating":
      return { validation: { min: 1, max: 5 } };
    case "checkbox":
      return { options: ["Item 1", "Item 2"] };
    default:
      return {};
  }
}

// Option Editor Dialog
function OptionEditorDialog({ open, onClose, options, onSave }) {
  const [tempOptions, setTempOptions] = useState(
    options?.length ? options : ["Option 1", "Option 2"],
  );

  const handleSave = () => {
    onSave(tempOptions.filter((o) => o.trim()));
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: "16px" } }}
    >
      <DialogTitle sx={{ pb: 1 }}>Edit Options</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {tempOptions.map((option, i) => (
            <Box key={i} display="flex" alignItems="center" gap={1}>
              <TextField
                fullWidth
                size="small"
                value={option}
                onChange={(e) => {
                  const n = [...tempOptions];
                  n[i] = e.target.value;
                  setTempOptions(n);
                }}
                placeholder={`Option ${i + 1}`}
              />
              <IconButton
                size="small"
                color="error"
                onClick={() =>
                  setTempOptions(tempOptions.filter((_, j) => j !== i))
                }
              >
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
          <Button
            startIcon={<AddIcon />}
            variant="outlined"
            size="small"
            onClick={() =>
              setTempOptions([
                ...tempOptions,
                `Option ${tempOptions.length + 1}`,
              ])
            }
          >
            Add Option
          </Button>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          Save Options
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// Preview Dialog
function PreviewDialog({
  open,
  onClose,
  checklistName,
  description,
  category,
  tags,
  fields,
}) {
  const [values, setValues] = useState({});
  const [ratings, setRatings] = useState({});
  const [checked, setChecked] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const renderField = (field) => {
    switch (field.type) {
      case "text_input":
        return (
          <TextField
            fullWidth
            size="small"
            placeholder={
              field.placeholder || `Enter ${field.label.toLowerCase()}…`
            }
            value={values[field.id] || ""}
            onChange={(e) =>
              setValues((p) => ({ ...p, [field.id]: e.target.value }))
            }
          />
        );
      case "text_area":
        return (
          <TextField
            fullWidth
            multiline
            rows={isMobile ? 2 : 3}
            size="small"
            placeholder="Enter text…"
            value={values[field.id] || ""}
            onChange={(e) =>
              setValues((p) => ({ ...p, [field.id]: e.target.value }))
            }
          />
        );
      case "dropdown":
        return (
          <FormControl fullWidth size="small">
            <Select
              value={values[field.id] || ""}
              displayEmpty
              onChange={(e) =>
                setValues((p) => ({ ...p, [field.id]: e.target.value }))
              }
            >
              <MenuItem value="" disabled>
                Select an option…
              </MenuItem>
              {(field.options || []).map((o, i) => (
                <MenuItem key={i} value={o}>
                  {o}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      case "checkbox":
        return (
          <Stack spacing={0.5}>
            {(field.options || []).map((opt, i) => (
              <FormControlLabel
                key={i}
                control={
                  <Checkbox
                    checked={!!checked[`${field.id}_${i}`]}
                    onChange={(e) =>
                      setChecked((p) => ({
                        ...p,
                        [`${field.id}_${i}`]: e.target.checked,
                      }))
                    }
                    sx={{
                      color: "#1a4a5c",
                      "&.Mui-checked": { color: "#1a4a5c" },
                    }}
                  />
                }
                label={opt}
              />
            ))}
          </Stack>
        );
      case "rating":
        return (
          <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
            <Rating
              value={ratings[field.id] || 0}
              max={field.validation?.max || 5}
              onChange={(_, v) => setRatings((p) => ({ ...p, [field.id]: v }))}
              sx={{ "& .MuiRating-iconFilled": { color: "#1a4a5c" } }}
            />
            <Typography sx={{ fontSize: { xs: 11, sm: 12 }, color: "#9ca3af" }}>
              {ratings[field.id]
                ? `${ratings[field.id]}/${field.validation?.max || 5}`
                : `Rate 1–${field.validation?.max || 5}`}
            </Typography>
          </Box>
        );
      case "image_upload":
      case "file_upload":
        return (
          <Box
            sx={{
              border: "2px dashed #d1d5db",
              borderRadius: "8px",
              bgcolor: "#fafafa",
              py: { xs: 2, sm: 2.5 },
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 0.8,
              cursor: "pointer",
            }}
          >
            <ImageOutlinedIcon sx={{ fontSize: 28, color: "#d1d5db" }} />
            <Typography sx={{ fontSize: { xs: 11, sm: 13 }, color: "#9ca3af" }}>
              {field.type === "file_upload"
                ? "Click to upload file"
                : "Drag & drop or click to browse"}
            </Typography>
          </Box>
        );
      case "signature":
        return (
          <Box
            sx={{
              border: "1.5px solid #e5e7eb",
              borderRadius: "8px",
              height: { xs: 100, sm: 120 },
              bgcolor: "#fafafa",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography sx={{ fontSize: { xs: 11, sm: 12 }, color: "#9ca3af" }}>
              Signature pad
            </Typography>
          </Box>
        );
      case "date":
        return (
          <TextField
            fullWidth
            type="date"
            size="small"
            value={values[field.id] || ""}
            onChange={(e) =>
              setValues((p) => ({ ...p, [field.id]: e.target.value }))
            }
          />
        );
      default:
        return null;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: "16px", maxHeight: "90vh" } }}
    >
      <DialogTitle sx={{ p: { xs: 2, sm: 3 }, pb: { xs: 1, sm: 2 } }}>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          flexWrap="wrap"
          gap={1}
        >
          <Box>
            <Typography sx={{ fontSize: { xs: 18, sm: 20 }, fontWeight: 700 }}>
              Preview: {checklistName}
            </Typography>
            {description && (
              <Typography
                sx={{ fontSize: { xs: 12, sm: 13 }, color: "#6b7280", mt: 0.5 }}
              >
                {description}
              </Typography>
            )}
            <Box display="flex" gap={1} mt={1} flexWrap="wrap">
              {category && (
                <Chip
                  label={category}
                  size="small"
                  sx={{ bgcolor: "#e8f4f8", color: "#1a4a5c" }}
                />
              )}
              {tags?.slice(0, 3).map((tag, i) => (
                <Chip key={i} label={tag} size="small" variant="outlined" />
              ))}
            </Box>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers sx={{ p: { xs: 2, sm: 3 } }}>
        {submitted ? (
          <Box display="flex" flexDirection="column" alignItems="center" py={8}>
            <CheckCircleIcon sx={{ fontSize: 64, color: "#4caf50", mb: 2 }} />
            <Typography sx={{ fontSize: 18, fontWeight: 600 }}>
              Form Submitted Successfully!
            </Typography>
          </Box>
        ) : fields.length === 0 ? (
          <Box textAlign="center" py={8}>
            <Typography sx={{ fontSize: 14, color: "#9ca3af" }}>
              No fields to preview.
            </Typography>
          </Box>
        ) : (
          <Stack spacing={3}>
            {fields.map((field) => (
              <Box key={field.id}>
                <Typography
                  sx={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#374151",
                    mb: 1,
                  }}
                >
                  {field.label}
                  {field.required && " *"}
                </Typography>
                {renderField(field)}
              </Box>
            ))}
          </Stack>
        )}
      </DialogContent>
      <DialogActions
        sx={{
          p: { xs: 2, sm: 3 },
          pt: { xs: 1, sm: 2 },
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
        {!submitted && fields.length > 0 && (
          <Button
            onClick={() => {
              setSubmitted(true);
              setTimeout(() => {
                setSubmitted(false);
                onClose();
              }, 2000);
            }}
            variant="contained"
            sx={{ bgcolor: "#1a4a5c" }}
          >
            Submit Form
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

// Draggable field type pill
function DraggableFieldType({ fieldType, onDragStart, onAdd, isMobile }) {
  return (
    <Box
      draggable={!isMobile}
      onDragStart={(e) => onDragStart(e, fieldType)}
      onDragEnd={(e) => e.preventDefault()}
      onClick={() => onAdd(fieldType.type)}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.8,
        py: { xs: 1.2, sm: 1.6 },
        px: 1,
        cursor: isMobile ? "pointer" : "grab",
        borderRadius: "8px",
        transition: "all 0.12s",
        "&:hover": { bgcolor: "#f1f5f9" },
        "&:active": isMobile
          ? { transform: "scale(0.98)" }
          : { cursor: "grabbing" },
        userSelect: "none",
      }}
    >
      {fieldType.icon}
      <Typography
        sx={{
          fontSize: { xs: 12.5, sm: 13.5 },
          color: "#374151",
          fontWeight: 500,
        }}
      >
        {fieldType.label}
      </Typography>
    </Box>
  );
}

// Field card in builder
function FieldCard({
  field,
  index,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
  onLabelChange,
  onOptionsChange,
  isMobile,
}) {
  const [editingLabel, setEditingLabel] = useState(false);
  const [labelValue, setLabelValue] = useState(field.label);
  const [optionsOpen, setOptionsOpen] = useState(false);

  const commitLabel = () => {
    setEditingLabel(false);
    if (labelValue.trim() && labelValue !== field.label)
      onLabelChange(field.id, labelValue);
    else setLabelValue(field.label);
  };

  const renderPreview = () => {
    switch (field.type) {
      case "dropdown":
        return (
          <Box>
            <FormControl fullWidth size="small">
              <Select value="" displayEmpty disabled>
                <MenuItem value="" disabled>
                  Select an option…
                </MenuItem>
                {(field.options || []).map((o, i) => (
                  <MenuItem key={i} value={o}>
                    {o}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              size="small"
              onClick={() => setOptionsOpen(true)}
              sx={{ mt: 0.5, fontSize: { xs: 10, sm: 11 } }}
            >
              Edit Options ({field.options?.length || 0})
            </Button>
          </Box>
        );
      case "checkbox":
        return (
          <Box>
            <Stack spacing={0.25}>
              {(field.options || []).map((opt, i) => (
                <FormControlLabel
                  key={i}
                  control={<Checkbox disabled size="small" />}
                  label={
                    <Typography sx={{ fontSize: { xs: 11, sm: 12 } }}>
                      {opt}
                    </Typography>
                  }
                />
              ))}
            </Stack>
            <Button
              size="small"
              onClick={() => setOptionsOpen(true)}
              sx={{ mt: 0.5, fontSize: { xs: 10, sm: 11 } }}
            >
              Edit Options ({field.options?.length || 0})
            </Button>
          </Box>
        );
      case "text_input":
        return (
          <TextField
            fullWidth
            size="small"
            disabled
            placeholder={
              field.placeholder || `Enter ${field.label.toLowerCase()}…`
            }
          />
        );
      case "text_area":
        return (
          <TextField
            fullWidth
            multiline
            rows={2}
            size="small"
            disabled
            placeholder="Enter text…"
          />
        );
      case "rating":
        return (
          <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
            <Rating value={0} disabled max={field.validation?.max || 5} />
            <Typography sx={{ fontSize: { xs: 10, sm: 11 }, color: "#9ca3af" }}>
              1 – {field.validation?.max || 5}
            </Typography>
          </Box>
        );
      case "image_upload":
      case "file_upload":
        return (
          <Box
            sx={{
              border: "2px dashed #d1d5db",
              borderRadius: "8px",
              bgcolor: "#fafafa",
              py: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <ImageOutlinedIcon sx={{ fontSize: 28, color: "#d1d5db" }} />
            <Typography sx={{ fontSize: { xs: 11, sm: 12 }, color: "#9ca3af" }}>
              {field.type === "file_upload" ? "File Upload" : "Image Upload"}
            </Typography>
          </Box>
        );
      case "signature":
        return (
          <Box
            sx={{
              border: "1.5px solid #e5e7eb",
              borderRadius: "8px",
              height: 60,
              bgcolor: "#fafafa",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography sx={{ fontSize: { xs: 10, sm: 11 }, color: "#9ca3af" }}>
              Signature field
            </Typography>
          </Box>
        );
      case "date":
        return <TextField fullWidth type="date" size="small" disabled />;
      default:
        return null;
    }
  };

  return (
    <>
      <Box
        draggable={!isMobile}
        onDragStart={(e) => onDragStart(e, index)}
        onDragOver={onDragOver}
        onDrop={(e) => onDrop(e, index)}
        sx={{
          border: "1.5px solid #e5e7eb",
          borderRadius: "10px",
          p: { xs: "12px 14px", sm: "14px 16px" },
          mb: 1.5,
          bgcolor: "#fff",
          "&:hover": { borderColor: "#cbd5e1" },
          cursor: isMobile ? "default" : "grab",
          "&:active": isMobile ? {} : { cursor: "grabbing" },
        }}
      >
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mb={1}
          flexWrap="wrap"
          gap={1}
        >
          <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
            {!isMobile && (
              <DragIndicatorIcon sx={{ fontSize: 16, color: "#d1d5db" }} />
            )}
            {editingLabel ? (
              <TextField
                autoFocus
                value={labelValue}
                size="small"
                onChange={(e) => setLabelValue(e.target.value)}
                onBlur={commitLabel}
                onKeyPress={(e) => {
                  if (e.key === "Enter") commitLabel();
                }}
                sx={{
                  "& .MuiInputBase-input": {
                    fontSize: 13,
                    fontWeight: 600,
                    padding: "4px 8px",
                  },
                }}
              />
            ) : (
              <Typography
                onDoubleClick={() => setEditingLabel(true)}
                sx={{
                  fontSize: { xs: 12, sm: 13 },
                  fontWeight: 600,
                  color: "#374151",
                  cursor: "text",
                  "&:hover": { bgcolor: "#f5f5f5" },
                }}
              >
                {field.label}
              </Typography>
            )}
            <Chip
              label={field.type}
              size="small"
              sx={{
                fontSize: 10,
                height: 18,
                bgcolor: "#f1f5f9",
                color: "#6b7280",
              }}
            />
            {field.required && (
              <Chip
                label="required"
                size="small"
                sx={{
                  fontSize: 10,
                  height: 18,
                  bgcolor: "#fef2f2",
                  color: "#ef4444",
                }}
              />
            )}
          </Box>
          <IconButton
            size="small"
            onClick={() => onDelete(field.id)}
            sx={{ color: "#9ca3af", "&:hover": { color: "#e74c3c" } }}
          >
            <DeleteOutlineIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>
        {renderPreview()}
      </Box>
      {(field.type === "dropdown" || field.type === "checkbox") && (
        <OptionEditorDialog
          open={optionsOpen}
          onClose={() => setOptionsOpen(false)}
          options={field.options}
          onSave={(opts) => onOptionsChange(field.id, opts)}
        />
      )}
    </>
  );
}

// Main Component
export default function GlobalChecklistBuilder() {
  const navigate = useNavigate();
  const appTheme = useTheme();
  const isMobile = useMediaQuery(appTheme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(appTheme.breakpoints.between("sm", "md"));
  const isDark = appTheme.palette.mode === "dark";
  const headerBg = isDark ? "#0f1c2e" : "#fff";
  const headerBorder = isDark ? "rgba(148, 163, 184, 0.24)" : "#e5e7eb";
  const headerText = isDark ? "#f8fafc" : "#111827";
  const headerSubText = isDark ? "#cbd5e1" : "#6b7280";
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const {
    createChecklist,
    loading,
    error,
    clearMessages,
    prepareChecklistPayload,
  } = useChecklistBuilder();

  const [checklistName, setChecklistName] = useState(
    "Global Safety Inspection",
  );
  const [description, setDescription] = useState(
    "Standard safety checklist available to all users",
  );
  const [category, setCategory] = useState("safety");
  const [tags, setTags] = useState(["safety", "inspection", "global"]);
  const [tagInput, setTagInput] = useState("");
  const [globalScope] = useState("all_workspaces");
  const [fields, setFields] = useState([]);
  const [counter, setCounter] = useState(1);
  const [draggedFieldIndex, setDraggedFieldIndex] = useState(null);
  const [draggedFieldType, setDraggedFieldType] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const showSnack = (message, severity = "success") =>
    setSnackbar({ open: true, message, severity });

  const addField = (type) => {
    const config = FIELD_TYPES.find((f) => f.type === type);
    if (!config) return;
    const newField = {
      id: `field_${counter}`,
      type,
      label: config.label,
      required: false,
      placeholder: `Enter ${config.label.toLowerCase()}…`,
      order: fields.length,
      ...buildFieldDefaults(type),
    };
    setFields((prev) => [...prev, newField]);
    setCounter((c) => c + 1);
  };

  const deleteField = (id) => setFields((p) => p.filter((f) => f.id !== id));
  const updateFieldLabel = (id, newLabel) =>
    setFields((p) =>
      p.map((f) => (f.id === id ? { ...f, label: newLabel } : f)),
    );
  const updateFieldOptions = (id, options) =>
    setFields((p) => p.map((f) => (f.id === id ? { ...f, options } : f)));

  const handleAddTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) {
      setTags([...tags, t]);
      setTagInput("");
    }
  };

  const handleFieldDragStart = (e, index) => {
    if (isMobile) return;
    setDraggedFieldIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };
  const handleFieldDragOver = (e) => e.preventDefault();
  const handleFieldDrop = (e, dropIndex) => {
    if (isMobile) return;
    e.preventDefault();
    if (draggedFieldIndex === null || draggedFieldIndex === dropIndex) return;
    const reordered = [...fields];
    const [removed] = reordered.splice(draggedFieldIndex, 1);
    reordered.splice(dropIndex, 0, removed);
    setFields(reordered.map((f, i) => ({ ...f, order: i })));
    setDraggedFieldIndex(null);
  };

  const handleFieldTypeDragStart = (e, fieldType) => {
    if (isMobile) return;
    setDraggedFieldType(fieldType);
    e.dataTransfer.effectAllowed = "copy";
  };
  const handleDropZoneDrop = (e) => {
    e.preventDefault();
    if (draggedFieldType) {
      addField(draggedFieldType.type);
      setDraggedFieldType(null);
    }
  };

  const handleSave = async () => {
    if (!checklistName.trim()) {
      showSnack("Please enter a checklist name", "error");
      return;
    }
    if (fields.length === 0) {
      showSnack("Please add at least one field", "error");
      return;
    }
    for (const f of fields) {
      if (f.type === "rating" && (!f.validation?.min || !f.validation?.max)) {
        showSnack(
          `Rating field "${f.label}" must have min and max values`,
          "error",
        );
        return;
      }
      if (
        (f.type === "dropdown" || f.type === "checkbox") &&
        (!f.options || f.options.length === 0)
      ) {
        showSnack(`Field "${f.label}" must have at least one option`, "error");
        return;
      }
    }

    const payload = prepareChecklistPayload({
      name: checklistName.trim(),
      description: description.trim(),
      checklistType: "global",
      isGlobal: true,
      globalScope,
      category: category.trim() || "general",
      tags,
      status: "published",
      settings: {
        showProgressBar: true,
        allowSaveDraft: true,
        confirmationMessage: "Thank you for completing the checklist!",
      },
      fields,
    });

    const result = await createChecklist(payload);
    if (result.success) {
      showSnack("Global checklist created successfully!");
      setTimeout(() => navigate("/admin/checklists"), 2000);
    } else {
      showSnack(result.error || "Failed to create checklist", "error");
    }
  };

  useEffect(() => {
    if (error) showSnack(error, "error");
  }, [error]);

  const sidebarContent = (
    <Paper
      elevation={0}
      sx={{
        border: "1px solid #e5e7eb",
        borderRadius: "14px",
        p: { xs: 2, sm: 2.5 },
        height: "100%",
      }}
    >
      <Typography
        sx={{ fontSize: { xs: 13, sm: 14 }, fontWeight: 700, mb: 0.5 }}
      >
        Field Types
      </Typography>
      <Typography
        sx={{
          fontSize: { xs: 10, sm: 11 },
          color: "#9ca3af",
          mb: 2,
          fontStyle: "italic",
        }}
      >
        {isMobile ? "Tap to add" : "Click to add, or drag to canvas"}
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        {FIELD_TYPES.map((ft, i) => (
          <React.Fragment key={ft.type}>
            <DraggableFieldType
              fieldType={ft}
              onDragStart={handleFieldTypeDragStart}
              onAdd={addField}
              isMobile={isMobile}
            />
            {i < FIELD_TYPES.length - 1 && (
              <Divider sx={{ borderColor: "#f1f3f5" }} />
            )}
          </React.Fragment>
        ))}
      </Box>
    </Paper>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: "100vh", p: { xs: 1.5, sm: 2, md: 3 } }}>
        {/* Top Bar */}
        <Box
          sx={{
            bgcolor: headerBg,
            border: `1px solid ${headerBorder}`,
            px: { xs: 2, sm: 3, md: 4 },
            py: { xs: 1.5, sm: 1.8 },
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
            <IconButton
              size="small"
              onClick={() => navigate("/admin/checklists")}
              sx={{
                color: headerSubText,
                border: `1px solid ${headerBorder}`,
                borderRadius: "8px",
                p: 0.6,
              }}
            >
              <ArrowBackIcon sx={{ fontSize: 18 }} />
            </IconButton>
            <Box>
              <Typography
                sx={{ fontSize: { xs: 16, sm: 18 }, fontWeight: 700, color: headerText }}
              >
                Global Checklist Builder
              </Typography>
              <Typography
                sx={{ fontSize: { xs: 11, sm: 12 }, color: headerSubText }}
              >
                Create global checklists for organization-wide use
              </Typography>
            </Box>
          </Box>
          <Box display="flex" gap={1.5}>
            <Button
              startIcon={<VisibilityOutlinedIcon />}
              onClick={() => setPreviewOpen(true)}
              size={isMobile ? "small" : "medium"}
            >
              Preview
            </Button>
            <Button
              startIcon={loading ? null : <SaveIcon />}
              onClick={handleSave}
              disabled={loading}
              variant="contained"
              sx={{ bgcolor: "#1a4a5c" }}
              size={isMobile ? "small" : "medium"}
            >
              {loading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                "Save as Global"
              )}
            </Button>
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: 2.5,
            alignItems: "flex-start",
            flexDirection: { xs: "column", md: "row" },
          }}
        >
          {/* Canvas */}
          <Box
            flex={1}
            minWidth={0}
            width="100%"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDropZoneDrop}
          >
            {/* Metadata */}
            <Paper
              elevation={0}
              sx={{
                border: "1px solid #e5e7eb",
                borderRadius: "14px",
                p: { xs: 2, sm: 2.5, md: 3 },
                mb: 2,
              }}
            >
              <Typography
                sx={{
                  fontSize: { xs: 11, sm: 12.5 },
                  fontWeight: 600,
                  mb: 0.7,
                }}
              >
                Checklist Name *
              </Typography>
              <TextField
                fullWidth
                variant="standard"
                value={checklistName}
                onChange={(e) => setChecklistName(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Divider sx={{ mb: 2 }} />
              <Typography
                sx={{
                  fontSize: { xs: 11, sm: 12.5 },
                  fontWeight: 600,
                  mb: 0.7,
                }}
              >
                Description
              </Typography>
              <TextField
                fullWidth
                variant="standard"
                placeholder="Enter form description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Divider sx={{ mb: 2 }} />
              <Typography
                sx={{
                  fontSize: { xs: 11, sm: 12.5 },
                  fontWeight: 600,
                  mb: 0.7,
                }}
              >
                Category *
              </Typography>
              <TextField
                fullWidth
                variant="standard"
                placeholder="e.g., safety, quality, compliance"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Typography
                sx={{
                  fontSize: { xs: 11, sm: 12.5 },
                  fontWeight: 600,
                  mb: 0.7,
                }}
              >
                Tags
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1} sx={{ mb: 1 }}>
                {tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    size="small"
                    onDelete={() => setTags(tags.filter((t) => t !== tag))}
                    sx={{ bgcolor: "#e8f4f8", color: "#1a4a5c" }}
                  />
                ))}
              </Box>
              <TextField
                fullWidth
                variant="standard"
                placeholder="Add tag (press Enter)"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
            </Paper>

            {/* Fields canvas */}
            <Paper
              elevation={0}
              sx={{
                border: "1px solid #e5e7eb",
                borderRadius: "14px",
                p: { xs: 2, sm: 2.5, md: 3 },
                minHeight: 280,
                ...(draggedFieldType
                  ? {
                      borderColor: "#1a4a5c",
                      borderStyle: "dashed",
                      bgcolor: "#f8fafc",
                    }
                  : {}),
              }}
            >
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                flexWrap="wrap"
                gap={1}
                mb={2.5}
              >
                <Typography
                  sx={{ fontSize: { xs: 12, sm: 13.5 }, fontWeight: 700 }}
                >
                  Checklist Fields ({fields.length})
                </Typography>
                {isMobile && (
                  <Fab
                    size="small"
                    color="primary"
                    onClick={() => setSidebarOpen(true)}
                    sx={{
                      boxShadow: "none",
                      width: 32,
                      height: 32,
                      minHeight: 32,
                    }}
                  >
                    <MenuIcon sx={{ fontSize: 18 }} />
                  </Fab>
                )}
              </Box>
              {fields.length === 0 ? (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    py: { xs: 6, sm: 8 },
                    gap: 0.8,
                  }}
                >
                  <Typography
                    sx={{ fontSize: { xs: 13, sm: 14 }, color: "#9ca3af" }}
                  >
                    No fields added yet
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: { xs: 11, sm: 13 },
                      color: "#c4c9d4",
                      textAlign: "center",
                    }}
                  >
                    {isMobile
                      ? "Tap field types from the right panel"
                      : "Drag field types from the right panel or click a type to add"}
                  </Typography>
                </Box>
              ) : (
                <Box onDragOver={handleFieldDragOver}>
                  {fields.map((field, index) => (
                    <FieldCard
                      key={field.id}
                      field={field}
                      index={index}
                      onDelete={deleteField}
                      onLabelChange={updateFieldLabel}
                      onOptionsChange={updateFieldOptions}
                      onDragStart={handleFieldDragStart}
                      onDragOver={handleFieldDragOver}
                      onDrop={handleFieldDrop}
                      isMobile={isMobile}
                    />
                  ))}
                </Box>
              )}
            </Paper>
          </Box>

          {/* Sidebar - Desktop */}
          {!isMobile && (
            <Box sx={{ width: { sm: 260, md: 280 }, flexShrink: 0 }}>
              {sidebarContent}
            </Box>
          )}
        </Box>
      </Box>

      {/* Mobile Sidebar Drawer */}
      <Drawer
        anchor="right"
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      >
        <Box sx={{ width: 280, p: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
            <IconButton onClick={() => setSidebarOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          {sidebarContent}
        </Box>
      </Drawer>

      <PreviewDialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        checklistName={checklistName}
        description={description}
        category={category}
        tags={tags}
        fields={fields}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => {
          setSnackbar((s) => ({ ...s, open: false }));
          clearMessages();
        }}
  anchorOrigin={{ vertical: "top", horizontal: "right" }}>
        <Alert
          severity={snackbar.severity}
          onClose={() => {
            setSnackbar((s) => ({ ...s, open: false }));
            clearMessages();
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}

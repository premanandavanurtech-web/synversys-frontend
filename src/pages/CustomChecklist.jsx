// CustomChecklist.jsx - Fully Responsive with All Issues Fixed

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  areDraftValuesEqual,
  clearFormDraft,
  loadFormDraft,
  saveFormDraft,
} from "../utils/formDraft";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Grid,
  Paper,
  Divider,
  Chip,
  Stack,
  Checkbox,
  FormControlLabel,
  Rating,
  TextField,
  AppBar,
  Toolbar,
  CircularProgress,
  Snackbar,
  Alert,
  Skeleton,
  Select,
  MenuItem,
  FormControl,
  useMediaQuery,
  useTheme,
  Drawer,
  Fab,
  SwipeableDrawer,
  Card,
  CardContent,
  Collapse,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Dialog,
} from "@mui/material";
import { createTheme, ThemeProvider, alpha } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { useChecklistBuilder } from "../context/ChecklistBuilderContext";

// ── MUI Theme with responsive adjustments ─────────────────────────────────────────────────
const theme = createTheme({
  palette: {
    primary: { main: "#144c5c", dark: "#0d3a47", light: "#e8f4f7" },
    background: { default: "#f5f6f7", paper: "#ffffff" },
    text: { primary: "#111827", secondary: "#6b7280" },
  },
  typography: {
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    button: { textTransform: "none", fontWeight: 500 },
    h6: { fontSize: "1rem", fontWeight: 600 },
    body2: { fontSize: "0.875rem", lineHeight: 1.5 },
  },
  shape: { borderRadius: 12 },
  breakpoints: {
    values: { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          boxShadow: "none",
          padding: "6px 16px",
          "&:hover": { boxShadow: "none" },
        },
        sizeSmall: { padding: "4px 12px", fontSize: "0.75rem" },
        sizeLarge: { padding: "8px 24px", fontSize: "0.9375rem" },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: "none",
          border: "1px solid #e8ecef",
          transition: "all 0.2s ease",
        },
        elevation1: { boxShadow: "0 1px 2px rgba(0,0,0,0.05)" },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          fontSize: "0.875rem",
          "& fieldset": { borderColor: "#dde3e8" },
          "&:hover fieldset": { borderColor: "#144c5c !important" },
          "&.Mui-focused fieldset": {
            borderColor: "#144c5c !important",
            borderWidth: "2px",
          },
        },
        input: {
          padding: "12px 14px",
          "@media (max-width:600px)": { padding: "10px 12px" },
        },
        inputMultiline: { padding: "12px 14px" },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 20, fontSize: "0.6875rem", height: 26 },
        sizeSmall: { height: 22, fontSize: "0.625rem" },
      },
    },
    MuiSelect: {
      styleOverrides: {
        select: { padding: "12px 14px" },
      },
    },
  },
});

// ── Section Header ─────────────────────────────────────────────────────────
function SectionHeader({ title, isCollapsed, onToggle }) {
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box
      onClick={onToggle}
      sx={{
        background: "#f0f4f6",
        borderRadius: "10px",
        px: { xs: 1.5, sm: 2.25 },
        py: { xs: 1, sm: 1.5 },
        mb: { xs: 2, sm: 2.5 },
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        cursor: onToggle ? "pointer" : "default",
        transition: "background 0.2s",
        "&:hover": onToggle ? { background: "#e8ecef" } : {},
      }}
    >
      <Typography
        sx={{
          fontSize: { xs: "0.8125rem", sm: "0.9375rem" },
          fontWeight: 700,
          color: "#1a3a47",
        }}
      >
        {title}
      </Typography>
      {onToggle && (
        <IconButton size="small" sx={{ p: 0.5 }}>
          {isCollapsed ? (
            <ExpandMoreIcon sx={{ fontSize: 18 }} />
          ) : (
            <ExpandLessIcon sx={{ fontSize: 18 }} />
          )}
        </IconButton>
      )}
    </Box>
  );
}

// ── Field Label ────────────────────────────────────────────────────────────
function FieldLabel({ label, required }) {
  return (
    <Typography
      sx={{
        fontSize: { xs: "0.75rem", sm: "0.8125rem" },
        fontWeight: 600,
        color: "#144c5c",
        mb: 0.75,
      }}
    >
      {label}
      {required && <span style={{ color: "#dc2626", marginLeft: 2 }}>*</span>}
    </Typography>
  );
}


// ── Signature Pad (Touch Optimized) ──────────────────────────────────────────
function SignaturePad({ value, onChange }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const drawingRef = useRef(false);   // use ref instead of state to avoid re-render lag
  const lastRef = useRef(null);
  const activePointerRef = useRef(null);
  const [hasSig, setHasSig] = useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // ── Sync canvas pixel buffer to its CSS size ──────────────────────────────
  // Must run AFTER layout so getBoundingClientRect() is accurate.
  const syncCanvasSize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return false;
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return false;
    // Only resize if dimensions actually changed (avoids clearing on every call)
    if (canvas.width !== Math.floor(rect.width) || canvas.height !== Math.floor(rect.height)) {
      // Snapshot current drawing before the resize clears the buffer
      const snapshot = hasSig ? canvas.toDataURL() : null;
      canvas.width = Math.floor(rect.width);
      canvas.height = Math.floor(rect.height);
      if (snapshot) {
        const img = new Image();
        img.src = snapshot;
        img.onload = () => canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      }
    }
    return true;
  }, [hasSig]);

  // Run after first paint and on every resize
  useEffect(() => {
    syncCanvasSize();
    const ro = new ResizeObserver(() => syncCanvasSize());
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [syncCanvasSize]);

  // Restore value prop into canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !value) return;
    // Wait until canvas has real dimensions
    const tryDraw = () => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width) { requestAnimationFrame(tryDraw); return; }
      syncCanvasSize();
      const img = new Image();
      img.src = value;
      img.onload = () => {
        canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        setHasSig(true);
      };
    };
    tryDraw();
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Coordinate helper — no scaling needed, buffer matches CSS size 1:1 ──
  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const src = e.touches ? e.touches[0] : e;
    const scaleX = rect.width ? canvas.width / rect.width : 1;
    const scaleY = rect.height ? canvas.height / rect.height : 1;
    return {
      x: Math.max(0, Math.min(canvas.width,  (src.clientX - rect.left) * scaleX)),
      y: Math.max(0, Math.min(canvas.height, (src.clientY - rect.top) * scaleY)),
    };
  };

  const start = (e) => {
    e.preventDefault();
    // Re-sync on every stroke start — catches any layout shifts since last sync
    syncCanvasSize();
    const pos = getPos(e);
    const ctx = canvasRef.current.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    // Draw a dot so single taps/clicks are visible
    ctx.arc(pos.x, pos.y, (isMobile ? 2.5 : 1.8) / 2, 0, Math.PI * 2);
    ctx.fillStyle = "#1a3a47";
    ctx.fill();
    lastRef.current = pos;
    drawingRef.current = true;
    activePointerRef.current = e.pointerId ?? null;
    e.currentTarget?.setPointerCapture?.(e.pointerId);
  };

  const move = (e) => {
    e.preventDefault();
    if (!drawingRef.current || !lastRef.current) return;
    if (activePointerRef.current !== null && e.pointerId !== activePointerRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const pos = getPos(e);

    ctx.beginPath();
    ctx.moveTo(lastRef.current.x, lastRef.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = "#1a3a47";
    ctx.lineWidth = isMobile ? 2.5 : 1.8;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();

    lastRef.current = pos;
    setHasSig(true);
  };

  const end = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!drawingRef.current || !canvas) return;
    if (activePointerRef.current !== null && e?.pointerId !== activePointerRef.current) return;

    e?.currentTarget?.releasePointerCapture?.(e.pointerId);
    drawingRef.current = false;
    lastRef.current = null;
    activePointerRef.current = null;
    setHasSig(true);
    onChange && onChange(canvas.toDataURL());
  }, [onChange]);

  const cancel = useCallback(() => {
    drawingRef.current = false;
    lastRef.current = null;
    activePointerRef.current = null;
  }, []);

  const clear = () => {
    const canvas = canvasRef.current;
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    setHasSig(false);
    drawingRef.current = false;
    lastRef.current = null;
    activePointerRef.current = null;
    onChange && onChange(null);
  };

  return (
    <Box
      ref={containerRef}
      sx={{ border: "1px solid #dde3e8", borderRadius: "10px", background: "#fff", overflow: "hidden" }}
    >
      <Box sx={{ position: "relative", bgcolor: "#fafafa" }}>
        {!hasSig && (
          <Typography
            sx={{
              position: "absolute", top: "50%", left: "50%",
              transform: "translate(-50%,-50%)",
              fontSize: { xs: "0.6875rem", sm: "0.8125rem" },
              color: "#9ca3af", pointerEvents: "none", zIndex: 1,
              textAlign: "center", whiteSpace: "nowrap",
            }}
          >
            {isMobile ? "Tap and drag to sign" : "Draw your signature here"}
          </Typography>
        )}
        <canvas
          ref={canvasRef}
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerCancel={cancel}
          style={{
            display: "block",
            cursor: "crosshair",
            width: "100%",
            height: isMobile ? 100 : 120,
            touchAction: "none",
            backgroundColor: "#ffffff",
          }}
        />
      </Box>
      <Divider />
      <Box sx={{ px: { xs: 1.5, sm: 2 }, py: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography sx={{ fontSize: { xs: "0.625rem", sm: "0.75rem" }, color: "#144c5c" }}>
          {isMobile ? "Use finger or stylus to sign" : "Sign above using mouse or touch"}
        </Typography>
        {hasSig && (
          <Button
            size="small" onClick={clear}
            sx={{ fontSize: { xs: "0.6875rem", sm: "0.75rem" }, color: "#9ca3af", minWidth: 0, p: 0,
              "&:hover": { color: "#dc2626", background: "transparent" } }}
          >
            Clear
          </Button>
        )}
      </Box>
    </Box>
  );
}
// ── Dynamic Field Renderer (Mobile Optimized) ─────────────────────────────────
function DynamicField({ field, value, onChange }) {
  const handleChange = (val) => onChange(field._id || field.label, val);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [filePreview, setFilePreview] = useState([]);
  const fileInputRef = useRef(null);

useEffect(() => {
  if (Array.isArray(value) && value.length > 0 && field.type === "image_upload") {
    const previews = value.map((file) => URL.createObjectURL(file));
    setFilePreview(previews);
    return () => previews.forEach(URL.revokeObjectURL);
  } else {
    setFilePreview([]);
  }
}, [value, field.type]);

  switch (field.type) {
    case "text_input":
      return (
        <TextField
          fullWidth
          size="small"
          placeholder={field.placeholder || `Enter ${field.label}`}
          value={value || ""}
          onChange={(e) => handleChange(e.target.value)}
          sx={{
            width: "100%",
            "& .MuiOutlinedInput-root": {
              borderRadius: "10px",
              fontSize: { xs: "0.75rem", sm: "0.8125rem" },
            },
          }}
        />
      );

    case "text_area":
      return (
        <TextField
          fullWidth
          multiline
          minRows={isMobile ? 3 : 4}
          size="small"
          placeholder={field.placeholder || `Enter ${field.label}`}
          value={value || ""}
          onChange={(e) => handleChange(e.target.value)}
          sx={{
            width: "100%",
            "& .MuiOutlinedInput-root": {
              borderRadius: "10px",
              fontSize: { xs: "0.75rem", sm: "0.8125rem" },
            },
          }}
        />
      );

    case "dropdown":
      return (
        <FormControl fullWidth size="small" sx={{ width: "100%" }}>
          <Select
            value={value || ""}
            onChange={(e) => handleChange(e.target.value)}
            displayEmpty
            sx={{
              borderRadius: "10px",
              fontSize: { xs: "0.75rem", sm: "0.8125rem" },
              color: value ? "#374151" : "#9ca3af",
            }}
          >
            <MenuItem
              value=""
              disabled
              sx={{ fontSize: { xs: "0.75rem", sm: "0.8125rem" } }}
            >
              Select {field.label}
            </MenuItem>
            {(field.options || []).map((opt, i) => (
              <MenuItem
                key={i}
                value={opt}
                sx={{ fontSize: { xs: "0.75rem", sm: "0.8125rem" } }}
              >
                {opt}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      );

    case "checkbox":
      return (
        <Box
          sx={{
            width: "100%",
            border: "1px solid #dde3e8",
            borderRadius: "10px",
            px: { xs: 1.5, sm: 2 },
            py: { xs: 1, sm: 1.5 },
            background: "#fff",
          }}
        >
          <Stack spacing={1}>
            {(field.options || []).map((item, i) => (
              <FormControlLabel
                key={i}
                control={
                  <Checkbox
                    checked={
                      Array.isArray(value) ? value.includes(item) : false
                    }
                    onChange={() => {
                      const curr = Array.isArray(value) ? value : [];
                      const next = curr.includes(item)
                        ? curr.filter((v) => v !== item)
                        : [...curr, item];
                      handleChange(next);
                    }}
                    size="small"
                    sx={{
                      color: "#9ca3af",
                      "&.Mui-checked": { color: "#144c5c" },
                      p: 0.5,
                    }}
                  />
                }
                label={
                  <Typography
                    sx={{
                      fontSize: { xs: "0.75rem", sm: "0.8125rem" },
                      color: "#374151",
                    }}
                  >
                    {item}
                  </Typography>
                }
                sx={{ mx: 0, my: 0.25 }}
              />
            ))}
          </Stack>
        </Box>
      );

    case "rating": {
      const max = field.validation?.max || 5;
      return (
        <Box
          sx={{
            width: "100%",
            border: "1px solid #dde3e8",
            borderRadius: "10px",
            px: { xs: 1.5, sm: 2 },
            py: { xs: 1, sm: 1.5 },
            background: "#fff",
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            flexWrap: "wrap",
          }}
        >
          <Rating
            value={value || 0}
            onChange={(_, v) => handleChange(v)}
            max={max}
            size={isMobile ? "small" : "medium"}
            sx={{
              "& .MuiRating-iconFilled": { color: "#f59e0b" },
              "& .MuiRating-iconEmpty": { color: "#d1d5db" },
            }}
          />
          <Typography
            sx={{
              fontSize: { xs: "0.6875rem", sm: "0.75rem" },
              color: "#9ca3af",
            }}
          >
            {value ? `${value}/${max}` : `Rate from 1-${max}`}
          </Typography>
        </Box>
      );
    }

    case "date":
      return (
        <TextField
          fullWidth
          type="date"
          size="small"
          value={value || ""}
          onChange={(e) => handleChange(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{
            width: "100%",
            "& .MuiOutlinedInput-root": {
              borderRadius: "10px",
              fontSize: { xs: "0.75rem", sm: "0.8125rem" },
            },
          }}
        />
      );

    case "image_upload":
    case "file_upload":
      return (
        <Box>
          <Box
            component="label"
            sx={{
              display: "block",
              border: "1.5px dashed #c6d4da",
              borderRadius: "10px",
              py: { xs: 3, sm: 5 },
              px: { xs: 2, sm: 3 },
              textAlign: "center",
              background: "#fff",
              cursor: "pointer",
              "&:hover": { borderColor: "#144c5c", background: "#f0f9fb" },
              transition: "all 0.2s",
            }}
          >
            <input
            ref={fileInputRef}
              type="file"
              hidden
              accept={field.type === "image_upload" ? "image/*" : "*"}
              multiple
              onChange={(e) => handleChange(Array.from(e.target.files))}
            />
            <Box sx={{ mb: 1, display: "flex", justifyContent: "center" }}>
              <svg
                width={isMobile ? 32 : 40}
                height={isMobile ? 32 : 40}
                viewBox="0 0 40 40"
                fill="none"
              >
                <rect width="40" height="40" rx="8" fill="#f0f4f6" />
                <rect
                  x="10"
                  y="12"
                  width="20"
                  height="16"
                  rx="2"
                  stroke="#9ca3af"
                  strokeWidth="1.5"
                />
                <path
                  d="M14 22l4 4 8-8"
                  stroke="#9ca3af"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <circle cx="26" cy="16" r="3" fill="#c6d4da" />
              </svg>
            </Box>
            <Typography
              sx={{
                fontSize: { xs: "0.6875rem", sm: "0.8125rem" },
                color: "#374151",
                mb: 0.5,
              }}
            >
              {Array.isArray(value) && value.length > 0
                ? `${value.length} file(s) selected`
                : `Tap to ${field.type === "image_upload" ? "upload images" : "upload files"}`}
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: "0.625rem", sm: "0.75rem" },
                color: "#144c5c",
              }}
            >
              Max 10MB per file
            </Typography>
          </Box>
          {filePreview.length > 0 && (
            <Stack
              direction="row"
              spacing={1}
              sx={{ mt: 1.5, flexWrap: "wrap", gap: 1 }}
            >
              {filePreview.slice(0, 3).map((preview, idx) => (
  <Box
    key={idx}
    sx={{
      width: 60,
      height: 60,
      borderRadius: "8px",
      overflow: "visible",
      border: "1px solid #e8ecef",
      position: "relative",
    }}
  >
    <img
      src={preview}
      alt={`Preview ${idx}`}
      style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "8px" }}
    />
    <Box
     onClick={() => {
  const newFiles = (value || []).filter((_, i) => i !== idx);
  handleChange(newFiles);
  if (fileInputRef.current) fileInputRef.current.value = "";
}}
      sx={{
        position: "absolute",
        top: -6,
        right: -6,
        width: 18,
        height: 18,
        borderRadius: "50%",
        bgcolor: "#dc2626",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        fontSize: "0.625rem",
        fontWeight: 700,
        lineHeight: 1,
        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        "&:hover": { bgcolor: "#b91c1c" },
        zIndex: 1,
      }}
    >
      ✕
    </Box>
  </Box>
))}
              {filePreview.length > 3 && (
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: "8px",
                    bgcolor: "#f0f4f6",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "0.75rem",
                      color: "#144c5c",
                      fontWeight: 600,
                    }}
                  >
                    +{filePreview.length - 3}
                  </Typography>
                </Box>
              )}
            </Stack>
          )}
        </Box>
      );

    case "signature":
      return <SignaturePad value={value} onChange={handleChange} />;

    default:
      return (
        <TextField
          fullWidth
          size="small"
          placeholder={field.placeholder || `Enter ${field.label}`}
          value={value || ""}
          onChange={(e) => handleChange(e.target.value)}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "10px",
              fontSize: { xs: "0.75rem", sm: "0.8125rem" },
            },
          }}
        />
      );
  }
}

// ── Sidebar Detail Row (Mobile Optimized) ─────────────────────────────────────
function DetailRow({ iconEl, label, value, isTag }) {
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box
      sx={{
        display: "flex",
        gap: 1.5,
        alignItems: "flex-start",
        py: 1.25,
        borderBottom: "1px solid #f0f1f2",
      }}
    >
      <Box
        sx={{
          width: { xs: 32, sm: 34 },
          height: { xs: 32, sm: 34 },
          borderRadius: "8px",
          background: "#e8f4f7",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {iconEl}
      </Box>
      <Box sx={{ flex: 1 }}>
        <Typography
          sx={{
            fontSize: { xs: "0.625rem", sm: "0.6875rem" },
            color: "#9ca3af",
            mb: 0.25,
          }}
        >
          {label}
        </Typography>
        {isTag ? (
          <Stack direction="row" flexWrap="wrap" gap={0.6} mt={0.25}>
            {(Array.isArray(value) ? value : [value]).map((t) => (
              <Chip
                key={t}
                label={t}
                size="small"
                sx={{
                  background: "#e8f4f7",
                  color: "#144c5c",
                  fontWeight: 500,
                  fontSize: { xs: "0.625rem", sm: "0.6875rem" },
                }}
              />
            ))}
          </Stack>
        ) : (
          <Typography
            sx={{
              fontSize: { xs: "0.75rem", sm: "0.8125rem" },
              fontWeight: 500,
              color: "#1a3a47",
              wordBreak: "break-word",
            }}
          >
            {value || "—"}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

// ── SVG Icons (Scalable) ──────────────────────────────────────────────────────────────
const IconForm = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect
      x="2"
      y="2"
      width="12"
      height="12"
      rx="2"
      stroke="#144c5c"
      strokeWidth="1.4"
    />
    <path
      d="M5 6h6M5 9h4"
      stroke="#144c5c"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
  </svg>
);
const IconUser = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="5.5" r="2.5" stroke="#144c5c" strokeWidth="1.4" />
    <path
      d="M3 13c0-2.76 2.24-5 5-5s5 2.24 5 5"
      stroke="#144c5c"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
  </svg>
);
const IconCal = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect
      x="2"
      y="3"
      width="12"
      height="11"
      rx="2"
      stroke="#144c5c"
      strokeWidth="1.4"
    />
    <path
      d="M5 1v4M11 1v4M2 7h12"
      stroke="#144c5c"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
  </svg>
);
const IconHash = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path
      d="M4 6h8M4 10h8M6.5 3l-1 10M10.5 3l-1 10"
      stroke="#144c5c"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
  </svg>
);
const IconVer = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path
      d="M3 8h4M9 8h4M8 3v4M8 9v4"
      stroke="#144c5c"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
  </svg>
);
const IconTag = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path
      d="M2 2h6l6 6-6 6-6-6V2z"
      stroke="#144c5c"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
    <circle cx="5.5" cy="5.5" r="1" fill="#144c5c" />
  </svg>
);
const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path
      d="M2 7.5l3 3L12 3"
      stroke="#144c5c"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// ── Group fields into sections with responsive layout ─────────────────────────────
function groupFieldsIntoSections(fields) {
  if (!fields || fields.length === 0) return [];
  const basicTypes = ["text_input", "dropdown", "date"];
  const checkTypes = ["checkbox", "rating"];
  const docTypes = ["image_upload", "file_upload", "text_area", "signature"];

  const basic = fields.filter((f) => basicTypes.includes(f.type));
  const checks = fields.filter((f) => checkTypes.includes(f.type));
  const docs = fields.filter((f) => docTypes.includes(f.type));
  const other = fields.filter(
    (f) => ![...basicTypes, ...checkTypes, ...docTypes].includes(f.type),
  );

  const sections = [];
  if (basic.length > 0)
    sections.push({ title: "Basic Information", fields: basic });
  if (checks.length > 0)
    sections.push({ title: "Safety & Quality Checks", fields: checks });
  if (docs.length > 0)
    sections.push({ title: "Documentation & Media", fields: docs });
  if (other.length > 0)
    sections.push({ title: "Additional Information", fields: other });
  return sections.length > 0 ? sections : [{ title: "Form Fields", fields }];
}

// ── Loading Skeleton (Mobile Optimized) ───────────────────────────────────────
function FormSkeleton() {
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Paper sx={{ borderRadius: "14px", p: { xs: 2, sm: 3, md: 4.5 } }}>
      <Skeleton
        variant="text"
        width="60%"
        height={isMobile ? 28 : 36}
        sx={{ mb: 1 }}
      />
      <Skeleton
        variant="text"
        width="80%"
        height={isMobile ? 16 : 20}
        sx={{ mb: 3 }}
      />
      <Skeleton
        variant="rectangular"
        height={isMobile ? 38 : 40}
        sx={{ mb: 2, borderRadius: 2 }}
      />
      {[1, 2, 3].map((i) => (
        <Skeleton
          key={i}
          variant="rectangular"
          height={isMobile ? 70 : 60}
          sx={{ mb: 2, borderRadius: 2 }}
        />
      ))}
      <Skeleton
        variant="rectangular"
        height={isMobile ? 100 : 80}
        sx={{ mb: 2, borderRadius: 2 }}
      />
    </Paper>
  );
}

// ── Build API payload ──────────────────────────────────────────────────────
function buildChecklistPayload(checklist) {
  return {
    name: checklist.name,
    description: checklist.description || "",
    checklistType: checklist.checklistType || "custom",
    isGlobal: checklist.isGlobal ?? false,
    category: checklist.category || "general",
    tags: checklist.tags || [],
    fields: (checklist.fields || []).map((field, idx) => ({
      type: field.type,
      label: field.label,
      required: field.required ?? false,
      order: field.order ?? idx,
      ...(field.placeholder && { placeholder: field.placeholder }),
      ...(field.options &&
        field.options.length > 0 && { options: field.options }),
      ...(field.validation && { validation: field.validation }),
    })),
  };
}

// ── Main Page (Fully Responsive) ─────────────────────────────────────────────
export default function CustomChecklist({ checklistId }) {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState({});

  const {
    createChecklist,
    getChecklistById,
    convertAPIToUIField,
    loading,
    clearMessages,
  } = useChecklistBuilder();

  const [checklist, setChecklist] = useState(null);
  const [uiFields, setUiFields] = useState([]);
  const [formValues, setFormValues] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [pdfDownloading, setPdfDownloading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [fetchError, setFetchError] = useState(null);
  const [confirmCloseOpen, setConfirmCloseOpen] = useState(false);
  const formRef = useRef(null);
  const draftReadyRef = useRef(false);
  const openedDraftRef = useRef({});
  const hadDraftOnOpenRef = useRef(false);
  const draftKey = `checklistFormDraft:${checklistId || "demo"}`;

  const toggleSection = (sectionIndex) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [sectionIndex]: !prev[sectionIndex],
    }));
  };

  // Fetch checklist on mount
  useEffect(() => {
    if (!checklistId) {
      const demoChecklist = {
        _id: "demo-001",
        name: "Equipment Safety Inspection",
        description:
          "Complete this form to document equipment safety inspection results.",
        checklistType: "custom",
        isGlobal: false,
        category: "safety",
        tags: ["safety", "equipment", "inspection"],
        version: 1,
        status: "published",
        createdAt: "2024-11-27T00:00:00.000Z",
        createdBy: { name: "Safety Admin" },
        fields: [
          {
            _id: "f1",
            type: "text_input",
            label: "Equipment Name",
            placeholder: "Enter equipment name",
            required: true,
            order: 0,
          },
          {
            _id: "f2",
            type: "text_input",
            label: "Equipment ID",
            placeholder: "Enter equipment ID",
            required: true,
            order: 1,
          },
          {
            _id: "f3",
            type: "dropdown",
            label: "Location",
            required: true,
            options: ["Warehouse A", "Warehouse B", "Floor 1", "Floor 2"],
            order: 2,
          },
          {
            _id: "f4",
            type: "dropdown",
            label: "Equipment Category",
            required: true,
            options: ["Heavy Machinery", "Electronics", "Tools", "Vehicles"],
            order: 3,
          },
          {
            _id: "f5",
            type: "date",
            label: "Inspection Date",
            required: true,
            order: 4,
          },
          {
            _id: "f6",
            type: "text_input",
            label: "Inspector Name",
            required: true,
            order: 5,
          },
          {
            _id: "f7",
            type: "checkbox",
            label: "Pre-Inspection Checklist",
            required: true,
            options: [
              "Equipment is powered off",
              "Safety gear is available",
              "Area is clear of hazards",
              "Documentation is ready",
            ],
            order: 6,
          },
          {
            _id: "f8",
            type: "rating",
            label: "Overall Equipment Condition",
            required: true,
            validation: { min: 1, max: 5 },
            order: 7,
          },
          {
            _id: "f9",
            type: "image_upload",
            label: "Upload Equipment Photos",
            required: false,
            order: 8,
          },
          {
            _id: "f10",
            type: "text_area",
            label: "Additional Notes",
            required: false,
            order: 9,
          },
          {
            _id: "f11",
            type: "signature",
            label: "Inspector Signature",
            required: true,
            order: 10,
          },
        ],
      };
      setChecklist(demoChecklist);
      setUiFields(demoChecklist.fields.map((f) => ({ ...f, id: f._id })));
      return;
    }

    const fetchChecklist = async () => {
      const result = await getChecklistById(checklistId);
      if (result.success) {
        const data = result.data?.data || result.data;
        setChecklist(data);
        const fields = (data.fields || [])
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          .map((f) => convertAPIToUIField(f));
        setUiFields(fields);
      } else {
        setFetchError(result.error || "Failed to load checklist");
      }
    };
    fetchChecklist();
  }, [checklistId, getChecklistById, convertAPIToUIField]);

  useEffect(() => {
    const draft = loadFormDraft(draftKey);
    hadDraftOnOpenRef.current = Boolean(draft?.formValues);
    if (draft?.formValues) {
      setFormValues(draft.formValues);
      window.setTimeout(() => {
        openedDraftRef.current = draft.formValues;
        draftReadyRef.current = true;
      }, 0);
      return;
    }
    openedDraftRef.current = {};
    draftReadyRef.current = true;
  }, [draftKey]);

  useEffect(() => {
    if (!draftReadyRef.current) return;
    saveFormDraft(draftKey, { formValues });
  }, [draftKey, formValues]);

  const handleFieldChange = useCallback((key, value) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleClear = () => {
    setFormValues({});
    setSubmitted(false);
    clearFormDraft(draftKey);
    openedDraftRef.current = {};
    hadDraftOnOpenRef.current = false;
  };

  const finishClose = ({ clearDraft = false, saveDraft = false } = {}) => {
    setConfirmCloseOpen(false);
    if (saveDraft) saveFormDraft(draftKey, { formValues });
    if (clearDraft) clearFormDraft(draftKey);
    navigate("/admin/checklists");
  };

  const handleCloseForm = () => {
    const unchanged = areDraftValuesEqual(formValues, openedDraftRef.current);
    if (unchanged) {
      finishClose({ clearDraft: !hadDraftOnOpenRef.current });
      return;
    }
    setConfirmCloseOpen(true);
  };

  const handleSubmit = async () => {
    if (!checklist) return;
    setSubmitting(true);
    clearMessages();
    try {
      const payload = buildChecklistPayload(checklist);
      const result = await createChecklist(payload);
      if (result.success) {
        setSubmitted(true);
        clearFormDraft(draftKey);
        setSnackbar({
          open: true,
          message: "Checklist submitted successfully!",
          severity: "success",
        });
        setTimeout(() => navigate("/admin/checklists"), 1500);
      } else {
        throw new Error(result.error || "Failed to save checklist");
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || "Submission failed. Please try again.",
        severity: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!checklist || !formRef.current) return;
    setPdfDownloading(true);
    setSnackbar({
      open: true,
      message: "Generating PDF...",
      severity: "info",
    });
    try {
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import("jspdf"),
        import("html2canvas"),
      ]);
      const element = formRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const usableW = pageW - margin * 2;
      const imgH = (canvas.height * usableW) / canvas.width;

      pdf.setFillColor(20, 76, 92);
      pdf.rect(0, 0, pageW, 14, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      pdf.text(checklist.name || "Checklist Form", margin, 9.5);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7);
      pdf.text(
        `Generated: ${new Date().toLocaleString()}`,
        pageW - margin,
        9.5,
        { align: "right" },
      );

      const startY = 18;
      const availableH = pageH - startY - margin;
      let yOffset = 0,
        page = 1;
      while (yOffset < imgH) {
        if (page > 1) {
          pdf.addPage();
          pdf.setFillColor(20, 76, 92);
          pdf.rect(0, 0, pageW, 14, "F");
          pdf.setTextColor(255, 255, 255);
          pdf.setFontSize(10);
          pdf.setFont("helvetica", "bold");
          pdf.text(checklist.name || "Checklist Form", margin, 9.5);
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(7);
          pdf.text(`Page ${page}`, pageW - margin, 9.5, { align: "right" });
        }
        const sliceH = Math.min(availableH, imgH - yOffset);
        const srcY = (yOffset / imgH) * canvas.height;
        const srcH = (sliceH / imgH) * canvas.height;
        const sliceCanvas = document.createElement("canvas");
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = srcH;
        sliceCanvas
          .getContext("2d")
          .drawImage(
            canvas,
            0,
            srcY,
            canvas.width,
            srcH,
            0,
            0,
            canvas.width,
            srcH,
          );
        pdf.addImage(
          sliceCanvas.toDataURL("image/jpeg", 0.92),
          "JPEG",
          margin,
          startY,
          usableW,
          sliceH,
        );
        yOffset += sliceH;
        page++;
      }

      pdf.setFillColor(240, 244, 246);
      pdf.rect(0, pageH - 8, pageW, 8, "F");
      pdf.setTextColor(107, 114, 128);
      pdf.setFontSize(7);
      pdf.setFont("helvetica", "normal");
      const formId =
        checklist._id !== "demo-001" ? checklist._id : "FORM-2024-001";
      pdf.text(
        `Form ID: ${formId} | v${checklist.version || 1}.0`,
        margin,
        pageH - 2.5,
      );
      pdf.text(`Total pages: ${page - 1}`, pageW - margin, pageH - 2.5, {
        align: "right",
      });

      pdf.save(
        `${(checklist.name || "checklist").replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`,
      );
      setSnackbar({
        open: true,
        message: "PDF downloaded successfully!",
        severity: "success",
      });
    } catch (err) {
      console.error("PDF generation error:", err);
      setSnackbar({
        open: true,
        message: "Failed to generate PDF. Please try again.",
        severity: "error",
      });
    } finally {
      setPdfDownloading(false);
    }
  };

  const sections = groupFieldsIntoSections(checklist?.fields || []);
  const createdAt = checklist?.createdAt
    ? new Date(checklist.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";
  const createdByName =
    typeof checklist?.createdBy === "object"
      ? checklist?.createdBy?.name || checklist?.createdBy?.email || "Admin"
      : "Admin";

  const requiredCount = (checklist?.fields || []).filter(
    (f) => f.required,
  ).length;
  const filledCount = (checklist?.fields || []).filter((f) => {
    const key = f._id || f.label;
    const val = formValues[key];
    return (
      f.required &&
      val !== undefined &&
      val !== null &&
      val !== "" &&
      !(Array.isArray(val) && val.length === 0)
    );
  }).length;
  const completionPercent =
    requiredCount > 0 ? Math.round((filledCount / requiredCount) * 100) : 100;

  // Sidebar content
  const sidebarContent = (
    <Paper sx={{ borderRadius: "14px", p: { xs: 2, sm: 2.5 }, height: "100%"  }}>
      <Typography
        sx={{
          fontSize: { xs: "0.875rem", sm: "1rem" },
          fontWeight: 700,
          color: "#1a3a47",
          mb: 1,
        }}
      >
        Form Details
      </Typography>
      {loading && !checklist ? (
        <>
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} height={48} sx={{ mb: 0.5 }} />
          ))}
        </>
      ) : checklist ? (
        <>
          <DetailRow
            iconEl={<IconForm />}
            label="Form Name"
            value={checklist.name}
          />
          <DetailRow
            iconEl={<IconUser />}
            label="Created By"
            value={createdByName}
          />
          <DetailRow
            iconEl={<IconCal />}
            label="Created On"
            value={createdAt}
          />
          <DetailRow
            iconEl={<IconForm />}
            label="Category"
            value={checklist.category || "Custom Form"}
          />
          <DetailRow
            iconEl={<IconHash />}
            label="Total Fields"
            value={String(checklist.fields?.length || 0)}
          />
          <DetailRow
            iconEl={<IconVer />}
            label="Form Version"
            value={`v${checklist.version || 1}.0`}
          />
          {checklist.tags?.length > 0 && (
            <DetailRow
              iconEl={<IconTag />}
              label="Tags"
              value={checklist.tags}
              isTag
            />
          )}
        </>
      ) : null}

      {checklist && (
        <Box
          sx={{
            mt: 2,
            background: "#f0f4f6",
            borderRadius: "10px",
            px: 2,
            py: 1.5,
          }}
        >
          <Stack direction="row" justifyContent="space-between" mb={0.75}>
            <Typography
              sx={{
                fontSize: { xs: "0.6875rem", sm: "0.75rem" },
                fontWeight: 600,
                color: "#1a3a47",
              }}
            >
              Completion
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: "0.6875rem", sm: "0.75rem" },
                color: "#144c5c",
                fontWeight: 700,
              }}
            >
              {filledCount}/{requiredCount} required
            </Typography>
          </Stack>
          <Box
            sx={{
              height: 6,
              borderRadius: 3,
              background: "#dde3e8",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                height: "100%",
                width: `${completionPercent}%`,
                background: completionPercent === 100 ? "#16a34a" : "#144c5c",
                borderRadius: 3,
                transition: "width 0.3s ease",
              }}
            />
          </Box>
          <Typography
            sx={{
              fontSize: { xs: "0.625rem", sm: "0.6875rem" },
              color: "#9ca3af",
              mt: 0.5,
            }}
          >
            {completionPercent === 100
              ? "All required fields completed ✓"
              : `${100 - completionPercent}% remaining`}
          </Typography>
        </Box>
      )}

      <Box
        sx={{
          mt: 2,
          background: "#f0f4f6",
          borderRadius: "10px",
          px: 2,
          py: 1.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 1,
          cursor: "pointer",
          "&:hover": { background: alpha("#144c5c", 0.08) },
          transition: "background 0.2s",
        }}
      >
        <IconCheck />
        <Typography
          sx={{
            fontSize: { xs: "0.75rem", sm: "0.8125rem" },
            fontWeight: 500,
            color: "#144c5c",
          }}
        >
          Ready to Submit
        </Typography>
      </Box>
    </Paper>
  );

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ minHeight: "100vh", bgcolor: "#f5f6f7", pb: 4 }}>
        {/* AppBar - Sticky with mobile optimizations */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{ background: "#fff", borderBottom: "1px solid #e5e7eb" }}
        >
          <Toolbar
            sx={{
              justifyContent: "space-between",
              minHeight: { xs: "56px !important", sm: "60px !important" },
              px: { xs: 1.5, sm: 2, md: 3.5 },
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              spacing={1.25}
              sx={{ flex: 1, minWidth: 0 }}
            >
              <IconButton
                size="small"
                sx={{
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  width: { xs: 28, sm: 32 },
                  height: { xs: 28, sm: 32 },
                }}
                onClick={handleCloseForm}
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M10 3L5 8l5 5"
                    stroke="#374151"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </IconButton>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  sx={{
                    fontSize: { xs: "0.875rem", sm: "1rem" },
                    fontWeight: 700,
                    color: "#111827",
                    lineHeight: 1.3,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {loading && !checklist
                    ? "Loading..."
                    : checklist?.name || "Custom Checklist Builder"}
                </Typography>
                {!isMobile && (
                  <Typography sx={{ fontSize: "0.6875rem", color: "#9ca3af" }}>
                    {checklist?.description ||
                      "Create and manage inspection checklists"}
                  </Typography>
                )}
              </Box>
            </Stack>
            <Stack direction="row" spacing={1}>
              {!isMobile && (
                <Button
                  variant="outlined"
                  color="primary"
                  disabled={!checklist || loading || pdfDownloading}
                  onClick={handleDownloadPDF}
                  startIcon={
                    pdfDownloading ? <CircularProgress size={14} /> : null
                  }
                  sx={{
                    fontSize: "0.75rem",
                    display: { xs: "none", sm: "flex" },
                  }}
                >
                  {pdfDownloading ? "Generating..." : "Download PDF"}
                </Button>
              )}
              {isMobile && (
                <Fab
                  size="small"
                  color="primary"
                  onClick={() => setSidebarOpen(true)}
                  sx={{
                    boxShadow: "none",
                    width: 36,
                    height: 36,
                    minHeight: 36,
                  }}
                >
                  <MenuIcon />
                </Fab>
              )}
            </Stack>
          </Toolbar>
        </AppBar>

        {/* Mobile PDF Button Bar */}
        {isMobile && checklist && !loading && (
          <Box
            sx={{
              px: 1.5,
              py: 1,
              bgcolor: "#fff",
              borderBottom: "1px solid #e5e7eb",
            }}
          >
            <Button
              fullWidth
              variant="outlined"
              size="small"
              disabled={pdfDownloading}
              onClick={handleDownloadPDF}
              startIcon={pdfDownloading ? <CircularProgress size={14} /> : null}
              sx={{ fontSize: "0.75rem", py: 0.75 }}
            >
              {pdfDownloading ? "Generating PDF..." : "Download Form PDF"}
            </Button>
          </Box>
        )}

        {/* Main Content */}
        <Box sx={{ p: { xs: 1.5, sm: 2, md: 3.5 } }}>
          <Grid container spacing={{ xs: 2, sm: 2.5 }} alignItems="flex-start" sx={{ minWidth: 0 }}>
            {/* Form Column */}
            <Grid item xs={12} md={9} sx={{ minWidth: 0 }}>
              {fetchError && (
                <Paper sx={{ borderRadius: "14px", p: 4, textAlign: "center" }}>
                  <Typography
                    sx={{
                      color: "#dc2626",
                      fontSize: { xs: "0.875rem", sm: "0.9375rem" },
                      mb: 1,
                    }}
                  >
                    {fetchError}
                  </Typography>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => window.location.reload()}
                  >
                    Retry
                  </Button>
                </Paper>
              )}

              {loading && !checklist && !fetchError && <FormSkeleton />}

              {checklist && !fetchError && (
                <Paper
                  ref={formRef}
                  sx={{
                    borderRadius: "14px",
                    p: { xs: 2, sm: 3, md: 4.5 },
                    overflow: "hidden",
                    width: "100%",
                    minWidth: 0,
                  }}
                >
                  {/* Form Header */}
                  <Box
                    sx={{
                      mb: { xs: 2, sm: 3 },
                      pb: { xs: 1.5, sm: 2 },
                      borderBottom: "1px solid #f0f1f2",
                    }}
                  >
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1}
                      mb={0.75}
                      flexWrap="wrap"
                      gap={0.5}
                    >
                      <Typography
                        sx={{
                          fontSize: { xs: "1.125rem", sm: "1.25rem" },
                          fontWeight: 800,
                          color: "#1a3a47",
                          lineHeight: 1.3,
                        }}
                      >
                        {checklist.name}
                      </Typography>
                      {checklist.status && (
                        <Chip
                          label={checklist.status}
                          size="small"
                          sx={{
                            background:
                              checklist.status === "published"
                                ? "#dcfce7"
                                : "#fef3c7",
                            color:
                              checklist.status === "published"
                                ? "#166534"
                                : "#92400e",
                            fontWeight: 600,
                            textTransform: "capitalize",
                            fontSize: "0.625rem",
                          }}
                        />
                      )}
                    </Stack>
                    <Typography
                      sx={{
                        fontSize: { xs: "0.75rem", sm: "0.8125rem" },
                        color: "#6b7280",
                      }}
                    >
                      {checklist.description ||
                        "Complete all required fields below."}
                    </Typography>
                  </Box>

                  {/* Dynamic Sections with Collapse Support */}
                  {sections.map((section, si) => (
                    <Box key={si} sx={{ mb: { xs: 2, sm: 3 }, width: "100%", minWidth: 0 }}>
                      <SectionHeader
                        title={section.title}
                        isCollapsed={collapsedSections[si]}
                        onToggle={() => toggleSection(si)}
                      />
                      <Collapse in={!collapsedSections[si]}>
                        {(() => {
                          const inlineTypes = [
                            "text_input",
                            "dropdown",
                            "date",
                          ];
                          const rows = [];
                          let i = 0;
                          const sFields = section.fields;
                          while (i < sFields.length) {
                            const curr = sFields[i];
                            const next = sFields[i + 1];
                            if (
                              inlineTypes.includes(curr.type) &&
                              next &&
                              inlineTypes.includes(next.type)
                            ) {
                              rows.push({ type: "pair", fields: [curr, next] });
                              i += 2;
                            } else {
                              rows.push({ type: "single", field: curr });
                              i += 1;
                            }
                          }
                          return rows.map((row, ri) => {
                            if (row.type === "pair") {
                              return (
                                <Box
                                  sx={{
                                    display: "grid",
                                    gridTemplateColumns: {
                                      xs: "1fr",
                                      sm: "repeat(2, minmax(0, 1fr))",
                                    },
                                    gap: { xs: 2, sm: 2.5 },
                                    mb: { xs: 2, sm: 2.5 },
                                    width: "100%",
                                    minWidth: 0,
                                  }}
                                  key={ri}
                                >
                                  {row.fields.map((field) => {
                                    const key = field._id || field.label;
                                    return (
                                      <Box key={key} sx={{ minWidth: 0, width: "100%" }}>
                                        <FieldLabel
                                          label={field.label}
                                          required={field.required}
                                        />
                                        <DynamicField
                                          field={field}
                                          value={formValues[key]}
                                          onChange={handleFieldChange}
                                        />
                                      </Box>
                                    );
                                  })}
                                </Box>
                              );
                            }
                            const field = row.field;
                            const key = field._id || field.label;
                            return (
                              <Box sx={{ mb: { xs: 2, sm: 2.5 }, width: "100%", minWidth: 0 }} key={key}>
                                <FieldLabel
                                  label={field.label}
                                  required={field.required}
                                />
                                <DynamicField
                                  field={field}
                                  value={formValues[key]}
                                  onChange={handleFieldChange}
                                />
                              </Box>
                            );
                          });
                        })()}
                      </Collapse>
                    </Box>
                  ))}

                  <Divider sx={{ my: { xs: 2, sm: 2.5 } }} />

                  {/* Action Buttons */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: 1.5,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: { xs: "0.625rem", sm: "0.75rem" },
                        color: "#9ca3af",
                      }}
                    >
                      {checklist._id !== "demo-001"
                        ? `Form ID: ${checklist._id}`
                        : "Form ID: FORM-2024-001"}
                    </Typography>
                    <Stack direction="row" spacing={{ xs: 1, sm: 1.5 }}>
                      <Button
                        variant="outlined"
                        size={isMobile ? "small" : "medium"}
                        onClick={handleClear}
                        disabled={submitting}
                      >
                        Clear All
                      </Button>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSubmit}
                        disabled={submitting}
                        size={isMobile ? "small" : "medium"}
                        startIcon={
                          submitting ? (
                            <CircularProgress size={14} color="inherit" />
                          ) : null
                        }
                      >
                        {submitting
                          ? "Submitting..."
                          : submitted
                            ? "✓ Submitted"
                            : "Submit Form"}
                      </Button>
                    </Stack>
                  </Box>
                </Paper>
              )}
            </Grid>

            {/* Sidebar - Desktop */}
            {!isMobile && (
              <Grid item xs={12} md={3}>
                <Box sx={{ position: { md: "sticky" }, top: { md: 76 } }}>
                  {sidebarContent}
                </Box>
              </Grid>
            )}
          </Grid>
        </Box>
      </Box>

      {/* Mobile Sidebar Drawer - Swipeable */}
      <SwipeableDrawer
        anchor="right"
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpen={() => {}}
        disableSwipeToOpen
        PaperProps={{
          sx: {
            width: { xs: "85%", sm: 320  },
            borderTopLeftRadius: 16,
            borderBottomLeftRadius: 16,
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1  }}>
            <IconButton onClick={() => setSidebarOpen(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
          {sidebarContent}
        </Box>
      </SwipeableDrawer>

      {/* Snackbar Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: isMobile ? "center" : "right",
        }}
        sx={{ bottom: { xs: 16, sm: 24 } }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
          sx={{ borderRadius: "10px", fontSize: "0.8125rem", width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Dialog
        open={confirmCloseOpen}
        onClose={() => setConfirmCloseOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <Box sx={{ p: 3 }}>
          <Typography sx={{ fontWeight: 700, fontSize: "1.15rem", mb: 1 }}>
            Save details?
          </Typography>
          <Typography sx={{ color: "text.secondary", fontSize: "0.9rem", mb: 3 }}>
            Do you want to save these details as a draft?
          </Typography>
          <Stack direction="row" justifyContent="flex-end" spacing={1.5}>
            <Button variant="outlined" onClick={() => finishClose({ clearDraft: true })}>
              No
            </Button>
            <Button variant="contained" onClick={() => finishClose({ saveDraft: true })}>
              Yes
            </Button>
          </Stack>
        </Box>
      </Dialog>
    </ThemeProvider>
  );
}

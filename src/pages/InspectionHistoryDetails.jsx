// src/pages/InspectionHistoryDetails.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  IconButton,
  Chip,
  Stack,
  CircularProgress,
  Alert,
  Snackbar,
  Rating,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Dialog,
  DialogTitle,
  DialogContent,
  Divider,
} from "@mui/material";
import { createTheme, ThemeProvider, alpha } from "@mui/material/styles";
import {
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  ErrorOutline as ErrorOutlineIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Close as CloseIcon,
  WarningAmber as WarningAmberIcon,
  PictureAsPdf as PdfIcon,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { useTeamAssignment } from "../context/TeamAssignmentcontext";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const REPORT_EXPORT_STYLES = `
  #inspection-print-content.export-mode,
  .print-container {
    background: #ffffff !important;
    color: #0f172a !important;
  }

  #inspection-print-content.export-mode .MuiPaper-root,
  .print-container .MuiPaper-root {
    background: #ffffff !important;
    background-color: #ffffff !important;
    color: #0f172a !important;
    border: 1px solid #e5e7eb !important;
    box-shadow: none !important;
  }

  #inspection-print-content.export-mode .MuiBox-root,
  .print-container .MuiBox-root {
    background-color: transparent !important;
  }

  #inspection-print-content.export-mode .MuiTypography-root,
  #inspection-print-content.export-mode .MuiSvgIcon-root,
  .print-container .MuiTypography-root,
  .print-container .MuiSvgIcon-root {
    color: #334155 !important;
  }

  #inspection-print-content.export-mode .MuiChip-root,
  .print-container .MuiChip-root {
    color: #ffffff !important;
  }

  #inspection-print-content.export-mode .MuiDivider-root,
  .print-container .MuiDivider-root {
    border-color: #e5e7eb !important;
  }
`;

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

const D = {
  page: "#07111f",
  surface: "#0c1726",
  surfaceAlt: "#101d2e",
  surfaceSoft: "#132033",
  border: "rgba(148, 163, 184, 0.18)",
  borderStrong: "rgba(148, 163, 184, 0.32)",
  text: "#f8fafc",
  textSecondary: "#cbd5e1",
  muted: "#94a3b8",
  brand: "#22d3ee",
  success: "#10b981",
  successBg: "rgba(16, 185, 129, 0.12)",
  danger: "#ef4444",
  dangerBg: "rgba(239, 68, 68, 0.12)",
  warning: "#f59e0b",
  neutralBg: "rgba(148, 163, 184, 0.12)",
};

// ─── Styled section card ──────────────────────────────────────────────────────
const SectionCard = ({ title, children, sx }) => {
  const flushContent = sx?.p === 0 || sx?.padding === 0;

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 1.5, sm: 2 },
        borderRadius: 2,
        border: `1px solid ${D.border}`,
        backgroundColor: `${D.surface} !important`,
        ...sx,
      }}
    >
      {title && (
        <Typography
          sx={{
            fontWeight: 700,
            color: `${D.text} !important`,
            fontSize: { xs: "0.85rem", sm: "0.9rem" },
            lineHeight: 1.25,
            mb: 1.5,
            px: flushContent ? { xs: 1.5, sm: 2 } : 0,
            pt: flushContent ? { xs: 1.5, sm: 2 } : 0,
            overflowWrap: "anywhere",
          }}
        >
          {title}
        </Typography>
      )}
      {children}
    </Paper>
  );
};

// ─── Score interpretation ─────────────────────────────────────────────────────
const getScoreLabel = (score) => {
  if (score >= 90) return { label: "Excellent", color: "#10b981" };
  if (score >= 75) return { label: "Good", color: "#10b981" };
  if (score >= 50) return { label: "Fair", color: "#f59e0b" };
  return { label: "Poor", color: "#ef4444" };
};

// ─── Field row (label / value pair) ───────────────────────────────────────────
const FieldRow = ({ label, value, valueColor }) => (
  <Box sx={{ minWidth: 0 }}>
    <Typography sx={{ fontSize: "0.7rem", color: `${D.muted} !important`, mb: 0.3 }}>
      {label}
    </Typography>
    <Typography
      sx={{
        fontSize: "0.8rem",
        fontWeight: 600,
        color: `${valueColor || D.text} !important`,
        wordBreak: "break-word",
      }}
    >
      {value || "—"}
    </Typography>
  </Box>
);

export default function InspectionHistoryDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { fetchInspectionById, exportInspection, loading } =
    useTeamAssignment();
  const printRef = useRef();

  const [inspection, setInspection] = useState(null);
  const [assignment, setAssignment] = useState(null);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [snack, setSnack] = useState({
    open: false,
    msg: "",
    severity: "success",
  });

  const toast = useCallback((msg, severity = "success") => {
    setSnack({ open: true, msg, severity });
  }, []);

  useEffect(() => {
    if (id && id !== "undefined" && id !== "null") {
      loadInspection();
    } else {
      toast("Invalid inspection ID", "error");
      navigate("/team/history");
    }
  }, [id]);

  const loadInspection = async () => {
    const result = await fetchInspectionById(id);
    if (result.success) {
      setInspection(result.inspection);
      setAssignment(result.assignment);
    } else {
      toast(result.error || "Failed to load inspection", "error");
      navigate("/team/history");
    }
  };

  // ─── PDF Export using html2canvas + jsPDF ───────────────────────────────────
  const handleExportPDF = async () => {
    if (!printRef.current) return;

    setExporting(true);
    let exportRoot = null;
    try {
      const element = printRef.current;
      const captureScale = window.innerWidth < 600 ? 1.25 : 2;

      exportRoot = document.createElement("div");
      exportRoot.className = "print-container";
      exportRoot.style.position = "fixed";
      exportRoot.style.left = "-10000px";
      exportRoot.style.top = "0";
      exportRoot.style.width = `${element.scrollWidth}px`;
      exportRoot.style.background = "#ffffff";
      exportRoot.style.pointerEvents = "none";

      const clonedReport = element.cloneNode(true);
      clonedReport.removeAttribute("id");
      clonedReport.classList.add("export-mode");
      exportRoot.appendChild(clonedReport);
      document.body.appendChild(exportRoot);

      await new Promise((resolve) => requestAnimationFrame(resolve));
      const canvas = await html2canvas(clonedReport, {
        scale: captureScale,
        backgroundColor: "#ffffff",
        logging: false,
        useCORS: true,
        windowWidth: clonedReport.scrollWidth,
        windowHeight: clonedReport.scrollHeight,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`inspection-${inspection?.inspectionId || id}.pdf`);
      toast("PDF exported successfully!", "success");
    } catch (error) {
      console.error("PDF export error:", error);
      toast("Failed to export PDF", "error");
    } finally {
      exportRoot?.remove();
      setExporting(false);
    }
  };

  // ─── Print Functionality ────────────────────────────────────────────────────
  const handlePrint = () => {
    const printContent = printRef.current;
    const originalTitle = document.title;

    if (!printContent) return;

    setPrinting(true);

    const styles = document.querySelectorAll("link[rel='stylesheet'], style");
    let stylesHTML = "";
    styles.forEach((style) => {
      if (style.tagName === "LINK") {
        stylesHTML += `<link rel="stylesheet" href="${style.href}">`;
      } else if (style.tagName === "STYLE") {
        stylesHTML += `<style>${style.innerHTML}</style>`;
      }
    });

    const printFrame = document.createElement("iframe");
    printFrame.title = "Inspection print preview";
    printFrame.style.position = "fixed";
    printFrame.style.right = "0";
    printFrame.style.bottom = "0";
    printFrame.style.width = "0";
    printFrame.style.height = "0";
    printFrame.style.border = "0";
    printFrame.style.opacity = "0";
    document.body.appendChild(printFrame);

    const frameDocument =
      printFrame.contentDocument || printFrame.contentWindow?.document;

    if (!frameDocument) {
      printFrame.remove();
      setPrinting(false);
      toast("Unable to prepare print preview", "error");
      return;
    }

    frameDocument.open();
    frameDocument.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Inspection Report - ${inspection?.inspectionId || "Report"}</title>
          ${stylesHTML}
          <style>
            ${REPORT_EXPORT_STYLES}
            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
              padding: 20px;
              margin: 0;
              background: white;
              color: #0f172a;
            }
            .no-print {
              display: none !important;
            }
            @media print {
              body {
                padding: 0;
                margin: 0;
              }
              .no-print {
                display: none !important;
              }
              .MuiPaper-root {
                box-shadow: none !important;
                border: 1px solid #e2e8f0 !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            ${printContent.outerHTML}
          </div>
        </body>
      </html>
    `);

    frameDocument.close();
    document.title = `Inspection Report - ${inspection?.inspectionId || "Report"}`;

    const cleanup = () => {
      document.title = originalTitle;
      setPrinting(false);
      setTimeout(() => printFrame.remove(), 300);
    };

    setTimeout(() => {
      try {
        printFrame.contentWindow?.focus();
        printFrame.contentWindow?.print();
        toast("Print preview opened", "success");
      } catch (error) {
        console.error("Print error:", error);
        toast("Failed to print", "error");
      } finally {
        cleanup();
      }
    }, 300);
  };

  // ─── Backend Export ─────────────────────────────────────────────────────────
  const handleBackendExport = async (format) => {
    const result = await exportInspection(id, format);
    if (result.success && result.url) {
      window.open(result.url, "_blank");
      toast(`${format.toUpperCase()} exported successfully!`, "success");
    } else {
      toast(result.error || "Export failed", "error");
    }
  };

  const handleImageClick = (image) => {
    setSelectedImage(image);
    setImageDialogOpen(true);
  };

  const getMediaUrl = (filePath) => {
    if (!filePath) return "";
    const raw =
      typeof filePath === "object"
        ? filePath.url || filePath.secure_url || filePath.filePath || filePath.path
        : filePath;
    if (typeof raw !== "string" || !raw.trim()) return "";

    const value = raw.trim().replace(/^https\/\//i, "https://");
    if (/^(data:|https?:\/\/|blob:)/i.test(value)) return value;
    const normalizedPath = value.replace(/\\/g, "/").replace(/^\/+/, "");
    return `https://backend.assetmach.com/${normalizedPath}`;
  };

  const getImageUrl = (filePath) => getMediaUrl(filePath) || "/placeholder-image.png";

  const getSignatureUrl = (signature) => {
    if (!signature) return "";
    const raw =
      typeof signature === "object"
        ? signature.url ||
        signature.secure_url ||
        signature.filePath ||
        signature.path ||
        signature.value
        : signature;
    if (typeof raw !== "string" || !raw.trim()) return "";

    const value = raw.trim();
    if (/^(data:|https?:\/\/|blob:)/i.test(value)) return value;
    if (/^[A-Za-z0-9+/=]+$/.test(value) && value.length > 100) {
      return `data:image/png;base64,${value}`;
    }
    return getMediaUrl(value);
  };

  if (loading && !inspection) {
    return (
      <ThemeProvider theme={theme}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "60vh",
          }}
        >
          <CircularProgress sx={{ color: "#0d3d52" }} />
        </Box>
      </ThemeProvider>
    );
  }

  if (!inspection) return null;

  const checklistResponses = inspection.checklistResponses || [];
  const attachments = inspection.attachments || [];
  const images = inspection.images || [];
  const allImages = [
    ...images,
    ...attachments.filter((a) => a.mimetype?.startsWith("image/")),
  ];

  const overallScore = Math.round(
    (Number(inspection.performanceRating || 0) / 5) * 100,
  );
  const scoreInfo = getScoreLabel(overallScore);

  const assetName =
    assignment?.assets?.[0]?.assetName || inspection.assetTag || "—";
  const assetLocation =
    assignment?.assetIds?.[0]?.currentLocation ||
    assignment?.assets?.[0]?.currentLocation ||
    "—";
  const assetCategory =
    checklistResponses?.[0]?.checklistCategory ||
    assignment?.checklists?.[0]?.category ||
    "—";

  return (
    <ThemeProvider theme={theme}>
      <style>{REPORT_EXPORT_STYLES}</style>
      <Box sx={{ minHeight: "100vh", bgcolor: D.page }}>
        <Container maxWidth="lg" sx={{ py: { xs: 1.5, sm: 2, md: 3 } }}>
          {/* Header - No Print */}
          <Box
            className="no-print"
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: { xs: "flex-start", sm: "center" },
              flexDirection: { xs: "column", sm: "row" },
              gap: 1.5,
              mb: 2,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <IconButton
                onClick={() => navigate("/team/history")}
                sx={{
                  border: `1px solid ${D.borderStrong}`,
                  borderRadius: 1.5,
                  bgcolor: D.surfaceAlt,
                  color: D.text,
                  "&:hover": {
                    bgcolor: D.surfaceSoft,
                    borderColor: D.brand,
                  },
                }}
              >
                <ArrowBackIcon sx={{ fontSize: 18, color: "inherit" }} />
              </IconButton>
              <Box>
                <Typography
                  sx={{
                    fontWeight: 800,
                    color: `${D.text} !important`,
                    fontSize: { xs: "1rem", sm: "1.1rem" },
                  }}
                >
                  {inspection.inspectionId || "Inspection Details"}
                </Typography>
                <Typography sx={{ fontSize: "0.7rem", color: `${D.textSecondary} !important` }}>
                  Submitted:{" "}
                  {inspection.submittedAt
                    ? new Date(inspection.submittedAt).toLocaleString()
                    : "N/A"}
                </Typography>
              </Box>
            </Stack>
            <Stack
              direction="row"
              spacing={1}
              sx={{
                flexWrap: "wrap",
                width: { xs: "100%", sm: "auto" },
                gap: 1,
                "& .MuiButton-startIcon": {
                  mr: { xs: 0.75, sm: 0.8 },
                },
              }}
            >
              <Button
                size="small"
                startIcon={
                  exporting ? (
                    <CircularProgress size={16} sx={{ color: "inherit" }} />
                  ) : (
                    <PdfIcon sx={{ fontSize: 18, color: "inherit" }} />
                  )
                }
                onClick={handleExportPDF}
                disabled={exporting}
                variant="outlined"
                sx={{
                  borderColor: D.borderStrong,
                  color: D.text,
                  bgcolor: D.surface,
                  fontSize: { xs: "0.72rem", sm: "0.7rem" },
                  minHeight: { xs: 44, sm: 34 },
                  px: { xs: 1.25, sm: 1.5 },
                  py: { xs: 0.85, sm: 0.5 },
                  borderRadius: 1.5,
                  flex: { xs: "1 1 145px", sm: "0 0 auto" },
                  minWidth: { xs: 0, sm: 150 },
                  whiteSpace: "nowrap",
                  "&:hover": {
                    bgcolor: D.surfaceSoft,
                    borderColor: D.brand,
                  },
                  "&.Mui-disabled": {
                    color: D.muted,
                    borderColor: D.border,
                  },
                }}
              >
                {exporting ? "Generating..." : "Export in PDF"}
              </Button>
              <Button
                size="small"
                startIcon={
                  printing ? (
                    <CircularProgress size={16} sx={{ color: "inherit" }} />
                  ) : (
                    <PrintIcon sx={{ fontSize: 18, color: "inherit" }} />
                  )
                }
                onClick={handlePrint}
                disabled={printing}
                variant="outlined"
                sx={{
                  borderColor: D.borderStrong,
                  color: D.text,
                  bgcolor: D.surface,
                  fontSize: { xs: "0.72rem", sm: "0.7rem" },
                  minHeight: { xs: 44, sm: 34 },
                  px: { xs: 1.25, sm: 1.5 },
                  py: { xs: 0.85, sm: 0.5 },
                  borderRadius: 1.5,
                  flex: { xs: "1 1 145px", sm: "0 0 auto" },
                  minWidth: { xs: 0, sm: 150 },
                  whiteSpace: "nowrap",
                  "&:hover": {
                    bgcolor: D.surfaceSoft,
                    borderColor: D.brand,
                  },
                  "&.Mui-disabled": {
                    color: D.muted,
                    borderColor: D.border,
                  },
                }}
              >
                {printing ? "Preparing..." : "Print the Data"}
              </Button>
              {/* <Button
                size="small"
                startIcon={<DownloadIcon sx={{ fontSize: 16 }} />}
                onClick={() => handleBackendExport("excel")}
                variant="outlined"
                sx={{
                  borderColor: "#e2e8f0",
                  color: "#0d3d52",
                  fontSize: "0.7rem",
                  py: 0.5,
                }}
              >
                Export in Excel
              </Button> */}
            </Stack>
          </Box>

          {/* Printable Content */}
          <Box
            id="inspection-print-content"
            ref={printRef}
            sx={{ width: "100%", minWidth: 0 }}
          >
            {/* Top Row: Overall Score + Inspection Summary */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "minmax(220px, 0.8fr) minmax(0, 1.2fr)",
                },
                gap: 1.5,
                mb: 1.5,
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <SectionCard
                  sx={{
                    height: "100%",
                    width: "100%",
                    textAlign: "center",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  <Typography
                    sx={{ fontSize: "0.7rem", color: `${D.muted} !important`, mb: 0.5 }}
                  >
                    Overall Score
                  </Typography>
                  <Typography
                    sx={{
                      fontWeight: 800,
                      fontSize: { xs: "1.8rem", sm: "2rem" },
                      color: `${scoreInfo.color} !important`,
                      lineHeight: 1,
                    }}
                  >
                    {overallScore}%
                  </Typography>
                  <Typography
                    sx={{ fontSize: "0.7rem", color: `${D.textSecondary} !important`, mt: 0.5 }}
                  >
                    {scoreInfo.label}
                  </Typography>
                </SectionCard>
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <SectionCard title="Inspection Summary" sx={{ height: "100%" }}>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "1fr",
                        sm: "repeat(3, minmax(0, 1fr))",
                      },
                      gap: 1,
                    }}
                  >
                    <Box sx={{ minWidth: 0 }}>
                      <Box
                        sx={{
                          textAlign: "center",
                          p: 1,
                          borderRadius: 1.5,
                          bgcolor: D.successBg,
                          border: `1px solid ${alpha(D.success, 0.28)}`,
                        }}
                      >
                        <CheckCircleIcon
                          sx={{ fontSize: 20, color: `${D.success} !important`, mb: 0.3 }}
                        />
                        <Typography
                          sx={{
                            fontWeight: 800,
                            fontSize: { xs: "1.2rem", sm: "1.3rem" },
                            color: `${D.success} !important`,
                          }}
                        >
                          {inspection.itemsPassed || 0}
                        </Typography>
                        <Typography
                          sx={{ fontSize: "0.65rem", color: `${D.textSecondary} !important` }}
                        >
                          Passed
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Box
                        sx={{
                          textAlign: "center",
                          p: 1,
                          borderRadius: 1.5,
                          bgcolor: D.dangerBg,
                          border: `1px solid ${alpha(D.danger, 0.28)}`,
                        }}
                      >
                        <CancelIcon
                          sx={{ fontSize: 20, color: `${D.danger} !important`, mb: 0.3 }}
                        />
                        <Typography
                          sx={{
                            fontWeight: 800,
                            fontSize: { xs: "1.2rem", sm: "1.3rem" },
                            color: `${D.danger} !important`,
                          }}
                        >
                          {inspection.itemsFailed || 0}
                        </Typography>
                        <Typography
                          sx={{ fontSize: "0.65rem", color: `${D.textSecondary} !important` }}
                        >
                          Failed
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Box
                        sx={{
                          textAlign: "center",
                          p: 1,
                          borderRadius: 1.5,
                          bgcolor: D.neutralBg,
                          border: `1px solid ${D.border}`,
                        }}
                      >
                        <WarningAmberIcon
                          sx={{ fontSize: 20, color: `${D.muted} !important`, mb: 0.3 }}
                        />
                        <Typography
                          sx={{
                            fontWeight: 800,
                            fontSize: { xs: "1.2rem", sm: "1.3rem" },
                            color: `${D.textSecondary} !important`,
                          }}
                        >
                          {inspection.itemsNA || 0}
                        </Typography>
                        <Typography
                          sx={{ fontSize: "0.65rem", color: `${D.textSecondary} !important` }}
                        >
                          N/A
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </SectionCard>
              </Box>
            </Box>

            {/* Asset Information */}
            <SectionCard title="Asset Information" sx={{ mb: 1.5 }}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "repeat(2, minmax(0, 1fr))",
                    sm: "repeat(3, minmax(0, 1fr))",
                  },
                  gap: 1,
                }}
              >
                <FieldRow label="Asset Name" value={assetName} />
                <FieldRow
                  label="Inspection Date"
                  value={
                    inspection.submittedAt
                      ? new Date(inspection.submittedAt).toLocaleDateString()
                      : "—"
                  }
                />
              </Box>
            </SectionCard>

            {/* Inspection Details */}
            <SectionCard title="Inspection Details" sx={{ mb: 1.5 }}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "repeat(2, minmax(0, 1fr))",
                    sm: "repeat(3, minmax(0, 1fr))",
                  },
                  gap: 1,
                }}
              >
                <FieldRow
                  label="Inspector Name"
                  value={inspection.inspectorName}
                />
                <FieldRow
                  label="Overall Condition"
                  value={
                    inspection.overallCondition
                      ? inspection.overallCondition.charAt(0).toUpperCase() +
                      inspection.overallCondition.slice(1)
                      : "—"
                  }
                />
                <FieldRow
                  label="Inspection ID"
                  value={inspection.inspectionId}
                />
                <FieldRow
                  label="Performance Rating"
                  value={`${inspection.performanceRating || 0}/5`}
                />
              </Box>
            </SectionCard>

            {/* Checklist Sections */}
            {checklistResponses.length > 0 ? (
              checklistResponses.map((checklist, idx) => {
                const responses = checklist.responses || [];
                return (
                  <SectionCard
                    key={idx}
                    title={checklist.checklistName}
                    sx={{ mb: 1.5, p: 0, overflow: "hidden" }}
                  >
                    <Box sx={{ p: 0 }}>
                      {responses.map((response, respIdx) => {
                        const v = response.value;
                        const isYesNo =
                          typeof v === "string" &&
                          ["yes", "no", "true", "false"].includes(
                            v.toLowerCase(),
                          );
                        const isYes =
                          isYesNo &&
                          (v.toLowerCase() === "yes" ||
                            v.toLowerCase() === "true");
                        const hasIssue = isYesNo && !isYes;
                        const signatureUrl =
                          response.fieldType === "signature"
                            ? getSignatureUrl(v)
                            : "";

                        return (
                          <Box
                            key={respIdx}
                            sx={{
                              px: { xs: 1.5, sm: 2 },
                              py: 1,
                              borderBottom:
                                respIdx !== responses.length - 1
                                  ? `1px solid ${D.border}`
                                  : "none",
                              bgcolor: hasIssue ? D.dangerBg : "transparent",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                              gap: 1,
                            }}
                          >
                            <Box sx={{ flex: 1 }}>
                              <Typography
                                sx={{
                                  fontSize: "0.8rem",
                                  fontWeight: 600,
                                  color: `${D.text} !important`,
                                }}
                              >
                                {response.fieldLabel}
                              </Typography>
                              {hasIssue && response.note && (
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.5,
                                    mt: 0.3,
                                  }}
                                >
                                  <ErrorOutlineIcon
                                    sx={{ fontSize: 12, color: `${D.muted} !important` }}
                                  />
                                  <Typography
                                    sx={{
                                      fontSize: "0.7rem",
                                      color: `${D.textSecondary} !important`,
                                    }}
                                  >
                                    {response.note}
                                  </Typography>
                                </Box>
                              )}
                              {!isYesNo && response.fieldType === "rating" && (
                                <Rating
                                  value={parseInt(v) || 0}
                                  readOnly
                                  size="small"
                                  sx={{ mt: 0.3 }}
                                />
                              )}
                              {!isYesNo &&
                                response.fieldType === "checkbox" && (
                                  <Box
                                    sx={{
                                      mt: 0.3,
                                      display: "flex",
                                      flexWrap: "wrap",
                                      gap: 0.5,
                                    }}
                                  >
                                    {v
                                      ?.split(", ")
                                      .filter(Boolean)
                                      .map((item, i) => (
                                        <Chip
                                          key={i}
                                          label={item}
                                          size="small"
                                          sx={{
                                            fontSize: "0.65rem",
                                            height: 18,
                                            bgcolor: D.surfaceSoft,
                                            color: `${D.textSecondary} !important`,
                                          }}
                                        />
                                      ))}
                                  </Box>
                                )}
                              {!isYesNo &&
                                ![
                                  "rating",
                                  "checkbox",
                                  "signature",
                                  "image_upload",
                                ].includes(response.fieldType) && (
                                  <Typography
                                    sx={{
                                      fontSize: "0.75rem",
                                      color: `${D.textSecondary} !important`,
                                      mt: 0.3,
                                    }}
                                  >
                                    {v || "—"}
                                  </Typography>
                                )}
                              {response.fieldType === "signature" && signatureUrl && (
                                <Box
                                  sx={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    width: "min(220px, 100%)",
                                    minHeight: 56,
                                    p: 0.75,
                                    bgcolor: "#fff",
                                    border: `1px solid ${D.borderStrong}`,
                                    borderRadius: 1,
                                    mt: 0.5,
                                  }}
                                >
                                  <Box
                                    component="img"
                                    src={signatureUrl}
                                    alt="Signature"
                                    sx={{
                                      display: "block",
                                      maxWidth: "100%",
                                      maxHeight: 48,
                                      objectFit: "contain",
                                    }}
                                    onError={(e) => {
                                      e.currentTarget.style.display = "none";
                                    }}
                                  />
                                </Box>
                              )}
                              {response.fieldType === "signature" && !signatureUrl && (
                                <Typography
                                  sx={{
                                    fontSize: "0.75rem",
                                    color: `${D.muted} !important`,
                                    mt: 0.3,
                                  }}
                                >
                                  —
                                </Typography>
                              )}
                            </Box>
                            {isYesNo && (
                              <Chip
                                label={isYes ? "Yes" : "No"}
                                size="small"
                                sx={{
                                  bgcolor: isYes ? "#10b981" : "#ef4444",
                                  color: "#fff !important",
                                  fontWeight: 700,
                                  fontSize: "0.7rem",
                                  height: 20,
                                  flexShrink: 0,
                                }}
                              />
                            )}
                          </Box>
                        );
                      })}
                    </Box>
                  </SectionCard>
                );
              })
            ) : (
              <SectionCard sx={{ mb: 1.5, textAlign: "center", py: 3 }}>
                <Typography sx={{ color: `${D.muted} !important`, fontSize: "0.8rem" }}>
                  No responses available
                </Typography>
              </SectionCard>
            )}

            {/* Notes */}
            {inspection.notes && (
              <SectionCard title="Inspector Notes" sx={{ mb: 1.5 }}>
                <Typography
                  sx={{
                    fontSize: "0.8rem",
                    color: `${D.textSecondary} !important`,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {inspection.notes}
                </Typography>
              </SectionCard>
            )}

            {/* Images */}
            {allImages.length > 0 && (
              <SectionCard
                title={`Images (${allImages.length})`}
                sx={{ mb: 1.5 }}
              >
                <ImageList
                  cols={3}
                  gap={8}
                  sx={{
                    gridTemplateColumns: {
                      xs: "repeat(2, 1fr) !important",
                      sm: "repeat(3, 1fr) !important",
                    },
                  }}
                >
                  {allImages.map((image, idx) => (
                    <ImageListItem
                      key={idx}
                      sx={{
                        cursor: "pointer",
                        borderRadius: 1.5,
                        overflow: "hidden",
                      }}
                      onClick={() => handleImageClick(image)}
                    >
                      <img
                        src={getImageUrl(image.filePath)}
                        alt={image.originalName || `Image ${idx + 1}`}
                        style={{
                          height: 100,
                          objectFit: "cover",
                          width: "100%",
                        }}
                        onError={(e) => {
                          e.target.src = "/placeholder-image.png";
                        }}
                      />
                      <ImageListItemBar
                        title={image.originalName || `Image ${idx + 1}`}
                        position="bottom"
                        sx={{
                          "& .MuiImageListItemBar-title": {
                            fontSize: "0.65rem",
                          },
                        }}
                      />
                    </ImageListItem>
                  ))}
                </ImageList>
              </SectionCard>
            )}
          </Box>
        </Container>

        {/* Image Dialog */}
        <Dialog
          open={imageDialogOpen}
          onClose={() => setImageDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle sx={{ py: 1 }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography sx={{ fontSize: "0.9rem", fontWeight: 700 }}>
                Image Preview
              </Typography>
              <IconButton
                onClick={() => setImageDialogOpen(false)}
                size="small"
              >
                <CloseIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Stack>
          </DialogTitle>
          <DialogContent sx={{ textAlign: "center", p: 2 }}>
            {selectedImage && (
              <img
                src={getImageUrl(selectedImage.filePath)}
                alt={selectedImage.originalName || "Preview"}
                style={{ maxWidth: "100%", maxHeight: "70vh", borderRadius: 8 }}
                onError={(e) => {
                  e.target.src = "/placeholder-image.png";
                }}
              />
            )}
          </DialogContent>
        </Dialog>

        <Snackbar
          open={snack.open}
          autoHideDuration={4000}
          onClose={() => setSnack({ ...snack, open: false })}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}>
          <Alert
            severity={snack.severity}
            onClose={() => setSnack({ ...snack, open: false })}
            sx={{ borderRadius: 2, fontSize: "0.75rem" }}
          >
            {snack.msg}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}

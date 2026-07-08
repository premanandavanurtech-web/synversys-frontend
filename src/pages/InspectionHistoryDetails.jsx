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
  Grid,
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

// ─── Styled section card ──────────────────────────────────────────────────────
const SectionCard = ({ title, children, sx }) => (
  <Paper
    elevation={0}
    sx={{
      p: { xs: 1.5, sm: 2 },
      borderRadius: 2,
      border: "1px solid #e2e8f0",
      backgroundColor: "#ffffff",
      ...sx,
    }}
  >
    {title && (
      <Typography
        sx={{
          fontWeight: 700,
          color: "#0d3d52",
          fontSize: { xs: "0.85rem", sm: "0.9rem" },
          mb: 1.5,
        }}
      >
        {title}
      </Typography>
    )}
    {children}
  </Paper>
);

// ─── Score interpretation ─────────────────────────────────────────────────────
const getScoreLabel = (score) => {
  if (score >= 90) return { label: "Excellent", color: "#10b981" };
  if (score >= 75) return { label: "Good", color: "#10b981" };
  if (score >= 50) return { label: "Fair", color: "#f59e0b" };
  return { label: "Poor", color: "#ef4444" };
};

// ─── Field row (label / value pair) ───────────────────────────────────────────
const FieldRow = ({ label, value, valueColor }) => (
  <Grid item xs={12} sm={6} md={4}>
    <Typography sx={{ fontSize: "0.7rem", color: "#94a3b8", mb: 0.3 }}>
      {label}
    </Typography>
    <Typography
      sx={{
        fontSize: "0.8rem",
        fontWeight: 600,
        color: valueColor || "#0f172a",
        wordBreak: "break-word",
      }}
    >
      {value || "—"}
    </Typography>
  </Grid>
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
    try {
      const element = printRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: "#ffffff",
        logging: false,
        useCORS: true,
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
      setExporting(false);
    }
  };

  // ─── Print Functionality ────────────────────────────────────────────────────
  const handlePrint = () => {
    const printContent = printRef.current;
    const originalTitle = document.title;

    if (!printContent) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast("Please allow pop-ups to print", "error");
      return;
    }

    const styles = document.querySelectorAll("link[rel='stylesheet'], style");
    let stylesHTML = "";
    styles.forEach((style) => {
      if (style.tagName === "LINK") {
        stylesHTML += `<link rel="stylesheet" href="${style.href}">`;
      } else if (style.tagName === "STYLE") {
        stylesHTML += `<style>${style.innerHTML}</style>`;
      }
    });

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Inspection Report - ${inspection?.inspectionId || "Report"}</title>
          ${stylesHTML}
          <style>
            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
              padding: 20px;
              margin: 0;
              background: white;
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
          <script>
            window.onload = () => {
              window.print();
              window.onafterprint = () => window.close();
            };
          <\/script>
        </body>
      </html>
    `);

    printWindow.document.close();
    document.title = originalTitle;
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

  const getImageUrl = (filePath) => {
    if (!filePath) return "/placeholder-image.png";
    const normalizedPath = filePath.replace(/\\/g, "/");
    return `https://synversysbackend-production.up.railway.app/${normalizedPath}`;
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
      <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc" }}>
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
                  border: "1px solid #e2e8f0",
                  borderRadius: 1.5,
                  bgcolor: "#fff",
                }}
              >
                <ArrowBackIcon sx={{ fontSize: 18 }} />
              </IconButton>
              <Box>
                <Typography
                  sx={{
                    fontWeight: 800,
                    color: "#0f172a",
                    fontSize: { xs: "1rem", sm: "1.1rem" },
                  }}
                >
                  {inspection.inspectionId || "Inspection Details"}
                </Typography>
                <Typography sx={{ fontSize: "0.7rem", color: "#94a3b8" }}>
                  Submitted:{" "}
                  {inspection.submittedAt
                    ? new Date(inspection.submittedAt).toLocaleString()
                    : "N/A"}
                </Typography>
              </Box>
            </Stack>
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                startIcon={<PdfIcon sx={{ fontSize: 16 }} />}
                onClick={handleExportPDF}
                disabled={exporting}
                variant="outlined"
                sx={{
                  borderColor: "#e2e8f0",
                  color: "#0d3d52",
                  fontSize: "0.7rem",
                  py: 0.5,
                }}
              >
                {exporting ? "Generating..." : "Export in PDF"}
              </Button>
              <Button
                size="small"
                startIcon={<PrintIcon sx={{ fontSize: 16 }} />}
                onClick={handlePrint}
                variant="outlined"
                sx={{
                  borderColor: "#e2e8f0",
                  color: "#0d3d52",
                  fontSize: "0.7rem",
                  py: 0.5,
                }}
              >
                Print the Data
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
          <div ref={printRef}>
            {/* Top Row: Overall Score + Inspection Summary */}
            <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
              <Grid item xs={12} sm={4}>
                <SectionCard
                  sx={{
                    height: "100%",
                    width:"300px",
                    textAlign: "center",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  <Typography
                    sx={{ fontSize: "0.7rem", color: "#94a3b8", mb: 0.5 }}
                  >
                    Overall Score
                  </Typography>
                  <Typography
                    sx={{
                      fontWeight: 800,
                      fontSize: { xs: "1.8rem", sm: "2rem" },
                      color: scoreInfo.color,
                      lineHeight: 1,
                    }}
                  >
                    {overallScore}%
                  </Typography>
                  <Typography
                    sx={{ fontSize: "0.7rem", color: "#94a3b8", mt: 0.5 }}
                  >
                    {scoreInfo.label}
                  </Typography>
                </SectionCard>
              </Grid>
              <Grid item xs={12} sm={8}>
                <SectionCard title="Inspection Summary" sx={{ height: "100%"}}>
                  <Grid container spacing={1}>
                    <Grid item xs={4} sx={{  width:"260px" }}>
                      <Box
                        sx={{
                          textAlign: "center",
                          p: 1,
                          borderRadius: 1.5,
                          bgcolor: "#f0fdf9",
                        }}
                      >
                        <CheckCircleIcon
                          sx={{ fontSize: 20, color: "#10b981", mb: 0.3 }}
                        />
                        <Typography
                          sx={{
                            fontWeight: 800,
                            fontSize: { xs: "1.2rem", sm: "1.3rem" },
                            color: "#10b981",
                          }}
                        >
                          {inspection.itemsPassed || 0}
                        </Typography>
                        <Typography
                          sx={{ fontSize: "0.65rem", color: "#94a3b8" }}
                        >
                          Passed
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4} sx={{  width:"260px" }}>
                      <Box
                        sx={{
                          textAlign: "center",
                          p: 1,
                          borderRadius: 1.5,
                          bgcolor: "#fef2f2",
                        }}
                      >
                        <CancelIcon
                          sx={{ fontSize: 20, color: "#ef4444", mb: 0.3 }}
                        />
                        <Typography
                          sx={{
                            fontWeight: 800,
                            fontSize: { xs: "1.2rem", sm: "1.3rem" },
                            color: "#ef4444",
                          }}
                        >
                          {inspection.itemsFailed || 0}
                        </Typography>
                        <Typography
                          sx={{ fontSize: "0.65rem", color: "#94a3b8" }}
                        >
                          Failed
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4} sx={{  width:"260px" }}>
                      <Box
                        sx={{
                          textAlign: "center",
                          p: 1,
                          borderRadius: 1.5,
                          bgcolor: "#f1f5f9",
                        }}
                      >
                        <WarningAmberIcon
                          sx={{ fontSize: 20, color: "#64748b", mb: 0.3 }}
                        />
                        <Typography
                          sx={{
                            fontWeight: 800,
                            fontSize: { xs: "1.2rem", sm: "1.3rem" },
                            color: "#64748b",
                          }}
                        >
                          {inspection.itemsNA || 0}
                        </Typography>
                        <Typography
                          sx={{ fontSize: "0.65rem", color: "#94a3b8" }}
                        >
                          N/A
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </SectionCard>
              </Grid>
            </Grid>

            {/* Asset Information */}
            <SectionCard title="Asset Information" sx={{ mb: 1.5 }}>
              <Grid container spacing={1}>
                <FieldRow label="Asset Name" value={assetName} />
                <FieldRow
                  label="Inspection Date"
                  value={
                    inspection.submittedAt
                      ? new Date(inspection.submittedAt).toLocaleDateString()
                      : "—"
                  }
                />
              </Grid>
            </SectionCard>

            {/* Inspection Details */}
            <SectionCard title="Inspection Details" sx={{ mb: 1.5 }}>
              <Grid container spacing={1}>
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
              </Grid>
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

                        return (
                          <Box
                            key={respIdx}
                            sx={{
                              px: { xs: 1.5, sm: 2 },
                              py: 1,
                              borderBottom:
                                respIdx !== responses.length - 1
                                  ? "1px solid #f1f5f9"
                                  : "none",
                              bgcolor: hasIssue ? "#fef2f2" : "transparent",
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
                                  color: "#0f172a",
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
                                    sx={{ fontSize: 12, color: "#94a3b8" }}
                                  />
                                  <Typography
                                    sx={{
                                      fontSize: "0.7rem",
                                      color: "#94a3b8",
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
                                            bgcolor: "#f1f5f9",
                                            color: "#475569",
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
                                      color: "#475569",
                                      mt: 0.3,
                                    }}
                                  >
                                    {v || "—"}
                                  </Typography>
                                )}
                              {response.fieldType === "signature" && v && (
                                <Box
                                  component="img"
                                  src={v}
                                  alt="Signature"
                                  sx={{
                                    maxWidth: 150,
                                    maxHeight: 40,
                                    border: "1px solid #e2e8f0",
                                    borderRadius: 1,
                                    mt: 0.5,
                                  }}
                                />
                              )}
                            </Box>
                            {isYesNo && (
                              <Chip
                                label={isYes ? "Yes" : "No"}
                                size="small"
                                sx={{
                                  bgcolor: isYes ? "#10b981" : "#ef4444",
                                  color: "#fff",
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
                <Typography sx={{ color: "#94a3b8", fontSize: "0.8rem" }}>
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
                    color: "#475569",
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
          </div>
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
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
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

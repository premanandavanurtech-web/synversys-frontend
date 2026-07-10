import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Chip,
  Card,
  CardContent,
  LinearProgress,
  Divider,
  TextField,
  Grid,
  Avatar,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
  Rating,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useAuth } from "../context/AuthContexts";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import ImageIcon from "@mui/icons-material/Image";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import * as XLSX from "xlsx";

const TEAL = "#1B4D5C";
const theme = createTheme({
  palette: { primary: { main: TEAL }, background: { default: "#f4f6f8" } },
  typography: { fontFamily: "'DM Sans', sans-serif" },
  shape: { borderRadius: 12 },
});

const STATUS_CONFIG = {
  pending: { label: "Pending", color: "#d97706", bg: "#fef3c7" },
  submitted: { label: "Submitted", color: "#7c3aed", bg: "#ede9fe" },
  approved: { label: "Approved", color: "#059669", bg: "#d1fae5" },
  rejected: { label: "Rejected", color: "#dc2626", bg: "#fee2e2" },
  pending_review: { label: "Pending Review", color: "#d97706", bg: "#fef3c7" },
};

function StatusChip({ status }) {
  const cfg = STATUS_CONFIG[status?.toLowerCase()] || STATUS_CONFIG.pending;
  return (
    <Chip
      label={cfg.label}
      size="small"
      sx={{
        bgcolor: cfg.bg,
        color: cfg.color,
        fontWeight: 600,
        fontSize: "0.75rem",
        height: 26,
        borderRadius: "6px",
      }}
    />
  );
}

const normalizeSubmissionDetails = (submission = {}) => {
  const submittedBy = submission.submittedBy || {};
  const clean = (value) => {
    if (!value || value === "Unknown" || value === "N/A") return "";
    return value;
  };
  const submittedByName =
    clean(submission.submittedByName) ||
    clean(submittedBy.name) ||
    clean(submittedBy.email) ||
    clean(submission.assignedToTeamMembers?.[0]?.name) ||
    clean(submission.assignedToTeamMembers?.[0]?.email) ||
    clean(submission.assignedToTeamMembers?.[0]?.userId?.email) ||
    "N/A";
  const submittedByEmail =
    clean(submission.submittedByEmail) ||
    clean(submittedBy.email) ||
    clean(submission.assignedToTeamMembers?.[0]?.email) ||
    clean(submission.assignedToTeamMembers?.[0]?.userId?.email) ||
    "";

  return {
    ...submission,
    _id: submission._id || submission.submissionId || submission.id,
    checklistName:
      submission.checklistName ||
      submission.checklistResponses?.[0]?.checklistName ||
      "Checklist Submission",
    submittedByName,
    submittedByEmail,
    status:
      submission.reviewStatus ||
      submission.submissionStatus ||
      submission.status ||
      "pending_review",
    completionRate:
      submission.overallCompletionRate ??
      submission.completionRate ??
      submission.completion ??
      0,
    overallRating:
      submission.performanceRating ??
      submission.overallRating ??
      (submission.score != null ? Math.round(Number(submission.score) / 20) : 0),
    uploadedPhotos: submission.uploadedPhotos || submission.images || [],
  };
};

const fileUrl = (file) => {
  let path =
    typeof file === "string"
      ? file
      : file?.url || file?.filePath || file?.path || file?.originalName || file?.name;
  if (!path) return "";
  if (/^(https?:|blob:|data:)/i.test(path)) return path;
  path = path.replace(/\\/g, "/");
  const publicIndex = path.indexOf("/public/uploads/");
  if (publicIndex >= 0) path = path.slice(publicIndex + 1);
  if (path.startsWith("uploads/")) path = `public/${path}`;
  if (!path.startsWith("public/uploads/")) path = `public/uploads/checklists/${path}`;
  return `https://synversys-backend.onrender.com/${path.replace(/^\/+/, "")}`;
};

const isImageFile = (file) => {
  const name = typeof file === "string" ? file : file?.originalName || file?.name || file?.filePath || "";
  const mimetype = typeof file === "string" ? "" : file?.mimetype || "";
  return mimetype.startsWith("image/") || /\.(png|jpe?g|webp|gif)$/i.test(name);
};

const formatAnswer = (value) => {
  if (Array.isArray(value)) return value.join(", ");
  if (value == null || value === "") return "N/A";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
};

export default function SubmissionDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authRequest } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submission, setSubmission] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [previewImageUrl, setPreviewImageUrl] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");

  const fetchSubmissionDetails = useCallback(async () => {
    setLoading(true);
    try {
      const response = await authRequest(
        "GET",
        `/assignments/submissions/${id}`,
      );
      if (response.success) {
        setSubmission(normalizeSubmissionDetails(response.submission || response.data || response));
      } else {
        setSnackbar({
          open: true,
          message: response.message || "Failed to load submission",
          severity: "error",
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || "Failed to load submission",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [authRequest, id]);

  useEffect(() => {
    fetchSubmissionDetails();
  }, [fetchSubmissionDetails]);

  useEffect(() => {
    return () => {
      if (previewImageUrl?.startsWith("blob:")) URL.revokeObjectURL(previewImageUrl);
    };
  }, [previewImageUrl]);

  const openImagePreview = async (photo) => {
    setPreviewImage(photo);
    if (previewImageUrl?.startsWith("blob:")) URL.revokeObjectURL(previewImageUrl);
    setPreviewImageUrl("");
    setPreviewError("");
    setPreviewLoading(true);

    if (photo?._fileType && photo?._fileIndex != null) {
      try {
        const token =
          localStorage.getItem("accessToken") || localStorage.getItem("token");
        const response = await fetch(
          `https://synversys-backend.onrender.com/api/v1/assignments/submissions/${id}/files/${photo._fileType}/${photo._fileIndex}`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          },
        );
        if (response.ok) {
          const blob = await response.blob();
          setPreviewImageUrl(URL.createObjectURL(blob));
          setPreviewLoading(false);
          return;
        }
        const errorText = await response.text();
        throw new Error(errorText || `Image request failed (${response.status})`);
      } catch (error) {
        console.error("Image preview fetch failed:", error);
        setPreviewError(
          "Unable to load this image. Please restart the backend server and try again.",
        );
        setPreviewLoading(false);
        return;
      }
    }

    setPreviewError("Image file path is missing for this submission.");
    setPreviewLoading(false);
  };

  const handleExportToExcel = () => {
    if (!submission) return;

    const exportData = [
      ["Field", "Value"],
      ["Checklist Name", submission.checklistName || "N/A"],
      ["Submitted By", submission.submittedByName || "N/A"],
      ["Submitted Email", submission.submittedByEmail || "N/A"],
      [
        "Submitted Date",
        submission.submittedAt
          ? new Date(submission.submittedAt).toLocaleString()
          : "N/A",
      ],
      ["Status", submission.status || "N/A"],
      ["Completion Rate", `${submission.completionRate || 0}%`],
      ["Overall Rating", submission.overallRating || "Not rated"],
      ["Inspector Notes", submission.inspectorNotes || "No notes"],
      ["Additional Notes", submission.notes || "No notes"],
    ];

    (submission.checklistResponses || []).forEach((checklist) => {
      exportData.push([]);
      exportData.push([checklist.checklistName || "Checklist", ""]);
      (checklist.responses || []).forEach((answer) => {
        exportData.push([answer.fieldLabel || answer.fieldId || "Field", formatAnswer(answer.value)]);
      });
    });

    const worksheet = XLSX.utils.aoa_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Submission Details");
    XLSX.writeFile(workbook, `submission_${submission._id}.xlsx`);

    setSnackbar({
      open: true,
      message: "Excel file exported successfully",
      severity: "success",
    });
  };

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <Box sx={{ minHeight: "100vh", p: 3 }}>
          <CircularProgress sx={{ display: "block", mx: "auto", my: 4 }} />
        </Box>
      </ThemeProvider>
    );
  }

  const submissionData = submission;
  const imageAttachments = [
    ...(submissionData?.uploadedPhotos || []).map((file, index) => ({
      ...(typeof file === "string" ? { filePath: file } : file),
      _fileType: "images",
      _fileIndex: index,
    })),
    ...(submissionData?.attachments || [])
      .map((file, index) => ({ file, index }))
      .filter(({ file }) => isImageFile(file))
      .map(({ file, index }) => ({
        ...(typeof file === "string" ? { filePath: file } : file),
        _fileType: "attachments",
        _fileIndex: index,
      })),
  ];
  const documentAttachments = (submissionData?.attachments || []).filter(
    (file) => !isImageFile(file),
  );

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ minHeight: "100vh", p: { xs: 2, md: 3 } }}>
        {/* Back */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <ArrowBackIcon
            sx={{ color: TEAL, fontSize: 18, cursor: "pointer" }}
            onClick={() => navigate(-1)}
          />
          <Typography
            sx={{
              color: TEAL,
              fontWeight: 600,
              fontSize: "0.875rem",
              cursor: "pointer",
            }}
            onClick={() => navigate(-1)}
          >
            Back to Assignment Details
          </Typography>
        </Box>

        {/* Page Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 2.5,
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box>
            <Typography
              sx={{ fontWeight: 700, fontSize: "1.05rem", color: "#111" }}
            >
              Submission Details
            </Typography>
            <Typography sx={{ fontSize: "0.82rem", color: "#888", mt: 0.3 }}>
              {submissionData?.checklistName || "Checklist Submission"}
            </Typography>
          </Box>
          <Button
            startIcon={<FileDownloadOutlinedIcon />}
            variant="outlined"
            size="small"
            onClick={handleExportToExcel}
            sx={{
              textTransform: "none",
              borderColor: "#ccc",
              color: "#333",
              fontWeight: 600,
              fontSize: "0.82rem",
              borderRadius: 2,
            }}
          >
            Export Excel
          </Button>
        </Box>

        {/* Meta Info Card */}
        <Card
          elevation={0}
          sx={{ border: "1px solid #e8e8e8", borderRadius: 2, mb: 2.5 }}
        >
          <CardContent sx={{ p: "24px !important" }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={3}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.8,
                    width:"180px",
                    mb: 0.5,
                  }}
                >
                  <PersonOutlineIcon sx={{ fontSize: 15, color: "#888" }} />
                  <Typography sx={{ fontSize: "0.78rem", color: "#888" }}>
                    Submitted By
                  </Typography>
                </Box>
                <Typography
                  sx={{ fontWeight: 600, fontSize: "0.92rem", color: "#111" }}
                >
                  {submissionData?.submittedByName?.split("@")[0] || "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.8,
                    width:"180px",
                    mb: 0.5,
                  }}
                >
                  <CalendarTodayOutlinedIcon
                    sx={{ fontSize: 15, color: "#888" }}
                  />
                  <Typography sx={{ fontSize: "0.78rem", color: "#888" }}>
                    Submitted Date
                  </Typography>
                </Box>
                <Typography
                  sx={{ fontWeight: 600, fontSize: "0.92rem", color: "#111" }}
                >
                  {submissionData?.submittedAt
                    ? new Date(submissionData.submittedAt).toLocaleString()
                    : "Not submitted"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.8,
                    width:"180px",
                    mb: 0.5,
                  }}
                >
                  <DescriptionOutlinedIcon
                    sx={{ fontSize: 15, color: "#888" }}
                  />
                  <Typography sx={{ fontSize: "0.78rem", color: "#888" }}>
                    Status
                  </Typography>
                </Box>
                <StatusChip
                  status={
                    submissionData?.status
                  }
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.8,
                    width:"180px",
                    mb: 0.5,
                  }}
                >
                  <CheckCircleOutlineIcon
                    sx={{ fontSize: 15, color: "#888" }}
                  />
                  <Typography sx={{ fontSize: "0.78rem", color: "#888" }}>
                    Completion Rate
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    mt: 0.5,
                    width:"180px",
                  }}
                >
                  <LinearProgress
                    variant="determinate"
                    value={submissionData?.completionRate || 0}
                    sx={{
                      flex: 1,
                      height: 6,
                      borderRadius: 3,
                      bgcolor: "#e0e0e0",
                      "& .MuiLinearProgress-bar": {
                        bgcolor: "#bdbdbd",
                        borderRadius: 3,
                      },
                    }}
                  />
                  <Typography
                    sx={{ fontSize: "0.82rem", color: "#555", minWidth: 36 }}
                  >
                    {submissionData?.completionRate || 0}%
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            <Divider sx={{ my: 2.5 }} />
            <Grid container spacing={3}>
              <Grid item xs={12} sm={3}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.8,
                    width:"180px",
                    mb: 0.5,
                  }}
                >
                  <PersonOutlineIcon sx={{ fontSize: 15, color: "#888" }} />
                  <Typography sx={{ fontSize: "0.78rem", color: "#888" }}>
                    Reviewed By
                  </Typography>
                </Box>
                <Typography
                  sx={{ fontWeight: 600, fontSize: "0.92rem", color: "#111" }}
                >
                  {submissionData?.reviewedByName ||
                    submissionData?.reviewedBy?.name ||
                    submissionData?.reviewedBy?.email?.split("@")[0] ||
                    (submissionData?.status === "pending_review"
                      ? "Pending review"
                      : "Not reviewed")}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.8,
                    width:"180px",
                    mb: 0.5,
                  }}
                >
                  <AccessTimeOutlinedIcon
                    sx={{ fontSize: 15, color: "#888" }}
                  />
                  <Typography sx={{ fontSize: "0.78rem", color: "#888" }}>
                    Reviewed Date
                  </Typography>
                </Box>
                <Typography
                  sx={{ fontWeight: 600, fontSize: "0.92rem", color: "#111" }}
                >
                  {submissionData?.reviewedAt
                    ? new Date(submissionData.reviewedAt).toLocaleString()
                    : submissionData?.status === "pending_review"
                      ? "Pending review"
                      : "Not reviewed"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.8,
                    width:"200px",
                    mb: 0.5,
                  }}
                >
                  <CheckCircleOutlineIcon
                    sx={{ fontSize: 15, color: "#888" }}
                  />
                  <Typography sx={{ fontSize: "0.78rem", color: "#888" }}>
                    Overall Rating
                  </Typography>
                </Box>
                <Rating
                  value={submissionData?.overallRating || 0}
                  readOnly
                  size="small"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Checklist Responses
        {submissionData?.checklistResponses?.length > 0 && (
          <Card
            elevation={0}
            sx={{ border: "1px solid #e8e8e8", borderRadius: 2, mb: 2.5 }}
          >
            <CardContent>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  color: "#111",
                  mb: 2,
                }}
              >
                Checklist Responses
              </Typography>
              {submissionData.checklistResponses.map((checklist, checklistIndex) => (
                <Box
                  key={checklist.checklistId || checklistIndex}
                  sx={{
                    mb:
                      checklistIndex < submissionData.checklistResponses.length - 1
                        ? 2.5
                        : 0,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 1,
                      mb: 1,
                      flexWrap: "wrap",
                    }}
                  >
                    <Typography sx={{ fontWeight: 700, fontSize: "0.9rem" }}>
                      {checklist.checklistName || `Checklist ${checklistIndex + 1}`}
                    </Typography>
                    <Chip
                      label={`${checklist.completionRate || 0}% complete`}
                      size="small"
                      sx={{
                        bgcolor: "#eef7f4",
                        color: TEAL,
                        fontWeight: 600,
                        height: 24,
                      }}
                    />
                  </Box>
                  <Grid container spacing={1.5}>
                    {(checklist.responses || []).map((answer, answerIndex) => (
                      <Grid item xs={12} sm={6} md={4} key={answer.fieldId || answerIndex}>
                        <Box
                          sx={{
                            border: "1px solid #edf0f2",
                            borderRadius: 1.5,
                            p: 1.5,
                            height: "100%",
                            bgcolor: "#fbfcfd",
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: "0.72rem",
                              color: "#777",
                              mb: 0.5,
                              lineHeight: 1.35,
                            }}
                          >
                            {answer.fieldLabel || answer.fieldId || "Field"}
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: "0.86rem",
                              fontWeight: 600,
                              color: "#111",
                              wordBreak: "break-word",
                            }}
                          >
                            {formatAnswer(answer.value)}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              ))}
            </CardContent>
          </Card>
        )} */}

        {/* Attachments */}
        {(documentAttachments.length > 0 || imageAttachments.length > 0) && (
          <Card
            elevation={0}
            sx={{ border: "1px solid #e8e8e8", borderRadius: 2, mb: 2.5  }}
          >
            <CardContent>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  color: "#111",
                  mb: 2,
                }}
              >
                Attachments & Photos
              </Typography>
              {documentAttachments.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography
                    sx={{ fontSize: "0.85rem", color: "#555", mb: 1 }}
                  >
                    Documents:
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    {documentAttachments.map((file, idx) => (
                      <Button
                        key={idx}
                        variant="outlined"
                        size="small"
                        startIcon={<PictureAsPdfIcon />}
                        onClick={() => window.open(fileUrl(file), "_blank")}
                      >
                        {file.name || file.originalName || `Document ${idx + 1}`}
                      </Button>
                    ))}
                  </Box>
                </Box>
              )}
              {imageAttachments.length > 0 && (
                <Box>
                  <Typography
                    sx={{ fontSize: "0.85rem", color: "#555", mb: 1 }}
                  >
                    Photos:
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                    {imageAttachments.map((photo, idx) => (
                      <Box
                        key={idx}
                        onClick={() => openImagePreview(photo)}
                        sx={{
                          width: 150,
                          border: "1px solid #e2e8f0",
                          borderRadius: 1.5,
                          overflow: "hidden",
                          cursor: "pointer",
                          bgcolor: "#fff",
                          "&:hover": { borderColor: TEAL },
                        }}
                      >
                        <Box
                          component="img"
                          src={fileUrl(photo)}
                          alt={photo.originalName || `Photo ${idx + 1}`}
                          sx={{
                            display: "block",
                            width: "100%",
                            height: 96,
                            objectFit: "cover",
                            bgcolor: "#f1f5f9",
                          }}
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                          }}
                        />
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, p: 1 }}>
                          <ImageIcon sx={{ fontSize: 15, color: TEAL, flexShrink: 0 }} />
                          <Typography
                            sx={{
                              fontSize: "0.72rem",
                              color: TEAL,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {photo.originalName || `Photo ${idx + 1}`}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        )}

        <Dialog
          open={Boolean(previewImage)}
          onClose={() => {
            setPreviewImage(null);
            if (previewImageUrl?.startsWith("blob:")) URL.revokeObjectURL(previewImageUrl);
            setPreviewImageUrl("");
            setPreviewError("");
            setPreviewLoading(false);
          }}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle sx={{ fontSize: "0.95rem", fontWeight: 700 }}>
            {previewImage?.originalName || "Image Preview"}
          </DialogTitle>
          <DialogContent sx={{ textAlign: "center", p: 2 }}>
            {previewLoading && (
              <Box sx={{ py: 5 }}>
                <CircularProgress size={28} />
              </Box>
            )}
            {!previewLoading && previewError && (
              <Alert severity="error" sx={{ textAlign: "left", borderRadius: 2 }}>
                {previewError}
              </Alert>
            )}
            {!previewLoading && !previewError && previewImageUrl && (
              <Box
                component="img"
                src={previewImageUrl}
                alt={previewImage.originalName || "Preview"}
                sx={{
                  maxWidth: "100%",
                  maxHeight: "72vh",
                  borderRadius: 1.5,
                  objectFit: "contain",
                }}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Additional Notes */}
        {submissionData?.notes && (
          <Card
            elevation={0}
            sx={{ border: "1px solid #e8e8e8", borderRadius: 2, mb: 2.5 }}
          >
            <CardContent>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  color: "#111",
                  mb: 1.5,
                }}
              >
                Additional Notes
              </Typography>
              <Box sx={{ borderLeft: "3px solid #90caf9", pl: 1.5 }}>
                <Typography
                  sx={{
                    fontSize: "0.87rem",
                    color: "#333",
                    lineHeight: 1.7,
                  }}
                >
                  {submissionData.notes}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Inspector Notes */}
        {submissionData?.inspectorNotes && (
          <Card
            elevation={0}
            sx={{ border: "1px solid #e8e8e8", borderRadius: 2 }}
          >
            <CardContent>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  color: "#111",
                  mb: 1.5,
                }}
              >
                Inspector Notes
              </Typography>
              <Box sx={{ borderLeft: "3px solid #90caf9", pl: 1.5 }}>
                <Typography
                  sx={{
                    fontSize: "0.87rem",
                    color: "#333",
                    lineHeight: 1.7,
                  }}
                >
                  {submissionData.inspectorNotes}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        )}

        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert severity={snackbar.severity} sx={{ borderRadius: 2 }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}

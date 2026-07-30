import React, { useRef, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  IconButton,
  alpha,
  CircularProgress,
  Alert,
  Snackbar,
} from "@mui/material";
import { styled } from "@mui/material/styles";

// Icons
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import TableChartOutlinedIcon from "@mui/icons-material/TableChartOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import StarOutlineIcon from "@mui/icons-material/StarOutline";
import StarIcon from "@mui/icons-material/Star";

// ─── Design Tokens ─────────────────────────────────────────────────────────────
const C = {
  navy: "#0f4c61",
  ink: "#1a2e3b",
  muted: "#64748b",
  ghost: "#94a3b8",
  border: "#e8edf2",
  white: "#ffffff",
  green: "#16a34a",
  greenIcon: "#22c55e",
  red: "#ef4444",
  amber: "#f59e0b",
  bg: "#f3f5f8",
};

// ─── Styled Components ─────────────────────────────────────────────────────────
const PageWrap = styled(Box)({
  minHeight: "100vh",
  fontFamily: '"DM Sans", "Segoe UI", sans-serif',
});

const TopBar = styled(Box)({
  background: C.white,
  borderBottom: `1px solid ${C.border}`,
  padding: "12px 24px",
  display: "flex",
  width: "1150px",
  marginLeft: "40px",
  alignItems: "center",
  justifyContent: "space-between",
  position: "sticky",
  top: 0,
  zIndex: 100,
  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  flexWrap: "wrap",
  gap: "12px",
  "@media (max-width: 600px)": {
    padding: "12px 16px",
  },
});

const SectionCard = styled(Paper)({
  borderRadius: 16,
  background: C.white,
  border: `1px solid ${C.border}`,
  boxShadow: "none",
  overflow: "hidden",
  marginBottom: 16,
});

const SectionTitle = styled(Typography)({
  fontSize: "1rem",
  fontWeight: 700,
  color: C.navy,
  padding: "20px 24px 16px",
  "@media (max-width: 600px)": {
    padding: "16px 20px 12px",
    fontSize: "0.9rem",
  },
});

const InfoGrid = styled(Box)({
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 0,
  padding: "0 24px 20px",
  "@media (max-width: 600px)": {
    gridTemplateColumns: "1fr",
    padding: "0 20px 16px",
  },
});

const InfoCell = styled(Box)({
  padding: "12px 0",
  borderBottom: `1px solid ${C.border}`,
  "&:nth-of-type(odd)": { paddingRight: 24 },
  "&:last-child, &:nth-last-child(2):nth-of-type(odd)": {
    borderBottom: "none",
  },
  "@media (max-width: 600px)": {
    "&:nth-of-type(odd)": { paddingRight: 0 },
  },
});

const InfoLabel = styled(Typography)({
  fontSize: "0.72rem",
  color: C.muted,
  marginBottom: 4,
});

const InfoValue = styled(Typography)({
  fontSize: "0.9rem",
  fontWeight: 700,
  color: C.ink,
});

const SummaryBox = styled(Box)({
  borderRadius: 12,
  border: `1px solid ${C.border}`,
  padding: "18px 16px 14px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 8,
  flex: 1,
  minWidth: "100px",
});

const CheckRow = styled(Box)(({ failed }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "13px 16px",
  borderBottom: `1px solid ${C.border}`,
  background: failed ? alpha(C.red, 0.035) : C.white,
  "&:last-child": { borderBottom: "none" },
  flexWrap: "wrap",
  gap: "8px",
}));

const CheckHeader = styled(Box)({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "13px 16px",
  background: C.bg,
  borderBottom: `1px solid ${C.border}`,
  flexWrap: "wrap",
  gap: "8px",
});

const ActionButton = styled(Button)({
  borderRadius: 10,
  fontWeight: 600,
  fontSize: "0.8rem",
  textTransform: "none",
  py: 0.7,
  px: 2,
  gap: "6px",
});

const ResultChip = ({ result }) => {
  const isYes = result === "Yes" || result === true;
  const isNo = result === "No" || result === false;
  const displayText = isYes
    ? "Yes"
    : isNo
    ? "No"
    : result === "N/A"
    ? "N/A"
    : result;

  return (
    <Chip
      label={displayText}
      size="small"
      sx={{
        bgcolor: isYes ? C.greenIcon : isNo ? C.red : alpha(C.ghost, 0.3),
        color: isYes || isNo ? C.white : C.ink,
        fontWeight: 700,
        fontSize: "0.7rem",
        height: 24,
        borderRadius: "20px",
        "& .MuiChip-label": { px: "10px" },
      }}
    />
  );
};

const StarRating = ({ rating, max = 5 }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 0.5,
      mt: 1,
      flexWrap: "wrap",
    }}
  >
    {Array.from({ length: max }).map((_, i) =>
      i < rating ? (
        <StarIcon key={i} sx={{ fontSize: "1.4rem", color: C.navy }} />
      ) : (
        <StarOutlineIcon key={i} sx={{ fontSize: "1.4rem", color: C.navy }} />
      )
    )}
    <Typography
      sx={{ ml: 0.5, fontSize: "0.85rem", fontWeight: 600, color: C.ink }}
    >
      {rating}/{max}
    </Typography>
  </Box>
);

// ─── Main Component ─────────────────────────────────────────────────────────────
const InspectionReportPage = ({ report, onBack, token }) => {
  const reportRef = useRef(null);
  const [exporting, setExporting] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Transform report data
  const d = {
    id: report._id || "N/A",
    asset: report.assets?.[0]?.assetName || report.assetName || "N/A",
    formType:
      report.checklistName || report.checklist?.name || "Inspection Form",
    status: report.submissionStatus || report.status || "submitted",
    score:
      report.completionRate ||
      (report.overallRating ? Math.round(report.overallRating * 20) : null),
    scoreLabel:
      report.overallRating >= 4
        ? "Excellent"
        : report.overallRating >= 3
        ? "Good"
        : "Needs Improvement",
    itemsPassed:
      report.responses?.filter(
        (r) => r.value === "Yes" || r.value === true || r.answer === "Yes"
      ).length || 0,
    itemsFailed:
      report.responses?.filter(
        (r) => r.value === "No" || r.value === false || r.answer === "No"
      ).length || 0,
    notApplicable:
      report.responses?.filter(
        (r) => r.value === "N/A" || r.answer === "N/A"
      ).length || 0,
    assetName:
      report.assets?.[0]?.assetName || report.assetName || "N/A",
    location:
      report.assets?.[0]?.assetLocation || report.location || "N/A",
    category:
      report.assets?.[0]?.assetCategory || report.category || "General",
    lastInspection: report.previousInspectionDate || "N/A",
    inspectorName:
      report.assignedToTeamMembers?.[0]?.name ||
      report.assignedBy?.name ||
      report.inspectorName ||
      "Unknown",
    overallCondition:
      report.overallRating >= 4
        ? "Excellent"
        : report.overallRating >= 3
        ? "Good"
        : "Fair",
    submittedDate: report.submittedAt
      ? new Date(report.submittedAt).toLocaleDateString()
      : "N/A",
    rating: report.overallRating || 0,
    inspectorNotes: report.inspectorNotes || "No additional notes",
    adminNotes: report.adminNotes || report.reviewComments || "No admin notes",
    checklist: {
      title:
        report.checklistName ||
        report.checklist?.name ||
        "Inspection Checklist",
      passed:
        report.responses?.filter(
          (r) => r.value === "Yes" || r.value === true || r.answer === "Yes"
        ).length || 0,
      total: report.responses?.length || 0,
      items:
        report.responses?.map((r, idx) => ({
          label:
            r.label ||
            r.questionText ||
            r.question ||
            `Item ${idx + 1}`,
          result:
            r.value === "Yes" ||
            r.value === true ||
            r.answer === "Yes"
              ? "Yes"
              : r.value === "No" ||
                r.value === false ||
                r.answer === "No"
              ? "No"
              : "N/A",
          note: r.notes || r.comments || null,
        })) || [],
    },
  };

  const scoreColor =
    d.score >= 90 ? C.green : d.score >= 75 ? C.amber : C.red;

  // ── Export PDF ────────────────────────────────────────────────────────────
  const exportPDF = async () => {
    setExporting(true);
    try {
      // Dynamically import html2pdf to avoid SSR issues
      const html2pdf = (await import("html2pdf.js")).default;
      const element = reportRef.current;
      if (!element) throw new Error("Report content not found");

      const opt = {
        margin: [0.5, 0.5, 0.5, 0.5],
        filename: `inspection_report_${d.id}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
      };

      await html2pdf().set(opt).from(element).save();
      setSnackbar({
        open: true,
        message: "PDF exported successfully!",
        severity: "success",
      });
    } catch (error) {
      console.error("PDF export error:", error);
      setSnackbar({
        open: true,
        message: "Failed to export PDF: " + error.message,
        severity: "error",
      });
    } finally {
      setExporting(false);
    }
  };

  // ── helpers ───────────────────────────────────────────────────────────────
  // Shared HTML content builder (used by both Print and PDF-via-iframe)
  const buildPrintHTML = () => `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Inspection Report - ${d.id}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: 'Segoe UI', Arial, sans-serif;
          color: #1a2e3b;
          font-size: 12px;
          padding: 24px;
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #0f4c61;
          padding-bottom: 16px;
          margin-bottom: 24px;
        }
        .header h1 { font-size: 20px; color: #0f4c61; }
        .header p  { font-size: 11px; color: #64748b; margin-top: 4px; }
        .summary-row { display: flex; gap: 12px; margin-bottom: 20px; }
        .score-box {
          border: 1px solid #e8edf2; border-radius: 10px;
          padding: 16px; text-align: center; min-width: 140px;
        }
        .score-box .score-value { font-size: 28px; font-weight: 800; color: ${scoreColor}; }
        .stats-box {
          border: 1px solid #e8edf2; border-radius: 10px;
          padding: 16px; flex: 1; display: flex; gap: 16px; align-items: center;
        }
        .stat-item { text-align: center; flex: 1; }
        .stat-item .stat-value { font-size: 22px; font-weight: 800; }
        .stat-item .stat-label { font-size: 10px; color: #64748b; }
        .section { margin-bottom: 20px; }
        .section-title {
          font-size: 13px; font-weight: 700; color: #0f4c61;
          border-bottom: 1px solid #e8edf2; padding-bottom: 8px; margin-bottom: 12px;
        }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .info-cell { padding: 6px 0; }
        .info-label { font-size: 10px; color: #64748b; margin-bottom: 2px; }
        .info-value { font-size: 12px; font-weight: 700; }
        table { width: 100%; border-collapse: collapse; font-size: 11px; }
        th {
          background: #f3f5f8; padding: 8px 10px;
          text-align: left; font-weight: 700; border: 1px solid #e8edf2;
        }
        td { padding: 8px 10px; border: 1px solid #e8edf2; vertical-align: top; }
        tr.failed-row { background: #fff5f5; }
        .chip {
          display: inline-block; padding: 2px 10px;
          border-radius: 20px; font-size: 10px; font-weight: 700; color: #fff;
        }
        .chip-yes { background: #22c55e; }
        .chip-no  { background: #ef4444; }
        .chip-na  { background: #94a3b8; color: #1a2e3b; }
        .notes-box {
          background: #f3f5f8; border-radius: 8px; padding: 12px;
          font-size: 11px; color: #64748b; line-height: 1.6;
        }
        .footer {
          margin-top: 32px; padding-top: 12px;
          border-top: 1px solid #e8edf2; text-align: center;
          font-size: 10px; color: #94a3b8;
        }
        @media print { body { padding: 16px; } }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>AssetInspect — Inspection Report</h1>
        <p>Report ID: ${d.id} &nbsp;|&nbsp; Generated: ${new Date().toLocaleString()}</p>
      </div>
      <div class="summary-row">
        <div class="score-box">
          <div style="font-size:10px;color:#64748b;margin-bottom:6px;">Overall Score</div>
          <div class="score-value">${d.score || "–"}%</div>
          <div style="font-size:10px;color:#64748b;margin-top:4px;">${d.scoreLabel}</div>
        </div>
        <div class="stats-box">
          <div class="stat-item">
            <div class="stat-value" style="color:#22c55e;">${d.itemsPassed}</div>
            <div class="stat-label">Items Passed</div>
          </div>
          <div class="stat-item">
            <div class="stat-value" style="color:#ef4444;">${d.itemsFailed}</div>
            <div class="stat-label">Items Failed</div>
          </div>
          <div class="stat-item">
            <div class="stat-value" style="color:#94a3b8;">${d.notApplicable}</div>
            <div class="stat-label">N/A</div>
          </div>
        </div>
      </div>
      <div class="section">
        <div class="section-title">Asset Information</div>
        <div class="info-grid">
          <div class="info-cell"><div class="info-label">Asset Name</div><div class="info-value">${d.assetName}</div></div>
          <div class="info-cell"><div class="info-label">Location</div><div class="info-value">${d.location}</div></div>
          <div class="info-cell"><div class="info-label">Category</div><div class="info-value">${d.category}</div></div>
          <div class="info-cell"><div class="info-label">Last Inspection</div><div class="info-value">${d.lastInspection}</div></div>
        </div>
      </div>
      <div class="section">
        <div class="section-title">Inspection Details</div>
        <div class="info-grid">
          <div class="info-cell"><div class="info-label">Inspector Name</div><div class="info-value">${d.inspectorName}</div></div>
          <div class="info-cell"><div class="info-label">Overall Condition</div><div class="info-value">${d.overallCondition}</div></div>
          <div class="info-cell"><div class="info-label">Submitted Date</div><div class="info-value">${d.submittedDate}</div></div>
          <div class="info-cell"><div class="info-label">Inspection ID</div><div class="info-value">${d.id}</div></div>
        </div>
      </div>
      ${
        d.checklist.total > 0
          ? `<div class="section">
        <div class="section-title">${d.checklist.title} (${d.checklist.passed}/${d.checklist.total} passed)</div>
        <table>
          <thead>
            <tr><th>#</th><th>Checklist Item</th><th>Note</th><th>Result</th></tr>
          </thead>
          <tbody>
            ${d.checklist.items
              .map(
                (item, i) => `
              <tr class="${item.result === "No" ? "failed-row" : ""}">
                <td>${i + 1}</td>
                <td>${item.label}</td>
                <td>${item.note || "—"}</td>
                <td>
                  <span class="chip ${
                    item.result === "Yes" ? "chip-yes" : item.result === "No" ? "chip-no" : "chip-na"
                  }">${item.result}</span>
                </td>
              </tr>`
              )
              .join("")}
          </tbody>
            </table>
          </div>`
              : ""
      }
      <div class="section">
        <div class="section-title">Inspector Notes</div>
        <div class="notes-box">${d.inspectorNotes}</div>
      </div>
      ${
        d.adminNotes !== "No admin notes"
          ? `<div class="section">
        <div class="section-title">Admin Review Notes</div>
        <div class="notes-box">${d.adminNotes}</div>
      </div>`
          : ""
      }
      <div class="footer">
        © ${new Date().getFullYear()} AssetInspect — This is a computer-generated document.
      </div>
    </body>
    </html>
  `;

  // ── Print (hidden iframe — no new tab) ───────────────────────────────────
  const printData = () => {
    setPrinting(true);
    try {
      const html = buildPrintHTML();

      // Create a hidden iframe inside the current page
      const iframe = document.createElement("iframe");
      iframe.style.cssText =
        "position:fixed;top:-9999px;left:-9999px;width:0;height:0;border:none;";
      document.body.appendChild(iframe);

      const iframeDoc =
        iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) throw new Error("Could not access iframe document.");

      iframeDoc.open();
      iframeDoc.write(html);
      iframeDoc.close();

      // Give the iframe a moment to render before printing
      iframe.onload = () => {
        try {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
        } finally {
          // Remove iframe after a short delay so the print dialog can open
          setTimeout(() => {
            document.body.removeChild(iframe);
          }, 1000);
        }
      };

      setSnackbar({ open: true, message: "Print dialog opened!", severity: "success" });
    } catch (error) {
      console.error("Print error:", error);
      setSnackbar({ open: true, message: "Failed to print: " + error.message, severity: "error" });
    } finally {
      setPrinting(false);
    }
  };

  // ── Export Excel (CDN-based SheetJS — no dynamic import needed) ──────────
  const exportExcel = () => {
    setExportingExcel(true);

    const doExport = (XLSX) => {
      try {
        // Sheet 1: Summary
        const summaryData = [
          ["INSPECTION REPORT SUMMARY"],
          [],
          ["Report ID", d.id],
          ["Form Type", d.formType],
          ["Status", d.status],
          ["Overall Score (%)", d.score ?? "N/A"],
          ["Score Label", d.scoreLabel],
          [],
          ["ASSET INFORMATION"],
          ["Asset Name", d.assetName],
          ["Location", d.location],
          ["Category", d.category],
          ["Last Inspection", d.lastInspection],
          [],
          ["INSPECTION DETAILS"],
          ["Inspector Name", d.inspectorName],
          ["Overall Condition", d.overallCondition],
          ["Submitted Date", d.submittedDate],
          [],
          ["RESULTS OVERVIEW"],
          ["Items Passed", d.itemsPassed],
          ["Items Failed", d.itemsFailed],
          ["N/A Items", d.notApplicable],
          ["Total Items", d.checklist.total],
          [],
          ["NOTES"],
          ["Inspector Notes", d.inspectorNotes],
          ["Admin Notes", d.adminNotes],
        ];

        // Sheet 2: Checklist
        const checklistRows = d.checklist.items.map((item, i) => [
          i + 1,
          item.label,
          item.result,
          item.note || "",
        ]);

        const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
        const wsChecklist = XLSX.utils.aoa_to_sheet([
          ["#", "Checklist Item", "Result", "Note"],
          ...checklistRows,
        ]);

        wsSummary["!cols"]   = [{ wch: 22 }, { wch: 40 }];
        wsChecklist["!cols"] = [{ wch: 4 }, { wch: 48 }, { wch: 10 }, { wch: 36 }];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");
        XLSX.utils.book_append_sheet(wb, wsChecklist, "Checklist");

        // Generate binary and trigger download without writeFile (avoids fs dependency)
        const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        const blob  = new Blob([wbout], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url  = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href     = url;
        link.download = `inspection_report_${d.id}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        setSnackbar({ open: true, message: "Excel exported successfully!", severity: "success" });
      } catch (err) {
        console.error("Excel export error:", err);
        setSnackbar({ open: true, message: "Failed to export Excel: " + err.message, severity: "error" });
      } finally {
        setExportingExcel(false);
      }
    };

    // Use already-loaded XLSX if available, otherwise load from CDN
    if (window.XLSX) {
      doExport(window.XLSX);
    } else {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
      script.onload  = () => doExport(window.XLSX);
      script.onerror = () => {
        setSnackbar({ open: true, message: "Failed to load Excel library. Check your internet connection.", severity: "error" });
        setExportingExcel(false);
      };
      document.head.appendChild(script);
    }
  };

  const handleCloseSnackbar = () =>
    setSnackbar({ ...snackbar, open: false });

  const statusColor =
    d.status === "approved"
      ? C.green
      : d.status === "pending_review"
      ? C.amber
      : d.status === "rejected"
      ? C.red
      : C.muted;

  const statusLabel =
    d.status === "pending_review"
      ? "Under Review"
      : d.status === "approved"
      ? "Approved"
      : d.status === "rejected"
      ? "Needs Revision"
      : d.status;

  return (
    <PageWrap>
      {/* ── Top Bar ─────────────────────────────────────────────────────── */}
      <TopBar>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <IconButton
            size="small"
            onClick={onBack}
            sx={{
              color: C.muted,
              "&:hover": { color: C.ink, bgcolor: C.bg },
            }}
          >
            <ArrowBackIcon sx={{ fontSize: "1.1rem" }} />
          </IconButton>
          <Box>
            <Typography
              sx={{ fontSize: "0.65rem", color: C.ghost, lineHeight: 1 }}
            >
              Inspection Report
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: "0.85rem", sm: "0.95rem" },
                fontWeight: 800,
                color: C.ink,
                lineHeight: 1.3,
              }}
            >
              {d.formType} - {d.asset}
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            flexWrap: "wrap",
          }}
        >
          <Chip
            label={statusLabel}
            size="small"
            sx={{
              bgcolor: statusColor,
              color: C.white,
              fontWeight: 700,
              fontSize: "0.72rem",
              height: 30,
              borderRadius: "8px",
              "& .MuiChip-label": { px: "12px" },
            }}
          />

          {/* Export in PDF */}
          <ActionButton
            variant="outlined"
            startIcon={
              exporting ? (
                <CircularProgress size={14} color="inherit" />
              ) : (
                <FileDownloadOutlinedIcon sx={{ fontSize: "0.95rem !important" }} />
              )
            }
            onClick={exportPDF}
            disabled={exporting}
            sx={{
              borderColor: C.navy,
              color: C.navy,
              "&:hover": { bgcolor: alpha(C.navy, 0.06) },
            }}
          >
            Export in PDF
          </ActionButton>

          {/* Print the Data */}
          <ActionButton
            variant="outlined"
            startIcon={
              printing ? (
                <CircularProgress size={14} color="inherit" />
              ) : (
                <PrintOutlinedIcon sx={{ fontSize: "0.95rem !important" }} />
              )
            }
            onClick={printData}
            disabled={printing}
            sx={{
              borderColor: C.navy,
              color: C.navy,
              "&:hover": { bgcolor: alpha(C.navy, 0.06) },
            }}
          >
            Print the Data
          </ActionButton>

          {/* Export in Excel */}
          <ActionButton
            variant="contained"
            startIcon={
              exportingExcel ? (
                <CircularProgress size={14} color="inherit" />
              ) : (
                <TableChartOutlinedIcon sx={{ fontSize: "0.95rem !important" }} />
              )
            }
            onClick={exportExcel}
            disabled={exportingExcel}
            sx={{
              bgcolor: C.navy,
              color: C.white,
              boxShadow: `0 3px 10px ${alpha(C.navy, 0.22)}`,
              "&:hover": { bgcolor: alpha(C.navy, 0.88) },
            }}
          >
            Export in Excel
          </ActionButton>
        </Box>
      </TopBar>

      {/* ── Report Content ───────────────────────────────────────────────── */}
      <Box ref={reportRef}>
        <Box
          sx={{ maxWidth: 1200, mx: "auto", px: { xs: 2, sm: 3 }, py: 3 }}
        >
          {/* Print header (visible in PDF/print output) */}
          <Box
            sx={{
              textAlign: "center",
              mb: 3,
              display: { xs: "none", print: "block" },
            }}
          >
            <Typography
              sx={{ fontSize: "1.5rem", fontWeight: 800, color: C.navy }}
            >
              AssetInspect
            </Typography>
            <Typography sx={{ fontSize: "0.8rem", color: C.muted }}>
              Inspection Report
            </Typography>
            <Typography
              sx={{ fontSize: "0.7rem", color: C.ghost, mt: 1 }}
            >
              Generated on {new Date().toLocaleDateString()}
            </Typography>
          </Box>

          {/* ── Row 1: Score + Summary ───────────────────────────────────── */}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              mb: 2,
              flexDirection: { xs: "column", sm: "row" },
            }}
          >
            <SectionCard sx={{ minWidth: { sm: 200 }, flex: { sm: "0 0 250px" } }}>
              <Box sx={{ p: 3, textAlign: "center" }}>
                <Typography
                  sx={{ fontSize: "0.72rem", color: C.muted, mb: 1.5 }}
                >
                  Overall Score
                </Typography>
                <Typography
                  sx={{
                    fontSize: "2.5rem",
                    fontWeight: 800,
                    color: scoreColor,
                    lineHeight: 1,
                  }}
                >
                  {d.score || "–"}%
                </Typography>
                <Typography
                  sx={{ fontSize: "0.78rem", color: C.muted, mt: 1 }}
                >
                  {d.scoreLabel}
                </Typography>
              </Box>
            </SectionCard>

            <SectionCard sx={{ flex: 1 }}>
              <Box sx={{ p: 3 }}>
                <Typography
                  sx={{
                    fontSize: "0.95rem",
                    fontWeight: 700,
                    color: C.ink,
                    mb: 2,
                  }}
                >
                  Inspection Summary
                </Typography>
                <Box
                  sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}
                >
                  <SummaryBox>
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: "50%",
                        bgcolor: alpha(C.greenIcon, 0.1),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <CheckCircleOutlineIcon
                        sx={{ fontSize: "1.3rem", color: C.greenIcon }}
                      />
                    </Box>
                    <Typography
                      sx={{
                        fontSize: "1.8rem",
                        fontWeight: 800,
                        color: C.ink,
                        lineHeight: 1,
                      }}
                    >
                      {d.itemsPassed}
                    </Typography>
                    <Typography sx={{ fontSize: "0.68rem", color: C.muted }}>
                      Items Passed
                    </Typography>
                  </SummaryBox>

                  <SummaryBox>
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: "50%",
                        bgcolor: alpha(C.red, 0.1),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <CancelOutlinedIcon
                        sx={{ fontSize: "1.3rem", color: C.red }}
                      />
                    </Box>
                    <Typography
                      sx={{
                        fontSize: "1.8rem",
                        fontWeight: 800,
                        color: C.red,
                        lineHeight: 1,
                      }}
                    >
                      {d.itemsFailed}
                    </Typography>
                    <Typography sx={{ fontSize: "0.68rem", color: C.muted }}>
                      Items Failed
                    </Typography>
                  </SummaryBox>

                  <SummaryBox>
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: "50%",
                        bgcolor: alpha(C.ghost, 0.12),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <WarningAmberOutlinedIcon
                        sx={{ fontSize: "1.3rem", color: C.ghost }}
                      />
                    </Box>
                    <Typography
                      sx={{
                        fontSize: "1.8rem",
                        fontWeight: 800,
                        color: C.ink,
                        lineHeight: 1,
                      }}
                    >
                      {d.notApplicable}
                    </Typography>
                    <Typography sx={{ fontSize: "0.68rem", color: C.muted }}>
                      N/A
                    </Typography>
                  </SummaryBox>
                </Box>
              </Box>
            </SectionCard>
          </Box>

          {/* ── Asset Information ────────────────────────────────────────── */}
          <SectionCard>
            <SectionTitle>Asset Information</SectionTitle>
            <InfoGrid>
              <InfoCell>
                <InfoLabel>Asset Name</InfoLabel>
                <InfoValue>{d.assetName}</InfoValue>
              </InfoCell>
              <InfoCell>
                <InfoLabel>Location</InfoLabel>
                <InfoValue>{d.location}</InfoValue>
              </InfoCell>
              <InfoCell>
                <InfoLabel>Category</InfoLabel>
                <InfoValue>{d.category}</InfoValue>
              </InfoCell>
              <InfoCell>
                <InfoLabel>Last Inspection</InfoLabel>
                <InfoValue>{d.lastInspection}</InfoValue>
              </InfoCell>
            </InfoGrid>
          </SectionCard>

          {/* ── Inspection Details ───────────────────────────────────────── */}
          <SectionCard>
            <SectionTitle>Inspection Details</SectionTitle>
            <InfoGrid>
              <InfoCell>
                <InfoLabel>Inspector Name</InfoLabel>
                <InfoValue>{d.inspectorName}</InfoValue>
              </InfoCell>
              <InfoCell>
                <InfoLabel>Overall Condition</InfoLabel>
                <InfoValue>{d.overallCondition}</InfoValue>
              </InfoCell>
              <InfoCell>
                <InfoLabel>Submitted Date</InfoLabel>
                <InfoValue>{d.submittedDate}</InfoValue>
              </InfoCell>
              <InfoCell>
                <InfoLabel>Inspection ID</InfoLabel>
                <InfoValue>{d.id}</InfoValue>
              </InfoCell>
            </InfoGrid>
          </SectionCard>

          {/* ── Inspection Checklist ─────────────────────────────────────── */}
          {d.checklist.total > 0 && (
            <SectionCard>
              <SectionTitle>{d.checklist.title}</SectionTitle>
              <Box
                sx={{
                  mx: { xs: 2, sm: 3 },
                  mb: 3,
                  borderRadius: 2.5,
                  border: `1px solid ${C.border}`,
                  overflow: "hidden",
                }}
              >
                <CheckHeader>
                  <Typography
                    sx={{
                      fontSize: "0.82rem",
                      fontWeight: 700,
                      color: C.ink,
                    }}
                  >
                    Checklist Items
                  </Typography>
                  <Typography sx={{ fontSize: "0.72rem", color: C.muted }}>
                    {d.checklist.passed}/{d.checklist.total} passed
                  </Typography>
                </CheckHeader>
                {d.checklist.items.map((item, i) => (
                  <CheckRow key={i} failed={item.result === "No"}>
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        sx={{
                          fontSize: "0.82rem",
                          color: C.ink,
                          fontWeight: 500,
                        }}
                      >
                        {item.label}
                      </Typography>
                      {item.note && (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                            mt: 0.3,
                          }}
                        >
                          <InfoOutlinedIcon
                            sx={{ fontSize: "0.75rem", color: C.muted }}
                          />
                          <Typography
                            sx={{ fontSize: "0.7rem", color: C.muted }}
                          >
                            Note: {item.note}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                    <ResultChip result={item.result} />
                  </CheckRow>
                ))}
              </Box>
            </SectionCard>
          )}

          {/* ── Inspector Notes ──────────────────────────────────────────── */}
          <SectionCard>
            <SectionTitle>Inspector Notes</SectionTitle>
            <Box sx={{ px: { xs: 2, sm: 3 }, pb: 3 }}>
              <Typography
                sx={{ fontSize: "0.85rem", color: C.muted, lineHeight: 1.6 }}
              >
                {d.inspectorNotes}
              </Typography>
            </Box>
          </SectionCard>

          {/* ── Admin Notes ──────────────────────────────────────────────── */}
          {d.adminNotes !== "No admin notes" && (
            <SectionCard>
              <SectionTitle>Admin Review Notes</SectionTitle>
              <Box sx={{ px: { xs: 2, sm: 3 }, pb: 3 }}>
                <Typography
                  sx={{
                    fontSize: "0.85rem",
                    color: C.muted,
                    lineHeight: 1.6,
                  }}
                >
                  {d.adminNotes}
                </Typography>
              </Box>
            </SectionCard>
          )}

          {/* ── Performance Rating ───────────────────────────────────────── */}
          {d.rating > 0 && (
            <SectionCard>
              <SectionTitle>Performance Rating</SectionTitle>
              <Box sx={{ px: { xs: 2, sm: 3 }, pb: 3 }}>
                <StarRating rating={d.rating} />
              </Box>
            </SectionCard>
          )}

          {/* Footer */}
          <Box
            sx={{
              textAlign: "center",
              mt: 4,
              pt: 2,
              borderTop: `1px solid ${C.border}`,
              display: { xs: "none", print: "block" },
            }}
          >
            <Typography sx={{ fontSize: "0.65rem", color: C.ghost }}>
              © {new Date().getFullYear()} AssetInspect — Inspection Report
            </Typography>
            <Typography
              sx={{ fontSize: "0.6rem", color: C.ghost, mt: 0.5 }}
            >
              This is a computer-generated document and does not require a
              signature.
            </Typography>
          </Box>
        </Box>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
  anchorOrigin={{ vertical: "top", horizontal: "right" }}>
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PageWrap>
  );
};

export default InspectionReportPage;
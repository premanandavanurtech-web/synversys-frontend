// components/CreateChecklistModal.jsx
import React from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  IconButton,
  Stack,
  Dialog,
  DialogContent,
  DialogActions,
  alpha,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import CloseIcon from "@mui/icons-material/Close";
import DescriptionIcon from "@mui/icons-material/Description";
import PublicIcon from "@mui/icons-material/Public";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

const CreateChecklistModal = ({
  open,
  onClose,
  openInNewTab = false,
  returnUrl = null,
  onSelectType = null,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const types = [
    {
      id: "custom",
      title: "Custom Checklist",
      description: "Build a fully custom checklist with drag-and-drop fields",
      icon: <DescriptionIcon />,
      iconBg: "#e0f2fe",
      iconColor: "#0284c7",
      path: "/admin/create-checklist/custom",
    },
    {
      id: "global",
      title: "Custom Checklist (Global)",
      description: "Submit a custom checklist for super admin approval",
      icon: <PublicIcon />,
      iconBg: "#dcfce7",
      iconColor: "#10b981",
      path: "/admin/create-checklist/global",
    },
    {
      id: "import",
      title: "Import from Excel",
      description: "Auto-generate checklist fields from an Excel spreadsheet",
      icon: <UploadFileIcon />,
      iconBg: "#e0f2fe",
      iconColor: "#0284c7",
      path: "/admin/import-checklist/excel",
    },
  ];

  const handleSelect = (type) => {
    onClose?.();
    if (onSelectType) {
      onSelectType(type.id);
      return;
    }
    if (openInNewTab) {
      window.open(type.path, "_blank");
    } else {
      if (returnUrl) {
        try {
          sessionStorage.setItem("returnToSelectChecklists", "true");
        } catch (e) {
          console.error(e);
        }
      }
      const targetUrl = returnUrl
        ? `${type.path}?returnUrl=${encodeURIComponent(returnUrl)}&openAssign=true&openChecklistModal=true`
        : type.path;
      navigate(targetUrl, { state: { returnUrl, openAssign: !!returnUrl, openChecklistModal: !!returnUrl } });
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      sx={{ zIndex: 1400 }}
      PaperProps={{
        sx: {
          borderRadius: { xs: "16px", sm: "22px" },
          overflow: "hidden",
          boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.35)",
          m: { xs: 1.5, sm: 2 },
          maxWidth: 560,
        },
      }}
      BackdropProps={{
        sx: {
          backgroundColor: "rgba(15, 23, 42, 0.65)",
          backdropFilter: "blur(6px)",
        },
      }}
    >
      {/* ── Dark Navy Header matching Image 1 ── */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #0b2e3f 0%, #0e3b50 100%)",
          p: { xs: 2.5, sm: 3 },
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              color: "#ffffff",
              fontSize: { xs: "1.15rem", sm: "1.35rem" },
              letterSpacing: "-0.01em",
              lineHeight: 1.25,
            }}
          >
            Create New Checklist
          </Typography>
          <Typography
            sx={{
              color: "rgba(255, 255, 255, 0.72)",
              fontSize: { xs: "0.82rem", sm: "0.88rem" },
              mt: 0.6,
              fontWeight: 400,
            }}
          >
            Choose how to build your checklist
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: "#ffffff",
            bgcolor: "rgba(0, 0, 0, 0.25)",
            "&:hover": { bgcolor: "rgba(0, 0, 0, 0.42)" },
            width: 32,
            height: 32,
            transition: "all 0.15s ease",
          }}
        >
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      {/* ── Cards Body ── */}
      <DialogContent sx={{ p: { xs: 2, sm: 3 }, pb: 1, bgcolor: "#ffffff" }}>
        <Stack spacing={2}>
          {types.map((type) => (
            <Paper
              key={type.id}
              elevation={0}
              role="button"
              tabIndex={0}
              onClick={() => handleSelect(type)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleSelect(type);
                }
              }}
              sx={{
                p: { xs: 1.75, sm: 2.25 },
                borderRadius: "18px",
                border: "1.5px solid #e2e8f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                cursor: "pointer",
                transition: "all 0.22s cubic-bezier(0.4, 0, 0.2, 1)",
                bgcolor: "#ffffff",
                "&:hover": {
                  borderColor: "#0284c7",
                  boxShadow: "0 10px 25px -5px rgba(2, 132, 199, 0.12)",
                  transform: "translateY(-2px)",
                  bgcolor: alpha(type.iconBg, 0.25),
                  "& .chevron-icon": {
                    color: "#0284c7",
                    transform: "translateX(3px)",
                  },
                },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1.75, sm: 2.25 }, minWidth: 0 }}>
                <Box
                  sx={{
                    width: { xs: 46, sm: 52 },
                    height: { xs: 46, sm: 52 },
                    borderRadius: "50%",
                    bgcolor: type.iconBg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {React.cloneElement(type.icon, {
                    sx: { fontSize: { xs: 22, sm: 26 }, color: type.iconColor },
                  })}
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: { xs: "0.95rem", sm: "1.05rem" },
                      color: "#0f172a",
                      mb: 0.35,
                      lineHeight: 1.25,
                    }}
                  >
                    {type.title}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: { xs: "0.78rem", sm: "0.84rem" },
                      color: "#64748b",
                      lineHeight: 1.4,
                    }}
                  >
                    {type.description}
                  </Typography>
                </Box>
              </Box>
              <ChevronRightIcon
                className="chevron-icon"
                sx={{
                  fontSize: 24,
                  color: "#94a3b8",
                  transition: "all 0.2s ease-in-out",
                  ml: 1.5,
                  flexShrink: 0,
                }}
              />
            </Paper>
          ))}
        </Stack>
      </DialogContent>

      {/* ── Footer matching Image 1 with right-aligned Cancel button ── */}
      <DialogActions
        sx={{
          p: { xs: 2, sm: 3 },
          pt: 1.5,
          pb: { xs: 2.5, sm: 3 },
          justifyContent: "flex-end",
          borderTop: "none",
          bgcolor: "#ffffff",
        }}
      >
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            fontSize: "0.88rem",
            color: "#1e293b",
            borderColor: "#cbd5e1",
            borderRadius: "10px",
            px: 3.2,
            py: 0.75,
            transition: "all 0.15s ease",
            "&:hover": {
              borderColor: "#94a3b8",
              bgcolor: "#f8fafc",
            },
          }}
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateChecklistModal;
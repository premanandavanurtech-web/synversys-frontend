import React, { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import GlobalStyles from "@mui/material/GlobalStyles";
import App from "./App";

const THEME_STORAGE_KEY = "assetmach-theme-mode";
const THEME_EXPLICIT_STORAGE_KEY = "assetmach-theme-mode-explicit";
const DEFAULT_THEME_MODE = "light";
const VALID_THEME_MODES = new Set(["light", "dark", "auto"]);

const getStoredThemeMode = () => {
  const storedMode = localStorage.getItem(THEME_STORAGE_KEY);
  const hasExplicitChoice = localStorage.getItem(THEME_EXPLICIT_STORAGE_KEY) === "true";
  if (hasExplicitChoice && VALID_THEME_MODES.has(storedMode)) return storedMode;
  return DEFAULT_THEME_MODE;
};

const getResolvedThemeMode = (mode) => {
  if (mode === "auto") {
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return mode === "dark" ? "dark" : "light";
};

function Root() {
  const [themeMode, setThemeMode] = useState(getStoredThemeMode);
  const [systemDark, setSystemDark] = useState(() =>
    window.matchMedia?.("(prefers-color-scheme: dark)").matches || false,
  );

  useEffect(() => {
    const media = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!media) return undefined;

    const handleChange = (event) => setSystemDark(event.matches);
    media.addEventListener?.("change", handleChange);
    return () => media.removeEventListener?.("change", handleChange);
  }, []);

  useEffect(() => {
    const handleThemeChange = (event) => {
      setThemeMode(event.detail?.mode || getStoredThemeMode());
    };
    window.addEventListener("assetmach-theme-change", handleThemeChange);
    return () => window.removeEventListener("assetmach-theme-change", handleThemeChange);
  }, []);

  const resolvedMode = themeMode === "auto" ? (systemDark ? "dark" : "light") : getResolvedThemeMode(themeMode);

  const theme = useMemo(() => createTheme({
    palette: {
      mode: resolvedMode,
      primary: {
        main: resolvedMode === "dark" ? "#1aa6c4" : "#0f4c61",
        dark: resolvedMode === "dark" ? "#0f6c84" : "#0b3a4a",
        light: resolvedMode === "dark" ? "#61d7ed" : "#e5f3f7",
      },
      background: {
        default: resolvedMode === "dark" ? "#07111f" : "#f8fafc",
        paper: resolvedMode === "dark" ? "#0c1726" : "#ffffff",
      },
      text: {
        primary: resolvedMode === "dark" ? "#f8fafc" : "#111827",
        secondary: resolvedMode === "dark" ? "#aeb8c8" : "#667085",
      },
      divider: resolvedMode === "dark" ? "rgba(148, 163, 184, 0.18)" : "#e5e7eb",
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    },
    shape: {
      borderRadius: 8,
    },
  }), [resolvedMode]);

  useEffect(() => {
    document.documentElement.dataset.theme = resolvedMode;
    document.documentElement.dataset.themeChoice = themeMode;
  }, [resolvedMode, themeMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles
        styles={{
          ":root": {
            colorScheme: resolvedMode,
          },
          body: {
            background:
              resolvedMode === "dark"
                ? "radial-gradient(circle at 80% 0%, rgba(18, 88, 112, 0.22) 0%, transparent 34%), #07111f"
                : "#f8fafc",
            colorScheme: resolvedMode,
          },
          ".MuiSnackbar-root": {
            position: "fixed !important",
            top: "20px !important",
            right: "20px !important",
            bottom: "auto !important",
            left: "auto !important",
            zIndex: "20000 !important",
            maxWidth: "calc(100vw - 40px)",
          },
          ".MuiSnackbar-root .MuiAlert-root": {
            width: "100% !important",
            minWidth: "320px",
            maxWidth: "420px",
            borderRadius: "10px !important",
            fontFamily:
              "'Sora', 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif !important",
            fontSize: "0.84rem !important",
            fontWeight: "700 !important",
            letterSpacing: "0 !important",
            alignItems: "center !important",
            boxShadow:
              resolvedMode === "dark"
                ? "0 18px 40px rgba(0,0,0,0.45) !important"
                : "0 18px 40px rgba(15,23,42,0.14) !important",
          },
          ".MuiSnackbar-root .MuiAlert-standardSuccess, .MuiSnackbar-root .MuiAlert-filledSuccess": {
            color:
              resolvedMode === "dark"
                ? "#bbf7d0 !important"
                : "#14532d !important",
            backgroundColor:
              resolvedMode === "dark"
                ? "#10281f !important"
                : "#ecfdf5 !important",
            border:
              resolvedMode === "dark"
                ? "1px solid rgba(74, 222, 128, 0.42) !important"
                : "1px solid rgba(22, 163, 74, 0.28) !important",
          },
          ".MuiSnackbar-root .MuiAlert-standardError, .MuiSnackbar-root .MuiAlert-filledError": {
            color:
              resolvedMode === "dark"
                ? "#fecaca !important"
                : "#7f1d1d !important",
            backgroundColor:
              resolvedMode === "dark"
                ? "#351616 !important"
                : "#fef2f2 !important",
            border:
              resolvedMode === "dark"
                ? "1px solid rgba(248, 113, 113, 0.42) !important"
                : "1px solid rgba(220, 38, 38, 0.28) !important",
          },
          ".MuiSnackbar-root .MuiAlert-standardWarning, .MuiSnackbar-root .MuiAlert-filledWarning": {
            color:
              resolvedMode === "dark"
                ? "#fde68a !important"
                : "#78350f !important",
            backgroundColor:
              resolvedMode === "dark"
                ? "#33250c !important"
                : "#fffbeb !important",
            border:
              resolvedMode === "dark"
                ? "1px solid rgba(251, 191, 36, 0.42) !important"
                : "1px solid rgba(217, 119, 6, 0.28) !important",
          },
          ".MuiSnackbar-root .MuiAlert-standardInfo, .MuiSnackbar-root .MuiAlert-filledInfo": {
            color:
              resolvedMode === "dark"
                ? "#bae6fd !important"
                : "#0c4a6e !important",
            backgroundColor:
              resolvedMode === "dark"
                ? "#0c2735 !important"
                : "#f0f9ff !important",
            border:
              resolvedMode === "dark"
                ? "1px solid rgba(56, 189, 248, 0.42) !important"
                : "1px solid rgba(2, 132, 199, 0.28) !important",
          },
          ".MuiSnackbar-root .MuiAlert-icon": {
            opacity: "1 !important",
            marginRight: "10px !important",
          },
          ".MuiSnackbar-root .MuiAlert-standardSuccess .MuiAlert-icon, .MuiSnackbar-root .MuiAlert-filledSuccess .MuiAlert-icon": {
            color: "#4ade80 !important",
          },
          ".MuiSnackbar-root .MuiAlert-standardError .MuiAlert-icon, .MuiSnackbar-root .MuiAlert-filledError .MuiAlert-icon": {
            color: "#f87171 !important",
          },
          ".MuiSnackbar-root .MuiAlert-standardWarning .MuiAlert-icon, .MuiSnackbar-root .MuiAlert-filledWarning .MuiAlert-icon": {
            color: "#fbbf24 !important",
          },
          ".MuiSnackbar-root .MuiAlert-standardInfo .MuiAlert-icon, .MuiSnackbar-root .MuiAlert-filledInfo .MuiAlert-icon": {
            color: "#38bdf8 !important",
          },
          ".MuiSnackbar-root .MuiAlert-message": {
            paddingTop: "2px !important",
            paddingBottom: "2px !important",
          },
          ".MuiSnackbar-root .MuiAlert-action": {
            paddingLeft: "8px !important",
            marginRight: "-6px !important",
          },
          ".MuiSnackbar-root .MuiAlert-action .MuiIconButton-root": {
            color: "inherit !important",
          },
          "@media (max-width: 600px)": {
            ".MuiSnackbar-root": {
              top: "12px !important",
              right: "12px !important",
              bottom: "auto !important",
              left: "auto !important",
              maxWidth: "calc(100vw - 24px)",
            },
            ".MuiSnackbar-root .MuiAlert-root": {
              minWidth: "auto",
              maxWidth: "calc(100vw - 24px)",
              fontSize: "0.8rem !important",
            },
          },
          "input[type='date'], input[type='time'], input[type='datetime-local'], input[type='month']": {
            colorScheme: resolvedMode,
          },
          ...(resolvedMode === "dark" && {
            "#root": {
              background:
                "radial-gradient(circle at 82% 0%, rgba(18, 88, 112, 0.2) 0%, transparent 34%), #07111f",
            },
            "input[type='date']::-webkit-calendar-picker-indicator, input[type='time']::-webkit-calendar-picker-indicator, input[type='datetime-local']::-webkit-calendar-picker-indicator, input[type='month']::-webkit-calendar-picker-indicator": {
              filter: "invert(1)",
              opacity: 0.78,
            },
            ".MuiPaper-root:not(.MuiAlert-root), .MuiCard-root, .MuiTableContainer-root": {
              background: "rgba(12, 23, 38, 0.92) !important",
              backgroundColor: "rgba(12, 23, 38, 0.92) !important",
              backgroundImage: "none !important",
              borderColor: "rgba(148, 163, 184, 0.18) !important",
              color: "#f8fafc !important",
              boxShadow: "0 18px 40px rgba(0, 0, 0, 0.22) !important",
            },
            "main > .MuiBox-root > .MuiBox-root": {
              backgroundColor: "transparent !important",
              background: "transparent !important",
            },
            ".MuiTableHead-root, .MuiTableHead-root .MuiTableRow-root, .MuiTableHead-root .MuiTableCell-root": {
              background: "rgba(12, 23, 38, 0.98) !important",
              backgroundColor: "rgba(12, 23, 38, 0.98) !important",
              color: "#d9e2ef !important",
            },
            ".MuiTableBody-root .MuiTableRow-root": {
              background: "rgba(12, 23, 38, 0.9) !important",
              backgroundColor: "rgba(12, 23, 38, 0.9) !important",
            },
            ".MuiTableFooter-root, .MuiTablePagination-root, .MuiTablePagination-toolbar, .MuiToolbar-root": {
              background: "rgba(12, 23, 38, 0.9) !important",
              backgroundColor: "rgba(12, 23, 38, 0.9) !important",
              color: "#aeb8c8 !important",
            },
            ".MuiDialog-paper .MuiDialogTitle-root, .MuiDialog-paper .MuiDialogContent-root, .MuiDialog-paper .MuiDialogActions-root, .MuiDialog-paper .MuiTabs-root": {
              background: "rgba(12, 23, 38, 0.96) !important",
              backgroundColor: "rgba(12, 23, 38, 0.96) !important",
              borderColor: "rgba(148, 163, 184, 0.18) !important",
            },
            ".MuiDialog-paper .MuiTab-root": {
              color: "#aeb8c8 !important",
            },
            ".MuiDialog-paper .MuiTab-root.Mui-selected": {
              color: "#61d7ed !important",
            },
            ".MuiTypography-root:not(.MuiAlert-message *)": {
              color: "#f8fafc !important",
            },
            ".MuiTypography-root.MuiTypography-body2, .MuiTypography-root.MuiTypography-caption": {
              color: "#aeb8c8 !important",
            },
            ".MuiTableCell-root": {
              color: "#d9e2ef !important",
              borderColor: "rgba(148, 163, 184, 0.16) !important",
            },
            ".MuiDivider-root": {
              borderColor: "rgba(148, 163, 184, 0.16) !important",
            },
            ".MuiOutlinedInput-root, .MuiInputBase-root": {
              backgroundColor: "rgba(15, 28, 46, 0.76) !important",
              color: "#f8fafc !important",
            },
            ".MuiOutlinedInput-notchedOutline": {
              borderColor: "rgba(148, 163, 184, 0.24) !important",
            },
            ".MuiInputLabel-root, .MuiInputBase-input::placeholder": {
              color: "#aeb8c8 !important",
            },
            ".MuiButton-outlined, .MuiToggleButton-root": {
              backgroundColor: "rgba(12, 23, 38, 0.72) !important",
              borderColor: "rgba(148, 163, 184, 0.28) !important",
              color: "#d9e2ef !important",
            },
            ".MuiButton-contained": {
              backgroundColor: "#0b6278 !important",
              color: "#ffffff !important",
            },
            ".MuiMenu-paper, .MuiPopover-paper, .MuiDrawer-paper": {
              backgroundColor: "#0c1726 !important",
              color: "#f8fafc !important",
              border: "1px solid rgba(148, 163, 184, 0.18)",
            },
            ".MuiMenuItem-root, .MuiListItemText-primary, .MuiListItemText-secondary": {
              color: "#d9e2ef !important",
            },
            ".MuiChip-root": {
              backgroundColor: "rgba(26, 166, 196, 0.12) !important",
              color: "#61d7ed !important",
            },
            ".MuiSkeleton-root": {
              backgroundColor: "rgba(148, 163, 184, 0.16) !important",
            },
            ".recharts-cartesian-grid line": {
              stroke: "rgba(148, 163, 184, 0.2)",
            },
            ".recharts-text, .recharts-label, .recharts-legend-item-text": {
              fill: "#aeb8c8 !important",
              color: "#aeb8c8 !important",
            },
          }),
          "::view-transition-old(root), ::view-transition-new(root)": {
            animationDuration: "220ms",
            animationTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
          },
          "::view-transition-old(root)": {
            animationName: "fade-out",
          },
          "::view-transition-new(root)": {
            animationName: "fade-in",
          },
          "@keyframes fade-out": {
            from: { opacity: 1 },
            to: { opacity: 0.92 },
          },
          "@keyframes fade-in": {
            from: { opacity: 0.92 },
            to: { opacity: 1 },
          },
          "@media (prefers-reduced-motion: reduce)": {
            "::view-transition-old(root), ::view-transition-new(root)": {
              animationDuration: "1ms",
            },
          },
        }}
      />
      <App />
    </ThemeProvider>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);

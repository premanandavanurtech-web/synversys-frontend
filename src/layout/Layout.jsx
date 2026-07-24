// layout/Layout.jsx - Updated with NotificationProvider
import { Box, useMediaQuery, useTheme } from "@mui/material";
import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";

export default function DashboardLayout({ children }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  useEffect(() => {
    if (!isMobile && mobileOpen) {
      setMobileOpen(false);
    }
  }, [isMobile, mobileOpen]);

  return (
    <Box sx={{ display: "flex", height: "100vh", overflow: "hidden", bgcolor: "#f8fafc" }}>
      <Sidebar mobileOpen={mobileOpen} onDrawerToggle={handleDrawerToggle} />
      
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        <TopBar onMenuToggle={handleDrawerToggle} />
        
        <Box
          component="main"
          sx={{
            flex: 1,
            overflow: "auto",
            bgcolor: "#f8fafc",
            p: { xs: 1.5, sm: 2, md: 2.5, lg: 3, xl: 3.5 },
            pb: {
              xs: "calc(128px + env(safe-area-inset-bottom))",
              sm: "calc(136px + env(safe-area-inset-bottom))",
              md: 2.5,
              lg: 3,
              xl: 3.5,
            },
            scrollPaddingBottom: {
              xs: "calc(128px + env(safe-area-inset-bottom))",
              sm: "calc(136px + env(safe-area-inset-bottom))",
              md: 24,
            },
            "&::-webkit-scrollbar": { width: { xs: 4, sm: 6, md: 8 } },
            "&::-webkit-scrollbar-track": { background: "transparent" },
            "&::-webkit-scrollbar-thumb": { background: theme.palette.divider, borderRadius: 10 },
            "&::-webkit-scrollbar-thumb:hover": { background: theme.palette.text.disabled },
            [theme.breakpoints.down("sm")]: {
              "& .MuiTablePagination-root": {
                width: "100%",
                maxWidth: "100%",
                overflow: "visible",
                mb: "calc(16px + env(safe-area-inset-bottom))",
              },
              "& .MuiTablePagination-toolbar": {
                minHeight: 44,
                px: "0 !important",
                gap: 0.5,
                flexWrap: "wrap",
                justifyContent: "center",
              },
              "& .MuiTablePagination-spacer": {
                display: "none",
              },
              "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
                m: 0,
                fontSize: "0.72rem",
                color: theme.palette.text.secondary,
                whiteSpace: "nowrap",
              },
              "& .MuiTablePagination-select": {
                fontSize: "0.75rem",
                py: 0.5,
              },
              "& .MuiTablePagination-actions": {
                ml: 0,
                flexShrink: 0,
              },
              "& .MuiTablePagination-actions .MuiIconButton-root": {
                p: 0.75,
              },
              "& .MuiPagination-root": {
                width: "100%",
                display: "flex",
                justifyContent: "center",
                mb: "calc(16px + env(safe-area-inset-bottom))",
              },
              "& .MuiPagination-ul": {
                justifyContent: "center",
                rowGap: 0.5,
              },
              "& .MuiPaginationItem-root": {
                minWidth: 30,
                height: 30,
                fontSize: "0.78rem",
              },
            },
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}

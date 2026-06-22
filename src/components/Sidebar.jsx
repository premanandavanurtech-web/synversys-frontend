// components/Sidebar.jsx - Complete with Proper Tab Order Management

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Tooltip,
  useMediaQuery,
  useTheme,
  IconButton,
  Avatar,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  CircularProgress,
  alpha,
  Divider,
  SwipeableDrawer,
  Backdrop,
  Fade,
  Zoom,
  Drawer,
} from "@mui/material";
import { styled } from "@mui/material/styles";

// MODERN ICONS
import DashboardCustomizeOutlinedIcon from "@mui/icons-material/DashboardCustomizeOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import ChecklistOutlinedIcon from "@mui/icons-material/ChecklistOutlined";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import ChevronLeftOutlinedIcon from "@mui/icons-material/ChevronLeftOutlined";
import ChevronRightOutlinedIcon from "@mui/icons-material/ChevronRightOutlined";
import SpaceDashboardOutlinedIcon from "@mui/icons-material/SpaceDashboardOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import AnalyticsOutlinedIcon from "@mui/icons-material/AnalyticsOutlined"; // NEW
import RestoreFromTrashOutlinedIcon from "@mui/icons-material/RestoreFromTrashOutlined";
import { useAuth } from "../context/AuthContexts";
import { useTeam } from "../context/TeamContext";

// Styled Components - Responsive
const MobileHeader = styled(Box)(({ theme }) => ({
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  height: { xs: 56, sm: 60, md: 64 },
  backgroundColor: "rgba(255, 255, 255, 0.96)",
  backdropFilter: "blur(10px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: { xs: "0 12px", sm: "0 16px", md: "0 20px" },
  boxShadow: `0 2px 12px ${alpha(theme.palette.common.black, 0.04)}`,
  zIndex: 1100,
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
}));

const MobileNavItem = styled(ListItem, {
  shouldForwardProp: (prop) => prop !== "active",
})(({ theme, active }) => ({
  borderRadius: 12,
  marginBottom: 6,
  padding: { xs: "10px 12px", sm: "10px 16px", md: "12px 16px" },
  cursor: "pointer",
  transition: "all 0.2s cubic-bezier(0.2, 0.9, 0.4, 1.1)",
  backgroundColor: active
    ? alpha(theme.palette.primary.main, 0.08)
    : "transparent",
  color: active ? theme.palette.primary.main : theme.palette.text.secondary,
  "&:hover": { backgroundColor: alpha(theme.palette.primary.main, 0.05) },
  "&:active": { transform: "scale(0.98)" },
  "& .MuiListItemIcon-root": { color: "inherit", minWidth: { xs: 36, sm: 40 } },
}));

const BottomNavBar = styled(Paper)(({ theme }) => ({
  position: "fixed",
  bottom: 0,
  left: 0,
  right: 0,
  height: { xs: 56, sm: 60, md: 64 },
  backgroundColor: "rgba(255, 255, 255, 0.96)",
  backdropFilter: "blur(10px)",
  boxShadow: `0 -4px 20px ${alpha(theme.palette.common.black, 0.05)}`,
  zIndex: 1100,
  borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
}));

const DesktopSidebar = styled(Box)(({ theme, iscollapsed }) => ({
  width:
    iscollapsed === "true"
      ? { md: 72, lg: 80, xl: 88 }
      : { md: 240, lg: 260, xl: 280 },
  backgroundColor: "#ffffff",
  display: { xs: "none", md: "block" },
  flexShrink: 0,
  height: "100vh",
  position: "sticky",
  top: 0,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflow: "hidden",
  boxShadow: `2px 0 12px ${alpha(theme.palette.common.black, 0.02)}`,
}));

// Navigation Configuration with Proper Order Management
// Each role has its own order sequence that can be easily adjusted

const navItemsConfig = {
  super_admin: [
    {
      id: "dashboard",
      icon: SpaceDashboardOutlinedIcon,
      label: "Dashboard",
      path: "/dashboard",
      roles: ["super_admin"],
      order: 10,
      section: "main",
    },
    {
      id: "clients",
      icon: GroupOutlinedIcon,
      label: "Customer Management",
      path: "/admin/clients",
      roles: ["super_admin"],
      order: 20,
      section: "management",
    },
    {
      id: "checklists",
      icon: ChecklistOutlinedIcon,
      label: "Checklists Builder",
      path: "/admin/checklists",
      roles: ["super_admin"],
      order: 30,
      section: "content",
    },
    {
      id: "recycle-bin",
      icon: RestoreFromTrashOutlinedIcon,
      label: "Checklist Recycle Bin",
      path: "/admin/checklists/recycle-bin",
      roles: ["super_admin"],
      order: 35,
      section: "content",
    },
    {
      id: "assigned",
      icon: AssignmentOutlinedIcon,
      label: "Assigned Checklist",
      path: "/admin/assigned-checklists",
      roles: ["super_admin"],
      order: 40,
      section: "operations",
    },
    {
      id: "reports",
      icon: BarChartOutlinedIcon,
      label: "Reports",
      path: "/admin/reports",
      roles: ["super_admin"],
      order: 50,
      section: "analytics",
    },
    {
      id: "contact-inquiries",
      icon: EmailOutlinedIcon,
      label: "Contact Inquiries",
      path: "/admin/contact-inquiries",
      roles: ["super_admin"],
      order: 60,
      section: "communications",
    },
    {
      id: "audit-logs",
      icon: ReceiptLongOutlinedIcon,
      label: "Audit Logs",
      path: "/admin/audit-logs",
      roles: ["super_admin"],
      order: 70,
      section: "security",
    },
  ],
  admin: [
    {
      id: "dashboard",
      icon: SpaceDashboardOutlinedIcon,
      label: "Dashboard",
      path: "/dashboard",
      roles: ["admin"],
      order: 10,
      section: "main",
    },
    {
      id: "team",
      icon: PeopleAltOutlinedIcon,
      label: "Team Management",
      path: "/admin/team",
      roles: ["admin"],
      order: 20,
      section: "management",
    },
    {
      id: "checklists",
      icon: ChecklistOutlinedIcon,
      label: "Checklists Builder",
      path: "/admin/checklists",
      roles: ["admin"],
      order: 30,
      section: "content",
    },
    {
      id: "recycle-bin",
      icon: RestoreFromTrashOutlinedIcon,
      label: "Checklist Recycle Bin",
      path: "/admin/checklists/recycle-bin",
      roles: ["admin"],
      order: 35,
      section: "content",
    },
    {
      id: "assigned",
      icon: AssignmentOutlinedIcon,
      label: "Assigned Checklist",
      path: "/admin/assigned-checklists",
      roles: ["admin"],
      order: 40,
      section: "operations",
    },
    {
      id: "assets",
      icon: Inventory2OutlinedIcon,
      label: "Assets Management",
      path: "/admin/assets",
      roles: ["admin"],
      order: 45,
      section: "operations",
    },
    {
      id: "reports",
      icon: BarChartOutlinedIcon,
      label: "Reports",
      path: "/admin/reports",
      roles: ["admin"],
      order: 50,
      section: "analytics",
    },
    {
      id: "audit-logs",
      icon: ReceiptLongOutlinedIcon,
      label: "Audit Logs",
      path: "/admin/audit-logs",
      roles: ["admin"],
      order: 60,
      section: "security",
    },
  ],
  team: [
    {
      id: "tasks",
      icon: TaskAltOutlinedIcon,
      label: "My Tasks",
      path: "/team",
      roles: ["team"],
      order: 10,
      section: "main",
    },
    {
      id: "assets",
      icon: Inventory2OutlinedIcon,
      label: "Assets Management",
      path: "/admin/assets",
      roles: ["team"],
      order: 20,
      section: "management",
    },
    {
      id: "history",
      icon: HistoryOutlinedIcon,
      label: "History",
      path: "/team/history",
      roles: ["team"],
      order: 30,
      section: "records",
    },
    {
      id: "audit-logs",
      icon: ReceiptLongOutlinedIcon,
      label: "Audit Logs",
      path: "/admin/audit-logs",
      roles: ["team"],
      order: 40,
      section: "security",
    },
    {
      id: "reports",
      icon: BarChartOutlinedIcon,
      label: "Reports",
      path: "/team/reports",
      roles: ["team"],
      order: 50,
      section: "analytics",
    },
    {
      id: "profile",
      icon: PersonOutlineOutlinedIcon,
      label: "Profile",
      path: "/team/profile",
      roles: ["team"],
      order: 60,
      section: "user",
    },
  ],
};


// Section headers for visual grouping (optional)
const sectionHeaders = {
  main: { label: "MAIN", order: 1 },
  management: { label: "MANAGEMENT", order: 2 },
  content: { label: "CONTENT", order: 3 },
  operations: { label: "OPERATIONS", order: 4 },
  analytics: { label: "ANALYTICS", order: 5 },
  communications: { label: "COMMUNICATIONS", order: 6 },
  security: { label: "SECURITY & AUDIT", order: 7 },
  records: { label: "RECORDS", order: 8 },
  user: { label: "USER", order: 9 },
};

// Helper function to filter, sort, and optionally group nav items
export const getNavItems = (userRole, groupBySection = false) => {
  let items = [];

  if (userRole === "super_admin") {
    items = [...navItemsConfig.super_admin];
  } else if (userRole === "admin") {
    items = [...navItemsConfig.admin];
  } else if (userRole === "team") {
    items = [...navItemsConfig.team];
  } else {
    return [];
  }

  // Sort by order
  items.sort((a, b) => a.order - b.order);

  if (groupBySection) {
    // Group items by section
    const grouped = {};
    items.forEach((item) => {
      const section = item.section || "other";
      if (!grouped[section]) {
        grouped[section] = [];
      }
      grouped[section].push(item);
    });

    // Sort sections by their defined order
    const sortedSections = Object.keys(grouped).sort((a, b) => {
      const orderA = sectionHeaders[a]?.order || 999;
      const orderB = sectionHeaders[b]?.order || 999;
      return orderA - orderB;
    });

    return { grouped, sortedSections, items };
  }

  return items;
};

// Helpers
const getUserDisplayName = (user) => {
  if (!user) return "User";
  return user.name || user.email?.split("@")[0] || "User";
};

const getUserInitials = (user) => {
  if (!user) return "U";
  const name = user.name || user.email || "User";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

// Main Component
export default function Sidebar({ mobileOpen, onDrawerToggle }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAuthenticated, loading: authLoading } = useAuth();
  const { profile } = useTeam();
  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [bottomNavValue, setBottomNavValue] = useState(0);
  const avatarUrl = profile?.avatarUrl || user?.avatarUrl || "";

  // Get sorted nav items (no grouping for bottom nav)
  const navItems = getNavItems(user?.role, false);
  // Get grouped nav items for desktop sidebar (optional visual grouping)
  const { grouped, sortedSections } = getNavItems(user?.role, true);

  // Filter nav items for bottom navigation (max 5 items)
  const bottomNavItems = navItems.slice(0, isMobile ? 4 : 5);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) navigate("/login");
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    if (typeof mobileOpen === "boolean" && mobileOpen !== mobileMenuOpen) {
      setMobileMenuOpen(mobileOpen);
    }
  }, [mobileOpen]);

  useEffect(() => {
    const currentPath = location.pathname;
    const activeIndex = navItems.findIndex((item) => currentPath === item.path);
    if (activeIndex !== -1) {
      setActiveItem(navItems[activeIndex].id);
      // Find index in bottom nav items
      const bottomIndex = bottomNavItems.findIndex(
        (item) => item.id === navItems[activeIndex].id,
      );
      if (bottomIndex !== -1) {
        setBottomNavValue(bottomIndex);
      }
    } else {
      setActiveItem("");
    }
  }, [location.pathname, navItems, bottomNavItems]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleNavigation = useCallback(
    (path, id, e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      setActiveItem(id);
      if (mobileMenuOpen) setMobileMenuOpen(false);
      if (onDrawerToggle && mobileOpen) onDrawerToggle();
      navigate(path);
    },
    [navigate, onDrawerToggle, mobileOpen, mobileMenuOpen],
  );

  const handleBottomNavChange = (_event, newValue) => {
    const item = bottomNavItems[newValue];
    if (item) {
      setActiveItem(item.id);
      setBottomNavValue(newValue);
      navigate(item.path);
    }
  };

  const handleCollapseToggle = () => setIsCollapsed((prev) => !prev);
  const handleOpenMobileMenu = () => setMobileMenuOpen(true);
  const handleCloseMobileMenu = () => setMobileMenuOpen(false);

  if (authLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          bgcolor: "#f8fafc",
        }}
      >
        <CircularProgress sx={{ color: theme.palette.primary.main }} />
      </Box>
    );
  }

  if (!user || navItems.length === 0) return null;

  // Render nav items (with optional section headers for desktop)
  const renderNavItems = (itemsList, showSectionHeaders = false) => {
    if (showSectionHeaders && grouped && sortedSections) {
      return sortedSections.map((section) => {
        const sectionItems = grouped[section];
        const header = sectionHeaders[section];

        return (
          <Box key={section}>
            {header && !isCollapsed && (
              <Typography
                variant="caption"
                sx={{
                  px: { md: 1.5, lg: 2 },
                  pt: 2,
                  pb: 1,
                  display: "block",
                  color: "#94a3b8",
                  fontWeight: 600,
                  fontSize: { md: 10, lg: 11 },
                  letterSpacing: "0.5px",
                }}
              >
                {header.label}
              </Typography>
            )}
            {sectionItems.map(({ id, icon: Icon, label, path }) => {
              const isActive = activeItem === id || location.pathname === path;
              const isRecycleBin = id === "recycle-bin";

              return (
                <Tooltip
                  key={id}
                  title={isCollapsed ? label : ""}
                  placement="right"
                  arrow
                  enterDelay={500}
                >
                  <ListItem
                    onClick={(e) => handleNavigation(path, id, e)}
                    sx={{
                      borderRadius: 2,
                      mb: 0.5,
                      py: { md: 1, lg: 1.2 },
                      px: { md: 1.2, lg: 1.5 },
                      cursor: "pointer",
                      backgroundColor: isActive
                        ? alpha(theme.palette.primary.main, 0.08)
                        : "transparent",
                      color: isActive
                        ? theme.palette.primary.main
                        : isRecycleBin && !isActive
                          ? theme.palette.text.secondary
                          : theme.palette.text.secondary,
                      "&:hover": {
                        backgroundColor:
                          isRecycleBin && !isActive
                            ? alpha(theme.palette.warning.main, 0.05)
                            : alpha(theme.palette.primary.main, 0.05),
                        transform: "translateX(4px)",
                      },
                      transition: "all 0.2s ease",
                      "& .MuiListItemIcon-root": {
                        color: "inherit",
                        minWidth: isCollapsed ? "auto" : { md: 36, lg: 40 },
                      },
                    }}
                  >
                    <ListItemIcon>
                      <Icon sx={{ fontSize: { md: 20, lg: 22, xl: 24 } }} />
                    </ListItemIcon>
                    {!isCollapsed && (
                      <ListItemText
                        primary={label}
                        primaryTypographyProps={{
                          fontSize: { md: 13, lg: 14, xl: 15 },
                          fontWeight: isActive ? 600 : 500,
                          noWrap: true,
                        }}
                      />
                    )}
                  </ListItem>
                </Tooltip>
              );
            })}
          </Box>
        );
      });
    }

    // Simple list without grouping (for mobile)
    return itemsList.map(({ id, icon: Icon, label, path }) => {
      const isActive = activeItem === id || location.pathname === path;
      const isRecycleBin = id === "recycle-bin";

      return (
        <MobileNavItem
          key={id}
          active={isActive}
          onClick={(e) => handleNavigation(path, id, e)}
          sx={{
            backgroundColor:
              isRecycleBin && !isActive
                ? alpha(theme.palette.warning.main, 0.03)
                : undefined,
          }}
        >
          <ListItemIcon>
            <Icon sx={{ fontSize: { xs: 22, sm: 24 } }} />
          </ListItemIcon>
          <ListItemText
            primary={label}
            primaryTypographyProps={{
              fontSize: { xs: 14, sm: 15 },
              fontWeight: isActive ? 600 : 500,
            }}
          />
        </MobileNavItem>
      );
    });
  };

  // Desktop Sidebar Content
  const desktopSidebarContent = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#ffffff",
        borderRight: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
        position: "relative",
      }}
    >
      {/* Logo Section */}
      <Box
        sx={{
          p: isCollapsed ? { md: 1.5, lg: 2 } : { md: 2, lg: 2.5 },
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          justifyContent: isCollapsed ? "center" : "flex-start",
          position: "relative",
        }}
      >
        <Zoom in={true} timeout={300}>
          <Box
            sx={{
              width: { md: 36, lg: 40, xl: 44 },
              height: { md: 36, lg: 40, xl: 44 },
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              borderRadius: { md: "10px", lg: "12px", xl: "14px" },
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 6px 12px ${alpha(theme.palette.primary.main, 0.25)}`,
              flexShrink: 0,
            }}
          >
            <Inventory2OutlinedIcon
              sx={{ color: "#fff", fontSize: { md: 18, lg: 20, xl: 22 } }}
            />
          </Box>
        </Zoom>
        {!isCollapsed && (
          <Fade in={!isCollapsed}>
            <Box sx={{ minWidth: 0 }}>
              <Typography fontWeight={700} fontSize={{ md: 14, lg: 16 }} noWrap>
                AssetMach
              </Typography>
              <Typography
                fontSize={{ md: 10, lg: 11 }}
                color="text.secondary"
                textTransform="capitalize"
                noWrap
              >
                {user?.role === "super_admin" ? "Super Admin" : user?.role}
              </Typography>
            </Box>
          </Fade>
        )}
        {isDesktop && (
          <IconButton
            onClick={handleCollapseToggle}
            size="small"
            sx={{
              position: "absolute",
              right: -9,
              top: "50%",
              transform: "translateY(-50%)",
              bgcolor: "#fff",
              boxShadow: 1,
              border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              width: { md: 22, lg: 24 },
              height: { md: 22, lg: 24 },
              "&:hover": { bgcolor: "#f5f5f5" },
              display: { xs: "none", md: "flex" },
            }}
          >
            {isCollapsed ? (
              <ChevronRightOutlinedIcon fontSize="small" />
            ) : (
              <ChevronLeftOutlinedIcon fontSize="small" />
            )}
          </IconButton>
        )}
      </Box>

      {/* Navigation Links with Section Headers */}
      <List
        sx={{
          flex: 1,
          px: isCollapsed ? 1 : { md: 1.5, lg: 2 },
          py: 2,
          overflowY: "auto",
          "&::-webkit-scrollbar": {
            width: "4px",
          },
          "&::-webkit-scrollbar-track": {
            background: "#f1f1f1",
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "#c1c1c1",
            borderRadius: "4px",
            "&:hover": {
              background: "#a1a1a1",
            },
          },
        }}
      >
        {renderNavItems(navItems, true)}
      </List>

      {/* User Profile Section */}
      {!isCollapsed && (
        <Fade in={!isCollapsed}>
          <Box
            sx={{
              p: { md: 1.5, lg: 2 },
              borderTop: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
              display: "flex",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            <Avatar
              src={avatarUrl || undefined}
              sx={{
                width: { md: 32, lg: 36, xl: 40 },
                height: { md: 32, lg: 36, xl: 40 },
                bgcolor: theme.palette.primary.main,
                fontSize: { md: 12, lg: 14 },
                flexShrink: 0,
              }}
            >
              {getUserInitials(user)}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
              <Typography
                variant="body2"
                fontWeight={600}
                noWrap
                fontSize={{ md: 12, lg: 13 }}
              >
                {getUserDisplayName(user)}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                noWrap
                fontSize={{ md: 10, lg: 11 }}
              >
                {user?.email || ""}
              </Typography>
            </Box>
          </Box>
        </Fade>
      )}

      {/* Logout Button */}
      <Box
        sx={{
          p: isCollapsed ? { md: 1.5, lg: 2 } : { md: 1.5, lg: 2 },
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
        }}
      >
        <Tooltip title={isCollapsed ? "Logout" : ""} placement="right" arrow>
          <Button
            onClick={handleLogout}
            startIcon={!isCollapsed ? <LogoutOutlinedIcon /> : null}
            fullWidth
            variant="text"
            sx={{
              justifyContent: isCollapsed ? "center" : "flex-start",
              color: theme.palette.text.secondary,
              fontWeight: 500,
              textTransform: "none",
              py: { md: 0.75, lg: 1 },
              px: { md: 1, lg: 1.5 },
              borderRadius: 2,
              minWidth: 0,
              "&:hover": {
                color: theme.palette.error.main,
                backgroundColor: alpha(theme.palette.error.main, 0.08),
              },
            }}
          >
            {!isCollapsed ? (
              "Logout"
            ) : (
              <LogoutOutlinedIcon sx={{ fontSize: { md: 18, lg: 20 } }} />
            )}
          </Button>
        </Tooltip>
      </Box>
    </Box>
  );

  // Mobile Drawer Content - Optimized for touch
  const mobileMenuContent = (
    <Box
      sx={{
        height: "100%",
        bgcolor: "#fff",
        display: "flex",
        flexDirection: "column",
        width: isMobile ? "85vw" : 320,
      }}
    >
      {/* Drawer Header */}
      <Box
        sx={{
          p: { xs: 1.5, sm: 2 },
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: { xs: 36, sm: 40 },
              height: { xs: 36, sm: 40 },
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Inventory2OutlinedIcon
              sx={{ color: "#fff", fontSize: { xs: 18, sm: 20 } }}
            />
          </Box>
          <Typography fontWeight={600} fontSize={{ xs: 14, sm: 16 }}>
            AssetMach
          </Typography>
        </Box>
        <IconButton
          onClick={handleCloseMobileMenu}
          size="small"
          sx={{
            "&:active": { transform: "scale(0.95)" },
          }}
        >
          <CloseOutlinedIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
        </IconButton>
      </Box>

      {/* User Profile Card */}
      <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            p: { xs: 1, sm: 1.5 },
            borderRadius: 2,
            bgcolor: alpha(theme.palette.primary.main, 0.04),
          }}
        >
          <Avatar
            src={avatarUrl || undefined}
            sx={{
              width: { xs: 40, sm: 44 },
              height: { xs: 40, sm: 44 },
              bgcolor: theme.palette.primary.main,
              fontSize: { xs: 14, sm: 16 },
            }}
          >
            {getUserInitials(user)}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
            <Typography fontWeight={600} noWrap fontSize={{ xs: 14, sm: 15 }}>
              {getUserDisplayName(user)}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              noWrap
              fontSize={{ xs: 11, sm: 12 }}
            >
              {user?.email || ""}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ mx: 2 }} />

      {/* Navigation List - Scrollable */}
      <List
        sx={{
          px: { xs: 1.5, sm: 2 },
          flex: 1,
          overflowY: "auto",
          "&::-webkit-scrollbar": {
            width: "4px",
          },
          "&::-webkit-scrollbar-track": {
            background: "#f1f1f1",
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "#c1c1c1",
            borderRadius: "4px",
          },
        }}
      >
        {renderNavItems(navItems, false)}
      </List>

      {/* Logout Button */}
      <Box sx={{ p: { xs: 1.5, sm: 2 }, mt: "auto" }}>
        <Button
          onClick={handleLogout}
          startIcon={<LogoutOutlinedIcon />}
          fullWidth
          variant="outlined"
          color="error"
          sx={{
            py: { xs: 1, sm: 1.2 },
            borderRadius: 2,
            textTransform: "none",
            fontSize: { xs: 13, sm: 14 },
            "&:active": { transform: "scale(0.98)" },
          }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );

  // Mobile / Tablet Layout
  if (isMobile || isTablet) {
    return (
      <>
        {/* Mobile Header with glassmorphism */}
        <MobileHeader>
          <IconButton
            onClick={handleOpenMobileMenu}
            size="small"
            sx={{
              "&:active": { transform: "scale(0.95)" },
            }}
          >
            <MenuOutlinedIcon sx={{ fontSize: { xs: 20, sm: 22 } }} />
          </IconButton>

          {/* Logo in header */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Zoom in={true} timeout={300}>
              <Box
                sx={{
                  width: { xs: 28, sm: 32 },
                  height: { xs: 28, sm: 32 },
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Inventory2OutlinedIcon
                  sx={{ color: "#fff", fontSize: { xs: 16, sm: 18 } }}
                />
              </Box>
            </Zoom>
            <Typography fontWeight={600} fontSize={{ xs: 13, sm: 14 }}>
              AssetMach
            </Typography>
          </Box>

          {/* Right side logout icon for quick access */}
          <IconButton
            onClick={handleLogout}
            size="small"
            sx={{
              "&:active": { transform: "scale(0.95)" },
            }}
          >
            <LogoutOutlinedIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
          </IconButton>
        </MobileHeader>

        {/* Spacer for fixed header */}
        <Box sx={{ height: { xs: 56, sm: 60, md: 64 } }} />

        {/* Mobile Drawer */}
        <Drawer
          anchor="left"
          open={mobileMenuOpen}
          onClose={handleCloseMobileMenu}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            "& .MuiDrawer-paper": {
              width: isMobile ? "85vw" : 320,
              boxSizing: "border-box",
              borderRight: "none",
              boxShadow: `4px 0 20px ${alpha(theme.palette.common.black, 0.1)}`,
            },
          }}
        >
          {mobileMenuContent}
        </Drawer>

        {/* Bottom Navigation Bar - Only show if there are items */}
        {bottomNavItems.length > 0 && (
          <>
            <BottomNavBar elevation={0}>
              <BottomNavigation
                value={bottomNavValue}
                onChange={handleBottomNavChange}
                showLabels={!isMobile}
                sx={{
                  height: { xs: 56, sm: 60 },
                  backgroundColor: "transparent",
                }}
              >
                {bottomNavItems.map((item, idx) => (
                  <BottomNavigationAction
                    key={item.id}
                    label={isMobile ? "" : item.label}
                    icon={
                      <item.icon
                        sx={{
                          fontSize: { xs: 20, sm: 22, md: 24 },
                          transition: "transform 0.2s ease",
                        }}
                      />
                    }
                    sx={{
                      color:
                        bottomNavValue === idx
                          ? theme.palette.primary.main
                          : theme.palette.text.secondary,
                      "&.Mui-selected": {
                        color: theme.palette.primary.main,
                        "& .MuiBottomNavigationAction-label": {
                          fontSize: { xs: 10, sm: 12 },
                        },
                      },
                      "&:active": {
                        transform: "scale(0.95)",
                      },
                    }}
                  />
                ))}
              </BottomNavigation>
            </BottomNavBar>
            {/* Spacer for bottom navigation */}
            <Box sx={{ height: { xs: 56, sm: 60 } }} />
          </>
        )}

        {/* Backdrop overlay when drawer is open */}
        <Backdrop
          open={mobileMenuOpen}
          onClick={handleCloseMobileMenu}
          sx={{
            zIndex: (theme) => theme.zIndex.drawer - 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(4px)",
          }}
        />
      </>
    );
  }

  // Desktop Layout
  return (
    <DesktopSidebar iscollapsed={isCollapsed.toString()}>
      {desktopSidebarContent}
    </DesktopSidebar>
  );
}

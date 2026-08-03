// components/Sidebar.jsx - Complete with Proper Tab Order Management

import React, { useState, useEffect, useCallback, useMemo } from "react";
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
  Portal,
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
import EventNoteOutlinedIcon from "@mui/icons-material/EventNoteOutlined";
import ChevronLeftOutlinedIcon from "@mui/icons-material/ChevronLeftOutlined";
import ChevronRightOutlinedIcon from "@mui/icons-material/ChevronRightOutlined";
import KeyboardArrowDownOutlinedIcon from "@mui/icons-material/KeyboardArrowDownOutlined";
import SpaceDashboardOutlinedIcon from "@mui/icons-material/SpaceDashboardOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import AnalyticsOutlinedIcon from "@mui/icons-material/AnalyticsOutlined"; // NEW
import RestoreFromTrashOutlinedIcon from "@mui/icons-material/RestoreFromTrashOutlined";
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import { useAuth } from "../context/AuthContexts";
import { useTeam } from "../context/TeamContext";
import { PROJECT_LOGO_URL } from "../utils/brand";

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
    ? ACTIVE_NAV_COLOR
    : "transparent",
  color: active ? "#ffffff" : theme.palette.text.secondary,
  "&:hover": {
    backgroundColor: active
      ? ACTIVE_NAV_COLOR
      : alpha(theme.palette.primary.main, 0.05),
    color: active ? "#ffffff" : theme.palette.primary.main,
  },
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
  zIndex: theme.zIndex.drawer + 3,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflow: "visible",
  boxShadow: `2px 0 12px ${alpha(theme.palette.common.black, 0.02)}`,
  "@keyframes sidebarItemIn": {
    from: {
      opacity: 0,
      transform: "translateX(-10px)",
    },
    to: {
      opacity: 1,
      transform: "translateX(0)",
    },
  },
  "@keyframes sidebarActiveGlow": {
    "0%, 100%": {
      boxShadow: `0 10px 24px ${alpha(ACTIVE_NAV_COLOR, 0.16)}`,
    },
    "50%": {
      boxShadow: `0 14px 30px ${alpha(ACTIVE_NAV_COLOR, 0.22)}`,
    },
  },
  ...(iscollapsed === "true"
    ? {
        "& .MuiListItem-root": {
          justifyContent: "center",
          position: "relative",
        },
        "& .MuiListItemIcon-root": {
          minWidth: "0 !important",
          marginRight: "0 !important",
          justifyContent: "center",
        },
        "& .MuiListItemText-root, & .MuiListItemText-primary": {
          display: "none !important",
        },
        "& .MuiSvgIcon-root + .MuiListItemText-root": {
          display: "none !important",
        },
      }
    : {}),
}));

const ACTIVE_NAV_COLOR = "#15576A";

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
      id: "task",
      icon: AssignmentOutlinedIcon,
      label: "Operations",
      roles: ["super_admin"],
      order: 30,
      section: "task",
      children: [
        {
          id: "checklists",
          icon: ChecklistOutlinedIcon,
          label: "Checklist Builder",
          path: "/admin/checklists",
          order: 10,
        },
        {
          id: "assigned",
          icon: EventNoteOutlinedIcon,
          label: "Checklist Assignment",
          path: "/admin/assigned-checklists",
          order: 20,
        },
        {
          id: "tickets",
          icon: ConfirmationNumberOutlinedIcon,
          label: "Tickets",
          path: "/admin/tickets-raised",
          order: 30,
        },
        // {
        //   id: "time-stamp",
        //   icon: AccessTimeOutlinedIcon,
        //   label: "Time Stamp",
        //   path: "/admin/audit-logs?focus=timestamp",
        //   order: 40,
        // },
      ],
    },
    {
      id: "reports",
      icon: BarChartOutlinedIcon,
      label: "Reports",
      path: "/admin/reports",
      roles: ["super_admin"],
      order: 60,
      section: "analytics",
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
    {
      id: "contact-inquiries",
      icon: EmailOutlinedIcon,
      label: "Enquiries",
      path: "/admin/contact-inquiries",
      roles: ["super_admin"],
      order: 80,
      section: "communications",
    },
    {
      id: "recycle-bin",
      icon: RestoreFromTrashOutlinedIcon,
      label: "Recycle Bin",
      path: "/admin/checklists/recycle-bin",
      roles: ["super_admin"],
      order: 90,
      section: "records",
    },
    {
      id: "settings",
      icon: SettingsOutlinedIcon,
      label: "Settings",
      path: "/admin/settings",
      roles: ["super_admin"],
      order: 100,
      section: "user",
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
      order: 30,
      section: "management",
    },
    {
      id: "clients",
      icon: GroupOutlinedIcon,
      label: "Admin Management",
      path: "/admin/clients",
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
      id: "raise-ticket",
      icon: ConfirmationNumberOutlinedIcon,
      label: "Raise Ticket",
      path: "/admin/tickets",
      roles: ["admin"],
      order: 48,
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
    {
      id: "settings",
      icon: SettingsOutlinedIcon,
      label: "Settings",
      path: "/admin/settings",
      roles: ["admin"],
      order: 70,
      section: "user",
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
      id: "raise-ticket",
      icon: ConfirmationNumberOutlinedIcon,
      label: "Raise Ticket",
      path: "/team/tickets",
      roles: ["team"],
      order: 35,
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
// const sectionHeaders = {
//   main: { label: "MAIN", order: 1 },
//   management: { label: "MANAGEMENT", order: 2 },
//   task: { label: "TASK", order: 3 },
//   content: { label: "CONTENT", order: 4 },
//   operations: { label: "OPERATIONS", order: 5 },
//   analytics: { label: "ANALYTICS", order: 6 },
//   security: { label: "SECURITY & AUDIT", order: 7 },
//   communications: { label: "COMMUNICATIONS", order: 8 },
//   records: { label: "RECORDS", order: 9 },
//   user: { label: "USER", order: 10 },
// };

const sortNavItems = (items) =>
  [...items]
    .sort((a, b) => a.order - b.order)
    .map((item) => ({
      ...item,
      children: item.children ? sortNavItems(item.children) : undefined,
    }));

const flattenNavItems = (items) =>
  items.flatMap((item) => [
    item,
    ...(item.children ? flattenNavItems(item.children) : []),
  ]);

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
  items = sortNavItems(items);

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
    // const sortedSections = Object.keys(grouped).sort((a, b) => {
    //   const orderA = sectionHeaders[a]?.order || 999;
    //   const orderB = sectionHeaders[b]?.order || 999;
    //   return orderA - orderB;
    // });

    return { grouped, items };
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
  const [openNavGroups, setOpenNavGroups] = useState({ task: true });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [bottomNavValue, setBottomNavValue] = useState(0);
  const [collapsedTooltip, setCollapsedTooltip] = useState(null);
  const avatarUrl = profile?.avatarUrl || user?.avatarUrl || "";

  // Get sorted nav items (no grouping for bottom nav)
  const navItems = useMemo(() => getNavItems(user?.role, false), [user?.role]);
  const flatNavItems = useMemo(() => flattenNavItems(navItems), [navItems]);
  // Get grouped nav items for desktop sidebar (optional visual grouping)
  const { grouped, sortedSections } = useMemo(
    () => getNavItems(user?.role, true),
    [user?.role],
  );

  // Filter nav items for bottom navigation (max 5 items)
  const bottomNavItems = useMemo(
    () =>
      flatNavItems.filter((item) => item.path).slice(0, isMobile ? 4 : 5),
    [flatNavItems, isMobile],
  );

  useEffect(() => {
    if (!authLoading && !isAuthenticated) navigate("/login");
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    if (typeof mobileOpen === "boolean" && mobileOpen !== mobileMenuOpen) {
      setMobileMenuOpen(mobileOpen);
    }
  }, [mobileOpen]);

  useEffect(() => {
    const currentPath = `${location.pathname}${location.search}`;
    const activeIndex = flatNavItems.findIndex(
      (item) => currentPath === item.path || location.pathname === item.path,
    );
    if (activeIndex !== -1) {
      const activeNavItem = flatNavItems[activeIndex];
      setActiveItem(activeNavItem.id);
      const activeParent = navItems.find((item) =>
        item.children?.some((child) => child.id === activeNavItem.id),
      );
      if (activeParent) {
        setOpenNavGroups((prev) =>
          prev[activeParent.id] ? prev : { ...prev, [activeParent.id]: true },
        );
      } else {
        setOpenNavGroups((prev) => (Object.keys(prev).length ? {} : prev));
      }
      // Find index in bottom nav items
      const bottomIndex = bottomNavItems.findIndex(
        (item) => item.id === activeNavItem.id,
      );
      if (bottomIndex !== -1) {
        setBottomNavValue(bottomIndex);
      }
    } else {
      setActiveItem("");
    }
  }, [location.pathname, location.search, navItems, flatNavItems, bottomNavItems]);

  const handleLogout = async () => {
    try {
      await logout();
      sessionStorage.setItem("logoutToastMessage", "Logged out successfully");
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const navigateWithPageTransition = useCallback(
    (path) => {
      const prefersReducedMotion =
        typeof window !== "undefined" &&
        window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      const canUseViewTransition =
        typeof document !== "undefined" &&
        typeof document.startViewTransition === "function" &&
        !prefersReducedMotion;

      if (canUseViewTransition) {
        document.startViewTransition(() => navigate(path));
        return;
      }

      navigate(path);
    },
    [navigate],
  );

  const handleNavigation = useCallback(
    (path, id, e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      if (!path) {
        setOpenNavGroups((prev) => ({ ...prev, [id]: !prev[id] }));
        return;
      }
      const nextParent = navItems.find((item) =>
        item.children?.some((child) => child.id === id),
      );
      setOpenNavGroups(nextParent ? { [nextParent.id]: true } : {});
      setActiveItem(id);
      if (mobileMenuOpen) setMobileMenuOpen(false);
      if (onDrawerToggle && mobileOpen) onDrawerToggle();
      navigateWithPageTransition(path);
    },
    [navigateWithPageTransition, navItems, onDrawerToggle, mobileOpen, mobileMenuOpen],
  );

  const handleBottomNavChange = (_event, newValue) => {
    const item = bottomNavItems[newValue];
    if (item) {
      const nextParent = navItems.find((navItem) =>
        navItem.children?.some((child) => child.id === item.id),
      );
      setOpenNavGroups(nextParent ? { [nextParent.id]: true } : {});
      setActiveItem(item.id);
      setBottomNavValue(newValue);
      navigateWithPageTransition(item.path);
    }
  };

  const handleCollapseToggle = () => setIsCollapsed((prev) => !prev);
  const handleOpenMobileMenu = () => setMobileMenuOpen(true);
  const handleCloseMobileMenu = () => setMobileMenuOpen(false);
  const showCollapsedTooltip = (label, event) => {
    if (!isCollapsed) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const railRight =
      typeof window !== "undefined"
        ? Math.max(rect.right, 86)
        : rect.right;
    setCollapsedTooltip({
      label,
      top: rect.top + rect.height / 2,
      left: railRight + 12,
    });
  };
  const hideCollapsedTooltip = () => setCollapsedTooltip(null);

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
            {header && !isCollapsed && user?.role !== "super_admin" && (
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
            {sectionItems.map(({ id, icon: Icon, label, path, children }, index) => {
              const currentPath = `${location.pathname}${location.search}`;
              const childItems = children || [];
              const hasChildren = childItems.length > 0;
              const hasActiveChild = childItems.some(
                (child) =>
                  activeItem === child.id ||
                  currentPath === child.path ||
                  location.pathname === child.path,
              );
              const isActive =
                activeItem === id || currentPath === path || location.pathname === path;
              const isGroupOpen = Boolean(openNavGroups[id]);
              const isGroupActive = hasChildren && hasActiveChild;
              const isRecycleBin = id === "recycle-bin";

              return (
                <Box
                  key={id}
                  sx={{ mb: hasChildren && !isCollapsed ? 0.5 : 0.5 }}
                >
                  <ListItem
                    aria-label={label}
                    tabIndex={0}
                    onMouseEnter={(e) => showCollapsedTooltip(label, e)}
                    onMouseLeave={hideCollapsedTooltip}
                    onFocus={(e) => showCollapsedTooltip(label, e)}
                    onBlur={hideCollapsedTooltip}
                    onClick={(e) => handleNavigation(path, id, e)}
                    sx={{
                      borderRadius: 2,
                      mb: 0.5,
                      py: { md: 1, lg: 1.2 },
                      px: { md: 1.2, lg: 1.5 },
                      cursor: "pointer",
                      animation: `sidebarItemIn 320ms ${index * 35}ms ease both`,
                      backgroundColor:
                        isGroupActive
                          ? ACTIVE_NAV_COLOR
                          : isActive
                            ? ACTIVE_NAV_COLOR
                            : "transparent",
                      color:
                        isGroupActive
                          ? "#ffffff"
                          : isActive
                            ? "#ffffff"
                            : isRecycleBin && !isActive
                              ? theme.palette.text.secondary
                              : theme.palette.text.secondary,
                      "&:hover": {
                        backgroundColor:
                          isGroupActive
                            ? ACTIVE_NAV_COLOR
                            : isActive
                            ? ACTIVE_NAV_COLOR
                            : isRecycleBin && !isActive
                            ? alpha(theme.palette.warning.main, 0.05)
                            : alpha(theme.palette.primary.main, 0.05),
                        color:
                          isGroupActive || isActive
                            ? "#ffffff"
                            : theme.palette.primary.main,
                        transform: isCollapsed ? "scale(1.04)" : "translateX(4px)",
                      },
                      transform:
                        isGroupActive || isActive
                          ? isCollapsed
                            ? "scale(1.03)"
                            : "translateX(2px)"
                          : "translateX(0)",
                      boxShadow:
                        isGroupActive || isActive
                          ? `0 10px 24px ${alpha(ACTIVE_NAV_COLOR, 0.16)}`
                          : "none",
                      animationName:
                        isGroupActive || isActive
                          ? "sidebarItemIn, sidebarActiveGlow"
                          : "sidebarItemIn",
                      animationDuration:
                        isGroupActive || isActive ? "320ms, 2.8s" : "320ms",
                      animationDelay:
                        isGroupActive || isActive ? `${index * 35}ms, 320ms` : `${index * 35}ms`,
                      animationTimingFunction:
                        isGroupActive || isActive ? "ease, ease-in-out" : "ease",
                      animationFillMode: "both",
                      animationIterationCount:
                        isGroupActive || isActive ? "1, infinite" : "1",
                      transition:
                        "background-color 220ms ease, color 220ms ease, transform 220ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 220ms ease",
                      "& .MuiListItemIcon-root": {
                        color: "inherit",
                        minWidth: isCollapsed ? "auto" : { md: 36, lg: 40 },
                        transition:
                          "transform 220ms cubic-bezier(0.22, 1, 0.36, 1), color 220ms ease",
                      },
                      "&:hover .MuiListItemIcon-root": {
                        transform: "scale(1.1)",
                      },
                      "&:hover .collapsed-nav-pill, &:focus-visible .collapsed-nav-pill": {
                        opacity: 1,
                        transform: "translate(0, -50%)",
                      },
                    }}
                  >
                    <ListItemIcon>
                      <Icon sx={{ fontSize: { md: 20, lg: 22, xl: 24 } }} />
                    </ListItemIcon>
                    {!isCollapsed && (
                      <>
                        <ListItemText
                          primary={label}
                          primaryTypographyProps={{
                            fontSize: { md: 13, lg: 14, xl: 15 },
                            fontWeight: isActive || hasActiveChild ? 700 : 500,
                            noWrap: true,
                          }}
                        />
                        {hasChildren && (
                          <KeyboardArrowDownOutlinedIcon
                            sx={{
                              fontSize: 20,
                              transform: isGroupOpen ? "rotate(0deg)" : "rotate(-90deg)",
                              transition: "transform 0.2s ease",
                            }}
                          />
                        )}
                      </>
                    )}
                  </ListItem>
                  {hasChildren && !isCollapsed && (
                    <Box
                      sx={{
                        ml: 0.25,
                        pl: 2.25,
                        pt: isGroupOpen ? 1 : 0,
                        pb: isGroupOpen ? 1.2 : 0,
                        borderLeft: `3px solid ${
                          isGroupOpen ? theme.palette.primary.main : "transparent"
                        }`,
                        borderRadius: "0 0 10px 10px",
                        backgroundColor: isGroupOpen
                          ? alpha(theme.palette.primary.main, 0.04)
                          : "transparent",
                        maxHeight: isGroupOpen ? 180 : 0,
                        opacity: isGroupOpen ? 1 : 0,
                        overflow: "hidden",
                        pointerEvents: isGroupOpen ? "auto" : "none",
                        transform: isGroupOpen ? "translateY(0)" : "translateY(-6px)",
                        transition:
                          "max-height 240ms ease, opacity 180ms ease, padding 240ms ease, transform 240ms ease, background-color 180ms ease, border-color 180ms ease",
                      }}
                    >
                      {childItems.map((child, childIndex) => {
                        const ChildIcon = child.icon;
                        const childActive =
                          activeItem === child.id ||
                          currentPath === child.path ||
                          location.pathname === child.path;

                        return (
                          <ListItem
                            key={child.id}
                            onClick={(e) => handleNavigation(child.path, child.id, e)}
                            sx={{
                              minHeight: 34,
                              py: 0.65,
                              px: 1,
                              borderRadius: 1.5,
                              cursor: "pointer",
                              animation: isGroupOpen
                                ? `sidebarItemIn 260ms ${childIndex * 35}ms ease both`
                                : "none",
                              bgcolor: childActive ? ACTIVE_NAV_COLOR : "transparent",
                              color: childActive ? "#ffffff" : theme.palette.text.secondary,
                              transition:
                                "background-color 220ms ease, color 220ms ease, transform 200ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 200ms ease",
                              transform: childActive ? "translateX(2px)" : "translateX(0)",
                              boxShadow: childActive
                                ? `0 8px 20px ${alpha(ACTIVE_NAV_COLOR, 0.14)}`
                                : "none",
                              "&:hover": {
                                backgroundColor: childActive
                                  ? ACTIVE_NAV_COLOR
                                  : alpha(theme.palette.primary.main, 0.07),
                                color: childActive ? "#ffffff" : theme.palette.primary.main,
                                transform: "translateX(3px)",
                              },
                              "& svg": {
                                transition:
                                  "transform 200ms cubic-bezier(0.22, 1, 0.36, 1)",
                              },
                              "&:hover svg": {
                                transform: "scale(1.08)",
                              },
                            }}
                          >
                            {ChildIcon ? (
                              <ChildIcon
                                sx={{
                                  fontSize: 18,
                                  mr: 1.4,
                                  color: "inherit",
                                  flexShrink: 0,
                                }}
                              />
                            ) : (
                              <Box
                                sx={{
                                  width: 5,
                                  height: 5,
                                  borderRadius: "50%",
                                  mr: 1.6,
                                  bgcolor: childActive
                                  ? theme.palette.primary.main
                                  : alpha(theme.palette.primary.main, 0.75),
                                  flexShrink: 0,
                                }}
                              />
                            )}
                            <ListItemText
                              primary={child.label}
                              primaryTypographyProps={{
                                fontSize: { md: 12.5, lg: 13.5 },
                                fontWeight: childActive ? 700 : 500,
                                noWrap: true,
                              }}
                            />
                          </ListItem>
                        );
                      })}
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>
        );
      });
    }

    // Simple list without grouping (for mobile)
    return itemsList.map(({ id, icon: Icon, label, path, children }) => {
      const currentPath = `${location.pathname}${location.search}`;
      const childItems = children || [];
      const hasChildren = childItems.length > 0;
      const hasActiveChild = childItems.some(
        (child) =>
          activeItem === child.id ||
          currentPath === child.path ||
          location.pathname === child.path,
      );
      const isActive =
        activeItem === id || currentPath === path || location.pathname === path;
      const isGroupOpen = Boolean(openNavGroups[id]);
      const isGroupActive = hasChildren && hasActiveChild;
      const isRecycleBin = id === "recycle-bin";

      return (
        <Box key={id}>
          <MobileNavItem
            active={isActive || hasActiveChild}
            onClick={(e) => handleNavigation(path, id, e)}
            sx={{
              backgroundColor:
                isGroupActive
                  ? ACTIVE_NAV_COLOR
                  : isActive
                    ? ACTIVE_NAV_COLOR
                  : isRecycleBin && !isActive
                    ? alpha(theme.palette.warning.main, 0.03)
                    : undefined,
              color:
                isGroupActive
                  ? "#ffffff"
                  : isActive
                  ? "#ffffff"
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
                fontWeight: isActive || hasActiveChild ? 700 : 500,
              }}
            />
            {hasChildren && (
              <KeyboardArrowDownOutlinedIcon
                sx={{
                  fontSize: 20,
                  transform: isGroupOpen ? "rotate(0deg)" : "rotate(-90deg)",
                  transition: "transform 0.2s ease",
                }}
              />
            )}
          </MobileNavItem>
          {hasChildren && (
            <Box
              sx={{
                ml: 2,
                pl: 2,
                mb: isGroupOpen ? 1 : 0,
                borderLeft: `3px solid ${
                  isGroupOpen ? theme.palette.primary.main : "transparent"
                }`,
                maxHeight: isGroupOpen ? 180 : 0,
                opacity: isGroupOpen ? 1 : 0,
                overflow: "hidden",
                pointerEvents: isGroupOpen ? "auto" : "none",
                transform: isGroupOpen ? "translateY(0)" : "translateY(-6px)",
                transition:
                  "max-height 240ms ease, opacity 180ms ease, margin 240ms ease, transform 240ms ease, border-color 180ms ease",
              }}
            >
              {childItems.map((child) => {
                const ChildIcon = child.icon;
                const childActive =
                  activeItem === child.id ||
                  currentPath === child.path ||
                  location.pathname === child.path;

                return (
                  <MobileNavItem
                    key={child.id}
                    active={childActive}
                    onClick={(e) => handleNavigation(child.path, child.id, e)}
                    sx={{
                      py: 0.8,
                      bgcolor: childActive ? ACTIVE_NAV_COLOR : "transparent",
                      color: childActive ? "#ffffff" : undefined,
                      transition:
                        "background-color 220ms ease, color 220ms ease, transform 180ms ease",
                      "&:hover": {
                        bgcolor: childActive
                          ? ACTIVE_NAV_COLOR
                          : alpha(theme.palette.primary.main, 0.07),
                      },
                    }}
                  >
                    {ChildIcon ? (
                      <ChildIcon
                        sx={{
                          fontSize: 18,
                          mr: 1.4,
                          color: "inherit",
                          flexShrink: 0,
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          width: 5,
                          height: 5,
                          borderRadius: "50%",
                          mr: 1.5,
                          bgcolor: theme.palette.primary.main,
                          flexShrink: 0,
                        }}
                      />
                    )}
                    <ListItemText
                      primary={child.label}
                      primaryTypographyProps={{
                        fontSize: { xs: 13, sm: 14 },
                        fontWeight: childActive ? 700 : 500,
                      }}
                    />
                  </MobileNavItem>
                );
              })}
            </Box>
          )}
        </Box>
      );
    });
  };

  // Desktop Sidebar Content
  const isDarkMode = theme.palette.mode === "dark";
  const sidebarBackground = isDarkMode
    ? "linear-gradient(180deg, #07111f 0%, #0a1626 100%)"
    : "#ffffff";

  const desktopSidebarContent = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: sidebarBackground,
        borderRight: `1px solid ${isDarkMode ? "rgba(148, 163, 184, 0.18)" : alpha(theme.palette.divider, 0.08)}`,
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
          // borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          justifyContent: isCollapsed ? "center" : "flex-start",
          position: "relative",
        }}
      >
        <Zoom in={true} timeout={300}>
          <Box
            sx={{
              width: { md: 36, lg: 40, xl: 44 },
              height: { md: 36, lg: 40, xl: 44 },
              borderRadius: { md: "10px", lg: "12px", xl: "14px" },
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              bgcolor: isDarkMode ? "rgba(255, 255, 255, 0.08)" : "#fff",
              border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
              boxShadow: `0 6px 12px ${alpha(theme.palette.primary.main, 0.12)}`,
              flexShrink: 0,
            }}
          >
            <Box
              component="img"
              src={PROJECT_LOGO_URL}
              alt="AssetMach logo"
              sx={{ width: "100%", height: "100%", objectFit: "contain" }}
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
              bgcolor: isDarkMode ? "#0d1a2b" : "#fff",
              boxShadow: 1,
              border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              width: { md: 22, lg: 24 },
              height: { md: 22, lg: 24 },
              "&:hover": { bgcolor: isDarkMode ? "#122238" : "#f5f5f5" },
              display: { xs: "none", md: "flex" },
              transition:
                "background-color 180ms ease, box-shadow 180ms ease, transform 220ms cubic-bezier(0.22, 1, 0.36, 1)",
              "& svg": {
                transition: "transform 220ms cubic-bezier(0.22, 1, 0.36, 1)",
              },
              "&:hover svg": {
                transform: isCollapsed ? "translateX(2px)" : "translateX(-2px)",
              },
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
          overflowY: isCollapsed ? "visible" : "auto",
          overflowX: "visible",
          "&::-webkit-scrollbar": {
            width: "4px",
          },
          "&::-webkit-scrollbar-track": {
            background: isDarkMode ? "rgba(148, 163, 184, 0.08)" : "#f1f1f1",
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-thumb": {
            background: isDarkMode ? "rgba(148, 163, 184, 0.35)" : "#c1c1c1",
            borderRadius: "4px",
            "&:hover": {
              background: isDarkMode ? "rgba(148, 163, 184, 0.5)" : "#a1a1a1",
            },
          },
        }}
      >
        {renderNavItems(navItems, true)}
      </List>

      {/* User Profile Section */}
      {isCollapsed ? (
        <Box
          sx={{
            p: { md: 1.5, lg: 2 },
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
            display: "flex",
            justifyContent: "center",
            position: "relative",
            overflow: "visible",
            "&:hover .collapsed-profile-pill, &:focus-within .collapsed-profile-pill": {
              opacity: 1,
              transform: "translate(0, -50%)",
            },
          }}
        >
          <Avatar
            src={avatarUrl || undefined}
            aria-label={getUserDisplayName(user)}
            tabIndex={0}
            onMouseEnter={(e) => showCollapsedTooltip(getUserDisplayName(user), e)}
            onMouseLeave={hideCollapsedTooltip}
            onFocus={(e) => showCollapsedTooltip(getUserDisplayName(user), e)}
            onBlur={hideCollapsedTooltip}
            sx={{
              width: { md: 34, lg: 38 },
              height: { md: 34, lg: 38 },
              bgcolor: theme.palette.primary.main,
              fontSize: { md: 12, lg: 14 },
              cursor: "default",
              transition:
                "transform 220ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 220ms ease",
              "&:hover, &:focus-visible": {
                transform: "scale(1.08)",
                boxShadow: `0 10px 24px ${alpha(theme.palette.primary.main, 0.24)}`,
                outline: "none",
              },
            }}
          >
            {getUserInitials(user)}
          </Avatar>
        </Box>
      ) : (
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
          <Button
            onClick={handleLogout}
            startIcon={!isCollapsed ? <LogoutOutlinedIcon /> : null}
            onMouseEnter={(e) => showCollapsedTooltip("Logout", e)}
            onMouseLeave={hideCollapsedTooltip}
            onFocus={(e) => showCollapsedTooltip("Logout", e)}
            onBlur={hideCollapsedTooltip}
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
                color: isCollapsed ? ACTIVE_NAV_COLOR : theme.palette.error.main,
                backgroundColor: isCollapsed
                  ? alpha(ACTIVE_NAV_COLOR, 0.1)
                  : alpha(theme.palette.error.main, 0.08),
              },
            }}
          >
            {!isCollapsed ? (
              "Logout"
            ) : (
              <LogoutOutlinedIcon sx={{ fontSize: { md: 18, lg: 20 } }} />
            )}
          </Button>
      </Box>
    </Box>
  );

  // Mobile Drawer Content - Optimized for touch
  const mobileMenuContent = (
    <Box
      sx={{
        height: "100%",
        bgcolor: isDarkMode ? "#07111f" : "#fff",
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
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              bgcolor: "#fff",
              border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
            }}
          >
            <Box
              component="img"
              src={PROJECT_LOGO_URL}
              alt="AssetMach logo"
              sx={{ width: "100%", height: "100%", objectFit: "contain" }}
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
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  bgcolor: "#fff",
                  border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                }}
              >
                <Box
                  component="img"
                  src={PROJECT_LOGO_URL}
                  alt="AssetMach logo"
                  sx={{ width: "100%", height: "100%", objectFit: "contain" }}
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

  const collapsedTooltipNode = isCollapsed && collapsedTooltip && (
    <Portal>
        <Box
          sx={{
            position: "fixed",
            left: collapsedTooltip.left,
            top: collapsedTooltip.top,
            transform: "translateY(-50%)",
            zIndex: 2147483647,
            pointerEvents: "none",
            display: "flex",
            alignItems: "center",
            animation: "sidebarTooltipIn 160ms cubic-bezier(0.22, 1, 0.36, 1) both",
            "@keyframes sidebarTooltipIn": {
              from: { opacity: 0, transform: "translate(-6px, -50%)" },
              to: { opacity: 1, transform: "translate(0, -50%)" },
            },
          }}
        >
          <Box
            sx={{
              width: 12,
              height: 12,
              bgcolor: ACTIVE_NAV_COLOR,
              transform: "rotate(45deg)",
              mr: "-6px",
              boxShadow: "0 8px 18px rgba(15, 23, 42, 0.16)",
            }}
          />
          <Box
            sx={{
              bgcolor: ACTIVE_NAV_COLOR,
              color: "#ffffff",
              fontSize: 14,
              fontWeight: 700,
              lineHeight: 1,
              whiteSpace: "nowrap",
              px: 1.75,
              py: 1.1,
              borderRadius: 1.5,
              boxShadow: "0 12px 28px rgba(15, 23, 42, 0.24)",
            }}
          >
            {collapsedTooltip.label}
          </Box>
        </Box>
    </Portal>
  );

  // Desktop Layout
  return (
    <>
      <DesktopSidebar iscollapsed={isCollapsed.toString()}>
        {desktopSidebarContent}
      </DesktopSidebar>
      {collapsedTooltipNode}
    </>
  );
}

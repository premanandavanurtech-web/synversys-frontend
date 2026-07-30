// src/pages/RolesManagement.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  Alert,
  Snackbar,
  CircularProgress,
  Tooltip,
  Stack,
  Pagination,
  InputAdornment,
  TextField as SearchField,
  Menu,
  MenuItem,
  Checkbox,
  TableSortLabel,
  Tabs,
  Tab,
  useMediaQuery,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Security as SecurityIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  FileDownload as ExportIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  ArrowBack as ArrowBackIcon, // Added back icon
  Close as CloseIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom"; // Added for navigation
import { useRoles } from "../context/RoleContext";
import { useAuth } from "../context/AuthContexts";

const RolesManagement = () => {
  const navigate = useNavigate(); // Added for navigation
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { user } = useAuth();
  const {
    roles,
    loading,
    error,
    pagination,
    fetchRoles,
    createRole,
    updateRole,
    deleteRole,
    toggleRoleStatus,
    exportRoles,
    clearError,
    bulkDeleteRoles,
  } = useRoles();

  const [openDialog, setOpenDialog] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isActive: true,
  });
  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [orderBy, setOrderBy] = useState("createdAt");
  const [order, setOrder] = useState("desc");
  const [activeTab, setActiveTab] = useState(0);
  const [viewDialog, setViewDialog] = useState(false);
  const [viewingRole, setViewingRole] = useState(null);

  const isEditable = user?.role === "super_admin" || user?.role === "admin";
  const primaryColor = "#0d4f63";

  useEffect(() => {
    fetchRoles({ page: 1, limit: 10 });
  }, []);

  useEffect(() => {
    if (searchTimeout) clearTimeout(searchTimeout);
    const timeout = setTimeout(() => {
      fetchRoles({ search: searchTerm, page: 1, limit: pagination.limit });
    }, 500);
    setSearchTimeout(timeout);
    return () => clearTimeout(timeout);
  }, [searchTerm]);

  const showSnackbar = (message, severity = "success") => {
    setSnack({ open: true, message, severity });
  };

  const handleGoBack = () => {
    navigate(-1); // Navigate back to previous page
  };

  const handleOpenDialog = (role = null) => {
    if (role) {
      setEditingRole(role);
      setFormData({
        name: role.name,
        description: role.description || "",
        isActive: role.isActive,
      });
    } else {
      setEditingRole(null);
      setFormData({ name: "", description: "", isActive: true });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingRole(null);
    setFormData({ name: "", description: "", isActive: true });
  };

  const handleViewRole = (role) => {
    setViewingRole(role);
    setViewDialog(true);
  };

  const handleSave = async () => {
    // Validate role name format
    if (!formData.name.match(/^[a-z_]+$/)) {
      showSnackbar(
        "Role name must be lowercase with underscores only (e.g., sales_manager)",
        "error",
      );
      return;
    }

    try {
      let result;
      if (editingRole) {
        result = await updateRole(editingRole._id, formData);
        if (result?.success === false) {
          throw new Error(result.error || "Failed to update role");
        }
        showSnackbar("Role updated successfully", "success");
      } else {
        result = await createRole(formData);
        if (result?.success === false) {
          throw new Error(result.error || "Failed to create role");
        }
        showSnackbar("Role created successfully", "success");
      }
      handleCloseDialog();
      // Reset form to empty after successful creation
      setFormData({ name: "", description: "", isActive: true });
    } catch (err) {
      showSnackbar(err.message || "Failed to save role", "error");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this role?")) {
      try {
        const result = await deleteRole(id);
        if (result?.success === false) {
          throw new Error(result.error || "Failed to delete role");
        }
        showSnackbar("Role deleted successfully", "success");
      } catch (err) {
        showSnackbar(err.message || "Failed to delete role", "error");
      }
    }
  };

  const handleToggleStatus = async (role) => {
    try {
      await toggleRoleStatus(role._id, role.isActive);
      showSnackbar(
        `Role ${role.isActive ? "deactivated" : "activated"} successfully`,
        "success",
      );
    } catch (err) {
      showSnackbar(err.message || "Failed to update role status", "error");
    }
  };

  const handleExport = async () => {
    try {
      const result = await exportRoles("csv");
      if (result?.data) {
        const blob = new Blob([result.data], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `roles_export_${new Date().toISOString()}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        showSnackbar("Roles exported successfully", "success");
      } else if (result?.roles) {
        // Handle JSON export
        const blob = new Blob([JSON.stringify(result.roles, null, 2)], {
          type: "application/json",
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `roles_export_${new Date().toISOString()}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
        showSnackbar("Roles exported successfully", "success");
      }
    } catch (err) {
      showSnackbar("Failed to export roles", "error");
    }
  };

  const handleRefresh = () => {
    fetchRoles({
      search: searchTerm,
      page: pagination.page,
      limit: pagination.limit,
    });
    showSnackbar("Roles refreshed", "info");
  };

  const handleMenuOpen = (event, role) => {
    setAnchorEl(event.currentTarget);
    setSelectedRole(role);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRole(null);
  };

  const handleSelectAll = (event) => {
    const filteredRoleIds = filteredRoles.map((role) => role._id);
    if (event.target.checked) {
      setSelectedRoles(filteredRoleIds);
    } else {
      setSelectedRoles([]);
    }
  };

  const handleSelectRole = (roleId) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId],
    );
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Delete ${selectedRoles.length} selected role(s)?`)) {
      try {
        await bulkDeleteRoles(selectedRoles);
        setSelectedRoles([]);
        showSnackbar(
          `${selectedRoles.length} role(s) deleted successfully`,
          "success",
        );
      } catch (err) {
        showSnackbar("Failed to delete selected roles", "error");
      }
    }
  };

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleStatCardClick = (tabIndex) => {
    setActiveTab(tabIndex);
    setSelectedRoles([]);
  };

  const sortedRoles = [...roles].sort((a, b) => {
    if (order === "asc") {
      return a[orderBy]?.toString().localeCompare(b[orderBy]?.toString());
    }
    return b[orderBy]?.toString().localeCompare(a[orderBy]?.toString());
  });

  const filteredRoles =
    activeTab === 0
      ? sortedRoles
      : sortedRoles.filter((role) => role.isActive === (activeTab === 1));

  const stats = {
    total: pagination.total || roles.length,
    active: roles.filter((r) => r.isActive).length,
    inactive: roles.filter((r) => !r.isActive).length,
  };

  if (loading && roles.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "60vh",
        }}
      >
        <CircularProgress sx={{ color: primaryColor }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, minHeight: "100vh", maxWidth: "100%", overflowX: "hidden" }}>
      {/* Header with Back Button */}
      <Box sx={{ mb: { xs: 3, sm: 4 }, display: "flex", alignItems: "center", gap: { xs: 1.25, sm: 2 } }}>
        {/* Back Button */}
        <Tooltip title="Go Back" arrow>
          <IconButton
            onClick={handleGoBack}
            sx={{
              width: { xs: 34, sm: 40 },
              height: { xs: 34, sm: 40 },
              borderRadius: "10px",
              bgcolor: isDark ? "rgba(103, 232, 249, 0.12)" : "#f5f5f5",
              color: isDark ? "#67e8f9" : primaryColor,
              border: `1px solid ${
                isDark ? "rgba(103, 232, 249, 0.22)" : "transparent"
              }`,
              "&:hover": {
                bgcolor: isDark ? "rgba(103, 232, 249, 0.18)" : "#e0e0e0",
              },
            }}
          >
            <ArrowBackIcon />
          </IconButton>
        </Tooltip>
        <Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: primaryColor,
              mb: 0.5,
              display: "flex",
              alignItems: "center",
              gap: 1,
              fontSize: { xs: "1.35rem", sm: "1.5rem" },
            }}
          >
            <SecurityIcon sx={{ fontSize: { xs: 24, sm: 28 } }} />
            Roles Management
          </Typography>
          <Typography variant="body2" sx={{ color: "#666", fontSize: { xs: "0.8rem", sm: "0.875rem" } }}>
            Manage user roles and permissions for your organization
          </Typography>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", sm: "repeat(3, minmax(0, 1fr))" },
          gap: { xs: 1.5, sm: 3 },
          mb: 3,
        }}
      >
        <Paper
          role="button"
          tabIndex={0}
          onClick={() => handleStatCardClick(0)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleStatCardClick(0);
            }
          }}
          sx={{
            p: 2,
            minWidth: 0,
            width: "100%",
            borderLeft: `4px solid ${primaryColor}`,
            cursor: "pointer",
            boxShadow: activeTab === 0 ? "0 8px 20px rgba(13,79,99,0.16)" : undefined,
            outline: activeTab === 0 ? `2px solid rgba(13,79,99,0.18)` : "none",
            transition: "all 0.2s ease",
            "&:hover": { transform: "translateY(-2px)", boxShadow: "0 8px 20px rgba(13,79,99,0.16)" },
            "&:focus-visible": { outline: `2px solid ${primaryColor}` },
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: "#666",
              textTransform: "uppercase",
              letterSpacing: 0.5,
              fontWeight: 700,
            }}
          >
            Total Roles
          </Typography>
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, color: primaryColor }}
          >
            {stats.total}
          </Typography>
        </Paper>
        <Paper
          role="button"
          tabIndex={0}
          onClick={() => handleStatCardClick(1)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleStatCardClick(1);
            }
          }}
          sx={{
            p: 2,
            minWidth: 0,
            width: "100%",
            borderLeft: "4px solid #4caf50",
            cursor: "pointer",
            boxShadow: activeTab === 1 ? "0 8px 20px rgba(76,175,80,0.16)" : undefined,
            outline: activeTab === 1 ? "2px solid rgba(76,175,80,0.18)" : "none",
            transition: "all 0.2s ease",
            "&:hover": { transform: "translateY(-2px)", boxShadow: "0 8px 20px rgba(76,175,80,0.16)" },
            "&:focus-visible": { outline: "2px solid #4caf50" },
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: "#666",
              textTransform: "uppercase",
              letterSpacing: 0.5,
              fontWeight: 700,
            }}
          >
            Active
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#4caf50" }}>
            {stats.active}
          </Typography>
        </Paper>
        <Paper
          role="button"
          tabIndex={0}
          onClick={() => handleStatCardClick(2)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleStatCardClick(2);
            }
          }}
          sx={{
            p: 2,
            minWidth: 0,
            width: "100%",
            gridColumn: { xs: "1 / -1", sm: "auto" },
            borderLeft: "4px solid #f44336",
            cursor: "pointer",
            boxShadow: activeTab === 2 ? "0 8px 20px rgba(244,67,54,0.16)" : undefined,
            outline: activeTab === 2 ? "2px solid rgba(244,67,54,0.18)" : "none",
            transition: "all 0.2s ease",
            "&:hover": { transform: "translateY(-2px)", boxShadow: "0 8px 20px rgba(244,67,54,0.16)" },
            "&:focus-visible": { outline: "2px solid #f44336" },
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: "#666",
              textTransform: "uppercase",
              letterSpacing: 0.5,
              fontWeight: 700,
            }}
          >
            Inactive
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#f44336" }}>
            {stats.inactive}
          </Typography>
        </Paper>
      </Box>

      {/* Main Card */}
      <Paper sx={{ borderRadius: 2, overflow: "hidden", maxWidth: "100%" }}>
        {/* Toolbar */}
        <Box
          sx={{
            p: { xs: 1.25, sm: 2 },
            borderBottom: 1,
            borderColor: "#e0e0e0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(e, v) => setActiveTab(v)}
            variant={isMobile ? "fullWidth" : "standard"}
            sx={{ minHeight: 36, width: { xs: "100%", sm: "auto" } }}
          >
            <Tab label="All" sx={{ textTransform: "none", minHeight: 36 }} />
            <Tab label="Active" sx={{ textTransform: "none", minHeight: 36 }} />
            <Tab
              label="Inactive"
              sx={{ textTransform: "none", minHeight: 36 }}
            />
          </Tabs>

          <Box sx={{ display: "flex", gap: 1, alignItems: "center", width: { xs: "100%", sm: "auto" }, flexWrap: "wrap" }}>
            <SearchField
              placeholder="Search roles..."
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ width: { xs: "100%", sm: 250 }, flex: { xs: "1 1 100%", sm: "0 0 auto" } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" sx={{ color: "#999" }} />
                  </InputAdornment>
                ),
                sx: { bgcolor: "#fafafa" },
              }}
            />
            <Tooltip title="Export">
              <IconButton onClick={handleExport} size="small">
                <ExportIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Refresh">
              <IconButton onClick={handleRefresh} size="small">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            {isEditable && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
                sx={{
                  bgcolor: primaryColor,
                  "&:hover": { bgcolor: "#0a3640" },
                  textTransform: "none",
                }}
                size="small"
              >
                Add Role
              </Button>
            )}
          </Box>
        </Box>

        {/* Bulk Actions Bar */}
        {selectedRoles.length > 0 && (
          <Box
            sx={{
              p: 1.5,
              bgcolor: isDark ? alpha("#4ade80", 0.12) : "#e8f5e9",
              border: `1px solid ${
                isDark ? alpha("#4ade80", 0.24) : "transparent"
              }`,
              borderBottom: 1,
              borderBottomColor: isDark
                ? "rgba(148, 163, 184, 0.18)"
                : "#e0e0e0",
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Typography
              variant="body2"
              sx={{ color: isDark ? "#bbf7d0" : primaryColor, fontWeight: 600 }}
            >
              {selectedRoles.length} selected
            </Typography>
            <Button
              size="small"
              color="error"
              onClick={handleBulkDelete}
              variant="outlined"
              sx={{
                textTransform: "none",
                borderColor: isDark ? alpha("#f87171", 0.5) : undefined,
                color: isDark ? "#f87171" : undefined,
                "&:hover": {
                  borderColor: isDark ? "#f87171" : undefined,
                  bgcolor: isDark ? alpha("#f87171", 0.08) : undefined,
                },
              }}
            >
              Delete Selected
            </Button>
          </Box>
        )}

        {/* Mobile Cards */}
        {isMobile && (
          <Box sx={{ p: 1.25, display: "grid", gap: 1.25 }}>
            {filteredRoles.map((role) => (
              <Paper
                key={role._id}
                elevation={0}
                sx={{
                  p: 1.5,
                  border: "1px solid #e0e0e0",
                  borderRadius: "12px",
                  bgcolor: "#fff",
                }}
              >
                <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={1}>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.75 }}>
                      <Checkbox
                        checked={selectedRoles.includes(role._id)}
                        onChange={() => handleSelectRole(role._id)}
                        size="small"
                        sx={{ p: 0.25 }}
                      />
                      <Typography
                        fontWeight={700}
                        sx={{ color: primaryColor, fontSize: "0.9rem", wordBreak: "break-word" }}
                      >
                        {role.displayName || role.name}
                      </Typography>
                    </Stack>
                    <Stack spacing={0.8}>
                      <Box>
                        <Typography sx={{ color: "#999", fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase" }}>
                          Description
                        </Typography>
                        <Typography
                          sx={{
                            color: "#666",
                            fontSize: "0.78rem",
                            wordBreak: "break-word",
                          }}
                        >
                          {role.description || "No description"}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography sx={{ color: "#999", fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", mb: 0.5 }}>
                          Status
                        </Typography>
                        <Chip
                          label={role.isActive ? "Active" : "Inactive"}
                          size="small"
                          sx={{
                            bgcolor: role.isActive ? "#e8f5e9" : "#eeeeee",
                            color: role.isActive ? "#2e7d32" : "#757575",
                            fontSize: "11px",
                            height: 24,
                            borderRadius: "999px",
                          }}
                        />
                      </Box>
                    </Stack>
                  </Box>
                  <IconButton size="small" onClick={(e) => handleMenuOpen(e, role)}>
                    <MoreVertIcon fontSize="small" sx={{ color: "#666" }} />
                  </IconButton>
                </Stack>
              </Paper>
            ))}
            {filteredRoles.length === 0 && (
              <Box sx={{ py: 5, textAlign: "center" }}>
                <Typography variant="body2" sx={{ color: "#999" }}>
                  No roles found
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {/* Table */}
        {!isMobile && (
        <TableContainer sx={{ overflowX: "auto" }}>
          <Table size="small" sx={{ minWidth: { xs: 560, sm: 720 } }}>
            <TableHead>
              <TableRow sx={{ bgcolor: "#fafafa" }}>
                <TableCell padding="checkbox" sx={{ width: 40 }}>
                  <Checkbox
                    checked={
                      selectedRoles.length === filteredRoles.length &&
                      filteredRoles.length > 0
                    }
                    indeterminate={
                      selectedRoles.length > 0 &&
                      selectedRoles.length < filteredRoles.length
                    }
                    onChange={handleSelectAll}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === "name"}
                    direction={orderBy === "name" ? order : "asc"}
                    onClick={() => handleSort("name")}
                  >
                    Role
                  </TableSortLabel>
                </TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRoles.map((role) => (
                <TableRow
                  key={role._id}
                  hover
                  sx={{ "&:hover": { bgcolor: "#f9f9f9" } }}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedRoles.includes(role._id)}
                      onChange={() => handleSelectRole(role._id)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      fontWeight={500}
                      sx={{ color: primaryColor }}
                    >
                      {role.displayName || role.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{ color: "#666", maxWidth: 300 }}
                    >
                      {role.description || "—"}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={role.isActive ? "Active" : "Inactive"}
                      size="small"
                      sx={{
                        bgcolor: role.isActive ? "#e8f5e9" : "#eeeeee",
                        color: role.isActive ? "#2e7d32" : "#757575",
                        fontSize: "11px",
                        height: 24,
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Actions">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, role)}
                      >
                        <MoreVertIcon
                          fontSize="small"
                          sx={{ color: "#666" }}
                        />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {filteredRoles.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <Typography variant="body2" sx={{ color: "#999" }}>
                      No roles found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              p: 2,
              borderTop: 1,
              borderColor: "#e0e0e0",
            }}
          >
            <Pagination
              count={pagination.pages}
              page={pagination.page}
              onChange={(e, page) =>
                fetchRoles({
                  page,
                  search: searchTerm,
                  limit: pagination.limit,
                })
              }
              size="small"
              sx={{
                "& .MuiPaginationItem-root.Mui-selected": {
                  bgcolor: primaryColor,
                  color: "white",
                  "&:hover": { bgcolor: "#0a3640" },
                },
              }}
            />
          </Box>
        )}
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        sx={{
          "& .MuiDialog-container": {
            alignItems: { xs: "flex-end", sm: "center" },
          },
        }}
        PaperProps={{
          sx: {
            m: { xs: 0, sm: 2 },
            width: { xs: "100%", sm: "calc(100% - 64px)" },
            height: { xs: "100dvh", sm: "auto" },
            maxHeight: { xs: "100dvh", sm: "90vh" },
            borderRadius: { xs: 0, sm: 2 },
            display: "flex",
            flexDirection: "column",
          },
        }}
      >
        <DialogTitle sx={{ color: primaryColor, fontWeight: 600, pb: 1, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span>{editingRole ? "Edit Role" : "New Role"}</span>
          {isMobile && (
            <IconButton size="small" onClick={handleCloseDialog}>
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
        </DialogTitle>
        <DialogContent sx={{ flex: 1, overflowY: "auto" }}>
          <TextField
            fullWidth
            label="Role Name"
            value={formData.name}
            onChange={(e) => {
              const value = e.target.value.toLowerCase().replace(/\s+/g, "_");
              setFormData({ ...formData, name: value });
            }}
            margin="normal"
            required
            size="small"
            placeholder="e.g., sales_manager"
            helperText="Use lowercase and underscores only (e.g., sales_manager)"
            error={formData.name && !formData.name.match(/^[a-z_]+$/)}
          />
          <TextField
            fullWidth
            label="Description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            margin="normal"
            multiline
            rows={2}
            size="small"
            placeholder="Brief description of this role"
          />
          <FormControlLabel
            control={
              <Switch
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                size="small"
                sx={{
                  "& .MuiSwitch-thumb": {
                    bgcolor: formData.isActive ? primaryColor : undefined,
                  },
                }}
              />
            }
            label="Active"
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: { xs: "calc(16px + env(safe-area-inset-bottom))", sm: 2 }, gap: 1 }}>
          <Button
            onClick={handleCloseDialog}
            sx={{ textTransform: "none", color: "#666" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={!formData.name || !formData.name.match(/^[a-z_]+$/)}
            sx={{
              bgcolor: primaryColor,
              "&:hover": { bgcolor: "#0a3640" },
              textTransform: "none",
            }}
          >
            {editingRole ? "Save Changes" : "Create Role"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog
        open={viewDialog}
        onClose={() => setViewDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ color: primaryColor, fontWeight: 600, pb: 0 }}>
          Role Details
        </DialogTitle>
        <DialogContent>
          {viewingRole && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Box>
                <Typography
                  variant="caption"
                  sx={{ color: "#999", textTransform: "uppercase" }}
                >
                  Role Name
                </Typography>
                <Typography
                  variant="body1"
                  fontWeight={500}
                  sx={{ color: primaryColor }}
                >
                  {viewingRole.displayName || viewingRole.name}
                </Typography>
              </Box>
              <Box>
                <Typography
                  variant="caption"
                  sx={{ color: "#999", textTransform: "uppercase" }}
                >
                  Description
                </Typography>
                <Typography variant="body2" sx={{ color: "#666" }}>
                  {viewingRole.description || "No description provided"}
                </Typography>
              </Box>
              <Box>
                <Typography
                  variant="caption"
                  sx={{ color: "#999", textTransform: "uppercase" }}
                >
                  Status
                </Typography>
                <Chip
                  label={viewingRole.isActive ? "Active" : "Inactive"}
                  size="small"
                  sx={{
                    mt: 0.5,
                    bgcolor: viewingRole.isActive ? "#e8f5e9" : "#eeeeee",
                    color: viewingRole.isActive ? "#2e7d32" : "#757575",
                  }}
                />
              </Box>
              <Box>
                <Typography
                  variant="caption"
                  sx={{ color: "#999", textTransform: "uppercase" }}
                >
                  Member Count
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {viewingRole.memberCount || 0}
                </Typography>
              </Box>
              <Box>
                <Typography
                  variant="caption"
                  sx={{ color: "#999", textTransform: "uppercase" }}
                >
                  Created At
                </Typography>
                <Typography variant="body2">
                  {new Date(viewingRole.createdAt).toLocaleString()}
                </Typography>
              </Box>
              <Box>
                <Typography
                  variant="caption"
                  sx={{ color: "#999", textTransform: "uppercase" }}
                >
                  Last Updated
                </Typography>
                <Typography variant="body2">
                  {new Date(viewingRole.updatedAt).toLocaleString()}
                </Typography>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setViewDialog(false)}
            sx={{ textTransform: "none", color: primaryColor }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Menu — single source of truth for row actions now */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => {
            handleViewRole(selectedRole);
            handleMenuClose();
          }}
        >
          <ViewIcon fontSize="small" sx={{ mr: 1.25, color: "#666" }} />
          View Details
        </MenuItem>
        {isEditable && [
          <MenuItem
            key="toggle"
            onClick={() => {
              handleToggleStatus(selectedRole);
              handleMenuClose();
            }}
          >
            {selectedRole?.isActive ? "Deactivate" : "Activate"}
          </MenuItem>,
          <MenuItem
            key="edit"
            onClick={() => {
              handleOpenDialog(selectedRole);
              handleMenuClose();
            }}
          >
            <EditIcon fontSize="small" sx={{ mr: 1.25, color: "#666" }} />
            Edit
          </MenuItem>,
          <MenuItem
            key="delete"
            onClick={() => {
              handleDelete(selectedRole?._id);
              handleMenuClose();
            }}
            sx={{ color: "#f44336" }}
          >
            <DeleteIcon fontSize="small" sx={{ mr: 1.25, color: "#f44336" }} />
            Delete
          </MenuItem>,
        ]}
      </Menu>

      {/* Snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack({ ...snack, open: false })}
  anchorOrigin={{ vertical: "top", horizontal: "right" }}>
        <Alert
          severity={snack.severity}
          onClose={() => setSnack({ ...snack, open: false })}
          sx={{ borderRadius: 2 }}
        >
          {snack.message}
        </Alert>
      </Snackbar>

      {/* Error Alert */}
      {error && (
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={clearError}
  anchorOrigin={{ vertical: "top", horizontal: "right" }}>
          <Alert severity="error" onClose={clearError} sx={{ borderRadius: 2 }}>
            {error}
          </Alert>
        </Snackbar>
      )}
    </Box>
  );
};

export default RolesManagement;
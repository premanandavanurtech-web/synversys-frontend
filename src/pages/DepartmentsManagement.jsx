// src/pages/DepartmentManagement.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Card,
  CardContent,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Tooltip,
  Stack,
  CircularProgress,
  Snackbar,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  alpha,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Business as BusinessIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  People as PeopleIcon,
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon,
  ArrowBack as ArrowBackIcon,  // Added back icon
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";  // Added for navigation
import { useDepartment } from "../context/DepartmentContext";

const C = {
  primary: "#0d4f63",
  primaryDark: "#0a3a49",
  primaryBg: alpha("#0d4f63", 0.08),
  success: "#10b981",
  successBg: "#ecfdf5",
  error: "#ef4444",
  warning: "#f59e0b",
  surface: "#ffffff",
  bg: "#f9fafb",
  border: "#e5e7eb",
  borderLight: "#f3f4f6",
  text: { primary: "#111827", secondary: "#6b7280", muted: "#9ca3af" },
};

const ACCENT = "#0d4f63";

// Department Modal Component
function DeptModal({ open, onClose, onSubmit, loading, editItem }) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    isActive: true,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      if (editItem) {
        setForm({
          name: editItem.name || "",
          description: editItem.description || "",
          isActive: editItem.isActive !== false,
        });
      } else {
        setForm({ name: "", description: "", isActive: true });
      }
      setErrors({});
    }
  }, [editItem, open]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) {
      e.name = "Department name is required";
    } else if (form.name.trim().length < 2) {
      e.name = "Department name must be at least 2 characters";
    } else if (form.name.trim().length > 50) {
      e.name = "Department name must be less than 50 characters";
    } else if (!/^[a-zA-Z][a-zA-Z0-9\s_-]*$/.test(form.name.trim())) {
      e.name = "Department name can only contain letters, numbers, spaces, underscores and hyphens";
    }
    
    if (form.description && form.description.length > 200) {
      e.description = "Description must be less than 200 characters";
    }
    
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit({
        ...form,
        name: form.name.trim(),
        description: form.description.trim(),
      });
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: "16px", border: `1px solid ${C.border}` },
      }}
    >
      <DialogTitle
        sx={{
          pb: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: "10px",
              bgcolor: alpha(ACCENT, 0.1),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <BusinessIcon sx={{ fontSize: 18, color: ACCENT }} />
          </Box>
          <Typography
            sx={{ fontWeight: 700, fontSize: "1rem", color: C.text.primary }}
          >
            {editItem ? "Edit Department" : "Add New Department"}
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: C.text.muted }}>
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <Stack spacing={2.5} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            size="small"
            label="Department Name *"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            error={!!errors.name}
            helperText={errors.name || "Enter a unique department name"}
            placeholder="e.g., Human Resources"
            autoFocus
            sx={{
              "& .MuiOutlinedInput-root": { borderRadius: "10px" },
              "& label": { fontSize: "0.85rem" },
              "& input": { fontSize: "0.85rem" },
            }}
          />
          <TextField
            fullWidth
            size="small"
            label="Description"
            value={form.description}
            multiline
            rows={3}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Describe the department's responsibilities..."
            error={!!errors.description}
            helperText={errors.description}
            sx={{
              "& .MuiOutlinedInput-root": { borderRadius: "10px" },
              "& label": { fontSize: "0.85rem" },
              "& textarea": { fontSize: "0.85rem" },
            }}
          />
          <FormControlLabel
            control={
              <Switch
                checked={form.isActive}
                onChange={(e) =>
                  setForm({ ...form, isActive: e.target.checked })
                }
                sx={{
                  "& .MuiSwitch-switchBase.Mui-checked": {
                    color: ACCENT,
                  },
                  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                    backgroundColor: ACCENT,
                  },
                }}
              />
            }
            label={
              <Typography sx={{ fontSize: "0.85rem", color: C.text.secondary }}>
                {form.isActive ? "Active" : "Inactive"}
              </Typography>
            }
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          disabled={loading}
          sx={{
            textTransform: "none",
            fontSize: "0.85rem",
            borderRadius: "10px",
            borderColor: C.border,
            color: C.text.secondary,
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          sx={{
            textTransform: "none",
            fontSize: "0.85rem",
            borderRadius: "10px",
            bgcolor: ACCENT,
            "&:hover": { bgcolor: "#0a3a49" },
            minWidth: 140,
          }}
        >
          {loading ? (
            <CircularProgress size={16} color="inherit" />
          ) : editItem ? (
            "Update Department"
          ) : (
            "Create Department"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// Delete Confirmation Modal
function DeleteModal({ open, onClose, onConfirm, loading, item }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: "16px" } }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: "10px",
              bgcolor: alpha(C.error, 0.1),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <DeleteIcon sx={{ fontSize: 18, color: C.error }} />
          </Box>
          <Typography sx={{ fontWeight: 700, fontSize: "1rem" }}>
            Delete Department
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography sx={{ fontSize: "0.85rem", color: C.text.secondary, mb: 2 }}>
          Are you sure you want to delete <strong>{item?.name}</strong>? This
          action cannot be undone.
        </Typography>
        {item?.memberCount > 0 && (
          <Alert
            severity="warning"
            sx={{ mt: 1, fontSize: "0.8rem", borderRadius: "10px" }}
          >
            This department has {item.memberCount} member(s) assigned.
            Deleting it will affect these members.
          </Alert>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          disabled={loading}
          sx={{
            textTransform: "none",
            fontSize: "0.85rem",
            borderRadius: "10px",
            borderColor: C.border,
            color: C.text.secondary,
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          disabled={loading}
          sx={{
            textTransform: "none",
            fontSize: "0.85rem",
            borderRadius: "10px",
            bgcolor: C.error,
            "&:hover": { bgcolor: "#dc2626" },
          }}
        >
          {loading ? <CircularProgress size={16} color="inherit" /> : "Delete"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// Main Component
export default function DepartmentManagement() {
  const navigate = useNavigate();  // Added for navigation
  const {
    departments,
    loading,
    actionLoading,
    error,
    pagination,
    canManageDepartments,
    fetchDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    toggleDepartmentStatus,
    clearError,
  } = useDepartment();

  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  
  const debounceTimerRef = useRef(null);

  const showToast = useCallback(
    (msg, sev = "success") =>
      setToast({ open: true, message: msg, severity: sev }),
    [],
  );
  
  const closeToast = () => setToast((p) => ({ ...p, open: false }));

  // Debounced fetch function
  const debouncedFetch = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      fetchDepartments({
        search: searchTerm,
        page: page + 1,
        limit: rowsPerPage,
        sort: "createdAt",
        order: "desc",
      });
    }, 500);
  }, [searchTerm, page, rowsPerPage, fetchDepartments]);

  useEffect(() => {
    if (canManageDepartments) {
      debouncedFetch();
    }
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [debouncedFetch, canManageDepartments]);

  // Reset pagination when search changes
  useEffect(() => {
    setPage(0);
  }, [searchTerm]);

  const handleSubmit = async (formData) => {
    try {
      let result;
      if (editItem) {
        result = await updateDepartment(editItem._id, formData);
      } else {
        // Check for duplicate department name before creating
        const isDuplicate = departments.some(
          dept => dept.name.toLowerCase() === formData.name.toLowerCase()
        );
        if (isDuplicate) {
          showToast("A department with this name already exists", "error");
          return;
        }
        result = await createDepartment(formData);
      }
      
      if (result.success) {
        showToast(result.message);
        setModalOpen(false);
        setEditItem(null);
      } else {
        showToast(result.error || "Operation failed", "error");
      }
    } catch (error) {
      console.error("Department operation error:", error);
      showToast(error.message || "An unexpected error occurred", "error");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    
    try {
      const result = await deleteDepartment(deleteTarget._id);
      if (result.success) {
        showToast(result.message);
        setDeleteModalOpen(false);
        setDeleteTarget(null);
      } else {
        showToast(result.error || "Failed to delete department", "error");
      }
    } catch (error) {
      console.error("Delete error:", error);
      showToast(error.message || "An unexpected error occurred", "error");
    }
  };

  const handleToggleStatus = async (department) => {
    try {
      const result = await toggleDepartmentStatus(department._id, department.isActive);
      if (result.success) {
        showToast(`Department ${department.isActive ? "deactivated" : "activated"} successfully`);
      } else {
        showToast(result.error || "Failed to update status", "error");
      }
    } catch (error) {
      showToast("Failed to update department status", "error");
    }
  };

  const handleMenuOpen = (event, department) => {
    setAnchorEl(event.currentTarget);
    setSelectedDepartment(department);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedDepartment(null);
  };

  const handleRefresh = () => {
    fetchDepartments({
      search: searchTerm,
      page: page + 1,
      limit: rowsPerPage,
      sort: "createdAt",
      order: "desc",
    });
    showToast("Departments refreshed", "info");
  };

  const handleGoBack = () => {
    navigate(-1); // Navigate back to previous page
  };

  const statItems = [
    {
      label: "Total Departments",
      value: pagination.total || departments.length,
      color: ACCENT,
      icon: BusinessIcon,
    },
    {
      label: "Active",
      value: departments.filter((d) => d.isActive).length,
      color: C.success,
      icon: CheckCircleIcon,
    },
    {
      label: "Inactive",
      value: departments.filter((d) => !d.isActive).length,
      color: C.text.muted,
      icon: CancelIcon,
    },
  ];

  if (!canManageDepartments) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h5" color="error" gutterBottom>
            Access Denied
          </Typography>
          <Typography variant="body1" color="text.secondary">
            You don't have permission to access this page. Only administrators can manage departments.
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: C.bg,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <Container maxWidth="xl" sx={{ py: { xs: 2, md: 3.5 } }}>
        {/* Header with Back Button */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
            mb: 3,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {/* Back Button */}
            <Tooltip title="Go Back" arrow>
              <IconButton
                onClick={handleGoBack}
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "10px",
                  bgcolor: alpha(ACCENT, 0.08),
                  color: ACCENT,
                  "&:hover": {
                    bgcolor: alpha(ACCENT, 0.15),
                  },
                }}
              >
                <ArrowBackIcon />
              </IconButton>
            </Tooltip>
            <Box>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: "1.25rem", sm: "1.5rem" },
                  color: C.text.primary,
                  letterSpacing: "-0.02em",
                  mb: 0.5,
                }}
              >
                Department Management
              </Typography>
              <Typography sx={{ color: C.text.secondary, fontSize: "0.85rem" }}>
                Organize your team into departments
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditItem(null);
              setModalOpen(true);
            }}
            sx={{
              bgcolor: ACCENT,
              borderRadius: "10px",
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.8rem",
              px: 2.5,
              py: 0.8,
              "&:hover": { bgcolor: "#0a3a49" },
            }}
          >
            Add Department
          </Button>
        </Box>

        {/* Stats Cards */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(3, 1fr)" },
            gap: 2,
            mb: 3,
          }}
        >
          {statItems.map((s) => (
            <Card
              key={s.label}
              elevation={0}
              sx={{
                borderRadius: "14px",
                border: `1px solid ${C.border}`,
                transition: "all 0.2s",
                "&:hover": {
                  borderColor: s.color,
                  boxShadow: `0 4px 12px ${alpha(s.color, 0.1)}`,
                },
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 1,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "0.7rem",
                      fontWeight: 600,
                      color: C.text.secondary,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {s.label}
                  </Typography>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: "10px",
                      bgcolor: alpha(s.color, 0.1),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <s.icon sx={{ fontSize: 16, color: s.color }} />
                  </Box>
                </Box>
                <Typography
                  sx={{
                    fontSize: "1.5rem",
                    fontWeight: 700,
                    color: C.text.primary,
                  }}
                >
                  {s.value}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Search and Refresh Bar */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: "14px",
            border: `1px solid ${C.border}`,
            mb: 2.5,
            p: 1.5,
            display: "flex",
            gap: 1,
            alignItems: "center",
          }}
        >
          <TextField
            fullWidth
            placeholder="Search departments by name or description..."
            variant="standard"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
            }}
            InputProps={{
              disableUnderline: true,
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: C.text.muted, fontSize: 20 }} />
                </InputAdornment>
              ),
              endAdornment: searchTerm ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchTerm("")}>
                    <CloseIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </InputAdornment>
              ) : null,
              sx: { fontSize: "0.9rem", color: C.text.primary, py: 0.8, px: 1 },
            }}
          />
          <Tooltip title="Refresh">
            <IconButton onClick={handleRefresh} size="small">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Paper>

        {/* Department Table */}
        {loading && !departments.length ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
            <CircularProgress sx={{ color: ACCENT }} />
          </Box>
        ) : departments.length === 0 ? (
          <Paper
            sx={{
              textAlign: "center",
              py: 8,
              borderRadius: "14px",
              border: `1px solid ${C.border}`,
            }}
          >
            <BusinessIcon sx={{ fontSize: 48, color: C.text.muted, mb: 1.5 }} />
            <Typography sx={{ color: C.text.secondary, fontSize: "0.9rem", mb: 1 }}>
              {searchTerm ? "No departments match your search" : "No departments found"}
            </Typography>
            {!searchTerm && (
              <Button
                onClick={() => setModalOpen(true)}
                sx={{ mt: 2, fontSize: "0.8rem" }}
              >
                Add your first department
              </Button>
            )}
          </Paper>
        ) : (
          <Paper
            elevation={0}
            sx={{
              borderRadius: "14px",
              border: `1px solid ${C.border}`,
              overflow: "hidden",
            }}
          >
            <TableContainer sx={{ overflowX: "auto" }}>
              <Table sx={{ minWidth: 800 }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: C.bg }}>
                    {[
                      "Department",
                      "Description",
                      "Status",
                      "Created",
                      "Actions",
                    ].map((h) => (
                      <TableCell
                        key={h}
                        align={h === "Actions" ? "center" : "left"}
                        sx={{
                          fontWeight: 600,
                          fontSize: "0.75rem",
                          color: C.text.secondary,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          py: 1.8,
                          borderBottom: `1px solid ${C.border}`,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {departments.map((dept) => (
                    <TableRow
                      key={dept._id}
                      hover
                      sx={{ "&:hover": { bgcolor: alpha(ACCENT, 0.02) } }}
                    >
                      <TableCell sx={{ py: 1.8, pl: 2.5 }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                          }}
                        >
                          <Box
                            sx={{
                              width: 36,
                              height: 36,
                              borderRadius: "10px",
                              bgcolor: alpha(ACCENT, 0.08),
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <BusinessIcon
                              sx={{ fontSize: 16, color: ACCENT }}
                            />
                          </Box>
                          <Box>
                            <Typography
                              sx={{
                                fontWeight: 600,
                                fontSize: "0.9rem",
                                color: C.text.primary,
                              }}
                            >
                              {dept.name}
                            </Typography>
                            <Typography
                              sx={{ fontSize: "0.7rem", color: C.text.muted }}
                            >
                              ID: {dept._id?.slice(-6)}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Tooltip title={dept.description || "No description"}>
                          <Typography
                            sx={{
                              fontSize: "0.82rem",
                              color: C.text.secondary,
                              maxWidth: 220,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {dept.description || "—"}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={dept.isActive ? "Active" : "Inactive"}
                          size="small"
                          sx={{
                            bgcolor: dept.isActive
                              ? C.successBg
                              : C.borderLight,
                            color: dept.isActive ? C.success : C.text.muted,
                            fontWeight: 500,
                            fontSize: "0.7rem",
                            height: 24,
                            borderRadius: "6px",
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography
                          sx={{ fontSize: "0.8rem", color: C.text.secondary }}
                        >
                          {new Date(dept.createdAt).toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric", year: "numeric" },
                          )}
                        </Typography>
                      </TableCell>
                      <TableCell align="center" sx={{ pr: 2.5 }}>
                        <Stack
                          direction="row"
                          spacing={1}
                          justifyContent="center"
                        >
                          <Tooltip title="Edit Department" arrow>
                            <IconButton
                              size="small"
                              onClick={() => {
                                setEditItem(dept);
                                setModalOpen(true);
                              }}
                              disabled={actionLoading}
                              sx={{
                                width: 30,
                                height: 30,
                                borderRadius: "8px",
                                color: C.text.secondary,
                                "&:hover": {
                                  bgcolor: alpha(ACCENT, 0.08),
                                  color: ACCENT,
                                },
                              }}
                            >
                              <EditIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="More Options" arrow>
                            <IconButton
                              size="small"
                              onClick={(e) => handleMenuOpen(e, dept)}
                              disabled={actionLoading}
                              sx={{
                                width: 30,
                                height: 30,
                                borderRadius: "8px",
                                color: C.text.secondary,
                                "&:hover": {
                                  bgcolor: alpha(ACCENT, 0.08),
                                },
                              }}
                            >
                              <MoreVertIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Box
              sx={{ borderTop: `1px solid ${C.border}`, bgcolor: C.surface }}
            >
              <TablePagination
                component="div"
                count={pagination.total || departments.length}
                page={page}
                onPageChange={(_, p) => setPage(p)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
                rowsPerPageOptions={[5, 10, 20, 50]}
                sx={{
                  "& .MuiTablePagination-toolbar": {
                    fontSize: "0.8rem",
                    minHeight: 52,
                  },
                  "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
                    { fontSize: "0.75rem", color: C.text.secondary },
                }}
              />
            </Box>
          </Paper>
        )}
      </Container>

      {/* Modals */}
      <DeptModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditItem(null);
        }}
        onSubmit={handleSubmit}
        loading={actionLoading}
        editItem={editItem}
      />
      
      <DeleteModal
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setDeleteTarget(null);
        }}
        onConfirm={handleDelete}
        loading={actionLoading}
        item={deleteTarget}
      />

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            borderRadius: "12px",
            minWidth: 150,
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          },
        }}
      >
        <MenuItem
          onClick={() => {
            handleToggleStatus(selectedDepartment);
            handleMenuClose();
          }}
          sx={{ fontSize: "0.85rem", gap: 1 }}
        >
          {selectedDepartment?.isActive ? (
            <>Deactivate</>
          ) : (
            <>Activate</>
          )}
        </MenuItem>
        <MenuItem
          onClick={() => {
            setEditItem(selectedDepartment);
            setModalOpen(true);
            handleMenuClose();
          }}
          sx={{ fontSize: "0.85rem", gap: 1 }}
        >
          <EditIcon sx={{ fontSize: 16 }} /> Edit
        </MenuItem>
        <MenuItem
          onClick={() => {
            setDeleteTarget(selectedDepartment);
            setDeleteModalOpen(true);
            handleMenuClose();
          }}
          sx={{ fontSize: "0.85rem", gap: 1, color: C.error }}
        >
          <DeleteIcon sx={{ fontSize: 16 }} /> Delete
        </MenuItem>
      </Menu>

      {/* Toast Notifications */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={closeToast}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={closeToast}
          severity={toast.severity}
          variant="filled"
          sx={{ borderRadius: "10px", fontSize: "0.8rem" }}
        >
          {toast.message}
        </Alert>
      </Snackbar>

      {/* Error Snackbar */}
      {error && (
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={clearError}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert onClose={clearError} severity="error" sx={{ borderRadius: 2 }}>
            {error}
          </Alert>
        </Snackbar>
      )}
    </Box>
  );
}
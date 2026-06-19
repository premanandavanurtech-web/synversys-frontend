// components/AddMemberModal.js
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Alert,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  Divider,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import WorkIcon from "@mui/icons-material/Work";
import BusinessIcon from "@mui/icons-material/Business";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import LockIcon from "@mui/icons-material/Lock";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { useTeam } from "../context/TeamContext";
import { useRoles } from "../context/RoleContext";
import { useDepartment } from "../context/DepartmentContext";

const C = {
  primary: "#0d4a5c",
  primaryDark: "#0a3a49",
};

const MENU_PROPS = {
  PaperProps: {
    sx: {
      borderRadius: 1.5,
      mt: 0.5,
      boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
    },
  },
};

// Sentinel values used to detect the "add new" option inside the selects
const ADD_NEW_ROLE = "__add_new_role__";
const ADD_NEW_DEPARTMENT = "__add_new_department__";

// Reusable row wrapper: two equal-width children side by side
function FormRow({ children }) {
  return (
    <Box sx={{ display: "flex", gap: 1.5, width: "100%" }}>
      <Box sx={{ flex: 1, minWidth: 0 }}>{children[0]}</Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>{children[1]}</Box>
    </Box>
  );
}

// Small popup for quickly creating a Role or Department without leaving
// the Add Member form. `type` is either "role" or "department".
function QuickCreateDialog({ open, onClose, onCreate, type }) {
  const isRole = type === "role";
  const label = isRole ? "Role" : "Department";

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setName("");
      setDescription("");
      setError("");
    }
  }, [open]);

  const handleNameChange = (e) => {
    const raw = e.target.value;
    const value = isRole ? raw.toLowerCase().replace(/\s+/g, "_") : raw;
    setName(value);
    if (error) setError("");
  };

  const handleCreate = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError(`${label} name is required`);
      return;
    }
    if (isRole && !/^[a-z_]+$/.test(trimmed)) {
      setError(
        "Role name must be lowercase with underscores only (e.g., sales_manager)",
      );
      return;
    }
    if (!isRole && trimmed.length < 2) {
      setError("Department name must be at least 2 characters");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const result = await onCreate({
        name: trimmed,
        description: description.trim(),
        isActive: true,
      });
      if (result?.success === false) {
        setError(result.error || `Failed to create ${label.toLowerCase()}`);
      } else {
        onClose();
      }
    } catch (err) {
      setError(err.message || `Failed to create ${label.toLowerCase()}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={submitting ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogTitle sx={{ fontSize: "1rem", fontWeight: 600, pb: 1 }}>
        Add New {label}
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 1.5 }}>
            {error}
          </Alert>
        )}
        <TextField
          fullWidth
          autoFocus
          size="small"
          label={`${label} Name`}
          value={name}
          onChange={handleNameChange}
          placeholder={isRole ? "e.g., sales_manager" : "e.g., Human Resources"}
          helperText={
            isRole
              ? "Lowercase letters and underscores only"
              : "Enter a unique department name"
          }
          sx={{ mt: 1, mb: 2 }}
        />
        <TextField
          fullWidth
          size="small"
          label="Description (Optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          multiline
          rows={2}
          placeholder={`Brief description of this ${label.toLowerCase()}`}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={onClose}
          disabled={submitting}
          sx={{ textTransform: "none" }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleCreate}
          variant="contained"
          disabled={submitting}
          sx={{
            textTransform: "none",
            backgroundColor: C.primary,
            "&:hover": { backgroundColor: C.primaryDark },
            minWidth: 120,
          }}
        >
          {submitting ? (
            <CircularProgress size={18} sx={{ color: "white" }} />
          ) : (
            `Create ${label}`
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function AddMemberModal({
  open,
  onClose,
  onSubmit,
  loading,
  onValidationError,
}) {
  const { roles, fetchRoles, departments, fetchDepartments } = useTeam();
  const { createRole } = useRoles();
  const { createDepartment } = useDepartment();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    roleId: "",
    departmentId: "",
    location: "",
    bio: "",
  });

  const [errors, setErrors] = useState({});
  const [fetchLoading, setFetchLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Quick-create dialog state
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [deptDialogOpen, setDeptDialogOpen] = useState(false);

  useEffect(() => {
    if (open) {
      const fetchData = async () => {
        setFetchLoading(true);
        setFetchError(null);
        try {
          await Promise.all([
            fetchRoles({ limit: 100 }, true),
            fetchDepartments({ limit: 100 }, true),
          ]);
        } catch (error) {
          console.error("Error fetching data:", error);
          setFetchError("Failed to load form data. Please try again.");
        } finally {
          setFetchLoading(false);
        }
      };
      fetchData();
    }
  }, [open, fetchRoles, fetchDepartments]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const nextValue =
      name === "phone" ? value.replace(/\D/g, "").slice(0, 10) : value;
    setFormData((prev) => ({ ...prev, [name]: nextValue }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Intercept the "Add New Role" sentinel option before it ever reaches
  // formData — otherwise we'd store the sentinel string as the roleId.
  const handleRoleSelectChange = (e) => {
    if (e.target.value === ADD_NEW_ROLE) {
      setRoleDialogOpen(true);
      return;
    }
    handleChange(e);
  };

  const handleDeptSelectChange = (e) => {
    if (e.target.value === ADD_NEW_DEPARTMENT) {
      setDeptDialogOpen(true);
      return;
    }
    handleChange(e);
  };

  const handleCreateRole = async (data) => {
    const result = await createRole(data);
    // Refresh the dropdown list so the new role shows up
    await fetchRoles({ limit: 100 }, true);
    const newId =
      result?.role?._id ||
      result?.role?.id ||
      result?.data?._id ||
      result?._id;
    if (newId) {
      setFormData((prev) => ({ ...prev, roleId: newId }));
      if (errors.roleId) setErrors((prev) => ({ ...prev, roleId: "" }));
    }
    return result;
  };

  const handleCreateDepartment = async (data) => {
    const result = await createDepartment(data);
    await fetchDepartments({ limit: 100 }, true);
    const newId =
      result?.department?._id ||
      result?.department?.id ||
      result?.data?._id ||
      result?._id;
    if (newId) {
      setFormData((prev) => ({ ...prev, departmentId: newId }));
      if (errors.departmentId)
        setErrors((prev) => ({ ...prev, departmentId: "" }));
    }
    return result;
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.firstName?.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName?.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email?.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (!formData.roleId) newErrors.roleId = "Role is required";
    if (!formData.departmentId) newErrors.departmentId = "Department is required";
    if (!formData.location?.trim()) newErrors.location = "Location is required";
    if (formData.phone?.trim() && !/^\d{10}$/.test(formData.phone.trim())) {
      newErrors.phone = "Phone number must be exactly 10 digits";
    }
    setErrors(newErrors);
    const firstError = Object.values(newErrors)[0];
    if (firstError) onValidationError?.(firstError);
    return !firstError;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    const submitData = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim(),
      password: formData.password,
      phone: formData.phone?.trim() || "",
      roleId: formData.roleId,
      departmentId: formData.departmentId,
      location: formData.location.trim(),
      bio: formData.bio?.trim() || "",
    };
    try {
      const result = await onSubmit(submitData);
      if (result?.success) {
        handleClose();
      } else if (result?.error) {
        setErrors((prev) => ({ ...prev, submit: result.error }));
      }
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        submit: error.message || "Failed to add team member",
      }));
    }
  };

  const handleClose = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      roleId: "",
      departmentId: "",
      location: "",
      bio: "",
    });
    setErrors({});
    setFetchError(null);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setRoleDialogOpen(false);
    setDeptDialogOpen(false);
    onClose();
  };

  const iconSx = { fontSize: "0.9rem", color: "text.secondary" };
  const fieldSize = "small";

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2, overflow: "hidden" } }}
      >
        {/* ── Header ── */}
        <DialogTitle sx={{ pb: 1, pt: 2, px: { xs: 2, sm: 2.5 } }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h6" fontWeight={600} fontSize={{ xs: "1rem", sm: "1.1rem" }}>
                Add New Team Member
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.65rem" }}>
                Create a new team member account
              </Typography>
            </Box>
            <IconButton onClick={handleClose} size="small">
              <CloseIcon sx={{ fontSize: "1rem" }} />
            </IconButton>
          </Box>
        </DialogTitle>

        {/* ── Body ── */}
        <DialogContent sx={{ px: { xs: 2, sm: 2.5 }, py: 2 }}>
          {fetchError && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 1.5 }}>{fetchError}</Alert>
          )}
          {errors.submit && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 1.5 }}>{errors.submit}</Alert>
          )}

          {fetchLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress size={40} sx={{ color: C.primary }} />
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mt: 1 }}>

              {/* Row 1: First Name | Last Name */}
              <FormRow>
                <TextField
                  fullWidth required size={fieldSize}
                  label="First Name" name="firstName"
                  value={formData.firstName} onChange={handleChange}
                  error={!!errors.firstName} helperText={errors.firstName}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><PersonIcon sx={iconSx} /></InputAdornment>,
                  }}
                />
                <TextField
                  fullWidth required size={fieldSize}
                  label="Last Name" name="lastName"
                  value={formData.lastName} onChange={handleChange}
                  error={!!errors.lastName} helperText={errors.lastName}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><PersonIcon sx={iconSx} /></InputAdornment>,
                  }}
                />
              </FormRow>

              {/* Row 2: Email | Phone */}
              <FormRow>
                <TextField
                  fullWidth required size={fieldSize}
                  label="Email" name="email" type="email"
                  value={formData.email} onChange={handleChange}
                  error={!!errors.email} helperText={errors.email}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><EmailIcon sx={iconSx} /></InputAdornment>,
                  }}
                />
                <TextField
                  fullWidth size={fieldSize}
                  label="Phone Number" name="phone"
                  value={formData.phone} onChange={handleChange}
                  placeholder="10 digit number"
                  inputProps={{ inputMode: "numeric", pattern: "[0-9]*", maxLength: 10 }}
                  error={!!errors.phone} helperText={errors.phone}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><PhoneIcon sx={iconSx} /></InputAdornment>,
                  }}
                />
              </FormRow>

              {/* Row 3: Password | Confirm Password */}
              <FormRow>
                <TextField
                  fullWidth required size={fieldSize}
                  label="Password" name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password} onChange={handleChange}
                  error={!!errors.password} helperText={errors.password}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><LockIcon sx={iconSx} /></InputAdornment>,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword((p) => !p)} edge="end" size="small" tabIndex={-1}>
                          {showPassword ? <VisibilityOff sx={iconSx} /> : <Visibility sx={iconSx} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  fullWidth required size={fieldSize}
                  label="Confirm Password" name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword} onChange={handleChange}
                  error={!!errors.confirmPassword} helperText={errors.confirmPassword}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><LockIcon sx={iconSx} /></InputAdornment>,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowConfirmPassword((p) => !p)} edge="end" size="small" tabIndex={-1}>
                          {showConfirmPassword ? <VisibilityOff sx={iconSx} /> : <Visibility sx={iconSx} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </FormRow>

              {/* Row 4: Role | Department */}
              <FormRow>
                <FormControl fullWidth required size={fieldSize} error={!!errors.roleId}>
                  <InputLabel id="role-label">Role</InputLabel>
                  <Select
                    labelId="role-label" label="Role"
                    name="roleId" value={formData.roleId} onChange={handleRoleSelectChange}
                    startAdornment={<InputAdornment position="start"><WorkIcon sx={iconSx} /></InputAdornment>}
                    MenuProps={MENU_PROPS}
                  >
                    <MenuItem value="" disabled>
                      <Typography color="text.secondary" fontSize="0.85rem">Select a role</Typography>
                    </MenuItem>
                    {roles && roles.length > 0 ? (
                      roles.map((role) => (
                        <MenuItem key={role._id || role.id} value={role._id || role.id} sx={{ fontSize: "0.85rem" }}>
                          {role.name}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled sx={{ fontSize: "0.85rem" }}>No roles available</MenuItem>
                    )}
                    <Divider sx={{ my: 0.5 }} />
                    <MenuItem
                      value={ADD_NEW_ROLE}
                      sx={{ fontSize: "0.85rem", color: C.primary, fontWeight: 600 }}
                    >
                      <AddCircleOutlineIcon sx={{ fontSize: "1rem", mr: 1 }} />
                      Add New Role
                    </MenuItem>
                  </Select>
                  {errors.roleId && <FormHelperText>{errors.roleId}</FormHelperText>}
                </FormControl>

                <FormControl fullWidth required size={fieldSize} error={!!errors.departmentId}>
                  <InputLabel id="dept-label">Department</InputLabel>
                  <Select
                    labelId="dept-label" label="Department"
                    name="departmentId" value={formData.departmentId} onChange={handleDeptSelectChange}
                    startAdornment={<InputAdornment position="start"><BusinessIcon sx={iconSx} /></InputAdornment>}
                    MenuProps={MENU_PROPS}
                  >
                    <MenuItem value="" disabled>
                      <Typography color="text.secondary" fontSize="0.85rem">Select a department</Typography>
                    </MenuItem>
                    {departments && departments.length > 0 ? (
                      departments.map((dept) => (
                        <MenuItem key={dept._id || dept.id} value={dept._id || dept.id} sx={{ fontSize: "0.85rem" }}>
                          {dept.name}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled sx={{ fontSize: "0.85rem" }}>No departments available</MenuItem>
                    )}
                    <Divider sx={{ my: 0.5 }} />
                    <MenuItem
                      value={ADD_NEW_DEPARTMENT}
                      sx={{ fontSize: "0.85rem", color: C.primary, fontWeight: 600 }}
                    >
                      <AddCircleOutlineIcon sx={{ fontSize: "1rem", mr: 1 }} />
                      Add New Department
                    </MenuItem>
                  </Select>
                  {errors.departmentId && <FormHelperText>{errors.departmentId}</FormHelperText>}
                </FormControl>
              </FormRow>

              {/* Row 5: Location | Bio */}
              <FormRow>
                <TextField
                  fullWidth required size={fieldSize}
                  label="Location" name="location"
                  value={formData.location} onChange={handleChange}
                  error={!!errors.location}
                  helperText={errors.location || "e.g., New York, London, Tokyo"}
                  placeholder="Enter location name"
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><LocationOnIcon sx={iconSx} /></InputAdornment>,
                  }}
                />
                <TextField
                  fullWidth size={fieldSize}
                  label="Bio (Optional)" name="bio"
                  value={formData.bio} onChange={handleChange}
                  placeholder="About the team member..."
                  multiline rows={2}
                  sx={{ "& .MuiInputBase-root": { alignItems: "flex-start", pt: 1 } }}
                />
              </FormRow>

            </Box>
          )}
        </DialogContent>

        {/* ── Footer ── */}
        <DialogActions sx={{ px: { xs: 2, sm: 2.5 }, pb: 2.5, gap: 1.5 }}>
          <Button
            onClick={handleClose}
            variant="outlined"
            disabled={loading || fetchLoading}
            sx={{ textTransform: "none", borderRadius: 1.5, fontSize: "0.8rem", py: 0.75 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading || fetchLoading}
            sx={{
              textTransform: "none",
              borderRadius: 1.5,
              backgroundColor: C.primary,
              fontSize: "0.8rem",
              py: 0.75,
              px: 2.5,
              "&:hover": { backgroundColor: C.primaryDark },
            }}
          >
            {loading ? <CircularProgress size={20} sx={{ color: "white" }} /> : "Add Member"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Quick-create popups, opened from the Role / Department selects above */}
      <QuickCreateDialog
        open={roleDialogOpen}
        onClose={() => setRoleDialogOpen(false)}
        onCreate={handleCreateRole}
        type="role"
      />
      <QuickCreateDialog
        open={deptDialogOpen}
        onClose={() => setDeptDialogOpen(false)}
        onCreate={handleCreateDepartment}
        type="department"
      />
    </>
  );
}

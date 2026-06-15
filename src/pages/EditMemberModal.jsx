// components/TeamManagement/EditTeamMemberModal.jsx
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Box,
  Typography,
  CircularProgress,
  Alert,
  IconButton,
  Divider,
} from "@mui/material";
import { Close as CloseIcon, Save as SaveIcon } from "@mui/icons-material";
import { useTeam } from "../context/TeamContext";
import { useRoles } from "../context/RoleContext";
import { useDepartment } from "../context/DepartmentContext";

const EditTeamMemberModal = ({ open, onClose, member, onSuccess }) => {
  const { updateTeamMember, actionLoading } = useTeam();
  const { roles, fetchRoles, loading: rolesLoading } = useRoles();
  const {
    departments,
    fetchDepartments,
    loading: deptLoading,
  } = useDepartment();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    teamRole: "",
    department: "",
    location: "",
    bio: "",
    status: "active",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Fetch roles and departments when modal opens
  useEffect(() => {
    if (open) {
      fetchRoles({ limit: 100 });
      fetchDepartments({ limit: 100 });
    }
  }, [open, fetchRoles, fetchDepartments]);

  // Populate form when member data changes
  useEffect(() => {
    if (member && open) {
      setFormData({
        firstName: member.firstName || "",
        lastName: member.lastName || "",
        email: member.email || "",
        phone: member.phone || "",
        teamRole: member.teamRole || member.teamRoleDisplay || "",
        department: member.department || "",
        location: member.location || "",
        bio: member.bio || "",
        status: member.status || "active",
      });
    }
  }, [member, open]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ""))) {
      newErrors.phone = "Phone number must be 10 digits";
    }

    if (!formData.teamRole) {
      newErrors.teamRole = "Team role is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field) => (event) => {
    setFormData({ ...formData, [field]: event.target.value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);

    const submitData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
      teamRole: formData.teamRole,
      department: formData.department,
      location: formData.location,
      bio: formData.bio,
      status: formData.status,
    };

    const memberId = member.id || member._id;
    const result = await updateTeamMember(memberId, submitData);

    if (result.success) {
      onSuccess?.(result.message);
      onClose();
    } else {
      setErrors({ submit: result.error });
    }

    setLoading(false);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2, overflow: "hidden" },
      }}
    >
      <DialogTitle
        sx={{ p: 2, bgcolor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h6" fontWeight={600} fontSize="1.1rem">
              Edit Team Member
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Update team member information
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {errors.submit && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            onClose={() => setErrors({ ...errors, submit: "" })}
          >
            {errors.submit}
          </Alert>
        )}

        <Grid container spacing={2.5}>
          {/* Personal Information */}
          <Grid item xs={12}>
            <Typography
              variant="subtitle2"
              fontWeight={600}
              color="primary"
              sx={{ mb: 1.5 }}
            >
              Personal Information
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="First Name"
              value={formData.firstName}
              onChange={handleChange("firstName")}
              fullWidth
              size="small"
              error={!!errors.firstName}
              helperText={errors.firstName}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Last Name"
              value={formData.lastName}
              onChange={handleChange("lastName")}
              fullWidth
              size="small"
              error={!!errors.lastName}
              helperText={errors.lastName}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={handleChange("email")}
              fullWidth
              size="small"
              disabled
              helperText="Email cannot be changed"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Phone Number"
              value={formData.phone}
              onChange={handleChange("phone")}
              fullWidth
              size="small"
              error={!!errors.phone}
              helperText={errors.phone}
              required
            />
          </Grid>

          {/* Role & Department */}
          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
            <Typography
              variant="subtitle2"
              fontWeight={600}
              color="primary"
              sx={{ mt: 1, mb: 1.5 }}
            >
              Role & Department
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl
              fullWidth
              size="small"
              error={!!errors.teamRole}
              required
            >
              <InputLabel>Team Role</InputLabel>
              <Select
                value={formData.teamRole}
                onChange={handleChange("teamRole")}
                label="Team Role"
                disabled={rolesLoading}
              >
                <MenuItem value="">Select a role</MenuItem>
                {roles.map((role) => (
                  <MenuItem
                    key={role._id || role.value}
                    value={role.label || role.name}
                  >
                    {role.label || role.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.teamRole && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                  {errors.teamRole}
                </Typography>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Department</InputLabel>
              <Select
                value={formData.department}
                onChange={handleChange("department")}
                label="Department"
                disabled={deptLoading}
              >
                <MenuItem value="">Select a department (optional)</MenuItem>
                {departments.map((dept) => (
                  <MenuItem
                    key={dept._id || dept.value}
                    value={dept.label || dept.name}
                  >
                    {dept.label || dept.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Location"
              value={formData.location}
              onChange={handleChange("location")}
              fullWidth
              size="small"
              placeholder="e.g., Main Office, Branch Location, Site Name"
            />
          </Grid>

          {/* Bio */}
          <Grid item xs={12}>
            <TextField
              label="Bio / Description"
              value={formData.bio}
              onChange={handleChange("bio")}
              fullWidth
              multiline
              rows={3}
              size="small"
              placeholder="Brief description about the team member"
            />
          </Grid>

          {/* Status */}
          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
            <Typography
              variant="subtitle2"
              fontWeight={600}
              color="primary"
              sx={{ mt: 1, mb: 1.5 }}
            >
              Account Status
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                onChange={handleChange("status")}
                label="Status"
              >
                <MenuItem value="active">
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        bgcolor: "#16a34a",
                      }}
                    />
                    <span>Active</span>
                  </Box>
                </MenuItem>
                <MenuItem value="inactive">
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        bgcolor: "#ef4444",
                      }}
                    />
                    <span>Inactive</span>
                  </Box>
                </MenuItem>
                <MenuItem value="onleave">
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        bgcolor: "#eab308",
                      }}
                    />
                    <span>On Leave</span>
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions
        sx={{
          p: 2.5,
          pt: 2,
          bgcolor: "#f8fafc",
          borderTop: "1px solid #e2e8f0",
          gap: 1,
        }}
      >
        <Button
          onClick={onClose}
          disabled={loading || actionLoading}
          sx={{ textTransform: "none" }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || actionLoading}
          startIcon={
            loading || actionLoading ? (
              <CircularProgress size={18} />
            ) : (
              <SaveIcon />
            )
          }
          sx={{
            textTransform: "none",
            bgcolor: "#0d4a5c",
            "&:hover": { bgcolor: "#0a3a49" },
          }}
        >
          {loading || actionLoading ? "Saving..." : "Save Changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditTeamMemberModal;

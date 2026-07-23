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
  Box,
  Typography,
  CircularProgress,
  Alert,
  IconButton,
  InputAdornment,
  FormHelperText,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Close as CloseIcon, Save as SaveIcon } from "@mui/icons-material";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import WorkIcon from "@mui/icons-material/Work";
import BusinessIcon from "@mui/icons-material/Business";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
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

const STATUS_OPTIONS = [
  { value: "active",   label: "Active",   color: "#16a34a" },
  { value: "inactive", label: "Inactive", color: "#ef4444" },
  { value: "on_leave",  label: "On Leave", color: "#eab308" },
];

function FormRow({ children }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        gap: 1.5,
        width: "100%",
      }}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>{children[0]}</Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>{children[1]}</Box>
    </Box>
  );
}

const EditTeamMemberModal = ({ open, onClose, member, onSuccess }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { updateTeamMember, actionLoading } = useTeam();
  const { roles, fetchRoles, loading: rolesLoading } = useRoles();
  const { departments, fetchDepartments, loading: deptLoading } = useDepartment();

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

  useEffect(() => {
    if (open) {
      fetchRoles({ limit: 100 });
      fetchDepartments({ limit: 100 });
    }
  }, [open, fetchRoles, fetchDepartments]);

  useEffect(() => {
    if (member && open) {
      setFormData({
        firstName: member.firstName || "",
        lastName:  member.lastName  || "",
        email:     member.email     || "",
        phone:     member.phone     || "",
        teamRole:  member.teamRole  || member.teamRoleDisplay || "",
        department: member.department || "",
        location:  member.location  || "",
        bio:       member.bio       || "",
        status:    member.status    || "active",
      });
    }
  }, [member, open]);

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim())  newErrors.lastName  = "Last name is required";
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
    if (!formData.teamRole) newErrors.teamRole = "Team role is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setLoading(true);
    const submitData = {
      firstName:  formData.firstName,
      lastName:   formData.lastName,
      phone:      formData.phone,
      teamRole:   formData.teamRole,
      department: formData.department,
      location:   formData.location,
      bio:        formData.bio,
      status:     formData.status,
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

  const iconSx     = { fontSize: "0.9rem", color: "text.secondary" };
  const fieldSize  = "small";
  const activeRoles = Array.isArray(roles)
    ? roles.filter((role) => role.isActive !== false)
    : [];
  const activeDepartments = Array.isArray(departments)
    ? departments.filter((department) => department.isActive !== false)
    : [];
  const isBusy     = loading || actionLoading;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={isMobile}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: { xs: 0, sm: 2 },
          overflow: "hidden",
          m: { xs: 0, sm: 2 },
          width: { xs: "100%", sm: "calc(100% - 32px)" },
          maxWidth: { xs: "none", sm: 600 },
          height: { xs: "100dvh", sm: "auto" },
          maxHeight: { xs: "100dvh", sm: "calc(100% - 64px)" },
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      {/* ── Header ── */}
      <DialogTitle sx={{ pb: 1, pt: 2, px: { xs: 2, sm: 2.5 } }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h6" fontWeight={600} fontSize={{ xs: "1rem", sm: "1.1rem" }}>
              Edit Team Member
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.65rem" }}>
              Update team member information
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon sx={{ fontSize: "1rem" }} />
          </IconButton>
        </Box>
      </DialogTitle>

      {/* ── Body ── */}
      <DialogContent
        sx={{
          px: { xs: 2, sm: 2.5 },
          py: 2,
          flex: 1,
          overflowY: "auto",
        }}
      >
        {errors.submit && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 1.5 }}
            onClose={() => setErrors((p) => ({ ...p, submit: "" }))}>
            {errors.submit}
          </Alert>
        )}

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mt: 1 }}>

          {/* Row 1: First Name | Last Name */}
          <FormRow>
            <TextField
              fullWidth required size={fieldSize}
              label="First Name" value={formData.firstName}
              onChange={handleChange("firstName")}
              error={!!errors.firstName} helperText={errors.firstName}
              InputProps={{
                startAdornment: <InputAdornment position="start"><PersonIcon sx={iconSx} /></InputAdornment>,
              }}
            />
            <TextField
              fullWidth required size={fieldSize}
              label="Last Name" value={formData.lastName}
              onChange={handleChange("lastName")}
              error={!!errors.lastName} helperText={errors.lastName}
              InputProps={{
                startAdornment: <InputAdornment position="start"><PersonIcon sx={iconSx} /></InputAdornment>,
              }}
            />
          </FormRow>

          {/* Row 2: Email (disabled) | Phone */}
          <FormRow>
            <TextField
              fullWidth size={fieldSize}
              label="Email Address" type="email"
              value={formData.email}
              onChange={handleChange("email")}
              disabled
              helperText="Email cannot be changed"
              InputProps={{
                startAdornment: <InputAdornment position="start"><EmailIcon sx={iconSx} /></InputAdornment>,
              }}
            />
            <TextField
              fullWidth required size={fieldSize}
              label="Phone Number" value={formData.phone}
              onChange={handleChange("phone")}
              error={!!errors.phone} helperText={errors.phone}
              InputProps={{
                startAdornment: <InputAdornment position="start"><PhoneIcon sx={iconSx} /></InputAdornment>,
              }}
            />
          </FormRow>

          {/* Row 3: Team Role | Department */}
          <FormRow>
            <FormControl fullWidth required size={fieldSize} error={!!errors.teamRole}>
              <InputLabel id="role-label">Team Role</InputLabel>
              <Select
                labelId="role-label" label="Team Role"
                value={formData.teamRole} onChange={handleChange("teamRole")}
                disabled={rolesLoading}
                startAdornment={<InputAdornment position="start"><WorkIcon sx={iconSx} /></InputAdornment>}
                MenuProps={MENU_PROPS}
              >
                <MenuItem value="" disabled>
                  <Typography color="text.secondary" fontSize="0.85rem">Select a role</Typography>
                </MenuItem>
                {activeRoles.map((role) => (
                  <MenuItem key={role._id || role.value} value={role.label || role.name}
                    sx={{ fontSize: "0.85rem" }}>
                    {role.label || role.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.teamRole && <FormHelperText>{errors.teamRole}</FormHelperText>}
            </FormControl>

            <FormControl fullWidth size={fieldSize}>
              <InputLabel id="dept-label">Department</InputLabel>
              <Select
                labelId="dept-label" label="Department"
                value={formData.department} onChange={handleChange("department")}
                disabled={deptLoading}
                startAdornment={<InputAdornment position="start"><BusinessIcon sx={iconSx} /></InputAdornment>}
                MenuProps={MENU_PROPS}
              >
                <MenuItem value="">
                  <Typography color="text.secondary" fontSize="0.85rem">Select a department</Typography>
                </MenuItem>
                {activeDepartments.map((dept) => (
                  <MenuItem key={dept._id || dept.value} value={dept.label || dept.name}
                    sx={{ fontSize: "0.85rem" }}>
                    {dept.label || dept.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </FormRow>

          {/* Row 4: Location | Bio */}
          <FormRow>
            <TextField
              fullWidth size={fieldSize}
              label="Location" value={formData.location}
              onChange={handleChange("location")}
              placeholder="e.g., New York, London, Tokyo"
              helperText="e.g., New York, London, Tokyo"
              InputProps={{
                startAdornment: <InputAdornment position="start"><LocationOnIcon sx={iconSx} /></InputAdornment>,
              }}
            />

            <TextField
              fullWidth size={fieldSize}
              label="Bio (Optional)" value={formData.bio}
              onChange={handleChange("bio")}
              placeholder="Brief description about the team member..."
              multiline rows={4}
              sx={{ "& .MuiInputBase-root": { alignItems: "flex-start", pt: 1 } }}
            />
          </FormRow>

          {/* Row 5: Status */}
          <FormRow>
            <FormControl fullWidth size={fieldSize}>
              <InputLabel id="status-label">Status</InputLabel>
              <Select
                labelId="status-label" label="Status"
                value={formData.status} onChange={handleChange("status")}
                MenuProps={MENU_PROPS}
                renderValue={(val) => {
                  const opt = STATUS_OPTIONS.find((o) => o.value === val);
                  return (
                    <Box display="flex" alignItems="center" gap={1}>
                      <FiberManualRecordIcon sx={{ fontSize: "0.6rem", color: opt?.color }} />
                      <span style={{ fontSize: "0.85rem" }}>{opt?.label}</span>
                    </Box>
                  );
                }}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: "0.85rem" }}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <FiberManualRecordIcon sx={{ fontSize: "0.6rem", color: opt.color }} />
                      {opt.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box />
          </FormRow>

        </Box>
      </DialogContent>

      {/* ── Footer ── */}
      <DialogActions
        sx={{
          px: { xs: 2, sm: 2.5 },
          pt: 1.25,
          pb: { xs: "calc(16px + env(safe-area-inset-bottom))", sm: 2.5 },
          gap: 1.5,
          borderTop: { xs: "1px solid #e5e7eb", sm: "none" },
        }}
      >
        <Button
          onClick={onClose} disabled={isBusy}
          variant="outlined"
          sx={{ textTransform: "none", borderRadius: 1.5, fontSize: "0.8rem", py: 0.75 }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit} variant="contained" disabled={isBusy}
          startIcon={isBusy ? <CircularProgress size={16} sx={{ color: "white" }} /> : <SaveIcon sx={{ fontSize: "1rem" }} />}
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
          {isBusy ? "Saving..." : "Save Changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditTeamMemberModal;

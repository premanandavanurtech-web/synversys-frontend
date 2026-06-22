import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Avatar,
  TextField,
  Button,
  Stack,
  IconButton,
  InputAdornment,
  alpha,
  Badge,
  Tooltip,
  Fade,
  Alert,
  Snackbar,
  Divider,
  Skeleton,
  Chip,
  LinearProgress,
  CircularProgress,
} from "@mui/material";
import { styled, keyframes } from "@mui/material/styles";
import { useTeam } from "../context/TeamContext";
import { useAuth } from "../context/AuthContexts";

import MailOutlineIcon from "@mui/icons-material/MailOutline";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import LockIcon from "@mui/icons-material/Lock";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import EmailIcon from "@mui/icons-material/Email";
import PhoneInTalkIcon from "@mui/icons-material/PhoneInTalk";
import HomeIcon from "@mui/icons-material/Home";
import WorkIcon from "@mui/icons-material/Work";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import KeyIcon from "@mui/icons-material/Key";
import BadgeIcon from "@mui/icons-material/Badge";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import AssignmentIcon from "@mui/icons-material/Assignment";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import BusinessIcon from "@mui/icons-material/Business";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";

// ─── Animations ────────────────────────────────────────────────────────────────
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
  60%       { box-shadow: 0 0 0 7px rgba(16, 185, 129, 0); }
`;

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  // Neutrals
  ink: "#0f1117",
  ink2: "#374151",
  ink3: "#6b7280",
  ink4: "#9ca3af",
  line: "#e5e7eb",
  line2: "#f3f4f6",
  surface: "#ffffff",
  bg: "#f9fafb",
  // Brand — slate-teal
  brand: "#095064",
  brandDark: "#0b4557",
  brandMid: "#105364",
  brandGhost: "#f0f9ff",
  brandBorder: "#bae6fd",
  // Status
  green: "#10b981",
  greenBg: "#ecfdf5",
  greenText: "#065f46",
  red: "#ef4444",
  redBg: "#fef2f2",
  amber: "#f59e0b",
  amberBg: "#fffbeb",
  amberText: "#92400e",
};

// ─── Styled components ────────────────────────────────────────────────────────
const Page = styled(Box)({
  minHeight: "100vh",
  background: T.bg,
  paddingBottom: 80,
});

const TopBar = styled(Box)({
  background: T.surface,
  borderBottom: `1px solid ${T.line}`,
  padding: "14px 28px",
  width: "1150px",
  marginLeft: "25px",
  borderRadius: "12px",
  zIndex: 10,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
});

const Card = styled(Paper)({
  background: T.surface,
  border: `1px solid ${T.line}`,
  borderRadius: 14,
  boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
  overflow: "hidden",
  animation: `${fadeUp} 0.4s ease both`,
});

const SectionHeader = styled(Box)({
  padding: "16px 22px",
  borderBottom: `1px solid ${T.line}`,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
});

const Body = styled(Box)({ padding: "22px" });

const Label = styled(Typography)({
  fontSize: "0.6875rem",
  fontWeight: 700,
  color: T.ink3,
  textTransform: "uppercase",
  letterSpacing: "0.55px",
  marginBottom: 5,
  display: "block",
});

const StyledField = styled(TextField)({
  "& .MuiOutlinedInput-root": {
    borderRadius: 9,
    fontSize: "0.8125rem",
    background: T.surface,
    "& fieldset": { borderColor: T.line, borderWidth: 1 },
    "&:hover fieldset": { borderColor: "#d1d5db" },
    "&.Mui-focused fieldset": { borderColor: T.brand, borderWidth: 1.5 },
    "&.Mui-focused": { boxShadow: `0 0 0 3px ${alpha(T.brand, 0.1)}` },
    "&.Mui-disabled": { background: T.line2 },
    "&.Mui-disabled fieldset": { borderColor: T.line },
  },
  "& .MuiInputBase-input": {
    fontSize: "0.8125rem",
    padding: "10px 13px",
    color: T.ink,
  },
  "& .MuiInputBase-input.Mui-disabled": {
    color: T.ink3,
    WebkitTextFillColor: T.ink3,
  },
  "& .MuiFormHelperText-root": { fontSize: "0.7rem", marginTop: 3 },
  "& .MuiInputLabel-root": { fontSize: "0.75rem" },
  "& input[type='password']::-ms-reveal": { display: "none" },
  "& input[type='password']::-ms-clear": { display: "none" },
  "& input::-webkit-credentials-auto-fill-button": { display: "none !important" },
});

const PrimaryBtn = styled(Button)({
  background: T.brand,
  color: "#fff",
  fontWeight: 600,
  fontSize: "0.75rem",
  padding: "8px 20px",
  borderRadius: 9,
  textTransform: "none",
  letterSpacing: "0.15px",
  boxShadow: `0 1px 4px ${alpha(T.brand, 0.25)}`,
  transition: "all 0.18s",
  "&:hover": {
    background: T.brandDark,
    boxShadow: `0 3px 10px ${alpha(T.brand, 0.35)}`,
  },
  "&.Mui-disabled": { background: T.line, color: T.ink4, boxShadow: "none" },
});

const OutlineBtn = styled(Button)({
  color: T.ink3,
  fontWeight: 500,
  fontSize: "0.75rem",
  padding: "8px 18px",
  borderRadius: 9,
  textTransform: "none",
  border: `1px solid ${T.line}`,
  background: T.surface,
  transition: "all 0.18s",
  "&:hover": { background: T.line2, borderColor: "#d1d5db", color: T.ink2 },
});

const IconBtn = styled(IconButton)({
  width: 32,
  height: 32,
  borderRadius: 8,
  border: `1px solid ${T.line}`,
  transition: "all 0.18s",
});

// ─── Sub-components ───────────────────────────────────────────────────────────
const InfoRow = ({ icon: Icon, label, value }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 0.6 }}>
    <Box sx={{
      width: 28, height: 28, borderRadius: 7, background: T.line2,
      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
    }}>
      <Icon sx={{ fontSize: "0.8rem", color: T.ink4 }} />
    </Box>
    <Box sx={{ minWidth: 0 }}>
      <Typography sx={{ fontSize: "0.6rem", color: T.ink4, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.4px" }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: "0.8rem", color: T.ink2, fontWeight: 500, lineHeight: 1.3 }} noWrap>
        {value || "—"}
      </Typography>
    </Box>
  </Box>
);

const IconBox = ({ children }) => (
  <Box sx={{
    width: 28, height: 28, borderRadius: 7, background: T.brandGhost,
    border: `1px solid ${T.brandBorder}`, display: "flex",
    alignItems: "center", justifyContent: "center",
    "& .MuiSvgIcon-root": { fontSize: "0.85rem", color: T.brand },
  }}>
    {children}
  </Box>
);

const StatCard = ({ icon: Icon, label, value, suffix = "", color = T.brand, bg = T.brandGhost }) => (
  <Box sx={{
    background: bg, borderRadius: 10, border: `1px solid ${alpha(color, 0.15)}`,
    padding: "12px 14px", display: "flex", alignItems: "center", gap: 1.25,
  }}>
    <Box sx={{
      width: 34, height: 34, borderRadius: 9, background: alpha(color, 0.12),
      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
    }}>
      <Icon sx={{ fontSize: "1rem", color }} />
    </Box>
    <Box>
      <Typography sx={{ fontSize: "0.6rem", color: T.ink4, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.4px" }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: T.ink, lineHeight: 1.2 }}>
        {value}<Typography component="span" sx={{ fontSize: "0.7rem", color: T.ink3, ml: 0.3 }}>{suffix}</Typography>
      </Typography>
    </Box>
  </Box>
);

// ─── Main profile content ────────────────────────────────────────────────────
const ProfileContent = () => {
  const { user } = useAuth();
  const {
    profile,
    loading: teamLoading,
    updateTeamProfile,
    uploadTeamAvatar,
    changePassword,
    formatDate,
    formatJoinDate,
    fetchTeamProfile,
  } = useTeam();

  const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false });
  const [isEditing, setIsEditing] = useState(false);
  const [passData, setPassData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [formData, setFormData] = useState({ firstName: "", lastName: "", phone: "", location: "", bio: "", department: "" });
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });
  const [passErrors, setPassErrors] = useState({});
  const [phoneError, setPhoneError] = useState("");
  const [saving, setSaving] = useState(false);
  const [changingPass, setChangingPass] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  useEffect(() => { fetchTeamProfile(); }, [fetchTeamProfile]);

  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        phone: profile.phone || "",
        // Location: use locationDetails.name if available, else fallback
        location: profile.locationDetails?.name || profile.location || "",
        bio: profile.bio || "",
        department: profile.departmentDetails?.name || profile.department || "",
      });
      setPhoneError("");
    }
  }, [profile]);

  const toast = (message, severity = "success") => setSnack({ open: true, message, severity });

  // ── Phone helpers ──
  const isValidPhone = (value) => !value || value.length === 10;

  const handlePhoneChange = (e) => {
    // Strip everything that isn't a digit, then hard-cap at 10 digits
    const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 10);
    setFormData((prev) => ({ ...prev, phone: digitsOnly }));

    if (digitsOnly.length === 0) {
      setPhoneError(""); // empty is allowed (phone optional)
    } else if (digitsOnly.length !== 10) {
      setPhoneError("Phone number must be exactly 10 digits");
    } else {
      setPhoneError("");
    }
  };

  const handleUpdateProfile = async () => {
    if (!isValidPhone(formData.phone)) {
      toast("Phone number must be exactly 10 digits", "error");
      return;
    }

    setSaving(true);
    // Send the raw location/department strings; backend resolves IDs
    const result = await updateTeamProfile(formData);
    setSaving(false);
    if (result.success) {
      toast(result.message, "success");
      setIsEditing(false);
      await fetchTeamProfile();
    } else {
      toast(result.error, "error");
    }
  };

  const handleChangePassword = async () => {
    if (!passData.currentPassword) { toast("Current password is required", "error"); return; }
    if (passData.newPassword.length < 6) { toast("Password must be at least 6 characters", "error"); return; }
    if (passData.newPassword !== passData.confirmPassword) { toast("New passwords do not match", "error"); return; }

    setChangingPass(true);
    const result = await changePassword(passData.currentPassword, passData.newPassword, passData.confirmPassword);
    setChangingPass(false);

    if (result.success) {
      toast(result.message, "success");
      setPassData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPassErrors({});
    } else {
      toast(result.error, "error");
    }
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast("Please choose an image file", "error");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast("Profile image must be 2MB or smaller", "error");
      return;
    }

    setAvatarUploading(true);
    const result = await uploadTeamAvatar(file);
    setAvatarUploading(false);

    if (result.success) {
      toast(result.message || "Profile image updated", "success");
      await fetchTeamProfile();
    } else {
      toast(result.error || "Failed to upload profile image", "error");
    }
  };

  const handlePassChange = (e) => {
    const { name, value } = e.target;
    const next = { ...passData, [name]: value };
    setPassData(next);
    const errs = {};
    if (name === "newPassword" && value.length > 0 && value.length < 6) errs.newPassword = "At least 6 characters";
    if (name === "confirmPassword" && value !== next.newPassword) errs.confirmPassword = "Passwords do not match";
    if (name === "newPassword" && next.confirmPassword && value !== next.confirmPassword) errs.confirmPassword = "Passwords do not match";
    setPassErrors(errs);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setPhoneError("");
    if (profile) {
      setFormData({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        phone: profile.phone || "",
        location: profile.locationDetails?.name || profile.location || "",
        bio: profile.bio || "",
        department: profile.departmentDetails?.name || profile.department || "",
      });
    }
  };

  // ── Derived display values ──
  const getInitials = () => {
    if (profile?.firstName && profile?.lastName)
      return `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase();
    return profile?.email?.[0]?.toUpperCase() || "?";
  };

  const getFullName = () => {
    if (profile?.firstName && profile?.lastName) return `${profile.firstName} ${profile.lastName}`;
    return profile?.email?.split("@")[0] || "Team Member";
  };

  const getRoleDisplay = () =>
    profile?.roleDetails?.name || profile?.teamRole || profile?.customRole || profile?.role || "Team Member";

  const getDeptName = () =>
    profile?.departmentDetails?.name || profile?.department || "—";

  const getLocName = () =>
    profile?.locationDetails?.name || profile?.location || "—";

  const isActive = profile?.status === "active";

  // Loading skeleton
  if (teamLoading && !profile) {
    return (
      <Page>
        <TopBar>
          <Skeleton width={140} height={22} />
        </TopBar>
        <Container maxWidth="xl" sx={{ pt: 4, px: { xs: 2, sm: 3 } }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <Card sx={{ p: 3 }}>
                <Skeleton variant="circular" width={72} height={72} sx={{ mx: "auto", mb: 1.5 }} />
                <Skeleton variant="text" width="60%" sx={{ mx: "auto", mb: 0.5 }} />
                <Skeleton variant="text" width="45%" sx={{ mx: "auto", mb: 2 }} />
                {[1, 2, 3, 4].map(i => <Skeleton key={i} height={36} sx={{ mb: 0.5, borderRadius: 1 }} />)}
              </Card>
            </Grid>
            <Grid item xs={12} md={9}>
              <Card sx={{ p: 3 }}>
                <Skeleton height={28} width="35%" sx={{ mb: 2.5 }} />
                <Grid container spacing={2}>
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <Grid item xs={12} sm={6} key={i}>
                      <Skeleton height={52} sx={{ borderRadius: 1.5 }} />
                    </Grid>
                  ))}
                </Grid>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Page>
    );
  }

  return (
    <Page>
      {/* ── Top bar ── */}
      <TopBar>
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", color: T.ink }}>
            My Profile
          </Typography>
          <Typography sx={{ fontSize: "0.72rem", color: T.ink4 }}>
            Manage your personal information and security settings
          </Typography>
        </Box>
        <Chip
          label={isActive ? "Active" : "Inactive"}
          size="small"
          sx={{
            fontSize: "0.7rem",
            fontWeight: 600,
            background: isActive ? T.greenBg : T.redBg,
            color: isActive ? T.greenText : T.red,
            border: `1px solid ${isActive ? alpha(T.green, 0.25) : alpha(T.red, 0.25)}`,
            "& .MuiChip-label": { px: 1.25 },
          }}
        />
      </TopBar>

      <Container maxWidth="xl" sx={{ pt: 3.5, px: { xs: 2, sm: 3 } }}>
        <Grid container spacing={3}>

          {/* ── Left: Profile card ── */}
          <Grid item xs={12} md={3}>
            <Card sx={{ animationDelay: "0ms" }}>
              {/* Hero strip */}
              <Box sx={{
                height: 68,
                background: `linear-gradient(130deg, ${T.brand} 0%, ${T.brandMid} 100%)`,
              }} />

              <Body sx={{ pt: 0 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", mt: "-32px", mb: 1.75 }}>
                  <Box sx={{ position: "relative", width: 70, height: 70 }}>
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                      badgeContent={
                        <Box sx={{
                          width: 11, height: 11,
                          bgcolor: isActive ? T.green : T.red,
                          border: "2px solid #fff", borderRadius: "50%",
                          animation: isActive ? `${pulse} 2.5s ease infinite` : "none",
                        }} />
                      }
                    >
                      <Avatar
                        src={profile?.avatarUrl || undefined}
                        sx={{
                          width: 64, height: 64,
                          background: `linear-gradient(135deg, ${T.brand}, ${T.brandMid})`,
                          border: "3px solid #fff",
                          boxShadow: `0 3px 10px ${alpha(T.brand, 0.3)}`,
                          fontSize: "1.2rem", fontWeight: 800,
                        }}
                      >
                        {getInitials()}
                      </Avatar>
                    </Badge>
                    <Tooltip title="Upload profile image" arrow>
                      <IconButton
                        component="label"
                        size="small"
                        disabled={avatarUploading}
                        sx={{
                          position: "absolute",
                          left: -2,
                          bottom: 0,
                          width: 26,
                          height: 26,
                          bgcolor: "#fff",
                          color: T.brand,
                          border: `1px solid ${T.line}`,
                          boxShadow: `0 2px 8px ${alpha(T.brand, 0.2)}`,
                          "&:hover": { bgcolor: T.brandGhost },
                        }}
                      >
                        {avatarUploading ? (
                          <CircularProgress size={14} />
                        ) : (
                          <PhotoCameraIcon sx={{ fontSize: 15 }} />
                        )}
                        <input
                          hidden
                          accept="image/png,image/jpeg,image/jpg,image/webp"
                          type="file"
                          onChange={handleAvatarChange}
                        />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Chip
                    label={getRoleDisplay()}
                    size="small"
                    sx={{
                      fontSize: "0.65rem", fontWeight: 700,
                      background: T.brandGhost, color: T.brand,
                      border: `1px solid ${T.brandBorder}`,
                      borderRadius: 6, "& .MuiChip-label": { px: 1 },
                    }}
                  />
                </Box>

                <Typography sx={{ fontWeight: 800, fontSize: "1rem", color: T.ink, lineHeight: 1.2 }}>
                  {getFullName()}
                </Typography>
                <Typography sx={{ fontSize: "0.775rem", color: T.ink4, mb: 2 }}>
                  {profile?.email}
                </Typography>

                <Divider sx={{ borderColor: T.line, mb: 1.75 }} />

                <Stack spacing={0.4}>
                  <InfoRow icon={MailOutlineIcon} label="Email" value={profile?.email} />
                  <InfoRow icon={PhoneIcon} label="Phone" value={profile?.phone || "Not provided"} />
                  <InfoRow icon={BusinessIcon} label="Department" value={getDeptName()} />
                  <InfoRow icon={LocationOnIcon} label="Location" value={getLocName()} />
                  <InfoRow icon={BadgeIcon} label="Role" value={getRoleDisplay()} />
                  <InfoRow icon={CalendarTodayIcon} label="Joined" value={formatJoinDate(profile?.joinDate || profile?.createdAt)} />
                  {(profile?.lastActiveAt || profile?.lastLogin) && (
                    <InfoRow icon={AccessTimeIcon} label="Last active" value={formatDate(profile?.lastActiveAt || profile?.lastLogin)} />
                  )}
                </Stack>

                {/* Admin info */}
                {profile?.adminId?.customerName && (
                  <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${T.line}` }}>
                    <Typography sx={{ fontSize: "0.6rem", color: T.ink4, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.4px", mb: 0.5 }}>
                      Organisation
                    </Typography>
                    <Typography sx={{ fontSize: "0.8rem", color: T.ink2, fontWeight: 500 }}>
                      {profile.adminId.customerName}
                    </Typography>
                    <Typography sx={{ fontSize: "0.72rem", color: T.ink4 }}>
                      {profile.adminId.email}
                    </Typography>
                  </Box>
                )}

                {/* Bio */}
                {profile?.bio && (
                  <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${T.line}` }}>
                    <Typography sx={{ fontSize: "0.6rem", color: T.ink4, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.4px", mb: 0.75 }}>
                      About
                    </Typography>
                    <Typography sx={{ fontSize: "0.8rem", color: T.ink3, lineHeight: 1.65 }}>
                      {profile.bio}
                    </Typography>
                  </Box>
                )}
              </Body>
            </Card>

            {/* Security card */}
            <Card sx={{ animationDelay: "200ms", width: "400px", mt: 3 }}>
              <SectionHeader>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                  <IconBox><KeyIcon /></IconBox>
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: "0.85rem", color: T.ink }}>
                      Security
                    </Typography>
                    <Typography sx={{ fontSize: "0.68rem", color: T.ink4 }}>
                      Update your password to keep the account secure
                    </Typography>
                  </Box>
                </Box>
              </SectionHeader>

              <Body>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Label>Current Password</Label>
                    <StyledField
                      fullWidth size="small" name="currentPassword"
                      type={showPass.current ? "text" : "password"}
                      placeholder="Current password"
                      value={passData.currentPassword}
                      onChange={handlePassChange}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPass(p => ({ ...p, current: !p.current }))}
                              edge="end" size="small"
                            >
                              {showPass.current
                                ? <VisibilityOffIcon sx={{ fontSize: "0.85rem", color: T.ink4 }} />
                                : <VisibilityIcon sx={{ fontSize: "0.85rem", color: T.ink4 }} />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <Label>New Password</Label>
                    <StyledField
                      fullWidth size="small" name="newPassword"
                      type={showPass.new ? "text" : "password"}
                      placeholder="Min. 6 characters"
                      value={passData.newPassword}
                      onChange={handlePassChange}
                      error={!!passErrors.newPassword}
                      helperText={passErrors.newPassword}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPass(p => ({ ...p, new: !p.new }))}
                              edge="end" size="small"
                            >
                              {showPass.new
                                ? <VisibilityOffIcon sx={{ fontSize: "0.85rem", color: T.ink4 }} />
                                : <VisibilityIcon sx={{ fontSize: "0.85rem", color: T.ink4 }} />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <Label>Confirm New Password</Label>
                    <StyledField
                      fullWidth size="small" name="confirmPassword"
                      type={showPass.confirm ? "text" : "password"}
                      placeholder="Re-enter new password"
                      value={passData.confirmPassword}
                      onChange={handlePassChange}
                      error={!!passErrors.confirmPassword}
                      helperText={passErrors.confirmPassword}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPass(p => ({ ...p, confirm: !p.confirm }))}
                              edge="end" size="small"
                            >
                              {showPass.confirm
                                ? <VisibilityOffIcon sx={{ fontSize: "0.85rem", color: T.ink4 }} />
                                : <VisibilityIcon sx={{ fontSize: "0.85rem", color: T.ink4 }} />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                      <PrimaryBtn
                        startIcon={<LockIcon sx={{ fontSize: "0.85rem" }} />}
                        onClick={handleChangePassword}
                        disabled={
                          changingPass || !passData.currentPassword ||
                          !passData.newPassword || !passData.confirmPassword ||
                          Object.keys(passErrors).length > 0
                        }
                      >
                        {changingPass ? "Updating…" : "Update Password"}
                      </PrimaryBtn>
                    </Box>
                  </Grid>
                </Grid>
              </Body>
            </Card>
          </Grid>

          {/* ── Right: Details + Security ── */}
          <Grid item xs={12} md={9}>
            <Stack spacing={3}>

              {/* Personal information */}
              <Card sx={{ animationDelay: "120ms", width: "730px" }}>
                <SectionHeader>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                    <IconBox><PersonOutlineIcon /></IconBox>
                    <Box>
                      <Typography sx={{ fontWeight: 700, fontSize: "0.85rem", color: T.ink }}>
                        Personal Information
                      </Typography>
                      <Typography sx={{ fontSize: "0.68rem", color: T.ink4 }}>
                        {isEditing ? "Editing your profile" : "View and update your details"}
                      </Typography>
                    </Box>
                  </Box>
                  <Tooltip title={isEditing ? "Discard changes" : "Edit profile"} arrow>
                    <IconBtn
                      size="small"
                      onClick={() => isEditing ? cancelEdit() : setIsEditing(true)}
                      sx={{
                        color: isEditing ? T.red : T.brand,
                        bgcolor: isEditing ? T.redBg : T.brandGhost,
                        borderColor: isEditing ? alpha(T.red, 0.25) : T.brandBorder,
                        "&:hover": { bgcolor: isEditing ? alpha(T.red, 0.12) : alpha(T.brand, 0.1) },
                      }}
                    >
                      {isEditing ? <CancelIcon sx={{ fontSize: "0.9rem" }} /> : <EditIcon sx={{ fontSize: "0.9rem" }} />}
                    </IconBtn>
                  </Tooltip>
                </SectionHeader>

                <Body>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} sx={{ width: "300px" }}>
                      <Label>First Name</Label>
                      <StyledField
                        fullWidth size="small" name="firstName" placeholder="First name"
                        value={formData.firstName} disabled={!isEditing}
                        onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} sx={{ width: "300px" }}>
                      <Label>Last Name</Label>
                      <StyledField
                        fullWidth size="small" name="lastName" placeholder="Last name"
                        value={formData.lastName} disabled={!isEditing}
                        onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                      />
                    </Grid>

                    <Grid item xs={12} sx={{ width: "300px" }}>
                      <Label>Email Address</Label>
                      <StyledField
                        fullWidth size="small" type="email"
                        value={profile?.email || ""} disabled
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <EmailIcon sx={{ fontSize: "0.8rem", color: T.ink4 }} />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <Chip label="Verified" size="small" sx={{
                                fontSize: "0.62rem", fontWeight: 600, height: 20,
                                background: T.greenBg, color: T.greenText,
                                border: `1px solid ${alpha(T.green, 0.25)}`,
                                "& .MuiChip-label": { px: 0.9 },
                              }} />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>

                    {/* ── PHONE NUMBER FIELD (fixed) ── */}
                    <Grid item xs={12} sm={6} sx={{ width: "300px" }}>
                      <Label>Phone Number</Label>
                      <StyledField
                        fullWidth
                        size="small"
                        name="phone"
                        type="tel"
                        placeholder="10-digit phone number"
                        value={formData.phone}
                        disabled={!isEditing}
                        onChange={handlePhoneChange}
                        error={!!phoneError}
                        helperText={phoneError}
                        inputProps={{
                          maxLength: 10,
                          inputMode: "numeric",
                          pattern: "[0-9]*",
                        }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PhoneInTalkIcon sx={{ fontSize: "0.8rem", color: T.ink4 }} />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6} sx={{ width: "300px" }}>
                      <Label>Department</Label>
                      <StyledField
                        fullWidth size="small" name="department" placeholder="Your department"
                        value={formData.department} disabled={!isEditing}
                        onChange={e => setFormData({ ...formData, department: e.target.value })}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <WorkIcon sx={{ fontSize: "0.8rem", color: T.ink4 }} />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sx={{ width: "300px" }}>
                      <Label>Location</Label>
                      <StyledField
                        fullWidth size="small" name="location" placeholder="City or region"
                        value={formData.location} disabled={!isEditing}
                        onChange={e => setFormData({ ...formData, location: e.target.value })}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <HomeIcon sx={{ fontSize: "0.8rem", color: T.ink4 }} />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sx={{ width: "350px" }}>
                      <Label>About Me</Label>
                      {isEditing ? (
                        <StyledField
                          fullWidth multiline rows={3} name="bio"
                          placeholder="A short description about yourself…"
                          value={formData.bio}
                          onChange={e => setFormData({ ...formData, bio: e.target.value })}
                        />
                      ) : (
                        <Box sx={{
                          minHeight: 72, px: 1.5, py: 1.25, borderRadius: 1.25,
                          border: `1px solid ${T.line}`, background: T.line2,
                        }}>
                          {formData.bio ? (
                            <Typography sx={{ fontSize: "0.8rem", color: T.ink3, lineHeight: 1.65 }}>
                              {formData.bio}
                            </Typography>
                          ) : (
                            <Typography sx={{ fontSize: "0.8rem", color: T.ink4, fontStyle: "italic" }}>
                              No bio added yet. Click edit to add one.
                            </Typography>
                          )}
                        </Box>
                      )}
                    </Grid>
                  </Grid>

                  <Fade in={isEditing} unmountOnExit>
                    <Box sx={{
                      display: "flex", justifyContent: "flex-end",
                      gap: 1.5, mt: 3, pt: 2.5, borderTop: `1px solid ${T.line}`,
                    }}>
                      <OutlineBtn onClick={cancelEdit} disabled={saving}>Cancel</OutlineBtn>
                      <PrimaryBtn
                        startIcon={<SaveIcon sx={{ fontSize: "0.85rem" }} />}
                        onClick={handleUpdateProfile}
                        disabled={saving || !!phoneError}
                      >
                        {saving ? "Saving…" : "Save changes"}
                      </PrimaryBtn>
                    </Box>
                  </Fade>
                </Body>
              </Card>
            </Stack>
          </Grid>
        </Grid>

        <Box sx={{ textAlign: "center", mt: 7, pt: 2.5, borderTop: `1px solid ${T.line}` }}>
          <Typography sx={{ fontSize: "0.65rem", color: T.ink4 }}>
            © 2026 Asset Management System · Profile v2.0
          </Typography>
        </Box>
      </Container>

      <Snackbar
        open={snack.open}
        autoHideDuration={5000}
        onClose={() => setSnack(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnack(s => ({ ...s, open: false }))}
          severity={snack.severity}
          sx={{ borderRadius: 2.5, fontSize: "0.75rem", boxShadow: "0 8px 24px rgba(0,0,0,0.1)" }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Page>
  );
};

// ─── Root export ──────────────────────────────────────────────────────────────
const TeamProfile = () => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <Typography>Please login to view your profile.</Typography>
      </Box>
    );
  }

  if (user?.role !== "team") {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <Typography>Access denied. Team members only.</Typography>
      </Box>
    );
  }

  return <ProfileContent />;
};

export default TeamProfile;
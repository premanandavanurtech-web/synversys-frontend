import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
  Alert,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  Switch,
  TextField,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import PaletteOutlinedIcon from "@mui/icons-material/PaletteOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import StorageOutlinedIcon from "@mui/icons-material/StorageOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import { useAuth } from "../context/AuthContexts";
import {
  DATE_FORMAT_OPTIONS,
  LANGUAGE_OPTIONS,
  TIMEZONE_OPTIONS,
  DEFAULT_PREFERENCES,
  usePreferences,
} from "../context/PreferencesContext";

const settingsTabs = [
  // {
  //   id: "notifications",
  //   label: "Notifications",
  //   icon: NotificationsNoneOutlinedIcon,
  // },
  { id: "security", label: "Security", icon: LockOutlinedIcon },
  { id: "preferences", label: "Preferences", icon: PublicOutlinedIcon },
  { id: "appearance", label: "Appearance", icon: PaletteOutlinedIcon },
  // { id: "admin", label: "Admin Controls", icon: ShieldOutlinedIcon },
  // { id: "system", label: "System Settings", icon: StorageOutlinedIcon },
];

const notificationOptions = [
  ["Email Notifications", "Receive notifications via email", true],
  ["Task Assignments", "Get notified when assigned new tasks", true],
  ["Inspection Reminders", "Reminders for upcoming inspections", true],
  ["Team Updates", "Updates from your team members", false],
  ["System Alerts", "Important system notifications", true],
];

const ACTIVE_NAV_COLOR = "#15576A";
const THEME_STORAGE_KEY = "assetmach-theme-mode";
const THEME_EXPLICIT_STORAGE_KEY = "assetmach-theme-mode-explicit";
const DEFAULT_THEME_MODE = "light";

const getReadableMessage = (value, fallback) => {
  if (!value) return fallback;
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    return (
      value
        .map((item) => getReadableMessage(item, ""))
        .filter(Boolean)
        .join(", ") || fallback
    );
  }
  if (typeof value === "object") {
    return (
      value.message ||
      value.msg ||
      value.error ||
      value.details ||
      getReadableMessage(value.errors, "") ||
      fallback
    );
  }
  return String(value);
};

// ─── Toast styling — matches Login page's authToastSx exactly ─────────────
const getSettingsToastSx = (theme, severity = "success") => {
  const isDark = theme.palette.mode === "dark";
  const isSuccess = severity === "success";
  const tone = isSuccess
    ? isDark
      ? "#4ade80"
      : "#0f766e"
    : isDark
      ? "#f87171"
      : "#dc2626";

  return {
    width: "100%",
    minWidth: { xs: "auto", sm: 320 },
    maxWidth: { xs: "calc(100vw - 32px)", sm: 420 },
    borderRadius: "10px",
    fontFamily: theme.typography.fontFamily,
    fontSize: { xs: "0.8rem", sm: "0.84rem" },
    fontWeight: 700,
    letterSpacing: 0,
    alignItems: "center",
    color: isDark
      ? isSuccess
        ? "#bbf7d0"
        : "#fecaca"
      : isSuccess
        ? "#14532d"
        : "#7f1d1d",
    bgcolor: isDark
      ? isSuccess
        ? "#10281f"
        : "#351616"
      : isSuccess
        ? "#ecfdf5"
        : "#fef2f2",
    border: `1px solid ${alpha(tone, isDark ? 0.42 : 0.28)}`,
    boxShadow: isDark
      ? "0 18px 40px rgba(0,0,0,0.45)"
      : "0 18px 40px rgba(15,23,42,0.14)",
    "& .MuiAlert-icon": {
      color: tone,
      opacity: 1,
      mr: 1.25,
    },
    "& .MuiAlert-message": {
      py: 0.2,
    },
    "& .MuiAlert-action": {
      color: isDark
        ? isSuccess
          ? "#bbf7d0"
          : "#fecaca"
        : isSuccess
          ? "#14532d"
          : "#7f1d1d",
      pl: 1,
      mr: -0.75,
    },
    "& .MuiAlert-action .MuiIconButton-root": {
      color: isDark
        ? isSuccess
          ? "#bbf7d0"
          : "#fecaca"
        : isSuccess
          ? "#14532d"
          : "#7f1d1d",
    },
  };
};

function SectionHeader({ icon: Icon, title, subtitle }) {
  const theme = useTheme();

  return (
    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2.5 }}>
      <Box
        sx={{
          width: 38,
          height: 38,
          borderRadius: "50%",
          display: "grid",
          placeItems: "center",
          bgcolor: alpha(theme.palette.primary.main, 0.1),
          color: theme.palette.primary.main,
        }}
      >
        <Icon fontSize="small" />
      </Box>
      <Box>
        <Typography sx={{ color: "text.primary", fontWeight: 600, fontSize: 18 }}>
          {title}
        </Typography>
        <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
          {subtitle}
        </Typography>
      </Box>
    </Stack>
  );
}

function SettingsCard({ children }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, md: 2.5 },
        borderRadius: 2,
        border: `1px solid ${isDark ? "rgba(148, 163, 184, 0.18)" : "#e5e7eb"}`,
        boxShadow: isDark
          ? "0 18px 40px rgba(0, 0, 0, 0.24)"
          : "0 1px 4px rgba(15, 23, 42, 0.08)",
        bgcolor: isDark ? "rgba(12, 23, 38, 0.88)" : "#fff",
        backdropFilter: isDark ? "blur(18px)" : "none",
      }}
    >
      {children}
    </Paper>
  );
}

export default function Settings() {
  const theme = useTheme();
  const { post } = useAuth();
  const { preferences, savePreferences } = usePreferences();
  const [activeTab, setActiveTab] = useState("security");
  const [preferenceForm, setPreferenceForm] = useState(() => ({
    ...DEFAULT_PREFERENCES,
    ...preferences,
  }));
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [toggles, setToggles] = useState(() =>
    Object.fromEntries(notificationOptions.map(([label, , enabled]) => [label, enabled])),
  );
  const [compactMode, setCompactMode] = useState(false);
  const [themeChoice, setThemeChoice] = useState(
    () => localStorage.getItem(THEME_STORAGE_KEY) || DEFAULT_THEME_MODE,
  );
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState({ open: false, severity: "success", message: "" });

  const activeConfig = useMemo(
    () => settingsTabs.find((tab) => tab.id === activeTab) || settingsTabs[0],
    [activeTab],
  );

  React.useEffect(() => {
    setPreferenceForm({ ...DEFAULT_PREFERENCES, ...preferences });
  }, [preferences]);

  const passwordFields = [
    ["currentPassword", "Current Password", "Enter current password"],
    ["newPassword", "New Password", "Enter new password"],
    ["confirmPassword", "Confirm New Password", "Confirm new password"],
  ];

  const handlePasswordChange = (field) => (event) => {
    setPasswordForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const showNotice = (severity, message) => {
    setNotice({ open: true, severity, message });
  };

  const handleThemeChoice = (mode) => {
    setThemeChoice(mode);
    localStorage.setItem(THEME_STORAGE_KEY, mode);
    localStorage.setItem(THEME_EXPLICIT_STORAGE_KEY, "true");
    window.dispatchEvent(new CustomEvent("assetmach-theme-change", { detail: { mode } }));
    showNotice("success", `${mode[0].toUpperCase()}${mode.slice(1)} mode applied.`);
  };

  const handlePreferenceChange = (field) => (event) => {
    const nextPreferences = { ...preferenceForm, [field]: event.target.value };
    setPreferenceForm(nextPreferences);
  };

  const handleSaveChanges = async () => {
    if (activeTab === "preferences") {
      setSaving(true);
      const result = await savePreferences(preferenceForm);
      setSaving(false);
      showNotice(
        result.success ? "success" : "error",
        result.success ? "Preferences applied across the app." : result.error,
      );
      return;
    }

    if (activeTab !== "security") {
      showNotice("success", "Settings saved successfully.");
      return;
    }

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      showNotice("error", "Please fill all password fields.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showNotice("error", "New password and confirm password do not match.");
      return;
    }

    setSaving(true);
    try {
      const response = await post("/auth/change-password", passwordForm);
      showNotice(
        "success",
        getReadableMessage(response?.message, "Password changed successfully."),
      );
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      const message = getReadableMessage(
        error?.response?.data?.errors ||
          error?.response?.data?.message ||
          error?.response?.data?.error,
        "Unable to change password. Please try again.",
      );
      showNotice("error", message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ color: "text.primary" }}>
      <Box sx={{ mb: 2.5 }}>
        <Typography
          sx={{
            color: theme.palette.primary.main,
            fontWeight: 600,
            mb: 0.25,
            fontSize: 30,
            lineHeight: 1.2,
          }}
        >
          Settings
        </Typography>
        <Typography sx={{ color: "text.secondary", fontSize: 15 }}>
          Manage your account settings and preferences
        </Typography>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "300px 1fr" }, gap: 2.5 }}>
        <SettingsCard>
          <Stack spacing={0.75}>
            {settingsTabs.map(({ id, label, icon: Icon }) => {
              const selected = id === activeTab;

              return (
                <Button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  startIcon={<Icon />}
                  sx={{
                    justifyContent: "flex-start",
                    px: 1.75,
                    py: 1.05,
                    borderRadius: 2,
                    textTransform: "none",
                    fontSize: 14,
                    fontWeight: selected ? 600 : 500,
                    color: selected ? "#fff" : "text.secondary",
                    bgcolor: selected ? ACTIVE_NAV_COLOR : "transparent",
                    transition:
                      "background-color 220ms ease, color 220ms ease, transform 180ms ease",
                    "&:hover": {
                      bgcolor: selected
                        ? ACTIVE_NAV_COLOR
                        : alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.14 : 0.06),
                      transform: "translateX(3px)",
                    },
                  }}
                >
                  {label}
                </Button>
              );
            })}
          </Stack>
        </SettingsCard>

        <Box>
          {activeTab === "notifications" && (
            <SettingsCard>
              <SectionHeader
                icon={activeConfig.icon}
                title="Notification Settings"
                subtitle="Manage how you receive notifications"
              />
              {notificationOptions.map(([label, subtitle], index) => (
                <Box key={label}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ py: 1.35 }}>
                    <Box>
                      <Typography sx={{ fontWeight: 600, fontSize: 14 }}>{label}</Typography>
                      <Typography sx={{ color: "text.secondary", fontSize: 13 }}>
                        {subtitle}
                      </Typography>
                    </Box>
                    <Switch
                      checked={Boolean(toggles[label])}
                      onChange={(event) =>
                        setToggles((prev) => ({ ...prev, [label]: event.target.checked }))
                      }
                    />
                  </Stack>
                  {index < notificationOptions.length - 1 && <Divider />}
                </Box>
              ))}
            </SettingsCard>
          )}

          {activeTab === "security" && (
            <SettingsCard>
              <SectionHeader icon={activeConfig.icon} title="Security Settings" subtitle="Manage your account security" />
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "minmax(320px, 420px) 1fr" },
                  gap: 3,
                  alignItems: "start",
                }}
              >
                <Stack spacing={1.75}>
                  {passwordFields.map(([field, label, placeholder]) => (
                    <Box key={field}>
                      <Typography sx={{ color: "text.secondary", fontSize: 13, fontWeight: 600, mb: 0.75 }}>
                        {label}
                      </Typography>
                      <TextField
                        placeholder={placeholder}
                        type={showPassword[field] ? "text" : "password"}
                        value={passwordForm[field]}
                        onChange={handlePasswordChange(field)}
                        fullWidth
                        size="small"
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                aria-label={showPassword[field] ? `Hide ${label}` : `Show ${label}`}
                                edge="end"
                                onClick={() => togglePasswordVisibility(field)}
                                size="small"
                              >
                                {showPassword[field] ? (
                                  <VisibilityOffOutlinedIcon fontSize="small" />
                                ) : (
                                  <VisibilityOutlinedIcon fontSize="small" />
                                )}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            height: 42,
                            borderRadius: 1.5,
                            bgcolor: theme.palette.mode === "dark" ? "rgba(15, 28, 46, 0.72)" : "#fbfcfd",
                          },
                          "& .MuiOutlinedInput-input": {
                            fontSize: 14,
                          },
                        }}
                      />
                    </Box>
                  ))}
                </Stack>

                <Box
                  sx={{
                    borderLeft: { xs: "none", md: "1px solid #e5e7eb" },
                    pl: { xs: 0, md: 3 },
                    pt: { xs: 0.5, md: 0 },
                  }}
                >
                  <Typography sx={{ color: "text.secondary", fontSize: 13, fontWeight: 700, mb: 1 }}>
                    Password Requirements
                  </Typography>
                  <Stack spacing={0.75} sx={{ color: "text.secondary", fontSize: 13, mb: 2.5 }}>
                    {[
                      "Minimum 8 characters",
                      "Use uppercase and lowercase letters",
                      "Include a number and special character",
                    ].map((text) => (
                      <Typography key={text} sx={{ fontSize: 13 }}>
                        {text}
                      </Typography>
                    ))}
                  </Stack>
                  {/* <Divider sx={{ mb: 2 }} /> */}
                  {/* <FormControlLabel 
                    control={<Switch />}
                    label={
                      <Box>
                        <Typography sx={{ fontSize: 14, fontWeight: 600 }}>Two-Factor Authentication</Typography>
                        <Typography sx={{ color: "text.secondary", fontSize: 13 }}>
                          Add an extra layer of security
                        </Typography>
                      </Box>
                    }
                    sx={{ m: 0, width: "100%", justifyContent: "space-between" }}
                    labelPlacement="start"
                  /> */}
                </Box>
              </Box>
            </SettingsCard>
          )}

          {activeTab === "preferences" && (
            <SettingsCard>
              <SectionHeader icon={activeConfig.icon} title="Preferences" subtitle="Customize your experience" />
              {[
                ["Language", "language", LANGUAGE_OPTIONS],
                ["Timezone", "timezone", TIMEZONE_OPTIONS],
                ["Date Format", "dateFormat", DATE_FORMAT_OPTIONS],
              ].map(([label, field, options]) => (
                <Box key={label} sx={{ mb: 2.5 }}>
                  <Typography sx={{ fontWeight: 600, mb: 1, fontSize: 14 }}>
                    {label}
                  </Typography>
                  <Select
                    value={preferenceForm[field]}
                    onChange={handlePreferenceChange(field)}
                    fullWidth
                    size="small"
                  >
                    {options.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </Box>
              ))}
            </SettingsCard>
          )}

          {activeTab === "appearance" && (
            <SettingsCard>
              <SectionHeader icon={activeConfig.icon} title="Appearance" subtitle="Customize the look and feel" />
              <Typography sx={{ fontWeight: 600, mb: 1.5, fontSize: 14 }}>
                Theme
              </Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" }, gap: 2, mb: 2.5 }}>
                {["Light", "Dark", "Auto"].map((mode) => {
                  const modeValue = mode.toLowerCase();
                  const selected = themeChoice === modeValue;

                  return (
                    <Box
                      key={mode}
                      onClick={() => handleThemeChoice(modeValue)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          handleThemeChoice(modeValue);
                        }
                      }}
                      sx={{
                        p: 1.25,
                        borderRadius: 2,
                        border: selected
                          ? `1.5px solid ${theme.palette.primary.main}`
                          : `1px solid ${theme.palette.divider}`,
                        cursor: "pointer",
                        bgcolor: selected
                          ? alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.12 : 0.03)
                          : "transparent",
                        transition: "border-color 180ms ease, background-color 180ms ease, transform 180ms ease",
                        "&:hover": {
                          borderColor: theme.palette.primary.main,
                          transform: "translateY(-1px)",
                        },
                      }}
                    >
                      <Box
                        sx={{
                          height: 54,
                          borderRadius: 1.5,
                          mb: 1,
                          bgcolor:
                            mode === "Light"
                              ? "#eef0f3"
                              : mode === "Dark"
                                ? "#0b1422"
                                : "linear-gradient(180deg, #e5e7eb 0%, #0b1422 100%)",
                        }}
                      />
                      <Typography align="center" sx={{ fontSize: 13 }}>
                        {mode}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
              {/* <Divider sx={{ mb: 2 }} /> */}
              {/* <FormControlLabel
                control={<Switch checked={compactMode} onChange={(event) => setCompactMode(event.target.checked)} />}
                label={
                  <Box>
                    <Typography sx={{ fontWeight: 600, fontSize: 14 }}>Compact Mode</Typography>
                    <Typography sx={{ color: "text.secondary", fontSize: 13 }}>
                      Reduce spacing for denser layout
                    </Typography>
                  </Box>
                }
                sx={{ m: 0, width: "100%", justifyContent: "space-between" }}
                labelPlacement="start"
              /> */}
            </SettingsCard>
          )}

          {(activeTab === "admin" || activeTab === "system") && (
            <SettingsCard>
              <SectionHeader
                icon={activeConfig.icon}
                title={activeConfig.label}
                subtitle={activeTab === "admin" ? "Manage administrative controls" : "Configure system defaults"}
              />
              <Stack spacing={2}>
                {["Require approval for critical changes", "Enable audit trail", "Send daily summary"].map((label) => (
                  <FormControlLabel key={label} control={<Switch defaultChecked />} label={label} />
                ))}
              </Stack>
            </SettingsCard>
          )}

          <Stack direction="row" justifyContent="flex-end" spacing={1.5} sx={{ mt: 3 }}>
            <Button variant="outlined" sx={{ textTransform: "none" }}>
              Reset to Defaults
            </Button>
            <Button
              variant="contained"
              disabled={saving}
              onClick={handleSaveChanges}
              sx={{ textTransform: "none" }}
            >
              {saving ? "Saving..." : "Save All Changes"}
            </Button>
          </Stack>
        </Box>
      </Box>

      {/* Notification Snackbar — styled to match the Login page toasts */}
      <Snackbar
        open={notice.open}
        autoHideDuration={4000}
        onClose={() => setNotice((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setNotice((prev) => ({ ...prev, open: false }))}
          severity={notice.severity}
          sx={getSettingsToastSx(theme, notice.severity)}
        >
          {notice.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

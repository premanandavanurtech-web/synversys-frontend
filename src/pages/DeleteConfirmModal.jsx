// components/TeamManagement/DeleteConfirmModal.jsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Checkbox,
  FormControlLabel,
  Divider,
  TextField,
  useTheme,
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import ArchiveIcon from '@mui/icons-material/Archive';

const DeleteConfirmModal = ({ open, onClose, onConfirm, member, loading: parentLoading }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [permanent, setPermanent] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState("");

  if (!member) return null;

  const fullName = member.name || `${member.firstName || ''} ${member.lastName || ''}`.trim() || "this member";
  const email = member.email;
  const hasAssignments = (member.assignedCount || 0) > 0;
  const hasInspections = (member.completedCount || 0) > 0;
  const hasData = hasAssignments || hasInspections;

  const handleConfirm = () => {
    if (permanent && confirmText !== "DELETE") {
      setError('Please type "DELETE" to confirm permanent deletion');
      return;
    }
    setError("");
    onConfirm(permanent);
    setPermanent(false);
    setConfirmText("");
  };

  const handleClose = () => {
    setPermanent(false);
    setConfirmText("");
    setError("");
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2.5,
          overflow: 'hidden',
          bgcolor: isDark ? "#0c1726" : "#ffffff",
          color: isDark ? "#f8fafc" : "#0f172a",
          border: isDark ? "1px solid rgba(148, 163, 184, 0.18)" : "1px solid #e2e8f0",
          boxShadow: isDark
            ? "0 25px 50px -12px rgba(0, 0, 0, 0.7)"
            : "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)",
        }
      }}
    >
      <DialogTitle sx={{ 
        pb: 1.25, 
        pt: 2.5, 
        px: { xs: 2, sm: 2.5 },
        bgcolor: permanent 
          ? (isDark ? "rgba(127, 29, 29, 0.28)" : "#fef2f2") 
          : (isDark ? "#0f1d2e" : "#f8fafc"),
        borderBottom: isDark 
          ? "1px solid rgba(148, 163, 184, 0.18)" 
          : (permanent ? "1px solid #fee2e2" : "1px solid #e2e8f0")
      }}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <Box sx={{ 
            width: 40, 
            height: 40, 
            borderRadius: "50%", 
            bgcolor: permanent 
              ? (isDark ? "rgba(239, 68, 68, 0.14)" : "#fee2e2") 
              : (isDark ? "rgba(234, 179, 8, 0.14)" : "#fef9c3"),
            border: permanent
              ? (isDark ? "1px solid rgba(239, 68, 68, 0.32)" : "1px solid #fca5a5")
              : (isDark ? "1px solid rgba(234, 179, 8, 0.32)" : "1px solid #fde047"),
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            {permanent ? (
              <DeleteForeverIcon sx={{ color: '#ef4444', fontSize: '1.2rem' }} />
            ) : (
              <WarningIcon sx={{ color: isDark ? '#eab308' : '#ca8a04', fontSize: '1.2rem' }} />
            )}
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700} fontSize={{ xs: '0.95rem', sm: '1rem' }} sx={{ color: isDark ? "#f8fafc" : "#0f172a" }}>
              {permanent ? "Permanently Delete Member" : "Remove Team Member"}
            </Typography>
            <Typography variant="caption" sx={{ color: isDark ? "#cbd5e1" : "#64748b" }}>
              {permanent 
                ? "This action cannot be undone" 
                : "The member will be archived but data will be preserved"}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: { xs: 2, sm: 2.5 }, pt: 2.5, bgcolor: isDark ? "#0c1726" : "#ffffff" }}>
        {/* Warning Alert for members with data */}
        {hasData && !permanent && (
          <Alert severity="warning" sx={{ mb: 2, fontSize: '0.75rem' }}>
            This member has {hasAssignments ? `${member.assignedCount} active assignment(s)` : ""}
            {hasAssignments && hasInspections ? " and " : ""}
            {hasInspections ? `${member.completedCount} completed inspection(s)` : ""}.
            Archived members' data will be preserved but they won't be able to login.
          </Alert>
        )}

        <DialogContentText sx={{ color: isDark ? '#f8fafc' : '#1e293b', fontSize: '0.85rem', mb: 2, mt: 0.5 }}>
          Are you sure you want to {permanent ? "permanently delete" : "remove"}{' '}
          <strong style={{ color: isDark ? '#ffffff' : '#0f172a' }}>{fullName}</strong>?
        </DialogContentText>

        {/* Member Info Card */}
        <Box sx={{ 
          p: 2, 
          bgcolor: isDark ? "rgba(15, 28, 46, 0.86)" : "#f8fafc", 
          borderRadius: 2, 
          mb: 2,
          border: isDark ? "1px solid rgba(148, 163, 184, 0.18)" : "1px solid #e2e8f0"
        }}>
          <Typography variant="caption" sx={{ mb: 1, display: "block", color: isDark ? "#94a3b8" : "#64748b", fontWeight: 600 }}>
            Member Information:
          </Typography>
          <Box
            display="flex"
            flexDirection="column"
            gap={0.5}
            sx={{ "& .MuiTypography-root": { color: isDark ? "#e2e8f0" : "#334155" } }}
          >
            <Typography variant="body2">
              <strong style={{ color: isDark ? "#ffffff" : "#0f172a" }}>Name:</strong> {fullName}
            </Typography>
            <Typography variant="body2">
              <strong style={{ color: isDark ? "#ffffff" : "#0f172a" }}>Email:</strong> {email}
            </Typography>
            <Typography variant="body2">
              <strong style={{ color: isDark ? "#ffffff" : "#0f172a" }}>Role:</strong> {member.teamRoleDisplay || member.teamRole || "—"}
            </Typography>
            <Typography variant="body2">
              <strong style={{ color: isDark ? "#ffffff" : "#0f172a" }}>Status:</strong> {member.status || "active"}
            </Typography>
            {hasAssignments && (
              <Typography variant="body2" color="warning.main">
                <strong>Active Assignments:</strong> {member.assignedCount}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Permanent Deletion Option */}
        <Box sx={{ mb: 2 }}>
          <FormControlLabel
            sx={{
              alignItems: "flex-start",
              color: isDark ? "#e2e8f0" : "#1e293b",
              "& .MuiTypography-root": { color: isDark ? "#e2e8f0" : "#1e293b" },
              "& .MuiTypography-caption": { color: isDark ? "#cbd5e1" : "#64748b" },
            }}
            control={
              <Checkbox
                checked={permanent}
                onChange={(e) => {
                  setPermanent(e.target.checked);
                  setConfirmText("");
                  setError("");
                }}
                size="small"
                sx={{
                  color: isDark ? "#64748b" : "#94a3b8",
                  "&.Mui-checked": { color: "#ef4444" },
                }}
              />
            }
            label={
              <Box>
                <Typography variant="body2" fontWeight={500}>
                  Permanently delete this member
                </Typography>
                <Typography variant="caption" color="error">
                  This will remove all associated data including inspection history
                </Typography>
              </Box>
            }
          />
        </Box>

        {/* Confirmation text field for permanent deletion */}
        {permanent && (
          <>
            <Divider sx={{ my: 2, borderColor: isDark ? "rgba(148, 163, 184, 0.18)" : "#e2e8f0" }} />
            <Alert severity="error" sx={{ mb: 2, fontSize: '0.75rem' }}>
              DANGER ZONE: This action is irreversible. All inspection data, 
              assignments, and history for this member will be permanently deleted.
            </Alert>
            <TextField
              label='Type "DELETE" to confirm'
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              fullWidth
              size="small"
              error={!!error}
              helperText={error}
              placeholder="DELETE"
              sx={{
                mb: 1,
                "& .MuiOutlinedInput-root": {
                  bgcolor: isDark ? "rgba(15, 28, 46, 0.6)" : "#ffffff",
                },
              }}
            />
          </>
        )}

        {/* Consequences */}
        <Box sx={{ 
          mt: 2, 
          p: 1.5, 
          bgcolor: permanent 
            ? (isDark ? "rgba(127, 29, 29, 0.28)" : "#fef2f2") 
            : (isDark ? "rgba(15, 28, 46, 0.86)" : "#f8fafc"), 
          borderRadius: 1.5,
          border: isDark 
            ? "1px solid rgba(148, 163, 184, 0.18)" 
            : (permanent ? "1px solid #fee2e2" : "1px solid #e2e8f0"),
        }}>
          <Typography variant="caption" display="block" sx={{ color: isDark ? "#cbd5e1" : (permanent ? "#991b1b" : "#475569"), lineHeight: 1.6 }}>
            {permanent ? (
              <>
                • All inspection records will be permanently deleted<br />
                • All assigned tasks will be unassigned<br />
                • This action cannot be reversed
              </>
            ) : (
              <>
                • Member will be archived and cannot login<br />
                • Inspection history will be preserved for reporting<br />
                • Assigned tasks will be reassigned automatically
              </>
            )}
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ 
        px: { xs: 2, sm: 2.5 }, 
        pb: 2.5, 
        pt: 2, 
        gap: 1.5, 
        bgcolor: isDark ? "#0c1726" : "#f8fafc",
        borderTop: isDark ? "1px solid rgba(148, 163, 184, 0.18)" : "1px solid #e2e8f0",
      }}>
        <Button
          onClick={handleClose}
          disabled={parentLoading}
          variant="outlined"
          sx={{ 
            textTransform: 'none', 
            borderRadius: 1.5, 
            fontSize: '0.8rem', 
            py: 0.75,
            px: 2,
            borderColor: isDark ? 'rgba(148, 163, 184, 0.32)' : '#cbd5e1',
            color: isDark ? '#cbd5e1' : '#475569',
            '&:hover': {
              borderColor: isDark ? '#94a3b8' : '#94a3b8',
              bgcolor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#f1f5f9',
            }
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={parentLoading || (permanent && confirmText !== "DELETE")}
          sx={{ 
            textTransform: 'none', 
            borderRadius: 1.5, 
            fontSize: '0.8rem', 
            py: 0.75,
            px: 2.5,
            fontWeight: 600,
            backgroundColor: permanent ? '#ef4444' : '#eab308',
            color: '#ffffff',
            '&:hover': { backgroundColor: permanent ? '#dc2626' : '#ca8a04' }
          }}
        >
          {parentLoading ? (
            <CircularProgress size={18} sx={{ color: 'white' }} />
          ) : (
            permanent ? 'Permanently Delete' : 'Archive Member'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmModal;

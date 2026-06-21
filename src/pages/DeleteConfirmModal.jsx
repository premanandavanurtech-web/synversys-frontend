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
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import ArchiveIcon from '@mui/icons-material/Archive';

const DeleteConfirmModal = ({ open, onClose, onConfirm, member, loading: parentLoading }) => {
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
        sx: { borderRadius: 2, overflow: 'hidden' }
      }}
    >
      <DialogTitle sx={{ 
        pb: 1, 
        pt: 2.5, 
        px: { xs: 2, sm: 2.5 },
        bgcolor: permanent ? "#fff1f0" : "#fef9e6",
        borderBottom: "1px solid #e2e8f0"
      }}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <Box sx={{ 
            width: 40, 
            height: 40, 
            borderRadius: "50%", 
            bgcolor: permanent ? "#fee2e2" : "#fef3c7",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            {permanent ? (
              <DeleteForeverIcon sx={{ color: '#ef4444', fontSize: '1.2rem' }} />
            ) : (
              <WarningIcon sx={{ color: '#eab308', fontSize: '1.2rem' }} />
            )}
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700} fontSize={{ xs: '0.95rem', sm: '1rem' }}>
              {permanent ? "Permanently Delete Member" : "Remove Team Member"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {permanent 
                ? "This action cannot be undone" 
                : "The member will be archived but data will be preserved"}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: { xs: 2, sm: 2.5 }, pt: 2.5 }}>
        {/* Warning Alert for members with data */}
        {hasData && !permanent && (
          <Alert severity="warning" sx={{ mb: 2, fontSize: '0.75rem' }}>
            This member has {hasAssignments ? `${member.assignedCount} active assignment(s)` : ""}
            {hasAssignments && hasInspections ? " and " : ""}
            {hasInspections ? `${member.completedCount} completed inspection(s)` : ""}.
            Archived members' data will be preserved but they won't be able to login.
          </Alert>
        )}

        <DialogContentText sx={{ color: '#64748b', fontSize: '0.85rem', mb: 2 }}>
          Are you sure you want to {permanent ? "permanently delete" : "remove"}{' '}
          <strong>{fullName}</strong>?
        </DialogContentText>

        {/* Member Info Card */}
        <Box sx={{ 
          p: 2, 
          bgcolor: "#f8fafc", 
          borderRadius: 2, 
          mb: 2,
          border: "1px solid #e2e8f0"
        }}>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block" }}>
            Member Information:
          </Typography>
          <Box display="flex" flexDirection="column" gap={0.5}>
            <Typography variant="body2">
              <strong>Name:</strong> {fullName}
            </Typography>
            <Typography variant="body2">
              <strong>Email:</strong> {email}
            </Typography>
            <Typography variant="body2">
              <strong>Role:</strong> {member.teamRoleDisplay || member.teamRole || "—"}
            </Typography>
            <Typography variant="body2">
              <strong>Status:</strong> {member.status || "active"}
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
            control={
              <Checkbox
                checked={permanent}
                onChange={(e) => {
                  setPermanent(e.target.checked);
                  setConfirmText("");
                  setError("");
                }}
                size="small"
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
            <Divider sx={{ my: 2 }} />
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
              sx={{ mb: 1 }}
            />
          </>
        )}

        {/* Consequences */}
        <Box sx={{ 
          mt: 2, 
          p: 1.5, 
          bgcolor: permanent ? "#fee2e2" : "#f1f5f9", 
          borderRadius: 1.5 
        }}>
          <Typography variant="caption" display="block" color="text.secondary">
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

      <DialogActions sx={{ px: { xs: 2, sm: 2.5 }, pb: 2.5, pt: 2, gap: 1.5 }}>
        <Button
          onClick={handleClose}
          disabled={parentLoading}
          variant="outlined"
          sx={{ 
            textTransform: 'none', 
            borderRadius: 1.5, 
            fontSize: '0.8rem', 
            py: 0.75,
            borderColor: '#e2e8f0',
            color: '#64748b'
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
            backgroundColor: permanent ? '#ef4444' : '#eab308',
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

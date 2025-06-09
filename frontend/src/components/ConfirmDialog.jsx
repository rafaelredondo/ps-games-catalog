import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import ActionButton from './ActionButton';
import CancelButton from './CancelButton';

/**
 * ConfirmDialog Component
 * 
 * Standardized confirmation dialog for destructive actions and important confirmations
 * 
 * @param {Object} props
 * @param {boolean} props.open - Whether the dialog is open
 * @param {Function} props.onClose - Function to call when dialog should close
 * @param {Function} props.onConfirm - Function to call when user confirms action
 * @param {string} props.title - Dialog title
 * @param {string} props.message - Main confirmation message
 * @param {string} props.confirmText - Text for confirm button (default: "Confirmar")
 * @param {string} props.cancelText - Text for cancel button (default: "Cancelar")
 * @param {'error'|'warning'|'info'|'success'} props.severity - Visual severity of the action
 * @param {boolean} props.loading - Whether confirm action is in progress
 * @param {string} props.titleId - ID for dialog title (accessibility)
 * @param {string} props.descriptionId - ID for dialog description (accessibility)
 * @param {Object} props.sx - Additional styles for the dialog
 */
const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  severity = 'warning',
  loading = false,
  titleId,
  descriptionId,
  sx = {},
  ...props
}) => {
  // Generate IDs for accessibility if not provided
  const defaultTitleId = titleId || 'confirm-dialog-title';
  const defaultDescriptionId = descriptionId || 'confirm-dialog-description';

  // Map severity to button variant
  const severityMap = {
    error: 'error',
    warning: 'warning', 
    info: 'info',
    success: 'success'
  };

  const buttonVariant = severityMap[severity] || 'warning';

  const handleConfirm = () => {
    if (onConfirm && !loading) {
      onConfirm();
    }
  };

  const handleClose = () => {
    if (onClose && !loading) {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby={defaultTitleId}
      aria-describedby={defaultDescriptionId}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          ...sx
        }
      }}
      {...props}
    >
      <DialogTitle id={defaultTitleId}>
        {title}
      </DialogTitle>
      
      <DialogContent>
        <DialogContentText id={defaultDescriptionId}>
          {message}
        </DialogContentText>
      </DialogContent>
      
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <CancelButton 
          onClick={handleClose}
          disabled={loading}
        >
          {cancelText}
        </CancelButton>
        
        <ActionButton 
          variant={buttonVariant}
          onClick={handleConfirm}
          loading={loading}
          autoFocus
        >
          {confirmText}
        </ActionButton>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog; 
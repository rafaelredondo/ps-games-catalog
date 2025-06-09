import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Box,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ActionButton from './ActionButton';

/**
 * InfoDialog Component
 * 
 * Standardized information dialog for settings, help, and content display
 * 
 * @param {Object} props
 * @param {boolean} props.open - Whether the dialog is open
 * @param {Function} props.onClose - Function to call when dialog should close
 * @param {string} props.title - Dialog title
 * @param {React.ReactNode} props.children - Dialog content
 * @param {string} props.closeText - Text for close button (default: "Fechar")
 * @param {string} props.maxWidth - Maximum width of dialog ('xs', 'sm', 'md', 'lg', 'xl')
 * @param {boolean} props.fullWidth - Whether dialog should take full width
 * @param {boolean} props.showCloseIcon - Whether to show close icon in title
 * @param {React.ReactNode} props.icon - Icon to display next to title
 * @param {Object} props.sx - Additional styles for the dialog
 * @param {Object} props.contentSx - Additional styles for dialog content
 * @param {React.ReactNode} props.actions - Custom actions to replace default close button
 */
const InfoDialog = ({
  open,
  onClose,
  title,
  children,
  closeText = 'Fechar',
  maxWidth = 'sm',
  fullWidth = true,
  showCloseIcon = true,
  icon,
  sx = {},
  contentSx = {},
  actions,
  ...props
}) => {
  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      PaperProps={{
        sx: {
          borderRadius: 2,
          bgcolor: 'background.paper',
          ...sx
        }
      }}
      {...props}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 1
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {icon}
          <Typography variant="h6" component="span">
            {title}
          </Typography>
        </Box>
        
        {showCloseIcon && (
          <IconButton 
            onClick={handleClose}
            size="small"
            sx={{ color: 'text.secondary' }}
          >
            <CloseIcon />
          </IconButton>
        )}
      </DialogTitle>

      <DialogContent sx={{ pb: 2, ...contentSx }}>
        {children}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        {actions || (
          <ActionButton
            onClick={handleClose}
            variant="primary"
            sx={{ textTransform: 'none', ml: 1 }}
          >
            {closeText}
          </ActionButton>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default InfoDialog; 
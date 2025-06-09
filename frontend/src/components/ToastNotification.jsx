import React, { useState, useEffect } from 'react';
import {
  Snackbar,
  Alert,
  AlertTitle,
  Button,
  LinearProgress,
  Box,
  IconButton,
  Typography
} from '@mui/material';
import {
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Close as CloseIcon,
  Refresh as RetryIcon
} from '@mui/icons-material';

const ToastNotification = ({
  open = false,
  message = '',
  severity = 'info', // 'success', 'error', 'warning', 'info'
  duration = 6000,
  position = { vertical: 'bottom', horizontal: 'left' },
  showProgress = false,
  progress = 0,
  allowRetry = false,
  retryText = 'Tentar Novamente',
  title = '',
  onClose = () => {},
  onRetry = () => {},
  onExited = () => {},
  ...props
}) => {
  const [internalOpen, setInternalOpen] = useState(open);

  useEffect(() => {
    setInternalOpen(open);
  }, [open]);

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setInternalOpen(false);
    onClose(event, reason);
  };

  const handleRetry = () => {
    onRetry();
    handleClose();
  };

  const getSeverityIcon = () => {
    const iconMap = {
      success: <SuccessIcon />,
      error: <ErrorIcon />,
      warning: <WarningIcon />,
      info: <InfoIcon />
    };
    return iconMap[severity] || iconMap.info;
  };

  const getAutoHideDuration = () => {
    if (severity === 'error' && allowRetry) {
      return null; // Não ocultar automaticamente erros com retry
    }
    return duration;
  };

  return (
    <Snackbar
      open={internalOpen}
      autoHideDuration={getAutoHideDuration()}
      onClose={handleClose}
      anchorOrigin={position}
      {...props}
    >
      <Alert
        severity={severity}
        onClose={handleClose}
        icon={getSeverityIcon()}
        sx={{
          minWidth: 320,
          maxWidth: 500,
          '& .MuiAlert-message': {
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 1
          },
          '& .MuiAlert-action': {
            alignItems: 'flex-start',
            paddingTop: 0.5
          }
        }}
      >
        {title && (
          <AlertTitle sx={{ marginBottom: 0.5 }}>
            {title}
          </AlertTitle>
        )}
        
        <Typography variant="body2" component="div">
          {message}
        </Typography>

        {showProgress && (
          <Box sx={{ mt: 1 }}>
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              sx={{ 
                height: 4, 
                borderRadius: 2,
                backgroundColor: 'rgba(255,255,255,0.2)'
              }} 
            />
            <Typography variant="caption" sx={{ mt: 0.5 }}>
              {Math.round(progress)}% concluído
            </Typography>
          </Box>
        )}

        {allowRetry && (
          <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              size="small"
              startIcon={<RetryIcon />}
              onClick={handleRetry}
              sx={{ 
                textTransform: 'none',
                fontWeight: 500
              }}
            >
              {retryText}
            </Button>
          </Box>
        )}
      </Alert>
    </Snackbar>
  );
};

export default ToastNotification; 
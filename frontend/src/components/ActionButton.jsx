import React from 'react';
import { Button } from '@mui/material';
import LoadingSpinner from './LoadingSpinner';

/**
 * Botão padronizado para ações principais
 * @param {Object} props 
 * @param {'primary'|'success'|'error'|'warning'|'info'} props.variant - Tipo da ação
 * @param {'small'|'medium'|'large'} props.size - Tamanho do botão  
 * @param {boolean} props.loading - Estado de carregamento
 * @param {boolean} props.disabled - Se o botão está desabilitado
 * @param {boolean} props.fullWidth - Se o botão ocupa toda a largura
 * @param {React.ReactNode} props.startIcon - Ícone no início
 * @param {React.ReactNode} props.endIcon - Ícone no final
 * @param {React.ReactNode} props.children - Texto do botão
 * @param {Function} props.onClick - Função de clique
 * @param {string} props.type - Tipo do botão (submit, button)
 * @param {Object} props.sx - Estilos customizados
 */
const ActionButton = ({
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  fullWidth = false,
  startIcon,
  endIcon,
  children,
  onClick,
  type = 'button',
  sx = {},
  ...otherProps
}) => {
  // Mapeamento de cores por tipo de ação
  const variantStyles = {
    primary: {
      color: 'primary',
      muiVariant: 'contained'
    },
    success: {
      color: 'success', 
      muiVariant: 'contained'
    },
    error: {
      color: 'error',
      muiVariant: 'contained'
    },
    warning: {
      color: 'warning',
      muiVariant: 'contained'
    },
    info: {
      color: 'info',
      muiVariant: 'contained'
    }
  };

  const styles = variantStyles[variant] || variantStyles.primary;

  // Estilos responsivos padronizados
  const responsiveStyles = {
    height: { 
      xs: size === 'small' ? '32px' : size === 'large' ? '48px' : '36px',
      sm: size === 'small' ? '36px' : size === 'large' ? '52px' : '40px' 
    },
    fontSize: { 
      xs: size === 'small' ? '0.75rem' : size === 'large' ? '0.95rem' : '0.8rem',
      sm: size === 'small' ? '0.8rem' : size === 'large' ? '1rem' : '0.875rem' 
    },
    px: { xs: 1.5, sm: 2 },
    minWidth: size === 'small' ? '64px' : '80px',
    ...sx
  };

  return (
    <Button
      variant={styles.muiVariant}
      color={styles.color}
      size={size}
      fullWidth={fullWidth}
      disabled={disabled || loading}
      startIcon={loading ? undefined : startIcon}
      endIcon={loading ? undefined : endIcon}
      onClick={onClick}
      type={type}
      sx={responsiveStyles}
      {...otherProps}
    >
      {loading ? (
        <LoadingSpinner variant="inline" size="small" />
      ) : (
        children
      )}
    </Button>
  );
};

export default ActionButton; 
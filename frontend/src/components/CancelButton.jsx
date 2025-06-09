import React from 'react';
import { Button } from '@mui/material';

/**
 * Botão padronizado para ações de cancelamento/retorno
 * @param {Object} props 
 * @param {'cancel'|'clear'|'back'} props.variant - Tipo da ação de cancelamento
 * @param {'small'|'medium'|'large'} props.size - Tamanho do botão  
 * @param {boolean} props.disabled - Se o botão está desabilitado
 * @param {boolean} props.fullWidth - Se o botão ocupa toda a largura
 * @param {React.ReactNode} props.startIcon - Ícone no início
 * @param {React.ReactNode} props.endIcon - Ícone no final
 * @param {React.ReactNode} props.children - Texto do botão
 * @param {Function} props.onClick - Função de clique
 * @param {string} props.type - Tipo do botão (submit, button)
 * @param {Object} props.sx - Estilos customizados
 */
const CancelButton = ({
  variant = 'cancel',
  size = 'medium',
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
  // Mapeamento de estilos por tipo de cancelamento
  const variantStyles = {
    cancel: {
      color: 'inherit',
      muiVariant: 'text'
    },
    clear: {
      color: 'error',
      muiVariant: 'outlined'
    },
    back: {
      color: 'secondary',
      muiVariant: 'outlined'
    }
  };

  const styles = variantStyles[variant] || variantStyles.cancel;

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
    textTransform: 'none',
    ...sx
  };

  return (
    <Button
      variant={styles.muiVariant}
      color={styles.color}
      size={size}
      fullWidth={fullWidth}
      disabled={disabled}
      startIcon={startIcon}
      endIcon={endIcon}
      onClick={onClick}
      type={type}
      sx={responsiveStyles}
      {...otherProps}
    >
      {children}
    </Button>
  );
};

export default CancelButton; 
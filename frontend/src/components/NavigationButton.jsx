import React from 'react';
import { Button } from '@mui/material';

/**
 * Botão padronizado para navegação entre páginas
 * @param {Object} props 
 * @param {'primary'|'secondary'|'link'} props.variant - Tipo da navegação
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
const NavigationButton = ({
  variant = 'primary',
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
  // Mapeamento de estilos por tipo de navegação
  const variantStyles = {
    primary: {
      color: 'primary',
      muiVariant: 'contained'
    },
    secondary: {
      color: 'secondary',
      muiVariant: 'outlined'
    },
    link: {
      color: 'primary',
      muiVariant: 'text'
    }
  };

  const styles = variantStyles[variant] || variantStyles.primary;

  // Estilos responsivos padronizados para navegação
  const responsiveStyles = {
    height: { 
      xs: size === 'small' ? '32px' : size === 'large' ? '48px' : '36px',
      sm: size === 'small' ? '36px' : size === 'large' ? '52px' : '40px' 
    },
    fontSize: { 
      xs: size === 'small' ? '0.75rem' : size === 'large' ? '0.95rem' : '0.8rem',
      sm: size === 'small' ? '0.8rem' : size === 'large' ? '1rem' : '0.875rem' 
    },
    px: { xs: 2, sm: 3 },
    minWidth: size === 'small' ? '80px' : '100px',
    textTransform: 'none',
    fontWeight: 600,
    // Estilos especiais para navegação primária
    ...(variant === 'primary' && {
      bgcolor: '#0096FF',
      '&:hover': { bgcolor: '#0077cc' }
    }),
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

export default NavigationButton; 
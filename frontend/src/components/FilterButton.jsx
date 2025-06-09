import React from 'react';
import { Button, Tooltip } from '@mui/material';

/**
 * Botão padronizado para ações de filtro e utilitários
 * @param {Object} props 
 * @param {'filter'|'export'|'upload'|'toggle'} props.variant - Tipo da ação de filtro
 * @param {'small'|'medium'|'large'} props.size - Tamanho do botão  
 * @param {boolean} props.disabled - Se o botão está desabilitado
 * @param {boolean} props.fullWidth - Se o botão ocupa toda a largura
 * @param {React.ReactNode} props.startIcon - Ícone no início
 * @param {React.ReactNode} props.endIcon - Ícone no final
 * @param {React.ReactNode} props.children - Texto do botão
 * @param {Function} props.onClick - Função de clique
 * @param {string} props.tooltip - Texto do tooltip
 * @param {string} props.type - Tipo do botão (submit, button)
 * @param {Object} props.sx - Estilos customizados
 */
const FilterButton = ({
  variant = 'filter',
  size = 'medium',
  disabled = false,
  fullWidth = false,
  startIcon,
  endIcon,
  children,
  onClick,
  tooltip,
  type = 'button',
  sx = {},
  ...otherProps
}) => {
  // Mapeamento de estilos por tipo de filtro
  const variantStyles = {
    filter: {
      color: 'error',
      muiVariant: 'outlined'
    },
    export: {
      color: 'info',
      muiVariant: 'outlined'
    },
    upload: {
      color: 'primary',
      muiVariant: 'contained'
    },
    toggle: {
      color: 'primary',
      muiVariant: 'outlined'
    }
  };

  const styles = variantStyles[variant] || variantStyles.filter;

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
    px: { xs: 1, sm: 2 },
    minWidth: size === 'small' ? '64px' : '80px',
    textTransform: 'none',
    // Estilos especiais para upload
    ...(variant === 'upload' && {
      bgcolor: '#0096FF',
      '&:hover': { bgcolor: '#0077cc' },
      cursor: 'pointer'
    }),
    ...sx
  };

  const buttonElement = (
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

  // Se tem tooltip, envolve com Tooltip
  if (tooltip) {
    return (
      <Tooltip title={tooltip} placement="top">
        {buttonElement}
      </Tooltip>
    );
  }

  return buttonElement;
};

export default FilterButton; 
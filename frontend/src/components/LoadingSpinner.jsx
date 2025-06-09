import { Box, CircularProgress, Typography, Fade } from '@mui/material';

/**
 * Componente LoadingSpinner padronizado para toda a aplicação
 * Substitui múltiplas implementações de CircularProgress
 * 
 * @param {'page'|'inline'|'section'|'center'|'overlay'|'skeleton'} variant - Tipo de loading
 * @param {'small'|'medium'|'large'|'xl'} size - Tamanho do spinner
 * @param {string} color - Cor do spinner
 * @param {string} message - Mensagem de loading personalizada
 * @param {boolean} showMessage - Se deve mostrar mensagem de loading
 * @param {number} delay - Delay antes de mostrar o spinner (ms)
 * @param {boolean} backdrop - Se deve mostrar backdrop (para overlay)
 * @param {Object} sx - Estilos customizados
 */
const LoadingSpinner = ({ 
  variant = 'page', 
  size = 'medium',
  color = 'primary',
  message = '',
  showMessage = true,
  delay = 0,
  backdrop = false,
  sx = {},
  ...props 
}) => {
  // Mapeamento de tamanhos
  const sizeMap = {
    small: 20,
    medium: 32,
    large: 40,
    xl: 48
  };

  // Mensagens padrão por variante
  const getDefaultMessage = () => {
    if (message) return message;
    
    switch (variant) {
      case 'page': return 'Carregando página...';
      case 'section': return 'Carregando dados...';
      case 'overlay': return 'Processando...';
      case 'skeleton': return 'Preparando conteúdo...';
      default: return 'Carregando...';
    }
  };

  // Mapeamento de variantes
  const variants = {
    // Loading de página completa (GameDetails, GameWrapped, CsvPage)
    page: {
      container: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '80vh',
        gap: 2,
        ...sx
      },
      size: sizeMap[size] || size,
      color: color,
      showText: showMessage
    },
    
    // Loading inline (dentro de botões)
    inline: {
      container: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 1,
        ...sx
      },
      size: sizeMap[size] || size,
      color: color === 'primary' ? 'inherit' : color, // Botões usam inherit
      showText: false // Nunca mostrar texto em inline
    },
    
    // Loading de seção (partes específicas da página)
    section: {
      container: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        py: 3,
        gap: 2,
        ...sx
      },
      size: sizeMap[size] || size,
      color: color,
      showText: showMessage
    },

    // Loading centralizado simples
    center: {
      container: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 1,
        ...sx
      },
      size: sizeMap[size] || size,
      color: color,
      showText: showMessage
    },

    // Loading overlay (sobre conteúdo existente)
    overlay: {
      container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 2,
        zIndex: 1000,
        ...(backdrop && {
          bgcolor: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(2px)'
        }),
        ...sx
      },
      size: sizeMap[size] || size,
      color: color,
      showText: showMessage
    },

    // Loading para skeleton (transição suave)
    skeleton: {
      container: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        py: 4,
        gap: 2,
        opacity: 0.8,
        ...sx
      },
      size: sizeMap[size] || size,
      color: color,
      showText: showMessage
    }
  };

  const config = variants[variant] || variants.page;

  // Componente com delay opcional
  const LoadingContent = () => (
    <Box sx={config.container}>
      <CircularProgress 
        size={config.size} 
        color={config.color}
        {...props}
      />
      {config.showText && (
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ 
            fontWeight: 500,
            textAlign: 'center',
            animation: 'fadeIn 0.5s ease-in',
            '@keyframes fadeIn': {
              from: { opacity: 0, transform: 'translateY(10px)' },
              to: { opacity: 1, transform: 'translateY(0)' }
            }
          }}
        >
          {getDefaultMessage()}
        </Typography>
      )}
    </Box>
  );

  // Se há delay, usar Fade
  if (delay > 0) {
    return (
      <Fade in timeout={delay}>
        <div>
          <LoadingContent />
        </div>
      </Fade>
    );
  }

  return <LoadingContent />;
};

export default LoadingSpinner; 
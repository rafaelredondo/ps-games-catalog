import { useMemo, useCallback } from 'react';
import { Box, Button, Typography, useMediaQuery, useTheme } from '@mui/material';

/**
 * Componente de navegação alfabética para catálogo de jogos
 * Desktop: Barra horizontal com letras
 * Mobile: Alfabeto vertical na lateral direita (estilo iPhone Contatos)
 */
function AlphabetNavigation({ games, orderBy, infiniteScrollEnabled }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Detectar letras disponíveis no catálogo atual
  const availableLetters = useMemo(() => {
    if (!games || games.length === 0) return [];
    
    const letters = new Set();
    games.forEach(game => {
      if (!game.name) return;
      
      const firstChar = game.name[0].toUpperCase();
      if (/[0-9]/.test(firstChar)) {
        letters.add('0-9');
      } else if (/[A-Z]/.test(firstChar)) {
        letters.add(firstChar);
      }
    });
    
    // Ordenar: números primeiro, depois letras
    const sortedLetters = Array.from(letters).sort((a, b) => {
      if (a === '0-9') return -1;
      if (b === '0-9') return 1;
      return a.localeCompare(b);
    });
    
    return sortedLetters;
  }, [games]);

  // Função para fazer scroll suave para a primeira ocorrência da letra
  const scrollToLetter = useCallback((letter) => {
    const targetGame = games.find(game => {
      if (!game.name) return false;
      
      const firstChar = game.name[0].toUpperCase();
      if (letter === '0-9') {
        return /[0-9]/.test(firstChar);
      }
      return firstChar === letter;
    });
    
    if (targetGame) {
      const element = document.getElementById(`game-card-${targetGame.id}`);
      if (element) {
        // Scroll suave com offset para considerar o header fixo
        const headerOffset = 100; // Altura aproximada do header + padding
        const elementPosition = element.offsetTop;
        const offsetPosition = elementPosition - headerOffset;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }
  }, [games]);

  // Verificar se deve mostrar a navegação alfabética
  const shouldShow = (
    orderBy === 'name' && 
    !infiniteScrollEnabled && 
    availableLetters.length > 3 && // Só mostrar se tiver variedade
    games.length > 20 // Só mostrar se tiver muitos jogos
  );

  if (!shouldShow) return null;

  // Renderização Desktop: Barra horizontal
  if (!isMobile) {
    return (
      <Box
        sx={{
          position: 'sticky',
          top: 64, // Altura do header
          zIndex: 100,
          bgcolor: 'rgba(26, 26, 26, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          py: 1,
          mb: 2
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: 'rgba(255,255,255,0.6)',
            fontSize: '0.75rem',
            fontWeight: 500,
            mb: 1,
            display: 'block'
          }}
        >
          🔤 NAVEGAÇÃO RÁPIDA
        </Typography>
        
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 0.5,
            alignItems: 'center'
          }}
        >
          {availableLetters.map((letter) => (
            <Button
              key={letter}
              variant="text"
              size="small"
              onClick={() => scrollToLetter(letter)}
              sx={{
                minWidth: '32px',
                height: '32px',
                borderRadius: '6px',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'rgba(255,255,255,0.8)',
                bgcolor: 'rgba(0, 150, 255, 0.1)',
                border: '1px solid rgba(0, 150, 255, 0.2)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: 'rgba(0, 150, 255, 0.2)',
                  color: '#0096FF',
                  border: '1px solid rgba(0, 150, 255, 0.4)',
                  transform: 'translateY(-1px)'
                }
              }}
            >
              {letter}
            </Button>
          ))}
        </Box>
      </Box>
    );
  }

  // Renderização Mobile: Alfabeto vertical na lateral direita (estilo iPhone)
  return (
                <Box
        sx={{
          position: 'fixed',
          right: 1, // Mais próximo da borda
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 50, // Ainda mais baixo
          display: 'flex',
          flexDirection: 'column',
          gap: 0.2, // Gap menor
          bgcolor: 'rgba(26, 26, 26, 0.7)', // Menos opaco
          backdropFilter: 'blur(8px)', // Blur mais sutil
          borderRadius: '10px', // Menor
          padding: '6px 4px', // Padding menor
          border: '1px solid rgba(255,255,255,0.08)', // Borda mais sutil
          maxHeight: '70vh',
          overflowY: 'auto',
          scrollbarWidth: 'none', // Firefox
          '&::-webkit-scrollbar': { // Chrome/Safari
            display: 'none'
          }
        }}
      >
      {availableLetters.map((letter) => (
        <Button
          key={letter}
          variant="text"
          size="small"
          onClick={() => scrollToLetter(letter)}
          sx={{
            minWidth: '22px', // Menor
            width: '22px',    // Menor  
            height: '22px',   // Menor
            borderRadius: '5px', // Menor
            fontSize: '0.65rem', // Fonte menor
            fontWeight: 600,
            padding: 0,
            color: 'rgba(255,255,255,0.75)',
            bgcolor: 'transparent',
            transition: 'all 0.2s ease',
            '&:hover': {
              bgcolor: 'rgba(0, 150, 255, 0.25)', // Menos intenso
              color: '#ffffff',
              transform: 'scale(1.08)' // Menos zoom
            },
            '&:active': {
              transform: 'scale(0.92)' // Menos compressão
            }
          }}
        >
          {letter === '0-9' ? '#' : letter}
        </Button>
      ))}
    </Box>
  );
}

export default AlphabetNavigation; 
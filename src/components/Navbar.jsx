import { AppBar, Toolbar, Typography, Button, Box, SvgIcon } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import InsightsIcon from '@mui/icons-material/Insights';

// Componente de logotipo inspirado no PlayStation
const PlayStationLogo = (props) => (
  <SvgIcon {...props} viewBox="0 0 36 36">
    <path
      d="M30.5,16c0,0-5,2.1-5,2.1l0-4.6c0-0.7-0.2-1.2-0.7-1.4c-0.4-0.3-0.9-0.2-1.5,0.1C22.6,12.6,22,13.2,22,14v9.2 c0,0.7,0.7,1.2,1.5,0.9l7-3.1c0.8-0.3,1.5-1.3,1.5-2v-1C32,16.8,31.3,15.6,30.5,16z"
      fill="#0096FF"
    />
    <path
      d="M19.5,22.8c0.8-0.3,1.4-1.3,1.5-2V7c0-1.7-2-2.5-2-0.8v12l-3.6-1.4V6c-0.1-0.7-0.5-1.1-1-1.1 c-0.5-0.1-1.1,0.1-1.7,0.5C11.9,6,6,8.9,6,10.3V22c0,1,0.6,1.6,1.2,1.7s1.5-0.1,2.2-0.4c1.5-0.7,7.4-3.2,7.4-3.2L19.5,22.8z"
      fill="#ffffff"
    />
    <path
      d="M18,4C10.3,4,4,10.3,4,18s6.3,14,14,14s14-6.3,14-14S25.7,4,18,4z M18,30c-6.6,0-12-5.4-12-12S11.4,6,18,6 s12,5.4,12,12S24.6,30,18,30z"
      fill="#0096FF"
    />
  </SvgIcon>
);

// Componente de logotipo minimalista e moderno
const ModernGameLogo = (props) => (
  <SvgIcon {...props} viewBox="0 0 36 36">
    <defs>
      <linearGradient id="gameLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0096FF" />
        <stop offset="100%" stopColor="#5B42F3" />
      </linearGradient>
    </defs>
    <path
      d="M18,4C10.3,4,4,10.3,4,18s6.3,14,14,14s14-6.3,14-14S25.7,4,18,4z M18,30c-6.6,0-12-5.4-12-12S11.4,6,18,6 s12,5.4,12,12S24.6,30,18,30z"
      fill="url(#gameLogoGradient)"
    />
    <path
      d="M15,12v12l9-6L15,12z"
      fill="#ffffff"
    />
    <circle cx="23" cy="13" r="2" fill="#ffffff" />
  </SvgIcon>
);

// Componente de logotipo estilo pixel art (retrô)
const RetroPixelLogo = (props) => (
  <SvgIcon {...props} viewBox="0 0 36 36">
    <defs>
      <linearGradient id="retroGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FF5757" />
        <stop offset="100%" stopColor="#0096FF" />
      </linearGradient>
    </defs>
    {/* Fundo do logo */}
    <rect x="4" y="4" width="28" height="28" rx="2" fill="#222" />
    
    {/* Pixel Art Controller */}
    <rect x="8" y="12" width="4" height="4" fill="#0096FF" />
    <rect x="12" y="12" width="4" height="4" fill="#0096FF" />
    <rect x="16" y="12" width="4" height="4" fill="#0096FF" />
    <rect x="20" y="12" width="4" height="4" fill="#0096FF" />
    <rect x="24" y="12" width="4" height="4" fill="#0096FF" />
    
    <rect x="8" y="16" width="4" height="4" fill="#0096FF" />
    <rect x="24" y="16" width="4" height="4" fill="#0096FF" />
    
    <rect x="8" y="20" width="4" height="4" fill="#0096FF" />
    <rect x="12" y="20" width="4" height="4" fill="#0096FF" />
    <rect x="16" y="20" width="4" height="4" fill="#0096FF" />
    <rect x="20" y="20" width="4" height="4" fill="#0096FF" />
    <rect x="24" y="20" width="4" height="4" fill="#0096FF" />
    
    {/* Botões */}
    <circle cx="28" cy="10" r="2" fill="#FF5757" />
    <circle cx="24" cy="8" r="2" fill="#FFDD55" />
  </SvgIcon>
);

function Navbar() {
  // Escolha qual logotipo usar:
  // Opção 1: PlayStationLogo - inspirado no PlayStation clássico
  // Opção 2: ModernGameLogo - design moderno e minimalista
  // Opção 3: RetroPixelLogo - estilo pixel art retrô
  const Logo = RetroPixelLogo; // Mude para a opção desejada
  
  return (
    <AppBar position="static" sx={{ backgroundColor: '#1a1a1a', boxShadow: 'none', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
      <Toolbar sx={{ height: 64, px: 3 }}>
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{
            flexGrow: 1,
            textDecoration: 'none',
            color: 'inherit',
            display: 'flex',
            alignItems: 'center',
            fontSize: '1.1rem',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          <Box 
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              cursor: 'pointer',
              '&:hover': {
                '& .game-logo': {
                  transform: 'scale(1.1)',
                  filter: 'drop-shadow(0 0 8px rgba(0, 150, 255, 0.8))'
                }
              }
            }}
          >
            <Logo 
              className="game-logo"
              sx={{ 
                fontSize: 40,
                transition: 'all 0.3s ease',
                filter: 'drop-shadow(0 0 4px rgba(0, 150, 255, 0.5))'
              }} 
            />
            <span style={{ 
              background: 'linear-gradient(90deg, #fff, #0096FF)', 
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 600
            }}>
              Games Catalog
            </span>
          </Box>
        </Typography>
        <Box>
          <Button
            color="inherit"
            component={RouterLink}
            to="/"
            sx={{ opacity: 0.85, textTransform: 'none', fontWeight: 400 }}
          >
            Início
          </Button>
          <Button
            variant="contained"
            color="primary"
            component={RouterLink}
            to="/add"
            startIcon={<AddIcon />}
            sx={{ 
              ml: 1.5,
              bgcolor: '#0096FF',
              textTransform: 'none', 
              fontWeight: 500,
              borderRadius: '6px',
              px: 2,
              '&:hover': { 
                bgcolor: '#0077cc',
                boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
              },
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}
          >
            Adicionar Jogo
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/csv"
            sx={{ 
              ml: 1.5,
              bgcolor: '#0096FF',
              textTransform: 'none', 
              fontWeight: 500,
              borderRadius: '6px',
              px: 2,
              '&:hover': { 
                bgcolor: '#0077cc',
                boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
              },
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}
            startIcon={<UploadFileIcon fontSize="small" />}
          >
            CSV
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/wrapped"
            sx={{ 
              ml: 1.5,
              opacity: 0.85, 
              textTransform: 'none', 
              fontWeight: 400,
              fontSize: '0.9rem',
              background: 'linear-gradient(45deg, #FF6AD5 0%, #C774E8 50%, #AD8CFF 100%)',
              color: 'white',
              borderRadius: '6px',
              px: 2,
              '&:hover': { 
                opacity: 1,
                boxShadow: '0 2px 8px rgba(173, 140, 255, 0.5)'
              }
            }}
            startIcon={<InsightsIcon fontSize="small" />}
          >
            GameWrapped
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar; 
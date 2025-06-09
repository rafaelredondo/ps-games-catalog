import { AppBar, Toolbar, Typography, Button, Box, SvgIcon, IconButton, Tooltip, useMediaQuery, useTheme } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import InsightsIcon from '@mui/icons-material/Insights';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import HomeIcon from '@mui/icons-material/Home';
import { useAuth } from '../contexts/AuthContext';
import SettingsModal from './SettingsModal';

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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const Logo = RetroPixelLogo;
  const { logout } = useAuth();
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const handleSettingsClick = () => {
    setSettingsModalOpen(true);
  };

  const handleSettingsClose = () => {
    setSettingsModalOpen(false);
  };
  
  return (
    <>
      <AppBar 
        position="sticky" 
        sx={{ 
          backgroundColor: 'rgba(26, 26, 26, 0.95)', 
          boxShadow: 'none', 
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          top: 0,
          zIndex: 1100,
          backdropFilter: 'blur(10px)'
        }}
      >
        <Toolbar sx={{ 
          height: 64, 
          px: { xs: 1, sm: 3 },
          minHeight: { xs: '56px', sm: '64px' }
        }}>
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
              fontSize: { xs: '1rem', sm: '1.1rem' },
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            <Box 
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: { xs: 1, sm: 1.5 },
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
                  fontSize: { xs: 32, sm: 40 },
                  transition: 'all 0.3s ease',
                  filter: 'drop-shadow(0 0 4px rgba(0, 150, 255, 0.5))'
                }} 
              />
              <span style={{ 
                background: 'linear-gradient(90deg, #fff, #0096FF)', 
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 600,
                display: isMobile ? 'none' : 'inline' // Esconder texto em mobile muito pequeno
              }}>
                Games Catalog
              </span>
            </Box>
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1.5 } }}>
            {/* Botão Home */}
            <Tooltip title="Início">
              <IconButton
                component={RouterLink}
                to="/"
                sx={{ 
                  bgcolor: 'rgba(0, 150, 255, 0.1)',
                  border: '1px solid rgba(0, 150, 255, 0.3)',
                  color: '#0096FF',
                  p: { xs: 1, sm: 1 },
                  '&:hover': { 
                    bgcolor: 'rgba(0, 150, 255, 0.2)',
                    border: '1px solid rgba(0, 150, 255, 0.5)',
                    color: '#ffffff'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                <HomeIcon fontSize={isMobile ? 'small' : 'medium'} />
              </IconButton>
            </Tooltip>

            {/* Botão Adicionar */}
            <Tooltip title="Adicionar Jogo">
              <IconButton
                component={RouterLink}
                to="/add"
                sx={{ 
                  bgcolor: 'rgba(0, 150, 255, 0.1)',
                  border: '1px solid rgba(0, 150, 255, 0.3)',
                  color: '#0096FF',
                  p: { xs: 1, sm: 1 },
                  '&:hover': { 
                    bgcolor: 'rgba(0, 150, 255, 0.2)',
                    border: '1px solid rgba(0, 150, 255, 0.5)',
                    color: '#ffffff'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                <AddIcon fontSize={isMobile ? 'small' : 'medium'} />
              </IconButton>
            </Tooltip>

            {/* Botão CSV - escondido em mobile */}
            {!isMobile && (
              <Tooltip title="Import/Export CSV">
                <IconButton
                  component={RouterLink}
                  to="/csv"
                  sx={{ 
                    bgcolor: 'rgba(0, 150, 255, 0.1)',
                    border: '1px solid rgba(0, 150, 255, 0.3)',
                    color: '#0096FF',
                    p: 1,
                    '&:hover': { 
                      bgcolor: 'rgba(0, 150, 255, 0.2)',
                      border: '1px solid rgba(0, 150, 255, 0.5)',
                      color: '#ffffff'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  <UploadFileIcon fontSize="medium" />
                </IconButton>
              </Tooltip>
            )}

            {/* Botão GameWrapped */}
            <Tooltip title="Game Wrapped">
              <IconButton
                component={RouterLink}
                to="/wrapped"
                sx={{ 
                  background: 'linear-gradient(45deg, rgba(255, 106, 213, 0.1) 0%, rgba(199, 116, 232, 0.1) 50%, rgba(173, 140, 255, 0.1) 100%)',
                  border: '1px solid rgba(173, 140, 255, 0.3)',
                  color: '#AD8CFF',
                  p: { xs: 1, sm: 1 },
                  '&:hover': { 
                    background: 'linear-gradient(45deg, rgba(255, 106, 213, 0.2) 0%, rgba(199, 116, 232, 0.2) 50%, rgba(173, 140, 255, 0.2) 100%)',
                    border: '1px solid rgba(173, 140, 255, 0.5)',
                    color: '#ffffff'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                <InsightsIcon fontSize={isMobile ? 'small' : 'medium'} />
              </IconButton>
            </Tooltip>

            {/* Botão Configurações */}
            <Tooltip title="Configurações">
              <IconButton
                onClick={handleSettingsClick}
                sx={{ 
                  bgcolor: 'rgba(128, 128, 128, 0.1)',
                  border: '1px solid rgba(128, 128, 128, 0.3)',
                  color: 'rgba(255, 255, 255, 0.7)',
                  p: { xs: 1, sm: 1 },
                  '&:hover': { 
                    bgcolor: 'rgba(0, 150, 255, 0.2)',
                    border: '1px solid rgba(0, 150, 255, 0.5)',
                    color: '#0096FF',
                    transform: 'rotate(180deg)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                <SettingsIcon fontSize={isMobile ? 'small' : 'medium'} />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Sair">
              <IconButton
                onClick={handleLogout}
                sx={{ 
                  bgcolor: 'rgba(255, 82, 82, 0.1)',
                  border: '1px solid rgba(255, 82, 82, 0.3)',
                  color: 'rgba(255, 82, 82, 0.8)',
                  p: { xs: 1, sm: 1 },
                  '&:hover': { 
                    bgcolor: 'rgba(255, 82, 82, 0.2)',
                    border: '1px solid rgba(255, 82, 82, 0.5)',
                    color: '#ff5252'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                <LogoutIcon fontSize={isMobile ? 'small' : 'medium'} />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Modal de Configurações */}
      <SettingsModal 
        open={settingsModalOpen} 
        onClose={handleSettingsClose} 
      />
    </>
  );
}

export default Navbar; 
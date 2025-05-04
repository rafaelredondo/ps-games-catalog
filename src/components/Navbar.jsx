import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

function Navbar() {
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
          }}
        >
          PlayStation Games Catalog
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
            color="inherit"
            component={RouterLink}
            to="/add"
            sx={{ opacity: 0.85, textTransform: 'none', fontWeight: 400, ml: 1 }}
          >
            Adicionar Jogo
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar; 
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

function Navbar() {
  return (
    <AppBar position="static">
      <Toolbar>
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
          }}
        >
          PlayStation Games Catalog
        </Typography>
        <Box>
          <Button
            color="inherit"
            component={RouterLink}
            to="/"
          >
            Início
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/add"
          >
            Adicionar Jogo
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar; 
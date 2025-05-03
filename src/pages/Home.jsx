import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useGames } from '../contexts/GamesContext';

function Home() {
  const navigate = useNavigate();
  const { games, loading, error, loadGames, loadGamesByPlatform, deleteGame } = useGames();
  const [platform, setPlatform] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [gameToDelete, setGameToDelete] = useState(null);

  const handlePlatformChange = (event) => {
    const selectedPlatform = event.target.value;
    setPlatform(selectedPlatform);
    if (selectedPlatform === 'all') {
      loadGames();
    } else {
      loadGamesByPlatform(selectedPlatform);
    }
  };

  const handleDeleteClick = (game) => {
    setGameToDelete(game);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteGame(gameToDelete.id);
      setDeleteDialogOpen(false);
      setGameToDelete(null);
    } catch (err) {
      console.error('Erro ao excluir jogo:', err);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1">
          Catálogo de Jogos PlayStation
        </Typography>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Plataforma</InputLabel>
          <Select
            value={platform}
            label="Plataforma"
            onChange={handlePlatformChange}
          >
            <MenuItem value="all">Todas as Plataformas</MenuItem>
            <MenuItem value="PS4">PlayStation 4</MenuItem>
            <MenuItem value="PS5">PlayStation 5</MenuItem>
            <MenuItem value="Switch">Nintendo Switch</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3}>
        {games.map((game) => (
          <Grid item key={game.id} xs={12} sm={6} md={4} lg={3}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardMedia
                component="img"
                height="200"
                image={game.coverUrl || 'https://via.placeholder.com/300x200?text=No+Cover'}
                alt={game.name}
                sx={{ objectFit: 'cover', cursor: 'pointer' }}
                onClick={() => navigate(`/game/${game.id}`)}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography
                  gutterBottom
                  variant="h6"
                  component="h2"
                  sx={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/game/${game.id}`)}
                >
                  {game.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Plataforma: {game.platform}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Mídia: {game.mediaType}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Estado: {game.condition}
                </Typography>
              </CardContent>
              <CardActions>
                <IconButton
                  color="primary"
                  onClick={() => navigate(`/edit/${game.id}`)}
                  aria-label="editar"
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  color="error"
                  onClick={() => handleDeleteClick(game)}
                  aria-label="excluir"
                >
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Diálogo de confirmação de exclusão */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir o jogo "{gameToDelete?.name}"? Esta ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Home; 
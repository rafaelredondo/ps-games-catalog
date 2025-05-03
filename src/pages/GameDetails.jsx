import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import { useGames } from '../contexts/GamesContext';

function GameDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { games, loading, error, deleteGame } = useGames();
  const [game, setGame] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const foundGame = games.find(g => g.id === id);
    if (foundGame) {
      setGame(foundGame);
    }
  }, [games, id]);

  const handleDelete = async () => {
    try {
      await deleteGame(id);
      navigate('/');
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

  if (!game) {
    return (
      <Container>
        <Alert severity="warning" sx={{ mt: 2 }}>
          Jogo não encontrado
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h4" component="h1">
            {game.name}
          </Typography>
          <Box>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => navigate(`/edit/${id}`)}
              sx={{ mr: 2 }}
            >
              Editar
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={() => setDeleteDialogOpen(true)}
            >
              Excluir
            </Button>
          </Box>
        </Box>

        <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={4}>
          <Box flex={1}>
            <img
              src={game.coverUrl || 'https://via.placeholder.com/300x400?text=No+Cover'}
              alt={game.name}
              style={{
                width: '100%',
                maxWidth: '300px',
                height: 'auto',
                borderRadius: '8px',
              }}
            />
          </Box>

          <Box flex={2}>
            <Typography variant="h6" gutterBottom>
              Detalhes do Jogo
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" color="text.secondary">
                Plataforma
              </Typography>
              <Typography variant="body1">
                {game.platform}
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" color="text.secondary">
                Tipo de Mídia
              </Typography>
              <Typography variant="body1">
                {game.mediaType}
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" color="text.secondary">
                Estado
              </Typography>
              <Typography variant="body1">
                {game.condition}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ mt: 4 }}>
          <Button
            variant="contained"
            onClick={() => navigate('/')}
          >
            Voltar para a Lista
          </Button>
        </Box>
      </Paper>

      {/* Diálogo de confirmação de exclusão */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir o jogo "{game.name}"? Esta ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleDelete} color="error" autoFocus>
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default GameDetails; 
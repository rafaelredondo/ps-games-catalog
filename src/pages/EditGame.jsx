import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useGames } from '../contexts/GamesContext';

function EditGame() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { games, loading, error, updateGame } = useGames();
  const [game, setGame] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    platform: '',
    mediaType: '',
    condition: '',
    coverUrl: '',
  });
  const [updateError, setUpdateError] = useState(null);

  useEffect(() => {
    const foundGame = games.find(g => g.id === id);
    if (foundGame) {
      setGame(foundGame);
      setFormData({
        name: foundGame.name,
        platform: foundGame.platform,
        mediaType: foundGame.mediaType,
        condition: foundGame.condition,
        coverUrl: foundGame.coverUrl || '',
      });
    }
  }, [games, id]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await updateGame(id, formData);
      navigate(`/game/${id}`);
    } catch (err) {
      setUpdateError(err.response?.data?.message || 'Erro ao atualizar jogo');
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
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Editar Jogo
        </Typography>

        {updateError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {updateError}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Nome do Jogo"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            margin="normal"
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Plataforma</InputLabel>
            <Select
              name="platform"
              value={formData.platform}
              onChange={handleChange}
              required
              label="Plataforma"
            >
              <MenuItem value="PS4">PlayStation 4</MenuItem>
              <MenuItem value="PS5">PlayStation 5</MenuItem>
              <MenuItem value="Switch">Nintendo Switch</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>Tipo de Mídia</InputLabel>
            <Select
              name="mediaType"
              value={formData.mediaType}
              onChange={handleChange}
              required
              label="Tipo de Mídia"
            >
              <MenuItem value="Físico">Físico</MenuItem>
              <MenuItem value="Digital">Digital</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>Estado</InputLabel>
            <Select
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              required
              label="Estado"
            >
              <MenuItem value="Novo">Novo</MenuItem>
              <MenuItem value="Como Novo">Como Novo</MenuItem>
              <MenuItem value="Bom">Bom</MenuItem>
              <MenuItem value="Regular">Regular</MenuItem>
              <MenuItem value="Ruim">Ruim</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="URL da Capa"
            name="coverUrl"
            value={formData.coverUrl}
            onChange={handleChange}
            margin="normal"
            helperText="URL da imagem da capa do jogo (opcional)"
          />

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              fullWidth
            >
              Salvar Alterações
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => navigate(`/game/${id}`)}
              fullWidth
            >
              Cancelar
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
}

export default EditGame; 
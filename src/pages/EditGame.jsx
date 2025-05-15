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
  Chip,
} from '@mui/material';
import { useGames } from '../contexts/GamesContext';

function EditGame() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { games, loading, error, updateGame } = useGames();
  const [game, setGame] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    platforms: [],
    mediaTypes: [],
    coverUrl: '',
    released: '',
    metacritic: null,
    genres: [],
    publishers: [],
    description: '',
    status: 'Não iniciado',
    playTime: 0,
  });
  const [updateError, setUpdateError] = useState(null);

  const platformOptions = ["PlayStation 4", "PlayStation 5", "Nintendo Switch"];
  const mediaTypeOptions = ["Físico", "Digital"];
  const statusOptions = ["Não iniciado", "Jogando", "Concluído", "Abandonado", "Na fila"];

  useEffect(() => {
    const foundGame = games.find(g => g.id === id);
    if (foundGame) {
      let gameStatus = foundGame.status;
      if (!gameStatus) {
        gameStatus = foundGame.completed ? 'Concluído' : 'Não iniciado';
      }
      
      setGame(foundGame);
      setFormData({
        name: foundGame.name,
        platforms: foundGame.platforms || [],
        mediaTypes: foundGame.mediaTypes || [],
        coverUrl: foundGame.coverUrl || '',
        released: foundGame.released || '',
        metacritic: foundGame.metacritic || null,
        genres: foundGame.genres || [],
        publishers: foundGame.publishers || [],
        description: foundGame.description || '',
        status: gameStatus,
        playTime: foundGame.playTime || 0,
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

  const handlePlatformsChange = (event) => {
    setFormData(prev => ({
      ...prev,
      platforms: event.target.value
    }));
  };

  const handleMediaTypesChange = (event) => {
    setFormData(prev => ({
      ...prev,
      mediaTypes: event.target.value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      console.log('Dados sendo enviados para atualização:', formData);
      console.log('Status do jogo sendo atualizado:', formData.status);
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

          <FormControl fullWidth margin="normal" required>
            <InputLabel>Plataformas</InputLabel>
            <Select
              multiple
              name="platforms"
              value={formData.platforms}
              onChange={handlePlatformsChange}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} />
                  ))}
                </Box>
              )}
              label="Plataformas"
            >
              {platformOptions.map((platform) => (
                <MenuItem key={platform} value={platform}>
                  {platform}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal" required>
            <InputLabel>Tipos de Mídia</InputLabel>
            <Select
              multiple
              name="mediaTypes"
              value={formData.mediaTypes}
              onChange={handleMediaTypesChange}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} />
                  ))}
                </Box>
              )}
              label="Tipos de Mídia"
            >
              {mediaTypeOptions.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>Status do Jogo</InputLabel>
            <Select
              name="status"
              value={formData.status}
              onChange={handleChange}
              label="Status do Jogo"
            >
              <MenuItem value="">
                <em>Nenhum</em>
              </MenuItem>
              {statusOptions.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Tempo de Jogo (horas)"
            name="playTime"
            type="number"
            value={formData.playTime || ''}
            onChange={handleChange}
            margin="normal"
            inputProps={{ min: 0 }}
            helperText="Quanto tempo você jogou este jogo (em horas)"
          />

          <TextField
            fullWidth
            label="URL da Capa"
            name="coverUrl"
            value={formData.coverUrl}
            onChange={handleChange}
            margin="normal"
            helperText="URL da imagem da capa do jogo (opcional)"
          />

          <TextField
            fullWidth
            label="Data de Lançamento"
            name="released"
            type="date"
            value={formData.released ? formData.released.substring(0, 10) : ''}
            onChange={handleChange}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            fullWidth
            label="Pontuação Metacritic"
            name="metacritic"
            type="number"
            value={formData.metacritic || ''}
            onChange={handleChange}
            margin="normal"
            inputProps={{ min: 0, max: 100 }}
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
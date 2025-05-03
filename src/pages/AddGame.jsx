import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Autocomplete
} from '@mui/material';
import { useGames } from '../contexts/GamesContext';
import { searchGame } from '../services/rawgApi';

const AddGame = () => {
  const navigate = useNavigate();
  const { addGame } = useGames();
  const [formData, setFormData] = useState({
    name: '',
    platform: '',
    mediaType: '',
    coverUrl: '',
    rating: '',
    playtime: '',
    priority: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const handleSearch = async (searchTerm) => {
    if (!searchTerm) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const response = await fetch(
        `https://api.rawg.io/api/games?key=eb88977d653e45eb951a54fb21c02a4b&search=${searchTerm}&page_size=5`
      );
      const data = await response.json();
      setSearchResults(data.results || []);
    } catch (error) {
      console.error('Erro ao buscar jogos:', error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleGameSelect = async (game) => {
    if (!game) return;

    setLoading(true);
    try {
      const gameData = await searchGame(game.name);
      if (gameData) {
        setFormData(prev => ({
          ...prev,
          name: gameData.name,
          platform: gameData.platforms.find(p => 
            ['PlayStation 4', 'PlayStation 5', 'Nintendo Switch'].includes(p)
          ) || '',
          coverUrl: gameData.coverUrl,
          rating: gameData.rating.toString(),
          playtime: gameData.playtime.toString()
        }));
      }
    } catch (error) {
      setError('Erro ao carregar detalhes do jogo');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await addGame(formData);
      navigate('/');
    } catch (error) {
      setError('Erro ao adicionar jogo. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Adicionar Novo Jogo
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Autocomplete
            freeSolo
            options={searchResults}
            getOptionLabel={(option) => 
              typeof option === 'string' ? option : option.name
            }
            loading={searchLoading}
            onInputChange={(_, value) => handleSearch(value)}
            onChange={(_, value) => handleGameSelect(value)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Nome do Jogo"
                required
                fullWidth
                margin="normal"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {searchLoading ? (
                        <CircularProgress color="inherit" size={20} />
                      ) : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
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
              <MenuItem value="PlayStation 4">PlayStation 4</MenuItem>
              <MenuItem value="PlayStation 5">PlayStation 5</MenuItem>
              <MenuItem value="Nintendo Switch">Nintendo Switch</MenuItem>
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

          <TextField
            name="coverUrl"
            label="URL da Capa"
            value={formData.coverUrl}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />

          <TextField
            name="rating"
            label="Avaliação"
            type="number"
            value={formData.rating}
            onChange={handleChange}
            fullWidth
            margin="normal"
            inputProps={{ min: 0, max: 5, step: 0.1 }}
          />

          <TextField
            name="playtime"
            label="Tempo de Jogo (horas)"
            type="number"
            value={formData.playtime}
            onChange={handleChange}
            fullWidth
            margin="normal"
            inputProps={{ min: 0 }}
          />

          <TextField
            name="priority"
            label="Prioridade (1-10)"
            type="number"
            value={formData.priority}
            onChange={handleChange}
            fullWidth
            margin="normal"
            inputProps={{ min: 1, max: 10 }}
            helperText="Campo opcional"
          />

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Adicionar Jogo'}
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              fullWidth
              onClick={() => navigate('/')}
            >
              Cancelar
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default AddGame; 
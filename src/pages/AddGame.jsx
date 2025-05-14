import { useState, useEffect, useRef } from 'react';
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
  Autocomplete,
  Chip
} from '@mui/material';
import { useGames } from '../contexts/GamesContext';
import { searchGame } from '../services/rawgApi';

const AddGame = () => {
  const navigate = useNavigate();
  const { addGame } = useGames();
  const autocompleteRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    platforms: ['PlayStation 4'],
    mediaTypes: ['Digital'],
    coverUrl: '',
    released: '',
    metacritic: null,
    genres: [],
    publishers: [],
    description: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Efeito para focar no campo de nome do jogo quando o componente é montado
  useEffect(() => {
    // Pequeno timeout para garantir que o componente esteja completamente renderizado
    const timer = setTimeout(() => {
      if (autocompleteRef.current) {
        const input = autocompleteRef.current.querySelector('input');
        if (input) {
          input.focus();
        }
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  const platformOptions = ["PlayStation 4", "PlayStation 5", "Nintendo Switch"];
  const mediaTypeOptions = ["Físico", "Digital"];

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
          coverUrl: gameData.coverUrl,
          released: gameData.released || '',
          metacritic: gameData.metacritic || null,
          genres: gameData.genres || [],
          publishers: gameData.publishers || [],
          description: gameData.description || ''
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validar campos obrigatórios
    if (!formData.name || !formData.platforms.length || !formData.mediaTypes.length) {
      setError('Nome, plataformas e tipos de mídia são obrigatórios');
      setLoading(false);
      return;
    }

    try {
      await addGame(formData);
      navigate('/');
    } catch (error) {
      // Capturar a mensagem de erro específica do contexto
      if (error.message && error.message.includes('já existe')) {
        setError(error.message);
      } else {
        setError('Erro ao adicionar jogo. Tente novamente.');
      }
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
            ref={autocompleteRef}
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
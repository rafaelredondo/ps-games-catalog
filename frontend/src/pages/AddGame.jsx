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
  Chip,
  Collapse,
  IconButton,
  Stack,
  Tooltip,
  FormControlLabel,
  Switch
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useGames } from '../contexts/GamesContext';
import { searchGame } from '../services/rawgApi';
import { gamesService } from '../services/gamesService';
import PsPlusIcon from '../components/PsPlusIcon';

const AddGame = () => {
  const navigate = useNavigate();
  const { addGame, games } = useGames();
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
    description: '',
    status: 'Não iniciado',
    playTime: 0,
    isPsPlus: false
  });
  const [inputName, setInputName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showAdvancedFields, setShowAdvancedFields] = useState(false);
  const [availableGenres, setAvailableGenres] = useState([]);
  const [availablePublishers, setAvailablePublishers] = useState([]);
  const [inputGenres, setInputGenres] = useState([]);
  const [inputPublishers, setInputPublishers] = useState([]);

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

  // Efeito para extrair gêneros e publishers existentes no catálogo
  useEffect(() => {
    if (games && games.length > 0) {
      const genresSet = new Set();
      const publishersSet = new Set();

      games.forEach(game => {
        if (game.genres && Array.isArray(game.genres)) {
          game.genres.forEach(genre => {
            genresSet.add(genre);
          });
        }
        if (game.publishers && Array.isArray(game.publishers)) {
          game.publishers.forEach(publisher => {
            publishersSet.add(publisher);
          });
        }
      });

      setAvailableGenres(Array.from(genresSet).sort());
      setAvailablePublishers(Array.from(publishersSet).sort());
    }
  }, [games]);

  // Sincronizar inputGenres e inputPublishers com formData quando mudarem
  useEffect(() => {
    setInputGenres(formData.genres || []);
  }, [formData.genres]);

  useEffect(() => {
    setInputPublishers(formData.publishers || []);
  }, [formData.publishers]);

  const platformOptions = ["PlayStation 4", "PlayStation 5", "Nintendo Switch"];
  const mediaTypeOptions = ["Físico", "Digital"];
  const statusOptions = ["Não iniciado", "Jogando", "Concluído", "Abandonado", "Na fila"];

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
    if (!game) {
      // Se o valor foi limpo, atualizar apenas o nome no formData
      setFormData(prev => ({
        ...prev,
        name: ''
      }));
      return;
    }

    // Se é uma string, o usuário digitou um nome que não está nos resultados da API
    if (typeof game === 'string') {
      setFormData(prev => ({
        ...prev,
        name: game
      }));
      return;
    }

    setLoading(true);
    try {
      const gameData = await searchGame(game.name);
      if (gameData) {
        const newFormData = {
          ...formData,
          name: gameData.name,
          coverUrl: gameData.coverUrl,
          released: gameData.released || '',
          metacritic: gameData.metacritic || null,
          genres: gameData.genres || [],
          publishers: gameData.publishers || []
        };
        
        // Atualizar também os estados de input
        setInputGenres(gameData.genres || []);
        setInputPublishers(gameData.publishers || []);
        
        setFormData(newFormData);
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

  const handleGenresChange = (event, newValue) => {
    // Garantir que mesmo valores digitados diretamente sejam salvos como array
    const genres = newValue ? 
      (Array.isArray(newValue) ? newValue : [newValue]) : 
      [];
    
    // Atualizar o estado de rastreamento de gêneros
    setInputGenres(genres);
    
    // Atualizar o formData com os gêneros
    setFormData(prev => ({
      ...prev,
      genres: genres
    }));
  };

  const handlePublishersChange = (event, newValue) => {
    // Garantir que mesmo valores digitados diretamente sejam salvos como array
    const publishers = newValue ? 
      (Array.isArray(newValue) ? newValue : [newValue]) : 
      [];
    
    // Atualizar o estado de rastreamento de publishers
    setInputPublishers(publishers);
    
    // Atualizar o formData com os publishers
    setFormData(prev => ({
      ...prev,
      publishers: publishers
    }));
  };

  const handlePsPlusChange = (event) => {
    setFormData(prev => ({
      ...prev,
      isPsPlus: event.target.checked
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Usar o inputName como fallback se o nome no formData estiver vazio
    // E usar inputGenres e inputPublishers como a fonte definitiva desses valores
    const finalFormData = {
      ...formData,
      name: formData.name || inputName,
      genres: inputGenres,
      publishers: inputPublishers
    };

    // Log para debug
    console.log('Dados do formulário a serem enviados:', finalFormData);
    console.log('Status do jogo:', finalFormData.status);

    // Validar campos obrigatórios
    if (!finalFormData.name || !finalFormData.platforms.length || !finalFormData.mediaTypes.length) {
      setError('Nome, plataformas e tipos de mídia são obrigatórios');
      setLoading(false);
      return;
    }

    try {
      await addGame(finalFormData);
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

  const toggleAdvancedFields = () => {
    setShowAdvancedFields(!showAdvancedFields);
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
            onInputChange={(_, value) => {
              // Otimizar o gerenciamento de estado para evitar perda de foco
              const searchValue = value || '';
              setInputName(searchValue);
              
              // Atualizar formData de forma síncrona
              setFormData(prev => ({
                ...prev,
                name: searchValue
              }));
              
              // Disparar busca de forma otimizada
              if (searchValue.trim()) {
                handleSearch(searchValue);
              } else {
                setSearchResults([]);
              }
            }}
            onChange={(_, value) => handleGameSelect(value)}
            inputValue={inputName}
            ref={autocompleteRef}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Nome do Jogo"
                required
                fullWidth
                margin="normal"
                name="name"
                // Remover o onChange conflitante - o Autocomplete já gerencia via onInputChange
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

          <TextField
            fullWidth
            label="Pontuação Metacritic"
            type="number"
            name="metacritic"
            value={formData.metacritic || ''}
            onChange={handleChange}
            margin="normal"
            inputProps={{ min: 0, max: 100 }}
          />

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

          {/* Campo PS Plus */}
          <Box sx={{ mt: 2, mb: 1 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isPsPlus}
                  onChange={handlePsPlusChange}
                  color="primary"
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PsPlusIcon fontSize="small" sx={{ color: formData.isPsPlus ? '#0070f3' : 'rgba(0,0,0,0.6)' }} />
                  <Typography>
                    Disponível no PlayStation Plus
                  </Typography>
                </Box>
              }
            />
          </Box>

          <Box sx={{ mt: 2, mb: 2 }}>
            <Button
              variant="outlined"
              color="primary"
              onClick={toggleAdvancedFields}
              endIcon={<ExpandMoreIcon sx={{ transform: showAdvancedFields ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} />}
              fullWidth
            >
              {showAdvancedFields ? 'Ocultar Campos Adicionais' : 'Mostrar Campos Adicionais'}
            </Button>
          </Box>

          <Collapse in={showAdvancedFields}>
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="URL da Capa"
                name="coverUrl"
                value={formData.coverUrl}
                onChange={handleChange}
                margin="normal"
              />

              <TextField
                fullWidth
                label="Data de Lançamento"
                name="released"
                type="date"
                value={formData.released}
                onChange={handleChange}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />

              <Tooltip 
                title="Selecione gêneros existentes ou digite um novo e pressione Enter para adicionar"
                placement="top-start"
                arrow
              >
                <Autocomplete
                  multiple
                  freeSolo
                  options={availableGenres}
                  value={inputGenres}
                  onChange={handleGenresChange}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Gêneros"
                      placeholder="Adicione gêneros"
                      margin="normal"
                      helperText="Selecione da lista ou digite um novo e pressione Enter"
                    />
                  )}
                  onBlur={() => {
                    // Atualizar formData quando o campo perde o foco
                    setFormData(prev => ({
                      ...prev,
                      genres: inputGenres
                    }));
                  }}
                />
              </Tooltip>

              <Tooltip 
                title="Selecione publishers existentes ou digite um novo e pressione Enter para adicionar"
                placement="top-start"
                arrow
              >
                <Autocomplete
                  multiple
                  freeSolo
                  options={availablePublishers}
                  value={inputPublishers}
                  onChange={handlePublishersChange}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Publishers"
                      placeholder="Adicione publishers"
                      margin="normal"
                      helperText="Selecione da lista ou digite um novo e pressione Enter"
                    />
                  )}
                  onBlur={() => {
                    // Atualizar formData quando o campo perde o foco
                    setFormData(prev => ({
                      ...prev,
                      publishers: inputPublishers
                    }));
                  }}
                />
              </Tooltip>

              <TextField
                fullWidth
                label="Descrição"
                name="description"
                value={formData.description}
                onChange={handleChange}
                margin="normal"
                multiline
                rows={4}
              />
            </Stack>
          </Collapse>

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
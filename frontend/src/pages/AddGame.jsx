import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../contexts/NotificationContext';
import {
  Typography,
  TextField,
  Box,
  Alert,
  CircularProgress,
  Autocomplete,
  Collapse,
  IconButton,
  Stack,
  Tooltip
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useGames } from '../contexts/GamesContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { searchGame } from '../services/rawgApi';
import { gamesService } from '../services/gamesService';

// Componentes padronizados
import ActionButton from '../components/ActionButton';
import CancelButton from '../components/CancelButton';
import FilterButton from '../components/FilterButton';
import FormCard from '../components/FormCard';

// Componentes de Input padronizados
import FormField from '../components/FormField';
import ChipSelect from '../components/ChipSelect';
import FilterSelect from '../components/FilterSelect';

// Custom hooks otimizados
import useDropdownOptions from '../hooks/useDropdownOptions';

const AddGame = () => {
  const navigate = useNavigate();
  const { addGame } = useGames();
  const { notify } = useNotification();
  const autocompleteRef = useRef(null);
  
  // Hook otimizado para opções de dropdown
  const { options: dropdownOptions, loading: optionsLoading } = useDropdownOptions();
  
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
    playTime: 0
  });
  const [inputName, setInputName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showAdvancedFields, setShowAdvancedFields] = useState(false);
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



  // Sincronizar inputGenres e inputPublishers com formData quando mudarem
  useEffect(() => {
    setInputGenres(formData.genres || []);
  }, [formData.genres]);

  useEffect(() => {
    setInputPublishers(formData.publishers || []);
  }, [formData.publishers]);

  // Opções locais para campos que não dependem do backend
  const mediaTypeOptions = ["Físico", "Digital"];

  const handleSearch = async (searchTerm) => {
    setInputName(searchTerm); // Salvar o valor digitado independentemente dos resultados da API
    
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
      
      // Notificação de sucesso
      notify.success(
        `Jogo "${finalFormData.name}" adicionado com sucesso!`,
        {
          title: 'Sucesso',
          duration: 4000
        }
      );
      
      navigate('/');
    } catch (error) {
      // Capturar a mensagem de erro específica do contexto
      let errorMessage = 'Erro ao adicionar jogo. Tente novamente.';
      
      if (error.message && error.message.includes('já existe')) {
        errorMessage = error.message;
      }
      
      // Usar apenas a nova notificação (removendo duplicação)
      notify.error(errorMessage, {
        title: 'Erro ao Adicionar Jogo',
        allowRetry: true,
        retryText: 'Tentar Novamente',
        onRetry: () => {
          handleSubmit(e);
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleAdvancedFields = () => {
    setShowAdvancedFields(!showAdvancedFields);
  };

  return (
    <FormCard maxWidth="sm">
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
                onChange={(e) => {
                  // Atualizar diretamente o formData quando o valor do input muda
                  const value = e.target.value;
                  setInputName(value);
                  setFormData(prev => ({
                    ...prev,
                    name: value
                  }));
                }}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {searchLoading ? (
                        <LoadingSpinner variant="inline" size="small" color="inherit" />
                      ) : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />

          <ChipSelect
            value={formData.platforms}
            onChange={handlePlatformsChange}
            label="Plataformas"
            options={dropdownOptions.platforms}
            required
          />

          <ChipSelect
            value={formData.mediaTypes}
            onChange={handleMediaTypesChange}
            label="Tipos de Mídia"
            options={mediaTypeOptions}
            required
          />

          <FormField
            label="Pontuação Metacritic"
            type="number"
            name="metacritic"
            value={formData.metacritic || ''}
            onChange={handleChange}
            inputProps={{ min: 0, max: 100 }}
          />

          <FilterSelect
            value={formData.status}
            onChange={handleChange}
            label="Status do Jogo"
            options={dropdownOptions.statuses}
            allOptionValue=""
            allOptionLabel="Nenhum"
          />

          <FormField
            label="Tempo de Jogo (horas)"
            name="playTime"
            type="number"
            value={formData.playTime || ''}
            onChange={handleChange}
            inputProps={{ min: 0 }}
            helperText="Quanto tempo você jogou este jogo (em horas)"
          />

          <Box sx={{ mt: 2, mb: 2 }}>
            <FilterButton
              variant="toggle"
              onClick={toggleAdvancedFields}
              endIcon={<ExpandMoreIcon sx={{ transform: showAdvancedFields ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} />}
              fullWidth
            >
              {showAdvancedFields ? 'Ocultar Campos Adicionais' : 'Mostrar Campos Adicionais'}
            </FilterButton>
          </Box>

          <Collapse in={showAdvancedFields}>
            <Stack spacing={2}>
              <FormField
                label="URL da Capa"
                name="coverUrl"
                value={formData.coverUrl}
                onChange={handleChange}
              />

              <FormField
                label="Data de Lançamento"
                name="released"
                type="date"
                value={formData.released}
                onChange={handleChange}
              />

              <Tooltip 
                title="Selecione gêneros existentes ou digite um novo e pressione Enter para adicionar"
                placement="top-start"
                arrow
              >
                <ChipSelect
                  freeSolo
                  value={inputGenres}
                  onChange={handleGenresChange}
                  options={dropdownOptions.genres}
                  label="Gêneros"
                  placeholder="Adicione gêneros"
                  helperText="Selecione da lista ou digite um novo e pressione Enter"
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
                <ChipSelect
                  freeSolo
                  value={inputPublishers}
                  onChange={handlePublishersChange}
                  options={dropdownOptions.publishers}
                  label="Publishers"
                  placeholder="Adicione publishers"
                  helperText="Selecione da lista ou digite um novo e pressione Enter"
                  onBlur={() => {
                    // Atualizar formData quando o campo perde o foco
                    setFormData(prev => ({
                      ...prev,
                      publishers: inputPublishers
                    }));
                  }}
                />
              </Tooltip>

              <FormField
                label="Descrição"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={4}
              />
            </Stack>
          </Collapse>

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <ActionButton
              type="submit"
              variant="primary"
              fullWidth
              loading={loading}
            >
              Adicionar Jogo
            </ActionButton>
            <CancelButton
              variant="back"
              fullWidth
              onClick={() => navigate('/')}
            >
              Cancelar
            </CancelButton>
          </Box>
        </Box>
    </FormCard>
  );
};

export default AddGame; 
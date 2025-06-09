import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNotification } from '../contexts/NotificationContext';
import {
  Typography,
  Box,
  Alert,
  CircularProgress,
  Container,
} from '@mui/material';
import { useGames } from '../contexts/GamesContext';
import LoadingSpinner from '../components/LoadingSpinner';

// Componentes padronizados
import ActionButton from '../components/ActionButton';
import CancelButton from '../components/CancelButton';
import FormCard from '../components/FormCard';

// Componentes de Input padronizados
import FormField from '../components/FormField';
import ChipSelect from '../components/ChipSelect';
import FilterSelect from '../components/FilterSelect';

// Custom hooks otimizados
import useDropdownOptions from '../hooks/useDropdownOptions';

function EditGame() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { games, loading, error, updateGame } = useGames();
  const { notify } = useNotification();
  
  // Hook otimizado para opções de dropdown
  const { options: dropdownOptions, loading: optionsLoading } = useDropdownOptions();
  
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
  const [inputPublishers, setInputPublishers] = useState([]);

  // Opções locais para campos que não dependem do backend
  const mediaTypeOptions = ["Físico", "Digital"];

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
      setInputPublishers(foundGame.publishers || []);
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      console.log('Dados sendo enviados para atualização:', formData);
      console.log('Status do jogo sendo atualizado:', formData.status);
      await updateGame(id, formData);
      
      // Notificação de sucesso com detalhes
      notify.success(
        `Jogo "${formData.name}" atualizado com sucesso!`,
        {
          title: 'Atualização Concluída',
          duration: 4000
        }
      );
      
      navigate(`/game/${id}`);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erro ao atualizar jogo';
      
      // Usar apenas notificação (sem duplicação)
      notify.error(errorMessage, {
        title: 'Erro na Atualização',
        allowRetry: true,
        retryText: 'Tentar Novamente',
        onRetry: () => {
          handleSubmit(event);
        }
      });
    }
  };

  if (loading) {
    return <LoadingSpinner variant="page" />;
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
    <FormCard maxWidth="sm">
      <Typography variant="h4" component="h1" gutterBottom>
        Editar Jogo
      </Typography>



      <form onSubmit={handleSubmit}>
          <FormField
            label="Nome do Jogo"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
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

          <FilterSelect
            value={formData.status}
            onChange={handleChange}
            label="Status do Jogo"
            name="status"
            options={dropdownOptions.statuses}
            allOptionValue=""
            allOptionLabel="Nenhum"
          />

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

          <FormField
            label="Tempo de Jogo (horas)"
            name="playTime"
            type="number"
            value={formData.playTime || ''}
            onChange={handleChange}
            inputProps={{ min: 0 }}
            helperText="Quanto tempo você jogou este jogo (em horas)"
          />

          <FormField
            label="URL da Capa"
            name="coverUrl"
            value={formData.coverUrl}
            onChange={handleChange}
            helperText="URL da imagem da capa do jogo (opcional)"
          />

          <FormField
            label="Data de Lançamento"
            name="released"
            type="date"
            value={formData.released ? formData.released.substring(0, 10) : ''}
            onChange={handleChange}
          />

          <FormField
            label="Pontuação Metacritic"
            name="metacritic"
            type="number"
            value={formData.metacritic || ''}
            onChange={handleChange}
            inputProps={{ min: 0, max: 100 }}
          />

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <ActionButton
              variant="primary"
              type="submit"
              fullWidth
            >
              Salvar Alterações
            </ActionButton>
            <CancelButton
              variant="back"
              onClick={() => navigate(`/game/${id}`)}
              fullWidth
            >
              Cancelar
            </CancelButton>
          </Box>
        </form>
    </FormCard>
  );
}

export default EditGame; 
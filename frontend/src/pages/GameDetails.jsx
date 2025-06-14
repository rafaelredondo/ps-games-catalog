import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Chip,
  Divider,
  Grid,
  Link,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useGames } from '../contexts/GamesContext';
import { Edit as EditIcon, Delete as DeleteIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { VideogameAsset as VideogameAssetIcon, Save as SaveIcon, CalendarMonth as CalendarIcon, Timer as TimerIcon, Flag as FlagIcon } from '@mui/icons-material';
import { getMetacriticColor, getMetacriticClassification } from '../utils/metacriticUtils';
import LoadingSpinner from '../components/LoadingSpinner';
import PsPlusIcon from '../components/PsPlusIcon';

// Componentes padronizados
import ActionButton from '../components/ActionButton';
import CancelButton from '../components/CancelButton';
import NavigationButton from '../components/NavigationButton';
import DetailsCard from '../components/DetailsCard';
import ConfirmDialog from '../components/ConfirmDialog';

function GameDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { games, loading, error, deleteGame } = useGames();
  const [game, setGame] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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

  const CategoryTitle = ({ children }) => (
    <Typography 
      variant="subtitle2" 
      sx={{ 
        color: 'rgba(255,255,255,0.6)', 
        fontWeight: 500,
        fontSize: '0.85rem',
        mb: 0.75,
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }}
    >
      {children}
    </Typography>
  );

  const CategoryValue = ({ children, component = Typography, ...props }) => {
    const Component = component;
    return (
      <Component
        variant="body1"
        sx={{ 
          color: '#fff', 
          fontWeight: 500,
          fontSize: '1rem',
          mb: 2,
          ...props.sx
        }}
        {...props}
      >
        {children}
      </Component>
    );
  };

  return (
    <>
      <DetailsCard
        title={game.name}
        subtitle={game.released ? `(${new Date(game.released).getFullYear()})` : ''}
        imageUrl={game.coverUrl || 'https://via.placeholder.com/1200x500?text=No+Cover'}
        imageAlt={game.name}
        maxWidth="md"
        darkTheme={true}
      >
        
        {/* Botões de ação e Chip Metacritic */}
        <Box 
          sx={{ 
            p: 2, 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            borderBottom: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          {/* Metacritic Score e Classificação */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {game.metacritic ? (
              <>
                <Chip
                  label={game.metacritic}
                  sx={{
                    bgcolor: getMetacriticColor(game.metacritic),
                    color: 'white',
                    fontWeight: 'bold',
                    height: 28,
                  }}
                />
                <Chip
                  label={getMetacriticClassification(game.metacritic)}
                  sx={{ 
                    bgcolor: getMetacriticColor(game.metacritic),
                    color: 'white',
                    fontWeight: 'bold',
                    height: 28,
                  }}
                />
              </>
            ) : null}
            
            {/* Chip PS Plus */}
            {game.isPsPlus && (
              <Chip
                icon={<PsPlusIcon fontSize="small" sx={{ color: 'white !important' }} />}
                label="PS Plus"
                sx={{
                  bgcolor: '#0070f3',
                  color: 'white',
                  fontWeight: 'bold',
                  height: 28,
                  '& .MuiChip-icon': {
                    color: 'white'
                  }
                }}
              />
            )}
          </Box>

          {/* Botões */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <NavigationButton
              variant="secondary"
              onClick={() => navigate(`/edit/${id}`)}
              startIcon={<EditIcon />}
              size="small"
              sx={isMobile ? { 
                minWidth: 40,
                width: 40,
                height: 40,
                padding: 1,
                '& .MuiButton-startIcon': {
                  margin: 0
                }
              } : {}}
            >
              {!isMobile && 'Editar'}
            </NavigationButton>
            <ActionButton
              variant="error"
              onClick={() => setDeleteDialogOpen(true)}
              startIcon={<DeleteIcon />}
              size="small"
              sx={isMobile ? { 
                minWidth: 40,
                width: 40,
                height: 40,
                padding: 1,
                '& .MuiButton-startIcon': {
                  margin: 0
                }
              } : {}}
            >
              {!isMobile && 'Excluir'}
            </ActionButton>
          </Box>
        </Box>

        {/* Conteúdo principal - Informações do jogo */}
        <Box sx={{ p: 3 }}>
          <Grid container spacing={3}>
            {/* Plataformas */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <CategoryTitle>Plataformas</CategoryTitle>
              <CategoryValue component={Box} sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                {game.platforms && game.platforms.map((platform) => (
                  <Chip
                    key={platform}
                    label={platform}
                    size="small"
                    sx={{ 
                      bgcolor: 'rgba(255,255,255,0.1)',
                      color: 'white',
                      mb: 0.5,
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.2)'
                      }
                    }}
                    clickable
                  />
                ))}
              </CategoryValue>
            </Grid>
            
            {/* Gêneros */}
            {game.genres && game.genres.length > 0 && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <CategoryTitle>Gênero</CategoryTitle>
                <CategoryValue component={Box} sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                  {game.genres.map((genre) => (
                    <Chip
                      key={genre}
                      label={genre}
                      size="small"
                      sx={{ 
                        bgcolor: 'rgba(255,255,255,0.1)',
                        color: 'white',
                        mb: 0.5,
                        '&:hover': {
                          bgcolor: 'rgba(255,255,255,0.2)'
                        }
                      }}
                      clickable
                    />
                  ))}
                </CategoryValue>
              </Grid>
            )}
            
            {/* Data de Lançamento */}
            {game.released && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <CategoryTitle>Data de Lançamento</CategoryTitle>
                <CategoryValue>
                  {new Date(game.released).toLocaleDateString('pt-BR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </CategoryValue>
              </Grid>
            )}
            
            {/* Publishers/Developers */}
            {game.publishers && game.publishers.length > 0 && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <CategoryTitle>Publisher</CategoryTitle>
                <CategoryValue component={Box} sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                  {game.publishers.map((publisher) => (
                    <Chip
                      key={publisher}
                      label={publisher}
                      size="small"
                      sx={{ 
                        bgcolor: 'rgba(255,255,255,0.1)',
                        color: 'white',
                        mb: 0.5,
                        '&:hover': {
                          bgcolor: 'rgba(255,255,255,0.2)'
                        }
                      }}
                      clickable
                    />
                  ))}
                </CategoryValue>
              </Grid>
            )}
            
            {/* Tipos de Mídia */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <CategoryTitle>Mídia</CategoryTitle>
              <CategoryValue>
                {game.mediaTypes && game.mediaTypes.join(', ')}
              </CategoryValue>
            </Grid>
            
            {/* Status */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <CategoryTitle>Status</CategoryTitle>
              <CategoryValue component={Box}>
                {game.status ? (
                  <Chip
                    label={game.status}
                    size="small"
                    icon={<FlagIcon fontSize="small" />}
                    sx={{ 
                      bgcolor: 
                        game.status === 'Concluído' ? '#2e7d32' : 
                        game.status === 'Jogando' ? '#1976d2' :
                        game.status === 'Na fila' ? '#ed6c02' :
                        game.status === 'Abandonado' ? '#d32f2f' : 
                        '#333',
                      color: 'white'
                    }}
                  />
                ) : (
                  <Chip
                    label={game.completed ? "Concluído" : "Não iniciado"}
                    size="small"
                    icon={<FlagIcon fontSize="small" />}
                    sx={{ 
                      bgcolor: game.completed ? '#2e7d32' : '#333',
                      color: 'white'
                    }}
                  />
                )}
              </CategoryValue>
            </Grid>
            
            {/* PlayStation Plus */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <CategoryTitle>PlayStation Plus</CategoryTitle>
              <CategoryValue component={Box}>
                {game.isPsPlus ? (
                  <Chip
                    icon={<PsPlusIcon fontSize="small" sx={{ color: 'white !important' }} />}
                    label="Disponível no PS Plus"
                    size="small"
                    sx={{
                      bgcolor: '#0070f3',
                      color: 'white',
                      fontWeight: 'bold',
                      '& .MuiChip-icon': {
                        color: 'white'
                      }
                    }}
                  />
                ) : (
                  <Typography sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    Não disponível no PS Plus
                  </Typography>
                )}
              </CategoryValue>
            </Grid>
            
            {/* Tempo de Jogo */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <CategoryTitle>Tempo de Jogo</CategoryTitle>
              <CategoryValue component={Box}>
                {game.playTime > 0 ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <TimerIcon fontSize="small" />
                    <Typography>
                      {game.playTime} {game.playTime === 1 ? 'hora' : 'horas'}
                    </Typography>
                  </Box>
                ) : (
                  <Typography>
                    Não registrado
                  </Typography>
                )}
              </CategoryValue>
            </Grid>
          </Grid>
          
          {/* Descrição - span completo */}
          {game.description && (
            <Box sx={{ mt: 3 }}>
              <Divider sx={{ mb: 3, bgcolor: 'rgba(255,255,255,0.1)' }} />
              <CategoryTitle>Descrição</CategoryTitle>
              <Typography 
                variant="body2" 
                sx={{ 
                  lineHeight: 1.7,
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: '0.9rem'
                }}
              >
                {game.description}
              </Typography>
            </Box>
          )}
        </Box>
        
        {/* Rodapé com botão voltar */}
        <Box sx={{ 
          p: 2, 
          display: 'flex', 
          justifyContent: 'center',
          borderTop: '1px solid rgba(255,255,255,0.1)'
        }}>
          <NavigationButton
            variant="primary"
            onClick={() => navigate('/')}
            startIcon={<ArrowBackIcon />}
            size="small"
            sx={{ textTransform: 'none', fontWeight: 500 }}
          >
            Voltar para o Catálogo
          </NavigationButton>
        </Box>
    </DetailsCard>

      {/* Diálogo de confirmação de exclusão */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir o jogo "${game.name}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        severity="error"
        titleId="delete-dialog-title"
        descriptionId="delete-dialog-description"
      />
    </>
  );
}

export default GameDetails; 
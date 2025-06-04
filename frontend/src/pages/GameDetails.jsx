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
  Chip,
  Divider,
  Grid,
  Link,
} from '@mui/material';
import { useGames } from '../contexts/GamesContext';
import { Edit as EditIcon, Delete as DeleteIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { VideogameAsset as VideogameAssetIcon, Save as SaveIcon, CalendarMonth as CalendarIcon, Timer as TimerIcon, Flag as FlagIcon } from '@mui/icons-material';

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

  const getMetacriticColor = (score) => {
    if (!score) return '#888';
    if (score >= 75) return '#6c3';
    if (score >= 50) return '#fc3';
    return '#f00';
  };

  // Função para determinar a classificação baseada no Metacritic
  const getClassificacao = (score) => {
    if (!score) return '❓ Desconhecido';
    if (score >= 95) return '🏆 Obra-Prima';
    if (score >= 85) return '🌟 Lendário';
    if (score >= 70) return '👍 Jogável';
    if (score >= 50) return '😐 Genérico';
    return '🐞 Bugado';
  };
  
  // Função para determinar a cor da classificação
  const getClassificacaoColor = (score) => {
    if (!score) return '#888';
    if (score >= 95) return '#9c27b0'; // Roxo para Obra-Prima
    if (score >= 85) return '#2196f3'; // Azul para Lendário
    if (score >= 70) return '#4caf50'; // Verde para Jogável
    if (score >= 50) return '#ff9800'; // Laranja para Genérico
    return '#f44336'; // Vermelho para Bugado
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
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          bgcolor: '#222', 
          borderRadius: 2,
          boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
          overflow: 'hidden',
          maxWidth: { sm: '650px', md: '750px' },
          mx: 'auto'
        }}
      >
        {/* Área da Imagem - Ocupando toda a largura */}
        <Box sx={{ position: 'relative', width: '100%' }}>
          <Box
            component="img"
            src={game.coverUrl || 'https://via.placeholder.com/1200x500?text=No+Cover'}
            alt={game.name}
            sx={{
              width: '100%',
              height: { xs: '180px', sm: '250px' },
              objectFit: 'cover',
              filter: 'brightness(0.85)',
            }}
          />
          
          {/* Título sobreposto na imagem */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              p: 2,
              background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 70%, rgba(0,0,0,0) 100%)',
            }}
          >
            <Typography variant="h5" component="h1" sx={{ 
              fontWeight: 'bold', 
              textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              {game.name}
              {game.released && (
                <Typography component="span" variant="subtitle1" sx={{ 
                  opacity: 0.8,
                  fontWeight: 'normal'
                }}>
                  ({new Date(game.released).getFullYear()})
                </Typography>
              )}
            </Typography>
          </Box>
        </Box>
        
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
          <Box sx={{ display: 'flex', gap: 1 }}>
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
                  label={getClassificacao(game.metacritic)}
                  sx={{
                    bgcolor: getClassificacaoColor(game.metacritic),
                    color: 'white',
                    fontWeight: 'bold',
                    height: 28,
                  }}
                />
              </>
            ) : (
              <div></div>
            )}
          </Box>

          {/* Botões */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => navigate(`/edit/${id}`)}
              startIcon={<EditIcon />}
              size="small"
            >
              Editar
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={() => setDeleteDialogOpen(true)}
              startIcon={<DeleteIcon />}
              size="small"
            >
              Excluir
            </Button>
          </Box>
        </Box>

        {/* Conteúdo principal - Informações do jogo */}
        <Box sx={{ p: 3 }}>
          <Grid container spacing={3}>
            {/* Plataformas */}
            <Grid item xs={12} sm={6}>
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
              <Grid item xs={12} sm={6}>
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
              <Grid item xs={12} sm={6}>
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
              <Grid item xs={12} sm={6}>
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
            <Grid item xs={12} sm={6}>
              <CategoryTitle>Mídia</CategoryTitle>
              <CategoryValue>
                {game.mediaTypes && game.mediaTypes.join(', ')}
              </CategoryValue>
            </Grid>
            
            {/* Status */}
            <Grid item xs={12} sm={6}>
              <CategoryTitle>Status</CategoryTitle>
              <CategoryValue>
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
            
            {/* Tempo de Jogo */}
            <Grid item xs={12} sm={6}>
              <CategoryTitle>Tempo de Jogo</CategoryTitle>
              <CategoryValue>
                {game.playTime > 0 ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <TimerIcon fontSize="small" />
                    <Typography>
                      {game.playTime} {game.playTime === 1 ? 'hora' : 'horas'}
                    </Typography>
                  </Box>
                ) : (
                  "Não registrado"
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
          <Button
            variant="contained"
            onClick={() => navigate('/')}
            startIcon={<ArrowBackIcon />}
            size="small"
            sx={{ textTransform: 'none', fontWeight: 500 }}
          >
            Voltar para o Catálogo
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
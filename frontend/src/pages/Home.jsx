import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Chip,
  Button,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  ToggleButtonGroup,
  ToggleButton,
  TableSortLabel,
  Tooltip,
  useMediaQuery,
  useTheme
} from '@mui/material';

import DeleteIcon from '@mui/icons-material/Delete';
import VideogameAssetIcon from '@mui/icons-material/VideogameAsset';
import SearchIcon from '@mui/icons-material/Search';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewListIcon from '@mui/icons-material/ViewList';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import DoneIcon from '@mui/icons-material/Done';
import { useGames } from '../contexts/GamesContext';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import { gamesService } from '../services/gamesService';

function Home() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Estados dos filtros  
  const [searchTerm, setSearchTerm] = useState(() => {
    return localStorage.getItem('filter_search') || '';
  });
  const [platform, setPlatform] = useState(() => {
    return localStorage.getItem('filter_platform') || 'all';
  });
  
  // Hook de infinite scroll com filtros básicos
  const {
    games: allGames,
    loading,
    hasMore,
    error,
    sentinelRef,
    refresh
  } = useInfiniteScroll(gamesService.getPaginated, {
    limit: 20,
    search: searchTerm,
    platform: platform === 'all' ? '' : platform
  });
  
  // Contexto para operações de CRUD
  const { deleteGame, updateGame } = useGames();
  const [minMetacritic, setMinMetacritic] = useState(() => {
    return localStorage.getItem('filter_metacritic') || '';
  });
  const [selectedGenre, setSelectedGenre] = useState(() => {
    return localStorage.getItem('filter_genre') || 'all';
  });
  const [selectedPublisher, setSelectedPublisher] = useState(() => {
    return localStorage.getItem('filter_publisher') || 'all';
  });
  const [selectedStatus, setSelectedStatus] = useState(() => {
    return localStorage.getItem('filter_status') || 'all';
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [gameToDelete, setGameToDelete] = useState(null);
  const [availablePublishers, setAvailablePublishers] = useState([]);
  const [availableGenres, setAvailableGenres] = useState([]);
  const [availablePlatforms, setAvailablePlatforms] = useState([]);
  const [viewMode, setViewMode] = useState(() => {
    // Recuperar o modo de visualização do localStorage ou usar 'card' como padrão
    return localStorage.getItem('viewMode') || 'card';
  });
  const [orderBy, setOrderBy] = useState(() => {
    // Recuperar a coluna de ordenação do localStorage ou usar 'name' como padrão
    return localStorage.getItem('orderBy') || 'name';
  });
  const [order, setOrder] = useState(() => {
    // Recuperar a direção de ordenação do localStorage ou usar 'asc' como padrão
    return localStorage.getItem('order') || 'asc';
  });
  const [completedDialogOpen, setCompletedDialogOpen] = useState(false);
  const [gameToMarkCompleted, setGameToMarkCompleted] = useState(null);

  // Aplicar filtros avançados usando useMemo para evitar re-renderizações
  const filteredGames = useMemo(() => {
    let result = [...allGames];
    
    // Filtro de metacritic mínimo
    if (minMetacritic !== '' && !isNaN(parseInt(minMetacritic))) {
      const minScore = parseInt(minMetacritic);
      result = result.filter(game => 
        game.metacritic && game.metacritic >= minScore
      );
    }
    
    // Filtro de gênero
    if (selectedGenre !== 'all') {
      result = result.filter(game => 
        game.genres && game.genres.includes(selectedGenre)
      );
    }
    
    // Filtro de publisher
    if (selectedPublisher !== 'all') {
      result = result.filter(game => 
        game.publishers && game.publishers.includes(selectedPublisher)
      );
    }
    
    // Filtro de status
    if (selectedStatus !== 'all') {
      const isCompleted = selectedStatus === 'completed';
      result = result.filter(game => game.completed === isCompleted);
    }
    
    return result;
  }, [allGames, minMetacritic, selectedGenre, selectedPublisher, selectedStatus]);

  // Extrair plataformas, publishers e gêneros únicos dos jogos
  useEffect(() => {
    if (allGames.length > 0) {
      const publishers = new Set();
      const genres = new Set();
      const platforms = new Set();
      
      allGames.forEach(game => {
        if (game.publishers && Array.isArray(game.publishers)) {
          game.publishers.forEach(publisher => {
            publishers.add(publisher);
          });
        }
        
        if (game.genres && Array.isArray(game.genres)) {
          game.genres.forEach(genre => {
            genres.add(genre);
          });
        }
        
        if (game.platforms && Array.isArray(game.platforms)) {
          game.platforms.forEach(platform => {
            platforms.add(platform);
          });
        }
      });
      
      setAvailablePublishers(Array.from(publishers).sort());
      setAvailableGenres(Array.from(genres).sort());
      setAvailablePlatforms(Array.from(platforms).sort());
    }
  }, [allGames]);

  // Funções de manipulação otimizadas com useCallback
  const handlePlatformChange = useCallback((event) => {
    const value = event.target.value;
    setPlatform(value);
    localStorage.setItem('filter_platform', value);
  }, []);

  const handleSearch = useCallback((event) => {
    const value = event.target.value;
    setSearchTerm(value);
    localStorage.setItem('filter_search', value);
  }, []);

  const handleMinMetacriticChange = useCallback((event) => {
    const value = event.target.value;
    setMinMetacritic(value);
    localStorage.setItem('filter_metacritic', value);
  }, []);

  const handleGenreChange = useCallback((event) => {
    const value = event.target.value;
    setSelectedGenre(value);
    localStorage.setItem('filter_genre', value);
  }, []);

  const handlePublisherChange = useCallback((event) => {
    const value = event.target.value;
    setSelectedPublisher(value);
    localStorage.setItem('filter_publisher', value);
  }, []);

  const handleStatusChange = useCallback((event) => {
    const value = event.target.value;
    setSelectedStatus(value);
    localStorage.setItem('filter_status', value);
  }, []);

  const handleCardClick = useCallback((gameId) => {
    navigate(`/game/${gameId}`);
  }, [navigate]);

  const handleViewModeChange = useCallback((event, newViewMode) => {
    if (newViewMode !== null) {
      setViewMode(newViewMode);
      // Salvar o modo de visualização escolhido no localStorage
      localStorage.setItem('viewMode', newViewMode);
    }
  }, []);

  const getMetacriticColor = useCallback((score) => {
    if (!score) return '#888';
    if (score >= 75) return '#6c3';
    if (score >= 50) return '#fc3';
    return '#f00';
  }, []);

  // Funções de ordenação de tabela
  const handleRequestSort = useCallback((property) => {
    const isAsc = orderBy === property && order === 'asc';
    const newOrder = isAsc ? 'desc' : 'asc';
    setOrder(newOrder);
    setOrderBy(property);
    
    // Salvar as configurações de ordenação no localStorage
    localStorage.setItem('orderBy', property);
    localStorage.setItem('order', newOrder);
  }, [orderBy, order]);

  const getComparator = useCallback((order, orderBy) => {
    return order === 'desc'
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  }, []);

  const descendingComparator = useCallback((a, b, orderBy) => {
    // Tratamento especial para diferentes tipos de campos
    if (orderBy === 'name') {
      return b.name.localeCompare(a.name);
    } 
    else if (orderBy === 'platforms') {
      const platformsA = a.platforms ? a.platforms.join(', ') : '';
      const platformsB = b.platforms ? b.platforms.join(', ') : '';
      return platformsB.localeCompare(platformsA);
    }
    else if (orderBy === 'genres') {
      const genresA = a.genres ? a.genres.join(', ') : '';
      const genresB = b.genres ? b.genres.join(', ') : '';
      return genresB.localeCompare(genresA);
    }
    else if (orderBy === 'year') {
      const yearA = a.released ? new Date(a.released).getFullYear() : 0;
      const yearB = b.released ? new Date(b.released).getFullYear() : 0;
      return yearB - yearA;
    }
    else if (orderBy === 'metacritic') {
      const scoreA = a.metacritic || 0;
      const scoreB = b.metacritic || 0;
      return scoreB - scoreA;
    }
    return 0;
  }, []);

  // Função para limpar todos os filtros
  const handleClearFilters = useCallback(() => {
    // Redefine todos os estados para valores padrão
    setPlatform('all');
    setSearchTerm('');
    setMinMetacritic('');
    setSelectedGenre('all');
    setSelectedPublisher('all');
    setSelectedStatus('all');
    
    // Limpa os valores armazenados no localStorage
    localStorage.removeItem('filter_platform');
    localStorage.removeItem('filter_search');
    localStorage.removeItem('filter_metacritic');
    localStorage.removeItem('filter_genre');
    localStorage.removeItem('filter_publisher');
    localStorage.removeItem('filter_status');
    
    // Refresh do infinite scroll para recarregar dados
    refresh();
  }, [refresh]);

  // Função para lidar com a confirmação de exclusão
  const handleDeleteConfirm = useCallback(() => {
    if (gameToDelete) {
      deleteGame(gameToDelete.id)
        .then(() => {
          setDeleteDialogOpen(false);
          setGameToDelete(null);
          refresh(); // Atualizar lista após exclusão
        })
        .catch((err) => {
          console.error('Erro ao excluir jogo:', err);
          setDeleteDialogOpen(false);
          setGameToDelete(null);
        });
    }
  }, [gameToDelete, deleteGame, refresh]);

  // Função para exportar os jogos filtrados para CSV
  const handleExportCsv = useCallback(() => {
    // Converter os dados dos jogos para o formato CSV
    const headers = [
      'ID',
      'Nome',
      'Plataformas',
      'Tipos de Mídia',
      'URL da Capa',
      'Data de Lançamento',
      'Pontuação Metacritic',
      'Gêneros',
      'Publishers',
      'Descrição',
      'Completado',
      'Tempo de Jogo'
    ];

    // Converter os dados para formato CSV (linhas)
    const dataRows = filteredGames.map(game => [
      game.id,
      game.name,
      (game.platforms || []).join(', '),
      (game.mediaTypes || []).join(', '),
      game.coverUrl || '',
      game.released || '',
      game.metacritic || '',
      (game.genres || []).join(', '),
      (game.publishers || []).join(', '),
      (game.description || '').replace(/[\r\n]+/g, ' '), // Remover quebras de linha
      game.completed ? 'Sim' : 'Não',
      game.playTime || ''
    ]);

    // Juntar cabeçalhos e linhas de dados
    const csvContent = [
      headers.join(','),
      ...dataRows.map(row => row.map(cell => 
        // Coloca aspas em células que contêm vírgulas ou aspas
        typeof cell === 'string' && (cell.includes(',') || cell.includes('"')) 
          ? `"${cell.replace(/"/g, '""')}"` 
          : cell
      ).join(','))
    ].join('\n');

    // Criar um blob do conteúdo CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // Criar URL para o blob
    const url = URL.createObjectURL(blob);
    
    // Criar um link para download
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `jogos-filtrados-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    
    // Trigger do download
    link.click();
    
    // Limpeza
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }, [filteredGames]);

  // Função para marcar um jogo como concluído
  const handleMarkCompleted = useCallback(async () => {
    if (gameToMarkCompleted) {
      try {
        // Importante: garantir que todos os campos obrigatórios estejam presentes
        // O backend espera name, platforms e mediaTypes como obrigatórios
        const updatedGame = { 
          ...gameToMarkCompleted, 
          completed: true,
          status: 'Concluído' // Campo status usado pelo backend
        };
        
        // Verificar campos obrigatórios
        if (!updatedGame.platforms) updatedGame.platforms = [];
        if (!updatedGame.mediaTypes) updatedGame.mediaTypes = [];
        
        // Usar await para garantir que a operação seja concluída
        const result = await updateGame(gameToMarkCompleted.id, updatedGame);
        
        // Fechar o diálogo e limpar o estado
        setCompletedDialogOpen(false);
        setGameToMarkCompleted(null);
        
        // Recarregar a lista de jogos para garantir sincronização com o backend
        refresh();
      } catch (err) {
        console.error('Erro ao marcar jogo como concluído:', err);
        setCompletedDialogOpen(false);
        setGameToMarkCompleted(null);
      }
    }
  }, [gameToMarkCompleted, updateGame, refresh]);

  // Renderização dos cards otimizada com useCallback
  const renderCardView = useCallback(() => {
    return (
      <Grid container spacing={{ xs: 1.5, sm: 2 }} justifyContent="flex-start">
        {filteredGames.map((game) => (
          <Grid key={game.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <Card 
              sx={{ 
                bgcolor: '#222',
                color: 'white',
                height: '100%',
                width: '100%',
                maxWidth: '100%',
                minWidth: 0,
                overflow: 'hidden',
                position: 'relative',
                cursor: 'pointer',
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.2s ease-in-out', // Suavizar transições
                '&:hover': {
                  boxShadow: '0 6px 12px rgba(0,0,0,0.5)',
                  transform: 'translateY(-2px)',
                }
              }}
              onClick={() => handleCardClick(game.id)}
            >
              {game.metacritic && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    bgcolor: getMetacriticColor(game.metacritic),
                    color: 'white',
                    minWidth: 40,
                    height: 28,
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '0.9rem',
                    zIndex: 2,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
                    px: 1
                  }}
                >
                  {game.metacritic}
                </Box>
              )}
              <CardMedia
                component="img"
                image={game.coverUrl || 'https://via.placeholder.com/300x200?text=No+Cover'}
                alt={game.name}
                sx={{ 
                  height: { xs: 180, sm: 150, md: 160 },
                  width: '100%',
                  objectFit: 'cover',
                  display: 'block',
                  flexShrink: 0
                }}
              />
              <CardContent sx={{ 
                py: { xs: 1.5, sm: 1.5 }, 
                px: { xs: 2, sm: 1.5 }, 
                flex: 1,
                display: 'flex', 
                flexDirection: 'column',
                minWidth: 0,
                overflow: { xs: 'visible', sm: 'hidden' },
                width: '100%'
              }}>
                <Typography
                  variant="h6"
                  component="h2"
                  sx={{ 
                    fontWeight: 'bold', 
                    fontSize: { xs: '1.1rem', sm: '1rem' },
                    mb: { xs: 0.5, sm: 0.75 },
                    lineHeight: 1.3,
                    // Mobile: altura dinâmica para quebra de linha
                    height: { xs: 'auto', sm: '2.4em' },
                    minHeight: { xs: '1.3em', sm: '2.4em' },
                    maxHeight: { xs: 'none', sm: '2.4em' },
                    // Mobile: sem truncamento, Desktop: com truncamento
                    overflow: { xs: 'visible', sm: 'hidden' },
                    textOverflow: { xs: 'unset', sm: 'ellipsis' },
                    display: { xs: 'block', sm: '-webkit-box' },
                    WebkitLineClamp: { xs: 'unset', sm: 2 },
                    WebkitBoxOrient: { xs: 'unset', sm: 'vertical' },
                    width: '100%',
                    wordBreak: 'break-word'
                  }}
                >
                  {game.name} {game.released && `(${new Date(game.released).getFullYear()})`}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 0.25, sm: 0.5 } }}>
                  <VideogameAssetIcon 
                    fontSize="small" 
                    sx={{ 
                      mr: 0.5, 
                      color: 'rgba(255,255,255,0.7)', 
                      fontSize: { xs: '0.85rem', sm: '0.95rem' }
                    }} 
                  />
                  <Typography 
                    sx={{ 
                      fontSize: { xs: '0.95rem', sm: '0.94rem' }, 
                      color: 'rgba(255,255,255,0.7)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      minWidth: 0,
                      flex: 1,
                      width: '100%'
                    }}
                  >
                    {game.platforms && game.platforms.join(', ')}
                  </Typography>
                </Box>
                
                <Box 
                  sx={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: { xs: 0.25, sm: 0.5 }, 
                    mt: { xs: 0.25, sm: 0.5 },
                    overflow: 'hidden',
                    maxHeight: { xs: '50px', sm: '60px' }
                  }}
                >
                  {game.genres && game.genres.slice(0, 3).map(genre => (
                    <Chip
                      key={genre}
                      label={genre}
                      size="small"
                      sx={{ 
                        mb: { xs: 0.5, sm: 0.5 },
                        bgcolor: 'rgba(100, 100, 100, 0.5)', 
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: { xs: '0.85rem', sm: '0.84rem' },
                        height: { xs: '28px', sm: '24px' }
                      }}
                    />
                  ))}
                  {game.genres && game.genres.length > 3 && (
                    <Chip
                      label={`+${game.genres.length - 3}`}
                      size="small"
                      sx={{ 
                        mb: { xs: 0.5, sm: 0.5 },
                        bgcolor: 'rgba(150, 150, 150, 0.5)', 
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: { xs: '0.85rem', sm: '0.84rem' },
                        height: { xs: '28px', sm: '24px' }
                      }}
                    />
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }, [filteredGames, handleCardClick, getMetacriticColor]);

  // Renderização da tabela otimizada com useCallback
  const renderTableView = useCallback(() => {
    const sortedGames = [...filteredGames].sort(getComparator(order, orderBy));
    
    return (
      <TableContainer component={Paper} sx={{ bgcolor: '#111', borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ '& th': { borderBottom: '2px solid rgba(255,255,255,0.1)' } }}>
              <TableCell sx={{ color: 'white' }}>
                <TableSortLabel
                  active={orderBy === 'name'}
                  direction={orderBy === 'name' ? order : 'asc'}
                  onClick={() => handleRequestSort('name')}
                  sx={{
                    color: 'white !important',
                    '&.MuiTableSortLabel-active': {
                      color: 'white !important',
                    },
                    '& .MuiTableSortLabel-icon': {
                      color: 'white !important',
                    },
                  }}
                >
                  Nome do Jogo
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ color: 'white' }}>
                <TableSortLabel
                  active={orderBy === 'platforms'}
                  direction={orderBy === 'platforms' ? order : 'asc'}
                  onClick={() => handleRequestSort('platforms')}
                  sx={{
                    color: 'white !important',
                    '&.MuiTableSortLabel-active': {
                      color: 'white !important',
                    },
                    '& .MuiTableSortLabel-icon': {
                      color: 'white !important',
                    },
                  }}
                >
                  Plataformas
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ color: 'white' }}>
                <TableSortLabel
                  active={orderBy === 'genres'}
                  direction={orderBy === 'genres' ? order : 'asc'}
                  onClick={() => handleRequestSort('genres')}
                  sx={{
                    color: 'white !important',
                    '&.MuiTableSortLabel-active': {
                      color: 'white !important',
                    },
                    '& .MuiTableSortLabel-icon': {
                      color: 'white !important',
                    },
                  }}
                >
                  Gêneros
                </TableSortLabel>
              </TableCell>
              <TableCell align="center" sx={{ color: 'white' }}>
                <TableSortLabel
                  active={orderBy === 'year'}
                  direction={orderBy === 'year' ? order : 'asc'}
                  onClick={() => handleRequestSort('year')}
                  sx={{
                    color: 'white !important',
                    '&.MuiTableSortLabel-active': {
                      color: 'white !important',
                    },
                    '& .MuiTableSortLabel-icon': {
                      color: 'white !important',
                    },
                  }}
                >
                  Ano
                </TableSortLabel>
              </TableCell>
              <TableCell align="center" sx={{ color: 'white' }}>
                <TableSortLabel
                  active={orderBy === 'metacritic'}
                  direction={orderBy === 'metacritic' ? order : 'asc'}
                  onClick={() => handleRequestSort('metacritic')}
                  sx={{
                    color: 'white !important',
                    '&.MuiTableSortLabel-active': {
                      color: 'white !important',
                    },
                    '& .MuiTableSortLabel-icon': {
                      color: 'white !important',
                    },
                  }}
                >
                  Metacritic
                </TableSortLabel>
              </TableCell>
              <TableCell align="center" sx={{ color: 'white' }}>
                Status
              </TableCell>
              <TableCell align="center" sx={{ color: 'white', width: '120px' }}>
                Ações
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedGames.map((game) => (
              <TableRow 
                key={game.id}
                hover
                sx={{ 
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
                  '& td': { color: 'rgba(255,255,255,0.8)', borderBottom: '1px solid rgba(255,255,255,0.1)' }
                }}
              >
                <TableCell 
                  component="th" 
                  scope="row" 
                  sx={{ color: 'white', fontWeight: 'medium', cursor: 'pointer' }}
                  onClick={() => handleCardClick(game.id)}
                >
                  {game.name}
                </TableCell>
                <TableCell onClick={() => handleCardClick(game.id)} sx={{ cursor: 'pointer' }}>
                  {game.platforms ? game.platforms.join(', ') : ''}
                </TableCell>
                <TableCell onClick={() => handleCardClick(game.id)} sx={{ cursor: 'pointer' }}>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {game.genres && game.genres.map(genre => (
                      <Chip
                        key={genre}
                        label={genre}
                        size="small"
                        sx={{ 
                          mb: 0.3,
                          bgcolor: 'rgba(100, 100, 100, 0.5)', 
                          color: 'white',
                          height: '22px',
                          fontSize: '0.7rem',
                        }}
                      />
                    ))}
                  </Box>
                </TableCell>
                <TableCell align="center" onClick={() => handleCardClick(game.id)} sx={{ cursor: 'pointer' }}>
                  {game.released ? new Date(game.released).getFullYear() : ''}
                </TableCell>
                <TableCell align="center" onClick={() => handleCardClick(game.id)} sx={{ cursor: 'pointer' }}>
                  {game.metacritic ? (
                    <Chip
                      label={game.metacritic}
                      size="small"
                      sx={{ 
                        bgcolor: getMetacriticColor(game.metacritic),
                        color: 'white',
                        fontWeight: 'bold',
                        minWidth: '36px',
                      }}
                    />
                  ) : ''}
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={game.completed ? "Concluído" : "Não Concluído"}
                    size="small"
                    sx={{ 
                      bgcolor: game.completed ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 152, 0, 0.2)', 
                      color: game.completed ? '#4caf50' : '#ff9800',
                      fontWeight: 'bold',
                      fontSize: '0.7rem',
                    }}
                  />
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                    {!game.completed && (
                      <Tooltip title="Marcar como concluído">
                        <IconButton
                          color="success"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            setGameToMarkCompleted(game);
                            setCompletedDialogOpen(true);
                          }}
                          sx={{ 
                            '&:hover': { 
                              bgcolor: 'rgba(76, 175, 80, 0.1)' 
                            }
                          }}
                          aria-label="marcar como concluído"
                        >
                          <DoneIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Excluir jogo">
                      <IconButton
                        color="error"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          setGameToDelete(game);
                          setDeleteDialogOpen(true);
                        }}
                        sx={{ 
                          '&:hover': { 
                            bgcolor: 'rgba(211, 47, 47, 0.1)' 
                          }
                        }}
                        aria-label="excluir jogo"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }, [filteredGames, order, orderBy, getComparator, handleCardClick, getMetacriticColor, handleRequestSort]);

  if (loading && filteredGames.length === 0) {
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

  return (
    <Container maxWidth={false} sx={{ py: { xs: 2, sm: 3 }, px: { xs: 1, sm: 3, md: 4 }, maxWidth: '1800px', mx: 'auto' }}>
      <Box 
        display="flex" 
        justifyContent="space-between" 
        alignItems="center" 
        mb={{ xs: 2, sm: 3 }}
        flexDirection={{ xs: 'column', sm: 'row' }}
        gap={{ xs: 1, sm: 0 }}
      >
        <Typography 
          variant="h4" 
          component="h1"
          sx={{ 
            fontSize: { xs: '1.5rem', sm: '2rem' },
            textAlign: { xs: 'center', sm: 'left' }
          }}
        >
          Catálogo de Jogos
        </Typography>
        <Box 
          display="flex" 
          alignItems="center" 
          gap={{ xs: 1, sm: 2 }}
          flexDirection={{ xs: 'column', sm: 'row' }}
        >

          {/* ToggleButtonGroup - Escondido em mobile */}
          {!isMobile && (
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={handleViewModeChange}
              aria-label="modo de visualização"
              size="small"
              sx={{ 
                bgcolor: '#333',
                '& .MuiToggleButton-root': { 
                  color: 'rgba(255,255,255,0.7)',
                  '&.Mui-selected': {
                    bgcolor: '#0096FF',
                    color: 'white',
                    '&:hover': {
                      bgcolor: '#0077cc',
                    }
                  } 
                }
              }}
            >
              <ToggleButton value="card" aria-label="modo card">
                <ViewModuleIcon />
              </ToggleButton>
              <ToggleButton value="table" aria-label="modo tabela">
                <ViewListIcon />
              </ToggleButton>
            </ToggleButtonGroup>
          )}
        </Box>
      </Box>

      {/* Barra de filtros - Mobile First */}
      <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ mb: { xs: 2, sm: 3 } }} alignItems="center">
        {/* Search - Prioridade máxima em mobile */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            fullWidth
            size="small"
            label="Buscar por nome"
            variant="outlined"
            value={searchTerm}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        {/* Platform - Segunda prioridade */}
        <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
          <FormControl fullWidth variant="outlined" size="small">
            <InputLabel id="platform-select-label">Plataforma</InputLabel>
            <Select
              labelId="platform-select-label"
              value={platform}
              label="Plataforma"
              onChange={handlePlatformChange}
            >
              <MenuItem value="all">Todas as Plataformas</MenuItem>
              {availablePlatforms.map(platform => (
                <MenuItem key={platform} value={platform}>
                  {platform}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        {/* Genre - Terceira prioridade */}
        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <FormControl fullWidth variant="outlined" size="small">
            <InputLabel id="genre-select-label">Gênero</InputLabel>
            <Select
              labelId="genre-select-label"
              value={selectedGenre}
              label="Gênero"
              onChange={handleGenreChange}
            >
              <MenuItem value="all">Todos os Gêneros</MenuItem>
              {availableGenres.map(genre => (
                <MenuItem key={genre} value={genre}>
                  {genre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Status - Quarta prioridade */}
        <Grid size={{ xs: 6, sm: 4, md: 1.5 }}>
          <FormControl fullWidth variant="outlined" size="small">
            <InputLabel id="status-select-label">Status</InputLabel>
            <Select
              labelId="status-select-label"
              value={selectedStatus}
              label="Status"
              onChange={handleStatusChange}
            >
              <MenuItem value="all">Todos</MenuItem>
              <MenuItem value="completed">✅ Completado</MenuItem>
              <MenuItem value="not_completed">⏳ Pendente</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        {/* Metacritic - Menos usado, mas importante */}
        <Grid size={{ xs: 6, sm: 4, md: 1.5 }}>
          <TextField
            fullWidth
            size="small"
            label="Metacritic ≥"
            variant="outlined"
            value={minMetacritic}
            onChange={handleMinMetacriticChange}
            type="number"
            inputProps={{ min: 0, max: 100 }}
          />
        </Grid>
        
        {/* Publisher - Hidden em xs, menos prioritário */}
        <Grid size={{ xs: 6, sm: 6, md: 1.5 }} sx={{ display: { xs: 'none', sm: 'block' } }}>
          <FormControl fullWidth variant="outlined" size="small">
            <InputLabel id="publisher-select-label">Publisher</InputLabel>
            <Select
              labelId="publisher-select-label"
              value={selectedPublisher}
              label="Publisher"
              onChange={handlePublisherChange}
            >
              <MenuItem value="all">Todos os Publishers</MenuItem>
              {availablePublishers.map(publisher => (
                <MenuItem key={publisher} value={publisher}>
                  {publisher}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Botões de ação */}
        <Grid size={{ xs: 6, sm: 3, md: 1 }}>
          <Tooltip title="Limpar todos os filtros">
            <Button 
              variant="outlined" 
              color="error" 
              fullWidth
              onClick={handleClearFilters}
              startIcon={<FilterAltOffIcon fontSize="small" />}
              sx={{ 
                height: { xs: '36px', sm: '40px' },
                fontSize: { xs: '0.8rem', sm: '0.875rem' },
                px: { xs: 1, sm: 2 }
              }}
            >
              Limpar
            </Button>
          </Tooltip>
        </Grid>

        {/* Export - Hidden em mobile muito pequeno */}
        <Grid size={{ xs: 6, sm: 3, md: 1 }} sx={{ display: { xs: 'none', sm: 'block' } }}>
          <Tooltip title="Exportar jogos para CSV">
            <Button 
              variant="outlined" 
              color="info" 
              fullWidth
              onClick={handleExportCsv}
              startIcon={<FileDownloadIcon fontSize="small" />}
              sx={{ 
                height: { xs: '36px', sm: '40px' },
                fontSize: { xs: '0.8rem', sm: '0.875rem' },
                px: { xs: 1, sm: 2 }
              }}
              disabled={filteredGames.length === 0}
            >
              CSV
            </Button>
          </Tooltip>
        </Grid>
      </Grid>

      {/* Container com ID para controle de scroll */}
      <Box id="games-container">
        {/* Renderizar a visualização selecionada - Mobile sempre usa cards */}
        {(isMobile || viewMode === 'card') ? renderCardView() : renderTableView()}
        
        {/* Sentinela universal para infinite scroll com transições suaves */}
        {(hasMore || loading) && (
          <Box
            ref={sentinelRef}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              py: 4,
              mt: 3,
              minHeight: '80px', // Altura mínima aumentada para melhor detecção
              backgroundColor: 'transparent',
              opacity: loading ? 1 : 0.7,
              transition: 'opacity 0.3s ease-in-out', // Transição suave
              willChange: 'opacity' // Otimização de performance
            }}
          >
            {loading && (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  animation: 'fadeIn 0.3s ease-in',
                  '@keyframes fadeIn': {
                    from: { opacity: 0, transform: 'translateY(10px)' },
                    to: { opacity: 1, transform: 'translateY(0)' }
                  }
                }}
              >
                <CircularProgress size={32} color="primary" sx={{ mb: 2 }} />
                <Typography 
                  variant="body2" 
                  color="primary.main" 
                  sx={{ 
                    fontWeight: 600,
                    textAlign: 'center'
                  }}
                >
                  🔄 Carregando mais jogos...
                </Typography>
              </Box>
            )}
            {!loading && hasMore && (
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ 
                  fontWeight: 500,
                  opacity: 0.5,
                  textAlign: 'center'
                }}
              >
                Role para carregar mais...
              </Typography>
            )}
          </Box>
        )}
      </Box>
      
      {/* Diálogo de confirmação de exclusão */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Confirmar exclusão
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Tem certeza que deseja excluir o jogo "{gameToDelete?.name}"? Esta ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained" autoFocus>
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de confirmação para marcar como concluído */}
      <Dialog
        open={completedDialogOpen}
        onClose={() => setCompletedDialogOpen(false)}
        aria-labelledby="completed-dialog-title"
        aria-describedby="completed-dialog-description"
      >
        <DialogTitle id="completed-dialog-title">
          Marcar como concluído
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="completed-dialog-description">
            Deseja marcar o jogo "{gameToMarkCompleted?.name}" como concluído?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCompletedDialogOpen(false)} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleMarkCompleted} color="success" variant="contained" autoFocus>
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Home;
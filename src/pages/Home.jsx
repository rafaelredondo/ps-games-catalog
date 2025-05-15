import { useState, useEffect } from 'react';
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
  CardActionArea,
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
  Tooltip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VideogameAssetIcon from '@mui/icons-material/VideogameAsset';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewListIcon from '@mui/icons-material/ViewList';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { useGames } from '../contexts/GamesContext';

function Home() {
  const navigate = useNavigate();
  const { games: allGames, loading, error, loadGames, loadGamesByPlatform, deleteGame } = useGames();
  const [platform, setPlatform] = useState(() => {
    return localStorage.getItem('filter_platform') || 'all';
  });
  const [searchTerm, setSearchTerm] = useState(() => {
    return localStorage.getItem('filter_search') || '';
  });
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
  const [filteredGames, setFilteredGames] = useState([]);
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

  // Aplicar filtros aos jogos
  useEffect(() => {
    let result = [...allGames];
    
    // Filtro de plataforma
    if (platform !== 'all') {
      result = result.filter(game => 
        game.platforms && game.platforms.includes(platform)
      );
    }
    
    // Filtro de texto de busca
    if (searchTerm.trim() !== '') {
      const search = searchTerm.toLowerCase().trim();
      result = result.filter(game => 
        game.name.toLowerCase().includes(search)
      );
    }
    
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
    
    setFilteredGames(result);
  }, [allGames, platform, searchTerm, minMetacritic, selectedGenre, selectedPublisher, selectedStatus]);

  // Funções de manipulação dos filtros
  const handlePlatformChange = (event) => {
    const value = event.target.value;
    setPlatform(value);
    localStorage.setItem('filter_platform', value);
  };

  const handleSearch = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    localStorage.setItem('filter_search', value);
  };

  const handleMinMetacriticChange = (event) => {
    const value = event.target.value;
    setMinMetacritic(value);
    localStorage.setItem('filter_metacritic', value);
  };

  const handleGenreChange = (event) => {
    const value = event.target.value;
    setSelectedGenre(value);
    localStorage.setItem('filter_genre', value);
  };

  const handlePublisherChange = (event) => {
    const value = event.target.value;
    setSelectedPublisher(value);
    localStorage.setItem('filter_publisher', value);
  };

  const handleStatusChange = (event) => {
    const value = event.target.value;
    setSelectedStatus(value);
    localStorage.setItem('filter_status', value);
  };

  const handleCardClick = (gameId) => {
    navigate(`/game/${gameId}`);
  };

  const handleViewModeChange = (event, newViewMode) => {
    if (newViewMode !== null) {
      setViewMode(newViewMode);
      // Salvar o modo de visualização escolhido no localStorage
      localStorage.setItem('viewMode', newViewMode);
    }
  };

  const getMetacriticColor = (score) => {
    if (!score) return '#888';
    if (score >= 75) return '#6c3';
    if (score >= 50) return '#fc3';
    return '#f00';
  };

  // Efeito para carregar jogos iniciais
  useEffect(() => {
    loadGames();
  }, []);

  // Funções de ordenação de tabela
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    const newOrder = isAsc ? 'desc' : 'asc';
    setOrder(newOrder);
    setOrderBy(property);
    
    // Salvar as configurações de ordenação no localStorage
    localStorage.setItem('orderBy', property);
    localStorage.setItem('order', newOrder);
  };

  const getComparator = (order, orderBy) => {
    return order === 'desc'
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  };

  const descendingComparator = (a, b, orderBy) => {
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
  };

  // Função para limpar todos os filtros
  const handleClearFilters = () => {
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
  };

  // Função para lidar com a confirmação de exclusão
  const handleDeleteConfirm = () => {
    if (gameToDelete) {
      deleteGame(gameToDelete.id)
        .then(() => {
          setDeleteDialogOpen(false);
          setGameToDelete(null);
        })
        .catch((err) => {
          console.error('Erro ao excluir jogo:', err);
          setDeleteDialogOpen(false);
          setGameToDelete(null);
        });
    }
  };

  // Função para exportar os jogos filtrados para CSV
  const handleExportCsv = () => {
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

  // Renderização dos cards
  const renderCardView = () => {
    return (
      <Grid container spacing={2} justifyContent="center">
        {filteredGames.map((game) => (
          <Grid item key={game.id} xs={12} sm={6} md="auto">
            <Card 
              sx={{ 
                bgcolor: '#222',
                color: 'white',
                height: '100%',
                width: '300px',
                position: 'relative',
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: '0 6px 12px rgba(0,0,0,0.5)',
                  transform: 'translateY(-2px)',
                  transition: 'all 0.2s ease-in-out'
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
                  height: 150,
                  objectFit: 'cover'
                }}
              />
              <CardContent sx={{ py: 1.5, px: 1.5, height: 'auto', display: 'flex', flexDirection: 'column' }}>
                <Typography
                  variant="h6"
                  component="h2"
                  sx={{ 
                    fontWeight: 'bold', 
                    fontSize: '1rem',
                    mb: 0.75,
                    lineHeight: 1.2,
                    height: 'auto',
                    maxHeight: '2.4em',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical'
                  }}
                >
                  {game.name} {game.released && `(${new Date(game.released).getFullYear()})`}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                  <VideogameAssetIcon fontSize="small" sx={{ mr: 0.5, color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem' }} />
                  <Typography 
                    sx={{ 
                      fontSize: '0.94rem', 
                      color: 'rgba(255,255,255,0.7)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {game.platforms && game.platforms.join(', ')}
                  </Typography>
                </Box>
                
                <Box 
                  sx={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: 0.5, 
                    mt: 0.5,
                    overflow: 'hidden',
                    maxHeight: '60px'
                  }}
                >
                  {game.genres && game.genres.map(genre => (
                    <Chip
                      key={genre}
                      label={genre}
                      size="small"
                      sx={{ 
                        mb: 0.5,
                        bgcolor: 'rgba(100, 100, 100, 0.5)', 
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '0.84rem',
                        height: '24px'
                      }}
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  // Renderização da tabela
  const renderTableView = () => {
    // Ordenar os jogos filtrados
    const sortedGames = [...filteredGames].sort(getComparator(order, orderBy));
    
    return (
      <TableContainer component={Paper} sx={{ bgcolor: '#222', color: 'white', boxShadow: '0 4px 8px rgba(0,0,0,0.3)' }}>
        <Table sx={{ minWidth: 650 }} aria-label="tabela de jogos">
          <TableHead>
            <TableRow sx={{ '& th': { fontWeight: 'bold', bgcolor: '#333' } }}>
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
                  Nome
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
              <TableCell align="center" sx={{ color: 'white', width: '80px' }}>
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
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Container maxWidth={false} sx={{ py: 3, px: { xs: 2, sm: 3, md: 4 }, maxWidth: '1800px', mx: 'auto' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Catálogo de Jogos
        </Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'medium', color: 'text.secondary' }}>
            {filteredGames.length} {filteredGames.length === 1 ? 'jogo encontrado' : 'jogos encontrados'}
          </Typography>
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
        </Box>
      </Box>

      {/* Barra de filtros */}
      <Grid container spacing={2} sx={{ mb: 3 }} alignItems="center">
        <Grid item xs={12} sm={6} md={2}>
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
        
        <Grid item xs={12} sm={6} md={2}>
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
        
        <Grid item xs={12} sm={6} md={2}>
          <TextField
            fullWidth
            size="small"
            label="Metacritic mínimo"
            variant="outlined"
            value={minMetacritic}
            onChange={handleMinMetacriticChange}
            type="number"
            inputProps={{ min: 0, max: 100 }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={1.5}>
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
        
        <Grid item xs={12} sm={6} md={1.5}>
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

        <Grid item xs={12} sm={6} md={1}>
          <FormControl fullWidth variant="outlined" size="small">
            <InputLabel id="status-select-label">Status</InputLabel>
            <Select
              labelId="status-select-label"
              value={selectedStatus}
              label="Status"
              onChange={handleStatusChange}
            >
              <MenuItem value="all">Todos</MenuItem>
              <MenuItem value="completed">Completado</MenuItem>
              <MenuItem value="not_completed">Não Completado</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={3} md={1}>
          <Tooltip title="Limpar todos os filtros">
            <Button 
              variant="outlined" 
              color="error" 
              fullWidth
              onClick={handleClearFilters}
              startIcon={<FilterAltOffIcon />}
              sx={{ height: '40px' }}
            >
              Limpar
            </Button>
          </Tooltip>
        </Grid>

        <Grid item xs={12} sm={3} md={1}>
          <Tooltip title="Exportar jogos para CSV">
            <Button 
              variant="outlined" 
              color="info" 
              fullWidth
              onClick={handleExportCsv}
              startIcon={<FileDownloadIcon />}
              sx={{ height: '40px' }}
              disabled={filteredGames.length === 0}
            >
              CSV
            </Button>
          </Tooltip>
        </Grid>
      </Grid>

      {/* Renderizar a visualização selecionada */}
      {viewMode === 'card' ? renderCardView() : renderTableView()}
      
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
    </Container>
  );
}

export default Home;
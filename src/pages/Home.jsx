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
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VideogameAssetIcon from '@mui/icons-material/VideogameAsset';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { useGames } from '../contexts/GamesContext';

function Home() {
  const navigate = useNavigate();
  const { games: allGames, loading, error, loadGames, loadGamesByPlatform, deleteGame } = useGames();
  const [platform, setPlatform] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [minMetacritic, setMinMetacritic] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [selectedPublisher, setSelectedPublisher] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [gameToDelete, setGameToDelete] = useState(null);
  const [filteredGames, setFilteredGames] = useState([]);
  const [availablePublishers, setAvailablePublishers] = useState([]);
  const [availableGenres, setAvailableGenres] = useState([]);
  const [availablePlatforms, setAvailablePlatforms] = useState([]);

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
    
    setFilteredGames(result);
  }, [allGames, platform, searchTerm, minMetacritic, selectedGenre, selectedPublisher]);

  // Funções de manipulação dos filtros
  const handlePlatformChange = (event) => {
    setPlatform(event.target.value);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleMinMetacriticChange = (event) => {
    setMinMetacritic(event.target.value);
  };

  const handleGenreChange = (event) => {
    setSelectedGenre(event.target.value);
  };

  const handlePublisherChange = (event) => {
    setSelectedPublisher(event.target.value);
  };

  const handleCardClick = (gameId) => {
    navigate(`/game/${gameId}`);
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

  return (
    <Container maxWidth={false} sx={{ py: 3, px: { xs: 2, sm: 3, md: 4 }, maxWidth: '1800px', mx: 'auto' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Catálogo de Jogos
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate('/add')}
          sx={{ 
            bgcolor: '#0096FF',
            '&:hover': { bgcolor: '#0077cc' }
          }}
        >
          Adicionar Jogo
        </Button>
      </Box>

      {/* Barra de filtros */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2.4}>
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
        
        <Grid item xs={12} sm={6} md={2.4}>
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
        
        <Grid item xs={12} sm={6} md={2.4}>
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
        
        <Grid item xs={12} sm={6} md={2.4}>
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
        
        <Grid item xs={12} sm={6} md={2.4}>
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
      </Grid>

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
    </Container>
  );
}

export default Home;
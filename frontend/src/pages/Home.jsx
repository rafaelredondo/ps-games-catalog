import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../contexts/NotificationContext';
import {
  Container,
  Grid,
  Typography,
  Box,
  CircularProgress,
  Alert,
  IconButton,
  Chip,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
  useMediaQuery,
  useTheme,
  LinearProgress
} from '@mui/material';

// Componentes padronizados
import ActionButton from '../components/ActionButton';
import CancelButton from '../components/CancelButton';
import FilterButton from '../components/FilterButton';
import GameCard from '../components/GameCard';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import DataTable from '../components/DataTable';
import SkeletonLoader from '../components/SkeletonLoader';
import RetryErrorState from '../components/RetryErrorState';
import FilterDrawer from '../components/FilterDrawer';

// Componentes de Input padronizados
import SearchInput from '../components/SearchInput';
import FilterSelect from '../components/FilterSelect';

// Custom hooks
import useDropdownOptions from '../hooks/useDropdownOptions';

import DeleteIcon from '@mui/icons-material/Delete';
import VideogameAssetIcon from '@mui/icons-material/VideogameAsset';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewListIcon from '@mui/icons-material/ViewList';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import DoneIcon from '@mui/icons-material/Done';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import AddIcon from '@mui/icons-material/Add';
import PsPlusIcon from '../components/PsPlusIcon';
import { useGames } from '../contexts/GamesContext';
import { useSettings } from '../contexts/SettingsContext';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import { gamesService } from '../services/gamesService';
import TraditionalPagination from '../components/TraditionalPagination';
import AlphabetNavigation from '../components/AlphabetNavigation';
import { getMetacriticColor } from '../utils/metacriticUtils';
import LoadingSpinner from '../components/LoadingSpinner';

function Home() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Contexto de configurações
  const { settings } = useSettings();
  
  // Estados dos filtros com debounce para busca
  const [searchInput, setSearchInput] = useState(() => {
    return localStorage.getItem('filter_search') || '';
  });
  const [searchTerm, setSearchTerm] = useState(() => {
    return localStorage.getItem('filter_search') || '';
  });
  
  // Debounce para busca - 500ms delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput);
      localStorage.setItem('filter_search', searchInput);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);
  
  const [platform, setPlatform] = useState(() => {
    return localStorage.getItem('filter_platform') || 'all';
  });
  
  // Estados de ordenação - devem ser declarados antes do useInfiniteScroll
  const [orderBy, setOrderBy] = useState(() => {
    return localStorage.getItem('orderBy') || 'name';
  });
  const [order, setOrder] = useState(() => {
    return localStorage.getItem('order') || 'asc';
  });
  
  // Estados dos filtros avançados - devem ser declarados antes do useInfiniteScroll
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
  const [isPsPlusFilter, setIsPsPlusFilter] = useState(() => {
    return localStorage.getItem('filter_psplus') === 'true';
  });
  
  // Hook de infinite scroll com todos os filtros e configuração enabled
  const {
    games: allGames,
    loading,
    hasMore,
    error,
    sentinelRef,
    refresh,
    totalGames,
    currentPage,
    totalPages,
    pagination
  } = useInfiniteScroll(gamesService.getPaginated, {
    limit: settings.itemsPerPage || 20,
    // Quando infinite scroll desligado, não enviar filtros para o backend
    // Vamos aplicar filtros localmente para melhor performance
    search: settings.infiniteScrollEnabled ? searchTerm : '',
    platform: settings.infiniteScrollEnabled ? (platform === 'all' ? '' : platform) : '',
    orderBy: settings.infiniteScrollEnabled ? orderBy : 'name',
    order: settings.infiniteScrollEnabled ? order : 'asc',
    // Filtros avançados passados para o backend apenas se infinite scroll habilitado
    minMetacritic: settings.infiniteScrollEnabled ? (minMetacritic !== '' ? minMetacritic : '') : '',
    genre: settings.infiniteScrollEnabled ? (selectedGenre === 'all' ? '' : selectedGenre) : '',
    publisher: settings.infiniteScrollEnabled ? (selectedPublisher === 'all' ? '' : selectedPublisher) : '',
    status: settings.infiniteScrollEnabled ? (selectedStatus === 'all' ? '' : selectedStatus) : '',
    isPsPlus: settings.infiniteScrollEnabled ? isPsPlusFilter : false,
    // Configuração do infinite scroll
    infiniteScrollEnabled: settings.infiniteScrollEnabled,
    enabled: settings.infiniteScrollEnabled
  });
  
  // Filtros locais quando infinite scroll está desligado
  const filteredGames = useMemo(() => {
    // Se infinite scroll habilitado, usar dados do backend (já filtrados)
    if (settings.infiniteScrollEnabled) {
      return allGames;
    }

    // Se infinite scroll desabilitado, aplicar filtros localmente
    if (!allGames || allGames.length === 0) {
      return [];
    }

    let filtered = [...allGames];

    // Aplicar filtro de busca
    if (searchTerm && searchTerm.trim() !== '') {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(game => 
        game.name.toLowerCase().includes(searchLower)
      );
    }

    // Aplicar filtro de plataforma
    if (platform && platform !== 'all') {
      filtered = filtered.filter(game => 
        game.platforms && game.platforms.includes(platform)
      );
    }

    // Aplicar filtro de gênero
    if (selectedGenre && selectedGenre !== 'all') {
      filtered = filtered.filter(game => 
        game.genres && Array.isArray(game.genres) && game.genres.includes(selectedGenre)
      );
    }

    // Aplicar filtro de publisher
    if (selectedPublisher && selectedPublisher !== 'all') {
      filtered = filtered.filter(game => 
        game.publishers && Array.isArray(game.publishers) && 
        game.publishers.some(pub => pub.includes(selectedPublisher))
      );
    }

    // Aplicar filtro de status
    if (selectedStatus && selectedStatus !== 'all') {
      filtered = filtered.filter(game => 
        game.status === selectedStatus
      );
    }

    // Aplicar filtro de Metacritic
    if (minMetacritic && minMetacritic !== '') {
      const minScore = parseInt(minMetacritic);
      if (!isNaN(minScore)) {
        filtered = filtered.filter(game => 
          game.metacritic && game.metacritic >= minScore
        );
      }
    }

    // Aplicar filtro de PS Plus
    if (isPsPlusFilter) {
      filtered = filtered.filter(game => game.isPsPlus === true);
    }

    // Aplicar ordenação local
    filtered.sort((a, b) => {
      let valueA, valueB;
      
      switch (orderBy) {
        case 'name':
          valueA = a.name.toLowerCase();
          valueB = b.name.toLowerCase();
          break;
          
        case 'metacritic':
          valueA = a.metacritic || 0;
          valueB = b.metacritic || 0;
          break;
          
        case 'year':
          valueA = a.released ? new Date(a.released).getFullYear() : 0;
          valueB = b.released ? new Date(b.released).getFullYear() : 0;
          break;
          
        case 'platforms':
          valueA = a.platforms ? a.platforms.join(', ').toLowerCase() : '';
          valueB = b.platforms ? b.platforms.join(', ').toLowerCase() : '';
          break;
          
        case 'genres':
          valueA = a.genres ? a.genres.join(', ').toLowerCase() : '';
          valueB = b.genres ? b.genres.join(', ').toLowerCase() : '';
          break;
          
        case 'playTime':
          valueA = a.playTime || 0;
          valueB = b.playTime || 0;
          break;
          
        default:
          valueA = a.name.toLowerCase();
          valueB = b.name.toLowerCase();
          break;
      }
      
      // Comparação baseada no tipo de valor
      let comparison = 0;
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        comparison = valueA.localeCompare(valueB);
      } else {
        comparison = valueA - valueB;
      }
      
      // Aplicar ordem (asc/desc)
      return order === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [
    allGames, 
    settings.infiniteScrollEnabled, 
    searchTerm, 
    platform, 
    selectedGenre, 
    selectedPublisher, 
    selectedStatus, 
    minMetacritic, 
    orderBy, 
    order,
    isPsPlusFilter
  ]);
  
  // Contexto para operações de CRUD
  const { deleteGame, updateGame } = useGames();
  const { notify } = useNotification();
  
  // Hook otimizado para opções de dropdown
  const { options: dropdownOptions, loading: optionsLoading } = useDropdownOptions();
  
  // Estados de UI
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [gameToDelete, setGameToDelete] = useState(null);
  const [viewMode, setViewMode] = useState(() => {
    // Recuperar o modo de visualização do localStorage ou usar 'card' como padrão
    return localStorage.getItem('viewMode') || 'card';
  });
  const [completedDialogOpen, setCompletedDialogOpen] = useState(false);
  const [gameToMarkCompleted, setGameToMarkCompleted] = useState(null);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // Funções de paginação (placeholders quando infinite scroll desabilitado)
  const goToPage = useCallback((page) => {
    // Quando infinite scroll desabilitado, não há paginação real
    if (!settings.infiniteScrollEnabled) return;
    // TODO: Implementar navegação de página se necessário
  }, [settings.infiniteScrollEnabled]);

  const goToPrevPage = useCallback(() => {
    // Quando infinite scroll desabilitado, não há paginação real
    if (!settings.infiniteScrollEnabled) return;
    // TODO: Implementar página anterior se necessário
  }, [settings.infiniteScrollEnabled]);

  // Função para detectar se há filtros ativos
  const hasActiveFilters = useMemo(() => {
    return searchInput !== '' || 
           platform !== 'all' || 
           selectedGenre !== 'all' || 
           selectedPublisher !== 'all' || 
           selectedStatus !== 'all' || 
           minMetacritic !== '' ||
           isPsPlusFilter;
  }, [searchInput, platform, selectedGenre, selectedPublisher, selectedStatus, minMetacritic, isPsPlusFilter]);

  // Calcular número de filtros ativos para o badge
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchInput !== '') count++;
    if (platform !== 'all') count++;
    if (selectedGenre !== 'all') count++;
    if (selectedPublisher !== 'all') count++;
    if (selectedStatus !== 'all') count++;
    if (minMetacritic !== '') count++;
    if (isPsPlusFilter) count++;
    return count;
  }, [searchInput, platform, selectedGenre, selectedPublisher, selectedStatus, minMetacritic, isPsPlusFilter]);

  // Função para determinar o tipo de empty state
  const getEmptyStateType = () => {
    if (hasActiveFilters) {
      return searchInput !== '' ? 'search' : 'filter';
    }
    return 'catalog';
  };

  // Configuração das colunas da tabela
  const tableColumns = useMemo(() => [
    {
      id: 'name',
      label: 'Nome do Jogo',
      sortable: true,
      render: (game) => (
        <Box 
          component="span" 
          sx={{ 
            color: 'white', 
            fontWeight: 'medium', 
            cursor: 'pointer' 
          }}
        >
          {game.name}
        </Box>
      )
    },
    {
      id: 'platforms',
      label: 'Plataformas',
      sortable: true,
      hideOnMobile: false,
      render: (game) => game.platforms ? game.platforms.join(', ') : ''
    },
    {
      id: 'genres',
      label: 'Gêneros',
      sortable: true,
      hideOnMobile: true,
      render: (game) => (
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
      )
    },
    {
      id: 'year',
      label: 'Ano',
      sortable: true,
      align: 'center',
      hideOnMobile: true,
      render: (game) => game.released ? new Date(game.released).getFullYear() : ''
    },
    {
      id: 'playTime',
      label: 'Tempo de Jogo',
      sortable: true,
      align: 'center',
      hideOnMobile: true,
      render: (game) => {
        if (!game.playTime) return '';
        
        // Se o tempo está em horas (número), formatar adequadamente
        if (typeof game.playTime === 'number') {
          return game.playTime >= 1 
            ? `${game.playTime}h`
            : `${Math.round(game.playTime * 60)}min`;
        }
        
        // Se já é uma string formatada, retornar como está
        return game.playTime;
      }
    },
    {
      id: 'metacritic',
      label: 'Metacritic',
      sortable: true,
      align: 'center',
      hideOnMobile: true,
      render: (game) => game.metacritic ? (
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
      ) : ''
    },
    {
      id: 'status',
      label: 'Status',
      align: 'center',
      render: (game) => {
        // Usar o status do jogo se disponível, senão usar completed
        let statusDisplay = game.status;
        let statusColor = '';
        
        if (!statusDisplay) {
          statusDisplay = game.completed ? "Concluído" : "Não iniciado";
        }
        
        // Definir cores baseadas no status
        switch (statusDisplay) {
          case 'Concluído':
            statusColor = { bgcolor: 'rgba(76, 175, 80, 0.2)', color: '#4caf50' };
            break;
          case 'Jogando':
            statusColor = { bgcolor: 'rgba(33, 150, 243, 0.2)', color: '#2196f3' };
            break;
          case 'Abandonado':
            statusColor = { bgcolor: 'rgba(244, 67, 54, 0.2)', color: '#f44336' };
            break;
          case 'Na fila':
            statusColor = { bgcolor: 'rgba(156, 39, 176, 0.2)', color: '#9c27b0' };
            break;
          default:
            statusColor = { bgcolor: 'rgba(255, 152, 0, 0.2)', color: '#ff9800' };
        }
        
        return (
          <Chip
            label={statusDisplay}
            size="small"
            sx={{ 
              ...statusColor,
              fontWeight: 'bold',
              fontSize: '0.7rem',
            }}
          />
        );
      }
    },
    {
      id: 'psplus',
      label: 'PS Plus',
      align: 'center',
      hideOnMobile: true,
      render: (game) => game.isPsPlus ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <PsPlusIcon fontSize="small" sx={{ color: '#0070f3' }} />
        </Box>
      ) : null
    },
    {
      id: 'actions',
      label: 'Ações',
      align: 'center',
      width: '200px',
      render: (game) => (
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
          {(!game.status || game.status !== 'Concluído') && !game.completed && (
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
          {game.status !== 'Na fila' && (
            <Tooltip title="Adicionar à fila">
              <IconButton
                color="warning"
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddToQueue(game);
                }}
                sx={{ 
                  '&:hover': { 
                    bgcolor: 'rgba(156, 39, 176, 0.1)' 
                  }
                }}
                aria-label="adicionar à fila"
              >
                <PlaylistAddIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title={game.isPsPlus ? "Remover do PS Plus" : "Marcar como PS Plus"}>
            <IconButton
              color={game.isPsPlus ? "primary" : "default"}
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleTogglePsPlus(game);
              }}
              sx={{ 
                '&:hover': { 
                  bgcolor: game.isPsPlus ? 'rgba(33, 150, 243, 0.1)' : 'rgba(0, 0, 0, 0.04)' 
                },
                // Estilo especial para jogos PS Plus
                ...(game.isPsPlus && {
                  bgcolor: 'rgba(33, 150, 243, 0.1)',
                  border: '1px solid rgba(33, 150, 243, 0.3)'
                })
              }}
              aria-label={game.isPsPlus ? "remover do ps plus" : "marcar como ps plus"}
            >
              {game.isPsPlus ? (
                <PsPlusIcon fontSize="small" sx={{ color: 'white' }} />
              ) : (
                <AddIcon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
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
      )
    }
  ], []);

  const goToNextPage = useCallback(() => {
    // Quando infinite scroll desabilitado, não há paginação real
    if (!settings.infiniteScrollEnabled) return;
    // TODO: Implementar próxima página se necessário
  }, [settings.infiniteScrollEnabled]);



  // Funções de manipulação otimizadas com useCallback
  const handlePlatformChange = useCallback((event) => {
    const value = event.target.value;
    setPlatform(value);
    localStorage.setItem('filter_platform', value);
  }, []);

  const handleSearch = useCallback((event) => {
    const value = event.target.value;
    setSearchInput(value);
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

  const handlePsPlusFilterChange = useCallback(() => {
    const newValue = !isPsPlusFilter;
    setIsPsPlusFilter(newValue);
    localStorage.setItem('filter_psplus', newValue.toString());
  }, [isPsPlusFilter]);

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

  // Função para limpar todos os filtros
  const handleClearFilters = useCallback(() => {
    // Redefine todos os estados para valores padrão
    setPlatform('all');
    setSearchInput('');
    setMinMetacritic('');
    setSelectedGenre('all');
    setSelectedPublisher('all');
    setSelectedStatus('all');
    setIsPsPlusFilter(false);
    
    // Limpa os valores armazenados no localStorage
    localStorage.removeItem('filter_platform');
    localStorage.removeItem('filter_search');
    localStorage.removeItem('filter_metacritic');
    localStorage.removeItem('filter_genre');
    localStorage.removeItem('filter_publisher');
    localStorage.removeItem('filter_status');
    localStorage.removeItem('filter_psplus');
    
    // REMOVIDO: refresh() manual - o useEffect do useInfiniteScroll 
    // vai detectar automaticamente as mudanças dos filtros e recarregar
  }, []);

  // Função para lidar com a confirmação de exclusão
  const handleDeleteConfirm = useCallback(() => {
    if (gameToDelete) {
      deleteGame(gameToDelete.id)
        .then(() => {
          // Notificação de sucesso
          notify.success(
            `Jogo "${gameToDelete.name}" excluído com sucesso!`,
            {
              title: 'Jogo Excluído',
              duration: 3000
            }
          );
          
          setDeleteDialogOpen(false);
          setGameToDelete(null);
          refresh(); // Atualizar lista após exclusão
        })
        .catch((err) => {
          console.error('Erro ao excluir jogo:', err);
          
          // Notificação de erro
          notify.error(
            'Não foi possível excluir o jogo. Tente novamente.',
            {
              title: 'Erro na Exclusão',
              allowRetry: true,
              retryText: 'Tentar Novamente',
              onRetry: () => {
                handleDeleteConfirm();
              }
            }
          );
          
          setDeleteDialogOpen(false);
          setGameToDelete(null);
        });
    }
  }, [gameToDelete, deleteGame, refresh, notify]);

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

  // Detectar se o AlphabetNavigation está ativo
  const isAlphabetNavigationActive = useMemo(() => {
    return (
      orderBy === 'name' && 
      !settings.infiniteScrollEnabled && 
      filteredGames.length > 20 &&
      (isMobile || viewMode === 'card') // Mobile ou modo card
    );
  }, [orderBy, settings.infiniteScrollEnabled, filteredGames.length, isMobile, viewMode]);

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
        
        // Notificação de sucesso
        notify.success(
          `"${gameToMarkCompleted.name}" marcado como concluído!`,
          {
            title: 'Parabéns! 🎉',
            duration: 4000
          }
        );
        
        // Fechar o diálogo e limpar o estado
        setCompletedDialogOpen(false);
        setGameToMarkCompleted(null);
        
        // ✅ Otimização: updateGame já atualiza o item específico no contexto
        // Removido refresh() para evitar recarregamento desnecessário da lista
      } catch (err) {
        console.error('Erro ao marcar jogo como concluído:', err);
        
        // Notificação de erro
        notify.error(
          'Não foi possível marcar o jogo como concluído.',
          {
            title: 'Erro ao Atualizar',
            allowRetry: true,
            retryText: 'Tentar Novamente',
            onRetry: () => {
              handleMarkCompleted();
            }
          }
        );
        
        setCompletedDialogOpen(false);
        setGameToMarkCompleted(null);
      }
    }
  }, [gameToMarkCompleted, updateGame, notify]);

  // Função para adicionar jogo à fila
  const handleAddToQueue = useCallback(async (game) => {
    try {
      // Importante: garantir que todos os campos obrigatórios estejam presentes
      // O backend espera name, platforms e mediaTypes como obrigatórios
      const updatedGame = { 
        ...game, 
        completed: false,
        status: 'Na fila' // Campo status usado pelo backend
      };
      
      // Verificar campos obrigatórios
      if (!updatedGame.platforms) updatedGame.platforms = [];
      if (!updatedGame.mediaTypes) updatedGame.mediaTypes = [];
      
      // Usar await para garantir que a operação seja concluída
      const result = await updateGame(game.id, updatedGame);
      
      // Notificação de sucesso
      notify.success(
        `"${game.name}" adicionado à fila!`,
        {
          title: 'Jogo na Fila ⏱️',
          duration: 3000
        }
      );
      
      // ✅ Otimização: updateGame já atualiza o item específico no contexto
      // Removido refresh() para evitar recarregamento desnecessário da lista
    } catch (err) {
      console.error('Erro ao adicionar jogo à fila:', err);
      
      // Notificação de erro
      notify.error(
        'Não foi possível adicionar o jogo à fila.',
        {
          title: 'Erro ao Atualizar',
          duration: 4000
        }
      );
    }
  }, [updateGame, notify]);

  // Função para alternar status PS Plus
  const handleTogglePsPlus = useCallback(async (game) => {
    try {
      // Importante: garantir que todos os campos obrigatórios estejam presentes
      // O backend espera name, platforms e mediaTypes como obrigatórios
      const updatedGame = { 
        ...game, 
        isPsPlus: !game.isPsPlus // Alternar o status PS Plus
      };
      
      // Verificar campos obrigatórios
      if (!updatedGame.platforms) updatedGame.platforms = [];
      if (!updatedGame.mediaTypes) updatedGame.mediaTypes = [];
      
      // Usar await para garantir que a operação seja concluída
      const result = await updateGame(game.id, updatedGame);
      
      // Notificação de sucesso
      const action = updatedGame.isPsPlus ? 'marcado como PS Plus' : 'removido do PS Plus';
      const icon = updatedGame.isPsPlus ? '🎮' : '📱';
      
      notify.success(
        `"${game.name}" ${action}!`,
        {
          title: `PS Plus ${icon}`,
          duration: 3000
        }
      );
      
      // ✅ Otimização: updateGame já atualiza o item específico no contexto
      // Removido refresh() para evitar recarregamento desnecessário da lista
    } catch (err) {
      console.error('Erro ao alternar status PS Plus:', err);
      
      // Notificação de erro
      notify.error(
        'Não foi possível alterar o status PS Plus.',
        {
          title: 'Erro ao Atualizar',
          duration: 4000
        }
      );
    }
  }, [updateGame, notify]);

  // Renderização dos cards
  const renderCardView = () => {
    // Se não há jogos e não está carregando, mostrar empty state
    if (filteredGames.length === 0 && !loading) {
      return (
        <EmptyState
          type={getEmptyStateType()}
          action={
            hasActiveFilters ? (
              <FilterButton
                variant="filter"
                onClick={handleClearFilters}
                startIcon={<FilterAltOffIcon />}
              >
                Limpar Filtros
              </FilterButton>
            ) : (
              <ActionButton
                variant="primary"
                onClick={() => navigate('/add')}
                startIcon={<VideogameAssetIcon />}
              >
                Adicionar Primeiro Jogo
              </ActionButton>
            )
          }
        />
      );
    }

    return (
      <Grid container spacing={{ xs: 1.5, sm: 2 }} justifyContent="flex-start">
        {filteredGames.map((game) => (
          <Grid key={game.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <GameCard 
              game={game}
              onClick={() => handleCardClick(game.id)}
              isAlphabetNavigationActive={isAlphabetNavigationActive}
            />
          </Grid>
        ))}
      </Grid>
    );
  };

  // Renderização da tabela usando DataTable
  const renderTableView = () => {
    return (
      <DataTable
        data={filteredGames}
        columns={tableColumns}
        loading={loading}
        onRowClick={(game) => handleCardClick(game.id)}
        onSort={handleRequestSort}
        orderBy={orderBy}
        order={order}
        emptyState={{
          type: getEmptyStateType(),
          action: hasActiveFilters ? (
            <FilterButton
              variant="filter"
              onClick={handleClearFilters}
              startIcon={<FilterAltOffIcon />}
            >
              Limpar Filtros
            </FilterButton>
          ) : (
            <ActionButton
              variant="primary"
              onClick={() => navigate('/add')}
              startIcon={<VideogameAssetIcon />}
            >
              Adicionar Primeiro Jogo
            </ActionButton>
          )
        }}
      />
    );
  };

  if (loading && filteredGames.length === 0) {
    // Mostrar loading completo apenas se:
    // 1. Infinite scroll habilitado (comportamento normal)
    // 2. OU infinite scroll desabilitado mas ainda não carregou dados iniciais
    const shouldShowFullLoading = settings.infiniteScrollEnabled || 
                                  (!settings.infiniteScrollEnabled && allGames.length === 0);
    
    if (shouldShowFullLoading) {
      return (
        <Container>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              Catálogo de Jogos PlayStation
            </Typography>
            
            {/* Skeleton para filtros */}
            <SkeletonLoader 
              variant="custom" 
              customConfig={{
                elements: [
                  { variant: 'rounded', width: '100%', height: 56, marginBottom: 2 },
                  { variant: 'rounded', width: '100%', height: 200, marginBottom: 2 }
                ]
              }}
            />
          </Box>
          
          {/* Skeleton para conteúdo baseado no modo de visualização */}
          <SkeletonLoader 
            variant={viewMode === 'card' ? 'card' : 'table'}
            count={viewMode === 'card' ? 6 : 8}
          />
        </Container>
      );
    }
  }

  if (error) {
    return (
      <Container>
        <RetryErrorState 
          error={error}
          onRetry={() => window.location.reload()}
          title="Erro ao Carregar Jogos"
          message="Não foi possível carregar o catálogo de jogos"
          suggestions={[
            'Verifique sua conexão com a internet',
            'Tente recarregar a página',
            'Verifique se o servidor está funcionando'
          ]}
        />
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
        {/* Mobile: Apenas busca + botão de filtros */}
        {isMobile ? (
          <>
            {/* Botão de Filtros - Mobile - Alinhado à esquerda */}
            <Grid size={{ xs: 12 }}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 1 }}>
                <FilterButton
                  variant="toggle"
                  onClick={() => setFilterDrawerOpen(true)}
                  startIcon={<FilterAltIcon />}
                  sx={{
                    height: '56px',
                    position: 'relative',
                    fontSize: '0.875rem',
                    px: 2,
                    bgcolor: 'transparent',
                    color: '#0070f3',
                    border: '2px solid #0070f3',
                    '&:hover': {
                      bgcolor: 'rgba(0, 112, 243, 0.04)',
                      border: '2px solid #0056b3'
                    }
                  }}
                >
                  Filtros
                  {activeFiltersCount > 0 && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: -6,
                        right: -6,
                        bgcolor: '#ff4444',
                        color: 'white',
                        borderRadius: '50%',
                        width: 22,
                        height: 22,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        border: '2px solid white',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                      }}
                    >
                      {activeFiltersCount}
                    </Box>
                  )}
                </FilterButton>

                {/* Botão Limpar - Mobile */}
                <FilterButton 
                  variant="filter"
                  onClick={handleClearFilters}
                  startIcon={<FilterAltOffIcon />}
                  disabled={!hasActiveFilters}
                  sx={{
                    height: '56px',
                    fontSize: '0.875rem',
                    px: 2,
                    opacity: hasActiveFilters ? 1 : 0.5
                  }}
                >
                  Limpar
                </FilterButton>
              </Box>
            </Grid>
          </>
        ) : (
          /* Desktop: Barra completa de filtros */
          <>
            {/* Search - Prioridade máxima em mobile */}
            <Grid size={{ xs: 12, sm: 4, md: 2.5 }}>
              <SearchInput
                value={searchInput}
                onChange={handleSearch}
                label="Buscar por nome"
              />
            </Grid>

            {/* Platform - Segunda prioridade */}
            <Grid size={{ xs: 12, sm: 4, md: 2 }}>
              <FilterSelect
                value={platform}
                onChange={handlePlatformChange}
                label="Plataforma"
                options={dropdownOptions.platforms}
                disabled={optionsLoading}
              />
            </Grid>
            
            {/* Genre - Terceira prioridade */}
            <Grid size={{ xs: 6, sm: 4, md: 1.5 }}>
              <FilterSelect
                value={selectedGenre}
                onChange={handleGenreChange}
                label="Gênero"
                options={dropdownOptions.genres}
                disabled={optionsLoading}
              />
            </Grid>

            {/* Status - Quarta prioridade */}
            <Grid size={{ xs: 6, sm: 4, md: 1.5 }}>
              <FilterSelect
                value={selectedStatus}
                onChange={handleStatusChange}
                label="Status"
                options={dropdownOptions.statuses}
                allOptionLabel="Todos"
                disabled={optionsLoading}
              />
            </Grid>

            {/* PS Plus Filter - Botão toggle estilizado */}
            <Grid size={{ xs: 4, sm: 3, md: 1 }}>
              <FilterButton
                variant={isPsPlusFilter ? "primary" : "filter"}
                fullWidth
                onClick={handlePsPlusFilterChange}
                startIcon={<PsPlusIcon fontSize="small" />}
                tooltip={isPsPlusFilter ? "Remover filtro PS Plus" : "Filtrar apenas jogos PS Plus"}
                sx={{
                  height: '56px',
                  color: 'white',
                  border: 'none',
                  minWidth: 'auto',
                  px: 1,
                  ...(isPsPlusFilter && {
                    bgcolor: '#0070f3',
                    color: 'white',
                    border: '1px solid #0070f3',
                    '&:hover': {
                      bgcolor: '#0056b3',
                      border: '1px solid #0056b3',
                    }
                  }),
                  ...(!isPsPlusFilter && {
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.15)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                    }
                  })
                }}
              >
                PS+
              </FilterButton>
            </Grid>
            
            {/* Metacritic - Menos usado, mas importante */}
            <Grid size={{ xs: 6, sm: 4, md: 1.5 }}>
              <SearchInput
                value={minMetacritic}
                onChange={handleMinMetacriticChange}
                label="Metacritic ≥"
                type="number"
                inputProps={{ min: 0, max: 100 }}
                startAdornment={null}
              />
            </Grid>
            
            {/* Publisher - Aumentado para ter mais espaço */}
            <Grid size={{ xs: 6, sm: 6, md: 1.5 }} sx={{ display: { xs: 'none', sm: 'block' } }}>
              <FilterSelect
                value={selectedPublisher}
                onChange={handlePublisherChange}
                label="Publisher"
                options={dropdownOptions.publishers}
                disabled={optionsLoading}
              />
            </Grid>

            {/* Botões de ação */}
            <Grid size={{ xs: 6, sm: 3, md: 1 }}>
              <FilterButton 
                variant="filter"
                fullWidth
                onClick={handleClearFilters}
                startIcon={<FilterAltOffIcon fontSize="small" />}
                tooltip="Limpar todos os filtros"
              >
                Limpar
              </FilterButton>
            </Grid>

            {/* Export - Hidden em mobile muito pequeno */}
            <Grid size={{ xs: 6, sm: 3, md: 1 }} sx={{ display: { xs: 'none', sm: 'block' } }}>
              <FilterButton 
                variant="export"
                fullWidth
                onClick={handleExportCsv}
                startIcon={<FileDownloadIcon fontSize="small" />}
                tooltip="Exportar jogos para CSV"
                disabled={filteredGames.length === 0}
              >
                CSV
              </FilterButton>
            </Grid>
          </>
        )}
      </Grid>

      {/* Loading sutil quando infinite scroll desligado e carregando dados iniciais */}
      {loading && !settings.infiniteScrollEnabled && allGames.length === 0 && (
        <LinearProgress 
          sx={{ 
            mb: 2,
            borderRadius: 1,
            height: 3,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            '& .MuiLinearProgress-bar': {
              backgroundColor: '#0096FF'
            }
          }} 
        />
      )}

      {/* Navegação Alfabética */}
      <AlphabetNavigation 
        games={filteredGames}
        orderBy={orderBy}
        infiniteScrollEnabled={settings.infiniteScrollEnabled}
      />

      {/* Container com ID para controle de scroll */}
      <Box id="games-container">
        {/* Renderizar a visualização selecionada - Mobile sempre usa cards */}
        {(isMobile || viewMode === 'card') ? renderCardView() : renderTableView()}
        
        {/* Condicional: Infinite Scroll OU Paginação Tradicional */}
        {settings.infiniteScrollEnabled ? (
          /* Sentinela universal para infinite scroll com transições suaves */
          (hasMore || loading) && (
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
                  <LoadingSpinner variant="center" size="medium" />
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
          )
        ) : (
          /* Quando infinite scroll desabilitado, todos os jogos são carregados de uma vez */
          /* Não há necessidade de paginação tradicional */
          null
        )}
      </Box>
      
      {/* FilterDrawer para Mobile */}
      <FilterDrawer
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        // Estados dos filtros
        searchInput={searchInput}
        platform={platform}
        selectedGenre={selectedGenre}
        selectedStatus={selectedStatus}
        isPsPlusFilter={isPsPlusFilter}
        minMetacritic={minMetacritic}
        selectedPublisher={selectedPublisher}
        // Handlers dos filtros
        onSearchChange={handleSearch}
        onPlatformChange={handlePlatformChange}
        onGenreChange={handleGenreChange}
        onStatusChange={handleStatusChange}
        onPsPlusFilterChange={handlePsPlusFilterChange}
        onMinMetacriticChange={handleMinMetacriticChange}
        onPublisherChange={handlePublisherChange}
        onClearFilters={handleClearFilters}
        // Opções dos dropdowns
        dropdownOptions={dropdownOptions}
        optionsLoading={optionsLoading}
        // Contador de filtros ativos
        activeFiltersCount={activeFiltersCount}
      />
      
      {/* Diálogo de confirmação de exclusão */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Confirmar exclusão"
        message={`Tem certeza que deseja excluir o jogo "${gameToDelete?.name}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        severity="error"
        titleId="delete-dialog-title"
        descriptionId="delete-dialog-description"
      />

      {/* Diálogo de confirmação para marcar como concluído */}
      <ConfirmDialog
        open={completedDialogOpen}
        onClose={() => setCompletedDialogOpen(false)}
        onConfirm={handleMarkCompleted}
        title="Marcar como concluído"
        message={`Deseja marcar o jogo "${gameToMarkCompleted?.name}" como concluído?`}
        confirmText="Confirmar"
        severity="success"
        titleId="completed-dialog-title"
        descriptionId="completed-dialog-description"
      />
    </Container>
  );
}

export default Home;
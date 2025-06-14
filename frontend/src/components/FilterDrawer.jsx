import React from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  Stack,
  Badge,
  Button
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';

// Componentes de Input padronizados
import SearchInput from './SearchInput';
import FilterSelect from './FilterSelect';
import FilterButton from './FilterButton';
import PsPlusIcon from './PsPlusIcon';

const FilterDrawer = ({
  open,
  onClose,
  // Estados dos filtros
  searchInput,
  platform,
  selectedGenre,
  selectedStatus,
  isPsPlusFilter,
  minMetacritic,
  selectedPublisher,
  // Handlers dos filtros
  onSearchChange,
  onPlatformChange,
  onGenreChange,
  onStatusChange,
  onPsPlusFilterChange,
  onMinMetacriticChange,
  onPublisherChange,
  onClearFilters,
  // Opções dos dropdowns
  dropdownOptions,
  optionsLoading,
  // Contador de filtros ativos
  activeFiltersCount
}) => {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: '85%',
          maxWidth: '400px',
          bgcolor: '#1a1a1a',
          color: 'white'
        }
      }}
    >
      <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header do Drawer */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterAltIcon color="primary" />
            <Typography variant="h6" component="h2">
              Filtros
            </Typography>
            {activeFiltersCount > 0 && (
              <Badge 
                badgeContent={activeFiltersCount} 
                color="primary"
                sx={{
                  '& .MuiBadge-badge': {
                    bgcolor: '#0070f3',
                    color: 'white'
                  }
                }}
              >
                <Box />
              </Badge>
            )}
          </Box>
          <IconButton onClick={onClose} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)', mb: 2 }} />

        {/* Conteúdo dos Filtros */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          <Stack spacing={3}>
            {/* Busca por nome */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, color: 'rgba(255,255,255,0.7)' }}>
                Buscar
              </Typography>
              <SearchInput
                value={searchInput}
                onChange={onSearchChange}
                label="Nome do jogo"
                fullWidth
              />
            </Box>

            {/* Plataforma */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, color: 'rgba(255,255,255,0.7)' }}>
                Plataforma
              </Typography>
              <FilterSelect
                value={platform}
                onChange={onPlatformChange}
                label="Selecionar plataforma"
                options={dropdownOptions.platforms}
                disabled={optionsLoading}
                fullWidth
              />
            </Box>

            {/* Gênero */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, color: 'rgba(255,255,255,0.7)' }}>
                Gênero
              </Typography>
              <FilterSelect
                value={selectedGenre}
                onChange={onGenreChange}
                label="Selecionar gênero"
                options={dropdownOptions.genres}
                disabled={optionsLoading}
                fullWidth
              />
            </Box>

            {/* Status */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, color: 'rgba(255,255,255,0.7)' }}>
                Status
              </Typography>
              <FilterSelect
                value={selectedStatus}
                onChange={onStatusChange}
                label="Selecionar status"
                options={dropdownOptions.statuses}
                allOptionLabel="Todos"
                disabled={optionsLoading}
                fullWidth
              />
            </Box>

            {/* PS Plus */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, color: 'rgba(255,255,255,0.7)' }}>
                PlayStation Plus
              </Typography>
              <FilterButton
                variant={isPsPlusFilter ? "primary" : "filter"}
                fullWidth
                onClick={onPsPlusFilterChange}
                startIcon={<PsPlusIcon fontSize="small" />}
                sx={{
                  height: '56px',
                  color: 'white',
                  border: 'none',
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
                {isPsPlusFilter ? 'Remover PS Plus' : 'Apenas PS Plus'}
              </FilterButton>
            </Box>

            {/* Metacritic */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, color: 'rgba(255,255,255,0.7)' }}>
                Pontuação Mínima
              </Typography>
              <SearchInput
                value={minMetacritic}
                onChange={onMinMetacriticChange}
                label="Metacritic ≥"
                type="number"
                inputProps={{ min: 0, max: 100 }}
                startAdornment={null}
                fullWidth
              />
            </Box>

            {/* Publisher */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, color: 'rgba(255,255,255,0.7)' }}>
                Publisher
              </Typography>
              <FilterSelect
                value={selectedPublisher}
                onChange={onPublisherChange}
                label="Selecionar publisher"
                options={dropdownOptions.publishers}
                disabled={optionsLoading}
                fullWidth
              />
            </Box>
          </Stack>
        </Box>

        {/* Footer com botões de ação */}
        <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <Stack spacing={2}>
            <Button
              variant="outlined"
              fullWidth
              onClick={onClearFilters}
              startIcon={<FilterAltOffIcon />}
              sx={{
                color: 'white',
                borderColor: 'rgba(255,255,255,0.3)',
                '&:hover': {
                  borderColor: 'rgba(255,255,255,0.5)',
                  bgcolor: 'rgba(255,255,255,0.05)'
                }
              }}
            >
              Limpar Filtros
            </Button>
            <Button
              variant="contained"
              fullWidth
              onClick={onClose}
              sx={{
                bgcolor: '#0070f3',
                '&:hover': {
                  bgcolor: '#0056b3'
                }
              }}
            >
              Aplicar Filtros
            </Button>
          </Stack>
        </Box>
      </Box>
    </Drawer>
  );
};

export default FilterDrawer; 
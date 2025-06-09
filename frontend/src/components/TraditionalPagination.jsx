import {
  Box,
  Button,
  Typography,
  IconButton,
  Pagination,
  Stack,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  NavigateBefore,
  NavigateNext,
  FirstPage,
  LastPage
} from '@mui/icons-material';

function TraditionalPagination({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  onPreviousPage, 
  onNextPage,
  loading,
  totalGames
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  const handlePageChange = (event, newPage) => {
    onPageChange(newPage);
  };

  const handleFirstPage = () => {
    onPageChange(1);
  };

  const handleLastPage = () => {
    onPageChange(totalPages);
  };

  if (totalPages <= 1) {
    return null; // Não mostrar paginação se há apenas 1 página
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        py: 4,
        mt: 3,
        backgroundColor: 'background.paper',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider'
      }}
    >
      {/* Informações da paginação */}
      <Typography 
        variant="body2" 
        color="text.secondary"
        textAlign="center"
      >
        Página {currentPage} de {totalPages}
        {totalGames && ` • ${totalGames} jogos no total`}
      </Typography>

      {/* Controles de paginação */}
      <Stack 
        direction="row" 
        spacing={1} 
        alignItems="center"
        sx={{ flexWrap: 'wrap', justifyContent: 'center' }}
      >
        {/* Primeira página - apenas desktop */}
        {!isMobile && (
          <IconButton
            onClick={handleFirstPage}
            disabled={!hasPrev || loading}
            size="small"
            sx={{
              '&:hover': { bgcolor: 'primary.main', color: 'white' },
              transition: 'all 0.2s'
            }}
          >
            <FirstPage />
          </IconButton>
        )}

        {/* Página anterior */}
        <Button
          onClick={onPreviousPage}
          disabled={!hasPrev || loading}
          startIcon={<NavigateBefore />}
          variant="outlined"
          size={isMobile ? 'small' : 'medium'}
          sx={{
            textTransform: 'none',
            '&:hover': { bgcolor: 'primary.main', color: 'white', borderColor: 'primary.main' }
          }}
        >
          {isMobile ? 'Ant.' : 'Anterior'}
        </Button>

        {/* Paginação do Material-UI - versão compacta para mobile */}
        <Pagination
          count={totalPages}
          page={currentPage}
          onChange={handlePageChange}
          disabled={loading}
          color="primary"
          size={isMobile ? 'small' : 'medium'}
          siblingCount={isMobile ? 0 : 1}
          boundaryCount={isMobile ? 1 : 2}
          sx={{
            '& .MuiPaginationItem-root': {
              '&:hover': {
                bgcolor: 'primary.main',
                color: 'white'
              }
            }
          }}
        />

        {/* Próxima página */}
        <Button
          onClick={onNextPage}
          disabled={!hasNext || loading}
          endIcon={<NavigateNext />}
          variant="outlined"
          size={isMobile ? 'small' : 'medium'}
          sx={{
            textTransform: 'none',
            '&:hover': { bgcolor: 'primary.main', color: 'white', borderColor: 'primary.main' }
          }}
        >
          {isMobile ? 'Próx.' : 'Próximo'}
        </Button>

        {/* Última página - apenas desktop */}
        {!isMobile && (
          <IconButton
            onClick={handleLastPage}
            disabled={!hasNext || loading}
            size="small"
            sx={{
              '&:hover': { bgcolor: 'primary.main', color: 'white' },
              transition: 'all 0.2s'
            }}
          >
            <LastPage />
          </IconButton>
        )}
      </Stack>

      {/* Indicador de carregamento */}
      {loading && (
        <Typography variant="body2" color="primary.main" sx={{ fontWeight: 500 }}>
          🔄 Carregando...
        </Typography>
      )}
    </Box>
  );
}

export default TraditionalPagination; 
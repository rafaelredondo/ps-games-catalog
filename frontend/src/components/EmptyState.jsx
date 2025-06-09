import { Box, Typography, Paper } from '@mui/material';
import { Search as SearchIcon, FilterAlt as FilterIcon, VideogameAsset as GameIcon } from '@mui/icons-material';

const EmptyState = ({ 
  type = 'search', // 'search', 'filter', 'catalog'
  title,
  message,
  icon,
  action 
}) => {
  // Default values based on type
  const defaults = {
    search: {
      icon: <SearchIcon sx={{ fontSize: '4rem', color: 'text.secondary' }} />,
      title: 'Nenhum jogo encontrado',
      message: 'Sua busca não retornou resultados. Tente ajustar os termos da pesquisa.'
    },
    filter: {
      icon: <FilterIcon sx={{ fontSize: '4rem', color: 'text.secondary' }} />,
      title: 'Nenhum jogo encontrado',
      message: 'Não há jogos que correspondem aos filtros aplicados. Tente ajustar ou limpar os filtros.'
    },
    catalog: {
      icon: <GameIcon sx={{ fontSize: '4rem', color: 'text.secondary' }} />,
      title: 'Catálogo vazio',
      message: 'Você ainda não possui jogos no seu catálogo. Adicione seu primeiro jogo!'
    }
  };

  const config = defaults[type] || defaults.search;

  return (
    <Paper
      elevation={0}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: { xs: 6, md: 8 },
        px: 3,
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        border: '1px dashed rgba(255, 255, 255, 0.1)',
        borderRadius: 2,
        textAlign: 'center',
        minHeight: '300px'
      }}
    >
      {icon || config.icon}
      
      <Typography
        variant="h6"
        component="h3"
        sx={{
          mt: 3,
          mb: 1,
          fontWeight: 600,
          color: 'text.primary'
        }}
      >
        {title || config.title}
      </Typography>
      
      <Typography
        variant="body1"
        color="text.secondary"
        sx={{
          maxWidth: '400px',
          lineHeight: 1.6,
          mb: action ? 3 : 0
        }}
      >
        {message || config.message}
      </Typography>
      
      {action && (
        <Box sx={{ mt: 2 }}>
          {action}
        </Box>
      )}
    </Paper>
  );
};

export default EmptyState; 
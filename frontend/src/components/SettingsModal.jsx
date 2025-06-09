import {
  Switch,
  FormControlLabel,
  Typography,
  Box,
  Button,
  Divider,
  Tooltip,
  Alert
} from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import InfiniteIcon from '@mui/icons-material/AllInclusive';
import { useSettings } from '../contexts/SettingsContext';
import InfoDialog from './InfoDialog';

function SettingsModal({ open, onClose }) {
  const { settings, updateSetting, resetSettings } = useSettings();

  const handleInfiniteScrollToggle = (event) => {
    updateSetting('infiniteScrollEnabled', event.target.checked);
  };

  const handleResetSettings = () => {
    resetSettings();
  };

  return (
    <InfoDialog 
      open={open} 
      onClose={onClose}
      title="Configurações"
      icon="⚙️"
      maxWidth="sm"
      actions={
        <>
          <Tooltip title="Restaurar configurações padrão">
            <Button
              onClick={handleResetSettings}
              startIcon={<RestoreIcon />}
              color="inherit"
              variant="outlined"
              sx={{ textTransform: 'none' }}
            >
              Restaurar Padrões
            </Button>
          </Tooltip>
          <Button
            onClick={onClose}
            variant="contained"
            color="primary"
            sx={{ textTransform: 'none', ml: 1 }}
          >
            Fechar
          </Button>
        </>
      }
    >
      {/* Seção de Navegação */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
          🚀 Navegação
        </Typography>

        <FormControlLabel
          control={
            <Switch
              checked={settings.infiniteScrollEnabled}
              onChange={handleInfiniteScrollToggle}
              color="primary"
            />
          }
          label={
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <InfiniteIcon fontSize="small" />
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  Infinite Scroll
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ ml: 3 }}>
                {settings.infiniteScrollEnabled 
                  ? 'Carrega automaticamente mais jogos ao fazer scroll'
                  : 'Usa paginação tradicional com botões Anterior/Próximo'
                }
              </Typography>
            </Box>
          }
          sx={{ 
            alignItems: 'flex-start',
            '& .MuiFormControlLabel-label': { mt: 0.5 }
          }}
        />
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Informações sobre o Infinite Scroll */}
      <Alert 
        severity={settings.infiniteScrollEnabled ? "info" : "warning"} 
        sx={{ mb: 2 }}
      >
        <Typography variant="body2">
          {settings.infiniteScrollEnabled ? (
            <><strong>Infinite Scroll Ativo:</strong> Role a página para carregar mais jogos automaticamente. Ideal para explorar grandes coleções.</>
          ) : (
            <><strong>Paginação Tradicional:</strong> Use os botões para navegar entre páginas. Melhor para navegação precisa.</>
          )}
        </Typography>
      </Alert>

      {/* Informações adicionais */}
      <Box sx={{ bgcolor: 'background.default', p: 2, borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary">
          💡 <strong>Dica:</strong> Suas configurações são salvas automaticamente e ficam ativas entre sessões.
        </Typography>
      </Box>
    </InfoDialog>
  );
}

export default SettingsModal; 
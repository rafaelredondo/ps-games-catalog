import React, { useState } from 'react';
import {
  Box,
  Typography,
  Alert,
  AlertTitle,
  Button,
  Collapse,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  WifiOff as OfflineIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import ActionButton from './ActionButton';
import LoadingSpinner from './LoadingSpinner';

/**
 * RetryErrorState Component
 * 
 * Componente padronizado para estados de erro com funcionalidades de retry
 * Identifica automaticamente tipos de erro e sugere ações apropriadas
 * 
 * @param {Object} props
 * @param {Error|string} props.error - Erro ocorrido
 * @param {Function} props.onRetry - Função para tentar novamente
 * @param {boolean} props.loading - Se retry está em andamento
 * @param {string} props.title - Título customizado do erro
 * @param {string} props.message - Mensagem customizada
 * @param {'error'|'warning'|'info'} props.severity - Severidade do erro
 * @param {boolean} props.showDetails - Se deve mostrar detalhes técnicos
 * @param {Array} props.suggestions - Sugestões customizadas de recuperação
 * @param {React.ReactNode} props.actions - Ações customizadas
 * @param {Object} props.sx - Estilos customizados
 */
const RetryErrorState = ({
  error,
  onRetry,
  loading = false,
  title,
  message,
  severity = 'error',
  showDetails = false,
  suggestions = [],
  actions,
  sx = {},
  ...props
}) => {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  // Análise automática do tipo de erro
  const analyzeError = () => {
    const errorMessage = error?.message || error || '';
    const errorString = String(errorMessage).toLowerCase();

    // Erro de rede/conectividade
    if (
      errorString.includes('network') ||
      errorString.includes('fetch') ||
      errorString.includes('timeout') ||
      errorString.includes('connection') ||
      error?.code === 'ERR_NETWORK'
    ) {
      return {
        type: 'network',
        icon: <OfflineIcon sx={{ fontSize: 48, color: 'warning.main' }} />,
        title: title || 'Problema de Conexão',
        message: message || 'Não foi possível conectar ao servidor',
        severity: 'warning',
        suggestions: [
          'Verifique sua conexão com a internet',
          'Tente novamente em alguns segundos',
          'Verifique se o servidor está funcionando'
        ]
      };
    }

    // Erro de autorização
    if (
      errorString.includes('401') ||
      errorString.includes('unauthorized') ||
      errorString.includes('authentication')
    ) {
      return {
        type: 'auth',
        icon: <WarningIcon sx={{ fontSize: 48, color: 'error.main' }} />,
        title: title || 'Erro de Autenticação',
        message: message || 'Sessão expirada ou credenciais inválidas',
        severity: 'error',
        suggestions: [
          'Faça login novamente',
          'Verifique suas credenciais',
          'Limpe o cache do navegador'
        ]
      };
    }

    // Erro de servidor
    if (
      errorString.includes('500') ||
      errorString.includes('server') ||
      errorString.includes('internal')
    ) {
      return {
        type: 'server',
        icon: <ErrorIcon sx={{ fontSize: 48, color: 'error.main' }} />,
        title: title || 'Erro do Servidor',
        message: message || 'Erro interno do servidor',
        severity: 'error',
        suggestions: [
          'Tente novamente em alguns minutos',
          'O problema pode ser temporário',
          'Entre em contato se persistir'
        ]
      };
    }

    // Erro genérico
    return {
      type: 'generic',
      icon: <InfoIcon sx={{ fontSize: 48, color: 'info.main' }} />,
      title: title || 'Erro Inesperado',
      message: message || errorMessage || 'Ocorreu um erro inesperado',
      severity: severity,
      suggestions: [
        'Tente recarregar a página',
        'Verifique sua conexão',
        'Entre em contato se o problema persistir'
      ]
    };
  };

  const errorInfo = analyzeError();
  const finalSuggestions = suggestions.length > 0 ? suggestions : errorInfo.suggestions;
  const retryCount = useState(0)[0]; // Para tracking de tentativas

  const handleRetry = async () => {
    if (onRetry && !loading) {
      try {
        await onRetry();
      } catch (retryError) {
        console.error('Erro no retry:', retryError);
      }
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        py: 4,
        px: 2,
        ...sx
      }}
      {...props}
    >
      {/* Ícone principal */}
      {errorInfo.icon}

      {/* Título e mensagem principal */}
      <Box sx={{ mt: 2, mb: 3 }}>
        <Typography variant="h5" color={`${errorInfo.severity}.main`} gutterBottom>
          {errorInfo.title}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {errorInfo.message}
        </Typography>
      </Box>

      {/* Alert com sugestões */}
      <Alert 
        severity={errorInfo.severity} 
        sx={{ 
          width: '100%', 
          maxWidth: '500px', 
          textAlign: 'left',
          mb: 3 
        }}
      >
        <AlertTitle>Como resolver</AlertTitle>
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          {finalSuggestions.map((suggestion, index) => (
            <li key={index}>{suggestion}</li>
          ))}
        </ul>
      </Alert>

      {/* Ações principais */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center', mb: 2 }}>
        {onRetry && (
          <ActionButton
            variant={errorInfo.severity === 'error' ? 'primary' : 'warning'}
            onClick={handleRetry}
            loading={loading}
            startIcon={<RefreshIcon />}
            disabled={loading}
          >
            {loading ? 'Tentando...' : 'Tentar Novamente'}
          </ActionButton>
        )}
        
        {actions}
      </Box>

      {/* Detalhes técnicos expansíveis */}
      {(error?.stack || error?.message) && (
        <Box sx={{ width: '100%', maxWidth: '500px' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Tooltip title={showTechnicalDetails ? 'Ocultar detalhes' : 'Mostrar detalhes técnicos'}>
              <IconButton
                onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                size="small"
                sx={{
                  transform: showTechnicalDetails ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s ease'
                }}
              >
                <ExpandMoreIcon />
              </IconButton>
            </Tooltip>
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
              Detalhes técnicos
            </Typography>
          </Box>

          <Collapse in={showTechnicalDetails}>
            <Alert severity="info" sx={{ mt: 2, textAlign: 'left' }}>
              <AlertTitle>Informações técnicas</AlertTitle>
              <Box
                component="pre"
                sx={{
                  fontSize: '0.75rem',
                  overflow: 'auto',
                  maxHeight: '200px',
                  bgcolor: 'rgba(0,0,0,0.05)',
                  p: 1,
                  borderRadius: 1,
                  mt: 1,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}
              >
                {error?.stack || error?.message || String(error)}
              </Box>
            </Alert>
          </Collapse>
        </Box>
      )}

      {/* Loading indicator durante retry */}
      {loading && (
        <Box sx={{ mt: 2 }}>
          <LoadingSpinner variant="center" size="small" message="Tentando reconectar..." />
        </Box>
      )}
    </Box>
  );
};

export default RetryErrorState; 
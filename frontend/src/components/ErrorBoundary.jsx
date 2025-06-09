import React from 'react';
import { 
  Box, 
  Typography, 
  Alert, 
  AlertTitle,
  Button,
  Container
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import BugReportIcon from '@mui/icons-material/BugReport';
import ActionButton from './ActionButton';

/**
 * ErrorBoundary Component
 * 
 * Captura erros de JavaScript e previne crashes da aplicação inteira
 * Fornece interface amigável para recuperação de erros
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Componentes filhos a serem protegidos
 * @param {Function} props.fallback - Componente customizado para renderizar em caso de erro
 * @param {Function} props.onError - Callback executado quando erro é capturado
 * @param {boolean} props.showErrorDetails - Se deve mostrar detalhes técnicos do erro (apenas em DEV)
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    // Atualiza o state para mostrar a UI de erro
    return { 
      hasError: true,
      errorId: Math.random().toString(36).substr(2, 9) // ID único para o erro
    };
  }

  componentDidCatch(error, errorInfo) {
    // Captura detalhes do erro
    this.setState({
      error,
      errorInfo
    });

    // Callback customizado para logging
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log do erro para debugging
    console.group('🚨 ErrorBoundary: Erro capturado');
    console.error('Erro:', error);
    console.error('Stack:', errorInfo.componentStack);
    console.groupEnd();
  }

  handleRetry = () => {
    // Reset do estado para tentar novamente
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null
    });
  };

  handleReload = () => {
    // Recarregar a página inteira
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Se há fallback customizado, usar ele
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleRetry);
      }

      // UI padrão de erro
      const isDev = import.meta.env.DEV;
      const showDetails = this.props.showErrorDetails && isDev;

      return (
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: 3
            }}
          >
            {/* Ícone principal */}
            <BugReportIcon 
              sx={{ 
                fontSize: 64, 
                color: 'error.main',
                animation: 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%, 100%': { opacity: 1 },
                  '50%': { opacity: 0.5 }
                }
              }} 
            />

            {/* Título e mensagem */}
            <Box>
              <Typography variant="h4" color="error.main" gutterBottom>
                Oops! Algo deu errado
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                Ocorreu um erro inesperado na aplicação.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ID do erro: <code>{this.state.errorId}</code>
              </Typography>
            </Box>

            {/* Alert com detalhes básicos */}
            <Alert severity="error" sx={{ width: '100%', textAlign: 'left' }}>
              <AlertTitle>Detalhes do erro</AlertTitle>
              {this.state.error?.message || 'Erro desconhecido'}
            </Alert>

            {/* Detalhes técnicos (apenas em desenvolvimento) */}
            {showDetails && this.state.error && (
              <Alert severity="warning" sx={{ width: '100%', textAlign: 'left' }}>
                <AlertTitle>Informações técnicas (DEV)</AlertTitle>
                <Box component="pre" sx={{ 
                  fontSize: '0.75rem', 
                  overflow: 'auto',
                  maxHeight: '200px',
                  bgcolor: 'rgba(0,0,0,0.05)',
                  p: 1,
                  borderRadius: 1,
                  mt: 1
                }}>
                  {this.state.error.stack}
                </Box>
              </Alert>
            )}

            {/* Botões de ação */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
              <ActionButton
                variant="primary"
                onClick={this.handleRetry}
                startIcon={<RefreshIcon />}
              >
                Tentar Novamente
              </ActionButton>
              
              <Button
                variant="outlined"
                onClick={this.handleReload}
                startIcon={<RefreshIcon />}
              >
                Recarregar Página
              </Button>
            </Box>

            {/* Dicas de recuperação */}
            <Alert severity="info" sx={{ width: '100%' }}>
              <AlertTitle>Dicas para resolver</AlertTitle>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                <li>Tente recarregar a página</li>
                <li>Verifique sua conexão com a internet</li>
                <li>Se o problema persistir, tente limpar o cache do navegador</li>
              </ul>
            </Alert>
          </Box>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 
import React from 'react';
import { Alert, AlertTitle, Button, Box, Typography } from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';

class ConnectionErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Filtrar erros específicos de extensões do navegador
    if (error.message && error.message.includes('Receiving end does not exist')) {
      console.warn('Erro de extensão do navegador ignorado:', error);
      return { hasError: false, error: null };
    }
    
    // Capturar outros erros de conexão
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Ignorar erros de extensões
    if (error.message && error.message.includes('Receiving end does not exist')) {
      console.warn('Erro de extensão do navegador ignorado:', error);
      this.setState({ hasError: false, error: null });
      return;
    }

    console.error('Erro capturado pelo ConnectionErrorBoundary:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    // Recarregar a página se necessário
    if (this.props.onRetry) {
      this.props.onRetry();
    } else {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 3, maxWidth: 600, mx: 'auto', mt: 4 }}>
          <Alert severity="error">
            <AlertTitle>Erro de Conexão</AlertTitle>
            <Typography variant="body2" sx={{ mb: 2 }}>
              {this.state.error?.message || 'Ocorreu um erro inesperado.'}
            </Typography>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={this.handleRetry}
              size="small"
            >
              Tentar Novamente
            </Button>
          </Alert>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ConnectionErrorBoundary; 
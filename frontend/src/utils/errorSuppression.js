// Utilitário para suprimir erros conhecidos de extensões do navegador

// Lista de erros conhecidos que devem ser ignorados
const IGNORED_ERRORS = [
  'Could not establish connection. Receiving end does not exist.',
  'Extension context invalidated',
  'The message port closed before a response was received',
  'chrome-extension://',
  'moz-extension://',
  'safari-extension://'
];

// Função para verificar se um erro deve ser ignorado
export const shouldIgnoreError = (error) => {
  if (!error) return false;
  
  const errorMessage = error.message || error.toString();
  
  return IGNORED_ERRORS.some(ignoredError => 
    errorMessage.includes(ignoredError)
  );
};

// Error handler global para capturar erros de extensões
const setupGlobalErrorHandler = () => {
  // Capturar erros não tratados
  window.addEventListener('error', (event) => {
    if (shouldIgnoreError(event.error)) {
      console.warn('🔇 Erro de extensão do navegador ignorado:', event.error);
      event.preventDefault();
      return false;
    }
  });

  // Capturar promises rejeitadas
  window.addEventListener('unhandledrejection', (event) => {
    if (shouldIgnoreError(event.reason)) {
      console.warn('🔇 Promise rejeitada de extensão ignorada:', event.reason);
      event.preventDefault();
    }
  });
};

// Inicializar apenas uma vez
let isInitialized = false;

export const initializeErrorSuppression = () => {
  if (!isInitialized) {
    setupGlobalErrorHandler();
    isInitialized = true;
    console.log('✅ Sistema de supressão de erros de extensões ativado');
  }
};

export default {
  shouldIgnoreError,
  initializeErrorSuppression
}; 
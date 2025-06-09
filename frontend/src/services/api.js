import axios from 'axios';

// Configuração baseada no ambiente
const baseURL = import.meta.env.DEV 
  ? 'http://localhost:3000/api'  // Desenvolvimento
  : 'https://gamescatalog.net/api'; // Produção

const api = axios.create({
  baseURL,
  timeout: 10000 // 10 segundos timeout
});

// Interceptor para tratar erros globalmente
api.interceptors.response.use(
  response => response,
  error => {
    // Tratar erros específicos de conexão
    if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
      console.error('Erro de conexão com o servidor:', error);
      error.message = 'Não foi possível conectar com o servidor. Verifique se o backend está rodando.';
    }
    
    // Evitar erros "Receiving end does not exist" de extensões
    if (error.message && error.message.includes('Receiving end does not exist')) {
      console.warn('Erro de extensão do navegador detectado e ignorado:', error);
      return Promise.resolve({ data: null, status: 200 });
    }
    
    return Promise.reject(error);
  }
);

export default api; 
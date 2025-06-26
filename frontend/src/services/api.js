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
    // Tratar erros de autenticação (401)
    if (error.response?.status === 401) {
      console.warn('🔐 Erro de autenticação detectado');
      
      // Verificar se havia credenciais (usuário estava logado)
      const hadCredentials = localStorage.getItem('ps-games-auth');
      
      // Limpar credenciais do localStorage
      localStorage.removeItem('ps-games-auth');
      
      // Remover header de autorização
      delete api.defaults.headers.common['Authorization'];
      
      // Só fazer reload se o usuário estava logado (evita loop para usuários deslogados)
      if (hadCredentials) {
        console.warn('🔄 Usuário estava logado - recarregando página para forçar login');
        // Usamos setTimeout para evitar loops infinitos
        setTimeout(() => {
          window.location.reload();
        }, 100);
        
        return Promise.reject(new Error('Sessão expirada. Faça login novamente.'));
      } else {
        console.warn('👤 Usuário não estava logado - deixando AuthContext lidar');
        return Promise.reject(new Error('Autenticação necessária.'));
      }
    }
    
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
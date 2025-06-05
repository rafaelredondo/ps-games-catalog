import axios from 'axios';

// Configuração baseada no ambiente
const baseURL = import.meta.env.DEV 
  ? 'http://localhost:3000/api'  // Desenvolvimento
  : 'https://gamescatalog.net/api'; // Produção

const api = axios.create({
  baseURL
});

export default api; 
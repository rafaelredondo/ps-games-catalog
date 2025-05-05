import api from './api';

export const gamesService = {
  // Listar todos os jogos
  async getAll() {
    const response = await api.get('/games');
    return response.data;
  },

  // Buscar jogos por plataforma
  async getByPlatform(platform) {
    const response = await api.get(`/games/platform/${platform}`);
    return response.data;
  },

  // Buscar um jogo específico
  async getById(id) {
    const response = await api.get(`/games/${id}`);
    return response.data;
  },

  // Verificar se um jogo já existe pelo nome
  async checkDuplicate(name) {
    try {
      const games = await this.getAll();
      return games.some(game => game.name.toLowerCase() === name.toLowerCase());
    } catch (error) {
      console.error('Erro ao verificar duplicatas:', error);
      throw error;
    }
  },

  // Criar um novo jogo
  async create(game) {
    const response = await api.post('/games', game);
    return response.data;
  },

  // Atualizar um jogo
  async update(id, game) {
    const response = await api.put(`/games/${id}`, game);
    return response.data;
  },

  // Remover um jogo
  async delete(id) {
    const response = await api.delete(`/games/${id}`);
    return response.data;
  },

  // Limpar todo o banco de dados
  async clearAll() {
    const response = await api.delete('/games/clear');
    return response.data;
  }
}; 
import api from './api';

export const gamesService = {
  // Listar todos os jogos
  async getAll() {
    const response = await api.get('/games');
    return response.data;
  },

  // Listar jogos com paginação e filtros
  async getPaginated({ page = 1, limit = 20, search = '', platform = '', orderBy = 'name', order = 'asc' }) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    
    if (search) {
      params.append('search', search);
    }
    
    if (platform) {
      params.append('platform', platform);
    }
    
    if (orderBy) {
      params.append('orderBy', orderBy);
    }
    
    if (order) {
      params.append('order', order);
    }

    const response = await api.get(`/games?${params.toString()}`);
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
    console.log('Serviço - Dados completos sendo enviados para criação:', game);
    console.log('Serviço - Campo status sendo enviado:', game.status);
    const response = await api.post('/games', game);
    return response.data;
  },

  // Atualizar um jogo
  async update(id, game) {
    try {
      console.log('gamesService - Atualizando jogo ID:', id);
      
      // Garantir que os campos obrigatórios estejam presentes
      const dataToSend = {
        ...game,
        id,
        name: game.name,
        platforms: Array.isArray(game.platforms) ? game.platforms : [],
        mediaTypes: Array.isArray(game.mediaTypes) ? game.mediaTypes : [],
        // Campos opcionais com valores padrão
        coverUrl: game.coverUrl || '',
        released: game.released || '',
        metacritic: game.metacritic || null,
        genres: Array.isArray(game.genres) ? game.genres : [],
        publishers: Array.isArray(game.publishers) ? game.publishers : [],
        description: game.description || '',
        completed: game.completed === true,
        playTime: game.playTime || null,
        status: game.status || (game.completed ? 'Concluído' : 'Não iniciado')
      };
      
      console.log('gamesService - Dados completos enviados para API:', dataToSend);
      
      const response = await api.put(`/games/${id}`, dataToSend);
      console.log('gamesService - Resposta da API:', response.data);
      return response.data;
    } catch (error) {
      console.error('gamesService - Erro na chamada à API:', error);
      throw error;
    }
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
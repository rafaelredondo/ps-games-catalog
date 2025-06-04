import axios from 'axios';

const RAWG_API_KEY = 'eb88977d653e45eb951a54fb21c02a4b';
const RAWG_BASE_URL = 'https://api.rawg.io/api';

const rawgApi = axios.create({
  baseURL: RAWG_BASE_URL,
  params: {
    key: RAWG_API_KEY
  }
});

export const searchGame = async (gameName) => {
  try {
    // Buscar informações básicas do jogo
    const response = await rawgApi.get('/games', {
      params: {
        search: gameName,
        page_size: 1
      }
    });

    if (response.data.results.length > 0) {
      const game = response.data.results[0];
      
      // Buscar detalhes mais específicos do jogo por ID
      const detailsResponse = await rawgApi.get(`/games/${game.id}`);
      const gameDetails = detailsResponse.data;
      
      return {
        name: game.name,
        coverUrl: game.background_image,
        released: game.released || '',
        metacritic: game.metacritic || null,
        genres: game.genres ? game.genres.map(g => g.name) : [],
        publishers: gameDetails.publishers ? gameDetails.publishers.map(p => p.name) : [],
        description: gameDetails.description_raw || ''
      };
    }
    return null;
  } catch (error) {
    console.error('Erro ao buscar jogo na RAWG:', error);
    throw error;
  }
};

export default rawgApi; 
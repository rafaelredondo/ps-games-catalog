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
    const response = await rawgApi.get('/games', {
      params: {
        search: gameName,
        page_size: 1
      }
    });

    if (response.data.results.length > 0) {
      const game = response.data.results[0];
      return {
        name: game.name,
        coverUrl: game.background_image,
        rating: game.rating,
        playtime: game.playtime,
        description: game.description,
        released: game.released,
        platforms: game.platforms.map(p => p.platform.name)
      };
    }
    return null;
  } catch (error) {
    console.error('Erro ao buscar jogo na RAWG:', error);
    throw error;
  }
};

export default rawgApi; 
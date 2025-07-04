import { createContext, useContext, useState, useEffect } from 'react';
import { gamesService } from '../services/gamesService';
import { useDropdownCache } from './DropdownCacheContext';

const GamesContext = createContext();

export function GamesProvider({ children }) {
  const { invalidateAllCaches } = useDropdownCache();
  
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Carregar todos os jogos
  const loadGames = async () => {
    try {
      setLoading(true);
      const data = await gamesService.getAll();
      setGames(data);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar jogos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Carregar jogos por plataforma
  const loadGamesByPlatform = async (platform) => {
    try {
      setLoading(true);
      const data = await gamesService.getByPlatform(platform);
      setGames(data);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar jogos da plataforma');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Adicionar um novo jogo
  const addGame = async (game) => {
    try {
      // Verificar se o jogo já existe
      const isDuplicate = await gamesService.checkDuplicate(game.name);
      if (isDuplicate) {
        throw new Error(`Jogo "${game.name}" já existe no catálogo`);
      }
      
      const newGame = await gamesService.create(game);
      setGames(prevGames => [...prevGames, newGame]);
      
      // Invalidar cache de dropdown options
      invalidateAllCaches();
      
      return newGame;
    } catch (err) {
      setError(err.message || 'Erro ao adicionar jogo');
      throw err;
    }
  };

  // Atualizar um jogo
  const updateGame = async (id, game) => {
    try {
      console.log('GamesContext - Atualizando jogo ID:', id);
      console.log('GamesContext - Dados enviados para atualização:', game);
      
      // Verificar se já existe outro jogo com o mesmo nome
      const currentGames = await gamesService.getAll();
      const isDuplicate = currentGames.some(g => 
        g.id !== id && 
        g.name.toLowerCase() === game.name.toLowerCase()
      );
      
      if (isDuplicate) {
        throw new Error(`Já existe outro jogo com o nome "${game.name}" no catálogo`);
      }
      
      const updatedGame = await gamesService.update(id, game);
      console.log('GamesContext - Jogo atualizado com sucesso:', updatedGame);
      
      // Atualizar o estado com o jogo modificado
      setGames(prevGames => 
        prevGames.map(g => g.id === id ? updatedGame : g)
      );
      
      // Invalidar cache de dropdown options
      invalidateAllCaches();
      
      return updatedGame;
    } catch (err) {
      console.error('GamesContext - Erro ao atualizar jogo:', err);
      setError(err.message || 'Erro ao atualizar jogo');
      throw err;
    }
  };

  // Remover um jogo
  const deleteGame = async (id) => {
    try {
      await gamesService.delete(id);
      setGames(prevGames => prevGames.filter(g => g.id !== id));
      
      // Invalidar cache de dropdown options
      invalidateAllCaches();
    } catch (err) {
      setError('Erro ao remover jogo');
      throw err;
    }
  };

  // Limpar todos os jogos
  const clearAllGames = async () => {
    try {
      await gamesService.clearAll();
      setGames([]);
      
      // Invalidar cache de dropdown options
      invalidateAllCaches();
    } catch (err) {
      setError('Erro ao limpar jogos');
      throw err;
    }
  };

  // Carregar jogos ao iniciar
  useEffect(() => {
    loadGames();
  }, []);

  return (
    <GamesContext.Provider value={{
      games,
      loading,
      error,
      loadGames,
      loadGamesByPlatform,
      addGame,
      updateGame,
      deleteGame,
      clearAllGames
    }}>
      {children}
    </GamesContext.Provider>
  );
}

// Hook personalizado para usar o contexto
export function useGames() {
  const context = useContext(GamesContext);
  if (!context) {
    throw new Error('useGames deve ser usado dentro de um GamesProvider');
  }
  return context;
} 
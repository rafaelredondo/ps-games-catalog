import { useState, useEffect } from 'react';
import { gamesService } from '../services/gamesService';
import { useDropdownCache } from '../contexts/DropdownCacheContext';

const CACHE_KEY = 'dropdown_options_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos em milliseconds

/**
 * useDropdownOptions Hook
 * 
 * Manages dropdown options for forms efficiently by fetching only the necessary data
 * from a dedicated backend endpoint instead of loading all games.
 * Includes localStorage caching for better performance.
 * 
 * @returns {Object} Hook state and data
 * @returns {Object} options - Available options for dropdowns
 * @returns {Array} options.platforms - Available platforms 
 * @returns {Array} options.genres - Available genres
 * @returns {Array} options.publishers - Available publishers
 * @returns {Array} options.statuses - Available game statuses
 * @returns {Object} options.meta - Metadata about the options
 * @returns {boolean} loading - Whether options are being loaded
 * @returns {string|null} error - Error message if loading failed
 * @returns {Function} refetch - Function to manually refetch options
 * @returns {Function} invalidateCache - Function to clear cache and refetch
 */
const useDropdownOptions = () => {
  const { registerInvalidation } = useDropdownCache();
  
  const [options, setOptions] = useState({
    platforms: [],
    genres: [],
    publishers: [],
    statuses: [],
    meta: {
      totalGames: 0,
      platformCount: 0,
      genreCount: 0,
      publisherCount: 0
    }
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Função para verificar se o cache é válido
  const isCacheValid = (cacheData) => {
    if (!cacheData || !cacheData.timestamp) return false;
    const now = Date.now();
    return (now - cacheData.timestamp) < CACHE_DURATION;
  };

  // Função para carregar do cache
  const loadFromCache = () => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const cacheData = JSON.parse(cached);
        if (isCacheValid(cacheData)) {
          setOptions(cacheData.data);
          return true;
        }
      }
    } catch (err) {
      console.warn('Erro ao carregar cache de dropdown options:', err);
    }
    return false;
  };

  // Função para salvar no cache
  const saveToCache = (data) => {
    try {
      const cacheData = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (err) {
      console.warn('Erro ao salvar cache de dropdown options:', err);
    }
  };

  const fetchOptions = async (useCache = true) => {
    try {
      setLoading(true);
      setError(null);
      
      // Tentar carregar do cache primeiro
      if (useCache && loadFromCache()) {
        setLoading(false);
        return;
      }
      
      const data = await gamesService.getDropdownOptions();
      
      const newOptions = {
        platforms: data.platforms || [],
        genres: data.genres || [],
        publishers: data.publishers || [],
        statuses: data.statuses || [],
        meta: data.meta || {
          totalGames: 0,
          platformCount: 0,
          genreCount: 0,
          publisherCount: 0
        }
      };
      
      setOptions(newOptions);
      
      // Salvar no cache
      saveToCache(newOptions);
      
    } catch (err) {
      console.error('Erro ao carregar opções de dropdown:', err);
      setError('Erro ao carregar opções. Tente novamente.');
      
      // Fallback para arrays vazios em caso de erro
      const fallbackOptions = {
        platforms: [],
        genres: [],
        publishers: [],
        statuses: ['Concluído', 'Não iniciado', 'Jogando', 'Abandonado', 'Na fila'],
        meta: {
          totalGames: 0,
          platformCount: 0,
          genreCount: 0,
          publisherCount: 0
        }
      };
      
      setOptions(fallbackOptions);
    } finally {
      setLoading(false);
    }
  };

  // Função para invalidar cache e recarregar
  const invalidateCache = () => {
    try {
      localStorage.removeItem(CACHE_KEY);
    } catch (err) {
      console.warn('Erro ao invalidar cache:', err);
    }
    fetchOptions(false);
  };

  useEffect(() => {
    fetchOptions();
    
    // Registrar função de invalidação no contexto
    const unregister = registerInvalidation(invalidateCache);
    
    // Cleanup ao desmontar
    return unregister;
  }, []); // Executar apenas uma vez no mount

  return {
    options,
    loading,
    error,
    refetch: fetchOptions,
    invalidateCache
  };
};

export default useDropdownOptions; 
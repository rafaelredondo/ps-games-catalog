import { renderHook, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import useDropdownOptions from '../useDropdownOptions';
import { gamesService } from '../../services/gamesService';
import { DropdownCacheProvider } from '../../contexts/DropdownCacheContext';

// Mock do gamesService
vi.mock('../../services/gamesService', () => ({
  gamesService: {
    getDropdownOptions: vi.fn()
  }
}));

// Mock do localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;

// Wrapper com contexto
const wrapper = ({ children }) => (
  <DropdownCacheProvider>
    {children}
  </DropdownCacheProvider>
);

describe('useDropdownOptions - Cache System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('deve salvar dados no cache após fetch bem-sucedido', async () => {
    const mockData = {
      platforms: ['PlayStation 4', 'PlayStation 5'],
      genres: ['Action', 'RPG'],
      publishers: ['Sony', 'Nintendo'],
      statuses: ['Concluído', 'Jogando'],
      meta: { totalGames: 10 }
    };

    gamesService.getDropdownOptions.mockResolvedValue(mockData);

    renderHook(() => useDropdownOptions(), { wrapper });

    await waitFor(() => {
      expect(gamesService.getDropdownOptions).toHaveBeenCalledTimes(1);
    });

    // Verificar se salvou no cache
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'dropdown_options_cache',
      expect.stringContaining('"platforms":["PlayStation 4","PlayStation 5"]')
    );
  });

  it('deve carregar dados do cache quando válido', async () => {
    const cachedData = {
      data: {
        platforms: ['PlayStation 4'],
        genres: ['Action'],
        publishers: ['Sony'],
        statuses: ['Concluído'],
        meta: { totalGames: 5 }
      },
      timestamp: Date.now() - 60000 // 1 minuto atrás (dentro do limite de 5 min)
    };

    localStorageMock.getItem.mockReturnValue(JSON.stringify(cachedData));

    const { result } = renderHook(() => useDropdownOptions(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Não deve chamar o serviço se carregou do cache
    expect(gamesService.getDropdownOptions).not.toHaveBeenCalled();
    
    // Deve ter os dados do cache
    expect(result.current.options.platforms).toEqual(['PlayStation 4']);
  });

  it('deve ignorar cache expirado e fazer fetch', async () => {
    const expiredCachedData = {
      data: {
        platforms: ['PlayStation 4'],
        genres: ['Action'],
        publishers: ['Sony'],
        statuses: ['Concluído'],
        meta: { totalGames: 5 }
      },
      timestamp: Date.now() - 10 * 60 * 1000 // 10 minutos atrás (expirado)
    };

    const freshData = {
      platforms: ['PlayStation 5'],
      genres: ['RPG'],
      publishers: ['Nintendo'],
      statuses: ['Jogando'],
      meta: { totalGames: 15 }
    };

    localStorageMock.getItem.mockReturnValue(JSON.stringify(expiredCachedData));
    gamesService.getDropdownOptions.mockResolvedValue(freshData);

    const { result } = renderHook(() => useDropdownOptions(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Deve ter chamado o serviço para dados frescos
    expect(gamesService.getDropdownOptions).toHaveBeenCalledTimes(1);
    
    // Deve ter os dados frescos, não do cache expirado
    expect(result.current.options.platforms).toEqual(['PlayStation 5']);
  });

  it('deve invalidar cache corretamente', async () => {
    const mockData = {
      platforms: ['PlayStation 4'],
      genres: ['Action'],
      publishers: ['Sony'],
      statuses: ['Concluído'],
      meta: { totalGames: 5 }
    };

    gamesService.getDropdownOptions.mockResolvedValue(mockData);

    const { result } = renderHook(() => useDropdownOptions(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Invalidar cache
    result.current.invalidateCache();

    // Deve ter removido do localStorage
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('dropdown_options_cache');
    
    // Deve ter chamado o serviço novamente
    await waitFor(() => {
      expect(gamesService.getDropdownOptions).toHaveBeenCalledTimes(2);
    });
  });

  it('deve lidar com erro no localStorage graciosamente', async () => {
    localStorageMock.getItem.mockImplementation(() => {
      throw new Error('localStorage error');
    });

    const mockData = {
      platforms: ['PlayStation 4'],
      genres: ['Action'],
      publishers: ['Sony'],
      statuses: ['Concluído'],
      meta: { totalGames: 5 }
    };

    gamesService.getDropdownOptions.mockResolvedValue(mockData);

    const { result } = renderHook(() => useDropdownOptions(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Deve ter chamado o serviço mesmo com erro no cache
    expect(gamesService.getDropdownOptions).toHaveBeenCalledTimes(1);
    expect(result.current.options.platforms).toEqual(['PlayStation 4']);
  });
}); 
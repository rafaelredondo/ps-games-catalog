import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';

import Home from '../Home';
import * as gamesService from '../../services/gamesService';
import { GamesProvider } from '../../contexts/GamesContext';
import { SettingsProvider } from '../../contexts/SettingsContext';

// Mock do gamesService
vi.mock('../../services/gamesService', () => ({
  gamesService: {
    getPaginated: vi.fn(),
    getDropdownOptions: vi.fn()
  }
}));

// Mock do useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

// Mock theme for Material-UI
const theme = createTheme();

// Helper para renderizar com todos os providers necessários
const renderWithProviders = (component) => {
  return render(
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <SettingsProvider>
          <GamesProvider>
            {component}
          </GamesProvider>
        </SettingsProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
};

describe('Home - EmptyState para Status', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock das opções de dropdown
    gamesService.gamesService.getDropdownOptions.mockResolvedValue({
      platforms: ['PlayStation 4', 'PlayStation 5'],
      genres: ['Action', 'Adventure'],
      publishers: ['Sony', 'Microsoft'],
      statuses: ['Concluído', 'Não iniciado', 'Jogando', 'Abandonado', 'Na fila'],
      meta: { totalGames: 0 }
    });
  });

  it('deve mostrar EmptyState quando filtrar por status sem jogos', async () => {
    // Mock para retornar array vazio quando filtrar por "Abandonado"
    gamesService.gamesService.getPaginated.mockResolvedValue({
      games: [], // Nenhum jogo encontrado
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false
      }
    });

    renderWithProviders(<Home />);

    // Aguardar carregamento inicial
    await waitFor(() => {
      expect(screen.queryByText('🔄 Carregando mais jogos...')).not.toBeInTheDocument();
    });

    // Encontrar e alterar o filtro de status para "Abandonado"
    const statusSelect = screen.getByLabelText('Status');
    fireEvent.mouseDown(statusSelect);
    
    // Aguardar o dropdown abrir e selecionar "Abandonado"
    await waitFor(() => {
      const abandonedOption = screen.getByText('Abandonado');
      fireEvent.click(abandonedOption);
    });

    // Aguardar a nova consulta ser feita
    await waitFor(() => {
      expect(gamesService.gamesService.getPaginated).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'Abandonado'
        })
      );
    });

    // Verificar se o EmptyState aparece
    await waitFor(() => {
      expect(screen.getByText('Nenhum jogo encontrado')).toBeInTheDocument();
      expect(screen.getByText('Não há jogos que correspondem aos filtros aplicados. Tente ajustar ou limpar os filtros.')).toBeInTheDocument();
    });

    // Verificar se o botão "Limpar Filtros" está presente
    expect(screen.getByText('Limpar Filtros')).toBeInTheDocument();
  });

  it('deve permitir limpar filtros através do EmptyState', async () => {
    // Mock para retornar array vazio inicialmente
    gamesService.gamesService.getPaginated
      .mockResolvedValueOnce({
        games: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0, hasNext: false, hasPrev: false }
      })
      // E depois retornar jogos quando limpar filtros
      .mockResolvedValueOnce({
        games: [
          { id: '1', name: 'Test Game', platforms: ['PlayStation 4'], status: 'Concluído' }
        ],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1, hasNext: false, hasPrev: false }
      });

    renderWithProviders(<Home />);

    // Aguardar EmptyState aparecer
    await waitFor(() => {
      expect(screen.getByText('Nenhum jogo encontrado')).toBeInTheDocument();
    });

    // Clicar no botão "Limpar Filtros"
    const clearButton = screen.getByText('Limpar Filtros');
    fireEvent.click(clearButton);

    // Aguardar nova consulta sem filtros
    await waitFor(() => {
      expect(gamesService.gamesService.getPaginated).toHaveBeenLastCalledWith(
        expect.objectContaining({
          status: '' // Status vazio após limpar filtros
        })
      );
    });
  });
}); 
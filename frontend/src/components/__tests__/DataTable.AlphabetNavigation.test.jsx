import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import DataTable from '../DataTable';

const theme = createTheme();

const renderWithTheme = (component) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

const mockGamesData = [
  { id: '1', name: 'Assassins Creed', platforms: ['PS4'] },
  { id: '2', name: 'Battlefield', platforms: ['PC'] },
  { id: '3', name: 'Call of Duty', platforms: ['Xbox'] },
];

const mockColumns = [
  { id: 'name', label: 'Nome', sortable: true },
  { id: 'platforms', label: 'Plataformas' }
];

describe('DataTable AlphabetNavigation Integration', () => {
  it('deve definir IDs corretos nas linhas da tabela para navegação alfabética', () => {
    renderWithTheme(
      <DataTable
        data={mockGamesData}
        columns={mockColumns}
      />
    );

    // Verificar se os IDs foram definidos corretamente
    expect(document.getElementById('game-card-1')).toBeInTheDocument();
    expect(document.getElementById('game-card-2')).toBeInTheDocument();
    expect(document.getElementById('game-card-3')).toBeInTheDocument();
  });

  it('deve manter os IDs mesmo com seleção habilitada', () => {
    renderWithTheme(
      <DataTable
        data={mockGamesData}
        columns={mockColumns}
        selectable={true}
      />
    );

    // IDs devem continuar presentes mesmo com checkboxes
    expect(document.getElementById('game-card-1')).toBeInTheDocument();
    expect(document.getElementById('game-card-2')).toBeInTheDocument();
    expect(document.getElementById('game-card-3')).toBeInTheDocument();
  });

  it('deve usar ID único baseado no ID do jogo', () => {
    const gamesWithUniqueIds = [
      { id: 'abc-123', name: 'Game A', platforms: ['PS5'] },
      { id: 'def-456', name: 'Game B', platforms: ['PC'] }
    ];

    renderWithTheme(
      <DataTable
        data={gamesWithUniqueIds}
        columns={mockColumns}
      />
    );

    expect(document.getElementById('game-card-abc-123')).toBeInTheDocument();
    expect(document.getElementById('game-card-def-456')).toBeInTheDocument();
  });

  it('deve manter estrutura correta da linha da tabela', () => {
    renderWithTheme(
      <DataTable
        data={mockGamesData}
        columns={mockColumns}
      />
    );

    const firstRow = document.getElementById('game-card-1');
    
    // Verificar se é uma TableRow válida
    expect(firstRow.tagName).toBe('TR');
    expect(firstRow).toHaveAttribute('id', 'game-card-1');
    
    // Verificar se tem o conteúdo esperado
    expect(firstRow).toHaveTextContent('Assassins Creed');
    expect(firstRow).toHaveTextContent('PS4');
  });
}); 
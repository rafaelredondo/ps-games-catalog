import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import DataTable from '../DataTable';

// Mock theme for Material-UI
const theme = createTheme();

// Helper para renderizar com theme
const renderWithTheme = (component) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

// Dados de teste
const mockData = [
  {
    id: '1',
    name: 'Test Game 1',
    platforms: ['PlayStation 4', 'PlayStation 5'],
    genres: ['Action', 'RPG'],
    year: 2023,
    metacritic: 85,
    status: 'Concluído'
  },
  {
    id: '2',
    name: 'Test Game 2', 
    platforms: ['Nintendo Switch'],
    genres: ['Platformer'],
    year: 2022,
    metacritic: 78,
    status: 'Jogando'
  }
];

// Configuração de colunas de teste
const mockColumns = [
  {
    id: 'name',
    label: 'Nome',
    sortable: true
  },
  {
    id: 'platforms',
    label: 'Plataformas',
    sortable: true,
    render: (item) => item.platforms.join(', ')
  },
  {
    id: 'year',
    label: 'Ano',
    align: 'center',
    sortable: true,
    hideOnMobile: true
  },
  {
    id: 'actions',
    label: 'Ações',
    align: 'center',
    render: (item) => (
      <button data-testid={`action-${item.id}`}>
        Ação
      </button>
    )
  }
];

describe('DataTable', () => {
  it('deve renderizar tabela com dados corretamente', () => {
    renderWithTheme(
      <DataTable
        data={mockData}
        columns={mockColumns}
      />
    );

    // Verificar headers
    expect(screen.getByText('Nome')).toBeInTheDocument();
    expect(screen.getByText('Plataformas')).toBeInTheDocument();
    expect(screen.getByText('Ano')).toBeInTheDocument();
    expect(screen.getByText('Ações')).toBeInTheDocument();

    // Verificar dados
    expect(screen.getByText('Test Game 1')).toBeInTheDocument();
    expect(screen.getByText('Test Game 2')).toBeInTheDocument();
    expect(screen.getByText('PlayStation 4, PlayStation 5')).toBeInTheDocument();
    expect(screen.getByText('Nintendo Switch')).toBeInTheDocument();
  });

  it('deve mostrar estado de loading', () => {
    renderWithTheme(
      <DataTable
        data={[]}
        columns={mockColumns}
        loading={true}
      />
    );

    expect(screen.getByText('Carregando dados...')).toBeInTheDocument();
  });

  it('deve mostrar estado vazio quando não há dados', () => {
    renderWithTheme(
      <DataTable
        data={[]}
        columns={mockColumns}
        loading={false}
        emptyState={{
          title: 'Nenhum dado encontrado',
          message: 'Não há dados para exibir'
        }}
      />
    );

    expect(screen.getByText('Nenhum dado encontrado')).toBeInTheDocument();
  });

  it('deve chamar onRowClick quando linha é clicada', () => {
    const onRowClick = vi.fn();
    
    renderWithTheme(
      <DataTable
        data={mockData}
        columns={mockColumns}
        onRowClick={onRowClick}
      />
    );

    const firstRow = screen.getByText('Test Game 1').closest('tr');
    fireEvent.click(firstRow);

    expect(onRowClick).toHaveBeenCalledWith(mockData[0]);
  });

  it('deve chamar onSort quando header ordenável é clicado', () => {
    const onSort = vi.fn();
    
    renderWithTheme(
      <DataTable
        data={mockData}
        columns={mockColumns}
        onSort={onSort}
        orderBy=""
        order="asc"
      />
    );

    const nameHeader = screen.getByText('Nome').closest('span');
    fireEvent.click(nameHeader);

    expect(onSort).toHaveBeenCalledWith('name', 'asc');
  });

  it('deve mostrar seleção múltipla quando habilitada', () => {
    const onSelectionChange = vi.fn();
    
    renderWithTheme(
      <DataTable
        data={mockData}
        columns={mockColumns}
        selectable={true}
        onSelectionChange={onSelectionChange}
      />
    );

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(3); // 1 header + 2 data rows

    // Clicar no primeiro checkbox de dados
    fireEvent.click(checkboxes[1]);
    
    expect(onSelectionChange).toHaveBeenCalledWith(['1']);
  });

  it('deve selecionar todos quando checkbox do header é clicado', () => {
    const onSelectionChange = vi.fn();
    
    renderWithTheme(
      <DataTable
        data={mockData}
        columns={mockColumns}
        selectable={true}
        onSelectionChange={onSelectionChange}
      />
    );

    const headerCheckbox = screen.getAllByRole('checkbox')[0];
    fireEvent.click(headerCheckbox);

    expect(onSelectionChange).toHaveBeenCalledWith(['1', '2']);
  });

  it('deve renderizar ações customizadas', () => {
    renderWithTheme(
      <DataTable
        data={mockData}
        columns={mockColumns}
      />
    );

    expect(screen.getByTestId('action-1')).toBeInTheDocument();
    expect(screen.getByTestId('action-2')).toBeInTheDocument();
  });

  it('deve usar render customizado para células', () => {
    const customColumns = [
      {
        id: 'name',
        label: 'Nome',
        render: (item) => `Jogo: ${item.name}`
      }
    ];

    renderWithTheme(
      <DataTable
        data={mockData}
        columns={customColumns}
      />
    );

    expect(screen.getByText('Jogo: Test Game 1')).toBeInTheDocument();
    expect(screen.getByText('Jogo: Test Game 2')).toBeInTheDocument();
  });

  it('deve tratar arrays corretamente', () => {
    const arrayColumns = [
      {
        id: 'platforms',
        label: 'Plataformas',
        separator: ' | '
      }
    ];

    renderWithTheme(
      <DataTable
        data={mockData}
        columns={arrayColumns}
      />
    );

    expect(screen.getByText('PlayStation 4 | PlayStation 5')).toBeInTheDocument();
    expect(screen.getByText('Nintendo Switch')).toBeInTheDocument();
  });

  it('deve mostrar indicador de ordenação corretamente', () => {
    renderWithTheme(
      <DataTable
        data={mockData}
        columns={mockColumns}
        onSort={vi.fn()}
        orderBy="name"
        order="desc"
      />
    );

    // Verificar se o indicador de ordenação está presente
    const sortLabel = screen.getByText('Nome').closest('.MuiTableSortLabel-root');
    expect(sortLabel).toHaveClass('MuiTableSortLabel-active');
  });

  it('deve aplicar estilos customizados', () => {
    const customSx = { backgroundColor: 'red' };
    
    renderWithTheme(
      <DataTable
        data={mockData}
        columns={mockColumns}
        sx={customSx}
      />
    );

    const tableContainer = screen.getByRole('table').closest('.MuiTableContainer-root');
    expect(tableContainer).toHaveStyle('background-color: red');
  });
}); 
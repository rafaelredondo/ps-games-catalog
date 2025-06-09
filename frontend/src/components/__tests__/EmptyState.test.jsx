import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import EmptyState from '../EmptyState';
import { ThemeProvider, createTheme } from '@mui/material/styles';

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

describe('EmptyState', () => {
  it('deve renderizar com props padrão (tipo search)', () => {
    renderWithTheme(<EmptyState />);
    
    expect(screen.getByText('Nenhum jogo encontrado')).toBeInTheDocument();
    expect(screen.getByText('Sua busca não retornou resultados. Tente ajustar os termos da pesquisa.')).toBeInTheDocument();
  });

  it('deve renderizar tipo filter corretamente', () => {
    renderWithTheme(<EmptyState type="filter" />);
    
    expect(screen.getByText('Nenhum jogo encontrado')).toBeInTheDocument();
    expect(screen.getByText('Não há jogos que correspondem aos filtros aplicados. Tente ajustar ou limpar os filtros.')).toBeInTheDocument();
  });

  it('deve renderizar tipo catalog corretamente', () => {
    renderWithTheme(<EmptyState type="catalog" />);
    
    expect(screen.getByText('Catálogo vazio')).toBeInTheDocument();
    expect(screen.getByText('Você ainda não possui jogos no seu catálogo. Adicione seu primeiro jogo!')).toBeInTheDocument();
  });

  it('deve permitir title e message customizados', () => {
    const customTitle = 'Título customizado';
    const customMessage = 'Mensagem customizada';
    
    renderWithTheme(
      <EmptyState 
        title={customTitle}
        message={customMessage}
      />
    );
    
    expect(screen.getByText(customTitle)).toBeInTheDocument();
    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });

  it('deve renderizar action quando fornecido', () => {
    const mockAction = vi.fn();
    const actionButton = <button onClick={mockAction}>Ação Teste</button>;
    
    renderWithTheme(<EmptyState action={actionButton} />);
    
    const button = screen.getByText('Ação Teste');
    expect(button).toBeInTheDocument();
    
    fireEvent.click(button);
    expect(mockAction).toHaveBeenCalledTimes(1);
  });

  it('deve ter estrutura acessível', () => {
    renderWithTheme(<EmptyState />);
    
    // Verifica se tem heading
    const heading = screen.getByRole('heading', { level: 3 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Nenhum jogo encontrado');
  });
}); 
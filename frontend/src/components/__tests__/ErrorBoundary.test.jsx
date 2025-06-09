import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ErrorBoundary from '../ErrorBoundary';

const theme = createTheme();

const renderWithTheme = (component) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

// Componente que simula erro
const ThrowError = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error('Test error message');
  }
  return <div>Working component</div>;
};

describe('ErrorBoundary', () => {
  // Silenciar erros do console durante os testes
  const originalError = console.error;
  beforeAll(() => {
    console.error = vi.fn();
  });

  afterAll(() => {
    console.error = originalError;
  });

  it('deve renderizar children quando não há erro', () => {
    renderWithTheme(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Working component')).toBeInTheDocument();
  });

  it('deve capturar erro e mostrar UI de erro', () => {
    renderWithTheme(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Oops! Algo deu errado')).toBeInTheDocument();
    expect(screen.getByText('Test error message')).toBeInTheDocument();
    expect(screen.getByText('Tentar Novamente')).toBeInTheDocument();
  });

  it('deve permitir retry após erro', () => {
    const { rerender } = renderWithTheme(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // Verificar se mostra erro
    expect(screen.getByText('Oops! Algo deu errado')).toBeInTheDocument();

    // Clicar em retry
    fireEvent.click(screen.getByText('Tentar Novamente'));

    // Rerenderizar com componente funcionando
    rerender(
      <ThemeProvider theme={theme}>
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      </ThemeProvider>
    );

    expect(screen.getByText('Working component')).toBeInTheDocument();
  });

  it('deve chamar onError callback quando erro ocorre', () => {
    const onErrorSpy = vi.fn();

    renderWithTheme(
      <ErrorBoundary onError={onErrorSpy}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(onErrorSpy).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String)
      })
    );
  });

  it('deve mostrar ID único do erro', () => {
    renderWithTheme(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText(/ID do erro:/)).toBeInTheDocument();
  });

  it('deve usar fallback customizado quando fornecido', () => {
    const customFallback = (error, retry) => (
      <div>
        <p>Custom error UI</p>
        <button onClick={retry}>Custom retry</button>
      </div>
    );

    renderWithTheme(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom error UI')).toBeInTheDocument();
    expect(screen.getByText('Custom retry')).toBeInTheDocument();
  });

  it('deve mostrar detalhes técnicos em desenvolvimento', () => {
    // Simular ambiente de desenvolvimento
    vi.stubEnv('DEV', true);

    renderWithTheme(
      <ErrorBoundary showErrorDetails={true}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Informações técnicas (DEV)')).toBeInTheDocument();
  });

  it('deve permitir recarregar página', () => {
    // Mock window.location.reload
    const reloadSpy = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: reloadSpy },
      writable: true
    });

    renderWithTheme(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    fireEvent.click(screen.getByText('Recarregar Página'));
    expect(reloadSpy).toHaveBeenCalled();
  });
}); 
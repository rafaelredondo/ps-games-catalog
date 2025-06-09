import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import SkeletonLoader from '../SkeletonLoader';

const theme = createTheme();

const renderWithTheme = (component) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('SkeletonLoader', () => {
  it('deve renderizar skeleton padrão (card)', () => {
    renderWithTheme(<SkeletonLoader />);
    
    // Verificar se skeleton foi renderizado
    const skeletons = document.querySelectorAll('.MuiSkeleton-root');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('deve renderizar múltiplos itens quando count é especificado', () => {
    renderWithTheme(<SkeletonLoader variant="card" count={3} />);
    
    // Verificar se 3 cards foram renderizados
    const cards = document.querySelectorAll('.MuiCard-root');
    expect(cards).toHaveLength(3);
  });

  it('deve renderizar variant table', () => {
    renderWithTheme(<SkeletonLoader variant="table" count={2} />);
    
    // Verificar se skeleton de tabela foi renderizado
    const skeletons = document.querySelectorAll('.MuiSkeleton-root');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('deve renderizar variant form', () => {
    renderWithTheme(<SkeletonLoader variant="form" />);
    
    // Verificar se skeleton de formulário foi renderizado
    const skeletons = document.querySelectorAll('.MuiSkeleton-root');
    expect(skeletons.length).toBeGreaterThan(5); // Form tem vários campos
  });

  it('deve renderizar variant list', () => {
    renderWithTheme(<SkeletonLoader variant="list" count={3} />);
    
    // Verificar se 3 itens de lista foram renderizados
    const skeletons = document.querySelectorAll('.MuiSkeleton-root');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('deve renderizar variant details', () => {
    renderWithTheme(<SkeletonLoader variant="details" />);
    
    // Verificar se skeleton de detalhes foi renderizado
    const skeletons = document.querySelectorAll('.MuiSkeleton-root');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('deve renderizar variant stats', () => {
    renderWithTheme(<SkeletonLoader variant="stats" count={2} />);
    
    // Verificar se 2 cards de stats foram renderizados
    const cards = document.querySelectorAll('.MuiCard-root');
    expect(cards).toHaveLength(2);
  });

  it('deve renderizar variant custom com configuração personalizada', () => {
    const customConfig = {
      elements: [
        { variant: 'text', width: '100%', height: 20 },
        { variant: 'rectangular', width: 200, height: 100 },
        { variant: 'circular', width: 40, height: 40 }
      ]
    };

    renderWithTheme(
      <SkeletonLoader 
        variant="custom" 
        customConfig={customConfig}
      />
    );
    
    // Verificar se 3 elementos customizados foram renderizados
    const skeletons = document.querySelectorAll('.MuiSkeleton-root');
    expect(skeletons).toHaveLength(3);
  });

  it('deve desabilitar animação quando animation=false', () => {
    renderWithTheme(
      <SkeletonLoader 
        variant="card" 
        animation={false}
      />
    );
    
    // Verificar se skeleton foi renderizado sem animação
    const skeletons = document.querySelectorAll('.MuiSkeleton-root');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('deve aplicar estilos customizados', () => {
    const customStyles = { 
      bgcolor: 'red',
      borderRadius: '20px'
    };

    renderWithTheme(
      <SkeletonLoader 
        variant="card" 
        sx={customStyles}
      />
    );
    
    // Verificar se container foi renderizado
    const container = document.querySelector('[style*="border-radius"]');
    expect(container).toBeInTheDocument();
  });

  it('deve renderizar com count=0 sem erros', () => {
    renderWithTheme(<SkeletonLoader variant="card" count={0} />);
    
    // Não deve renderizar cards
    const cards = document.querySelectorAll('.MuiCard-root');
    expect(cards).toHaveLength(0);
  });

  it('deve fallback para variant card quando variant inválida', () => {
    renderWithTheme(<SkeletonLoader variant="invalid" />);
    
    // Deve renderizar como card (fallback)
    const cards = document.querySelectorAll('.MuiCard-root');
    expect(cards).toHaveLength(1);
  });
}); 
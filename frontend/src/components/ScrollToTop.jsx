import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Componente que faz scroll automático para o topo sempre que a rota mudar.
 * Resolve o problema de SPAs que mantêm a posição de scroll entre navegações.
 */
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll para o topo sempre que a rota mudar
    window.scrollTo(0, 0);
  }, [pathname]);

  return null; // Componente não renderiza nada visualmente
}

export default ScrollToTop; 
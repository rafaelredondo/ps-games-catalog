import { createContext, useContext, useRef } from 'react';

const DropdownCacheContext = createContext();

export function DropdownCacheProvider({ children }) {
  // Usar useRef para manter referências das funções de invalidação
  const invalidationCallbacks = useRef(new Set());

  // Registrar uma função de invalidação
  const registerInvalidation = (callback) => {
    invalidationCallbacks.current.add(callback);
    
    // Retornar função de cleanup
    return () => {
      invalidationCallbacks.current.delete(callback);
    };
  };

  // Invalidar todos os caches registrados
  const invalidateAllCaches = () => {
    invalidationCallbacks.current.forEach(callback => {
      try {
        callback();
      } catch (err) {
        console.warn('Erro ao invalidar cache:', err);
      }
    });
  };

  return (
    <DropdownCacheContext.Provider value={{
      registerInvalidation,
      invalidateAllCaches
    }}>
      {children}
    </DropdownCacheContext.Provider>
  );
}

// Hook personalizado para usar o contexto
export function useDropdownCache() {
  const context = useContext(DropdownCacheContext);
  if (!context) {
    throw new Error('useDropdownCache deve ser usado dentro de um DropdownCacheProvider');
  }
  return context;
} 
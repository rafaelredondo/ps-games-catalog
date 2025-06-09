import { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

// Função para carregar configurações do localStorage
const loadSettingsFromStorage = () => {
  try {
    const savedSettings = localStorage.getItem('ps-games-settings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      return parsed;
    }
  } catch (error) {
    console.error('Erro ao carregar configurações:', error);
  }
  return {};
};

export function SettingsProvider({ children }) {
  // Inicializar com configurações do localStorage imediatamente
  const [settings, setSettings] = useState(() => {
    const defaultSettings = {
      infiniteScrollEnabled: true,
      itemsPerPage: 20,
      theme: 'dark'
    };
    
    const savedSettings = loadSettingsFromStorage();
    return { ...defaultSettings, ...savedSettings };
  });

  // Salvar configurações no localStorage sempre que mudarem
  useEffect(() => {
    localStorage.setItem('ps-games-settings', JSON.stringify(settings));
  }, [settings]);

  // Função para atualizar uma configuração específica
  const updateSetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Função para resetar todas as configurações
  const resetSettings = () => {
    const defaultSettings = {
      infiniteScrollEnabled: true,
      itemsPerPage: 20,
      theme: 'dark'
    };
    setSettings(defaultSettings);
    localStorage.setItem('ps-games-settings', JSON.stringify(defaultSettings));
  };

  const value = {
    settings,
    updateSetting,
    resetSettings
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

// Hook personalizado para usar o contexto
export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings deve ser usado dentro de um SettingsProvider');
  }
  return context;
} 
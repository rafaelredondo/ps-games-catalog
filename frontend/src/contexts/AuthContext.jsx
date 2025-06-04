import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Verificar se já existe credencial salva
  useEffect(() => {
    const savedCredentials = localStorage.getItem('ps-games-auth');
    if (savedCredentials) {
      const { username, password } = JSON.parse(savedCredentials);
      setApiCredentials(username, password);
      verifyAuth(username, password);
    } else {
      setLoading(false);
    }
  }, []);

  const setApiCredentials = (username, password) => {
    // Configurar credenciais no axios para todas as requisições
    const token = btoa(`${username}:${password}`);
    api.defaults.headers.common['Authorization'] = `Basic ${token}`;
  };

  const verifyAuth = async (username, password) => {
    try {
      setLoading(true);
      setError('');
      
      // Testar credenciais fazendo uma chamada simples à API
      await api.get('/games');
      
      setIsAuthenticated(true);
      
      // Salvar credenciais localmente para próximos acessos
      localStorage.setItem('ps-games-auth', JSON.stringify({ username, password }));
      
    } catch (err) {
      setIsAuthenticated(false);
      if (err.response?.status === 401) {
        setError('Email ou senha incorretos');
      } else {
        setError('Erro de conexão. Tente novamente.');
      }
      localStorage.removeItem('ps-games-auth');
      delete api.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    setApiCredentials(username, password);
    await verifyAuth(username, password);
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('ps-games-auth');
    delete api.defaults.headers.common['Authorization'];
  };

  const value = {
    isAuthenticated,
    loading,
    error,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}; 
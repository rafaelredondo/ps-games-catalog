import React, { createContext, useContext, useState, useCallback } from 'react';
import ToastNotification from '../components/ToastNotification';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    // Fallback gracioso quando context não está disponível
    console.warn('useNotification deve ser usado dentro de NotificationProvider. Usando fallback console.log');
    return {
      notify: {
        success: (message) => console.log('✅ Success:', message),
        error: (message) => console.error('❌ Error:', message),
        warning: (message) => console.warn('⚠️ Warning:', message),
        info: (message) => console.info('ℹ️ Info:', message),
      }
    };
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const timeoutsRef = React.useRef(new Map());

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
    
    // Limpar timeout associado
    if (timeoutsRef.current.has(id)) {
      clearTimeout(timeoutsRef.current.get(id));
      timeoutsRef.current.delete(id);
    }
  }, []);

  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      ...notification,
      open: true
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-remove após timeout se não for erro com retry
    if (notification.severity !== 'error' || !notification.allowRetry) {
      const duration = notification.duration || 6000;
      const timeoutId = setTimeout(() => {
        removeNotification(id);
      }, duration + 500); // 500ms extra para animação de saída
      
      // Armazenar timeout para possível cleanup
      timeoutsRef.current.set(id, timeoutId);
    }

    return id;
  }, [removeNotification]);

  // Cleanup de todos os timeouts quando o componente desmonta
  React.useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(timeoutId => clearTimeout(timeoutId));
      timeoutsRef.current.clear();
    };
  }, []);

  const notify = {
    success: (message, options = {}) => {
      return addNotification({
        message,
        severity: 'success',
        duration: 4000,
        ...options
      });
    },

    error: (message, options = {}) => {
      return addNotification({
        message,
        severity: 'error',
        duration: 8000,
        allowRetry: false,
        ...options
      });
    },

    warning: (message, options = {}) => {
      return addNotification({
        message,
        severity: 'warning',
        duration: 6000,
        ...options
      });
    },

    info: (message, options = {}) => {
      return addNotification({
        message,
        severity: 'info',
        duration: 5000,
        ...options
      });
    },

    // Método avançado para casos especiais
    custom: (options) => {
      return addNotification(options);
    }
  };

  const handleNotificationClose = (id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, open: false }
          : notification
      )
    );
    
    // Remover após um delay para permitir animação
    setTimeout(() => {
      removeNotification(id);
    }, 300);
  };

  const value = {
    notify,
    notifications,
    removeNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      
      {/* Renderizar todas as notificações ativas */}
      {notifications.map((notification) => (
        <ToastNotification
          key={notification.id}
          {...notification}
          onClose={() => handleNotificationClose(notification.id)}
          onRetry={() => {
            if (notification.onRetry) {
              notification.onRetry();
            }
            handleNotificationClose(notification.id);
          }}
        />
      ))}
    </NotificationContext.Provider>
  );
};

export default NotificationContext; 
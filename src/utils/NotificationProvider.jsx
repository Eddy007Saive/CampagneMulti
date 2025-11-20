import React, { useState, useEffect, useRef, useCallback } from "react";
import { getUnreadNotificationsCount } from "@/services/Notification";
import { useAuth } from "@/context/AuthContext"; // 👈 Importer le hook d'authentification

// Context pour partager l'état des notifications dans toute l'app
export const NotificationContext = React.createContext();

export const NotificationProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth(); // 👈 Récupérer l'état d'authentification
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const intervalRef = useRef(null);
  const isDocumentVisible = useRef(true);

  // Fonction pour récupérer le compteur
  const fetchUnreadCount = useCallback(async () => {
    // 👉 Ne rien faire si l'utilisateur n'est pas connecté
    if (!isAuthenticated() || !user) {
      console.log('[fetchUnreadCount] Utilisateur non connecté, skip');
      setUnreadCount(0);
      setIsLoading(false);
      return;
    }

    try {
      const response = await getUnreadNotificationsCount();
      const newCount = response?.data?.count ?? 0;
      setUnreadCount(prev => {
        return prev !== newCount ? newCount : prev;
      });
      setIsLoading(false);
    } catch (error) {
      console.error('[fetchUnreadCount] error:', error);
      setIsLoading(false);
    }
  }, [isAuthenticated, user]); // 👈 Ajouter les dépendances

  // Fonction pour forcer la mise à jour
  const refreshCount = useCallback(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  // Fonction pour marquer comme lu et rafraîchir
  const markAsReadAndRefresh = useCallback(async (markAsReadFunction) => {
    if (!isAuthenticated() || !user) {
      console.log('[markAsReadAndRefresh] Utilisateur non connecté, skip');
      return;
    }

    try {
      await markAsReadFunction();
      setTimeout(() => {
        fetchUnreadCount();
      }, 1000);
    } catch (error) {
      console.error('Erreur lors du marquage comme lu:', error);
    }
  }, [fetchUnreadCount, isAuthenticated, user]);

  // Fonction pour démarrer le polling
  const startPolling = useCallback(() => {
    // 👉 Ne démarrer le polling que si connecté
    if (!isAuthenticated() || !user) {
      console.log('[startPolling] Utilisateur non connecté, skip');
      return;
    }

    stopPolling(); // Arrêter l'ancien interval s'il existe
    
    intervalRef.current = setInterval(() => {
      if (isDocumentVisible.current) {
        fetchUnreadCount();
      }
    }, 15000); // Toutes les 15 secondes
  }, [fetchUnreadCount, isAuthenticated, user]);

  // Fonction pour arrêter le polling
  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // 👉 NOUVEAU : Effet principal qui gère l'abonnement basé sur l'authentification
  useEffect(() => {
    if (!isAuthenticated() || !user) {
      stopPolling();
      setUnreadCount(0);
      setIsLoading(false);
      return;
    }

    fetchUnreadCount(); // Premier chargement
    startPolling(); // Démarrer le polling

    // Cleanup
    return () => {
      stopPolling();
    };
  }, [user, isAuthenticated, fetchUnreadCount, startPolling, stopPolling]);

  // Gestion de la visibilité de la page
  useEffect(() => {
    const handleVisibilityChange = () => {
      isDocumentVisible.current = !document.hidden;
      
      // 👉 Ne faire quelque chose que si connecté
      if (!isAuthenticated() || !user) return;
      
      if (isDocumentVisible.current) {
        fetchUnreadCount();
        startPolling();
      } else {
        stopPolling();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [fetchUnreadCount, startPolling, stopPolling, isAuthenticated, user]);

  // Écouter les événements de focus/blur de la fenêtre
  useEffect(() => {
    const handleFocus = () => {
      if (!isAuthenticated() || !user) return;
      fetchUnreadCount();
      startPolling();
    };

    const handleBlur = () => {
      stopPolling();
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, [fetchUnreadCount, startPolling, stopPolling, isAuthenticated, user]);

  // Écouter les événements personnalisés de notification
  useEffect(() => {
    const onUpdate = (e) => {
      if (!isAuthenticated() || !user) return;
      fetchUnreadCount();
    };

    window.addEventListener('notificationUpdated', onUpdate);
    window.addEventListener('notificationRead', onUpdate);

    return () => {
      window.removeEventListener('notificationUpdated', onUpdate);
      window.removeEventListener('notificationRead', onUpdate);
    };
  }, [fetchUnreadCount, isAuthenticated, user]);

  const value = {
    unreadCount,
    isLoading,
    refreshCount,
    markAsReadAndRefresh
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Hook personnalisé pour utiliser le context
export const useUnreadNotifications = () => {
  const context = React.useContext(NotificationContext);
  if (!context) {
    throw new Error('useUnreadNotifications doit être utilisé dans un NotificationProvider');
  }
  return context;
};

// Hook alternatif avec WebSocket
export const useWebSocketNotifications = (wsUrl) => {
  const { user, isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const wsRef = useRef(null);

  useEffect(() => {
    // 👉 Ne rien faire si non connecté
    if (!isAuthenticated() || !user) {
      setUnreadCount(0);
      setIsLoading(false);
      return;
    }

    // Récupération initiale
    const fetchInitialCount = async () => {
      try {
        const response = await getUnreadNotificationsCount();
        setUnreadCount(response.data.count);
        setIsLoading(false);
      } catch (error) {
        console.error('Erreur lors de la récupération initiale:', error);
        setIsLoading(false);
      }
    };

    fetchInitialCount();

    // WebSocket pour les mises à jour en temps réel
    if (wsUrl) {
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket connecté pour les notifications');
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'notification_count_update') {
            setUnreadCount(data.count);
          }
        } catch (error) {
          console.error('Erreur lors du parsing du message WebSocket:', error);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('Erreur WebSocket:', error);
      };

      wsRef.current.onclose = () => {
        setTimeout(() => {
          if (wsRef.current?.readyState === WebSocket.CLOSED) {
            wsRef.current = new WebSocket(wsUrl);
          }
        }, 5000);
      };
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [wsUrl, isAuthenticated, user]);

  const refreshCount = useCallback(async () => {
    if (!isAuthenticated() || !user) return;
    
    try {
      const response = await getUnreadNotificationsCount();
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Erreur lors du rafraîchissement:', error);
    }
  }, [isAuthenticated, user]);

  return { unreadCount, isLoading, refreshCount };
};

// Hook avec événements personnalisés
export const useNotificationEvents = () => {
  const { user, isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated() || !user) {
      setUnreadCount(0);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await getUnreadNotificationsCount();
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Erreur lors de la récupération:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  const refreshCount = useCallback(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  return { unreadCount, isLoading, refreshCount };
};

// Fonctions utilitaires pour déclencher les événements
export const emitNotificationEvent = (eventType, detail = {}) => {
  const event = new CustomEvent(eventType, { detail });
  window.dispatchEvent(event);
};

// Exemple d'utilisation dans vos fonctions de service
export const markNotificationAsReadWithEvent = async (id, markAsReadFunction) => {
  try {
    await markAsReadFunction(id);
    emitNotificationEvent('notificationRead');
  } catch (error) {
    console.error('Erreur lors du marquage comme lu:', error);
    throw error;
  }
};
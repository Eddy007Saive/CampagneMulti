
import { emitNotificationEvent } from '@/utils/NotificationProvider';
import apiClient from '@/utils/ApiClient';


// Fonction utilitaire pour déclencher les événements
const triggerNotificationUpdate = () => {
  console.log("Notification updated - triggering event");
  emitNotificationEvent('notificationUpdated');
};

// ==================== CRUD de base ====================

/**
 * Créer une nouvelle notification
 * @param {Object} notificationData - Données de la notification
 * @returns {Promise<Object>}
 */
export const createNotification = async (notificationData) => {
  try {
    const response = await apiClient.post('/', notificationData);
    triggerNotificationUpdate();
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la création de la notification:', error);
    throw error;
  }
};

/**
 * Créer plusieurs notifications en batch
 * @param {Array<Object>} notifications - Tableau de notifications
 * @returns {Promise<Object>}
 */
export const createMultipleNotifications = async (notifications) => {
  try {
    const response = await apiClient.post('/batch', { notifications });
    triggerNotificationUpdate();
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la création multiple:', error);
    throw error;
  }
};

/**
 * Récupérer toutes les notifications avec pagination et filtres
 * @param {Object} params - Paramètres de recherche
 * @returns {Promise<Object>}
 */
export const getNotifications = async (params = {}) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      statusFilter = '',
      workflowFilter = '',
      readFilter = '',
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = params;

    const response = await apiClient.get('/', {
      params: {
        page,
        limit,
        search,
        statusFilter,
        workflowFilter,
        readFilter,
        sortBy,
        sortOrder
      }
    });

    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des notifications:', error);
    throw error;
  }
};

/**
 * Récupérer les notifications de l'utilisateur connecté
 * @param {Object} params - Paramètres de recherche
 * @returns {Promise<Object>}
 */
export const getUserNotifications = async (params = {}) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      statusFilter = '',
      workflowFilter = '',
      readFilter = '',
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = params;

    const response = await apiClient.get('/user', {
      params: {
        page,
        limit,
        search,
        statusFilter,
        workflowFilter,
        readFilter,
        sortBy,
        sortOrder
      }
    });

    return response.data;
    
  } catch (error) {
    console.error('Erreur lors de la récupération des notifications utilisateur:', error);
    throw error;
  }
};

/**
 * Récupérer une notification par ID
 * @param {string} id - ID de la notification
 * @returns {Promise<Object>}
 */
export const getNotificationById = async (id) => {
  try {
    const response = await apiClient.get(`/${id}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération de la notification:', error);
    throw error;
  }
};

/**
 * Mettre à jour une notification
 * @param {string} id - ID de la notification
 * @param {Object} notificationData - Données à mettre à jour
 * @returns {Promise<Object>}
 */
export const updateNotification = async (id, notificationData) => {
  try {
    const response = await apiClient.patch(`/${id}`, notificationData);
    triggerNotificationUpdate();
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la notification:', error);
    throw error;
  }
};

/**
 * Supprimer une notification
 * @param {string} id - ID de la notification
 * @returns {Promise<Object>}
 */
export const deleteNotification = async (id) => {
  try {
    const response = await apiClient.delete(`/${id}`);
    triggerNotificationUpdate();
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la suppression de la notification:', error);
    throw error;
  }
};

// ==================== Gestion des lectures ====================

/**
 * Marquer une notification comme lue
 * @param {string} id - ID de la notification
 * @returns {Promise<Object>}
 */
export const markNotificationAsRead = async (id) => {
  try {
    const response = await apiClient.patch(`/${id}/read`);
    triggerNotificationUpdate();
    return response.data;
  } catch (error) {
    console.error('Erreur lors du marquage comme lu:', error);
    throw error;
  }
};

/**
 * Marquer une notification comme non lue
 * @param {string} id - ID de la notification
 * @returns {Promise<Object>}
 */
export const markNotificationAsUnread = async (id) => {
  try {
    const response = await apiClient.patch(`/${id}/unread`);
    triggerNotificationUpdate();
    return response.data;
  } catch (error) {
    console.error('Erreur lors du marquage comme non lu:', error);
    throw error;
  }
};

/**
 * Marquer plusieurs notifications comme lues
 * @param {Array<string>} ids - IDs des notifications
 * @returns {Promise<Object>}
 */
export const markMultipleNotificationsAsRead = async (ids) => {
  try {
    const response = await apiClient.patch('/batch/read', { ids });
    triggerNotificationUpdate();
    return response.data;
  } catch (error) {
    console.error('Erreur lors du marquage multiple comme lu:', error);
    throw error;
  }
};

/**
 * Marquer plusieurs notifications comme non lues
 * @param {Array<string>} ids - IDs des notifications
 * @returns {Promise<Object>}
 */
export const markMultipleNotificationsAsUnread = async (ids) => {
  try {
    const response = await apiClient.patch('/batch/unread', { ids });
    triggerNotificationUpdate();
    return response.data;
  } catch (error) {
    console.error('Erreur lors du marquage multiple comme non lu:', error);
    throw error;
  }
};

/**
 * Marquer toutes les notifications comme lues
 * @returns {Promise<Object>}
 */
export const markAllNotificationsAsRead = async () => {
  try {
    const response = await apiClient.patch('/all/read');
    triggerNotificationUpdate();
    return response.data;
  } catch (error) {
    console.error('Erreur lors du marquage global comme lu:', error);
    throw error;
  }
};

// ==================== Suppression multiple ====================

/**
 * Supprimer plusieurs notifications
 * @param {Array<string>} ids - IDs des notifications
 * @returns {Promise<Object>}
 */
export const deleteMultipleNotifications = async (ids) => {
  try {
    const response = await apiClient.delete('/batch', { data: { ids } });
    triggerNotificationUpdate();
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la suppression multiple:', error);
    throw error;
  }
};

// ==================== Compteurs ====================

/**
 * Obtenir le nombre de notifications non lues (global)
 * @param {string} userId - ID utilisateur (optionnel)
 * @returns {Promise<Object>}
 */
export const getUnreadNotificationsCount = async (userId = null) => {
  try {
    const params = userId ? { userId } : {};
    const response = await apiClient.get('/unread/count', { params });
    return response.data;
  } catch (error) {
    console.error('Erreur lors du comptage des notifications non lues:', error);
    throw error;
  }
};

/**
 * Obtenir le nombre de notifications non lues pour l'utilisateur connecté
 * @returns {Promise<Object>}
 */
export const getUserUnreadNotificationsCount = async () => {
  try {
    const response = await apiClient.get('/user/unread/count');
    return response.data;
  } catch (error) {
    console.error('Erreur lors du comptage des notifications non lues utilisateur:', error);
    throw error;
  }
};

// ==================== Statistiques ====================

/**
 * Obtenir les statistiques des notifications
 * @param {string} userId - ID utilisateur (optionnel)
 * @returns {Promise<Object>}
 */
export const getNotificationsStats = async (userId = null) => {
  try {
    const params = userId ? { userId } : {};
    const response = await apiClient.get('/stats', { params });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    throw error;
  }
};

/**
 * Obtenir les statistiques des notifications de l'utilisateur connecté
 * @returns {Promise<Object>}
 */
export const getUserNotificationsStats = async () => {
  try {
    const response = await apiClient.get('/user/stats');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques utilisateur:', error);
    throw error;
  }
};

// ==================== Utilitaires ====================

/**
 * Nettoyer les anciennes notifications
 * @param {number} daysOld - Nombre de jours (défaut: 30)
 * @returns {Promise<Object>}
 */
export const cleanOldNotifications = async (daysOld = 30) => {
  try {
    const response = await apiClient.delete('/clean', {
      params: { daysOld }
    });
    triggerNotificationUpdate();
    return response.data;
  } catch (error) {
    console.error('Erreur lors du nettoyage des anciennes notifications:', error);
    throw error;
  }
};

/**
 * Rechercher des notifications
 * @param {Object} criteria - Critères de recherche
 * @returns {Promise<Object>}
 */
export const searchNotifications = async (criteria) => {
  try {
    const response = await apiClient.post('/search', criteria);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la recherche de notifications:', error);
    throw error;
  }
};

// ==================== Helpers ====================

/**
 * Fonction utilitaire pour mapper les noms de champs
 * @param {string} fieldName - Nom du champ
 * @returns {string}
 */
export const mapNotificationFieldName = (fieldName) => {
  const fieldMapping = {
    'id': 'ID',
    'workfow': 'workfow',
    'status': 'status',
    'message': 'message',
    'data': 'data',
    'created_at': 'created_at',
    'read': 'Read'
  };
  
  return fieldMapping[fieldName] || fieldName;
};

/**
 * Formatter le temps écoulé depuis la création
 * @param {string} createdAt - Date de création
 * @returns {string}
 */
export const getNotificationAge = (createdAt) => {
  if (!createdAt) return 'Date inconnue';
  
  const notificationDate = new Date(createdAt);
  const now = new Date();
  const diffInMs = now - notificationDate;
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) return 'À l\'instant';
  if (diffInMinutes < 60) return `Il y a ${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''}`;
  if (diffInHours < 24) return `Il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;
  if (diffInDays < 7) return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
  
  return notificationDate.toLocaleDateString('fr-FR');
};

/**
 * Obtenir l'icône selon le statut
 * @param {string} status - Statut de la notification
 * @returns {string}
 */
export const getNotificationIcon = (status) => {
  const icons = {
    success: '✓',
    warning: '⚠',
    error: '✕',
    info: 'ℹ'
  };
  
  return icons[status] || icons.info;
};

/**
 * Obtenir la couleur selon le statut
 * @param {string} status - Statut de la notification
 * @returns {string}
 */
export const getNotificationColor = (status) => {
  const colors = {
    success: 'green',
    warning: 'orange',
    error: 'red',
    info: 'blue'
  };
  
  return colors[status] || colors.info;
};

// Export par défaut
export default {
  createNotification,
  createMultipleNotifications,
  getNotifications,
  getUserNotifications,
  getNotificationById,
  updateNotification,
  deleteNotification,
  markNotificationAsRead,
  markNotificationAsUnread,
  markMultipleNotificationsAsRead,
  markMultipleNotificationsAsUnread,
  markAllNotificationsAsRead,
  deleteMultipleNotifications,
  getUnreadNotificationsCount,
  getUserUnreadNotificationsCount,
  getNotificationsStats,
  getUserNotificationsStats,
  cleanOldNotifications,
  searchNotifications,
  mapNotificationFieldName,
  getNotificationAge,
  getNotificationIcon,
  getNotificationColor
};
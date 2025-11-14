import apiClient from "@/utils/ApiClient";

/**
 * Créer une nouvelle campagne
 * @param {Object} campagneData - Données de la campagne
 * @returns {Promise}
 */
export const createCampagne = async (campagneData) => {
  try {
    const response = await apiClient.post('/campagne', campagneData);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la création de la campagne:', error);
    throw error;
  }
};

export const getCampagnes = async (params = {}) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      sortBy = 'id',
      sortOrder = 'asc',
    } = params;

    const queryParams = new URLSearchParams({
      page,
      limit,
      sortBy,
      sortOrder,
      ...(search && { search }),
    });

    const response = await apiClient.get(`/campagne/user`, {
      params: queryParams,
    });
    

    // ✅ Ton backend renvoie : success + result.data + pagination
    const result = response.data.result;

    return {
      data: {
        campagnes: result?.data || [],
        totalItems: result?.pagination?.totalRecords || 0,
        totalPages: result?.pagination?.totalPages || 1,
        currentPage: result?.pagination?.currentPage || 1
      }
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des campagnes:', error);
    throw error;
  }
};


/**
 * Récupérer une campagne par ID
 * @param {string} id - ID de la campagne
 * @returns {Promise}
 */
export const getCampagneById = async (id) => {
  try {
    const response = await apiClient.get(`/campagne/${id}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération de la campagne:', error);
    throw error;
  }
};

/**
 * Mettre à jour une campagne
 * @param {string} id - ID de la campagne
 * @param {Object} campagneData - Données à mettre à jour
 * @returns {Promise}
 */
export const updateCampagne = async (id, campagneData) => {
  try {
    const response = await apiClient.patch(`/campagne/${id}`, campagneData);
    console.log(response);
        
    return response;
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la campagne:', error);
    throw error;
  }
};

/**
 * Supprimer une campagne
 * @param {string} id - ID de la campagne
 * @returns {Promise}
 */
export const deleteCampagne = async (id) => {
  try {
    const response = await apiClient.delete(`/campagnes/${id}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la suppression de la campagne:', error);
    throw error;
  }
};

/**
 * Lancer une campagne via webhook
 * @param {string} id - ID de la campagne
 * @returns {Promise}
 */
export const lancerCampagne = async (id) => {
  let campdata={"Statut":"Actif"}
  try {
    const response = await apiClient.patch(`/campagne/${id}`,campdata);
    console.log(response);
    return response.data;
  } catch (error) {
    console.error('Erreur lors du lancement de la campagne:', error);
    throw error;
  }
};

/**
 * Récupérer toutes les campagnes (sans pagination)
 * @returns {Promise}
 */
export const getAllCampagnes = async () => {
  try {
    const response = await apiClient.get('/campagne/user', {
      params: { limit: 10000 }
    });
    return {
      data: response.data.result.data || []
    };
  } catch (error) {
    console.error('Erreur lors de la récupération de toutes les campagnes:', error);
    throw error;
  }
};

/**
 * Mettre à jour le statut d'une campagne
 * @param {string} id - ID de la campagne
 * @param {string} statut - Nouveau statut
 * @returns {Promise}
 */
export const updateCampagneStatus = async (id, statut) => {
  try {
    const response = await apiClient.patch(`/campagne/${id}`, {
      statut: statut
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error);
    throw error;
  }
};

/**
 * Mettre à jour le statut d'enrichissement d'une campagne
 * @param {string} id - ID de la campagne
 * @param {string} statut - Nouveau statut d'enrichissement
 * @returns {Promise}
 */
export const updateCampagneEnrichissement = async (id, statut) => {
  try {
    const response = await apiClient.patch(`/campagne/${id}`, {
      enrichissement: statut
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut d\'enrichissement:', error);
    throw error;
  }
};

/**
 * Supprimer tous les contacts liés à une campagne
 * @param {string} campagneId - ID de la campagne
 * @returns {Promise}
 */
export const deleteContactsByCampagne = async (campagneId) => {
  try {
    // Cette fonctionnalité devrait être implémentée côté backend
    // Pour l'instant, on peut créer un endpoint dédié
    const response = await apiClient.delete(`/campagne/${campagneId}/contacts`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la suppression des contacts:', error);
    throw error;
  }
};

/**
 * Supprimer une campagne avec tous ses contacts
 * @param {string} id - ID de la campagne
 * @returns {Promise}
 */
export const deleteCampagneWithContacts = async (id) => {
  try {
    // Cette fonctionnalité devrait être implémentée côté backend
    // Pour l'instant, on supprime juste la campagne
    const response = await apiClient.delete(`/campagne/${id}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la suppression complète:', error);
    throw error;
  }
};

/**
 * Rechercher des campagnes
 * @param {Object} criteria - Critères de recherche
 * @returns {Promise}
 */
export const searchCampagnes = async (criteria) => {
  try {
    const response = await apiClient.post('/campagne/search', criteria);
    
    return {
      data: {
        campagnes: response.data.data || [],
        totalItems: response.data.pagination?.totalRecords || 0,
        totalPages: response.data.pagination?.totalPages || 1,
        currentPage: response.data.pagination?.currentPage || 1
      }
    };
  } catch (error) {
    console.error('Erreur lors de la recherche de campagnes:', error);
    throw error;
  }
};

/**
 * Obtenir les statistiques des campagnes
 * @returns {Promise}
 */
export const getCampagneStats = async () => {
  try {
    const response = await apiClient.get('/campagne/stats');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    throw error;
  }
};

export default {
  createCampagne,
  getCampagnes,
  getCampagneById,
  updateCampagne,
  deleteCampagne,
  lancerCampagne,
  getAllCampagnes,
  updateCampagneStatus,
  updateCampagneEnrichissement,
  deleteContactsByCampagne,
  deleteCampagneWithContacts,
  searchCampagnes,
  getCampagneStats,
};
import apiClient from "@/utils/ApiClient";

const API_URL = "/configuration";

/**
 * =========================
 * CONFIGURATION
 * =========================
 */

/**
 * Récupérer la configuration de l'utilisateur courant
 */
export const getConfiguration = async () => {
  try {
    const res = await apiClient.get(API_URL);
    return res.data;
  } catch (error) {
    handleError(error, "Erreur lors de la récupération de la configuration");
  }
};

/**
 * Créer une nouvelle configuration
 */
export const createConfiguration = async (data) => {
  try {
    const res = await apiClient.post(API_URL, data);
    return res.data;
  } catch (error) {
    handleError(error, "Erreur lors de la création de la configuration");
  }
};

/**
 * Mettre à jour ou créer une configuration (upsert)
 */
export const upsertConfiguration = async (data) => {
  try {
    const res = await apiClient.put(API_URL, data);
    return res.data;
  } catch (error) {
    handleError(error, "Erreur lors de la mise à jour ou création de la configuration");
  }
};

/**
 * Mettre à jour partiellement une configuration
 */
export const updateConfiguration = async (id, data) => {
  try {
    const res = await apiClient.patch(`${API_URL}/${id}`, data);
    return res.data;
  } catch (error) {
    handleError(error, "Erreur lors de la mise à jour de la configuration");
  }
};

/**
 * Supprimer une configuration
 */
export const deleteConfiguration = async (id) => {
  try {
    const res = await apiClient.delete(`${API_URL}/${id}`);
    return res.data;
  } catch (error) {
    handleError(error, "Erreur lors de la suppression de la configuration");
  }
};

/**
 * Valider la configuration
 */
export const validateConfiguration = async () => {
  try {
    const res = await apiClient.get(`${API_URL}/validate`);
    return res.data;
  } catch (error) {
    handleError(error, "Erreur lors de la validation de la configuration");
  }
};

/**
 * Activer une configuration
 */
export const activateConfiguration = async (id) => {
  try {
    const res = await apiClient.post(`${API_URL}/${id}/activate`);
    return res.data;
  } catch (error) {
    handleError(error, "Erreur lors de l'activation de la configuration");
  }
};

/**
 * Désactiver une configuration
 */
export const deactivateConfiguration = async (id) => {
  try {
    const res = await apiClient.post(`${API_URL}/${id}/deactivate`);
    return res.data;
  } catch (error) {
    handleError(error, "Erreur lors de la désactivation de la configuration");
  }
};

/**
 * Obtenir le statut de validation détaillé
 */
export const getValidationStatus = async (id) => {
  try {
    const res = await apiClient.get(`${API_URL}/${id}/validation-status`);
    return res.data;
  } catch (error) {
    handleError(error, "Erreur lors de la récupération du statut de validation");
  }
};

/**
 * =========================
 * QUOTA
 * =========================
 */

/**
 * Récupérer le quota
 */
export const getQuota = async () => {
  try {
    const res = await apiClient.get(`${API_URL}/quota`);
    return res.data;
  } catch (error) {
    handleError(error, "Erreur lors de la récupération du quota");
  }
};

/**
 * Créer un quota
 */
export const createQuota = async (data) => {
  try {
    const res = await apiClient.post(`${API_URL}/quota`, data);
    return res.data;
  } catch (error) {
    handleError(error, "Erreur lors de la création du quota");
  }
};

/**
 * Mettre à jour le quota
 */
export const updateQuota = async (data) => {
  try {
    const res = await apiClient.patch(`${API_URL}/quota`, data);
    return res.data;
  } catch (error) {
    handleError(error, "Erreur lors de la mise à jour du quota");
  }
};

/**
 * Décrémenter le quota
 */
export const decrementQuota = async (amount = 1) => {
  try {
    const res = await apiClient.post(`${API_URL}/quota/decrement`, { amount });
    return res.data;
  } catch (error) {
    handleError(error, "Erreur lors de la décrémentation du quota");
  }
};

/**
 * Réinitialiser le quota
 */
export const resetQuota = async (newQuota = 50) => {
  try {
    const res = await apiClient.post(`${API_URL}/quota/reset`, { newQuota });
    return res.data;
  } catch (error) {
    handleError(error, "Erreur lors de la réinitialisation du quota");
  }
};

/**
 * =========================
 * UTILITAIRES
 * =========================
 */

/**
 * Vérifier si l'utilisateur peut lancer une campagne
 */
export const canLaunchCampaign = async () => {
  try {
    const res = await apiClient.get(`${API_URL}/can-launch-campaign`);
    return res.data;
  } catch (error) {
    handleError(error, "Erreur lors de la vérification du droit de lancement de campagne");
  }
};

/**
 * Récupérer le statut complet du système
 */
export const getSystemStatus = async () => {
  try {
    const res = await apiClient.get(`${API_URL}/system-status`);
    console.log(res);
    
    return res.data.data;
  } catch (error) {
    handleError(error, "Erreur lors de la récupération du statut du système");
  }
};

/**
 * Gestion d’erreur centralisée
 */
function handleError(error, defaultMessage) {
  console.error(defaultMessage, error);
  const message =
    error.response?.data?.error ||
    error.response?.data?.message ||
    defaultMessage;
  throw new Error(message);
}

export default {
  getConfiguration,
  createConfiguration,
  upsertConfiguration,
  updateConfiguration,
  deleteConfiguration,
  validateConfiguration,
  activateConfiguration,
  deactivateConfiguration,
  getValidationStatus,
  getQuota,
  createQuota,
  updateQuota,
  decrementQuota,
  resetQuota,
  canLaunchCampaign,
  getSystemStatus,
};

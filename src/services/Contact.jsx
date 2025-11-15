import apiClient from "@/utils/ApiClient";


const CONTACTS_ENDPOINT = '/contact';


// Créer un nouveau contact
export const createContact = async (contactData) => {
  try {
    const response = await apiClient.post(CONTACTS_ENDPOINT, contactData);
    return {
      success: true,
      message: 'Contact créé avec succès',
      data: response.data
    };
  } catch (error) {
    console.error('Erreur lors de la création du contact:', error);
    throw {
      response: {
        data: {
          errors: error.response?.data?.error || error.response?.data?.message || 'Erreur lors de la création du contact'
        }
      }
    };
  }
};

// Récupérer tous les contacts avec pagination et filtres
export const getContacts = async (params = {}) => {
  try {
    // Nettoyer les paramètres vides
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, value]) => value !== '' && value !== null && value !== undefined)
    );

    const response = await apiClient.get(`${CONTACTS_ENDPOINT}/user`, {
      params: cleanParams
    });

    console.log(response);
    return response.data.result;
  } catch (error) {
    console.error('Erreur lors de la récupération des contacts:', error);
    throw error;
  }
};

// Récupérer un contact par ID
export const getContactById = async (id) => {
  try {
    const response = await apiClient.get(`${CONTACTS_ENDPOINT}/${id}`);
    return {
      data: response.data
    };
  } catch (error) {
    console.error('Erreur lors de la récupération du contact:', error);
    throw error;
  }
};

// Mettre à jour un contact
export const updateContact = async (id, contactData) => {
  try {
    const response = await apiClient.put(`${CONTACTS_ENDPOINT}/${id}`, contactData);
    return {
      success: true,
      message: 'Contact mis à jour avec succès',
      data: response.data
    };
  } catch (error) {
    console.error('Erreur lors de la mise à jour du contact:', error);
    throw {
      response: {
        data: {
          errors: error.response?.data?.error || error.response?.data?.message || 'Erreur lors de la mise à jour du contact'
        }
      }
    };
  }
};

// Supprimer un contact
export const deleteContact = async (id) => {
  try {
    await apiClient.delete(`${CONTACTS_ENDPOINT}/${id}`);
    return {
      success: true,
      message: 'Contact supprimé avec succès'
    };
  } catch (error) {
    console.error('Erreur lors de la suppression du contact:', error);
    throw {
      response: {
        data: {
          errors: error.response?.data?.error || error.response?.data?.message || 'Erreur lors de la suppression du contact'
        }
      }
    };
  }
};

// Mettre à jour le statut d'un contact
export const updateContactStatus = async (id, statut) => {
  try {
    const response = await apiClient.patch(`${CONTACTS_ENDPOINT}/${id}/status`, { statut });
    return {
      success: true,
      message: 'Statut du contact mis à jour avec succès',
      data: response.data
    };
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error);
    throw {
      response: {
        data: {
          errors: error.response?.data?.error || error.response?.data?.message || 'Erreur lors de la mise à jour du statut'
        }
      }
    };
  }
};

// Mettre à jour le statut de profil d'un contact
export const updateContactProfile = async (id, profil) => {
  try {
    const response = await apiClient.patch(`${CONTACTS_ENDPOINT}/${id}/profile`, { profil });
    return {
      success: true,
      message: 'Profil du contact mis à jour avec succès',
      data: response.data
    };
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    throw {
      response: {
        data: {
          errors: error.response?.data?.error || error.response?.data?.message || 'Erreur lors de la mise à jour du profil'
        }
      }
    };
  }
};

// Tri et retri automatique des profils
export const autoSortProfiles = async (campaignId, criteria = 'auto') => {
  try {
    const response = await apiClient.post(`${CONTACTS_ENDPOINT}/campaigns/${campaignId}/auto-sort`, {
      criteria
    });
    return {
      success: true,
      message: 'Tri automatique des profils lancé avec succès',
      data: response.data
    };
  } catch (error) {
    console.error('Erreur lors du tri automatique des profils:', error);
    throw error;
  }
};

// Fonction pour faire le tri manuel des profils
export const manualSortProfiles = async (campaignId) => {
  try {
    const response = await apiClient.post(`${CONTACTS_ENDPOINT}/campaigns/${campaignId}/manual-sort`);
    return {
      success: true,
      message: 'Retri des profils lancé avec succès',
      data: response.data
    };
  } catch (error) {
    console.error('Erreur lors du retri des profils:', error);
    throw error;
  }
};

// Récupérer tous les contacts avec les noms des campagnes
export const getContactsWithCampagneNames = async (params = {}) => {
  try {
    const response = await apiClient.get(`${CONTACTS_ENDPOINT}/with-campaign-names`, { params });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des contacts avec noms de campagnes:', error);
    throw error;
  }
};

// Récupérer les contacts par campagne
export const getContactsByCampagne = async (campagneId, userId = null) => {
  try {
    const params = userId ? { userId } : {};
    const response = await apiClient.get(`${CONTACTS_ENDPOINT}/campaigns/${campagneId}`, { params });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des contacts par campagne:', error);
    throw error;
  }
};

export const exportContactsSansReponseCSV = async (campagneId) => {
  try {
    const response = await apiClient.post(`${CONTACTS_ENDPOINT}/export/sans-reponse`, {
      id: campagneId
    }, {
      responseType: 'text', // Important pour recevoir le texte brut
    });

    // Le CSV est directement dans response.data
    return response.data;
  } catch (error) {
    console.error('Erreur exportContactsSansReponseCSV:', error);
    throw error;
  }
};

// Récupérer les statistiques des contacts
export const getContactsStats = async (userId = null) => {
  try {
    const params = userId ? { userId } : {};
    const response = await apiClient.get(`${CONTACTS_ENDPOINT}/stats`, { params });
    console.log(response);
    return response.data.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    throw error;
  }
};

// Fonction utilitaire pour récupérer tous les contacts (sans pagination)
export const getAllContacts = async (params = {}) => {
  try {
    const response = await apiClient.get(`${CONTACTS_ENDPOINT}/user`, { params });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération de tous les contacts:', error);
    throw error;
  }
};

// Fonction pour créer plusieurs contacts en une fois (batch)
export const createMultipleContacts = async (contactsData) => {
  try {
    const response = await apiClient.post(`${CONTACTS_ENDPOINT}/batch`, { contacts: contactsData });
    return {
      success: true,
      message: `${response.data.count || contactsData.length} contacts créés avec succès`,
      data: response.data
    };
  } catch (error) {
    console.error('Erreur lors de la création multiple de contacts:', error);
    throw {
      response: {
        data: {
          errors: error.response?.data?.error || error.response?.data?.message || 'Erreur lors de la création multiple de contacts'
        }
      }
    };
  }
};

// Récupérer tous les contacts d'une campagne spécifique
export const getContactsByCampaignId = async (campaignId, params = {}) => {
  try {
    const response = await apiClient.get(`${CONTACTS_ENDPOINT}/campaigns/${campaignId}/details`, { params });
    console.log(response);
    
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des contacts par campagne:', error);
    throw error;
  }
};

// Exporter les contacts au format CSV
export const exportContactsToCSV = async (params = {}) => {
  try {
    const response = await apiClient.get(`${CONTACTS_ENDPOINT}/export/csv`, {
      params,
      responseType: 'blob'
    });

    // Créer un lien de téléchargement
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `contacts_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();

    return {
      success: true,
      message: 'Export CSV réussi'
    };
  } catch (error) {
    console.error('Erreur lors de l\'export CSV:', error);
    throw error;
  }
};

// Importer des contacts depuis un fichier CSV
export const importContactsFromCSV = async (file, campaignId = null) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    if (campaignId) {
      formData.append('campaignId', campaignId);
    }

    const response = await apiClient.post(`${CONTACTS_ENDPOINT}/import/csv`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return {
      success: true,
      message: `${response.data.count} contacts importés avec succès`,
      data: response.data
    };
  } catch (error) {
    console.error('Erreur lors de l\'import CSV:', error);
    throw {
      response: {
        data: {
          errors: error.response?.data?.error || error.response?.data?.message || 'Erreur lors de l\'import CSV'
        }
      }
    };
  }
};

// Recherche avancée de contacts
export const searchContacts = async (searchQuery, filters = {}) => {
  try {
    const response = await apiClient.post(`${CONTACTS_ENDPOINT}/search`, {
      query: searchQuery,
      filters
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la recherche de contacts:', error);
    throw error;
  }
};

// Mettre à jour plusieurs contacts en masse
export const bulkUpdateContacts = async (contactIds, updateData) => {
  try {
    const response = await apiClient.patch(`${CONTACTS_ENDPOINT}/bulk-update`, {
      ids: contactIds,
      data: updateData
    });
    return {
      success: true,
      message: `${response.data.count} contacts mis à jour avec succès`,
      data: response.data
    };
  } catch (error) {
    console.error('Erreur lors de la mise à jour en masse:', error);
    throw {
      response: {
        data: {
          errors: error.response?.data?.error || error.response?.data?.message || 'Erreur lors de la mise à jour en masse'
        }
      }
    };
  }
};

// Supprimer plusieurs contacts en masse
export const bulkDeleteContacts = async (contactIds) => {
  try {
    const response = await apiClient.post(`${CONTACTS_ENDPOINT}/bulk-delete`, {
      ids: contactIds
    });
    return {
      success: true,
      message: `${response.data.count} contacts supprimés avec succès`,
      data: response.data
    };
  } catch (error) {
    console.error('Erreur lors de la suppression en masse:', error);
    throw {
      response: {
        data: {
          errors: error.response?.data?.error || error.response?.data?.message || 'Erreur lors de la suppression en masse'
        }
      }
    };
  }
};
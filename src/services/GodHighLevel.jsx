import apiClient from "@/utils/ApiClient";


const GHL_ENDPOINT = '/ghl';


// Créer un nouveau contact
export const testConnextion = async (apikey) => {
  try {
    const response = await apiClient.post(GHL_ENDPOINT, {apikey});
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

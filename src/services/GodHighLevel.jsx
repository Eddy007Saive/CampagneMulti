import apiClient from "@/utils/ApiClient";


const CONTACTS_ENDPOINT = '/ghl';


// Créer un nouveau contact
export const testConnection = async (data) => {
  try {
    const response = await apiClient.post(`${CONTACTS_ENDPOINT}/test`, data);
    
    return response.data
  } catch (error) {
    throw {
      response: {
        data: {
          errors: error.response?.data?.error || error.response?.data?.message || 'Erreur lors de la création du contact'
        }
      }
    };
  }
};


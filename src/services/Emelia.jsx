import apiClient from "@/utils/ApiClient";


const CONTACTS_ENDPOINT = '/coldMail';


// Créer un nouveau contact
export const testConnection = async (apikey) => {
  try {
    const response = await apiClient.post(`${CONTACTS_ENDPOINT}/test`, {apikey:apikey});
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


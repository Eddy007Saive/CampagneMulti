const EMELIA_API_URL = 'https://api.emelia.io';

export const emeliaService = {
  // Tester la connexion avec l'API key
  async testConnection(apiKey) {
    try {
      const response = await fetch(`${EMELIA_API_URL}/emails/campaigns`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': apiKey
        }
      });

      if (!response.ok) {
        throw new Error('Connexion échouée');
      }

      return { success: true };
    } catch (error) {
      console.error('Erreur test connexion Emelia:', error);
      return { success: false, error: error.message };
    }
  },

  // Récupérer la liste des campagnes
  async getCampaigns(apiKey) {
    try {
      const response = await fetch(`${EMELIA_API_URL}/emails/campaigns`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return { 
        success: true, 
        campaigns: data // Adapter selon la structure de réponse Emelia
      };
    } catch (error) {
      console.error('Erreur récupération campagnes Emelia:', error);
      return { 
        success: false, 
        error: error.message,
        campaigns: []
      };
    }
  }
};
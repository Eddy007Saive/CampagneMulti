import axios from 'axios';

// Configuration Airtable
const AIRTABLE_BASE_ID = import.meta.env.VITE_APP_AIRTABLE_BASE_ID || 'your_base_id';
const AIRTABLE_CONFIG_TABLE = 'configuration_cookies';
const AIRTABLE_QUOTA_TABLE = 'Quota par jours';
const AIRTABLE_API_KEY = import.meta.env.VITE_APP_AIRTABLE_API_KEY || 'your_api_key';

const airtableClient = axios.create({
  baseURL: `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}`,
  headers: {
    'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
    'Content-Type': 'application/json',
  },
});

// Récupérer la configuration de l'utilisateur connecté
export const getConfiguration = async (userId) => {
  console.log(userId);
  
  try {
    const params = {
      pageSize: 100
    };

    if (userId) {
      params.filterByFormula = `SEARCH("${userId.ID}", ARRAYJOIN({user_id}))`;
    }

    const response = await airtableClient.get(`/${AIRTABLE_CONFIG_TABLE}`, {
      params
    });

    console.log(response);
    
    // Ne plus créer de configuration par défaut ici
    if (response.data.records.length === 0) {
      return {
        success: false,
        message: 'Aucune configuration trouvée',
        data: null
      };
    }

    const record = response.data.records[0];
    return {
      success: true,
      data: {
        id: record.id,
        nom: record.fields['Nom'] || '',
        valeur: record.fields['Valeur'] || '',
        email: record.fields['Email'] || '',
        derniereMiseAJour: record.fields['Dernière mise à jour'] || '',
        status: record.fields['Status'] || 'Inactif',
        userAgent: record.fields['User_agent'] || '',
        user: record.fields['Users'] || []
      }
    };
  } catch (error) {
    console.error('Erreur lors de la récupération de la configuration:', error);
    throw error;
  }
};

// Créer une nouvelle configuration
const createConfiguration = async (configData, userId) => {
  try {
    const newConfig = {
      'Nom': configData.nom || 'LinkedIn Cookies',
      'Valeur': configData.valeur || configData.liAt || '',
      'Email': configData.email || '',
      'Status': configData.status || 'Actif',
      'User_agent': configData.userAgent || '',
      'Users': [userId]
    };

    console.log('Création nouvelle configuration:', newConfig);

    const response = await airtableClient.post(`/${AIRTABLE_CONFIG_TABLE}`, {
      fields: newConfig
    });

    return {
      success: true,
      message: 'Configuration créée avec succès',
      data: {
        id: response.data.id,
        nom: newConfig['Nom'],
        valeur: newConfig['Valeur'],
        email: newConfig['Email'],
        status: newConfig['Status'],
        userAgent: newConfig['User_agent'],
      }
    };
  } catch (error) {
    console.error('Erreur lors de la création de la configuration:', error);
    throw error;
  }
};

// Mettre à jour ou créer la configuration
export const updateConfiguration = async (configData) => {
  try {
    console.log('Configuration data reçue:', configData);
    
    // Récupérer la configuration existante
    const currentConfig = await getConfiguration(configData.userId);
    
    // Si aucune configuration n'existe, on la crée
    if (!currentConfig.success || !currentConfig.data) {
      console.log('Aucune configuration existante, création de la configuration et du quota...');
      
      // Créer la configuration
      const configResult = await createConfiguration(configData, configData.userId);
      
      // Créer également le quota par défaut
      try {
        const quotaResult = await getQuota(configData.userId);
        if (!quotaResult.success || !quotaResult.data) {
          await createQuota(configData.userId, 50);
          console.log('Quota créé avec succès');
        }
      } catch (error) {
        console.error('Erreur lors de la création du quota:', error);
        // On continue même si le quota échoue
      }
      
      return configResult;
    }

    // Sinon on met à jour la configuration existante
    const updateData = {
      'Nom': configData.nom || 'LinkedIn Cookies',
      'Valeur': configData.valeur || configData.liAt || '', 
      'Email': configData.email || '',
      'Status': configData.status || 'Actif',
      'User_agent': configData.userAgent || '',
    };

    // Garder le lien utilisateur
    if (configData.userId) {
      updateData['Users'] = [configData.userId];
    }

    console.log('Mise à jour configuration:', updateData);

    const response = await airtableClient.patch(`/${AIRTABLE_CONFIG_TABLE}/${currentConfig.data.id}`, {
      fields: updateData
    });

    return {
      success: true,
      message: 'Configuration mise à jour avec succès',
      data: {
        id: response.data.id,
        nom: updateData['Nom'],
        valeur: updateData['Valeur'],
        email: updateData['Email'],
        status: updateData['Status'],
        userAgent: updateData['User_agent'],
      }
    };
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la configuration:', error);
    throw {
      response: {
        data: {
          errors: error.response?.data?.error?.message || 'Erreur lors de la mise à jour de la configuration'
        }
      }
    };
  }
};

// Valider la configuration d'un utilisateur
export const validateConfiguration = async (userId) => {
  try {
    const config = await getConfiguration(userId);
    
    if (!config.success || !config.data) {
      return {
        success: false,
        valid: false,
        message: 'Configuration non trouvée'
      };
    }

    const { valeur, email, status, userAgent } = config.data;
    
    // Validation du cookie li_at
    const isValidCookie = valeur && valeur.length > 50 && valeur.startsWith('AQEDA');
    
    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValidEmail = email && emailRegex.test(email);
    
    // Validation du User-Agent
    const isValidUserAgent = userAgent && userAgent.length > 50 && userAgent.includes('Mozilla');
    
    const isActive = status === 'Actif';

    const isFullyValid = isValidCookie && isValidEmail && isActive;

    return {
      success: true,
      valid: isFullyValid,
      message: isFullyValid 
        ? 'Configuration complète et valide' 
        : getValidationMessage(isValidCookie, isValidEmail, isActive),
      details: {
        cookieValid: isValidCookie,
        emailValid: isValidEmail,
        userAgentValid: isValidUserAgent,
        statusActive: isActive,
        cookieLength: valeur ? valeur.length : 0,
        email: email || ''
      }
    };
  } catch (error) {
    console.error('Erreur lors de la validation de la configuration:', error);
    return {
      success: false,
      valid: false,
      message: 'Erreur lors de la validation'
    };
  }
};

// Fonction helper pour générer le message de validation
const getValidationMessage = (isValidCookie, isValidEmail, isActive) => {
  const issues = [];
  
  if (!isValidCookie) issues.push('Cookie invalide ou manquant');
  if (!isValidEmail) issues.push('Email invalide ou manquant');
  if (!isActive) issues.push('Configuration inactive');
  
  return issues.join(', ');
};

// ========== GESTION QUOTAS (par utilisateur) ==========

// Récupérer le quota d'un utilisateur
export const getQuota = async (user) => {
  try {
    const params = {
      pageSize: 100
    };

    if (user) {
      params.filterByFormula = `FIND("${user.ID}",ARRAYJOIN({user_id}))`;
    }

    const response = await airtableClient.get(`/${AIRTABLE_QUOTA_TABLE}`, {
      params
    });

    // Ne plus créer de quota par défaut ici
    if (response.data.records.length === 0) {
      return {
        success: false,
        message: 'Aucun quota trouvé',
        data: null
      };
    }

    const record = response.data.records[0];
    return {
      success: true,
      data: {
        id: record.id,
        quotaRestant: record.fields['Quota restant'] || 0,
        derniereMiseAJour: record.fields['Dernière mise à jour'] || '',
        idCampagneActive: record.fields['ID Campagne active'] || '',
        user: record.fields['User'] || []
      }
    };
  } catch (error) {
    console.error('Erreur lors de la récupération du quota:', error);
    throw error;
  }
};

// Créer un quota pour un utilisateur
const createQuota = async (userId, quotaRestant = 50) => {
  try {
    const newQuota = {
      'Quota restant': quotaRestant,
      'ID Campagne active': '',
      'Users': [userId]
    };

    console.log('Création nouveau quota:', newQuota);

    const response = await airtableClient.post(`/${AIRTABLE_QUOTA_TABLE}`, {
      fields: newQuota
    });

    return {
      success: true,
      data: {
        id: response.data.id,
        quotaRestant: newQuota['Quota restant'],
        derniereMiseAJour: '',
        idCampagneActive: newQuota['ID Campagne active'],
        user: newQuota['Users']
      }
    };
  } catch (error) {
    console.error('Erreur lors de la création du quota:', error);
    throw error;
  }
};

// Mettre à jour ou créer le quota d'un utilisateur
export const updateQuota = async (userId, quotaData) => {
  try {
    const currentQuota = await getQuota(userId);
    
    // Si aucun quota n'existe, on le crée
    if (!currentQuota.success || !currentQuota.data) {
      console.log('Aucun quota existant, création...');
      return await createQuota(userId, quotaData.quotaRestant || 50);
    }

    // Sinon on met à jour le quota existant
    const updateData = {
      'Quota restant': quotaData.quotaRestant || 0,
      'Dernière mise à jour': new Date().toLocaleDateString('fr-FR'),
      'ID Campagne active': quotaData.idCampagneActive || '',
      'Users': [userId]
    };

    const response = await airtableClient.patch(`/${AIRTABLE_QUOTA_TABLE}/${currentQuota.data.id}`, {
      fields: updateData
    });

    return {
      success: true,
      message: 'Quota mis à jour avec succès',
      data: {
        id: response.data.id,
        quotaRestant: updateData['Quota restant'],
        derniereMiseAJour: updateData['Dernière mise à jour'],
        idCampagneActive: updateData['ID Campagne active']
      }
    };
  } catch (error) {
    console.error('Erreur lors de la mise à jour du quota:', error);
    throw {
      response: {
        data: {
          errors: error.response?.data?.error?.message || 'Erreur lors de la mise à jour du quota'
        }
      }
    };
  }
};

// Décrémenter le quota d'un utilisateur
export const decrementQuota = async (userId, amount = 1) => {
  try {
    const currentQuota = await getQuota(userId);
    
    // Si pas de quota, créer un quota à 50 puis décrémenter
    if (!currentQuota.success || !currentQuota.data) {
      const newQuota = await createQuota(userId, 50);
      const decremented = Math.max(0, 50 - amount);
      return await updateQuota(userId, {
        quotaRestant: decremented,
        idCampagneActive: ''
      });
    }

    const newQuota = Math.max(0, currentQuota.data.quotaRestant - amount);
    
    return await updateQuota(userId, {
      quotaRestant: newQuota,
      idCampagneActive: currentQuota.data.idCampagneActive
    });
  } catch (error) {
    console.error('Erreur lors de la décrémentation du quota:', error);
    throw error;
  }
};

// Réinitialiser le quota quotidien d'un utilisateur
export const resetDailyQuota = async (userId, newQuota = 50) => {
  try {
    return await updateQuota(userId, {
      quotaRestant: newQuota,
      idCampagneActive: ''
    });
  } catch (error) {
    console.error('Erreur lors de la réinitialisation du quota:', error);
    throw error;
  }
};

// ========== FONCTIONS UTILITAIRES ==========

// Vérifier si un utilisateur peut lancer une campagne
export const canLaunchCampaign = async (userId) => {
  try {
    const [quotaResult, configResult] = await Promise.all([
      getQuota(userId),
      validateConfiguration(userId)
    ]);

    const hasQuota = quotaResult.success && quotaResult.data && quotaResult.data.quotaRestant > 0;
    const hasValidConfig = configResult.success && configResult.valid;

    return {
      success: true,
      canLaunch: hasQuota && hasValidConfig,
      reasons: {
        quota: hasQuota ? 'OK' : 'Quota épuisé ou non configuré',
        configuration: hasValidConfig ? 'OK' : configResult.message
      },
      quotaRestant: (quotaResult.success && quotaResult.data) ? quotaResult.data.quotaRestant : 0
    };
  } catch (error) {
    console.error('Erreur lors de la vérification des prérequis:', error);
    return {
      success: false,
      canLaunch: false,
      reasons: {
        error: 'Erreur lors de la vérification'
      }
    };
  }
};

// Obtenir le statut complet du système pour un utilisateur
export const getSystemStatus = async (userId) => {
  try {
    const [quotaResult, configResult, validationResult] = await Promise.all([
      getQuota(userId),
      getConfiguration(userId),
      validateConfiguration(userId)
    ]);

    const hasQuota = quotaResult.success && quotaResult.data && quotaResult.data.quotaRestant > 0;
    const hasConfig = configResult.success && configResult.data;

    return {
      success: true,
      data: {
        quota: (quotaResult.success && quotaResult.data) ? quotaResult.data : null,
        configuration: (configResult.success && configResult.data) ? configResult.data : null,
        validation: validationResult,
        systemReady: validationResult.valid && hasQuota
      }
    };
  } catch (error) {
    console.error('Erreur lors de la récupération du statut système:', error);
    throw error;
  }
};
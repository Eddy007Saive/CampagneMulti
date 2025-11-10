import axios from 'axios';

// Configuration Airtable
const AIRTABLE_BASE_ID = import.meta.env.VITE_APP_AIRTABLE_BASE_ID || 'your_base_id';
const AIRTABLE_TABLE_NAME = import.meta.env.VITE_APP_AIRTABLE_TABLE_NAME || 'Campagnes';
const AIRTABLE_API_KEY = import.meta.env.VITE_APP_AIRTABLE_API_KEY || 'your_api_key';

const airtableClient = axios.create({
  baseURL: `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}`,
  headers: {
    'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
    'Content-Type': 'application/json',
  },
});

// Créer une nouvelle campagne
export const createCampagne = async (campagneData) => {
  console.log("Creating campagne with data:", campagneData);
  
  try {
    const response = await airtableClient.post(`/${AIRTABLE_TABLE_NAME}`, {
      fields: campagneData
    });

    return {
      success: true,
      message: 'Campagne créée avec succès',
      data: response.data
    };
  } catch (error) {
    console.error('Erreur lors de la création de la campagne:', error);
    throw {
      response: {
        data: {
          errors: error.response?.data?.error?.message || 'Erreur lors de la création de la campagne'
        }
      }
    };
  }
};

// Récupérer toutes les campagnes avec pagination et filtres
export const getCampagnes = async (params = {}) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      sortBy = 'ID',
      sortOrder = 'ASC',
      userId = null
    } = params;

    let airtableParams = {
      maxRecords: limit,
      pageSize: limit,
    };

    // Tri
    if (sortBy) {
      const direction = sortOrder === 'DESC' ? 'desc' : 'asc';
      airtableParams.sort = [{ field: mapFieldName(sortBy), direction }];
    }

    // Construction du filtre
    let filterFormulas = [];

    // Filtre par user_id (OBLIGATOIRE)
    if (userId?.ID) {
      filterFormulas.push(`SEARCH("${userId.ID}", ARRAYJOIN({user_id}))`);
    }

    // Recherche/Filtrage
    if (search) {
      filterFormulas.push(`OR(
        SEARCH(LOWER("${search}"), LOWER({Nom de la campagne})),
        SEARCH(LOWER("${search}"), LOWER({Poste recherché})),
        SEARCH(LOWER("${search}"), LOWER({Zone géographique})),
        SEARCH(LOWER("${search}"), LOWER({Langues parlées})),
        SEARCH(LOWER("${search}"), LOWER({Secteurs souhaités}))
      )`);
    }

    // Combiner les filtres avec AND
    if (filterFormulas.length > 0) {
      airtableParams.filterByFormula = filterFormulas.length === 1 
        ? filterFormulas[0] 
        : `AND(${filterFormulas.join(', ')})`;
    }

    const response = await airtableClient.get(`/${AIRTABLE_TABLE_NAME}`, {
      params: airtableParams
    });

    // Transformer les données pour correspondre au format attendu
    const transformedRecords = response.data.records.map(record => ({
      id: record.id,
      nom: record.fields['Nom de la campagne'] || '',
      poste: record.fields['Poste recherché'] || '',
      zone: record.fields['Zone géographique'] || '',
      seniorite: record.fields['Seniorite'] || '',
      tailleEntreprise: record.fields['Taille_entreprise'] || '',
      langues: record.fields['Langues parlées'] || '',
      secteurs: record.fields['Secteurs souhaités'] || '',
      dateCreation: record.fields['Date de création'] || '',
      contacts: record.fields['Contacts'] || '',
      statut: record.fields['Statut'] || 'Actif',
      lancerCampagne: record.fields['Lancer Campagne'] || '',
      Template_message: record.fields['Template_message'] || '',
      enrichissement: record.fields["Statut d'enrichissement"] || 'En attente',
      jours_enrichissement: record.fields["Jours_enrichissement"] || '',
      profileParJours: record.fields["Profils/jour"] || 0,
      messageParJours: record.fields["Messages/jour"] || 0,
      InstructionRelance4Jours: record.fields['InstructionRelance4Jours'] || '',
      InstructionRelance7Jours: record.fields['InstructionRelance7Jours'] || '',
      InstructionRelance14Jours: record.fields['InstructionRelance14Jours'] || '',
    }));

    // Simulation de pagination (Airtable gère différemment)
    const totalItems = transformedRecords.length;
    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: {
        campagnes: transformedRecords,
        totalItems,
        totalPages,
        currentPage: page
      }
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des campagnes:', error);
    throw error;
  }
};

// Récupérer une campagne par ID
export const getCampagneById = async (id, userId = null) => {
  try {
    const response = await airtableClient.get(`/${AIRTABLE_TABLE_NAME}/${id}`);
    
    const record = response.data;
    
    // Vérifier que la campagne appartient à l'utilisateur
    if (userId?.ID) {
      const userIds = record.fields['user_id'] || [];
      const hasAccess = userIds.some(uid => uid === userId.ID);
      
      if (!hasAccess) {
        throw new Error('Accès non autorisé à cette campagne');
      }
    }
    
    return {
      data: {
        id: record.id,
        nom: record.fields['Nom de la campagne'] || '',
        poste: record.fields['Poste recherché'] || '',
        zone: record.fields['Zone géographique'] || '',
        seniorite: record.fields['Seniorite'] || '',
        tailleEntreprise: record.fields['Taille_entreprise'] || '',
        langues: record.fields['Langues parlées'] || '',
        secteurs: record.fields['Secteurs souhaités'] || '',
        dateCreation: record.fields['Date de création'] || '',
        contacts: record.fields['Contacts'] || '',
        statut: record.fields['Statut'] || 'Actif',
        lancerCampagne: record.fields['Lancer Campagne'] || '',
        Template_message: record.fields['Template_message'] || '',
        enrichissement: record.fields["Statut d'enrichissement"] || 'En attente',
        jours_enrichissement: record.fields["Jours_enrichissement"] || '',
        profileParJours: record.fields["Profils/jour"] || 0,
        messageParJours: record.fields["Messages/jour"] || 0,
        InstructionRelance4Jours: record.fields['InstructionRelance4Jours'] || '',
        InstructionRelance7Jours: record.fields['InstructionRelance7Jours'] || '',
        InstructionRelance14Jours: record.fields['InstructionRelance14Jours'] || '',
      }
    };
  } catch (error) {
    console.error('Erreur lors de la récupération de la campagne:', error);
    throw error;
  }
};

// Mettre à jour une campagne
export const updateCampagne = async (id, campagneData, userId = null) => {
  try {
    // Vérifier d'abord que l'utilisateur a accès à cette campagne
    if (userId?.ID) {
      await getCampagneById(id, userId);
    }
    
    const response = await airtableClient.patch(`/${AIRTABLE_TABLE_NAME}/${id}`, {
      fields: campagneData
    });

    return {
      success: true,
      message: 'Campagne mise à jour avec succès',
      data: response.data
    };
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la campagne:', error);
    throw {
      response: {
        data: {
          errors: error.response?.data?.error?.message || 'Erreur lors de la mise à jour de la campagne'
        }
      }
    };
  }
};

// Supprimer une campagne
export const deleteCampagne = async (id, userId = null) => {
  try {
    // Vérifier d'abord que l'utilisateur a accès à cette campagne
    if (userId?.ID) {
      await getCampagneById(id, userId);
    }
    
    await airtableClient.delete(`/${AIRTABLE_TABLE_NAME}/${id}`);
    
    return {
      success: true,
      message: 'Campagne supprimée avec succès'
    };
  } catch (error) {
    console.error('Erreur lors de la suppression de la campagne:', error);
    throw {
      response: {
        data: {
          errors: error.response?.data?.error?.message || 'Erreur lors de la suppression de la campagne'
        }
      }
    };
  }
};


export const lancerCampagne = async (id, userId = null) => {
  try {
    const campagne = await getCampagneById(id, userId);
    const webhookUrl = campagne.data.lancerCampagne.url;

    if (!webhookUrl) {
      throw new Error('URL de webhook non trouvée pour cette campagne');
    }

    console.log(webhookUrl)

    const response = await axios.post(webhookUrl)
    
  
  } catch (error) {
    console.error('Erreur lors du lancement de la campagne:', error);
    
    if (error.response) {
      throw {
        response: {
          data: {
            errors: `Erreur ${error.response.status}: ${error.response.data || 'Erreur du webhook'}`,
            webhookError: error.response.data
          }
        }
      };
    } else if (error.request) {
      throw {
        response: {
          data: {
            errors: 'Webhook inaccessible - vérifiez l\'URL et la connexion'
          }
        }
      };
    } else {
      throw {
        response: {
          data: {
            errors: error.message || 'Erreur lors du lancement de la campagne'
          }
        }
      };
    }
  }
};

const mapFieldName = (fieldName) => {
  const fieldMapping = {
    'id': 'ID',
    'nom': 'Nom de la campagne',
    'poste': 'Poste recherché',
    'zone': 'Zone géographique',
    'seniorite': 'Seniorite',
    'tailleEntreprise': 'Taille_entreprise',
    'langues': 'Langues parlées',
    'secteurs': 'Secteurs souhaités',
    'statut': 'Statut'
  };
  
  return fieldMapping[fieldName] || fieldName;
};

export const getAllCampagnes = async (userId = null) => {
  try {
    let allRecords = [];
    let offset = '';

    do {
      const params = {
        pageSize: 100, // Maximum pour Airtable
        ...(offset && { offset })
      };

      // Ajouter le filtre user_id si fourni
      if (userId?.ID) {
        params.filterByFormula = `SEARCH("${userId.ID}", ARRAYJOIN({user_id}))`;
      }

      const response = await airtableClient.get(`/${AIRTABLE_TABLE_NAME}`, { params });
      
      allRecords = [...allRecords, ...response.data.records];
      offset = response.data.offset;
    } while (offset);

    const transformedRecords = allRecords.map(record => ({
      id: record.id,
      nom: record.fields['Nom de la campagne'] || '',
      poste: record.fields['Poste recherché'] || '',
      zone: record.fields['Zone géographique'] || '',
      seniorite: record.fields['Seniorite'] || '',
      tailleEntreprise: record.fields['Taille_entreprise'] || '',
      langues: record.fields['Langues parlées'] || '',
      secteurs: record.fields['Secteurs souhaités'] || '',
      dateCreation: record.fields['Date de création'] || '',
      contacts: record.fields['Contacts'] || '',
      statut: record.fields['Statut'] || 'Actif',
      lancerCampagne: record.fields['Lancer Campagne'] || '',
      jours_enrichissement: record.fields["Jours_enrichissement"] || '',
    }));

    return {
      data: transformedRecords
    };
  } catch (error) {
    console.error('Erreur lors de la récupération de toutes les campagnes:', error);
    throw error;
  }
};

export const updateCampganeStatus = async (ID_CONTACT, statut, userId = null) => {
  try {
    // Vérifier d'abord que l'utilisateur a accès à cette campagne
    if (userId?.ID) {
      await getCampagneById(ID_CONTACT, userId);
    }
    
    const response = await airtableClient.patch(`/${AIRTABLE_TABLE_NAME}/${ID_CONTACT}`, {
      fields: {
        'Statut': statut
      }
    });

    return {
      success: true,
      message: 'Statut du campagne mis à jour avec succès',
      data: response.data
    };
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error);
    throw {
      response: {
        data: {
          errors: error.response?.data?.error?.message || 'Erreur lors de la mise à jour du statut'
        }
      }
    };
  }
};

export const updateCampganeEnrichissement = async (ID_CONTACT, statut, userId = null) => {
  try {
    // Vérifier d'abord que l'utilisateur a accès à cette campagne
    if (userId?.ID) {
      await getCampagneById(ID_CONTACT, userId);
    }
    
    const response = await airtableClient.patch(`/${AIRTABLE_TABLE_NAME}/${ID_CONTACT}`, {
      fields: {
        'Statut d\'enrichissement': statut
      }
    });

    return {
      success: true,
      message: 'Statut du campagne mis à jour avec succès',
      data: response.data
    };
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error);
    throw {
      response: {
        data: {
          errors: error.response?.data?.error?.message || 'Erreur lors de la mise à jour du statut'
        }
      }
    };
  }
};


// Supprimer tous les contacts liés à une campagne
export const deleteContactsByCampagne = async (campagneId, userId = null) => {
  try {
    // Vérifier d'abord que l'utilisateur a accès à cette campagne
    if (userId?.ID) {
      await getCampagneById(campagneId, userId);
    }
    
    // Configuration pour la table des contacts
    const CONTACTS_TABLE_NAME = import.meta.env.VITE_APP_AIRTABLE_CONTACTS_TABLE_NAME || 'Contacts';
    
    let allContactsToDelete = [];
    let offset = '';

    // Récupérer tous les contacts liés à cette campagne
    do {
      const params = {
        pageSize: 100,
        filterByFormula: `{Campagne} = "${campagneId}"`, // Ajustez le nom du champ selon votre structure
        ...(offset && { offset })
      };

      const response = await airtableClient.get(`/${CONTACTS_TABLE_NAME}`, { params });
      
      // Collecter les IDs des contacts à supprimer
      const contactIds = response.data.records.map(record => record.id);
      allContactsToDelete = [...allContactsToDelete, ...contactIds];
      
      offset = response.data.offset;
    } while (offset);

    if (allContactsToDelete.length === 0) {
      return {
        success: true,
        message: 'Aucun contact trouvé pour cette campagne',
        deletedCount: 0
      };
    }

    // Supprimer les contacts par batch (max 10 par requête selon l'API Airtable)
    const batchSize = 10;
    let deletedCount = 0;

    for (let i = 0; i < allContactsToDelete.length; i += batchSize) {
      const batch = allContactsToDelete.slice(i, i + batchSize);
      
      try {
        await airtableClient.delete(`/${CONTACTS_TABLE_NAME}`, {
          params: {
            records: batch
          }
        });
        
        deletedCount += batch.length;
      } catch (batchError) {
        console.error(`Erreur lors de la suppression du batch ${i / batchSize + 1}:`, batchError);
        // Continuer avec les autres batches même si un échoue
      }
    }

    return {
      success: true,
      message: `${deletedCount} contacts supprimés avec succès`,
      deletedCount
    };

  } catch (error) {
    console.error('Erreur lors de la suppression des contacts:', error);
    throw {
      response: {
        data: {
          errors: error.response?.data?.error?.message || 'Erreur lors de la suppression des contacts'
        }
      }
    };
  }
};

export const deleteCampagneWithContacts = async (id, userId = null) => {
  try {
    // D'abord supprimer tous les contacts liés
    const contactsResult = await deleteContactsByCampagne(id, userId);
    
    // Puis supprimer la campagne elle-même
    const campagneResult = await deleteCampagne(id, userId);

    return {
      success: true,
      message: `Campagne supprimée avec succès. ${contactsResult.deletedCount} contacts associés ont également été supprimés`,
      contactsDeleted: contactsResult.deletedCount
    };

  } catch (error) {
    console.error('Erreur lors de la suppression complète:', error);
    throw {
      response: {
        data: {
          errors: error.response?.data?.error?.message || 'Erreur lors de la suppression complète'
        }
      }
    };
  }
};
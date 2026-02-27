// services/LinkedIn.js

/**
 * Teste la validité du cookie LinkedIn li_at
 * NOTE: Cette fonction est limitée côté front-end à cause de CORS.
 * Pour un test complet, utilisez un proxy backend.
 * 
 * @param {string} liAtCookie - Le cookie li_at à tester
 * @param {string} userAgent - Le User-Agent du navigateur
 * @returns {Promise<{success: boolean, message: string, data?: object}>}
 */
export const testLinkedInConnection = async (liAtCookie, userAgent) => {
  try {
    // Validation basique côté client
    if (!liAtCookie || liAtCookie.trim().length < 100) {
      return {
        success: false,
        message: 'Cookie trop court ou invalide'
      };
    }

    if (liAtCookie.includes(' ')) {
      return {
        success: false,
        message: 'Cookie mal formaté (contient des espaces)'
      };
    }

    // OPTION 1: Test via fetch (probablement bloqué par CORS)
    try {
      const response = await fetch('https://www.linkedin.com/voyager/api/me', {
        method: 'GET',
        mode: 'cors', // Sera probablement bloqué
        credentials: 'include',
        headers: {
          'Accept': 'application/vnd.linkedin.normalized+json+2.1',
          'x-li-lang': 'en_US',
          'x-restli-protocol-version': '2.0.0'
        }
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          message: 'Cookie LinkedIn validé avec succès !',
          data: {
            profileId: data?.miniProfile?.publicIdentifier || null,
            entityUrn: data?.miniProfile?.entityUrn || null
          }
        };
      } else if (response.status === 401) {
        return {
          success: false,
          message: 'Cookie invalide ou expiré (401 Unauthorized)'
        };
      } else if (response.status === 403) {
        return {
          success: false,
          message: 'Accès refusé - Possible détection anti-bot (403 Forbidden)'
        };
      } else {
        return {
          success: false,
          message: `Erreur ${response.status}: ${response.statusText}`
        };
      }
    } catch (corsError) {
      // Si CORS bloque, on fait une validation de format approfondie
      console.warn('CORS bloqué (normal dans le navigateur):', corsError.message);
      
      // Validation approfondie du format
      const formatValidation = validateCookieFormat(liAtCookie);
      
      if (!formatValidation.valid) {
        return formatValidation;
      }

      // Si le format est bon, on assume que c'est probablement valide
      // mais on prévient qu'on ne peut pas tester réellement
      return {
        success: true,
        message: '⚠️ Format du cookie valide (test réel impossible en front-end - CORS)',
        warning: true,
        note: 'Le cookie semble valide mais ne peut pas être testé directement dans le navigateur. Configurez un backend pour une validation complète.'
      };
    }
  } catch (error) {
    console.error('Erreur test LinkedIn:', error);
    return {
      success: false,
      message: 'Erreur de connexion: ' + error.message
    };
  }
};

/**
 * Méthode alternative plus simple : test via redirection
 * Vérifie si le cookie permet d'accéder au feed LinkedIn
 */
export const simpleLinkedInTest = async (liAtCookie, userAgent) => {
  try {
    const response = await fetch('https://www.linkedin.com/feed/', {
      method: 'GET',
      headers: {
        'Cookie': `li_at=${liAtCookie.trim()}`,
        'User-Agent': userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      redirect: 'manual' // Important pour détecter les redirections
    });

    // Si redirigé vers login page = cookie invalide
    if (response.status === 302 || response.status === 301) {
      const location = response.headers.get('location');
      if (location && location.includes('/login')) {
        return {
          success: false,
          message: 'Cookie expiré ou invalide (redirection vers login)'
        };
      }
    }

    // Si 200 = probablement valide
    if (response.status === 200) {
      return {
        success: true,
        message: 'Cookie vérifié avec succès'
      };
    }

    return {
      success: false,
      message: `Status inattendu: ${response.status}`
    };
  } catch (error) {
    console.error('Erreur test LinkedIn simple:', error);
    return {
      success: false,
      message: 'Erreur de connexion: ' + error.message
    };
  }
};

/**
 * Validation du format du cookie côté client (avant test serveur)
 * @param {string} liAtCookie - Le cookie à valider
 * @returns {{valid: boolean, message: string}}
 */
export const validateCookieFormat = (liAtCookie) => {
  if (!liAtCookie || typeof liAtCookie !== 'string') {
    return { valid: false, message: 'Cookie manquant' };
  }

  const cleanValue = liAtCookie.trim();

  // Vérifier la longueur minimale
  if (cleanValue.length < 100) {
    return { valid: false, message: 'Cookie trop court (minimum 100 caractères)' };
  }

  // Vérifier qu'il ne contient pas d'espaces
  if (cleanValue.includes(' ')) {
    return { valid: false, message: 'Cookie mal formaté (contient des espaces)' };
  }

  // Vérifier les caractères alphanumériques de base
  if (!/^[A-Za-z0-9_-]+$/.test(cleanValue)) {
    return { valid: false, message: 'Cookie contient des caractères invalides' };
  }

  return {
    valid: true,
    message: 'Format du cookie valide - Test de connexion recommandé'
  };
};
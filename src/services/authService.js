
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class AuthService {
  constructor() {
    this.tokenKey = 'accessToken';
    this.refreshTokenKey = 'refreshToken';
    this.userKey = 'user';
  }

  // Méthode utilitaire pour les requêtes API
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = this.getToken();

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Une erreur est survenue');
      }

      return data;
    } catch (error) {
      console.error('Erreur API:', error);
      throw error;
    }
  }

  // Connexion
  async login(credentials) {
    try {
      const response = await this.request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      if (response.success) {
        const { user, accessToken, refreshToken } = response.data;
        console.log(response.data);
        
        
        // Stocker les tokens et les infos utilisateur
        this.setToken(accessToken);
        this.setRefreshToken(refreshToken);
        this.setUser(user);

        return { success: true, user };
      }

      throw new Error(response.message || 'Connexion échouée');
    } catch (error) {
      console.error('Erreur de connexion:', error);
      throw error;
    }
  }

  // Inscription
  async register(userData) {
    try {
      const response = await this.request('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });

      if (response.success) {
        const { user, accessToken, refreshToken } = response.data;
        
        // Stocker les tokens et les infos utilisateur
        this.setToken(accessToken);
        this.setRefreshToken(refreshToken);
        this.setUser(user);

        return { success: true, user };
      }

      throw new Error(response.message || 'Inscription échouée');
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      throw error;
    }
  }

  // Déconnexion
  async logout() {
    try {
      await this.request('/api/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      // Toujours nettoyer les données locales
      this.clearAuth();
    }
  }

  // Rafraîchir le token
  async refreshToken() {
    try {
      const refreshToken = this.getRefreshToken();
      
      if (!refreshToken) {
        throw new Error('Pas de refresh token disponible');
      }

      const response = await this.request('/api/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      });

      if (response.success) {
        const { user, accessToken, refreshToken: newRefreshToken } = response.data;
        
        this.setToken(accessToken);
        this.setRefreshToken(newRefreshToken);
        this.setUser(user);

        return { success: true, accessToken };
      }

      throw new Error('Échec du rafraîchissement du token');
    } catch (error) {
      console.error('Erreur de rafraîchissement du token:', error);
      this.clearAuth();
      throw error;
    }
  }

  // Obtenir les informations de l'utilisateur actuel
  async getCurrentUser() {
    try {
      const response = await this.request('/api/auth/me', {
        method: 'GET',
      });

      if (response.success) {
        this.setUser(response.data.user);
        return response.data.user;
      }

      throw new Error('Impossible de récupérer les informations utilisateur');
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      throw error;
    }
  }

  // Changer le mot de passe
  async changePassword(currentPassword, newPassword) {
    try {
      const response = await this.request('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      return response;
    } catch (error) {
      console.error('Erreur lors du changement de mot de passe:', error);
      throw error;
    }
  }

  // Vérifier l'état de santé de l'API
  async checkHealth() {
    try {
      const response = await this.request('/api/auth/health', {
        method: 'GET',
      });
      return response;
    } catch (error) {
      console.error('Erreur de vérification de santé:', error);
      throw error;
    }
  }

  // Gestion du token
  setToken(token) {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken() {
    return localStorage.getItem(this.tokenKey);
  }

  setRefreshToken(token) {
    localStorage.setItem(this.refreshTokenKey, token);
  }

  getRefreshToken() {
    return localStorage.getItem(this.refreshTokenKey);
  }

  // Gestion de l'utilisateur
  setUser(user) {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  getUser() {
    const user = localStorage.getItem(this.userKey);
    return user ? JSON.parse(user) : null;
  }

  // Vérifier si l'utilisateur est authentifié
  isAuthenticated() {
    return !!this.getToken();
  }

  // Nettoyer toutes les données d'authentification
  clearAuth() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.userKey);
  }

  // Décoder le token JWT (sans vérification de signature)
  decodeToken(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Erreur de décodage du token:', error);
      return null;
    }
  }

  // Vérifier si le token est expiré
  isTokenExpired(token = null) {
    const tokenToCheck = token || this.getToken();
    if (!tokenToCheck) return true;

    const decoded = this.decodeToken(tokenToCheck);
    if (!decoded || !decoded.exp) return true;

    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  }
}

// Exporter une instance unique (singleton)
export const authService = new AuthService();
export default authService;
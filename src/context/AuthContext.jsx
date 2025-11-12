// src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '@/services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialisation - Vérifier si l'utilisateur est déjà connecté
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (authService.isAuthenticated() && !authService.isTokenExpired()) {
          // Récupérer les infos utilisateur depuis le localStorage
          const storedUser = authService.getUser();
          if (storedUser) {
            setUser(storedUser);
          } else {
            // Sinon, les récupérer depuis l'API
            const currentUser = await authService.getCurrentUser();
            setUser(currentUser);
          }
        }
      } catch (error) {
        console.error('Erreur d\'initialisation:', error);
        authService.clearAuth();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Connexion
  const login = async (credentials) => {
    try {
      setError(null);
      setLoading(true);
      
      const result = await authService.login(credentials);
      
      if (result.success) {
        setUser(result.user);
        return { success: true };
      }
      
      throw new Error('Connexion échouée');
    } catch (error) {
      const errorMessage = error.message || 'Erreur lors de la connexion';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // 👉 NOUVEAU : Connexion avec Google
  const loginWithGoogle = async (googleData) => {
    try {
      setError(null);
      setLoading(true);
      
      // Stocker les tokens
      localStorage.setItem('accessToken', googleData.accessToken);
      localStorage.setItem('refreshToken', googleData.refreshToken);
      localStorage.setItem('user', JSON.stringify(googleData.user));
      
      // Mettre à jour le state
      setUser(googleData.user);
      
      return { success: true, user: googleData.user };
    } catch (error) {
      const errorMessage = error.message || 'Erreur lors de la connexion Google';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Inscription
  const register = async (userData) => {
    try {
      setError(null);
      setLoading(true);
      
      const result = await authService.register(userData);
      
      if (result.success) {
        setUser(result.user);
        return { success: true };
      }
      
      throw new Error('Inscription échouée');
    } catch (error) {
      const errorMessage = error.message || 'Erreur lors de l\'inscription';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Déconnexion
  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      setUser(null);
      setError(null);
    }
  };

  // Rafraîchir le token
  const refreshToken = async () => {
    try {
      await authService.refreshToken();
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      return true;
    } catch (error) {
      console.error('Erreur de rafraîchissement:', error);
      logout();
      return false;
    }
  };

  // Changer le mot de passe
  const changePassword = async (currentPassword, newPassword) => {
    try {
      setError(null);
      const result = await authService.changePassword(currentPassword, newPassword);
      return { success: true, message: result.message };
    } catch (error) {
      const errorMessage = error.message || 'Erreur lors du changement de mot de passe';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Vérifier si l'utilisateur est authentifié
  const isAuthenticated = () => {
    return !!user && authService.isAuthenticated() && !authService.isTokenExpired();
  };

  // Mettre à jour les informations utilisateur
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    authService.setUser(updatedUser);
  };

  const value = {
    user,
    loading,
    error,
    login,
    loginWithGoogle, // 👈 AJOUTER ICI
    register,
    logout,
    refreshToken,
    changePassword,
    isAuthenticated,
    updateUser,
    setError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};

export default AuthContext;
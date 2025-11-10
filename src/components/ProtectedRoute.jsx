// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    // Afficher un loader pendant la vérification
    return <div>Chargement...</div>;
  }

  if (!isAuthenticated()) {
    // Rediriger vers la page de connexion si non authentifié
    return <Navigate to="/auth/sign-in" replace />;
  }

  return children;
};
// src/components/PublicRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    // Afficher un loader pendant la vérification
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-bleu-neon border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Chargement...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated()) {
    // Si l'utilisateur est connecté, rediriger vers le dashboard
    return <Navigate to="/dashboard/home" replace />;
  }

  // Si l'utilisateur n'est pas connecté, afficher la page
  return children;
};

export default PublicRoute;
// src/components/RootRedirect.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export const RootRedirect = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-bleu-neon border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300 text-lg">Chargement...</p>
        </div>
      </div>
    );
  }

  // Si connecté -> Dashboard, sinon -> Login
  return (
    <Navigate 
      to={isAuthenticated() ? "/dashboard/home" : "/auth/sign-in"} 
      replace 
    />
  );
};

export default RootRedirect;
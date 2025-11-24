// src/components/RequireConfiguration.jsx
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getConfiguration } from '@/services/Configuration';

/**
 * Composant qui vérifie si l'utilisateur a complété sa configuration
 * et le redirige vers /dashboard/configuration si ce n'est pas le cas
 */
export const useConfigurationCheck = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [hasConfiguration, setHasConfiguration] = useState(false);

  useEffect(() => {
    // Ne pas vérifier si on est déjà sur la page de configuration
    if (location.pathname === '/dashboard/configuration') {
      setIsLoading(false);
      setHasConfiguration(true);
      return;
    }

    const checkConfiguration = async () => {
      try {
        const config = await getConfiguration();
        
        // Logique de vérification : adapter selon tes besoins
        // Exemples de vérifications possibles :
        const isComplete = config.configuration  !== null ;
        
        setHasConfiguration(isComplete);
        
        if (!isComplete) {
          // Utiliser setTimeout pour éviter les bloqueurs de redirection
          setTimeout(() => {
            navigate('/dashboard/configuration', { 
              replace: true,
              state: { from: location.pathname }
            });
          }, 0);
        }
      } catch (error) {
        console.error('Erreur vérification config:', error);
        
        // Si erreur (probablement 404 = pas de config), rediriger
        setHasConfiguration(false);
        setTimeout(() => {
          navigate('/dashboard/configuration', { 
            replace: true,
            state: { from: location.pathname }
          });
        }, 0);
      } finally {
        setIsLoading(false);
      }
    };

    checkConfiguration();
  }, [navigate, location.pathname]);

  // Afficher un loader pendant la vérification
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Vérification de la configuration...</p>
        </div>
      </div>
    );
  }

  // Si pas de config, on attend la redirection
  if (!hasConfiguration) {
    return null;
  }

  return children;
};

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

if (isLoading) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      <div className="flex flex-col items-center gap-6 p-8 rounded-2xl bg-slate-900/50 backdrop-blur-sm shadow-2xl">
        
        {/* Conteneur Logo + Loader */}
        <div className="relative w-24 h-24 mb-4">
          
          {/* Loader multi-rings autour du logo */}
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-cyan-400 animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-blue-500 animate-spin" style={{animationDuration: '1.5s'}}></div>
          <div className="absolute inset-4 rounded-full border-4 border-transparent border-t-purple-500 animate-spin" style={{animationDuration: '2s'}}></div>
          
          {/* Logo SRV centré */}
          <div className="absolute inset-0 flex items-center justify-center">
            <img 
            src="/img/photo_5954299465697445759_x.jpg" 
            alt="SRV" 
            className="w-14 h-14 rounded-full object-cover border-2 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)]" 
          />
          </div>
        </div>

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

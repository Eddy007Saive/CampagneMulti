// src/pages/auth/SignIn.jsx
import { useState, useEffect } from 'react';
import {
  Input,
  Checkbox,
  Button,
  Typography,
  Alert,
} from "@material-tailwind/react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from '@/context/AuthContext';

export function SignIn() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, loginWithGoogle, loading, error: authError } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Vérifier les erreurs dans l'URL (de Google)
  // useEffect(() => {
  //   const errorParam = searchParams.get('error');
  //   if (errorParam) {
  //     const errorMessages = {
  //       'google_auth_failed': 'Échec de l\'authentification Google',
  //       'auth_error': 'Erreur lors de l\'authentification',
  //       'no_user': 'Aucun utilisateur trouvé',
  //       'token_generation_failed': 'Erreur lors de la génération des tokens'
  //     };
  //     setErrors({ submit: errorMessages[errorParam] || 'Une erreur est survenue' });
  //   }
  // }, [searchParams]);

  // Gérer les changements de champs
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Effacer l'erreur du champ modifié
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Valider le formulaire
  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'L\'email est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }

    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Soumettre le formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await login({
        email: formData.email,
        password: formData.password,
      });

      if (result.success) {
        // Rediriger vers le dashboard
        navigate('/dashboard/home');
      } else {
        setErrors({ submit: result.error || 'Connexion échouée' });
      }
    } catch (error) {
      setErrors({ submit: error.message || 'Une erreur est survenue' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Gérer la connexion avec Google
// Gérer la connexion avec Google
  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setErrors({});

    try {
      // Ouvrir une popup pour l'authentification Google
      const width = 500;
      const height = 600;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      const popup = window.open(
        `${import.meta.env.VITE_BASE_URL}/google`,
        'Google Sign In',
        `width=${width},height=${height},left=${left},top=${top}`
      );

      if (!popup) {
        setErrors({ submit: 'Impossible d\'ouvrir la fenêtre de connexion. Veuillez autoriser les popups.' });
        setIsGoogleLoading(false);
        return;
      }

      let isProcessing = false;
      let checkInterval = null;

      // Écouter les messages de la popup
      const handleMessage = async (event) => {
        
           // Vérifier que le message vient du backend OU du frontend
        const backendUrl = import.meta.env.VITE_BASE_URL;
        const backendOrigin = new URL(backendUrl).origin;
        const allowedOrigins = [
          backendOrigin,
          window.location.origin
        ];
        
        console.log('Message reçu depuis:', event.origin);
        console.log('Origines autorisées:', allowedOrigins);
        console.log('Data:', event.data);

        // Accepter les messages du backend OU du frontend
        if (!allowedOrigins.includes(event.origin)) {
          console.warn('Message ignoré - origine non autorisée:', event.origin);
          return;
        }

        isProcessing = true;
        
        // Arrêter la vérification de fermeture
        if (checkInterval) {
          clearInterval(checkInterval);
        }

        const { success, data, error } = event.data;

        if (success && data) {
          try {
            // 👉 Utiliser la méthode loginWithGoogle du contexte
            const result = await loginWithGoogle(data);

            // Nettoyer
            window.removeEventListener('message', handleMessage);
            
            // Fermer la popup après traitement
            setTimeout(() => {
              if (popup && !popup.closed) {
                popup.close();
              }
            }, 100);

            setIsGoogleLoading(false);

            if (result.success) {
              // Rediriger vers le dashboard
              navigate('/dashboard/home');
            } else {
              setErrors({ submit: result.error || 'Erreur lors de la connexion' });
            }
          } catch (err) {
            console.error('Erreur lors du traitement:', err);
            setErrors({ submit: 'Erreur lors de la connexion' });
            window.removeEventListener('message', handleMessage);
            if (popup && !popup.closed) {
              popup.close();
            }
            setIsGoogleLoading(false);
          }
        } else {
          setErrors({ submit: error || 'Échec de l\'authentification Google' });
          window.removeEventListener('message', handleMessage);
          if (popup && !popup.closed) {
            popup.close();
          }
          setIsGoogleLoading(false);
        }
      };

      window.addEventListener('message', handleMessage);

      // Vérifier si la popup a été fermée manuellement
      checkInterval = setInterval(() => {
        if (popup && popup.closed && !isProcessing) {
          clearInterval(checkInterval);
          window.removeEventListener('message', handleMessage);
          setIsGoogleLoading(false);
          setErrors({ submit: 'Connexion annulée' });
        }
      }, 500);

    } catch (error) {
      console.error('Erreur lors de la connexion Google:', error);
      setErrors({ submit: 'Erreur lors de la connexion avec Google' });
      setIsGoogleLoading(false);
    }
  };

  return (
    <section className="m-8 flex gap-4">
      <div className="w-full lg:w-3/5 mt-24">
        <div className="text-center">
          <Typography
            variant="h2"
            className="font-bold mb-4 text-transparent bg-clip-text bg-gradient-primary animate-glow"
          >
            Connexion
          </Typography>
          <Typography
            variant="paragraph"
            className="text-lg font-normal text-gray-300"
          >
            Entrez votre email et mot de passe pour vous connecter.
          </Typography>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 mb-2 mx-auto w-80 max-w-screen-lg lg:w-1/2">
          {/* Afficher les erreurs globales */}
          {(errors.submit || authError) && (
            <Alert color="red" className="mb-4">
              {errors.submit || authError}
            </Alert>
          )}

          <div className="mb-1 flex flex-col gap-6">
            <div>
              <Typography
                variant="small"
                className="-mb-3 font-medium text-bleu-neon"
              >
                Votre email
              </Typography>
              <Input
                type="email"
                name="email"
                size="lg"
                placeholder="nom@mail.com"
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                className="!border-primary-500 focus:!border-bleu-neon bg-bleu-fonce/30 text-blanc-pur placeholder:text-gray-400"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
              />
              {errors.email && (
                <Typography variant="small" color="red" className="mt-1">
                  {errors.email}
                </Typography>
              )}
            </div>

            <div>
              <Typography
                variant="small"
                className="-mb-3 font-medium text-bleu-neon"
              >
                Mot de passe
              </Typography>
              <Input
                type="password"
                name="password"
                size="lg"
                placeholder="********"
                value={formData.password}
                onChange={handleChange}
                error={!!errors.password}
                className="!border-primary-500 focus:!border-bleu-neon bg-bleu-fonce/30 text-blanc-pur placeholder:text-gray-400"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
              />
              {errors.password && (
                <Typography variant="small" color="red" className="mt-1">
                  {errors.password}
                </Typography>
              )}
            </div>
          </div>

          <Checkbox
            name="rememberMe"
            checked={formData.rememberMe}
            onChange={handleChange}
            label={
              <Typography
                variant="small"
                className="flex items-center justify-start font-medium text-gray-300"
              >
                Se souvenir de moi
              </Typography>
            }
            containerProps={{ className: "-ml-2.5 mt-4" }}
            className="border-bleu-neon checked:bg-gradient-primary"
          />

          <Button
            type="submit"
            className="mt-6 bg-gradient-primary hover:shadow-neon-gradient transition-all duration-300"
            fullWidth
            disabled={isSubmitting || loading}
          >
            {isSubmitting || loading ? 'Connexion...' : 'Se connecter'}
          </Button>

          <div className="flex items-center justify-between gap-2 mt-6">
            <Typography
              variant="small"
              className="font-medium text-bleu-neon hover:text-violet-plasma transition-colors"
            >
              <Link to="/auth/forgot-password">
                Mot de passe oublié ?
              </Link>
            </Typography>
          </div>

          <div className="space-y-4 mt-8">
            <Button
              type="button"
              size="lg"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
              className="flex items-center gap-2 justify-center shadow-md bg-bleu-fonce/50 border border-primary-500/30 hover:border-bleu-neon text-blanc-pur hover:shadow-neon-blue transition-all duration-300"
              fullWidth
            >
              <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_1156_824)">
                  <path d="M16.3442 8.18429C16.3442 7.64047 16.3001 7.09371 16.206 6.55872H8.66016V9.63937H12.9813C12.802 10.6329 12.2258 11.5119 11.3822 12.0704V14.0693H13.9602C15.4741 12.6759 16.3442 10.6182 16.3442 8.18429Z" fill="#4285F4" />
                  <path d="M8.65974 16.0006C10.8174 16.0006 12.637 15.2922 13.9627 14.0693L11.3847 12.0704C10.6675 12.5584 9.7415 12.8347 8.66268 12.8347C6.5756 12.8347 4.80598 11.4266 4.17104 9.53357H1.51074V11.5942C2.86882 14.2956 5.63494 16.0006 8.65974 16.0006Z" fill="#34A853" />
                  <path d="M4.16852 9.53356C3.83341 8.53999 3.83341 7.46411 4.16852 6.47054V4.40991H1.51116C0.376489 6.67043 0.376489 9.33367 1.51116 11.5942L4.16852 9.53356Z" fill="#FBBC04" />
                  <path d="M8.65974 3.16644C9.80029 3.1488 10.9026 3.57798 11.7286 4.36578L14.0127 2.08174C12.5664 0.72367 10.6469 -0.0229773 8.65974 0.000539111C5.63494 0.000539111 2.86882 1.70548 1.51074 4.40987L4.1681 6.4705C4.8001 4.57449 6.57266 3.16644 8.65974 3.16644Z" fill="#EA4335" />
                </g>
                <defs>
                  <clipPath id="clip0_1156_824">
                    <rect width="16" height="16" fill="white" transform="translate(0.5)" />
                  </clipPath>
                </defs>
              </svg>
              <span>{isGoogleLoading ? 'Connexion...' : 'Se connecter avec Google'}</span>
            </Button>
          </div>

          <Typography
            variant="paragraph"
            className="text-center font-medium mt-4 text-gray-400"
          >
            Pas encore inscrit ?
            <Link
              to="/auth/sign-up"
              className="text-bleu-neon hover:text-violet-plasma ml-1 transition-colors"
            >
              Créer un compte
            </Link>
          </Typography>
        </form>
      </div>

      <div className="w-2/5 h-full hidden lg:block relative group">
        {/* Effet de lueur derrière l'image */}
        <div className="absolute inset-0 bg-gradient-primary opacity-20 blur-3xl rounded-3xl group-hover:opacity-40 transition-opacity duration-500"></div>

        {/* Bordure animée */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500 p-[3px]">
          <div className="w-full h-full bg-bleu-fonce rounded-3xl"></div>
        </div>

        {/* Image avec effets */}
        <div className="relative h-full overflow-hidden rounded-3xl">
          <img
            src="/img/photo_5954299465697445759_x.jpg"
            className="h-full w-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
            style={{
              filter: 'brightness(0.9) contrast(1.1)',
            }}
          />

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-tr from-bleu-neon/20 via-transparent to-violet-plasma/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

          {/* Effet de scan lumineux */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-bleu-neon to-transparent animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-1 h-full bg-gradient-to-b from-transparent via-violet-plasma to-transparent animate-pulse"></div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SignIn;
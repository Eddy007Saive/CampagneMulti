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
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';

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
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

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

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setErrors({});

    try {
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

      const handleMessage = async (event) => {
        const backendUrl = import.meta.env.VITE_BASE_URL;
        const backendOrigin = new URL(backendUrl).origin;
        const allowedOrigins = [
          backendOrigin,
          window.location.origin
        ];

        if (!allowedOrigins.includes(event.origin)) {
          return;
        }

        isProcessing = true;
        
        if (checkInterval) {
          clearInterval(checkInterval);
        }

        const { success, data, error } = event.data;

        if (success && data) {
          try {
            const result = await loginWithGoogle(data);

            window.removeEventListener('message', handleMessage);
            
            setTimeout(() => {
              if (popup && !popup.closed) {
                popup.close();
              }
            }, 100);

            setIsGoogleLoading(false);

            if (result.success) {
              navigate('/dashboard/home');
            } else {
              setErrors({ submit: result.error || 'Erreur lors de la connexion' });
            }
          } catch (err) {
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

      checkInterval = setInterval(() => {
        if (popup && popup.closed && !isProcessing) {
          clearInterval(checkInterval);
          window.removeEventListener('message', handleMessage);
          setIsGoogleLoading(false);
          setErrors({ submit: 'Connexion annulée' });
        }
      }, 500);

    } catch (error) {
      setErrors({ submit: 'Erreur lors de la connexion avec Google' });
      setIsGoogleLoading(false);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-bleu-neon/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-plasma/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="w-full max-w-6xl relative z-10">
        <div className="backdrop-blur-xl bg-bleu-fonce/40 border border-primary-500/30 rounded-3xl shadow-2xl hover:border-bleu-neon/50 transition-all duration-500 overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            {/* Image à gauche */}
            <div className="w-full lg:w-1/2 relative group">
              <div className="relative h-[300px] lg:h-full lg:min-h-[550px]">
                  {/* Video */}
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                 className="absolute inset-0 w-full h-full object-contain bg-black"
                  style={{
                    filter: 'brightness(0.8) contrast(1.1)',
                  }}
                >
                  <source src="/img/cyberion-video.mp4" type="video/mp4" />
                </video>

                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-tr from-bleu-neon/30 via-transparent to-violet-plasma/30"></div>

                {/* Content overlay */}
                <div className="absolute inset-0 flex flex-col justify-end p-4">
                  <div className="backdrop-blur-sm bg-bleu-fonce/50 rounded-2xl p-3 border border-bleu-neon/30">
                    <Typography variant="h5" className="text-blanc-pur font-bold mb-1 text-lg">
                      Content de vous revoir
                    </Typography>
                    <Typography className="text-gray-300 mb-2 text-xs">
                      "L'innovation commence ici."
                    </Typography>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-primary"></div>
                      <div>
                        <Typography className="text-blanc-pur font-semibold text-xs">
                          Jean Martin
                        </Typography>
                        <Typography className="text-gray-400 text-[10px]">
                          CTO, InnovateCorp
                        </Typography>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Scan lines effect */}
                <div className="absolute inset-0 opacity-30 pointer-events-none">
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-bleu-neon to-transparent animate-pulse"></div>
                  <div className="absolute bottom-0 right-0 w-[2px] h-full bg-gradient-to-b from-transparent via-violet-plasma to-transparent animate-pulse"></div>
                </div>

                {/* Corner accents */}
                <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-bleu-neon opacity-50"></div>
                <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-violet-plasma opacity-50"></div>
              </div>
            </div>

            {/* Formulaire à droite */}
            <div className="w-full lg:w-1/2 p-5 md:p-6">
              {/* Header */}
              <div className="text-center mb-4">
                <div className="inline-block mb-2">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-neon-gradient animate-glow">
                    <Lock className="w-6 h-6 text-blanc-pur" />
                  </div>
                </div>
                <Typography
                  variant="h2"
                  className="font-bold mb-1 text-transparent bg-clip-text bg-gradient-primary text-2xl"
                >
                  Bienvenue
                </Typography>
                <Typography
                  variant="small"
                  className="text-gray-300 text-xs"
                >
                  Connectez-vous pour continuer
                </Typography>
              </div>

              <div className="space-y-3">
                {/* Error Alert */}
                {(errors.submit || authError) && (
                  <Alert 
                    color="red" 
                    className="backdrop-blur-sm bg-red-500/10 border border-red-500/30 py-2 text-xs"
                  >
                    {errors.submit || authError}
                  </Alert>
                )}

                {/* Email Input */}
                <div className="space-y-1">
                  <Typography
                    variant="small"
                    className="font-medium text-bleu-neon text-xs"
                  >
                    Adresse email
                  </Typography>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-bleu-neon transition-colors" />
                    <Input
                      type="email"
                      name="email"
                      size="md"
                      placeholder="votre@email.com"
                      value={formData.email}
                      onChange={handleChange}
                      error={!!errors.email}
                      className="!pl-10 !border-primary-500/50 focus:!border-bleu-neon bg-bleu-fonce/50 text-blanc-pur placeholder:text-gray-500 rounded-xl transition-all duration-300 hover:bg-bleu-fonce/70 !py-2"
                      labelProps={{
                        className: "before:content-none after:content-none",
                      }}
                    />
                    {errors.email && (
                      <Typography variant="small" color="red" className="mt-1 ml-1 text-[10px]">
                        {errors.email}
                      </Typography>
                    )}
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-1">
                  <Typography
                    variant="small"
                    className="font-medium text-bleu-neon text-xs"
                  >
                    Mot de passe
                  </Typography>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-bleu-neon transition-colors" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      size="md"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      error={!!errors.password}
                      className="!pl-10 !pr-10 !border-primary-500/50 focus:!border-bleu-neon bg-bleu-fonce/50 text-blanc-pur placeholder:text-gray-500 rounded-xl transition-all duration-300 hover:bg-bleu-fonce/70 !py-2"
                      labelProps={{
                        className: "before:content-none after:content-none",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-bleu-neon transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    {errors.password && (
                      <Typography variant="small" color="red" className="mt-1 ml-1 text-[10px]">
                        {errors.password}
                      </Typography>
                    )}
                  </div>
                </div>

                {/* Remember me & Forgot password */}
                <div className="flex items-center justify-between py-1">
                  <Checkbox
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    label={
                      <Typography
                        variant="small"
                        className="font-medium text-gray-300 text-[11px]"
                      >
                        Se souvenir de moi
                      </Typography>
                    }
                    className="border-bleu-neon/50 checked:bg-gradient-primary hover:scale-105 transition-transform"
                  />
                  <Link
                    to="/auth/forgot-password"
                    className="text-[11px] font-medium text-bleu-neon hover:text-violet-plasma transition-colors"
                  >
                    Mot de passe oublié ?
                  </Link>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  onClick={handleSubmit}
                  className="w-full bg-gradient-primary hover:shadow-neon-gradient transition-all duration-300 rounded-xl py-2 group relative overflow-hidden"
                  disabled={isSubmitting || loading}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2 text-sm">
                    {isSubmitting || loading ? 'Connexion...' : 'Se connecter'}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                </Button>

                {/* Divider */}
                <div className="relative my-3">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-primary-500/30"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-3 bg-bleu-fonce/40 text-gray-400 text-[11px]">Ou</span>
                  </div>
                </div>

                {/* Google Login */}
                <Button
                  type="button"
                  size="md"
                  onClick={handleGoogleLogin}
                  disabled={isGoogleLoading}
                  className="w-full backdrop-blur-sm bg-bleu-fonce/50 border border-primary-500/30 hover:border-bleu-neon text-blanc-pur hover:shadow-neon-blue transition-all duration-300 rounded-xl group py-2"
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                    <span className="group-hover:translate-x-1 transition-transform text-xs">
                      {isGoogleLoading ? 'Connexion...' : 'Google'}
                    </span>
                  </span>
                </Button>

                {/* Sign up link */}
                <Typography
                  variant="small"
                  className="text-center text-gray-400 mt-2 text-[11px]"
                >
                  Pas encore de compte ?{' '}
                  <Link
                    to="/auth/sign-up"
                    className="text-bleu-neon hover:text-violet-plasma font-semibold transition-colors"
                  >
                    Créer un compte
                  </Link>
                </Typography>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SignIn;
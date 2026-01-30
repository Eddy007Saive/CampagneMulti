import { useState } from 'react';
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  Button,
  Typography,
  Alert,
} from "@material-tailwind/react";
import { Mail, X, Send, CheckCircle } from 'lucide-react';

export function ForgotPasswordModal({ open, onClose }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!email) {
      setError('L\'email est requis');
      return;
    }

    if (!validateEmail(email)) {
      setError('Format d\'email invalide');
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Remplacer par votre appel API
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        // Fermer le modal après 3 secondes
        setTimeout(() => {
          handleClose();
        }, 3000);
      } else {
        setError(data.message || 'Une erreur est survenue');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setError('');
    setIsSuccess(false);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Dialog
      open={open}
      handler={handleClose}
      size="sm"
      className="bg-bleu-fonce/95 backdrop-blur-xl border border-primary-500/30 shadow-2xl"
      animate={{
        mount: { scale: 1, opacity: 1 },
        unmount: { scale: 0.9, opacity: 0 },
      }}
    >
      {/* Close button */}
      <button
        onClick={handleClose}
        className="absolute top-4 right-4 text-gray-400 hover:text-blanc-pur transition-colors z-10"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Content based on state */}
      {!isSuccess ? (
        <>
          {/* Header */}
          <DialogHeader className="flex flex-col items-center gap-3 pb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-neon-gradient animate-glow">
              <Mail className="w-7 h-7 text-blanc-pur" />
            </div>
            <div className="text-center">
              <Typography
                variant="h4"
                className="font-bold text-transparent bg-clip-text bg-gradient-primary"
              >
                Mot de passe oublié ?
              </Typography>
              <Typography
                variant="small"
                className="text-gray-300 mt-2 font-normal"
              >
                Entrez votre email pour recevoir un lien de réinitialisation
              </Typography>
            </div>
          </DialogHeader>

          {/* Body */}
          <DialogBody className="space-y-4 px-6">
            {error && (
              <Alert
                color="red"
                className="backdrop-blur-sm bg-red-500/10 border border-red-500/30 py-2"
              >
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Typography
                  variant="small"
                  className="font-medium text-bleu-neon"
                >
                  Adresse email
                </Typography>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-bleu-neon transition-colors" />
                  <Input
                    type="email"
                    size="lg"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                    }}
                    className="!pl-11 !border-primary-500/50 focus:!border-bleu-neon bg-bleu-fonce/50 text-blanc-pur placeholder:text-gray-500 rounded-xl transition-all duration-300 hover:bg-bleu-fonce/70"
                    labelProps={{
                      className: "before:content-none after:content-none",
                    }}
                  />
                </div>
              </div>
            </form>

            {/* Info message */}
            <div className="backdrop-blur-sm bg-bleu-neon/5 border border-bleu-neon/20 rounded-xl p-4">
              <Typography variant="small" className="text-gray-300 text-xs">
                💡 Vous recevrez un email avec un lien pour créer un nouveau mot de passe. 
                Le lien sera valide pendant 1 heure.
              </Typography>
            </div>
          </DialogBody>

          {/* Footer */}
          <DialogFooter className="flex flex-col gap-2 px-6 pb-6">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full bg-gradient-primary hover:shadow-neon-gradient transition-all duration-300 rounded-xl group relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isSubmitting ? (
                  'Envoi en cours...'
                ) : (
                  <>
                    Envoyer le lien
                    <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
            </Button>

            <Button
              onClick={handleClose}
              variant="text"
              className="w-full text-gray-400 hover:text-blanc-pur transition-colors"
            >
              Retour à la connexion
            </Button>
          </DialogFooter>
        </>
      ) : (
        // Success state
        <>
          <DialogBody className="flex flex-col items-center justify-center py-10 px-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/50 mb-6 animate-bounce-slow">
              <CheckCircle className="w-10 h-10 text-blanc-pur" />
            </div>

            <Typography
              variant="h4"
              className="font-bold text-transparent bg-clip-text bg-gradient-primary mb-3 text-center"
            >
              Email envoyé !
            </Typography>

            <Typography
              variant="paragraph"
              className="text-gray-300 text-center mb-6"
            >
              Vérifiez votre boîte mail <span className="text-bleu-neon font-semibold">{email}</span>
            </Typography>

            <div className="backdrop-blur-sm bg-green-500/10 border border-green-500/30 rounded-xl p-4 w-full">
              <Typography variant="small" className="text-gray-300 text-xs text-center">
                ✓ Vérifiez également vos spams si vous ne recevez pas l'email dans quelques minutes
              </Typography>
            </div>

            {/* Auto close indicator */}
            <Typography variant="small" className="text-gray-500 mt-6 text-xs">
              Fermeture automatique dans 3 secondes...
            </Typography>
          </DialogBody>
        </>
      )}

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-lg">
        <div className="absolute top-0 right-0 w-40 h-40 bg-bleu-neon/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-violet-plasma/5 rounded-full blur-3xl"></div>
      </div>
    </Dialog>
  );
}

export default ForgotPasswordModal;
import React, { useState, useEffect } from 'react';
import { Settings, Save, Eye, EyeOff, AlertCircle, CheckCircle, Activity, Mail, Shield, Zap, Globe, Monitor, User, Key, Loader } from 'lucide-react';
import {
  upsertConfiguration,
  getSystemStatus,
  getConfiguration,
} from '@/services/Configuration';
import { testConnection } from '@/services/Emelia';
import { testConnection as testConnectionGHL } from '@/services/GodHighLevel';
import Loading from '@/components/Loading';

export function LinkedInConfigInterface() {
  const [config, setConfig] = useState({
    liAt: '',
    email: '',
    userAgent: '',
    status: 'Actif',
    userId: null,
    emeliaApiKey: '',
    ghlApiKey: ''
  });

  const [quota, setQuota] = useState({
    quotaRestant: 0,
    derniereMiseAJour: '',
    idCampagneActive: ''
  });

  const [showCookies, setShowCookies] = useState(false);
  const [showEmeliaKey, setShowEmeliaKey] = useState(false);
  const [showGhlKey, setShowGhlKey] = useState(false);
  const [validationStatus, setValidationStatus] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [systemStatus, setSystemStatus] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isTestingEmelia, setIsTestingEmelia] = useState(false);
  const [isTestingGhl, setIsTestingGhl] = useState(false);

  // Récupérer l'utilisateur depuis le localStorage
  useEffect(() => {
    const getUserFromStorage = () => {
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          setCurrentUser(user);
          setConfig(prev => ({
            ...prev,
            userId: user.id
          }));

        } else {
          console.warn('Aucun utilisateur trouvé dans le localStorage');
        }
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      }
    };

    getUserFromStorage();
  }, []);

  // Auto-détecter le User-Agent du navigateur actuel
  const detectUserAgent = () => {
    const currentUA = navigator.userAgent;
    handleInputChange('userAgent', currentUA);
  };

  // Charger la configuration au montage du composant
  useEffect(() => {
    if (currentUser) {
      loadSystemData();
    }
  }, [currentUser]);

  const loadSystemData = async () => {
    setIsLoading(true);
    try {
      const status = await getSystemStatus(currentUser);

      if (status) {
        setSystemStatus(status);

        // Charger la configuration
        if (status.configuration) {
          setConfig({
            liAt: status.configuration.valeur || '',
            email: currentUser.email || '',
            userAgent: status.configuration.userAgent || '',
            status: status.configuration.status || 'Actif',
            userId: currentUser?.id,
            emeliaApiKey: status.configuration.emeliaApiKey || '',
            ghlApiKey: status.configuration.ghlApiKey || '',
            ghlLocationId: status.configuration.ghlLocationId || '' // NOUVEAU
          });
        }

        // Charger le quota
        if (status.quota) {
          setQuota(status.quota);
        }

        // Mettre à jour le statut de validation
        if (status.validation) {
          setValidationStatus({
            liAt: {
              valid: status.validation.details?.cookieValid || false,
              message: status.validation.message
            },
            email: {
              valid: status.validation.details?.emailValid || false,
              message: status.validation.details?.emailValid ? 'Email valide' : 'Email invalide'
            },
            userAgent: {
              valid: status.validation.details?.userAgentValid || false,
              message: status.validation.details?.userAgentValid ? 'User-Agent valide' : 'User-Agent invalide'
            }
          });
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));

    // Validation en temps réel
    if (field === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isValid = value && emailRegex.test(value);
      setValidationStatus(prev => ({
        ...prev,
        email: {
          valid: isValid,
          message: isValid ? 'Email valide' : 'Email invalide'
        }
      }));
    } else if (field === 'liAt') {
      const isValid = value && value.length > 50 && value.startsWith('AQEDA');
      setValidationStatus(prev => ({
        ...prev,
        liAt: {
          valid: isValid,
          message: isValid ? 'Cookie valide' : 'Cookie invalide ou manquant'
        }
      }));
    } else if (field === 'userAgent') {
      const isValid = value && value.length > 50 && value.includes('Mozilla');
      setValidationStatus(prev => ({
        ...prev,
        userAgent: {
          valid: isValid,
          message: isValid ? 'User-Agent valide' : 'User-Agent invalide ou manquant'
        }
      }));
    } else if (field === 'emeliaApiKey') {
      const isValid = value && value.length > 20;
      setValidationStatus(prev => ({
        ...prev,
        emeliaApiKey: {
          valid: isValid,
          message: isValid ? 'Clé API valide' : 'Clé API invalide ou manquante'
        }
      }));
    } else if (field === 'ghlApiKey') {
      const isValid = value && value.length > 20;
      setValidationStatus(prev => ({
        ...prev,
        ghlApiKey: {
          valid: isValid,
          message: isValid ? 'Clé API valide' : 'Clé API invalide ou manquante'
        }
      }));
    }
  };

  const handleTestEmeliaConnection = async () => {
    if (!config.emeliaApiKey) {
      showNotification('Veuillez entrer une clé API Emelia', 'error');
      return;
    }

    setIsTestingEmelia(true);
    try {
      const result = await testConnection(config.emeliaApiKey);

      if (result.success) {
        showNotification('✅ Connexion Emelia réussie !', 'success');
        setValidationStatus(prev => ({
          ...prev,
          emeliaApiKey: {
            valid: true,
            message: 'Connexion réussie'
          }
        }));
      } else {
        showNotification('❌ Échec de connexion Emelia: ' + (result.error || 'Erreur inconnue'), 'error');
        setValidationStatus(prev => ({
          ...prev,
          emeliaApiKey: {
            valid: false,
            message: 'Échec de connexion'
          }
        }));
      }
    } catch (error) {
      console.error('Erreur test Emelia:', error);
      showNotification('❌ Erreur lors du test de connexion Emelia', 'error');
      setValidationStatus(prev => ({
        ...prev,
        emeliaApiKey: {
          valid: false,
          message: 'Erreur de connexion'
        }
      }));
    } finally {
      setIsTestingEmelia(false);
    }
  };

  const handleTestGhlConnection = async () => {
    if (!config.ghlApiKey || !config.ghlLocationId) {
      showNotification('Veuillez entrer une clé API et un Location ID GHL', 'error');
      return;
    }

    setIsTestingGhl(true);
    try {
      const response= await testConnectionGHL(config);
      console.log(response);
      
      if (response.success) {
        showNotification('✅ Connexion GHL réussie !', 'success');
        setValidationStatus(prev => ({
          ...prev,
          ghlApiKey: {
            valid: true,
            message: 'Connexion réussie'
          },
          ghlLocationId: {
            valid: true,
            message: 'Location ID validé'
          }
        }));
      } else {
        showNotification('❌ Échec de connexion GHL', 'error');
        setValidationStatus(prev => ({
          ...prev,
          ghlApiKey: {
            valid: false,
            message: 'Échec de connexion'
          }
        }));
      }
    } catch (error) {
      console.error('Erreur test GHL:', error);
      showNotification('❌ Erreur lors du test de connexion GHL', 'error');
      setValidationStatus(prev => ({
        ...prev,
        ghlApiKey: {
          valid: false,
          message: 'Erreur de connexion'
        }
      }));
    } finally {
      setIsTestingGhl(false);
    }
  };

  const handleSaveConfig = async () => {
    if (!config.userId) {
      showNotification('Erreur: Utilisateur non identifié. Veuillez vous reconnecter.', 'error');
      return;
    }

    setIsSaving(true);

    try {
      const configData = {
        valeur: config.liAt,
        email: config.email,
        userAgent: config.userAgent,
        status: config.status,
        userId: config.userId,
        emeliaApiKey: config.emeliaApiKey,
        ghlApiKey: config.ghlApiKey,
        ghlLocationId: config.ghlLocationId // NOUVEAU
      };

      const result = await upsertConfiguration(configData);

      if (result.success) {
        showNotification('Configuration sauvegardée avec succès !', 'success');
        await loadSystemData();
      }
    } catch (error) {
      console.error('Erreur:', error);
      showNotification('Erreur lors de la sauvegarde: ' + (error.response?.data?.errors || error.message), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const showNotification = (message, type) => {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
      }`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen ">
        <Loading />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-bleu-fonce/90 to-noir-absolu/80 text-white flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <div className="flex items-center gap-3 text-red-800">
            <AlertCircle className="w-6 h-6" />
            <div>
              <h3 className="font-semibold text-lg">Authentification requise</h3>
              <p className="text-sm mt-1">Veuillez vous connecter pour accéder à cette page.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B1030] via-[#000000] to-[#0B1030] text-white">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
            <div className="p-3 bg-gradient-to-br from-[#00CFFF] to-[#A63DFF] rounded-xl shadow-[0_0_20px_rgba(0,207,255,0.5)]">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#00CFFF] to-[#A63DFF] bg-clip-text text-transparent">
                Configuration LinkedIn
              </h1>
              <p className="text-[#00CFFF]/70 text-sm sm:text-base">Configurez votre connexion LinkedIn pour automatiser vos campagnes</p>
            </div>
            {currentUser && (
              <div className="flex items-center gap-2 bg-[#0B1030]/80 border border-[#00CFFF]/30 px-4 py-2 rounded-lg backdrop-blur-sm">
                <User className="w-4 h-4 text-[#00CFFF]" />
                <span className="text-sm font-medium text-white">
                  {currentUser.nom || currentUser.name || currentUser.email}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* System Status Card */}
        {systemStatus && (
          <div className="mb-6">
            <div className={`rounded-xl border p-4 backdrop-blur-sm ${
              systemStatus.systemReady 
                ? 'bg-green-500/10 border-green-400/30 shadow-[0_0_20px_rgba(34,197,94,0.2)]' 
                : 'bg-red-500/10 border-red-400/30 shadow-[0_0_20px_rgba(239,68,68,0.2)]'
            }`}>
              <div className="flex items-center gap-3">
                {systemStatus.systemReady ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-400" />
                )}
                <div>
                  <h3 className="font-semibold text-white">
                    {systemStatus.systemReady ? 'Système Opérationnel' : 'Configuration Requise'}
                  </h3>
                  <p className="text-sm text-[#00CFFF]/70">
                    {systemStatus.systemReady 
                      ? 'Votre configuration est complète et fonctionnelle' 
                      : 'Veuillez compléter la configuration'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quota Card */}
        {quota && (
          <div className="mb-6">
            <div className="bg-gradient-to-br from-[#0B1030]/80 to-[#000000]/60 border border-[#00CFFF]/30 rounded-xl p-4 sm:p-6 shadow-[0_0_30px_rgba(0,207,255,0.2)] backdrop-blur-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#00CFFF]/20 rounded-lg border border-[#00CFFF]/40">
                    <Activity className="w-5 h-5 text-[#00CFFF]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Quota Journalier</h3>
                    <p className="text-sm text-[#00CFFF]/70">Gestion de vos connexions quotidiennes</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold bg-gradient-to-r from-[#00CFFF] to-[#A63DFF] bg-clip-text text-transparent">
                    {quota.quotaRestant}
                  </div>
                  <p className="text-sm text-[#00CFFF]/70">connexions restantes</p>
                </div>
              </div>
              
              {quota.derniereMiseAJour && (
                <div className="mt-4 pt-4 border-t border-[#00CFFF]/20">
                  <p className="text-sm text-[#00CFFF]/60">
                    Dernière mise à jour: {quota.derniereMiseAJour}
                    {quota.idCampagneActive && (
                      <span className="ml-4 px-2 py-1 bg-[#A63DFF]/20 text-[#A63DFF] border border-[#A63DFF]/30 rounded-md text-xs">
                        Campagne: {quota.idCampagneActive}
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Configuration Cards */}
        <div className="space-y-6 mb-6">
          {/* Cookie Configuration */}
          <div className="bg-gradient-to-br from-[#0B1030]/80 to-[#000000]/60 border border-[#00CFFF]/30 rounded-xl shadow-[0_0_30px_rgba(0,207,255,0.2)] overflow-hidden backdrop-blur-sm">
            <div className="bg-gradient-to-r from-[#A63DFF]/20 to-[#00CFFF]/20 border-b border-[#00CFFF]/30 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#00CFFF]/20 rounded-lg border border-[#00CFFF]/40">
                  <Shield className="w-5 h-5 text-[#00CFFF]" />
                </div>
                <h3 className="font-semibold text-[#00CFFF]">Configuration des Cookies</h3>
              </div>
            </div>
            
            <div className="p-6">
              <div>
                <label className="block text-sm font-medium text-[#00CFFF]/90 mb-2">
                  Cookie li_at (obligatoire)
                </label>
                <div className="relative">
                  <input
                    type={showCookies ? "text" : "password"}
                    value={config.liAt}
                    onChange={(e) => handleInputChange('liAt', e.target.value)}
                    placeholder="Entrez votre cookie li_at..."
                    className="w-full p-3 bg-[#0B1030]/50 border border-[#00CFFF]/40 rounded-lg 
                      focus:ring-2 focus:ring-[#A63DFF] focus:border-[#A63DFF] 
                      text-white placeholder-[#00CFFF]/50 pr-10
                      transition-all duration-300 hover:border-[#00CFFF]/60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCookies(!showCookies)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#00CFFF]/60 hover:text-[#00CFFF] transition-colors"
                  >
                    {showCookies ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {validationStatus.liAt && (
                  <div className={`mt-2 flex items-center gap-2 text-sm ${
                    validationStatus.liAt.valid ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {validationStatus.liAt.valid ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <AlertCircle className="w-4 h-4" />
                    )}
                    {validationStatus.liAt.message}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* User-Agent Configuration */}
          <div className="bg-gradient-to-br from-[#0B1030]/80 to-[#000000]/60 border border-[#00CFFF]/30 rounded-xl shadow-[0_0_30px_rgba(0,207,255,0.2)] overflow-hidden backdrop-blur-sm">
            <div className="bg-gradient-to-r from-[#A63DFF]/20 to-[#00CFFF]/20 border-b border-[#00CFFF]/30 px-6 py-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#00CFFF]/20 rounded-lg border border-[#00CFFF]/40">
                    <Monitor className="w-5 h-5 text-[#00CFFF]" />
                  </div>
                  <h3 className="font-semibold text-[#00CFFF]">Configuration User-Agent</h3>
                </div>
                <button
                  onClick={detectUserAgent}
                  className="px-3 py-1.5 text-sm bg-gradient-to-r from-[#00CFFF] to-[#A63DFF] text-white rounded-lg hover:shadow-[0_0_20px_rgba(0,207,255,0.5)] transition-all duration-300"
                >
                  Détecter automatiquement
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div>
                <label className="block text-sm font-medium text-[#00CFFF]/90 mb-2">
                  User-Agent (recommandé)
                </label>
                <div className="relative">
                  <textarea
                    value={config.userAgent}
                    onChange={(e) => handleInputChange('userAgent', e.target.value)}
                    placeholder="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36..."
                    rows={3}
                    className="w-full p-3 bg-[#0B1030]/50 border border-[#00CFFF]/40 rounded-lg 
                      focus:ring-2 focus:ring-[#A63DFF] focus:border-[#A63DFF] 
                      text-white placeholder-[#00CFFF]/50 resize-none
                      transition-all duration-300 hover:border-[#00CFFF]/60"
                  />
                </div>
                {validationStatus.userAgent && (
                  <div className={`mt-2 flex items-center gap-2 text-sm ${
                    validationStatus.userAgent.valid ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {validationStatus.userAgent.valid ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <AlertCircle className="w-4 h-4" />
                    )}
                    {validationStatus.userAgent.message}
                  </div>
                )}
                <p className="mt-2 text-sm text-[#00CFFF]/60">
                  Identifie votre navigateur pour éviter la détection automatisée
                </p>
              </div>
            </div>
          </div>

          {/* Email Configuration */}
          <div className="bg-gradient-to-br from-[#0B1030]/80 to-[#000000]/60 border border-[#00CFFF]/30 rounded-xl shadow-[0_0_30px_rgba(0,207,255,0.2)] overflow-hidden backdrop-blur-sm">
            <div className="bg-gradient-to-r from-[#A63DFF]/20 to-[#00CFFF]/20 border-b border-[#00CFFF]/30 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#00CFFF]/20 rounded-lg border border-[#00CFFF]/40">
                  <Mail className="w-5 h-5 text-[#00CFFF]" />
                </div>
                <h3 className="font-semibold text-[#00CFFF]">Configuration Email</h3>
              </div>
            </div>
            
            <div className="p-6">
              <div>
                <label className="block text-sm font-medium text-[#00CFFF]/90 mb-2">
                  Email de notification
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={config.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="nom@exemple.com"
                    className="w-full p-3 bg-[#0B1030]/50 border border-[#00CFFF]/40 rounded-lg 
                      focus:ring-2 focus:ring-[#A63DFF] focus:border-[#A63DFF] 
                      text-white placeholder-[#00CFFF]/50 pl-10
                      transition-all duration-300 hover:border-[#00CFFF]/60"
                  />
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#00CFFF]/60" />
                </div>
                {validationStatus.email && (
                  <div className={`mt-2 flex items-center gap-2 text-sm ${
                    validationStatus.email.valid ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {validationStatus.email.valid ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <AlertCircle className="w-4 h-4" />
                    )}
                    {validationStatus.email.message}
                  </div>
                )}
                <p className="mt-2 text-sm text-[#00CFFF]/60">
                  Recevez des notifications sur l'état de vos campagnes
                </p>
              </div>
            </div>
          </div>

          {/* Emelia API Configuration */}
          <div className="bg-gradient-to-br from-[#0B1030]/80 to-[#000000]/60 border border-[#00CFFF]/30 rounded-xl shadow-[0_0_30px_rgba(0,207,255,0.2)] overflow-hidden backdrop-blur-sm">
            <div className="bg-gradient-to-r from-[#A63DFF]/20 to-[#00CFFF]/20 border-b border-[#00CFFF]/30 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#A63DFF]/20 rounded-lg border border-[#A63DFF]/40">
                  <Key className="w-5 h-5 text-[#A63DFF]" />
                </div>
                <h3 className="font-semibold text-[#00CFFF]">API Emelia</h3>
              </div>
            </div>
            
            <div className="p-6">
              <div>
                <label className="block text-sm font-medium text-[#00CFFF]/90 mb-2">
                  Clé API Emelia
                </label>
                <div className="flex gap-2 flex-col sm:flex-row">
                  <div className="relative flex-1">
                    <input
                      type={showEmeliaKey ? "text" : "password"}
                      value={config.emeliaApiKey}
                      onChange={(e) => handleInputChange('emeliaApiKey', e.target.value)}
                      placeholder="Entrez votre clé API Emelia..."
                      className="w-full p-3 bg-[#0B1030]/50 border border-[#00CFFF]/40 rounded-lg 
                        focus:ring-2 focus:ring-[#A63DFF] focus:border-[#A63DFF] 
                        text-white placeholder-[#00CFFF]/50 pr-10
                        transition-all duration-300 hover:border-[#00CFFF]/60"
                    />
                    <button
                      type="button"
                      onClick={() => setShowEmeliaKey(!showEmeliaKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#00CFFF]/60 hover:text-[#00CFFF] transition-colors"
                    >
                      {showEmeliaKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <button
                    onClick={handleTestEmeliaConnection}
                    disabled={isTestingEmelia || !config.emeliaApiKey}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 
                      text-white font-semibold rounded-lg
                      hover:shadow-[0_0_20px_rgba(34,197,94,0.5)] transition-all duration-300 
                      disabled:opacity-50 disabled:cursor-not-allowed 
                      flex items-center justify-center gap-2 whitespace-nowrap
                      sm:w-auto w-full"
                  >
                    {isTestingEmelia ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        Test...
                      </>
                    ) : (
                      'Tester connexion'
                    )}
                  </button>
                </div>
                {validationStatus.emeliaApiKey && (
                  <div className={`mt-2 flex items-center gap-2 text-sm ${
                    validationStatus.emeliaApiKey.valid ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {validationStatus.emeliaApiKey.valid ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <AlertCircle className="w-4 h-4" />
                    )}
                    {validationStatus.emeliaApiKey.message}
                  </div>
                )}
                <p className="mt-2 text-sm text-[#00CFFF]/60">
                  Permet l'intégration avec Emelia pour l'envoi d'emails
                </p>
              </div>
            </div>
          </div>

          {/* GHL API Configuration */}
          <div className="bg-gradient-to-br from-[#0B1030]/80 to-[#000000]/60 border border-[#00CFFF]/30 rounded-xl shadow-[0_0_30px_rgba(0,207,255,0.2)] overflow-hidden backdrop-blur-sm">
            <div className="bg-gradient-to-r from-[#A63DFF]/20 to-[#00CFFF]/20 border-b border-[#00CFFF]/30 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#A63DFF]/20 rounded-lg border border-[#A63DFF]/40">
                  <Key className="w-5 h-5 text-[#A63DFF]" />
                </div>
                <h3 className="font-semibold text-[#00CFFF]">API GoHighLevel</h3>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Clé API GHL */}
              <div>
                <label className="block text-sm font-medium text-[#00CFFF]/90 mb-2">
                  Clé API GHL
                </label>
                <div className="flex gap-2 flex-col sm:flex-row">
                  <div className="relative flex-1">
                    <input
                      type={showGhlKey ? "text" : "password"}
                      value={config.ghlApiKey}
                      onChange={(e) => handleInputChange('ghlApiKey', e.target.value)}
                      placeholder="Entrez votre clé API GHL..."
                      className="w-full p-3 bg-[#0B1030]/50 border border-[#00CFFF]/40 rounded-lg 
                        focus:ring-2 focus:ring-[#A63DFF] focus:border-[#A63DFF] 
                        text-white placeholder-[#00CFFF]/50 pr-10
                        transition-all duration-300 hover:border-[#00CFFF]/60"
                    />
                    <button
                      type="button"
                      onClick={() => setShowGhlKey(!showGhlKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#00CFFF]/60 hover:text-[#00CFFF] transition-colors"
                    >
                      {showGhlKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                {validationStatus.ghlApiKey && (
                  <div className={`mt-2 flex items-center gap-2 text-sm ${
                    validationStatus.ghlApiKey.valid ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {validationStatus.ghlApiKey.valid ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <AlertCircle className="w-4 h-4" />
                    )}
                    {validationStatus.ghlApiKey.message}
                  </div>
                )}
              </div>

              {/* Location ID */}
              <div>
                <label className="block text-sm font-medium text-[#00CFFF]/90 mb-2">
                  Location ID
                </label>
                <div className="flex gap-2 flex-col sm:flex-row">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={config.ghlLocationId}
                      onChange={(e) => handleInputChange('ghlLocationId', e.target.value)}
                      placeholder="Entrez votre Location ID..."
                      className="w-full p-3 bg-[#0B1030]/50 border border-[#00CFFF]/40 rounded-lg 
                        focus:ring-2 focus:ring-[#A63DFF] focus:border-[#A63DFF] 
                        text-white placeholder-[#00CFFF]/50
                        transition-all duration-300 hover:border-[#00CFFF]/60"
                    />
                  </div>
                  <button
                    onClick={handleTestGhlConnection}
                    disabled={isTestingGhl || !config.ghlApiKey || !config.ghlLocationId}
                    className="px-6 py-3 bg-gradient-to-r from-[#A63DFF] to-[#00CFFF] 
                      text-white font-semibold rounded-lg
                      hover:shadow-[0_0_25px_rgba(166,61,255,0.5)] transition-all duration-300 
                      disabled:opacity-50 disabled:cursor-not-allowed 
                      flex items-center justify-center gap-2 whitespace-nowrap
                      sm:w-auto w-full"
                  >
                    {isTestingGhl ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        Test...
                      </>
                    ) : (
                      'Tester connexion'
                    )}
                  </button>
                </div>
                {validationStatus.ghlLocationId && (
                  <div className={`mt-2 flex items-center gap-2 text-sm ${
                    validationStatus.ghlLocationId.valid ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {validationStatus.ghlLocationId.valid ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <AlertCircle className="w-4 h-4" />
                    )}
                    {validationStatus.ghlLocationId.message}
                  </div>
                )}
                <p className="mt-2 text-sm text-[#00CFFF]/60">
                  Permet l'intégration avec GoHighLevel pour la gestion CRM
                </p>
              </div>
            </div>
          </div>

          {/* Status Configuration */}
          <div className="bg-gradient-to-br from-[#0B1030]/80 to-[#000000]/60 border border-[#00CFFF]/30 rounded-xl shadow-[0_0_30px_rgba(0,207,255,0.2)] overflow-hidden backdrop-blur-sm">
            <div className="bg-gradient-to-r from-[#A63DFF]/20 to-[#00CFFF]/20 border-b border-[#00CFFF]/30 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#00CFFF]/20 rounded-lg border border-[#00CFFF]/40">
                  <Zap className="w-5 h-5 text-[#00CFFF]" />
                </div>
                <h3 className="font-semibold text-[#00CFFF]">Statut du Système</h3>
              </div>
            </div>
            
            <div className="p-6">
              <div>
                <label className="block text-sm font-medium text-[#00CFFF]/90 mb-2">
                  État de la configuration
                </label>
                <select
                  value={config.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full p-3 bg-[#0B1030]/50 border border-[#00CFFF]/40 rounded-lg 
                    focus:ring-2 focus:ring-[#A63DFF] focus:border-[#A63DFF] 
                    text-white
                    transition-all duration-300 hover:border-[#00CFFF]/60
                    [&>option]:bg-[#0B1030] [&>option]:text-white"
                >
                  <option value="Actif">🟢 Actif</option>
                  <option value="Inactif">🔴 Inactif</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Help Card */}
        <div className="bg-gradient-to-br from-[#00CFFF]/10 to-[#A63DFF]/10 border border-[#00CFFF]/30 rounded-xl p-6 mb-6 backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <Globe className="w-5 h-5 text-[#00CFFF] mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-semibold text-[#00CFFF] mb-3">Guide de configuration</h4>
              <div className="grid md:grid-cols-2 gap-6 text-sm text-[#00CFFF]/80">
                <div>
                  <h5 className="font-semibold mb-2 text-[#A63DFF]">📍 Obtenir le cookie LinkedIn :</h5>
                  <div className="space-y-1">
                    <div>1. Connectez-vous à LinkedIn</div>
                    <div>2. Ouvrez F12 → Application → Cookies</div>
                    <div>3. Trouvez "https://www.linkedin.com"</div>
                    <div>4. Copiez la valeur "li_at"</div>
                  </div>
                </div>
                <div>
                  <h5 className="font-semibold mb-2 text-[#A63DFF]">🌐 Obtenir le User-Agent :</h5>
                  <div className="space-y-1">
                    <div>1. Ouvrez F12 → Console</div>
                    <div>2. Tapez: navigator.userAgent</div>
                    <div>3. Ou cliquez sur "Détecter automatiquement"</div>
                    <div>4. Copiez la valeur affichée</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSaveConfig}
            disabled={
              isSaving ||
              !validationStatus.liAt?.valid ||
              !validationStatus.email?.valid ||
              !config.userId
            }
            className="relative px-8 py-4 font-bold uppercase tracking-wider
              text-white overflow-hidden group rounded-xl border-0
              bg-gradient-to-r from-[#00CFFF] via-[#A63DFF] to-[#00CFFF]
              hover:shadow-[0_0_40px_rgba(0,207,255,0.6)]
              transition-all duration-500
              disabled:bg-gray-600 disabled:cursor-not-allowed disabled:shadow-none
              disabled:opacity-50"
          >
            <span className="relative z-10 flex items-center gap-2">
              {isSaving ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}

              <span>
                {isSaving ? "Sauvegarde en cours..." : "Sauvegarder la Configuration"}
              </span>
            </span>

            <div className="absolute inset-0 bg-gradient-to-r 
              from-transparent via-white/20 to-transparent
              -translate-x-full group-hover:translate-x-full
              transition-transform duration-700"></div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default LinkedInConfigInterface;
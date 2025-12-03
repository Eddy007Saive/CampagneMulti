import React, { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import {
  HelpCircle,
  Eye,
  Upload,
  Moon,
  Sun,
  Check,
  AlertCircle,
  Loader2,
  Copy,
  Users,
  MapPin,
  Calendar,
  Languages,
  Building,
  MessageSquare,
  RefreshCw,
  Clock,
  Plus,
  Trash2,
  MoveUp,
  MoveDown
} from "lucide-react";
import { createCampagne } from "@/services/Campagne";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import toastify from "@/utils/toastify";
import { useNavigate } from 'react-router-dom';
import { testConnection } from "@/services/Emelia";
import { Step0GeneralInfo } from "@/components/steps/Step0GeneralInfo";
import { Step1CriteresPro } from "@/components/steps/Step1CriteresPro";
import { Step2Planning } from "@/components/steps/Step2Planning";
import { Step3Messages } from "@/components/steps/Step3Messages";
import { Step4ColdEmail } from "@/components/steps/Step4ColdEmail";

const CampagneSchema = {
  nom: { required: true, minLength: 3 },
  zoneGeographique: { required: true, minLength: 2 },
  posteRecherche: { required: true, minLength: 2 },
  seniorite: { required: false },
  tailleEntreprise: { required: false },
  languesParlees: { required: true },
  secteursSOuhaites: { required: false },
  Template_message: { required: true, minLength: 10 },
  profilsParJour: { required: true, min: 1, max: 120 },
  messagesParJour: { required: true, min: 1, max: 40 },
  joursRafraichissement: { required: true, minLength: 1 },
  relances: { required: true, minLength: 1 },
  coldDelayAfterFollowUp: { required: false, min: 1 },
  coldCampaignIdEmelia: { required: false }
};

export function Create() {
  const [darkMode, setDarkMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [stepValidationErrors, setStepValidationErrors] = useState({});
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [carteSelectionnee, setCarteSelectionnee] = useState('initial');
  const [emeliaConnected, setEmeliaConnected] = useState(false);
  const [emeliaLoading, setEmeliaLoading] = useState(false);
  const [emeliaCampaigns, setEmeliaCampaigns] = useState([]);
  const [emeliaApiKey, setEmeliaApiKey] = useState("");
  const [formData, setFormData] = useState({
    nom: "",
    posteRecherche: "",
    zoneGeographique: "",
    seniorite: "",
    tailleEntreprise: "",
    languesParlees: "",
    secteursSOuhaites: "",
    contacts: "",
    statut: "En attente",
    Template_message: "",
    profilsParJour: "",
    messagesParJour: "",
    joursRafraichissement: [],
    relances: [
      {
        id: Date.now(),
        joursApres: "",
        instruction: ""
      }
    ],
    Users: "",
    coldEmail: false,
    coldDelayAfterFollowUp: "",
    coldEmailMode: "",
    coldCampaignIdEmelia: "",
    emeliaTimezone: "(GMT+1:00) Brussels, Copenhagen, Madrid, Paris",
    emeliaMaxNewPerDay: "35",
    emeliaDailyLimit: "100",
    emeliaBcc: "",
    emeliaSendingDays: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'],
    emeliaSendingTimeStart: "08:00",
    emeliaSendingTimeEnd: "17:00",
    emeliaStopIfReply: true,
    emeliaStopIfClick: false,
    emeliaStopIfOpen: false,
    emeliaAddToBlacklistIfUnsubscribed: false,
    emeliaTrackOpens: true,
    emeliaTrackClicks: true,
    emailSequence: [
      {
        id: Date.now(),
        delay: { amount: 0, unit: "MINUTES" },
        subject: "",
        message: "",
        rawHtml: false,
        disabled: false,
        attachments: []
      }
    ]
  });

  const [emailStepSelected, setEmailStepSelected] = useState(formData.emailSequence[0]?.id);

  ;



  const steps = [
    { id: 0, title: "Informations générales", icon: Users },
    { id: 1, title: "Critères professionnels", icon: Building },
    { id: 2, title: "Planning et fréquence", icon: Calendar },
    { id: 3, title: "Message et relances", icon: MessageSquare },
    { id: 4, title: "Cold Email (optionnel)", icon: MessageSquare } 
  ];

  const methods = useForm({
    mode: 'onChange',
    defaultValues: formData
  });

  const { register, handleSubmit, reset, setValue, formState: { errors }, watch, trigger, getValues } = methods;

  const ajouterRelance = () => {
    const nouvelleRelance = {
      id: Date.now(),
      joursApres: "",
      instruction: ""
    };

    setFormData(prev => ({
      ...prev,
      relances: [...prev.relances, nouvelleRelance]
    }));

    setCarteSelectionnee(nouvelleRelance.id);

    if (stepValidationErrors.relances) {
      const newErrors = { ...stepValidationErrors };
      delete newErrors.relances;
      setStepValidationErrors(newErrors);
    }
  };

  const supprimerRelance = (id) => {
    if (formData.relances.length <= 1) {
      toastify.warning("Vous devez avoir au moins une relance configurée");
      return;
    }

    setFormData(prev => ({
      ...prev,
      relances: prev.relances.filter(r => r.id !== id)
    }));
  };

  const modifierRelance = (id, champ, valeur) => {
    setFormData(prev => ({
      ...prev,
      relances: prev.relances.map(r =>
        r.id === id ? { ...r, [champ]: valeur } : r
      )
    }));

    if (stepValidationErrors.relances) {
      const newErrors = { ...stepValidationErrors };
      delete newErrors.relances;
      setStepValidationErrors(newErrors);
    }
  };

  const deplacerRelance = (index, direction) => {
    const newRelances = [...formData.relances];
    const newIndex = direction === 'up' ? index - 1 : index + 1;

    if (newIndex < 0 || newIndex >= newRelances.length) return;

    [newRelances[index], newRelances[newIndex]] = [newRelances[newIndex], newRelances[index]];

    setFormData(prev => ({ ...prev, relances: newRelances }));
  };

  const getTemplatesSuggeres = (joursApres) => {
    if (joursApres <= 5) return templatesRelanceParTiming.court;
    if (joursApres <= 10) return templatesRelanceParTiming.moyen;
    return templatesRelanceParTiming.long;
  };

  const validateField = (fieldName, value) => {
    const schema = CampagneSchema[fieldName];
    if (!schema) return null;

    if (fieldName === 'coldDelayAfterFollowUp') {
      if (formData.coldEmail && (!value || parseInt(value) < 1)) {
        return 'Le délai doit être supérieur ou égal à 1 jour';
      }
      return null;
    }

    if (fieldName === 'coldCampaignIdEmelia') {
      if (formData.coldEmail && formData.coldEmailMode === 'existing' && !value) {
        return 'Veuillez sélectionner une campagne Emelia';
      }
      return null;
    }

    if (schema.required) {
      if (fieldName === 'joursRafraichissement') {
        if (!value || !Array.isArray(value) || value.length === 0) {
          return 'Au moins un jour doit être sélectionné';
        }
      } else if (fieldName === 'relances') {
        if (!value || !Array.isArray(value) || value.length === 0) {
          return 'Au moins une relance doit être configurée';
        }

        for (let i = 0; i < value.length; i++) {
          const relance = value[i];
          if (!relance.joursApres || relance.joursApres <= 0) {
            return `La relance #${i + 1} : veuillez indiquer un délai`;
          }
          if (!relance.instruction || relance.instruction.trim().length < 10) {
            return `La relance #${i + 1} : le message doit contenir au moins 10 caractères`;
          }
        }

        const timings = value.map(r => parseInt(r.joursApres));
        if (new Set(timings).size !== timings.length) {
          return 'Deux relances ne peuvent pas avoir le même délai';
        }
      } else if (fieldName === 'emailSequence') {
        if (!value || !Array.isArray(value) || value.length === 0) {
          return 'Au moins un email doit être configuré dans la séquence';
        }

        for (let i = 0; i < value.length; i++) {
          const step = value[i];
          if (!step.subject || step.subject.trim().length < 3) {
            return `Email ${i + 1} : le sujet doit contenir au moins 3 caractères`;
          }
          if (!step.message || step.message.trim().length < 10) {
            return `Email ${i + 1} : le message doit contenir au moins 10 caractères`;
          }
        }
      } else if (!value || value.toString().trim() === "") {
        return `Ce champ est requis`;
      }
    }

    return null;
  };

  const getFieldsForStep = (step) => {
    switch (step) {
      case 0:
        return ['nom', 'zoneGeographique'];
      case 1:
        return ['posteRecherche', 'languesParlees'];
      case 2:
        return ['profilsParJour', 'messagesParJour', 'joursRafraichissement'];
      case 3:
        return ['Template_message', 'relances'];
      case 4:
        if (!formData.coldEmail) return [];
        const fields = ['coldDelayAfterFollowUp'];
        // Si mode création auto ou campagne sélectionnée, valider la séquence
        if (formData.coldEmailMode) {
          fields.push('emailSequence');
        }
        return fields;
      default:
        return [];
    }
  };

  useEffect(() => {
    const getUserFromStorage = () => {
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          setCurrentUser(user);
          setFormData(prev => ({
            ...prev,
            Users: user.id
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


  const validateCurrentStep = () => {
    const fieldsToValidate = getFieldsForStep(currentStep);
    const currentErrors = {};
    let isValid = true;

    fieldsToValidate.forEach(fieldName => {
      const value = formData[fieldName];
      const error = validateField(fieldName, value);

      if (error) {
        currentErrors[fieldName] = { message: error };
        isValid = false;
      }
    });

    setStepValidationErrors(currentErrors);
    return isValid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    setValue(name, value, { shouldValidate: true });

    if (stepValidationErrors[name]) {
      const newErrors = { ...stepValidationErrors };
      delete newErrors[name];
      setStepValidationErrors(newErrors);
    }
  };

  const handleJourToggle = (jour) => {
    const nouveauxJours = formData.joursRafraichissement.includes(jour)
      ? formData.joursRafraichissement.filter(j => j !== jour)
      : [...formData.joursRafraichissement, jour];

    setFormData(prev => ({ ...prev, joursRafraichissement: nouveauxJours }));

    if (stepValidationErrors.joursRafraichissement) {
      const newErrors = { ...stepValidationErrors };
      delete newErrors.joursRafraichissement;
      setStepValidationErrors(newErrors);
    }
  };

  const appliquerPlanningPredefini = (planning) => {
    setFormData(prev => ({ ...prev, joursRafraichissement: planning.jours }));

    if (stepValidationErrors.joursRafraichissement) {
      const newErrors = { ...stepValidationErrors };
      delete newErrors.joursRafraichissement;
      setStepValidationErrors(newErrors);
    }
  };


  const connectEmelia = async (apiKey) => {
    setEmeliaLoading(true);
    try {
      // Tester la connexion
      const testResult = await emeliaService.testConnection(apiKey);

      if (testResult.success) {
        // Stocker l'API key en mémoire (pour cette session uniquement)
        setEmeliaApiKey(apiKey);
        setEmeliaConnected(true);
        toastify.success("Compte Emelia connecté avec succès");

        // Charger automatiquement les campagnes
        fetchEmeliaCampaigns(apiKey);
      } else {
        toastify.error("Erreur: " + (testResult.error || "Connexion impossible"));
      }
    } catch (error) {
      console.error("Erreur connexion Emelia:", error);
      toastify.error("Impossible de se connecter à Emelia");
    } finally {
      setEmeliaLoading(false);
    }
  };

  // 🔄 NOUVELLE VERSION - Récupération des campagnes
  const fetchEmeliaCampaigns = async (apiKey = emeliaApiKey) => {
    if (!apiKey) {
      toastify.error("API Key manquante");
      return;
    }

    setEmeliaLoading(true);
    try {
      const result = await emeliaService.getCampaigns(apiKey);
      console.log("resultat", result);

      if (result.success) {

        console.log("eto e");

        // Adapter selon la structure exacte de la réponse Emelia
        // Si c'est un tableau direct: setEmeliaCampaigns(result.campaigns)
        // Si c'est dans result.campaigns.data: setEmeliaCampaigns(result.campaigns.data)
        let campaigns = result.campaigns.campaigns;
        console.log("campagnes", campaigns);

        setEmeliaCampaigns(campaigns || []);

        if (campaigns.length === 0) {
          toastify.info("Aucune campagne trouvée dans votre compte Emelia");
        } else {
          toastify.success(`${campaigns.length} campagne(s) chargée(s)`);
        }
      } else {
        toastify.error("Erreur: " + result.error);
        setEmeliaCampaigns([]);
      }
    } catch (error) {
      console.error("Erreur récupération campagnes:", error);
      toastify.error("Impossible de récupérer les campagnes");
      setEmeliaCampaigns([]);
    } finally {
      setEmeliaLoading(false);
    }
  };

  // 🔄 MISE À JOUR - Déconnexion
  const disconnectEmelia = () => {
    setEmeliaConnected(false);
    setEmeliaCampaigns([]);
    setEmeliaApiKey(""); // Effacer l'API key de la mémoire
    setFormData(prev => ({
      ...prev,
      coldEmail: false,
      coldDelayAfterFollowUp: "",
      coldEmailMode: "",
      coldCampaignIdEmelia: ""
    }));
    toastify.info("Compte Emelia déconnecté");
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const relancesIncompletes = formData.relances.filter(r =>
        !r.joursApres ||
        !r.instruction ||
        r.instruction.trim().length < 10
      );

      if (relancesIncompletes.length > 0) {
        toastify.error(`${relancesIncompletes.length} relance(s) incomplète(s). Veuillez remplir tous les champs.`);
        setIsSubmitting(false);
        return;
      }

      const relancesClean = formData.relances
        .map(r => ({
          joursApres: parseInt(r.joursApres),
          instruction: r.instruction.trim()
        }))
        .sort((a, b) => a.joursApres - b.joursApres);

      console.log('Relances à enregistrer:', relancesClean);

      const campagneData = {
        "Nom de la campagne": formData.nom,
        "Poste recherché": formData.posteRecherche,
        "Zone géographique": formData.zoneGeographique,
        "Seniorite": formData.seniorite,
        "Taille_entreprise": formData.tailleEntreprise,
        "Langues parlées": formData.languesParlees,
        "Secteurs souhaités": formData.secteursSOuhaites || "",
        "Contacts": formData.contacts,
        "Statut": formData.statut,
        "Template_message": formData.Template_message,
        "Profils/jour": parseInt(formData.profilsParJour),
        "Messages/jour": parseInt(formData.messagesParJour),
        "Jours_enrichissement": formData.joursRafraichissement,
        "Statut d'enrichissement": "En attente",
        "Relances": JSON.stringify(relancesClean),
        // 🆕 COLD EMAIL
        "ColdEmail": formData.coldEmail,
        "coldDelayAfterFollowUp": formData.coldEmail ? parseInt(formData.coldDelayAfterFollowUp) : null,
        "coldCampaignIdEmelia": formData.coldCampaignIdEmelia || "",
        "ColdEmail": formData.coldEmail,
        "coldDelayAfterFollowUp": formData.coldEmail ? parseInt(formData.coldDelayAfterFollowUp) : null,
        "coldCampaignIdEmelia": formData.coldCampaignIdEmelia || "",
        "emeliaTimezone": formData.emeliaTimezone || "",
        "emeliaMaxNewPerDay": formData.emeliaMaxNewPerDay ? parseInt(formData.emeliaMaxNewPerDay) : null,
        "emeliaDailyLimit": formData.emeliaDailyLimit ? parseInt(formData.emeliaDailyLimit) : null,
        "emeliaBcc": formData.emeliaBcc || "",
        "emeliaSendingDays": formData.emeliaSendingDays || [],
        "emeliaSendingTimeStart": formData.emeliaSendingTimeStart || "",
        "emeliaSendingTimeEnd": formData.emeliaSendingTimeEnd || "",
        "emeliaStopIfReply": formData.emeliaStopIfReply,
        "emeliaStopIfClick": formData.emeliaStopIfClick,
        "emeliaStopIfOpen": formData.emeliaStopIfOpen,
        "emeliaAddToBlacklistIfUnsubscribed": formData.emeliaAddToBlacklistIfUnsubscribed,
        "emeliaTrackOpens": formData.emeliaTrackOpens,
        "emeliaTrackClicks": formData.emeliaTrackClicks,
        // 🆕 Séquence d'emails (format Emelia)
        "emailSequence": formData.coldEmail ? JSON.stringify(
          formData.emailSequence.map(step => ({
            delay: {
              amount: step.delay.amount,
              unit: step.delay.unit
            },
            versions: [
              {
                subject: step.subject,
                disabled: step.disabled,
                message: step.message,
                rawHtml: step.rawHtml,
                attachments: step.attachments || []
              }
            ]
          }))
        ) : null,
        "Users": [formData.Users]
      };

      console.log('Données campagne à envoyer:', campagneData);

      const response = await createCampagne(campagneData);
      toastify.success(response.message || "Campagne créée avec succès");

      reset();
      setFormData({
        nom: "",
        posteRecherche: "",
        zoneGeographique: "",
        seniorite: "",
        tailleEntreprise: "",
        languesParlees: "",
        secteursSOuhaites: "",
        contacts: "",
        statut: "En attente",
        Template_message: "",
        profilsParJour: "",
        messagesParJour: "",
        joursRafraichissement: [],
        relances: [{
          id: Date.now(),
          joursApres: "",
          instruction: ""
        }],
        Users: formData.Users
      });
      setCurrentStep(0);
      setStepValidationErrors({});

      setTimeout(() => {
        navigate(`/dashboard/campagne`);
      }, 2000);
    } catch (error) {
      console.error("Erreur lors de la création:", error);
      toastify.error("Une erreur s'est produite");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextStep = () => {
    const isValid = validateCurrentStep();
    if (isValid) {
      setCurrentStep(Math.min(steps.length - 1, currentStep + 1));
    } else {
      toastify.error("Veuillez corriger les erreurs avant de continuer");
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(Math.max(0, currentStep - 1));
    setStepValidationErrors({});
  };

  const Tooltip = ({ children, content }) => (
    <div className="group relative inline-block">
      {children}
      <div className="invisible group-hover:visible absolute z-10 w-64 p-2 mt-2 text-sm bg-gray-800 text-white rounded-lg shadow-lg -translate-x-1/2 left-1/2">
        {content}
      </div>
    </div>
  );

  const StepIndicator = () => (
    <div className="flex justify-between mb-8">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;

        return (
          <div key={step.id} className="flex flex-col items-center flex-1">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isActive ? 'bg-blue-600 text-white' :
              isCompleted ? 'bg-green-600 text-white' :
                'bg-gray-300 text-gray-600'
              }`}>
              {isCompleted ? <Check size={16} /> : <Icon size={16} />}
            </div>
            <span className={`text-sm mt-2 text-center ${isActive ? 'text-blue-600 font-semibold' : 'text-gray-600'}`}>
              {step.title}
            </span>
          </div>
        );
      })}
    </div>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <Step0GeneralInfo
          formData={formData}
          handleChange={handleChange}
          stepValidationErrors={stepValidationErrors}
        />;

      case 1:
        return <Step1CriteresPro
          formData={formData}
          handleChange={handleChange}
          stepValidationErrors={stepValidationErrors}
        />;


      case 2:
        return <Step2Planning
          formData={formData}
          handleChange={handleChange}
          stepValidationErrors={stepValidationErrors}
          handleJourToggle={handleJourToggle}
          appliquerPlanningPredefini={appliquerPlanningPredefini}
        />;


      case 3:
        return <Step3Messages
          formData={formData}
          handleChange={handleChange}
          stepValidationErrors={stepValidationErrors}
          handleJourToggle={handleJourToggle}
          appliquerPlanningPredefini={appliquerPlanningPredefini}
          supprimerRelance={supprimerRelance}
          modifierRelance={modifierRelance}
          ajouterRelance={ajouterRelance}
          carteSelectionnee={carteSelectionnee}
          setCarteSelectionnee={setCarteSelectionnee}
          getTemplatesSuggeres={getTemplatesSuggeres}
          setFormData={setFormData}
        />;


      case 4:
        return <Step4ColdEmail
          formData={formData}
          setFormData={setFormData}
          stepValidationErrors={stepValidationErrors}
          emailStepSelected={emailStepSelected}
          setEmailStepSelected={setEmailStepSelected}
          emeliaConnected={emeliaConnected}
          emeliaLoading={emeliaLoading}
          connectEmelia={connectEmelia}
          emeliaCampaigns={emeliaCampaigns}
        />;

      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark bg-gray-900' : 'bg-gradient-to-br from-bleu-fonce/90 to-noir-absolu/80'}`}>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white dark:text-white">
            Créer une Campagne
          </h1>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg bg-gradient-to-r from-blackcore-rouge via-blue-500 to-cyan-500
            hover:from-cyan-500 hover:via-blue-500 hover:to-blackcore-rouge
            transition-all duration-500 shadow-lg hover:shadow-2xl hover:shadow-blackcore-rouge/50
            disabled:bg-gray-400 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-bleu-fonce/90 to-noir-absolu/80 dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <StepIndicator />

            <FormProvider {...methods}>
              <div>
                <div className="mb-8">
                  {renderStep()}
                </div>

                <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    disabled={currentStep === 0}
                    className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Précédent
                  </button>

                  {currentStep < steps.length - 1 ? (
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="px-6 py-3  bg-gradient-to-r from-blackcore-rouge rounded-lg via-blue-500 to-cyan-500
            hover:from-cyan-500 hover:via-blue-500 hover:to-blackcore-rouge
            transition-all duration-500 shadow-lg hover:shadow-2xl hover:shadow-blackcore-rouge/50
            disabled:bg-gray-400 disabled:cursor-not-allowed disabled:shadow-none "
                    >
                      Suivant
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSubmit(onSubmit)()}
                      disabled={isSubmitting}
                      className="flex items-center rounded-lg  gap-2 px-6 py-3 bg-gradient-to-r from-blackcore-rouge via-blue-500 to-cyan-500
            hover:from-cyan-500 hover:via-blue-500 hover:to-blackcore-rouge
            transition-all duration-500 shadow-lg hover:shadow-2xl hover:shadow-blackcore-rouge/50
            disabled:bg-gray-400 disabled:cursor-not-allowed disabled:shadow-none"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Création...
                        </>
                      ) : (
                        <>
                          <Check size={16} />
                          Créer la campagne
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </FormProvider>
          </div>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
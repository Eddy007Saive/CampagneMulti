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
import { emeliaService } from "@/services/Emelia";

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
    coldCampaignIdEmelia: ""
  });

  const steps = [
    { id: 0, title: "Informations générales", icon: Users },
    { id: 1, title: "Critères professionnels", icon: Building },
    { id: 2, title: "Planning et fréquence", icon: Calendar },
    { id: 3, title: "Message et relances", icon: MessageSquare },
    { id: 4, title: "Cold Email (optionnel)", icon: MessageSquare } // 🆕 NOUVEAU
  ];

  const joursOptions = [
    { id: 'Lundi', label: 'Lundi', short: 'L' },
    { id: 'Mardi', label: 'Mardi', short: 'M' },
    { id: 'Mercredi', label: 'Mercredi', short: 'M' },
    { id: 'Jeudi', label: 'Jeudi', short: 'J' },
    { id: 'Vendredi', label: 'Vendredi', short: 'V' },
    { id: 'Samedi', label: 'Samedi', short: 'S' },
    { id: 'Dimanche', label: 'Dimanche', short: 'D' }
  ];

  const planningsPredefinis = [
    {
      nom: "Jours ouvrables",
      jours: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'],
      description: "Du Lundi au Vendredi"
    },
    {
      nom: "Semaine complète",
      jours: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'],
      description: "Tous les jours de la semaine"
    },
    {
      nom: "Début de semaine",
      jours: ['Lundi', 'Mardi', 'Mercredi'],
      description: "Lundi, Mardi et Mercredi"
    },
    {
      nom: "Fin de semaine",
      jours: ['Jeudi', 'Vendredi'],
      description: "Jeudi et Vendredi"
    }
  ];

  const langues = [
    "Français", "Anglais", "Espagnol", "Allemand", "Italien",
    "Portugais", "Russe", "Chinois", "Japonais", "Arabe",
    "Néerlandais", "Suédois", "Norvégien", "Danois", "Polonais"
  ];

  const secteurs = [
    "Informatique", "Finance", "Marketing", "Ressources Humaines",
    "Vente", "Ingénierie", "Santé", "Éducation", "Juridique",
    "Logistique", "Construction", "Automobile", "Aéronautique",
    "Pharmaceutique", "Agroalimentaire", "Textile", "Énergie",
    "Télécommunications", "Média", "Tourisme", "Immobilier",
    "Consulting", "Design", "Architecture", "Recherche & Développement"
  ];

  const postesFrequents = [
    "Développeur Full Stack",
    "Chef de projet",
    "Directeur Administratif et Financier",
    "Responsable Marketing",
    "Ingénieur DevOps"
  ];

  const messageTemplates = [
    {
      name: "Approche Performance B2B",
      content: "Bonjour {Prénom}, en tant que {Titre du poste du prospect}, la performance de {Nom du département ou de l'équipe} est sans doute une de vos priorités. J'ai remarqué que votre entreprise, {Nom de l'entreprise du prospect}, opère dans un marché très compétitif, et je pense que notre solution pour {Problème spécifique de l'industrie} pourrait vous apporter un avantage concurrentiel. Je serais ravi de vous montrer, lors d'un appel rapide, comment {Nom de votre solution} a permis à des entreprises similaires d'augmenter leur {Indicateur de performance} de {Pourcentage}."
    },
    {
      name: "Approche Étude de Cas B2B",
      content: "Bonjour {Prénom}, nous avons récemment aidé {Nom de l'entreprise cliente}, une entreprise de votre secteur, à résoudre le problème de {Problème client}. Grâce à notre collaboration, ils ont pu {Résultat mesurable : exemple, réduire les coûts, augmenter l'efficacité}. Je serais curieux de savoir si vous rencontrez des défis similaires et si une solution comme la nôtre pourrait vous être utile. Seriez-vous disponible pour un court échange la semaine prochaine ?"
    },
    {
      name: "Approche Décontractée B2B",
      content: "Salut {Prénom}, en faisant quelques recherches sur le secteur, je suis tombé sur le profil de {Nom de l'entreprise du prospect} et j'ai été impressionné par {Mentionner une réussite, une actualité ou un projet de l'entreprise}. Nous avons un outil qui aide spécifiquement les entreprises comme la vôtre à {Bénéfice clé, par exemple : 'à mieux gérer leurs données clients' ou 'à optimiser leur supply chain'}. Cela vous dirait d'en discuter 10 minutes pour voir si on pourrait vous apporter quelque chose ?"
    },
    {
      name: "Approche Événement B2B",
      content: "Bonjour {Prénom}, je vous écris suite à {Nom de l'événement, du webinar, de la conférence} ou {un article que vous avez publié sur LinkedIn}. Votre point de vue sur {Sujet de la publication/conférence} est très pertinent, et je partage tout à fait votre opinion sur {Point précis}. C'est exactement ce que notre solution {Nom de votre solution} vise à améliorer pour nos clients. Auriez-vous un moment la semaine prochaine pour échanger sur le sujet ?"
    },
    {
      name: "Template Décontracté",
      content: "Salut {Prénom} ! Je suis tombé sur le profil de {Nom de l'entreprise du prospect} et je pense qu'on pourrait avoir une opportunité intéressante pour vous. Vous auriez 15 minutes pour en discuter ?"
    }
  ];

  const templatesRelanceParTiming = {
    court: [
      {
        name: "Rappel Simple",
        content: "Bonjour {Prénom}, je vous écris pour savoir si vous aviez eu l'occasion de voir mon précédent email concernant {Nom de votre solution}. Je serais ravi de planifier un court échange si le sujet vous intéresse."
      },
      {
        name: "Question Directe",
        content: "Bonjour {Prénom}, juste un petit 'up' sur mon dernier message. Vous rencontrez des défis avec {Problème commun de l'industrie} en ce moment ?"
      },
      {
        name: "Contextualisée",
        content: "Bonjour {Prénom}, je me permets de vous renvoyer mon dernier email. Je suis convaincu que notre solution pourrait faire une vraie différence pour {Nom de l'entreprise du prospect} en termes de {Bénéfice clé}."
      },
      {
        name: "Aide",
        content: "Bonjour {Prénom}, en relisant votre profil, je me suis demandé si vous aviez besoin d'aide pour {Défi spécifique}. Si c'est le cas, mon email précédent pourrait vous être utile. N'hésitez pas."
      }
    ],
    moyen: [
      {
        name: "Ressource Utile",
        content: "Bonjour {Prénom}, je ne veux pas être insistant, mais j'ai pensé que vous pourriez trouver cet article de blog sur {Sujet pertinent} intéressant. Il aborde les défis que nous avons évoqués dans mon premier email. Cela pourrait vous donner une bonne idée de ce que nous faisons."
      },
      {
        name: "Webinar",
        content: "Bonjour {Prénom}, j'espère que tout va bien. Pour faire suite à notre échange manqué, nous organisons un webinar sur {Sujet du webinar}. Ce serait une excellente occasion de voir comment nous aidons des entreprises comme la vôtre."
      },
      {
        name: "Étude de Cas",
        content: "Bonjour {Prénom}, en me basant sur votre profil, j'ai trouvé une étude de cas qui pourrait vous intéresser. Elle détaille comment nous avons aidé {Nom de l'entreprise cliente} à {Résultat mesurable}. Laissez-moi savoir si vous souhaitez la consulter."
      },
      {
        name: "Vidéo Demo",
        content: "Bonjour {Prénom}, si vous êtes trop occupé pour un appel, j'ai préparé une courte vidéo de démonstration de {Nom de votre solution} qui vous montre les fonctionnalités les plus pertinentes pour votre secteur. Vous pouvez la regarder quand vous le souhaitez."
      }
    ],
    long: [
      {
        name: "Clôture Polie",
        content: "Bonjour {Prénom}, je n'ai pas eu de retour de votre part et je ne veux pas que mes messages deviennent des spams dans votre boîte de réception. Je vais clore ce dossier de mon côté, mais si l'idée d'améliorer {Bénéfice Clé} chez {Nom de l'entreprise du prospect} vous intéresse toujours, n'hésitez pas à me répondre."
      },
      {
        name: "Adieu Amical",
        content: "Bonjour {Prénom}, au cas où vous ne seriez plus intéressé par {Sujet du premier email}, je vous laisse. Si votre situation change, n'hésitez pas à me faire signe. Bon courage dans votre travail !"
      },
      {
        name: "Valeur Finale",
        content: "Bonjour {Prénom}, j'ai bien compris que le moment n'était pas idéal. Avant de refermer ce dossier, je voulais juste vous laisser une dernière ressource qui pourrait vous être utile pour la suite : {Lien vers un article, un guide...}. Je reste à votre disposition si vous avez des questions."
      },
      {
        name: "Question Directe",
        content: "Bonjour {Prénom}, est-ce que mes messages sont arrivés à un mauvais moment, ou est-ce que ce sujet n'est tout simplement pas pertinent pour vous ? Un simple 'oui' ou 'non' me suffit, et je vous laisserai tranquille."
      },
      {
        name: "Ultime Personnalisée",
        content: "Bonjour {Prénom}, j'imagine que votre boîte de réception est pleine. Je voulais juste prendre une dernière chance de vous contacter car je crois vraiment que notre solution peut aider {Nom de l'entreprise du prospect} à {Bénéfice clé}. Si cela n'est pas le cas, je vous souhaite une excellente semaine."
      }
    ]
  };

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
      } else if (!value || value.toString().trim() === "") {
        return `Ce champ est requis`;
      }
    }

    if (schema.minLength && value && value.length < schema.minLength) {
      return `Minimum ${schema.minLength} caractères requis`;
    }

    if (schema.min !== undefined && value !== "" && parseInt(value) < schema.min) {
      return `La valeur doit être supérieure ou égale à ${schema.min}`;
    }

    if (schema.max !== undefined && value !== "" && parseInt(value) > schema.max) {
      return `La valeur doit être inférieure ou égale à ${schema.max}`;
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
      case 4: // 🆕 NOUVEAU
        return formData.coldEmail ? ['coldDelayAfterFollowUp'] : [];
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

  useEffect(() => {
    const checkEmeliaConnection = async () => {
      try {
        const response = await fetch('/api/users/emelia-status');
        const data = await response.json();
        if (data.connected) {
          setEmeliaConnected(true);
        }
      } catch (error) {
        console.error("Erreur vérification Emelia:", error);
      }
    };

    if (currentUser) {
      checkEmeliaConnection();
    }
  }, [currentUser]);

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

  const generateLinkedInQuery = () => {
    const { posteRecherche, zoneGeographique } = formData;
    let query = "";

    if (posteRecherche) {
      query += `"${posteRecherche}"`;
    }

    if (zoneGeographique) {
      query += query ? ` AND "${zoneGeographique}"` : `"${zoneGeographique}"`;
    }

    return query || "Aucune requête générée";
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
      console.log("resultat",result);
      
      if (result.success) {

        console.log("eto e");
        
        // Adapter selon la structure exacte de la réponse Emelia
        // Si c'est un tableau direct: setEmeliaCampaigns(result.campaigns)
        // Si c'est dans result.campaigns.data: setEmeliaCampaigns(result.campaigns.data)
        let campaigns=result.campaigns.campaigns;
        console.log("campagnes",campaigns);
        
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
        return (
          <div className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="flex items-center mb-2 text-sm font-medium text-white dark:text-gray-300">
                  <Users size={16} className="mr-2" />
                  Nom de la campagne *
                  <Tooltip content="Donnez un nom descriptif à votre campagne pour la retrouver facilement">
                    <HelpCircle size={14} className="ml-2 text-gray-400 cursor-help" />
                  </Tooltip>
                </label>
                <input
                  value={formData.nom}
                  name="nom"
                  type="text"
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${stepValidationErrors.nom ? 'border-red-500' : 'border-gray-300'
                    }`}
                  onChange={handleChange}
                  placeholder="Ex: Recrutement Développeur Senior - Mars 2025"
                />
                {stepValidationErrors.nom && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle size={12} className="mr-1" />
                    {stepValidationErrors.nom.message}
                  </p>
                )}
              </div>

              <div>
                <label className="flex items-center mb-2 text-sm font-medium text-white dark:text-gray-300">
                  <MapPin size={16} className="mr-2" />
                  Zone géographique *
                </label>
                <input
                  value={formData.zoneGeographique}
                  name="zoneGeographique"
                  type="text"
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${stepValidationErrors.zoneGeographique ? 'border-red-500' : 'border-gray-300'
                    }`}
                  onChange={handleChange}
                  placeholder="Paris, France"
                />
                {stepValidationErrors.zoneGeographique && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle size={12} className="mr-1" />
                    {stepValidationErrors.zoneGeographique.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="flex items-center mb-2 text-sm font-medium text-white dark:text-gray-300">
                <Building size={16} className="mr-2" />
                Cible recherché *
                <Tooltip content="Utilisez des opérateurs LinkedIn : OR pour plusieurs options, AND pour combiner, NOT pour exclure. Ex: 'Développeur OR Developer'">
                  <HelpCircle size={14} className="ml-2 text-gray-400 cursor-help" />
                </Tooltip>
              </label>
              <div className="space-y-2">
                <input
                  list="postes-list"
                  value={formData.posteRecherche}
                  name="posteRecherche"
                  type="text"
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${stepValidationErrors.posteRecherche ? 'border-red-500' : 'border-gray-300'
                    }`}
                  onChange={handleChange}
                  placeholder="Ex: Développeur OR Developer AND Senior"
                />
                <datalist id="postes-list">
                  {postesFrequents.map((poste) => (
                    <option key={poste} value={poste} />
                  ))}
                </datalist>

                {formData.posteRecherche && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blue-700 dark:text-blue-300">
                        Requête LinkedIn: {generateLinkedInQuery()}
                      </span>
                      <Copy size={16} className="text-blue-600 cursor-pointer hover:text-blue-800" />
                    </div>
                  </div>
                )}
              </div>
              {stepValidationErrors.posteRecherche && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <AlertCircle size={12} className="mr-1" />
                  {stepValidationErrors.posteRecherche.message}
                </p>
              )}
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="flex items-center mb-2 text-sm font-medium text-white dark:text-gray-300">
                  <Users size={16} className="mr-2" />
                  Séniorité (optionnel)
                </label>
                <select
                  name="seniorite"
                  multiple
                  value={formData.seniorite || []}
                  onChange={(e) => {
                    const selectedValues = Array.from(e.target.selectedOptions, option => option.value);
                    handleChange({
                      target: {
                        name: 'seniorite',
                        value: selectedValues
                      }
                    });
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white min-h-[120px]"
                >
                  <option value="Owner">Owner</option>
                  <option value="C-Level">C-Level</option>
                  <option value="VP">VP</option>
                  <option value="Director">Director</option>
                  <option value="Head">Head</option>
                </select>
                <p className="text-xs text-gray-400 mt-1">Maintenez Ctrl/Cmd pour sélectionner plusieurs options</p>
              </div>

              <div>
                <label className="flex items-center mb-2 text-sm font-medium text-white dark:text-gray-300">
                  <Building size={16} className="mr-2" />
                  Taille de l'entreprise (optionnel)
                </label>
                <select
                  name="tailleEntreprise"
                  multiple
                  value={formData.tailleEntreprise || []}
                  onChange={(e) => {
                    const selectedValues = Array.from(e.target.selectedOptions, option => option.value);
                    handleChange({
                      target: {
                        name: 'tailleEntreprise',
                        value: selectedValues
                      }
                    });
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white min-h-[120px]"
                >
                  <option value="1-10">1–10 employés</option>
                  <option value="11-50">11–50 employés</option>
                  <option value="51-200">51–200 employés</option>
                  <option value="201-500">201–500 employés</option>
                  <option value="501-1000">501–1k employés</option>
                  <option value="1000+">1k+ employés</option>
                </select>
                <p className="text-xs text-gray-400 mt-1">Maintenez Ctrl/Cmd pour sélectionner plusieurs options</p>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="flex items-center mb-2 text-sm font-medium text-white dark:text-gray-300">
                  <Languages size={16} className="mr-2" />
                  Langues parlées *
                </label>
                <input
                  list="langues-list"
                  name="languesParlees"
                  value={formData.languesParlees}
                  onChange={handleChange}
                  placeholder="Sélectionner ou saisir une langue"
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${stepValidationErrors.languesParlees ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
                <datalist id="langues-list">
                  {langues.map((langue) => (
                    <option key={langue} value={langue} />
                  ))}
                </datalist>
                {stepValidationErrors.languesParlees && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle size={12} className="mr-1" />
                    {stepValidationErrors.languesParlees.message}
                  </p>
                )}
              </div>

              <div>
                <label className="flex items-center mb-2 text-sm font-medium text-white dark:text-gray-300">
                  <Building size={16} className="mr-2" />
                  Secteurs souhaités (optionnel)
                </label>
                <input
                  list="secteurs-list"
                  name="secteursSOuhaites"
                  value={formData.secteursSOuhaites}
                  onChange={handleChange}
                  placeholder="Sélectionner ou saisir un secteur"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <datalist id="secteurs-list">
                  {secteurs.map((secteur) => (
                    <option key={secteur} value={secteur} />
                  ))}
                </datalist>
                <p className="text-xs text-gray-400 mt-1">Ce champ est facultatif</p>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="flex items-center mb-2 text-sm font-medium text-white dark:text-gray-300">
                  <Users size={16} className="mr-2" />
                  Profils à rechercher par jour *
                  <Tooltip content="Nombre de nouveaux profils à identifier quotidiennement (maximum 120)">
                    <HelpCircle size={14} className="ml-2 text-gray-400 cursor-help" />
                  </Tooltip>
                </label>
                <input
                  value={formData.profilsParJour}
                  name="profilsParJour"
                  type="number"
                  min="1"
                  max="120"
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${stepValidationErrors.profilsParJour ? 'border-red-500' : 'border-gray-300'
                    }`}
                  onChange={handleChange}
                  placeholder="Ex: 20"
                />
                {stepValidationErrors.profilsParJour && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle size={12} className="mr-1" />
                    {stepValidationErrors.profilsParJour.message}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">Maximum: 120 profils par jour</p>
              </div>

              <div>
                <label className="flex items-center mb-2 text-sm font-medium text-white dark:text-gray-300">
                  <MessageSquare size={16} className="mr-2" />
                  Messages à envoyer par jour *
                  <Tooltip content="Nombre de messages à envoyer quotidiennement (maximum 40)">
                    <HelpCircle size={14} className="ml-2 text-gray-400 cursor-help" />
                  </Tooltip>
                </label>
                <input
                  value={formData.messagesParJour}
                  name="messagesParJour"
                  type="number"
                  min="1"
                  max="40"
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${stepValidationErrors.messagesParJour ? 'border-red-500' : 'border-gray-300'
                    }`}
                  onChange={handleChange}
                  placeholder="Ex: 15"
                />
                {stepValidationErrors.messagesParJour && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle size={12} className="mr-1" />
                    {stepValidationErrors.messagesParJour.message}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">Maximum: 40 messages par jour</p>
              </div>
            </div>

            <div className="space-y-4">
              <label className="flex items-center mb-2 text-sm font-medium text-white dark:text-gray-300">
                <RefreshCw size={16} className="mr-2" />
                Jours de rafraîchissement *
                <Tooltip content="Sélectionnez les jours où la campagne doit rechercher et envoyer des messages aux profils">
                  <HelpCircle size={14} className="ml-2 text-gray-400 cursor-help" />
                </Tooltip>
              </label>

              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Plannings prédéfinis :</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                  {planningsPredefinis.map((planning) => (
                    <button
                      key={planning.nom}
                      type="button"
                      onClick={() => appliquerPlanningPredefini(planning)}
                      className="p-3 text-left border border-gray-200 dark:border-gray-600 rounded-lg hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 group"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm text-white dark:text-gray-300 group-hover:text-blue-600">
                          {planning.nom}
                        </span>
                        <Clock size={12} className="text-gray-400" />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{planning.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Ou sélectionnez manuellement :</p>
                <div className="grid grid-cols-7 gap-2">
                  {joursOptions.map((jour) => (
                    <button
                      key={jour.id}
                      type="button"
                      onClick={() => handleJourToggle(jour.id)}
                      className={`relative p-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${formData.joursRafraichissement.includes(jour.id)
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-white dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                    >
                      <div className="text-center">
                        <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-sm font-semibold mb-1 ${formData.joursRafraichissement.includes(jour.id)
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                          }`}>
                          {jour.short}
                        </div>
                        <span className="text-xs">{jour.label}</span>
                      </div>
                      {formData.joursRafraichissement.includes(jour.id) && (
                        <div className="absolute -top-1 -right-1">
                          <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                            <Check size={10} className="text-white" />
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {stepValidationErrors.joursRafraichissement && (
                  <p className="text-red-500 text-xs mt-2 flex items-center">
                    <AlertCircle size={12} className="mr-1" />
                    {stepValidationErrors.joursRafraichissement.message}
                  </p>
                )}

                {formData.joursRafraichissement.length > 0 && (
                  <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2">
                      <Check size={16} className="text-green-600" />
                      <span className="text-sm text-green-700 dark:text-green-300">
                        {formData.joursRafraichissement.length} jour{formData.joursRafraichissement.length > 1 ? 's' : ''} sélectionné{formData.joursRafraichissement.length > 1 ? 's' : ''} : {' '}
                        {formData.joursRafraichissement.map(jour =>
                          joursOptions.find(j => j.id === jour)?.label
                        ).join(', ')}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <MessageSquare size={20} className="mr-2" />
                Votre séquence de messages LinkedIn
              </h3>
              <span className="text-sm text-gray-400">
                {formData.relances.length + 1} étape{formData.relances.length > 0 ? 's' : ''} créée{formData.relances.length > 0 ? 's' : ''}
              </span>
            </div>

            {stepValidationErrors.Template_message && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <p className="text-red-700 dark:text-red-300 text-sm flex items-center">
                  <AlertCircle size={16} className="mr-2" />
                  {stepValidationErrors.Template_message.message}
                </p>
              </div>
            )}

            {stepValidationErrors.relances && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <p className="text-red-700 dark:text-red-300 text-sm flex items-center">
                  <AlertCircle size={16} className="mr-2" />
                  {stepValidationErrors.relances.message}
                </p>
              </div>
            )}

            <div className="relative">
              <div className="flex gap-4 overflow-x-auto pb-6 px-2">
                <div className="flex-shrink-0 w-48">
                  <button
                    type="button"
                    onClick={() => setCarteSelectionnee('initial')}
                    className={`w-full relative rounded-lg p-4 transition-all duration-200 shadow-lg cursor-pointer ${carteSelectionnee === 'initial'
                      ? 'bg-gray-800 border-2 border-blue-500'
                      : 'bg-gray-800 border-2 border-gray-700 hover:border-blue-400'
                      }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                        <MessageSquare size={20} className="text-white" />
                      </div>
                      <span className="text-white font-semibold text-sm">Étape 1</span>
                      <span className="text-gray-400 text-xs">Message initial</span>
                    </div>
                    {formData.Template_message && formData.Template_message.length >= 10 && (
                      <div className="mt-2 text-center">
                        <span className="text-xs text-green-400">✓ Configuré</span>
                      </div>
                    )}
                  </button>
                </div>

                {formData.relances.length > 0 && (
                  <div className="flex-shrink-0 flex items-center justify-center">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="w-8 h-0.5 bg-gradient-to-r from-green-500 to-blue-500"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    </div>
                  </div>
                )}

                {formData.relances.map((relance, index) => (
                  <React.Fragment key={relance.id}>
                    <div className="flex-shrink-0 w-48">
                      <button
                        type="button"
                        onClick={() => setCarteSelectionnee(relance.id)}
                        className={`w-full relative rounded-lg p-4 transition-all duration-200 shadow-lg cursor-pointer ${carteSelectionnee === relance.id
                          ? 'bg-gray-800 border-2 border-blue-500'
                          : 'bg-gray-800 border-2 border-gray-700 hover:border-blue-400'
                          }`}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
                            <Clock size={20} className="text-white" />
                          </div>
                          <span className="text-white font-semibold text-sm">Étape {index + 2}</span>
                          <span className="text-gray-400 text-xs">
                            {relance.joursApres ? `Attendre ${relance.joursApres} jour${relance.joursApres > 1 ? 's' : ''}` : 'À configurer'}
                          </span>
                        </div>
                        {relance.joursApres && relance.instruction && relance.instruction.length >= 10 && (
                          <div className="mt-2 text-center">
                            <span className="text-xs text-green-400">✓ Configuré</span>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            supprimerRelance(relance.id);
                            if (carteSelectionnee === relance.id) {
                              setCarteSelectionnee('initial');
                            }
                          }}
                          className="absolute top-2 right-2 p-1 text-red-400 hover:text-red-600 hover:bg-red-900/20 rounded transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </button>
                    </div>

                    {index < formData.relances.length - 1 && (
                      <div className="flex-shrink-0 flex items-center justify-center">
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <div className="w-8 h-0.5 bg-gradient-to-r from-green-500 to-blue-500"></div>
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                ))}

                <div className="flex-shrink-0 w-48">
                  <button
                    type="button"
                    onClick={ajouterRelance}
                    className="w-full h-full min-h-[140px] border-2 border-dashed border-gray-600 rounded-lg hover:border-blue-500 hover:bg-blue-900/10 transition-all flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-blue-400"
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                      <Plus size={20} />
                    </div>
                    <span className="font-medium text-sm">Ajouter</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-8 p-6 bg-gray-800 rounded-lg border-2 border-gray-700">
              {carteSelectionnee === 'initial' ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-white font-semibold flex items-center gap-2">
                      <MessageSquare size={18} className="text-blue-400" />
                      Message initial
                    </h4>
                  </div>

                  <div className="mb-4">
                    <label className="text-xs text-gray-400 mb-2 block">
                      Templates suggérés :
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {messageTemplates.map((template, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, Template_message: template.content }));
                            if (stepValidationErrors.Template_message) {
                              const newErrors = { ...stepValidationErrors };
                              delete newErrors.Template_message;
                              setStepValidationErrors(newErrors);
                            }
                          }}
                          className="px-3 py-1.5 text-xs bg-gray-700 hover:bg-gray-600 rounded transition-colors text-gray-300"
                        >
                          {template.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <textarea
                    value={formData.Template_message}
                    name="Template_message"
                    onChange={handleChange}
                    rows={6}
                    placeholder="Bonjour {Prénom}, j'espère que vous allez bien..."
                    className="w-full bg-gray-900 border border-gray-600 rounded px-4 py-3 text-white focus:border-blue-500 focus:outline-none resize-none placeholder-gray-500"
                  />
                  <div className="text-xs text-gray-500 mt-2">
                    {formData.Template_message?.length || 0} caractères (minimum 10)
                  </div>
                </>
              ) : (
                <>
                  {(() => {
                    const relance = formData.relances.find(r => r.id === carteSelectionnee);
                    const relanceIndex = formData.relances.findIndex(r => r.id === carteSelectionnee);
                    if (!relance) return null;

                    return (
                      <>
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-white font-semibold flex items-center gap-2">
                            <Clock size={18} className="text-purple-400" />
                            Relance {relanceIndex + 1}
                          </h4>
                          <div className="flex items-center gap-2">
                            {relanceIndex > 0 && (
                              <button
                                type="button"
                                onClick={() => deplacerRelance(relanceIndex, 'up')}
                                className="p-1.5 text-gray-400 hover:text-blue-400 transition-colors"
                                title="Déplacer vers le haut"
                              >
                                <MoveUp size={16} />
                              </button>
                            )}
                            {relanceIndex < formData.relances.length - 1 && (
                              <button
                                type="button"
                                onClick={() => deplacerRelance(relanceIndex, 'down')}
                                className="p-1.5 text-gray-400 hover:text-blue-400 transition-colors"
                                title="Déplacer vers le bas"
                              >
                                <MoveDown size={16} />
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="mb-4">
                          <label className="text-xs text-gray-400 mb-2 block">
                            Délai d'attente
                          </label>
                          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-900/30 border border-blue-600 rounded-lg">
                            <Clock size={16} className="text-blue-400" />
                            <span className="text-blue-300">Attendre</span>
                            <input
                              type="number"
                              min="1"
                              value={relance.joursApres}
                              onChange={(e) => modifierRelance(relance.id, 'joursApres', e.target.value)}
                              className="w-16 bg-gray-900 border border-blue-500 rounded text-blue-300 text-center focus:outline-none focus:border-blue-400 px-2 py-1"
                              placeholder="2"
                            />
                            <span className="text-blue-300">jour{relance.joursApres > 1 ? 's' : ''}</span>
                          </div>
                        </div>

                        {relance.joursApres && (
                          <div className="mb-4">
                            <label className="text-xs text-gray-400 mb-2 block">
                              Templates suggérés pour {relance.joursApres} jour{relance.joursApres > 1 ? 's' : ''} :
                            </label>
                            <div className="flex flex-wrap gap-2">
                              {getTemplatesSuggeres(parseInt(relance.joursApres)).map((template, tIndex) => (
                                <button
                                  key={tIndex}
                                  type="button"
                                  onClick={() => modifierRelance(relance.id, 'instruction', template.content)}
                                  className="px-3 py-1.5 text-xs bg-gray-700 hover:bg-gray-600 rounded transition-colors text-gray-300"
                                >
                                  {template.name}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        <textarea
                          value={relance.instruction}
                          onChange={(e) => modifierRelance(relance.id, 'instruction', e.target.value)}
                          rows={6}
                          placeholder="Bonjour {Prénom}, je reviens vers vous..."
                          className="w-full bg-gray-900 border border-gray-600 rounded px-4 py-3 text-white focus:border-blue-500 focus:outline-none resize-none placeholder-gray-500"
                        />
                        <div className="text-xs text-gray-500 mt-2">
                          {relance.instruction?.length || 0} caractères (minimum 10)
                        </div>
                      </>
                    );
                  })()}
                </>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            {/* Toggle Cold Email */}
            <div className="p-6 bg-gray-800 rounded-lg border-2 border-gray-700">
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-3">
                  <MessageSquare size={20} className="text-blue-400" />
                  <div>
                    <span className="text-white font-semibold text-lg">Activer le Cold Email</span>
                    <p className="text-gray-400 text-sm mt-1">
                      Envoyer automatiquement des emails après les relances LinkedIn
                    </p>
                  </div>
                </div>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={formData.coldEmail}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, coldEmail: e.target.checked }));
                      if (!e.target.checked) {
                        setFormData(prev => ({
                          ...prev,
                          coldDelayAfterFollowUp: "",
                          coldEmailMode: "",
                          coldCampaignIdEmelia: ""
                        }));
                      }
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                </div>
              </label>
            </div>

            {/* Configuration Cold Email */}
            {formData.coldEmail && (
              <>
                {/* Délai */}
                <div className="p-6 bg-gray-800 rounded-lg border-2 border-gray-700">
                  <label className="flex items-center mb-3 text-sm font-medium text-white">
                    <Clock size={16} className="mr-2" />
                    Délai après la dernière relance LinkedIn *
                    <Tooltip content="Nombre de jours à attendre après la dernière relance LinkedIn avant d'envoyer le cold email">
                      <HelpCircle size={14} className="ml-2 text-gray-400 cursor-help" />
                    </Tooltip>
                  </label>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400">Attendre</span>
                    <input
                      type="number"
                      min="1"
                      value={formData.coldDelayAfterFollowUp}
                      onChange={(e) => setFormData(prev => ({ ...prev, coldDelayAfterFollowUp: e.target.value }))}
                      className={`w-24 p-3 border rounded-lg text-center focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white ${stepValidationErrors.coldDelayAfterFollowUp ? 'border-red-500' : 'border-gray-600'
                        }`}
                      placeholder="3"
                    />
                    <span className="text-gray-400">jour{formData.coldDelayAfterFollowUp > 1 ? 's' : ''}</span>
                  </div>
                  {stepValidationErrors.coldDelayAfterFollowUp && (
                    <p className="text-red-500 text-xs mt-2 flex items-center">
                      <AlertCircle size={12} className="mr-1" />
                      {stepValidationErrors.coldDelayAfterFollowUp.message}
                    </p>
                  )}
                </div>

                {/* Connexion Emelia */}
                <div className="p-6 bg-gray-800 rounded-lg border-2 border-gray-700">
                  <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Building size={18} className="text-purple-400" />
                    Connexion Emelia
                  </h4>

                  {!emeliaConnected ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-yellow-900/20 border border-yellow-600 rounded-lg">
                        <p className="text-yellow-300 text-sm flex items-center gap-2">
                          <AlertCircle size={16} />
                          Vous devez connecter votre compte Emelia pour continuer
                        </p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400 mb-2 block">API Key Emelia</label>
                        <div className="flex gap-2">
                          <input
                            type="password"
                            id="emeliaApiKey"
                            placeholder="eme_••••••••••••••••••••"
                            className="flex-1 p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const apiKey = document.getElementById('emeliaApiKey').value;
                              if (apiKey) connectEmelia(apiKey);
                              else toastify.error("Veuillez saisir votre API key");
                            }}
                            disabled={emeliaLoading}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                          >
                            {emeliaLoading ? (
                              <>
                                <Loader2 size={16} className="animate-spin" />
                                Connexion...
                              </>
                            ) : (
                              'Connecter'
                            )}
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Trouvez votre API key dans les paramètres de votre compte Emelia
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-4 bg-green-900/20 border border-green-600 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Check size={16} className="text-green-400" />
                          <span className="text-green-300 text-sm">Compte Emelia connecté</span>
                        </div>
                        <button
                          type="button"
                          onClick={disconnectEmelia}
                          className="text-red-400 hover:text-red-300 text-sm underline"
                        >
                          Déconnecter
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Mode de campagne */}
                {emeliaConnected && (
                  <div className="p-6 bg-gray-800 rounded-lg border-2 border-gray-700">
                    <h4 className="text-white font-semibold mb-4">Mode de campagne</h4>

                    <div className="space-y-3">
                      {/* Option: Campagne existante */}
                      <label className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${formData.coldEmailMode === 'existing'
                        ? 'border-blue-500 bg-blue-900/20'
                        : 'border-gray-600 hover:border-gray-500'
                        }`}>
                        <input
                          type="radio"
                          name="coldEmailMode"
                          value="existing"
                          checked={formData.coldEmailMode === 'existing'}
                          onChange={(e) => {
                            setFormData(prev => ({ ...prev, coldEmailMode: e.target.value }));
                            if (emeliaCampaigns.length === 0) fetchEmeliaCampaigns();
                          }}
                          className="mt-1 mr-3"
                        />
                        <div className="flex-1">
                          <span className="text-white font-medium">Lier à une campagne existante</span>
                          <p className="text-gray-400 text-sm mt-1">
                            Choisir une campagne Emelia déjà créée
                          </p>
                        </div>
                      </label>

                      {/* Sélection campagne */}
                      {/* Sélection campagne */}
                      {formData.coldEmailMode === 'existing' && (
                        <div className="ml-10 mt-3">
                          {emeliaLoading ? (
                            <div className="flex items-center gap-2 text-gray-400">
                              <Loader2 size={16} className="animate-spin" />
                              Chargement des campagnes...
                            </div>
                          ) : emeliaCampaigns.length > 0 ? (
                            <>
                              <select
                                value={formData.coldCampaignIdEmelia}
                                onChange={(e) => setFormData(prev => ({ ...prev, coldCampaignIdEmelia: e.target.value }))}
                                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="">-- Sélectionner une campagne --</option>
                                {emeliaCampaigns.map(camp => (
                                  <option key={camp._id || camp.id} value={camp._id || camp.id}>
                                    {camp.name} {camp.emailsCount ? `(${camp.emailsCount} emails)` : ''}
                                  </option>
                                ))}
                              </select>

                              {/* 🆕 Preview de la campagne sélectionnée */}
                              {formData.coldCampaignIdEmelia && (
                                <div className="mt-3 p-3 bg-blue-900/20 border border-blue-600 rounded-lg">
                                  {(() => {
                                    const selected = emeliaCampaigns.find(c =>
                                      (c._id || c.id) === formData.coldCampaignIdEmelia
                                    );
                                    return selected ? (
                                      <div className="text-sm">
                                        <p className="text-blue-300 font-medium mb-1">✓ Campagne sélectionnée :</p>
                                        <p className="text-gray-300">{selected.name}</p>
                                        {selected.emailsCount && (
                                          <p className="text-gray-400 text-xs mt-1">
                                            {selected.emailsCount} emails •
                                            {selected.status ? ` ${selected.status}` : ''}
                                          </p>
                                        )}
                                      </div>
                                    ) : null;
                                  })()}
                                </div>
                              )}

                              {/* Bouton rafraîchir */}
                              <button
                                type="button"
                                onClick={() => fetchEmeliaCampaigns()}
                                disabled={emeliaLoading}
                                className="mt-2 text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1 transition-colors disabled:opacity-50"
                              >
                                <RefreshCw size={14} className={emeliaLoading ? 'animate-spin' : ''} />
                                Rafraîchir la liste
                              </button>
                            </>
                          ) : (
                            <div className="space-y-2">
                              <div className="p-3 bg-yellow-900/20 border border-yellow-600 rounded-lg text-yellow-300 text-sm">
                                Aucune campagne trouvée dans votre compte Emelia.
                              </div>
                              <button
                                type="button"
                                onClick={() => fetchEmeliaCampaigns()}
                                disabled={emeliaLoading}
                                className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1 transition-colors disabled:opacity-50"
                              >
                                <RefreshCw size={14} className={emeliaLoading ? 'animate-spin' : ''} />
                                Réessayer
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Option: Création automatique */}
                      <label className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${formData.coldEmailMode === 'auto'
                        ? 'border-blue-500 bg-blue-900/20'
                        : 'border-gray-600 hover:border-gray-500'
                        }`}>
                        <input
                          type="radio"
                          name="coldEmailMode"
                          value="auto"
                          checked={formData.coldEmailMode === 'auto'}
                          onChange={(e) => {
                            setFormData(prev => ({
                              ...prev,
                              coldEmailMode: e.target.value,
                              coldCampaignIdEmelia: ""
                            }));
                          }}
                          className="mt-1 mr-3"
                        />
                        <div className="flex-1">
                          <span className="text-white font-medium">Créer automatiquement</span>
                          <p className="text-gray-400 text-sm mt-1">
                            Une nouvelle campagne sera créée automatiquement dans Emelia
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Info si désactivé */}
            {!formData.coldEmail && (
              <div className="p-4 bg-blue-900/20 border border-blue-600 rounded-lg">
                <p className="text-blue-300 text-sm flex items-center gap-2">
                  <AlertCircle size={16} />
                  Le cold email est désactivé. Activez-le pour envoyer des emails après vos relances LinkedIn.
                </p>
              </div>
            )}
          </div>
        );

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
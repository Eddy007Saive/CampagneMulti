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
  Clock
} from "lucide-react";
import { createCampagne } from "@/services/Campagne";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import toastify from "@/utils/toastify";
import { useNavigate } from 'react-router-dom';


const CampagneSchema = {
  nom: { required: true, minLength: 3 },
  zoneGeographique: { required: true, minLength: 2 },
  posteRecherche: { required: true, minLength: 2 },
  seniorite: { required: false },
  tailleEntreprise: { required: false },
  languesParlees: { required: true },
  secteursSOuhaites: { required: true },
  Template_message: { required: true, minLength: 10 },
  profilsParJour: { required: true, min: 1, max: 120 },
  messagesParJour: { required: true, min: 1, max: 40 },
  joursRafraichissement: { required: true, minLength: 1 },
  InstructionRelance4Jours: { required: true, minLength: 10 },
  InstructionRelance7Jours: { required: true, minLength: 10 },
  InstructionRelance14Jours: { required: true, minLength: 10 }
};

export function Create() {
  const [darkMode, setDarkMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [stepValidationErrors, setStepValidationErrors] = useState({});
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);

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
    InstructionRelance4Jours: "",
    InstructionRelance7Jours: "",
    InstructionRelance14Jours: "",
    Users:"",
  });

  const steps = [
    { id: 0, title: "Informations générales", icon: Users },
    { id: 1, title: "Critères professionnels", icon: Building },
    { id: 2, title: "Planning et fréquence", icon: Calendar },
    { id: 3, title: "Message et finalisation", icon: MessageSquare }
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

  // Relances à 4 jours : Le petit rappel

  const messageTemplatesJ4 = [
    {
      name: "Relance J+4 (Simple)",
      content: "Bonjour {Prénom}, je vous écris pour savoir si vous aviez eu l'occasion de voir mon précédent email concernant {Nom de votre solution}. Je serais ravi de planifier un court échange si le sujet vous intéresse."
    },
    {
      name: "Relance J+4 (Question)",
      content: "Bonjour {Prénom}, juste un petit 'up' sur mon dernier message. Vous rencontrez des défis avec {Problème commun de l'industrie} en ce moment ?"
    },
    {
      name: "Relance J+4 (Contextualisée)",
      content: "Bonjour {Prénom}, je me permets de vous renvoyer mon dernier email. Je suis convaincu que notre solution pourrait faire une vraie différence pour {Nom de l'entreprise du prospect} en termes de {Bénéfice clé}."
    },
    {
      name: "Relance J+4 (Aide)",
      content: "Bonjour {Prénom}, en relisant votre profil, je me suis demandé si vous aviez besoin d'aide pour {Défi spécifique}. Si c'est le cas, mon email précédent pourrait vous être utile. N'hésitez pas."
    },
    {
      name: "Relance J+4 (Curiosité)",
      content: "Bonjour {Prénom}, je me permets de relancer suite à mon message du {Date du premier email}. J'espère que je ne vous dérange pas, je serais juste curieux de savoir ce que vous en pensez."
    },
    {
      name: "Relance J+4 (Bénéfice)",
      content: "Bonjour {Prénom}, au cas où mon message se serait perdu, je voulais m'assurer que vous aviez bien reçu ma proposition pour améliorer {Bénéfice clé} chez {Nom de l'entreprise du prospect}."
    },
    {
      name: "Relance J+4 (Courte)",
      content: "Bonjour {Prénom}, un petit rappel concernant mon précédent message. N'hésitez pas à me dire si ce n'est pas le bon moment, et nous pourrons échanger plus tard."
    }
  ];

  // Relances à 7 jours : La valeur ajoutée

  const messageTemplatesJ7 = [
    {
      name: "Relance J+7 (Ressource)",
      content: "Bonjour {Prénom}, je ne veux pas être insistant, mais j'ai pensé que vous pourriez trouver cet article de blog sur {Sujet pertinent} intéressant. Il aborde les défis que nous avons évoqués dans mon premier email. Cela pourrait vous donner une bonne idée de ce que nous faisons."
    },
    {
      name: "Relance J+7 (Webinar)",
      content: "Bonjour {Prénom}, j'espère que tout va bien. Pour faire suite à notre échange manqué, nous organisons un webinar sur {Sujet du webinar}. Ce serait une excellente occasion de voir comment nous aidons des entreprises comme la vôtre."
    },
    {
      name: "Relance J+7 (Cas client)",
      content: "Bonjour {Prénom}, en me basant sur votre profil, j'ai trouvé une étude de cas qui pourrait vous intéresser. Elle détaille comment nous avons aidé {Nom de l'entreprise cliente} à {Résultat mesurable}. Laissez-moi savoir si vous souhaitez la consulter."
    },
    {
      name: "Relance J+7 (Vidéo)",
      content: "Bonjour {Prénom}, si vous êtes trop occupé pour un appel, j'ai préparé une courte vidéo de démonstration de {Nom de votre solution} qui vous montre les fonctionnalités les plus pertinentes pour votre secteur. Vous pouvez la regarder quand vous le souhaitez."
    },
    {
      name: "Relance J+7 (Nouvelle Donnée)",
      content: "Bonjour {Prénom}, je reviens vers vous car une nouvelle donnée dans votre secteur a retenu mon attention. Une étude récente montre que {Statistique}. Notre solution peut vous aider à vous positionner sur ce marché. Seriez-vous disponible pour un court échange à ce sujet ?"
    },
    {
      name: "Relance J+7 (Suggestion)",
      content: "Bonjour {Prénom}, je me suis dit que le guide sur {Sujet du guide} pourrait vous être utile pour votre équipe. Il est très apprécié par nos clients. Faites-moi savoir si vous souhaitez que je vous l'envoie."
    },
    {
      name: "Relance J+7 (Focus)",
      content: "Bonjour {Prénom}, j'ai conscience que votre emploi du temps est chargé. Pour vous faire gagner du temps, j'ai préparé trois points clés sur la façon dont nous pourrions aider {Nom de l'entreprise du prospect} à améliorer {Bénéfice Clé}. Laissez-moi savoir si je peux vous les envoyer rapidement."
    }
  ];

  // Relances à 14 jours : La dernière tentative

  const messageTemplatesJ14 = [
    {
      name: "Relance J+14 (Clôture)",
      content: "Bonjour {Prénom}, je n'ai pas eu de retour de votre part et je ne veux pas que mes messages deviennent des spams dans votre boîte de réception. Je vais clore ce dossier de mon côté, mais si l'idée d'améliorer {Bénéfice Clé} chez {Nom de l'entreprise du prospect} vous intéresse toujours, n'hésitez pas à me répondre."
    },
    {
      name: "Relance J+14 (Adieu amical)",
      content: "Bonjour {Prénom}, au cas où vous ne seriez plus intéressé par {Sujet du premier email}, je vous laisse. Si votre situation change, n'hésitez pas à me faire signe. Bon courage dans votre travail !"
    },
    {
      name: "Relance J+14 (Valeur finale)",
      content: "Bonjour {Prénom}, j'ai bien compris que le moment n'était pas idéal. Avant de refermer ce dossier, je voulais juste vous laisser une dernière ressource qui pourrait vous être utile pour la suite : {Lien vers un article, un guide...}. Je reste à votre disposition si vous avez des questions."
    },
    {
      name: "Relance J+14 (Directe et ouverte)",
      content: "Bonjour {Prénom}, est-ce que mes messages sont arrivés à un mauvais moment, ou est-ce que ce sujet n'est tout simplement pas pertinent pour vous ? Un simple 'oui' ou 'non' me suffit, et je vous laisserai tranquille."
    },
    {
      name: "Relance J+14 (Légère)",
      content: "Bonjour {Prénom}, le silence radio est parfois la meilleure des réponses ! Je vais donc m'en aller. Si un jour le sujet de {Bénéfice clé} revient dans votre esprit, vous savez où me trouver."
    },
    {
      name: "Relance J+14 (Solution alternative)",
      content: "Bonjour {Prénom}, je me rends compte que notre solution n'est peut-être pas la meilleure pour vous, mais je serais ravi de vous recommander d'autres outils qui pourraient vous aider à résoudre le problème de {Problème commun}. Dites-moi si vous êtes intéressé."
    },
    {
      name: "Relance J+14 (Ultime, personnalisée)",
      content: "Bonjour {Prénom}, j'imagine que votre boîte de réception est pleine. Je voulais juste prendre une dernière chance de vous contacter car je crois vraiment que notre solution peut aider {Nom de l'entreprise du prospect} à {Bénéfice clé}. Si cela n'est pas le cas, je vous souhaite une excellente semaine."
    }
  ];

  const methods = useForm({
    mode: 'onChange',
    defaultValues: formData
  });

  const { register, handleSubmit, reset, setValue, formState: { errors }, watch, trigger, getValues } = methods;

  // Fonction de validation améliorée
  const validateField = (fieldName, value) => {
    const schema = CampagneSchema[fieldName];
    if (!schema) return null;

    // Validation pour les champs requis
    if (schema.required) {
      if (fieldName === 'joursRafraichissement') {
        if (!value || !Array.isArray(value) || value.length === 0) {
          return 'Au moins un jour doit être sélectionné';
        }
      } else if (!value || value.toString().trim() === "") {
        return `Ce champ est requis`;
      }
    }

    // Validation de longueur minimale
    if (schema.minLength && value && value.length < schema.minLength) {
      return `Minimum ${schema.minLength} caractères requis`;
    }

    // Validation des valeurs numériques
    if (schema.min !== undefined && value !== "" && parseInt(value) < schema.min) {
      return `La valeur doit être supérieure ou égale à ${schema.min}`;
    }

    if (schema.max !== undefined && value !== "" && parseInt(value) > schema.max) {
      return `La valeur doit être inférieure ou égale à ${schema.max}`;
    }

    return null;
  };

  // Fonction pour obtenir les champs à valider par étape
  const getFieldsForStep = (step) => {
    switch (step) {
      case 0:
        return ['nom', 'zoneGeographique'];
      case 1:
        return ['posteRecherche', "secteursSOuhaites", "languesParlees"];
      case 2:
        return ['profilsParJour', 'messagesParJour', 'joursRafraichissement'];
      case 3:
        return ['Template_message', 'InstructionRelance4Jours', 'InstructionRelance7Jours', 'InstructionRelance14Jours'];
      default:
        return [];
    }
  };

     // Récupérer l'utilisateur depuis le localStorage
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

  // Validation améliorée par étape
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

    // Clear error for this field when user starts typing
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

    // Clear error when user makes a selection
    if (stepValidationErrors.joursRafraichissement) {
      const newErrors = { ...stepValidationErrors };
      delete newErrors.joursRafraichissement;
      setStepValidationErrors(newErrors);
    }
  };

  const appliquerPlanningPredefini = (planning) => {
    setFormData(prev => ({ ...prev, joursRafraichissement: planning.jours }));

    // Clear error when applying predefined schedule
    if (stepValidationErrors.joursRafraichissement) {
      const newErrors = { ...stepValidationErrors };
      delete newErrors.joursRafraichissement;
      setStepValidationErrors(newErrors);
    }
  };

  const generateLinkedInQuery = () => {
    const { posteRecherche, zoneGeographique, secteurs, langues } = formData;
    let query = "";

    if (posteRecherche) {
      query += `"${posteRecherche}"`;
    }

    if (zoneGeographique) {
      query += query ? ` AND "${zoneGeographique}"` : `"${zoneGeographique}"`;
    }

    return query || "Aucune requête générée";
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const campagneData = {
        "Nom de la campagne": formData.nom,
        "Poste recherché": formData.posteRecherche,
        "Zone géographique": formData.zoneGeographique,
        "Seniorite": formData.seniorite,
        "Taille_entreprise": formData.tailleEntreprise,
        "Langues parlées": formData.languesParlees,
        "Secteurs souhaités": formData.secteursSOuhaites,
        "Contacts": formData.contacts,
        "Statut": formData.statut,
        "Template_message": formData.Template_message,
        "Profils/jour": parseInt(formData.profilsParJour),
        "Messages/jour": parseInt(formData.messagesParJour),
        "Jours_enrichissement": formData.joursRafraichissement,
        "Statut d'enrichissement": "En attente",
        "InstructionRelance4Jours": formData.InstructionRelance4Jours,
        "InstructionRelance7Jours": formData.InstructionRelance7Jours,
        "InstructionRelance14Jours": formData.InstructionRelance14Jours,
        "Users":[formData.Users]
      };

      
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
        InstructionRelance4Jours: "",
        InstructionRelance7Jours: "",
        InstructionRelance14Jours: "",
      });
      setCurrentStep(0);
      setStepValidationErrors({});


      toastify.success("Campagne créée avec succès");
      setTimeout(() => {
          navigate(`/dashboard/campagne`);
        }, 2000);
    } catch (error) {
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
    setStepValidationErrors({}); // Clear errors when going back
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
          <div key={step.id} className="flex flex-col items-center">
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
                {stepValidationErrors.seniorite && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle size={12} className="mr-1" />
                    {stepValidationErrors.seniorite.message}
                  </p>
                )}
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
                {stepValidationErrors.tailleEntreprise && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle size={12} className="mr-1" />
                    {stepValidationErrors.tailleEntreprise.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="flex items-center mb-2 text-sm font-medium text-white dark:text-gray-300">
                  <Languages size={16} className="mr-2" />
                  Langues parlées
                </label>
                <input
                  list="langues-list"
                  name="languesParlees"
                  value={formData.languesParlees}
                  onChange={handleChange}
                  placeholder="Sélectionner ou saisir une langue"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <datalist id="langues-list">
                  {langues.map((langue) => (
                    <option key={langue} value={langue} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="flex items-center mb-2 text-sm font-medium text-white dark:text-gray-300">
                  <Building size={16} className="mr-2" />
                  Secteurs souhaités
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

            {/* Section Jours de rafraîchissement */}
            <div className="space-y-4">
              <label className="flex items-center mb-2 text-sm font-medium text-white dark:text-gray-300">
                <RefreshCw size={16} className="mr-2" />
                Jours de rafraîchissement *
                <Tooltip content="Sélectionnez les jours où la campagne doit rechercher et envoyer des messages aux profils">
                  <HelpCircle size={14} className="ml-2 text-gray-400 cursor-help" />
                </Tooltip>
              </label>

              {/* Plannings prédéfinis */}
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

              {/* Sélection manuelle des jours */}
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
            <div>
              <label className="flex items-center mb-2 text-sm font-medium text-white dark:text-gray-300">
                <MessageSquare size={16} className="mr-2" />
                Template de message *
                <Tooltip content="Utilisez {nom}, {poste}, {Entreprise} comme variables dynamiques">
                  <HelpCircle size={14} className="ml-2 text-gray-400 cursor-help" />
                </Tooltip>
              </label>

              <div className="mb-4">
                <div className="flex gap-2 mb-2 flex-wrap">
                  {messageTemplates.map((template, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, Template_message: template.content }))}
                      className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                      {template.name}
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                value={formData.Template_message}
                name="Template_message"
                rows={6}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${stepValidationErrors.Template_message ? 'border-red-500' : 'border-gray-300'
                  }`}
                onChange={handleChange}
                placeholder="Bonjour {nom}, j'espère que vous allez bien. Je recrute actuellement pour un poste de {poste}..."
              />
              {stepValidationErrors.Template_message && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <AlertCircle size={12} className="mr-1" />
                  {stepValidationErrors.Template_message.message}
                </p>
              )}
            </div>

            {/* Section Instructions de Relance */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200 flex items-center">
                <RefreshCw size={20} className="mr-2" />
                Instructions de Messages de Relance
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Définissez des instructions spécifiques pour chaque type de relance. Ces instructions seront utilisées pour personnaliser les messages de suivi.
              </p>

              {/* Relance 4 jours */}
              <div className="mb-6">
                <label className="flex items-center mb-2 text-sm font-medium text-white dark:text-gray-300">
                  <Clock size={16} className="mr-2" />
                  Instructions Relance 4 jours
                  <Tooltip content="Instructions pour les messages de relance envoyés 4 jours après le premier contact">
                    <HelpCircle size={14} className="ml-2 text-gray-400 cursor-help" />
                  </Tooltip>
                </label>

                <div className="mb-4">
                  <div className="flex gap-2 mb-2 flex-wrap">
                    {messageTemplatesJ4.map((template, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, InstructionRelance4Jours: template.content }))}
                        className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                      >
                        {template.name}
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  value={formData.InstructionRelance4Jours}
                  name="InstructionRelance4Jours"
                  rows={4}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${stepValidationErrors.InstructionRelance4Jours ? 'border-red-500' : 'border-gray-300'
                    }`}
                  onChange={handleChange}
                  placeholder="Instructions pour le message de relance à 4 jours. Ex: Adoptez un ton amical et rappelez brièvement l'opportunité en mettant l'accent sur l'intérêt mutuel..."
                />
                {stepValidationErrors.InstructionRelance4Jours && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle size={12} className="mr-1" />
                    {stepValidationErrors.InstructionRelance4Jours.message}
                  </p>
                )}
              </div>

              {/* Relance 7 jours */}
              <div className="mb-6">
                <label className="flex items-center mb-2 text-sm font-medium text-white dark:text-gray-300">
                  <Clock size={16} className="mr-2" />
                  Instructions Relance 7 jours
                  <Tooltip content="Instructions pour les messages de relance envoyés 7 jours après le premier contact">
                    <HelpCircle size={14} className="ml-2 text-gray-400 cursor-help" />
                  </Tooltip>
                </label>

                <div className="mb-4">
                  <div className="flex gap-2 mb-2 flex-wrap">
                    {messageTemplatesJ7.map((template, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, InstructionRelance7Jours: template.content }))}
                        className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                      >
                        {template.name}
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  value={formData.InstructionRelance7Jours}
                  name="InstructionRelance7Jours"
                  rows={4}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${stepValidationErrors.InstructionRelance7Jours ? 'border-red-500' : 'border-gray-300'
                    }`}
                  onChange={handleChange}
                  placeholder="Instructions pour le message de relance à 7 jours. Ex: Utilisez une approche plus directe, mentionnez des détails spécifiques du poste et proposez un appel..."
                />
                {stepValidationErrors.InstructionRelance7Jours && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle size={12} className="mr-1" />
                    {stepValidationErrors.InstructionRelance7Jours.message}
                  </p>
                )}
              </div>

              {/* Relance 14 jours */}
              <div className="mb-6">
                <label className="flex items-center mb-2 text-sm font-medium text-white dark:text-gray-300">
                  <Clock size={16} className="mr-2" />
                  Instructions Relance 14 jours
                  <Tooltip content="Instructions pour les messages de relance envoyés 14 jours après le premier contact">
                    <HelpCircle size={14} className="ml-2 text-gray-400 cursor-help" />
                  </Tooltip>
                </label>

                <div className="mb-4">
                  <div className="flex gap-2 mb-2 flex-wrap">
                    {messageTemplatesJ14.map((template, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, InstructionRelance14Jours: template.content }))}
                        className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                      >
                        {template.name}
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  value={formData.InstructionRelance14Jours}
                  name="InstructionRelance14Jours"
                  rows={4}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${stepValidationErrors.InstructionRelance14Jours ? 'border-red-500' : 'border-gray-300'
                    }`}
                  onChange={handleChange}
                  placeholder="Instructions pour le message de relance à 14 jours. Ex: Message de clôture courtois, mentionnez que c'est votre dernière tentative et laissez la porte ouverte..."
                />
                {stepValidationErrors.InstructionRelance14Jours && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle size={12} className="mr-1" />
                    {stepValidationErrors.InstructionRelance14Jours.message}
                  </p>
                )}
              </div>
            </div>

            <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200 flex items-center">
                <Eye size={20} className="mr-2" />
                Résumé de la campagne
              </h3>
              <div className="grid gap-4">
                <div><strong>Nom:</strong> {formData.nom || "Non défini"}</div>
                <div><strong>Poste:</strong> {formData.posteRecherche || "Non défini"}</div>
                <div><strong>Zone:</strong> {formData.zoneGeographique || "Non défini"}</div>
                <div><strong>Expérience:</strong> {formData.anneesExperienceMin && formData.anneesExperienceMax ? `${formData.anneesExperienceMin}-${formData.anneesExperienceMax} ans` : "Non défini"}</div>
                <div><strong>Profils/jour:</strong> {formData.profilsParJour || "Non défini"}</div>
                <div><strong>Messages/jour:</strong> {formData.messagesParJour || "Non défini"}</div>
                <div><strong>Jours actifs:</strong> {
                  formData.joursRafraichissement.length > 0
                    ? formData.joursRafraichissement.map(jour =>
                      joursOptions.find(j => j.id === jour)?.label
                    ).join(', ')
                    : "Non défini"
                }</div>
                {formData.languesParlees && <div><strong>Langues:</strong> {formData.languesParlees}</div>}
                {formData.secteursSOuhaites && <div><strong>Secteurs:</strong> {formData.secteursSOuhaites}</div>}

                {/* Ajout dans le résumé pour les instructions de relance */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                  <strong>Instructions de relance configurées:</strong>
                  <div className="mt-2 space-y-1 text-sm">
                    <div>• 4 jours: {formData.InstructionRelance4Jours ? "Configuré" : "Non défini"}</div>
                    <div>• 7 jours: {formData.InstructionRelance7Jours ? "Configuré" : "Non défini"}</div>
                    <div>• 14 jours: {formData.InstructionRelance14Jours ? "Configuré" : "Non défini"}</div>
                  </div>
                </div>
              </div>

              {/* Estimation de l'activité */}
              {formData.joursRafraichissement.length > 0 && formData.profilsParJour && formData.messagesParJour && (
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Estimation hebdomadaire :</h4>
                  <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    <div>• {formData.joursRafraichissement.length * parseInt(formData.profilsParJour || 0)} nouveaux profils par semaine</div>
                    <div>• {formData.joursRafraichissement.length * parseInt(formData.messagesParJour || 0)} messages envoyés par semaine</div>
                    <div>• Campagne active {formData.joursRafraichissement.length} jour{formData.joursRafraichissement.length > 1 ? 's' : ''} par semaine</div>
                  </div>
                </div>
              )}
            </div>
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
          <h1 className="text-3xl font-bold text-white  dark:text-white">
            Créer une Campagne
          </h1>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-bleu-fonce/90 to-noir-absolu/80    dark:bg-gray-800 rounded-xl shadow-lg p-8">
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
                    className="px-6 py-3 bg-gray-300 text-white rounded-lg hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Précédent
                  </button>

                  {currentStep < steps.length - 1 ? (
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Suivant
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSubmit(onSubmit)()}
                      disabled={isSubmitting}
                      className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
    </div>
  )
};
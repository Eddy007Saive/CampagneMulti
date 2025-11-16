import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";
import {
  HelpCircle,
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
  ArrowLeft,
  RefreshCw,
  Clock,
  Eye,
  Plus,
  Trash2,
  MoveUp,
  MoveDown
} from "lucide-react";
import { getCampagneById, updateCampagne } from "@/services/Campagne";
import toastify from "@/utils/toastify";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

export function EditCampaign() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stepValidationErrors, setStepValidationErrors] = useState({});

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
        joursApres: 4,
        instruction: ""
      }
    ]
  });

  const steps = [
    { id: 0, title: "Informations générales", icon: Users },
    { id: 1, title: "Critères professionnels", icon: Building },
    { id: 2, title: "Planning et fréquence", icon: Calendar },
    { id: 3, title: "Message et relances", icon: MessageSquare }
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
    "Portugais", "Russe", "Chinois", "Japonais", "Arabe"
  ];

  const secteurs = [
    "Informatique", "Finance", "Marketing", "Ressources Humaines",
    "Vente", "Ingénierie", "Santé", "Éducation", "Juridique"
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
      name: "Approche Directe",
      content: "Rédigez un message professionnel et direct. Mentionnez le poste spécifique, expliquez brièvement pourquoi leur profil correspond, et proposez un échange téléphonique."
    },
    {
      name: "Approche Consultative",
      content: "Adoptez une approche de conseil en carrière. Mettez l'accent sur les opportunités d'évolution et les défis intéressants du poste."
    }
  ];

  const templatesRelanceParTiming = {
    court: [
      {
        name: "Rappel Simple",
        content: "Bonjour {Prénom}, je vous écris pour savoir si vous aviez eu l'occasion de voir mon précédent email concernant {Nom de votre solution}."
      },
      {
        name: "Question Directe",
        content: "Bonjour {Prénom}, juste un petit 'up' sur mon dernier message. Vous rencontrez des défis avec {Problème commun de l'industrie} en ce moment ?"
      }
    ],
    moyen: [
      {
        name: "Ressource Utile",
        content: "Bonjour {Prénom}, j'ai pensé que vous pourriez trouver cet article sur {Sujet pertinent} intéressant."
      },
      {
        name: "Étude de Cas",
        content: "Bonjour {Prénom}, j'ai trouvé une étude de cas qui pourrait vous intéresser concernant {Résultat mesurable}."
      }
    ],
    long: [
      {
        name: "Clôture Polie",
        content: "Bonjour {Prénom}, je ne veux pas que mes messages deviennent des spams. Si l'opportunité vous intéresse toujours, n'hésitez pas à me répondre."
      },
      {
        name: "Adieu Amical",
        content: "Bonjour {Prénom}, si votre situation change, n'hésitez pas à me faire signe. Bon courage dans votre travail !"
      }
    ]
  };

  const methods = useForm({
    mode: 'onChange',
    defaultValues: formData
  });

  const { handleSubmit, setValue } = methods;

  // Fonctions de gestion des relances
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

    if (stepValidationErrors.relances) {
      const newErrors = { ...stepValidationErrors };
      delete newErrors.relances;
      setStepValidationErrors(newErrors);
    }
  };

  const supprimerRelance = (id) => {
    if (formData.relances.length <= 1) {
      alert("Vous devez avoir au moins une relance configurée");
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

  // Charger les données de la campagne
  useEffect(() => {
    const loadCampaignData = async () => {
      try {
        setLoading(true);
        
        // Appel API avec getCampagneById
        const response = await getCampagneById(id);
        const data = response.data;
        console.log(data);
        

        // Parser les relances avec gestion d'erreur
        let relances = [];
        try {
          const relancesData = JSON.parse(data.Relances || data["Relances"] || "[]");
          relances = relancesData.map((r, index) => ({
            id: Date.now() + index,
            joursApres: r.joursApres || "",
            instruction: r.instruction || ""
          }));
        } catch (e) {
          console.error("Erreur parsing relances:", e);
          // Fallback: essayer de parser les anciens champs
          if (data.InstructionRelance4Jours || data.InstructionRelance7Jours || data.InstructionRelance14Jours) {
            relances = [];
            if (data.InstructionRelance4Jours) {
              relances.push({
                id: Date.now(),
                joursApres: 4,
                instruction: data.InstructionRelance4Jours
              });
            }
            if (data.InstructionRelance7Jours) {
              relances.push({
                id: Date.now() + 1,
                joursApres: 7,
                instruction: data.InstructionRelance7Jours
              });
            }
            if (data.InstructionRelance14Jours) {
              relances.push({
                id: Date.now() + 2,
                joursApres: 14,
                instruction: data.InstructionRelance14Jours
              });
            }
          }
        }

        if (relances.length === 0) {
          relances = [{
            id: Date.now(),
            joursApres: 4,
            instruction: ""
          }];
        }

        const initialFormData = {
          nom: data["Nom de la campagne"] || data.nom || "",
          posteRecherche: data["Poste recherché"] || data.poste || "",
          zoneGeographique: data["Zone géographique"] || data.zone || "",
          seniorite: data.seniorite || data.Seniorite || "",
          tailleEntreprise: data.tailleEntreprise || data.Taille_entreprise || "",
          languesParlees: data["Langues parlées"] || data.langues || "",
          secteursSOuhaites: data["Secteurs souhaités"] || data.secteurs || "",
          Template_message: data.Template_message || data["Template_message"] || "",
          profilsParJour:data.profileParJours || "",
          messagesParJour:data.messageParJours || "",
          joursRafraichissement: Array.isArray(data["jours_enrichissement"]) 
            ? data["jours_enrichissement"]
            : (Array.isArray(data.jours_enrichissement) ? data.jours_enrichissement : []),
          relances: relances
        };

        setFormData(initialFormData);

      } catch (error) {
        console.error("Erreur lors du chargement de la campagne:", error);
        toastify.error("Erreur lors du chargement de la campagne");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadCampaignData();
    }
  }, [id]);

  // Validation
  const validateField = (fieldName, value) => {
    const schema = {
      nom: { required: true, minLength: 3 },
      zoneGeographique: { required: true, minLength: 2 },
      posteRecherche: { required: true, minLength: 2 },
      languesParlees: { required: true },
      Template_message: { required: true, minLength: 10 },
      profilsParJour: { required: true, min: 1, max: 120 },
      messagesParJour: { required: true, min: 1, max: 40 },
      joursRafraichissement: { required: true, minLength: 1 },
      relances: { required: true, minLength: 1 }
    };

    const fieldSchema = schema[fieldName];
    if (!fieldSchema) return null;

    if (fieldSchema.required) {
      if (fieldName === 'relances') {
        if (!value || !Array.isArray(value) || value.length === 0) {
          return 'Au moins une relance doit être configurée';
        }
        
        for (let i = 0; i < value.length; i++) {
          const relance = value[i];
          if (!relance.joursApres || relance.joursApres <= 0) {
            return `La relance #${i + 1} doit avoir un délai positif`;
          }
          if (!relance.instruction || relance.instruction.length < 10) {
            return `La relance #${i + 1} doit avoir une instruction (min 10 caractères)`;
          }
        }
        
        const timings = value.map(r => parseInt(r.joursApres));
        if (new Set(timings).size !== timings.length) {
          return 'Deux relances ne peuvent pas avoir le même délai';
        }
      } else if (fieldName === 'joursRafraichissement') {
        if (!value || !Array.isArray(value) || value.length === 0) {
          return 'Au moins un jour doit être sélectionné';
        }
      } else if (!value || value.toString().trim() === "") {
        return 'Ce champ est requis';
      }
    }

    if (fieldSchema.minLength && value && value.length < fieldSchema.minLength) {
      return `Minimum ${fieldSchema.minLength} caractères requis`;
    }

    if (fieldSchema.min !== undefined && value !== "" && parseInt(value) < fieldSchema.min) {
      return `La valeur doit être ≥ ${fieldSchema.min}`;
    }

    if (fieldSchema.max !== undefined && value !== "" && parseInt(value) > fieldSchema.max) {
      return `La valeur doit être ≤ ${fieldSchema.max}`;
    }

    return null;
  };

  const getFieldsForStep = (step) => {
    switch (step) {
      case 0: return ['nom', 'zoneGeographique'];
      case 1: return ['posteRecherche', 'languesParlees'];
      case 2: return ['profilsParJour', 'messagesParJour', 'joursRafraichissement'];
      case 3: return ['Template_message', 'relances'];
      default: return [];
    }
  };

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
    setFormData(prev => ({ ...prev, [name]: value }));
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

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const relancesClean = formData.relances
        .filter(r => r.joursApres && r.instruction)
        .map(r => ({
          joursApres: parseInt(r.joursApres),
          instruction: r.instruction
        }))
        .sort((a, b) => a.joursApres - b.joursApres);

      const updateData = {
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
        "Relances": JSON.stringify(relancesClean)
      };

      const response = await updateCampagne(id, updateData);

      if (response.data.success) {
        toastify.success("Campagne mise à jour avec succès");
        setTimeout(() => {
          navigate(`/dashboard/campagne/${id}`);
        }, 2000);
      } else {
        toastify.error("Une erreur s'est produite lors de la mise à jour");
      }

    } catch (error) {
      console.error("Erreur:", error);
      toastify.error("Une erreur s'est produite lors de la mise à jour");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep(Math.min(steps.length - 1, currentStep + 1));
    } else {
      alert("Veuillez corriger les erreurs avant de continuer");
    }
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
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
              isActive ? 'bg-blue-600 text-white' :
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
                <label className="flex items-center mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <Users size={16} className="mr-2" />
                  Nom de la campagne *
                </label>
                <input
                  value={formData.nom}
                  name="nom"
                  type="text"
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    stepValidationErrors.nom ? 'border-red-500' : 'border-gray-300'
                  }`}
                  onChange={handleChange}
                  placeholder="Ex: Recrutement Développeur Senior"
                />
                {stepValidationErrors.nom && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle size={12} className="mr-1" />
                    {stepValidationErrors.nom.message}
                  </p>
                )}
              </div>

              <div>
                <label className="flex items-center mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <MapPin size={16} className="mr-2" />
                  Zone géographique *
                </label>
                <input
                  value={formData.zoneGeographique}
                  name="zoneGeographique"
                  type="text"
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    stepValidationErrors.zoneGeographique ? 'border-red-500' : 'border-gray-300'
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
              <label className="flex items-center mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Building size={16} className="mr-2" />
                Cible recherché *
              </label>
              <input
                list="postes-list"
                value={formData.posteRecherche}
                name="posteRecherche"
                type="text"
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  stepValidationErrors.posteRecherche ? 'border-red-500' : 'border-gray-300'
                }`}
                onChange={handleChange}
                placeholder="Ex: Développeur OR Developer"
              />
              <datalist id="postes-list">
                {postesFrequents.map((poste) => (
                  <option key={poste} value={poste} />
                ))}
              </datalist>
              {stepValidationErrors.posteRecherche && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <AlertCircle size={12} className="mr-1" />
                  {stepValidationErrors.posteRecherche.message}
                </p>
              )}
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="flex items-center mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <Languages size={16} className="mr-2" />
                  Langues parlées *
                </label>
                <input
                  list="langues-list"
                  name="languesParlees"
                  value={formData.languesParlees}
                  onChange={handleChange}
                  placeholder="Français, Anglais..."
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    stepValidationErrors.languesParlees ? 'border-red-500' : 'border-gray-300'
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
                <label className="flex items-center mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <Building size={16} className="mr-2" />
                  Secteurs (optionnel)
                </label>
                <input
                  list="secteurs-list"
                  name="secteursSOuhaites"
                  value={formData.secteursSOuhaites}
                  onChange={handleChange}
                  placeholder="Informatique..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                <label className="flex items-center mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <Users size={16} className="mr-2" />
                  Profils/jour *
                </label>
                <input
                  value={formData.profilsParJour}
                  name="profilsParJour"
                  type="number"
                  min="1"
                  max="120"
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    stepValidationErrors.profilsParJour ? 'border-red-500' : 'border-gray-300'
                  }`}
                  onChange={handleChange}
                  placeholder="20"
                />
                {stepValidationErrors.profilsParJour && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle size={12} className="mr-1" />
                    {stepValidationErrors.profilsParJour.message}
                  </p>
                )}
              </div>

              <div>
                <label className="flex items-center mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <MessageSquare size={16} className="mr-2" />
                  Messages/jour *
                </label>
                <input
                  value={formData.messagesParJour}
                  name="messagesParJour"
                  type="number"
                  min="1"
                  max="40"
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    stepValidationErrors.messagesParJour ? 'border-red-500' : 'border-gray-300'
                  }`}
                  onChange={handleChange}
                  placeholder="15"
                />
                {stepValidationErrors.messagesParJour && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle size={12} className="mr-1" />
                    {stepValidationErrors.messagesParJour.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <label className="flex items-center mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <RefreshCw size={16} className="mr-2" />
                Jours de rafraîchissement *
              </label>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-3">Plannings prédéfinis :</p>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                  {planningsPredefinis.map((planning) => (
                    <button
                      key={planning.nom}
                      type="button"
                      onClick={() => appliquerPlanningPredefini(planning)}
                      className="p-3 text-left border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">{planning.nom}</span>
                        <Clock size={12} className="text-gray-400" />
                      </div>
                      <p className="text-xs text-gray-500">{planning.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-3">Ou sélectionnez manuellement :</p>
                <div className="grid grid-cols-7 gap-2">
                  {joursOptions.map((jour) => (
                    <button
                      key={jour.id}
                      type="button"
                      onClick={() => handleJourToggle(jour.id)}
                      className={`relative p-3 rounded-lg border-2 transition-all ${
                        formData.joursRafraichissement.includes(jour.id)
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-center">
                        <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-sm font-semibold mb-1 ${
                          formData.joursRafraichissement.includes(jour.id)
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-600'
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
                  <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2">
                      <Check size={16} className="text-green-600" />
                      <span className="text-sm text-green-700">
                        {formData.joursRafraichissement.length} jour{formData.joursRafraichissement.length > 1 ? 's' : ''} sélectionné{formData.joursRafraichissement.length > 1 ? 's' : ''}
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
            {/* Template de message initial */}
            <div>
              <label className="flex items-center mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <MessageSquare size={16} className="mr-2" />
                Template de message initial *
              </label>

              <div className="mb-4">
                <div className="flex gap-2 mb-2 flex-wrap">
                  {messageTemplates.map((template, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, Template_message: template.content }))}
                      className="px-3 py-1 text-sm bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
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
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  stepValidationErrors.Template_message ? 'border-red-500' : 'border-gray-300'
                }`}
                onChange={handleChange}
                placeholder="Bonjour {Prénom}, je vous contacte concernant..."
              />
              {stepValidationErrors.Template_message && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <AlertCircle size={12} className="mr-1" />
                  {stepValidationErrors.Template_message.message}
                </p>
              )}
            </div>

            {/* Section Relances Dynamiques */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <RefreshCw size={20} className="mr-2" />
                  Messages de Relance ({formData.relances.length})
                </h3>
                <button
                  type="button"
                  onClick={ajouterRelance}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus size={16} />
                  Ajouter une relance
                </button>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                Configurez vos messages de relance avec des délais personnalisés. Les templates suggérés s'adaptent automatiquement.
              </p>

              {stepValidationErrors.relances && (
                <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-red-700 text-sm flex items-center">
                    <AlertCircle size={16} className="mr-2" />
                    {stepValidationErrors.relances.message}
                  </p>
                </div>
              )}

              {/* Liste des relances */}
              <div className="space-y-4">
                {formData.relances.map((relance, index) => (
                  <div
                    key={relance.id}
                    className="p-4 border-2 border-gray-200 rounded-lg bg-white"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 rounded-full font-semibold">
                          {index + 1}
                        </span>
                        <h4 className="font-medium text-gray-800">
                          Relance #{index + 1}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2">
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={() => deplacerRelance(index, 'up')}
                            className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                            title="Déplacer vers le haut"
                          >
                            <MoveUp size={16} />
                          </button>
                        )}
                        {index < formData.relances.length - 1 && (
                          <button
                            type="button"
                            onClick={() => deplacerRelance(index, 'down')}
                            className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                            title="Déplacer vers le bas"
                          >
                            <MoveDown size={16} />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => supprimerRelance(relance.id)}
                          className="p-1 text-red-500 hover:text-red-700 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Champ délai */}
                    <div className="mb-3">
                      <label className="flex items-center mb-2 text-sm font-medium text-gray-700">
                        <Clock size={14} className="mr-1" />
                        Délai après le premier message (jours)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={relance.joursApres}
                        onChange={(e) => modifierRelance(relance.id, 'joursApres', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Ex: 4, 7, 14..."
                      />
                    </div>

                    {/* Templates suggérés */}
                    {relance.joursApres && (
                      <div className="mb-3">
                        <p className="text-xs text-gray-600 mb-2">
                          Templates suggérés pour {relance.joursApres} jour{relance.joursApres > 1 ? 's' : ''} :
                        </p>
                        <div className="flex gap-2 flex-wrap">
                          {getTemplatesSuggeres(parseInt(relance.joursApres)).map((template, tIndex) => (
                            <button
                              key={tIndex}
                              type="button"
                              onClick={() => modifierRelance(relance.id, 'instruction', template.content)}
                              className="px-2 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                            >
                              {template.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Champ instruction */}
                    <div>
                      <label className="flex items-center mb-2 text-sm font-medium text-gray-700">
                        <MessageSquare size={14} className="mr-1" />
                        Instruction / Template
                      </label>
                      <textarea
                        value={relance.instruction}
                        onChange={(e) => modifierRelance(relance.id, 'instruction', e.target.value)}
                        rows={4}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Bonjour {Prénom}, je reviens vers vous..."
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {relance.instruction.length} caractères (minimum 10)
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Résumé de la campagne */}
            <div className="p-6 bg-gray-50 rounded-lg border-t border-gray-200">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                <Eye size={20} className="mr-2" />
                Résumé de la campagne
              </h3>
              <div className="grid gap-3 text-sm">
                <div><strong>Nom:</strong> {formData.nom || "Non défini"}</div>
                <div><strong>Poste:</strong> {formData.posteRecherche || "Non défini"}</div>
                <div><strong>Zone:</strong> {formData.zoneGeographique || "Non défini"}</div>
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

                {/* Résumé des relances */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <strong>Relances configurées ({formData.relances.length}):</strong>
                  <div className="mt-2 space-y-1 text-sm">
                    {formData.relances
                      .sort((a, b) => (a.joursApres || 0) - (b.joursApres || 0))
                      .map((relance) => (
                        <div key={relance.id} className="flex items-center gap-2">
                          <span className="text-blue-600">•</span>
                          <span className="text-gray-600">
                            Après {relance.joursApres || '?'} jour{(relance.joursApres || 0) > 1 ? 's' : ''} : 
                            {relance.instruction ? ' Configuré ✓' : ' À compléter'}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              {/* Estimation hebdomadaire */}
              {formData.joursRafraichissement.length > 0 && formData.profilsParJour && formData.messagesParJour && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">Estimation hebdomadaire :</h4>
                  <div className="text-sm text-blue-700 space-y-1">
                    <div>• {formData.joursRafraichissement.length * parseInt(formData.profilsParJour || 0)} nouveaux profils/semaine</div>
                    <div>• {formData.joursRafraichissement.length * parseInt(formData.messagesParJour || 0)} messages/semaine</div>
                    <div>• {formData.relances.length} relance{formData.relances.length > 1 ? 's' : ''} programmée{formData.relances.length > 1 ? 's' : ''}</div>
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-bleu-fonce/90 to-noir-absolu/80 ">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement de la campagne...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark bg-gray-900' : 'bg-gradient-to-br from-bleu-fonce/90 to-noir-absolu/80'}`}>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/dashboard/campagne/${id}`)}
              className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Modifier la Campagne
            </h1>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
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

                <div className="flex justify-between pt-6 border-t border-gray-200">
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentStep(Math.max(0, currentStep - 1));
                        setStepValidationErrors({});
                      }}
                      disabled={currentStep === 0}
                      className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Précédent
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate(`/dashboard/campagne/${id}`)}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Annuler
                    </button>
                  </div>

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
                          Mise à jour...
                        </>
                      ) : (
                        <>
                          <Check size={16} />
                          Modifier la campagne
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
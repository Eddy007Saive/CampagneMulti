import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import * as yup from "yup";
import {
  Moon,
  Sun,
  Check,
  Loader2,
  ArrowLeft,
  Users,
  Building,
  Calendar,
  MessageSquare
} from "lucide-react";
import { updateCampagne, getCampagneById } from "@/services/Campagne";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import toastify from "@/utils/toastify";
import Loading from "@/components/Loading";
import { Step0GeneralInfo } from "@/components/steps/Step0GeneralInfo";
import { Step1CriteresPro } from "@/components/steps/Step1CriteresPro";
import { Step2Planning } from "@/components/steps/Step2Planning";
import { Step3Messages } from "@/components/steps/Step3Messages";
import { Step4ColdEmail } from "@/components/steps/Step4ColdEmail";
import { CampagneSchema } from "@/validations/CampagneSchema"; // ← adapte le chemin

// Champs à valider par step
const FIELDS_PAR_STEP = {
  0: ["nom", "zoneGeographique"],
  1: ["posteRecherche", "languesParlees"],
  2: ["profilsParJour", "messagesParJour", "joursRafraichissement"],
  3: ["Template_message", "relances"],
  4: [
    "coldDelayAfterFollowUp",
    "coldEmailMode",
    "emeliaTimezone",
    "emeliaBcc",
    "emeliaSendingDays",
    "emeliaSendingTimeStart",
    "emeliaSendingTimeEnd",
    "emailSequence",
  ],
};

export function EditCampaign() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stepValidationErrors, setStepValidationErrors] = useState({});
  const [carteSelectionnee, setCarteSelectionnee] = useState("initial");
  const [currentUser, setCurrentUser] = useState(null);
  const [emeliaConnected, setEmeliaConnected] = useState(false);
  const [emeliaLoading, setEmeliaLoading] = useState(false);
  const [emeliaCampaigns, setEmeliaCampaigns] = useState([]);
  const [emeliaApiKey, setEmeliaApiKey] = useState("");
  const [emailStepSelected, setEmailStepSelected] = useState(null);

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
    relances: [{ id: Date.now(), joursApres: "", instruction: "" }],
    Users: "",
    coldEmail: false,
    coldDelayAfterFollowUp: "",
    coldEmailMode: "",
    coldCampaignIdEmelia: "",
    emeliaTimezone: "(GMT+1:00) Brussels, Copenhagen, Madrid, Paris",
    emeliaMaxNewPerDay: "35",
    emeliaDailyLimit: "100",
    emeliaBcc: "",
    emeliaSendingDays: ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"],
    emeliaSendingTimeStart: "08:00",
    emeliaSendingTimeEnd: "17:00",
    emeliaStopIfReply: true,
    emeliaStopIfClick: false,
    emeliaStopIfOpen: false,
    emeliaAddToBlacklistIfUnsubscribed: false,
    emeliaTrackOpens: true,
    emeliaTrackClicks: true,
    emeliaProviderId: "",
    emailSequence: [
      {
        id: Date.now(),
        delay: { amount: 0, unit: "MINUTES" },
        subject: "",
        message: "",
        rawHtml: false,
        disabled: false,
        attachments: [],
      },
    ],
  });

  const steps = [
    { id: 0, title: "Informations générales", icon: Users },
    { id: 1, title: "Critères professionnels", icon: Building },
    { id: 2, title: "Planning et fréquence", icon: Calendar },
    { id: 3, title: "Message et relances", icon: MessageSquare },
    { id: 4, title: "Cold Email (optionnel)", icon: MessageSquare },
  ];

  // ─── Chargement de la campagne ───
  useEffect(() => {
    const loadCampaignData = async () => {
      try {
        setLoading(true);
        const response = await getCampagneById(id);

        if (response && response.data) {
          const campaign = response.data;
          const emeliaCamp = campaign.emeliaData?.campaign;
          console.log(emeliaCamp);
          

          // Parser les relances
          let relancesData = [];
          if (campaign.Relances) {
            try {
              relancesData = typeof campaign.Relances === "string"
                ? JSON.parse(campaign.Relances)
                : campaign.Relances;
              relancesData = relancesData.map((r, index) => ({
                id: r.id || Date.now() + index,
                joursApres: r.joursApres?.toString() || "",
                instruction: r.instruction || "",
              }));
            } catch (e) {
              console.error("Erreur parsing relances:", e);
              relancesData = [{ id: Date.now(), joursApres: "", instruction: "" }];
            }
          }

          // Parser la séquence d'emails
          let emailSequenceData = [
            {
              id: Date.now(),
              delay: { amount: 0, unit: "MINUTES" },
              subject: "",
              message: "",
              rawHtml: false,
              disabled: false,
              attachments: [],
            },
          ];

          if (emeliaCamp?.steps?.length > 0) {
            emailSequenceData = emeliaCamp.steps.map((step, index) => ({
              id: Date.now() + index,
              delay: step.delay || { amount: 0, unit: "MINUTES" },
              subject: step.versions?.[0]?.subject || "",
              message: step.versions?.[0]?.message || "",
              rawHtml: step.versions?.[0]?.rawHtml || false,
              disabled: step.versions?.[0]?.disabled || false,
              attachments: step.versions?.[0]?.attachments || [],
            }));
          } else if (campaign.emailSequence) {
            try {
              const parsedSequence =
                typeof campaign.emailSequence === "string"
                  ? JSON.parse(campaign.emailSequence)
                  : campaign.emailSequence;
              if (Array.isArray(parsedSequence) && parsedSequence.length > 0) {
                emailSequenceData = parsedSequence.map((step, index) => ({
                  id: Date.now() + index,
                  delay: step.delay || { amount: 0, unit: "MINUTES" },
                  subject: step.versions?.[0]?.subject || step.subject || "",
                  message: step.versions?.[0]?.message || step.message || "",
                  rawHtml: step.versions?.[0]?.rawHtml || step.rawHtml || false,
                  disabled: step.versions?.[0]?.disabled || step.disabled || false,
                  attachments: step.versions?.[0]?.attachments || step.attachments || [],
                }));
              }
            } catch (e) {
              console.error("Erreur parsing emailSequence:", e);
            }
          }

          const mapDaysFromEmelia = (days) => {
            const dayMap = { 1: "Lundi", 2: "Mardi", 3: "Mercredi", 4: "Jeudi", 5: "Vendredi", 6: "Samedi", 0: "Dimanche" };
            return days?.map((d) => dayMap[d]).filter(Boolean) || [];
          };

          const newFormData = {
            nom: campaign["nom"] || "",
            posteRecherche: campaign["poste"] || "",
            zoneGeographique: campaign["zone"] || "",
            emeliaProviderId: campaign["emeliaProviderId"] || "",
            seniorite: campaign.seniorite || "",
            tailleEntreprise: campaign.tailleEntreprise || "",
            languesParlees: campaign["langues"] || "",
            secteursSOuhaites: campaign["secteurs"] || "",
            contacts: campaign.contacts || "",
            statut: campaign.statut || "En attente",
            Template_message: campaign.Template_message || "",
            profilsParJour: campaign["profileParJours"]?.toString() || "",
            messagesParJour: campaign["messageParJours"]?.toString() || "",
            joursRafraichissement: campaign.jours_enrichissement || [],
            relances: relancesData.length > 0
              ? relancesData
              : [{ id: Date.now(), joursApres: "", instruction: "" }],
            Users: campaign.Users?.[0] || "",
            coldEmail: campaign.coldEmail || false,
            coldDelayAfterFollowUp: campaign.coldDelayAfterFollowUp?.toString() || "",
            coldEmailMode: campaign.coldCampaignIdEmelia ? "existing" : "auto",
            coldCampaignIdEmelia: campaign.coldCampaignIdEmelia || "",
            emeliaTimezone: emeliaCamp?.schedule?.timeZone || campaign.emeliaTimezone || "(GMT+1:00) Brussels, Copenhagen, Madrid, Paris",
            emeliaMaxNewPerDay: emeliaCamp?.schedule?.dailyContact?.toString() || campaign.emeliaMaxNewPerDay?.toString() || "35",
            emeliaDailyLimit: emeliaCamp?.schedule?.dailyLimit?.toString() || campaign.emeliaDailyLimit?.toString() || "100",
            emeliaBcc: emeliaCamp?.schedule?.bcc || campaign.emeliaBcc || "",
            emeliaSendingDays: emeliaCamp?.schedule?.days
              ? mapDaysFromEmelia(emeliaCamp.schedule.days)
              : campaign.emeliaSendingDays || ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"],
            emeliaSendingTimeStart: emeliaCamp?.schedule?.start || campaign.emeliaSendingTimeStart || "08:00",
            emeliaSendingTimeEnd: emeliaCamp?.schedule?.end || campaign.emeliaSendingTimeEnd || "17:00",
            emeliaStopIfReply: emeliaCamp?.schedule?.eventToStopMails?.includes("REPLIED") ?? (campaign.emeliaStopIfReply ?? true),
            emeliaStopIfClick: emeliaCamp?.schedule?.eventToStopMails?.includes("CLICKED") ?? (campaign.emeliaStopIfClick || false),
            emeliaStopIfOpen: emeliaCamp?.schedule?.eventToStopMails?.includes("OPENED") ?? (campaign.emeliaStopIfOpen || false),
            emeliaAddToBlacklistIfUnsubscribed: emeliaCamp?.schedule?.blacklistUnsub ?? (campaign.emeliaAddToBlacklistIfUnsubscribed || false),
            emeliaTrackOpens: emeliaCamp?.schedule?.trackOpens ?? (campaign.emeliaTrackOpens ?? true),
            emeliaTrackClicks: emeliaCamp?.schedule?.trackLinks ?? (campaign.emeliaTrackClicks ?? true),
            emailSequence: emailSequenceData,
            emeliaProviderId: emeliaCamp?.provider || "",
          };

          setFormData(newFormData);
          setEmailStepSelected(emailSequenceData[0]?.id);

          if (campaign.coldEmail && campaign.coldCampaignIdEmelia) {
            setEmeliaConnected(true);
          }
        }
      } catch (error) {
        console.error("Erreur chargement campagne:", error);
        toastify.error("Erreur lors du chargement de la campagne");
      } finally {
        setLoading(false);
      }
    };

    loadCampaignData();
  }, [id]);

  // ─── Récupération utilisateur ───
  useEffect(() => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) setCurrentUser(JSON.parse(userStr));
    } catch (error) {
      console.error("Erreur récupération utilisateur:", error);
    }
  }, []);

  // ─── Validation Yup par step ───
  const validateCurrentStep = async () => {
    // Step 4 optionnel si coldEmail désactivé
    if (currentStep === 4 && !formData.coldEmail) {
      setStepValidationErrors({});
      return true;
    }

    const fields = FIELDS_PAR_STEP[currentStep] || [];
    if (fields.length === 0) return true;

    // Construire un sous-schema avec seulement les champs du step
    const schemaShape = CampagneSchema.fields;
    const stepShapeEntries = fields
      .filter((f) => schemaShape[f])
      .map((f) => [f, schemaShape[f]]);
    const stepSchema = yup.object().shape(Object.fromEntries(stepShapeEntries));

    try {
      await stepSchema.validate(formData, { abortEarly: false, context: formData });
      setStepValidationErrors({});
      return true;
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        const errors = {};
        err.inner.forEach((e) => {
          if (e.path && !errors[e.path]) {
            errors[e.path] = e.message; // ← string direct
          }
        });
        setStepValidationErrors(errors);
      }
      return false;
    }
  };

  // ─── Relances ───
  const ajouterRelance = () => {
    const nouvelleRelance = { id: Date.now(), joursApres: "", instruction: "" };
    setFormData((prev) => ({ ...prev, relances: [...prev.relances, nouvelleRelance] }));
    setCarteSelectionnee(nouvelleRelance.id);
    setStepValidationErrors((prev) => { const e = { ...prev }; delete e.relances; return e; });
  };

  const supprimerRelance = (id) => {
    if (formData.relances.length <= 1) {
      toastify.warning("Vous devez avoir au moins une relance configurée");
      return;
    }
    setFormData((prev) => ({ ...prev, relances: prev.relances.filter((r) => r.id !== id) }));
    if (carteSelectionnee === id) setCarteSelectionnee("initial");
  };

  const modifierRelance = (id, champ, valeur) => {
    setFormData((prev) => ({
      ...prev,
      relances: prev.relances.map((r) => (r.id === id ? { ...r, [champ]: valeur } : r)),
    }));
    setStepValidationErrors((prev) => { const e = { ...prev }; delete e.relances; return e; });
  };

  const getTemplatesSuggeres = (joursApres) => {
    const templates = {
      court: [{ name: "Rappel Simple", content: "Bonjour {Prénom}, je vous écris pour savoir si vous aviez eu l'occasion de voir mon précédent email concernant {Nom de votre solution}." }],
      moyen: [{ name: "Ressource Utile", content: "Bonjour {Prénom}, j'ai pensé que vous pourriez trouver cet article sur {Sujet pertinent} intéressant." }],
      long: [{ name: "Clôture Polie", content: "Bonjour {Prénom}, je ne veux pas que mes messages deviennent des spams dans votre boîte de réception. Si l'idée vous intéresse toujours, n'hésitez pas à me répondre." }],
    };
    if (joursApres <= 5) return templates.court;
    if (joursApres <= 10) return templates.moyen;
    return templates.long;
  };

  // ─── Handlers ───
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setStepValidationErrors((prev) => { const e = { ...prev }; delete e[name]; return e; });
  };

  const handleJourToggle = (jour) => {
    const nouveauxJours = formData.joursRafraichissement.includes(jour)
      ? formData.joursRafraichissement.filter((j) => j !== jour)
      : [...formData.joursRafraichissement, jour];
    setFormData((prev) => ({ ...prev, joursRafraichissement: nouveauxJours }));
    setStepValidationErrors((prev) => { const e = { ...prev }; delete e.joursRafraichissement; return e; });
  };

  const appliquerPlanningPredefini = (planning) => {
    setFormData((prev) => ({ ...prev, joursRafraichissement: planning.jours }));
    setStepValidationErrors((prev) => { const e = { ...prev }; delete e.joursRafraichissement; return e; });
  };

  // ─── Navigation entre steps ───
  const handleNextStep = async () => {
    const isValid = await validateCurrentStep();
    if (isValid) {
      setCurrentStep((prev) => Math.min(steps.length - 1, prev + 1));
    } else {
      toastify.error("Veuillez corriger les erreurs avant de continuer");
    }
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
    setStepValidationErrors({});
  };

  // ─── Soumission ───
  const onSubmit = async () => {
    // Valider tous les steps avant de soumettre
    for (let step = 0; step < steps.length; step++) {
      if (step === 4 && !formData.coldEmail) continue;

      const fields = FIELDS_PAR_STEP[step] || [];
      if (fields.length === 0) continue;

      const schemaShape = CampagneSchema.fields;
      const stepShapeEntries = fields
        .filter((f) => schemaShape[f])
        .map((f) => [f, schemaShape[f]]);
      const stepSchema = yup.object().shape(Object.fromEntries(stepShapeEntries));

      try {
        await stepSchema.validate(formData, { abortEarly: false, context: formData });
      } catch (err) {
        if (err instanceof yup.ValidationError) {
          const errors = {};
          err.inner.forEach((e) => { if (e.path && !errors[e.path]) errors[e.path] = e.message; });
          setStepValidationErrors(errors);
          setCurrentStep(step);
          toastify.error(`Erreurs à l'étape ${step + 1} — veuillez les corriger`);
          return;
        }
      }
    }

    setIsSubmitting(true);
    try {
      const relancesClean = formData.relances
        .map((r) => ({ joursApres: parseInt(r.joursApres), instruction: r.instruction.trim() }))
        .sort((a, b) => a.joursApres - b.joursApres);

      const campagneData = {
        "emeliaProviderId": formData.emeliaProviderId || "",
        "Nom de la campagne": formData.nom,
        "Poste recherché": formData.posteRecherche,
        "Zone géographique": formData.zoneGeographique,
        Seniorite: formData.seniorite,
        Taille_entreprise: formData.tailleEntreprise,
        "Langues parlées": formData.languesParlees,
        "Secteurs souhaités": formData.secteursSOuhaites || "",
        Contacts: formData.contacts,
        Statut: formData.statut,
        Template_message: formData.Template_message,
        "Profils/jour": parseInt(formData.profilsParJour),
        "Messages/jour": parseInt(formData.messagesParJour),
        Jours_enrichissement: formData.joursRafraichissement,
        Relances: JSON.stringify(relancesClean),
        ColdEmail: formData.coldEmail,
        coldDelayAfterFollowUp: formData.coldEmail ? parseInt(formData.coldDelayAfterFollowUp) : null,
        coldCampaignIdEmelia: formData.coldCampaignIdEmelia || "",
        emeliaTimezone: formData.emeliaTimezone || "",
        emeliaMaxNewPerDay: formData.emeliaMaxNewPerDay ? parseInt(formData.emeliaMaxNewPerDay) : null,
        emeliaDailyLimit: formData.emeliaDailyLimit ? parseInt(formData.emeliaDailyLimit) : null,
        emeliaBcc: formData.emeliaBcc || "",
        emeliaSendingDays: formData.emeliaSendingDays || [],
        emeliaSendingTimeStart: formData.emeliaSendingTimeStart || "",
        emeliaSendingTimeEnd: formData.emeliaSendingTimeEnd || "",
        emeliaStopIfReply: formData.emeliaStopIfReply,
        emeliaStopIfClick: formData.emeliaStopIfClick,
        emeliaStopIfOpen: formData.emeliaStopIfOpen,
        emeliaAddToBlacklistIfUnsubscribed: formData.emeliaAddToBlacklistIfUnsubscribed,
        emeliaTrackOpens: formData.emeliaTrackOpens,
        emeliaTrackClicks: formData.emeliaTrackClicks,
        emailSequence: formData.coldEmail
          ? JSON.stringify(
              formData.emailSequence.map((step) => ({
                delay: { amount: step.delay.amount, unit: step.delay.unit },
                versions: [
                  {
                    subject: step.subject,
                    disabled: step.disabled,
                    message: step.message,
                    rawHtml: step.rawHtml,
                    attachments: step.attachments || [],
                  },
                ],
              }))
            )
          : null,
        Users: [formData.Users],
      };

      const response = await updateCampagne(id, campagneData);
      toastify.success(response.message || "Campagne modifiée avec succès");
      setTimeout(() => navigate("/dashboard/campagne"), 2000);
    } catch (error) {
      console.error("Erreur lors de la modification:", error);
      toastify.error(error.response?.data?.message || "Erreur lors de la modification de la campagne");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Step Indicator ───
  const StepIndicator = () => (
    <div className="flex justify-between mb-8">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;
        return (
          <div key={step.id} className="flex flex-col items-center flex-1">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isActive ? "bg-blue-600 text-white" : isCompleted ? "bg-green-600 text-white" : "bg-gray-300 text-gray-600"}`}>
              {isCompleted ? <Check size={16} /> : <Icon size={16} />}
            </div>
            <span className={`text-sm mt-2 text-center ${isActive ? "text-blue-600 font-semibold" : "text-gray-600"}`}>
              {step.title}
            </span>
          </div>
        );
      })}
    </div>
  );

  // ─── Rendu des steps ───
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <Step0GeneralInfo formData={formData} handleChange={handleChange} stepValidationErrors={stepValidationErrors} />;
      case 1:
        return <Step1CriteresPro formData={formData} handleChange={handleChange} stepValidationErrors={stepValidationErrors} />;
      case 2:
        return (
          <Step2Planning
            formData={formData}
            handleChange={handleChange}
            stepValidationErrors={stepValidationErrors}
            handleJourToggle={handleJourToggle}
            appliquerPlanningPredefini={appliquerPlanningPredefini}
          />
        );
      case 3:
        return (
          <Step3Messages
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
          />
        );
      case 4:
        return (
          <Step4ColdEmail
            formData={formData}
            setFormData={setFormData}
            stepValidationErrors={stepValidationErrors}
            emailStepSelected={emailStepSelected}
            setEmailStepSelected={setEmailStepSelected}
          />
        );
      default:
        return null;
    }
  };

  if (loading) return <Loading />;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? "dark bg-gray-900" : "bg-gradient-to-br from-bleu-fonce/90 to-noir-absolu/80"}`}>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg bg-gradient-to-r from-red-500 via-blue-500 to-cyan-500 hover:from-cyan-500 hover:via-blue-500 hover:to-red-500 transition-all duration-500 shadow-lg hover:shadow-2xl hover:shadow-red-500/50"
            >
              <ArrowLeft size={20} className="text-white" />
            </button>
            <h1 className="text-3xl font-bold text-white dark:text-white">Modifier la Campagne</h1>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg bg-gradient-to-r from-red-500 via-blue-500 to-cyan-500 hover:from-cyan-500 hover:via-blue-500 hover:to-red-500 transition-all duration-500 shadow-lg hover:shadow-2xl hover:shadow-red-500/50"
          >
            {darkMode ? <Sun size={20} className="text-white" /> : <Moon size={20} className="text-white" />}
          </button>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-bleu-fonce/90 to-noir-absolu/80 dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <StepIndicator />

            <div>
              <div className="mb-8">{renderStep()}</div>

              <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  disabled={currentStep === 0}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Précédent
                </button>

                {currentStep < steps.length - 1 ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="px-6 py-3 bg-gradient-to-r from-blackcore-rouge rounded-lg via-blue-500 to-cyan-500 hover:from-cyan-500 hover:via-blue-500 hover:to-blackcore-rouge transition-all duration-500 shadow-lg hover:shadow-2xl hover:shadow-blackcore-rouge/50 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:shadow-none"
                  >
                    Suivant
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onSubmit}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 via-blue-500 to-cyan-500 hover:from-cyan-500 hover:via-blue-500 hover:to-red-500 transition-all duration-500 shadow-lg hover:shadow-2xl hover:shadow-red-500/50 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
          </div>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
import React, { useEffect, useState } from "react";
import {
    HelpCircle,
    Check,
    AlertCircle,
    Loader2,
    Building,
    MessageSquare,
    RefreshCw,
    Clock,
    Plus,
    Trash2,
    MoveUp,
    MoveDown
} from "lucide-react";
import Tooltips from "../ui/Tooltips";
import { getConfiguration, upsertConfiguration } from "@/services/Configuration";
import { testConnection } from "@/services/Emelia";
import * as emeliaService from "@/services/Emelia";
import toastify from "@/utils/toastify";

// ─── Composant éditeur d'email réutilisable ───
const EmailEditor = ({ 
    color = "green", 
    readOnly = false,
    emailStepSelected,
    formData,
    deplacerEmailStep,
    modifierEmailDelay,
    modifierEmailStep,
    emailTemplates,
    setEmailStepSelected
}) => {
    if (!emailStepSelected) return null;
    const currentStep = formData.emailSequence.find(s => s.id === emailStepSelected);
    const stepIndex = formData.emailSequence.findIndex(s => s.id === emailStepSelected);
    if (!currentStep) return null;
    const borderColor = color === "blue" ? "focus:border-blue-500" : "focus:border-green-500";
    const iconColor = color === "blue" ? "text-blue-400" : "text-green-400";

    return (
        <div className={`p-6 bg-gray-900 rounded-lg border border-gray-700 ${readOnly ? 'pointer-events-none opacity-80' : ''}`}>
            {readOnly && (
                <div className="mb-3 p-2 bg-yellow-900/20 border border-yellow-600/40 rounded text-yellow-400 text-xs flex items-center gap-2">
                    <span>👁️</span> Aperçu uniquement — non modifiable
                </div>
            )}
            <div className="flex items-center justify-between mb-4">
                <h5 className="text-white font-semibold flex items-center gap-2">
                    <MessageSquare size={16} className={stepIndex === 0 ? iconColor : 'text-purple-400'} />
                    {stepIndex === 0 ? 'Email initial' : `Follow-up ${stepIndex}`}
                </h5>
                <div className="flex items-center gap-2">
                    {stepIndex > 0 && (
                        <button type="button" onClick={() => deplacerEmailStep(stepIndex, 'up')}
                            className={`p-1.5 text-gray-400 hover:${iconColor} transition-colors`}>
                            <MoveUp size={16} />
                        </button>
                    )}
                    {stepIndex < formData.emailSequence.length - 1 && (
                        <button type="button" onClick={() => deplacerEmailStep(stepIndex, 'down')}
                            className={`p-1.5 text-gray-400 hover:${iconColor} transition-colors`}>
                            <MoveDown size={16} />
                        </button>
                    )}
                </div>
            </div>

            {stepIndex > 0 && (
                <div className="mb-4">
                    <label className="text-xs text-gray-400 mb-2 block">Délai d'attente</label>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-900/30 border border-purple-600 rounded-lg">
                        <Clock size={16} className="text-purple-400" />
                        <span className="text-purple-300">Attendre</span>
                        <input type="number" min="1" value={currentStep.delay.amount}
                            onChange={(e) => modifierEmailDelay(currentStep.id, 'amount', parseInt(e.target.value))}
                            className="w-16 bg-gray-900 border border-purple-500 rounded text-purple-300 text-center focus:outline-none px-2 py-1"
                        />
                        <select value={currentStep.delay.unit}
                            onChange={(e) => modifierEmailDelay(currentStep.id, 'unit', e.target.value)}
                            className="bg-gray-900 border border-purple-500 rounded text-purple-300 focus:outline-none px-2 py-1"
                        >
                            <option value="MINUTES">minute(s)</option>
                            <option value="HOURS">heure(s)</option>
                            <option value="DAYS">jour(s)</option>
                        </select>
                    </div>
                </div>
            )}

            <div className="mb-4">
                <label className="text-xs text-gray-400 mb-2 block">Templates suggérés :</label>
                <div className="flex flex-wrap gap-2">
                    {emailTemplates.map((template, tIndex) => (
                        <button key={tIndex} type="button"
                            onClick={() => { modifierEmailStep(currentStep.id, 'subject', template.subject); modifierEmailStep(currentStep.id, 'message', template.message); }}
                            className="px-3 py-1.5 text-xs bg-gray-700 hover:bg-gray-600 rounded transition-colors text-gray-300"
                        >
                            {template.name}
                        </button>
                    ))}
                </div>
            </div>

            <div className="mb-4">
                <label className="text-xs text-gray-400 mb-2 block">Sujet de l'email *</label>
                <input type="text" value={currentStep.subject}
                    onChange={(e) => modifierEmailStep(currentStep.id, 'subject', e.target.value)}
                    placeholder="Ex: Re: Notre discussion sur..."
                    className={`w-full bg-gray-800 border border-gray-600 rounded px-4 py-3 text-white ${borderColor} focus:outline-none placeholder-gray-500`}
                />
            </div>

            <div className="mb-4">
                <label className="text-xs text-gray-400 mb-2 block">Message *</label>
                <textarea value={currentStep.message}
                    onChange={(e) => modifierEmailStep(currentStep.id, 'message', e.target.value)}
                    rows={8}
                    placeholder="Bonjour {Prénom},&#10;&#10;Je me permets de revenir vers vous..."
                    className={`w-full bg-gray-800 border border-gray-600 rounded px-4 py-3 text-white ${borderColor} focus:outline-none resize-none placeholder-gray-500 font-mono text-sm`}
                />
                <div className="flex items-center justify-between mt-2">
                    <div className="text-xs text-gray-500">{currentStep.message?.length || 0} caractères</div>
                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={currentStep.rawHtml}
                                onChange={(e) => modifierEmailStep(currentStep.id, 'rawHtml', e.target.checked)}
                                className="w-4 h-4 rounded border-gray-600 text-blue-600 bg-gray-700" />
                            <span className="text-xs text-gray-400">HTML brut</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={currentStep.disabled}
                                onChange={(e) => modifierEmailStep(currentStep.id, 'disabled', e.target.checked)}
                                className="w-4 h-4 rounded border-gray-600 text-red-600 bg-gray-700" />
                            <span className="text-xs text-gray-400">Désactiver</span>
                        </label>
                    </div>
                </div>
            </div>

            <div className="p-3 bg-blue-900/20 border border-blue-600 rounded-lg">
                <p className="text-blue-300 text-xs mb-2">💡 Variables disponibles :</p>
                <div className="flex flex-wrap gap-2">
                    {['{{firstName}}', '{{lastName}}', '{{email}}'].map(variable => (
                        <code key={variable}
                            onClick={() => { navigator.clipboard.writeText(variable); toastify.success(`${variable} copié !`); }}
                            className="px-2 py-1 bg-blue-800/50 rounded text-blue-200 text-xs cursor-pointer hover:bg-blue-800 transition"
                        >
                            {variable}
                        </code>
                    ))}
                </div>
            </div>
        </div>
    );
};


// ─── Composant timeline réutilisable ───
const EmailTimeline = ({ 
    color = "green",
    formData,
    emailStepSelected,
    setEmailStepSelected,
    supprimerEmailStep,
    ajouterEmailStep
}) => {
    const borderSelected = color === "blue" ? "border-blue-500" : "border-green-500";
    const borderHover = color === "blue" ? "hover:border-blue-400" : "hover:border-green-400";
    const bgIcon0 = color === "blue" ? "bg-blue-600" : "bg-green-600";
    const textConfigured = color === "blue" ? "text-blue-400" : "text-green-400";
    const lineFrom = color === "blue" ? "bg-blue-500" : "bg-green-500";
    const gradientFrom = color === "blue" ? "from-blue-500" : "from-green-500";
    const addHover = color === "blue"
        ? "hover:border-blue-500 hover:bg-blue-900/10 hover:text-blue-400"
        : "hover:border-green-500 hover:bg-green-900/10 hover:text-green-400";

    return (
        <div className="flex gap-4 overflow-x-auto pb-6 px-2">
            {formData.emailSequence.map((step, index) => (
                <React.Fragment key={step.id}>
                    <div className="flex-shrink-0 w-48">
                        <button type="button" onClick={() => setEmailStepSelected(step.id)}
                            className={`w-full relative rounded-lg p-4 transition-all duration-200 shadow-lg cursor-pointer bg-gray-800 border-2 ${emailStepSelected === step.id ? borderSelected : `border-gray-700 ${borderHover}`}`}
                        >
                            <div className="flex flex-col items-center gap-2">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${index === 0 ? bgIcon0 : 'bg-purple-600'}`}>
                                    <MessageSquare size={20} className="text-white" />
                                </div>
                                <span className="text-white font-semibold text-sm">
                                    {index === 0 ? 'Email initial' : `Follow-up ${index}`}
                                </span>
                                <span className="text-gray-400 text-xs">
                                    {index === 0 ? 'Immédiat'
                                        : `Attendre ${step.delay.amount} ${step.delay.unit === 'DAYS' ? 'jour(s)' : step.delay.unit === 'HOURS' ? 'heure(s)' : 'minute(s)'}`}
                                </span>
                            </div>
                            {(step.subject || step.message) && (
                                <div className="mt-2 text-center">
                                    <span className={`text-xs ${textConfigured}`}>✓ Configuré</span>
                                </div>
                            )}
                            {index > 0 && (
                                <button type="button"
                                    onClick={(e) => { e.stopPropagation(); supprimerEmailStep(step.id); }}
                                    className="absolute top-2 right-2 p-1 text-red-400 hover:text-red-600 hover:bg-red-900/20 rounded transition-colors"
                                >
                                    <Trash2 size={14} />
                                </button>
                            )}
                        </button>
                    </div>
                    {index < formData.emailSequence.length - 1 && (
                        <div className="flex-shrink-0 flex items-center justify-center">
                            <div className="flex items-center">
                                <div className={`w-2 h-2 ${lineFrom} rounded-full`}></div>
                                <div className={`w-8 h-0.5 bg-gradient-to-r ${gradientFrom} to-purple-500`}></div>
                                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            </div>
                        </div>
                    )}
                </React.Fragment>
            ))}
            <div className="flex-shrink-0 w-48">
                <button type="button" onClick={ajouterEmailStep}
                    className={`w-full h-full min-h-[140px] border-2 border-dashed border-gray-600 rounded-lg transition-all flex flex-col items-center justify-center gap-2 text-gray-400 ${addHover}`}
                >
                    <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                        <Plus size={20} />
                    </div>
                    <span className="font-medium text-sm">Ajouter un follow-up</span>
                </button>
            </div>
        </div>
    );
};


export const Step4ColdEmail = ({
    formData,
    setFormData,
    stepValidationErrors,
    emailStepSelected,
    setEmailStepSelected
}) => {
    const [emeliaConfigured, setEmeliaConfigured] = useState(false);
    const [isCheckingEmelia, setIsCheckingEmelia] = useState(true);
    const [isSavingEmelia, setIsSavingEmelia] = useState(false);
    const [tempEmeliaKey, setTempEmeliaKey] = useState("");
    const [currentUser, setCurrentUser] = useState(null);
    const [emeliaApiKey, setEmeliaApiKey] = useState("");
    const [emeliaConnected, setEmeliaConnected] = useState(false);
    const [emeliaLoading, setEmeliaLoading] = useState(false);
    const [emeliaCampaigns, setEmeliaCampaigns] = useState([]);
    const [isEditMode, setIsEditMode] = useState(false);

    // ✅ FIX: mapping corrigé avec delay HOURS par défaut (comme dans la réponse Emelia)
    const loadCampaignDetails = async (campaignId) => {
        if (!campaignId) return;
        setEmeliaLoading(true);
        try {
            const result = await emeliaService.getCampaignDetails(campaignId);
            console.log("📧 Réponse brute Emelia:", result);

            // ✅ FIX: supporter les différents formats de réponse du service
            const camp = result.campaign || result.data?.campaign || result.data;
            console.log("📦 camp extrait:", camp);
            console.log("📦 camp.steps:", camp?.steps);

            if (result.success && camp && camp.steps) {

                const mapDaysFromEmelia = (days) => {
                    const dayMap = { 1: 'Lundi', 2: 'Mardi', 3: 'Mercredi', 4: 'Jeudi', 5: 'Vendredi', 6: 'Samedi', 0: 'Dimanche' };
                    return days?.map(d => dayMap[d]).filter(Boolean) || [];
                };

                // ✅ FIX: mapping correct de la séquence
                let emailSequenceData = [];
                if (camp.steps && camp.steps.length > 0) {
                    emailSequenceData = camp.steps.map((step, index) => ({
                        id: Date.now() + index,
                        delay: step.delay || { amount: 0, unit: "HOURS" },
                        subject: step.versions?.[0]?.subject || "",
                        message: step.versions?.[0]?.message || "",
                        rawHtml: step.versions?.[0]?.rawHtml || false,
                        disabled: step.versions?.[0]?.disabled || false,
                        attachments: step.versions?.[0]?.attachments || []
                    }));
                }

                console.log("✅ emailSequenceData mappé:", emailSequenceData);

                setFormData(prev => ({
                    ...prev,
                    emeliaTimezone: camp.schedule?.timeZone || prev.emeliaTimezone,
                    emeliaMaxNewPerDay: camp.schedule?.dailyContact?.toString() || prev.emeliaMaxNewPerDay,
                    emeliaDailyLimit: camp.schedule?.dailyLimit?.toString() || prev.emeliaDailyLimit,
                    emeliaBcc: camp.schedule?.bcc || prev.emeliaBcc,
                    emeliaSendingDays: camp.schedule?.days ? mapDaysFromEmelia(camp.schedule.days) : prev.emeliaSendingDays,
                    emeliaSendingTimeStart: camp.schedule?.start || prev.emeliaSendingTimeStart,
                    emeliaSendingTimeEnd: camp.schedule?.end || prev.emeliaSendingTimeEnd,
                    emeliaStopIfReply: camp.schedule?.eventToStopMails?.includes('REPLIED') ?? prev.emeliaStopIfReply,
                    emeliaStopIfClick: camp.schedule?.eventToStopMails?.includes('CLICKED') ?? prev.emeliaStopIfClick,
                    emeliaStopIfOpen: camp.schedule?.eventToStopMails?.includes('OPENED') ?? prev.emeliaStopIfOpen,
                    emeliaAddToBlacklistIfUnsubscribed: camp.schedule?.blacklistUnsub ?? prev.emeliaAddToBlacklistIfUnsubscribed,
                    emeliaTrackOpens: camp.schedule?.trackOpens ?? prev.emeliaTrackOpens,
                    emeliaTrackClicks: camp.schedule?.trackLinks ?? prev.emeliaTrackClicks,
                    // ✅ toujours écraser la séquence avec les données fraîches d'Emelia
                    emailSequence: emailSequenceData.length > 0 ? emailSequenceData : prev.emailSequence,
                    // ✅ garde l'ID déjà setté dans le onChange
                    coldCampaignIdEmelia: prev.coldCampaignIdEmelia || campaignId
                }));

                // ✅ FIX PRINCIPAL: pointer sur le premier email de la nouvelle séquence
                // (l'ancien emailStepSelected pointait vers un ID qui n'existe plus)
                if (emailSequenceData.length > 0) {
                    setEmailStepSelected(emailSequenceData[0].id);
                }

                toastify.success("Données de la campagne chargées avec succès !");
            }
        } catch (error) {
            console.error("Erreur chargement détails campagne:", error);
            toastify.error("Impossible de charger les détails de la campagne");
        } finally {
            setEmeliaLoading(false);
        }
    };

    const timezoneOptions = {
        "GMT-12:00": ["Pacific/Baker_Island", "Pacific/Wake"],
        "GMT-11:00": ["Pacific/Midway", "Pacific/Niue", "Pacific/Pago_Pago"],
        "GMT-10:00": ["Pacific/Honolulu", "Pacific/Rarotonga", "Pacific/Tahiti"],
        "GMT-9:00": ["America/Anchorage", "America/Juneau", "Pacific/Gambier"],
        "GMT-8:00": ["America/Los_Angeles", "America/Tijuana", "America/Vancouver"],
        "GMT-7:00": ["America/Denver", "America/Phoenix", "America/Chihuahua"],
        "GMT-6:00": ["America/Chicago", "America/Mexico_City", "America/Guatemala"],
        "GMT-5:00": ["America/New_York", "America/Toronto", "America/Bogota"],
        "GMT-4:00": ["America/Halifax", "America/Caracas", "America/Santiago"],
        "GMT-3:00": ["America/Sao_Paulo", "America/Buenos_Aires", "America/Montevideo"],
        "GMT-2:00": ["Atlantic/South_Georgia"],
        "GMT-1:00": ["Atlantic/Azores", "Atlantic/Cape_Verde"],
        "GMT+0:00": ["Europe/London", "Africa/Casablanca", "Atlantic/Reykjavik"],
        "GMT+1:00": ["Europe/Paris", "Europe/Berlin", "Europe/Rome", "Africa/Lagos"],
        "GMT+2:00": ["Europe/Athens", "Africa/Cairo", "Europe/Helsinki", "Africa/Johannesburg"],
        "GMT+3:00": ["Europe/Moscow", "Asia/Riyadh", "Africa/Nairobi", "Asia/Baghdad"],
        "GMT+4:00": ["Asia/Dubai", "Asia/Baku", "Indian/Mauritius"],
        "GMT+5:00": ["Asia/Karachi", "Asia/Tashkent"],
        "GMT+5:30": ["Asia/Kolkata", "Asia/Colombo"],
        "GMT+6:00": ["Asia/Almaty", "Asia/Dhaka"],
        "GMT+7:00": ["Asia/Bangkok", "Asia/Jakarta", "Asia/Ho_Chi_Minh"],
        "GMT+8:00": ["Asia/Singapore", "Asia/Hong_Kong", "Asia/Shanghai", "Australia/Perth"],
        "GMT+9:00": ["Asia/Tokyo", "Asia/Seoul", "Asia/Pyongyang"],
        "GMT+10:00": ["Australia/Sydney", "Australia/Melbourne", "Pacific/Guam"],
        "GMT+11:00": ["Pacific/Guadalcanal", "Australia/Lord_Howe"],
        "GMT+12:00": ["Pacific/Auckland", "Pacific/Fiji"],
        "GMT+13:00": ["Pacific/Tongatapu", "Pacific/Apia"],
        "GMT+14:00": ["Pacific/Kiritimati"]
    };

    useEffect(() => {
        const getUserFromStorage = () => {
            try {
                const userStr = localStorage.getItem('user');
                if (userStr) setCurrentUser(JSON.parse(userStr));
            } catch (error) {
                console.error('Erreur récupération utilisateur:', error);
            }
        };
        getUserFromStorage();
    }, []);

    useEffect(() => {
        if (formData.coldCampaignIdEmelia) {
            setIsEditMode(true);
            if (!formData.coldEmail) {
                setFormData(prev => ({ ...prev, coldEmail: true }));
            }
        }
    }, [formData.coldCampaignIdEmelia]);

    useEffect(() => {
        const checkEmeliaConfiguration = async () => {
            if (!currentUser) return;
            setIsCheckingEmelia(true);
            try {
                const config = await getConfiguration(currentUser.id);
                const hasEmeliaKey = config?.data.emeliaApiKeyMasked && config.data.emeliaApiKeyMasked.length > 20;
                setEmeliaConfigured(hasEmeliaKey);
                if (hasEmeliaKey) {
                    setEmeliaApiKey(config.data.emeliaApiKeyMasked);
                    setEmeliaConnected(true);
                    await fetchEmeliaCampaigns();
                    if (formData.coldCampaignIdEmelia) {
                        await loadCampaignDetails(formData.coldCampaignIdEmelia);
                    }
                }
            } catch (error) {
                console.error("Erreur vérification Emelia:", error);
                setEmeliaConfigured(false);
            } finally {
                setIsCheckingEmelia(false);
            }
        };
        if (currentUser) checkEmeliaConfiguration();
    }, [currentUser]);

    const saveEmeliaToBackend = async () => {
        if (!currentUser) { toastify.error("Utilisateur non identifié"); return false; }
        if (!tempEmeliaKey || tempEmeliaKey.length < 20) { toastify.error("Veuillez entrer une clé API valide"); return false; }
        setIsSavingEmelia(true);
        try {
            const testResult = await testConnection(tempEmeliaKey);
            if (!testResult.success) { toastify.error("Clé API Emelia invalide"); return false; }
            const result = await upsertConfiguration({ emeliaApiKey: tempEmeliaKey, userId: currentUser.id });
            if (result.success) {
                toastify.success("✅ API Key Emelia sauvegardée avec succès !");
                setEmeliaConfigured(true);
                setEmeliaConnected(true);
                setEmeliaApiKey(tempEmeliaKey);
                setTempEmeliaKey("");
                fetchEmeliaCampaigns();
                return true;
            } else {
                toastify.error("Erreur lors de la sauvegarde");
                return false;
            }
        } catch (error) {
            console.error("Erreur sauvegarde Emelia:", error);
            toastify.error("Impossible de sauvegarder l'API Key");
            return false;
        } finally {
            setIsSavingEmelia(false);
        }
    };

    const fetchEmeliaCampaigns = async () => {
        setEmeliaLoading(true);
        try {
            const result = await emeliaService.getCampaigns();
            if (result.success) {
                setEmeliaCampaigns(result.campaigns || []);
                if (!result.campaigns?.length) toastify.info("Aucune campagne trouvée dans votre compte Emelia");
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

    const disconnectEmelia = () => {
        setEmeliaConnected(false);
        setEmeliaCampaigns([]);
        setFormData(prev => ({ ...prev, coldEmail: false, coldDelayAfterFollowUp: "", coldEmailMode: "", coldCampaignIdEmelia: "" }));
        toastify.info("Compte Emelia déconnecté pour cette session");
    };

    const emailTemplates = [
        {
            name: "Follow-up professionnel",
            subject: "Re: Notre discussion sur {Nom de l'entreprise du prospect}",
            message: "Bonjour {Prénom},\n\nJe me permets de revenir vers vous concernant notre échange sur LinkedIn.\n\nJe pense que notre solution pourrait vraiment vous aider avec {Problème spécifique}.\n\nSeriez-vous disponible pour un court appel cette semaine ?\n\nCordialement,\n{Votre nom}"
        },
        {
            name: "Valeur ajoutée",
            subject: "Une ressource qui pourrait vous intéresser",
            message: "Bonjour {Prénom},\n\nJe vous partage cette ressource qui pourrait vous être utile pour {Objectif du prospect}.\n\nN'hésitez pas si vous avez des questions.\n\nBien à vous,\n{Votre nom}"
        },
        {
            name: "Dernier contact",
            subject: "Dernier message de ma part",
            message: "Bonjour {Prénom},\n\nJe ne veux pas encombrer votre boîte mail.\n\nSi le sujet vous intéresse toujours, je reste à votre disposition.\n\nSinon, je vous souhaite une excellente continuation.\n\nCordialement,\n{Votre nom}"
        }
    ];

    const ajouterEmailStep = () => {
        const nouvelleStep = { id: Date.now(), delay: { amount: 1, unit: "DAYS" }, subject: "", message: "", rawHtml: false, disabled: false, attachments: [] };
        setFormData(prev => ({ ...prev, emailSequence: [...prev.emailSequence, nouvelleStep] }));
        setEmailStepSelected(nouvelleStep.id);
    };

    const supprimerEmailStep = (id) => {
        if (formData.emailSequence.length <= 1) { toastify.warning("Vous devez avoir au moins un email dans la séquence"); return; }
        setFormData(prev => ({ ...prev, emailSequence: prev.emailSequence.filter(s => s.id !== id) }));
        if (emailStepSelected === id) setEmailStepSelected(formData.emailSequence[0]?.id);
    };

    const modifierEmailStep = (id, champ, valeur) => {
        setFormData(prev => ({ ...prev, emailSequence: prev.emailSequence.map(s => s.id === id ? { ...s, [champ]: valeur } : s) }));
    };

    const modifierEmailDelay = (id, field, value) => {
        setFormData(prev => ({ ...prev, emailSequence: prev.emailSequence.map(s => s.id === id ? { ...s, delay: { ...s.delay, [field]: value } } : s) }));
    };

    const deplacerEmailStep = (index, direction) => {
        const newSequence = [...formData.emailSequence];
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= newSequence.length) return;
        [newSequence[index], newSequence[newIndex]] = [newSequence[newIndex], newSequence[index]];
        setFormData(prev => ({ ...prev, emailSequence: newSequence }));
    };

    const joursOptions = [
        { id: 'Lundi', label: 'Lundi' }, { id: 'Mardi', label: 'Mardi' }, { id: 'Mercredi', label: 'Mercredi' },
        { id: 'Jeudi', label: 'Jeudi' }, { id: 'Vendredi', label: 'Vendredi' }, { id: 'Samedi', label: 'Samedi' },
        { id: 'Dimanche', label: 'Dimanche' }
    ];

    // ─── LOADING ───
    if (isCheckingEmelia) {
        return (
            <div className="space-y-6">
                <div className="p-6 bg-gray-800 rounded-lg border-2 border-gray-700">
                    <div className="flex items-center justify-center gap-3 text-gray-400">
                        <Loader2 size={20} className="animate-spin" />
                        <span>Vérification de la configuration Emelia...</span>
                    </div>
                </div>
            </div>
        );
    }

    // ─── EMELIA NON CONFIGURÉ ───
    if (!emeliaConfigured) {
        return (
            <div className="space-y-6">
                <div className="p-6 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                    <div className="flex items-start gap-4">
                        <AlertCircle className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
                        <div className="flex-1">
                            <h3 className="text-blue-400 font-bold text-lg mb-2">Connectez votre compte Emelia</h3>
                            <p className="text-blue-300 mb-4">Pour utiliser le Cold Email, connectez votre compte Emelia en entrant votre clé API ci-dessous.</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-gray-800 rounded-lg border-2 border-gray-700">
                    <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                        <Building size={18} className="text-purple-400" />
                        Connexion Emelia
                    </h4>
                    <div>
                        <label className="text-sm text-gray-400 mb-2 block">API Key Emelia *</label>
                        <div className="flex gap-2">
                            <input type="password" value={tempEmeliaKey}
                                onChange={(e) => setTempEmeliaKey(e.target.value)}
                                placeholder="eme_••••••••••••••••••••"
                                className="flex-1 p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                                onKeyPress={(e) => { if (e.key === 'Enter' && tempEmeliaKey.length >= 20) saveEmeliaToBackend(); }}
                            />
                            <button type="button" onClick={saveEmeliaToBackend}
                                disabled={isSavingEmelia || !tempEmeliaKey || tempEmeliaKey.length < 20}
                                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isSavingEmelia ? <><Loader2 size={16} className="animate-spin" />Connexion...</> : <><Check size={16} />Connecter</>}
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">💡 Trouvez votre API key dans les paramètres de votre compte Emelia</p>
                    </div>
                </div>

                <div className="opacity-50 pointer-events-none">
                    <div className="p-6 bg-gray-800 rounded-lg border-2 border-gray-700">
                        <label className="flex items-center justify-between cursor-not-allowed">
                            <div className="flex items-center gap-3">
                                <MessageSquare size={20} className="text-gray-500" />
                                <div>
                                    <span className="text-gray-500 font-semibold text-lg">Activer le Cold Email</span>
                                    <p className="text-gray-600 text-sm mt-1">Connectez Emelia pour activer cette fonctionnalité</p>
                                </div>
                            </div>
                            <div className="w-14 h-7 bg-gray-600 rounded-full"></div>
                        </label>
                    </div>
                </div>
            </div>
        );
    }

    // ─── EMELIA CONFIGURÉ ───
    return (
        <div className="space-y-6">

            {/* Badge connexion / mode édition */}
            {isEditMode && formData.coldCampaignIdEmelia ? (
                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-blue-400" />
                            <div>
                                <p className="text-blue-400 font-semibold">Mode édition - Campagne Emelia liée</p>
                                <p className="text-sm text-blue-400/70">ID: {formData.coldCampaignIdEmelia}</p>
                            </div>
                        </div>
                        <button type="button" onClick={disconnectEmelia} className="text-red-400 hover:text-red-300 text-sm underline">Déconnecter</button>
                    </div>
                </div>
            ) : (
                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Check className="w-5 h-5 text-green-400" />
                            <div>
                                <p className="text-green-400 font-semibold">Emelia connecté avec succès</p>
                                <p className="text-sm text-green-400/70">Vous pouvez maintenant utiliser le Cold Email</p>
                            </div>
                        </div>
                        <button type="button" onClick={disconnectEmelia} className="text-red-400 hover:text-red-300 text-sm underline">Déconnecter</button>
                    </div>
                </div>
            )}

            {/* Toggle Cold Email */}
            <div className="p-6 bg-gray-800 rounded-lg border-2 border-gray-700">
                <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-3">
                        <MessageSquare size={20} className="text-blue-400" />
                        <div>
                            <span className="text-white font-semibold text-lg">Activer le Cold Email</span>
                            <p className="text-gray-400 text-sm mt-1">Envoyer automatiquement des emails après les relances LinkedIn</p>
                        </div>
                    </div>
                    <div className="relative">
                        <input type="checkbox" checked={formData.coldEmail}
                            onChange={(e) => {
                                setFormData(prev => ({ ...prev, coldEmail: e.target.checked }));
                                if (!e.target.checked) {
                                    setFormData(prev => ({ ...prev, coldDelayAfterFollowUp: "", coldEmailMode: "", coldCampaignIdEmelia: "" }));
                                }
                            }}
                            className="sr-only peer"
                        />
                        <div className="w-14 h-7 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                    </div>
                </label>
            </div>

            {formData.coldEmail && (
                <>
                    {/* Délai */}
                    <div className="p-6 bg-gray-800 rounded-lg border-2 border-gray-700">
                        <label className="flex items-center mb-3 text-sm font-medium text-white">
                            <Clock size={16} className="mr-2" />
                            Délai après la dernière relance LinkedIn *
                            <Tooltips content="Nombre de jours à attendre après la dernière relance LinkedIn avant d'envoyer le cold email">
                                <HelpCircle size={14} className="ml-2 text-gray-400 cursor-help" />
                            </Tooltips>
                        </label>
                        <div className="flex items-center gap-3">
                            <span className="text-gray-400">Attendre</span>
                            <input
                                type="number"
                                min="1"
                                value={formData.coldDelayAfterFollowUp || "1"}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value);
                                    // ✅ Bloquer si 0 ou vide, minimum 1
                                    if (!val || val < 1) {
                                        setFormData(prev => ({ ...prev, coldDelayAfterFollowUp: "1" }));
                                    } else {
                                        setFormData(prev => ({ ...prev, coldDelayAfterFollowUp: val.toString() }));
                                    }
                                }}
                                className={`w-24 p-3 border rounded-lg text-center focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white ${stepValidationErrors.coldDelayAfterFollowUp ? 'border-red-500' : 'border-gray-600'}`}
                                placeholder="1"
                            />
                            <span className="text-gray-400">jour{parseInt(formData.coldDelayAfterFollowUp) > 1 ? 's' : ''}</span>
                        </div>
                        {/* ✅ Erreur si 0 ou vide */}
                        {(!formData.coldDelayAfterFollowUp || parseInt(formData.coldDelayAfterFollowUp) < 1) && (
                            <p className="text-red-500 text-xs mt-2 flex items-center">
                                <AlertCircle size={12} className="mr-1" />
                                Le délai doit être d'au moins 1 jour
                            </p>
                        )}
                        {stepValidationErrors.coldDelayAfterFollowUp && (
                            <p className="text-red-500 text-xs mt-2 flex items-center">
                                <AlertCircle size={12} className="mr-1" />
                                {stepValidationErrors.coldDelayAfterFollowUp.message}
                            </p>
                        )}
                    </div>

                    {/* Mode de campagne - uniquement si pas de campagne déjà liée */}
                    {!formData.coldCampaignIdEmelia && (
                        <div className="p-6 bg-gray-800 rounded-lg border-2 border-gray-700">
                            <h4 className="text-white font-semibold mb-4">Mode de campagne</h4>
                            <div className="space-y-3">

                                <label className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${formData.coldEmailMode === 'existing' ? 'border-blue-500 bg-blue-900/20' : 'border-gray-600 hover:border-gray-500'}`}>
                                    <input type="radio" name="coldEmailMode" value="existing"
                                        checked={formData.coldEmailMode === 'existing'}
                                        onChange={(e) => {
                                            setFormData(prev => ({ ...prev, coldEmailMode: e.target.value }));
                                            if (emeliaCampaigns.length === 0) fetchEmeliaCampaigns();
                                        }}
                                        className="mt-1 mr-3"
                                    />
                                    <div className="flex-1">
                                        <span className="text-white font-medium">Lier à une campagne existante</span>
                                        <p className="text-gray-400 text-sm mt-1">Choisir une campagne Emelia déjà créée</p>
                                    </div>
                                </label>

                                {formData.coldEmailMode === 'existing' && (
                                    <div className="ml-10 mt-3">
                                        {emeliaLoading ? (
                                            <div className="flex items-center gap-2 text-gray-400">
                                                <Loader2 size={16} className="animate-spin" />
                                                Chargement des campagnes...
                                            </div>
                                        ) : emeliaCampaigns.length > 0 ? (
                                            <>
                                                {/* ✅ FIX: ID enregistré immédiatement AVANT loadCampaignDetails */}
                                                <select value={formData.coldCampaignIdEmelia}
                                                    onChange={(e) => {
                                                        const selectedId = e.target.value;
                                                        setFormData(prev => ({ ...prev, coldCampaignIdEmelia: selectedId }));
                                                        if (selectedId) loadCampaignDetails(selectedId);
                                                    }}
                                                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                                                >
                                                    <option value="">-- Sélectionner une campagne --</option>
                                                    {emeliaCampaigns.map(camp => (
                                                        <option key={camp._id || camp.id} value={camp._id || camp.id}>
                                                            {camp.name} {camp.emailsCount ? `(${camp.emailsCount} emails)` : ''}
                                                        </option>
                                                    ))}
                                                </select>
                                                <button type="button" onClick={fetchEmeliaCampaigns} disabled={emeliaLoading}
                                                    className="mt-2 text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1 disabled:opacity-50"
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
                                                <button type="button" onClick={fetchEmeliaCampaigns} disabled={emeliaLoading}
                                                    className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1 disabled:opacity-50"
                                                >
                                                    <RefreshCw size={14} className={emeliaLoading ? 'animate-spin' : ''} />
                                                    Réessayer
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <label className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${formData.coldEmailMode === 'auto' ? 'border-blue-500 bg-blue-900/20' : 'border-gray-600 hover:border-gray-500'}`}>
                                    <input type="radio" name="coldEmailMode" value="auto"
                                        checked={formData.coldEmailMode === 'auto'}
                                        onChange={(e) => setFormData(prev => ({ ...prev, coldEmailMode: e.target.value, coldCampaignIdEmelia: "" }))}
                                        className="mt-1 mr-3"
                                    />
                                    <div className="flex-1">
                                        <span className="text-white font-medium">Créer automatiquement</span>
                                        <p className="text-gray-400 text-sm mt-1">Une nouvelle campagne sera créée automatiquement dans Emelia</p>
                                    </div>
                                </label>
                            </div>
                        </div>
                    )}

                    {/* Badge campagne liée */}
                    {formData.coldCampaignIdEmelia && (
                        <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Check className="w-5 h-5 text-blue-400" />
                                    <div>
                                        <p className="text-blue-400 font-semibold">Campagne Emelia liée</p>
                                        <p className="text-sm text-blue-400/70">
                                            {emeliaCampaigns.find(c => (c._id || c.id) === formData.coldCampaignIdEmelia)?.name || formData.coldCampaignIdEmelia}
                                        </p>
                                    </div>
                                </div>
                                <button type="button"
                                    onClick={() => { setFormData(prev => ({ ...prev, coldCampaignIdEmelia: "", coldEmailMode: "" })); toastify.info("Campagne dissociée"); }}
                                    className="text-red-400 hover:text-red-300 text-sm underline"
                                >
                                    Dissocier
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ══════════════════════════════════════════
                        MODE EXISTING: lecture seule + séquence
                    ══════════════════════════════════════════ */}
                    {formData.coldEmailMode === "existing" && formData.coldCampaignIdEmelia && (
                        <>
                            {/* Config lecture seule */}
                            <div className="p-6 bg-gray-800 rounded-lg border-2 border-blue-500/30">
                                <div className="flex items-center gap-2 mb-5">
                                    <h4 className="text-white font-semibold">Configuration de la campagne</h4>
                                    <span className="text-xs text-blue-400 px-2 py-1 bg-blue-900/30 rounded">
                                        Lecture seule — données depuis Emelia
                                    </span>
                                </div>
                                {emeliaLoading ? (
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <Loader2 size={16} className="animate-spin" />
                                        Chargement des données...
                                    </div>
                                ) : (
                                    <div className="grid gap-4 sm:grid-cols-2 text-sm">
                                        <div className="bg-gray-700/40 rounded-lg p-3">
                                            <span className="text-gray-400 block mb-1">Timezone</span>
                                            <p className="text-white font-medium">{formData.emeliaTimezone || "—"}</p>
                                        </div>
                                        <div className="bg-gray-700/40 rounded-lg p-3">
                                            <span className="text-gray-400 block mb-1">Max nouveaux/jour</span>
                                            <p className="text-white font-medium">{formData.emeliaMaxNewPerDay || "—"}</p>
                                        </div>
                                        <div className="bg-gray-700/40 rounded-lg p-3">
                                            <span className="text-gray-400 block mb-1">Limite journalière</span>
                                            <p className="text-white font-medium">{formData.emeliaDailyLimit || "—"}</p>
                                        </div>
                                        <div className="bg-gray-700/40 rounded-lg p-3">
                                            <span className="text-gray-400 block mb-1">BCC</span>
                                            <p className="text-white font-medium">{formData.emeliaBcc || "—"}</p>
                                        </div>
                                        <div className="bg-gray-700/40 rounded-lg p-3">
                                            <span className="text-gray-400 block mb-1">Horaires d'envoi</span>
                                            <p className="text-white font-medium">
                                                {formData.emeliaSendingTimeStart && formData.emeliaSendingTimeEnd
                                                    ? `${formData.emeliaSendingTimeStart} → ${formData.emeliaSendingTimeEnd}` : "—"}
                                            </p>
                                        </div>
                                        <div className="bg-gray-700/40 rounded-lg p-3">
                                            <span className="text-gray-400 block mb-1">Jours d'envoi</span>
                                            <p className="text-white font-medium">
                                                {formData.emeliaSendingDays?.length > 0 ? formData.emeliaSendingDays.join(', ') : "—"}
                                            </p>
                                        </div>
                                        <div className="bg-gray-700/40 rounded-lg p-3">
                                            <span className="text-gray-400 block mb-1">Arrêt si</span>
                                            <p className="text-white font-medium text-xs">
                                                {[
                                                    formData.emeliaStopIfReply && "Répond",
                                                    formData.emeliaStopIfClick && "Clique",
                                                    formData.emeliaStopIfOpen && "Ouvre"
                                                ].filter(Boolean).join(', ') || "—"}
                                            </p>
                                        </div>
                                        <div className="bg-gray-700/40 rounded-lg p-3">
                                            <span className="text-gray-400 block mb-1">Tracking</span>
                                            <p className="text-white font-medium text-xs">
                                                {[
                                                    formData.emeliaTrackOpens && "Ouvertures",
                                                    formData.emeliaTrackClicks && "Clics"
                                                ].filter(Boolean).join(', ') || "—"}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* ✅ FIX PRINCIPAL: séquence - condition simplifiée sans isEditMode */}
                            {formData.emailSequence && formData.emailSequence.length > 0 ? (
                                <div className="p-6 bg-gray-800 rounded-lg border-2 border-gray-700">
                                    <div className="flex items-center justify-between mb-6">
                                        <h4 className="text-white font-semibold flex items-center gap-2">
                                            <MessageSquare size={18} className="text-blue-400" />
                                            Séquence d'emails (depuis Emelia)
                                        </h4>
                                        <span className="text-sm text-gray-400">
                                            {formData.emailSequence.length} étape{formData.emailSequence.length > 1 ? 's' : ''}
                                        </span>
                                    </div>
                                    <div className="relative mb-6">
                                        <EmailTimeline 
                                        color="blue"
                                        formData={formData}
                                        emailStepSelected={emailStepSelected}
                                        setEmailStepSelected={setEmailStepSelected}
                                        supprimerEmailStep={supprimerEmailStep}
                                        ajouterEmailStep={ajouterEmailStep}
                                    />
                                    </div>
                                    <EmailEditor 
                                        color="blue"
                                        emailStepSelected={emailStepSelected}
                                        formData={formData}
                                        deplacerEmailStep={deplacerEmailStep}
                                        modifierEmailDelay={modifierEmailDelay}
                                        modifierEmailStep={modifierEmailStep}
                                        emailTemplates={emailTemplates}
                                        setEmailStepSelected={setEmailStepSelected}
                                    />
                                    <div className="mt-4 p-3 bg-blue-900/20 border border-blue-600 rounded-lg">
                                        <p className="text-blue-300 text-sm">
                                            ✏️ Vous pouvez modifier cette séquence. Les changements seront synchronisés avec Emelia lors de la sauvegarde.
                                        </p>
                                    </div>
                                </div>
                            ) : emeliaLoading ? (
                                <div className="p-6 bg-gray-800 rounded-lg border-2 border-gray-700 flex items-center gap-3 text-gray-400">
                                    <Loader2 size={18} className="animate-spin" />
                                    Chargement de la séquence d'emails...
                                </div>
                            ) : null}
                        </>
                    )}

                    {/* ══════════════════════════════════════════
                        MODE AUTO: config éditable + séquence
                    ══════════════════════════════════════════ */}
                    {formData.coldEmailMode === "auto" && (
                        <>
                            <div className="p-6 bg-gray-800 rounded-lg border-2 border-gray-700">
                                <h4 className="text-white font-semibold mb-4">Configuration de la campagne Emelia</h4>

                                <div className="grid gap-6 sm:grid-cols-2 mb-6">
                                    <div>
                                        <label className="text-sm text-gray-400 mb-2 block">Zone géographique</label>
                                        <select value={formData.emeliaTimezone}
                                            onChange={(e) => setFormData(prev => ({ ...prev, emeliaTimezone: e.target.value }))}
                                            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">-- Sélectionner un fuseau horaire --</option>
                                            {Object.entries(timezoneOptions).map(([gmt, zones]) => (
                                                <optgroup key={gmt} label={gmt}>
                                                    {zones.map(zone => <option key={zone} value={zone}>{zone.replace(/_/g, ' ')}</option>)}
                                                </optgroup>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-400 mb-2 block">
                                            Nombre maximal de nouvelles personnes par jour
                                            <Tooltips content="Nombre de nouveaux contacts à contacter quotidiennement">
                                                <HelpCircle size={14} className="ml-1 inline text-gray-500 cursor-help" />
                                            </Tooltips>
                                        </label>
                                        <input type="number" min="1" max="100" value={formData.emeliaMaxNewPerDay}
                                            onChange={(e) => setFormData(prev => ({ ...prev, emeliaMaxNewPerDay: e.target.value }))}
                                            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                                            placeholder="35"
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-6 sm:grid-cols-2 mb-6">
                                    <div>
                                        <label className="text-sm text-gray-400 mb-2 block">Limite d'envoi journalier</label>
                                        <input type="number" min="1" value={formData.emeliaDailyLimit}
                                            onChange={(e) => setFormData(prev => ({ ...prev, emeliaDailyLimit: e.target.value }))}
                                            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                                            placeholder="100"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-400 mb-2 block">BCC (facultatif)</label>
                                        <input type="email" value={formData.emeliaBcc}
                                            onChange={(e) => setFormData(prev => ({ ...prev, emeliaBcc: e.target.value }))}
                                            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                                            placeholder="email@example.com"
                                        />
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <label className="text-sm text-gray-400 mb-3 block">Jours d'envois</label>
                                    <div className="grid grid-cols-7 gap-2">
                                        {joursOptions.map((jour) => (
                                            <button key={jour.id} type="button"
                                                onClick={() => {
                                                    const isSelected = formData.emeliaSendingDays.includes(jour.id);
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        emeliaSendingDays: isSelected
                                                            ? prev.emeliaSendingDays.filter(j => j !== jour.id)
                                                            : [...prev.emeliaSendingDays, jour.id]
                                                    }));
                                                }}
                                                className={`p-3 rounded-lg border-2 transition-all ${formData.emeliaSendingDays.includes(jour.id) ? 'border-blue-500 bg-blue-900/30 text-blue-300' : 'border-gray-600 hover:border-gray-500 text-gray-400'}`}
                                            >
                                                <div className="text-center text-xs">{jour.label}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid gap-6 sm:grid-cols-2 mb-6">
                                    <div>
                                        <label className="text-sm text-gray-400 mb-2 block">Entre</label>
                                        <input type="time" value={formData.emeliaSendingTimeStart}
                                            onChange={(e) => setFormData(prev => ({ ...prev, emeliaSendingTimeStart: e.target.value }))}
                                            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-400 mb-2 block">et</label>
                                        <input type="time" value={formData.emeliaSendingTimeEnd}
                                            onChange={(e) => setFormData(prev => ({ ...prev, emeliaSendingTimeEnd: e.target.value }))}
                                            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <label className="text-sm text-gray-400 mb-3 block">Ne plus envoyer d'emails si l'utilisateur :</label>
                                    <div className="space-y-2">
                                        {[
                                            { key: 'emeliaStopIfReply', label: 'Répond' },
                                            { key: 'emeliaStopIfClick', label: 'Clique sur un lien' },
                                            { key: 'emeliaStopIfOpen', label: "Ouvre l'email" }
                                        ].map(({ key, label }) => (
                                            <label key={key} className="flex items-center gap-3 cursor-pointer">
                                                <input type="checkbox" checked={formData[key]}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, [key]: e.target.checked }))}
                                                    className="w-4 h-4 rounded border-gray-600 text-blue-600 bg-gray-700" />
                                                <span className="text-white">{label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm text-gray-400 mb-3 block">Réglages supplémentaires :</label>
                                    <div className="space-y-3">
                                        {[
                                            { key: 'emeliaAddToBlacklistIfUnsubscribed', label: "Ajouter en blacklist si 'UNSUBSCRIBED'" },
                                            { key: 'emeliaTrackOpens', label: "Tracker les ouvertures d'email" },
                                            { key: 'emeliaTrackClicks', label: "Tracker les liens cliqués" }
                                        ].map(({ key, label }) => (
                                            <label key={key} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-700/70">
                                                <span className="text-white text-sm">{label}</span>
                                                <div className="relative">
                                                    <input type="checkbox" checked={formData[key]}
                                                        onChange={(e) => setFormData(prev => ({ ...prev, [key]: e.target.checked }))}
                                                        className="sr-only peer" />
                                                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Séquence auto - lecture seule */}
                            {formData.emailSequence && formData.emailSequence.length > 0 && (
                                <div className="p-6 bg-gray-800 rounded-lg border-2 border-gray-700">
                                    <div className="flex items-center gap-2 mb-5">
                                        <h4 className="text-white font-semibold flex items-center gap-2">
                                            <MessageSquare size={18} className="text-green-400" />
                                            Séquence d'emails générée
                                        </h4>
                                        <span className="text-xs text-green-400 px-2 py-1 bg-green-900/30 rounded">
                                            Lecture seule
                                        </span>
                                        <span className="text-sm text-gray-400 ml-auto">
                                            {formData.emailSequence.length} étape{formData.emailSequence.length > 1 ? 's' : ''}
                                        </span>
                                    </div>
                                    <div className="relative mb-6">
                                        <EmailTimeline 
                                        color="green"
                                        formData={formData}
                                        emailStepSelected={emailStepSelected}
                                        setEmailStepSelected={setEmailStepSelected}
                                        supprimerEmailStep={supprimerEmailStep}
                                        ajouterEmailStep={ajouterEmailStep}
                                    />
                                    </div>
                                    <EmailEditor 
                                        color="green"
                                        readOnly={true}
                                        emailStepSelected={emailStepSelected}
                                        formData={formData}
                                        deplacerEmailStep={deplacerEmailStep}
                                        modifierEmailDelay={modifierEmailDelay}
                                        modifierEmailStep={modifierEmailStep}
                                        emailTemplates={emailTemplates}
                                        setEmailStepSelected={setEmailStepSelected}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </>
            )}
        </div>
    );
};
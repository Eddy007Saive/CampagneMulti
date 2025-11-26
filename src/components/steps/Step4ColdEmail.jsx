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
import Tooltips from "../ui/Tooltips";
export const Step4ColdEmail = ({
    formData,
    setFormData,
    emeliaConnected,
    emeliaLoading,
    emeliaCampaigns,
    connectEmelia,
    fetchEmeliaCampaigns,
    disconnectEmelia,
    stepValidationErrors,
    emailStepSelected
}) => {

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
    ]

    const ajouterEmailStep = () => {
        const nouvelleStep = {
            id: Date.now(),
            delay: { amount: 1, unit: "DAYS" },
            subject: "",
            message: "",
            rawHtml: false,
            disabled: false,
            attachments: []
        };

        setFormData(prev => ({
            ...prev,
            emailSequence: [...prev.emailSequence, nouvelleStep]
        }));

        setEmailStepSelected(nouvelleStep.id);
    };

    const supprimerEmailStep = (id) => {
        if (formData.emailSequence.length <= 1) {
            toastify.warning("Vous devez avoir au moins un email dans la séquence");
            return;
        }

        setFormData(prev => ({
            ...prev,
            emailSequence: prev.emailSequence.filter(s => s.id !== id)
        }));

        if (emailStepSelected === id) {
            setEmailStepSelected(formData.emailSequence[0]?.id);
        }
    };

    const modifierEmailStep = (id, champ, valeur) => {
        setFormData(prev => ({
            ...prev,
            emailSequence: prev.emailSequence.map(s =>
                s.id === id ? { ...s, [champ]: valeur } : s
            )
        }));
    };

    const modifierEmailDelay = (id, field, value) => {
        setFormData(prev => ({
            ...prev,
            emailSequence: prev.emailSequence.map(s =>
                s.id === id ? { ...s, delay: { ...s.delay, [field]: value } } : s
            )
        }));
    };

    const deplacerEmailStep = (index, direction) => {
        const newSequence = [...formData.emailSequence];
        const newIndex = direction === 'up' ? index - 1 : index + 1;

        if (newIndex < 0 || newIndex >= newSequence.length) return;

        [newSequence[index], newSequence[newIndex]] = [newSequence[newIndex], newSequence[index]];

        setFormData(prev => ({ ...prev, emailSequence: newSequence }));
    };
    const joursOptions = [
        { id: 'Lundi', label: 'Lundi', short: 'L' },
        { id: 'Mardi', label: 'Mardi', short: 'M' },
        { id: 'Mercredi', label: 'Mercredi', short: 'M' },
        { id: 'Jeudi', label: 'Jeudi', short: 'J' },
        { id: 'Vendredi', label: 'Vendredi', short: 'V' },
        { id: 'Samedi', label: 'Samedi', short: 'S' },
        { id: 'Dimanche', label: 'Dimanche', short: 'D' }
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
                            <Tooltips content="Nombre de jours à attendre après la dernière relance LinkedIn avant d'envoyer le cold email">
                                <HelpCircle size={14} className="ml-2 text-gray-400 cursor-help" />
                            </Tooltips>
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
                        <>
                            <div className="p-6 bg-gray-800 rounded-lg border-2 border-gray-700">
                                <h4 className="text-white font-semibold mb-4">Mode de campagne</h4>

                                <div className="space-y-3">
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
                                                                                {selected.emailsCount} emails • {selected.status || ''}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                ) : null;
                                                            })()}
                                                        </div>
                                                    )}

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

                            {/* 🆕 CONFIGURATION EMELIA (nouvelle ou existante) */}
                            <div className="p-6 bg-gray-800 rounded-lg border-2 border-gray-700">
                                <h4 className="text-white font-semibold mb-4">Configuration de la campagne Emelia</h4>

                                {/* Zone géographique + Max nouvelles personnes */}
                                <div className="grid gap-6 sm:grid-cols-2 mb-6">
                                    <div>
                                        <label className="text-sm text-gray-400 mb-2 block">Zone géographique</label>
                                        <select
                                            value={formData.emeliaTimezone}
                                            onChange={(e) => setFormData(prev => ({ ...prev, emeliaTimezone: e.target.value }))}
                                            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="(GMT+1:00) Brussels, Copenhagen, Madrid, Paris">(GMT+1:00) Brussels, Copenhagen, Madrid, Paris</option>
                                            <option value="(GMT+0:00) London">(GMT+0:00) London</option>
                                            <option value="(GMT-5:00) New York">(GMT-5:00) New York</option>
                                            {/* Ajouter d'autres timezones si nécessaire */}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-sm text-gray-400 mb-2 block">
                                            Nombre maximal de nouvelles personnes à atteindre par jour
                                            <Tooltips content="Nombre de nouveaux contacts à contacter quotidiennement">
                                                <HelpCircle size={14} className="ml-1 inline text-gray-500 cursor-help" />
                                            </Tooltips>
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="100"
                                            value={formData.emeliaMaxNewPerDay}
                                            onChange={(e) => setFormData(prev => ({ ...prev, emeliaMaxNewPerDay: e.target.value }))}
                                            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                                            placeholder="35"
                                        />
                                    </div>
                                </div>

                                {/* Limite d'envoi + BCC */}
                                <div className="grid gap-6 sm:grid-cols-2 mb-6">
                                    <div>
                                        <label className="text-sm text-gray-400 mb-2 block">Limite d'envoi journalier</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={formData.emeliaDailyLimit}
                                            onChange={(e) => setFormData(prev => ({ ...prev, emeliaDailyLimit: e.target.value }))}
                                            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                                            placeholder="100"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm text-gray-400 mb-2 block">BCC (facultatif)</label>
                                        <input
                                            type="email"
                                            value={formData.emeliaBcc}
                                            onChange={(e) => setFormData(prev => ({ ...prev, emeliaBcc: e.target.value }))}
                                            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                                            placeholder="email@example.com"
                                        />
                                    </div>
                                </div>

                                {/* Jours d'envois */}
                                <div className="mb-6">
                                    <label className="text-sm text-gray-400 mb-3 block">Jours d'envois</label>
                                    <div className="grid grid-cols-7 gap-2">
                                        {joursOptions.map((jour) => (
                                            <button
                                                key={jour.id}
                                                type="button"
                                                onClick={() => {
                                                    const isSelected = formData.emeliaSendingDays.includes(jour.id);
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        emeliaSendingDays: isSelected
                                                            ? prev.emeliaSendingDays.filter(j => j !== jour.id)
                                                            : [...prev.emeliaSendingDays, jour.id]
                                                    }));
                                                }}
                                                className={`p-3 rounded-lg border-2 transition-all ${formData.emeliaSendingDays.includes(jour.id)
                                                    ? 'border-blue-500 bg-blue-900/30 text-blue-300'
                                                    : 'border-gray-600 hover:border-gray-500 text-gray-400'
                                                    }`}
                                            >
                                                <div className="text-center">
                                                    <div className="text-xs">{jour.label}</div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Horaires d'envoi */}
                                <div className="grid gap-6 sm:grid-cols-2 mb-6">
                                    <div>
                                        <label className="text-sm text-gray-400 mb-2 block">Entre</label>
                                        <input
                                            type="time"
                                            value={formData.emeliaSendingTimeStart}
                                            onChange={(e) => setFormData(prev => ({ ...prev, emeliaSendingTimeStart: e.target.value }))}
                                            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm text-gray-400 mb-2 block">et</label>
                                        <input
                                            type="time"
                                            value={formData.emeliaSendingTimeEnd}
                                            onChange={(e) => setFormData(prev => ({ ...prev, emeliaSendingTimeEnd: e.target.value }))}
                                            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>

                                {/* Ne plus envoyer d'emails si */}
                                <div className="mb-6">
                                    <label className="text-sm text-gray-400 mb-3 block">Ne plus envoyer d'emails si l'utilisateur :</label>
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.emeliaStopIfReply}
                                                onChange={(e) => setFormData(prev => ({ ...prev, emeliaStopIfReply: e.target.checked }))}
                                                className="w-4 h-4 rounded border-gray-600 text-blue-600 focus:ring-blue-500 bg-gray-700"
                                            />
                                            <span className="text-white">Répond</span>
                                        </label>
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.emeliaStopIfClick}
                                                onChange={(e) => setFormData(prev => ({ ...prev, emeliaStopIfClick: e.target.checked }))}
                                                className="w-4 h-4 rounded border-gray-600 text-blue-600 focus:ring-blue-500 bg-gray-700"
                                            />
                                            <span className="text-white">Clique sur un lien</span>
                                        </label>
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.emeliaStopIfOpen}
                                                onChange={(e) => setFormData(prev => ({ ...prev, emeliaStopIfOpen: e.target.checked }))}
                                                className="w-4 h-4 rounded border-gray-600 text-blue-600 focus:ring-blue-500 bg-gray-700"
                                            />
                                            <span className="text-white">Ouvre l'email</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Réglages supplémentaires */}
                                <div>
                                    <label className="text-sm text-gray-400 mb-3 block">Réglages supplémentaires :</label>
                                    <div className="space-y-3">
                                        <label className="flex items-center justify-between cursor-pointer p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700/70 transition">
                                            <span className="text-white text-sm">Ajouter en blacklist si 'UNSUBSCRIBED'</span>
                                            <div className="relative">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.emeliaAddToBlacklistIfUnsubscribed}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, emeliaAddToBlacklistIfUnsubscribed: e.target.checked }))}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            </div>
                                        </label>

                                        <label className="flex items-center justify-between cursor-pointer p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700/70 transition">
                                            <span className="text-white text-sm">Tracker les ouvertures d'email</span>
                                            <div className="relative">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.emeliaTrackOpens}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, emeliaTrackOpens: e.target.checked }))}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            </div>
                                        </label>

                                        <label className="flex items-center justify-between cursor-pointer p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700/70 transition">
                                            <span className="text-white text-sm">Tracker les liens cliqués</span>
                                            <div className="relative">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.emeliaTrackClicks}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, emeliaTrackClicks: e.target.checked }))}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>


                        </>
                    )}



                </>
            )}

            {/* 🆕 SÉQUENCE D'EMAILS */}
            {emeliaConnected && (formData.coldEmailMode == "auto") && (
                <div className="p-6 bg-gray-800 rounded-lg border-2 border-gray-700">
                    <div className="flex items-center justify-between mb-6">
                        <h4 className="text-white font-semibold flex items-center gap-2">
                            <MessageSquare size={18} className="text-green-400" />
                            Votre séquence d'emails
                        </h4>
                        <span className="text-sm text-gray-400">
                            {formData.emailSequence.length} étape{formData.emailSequence.length > 1 ? 's' : ''}
                        </span>
                    </div>

                    {/* Timeline des steps */}
                    <div className="relative mb-6">
                        <div className="flex gap-4 overflow-x-auto pb-6 px-2">
                            {formData.emailSequence.map((step, index) => (
                                <React.Fragment key={step.id}>
                                    <div className="flex-shrink-0 w-48">
                                        <button
                                            type="button"
                                            onClick={() => setEmailStepSelected(step.id)}
                                            className={`w-full relative rounded-lg p-4 transition-all duration-200 shadow-lg cursor-pointer ${emailStepSelected === step.id
                                                ? 'bg-gray-800 border-2 border-green-500'
                                                : 'bg-gray-800 border-2 border-gray-700 hover:border-green-400'
                                                }`}
                                        >
                                            <div className="flex flex-col items-center gap-2">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${index === 0 ? 'bg-green-600' : 'bg-purple-600'
                                                    }`}>
                                                    <MessageSquare size={20} className="text-white" />
                                                </div>
                                                <span className="text-white font-semibold text-sm">
                                                    {index === 0 ? 'Email initial' : `Follow-up ${index}`}
                                                </span>
                                                <span className="text-gray-400 text-xs">
                                                    {index === 0
                                                        ? 'Immédiat'
                                                        : `Attendre ${step.delay.amount} ${step.delay.unit === 'DAYS' ? 'jour(s)' : step.delay.unit === 'HOURS' ? 'heure(s)' : 'minute(s)'}`
                                                    }
                                                </span>
                                            </div>

                                            {step.subject && step.message && (
                                                <div className="mt-2 text-center">
                                                    <span className="text-xs text-green-400">✓ Configuré</span>
                                                </div>
                                            )}

                                            {index > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        supprimerEmailStep(step.id);
                                                    }}
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
                                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                <div className="w-8 h-0.5 bg-gradient-to-r from-green-500 to-purple-500"></div>
                                                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                            </div>
                                        </div>
                                    )}
                                </React.Fragment>
                            ))}

                            <div className="flex-shrink-0 w-48">
                                <button
                                    type="button"
                                    onClick={ajouterEmailStep}
                                    className="w-full h-full min-h-[140px] border-2 border-dashed border-gray-600 rounded-lg hover:border-green-500 hover:bg-green-900/10 transition-all flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-green-400"
                                >
                                    <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                                        <Plus size={20} />
                                    </div>
                                    <span className="font-medium text-sm">Ajouter un follow-up</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Éditeur de l'email sélectionné */}
                    <div className="p-6 bg-gray-900 rounded-lg border border-gray-700">
                        {(() => {
                            const currentStep = formData.emailSequence.find(s => s.id === emailStepSelected);
                            const stepIndex = formData.emailSequence.findIndex(s => s.id === emailStepSelected);
                            if (!currentStep) return null;

                            return (
                                <>
                                    <div className="flex items-center justify-between mb-4">
                                        <h5 className="text-white font-semibold flex items-center gap-2">
                                            <MessageSquare size={16} className={stepIndex === 0 ? 'text-green-400' : 'text-purple-400'} />
                                            {stepIndex === 0 ? 'Email initial' : `Follow-up ${stepIndex}`}
                                        </h5>
                                        <div className="flex items-center gap-2">
                                            {stepIndex > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => deplacerEmailStep(stepIndex, 'up')}
                                                    className="p-1.5 text-gray-400 hover:text-green-400 transition-colors"
                                                    title="Déplacer vers le haut"
                                                >
                                                    <MoveUp size={16} />
                                                </button>
                                            )}
                                            {stepIndex < formData.emailSequence.length - 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => deplacerEmailStep(stepIndex, 'down')}
                                                    className="p-1.5 text-gray-400 hover:text-green-400 transition-colors"
                                                    title="Déplacer vers le bas"
                                                >
                                                    <MoveDown size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Délai (sauf pour le premier email) */}
                                    {stepIndex > 0 && (
                                        <div className="mb-4">
                                            <label className="text-xs text-gray-400 mb-2 block">Délai d'attente</label>
                                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-900/30 border border-purple-600 rounded-lg">
                                                <Clock size={16} className="text-purple-400" />
                                                <span className="text-purple-300">Attendre</span>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={currentStep.delay.amount}
                                                    onChange={(e) => modifierEmailDelay(currentStep.id, 'amount', parseInt(e.target.value))}
                                                    className="w-16 bg-gray-900 border border-purple-500 rounded text-purple-300 text-center focus:outline-none focus:border-purple-400 px-2 py-1"
                                                />
                                                <select
                                                    value={currentStep.delay.unit}
                                                    onChange={(e) => modifierEmailDelay(currentStep.id, 'unit', e.target.value)}
                                                    className="bg-gray-900 border border-purple-500 rounded text-purple-300 focus:outline-none focus:border-purple-400 px-2 py-1"
                                                >
                                                    <option value="MINUTES">minute(s)</option>
                                                    <option value="HOURS">heure(s)</option>
                                                    <option value="DAYS">jour(s)</option>
                                                </select>
                                            </div>
                                        </div>
                                    )}

                                    {/* Templates suggérés */}
                                    <div className="mb-4">
                                        <label className="text-xs text-gray-400 mb-2 block">Templates suggérés :</label>
                                        <div className="flex flex-wrap gap-2">
                                            {emailTemplates.map((template, tIndex) => (
                                                <button
                                                    key={tIndex}
                                                    type="button"
                                                    onClick={() => {
                                                        modifierEmailStep(currentStep.id, 'subject', template.subject);
                                                        modifierEmailStep(currentStep.id, 'message', template.message);
                                                    }}
                                                    className="px-3 py-1.5 text-xs bg-gray-700 hover:bg-gray-600 rounded transition-colors text-gray-300"
                                                >
                                                    {template.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Sujet */}
                                    <div className="mb-4">
                                        <label className="text-xs text-gray-400 mb-2 block">Sujet de l'email *</label>
                                        <input
                                            type="text"
                                            value={currentStep.subject}
                                            onChange={(e) => modifierEmailStep(currentStep.id, 'subject', e.target.value)}
                                            placeholder="Ex: Re: Notre discussion sur..."
                                            className="w-full bg-gray-800 border border-gray-600 rounded px-4 py-3 text-white focus:border-green-500 focus:outline-none placeholder-gray-500"
                                        />
                                    </div>

                                    {/* Message */}
                                    <div className="mb-4">
                                        <label className="text-xs text-gray-400 mb-2 block">Message *</label>
                                        <textarea
                                            value={currentStep.message}
                                            onChange={(e) => modifierEmailStep(currentStep.id, 'message', e.target.value)}
                                            rows={8}
                                            placeholder="Bonjour {Prénom},&#10;&#10;Je me permets de revenir vers vous..."
                                            className="w-full bg-gray-800 border border-gray-600 rounded px-4 py-3 text-white focus:border-green-500 focus:outline-none resize-none placeholder-gray-500 font-mono text-sm"
                                        />
                                        <div className="flex items-center justify-between mt-2">
                                            <div className="text-xs text-gray-500">
                                                {currentStep.message?.length || 0} caractères
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={currentStep.rawHtml}
                                                        onChange={(e) => modifierEmailStep(currentStep.id, 'rawHtml', e.target.checked)}
                                                        className="w-4 h-4 rounded border-gray-600 text-green-600 focus:ring-green-500 bg-gray-700"
                                                    />
                                                    <span className="text-xs text-gray-400">HTML brut</span>
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={currentStep.disabled}
                                                        onChange={(e) => modifierEmailStep(currentStep.id, 'disabled', e.target.checked)}
                                                        className="w-4 h-4 rounded border-gray-600 text-red-600 focus:ring-red-500 bg-gray-700"
                                                    />
                                                    <span className="text-xs text-gray-400">Désactiver</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Variables disponibles */}
                                    <div className="p-3 bg-blue-900/20 border border-blue-600 rounded-lg">
                                        <p className="text-blue-300 text-xs mb-2">💡 Variables disponibles :</p>
                                        <div className="flex flex-wrap gap-2">
                                            {['{Prénom}', '{Nom}', '{Entreprise}', '{Poste}', '{Email}'].map(variable => (
                                                <code
                                                    key={variable}
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(variable);
                                                        toastify.success(`${variable} copié !`);
                                                    }}
                                                    className="px-2 py-1 bg-blue-800/50 rounded text-blue-200 text-xs cursor-pointer hover:bg-blue-800 transition"
                                                >
                                                    {variable}
                                                </code>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                </div>
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
};
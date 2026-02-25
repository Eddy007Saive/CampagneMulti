
import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Progress,
  Chip,
  Button,
  Switch,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Tabs,
  TabsHeader,
  TabsBody,
  Tab,
  TabPanel,
  Alert,
  Spinner,
  IconButton,
} from "@material-tailwind/react";
import {
  UserGroupIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  CalendarDaysIcon,
  ChartPieIcon,
  FunnelIcon,
  SparklesIcon,
  ArrowPathIcon,
  PlayIcon,
  BoltIcon,
  UserPlusIcon,
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  StopIcon,
  MapPinIcon,
  BriefcaseIcon,
  ArrowDownTrayIcon,
  PauseCircleIcon,
  CursorArrowRippleIcon,
  InboxIcon,
  PaperAirplaneIcon,
  ExclamationCircleIcon,
  SignalIcon,
  ClipboardDocumentCheckIcon
} from "@heroicons/react/24/outline";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Legend,
  Line
} from "recharts";

import { getCampagneById, lancerCampagne, deleteCampagne, updateCampagneStatus, deleteCampagneWithContacts, updateCampagneEnrichissement } from '@/services/Campagne';
import { getContactsByCampaignId, exportContactsSansReponseCSV } from '@/services/Contact';
import { useParams, useNavigate } from "react-router-dom";
import ModernProgressBar from "@/utils/ModernBar";
import CompactTimelineProgress from "@/utils/CompactTimelineProgress";
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import Loading from "@/components/Loading";
import { getCampaignStatistics as getCampaignStatisticsEmelia, getCampaignactivities } from "@/services/Emelia";

const SERVER_URL = import.meta.env.VITE_BASE_URL
// Hook personnalisé pour les Server-Sent Events
const useSSE = () => {
  const [events, setEvents] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const connectToWorkflow = async (endpoint, payload) => {
    try {
      setIsConnected(true);
      setEvents([]);

      const token = localStorage.getItem("accessToken");
      const response = await fetch(`${SERVER_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify(payload),
      });


      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      const readStream = async () => {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data:')) {
                try {
                  const data = JSON.parse(line.replace('data:', '').trim());
                  setEvents(prev => [...prev, {
                    id: Date.now() + Math.random(),
                    timestamp: new Date(),
                    ...data
                  }]);
                } catch (e) {
                  // Ignorer les lignes non-JSON
                }
              }
            }
          }
        } catch (error) {
          console.error('Erreur lecture stream:', error);
          setEvents(prev => [...prev, {
            id: Date.now(),
            timestamp: new Date(),
            error: error.message
          }]);
        } finally {
          setIsConnected(false);
        }
      };

      readStream();
    } catch (error) {
      console.log(error);

      setIsConnected(false);
      setEvents(prev => [...prev, {
        id: Date.now(),
        timestamp: new Date(),
        error: error.message
      }]);
    }
  };

  return { events, isConnected, connectToWorkflow, clearEvents: () => setEvents([]) };
};



export function CampaignDetailDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const campaignId = id;

  // Hook SSE pour les workflows
  const { events, isConnected, connectToWorkflow, clearEvents } = useSSE();

  // États pour les données de campagne
  const [campaignData, setCampaignData] = useState(null);
  const [contactsData, setContactsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // États pour les statistiques calculées
  const [stats, setStats] = useState({
    totalContacts: 0,
    messagesSent: 0,
    responsesReceived: 0,
    interested: 0,
    profilesEnAttente: 0,
    profilesGarde: 0,
    profilesRejete: 0,
    responseRate: 0,
    interestRate: 0,
    profilesValideSansMessage: 0,
    profilesValideAvecMessage: 0,
  });

  const [emeliaStats, setEmeliaStats] = useState({
    totalSent: 892,
    delivered: 854,
    deliveryRate: 95.7,
    opened: 342,
    openRate: 40.0,
    clicked: 89,
    clickRate: 10.4,
    replied: 156,
    replyRate: 18.3,
    bounced: 38,
    bounceRate: 4.3,
    unsubscribed: 12,
    unsubscribeRate: 1.4,
    lastSync: new Date(),
    campaignStatus: "active",
    dailyLimit: 50,
    sent24h: 42,
  });

  const [emeliaActivities, setEmeliaActivities] = useState([]);

  const [emeliaPerformanceData, setemeliaPerformanceData] = useState([]);

  const [syncingEmelia, setSyncingEmelia] = useState(false);

  // États UI
  const [activeTab, setActiveTab] = useState("overview");
  const [isTrierDialogOpen, setIsTrierDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);

  // États pour les actions asynchrones
  const [isTrierLoading, setIsTrierLoading] = useState(false);
  const [isRetrierLoading, setIsRetrierLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [terminating, setTerminating] = useState(false);
  const [launchingCampaign, setLaunchingCampaign] = useState(false);
  const [pauseCampaign, setpauseCampaign] = useState(false);

  const [trashContactReject, setcontactReject] = useState(false);
  const [stopEnrichissement, setstopEnrichissement] = useState(false);
  const [generatingNewMessages, setGeneratingNewMessages] = useState(false);
  const [regeneratingMessages, setRegeneratingMessages] = useState(false);
  const [enriching, setEnriching] = useState(false);
  const [deleteOption, setDeleteOption] = useState('campaign-only');



  const handleSyncEmelia = () => {
    setSyncingEmelia(true);
    setTimeout(() => {
      setEmeliaStats(prev => ({ ...prev, lastSync: new Date() }));
      setSyncingEmelia(false);
    }, 2000);
  };


  const ActivityItem = ({ activity }) => {

    const getIcon = () => {
      switch (activity.type) {
        case "opened": return <EyeIcon className="h-5 w-5 text-blue-500" />;
        case "clicked": return <CursorArrowRippleIcon className="h-5 w-5 text-purple-500" />;
        case "sent": return <PaperAirplaneIcon className="h-5 w-5 text-green-500" />;
        case "replied": return <ChatBubbleLeftRightIcon className="h-5 w-5 text-indigo-500" />;
        case "bounced": return <ExclamationCircleIcon className="h-5 w-5 text-red-500" />;
        default: return <EnvelopeIcon className="h-5 w-5 text-gray-500" />;
      }
    };
    const getLabel = () => {
      switch (activity.type) {
        case "opened": return "a ouvert le message";
        case "clicked": return "a cliqué sur le lien";
        case "sent": return "envoyés avec succès";
        case "replied": return "a répondu";
        case "bounced": return "bounce (email invalide)";
        default: return "activité";
      }
    };

    const timeAgo = () => {
      const activityDate = new Date(activity.timestamp);
      const now = Date.now();
      const diffMs = now - activityDate.getTime();

      const minutes = Math.floor(diffMs / (1000 * 60));
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (minutes < 1) return "À l'instant";
      if (minutes < 60) return `Il y a ${minutes} min`;
      if (hours < 24) return `Il y a ${hours}h`;
      if (days < 30) return `Il y a ${days}j`;

      const months = Math.floor(days / 30);
      return `Il y a ${months} mois`;
    };


    return (
      <div className="flex-1 min-w-0">
        <Typography variant="small" className="font-medium text-blanc-pur">
          {activity.contact} {getLabel()}
        </Typography>
        <Typography variant="small" className="text-gris-clair/60 text-xs mt-1">
          {timeAgo()}
        </Typography>
      </div>
    );
  };

  const emeliaFunnelData = [
    { name: "Envoyés", value: emeliaStats.totalSent, fill: "#3B82F6" },
    { name: "Délivrés", value: emeliaStats.delivered, fill: "#10B981" },
    { name: "Ouverts", value: emeliaStats.opened, fill: "#8B5CF6" },
    { name: "Cliqués", value: emeliaStats.clicked, fill: "#F59E0B" },
    { name: "Répondus", value: emeliaStats.replied, fill: "#06B6D4" },
  ];

  // Fonction pour calculer les statistiques à partir des contacts
  const calculateStats = (contacts) => {
    const totalContacts = contacts.length;

    const messagesSent = contacts.filter(c =>
      ['Message envoyé', 'Répondu', 'Pas intéressé', 'Rendez-vous pris'].includes(c.statut)
    ).length;

    const responsesReceived = contacts.filter(c =>
      ['Répondu', 'Pas intéressé', 'Rendez-vous pris'].includes(c.statut)
    ).length;

    const interested = contacts.filter(c =>
      c.statut === 'Rendez-vous pris'
    ).length;

    const profilesEnAttente = contacts.filter(c =>
      c.profil === 'En attente' || !c.profil
    ).length;

    const profilesValideSansMessage = contacts.filter(contact =>
      (!contact.messagePersonnalise || contact.messagePersonnalise.trim() === "")
      && contact.profil === "GARDE"
    ).length;

    const profilesValideAvecMessage = contacts.filter(contact =>
      (contact.messagePersonnalise && contact.messagePersonnalise.trim() !== "")
      && contact.profil === "GARDE"
    ).length;

    const profilesGarde = contacts.filter(c =>
      c.profil === 'GARDE'
    ).length;

    const profilesRejete = contacts.filter(c =>
      c.profil === 'REJETE'
    ).length;

    const responseRate = messagesSent > 0 ? ((responsesReceived / messagesSent) * 100) : 0;
    const interestRate = totalContacts > 0 ? ((interested / totalContacts) * 100) : 0;

    return {
      totalContacts,
      messagesSent,
      responsesReceived,
      interested,
      profilesEnAttente,
      profilesGarde,
      profilesRejete,
      responseRate: Math.round(responseRate * 10) / 10,
      interestRate: Math.round(interestRate * 10) / 10,
      profilesValideSansMessage,
      profilesValideAvecMessage
    };
  };

  // Fonction pour générer les données de performance basées sur les vrais contacts
  const generatePerformanceData = (contacts) => {
    const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    const now = new Date();

    return days.map((day, index) => {
      const date = new Date(now);
      date.setDate(date.getDate() - (6 - index));

      const dayContacts = contacts.filter(contact => {
        if (!contact.dateMessage) return false;
        const messageDate = new Date(contact.dateMessage);
        return messageDate.toDateString() === date.toDateString();
      });

      return {
        date: day,
        messages: dayContacts.length,
        responses: dayContacts.filter(c =>
          ['Répondu', 'Pas intéressé', 'Rendez-vous pris'].includes(c.statut)
        ).length,
        interested: dayContacts.filter(c => c.statut === 'Rendez-vous pris').length,
      };
    });
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const campaignResponse = await getCampagneById(campaignId);
        const campaign = campaignResponse.data;
        setCampaignData(campaign);
        console.log("Données de la campagne récupérées:", campaign);

        const contactsResponse = await getContactsByCampaignId(campaignId);
        const contacts = contactsResponse.data || [];
        setContactsData(contacts);
        setStats(calculateStats(contacts));

        // 3. On appelle Emelia UNIQUEMENT si Campagnes_cold_email est non vide
        const hasColdEmail = campaign?.Campagnes_cold_email &&
          campaign.Campagnes_cold_email !== "" &&
          campaign.Campagnes_cold_email !== null;

        if (hasColdEmail) {
          const [emeliaStatisticResponse, emeliaActivitiesResponse] = await Promise.all([
            getCampaignStatisticsEmelia(campaignId),
            getCampaignactivities(campaignId)
          ]);

          const emeliaActivitiesData = emeliaActivitiesResponse.data || {};
          setEmeliaStats(emeliaStatisticResponse.data || {});
          setEmeliaActivities(emeliaActivitiesData.activities || []);
          setemeliaPerformanceData(emeliaActivitiesData.performance || []);
        }

      } catch (err) {
        console.error("Erreur lors du chargement des données:", err);
        setError("Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };

    if (campaignId) loadData();
  }, [campaignId]);

  useEffect(() => {
    const shouldRunAutoSequence =
      campaignData?.enrichissement === "En cours" &&
      contactsData.length > 0 &&
      stats.profilesEnAttente > 0 &&
      !isConnected;

    const loadData = async () => {
      return await runAutomaticSequence();
    }
    if (shouldRunAutoSequence) {
      loadData();
    }
  }, [campaignData?.enrichissement, stats.profilesEnAttente, contactsData.length, isConnected]);
  // Fonctions de gestion avec appels vers le serveur local
  const handleAutomaticToggle = async () => {
    const isCurrentlyActive = campaignData.enrichissement === "En cours";
    const newEnrichmentStatus = isCurrentlyActive ? "Arrêté" : "En cours";

    try {
      if (!isCurrentlyActive) {
        await runAutomaticSequence();
        await updateCampagneEnrichissement(campaignId, "En cours");
        toastify.success('Enrichissement automatique activé');
      } else {
        // Arrêter l'enrichissement
        await updateCampagneEnrichissement(campaignId, "Arrêté");
        toastify.success('Enrichissement automatique arrêté');
      }

      // Recharger les données de la campagne pour refléter les changements
      const campaignResponse = await getCampagneById(campaignId);
      setCampaignData(campaignResponse.data);

    } catch (error) {
      console.error('Erreur lors du basculement du mode automatique:', error);
      toastify.error('Erreur lors du changement de mode');
    }
  };

  const runAutomaticSequence = async () => {
    try {
      let currentStep = 1;
      const totalSteps = 4;

      // Étape 1: Trier les profils en attente
      if (stats.profilesEnAttente > 0) {
        toastify.success(`Étape ${currentStep}/${totalSteps}: Tri des profils...`);
        await handleTrier();
        currentStep++;

        // Attendre la fin du tri avant de continuer
        await new Promise(resolve => setTimeout(resolve, 5000));
      }

      // Étape 2: Enrichir les contacts
      if (campaignData.enrichissement !== "En cours") {
        toastify.success(`Étape ${currentStep}/${totalSteps}: Enrichissement des contacts...`);
        await onEnrichContacts();
        currentStep++;

        // Attendre la fin de l'enrichissement
        await new Promise(resolve => setTimeout(resolve, 10000));
      }

      // Étape 3: Générer les messages
      const contactsResponse = await getContactsByCampaignId(campaignId);
      const updatedContacts = contactsResponse.data || [];
      const contactsSansMessageUpdated = updatedContacts.filter(contact =>
        (!contact.messagePersonnalise || contact.messagePersonnalise.trim() === "")
        && contact.profil === "GARDE"
      );

      if (contactsSansMessageUpdated.length > 0) {
        toastify.success(`Étape ${currentStep}/${totalSteps}: Génération des messages...`);
        await onGenerateNewMessages();
        currentStep++;
      }

      // Étape 4: Lancer la campagne si elle n'est pas active
      if (campaignData.statut !== "Actif") {
        toastify.success(`Étape ${currentStep}/${totalSteps}: Lancement de la campagne...`);
        await handleLaunchCampaign();
      }

      toastify.success('Séquence automatique terminée avec succès!');

    } catch (error) {
      console.error('Erreur dans la séquence automatique:', error);
      toastify.error('Erreur dans la séquence automatique');
    }
  };

  const handleTrier = async () => {
    setIsTrierLoading(true);
    clearEvents();

    try {
      await connectToWorkflow('/webhook/profils/trier/profils', {
        id: campaignId
      });

      // Recharger les données
      const contactsResponse = await getContactsByCampaignId(campaignId);
      const contacts = contactsResponse.data || [];
      setContactsData(contacts);
      setStats(calculateStats(contacts));

    } catch (error) {
      console.error("Erreur trier:", error);
      toastify.error("Erreur lors du tri automatique");
    } finally {
      setIsTrierLoading(false);
      setIsTrierDialogOpen(false);
    }
  };

  const handleRetrier = async () => {
    setIsRetrierLoading(true);
    clearEvents();

    try {
      await connectToWorkflow('/webhook/profils/retrier/profils', {
        id: campaignId
      });
      const contactsResponse = await getContactsByCampaignId(campaignId);
      const contacts = contactsResponse.data || [];
      setContactsData(contacts);
      setStats(calculateStats(contacts));

    } catch (error) {
      console.error("Erreur retrier:", error);
      toastify.error("Erreur lors du retri");
    } finally {
      setIsRetrierLoading(false);
    }
  };

  const exportContactsSansReponse = async () => {
    try {
      // Appeler le backend pour récupérer le CSV
      const csvContent = await exportContactsSansReponseCSV(campaignId);

      // Vérifier si on a des données
      if (!csvContent || csvContent.trim() === '') {
        toastify.error("Aucun contact sans réponse à exporter");
        return;
      }

      // Compter le nombre de lignes (moins l'en-tête)
      const lines = csvContent.trim().split('\n');
      const contactCount = lines.length - 1; // -1 pour l'en-tête

      if (contactCount <= 0) {
        toastify.error("Aucun contact sans réponse à exporter");
        return;
      }

      // Créer un Blob avec le contenu CSV (avec BOM UTF-8 pour Excel)
      const blob = new Blob(['\ufeff' + csvContent], {
        type: 'text/csv;charset=utf-8;'
      });

      // Créer le nom de fichier
      const safeCampaignName = campaignData.nom.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `contacts_sans_reponse_${safeCampaignName}_${timestamp}.csv`;

      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Libérer la mémoire
      window.URL.revokeObjectURL(url);

      toastify.success(`${contactCount} contact(s) sans réponse exporté(s) avec succès`);
    } catch (error) {
      console.error("Erreur lors de l'export:", error);
      toastify.error(error.response?.data?.error || "Erreur lors de l'export des contacts");
    }
  };

  const handleLaunchCampaign = async () => {
    try {
      setLaunchingCampaign(true);
      await updateCampagneStatus(campaignId, "Actif");
      toastify.success('Campagne lancée avec succès !');
      const campaignResponse = await getCampagneById(campaignId);
      setCampaignData(campaignResponse.data);
    } catch (error) {
      console.error('Erreur lors du lancement de la campagne:', error);
      toastify.error('Erreur lors du lancement de la campagne');
    } finally {
      setLaunchingCampaign(false);
    }
  };

  const handleFinisCampaign = async () => {
    try {
      setTerminating(true);
      await updateCampagneStatus(campaignId, "Terminé");
      toastify.success('Campagne terminée !');

      const campaignResponse = await getCampagneById(campaignId);
      setCampaignData(campaignResponse.data);
    } catch (error) {
      toastify.error('Erreur lors de la fin de la campagne');
    } finally {
      setTerminating(false);
    }
  };



  const handlePausedCampaign = async () => {
    try {
      setTerminating(true);
      await updateCampagneStatus(campaignId, "En attente");
      toastify.success('Campagne en pause !');

      const campaignResponse = await getCampagneById(campaignId);
      setCampaignData(campaignResponse.data);
    } catch (error) {
      toastify.error('Erreur lors de la pause');
    } finally {
      setTerminating(false);
    }
  };

  const handleStopEnrichissement = async () => {
    try {
      setstopEnrichissement(true);
      await updateCampagneEnrichissement(campaignId, "Arrêté");
      toastify.success('Enrichissement stoppé !');

      const campaignResponse = await getCampagneById(campaignId);
      setCampaignData(campaignResponse.data);
    } catch (error) {
      toastify.error('Erreur lors de la fin de l\'enrichissement');
    } finally {
      setstopEnrichissement(false);
    }
  };

  // Nouvelles fonctions utilisant le serveur local avec SSE
  const onGenerateNewMessages = async () => {
    setGeneratingNewMessages(true);
    clearEvents();

    try {
      const resp = await connectToWorkflow('/webhook/messages/generer/messages', {
        id: campaignId,
        mode: 'generate'
      }).then5(async () => {

        const contactsResponse = await getContactsByCampaignId(campaignId);
        const contacts = contactsResponse.data || [];
        setContactsData(contacts);
        setStats(calculateStats(contacts))
          ;
      });

    } catch (error) {
      toastify.error("Erreur lors de la génération des messages");
    } finally {
      setGeneratingNewMessages(false);
    }
  };

  const onReGenerateMessages = async () => {
    setRegeneratingMessages(true);
    clearEvents();

    try {
      await connectToWorkflow('/webhook/messages/regenerer/messages', {
        id: campaignId
      });

      // Recharger les contacts après régénération
      setTimeout(async () => {
        const contactsResponse = await getContactsByCampaignId(campaignId);
        const contacts = contactsResponse.data || [];
        setContactsData(contacts);
        setStats(calculateStats(contacts));
      }, 2000);

    } catch (error) {
      toastify.error("Erreur lors de la régénération des messages");
    } finally {
      setRegeneratingMessages(false);
    }
  };

  const onEnrichContacts = async () => {
    setEnriching(true);
    clearEvents();

    try {
      await connectToWorkflow('/webhook/contacts/enrichir/contacte', {
        id: campaignId
      });

      // Recharger les données après enrichissement
      setTimeout(async () => {
        const campaignResponse = await getCampagneById(campaignId);
        setCampaignData(campaignResponse.data);
      }, 2000);

    } catch (error) {
      toastify.error("Erreur lors de l'enrichissement des contacts");
    } finally {
      setEnriching(false);
    }
  };

  const handleDeleteRecordJected = async () => {
    setcontactReject(true);
    clearEvents();

    try {
      await connectToWorkflow('/webhook/contacts/supprimer/contact/reject', {
        id: campaignId
      });

      // Recharger les données après suppression
      setTimeout(async () => {
        const contactsResponse = await getContactsByCampaignId(campaignId);
        const contacts = contactsResponse.data || [];
        setContactsData(contacts);
        setStats(calculateStats(contacts));
      }, 2000);

    } catch (error) {
      toastify.error('Erreur lors de la suppression des contacts rejetés');
    } finally {
      setcontactReject(false);
    }
  };

  // Actions de navigation et gestion
  const onBack = () => navigate(-1);
  const onAddContacts = () => navigate(`/dashboard/campagne/contacts/create/${campaignId}`);
  const onViewContacts = () => navigate(`/dashboard/campagne/contacts/${campaignId}`);
  const onEditCampaign = () => navigate(`/dashboard/campagne/edit/${campaignId}`);

  const onDeleteCampaign = async () => {
    try {
      setDeleting(true);

      if (deleteOption === 'with-contacts') {
        // Supprimer la campagne avec tous ses contacts
        await deleteCampagneWithContacts(campaignId);
        toastify.success("Campagne et contacts supprimés avec succès");
      } else {
        // Supprimer seulement la campagne
        await deleteCampagne(campaignId);
        toastify.success("Campagne supprimée avec succès");
      }

      setDeleteDialogOpen(false);
      navigate('/dashboard/campagne');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toastify.error("Erreur lors de la suppression");
    } finally {
      setDeleting(false);
    }
  };

  // Génération des données de graphiques basées sur les vrais contacts
  const performanceData = generatePerformanceData(contactsData);

  const profileDistribution = [
    { name: "Profils Gardés", value: stats.profilesGarde, color: "#10B981" },
    { name: "Profils Rejetés", value: stats.profilesRejete, color: "#EF4444" },
    { name: "En Attente", value: stats.profilesEnAttente, color: "#F59E0B" },
    { name: "Avec Message", value: stats.profilesValideAvecMessage, color: "#3B82F6" },
    { name: "Sans Message", value: stats.profilesValideSansMessage, color: "#8B5CF6" }
  ];

  const statusDistribution = [
    { name: "Messages envoyés", value: stats.messagesSent, color: "#3B82F6" },
    { name: "Réponses reçues", value: stats.responsesReceived, color: "#8B5CF6" },
    { name: "Intéressés", value: stats.interested, color: "#10B981" },
    { name: "Non contactés", value: stats.totalContacts - stats.messagesSent, color: "#6B7280" },
  ];

  const StatCard = ({ title, value, subtitle, icon: Icon, color, trend, badge }) => {
    const colorClasses = {
      blue: { border: 'from-blue-400 to-blue-600', bg: 'from-blue-500/20 to-blue-600/20', icon: 'text-blue-400' },
      green: { border: 'from-green-400 to-green-600', bg: 'from-green-500/20 to-green-600/20', icon: 'text-green-400' },
      purple: { border: 'from-purple-400 to-purple-600', bg: 'from-purple-500/20 to-purple-600/20', icon: 'text-purple-400' },
      orange: { border: 'from-orange-400 to-orange-600', bg: 'from-orange-500/20 to-orange-600/20', icon: 'text-orange-400' },
      red: { border: 'from-red-400 to-red-600', bg: 'from-red-500/20 to-red-600/20', icon: 'text-red-400' },
      indigo: { border: 'from-indigo-400 to-indigo-600', bg: 'from-indigo-500/20 to-indigo-600/20', icon: 'text-indigo-400' },
      cyan: { border: 'from-cyan-400 to-cyan-600', bg: 'from-cyan-500/20 to-cyan-600/20', icon: 'text-cyan-400' },
      gray: { border: 'from-gray-400 to-gray-600', bg: 'from-gray-500/20 to-gray-600/20', icon: 'text-gray-400' },
    };

    const currentColor = colorClasses[color] || colorClasses.blue;

    return (
      <Card className="relative overflow-hidden border shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col bg-clip-border rounded-xl bg-gradient-to-br from-bleu-fonce/90 to-noir-absolu/80 border border-bleu-neon/20 shadow-neon-blue hover:scale-105">
        <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${currentColor.border}`}></div>
        <CardBody className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Typography variant="small" className="font-medium text-gris-clair/80 mb-1">
                {title}
              </Typography>
              <Typography variant="h3" className="mb-1 block antialiased font-sans text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent animate-glow">
                {value}
              </Typography>
              {subtitle && (
                <Typography variant="small" className="text-gris-clair/60">
                  {subtitle}
                </Typography>
              )}
              {badge && (
                <Typography variant="small" className="text-bleu-neon font-medium mt-1">
                  {badge}
                </Typography>
              )}
            </div>
            <div className="flex flex-col items-end">
              <div className={`p-2 rounded-lg bg-gradient-to-br ${currentColor.bg} border border-bleu-neon/20`}>
                <Icon className={`h-6 w-6 ${currentColor.icon}`} />
              </div>
              {trend && (
                <div className="flex items-center mt-2">
                  {trend > 0 ? (
                    <ArrowTrendingUpIcon className="h-4 w-4 text-green-400" />
                  ) : (
                    <ArrowTrendingDownIcon className="h-4 w-4 text-red-400" />
                  )}
                  <Typography variant="small" className={trend > 0 ? "text-green-400" : "text-red-400"}>
                    {Math.abs(trend)}%
                  </Typography>
                </div>
              )}
            </div>
          </div>
        </CardBody>
      </Card>
    );
  };

  const hasColdEmail = !!(campaignData?.Campagnes_cold_email && 
                          campaignData.Campagnes_cold_email !== "" && 
                          campaignData.Campagnes_cold_email !== null);

  if (loading) {
    return (
      <Loading />
    );
  }

  if (error || !campaignData) {
    return (
      <div className="flex justify-center items-center h-64">
        <Typography color="red" className="text-center">
          {error || "Campagne non trouvée"}
        </Typography>
      </div>
    );
  }

  const hasContacts = contactsData.length > 0;
  const contactsSansMessage = contactsData.filter(contact =>
    (!contact.messagePersonnalise || contact.messagePersonnalise.trim() === "")
    && contact.profil === "GARDE"
  );
  const contactsAvecMessage = contactsData.filter(contact =>
    (contact.messagePersonnalise && contact.messagePersonnalise.trim() !== "")
    && contact.profil === "GARDE"
  );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header avec informations de campagne */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <IconButton
              variant="text"
              color="white"
              onClick={onBack}
              className="rounded-full hover:bg-gray-100 transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </IconButton>
            <div>
              <Typography variant="h4" color="blue" className="mb-1">
                {campaignData.nom}
              </Typography>
              <div className="flex items-center gap-4 text-sm text-blue-gray-600">
                <div className="flex items-center gap-1">
                  <BriefcaseIcon className="h-4 w-4" />
                  <span>{campaignData.poste}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPinIcon className="h-4 w-4" />
                  <span>{campaignData.zone}</span>
                </div>
                <div className="flex items-center gap-1">
                  <CalendarDaysIcon className="h-4 w-4" />
                  <span>Créée le {new Date(campaignData.dateCreation).toLocaleDateString('fr-FR')}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Chip
              variant="gradient"
              color={campaignData.statut === "Actif" ? "green" : campaignData.statut === "Brouillon" ? "amber" : "blue-gray"}
              value={campaignData.statut}
              className="py-1 px-3"
            />
          </div>
        </div>

        {/* Interface d'actions */}
        <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-6 border border-gray-200/50">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <Typography variant="h6" color="blue-gray" className="mb-2">
                Gestion de la campagne
              </Typography>
              <Typography variant="small" className="text-blue-gray-600">
                {stats.totalContacts} contacts • {stats.messagesSent} messages envoyés • {stats.interested} intéressés
              </Typography>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Mode automatique */}
              <div className={`flex items-center gap-2 rounded-lg px-4 py-2 border transition-all duration-300 ${campaignData.enrichissement === "En cours"
                ? 'bg-green-50 border-green-200'
                : 'bg-white/60 border-gray-200'
                }`}>
                <Typography variant="small" className="font-medium text-blue-gray-700">
                  Mode Auto
                  {campaignData.enrichissement && (
                    <span className={`ml-1 text-xs ${campaignData.enrichissement === "En cours" ? 'text-green-600' : 'text-gray-500'
                      }`}>
                      ({campaignData.enrichissement})
                    </span>
                  )}
                </Typography>
                <Switch
                  checked={campaignData.enrichissement === "En cours"} // ← CORRECTION ICI
                  onChange={handleAutomaticToggle}
                  color={campaignData.enrichissement === "En cours" ? "green" : "blue"}
                  className="h-4 w-8"
                />
                {campaignData.enrichissement === "En cours" && (
                  <div className="flex items-center gap-1">
                    <div className="animate-pulse w-2 h-2 bg-green-500 rounded-full"></div>
                    <Typography variant="small" className="text-green-600 text-xs">
                      Actif
                    </Typography>
                  </div>
                )}
              </div>

              {/* Boutons d'action */}
              <Button
                size="sm"
                variant="gradient"
                color="blue"
                onClick={onAddContacts}
                className="flex items-center gap-2"
              >
                <UserPlusIcon className="h-4 w-4" />
                Ajouter
              </Button>

              {campaignData.enrichissement !== "En cours" && (
                <Button
                  size="sm"
                  variant="gradient"
                  color="purple"
                  onClick={onEnrichContacts}
                  disabled={enriching || isConnected}
                  className="flex items-center gap-2"
                >
                  <SparklesIcon className="h-4 w-4" />
                  {enriching || isConnected ? "Enrichissement..." : "Enrichir"}
                </Button>
              )}

              {contactsSansMessage.length > 0 && (
                <Button
                  size="sm"
                  variant="gradient"
                  color="green"
                  onClick={onGenerateNewMessages}
                  disabled={generatingNewMessages || isConnected}
                  className="flex items-center gap-2"
                >
                  <SparklesIcon className="h-4 w-4" />
                  {generatingNewMessages || isConnected ? "Génération..." : `Générer (${contactsSansMessage.length})`}
                </Button>
              )}

              {contactsAvecMessage.length > 0 && (
                <Button
                  size="sm"
                  variant="gradient"
                  color="green"
                  onClick={onReGenerateMessages}
                  disabled={regeneratingMessages}
                  className="flex items-center gap-2"
                >
                  <ArrowPathIcon className="h-4 w-4" />
                  {regeneratingMessages ? "Regénération..." : `Regénérer (${contactsAvecMessage.length})`}
                </Button>
              )}

              <Button
                size="sm"
                variant="gradient"
                color="blue"
                onClick={() => setIsTrierDialogOpen(true)}
                disabled={stats.profilesEnAttente === 0}
                className="flex items-center gap-2"
              >
                <FunnelIcon className="h-4 w-4" />
                Trier ({stats.profilesEnAttente})
              </Button>

              <Button
                size="sm"
                variant="gradient"
                color="purple"
                onClick={handleRetrier}
                disabled={isRetrierLoading || (stats.profilesGarde + stats.profilesRejete) === 0}
                className="flex items-center gap-2"
              >
                <ArrowPathIcon className="h-4 w-4" />
                {isRetrierLoading ? "Retri..." : `Retrier (${stats.profilesGarde + stats.profilesRejete})`}
              </Button>



              {campaignData.enrichissement === "En cours" && hasContacts && (
                <Button
                  size="sm"
                  variant="gradient"
                  color="orange"
                  onClick={handleStopEnrichissement}
                  disabled={stopEnrichissement}
                  className="flex items-center gap-2"
                >
                  <PlayIcon className="h-4 w-4" />
                  {launchingCampaign ? 'Lancement...' : "Stoper l'Enrichissement"}
                </Button>
              )}

              {stats.profilesRejete > 0 && (

                <Button
                  size="sm"
                  variant="gradient"
                  color="red"
                  onClick={handleDeleteRecordJected}
                  disabled={terminating}
                  className="flex items-center gap-2"
                >
                  <TrashIcon className="h-4 w-4" />
                  {trashContactReject ? 'Suppression...' : `Vider contacts rejeter(${stats.profilesRejete})`}
                </Button>)}




            </div>
          </div>
        </div>



        <CompactTimelineProgress
          events={events}
          isConnected={isConnected}
          onClose={clearEvents}

        />
      </div>

      {hasColdEmail && (
      <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-xl p-4 mb-4 border border-blue-200">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <SignalIcon className="h-5 w-5 text-blue-600" />
            <Typography variant="small" className="font-bold text-blue-gray-700">
              Statistiques Emelia en temps réel
            </Typography>
          </div>
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <PaperAirplaneIcon className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">{emeliaStats.totalSent} envoyés</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">{emeliaStats.delivered} délivrés ({emeliaStats.deliveryRate}%)</span>
            </div>
            <div className="flex items-center gap-2">
              <EyeIcon className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">{emeliaStats.opened} ouverts ({emeliaStats.openRate}%)</span>
            </div>
            <div className="flex items-center gap-2">
              <CursorArrowRippleIcon className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">{emeliaStats.clicked} clics ({emeliaStats.clickRate}%)</span>
            </div>
          </div>
        </div>
      </div>
       )}


      {/* Onglets */}
      <Tabs value={activeTab} onChange={setActiveTab}>
        <TabsHeader className="rounded-lg bg-blue-gray-50/50">


          <Tab value="overview">
            <div className="flex items-center gap-2">
              <ChartPieIcon className="h-4 w-4" />
              Vue d'ensemble
            </div>
          </Tab>

          {hasColdEmail && (
            <Tab value="emelia">
              <div className="flex items-center gap-2">
                <SignalIcon className="h-4 w-4" />
                Emelia
              </div>
            </Tab>
          )}

          <Tab value="activities">
            <div className="flex items-center gap-2">
              <ClipboardDocumentCheckIcon className="h-4 w-4" />
              Activités
            </div>
          </Tab>

          <Tab value="performance">
            <div className="flex items-center gap-2">
              <ChartBarIcon className="h-4 w-4" />
              Performance
            </div>
          </Tab>
          <Tab value="profiles">
            <div className="flex items-center gap-2">
              <UserGroupIcon className="h-4 w-4" />
              Profils
            </div>
          </Tab>
        </TabsHeader>

        <TabsBody>
          {/* Onglet Vue d'ensemble */}
          <TabPanel value="overview" className="p-0 pt-4">
            {/* Statistiques principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard
                title="Contacts Totaux"
                value={stats.totalContacts}
                subtitle={`${stats.interested} intéressés`}
                icon={UserGroupIcon}
                color="blue"
                trend={12}
              />
              <StatCard
                title="Messages Envoyés"
                value={stats.messagesSent}
                subtitle={`${Math.round((stats.messagesSent / Math.max(stats.totalContacts, 1)) * 100)}% du total`}
                icon={EnvelopeIcon}
                color="green"
                trend={8}
              />
              <StatCard
                title="Taux de Réponse"
                value={`${stats.responseRate}%`}
                subtitle={`${stats.responsesReceived} réponses`}
                icon={ChatBubbleLeftRightIcon}
                color="purple"
                trend={5}
              />
              <StatCard
                title="Taux d'Intérêt"
                value={`${stats.interestRate}%`}
                subtitle={`${stats.interested} rendez-vous`}
                icon={CheckCircleIcon}
                color="orange"
                trend={-2}
              />
            </div>

            {/* Graphiques principaux */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Distribution des statuts */}
              <Card className="flex flex-col bg-clip-border rounded-xl bg-white text-gray-700 shadow-md relative bg-gradient-to-br from-bleu-fonce/90 to-noir-absolu/80 backdrop-blur-xl border border-bleu-neon/20 hover:border-violet-plasma/30 transition-all duration-500">
                <CardHeader floated={false} shadow={false} className="pb-4 bg-clip-border rounded-xl overflow-hidden bg-transparent text-gray-700 shadow-none m-0 p-6 ">
                  <Typography variant="h6" color="blue-gray" className="block antialiased font-sans text-blanc-pur  text-lg font-semibold">
                    Distribution des Statuts
                  </Typography>
                </CardHeader>
                <CardBody className="pt-0">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={statusDistribution.filter(item => item.value > 0)}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {statusDistribution.filter(item => item.value > 0).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-4 space-y-2">
                    {statusDistribution.filter(item => item.value > 0).map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                          <Typography variant="small" className="text-blue-gray-600">
                            {item.name}
                          </Typography>
                        </div>
                        <Typography variant="small" className="font-medium">
                          {item.value}
                        </Typography>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>

              {/* Performance hebdomadaire */}
              <Card className="flex flex-col bg-clip-border rounded-xl bg-white text-gray-700 shadow-md relative bg-gradient-to-br from-bleu-fonce/90 to-noir-absolu/80 backdrop-blur-xl border border-bleu-neon/20 hover:border-violet-plasma/30 transition-all duration-500">
                <CardHeader floated={false} shadow={false} className="pb-4 bg-clip-border rounded-xl overflow-hidden bg-transparent text-gray-700 shadow-none m-0 p-6 ">
                  <Typography variant="h6" color="blue-gray" className="block antialiased font-sans text-blanc-pur  text-lg font-semibold">
                    Performance sur 7 jours
                  </Typography>
                </CardHeader>
                <CardBody className="pt-0">
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={performanceData}>
                      <defs>
                        <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorResponses" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="date" stroke="#6B7280" fontSize={12} />
                      <YAxis stroke="#6B7280" fontSize={12} />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="messages"
                        stroke="#3B82F6"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorMessages)"
                        name="Messages"
                      />
                      <Area
                        type="monotone"
                        dataKey="responses"
                        stroke="#8B5CF6"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorResponses)"
                        name="Réponses"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardBody>
              </Card>
            </div>
          </TabPanel>





          {/* Onglet Performance */}
          <TabPanel value="performance" className="p-0 pt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Métriques de conversion */}
              <Card className="flex flex-col bg-clip-border rounded-xl bg-white text-gray-700 shadow-md relative bg-gradient-to-br from-bleu-fonce/90 to-noir-absolu/80 backdrop-blur-xl border border-bleu-neon/20 hover:border-violet-plasma/30 transition-all duration-500">
                <CardHeader floated={false} shadow={false} className="pb-4 bg-clip-border rounded-xl overflow-hidden bg-transparent text-gray-700 shadow-none m-0 p-6 ">
                  <Typography variant="h6" color="blue-gray" className="block antialiased font-sans text-blanc-pur  text-lg font-semibold">
                    Métriques de Conversion
                  </Typography>
                </CardHeader>
                <CardBody className="pt-0">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <Typography variant="small">Messages → Réponses</Typography>
                        <Typography variant="small" className="font-medium">
                          {stats.responseRate}%
                        </Typography>
                      </div>
                      <Progress value={stats.responseRate} color="blue" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <Typography variant="small">Réponses → Intérêt</Typography>
                        <Typography variant="small" className="font-medium">
                          {stats.responsesReceived > 0 ? Math.round((stats.interested / stats.responsesReceived) * 100) : 0}%
                        </Typography>
                      </div>
                      <Progress
                        value={stats.responsesReceived > 0 ? Math.round((stats.interested / stats.responsesReceived) * 100) : 0}
                        color="green"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <Typography variant="small">Contacts → Intérêt</Typography>
                        <Typography variant="small" className="font-medium">
                          {stats.interestRate}%
                        </Typography>
                      </div>
                      <Progress value={stats.interestRate} color="orange" />
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Évolution temporelle */}
              <Card className="flex flex-col bg-clip-border rounded-xl bg-white text-gray-700 shadow-md relative bg-gradient-to-br from-bleu-fonce/90 to-noir-absolu/80 backdrop-blur-xl border border-bleu-neon/20 hover:border-violet-plasma/30 transition-all duration-500">
                <CardHeader floated={false} shadow={false} className="bg-clip-border rounded-xl overflow-hidden bg-transparent text-gray-700 shadow-none m-0 p-6 pb-4">
                  <Typography variant="h6" color="blue-gray" className="block antialiased font-sans text-blanc-pur  text-lg font-semibold">
                    Évolution Quotidienne
                  </Typography>
                </CardHeader>
                <CardBody className="pt-0">
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="date" stroke="#6B7280" fontSize={12} />
                      <YAxis stroke="#6B7280" fontSize={12} />
                      <Tooltip />
                      <Bar dataKey="messages" fill="#3B82F6" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="responses" fill="#8B5CF6" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="interested" fill="#10B981" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardBody>
              </Card>

              <Card className="mt-6flex flex-col bg-clip-border rounded-xl bg-white text-gray-700 shadow-md relative bg-gradient-to-br from-bleu-fonce/90 to-noir-absolu/80 backdrop-blur-xl border border-bleu-neon/20 hover:border-violet-plasma/30 transition-all duration-500">
                <CardHeader floated={false} shadow={false} className="pb-4 bg-clip-border rounded-xl overflow-hidden bg-transparent text-gray-700 shadow-none m-0 p-6 ">
                  <Typography variant="h6" color="blue-gray" className="block antialiased font-sans text-blanc-pur  text-lg font-semibold">
                    Entonnoir de Conversion Emelia
                  </Typography>
                </CardHeader>
                <CardBody className="space-y-3">
                  {emeliaFunnelData.map((item, index) => (
                    <div key={index}>
                      <div className="flex justify-between mb-1">
                        <Typography variant="small">{item.name}</Typography>
                        <Typography variant="small" className="font-medium">{item.value}</Typography>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="h-3 rounded-full transition-all duration-500"
                          style={{ width: `${(item.value / emeliaStats.totalSent) * 100}%`, backgroundColor: item.fill }}
                        />
                      </div>
                    </div>
                  ))}
                </CardBody>
              </Card>
            </div>
          </TabPanel>

          {/* Onglet Profils */}
          <TabPanel value="profiles" className="p-0 pt-4">
            {/* Statistiques de profils */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <StatCard
                title="Profils Gardés"
                value={stats.profilesGarde}
                subtitle={`${Math.round((stats.profilesGarde / Math.max(stats.totalContacts, 1)) * 100)}% du total`}
                icon={CheckCircleIcon}
                color="green"
                trend={15}
              />
              <StatCard
                title="Profils Rejetés"
                value={stats.profilesRejete}
                subtitle={`${Math.round((stats.profilesRejete / Math.max(stats.totalContacts, 1)) * 100)}% du total`}
                icon={XCircleIcon}
                color="red"
                trend={-8}
              />
              <StatCard
                title="En Attente"
                value={stats.profilesEnAttente}
                subtitle="À traiter"
                icon={ClockIcon}
                color="orange"
                trend={-25}
              />
            </div>

            {/* Graphique de distribution des profils */}
            <Card className="flex flex-col bg-clip-border rounded-xl bg-white text-gray-700 shadow-md relative bg-gradient-to-br from-bleu-fonce/90 to-noir-absolu/80 backdrop-blur-xl border border-bleu-neon/20 hover:border-violet-plasma/30 transition-all duration-500">
              <CardHeader floated={false} shadow={false} className="bg-clip-border rounded-xl overflow-hidden bg-transparent text-gray-700 shadow-none m-0 p-6 pb-4pb-4">
                <div className="flex items-center justify-between">
                  <Typography variant="h6" color="blue-gray">
                    Distribution des Profils
                  </Typography>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outlined"
                      color="blue"
                      onClick={() => setIsTrierDialogOpen(true)}
                      disabled={stats.profilesEnAttente === 0}
                      className="flex items-center gap-2"
                    >
                      <FunnelIcon className="h-4 w-4" />
                      Trier en attente
                    </Button>
                    <Button
                      size="sm"
                      variant="outlined"
                      color="purple"
                      onClick={handleRetrier}
                      disabled={isRetrierLoading}
                      className="flex items-center gap-2"
                    >
                      <ArrowPathIcon className="h-4 w-4" />
                      Retrier traités
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardBody className="pt-0">
                <div className="flex flex-col lg:flex-row items-center gap-6">
                  <div className="flex-1">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={profileDistribution.filter(item => item.value > 0)}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {profileDistribution.filter(item => item.value > 0).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="lg:w-72 space-y-4">
                    {profileDistribution.filter(item => item.value > 0).map((item, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }}></div>
                          <Typography variant="h6" className="text-blue-gray-800">
                            {item.value}
                          </Typography>
                        </div>
                        <Typography variant="small" className="text-blue-gray-600 mb-2">
                          {item.name}
                        </Typography>
                        <Progress
                          value={(item.value / Math.max(stats.totalContacts, 1)) * 100}
                          color={item.color === "#10B981" ? "green" : item.color === "#EF4444" ? "red" : "orange"}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </CardBody>
            </Card>
          </TabPanel>

          <TabPanel value="emelia" className="p-0 pt-4">
            {/* Grille de stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard title="Emails Envoyés" value={emeliaStats.totalSent} subtitle="Total de la campagne" icon={PaperAirplaneIcon} color="blue" />
              <StatCard title="Taux de Délivrabilité" value={`${emeliaStats.deliveryRate}%`} subtitle={`${emeliaStats.delivered} délivrés`} icon={CheckCircleIcon} color="green" badge={emeliaStats.deliveryRate > 95 ? "Excellent" : "Moyen"} />
              <StatCard title="Taux d'Ouverture" value={`${emeliaStats.openRate}%`} subtitle={`${emeliaStats.opened} ouvertures`} icon={EyeIcon} color="purple" badge={emeliaStats.openRate > 30 ? "Excellent" : emeliaStats.openRate > 15 ? "Moyen" : "Faible"} />
              <StatCard title="Taux de Clic" value={`${emeliaStats.clickRate}%`} subtitle={`${emeliaStats.clicked} clics`} icon={CursorArrowRippleIcon} color="orange" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard title="Taux de Réponse" value={`${emeliaStats.replyRate}%`} subtitle={`${emeliaStats.replied} réponses`} icon={ChatBubbleLeftRightIcon} color="indigo" />
              <StatCard title="Bounces" value={emeliaStats.bounced} subtitle={`${emeliaStats.bounceRate}% du total`} icon={ExclamationCircleIcon} color="red" />
              <StatCard title="Désabonnements" value={emeliaStats.unsubscribed} subtitle={`${emeliaStats.unsubscribeRate}% du total`} icon={XCircleIcon} color="gray" />
              <StatCard title="Quota Journalier" value={`${emeliaStats.sent24h}/${emeliaStats.dailyLimit}`} subtitle={`${Math.round((emeliaStats.sent24h / emeliaStats.dailyLimit) * 100)}% utilisé`} icon={ClockIcon} color="cyan" />
            </div>

            {/* Graphique performance 7 jours */}
            <Card className="mb-6 bg-gradient-to-br from-bleu-fonce/90 to-noir-absolu/80 backdrop-blur-xl border border-bleu-neon/20 hover:border-violet-plasma/30 transition-all duration-500 shadow-md">
              <CardHeader floated={false} shadow={false} className="pb-4 bg-transparent">
                <Typography variant="h6" className="text-blanc-pur text-lg font-semibold">
                  Performance Emelia - 7 derniers jours
                </Typography>
              </CardHeader>
              <CardBody className="pt-0">
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={emeliaPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="sent" stroke="#3B82F6" name="Envoyés" strokeWidth={2} />
                    <Line type="monotone" dataKey="delivered" stroke="#10B981" name="Délivrés" strokeWidth={2} />
                    <Line type="monotone" dataKey="opened" stroke="#8B5CF6" name="Ouverts" strokeWidth={2} />
                    <Line type="monotone" dataKey="clicked" stroke="#F59E0B" name="Cliqués" strokeWidth={2} />
                    <Line type="monotone" dataKey="replied" stroke="#06B6D4" name="Répondus" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>

            {/* Indicateurs de santé */}
            <Card className="bg-gradient-to-br from-bleu-fonce/90 to-noir-absolu/80 border border-bleu-neon/20">
              <CardHeader floated={false} shadow={false} className="pb-4 bg-transparent">
                <Typography variant="h6" className="text-blanc-pur">
                  Indicateurs de Santé de la Campagne
                </Typography>
              </CardHeader>
              <CardBody className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-lg p-4 border-2 border-green-500/30 backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 bg-green-400 rounded-full shadow-neon-green"></div>
                      <Typography variant="small" className="font-bold text-green-400">Délivrabilité</Typography>
                    </div>
                    <Typography variant="h4" className="text-green-400 mb-1">{emeliaStats.deliveryRate}%</Typography>
                    <Typography variant="small" className="text-gris-clair/70">{emeliaStats.deliveryRate > 95 ? "Excellente" : "Bonne"} délivrabilité</Typography>
                  </div>

                  <div className={`rounded-lg p-4 border-2 backdrop-blur-sm ${emeliaStats.openRate > 30
                    ? 'bg-gradient-to-br from-green-500/20 to-green-600/10 border-green-500/30'
                    : emeliaStats.openRate > 15
                      ? 'bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border-yellow-500/30'
                      : 'bg-gradient-to-br from-red-500/20 to-red-600/10 border-red-500/30'
                    }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-3 h-3 rounded-full ${emeliaStats.openRate > 30 ? 'bg-green-400 shadow-neon-green'
                        : emeliaStats.openRate > 15 ? 'bg-yellow-400'
                          : 'bg-red-400 shadow-neon-red'
                        }`}></div>
                      <Typography variant="small" className={`font-bold ${emeliaStats.openRate > 30 ? 'text-green-400'
                        : emeliaStats.openRate > 15 ? 'text-yellow-400'
                          : 'text-red-400'
                        }`}>Engagement</Typography>
                    </div>
                    <Typography variant="h4" className={`mb-1 ${emeliaStats.openRate > 30 ? 'text-green-400'
                      : emeliaStats.openRate > 15 ? 'text-yellow-400'
                        : 'text-red-400'
                      }`}>{emeliaStats.openRate}%</Typography>
                    <Typography variant="small" className="text-gris-clair/70">
                      {emeliaStats.openRate > 30 ? "Excellent" : emeliaStats.openRate > 15 ? "Moyen" : "Faible"} taux d'ouverture
                    </Typography>
                  </div>

                  <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-lg p-4 border-2 border-blue-500/30 backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 bg-blue-400 rounded-full shadow-neon-blue"></div>
                      <Typography variant="small" className="font-bold text-blue-400">Conversion</Typography>
                    </div>
                    <Typography variant="h4" className="text-blue-400 mb-1">{emeliaStats.replyRate}%</Typography>
                    <Typography variant="small" className="text-gris-clair/70">Taux de réponse</Typography>
                  </div>
                </div>
              </CardBody>
            </Card>
          </TabPanel>

          {/* 🆕 ONGLET ACTIVITÉS */}
          <TabPanel value="activities" className="p-0 pt-4">
            <Card className="bg-gradient-to-br from-bleu-fonce/90 to-noir-absolu/80 border border-bleu-neon/20">
              <CardHeader floated={false} shadow={false} className="pb-4 bg-transparent">
                <div className="flex items-center justify-between">
                  <div>
                    <Typography variant="h6" className="text-blanc-pur">Activités Récentes Emelia</Typography>
                    <Typography variant="small" className="text-gris-clair/70 mt-1">Timeline des interactions avec vos emails</Typography>
                  </div>

                  <Button
                    size="sm"
                    variant="outlined"
                    color="blue"
                    onClick={handleSyncEmelia}
                    disabled={syncingEmelia}
                    className="flex items-center gap-2"
                  >
                    <ArrowPathIcon className={`h-4 w-4 ${syncingEmelia ? 'animate-spin' : ''}`} />
                    Actualiser
                  </Button>
                </div>
              </CardHeader>
              <CardBody className="pt-0">
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {emeliaActivities.map((activity) => (
                    <ActivityItem key={activity.id} activity={activity} />
                  ))}
                </div>

                {emeliaActivities.length === 0 && (
                  <div className="text-center py-12">
                    <InboxIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <Typography variant="h6" color="blue-gray" className="mb-2">Aucune activité récente</Typography>
                    <Typography variant="small" className="text-blue-gray-600">Les activités apparaîtront ici une fois que vos emails seront envoyés</Typography>
                  </div>
                )}
              </CardBody>
            </Card>
          </TabPanel>



        </TabsBody>
      </Tabs>

      {/* État vide si pas de contacts */}
      {!hasContacts && (
        <Card className="flex flex-col bg-clip-border rounded-xl bg-white text-gray-700 shadow-md relative bg-gradient-to-br from-bleu-fonce/90 to-noir-absolu/80 backdrop-blur-xl border border-bleu-neon/20 hover:border-violet-plasma/30 transition-all duration-500">
          <CardBody className="p-12 text-center">
            <UserGroupIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <Typography variant="h5" color="blue-gray" className="block antialiased font-sans text-blanc-pur text-lg font-semibold">
              Aucun contact pour le moment
            </Typography>
            <Typography className="text-blue-gray-600 mb-6">
              Commencez par ajouter des contacts à votre campagne de recrutement
            </Typography>
            <Button
              size="lg"
              variant="gradient"
              color="blue"
              className="flex items-center gap-2 mx-auto"
              onClick={onAddContacts}
            >
              <UserPlusIcon className="h-5 w-5" />
              Ajouter des contacts
            </Button>
          </CardBody>
        </Card>
      )}

      {/* Dialog de confirmation pour Trier */}
      <Dialog open={isTrierDialogOpen} handler={() => setIsTrierDialogOpen(false)} size="sm">
        <DialogHeader className="flex items-center gap-2">
          <FunnelIcon className="h-6 w-6 text-blue-500" />
          Trier les Profils
        </DialogHeader>
        <DialogBody>
          <Alert
            color="blue"
            icon={<SparklesIcon className="h-6 w-6" />}
            className="mb-4"
          >
            <Typography className="font-medium">
              Triage automatique des profils
            </Typography>
            <Typography variant="small" className="mt-2 font-normal">
              Cette action va analyser et trier automatiquement {stats.profilesEnAttente} profils en attente
              selon les critères de votre campagne.
            </Typography>
          </Alert>
          <div className="bg-blue-50 rounded-lg p-4">
            <Typography variant="small" className="text-blue-gray-700">
              <strong>Profils à traiter:</strong> {stats.profilesEnAttente}
            </Typography>
            <Typography variant="small" className="text-blue-gray-600 mt-1">
              Les profils seront automatiquement classés comme "GARDE" ou "REJETE" selon leur pertinence.
            </Typography>
          </div>
        </DialogBody>
        <DialogFooter className="space-x-2">
          <Button
            variant="text"
            color="blue-gray"
            onClick={() => setIsTrierDialogOpen(false)}
            disabled={isTrierLoading}
          >
            Annuler
          </Button>
          <Button
            variant="gradient"
            color="blue"
            onClick={handleTrier}
            disabled={isTrierLoading}
            className="flex items-center gap-2"
          >
            {isTrierLoading ? (
              <>
                <BoltIcon className="h-4 w-4 animate-pulse" />
                Triage en cours...
              </>
            ) : (
              <>
                <FunnelIcon className="h-4 w-4" />
                Lancer le triage
              </>
            )}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Dialog d'informations de la campagne */}
      <Dialog
        open={infoDialogOpen}
        handler={() => setInfoDialogOpen(false)}
        size="lg"
        className="bg-gradient-to-br from-noir-absolu via-bleu-fonce/90 to-violet-plasma/20 border-2 border-bleu-neon/30  backdrop-blur-xl"
      >
        <DialogHeader className="flex items-center gap-3 pb-4 border-b border-bleu-neon/30 bg-gradient-to-r from-bleu-neon/10 to-violet-plasma/10 relative">
          {/* Effet de particules flottantes */}
          <div className="absolute top-2 right-4 w-1 h-1 bg-bleu-neon rounded-full animate-pulse"></div>
          <div className="absolute top-6 right-8 w-0.5 h-0.5 bg-violet-plasma rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>

          <div className="p-3 bg-gradient-to-br from-bleu-neon/20 to-violet-plasma/20 rounded-xl backdrop-blur-sm border border-bleu-neon/20 shadow-neon-blue">
            <InformationCircleIcon className="h-6 w-6 text-bleu-neon animate-glow" />
          </div>
          <Typography variant="h4" className="text-blanc-pur font-bold bg-gradient-primary bg-clip-text text-transparent">
            Informations de la campagne
          </Typography>
        </DialogHeader>

        <DialogBody className="max-h-96 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-bleu-neon/40 scrollbar-track-transparent">
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-bleu-neon/5 to-violet-plasma/5 rounded-xl p-5 border border-bleu-neon/20 backdrop-blur-sm relative overflow-hidden">
              {/* Effet de lueur d'arrière-plan */}
              <div className="absolute inset-0 bg-gradient-to-r from-bleu-neon/5 to-violet-plasma/5 rounded-xl blur-xl"></div>

              <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="w-1 h-8 bg-gradient-to-b from-bleu-neon to-violet-plasma rounded-full shadow-neon-blue"></div>
                <Typography variant="h6" className="text-bleu-neon font-bold animate-glow">
                  Informations générales
                </Typography>
                {/* Points décoratifs */}
                <div className="flex gap-1 ml-auto">
                  <div className="w-2 h-2 bg-bleu-neon/60 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-violet-plasma/60 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                  <div className="w-2 h-2 bg-bleu-neon/60 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }}></div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                <div className="space-y-3 group">
                  <Typography variant="small" className="font-bold text-violet-plasma/90 uppercase tracking-wider text-xs">
                    Nom de la campagne
                  </Typography>
                  <div className="p-4 bg-gradient-to-r from-bleu-fonce/80 to-noir-absolu/60 rounded-lg border border-bleu-neon/20 backdrop-blur-sm hover:border-violet-plasma/40 transition-all duration-300 shadow-neon-subtle">
                    <Typography className="text-blanc-pur font-medium group-hover:text-bleu-neon transition-colors duration-300">
                      {campaignData.nom}
                    </Typography>
                  </div>
                </div>

                <div className="space-y-3 group">
                  <Typography variant="small" className="font-bold text-violet-plasma/90 uppercase tracking-wider text-xs">
                    Poste ciblé
                  </Typography>
                  <div className="p-4 bg-gradient-to-r from-bleu-fonce/80 to-noir-absolu/60 rounded-lg border border-bleu-neon/20 backdrop-blur-sm hover:border-violet-plasma/40 transition-all duration-300 shadow-neon-subtle">
                    <Typography className="text-blanc-pur font-medium group-hover:text-bleu-neon transition-colors duration-300">
                      {campaignData.poste}
                    </Typography>
                  </div>
                </div>

                <div className="space-y-3 group">
                  <Typography variant="small" className="font-bold text-violet-plasma/90 uppercase tracking-wider text-xs">
                    Zone géographique
                  </Typography>
                  <div className="p-4 bg-gradient-to-r from-bleu-fonce/80 to-noir-absolu/60 rounded-lg border border-bleu-neon/20 backdrop-blur-sm hover:border-violet-plasma/40 transition-all duration-300 shadow-neon-subtle">
                    <Typography className="text-blanc-pur font-medium group-hover:text-bleu-neon transition-colors duration-300">
                      {campaignData.zone}
                    </Typography>
                  </div>
                </div>

                <div className="space-y-3 group">
                  <Typography variant="small" className="font-bold text-violet-plasma/90 uppercase tracking-wider text-xs">
                    Séniorité
                  </Typography>
                  <div className="p-4 bg-gradient-to-r from-bleu-fonce/80 to-noir-absolu/60 rounded-lg border border-bleu-neon/20 backdrop-blur-sm hover:border-violet-plasma/40 transition-all duration-300 shadow-neon-subtle">
                    <Typography className="text-blanc-pur font-medium group-hover:text-bleu-neon transition-colors duration-300">
                      {campaignData.seniorite?.length > 0
                        ? campaignData.seniorite.join(', ')
                        : "Non spécifiée"}
                    </Typography>
                  </div>
                </div>

                <div className="space-y-3 group">
                  <Typography variant="small" className="font-bold text-violet-plasma/90 uppercase tracking-wider text-xs">
                    Taille d'entreprise
                  </Typography>
                  <div className="p-4 bg-gradient-to-r from-bleu-fonce/80 to-noir-absolu/60 rounded-lg border border-bleu-neon/20 backdrop-blur-sm hover:border-violet-plasma/40 transition-all duration-300 shadow-neon-subtle">
                    <Typography className="text-blanc-pur font-medium group-hover:text-bleu-neon transition-colors duration-300">
                      {campaignData.tailleEntreprise?.length > 0
                        ? campaignData.tailleEntreprise.join(', ')
                        : "Non spécifiée"}
                    </Typography>
                  </div>
                </div>

                <div className="space-y-3 group">
                  <Typography variant="small" className="font-bold text-violet-plasma/90 uppercase tracking-wider text-xs">
                    Langues requises
                  </Typography>
                  <div className="p-4 bg-gradient-to-r from-bleu-fonce/80 to-noir-absolu/60 rounded-lg border border-bleu-neon/20 backdrop-blur-sm hover:border-violet-plasma/40 transition-all duration-300 shadow-neon-subtle">
                    <Typography className="text-blanc-pur font-medium group-hover:text-bleu-neon transition-colors duration-300">
                      {campaignData.langues || "Non spécifiées"}
                    </Typography>
                  </div>
                </div>

                <div className="space-y-3 group md:col-span-2">
                  <Typography variant="small" className="font-bold text-violet-plasma/90 uppercase tracking-wider text-xs">
                    Secteurs ciblés
                  </Typography>
                  <div className="p-4 bg-gradient-to-r from-bleu-fonce/80 to-noir-absolu/60 rounded-lg border border-bleu-neon/20 backdrop-blur-sm hover:border-violet-plasma/40 transition-all duration-300 shadow-neon-subtle">
                    <Typography className="text-blanc-pur font-medium group-hover:text-bleu-neon transition-colors duration-300">
                      {campaignData.secteurs || "Non spécifiés"}
                    </Typography>
                  </div>
                </div>

                <div className="space-y-3 group">
                  <Typography variant="small" className="font-bold text-violet-plasma/90 uppercase tracking-wider text-xs">
                    Jours d'enrichissement
                  </Typography>
                  <div className="p-4 bg-gradient-to-r from-bleu-fonce/80 to-noir-absolu/60 rounded-lg border border-bleu-neon/20 backdrop-blur-sm hover:border-violet-plasma/40 transition-all duration-300 shadow-neon-subtle flex items-center gap-3">
                    <div className="relative">
                      <div className="w-3 h-3 bg-gradient-to-r from-vert-plasma to-bleu-neon rounded-full animate-pulse shadow-neon-green"></div>
                      <div className="absolute inset-0 w-3 h-3 bg-gradient-to-r from-vert-plasma to-bleu-neon rounded-full animate-ping opacity-30"></div>
                    </div>
                    <Typography className="text-blanc-pur font-medium group-hover:text-bleu-neon transition-colors duration-300">
                      {campaignData.jours_enrichissement || "Non spécifiés"}
                    </Typography>
                  </div>
                </div>
              </div>

              {/* Effet de particules flottantes dans le conteneur */}
              <div className="absolute top-4 right-6 w-1 h-1 bg-bleu-neon rounded-full animate-bounce opacity-60"></div>
              <div className="absolute bottom-6 left-8 w-0.5 h-0.5 bg-violet-plasma rounded-full animate-pulse opacity-80"></div>
            </div>
          </div>
        </DialogBody>

        <DialogFooter className="border-t border-bleu-neon/30 bg-gradient-to-r from-noir-absolu/80 to-bleu-fonce/60 backdrop-blur-sm relative">
          {/* Ligne de lumière en bas */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-primary opacity-60"></div>

          <Button
            variant="outlined"
            className="border-2 border-bleu-neon/40 text-bleu-neon hover:bg-gradient-primary hover:text-noir-absolu hover:border-violet-plasma transition-all duration-300 font-bold  hover:shadow-neon-gradient"
            onClick={() => setInfoDialogOpen(false)}
          >
            Fermer
          </Button>

          {/* Points décoratifs du footer */}
          <div className="absolute top-4 left-4 w-1 h-1 bg-bleu-neon rounded-full opacity-50 animate-pulse"></div>
          <div className="absolute top-2 left-8 w-0.5 h-0.5 bg-violet-plasma rounded-full opacity-70 animate-pulse" style={{ animationDelay: '0.7s' }}></div>
        </DialogFooter>
      </Dialog>

      {/* Dialog de confirmation de suppression */}
      <Dialog
        open={deleteDialogOpen}
        handler={() => {
          if (!deleting) {
            setDeleteDialogOpen(false);
            setDeleteOption('campaign-only'); // Reset option
          }
        }}
        size="md"
        className="bg-gradient-to-br from-noir-absolu via-bleu-fonce/90 to-rouge-danger/10 border-2 border-rouge-danger/40 shadow-neon-red backdrop-blur-xl"
      >
        <DialogHeader className="flex items-center gap-3 pb-4 border-b border-rouge-danger/30 bg-gradient-to-r from-rouge-danger/10 to-orange-vif/10 relative">
          {/* Particules d'alerte */}
          <div className="absolute top-2 right-4 w-1.5 h-1.5 bg-rouge-danger rounded-full animate-pulse shadow-neon-red"></div>
          <div className="absolute top-6 right-8 w-1 h-1 bg-orange-vif rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>

          <div className="p-3 bg-gradient-to-br from-rouge-danger/20 to-orange-vif/20 rounded-xl backdrop-blur-sm border border-rouge-danger/30 shadow-neon-red">
            <ExclamationTriangleIcon className="h-6 w-6 text-rouge-danger animate-bounce" />
          </div>
          <Typography variant="h4" className="text-blanc-pur font-bold">
            Supprimer la campagne
          </Typography>
        </DialogHeader>

        <DialogBody className="space-y-6 p-6">
          <div className="bg-gradient-to-r from-rouge-danger/5 to-orange-vif/5 rounded-xl p-4 border border-rouge-danger/20">
            <Typography className="text-blanc-pur mb-4">
              Vous êtes sur le point de supprimer la campagne <strong className="text-bleu-neon">"{campaignData.nom}"</strong>.
              Choisissez une option de suppression :
            </Typography>
          </div>

          {/* Options de suppression */}
          <div className="space-y-4">
            {/* Option 1: Supprimer seulement la campagne */}
            <div
              className={`border-2 rounded-xl p-5 cursor-pointer transition-all duration-300 backdrop-blur-sm relative group ${deleteOption === 'campaign-only'
                ? 'border-bleu-neon bg-gradient-to-r from-bleu-neon/10 to-violet-plasma/5 shadow-neon-blue'
                : 'border-gris-metallique/30 hover:border-bleu-neon/50 bg-gradient-to-r from-bleu-fonce/30 to-noir-absolu/50'
                }`}
              onClick={() => setDeleteOption('campaign-only')}
            >
              {/* Effet de lueur au survol */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-bleu-neon/5 to-violet-plasma/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              <div className="flex items-start gap-4 relative z-10">
                <div className="flex items-center h-6 mt-1">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${deleteOption === 'campaign-only'
                    ? 'border-bleu-neon bg-bleu-neon shadow-neon-blue'
                    : 'border-gris-metallique group-hover:border-bleu-neon'
                    }`}>
                    {deleteOption === 'campaign-only' && (
                      <div className="w-2.5 h-2.5 rounded-full bg-noir-absolu animate-pulse"></div>
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <Typography variant="h6" className="text-blanc-pur mb-2 font-bold">
                    Supprimer seulement la campagne
                  </Typography>
                  <Typography variant="small" className="text-gris-clair/80 mb-3">
                    Les contacts <span className="text-bleu-neon font-bold">({stats.totalContacts})</span> seront conservés et pourront être réutilisés
                    dans d'autres campagnes.
                  </Typography>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-vert-plasma rounded-full animate-pulse shadow-neon-green"></div>
                    <Typography variant="small" className="text-vert-plasma font-medium">
                      Option recommandée pour conserver vos données
                    </Typography>
                  </div>
                </div>
              </div>
            </div>

            {/* Option 2: Supprimer avec contacts */}
            <div
              className={`border-2 rounded-xl p-5 cursor-pointer transition-all duration-300 backdrop-blur-sm relative group ${deleteOption === 'with-contacts'
                ? 'border-rouge-danger bg-gradient-to-r from-rouge-danger/20 to-orange-vif/10 shadow-neon-red'
                : 'border-gris-metallique/30 hover:border-rouge-danger/50 bg-gradient-to-r from-bleu-fonce/30 to-noir-absolu/50'
                }`}
              onClick={() => setDeleteOption('with-contacts')}
            >
              {/* Effet de lueur rouge au survol */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-rouge-danger/10 to-orange-vif/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              <div className="flex items-start gap-4 relative z-10">
                <div className="flex items-center h-6 mt-1">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${deleteOption === 'with-contacts'
                    ? 'border-rouge-danger bg-rouge-danger shadow-neon-red'
                    : 'border-gris-metallique group-hover:border-rouge-danger'
                    }`}>
                    {deleteOption === 'with-contacts' && (
                      <div className="w-2.5 h-2.5 rounded-full bg-blanc-pur animate-pulse"></div>
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <Typography variant="h6" className="text-blanc-pur mb-2 font-bold">
                    Supprimer la campagne et tous ses contacts
                  </Typography>
                  <Typography variant="small" className="text-gris-clair/80 mb-3">
                    Suppression complète : la campagne ET ses <span className="text-rouge-danger font-bold">{stats.totalContacts}</span> contacts
                    seront définitivement effacés.
                  </Typography>
                  <div className="flex items-center gap-2">
                    <ExclamationTriangleIcon className="h-4 w-4 text-rouge-danger animate-pulse" />
                    <Typography variant="small" className="text-rouge-danger font-medium">
                      Action irréversible - Toutes les données seront perdues
                    </Typography>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Statistiques récapitulatives */}
          <div className="bg-gradient-to-r from-bleu-fonce/50 to-violet-plasma/20 rounded-xl p-5 border border-bleu-neon/20 backdrop-blur-sm space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-gradient-to-b from-bleu-neon to-violet-plasma rounded-full shadow-neon-blue"></div>
              <Typography variant="small" className="font-bold text-bleu-neon uppercase tracking-wider">
                Récapitulatif de la suppression
              </Typography>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-r from-noir-absolu/60 to-bleu-fonce/40 rounded-lg p-3 border border-gris-metallique/20">
                <Typography variant="small" className="text-violet-plasma/80 uppercase text-xs tracking-wide">Contacts totaux</Typography>
                <Typography variant="h6" className="font-bold text-blanc-pur">{stats.totalContacts}</Typography>
              </div>
              <div className="bg-gradient-to-r from-noir-absolu/60 to-bleu-fonce/40 rounded-lg p-3 border border-gris-metallique/20">
                <Typography variant="small" className="text-violet-plasma/80 uppercase text-xs tracking-wide">Messages envoyés</Typography>
                <Typography variant="h6" className="font-bold text-blanc-pur">{stats.messagesSent}</Typography>
              </div>
              <div className="bg-gradient-to-r from-noir-absolu/60 to-bleu-fonce/40 rounded-lg p-3 border border-gris-metallique/20">
                <Typography variant="small" className="text-violet-plasma/80 uppercase text-xs tracking-wide">Réponses reçues</Typography>
                <Typography variant="h6" className="font-bold text-blanc-pur">{stats.responsesReceived}</Typography>
              </div>
              <div className="bg-gradient-to-r from-noir-absolu/60 to-bleu-fonce/40 rounded-lg p-3 border border-gris-metallique/20">
                <Typography variant="small" className="text-violet-plasma/80 uppercase text-xs tracking-wide">Rendez-vous pris</Typography>
                <Typography variant="h6" className="font-bold text-vert-plasma">{stats.interested}</Typography>
              </div>
            </div>

            {deleteOption === 'with-contacts' && (
              <div className="bg-gradient-to-r from-rouge-danger/20 to-orange-vif/10 rounded-lg p-4 border border-rouge-danger/30 mt-4">
                <div className="flex items-center gap-2">
                  <ExclamationTriangleIcon className="h-5 w-5 text-rouge-danger animate-pulse" />
                  <Typography variant="small" className="font-bold text-rouge-danger">
                    Attention : Cette action supprimera définitivement toutes ces données !
                  </Typography>
                </div>
              </div>
            )}
          </div>
        </DialogBody>

        <DialogFooter className="flex items-center justify-between border-t border-rouge-danger/30 bg-gradient-to-r from-noir-absolu/80 to-bleu-fonce/60 backdrop-blur-sm relative">
          {/* Ligne de danger en bas */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-rouge-danger via-orange-vif to-rouge-danger opacity-60"></div>

          <Button
            variant="outlined"
            className="border-2 border-gris-metallique/50 text-gris-clair hover:bg-gris-metallique/10 hover:border-gris-metallique transition-all duration-300 font-medium"
            onClick={() => {
              setDeleteDialogOpen(false);
              setDeleteOption('campaign-only');
            }}
            disabled={deleting}
          >
            Annuler
          </Button>

          <Button
            variant="filled"
            className={`flex items-center gap-2 min-w-[160px] justify-center font-bold transition-all duration-300 ${deleteOption === 'with-contacts'
              ? 'bg-gradient-to-r from-rouge-danger to-orange-vif hover:shadow-neon-red text-blanc-pur border-2 border-rouge-danger/50'
              : 'bg-gradient-to-r from-orange-vif to-rouge-danger hover:shadow-neon-orange text-noir-absolu border-2 border-orange-vif/50'
              }`}
            onClick={onDeleteCampaign}
            disabled={deleting}
          >
            {deleting && <Spinner className="h-4 w-4" />}
            {deleting ? (
              'Suppression...'
            ) : deleteOption === 'with-contacts' ? (
              <>
                <TrashIcon className="h-4 w-4" />
                Tout supprimer
              </>
            ) : (
              <>
                <TrashIcon className="h-4 w-4" />
                Supprimer campagne
              </>
            )}
          </Button>

          {/* Points décoratifs du footer */}
          <div className="absolute top-4 left-4 w-1 h-1 bg-rouge-danger rounded-full opacity-50 animate-pulse"></div>
          <div className="absolute top-2 left-8 w-0.5 h-0.5 bg-orange-vif rounded-full opacity-70 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </DialogFooter>
      </Dialog>

      {/* Boutons d'action supplémentaires dans la barre d'actions */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-50">
        {hasContacts && (
          <Button
            size="sm"
            variant="outlined"
            color="blue-gray"
            className="flex items-center gap-2 bg-white shadow-lg"
            onClick={onViewContacts}
          >
            <EyeIcon className="h-4 w-4" />
            Voir Contacts ({stats.totalContacts})
          </Button>
        )}

        {stats.messagesSent > 0 && (stats.messagesSent - stats.responsesReceived) > 0 && (
          <Button
            size="sm"
            variant="gradient"
            color="cyan"
            className="flex items-center gap-2 shadow-lg"
            onClick={exportContactsSansReponse}
          >
            <ArrowDownTrayIcon className="h-4 w-4" />
            Exporter sans réponse ({stats.messagesSent - stats.responsesReceived})
          </Button>
        )}


        <Button
          size="sm"
          variant="outlined"
          color="blue-gray"
          className="flex items-center gap-2 bg-white shadow-lg"
          onClick={() => setInfoDialogOpen(true)}
        >
          <InformationCircleIcon className="h-4 w-4" />
          Informations
        </Button>

        {campaignData.statut !== "Actif" && hasContacts && (
          <Button
            size="sm"
            variant="gradient"
            color="green"
            onClick={handleLaunchCampaign}
            disabled={launchingCampaign}
            className="flex items-center gap-2"
          >
            <PlayIcon className="h-4 w-4" />
            {launchingCampaign ? 'Lancement...' : 'Lancer'}
          </Button>
        )}

        {campaignData.statut === "Actif" && hasContacts && (
          <Button
            size="sm"
            variant="outlined"
            color="blue-gray"
            className="flex items-center gap-2 bg-white shadow-lg"
            disabled={pauseCampaign}
            onClick={handlePausedCampaign}
          >
            <PauseCircleIcon className="h-4 w-4" />
            Pause
          </Button>)}

        {campaignData.statut === "Actif" && hasContacts && (

          <Button
            size="sm"
            variant="gradient"
            color="orange"
            onClick={handleFinisCampaign}
            disabled={terminating}
            className="flex items-center gap-2"
          >
            <StopIcon className="h-4 w-4" />
            {terminating ? 'Traitement...' : `Terminer`}
          </Button>)}

        <Button
          size="sm"
          variant="outlined"
          color="blue-gray"
          className="flex items-center gap-2 bg-white shadow-lg"
          onClick={onEditCampaign}
        >
          <PencilIcon className="h-4 w-4" />
          Modifier
        </Button>

        <Button
          size="sm"
          variant="outlined"
          color="red"
          className="flex items-center gap-2 bg-white shadow-lg"
          onClick={() => setDeleteDialogOpen(true)}
        >
          <TrashIcon className="h-4 w-4" />
          Supprimer
        </Button>
      </div>

      <ModernProgressBar
        events={events}
        isConnected={isConnected}
        onClose={clearEvents}
      />

    </div>
  );
}
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
  ClipboardDocumentCheckIcon,
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
  Line,
  Legend,
  FunnelChart,
  Funnel,
  LabelList,
} from "recharts";

// Import des services Airtable
import { getCampagneById, lancerCampagne, deleteCampagne, updateCampagneStatus, deleteCampagneWithContacts, updateCampagneEnrichissement } from '@/services/Campagne';
import { getContactsByCampaignId, exportContactsSansReponseCSV } from '@/services/Contact';
import { useParams, useNavigate } from "react-router-dom";
import ModernProgressBar from "@/utils/ModernBar";
import CompactTimelineProgress from "@/utils/CompactTimelineProgress";
import 'react-toastify/dist/ReactToastify.css';
import toastify from "@/utils/toastify";
import { ToastContainer } from 'react-toastify';
import Loading from "@/components/Loading";

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

  const { events, isConnected, connectToWorkflow, clearEvents } = useSSE();

  // États pour les données
  const [campaignData, setCampaignData] = useState(null);

  const [contactsData, setContactsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Stats principales
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

  // 🆕 STATS EMELIA
  const [emeliaStats, setEmeliaStats] = useState({
    totalSent: 0,
    delivered: 0,
    deliveryRate: 0,
    opened: 0,
    openRate: 0,
    clicked: 0,
    clickRate: 0,
    replied: 0,
    replyRate: 0,
    bounced: 0,
    bounceRate: 0,
    unsubscribed: 0,
    unsubscribeRate: 0,
    lastSync: new Date(),
    campaignStatus: "active",
    dailyLimit: 0,
    sent24h: 0,
  });

  const [emeliaActivities, setEmeliaActivities] = useState([]);

  const [emeliaPerformanceData, setEmeliaPerformanceData] = useState([]);

  // États UI
  const [activeTab, setActiveTab] = useState("overview");
  const [isTrierDialogOpen, setIsTrierDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [deleteOption, setDeleteOption] = useState('campaign-only');

  // États actions
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
  const [syncingEmelia, setSyncingEmelia] = useState(false);

  // Fonctions handlers
  const handleAutomaticToggle = () => {
    setCampaignData(prev => ({
      ...prev,
      enrichissement: prev.enrichissement === "En cours" ? "Arrêté" : "En cours"
    }));
  };

  const handleTrier = () => {
    setIsTrierLoading(true);
    setTimeout(() => setIsTrierLoading(false), 2000);
  };

  const handleRetrier = () => {
    setIsRetrierLoading(true);
    setTimeout(() => setIsRetrierLoading(false), 2000);
  };

  const handleLaunchCampaign = () => {
    setLaunchingCampaign(true);
    setTimeout(() => {
      setCampaignData(prev => ({ ...prev, statut: "Actif" }));
      setLaunchingCampaign(false);
    }, 1500);
  };

  const handlePausedCampaign = () => {
    setTerminating(true);
    setTimeout(() => {
      setCampaignData(prev => ({ ...prev, statut: "En attente" }));
      setTerminating(false);
    }, 1500);
  };

  const handleFinisCampaign = () => {
    setTerminating(true);
    setTimeout(() => {
      setCampaignData(prev => ({ ...prev, statut: "Terminé" }));
      setTerminating(false);
    }, 1500);
  };

  // 🆕 SYNC EMELIA
  const handleSyncEmelia = () => {
    setSyncingEmelia(true);
    setTimeout(() => {
      setEmeliaStats(prev => ({
        ...prev,
        lastSync: new Date()
      }));
      setSyncingEmelia(false);
    }, 2000);
  };

  const onBack = () => console.log("Retour");
  const onAddContacts = () => console.log("Ajouter contacts");
  const onViewContacts = () => console.log("Voir contacts");
  const onEditCampaign = () => console.log("Modifier campagne");

  // Composant StatCard
  const StatCard = ({ title, value, subtitle, icon: Icon, color, trend, badge }) => (
    <Card className="relative overflow-hidden border shadow-sm hover:shadow-lg transition-all duration-300">
      <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-${color}-400 to-${color}-600`}></div>
      <CardBody className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <Typography variant="small" className="font-medium text-blue-gray-600 mb-1">
              {title}
            </Typography>
            <Typography variant="h3" color="blue-gray" className="mb-1">
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="small" className="text-blue-gray-500">
                {subtitle}
              </Typography>
            )}
            {badge && (
              <Chip
                size="sm"
                value={badge}
                color={badge === "Excellent" ? "green" : badge === "Moyen" ? "amber" : "red"}
                className="mt-2"
              />
            )}
          </div>
          <div className="flex flex-col items-end">
            <div className={`p-2 rounded-lg bg-gradient-to-br from-${color}-50 to-${color}-100`}>
              <Icon className={`h-6 w-6 text-${color}-600`} />
            </div>
            {trend && (
              <div className="flex items-center mt-2">
                {trend > 0 ? (
                  <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
                ) : (
                  <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />
                )}
                <Typography variant="small" className={trend > 0 ? "text-green-600" : "text-red-600"}>
                  {Math.abs(trend)}%
                </Typography>
              </div>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );

  // 🆕 COMPOSANT ACTIVITÉ EMELIA
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
      const hours = Math.floor((Date.now() - activity.timestamp.getTime()) / (1000 * 60 * 60));
      if (hours < 1) return "Il y a quelques minutes";
      if (hours < 24) return `Il y a ${hours}h`;
      const days = Math.floor(hours / 24);
      return `Il y a ${days}j`;
    };

    return (
      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
        <div className="mt-0.5">{getIcon()}</div>
        <div className="flex-1 min-w-0">
          <Typography variant="small" className="font-medium text-blue-gray-900">
            {activity.contact} {getLabel()}
          </Typography>
          {activity.subject && (
            <Typography variant="small" className="text-blue-gray-600 truncate">
              {activity.subject}
            </Typography>
          )}
          <Typography variant="small" className="text-blue-gray-500 text-xs mt-1">
            {timeAgo()}
          </Typography>
        </div>
      </div>
    );
  };

  // Données graphiques
  const performanceData = [
    { date: "Lun", messages: 125, responses: 18, interested: 5 },
    { date: "Mar", messages: 142, responses: 24, interested: 8 },
    { date: "Mer", messages: 138, responses: 21, interested: 6 },
    { date: "Jeu", messages: 156, responses: 28, interested: 9 },
    { date: "Ven", messages: 148, responses: 25, interested: 7 },
    { date: "Sam", messages: 95, responses: 15, interested: 3 },
    { date: "Dim", messages: 88, responses: 25, interested: 4 },
  ];

  const profileDistribution = [
    { name: "Profils Gardés", value: stats.profilesGarde, color: "#10B981" },
    { name: "Profils Rejetés", value: stats.profilesRejete, color: "#EF4444" },
    { name: "En Attente", value: stats.profilesEnAttente, color: "#F59E0B" },
  ];

  const statusDistribution = [
    { name: "Messages envoyés", value: stats.messagesSent, color: "#3B82F6" },
    { name: "Réponses reçues", value: stats.responsesReceived, color: "#8B5CF6" },
    { name: "Intéressés", value: stats.interested, color: "#10B981" },
    { name: "Non contactés", value: stats.totalContacts - stats.messagesSent, color: "#6B7280" },
  ];

  // 🆕 DONNÉES FUNNEL EMELIA
  const emeliaFunnelData = [
    { name: "Envoyés", value: emeliaStats.totalSent, fill: "#3B82F6" },
    { name: "Délivrés", value: emeliaStats.delivered, fill: "#10B981" },
    { name: "Ouverts", value: emeliaStats.opened, fill: "#8B5CF6" },
    { name: "Cliqués", value: emeliaStats.clicked, fill: "#F59E0B" },
    { name: "Répondus", value: emeliaStats.replied, fill: "#06B6D4" },
  ];

  const hasContacts = stats.totalContacts > 0;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner className="h-12 w-12" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <IconButton
              variant="text"
              color="blue-gray"
              onClick={onBack}
              className="rounded-full hover:bg-gray-100"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </IconButton>
            <div>
              <Typography variant="h4" color="blue-gray" className="mb-1">
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

        {/* 🆕 MINI STATS EMELIA DANS LE HEADER */}
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
              <Button
                size="sm"
                variant="outlined"
                color="blue"
                onClick={handleSyncEmelia}
                disabled={syncingEmelia}
                className="flex items-center gap-2"
              >
                <ArrowPathIcon className={`h-4 w-4 ${syncingEmelia ? 'animate-spin' : ''}`} />
                Sync
              </Button>
            </div>
          </div>
        </div>

        {/* Actions */}
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
              <div className={`flex items-center gap-2 rounded-lg px-4 py-2 border transition-all duration-300 ${campaignData.enrichissement === "En cours"
                ? 'bg-green-50 border-green-200'
                : 'bg-white/60 border-gray-200'
                }`}>
                <Typography variant="small" className="font-medium text-blue-gray-700">
                  Mode Auto
                </Typography>
                <Switch
                  checked={campaignData.enrichissement === "En cours"}
                  onChange={handleAutomaticToggle}
                  color="green"
                />
              </div>

              <Button size="sm" variant="gradient" color="blue" onClick={onAddContacts}>
                <UserPlusIcon className="h-4 w-4 mr-2" />
                Ajouter
              </Button>

              <Button size="sm" variant="gradient" color="purple" disabled={enriching}>
                <SparklesIcon className="h-4 w-4 mr-2" />
                Enrichir
              </Button>

              <Button size="sm" variant="gradient" color="blue" onClick={() => setIsTrierDialogOpen(true)}>
                <FunnelIcon className="h-4 w-4 mr-2" />
                Trier ({stats.profilesEnAttente})
              </Button>

              {campaignData.statut !== "Actif" && (
                <Button size="sm" variant="gradient" color="green" onClick={handleLaunchCampaign}>
                  <PlayIcon className="h-4 w-4 mr-2" />
                  Lancer
                </Button>
              )}

              {campaignData.statut === "Actif" && (
                <Button size="sm" variant="outlined" color="blue-gray" onClick={handlePausedCampaign}>
                  <PauseCircleIcon className="h-4 w-4 mr-2" />
                  Pause
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Onglets */}
      <Tabs value={activeTab}>
        <TabsHeader className="rounded-lg bg-blue-gray-50/50">
          <Tab value="overview" onClick={() => setActiveTab("overview")}>
            <div className="flex items-center gap-2">
              <ChartPieIcon className="h-4 w-4" />
              Vue d'ensemble
            </div>
          </Tab>
          <Tab value="performance" onClick={() => setActiveTab("performance")}>
            <div className="flex items-center gap-2">
              <ChartBarIcon className="h-4 w-4" />
              Performance
            </div>
          </Tab>
          <Tab value="profiles" onClick={() => setActiveTab("profiles")}>
            <div className="flex items-center gap-2">
              <UserGroupIcon className="h-4 w-4" />
              Profils
            </div>
          </Tab>
          <Tab value="emelia" onClick={() => setActiveTab("emelia")}>
            <div className="flex items-center gap-2">
              <SignalIcon className="h-4 w-4" />
              Emelia
            </div>
          </Tab>
          <Tab value="activities" onClick={() => setActiveTab("activities")}>
            <div className="flex items-center gap-2">
              <ClipboardDocumentCheckIcon className="h-4 w-4" />
              Activités
            </div>
          </Tab>
        </TabsHeader>

        <TabsBody>
          {/* Onglet Vue d'ensemble */}
          <TabPanel value="overview" className="p-0 pt-4">
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
                subtitle={`${Math.round((stats.messagesSent / stats.totalContacts) * 100)}% du total`}
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

            {/* 🆕 SECTION STATS EMELIA */}
            <Typography variant="h6" color="blue-gray" className="mb-4 mt-6">
              Statistiques Emelia
            </Typography>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard
                title="Taux d'Ouverture"
                value={`${emeliaStats.openRate}%`}
                subtitle={`${emeliaStats.opened} / ${emeliaStats.totalSent}`}
                icon={EyeIcon}
                color="blue"
                badge={emeliaStats.openRate > 30 ? "Excellent" : emeliaStats.openRate > 15 ? "Moyen" : "Faible"}
              />
              <StatCard
                title="Taux de Clic"
                value={`${emeliaStats.clickRate}%`}
                subtitle={`${emeliaStats.clicked} clics`}
                icon={CursorArrowRippleIcon}
                color="purple"
              />
              <StatCard
                title="Taux de Délivrabilité"
                value={`${emeliaStats.deliveryRate}%`}
                subtitle={`${emeliaStats.delivered} / ${emeliaStats.totalSent}`}
                icon={CheckCircleIcon}
                color="green"
              />
              <StatCard
                title="Taux de Bounce"
                value={`${emeliaStats.bounceRate}%`}
                subtitle={`${emeliaStats.bounced} bounces`}
                icon={ExclamationCircleIcon}
                color="red"
              />
            </div>

            {/* Graphiques */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader floated={false} shadow={false} className="pb-4">
                  <Typography variant="h6" color="blue-gray">
                    Distribution des Statuts
                  </Typography>
                </CardHeader>
                <CardBody className="pt-0">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={statusDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {statusDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardBody>
              </Card>

              <Card>
                <CardHeader floated={false} shadow={false} className="pb-4">
                  <Typography variant="h6" color="blue-gray">
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
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="messages" stroke="#3B82F6" fill="url(#colorMessages)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardBody>
              </Card>
            </div>
          </TabPanel>

          {/* Onglet Performance */}
          <TabPanel value="performance" className="p-0 pt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader floated={false} shadow={false} className="pb-4">
                  <Typography variant="h6" color="blue-gray">
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
                          {Math.round((stats.interested / stats.responsesReceived) * 100)}%
                        </Typography>
                      </div>
                      <Progress value={Math.round((stats.interested / stats.responsesReceived) * 100)} color="green" />
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* 🆕 FUNNEL EMELIA */}
              <Card>
                <CardHeader floated={false} shadow={false} className="pb-4">
                  <Typography variant="h6" color="blue-gray">
                    Entonnoir de Conversion Emelia
                  </Typography>
                </CardHeader>
                <CardBody className="pt-0">
                  <div className="space-y-3">
                    {emeliaFunnelData.map((item, index) => (
                      <div key={index}>
                        <div className="flex justify-between mb-1">
                          <Typography variant="small">{item.name}</Typography>
                          <Typography variant="small" className="font-medium">{item.value}</Typography>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="h-3 rounded-full transition-all duration-500"
                            style={{
                              width: `${(item.value / emeliaStats.totalSent) * 100}%`,
                              backgroundColor: item.fill
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </div>
          </TabPanel>

          {/* Onglet Profils */}
          <TabPanel value="profiles" className="p-0 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <StatCard
                title="Profils Gardés"
                value={stats.profilesGarde}
                subtitle={`${Math.round((stats.profilesGarde / stats.totalContacts) * 100)}% du total`}
                icon={CheckCircleIcon}
                color="green"
              />
              <StatCard
                title="Profils Rejetés"
                value={stats.profilesRejete}
                subtitle={`${Math.round((stats.profilesRejete / stats.totalContacts) * 100)}% du total`}
                icon={XCircleIcon}
                color="red"
              />
              <StatCard
                title="En Attente"
                value={stats.profilesEnAttente}
                subtitle="À traiter"
                icon={ClockIcon}
                color="orange"
              />
            </div>

            <Card>
              <CardHeader floated={false} shadow={false} className="pb-4">
                <Typography variant="h6" color="blue-gray">
                  Distribution des Profils
                </Typography>
              </CardHeader>
              <CardBody className="pt-0">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={profileDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {profileDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>
          </TabPanel>

          {/* 🆕 ONGLET EMELIA */}
          <TabPanel value="emelia" className="p-0 pt-4">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <Typography variant="h5" color="blue-gray">
                  Tableau de bord Emelia
                </Typography>
                <div className="flex items-center gap-3">
                  <Typography variant="small" className="text-blue-gray-600">
                    Dernière sync: {emeliaStats.lastSync.toLocaleTimeString('fr-FR')}
                  </Typography>
                  <Button
                    size="sm"
                    variant="gradient"
                    color="blue"
                    onClick={handleSyncEmelia}
                    disabled={syncingEmelia}
                    className="flex items-center gap-2"
                  >
                    <ArrowPathIcon className={`h-4 w-4 ${syncingEmelia ? 'animate-spin' : ''}`} />
                    {syncingEmelia ? 'Sync...' : 'Synchroniser'}
                  </Button>
                </div>
              </div>

              <Alert color="blue" icon={<SignalIcon className="h-5 w-5" />} className="mb-6">
                <Typography variant="small" className="font-medium">
                  Campagne active • Limite quotidienne: {emeliaStats.dailyLimit} emails/jour •
                  Envoyés aujourd'hui: {emeliaStats.sent24h}
                </Typography>
              </Alert>
            </div>

            {/* Stats détaillées Emelia */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard
                title="Emails Envoyés"
                value={emeliaStats.totalSent}
                subtitle="Total de la campagne"
                icon={PaperAirplaneIcon}
                color="blue"
              />
              <StatCard
                title="Taux de Délivrabilité"
                value={`${emeliaStats.deliveryRate}%`}
                subtitle={`${emeliaStats.delivered} délivrés`}
                icon={CheckCircleIcon}
                color="green"
                badge={emeliaStats.deliveryRate > 95 ? "Excellent" : "Moyen"}
              />
              <StatCard
                title="Taux d'Ouverture"
                value={`${emeliaStats.openRate}%`}
                subtitle={`${emeliaStats.opened} ouvertures`}
                icon={EyeIcon}
                color="purple"
                badge={emeliaStats.openRate > 30 ? "Excellent" : emeliaStats.openRate > 15 ? "Moyen" : "Faible"}
              />
              <StatCard
                title="Taux de Clic"
                value={`${emeliaStats.clickRate}%`}
                subtitle={`${emeliaStats.clicked} clics`}
                icon={CursorArrowRippleIcon}
                color="orange"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard
                title="Taux de Réponse"
                value={`${emeliaStats.replyRate}%`}
                subtitle={`${emeliaStats.replied} réponses`}
                icon={ChatBubbleLeftRightIcon}
                color="indigo"
              />
              <StatCard
                title="Bounces"
                value={emeliaStats.bounced}
                subtitle={`${emeliaStats.bounceRate}% du total`}
                icon={ExclamationCircleIcon}
                color="red"
              />
              <StatCard
                title="Désabonnements"
                value={emeliaStats.unsubscribed}
                subtitle={`${emeliaStats.unsubscribeRate}% du total`}
                icon={XCircleIcon}
                color="gray"
              />
              <StatCard
                title="Quota Journalier"
                value={`${emeliaStats.sent24h}/${emeliaStats.dailyLimit}`}
                subtitle={`${Math.round((emeliaStats.sent24h / emeliaStats.dailyLimit) * 100)}% utilisé`}
                icon={ClockIcon}
                color="cyan"
              />
            </div>

            {/* Graphique performance Emelia */}
            <Card className="mb-6">
              <CardHeader floated={false} shadow={false} className="pb-4">
                <Typography variant="h6" color="blue-gray">
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

            {/* Indicateur de santé */}
            <Card>
              <CardHeader floated={false} shadow={false} className="pb-4">
                <Typography variant="h6" color="blue-gray">
                  Indicateurs de Santé de la Campagne
                </Typography>
              </CardHeader>
              <CardBody className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <Typography variant="small" className="font-bold text-green-900">
                        Délivrabilité
                      </Typography>
                    </div>
                    <Typography variant="h4" className="text-green-600 mb-1">
                      {emeliaStats.deliveryRate}%
                    </Typography>
                    <Typography variant="small" className="text-green-700">
                      {emeliaStats.deliveryRate > 95 ? "Excellente" : "Bonne"} délivrabilité
                    </Typography>
                  </div>

                  <div className={`rounded-lg p-4 border-2 ${emeliaStats.openRate > 30 ? 'bg-green-50 border-green-200' :
                    emeliaStats.openRate > 15 ? 'bg-yellow-50 border-yellow-200' :
                      'bg-red-50 border-red-200'
                    }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-3 h-3 rounded-full ${emeliaStats.openRate > 30 ? 'bg-green-500' :
                        emeliaStats.openRate > 15 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}></div>
                      <Typography variant="small" className="font-bold">
                        Engagement
                      </Typography>
                    </div>
                    <Typography variant="h4" className="mb-1">
                      {emeliaStats.openRate}%
                    </Typography>
                    <Typography variant="small">
                      {emeliaStats.openRate > 30 ? "Excellent" : emeliaStats.openRate > 15 ? "Moyen" : "Faible"} taux d'ouverture
                    </Typography>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <Typography variant="small" className="font-bold text-blue-900">
                        Conversion
                      </Typography>
                    </div>
                    <Typography variant="h4" className="text-blue-600 mb-1">
                      {emeliaStats.replyRate}%
                    </Typography>
                    <Typography variant="small" className="text-blue-700">
                      Taux de réponse
                    </Typography>
                  </div>
                </div>
              </CardBody>
            </Card>
          </TabPanel>

          {/* 🆕 ONGLET ACTIVITÉS */}
          <TabPanel value="activities" className="p-0 pt-4">
            <Card>
              <CardHeader floated={false} shadow={false} className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Typography variant="h6" color="blue-gray">
                      Activités Récentes Emelia
                    </Typography>
                    <Typography variant="small" className="text-blue-gray-600 mt-1">
                      Timeline des interactions avec vos emails
                    </Typography>
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
                    <Typography variant="h6" color="blue-gray" className="mb-2">
                      Aucune activité récente
                    </Typography>
                    <Typography variant="small" className="text-blue-gray-600">
                      Les activités apparaîtront ici une fois que vos emails seront envoyés
                    </Typography>
                  </div>
                )}
              </CardBody>
            </Card>
          </TabPanel>
        </TabsBody>
      </Tabs>

      {/* Boutons d'action fixes */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-50">
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

      {/* Dialogs */}
      <Dialog open={isTrierDialogOpen} handler={() => setIsTrierDialogOpen(false)} size="sm">
        <DialogHeader>Trier les Profils</DialogHeader>
        <DialogBody>
          <Typography>
            Voulez-vous trier automatiquement {stats.profilesEnAttente} profils en attente ?
          </Typography>
        </DialogBody>
        <DialogFooter>
          <Button variant="text" onClick={() => setIsTrierDialogOpen(false)} className="mr-2">
            Annuler
          </Button>
          <Button variant="gradient" color="blue" onClick={handleTrier} disabled={isTrierLoading}>
            {isTrierLoading ? "Tri en cours..." : "Trier"}
          </Button>
        </DialogFooter>
      </Dialog>

      <Dialog open={infoDialogOpen} handler={() => setInfoDialogOpen(false)} size="lg">
        <DialogHeader>Informations de la campagne</DialogHeader>
        <DialogBody className="max-h-96 overflow-y-auto">
          <div className="space-y-4">
            <div>
              <Typography variant="small" className="font-bold text-blue-gray-600">Nom</Typography>
              <Typography>{campaignData.nom}</Typography>
            </div>
            <div>
              <Typography variant="small" className="font-bold text-blue-gray-600">Poste</Typography>
              <Typography>{campaignData.poste}</Typography>
            </div>
            <div>
              <Typography variant="small" className="font-bold text-blue-gray-600">Zone</Typography>
              <Typography>{campaignData.zone}</Typography>
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="gradient" onClick={() => setInfoDialogOpen(false)}>
            Fermer
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
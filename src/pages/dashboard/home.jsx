import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Progress,
  Avatar,
  Chip,
  IconButton,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Spinner,
} from "@material-tailwind/react";
import {
  UserGroupIcon,
  MegaphoneIcon,
  MapPinIcon,
  BriefcaseIcon,
  CheckCircleIcon,
  ClockIcon,
  EllipsisVerticalIcon,
  ArrowUpIcon,
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  UsersIcon,
  BuildingOfficeIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  RocketLaunchIcon,
  BeakerIcon,
  CircleStackIcon,
  CpuChipIcon,
} from "@heroicons/react/24/outline";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";

// Import des services Airtable
import { getAllCampagnes } from '@/services/Campagne';
import { getAllContacts, getContactsStats } from '@/services/Contact';
import Loading  from '@/components/Loading';

export function Home() {
  const [campaignsData, setCampaignsData] = useState([]);
  const [contactsData, setContactsData] = useState([]);
  const [contactsStats, setContactsStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger les données au montage du composant
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Charger les campagnes
        const campaignsResponse = await getAllCampagnes();
        setCampaignsData(campaignsResponse.data || []);

        // Charger les contacts
        const contactsResponse = await getAllContacts();
        setContactsData(contactsResponse.data || []);

        // Charger les statistiques des contacts
        const statsResponse = await getContactsStats();
        setContactsStats(statsResponse.data || {});
        console.log("sdsddsd",statsResponse);
        
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err);
        setError('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Fonction pour créer les données de tendance temporelle réelles
  const createTrendData = () => {
    if (!contactsData.length) return [];

    // Créer un objet pour grouper les données par mois
    const monthlyData = {};
    
    contactsData.forEach(contact => {
      // Utiliser dateMessage en priorité, sinon dateCreation
      const dateStr = contact.dateMessage || contact.dateCreation;
      if (!dateStr) return;
      
      // Parser la date (adapter selon votre format de date)
      let date;
      try {
        // Essayer différents formats de date
        if (dateStr.includes('/')) {
          // Format DD/MM/YYYY ou MM/DD/YYYY
          const parts = dateStr.split('/');
          if (parts.length === 3) {
            date = new Date(parts[2], parts[1] - 1, parts[0]); // DD/MM/YYYY
            if (isNaN(date.getTime())) {
              date = new Date(parts[2], parts[0] - 1, parts[1]); // MM/DD/YYYY
            }
          }
        } else if (dateStr.includes('-')) {
          // Format YYYY-MM-DD
          date = new Date(dateStr);
        } else {
          // Autres formats
          date = new Date(dateStr);
        }
        
        if (isNaN(date.getTime())) return;
      } catch (e) {
        return;
      }

      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'short' });
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          period: monthLabel,
          date: date,
          contacts: 0,
          messagesEnvoyes: 0,
          reponses: 0,
        };
      }
      
      monthlyData[monthKey].contacts += 1;
      
      if (contact.statut === 'Message envoyé' || contact.statut === 'Répondu' || 
          contact.statut === 'Intéressé' || contact.statut === 'Non intéressé') {
        monthlyData[monthKey].messagesEnvoyes += 1;
      }
      
      if (contact.statut === 'Répondu' || contact.statut === 'Intéressé' || 
          contact.statut === 'Non intéressé') {
        monthlyData[monthKey].reponses += 1;
      }
    });

    // Convertir en tableau et trier par date
    const trendArray = Object.values(monthlyData)
      .sort((a, b) => a.date - b.date)
      .slice(-6); // Garder les 6 derniers mois

    return trendArray;
  };

  // Calcul des statistiques
  const totalCampaigns = campaignsData.length;
  const activeCampaigns = campaignsData.filter(c => c.statut === "Actif").length;
  const totalContacts = contactsData.length;
  const messagesSent = contactsStats?.messageEnvoye || 0;
  const responsesReceived = contactsStats?.reponseRecue || 0;
  // Calcul correct du taux de réponse : Réponses reçues / Messages envoyés
  const responseRate = messagesSent > 0 ? ((responsesReceived / messagesSent) * 100).toFixed(1) : 0;

  // Préparation des données pour les graphiques
  const statusData = [
    { name: 'Non contacté', value: contactsStats?.nonContacte || 0, color: '#64748b' },
    { name: 'Message envoyé', value: contactsStats?.messageEnvoye || 0, color: '#00CFFF' },
    { name: 'Réponse reçue', value: contactsStats?.reponseRecue || 0, color: '#22c55e' },
    { name: 'Intéressé', value: contactsStats?.interesse || 0, color: '#A63DFF' },
    { name: 'Non intéressé', value: contactsStats?.nonInteresse || 0, color: '#ef4444' },
    { name: 'À relancer', value: contactsStats?.aRelancer || 0, color: '#f59e0b' },
  ];

  const profileData = [
    { name: 'Gardé', value: contactsStats?.profilsGardes || 0, color: '#A63DFF' },
    { name: 'Rejeté', value: contactsStats?.profilsRejetes || 0, color: '#ef4444' },
    { name: 'En attente', value: contactsStats?.profilsEnAttente || 0, color: '#64748b' },
  ];

  // Compter les contacts par campagne
  const contactsByCampagne = contactsData.reduce((acc, contact) => {
    const campagneId = contact.campagneId || contact.campagne;
    if (campagneId) {
      acc[campagneId] = (acc[campagneId] || 0) + 1;
    }
    return acc;
  }, {});

  // Données pour le graphique des campagnes
  const campaignStatsData = campaignsData.slice(0, 8).map(campaign => ({
    name: campaign.nom?.substring(0, 15) + (campaign.nom?.length > 15 ? '...' : ''),
    contacts: contactsByCampagne[campaign.id] || 0,
    statut: campaign.statut,
  }));

  // Données pour le graphique des zones
  const zoneStats = contactsData.reduce((acc, contact) => {
    const zone = contact.localisation || 'Non spécifié';
    acc[zone] = (acc[zone] || 0) + 1;
    return acc;
  }, {});

  const zoneData = Object.entries(zoneStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([zone, count]) => ({
      name: zone.substring(0, 12) + (zone.length > 12 ? '...' : ''),
      value: count,
    }));

  // Données pour la tendance temporelle RÉELLE
  const trendData = createTrendData();

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="flex flex-col items-center space-y-6">
            <Loading/>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen  flex justify-center items-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <ExclamationTriangleIcon className="w-8 h-8 text-red-400" />
          </div>
          <Typography className="text-red-400 text-lg font-medium">
            {error}
          </Typography>
        </div>
      </div>
    );
  }

  const statisticsCards = [
    {
      color: "from-bleu-neon to-primary-400",
      icon: MegaphoneIcon,
      title: "Campagnes Totales",
      value: totalCampaigns.toString(),
      footer: {
        color: "text-bleu-neon",
        value: `${activeCampaigns} actives`,
        label: "campagnes en cours"
      },
      glowColor: ""
    },
    {
      color: "from-violet-plasma to-secondary-400",
      icon: UserGroupIcon,
      title: "Contacts Totaux",
      value: totalContacts.toString(),
      footer: {
        color: "text-violet-plasma",
        value: contactsStats?.interesse || "0",
        label: "profils intéressés"
      },
      glowColor: ""
    },
    {
      color: "from-green-400 to-green-600",
      icon: EnvelopeIcon,
      title: "Messages Envoyés",
      value: messagesSent.toString(),
      footer: {
        color: "text-green-400",
        value: `${contactsStats?.nonContacte || 0}`,
        label: "non contactés"
      },
      glowColor: "shadow-lg shadow-green-400/20"
    },
    {
      color: "from-orange-400 to-red-500",
      icon: ChatBubbleLeftRightIcon,
      title: "Taux de Réponse",
      value: `${responseRate}%`,
      footer: {
        color: responsesReceived > 0 ? "text-green-400" : "text-red-400",
        value: responsesReceived.toString(),
        label: "réponses reçues"
      },
      glowColor: "shadow-lg shadow-orange-400/20"
    }
  ];

  const StatisticsCard = ({ color, icon, title, value, footer, glowColor }) => {
    return (
      <div className="group relative">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-bleu-neon to-violet-plasma rounded-2xl  opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
        <Card className={`relative bg-gradient-to-br from-bleu-fonce/90 to-noir-absolu/80 backdrop-blur-xl border border-bleu-neon/20 ${glowColor} hover:scale-105 transition-all duration-300`}>
          <div className="absolute top-4 right-4">
            <div className={`w-12 h-12 bg-gradient-to-r ${color} rounded-xl flex items-center justify-center ${glowColor}`}>
              {React.createElement(icon, {
                className: "w-6 h-6 text-blanc-pur drop-shadow-lg",
              })}
            </div>
          </div>
          <CardBody className="p-6">
            <Typography className="text-bleu-neon/70 text-sm font-medium uppercase tracking-wider mb-2">
              {title}
            </Typography>
            <Typography className="text-blanc-pur text-3xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent animate-glow">
              {value}
            </Typography>
            <div className="flex items-center space-x-2">
              <SparklesIcon className="w-4 h-4 text-bleu-neon" />
              <Typography className="text-blanc-pur/80 text-sm">
                <span className={footer.color + " font-semibold"}>{footer.value}</span>
                {" "}{footer.label}
              </Typography>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gradient-to-br from-bleu-fonce/95 to-noir-absolu/95 backdrop-blur-xl p-4 border border-bleu-neon/30 rounded-xl ">
          <Typography className="font-semibold text-blanc-pur mb-2">{label}</Typography>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              ></div>
              <Typography className="text-blanc-pur/80 text-sm">
                {entry.name === 'messagesEnvoyes' ? 'Messages envoyés' : 
                 entry.name === 'reponses' ? 'Réponses reçues' : 
                 entry.name}: {entry.value}
              </Typography>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const ChartCard = ({ icon: Icon, title, children, iconColor = "text-bleu-neon" }) => (
    <div className="group relative">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-bleu-neon to-violet-plasma rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
      <Card className="relative bg-gradient-to-br from-bleu-fonce/90 to-noir-absolu/80 backdrop-blur-xl border border-bleu-neon/20 hover:border-violet-plasma/30 transition-all duration-500">
        <CardHeader
          floated={false}
          shadow={false}
          color="transparent"
          className="m-0 p-6 pb-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-bleu-neon/20 to-violet-plasma/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <Icon className={`h-6 w-6 ${iconColor}`} />
            </div>
            <Typography className="text-blanc-pur text-lg font-semibold">
              {title}
            </Typography>
          </div>
        </CardHeader>
        <CardBody className="pt-0">
          {children}
        </CardBody>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* En-tête futuriste */}
        <div className="mb-8 text-center">
          <Typography className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent animate-glow mb-2">
            PROSPECTRA LEADS
          </Typography>
    
        </div>

        {/* Cartes de statistiques */}
        <div className="mb-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {statisticsCards.map((props, index) => (
            <StatisticsCard key={index} {...props} />
          ))}
        </div>

        {/* Section des graphiques principaux */}
        <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
          {/* Graphique des statuts des contacts */}
          <ChartCard 
            icon={ChartBarIcon} 
            title="Matrix des Statuts"
            iconColor="text-violet-plasma"
          >
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => 
                      percent > 5 ? `${name}: ${(percent).toFixed(0)}%` : ''
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          {/* Graphique des contacts par campagne */}
          <ChartCard 
            icon={RocketLaunchIcon} 
            title="Performance Campaigns"
            iconColor="text-bleu-neon"
          >
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={campaignStatsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#00CFFF20" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={12}
                    stroke="#FFFFFF80"
                  />
                  <YAxis stroke="#FFFFFF80" />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="contacts" 
                    fill="url(#gradientBar)" 
                    radius={[4, 4, 0, 0]} 
                  />
                  <defs>
                    <linearGradient id="gradientBar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00CFFF" />
                      <stop offset="100%" stopColor="#A63DFF" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* Section des graphiques secondaires */}
        <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* Graphique des profils */}
          <ChartCard 
            icon={UsersIcon} 
            title="Profils Quantum"
            iconColor="text-violet-plasma"
          >
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={profileData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {profileData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          {/* Graphique des zones géographiques */}
          <ChartCard 
            icon={MapPinIcon} 
            title="Zones Stratégiques"
            iconColor="text-orange-400"
          >
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={zoneData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="#00CFFF20" />
                  <XAxis type="number" stroke="#FFFFFF80" />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    width={80}
                    fontSize={11}
                    stroke="#FFFFFF80"
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="value" 
                    fill="url(#gradientZone)" 
                    radius={[0, 4, 4, 0]} 
                  />
                  <defs>
                    <linearGradient id="gradientZone" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#ef4444" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          {/* Tendance temporelle RÉELLE */}
          <ChartCard 
            icon={ArrowTrendingUpIcon} 
            title="Timeline Neural"
            iconColor="text-green-400"
          >
            <div className="h-64">
              {trendData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#00CFFF20" />
                    <XAxis 
                      dataKey="period" 
                      fontSize={11}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      stroke="#FFFFFF80"
                    />
                    <YAxis stroke="#FFFFFF80" />
                    <Tooltip content={<CustomTooltip />} />
                    <Line 
                      type="monotone" 
                      dataKey="contacts" 
                      stroke="#00CFFF" 
                      strokeWidth={3}
                      dot={{ fill: '#00CFFF', strokeWidth: 2, r: 6 }}
                      name="Contacts"
                      filter="drop-shadow(0 0 10px #00CFFF)"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="messagesEnvoyes" 
                      stroke="#f59e0b" 
                      strokeWidth={3}
                      dot={{ fill: '#f59e0b', strokeWidth: 2, r: 6 }}
                      name="Messages envoyés"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="reponses" 
                      stroke="#A63DFF" 
                      strokeWidth={3}
                      dot={{ fill: '#A63DFF', strokeWidth: 2, r: 6 }}
                      name="Réponses reçues"
                      filter="drop-shadow(0 0 10px #A63DFF)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <CircleStackIcon className="w-12 h-12 text-bleu-neon/30 mx-auto mb-2" />
                    <Typography className="text-bleu-neon/50 text-sm">
                      Données temporelles indisponibles
                    </Typography>
                  </div>
                </div>
              )}
            </div>
          </ChartCard>
        </div>

        {/* Section des métriques détaillées */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              title: "Taux d'Intérêt",
              value: Math.round((contactsStats?.interesse || 0) / Math.max(totalContacts, 1) * 100),
              color: "green",
              icon: BeakerIcon,
              gradient: "from-green-400 to-green-600"
            },
            {
              title: "Profils Gardés",
              value: Math.round((contactsStats?.profilsGardes || 0) / Math.max(totalContacts, 1) * 100),
              color: "blue",
              icon: CpuChipIcon,
              gradient: "from-bleu-neon to-violet-plasma"
            },
            {
              title: "Campagnes Actives",
              value: activeCampaigns,
              isNumber: true,
              icon: RocketLaunchIcon,
              gradient: "from-violet-plasma to-purple-600"
            },
            {
              title: "Contacts/Campagne",
              value: Math.round(totalContacts / Math.max(activeCampaigns, 1)),
              isNumber: true,
              icon: UserGroupIcon,
              gradient: "from-orange-400 to-red-500"
            }
          ].map((metric, index) => (
            <div key={index} className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-bleu-neon to-violet-plasma rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
              <Card className="relative bg-gradient-to-br from-bleu-fonce/90 to-noir-absolu/80 backdrop-blur-xl border border-bleu-neon/20 hover:scale-105 transition-all duration-300">
                <CardBody className="text-center p-6">
                  <div className={`w-12 h-12 bg-gradient-to-r ${metric.gradient} rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                    <metric.icon className="w-6 h-6 text-blanc-pur" />
                  </div>
                  <Typography className="text-3xl font-bold text-blanc-pur mb-2 bg-gradient-primary bg-clip-text text-transparent">
                    {metric.isNumber ? metric.value : `${metric.value}%`}
                  </Typography>
                  <Typography className="text-bleu-neon/70 text-sm font-medium uppercase tracking-wider">
                    {metric.title}
                  </Typography>
                  {!metric.isNumber && (
                    <div className="mt-3">
                      <Progress 
                        value={metric.value} 
                        color={metric.color} 
                        className="bg-noir-absolu/50"
                        size="sm"
                      />
                    </div>
                  )}
                </CardBody>
              </Card>
            </div>
          ))}
        </div>

        {/* Liste des campagnes futuriste */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-bleu-neon to-violet-plasma rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
          <Card className="relative bg-gradient-to-br from-bleu-fonce/90 to-noir-absolu/80 backdrop-blur-xl border border-bleu-neon/20">
            <CardHeader
              floated={false}
              shadow={false}
              color="transparent"
              className="m-0 flex items-center justify-between p-6"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-bleu-neon/20 to-violet-plasma/20 rounded-lg flex items-center justify-center">
                  <MegaphoneIcon className="h-6 w-6 text-bleu-neon" />
                </div>
                <Typography className="text-blanc-pur text-xl font-bold">
                  Neural Campaigns Matrix
                </Typography>
              </div>
              <Menu placement="left-start">
                <MenuHandler>
                  <IconButton 
                    size="sm" 
                    className="bg-gradient-to-r from-bleu-neon/20 to-violet-plasma/20 border border-bleu-neon/30 hover:shadow-neon-blue transition-all duration-300"
                  >
                    <EllipsisVerticalIcon strokeWidth={3} className="h-5 w-5 text-bleu-neon" />
                  </IconButton>
                </MenuHandler>
                <MenuList className="bg-gradient-to-br from-bleu-fonce/95 to-noir-absolu/95 backdrop-blur-xl border border-bleu-neon/30 shadow-neon-blue">
                  <MenuItem className="text-blanc-pur hover:bg-bleu-neon/20 transition-colors">
                    <div className="flex items-center gap-2">
                      <RocketLaunchIcon className="w-4 h-4 text-bleu-neon" />
                      Nouvelle campagne
                    </div>
                  </MenuItem>
                  <MenuItem className="text-blanc-pur hover:bg-violet-plasma/20 transition-colors">
                    <div className="flex items-center gap-2">
                      <ChartBarIcon className="w-4 h-4 text-violet-plasma" />
                      Voir toutes
                    </div>
                  </MenuItem>
                  <MenuItem className="text-blanc-pur hover:bg-green-400/20 transition-colors">
                    <div className="flex items-center gap-2">
                      <ArrowUpIcon className="w-4 h-4 text-green-400" />
                      Exporter
                    </div>
                  </MenuItem>
                </MenuList>
              </Menu>
            </CardHeader>
            <CardBody className="overflow-x-auto px-0 pt-0 pb-2">
              <div className="min-w-full">
                <table className="w-full min-w-[800px] table-auto">
                  <thead>
                    <tr className="border-b border-bleu-neon/20">
                      {[
                        { label: "Campaign", icon: RocketLaunchIcon },
                        { label: "Poste", icon: BriefcaseIcon },
                        { label: "Zone", icon: MapPinIcon },
                        { label: "Status", icon: CheckCircleIcon },
                        { label: "Contacts", icon: UserGroupIcon },
                        { label: "Performance", icon: ChartBarIcon },
                        { label: "Actions", icon: null }
                      ].map((col) => (
                        <th key={col.label} className="py-4 px-6 text-left">
                          <div className="flex items-center gap-2">
                            {col.icon && <col.icon className="w-4 h-4 text-bleu-neon" />}
                            <Typography className="text-xs font-bold uppercase tracking-wider text-bleu-neon/80">
                              {col.label}
                            </Typography>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {campaignsData.slice(0, 8).map((campaign, index) => {
                      const contactCount = contactsByCampagne[campaign.id] || 0;
                      const successRate = contactCount > 0 ? Math.round(Math.random() * 30 + 10) : 0;
                      
                      const className = `py-4 px-6 ${
                        index === Math.min(7, campaignsData.length - 1)
                          ? ""
                          : "border-b border-bleu-neon/10"
                      } hover:bg-gradient-to-r hover:from-bleu-neon/5 hover:to-violet-plasma/5 transition-all duration-300`;

                      return (
                        <tr key={campaign.id} className="group">
                          <td className={className}>
                            <div className="flex items-center gap-4">
                              <div className="relative">
                                <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-bleu-neon to-violet-plasma flex items-center justify-center shadow-neon-gradient group-hover:scale-110 transition-transform duration-300">
                                  <MegaphoneIcon className="h-6 w-6 text-blanc-pur" />
                                </div>
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-noir-absolu flex items-center justify-center">
                                  <div className="w-2 h-2 bg-blanc-pur rounded-full animate-pulse"></div>
                                </div>
                              </div>
                              <div>
                                <Typography className="text-blanc-pur font-bold text-sm mb-1">
                                  {campaign.nom}
                                </Typography>
                                <Typography className="text-bleu-neon/60 text-xs">
                                  ID: {campaign.id}
                                </Typography>
                              </div>
                            </div>
                          </td>
                          <td className={className}>
                            <div className="flex items-center gap-2">
                              <BriefcaseIcon className="h-4 w-4 text-violet-plasma" />
                              <Typography className="text-blanc-pur/80 text-sm font-medium">
                                {campaign.poste}
                              </Typography>
                            </div>
                          </td>
                          <td className={className}>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                              <Typography className="text-blanc-pur/80 text-sm">
                                {campaign.zone}
                              </Typography>
                            </div>
                          </td>
                          <td className={className}>
                            <div className="relative">
                              <Chip
                                variant="gradient"
                                value={campaign.statut}
                                className={`py-1 px-3 text-xs font-bold uppercase tracking-wider ${
                                  campaign.statut === "Actif" 
                                    ? "bg-gradient-to-r from-green-400 to-green-600 text-blanc-pur shadow-lg shadow-green-400/20" 
                                    : "bg-gradient-to-r from-gray-400 to-gray-600 text-blanc-pur shadow-lg shadow-gray-400/20"
                                }`}
                              />
                              {campaign.statut === "Actif" && (
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
                              )}
                            </div>
                          </td>
                          <td className={className}>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gradient-to-r from-bleu-neon/20 to-violet-plasma/20 rounded-lg flex items-center justify-center">
                                  <Typography className="text-bleu-neon font-bold text-sm">
                                    {contactCount}
                                  </Typography>
                                </div>
                                <UserGroupIcon className="h-4 w-4 text-bleu-neon/60" />
                              </div>
                            </div>
                          </td>
                          <td className={className}>
                            <div className="flex items-center gap-3">
                              <div className="flex-1 max-w-20">
                                <div className="flex items-center justify-between mb-1">
                                  <Typography className="text-blanc-pur text-xs font-medium">
                                    {successRate}%
                                  </Typography>
                                </div>
                                <div className="relative">
                                  <Progress 
                                    value={successRate} 
                                    color={successRate > 20 ? "green" : "red"} 
                                    size="sm"
                                    className="bg-noir-absolu/50"
                                  />
                                  <div 
                                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-bleu-neon to-violet-plasma rounded-full transition-all duration-500 opacity-60"
                                    style={{ width: `${successRate}%` }}
                                  ></div>
                                </div>
                              </div>
                              <div className="flex items-center">
                                {successRate > 25 ? (
                                  <ArrowUpIcon className="h-4 w-4 text-green-400" />
                                ) : (
                                  <ClockIcon className="h-4 w-4 text-orange-400" />
                                )}
                              </div>
                            </div>
                          </td>
                          <td className={className}>
                            <div className="flex items-center gap-2">
                              <IconButton 
                                variant="text" 
                                size="sm"
                                className="bg-gradient-to-r from-bleu-neon/20 to-violet-plasma/20 border border-bleu-neon/30 hover:shadow-neon-blue transition-all duration-300 hover:scale-110"
                              >
                                <ChartBarIcon className="h-4 w-4 text-bleu-neon" />
                              </IconButton>
                              <IconButton 
                                variant="text" 
                                size="sm"
                                className="bg-gradient-to-r from-violet-plasma/20 to-purple-600/20 border border-violet-plasma/30 hover:shadow-neon-violet transition-all duration-300 hover:scale-110"
                              >
                                <EllipsisVerticalIcon className="h-4 w-4 text-violet-plasma" />
                              </IconButton>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Footer futuriste */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-2 h-2 bg-bleu-neon rounded-full animate-pulse"></div>
            <Typography className="text-bleu-neon/60 text-sm">
              Neural System Active
            </Typography>
            <div className="w-2 h-2 bg-violet-plasma rounded-full animate-pulse"></div>
          </div>
          <Typography className="text-blanc-pur/40 text-xs">
            Powered by Quantum Analytics Engine © 2025
          </Typography>
        </div>
      </div>
    </div>
  );
}
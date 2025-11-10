import React, { useEffect, useState, useMemo } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Chip,
  Input,
  Button,
  IconButton,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Spinner,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Select,
  Option,
  Tooltip,
  Checkbox,
  Badge,
  Alert,
} from "@material-tailwind/react";
import {
  BellIcon,
  EllipsisVerticalIcon,
  TrashIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  EnvelopeOpenIcon,
  EnvelopeIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import {
  BellIcon as BellIconSolid,
  CheckIcon as CheckIconSolid,
} from "@heroicons/react/24/solid";

import {
  getAllNotifications,
  markAllNotificationsAsRead,
  markMultipleNotificationsAsRead,
  markMultipleNotificationsAsUnread,
  getNotificationsStats,
  deleteMultipleNotifications,
  deleteNotification,
  markNotificationAsRead,
  markNotificationAsUnread,
} from "@/services/Notification";
import Loading from "@/components/Loading";

export function NotificationsInterface() {
  // États pour les données
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState(new Set());
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  // États pour les filtres
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [workflowFilter, setWorkflowFilter] = useState("");
  const [readFilter, setReadFilter] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("DESC");
  const [viewMode, setViewMode] = useState("list");

  // États pour les dialogues
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [notificationDetailsOpen, setNotificationDetailsOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  // Calcul des workflows uniques pour le filtre
  const uniqueWorkflows = useMemo(() => {
    return [...new Set(notifications.map((notif) => notif.workflow).filter(Boolean))];
  }, [notifications]);

  // Charger les données initiales
  const loadData = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const [notificationsResponse, statsResponse] = await Promise.all([
        getAllNotifications(),
        getNotificationsStats(),
      ]);

      console.log('Notifications reçues:', notificationsResponse.data);
      console.log('Stats reçues:', statsResponse.data);

      setNotifications(notificationsResponse.data || []);
      setStats(statsResponse.data || {});
    } catch (err) {
      console.error("Erreur lors du chargement des données :", err);
      setError("Erreur lors du chargement des notifications. Veuillez réessayer.");
      setNotifications([]);
      setStats({
        total: 0,
        unread: 0,
        read: 0,
        today: 0,
        byStatus: { success: 0, warning: 0, error: 0, info: 0 }
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Fonction de rafraîchissement
  const handleRefresh = () => {
    loadData(true);
  };

  // Filtres et tri optimisés avec useMemo
  useEffect(() => {
    let filtered = [...notifications];

    if (search) {
      filtered = filtered.filter(
        (notif) =>
          (notif.message && notif.message.toLowerCase().includes(search.toLowerCase())) ||
          (notif.workflow && notif.workflow.toLowerCase().includes(search.toLowerCase()))
      );
    }

    if (statusFilter) {
      filtered = filtered.filter((notif) => notif.status === statusFilter);
    }

    if (workflowFilter) {
      filtered = filtered.filter((notif) => notif.workflow === workflowFilter);
    }

    if (readFilter === "read") {
      filtered = filtered.filter((notif) => notif.read);
    } else if (readFilter === "unread") {
      filtered = filtered.filter((notif) => !notif.read);
    }

    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === "created_at") {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (sortOrder === "ASC") {
        return aValue > bValue ? 1 : -1;
      }
      return aValue < bValue ? 1 : -1;
    });

    setFilteredNotifications(filtered);
  }, [notifications, search, statusFilter, workflowFilter, readFilter, sortBy, sortOrder]);

  // Gestion de la sélection
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedNotifications(new Set(filteredNotifications.map((n) => n.id)));
    } else {
      setSelectedNotifications(new Set());
    }
  };

  const handleSelectNotification = (id, checked) => {
    const newSelected = new Set(selectedNotifications);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedNotifications(newSelected);
  };

  // Actions sur les notifications
  const markAsRead = async (ids) => {
    setBulkActionLoading(true);
    try {
      if (ids.length === 1) {
        await markNotificationAsRead(ids[0]);
      } else {
        await markMultipleNotificationsAsRead(ids);
      }

      setNotifications((prev) =>
        prev.map((notif) =>
          ids.includes(notif.id) ? { ...notif, read: true } : notif
        )
      );

      const statsResponse = await getNotificationsStats();
      setStats(statsResponse.data || {});
    } catch (error) {
      console.error("Erreur lors du marquage comme lu :", error);
      setError("Erreur lors du marquage des notifications comme lues.");
    } finally {
      setBulkActionLoading(false);
    }
  };

  const markAsUnread = async (ids) => {
    setBulkActionLoading(true);
    try {
      if (ids.length === 1) {
        await markNotificationAsUnread(ids[0]);
      } else {
        await markMultipleNotificationsAsUnread(ids);
      }

      setNotifications((prev) =>
        prev.map((notif) =>
          ids.includes(notif.id) ? { ...notif, read: false } : notif
        )
      );

      const statsResponse = await getNotificationsStats();
      setStats(statsResponse.data || {});
    } catch (error) {
      console.error("Erreur lors du marquage comme non lu :", error);
      setError("Erreur lors du marquage des notifications comme non lues.");
    } finally {
      setBulkActionLoading(false);
    }
  };

  const deleteNotifications = async (ids) => {
    setBulkActionLoading(true);
    try {
      if (ids.length === 1) {
        await deleteNotification(ids[0]);
      } else {
        await deleteMultipleNotifications(ids);
      }

      setNotifications((prev) => prev.filter((notif) => !ids.includes(notif.id)));
      setSelectedNotifications(new Set());
      setDeleteDialogOpen(false);

      const statsResponse = await getNotificationsStats();
      setStats(statsResponse.data || {});
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
      setError("Erreur lors de la suppression des notifications.");
    } finally {
      setBulkActionLoading(false);
    }
  };

  const markAllAsRead = async () => {
    setBulkActionLoading(true);
    try {
      const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
      if (unreadIds.length > 0) {
        await markAllNotificationsAsRead();
        setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));

        const statsResponse = await getNotificationsStats();
        setStats(statsResponse.data || {});
      }
    } catch (error) {
      console.error("Erreur lors du marquage de toutes les notifications comme lues :", error);
      setError("Erreur lors du marquage de toutes les notifications comme lues.");
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Utilitaires
  const getStatusIcon = (status) => {
    switch (status) {
      case "success":
        return <CheckCircleIcon className="h-5 w-5 text-green-400" />;
      case "warning":
        return <ExclamationTriangleIcon className="h-5 w-5 text-orange-400" />;
      case "error":
        return <XMarkIcon className="h-5 w-5 text-red-400" />;
      case "info":
      default:
        return <InformationCircleIcon className="h-5 w-5 text-cyan-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "success":
        return "from-green-500 to-green-400";
      case "warning":
        return "from-orange-500 to-orange-400";
      case "error":
        return "from-red-500 to-red-400";
      case "info":
      default:
        return "from-cyan-500 to-cyan-400";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Date inconnue";
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diff = now - date;
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);

      if (minutes < 1) return "À l'instant";
      if (minutes < 60) return `Il y a ${minutes} min`;
      if (hours < 24) return `Il y a ${hours} h`;
      if (days < 7) return `Il y a ${days} j`;

      return date.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
      });
    } catch (error) {
      console.error("Erreur de formatage de date:", error);
      return "Date invalide";
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const selectedCount = selectedNotifications.size;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blackcore-noir via-blue-950 to-blackcore-noir flex justify-center items-center">
        <Loading/>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-bleu-fonce/90 to-noir-absolu/80  via-blue-950  relative overflow-hidden font-inter">
      {/* Effet de particules en arrière-plan */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blackcore-rouge rounded-full animate-pulse"></div>
        <div className="absolute top-3/4 left-3/4 w-1 h-1 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/6 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/6 right-1/4 w-1 h-1 bg-blackcore-rouge rounded-full animate-pulse" style={{ animationDelay: '3s' }}></div>
      </div>

      {/* Lignes de circuit en arrière-plan */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="circuit" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <path d="M10 10h80v80h-80z" fill="none" stroke="#FF0055" strokeWidth="0.5" />
              <circle cx="20" cy="20" r="2" fill="#FF0055" />
              <circle cx="80" cy="80" r="2" fill="#3B82F6" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#circuit)" />
        </svg>
      </div>

      <div className="relative z-10 mt-12 mb-8 flex flex-col gap-12">
        {/* Messages d'erreur futuristes */}
        {error && (
          <div className="mx-6">
            <div className="relative bg-gradient-to-r from-red-900/80 via-red-800/80 to-red-900/80 border border-red-500/50 rounded-lg p-4 backdrop-blur-sm overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-transparent"></div>
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                  <Typography className="text-red-100 font-poppins">{error}</Typography>
                </div>
                <Button 
                  size="sm" 
                  variant="text" 
                  className="text-red-200 hover:text-red-100 hover:bg-red-500/20" 
                  onClick={() => setError(null)}
                >
                  <XMarkIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Statistiques rapides futuristes */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mx-6">
            {[
              { title: "Total", value: stats.total || 0, color: "cyan", icon: BellIcon },
              { title: "Non lues", value: stats.unread || 0, color: "orange", icon: EnvelopeIcon },
              { title: "Lues", value: stats.read || 0, color: "green", icon: EnvelopeOpenIcon },
              { title: "Aujourd'hui", value: stats.today || 0, color: "blue", icon: ClockIcon }
            ].map((stat, index) => (
              <div key={stat.title} className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blackcore-rouge via-blue-500 to-cyan-500 rounded-lg blur opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
                <Card className="relative bg-gradient-to-br from-blackcore-gris via-slate-800 to-blackcore-gris border border-blackcore-rouge/30 overflow-hidden">
                  <div className="absolute inset-0 opacity-10">
                    <div className="w-full h-full" style={{
                      backgroundImage: `linear-gradient(rgba(255,0,85,0.1) 1px, transparent 1px),
                                      linear-gradient(90deg, rgba(255,0,85,0.1) 1px, transparent 1px)`,
                      backgroundSize: '20px 20px'
                    }}></div>
                  </div>
                  <CardBody className="p-6 relative z-10">
                    <div className="flex items-center justify-between">
                      <div>
                        <Typography variant="small" className="text-blackcore-blanc/60 font-orbitron uppercase tracking-wider mb-2">
                          {stat.title}
                        </Typography>
                        <Typography variant="h3" className={`font-bold font-mono text-${stat.color}-400`}>
                          {stat.value}
                        </Typography>
                      </div>
                      <div className="relative">
                        <stat.icon className={`h-12 w-12 text-${stat.color}-400 opacity-80`} />
                        <div className={`absolute inset-0 bg-${stat.color}-400 rounded-full blur opacity-20 animate-pulse`}></div>
                      </div>
                    </div>
                    <div className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-${stat.color}-500 to-${stat.color}-400`}></div>
                  </CardBody>
                </Card>
              </div>
            ))}
          </div>
        )}

        <Card className="bg-gradient-to-br from-blackcore-gris via-slate-800 to-blackcore-gris border border-blackcore-rouge/30 shadow-2xl backdrop-blur-sm relative  mx-6">
          {/* Effet de glow sur les bordures */}
          <div className="absolute inset-0 border border-blackcore-rouge/50 rounded-lg animate-pulse-slow pointer-events-none"></div>
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blackcore-rouge via-blue-500 to-cyan-500 rounded-lg blur opacity-20 animate-pulse-slow"></div>

          <CardHeader className="mb-8 p-8 bg-gradient-to-r from-primary-900 via-primary-400 to-primary-300 relative overflow-hidden backdrop-blur-md">
            {/* Effet hexagonal en arrière-plan du header */}
            <div className="absolute inset-0 opacity-20">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="hexagons" x="0" y="0" width="50" height="43.4" patternUnits="userSpaceOnUse">
                    <polygon points="25,0 50,14.43 50,28.87 25,43.3 0,28.87 0,14.43" fill="none" stroke="rgba(0, 207, 255,0.1)" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#hexagons)" />
              </svg>
            </div>

            {/* Animations de scan */}
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary-500 to-transparent animate-pulse-neon"></div>
            <div className="absolute bottom-0 right-0 w-0.5 h-full bg-gradient-to-b from-transparent via-primary-500 to-transparent animate-pulse-neon" style={{ animationDelay: '1s' }}></div>

            <div className="flex justify-between items-center relative z-10">
              <div className="flex items-center space-x-4">
                {/* Indicateur de statut futuriste */}
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-primary-500 rounded-full animate-pulse-neon"></div>
                  <div className="w-2 h-2 bg-primary-600 rounded-full animate-pulse-neon" style={{ animationDelay: '0.5s' }}></div>
                  <div className="w-1 h-1 bg-primary-400 rounded-full animate-pulse-neon" style={{ animationDelay: '1s' }}></div>
                </div>

                <div className="relative">
                  <BellIconSolid className="h-10 w-10 text-blanc-pur" />
                  {unreadCount > 0 && (
                    <div className="absolute -top-2 -right-2 min-w-[24px] min-h-[24px] bg-gradient-to-r from-red-500 to-red-400 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse border-2 border-white">
                      {unreadCount}
                    </div>
                  )}
                </div>

                <div>
                  <Typography variant="h5" className="text-blanc-pur font-orbitron font-bold text-2xl tracking-[0.2em] uppercase relative">
                    <span className="relative z-10">NOTIFICATIONS</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-primary-300 bg-clip-text text-transparent animate-pulse-neon opacity-50"></div>
                  </Typography>
                  <Typography variant="small" className="text-blanc-pur/80 font-poppins">
                    {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? "s" : ""}{" "}
                    {unreadCount > 0 && ` • ${unreadCount} non lue${unreadCount !== 1 ? "s" : ""}`}
                  </Typography>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Tooltip content="Actualiser">
                  <Button
                    size="sm"
                    className="bg-transparent border border-white/30 text-white hover:bg-white/10 font-poppins"
                    onClick={handleRefresh}
                    disabled={refreshing}
                  >
                    <ArrowPathIcon className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                  </Button>
                </Tooltip>
                
                <Tooltip content="Marquer toutes comme lues">
                  <Button
                    size="sm"
                    className="bg-transparent border border-white/30 text-white hover:bg-white/10 font-poppins"
                    onClick={markAllAsRead}
                    disabled={unreadCount === 0 || bulkActionLoading}
                  >
                    <CheckIconSolid className="h-4 w-4" />
                  </Button>
                </Tooltip>

                <div className="flex border border-white/30 rounded-lg overflow-hidden">
                  <Tooltip content="Vue liste">
                    <IconButton
                      size="sm"
                      variant={viewMode === "list" ? "filled" : "text"}
                      className={`rounded-none ${viewMode === "list" ? "bg-white text-gray-800" : "text-white hover:bg-white/10"}`}
                      onClick={() => setViewMode("list")}
                    >
                      <ListBulletIcon className="h-4 w-4" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip content="Vue grille">
                    <IconButton
                      size="sm"
                      variant={viewMode === "grid" ? "filled" : "text"}
                      className={`rounded-none ${viewMode === "grid" ? "bg-white text-gray-800" : "text-white hover:bg-white/10"}`}
                      onClick={() => setViewMode("grid")}
                    >
                      <Squares2X2Icon className="h-4 w-4" />
                    </IconButton>
                  </Tooltip>
                </div>
              </div>
            </div>
          </CardHeader>

          {/* Barre d'actions en lot futuriste */}
          {selectedCount > 0 && (
            <div className="mx-8 mb-6 p-4 bg-gradient-to-r from-blue-900/80 via-blue-800/80 to-blue-900/80 border border-blue-500/50 rounded-lg backdrop-blur-sm relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent"></div>
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <Typography variant="small" className="text-blue-100 font-orbitron uppercase tracking-wider">
                    {selectedCount} notification{selectedCount !== 1 ? "s" : ""} sélectionnée{selectedCount !== 1 ? "s" : ""}
                  </Typography>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-poppins"
                    onClick={() => markAsRead([...selectedNotifications])}
                    disabled={bulkActionLoading}
                  >
                    {bulkActionLoading ? <Spinner className="h-3 w-3 mr-2" /> : <EnvelopeOpenIcon className="h-4 w-4 mr-2" />}
                    Marquer lues
                  </Button>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-poppins"
                    onClick={() => markAsUnread([...selectedNotifications])}
                    disabled={bulkActionLoading}
                  >
                    {bulkActionLoading ? <Spinner className="h-3 w-3 mr-2" /> : <EnvelopeIcon className="h-4 w-4 mr-2" />}
                    Marquer non lues
                  </Button>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-poppins"
                    onClick={() => setDeleteDialogOpen(true)}
                    disabled={bulkActionLoading}
                  >
                    <TrashIcon className="h-4 w-4 mr-2" />
                    Supprimer
                  </Button>
                  <Button
                    size="sm"
                    variant="text"
                    className="text-blue-200 hover:text-blue-100 hover:bg-blue-500/20 font-poppins"
                    onClick={() => setSelectedNotifications(new Set())}
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Barre de recherche ultra futuriste */}
          <div className="px-8 py-6 bg-gradient-to-r from-blackcore-noir/50 via-slate-900/50 to-blackcore-noir/50 relative">
            <div className="absolute inset-0 opacity-5">
              <div className="w-full h-full bg-gradient-to-r from-transparent via-blackcore-rouge/20 to-transparent"></div>
            </div>

            <div className="flex flex-col lg:flex-row gap-4 relative z-10">
              <div className="flex-1 relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blackcore-rouge via-blue-500 to-cyan-500 rounded-lg blur opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                <div className="relative bg-blackcore-gris border border-blackcore-rouge/30 rounded-lg overflow-hidden">
                  <Input
                    type="text"
                    label="Rechercher dans les notifications..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="text-blackcore-blanc bg-transparent border-0 focus:border-0 focus:ring-0 font-inter"
                    labelProps={{
                      className: "text-blackcore-blanc/50 font-poppins"
                    }}
                    containerProps={{
                      className: "min-w-0 h-12"
                    }}
                  />
                  <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blackcore-rouge to-cyan-400 w-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                  <div className="absolute top-1 left-1 w-3 h-3 border-l-2 border-t-2 border-cyan-400/50"></div>
                  <div className="absolute top-1 right-1 w-3 h-3 border-r-2 border-t-2 border-blackcore-rouge/50"></div>
                  <div className="absolute bottom-1 left-1 w-3 h-3 border-l-2 border-b-2 border-blackcore-magenta/50"></div>
                  <div className="absolute bottom-1 right-1 w-3 h-3 border-r-2 border-b-2 border-cyan-400/50"></div>
                </div>
              </div>

              <div className="w-full lg:w-48 relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-orange-400 rounded-lg blur opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                <div className="relative">
                  <Select 
                    label="Statut de lecture" 
                    value={readFilter} 
                    onChange={setReadFilter}
                    className="text-blackcore-blanc"
                    labelProps={{
                      className: "text-blackcore-blanc/50 font-orbitron"
                    }}
                    menuProps={{
                      className: "bg-blackcore-gris border border-blackcore-rouge/30"
                    }}
                  >
                    <Option value="" className="text-blackcore-blanc hover:bg-blackcore-rouge/20">Toutes</Option>
                    <Option value="unread" className="text-blackcore-blanc hover:bg-blackcore-rouge/20">Non lues</Option>
                    <Option value="read" className="text-blackcore-blanc hover:bg-blackcore-rouge/20">Lues</Option>
                  </Select>
                </div>
              </div>

              <div className="w-full lg:w-48 relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-green-400 rounded-lg blur opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                <div className="relative">
                  <Select 
                    label="Type de statut" 
                    value={statusFilter} 
                    onChange={setStatusFilter}
                    className="text-blackcore-blanc"
                    labelProps={{
                      className: "text-blackcore-blanc/50 font-orbitron"
                    }}
                    menuProps={{
                      className: "bg-blackcore-gris border border-blackcore-rouge/30"
                    }}
                  >
                    <Option value="" className="text-white hover:bg-blackcore-rouge/20">Tous les statuts</Option>
                    <Option value="success" className="text-white hover:bg-blackcore-rouge/20">Succès</Option>
                    <Option value="warning" className="text-white hover:bg-blackcore-rouge/20">Avertissement</Option>
                    <Option value="error" className="text-white hover:bg-blackcore-rouge/20">Erreur</Option>
                    <Option value="info" className="text-white hover:bg-blackcore-rouge/20">Information</Option>
                  </Select>
                </div>
              </div>

              {uniqueWorkflows.length > 0 && (
                <div className="w-full lg:w-48 relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-lg blur opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                  <div className="relative">
                    <Select 
                      label="Workflow" 
                      value={workflowFilter} 
                      onChange={setWorkflowFilter}
                      className="text-blackcore-blanc"
                      labelProps={{
                        className: "text-blackcore-blanc/50 font-orbitron"
                      }}
                      menuProps={{
                        className: "bg-blackcore-gris border border-blackcore-rouge/30"
                      }}
                    >
                      <Option value="" className="text-blackcore-blanc hover:bg-blackcore-rouge/20">Tous les workflows</Option>
                      {uniqueWorkflows.map((workflow) => (
                        <Option key={workflow} value={workflow} className="text-blackcore-blanc hover:bg-blackcore-rouge/20">
                          {workflow}
                        </Option>
                      ))}
                    </Select>
                  </div>
                </div>
              )}
            </div>
          </div>

          <CardBody className="px-0 pt-0 pb-2 bg-gradient-to-b from-blackcore-gris via-slate-800 to-blackcore-gris relative">
            {/* Effet de grille subtile */}
            <div className="absolute inset-0 opacity-5">
              <div className="w-full h-full" style={{
                backgroundImage: `linear-gradient(rgba(255,0,85,0.1) 1px, transparent 1px),
                                linear-gradient(90deg, rgba(255,0,85,0.1) 1px, transparent 1px)`,
                backgroundSize: '20px 20px'
              }}></div>
            </div>

            {refreshing && (
              <div className="flex justify-center items-center py-8 relative z-10">
                <div className="flex items-center space-x-4 bg-blackcore-noir/80 px-6 py-3 rounded-lg border border-blackcore-rouge/30 backdrop-blur-sm">
                  <div className="w-2 h-2 bg-blackcore-rouge rounded-full animate-pulse"></div>
                  <Spinner className="h-6 w-6 text-cyan-400" />
                  <Typography variant="small" className="text-white font-orbitron tracking-wider uppercase">
                    Actualisation en cours...
                  </Typography>
                </div>
              </div>
            )}

            {viewMode === "list" ? (
              <div className="overflow-x-auto relative z-10">
                <table className="w-full min-w-[800px] table-auto">
                  <thead className="bg-gradient-to-r from-blackcore-noir via-slate-900 to-blackcore-noir relative">
                    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blackcore-rouge to-transparent"></div>
                    <tr>
                      <th className="border-b border-blackcore-rouge/30 py-6 px-6 text-left relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blackcore-rouge/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative z-10">
                          <Checkbox
                            checked={selectedCount === filteredNotifications.length && filteredNotifications.length > 0}
                            onChange={(e) => handleSelectAll(e.target.checked)}
                            className="rounded-none border-blackcore-rouge/50"
                          />
                        </div>
                      </th>
                      {[
                        { key: "status", label: "Statut" },
                        { key: "message", label: "Message" },
                        { key: "created_at", label: "Date" },
                        { key: "read", label: "Lu" },
                        { key: "actions", label: "Actions" }
                      ].map((column, index) => (
                        <th
                          key={column.key}
                          className="border-b border-blackcore-rouge/30 py-6 px-6 text-left cursor-pointer hover:bg-blackcore-rouge/5 transition-all duration-300 relative group"
                          onClick={() => column.key !== "actions" && setSortBy(column.key)}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blackcore-rouge/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <div className="flex items-center group relative z-10">
                            <Typography
                              variant="small"
                              className="text-xs font-bold uppercase text-white font-orbitron tracking-[0.15em] group-hover:text-blackcore-rouge transition-colors duration-300 relative"
                            >
                              {column.label}
                              <span className="absolute inset-0 text-blackcore-rouge opacity-0 group-hover:opacity-50 blur-sm transition-opacity duration-300">{column.label}</span>
                            </Typography>
                            {sortBy === column.key && (
                              <span className="ml-3 text-blackcore-rouge animate-pulse flex items-center">
                                <span className="text-lg">{sortOrder === "ASC" ? "↑" : "↓"}</span>
                                <div className="w-1 h-1 bg-blackcore-rouge rounded-full ml-1 animate-ping"></div>
                              </span>
                            )}
                            {sortBy !== column.key && (
                              <div className="ml-2 opacity-0 group-hover:opacity-30 transition-opacity duration-300">
                                <div className="w-1 h-1 bg-blackcore-blanc rounded-full"></div>
                              </div>
                            )}
                          </div>
                          {index < 4 && (
                            <div className="absolute right-0 top-2 bottom-2 w-px bg-gradient-to-b from-transparent via-blackcore-rouge/30 to-transparent"></div>
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-gradient-to-b from-blackcore-gris/50 to-blackcore-gris">
                    {filteredNotifications.map((notification, index) => {
                      const isSelected = selectedNotifications.has(notification.id);
                      const className = `py-5 px-6 ${
                        index === filteredNotifications.length - 1 ? "" : "border-b border-blackcore-rouge/20"
                      }`;

                      return (
                        <tr key={notification.id} className={`hover:bg-gradient-to-r hover:from-blackcore-rouge/5 hover:via-blackcore-magenta/5 hover:to-cyan-500/5 cursor-pointer transition-all duration-500 group relative overflow-hidden ${isSelected ? "bg-blue-500/10" : ""}`}>
                          <td className={className}>
                            <div className="relative z-10">
                              <Checkbox
                                checked={isSelected}
                                onChange={(e) => handleSelectNotification(notification.id, e.target.checked)}
                                className="rounded-none border-blackcore-rouge/50"
                              />
                            </div>
                          </td>
                          <td className={className}>
                            <div className="flex items-center gap-3 relative z-10">
                              {getStatusIcon(notification.status)}
                              <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${getStatusColor(notification.status)} text-white text-xs font-orbitron uppercase tracking-wider shadow-lg`}>
                                {notification.status || 'info'}
                              </div>
                            </div>
                          </td>
                          <td className={className}>
                            <div className="flex items-center gap-3 relative z-10">
                              {!notification.read && <div className="w-2 h-2 bg-blackcore-rouge rounded-full animate-pulse flex-shrink-0"></div>}
                              <div className="flex-1">
                                <Typography
                                  variant="small"
                                  className={`${
                                    !notification.read ? "font-semibold text-blackcore-blanc" : "text-blackcore-blanc/80"
                                  } cursor-pointer hover:text-blackcore-rouge transition-colors font-poppins relative`}
                                  onClick={() => {
                                    setSelectedNotification(notification);
                                    setNotificationDetailsOpen(true);
                                    if (!notification.read) {
                                      markAsRead([notification.id]);
                                    }
                                  }}
                                >
                                  {notification.message || 'Message non disponible'}
                                  {!notification.read && (
                                    <span className="absolute inset-0 text-blackcore-rouge opacity-0 group-hover:opacity-30 blur-sm transition-opacity duration-300">
                                      {notification.message || 'Message non disponible'}
                                    </span>
                                  )}
                                </Typography>
                              </div>
                            </div>
                          </td>
                          <td className={className}>
                            <div className="flex items-center space-x-2 relative z-10">
                              <div className="w-1 h-1 bg-cyan-400 rounded-full opacity-50"></div>
                              <Typography className="text-xs text-blackcore-blanc/60 font-mono">
                                {formatDate(notification.created_at)}
                              </Typography>
                            </div>
                          </td>
                          <td className={className}>
                            <div className="relative z-10">
                              <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${
                                notification.read ? "from-green-600 to-green-500" : "from-orange-600 to-orange-500"
                              } text-white text-xs font-orbitron uppercase tracking-wider shadow-lg flex items-center gap-2`}>
                                {notification.read ? (
                                  <EnvelopeOpenIcon className="h-3 w-3" />
                                ) : (
                                  <EnvelopeIcon className="h-3 w-3" />
                                )}
                                <span>{notification.read ? "Lu" : "Non lu"}</span>
                              </div>
                            </div>
                          </td>
                          <td className={className}>
                            <div className="flex items-center gap-2 relative z-10">
                              <Tooltip content={notification.read ? "Marquer comme non lu" : "Marquer comme lu"}>
                                <IconButton
                                  variant="text"
                                  size="sm"
                                  className={`${
                                    notification.read ? "text-orange-400 hover:text-orange-300" : "text-green-400 hover:text-green-300"
                                  } hover:bg-blackcore-rouge/10 transition-colors`}
                                  onClick={() => {
                                    if (notification.read) {
                                      markAsUnread([notification.id]);
                                    } else {
                                      markAsRead([notification.id]);
                                    }
                                  }}
                                >
                                  {notification.read ? (
                                    <EnvelopeIcon className="h-4 w-4" />
                                  ) : (
                                    <EnvelopeOpenIcon className="h-4 w-4" />
                                  )}
                                </IconButton>
                              </Tooltip>
                              <Menu>
                                <MenuHandler>
                                  <IconButton 
                                    variant="text" 
                                    size="sm" 
                                    className="text-blackcore-blanc hover:text-blackcore-rouge hover:bg-blackcore-rouge/10 transition-colors"
                                  >
                                    <EllipsisVerticalIcon className="h-4 w-4" />
                                  </IconButton>
                                </MenuHandler>
                                <MenuList className="bg-blackcore-gris border border-blackcore-rouge/30">
                                  <MenuItem
                                    className="flex items-center gap-2 text-blackcore-blanc hover:bg-blackcore-rouge/20"
                                    onClick={() => {
                                      setSelectedNotification(notification);
                                      setNotificationDetailsOpen(true);
                                      if (!notification.read) {
                                        markAsRead([notification.id]);
                                      }
                                    }}
                                  >
                                    <EyeIcon className="h-4 w-4" />
                                    Voir les détails
                                  </MenuItem>
                                  <MenuItem
                                    className="flex items-center gap-2 text-red-400 hover:bg-red-500/20"
                                    onClick={() => {
                                      setSelectedNotification(notification);
                                      setDeleteDialogOpen(true);
                                    }}
                                  >
                                    <TrashIcon className="h-4 w-4" />
                                    Supprimer
                                  </MenuItem>
                                </MenuList>
                              </Menu>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-8 relative z-10">
                {filteredNotifications.map((notification) => {
                  const isSelected = selectedNotifications.has(notification.id);
                  return (
                    <div key={notification.id} className="relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-blackcore-rouge via-blue-500 to-cyan-500 rounded-lg blur opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
                      <Card
                        className={`relative bg-gradient-to-br from-blackcore-gris via-slate-800 to-blackcore-gris border border-blackcore-rouge/30 cursor-pointer transition-all duration-500 hover:scale-105 overflow-hidden ${
                          !notification.read ? "border-l-4 border-l-blackcore-rouge" : ""
                        } ${isSelected ? "ring-2 ring-blue-500 bg-blue-500/10" : ""}`}
                      >
                        <div className="absolute inset-0 opacity-10">
                          <div className="w-full h-full" style={{
                            backgroundImage: `linear-gradient(rgba(255,0,85,0.1) 1px, transparent 1px),
                                            linear-gradient(90deg, rgba(255,0,85,0.1) 1px, transparent 1px)`,
                            backgroundSize: '20px 20px'
                          }}></div>
                        </div>
                        <CardBody className="p-6 relative z-10">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <Checkbox
                                checked={isSelected}
                                onChange={(e) => handleSelectNotification(notification.id, e.target.checked)}
                                onClick={(e) => e.stopPropagation()}
                                className="rounded-none border-blackcore-rouge/50"
                              />
                              {getStatusIcon(notification.status)}
                              {!notification.read && <div className="w-2 h-2 bg-blackcore-rouge rounded-full animate-pulse"></div>}
                            </div>
                            <div className="flex items-center gap-2">
                              <Tooltip content={notification.read ? "Marquer comme non lu" : "Marquer comme lu"}>
                                <IconButton
                                  variant="text"
                                  size="sm"
                                  className={`${
                                    notification.read ? "text-orange-400 hover:text-orange-300" : "text-green-400 hover:text-green-300"
                                  } hover:bg-blackcore-rouge/10 transition-colors`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (notification.read) {
                                      markAsUnread([notification.id]);
                                    } else {
                                      markAsRead([notification.id]);
                                    }
                                  }}
                                >
                                  {notification.read ? (
                                    <EnvelopeIcon className="h-3 w-3" />
                                  ) : (
                                    <EnvelopeOpenIcon className="h-3 w-3" />
                                  )}
                                </IconButton>
                              </Tooltip>
                              <Menu>
                                <MenuHandler>
                                  <IconButton 
                                    variant="text" 
                                    size="sm" 
                                    className="text-blackcore-blanc hover:text-blackcore-rouge hover:bg-blackcore-rouge/10 transition-colors"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <EllipsisVerticalIcon className="h-3 w-3" />
                                  </IconButton>
                                </MenuHandler>
                                <MenuList className="bg-blackcore-gris border border-blackcore-rouge/30">
                                  <MenuItem
                                    className="flex items-center gap-2 text-blackcore-blanc hover:bg-blackcore-rouge/20"
                                    onClick={() => {
                                      setSelectedNotification(notification);
                                      setNotificationDetailsOpen(true);
                                      if (!notification.read) {
                                        markAsRead([notification.id]);
                                      }
                                    }}
                                  >
                                    <EyeIcon className="h-4 w-4" />
                                    Voir les détails
                                  </MenuItem>
                                  <MenuItem
                                    className="flex items-center gap-2 text-red-400 hover:bg-red-500/20"
                                    onClick={() => {
                                      setSelectedNotification(notification);
                                      setDeleteDialogOpen(true);
                                    }}
                                  >
                                    <TrashIcon className="h-4 w-4" />
                                    Supprimer
                                  </MenuItem>
                                </MenuList>
                              </Menu>
                            </div>
                          </div>
                          <div
                            onClick={() => {
                              setSelectedNotification(notification);
                              setNotificationDetailsOpen(true);
                              if (!notification.read) {
                                markAsRead([notification.id]);
                              }
                            }}
                          >
                            <div className="mb-3">
                              <Typography
                                variant="small"
                                className={`${
                                  !notification.read ? "font-semibold text-blackcore-blanc" : "text-blackcore-blanc/80"
                                } line-clamp-2 font-poppins relative`}
                              >
                                {notification.message || 'Message non disponible'}
                                {!notification.read && (
                                  <span className="absolute inset-0 text-blackcore-rouge opacity-0 group-hover:opacity-30 blur-sm transition-opacity duration-300">
                                    {notification.message || 'Message non disponible'}
                                  </span>
                                )}
                              </Typography>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <div className="w-1 h-1 bg-cyan-400 rounded-full opacity-50"></div>
                                <Typography className="text-xs text-blackcore-blanc/60 font-mono">
                                  {formatDate(notification.created_at)}
                                </Typography>
                              </div>
                              <div className={`px-2 py-1 rounded-full bg-gradient-to-r ${getStatusColor(notification.status)} text-white text-xs font-orbitron uppercase tracking-wider shadow-lg`}>
                                {notification.status || 'info'}
                              </div>
                            </div>
                          </div>
                        </CardBody>
                      </Card>
                    </div>
                  );
                })}
              </div>
            )}

            {filteredNotifications.length === 0 && !refreshing && (
              <div className="py-16 px-5 text-center relative z-10">
                <div className="flex flex-col items-center space-y-8">
                  <div className="relative">
                    <div className="w-32 h-32 border-2 border-blackcore-rouge/30 rounded-full flex items-center justify-center relative">
                      <div className="w-24 h-24 border border-blackcore-rouge/50 rounded-full flex items-center justify-center">
                        <div className="w-16 h-16 border border-blackcore-magenta/70 rounded-full flex items-center justify-center">
                          <BellIcon className="h-12 w-12 text-blackcore-rouge/80" />
                        </div>
                      </div>
                      <div className="absolute inset-0 border-2 border-transparent border-t-blackcore-rouge rounded-full animate-spin"></div>
                      <div className="absolute inset-2 border border-transparent border-t-blue-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '3s' }}></div>
                    </div>
                    <div className="absolute top-0 left-1/2 w-2 h-2 bg-cyan-400 rounded-full animate-ping" style={{ animationDelay: '0s' }}></div>
                    <div className="absolute top-1/2 right-0 w-1.5 h-1.5 bg-blackcore-rouge rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
                    <div className="absolute bottom-0 left-1/2 w-1 h-1 bg-blue-500 rounded-full animate-ping" style={{ animationDelay: '2s' }}></div>
                  </div>

                  <div className="text-center space-y-3">
                    <Typography variant="h5" className="text-blackcore-blanc font-orbitron font-bold tracking-wider uppercase">
                      Aucune notification détectée
                    </Typography>
                    <Typography variant="small" className="text-blackcore-blanc/50 font-poppins max-w-md">
                      {search || statusFilter || workflowFilter || readFilter
                        ? "Le système n'a trouvé aucune notification correspondant aux critères de recherche."
                        : "Le système de surveillance est opérationnel. Aucune notification pour le moment."}
                    </Typography>
                  </div>
                </div>
              </div>
            )}
          </CardBody>

          {/* Footer avec informations système */}
          <div className="px-8 py-4 bg-gradient-to-r from-blackcore-noir via-slate-900 to-blackcore-noir border-t border-blackcore-rouge/20 relative">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <Typography className="text-xs font-orbitron text-blackcore-blanc/60 uppercase tracking-wider">
                    Système connecté
                  </Typography>
                </div>
                <div className="hidden md:flex items-center space-x-2">
                  <div className="w-1 h-1 bg-blackcore-rouge rounded-full"></div>
                  <Typography className="text-xs font-mono text-blackcore-blanc/50">
                    Dernière mise à jour: {new Date().toLocaleTimeString()}
                  </Typography>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-1 h-4 bg-blackcore-rouge rounded-full"></div>
                  <div className="w-1 h-3 bg-blue-500 rounded-full"></div>
                  <div className="w-1 h-2 bg-cyan-400 rounded-full"></div>
                </div>
                <Typography className="text-xs font-orbitron text-blackcore-blanc/70 tracking-[0.2em] uppercase">
                  Blackcore AI
                </Typography>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blackcore-rouge/50 to-transparent animate-pulse"></div>
          </div>
        </Card>

        {/* Dialogue détails de la notification futuriste */}
        <Dialog
          open={notificationDetailsOpen}
          handler={() => setNotificationDetailsOpen(false)}
          size="lg"
          className="bg-gradient-to-br from-blackcore-gris via-slate-800 to-blackcore-gris border border-blackcore-rouge/30 max-h-[90vh] overflow-y-auto"
        >
          <DialogHeader className="flex items-center justify-between border-b border-blackcore-rouge/30 pb-4 bg-gradient-to-r from-blackcore-noir via-slate-900 to-blackcore-noir relative">
            <div className="absolute inset-0 opacity-20">
              <div className="w-full h-full" style={{
                backgroundImage: `linear-gradient(rgba(255,0,85,0.1) 1px, transparent 1px),
                                linear-gradient(90deg, rgba(255,0,85,0.1) 1px, transparent 1px)`,
                backgroundSize: '20px 20px'
              }}></div>
            </div>
            <div className="flex items-center gap-3 relative z-10">
              {selectedNotification && getStatusIcon(selectedNotification.status)}
              <div>
                <Typography variant="h6" className="text-blackcore-blanc font-orbitron uppercase tracking-wider">
                  Détails de la notification
                </Typography>
                <Typography variant="small" className="text-blackcore-blanc/60 font-poppins">
                {selectedNotification?.workflow || 'Workflow non spécifié'}
              </Typography>
            </div>
          </div>
          <IconButton
            variant="text"
            color="blue-gray"
            onClick={() => setNotificationDetailsOpen(false)}
          >
            <XMarkIcon className="h-5 w-5" />
          </IconButton>
        </DialogHeader>

        <DialogBody className="p-6">
          {selectedNotification && (
            <div className="space-y-6">
              {/* Message principal */}
              <div>
                <Typography variant="h6" color="blue-gray" className="mb-3">
                  Message
                </Typography>
                <div className="p-4 bg-blue-gray-50 rounded-lg">
                  <Typography className="text-blue-gray-900">
                    {selectedNotification.message || 'Message non disponible'}
                  </Typography>
                </div>
              </div>

              {/* Informations */}
              <div>
                <Typography variant="h6" color="blue-gray" className="mb-3">
                  Informations
                </Typography>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-blue-gray-50 rounded-lg">
                    <div className="h-5 w-5 text-blue-gray-600">📊</div>
                    <div>
                      <Typography variant="small" className="text-blue-gray-600 font-medium">
                        Statut
                      </Typography>
                      <div className="flex items-center gap-2">
                        <Chip
                          variant="ghost"
                          color={getStatusColor(selectedNotification.status)}
                          value={selectedNotification.status || 'info'}
                          className="py-0.5 px-2 text-[10px] font-medium capitalize"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-blue-gray-50 rounded-lg">
                    <ClockIcon className="h-5 w-5 text-blue-gray-600" />
                    <div>
                      <Typography variant="small" className="text-blue-gray-600 font-medium">
                        Date de création
                      </Typography>
                      <Typography className="text-blue-gray-900">
                        {selectedNotification.created_at ? 
                          new Date(selectedNotification.created_at).toLocaleString("fr-FR") : 
                          'Date non disponible'
                        }
                      </Typography>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-blue-gray-50 rounded-lg">
                    <div className="h-5 w-5 text-blue-gray-600">👁️</div>
                    <div>
                      <Typography variant="small" className="text-blue-gray-600 font-medium">
                        Statut de lecture
                      </Typography>
                      <Chip
                        variant="ghost"
                        color={selectedNotification.read ? "green" : "orange"}
                        value={selectedNotification.read ? "Lu" : "Non lu"}
                        className="py-0.5 px-2 text-[10px] font-medium"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-blue-gray-50 rounded-lg">
                    <div className="h-5 w-5 text-blue-gray-600">🏷️</div>
                    <div>
                      <Typography variant="small" className="text-blue-gray-600 font-medium">
                        Workflow
                      </Typography>
                      <Typography className="text-blue-gray-900">
                        {selectedNotification.workflow || 'Non spécifié'}
                      </Typography>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-blue-gray-50 rounded-lg">
                    <div className="h-5 w-5 text-blue-gray-600">🔗</div>
                    <div>
                      <Typography variant="small" className="text-blue-gray-600 font-medium">
                        ID Airtable
                      </Typography>
                      <Typography className="text-blue-gray-900 font-mono text-xs">
                        {selectedNotification.id}
                      </Typography>
                    </div>
                  </div>
                </div>
              </div>

              {/* Données associées */}
              {selectedNotification.data && (
                <div>
                  <Typography variant="h6" color="blue-gray" className="mb-3">
                    Données associées
                  </Typography>
                  <div className="p-4 bg-gray-900 text-green-400 rounded-lg font-mono text-sm overflow-x-auto">
                    <pre>
                      {typeof selectedNotification.data === 'string' 
                        ? (() => {
                            try {
                              return JSON.stringify(JSON.parse(selectedNotification.data), null, 2);
                            } catch {
                              return selectedNotification.data;
                            }
                          })()
                        : JSON.stringify(selectedNotification.data, null, 2)
                      }
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogBody>

        <DialogFooter className="border-t border-blue-gray-50 pt-4">
          <div className="flex justify-between w-full">
            <div className="flex gap-2">
              {selectedNotification && (
                <Button
                  variant="outlined"
                  color={selectedNotification.read ? "orange" : "green"}
                  size="sm"
                  onClick={() => {
                    if (selectedNotification.read) {
                      markAsUnread([selectedNotification.id]);
                    } else {
                      markAsRead([selectedNotification.id]);
                    }
                  }}
                  className="flex items-center gap-2"
                  disabled={bulkActionLoading}
                >
                  {bulkActionLoading ? (
                    <Spinner className="h-3 w-3" />
                  ) : selectedNotification.read ? (
                    <EnvelopeIcon className="h-4 w-4" />
                  ) : (
                    <EnvelopeOpenIcon className="h-4 w-4" />
                  )}
                  {selectedNotification.read ? "Marquer non lu" : "Marquer lu"}
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outlined"
                color="blue-gray"
                onClick={() => setNotificationDetailsOpen(false)}
              >
                Fermer
              </Button>
              <Button
                color="red"
                variant="outlined"
                onClick={() => {
                  if (selectedNotification) {
                    deleteNotifications([selectedNotification.id]);
                    setNotificationDetailsOpen(false);
                  }
                }}
                className="flex items-center gap-2"
                disabled={bulkActionLoading}
              >
                {bulkActionLoading ? <Spinner className="h-4 w-4" /> : <TrashIcon className="h-4 w-4" />}
                Supprimer
              </Button>
            </div>
          </div>
        </DialogFooter>
      </Dialog>

      {/* Dialogue de confirmation de suppression */}
      <Dialog open={deleteDialogOpen} handler={() => setDeleteDialogOpen(false)} size="sm">
        <DialogHeader className="text-red-500">
          <ExclamationTriangleIcon className="h-6 w-6 mr-2" />
          Confirmer la suppression
        </DialogHeader>
        <DialogBody>
          <Typography>
            {selectedCount > 0
              ? `Êtes-vous sûr de vouloir supprimer ${selectedCount} notification${selectedCount !== 1 ? "s" : ""} ?`
              : "Êtes-vous sûr de vouloir supprimer cette notification ?"}
            <br />
            <span className="text-red-500 font-medium">
              Cette action est irréversible et supprimera définitivement les données d'Airtable.
            </span>
          </Typography>
        </DialogBody>
        <DialogFooter className="space-x-2">
          <Button
            variant="text"
            color="blue-gray"
            onClick={() => setDeleteDialogOpen(false)}
            disabled={bulkActionLoading}
          >
            Annuler
          </Button>
          <Button
            variant="filled"
            color="red"
            onClick={() => {
              if (selectedCount > 0) {
                deleteNotifications([...selectedNotifications]);
              } else if (selectedNotification) {
                deleteNotifications([selectedNotification.id]);
              }
            }}
            disabled={bulkActionLoading}
            className="flex items-center gap-2"
          >
            {bulkActionLoading ? <Spinner className="h-4 w-4" /> : <TrashIcon className="h-4 w-4" />}
            Supprimer définitivement
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
    </div>

  );
}
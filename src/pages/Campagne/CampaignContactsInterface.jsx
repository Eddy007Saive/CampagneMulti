import React, { useEffect, useState } from "react";
import {
    Card,
    CardHeader,
    CardBody,
    Typography,
    Chip,
    Input,
    Button,
    Avatar,
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
} from "@material-tailwind/react";
import {
    ArrowLeftIcon,
    EllipsisVerticalIcon,
    PencilIcon,
    TrashIcon,
    EnvelopeIcon,
    PhoneIcon,
    EyeIcon,
    FunnelIcon,
    ArrowDownTrayIcon,
    UserPlusIcon,
    MapPinIcon,
    BuildingOfficeIcon,
    CalendarIcon,
    LinkIcon,
    XMarkIcon,
    CheckIcon,
    ClockIcon,
    XCircleIcon,
    SparklesIcon,
} from "@heroicons/react/24/outline";
import {
    getContactsByCampaignId,
    updateContactStatus,
    updateContactProfile,
    deleteContact,
    autoSortProfiles,
    manualSortProfiles
} from "@/services/Contact";
import { getCampagneById } from "@/services/Campagne";
import { Link, useNavigate, useParams } from "react-router-dom";
import Pagination from "@/components/Pagination";
import toastify from "@/utils/toastify"
import 'react-toastify/dist/ReactToastify.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from "@/context/AuthContext";

export function CampaignContactsInterface() {
    // États pour les données et la pagination
    const [contacts, setContacts] = useState([]);
    const { user, isAuthenticated } = useAuth();

    const [campaignData, setCampaignData] = useState(null);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [loadingCampaign, setLoadingCampaign] = useState(true);

    // États pour les filtres et le tri
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [profileFilter, setProfileFilter] = useState("");
    const [limit, setLimit] = useState(10);
    const [sortBy, setSortBy] = useState("Nom");
    const [sortOrder, setSortOrder] = useState("asc");

    // États pour les dialogs et actions
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [contactDetailsOpen, setContactDetailsOpen] = useState(false);
    const [selectedContact, setSelectedContact] = useState(null);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [updatingProfile, setUpdatingProfile] = useState({});
    const [sortingProfiles, setSortingProfiles] = useState(false);

    // Récupération de l'ID de campagne depuis l'URL
    const { id } = useParams();
    const campaignId = id;

    const navigate = useNavigate();

    // Options de statut
    const statusOptions = [
        { value: "", label: "Tous les statuts" },
        { value: "Non contacté", label: "Non contacté" },
        { value: "Message envoyé", label: "Message envoyé" },
        { value: "Répondu", label: "Réponse reçue" },
        { value: "À recontacter", label: "À recontacter" },
    ];

    // Options de profil
    const profileOptions = [
        { value: "", label: "Tous les profils" },
        { value: "GARDE", label: "Gardés" },
        { value: "En attente", label: "En attente" },
        { value: "REJETE", label: "Rejetés" },
    ];

    useEffect(() => {
        if (campaignId && user) {
            loadCampaignData();
        } else {
            setLoadingCampaign(false);
        }
    }, [user, campaignId]);

    useEffect(() => {

        fetchContacts();

    }, [user?.ID, sortBy, sortOrder, statusFilter, profileFilter, search]);

    const loadCampaignData = async () => {
        try {
            setLoadingCampaign(true);
            const response = await getCampagneById(campaignId);
            setCampaignData(response.data);
        } catch (error) {
            console.error("Erreur lors du chargement de la campagne:", error);
        } finally {
            setLoadingCampaign(false);
        }
    };

    const fetchContacts = async () => {
        try {
            setLoading(true);

            const response = await getContactsByCampaignId(campaignId, {
                search,
                statusFilter,
                profileFilter,
                sortBy,
                sortOrder,
                userId: user
            });

            console.log(response.data);

            setContacts(response.data || []);
            setTotalItems(response.totalItems || 0);

        } catch (error) {
            console.error("Erreur lors du chargement des contacts:", error);
            setContacts([]);
            setTotalItems(0);
        } finally {
            setLoading(false);
        }
    };



    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchContacts();
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleLimitChange = (newLimit) => {
        setLimit(newLimit);
        setCurrentPage(1);
    };

    const handleSort = (column) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortBy(column);
            setSortOrder("asc");
        }
        setCurrentPage(1);
    };

    const handleStatusUpdate = async (contactId, newStatus) => {
        try {
            setUpdatingStatus(true);
            await updateContactStatus(contactId, newStatus);
            await fetchContacts();
        } catch (error) {
            console.error("Erreur lors de la mise à jour du statut:", error);
            alert("Erreur lors de la mise à jour du statut");
        } finally {
            setUpdatingStatus(false);
        }
    };

    const handleProfileUpdate = async (contactId, newProfile) => {
        try {
            setUpdatingProfile(prev => ({ ...prev, [contactId]: true }));
            await updateContactProfile(contactId, newProfile);
            await fetchContacts();
        } catch (error) {
            console.error("Erreur lors de la mise à jour du profil:", error);
            alert("Erreur lors de la mise à jour du profil");
        } finally {
            setUpdatingProfile(prev => ({ ...prev, [contactId]: false }));
        }
    };

    const handleAutoSortProfiles = async () => {
        try {
            setSortingProfiles(true);
            await autoSortProfiles(campaignId);
            await fetchContacts();
            alert("Tri automatique des profils lancé avec succès");
        } catch (error) {
            console.error("Erreur lors du tri automatique:", error);
            alert("Erreur lors du tri automatique des profils");
        } finally {
            setSortingProfiles(false);
        }
    };

    const handleDeleteContact = async () => {
        if (!selectedContact) return;

        try {
            await deleteContact(selectedContact.id);
            setDeleteDialogOpen(false);
            toastify.success("Contact supprimé avec succès");
            setSelectedContact(null);
            await fetchContacts();
        } catch (error) {
            toastify.error("Erreur lors de la suppression du contact");
        }
    };

    const handleViewContact = (contact) => {
        setSelectedContact(contact);
        setContactDetailsOpen(true);
    };

    const getStatusColor = (statut) => {
        switch (statut?.toLowerCase()) {
            case "message envoyé":
                return "from-blue-500 via-blue-600 to-blue-700";
            case "réponse reçue":
                return "from-green-500 via-green-600 to-green-700";
            case "intéressé":
                return "from-emerald-500 via-emerald-600 to-emerald-700";
            case "rendez-vous pris":
                return "from-green-400 via-green-500 to-green-600";
            case "non intéressé":
                return "from-red-500 via-red-600 to-red-700";
            case "à relancer":
                return "from-orange-500 via-orange-600 to-orange-700";
            case "non contacté":
                return "from-gray-500 via-gray-600 to-gray-700";
            default:
                return "from-gray-400 via-gray-500 to-gray-600";
        }
    };

    const getProfileColor = (profil) => {
        switch (profil) {
            case "GARDE":
                return "from-blackcore-rouge via-green-500 to-emerald-400";
            case "En attente":
                return "from-orange-500 via-yellow-500 to-amber-400";
            case "REJETE":
                return "from-red-500 via-red-600 to-red-700";
            default:
                return "from-gray-400 via-gray-500 to-gray-600";
        }
    };

    const getProfileIcon = (profil) => {
        switch (profil) {
            case "GARDE":
                return <CheckIcon className="h-3 w-3" />;
            case "En attente":
                return <ClockIcon className="h-3 w-3" />;
            case "REJETE":
                return <XCircleIcon className="h-3 w-3" />;
            default:
                return <ClockIcon className="h-3 w-3" />;
        }
    };

    const getConnectionBadge = (degre) => {
        const colors = {
            1: "from-blackcore-rouge to-green-400",
            2: "from-blue-500 to-cyan-400",
            3: "from-gray-500 to-gray-400"
        };
        return colors[degre] || "from-gray-400 to-gray-500";
    };

    const truncateMessage = (message, maxLength = 100) => {
        if (!message) return "Aucun message personnalisé";
        if (message.length <= maxLength) return message;
        return message.substring(0, maxLength) + "...";
    };

    const onBack = () => {
        navigate(-1);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return dateString;
        }
    };

    // Calculer les statistiques pour les badges
    const getStats = () => {
        const stats = {
            garde: contacts.filter(c => c.profil === "GARDE").length,
            enAttente: contacts.filter(c => c.profil === "En attente" || !c.profil).length,
            rejete: contacts.filter(c => c.profil === "REJETE").length,
        };
        return stats;
    };

    if (loadingCampaign) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blackcore-noir via-blue-950 to-blackcore-noir flex justify-center items-center">
                <div className="flex flex-col items-center space-y-4">
                    <div className="w-16 h-16 border-4 border-blackcore-rouge border-t-transparent rounded-full animate-spin"></div>
                    <Typography className="text-blackcore-blanc font-orbitron">Chargement de la campagne...</Typography>
                </div>
            </div>
        );
    }

    if (!campaignId) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blackcore-noir via-blue-950 to-blackcore-noir flex justify-center items-center">
                <Typography color="red" className="text-center font-orbitron">
                    Aucune campagne spécifiée
                </Typography>
            </div>
        );
    }

    const columns = [
        { key: "nom", label: "Contact" },
        { key: "posteActuel", label: "Cible" },
        { key: "entrepriseActuelle", label: "Entreprise" },
        { key: "localisation", label: "Localisation" },
        { key: "statut", label: "Statut" },
        { key: "profil", label: "Profil" },
        { key: "dateMessage", label: "Dernier contact" },
        { key: "quickActions", label: "Qualification" },
        { key: "actions", label: "Actions" }
    ];

    const stats = getStats();

    return (
        <div className="min-h-screen bg-gradient-to-br from-blackcore-noir via-blue-950 to-blackcore-noir relative overflow-hidden font-inter">
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
                <Card className="bg-gradient-to-br from-bleu-fonce/90 to-noir-absolu/80 text-white shadow-2xl backdrop-blur-sm relative">
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
                                <IconButton
                                    variant="text"
                                    color="white"
                                    onClick={onBack}
                                    className="rounded-full hover:bg-white/10 transition-all duration-300 border border-white/20 hover:border-blackcore-rouge/50"
                                >
                                    <ArrowLeftIcon className="h-5 w-5" />
                                </IconButton>

                                {/* Indicateur de statut futuriste */}
                                <div className="flex items-center space-x-2">
                                    <div className="w-3 h-3 bg-primary-500 rounded-full animate-pulse-neon"></div>
                                    <div className="w-2 h-2 bg-primary-600 rounded-full animate-pulse-neon" style={{ animationDelay: '0.5s' }}></div>
                                    <div className="w-1 h-1 bg-primary-400 rounded-full animate-pulse-neon" style={{ animationDelay: '1s' }}></div>
                                </div>

                                <div>
                                    <Typography variant="h5" className="text-blanc-pur font-orbitron font-bold text-2xl tracking-[0.2em] uppercase relative">
                                        <span className="relative z-10">CONTACTS</span>
                                        <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-primary-300 bg-clip-text text-transparent animate-pulse-neon opacity-50"></div>
                                    </Typography>
                                    {campaignData && (
                                        <Typography variant="small" color="white" className="opacity-80 font-poppins">
                                            {campaignData.nom} • {totalItems} contact{totalItems > 1 ? 's' : ''}
                                        </Typography>
                                    )}
                                </div>

                                {/* Compteur futuriste */}
                                <div className="hidden md:flex items-center space-x-2 bg-noir-absolu/30 px-3 py-1 rounded-full backdrop-blur-sm border border-primary-500/30">
                                    <span className="text-xs font-orbitron text-primary-500">TOTAL:</span>
                                    <span className="text-sm font-bold text-blanc-pur font-mono">{totalItems}</span>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    className="relative bg-gradient-to-r from-blackcore-rouge via-blue-500 to-cyan-500 hover:from-cyan-500 hover:via-blue-500 hover:to-blackcore-rouge transition-all duration-500 font-poppins font-bold px-6 shadow-lg hover:shadow-2xl hover:shadow-blackcore-rouge/50 border-0 uppercase tracking-wider overflow-hidden group"
                                    size="sm"
                                    onClick={handleAutoSortProfiles}
                                    disabled={sortingProfiles}
                                >
                                    <span className="relative z-10 flex items-center gap-2">
                                        {sortingProfiles ? (
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <SparklesIcon className="h-4 w-4" />
                                        )}
                                        TRIER AUTO
                                    </span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                                </Button>

                                <Link
                                    to="/dashboard/nouveau/contact"
                                    className="relative bg-gradient-to-r from-blanc-pur via-primary-100 to-blanc-pur text-noir-absolu px-8 py-3 rounded-lg font-poppins font-bold text-sm uppercase tracking-wider transition-all duration-500 hover:scale-105 shadow-lg hover:shadow-2xl group-hover:shadow-primary-500/50 border border-transparent hover:border-primary-500/50 overflow-hidden group flex items-center gap-2"
                                >
                                    <span className="relative z-10 flex items-center space-x-2">
                                        <UserPlusIcon className="h-4 w-4" />
                                        <span>NOUVEAU CONTACT</span>
                                    </span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-500/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                                </Link>
                            </div>
                        </div>
                    </CardHeader>

                    {/* Informations de la campagne - Style futuriste */}
                    {campaignData && (
                        <div className="px-8 pb-6 relative">
                            <div className="bg-gradient-to-r from-blackcore-noir/60 via-slate-800/60 to-blackcore-noir/60 p-6 rounded-lg border border-blackcore-rouge/30 backdrop-blur-sm relative overflow-hidden">
                                <div className="absolute inset-0 opacity-5">
                                    <div className="w-full h-full bg-gradient-to-r from-transparent via-blackcore-rouge/20 to-transparent"></div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-sm relative z-10">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-2 h-2 bg-blackcore-rouge rounded-full animate-pulse"></div>
                                        <div>
                                            <Typography variant="small" className="font-orbitron text-blackcore-blanc/60 uppercase tracking-wider text-xs">
                                                Cible recherché
                                            </Typography>
                                            <Typography className="text-blackcore-blanc font-poppins font-medium">
                                                {campaignData.poste}
                                            </Typography>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                        <div>
                                            <Typography variant="small" className="font-orbitron text-blackcore-blanc/60 uppercase tracking-wider text-xs">
                                                Zone géographique
                                            </Typography>
                                            <Typography className="text-blackcore-blanc font-poppins font-medium">
                                                {campaignData.zone}
                                            </Typography>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                                        <div>
                                            <Typography variant="small" className="font-orbitron text-blackcore-blanc/60 uppercase tracking-wider text-xs">
                                                Expérience
                                            </Typography>
                                            <Typography className="text-blackcore-blanc font-poppins font-medium font-mono">
                                                {campaignData.experienceMin}-{campaignData.experienceMax} ans
                                            </Typography>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-2 h-2 rounded-full animate-pulse ${campaignData.statut === "Actif" ? "bg-green-400" : "bg-gray-400"}`}></div>
                                        <div>
                                            <Typography variant="small" className="font-orbitron text-blackcore-blanc/60 uppercase tracking-wider text-xs">
                                                Statut
                                            </Typography>
                                            <Chip
                                                variant="gradient"
                                                value={campaignData.statut}
                                                className={`py-1 px-3 text-xs font-orbitron tracking-wider uppercase ${campaignData.statut === "Actif"
                                                        ? "bg-gradient-to-r from-blackcore-rouge via-green-500 to-emerald-400 text-blackcore-blanc"
                                                        : "bg-gradient-to-r from-blackcore-noir to-gray-700 text-blackcore-blanc/70"
                                                    }`}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Statistiques des profils - Style futuriste */}
                    <div className="px-8 pb-6">
                        <div className="flex gap-4 mb-4">
                            <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blackcore-noir/60 via-slate-800/60 to-blackcore-noir/60 rounded-lg border border-green-500/30 backdrop-blur-sm relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <div className="relative z-10 flex items-center gap-3">
                                    <CheckIcon className="h-4 w-4 text-green-400 animate-pulse" />
                                    <Typography variant="small" className="text-green-300 font-orbitron font-bold tracking-wider uppercase">
                                        Gardés: <span className="text-green-400 font-mono">{stats.garde}</span>
                                    </Typography>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blackcore-noir/60 via-slate-800/60 to-blackcore-noir/60 rounded-lg border border-orange-500/30 backdrop-blur-sm relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <div className="relative z-10 flex items-center gap-3">
                                    <ClockIcon className="h-4 w-4 text-orange-400 animate-pulse" />
                                    <Typography variant="small" className="text-orange-300 font-orbitron font-bold tracking-wider uppercase">
                                        En attente: <span className="text-orange-400 font-mono">{stats.enAttente}</span>
                                    </Typography>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blackcore-noir/60 via-slate-800/60 to-blackcore-noir/60 rounded-lg border border-red-500/30 backdrop-blur-sm relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <div className="relative z-10 flex items-center gap-3">
                                    <XCircleIcon className="h-4 w-4 text-red-400 animate-pulse" />
                                    <Typography variant="small" className="text-red-300 font-orbitron font-bold tracking-wider uppercase">
                                        Rejetés: <span className="text-red-400 font-mono">{stats.rejete}</span>
                                    </Typography>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Barre de recherche et filtres ultra futuriste */}
                    <div className="px-8 py-6 bg-gradient-to-r from-blackcore-noir/50 via-slate-900/50 to-blackcore-noir/50 relative">
                        {/* Effet de grille en arrière-plan */}
                        <div className="absolute inset-0 opacity-5">
                            <div className="w-full h-full bg-gradient-to-r from-transparent via-blackcore-rouge/20 to-transparent"></div>
                        </div>

                        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-6 relative z-10">
                            <div className="flex-1 relative group">
                                {/* Container avec effet de glow */}
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-blackcore-rouge via-blue-500 to-cyan-500 rounded-lg blur opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>

                                <div className="relative bg-blackcore-gris border border-blackcore-rouge/30 rounded-lg overflow-hidden">
                                    <Input
                                        type="text"
                                        label="Rechercher un contact..."
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

                                    {/* Ligne de scan animée */}
                                    <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blackcore-rouge to-cyan-400 w-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>

                                    {/* Indicateurs de coins */}
                                    <div className="absolute top-1 left-1 w-3 h-3 border-l-2 border-t-2 border-cyan-400/50"></div>
                                    <div className="absolute top-1 right-1 w-3 h-3 border-r-2 border-t-2 border-blackcore-rouge/50"></div>
                                    <div className="absolute bottom-1 left-1 w-3 h-3 border-l-2 border-b-2 border-blackcore-magenta/50"></div>
                                    <div className="absolute bottom-1 right-1 w-3 h-3 border-r-2 border-b-2 border-cyan-400/50"></div>
                                </div>
                            </div>

                            <div className="w-full md:w-48 relative group z-50">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 rounded-lg blur opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                                <div className="relative bg-blackcore-gris border border-blue-500/30 rounded-lg">
                                    <Select
                                        label="Filtrer par statut"
                                        value={statusFilter}
                                        onChange={(value) => {
                                            setStatusFilter(value);
                                            setCurrentPage(1);
                                        }}
                                        className="text-blackcore-blanc"
                                        labelProps={{
                                            className: "text-blackcore-blanc/50 font-poppins"
                                        }}
                                        menuProps={{
                                            className: "bg-blackcore-blanc  border border-blue-500/30 !z-[9999] shadow-2xl"
                                        }}
                                        containerProps={{
                                            className: "!z-[9999]"
                                        }}
                                    >
                                        {statusOptions.map((option) => (
                                            <Option key={option.value} value={option.value} className="text-blackcore-blanc hover:bg-blue-500/20">
                                                {option.label}
                                            </Option>
                                        ))}
                                    </Select>
                                </div>
                            </div>

                            <div className="w-full md:w-48 relative group z-50">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-blue-400 to-cyan-500 rounded-lg blur opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                                <div className="relative bg-blackcore-gris border border-cyan-400/30 rounded-lg">
                                    <Select
                                        label="Filtrer par profil"
                                        value={profileFilter}
                                        onChange={(value) => {
                                            setProfileFilter(value);
                                            setCurrentPage(1);
                                        }}
                                        className="text-blackcore-blanc"
                                        labelProps={{
                                            className: "text-blackcore-blanc/50 font-poppins"
                                        }}
                                        menuProps={{
                                            className: "bg-blackcore-gris border border-cyan-400/30 !z-[9999] shadow-2xl"
                                        }}
                                        containerProps={{
                                            className: "!z-[9999]"
                                        }}
                                    >
                                        {profileOptions.map((option) => (
                                            <Option key={option.value} value={option.value} className="text-blackcore-blanc hover:bg-cyan-400/20">
                                                {option.label}
                                            </Option>
                                        ))}
                                    </Select>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="relative bg-gradient-to-r from-blackcore-rouge via-blue-500 to-cyan-500 hover:from-cyan-500 hover:via-blue-500 hover:to-blackcore-rouge transition-all duration-500 font-poppins font-bold px-8 shadow-lg hover:shadow-2xl hover:shadow-blackcore-rouge/50 border-0 uppercase tracking-wider overflow-hidden group"
                            >
                                <span className="relative z-10">Rechercher</span>
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                            </Button>
                        </form>
                    </div>

                    <CardBody className="overflow-x-scroll px-0 pt-0 pb-2 bg-gradient-to-b from-blackcore-gris via-slate-800 to-blackcore-gris relative">
                        {/* Effet de grille subtile */}
                        <div className="absolute inset-0 opacity-5">
                            <div className="w-full h-full" style={{
                                backgroundImage: `linear-gradient(rgba(255,0,85,0.1) 1px, transparent 1px),
                                                linear-gradient(90deg, rgba(255,0,85,0.1) 1px, transparent 1px)`,
                                backgroundSize: '20px 20px'
                            }}></div>
                        </div>

                        {loading ? (
                            <div className="flex justify-center items-center p-8">
                                <div className="relative">
                                    <div className="w-16 h-16 border-4 border-blackcore-rouge border-t-transparent rounded-full animate-spin"></div>
                                    <div className="absolute inset-2 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                                    <div className="absolute inset-4 border border-cyan-400 border-t-transparent rounded-full animate-spin" style={{ animationDuration: '2s' }}></div>
                                </div>
                                <Typography className="ml-6 text-blackcore-blanc font-orbitron tracking-wider uppercase">
                                    Chargement des contacts...
                                </Typography>
                            </div>
                        ) : (
                            <>
                                <table className="w-full min-w-[900px] table-auto">
                                    <thead className="bg-gradient-to-r from-blackcore-noir via-slate-900 to-blackcore-noir relative">
                                        {/* Ligne de séparation lumineuse */}
                                        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blackcore-rouge to-transparent"></div>

                                        <tr>
                                            {columns.map((column, index) => (
                                                <th
                                                    key={column.key}
                                                    className="border-b border-blackcore-rouge/30 py-6 px-6 text-left cursor-pointer hover:bg-blackcore-rouge/5 transition-all duration-300 relative group"
                                                    onClick={() => !["actions", "quickActions"].includes(column.key) && handleSort(column.key)}
                                                >
                                                    {/* Effet de highlight au hover */}
                                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blackcore-rouge/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                                    <div className="flex items-center group relative z-10">
                                                        <Typography
                                                            variant="small"
                                                            className="text-xs font-bold uppercase text-blackcore-blanc font-orbitron tracking-[0.15em] group-hover:text-blackcore-rouge transition-colors duration-300 relative"
                                                        >
                                                            {column.label}
                                                            {/* Effet de glow sur le texte */}
                                                            <span className="absolute inset-0 text-blackcore-rouge opacity-0 group-hover:opacity-50 blur-sm transition-opacity duration-300">{column.label}</span>
                                                        </Typography>

                                                        {sortBy === column.key && (
                                                            <span className="ml-3 text-blackcore-rouge animate-pulse flex items-center">
                                                                <span className="text-lg">{sortOrder === "ASC" ? "↑" : "↓"}</span>
                                                                <div className="w-1 h-1 bg-blackcore-rouge rounded-full ml-1 animate-ping"></div>
                                                            </span>
                                                        )}

                                                        {/* Indicateur de tri disponible */}
                                                        {sortBy !== column.key && (
                                                            <div className="ml-2 opacity-0 group-hover:opacity-30 transition-opacity duration-300">
                                                                <div className="w-1 h-1 bg-blackcore-blanc rounded-full"></div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Ligne de séparation verticale */}
                                                    {index < columns.length - 1 && (
                                                        <div className="absolute right-0 top-2 bottom-2 w-px bg-gradient-to-b from-transparent via-blackcore-rouge/30 to-transparent"></div>
                                                    )}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="bg-gradient-to-b from-blackcore-gris/50 to-blackcore-gris">
                                        {contacts.length > 0 ? (
                                            contacts.map((contact, index) => {
                                                const className = `py-5 px-6 transition-all duration-200 hover:bg-gradient-to-r hover:from-blackcore-rouge/5 hover:via-blackcore-magenta/5 hover:to-cyan-500/5 ${index === contacts.length - 1 ? "" : "border-b border-blackcore-rouge/20"
                                                    }`;

                                                // Bordure colorée selon le statut du profil
                                                const borderLeftColor = contact.profil === "GARDE" ? "border-l-4 border-l-green-400" :
                                                    contact.profil === "REJETE" ? "border-l-4 border-l-red-500" :
                                                        contact.profil === "En attente" ? "border-l-4 border-l-orange-500" :
                                                            "border-l-4 border-l-gray-500";

                                                return (
                                                    <tr key={contact.id || index} className={`hover:bg-gradient-to-r hover:from-blackcore-rouge/5 hover:via-blackcore-magenta/5 hover:to-cyan-500/5 cursor-pointer transition-all duration-500 group relative overflow-hidden ${borderLeftColor}`}>
                                                        <td className={className}>
                                                            <div className="flex items-center gap-4 relative">
                                                                {/* Puce d'état */}
                                                                <div className="w-2 h-2 bg-blackcore-rouge rounded-full animate-pulse opacity-50 group-hover:opacity-100 transition-opacity duration-300"></div>

                                                                {contact.image ? (
                                                                    <Avatar
                                                                        src={contact.image}
                                                                        alt={contact.nom}
                                                                        size="sm"
                                                                        className="border-2 border-blackcore-rouge/30 group-hover:border-blackcore-rouge/60 transition-colors duration-300"
                                                                    />
                                                                ) : (
                                                                    <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-blackcore-rouge via-blue-500 to-cyan-400 flex items-center justify-center border border-blackcore-rouge/30">
                                                                        <Typography variant="small" className="text-blackcore-blanc font-bold text-xs font-orbitron">
                                                                            {contact.nom ? contact.nom.split(' ').map(n => n[0]).join('').substring(0, 2) : '?'}
                                                                        </Typography>
                                                                    </div>
                                                                )}
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-2">
                                                                        <Tooltip
                                                                            content={
                                                                                <div className="max-w-xs p-3 bg-blackcore-gris border border-blackcore-rouge/30 rounded-lg">
                                                                                    <Typography variant="small" className="font-orbitron text-blackcore-blanc font-bold mb-2 uppercase tracking-wider">
                                                                                        Message personnalisé:
                                                                                    </Typography>
                                                                                    <Typography variant="small" className="text-blackcore-blanc/80 font-poppins">
                                                                                        {truncateMessage(contact.messagePersonnalise)}
                                                                                    </Typography>
                                                                                </div>
                                                                            }
                                                                            placement="top"
                                                                            className="bg-blackcore-gris border border-blackcore-rouge/30"
                                                                        >
                                                                            <Typography variant="small" className="font-bold text-blackcore-blanc group-hover:text-blackcore-rouge transition-colors duration-300 cursor-pointer font-poppins">
                                                                                {contact.nom || 'N/A'}
                                                                            </Typography>
                                                                        </Tooltip>
                                                                        {/* Badge connexion LinkedIn */}
                                                                        {contact.connection && (
                                                                            <Chip
                                                                                size="sm"
                                                                                value={`${contact.connection}°`}
                                                                                className={`text-[10px] px-2 py-1 font-orbitron font-bold bg-gradient-to-r ${getConnectionBadge(parseInt(contact.connection))} text-blackcore-blanc border border-blackcore-rouge/30`}
                                                                            />
                                                                        )}
                                                                    </div>
                                                                    <div className="flex items-center gap-2 text-xs text-blackcore-blanc/50 mt-1">
                                                                        {contact.email && (
                                                                            <EnvelopeIcon className="h-3 w-3 text-cyan-400" />
                                                                        )}
                                                                        {contact.telephone && (
                                                                            <PhoneIcon className="h-3 w-3 text-blue-500" />
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className={className}>
                                                            <Typography className="text-sm font-medium text-blackcore-blanc/80 group-hover:text-blackcore-blanc transition-colors duration-300 font-poppins">
                                                                {contact.posteActuel || 'N/A'}
                                                            </Typography>
                                                        </td>
                                                        <td className={className}>
                                                            <Typography className="text-sm font-medium text-blackcore-blanc/80 group-hover:text-blackcore-blanc transition-colors duration-300 font-poppins">
                                                                {contact.entrepriseActuelle || 'N/A'}
                                                            </Typography>
                                                        </td>
                                                        <td className={className}>
                                                            <div className="flex items-center space-x-2">
                                                                <div className="w-1 h-1 bg-cyan-400 rounded-full opacity-50"></div>
                                                                <Typography className="text-sm font-medium text-blackcore-blanc/80 group-hover:text-blackcore-blanc transition-colors duration-300 font-poppins">
                                                                    {contact.localisation || 'N/A'}
                                                                </Typography>
                                                            </div>
                                                        </td>
                                                        <td className={className}>
                                                            <Menu>
                                                                <MenuHandler>
                                                                    <div className="cursor-pointer">
                                                                        <Chip
                                                                            variant="gradient"
                                                                            value={contact.statut || "Non contacté"}
                                                                            className={`py-1.5 px-3 text-[10px] font-bold font-orbitron tracking-wider uppercase w-fit hover:shadow-lg transition-shadow bg-gradient-to-r ${getStatusColor(contact.statut)} text-blackcore-blanc border border-blackcore-rouge/20`}
                                                                        />
                                                                    </div>
                                                                </MenuHandler>
                                                                <MenuList className="bg-blackcore-gris border border-blackcore-rouge/30">
                                                                    {statusOptions.slice(1).map((status) => (
                                                                        <MenuItem
                                                                            key={status.value}
                                                                            onClick={() => handleStatusUpdate(contact.ID_CONTACT, status.value)}
                                                                            disabled={updatingStatus}
                                                                            className="text-blackcore-blanc hover:bg-blackcore-rouge/20 font-poppins"
                                                                        >
                                                                            {status.label}
                                                                        </MenuItem>
                                                                    ))}
                                                                </MenuList>
                                                            </Menu>
                                                        </td>
                                                        <td className={className}>
                                                            <Chip
                                                                variant="gradient"
                                                                value={
                                                                    <div className="flex items-center gap-1.5">
                                                                        {getProfileIcon(contact.profil)}
                                                                        <span className="font-orbitron text-xs tracking-wider">
                                                                            {contact.profil === "GARDE" ? "GARDÉ" :
                                                                                contact.profil === "REJETE" ? "REJETÉ" :
                                                                                    contact.profil === "En attente" ? "ATTENTE" :
                                                                                        "NON QUALIFIÉ"}
                                                                        </span>
                                                                    </div>
                                                                }
                                                                className={`py-1.5 px-3 text-[10px] font-bold w-fit bg-gradient-to-r ${getProfileColor(contact.profil)} text-blackcore-blanc border border-blackcore-rouge/20`}
                                                            />
                                                        </td>
                                                        <td className={className}>
                                                            <div className="flex items-center space-x-2">
                                                                <div className="w-1 h-1 bg-blue-500 rounded-full opacity-50"></div>
                                                                <Typography className="text-xs text-blackcore-blanc/70 font-mono">
                                                                    {contact.dateMessage ?
                                                                        new Date(contact.dateMessage).toLocaleDateString('fr-FR') :
                                                                        contact.dateCreation ?
                                                                            new Date(contact.dateCreation).toLocaleDateString('fr-FR') :
                                                                            'N/A'
                                                                    }
                                                                </Typography>
                                                            </div>
                                                        </td>
                                                        <td className={className}>
                                                            <div className="flex items-center gap-2">
                                                                <Tooltip content="Garder ce profil" className="bg-blackcore-gris border border-green-500/30">
                                                                    <IconButton
                                                                        size="sm"
                                                                        variant="text"
                                                                        onClick={() => handleProfileUpdate(contact.ID_CONTACT, "GARDE")}
                                                                        disabled={updatingProfile[contact.ID_CONTACT] || contact.profil === "GARDE"}
                                                                        className={`transition-all duration-200 border border-green-500/30 hover:border-green-500/60 ${contact.profil === "GARDE" ? "bg-green-500/20 text-green-300" : "text-green-400 hover:bg-green-500/10"}`}
                                                                    >
                                                                        {updatingProfile[contact.ID_CONTACT] ? (
                                                                            <div className="w-3 h-3 border border-green-400 border-t-transparent rounded-full animate-spin" />
                                                                        ) : (
                                                                            <CheckIcon className="h-3 w-3" />
                                                                        )}
                                                                    </IconButton>
                                                                </Tooltip>
                                                                <Tooltip content="Rejeter ce profil" className="bg-blackcore-gris border border-red-500/30">
                                                                    <IconButton
                                                                        size="sm"
                                                                        variant="text"
                                                                        onClick={() => handleProfileUpdate(contact.ID_CONTACT, "REJETE")}
                                                                        disabled={updatingProfile[contact.ID_CONTACT] || contact.profil === "REJETE"}
                                                                        className={`transition-all duration-200 border border-red-500/30 hover:border-red-500/60 ${contact.profil === "REJETE" ? "bg-red-500/20 text-red-300" : "text-red-400 hover:bg-red-500/10"}`}
                                                                    >
                                                                        {updatingProfile[contact.ID_CONTACT] ? (
                                                                            <div className="w-3 h-3 border border-red-400 border-t-transparent rounded-full animate-spin" />
                                                                        ) : (
                                                                            <XCircleIcon className="h-3 w-3" />
                                                                        )}
                                                                    </IconButton>
                                                                </Tooltip>
                                                            </div>
                                                        </td>
                                                        <td className={className}>
                                                            <div className="flex items-center gap-2">
                                                                <Tooltip content="Voir les détails" className="bg-blackcore-gris border border-blue-500/30">
                                                                    <IconButton
                                                                        variant="text"
                                                                        size="sm"
                                                                        onClick={() => handleViewContact(contact)}
                                                                        className="text-blue-400 hover:bg-blue-500/10 transition-colors border border-blue-500/30 hover:border-blue-500/60"
                                                                    >
                                                                        <EyeIcon className="h-4 w-4" />
                                                                    </IconButton>
                                                                </Tooltip>
                                                                {contact.url && (
                                                                    <Tooltip content="Voir le profil LinkedIn" className="bg-blackcore-gris border border-cyan-400/30">
                                                                        <IconButton
                                                                            variant="text"
                                                                            size="sm"
                                                                            onClick={() => window.open(contact.url, '_blank', 'noopener,noreferrer')}
                                                                            className="text-cyan-400 hover:bg-cyan-400/10 transition-colors border border-cyan-400/30 hover:border-cyan-400/60"
                                                                        >
                                                                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                                                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                                                            </svg>
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                )}
                                                                <Menu>
                                                                    <MenuHandler>
                                                                        <IconButton
                                                                            variant="text"
                                                                            size="sm"
                                                                            className="text-blackcore-blanc/60 hover:bg-blackcore-rouge/10 transition-colors border border-blackcore-rouge/30 hover:border-blackcore-rouge/60"
                                                                        >
                                                                            <EllipsisVerticalIcon className="h-4 w-4" />
                                                                        </IconButton>
                                                                    </MenuHandler>
                                                                    <MenuList className="bg-blackcore-gris border border-blackcore-rouge/30">
                                                                        <MenuItem
                                                                            as={Link}
                                                                            to={`/dashboard/contact/edit/${contact.ID_CONTACT}`}
                                                                            className="flex items-center gap-2 text-blackcore-blanc hover:bg-blue-500/20 font-poppins"
                                                                        >
                                                                            <PencilIcon className="h-4 w-4 text-blue-400" />
                                                                            Modifier
                                                                        </MenuItem>
                                                                        <MenuItem
                                                                            className="flex items-center gap-2 text-red-400 hover:bg-red-500/20 font-poppins"
                                                                            onClick={() => {
                                                                                setSelectedContact(contact);
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
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan={columns.length} className="py-16 px-6 text-center relative">
                                                    <div className="flex flex-col items-center space-y-6">
                                                        {/* Icône futuriste pour "pas de données" */}
                                                        <div className="relative">
                                                            <div className="w-24 h-24 border-2 border-blackcore-rouge/30 rounded-full flex items-center justify-center relative">
                                                                <div className="w-16 h-16 border border-blackcore-rouge/50 rounded-full flex items-center justify-center">
                                                                    <div className="w-8 h-8 border border-blackcore-magenta/70 rounded-full flex items-center justify-center">
                                                                        <span className="text-blackcore-rouge text-xl font-orbitron font-bold">!</span>
                                                                    </div>
                                                                </div>

                                                                {/* Anneaux rotatifs */}
                                                                <div className="absolute inset-0 border-2 border-transparent border-t-blackcore-rouge rounded-full animate-spin"></div>
                                                                <div className="absolute inset-2 border border-transparent border-t-blue-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '3s' }}></div>
                                                            </div>

                                                            {/* Particules orbitales */}
                                                            <div className="absolute top-0 left-1/2 w-2 h-2 bg-cyan-400 rounded-full animate-ping" style={{ animationDelay: '0s' }}></div>
                                                            <div className="absolute top-1/2 right-0 w-1.5 h-1.5 bg-blackcore-rouge rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
                                                            <div className="absolute bottom-0 left-1/2 w-1 h-1 bg-blue-500 rounded-full animate-ping" style={{ animationDelay: '2s' }}></div>
                                                        </div>

                                                        <div className="text-center space-y-2">
                                                            <Typography variant="h6" className="text-blackcore-blanc font-orbitron font-bold tracking-wider uppercase">
                                                                Aucun contact détecté
                                                            </Typography>
                                                            <Typography variant="small" className="text-blackcore-blanc/50 font-poppins">
                                                                {statusFilter || profileFilter || search ?
                                                                    "Aucun contact ne correspond aux critères de recherche" :
                                                                    "Aucun contact associé à cette campagne"
                                                                }
                                                            </Typography>
                                                        </div>

                                                        {/* Suggestion d'action */}
                                                        <div className="mt-6">
                                                            <Link
                                                                to="/dashboard/nouveau/contact"
                                                                className="inline-flex items-center space-x-2 bg-gradient-to-r from-blackcore-rouge to-blue-500 px-6 py-3 rounded-lg text-blackcore-blanc font-poppins font-semibold hover:scale-105 transition-transform duration-300 shadow-lg hover:shadow-blackcore-rouge/50"
                                                            >
                                                                <UserPlusIcon className="h-4 w-4" />
                                                                <span>AJOUTER LE PREMIER CONTACT</span>
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>

                                {/* Pagination ultra futuriste */}
                                {totalPages > 1 && (
                                    <div className="mt-8 px-8 pb-8 relative">
                                        {/* Ligne de séparation lumineuse */}
                                        <div className="w-full h-px bg-gradient-to-r from-transparent via-blackcore-rouge to-transparent mb-6"></div>

                                        <div className="flex justify-between items-center">
                                            {/* Informations de pagination stylées */}
                                            <div className="flex items-center space-x-6">
                                                <div className="flex items-center space-x-3 bg-blackcore-noir/50 px-4 py-2 rounded-lg border border-blackcore-rouge/30 backdrop-blur-sm">
                                                    <div className="flex space-x-1">
                                                        <div className="w-1 h-1 bg-blackcore-rouge rounded-full animate-pulse"></div>
                                                        <div className="w-1 h-1 bg-blackcore-magenta rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                                                        <div className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                                                    </div>
                                                    <Typography className="text-xs font-orbitron text-blackcore-blanc/80 tracking-wider uppercase">
                                                        Page <span className="text-blackcore-rouge font-bold">{currentPage}</span> sur <span className="text-cyan-400 font-bold">{totalPages}</span>
                                                    </Typography>
                                                </div>

                                                <div className="flex items-center space-x-3 bg-blackcore-noir/50 px-4 py-2 rounded-lg border border-cyan-400/30 backdrop-blur-sm">
                                                    <Typography className="text-xs font-orbitron text-blackcore-blanc/80 tracking-wider uppercase">
                                                        Total: <span className="text-cyan-400 font-bold font-mono">{totalItems}</span> contacts
                                                    </Typography>
                                                </div>
                                            </div>

                                            {/* Composant Pagination avec style personnalisé */}
                                            <div className="relative">
                                                {/* Glow effect autour de la pagination */}
                                                <div className="absolute -inset-2 bg-gradient-to-r from-blackcore-rouge/20 via-blue-500/20 to-cyan-400/20 rounded-lg blur opacity-50"></div>

                                                <div className="relative bg-blackcore-gris/80 border border-blackcore-rouge/30 rounded-lg p-2 backdrop-blur-sm">
                                                    <Pagination
                                                        currentPage={currentPage}
                                                        totalPages={totalPages}
                                                        totalItems={totalItems}
                                                        limit={limit}
                                                        onPageChange={handlePageChange}
                                                        onLimitChange={handleLimitChange}
                                                        itemName="contacts"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Statistiques additionnelles */}
                                        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                                            <div className="bg-gradient-to-r from-blackcore-noir/60 via-slate-800/60 to-blackcore-noir/60 p-4 rounded-lg border border-green-500/20 backdrop-blur-sm relative overflow-hidden group">
                                                <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                                <div className="relative z-10">
                                                    <Typography className="text-xs font-orbitron text-blackcore-blanc/60 uppercase tracking-wider mb-1">
                                                        Contacts gardés
                                                    </Typography>
                                                    <Typography className="text-lg font-bold text-green-400 font-mono">
                                                        {stats.garde}
                                                    </Typography>
                                                </div>
                                                <div className="absolute top-2 right-2 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                            </div>

                                            <div className="bg-gradient-to-r from-blackcore-noir/60 via-slate-800/60 to-blackcore-noir/60 p-4 rounded-lg border border-orange-500/20 backdrop-blur-sm relative overflow-hidden group">
                                                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                                <div className="relative z-10">
                                                    <Typography className="text-xs font-orbitron text-blackcore-blanc/60 uppercase tracking-wider mb-1">
                                                        En attente
                                                    </Typography>
                                                    <Typography className="text-lg font-bold text-orange-400 font-mono">
                                                        {stats.enAttente}
                                                    </Typography>
                                                </div>
                                                <div className="absolute top-2 right-2 w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                                            </div>

                                            <div className="bg-gradient-to-r from-blackcore-noir/60 via-slate-800/60 to-blackcore-noir/60 p-4 rounded-lg border border-red-500/20 backdrop-blur-sm relative overflow-hidden group">
                                                <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                                <div className="relative z-10">
                                                    <Typography className="text-xs font-orbitron text-blackcore-blanc/60 uppercase tracking-wider mb-1">
                                                        Rejetés
                                                    </Typography>
                                                    <Typography className="text-lg font-bold text-red-400 font-mono">
                                                        {stats.rejete}
                                                    </Typography>
                                                </div>
                                                <div className="absolute top-2 right-2 w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                                            </div>

                                            <div className="bg-gradient-to-r from-blackcore-noir/60 via-slate-800/60 to-blackcore-noir/60 p-4 rounded-lg border border-cyan-400/20 backdrop-blur-sm relative overflow-hidden group">
                                                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                                <div className="relative z-10">
                                                    <Typography className="text-xs font-orbitron text-blackcore-blanc/60 uppercase tracking-wider mb-1">
                                                        Affichés
                                                    </Typography>
                                                    <Typography className="text-lg font-bold text-cyan-400 font-mono">
                                                        {contacts.length}/{limit}
                                                    </Typography>
                                                </div>
                                                <div className="absolute top-2 right-2 w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </CardBody>

                    {/* Footer avec informations système */}
                    <div className="px-8 py-4 bg-gradient-to-r from-blackcore-noir via-slate-900 to-blackcore-noir border-t border-blackcore-rouge/20 relative">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-4">
                                {/* Indicateur de connexion */}
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                    <Typography className="text-xs font-orbitron text-blackcore-blanc/60 uppercase tracking-wider">
                                        Système connecté
                                    </Typography>
                                </div>

                                {/* Timestamp */}
                                <div className="hidden md:flex items-center space-x-2">
                                    <div className="w-1 h-1 bg-blackcore-rouge rounded-full"></div>
                                    <Typography className="text-xs font-mono text-blackcore-blanc/50">
                                        Dernière mise à jour: {new Date().toLocaleTimeString()}
                                    </Typography>
                                </div>
                            </div>

                            {/* Logo/Signature Blackcore */}
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

                        {/* Ligne de scan en bas */}
                        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blackcore-rouge/50 to-transparent animate-pulse"></div>
                    </div>
                </Card>

                {/* Effets d'ambiance flottants */}
                <div className="fixed bottom-10 right-10 pointer-events-none">
                    <div className="flex flex-col space-y-4 opacity-30">
                        <div className="w-3 h-3 bg-blackcore-rouge rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
                        <div className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
                    </div>
                </div>
            </div>

            {/* Dialog détails du contact - Style futuriste */}
            <Dialog
                open={contactDetailsOpen}
                handler={() => setContactDetailsOpen(false)}
                size="lg"
                className="max-h-[90vh] overflow-y-auto bg-blackcore-gris border border-blackcore-rouge/30"
            >
                <DialogHeader className="flex items-center justify-between border-b border-blackcore-rouge/30 pb-4 bg-gradient-to-r from-blackcore-noir via-slate-900 to-blackcore-noir">
                    <div className="flex items-center gap-3">
                        {selectedContact?.image ? (
                            <Avatar
                                src={selectedContact.image}
                                alt={selectedContact.nom}
                                size="md"
                                className="border-2 border-blackcore-rouge/50"
                            />
                        ) : (
                            <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-blackcore-rouge via-blue-500 to-cyan-400 flex items-center justify-center border border-blackcore-rouge/30">
                                <Typography variant="h6" className="text-blackcore-blanc font-bold font-orbitron">
                                    {selectedContact?.nom ? selectedContact.nom.split(' ').map(n => n[0]).join('').substring(0, 2) : '?'}
                                </Typography>
                            </div>
                        )}
                        <div>
                            <div className="flex items-center gap-2">
                                <Typography variant="h6" className="text-blackcore-blanc font-orbitron font-bold">
                                    {selectedContact?.nom || 'Contact'}
                                </Typography>
                                {selectedContact?.connection && (
                                    <Chip
                                        size="sm"
                                        value={`${selectedContact.connection}° connexion`}
                                        className={`text-[10px] font-orbitron font-bold bg-gradient-to-r ${getConnectionBadge(parseInt(selectedContact.connection))} text-blackcore-blanc border border-blackcore-rouge/30`}
                                    />
                                )}
                            </div>
                            <Typography variant="small" className="text-blackcore-blanc/80 font-poppins">
                                {selectedContact?.posteActuel || 'Poste non renseigné'}
                            </Typography>
                            <div className="flex items-center gap-2 mt-1">
                                <Chip
                                    variant="gradient"
                                    value={
                                        <div className="flex items-center gap-1">
                                            {getProfileIcon(selectedContact?.profil)}
                                            <span className="font-orbitron text-xs tracking-wider">
                                                {selectedContact?.profil === "GARDE" ? "PROFIL GARDÉ" :
                                                    selectedContact?.profil === "REJETE" ? "PROFIL REJETÉ" :
                                                        selectedContact?.profil === "En attente" ? "EN ATTENTE" :
                                                            "NON QUALIFIÉ"}
                                            </span>
                                        </div>
                                    }
                                    className={`text-[10px] font-bold bg-gradient-to-r ${getProfileColor(selectedContact?.profil)} text-blackcore-blanc border border-blackcore-rouge/20`}
                                />
                            </div>
                        </div>
                    </div>
                    <IconButton
                        variant="text"
                        onClick={() => setContactDetailsOpen(false)}
                        className="text-blackcore-blanc hover:bg-blackcore-rouge/20 border border-blackcore-rouge/30"
                    >
                        <XMarkIcon className="h-5 w-5" />
                    </IconButton>
                </DialogHeader>

                <DialogBody className="p-6 bg-blackcore-gris text-blackcore-blanc">
                    {selectedContact && (
                        <div className="space-y-6">
                            {/* Informations de contact */}
                            <div>
                                <Typography variant="h6" className="mb-4 font-orbitron font-bold tracking-wider uppercase text-blackcore-rouge">
                                    Informations de contact
                                </Typography>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {selectedContact.email && (
                                        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blackcore-noir/60 via-slate-800/60 to-blackcore-noir/60 rounded-lg border border-cyan-400/30 backdrop-blur-sm relative overflow-hidden group">
                                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                            <EnvelopeIcon className="h-5 w-5 text-cyan-400 relative z-10" />
                                            <div className="relative z-10">
                                                <Typography variant="small" className="text-blackcore-blanc/60 font-orbitron uppercase tracking-wider">
                                                    Email
                                                </Typography>
                                                <Typography className="text-blackcore-blanc font-poppins">
                                                    {selectedContact.email}
                                                </Typography>
                                            </div>
                                        </div>
                                    )}
                                    {selectedContact.telephone && (
                                        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blackcore-noir/60 via-slate-800/60 to-blackcore-noir/60 rounded-lg border border-blue-500/30 backdrop-blur-sm relative overflow-hidden group">
                                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                            <PhoneIcon className="h-5 w-5 text-blue-500 relative z-10" />
                                            <div className="relative z-10">
                                                <Typography variant="small" className="text-blackcore-blanc/60 font-orbitron uppercase tracking-wider">
                                                    Téléphone
                                                </Typography>
                                                <Typography className="text-blackcore-blanc font-poppins">
                                                    {selectedContact.telephone}
                                                </Typography>
                                            </div>
                                        </div>
                                    )}
                                    {selectedContact.localisation && (
                                        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blackcore-noir/60 via-slate-800/60 to-blackcore-noir/60 rounded-lg border border-green-500/30 backdrop-blur-sm relative overflow-hidden group">
                                            <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                            <MapPinIcon className="h-5 w-5 text-green-500 relative z-10" />
                                            <div className="relative z-10">
                                                <Typography variant="small" className="text-blackcore-blanc/60 font-orbitron uppercase tracking-wider">
                                                    Localisation
                                                </Typography>
                                                <Typography className="text-blackcore-blanc font-poppins">
                                                    {selectedContact.localisation}
                                                </Typography>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Informations professionnelles */}
                            <div>
                                <Typography variant="h6" className="mb-4 font-orbitron font-bold tracking-wider uppercase text-blackcore-rouge">
                                    Informations professionnelles
                                </Typography>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blackcore-noir/60 via-slate-800/60 to-blackcore-noir/60 rounded-lg border border-orange-500/30 backdrop-blur-sm relative overflow-hidden">
                                        <BuildingOfficeIcon className="h-5 w-5 text-orange-500" />
                                        <div>
                                            <Typography variant="small" className="text-blackcore-blanc/60 font-orbitron uppercase tracking-wider">
                                                Entreprise actuelle
                                            </Typography>
                                            <Typography className="text-blackcore-blanc font-poppins">
                                                {selectedContact.entrepriseActuelle || 'Non renseignée'}
                                            </Typography>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blackcore-noir/60 via-slate-800/60 to-blackcore-noir/60 rounded-lg border border-purple-500/30 backdrop-blur-sm relative overflow-hidden">
                                        <div className="h-5 w-5 text-purple-500">💼</div>
                                        <div>
                                            <Typography variant="small" className="text-blackcore-blanc/60 font-orbitron uppercase tracking-wider">
                                                Poste actuel
                                            </Typography>
                                            <Typography className="text-blackcore-blanc font-poppins">
                                                {selectedContact.posteActuel || 'Non renseigné'}
                                            </Typography>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Message personnalisé */}
                            {selectedContact.messagePersonnalise && (
                                <div>
                                    <Typography variant="h6" className="mb-4 font-orbitron font-bold tracking-wider uppercase text-blackcore-rouge">
                                        Message personnalisé
                                    </Typography>
                                    <div className="p-4 bg-gradient-to-r from-blue-500/10 via-cyan-400/10 to-blue-500/10 rounded-lg border border-blue-500/30 backdrop-blur-sm">
                                        <Typography className="text-blackcore-blanc whitespace-pre-wrap font-poppins">
                                            {selectedContact.messagePersonnalise}
                                        </Typography>
                                    </div>
                                </div>
                            )}

                            {/* Liens */}
                            {selectedContact.url && (
                                <div>
                                    <Typography variant="h6" className="mb-4 font-orbitron font-bold tracking-wider uppercase text-blackcore-rouge">
                                        Liens
                                    </Typography>
                                    <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blackcore-noir/60 via-slate-800/60 to-blackcore-noir/60 rounded-lg border border-cyan-400/30 backdrop-blur-sm relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        <LinkIcon className="h-5 w-5 text-cyan-400 relative z-10" />
                                        <div className="flex-1 relative z-10">
                                            <Typography variant="small" className="text-blackcore-blanc/60 font-orbitron uppercase tracking-wider">
                                                Profil LinkedIn
                                            </Typography>
                                            <a
                                                href={selectedContact.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-cyan-400 hover:text-cyan-300 underline break-all font-poppins transition-colors duration-300"
                                            >
                                                {selectedContact.url}
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Historique de contact */}
                            <div>
                                <Typography variant="h6" className="mb-4 font-orbitron font-bold tracking-wider uppercase text-blackcore-rouge">
                                    Historique
                                </Typography>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blackcore-noir/60 via-slate-800/60 to-blackcore-noir/60 rounded-lg border border-green-500/30 backdrop-blur-sm">
                                        <CalendarIcon className="h-5 w-5 text-green-500" />
                                        <div>
                                            <Typography variant="small" className="text-blackcore-blanc/60 font-orbitron uppercase tracking-wider">
                                                Date de création
                                            </Typography>
                                            <Typography className="text-blackcore-blanc font-poppins font-mono">
                                                {formatDate(selectedContact.dateCreation)}
                                            </Typography>
                                        </div>
                                    </div>
                                    {selectedContact.dateMessage && (
                                        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blackcore-noir/60 via-slate-800/60 to-blackcore-noir/60 rounded-lg border border-blue-500/30 backdrop-blur-sm">
                                            <EnvelopeIcon className="h-5 w-5 text-blue-500" />
                                            <div>
                                                <Typography variant="small" className="text-blackcore-blanc/60 font-orbitron uppercase tracking-wider">
                                                    Dernier message envoyé
                                                </Typography>
                                                <Typography className="text-blackcore-blanc font-poppins font-mono">
                                                    {formatDate(selectedContact.dateMessage)}
                                                </Typography>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </DialogBody>

                <DialogFooter className="border-t border-blackcore-rouge/30 pt-4 bg-gradient-to-r from-blackcore-noir via-slate-900 to-blackcore-noir">
                    <div className="flex justify-between w-full">
                        <div className="flex gap-2">
                            {selectedContact?.url && (
                                <Button
                                    variant="outlined"
                                    size="sm"
                                    onClick={() => window.open(selectedContact.url, '_blank', 'noopener,noreferrer')}
                                    className="flex items-center gap-2 text-cyan-400 border-cyan-400/30 hover:bg-cyan-400/10 font-poppins"
                                >
                                    <LinkIcon className="h-4 w-4" />
                                    LinkedIn
                                </Button>
                            )}
                            {selectedContact?.email && (
                                <Button
                                    variant="outlined"
                                    size="sm"
                                    onClick={() => window.location.href = `mailto:${selectedContact.email}`}
                                    className="flex items-center gap-2 text-green-400 border-green-400/30 hover:bg-green-400/10 font-poppins"
                                >
                                    <EnvelopeIcon className="h-4 w-4" />
                                    Email
                                </Button>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outlined"
                                onClick={() => setContactDetailsOpen(false)}
                                className="text-blackcore-blanc border-blackcore-blanc/30 hover:bg-blackcore-blanc/10 font-poppins"
                            >
                                Fermer
                            </Button>
                            <Button
                                as={Link}
                                to={`/dashboard/contact/edit/${selectedContact?.ID_CONTACT}`}
                                className="flex items-center gap-2 bg-gradient-to-r from-blackcore-rouge via-blue-500 to-cyan-500 text-blackcore-blanc font-poppins"
                            >
                                <PencilIcon className="h-4 w-4" />
                                Modifier
                            </Button>
                        </div>
                    </div>
                </DialogFooter>
            </Dialog>

            {/* Dialog de confirmation de suppression - Style futuriste */}
            <Dialog
                open={deleteDialogOpen}
                handler={() => setDeleteDialogOpen(false)}
                size="sm"
                className="bg-blackcore-gris border border-red-500/50"
            >
                <DialogHeader className="text-red-400 bg-gradient-to-r from-blackcore-noir via-red-900/20 to-blackcore-noir font-orbitron tracking-wider uppercase">
                    Confirmer la suppression
                </DialogHeader>
                <DialogBody className="bg-blackcore-gris text-blackcore-blanc">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/50">
                            <TrashIcon className="h-6 w-6 text-red-400" />
                        </div>
                        <div>
                            <Typography className="font-poppins">
                                Êtes-vous sûr de vouloir supprimer le contact <strong className="text-red-400">{selectedContact?.nom}</strong> ?
                            </Typography>
                            <Typography variant="small" className="text-blackcore-blanc/70 mt-2 font-poppins">
                                Cette action est irréversible.
                            </Typography>
                        </div>
                    </div>
                </DialogBody>
                <DialogFooter className="space-x-2 bg-gradient-to-r from-blackcore-noir via-red-900/10 to-blackcore-noir border-t border-red-500/30">
                    <Button
                        variant="text"
                        onClick={() => setDeleteDialogOpen(false)}
                        className="text-blackcore-blanc hover:bg-blackcore-blanc/10 font-poppins"
                    >
                        Annuler
                    </Button>
                    <Button
                        onClick={handleDeleteContact}
                        className="bg-gradient-to-r from-red-500 to-red-600 text-blackcore-blanc hover:from-red-600 hover:to-red-700 font-poppins"
                    >
                        Supprimer
                    </Button>
                </DialogFooter>
            </Dialog>

            <ToastContainer
                position="bottom-right"
                theme="dark"
                toastStyle={{
                    backgroundColor: '#1a1a1a',
                    color: '#ffffff',
                    border: '1px solid #FF0055',
                }}
            />
        </div>
    );
}

export default CampaignContactsInterface;
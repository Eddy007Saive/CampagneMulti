import React, { useEffect, useState } from "react";
import {
    Card,
    CardHeader,
    CardBody,
    Typography,
    Chip,
    Input,
    Button,
    IconButton,
} from "@material-tailwind/react";
import { getCampagnes } from "@/services";
import { Link, useNavigate } from "react-router-dom";
import Pagination from "@/components/Pagination";
import Loading from "@/components/Loading";
import { useAuth } from '@/context/AuthContext';

export function liste() {
    // États pour les données et la 
    const { user, isAuthenticated } = useAuth();
    const [campagnes, setCampagnes] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // États pour les filtres et le tri
    const [search, setSearch] = useState("");
    const [limit, setLimit] = useState(10);
    const [sortBy, setSortBy] = useState("id");
    const [sortOrder, setSortOrder] = useState("ASC");

    useEffect(() => {
         if (isAuthenticated() && user?.ID) {
            fetchData();
        }
    }, [user?.ID,currentPage, limit, sortBy, sortOrder]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await getCampagnes({userId:user,
                page: currentPage,
                limit,
                search,
                sortBy,
                sortOrder
            });

            setCampagnes(response.data.campagnes);
            setTotalItems(response.data.totalItems);
            setTotalPages(response.data.totalPages);
            setLoading(false);
        } catch (error) {
            console.error("Erreur lors du chargement des campagnes:", error);
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchData();
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
            setSortOrder(sortOrder === "ASC" ? "DESC" : "ASC");
        } else {
            setSortBy(column);
            setSortOrder("ASC");
        }
    };

    const columns = [
        { key: "nom", label: "Nom de la campagne" },
        { key: "poste", label: "Poste recherché" },
        { key: "zone", label: "Zone géographique" },
        { key: "taille_entreprise", label: "Entreprise" },
        { key: "seniorite", label: "Séniorité" },
        { key: "langues", label: "Langues" },
        { key: "secteurs", label: "Secteurs" },
        { key: "statut", label: "Statut" }
    ];

    const handleCampaignClick = (campaignId) => {
        navigate(`/dashboard/campagne/${campaignId}`);
    };

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
                <Card className=" bg-gradient-to-br from-bleu-fonce/90 to-noir-absolu/80  text-white   shadow-2xl backdrop-blur-sm relative ">

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
                            <div className="flex items-center space-x-4 ">
                                {/* Indicateur de statut futuriste */}
                                <div className="flex items-center space-x-2">
                                    <div className="w-3 h-3 bg-primary-500 rounded-full animate-pulse-neon"></div>
                                    <div className="w-2 h-2 bg-primary-600 rounded-full animate-pulse-neon" style={{ animationDelay: '0.5s' }}></div>
                                    <div className="w-1 h-1 bg-primary-400 rounded-full animate-pulse-neon" style={{ animationDelay: '1s' }}></div>
                                </div>

                                <Typography variant="h5" className="text-blanc-pur font-orbitron font-bold text-2xl tracking-[0.2em] uppercase relative">
                                    <span className="relative z-10">CAMPAGNES</span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-primary-300 bg-clip-text text-transparent animate-pulse-neon opacity-50"></div>
                                </Typography>

                                {/* Compteur futuriste */}
                                <div className="hidden md:flex items-center space-x-2 bg-noir-absolu/30 px-3 py-1 rounded-full backdrop-blur-sm border border-primary-500/30">
                                    <span className="text-xs font-orbitron text-primary-500">TOTAL:</span>
                                    <span className="text-sm font-bold text-blanc-pur font-mono">{totalItems}</span>
                                </div>
                            </div>

                            <div className="relative group">
                                <Link
                                    to="/dashboard/nouvelle/campagne"
                                    className="relative bg-gradient-to-r from-blanc-pur via-primary-100 to-blanc-pur text-noir-absolu px-8 py-3 rounded-lg font-poppins font-bold text-sm uppercase tracking-wider transition-all duration-500 hover:scale-105 shadow-lg hover:shadow-2xl group-hover:shadow-primary-500/50 border border-transparent hover:border-primary-500/50 overflow-hidden"
                                >
                                    <span className="relative z-10 flex items-center space-x-2">
                                        <span>+</span>
                                        <span>NOUVELLE CAMPAGNE</span>
                                    </span>

                                    {/* Effet de scan au hover */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-500/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                                    {/* Glow effect */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-primary-500/0 via-primary-500/20 to-primary-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
                                </Link>
                            </div>
                        </div>
                    </CardHeader>


                    {/* Barre de recherche ultra futuriste */}
                    <div className="px-8 py-6 bg-gradient-to-r from-blackcore-noir/50 via-slate-900/50 to-blackcore-noir/50 relative">

                        {/* Effet de grille en arrière-plan */}
                        <div className="absolute inset-0 opacity-5">
                            <div className="w-full h-full bg-gradient-to-r from-transparent via-blackcore-rouge/20 to-transparent"></div>
                        </div>

                        <form onSubmit={handleSearch} className="flex gap-6 relative z-10">
                            <div className="w-full relative group">
                                {/* Container avec effet de glow */}
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-blackcore-rouge via-blue-500 to-cyan-500 rounded-lg blur opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>

                                <div className="relative bg-blackcore-gris border border-blackcore-rouge/30 rounded-lg overflow-hidden">
                                    <Input
                                        type="text"
                                        label="Rechercher une campagne..."
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

                            <Button
                                type="submit"
                                className="relative bg-gradient-to-r from-blackcore-rouge via-blue-500 to-cyan-500 hover:from-cyan-500 hover:via-blue-500 hover:to-blackcore-rouge transition-all duration-500 font-poppins font-bold px-8 shadow-lg hover:shadow-2xl hover:shadow-blackcore-rouge/50 border-0 uppercase tracking-wider overflow-hidden group"
                            >
                                <span className="relative z-10">Rechercher</span>

                                {/* Effet de balayage */}
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
                            <Loading />
                        ) : (
                            <>
                                <table className="w-full min-w-[640px] table-auto relative z-10">
                                    <thead className="bg-gradient-to-r from-blackcore-noir via-slate-900 to-blackcore-noir relative">
                                        {/* Ligne de séparation lumineuse */}
                                        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blackcore-rouge to-transparent"></div>

                                        <tr>
                                            {columns.map((column, index) => (
                                                <th
                                                    key={column.key}
                                                    className="border-b border-blackcore-rouge/30 py-6 px-6 text-left cursor-pointer hover:bg-blackcore-rouge/5 transition-all duration-300 relative group"
                                                    onClick={() => column.key !== "actions" && handleSort(column.key)}
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
                                        {campagnes.length > 0 ? (
                                            campagnes.map(({ id, nom, poste, zone, tailleEntreprise, seniorite, langues, secteurs, statut }, key) => {
                                                const className = `py-5 px-6 ${key === campagnes.length - 1 ? "" : "border-b border-blackcore-rouge/20"
                                                    }`;

                                                return (
                                                    <tr
                                                        key={id}
                                                        className="hover:bg-gradient-to-r hover:from-blackcore-rouge/5 hover:via-blackcore-magenta/5 hover:to-cyan-500/5 cursor-pointer transition-all duration-500 group relative overflow-hidden"
                                                        onClick={() => handleCampaignClick(id)}
                                                    >

                                                        <td className={className}>
                                                            <div className="flex items-center gap-4 relative">
                                                                {/* Puce d'état */}
                                                                <div className="w-2 h-2 bg-blackcore-rouge rounded-full animate-pulse opacity-50 group-hover:opacity-100 transition-opacity duration-300"></div>

                                                                <div>
                                                                    <Typography
                                                                        variant="small"
                                                                        className="font-bold text-blackcore-blanc group-hover:text-blackcore-rouge transition-colors duration-300 font-poppins text-sm relative"
                                                                    >
                                                                        {nom}
                                                                        {/* Effet de glow sur hover */}
                                                                        <span className="absolute inset-0 text-blackcore-rouge opacity-0 group-hover:opacity-30 blur-sm transition-opacity duration-300">{nom}</span>
                                                                    </Typography>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className={className}>
                                                            <div className="group/cell relative">
                                                                <Typography className="text-sm font-medium text-blackcore-blanc/90 group-hover:text-blackcore-blanc transition-colors duration-300 font-inter truncate max-w-[200px]">
                                                                    {poste}
                                                                </Typography>

                                                                {/* Tooltip au survol si le texte est tronqué */}
                                                                <div className="absolute left-0 top-full mt-1 z-50 invisible group-hover/cell:visible opacity-0 group-hover/cell:opacity-100 transition-all duration-200">
                                                                    <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap max-w-xs">
                                                                        {poste}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className={className}>
                                                            <Typography className="text-sm font-medium text-blackcore-blanc/80 group-hover:text-blackcore-blanc transition-colors duration-300 font-inter">
                                                                {zone}
                                                            </Typography>
                                                        </td>
                                                        <td className={className}>
                                                            <div className="flex items-center space-x-2">
                                                                <div className="w-1 h-1 bg-cyan-400 rounded-full opacity-50"></div>
                                                                <Typography className="text-sm font-medium text-blackcore-blanc/80 group-hover:text-blackcore-blanc transition-colors duration-300 font-inter font-mono">
                                                                    {tailleEntreprise}
                                                                </Typography>
                                                            </div>
                                                        </td>

                                                        <td className={className}>
                                                            <div className="flex items-center space-x-2">
                                                                <div className="w-1 h-1 bg-cyan-400 rounded-full opacity-50"></div>
                                                                <Typography className="text-sm font-medium text-blackcore-blanc/80 group-hover:text-blackcore-blanc transition-colors duration-300 font-inter font-mono">
                                                                    {seniorite}
                                                                </Typography>
                                                            </div>
                                                        </td>
                                                        <td className={className}>
                                                            <Typography className="text-sm font-medium text-blackcore-blanc/80 group-hover:text-blackcore-blanc transition-colors duration-300 font-inter">
                                                                {langues}
                                                            </Typography>
                                                        </td>
                                                        <td className={className}>
                                                            <div className="group/cell relative">
                                                                <Typography className="text-sm font-medium text-blackcore-blanc/90 group-hover:text-blackcore-blanc transition-colors duration-300 font-inter truncate max-w-[200px]">
                                                                    {secteurs}
                                                                </Typography>

                                                                {/* Tooltip au survol si le texte est tronqué */}
                                                                <div className="absolute left-0 top-full mt-1 z-50 invisible group-hover/cell:visible opacity-0 group-hover/cell:opacity-100 transition-all duration-200">
                                                                    <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap max-w-xs">
                                                                        {secteurs}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className={className}>
                                                            <div className="relative">
                                                                <Chip
                                                                    variant="gradient"
                                                                    value={statut}
                                                                    className={`py-1.5 px-4 text-xs font-bold font-orbitron tracking-wider uppercase relative overflow-hidden ${statut === "Actif"
                                                                        ? "bg-gradient-to-r from-blackcore-rouge via-blue-500 to-cyan-400 text-blackcore-blanc shadow-lg shadow-blackcore-rouge/50"
                                                                        : "bg-gradient-to-r from-blackcore-noir to-slate-700 text-blackcore-blanc/70 border border-blackcore-blanc/20"
                                                                        }`}
                                                                />

                                                                {statut === "Actif" && (
                                                                    <>
                                                                        {/* Effet de pulsation pour les campagnes actives */}
                                                                        <div className="absolute inset-0 bg-gradient-to-r from-blackcore-rouge/50 to-blue-500/50 animate-pulse-slow rounded-full"></div>

                                                                        {/* Particules flottantes */}
                                                                        <div className="absolute -top-1 -right-1 w-1 h-1 bg-cyan-400 rounded-full animate-ping"></div>
                                                                    </>
                                                                )}
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
                                                                Aucune campagne détectée
                                                            </Typography>
                                                            <Typography variant="small" className="text-blackcore-blanc/50 font-poppins">
                                                                Le système n'a trouvé aucune donnée correspondant à vos critères
                                                            </Typography>
                                                        </div>

                                                        {/* Suggestion d'action */}
                                                        <div className="mt-6">
                                                            <Link
                                                                to="/dashboard/nouvelle/campagne"
                                                                className="inline-flex items-center space-x-2 bg-gradient-to-r from-blackcore-rouge to-blue-500 px-6 py-3 rounded-lg text-blackcore-blanc font-poppins font-semibold hover:scale-105 transition-transform duration-300 shadow-lg hover:shadow-blackcore-rouge/50"
                                                            >
                                                                <span>+</span>
                                                                <span>CRÉER LA PREMIÈRE CAMPAGNE</span>
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>

                                {/* Pagination ultra futuriste */}
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
                                                    Total: <span className="text-cyan-400 font-bold font-mono">{totalItems}</span> entrées
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
                                                    itemName="campagnes"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Statistiques additionnelles */}
                                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="bg-gradient-to-r from-blackcore-noir/60 via-slate-800/60 to-blackcore-noir/60 p-4 rounded-lg border border-blackcore-rouge/20 backdrop-blur-sm relative overflow-hidden group">
                                            <div className="absolute inset-0 bg-gradient-to-r from-blackcore-rouge/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                            <div className="relative z-10">
                                                <Typography className="text-xs font-orbitron text-blackcore-blanc/60 uppercase tracking-wider mb-1">
                                                    Campagnes actives
                                                </Typography>
                                                <Typography className="text-lg font-bold text-blackcore-rouge font-mono">
                                                    {campagnes.filter(c => c.statut === "Actif").length}
                                                </Typography>
                                            </div>
                                            <div className="absolute top-2 right-2 w-2 h-2 bg-blackcore-rouge rounded-full animate-pulse"></div>
                                        </div>

                                        <div className="bg-gradient-to-r from-blackcore-noir/60 via-slate-800/60 to-blackcore-noir/60 p-4 rounded-lg border border-blue-500/20 backdrop-blur-sm relative overflow-hidden group">
                                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                            <div className="relative z-10">
                                                <Typography className="text-xs font-orbitron text-blackcore-blanc/60 uppercase tracking-wider mb-1">
                                                    Affichage actuel
                                                </Typography>
                                                <Typography className="text-lg font-bold text-blue-500 font-mono">
                                                    {campagnes.length}/{limit}
                                                </Typography>
                                            </div>
                                            <div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                        </div>

                                        <div className="bg-gradient-to-r from-blackcore-noir/60 via-slate-800/60 to-blackcore-noir/60 p-4 rounded-lg border border-cyan-400/20 backdrop-blur-sm relative overflow-hidden group">
                                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                            <div className="relative z-10">
                                                <Typography className="text-xs font-orbitron text-blackcore-blanc/60 uppercase tracking-wider mb-1">
                                                    Tri appliqué
                                                </Typography>
                                                <Typography className="text-lg font-bold text-cyan-400 font-mono uppercase">
                                                    {sortBy} {sortOrder}
                                                </Typography>
                                            </div>
                                            <div className="absolute top-2 right-2 w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                                        </div>
                                    </div>
                                </div>
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
        </div>
    );
}

export default liste;
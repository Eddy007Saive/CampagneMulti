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
    EllipsisVerticalIcon,
    PencilIcon,
    TrashIcon,
    EnvelopeIcon,
    PhoneIcon,
    EyeIcon,
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
    getContacts,
    updateContactStatus,
    updateContactProfile,
    deleteContact
} from "@/services";
import { Link } from "react-router-dom";
import Pagination from "@/components/Pagination";
import { toast } from "react-toastify";
import toastify from "@/utils/toastify";
import Loading from "@/components/Loading";
import { useAuth } from "@/context/AuthContext";

export function listeContacts() {
    const [contacts, setContacts] = useState([]);
    const { user } = useAuth();
    const [filteredContacts, setFilteredContacts] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [profileFilter, setProfileFilter] = useState("");
    const [limit, setLimit] = useState(10);
    const [sortBy, setSortBy] = useState("Nom");
    const [sortOrder, setSortOrder] = useState("asc");

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [contactDetailsOpen, setContactDetailsOpen] = useState(false);
    const [selectedContact, setSelectedContact] = useState(null);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [updatingProfile, setUpdatingProfile] = useState({});

    const statusOptions = [
        { value: "", label: "Tous les statuts" },
        { value: "Non contacté", label: "Non contacté" },
        { value: "Message envoyé", label: "Message envoyé" },
        { value: "Répondu", label: "Réponse reçue" },
        { value: "À recontacter", label: "À recontacter" },
    ];

    const profileOptions = [
        { value: "", label: "Tous les profils" },
        { value: "GARDE", label: "Gardés" },
        { value: "En attente", label: "En attente" },
        { value: "REJETE", label: "Rejetés" },
    ];

    useEffect(() => {
        if (user) fetchData();
    }, [user, currentPage, limit, sortBy, sortOrder, statusFilter, profileFilter, search]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await getContacts({
                userId: user,
                page: currentPage,
                limit,
                search,
                sortBy,
                sortOrder,
                statusFilter,
                profileFilter
            });
            setContacts(response.data || []);
            setTotalItems(response.pagination?.totalRecords || 0);
            setTotalPages(response.pagination?.totalPages || 0);
        } catch (error) {
            console.error("Erreur lors du chargement des contacts:", error);
            setContacts([]);
            setTotalItems(0);
            setTotalPages(0);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchData();
    };

    const handlePageChange = (page) => setCurrentPage(page);
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
            await fetchData();
        } catch (error) {
            console.error("Erreur lors de la mise à jour du statut:", error);
        } finally {
            setUpdatingStatus(false);
        }
    };

    const handleProfileUpdate = async (contactId, newProfile) => {
        try {
            setUpdatingProfile(prev => ({ ...prev, [contactId]: true }));
            await updateContactProfile(contactId, newProfile);
            await fetchData();
            toastify.success("Profil mis à jour avec succès");
        } catch (error) {
            console.error("Erreur lors de la mise à jour du profil:", error);
        } finally {
            setUpdatingProfile(prev => ({ ...prev, [contactId]: false }));
        }
    };

    const handleDeleteContact = async () => {
        if (!selectedContact) return;
        try {
            await deleteContact(selectedContact.id);
            setDeleteDialogOpen(false);
            toastify.success("Contact supprimé avec succès");
            await fetchData();
        } catch (error) {
            console.error("Erreur lors de la suppression:", error);
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
            case "intéressé":
            case "rendez-vous pris":
                return "from-green-500 via-green-600 to-green-700";
            case "non intéressé":
                return "from-red-500 via-red-600 to-red-700";
            case "à relancer":
                return "from-orange-500 via-orange-600 to-orange-700";
            case "non contacté":
            default:
                return "from-gray-500 via-gray-600 to-gray-700";
        }
    };

    const getProfileColor = (profil) => {
        switch (profil) {
            case "GARDE":
                return "from-green-500 via-emerald-500 to-teal-400";
            case "En attente":
                return "from-yellow-500 via-amber-500 to-orange-400";
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

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        try {
            return new Date(dateString).toLocaleDateString("fr-FR", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            });
        } catch {
            return dateString;
        }
    };

    const columns = [
        { key: "nom", label: "Contact" },
        { key: "posteActuel", label: "Poste" },
        { key: "entrepriseActuelle", label: "Entreprise" },
        { key: "localisation", label: "Localisation" },
        { key: "statut", label: "Statut" },
        { key: "profil", label: "Profil" },
        { key: "dateMessage", label: "Dernier contact" },
        { key: "actions", label: "Actions" }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-noir-absolu via-bleu-fonce to-violet-plasma/20 text-blanc-pur font-inter">
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Header */}
                <Card className="bg-gradient-to-br from-cyan-500/20 via-bleu-neon/80 to-noir-absolu/90 border border-cyan-400/40 shadow-neon-cyan backdrop-blur-md mb-8">
                    <CardHeader className="flex items-center justify-between p-6 border-b border-cyan-400/30">
                        <div className="flex items-center gap-4">
                            <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse" />
                            <Typography variant="h5" className="text-blanc-pur font-orbitron font-bold uppercase tracking-widest">
                                Contacts
                            </Typography>
                            <Chip value={`Total: ${contacts.length}`} className="bg-cyan-400/20 text-cyan-300 border border-cyan-400/30" />
                        </div>
                        <Link to="/dashboard/nouveau/contact">
                            <Button className="bg-gradient-to-r from-cyan-400 via-bleu-neon to-cyan-400 text-noir-absolu font-bold flex items-center gap-2 hover:scale-105 transition-transform shadow-neon-cyan">
                                <UserPlusIcon className="h-4 w-4" />
                                Nouveau contact
                            </Button>
                        </Link>
                    </CardHeader>

                    {/* Filtres */}
                    <CardBody className="p-6">
                        <form onSubmit={(e) => { e.preventDefault(); fetchData(); }} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="relative group">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-400 to-bleu-neon rounded-lg blur opacity-0 group-hover:opacity-30 transition-opacity" />
                                <Input
                                    label="Rechercher..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="text-blanc-pur bg-noir-absolu/50 border border-cyan-400/30 rounded-lg"
                                    labelProps={{ className: "text-gris-clair" }}
                                />
                            </div>

                            <Select value={statusFilter} onChange={(v) => { setStatusFilter(v); setCurrentPage(1); }} label="Statut" className="text-blanc-pur">
                                {statusOptions.map((o) => (
                                    <Option key={o.value} value={o.value} className="text-blanc-pur bg-noir-absolu border border-cyan-400/30">
                                        {o.label}
                                    </Option>
                                ))}
                            </Select>

                            <Select value={profileFilter} onChange={(v) => { setProfileFilter(v); setCurrentPage(1); }} label="Profil" className="text-blanc-pur">
                                {profileOptions.map((o) => (
                                    <Option key={o.value} value={o.value} className="text-blanc-pur bg-noir-absolu border border-cyan-400/30">
                                        {o.label}
                                    </Option>
                                ))}
                            </Select>

                            <Button type="submit" className="bg-gradient-to-r from-cyan-400 via-bleu-neon to-cyan-400 text-noir-absolu font-bold hover:scale-105 transition-transform shadow-neon-cyan">
                                Rechercher
                            </Button>
                        </form>
                    </CardBody>
                </Card>

                {/* Table */}
                <Card className="bg-gradient-to-br from-bleu-fonce/80 to-noir-absolu/90 border border-bleu-neon/30  backdrop-blur-md">
                    <CardBody className="overflow-x-auto">
                        {loading ? (
                            <Loading />
                        ) : (
                            <table className="w-full min-w-[900px] table-auto">
                                <thead>
                                    <tr>
                                        {columns.map((col) => (
                                            <th
                                                key={col.key}
                                                className="border-b border-bleu-neon/30 py-4 px-6 text-left cursor-pointer hover:bg-bleu-neon/10 transition-all group"
                                                onClick={() => !["actions"].includes(col.key) && handleSort(col.key)}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Typography className="text-xs font-bold uppercase text-blanc-pur font-orbitron tracking-wider group-hover:text-bleu-neon">
                                                        {col.label}
                                                    </Typography>
                                                    {sortBy === col.key && <span className="text-bleu-neon">{sortOrder === "asc" ? "↑" : "↓"}</span>}
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {contacts.map((contact, i) => (
                                        <tr
                                            key={contact.id || i}
                                            className="border-b border-bleu-neon/20 hover:bg-bleu-neon/10 transition-all group relative overflow-hidden"
                                        >
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-4">
                                                    <Avatar
                                                        src={contact.image}
                                                        alt={contact.nom}
                                                        size="sm"
                                                        className="border border-bleu-neon/30"
                                                    />
                                                    <div>
                                                        <Typography className="font-bold text-blanc-pur">{contact.nom || "N/A"}</Typography>
                                                        <div className="flex items-center gap-2 text-xs text-gris-clair">
                                                            {contact.email && <EnvelopeIcon className="h-3 w-3 text-bleu-neon" />}
                                                            {contact.telephone && <PhoneIcon className="h-3 w-3 text-vert-plasma" />}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <Typography className="text-sm text-blanc-pur">{contact.posteActuel || "N/A"}</Typography>
                                            </td>
                                            <td className="py-4 px-6">
                                                <Typography className="text-sm text-blanc-pur">{contact.entrepriseActuelle || "N/A"}</Typography>
                                            </td>
                                            <td className="py-4 px-6">
                                                <Typography className="text-sm text-blanc-pur">{contact.localisation || "N/A"}</Typography>
                                            </td>
                                            <td className="py-4 px-6">
                                                <Menu>
                                                    <MenuHandler>
                                                        <Chip
                                                            variant="gradient"
                                                            value={contact.statut || "Non contacté"}
                                                            className={`text-[10px] font-bold bg-gradient-to-r ${getStatusColor(contact.statut)} text-noir-absolu border border-bleu-neon/30`}
                                                        />
                                                    </MenuHandler>
                                                    <MenuList className="bg-noir-absolu border border-bleu-neon/30">
                                                        {statusOptions.slice(1).map((s) => (
                                                            <MenuItem
                                                                key={s.value}
                                                                onClick={() => handleStatusUpdate(contact.ID_CONTACT, s.value)}
                                                                className="text-blanc-pur hover:bg-bleu-neon/20"
                                                            >
                                                                {s.label}
                                                            </MenuItem>
                                                        ))}
                                                    </MenuList>
                                                </Menu>
                                            </td>
                                            <td className="py-4 px-6">
                                                <Chip
                                                    variant="gradient"
                                                    value={
                                                        <div className="flex items-center gap-1.5">
                                                            {getProfileIcon(contact.profil)}
                                                            <span className="font-orbitron text-xs">
                                                                {contact.profil === "GARDE" ? "GARDÉ" :
                                                                    contact.profil === "REJETE" ? "REJETÉ" :
                                                                        contact.profil === "En attente" ? "ATTENTE" : "NON QUALIFIÉ"}
                                                            </span>
                                                        </div>
                                                    }
                                                    className={`text-[10px] font-bold bg-gradient-to-r ${getProfileColor(contact.profil)} text-noir-absolu border border-bleu-neon/30`}
                                                />
                                            </td>
                                            <td className="py-4 px-6">
                                                <Typography className="text-xs text-gris-clair font-mono">
                                                    {contact.dateMessage
                                                        ? new Date(contact.dateMessage).toLocaleDateString("fr-FR")
                                                        : contact.dateCreation
                                                            ? new Date(contact.dateCreation).toLocaleDateString("fr-FR")
                                                            : "N/A"}
                                                </Typography>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-2">
                                                    <Tooltip content="Voir les détails">
                                                        <IconButton
                                                            size="sm"
                                                            onClick={() => handleViewContact(contact)}
                                                            className="text-bleu-neon hover:bg-bleu-neon/20 border border-bleu-neon/30"
                                                        >
                                                            <EyeIcon className="h-4 w-4" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    {contact.url && (
                                                        <Tooltip content="Voir le profil LinkedIn">
                                                            <IconButton
                                                                size="sm"
                                                                onClick={() => window.open(contact.url, "_blank", "noopener,noreferrer")}
                                                                className="text-vert-plasma hover:bg-vert-plasma/20 border border-vert-plasma/30"
                                                            >
                                                                <LinkIcon className="h-4 w-4" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}
                                                    <Menu>
                                                        <MenuHandler>
                                                            <IconButton size="sm" className="text-gris-clair hover:bg-bleu-neon/20 border border-bleu-neon/30">
                                                                <EllipsisVerticalIcon className="h-4 w-4" />
                                                            </IconButton>
                                                        </MenuHandler>
                                                        <MenuList className="bg-noir-absolu border border-bleu-neon/30">
                                                            <MenuItem as={Link} to={`/dashboard/contact/edit/${contact.ID_CONTACT}`} className="text-blanc-pur hover:bg-bleu-neon/20">
                                                                <PencilIcon className="h-4 w-4 mr-2" />
                                                                Modifier
                                                            </MenuItem>
                                                            <MenuItem
                                                                onClick={() => {
                                                                    setSelectedContact(contact);
                                                                    setDeleteDialogOpen(true);
                                                                }}
                                                                className="text-rouge-danger hover:bg-rouge-danger/20"
                                                            >
                                                                <TrashIcon className="h-4 w-4 mr-2" />
                                                                Supprimer
                                                            </MenuItem>
                                                        </MenuList>
                                                    </Menu>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}

                                    {contacts.length === 0 && (
                                        <tr>
                                            <td colSpan={columns.length} className="py-16 text-center">
                                                <div className="flex flex-col items-center gap-4">
                                                    <div className="relative w-20 h-20 border-2 border-bleu-neon/30 rounded-full flex items-center justify-center">
                                                        <div className="w-12 h-12 border border-bleu-neon/50 rounded-full flex items-center justify-center">
                                                            <span className="text-bleu-neon font-bold">?</span>
                                                        </div>
                                                        <div className="absolute inset-0 border-2 border-transparent border-t-bleu-neon rounded-full animate-spin" />
                                                    </div>
                                                    <Typography className="text-blanc-pur font-orbitron">Aucun contact trouvé</Typography>
                                                    <Typography className="text-gris-clair text-sm">Ajustez vos filtres ou ajoutez un nouveau contact.</Typography>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                totalItems={totalItems}
                                limit={limit}
                                onPageChange={handlePageChange}
                                onLimitChange={handleLimitChange}
                                itemName="contacts"
                            />
                        )}
                    </CardBody>
                </Card>

                {/* Dialog détails contact */}
                <Dialog open={contactDetailsOpen} handler={() => setContactDetailsOpen(false)} size="lg" className="max-h-[90vh] overflow-y-auto">
                    <DialogHeader className="flex items-center justify-between border-b border-bleu-neon/20 pb-4">
                        <div className="flex items-center gap-4">
                            <Avatar src={selectedContact?.image} alt={selectedContact?.nom} size="md" className="border border-bleu-neon/30" />
                            <div>
                                <Typography variant="h6" className="text-blanc-pur">{selectedContact?.nom || "Contact"}</Typography>
                                <Typography variant="small" className="text-gris-clair">{selectedContact?.posteActuel || "Poste non renseigné"}</Typography>
                            </div>
                        </div>
                        <IconButton variant="text" onClick={() => setContactDetailsOpen(false)} className="text-gris-clair">
                            <XMarkIcon className="h-5 w-5" />
                        </IconButton>
                    </DialogHeader>

                    <DialogBody className="p-6 space-y-6">
                        {selectedContact && (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 bg-gradient-to-br from-bleu-fonce/50 to-noir-absolu/80 border border-bleu-neon/30 rounded-lg">
                                        <Typography variant="small" className="text-gris-clair">Email</Typography>
                                        <Typography className="text-blanc-pur">{selectedContact.email || "N/A"}</Typography>
                                    </div>
                                    <div className="p-4 bg-gradient-to-br from-bleu-fonce/50 to-noir-absolu/80 border border-bleu-neon/30 rounded-lg">
                                        <Typography variant="small" className="text-gris-clair">Téléphone</Typography>
                                        <Typography className="text-blanc-pur">{selectedContact.telephone || "N/A"}</Typography>
                                    </div>
                                    <div className="p-4 bg-gradient-to-br from-bleu-fonce/50 to-noir-absolu/80 border border-bleu-neon/30 rounded-lg">
                                        <Typography variant="small" className="text-gris-clair">Entreprise</Typography>
                                        <Typography className="text-blanc-pur">{selectedContact.entrepriseActuelle || "N/A"}</Typography>
                                    </div>
                                    <div className="p-4 bg-gradient-to-br from-bleu-fonce/50 to-noir-absolu/80 border border-bleu-neon/30 rounded-lg">
                                        <Typography variant="small" className="text-gris-clair">Localisation</Typography>
                                        <Typography className="text-blanc-pur">{selectedContact.localisation || "N/A"}</Typography>
                                    </div>
                                </div>

                                {selectedContact.messagePersonnalise && (
                                    <div className="p-4 bg-gradient-to-br from-bleu-fonce/50 to-noir-absolu/80 border border-bleu-neon/30 rounded-lg">
                                        <Typography variant="small" className="text-gris-clair mb-2">Message personnalisé</Typography>
                                        <Typography className="text-blanc-pur text-sm whitespace-pre-wrap">{selectedContact.messagePersonnalise}</Typography>
                                    </div>
                                )}

                                {selectedContact.url && (
                                    <div className="p-4 bg-gradient-to-br from-bleu-fonce/50 to-noir-absolu/80 border border-bleu-neon/30 rounded-lg">
                                        <Typography variant="small" className="text-gris-clair mb-2">LinkedIn</Typography>
                                        <a href={selectedContact.url} target="_blank" rel="noopener noreferrer" className="text-bleu-neon underline">
                                            Voir le profil
                                        </a>
                                    </div>
                                )}
                            </>
                        )}
                    </DialogBody>

                    <DialogFooter className="border-t border-bleu-neon/20 pt-4">
                        <div className="flex justify-between w-full">
                            <div className="flex gap-2">
                                {selectedContact?.url && (
                                    <Button variant="outlined" color="blue" size="sm" onClick={() => window.open(selectedContact.url, "_blank")}>
                                        <LinkIcon className="h-4 w-4 mr-2" />
                                        LinkedIn
                                    </Button>
                                )}
                                {selectedContact?.email && (
                                    <Button variant="outlined" color="green" size="sm" onClick={() => window.location.href = `mailto:${selectedContact.email}`}>
                                        <EnvelopeIcon className="h-4 w-4 mr-2" />
                                        Email
                                    </Button>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outlined" color="blue-gray" onClick={() => setContactDetailsOpen(false)}>
                                    Fermer
                                </Button>
                                <Button color="blue" as={Link} to={`/dashboard/contact/edit/${selectedContact?.ID_CONTACT}`}>
                                    <PencilIcon className="h-4 w-4 mr-2" />
                                    Modifier
                                </Button>
                            </div>
                        </div>
                    </DialogFooter>
                </Dialog>

                {/* Dialog suppression */}
                <Dialog open={deleteDialogOpen} handler={() => setDeleteDialogOpen(false)} size="sm">
                    <DialogHeader className="text-rouge-danger border-b border-rouge-danger/30">
                        Confirmer la suppression
                    </DialogHeader>
                    <DialogBody>
                        <Typography className="text-blanc-pur">
                            Êtes-vous sûr de vouloir supprimer le contact <strong className="text-bleu-neon">{selectedContact?.nom}</strong> ? Cette action est irréversible.
                        </Typography>
                    </DialogBody>
                    <DialogFooter className="border-t border-rouge-danger/30">
                        <Button variant="text" color="blue-gray" onClick={() => setDeleteDialogOpen(false)}>
                            Annuler
                        </Button>
                        <Button variant="filled" color="red" onClick={handleDeleteContact}>
                            Supprimer
                        </Button>
                    </DialogFooter>
                </Dialog>
            </div>
        </div>
    );
}

export default listeContacts;
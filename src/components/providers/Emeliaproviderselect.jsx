import { useState } from "react";
import { HelpCircle, Loader2, RefreshCw, AlertCircle, Plus } from "lucide-react";
import Tooltips from "../ui/Tooltips";
import { AddProviderModal } from "./AddProviders";

// ─── Sous-composant : sélecteur de provider réutilisable ───
const EmeliaProviderSelect = ({
    formData,
    setFormData,
    emeliaProviders,
    emeliaProvidersLoading,
    fetchEmeliaProviders,
    stepValidationErrors,
    accentColor = "blue",
}) => {
    const [showAddModal, setShowAddModal] = useState(false);

    const ringColor = accentColor === "blue" ? "focus:ring-blue-500" : "focus:ring-green-500";

    return (
        <div className="mb-6">
            {/* ─── Label + bouton Ajouter ─── */}
            {/* <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-gray-400">
                    Compte expéditeur *
                    <Tooltips content="Adresse email depuis laquelle les emails seront envoyés">
                        <HelpCircle size={14} className="ml-1 inline text-gray-500 cursor-help" />
                    </Tooltips>
                </label>
                <button
                    type="button"
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                    <Plus size={12} />
                    Ajouter un expéditeur
                </button>
            </div> */}

            {/* ─── Select ou états vides ─── */}
            {emeliaProvidersLoading ? (
                <div className="flex items-center gap-2 text-gray-400 text-sm py-3">
                    <Loader2 size={14} className="animate-spin" />
                    Chargement des expéditeurs...
                </div>
            ) : emeliaProviders.length > 0 ? (
                <>
                    <select
                        value={formData.emeliaProviderId || ""}
                        onChange={(e) =>
                            setFormData((prev) => ({ ...prev, emeliaProviderId: e.target.value }))
                        }
                        className={`w-full p-3 bg-gray-700 border rounded-lg text-white focus:ring-2 ${ringColor} ${
                            stepValidationErrors?.emeliaProviderId ? "border-red-500" : "border-gray-600"
                        }`}
                    >
                        <option value="">-- Sélectionner un expéditeur --</option>
                        {emeliaProviders.map((provider) => (
                            <option key={provider._id} value={provider._id}>
                                {provider.senderName} — {provider.senderEmail}
                            </option>
                        ))}
                    </select>
                    <button
                        type="button"
                        onClick={fetchEmeliaProviders}
                        disabled={emeliaProvidersLoading}
                        className="mt-2 text-blue-400 hover:text-blue-300 text-xs flex items-center gap-1 disabled:opacity-50"
                    >
                        <RefreshCw size={12} className={emeliaProvidersLoading ? "animate-spin" : ""} />
                        Rafraîchir la liste
                    </button>
                </>
            ) : (
                <div className="flex items-center gap-3">
                    <p className="text-yellow-400 text-sm">Aucun expéditeur trouvé dans votre compte Emelia.</p>
                    <button
                        type="button"
                        onClick={fetchEmeliaProviders}
                        disabled={emeliaProvidersLoading}
                        className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1 disabled:opacity-50"
                    >
                        <RefreshCw size={14} className={emeliaProvidersLoading ? "animate-spin" : ""} />
                        Réessayer
                    </button>
                </div>
            )}

            {/* ─── Erreur validation ─── */}
            {stepValidationErrors?.emeliaProviderId && (
                <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle size={12} />
                    {stepValidationErrors.emeliaProviderId}
                </p>
            )}

            {/* ─── Modal ajout provider ─── */}
            <AddProviderModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSuccess={(newProvider) => {
                    // Rafraîchir la liste puis sélectionner automatiquement le nouveau
                    fetchEmeliaProviders();
                    setFormData((prev) => ({ ...prev, emeliaProviderId: newProvider._id }));
                    setShowAddModal(false);
                }}
            />
        </div>
    );
};

export default EmeliaProviderSelect;
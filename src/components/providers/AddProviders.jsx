import React, { useState } from "react";
import {
    X,
    Loader2,
    Check,
    AlertCircle,
    Mail,
    Server,
    Eye,
    EyeOff
} from "lucide-react";
import * as emeliaService from "@/services/Emelia";
import toastify from "@/utils/toastify";

const EMAIL_TYPES = [
    { value: "GOOGLE", label: "Google (OAuth)", description: "Gmail via OAuth" },
    { value: "GOOGLEIMAP", label: "Google (IMAP)", description: "Gmail via IMAP" },
    { value: "OFFICE", label: "Office 365", description: "Microsoft Office 365" },
    { value: "EXCHANGE", label: "Exchange", description: "Microsoft Exchange" },
    { value: "SMTP", label: "SMTP personnalisé", description: "Tout autre serveur SMTP" },
];

const getEmptyForm = () => ({
    senderName: "",
    senderEmail: "",
    senderPassword: "",
    emailType: "GOOGLE",
    signature: "",
    smtp: {
        login: "",
        password: "",
        server: "",
        port: 587,
        ssl: true
    },
    imap: {
        login: "",
        password: "",
        server: "",
        port: 993,
        ssl: true
    }
});

/**
 * Modal d'ajout d'un provider Emelia
 * @param {boolean} isOpen
 * @param {function} onClose
 * @param {function} onSuccess - appelé avec le nouveau provider créé
 */
export const AddProviderModal = ({ isOpen, onClose, onSuccess }) => {
    const [form, setForm] = useState(getEmptyForm());
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showSmtpPassword, setShowSmtpPassword] = useState(false);
    const [errors, setErrors] = useState({});

    if (!isOpen) return null;

    const isSmtp = form.emailType === "SMTP";
    const needsPassword = ["GOOGLEIMAP", "OFFICE", "EXCHANGE", "SMTP"].includes(form.emailType);

    const set = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => { const e = { ...prev }; delete e[field]; return e; });
    };

    const setSmtp = (field, value) => {
        setForm(prev => ({ ...prev, smtp: { ...prev.smtp, [field]: value } }));
    };

    const setImap = (field, value) => {
        setForm(prev => ({ ...prev, imap: { ...prev.imap, [field]: value } }));
    };

    const validate = () => {
        const e = {};
        if (!form.senderName.trim()) e.senderName = "Nom requis";
        if (!form.senderEmail.trim()) e.senderEmail = "Email requis";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.senderEmail)) e.senderEmail = "Email invalide";
        if (needsPassword && !form.senderPassword.trim()) e.senderPassword = "Mot de passe requis";
        if (isSmtp) {
            if (!form.smtp.server.trim()) e.smtpServer = "Serveur SMTP requis";
            if (!form.smtp.login.trim()) e.smtpLogin = "Login SMTP requis";
            if (!form.smtp.password.trim()) e.smtpPassword = "Mot de passe SMTP requis";
        }
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setIsSubmitting(true);
        try {
            const payload = {
                senderName: form.senderName.trim(),
                senderEmail: form.senderEmail.trim(),
                senderPassword: needsPassword ? form.senderPassword : null,
                emailType: form.emailType,
                signature: form.signature.trim() || "",
            };

            if (isSmtp) {
                payload.smtp = {
                    login: form.smtp.login,
                    password: form.smtp.password,
                    server: form.smtp.server,
                    port: parseInt(form.smtp.port) || 587,
                    ssl: form.smtp.ssl
                };
            }

            // IMAP optionnel si rempli
            if (form.imap.server.trim()) {
                payload.imap = {
                    login: form.imap.login || form.senderEmail,
                    password: form.imap.password || form.senderPassword,
                    server: form.imap.server,
                    port: parseInt(form.imap.port) || 993,
                    ssl: form.imap.ssl
                };
            }

            const result = await emeliaService.addEmailProviders(payload);
            toastify.success("Expéditeur ajouté avec succès !");
            onSuccess(result);
            handleClose();
        } catch (error) {
            console.error("Erreur ajout provider:", error);
            toastify.error(error.message || "Impossible d'ajouter l'expéditeur");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setForm(getEmptyForm());
        setErrors({});
        setShowPassword(false);
        setShowSmtpPassword(false);
        onClose();
    };

    return (
        // ─── Overlay ───
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* ─── Modal ─── */}
            <div className="relative z-10 w-full max-w-xl bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700 bg-gray-800/50">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                            <Mail size={16} className="text-white" />
                        </div>
                        <div>
                            <h3 className="text-white font-semibold">Ajouter un expéditeur</h3>
                            <p className="text-gray-400 text-xs">Compte email Emelia</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body — scrollable */}
                <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">

                    {/* Type d'email */}
                    <div>
                        <label className="text-sm text-gray-400 mb-2 block">Type de compte *</label>
                        <div className="grid grid-cols-1 gap-2">
                            {EMAIL_TYPES.map(type => (
                                <button
                                    key={type.value}
                                    type="button"
                                    onClick={() => set("emailType", type.value)}
                                    className={`flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all ${
                                        form.emailType === type.value
                                            ? "border-blue-500 bg-blue-900/20"
                                            : "border-gray-700 hover:border-gray-500"
                                    }`}
                                >
                                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                        form.emailType === type.value ? "border-blue-500" : "border-gray-500"
                                    }`}>
                                        {form.emailType === type.value && (
                                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                                        )}
                                    </div>
                                    <div>
                                        <span className="text-white text-sm font-medium">{type.label}</span>
                                        <span className="text-gray-400 text-xs ml-2">— {type.description}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Nom + Email */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm text-gray-400 mb-2 block">Nom affiché *</label>
                            <input
                                type="text"
                                value={form.senderName}
                                onChange={e => set("senderName", e.target.value)}
                                placeholder="Jean Dupont"
                                className={`w-full p-3 bg-gray-800 border rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder-gray-500 ${
                                    errors.senderName ? "border-red-500" : "border-gray-600"
                                }`}
                            />
                            {errors.senderName && (
                                <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                                    <AlertCircle size={11} />{errors.senderName}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="text-sm text-gray-400 mb-2 block">Email *</label>
                            <input
                                type="email"
                                value={form.senderEmail}
                                onChange={e => set("senderEmail", e.target.value)}
                                placeholder="jean@exemple.com"
                                className={`w-full p-3 bg-gray-800 border rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder-gray-500 ${
                                    errors.senderEmail ? "border-red-500" : "border-gray-600"
                                }`}
                            />
                            {errors.senderEmail && (
                                <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                                    <AlertCircle size={11} />{errors.senderEmail}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Mot de passe (si nécessaire) */}
                    {needsPassword && (
                        <div>
                            <label className="text-sm text-gray-400 mb-2 block">
                                {form.emailType === "GOOGLE" ? "Mot de passe d'application *" : "Mot de passe *"}
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={form.senderPassword}
                                    onChange={e => set("senderPassword", e.target.value)}
                                    placeholder="••••••••••••"
                                    className={`w-full p-3 pr-10 bg-gray-800 border rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder-gray-500 ${
                                        errors.senderPassword ? "border-red-500" : "border-gray-600"
                                    }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(v => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {errors.senderPassword && (
                                <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                                    <AlertCircle size={11} />{errors.senderPassword}
                                </p>
                            )}

                            {/* ─── Aide Gmail ─── */}
                            {["GOOGLE", "GOOGLEIMAP"].includes(form.emailType) && (
                                <div className="mt-3 p-3 bg-blue-900/20 border border-blue-600/40 rounded-lg space-y-2">
                                    <p className="text-blue-300 text-xs font-semibold flex items-center gap-1.5">
                                        💡 Comment obtenir un mot de passe d'application Google
                                    </p>
                                    <div className="space-y-2 text-xs text-blue-200/80">
                                        <div>
                                            <p className="font-medium text-blue-300 mb-0.5">I. Activer la double authentification</p>
                                            <ol className="list-decimal list-inside space-y-0.5 pl-1">
                                                <li>Allez sur{" "}
                                                    <a
                                                        href="https://myaccount.google.com/signinoptions/two-step-verification"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-400 underline hover:text-blue-300"
                                                    >
                                                        myaccount.google.com
                                                    </a>
                                                </li>
                                                <li>Vérifiez que vous êtes sur le bon compte Google</li>
                                                <li>Activez la validation en deux étapes</li>
                                            </ol>
                                        </div>
                                        <div>
                                            <p className="font-medium text-blue-300 mb-0.5">II. Créer le mot de passe d'application</p>
                                            <ol className="list-decimal list-inside space-y-0.5 pl-1">
                                                <li>Rendez-vous sur{" "}
                                                    <a
                                                        href="https://myaccount.google.com/apppasswords"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-400 underline hover:text-blue-300"
                                                    >
                                                        myaccount.google.com/apppasswords
                                                    </a>
                                                </li>
                                                <li>Utilisez ce mot de passe d'application dans le champ ci-dessus</li>
                                            </ol>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Config SMTP (si SMTP) */}
                    {isSmtp && (
                        <div className="p-4 bg-gray-800/60 border border-gray-600 rounded-xl space-y-4">
                            <div className="flex items-center gap-2 mb-1">
                                <Server size={14} className="text-blue-400" />
                                <span className="text-sm text-white font-medium">Configuration SMTP</span>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="col-span-2">
                                    <label className="text-xs text-gray-400 mb-1 block">Serveur *</label>
                                    <input
                                        type="text"
                                        value={form.smtp.server}
                                        onChange={e => setSmtp("server", e.target.value)}
                                        placeholder="smtp.exemple.com"
                                        className={`w-full p-2.5 bg-gray-900 border rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder-gray-500 ${
                                            errors.smtpServer ? "border-red-500" : "border-gray-600"
                                        }`}
                                    />
                                    {errors.smtpServer && (
                                        <p className="text-red-400 text-xs mt-1">{errors.smtpServer}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 mb-1 block">Login *</label>
                                    <input
                                        type="text"
                                        value={form.smtp.login}
                                        onChange={e => setSmtp("login", e.target.value)}
                                        placeholder="login@exemple.com"
                                        className={`w-full p-2.5 bg-gray-900 border rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder-gray-500 ${
                                            errors.smtpLogin ? "border-red-500" : "border-gray-600"
                                        }`}
                                    />
                                    {errors.smtpLogin && (
                                        <p className="text-red-400 text-xs mt-1">{errors.smtpLogin}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 mb-1 block">Mot de passe *</label>
                                    <div className="relative">
                                        <input
                                            type={showSmtpPassword ? "text" : "password"}
                                            value={form.smtp.password}
                                            onChange={e => setSmtp("password", e.target.value)}
                                            placeholder="••••••••"
                                            className={`w-full p-2.5 pr-9 bg-gray-900 border rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder-gray-500 ${
                                                errors.smtpPassword ? "border-red-500" : "border-gray-600"
                                            }`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowSmtpPassword(v => !v)}
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                                        >
                                            {showSmtpPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                        </button>
                                    </div>
                                    {errors.smtpPassword && (
                                        <p className="text-red-400 text-xs mt-1">{errors.smtpPassword}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 mb-1 block">Port</label>
                                    <input
                                        type="number"
                                        value={form.smtp.port}
                                        onChange={e => setSmtp("port", e.target.value)}
                                        className="w-full p-2.5 bg-gray-900 border border-gray-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    />
                                </div>
                                <div className="flex items-center gap-2 pt-5">
                                    <input
                                        type="checkbox"
                                        id="smtpSsl"
                                        checked={form.smtp.ssl}
                                        onChange={e => setSmtp("ssl", e.target.checked)}
                                        className="w-4 h-4 rounded border-gray-600 text-blue-600 bg-gray-700"
                                    />
                                    <label htmlFor="smtpSsl" className="text-sm text-white cursor-pointer">SSL activé</label>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Signature (optionnel) */}
                    <div>
                        <label className="text-sm text-gray-400 mb-2 block">Signature (optionnel)</label>
                        <textarea
                            value={form.signature}
                            onChange={e => set("signature", e.target.value)}
                            rows={3}
                            placeholder="Cordialement,&#10;Jean Dupont"
                            className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none placeholder-gray-500"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-700 bg-gray-800/30">
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={isSubmitting}
                        className="px-4 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
                    >
                        Annuler
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 size={15} className="animate-spin" />
                                Ajout en cours...
                            </>
                        ) : (
                            <>
                                <Check size={15} />
                                Ajouter l'expéditeur
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
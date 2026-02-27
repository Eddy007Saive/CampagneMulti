import React, { useState } from "react";
import {
  BookOpenIcon,
  UserPlusIcon,
  EnvelopeIcon,
  ChartBarIcon,
  CogIcon,
  PlayIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  UserGroupIcon,
  BellIcon,
  DocumentTextIcon
} from "@heroicons/react/24/outline";

export function UserGuideInterface() {
  const [activeSection, setActiveSection] = useState("overview");

  const sections = [
    { id: "overview", title: "Vue d'ensemble", icon: BookOpenIcon },
    { id: "settings", title: "Configuration (OBLIGATOIRE)", icon: CogIcon },
    { id: "campaigns", title: "Création de campagnes", icon: EnvelopeIcon },
    { id: "contacts", title: "Gestion des contacts", icon: UserGroupIcon },
    { id: "analytics", title: "Statistiques & Analyses", icon: ChartBarIcon }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return (
          <div className="space-y-8">
            <div className="bg-gradient-to-r from-bleu-fonce/20 to-violet-plasma/10 rounded-xl p-6 border border-bleu-neon/30 shadow-neon-subtle">
              <h2 className="text-2xl font-bold text-blanc-pur mb-4 flex items-center gap-3">
                <BookOpenIcon className="h-8 w-8 text-bleu-neon animate-glow" />
                Bienvenue dans votre application de prospection intelligente
              </h2>
              <p className="text-blanc-pur leading-relaxed">
                Cette application automatise votre prospection en collectant des profils, en générant des messages personnalisés via IA et en gérant vos campagnes de manière intelligente. Suivez ce guide pour configurer et optimiser votre prospection automatisée.
              </p>
            </div>

            <div className="bg-gradient-to-r from-rouge-danger/10 to-orange-vif/5 rounded-xl p-6 border border-rouge-danger/30">
              <div className="flex items-start gap-3">
                <ExclamationTriangleIcon className="h-6 w-6 text-rouge-danger flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-rouge-danger mb-2">Configuration obligatoire avant utilisation</h3>
                  <p className="text-blanc-pur text-sm">
                    Avant de créer vos premières campagnes, vous DEVEZ impérativement configurer votre application avec vos paramètres de connexion pour éviter la détection et assurer le bon fonctionnement.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-blanc-pur mb-6">Fonctionnalités de l'application</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    icon: CogIcon,
                    title: "Collecte automatisée de profils",
                    description: "Extraction automatique de profils selon vos critères de recherche avec protection anti-détection."
                  },
                  {
                    icon: UserGroupIcon,
                    title: "Génération IA de messages",
                    description: "Messages personnalisés automatiquement générés par IA selon vos directives et le profil de chaque prospect."
                  },
                  {
                    icon: EnvelopeIcon,
                    title: "Campagnes intelligentes",
                    description: "Gestion automatisée des campagnes avec tri intelligent des profils et enrichissement des données."
                  },
                  {
                    icon: ChartBarIcon,
                    title: "Suivi et notifications",
                    description: "Notifications par email à chaque étape et analytics détaillées de vos campagnes."
                  }
                ].map((f, i) => (
                  <div key={i} className="bg-gradient-to-br from-bleu-fonce/30 to-noir-absolu/50 border border-bleu-neon/20 rounded-lg p-5 shadow-neon-subtle hover:border-violet-plasma/40 transition-all">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-gradient-primary rounded-lg">
                        <f.icon className="h-6 w-6 text-noir-absolu" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-blanc-pur mb-2">{f.title}</h4>
                        <p className="text-blanc-pur text-sm">{f.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case "settings":
        return (
          <div className="space-y-8">
            <div className="bg-gradient-to-r from-rouge-danger/10 to-orange-vif/5 rounded-xl p-6 border border-rouge-danger/30">
              <h2 className="text-2xl font-bold text-blanc-pur mb-4 flex items-center gap-3">
                <CogIcon className="h-8 w-8 text-rouge-danger animate-glow" />
                Configuration obligatoire du système
              </h2>
              <p className="text-blanc-pur">
                Cette configuration est OBLIGATOIRE avant toute utilisation de l'application !
              </p>
            </div>

            <div className="bg-gradient-to-br from-bleu-fonce/30 to-noir-absolu/50 border border-bleu-neon/20 rounded-xl p-6 shadow-neon-subtle">
              <h3 className="text-lg font-semibold text-blanc-pur mb-4">1. Configuration des cookies de connexion</h3>
              <p className="text-blanc-pur text-sm mb-4">
                Les cookies permettent à l'application de s'authentifier et d'accéder aux profils sans être bloquée.
              </p>
              <div className="bg-noir-absolu/50 border border-bleu-neon/30 rounded-lg p-4">
                <p className="text-bleu-neon text-sm">→ Connectez-vous à la plateforme → Ouvrez les dev tools → Copiez tous les cookies → Collez-les dans le champ dédié.</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-bleu-fonce/30 to-noir-absolu/50 border border-bleu-neon/20 rounded-xl p-6 shadow-neon-subtle">
              <h3 className="text-lg font-semibold text-blanc-pur mb-4">2. Configuration du User-Agent</h3>
              <p className="text-blanc-pur text-sm mb-4">
                Un User-Agent incorrect peut signaler que vous utilisez un bot automatisé.
              </p>
              <div className="bg-noir-absolu/50 border border-bleu-neon/30 rounded-lg p-4">
                <p className="text-bleu-neon text-sm">→ Allez sur whatismyuseragent.com → Copiez la chaîne → Collez-la dans le champ.</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-bleu-fonce/30 to-noir-absolu/50 border border-bleu-neon/20 rounded-xl p-6 shadow-neon-subtle">
              <h3 className="text-lg font-semibold text-blanc-pur mb-4">3. Configuration des notifications par email</h3>
              <p className="text-blanc-pur text-sm mb-4">
                Recevez des notifications à chaque étape importante de vos campagnes.
              </p>
              <ul className="list-disc list-inside text-blanc-pur text-sm space-y-1">
                <li>Début de collecte</li>
                <li>Fin de collecte quotidienne</li>
                <li>Messages générés</li>
                <li>Rapport quotidien</li>
              </ul>
            </div>
          </div>
        );
      case "campaigns":
        return (
          <div className="space-y-8">
            <div className="bg-gradient-to-r from-violet-plasma/10 to-bleu-neon/5 rounded-xl p-6 border border-violet-plasma/30">
              <h2 className="text-2xl font-bold text-blanc-pur mb-4 flex items-center gap-3">
                <EnvelopeIcon className="h-8 w-8 text-violet-plasma animate-glow" />
                Création et gestion des campagnes
              </h2>
              <p className="text-blanc-pur">
                Créez votre première campagne de prospection en définissant vos critères et messages personnalisés.
              </p>
            </div>

            <div className="bg-gradient-to-br from-bleu-fonce/30 to-noir-absolu/50 border border-bleu-neon/20 rounded-xl p-6 shadow-neon-subtle">
              <h3 className="text-lg font-semibold text-blanc-pur mb-4">1. Nom de la campagne (unique)</h3>
              <p className="text-blanc-pur text-sm mb-3">Choisissez un nom unique et descriptif.</p>
              <div className="bg-noir-absolu/50 border border-bleu-neon/30 rounded-lg p-4">
                <p className="text-bleu-neon text-sm">→ Exemples : "Directeurs Marketing Tech 2024", "CEOs Startups FinTech"</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-bleu-fonce/30 to-noir-absolu/50 border border-bleu-neon/20 rounded-xl p-6 shadow-neon-subtle">
              <h3 className="text-lg font-semibold text-blanc-pur mb-4">2. Définition du poste cible</h3>
              <p className="text-blanc-pur text-sm mb-3">Utilisez des mots-clés précis et respectez la syntaxe de recherche.</p>
              <div className="bg-noir-absolu/50 border border-bleu-neon/30 rounded-lg p-4">
                <p className="text-bleu-neon text-sm">→ Exemples : "CEO AND startup", "Directeur Commercial SaaS"</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-bleu-fonce/30 to-noir-absolu/50 border border-bleu-neon/20 rounded-xl p-6 shadow-neon-subtle">
              <h3 className="text-lg font-semibold text-blanc-pur mb-4">3. Quota journalier</h3>
              <p className="text-blanc-pur text-sm mb-3">Ne dépassez pas 100 profils/jour pour éviter les restrictions.</p>
              <div className="bg-noir-absolu/50 border border-bleu-neon/30 rounded-lg p-4">
                <p className="text-bleu-neon text-sm">→ Recommandé : 20-30/jour pour débuter, 80 max pour experts.</p>
              </div>
            </div>
          </div>
        );
      case "contacts":
        return (
          <div className="space-y-8">
            <div className="bg-gradient-to-r from-vert-plasma/10 to-bleu-neon/5 rounded-xl p-6 border border-vert-plasma/30">
              <h2 className="text-2xl font-bold text-blanc-pur mb-4 flex items-center gap-3">
                <UserGroupIcon className="h-8 w-8 text-vert-plasma animate-glow" />
                Gestion des contacts
              </h2>
              <p className="text-blanc-pur">
                Découvrez comment gérer efficacement vos contacts, les qualifier et optimiser votre prospection.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: CheckCircleIcon, title: "Gardé", desc: "Prospect qualifié et intéressant", color: "text-vert-plasma" },
                { icon: InformationCircleIcon, title: "En attente", desc: "Prospect à évaluer", color: "text-bleu-neon" },
                { icon: ExclamationTriangleIcon, title: "Rejeté", desc: "Ne correspond pas aux critères", color: "text-rouge-danger" }
              ].map((item, i) => (
                <div key={i} className="bg-gradient-to-br from-bleu-fonce/30 to-noir-absolu/50 border border-bleu-neon/20 rounded-lg p-4 shadow-neon-subtle">
                  <div className="flex items-center gap-3 mb-2">
                    <item.icon className={`h-5 w-5 ${item.color}`} />
                    <span className="font-semibold text-blanc-pur">{item.title}</span>
                  </div>
                  <p className="text-blanc-pur text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        );
      case "analytics":
        return (
          <div className="space-y-8">
            <div className="bg-gradient-to-r from-orange-vif/10 to-bleu-neon/5 rounded-xl p-6 border border-orange-vif/30">
              <h2 className="text-2xl font-bold text-blanc-pur mb-4 flex items-center gap-3">
                <ChartBarIcon className="h-8 w-8 text-orange-vif animate-glow" />
                Statistiques & Analyses
              </h2>
              <p className="text-blanc-pur">
                Analysez vos performances, identifiez les opportunités d'amélioration et optimisez vos résultats.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: "Taux d'ouverture", desc: "% de messages ouverts" },
                { label: "Taux de réponse", desc: "% de prospects qui répondent" },
                { label: "Taux de conversion", desc: "% de prospects convertis" },
                { label: "ROI des campagnes", desc: "Retour sur investissement" }
              ].map((kpi, i) => (
                <div key={i} className="bg-gradient-to-br from-bleu-fonce/30 to-noir-absolu/50 border border-bleu-neon/20 rounded-lg p-4 shadow-neon-subtle">
                  <h4 className="font-semibold text-blanc-pur mb-2">{kpi.label}</h4>
                  <p className="text-blanc-pur text-sm">{kpi.desc}</p>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-noir-absolu via-bleu-fonce/90 to-violet-plasma/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête */}
        <div className="bg-gradient-to-br from-bleu-fonce/50 to-noir-absolu/80 rounded-xl  border border-bleu-neon/20 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-blanc-pur flex items-center gap-3">
                <BookOpenIcon className="h-8 w-8 text-bleu-neon animate-glow" />
                Guide d'utilisation
              </h1>
              <p className="text-blanc-pur mt-2">
                Apprenez à utiliser efficacement votre application de prospection intelligente
              </p>
            </div>
            <div className="hidden md:block">
              <div className="bg-gradient-primary text-noir-absolu px-4 py-2 rounded-lg text-sm font-medium ">
                Version 2.1.0
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Menu de navigation */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-bleu-fonce/50 to-noir-absolu/80 rounded-xl  border border-bleu-neon/20 p-6 sticky top-8">
              <h2 className="font-semibold text-blanc-pur mb-4">Sommaire</h2>
              <nav className="space-y-2">
                {sections.map((section) => {
                  const Icon = section.icon;
                  const isActive = activeSection === section.id;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full text-left p-3 rounded-lg transition-all duration-200 flex items-center gap-3 ${
                        isActive
                          ? "bg-gradient-primary text-noir-absolu  border border-bleu-neon"
                          : "text-blanc-pur hover:bg-bleu-neon/10 hover:text-bleu-neon border border-transparent"
                      }`}
                    >
                      <Icon className={`h-5 w-5 ${isActive ? "text-noir-absolu" : "text-gris-metallique"}`} />
                      <span className="font-medium text-sm">{section.title}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Liens utiles */}
              <div className="mt-8 pt-6 border-t border-bleu-neon/20">
                <h3 className="font-medium text-blanc-pur mb-3 text-sm">Liens utiles</h3>
                <div className="space-y-2">
                  <a href="#" className="flex items-center gap-2 text-sm text-blanc-pur hover:text-bleu-neon transition-colors">
                    <DocumentTextIcon className="h-4 w-4" />
                    Documentation API
                  </a>
                  <a href="#" className="flex items-center gap-2 text-sm text-blanc-pur hover:text-bleu-neon transition-colors">
                    <BellIcon className="h-4 w-4" />
                    Nouveautés
                  </a>
                  <a href="#" className="flex items-center gap-2 text-sm text-blanc-pur hover:text-bleu-neon transition-colors">
                    <UserGroupIcon className="h-4 w-4" />
                    Communauté
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Contenu principal */}
          <div className="lg:col-span-3">
            <div className="bg-gradient-to-br from-bleu-fonce/50 to-noir-absolu/80 rounded-xl  border border-bleu-neon/20 p-8">
              {renderContent()}
            </div>
          </div>
        </div>

        {/* Pied de page d'aide */}
        <div className="mt-12 bg-gradient-to-r from-bleu-fonce/30 to-violet-plasma/10 rounded-xl border border-bleu-neon/20 p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-blanc-pur mb-2">Besoin d'aide supplémentaire ?</h3>
            <p className="text-blanc-pur mb-4">
              Notre équipe support est là pour vous accompagner dans l'utilisation de l'application
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button className="bg-gradient-primary text-noir-absolu px-6 py-2 rounded-lg font-medium transition-all  hover:scale-105">
                Contacter le support
              </button>
              <button className="border border-bleu-neon text-bleu-neon hover:bg-bleu-neon/10 px-6 py-2 rounded-lg font-medium transition-all">
                Voir la FAQ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
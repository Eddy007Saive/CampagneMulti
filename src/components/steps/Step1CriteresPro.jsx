import React, { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import {
  HelpCircle,
  Eye,
  Upload,
  Moon,
  Sun,
  Check,
  AlertCircle,
  Loader2,
  Copy,
  Users,
  MapPin,
  Calendar,
  Languages,
  Building,
  MessageSquare,
  RefreshCw,
  Clock,
  Plus,
  Trash2,
  MoveUp,
  MoveDown
} from "lucide-react";
import Tooltips from "../ui/Tooltips";
export const Step1CriteresPro = ({ formData, handleChange, stepValidationErrors }) => {
      const langues = [
    "Français", "Anglais", "Espagnol", "Allemand", "Italien",
    "Portugais", "Russe", "Chinois", "Japonais", "Arabe",
    "Néerlandais", "Suédois", "Norvégien", "Danois", "Polonais"
  ];

  const secteurs = [
    "Informatique", "Finance", "Marketing", "Ressources Humaines",
    "Vente", "Ingénierie", "Santé", "Éducation", "Juridique",
    "Logistique", "Construction", "Automobile", "Aéronautique",
    "Pharmaceutique", "Agroalimentaire", "Textile", "Énergie",
    "Télécommunications", "Média", "Tourisme", "Immobilier",
    "Consulting", "Design", "Architecture", "Recherche & Développement"
  ];

  const postesFrequents = [
    "Développeur Full Stack",
    "Chef de projet",
    "Directeur Administratif et Financier",
    "Responsable Marketing",
    "Ingénieur DevOps"
  ];

   const generateLinkedInQuery = () => {
    const { posteRecherche, zoneGeographique } = formData;
    let query = "";

    if (posteRecherche) {
      query += `"${posteRecherche}"`;
    }

    if (zoneGeographique) {
      query += query ? ` AND "${zoneGeographique}"` : `"${zoneGeographique}"`;
    }

    return query || "Aucune requête générée";
  };

   return (
            <div className="space-y-6">
              <div>
                <label className="flex items-center mb-2 text-sm font-medium text-white dark:text-gray-300">
                  <Building size={16} className="mr-2" />
                  Cible recherché *
                  <Tooltips content="Utilisez des opérateurs LinkedIn : OR pour plusieurs options, AND pour combiner, NOT pour exclure. Ex: 'Développeur OR Developer'">
                    <HelpCircle size={14} className="ml-2 text-gray-400 cursor-help" />
                  </Tooltips>
                </label>
                <div className="space-y-2">
                  <input
                    list="postes-list"
                    value={formData.posteRecherche}
                    name="posteRecherche"
                    type="text"
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${stepValidationErrors.posteRecherche ? 'border-red-500' : 'border-gray-300'
                      }`}
                    onChange={handleChange}
                    placeholder="Ex: Développeur OR Developer AND Senior"
                  />
                  <datalist id="postes-list">
                    {postesFrequents.map((poste) => (
                      <option key={poste} value={poste} />
                    ))}
                  </datalist>
  
                  {formData.posteRecherche && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-blue-700 dark:text-blue-300">
                          Requête LinkedIn: {generateLinkedInQuery()}
                        </span>
                        <Copy size={16} className="text-blue-600 cursor-pointer hover:text-blue-800" />
                      </div>
                    </div>
                  )}
                </div>
                {stepValidationErrors.posteRecherche && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle size={12} className="mr-1" />
                    {stepValidationErrors.posteRecherche.message}
                  </p>
                )}
              </div>
  
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="flex items-center mb-2 text-sm font-medium text-white dark:text-gray-300">
                    <Users size={16} className="mr-2" />
                    Séniorité (optionnel)
                  </label>
                  <select
                    name="seniorite"
                    multiple
                    value={formData.seniorite || []}
                    onChange={(e) => {
                      const selectedValues = Array.from(e.target.selectedOptions, option => option.value);
                      handleChange({
                        target: {
                          name: 'seniorite',
                          value: selectedValues
                        }
                      });
                    }}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white min-h-[120px]"
                  >
                    <option value="Owner">Owner</option>
                    <option value="C-Level">C-Level</option>
                    <option value="VP">VP</option>
                    <option value="Director">Director</option>
                    <option value="Head">Head</option>
                  </select>
                  <p className="text-xs text-gray-400 mt-1">Maintenez Ctrl/Cmd pour sélectionner plusieurs options</p>
                </div>
  
                <div>
                  <label className="flex items-center mb-2 text-sm font-medium text-white dark:text-gray-300">
                    <Building size={16} className="mr-2" />
                    Taille de l'entreprise (optionnel)
                  </label>
                  <select
                    name="tailleEntreprise"
                    multiple
                    value={formData.tailleEntreprise || []}
                    onChange={(e) => {
                      const selectedValues = Array.from(e.target.selectedOptions, option => option.value);
                      handleChange({
                        target: {
                          name: 'tailleEntreprise',
                          value: selectedValues
                        }
                      });
                    }}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white min-h-[120px]"
                  >
                    <option value="1-10">1–10 employés</option>
                    <option value="11-50">11–50 employés</option>
                    <option value="51-200">51–200 employés</option>
                    <option value="201-500">201–500 employés</option>
                    <option value="501-1000">501–1k employés</option>
                    <option value="1000+">1k+ employés</option>
                  </select>
                  <p className="text-xs text-gray-400 mt-1">Maintenez Ctrl/Cmd pour sélectionner plusieurs options</p>
                </div>
              </div>
  
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="flex items-center mb-2 text-sm font-medium text-white dark:text-gray-300">
                    <Languages size={16} className="mr-2" />
                    Langues parlées *
                  </label>
                  <input
                    list="langues-list"
                    name="languesParlees"
                    value={formData.languesParlees}
                    onChange={handleChange}
                    placeholder="Sélectionner ou saisir une langue"
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${stepValidationErrors.languesParlees ? 'border-red-500' : 'border-gray-300'
                      }`}
                  />
                  <datalist id="langues-list">
                    {langues.map((langue) => (
                      <option key={langue} value={langue} />
                    ))}
                  </datalist>
                  {stepValidationErrors.languesParlees && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <AlertCircle size={12} className="mr-1" />
                      {stepValidationErrors.languesParlees.message}
                    </p>
                  )}
                </div>
  
                <div>
                  <label className="flex items-center mb-2 text-sm font-medium text-white dark:text-gray-300">
                    <Building size={16} className="mr-2" />
                    Secteurs souhaités (optionnel)
                  </label>
                  <input
                    list="secteurs-list"
                    name="secteursSOuhaites"
                    value={formData.secteursSOuhaites}
                    onChange={handleChange}
                    placeholder="Sélectionner ou saisir un secteur"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <datalist id="secteurs-list">
                    {secteurs.map((secteur) => (
                      <option key={secteur} value={secteur} />
                    ))}
                  </datalist>
                  <p className="text-xs text-gray-400 mt-1">Ce champ est facultatif</p>
                </div>
              </div>
            </div>
          );
};

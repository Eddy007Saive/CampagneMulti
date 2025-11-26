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
export const Step2Planning = ({ 
  formData, 
  handleChange, 
  handleJourToggle, 
  appliquerPlanningPredefini,
  stepValidationErrors 
}) => {
     const joursOptions = [
    { id: 'Lundi', label: 'Lundi', short: 'L' },
    { id: 'Mardi', label: 'Mardi', short: 'M' },
    { id: 'Mercredi', label: 'Mercredi', short: 'M' },
    { id: 'Jeudi', label: 'Jeudi', short: 'J' },
    { id: 'Vendredi', label: 'Vendredi', short: 'V' },
    { id: 'Samedi', label: 'Samedi', short: 'S' },
    { id: 'Dimanche', label: 'Dimanche', short: 'D' }
  ];

    const planningsPredefinis = [
    {
      nom: "Jours ouvrables",
      jours: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'],
      description: "Du Lundi au Vendredi"
    },
    {
      nom: "Semaine complète",
      jours: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'],
      description: "Tous les jours de la semaine"
    },
    {
      nom: "Début de semaine",
      jours: ['Lundi', 'Mardi', 'Mercredi'],
      description: "Lundi, Mardi et Mercredi"
    },
    {
      nom: "Fin de semaine",
      jours: ['Jeudi', 'Vendredi'],
      description: "Jeudi et Vendredi"
    }
  ];
   return (
            <div className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="flex items-center mb-2 text-sm font-medium text-white dark:text-gray-300">
                    <Users size={16} className="mr-2" />
                    Profils à rechercher par jour *
                    <Tooltips content="Nombre de nouveaux profils à identifier quotidiennement (maximum 120)">
                      <HelpCircle size={14} className="ml-2 text-gray-400 cursor-help" />
                    </Tooltips>
                  </label>
                  <input
                    value={formData.profilsParJour}
                    name="profilsParJour"
                    type="number"
                    min="1"
                    max="120"
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${stepValidationErrors.profilsParJour ? 'border-red-500' : 'border-gray-300'
                      }`}
                    onChange={handleChange}
                    placeholder="Ex: 20"
                  />
                  {stepValidationErrors.profilsParJour && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <AlertCircle size={12} className="mr-1" />
                      {stepValidationErrors.profilsParJour.message}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">Maximum: 120 profils par jour</p>
                </div>
  
                <div>
                  <label className="flex items-center mb-2 text-sm font-medium text-white dark:text-gray-300">
                    <MessageSquare size={16} className="mr-2" />
                    Messages à envoyer par jour *
                    <Tooltips content="Nombre de messages à envoyer quotidiennement (maximum 40)">
                      <HelpCircle size={14} className="ml-2 text-gray-400 cursor-help" />
                    </Tooltips>
                  </label>
                  <input
                    value={formData.messagesParJour}
                    name="messagesParJour"
                    type="number"
                    min="1"
                    max="40"
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${stepValidationErrors.messagesParJour ? 'border-red-500' : 'border-gray-300'
                      }`}
                    onChange={handleChange}
                    placeholder="Ex: 15"
                  />
                  {stepValidationErrors.messagesParJour && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <AlertCircle size={12} className="mr-1" />
                      {stepValidationErrors.messagesParJour.message}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">Maximum: 40 messages par jour</p>
                </div>
              </div>
  
              <div className="space-y-4">
                <label className="flex items-center mb-2 text-sm font-medium text-white dark:text-gray-300">
                  <RefreshCw size={16} className="mr-2" />
                  Jours de rafraîchissement *
                  <Tooltips content="Sélectionnez les jours où la campagne doit rechercher et envoyer des messages aux profils">
                    <HelpCircle size={14} className="ml-2 text-gray-400 cursor-help" />
                  </Tooltips>
                </label>
  
                <div className="mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Plannings prédéfinis :</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                    {planningsPredefinis.map((planning) => (
                      <button
                        key={planning.nom}
                        type="button"
                        onClick={() => appliquerPlanningPredefini(planning)}
                        className="p-3 text-left border border-gray-200 dark:border-gray-600 rounded-lg hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 group"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm text-white dark:text-gray-300 group-hover:text-blue-600">
                            {planning.nom}
                          </span>
                          <Clock size={12} className="text-gray-400" />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{planning.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
  
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Ou sélectionnez manuellement :</p>
                  <div className="grid grid-cols-7 gap-2">
                    {joursOptions.map((jour) => (
                      <button
                        key={jour.id}
                        type="button"
                        onClick={() => handleJourToggle(jour.id)}
                        className={`relative p-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${formData.joursRafraichissement.includes(jour.id)
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                          : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-white dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
                          }`}
                      >
                        <div className="text-center">
                          <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-sm font-semibold mb-1 ${formData.joursRafraichissement.includes(jour.id)
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                            }`}>
                            {jour.short}
                          </div>
                          <span className="text-xs">{jour.label}</span>
                        </div>
                        {formData.joursRafraichissement.includes(jour.id) && (
                          <div className="absolute -top-1 -right-1">
                            <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                              <Check size={10} className="text-white" />
                            </div>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
  
                  {stepValidationErrors.joursRafraichissement && (
                    <p className="text-red-500 text-xs mt-2 flex items-center">
                      <AlertCircle size={12} className="mr-1" />
                      {stepValidationErrors.joursRafraichissement.message}
                    </p>
                  )}
  
                  {formData.joursRafraichissement.length > 0 && (
                    <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-2">
                        <Check size={16} className="text-green-600" />
                        <span className="text-sm text-green-700 dark:text-green-300">
                          {formData.joursRafraichissement.length} jour{formData.joursRafraichissement.length > 1 ? 's' : ''} sélectionné{formData.joursRafraichissement.length > 1 ? 's' : ''} : {' '}
                          {formData.joursRafraichissement.map(jour =>
                            joursOptions.find(j => j.id === jour)?.label
                          ).join(', ')}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
};
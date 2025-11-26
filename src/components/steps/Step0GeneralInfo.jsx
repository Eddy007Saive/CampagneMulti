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
import Tooltips  from "../ui/Tooltips";
export const Step0GeneralInfo = ({ formData, handleChange, stepValidationErrors }) => {
   return (
           <div className="space-y-6">
             <div className="grid gap-6 sm:grid-cols-2">
               <div>
                 <label className="flex items-center mb-2 text-sm font-medium text-white dark:text-gray-300">
                   <Users size={16} className="mr-2" />
                   Nom de la campagne *
                   <Tooltips content="Donnez un nom descriptif à votre campagne pour la retrouver facilement">
                     <HelpCircle size={14} className="ml-2 text-gray-400 cursor-help" />
                   </Tooltips>
                 </label>
                 <input
                   value={formData.nom}
                   name="nom"
                   type="text"
                   className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${stepValidationErrors.nom ? 'border-red-500' : 'border-gray-300'
                     }`}
                   onChange={handleChange}
                   placeholder="Ex: Recrutement Développeur Senior - Mars 2025"
                 />
                 {stepValidationErrors.nom && (
                   <p className="text-red-500 text-xs mt-1 flex items-center">
                     <AlertCircle size={12} className="mr-1" />
                     {stepValidationErrors.nom.message}
                   </p>
                 )}
               </div>
 
               <div>
                 <label className="flex items-center mb-2 text-sm font-medium text-white dark:text-gray-300">
                   <MapPin size={16} className="mr-2" />
                   Zone géographique *
                 </label>
                 <input
                   value={formData.zoneGeographique}
                   name="zoneGeographique"
                   type="text"
                   className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${stepValidationErrors.zoneGeographique ? 'border-red-500' : 'border-gray-300'
                     }`}
                   onChange={handleChange}
                   placeholder="Paris, France"
                 />
                 {stepValidationErrors.zoneGeographique && (
                   <p className="text-red-500 text-xs mt-1 flex items-center">
                     <AlertCircle size={12} className="mr-1" />
                     {stepValidationErrors.zoneGeographique.message}
                   </p>
                 )}
               </div>
             </div>
           </div>
         );
};

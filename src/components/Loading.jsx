import React from "react";
import { IconButton, Typography } from "@material-tailwind/react";

/**
 * Composant de pagination réutilisable
 * 
 * @param {Object} props - Les propriétés du composant
 * @param {number} props.currentPage - La page actuelle
 * @param {number} props.totalPages - Le nombre total de pages
 * @param {number} props.totalItems - Le nombre total d'éléments
 * @param {number} props.limit - Le nombre d'éléments par page
 * @param {Function} props.onPageChange - Fonction appelée lors du changement de page
 * @param {Function} props.onLimitChange - Fonction appelée lors du changement de limite par page
 * @param {string} props.itemName - Nom des éléments affichés (ex: "produits", "utilisateurs")
 * @returns {JSX.Element} Composant de pagination
 */
const Loading = () => {

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      <div className="flex flex-col items-center gap-6 p-8 rounded-2xl bg-slate-900/50 backdrop-blur-sm shadow-2xl">
        
        {/* Conteneur Logo + Loader */}
        <div className="relative w-24 h-24 mb-4">
          
          {/* Loader multi-rings autour du logo */}
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-cyan-400 animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-blue-500 animate-spin" style={{animationDuration: '1.5s'}}></div>
          <div className="absolute inset-4 rounded-full border-4 border-transparent border-t-purple-500 animate-spin" style={{animationDuration: '2s'}}></div>
          
          {/* Logo SRV centré */}
          <div className="absolute inset-0 flex items-center justify-center">
            <img 
            src="/img/photo_5954299465697445759_x.jpg" 
            alt="SRV" 
            className="w-14 h-14 rounded-full object-cover border-2 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)]" 
          />
          </div>
        </div>

      </div>
    </div>
    );
};

export default Loading;
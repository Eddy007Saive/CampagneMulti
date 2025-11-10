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
        <div className="flex justify-center items-center p-16 relative">
            {/* Loader futuriste */}
            <div className="relative">
                <div className="w-20 h-20 border-2 border-blackcore-rouge/30 rounded-full"></div>
                <div className="absolute top-0 left-0 w-20 h-20 border-2 border-transparent border-t-blackcore-rouge rounded-full animate-spin"></div>
                <div className="absolute top-2 left-2 w-16 h-16 border-2 border-transparent border-t-blue-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                <div className="absolute top-4 left-4 w-12 h-12 border-2 border-transparent border-t-cyan-400 rounded-full animate-spin" style={{ animationDuration: '0.8s' }}></div>

                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2 h-2 bg-blackcore-rouge rounded-full animate-pulse"></div>
                </div>
            </div>

            <div className="ml-6 flex flex-col">
                <p className="text-blackcore-blanc font-orbitron font-bold text-lg tracking-wider">CHARGEMENT</p>
                <div className="flex space-x-1 mt-2">
                    <div className="w-2 h-2 bg-blackcore-rouge rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
            </div>
        </div>
    );
};

export default Loading;
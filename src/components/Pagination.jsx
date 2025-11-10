import React from "react";
import { IconButton, Typography } from "@material-tailwind/react";

/**
 * Pagination futuriste avec la charte design
 */
const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  limit,
  onPageChange,
  onLimitChange,
  itemName = "éléments"
}) => {
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  return (
    <div className="flex items-center justify-between  p-4 bg-gradient-to-r from-gray-900/80 via-gray-950/90 to-gray-900/80 backdrop-blur-md">
      
      {/* Sélecteur du nombre d'éléments par page */}
      <div className="flex items-center gap-2">
        <Typography variant="small" className="text-blanc-pur/80">
          Afficher
        </Typography>
        <select
          value={limit}
          onChange={(e) => onLimitChange(Number(e.target.value))}
          className="rounded bg-transparent border border-bleu-neon/50 text-blanc-pur px-2 py-1 text-sm hover:border-bleu-neon focus:outline-none focus:ring-2 focus:ring-bleu-neon/70 transition-all duration-200"
        >
          <option className="bg-gray-900" value={5}>5</option>
          <option className="bg-gray-900" value={10}>10</option>
          <option className="bg-gray-900" value={20}>20</option>
          <option className="bg-gray-900" value={50}>50</option>
        </select>
        <Typography variant="small" className="text-blanc-pur/80">
          par page | <span className="text-bleu-neon">{totalItems}</span> {itemName}
        </Typography>
      </div>

      {/* Boutons de navigation */}
      <div className="flex gap-2">
        <IconButton
          variant="text"
          className="text-blanc-pur border border-bleu-neon/50 hover:bg-bleu-neon/20 hover:shadow-[0_0_10px_#00f] transition-all"
          disabled={currentPage <= 1}
          onClick={() => goToPage(1)}
        >
          {"<<"}
        </IconButton>

        <IconButton
          variant="text"
          className="text-blanc-pur border border-bleu-neon/50 hover:bg-bleu-neon/20 hover:shadow-[0_0_10px_#00f] transition-all"
          disabled={currentPage <= 1}
          onClick={() => goToPage(currentPage - 1)}
        >
          {"<"}
        </IconButton>

        <div className="flex items-center gap-1">
          <Typography variant="small" className="text-blanc-pur font-mono tracking-wider">
            Page <span className="text-bleu-neon">{currentPage}</span> / {totalPages}
          </Typography>
        </div>

        <IconButton
          variant="text"
          className="text-blanc-pur border border-bleu-neon/50 hover:bg-bleu-neon/20 hover:shadow-[0_0_10px_#00f] transition-all"
          disabled={currentPage >= totalPages}
          onClick={() => goToPage(currentPage + 1)}
        >
          {">"}
        </IconButton>

        <IconButton
          variant="text"
          className="text-blanc-pur border border-bleu-neon/50 hover:bg-bleu-neon/20 hover:shadow-[0_0_10px_#00f] transition-all"
          disabled={currentPage >= totalPages}
          onClick={() => goToPage(totalPages)}
        >
          {">>"}
        </IconButton>
      </div>
    </div>
  );
};

export default Pagination;

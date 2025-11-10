import PropTypes from "prop-types";
import { useLocation, Link, useNavigate } from "react-router-dom";
import {
  Navbar,
  Typography,
  IconButton,
  Breadcrumbs,
} from "@material-tailwind/react";
import {
  Cog6ToothIcon,
  BellIcon,
  Bars3Icon,
} from "@heroicons/react/24/solid";
import {
  useMaterialTailwindController,
  setOpenConfigurator,
  setOpenSidenav,
} from "@/context";
import { UserMenu } from "@/components/UserMenu";

export function DashboardNavbar({ 
  unreadCount, 
  isLoadingNotifications, 
  onNotificationClick 
}) {
  const [controller, dispatch] = useMaterialTailwindController();
  const { fixedNavbar, openSidenav } = controller;
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [layout, page] = pathname.split("/").filter((el) => el !== "");

  const handleNotificationClick = () => {
    // Appeler la fonction callback si elle existe
    if (onNotificationClick) {
      onNotificationClick();
    }
    // Naviguer vers la page de notifications
    navigate(`/${layout}/notification`);
  };

  return (
    <Navbar
      color={fixedNavbar ? "white" : "transparent"}
      className={`rounded-xl transition-all ${
        fixedNavbar
          ? "sticky top-4 z-40 py-3 shadow-md shadow-blue-gray-500/5"
          : "px-0 py-1"
      }`}
      fullWidth
      blurred={fixedNavbar}
    >
      <div className="flex flex-col-reverse justify-between gap-6 md:flex-row md:items-center">
        <div className="capitalize">
          {/* Bouton pour ouvrir le sidenav sur mobile */}
          <IconButton
            variant="text"
            color="white"
            className="grid xl:hidden hover:bg-bleu-fonce/30 transition-colors"
            onClick={() => setOpenSidenav(dispatch, !openSidenav)}
          >
            <Bars3Icon strokeWidth={3} className="h-6 w-6 text-blanc-pur" />
          </IconButton>

          <Breadcrumbs
            className={`bg-transparent p-0 transition-all ${
              fixedNavbar ? "mt-1" : ""
            }`}
          >
            <Link to={`/${layout}`}>
              <Typography
                variant="small"
                color="white"
                className="font-normal opacity-50 transition-all hover:text-bleu-neon hover:opacity-100"
              >
                {layout}
              </Typography>
            </Link>
            <Typography
              variant="small"
              color="white"
              className="font-normal"
            >
              {page}
            </Typography>
          </Breadcrumbs>
          <Typography variant="h6" color="white">
            {page}
          </Typography>
        </div>

        {/* Section droite avec icônes et menu utilisateur */}
        <div className="flex items-center gap-4">
          {/* Icône de notifications avec badge dynamique */}
          <div className="relative group">
            <IconButton
              variant="text"
              color="white"
              className="hover:bg-bleu-neon/10 transition-all duration-300 hover:shadow-neon-blue border border-transparent hover:border-bleu-neon/30 relative"
              onClick={handleNotificationClick}
              disabled={isLoadingNotifications}
            >
              <BellIcon className={`h-5 w-5 transition-all duration-300 ${
                unreadCount > 0 
                  ? "text-bleu-neon animate-pulse" 
                  : "text-blanc-pur group-hover:text-bleu-neon"
              }`} />
              
              {/* Effet de lueur pour les notifications non lues */}
              {unreadCount > 0 && (
                <div className="absolute inset-0 rounded-lg bg-bleu-neon/20 animate-pulse"></div>
              )}
            </IconButton>
            
            {/* Badge de notification avec effet néon */}
            {unreadCount > 0 && (
              <div className="absolute -top-1 -right-1">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-primary text-noir-absolu text-xs font-bold shadow-neon-gradient animate-pulse border-2 border-bleu-neon">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
                {/* Effet de pulsation autour du badge */}
                <span className="absolute inset-0 rounded-full bg-violet-plasma opacity-50 animate-ping"></span>
              </div>
            )}

            {/* Indicateur de chargement */}
            {isLoadingNotifications && (
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
                <div className="w-1 h-1 bg-bleu-neon rounded-full animate-pulse"></div>
              </div>
            )}
          </div>

          {/* Icône de configuration avec effet néon */}
          <IconButton
            variant="text"
            color="white"
            className="hover:bg-bleu-neon/10 transition-all duration-300 hover:shadow-neon-blue border border-transparent hover:border-bleu-neon/30 group"
            onClick={() => setOpenConfigurator(dispatch, true)}
          >
            <Cog6ToothIcon className="h-5 w-5 text-blanc-pur group-hover:text-bleu-neon transition-all duration-300 group-hover:rotate-90" />
          </IconButton>

          {/* Menu utilisateur avec déconnexion */}
          <UserMenu />
        </div>
      </div>
    </Navbar>
  );
}

DashboardNavbar.defaultProps = {
  unreadCount: 0,
  isLoadingNotifications: false,
  onNotificationClick: () => {},
};

DashboardNavbar.propTypes = {
  unreadCount: PropTypes.number,
  isLoadingNotifications: PropTypes.bool,
  onNotificationClick: PropTypes.func,
};

DashboardNavbar.displayName = "/src/widgets/layout/dashboard-navbar.jsx";

export default DashboardNavbar;
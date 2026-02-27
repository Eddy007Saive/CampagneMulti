import PropTypes from "prop-types";
import { Link, NavLink } from "react-router-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  Avatar,
  Button,
  IconButton,
  Typography,
} from "@material-tailwind/react";
import { useMaterialTailwindController, setOpenSidenav } from "@/context";

export function Sidenav({
  brandImg,
  brandName,
  routes,
  unreadCount,
  isLoadingNotifications,
  onNotificationClick,
  bottomCircleImg,
  bottomCircleAlt,
  onBottomCircleClick,
}) {
  const [controller, dispatch] = useMaterialTailwindController();
  const { openSidenav } = controller;

  return (
    <aside
      className={`${
        openSidenav ? "translate-x-0" : "-translate-x-80"
      } fixed inset-0 z-50 my-4 ml-4 h-[calc(100vh-32px)] w-72 rounded-xl transition-transform duration-300 xl:translate-x-0 bg-gradient-background backdrop-blur-md border-2 border-bleu-neon/20 shadow-neon-gradient flex flex-col`}
    >
      {/* 🔝 HEADER FIXE */}
      <div className="flex-shrink-0 border-b border-bleu-neon/20 px-6 py-4">
        <Link to="/" className="flex items-center justify-center gap-3 group">
          <img
            src={brandImg}
            alt="Logo"
            className="w-10 h-10 transition-all duration-300 group-hover:drop-shadow-[0_0_15px_rgba(0,207,255,0.8)]"
          />
          <Typography
            variant="h6"
            className="text-blanc-pur font-bold group-hover:text-bleu-neon transition-all duration-300"
          >
            {brandName}
          </Typography>
        </Link>
        <IconButton
          variant="text"
          size="sm"
          ripple={false}
          className="absolute right-4 top-4 grid rounded-lg xl:hidden text-blanc-pur hover:text-bleu-neon hover:bg-bleu-neon/10 transition-all duration-300"
          onClick={() => setOpenSidenav(dispatch, false)}
        >
          <XMarkIcon strokeWidth={2.5} className="h-5 w-5" />
        </IconButton>
      </div>

      {/* 📜 BODY SCROLLABLE */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-bleu-neon/30 scrollbar-track-transparent px-4 py-2">
        {routes.map(({ layout, title, pages }, key) => (
          <ul key={key} className="mb-6 flex flex-col gap-1">
            {title && (
              <li className="mx-3.5 mt-4 mb-3">
                <Typography
                  variant="small"
                  className="font-black uppercase text-violet-plasma opacity-90 tracking-wider text-xs"
                >
                  {title}
                </Typography>
                <div className="mt-1 h-px bg-gradient-primary opacity-30"></div>
              </li>
            )}
            {pages.map(({ icon, name, path, badge }) => (
              <li key={name} className="relative">
                <NavLink to={`/${layout}${path}`}>
                  {({ isActive }) => (
                    <Button
                      variant={isActive ? "filled" : "text"}
                      className={`flex items-center gap-4 px-4 capitalize w-full mb-1 relative group transition-all duration-300 mb-1  ${
                        isActive
                          ? "bg-gradient-primary text-noir-absolu shadow-neon-gradient border-2 border-bleu-neon"
                          : "text-blanc-pur hover:text-bleu-neon hover:bg-bleu-neon/5 border-2 border-transparent"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-4">
                          <div className={isActive ? "text-noir-absolu" : "text-blanc-pur"}>{icon}</div>
                          <Typography className={isActive ? "text-noir-absolu font-bold" : "text-blanc-pur"}>
                            {name}
                          </Typography>
                        </div>
                        {badge && <div className="ml-auto">{badge}</div>}
                      </div>
                    </Button>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        ))}
      </div>

      {/* 🔻 FOOTER FIXE – masqué en mobile */}
      {bottomCircleImg && (
        <div className="hidden sm:flex flex-shrink-0 justify-center pb-4">
          <div
            className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-bleu-neon/50 cursor-pointer group transition-all duration-300"
            onClick={onBottomCircleClick}
          >
            <img
              src={bottomCircleImg}
              alt={bottomCircleAlt || "Profile"}
              className="w-full h-full object-cover group-hover:brightness-110"
            />
            <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-full"></div>
          </div>
        </div>
      )}
    </aside>
  );
}

Sidenav.defaultProps = {
  brandImg: "/img/logo.png",
  brandName: "Prospectra",
  unreadCount: 0,
  isLoadingNotifications: false,
  onNotificationClick: () => {},
  bottomCircleImg: "/img/photo_5954299465697445759_x.jpg",
  bottomCircleAlt: "Profile",
  onBottomCircleClick: () => {},
};

Sidenav.propTypes = {
  brandImg: PropTypes.string,
  brandName: PropTypes.string,
  routes: PropTypes.arrayOf(PropTypes.object).isRequired,
  unreadCount: PropTypes.number,
  isLoadingNotifications: PropTypes.bool,
  onNotificationClick: PropTypes.func,
  bottomCircleImg: PropTypes.string,
  bottomCircleAlt: PropTypes.string,
  onBottomCircleClick: PropTypes.func,
};

Sidenav.displayName = "/src/widgets/layout/sidenav.jsx";

export default Sidenav;
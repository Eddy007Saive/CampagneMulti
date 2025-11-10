// src/components/UserMenu.jsx
import { useState } from 'react';
import {
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Avatar,
  Typography,
} from "@material-tailwind/react";
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  UserCircleIcon,
  Cog6ToothIcon,
  PowerIcon,
} from "@heroicons/react/24/solid";

export function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/auth/sign-in');
  };

  const menuItems = [
    {
      label: "Mon Profil",
      icon: UserCircleIcon,
      action: () => navigate('/dashboard/profile'),
    },
    {
      label: "Paramètres",
      icon: Cog6ToothIcon,
      action: () => navigate('/dashboard/configuration'),
    },
    {
      label: "Déconnexion",
      icon: PowerIcon,
      action: handleLogout,
      className: "text-red-500 hover:bg-red-50",
    },
  ];

  return (
    <Menu open={isMenuOpen} handler={setIsMenuOpen}>
      <MenuHandler>
        <div className="flex items-center gap-3 cursor-pointer hover:bg-bleu-fonce/30 p-2 rounded-lg transition-colors">
          <Avatar
            variant="circular"
            size="sm"
            alt={user?.username || "User"}
            className="border-2 border-bleu-neon cursor-pointer"
            src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.username || 'User'}&background=00CFFF&color=fff`}
          />
          <div className="hidden md:block">
            <Typography variant="small" className="font-medium text-blanc-pur">
              {user?.username || 'Utilisateur'}
            </Typography>
            <Typography variant="small" className="text-gray-400 text-xs">
              {user?.email || ''}
            </Typography>
          </div>
        </div>
      </MenuHandler>

      <MenuList className="bg-bleu-fonce border border-primary-500/30">
        {/* En-tête du menu */}
        <div className="px-3 py-2 border-b border-primary-500/30 mb-2">
          <Typography variant="small" className="font-semibold text-blanc-pur">
            {user?.username}
          </Typography>
          <Typography variant="small" className="text-gray-400 text-xs">
            {user?.email}
          </Typography>
          <Typography variant="small" className="text-bleu-neon text-xs mt-1">
            {user?.role || 'Utilisateur'}
          </Typography>
        </div>

        {/* Items du menu */}
        {menuItems.map((item, index) => (
          <MenuItem
            key={index}
            onClick={item.action}
            className={`flex items-center gap-2 hover:bg-primary-500/10 text-blanc-pur ${item.className || ''}`}
          >
            <item.icon className="h-5 w-5" />
            <Typography variant="small" className="font-medium">
              {item.label}
            </Typography>
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
}

export default UserMenu;
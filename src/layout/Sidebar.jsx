import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from "../assets/logo.jpg"
import { 
  LayoutGrid, UserRoundCog, UsersRound, MessageCircle, Bell, GraduationCap,
  Building2, FileCheckCorner, ChartColumn, 
} from 'lucide-react';

// Configuration centralisée du menu
export const MENU_ITEMS = [
  { icon: LayoutGrid, path: '/projectsdashboard', label: 'Dashboard' },
  { icon: UserRoundCog, path: '/accountsmanage', label: 'User Accounts Management' },
  { icon: UsersRound, path: '/teamsallocation', label: 'Manage Teams & Project Choices' },
  { icon: Bell, path: '/admin-notifications', label: 'Notifications' },
  { icon: Building2, path: '/academicentitymanage', label: 'Academic Entity Management' },
  { icon: GraduationCap, path: '/defense-manage', label: 'Defense Management' },
];

const Sidebar = ({ menuItems = MENU_ITEMS }) => {
  const location = useLocation();

  return (
    <aside className="w-20 flex flex-col items-center py-4 gap-6 bg-white border-r border-gray-200">
      {/* Logo */}
        <div className="flex items-center justify-center w-full h-12 px-1">
        <img src={logo} alt="Logo" className="object-contain w-full h-auto" />
      </div>
      
      {/* Menu Items */}
      {menuItems.map((item, index) => (
        <Link
          key={index}
          to={item.path}
          className={`p-2 rounded-lg transition-colors ${
            location.pathname === item.path
              ? 'bg-linear-to-r from-[#18335E] to-[#2D8FBF] text-white' 
              : 'text-gray-400 hover:text-[#18335E] hover:bg-[#2D8FBF]/10'
          }`}
          title={item.label}
        >
          <item.icon size={20} />
        </Link>
      ))}
    </aside>
  );
};

export default Sidebar;
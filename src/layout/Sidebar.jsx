import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MENU_ITEMS } from '../config/MenuItems'; // <- import

const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="w-16 flex flex-col items-center py-4 gap-6 bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="w-10 h-10 flex items-center justify-center">
        <img 
          src="src/assets/PFE_icon.svg" 
          alt="Logo" 
          width={40} 
          height={40}
          className="object-contain"
        />
      </div>
      
      {/* Menu Items */}
      {MENU_ITEMS.map((item, index) => (
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
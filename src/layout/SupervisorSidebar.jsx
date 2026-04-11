import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutGrid, Clipboard, UsersRound, MessageCircle, Bell, Folder
} from 'lucide-react';

const SupervisorSidebar = () => {
  const location = useLocation();

  const menuItems = [
    { icon: LayoutGrid, path: '/supervisor/homepage', label: 'Dashboard' },
    { icon: Clipboard, path: '/supervisor/projectsPage', label: 'Project Portfolio' },
    { icon: UsersRound, path: '/supervisor/teamspage', label: 'My Teams' },
    { icon: MessageCircle, path: '/supervisor/chat', label: 'Chat' },
    { icon: Bell, path: '/supervisor/notifications', label: 'Notifications' },
    { icon: Folder, path: '/supervisor/documents', label: 'Documents & Resources' },
  ];

  return (
    <aside className="w-16 flex flex-col items-center py-4 gap-6 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 z-50">
      <div className="w-10 h-10 flex items-center justify-center">
        <img 
          src="/src/assets/PFE_icon.svg" 
          alt="Logo" 
          width={40} 
          height={40}
          className="object-contain"
        />
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

export default SupervisorSidebar;
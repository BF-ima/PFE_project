import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutGrid, UsersRound, Star, MessageCircle, Bell, Folder
} from 'lucide-react';

const StudentSidebar = () => {
  const location = useLocation();

  const menuItems = [
    { icon: LayoutGrid, path: '/student/firstpage', label: 'Dashboard' },
    { icon: UsersRound, path: '/student/TeamManagementPage', label: 'Team Management' },
    { icon: Star, path: '/student/preferencelist', label: 'Preference List' },
    { icon: MessageCircle, path: '/student/chat', label: 'Chat' },
    { icon: Bell, path: '/student/notifications', label: 'Notifications' },
    { icon: Folder, path: '/student/documents', label: 'Documents & Resources' },
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

export default StudentSidebar;

import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutGrid, UsersRound, Star, MessageCircle, Bell, Folder, Calendar
} from 'lucide-react';

const StudentSidebar = () => {
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/notifications", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        setUnreadCount(data.unread_count || 0);
      } catch {
        // silently fail
      }
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, []);

  const menuItems = [
    { icon: LayoutGrid,    path: '/student/firstpage',          label: 'Dashboard' },
    { icon: UsersRound,    path: '/student/TeamManagementPage', label: 'Team Management' },
    { icon: Star,          path: '/student/preferencelist',     label: 'Preference List' },
    { icon: MessageCircle, path: '/student/chatpage',           label: 'Chat' },
    { icon: Bell,          path: '/student/notifications',      label: 'Notifications', badge: unreadCount },
    { icon: Folder,        path: '/student/documents',          label: 'Documents & Resources' },
    { icon: Calendar, path: '/student/meetings', label: 'Meeting Management' },
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
          className={`relative p-2 rounded-lg transition-colors ${
            location.pathname === item.path
              ? 'bg-linear-to-r from-[#18335E] to-[#2D8FBF] text-white'
              : 'text-gray-400 hover:text-[#18335E] hover:bg-[#2D8FBF]/10'
          }`}
          title={item.label}
        >
          <item.icon size={20} />
          {item.badge > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {item.badge > 99 ? "99+" : item.badge}
            </span>
          )}
        </Link>
      ))}
    </aside>
  );
};

export default StudentSidebar;
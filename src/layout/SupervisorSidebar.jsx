import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from "../assets/logo.jpg"
import { LayoutGrid, Clipboard, UsersRound, MessageCircle, Bell, Folder, Calendar, CalendarClock } from 'lucide-react';
import { fetchAnnouncements, getUnreadCount } from '../api/announcements';

const SupervisorSidebar = () => {
  const location = useLocation();
  const [unreadCount,        setUnreadCount]        = useState(0);
  const [chatUnreadCount,    setChatUnreadCount]    = useState(0);
  const [announcementUnread, setAnnouncementUnread] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/notifications", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        setUnreadCount(data.unread_count || 0);
      } catch {}
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchChatUnread = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/messages/conversations", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        const convs = data.conversations || [];
        const total = convs.reduce((sum, c) => sum + (Number(c.unread) || 0), 0);
        setChatUnreadCount(total);
      } catch {}
    };
    fetchChatUnread();
    const interval = setInterval(fetchChatUnread, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchAnnouncementUnread = async () => {
      try {
        const announcements = await fetchAnnouncements();
        setAnnouncementUnread(getUnreadCount(announcements));
      } catch {}
    };
    fetchAnnouncementUnread();
    const interval = setInterval(fetchAnnouncementUnread, 60000);
    return () => clearInterval(interval);
  }, []);

  const bellBadge = unreadCount + announcementUnread;

  const menuItems = [
    { icon: LayoutGrid,    path: '/supervisor/homepage',      label: 'Dashboard'              },
    { icon: Clipboard,     path: '/supervisor/projectsPage',  label: 'Project Portfolio'      },
    { icon: UsersRound,    path: '/supervisor/teamspage',     label: 'My Teams'               },
    { icon: MessageCircle, path: '/supervisor/chat',          label: 'Chat',          badge: chatUnreadCount },
    { icon: Bell,          path: '/supervisor/notifications', label: 'Notifications', badge: bellBadge       },
    { icon: Folder,        path: '/supervisor/documents',     label: 'Documents & Resources'  },
    { icon: CalendarClock, path: '/supervisor/deadlines',     label: 'Deadlines'              },
    { icon: Calendar,      path: '/supervisor/meetings',      label: 'Meeting Management'     },
  ];

  return (
    <aside className="w-20 flex flex-col items-center py-4 gap-6 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 z-50">
      
      {/* Logo */}
      <div className="flex items-center justify-center w-full h-12 px-1">
  <img src={logo} alt="Logo" className="object-contain w-full h-auto" />
</div>

      {/* Nav items */}
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

export default SupervisorSidebar;
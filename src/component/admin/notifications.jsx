import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../layout/Sidebar.jsx";
import ProfileDropdown from "../ProfileDropDown.jsx";
import Announcements from "./Announcements.jsx";
import {
  Bell,
  Info,
  AlertCircle,
  AlertTriangle,
  Clock,
  Check,
  MessageCircle,
  FileText,
  Trophy,
  Megaphone,
} from "lucide-react";

const Notifications = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("all");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [activeTab, setActiveTab] = useState("notifications");

  // User actuel
  const [currentUser] = useState({
    id: 1,
    firstName: "Admin",
    lastName: "Principal",
    email: "admin@esi-sba.dz",
    role: "Super Admin",
  });

  // Données mockées des notifications
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "info",
      title: "New message",
      description: "You have a new message from John willson",
      date: "Mar 24, 2026 - 10:15",
      read: false,
      icon: MessageCircle,
    },
    {
      id: 2,
      type: "urgent",
      title: "Submission Deadline",
      description: "Your preference list submission is due in 2 hours",
      date: "Mar 24, 2026 - 10:00",
      read: false,
      icon: AlertTriangle,
    },
    {
      id: 3,
      type: "alert",
      title: "Project Allocation",
      description: "Automatic allocation process has started",
      date: "Mar 23, 2026 - 16:30",
      read: true,
      icon: AlertCircle,
    },
    {
      id: 4,
      type: "info",
      title: "New Team Created",
      description: "Team Alpha has been created with 4 members",
      date: "Mar 23, 2026 - 14:20",
      read: true,
      icon: FileText,
    },
  ]);

  // Handlers
  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.clear();
    navigate("/login");
  };

  const handleChangePassword = (formData) => {
    console.log("🔐 Changement de mot de passe:", formData);
  };

  const handleMarkAllRead = () => {
    setNotifications(notifications.map((notif) => ({ ...notif, read: true })));
  };

  const handleMarkAsRead = (id) => {
    setNotifications(
      notifications.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif,
      ),
    );
  };

  const handleMarkAsUnread = (id) => {
    setNotifications(
      notifications.map((notif) =>
        notif.id === id ? { ...notif, read: false } : notif,
      ),
    );
  };

  // Filtrer les notifications
  const filteredNotifications = notifications.filter((notif) => {
    const matchesFilter = activeFilter === "all" || notif.type === activeFilter;
    const matchesUnread = !unreadOnly || !notif.read;
    return matchesFilter && matchesUnread;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Obtenir l'icône et la couleur selon le type
  const getTypeConfig = (type) => {
    const configs = {
      info: { icon: Info, color: "bg-blue-100 text-blue-600", label: "Info" },
      alert: {
        icon: AlertCircle,
        color: "bg-orange-100 text-orange-600",
        label: "Alert",
      },
      urgent: {
        icon: AlertTriangle,
        color: "bg-red-100 text-red-600",
        label: "Urgent",
      },
      reminder: {
        icon: Clock,
        color: "bg-yellow-100 text-yellow-600",
        label: "Reminder",
      },
    };
    return configs[type] || configs.info;
  };

  return (
    <div className="flex h-screen bg-[#f5f6f8]">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">
                Stay updated with your activities
              </p>
              <h1 className="text-2xl font-bold text-[#1e3a5f]">
                Notifications
              </h1>
            </div>

            {/* Profile Dropdown */}
            <div className="ml-4">
              <ProfileDropdown
                user={currentUser}
                onLogout={handleLogout}
                onChangePassword={handleChangePassword}
              />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-auto">
          <div className="max-w-5xl mx-auto">
            {/* Tabs */}
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => setActiveTab("notifications")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === "notifications"
                    ? "bg-[#1e3a5f] text-white shadow-sm"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                <Bell size={18} />
                Notifications
              </button>

              {/* ✅ Bouton Announcements avec navigation vers une route dédiée */}
              <button
                onClick={() => navigate("/announcements")} // 🔁 Redirection vers la route
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === "announcements"
                    ? "bg-purple-600 text-white shadow-sm"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                <Megaphone size={18} />
                Announcements
              </button>
            </div>

            {/* Notifications Container */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Bell size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-[#1e3a5f]">
                      Notifications
                    </h2>
                    <p className="text-sm text-gray-500">
                      {unreadCount} unread notifications
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-2 px-4 py-2 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#152a4d] transition-colors text-sm font-medium"
                >
                  <Check size={16} />
                  Mark all read
                </button>
              </div>

              {/* Filters */}
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {["all", "info", "alert", "urgent", "reminder"].map(
                    (filter) => (
                      <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          activeFilter === filter
                            ? "bg-[#1e3a5f] text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {filter.charAt(0).toUpperCase() + filter.slice(1)}
                      </button>
                    ),
                  )}
                </div>
                <button
                  onClick={() => setUnreadOnly(!unreadOnly)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    unreadOnly
                      ? "bg-[#1e3a5f] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Unread only
                </button>
              </div>

              {/* Notifications List */}
              <div className="divide-y divide-gray-100">
                {filteredNotifications.length === 0 ? (
                  <div className="px-6 py-12 text-center text-gray-500">
                    <Bell size={48} className="mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">No notifications</p>
                    <p className="text-sm mt-2">
                      {unreadOnly
                        ? "All notifications have been read"
                        : "No notifications match your filters"}
                    </p>
                  </div>
                ) : (
                  filteredNotifications.map((notification) => {
                    const IconComponent = notification.icon;
                    const typeConfig = getTypeConfig(notification.type);

                    return (
                      <div
                        key={notification.id}
                        className={`px-6 py-4 hover:bg-gray-50 transition-colors ${
                          !notification.read ? "bg-blue-50/30" : ""
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          {/* Icon */}
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${typeConfig.color}`}
                          >
                            <IconComponent size={20} />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <h3
                                  className={`font-semibold ${
                                    !notification.read
                                      ? "text-[#1e3a5f]"
                                      : "text-gray-800"
                                  }`}
                                >
                                  {notification.title}
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">
                                  {notification.description}
                                </p>
                                <p className="text-xs text-gray-400 mt-2">
                                  {notification.date}
                                </p>
                              </div>

                              {/* Unread indicator */}
                              {!notification.read && (
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                  <button
                                    onClick={() =>
                                      handleMarkAsRead(notification.id)
                                    }
                                    className="text-sm text-[#1e3a5f] hover:text-[#152a4d] font-medium"
                                  >
                                    Mark as read
                                  </button>
                                </div>
                              )}

                              {notification.read && (
                                <button
                                  onClick={() =>
                                    handleMarkAsUnread(notification.id)
                                  }
                                  className="text-sm text-gray-400 hover:text-gray-600"
                                >
                                  Mark as unread
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Notifications;

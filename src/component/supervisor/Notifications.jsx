import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import SupervisorSidebar from "../../layout/SupervisorSidebar";
import { ProfileDropdown } from "../supervisor/HomePage";
import useCurrentUser from "../../hooks/useCurrentUser";
import {
  Bell, Info, AlertCircle, Clock, Megaphone, Facebook, Linkedin,
} from "lucide-react";
import NotificationsPanel from "../../layout/NotificationsPanel";
import AnnouncementsPanel from "../../layout/AnnouncementsPanel";
import AnnouncementDetailModal from "../../layout/AnnouncementDetailModal";

const BASE      = "http://localhost:3000";
const getToken  = () => localStorage.getItem("token");
const authHead  = () => ({ Authorization: `Bearer ${getToken()}` });

const Notifications = () => {
  const navigate = useNavigate();
  const { currentUser } = useCurrentUser();

  const [activeTab,           setActiveTab]           = useState("notifications");
  const [activeFilter,        setActiveFilter]        = useState("all");
  const [unreadOnly,          setUnreadOnly]          = useState(false);
  const [announcementFilter,  setAnnouncementFilter]  = useState("all");
  const [selectedAnnouncement,setSelectedAnnouncement]= useState(null);
  const [showDetailModal,     setShowDetailModal]     = useState(false);

  const [notifications,  setNotifications]  = useState([]);
  const [announcements,  setAnnouncements]  = useState([]);

  // ── Fetch on mount ──────────────────────────────────────────────────────
  useEffect(() => {
    const headers = authHead();
    Promise.all([
      fetch(`${BASE}/api/notifications`, { headers }).then(r => r.json()),
      fetch(`${BASE}/api/announcements`, { headers }).then(r => r.json()),
    ])
      .then(([notifData, announceData]) => {
        setNotifications(notifData.notifications   || []);
        setAnnouncements(announceData.announcements || []);
      })
      .catch(() => toast.error("Failed to load notifications"));
  }, []);

  // ── Handlers ────────────────────────────────────────────────────────────
  const handleMarkAsRead = async (id) => {
    await fetch(`${BASE}/api/notifications/${id}/read`, {
      method: "PATCH", headers: authHead(),
    });
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, is_read: true } : n)
    );
  };

  const handleMarkAsUnread = async (id) => {
    await fetch(`${BASE}/api/notifications/${id}/unread`, {
      method: "PATCH", headers: authHead(),
    });
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, is_read: false } : n)
    );
  };

  const handleMarkAllRead = async () => {
    await fetch(`${BASE}/api/notifications/read-all`, {
      method: "PATCH", headers: authHead(),
    });
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const handleAnnouncementClick = (a) => {
    setSelectedAnnouncement(a);
    setShowDetailModal(true);
  };

  const closeModal = () => {
    setShowDetailModal(false);
    setSelectedAnnouncement(null);
  };

  // ── Type config — normalize to lowercase so "info"/"defense" both map ──
  const getTypeConfig = (type) => {
    const key = (type || "").toLowerCase();
    const configs = {
      info:     { icon: Info,        color: { bg: "#DBEAFE", text: "#2563EB" }, label: "Info" },
      defense:  { icon: Info,        color: { bg: "#DBEAFE", text: "#2563EB" }, label: "Info" },
      alert:    { icon: AlertCircle, color: { bg: "#FEE2E2", text: "#DC2626" }, label: "Alert" },
      reminder: { icon: Clock,       color: { bg: "#F3E8FF", text: "#9333EA" }, label: "Reminder" },
    };
    return configs[key] || configs.info;
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.clear();
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-[#f5f6f8]">
      <Toaster position="top-center" />
      <SupervisorSidebar />

      <div className="flex-1 flex flex-col ml-16 overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-2 sm:py-3 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs sm:text-sm mb-0">Stay updated with your activities</p>
              <h1 className="text-xl sm:text-2xl font-bold text-[#1e3a5f]">Notifications</h1>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <a href="https://www.facebook.com/esisba.edu" target="_blank" rel="noopener noreferrer"
                className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center bg-gradient-to-r from-[#18335E] to-[#2D8FBF] text-white rounded-lg transition-all duration-300 shadow-sm">
                <Facebook size={14} />
              </a>
              <a href="https://www.linkedin.com/school/esisba" target="_blank" rel="noopener noreferrer"
                className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center bg-gradient-to-r from-[#18335E] to-[#2D8FBF] text-white rounded-lg transition-all duration-300 shadow-sm">
                <Linkedin size={14} />
              </a>
              <ProfileDropdown
                user={currentUser}
                onLogout={handleLogout}
                onChangePassword={() => {}}
              />
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          <div className="max-w-5xl mx-auto">

            {/* Tabs */}
            <div className="flex items-center gap-4 mb-6">
              <button onClick={() => setActiveTab("notifications")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === "notifications"
                    ? "bg-[#1e3a5f] text-white shadow-sm"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}>
                <Bell size={18} /> Notifications
                {unreadCount > 0 && (
                  <span className="ml-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
              <button onClick={() => setActiveTab("announcements")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === "announcements"
                    ? "bg-[#1e3a5f] text-white shadow-sm"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}>
                <Megaphone size={18} /> Announcements
              </button>
            </div>

            {/* Panels */}
            {activeTab === "notifications" && (
              <NotificationsPanel
                notifications={notifications}
                unreadCount={unreadCount}
                activeFilter={activeFilter}
                setActiveFilter={setActiveFilter}
                unreadOnly={unreadOnly}
                setUnreadOnly={setUnreadOnly}
                onMarkAllRead={handleMarkAllRead}
                onMarkAsRead={handleMarkAsRead}
                onMarkAsUnread={handleMarkAsUnread}
                getTypeConfig={getTypeConfig}
              />
            )}
            {activeTab === "announcements" && (
              <AnnouncementsPanel
                announcements={announcements}
                announcementFilter={announcementFilter}
                setAnnouncementFilter={setAnnouncementFilter}
                onAnnouncementClick={handleAnnouncementClick}
              />
            )}

          </div>
        </main>
      </div>

      <AnnouncementDetailModal
        isOpen={showDetailModal}
        notification={selectedAnnouncement}
        onClose={closeModal}
      />
    </div>
  );
};

export default Notifications;